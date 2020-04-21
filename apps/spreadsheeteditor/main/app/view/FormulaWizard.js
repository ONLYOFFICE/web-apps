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
 *  FormulaWizard.js
 *
 *  Created by Julia Radzhabova on 17.04.20
 *  Copyright (c) 2020 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/component/Window',
    'common/main/lib/component/MetricSpinner'
], function () { 'use strict';

    SSE.Views.FormulaWizard = Common.UI.Window.extend(_.extend({
        options: {
            width: 420,
            height: 460,
            header: true,
            style: 'min-width: 350px;',
            cls: 'modal-dlg',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box" style="height:' + (this.options.height-103) + 'px;">',
                    '<label id="formula-wizard-name" style="display: block;margin-bottom: 8px;"></label>',
                    '<div id="formula-wizard-panel-args" style="border-bottom: 1px solid #cbcbcb;margin-bottom: 10px;">',
                        '<div style="height: 220px; overflow: hidden;position: relative;">',
                            '<table cols="3" id="formula-wizard-tbl-args" style="width: 100%;">',
                            '</table>',
                        '</div>',
                    '</div>',
                    '<div id="formula-wizard-panel-desc">',
                        '<label id="formula-wizard-value" style="display: block;margin-bottom: 8px;"><b>Formula result:</b></label>',
                        '<label id="formula-wizard-arg-desc" style="display: block;margin-bottom: 8px;"><b>Argument 1:</b></label>',
                        '<label id="formula-wizard-args" style="display: block;margin-bottom: 4px;"></label>',
                        '<label id="formula-wizard-desc" style="display: block;margin-bottom: 8px;"></label>',
                        '<label style="display: block;"><a id="formula-wizard-help" style="cursor: pointer;">'+ this.textHelp +'</a></label>',
                    '</div>',
                '</div>',
                '<div class="separator horizontal"/>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.props = this.options.props;
            this.funcprops = this.options.funcprops;
            this.api = this.options.api;
            this._noApply = false;
            this.args = [];
            this.repeatedArg = undefined;
            this.minArgCount = 1;
            this.maxArgCount = 1;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
            $window.find('input').on('keypress', _.bind(this.onKeyPress, this));

            this.panelArgs = $window.find('#formula-wizard-panel-args');
            this.tableArgs = $window.find('#formula-wizard-tbl-args');
            this.panelDesc = $window.find('#formula-wizard-panel-desc');
            this.lblArgDesc = $window.find('#formula-wizard-arg-desc');

            this._preventCloseCellEditor = false;

            this.afterRender();
        },

        afterRender: function() {
            this.setSettings();
        },

        _handleInput: function(state) {
            if (this.options.handler)
                this.options.handler.call(this, state, (state == 'ok') ? this.getSettings() : undefined);
            this._preventCloseCellEditor = (state == 'ok');
            this.close();
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onKeyPress: function(event) {
            if (event.keyCode == Common.UI.Keys.RETURN) {
                this._handleInput('ok');
            }
        },

        setSettings: function () {
            var me = this;
            if (this.funcprops) {
                var props = this.funcprops;
                props.args ? $('#formula-wizard-args').html('<b>' + props.name + '</b>' + props.args) : $('#formula-wizard-args').addClass('hidden');
                props.desc ? $('#formula-wizard-desc').text(props.desc) : $('#formula-wizard-desc').addClass('hidden');
                props.name ? $('#formula-wizard-name').html('<b>' + this.textFunction + ': </b>' + props.name) : $('#formula-wizard-name').addClass('hidden');

                this.$window.find('#formula-wizard-help').on('click', function (e) {
                    // me.close();
                    SSE.getController('LeftMenu').getView('LeftMenu').showMenu('file:help', 'Functions\/' + me.funcprops.origin.toLocaleLowerCase() + '.htm');
                })
            }
            var height = this.panelDesc.outerHeight();
            height = this.$window.find('.box').height() - height - 33;// #formula-wizard-name height
            this.panelArgs.height(height);
            height = parseInt((height-8)/30) * 30;
            this.tableArgs.parent().height(height);
            this.scrollerY = new Common.UI.Scroller({
                el: this.tableArgs.parent(),
                minScrollbarLength  : 20,
                alwaysVisibleY: true
            });

            if (this.props) {
                // fill arguments
                var props = this.props;
                this.minArgCount = props.asc_getArgumentMin();
                this.maxArgCount = props.asc_getArgumentMax();

                var result = props.asc_getFormulaResult();
                $('#formula-wizard-value').html('<b>' + this.textValue + ': </b>' + ((result!==undefined && result!==null)? result : ''));

                var argres = props.asc_getArgumentsResult(),
                    argtype = props.asc_getArgumentsType(),
                    argval = props.asc_getArgumentsValue();

                if (argtype) {
                    for (var i=0; i<argtype.length; i++) {
                        var type = argtype[i],
                            types = [];

                        if (typeof type == 'object') {
                            this.repeatedArg = type;
                            types = type;
                        } else
                            types.push(type);
                        this.fillArgs(types, argval, argres);
                    }
                    if (argval && this.args.length<argval.length && this.repeatedArg) { // add repeated
                        while (this.args.length<argval.length) {
                            this.fillArgs(this.repeatedArg, argval, argres);
                        }
                    }
                    this.scrollerY.update();
                    this.scrollerY.scrollTop(0);
                }
            }
            if (this.args.length<1) {
                this.panelArgs.text('This function has no arguments');
                this.lblArgDesc.addClass('hidden');
            } else {
                if (this.args.length==1 && this.repeatedArg && this.repeatedArg.length<this.maxArgCount) {// add new repeated arguments
                    this.fillArgs(this.repeatedArg);
                    this.scrollerY.update();
                }

                _.delay(function(){
                    me._noApply = true;
                    me.args[0].argInput.cmpEl.find('input').focus();
                    me._noApply = false;
                },100);
            }
        },

        fillArgs: function (types, argval, argres) {
            var argcount = this.args.length;
            for (var j=0; j<types.length; j++)
                this.setControls(argcount, types[j], argval ? argval[argcount] : undefined, argres ? argres[argcount] : undefined);
        },

        setControls: function(argcount, argtype, argval, argres) {
            var me = this,
                argtpl = '<tr><td style="padding-right: 10px;padding-bottom: 8px;vertical-align: middle;text-align: right;"><div id="formula-wizard-lbl-name-arg{0}" style="min-width: 50px;white-space: nowrap;margin-top: 1px;"></div></td>' +
                        '<td style="padding-right: 10px;padding-bottom: 8px;width: 100%;vertical-align: middle;"><div id="formula-wizard-txt-arg{0}"></div></td>' +
                        '<td style="padding-bottom: 8px;vertical-align: middle;"><div id="formula-wizard-lbl-val-arg{0}" class="input-label" style="margin-top: 1px;width: 100px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;"></div></td></tr>',
                div = $(Common.Utils.String.format(argtpl, argcount));
            this.tableArgs.append(div);

            var txt = new Common.UI.InputFieldBtn({
                el: div.find('#formula-wizard-txt-arg'+argcount),
                index: argcount,
                validateOnChange: true,
                validateOnBlur: false
            }).on('changed:after', function(input, newValue, oldValue, e) {
                if (newValue == oldValue) return;
            }).on('changing', function(input, newValue, oldValue, e) {
                if (newValue == oldValue) return;
                var index = input.options.index,
                    arg = me.args[index],
                    res = me.api.asc_insertFormulaArgument(newValue, index, arg.argType);
                arg.lblValue.text(' = '+ (res!==null && res !==undefined ? res : arg.argTypeName));
            });
            txt.setValue((argval!==undefined && argval!==null) ? argval : '');
            txt._input.on('focus', _.bind(this.onSelectArgument, this, txt));
            txt.on('button:click', _.bind(this.onSelectData, this));

            me.args.push({
                index: argcount,
                lblName: div.find('#formula-wizard-lbl-name-arg'+argcount),
                lblValue: div.find('#formula-wizard-lbl-val-arg'+argcount),
                argInput: txt,
                argName: 'Argument ' + (argcount+1),
                argDesc: 'some argument description',
                argType: argtype,
                argTypeName: me.getArgType(argtype)
            });
            if (argcount<me.minArgCount)
                me.args[argcount].lblName.html('<b>' + me.args[argcount].argName + '</b>');
            else
                me.args[argcount].lblName.html(me.args[argcount].argName);
            me.args[argcount].lblValue.text(' = '+ ( argres!==null && argres!==undefined ? argres : me.args[argcount].argTypeName));
        },

        getArgType: function(type) {
            var str = '';
            switch (type) {
                case Asc.c_oAscFormulaArgumentType.number:
                    str = 'number';
                    break;
                case Asc.c_oAscFormulaArgumentType.text:
                    str = 'text';
                    break;
                case Asc.c_oAscFormulaArgumentType.reference:
                    str = 'reference';
                    break;
                case Asc.c_oAscFormulaArgumentType.any:
                    str = 'any';
                    break;
                case Asc.c_oAscFormulaArgumentType.logical:
                    str = 'logical';
                    break;
            }
            return str;
        },

        onSelectArgument: function(input) {
            var index = input.options.index,
                arg = this.args[index];
            arg.argDesc ? this.lblArgDesc.html('<b>' + arg.argName + ': </b>' + arg.argDesc) : this.lblArgDesc.addClass('hidden');
            if (!this._noApply && index==this.args.length-1 && this.repeatedArg && index+this.repeatedArg.length<this.maxArgCount) {// add new repeated arguments
                this.fillArgs(this.repeatedArg);
                this.scrollerY.update();
            }
        },

        onSelectData: function(input) {
            this.onSelectArgument(input);

            var me = this;
            if (me.api) {
                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        input.setValue(dlg.getSettings());
                    }
                };

                var win = new SSE.Views.CellRangeDialog({
                    handler: handlerDlg
                }).on('close', function() {
                    me.show();
                });

                var xy = me.$window.offset();
                me.hide();
                win.show(xy.left + 65, xy.top + 77);
                win.setSettings({
                    api     : me.api,
                    range   : !_.isEmpty(input.getValue()) ? input.getValue() : '',
                    type    : Asc.c_oAscSelectionDialogType.Chart
                });
            }
        },

        getSettings: function() {
            return {};
        },

        close: function () {
            Common.UI.Window.prototype.close.call(this);
            this.api.asc_closeCellEditor(!this._preventCloseCellEditor);
        },

        textTitle: 'Function Argumens',
        textValue: 'Formula result',
        textFunction: 'Function',
        textHelp: 'Help on this function'

    }, SSE.Views.FormulaWizard || {}))
});