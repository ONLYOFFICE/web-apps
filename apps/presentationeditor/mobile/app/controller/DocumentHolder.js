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
 *  Presentation Editor
 *
 *  Created by Julia Radzhabova on 12/19/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */


define([
    'core',
    'jquery',
    'underscore',
    'backbone',
    'presentationeditor/mobile/app/view/DocumentHolder'
], function (core, $, _, Backbone) {
    'use strict';

    PE.Controllers.DocumentHolder = Backbone.Controller.extend(_.extend((function() {
        // private
        var _stack,
            _view,
            _actionSheets = [],
            _isEdit = false,
            _isPopMenuHidden = false;

        return {
            models: [],
            collections: [],
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
                me.api.asc_registerCallback('asc_onDocumentContentReady',   _.bind(me.onApiDocumentContentReady, me));
                Common.NotificationCenter.on('api:disconnect',              _.bind(me.onCoAuthoringDisconnect, me));
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

                    PE.getController('EditContainer').showModal();
                } else if ('addlink' == eventName) {
                    _view.hideMenu();

                    PE.getController('AddContainer').showModal();
                    uiApp.showTab('#add-link');
                    // PE.getController('AddLink').getView('AddLink').showLink();
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

            stopApiPopMenu: function() {
                _isPopMenuHidden = true;
                this.onApiHidePopMenu();
            },

            startApiPopMenu: function() {
                _isPopMenuHidden = false;
            },

            // API Handlers

            onEditorResize: function(cmp) {
                // Hide context menu
            },

            onApiShowPopMenu: function(posX, posY) {
                if (_isPopMenuHidden || $('.popover.settings, .popup.settings, .picker-modal.settings, .modal-in, .actions-modal').length > 0)
                    return;

                var me = this,
                    items;

                _stack = me.api.getSelectedElements();
                items = me._initMenu(_stack);

                _view.showMenu(items, posX, posY);
            },

            onApiHidePopMenu: function() {
                _view && _view.hideMenu();
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
                } else
                    this.api.asc_GoToInternalHyperlink(url);
            },

            _initMenu: function (stack) {
                var me = this,
                    menuItems = [],
                    canCopy = me.api.can_CopyCut();

                _actionSheets = [];

                var isText = false,
                    isTable = false,
                    isImage = false,
                    isChart = false,
                    isShape = false,
                    isLink = false,
                    isSlide = false,
                    isObject = false;

                _.each(stack, function (item) {
                    var objectType = item.get_ObjectType(),
                        objectValue = item.get_ObjectValue();

                    if (objectType == Asc.c_oAscTypeSelectElement.Paragraph) {
                        isText = true;
                    } else if (objectType == Asc.c_oAscTypeSelectElement.Image) {
                        isImage = true;
                    } else if (objectType == Asc.c_oAscTypeSelectElement.Chart) {
                        isChart = true;
                    } else if (objectType == Asc.c_oAscTypeSelectElement.Shape) {
                        isShape = true;
                    } else if (objectType == Asc.c_oAscTypeSelectElement.Table) {
                        isTable = true;
                    } else if (objectType == Asc.c_oAscTypeSelectElement.Hyperlink) {
                        isLink = true;
                    } else if (objectType == Asc.c_oAscTypeSelectElement.Slide) {
                        isSlide = true;
                    }
                });
                isObject = isText || isImage || isChart || isShape || isTable;

                if (canCopy && isObject) {
                    menuItems.push({
                        caption: me.menuCopy,
                        event: 'copy'
                    });
                }

                if (stack.length > 0) {
                    var topObject = stack[stack.length - 1],
                        topObjectType = topObject.get_ObjectType(),
                        topObjectValue = topObject.get_ObjectValue(),
                        objectLocked = _.isFunction(topObjectValue.get_Locked) ? topObjectValue.get_Locked() : false;

                    !objectLocked && (objectLocked = _.isFunction(topObjectValue.get_LockDelete) ? topObjectValue.get_LockDelete() : false);

                    var swapItems = function(items, indexBefore, indexAfter) {
                        items[indexAfter] = items.splice(indexBefore, 1, items[indexAfter])[0];
                    };

                    if (!objectLocked && _isEdit && !me.isDisconnected) {
                        if (canCopy && isObject) {
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

                        if (isObject)
                            menuItems.push({
                                caption: me.menuDelete,
                                event: 'delete'
                            });

                        menuItems.push({
                            caption: me.menuEdit,
                            event: 'edit'
                        });

                        if (!isLink && me.api.can_AddHyperlink()!==false) {
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
    })(), PE.Controllers.DocumentHolder || {}))
});