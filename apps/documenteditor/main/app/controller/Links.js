/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
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
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
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
 *  Created by Julia Radzhabova on 22.12.2017
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'common/main/lib/component/Calendar',
    'documenteditor/main/app/view/Links',
    'documenteditor/main/app/view/NoteSettingsDialog',
    'documenteditor/main/app/view/HyperlinkSettingsDialog',
    'documenteditor/main/app/view/TableOfContentsSettings',
    'documenteditor/main/app/view/BookmarksDialog',
    'documenteditor/main/app/view/CaptionDialog'
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
                    'links:update': this.onTableContentsUpdate,
                    'links:notes': this.onNotesClick,
                    'links:hyperlink': this.onHyperlinkClick,
                    'links:bookmarks': this.onBookmarksClick,
                    'links:caption': this.onCaptionClick
                },
                'DocumentHolder': {
                    'links:contents': this.onTableContents,
                    'links:update': this.onTableContentsUpdate
                }
            });
        },
        onLaunch: function () {
            this._state = {
                prcontrolsdisable:undefined,
                in_object: false
            };
            Common.Gateway.on('setactionlink', function (url) {
                console.log('url with actions: ' + url);
            }.bind(this));
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

            }
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
                in_table = false,
                frame_pr = null;

            while (++i < selectedObjects.length) {
                type = selectedObjects[i].get_ObjectType();
                pr   = selectedObjects[i].get_ObjectValue();

                if (type === Asc.c_oAscTypeSelectElement.Paragraph) {
                    paragraph_locked = pr.get_Locked();
                    frame_pr = pr;
                } else if (type === Asc.c_oAscTypeSelectElement.Header) {
                    header_locked = pr.get_Locked();
                    in_header = true;
                } else if (type === Asc.c_oAscTypeSelectElement.Image) {
                    in_image = true;
                } else if (type === Asc.c_oAscTypeSelectElement.Math) {
                    in_equation = true;
                } else if (type === Asc.c_oAscTypeSelectElement.Table) {
                    in_table = true;
                }
            }
            this._state.prcontrolsdisable = paragraph_locked || header_locked;
            this._state.in_object = in_image || in_table || in_equation;

            var control_props = this.api.asc_IsContentControl() ? this.api.asc_GetContentControlProperties() : null,
                control_plain = (control_props) ? (control_props.get_ContentControlType()==Asc.c_oAscSdtLevelType.Inline) : false;
            var rich_del_lock = (frame_pr) ? !frame_pr.can_DeleteBlockContentControl() : true,
                rich_edit_lock = (frame_pr) ? !frame_pr.can_EditBlockContentControl() : true,
                plain_del_lock = (frame_pr) ? !frame_pr.can_DeleteInlineContentControl() : true,
                plain_edit_lock = (frame_pr) ? !frame_pr.can_EditInlineContentControl() : true;

            var need_disable = paragraph_locked || in_equation || in_image || in_header || control_plain || rich_edit_lock || plain_edit_lock;
            this.view.btnsNotes.setDisabled(need_disable);

            need_disable = paragraph_locked || header_locked || in_header || control_plain;
            this.view.btnBookmarks.setDisabled(need_disable);

            need_disable = in_header || rich_edit_lock || plain_edit_lock || rich_del_lock || plain_del_lock;
            this.view.btnsContents.setDisabled(need_disable);
        },

        onApiCanAddHyperlink: function(value) {
            this.toolbar.editMode && this.view.btnsHyperlink.setDisabled(!value || this._state.prcontrolsdisable);
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
                    (currentTOC) ? this.api.asc_SetTableOfContentsPr(props) : this.api.asc_AddTableOfContents(null, props);
                    break;
                case 'settings':
                    var me = this,
                        win = new DE.Views.TableOfContentsSettings({
                        api: this.api,
                        props: props,
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
            if (props) {
                if (currentTOC && props)
                    currentTOC = props.get_InternalClass();
                this.api.asc_UpdateTableOfContents(type == 'pages', currentTOC);
            }
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onNotesClick: function(type) {
            var me = this;
            switch (type) {
                case 'ins_footnote':
                    this.api.asc_AddFootnote();
                    break;
                case 'delele':
                    Common.UI.warning({
                        msg: this.view.confirmDeleteFootnotes,
                        buttons: ['yes', 'no'],
                        primary: 'yes',
                        callback: _.bind(function (btn) {
                            if (btn == 'yes') {
                                this.api.asc_RemoveAllFootnotes();
                            }
                            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
                        }, this)
                    });
                    break;
                case 'settings':
                    (new DE.Views.NoteSettingsDialog({
                        api: me.api,
                        handler: function (result, settings) {
                            if (settings) {
                                me.api.asc_SetFootnoteProps(settings.props, settings.applyToAll);
                                if (result == 'insert')
                                    setTimeout(function() {
                                        me.api.asc_AddFootnote(settings.custom);
                                    }, 1);
                            }
                            Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                        },
                        props: me.api.asc_GetFootnoteProps()
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
                isObject: this._state.in_object,
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
                documentHolderView  = this.getApplication().getController('DocumentHolder').documentHolder,
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
            documentHolderView._preventClick = true;
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
            this.view.listControlMenu && this.view.listControlMenu.isVisible() && this.view.listControlMenu.hide();
            var controlsContainer = this.getApplication().getController('DocumentHolder').documentHolder.cmpEl.find('#calendar-control-container');
            if (controlsContainer.is(':visible'))
                controlsContainer.hide();
        },

        onShowDateActions: function(obj, x, y) {
            var props = obj.pr,
                specProps = props.get_DateTimePr(),
                documentHolderView  = this.getApplication().getController('DocumentHolder').documentHolder,
                controlsContainer = documentHolderView.cmpEl.find('#calendar-control-container'),
                me = this;

            this._state.dateObj = props;

            if (controlsContainer.length < 1) {
                controlsContainer = $('<div id="calendar-control-container" style="position: absolute;z-index: 1000;"><div id="id-document-calendar-control" style="position: fixed; left: -1000px; top: -1000px;"></div></div>');
                documentHolderView.cmpEl.append(controlsContainer);
            }

            Common.UI.Menu.Manager.hideAll();

            controlsContainer.css({left: x, top : y});
            controlsContainer.show();

            if (!this.cmpCalendar) {
                this.cmpCalendar = new Common.UI.Calendar({
                    el: documentHolderView.cmpEl.find('#id-document-calendar-control'),
                    enableKeyEvents: true,
                    firstday: 1
                });
                this.cmpCalendar.on('date:click', function (cmp, date) {
                    var props = me._state.dateObj,
                        specProps = props.get_DateTimePr(),
                        id = props.get_InternalId();
                    specProps.put_FullDate(new  Date(date));
                    me.api.asc_SetContentControlProperties(props, id);
                    controlsContainer.hide();
                    me.api.asc_UncheckContentControlButtons();
                });
                this.cmpCalendar.on('calendar:keydown', function (cmp, e) {
                    if (e.keyCode==Common.UI.Keys.ESC) {
                        controlsContainer.hide();
                        me.api.asc_UncheckContentControlButtons();
                    }
                });
            }
            this.cmpCalendar.setDate(new Date(specProps ? specProps.get_FullDate() : undefined));

            // align
            var offset  = controlsContainer.offset(),
                docW    = Common.Utils.innerWidth(),
                docH    = Common.Utils.innerHeight() - 10, // Yep, it's magic number
                menuW   = this.cmpCalendar.cmpEl.outerWidth(),
                menuH   = this.cmpCalendar.cmpEl.outerHeight(),
                buttonOffset = 22,
                left = offset.left - menuW,
                top  = offset.top;
            if (top + menuH > docH) {
                top = docH - menuH;
                left -= buttonOffset;
            }
            if (top < 0)
                top = 0;
            if (left + menuW > docW)
                left = docW - menuW;
            this.cmpCalendar.cmpEl.css({left: left, top : top});

            documentHolderView._preventClick = true;
        },

        onShowListActions: function(obj, x, y) {
            var type = obj.type,
                props = obj.pr,
                specProps = (type == Asc.c_oAscContentControlSpecificType.ComboBox) ? props.get_ComboBoxPr() : props.get_DropDownListPr(),
                menu = this.view.listControlMenu,
                documentHolderView  = this.getApplication().getController('DocumentHolder').documentHolder,
                menuContainer = menu ? documentHolderView.cmpEl.find(Common.Utils.String.format('#menu-container-{0}', menu.id)) : null,
                me = this;

            this._state.listObj = props;

            this._fromShowContentControls = true;
            Common.UI.Menu.Manager.hideAll();

            if (!menu) {
                this.view.listControlMenu = menu = new Common.UI.Menu({
                    menuAlign: 'tr-bl',
                    items: []
                });
                menu.on('item:click', function(menu, item) {
                    setTimeout(function(){
                        me.api.asc_SelectContentControlListItem(item.value, me._state.listObj.get_InternalId());
                    }, 1);
                });

                // Prepare menu container
                if (!menuContainer || menuContainer.length < 1) {
                    menuContainer = $(Common.Utils.String.format('<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', menu.id));
                    documentHolderView.cmpEl.append(menuContainer);
                }

                menu.render(menuContainer);
                menu.cmpEl.attr({tabindex: "-1"});
                menu.on('hide:after', function(){
                    me.view.listControlMenu.removeAll();
                    if (!me._fromShowContentControls)
                        me.api.asc_UncheckContentControlButtons();
                });
            }
            if (specProps) {
                var count = specProps.get_ItemsCount();
                for (var i=0; i<count; i++) {
                    menu.addItem(new Common.UI.MenuItem({
                        caption     : specProps.get_ItemDisplayText(i),
                        value       : specProps.get_ItemValue(i)
                    }));
                }
            }

            menuContainer.css({left: x, top : y});
            menuContainer.attr('data-value', 'prevent-canvas-click');
            documentHolderView._preventClick = true;
            menu.show();

            menu.alignPosition();
            _.delay(function() {
                menu.cmpEl.focus();
            }, 10);
            this._fromShowContentControls = false;
        },

        onShowContentControlsActions: function(obj, x, y) {
            var type = obj.type;
            switch (type) {
                case Asc.c_oAscContentControlSpecificType.TOC:
                    this.onShowTOCActions(obj, x, y);
                    break;
                case Asc.c_oAscContentControlSpecificType.DateTime:
                    this.onShowDateActions(obj, x, y);
                    break;
                case Asc.c_oAscContentControlSpecificType.Picture:
                    this.api.asc_addImage(obj);
                    break;
                case Asc.c_oAscContentControlSpecificType.DropDownList:
                case Asc.c_oAscContentControlSpecificType.ComboBox:
                    this.onShowListActions(obj, x, y);
                    break;
            }
        }

    }, DE.Controllers.Links || {}));
});