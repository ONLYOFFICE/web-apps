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
 *  ThemeColorPalette.js
 *
 *  Created on 1/28/14
 *
 */

if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/BaseView',
    'common/main/lib/view/ExtendedColorDialog'
], function () {
    'use strict';

    Common.UI.ThemeColorPalette = Common.UI.BaseView.extend(_.extend({
        options: {
            dynamiccolors: 10,
            standardcolors: 10,
            themecolors: 10,
            columns: 10,
            effects: 5,
            hideEmptyColors: true,
            allowReselect: true,
            transparent: false,
            value: '000000',
            enableKeyEvents: true,
            colorHints: true,
            keyMoveDirection: 'both', // 'vertical', 'horizontal',
            storageSuffix: ''
        },

        template    :
            _.template(
                '<div class="palette-inner">' +
                '<% var me = this; var idx = 0; %>' +
                '<% $(colors).each(function(num, item) { %>' +
                    '<% if (me.isBlankSeparator(item)) { %> <div class="palette-color-spacer"></div>' +
                    '<% } else if (me.isSeparator(item)) { %> </div><div class="divider"></div><div style="padding: 12px;">' +
                    '<% } else if (me.isColor(item)) { %> ' +
                        '<a class="palette-color color-<%=item%>" data-toggle="tooltip" style="background:#<%=item%>" idx="<%=idx++%>">' +
                        '<em><span style="background:#<%=item%>;" unselectable="on">&#160;</span></em>' +
                        '</a>' +
                    '<% } else if (me.isTransparent(item)) { %>' +
                        '<a class="color-<%=item%>" data-toggle="tooltip" idx="<%=idx++%>">' +
                        '<em><span unselectable="on">&#160;</span></em>' +
                        '</a>' +
                    '<% } else if (me.isEffect(item)) { %>' +
                        '<% if (idx>0 && me.columns>0 && idx%me.columns===0) { %> ' +
                        '<div class="color-divider"></div>' +
                        '<% } %>' +
                        '<a effectid="<%=item.effectId%>" effectvalue="<%=item.effectValue%>" data-toggle="tooltip" class="palette-color-effect color-<%=item.color%>" style="background:#<%=item.color%>" idx="<%=idx++%>">' +
                        '<em><span style="background:#<%=item.color%>;" unselectable="on">&#160;</span></em>' +
                        '</a>' +
                    '<% } else if (me.isCaption(item)) { %>' +
                    '<div class="palette-color-caption"><%=item%></div>' +
                    '<% } %>' +
                '<% }); %>' +
                '</div>' +
                '<% if (me.options.dynamiccolors!==undefined) { %>' +
                '<div class="palette-color-dynamiccolors">' +
                    '<div class="palette-color-spacer"></div>' +
                    '<div class="palette-color-caption"><%=me.textRecentColors%></div>' +
                    '<% for (var i=0; i<me.options.dynamiccolors; i++) { %>' +
                        '<a class="color-dynamic-<%=i%> dynamic-empty-color <%= me.emptyColorsClass %>" data-toggle="tooltip" color="" idx="<%=idx++%>">' +
                        '<em><span unselectable="on">&#160;</span></em></a>' +
                    '<% } %>' +
                '<% } %>' +
                '</div>'),

        colorRe: /(?:^|\s)color-(.{6})(?:\s|$)/,
        selectedCls: 'selected',
        cls        : '',

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            var me = this,
                el = me.$el || $(this.el);

            this.colors = me.options.colors || this.generateColorData(me.options.themecolors, me.options.effects, me.options.standardcolors, me.options.transparent);
            this.columns = me.options.columns || 0;
            this.enableKeyEvents= me.options.enableKeyEvents;
            this.tabindex = me.options.tabindex || 0;
            this.outerMenu = me.options.outerMenu;
            this.lastSelectedIdx = -1;
            this.emptyColorsClass = me.options.hideEmptyColors ? 'hidden' : '';
            this.colorHints = me.options.colorHints;

            me.colorItems = [];
            if (me.options.keyMoveDirection=='vertical')
                me.moveKeys = [Common.UI.Keys.UP, Common.UI.Keys.DOWN];
            else if (me.options.keyMoveDirection=='horizontal')
                me.moveKeys = [Common.UI.Keys.LEFT, Common.UI.Keys.RIGHT];
            else
                me.moveKeys = [Common.UI.Keys.UP, Common.UI.Keys.DOWN, Common.UI.Keys.LEFT, Common.UI.Keys.RIGHT];

            el.addClass('theme-colorpalette');
            me.options.cls && el.addClass(me.options.cls);
            this.render();

            if (this.options.updateColorsArr)
                this.updateColors(this.options.updateColorsArr[0], this.options.updateColorsArr[1]);
            if (this.options.value)
                this.select(this.options.value, true);
            if (this.options.outerMenu && this.options.outerMenu.focusOnShow && this.options.outerMenu.menu) {
                el.addClass('focused');
                this.options.outerMenu.menu.on('show:after', function(menu) {
                    _.delay(function() {
                        me.showLastSelected();
                        me.focus();
                    }, 10);
                });
            }
            this.updateCustomColors();
            el.closest('.btn-group').on('show.bs.dropdown', _.bind(this.updateCustomColors, this));
            el.closest('.dropdown-submenu').on('show.bs.dropdown', _.bind(this.updateCustomColors, this));
            el.on('click', _.bind(this.handleClick, this));
        },

        render: function () {
            this.$el.html(this.template({colors: this.colors}));

            var me = this;
            this.moveKeys && this.$el.find('a').each(function(num, item) {
                me.colorItems.push({el: item, index: num});
            });
            this.attachKeyEvents();

            var modalParents = this.$el.closest('.asc-window');
            if (modalParents.length > 0) {
                this.tipZIndex = parseInt(modalParents.css('z-index')) + 10;
            }
            if (this.colorHints) {
                this.options.transparent && this.createTip(this.$el.find('a.color-transparent'), this.textTransparent);
                !this.options.themecolors && !this.options.effects && this.updateHints(typeof this.colorHints==='object' ? this.colorHints : undefined);
                this.colorHints = !!this.colorHints;
            }

            return this;
        },

        isBlankSeparator: function(v) {
            return typeof(v) == 'string' && v == '-';
        },
        isSeparator: function(v) {
            return typeof(v) == 'string' && v == '--';
        },
        isColor: function(v) {
            return typeof(v) == 'string' && (/[0-9A-F]{6}/).test(v);
        },
        isTransparent: function(v) {
            return typeof(v) == 'string' && (v=='transparent');
        },
        isCaption: function(v) {
            return (typeof(v) == 'string' && v!='-' && v!='--' && !(/[0-9A-F]{6}|transparent/).test(v));
        },
        isEffect: function(v) {
            return (typeof(v) == 'object' && v.effectId !== undefined);
        },

        getColor: function() {
            return this.value;
        },

        updateCustomColors: function() {
            var el = this.$el || $(this.el);
            if (el) {
                var selected = (this.lastSelectedIdx>=0) ? $(this.colorItems[this.lastSelectedIdx].el) : el.find('a.' + this.selectedCls),
                    color = (selected.length>0 && /color-dynamic/.test(selected[0].className)) ? selected.attr('color') : undefined;
                if (color) { // custom color was selected
                    color = color.toUpperCase();
                    selected.removeClass(this.selectedCls);
                    this.lastSelectedIdx = -1;
                }

                var colors = Common.localStorage.getItem('asc.'+Common.localStorage.getId()+'.colors.custom' + this.options.storageSuffix);
                colors = colors ? colors.split(',') : [];

                var i = -1, colorEl, c = colors.length < this.options.dynamiccolors ? colors.length : this.options.dynamiccolors;
                if (this.options.hideEmptyColors && this._layoutParams && el.find('.dynamic-empty-color').length !== (this.options.dynamiccolors - c)) {// recalc indexed if change custom colors
                    this._layoutParams = undefined;
                }
                while (++i < c) {
                    colorEl = el.find('.color-dynamic-'+ i);
                    colorEl.removeClass('dynamic-empty-color').removeClass(this.emptyColorsClass).attr('color', colors[i]);
                    colorEl.find('span').css({
                        'background-color': '#'+colors[i]
                    });
                    if (colors[i] == color) {
                        colorEl.addClass(this.selectedCls);
                        this.lastSelectedIdx = parseInt(colorEl.attr('idx'));
                        color = undefined; //select only first found color
                    }
                    this.colorHints && this.createTip(colorEl, Common.Utils.ThemeColor.getTranslation(Common.Utils.ThemeColor.getRgbColor(colors[i]).asc_getName()));
                }
                while (i < this.options.dynamiccolors) {
                    colorEl = el.find('.color-dynamic-'+ i);
                    colorEl.removeAttr('color');
                    colorEl.addClass('dynamic-empty-color').addClass(this.emptyColorsClass);
                    colorEl.find('span').css({
                        'background-color': 'transparent'
                    });
                    i++;
                }
                el.find('.palette-color-dynamiccolors').toggleClass(this.emptyColorsClass, c===0);
            }
        },

        handleClick : function(e){
            var me = this;
            var target = $(e.target).closest('a');
            var color, cmp;

            if (target.length==0) return false;

            if (target.hasClass('color-transparent') ) {
                me.clearSelection(true);
                target.addClass(me.selectedCls);
                if (!e.suppressEvent) {
                    me.lastSelectedIdx = parseInt(target.attr('idx'));
                    me.value = 'transparent';
                    me.trigger('select', me, 'transparent');
                }
            } else if ( !(target[0].className.search('color-dynamic')<0) ) {
                if (!/dynamic-empty-color/.test(target[0].className)) {
                    me.clearSelection(true);
                    target.addClass(me.selectedCls);
                    if (!e.suppressEvent)  {
                        me.lastSelectedIdx = parseInt(target.attr('idx'));
                        color = target.attr('color');
                        me.trigger('select', me, color);
                        me.value = color.toUpperCase();
                        if (me.colorHints) {
                            var tip = target.data('bs.tooltip');
                            if (tip) (tip.tip()).remove();
                        }
                    }
                } else {
                    if (e.suppressEvent) {
                        me.clearSelection(true);
                        target.addClass(me.selectedCls);
                    } else
                        setTimeout(function(){
                            me.addNewColor();
                        }, 10);
                }
            } else {
                if (!/^[a-fA-F0-9]{6}$/.test(me.value) || _.indexOf(me.colors, me.value)<0 )
                    me.value = false;

                me.clearSelection(true);
                target.addClass(me.selectedCls);

                color = target[0].className.match(me.colorRe)[1];
                if ( target.hasClass('palette-color-effect') ) {
                    var effectId = parseInt(target.attr('effectid'));
                    if (color && !e.suppressEvent)  {
                        me.value = color.toUpperCase();
                        me.trigger('select', me, {color: color, effectId: effectId});
                        me.lastSelectedIdx = parseInt(target.attr('idx'));
                        if (me.colorHints) {
                            var tip = target.data('bs.tooltip');
                            if (tip) (tip.tip()).remove();
                        }
                    }
                } else {
                    if (/#?[a-fA-F0-9]{6}/.test(color)) {
                        color = /#?([a-fA-F0-9]{6})/.exec(color)[1].toUpperCase();
                        if (color && !e.suppressEvent)  {
                            me.value = color;
                            me.trigger('select', me, color);
                            me.lastSelectedIdx = parseInt(target.attr('idx'));
                            if (me.colorHints) {
                                var tip = target.data('bs.tooltip');
                                if (tip) (tip.tip()).remove();
                            }
                        }
                    }
                }
            }
        },

        setCustomColor: function(color) {
            var el = this.$el || $(this.el);
            color = /#?([a-fA-F0-9]{6})/.exec(color);
            if (color) {
                var isNew = this.saveCustomColor(color[1]);
                this.clearSelection(true);
                var child = el.find('.dynamic-empty-color');
                if (child.length==0) {
                    this.updateCustomColors();
                    child = el.find('.color-dynamic-' + (this.options.dynamiccolors - 1));
                } else {
                    if (isNew && this.options.hideEmptyColors && this._layoutParams) // recalc indexed
                        this._layoutParams = undefined;
                }

                if (isNew) {
                    child.first().removeClass('dynamic-empty-color').removeClass(this.emptyColorsClass).addClass(this.selectedCls).attr('color', color[1]);
                    child.first().find('span').css({
                        'background-color': '#' + color[1]
                    });
                }
                el.find('.palette-color-dynamiccolors').removeClass(this.emptyColorsClass);
                this.select(color[1], true);
            }
        },

        saveCustomColor: function(color) {
            var key_name = 'asc.'+Common.localStorage.getId()+'.colors.custom' + this.options.storageSuffix;
            var colors = Common.localStorage.getItem(key_name);
            colors = colors ? colors.split(',') : [];
            var index = _.indexOf(colors, color.toUpperCase());
            if (index < 0) {
                if (colors.push(color) > this.options.dynamiccolors) colors.shift();
                Common.localStorage.setItem(key_name, colors.join().toUpperCase());
            }
            return index < 0;
        },

        addNewColor: function(defcolor) {
            var me = this;

            var win = new Common.UI.ExtendedColorDialog({
            });
            win.on('onmodalresult', function(mr) {
                me._isdlgopen = false;
                if (mr==1) {
                    me.setCustomColor(win.getColor());
                    me.fireEvent('select', me, win.getColor());
                }
                me.fireEvent('close:extended', me, mr==1);
            });
            me._isdlgopen = true;
            win.setColor((me.value!==undefined && me.value!==false) ? me.value : ((defcolor!==undefined) ? defcolor : '000000'));
            win.show();
        },

        isDialogOpen: function() {
            return this._isdlgopen == true;
        },

        select: function(color, suppressEvent) {
            var el = this.$el || $(this.el);
            this.clearSelection();

            if (typeof(color) == 'object' ) {
                var effectEl;
                if (color.effectId !== undefined) {
                    effectEl = el.find('a[effectid="'+color.effectId+'"]').first();
                    if (effectEl.length>0) {
                        effectEl.addClass(this.selectedCls);
                        this.lastSelectedIdx = parseInt(effectEl.attr('idx'));
                        this.value = effectEl[0].className.match(this.colorRe)[1].toUpperCase();
                    } else
                        this.value = false;
                } else if (color.effectValue !== undefined) {
                    effectEl = el.find('a[effectvalue="'+color.effectValue+'"].color-' + color.color.toUpperCase()).first();
                    if (effectEl.length>0) {
                        effectEl.addClass(this.selectedCls);
                        this.lastSelectedIdx = parseInt(effectEl.attr('idx'));
                        this.value = effectEl[0].className.match(this.colorRe)[1].toUpperCase();
                    } else
                        this.value = false;
                }
            } else {
                if (/#?[a-fA-F0-9]{6}/.test(color)) {
                    color = /#?([a-fA-F0-9]{6})/.exec(color)[1].toUpperCase();
                    this.value = color;
                }

                if (/^[a-fA-F0-9]{6}|transparent$/.test(color) && _.indexOf(this.colors, color)>=0 ) {
                    if (_.indexOf(this.colors, this.value)<0) this.value = false;

                    if (color != this.value || this.options.allowReselect) {
                        var co = (color == 'transparent') ? el.find('a.color-transparent').addClass(this.selectedCls) : el.find('a.palette-color.color-' + color).first().addClass(this.selectedCls);
                        this.value = color;
                        this.lastSelectedIdx = parseInt(co.attr('idx'));
                        if (suppressEvent !== true) {
                            this.fireEvent('select', this, color);
                        }
                    }
                } else {
                    var co = el.find('#'+color).first();
                    if (co.length==0)
                        co = el.find('a[color="'+color+'"]').first();
                    if (co.length>0) {
                        co.addClass(this.selectedCls);
                        this.lastSelectedIdx = parseInt(co.attr('idx'));
                        this.value = color.toUpperCase();
                    }
                }
            }
        },

        selectByRGB: function(rgb, suppressEvent) {
            var el = this.$el || $(this.el);
            this.clearSelection(true);

            var color = (typeof(rgb) == 'object') ? rgb.color : rgb;
            if (/#?[a-fA-F0-9]{6}/.test(color)) {
                color = /#?([a-fA-F0-9]{6})/.exec(color)[1].toUpperCase();
            }

            if (/^[a-fA-F0-9]{6}|transparent$/.test(color)) {
                if (color != this.value || this.options.allowReselect) {
                    var co = (color == 'transparent') ? el.find('a.color-transparent') : el.find('a.color-' + color).first();
                    if (co.length==0)
                        co = el.find('#'+color).first();
                    if (co.length==0)
                        co = el.find('a[color="'+color+'"]').first();
                    if (co.length>0) {
                        co.addClass(this.selectedCls);
                        this.lastSelectedIdx = parseInt(co.attr('idx'));
                        this.value = color;
                    }
                    if (suppressEvent !== true) {
                        this.fireEvent('select', this, color);
                    }
                }
            }
        },

        updateColors: function(effectcolors, standartcolors, value) {
            if (effectcolors===undefined || standartcolors===undefined) return;

            var me = this,
                el = me.$el || $(this.el);

            if (me.aColorElements === undefined) {
                me.aColorElements = el.find('a.palette-color');
            }
            if (me.aEffectElements === undefined) {
                me.aEffectElements = el.find('a.palette-color-effect');
            }

            var aEl;
            var aColorIdx = 0,
                aEffectIdx = 0;

            for (var i=0; i<me.colors.length; i++) {
                if ( typeof(me.colors[i]) == 'string' && (/[0-9A-F]{6}/).test(me.colors[i]) ) {
                    if (aColorIdx>=standartcolors.length)
                        continue;

                    aEl = $(me.aColorElements[aColorIdx]);
                    aEl.removeClass('color-'+me.colors[i]);

                    me.colors[i] = standartcolors[aColorIdx].color = standartcolors[aColorIdx].color.toUpperCase();

                    aEl.addClass('color-'+me.colors[i]);
                    aEl.css({background: "#"+me.colors[i]});
                    aEl.find('span').first().css({background: "#"+me.colors[i]});
                    me.colorHints && me.createTip(aEl, standartcolors[aColorIdx].tip);
                    aColorIdx++;
                } else if ( typeof(me.colors[i]) == 'object' && me.colors[i].effectId !== undefined) {
                    if (aEffectIdx>=effectcolors.length)
                        continue;

                    aEl = $(me.aEffectElements[aEffectIdx]);

                    effectcolors[aEffectIdx].color = effectcolors[aEffectIdx].color.toUpperCase();

                    if ( me.colors[i].color !== effectcolors[aEffectIdx].color ) {
                        aEl.removeClass('color-'+me.colors[i].color);
                        aEl.addClass('color-'+effectcolors[aEffectIdx].color);
                        aEl.css({background: "#"+effectcolors[aEffectIdx].color});
                        aEl.find('span').first().css({background: "#"+effectcolors[aEffectIdx].color});
                    }

                    if ( me.colors[i].effectId !== effectcolors[aEffectIdx].effectId )
                        aEl.attr('effectid', '' + effectcolors[aEffectIdx].effectId);
                    if ( me.colors[i].effectValue !== effectcolors[aEffectIdx].effectValue )
                        aEl.attr('effectvalue', '' + effectcolors[aEffectIdx].effectValue);

                    me.colors[i] = effectcolors[aEffectIdx];
                    me.colorHints && me.createTip(aEl, effectcolors[aEffectIdx].tip);
                    aEffectIdx++;
                }
            }

            if (value)
                this.select(value, true);
            else {
                var selected = el.find('a.' + this.selectedCls);
                if (selected.length && selected.hasClass('palette-color-effect')) {
                    this.value = selected[0].className.match(this.colorRe)[1].toUpperCase();
                }
            }
            this.options.updateColorsArr = undefined;
        },

        createTip: function(view, name) {
            var tipZIndex = this.tipZIndex;
            (view.attr('color-name')===undefined) && view.one('mouseenter', function(e){ // hide tooltip when mouse is over menu
                var $target = $(e.currentTarget);
                $target.tooltip({
                    title: $target.attr('color-name'),
                    placement   : 'cursor',
                    zIndex : tipZIndex
                });
                $target.mouseenter();
            });
            var tip = view.data('bs.tooltip');
            tip && tip.updateTitle(name);
            view.attr('color-name', name || '');
        },

        clearSelection: function(suppressEvent) {
            this.$el.find('a.' + this.selectedCls).removeClass(this.selectedCls);
            if (!suppressEvent) {
                this.value = undefined;
                this.lastSelectedIdx = -1;
            }
        },

        showLastSelected: function() {
            this.selectByIndex(this.lastSelectedIdx, true);
        },

        getSelectedColor: function() {
            var el = this.$el || $(this.el);
            var idx = el.find('a.' + this.selectedCls).attr('idx');
            return (idx!==undefined) ? this.colorItems[parseInt(idx)] : null;
        },

        selectByIndex: function(index, suppressEvent) {
            this.clearSelection(true);

            if (index>=0 && index<this.colorItems.length) {
                this.handleClick({target: this.colorItems[index].el, suppressEvent: suppressEvent});
            }
        },

        generateColorData: function(themecolors, effects, standardcolors, transparent) {
            var arr = [],
                len = (themecolors>0 && effects>0) ? themecolors * effects : 0;
            if (themecolors>0) {
                arr = [this.textThemeColors];
                for (var i=0; i<themecolors; i++)
                    arr.push({color: 'FFFFFF', effectId: 1});

                if (effects>0) arr.push('-');
                for (var i=0; i<len; i++)
                    arr.push({color: 'FFFFFF', effectId: 1});

                if (standardcolors)
                    arr.push('-');
            }
            if (standardcolors) {
                arr.push(this.textStandartColors);
                if (transparent) {
                    arr.push('transparent');
                    standardcolors--;
                }
                for (var i=0; i<standardcolors; i++)
                    arr.push('FFFFFF');
            }
            return arr;
        },

        onKeyDown: function (e, data) {
            if (data===undefined) data = e;
            if (_.indexOf(this.moveKeys, data.keyCode)>-1 || data.keyCode==Common.UI.Keys.RETURN) {
                data.preventDefault();
                data.stopPropagation();
                var rec = this.getSelectedColor();
                if (data.keyCode==Common.UI.Keys.RETURN) {
                    rec && this.selectByIndex(rec.index);
                    if (this.outerMenu && this.outerMenu.menu)
                        this.outerMenu.menu.hide();
                } else {
                    var idx = rec ? rec.index : -1;
                    if (idx<0) {
                        idx = 0;
                    } else if (this.options.keyMoveDirection == 'both') {
                        if (this._layoutParams === undefined)
                            this.fillIndexesArray();
                        var topIdx = this.colorItems[idx].topIdx,
                            leftIdx = this.colorItems[idx].leftIdx;

                        idx = undefined;
                        if (data.keyCode==Common.UI.Keys.LEFT) {
                            while (idx===undefined) {
                                leftIdx--;
                                if (leftIdx<0) {
                                    leftIdx = this._layoutParams.columns-1;
                                }
                                idx = this._layoutParams.itemsIndexes[topIdx][leftIdx];
                            }
                        } else if (data.keyCode==Common.UI.Keys.RIGHT) {
                            while (idx===undefined) {
                                leftIdx++;
                                if (leftIdx>this._layoutParams.columns-1) leftIdx = 0;
                                idx = this._layoutParams.itemsIndexes[topIdx][leftIdx];
                            }
                        } else if (data.keyCode==Common.UI.Keys.UP) {
                            if (topIdx==0 && this.outerMenu && this.outerMenu.menu) {
                                this.clearSelection(true);
                                this.outerMenu.menu.focusOuter(data, this.outerMenu.index);
                            } else
                                while (idx===undefined) {
                                    topIdx--;
                                    if (topIdx<0) topIdx = this._layoutParams.rows-1;
                                    idx = this._layoutParams.itemsIndexes[topIdx][leftIdx];
                                }
                        } else {
                            if (topIdx==this._layoutParams.rows-1 && this.outerMenu && this.outerMenu.menu) {
                                this.clearSelection(true);
                                this.outerMenu.menu.focusOuter(data, this.outerMenu.index);
                            } else
                                while (idx===undefined) {
                                    topIdx++;
                                    if (topIdx>this._layoutParams.rows-1) topIdx = 0;
                                    idx = this._layoutParams.itemsIndexes[topIdx][leftIdx];
                                }
                        }
                    } else {
                        idx = (data.keyCode==Common.UI.Keys.UP || data.keyCode==Common.UI.Keys.LEFT)
                            ? Math.max(0, idx-1)
                            : Math.min(this.colorItems.length - 1, idx + 1) ;
                    }

                    if (idx !== undefined && idx>=0) {
                        this._fromKeyDown = true;
                        this.selectByIndex(idx, true);
                        this._fromKeyDown = false;
                    }
                }
            }
        },

        fillIndexesArray: function() {
            if (this.colorItems.length<=0) return;

            this._layoutParams = {
                itemsIndexes:   [],
                columns:        0,
                rows:           0
            };

            var el = $(this.colorItems[0].el),
                itemW = el.outerWidth() + parseInt(el.css('margin-left')) + parseInt(el.css('margin-right')),
                offsetLeft = this.$el.offset().left,
                offsetTop = el.offset().top,
                prevtop = -1, topIdx = 0, leftIdx = 0;

            for (var i=0; i<this.colorItems.length; i++) {
                var top = $(this.colorItems[i].el).offset().top - offsetTop;
                leftIdx = Math.floor(($(this.colorItems[i].el).offset().left - offsetLeft)/itemW);
                if (top>prevtop) {
                    prevtop = top;
                    this._layoutParams.itemsIndexes.push([]);
                    topIdx = this._layoutParams.itemsIndexes.length-1;
                }
                this._layoutParams.itemsIndexes[topIdx][leftIdx] = i;
                this.colorItems[i].topIdx = topIdx;
                this.colorItems[i].leftIdx = leftIdx;
                if (this._layoutParams.columns<leftIdx) this._layoutParams.columns = leftIdx;
            }
            this._layoutParams.rows = this._layoutParams.itemsIndexes.length;
            this._layoutParams.columns++;
        },

        attachKeyEvents: function() {
            if (this.enableKeyEvents) {
                var el = this.$el || $(this.el);
                el.addClass('canfocused');
                el.attr('tabindex', this.tabindex.toString());
                el.on('keydown', _.bind(this.onKeyDown, this));
            }
        },

        focus: function(index) {
            var el = this.$el || $(this.el);
            el && el.focus();
            if (typeof index == 'string') {
                if (index == 'first') {
                    this.selectByIndex(0, true);
                } else if (index == 'last') {
                    if (this._layoutParams === undefined)
                        this.fillIndexesArray();
                    this.selectByIndex(this._layoutParams.itemsIndexes[this._layoutParams.rows-1][0], true);
                }
            } else if (index !== undefined)
                this.selectByIndex(index, true);
        },

        focusInner: function(e) {
            this.focus(e.keyCode == Common.UI.Keys.DOWN ? 'first' : 'last');
        },

        updateHints: function(values) { // use for hex colors (without effectId)
            if (!this.colorHints) return;

            var me = this;
            (me.$el || $(me.el)).find('a.palette-color').each(function(num, item) {
                if (values && values[num])
                    me.createTip($(item), values[num]);
                else {
                    var color = item.className.match(me.colorRe)[1];
                    me.createTip($(item), Common.Utils.ThemeColor.getTranslation(Common.Utils.ThemeColor.getRgbColor(color).asc_getName()));
                }
            });
        },

        textThemeColors         : 'Theme Colors',
        textStandartColors      : 'Standard Colors',
        textRecentColors        : 'Recent Colors',
        textTransparent         : 'Transparent'
    }, Common.UI.ThemeColorPalette || {}));
});