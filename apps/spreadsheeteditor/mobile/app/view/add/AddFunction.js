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
 *  AddFunction.js
 *
 *  Created by Maxim Kadushkin on 12/14/2016
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!spreadsheeteditor/mobile/app/template/AddFunction.template',
    'backbone'
], function (addTemplate, Backbone) {
    'use strict';

    SSE.Views.AddFunction = Backbone.View.extend(_.extend((function() {
        var _openView = function (viewid, args) {
            var rootView = SSE.getController('AddContainer').rootView;
            if ( rootView ) {
                var _params = {
                    android     : Common.SharedSettings.get('android'),
                    phone       : Common.SharedSettings.get('phone'),
                    view        : viewid,
                    scope       : this
                };

                _.extend(_params, args);
                var $content = $('<div/>').append(_.template(this.template)(_params));

                // Android fix for navigation
                if (Framework7.prototype.device.android) {
                    $content.find('.page').append($content.find('.navbar'));
                }

                rootView.router.load({
                    content: $content.html()
                });
            }
        };

        return {
            // el: '.view-main',

            template: addTemplate,

            events: {
            },

            initialize: function () {
                Common.NotificationCenter.on('addcontainer:show', _.bind(this.initEvents, this));
            },

            initEvents: function () {
                var me = this;

                $('.settings').single('click', '.function .icon-info', this.onFunctionInfoClick.bind(this))
                                .on('click', '.function > a', this.onFunctionClick.bind(this));
                $('.groups a.group').single('click', this.onGroupClick.bind(this));

                Common.Utils.addScrollIfNeed('#add-formula .pages', '#add-formula .page');
                me.initControls();
            },

            // Render layout
            render: function () {
                var me = this;

                var quickFunctions = [
                    {caption: 'SUM',   type: 'SUM'},
                    {caption: 'MIN',   type: 'MIN'},
                    {caption: 'MAX',   type: 'MAX'},
                    {caption: 'COUNT', type: 'COUNT'}
                ];

                if (me.functions) {
                    _.each(quickFunctions, function (quickFunction) {
                        quickFunction.caption = me.functions[quickFunction.type].caption
                    });
                }
                var lang = me.lang;

                this.translatTable = {};

                var name = '', translate = '',
                    descriptions = ['DateAndTime', 'Engineering', 'Financial', 'Information', 'Logical', 'LookupAndReference', 'Mathematic', 'Statistical', 'TextAndData' ];
                for (var i=0; i<descriptions.length; i++) {
                    name = descriptions[i];
                    translate = 'sCat' + name;
                    this.translatTable[name] = {
                        en: this[translate],
                        de: this[translate+'_de'],
                        ru: this[translate+'_ru'],
                        pl: this[translate+'_pl'],
                        es: this[translate+'_es'],
                        fr: this[translate+'_fr']
                    };
                }

                me.groups = {
                    'DateAndTime':          me.translatTable['DateAndTime'][lang] || me.translatTable['DateAndTime']['en'],
                    'Engineering':          me.translatTable['Engineering'][lang] || me.translatTable['Engineering']['en'],
                    'TextAndData':          me.translatTable['TextAndData'][lang] || me.translatTable['TextAndData']['en'],
                    'Statistical':          me.translatTable['Statistical'][lang] || me.translatTable['Statistical']['en'],
                    'Financial':            me.translatTable['Financial'][lang]   || me.translatTable['Financial']['en'],
                    'Mathematic':           me.translatTable['Mathematic'][lang]  || me.translatTable['Mathematic']['en'],
                    'LookupAndReference':   me.translatTable['LookupAndReference'][lang] || me.translatTable['LookupAndReference']['en'],
                    'Information':          me.translatTable['Information'][lang] || me.translatTable['Information']['en'],
                    'Logical':              me.translatTable['Logical'][lang] || me.translatTable['Logical']['en']
                };

                me.layout = $('<div/>').append(_.template(me.template)({
                    android     : Common.SharedSettings.get('android'),
                    phone       : Common.SharedSettings.get('phone'),
                    textGroups  : me.textGroups,
                    quick       : quickFunctions,
                    groups      : me.groups,
                    view        : 'root'
                }));

                return this;
            },

            setFunctions: function (arr, lang) {
                this.functions = arr;
                this.lang = lang;
            },

            rootLayout: function () {
                if (this.layout) {
                    return this.layout.find('#add-function-root').html();
                }

                return '';
            },

            layoutPage: function () {
                return this.layout ? this.layout.find('#add-function-root').html() : '';
            },

            layoutPanel: function() {
                return this.layout ? this.layout.find('#add-function-root .page-content').html() : '';
            },

            initControls: function () {
                //
            },

            onFunctionClick: function (e) {
                // if ( !/info/.test(e.target.className) )
                    this.fireEvent('function:insert', [$(e.currentTarget).data('func')]);
            },

            onFunctionInfoClick: function(e) {
                e.stopPropagation();

                var type = $(e.target).parents('.item-link').data('func');
                this.fireEvent('function:info', [type]);
            },

            onGroupClick: function (e) {
                var group = $(e.target).parents('.group').data('type');
                var items = [];
                for (var k in this.functions) {
                    if (this.functions[k].group == group)
                        items.push(this.functions[k]);
                }

                _openView.call(this, 'group', {
                    groupname   : this.groups[group],
                    functions   : items
                });
                Common.Utils.addScrollIfNeed('.view.add-root-view .page-on-center', '.view.add-root-view .page-on-center .page-content');
            },

            openFunctionInfo: function (type) {
                _openView.call(this, 'info', this.functions[type]);
                Common.Utils.addScrollIfNeed('.view.add-root-view .page-on-center', '.view.add-root-view .page-on-center .page-content');
            },

            textGroups:                'CATEGORIES',
            textBack:                  'Back',
            sCatLogical:               'Logical',
            // sCatCube:                  'Cube',
            // sCatDatabase:              'Database',
            sCatDateAndTime:           'Date and time',
            sCatEngineering:           'Engineering',
            sCatFinancial:             'Financial',
            sCatInformation:           'Information',
            sCatLookupAndReference:    'Lookup and Reference',
            sCatMathematic:            'Math and trigonometry',
            sCatStatistical:           'Statistical',
            sCatTextAndData:           'Text and data',

            sCatDateAndTime_ru:        'Дата и время',
            sCatEngineering_ru:        'Инженерные',
            sCatFinancial_ru:          'Финансовые',
            sCatInformation_ru:        'Информационные',
            sCatLogical_ru:            'Логические',
            sCatLookupAndReference_ru: 'Поиск и ссылки',
            sCatMathematic_ru:         'Математические',
            sCatStatistical_ru:        'Статистические',
            sCatTextAndData_ru:        'Текст и данные',

            sCatLogical_es:            'Lógico',
            sCatDateAndTime_es:       'Fecha y hora',
            sCatEngineering_es:        'Ingenería',
            sCatFinancial_es:          'Financial',
            sCatInformation_es:        'Información',
            sCatLookupAndReference_es: 'Búsqueda y referencia',
            sCatMathematic_es:         'Matemáticas y trigonometría',
            sCatStatistical_es:        'Estadístico',
            sCatTextAndData_es:        'Texto y datos',

            sCatLogical_fr:            'Logique',
            sCatDateAndTime_fr:        'Date et heure',
            sCatEngineering_fr:        'Ingénierie',
            sCatFinancial_fr:          'Financier',
            sCatInformation_fr:        'Information',
            sCatLookupAndReference_fr: 'Recherche et référence',
            sCatMathematic_fr:         'Maths et trigonométrie',
            sCatStatistical_fr:        'Statistiques',
            sCatTextAndData_fr:        'Texte et données',

            sCatLogical_pl:            'Logiczny',
            sCatDateAndTime_pl:        'Data i czas',
            sCatEngineering_pl:        'Inżyniera',
            sCatFinancial_pl:          'Finansowe',
            sCatInformation_pl:        'Informacja',
            sCatLookupAndReference_pl: 'Wyszukiwanie i odniesienie',
            sCatMathematic_pl:         'Matematyczne i trygonometryczne',
            sCatStatistical_pl:        'Statystyczny',
            sCatTextAndData_pl:        'Tekst i data',

            sCatDateAndTime_de:        'Datum und Uhrzeit',
            sCatEngineering_de:        'Konstruktion',
            sCatFinancial_de:          'Finanzmathematik',
            sCatInformation_de:        'Information',
            sCatLogical_de:            'Logisch',
            sCatLookupAndReference_de: 'Suchen und Bezüge',
            sCatMathematic_de:         'Mathematik und Trigonometrie',
            sCatStatistical_de:        'Statistik',
            sCatTextAndData_de:        'Text und Daten'

        }
    })(), SSE.Views.AddFunction || {}));
});