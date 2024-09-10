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
 *  FormulaDialog.js
 *
 *  Add formula to cell dialog
 *
 *  Created on 11/04/14
 *
 */

define([
    'common/main/lib/component/Window',
    'spreadsheeteditor/main/app/collection/FormulaGroups'
], function () {
    'use strict';

    SSE.Views = SSE.Views || {};
    SSE.Views.FormulaDialog = Common.UI.Window.extend(_.extend({

        applyFunction: undefined,

        initialize : function (options) {
            var t = this,
                _options = {};

            _.extend(_options,  {
                width           : 375,
                header          : true,
                cls             : 'modal-dlg formula-dlg',
                contentTemplate : '',
                title           : t.txtTitle,
                items           : [],
                buttons: [
                    {value: 'ok', caption: this.okButtonText, primary: true, id: 'formula-dlg-btn-ok'},
                    'cancel'
                ],
            }, options);

            this.template   =   options.template || [
                '<div class="box" style="height:405px;">',
                    '<div class="content-panel" >',
                        '<div id="formula-dlg-search" style="height:22px; margin-bottom:10px;"></div>',
                        '<label class="header">' + t.textGroupDescription + '</label>',
                        '<div id="formula-dlg-combo-group" class="input-group-nr" style=""></div>',
                        '<label class="header" style="margin-top: 10px">' + t.textListDescription + '</label>',
                        '<div id="formula-dlg-combo-functions" class="combo-functions"></div>',
                        '<label id="formula-dlg-args" style="margin-top: 7px">' + '</label>',
                        '<label id="formula-dlg-desc" style="margin-top: 4px; display: block;">' + '</label>',
                    '</div>',
                '</div>',
                '<div class="separator horizontal"></div>'
            ].join('');

            this.api            =   options.api;
            this.formulasGroups =   options.formulasGroups;
            this.handler        =   options.handler;

            _options.tpl        =   _.template(this.template)(_options);

            Common.UI.Window.prototype.initialize.call(this, _options);
        },
        render: function () {
            Common.UI.Window.prototype.render.call(this);

            this.$window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            var me = this;
            this.inputSearch = new Common.UI.InputField({
                el               : $('#formula-dlg-search', this.$window),
                allowBlank       : true,
                placeHolder      : this.txtSearch,
                validateOnChange : true,
                validation       : function () { return true; }
            }).on ('changing', function (input, value) {
                if (value.length) {
                    value = value.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
                    me.filter = value.toLowerCase();
                } else {
                    me.filter = undefined;
                }
                me.filterFormulas();
            });

            this.btnOk = _.find(this.getFooterButtons(), function (item) {
                return (item.$el && item.$el.find('#formula-dlg-btn-ok').addBack().filter('#formula-dlg-btn-ok').length>0);
            }) || new Common.UI.Button({ el: $('#formula-dlg-btn-ok') });

            this.syntaxLabel = $('#formula-dlg-args');
            this.descLabel = $('#formula-dlg-desc');
            this.fillFormulasGroups();
        },

        getFocusedComponents: function() {
            return [this.inputSearch, this.cmbFuncGroup, this.cmbListFunctions].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.inputSearch;
        },

        show: function (group) {
            if (this.$window) {
                var main_width, main_height, top, left, win_height = this.initConfig.height;

                if (window.innerHeight === undefined) {
                    main_width = document.documentElement.offsetWidth;
                    main_height = document.documentElement.offsetHeight;
                } else {
                    main_width = Common.Utils.innerWidth();
                    main_height = Common.Utils.innerHeight();
                }

                top = (parseInt(main_height, 10) - parseInt(win_height, 10)) / 2;
                left = (parseInt(main_width, 10) - parseInt(this.initConfig.width, 10)) / 2;

                this.$window.css('left', Math.floor(left));
                this.$window.css('top', Math.floor(top));
            }

            Common.UI.Window.prototype.show.call(this);

            group && this.cmbFuncGroup.setValue(group);
            (group || this.cmbFuncGroup.getValue()=='Last10') && this.fillFunctions(this.cmbFuncGroup.getValue());

            this.inputSearch.setValue('');
            this._preventCloseCellEditor = false;
        },

        hide: function () {
            var val = this.cmbFuncGroup.getValue();
            (val=='Recommended') && (val = 'Last10');
            if (this.cmbFuncGroup.store.length>0 && this.cmbFuncGroup.store.at(0).get('value')=='Recommended') {
                this.cmbFuncGroup.store.shift();
                this.cmbFuncGroup.onResetItems();
            }
            this.cmbFuncGroup.setValue(val);
            this.recommended = this.filter = undefined;

            Common.UI.Window.prototype.hide.call(this);

            !this._preventCloseCellEditor && this.api.asc_closeCellEditor(true);
        },

        onBtnClick: function (event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },
        onDblClickFunction: function () {
            this._handleInput('ok');
        },
        onSelectGroup: function (combo, record) {
            if (!_.isUndefined(record) && !_.isUndefined(record.value)) {
                record.value && this.fillFunctions(record.value);
            }

            this.onUpdateFocus();
        },
        onSelectFunction: function (listView, itemView, record) {
            var funcId, functions, func;

            if (this.formulasGroups && record) {
                this.applyFunction = {name: record.get('value'), origin: record.get('origin')};
                this.syntaxLabel.text(this.applyFunction.name + record.get('args'));
                this.descLabel.text(record.get('desc'));
            }
        },
        onPrimary: function(list, record, event) {
            this._handleInput('ok');
            return false;
        },

        _handleInput: function(state) {
            if (this.handler && state == 'ok') {
                if (this.btnOk.isDisabled())
                    return;
                this._preventCloseCellEditor = true;
                this.handler.call(this, this.applyFunction);
            }

            this.hide();
        },

        onUpdateFocus: function () {
            if (this.cmbListFunctions) {
                _.delay(function (me) {
                    me.cmbListFunctions.focus();
                }, 100, this);
            }
        },

        //

        fillFormulasGroups: function () {
            if (this.formulasGroups) {

                var lang = Common.Utils.InternalSettings.get("sse-settings-func-locale");
                if (_.isEmpty(lang)) lang = 'en';

                var i, groupsListItems = [], length =  this.formulasGroups.length;

                for (i = 0; i < length; ++i) {
                    var group = this.formulasGroups.at(i);
                    if (group.get('functions').length) {
                        groupsListItems.push({
                            value           : group.get('name'),
                            displayValue    :  group.get('caption')
                        });
                    }
                }

                if (!this.cmbFuncGroup) {
                    this.cmbFuncGroup = new Common.UI.ComboBox({
                        el          : $('#formula-dlg-combo-group'),
                        menuStyle   : 'min-width: 100%;',
                        cls         : 'input-group-nr',
                        data        : groupsListItems,
                        editable    : false,
                        takeFocusOnClose: true
                    });
                    this.cmbFuncGroup.on('selected', _.bind(this.onSelectGroup, this));
                } else {
                    this.cmbFuncGroup.setData(groupsListItems);
                }
                this.cmbFuncGroup.setValue('Last10');
                this.fillFunctions('Last10');

                this.allFunctions = new Common.UI.DataViewStore();
                var group = this.formulasGroups.findWhere({name : 'All'});
                group && this.allFunctions.reset(group.get('functions'));
            }
        },
        fillFunctions: function (name) {
            if (this.formulasGroups) {

                if (!this.cmbListFunctions && !this.functions) {
                    this.functions = new Common.UI.DataViewStore();

                    this.cmbListFunctions = new Common.UI.ListView({
                        el: $('#formula-dlg-combo-functions'),
                        store: this.functions,
                        tabindex: 1,
                        cls: 'dbl-clickable'
                    });

                    this.cmbListFunctions.on('item:select', _.bind(this.onSelectFunction, this));
                    this.cmbListFunctions.on('item:dblclick', _.bind(this.onDblClickFunction, this));
                    this.cmbListFunctions.on('entervalue', _.bind(this.onPrimary, this));
                    this.cmbListFunctions.onKeyDown = _.bind(this.onKeyDown, this);
                    this.onUpdateFocus();
                }

                if (this.functions) {
                    this.functions.reset();

                    var functions = null;
                    if (name=='Recommended') {
                        functions = this.recommended;
                    } else {
                        var group = this.formulasGroups.findWhere({name : name});
                        group && (functions = group.get('functions'));
                    }
                    var length = functions ? functions.length : 0;
                    for (var i = 0; i < length; ++i) {
                        this.functions.push(new Common.UI.DataViewModel({
                            id              : functions[i].get('index'),
                            selected        : i < 1,
                            allowSelected   : true,
                            value           : functions[i].get('name'),
                            args            : functions[i].get('args'),
                            desc            : functions[i].get('desc'),
                            origin          : functions[i].get('origin')
                        }));
                    }

                    this.applyFunction = length ? {name: functions[0].get('name'), origin: functions[0].get('origin')} : undefined;

                    this.syntaxLabel.text(length ? this.applyFunction.name + functions[0].get('args') : '');
                    this.descLabel.text(length ? functions[0].get('desc') : '');
                    this.cmbListFunctions.scroller.update({
                        minScrollbarLength  : 40,
                        alwaysVisibleY      : true
                    });
                    this.btnOk.setDisabled(!length);
                }
            }
        },

        filterFormulas: function() {
            if (!this.filter) {
                this.cmbFuncGroup.setValue('Last10');
                this.fillFunctions('Last10');
                return;
            }

            var me = this,
                filter_reg = new RegExp(me.filter, 'ig'),
                arr = this.allFunctions.filter(function(item) {
                return !!item.get('name').match(filter_reg);
            });
            if (arr.length>0) {
                if (this.cmbFuncGroup.store.at(0).get('value')!='Recommended') {
                    this.cmbFuncGroup.store.unshift({value: 'Recommended', displayValue: this.txtRecommended});
                    this.cmbFuncGroup.onResetItems();
                }
                var idx = _.findIndex(arr, function(item) {
                    return (item.get('name').toLowerCase()===me.filter);
                });
                if (idx>0) {
                    var removed = arr.splice(idx, 1);
                    arr.unshift(removed[0]);
                }
            } else if (arr.length==0 && this.cmbFuncGroup.store.length>0 && this.cmbFuncGroup.store.at(0).get('value')=='Recommended') {
                this.cmbFuncGroup.store.shift();
                this.cmbFuncGroup.onResetItems();
            }
            this.cmbFuncGroup.setValue('Recommended', this.txtRecommended);
            this.recommended = arr;
            this.fillFunctions('Recommended');
        },

        onKeyDown: function (e, event) {
            var i = 0, record = null,
                parent = this,
                me = this.cmbListFunctions,
                charVal = '',
                value = '',
                firstRecord = null,
                recSelect = false,
                innerEl = null,
                isEqualSelectRecord = false,
                selectRecord = null,
                needNextRecord = false;

            if (me.disabled) return;
            if (_.isUndefined(undefined)) event = e;

            function selectItem (item) {
                me.selectRecord(item);
                parent.onScrollToRecordCustom.call(me, item);

                innerEl = $(me.el).find('.inner');
                me.scroller.scrollTop(innerEl.scrollTop(), 0);

                event.preventDefault();
                event.stopPropagation();
            }

            charVal = e.key;
            if (e.keyCode > 64 && e.keyCode < 91 && charVal && charVal.length) {
                charVal = charVal.toLocaleLowerCase();
                selectRecord = me.store.findWhere({selected: true});
                if (selectRecord) {
                    value = selectRecord.get('value');
                    isEqualSelectRecord = (value && value.length && value[0].toLocaleLowerCase() === charVal)
                }

                for (i = 0; i < me.store.length; ++i) {
                    record = me.store.at(i);
                    value = record.get('value');

                    if (value[0].toLocaleLowerCase() === charVal) {

                        if (null === firstRecord) firstRecord = record;

                        if (isEqualSelectRecord) {
                            if (selectRecord === record) {
                                isEqualSelectRecord = false;
                            }

                            continue;
                        }

                        if (record.get('selected')) continue;

                        selectItem(record);

                        return;
                    }
                }

                if (firstRecord) {
                    selectItem(firstRecord);
                    return;
                }
            }

            Common.UI.DataView.prototype.onKeyDown.call(me, e, event);
        },

        onScrollToRecordCustom: function (record) {
            var innerEl = $(this.el).find('.inner');
            var inner_top = innerEl.offset().top;
            var div = innerEl.find('#' + record.get('id')).parent();
            var div_top = div.offset().top;

            if (div_top < inner_top || div_top+div.height() > inner_top + innerEl.height()) {
                if (this.scroller) {
                    this.scroller.scrollTop(innerEl.scrollTop() + div_top - inner_top, 0);
                } else {
                    innerEl.scrollTop(innerEl.scrollTop() + div_top - inner_top);
                }
            }
        },

        textGroupDescription:           'Select Function Group',
        textListDescription:            'Select Function',
        sDescription:                   'Description',
        txtTitle:                       'Insert Function',
        txtSearch: 'Search',
        txtRecommended: 'Recommended'

    }, SSE.Views.FormulaDialog || {}));
});