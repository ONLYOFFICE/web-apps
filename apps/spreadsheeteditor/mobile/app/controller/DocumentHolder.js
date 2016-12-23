/*
 *
 * (c) Copyright Ascensio System Limited 2010-2016
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
 *
 *  Created by Maxim Kadushkin on 11/15/16
 *  Copyright (c) 2016 Ascensio System SIA. All rights reserved.
 *
 */


define([
    'core',
    'spreadsheeteditor/mobile/app/view/DocumentHolder'
], function (core) {
    'use strict';

    SSE.Controllers.DocumentHolder = Backbone.Controller.extend((function() {
        // private
        var _stack,
            _isEdit = false;

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
                this.api = api;

                // this.api.asc_registerCallback('asc_onShowPopMenu',      _.bind(this.onApiShowPopMenu, this));
                // this.api.asc_registerCallback('asc_onHidePopMenu',      _.bind(this.onApiHidePopMenu, this));
            },

            setMode: function (mode) {
                _isEdit = ('edit' === mode);
            },

            // When our application is ready, lets get started
            onLaunch: function() {
                var me = this;

                me.view = me.createView('DocumentHolder').render();

                $$(window).on('resize', _.bind(me.onEditorResize, me));
            },

            // Handlers

            onContextMenuClick: function (view, eventName) {
                var me = this;

                if ('cut' == eventName) {
                    me.api.asc_Cut();
                } else if ('copy' == eventName) {
                    me.api.asc_Copy();
                } else if ('paste' == eventName) {
                    me.api.asc_Paste();
                } else if ('delete' == eventName) {
                    console.debug('IMPLEMENT: Delete fragment');
                } else if ('edit' == eventName) {
                    me.view.hideMenu();

                    SSE.getController('EditContainer').showModal();
                } else if ('addlink' == eventName) {
                    me.view.hideMenu();

                    SSE.getController('AddContainer').showModal();
                    SSE.getController('AddOther').getView('AddOther').showLink();
                } else if ('openlink' == eventName) {
                    _.some(_stack, function (item) {
                        if (item.get_ObjectType() == Asc.c_oAscTypeSelectElement.Hyperlink) {
                            me._openLink(item.get_ObjectValue().get_Value());
                            return true;
                        }
                    });
                }

                me.view.hideMenu();
            },

            // API Handlers

            onEditorResize: function(cmp) {
                // Hide context menu
            },

            onApiShowPopMenu: function(posX, posY) {
                if ($('.popover.settings, .popup.settings, .picker-modal.settings').length > 0) {
                    return;
                }

                var me = this,
                    items;

                _stack = me.api.getSelectedElements();
                items = me._initMenu(_stack);

                me.view.showMenu(items, posX, posY);
            },

            onApiHidePopMenu: function() {
                this.view.hideMenu();
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

                if (canCopy) {
                    menuItems.push({
                        caption: 'Copy',
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
                    var topObject = stack[stack.length - 1],
                        topObjectType = topObject.get_ObjectType(),
                        topObjectValue = topObject.get_ObjectValue(),
                        objectLocked = _.isFunction(topObjectValue.get_Locked) ? topObjectValue.get_Locked() : false;

                    var swapItems = function(items, indexBefore, indexAfter) {
                        items[indexAfter] = items.splice(indexBefore, 1, items[indexAfter])[0];
                    };

                    if (!objectLocked && _isEdit) {
                        menuItems.push({
                            caption: 'Cut',
                            event: 'cut'
                        });
                        menuItems.push({
                            caption: 'Paste',
                            event: 'paste'
                        });

                        // Swap 'Copy' and 'Cut'
                        swapItems(menuItems, 0, 1);

                        menuItems.push({
                            caption: 'Delete',
                            event: 'delete'
                        });

                        menuItems.push({
                            caption: 'Edit',
                            event: 'edit'
                        });
                    }

                    var text = me.api.can_AddHyperlink();

                    if (!_.isEmpty(text)) {
                        menuItems.push({
                            caption: 'Add Link',
                            event: 'addlink'
                        });
                    }

                    if (isLink) {
                        menuItems.push({
                            caption: 'Open Link',
                            event: 'openlink'
                        });
                    }
                }

                if (Common.SharedSettings.get('phone') && menuItems.length > 3) {
                    menuItems = menuItems.slice(0, 3);
                }

                return menuItems;
            }
        }
    })());
});