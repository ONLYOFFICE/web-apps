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
 *    FormulaDialog.js
 *
 *    Formula Dialog Controller
 *
 *    Created by Alexey.Musinov on  14/04/2014
 *    Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'spreadsheeteditor/main/app/collection/FormulaGroups',
    'spreadsheeteditor/main/app/view/FormulaDialog'
], function () {
    'use strict';

    SSE.Controllers = SSE.Controllers || {};

    SSE.Controllers.FormulaDialog = Backbone.Controller.extend({
        models: [],
        views: [
            'FormulaDialog'
        ],
        collections: [
            'FormulaGroups'
        ],

        initialize: function () {
            var me = this;
            me.langJson = {};
            me.langDescJson = {};

            this.addListeners({
                'FileMenu': {
                    'settings:apply': function() {
                        me.needUpdateFormula = true;

                        var lang = Common.localStorage.getItem("sse-settings-func-locale");
                        Common.Utils.InternalSettings.set("sse-settings-func-locale", lang);

                        me.formulasGroups.reset();
                        me.reloadTranslations(lang);
                    }
                }
            });
        },

        setApi: function (api) {
            this.api = api;

            if (this.formulasGroups && this.api) {
                this.reloadTranslations(
                    Common.localStorage.getItem("sse-settings-func-locale") || this.appOptions.lang );

                var me = this;

                this.formulas = new SSE.Views.FormulaDialog({
                    api             : this.api,
                    toolclose       : 'hide',
                    formulasGroups  : this.formulasGroups,
                    handler         : function (func) {
                        if (func) {
                            me.api.asc_insertFormula(func, Asc.c_oAscPopUpSelectorType.Func);
                        }
                    }
                });

                this.formulas.on({
                    'hide': function () {
                        me.api.asc_enableKeyEvents(true);
                    }
                });
            }

            return this;
        },

        setMode: function(mode) {
            return this;
        },

        onLaunch: function () {
            this.formulasGroups = this.getApplication().getCollection('FormulaGroups');

            Common.Gateway.on('init', this.loadConfig.bind(this));
        },

        loadConfig: function(data) {
            this.appOptions = {};
            this.appOptions.lang = data.config.lang;
        },

        reloadTranslations: function (lang) {
            var me = this;
            lang = (lang || 'en').split(/[\-_]/)[0].toLowerCase();

            Common.Utils.InternalSettings.set("sse-settings-func-locale", lang);
            if (me.langJson[lang]) {
                me.api.asc_setLocalization(me.langJson[lang]);
                Common.NotificationCenter.trigger('formula:settings', this);
            } else if (lang == 'en') {
                me.api.asc_setLocalization(undefined);
                Common.NotificationCenter.trigger('formula:settings', this);
            } else {
                Common.Utils.loadConfig('resources/formula-lang/' + lang + '.json',
                    function (config) {
                        if ( config != 'error' ) {
                            me.langJson[lang] = config;
                            me.api.asc_setLocalization(config);
                            Common.NotificationCenter.trigger('formula:settings', this);
                        }
                    });
            }

            if (me.langDescJson[lang])
                me.loadingFormulas(me.langDescJson[lang]);
            else  {
                Common.Utils.loadConfig('resources/formula-lang/' + lang + '_desc.json',
                    function (config) {
                        if ( config != 'error' ) {
                            me.langDescJson[lang] = config;
                            me.loadingFormulas(config);
                        } else {
                            Common.Utils.loadConfig('resources/formula-lang/en_desc.json',
                                function (config) {
                                    me.langDescJson[lang] = (config != 'error') ? config : null;
                                    me.loadingFormulas(me.langDescJson[lang]);
                                });
                        }
                    });
            }
        },

        getDescription: function(lang) {
            if (!lang) return '';
            lang = lang.toLowerCase() ;

            if (this.langDescJson[lang])
                return this.langDescJson[lang];
            return null;
        },

        showDialog: function () {
            if (this.formulas) {
                if ( this.needUpdateFormula ) {
                    this.needUpdateFormula = false;

                    if (this.formulas.$window) {
                        this.formulas.fillFormulasGroups();
                        this.formulas.fillFunctions('All');
                    }
                }
                this.formulas.show();
            }
        },
        hideDialog: function () {
            if (this.formulas && this.formulas.isVisible()) {
                this.formulas.hide();
            }
        },

        loadingFormulas: function (descrarr) {
            var i = 0, j = 0,
                ascGroupName,
                ascFunctions,
                functions,
                store = this.formulasGroups,
                formulaGroup = null,
                index = 0,
                funcInd = 0,
                info = null,
                allFunctions = [],
                allFunctionsGroup = null,
                separator = this.api.asc_getFunctionArgumentSeparator();

            if (store) {
                allFunctionsGroup = new SSE.Models.FormulaGroup ({
                    name    : 'All',
                    index   : index,
                    store   : store
                });

                if (allFunctionsGroup) {
                    index += 1;

                    store.push(allFunctionsGroup);

                    info = this.api.asc_getFormulasInfo();

                    for (i = 0; i < info.length; i += 1) {
                        ascGroupName = info[i].asc_getGroupName();
                        ascFunctions = info[i].asc_getFormulasArray();

                        formulaGroup = new SSE.Models.FormulaGroup({
                            name  : ascGroupName,
                            index : index,
                            store : store
                        });

                        index += 1;

                        functions = [];

                        for (j = 0; j < ascFunctions.length; j += 1) {
                            var funcname = ascFunctions[j].asc_getName();
                            var func = new SSE.Models.FormulaModel({
                                index : funcInd,
                                group : ascGroupName,
                                name  : ascFunctions[j].asc_getLocaleName(),
                                args  : ((descrarr && descrarr[funcname]) ? descrarr[funcname].a : '').replace(/[,;]/g, separator),
                                desc  : (descrarr && descrarr[funcname]) ? descrarr[funcname].d : ''
                            });

                            funcInd += 1;

                            functions.push(func);
                            allFunctions.push(func);
                        }

                        formulaGroup.set('functions', functions);
                        store.push(formulaGroup);
                    }

                    allFunctionsGroup.set('functions',
                       _.sortBy(allFunctions, function (model) {return model.get('name'); }));
                }
            }
        }
    });
});
