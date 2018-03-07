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
 * AddLink.js
 *
 * Created by Maxim.Kadushkin on 1/10/2017
 * Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'spreadsheeteditor/mobile/app/view/add/AddLink'
], function (core) {
    'use strict';

    SSE.Controllers.AddLink = Backbone.Controller.extend(_.extend((function() {
        var cfgLink;

        // Handlers
        function onInsertLink (args) {
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
                var isValid = /^[A-Z]+[1-9]\d*:[A-Z]+[1-9]\d*$/.test(args.url);

                if (!isValid)
                    isValid = /^[A-Z]+[1-9]\d*$/.test(args.url);

                if (!isValid) {
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
        }

        function onChangePanel (view, pageId) {
            var me = this;

            if (pageId == '#addother-change-linktype') {
                view.optionLinkType( me.optsLink.type );
            }
        }

        function onChangeLinkType (view, type) {
            cfgLink.type = type;

            view.optionLinkType( cfgLink.type, 'caption' );
        }

        function onChangeLinkSheet (view, index) {
        }

        function applyLocked(view) {
            var _view = view || this.getView();

            var cell = this.api.asc_getCellInfo(),
                celltype = cell.asc_getFlags().asc_getSelectionType();
            var allowinternal = (celltype!==Asc.c_oAscSelectionType.RangeImage && celltype!==Asc.c_oAscSelectionType.RangeShape &&
            celltype!==Asc.c_oAscSelectionType.RangeShapeText && celltype!==Asc.c_oAscSelectionType.RangeChart &&
            celltype!==Asc.c_oAscSelectionType.RangeChartText);

            _view.optionDisplayText(cell.asc_getFlags().asc_getLockText() ? 'locked' : cell.asc_getText());
            _view.optionAllowInternal(allowinternal);
            allowinternal && _view.optionLinkType( cfgLink.type );
        }

        return {
            models: [],
            collections: [],
            views: [
                'AddLink'
            ],

            initialize: function () {
                Common.NotificationCenter.on('addcontainer:show', _.bind(this.initEvents, this));

                this.addListeners({
                    'AddLink': {
                        'panel:change' : onChangePanel.bind(this)
                        , 'link:insert': onInsertLink.bind(this)
                        , 'link:changetype': onChangeLinkType.bind(this)
                        , 'link:changesheet': onChangeLinkSheet.bind(this)
                    }
                });
            },

            setApi: function (api) {
                this.api = api;
            },

            onLaunch: function () {
                this.createView('AddLink').render();
            },

            getView: function (name) {
                return Backbone.Controller.prototype.getView.call(this, name ? name: 'AddLink');
            },

            initEvents: function (opts) {
                var me = this;
                var wsc = me.api.asc_getWorksheetsCount(), items = null;
                var aws = me.api.asc_getActiveWorksheetIndex();
                if (wsc > 0) {
                    items = [];
                    while ( !(--wsc < 0) ) {
                        if ( !this.api.asc_isWorksheetHidden(wsc) ) {
                            items.unshift({
                                value: wsc,
                                caption: me.api.asc_getWorksheetName(wsc),
                                active: wsc==aws
                            });
                        }
                    }
                }

                cfgLink = {
                    type: 'ext',
                    sheets: items
                };

                // uiApp.addView('#add-link', {
                //     dynamicNavbar: true
                // });

                _.defer(function () {
                    var view = me.getView().acceptWorksheets( items );
                    if ( opts ) {
                        if ( opts.panel === 'hyperlink' ) {
                            view.showPanel();
                            applyLocked.call(me, view);
                        }
                    }
                });
            },

            showPage: function (navbar) {
                var me = this;

                var view = this.getView();
                var rootView = SSE.getController('AddContainer').rootView;
                view.showPage(rootView, navbar);

                var cell = me.api.asc_getCellInfo(),
                    celltype = cell.asc_getFlags().asc_getSelectionType();
                var allowinternal = (celltype!==Asc.c_oAscSelectionType.RangeImage && celltype!==Asc.c_oAscSelectionType.RangeShape &&
                celltype!==Asc.c_oAscSelectionType.RangeShapeText && celltype!==Asc.c_oAscSelectionType.RangeChart &&
                celltype!==Asc.c_oAscSelectionType.RangeChartText);

                view.optionDisplayText(cell.asc_getFlags().asc_getLockText() ? 'locked' : cell.asc_getText());
                view.optionAllowInternal(allowinternal);
                allowinternal && view.optionLinkType( cfgLink.type );

                view.fireEvent('page:show', [this, '#addlink']);
            },

            textInvalidRange    : 'ERROR! Invalid cells range',
            txtNotUrl           : 'This field should be a URL in the format \"http://www.example.com\"'
        }
    })(), SSE.Controllers.AddLink || {}))
});