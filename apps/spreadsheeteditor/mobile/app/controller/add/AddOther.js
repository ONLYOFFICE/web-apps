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
 *  AddOther.js
 *
 *  Created by Kadushkin Maxim on 12/07/2016
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'spreadsheeteditor/mobile/app/view/add/AddOther'
], function (core) {
    'use strict';

    SSE.Controllers.AddOther = Backbone.Controller.extend(_.extend((function() {

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
                        , 'image:insert': this.onInsertImage
                        , 'insert:sort': this.onInsertSort
                        , 'insert:filter': this.onInsertFilter
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

            initEvents: function (args) {
                if ( args && !(_.indexOf(args.panels, 'image') < 0) ) {
                    this.onPageShow(this.getView('AddOther'), '#addother-insimage');
                }
            },

            onPageShow: function (view, pageId) {
                var me = this;

                if (pageId == '#addother-sort') {
                    var filterInfo = me.api.asc_getCellInfo().asc_getAutoFilterInfo();
                    view.optionAutofilter( filterInfo ? filterInfo.asc_getIsAutoFilter() : null)
                } else
                if (pageId == '#addother-insimage') {
                    $('#addimage-url').single('click', function(e) {
                        view.showImageFromUrl();
                    });

                    $('#addimage-file').single('click', function () {
                        me.onInsertImage({islocal:true});
                    });
                }
            },

            // Handlers

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

            textEmptyImgUrl : 'You need to specify image URL.',
            txtNotUrl: 'This field should be a URL in the format \"http://www.example.com\"'
        }
    })(), SSE.Controllers.AddOther || {}))
});