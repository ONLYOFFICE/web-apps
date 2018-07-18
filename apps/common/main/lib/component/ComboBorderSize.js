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
 *  ComboBorderSize.js
 *
 *  Created by Julia Radzhabova on 2/10/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

/**
 *  Using template
 *
 *  <div class="input-group input-group-nr combobox combo-border-size" id="id-combobox">
 *      <div class="form-control"></div>
 *      <div style="display: table-cell;"></div>
 *      <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>
 *      <ul class="dropdown-menu"></ul>
 * </div>
 *
 */

if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/ComboBox'
], function () {
    'use strict';

    Common.UI.BordersModel = Backbone.Model.extend({
        defaults: function() {
            return {
                value: null,
                displayValue: null,
                pxValue: null,
                id: Common.UI.getId(),
                offsety: undefined
            }
        }
    });

    Common.UI.BordersStore = Backbone.Collection.extend({
        model: Common.UI.BordersModel
    });

    Common.UI.ComboBorderSize = Common.UI.ComboBox.extend(_.extend({
        template: _.template([
            '<div class="input-group combobox combo-border-size input-group-nr <%= cls %>" id="<%= id %>" style="<%= style %>">',
                '<div class="form-control" style="<%= style %>"></div>',
                '<div style="display: table-cell;"></div>',
                '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret img-commonctrl"></span></button>',
                '<ul class="dropdown-menu <%= menuCls %>" style="<%= menuStyle %>" role="menu">',
                    '<% _.each(items, function(item) { %>',
                        '<li id="<%= item.id %>" data-value="<%= item.value %>"><a tabindex="-1" type="menuitem">',
                            '<span><%= item.displayValue %></span>',
                            '<% if (item.offsety!==undefined) { %>',
                                '<img src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" align="right" style="background-position: 0 -<%= item.offsety %>px;">',
                            '<% } %>',
                        '</a></li>',
                    '<% }); %>',
                '</ul>',
            '</div>'
        ].join('')),

        initialize : function(options) {
            var txtPt = Common.Utils.Metric.getMetricName(Common.Utils.Metric.c_MetricUnits.pt),
                data = [
                    {displayValue: '0.5 ' + txtPt,   value: 0.5, pxValue: 0.5, offsety: 0},
                    {displayValue: '1 ' + txtPt,     value: 1,   pxValue: 1, offsety: 20},
                    {displayValue: '1.5 ' + txtPt,   value: 1.5, pxValue: 2, offsety: 40},
                    {displayValue: '2.25 ' + txtPt,  value: 2.25,pxValue: 3, offsety: 60},
                    {displayValue: '3 ' + txtPt,     value: 3,   pxValue: 4, offsety: 80},
                    {displayValue: '4.5 ' + txtPt,   value: 4.5, pxValue: 5, offsety: 100},
                    {displayValue: '6 ' + txtPt,     value: 6,   pxValue: 6, offsety: 120}
                ];
            if (options.allowNoBorders !== false)
                data.unshift({displayValue: this.txtNoBorders, value: 0, pxValue: 0 });

            Common.UI.ComboBox.prototype.initialize.call(this, _.extend({
                editable: false,
                store: new Common.UI.BordersStore(),
                data: data,
                menuStyle: 'min-width: 150px;'
            }, options));
        },

        render : function(parentEl) {
            Common.UI.ComboBox.prototype.render.call(this, parentEl);
            return this;
        },

        itemClicked: function (e) {
            var el = $(e.currentTarget).parent();

            this._selectedItem = this.store.findWhere({
                id: el.attr('id')
            });
            if (this._selectedItem) {
                $('.selected', $(this.el)).removeClass('selected');
                el.addClass('selected');
                this.updateFormControl(this._selectedItem);

                this.trigger('selected', this, _.extend({}, this._selectedItem.toJSON()), e);
                e.preventDefault();
            }
        },

        updateFormControl: function(record) {
            var formcontrol = $(this.el).find('.form-control');

            if (record.get('value')>0) {
                formcontrol[0].innerHTML = '';
                formcontrol.removeClass('text').addClass('image');
                formcontrol.css('background-position', '0 -' + record.get('offsety') + 'px');
            } else {
                formcontrol[0].innerHTML = this.txtNoBorders;
                formcontrol.removeClass('image').addClass('text');
            }
        },

        setValue: function(value) {
            this._selectedItem = (value===null || value===undefined) ? undefined : _.find(this.store.models, function(item) {
                if ( value<item.attributes.value+0.01 && value>item.attributes.value-0.01) {
                    return true;
                }
            });

            $('.selected', $(this.el)).removeClass('selected');

            if (this._selectedItem) {
                this.updateFormControl(this._selectedItem);
                $('#' + this._selectedItem.get('id'), $(this.el)).addClass('selected');
            } else {
                var formcontrol = $(this.el).find('.form-control');
                formcontrol[0].innerHTML = '';
                formcontrol.removeClass('image').addClass('text');
            }
        },

        txtNoBorders: 'No Borders'
    }, Common.UI.ComboBorderSize || {}));

    Common.UI.ComboBorderSizeEditable = Common.UI.ComboBox.extend(_.extend({
        template: _.template([
            '<span class="input-group combobox combo-border-size input-group-nr <%= cls %>" id="<%= id %>" style="<%= style %>">',
                '<input type="text" class="form-control text">',
                '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret img-commonctrl"></span></button>',
                '<ul class="dropdown-menu <%= menuCls %>" style="<%= menuStyle %>" role="menu">',
                    '<% _.each(items, function(item) { %>',
                        '<li id="<%= item.id %>" data-value="<%= item.value %>"><a tabindex="-1" type="menuitem">',
                            '<span><%= item.displayValue %></span>',
                            '<% if (item.offsety!==undefined) { %>',
                             '<img src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" align="right" style="background-position: 0 -<%= item.offsety %>px;">',
                            '<% } %>',
                        '</a></li>',
                    '<% }); %>',
                '</ul>',
            '</span>'
        ].join('')),

        initialize : function(options) {
            this.txtNoBorders = options.txtNoBorders || this.txtNoBorders;
            var txtPt = Common.Utils.Metric.getMetricName(Common.Utils.Metric.c_MetricUnits.pt),
                data = [
                    {displayValue: '0.5 ' + txtPt,   value: 0.5, pxValue: 0.5, offsety: 0},
                    {displayValue: '1 ' + txtPt,     value: 1,   pxValue: 1, offsety: 20},
                    {displayValue: '1.5 ' + txtPt,   value: 1.5, pxValue: 2, offsety: 40},
                    {displayValue: '2.25 ' + txtPt,  value: 2.25,pxValue: 3, offsety: 60},
                    {displayValue: '3 ' + txtPt,     value: 3,   pxValue: 4, offsety: 80},
                    {displayValue: '4.5 ' + txtPt,   value: 4.5, pxValue: 5, offsety: 100},
                    {displayValue: '6 ' + txtPt,     value: 6,   pxValue: 6, offsety: 120}
                ];

            if (options.allowNoBorders !== false)
                data.unshift({displayValue: this.txtNoBorders, value: 0, pxValue: 0 });

            Common.UI.ComboBox.prototype.initialize.call(this, _.extend({
                editable: true,
                store: new Common.UI.BordersStore(),
                data: data,
                menuStyle: 'min-width: 150px;'
            }, options));
        },

        render : function(parentEl) {
            Common.UI.ComboBox.prototype.render.call(this, parentEl);
            return this;
        },

        txtNoBorders: 'No Borders'
    }, Common.UI.ComboBorderSizeEditable || {}));

    Common.UI.ComboBorderType = Common.UI.ComboBorderSize.extend(_.extend({
        template: _.template([
            '<div class="input-group combobox combo-border-size input-group-nr <%= cls %>" id="<%= id %>" style="<%= style %>">',
                '<div class="form-control" style="<%= style %>"></div>',
                '<div style="display: table-cell;"></div>',
                '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret img-commonctrl"></span></button>',
                '<ul class="dropdown-menu <%= menuCls %>" style="<%= menuStyle %>" role="menu">',
                    '<% _.each(items, function(item) { %>',
                        '<li id="<%= item.id %>" data-value="<%= item.value %>"><a tabindex="-1" type="menuitem" style="padding: 2px 0;">',
                            '<span style="margin-top: 0;"></span>',
                            '<% if (item.offsety!==undefined) { %>',
                                '<img src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" align="left" style="background-position: 0 -<%= item.offsety %>px;">',
                            '<% } %>',
                        '</a></li>',
                    '<% }); %>',
                '</ul>',
            '</div>'
        ].join('')),

        initialize : function(options) {
            Common.UI.ComboBorderSize.prototype.initialize.call(this, _.extend({
                store: new Common.UI.BordersStore(),
                data: [
                    {value: Asc.c_oDashType.solid, offsety: 140},
                    {value: Asc.c_oDashType.sysDot, offsety: 160},
                    {value: Asc.c_oDashType.sysDash, offsety: 180},
                    {value: Asc.c_oDashType.dash, offsety: 200},
                    {value: Asc.c_oDashType.dashDot, offsety: 220},
                    {value: Asc.c_oDashType.lgDash, offsety: 240},
                    {value: Asc.c_oDashType.lgDashDot, offsety: 260},
                    {value: Asc.c_oDashType.lgDashDotDot, offsety: 280}
                ]
            }, options));
        },

        render : function(parentEl) {
            Common.UI.ComboBorderSize.prototype.render.call(this, parentEl);
            return this;
        },

        updateFormControl: function(record) {
            var formcontrol = $(this.el).find('.form-control');
            formcontrol[0].innerHTML = '';
            formcontrol.removeClass('text').addClass('image');
            formcontrol.css('background-position', '0 -' + record.get('offsety') + 'px');
        }
    }, Common.UI.ComboBorderType || {}));
});