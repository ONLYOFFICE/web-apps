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
 *  FormulaWizard.js
 *
 *  Created on 17.04.20
 *
 */

define([
    'common/main/lib/view/AdvancedSettingsWindow',
], function () { 'use strict';

    SSE.Views.FormulaWizard = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 580,
            contentHeight: 312
        },

        initialize : function(options) {
            var me = this;
            _.extend(this.options, {
                title: this.textTitle,
                contentStyle: 'padding: 0;',
                contentTemplate: _.template([
                    '<div class="settings-panel active">',
                        '<div class="inner-content">',
                                '<table style="width: 100%;">',
                                '<tr><td>',
                                '<label id="formula-wizard-name" style="display: block;margin-bottom: 8px;"></label>',
                                '<div id="formula-wizard-panel-args" style="">',
                                    '<div style="overflow: hidden;position: relative;">',
                                        '<table cols="3" id="formula-wizard-tbl-args" style="width: 100%;">',
                                        '</table>',
                                    '</div>',
                                    '<div style="margin-top: 4px;">',
                                        '<label id="formula-wizard-lbl-func-res">' + this.textFunctionRes + '</label>',
                                        '<div id="formula-wizard-lbl-val-func" class="input-label float-right" style="width: 200px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;"></div>',
                                    '</div>',
                                '</div>',
                                '</td></tr>',
                                '<tr><td style="height:100%;padding-bottom: 12px;"></td></tr>',
                                '<tr><td>',
                                '<div id="formula-wizard-panel-desc" style="word-break: break-word;">',
                                    // '<label id="formula-wizard-arg-desc" style="display: block;margin-bottom: 8px;"><b>Argument 1:</b></label>',
                                    '<label id="formula-wizard-args" style="display: block;margin-bottom: 0px;"></label>',
                                    '<label id="formula-wizard-desc" style="display: block;margin-bottom: 8px;"></label>',
                                    '<label id="formula-wizard-value" style="display: block;margin-bottom: 8px;"><b>Formula result:</b></label>',
                                    '<label style="display: block; margin-bottom: 8px;"><a id="formula-wizard-help" style="cursor: pointer;">'+ this.textHelp +'</a></label>',
                                '</div>',
                                '</td></tr>',
                                '</table>',
                            '</div></div>'
                ].join(''))({scope: this})
            }, options);

            this.props = this.options.props;
            this.funcprops = this.options.funcprops;
            this.api = this.options.api;
            this.lang = this.options.lang;

            this._noApply = false;
            this.args = [];
            this.argsNames = [];
            this.repeatedIdx = 1;
            this.repeatedArg = undefined;
            this.helpUrl = undefined;
            this.minArgCount = 1;
            this.maxArgCount = 1;
            this.minArgWidth = 50;

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            var $window = this.getChild();
            $window.find('input').on('keypress', _.bind(this.onKeyPress, this));

            this.contentPanel = $window.find('.content-panel');
            this.innerPanel = $window.find('.inner-content');

            this.panelArgs = $window.find('#formula-wizard-panel-args');
            this.tableArgs = $window.find('#formula-wizard-tbl-args');
            this.panelDesc = $window.find('#formula-wizard-panel-desc');
            this.lblArgDesc = $window.find('#formula-wizard-arg-desc');
            this.lblFormulaResult = $window.find('#formula-wizard-value');
            this.lblFunctionResult = $window.find('#formula-wizard-lbl-val-func');

            this.innerPanel.find('> table').css('height', this.options.contentHeight - 7);

            this._preventCloseCellEditor = false;

            this.afterRender();
        },

        afterRender: function() {
            this._setDefaults();
        },

        _handleInput: function(state) {
            if (this.options.handler)
                this.options.handler.call(this, state, (state == 'ok') ? this.getSettings() : undefined);
            this._preventCloseCellEditor = (state == 'ok');
            this.close();
        },

        onDlgBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onKeyPress: function(event) {
            if (event.keyCode == Common.UI.Keys.RETURN) {
                this._handleInput('ok');
            }
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        _setDefaults: function () {
            Common.UI.FocusManager.add(this, this.getFooterButtons());

            var me = this;
            if (this.funcprops) {
                var props = this.funcprops;
                props.args ? $('#formula-wizard-args').html('<b>' + props.name + '</b>' + props.args) : $('#formula-wizard-args').addClass('hidden');
                props.desc ? $('#formula-wizard-desc').text(props.desc) : $('#formula-wizard-desc').addClass('hidden');
                props.name ? $('#formula-wizard-name').html(this.textFunction + ': ' + props.name) : $('#formula-wizard-name').addClass('hidden');
                this.parseArgsDesc(props.args);

                props.custom ?  this.$window.find('#formula-wizard-help').css('visibility', 'hidden') :
                                this.$window.find('#formula-wizard-help').on('click', function (e) {
                                    me.showHelp();
                                })
            }
            this.recalcArgTableSize();
            this.minArgWidth = this.$window.find('#formula-wizard-lbl-func-res').width();

            if (this.props) {
                // fill arguments
                var props = this.props;
                this.minArgCount = props.asc_getArgumentMin();
                this.maxArgCount = props.asc_getArgumentMax();

                var result = props.asc_getFunctionResult();
                this.lblFunctionResult.html('= ' + ((result!==undefined && result!==null) ? result : ''));
                result = props.asc_getFormulaResult();
                this.lblFormulaResult.html('<b>' + this.textValue + ': </b>' + ((result!==undefined && result!==null)? result : ''));

                var argres = props.asc_getArgumentsResult(),
                    argtype = props.asc_getArgumentsType(),
                    argval = props.asc_getArgumentsValue();

                if (argtype) {
                    for (var i=0; i<argtype.length; i++) {
                        var type = argtype[i],
                            types = [];

                        if (typeof type == 'object') {
                            this.repeatedArg = type;
                            this.fillRepeatedNames();
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
                this.panelArgs.text(this.textNoArgs);
                this.lblArgDesc.addClass('hidden');
            } else {
                if (this.args.length==1 && this.repeatedArg && this.repeatedArg.length<this.maxArgCount) {// add new repeated arguments
                    this.fillArgs(this.repeatedArg);
                    this.scrollerY.update();
                }

                _.delay(function(){
                    me._noApply = true;
                    me.args[0].argInput.focus();
                    me._noApply = false;
                },100);
            }
        },

        recalcArgTableSize: function() {
            var height = this.panelDesc.outerHeight();
            height = this.$window.find('.box').height() - 7 - height - 54;
            height = parseInt(height/30) * 30;
            this.tableArgs.parent().css('max-height', height);
            if (!this.scrollerY)
                this.scrollerY = new Common.UI.Scroller({
                    el: this.tableArgs.parent(),
                    minScrollbarLength  : 20,
                    alwaysVisibleY: true
                });
            else
                this.scrollerY.update();
        },

        checkDescriptionSize: function() {
            (this.contentPanel.height() < this.innerPanel.height()) && this.recalcArgTableSize();
        },

        parseArgsDesc: function(args) {
            if (args.charAt(0)=='(')
                args = args.substring(1);
            if (args.charAt(args.length-1)==')')
                args = args.substring(0, args.length-1);
            var arr = args.split(this.api.asc_getFunctionArgumentSeparator());
            arr.forEach(function(item, index){
                var str = item.trim();
                if (str.charAt(0)=='[')
                    str = str.substring(1);
                if (str.charAt(str.length-1)==']')
                    str = str.substring(0, str.length-1);
                str = str.trim();
                arr[index] = str.charAt(0).toUpperCase().concat(str.substring(1));
            });
            this.argsNames = arr;
        },

        fillRepeatedNames: function() {
            if (this.argsNames.length<1) return;
            if (this.repeatedArg && this.repeatedArg.length>0 && this.argsNames[this.argsNames.length-1]==='...') {
                var req = this.argsNames.length-1 - this.repeatedArg.length; // required/no-repeated
                for (var i=0; i<this.repeatedArg.length; i++) {
                    var str = this.argsNames[this.argsNames.length-2-i],
                        ch = str.charAt(str.length-1);
                    if ('123456789'.indexOf(ch)>-1) {
                        this.repeatedIdx = parseInt(ch);
                        this.argsNames[this.argsNames.length-2-i] = str.substring(0, str.length-1);
                    }
                }
            }
        },

        getArgumentName: function(argcount) {
            var name = '',
                namesLen = this.argsNames.length;
            if ((!this.repeatedArg || this.repeatedArg.length<1) && argcount<namesLen && this.argsNames[argcount]!=='...') { // no repeated args
                name = this.argsNames[argcount];
                (name==='') && (name = this.textArgument + (this.maxArgCount>1 ? (' ' + (argcount+1)) : ''));
            } else if (this.repeatedArg && this.repeatedArg.length>0 && this.argsNames[namesLen-1]==='...') {
                var repeatedLen = this.repeatedArg.length;
                var req = namesLen-1 - repeatedLen; // required/no-repeated
                if (argcount<req) // get required args as is
                    name = this.argsNames[argcount];
                else {
                    var idx = repeatedLen - (argcount - req)%repeatedLen,
                        num = Math.floor((argcount - req)/repeatedLen) + this.repeatedIdx;
                    name = this.argsNames[namesLen-1-idx] + num;
                }
            } else
                name = this.textArgument + (this.maxArgCount>1 ? (' ' + (argcount+1)) : '');

            return name;
        },

        fillArgs: function (types, argval, argres) {
            var argcount = this.args.length;
            for (var j=0; j<types.length; j++) {
                this.setControls(argcount, types[j], argval ? argval[argcount] : undefined, argres ? argres[argcount] : undefined);
                argcount++;
            }
        },

        setControls: function(argcount, argtype, argval, argres) {
            var me = this,
                argtpl = '<tr><td class="padding-right-10" style="padding-bottom: 8px;vertical-align: middle;"><div id="formula-wizard-lbl-name-arg{0}" style="min-width:' + this.minArgWidth + 'px;white-space: nowrap;margin-top: 1px;"></div></td>' +
                        '<td class="padding-right-5" style="padding-bottom: 8px;width: 100%;vertical-align: middle;"><div id="formula-wizard-txt-arg{0}"></div></td>' +
                        '<td style="padding-bottom: 8px;vertical-align: middle;"><div id="formula-wizard-lbl-val-arg{0}" class="input-label" style="margin-top: 1px;width: 200px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;"></div></td></tr>',
                div = $(Common.Utils.String.format(argtpl, argcount));
            this.tableArgs.append(div);

            var txt = new Common.UI.InputFieldBtn({
                el: div.find('#formula-wizard-txt-arg'+argcount),
                index: argcount,
                validateOnChange: true,
                validateOnBlur: false
            }).on('changed:after', function(input, newValue, oldValue, e) {
            }).on('changing', function(input, newValue, oldValue, e) {
                if (newValue == oldValue) return;
                me.onInputChanging(input, newValue, oldValue);
            }).on('button:click', _.bind(this.onSelectData, this));
            txt.setValue((argval!==undefined && argval!==null) ? argval : '');
            txt._input.on('focus', _.bind(this.onSelectArgument, this, txt));

            me.args.push({
                index: argcount,
                lblName: div.find('#formula-wizard-lbl-name-arg'+argcount),
                lblValue: div.find('#formula-wizard-lbl-val-arg'+argcount),
                argInput: txt,
                argName: me.getArgumentName(argcount),
                // argDesc: 'some argument description',
                argType: argtype,
                argTypeName: me.getArgType(argtype)
            });
            if (argcount<me.minArgCount)
                me.args[argcount].lblName.html('<b>' + me.args[argcount].argName + '</b>');
            else
                me.args[argcount].lblName.html(me.args[argcount].argName);
            me.args[argcount].lblValue.html('= '+ ( argres!==null && argres!==undefined ? argres : '<span style="opacity: 0.6; font-weight: bold;">' + me.args[argcount].argTypeName + '</span>'));

            Common.UI.FocusManager.insert(this, txt, -1 * this.getFooterButtons().length);
        },

        onInputChanging: function(input, newValue, oldValue, e) {
            var me = this,
                index = input.options.index,
                arg = me.args[index];
            var res = me.api.asc_insertArgumentsInFormula(me.getArgumentsValue(), index, arg.argType, this.funcprops ? this.funcprops.origin : undefined),
                argres = res ? res.asc_getArgumentsResult() : undefined;
            argres = argres ? argres[index] : undefined;
            arg.lblValue.html('= '+ (argres!==null && argres !==undefined ? argres : '<span style="opacity: 0.6; font-weight: bold;">' + arg.argTypeName + '</span>' ));

            var result = res ? res.asc_getFunctionResult() : undefined;
            me.lblFunctionResult.html('= ' + ((result!==undefined && result!==null)? result : ''));
            result = res ? res.asc_getFormulaResult() : undefined;
            me.lblFormulaResult.html('<b>' + me.textValue + ': </b>' + ((result!==undefined && result!==null)? result : ''));
        },

        getArgumentsValue: function() {
            var res = [],
                len = this.args.length,
                empty = true;
            for (var i=len-1; i>=0; i--) {
                var val = this.args[i].argInput.getValue();
                empty && (empty = !val);
                (!empty) && (res[i] = val);
            }
            return res;
        },

        getArgType: function(type) {
            var str = '';
            switch (type) {
                case Asc.c_oAscFormulaArgumentType.number:
                    str = this.textNumber;
                    break;
                case Asc.c_oAscFormulaArgumentType.text:
                    str = this.textText;
                    break;
                case Asc.c_oAscFormulaArgumentType.reference:
                    str = this.textRef;
                    break;
                case Asc.c_oAscFormulaArgumentType.any:
                    str = this.textAny;
                    break;
                case Asc.c_oAscFormulaArgumentType.logical:
                    str = this.textLogical;
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
            this.checkDescriptionSize();
        },

        onSelectData: function(input) {
            this.onSelectArgument(input);

            var me = this;
            if (me.api) {
                var changedValue = input.getValue();
                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        changedValue = dlg.getSettings();
                    }
                };

                var win = new SSE.Views.CellRangeDialog({
                    allowBlank: true,
                    handler: handlerDlg
                }).on('close', function() {
                    input.setValue(changedValue);
                    me.onInputChanging(input);
                    me.show();
                    _.delay(function(){
                        me._noApply = true;
                        input.focus();
                        me._noApply = false;
                    },1);
                });

                var xy = me.$window.offset();
                me.hide();
                win.show(xy.left + 65, xy.top + 77);
                win.setSettings({
                    api     : me.api,
                    range   : !_.isEmpty(input.getValue()) ? input.getValue() : '',
                    type    : Asc.c_oAscSelectionDialogType.Function,
                    selection: {start: input._input[0].selectionStart, end: input._input[0].selectionEnd},
                    argvalues  : me.getArgumentsValue(),
                    argindex   : input.options.index
                });
            }
        },

        showHelp: function() {
            if (this.helpUrl==undefined) {
                if (!this.funcprops || !this.funcprops.origin) {
                    this.helpUrl = null;
                    return;
                }
                var lang = Common.Utils.InternalSettings.get("sse-settings-func-help");
                if (!lang)
                    lang = (this.lang) ? this.lang.split(/[\-\_]/)[0] : 'en';

                var me = this,
                    func = this.funcprops.origin.toLocaleLowerCase().replace(/\./g, '-'),
                    name = '/Functions/' + func + '.htm',
                    url = 'resources/help/' + lang + name;

                if ( Common.Controllers.Desktop.isActive() ) {
                    if ( Common.Controllers.Desktop.isHelpAvailable() )
                        url = Common.Controllers.Desktop.helpUrl() + name;
                    else {
                        const helpCenter = Common.Utils.InternalSettings.get('url-help-center');
                        if ( helpCenter ) {
                            const _url_obj = new URL(helpCenter);
                            if ( !!_url_obj.searchParams )
                                _url_obj.searchParams.set('function', func);

                            window.open(_url_obj.toString(), '_blank');
                        }

                        me.helpUrl = null;
                        return;
                    }
                }

                fetch(url).then(function(response){
                    if ( response.ok ) {
                        Common.Utils.InternalSettings.set("sse-settings-func-help", lang);
                        me.helpUrl = url;
                        me.showHelp();
                    } else {
                        url = 'resources/help/' + '{{DEFAULT_LANG}}' + name;
                        fetch(url).then(function(response){
                            if ( response.ok ) {
                                Common.Utils.InternalSettings.set("sse-settings-func-help", '{{DEFAULT_LANG}}');
                                me.helpUrl = url;
                                me.showHelp();
                            } else {
                                me.helpUrl = null;
                            }
                        });
                    }
                });
            } else if (this.helpUrl) {
                window.open(this.helpUrl);
            }
        },

        getSettings: function() {
            return {};
        },

        close: function () {
            Common.Views.AdvancedSettingsWindow.prototype.close.call(this);
            this.api.asc_closeCellEditor(!this._preventCloseCellEditor);
        },

        textTitle: 'Function Argumens',
        textValue: 'Formula result',
        textFunctionRes: 'Function result',
        textFunction: 'Function',
        textHelp: 'Help on this function',
        textNoArgs: 'This function has no arguments',
        textArgument: 'Argument',
        textNumber: 'number',
        textText: 'text',
        textRef: 'reference',
        textAny: 'any',
        textLogical: 'logical'

    }, SSE.Views.FormulaWizard || {}))
});