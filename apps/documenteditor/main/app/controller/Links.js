/*
 * (c) Copyright Ascensio System SIA 2010-2024
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-6 Ernesta Birznieka-Upish
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */

/**
 *  Links.js
 *
 *  Created on 22.12.2017
 *
 */

define([
    'core',
    'documenteditor/main/app/view/Links'
], function () {
    'use strict';

    DE.Controllers.Links = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
        ],
        views : [
            'Links'
        ],
        sdkViewName : '#id_main',

        initialize: function () {

            this.addListeners({
                'Links': {
                    'links:contents': this.onTableContents,
                    'links:contents-open': this.onTableContentsOpen,
                    'links:update': this.onTableContentsUpdate,
                    'links:notes': this.onNotesClick,
                    'links:hyperlink': this.onHyperlinkClick,
                    'links:bookmarks': this.onBookmarksClick,
                    'links:caption': this.onCaptionClick,
                    'links:crossref': this.onCrossRefClick,
                    'links:tof': this.onTableFigures,
                    'links:tof-update': this.onTableFiguresUpdate,
                    'links:addtext': this.onAddText,
                    'links:addtext-open': this.onAddTextOpen
                },
                'DocumentHolder': {
                    'links:contents': this.onTableContents,
                    'links:update': this.onTableContentsUpdate,
                    'links:contents-open': this.onTableContentsOpen,
                    'links:caption': this.onCaptionClick
                }
            });
        },
        onLaunch: function () {
            this._state = {
                in_object: undefined
            };
            Common.Gateway.on('setactionlink', function (url) {
                console.log('url with actions: ' + url);
            }.bind(this));
            Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
        },

        setApi: function (api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onFocusObject', this.onApiFocusObject.bind(this));
                this.api.asc_registerCallback('asc_onCanAddHyperlink',      _.bind(this.onApiCanAddHyperlink, this));
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('api:disconnect', _.bind(this.onCoAuthoringDisconnect, this));
                this.api.asc_registerCallback('asc_onShowContentControlsActions',_.bind(this.onShowContentControlsActions, this));
                this.api.asc_registerCallback('asc_onHideContentControlsActions',_.bind(this.onHideContentControlsActions, this));
                this.api.asc_registerCallback('asc_onAscReplaceCurrentTOF',_.bind(this.onAscReplaceCurrentTOF, this));
                this.api.asc_registerCallback('asc_onAscTOFUpdate',_.bind(this.onAscTOFUpdate, this));
            }
            Common.NotificationCenter.on('protect:doclock', _.bind(this.onChangeProtectDocument, this));
            return this;
        },

        setConfig: function(config) {
            this.toolbar = config.toolbar;
            this.view = this.createView('Links', {
                toolbar: this.toolbar.toolbar
            });
        },

        SetDisabled: function(state) {
            this.view && this.view.SetDisabled(state);
        },

        getView: function(name) {
            return !name && this.view ?
                this.view : Backbone.Controller.prototype.getView.call(this, name);
        },

        onCoAuthoringDisconnect: function() {
            this.SetDisabled(true);
        },

        onApiFocusObject: function(selectedObjects) {
            if (!this.toolbar.editMode) return;

            var pr, i = -1, type,
                paragraph_locked = false,
                header_locked = false,
                in_header = false,
                in_equation = false,
                in_image = false,
                in_image_inline = false,
                in_table = false,
                in_para = false,
                frame_pr = null,
                object_type;

            while (++i < selectedObjects.length) {
                type = selectedObjects[i].get_ObjectType();
                pr   = selectedObjects[i].get_ObjectValue();

                if (type === Asc.c_oAscTypeSelectElement.Paragraph) {
                    paragraph_locked = pr.get_Locked();
                    frame_pr = pr;
                    in_para = true;
                } else if (type === Asc.c_oAscTypeSelectElement.Header) {
                    header_locked = pr.get_Locked();
                    in_header = true;
                } else if (type === Asc.c_oAscTypeSelectElement.Image) {
                    in_image = true;
                    in_image_inline = (pr.get_WrappingStyle() === Asc.c_oAscWrapStyle2.Inline);
                    object_type = type;
                } else if (type === Asc.c_oAscTypeSelectElement.Math) {
                    in_equation = true;
                    object_type = type;
                } else if (type === Asc.c_oAscTypeSelectElement.Table) {
                    in_table = true;
                    object_type = type;
                }
            }
            this._state.in_object = object_type;

            var control_props = this.api.asc_IsContentControl() ? this.api.asc_GetContentControlProperties() : null,
                control_plain = (control_props) ? (control_props.get_ContentControlType()==Asc.c_oAscSdtLevelType.Inline) : false,
                lock_type = control_props ? control_props.get_Lock() : Asc.c_oAscSdtLockType.Unlocked,
                content_locked = lock_type==Asc.c_oAscSdtLockType.SdtContentLocked || lock_type==Asc.c_oAscSdtLockType.ContentLocked;
            var rich_del_lock = (frame_pr) ? !frame_pr.can_DeleteBlockContentControl() : false,
                rich_edit_lock = (frame_pr) ? !frame_pr.can_EditBlockContentControl() : false,
                plain_del_lock = (frame_pr) ? !frame_pr.can_DeleteInlineContentControl() : false,
                plain_edit_lock = (frame_pr) ? !frame_pr.can_EditInlineContentControl() : false;

            this.lockToolbar(Common.enumLock.paragraphLock, paragraph_locked,   {array: this.view.btnsNotes.concat(this.view.btnsHyperlink).concat([this.view.btnBookmarks, this.view.btnTableFiguresUpdate, this.view.btnCrossRef])});
            this.lockToolbar(Common.enumLock.inHeader,      in_header,          {array: this.view.btnsNotes.concat(this.view.btnsContents).concat([this.view.btnBookmarks, this.view.btnTableFigures,
                                                                                            this.view.btnTableFiguresUpdate, this.view.btnCaption])});
            this.lockToolbar(Common.enumLock.controlPlain,  control_plain,      {array: this.view.btnsNotes.concat([this.view.btnBookmarks, this.view.btnCrossRef])});
            this.lockToolbar(Common.enumLock.richEditLock,  rich_edit_lock,     {array: this.view.btnsNotes.concat(this.view.btnsContents).concat([this.view.btnTableFigures, this.view.btnTableFiguresUpdate,
                                                                                            this.view.btnCrossRef])});
            this.lockToolbar(Common.enumLock.plainEditLock, plain_edit_lock,    {array: this.view.btnsNotes.concat(this.view.btnsContents).concat([this.view.btnTableFigures, this.view.btnTableFiguresUpdate,
                                                                                            this.view.btnCrossRef])});
            this.lockToolbar(Common.enumLock.headerLock,    header_locked,      {array: this.view.btnsHyperlink.concat([this.view.btnBookmarks, this.view.btnCrossRef])});
            this.lockToolbar(Common.enumLock.inEquation,    in_equation,        {array: this.view.btnsNotes});
            this.lockToolbar(Common.enumLock.inImage,       in_image,           {array: this.view.btnsNotes});
            this.lockToolbar(Common.enumLock.richDelLock,   rich_del_lock,      {array: this.view.btnsContents.concat([this.view.btnTableFigures, this.view.btnTableFiguresUpdate])});
            this.lockToolbar(Common.enumLock.plainDelLock,  plain_del_lock,     {array: this.view.btnsContents.concat([this.view.btnTableFigures, this.view.btnTableFiguresUpdate])});
            this.lockToolbar(Common.enumLock.contentLock,   content_locked,     {array: [this.view.btnCrossRef]});
            this.lockToolbar(Common.enumLock.cantUpdateTOF, !this.api.asc_CanUpdateTablesOfFigures(),   {array: [this.view.btnTableFiguresUpdate]});
            this.lockToolbar(Common.enumLock.inFootnote, this.api.asc_IsCursorInFootnote() || this.api.asc_IsCursorInEndnote(),   {array: [this.view.btnAddText]});
            this.lockToolbar(Common.enumLock.inHeader, in_header,   {array: [this.view.btnAddText]});
            this.lockToolbar(Common.enumLock.cantAddTextTOF, in_image && !in_image_inline && !in_para,   {array: [this.view.btnAddText]});

            this.dlgCrossRefDialog && this.dlgCrossRefDialog.isVisible() && this.dlgCrossRefDialog.setLocked(this.view.btnCrossRef.isDisabled());
        },

        lockToolbar: function (causes, lock, opts) {
            this.view && Common.Utils.lockControls(causes, lock, opts, this.view.getButtons());
        },

        onApiCanAddHyperlink: function(value) {
            this.toolbar.editMode && this.lockToolbar(Common.enumLock.hyperlinkLock, !value, {array: this.view.btnsHyperlink});
        },

        onHyperlinkClick: function(btn) {
            var me = this,
                win, props, text;

            if (me.api){

                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        props = dlg.getSettings();
                        (text!==false)
                            ? me.api.add_Hyperlink(props)
                            : me.api.change_Hyperlink(props);
                    }

                    Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                };

                text = me.api.can_AddHyperlink();

                if (text !== false) {
                    win = new DE.Views.HyperlinkSettingsDialog({
                        api: me.api,
                        appOptions: me.toolbar.appOptions,
                        handler: handlerDlg
                    });

                    props = new Asc.CHyperlinkProperty();
                    props.put_Text(text);

                    win.show();
                    win.setSettings(props);
                } else {
                    var selectedElements = me.api.getSelectedElements();
                    if (selectedElements && _.isArray(selectedElements)){
                        _.each(selectedElements, function(el, i) {
                            if (selectedElements[i].get_ObjectType() == Asc.c_oAscTypeSelectElement.Hyperlink)
                                props = selectedElements[i].get_ObjectValue();
                        });
                    }
                    if (props) {
                        win = new DE.Views.HyperlinkSettingsDialog({
                            api: me.api,
                            appOptions: me.toolbar.appOptions,
                            handler: handlerDlg
                        });
                        win.show();
                        win.setSettings(props);
                    }
                }
            }

            Common.component.Analytics.trackEvent('ToolBar', 'Add Hyperlink');
        },

        onTableContents: function(type, currentTOC){
            currentTOC = !!currentTOC;
            var props = this.api.asc_GetTableOfContentsPr(currentTOC);
            switch (type) {
                case 0:
                    if (!props) {
                        props = new Asc.CTableOfContentsPr();
                        props.put_OutlineRange(1, 9);
                    }
                    props.put_Hyperlink(true);
                    props.put_ShowPageNumbers(true);
                    props.put_RightAlignTab(true);
                    props.put_TabLeader( Asc.c_oAscTabLeader.Dot);
                    (currentTOC) ? this.api.asc_SetTableOfContentsPr(props) : this.api.asc_AddTableOfContents(null, props);
                    break;
                case 1:
                    if (!props) {
                        props = new Asc.CTableOfContentsPr();
                        props.put_OutlineRange(1, 9);
                    }
                    props.put_Hyperlink(true);
                    props.put_ShowPageNumbers(false);
                    props.put_TabLeader( Asc.c_oAscTabLeader.None);
                    props.put_StylesType(Asc.c_oAscTOCStylesType.Web);
                    (currentTOC) ? this.api.asc_SetTableOfContentsPr(props) : this.api.asc_AddTableOfContents(null, props);
                    break;
                case 'settings':
                    var me = this,
                        win = new DE.Views.TableOfContentsSettings({
                        api: this.api,
                        props: props,
                        type: 0,
                        handler: function(result, value) {
                            if (result == 'ok') {
                                (props) ? me.api.asc_SetTableOfContentsPr(value) : me.api.asc_AddTableOfContents(null, value);
                            }
                            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                        }
                    });
                    win.show();
                    break;
                case 'remove':
                    currentTOC = (currentTOC && props) ? props.get_InternalClass() : undefined;
                    this.api.asc_RemoveTableOfContents(currentTOC);
                    break;
            }
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onTableContentsUpdate: function(type, currentTOC){
            var props = this.api.asc_GetTableOfContentsPr(currentTOC);
            if (currentTOC && props)
                currentTOC = props.get_InternalClass();
            this.api.asc_UpdateTableOfContents(type == 'pages', currentTOC);
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onTableContentsOpen: function(menu) {
            this.api.asc_getButtonsTOC(menu.items[0].options.previewId, menu.items[1].options.previewId);
        },

        onAddTextOpen: function(menu) {
            var props = this.api.asc_GetTableOfContentsPr(),
                end = props ? props.get_OutlineEnd() : 3;
            (end<0) && (end = 9);
            this.view.fillAddTextMenu(menu, end, this.api.asc_GetCurrentLevelTOC());
        },

        onAddText: function(value) {
            this.api.asc_AddParagraphToTOC(value);
        },

        onNotesClick: function(type) {
            var me = this;
            switch (type) {
                case 'ins_footnote':
                    this.api.asc_AddFootnote();
                    break;
                case 'ins_endnote':
                    this.api.asc_AddEndnote();
                    break;
                case 'delele':
                    (new DE.Views.NotesRemoveDialog({
                        handler: function (dlg, result) {
                            if (result=='ok') {
                                var settings = dlg.getSettings();
                                (settings.footnote || settings.endnote) && me.api.asc_RemoveAllFootnotes(settings.footnote, settings.endnote);
                            }
                            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                        }
                    })).show();
                    break;
                case 'settings':
                    var isEndNote = me.api.asc_IsCursorInEndnote(),
                        isFootNote = me.api.asc_IsCursorInFootnote();
                    isEndNote = (isEndNote || isFootNote) ? isEndNote : Common.Utils.InternalSettings.get("de-settings-note-last") || false;
                    (new DE.Views.NoteSettingsDialog({
                        api: me.api,
                        handler: function (result, settings) {
                            if (settings) {
                                settings.isEndNote ? me.api.asc_SetEndnoteProps(settings.props, settings.applyToAll) :
                                                     me.api.asc_SetFootnoteProps(settings.props, settings.applyToAll);
                                if (result == 'insert')
                                    setTimeout(function() {
                                        settings.isEndNote ? me.api.asc_AddEndnote(settings.custom) : me.api.asc_AddFootnote(settings.custom);
                                    }, 1);
                                if (result == 'insert' || result == 'apply') {
                                    Common.Utils.InternalSettings.set("de-settings-note-last", settings.isEndNote);
                                }
                            }
                            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                        },
                        isEndNote: isEndNote,
                        hasSections: me.api.asc_GetSectionsCount()>1,
                        props: isEndNote ? me.api.asc_GetEndnoteProps() : me.api.asc_GetFootnoteProps()
                    })).show();
                    break;
                case 'prev':
                    this.api.asc_GotoFootnote(false);
                    setTimeout(function() {
                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                    }, 50);
                    break;
                case 'next':
                    this.api.asc_GotoFootnote(true);
                    setTimeout(function() {
                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                    }, 50);
                    break;
                case 'prev-end':
                    this.api.asc_GotoEndnote(false);
                    setTimeout(function() {
                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                    }, 50);
                    break;
                case 'next-end':
                    this.api.asc_GotoEndnote(true);
                    setTimeout(function() {
                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                    }, 50);
                    break;
                case 'to-endnotes':
                    this.api.asc_ConvertFootnoteType(false, true, false);
                    setTimeout(function() {
                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                    }, 50);
                    break;
                case 'to-footnotes':
                    this.api.asc_ConvertFootnoteType(false, false, true);
                    setTimeout(function() {
                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                    }, 50);
                    break;
                case 'swap':
                    this.api.asc_ConvertFootnoteType(false, true, true);
                    setTimeout(function() {
                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                    }, 50);
                    break;
            }
        },

        onBookmarksClick: function(btn) {
            var me = this;
            (new DE.Views.BookmarksDialog({
                api: me.api,
                appOptions: me.toolbar.appOptions,
                props: me.api.asc_GetBookmarksManager(),
                handler: function (result, settings) {
                    if (settings) {
                    }
                    Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                }
            })).show();
        },

        onCaptionClick: function(btn) {
            var me = this;
            (new DE.Views.CaptionDialog({
                objectType: this._state.in_object,
                handler: function (result, settings) {
                    if (result == 'ok') {
                        me.api.asc_AddObjectCaption(settings);
                    }
                    Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                }
            })).show();
        },

        onShowTOCActions: function(obj, x, y) {
            var action = obj.button,
                menu = (action==AscCommon.CCButtonType.Toc) ? this.view.contentsUpdateMenu : this.view.contentsMenu,
                documentHolder  = this.getApplication().getController('DocumentHolder'),
                documentHolderView  = documentHolder.getView(),
                menuContainer = documentHolderView.cmpEl.find(Common.Utils.String.format('#menu-container-{0}', menu.id)),
                me = this;

            if (!menu) return;
            this._fromShowContentControls = true;
            Common.UI.Menu.Manager.hideAll();

            if (!menu.rendered) {
                // Prepare menu container
                if (menuContainer.length < 1) {
                    menuContainer = $(Common.Utils.String.format('<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', menu.id));
                    documentHolderView.cmpEl.append(menuContainer);
                }

                menu.render(menuContainer);
                menu.cmpEl.attr({tabindex: "-1"});
                menu.on('hide:after', function(){
                    if (!me._fromShowContentControls)
                        me.api.asc_UncheckContentControlButtons();
                });
            }

            menuContainer.css({left: x, top : y});
            menuContainer.attr('data-value', 'prevent-canvas-click');
            documentHolder._preventClick = true;
            menu.show();

            menu.alignPosition();
            _.delay(function() {
                menu.cmpEl.focus();
            }, 10);
            this._fromShowContentControls = false;
        },

        onHideContentControlsActions: function() {
            this.view.contentsMenu && this.view.contentsMenu.hide();
            this.view.contentsUpdateMenu && this.view.contentsUpdateMenu.hide();
        },

        onShowContentControlsActions: function(obj, x, y) {
            (obj.type == Asc.c_oAscContentControlSpecificType.TOC) && this.onShowTOCActions(obj, x, y);
        },

        onCrossRefClick: function(btn) {
            if (this.dlgCrossRefDialog && this.dlgCrossRefDialog.isVisible()) return;

            var me = this;
            me.dlgCrossRefDialog = new DE.Views.CrossReferenceDialog({
                api: me.api,
                crossRefProps: me.crossRefProps,
                handler: function (result, settings) {
                    if (result != 'ok')
                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                }
            });
            me.dlgCrossRefDialog.on('close', function(obj){
                me.crossRefProps = me.dlgCrossRefDialog.getSettings();
                Common.NotificationCenter.trigger('edit:complete', me.toolbar);
            });
            me.dlgCrossRefDialog.show();
        },

        onTableFigures: function(){
            var props = this.api.asc_GetTableOfFiguresPr();
            var me = this,
                win = new DE.Views.TableOfContentsSettings({
                    api: this.api,
                    props: props,
                    type: 1,
                    handler: function(result, value) {
                        if (result == 'ok') {
                            me.api.asc_AddTableOfFigures(value);
                        }
                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                    }
                });
            win.show();
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onTableFiguresUpdate: function(){
            this.api.asc_UpdateTablesOfFigures();
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onAscReplaceCurrentTOF: function(apiCallback) {
            Common.UI.warning({
                msg: this.view.confirmReplaceTOF,
                buttons: ['yes', 'no', 'cancel'],
                primary: 'yes',
                callback: _.bind(function(btn) {
                    if (btn=='yes' || btn=='no') {
                        apiCallback && apiCallback(btn === 'yes');
                    }
                    Common.NotificationCenter.trigger('edit:complete', this.toolbar);
                }, this)
            });
        },

        onAscTOFUpdate: function(apiCallback) {
            var me = this;
            (new Common.Views.OptionsDialog({
                width: 300,
                title: this.view.titleUpdateTOF,
                items: [
                    {caption: this.view.textUpdatePages, value: true, checked: true},
                    {caption: this.view.textUpdateAll, value: false, checked: false}
                ],
                handler: function (dlg, result) {
                    if (result=='ok') {
                        apiCallback && apiCallback(dlg.getSettings());
                    }
                    Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                }
            })).show();
        },

        onChangeProtectDocument: function(props) {
            if (!props) {
                var docprotect = this.getApplication().getController('DocProtection');
                props = docprotect ? docprotect.getDocProps() : null;
            }
            if (props) {
                this._state.docProtection = props;
                this.lockToolbar(Common.enumLock.docLockView, props.isReadOnly);
                this.lockToolbar(Common.enumLock.docLockForms, props.isFormsOnly);
                this.lockToolbar(Common.enumLock.docLockReview, props.isReviewOnly);
                this.lockToolbar(Common.enumLock.docLockComments, props.isCommentsOnly);
            }
        },

        onAppReady: function (config) {
            var me = this;
            (new Promise(function (accept, reject) {
                accept();
            })).then(function(){
                if (me.view) {
                    me.view.onAppReady(config);
                    me.onChangeProtectDocument();
                }
            });
        }

    }, DE.Controllers.Links || {}));
});