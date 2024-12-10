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
 *  RoleDeleteDlg.js
 *
 *  Created on 15/04/22
 *
 */

define([], function () { 'use strict';

    DE.Views.RoleDeleteDlg = Common.UI.Window.extend(_.extend({
        options: {
            width: 300,
            cls: 'modal-dlg',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box">',
                    '<div class="" style="margin-bottom: 10px;">',
                        '<label>' + this.textLabel + '</label>',
                    '</div>',
                    '<div class="input-row" style="">',
                        '<label>' + this.textSelect + '</label>',
                    '</div>',
                    '<div style="margin-bottom: 12px;">',
                        '<div id="id-role-del-remove" class="input-group-nr"></div>',
                    '</div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.props = options.props;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);
            var $window = this.getChild();
            $window.find('.dlg-btn').on('click',     _.bind(this.onBtnClick, this));

            this.cmbRole = new Common.UI.ComboBox({
                el: $('#id-role-del-remove', $window),
                style: 'width: 100%;',
                menuStyle: 'min-width: 100%;max-height: 190px;max-width: 400px;',
                cls: 'input-group-nr',
                data: [],
                itemsTemplate: _.template([
                    '<% _.each(items, function(item) { %>',
                        '<li id="<%= item.id %>" data-value="<%= item.value %>"><a tabindex="-1" type="menuitem" style="overflow: hidden; text-overflow: ellipsis;"><%= scope.getDisplayValue(item) %></a></li>',
                    '<% }); %>'
                ].join('')),
                editable: false,
                takeFocusOnClose: true
            });

            
            this.afterRender();
        },

        getFocusedComponents: function() {
            return [this.cmbRole].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.cmbRole;
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        _setDefaults: function (props) {
            if (props) {
                var arr = [];
                props.roles.each(function(item, index){
                    var name =  item.get('name');
                    if (name!==props.excludeName)
                        arr.push({value: name, displayValue: name});
                });
                this.cmbRole.setData(arr);
                (arr.length>0) && this.cmbRole.setValue(arr[0].value);
            }
        },

        onPrimary: function(event) {
            this._handleInput('ok');
            return false;
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                this.options.handler.call(this, state, this.cmbRole.getValue());
            }

            this.close();
        },

        textTitle: 'Delete Role',
        textLabel: 'To delete this role, you  need to move the fields associated with it to another role.',
        textSelect: 'Select for field merger role'

    }, DE.Views.RoleDeleteDlg || {}));
});