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
 *  DimensionPicker.js
 *
 *  Created on 1/29/14
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
                itemSize    : 20,
                minRows     : 5,
                minColumns  : 5,
                maxRows     : 20,
                maxColumns  : 20,
                width       : 100,
                height       : 400,
                scale       : Common.Utils.applicationPixelRatio(),
                direction   : undefined // 'left', 'right'
            },

            template:_.template([
                '<div style="width: 100%; height: 100%;">',
                    '<div dir="ltr" class="dimension-picker-status">0x0</div>',
                    '<div class="dimension-picker-observecontainer">',
                        '<div class="dimension-picker-mousecatcher"></div>',
                        '<div class="dimension-picker-unhighlighted">' +
                            '<canvas id="dimension-picker--canvas" data-maxlength="<%=scope.maxColumns%>"  width ="<%=scope.maxColumns * scope.itemSize * scope.scale%>" height="<%=scope.maxRows * scope.itemSize * scope.scale%>" style="left: 0; top: 0; width: 100%; height: 100%;">' +
                        '</div>',
                    '</div>',
                '</div>'
            ].join('')),

            initialize : function(options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                var me = this;

                this.render();

                this.cmpEl = me.$el || $(this.el);
                me.options.width = me.options.itemSize* this.options.minColumns;
                me.options.height = me.options.itemSize* this.options.minRows;
                var rootEl = this.cmpEl;

                me.borderColor = Common.Utils.isIE ?'#888888' :Common.UI.Themes.currentThemeColor('--border-preview-select');
                me.fillColor = Common.Utils.isIE ?'#fff' :Common.UI.Themes.currentThemeColor('--background-normal');
                me.borderColorHighlighted = Common.Utils.isIE ?'#848484' :Common.UI.Themes.currentThemeColor('--border-control-focus');
                me.fillColorHighlighted = Common.Utils.isIE ?'#7d858c' :Common.UI.Themes.currentThemeColor('--highlight-button-pressed');


                me.itemSize    = me.options.itemSize;
                me.minRows     = me.options.minRows;
                me.minColumns  = me.options.minColumns;
                me.maxRows     = me.options.maxRows;
                me.maxColumns  = me.options.maxColumns;
                me.scale       = me.options.scale >= 1 ? me.options.scale : 1;
                me.width       = ((me.options.width * me.scale) >> 0) / me.scale;
                me.height      = ((me.options.height * me.scale) >> 0) / me.scale;
                me.borderSize  = 1;
                me.direction   = me.options.direction;
                if (Common.UI.isRTL() && !me.direction) {
                    me.direction = 'right';
                }

                me.curColumns = 0;
                me.curRows = 0;

                var onMouseMove = function(event){
                    var offsetX;
                    if (me.direction === 'right' && me.areaMouseCatcher) {
                        var width = me.areaMouseCatcher.width();
                        offsetX = event.offsetX === undefined ? (width - event.originalEvent.layerX) : (width - event.offsetX)*Common.Utils.zoom();
                    } else {
                        offsetX = event.offsetX === undefined ? event.originalEvent.layerX : event.offsetX*Common.Utils.zoom();
                    }
                    me.setTableSize(
                        Math.ceil(offsetX / me.itemSize),
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
                    me.areaMouseCatcher    = rootEl.find('.dimension-picker-mousecatcher');
                    me.areaUnHighLighted   = rootEl.find('.dimension-picker-unhighlighted');
                    me.areaStatus          = rootEl.find('.dimension-picker-status');
                    me.canv = rootEl.find('#dimension-picker--canvas')[0];
                    me.context = me.canv.getContext('2d');

                    rootEl.css({width: me.minColumns + 'em'});
                    me.areaMouseCatcher.css('z-index', 1);
                    me.areaMouseCatcher.width(me.maxColumns + 'em').height(me.maxRows + 'em');
                    me.areaMouseCatcher.on('mousemove', onMouseMove);
                    me.areaMouseCatcher.on('click', onHighLightedMouseClick);
                    me.areaMouseCatcher.on('mouseleave', onMouseLeave);
                    me.areaStatus.html(!Common.UI.isRTL() ? this.curColumns + ' x ' + this.curRows : this.curRows + ' x ' + this.curColumns);
                    me.resizeCanvas();
                    $(window).resize(_.bind(me.resizeCanvas,me));
                    (!Common.Utils.isIE) && Common.NotificationCenter.on('uitheme:changed', me.changeColors.bind(me));


                    if (me.direction === 'right') {
                        me.areaUnHighLighted.css({left: 'auto', right: '0'});
                    }
                }
            },

            render: function() {
                (this.$el || $(this.el)).html(this.template({
                    scope: this.options
                }));
                return this;
            },


            changeColors: function (){
                this.borderColor = Common.UI.Themes.currentThemeColor('--border-preview-select');
                this.fillColor = Common.UI.Themes.currentThemeColor('--background-normal');
                this.borderColorHighlighted = Common.UI.Themes.currentThemeColor('--border-control-focus');
                this.fillColorHighlighted = Common.UI.Themes.currentThemeColor('--highlight-button-pressed');

                this.context.clearRect(0,0, this.width*this.scale, this.height*this.scale);
                this.drawTable(this.minColumns,this.minRows,this.fillColor,this.borderColor);
            },

            resizeCanvas: function (){
                (this.context) && this.context.clearRect(0,0, this.width*this.scale, this.height*this.scale);
                this.scale = Common.Utils.applicationPixelRatio();
                this.scale = this.scale>=1 ? this.scale : 1;
                this.width = ((this.options.width * this.scale)>>0) / this.scale;
                this.height = ((this.options.height * this.scale) >> 0) / this.scale;
                this.areaUnHighLighted.css({'width': this.width, 'height': this.height});
                this.canv.width = this.width * this.scale;
                this.canv.height = this.height * this.scale;
                this.drawTable(this.minColumns,this.minRows,this.fillColor, this.borderColor);
                 this.cmpEl.width(this.areaUnHighLighted.width());
                this.areaStatus.width(this.areaUnHighLighted.width());
            },

            drawTable: function (maxCol, maxRow,fillColor, borderColor) {
                var startCol =!Common.UI.isRTL() ? 0 :  this.areaUnHighLighted.width()/this.itemSize-1,
                    delCol=!Common.UI.isRTL() ? 1 : -1;

                for (var row = 0; row < maxRow; row++){
                    for (var col = startCol; !Common.UI.isRTL()?col < maxCol:col>startCol-maxCol; col += delCol){
                        this.drawCell(col,row, fillColor, borderColor);
                    }
                }
            },

            drawCell: function (column, row, fillColor,borderColor){
                var x1 = (((this.itemSize*column+1)*this.scale+0.5)>>0) + this.borderSize/2,
                    x2 = (((this.itemSize*(column+1)-1)*this.scale+0.5)>>0) - this.borderSize/2,
                    y1 = (((this.itemSize*row+1)*this.scale+0.5)>>0) + this.borderSize/2,
                    y2 = (((this.itemSize*(row+1)-1)*this.scale+0.5)>>0) - this.borderSize/2;

                this.context.beginPath();
                this.context.moveTo(x1,y1);
                this.context.lineTo(x2,y1);
                this.context.lineTo(x2,y2);
                this.context.lineTo(x1,y2);
                this.context.closePath();
                this.context.strokeStyle = borderColor;
                this.context.stroke();
                this.context.fillStyle= fillColor;
                this.context.fill();

            },

            setTableSize: function(columns, rows, event){
                if (columns > this.maxColumns)  columns = this.maxColumns;
                if (rows > this.maxRows)        rows = this.maxRows;

                if (this.curColumns != columns || this.curRows != rows){
                    var delCol = columns - this.curColumns,
                        delRow = rows - this.curRows;
                    this.curColumns  = columns;
                    this.curRows     = rows;

                    var _cols =(this.curColumns < this.minColumns)
                        ? this.minColumns
                        : ((this.curColumns + 1 > this.maxColumns)
                            ? this.maxColumns
                            : this.curColumns + 1),
                        _rows =(this.curRows < this.minRows)
                            ? this.minRows
                            : ((this.curRows + 1 > this.maxRows)
                                ? this.maxRows
                                : this.curRows + 1),
                        width = ((_cols*this.itemSize* this.scale )>>0) /this.scale ,
                        height = ((_rows*this.itemSize * this.scale) >> 0)/ this.scale;

                    if(this.areaUnHighLighted.width() != width || this.areaUnHighLighted.height() != height) {
                        this.drawTable(this.curColumns, this.curRows, this.fillColorHighlighted, this.fillColorHighlighted);
                        if(width < this.areaUnHighLighted.width()){
                            this.context.clearRect(!Common.UI.isRTL() ? width : 0, 0, this.areaUnHighLighted.width() - width, this.areaUnHighLighted.height());
                        }
                        if(height < this.areaUnHighLighted.height()) {
                            this.context.clearRect(0, height, this.areaUnHighLighted.width(), this.areaUnHighLighted.height()-height);
                        }
                        this.areaUnHighLighted.css({'width': width, 'height': height});
                        this.canv.width = width * this.scale;
                        this.canv.height = height * this.scale;
                    }

                    this.drawTable(_cols,_rows,this.fillColor, this.borderColor);
                    var startCol= !Common.UI.isRTL() ? this.curColumns+1 : _cols - this.curColumns,
                        decC=!Common.UI.isRTL()?1:-1;
                    if(delCol < 0 ){
                        for(var col = startCol; !Common.UI.isRTL() ? col < this.curColumns+delCol: col > this.curColumns-delCol; col += decC) {
                            for(var row = 0;  row < _rows; row++) {
                                this.drawCell(col, row, this.fillColor, this.borderColor);
                            }
                        }
                    }
                    if(delRow < 0) {
                        for(var  col = startCol; !Common.UI.isRTL() ? col < _cols : col>0 ; col += decC) {
                            for(var row = 0;  row < this.curRows+delRow; row++) {
                                this.drawCell(col, row, this.fillColor, this.borderColor);
                            }
                        }
                    }



                    this.drawTable(this.curColumns, this.curRows, this.fillColorHighlighted, this.borderColorHighlighted);

                    this.cmpEl.width(this.areaUnHighLighted.width());
                    this.areaStatus.html(!Common.UI.isRTL() ? this.curColumns + ' x ' + this.curRows : this.curRows + ' x ' + this.curColumns);
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
