/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
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
 * User: Julia.Radzhabova
 * Date: 30.07.19
 */

define([
    'core',
    'spreadsheeteditor/main/app/view/Spellcheck'
], function () {
    'use strict';

    SSE.Controllers.Spellcheck = Backbone.Controller.extend(_.extend({
        models: [],
        collections: [
        ],
        views: [
            'Spellcheck'
        ],

        initialize: function() {
            var me = this;
            this.addListeners({
                'Spellcheck': {
                    'show': function() {
                    },
                    'hide': function() {
                    }
                }
            });
        },

        events: function() {
        },

        onLaunch: function() {
            this.panelSpellcheck= this.createView('Spellcheck', {
            });
            this.panelSpellcheck.on('render:after', _.bind(this.onAfterRender, this));
            this._isDisabled = false;
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onSpellCheckInit',_.bind(this.loadLanguages, this));
            this.api.asc_registerCallback('asc_onSpellCheckVariantsFound', _.bind(this.onSpellCheckVariantsFound, this));
            return this;
        },

        setMode: function(mode) {
            this.mode = mode;
            return this;
        },

        onAfterRender: function(panelSpellcheck) {
            panelSpellcheck.buttonNext.on('click', _.bind(this.onClickNext, this));
            panelSpellcheck.cmbDictionaryLanguage.on('selected', _.bind(this.onSelectLanguage, this));
            panelSpellcheck.btnChange.on('click', _.bind(this.onClickChange, this));
            panelSpellcheck.btnIgnore.on('click', _.bind(this.onClickIgnore, this));
            panelSpellcheck.btnChange.menu.on('item:click', _.bind(this.onClickChangeMenu, this));
            panelSpellcheck.btnIgnore.menu.on('item:click', _.bind(this.onClickIgnoreMenu, this));
        },

        onClickNext: function() {
            if (this.api) {
                this.api.asc_nextWord();
            }
        },

        SetDisabled: function(state) {
            this._isDisabled = state;
        },

        loadLanguages: function (apiLangs) {
            var langs = [], info,
                allLangs = Common.util.LanguageInfo.getLanguages();
            apiLangs.forEach(function (code) {
                if (allLangs.hasOwnProperty(parseInt(code))) {
                    info = allLangs[parseInt(code)];
                    langs.push({
                        displayValue:   info[1],
                        value:          info[0],
                        code:           parseInt(code),
                    });
                }
            });
            this.languages = langs;
            this.panelSpellcheck.cmbDictionaryLanguage.setData(this.languages);
            /*var codeCurLang = this.api.asc_getDefaultLanguage();*/
            var codeCurLang = 1036;
            var curLang = allLangs[codeCurLang][0];
            this.panelSpellcheck.cmbDictionaryLanguage.setValue(curLang);
        },

        onSelectLanguage: function (combo, record) {
            var lang = record.code;
            if (this.api && lang) {
                /*this.api.asc_setDefaultLanguage(lang);*/
            }
        },

        onClickChange: function (btn, e) {
            if (this.api) {
                /*this.api.asc_change();*/
            }
        },

        onClickChangeMenu: function (menu, item) {
            /*if (this.api) {
                if (item.value == 0) {
                    this.api.asc_change();
                } else if (item.value == 1) {
                    this.api.asc_changeAll();
                }
            }*/
        },

        onClickIgnore: function () {
            if (this.api) {
                /*this.api.asc_ignore();*/
            }
        },

        onClickIgnoreMenu: function () {
            /*if (this.api) {
                if (item.value == 0) {
                    this.api.asc_ignore();
                } else if (item.value == 1) {
                    this.api.asc_ignoreAll();
                }
            }*/
        },

        onSpellCheckVariantsFound: function (property) {
            var word = property.get_Word();
            this.panelSpellcheck.currentWord.setValue(word);

            var variants = property.get_Variants(),
                arr = [];
            variants.forEach(function (item) {
                var rec = new Common.UI.DataViewModel();
                rec.set({
                    value: item
                });
                arr.push(rec);
            });
            this.panelSpellcheck.suggestionList.store.reset(arr);
        }

    }, SSE.Controllers.Spellcheck || {}));
});
