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
        var _isEdit = false;

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
                    SSE.getController('AddContainer').showModal();
                    // SSE.getController('EditCell').getView('EditCell');
                    break;
                case 'merge':
                    if (me.api.asc_mergeCellsDataLost(Asc.c_oAscMergeOptions.Merge)) {
                        uiApp.confirm(me.warnMergeLostData, undefined, function(){
                            me.api.asc_mergeCells(Asc.c_oAscMergeOptions.Merge);
                        });
                    } else {
                        me.api.asc_mergeCells(Asc.c_oAscMergeOptions.Merge);
                    }
                    break;
                case 'unmerge':
                    me.api.asc_mergeCells(Asc.c_oAscMergeOptions.Unmerge);
                    break;
                case 'addlink':
                    me.view.hideMenu();
                    SSE.getController('AddContainer').showModal();
                    SSE.getController('AddOther').getView('AddOther').showInsertLink();
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

                me.view.hideMenu();
            },

            // API Handlers

            onEditorResize: function(cmp) {
                // Hide context menu
            },

            onApiShowPopMenu: function(posX, posY) {
                // if ( !this.permitions.isEdit ) return;

                if ($('.popover.settings, .popup.settings, .picker-modal.settings').length > 0) {
                    return;
                }

                var me = this,
                    items;

                items = me._initMenu(me.api.asc_getCellInfo());

                me.view.showMenu(items, posX + 200, posY + 100);
            },

            onApiHidePopMenu: function() {
                this.view.hideMenu();
            },

            // Internal

            _initMenu: function (cellinfo) {
                var me = this;

                if ( this.api.isCellEdited ) {
                    menuItems = [{
                            caption: 'Copy',
                            event: 'copy'
                        }];

                } else {
                    var menuItems = [
                        {
                            caption: 'Cut',
                            event: 'cut'
                        },
                        {
                            caption: 'Copy',
                            event: 'copy'
                        },
                        {
                            caption: 'Paste',
                            event: 'paste'
                        }
                    ];

                    var iscellmenu, isrowmenu, iscolmenu, isallmenu, ischartmenu, isimagemenu, istextshapemenu, isshapemenu, istextchartmenu,
                        seltype             = cellinfo.asc_getFlags().asc_getSelectionType(),
                        iscelllocked        = cellinfo.asc_getLocked(),
                        isTableLocked       = cellinfo.asc_getLockedTable()===true;

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

                    if (isimagemenu || isshapemenu || ischartmenu) {
                        menuItems.push({
                            caption: 'Edit',
                            event: 'edit'
                        });
                    } else
                    if (istextshapemenu || istextchartmenu) {
                    } else {
                        if ( iscellmenu ) {
                            !iscelledited &&
                            menuItems.push({
                                caption: 'Delete',
                                event: 'del'
                            });

                            !iscelllocked &&
                            menuItems.push({
                                caption: 'Cell',
                                event: 'edit'
                            });

                            menuItems.push({
                                caption: 'Merge',
                                event: 'merge'
                            });

                            cellinfo.asc_getFlags().asc_getMerge() &&
                            menuItems.push({
                                caption: 'Unmerge',
                                event: 'unmerge'
                            });

                            menuItems.push(
                                cellinfo.asc_getFlags().asc_getWrapText() ?
                                    {
                                        caption: 'Unwrap',
                                        event: 'unwrap'
                                    } :
                                    {
                                        caption: 'Wrap',
                                        event: 'wrap'
                                    });

                            if ( cellinfo.asc_getHyperlink() && !iscelledited && !cellinfo.asc_getFlags().asc_getMultiselect() &&
                                cellinfo.asc_getHyperlink().asc_getType() == Asc.c_oAscHyperlinkType.WebLink )
                            {
                                menuItems.push({
                                    caption: 'Open Link',
                                    event: 'openlink'
                                });
                            } else
                            if ( !cellinfo.asc_getHyperlink() && !iscelledited && !cellinfo.asc_getFlags().asc_getMultiselect() &&
                                !cellinfo.asc_getFlags().asc_getLockText() && !!cellinfo.asc_getText() )
                            {
                                menuItems.push({
                                    caption: 'Add Link',
                                    event: 'addlink'
                                });
                            }
                        }
                    }
                }

                if (Common.SharedSettings.get('phone') && menuItems.length > 3) {
                    menuItems = menuItems.slice(0, 3);
                }

                return menuItems;
            },

            warnMergeLostData: 'Operation can destroy data in the selected cells.<br>Continue?'
        }
    })());
});