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
 *  Toolbar.js
 *  Spreadsheet Editor
 *
 *  Created by Maxim Kadushkin on 11/15/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!spreadsheeteditor/mobile/app/template/Toolbar.template',
    'jquery',
    'underscore',
    'backbone'
], function (toolbarTemplate, $, _, Backbone) {
    'use strict';

    SSE.Views.Toolbar = Backbone.View.extend(_.extend((function() {
        // private

        return {
            el: '.view-main',

            // Compile our stats template
            template: _.template(toolbarTemplate),

            // Delegated events for creating new items, and clearing completed ones.
            events: {
                "click #toolbar-search"     : "searchToggle",
                "click #toolbar-edit"       : "showEdition",
                "click #toolbar-add"        : "showInserts",
                "click #toolbar-settings"   : "showSettings",
                "click #toolbar-edit-document": "editDocument"
            },

            // Set innerHTML and get the references to the DOM elements
            initialize: function() {
                var me = this;
            },

            // Render layout
            render: function() {
                var me = this,
                    $el = $(me.el);

                $el.prepend(me.template({
                    android     : Common.SharedSettings.get('android'),
                    phone       : Common.SharedSettings.get('phone'),
                    backTitle   : Common.SharedSettings.get('android') ? '' : me.textBack
                }));

                $('.view-main .navbar').on('addClass removeClass', _.bind(me.onDisplayMainNavbar, me));
                $('#toolbar-edit, #toolbar-add, #toolbar-settings, #toolbar-search, #document-back, #toolbar-edit-document').addClass('disabled');

                this.$btnEdit = $el.find('#toolbar-edit');
                this.$btnAdd = $el.find('#toolbar-add');

                return me;
            },

            setMode: function (mode) {
                if (mode.isEdit) {
                    $('#toolbar-edit, #toolbar-add, #toolbar-undo, #toolbar-redo').show();
                } else if (mode.canEdit && mode.canRequestEditRights){
                    $('#toolbar-edit-document').show();
                }
            },

            onDisplayMainNavbar: function (e) {
                var $target = $(e.currentTarget),
                    navbarHidden = $target.hasClass('navbar-hidden'),
                    pickerHeight = $('.picker-modal').height() || 260;

                $('#editor_sdk').css({
                    top     : navbarHidden ? 0 : '',
                    bottom  : navbarHidden ? pickerHeight : ''
                });
            },

            // Search
            searchToggle: function() {
                if ($$('.searchbar.document').length > 0) {
                    this.hideSearch();
                } else {
                    this.showSearch();
                }
            },

            showSearch: function () {
                SSE.getController('Search').showSearch();
            },

            hideSearch: function () {
                SSE.getController('Search').hideSearch();
            },

            // Editor
            showEdition: function () {
                SSE.getController('EditContainer').showModal();
            },

            // Inserts

            showInserts: function () {
                SSE.getController('AddContainer').showModal();
            },

            // Settings
            showSettings: function () {
                SSE.getController('Settings').showModal();
            },

            disableControl: function (opts, val) {
                if (!(opts.indexOf('add') < 0))
                    this.$btnAdd.toggleClass('disabled', val);

                if (!(opts.indexOf('edit') < 0))
                    this.$btnEdit.toggleClass('disabled', val);
            },

            editDocument: function () {
                Common.Gateway.requestEditRights();
            },

            textBack: 'Back'
        }
    })(), SSE.Views.Toolbar || {}))
});
