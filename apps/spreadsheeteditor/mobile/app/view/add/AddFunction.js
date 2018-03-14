/*
 *
 * (c) Copyright Ascensio System Limited 2010-2018
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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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

                me.groups = {
                    'DateAndTime':          me.sCatDateAndTime,
                    'Engineering':          me.sCatEngineering,
                    'TextAndData':          me.sCatTextAndData,
                    'Statistical':          me.sCatStatistical,
                    'Financial':            me.sCatFinancial,
                    'Mathematic':           me.sCatMathematic,
                    'LookupAndReference':   me.sCatLookupAndReference,
                    'Information':          me.sCatInformation,
                    'Logical':              me.sCatLogical
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

            setFunctions: function (arr) {
                this.functions = arr;
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
            },

            openFunctionInfo: function (type) {
                _openView.call(this, 'info', this.functions[type]);
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
            sCatTextAndData:           'Text and data'

        }
    })(), SSE.Views.AddFunction || {}));
});