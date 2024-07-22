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
 *  ComboBox.js
 *
 *  Created on 1/22/14
 *
 */

/**
 *  Using template
 *
 *  <div class="input-group input-group-nr combobox" id="id-combobox">
 *      <input type="text" class="form-control">
 *      <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>
 *      <ul class="dropdown-menu"></ul>
 * </div>
 *
 */

if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Scroller'
], function () {
    'use strict';

    Common.UI.ComboBoxModel = Backbone.Model.extend({
        defaults: function() {
            return {
                id: Common.UI.getId(),
                value: null,
                displayValue: null
            }
        }
    });

    Common.UI.ComboBoxStore = Backbone.Collection.extend({
        model: Common.UI.ComboBoxModel
    });

    Common.UI.ComboBox = Common.UI.BaseView.extend((function() {
        return {
            options : {
                id          : null,
                cls         : '',
                style       : '',
                hint        : false,
                editable    : true,
                disabled    : false,
                menuCls     : '',
                menuStyle   : '',
                menuAlignEl : null,
                restoreMenuHeight: true,
                displayField: 'displayValue',
                valueField  : 'value',
                search      : false,
                placeHolder : '',
                scrollAlwaysVisible: false,
                takeFocusOnClose: false,
                dataHint: '',
                dataHintDirection: '',
                dataHintOffset: ''
            },

            template: _.template([
                '<span class="input-group combobox <%= cls %>" id="<%= id %>" style="<%= style %>">',
                    '<input type="text" class="form-control" spellcheck="false" placeholder="<%= placeHolder %>" role="combobox" aria-controls="<%= id %>-menu" aria-expanded="false" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-hint-offset="<%= dataHintOffset %>" data-move-focus-only-tab="true">',
                    '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">',
                        '<span class="caret"></span>',
                    '</button>',
                    '<ul id="<%= id %>-menu" class="dropdown-menu <%= menuCls %>" style="<%= menuStyle %>" role="menu">',
                        '<% _.each(items, function(item) { %>',
                            '<li id="<%= item.id %>" data-value="<%- item.value %>"><a tabindex="-1" type="menuitem" role="menuitemcheckbox" aria-checked="false"><%= scope.getDisplayValue(item) %></a></li>',
                        '<% }); %>',
                    '</ul>',
                '</span>'
            ].join('')),

            initialize : function(options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                var me = this;

                this.id             = me.options.id || Common.UI.getId();
                this.cls            = me.options.cls;
                this.style          = me.options.style;
                this.menuCls        = me.options.menuCls;
                this.menuStyle      = me.options.menuStyle;
                this.template       = me.options.template || me.template;
                this.itemsTemplate  = me.options.itemsTemplate;
                this.hint           = me.options.hint;
                this.editable       = me.options.editable;
                this.disabled       = me.options.disabled;
                this.store          = me.options.store || new Common.UI.ComboBoxStore();
                this.displayField   = me.options.displayField;
                this.valueField     = me.options.valueField;
                this.placeHolder    = me.options.placeHolder;
                this.search         = me.options.search;
                this.scrollAlwaysVisible = me.options.scrollAlwaysVisible;
                this.focusWhenNoSelection = (me.options.focusWhenNoSelection!==false);
                this.restoreMenuHeight = me.options.restoreMenuHeight;

                me.rendered         = me.options.rendered || false;

                this.lastValue = null;

                me.store.add(me.options.data);

                if (me.options.el) {
                    me.render();
                }
            },

            render : function(parentEl) {
                var me = this;

                if (!me.rendered) {
                    var items = this.store.toJSON();
                    this.cmpEl = $(this.template({
                        id          : this.id,
                        cls         : this.cls,
                        style       : this.style,
                        menuCls     : this.menuCls,
                        menuStyle   : this.menuStyle,
                        items       : items,
                        scope       : me,
                        placeHolder : this.placeHolder,
                        dataHint    : this.options.dataHint,
                        dataHintDirection: this.options.dataHintDirection,
                        dataHintOffset: this.options.dataHintOffset,
                        isRTL       : Common.UI.isRTL()
                    }));
                    if (this.itemsTemplate)
                        this.cmpEl.find('ul').html(
                            $(this.itemsTemplate({
                                items       : items,
                                scope       : me
                            })));

                    if (parentEl) {
                        this.setElement(parentEl, false);
                        parentEl.html(this.cmpEl);
                    } else {
                        this.$el.html(this.cmpEl);
                    }
                } else {
                    this.cmpEl = me.$el || $(this.el);
                }

                if (!me.rendered) {
                    var el = this.cmpEl;

                    this._input  = el.find('input');
                    this._button = el.find('.btn');

                    el.on('click',      'a', _.bind(this.itemClicked, this));
                    el.on('mousedown',  'a', _.bind(this.itemMouseDown, this));

                    if (this.editable) {
                        el.on('change', 'input', _.bind(this.onInputChanged, this));
                        el.on('input', 'input', _.bind(this.onInputChanging, this));
                        el.on('keydown', 'input', _.bind(this.onInputKeyDown, this));
                        el.on('focusin', 'input', _.bind(this.onInputFocusIn, this));
                        el.on('click', '.form-control', _.bind(this.onEditableInputClick, this));
                    } else {
                        el.on('click', '.form-control', _.bind(this.onInputClick, this));
                        this._input.attr('readonly', 'readonly');
                        this._input.attr('data-can-copy', false);
                        this._input.on('mousedown',function (e){e.preventDefault();})
                    }

                    if (me.options.hint) {
                        el.attr('data-toggle', 'tooltip');
                        el.tooltip({
                            title       : me.options.hint,
                            placement   : me.options.hintAnchor||'cursor'
                        });

                        var modalParents = el.closest('.asc-window');
                        if (modalParents.length > 0) {
                            el.data('bs.tooltip').tip().css('z-index', parseInt(modalParents.css('z-index')) + 10);
                            var onModalClose = function(dlg) {
                                if (modalParents[0] !== dlg.$window[0]) return;
                                var tip = el.data('bs.tooltip');
                                if (tip) {
                                    if (tip.dontShow===undefined)
                                        tip.dontShow = true;

                                    tip.hide();
                                }
                                Common.NotificationCenter.off({'modal:close': onModalClose});
                            };
                            Common.NotificationCenter.on({'modal:close': onModalClose});
                        }

                        el.find('.dropdown-menu').on('mouseenter', function(){ // hide tooltip when mouse is over menu
                            var tip = el.data('bs.tooltip');
                            if (tip) {
                                if (tip.dontShow===undefined)
                                    tip.dontShow = true;
                                tip.hide();
                            }
                        });
                    }

                    var $list = el.find('.dropdown-menu');
                    if ($list.hasClass('menu-absolute')) {
                        $list.css('min-width', el.outerWidth());
                    }

                    el.on('show.bs.dropdown',             _.bind(me.onBeforeShowMenu, me));
                    el.on('shown.bs.dropdown',            _.bind(me.onAfterShowMenu, me));
                    el.on('hide.bs.dropdown',             _.bind(me.onBeforeHideMenu, me));
                    el.on('hidden.bs.dropdown',           _.bind(me.onAfterHideMenu, me));
                    el.on('keydown.after.bs.dropdown',    _.bind(me.onAfterKeydownMenu, me));

                    Common.NotificationCenter.on('menumanager:hideall', _.bind(me.closeMenu, me));

                    // set default selection
                    this.setDefaultSelection();

                    this.listenTo(this.store, 'reset',  this.onResetItems);

                    var ariaLabel = this.options.ariaLabel ? this.options.ariaLabel : this.options.hint;
                    if (ariaLabel)
                        this.cmpEl.find('.form-control').attr('aria-label', ariaLabel);
                }

                me.rendered = true;
                if (me.disabled) me.setDisabled(me.disabled);

                return this;
            },

            setData: function(data) {
                this.store.reset([]);
                this.store.add(data);

                this.setRawValue('');
                this.onResetItems();
            },

            openMenu: function(delay) {
                if (this.store.length<1) return;

                var me = this;

                if ( !this.scroller ) {
                    this.scroller = new Common.UI.Scroller(_.extend({
                        el: $('.dropdown-menu', this.cmpEl),
                        minScrollbarLength: 40,
                        includePadding: true,
                        wheelSpeed: 10,
                        alwaysVisibleY: this.scrollAlwaysVisible
                    }, this.options.scroller));
                }

                _.delay(function(){
                    me.cmpEl.addClass('open');
                }, delay || 0);
            },

            closeMenu: function() {
                this.cmpEl.removeClass('open');
                this.cmpEl.find('.form-control').attr('aria-expanded', 'false');
            },

            isMenuOpen: function() {
                return this.cmpEl.hasClass('open');
            },

            onBeforeShowMenu: function(e) {
                if ( !this.scroller ) {
                    this.scroller = new Common.UI.Scroller(_.extend({
                        el: $('.dropdown-menu', this.cmpEl),
                        minScrollbarLength: 40,
                        includePadding: true,
                        wheelSpeed: 10,
                        alwaysVisibleY: this.scrollAlwaysVisible
                    }, this.options.scroller));
                }

                Common.NotificationCenter.trigger('menu:show');
                this.trigger('show:before', this, e);
                if (this.options.hint) {
                    var tip = this.cmpEl.data('bs.tooltip');
                    if (tip) {
                        if (tip.dontShow===undefined)
                            tip.dontShow = true;
                        tip.hide();
                    }
                }

                var $list = this.cmpEl.find('ul'),
                    isMenuAbsolute = $list.hasClass('menu-absolute');
                if (this.options.restoreMenuHeightAndTop || isMenuAbsolute) {
                    var offset = this.cmpEl.offset(),
                        parentTop = this.options.menuAlignEl ? this.options.menuAlignEl.offset().top : 0,
                        marginTop = parseInt($list.css('margin-top')),
                        menuTop = offset.top - parentTop + this.cmpEl.outerHeight() + marginTop,
                        menuLeft = offset.left;

                    if (this.options.restoreMenuHeightAndTop) { // show menu at top
                        var parentHeight = this.options.menuAlignEl ? this.options.menuAlignEl.outerHeight() : Common.Utils.innerHeight() - 10,
                            diff = typeof this.options.restoreMenuHeightAndTop === "number" ? this.options.restoreMenuHeightAndTop : 100000;

                        var showAtTop = (menuTop + $list.outerHeight() > parentHeight) && (menuTop + diff > parentHeight) && ((offset.top - parentTop)*0.9 > parentHeight - menuTop);
                        // if menu height less than restoreMenuHeightAndTop - show menu at top, if greater - try to change menu height + compare available space at top and bottom of combobox
                        if (!isMenuAbsolute)
                            $list.toggleClass('show-top', showAtTop);
                        else if (showAtTop)
                            menuTop = offset.top - parentTop - $list.outerHeight();
                    }
                    if (isMenuAbsolute) {
                        if (menuLeft + $list.outerWidth()>Common.Utils.innerWidth())
                            menuLeft += (this.cmpEl.outerWidth() - $list.outerWidth());
                        $list.css({left: menuLeft, top: menuTop + parentTop});
                    }
                }
            },

            onAfterShowMenu: function(e) {
                this.alignMenuPosition();
                var $list = $(this.el).find('ul'),
                    $selected = $list.find('> li.selected');

                if ($selected.length) {
                    var itemTop = $selected.position().top,
                        itemHeight = $selected.outerHeight(),
                        listHeight = $list.outerHeight();

                    if (itemTop < 0 || itemTop + itemHeight > listHeight) {
                        var height = $list.scrollTop() + itemTop + (itemHeight - listHeight)/2;
                        height = (Math.floor(height/itemHeight) * itemHeight);
                        $list.scrollTop(height);
                    }
                    setTimeout(function(){$selected.find('a').focus();}, 1);
                } else if (this.focusWhenNoSelection) {
                    var me = this;
                    setTimeout(function(){me.cmpEl.find('ul li:first a').focus();}, 1);
                }

                if (this.scroller)
                    this.scroller.update({alwaysVisibleY: this.scrollAlwaysVisible});

                this.cmpEl.find('.form-control').attr('aria-expanded', 'true');

                this.trigger('show:after', this, e, {fromKeyDown: e===undefined});
                this._search = {};
            },

            alignMenuPosition: function () {
                if (this.restoreMenuHeight) {
                    var $list = $(this.el).find('ul');
                    if (typeof this.restoreMenuHeight !== "number") {
                        var maxHeight = parseFloat($list.css('max-height'));
                        if ($list.hasClass('scrollable-menu') || maxHeight) {
                            this.restoreMenuHeight = maxHeight ? maxHeight : 100000;
                        } else {
                            this.restoreMenuHeight = 100000;
                        }
                    }
                    var cg = Common.Utils.croppedGeometry(),
                        parentTop = this.options.menuAlignEl ? this.options.menuAlignEl.offset().top : cg.top,
                        parentHeight = this.options.menuAlignEl ? this.options.menuAlignEl.outerHeight() : cg.height - 10,
                        menuH = $list.outerHeight(),
                        menuTop = $list.get(0).getBoundingClientRect().top,
                        newH = menuH;

                    if (menuH < this.restoreMenuHeight)
                        newH = this.restoreMenuHeight;

                    var offset = this.cmpEl.offset();
                    if (menuTop<offset.top) { // menu is shown at top
                        if (offset.top - parentTop < newH)
                            newH = offset.top - parentTop;
                    } else {
                        if (menuTop + newH > parentHeight + parentTop)
                            newH = parentHeight + parentTop - menuTop;
                    }

                    if (newH !== menuH) {
                        $list.css('max-height', newH + 'px');
                        $list.hasClass('menu-absolute') && (menuTop<offset.top) && $list.css({top: offset.top - $list.outerHeight()});
                    }
                }
            },

            onBeforeHideMenu: function(e) {
                this.trigger('hide:before', this, e);

                if (Common.UI.Scroller.isMouseCapture())
                    e.preventDefault();
            },

            onAfterHideMenu: function(e, isFromInputControl) {
                this.cmpEl.find('.dropdown-toggle').blur();
                this.cmpEl.find('.form-control').attr('aria-expanded', 'false');
                this.trigger('hide:after', this, e, isFromInputControl);
                Common.NotificationCenter.trigger('menu:hide', this, isFromInputControl);
                if (this.options.takeFocusOnClose) {
                    var me = this;
                    (me._input && me._input.length>0 && !me.editable) && (me._input[0].selectionStart===me._input[0].selectionEnd) && setTimeout(function() {
                        me._input[0].selectionStart = me._input[0].selectionEnd = 0;
                    },1);
                    setTimeout(function(){me.focus();}, 1);
                }
            },

            onAfterKeydownMenu: function(e) {
                if (e.keyCode == Common.UI.Keys.DOWN && !this.editable && !this.isMenuOpen()) {
                    this.onBeforeShowMenu();
                    this.openMenu();
                    this.onAfterShowMenu();
                    return false;
                } else if (!this.focusWhenNoSelection && (e.keyCode == Common.UI.Keys.DOWN || e.keyCode == Common.UI.Keys.UP)) {
                    var $items = this.cmpEl.find('ul > li a');
                    if ($items.filter(':focus').length===0 && $items.length>0) {
                        setTimeout(function(){$items[e.keyCode == Common.UI.Keys.DOWN ? 0 : $items.length-1].focus();}, 1);
                    }
                } else if (e.keyCode == Common.UI.Keys.RETURN && (this.editable || this.isMenuOpen())) {
                    var isopen = this.isMenuOpen();
                    $(e.target).click();
                    if (this.rendered) {
                        if (Common.Utils.isIE)
                            this._input.trigger('change', { onkeydown: true });
                        else
                            this._input.blur();
                    }
                    return !isopen;
                }
                else if (e.keyCode == Common.UI.Keys.ESC && this.isMenuOpen()) {
                    this._input.val(this.lastValue);
                    this.closeMenu();
                    this.onAfterHideMenu(e);
                    return false;
                }  else if (this.search && e.keyCode > 64 && e.keyCode < 91 && e.key){
                    if (typeof this._search !== 'object') return;

                    var me = this;
                    clearTimeout(this._search.timer);
                    this._search.timer = setTimeout(function () { me._search = {}; }, 1000);

                    (!this._search.text) && (this._search.text = '');
                    (!this._search.char) && (this._search.char = e.key);
                    (this._search.char !== e.key) && (this._search.full = true);
                    this._search.text += e.key;
                    if (this._search.index===undefined) {
                        var $items = this.cmpEl.find('ul > li').find('> a');
                        this._search.index = $items.index($items.filter(':focus'));
                    }
                    this.selectCandidate();
                }
            },

            selectCandidate: function() {
                var index = (this._search.index && this._search.index != -1) ? this._search.index : 0,
                    re = new RegExp('^' + ((this._search.full) ? this._search.text : this._search.char), 'i'),
                    isFirstCharsEqual = re.test(this.store.at(index).get(this.displayField)),
                    itemCandidate, idxCandidate;

                for (var i=0; i<this.store.length; i++) {
                    var item = this.store.at(i);
                    if (re.test(item.get(this.displayField))) {
                        if (!itemCandidate) {
                            itemCandidate = item;
                            idxCandidate = i;
                            if(!isFirstCharsEqual) 
                                break;  
                        }
                        if (this._search.full && i==index || i>index) {
                            itemCandidate = item;
                            idxCandidate = i;
                            break;
                        }
                    }
                }

                if (itemCandidate) {
                    this._search.index = idxCandidate;
                    var item = $('#' + itemCandidate.get('id') + ' a', $(this.el));
                    if (this.scroller) {
                        this.scroller.update({alwaysVisibleY: this.scrollAlwaysVisible});
                        var $list = $(this.el).find('ul');
                        var itemTop = item.position().top,
                            itemHeight = item.outerHeight(),
                            listHeight = $list.outerHeight();
                        if (itemTop < 0 || itemTop + itemHeight > listHeight) {
                            var height = $list.scrollTop() + itemTop;
                            height = (Math.floor(height/itemHeight) * itemHeight);
                            $list.scrollTop(height);
                        }
                    }
                    item.focus();
                }
            },

            onInputKeyDown: function(e) {
                var me = this;

                if (e.keyCode == Common.UI.Keys.ESC){
                    this._input.val(this.lastValue);
                    this.closeMenu();
                    this.onAfterHideMenu(e);
                } else if (e.keyCode == Common.UI.Keys.UP || e.keyCode == Common.UI.Keys.DOWN) {
                    if (!this.isMenuOpen()) {
                        this.openMenu();
                        this.onAfterShowMenu();
                    }

                    _.delay(function() {
                        me._skipInputChange = true;
                        me.cmpEl.find('ul li:first a').focus();
                    }, 10);
                } else if (e.keyCode == Common.UI.Keys.RETURN && $(e.target).val() === me.lastValue){
                    this._input.trigger('change', { reapply: true });
                } else
                    me._skipInputChange = false;
            },

            onInputFocusIn: function(e) {
                this.trigger('combo:focusin', this, e);
            },

            onInputChanged: function(e, extra) {
                // skip processing for internally-generated synthetic event
                // to avoid double processing
                if (extra && extra.synthetic)
                    return;

                if (this._skipInputChange) {
                    this._skipInputChange = false; return;
                }

                var val = $(e.target).val(),
                    record = {};

                if (this.lastValue === val && !(extra && extra.reapply)) {
                    if (extra && extra.onkeydown)
                        this.trigger('combo:blur', this, e);
                    return;
                }

                record[this.valueField] = val;

                this.trigger('changed:before', this, record, e);

                if (e.isDefaultPrevented())
                    return;

                var obj;
                this._selectedItem = this.store.findWhere((obj={}, obj[this.displayField]=val, obj));

                if (this._selectedItem) {
                    record = this._selectedItem.toJSON();
                    var $selectedItems = $('.selected', $(this.el));
                    $selectedItems.removeClass('selected');
                    $selectedItems.find('a').attr('aria-checked', false);
                    var $newSelectedItem = $('#' + this._selectedItem.get('id'), $(this.el));
                    $newSelectedItem.addClass('selected');
                    $newSelectedItem.find('a').attr('aria-checked', true);
                }

                // trigger changed event
                this.trigger('changed:after', this, record, e);
            },

            onInputChanging: function(e, extra) {
                var newValue = $(e.target).val();

                if (e.isDefaultPrevented())
                    return;

                // trigger changing event
                this.trigger('changing', this, newValue, e);
            },

            onInputClick: function(e) {
                if (this._button)
                    this._button.dropdown('toggle');

                e.preventDefault();
                e.stopPropagation();
            },

            onEditableInputClick: function(e) {
                if (this.options.hint) {
                    var tip = this.cmpEl.data('bs.tooltip');
                    if (tip) {
                        if (tip.dontShow===undefined)
                            tip.dontShow = true;
                        tip.hide();
                    }
                }
                if (this.isMenuOpen() && e.which == 1)
                    e.stopPropagation();
            },

            setDefaultSelection: function () {
                if (!this.rendered)
                    return;

                var val = this._input.val(),
                    obj;

                if (val) {
                    this._selectedItem = this.store.findWhere((obj={}, obj[this.displayField]=val, obj));

                    if (this._selectedItem) {
                        var $selectedItems = $('.selected', $(this.el)),
                            $newSelectedItem = $('#' + this._selectedItem.get('id'), $(this.el));
                        $selectedItems.removeClass('selected');
                        $selectedItems.find('a').attr('aria-checked', false);
                        $newSelectedItem.addClass('selected');
                        $newSelectedItem.find('a').attr('aria-checked', true);
                    }
                }
            },

            setDisabled: function(disabled) {
                disabled = !!disabled;
                this.disabled = disabled;

                if (!this.rendered)
                    return;

                disabled
                    ? this._input.attr('disabled', true)
                    : this._input.removeAttr('disabled');

                this.cmpEl.toggleClass('disabled', disabled);
                this._button.toggleClass('disabled', disabled);
            },

            isDisabled: function() {
                return this.disabled;
            },

            setRawValue: function(value) {
                if (this.rendered)  {
                    this._input.val(value).trigger('change', { synthetic: true });
                    this.lastValue = (value!==null && value !== undefined) ?  value.toString() : value;
                }
            },

            getRawValue: function() {
                return this.rendered ? this._input.val() : null;
            },

            setValue: function(value, defValue) {
                if (!this.rendered)
                    return;

                var obj;
                this._selectedItem = this.store.findWhere((obj={}, obj[this.valueField]=value, obj));

                var $selectedItems = $('.selected', $(this.el));
                $selectedItems.removeClass('selected');
                $selectedItems.find('a').attr('aria-checked', false);

                if (this._selectedItem) {
                    this.setRawValue(this._selectedItem.get(this.displayField));
                    var $newSelectedItem = $('#' + this._selectedItem.get('id'), $(this.el));
                    $newSelectedItem.addClass('selected');
                    $newSelectedItem.find('a').attr('aria-checked', true);
                } else {
                    this.setRawValue((defValue!==undefined) ? defValue : value);
                }
            },

            getValue: function() {
                if (!this.rendered)
                    return null;

                if (this._selectedItem && !_.isUndefined(this._selectedItem.get(this.valueField))) {
                    return this._selectedItem.get(this.valueField);
                }

                return this._input.val();
            },

            getDisplayValue: function(record) {
                return Common.Utils.String.htmlEncode(record[this.displayField]);
            },

            getSelectedRecord: function() {
                if (!this.rendered)
                    return null;

                if (this._selectedItem && !_.isUndefined(this._selectedItem.get(this.valueField))) {
                    return _.extend({}, this._selectedItem.toJSON());
                }

                return null;
            },

            selectRecord: function(record) {
                if (!this.rendered || !record)
                    return;

                this._selectedItem = record;

                var $selectedItems = $('.selected', $(this.el));
                $selectedItems.removeClass('selected');
                $selectedItems.find('a').attr('aria-checked', false);
                this.setRawValue(this._selectedItem.get(this.displayField));
                var $newSelectedItem = $('#' + this._selectedItem.get('id'), $(this.el));
                $newSelectedItem.addClass('selected');
                $newSelectedItem.find('a').attr('aria-checked', true);
            },

            clearSelection: function (){
                var $selectedItems = $('.selected', $(this.el));
                $selectedItems.removeClass('selected');
                $selectedItems.find('a').attr('aria-checked', false);
                this._selectedItem = null;
            },

            itemClicked: function (e) {
                var el = $(e.target).closest('li');

                this._selectedItem = this.store.findWhere({
                    id: el.attr('id')
                });

                if (this._selectedItem) {
                    // set input text and trigger input change event marked as synthetic
                    this.lastValue = this._selectedItem.get(this.displayField);
                    this._input.val(this.lastValue).trigger('change', { synthetic: true });

                    var $selectedItems = $('.selected', $(this.el));
                    $selectedItems.removeClass('selected');
                    $selectedItems.find('a').attr('aria-checked', false);
                    el.addClass('selected');
                    el.find('a').attr('aria-checked', true);

                    // trigger changed event
                    this.trigger('selected', this, _.extend({}, this._selectedItem.toJSON()), e);

                    e.preventDefault();
                }
                this._isMouseDownMenu = false;
            },

            itemMouseDown: function(e) {
                if (e.which != 1) {
                    e.preventDefault();
                    e.stopPropagation();

                    return false;
                }
                this._isMouseDownMenu = true;
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
                           '<li id="<%= item.id %>" data-value="<%- item.value %>"><a tabindex="-1" type="menuitem" role="menuitemcheckbox" aria-checked="false"><%= scope.getDisplayValue(item) %></a></li>',
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
                this._input && this._input.focus();
            }
        }
    })());

    Common.UI.ComboBoxCustom = Common.UI.ComboBox.extend(_.extend({
        itemClicked: function (e) {
            Common.UI.ComboBox.prototype.itemClicked.call(this, e);
            if (this.options.updateFormControl)
                this.options.updateFormControl.call(this, this._selectedItem);
        },

        setValue: function(value, defValue) {
            Common.UI.ComboBox.prototype.setValue.call(this, value, defValue);
            if (this.options.updateFormControl)
                this.options.updateFormControl.call(this, this._selectedItem, defValue);
        },

        selectRecord: function(record) {
            Common.UI.ComboBox.prototype.selectRecord.call(this, record);
            if (this.options.updateFormControl)
                this.options.updateFormControl.call(this, this._selectedItem);
        },

        focus: function() {
            this.cmpEl && this.cmpEl.find('.form-control').focus();
        }
    }, Common.UI.ComboBoxCustom || {}));
});