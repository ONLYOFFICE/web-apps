/**
 *    FormulaDialog.js
 *
 *    Formula Dialog Controller
 *
 *    Created by Alexey.Musinov on  14/04/2014
 *    Copyright (c) 2014 Ascensio System SIA. All rights reserved.
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
            this.addListeners({
                'FileMenu': {
                    'settings:apply': function() {
                        me.needUpdateFormula = true;
                    }
                }
            });
        },

        setApi: function (api) {
            this.api = api;

            if (this.formulasGroups && this.api) {
                this.loadingFormulas();

                var me = this;

                this.formulas = new SSE.Views.FormulaDialog({
                    api             : this.api,
                    toolclose       : 'hide',
                    formulasGroups  : this.formulasGroups,
                    handler         : function (func) {
                        if (func && me.api) {
                            me.api.asc_insertFormula(func, c_oAscPopUpSelectorType.Func);
                        }
                    }
                });

                this.formulas.on({
                    'hide': function () {
                        if (me.api) {
                            me.api.asc_enableKeyEvents(true);
                        }
                    }
                });
            }

            return this;
        },

        onLaunch: function () {
            this.formulasGroups = this.getApplication().getCollection('FormulaGroups');
        },

        showDialog: function () {
            if (this.formulas) {
                if (this.needUpdateFormula)
                    this.updateFormulas();
                this.needUpdateFormula = false;
                this.formulas.show();
            }
        },
        hideDialog: function () {
            if (this.formulas && this.formulas.isVisible()) {
                this.formulas.hide();
            }
        },

        loadingFormulas: function () {
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
                allFunctionsGroup = null;

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
                            var func = new SSE.Models.FormulaModel({
                                index : funcInd,
                                group : ascGroupName,
                                name  : ascFunctions[j].asc_getName(),
                                args  : ascFunctions[j].asc_getArguments()
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
        },

        updateFormulas: function () {
            this.formulasGroups.reset();
            this.loadingFormulas();
            if (this.formulas.$window) {
                this.formulas.fillFormulasGroups();
                this.formulas.fillFunctions('All');
            }
        }
    });
});
