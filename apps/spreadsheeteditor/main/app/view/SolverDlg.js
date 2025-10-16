/*
 * (c) Copyright Ascensio System SIA 2010-2025
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
 *  SolverDlg.js
 *
 *  Created on 09.03.2025
 *
 */

define([
    'common/main/lib/view/AdvancedSettingsWindow',
], function () { 'use strict';

    SSE.Views.SolverDlg = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 450,
            id: 'window-solver'
        },

        initialize : function(options) {
            var me = this;

            _.extend(this.options, {
                title: this.textTitle,
                buttons: [{value: 'reset', caption: this.textResetAll, cls: 'float-left', id: 'solver-dlg-btn-reset'},{value: 'ok', caption: this.textSolve},{value: 'close', caption: this.closeButtonText}],
                footerCls: 'right',
                contentStyle: 'padding: 5px 5px 0;',
                contentTemplate: _.template([
                    '<div class="settings-panel active">',
                        '<div class="inner-content">',
                            '<table cols="1" style="width: 100%;">',
                                '<tr>',
                                    '<td>',
                                        '<label class="input-label">', me.textObjective, '</label>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small" width="200">',
                                        '<div id="solver-dlg-txt-objective" class="" style=""></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                '<tr>',
                                    '<td class="padding-small display-flex-row-center">',
                                        '<label class="header margin-right-5" style="flex-grow: 1;">' + me.textTo + '</label>',
                                        '<div id="solver-dlg-radio-max" class="margin-right-10"></div>',
                                        '<div id="solver-dlg-radio-min" class="margin-right-10"></div>',
                                        '<div id="solver-dlg-radio-value" class="margin-right-10"></div>',
                                        '<div id="solver-dlg-txt-value" class="" style=""></div>',
                                '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td>',
                                        '<label class="input-label">', me.textVars, '</label>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small" width="200">',
                                        '<div id="solver-dlg-txt-vars" class="" style=""></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<label class="input-label">', me.textConstraints, '</label>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<button type="button" class="btn btn-text-default auto margin-right-5" id="solver-dlg-btn-add" style="min-width: 85px;">', me.textAdd, '</button>',
                                        '<button type="button" class="btn btn-text-default auto margin-right-5" id="solver-dlg-btn-edit" style="min-width: 85px;">', me.textEdit, '</button>',
                                        '<button type="button" class="btn btn-text-default auto float-right" id="solver-dlg-btn-delete" style="min-width: 85px;">', me.textDelete, '</button>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<div id="solver-dlg-constraints" class="" style="width:100%; height: 93px;"></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<div id="solver-dlg-chb-non-negative"></div>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small display-flex-row-center">',
                                        '<label class="header margin-right-5" style="flex-grow: 1;">' + me.textMethod + '</label>',
                                        '<div id="solver-dlg-cmb-solver" class="input-group-nr margin-right-7"></div>',
                                        '<button type="button" class="btn btn-text-default auto" id="solver-dlg-btn-options" style="min-width: 85px;">' + me.textOptions + '</button>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="">',
                                        '<label style="display: inline;opacity: 0.7;" class="margin-right-5">' + this.textMethodDesc + '</label>',
                                        '<label id="solver-dlg-readmore" style="opacity: 0.7;" class="link">' + this.textReadMore + '</label>',
                                    '</td>',
                                '</tr>',
                                '<tr>',
                                    '<td class="padding-small">',
                                        '<label id="solver-dlg-not-supported" style="display: inline;opacity: 0.7;" class="margin-right-5"></label>',
                                    '</td>',
                                '</tr>',
                            '</table>',
                        '</div></div>'
                ].join(''))({scope: this})
            }, options);

            this.handler    = options.handler;

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);

            this.api = this.options.api;
            this.lang = this.options.lang;
            this.props = this.options.props;
            this._constraintOperator = {};
            this._maxConstraintIndex = 0;
            let obj = AscCommonExcel.c_oAscOperator;
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (key==='integer')
                        this._constraintOperator[obj[key]] = this.textInt;
                    else if (key==='bin')
                        this._constraintOperator[obj[key]] = this.textBin;
                    else if (key==='diff')
                        this._constraintOperator[obj[key]] = this.textDif;
                    else
                        this._constraintOperator[obj[key]] = key;
                }
            }

        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this,
                $window = this.getChild();

            this.txtObjectiveRange = new Common.UI.InputFieldBtn({
                el          : $window.find('#solver-dlg-txt-objective'),
                name        : 'range',
                style       : 'width: 100%;',
                btnHint     : this.textSelectData,
                allowBlank  : true
                // validateOnChange: true
            });
            this.txtObjectiveRange.on('button:click', _.bind(this.onSelectObjectiveData, this));
            this.txtObjectiveRange.on('changed:after', _.bind(this.onObjectiveChanged, this));

            this.txtVarsRange = new Common.UI.InputFieldBtn({
                el          : $window.find('#solver-dlg-txt-vars'),
                name        : 'range',
                style       : 'width: 100%;',
                btnHint     : this.textSelectData,
                allowBlank  : true
                // validateOnChange: true
            });
            this.txtVarsRange.on('button:click', _.bind(this.onSelectVarsData, this));
            this.txtVarsRange.on('changed:after', _.bind(this.onVarsChanged, this));

            this.radioMax = new Common.UI.RadioBox({
                el: $window.find('#solver-dlg-radio-max'),
                labelText: this.textMax,
                name: 'asc-radio-solver-to',
                value: AscCommonExcel.c_oAscOptimizeTo.max
            });
            this.radioMax.on('change', _.bind(this.onRadioToChange, this));

            this.radioMin = new Common.UI.RadioBox({
                el: $window.find('#solver-dlg-radio-min'),
                labelText: this.textMin,
                name: 'asc-radio-solver-to',
                value: AscCommonExcel.c_oAscOptimizeTo.min
            });
            this.radioMin.on('change', _.bind(this.onRadioToChange, this));

            this.radioValue = new Common.UI.RadioBox({
                el: $window.find('#solver-dlg-radio-value'),
                labelText: this.textValueOf,
                name: 'asc-radio-solver-to',
                value: AscCommonExcel.c_oAscOptimizeTo.valueOf
            });
            this.radioValue.on('change', _.bind(this.onRadioToChange, this));

            this.txtValue = new Common.UI.InputField({
                el          : $window.find('#solver-dlg-txt-value'),
                style       : 'width: 100px;',
                maskExp     : /[0-9,\.\-]/,
                validateOnBlur: false,
                hideErrorOnInput: true
            });
            this.txtValue.on('changed:after', _.bind(this.onValueChanged, this));
            this.constrainsList = new Common.UI.ListView({
                el: $window.find('#solver-dlg-constraints'),
                store: new Common.UI.DataViewStore(),
                emptyText: this.textEmptyList,
                scrollAlwaysVisible: true,
                itemTemplate: _.template('<div id="<%= id %>" class="list-item" style="min-height: 15px;">' +
                                            '<%= Common.Utils.String.htmlEncode(cellRef) %> <%= operatorName %> <%= Common.Utils.String.htmlEncode(constraint) %>' +
                                        '</div>'),
                tabindex:1
            });
            this.constrainsList.onKeyDown = _.bind(this.onListKeyDown, this);
            // this.constrainsList.on('item:select', _.bind(this.onSelectConstrains, this));

            this.btnAdd = new Common.UI.Button({
                el: $window.find('#solver-dlg-btn-add')
            });
            this.btnAdd.on('click', _.bind(this.onAddConstrains, this, false));

            this.btnDelete = new Common.UI.Button({
                el: $window.find('#solver-dlg-btn-delete')
            });
            this.btnDelete.on('click', _.bind(this.onDeleteConstrains, this));

            this.btnEdit = new Common.UI.Button({
                el: $window.find('#solver-dlg-btn-edit')
            });
            this.btnEdit.on('click', _.bind(this.onEditConstrains, this, false));

            this.cmbSolver = new Common.UI.ComboBox({
                el: $window.find('#solver-dlg-cmb-solver'),
                style: 'width: 100px;',
                menuStyle: 'min-width: 100%;',
                editable: false,
                cls: 'input-group-nr',
                data: [
                    {value: AscCommonExcel.c_oAscSolvingMethod.simplexLP, displayValue: this.textSimplex}
                ],
                takeFocusOnClose: true
            });
            this.cmbSolver.on('selected', _.bind(me.onSelectSolver, this));

            this.btnOptions = new Common.UI.Button({
                el: $window.find('#solver-dlg-btn-options')
            });
            this.btnOptions.on('click', _.bind(this.onOptions, this, false));

            this.chNonNegative = new Common.UI.CheckBox({
                el: $window.find('#solver-dlg-chb-non-negative'),
                labelText: this.textNonNegative,
                value: 'checked'
            });
            this.chNonNegative.on('change', _.bind(me.onNonNegative, this));

            $window.find('#solver-dlg-readmore').on('click', function (e) {
                me.showHelp();
            });

            var lblNotSupported = $window.find('#solver-dlg-not-supported');
            lblNotSupported.html(this.textNotSupported.replace(/%1/g, '<span class="link">' + this.textTellUs + '</span>'));
            lblNotSupported.find('span').on('click', function (e) {
                window.open('{{SUGGEST_URL}}', "_blank");
            });

            this.btnOk = _.find(this.getFooterButtons(), function (item) {
                return (item.$el && item.$el.find('.primary').addBack().filter('.primary').length>0);
            }) || new Common.UI.Button({ el: this.$window.find('.primary') });
            this.btnReset = $window.find('#solver-dlg-btn-reset');

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [this.txtObjectiveRange, this.radioMax, this.radioMin, this.radioValue, this.txtValue, this.txtVarsRange, this.btnAdd, this.btnEdit, this.btnDelete,
                    this.constrainsList, this.chNonNegative, this.cmbSolver, this.btnOptions].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.txtObjectiveRange;
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        onDlgBtnClick: function(event) {
            var state = (typeof(event) == 'object') ? event.currentTarget.attributes['result'].value : event;
            var me = this;
            if (state==='reset') {
                Common.UI.warning({
                    msg: this.textConfirmReset,
                    maxwidth: 600,
                    buttons: [{value: 'ok', caption: this.textReset}, 'cancel'],
                    callback: function(btn){
                        if (btn=='ok') {
                            me.props.resetAll();
                            me.fillControls(me.props);
                        } else
                            me.btnReset.focus();
                    }
                });
                return;
            }
            if (state == 'ok') {
                if (!this.isRangeValid()) return;

                var method = this.props.getSolvingMethod();
                if (this.originalMethod!==AscCommonExcel.c_oAscSolvingMethod.simplexLP && method===AscCommonExcel.c_oAscSolvingMethod.simplexLP) {
                    // method is changed to simplex LP
                    Common.UI.warning({
                        msg: this.textConfirmChangeMethod.replace(/%1/g, method===AscCommonExcel.c_oAscSolvingMethod.grgNonlinear ? this.textNonlinear : this.textEvolutionary),
                        maxwidth: 600,
                        buttons: ['ok', 'cancel'],
                        callback: function(btn){
                            if (btn=='ok') {
                                me.handler && me.handler.call(me, state, me.getSettings());
                                me.close();
                            } else
                                me.btnOk.focus();
                        }
                    });
                } else {
                    this.handler && this.handler.call(this, state,  (state == 'ok') ? this.getSettings() : undefined);
                    this.close();
                }
            } else
                this.close();
        },

        _setDefaults: function () {
            this.fillControls(this.props);
        },

        getSettings: function () {
            return this.props;
        },

        fillControls: function(props) {
            if (props){
                var value = props.getObjectiveFunction();
                this.txtObjectiveRange.setValue(value || '');

                value = props.getChangingCells();
                this.txtVarsRange.setValue(value || '');

                value = props.getOptimizeResultTo();
                (value===AscCommonExcel.c_oAscOptimizeTo.max) && this.radioMax.setValue(true, true);
                (value===AscCommonExcel.c_oAscOptimizeTo.min) && this.radioMin.setValue(true, true);
                (value===AscCommonExcel.c_oAscOptimizeTo.valueOf) && this.radioValue.setValue(true, true);
                this.txtValue.setDisabled(value!==AscCommonExcel.c_oAscOptimizeTo.valueOf);

                this.chNonNegative.setValue(this.props.getVariablesNonNegative(), true);

                value = this.props.getSolvingMethod();
                if (this.originalMethod===undefined)
                    this.originalMethod = value;
                if (value !== AscCommonExcel.c_oAscSolvingMethod.simplexLP) {
                    this.cmbSolver.setData([
                        {value: AscCommonExcel.c_oAscSolvingMethod.simplexLP, displayValue: this.textSimplex},
                        {value: value, displayValue: value===AscCommonExcel.c_oAscSolvingMethod.grgNonlinear ? this.textNonlinear : this.textEvolutionary},
                    ]);
                    this.btnOk.setDisabled(true);
                }
                this.cmbSolver.setValue(value);

                this.updateConstrainsList();
            }
            this.updateButtons();
        },

        onRadioToChange: function(field, newValue, eOpts) {
            if (newValue) {
                this.props.setOptimizeResultTo(field.options.value);
                this.txtValue.setDisabled(field.options.value!==AscCommonExcel.c_oAscOptimizeTo.valueOf);
            }
        },

        onValueChanged: function(input, newValue, oldValue) {
            (newValue !== oldValue) && this.props.setValueOf(newValue);
        },

        onNonNegative: function(field, newValue, oldValue, eOpts){
            this.props.setVariablesNonNegative(field.getValue()==='checked');
        },

        onSelectObjectiveData: function(input) {
            var me = this;
            if (me.api) {
                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        input.setValue(dlg.getSettings());
                        me.onObjectiveChanged(input, dlg.getSettings());
                    }
                };

                var win = new SSE.Views.CellRangeDialog({
                    handler: handlerDlg
                }).on('close', function() {
                    me.show();
                });

                var xy = Common.Utils.getOffset(me.$window);
                me.hide();
                win.show(me.$window, xy);
                win.setSettings({
                    api     : me.api,
                    range   : input.getValue(),
                    type    : Asc.c_oAscSelectionDialogType.Chart,
                    validation: function() {return true;}
                });
            }
        },

        onObjectiveChanged: function(input, newValue, oldValue) {
            this.props.setObjectiveFunction(newValue);
        },

        onSelectVarsData: function(input) {
            var me = this;
            if (me.api) {
                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        input.setValue(dlg.getSettings());
                        me.onVarsChanged(input, dlg.getSettings());
                    }
                };

                var win = new SSE.Views.CellRangeDialog({
                    handler: handlerDlg
                }).on('close', function() {
                    me.show();
                });

                var xy = Common.Utils.getOffset(me.$window);
                me.hide();
                win.show(me.$window, xy);
                win.setSettings({
                    api     : me.api,
                    range   : input.getValue(),
                    type    : Asc.c_oAscSelectionDialogType.Chart,
                    validation: function() {return true;}
                });
            }
        },

        onVarsChanged: function(input, newValue, oldValue) {
            this.props.setChangingCells(newValue);
        },

        onListKeyDown: function (e, data) {
            if (_.isUndefined(data)) data = e;

            if (data.keyCode==Common.UI.Keys.DELETE && !this.btnDelete.isDisabled()) {
                this.onDeleteConstrains();
            } else {
                Common.UI.DataView.prototype.onKeyDown.call(this.constrainsList, e, data);
            }
        },

        onAddConstrains: function() {
            var me = this,
                index = me._maxConstraintIndex,
                needUpdate = false;
            var handlerDlg = function(dlg, result) {
                if (result === 'ok' || result==='add') {
                    me.props.addConstraint(++index, dlg.getSettings());
                    needUpdate = true;
                }
            };
            var win = new SSE.Views.ConstraintDialog({
                handler: handlerDlg,
                isEdit: false,
                api: me.api,
                constraintOperator: me._constraintOperator
            }).on('close', function() {
                if (needUpdate) {
                    me.updateConstrainsList(index);
                    me.updateButtons();
                }
                me.show();
            });

            var xy = Common.Utils.getOffset(me.$window);
            me.hide();
            win.show(me.$window, xy);
            win.setSettings({cellRef: '', operator: AscCommonExcel.c_oAscOperator['<='], constraint: ''});
        },

        onDeleteConstrains: function() {
            var rec = this.constrainsList.getSelectedRec();
            if (rec) {
                var index = _.indexOf(this.constrainsList.store.models, rec);
                index = this.constrainsList.store.at(Math.max(0, index-1)).get('index');
                this.props.removeConstraint(rec.get('index'));
                this.updateConstrainsList(index);
                this.updateButtons();
            }
        },

        onEditConstrains: function() {
            var rec = this.constrainsList.getSelectedRec();
            if (rec) {
                var me = this,
                    index = rec.get('index'),
                    changed = false,
                    needUpdate = false;
                var handlerDlg = function(dlg, result) {
                    if (result === 'ok' || result==='add') {
                        if (!changed) {
                            me.props.editConstraint(index, dlg.getSettings());
                            changed = true;
                            index = me._maxConstraintIndex;
                        } else {
                            me.props.addConstraint(++index, dlg.getSettings());
                        }
                        needUpdate = true;
                    }
                };
                var win = new SSE.Views.ConstraintDialog({
                    handler: handlerDlg,
                    isEdit: true,
                    api: me.api,
                    constraintOperator: me._constraintOperator
                }).on('close', function() {
                    if (needUpdate) {
                        me.updateConstrainsList(rec.get('index'));
                        me.updateButtons();
                    }
                    me.show();
                });

                var xy = Common.Utils.getOffset(me.$window);
                me.hide();
                win.show(me.$window, xy);
                win.setSettings({cellRef: rec.get('cellRef'), operator: rec.get('operator'), constraint: rec.get('constraint')});
            }
        },

        updateButtons: function() {
            var disabled = this.constrainsList.store.length<1 || !this.constrainsList.getSelectedRec();
            this.btnEdit.setDisabled(disabled);
            this.btnDelete.setDisabled(disabled);
        },

        updateConstrainsList: function(idx) {
            var me = this,
                arr = [],
                store = this.constrainsList.store,
                constaints = this.props.getConstraints();
            me._maxConstraintIndex = 0;
            constaints && constaints.forEach(function(item, index) {
                arr.push({
                    cellRef: item.cellRef,
                    index: index,
                    constraint: item.constraint,
                    operator: item.operator,
                    operatorName: me._constraintOperator[item.operator]
                });
                if (me._maxConstraintIndex<index)
                    me._maxConstraintIndex = index;
            });
            store.reset(arr);
            if (store.length>0) {
                var rec = (idx!==undefined) ? this.constrainsList.store.findWhere({index: idx}) : null;
                rec ? this.constrainsList.selectRecord(rec) : this.constrainsList.selectByIndex(0);
            }
        },

        onSelectSolver: function (cmb, record) {
            this.props.setSolvingMethod(record.value);
            this.btnOk.setDisabled(record.value !== AscCommonExcel.c_oAscSolvingMethod.simplexLP);
        },

        onOptions: function() {
            var win,
                me = this;
            win = new SSE.Views.SolverMethodDialog({
                handler: function(dlg, result) {
                    if (result == 'ok') {
                        dlg.getSettings();
                    }
                }
            }).on('close', function() {
                me.show();
            });
            var xy = Common.Utils.getOffset(me.$window);
            me.hide();
            win.show(me.$window, xy);
            win.setSettings(this.props.getOptions());
        },

        showHelp: function() {
            var lang = (this.lang) ? this.lang.split(/[\-\_]/)[0] : 'en',
                me = this,
                name = '/ProgramInterface/DataTab.htm',
                url = 'resources/help/' + lang + name;

            if ( Common.Controllers.Desktop.isActive() ) {
                if ( Common.Controllers.Desktop.isHelpAvailable() )
                    url = Common.Controllers.Desktop.helpUrl() + name;
                else {
                    const helpCenter = Common.Utils.InternalSettings.get('url-help-center');
                    if ( helpCenter ) {
                        const _url_obj = new URL(helpCenter);
                        window.open(_url_obj.toString(), '_blank');
                    }
                    return;
                }
            }

            fetch(url).then(function(response){
                if ( response.ok ) {
                    window.open(url);
                } else {
                    url = 'resources/help/' + '{{DEFAULT_LANG}}' + name;
                    fetch(url).then(function(response){
                        if ( response.ok ) {
                            window.open(url);
                        }
                    });
                }
            });
        },

        isRangeValid: function() {
            var isvalid = true,
                txtError = '',
                value;

            if (_.isEmpty(this.txtObjectiveRange.getValue())) {
                isvalid = false;
                txtError = this.txtEmpty;
            } else {
                value = this.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.Chart, this.txtObjectiveRange.getValue(), true);
                if (value != Asc.c_oAscError.ID.No) {
                    txtError = ''; // check errors
                    isvalid = false;
                }
            }
            if (!isvalid) {
                this.txtObjectiveRange.showError([txtError]);
                this.txtObjectiveRange.focus();
                return isvalid;
            }

            if (!this.txtValue.isDisabled()) {
                if (_.isEmpty(this.txtValue.getValue())) {
                    isvalid = false;
                    txtError = this.txtEmpty;
                } else if (!Common.UI.isValidNumber(this.txtValue.getValue())) {
                    isvalid = false;
                    txtError = this.txtErrorNumber;
                }
                if (!isvalid) {
                    this.txtValue.showError([txtError]);
                    this.txtValue.focus();
                    return isvalid;
                }

            }

            if (_.isEmpty(this.txtVarsRange.getValue())) {
                isvalid = false;
                txtError = this.txtEmpty;
            } else {
                value = this.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.Chart, this.txtVarsRange.getValue(), true);
                if (value != Asc.c_oAscError.ID.No) {
                    txtError = ''; // check errors
                    isvalid = false;
                }
            }
            if (!isvalid) {
                this.txtVarsRange.showError([txtError]);
                this.txtVarsRange.focus();
                return isvalid;
            }

            return isvalid;
        },

    }, SSE.Views.SolverDlg || {}))
});
