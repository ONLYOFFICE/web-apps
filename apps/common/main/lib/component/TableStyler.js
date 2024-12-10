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
 *  TableStyler.js
 *
 *  Created on 2/28/14
 *
 */

if (Common === undefined)
    var Common = {};

define([
], function () {
    'use strict';
    Common.UI.CellBorder = function (options){
        var me =this;

        var virtualBorderSize,
            virtualBorderColor,
            borderSize,
            borderColor,
            borderAlfa;

        me.overwriteStyle       = options.overwriteStyle !== undefined ? options.overwriteStyle : true;
        me.maxBorderSize        = options.maxBorderSize ? options.maxBorderSize : 8;
        me.defaultBorderSize    = options.defaultBorderSize !== undefined ? options.defaultBorderSize : 1;
        me.defaultBorderColor   = options.defaultBorderColor ? options.defaultBorderColor : '#ccc';
        me.col                  = options.col !== undefined ? options.col : -1;
        me.row                  = options.row !== undefined ? options.row : -1;
        me.cellPadding          = options.cellPadding !== undefined ? options.cellPadding : 10;
        me.tablePadding         = options.tablePadding !== undefined ? options.tablePadding : 10;
        me.X1                   = options.x1 !== undefined ? options.x1 : 0;
        me.Y1                   = options.y1 !== undefined ? options.y1 : 0;
        me.X2                   = options.x2 !== undefined ? options.x2 : 0;
        me.Y2                   = options.y2 !== undefined ? options.y2 : 0;
        me.numInCell            = options.numInCell !== undefined ? options.numInCell : -1;
        me.scale                = options.scale !== undefined ? options.scale : 2;
        me.rows                 = options.rows !== undefined ? options.rows : 2;
        me.columns              = options.columns !== undefined ? options.columns : 2;
        me.context              = options.context;

        virtualBorderSize       = me.defaultBorderSize;
        virtualBorderColor      = new Common.Utils.RGBColor(me.defaultBorderColor);
        borderSize = virtualBorderSize;
        borderColor = virtualBorderColor;
        borderAlfa = 1;

        me.setBordersSize = function (size) {
            borderSize = (size > this.maxBorderSize) ? this.maxBorderSize : size;
            borderAlfa = (size < 1) ? 0.3 : 1;
        };

        me.setBordersColor = function( color) {
            var newColor = color;
            if(typeof(color) == "string")
                newColor = new Common.Utils.RGBColor(color);
            borderColor = newColor;
        };

        me.getBorderSize = function() {
            return borderSize;
        };

        me.getBorderColor = function() {
            return borderColor.toHex();
        };

        me.setVirtualBorderSize = function(size) {
            virtualBorderSize = (size > this.maxBorderSize) ? this.maxBorderSize : size;
        };

        me.setVirtualBorderColor = function(color){
            virtualBorderColor = color;
        };

        me.getVirtualBorderSize = function() {
            return virtualBorderSize;
        };

        me.getVirtualBorderColor = function() {
            return virtualBorderColor.toHex();
        };

        me.scaleBorderSize = function (size){
            return (size*me.scale + 0.5)>>0;
        };

        me.getLine = function (){
            var size = me.scaleBorderSize(borderSize);
            if(me.numInCell < 0) {
                if (me.Y1 == me.Y2)
                    return {
                        X1: me.X1 >> 0,
                        Y1: ((me.Y1 + size / 2) >> 0) - size / 2,
                        X2: (me.X2) >> 0,
                        Y2: ((me.Y2 + size / 2) >> 0) - size / 2
                    };
                else
                    return {
                        X1: ((me.X1 + size / 2) >> 0) - size / 2,
                        Y1: me.Y1 >> 0,
                        X2: ((me.X2 + size / 2) >> 0) - size / 2,
                        Y2: me.Y2 >> 0
                    };
            }
            else {
                var lines = [], step,
                    cellPadding = me.cellPadding * me.scale;
                size *= (me.numInCell === 0)? 1 : -1;

                if (me.Y1 == me.Y2){
                    step = (me.X2 - me.X1)/me.columns;
                    for(var col = 0; col < me.columns; col++ ){
                        lines.push({
                            X1: (me.X1 + col * step + ((col > 0) | 0) * cellPadding/2) >> 0,
                            Y1: (me.Y1 >> 0) + size / 2,
                            X2: (me.X1 + (col + 1) * step - ((col < me.columns - 1) | 0) * cellPadding/2) >> 0,
                            Y2: (me.Y1 >> 0) + size / 2
                        });
                    }
                }
                else {
                    step = (me.Y2 - me.Y1)/me.rows;
                    for(var row = 0; row < me.rows; row++ ) {
                        lines.push({
                            X1: (me.X1 >> 0) + size / 2,
                            Y1: (me.Y1 + row * step + ((row >0) | 0) * cellPadding/2) >> 0,
                            X2: (me.X1 >> 0) + size / 2,
                            Y2: (me.Y1 + (row + 1) * step - ((row < me.rows - 1) | 0) * cellPadding/2) >> 0
                        });
                    }
                }
                return lines;
            }
        };

        me.inRect = function (MX, MY){
            var h = me.scale * me.tablePadding/2;
            var line =  me.getLine();
            var mxScale = MX*me.scale,
                myScale = MY*me.scale;
            if(me.numInCell < 0) {

                if (line.Y1 == line.Y2)
                    return ((mxScale > line.X1 && mxScale < line.X2) && (myScale > line.Y1 - h && myScale < line.Y1 + h));
                else
                    return ((myScale > line.Y1 && myScale < line.Y2) && (mxScale > line.X1 - h && mxScale < line.X1 + h));
            }
            else {
                if (me.Y1 == me.Y2) {
                    for(var i = 0; i < line.length; i++) {
                        if ((mxScale > line[i].X1 && mxScale < line[i].X2) && (myScale > line[i].Y1 - h && myScale < line[i].Y1 + h))
                            return true;
                    }
                }
                else {
                    for(var i = 0; i < line.length; i++) {
                        if((myScale > line[i].Y1 && myScale < line[i].Y2) && (mxScale > line[i].X1 - h && mxScale < line[i].X1 + h))
                            return  true;
                    }
                }
                return  false;
            }
        };

        me.drawBorder = function (){
            if(borderSize == 0) return;
            var line =  me.getLine();
            me.context.beginPath();
            me.context.globalAlpha = borderAlfa;
            me.context.lineWidth = me.scaleBorderSize(borderSize);
            me.context.strokeStyle = me.getBorderColor();
            if(me.numInCell < 0) {
                me.context.moveTo(line.X1, line.Y1);
                me.context.lineTo(line.X2, line.Y2);
            } else {
                _.each(line, function (ln){
                    me.context.moveTo(ln.X1, ln.Y1);
                    me.context.lineTo(ln.X2, ln.Y2);
                });
            }
            me.context.stroke();
            me.context.globalAlpha = 1;
        };

        me.setBorderParams = function (){
            if(borderSize == virtualBorderSize &&  virtualBorderColor.isEqual(borderColor) && me.overwriteStyle){
                me.setBordersSize(0);
                return;
            }
            me.setBordersSize(virtualBorderSize);
            me.setBordersColor(virtualBorderColor);
        };

    }

    Common.UI.TableStyler = Common.UI.BaseView.extend({
        options : {
            width               : 200,
            height              : 200,
            sizeCorner          : 10,
            scale               : 2,
            row                 :-1,
            col                 :-1,
            rows                : 2,
            columns             : 2,
            cellPadding         : 10,
            tablePadding        : 10,
            overwriteStyle      : true,
            maxBorderSize       : 8,
            spacingMode         : false,
            defaultBorderSize   : 1,
            defaultBorderColor  : '#ccc'
        },

        template: _.template([
            '<div id="<%=scope.id%>" class="table-styler" style="position: relative; width: <%=scope.width%>px; height:<%=scope.height%>px;">',
            '<canvas id="<%=scope.id%>-table-canvas"  width ="<%=scope.width * scope.scale%>" height="<%=scope.height * scope.scale%>" style="left: 0; top: 0; width: 100%; height: 100%;">',
            '</canvas>',
            '</div>'
        ].join('')),

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            var me = this,
                virtualBorderSize,
                virtualBorderColor;
            me.id                   = me.options.id || Common.UI.getId();
            me.scale                = Common.Utils.applicationPixelRatio();
            me.scale                = me.scale >= 1 ? me.scale : 1;
            me.width                = ((me.options.width * me.scale) >> 0) / me.scale;
            me.height               = ((me.options.height * me.scale) >> 0) / me.scale;
            me.rows                 = me.options.rows;
            me.columns              = me.options.columns;
            me.cellPadding          = me.options.cellPadding;
            me.tablePadding         = me.options.tablePadding;
            me.overwriteStyle       = me.options.overwriteStyle;
            me.maxBorderSize        = me.options.maxBorderSize;
            me.spacingMode          = me.options.spacingMode;
            me.twoModes             = me.options.twoModes;
            me.defaultBorderSize    = me.options.defaultBorderSize;
            me.defaultBorderColor   = me.options.defaultBorderColor;
            me.sizeCorner           = me.options.sizeCorner;
            me.backgroundColor      = 'transparent';
            me.backgroundCellColor  = 'transparent';

            virtualBorderSize       = (me.defaultBorderSize > me.maxBorderSize) ? me.maxBorderSize : me.defaultBorderSize;
            virtualBorderColor      = new Common.Utils.RGBColor(me.defaultBorderColor);

            var borderSize = {
                top     : virtualBorderSize,
                right   : virtualBorderSize,
                bottom  : virtualBorderSize,
                left    : virtualBorderSize
            };

            var borderColor = {
                top     : virtualBorderColor,
                right   : virtualBorderColor,
                bottom  : virtualBorderColor,
                left    : virtualBorderColor
            };

            me.rendered             = false;

            me.on('render:after', function(cmp) {

                me.canv.addEventListener('click', function (e) {
                    var mouseX, mouseY;

                    if (e.offsetX !== undefined) {
                        mouseX = parseInt(e.offsetX * Common.Utils.zoom());
                        mouseY = parseInt(e.offsetY * Common.Utils.zoom());
                    } else if (e.layerX) {
                        mouseX = e.layerX;
                        mouseY = e.layerY;
                    }
                    var redraw = false;

                    if (me.inRect('t', mouseX, mouseY)) {
                        me.setBorderParams('t');
                        redraw = true;
                        me.fireEvent('borderclick', me, 't',  borderSize.top, borderColor.top.toHex());
                    }
                    else if (me.inRect('b', mouseX, mouseY)) {
                        me.setBorderParams('b');
                        redraw = true;
                        me.fireEvent('borderclick', me, 'b',  borderSize.bottom, borderColor.bottom.toHex());
                    }
                    else if (me.inRect('l', mouseX, mouseY)) {
                        me.setBorderParams('l');
                        redraw = true;
                        me.fireEvent('borderclick', me, 'l',  borderSize.left, borderColor.left.toHex());
                    }
                    else if (me.inRect('r', mouseX, mouseY)) {
                        me.setBorderParams('r');
                        redraw = true;
                        me.fireEvent('borderclick', me, 'r',  borderSize.right, borderColor.right.toHex());
                    }
                    else {
                        for (var i = 0; i < me._cellBorders.length; i++) {
                            if (me._cellBorders[i].inRect(mouseX, mouseY)) {
                                redraw = true;
                                me._cellBorders[i].setBorderParams();
                                me.fireEvent('borderclick:cellborder', me, me._cellBorders[i],  me._cellBorders[i].getBorderSize(), me._cellBorders[i].getBorderColor());

                                if(me.spacingMode) {
                                    var secondBorder = undefined;
                                    if(me._cellBorders[i].col > 0 && me._cellBorders[i].numInCell === 0)
                                        secondBorder = me.getCellBorder(-1, me._cellBorders[i].col - 1, 1);
                                    else if(me._cellBorders[i].row > 0 && me._cellBorders[i].numInCell === 0)
                                        secondBorder = me.getCellBorder(me._cellBorders[i].row - 1, -1,  1);
                                    else if(me._cellBorders[i].col > -1 && me._cellBorders[i].col < me.columns - 1 && me._cellBorders[i].numInCell === 1)
                                        secondBorder = me.getCellBorder(-1, me._cellBorders[i].col + 1,  0);
                                    else if(me._cellBorders[i].row > -1 && me._cellBorders[i].row < me.rows - 1 && me._cellBorders[i].numInCell === 1)
                                        secondBorder = me.getCellBorder(me._cellBorders[i].row + 1, -1,  0);

                                    (secondBorder) && secondBorder.setBorderParams();
                                }

                                break;
                            }
                        }
                    }
                    (redraw) && me.redrawTable();
                });

                $(window).resize(me.resizeTable);
            });

            me.resizeTable = function (){
                me.context.clearRect(0,0, me.width*me.scale, me.height*me.scale);
                me.scale = Common.Utils.applicationPixelRatio();
                me.scale = me.scale>=1 ? me.scale : 1;
                me.width = ((me.options.width * me.scale)>>0) / me.scale;
                me.height = ((me.options.height * me.scale) >> 0) / me.scale;
                me.cmpEl.css({'width': me.width, 'height': me.height});
                me.cmpEl.parent().css({'width': me.width, 'height': me.height});

                me._cellBorders.forEach(function(b){
                    b.scale = me.scale;
                });

                var i, sizeCorner = me.sizeCorner * me.scale;
                var ctxWidth = me.width*me.scale,
                    ctxHeight = me.height*me.scale,
                    stepX = (ctxWidth - 2 * sizeCorner)/me.columns,
                    stepY = (ctxHeight - 2 * sizeCorner)/me.rows;

                if(!me.spacingMode) {
                    i = 0;
                    for (var row = 0; row < me.rows - 1; row++) {
                        me._cellBorders[i].Y1 = (row + 1) * stepY + sizeCorner;
                        me._cellBorders[i].Y2 = me._cellBorders[i].Y1;
                        me._cellBorders[i].X1 = sizeCorner;
                        me._cellBorders[i].X2 = ctxWidth - sizeCorner;
                        i++
                    }

                    for (var col = 0; col < me.columns - 1; col++) {
                        me._cellBorders[i].Y1 = sizeCorner;
                        me._cellBorders[i].Y2 = ctxHeight - sizeCorner;
                        me._cellBorders[i].X1 = (col + 1) * stepX + sizeCorner;
                        me._cellBorders[i].X2 = me._cellBorders[i].X1;
                        i++
                    }
                }
                else {
                    var cellPadding = me.cellPadding * me.scale;
                    sizeCorner += cellPadding;
                    stepX = (ctxWidth - 2 * sizeCorner) / me.columns;
                    stepY = (ctxHeight - 2 * sizeCorner) / me.rows;
                    i = 0;

                    for (var col = 0; col < me.columns; col++) {
                        for(var n = 0; n< 2; n++) {
                            me._cellBorders[i].Y1 = sizeCorner;
                            me._cellBorders[i].Y2 = ctxHeight - sizeCorner;
                            me._cellBorders[i].X1 = (n == 0) ?
                                (col) * (stepX + cellPadding / 2) + sizeCorner:
                                me.width * me.scale - sizeCorner - (me.columns - col - 1) * (stepX + cellPadding / 2);
                            me._cellBorders[i].X2 = me._cellBorders[i].X1;
                            i++
                        }
                    }

                    for (var row = 0; row < me.rows; row++) {
                        for(var n = 0; n< 2; n++) {
                            me._cellBorders[i].Y1 = (n == 0) ?
                                (row) * (stepY + cellPadding / 2) + sizeCorner:
                                me.height * me.scale - sizeCorner - (me.rows - row - 1) * (stepY + cellPadding / 2);
                            me._cellBorders[i].Y2 = me._cellBorders[i].Y1;
                            me._cellBorders[i].X1 = sizeCorner;
                            me._cellBorders[i].X2 = ctxWidth - sizeCorner;
                            i++;
                        }
                    }
                }

                me.canv.width = me.width * me.scale;
                me.canv.height = me.height * me.scale;
                me.drawTable();
            };

            me.getVirtualBorderSize = function(){
                return virtualBorderSize;
            };

            me.getVirtualBorderColor = function(){
                return virtualBorderColor.toHex();
            };

            me.setVirtualBorderSize = function(size){
                virtualBorderSize = (size > me.maxBorderSize) ? me.maxBorderSize : size;

                for(var i =0; i < me._cellBorders.length; i++){
                    me._cellBorders[i].setVirtualBorderSize(size);
                }
            };

            me.setVirtualBorderColor = function(color){
                var newColor = new Common.Utils.RGBColor(color);

                if (virtualBorderColor.isEqual(newColor))
                    return;

                virtualBorderColor = newColor;

                for(var i =0; i < me._cellBorders.length; i++){
                    me._cellBorders[i].setVirtualBorderColor(newColor);
                }
            };

            me.setBordersSize = function(borders, size){
                size = (size > me.maxBorderSize) ? me.maxBorderSize : size;
                if (borders.indexOf('t') > -1) {
                    borderSize.top = size;
                }
                if (borders.indexOf('r') > -1) {
                    borderSize.right = size;
                }
                if (borders.indexOf('b') > -1) {
                    borderSize.bottom = size;
                }
                if (borders.indexOf('l') > -1) {
                    borderSize.left = size;
                }
            };

            me.scaleBorderSize = function (size){
                return (size*me.scale +0.5)>>0;
            };

            me.setBordersColor = function(borders, color){
                var newColor = new Common.Utils.RGBColor(color);

                if (borders.indexOf('t') > -1)
                    borderColor.top = newColor;
                if (borders.indexOf('r') > -1)
                    borderColor.right = newColor;
                if (borders.indexOf('b') > -1)
                    borderColor.bottom = newColor;
                if (borders.indexOf('l') > -1)
                    borderColor.left = newColor;

            };

            me.getBorderSize = function(border){
                switch(border){
                    case 't':
                        return borderSize.top;
                    case 'r':
                        return borderSize.right;
                    case 'b':
                        return borderSize.bottom;
                    case 'l':
                        return borderSize.left;
                }
                return null;
            };

            me.getBorderColor = function(border){
                switch(border){
                    case 't':
                        return borderColor.top.toHex();
                    case 'r':
                        return borderColor.right.toHex();
                    case 'b':
                        return borderColor.bottom.toHex();
                    case 'l':
                        return borderColor.left.toHex();
                }
                return null;
            };

            me.getBorderAlpha = function (border) {
                return me.getBorderSize(border)<1 ? 0.2 : 1;
            };

            me.setBorderParams = function(border) {
                var color = new Common.Utils.RGBColor(me.getBorderColor(border));
                var size = me.getBorderSize(border);
                if(size == virtualBorderSize && virtualBorderColor.isEqual(color) && me.overwriteStyle) {
                    me.setBordersSize(border,0);
                    return;
                }
                me.setBordersSize(border, me.getVirtualBorderSize());
                me.setBordersColor(border,me.getVirtualBorderColor());
            };

            me.getLine =function  (size, border ){
                var sizeCornerScale = me.sizeCorner * me.scale ;
                var borderWidth = me.scaleBorderSize(size);
                var linePoints={},
                    canvWidth = me.width * me.scale,
                    canvHeight =me.height * me.scale;
                switch (border){
                    case 't':
                        linePoints.X1 = sizeCornerScale >>0;
                        linePoints.Y1 = (sizeCornerScale>>0) + borderWidth / 2;
                        linePoints.X2 = (canvWidth - sizeCornerScale)>>0;
                        linePoints.Y2 = linePoints.Y1;
                        break;
                    case 'b':
                        linePoints.X1 = sizeCornerScale>>0;
                        linePoints.Y1 = ((canvHeight - sizeCornerScale)>>0) - borderWidth / 2;
                        linePoints.X2 = (canvWidth - sizeCornerScale)>>0;
                        linePoints.Y2 = linePoints.Y1;
                        break;
                    case 'l':
                        linePoints.X1 = (sizeCornerScale>>0) + borderWidth / 2;
                        linePoints.Y1 = sizeCornerScale>>0;
                        linePoints.X2 = linePoints.X1;
                        linePoints.Y2 = (canvHeight - sizeCornerScale)>>0;
                        break;
                    case 'r':
                        linePoints.X1 = ((canvWidth - sizeCornerScale)>>0) - borderWidth / 2;
                        linePoints.Y1 = sizeCornerScale>>0;
                        linePoints.X2 = linePoints.X1;
                        linePoints.Y2 = (canvHeight - sizeCornerScale)>>0;
                        break;
                }
                return linePoints;
            };

            me.inRect= function(border, MX, MY) {
                var h = me.tablePadding/2;
                var sizeBorder = me.getBorderSize(border);
                var line = me.getLine(sizeBorder, border);

                line = {X1: line.X1/me.scale, Y1: line.Y1/me.scale, X2: line.X2/me.scale, Y2: line.Y2/me.scale};

                if (line.Y1 == line.Y2)
                    return ((MX > line.X1 && MX < line.X2) && (MY > line.Y1 - h && MY < line.Y1 + h));
                else
                    return((MY > line.Y1 && MY < line.Y2) && (MX > line.X1 - h && MX < line.X1 + h));
            };

            me.setTableColor = function(color) {
                me.backgroundColor = (color == 'transparent' ) ? color : ('#'+color);
            };

            me.setCellsColor = function(color) {
                me.backgroundCellColor = (color == 'transparent' ) ? color : ('#'+color);
            };

            if (me.options.el) {
                me.render(null, {
                    borderSize: borderSize,
                    borderColor: borderColor,
                    virtualBorderSize: virtualBorderSize,
                    virtualBorderColor: virtualBorderColor
                });
            }
        },

        render : function(parentEl) {
            var cfg = arguments[1];

            this.trigger('render:before', this);

            if (!this.rendered) {
                this.cmpEl = $(this.template(_.extend({
                    scope: this
                }, cfg)));

                if (parentEl) {
                    this.setElement(parentEl, false);
                    this.setElement(parentEl, false);
                    parentEl.html(this.cmpEl);
                }
                else
                    $(this.el).html(this.cmpEl);

                this.cmpEl.parent().css({'width': this.width, 'height': this.height});
            }
            else
                this.cmpEl = $(this.el);

            this.canv = $('#' + this.id + '-table-canvas')[0];
            this.context = this.canv.getContext('2d');

            var sizeCorner = this.sizeCorner * this.scale
            sizeCorner += (this.spacingMode) ? this.cellPadding * this.scale : 0;
            if (!this.rendered) {
                this._cellBorders = [];
                var generalOpt = {
                    scale           : this.scale,
                    context         : this.context,
                    cellPadding     : this.cellPadding,
                    tablePadding    : this.tablePadding,
                    rows            : this.rows,
                    columns         : this.columns
                };

                (!this.spacingMode) && this.createHorizontalBorders(generalOpt, sizeCorner);
                this.createVerticaLBorders(generalOpt, sizeCorner);
                (this.spacingMode) && this.createHorizontalBorders(generalOpt, sizeCorner);

                this.drawTable();
            }

            this.rendered = true;

            this.trigger('render:after', this);
            return this;
        },

        createHorizontalBorders: function (generalOpt, sizeCorner){
            var opt = generalOpt;
            var ctxWidth = this.width * this.scale,
                stepY = (this.height * this.scale - 2 * sizeCorner) / this.rows,
                cellPadding = this.cellPadding*this.scale;
            if(!this.spacingMode) {
                for (var row = 0; row < this.rows - 1; row++) {
                    opt.y1 = (row + 1) * stepY + sizeCorner;
                    opt.y2 = opt.y1;
                    opt.x1 = sizeCorner;
                    opt.x2 = ctxWidth - sizeCorner;
                    opt.row = row;
                    opt.col = -1;
                    this._cellBorders.push(new Common.UI.CellBorder(opt));
                }
            } else {
                for (var row = 0; row < this.rows; row++) {
                    for (var n = 0; n < 2; n++) {
                        opt.numInCell = n;
                        opt.y1 = (n == 0) ?
                            (row) * (stepY + cellPadding / 2) + sizeCorner :
                            this.height*this.scale - sizeCorner - (this.rows - row - 1) * (stepY + cellPadding / 2);
                        opt.y2 = opt.y1;
                        opt.x1 = sizeCorner;
                        opt.x2 = ctxWidth - sizeCorner;
                        opt.row = row;
                        opt.col = -1;
                        this._cellBorders.push(new Common.UI.CellBorder(opt));
                    }
                }
            }
        },

        createVerticaLBorders: function (generalOpt, sizeCorner){
            var opt = generalOpt;
            var ctxHeight = this.height * this.scale,
                stepX = (this.width * this.scale - 2 * sizeCorner) / this.columns,
                cellPadding = this.cellPadding*this.scale;
            if(!this.spacingMode) {
                for (var col = 0; col < this.columns - 1; col++) {
                    opt.y1 = sizeCorner;
                    opt.y2 = ctxHeight - sizeCorner;
                    opt.x1 = (col + 1) * stepX + sizeCorner;
                    opt.x2 = opt.x1;
                    opt.row = -1;
                    opt.col = col;
                    this._cellBorders.push(new Common.UI.CellBorder(opt));
                }
            }
            else {
                for (var col = 0; col < this.columns; col++) {
                    for (var n = 0; n < 2; n++) {
                        opt.numInCell = n;
                        opt.y1 = sizeCorner;
                        opt.y2 = ctxHeight - sizeCorner;
                        opt.x1 = (n == 0) ?
                            (col) * (stepX + cellPadding / 2) + sizeCorner :
                            this.width * this.scale - sizeCorner - (this.columns - col - 1) * (stepX + cellPadding / 2);
                        opt.x2 = opt.x1;
                        opt.col = col;
                        opt.row = -1;
                        this._cellBorders.push(new Common.UI.CellBorder(opt));
                    }
                }
            }
        },

        drawCorners: function ( ) {
            var connerLineSize = (0.5*this.scale+0.5) >> 0,
                sizeCornerScale =this.sizeCorner * this.scale,
                canvWidth = this.width * this.scale,
                canvHeight = this.height * this.scale,
                diff = connerLineSize/2;

            this.context.setLineDash([connerLineSize,connerLineSize]);
            this.context.lineWidth = connerLineSize;
            this.context.strokeStyle = "grey";

            this.context.beginPath();

            //lines for corners:
            //top-left
            this.context.moveTo (
                (sizeCornerScale >> 0) - diff,
                0
            );
            this.context.lineTo (
                (sizeCornerScale >> 0) - diff,
                (sizeCornerScale >> 0) - diff
            );
            this.context.moveTo (
                sizeCornerScale >> 0,
                (sizeCornerScale >> 0) - diff
            );
            this.context.lineTo (
                0,
                (sizeCornerScale >> 0) - diff
            );
            //-------------------------------------------------------

            //top-right
            this.context.moveTo (
                ((canvWidth - sizeCornerScale)>>0) + diff,
                0
            );
            this.context.lineTo (
                ((canvWidth - sizeCornerScale)>>0) + diff,
                sizeCornerScale >> 0
            );
            this.context.moveTo (
                (canvWidth - sizeCornerScale) >> 0,
                (sizeCornerScale >> 0) - diff
            );
            this.context.lineTo (
                canvWidth >> 0,
                (sizeCornerScale >> 0) - diff
            );
            //-------------------------------------------------------

            // bottom-right
            this.context.moveTo (
                ((canvWidth - sizeCornerScale) >> 0) + diff,
                canvHeight >> 0
            );
            this.context.lineTo (

                ((canvWidth - sizeCornerScale) >>0 ) + diff,
                (canvHeight - sizeCornerScale) >> 0
            );

            this.context.moveTo (
                (canvWidth - sizeCornerScale) >> 0,
                ((canvHeight - sizeCornerScale) >> 0) + diff);

            this.context.lineTo (
                canvWidth >> 0,
                ((canvHeight - sizeCornerScale) >> 0) + diff
            );
            //-------------------------------------------------------

            //bottom-left
            this.context.moveTo(
                (sizeCornerScale >> 0) - diff,
                canvHeight >> 0
            );
            this.context.lineTo(
                (sizeCornerScale >> 0) - diff,
                (canvHeight - sizeCornerScale)>>0
            );

            this.context.moveTo(
                sizeCornerScale >> 0,
                ((canvHeight - sizeCornerScale) >> 0) + diff
            );

            this.context.lineTo(
                0,
                ((canvHeight - sizeCornerScale) >> 0) + diff
            );
            //-------------------------------------------------------

            this.context.stroke();
            this.context.setLineDash([]);
        },

        fillCells: function(){
            if(!this.spacingMode || this.backgroundCellColor == 'transparent') return;
            var sizeCorner = (this.sizeCorner + this.cellPadding) * this.scale,
                cellPadding = this.cellPadding * this.scale,
                stepX = (this.width * this.scale - 2 * sizeCorner)/this.columns,
                stepY = (this.height * this.scale - 2 * sizeCorner)/this.rows;

            this.context.beginPath();
            this.context.fillStyle = this.backgroundCellColor;
            for(var row = 0; row < this.rows; row++ ){
                for (var col = 0; col < this.columns; col++){

                    this.context.fillRect(
                        (sizeCorner + col * stepX + (col > 0 | 0) * cellPadding/2 )>>0,
                        (sizeCorner + row * stepY + (row > 0 | 0) * cellPadding/2) >>0,
                        (stepX - (((col > 0) | 0) + ((col < this.columns-1) |0)) * cellPadding/2)>>0,
                        (stepY - (((row > 0) | 0) + ((row < this.rows-1) |0)) * cellPadding/2)>>0
                    );
                }
            }
            this.context.stroke();
        },

        drawBorder: function (border){
            var size = this.getBorderSize(border);
            if(!size) return;
            var points = this.getLine(size, border);
            this.context.imageSmoothingEnabled = false;
            this.context.mozImageSmoothingEnabled = false;
            this.context.msImageSmoothingEnabled = false;
            this.context.webkitImageSmoothingEnabled = false;
            this.context.lineWidth = this.scaleBorderSize(size);
            this.context.globalAlpha = this.getBorderAlpha(border);
            this.context.beginPath();
            this.context.strokeStyle = this.getBorderColor(border);
            this.context.moveTo(points.X1, points.Y1);
            this.context.lineTo(points.X2, points.Y2);
            this.context.stroke();
            this.context.globalAlpha = 1;
        },

        fillWithLines: function (){
            var tdPadding = this.maxBorderSize + 4,
                hFillLine = (2 * this.scale + 0.5) >> 0,
                tdWidth, tdHeight, tdX, tdY, xLeft,x1, w, y1, h;
            this.context.setLineDash([hFillLine, hFillLine]);
            this.context.strokeStyle = "#c0c0c0";

            if(!this.spacingMode) {
                tdWidth = (this.width - 2 * this.sizeCorner) / this.columns;
                tdHeight = (this.height - 2 * this.sizeCorner) / this.rows;
                tdY = this.sizeCorner;
                xLeft = this.sizeCorner;

                for (var row = 0; row < this.rows; row++) {
                    tdX = xLeft;
                    for (var col = 0; col < this.columns; col++) {
                        x1 = ((tdX + tdPadding) * this.scale) >> 0;
                        y1 = (tdY + tdPadding) * this.scale;
                        w = ((tdWidth - 2 * tdPadding) * this.scale + 0.5) >> 0;
                        h = (tdHeight - 2 * tdPadding) * this.scale;
                        h = ((h/ (2 * hFillLine))>>0)*2* hFillLine + hFillLine;
                        this.context.lineWidth = w;
                        this.context.beginPath();
                        this.context.moveTo(x1 + w / 2, y1 >> 0);
                        this.context.lineTo(x1 + w / 2, (y1 + h) >> 0);
                        this.context.stroke();
                        tdX += tdWidth;

                    }
                    tdY += tdHeight;
                }
            }
            else {
                var sizeCorner = (this.sizeCorner + this.cellPadding) * this.scale,
                    cellPadding = this.cellPadding * this.scale;
                tdWidth = (this.width * this.scale - 2 * sizeCorner)/this.columns;
                tdHeight = (this.height * this.scale - 2 * sizeCorner)/this.rows;
                tdPadding *= this.scale;

                this.context.beginPath();
                this.context.fillStyle = this.backgroundCellColor;
                for(var row = 0; row < this.rows; row++ ){
                    for (var col = 0; col < this.columns; col++){

                        w = (tdWidth - (((col > 0) | 0) + ((col < this.columns-1) |0)) * cellPadding/2 -2*tdPadding + 0.5)>>0
                        h = tdHeight - (((row > 0) | 0) + ((row < this.rows-1) |0)) * cellPadding/2 -2*tdPadding;
                        h = ((h/ (2 * hFillLine))>>0)*2* hFillLine + hFillLine;
                        x1 = ((sizeCorner + col * tdWidth + (col > 0 | 0) * cellPadding/2 + tdPadding) >> 0);
                        y1 = sizeCorner + row * tdHeight + (row > 0 | 0) * cellPadding/2 + tdPadding;
                        this.context.beginPath();
                        this.context.lineWidth = w;
                        this.context.moveTo(x1 + w / 2, y1 >> 0);
                        this.context.lineTo(x1 + w / 2, (y1 + h) >> 0);
                        this.context.stroke();
                    }
                }
            }

            this.context.setLineDash([]);
        },

        drawTable: function (){
            this.drawCorners();
            var sizeCornerScale = this.sizeCorner * this.scale;
            var tableWidth = (this.width * this.scale  - 2 * sizeCornerScale) >> 0,
                tableHeight = (this.height * this.scale  - 2 * sizeCornerScale) >> 0;
            this.context.fillStyle = this.backgroundColor;
            if(this.backgroundColor != 'transparent' ){
                this.context.beginPath();
                this.context.fillRect(sizeCornerScale >> 0, sizeCornerScale >> 0, tableWidth , tableHeight);
                this.context.stroke();
            }
            this.fillCells();
            this._cellBorders.forEach(function (item){item.drawBorder();});

            this.drawBorder('l');
            this.drawBorder('r');
            this.drawBorder('t');
            this.drawBorder('b');

            this.fillWithLines();
            this.context.lineWidth = 0;
        },

        redrawTable: function() {
            this.context.clearRect(0,0, this.canv.width, this.canv.height);
            this.drawTable();
        },

        getCellBorder: function(row, col, numInCell){
            row = (row === undefined) ? -1 : row;
            col = (col === undefined) ? -1 : col;
            numInCell = (numInCell === undefined) ? -1 : numInCell;
            return _.findWhere(this._cellBorders, {row: row, col: col, numInCell: numInCell});
        }
    });
});