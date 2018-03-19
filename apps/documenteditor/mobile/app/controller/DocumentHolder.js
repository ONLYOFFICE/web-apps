/*
 *
 * (c) Copyright Ascensio System Limited 2010-2018
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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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
            _isEdit = false;

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
                me.api.asc_coAuthoringGetUsers();
            },

            setMode: function (mode) {
                _isEdit = mode.isEdit;
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
                    me.api.Cut();
                } else if ('copy' == eventName) {
                    me.api.Copy();
                } else if ('paste' == eventName) {
                    me.api.Paste();
                } else if ('delete' == eventName) {
                    me.api.asc_Remove();
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
                } else if ('showActionSheet' == eventName && _actionSheets.length > 0) {
                    _.delay(function () {
                        _.each(_actionSheets, function (action) {
                            action.text = action.caption
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

            // API Handlers

            onEditorResize: function(cmp) {
                // Hide context menu
            },

            onApiShowPopMenu: function(posX, posY) {
                if ($('.popover.settings, .popup.settings, .picker-modal.settings, .modal.modal-in, .actions-modal').length > 0) {
                    return;
                }

                var me = this,
                    items;

                _stack = me.api.getSelectedElements();
                items = me._initMenu(_stack);

                _view.showMenu(items, posX, posY);
            },

            onApiHidePopMenu: function() {
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
                            return rec.get('username');
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
                    menuItems = [],
                    canCopy = me.api.can_CopyCut();

                _actionSheets = [];

                if (canCopy) {
                    menuItems.push({
                        caption: me.menuCopy,
                        event: 'copy'
                    });
                }

                var isText = false,
                    isTable = false,
                    isImage = false,
                    isChart = false,
                    isShape = false,
                    isLink = false;

                _.each(stack, function (item) {
                    var objectType = item.get_ObjectType(),
                        objectValue = item.get_ObjectValue();

                    if (objectType == Asc.c_oAscTypeSelectElement.Text) {
                        isText = true;
                    } else if (objectType == Asc.c_oAscTypeSelectElement.Image) {
                        if (objectValue && objectValue.get_ChartProperties()) {
                            isChart = true;
                        } else if (objectType && objectValue.get_ShapeProperties()) {
                            isShape = true;
                        } else {
                            isImage = true;
                        }
                    } else if (objectType == Asc.c_oAscTypeSelectElement.Table) {
                        isTable = true;
                    } else if (objectType == Asc.c_oAscTypeSelectElement.Hyperlink) {
                        isLink = true;
                    }
                });

                if (stack.length > 0) {
                    var topObject = _.find(stack.reverse(), function(obj){ return obj.get_ObjectType() != Asc.c_oAscTypeSelectElement.SpellCheck; }),
                        topObjectValue = topObject.get_ObjectValue(),
                        objectLocked = _.isFunction(topObjectValue.get_Locked) ? topObjectValue.get_Locked() : false;

                    var swapItems = function(items, indexBefore, indexAfter) {
                        items[indexAfter] = items.splice(indexBefore, 1, items[indexAfter])[0];
                    };

                    if (!objectLocked && _isEdit && !me.isDisconnected) {
                        if (canCopy) {
                            menuItems.push({
                                caption: me.menuCut,
                                event: 'cut'
                            });

                            // Swap 'Copy' and 'Cut'
                            swapItems(menuItems, 0, 1);
                        }

                        menuItems.push({
                            caption: me.menuPaste,
                            event: 'paste'
                        });

                        menuItems.push({
                            caption: me.menuDelete,
                            event: 'delete'
                        });

                        menuItems.push({
                            caption: me.menuEdit,
                            event: 'edit'
                        });

                        if (!_.isEmpty(me.api.can_AddHyperlink())) {
                            menuItems.push({
                                caption: me.menuAddLink,
                                event: 'addlink'
                            });
                        }
                    }
                }

                if (isLink) {
                    menuItems.push({
                        caption: me.menuOpenLink,
                        event: 'openlink'
                    });
                }

                if (Common.SharedSettings.get('phone') && menuItems.length > 3) {
                    _actionSheets = menuItems.slice(3);

                    menuItems = menuItems.slice(0, 3);
                    menuItems.push({
                        caption: me.menuMore,
                        event: 'showActionSheet'
                    });
                }

                return menuItems;
            },

            onCoAuthoringDisconnect: function() {
                this.isDisconnected = true;
            },

            textGuest: 'Guest',
            menuCut: 'Cut',
            menuCopy: 'Copy',
            menuPaste: 'Paste',
            menuEdit: 'Edit',
            menuDelete: 'Delete',
            menuAddLink: 'Add Link',
            menuOpenLink: 'Open Link',
            menuMore: 'More',
            sheetCancel: 'Cancel'
        }
    })(), DE.Controllers.DocumentHolder || {}))
});