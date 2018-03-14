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
 *
 *  Created by Maxim Kadushkin on 11/15/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */


define([
    'core',
    'jquery',
    'underscore',
    'backbone',
    'spreadsheeteditor/mobile/app/view/DocumentHolder'
], function (core, $, _, Backbone) {
    'use strict';

    SSE.Controllers.DocumentHolder = Backbone.Controller.extend(_.extend((function() {
        // private
        var _actionSheets = [],
            _isEdit = false;

        function openLink(url) {
            var newDocumentPage = window.open(url, '_blank');

            if (newDocumentPage) {
                newDocumentPage.focus();
            }
        }

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

                this.api.asc_registerCallback('asc_onShowPopMenu',      _.bind(this.onApiShowPopMenu, this));
                this.api.asc_registerCallback('asc_onHidePopMenu',      _.bind(this.onApiHidePopMenu, this));
                Common.NotificationCenter.on('api:disconnect',          _.bind(this.onCoAuthoringDisconnect, this));
            },

            setMode: function (mode) {
                _isEdit = mode.isEdit;
            },

            // When our application is ready, lets get started
            onLaunch: function() {
                var me = this;

                me.view = me.createView('DocumentHolder').render();

                $$(window).on('resize', _.bind(me.onEditorResize, me));
            },

            // Handlers

            onContextMenuClick: function (view, event) {
                var me = this;
                var info = me.api.asc_getCellInfo();

                switch (event) {
                case 'cut': me.api.asc_Cut(); break;
                case 'copy': me.api.asc_Copy(); break;
                case 'paste': me.api.asc_Paste(); break;
                case 'del': me.api.asc_emptyCells(Asc.c_oAscCleanOptions.All); break;
                case 'wrap': me.api.asc_setCellTextWrap(true); break;
                case 'unwrap': me.api.asc_setCellTextWrap(false); break;
                case 'edit':
                    me.view.hideMenu();
                    SSE.getController('EditContainer').showModal();
                    // SSE.getController('EditCell').getView('EditCell');
                    break;
                case 'merge':
                    if (me.api.asc_mergeCellsDataLost(Asc.c_oAscMergeOptions.Merge)) {
                        _.defer(function () {
                            uiApp.confirm(me.warnMergeLostData, undefined, function(){
                                me.api.asc_mergeCells(Asc.c_oAscMergeOptions.Merge);
                            });
                        });
                    } else {
                        me.api.asc_mergeCells(Asc.c_oAscMergeOptions.Merge);
                    }
                    break;
                case 'unmerge':
                    me.api.asc_mergeCells(Asc.c_oAscMergeOptions.None);
                    break;
                case 'hide':
                    me.api[info.asc_getFlags().asc_getSelectionType() == Asc.c_oAscSelectionType.RangeRow ? 'asc_hideRows' : 'asc_hideColumns']();
                    break;
                case 'show':
                    me.api[info.asc_getFlags().asc_getSelectionType() == Asc.c_oAscSelectionType.RangeRow ? 'asc_showRows' : 'asc_showColumns']();
                    break;
                case 'addlink':
                    me.view.hideMenu();
                    SSE.getController('AddContainer').showModal({
                        panel: 'hyperlink'
                    });
                    break;
                case 'openlink':
                    var linkinfo = info.asc_getHyperlink();
                    if ( linkinfo.asc_getType() == Asc.c_oAscHyperlinkType.RangeLink ) {
                        /* not implemented in sdk */
                    } else {
                        var url = linkinfo.asc_getHyperlinkUrl().replace(/\s/g, "%20");
                        me.api.asc_getUrlType(url) > 0 && openLink(url);
                    }
                    break;
                }

                if ('showActionSheet' == event && _actionSheets.length > 0) {
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

                me.view.hideMenu();
            },

            // API Handlers

            onEditorResize: function(cmp) {
                // Hide context menu
            },

            onApiShowPopMenu: function(posX, posY) {
                if ( !_isEdit || this.isDisconnected) return;

                if ($('.popover.settings, .popup.settings, .picker-modal.settings, .modal-in, .actions-modal').length > 0) {
                    return;
                }

                var me = this,
                    items;

                items = me._initMenu(me.api.asc_getCellInfo());

                me.view.showMenu(items, posX, posY);
            },

            onApiHidePopMenu: function() {
                this.view.hideMenu();
            },

            // Internal

            _initMenu: function (cellinfo) {
                var me = this;

                _actionSheets = [];

                var iscellmenu, isrowmenu, iscolmenu, isallmenu, ischartmenu, isimagemenu, istextshapemenu, isshapemenu, istextchartmenu;
                var iscelllocked    = cellinfo.asc_getLocked(),
                    seltype         = cellinfo.asc_getFlags().asc_getSelectionType();

                switch (seltype) {
                    case Asc.c_oAscSelectionType.RangeCells:     iscellmenu  = true;     break;
                    case Asc.c_oAscSelectionType.RangeRow:       isrowmenu   = true;     break;
                    case Asc.c_oAscSelectionType.RangeCol:       iscolmenu   = true;     break;
                    case Asc.c_oAscSelectionType.RangeMax:       isallmenu   = true;     break;
                    case Asc.c_oAscSelectionType.RangeImage:     isimagemenu = true;     break;
                    case Asc.c_oAscSelectionType.RangeShape:     isshapemenu = true;     break;
                    case Asc.c_oAscSelectionType.RangeChart:     ischartmenu = true;     break;
                    case Asc.c_oAscSelectionType.RangeChartText: istextchartmenu = true; break;
                    case Asc.c_oAscSelectionType.RangeShapeText: istextshapemenu = true; break;
                }

                if (!iscelllocked && (isimagemenu || isshapemenu || ischartmenu || istextshapemenu || istextchartmenu)) {
                    this.api.asc_getGraphicObjectProps().every(function (object) {
                        if (object.asc_getObjectType() == Asc.c_oAscTypeSelectElement.Image) {
                            iscelllocked = object.asc_getObjectValue().asc_getLocked();
                        }

                        return !iscelllocked;
                    });
                }

                if ( iscelllocked || this.api.isCellEdited ) {
                    menuItems = [{
                            caption: me.menuCopy,
                            event: 'copy'
                        }];

                } else {
                    var menuItems = [{
                            caption: me.menuCut,
                            event: 'cut'
                        },{
                            caption: me.menuCopy,
                            event: 'copy'
                        },{
                            caption: me.menuPaste,
                            event: 'paste'
                        },{
                            caption: me.menuDelete,
                            event: 'del'
                        }];

                        // isTableLocked       = cellinfo.asc_getLockedTable()===true;

                    if (isimagemenu || isshapemenu || ischartmenu ||
                                istextshapemenu || istextchartmenu )
                    {
                        menuItems.push({
                            caption: me.menuEdit,
                            event: 'edit'
                        });
                    } else {
                        if ( iscolmenu || isrowmenu) {
                            menuItems.push({
                                    caption: me.menuHide,
                                    event: 'hide'
                                },{
                                    caption: me.menuShow,
                                    event: 'show'
                                });
                        } else
                        if ( iscellmenu ) {
                            !iscelllocked &&
                            menuItems.push({
                                caption: me.menuCell,
                                event: 'edit'
                            });

                            (cellinfo.asc_getFlags().asc_getMerge() == Asc.c_oAscMergeOptions.None) &&
                            menuItems.push({
                                caption: me.menuMerge,
                                event: 'merge'
                            });

                            (cellinfo.asc_getFlags().asc_getMerge() ==  Asc.c_oAscMergeOptions.Merge) &&
                            menuItems.push({
                                caption: me.menuUnmerge,
                                event: 'unmerge'
                            });

                            menuItems.push(
                                cellinfo.asc_getFlags().asc_getWrapText() ?
                                    {
                                        caption: me.menuUnwrap,
                                        event: 'unwrap'
                                    } :
                                    {
                                        caption: me.menuWrap,
                                        event: 'wrap'
                                    });

                            if ( cellinfo.asc_getHyperlink() && !cellinfo.asc_getFlags().asc_getMultiselect() &&
                                cellinfo.asc_getHyperlink().asc_getType() == Asc.c_oAscHyperlinkType.WebLink )
                            {
                                menuItems.push({
                                    caption: me.menuOpenLink,
                                    event: 'openlink'
                                });
                            } else
                            if ( !cellinfo.asc_getHyperlink() && !cellinfo.asc_getFlags().asc_getMultiselect() &&
                                !cellinfo.asc_getFlags().asc_getLockText() && !!cellinfo.asc_getText() )
                            {
                                menuItems.push({
                                    caption: me.menuAddLink,
                                    event: 'addlink'
                                });
                            }
                        }
                    }
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

            warnMergeLostData: 'Operation can destroy data in the selected cells.<br>Continue?',
            menuCopy:       'Copy',
            menuCut:        'Cut',
            menuPaste:      'Paste',
            menuDelete:     'Delete',
            menuAddLink:    'Add Link',
            menuOpenLink:   'Open Link',
            menuWrap:       'Wrap',
            menuUnwrap:     'Unwrap',
            menuMerge:      'Merge',
            menuUnmerge:    'Unmerge',
            menuShow:       'Show',
            menuHide:       'Hide',
            menuEdit:       'Edit',
            menuCell:       'Cell',
            menuMore:       'More',
            sheetCancel:    'Cancel'
        }
    })(), SSE.Controllers.DocumentHolder || {}))
});