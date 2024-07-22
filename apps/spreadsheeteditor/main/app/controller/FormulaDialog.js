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
 *    FormulaDialog.js
 *
 *    Formula Dialog Controller
 *
 *    Created on  14/04/2014
 *
 */

define([
    'core',
    'spreadsheeteditor/main/app/collection/FormulaGroups',
    'spreadsheeteditor/main/app/view/FormulaDialog',
    'spreadsheeteditor/main/app/view/FormulaTab'
], function () {
    'use strict';

    SSE.Controllers = SSE.Controllers || {};

    SSE.Controllers.FormulaDialog = Backbone.Controller.extend(_.extend({
        models: [],
        views: [
            'FormulaDialog',
            'FormulaTab'
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
                },
                'FormulaTab': {
                    'function:apply': this.applyFunction,
                    'function:calculate': this.onCalculate,
                    'function:watch': this.onWatch,
                    'function:precedents': this.onPrecedents,
                    'function:dependents': this.onDependents,
                    'function:remove-arrows': this.onRemArrows,
                    'function:showformula': this.onShowFormula
                },
                'Toolbar': {
                    'function:apply': this.applyFunction,
                    'tab:active': this.onTabActive
                },
                'Statusbar': {
                    'sheet:changed': this.onApiSheetChanged.bind(this)
                }
            });
        },

        applyFunction: function(func, autocomplete, group) {
            if (func) {
                if (func.origin === 'more') {
                    this.showDialog(group);
                } else {
                    if (autocomplete)
                        this.api.asc_insertInCell(func.name, Asc.c_oAscPopUpSelectorType.Func, !!autocomplete);
                    else
                        this.api.asc_startWizard(func.name, this._cleanCell);
                    !autocomplete && this.updateLast10Formulas(func.origin);
                }
            }
        },

        setConfig: function(config) {
            this.toolbar = config.toolbar;
            this.formulaTab = this.createView('FormulaTab', {
                toolbar: this.toolbar.toolbar,
                formulasGroups: this.formulasGroups
            });
            return this;
        },

        setApi: function (api) {
            this.api = api;

            if (this.formulasGroups) {
                Common.Utils.InternalSettings.set("sse-settings-func-last", Common.localStorage.getItem("sse-settings-func-last"));
                this.reloadTranslations(Common.localStorage.getItem("sse-settings-func-locale") || this.appOptions.lang, true);

                if (!this.mode.isEdit) return;

                var me = this;

                this.formulas = new SSE.Views.FormulaDialog({
                    api             : this.api,
                    toolclose       : 'hide',
                    formulasGroups  : this.formulasGroups,
                    handler         : _.bind(this.applyFunction, this)
                });
                this.formulas.on({
                    'hide': function () {
                        me._cleanCell = undefined; // _cleanCell - clean cell when change formula in formatted table total row
                    }
                });
            }

            if (this.formulaTab) {
                this.formulaTab.setApi(this.api);
                this.api.asc_registerCallback('asc_onWorksheetLocked',        this.onWorksheetLocked.bind(this));
                this.api.asc_registerCallback('asc_onSheetsChanged',          this.onApiSheetChanged.bind(this));
                this.api.asc_registerCallback('asc_onUpdateFormulasViewSettings', this.onUpdateFormulasViewSettings.bind(this));
                this.onApiSheetChanged();
            }
            this.api.asc_registerCallback('asc_onSendFunctionWizardInfo', _.bind(this.onSendFunctionWizardInfo, this));
            this.api.asc_registerCallback('asc_onAddCustomFunction', _.bind(this.onAddCustomFunction, this));

            return this;
        },

        setMode: function(mode) {
            this.mode = mode;
            return this;
        },

        onLaunch: function () {
            this.formulasGroups = this.getApplication().getCollection('FormulaGroups');
            SSE.Collections.formulasLangs = ['en', 'be', 'bg', 'ca', 'zh', 'cs', 'da', 'nl', 'fi', 'fr', 'de', 'el', 'hu', 'hy', 'id', 'it', 'ja',
                                            'ko', 'lv', 'lo', 'nb', 'pl', 'pt-br', 'pt', 'ro', 'ru', 'sk', 'sl', 'sv', 'es', 'tr', 'uk', 'vi'];

            var descriptions = ['Financial', 'Logical', 'TextAndData', 'DateAndTime', 'LookupAndReference', 'Mathematic', 'Cube', 'Database', 'Engineering',  'Information',
                 'Statistical', 'Last10'];

            Common.Gateway.on('init', this.loadConfig.bind(this));
        },

        loadConfig: function(data) {
            this.appOptions = {};
            this.appOptions.lang = data.config.lang;
        },

        reloadTranslations: function (lang, suppressEvent) {
            lang = (lang || 'en').toLowerCase();
            var index = _.indexOf(SSE.Collections.formulasLangs, lang);
            if (index<0) {
                lang = lang.split(/[\-_]/)[0];
                index = _.indexOf(SSE.Collections.formulasLangs, lang);
            }
            lang = (index>=0) ? SSE.Collections.formulasLangs[index] : 'en';

            var me = this;
            Common.Utils.InternalSettings.set("sse-settings-func-locale", lang);
            if (me.langJson[lang]) {
                me.api.asc_setLocalization(me.langJson[lang], lang);
                Common.NotificationCenter.trigger('formula:settings', this);
            } else if (lang == 'en') {
                me.api.asc_setLocalization(undefined, lang);
                Common.NotificationCenter.trigger('formula:settings', this);
            } else {
                Common.Utils.loadConfig('resources/formula-lang/' + lang + '.json',
                    function (config) {
                        if ( config != 'error' ) {
                            me.langJson[lang] = config;
                            me.api.asc_setLocalization(config, lang);
                            Common.NotificationCenter.trigger('formula:settings', this);
                        }
                    });
            }

            if (!this.mode.isEdit) return;

            if (me.langDescJson[lang])
                me.loadingFormulas(me.langDescJson[lang], suppressEvent);
            else  {
                Common.Utils.loadConfig('resources/formula-lang/' + lang + '_desc.json',
                    function (config) {
                        if ( config != 'error' ) {
                            me.langDescJson[lang] = config;
                            me.loadingFormulas(config, suppressEvent);
                        } else {
                            Common.Utils.loadConfig('resources/formula-lang/en_desc.json',
                                function (config) {
                                    me.langDescJson[lang] = (config != 'error') ? config : null;
                                    me.loadingFormulas(me.langDescJson[lang], suppressEvent);
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

        showDialog: function (group, clean) {
            if (this.formulas) {
                if ( this.needUpdateFormula ) {
                    this.needUpdateFormula = false;

                    if (this.formulas.$window) {
                        this.formulas.fillFormulasGroups();
                    }
                }
                this._formulagroup = group;
                this._cleanCell = clean;
                this.api.asc_startWizard();
            }
        },

        onSendFunctionWizardInfo: function(props) {
            if (props) {
                // show formula settings
                var me = this;
                var name = props.asc_getName(),
                    origin = this.api.asc_getFormulaNameByLocale(name),
                    descrarr = this.getDescription(Common.Utils.InternalSettings.get("sse-settings-func-locale")),
                    custom = this.api.asc_getCustomFunctionInfo(origin),
                    args = '';
                if (custom) {
                    var arr_args = custom.asc_getArg() || [];
                    args = '(' + arr_args.map(function (item) { return item.asc_getIsOptional() ? '[' + item.asc_getName() + ']' : item.asc_getName(); }).join(this.api.asc_getFunctionArgumentSeparator() + ' ') + ')';
                }
                var funcprops = {
                        name: name,
                        origin: origin,
                        args: (descrarr && descrarr[origin]) ? descrarr[origin].a.replace(/[,;]/g, this.api.asc_getFunctionArgumentSeparator()) : args,
                        desc: (descrarr && descrarr[origin]) ? descrarr[origin].d : custom ? custom.asc_getDescription() || '' : '',
                        custom: !!custom
                    };

                (new SSE.Views.FormulaWizard({
                    api     : this.api,
                    lang    : this.appOptions.lang,
                    funcprops: funcprops,
                    props   : props,
                    handler : function(dlg, result, settings) {
                        if (result == 'ok') {
                        }
                    }
                })).show();
                this._cleanCell = undefined;
            } else
                this.formulas.show(this._formulagroup);
            this._formulagroup = undefined;
        },

        hideDialog: function () {
            if (this.formulas && this.formulas.isVisible()) {
                this.formulas.hide();
            }
        },

        updateLast10Formulas: function(formula) {
            var arr = Common.Utils.InternalSettings.get("sse-settings-func-last") || 'SUM;AVERAGE;IF;HYPERLINK;COUNT;MAX;SIN;SUMIF;PMT;STDEV';
            arr = arr.split(';');
            var idx = _.indexOf(arr, formula);
            arr.splice((idx<0) ? arr.length-1 : idx, 1);
            arr.unshift(formula);
            var val = arr.join(';');
            Common.localStorage.setItem("sse-settings-func-last", val);
            Common.Utils.InternalSettings.set("sse-settings-func-last", val);

            if (this.formulasGroups) {
                var group = this.formulasGroups.findWhere({name : 'Last10'});
                group && group.set('functions', this.loadingLast10Formulas(this.getDescription(Common.Utils.InternalSettings.get("sse-settings-func-locale"))));
                this.formulaTab && this.formulaTab.updateRecent();
            }
        },

        loadingLast10Formulas: function(descrarr) {
            var arr = (Common.Utils.InternalSettings.get("sse-settings-func-last") || 'SUM;AVERAGE;IF;HYPERLINK;COUNT;MAX;SIN;SUMIF;PMT;STDEV').split(';'),
                separator = this.api.asc_getFunctionArgumentSeparator(),
                functions = [],
                allFunctionsGroup = this.formulasGroups ? this.formulasGroups.findWhere({name : 'All'}) : null,
                allFunctions = allFunctionsGroup ? allFunctionsGroup.get('functions') : null;

            for (var j = 0; j < arr.length; j++) {
                var funcname = arr[j],
                    custom = descrarr && descrarr[funcname] ? null : this.api.asc_getCustomFunctionInfo(funcname),
                    desc = (descrarr && descrarr[funcname]) ? descrarr[funcname].d : custom ? custom.asc_getDescription() || '' : '',
                    args = '';
                if (custom) {
                    var arr_args = custom.asc_getArg() || [];
                    args = '(' + arr_args.map(function (item) { return item.asc_getIsOptional() ? '[' + item.asc_getName() + ']' : item.asc_getName(); }).join(this.api.asc_getFunctionArgumentSeparator() + ' ') + ')';
                }
                if (!desc && allFunctions && !_.find(allFunctions, function(item){ return item.get('origin')===funcname; }))
                    continue;
                functions.push(new SSE.Models.FormulaModel({
                    index : j,
                    group : 'Last10',
                    name  : this.api.asc_getFormulaLocaleName(funcname),
                    origin: funcname,
                    args  : (descrarr && descrarr[funcname]) ? descrarr[funcname].a.replace(/[,;]/g, separator) : args,
                    desc  : desc
                }));
            }
            return functions;
        },

        loadingFormulas: function (descrarr, suppressEvent) {
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
                last10FunctionsGroup = null,
                separator = this.api.asc_getFunctionArgumentSeparator();

            if (store) {
                ascGroupName = 'Last10';
                last10FunctionsGroup = new SSE.Models.FormulaGroup ({
                    name    : ascGroupName,
                    index   : index,
                    store   : store,
                    caption : this['sCategory' + ascGroupName] || ascGroupName
                });
                if (last10FunctionsGroup) {
                    store.push(last10FunctionsGroup);
                    index += 1;
                }

                ascGroupName = 'All';
                allFunctionsGroup = new SSE.Models.FormulaGroup ({
                    name    : ascGroupName,
                    index   : index,
                    store   : store,
                    caption : this['sCategory' + ascGroupName] || ascGroupName
                });
                if (allFunctionsGroup) {
                    store.push(allFunctionsGroup);
                    index += 1;
                }

                if (allFunctionsGroup) {
                    info = this.api.asc_getFormulasInfo();

                    for (i = 0; i < info.length; i += 1) {
                        ascGroupName = info[i].asc_getGroupName();
                        ascFunctions = info[i].asc_getFormulasArray();

                        formulaGroup = new SSE.Models.FormulaGroup({
                            name  : ascGroupName,
                            index : index,
                            store : store,
                            caption : this['sCategory' + ascGroupName] || ascGroupName
                        });

                        index += 1;

                        functions = [];

                        for (j = 0; j < ascFunctions.length; j += 1) {
                            var funcname = ascFunctions[j].asc_getName(),
                                custom = descrarr && descrarr[funcname] ? null : this.api.asc_getCustomFunctionInfo(funcname),
                                args = '';
                            if (custom) {
                                var arr_args = custom.asc_getArg() || [];
                                args = '(' + arr_args.map(function (item) { return item.asc_getIsOptional() ? '[' + item.asc_getName() + ']' : item.asc_getName(); }).join(this.api.asc_getFunctionArgumentSeparator() + ' ') + ')';
                            }

                            var func = new SSE.Models.FormulaModel({
                                index : funcInd,
                                group : ascGroupName,
                                name  : ascFunctions[j].asc_getLocaleName(),
                                origin: funcname,
                                args  : (descrarr && descrarr[funcname]) ? descrarr[funcname].a.replace(/[,;]/g, separator) : args,
                                desc  : (descrarr && descrarr[funcname]) ? descrarr[funcname].d : custom ? custom.asc_getDescription() || '' : ''
                            });

                            funcInd += 1;

                            functions.push(func);
                            allFunctions.push(func);
                        }

                        formulaGroup.set('functions', _.sortBy(functions, function (model) {return model.get('name'); }));
                        store.push(formulaGroup);
                    }

                    allFunctionsGroup.set('functions',
                       _.sortBy(allFunctions, function (model) {return model.get('name'); }));

                    last10FunctionsGroup && last10FunctionsGroup.set('functions', this.loadingLast10Formulas(descrarr));
                }
            }
            (!suppressEvent || this._formulasInited) && this.formulaTab && this.formulaTab.fillFunctions();
        },

        onAddCustomFunction: function() {
            this.needUpdateFormula = true;

            var i = 0, j = 0,
                customGroupName = 'Custom',
                ascFunctions,
                functions,
                store = this.formulasGroups,
                funcInd = 0,
                info = null,
                allFunctions = [],
                allFunctionsGroup = null,
                customFunctionsGroup = null;

            if (store) {
                allFunctionsGroup = this.formulasGroups.findWhere({name : 'All'});
                if (allFunctionsGroup) {
                    allFunctions = allFunctionsGroup.get('functions');
                    for (i = 0; i < allFunctions.length; i++) {
                        if (allFunctions[i].get('group')===customGroupName) {
                            allFunctions.splice(i, 1);
                            i--;
                        }
                    }
                }

                customFunctionsGroup = this.formulasGroups.findWhere({name : customGroupName});
                if (!customFunctionsGroup) {
                    customFunctionsGroup = new SSE.Models.FormulaGroup ({
                        name    : customGroupName,
                        index   : store.length,
                        store   : store,
                        caption : this['sCategory' + customGroupName] || customGroupName
                    });
                    store.push(customFunctionsGroup);
                }
                info = this.api.asc_getFormulasInfo();
                for (i = 0; i < info.length; i += 1) {
                    functions = [];
                    if (info[i].asc_getGroupName()===customGroupName) {
                        ascFunctions = info[i].asc_getFormulasArray();
                        for (j = 0; j < ascFunctions.length; j += 1) {
                            var funcname = ascFunctions[j].asc_getName(),
                                custom = this.api.asc_getCustomFunctionInfo(funcname),
                                args = '';
                            if (custom) {
                                var arr_args = custom.asc_getArg() || [];
                                args = '(' + arr_args.map(function (item) { return item.asc_getIsOptional() ? '[' + item.asc_getName() + ']' : item.asc_getName(); }).join(this.api.asc_getFunctionArgumentSeparator() + ' ') + ')';
                            }
                            var func = new SSE.Models.FormulaModel({
                                index : funcInd,
                                group : customGroupName,
                                name  : ascFunctions[j].asc_getLocaleName(),
                                origin: funcname,
                                args  : args,
                                desc  : custom ? custom.asc_getDescription() || '' : ''
                            });

                            funcInd += 1;

                            functions.push(func);
                            allFunctions.push(func);
                        }
                        customFunctionsGroup.set('functions', _.sortBy(functions, function (model) {return model.get('name'); }));
                        allFunctionsGroup.set('functions', _.sortBy(allFunctions, function (model) {return model.get('name'); }));
                        break;
                    }
                }
                this.formulaTab && this.formulaTab.updateCustom();

                var group = this.formulasGroups.findWhere({name : 'Last10'});
                group && group.set('functions', this.loadingLast10Formulas(this.getDescription(Common.Utils.InternalSettings.get("sse-settings-func-locale"))));
                this.formulaTab && this.formulaTab.updateRecent();
            }
        },

        onTabActive: function (tab) {
            if ( tab == 'formula' && !this._formulasInited && this.formulaTab) {
                this.formulaTab.fillFunctions();
                this._formulasInited = true;
            }
        },

        onCalculate: function(calc) {
            var type = calc.type;
            if (type === Asc.c_oAscCalculateType.All || type === Asc.c_oAscCalculateType.ActiveSheet) {
                this.api && this.api.asc_calculate(type);
            }
        },

        onWatch: function(state) {
            if (state) {
                var me = this;
                this._watchDlg = new SSE.Views.WatchDialog({
                    api: this.api,
                    handler: function(result) {
                        Common.NotificationCenter.trigger('edit:complete');
                    }
                });
                this._watchDlg.on('close', function(win){
                    me.formulaTab.btnWatch.toggle(false, true);
                    me._watchDlg = null;
                    Common.NotificationCenter.trigger('edit:complete');
                }).show();
            } else if (this._watchDlg)
                this._watchDlg.close();

        },

        onPrecedents: function(type){
            this.api && this.api.asc_TracePrecedents();
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onDependents: function(type){
            this.api && this.api.asc_TraceDependents();
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onRemArrows: function(type){
            this.api && this.api.asc_RemoveTraceArrows(type);
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onShowFormula: function(state) {
            this.api && this.api.asc_setShowFormulas(!!state);
            Common.NotificationCenter.trigger('edit:complete');
        },

        onWorksheetLocked: function(index,locked) {
            if (index == this.api.asc_getActiveWorksheetIndex() && this.formulaTab) {
                Common.Utils.lockControls(Common.enumLock.sheetLock, locked, {array: [this.formulaTab.btnShowFormulas]});
            }
        },

        onApiSheetChanged: function() {
            if (!this.mode || !this.mode.isEdit || this.mode.isEditDiagram || this.mode.isEditMailMerge || this.mode.isEditOle) return;

            this.formulaTab && this.formulaTab.btnShowFormulas.toggle(this.api.asc_getShowFormulas(), true);
            var currentSheet = this.api.asc_getActiveWorksheetIndex();
            this.onWorksheetLocked(currentSheet, this.api.asc_isWorksheetLockedOrDeleted(currentSheet));
        },

        onUpdateFormulasViewSettings: function() {
            if (!this.mode || !this.mode.isEdit || this.mode.isEditDiagram || this.mode.isEditMailMerge || this.mode.isEditOle) return;
            this.formulaTab && this.formulaTab.btnShowFormulas.toggle(this.api.asc_getShowFormulas(), true);
        },

        sCategoryAll:                   'All',
        sCategoryLast10:                '10 last used',
        sCategoryLogical:               'Logical',
        sCategoryCube:                  'Cube',
        sCategoryDatabase:              'Database',
        sCategoryDateAndTime:           'Date and time',
        sCategoryEngineering:           'Engineering',
        sCategoryFinancial:             'Financial',
        sCategoryInformation:           'Information',
        sCategoryLookupAndReference:    'Lookup and reference',
        sCategoryMathematic:            'Math and trigonometry',
        sCategoryStatistical:           'Statistical',
        sCategoryTextAndData:           'Text and data',
        sCategoryCustom:                'Custom'

    }, SSE.Controllers.FormulaDialog || {}));
});
