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
 *  ComboBoxFonts.js
 *
 *  Created by Alexander Yuzhin on 2/11/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};

var FONT_TYPE_RECENT = 4;

define([
    'common/main/lib/component/ComboBox'
], function () {
    'use strict';

    Common.UI.ComboBoxFonts = Common.UI.ComboBox.extend((function() {
        var iconWidth       = 302,
            iconHeight      = Asc.FONT_THUMBNAIL_HEIGHT || 26,
            isRetina        = window.devicePixelRatio > 1,
            thumbCanvas     = document.createElement('canvas'),
            thumbContext    = thumbCanvas.getContext('2d'),
            thumbPath       = '../../../../sdkjs/common/Images/fonts_thumbnail.png',
            thumbPath2x     = '../../../../sdkjs/common/Images/fonts_thumbnail@2x.png',
            listItemHeight  = 36;

        if (typeof window['AscDesktopEditor'] === 'object') {
            thumbPath       = window['AscDesktopEditor'].getFontsSprite();
            thumbPath2x     = window['AscDesktopEditor'].getFontsSprite(true);
        }

        thumbCanvas.height  = isRetina ? iconHeight * 2 : iconHeight;
        thumbCanvas.width   = isRetina ? iconWidth  * 2 : iconWidth;

        return {
            template: _.template([
                '<div class="input-group combobox fonts <%= cls %>" id="<%= id %>" style="<%= style %>">',
                    '<input type="text" class="form-control" spellcheck="false"> ',
                    '<div style="display: table-cell;"></div>',
                    '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret img-commonctrl"></span></button>',
                    '<ul class="dropdown-menu <%= menuCls %>" style="<%= menuStyle %>" role="menu">',
                        '<li class="divider">',
                    '<% _.each(items, function(item) { %>',
                        '<li id="<%= item.id %>">',
                            '<a class="font-item" tabindex="-1" type="menuitem" style="vertical-align:middle; margin: 0 0 0 -10px; height:<%=scope.getListItemHeight()%>px;"/>',
                        '</li>',
                    '<% }); %>',
                    '</ul>',
                '</div>'
            ].join('')),

            initialize : function(options) {
                Common.UI.ComboBox.prototype.initialize.call(this, _.extend(options, {
                    displayField: 'name',
                    scroller: {
                        wheelSpeed: 20,
                        alwaysVisibleY: true,
                        onChange: this.updateVisibleFontsTiles.bind(this)
                    }
                }));

                this.recent = _.isNumber(options.recent) ? options.recent : 3;

                Common.NotificationCenter.on('fonts:change',    _.bind(this.onApiChangeFont, this));
                Common.NotificationCenter.on('fonts:load',      _.bind(this.fillFonts, this));
            },

            render : function(parentEl) {
                var oldRawValue = null;

                if (!_.isUndefined(this._input)) {
                    oldRawValue = this._input.val();
                }

                Common.UI.ComboBox.prototype.render.call(this, parentEl);

                this.setRawValue(oldRawValue);

                this._input.on('keyup',     _.bind(this.onInputKeyUp, this));
                this._input.on('keydown',   _.bind(this.onInputKeyDown, this));
                this._input.on('focus',     _.bind(function() {this.inFormControl = true;}, this));
                this._input.on('blur',      _.bind(function() {this.inFormControl = false;}, this));

                this._modalParents = this.cmpEl.closest('.asc-window');

                return this;
            },

            onAfterKeydownMenu: function(e) {
                var me = this;
                if (e.keyCode == Common.UI.Keys.RETURN) {
                     if ($(e.target).closest('input').length) { // enter in input field
                        if (this.lastValue !== this._input.val())
                            this._input.trigger('change');
                    } else { // enter in dropdown list
                        $(e.target).click();
                        if (this.rendered) {
                            if (Common.Utils.isIE)
                                this._input.trigger('change', { onkeydown: true });
                            else
                                this._input.blur();
                        }
                     }
                    return false;
                } else if (e.keyCode == Common.UI.Keys.ESC && this.isMenuOpen()) {
                    this._input.val(this.lastValue);
                     setTimeout(function() {
                        me.closeMenu();
                        me.onAfterHideMenu(e);
                    }, 10);
                    return false;
                } else if ((e.keyCode == Common.UI.Keys.HOME && !e.shiftKey || e.keyCode == Common.UI.Keys.END && !e.shiftKey || e.keyCode == Common.UI.Keys.BACKSPACE && !me._input.is(':focus')) && this.isMenuOpen()) {
                    me._input.focus();
                    setTimeout(function() {
                        me._input[0].selectionStart = me._input[0].selectionEnd = (e.keyCode == Common.UI.Keys.HOME) ? 0 : me._input[0].value.length;
                    }, 10);
                }

                this.updateVisibleFontsTiles();
            },

            onInputKeyUp: function(e) {
                if (e.keyCode != Common.UI.Keys.RETURN && e.keyCode !== Common.UI.Keys.SHIFT &&
                    e.keyCode !== Common.UI.Keys.CTRL && e.keyCode !== Common.UI.Keys.ALT &&
                    e.keyCode !== Common.UI.Keys.LEFT && e.keyCode !== Common.UI.Keys.RIGHT &&
                    e.keyCode !== Common.UI.Keys.HOME && e.keyCode !== Common.UI.Keys.END &&
                    e.keyCode !== Common.UI.Keys.ESC &&
                    e.keyCode !== Common.UI.Keys.INSERT && e.keyCode !== Common.UI.Keys.TAB){
                    e.stopPropagation();
                    this.selectCandidate(e.keyCode == Common.UI.Keys.DELETE || e.keyCode == Common.UI.Keys.BACKSPACE);
                    if (this._selectedItem) {
                        var me = this;
                        if (me._timerSelection===undefined)
                            me._timerSelection = setInterval(function(){
                                if ((new Date()) - me._inInputKeyDown<100 || !me._selectedItem) return;

                                clearInterval(me._timerSelection);
                                me._timerSelection = undefined;
                                var input = me._input[0],
                                    text = me._selectedItem.get(me.displayField),
                                    inputVal = input.value;
                                if (me.rendered)  {
                                    if (document.selection) { // IE
                                        document.selection.createRange().text = text;
                                    } else if (input.selectionStart || input.selectionStart == '0') { //FF и Webkit
                                        input.value = text;
                                        input.selectionStart = inputVal.length;
                                        input.selectionEnd = text.length;
                                    }
                                }
                            }, 10);
                    }
                }
            },

            onInputKeyDown: function(e) {
                this._inInputKeyDown = (new Date());
                var me = this;

                if (e.keyCode == Common.UI.Keys.ESC){
                    this._input.val(this.lastValue);
                    setTimeout(function() {
                        me.closeMenu();
                        me.onAfterHideMenu(e);
                    }, 10);
                } else if (e.keyCode != Common.UI.Keys.RETURN && e.keyCode != Common.UI.Keys.CTRL && e.keyCode != Common.UI.Keys.SHIFT && e.keyCode != Common.UI.Keys.ALT){
                    if (!this.isMenuOpen() && !e.ctrlKey)
                        this.openMenu();

                    if (e.keyCode == Common.UI.Keys.UP || e.keyCode == Common.UI.Keys.DOWN) {
                        _.delay(function() {
                            var selected = (e.keyCode == Common.UI.Keys.DOWN) ? me.cmpEl.find('ul li.selected').nextAll('li:not(.divider)') : me.cmpEl.find('ul li.selected').prevAll('li:not(.divider)');
                            selected = (selected.length>0) ? selected.eq(0) : ((e.keyCode == Common.UI.Keys.DOWN) ? me.cmpEl.find('ul li:not(.divider):first') : me.cmpEl.find('ul li:not(.divider):last'));
                            selected = selected.find('a');

                            me._skipInputChange = true;
                            selected.focus();
                            me.updateVisibleFontsTiles();
                        }, 10);
                    } else
                        me._skipInputChange = false;
                } else if (e.keyCode == Common.UI.Keys.RETURN && this._input.val() === me.lastValue){
                    this._input.trigger('change', { reapply: true });
                }
            },

            onInputChanged: function(e, extra) {
                // skip processing for internally-generated synthetic event
                // to avoid double processing
                if (extra && extra.synthetic)
                    return;

                if (this._skipInputChange) {
                    this._skipInputChange = false; return;
                }

                if (this._isMouseDownMenu) {
                    this._isMouseDownMenu = false; return;
                }

                var val = $(e.target).val(),
                    record = {};

                if (this.lastValue === val && !(extra && extra.reapply)) {
                    if (extra && extra.onkeydown)
                        this.trigger('combo:blur', this, e);
                    return;
                }

                record[this.valueField] = val;
                record[this.displayField] = val;

                this.trigger('changed:before', this, record, e);

                if (e.isDefaultPrevented())
                    return;

                if (this._selectedItem) {
                    record[this.valueField] = this._selectedItem.get(this.displayField);
                    this.setRawValue(record[this.valueField]);
                    this.trigger('selected', this, _.extend({}, this._selectedItem.toJSON()), e);
                    this.addItemToRecent(this._selectedItem);
                    this.closeMenu();
                } else {
                    this.setRawValue(record[this.valueField]);
                    record['isNewFont'] = true;
                    this.trigger('selected', this, record, e);
                    this.closeMenu();
                }

                // trigger changed event
                this.trigger('changed:after', this, record, e);
            },

            getImageUri: function(opts) {
                if (opts.cloneid) {
                    var img = $(this.el).find('ul > li#'+opts.cloneid + ' img');
                    return img != null ? img[0].src : undefined;
                }

                if (isRetina) {
                    thumbContext.clearRect(0, 0, iconWidth * 2, iconHeight * 2);
                    thumbContext.drawImage(this.spriteThumbs, 0, -Asc.FONT_THUMBNAIL_HEIGHT * 2 * opts.imgidx);
                } else {
                    thumbContext.clearRect(0, 0, iconWidth, iconHeight);
                    thumbContext.drawImage(this.spriteThumbs, 0, -Asc.FONT_THUMBNAIL_HEIGHT * opts.imgidx);
                }

                return thumbCanvas.toDataURL();
            },

            getImageWidth: function() {
                return iconWidth;
            },

            getImageHeight: function() {
                return iconHeight;
            },

            getListItemHeight: function() {
                return listItemHeight;
            },

            loadSprite: function(callback) {
                if (callback) {
                    this.spriteThumbs = new Image();
                    this.spriteThumbs.onload = callback;
                    this.spriteThumbs.src = (window.devicePixelRatio > 1) ? thumbPath2x : thumbPath;
                }
            },

            fillFonts: function(store, select) {
                var me = this;

                this.loadSprite(function() {
                    me.store.set(store.toJSON());

                    me.rendered = false;
                    if (!_.isUndefined(me.scroller)) {
                        me.scroller.destroy();
                        delete me.scroller;
                    }
                    me._scrollerIsInited = false;
                    me.render($(me.el));

                    me._fontsArray = me.store.toJSON();

                    if (me.recent > 0) {
                        me.store.on('add', me.onInsertItem, me);
                        me.store.on('remove', me.onRemoveItem, me);
                    }
                });
            },

            onApiChangeFont: function(font) {
                var me = this;
                setTimeout(function () {
                    me.onApiChangeFontInternal(font);
                }, 100);
            },

            onApiChangeFontInternal: function(font) {
                if (this.inFormControl) return;

                var name = (_.isFunction(font.get_Name) ?  font.get_Name() : font.asc_getName());

                if (this.getRawValue() !== name) {
                    if (this._modalParents.length > 0) return;

                    var record = this.store.findWhere({
                        name: name
                    });

                    $('.selected', $(this.el)).removeClass('selected');

                    if (record) {
                        this.setRawValue(record.get(this.displayField));
                        var itemNode = $('#' + record.get('id'), $(this.el)),
                            menuNode = $('ul.dropdown-menu', this.cmpEl);

                        if (itemNode && menuNode) {
                            itemNode.addClass('selected');
                            if (this.recent<=0)
                                menuNode.scrollTop(itemNode.offset().top - menuNode.offset().top);
                        }
                    } else {
                        this.setRawValue(name);
                    }
                }
            },

            itemClicked: function (e) {
                var el = $(e.target).closest('li');
                var record = this.store.findWhere({id: el.attr('id')});
                this.addItemToRecent(record);

                Common.UI.ComboBox.prototype.itemClicked.apply(this, arguments);
            },

            onInsertItem: function(item) {
                $(this.el).find('ul').prepend(_.template([
                    '<li id="<%= item.id %>">',
                        '<a class="font-item" tabindex="-1" type="menuitem" style="vertical-align:middle; margin: 0 0 0 -10px; height:<%=scope.getListItemHeight()%>px;"/>',
                    '</li>'
                ].join(''))({
                    item: item.attributes,
                    scope: this
                }));
            },

            onRemoveItem: function(item, store, opts) {
                $(this.el).find('ul > li#'+item.id).remove();
            },

            onBeforeShowMenu: function(e) {
                Common.UI.ComboBox.prototype.onBeforeShowMenu.apply(this, arguments);

                if (!this.getSelectedRecord() && !!this.getRawValue()) {
                    var record = this.store.where({name: this.getRawValue()});
                    if (record && record.length) {
                        this.selectRecord(record[record.length - 1]);
                    }
                }
            },

            onAfterShowMenu: function(e) {
                if (this.recent > 0) {
                    if (this.scroller && !this._scrollerIsInited) {
                        this.scroller.update();
                        this._scrollerIsInited = true;
                    }
                    $(this.el).find('ul').scrollTop(0);
                    this.trigger('show:after', this, e);
                    this.flushVisibleFontsTiles();
                    this.updateVisibleFontsTiles(null, 0);
                } else {
                    Common.UI.ComboBox.prototype.onAfterShowMenu.apply(this, arguments);
                }
            },

            onAfterHideMenu: function(e) {
                if (this.lastValue !== this._input.val())
                    this._input.val(this.lastValue);

                Common.UI.ComboBox.prototype.onAfterHideMenu.apply(this, arguments);
            },

            addItemToRecent: function(record) {
                if (this.recent<1) return;

                if (record.get('type') != FONT_TYPE_RECENT &&
                    !this.store.findWhere({name: record.get('name'),type:FONT_TYPE_RECENT})) {
                    var fonts = this.store.where({type:FONT_TYPE_RECENT});
                    if (!(fonts.length < this.recent)) {
                        this.store.remove(fonts[this.recent - 1]);
                    }

                    var new_record = record.clone();
                    new_record.set({'type': FONT_TYPE_RECENT, 'id': Common.UI.getId(), cloneid: record.id});
                    this.store.add(new_record, {at:0});
                }
            },

            selectCandidate: function(full) {
                var me = this,
                    inputVal = this._input.val().toLowerCase();

                if (!this._fontsArray)
                    this._fontsArray = this.store.toJSON();

                var font = _.find(this._fontsArray, function(font) {
                    return (full) ? (font[me.displayField].toLowerCase() == inputVal) : (font[me.displayField].toLowerCase().indexOf(inputVal) == 0)
                });

                if (font) {
                    this._selectedItem = this.store.findWhere({
                        id: font.id
                    });
                } else
                    this._selectedItem = null;

                $('.selected', $(this.el)).removeClass('selected');

                if (this._selectedItem) {
                    var itemNode = $('#' + this._selectedItem.get('id'), $(this.el)),
                        menuEl   = $('ul[role=menu]', $(this.el));

                    if (itemNode.length > 0 && menuEl.length > 0) {
                        itemNode.addClass('selected');

                        var itemTop = itemNode.position().top,
                            menuTop = menuEl.scrollTop();

                        if (itemTop != 0)
                            menuEl.scrollTop(menuTop + itemTop);
                    }
                }
            },

            updateVisibleFontsTiles: function(e, scrollY) {
                var me = this, j = 0, storeCount = me.store.length, index = 0;

                if (!me.tiles) me.tiles = [];
                if (storeCount !== me.tiles.length) {
                    for (j =  me.tiles.length; j < storeCount; ++j) {
                        me.tiles.unshift(null);
                    }
                }

                if (_.isUndefined(scrollY)) scrollY = parseInt($(me.el).find('.ps-scrollbar-x-rail').css('bottom'));

                var scrollH = $(me.el).find('.dropdown-menu').height(),
                    count = Math.max(Math.floor(scrollH / listItemHeight) + 3, 0),
                    from = Math.max(Math.floor(-(scrollY / listItemHeight)) - 1, 0),
                    to = from + count;

                var listItems = $(me.el).find('a');

                for (j = 0; j < storeCount; ++j) {
                    if (from <= j && j < to) {
                        if (null === me.tiles[j]) {
                            var fontImage = document.createElement('canvas');
                            var context = fontImage.getContext('2d');

                            fontImage.height = isRetina ? iconHeight * 2 : iconHeight;
                            fontImage.width = isRetina ? iconWidth  * 2 : iconWidth;

                            fontImage.style.width = iconWidth + 'px';
                            fontImage.style.height = iconHeight + 'px';

                            index = me.store.at(j).get('imgidx');

                            if (isRetina) {
                                context.clearRect(0, 0, iconWidth * 2, iconHeight * 2);
                                context.drawImage(me.spriteThumbs, 0, -Asc.FONT_THUMBNAIL_HEIGHT * 2 * index);
                            } else {
                                context.clearRect(0, 0, iconWidth, iconHeight);
                                context.drawImage(me.spriteThumbs, 0, -Asc.FONT_THUMBNAIL_HEIGHT * index);
                            }

                            me.tiles[j] = fontImage;
                            $(listItems[j]).get(0).appendChild(fontImage);
                        }
                    } else {
                        if (me.tiles[j]) {
                            me.tiles[j].parentNode.removeChild(me.tiles[j]);
                            me.tiles[j] = null;
                        }
                    }
                }
            },

            flushVisibleFontsTiles: function() {
                for (var j = this.tiles.length - 1; j >= 0; --j) {
                    if (this.tiles[j]) {
                        this.tiles[j].parentNode.removeChild(this.tiles[j]);
                        this.tiles[j] = null;
                    }
                }
            }
        }
    })());
});