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
 *  AdvancedSettingsWindow.js
 *
 *  Created on 2/21/14
 *
 */

define([], function () { 'use strict';
    Common.Views.AdvancedSettingsWindow = Common.UI.Window.extend(_.extend({
        initialize : function(options) {
            var _options = {};
            _.extend(_options,  {
                height: 'auto',
                header: true,
                cls: 'advanced-settings-dlg',
                toggleGroup: 'advanced-settings-group',
                contentTemplate: '', // use instead 'template' for internal layout
                contentStyle: '',
                items: [],
                buttons: ['ok', 'cancel'],
                separator: true
            }, options);

            this.template = options.template || [
                '<div class="box">',
                    '<% if (items.length>0) { %>',
                    '<div class="menu-panel">',
                    '<% _.each(items, function(item) { %>',
                        '<div id="slot-category-<%= item.panelId %>"></div>',
                    '<% }); %>',
                    '</div>',
                    '<div class="separator"></div>',
                    '<% } %>',
                    '<div class="content-panel" style="<%= contentStyle %>">' + _options.contentTemplate + '</div>',
                '</div>',
                '<% if (separator) { %>',
                '<div class="separator horizontal"></div>',
                '<% } %>'
            ].join('');

            _options.tpl = _.template(this.template)(_options);

            this.handler = _options.handler;
            this.toggleGroup = _options.toggleGroup;
            this.contentWidth = _options.contentWidth;
            this.storageName = _options.storageName;

            Common.UI.Window.prototype.initialize.call(this, _options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this;

            var $window = this.getChild();
            $window.find('.dlg-btn').on('click',         _.bind(this.onDlgBtnClick, this));

            this.on('animate:after', _.bind(this.onAnimateAfter, this));

            this.btnsCategory = [];
            this.options.items.forEach(function(item, index) {
                var btn = new Common.UI.Button({
                    parentEl: $window.find('#slot-category-' + item.panelId),
                    cls: 'btn-category ' + (item.categoryCls || ''),
                    caption: item.panelCaption,
                    iconCls: item.categoryIcon || '',
                    enableToggle: true,
                    toggleGroup: me.toggleGroup,
                    allowDepress: false,
                    contentTarget: item.panelId
                });
                btn.cmpEl.attr('content-target', item.panelId)
                btn.on('click', _.bind(me.onCategoryClick, me, btn, index));
                me.btnsCategory.push(btn);
            });
            var cnt_panel = $window.find('.content-panel'),
                menu_panel = $window.find('.menu-panel');
            cnt_panel.width(this.contentWidth);
            $window.width(((menu_panel.length>0) ? menu_panel.width() : 0) + cnt_panel.outerWidth() + 2);

            if (this.options.contentHeight) {
                $window.find('.body > .box').css('height', this.options.contentHeight);
            } else if (typeof this.options.height === 'number') {
                var bodyEl = $window.find('.body'),
                    hfHeight = parseInt($window.find('.header').css('height')) + parseInt($window.find('.footer').css('height')) + parseInt(bodyEl.css('padding-top')) + parseInt(bodyEl.css('padding-bottom')) +
                               parseInt($window.css('border-bottom-width')) + parseInt($window.css('border-top-width'));
                $window.find('.body > .box').css('height', this.options.height - hfHeight);
            }

            this.content_panels = $window.find('.settings-panel');
            if (this.btnsCategory.length>0)
                this.btnsCategory[0].toggle(true, true);

            var onMainWindowResize = function(){
                $window.width(((menu_panel.length>0) ? menu_panel.width() : 0) + cnt_panel.outerWidth() + 2);
            };
            $(window).on('resize', onMainWindowResize);
            this.on('close', function() {
                $(window).off('resize', onMainWindowResize);
            });
        },

        setHeight: function(height) {
            Common.UI.Window.prototype.setHeight.call(this, height);

            var $window = this.getChild(),
                bodyEl = $window.find('.body'),
                footerHeight = parseInt($window.find('.footer').css('height')) + parseInt(bodyEl.css('padding-top')) + parseInt(bodyEl.css('padding-bottom'));
            $window.find('.body > .box').css('height', parseInt(bodyEl.css('height')) - footerHeight);
        },

        setInnerHeight: function(height) { // height of box element
            var $window = this.getChild(),
                bodyEl = $window.find('.body'),
                hfHeight = parseInt($window.find('.header').css('height')) + parseInt($window.find('.footer').css('height')) + parseInt(bodyEl.css('padding-top')) + parseInt(bodyEl.css('padding-bottom')) +
                           parseInt($window.css('border-bottom-width')) + parseInt($window.css('border-top-width'));

            Common.UI.Window.prototype.setHeight.call(this, height + hfHeight);
            $window.find('.body > .box').css('height', height);
        },

        onDlgBtnClick: function(event) {
            var state = event.currentTarget.attributes['result'].value;
            if ( this.handler && this.handler.call(this, state, (state == 'ok') ? this.getSettings() : undefined) )
                return;
            this.close();
        },

        onCategoryClick: function(btn, index) {
            this.content_panels.filter('.active').removeClass('active');
            $("#" + btn.options.contentTarget).addClass("active");
        },

        getSettings: function() {
            return;
        },

        onPrimary: function() {
            if ( this.handler && this.handler.call(this, 'ok', this.getSettings()) )
                return false;

            this.close();
            return false;
        },

        setActiveCategory: function(index) {
            if (this.btnsCategory.length<1) return;

            index = (index>=0 && index<this.btnsCategory.length) ? index : 0;
            var btnActive = this.btnsCategory[index];
            if (!btnActive.isVisible() || btnActive.isDisabled()) {
                for (var i = 0; i<this.btnsCategory.length; i++){
                    var btn = this.btnsCategory[i];
                    if (btn.isVisible() && !btn.isDisabled()) {
                        btnActive = btn;
                        index = i;
                        break;
                    }
                }
            }
            btnActive.toggle(true);
            this.onCategoryClick(btnActive, index);
        },

        getActiveCategory: function() {
            var index = -1;
            this.btnsCategory.forEach(function(btn, idx){
                if (btn.pressed) index = idx;
            });
            return index;
        },

        close: function(suppressevent) {
            if (this.storageName)
                Common.localStorage.setItem(this.storageName, this.getActiveCategory());
            Common.UI.Window.prototype.close.call(this, suppressevent);
        },

        onAnimateAfter: function() {

        }
    }, Common.Views.AdvancedSettingsWindow || {}));
});