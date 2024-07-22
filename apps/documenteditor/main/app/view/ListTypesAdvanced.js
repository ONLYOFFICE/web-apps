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
 *  ListTypesAdvanced.js
 *
 *  Created on 11/16/2022
 *
 */


define([], function () { 'use strict';

    DE.Views.ListTypesAdvanced = Common.UI.Window.extend(_.extend({

    options: {
        header: false,
        width: 250,
        cls: 'modal-dlg',
        buttons: ['ok', 'cancel']
    },

    template:   '<div class="box">' +
        '<div class="input-row">' +
            '<label><%= label %></label>' +
        '</div>' +
            '<div class="input-row" id="id-advanced-list-type">' +
        '</div>' +
        '</div>',

    initialize : function(options) {
        _.extend(this.options, options || {}, {
            label: this.labelSelect
        });
        this.options.tpl = _.template(this.template)(this.options);
        this.lang = this.options.lang;
        Common.UI.Window.prototype.initialize.call(this, this.options);
    },

    render: function() {
        Common.UI.Window.prototype.render.call(this);

        var $window = this.getChild();
        $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

        var data = [];
        var me = this;
        Asc.c_oAscAllNumberingTypes && Asc.c_oAscAllNumberingTypes.forEach(function(item) {
            data.push( { displayValue: AscCommon.IntToNumberFormat(1, item, me.lang) + ', ' + AscCommon.IntToNumberFormat(2, item, me.lang) + ', ' + AscCommon.IntToNumberFormat(3, item, me.lang) + ',...', value: item });
        });

        this.cmbTypes = new Common.UI.ComboBox({
            el: $window.find('#id-advanced-list-type'),
            cls: 'input-group-nr',
            menuStyle: 'min-width: 100%; max-height: 190px;',
            data: data,
            editable: false,
            takeFocusOnClose: true,
            scrollAlwaysVisible: true
        });

        if (this.cmbTypes.scroller) this.cmbTypes.scroller.update({alwaysVisibleY: true});
        var rec = (this.options.current!==undefined) ? this.cmbTypes.store.findWhere({value: this.options.current}) : null;
        this.cmbTypes.setValue(rec ? rec.value : Asc.c_oAscNumberingFormat.Decimal);

        var me = this;
        setTimeout(function(){
            me.cmbTypes.focus();
        }, 100);
    },

    getFocusedComponents: function() {
        return [this.cmbTypes].concat(this.getFooterButtons());
    },

    getDefaultFocusableComponent: function () {
        return this.cmbTypes;
    },

    close: function(suppressevent) {
        var $window = this.getChild();
        if (!$window.find('.combobox.open').length) {
            Common.UI.Window.prototype.close.call(this, arguments);
        }
    },

    onBtnClick: function(event) {
        if (this.options.handler) {
            this.options.handler.call(this, event.currentTarget.attributes['result'].value, this.cmbTypes.getValue());
        }

        this.close();
    },

    onPrimary: function() {
        if (this.options.handler) {
            this.options.handler.call(this, 'ok', this.cmbTypes.getValue());
        }

        this.close();
        return false;
    },

    labelSelect     : 'Select list type'
    }, DE.Views.ListTypesAdvanced || {}))
});