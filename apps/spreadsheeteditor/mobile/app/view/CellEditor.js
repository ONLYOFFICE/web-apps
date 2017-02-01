/*
 *
 * (c) Copyright Ascensio System Limited 2010-2017
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
 *    CellEdit.js
 *
 *    Created by Maxim Kadushkin on 11/28/2016
 *    Copyright (c) 2016 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!spreadsheeteditor/mobile/app/template/CellEditor.template',
    'jquery',
    'underscore',
    'backbone'
], function (template, $, _, Backbone) {
    'use strict';

    SSE.Views.CellEditor = Backbone.View.extend({

        el: '.pages > .page',
        template: _.template(template),

        events: {
            'click button#ce-btn-expand': 'expandEditor',
            'click #ce-function': function (e) {
                this.fireEvent('function:click', this);
            }
        },

        initialize: function (options) {
        },

        render: function () {
            var $el = $(this.el);
            this.$el = $(this.template()).prependTo($el);

            this.$cellname = $('#ce-cell-name', this.el);
            this.$btnexpand = $('#ce-btn-expand', this.el);
            // this.$btnfunc = $('#ce-function', this.el);

            return this;
        },

        updateCellInfo: function(info) {
            if (info) {
                this.$cellname.html(typeof(info)=='string' ? info : info.asc_getName());
            }
        },

        expandEditor: function() {
            if (this.$el.hasClass('expanded')) {
                this.$el.removeClass('expanded');
                this.$btnexpand.removeClass('collapse');
            } else {
                this.$el.addClass('expanded');
                this.$btnexpand.addClass('collapse');
            }

            // Common.NotificationCenter.trigger('layout:changed', 'celleditor');
            // Common.NotificationCenter.trigger('edit:complete', this.editor, {restorefocus:true});
        },

        cellNameDisabled: function(disabled){
            // (disabled) ? this.$cellname.attr('disabled', 'disabled') : this.$cellname.removeAttr('disabled');
            // this.$btnfunc.toggleClass('disabled', disabled);
            // this.btnNamedRanges.setDisabled(disabled);
        }
    });
});
