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
 *  LanguageDialog.js
 *
 *  Created by Julia Radzhabova on 04/25/2017
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/Window'
], function () { 'use strict';

    Common.Views.LanguageDialog = Common.UI.Window.extend(_.extend({

    options: {
        header: false,
        width: 350,
        cls: 'modal-dlg'
    },

    template:   '<div class="box">' +
    '<div class="input-row">' +
    '<label><%= label %></label>' +
    '</div>' +
    '<div class="input-row" id="id-document-language">' +
    '</div>' +
    '</div>' +
    '<div class="footer right">' +
    '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;"><%= btns.ok %></button>'+
    '<button class="btn normal dlg-btn" result="cancel"><%= btns.cancel %></button>'+
    '</div>',

    initialize : function(options) {
        _.extend(this.options, options || {}, {
            label: this.labelSelect,
            btns: {ok: this.btnOk, cancel: this.btnCancel}
        });
        this.options.tpl = _.template(this.template)(this.options);

        Common.UI.Window.prototype.initialize.call(this, this.options);
    },

    render: function() {
        Common.UI.Window.prototype.render.call(this);

        var $window = this.getChild();
        $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

        this.cmbLanguage = new Common.UI.ComboBox({
            el: $window.find('#id-document-language'),
            cls: 'input-group-nr',
            menuStyle: 'min-width: 318px; max-height: 300px;',
            editable: false,
            template: _.template([
                '<span class="input-group combobox <%= cls %> combo-langs" id="<%= id %>" style="<%= style %>">',
                    '<input type="text" class="form-control">',
                    '<span class="icon input-icon spellcheck-lang img-toolbarmenu"></span>',
                    '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret img-commonctrl"></span></button>',
                    '<ul class="dropdown-menu <%= menuCls %>" style="<%= menuStyle %>" role="menu">',
                        '<% _.each(items, function(item) { %>',
                        '<li id="<%= item.id %>" data-value="<%= item.value %>">',
                            '<a tabindex="-1" type="menuitem" style="padding-left: 28px !important;" langval="<%= item.value %>">',
                                '<i class="icon <% if (item.spellcheck) { %> img-toolbarmenu spellcheck-lang <% } %>"></i>',
                                '<%= scope.getDisplayValue(item) %>',
                            '</a>',
                        '</li>',
                        '<% }); %>',
                    '</ul>',
                '</span>'
            ].join('')),
            data: this.options.languages
        });

        if (this.cmbLanguage.scroller) this.cmbLanguage.scroller.update({alwaysVisibleY: true});
        this.cmbLanguage.on('selected', _.bind(this.onLangSelect, this));
        var langname = Common.util.LanguageInfo.getLocalLanguageName(this.options.current);
        this.cmbLanguage.setValue(langname[0], langname[1]);
        this.onLangSelect(this.cmbLanguage, this.cmbLanguage.getSelectedRecord());
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
        cmb.$el.find('.input-icon').toggleClass('spellcheck-lang', rec.spellcheck);
        cmb._input.css('padding-left', rec.spellcheck ? 25 : 3);
    },

    onPrimary: function() {
        if (this.options.handler) {
            this.options.handler.call(this, 'ok', this.cmbLanguage.getValue());
        }

        this.close();
        return false;
    },

    labelSelect     : 'Select document language',
    btnCancel       : 'Cancel',
    btnOk           : 'Ok'
    }, Common.Views.LanguageDialog || {}))
});