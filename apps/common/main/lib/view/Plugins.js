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
 * Date: 17.05.16
 */

if (Common === undefined)
    var Common = {};

Common.Views = Common.Views || {};

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout',
    'common/main/lib/component/Window'
], function (template) {
    'use strict';

    Common.Views.Plugins = Common.UI.BaseView.extend(_.extend({
        storePlugins: undefined,

        initialize: function(options) {
            _.extend(this, options);
            this._locked = false;
            this._state = {
                DisabledControls: false,
                docProtection: {
                    isReadOnly: false,
                    isReviewOnly: false,
                    isFormsOnly: false,
                    isCommentsOnly: false
                }
            };
            this.lockedControls = [];
            this.pluginPanels = {};
            this.customPluginPanels = {};
            Common.UI.BaseView.prototype.initialize.call(this, arguments);
        },

        render: function(el) {
            el && (this.$el = $(el));

            // this.viewPluginsList = new Common.UI.DataView({
            //     el: $('#plugins-list'),
            //     store: this.storePlugins,
            //     enableKeyEvents: false,
            //     itemTemplate: _.template([
            //         '<div id="<%= id %>" class="item-plugins" style="display: <% if (visible) {%> block; <%} else {%> none; <% } %>">',
            //             '<div class="plugin-icon" style="background-image: url(' + '<%= baseUrl %>' + '<%= variations[currentVariation].get("icons")[((window.devicePixelRatio > 1) ? 1 : 0) + (variations[currentVariation].get("icons").length>2 ? 2 : 0)] %>);"></div>',
            //             '<% if (variations.length>1) { %>',
            //             '<div class="plugin-caret img-commonctrl"></div>',
            //             '<% } %>',
            //             '<%= name %>',
            //         '</div>'
            //     ].join(''))
            // });
            // this.lockedControls.push(this.viewPluginsList);
            // this.viewPluginsList.cmpEl.off('click');

            this.pluginMenu = new Common.UI.Menu({
                menuAlign   : 'tr-br',
                items: []
            });

            this.trigger('render:after', this);
            return this;
        },

        getPanel: function () {
            var _panel = $('<section id="plugins-panel" class="panel" data-tab="plugins" role="tabpanel" aria-labelledby="plugins"></section>');
            var _group = $('<div class="group"></div>');
            if ( !this.storePlugins.isEmpty() ) {
                this.storePlugins.each(function (model) {
                    // var btn = new Common.UI.Button({
                    //     cls: 'btn-toolbar x-huge icon-top',
                    //     iconCls: 'img-commonctrl review-prev',
                    //     caption: model.get('name'),
                    //     value: model.get('guid'),
                    //     hint: model.get('name')
                    // });
                    //
                    // var $slot = $('<span class="slot"></span>').appendTo(_group);
                    // btn.render($slot);
                });
            }

            _group.appendTo(_panel);
            return _panel;
        },

        renderTo: function (parent) {
            if ( !this.storePlugins.isEmpty() ) {
                var me = this;
                var _group = $('<div class="group"></div>');
                var _set = Common.enumLock;
                this.storePlugins.each(function (model) {
                    if (model.get('visible')) {
                        var modes = model.get('variations'),
                            guid = model.get('guid'),
                            icons = modes[model.get('currentVariation')].get('icons'),
                            _icon_url = model.get('baseUrl') + me.parseIcons(icons),
                            btn = new Common.UI.Button({
                                cls: 'btn-toolbar x-huge icon-top',
                                iconImg: _icon_url,
                                caption: Common.Utils.String.htmlEncode(model.get('name')),
                                menu: modes && modes.length > 1,
                                split: modes && modes.length > 1,
                                value: guid,
                                hint: model.get('name'),
                                lock: model.get('isDisplayedInViewer') ? [_set.viewMode, _set.previewReviewMode, _set.viewFormMode, _set.selRangeEdit, _set.editFormula] : [_set.viewMode, _set.previewReviewMode, _set.viewFormMode, _set.lostConnect, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.selRangeEdit, _set.editFormula],
                                dataHint: '1',
                                dataHintDirection: 'bottom',
                                dataHintOffset: 'small'
                            });

                        var $slot = $('<span class="btn-slot text x-huge"></span>').appendTo(_group);
                        btn.render($slot);

                        model.set('button', btn);
                        me.lockedControls.push(btn);
                    }
                });
                var docProtection = me._state.docProtection
                Common.Utils.lockControls(Common.enumLock.docLockView, docProtection.isReadOnly, {array: me.lockedControls});
                Common.Utils.lockControls(Common.enumLock.docLockForms, docProtection.isFormsOnly, {array: me.lockedControls});
                Common.Utils.lockControls(Common.enumLock.docLockComments, docProtection.isCommentsOnly, {array: me.lockedControls});

                parent.html(_group);
                $('<div class="separator long"></div>').prependTo(parent);
            }
        },

        setLocked: function (locked) {
            this._locked = locked;
        },

        ChangeSettings: function(props) {
            this.disableControls(this._locked);
        },

        disableControls: function(disable) {
            if (this._state.DisabledControls!==disable) {
                this._state.DisabledControls = disable;
                _.each(this.lockedControls, function(item) {
                    item.setDisabled(disable);
                });

                this.pluginsMask && this.pluginsMask.css('display', disable ? 'block' : 'none');
            }
        },

        SetDisabled: function(disable, reviewMode, fillFormMode) {
            if (reviewMode) {
                Common.Utils.lockControls(Common.enumLock.previewReviewMode, disable, {array: this.lockedControls});
            } else if (fillFormMode) {
                Common.Utils.lockControls(Common.enumLock.viewFormMode, disable, {array: this.lockedControls});
            } else {
                Common.Utils.lockControls(Common.enumLock.viewMode, disable, {array: this.lockedControls});
            }
        },

        openedPluginMode: function(pluginGuid, insideMode) {
            // var rec = this.viewPluginsList.store.findWhere({guid: pluginGuid});
            // if ( rec ) {
            //     this.viewPluginsList.cmpEl.find('#' + rec.get('id')).parent().addClass('selected');
            // }

            var model = this.storePlugins.findWhere({guid: pluginGuid});
            if ( model ) {
                var _btn = model.get('button');
                if (_btn) {
                    if (!insideMode) {
                        _btn.toggle(true);
                    }
                    if (_btn.menu && _btn.menu.items.length>0) {
                        _btn.menu.items[0].setCaption(this.textStop);
                        _btn.menu.items[0].isRun = true;
                    }
                    _btn.options.isRun = true;
                }
            }
        },

        closedPluginMode: function(guid, insideMode) {
            // this.viewPluginsList.cmpEl.find('.selected').removeClass('selected');

            var model = this.storePlugins.findWhere({guid: guid});
            if ( model ) {
                var _btn = model.get('button');
                if (_btn) {
                    if (!insideMode) {
                        _btn.toggle(false);
                    }
                    if (_btn.menu && _btn.menu.items.length>0) {
                        _btn.menu.items[0].setCaption(this.textStart);
                        _btn.menu.items[0].isRun = false;
                    }
                    _btn.options.isRun = false;
                }
            }
        },

        iconsStr2IconsObj: function(icons) {
            let result = icons;
            if (typeof result === 'string') {
                if (result.indexOf('%') === -1)
                    return [icons, icons];
                return Common.UI.iconsStr2IconsObj(icons);
            }
            return result;
        },

        parseIcons: function(icons) {
            return Common.UI.getSuitableIcons(this.iconsStr2IconsObj(icons)); // TODO: fix format for icons string and use Common.UI.iconsStr2IconsObj
        },

        updatePluginIcons: function(model) {
            if (!model.get('visible'))
                return null;

            var modes = model.get('variations'),
                icons = modes[model.get('currentVariation')].get('icons');
            if (icons === '') return;
            model.set('parsedIcons', this.parseIcons(icons));
            this.updatePluginButton(model);
        },

        updatePluginButton: function(model) {
            if (!model.get('visible') || !model.get('parsedIcons'))
                return null;
            var menuItem = model.get('backgroundPlugin');
            menuItem && menuItem.cmpEl && menuItem.cmpEl.find("img").attr("src", model.get('baseUrl') + model.get('parsedIcons')['normal']);
        },

        createBackgroundPluginsButton: function () {
            var _set = Common.enumLock;
            var btn = new Common.UI.Button({
                id: 'id-toolbar-btn-background-plugin',
                cls: 'btn-toolbar x-huge icon-top',
                iconCls: 'toolbar__icon btn-background-plugins',
                caption: this.textBackgroundPlugins,
                menu: new Common.UI.Menu({
                    cls: 'background-plugins',
                    style: 'min-width: 230px;',
                    items: [
                        {
                            template: _.template('<div class="menu-header">' + this.textTheListOfBackgroundPlugins + '</div>'),
                            stopPropagation: true
                        }
                    ],
                    restoreHeight: true
                }),
                hint: this.textBackgroundPlugins,
                lock: [_set.viewMode, _set.previewReviewMode, _set.viewFormMode, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.selRangeEdit, _set.editFormula],
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'small'
            });
            this.lockedControls.push(btn);
            return btn;
        },

        createPluginButton: function (model) {
            if (!model.get('visible'))
                return null;

            var me = this;

            var modes = model.get('variations'),
                guid = model.get('guid'),
                icons = modes[model.get('currentVariation')].get('icons'),
                icon_cls;
            if (icons === '') {
                icon_cls = 'toolbar__icon btn-plugin-default'
            } else {
                model.set('parsedIcons', this.parseIcons(icons));
            }
            var _menu_items = [];
            _.each(model.get('variations'), function(variation, index) {
                if (variation.get('visible'))
                    _menu_items.push({
                        caption     : index > 0 ? variation.get('description') : me.textStart,
                        value       : parseInt(variation.get('index')),
                        isRun       : false
                    });
            });

            var _set = Common.enumLock;
            var btn = new Common.UI.ButtonCustom({
                cls: 'btn-toolbar x-huge icon-top',
                iconCls: icon_cls,
                iconsSet: this.iconsStr2IconsObj(icons),
                baseUrl: model.get('baseUrl'), // icons have a relative path, so need to use the base url
                caption: Common.Utils.String.htmlEncode(model.get('name')),
                menu: _menu_items.length > 1,
                split: _menu_items.length > 1,
                value: guid,
                isRun: false,
                hint: model.get('name'),
                lock: model.get('isDisplayedInViewer') ? [_set.viewMode, _set.previewReviewMode, _set.viewFormMode, _set.selRangeEdit, _set.editFormula] : [_set.viewMode, _set.previewReviewMode, _set.viewFormMode, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.selRangeEdit, _set.editFormula ],
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'small',
                customAttributes: {'data-plugin-guid': guid}
            });

            if ( btn.split ) {
                btn.setMenu(
                    new Common.UI.Menu({
                        items: _menu_items,
                        pluginGuid: model.get('guid')
                    })
                );

                btn.menu.on('item:click', function(menu, item, e) {
                    me.fireEvent('plugin:select', [menu.options.pluginGuid, item.value, item.isRun, item.value === 0 && item.isRun]);
                });
            }

            btn.on('click', function(b, e) {
                me.fireEvent('plugin:select', [b.options.value, 0, btn.options.isRun]);
            });

            model.set('button', btn);
            me.lockedControls.push(btn);
            return btn;
        },

        hide: function () {
            Common.UI.BaseView.prototype.hide.call(this,arguments);
            this.fireEvent('hide', this );
        },

        showPluginPanel: function (show, id) {
            var panel = this.pluginPanels[id] ? this.pluginPanels[id] : this.customPluginPanels[id],
                menu = this.pluginPanels[id] ? this.storePlugins.findWhere({guid: id}).get('menu') : panel.menu;
            if (show) {
                for (var key in this.pluginPanels) {
                    if (this.pluginPanels[key].menu === menu) {
                        this.pluginPanels[key].$el.removeClass('active');
                    }
                }
                for (var key in this.customPluginPanels) {
                    if (this.customPluginPanels[key].menu === menu) {
                        this.customPluginPanels[key].$el.removeClass('active');
                    }
                }
                panel.$el.addClass('active');
            } else {
                panel.$el.removeClass('active');
                this.fireEvent(menu === 'right' ? 'pluginsright:hide' : 'pluginsleft:hide', this);
            }
            //this.updateLeftPluginButton(guid);
        },

        /*updateLeftPluginButton: function(guid) {
            var model = this.storePlugins.findWhere({guid: guid}),
                btn = this.pluginBtns[guid];
            if (btn && btn.cmpEl) {
                btn.cmpEl.find("img").attr("src", model.get('baseUrl') + model.get('parsedIcons')[btn.pressed ? 'active' : 'normal']);
            }
        },*/

        strPlugins: 'Plugins',
        textStart: 'Start',
        textStop: 'Stop',
        groupCaption: 'Plugins',
        tipMore: 'More',
        textBackgroundPlugins: 'Background Plugins',
        textTheListOfBackgroundPlugins: 'The list of background plugins',
        textSettings: 'Settings'

    }, Common.Views.Plugins || {}));
});