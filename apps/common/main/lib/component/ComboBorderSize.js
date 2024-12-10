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
 *  ComboBorderSize.js
 *
 *  Created on 2/10/14
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
                imgId: undefined
            }
        }
    });

    Common.UI.BordersStore = Backbone.Collection.extend({
        model: Common.UI.BordersModel
    });

    Common.UI.ComboBorderSize = Common.UI.ComboBox.extend(_.extend({
        template: _.template([
            '<div class="input-group combobox combo-border-size input-group-nr <%= cls %>" id="<%= id %>" style="<%= style %>">',
                '<div class="form-control" style="<%= style %>" role="combobox" aria-expanded="false" aria-controls="<%= id %>-menu" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-hint-offset="<%= dataHintOffset %>" data-move-focus-only-tab="true">',
                    '<i class="img-line"><svg><use xlink:href="#half-pt"></use></svg></i>',
                    '<span class="text"></span>',
                '</div>',
                '<div style="display: table-cell;"></div>',
                '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">',
                    '<span class="caret"></span>',
                '</button>',
                '<ul id="<%= id %>-menu" class="dropdown-menu <%= menuCls %>" style="<%= menuStyle %>" role="menu">',
                    '<% _.each(items, function(item) { %>',
                        '<li id="<%= item.id %>" data-value="<%= item.value %>" role="menuitem"><a tabindex="-1" type="menuitem">',
                            '<span><%= item.displayValue %></span>',
                            '<% if(item.imgId!==undefined) { %>',
                                '<span class="border-line">',
                                    '<svg>',
                                        '<use xlink:href="#<%= item.imgId %>"></use>',
                                    '</svg>',
                                '</span>',
                            '<% } %>',
                        '</a></li>',
                    '<% }); %>',
                '</ul>',
            '</div>'
        ].join('')),

        initialize : function(options) {
            var txtPt = Common.Utils.Metric.getMetricName(Common.Utils.Metric.c_MetricUnits.pt),
                data = [
                    {displayValue: '0.5 ' + txtPt,   value: 0.5, pxValue: 0.5,  imgId: 'half-pt'},
                    {displayValue: '1 ' + txtPt,     value: 1,   pxValue: 1,    imgId: 'one-pt'},
                    {displayValue: '1.5 ' + txtPt,   value: 1.5, pxValue: 2,    imgId: 'one-and-half-pt'},
                    {displayValue: '2.25 ' + txtPt,  value: 2.25,pxValue: 3,    imgId: 'two-and-quarter-pt'},
                    {displayValue: '3 ' + txtPt,     value: 3,   pxValue: 4,    imgId: 'three-pt'},
                    {displayValue: '4.5 ' + txtPt,   value: 4.5, pxValue: 6,    imgId: 'four-and-half-pt'},
                    {displayValue: '6 ' + txtPt,     value: 6,   pxValue: 8,    imgId: 'six-pt'}
                ];
            if (options.allowNoBorders !== false)
                data.unshift({displayValue: this.txtNoBorders, value: 0, pxValue: 0 });

            Common.UI.ComboBox.prototype.initialize.call(this, _.extend({
                editable: false,
                store: new Common.UI.BordersStore(),
                data: data,
                menuStyle: 'min-width: 160px;'
            }, options));
        },

        render : function(parentEl) {
            Common.UI.ComboBox.prototype.render.call(this, parentEl);
            this._formControl  = this.cmpEl.find('.form-control');
            return this;
        },

        itemClicked: function (e) {
            var el = $(e.currentTarget).parent();

            this._selectedItem = this.store.findWhere({
                id: el.attr('id')
            });
            if (this._selectedItem) {
                var $selectedItems = $('.selected', $(this.el));
                $selectedItems.removeClass('selected');
                $selectedItems.attr('aria-checked', false);
                el.addClass('selected');
                el.attr('aria-checked', true);
                this.updateFormControl(this._selectedItem);

                this.trigger('selected', this, _.extend({}, this._selectedItem.toJSON()), e);
                e.preventDefault();
            }
        },

        updateFormControl: function(record) {
            var formcontrol = $(this.el).find('.form-control');
            var image = formcontrol.find('> .img-line');
            var text = formcontrol.find('> .text');

            if (record.get('value')>0) {
                var elm = formcontrol.find('use');
                (elm.length>0)  && elm[0].setAttribute('xlink:href', '#' + record.get('imgId'));
                image.show();
                text.hide();
            } else {
                image.hide();
                text.text(this.txtNoBorders).show();
            }
        },

        setValue: function(value) {
            this._selectedItem = (value===null || value===undefined) ? undefined : _.find(this.store.models, function(item) {
                if ( value<item.attributes.value+0.01 && value>item.attributes.value-0.01) {
                    return true;
                }
            });

            var $selectedItems = $('.selected', $(this.el));
            $selectedItems.removeClass('selected');
            $selectedItems.attr('aria-checked', false);

            if (this._selectedItem) {
                this.updateFormControl(this._selectedItem);
                var $newSelectedItem = $('#' + this._selectedItem.get('id'), $(this.el));
                $newSelectedItem.addClass('selected');
                $newSelectedItem.attr('aria-checked', true);
            } else {
                $(this.el).find('.form-control > .text').text("").show();
            }
        },

        focus: function() {
            this._formControl && this._formControl.focus();
        },

        txtNoBorders: 'No Borders'
    }, Common.UI.ComboBorderSize || {}));

    Common.UI.ComboBorderSizeEditable = Common.UI.ComboBox.extend(_.extend({
        template: _.template([
            '<span class="input-group combobox combo-border-size input-group-nr <%= cls %>" id="<%= id %>" style="<%= style %>">',
                '<input type="text" class="form-control text" role="combobox" aria-expanded="false" aria-controls="<%= id %>-menu" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-hint-offset="<%= dataHintOffset %>">',
                '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">',
                    '<span class="caret"></span>',
                '</button>',
                '<ul id="<%= id %>-menu" class="dropdown-menu <%= menuCls %>" style="<%= menuStyle %>" role="menu">',
                    '<% _.each(items, function(item) { %>',
                        '<li id="<%= item.id %>" data-value="<%= item.value %>" role="menuitem"><a tabindex="-1" type="menuitem">',
                        '<% if (!isRTL) { %>',
                            '<span><%= item.displayValue %>' + '</span>',
                            '<% if (item.imgId!==undefined) { %>',
                            '<span class="border-line">',
                                '<svg>',
                                    '<use xlink:href="#<%= item.imgId %>"></use>',
                                '</svg>',
                            '</span>',
                             '<% } %>',
                        '<% } else { %>',
                            '<% if (item.imgId!==undefined) { %>',
                            '<span class="border-line">',
                                '<svg>',
                                    '<use xlink:href="#<%= item.imgId %>"></use>',
                                '</svg>',
                            '</span>',
                            '<% } %>',
                            '<span><%= item.displayValue %>' + '</span>',
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
                    {displayValue: '0.5 ' + txtPt,   value: 0.5, pxValue: 0.5,  imgId: 'half-pt'},
                    {displayValue: '1 ' + txtPt,     value: 1,   pxValue: 1,    imgId: 'one-pt'},
                    {displayValue: '1.5 ' + txtPt,   value: 1.5, pxValue: 2,    imgId: 'one-and-half-pt'},
                    {displayValue: '2.25 ' + txtPt,  value: 2.25,pxValue: 3,    imgId: 'two-and-quarter-pt'},
                    {displayValue: '3 ' + txtPt,     value: 3,   pxValue: 4,    imgId: 'three-pt'},
                    {displayValue: '4.5 ' + txtPt,   value: 4.5, pxValue: 6,    imgId: 'four-and-half-pt'},
                    {displayValue: '6 ' + txtPt,     value: 6,   pxValue: 8,    imgId: 'six-pt'}
                ];

            if (options.allowNoBorders !== false)
                data.unshift({displayValue: this.txtNoBorders, value: 0, pxValue: 0 });

            Common.UI.ComboBox.prototype.initialize.call(this, _.extend({
                editable: true,
                store: new Common.UI.BordersStore(),
                data: data,
                menuStyle: 'min-width: 160px;'
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
            '<div class="input-group combobox combo-border-size combo-border-type input-group-nr <%= cls %>" id="<%= id %>" style="<%= style %>">',
                '<div class="form-control canfocused" style="<%= style %>" role="combobox" aria-expanded="false" aria-controls="<%= id %>-menu" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-hint-offset="<%= dataHintOffset %>" data-move-focus-only-tab="true">',
                    '<i class="img-line"><svg><use xlink:href="#solid"></use></svg></i>',
                '</div>',
                '<div style="display: table-cell;"></div>',
                '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">',
                    '<span class="caret"></span>',
                '</button>',
                '<ul id="<%= id %>-menu" class="dropdown-menu <%= menuCls %>" style="<%= menuStyle %>" role="menu">',
                    '<% _.each(items, function(item) { %>',
                        '<li id="<%= item.id %>" data-value="<%= item.value %>" role="menuitem"><a tabindex="-1" type="menuitem">',
                            '<% if (item.imgId!==undefined) { %>',
                            '<span>',
                                '<svg><use xlink:href="#<%= item.imgId %>"></use></svg>',
                            '</span>',
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
                    {value: Asc.c_oDashType.solid,        imgId: "solid"},
                    {value: Asc.c_oDashType.sysDot,       imgId: 'dots'},
                    {value: Asc.c_oDashType.sysDash,      imgId: 'dashes'},
                    {value: Asc.c_oDashType.dash,         imgId: 'dashes-spaced'},
                    {value: Asc.c_oDashType.dashDot,      imgId: 'dash-dot'},
                    {value: Asc.c_oDashType.lgDash,       imgId: 'dashes-wide'},
                    {value: Asc.c_oDashType.lgDashDot,    imgId: 'wide-dash-dot'},
                    {value: Asc.c_oDashType.lgDashDotDot, imgId: 'wide-dash-dot-dot'}
                ]
            }, options));
        },

        render : function(parentEl) {
            Common.UI.ComboBorderSize.prototype.render.call(this, parentEl);
            return this;
        },

        updateFormControl: function(record) {
            if (record) {
               var elm = $(this.el).find('.form-control > .img-line use');
                if(elm.length) {
                    var height = Math.ceil(record.get('pxValue'));
                    height = height ? height : 3;
                    elm[0].setAttribute('xlink:href', '#' + record.get('imgId'));
                    elm.parent().css('height', height + 'px');
                }
                $(this.el).find('.form-control > .img-line').show();
            }
            else
                $(this.el).find('.form-control > .img-line').hide();
        },

        setValue: function(value) {
            this._selectedItem = (value===null || value===undefined) ? undefined : _.find(this.store.models, function(item) {
                if ( value<item.attributes.value+0.01 && value>item.attributes.value-0.01) {
                    return true;
                }
            });

            var $selectedItems = $('.selected', $(this.el));
            $selectedItems.removeClass('selected');
            $selectedItems.attr('aria-checked', false);

            this.updateFormControl(this._selectedItem);
            if (this._selectedItem) {
                var $newSelectedItem = $('#' + this._selectedItem.get('id'), $(this.el));
                $newSelectedItem.addClass('selected');
                $newSelectedItem.attr('aria-checked', true);
            }
        }
    }, Common.UI.ComboBorderType || {}));

    Common.UI.ComboBoxColor = Common.UI.ComboBox.extend(_.extend({
        template: _.template([
            '<div class="input-group combobox combo-color combobox-color input-group-nr <%= cls %>" id="<%= id %>" style="<%= style %>">',
            '<div class="form-control" style="<%= style %>" role="combobox" aria-expanded="false" aria-controls="<%= id %>-menu">',
                '<div></div>',
            '</div>',
            '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">',
                '<span class="caret"></span>',
            '</button>',
            '<ul id="<%= id %>-menu" class="dropdown-menu <%= menuCls %>" style="<%= menuStyle %>" role="menu">',
            '<% _.each(items, function(item) { %>',
                '<% if (item.value==-1) { %>',
                    '<li id="<%= item.id %>" data-value="<%= item.value %>" role="menuitem"><a tabindex="-1" type="menuitem"><%= scope.getDisplayValue(item) %></a></li>',
                '<% } else { %>',
                    '<li id="<%= item.id %>" data-value="<%= item.value %>" role="option">',
                    '<a tabindex="-1" type="menuitem"><div style="<%= item.styleStr %>"><%= scope.getDisplayValue(item) %></div></a>',
                    '</li>',
                '<% } %>',
            '<% }); %>',
            '</ul>',
            '</div>'
        ].join('')),

        render : function(parentEl) {
            Common.UI.ComboBox.prototype.render.call(this, parentEl);
            this._formControl  = this.cmpEl.find('.form-control');
            if (this.disabled) this.setDisabled(this.disabled);
            return this;
        },

        itemClicked: function (e) {
            var el = $(e.currentTarget).parent();

            this._selectedItem = this.store.findWhere({
                id: el.attr('id')
            });
            if (this._selectedItem) {
                var $selectedItems = $('.selected', $(this.el));
                $selectedItems.removeClass('selected');
                $selectedItems.attr('aria-checked', false);
                el.addClass('selected');
                el.attr('aria-checked', true);
                this.updateFormControl(this._selectedItem);

                this.trigger('selected', this, _.extend({}, this._selectedItem.toJSON()), e);
                e.preventDefault();
            }
        },

        updateFormControl: function(record) {
            var formcontrol = $(this.el).find('.form-control > div');

            formcontrol[0].innerHTML = record.get('displayValue');
            if (record.get('value')!=-1) {
                formcontrol.css({'margin-top': '0'});
                formcontrol.css(record.get('styleObj'));
            } else {
                formcontrol.css({'margin-top': '1px'});
                formcontrol.css(record.get('styleObj'));
            }
        },

        setValue: function(value) {
            var obj;
            this._selectedItem = this.store.findWhere((obj={}, obj[this.valueField]=value, obj));

            var $selectedItems = $('.selected', $(this.el));
            $selectedItems.removeClass('selected');
            $selectedItems.attr('aria-checked', false);

            if (this._selectedItem) {
                this.updateFormControl(this._selectedItem);
                var $newSelectedItem = $('#' + this._selectedItem.get('id'), $(this.el));
                $newSelectedItem.addClass('selected');
                $newSelectedItem.attr('aria-checked', true);
            } else {
                var formcontrol = $(this.el).find('.form-control > div');
                formcontrol[0].innerHTML = value;
                formcontrol.css('margin-top', '1px');
                formcontrol.css({'color': '', 'text-align': '', 'background': '', 'border': ''});
            }
        },

        onResetItems: function() {
            if (this.itemsTemplate) {
                $(this.el).find('ul').html( $(this.itemsTemplate({
                    items: this.store.toJSON(),
                    scope: this
                })));
            } else {
                $(this.el).find('ul').html(_.template([
                    '<% _.each(items, function(item) { %>',
                    '<% if (item.value==-1) { %>',
                    '<li id="<%= item.id %>" data-value="<%= item.value %>" role="menuitem"><a tabindex="-1" type="menuitem"><%= scope.getDisplayValue(item) %></a></li>',
                    '<% } else { %>',
                    '<li id="<%= item.id %>" data-value="<%= item.value %>" role="menuitem">',
                    '<a tabindex="-1" type="menuitem""><div style="<%= item.styleStr %>"><%= scope.getDisplayValue(item) %></div></a>',
                    '</li>',
                    '<% } %>',
                    '<% }); %>'
                ].join(''))({
                    items: this.store.toJSON(),
                    scope: this
                }));
            }

            if (!_.isUndefined(this.scroller)) {
                this.scroller.destroy();
                delete this.scroller;
            }
            this.scroller = new Common.UI.Scroller(_.extend({
                el: $('.dropdown-menu', this.cmpEl),
                minScrollbarLength : 40,
                includePadding     : true,
                wheelSpeed: 10,
                alwaysVisibleY: this.scrollAlwaysVisible
            }, this.options.scroller));
        },

        setTabIndex: function(tabindex) {
            if (!this.rendered)
                return;

            this.tabindex = tabindex.toString();
            !this.disabled && this._formControl && this._formControl.attr('tabindex', this.tabindex);
        },

        setDisabled: function(disabled) {
            disabled = !!disabled;
            this.disabled = disabled;

            if (!this.rendered || !this._formControl)
                return;

            if (this.tabindex!==undefined) {
                disabled && (this.tabindex = this._formControl.attr('tabindex'));
                this._formControl.attr('tabindex', disabled ? "-1" : this.tabindex);
            }
            this.cmpEl.toggleClass('disabled', disabled);
            this._button.toggleClass('disabled', disabled);
            this._formControl.toggleClass('disabled', disabled);
        },

        focus: function() {
            this._formControl && this._formControl.focus();
        }

    }, Common.UI.ComboBoxColor || {}));

    Common.UI.ComboBoxIcons= Common.UI.ComboBox.extend(_.extend({
        template: _.template([
            '<div class="input-group combobox combobox-icons combo-color input-group-nr <%= cls %>" id="<%= id %>" style="<%= style %>">',
                '<div class="form-control" style="<%= style %>" role="combobox" aria-expanded="false" aria-controls="<%= id %>-menu">',
                    '<div></div>',
                '</div>',
                '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">',
                    '<span class="caret"></span>',
                '</button>',
                '<ul id="<%= id %>-menu" class="dropdown-menu <%= menuCls %>" style="<%= menuStyle %>" role="menu">',
                    '<% _.each(items, function(item) { %>',
                        '<% if (item.value==-1) { %>',
                            '<li id="<%= item.id %>" data-value="<%= item.value %>" role="menuitem"><a tabindex="-1" type="menuitem"><%= scope.getDisplayValue(item) %></a></li>',
                        '<% } else { %>',
                            '<li id="<%= item.id %>" data-value="<%= item.value %>" role="menuitem">',
                                '<a tabindex="-1" type="menuitem">',
                                    '<% _.each(item.data.iconSet, function(icon) { %>',
                                    '<img src="<%= item.data.icons.at(icon-1).get(\'icon\') %>">',
                                    '<% }) %>',
                                '</a>',
                            '</li>',
                        '<% } %>',
                    '<% }); %>',
                '</ul>',
            '</div>'
        ].join('')),

        render : function(parentEl) {
            Common.UI.ComboBox.prototype.render.call(this, parentEl);
            this._formControl  = this.cmpEl.find('.form-control');
            return this;
        },

        itemClicked: function (e) {
            var el = $(e.currentTarget).parent();

            this._selectedItem = this.store.findWhere({
                id: el.attr('id')
            });
            if (this._selectedItem) {
                var $selectedItems = $('.selected', $(this.el));
                $selectedItems.removeClass('selected');
                $selectedItems.attr('aria-checked', false);
                el.addClass('selected');
                el.attr('aria-checked', true);
                this.updateFormControl(this._selectedItem);

                this.trigger('selected', this, _.extend({}, this._selectedItem.toJSON()), e);
                e.preventDefault();
            }
        },

        updateFormControl: function(record) {
            var formcontrol = $(this.el).find('.form-control > div');

            if (record.get('value')!=-1) {
                var str = '';
                _.each(record.get('data').iconSet, function(icon) {
                    str += '<img src="' + record.get('data').icons.at(icon-1).get("icon") + '">';
                });
                formcontrol[0].innerHTML = str;
                formcontrol.css({'margin-top': '0'});
            } else {
                formcontrol[0].innerHTML = record.get('displayValue');
                formcontrol.css({'margin-top': '1px'});
            }
        },

        setValue: function(value) {
            var obj;
            this._selectedItem = this.store.findWhere((obj={}, obj[this.valueField]=value, obj));

            var $selectedItems = $('.selected', $(this.el));
            $selectedItems.removeClass('selected');
            $selectedItems.attr('aria-checked', false);

            if (this._selectedItem) {
                this.updateFormControl(this._selectedItem);
                var $newSelectedItem = $('#' + this._selectedItem.get('id'), $(this.el));
                $newSelectedItem.addClass('selected');
                $newSelectedItem.attr('aria-checked', true);
            } else {
                var formcontrol = $(this.el).find('.form-control > div');
                formcontrol[0].innerHTML = value;
                formcontrol.css({'margin-top': '1px'});
            }
        },

        onResetItems: function() {
            if (this.itemsTemplate) {
                $(this.el).find('ul').html( $(this.itemsTemplate({
                    items: this.store.toJSON(),
                    scope: this
                })));
            } else {
                $(this.el).find('ul').html(_.template([
                    '<% _.each(items, function(item) { %>',
                    '<% if (item.value==-1) { %>',
                    '<li id="<%= item.id %>" data-value="<%= item.value %>" role="menuitem"><a tabindex="-1" type="menuitem"><%= scope.getDisplayValue(item) %></a></li>',
                    '<% } else { %>',
                    '<li id="<%= item.id %>" data-value="<%= item.value %>" role="menuitem">',
                        '<a tabindex="-1" type="menuitem" style="padding: 5px;">',
                            '<% _.each(item.data.iconSet, function(icon) { %>',
                                '<img src="<%= item.data.icons.at(icon-1).get(\'icon\') %>">',
                            '<% }) %>',
                        '</a>',
                    '</li>',
                    '<% } %>',
                    '<% }); %>'
                ].join(''))({
                    items: this.store.toJSON(),
                    scope: this
                }));
            }

            if (!_.isUndefined(this.scroller)) {
                this.scroller.destroy();
                delete this.scroller;
            }
            this.scroller = new Common.UI.Scroller(_.extend({
                el: $('.dropdown-menu', this.cmpEl),
                minScrollbarLength : 40,
                includePadding     : true,
                wheelSpeed: 10,
                alwaysVisibleY: this.scrollAlwaysVisible
            }, this.options.scroller));
        },

        focus: function() {
            this._formControl && this._formControl.focus();
        }

    }, Common.UI.ComboBoxIcons || {}));
});