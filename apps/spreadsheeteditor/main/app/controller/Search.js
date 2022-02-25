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
 *  Created by Julia Svinareva on 22.02.2022
 *  Copyright (c) 2022 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'common/main/lib/view/SearchPanel'
], function () {
    'use strict';

    SSE.Controllers.Search = Backbone.Controller.extend(_.extend({
        sdkViewName : '#id_main',

        views: [
            'Common.Views.SearchPanel'
        ],

        initialize: function () {
            this.addListeners({
                'SearchBar': {
                    'search:back': _.bind(this.onQuerySearch, this, 'back'),
                    'search:next': _.bind(this.onQuerySearch, this, 'next'),
                },
                'Common.Views.SearchPanel': {
                    'search:back': _.bind(this.onQuerySearch, this, 'back'),
                    'search:next': _.bind(this.onQuerySearch, this, 'next'),
                    'search:replace': _.bind(this.onQueryReplace, this),
                    'search:replaceall': _.bind(this.onQueryReplaceAll, this)
                }
            });
        },
        onLaunch: function () {
            this._state = {};
        },

        setMode: function (mode) {
            this.view = this.createView('Common.Views.SearchPanel', { mode: mode });
        },

        setApi: function (api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onRenameCellTextEnd', _.bind(this.onRenameText, this));
            }
            return this;
        },

        getView: function(name) {
            return !name && this.view ?
                this.view : Backbone.Controller.prototype.getView.call(this, name);
        },

        onQuerySearch: function (d, w, opts, fromPanel) {
            var options = new Asc.asc_CFindOptions();
            options.asc_setFindWhat(opts.textsearch);
            options.asc_setScanForward(d != 'back');
            options.asc_setIsMatchCase(opts.matchcase);
            options.asc_setIsWholeCell(opts.matchword);

            var extraOptions = this.view.getExtraSettings();
            options.asc_setScanOnOnlySheet(extraOptions.within);
            options.asc_setScanByRows(extraOptions.search);
            options.asc_setLookIn(extraOptions.lookIn ? Asc.c_oAscFindLookIn.Formulas : Asc.c_oAscFindLookIn.Value);

            if (!this.api.asc_findText(options)) {
                var me = this;
                Common.UI.info({
                    msg: this.textNoTextFound,
                    callback: function() {
                        if (fromPanel) {
                            me.view.focus();
                        } else {

                        }
                    }
                });
            }
        },

        onQueryReplace: function(w, opts) {
            this.api.isReplaceAll = false;

            var options = new Asc.asc_CFindOptions();
            options.asc_setFindWhat(opts.textsearch);
            options.asc_setReplaceWith(opts.textreplace);
            options.asc_setIsMatchCase(opts.matchcase);
            options.asc_setIsWholeCell(opts.matchword);

            var extraOptions = this.view.getExtraSettings();
            options.asc_setScanOnOnlySheet(extraOptions.within);
            options.asc_setScanByRows(extraOptions.search);
            options.asc_setLookIn(extraOptions.lookIn ? Asc.c_oAscFindLookIn.Formulas : Asc.c_oAscFindLookIn.Value);
            options.asc_setIsReplaceAll(false);

            this.api.asc_replaceText(options);
        },

        onQueryReplaceAll: function(w, opts) {
            this.api.isReplaceAll = true;

            var options = new Asc.asc_CFindOptions();
            options.asc_setFindWhat(opts.textsearch);
            options.asc_setReplaceWith(opts.textreplace);
            options.asc_setIsMatchCase(opts.matchcase);
            options.asc_setIsWholeCell(opts.matchword);

            var extraOptions = this.view.getExtraSettings();
            options.asc_setScanOnOnlySheet(extraOptions.within);
            options.asc_setScanByRows(extraOptions.search);
            options.asc_setLookIn(extraOptions.lookIn ? Asc.c_oAscFindLookIn.Formulas : Asc.c_oAscFindLookIn.Value);
            options.asc_setIsReplaceAll(true);

            this.api.asc_replaceText(options);
        },

        onRenameText: function (found, replaced) {
            var me = this;
            if (this.api.isReplaceAll) {
                Common.UI.info({
                    msg: (found) ? ((!found-replaced) ? Common.Utils.String.format(this.textReplaceSuccess,replaced) : Common.Utils.String.format(this.textReplaceSkipped,found-replaced)) : this.textNoTextFound,
                    callback: function() {
                        me.view.focus();
                    }
                });
            } else {
                var sett = this.view.getSettings();
                var options = new Asc.asc_CFindOptions();
                options.asc_setFindWhat(sett.textsearch);
                options.asc_setScanForward(true);
                options.asc_setIsMatchCase(sett.matchcase);
                options.asc_setIsWholeCell(sett.matchword);

                var extraOptions = this.view.getExtraSettings();
                options.asc_setScanOnOnlySheet(extraOptions.within);
                options.asc_setScanByRows(extraOptions.search);
                options.asc_setLookIn(extraOptions.lookIn ? Asc.c_oAscFindLookIn.Formulas : Asc.c_oAscFindLookIn.Value);


                if (!me.api.asc_findText(options)) {
                    Common.UI.info({
                        msg: this.textNoTextFound,
                        callback: function() {
                            me.view.focus();
                        }
                    });
                }
            }
        },

        textNoTextFound: 'The data you have been searching for could not be found. Please adjust your search options.',
        textReplaceSuccess: 'Search has been done. {0} occurrences have been replaced',
        textReplaceSkipped: 'The replacement has been made. {0} occurrences were skipped.',

    }, SSE.Controllers.Search || {}));
});