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
 *  DimensionPicker.js
 *
 *  Created by Alexander Yuzhin on 1/29/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/BaseView'
], function () {
    'use strict';

    Common.UI.DimensionPicker = Common.UI.BaseView.extend((function(){
        return {
            options: {
                itemSize    : 18,
                minRows     : 5,
                minColumns  : 5,
                maxRows     : 20,
                maxColumns  : 20
            },

            template:_.template([
                '<div style="width: 100%; height: 100%;">',
                    '<div class="dimension-picker-status">0x0</div>',
                    '<div class="dimension-picker-observecontainer">',
                        '<div class="dimension-picker-mousecatcher"></div>',
                        '<div class="dimension-picker-unhighlighted"></div>',
                        '<div class="dimension-picker-highlighted"></div>',
                    '</div>',
                '</div>'
            ].join('')),

            initialize : function(options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                var me = this;

                this.render();

                this.cmpEl = me.$el || $(this.el);

                var rootEl = this.cmpEl;

                me.itemSize    = me.options.itemSize;
                me.minRows     = me.options.minRows;
                me.minColumns  = me.options.minColumns;
                me.maxRows     = me.options.maxRows;
                me.maxColumns  = me.options.maxColumns;

                me.curColumns = 0;
                me.curRows = 0;

                var onMouseMove = function(event){
                    me.setTableSize(
                        Math.ceil((event.offsetX === undefined ? event.originalEvent.layerX : event.offsetX*Common.Utils.zoom()) / me.itemSize),
                        Math.ceil((event.offsetY === undefined ? event.originalEvent.layerY : event.offsetY*Common.Utils.zoom()) / me.itemSize),
                        event
                    );
                };

                var onMouseLeave = function(event){
                    me.setTableSize(0, 0, event);
                };

                var onHighLightedMouseClick = function(e){
                    me.trigger('select', me, me.curColumns, me.curRows, e);
                };

                if (rootEl){
                    var areaMouseCatcher    = rootEl.find('.dimension-picker-mousecatcher');
                    me.areaUnHighLighted   = rootEl.find('.dimension-picker-unhighlighted');
                    me.areaHighLighted     = rootEl.find('.dimension-picker-highlighted');
                    me.areaStatus          = rootEl.find('.dimension-picker-status');

                    rootEl.css({width: me.minColumns + 'em'});
                    areaMouseCatcher.css('z-index', 1);
                    areaMouseCatcher.width(me.maxColumns + 'em').height(me.maxRows + 'em');
                    me.areaUnHighLighted.width(me.minColumns + 'em').height(me.minRows + 'em');
                    me.areaStatus.html(me.curColumns + ' x ' + me.curRows);
                    me.areaStatus.width(me.areaUnHighLighted.width());

                    areaMouseCatcher.on('mousemove', onMouseMove);
                    me.areaHighLighted.on('mousemove', onMouseMove);
                    me.areaUnHighLighted.on('mousemove', onMouseMove);
                    areaMouseCatcher.on('mouseleave', onMouseLeave);
                    me.areaHighLighted.on('mouseleave', onMouseLeave);
                    me.areaUnHighLighted.on('mouseleave', onMouseLeave);
                    areaMouseCatcher.on('click', onHighLightedMouseClick);
                    me.areaHighLighted.on('click', onHighLightedMouseClick);
                    me.areaUnHighLighted.on('click', onHighLightedMouseClick);
                }
            },

            render: function() {
                (this.$el || $(this.el)).html(this.template());

                return this;
            },

            setTableSize: function(columns, rows, event){
                if (columns > this.maxColumns)  columns = this.maxColumns;
                if (rows > this.maxRows)        rows = this.maxRows;

                if (this.curColumns != columns || this.curRows != rows){
                    this.curColumns  = columns;
                    this.curRows     = rows;

                    this.areaHighLighted.width(this.curColumns + 'em').height(this.curRows + 'em');
                    this.areaUnHighLighted.width(
                        ((this.curColumns < this.minColumns)
                            ? this.minColumns
                            : ((this.curColumns + 1 > this.maxColumns)
                            ? this.maxColumns
                            : this.curColumns + 1)) + 'em'
                    ).height(((this.curRows < this.minRows)
                            ? this.minRows
                            : ((this.curRows + 1 > this.maxRows)
                            ? this.maxRows
                            : this.curRows + 1)) + 'em'
                    );

                    this.cmpEl.width(this.areaUnHighLighted.width());
                    this.areaStatus.html(this.curColumns + ' x ' + this.curRows);
                    this.areaStatus.width(this.areaUnHighLighted.width());

                    this.trigger('change', this, this.curColumns, this.curRows, event);
                }
            },

            getColumnsCount: function() {
                return this.curColumns;
            },

            getRowsCount: function() {
                return this.curRows;
            }
        }
    })())
});
