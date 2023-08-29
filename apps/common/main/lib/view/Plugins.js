/*
 * (c) Copyright Ascensio System SIA 2010-2023
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
 * User: Julia.Radzhabova
 * Date: 17.05.16
 * Time: 15:38
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
            this.pluginBtns = {};
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

            $(window).on('resize', _.bind(this.setMoreButton, this));

            this.trigger('render:after', this);
            return this;
        },

        getPanel: function () {
            var _panel = $('<section id="plugins-panel" class="panel" data-tab="plugins"></section>');
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
                                caption: model.get('name'),
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

        openedPluginMode: function(pluginGuid) {
            // var rec = this.viewPluginsList.store.findWhere({guid: pluginGuid});
            // if ( rec ) {
            //     this.viewPluginsList.cmpEl.find('#' + rec.get('id')).parent().addClass('selected');
            // }

            var model = this.storePlugins.findWhere({guid: pluginGuid});
            if ( model ) {
                var _btn = model.get('button');
                if (_btn) {
                    _btn.toggle(true);
                    this.updatePluginButton(model);
                    if (_btn.menu && _btn.menu.items.length>0) {
                        _btn.menu.items[0].setCaption(this.textStop);
                    }
                }
            }
        },

        closedPluginMode: function(guid) {
            // this.viewPluginsList.cmpEl.find('.selected').removeClass('selected');

            var model = this.storePlugins.findWhere({guid: guid});
            if ( model ) {
                var _btn = model.get('button');
                if (_btn) {
                    _btn.toggle(false);
                    this.updatePluginButton(model);
                    if (_btn.menu && _btn.menu.items.length>0) {
                        _btn.menu.items[0].setCaption(this.textStart);
                    }
                }
            }
        },

        parseIcons: function(icons) {
            if (icons.length && typeof icons[0] !== 'string') {
                var theme = Common.UI.Themes.currentThemeId().toLowerCase(),
                    style = Common.UI.Themes.isDarkTheme() ? 'dark' : 'light',
                    idx = -1;
                for (var i=0; i<icons.length; i++) {
                    if (icons[i].theme && icons[i].theme.toLowerCase() == theme) {
                        idx = i;
                        break;
                    }
                }
                if (idx<0)
                    for (var i=0; i<icons.length; i++) {
                        if (icons[i].style && icons[i].style.toLowerCase() == style) {
                            idx = i;
                            break;
                        }
                    }
                (idx<0) && (idx = 0);

                var ratio = Common.Utils.applicationPixelRatio()*100,
                    current = icons[idx],
                    bestDistance = 10000,
                    currentDistance = 0,
                    defUrl,
                    bestUrl;
                for (var key in current) {
                    if (current.hasOwnProperty(key)) {
                        if (key=='default') {
                            defUrl = current[key];
                        } else if (!isNaN(parseInt(key))) {
                            currentDistance = Math.abs(ratio-parseInt(key));
                            if (currentDistance < (bestDistance - 0.01))
                            {
                                bestDistance = currentDistance;
                                bestUrl = current[key];
                            }
                        }
                    }
                }
                (bestDistance>0.01 && defUrl) && (bestUrl = defUrl);
                return {
                    'normal': bestUrl['normal'],
                    'hover': bestUrl['hover'] || bestUrl['normal'],
                    'active': bestUrl['active'] || bestUrl['normal']
                };
            } else { // old version
                var url = icons[((Common.Utils.applicationPixelRatio() > 1) ? 1 : 0) + (icons.length > 2 ? 2 : 0)];
                return {
                    'normal': url,
                    'hover': url,
                    'active': url
                };
            }
        },

        updatePluginIcons: function(model) {
            if (!model.get('visible'))
                return null;

            var modes = model.get('variations'),
                icons = modes[model.get('currentVariation')].get('icons');
            model.set('parsedIcons', this.parseIcons(icons));
            this.updatePluginButton(model);
        },

        updatePluginButton: function(model) {
            if (!model.get('visible'))
                return null;

            var btn = model.get('button');
            if (btn && btn.cmpEl) {
                btn.cmpEl.find(".inner-box-icon img").attr("src", model.get('baseUrl') + model.get('parsedIcons')[btn.isActive() ? 'active' : 'normal']);
            }
        },

        createPluginButton: function (model) {
            if (!model.get('visible'))
                return null;

            var me = this;

            var modes = model.get('variations'),
                guid = model.get('guid'),
                icons = modes[model.get('currentVariation')].get('icons'),
                parsedIcons = this.parseIcons(icons),
                icon_url = model.get('baseUrl') + parsedIcons['normal'];
            model.set('parsedIcons', parsedIcons);
            var _menu_items = [];
            _.each(model.get('variations'), function(variation, index) {
                if (variation.get('visible'))
                    _menu_items.push({
                        caption     : index > 0 ? variation.get('description') : me.textStart,
                        value       : parseInt(variation.get('index'))
                    });
            });

            var _set = Common.enumLock;
            var btn = new Common.UI.Button({
                cls: 'btn-toolbar x-huge icon-top',
                iconImg: icon_url,
                caption: model.get('name'),
                menu: _menu_items.length > 1,
                split: _menu_items.length > 1,
                value: guid,
                hint: model.get('name'),
                lock: model.get('isDisplayedInViewer') ? [_set.viewMode, _set.previewReviewMode, _set.viewFormMode, _set.selRangeEdit, _set.editFormula] : [_set.viewMode, _set.previewReviewMode, _set.viewFormMode, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.selRangeEdit, _set.editFormula ],
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'small'
            });

            if ( btn.split ) {
                btn.setMenu(
                    new Common.UI.Menu({
                        items: _menu_items,
                        pluginGuid: model.get('guid')
                    })
                );

                btn.menu.on('item:click', function(menu, item, e) {
                    me.fireEvent('plugin:select', [menu.options.pluginGuid, item.value]);
                });
            }

            btn.on('click', function(b, e) {
                me.fireEvent('plugin:select', [b.options.value, 0]);
            });

            model.set('button', btn);
            me.lockedControls.push(btn);
            return btn;
        },

        hide: function () {
            Common.UI.BaseView.prototype.hide.call(this,arguments);
            this.fireEvent('hide', this );
        },

        createPluginIdentifier: function (name) {
            var n = name.toLowerCase().replace(/\s/g, '-'),
                panelId = 'left-panel-plugins-' + name;
            var length = $('#' + panelId).length;
            if (length > 0) {
                n = n + '-' + length;
            }
            return n;
        },

        addNewPluginToLeftMenu: function (leftMenu, plugin, variation, lName) {
            if (!this.leftMenu) {
                this.leftMenu = leftMenu;
            }

            var pluginGuid = plugin.get_Guid(),
                name = this.createPluginIdentifier(plugin.get_Name('en')),
                panelId = 'left-panel-plugins-' + name,
                model = this.storePlugins.findWhere({guid: pluginGuid}),
                icon_url = model.get('baseUrl') + model.get('parsedIcons')['normal'];

            var leftMenuView = this.leftMenu.getView('LeftMenu');

            if (!leftMenuView.pluginSeparator.is(':visible')) {
                leftMenuView.pluginSeparator.show();
            }
            leftMenuView.pluginSeparator.after('<div id="slot-btn-plugins' + name + '"></div>');
            leftMenuView.$el.find('.left-panel').append('<div id="'+ panelId + '" class="" style="display: none; height: 100%;"></div>');
            var button = new Common.UI.Button({
                parentEl: leftMenuView.$el.find('#slot-btn-plugins' + name),
                cls: 'btn-category plugin-buttons',
                hint: lName,
                enableToggle: true,
                toggleGroup: 'leftMenuGroup',
                iconImg: icon_url,
                onlyIcon: true,
                value: pluginGuid
            });
            button.on('click', _.bind(this.onShowPlugin, this, pluginGuid));
            this.pluginBtns = Object.assign({[pluginGuid]: button}, this.pluginBtns);

            this.setMoreButton();

            return panelId;
        },

        setMoreButton: function () {
            if (Object.keys(this.pluginBtns).length === 0) return;
            var leftMenuView = this.leftMenu.getView('LeftMenu');

            var $more = leftMenuView.pluginMoreContainer,
                maxHeight = leftMenuView.$el.height(),
                buttons = leftMenuView.$el.find('.btn-category:visible:not(.plugin-buttons)'),
                btnHeight = $(buttons[0]).outerHeight() + parseFloat($(buttons[0]).css('margin-bottom')),
                height = parseFloat(leftMenuView.$el.find('.tool-menu-btns').css('padding-top')) +
                    buttons.length * btnHeight + 9, // 9 - separator
                arrMore = [],
                last, // last visible plugin button
                i = 0,
                length = Object.keys(this.pluginBtns).length;

            for (var key in this.pluginBtns) {
                height += btnHeight;
                if (height > maxHeight) {
                    last = $more.is(':visible') ? i : i - 1;
                    break;
                }
                i++;
            }

            if (last < length - 1) {
                i = 0;
                for (var key in this.pluginBtns) {
                    if (i >= last) {
                        arrMore.push({
                            value: key,
                            caption: this.pluginBtns[key].hint,
                            iconImg: this.pluginBtns[key].options.iconImg,
                            template: _.template([
                                '<a id="<%= id %>" class="menu-item">',
                                    '<img class="menu-item-icon" src="<%= options.iconImg %>">',
                                    '<%= caption %>',
                                '</a>'
                            ].join(''))
                        })
                        this.pluginBtns[key].cmpEl.hide();
                    } else {
                        this.pluginBtns[key].cmpEl.show();
                    }
                    i++;
                }

                if (arrMore.length > 0) {
                    if (!this.btnPluginMore) {
                        this.btnPluginMore = new Common.UI.Button({
                            parentEl: $more,
                            id: 'left-btn-plugins-more',
                            cls: 'btn-category',
                            iconCls: 'toolbar__icon btn-more',
                            onlyIcon: true,
                            hint: this.tipMore,
                            menu: new Common.UI.Menu({
                                cls: 'shifted-right',
                                menuAlign: 'tl-tr',
                                items: arrMore
                            })
                        });
                        this.btnPluginMore.menu.on('item:click', _.bind(this.onMenuShowPlugin, this));
                    } else {
                        this.btnPluginMore.menu.removeAll();
                        for (i = 0; i < arrMore.length; i++) {
                            this.btnPluginMore.menu.addItem(arrMore[i]);
                        }
                    }
                    $more.show();
                }
            } else {
                for (var key in this.pluginBtns) {
                    this.pluginBtns[key].cmpEl.show();
                }
                $more.hide();
            }
        },

        onMenuShowPlugin: function (menu, item) {
            var guid = item.value;
            this.pluginBtns[guid].toggle(!this.pluginBtns[guid].pressed);
            this.onShowPlugin(guid);
        },

        openPlugin: function (guid) {
            if (!this.pluginBtns[guid].isDisabled() && !this.pluginBtns[guid].pressed) {
                this.pluginBtns[guid].toggle(true);
                this.onShowPlugin(guid);
            }
        },

        onShowPlugin: function (guid) {
            var leftMenuView = this.leftMenu.getView('LeftMenu');
            if (!this.pluginBtns[guid].isDisabled()) {
                if (this.pluginBtns[guid].pressed) {
                    this.leftMenu.tryToShowLeftMenu();
                    for (var key in this.pluginPanels) {
                        this.pluginPanels[key].hide();
                    }
                    this.pluginPanels[guid].show();
                } else {
                    this.pluginPanels[guid].hide();
                    this.fireEvent('hide', this);
                }
                this.updateLeftPluginButton(guid);
                leftMenuView.onBtnMenuClick(this.pluginBtns[guid]);
            }
        },

        onClosePlugin: function (guid) {
            var leftMenuView = this.leftMenu.getView('LeftMenu');
            this.pluginBtns[guid].cmpEl.parent().remove();
            this.pluginPanels[guid].$el.remove();
            delete this.pluginBtns[guid];
            delete this.pluginPanels[guid];
            leftMenuView.close();

            if (Object.keys(this.pluginPanels).length === 0) {
                leftMenuView.pluginSeparator.hide();
            } else {
                this.setMoreButton();
            }
        },

        updateLeftPluginButton: function(guid) {
            var model = this.storePlugins.findWhere({guid: guid}),
                btn = this.pluginBtns[guid];
            if (btn && btn.cmpEl) {
                btn.cmpEl.find("img").attr("src", model.get('baseUrl') + model.get('parsedIcons')[btn.pressed ? 'active' : 'normal']);
            }
        },

        setDisabledLeftPluginButtons: function (disable) {
            if (Object.keys(this.pluginBtns).length > 0) {
                for (var key in this.pluginBtns) {
                    this.pluginBtns[key].setDisabled(disable);
                }
            }
            if (this.btnPluginMore) {
                this.btnPluginMore.setDisabled(disable);
            }
        },

        strPlugins: 'Plugins',
        textStart: 'Start',
        textStop: 'Stop',
        groupCaption: 'Plugins',
        tipMore: 'More'

    }, Common.Views.Plugins || {}));
});