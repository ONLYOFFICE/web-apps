/*
 * (c) Copyright Ascensio System SIA 2010-2024
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
 * You can contact Ascensio System SIA at 20A-6 Ernesta Birznieka-Upish
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
 * Date: 30.07.19
 */

define([
    'core'
], function () {
    'use strict';

    SSE.Controllers.Spellcheck = Backbone.Controller.extend(_.extend({
        models: [],
        collections: [],
        views: [],

        initialize: function() {
            var me = this;
            this.addListeners({
                'Spellcheck': {
                    'show': function() {
                        me._initSettings && me.loadLanguages();
                        me.updateLanguages();
                        me.onClickNext();
                    },
                    'hide': function() {
                        me.api && me.api.asc_cancelSpellCheck();
                    }
                },
                'LeftMenu': {
                    'spellcheck:update': function () {
                        me.updateLanguages();
                    }
                }
            });
        },

        events: function() {
        },

        onLaunch: function() {
            this._isDisabled = false;
            this._initSettings = true;
            Common.NotificationCenter.on('script:loaded', _.bind(this.onPostLoadComplete, this));
        },

        onPostLoadComplete: function() {
            this.views = this.getApplication().getClasseRefs('view', ['Spellcheck']);
            this.panelSpellcheck = this.createView('Spellcheck', {});
            this.panelSpellcheck.on('render:after', _.bind(this.onAfterRender, this));

            Common.NotificationCenter.trigger('script:loaded:spellcheck');
            if (this.api) {
                this.api.asc_registerCallback('asc_onSpellCheckVariantsFound', _.bind(this.onSpellCheckVariantsFound, this));
            }
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onEditCell', _.bind(this.onApiEditCell, this));
            return this;
        },

        setMode: function(mode) {
            this.mode = mode;
            if (this.panelSpellcheck) {
                this.panelSpellcheck.btnToDictionary.setVisible(mode.isDesktopApp);
            }
            return this;
        },

        onAfterRender: function(panelSpellcheck) {
            panelSpellcheck.buttonNext.on('click', _.bind(this.onClickNext, this));
            panelSpellcheck.btnToDictionary.on('click', _.bind(this.onDictionary, this));
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
            Common.NotificationCenter.trigger('edit:complete', this, {restorefocus:true});
        },

        onDictionary: function() {
            if (this.api) {
                var str = this.panelSpellcheck.currentWord.getValue();
                str && this.api.asc_spellCheckAddToDictionary(str);
            }
        },

        SetDisabled: function(state) {
            this._isDisabled = state;
        },

        setLanguages: function (array) {
            this.languages = array;
            this._initSettings = true;
            if (this.panelSpellcheck.cmbDictionaryLanguage && this.panelSpellcheck.cmbDictionaryLanguage.store.length > 0) {
                this.panelSpellcheck.cmbDictionaryLanguage.store.reset();
            }
        },

        loadLanguages: function () {
            var me = this;
            if (this._initSettings) {
                Common.Utils.InternalSettings.set("sse-spellcheck-locale", Common.localStorage.getItem("sse-spellcheck-locale"));
            }

            if (this.languages && this.languages.length>0) {
                var langs = [], info;
                this.allLangs = Common.util.LanguageInfo.getLanguages();
                this.languages.forEach(function (code) {
                    code = parseInt(code);
                    if (me.allLangs.hasOwnProperty(code)) {
                        info = me.allLangs[code];
                        langs.push({
                            displayValue:   info[1],
                            shortName:      info[0],
                            value:          code
                        });
                    }
                });
                langs.sort(function(a, b){
                    if (a.shortName < b.shortName) return -1;
                    if (a.shortName > b.shortName) return 1;
                    return 0;
                });
                this.langs = langs;
            } else {
                this.langs = undefined;
            }
            this._initSettings = false;

            var change = this.panelSpellcheck.cmbDictionaryLanguage.store.length === 0;

            return [this.allLangs, this.langs, change];
        },

        updateLanguages: function() {
            var sessionValue = Common.Utils.InternalSettings.get("sse-spellcheck-locale"),
                value,
                isApply = false;
            if (sessionValue)
                value = parseInt(sessionValue);
            else
                value = this.mode.lang ? parseInt(Common.util.LanguageInfo.getLocalLanguageCode(this.mode.lang)) : 0x0409;
            var combo = this.panelSpellcheck.cmbDictionaryLanguage;
            if (this.langs && this.langs.length>0) {
                if (combo.store.length === 0) {
                    combo.setData(this.langs);
                    isApply = true;
                }
                var item = combo.store.findWhere({value: value});
                if (!item && this.allLangs[value]) {
                    value = this.allLangs[value][0].split(/[\-\_]/)[0];
                    item = combo.store.find(function(model){
                        return model.get('shortName').indexOf(value)==0;
                    });
                }
                combo.setValue(item ? item.get('value') : this.langs[0].value);
                value = combo.getValue();
            } else {
                combo.setValue(Common.util.LanguageInfo.getLocalLanguageName(value)[1]);
                combo.setDisabled(true);
            }
            if (isApply && this.api) {
                this.api.asc_setDefaultLanguage(value);
                if (value !== parseInt(sessionValue)) {
                    Common.Utils.InternalSettings.set("sse-spellcheck-locale", value);
                }
                isApply = false;
            }
        },

        onSelectLanguage: function (combo, record) {
            var lang = record.value;
            if (this.api && lang) {
                this.api.asc_setDefaultLanguage(lang);
                var value = this.panelSpellcheck.cmbDictionaryLanguage.getValue();
                Common.localStorage.setItem("sse-spellcheck-locale", value);
                Common.Utils.InternalSettings.set("sse-spellcheck-locale", value);
            }
            Common.NotificationCenter.trigger('edit:complete', this, {restorefocus:true});
        },

        onClickChange: function (btn, e) {
            if (this.api) {
                var rec = this.panelSpellcheck.suggestionList.getSelectedRec();
                rec && this.api.asc_replaceMisspelledWord(rec.get('value'), this._currentSpellObj);
            }
            Common.NotificationCenter.trigger('edit:complete', this, {restorefocus:true});
        },

        onClickChangeMenu: function (menu, item) {
            if (this.api) {
                var rec = this.panelSpellcheck.suggestionList.getSelectedRec();
                if (item.value == 0) {
                    rec && this.api.asc_replaceMisspelledWord(rec.get('value'), this._currentSpellObj);
                } else if (item.value == 1) {
                    rec && this.api.asc_replaceMisspelledWord(rec.get('value'), this._currentSpellObj, true);
                }
            }
            Common.NotificationCenter.trigger('edit:complete', this, {restorefocus:true});
        },

        onClickIgnore: function () {
            if (this.api) {
                this.api.asc_ignoreMisspelledWord(this._currentSpellObj, false)
            }
            Common.NotificationCenter.trigger('edit:complete', this, {restorefocus:true});
        },

        onClickIgnoreMenu: function (menu, item) {
            if (this.api) {
                if (item.value == 0) {
                    this.api.asc_ignoreMisspelledWord(this._currentSpellObj, false);
                } else if (item.value == 1) {
                    this.api.asc_ignoreMisspelledWord(this._currentSpellObj, true);
                }
            }
            Common.NotificationCenter.trigger('edit:complete', this, {restorefocus:true});
        },

        onSpellCheckVariantsFound: function (property) {
            if (property===null && this._currentSpellObj === property && !(this.panelSpellcheck && this.panelSpellcheck.isVisible()))
                return;

            this._currentSpellObj = property;

            var arr = [],
                word;
            if (property) {
                word = property.get_Word();
                var variants = property.get_Variants();
                variants && variants.forEach(function (item) {
                    var rec = new Common.UI.DataViewModel();
                    rec.set({
                        value: item
                    });
                    arr.push(rec);
                });
            }
            var disabled = this.api.isCellEdited;
            this.panelSpellcheck.currentWord.setValue(word || '');
            this.panelSpellcheck.suggestionList.store.reset(arr);
            (arr.length>0) && this.panelSpellcheck.suggestionList.selectByIndex(0);
            this.panelSpellcheck.currentWord.setDisabled(!word || disabled);
            this.panelSpellcheck.btnChange.setDisabled(arr.length<1 || disabled);
            this.panelSpellcheck.btnIgnore.setDisabled(!word || disabled);
            this.panelSpellcheck.btnToDictionary.setDisabled(!word || disabled);
            this.panelSpellcheck.lblComplete.toggleClass('hidden', !property || !!word);
            this.panelSpellcheck.buttonNext.setDisabled(!this.panelSpellcheck.lblComplete.hasClass('hidden'));
        },

        onApiEditCell: function(state) {
            if (state == Asc.c_oAscCellEditorState.editEnd) {
                this.panelSpellcheck.buttonNext.setDisabled(!this.panelSpellcheck.lblComplete.hasClass('hidden'));
                this.panelSpellcheck.cmbDictionaryLanguage.setDisabled((this.languages && this.languages.length > 0) ? false : true);
            } else {
                this.panelSpellcheck.buttonNext.setDisabled(true);
                this.panelSpellcheck.currentWord.setDisabled(true);
                this.panelSpellcheck.btnChange.setDisabled(true);
                this.panelSpellcheck.btnIgnore.setDisabled(true);
                this.panelSpellcheck.btnToDictionary.setDisabled(true);
                this.panelSpellcheck.cmbDictionaryLanguage.setDisabled(true);
            }
        }

    }, SSE.Controllers.Spellcheck || {}));
});
