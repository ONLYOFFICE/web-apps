/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 *  LanguageDialog.js
 *
 *  Created on 04/25/2017
 *
 */

if (Common === undefined)
    var Common = {};

define([], function () { 'use strict';

    Common.Views.LanguageDialog = Common.UI.Window.extend(_.extend({

    options: {
        header: false,
        width: 350,
        cls: 'modal-dlg',
        buttons: ['ok', 'cancel']
    },

    template:   '<div class="box">' +
        '<div class="input-row">' +
        '<label><%= label %></label>' +
        '</div>' +
        '<div class="input-row" id="id-document-language">' +
        '</div>' +
        '</div>',

    initialize : function(options) {
        _.extend(this.options, options || {}, {
            label: this.labelSelect
        });
        this.options.tpl = _.template(this.template)(this.options);

        Common.UI.Window.prototype.initialize.call(this, this.options);
    },

    render: function() {
        Common.UI.Window.prototype.render.call(this);

        var $window = this.getChild();
        $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

        var lckey = "app-settings-recent-langs";
        this.cmbLanguage = new Common.UI.ComboBoxRecent({
            el: $window.find('#id-document-language'),
            cls: 'input-group-nr',
            menuCls: 'shifted-right',
            menuStyle: 'min-width: 318px; max-height: 285px;',
            editable: false,
            recent: {
                count: Common.Utils.InternalSettings.get(lckey + "-count") || 5,
                offset: Common.Utils.InternalSettings.get(lckey + "-offset") || 0,
                key: lckey,
                valueField: 'value'
            },
            template: _.template([
                '<span class="input-group combobox <%= cls %> combo-langs" id="<%= id %>" style="<%= style %>">',
                    '<input type="text" class="form-control">',
                    '<span class="icon input-icon spellcheck-lang toolbar__icon btn-ic-docspell"></span>',
                    '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">',
                        '<span class="caret" />',
                    '</button>',
                    '<ul class="dropdown-menu <%= menuCls %>" style="<%= menuStyle %>" role="menu">',
                    '</ul>',
                '</span>'
            ].join('')),
            itemTemplate: _.template([
                '<li id="<%= id %>" data-value="<%= value %>">',
                    '<a tabindex="-1" type="menuitem" langval="<%= value %>">',
                        '<div>',
                            '<i class="icon <% if (spellcheck) { %> toolbar__icon btn-ic-docspell spellcheck-lang <% } %>"></i>',
                            '<%= displayValue %>',
                        '</div>',
                        '<label style="opacity: 0.6"><%= displayValueEn %></label>',
                    '</a>',
                '</li>'].join('')),
            data: this.options.languages,
            takeFocusOnClose: true,
            search: true,
            searchFields: ['displayValue', 'displayValueEn'],
            scrollAlwaysVisible: true
        });

        if (this.cmbLanguage.scroller) this.cmbLanguage.scroller.update({alwaysVisibleY: true});
        this.cmbLanguage.on('selected', _.bind(this.onLangSelect, this));
        var langname = Common.util.LanguageInfo.getLocalLanguageName(this.options.current);
        this.cmbLanguage.setValue(langname[0], langname[1]);
        this.onLangSelect(this.cmbLanguage, this.cmbLanguage.getSelectedRecord());

        var me = this;
        setTimeout(function(){
            me.cmbLanguage.focus();
        }, 100);
    },

    getFocusedComponents: function() {
        return [this.cmbLanguage].concat(this.getFooterButtons());
    },

    getDefaultFocusableComponent: function () {
        return this.cmbLanguage;
    },

    close: function(suppressevent) {
        var $window = this.getChild();
        if (!$window.find('.combobox.open').length) {
            Common.UI.Window.prototype.close.call(this, arguments);
        }
    },

    onBtnClick: function(event) {
        if (this.options.handler) {
            this.options.handler.call(this, event.currentTarget.attributes['result'].value, this.cmbLanguage.getValue());
        }

        this.close();
    },

    onLangSelect: function(cmb, rec, e) {
        cmb.$el.find('.input-icon').toggleClass('spellcheck-lang', rec && rec.spellcheck);
        cmb._input.css(Common.UI.isRTL() ? 'padding-right' : 'padding-left', rec && rec.spellcheck ? 25 : 3);
    },

    onPrimary: function() {
        if (this.options.handler) {
            this.options.handler.call(this, 'ok', this.cmbLanguage.getValue());
        }

        this.close();
        return false;
    },

    labelSelect     : 'Select document language'
    }, Common.Views.LanguageDialog || {}))
});
