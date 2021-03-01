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
 *  DocumentHolder.js
 *  Document Editor
 *
 *  Created by Alexander Yuzhin on 11/8/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */


define([
    'core',
    'jquery',
    'underscore',
    'backbone',
    'documenteditor/mobile/app/view/DocumentHolder',
    'common/main/lib/collection/Users'
], function (core, $, _, Backbone) {
    'use strict';

    DE.Controllers.DocumentHolder = Backbone.Controller.extend(_.extend((function() {
        // private
        var _stack,
            _view,
            _fastCoAuthTips = [],
            _actionSheets = [],
            _isEdit = false,
            _canReview = false,
            _inRevisionChange = false,
            _isComments = false,
            _menuPos = [],
            _timer = 0,
            _canViewComments = true,
            _isRestrictedEdit = false,
            _canFillForms = true,
            _stateDisplayMode = false;

        return {
            models: [],
            collections: [
                'Common.Collections.Users'
            ],
            views: [
                'DocumentHolder'
            ],

            initialize: function() {
                this.addListeners({
                    'DocumentHolder': {
                        'contextmenu:click' : this.onContextMenuClick
                    }
                });
            },

            setApi: function(api) {
                var me = this;

                me.api = api;

                me.api.asc_registerCallback('asc_onShowPopMenu',            _.bind(me.onApiShowPopMenu, me));
                me.api.asc_registerCallback('asc_onHidePopMenu',            _.bind(me.onApiHidePopMenu, me));
                me.api.asc_registerCallback('asc_onShowForeignCursorLabel', _.bind(me.onApiShowForeignCursorLabel, me));
                me.api.asc_registerCallback('asc_onHideForeignCursorLabel', _.bind(me.onApiHideForeignCursorLabel, me));
                me.api.asc_registerCallback('asc_onAuthParticipantsChanged',_.bind(me.onApiUsersChanged, me));
                me.api.asc_registerCallback('asc_onConnectionStateChanged', _.bind(me.onApiUserConnection, me));
                me.api.asc_registerCallback('asc_onDocumentContentReady',   _.bind(me.onApiDocumentContentReady, me));
                Common.NotificationCenter.on('api:disconnect',              _.bind(me.onCoAuthoringDisconnect, me));
                me.api.asc_registerCallback('asc_onCoAuthoringDisconnect',  _.bind(me.onCoAuthoringDisconnect,me));
                me.api.asc_registerCallback('asc_onShowRevisionsChange',    _.bind(me.onApiShowChange, me));
                me.api.asc_registerCallback('asc_onShowComment',            _.bind(me.onApiShowComment, me));
                me.api.asc_registerCallback('asc_onHideComment',            _.bind(me.onApiHideComment, me));
                me.api.asc_coAuthoringGetUsers();
            },

            setMode: function (mode) {
                _isEdit = mode.isEdit;
                _isRestrictedEdit = mode.isRestrictedEdit;
                _canReview = mode.canReview;
                _canViewComments = mode.canViewComments;
                _canFillForms = mode.canFillForms;
                if (_isEdit || _isRestrictedEdit && _canFillForms) {
                    this.api && this.api.asc_registerCallback('asc_onShowContentControlsActions',_.bind(this.onShowContentControlsActions, this));
                    this.api && this.api.asc_registerCallback('asc_onHideContentControlsActions',_.bind(this.onHideContentControlsActions, this));
                }
            },

            // When our application is ready, lets get started
            onLaunch: function() {
                var me = this;

                _view = me.createView('DocumentHolder').render();

                $$(window).on('resize', _.bind(me.onEditorResize, me));
            },

            // Handlers

            onContextMenuClick: function (view, eventName) {
                var me = this;

                if ('cut' == eventName) {
                    var res = me.api.Cut();
                    if (!res) {
                        _view.hideMenu();
                        if (!Common.localStorage.getBool("de-hide-copy-cut-paste-warning")) {
                            uiApp.modal({
                                title: me.textCopyCutPasteActions,
                                text: me.errorCopyCutPaste,
                                afterText: '<label class="label-checkbox item-content no-ripple">' +
                                    '<input type="checkbox" name="checkbox-show-cut">' +
                                    '<div class="item-media" style="margin-top: 10px; display: flex; align-items: center;">' +
                                    '<i class="icon icon-form-checkbox"></i><span style="margin-left: 10px;">' + me.textDoNotShowAgain + '</span>' +
                                    '</div>' +
                                    '</label>',
                                buttons: [{
                                    text: 'OK',
                                    onClick: function () {
                                        var dontshow = $('input[name="checkbox-show-cut"]').prop('checked');
                                        if (dontshow) Common.localStorage.setItem("de-hide-copy-cut-paste-warning", 1);
                                    }
                                }]
                            });
                        }
                    }
                } else if ('copy' == eventName) {
                    var res = me.api.Copy();
                    if (!res) {
                        _view.hideMenu();
                        if (!Common.localStorage.getBool("de-hide-copy-cut-paste-warning")) {
                            uiApp.modal({
                                title: me.textCopyCutPasteActions,
                                text: me.errorCopyCutPaste,
                                afterText: '<label class="label-checkbox item-content no-ripple">' +
                                    '<input type="checkbox" name="checkbox-show-copy">' +
                                    '<div class="item-media" style="margin-top: 10px; display: flex; align-items: center;">' +
                                    '<i class="icon icon-form-checkbox"></i><span style="margin-left: 10px;">' + me.textDoNotShowAgain + '</span>' +
                                    '</div>' +
                                    '</label>',
                                buttons: [{
                                    text: 'OK',
                                    onClick: function () {
                                        var dontshow = $('input[name="checkbox-show-copy"]').prop('checked');
                                        if (dontshow) Common.localStorage.setItem("de-hide-copy-cut-paste-warning", 1);
                                    }
                                }]
                            });
                        }
                    }
                } else if ('paste' == eventName) {
                    var res = me.api.Paste();
                    if (!res) {
                        _view.hideMenu();
                        if (!Common.localStorage.getBool("de-hide-copy-cut-paste-warning")) {
                            uiApp.modal({
                                title: me.textCopyCutPasteActions,
                                text: me.errorCopyCutPaste,
                                afterText: '<label class="label-checkbox item-content no-ripple">' +
                                    '<input type="checkbox" name="checkbox-show-paste">' +
                                    '<div class="item-media" style="margin-top: 10px; display: flex; align-items: center;">' +
                                    '<i class="icon icon-form-checkbox"></i><span style="margin-left: 10px;">' + me.textDoNotShowAgain + '</span>' +
                                    '</div>' +
                                    '</label>',
                                buttons: [{
                                    text: 'OK',
                                    onClick: function () {
                                        var dontshow = $('input[name="checkbox-show-paste"]').prop('checked');
                                        if (dontshow) Common.localStorage.setItem("de-hide-copy-cut-paste-warning", 1);
                                    }
                                }]
                            });
                        }
                    }
                } else if ('merge' == eventName) {
                    me.api.MergeCells();
                } else if ('split' == eventName) {
                    _view.hideMenu();
                    me.showSplitModal();
                } else if ('delete' == eventName) {
                    me.api.asc_Remove();
                } else if('deletetable' == eventName) {
                    me.api.remTable();
                } else if ('edit' == eventName) {
                    _view.hideMenu();

                    DE.getController('EditContainer').showModal();
                } else if ('addlink' == eventName) {
                    _view.hideMenu();

                    DE.getController('AddContainer').showModal();
                    DE.getController('AddOther').getView('AddOther').showLink(false);
                } else if ('openlink' == eventName) {
                    _.some(_stack, function (item) {
                        if (item.get_ObjectType() == Asc.c_oAscTypeSelectElement.Hyperlink) {
                            me._openLink(item.get_ObjectValue().get_Value());
                            return true;
                        }
                    });
                } else if ('review' == eventName) {
                    var getCollaboration = DE.getController('Common.Controllers.Collaboration');
                    getCollaboration.showModal();
                    getCollaboration.getView('Common.Views.Collaboration').showPage('#reviewing-settings-view', false);
                } else if('reviewchange' == eventName) {
                    var getCollaboration = DE.getController('Common.Controllers.Collaboration');
                    getCollaboration.showModal();
                    getCollaboration.getView('Common.Views.Collaboration').showPage('#reviewing-settings-view', false);
                    getCollaboration.getView('Common.Views.Collaboration').showPage('#change-view', false);
                } else if ('viewcomment' == eventName) {
                    var getCollaboration = DE.getController('Common.Controllers.Collaboration');
                    getCollaboration.showCommentModal();
                } else if ('addcomment' == eventName) {
                    _view.hideMenu();
                    DE.getController('AddContainer').showModal();
                    DE.getController('AddOther').getView('AddOther').showPageComment(false);
                } else if ('showActionSheet' == eventName && _actionSheets.length > 0) {
                    _.delay(function () {
                        _.each(_actionSheets, function (action) {
                            action.text = action.caption;
                            action.onClick = function () {
                                me.onContextMenuClick(null, action.event)
                            }
                        });

                        uiApp.actions([_actionSheets, [
                            {
                                text: me.sheetCancel,
                                bold: true
                            }
                        ]]);
                    }, 100);
                }

                _view.hideMenu();
            },

            showSplitModal: function() {
                var me = this,
                    picker;
                uiApp.modal({
                    title   : me.menuSplit,
                    text: '',
                    afterText:
                        '<div class="content-block">' +
                        '<div class="row no-gutter" style="text-align: center;">' +
                        '<div class="col-50 size-columns">' + me.textColumns + '</div>' +
                        '<div class="col-50 size-rows">' + me.textRows + '</div>' +
                        '</div>' +
                        '<div id="picker-split-size"></div>' +
                        '</div>',
                    buttons: [
                        {
                            text: me.textCancel
                        },
                        {
                            text: 'OK',
                            bold: true,
                            onClick: function () {
                                var size = picker.value;
                                if (me.api) {
                                    me.api.SplitCell(parseInt(size[0]), parseInt(size[1]));
                                }
                            }
                        }
                    ]
                });

                picker = uiApp.picker({
                    container: '#picker-split-size',
                    toolbar: false,
                    rotateEffect: true,
                    value: [3, 3],
                    cols: [{
                        textAlign: 'center',
                        width: '100%',
                        values: [1,2,3,4,5,6,7,8,9,10]
                    }, {
                        textAlign: 'center',
                        width: '100%',
                        values: [1,2,3,4,5,6,7,8,9,10]
                    }]
                });

            },

            // API Handlers

            onEditorResize: function(cmp) {
                // Hide context menu
            },

            onApiShowPopMenu: function(posX, posY) {
                if ($('.popover.settings, .popup.settings, .picker-modal.settings, .modal.modal-in, .actions-modal').length > 0) {
                    return;
                }
                var now = (new Date).getTime();
                if (now - _timer < 1000) return;
                _timer = 0;

                _menuPos = [posX, posY];

                var me = this,
                    items;

                _stack = me.api.getSelectedElements();
                items = me._initMenu(_stack);

                _view.showMenu(items, posX, posY);
            },

            onApiHidePopMenu: function() {
                var now = (new Date).getTime();
                if (now - _timer < 1000) return;
                _view && _view.hideMenu();
            },

            onApiShowForeignCursorLabel: function(userId, X, Y, color) {
                var me = this,
                    tipHeight = 20;

                var getUserName = function(id) {
                    var usersStore = DE.getCollection('Common.Collections.Users');

                    if (usersStore){
                        var rec = usersStore.findUser(id);
                        if (rec)
                            return Common.Utils.UserInfoParser.getParsedName(rec.get('username'));
                    }
                    return me.textGuest;
                };

                /** coauthoring begin **/
                var src = _.find(_fastCoAuthTips, function(tip){ return tip.attr('userid') == userId; });

                if (!src) {
                    src = $(document.createElement('div'));
                    src.addClass('username-tip');
                    src.attr('userid', userId);
                    src.css({
                        height: tipHeight + 'px',
                        position: 'absolute',
                        zIndex: '900',
                        display: 'none',
                        'pointer-events': 'none',
                        'background-color': '#' + Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b())});
                    src.text(getUserName(userId));
                    $('#id_main_view').append(src);

                    _fastCoAuthTips.push(src);

                    src.fadeIn(150);
                }
                src.css({
                    top: (Y - tipHeight) + 'px',
                    left: X + 'px'});
                /** coauthoring end **/
            },

            onApiHideForeignCursorLabel: function(userId) {
                /** coauthoring begin **/
                for (var i=0; i<_fastCoAuthTips.length; i++) {
                    if (_fastCoAuthTips[i].attr('userid') == userId) {
                        var src = _fastCoAuthTips[i];
                        _fastCoAuthTips[i].fadeOut(150, function(){src.remove()});
                        _fastCoAuthTips.splice(i, 1);
                        break;
                    }
                }
                /** coauthoring end **/
            },

            onApiUsersChanged: function(users){
                var usersStore = this.getApplication().getCollection('Common.Collections.Users');

                if (usersStore) {
                    var arrUsers = [], name, user;

                    for (name in users) {
                        if (undefined !== name) {
                            user = users[name];
                            if (user) {
                                arrUsers.push(new Common.Models.User({
                                    id          : user.asc_getId(),
                                    username    : user.asc_getUserName(),
                                    online      : true,
                                    color       : user.asc_getColor(),
                                    view        : user.asc_getView()
                                }));
                            }
                        }
                    }

                    usersStore[usersStore.size() > 0 ? 'add' : 'reset'](arrUsers);
                }
            },

            onApiUserConnection: function(change){
                var usersStore = this.getApplication().getCollection('Common.Collections.Users');

                if (usersStore){
                    var user = usersStore.findUser(change.asc_getId());
                    if (!user) {
                        usersStore.add(new Common.Models.User({
                            id          : change.asc_getId(),
                            username    : change.asc_getUserName(),
                            online      : change.asc_getState(),
                            color       : change.asc_getColor(),
                            view        : change.asc_getView()
                        }));
                    } else {
                        user.set({online: change.asc_getState()});
                    }
                }
            },

            onApiDocumentContentReady: function () {
                _view = this.createView('DocumentHolder').render();
            },

            onApiShowChange: function(sdkchange) {
                _inRevisionChange = sdkchange && sdkchange.length>0;
            },

            onApiShowComment: function(comments) {
                _isComments = comments && comments.length>0;
            },

            onApiHideComment: function() {
                _isComments = false;
            },

            onShowContentControlsActions: function(obj, x, y) {
                var type = obj.type;
                if (type==Asc.c_oAscContentControlSpecificType.Picture) {
                    if (obj.pr && obj.pr.get_Lock) {
                        var lock = obj.pr.get_Lock();
                        if (lock == Asc.c_oAscSdtLockType.SdtContentLocked || lock==Asc.c_oAscSdtLockType.ContentLocked)
                            return;
                    }
                    this.api.asc_addImage(obj);
                }
            },

            onHideContentControlsActions: function() {
            },

            // Internal

            _openLink: function(url) {
                if (this.api.asc_getUrlType(url) > 0) {
                    var newDocumentPage = window.open(url, '_blank');

                    if (newDocumentPage) {
                        newDocumentPage.focus();
                    }
                }
            },

            _initMenu: function (stack) {
                var me = this,
                    arrItems = [],
                    arrItemsIcon = [],
                    canCopy = me.api.can_CopyCut();

                _actionSheets = [];

                if (canCopy) {
                    arrItemsIcon.push({
                        caption: me.menuCopy,
                        event: 'copy',
                        icon: 'icon-copy'
                    });
                }
                if (_canViewComments && _isComments && !_isEdit) {
                    arrItems.push({
                        caption: me.menuViewComment,
                        event: 'viewcomment'
                    });
                }

                var isText = false,
                    isTable = false,
                    isImage = false,
                    isChart = false,
                    isShape = false,
                    isLink = false,
                    lockedText = false,
                    lockedTable = false,
                    lockedImage = false,
                    lockedHeader = false;

                _.each(stack, function (item) {
                    var objectType = item.get_ObjectType(),
                        objectValue = item.get_ObjectValue();

                    if (objectType == Asc.c_oAscTypeSelectElement.Header) {
                        lockedHeader = objectValue.get_Locked();
                    }

                    if (objectType == Asc.c_oAscTypeSelectElement.Paragraph) {
                        isText = true;
                        lockedText = objectValue.get_Locked();
                    } else if (objectType == Asc.c_oAscTypeSelectElement.Image) {
                        lockedImage = objectValue.get_Locked();
                        if (objectValue && objectValue.get_ChartProperties()) {
                            isChart = true;
                        } else if (objectType && objectValue.get_ShapeProperties()) {
                            isShape = true;
                        } else {
                            isImage = true;
                        }
                    } else if (objectType == Asc.c_oAscTypeSelectElement.Table) {
                        isTable = true;
                        lockedTable = objectValue.get_Locked();
                    } else if (objectType == Asc.c_oAscTypeSelectElement.Hyperlink) {
                        isLink = true;
                    }
                });

                if (stack.length > 0) {

                    var swapItems = function(items, indexBefore, indexAfter) {
                        items[indexAfter] = items.splice(indexBefore, 1, items[indexAfter])[0];
                    };

                    if (_isEdit && !me.isDisconnected && !_stateDisplayMode) {
                        if (!lockedText && !lockedTable && !lockedImage && !lockedHeader && canCopy) {
                            arrItemsIcon.push({
                                caption: me.menuCut,
                                event: 'cut',
                                icon: 'icon-cut'
                            });

                            // Swap 'Copy' and 'Cut'
                            swapItems(arrItemsIcon, 0, 1);
                        }

                        if (!lockedText && !lockedTable && !lockedImage && !lockedHeader) {
                            arrItemsIcon.push({
                                caption: me.menuPaste,
                                event: 'paste',
                                icon: 'icon-paste'
                            });
                        }

                        if(isTable && me.api.CheckBeforeMergeCells() && !lockedTable && !lockedHeader) {
                            arrItems.push({
                                caption: me.menuMerge,
                                event: 'merge'
                            });
                        }

                        if(isTable && me.api.CheckBeforeSplitCells() && !lockedTable && !lockedHeader) {
                            arrItems.push({
                                caption: me.menuSplit,
                                event: 'split'
                            });
                        }

                        if(!lockedText && !lockedTable && !lockedImage && !lockedHeader) {
                            arrItems.push({
                                caption: me.menuDelete,
                                event: 'delete'
                            });
                        }

                        if(isTable && !lockedTable && !lockedText && !lockedHeader) {
                            arrItems.push({
                                caption: me.menuDeleteTable,
                                event: 'deletetable'
                            });
                        }

                        if(!lockedText && !lockedTable && !lockedImage && !lockedHeader){
                            arrItems.push({
                                caption: me.menuEdit,
                                event: 'edit'
                            });
                        }

                        if (!_.isEmpty(me.api.can_AddHyperlink()) && !lockedHeader) {
                            arrItems.push({
                                caption: me.menuAddLink,
                                event: 'addlink'
                            });
                        }

                        if (_canReview) {
                            if (_inRevisionChange) {
                                arrItems.push({
                                    caption: me.menuReviewChange,
                                    event: 'reviewchange'
                                });
                            } else {
                                arrItems.push({
                                    caption: me.menuReview,
                                    event: 'review'
                                });
                            }
                        }

                        if (_isComments && _canViewComments) {
                            arrItems.push({
                                caption: me.menuViewComment,
                                event: 'viewcomment'
                            });
                        }

                        var isObject = isShape || isChart || isImage || isTable;
                        var hideAddComment = !_canViewComments || me.api.can_AddQuotedComment() === false || lockedText || lockedTable || lockedImage || lockedHeader || (!isText && isObject);
                        if (!hideAddComment) {
                            arrItems.push({
                                caption: me.menuAddComment,
                                event: 'addcomment'
                            });
                        }
                    }
                }

                if (isLink) {
                    arrItems.push({
                        caption: me.menuOpenLink,
                        event: 'openlink'
                    });
                }

                if (Common.SharedSettings.get('phone') && arrItems.length > 2) {
                    _actionSheets = arrItems.slice(2);

                    arrItems = arrItems.slice(0, 2);
                    arrItems.push({
                        caption: me.menuMore,
                        event: 'showActionSheet'
                    });
                }

                var menuItems = {itemsIcon: arrItemsIcon, items: arrItems};

                return menuItems;
            },

            onCoAuthoringDisconnect: function() {
                this.isDisconnected = true;
            },

            setDisplayMode: function(displayMode) {
                _stateDisplayMode = displayMode == "final" || displayMode == "original" ? true : false;
            },

            textGuest: 'Guest',
            textCancel: 'Cancel',
            textColumns: 'Columns',
            textRows: 'Rows',
            menuCut: 'Cut',
            menuCopy: 'Copy',
            menuPaste: 'Paste',
            menuEdit: 'Edit',
            menuDelete: 'Delete',
            menuAddLink: 'Add Link',
            menuOpenLink: 'Open Link',
            menuMore: 'More',
            sheetCancel: 'Cancel',
            menuReview: 'Review',
            menuMerge: 'Merge Cells',
            menuSplit: 'Split Cell',
            menuDeleteTable: 'Delete Table',
            menuReviewChange: 'Review Change',
            menuViewComment: 'View Comment',
            menuAddComment: 'Add Comment',
            textCopyCutPasteActions: 'Copy, Cut and Paste Actions',
            errorCopyCutPaste: 'Copy, cut and paste actions using the context menu will be performed within the current file only.',
            textDoNotShowAgain: 'Don\'t show again'
        }
    })(), DE.Controllers.DocumentHolder || {}))
});