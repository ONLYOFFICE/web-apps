/**
 *  FormulaDialog.js
 *
 *  Add formula to cell dialog
 *
 *  Created by Alexey.Musinov on 11/04/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
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
                width           : 300,
                height          : 490,
                contentWidth    : 390,
                header          : true,
                cls             : 'formula-dlg',
                contentTemplate : '',
                title           : t.txtTitle,
                items           : []
            }, options);

            this.template   =   options.template || [
                '<div class="box" style="height:' + (_options.height - 85) + 'px;">',
                    '<div class="content-panel" >',

                        '<label class="header">' + t.textGroupDescription + '</label>',
                        '<div id="formula-dlg-combo-group" class="input-group-nr" style="margin-top: 10px"/>',

                        '<label class="header" style="margin-top:10px">' + t.textListDescription + '</label>',
                        '<div id="formula-dlg-combo-functions" class="combo-functions"/>',
                        '<label id="formula-dlg-args" style="margin-top: 10px">' + '</label>',

                    '</div>',
                '</div>',

                '<div class="separator horizontal"/>',
                    '<div class="footer center">',
                    '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;">' + t.okButtonText + '</button>',
                    '<button class="btn normal dlg-btn" result="cancel">' + t.cancelButtonText + '</button>',
                '</div>'
            ].join('');

            this.api            =   options.api;
            this.formulasGroups =   options.formulasGroups;
            this.handler        =   options.handler;

            _options.tpl        =   _.template(this.template, _options);

            Common.UI.Window.prototype.initialize.call(this, _options);
        },
        render: function () {
            Common.UI.Window.prototype.render.call(this);

            this.$window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.syntaxLabel = $('#formula-dlg-args');

            this.translationTable = {};

            var name = '', translate = '',
                descriptions = ['All', 'Cube', 'Database', 'DateAndTime', 'Engineering', 'Financial', 'Information',
                                'Logical', 'LookupAndReference', 'Mathematic', 'Statistical', 'TextAndData' ];
            for (var i=0; i<descriptions.length; i++) {
                name = descriptions[i];
                translate = 'sCategory' + name;
                this.translationTable[name] = {
                    en: this[translate],
                    de: this[translate+'_de'],
                    ru: this[translate+'_ru']
                };
            }

            this.fillFormulasGroups();
            this.fillFunctions('All');
        },
        show: function () {
            if (this.$window) {
                var main_width, main_height, top, left, win_height = this.initConfig.height;

                if (window.innerHeight === undefined) {
                    main_width = document.documentElement.offsetWidth;
                    main_height = document.documentElement.offsetHeight;
                } else {
                    main_width = window.innerWidth;
                    main_height = window.innerHeight;
                }

                top = ((parseInt(main_height, 10) - parseInt(win_height, 10)) / 2) * 0.9;
                left = (parseInt(main_width, 10) - parseInt(this.initConfig.width, 10)) / 2;

                this.$window.css('left', Math.floor(left));
                this.$window.css('top', Math.floor(top));
            }

            Common.UI.Window.prototype.show.call(this);

            this.mask = $('.modals-mask');
            this.mask.on('mousedown',_.bind(this.onUpdateFocus, this));
            this.$window.on('mousedown',_.bind(this.onUpdateFocus, this));

            if (this.cmbListFunctions) {
                _.delay(function (me) {
                    me.cmbListFunctions.$el.find('.listview').focus();
                }, 100, this);
            }
        },

        hide: function () {
            //NOTE: scroll to top
            //if (this.cmbListFunctions && this.functions && this.functions.length) {
            //    $(this.cmbListFunctions.scroller.el).scrollTop(-this.cmbListFunctions.scroller.getScrollTop());
            //}

            this.mask.off('mousedown',_.bind(this.onUpdateFocus, this));
            this.$window.off('mousedown',_.bind(this.onUpdateFocus, this));

            Common.UI.Window.prototype.hide.call(this);
        },

        onBtnClick: function (event) {
            if ('ok' === event.currentTarget.attributes['result'].value) {
                if (this.handler) {
                    this.handler.call(this, this.applyFunction);
                }
            }

            this.hide();
        },
        onDblClickFunction: function () {
            if (this.handler) {
                this.handler.call(this, this.applyFunction);
            }

            this.hide();
        },
        onSelectGroup: function (combo, record) {
            if (!_.isUndefined(record) && !_.isUndefined(record.value)) {
                if (record.value < this.formulasGroups.length) {
                    this.fillFunctions(this.formulasGroups.at(record.value).get('name'));
                }
            }

            this.onUpdateFocus();
        },
        onSelectFunction: function (listView, itemView, record) {
            var funcId, functions, func;

            if (this.formulasGroups) {
                funcId = record.get('id');
                if (!_.isUndefined(funcId)) {
                    functions = this.formulasGroups.at(0).get('functions');
                    if (functions) {
                        func = _.find(functions, function (f) { if (f.get('index') === funcId) { return f; } return null; });
                        if (func) {
                            this.applyFunction = func.get('name');
                            this.syntaxLabel.text(this.applyFunction + func.get('args'));
                        }
                    }
                }
            }
        },
        onPrimary: function(list, record, event) {
            if (this.handler) {
                this.handler.call(this, this.applyFunction);
            }

            this.hide();
        },

        onUpdateFocus: function () {
            _.delay(function(me) {
                me.cmbListFunctions.$el.find('.listview').focus();
            }, 100, this);
        },

        //

        fillFormulasGroups: function () {
            if (this.formulasGroups) {

                var lang = Common.localStorage.getItem("sse-settings-func-locale");
                if (_.isEmpty(lang)) lang = 'en';

                var i, groupsListItems = [], length =  this.formulasGroups.length;

                for (i = 0; i < length; ++i) {
                    if (this.formulasGroups.at(i).get('functions').length) {
                        groupsListItems.push({
                            value           : this.formulasGroups.at(i).get('index'),
                            displayValue    : this.translationTable[this.formulasGroups.at(i).get('name')][lang]
                        });
                    }
                }

                if (!this.cmbFuncGroup) {
                    this.cmbFuncGroup = new Common.UI.ComboBox({
                        el          : $('#formula-dlg-combo-group'),
                        menuStyle   : 'min-width: 268px;',
                        cls         : 'input-group-nr',
                        data        : groupsListItems,
                        editable    : false
                    });

                    this.cmbFuncGroup.on('selected', _.bind(this.onSelectGroup, this));
                } else {
                    this.cmbFuncGroup.setData(groupsListItems);
                }
                this.cmbFuncGroup.setValue(0);
            }
        },
        fillFunctions: function (name) {
            if (this.formulasGroups) {

                if (!this.cmbListFunctions && !this.functions) {
                    this.functions = new Common.UI.DataViewStore();

                    this.cmbListFunctions = new Common.UI.ListView({
                        el: $('#formula-dlg-combo-functions'),
                        store: this.functions,
                        itemTemplate: _.template('<div id="<%= id %>" class="list-item" style="pointer-events:none;"><%= value %></div>')
                    });

                    this.cmbListFunctions.on('item:select', _.bind(this.onSelectFunction, this));
                    this.cmbListFunctions.on('item:dblclick', _.bind(this.onDblClickFunction, this));
                    this.cmbListFunctions.on('entervalue', _.bind(this.onPrimary, this));
                    this.cmbListFunctions.onKeyDown = _.bind(this.onKeyDown, this.cmbListFunctions);
                    this.cmbListFunctions.$el.find('.listview').focus();
                    this.cmbListFunctions.scrollToRecord =  _.bind(this.onScrollToRecordCustom, this.cmbListFunctions);
                }

                if (this.functions) {
                    this.functions.reset();

                    var i = 0,
                        length = 0,
                        functions = null,
                        group = this.formulasGroups.findWhere({name : name});

                    if (group) {
                        functions = group.get('functions');
                        if (functions && functions.length) {
                            length = functions.length;
                            for (i = 0; i < length; ++i) {
                                this.functions.push(new Common.UI.DataViewModel({
                                    id              : functions[i].get('index'),
                                    selected        : i < 1,
                                    allowSelected   : true,
                                    value           : functions[i].get('name')
                                }));
                            }

                            this.applyFunction = functions[0].get('name');

                            this.syntaxLabel.text(this.applyFunction + functions[0].get('args'));
                            this.cmbListFunctions.scroller.update({
                                minScrollbarLength  : 40,
                                alwaysVisibleY      : true
                            });
                        }
                    }
                }
            }
        },

        onKeyDown: function (e, event) {
            var i = 0, record = null,
                me = this,
                charVal = '',
                value = '',
                firstRecord = null,
                recSelect = false,
                innerEl = null,
                isEqualSelectRecord = false,
                selectRecord = null,
                needNextRecord = false;

            if (this.disabled) return;
            if (_.isUndefined(undefined)) event = e;

            function selectItem (item) {
                me.selectRecord(item);
                me.scrollToRecord(item);

                innerEl = $(me.el).find('.inner');
                me.scroller.scrollTop(innerEl.scrollTop(), 0);

                event.preventDefault();
                event.stopPropagation();
            }

            charVal = String.fromCharCode(e.keyCode);
            if (e.keyCode > 64 && e.keyCode < 91 && charVal && charVal.length) {

                selectRecord = this.store.findWhere({selected: true});
                if (selectRecord) {
                    value = selectRecord.get('value');
                    isEqualSelectRecord = (value && value.length && value[0] === charVal)
                }

                for (i = 0; i < this.store.length; ++i) {
                    record = this.store.at(i);
                    value = record.get('value');

                    if (value[0] === charVal) {

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

            Common.UI.DataView.prototype.onKeyDown.call(this, e, event);
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

        cancelButtonText:               'Cancel',
        okButtonText:                   'Ok',
        sCategoryAll:                   'All',
        sCategoryLogical:               'Logical',
        sCategoryCube:                  'Cube',
        sCategoryDatabase:              'Database',
        sCategoryDateAndTime:           'Date and time',
        sCategoryEngineering:           'Engineering',
        sCategoryFinancial:             'Financial',
        sCategoryInformation:           'Information',
        sCategoryLookupAndReference:    'LookupAndReference',
        sCategoryMathematic:            'Math and trigonometry',
        sCategoryStatistical:           'Statistical',
        sCategoryTextAndData:           'Text and data',
        textGroupDescription:           'Select Function Group',
        textListDescription:            'Select Function',
        sDescription:                   'Description',
        sCategoryAll_de:                'Alle',
        sCategoryCube_de:               'Cube',
        sCategoryDatabase_de:           'Datenbank',
        sCategoryDateAndTime_de:        'Datum und Uhrzeit',
        sCategoryEngineering_de:        'Konstruktion',
        sCategoryFinancial_de:          'Finanzmathematik',
        sCategoryInformation_de:        'Information',
        sCategoryLogical_de:            'Logisch',
        sCategoryLookupAndReference_de: 'Suchen und Bezüge',
        sCategoryMathematic_de:         'Mathematik und Trigonometrie',
        sCategoryStatistical_de:        'Statistik',
        sCategoryTextAndData_de:        'Text und Daten',
        sCategoryAll_ru:                'Все',
        sCategoryCube_ru:               'Кубические',
        sCategoryDatabase_ru:           'Базы данных',
        sCategoryDateAndTime_ru:        'Дата и время',
        sCategoryEngineering_ru:        'Инженерные',
        sCategoryFinancial_ru:          'Финансовые',
        sCategoryInformation_ru:        'Информационные',
        sCategoryLogical_ru:            'Логические',
        sCategoryLookupAndReference_ru: 'Поиск и ссылки',
        sCategoryMathematic_ru:         'Математические',
        sCategoryStatistical_ru:        'Статистические',
        sCategoryTextAndData_ru:        'Текст и данные',
        txtTitle:                       'Insert Function'
    }, SSE.Views.FormulaDialog || {}));
});