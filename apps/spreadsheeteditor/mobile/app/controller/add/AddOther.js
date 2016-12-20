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
 *  AddOther.js
 *
 *  Created by Kadushkin Maxim on 12/07/2016
 *  Copyright (c) 2016 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'spreadsheeteditor/mobile/app/view/add/AddOther'
], function (core) {
    'use strict';

    SSE.Controllers.AddOther = Backbone.Controller.extend(_.extend((function() {
        var c_pageNumPosition = {
            PAGE_NUM_POSITION_TOP: 0x01,
            PAGE_NUM_POSITION_BOTTOM: 0x02,
            PAGE_NUM_POSITION_RIGHT: 0,
            PAGE_NUM_POSITION_LEFT: 1,
            PAGE_NUM_POSITION_CENTER: 2
        };

        return {
            models: [],
            collections: [],
            views: [
                'AddOther'
            ],

            initialize: function () {
                Common.NotificationCenter.on('addcontainer:show', _.bind(this.initEvents, this));

                this.addListeners({
                    'AddOther': {
                        'page:show' : this.onPageShow
                        , 'link:insert': this.onInsertLink
                        , 'image:insert': this.onInsertImage
                        , 'insert:sort': this.onInsertSort
                        , 'insert:filter': this.onInsertFilter
                        , 'link:changetype': this.onChangeLinkType
                        , 'link:changesheet': this.onChangeLinkSheet
                    }
                });
            },

            setApi: function (api) {
                var me = this;
                me.api = api;

                // me.api.asc_registerCallback('asc_onInitEditorFonts',    _.bind(onApiLoadFonts, me));

            },

            onLaunch: function () {
                this.createView('AddOther').render();
            },

            initEvents: function () {
                var me = this;
                var wc = me.api.asc_getWorksheetsCount(), items = null;
                if (wc > 0) {
                    items = [];
                    while ( !(--wc < 0) ) {
                        if ( !this.api.asc_isWorksheetHidden(wc) ) {
                            items.unshift({
                                value: wc,
                                caption: me.api.asc_getWorksheetName(wc)
                            });
                        }
                    }
                }

                this.optsLink = {
                    type: 'ext',
                    sheets: items
                };

                _.defer(function () {
                    me.getView('AddOther')
                        .acceptWorksheets( items )
                        .setActiveWorksheet( me.api.asc_getActiveWorksheetIndex(),
                            me.api.asc_getWorksheetName(me.api.asc_getActiveWorksheetIndex()) );
                });
            },

            onPageShow: function (view, pageId) {
                var me = this;

                if (pageId == '#addother-link') {
                    var cell = me.api.asc_getCellInfo(),
                        celltype = cell.asc_getFlags().asc_getSelectionType();
                    var allowinternal = (celltype!==Asc.c_oAscSelectionType.RangeImage && celltype!==Asc.c_oAscSelectionType.RangeShape &&
                    celltype!==Asc.c_oAscSelectionType.RangeShapeText && celltype!==Asc.c_oAscSelectionType.RangeChart &&
                    celltype!==Asc.c_oAscSelectionType.RangeChartText);

                    view.optionDisplayText(cell.asc_getFlags().asc_getLockText() ? 'locked' : cell.asc_getText());
                    view.optionAllowInternal(allowinternal);
                    allowinternal && view.optionLinkType( this.optsLink.type );
                } else
                if (pageId == '#addother-sort') {
                    var filterInfo = this.api.asc_getCellInfo().asc_getAutoFilterInfo();
                    view.optionAutofilter( filterInfo ? filterInfo.asc_getIsAutoFilter() : null)
                } else
                if (pageId == '#addother-change-linktype') {
                    view.optionLinkType( this.optsLink.type );
                }
            },

            // Handlers

            onInsertLink: function (args) {
                var link = new Asc.asc_CHyperlink();

                if ( args.type == 'ext' ) {
                    var url     = args.url,
                        urltype = this.api.asc_getUrlType($.trim(url)),
                        isEmail = (urltype == 2);

                    if (urltype < 1) {
                        uiApp.alert(this.txtNotUrl);
                        return;
                    }

                    url = url.replace(/^\s+|\s+$/g,'');

                    if (! /(((^https?)|(^ftp)):\/\/)|(^mailto:)/i.test(url) )
                        url = (isEmail ? 'mailto:' : 'http://' ) + url;

                    url = url.replace(new RegExp("%20",'g')," ");

                    link.asc_setType(Asc.c_oAscHyperlinkType.WebLink);
                    link.asc_setHyperlinkUrl(url);
                    display = url;
                } else {
                     if ( !/^[A-Z]+[1-9]\d*:[A-Z]+[1-9]\d*$/.test(args.url) ||
                                !/^[A-Z]+[1-9]\d*$/.test(args.url) )
                     {
                         uiApp.alert(this.textInvalidRange);
                         return;
                     }

                    link.asc_setType(Asc.c_oAscHyperlinkType.RangeLink);
                    link.asc_setSheet(args.sheet);
                    link.asc_setRange(args.url);

                    var display = args.sheet + '!' + args.url;
                }

                link.asc_setText(args.text == null ? null : !!args.text ? args.text : display);
                link.asc_setTooltip(args.tooltip);

                this.api.asc_insertHyperlink(link);

                SSE.getController('AddContainer').hideModal();
            },

            onChangeLinkType: function (view, type) {
                this.optsLink.type = type;

                view.optionLinkType( this.optsLink.type, 'caption' );
            },

            onChangeLinkSheet: function (view, index) {
            },

            onInsertImage: function (args) {
                SSE.getController('AddContainer').hideModal();

                if ( !args.islocal ) {
                    var me = this;
                    var url = args.url;
                    if (!_.isEmpty(url)) {
                        if ((/((^https?)|(^ftp)):\/\/.+/i.test(url))) {
                            SSE.getController('AddContainer').hideModal();

                            _.defer(function () {
                                me.api.asc_addImageDrawingObject(url);
                            });
                        } else {
                            uiApp.alert(me.txtNotUrl);
                        }
                    } else {
                        uiApp.alert(me.textEmptyImgUrl);
                    }
                } else {
                    this.api.asc_addImage();
                }
            },

            onInsertSort: function(type) {
                this.api.asc_sortColFilter(type == 'down' ? Asc.c_oAscSortOptions.Ascending : Asc.c_oAscSortOptions.Descending, '');
            },

            onInsertFilter: function(checked) {
                var formatTableInfo = this.api.asc_getCellInfo().asc_getFormatTableInfo();
                var tablename = (formatTableInfo) ? formatTableInfo.asc_getTableName() : undefined;
                if (checked)
                    this.api.asc_addAutoFilter(); else
                    this.api.asc_changeAutoFilter(tablename, Asc.c_oAscChangeFilterOptions.filter, checked);
            },

            textInvalidRange: 'ERROR! Invalid cells range',
            textEmptyImgUrl : 'You need to specify image URL.',
            txtNotUrl: 'This field should be a URL in the format \"http://www.example.com\"'
        }
    })(), SSE.Controllers.AddOther || {}))
});