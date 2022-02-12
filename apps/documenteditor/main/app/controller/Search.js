/*
 *
 * (c) Copyright Ascensio System SIA 2010-2020
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
 *  ViewTab.js
 *
 *  Created by Julia Svinareva on 09.02.2022
 *  Copyright (c) 2022 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'common/main/lib/view/SearchPanel'
], function () {
    'use strict';

    DE.Controllers.Search = Backbone.Controller.extend(_.extend({
        sdkViewName : '#id_main',

        views: [
            'Common.Views.SearchPanel'
        ],

        initialize: function () {
            console.log('init');
            this.addListeners({
                'SearchBar': {
                    'search:back': _.bind(this.onQuerySearch, this, 'back'),
                    'search:next': _.bind(this.onQuerySearch, this, 'next'),
                }
            });
        },
        onLaunch: function () {
            this._state = {};

            this.view = this.createView('Common.Views.SearchPanel');
        },

        setApi: function (api) {
            if (api) {
                this.api = api;
            }
            return this;
        },

        getView: function(name) {
            return !name && this.view ?
                this.view : Backbone.Controller.prototype.getView.call(this, name);
        },

        onQuerySearch: function (d, w, opts) {
            if (opts.textsearch && opts.textsearch.length) {
                if (!this.api.asc_findText(opts.textsearch, d != 'back')) {
                    var me = this;
                    Common.UI.info({
                        msg: this.textNoTextFound,
                        callback: function() {
                            //me.dlgSearch.focus();
                        }
                    });
                }
            }
        },

        textNoTextFound: 'The data you have been searching for could not be found. Please adjust your search options.',

    }, DE.Controllers.Search || {}));
});