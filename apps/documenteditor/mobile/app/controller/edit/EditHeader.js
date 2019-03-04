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
 *  EditHeader.js
 *  Document Editor
 *
 *  Created by Julia Radzhabova on 2/15/19
 *  Copyright (c) 2019 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'documenteditor/mobile/app/view/edit/EditHeader',
    'jquery',
    'underscore',
    'backbone'
], function (core, view, $, _, Backbone) {
    'use strict';

    DE.Controllers.EditHeader = Backbone.Controller.extend(_.extend((function() {
        // Private
        var _stack = [],
            _headerObject = undefined,
            _startAt = 1;

        return {
            models: [],
            collections: [],
            views: [
                'EditHeader'
            ],

            initialize: function () {
                Common.NotificationCenter.on('editcontainer:show', _.bind(this.initEvents, this));
                Common.NotificationCenter.on('editcategory:show',  _.bind(this.categoryShow, this));

                this.addListeners({
                    'EditHeader': {
                        'page:show'     : this.onPageShow
                    }
                });
            },

            setApi: function (api) {
                var me = this;
                me.api = api;

                me.api.asc_registerCallback('asc_onFocusObject',        _.bind(me.onApiFocusObject, me));
            },

            onLaunch: function () {
                this.createView('EditHeader').render();
            },

            initEvents: function () {
                var me = this;

                $('#header-diff-first input:checkbox').single('change',         _.bind(me.onDiffFirst, me));
                $('#header-diff-odd input:checkbox').single('change',           _.bind(me.onDiffOdd, me));
                $('#header-same-as input:checkbox').single('change',            _.bind(me.onSameAs, me));
                $('#header-numbering-continue input:checkbox').single('change', _.bind(me.onNumberingContinue, me));
                $('#header-numbering-start .button').single('click',            _.bind(me.onStartAt, me));

                me.initSettings();
            },

            categoryShow: function (e) {
                var $target = $(e.currentTarget);

                if ($target && $target.prop('id') === 'edit-header') {
                    this.initSettings();
                }
            },

            onPageShow: function () {
                var me = this;
                me.initSettings();
            },

            initSettings: function () {
                var me = this;

                if (_headerObject) {
                    $('#header-diff-first input:checkbox').prop('checked', _headerObject.get_DifferentFirst());
                    $('#header-diff-odd input:checkbox').prop('checked', _headerObject.get_DifferentEvenOdd());

                    var value = _headerObject.get_LinkToPrevious();
                    $('#header-same-as input:checkbox').prop('checked', !!value);
                    $('#header-same-as').toggleClass('disabled', value===null);

                    value = _headerObject.get_StartPageNumber();
                    $('#header-numbering-continue input:checkbox').prop('checked', value<0);
                    $('#header-numbering-start').toggleClass('disabled', value<0);
                    if (value>=0)
                        _startAt=value;
                    $('#header-numbering-start .item-after label').text(_startAt);
                }
            },

            // Public
            // Handlers

            onDiffFirst: function (e) {
                var $checkbox = $(e.currentTarget);
                this.api.HeadersAndFooters_DifferentFirstPage($checkbox.is(':checked'));
            },

            onDiffOdd: function (e) {
                var $checkbox = $(e.currentTarget);
                this.api.HeadersAndFooters_DifferentOddandEvenPage($checkbox.is(':checked'));
            },

            onSameAs: function (e) {
                var $checkbox = $(e.currentTarget);
                this.api.HeadersAndFooters_LinkToPrevious($checkbox.is(':checked'));
            },

            onNumberingContinue: function (e) {
                var $checkbox = $(e.currentTarget);
                $('#header-numbering-start').toggleClass('disabled', $checkbox.is(':checked'));
                this.api.asc_SetSectionStartPage($checkbox.is(':checked') ? -1 : _startAt);
            },

            onStartAt: function (e) {
                var $button = $(e.currentTarget),
                    start = _startAt;

                if ($button.hasClass('decrement')) {
                    start = Math.max(1, --start);
                } else {
                    start = Math.min(2147483646, ++start);
                }
                _startAt = start;

                $('#header-numbering-start .item-after label').text(start);

                this.api.asc_SetSectionStartPage(start);
            },

            // API handlers

            onApiFocusObject: function (objects) {
                _stack = objects;

                var headers = [];

                _.each(_stack, function(object) {
                    if (object.get_ObjectType() == Asc.c_oAscTypeSelectElement.Header) {
                        headers.push(object);
                    }
                });

                if (headers.length > 0) {
                    var object = headers[headers.length - 1]; // get top
                    _headerObject = object.get_ObjectValue();
                } else {
                    _headerObject = undefined;
                }
            }
        }
    })(), DE.Controllers.EditHeader || {}))
});