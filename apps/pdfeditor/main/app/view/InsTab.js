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
 *  InsTab.js
 *
 *  Created on 12.03.2024
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout',
    'common/main/lib/component/DimensionPicker'
], function () {
    'use strict';

    PDFE.Views.InsTab = Common.UI.BaseView.extend(_.extend((function(){
        var template =
            '<section class="panel" data-tab="ins">' +
                '<div class="group">' +
                    '<span class="btn-slot text x-huge slot-inspage"></span>' +
                '</div>' +
                '<div class="group" style="display:none;"></div>' +
                '<div class="separator long"></div>' +
                '<div class="group">' +
                    '<span class="btn-slot text x-huge" id="slot-btn-inserttable"></span>' +
                '</div>' +
                '<div class="separator long"></div>' +
                '<div class="group">' +
                    '<span class="btn-slot text x-huge slot-instext"></span>' +
                    '<span class="btn-slot text x-huge" id="slot-btn-instextart"></span>' +
                    '<span class="btn-slot text x-huge slot-insertimg"></span>' +
                    // '<span class="btn-slot text x-huge" id="slot-btn-insertchart"></span>' +
                    // '<span class="btn-slot text x-huge" id="slot-btn-inssmartart"></span>' +
                '</div>' +
                '<div class="separator long invisible"></div>' +
                '<div class="group small" id="slot-combo-insertshape"></div>' +
                '<div class="separator long"></div>' +
                '<div class="group">' +
                    '<span class="btn-slot text x-huge" id="slot-btn-insertlink"></span>' +
                '</div>' +
                '<div class="separator long"></div>' +
                // '<div class="group">' +
                //     '<span class="btn-slot text x-huge" id="slot-btn-editheader"></span>' +
                //     '<span class="btn-slot text x-huge" id="slot-btn-datetime"></span>' +
                //     '<span class="btn-slot text x-huge" id="slot-btn-slidenum"></span>' +
                // '</div>' +
                // '<div class="separator long"></div>' +
                '<div class="group">' +
                    '<span class="btn-slot text x-huge" id="slot-btn-insertequation"></span>' +
                    '<span class="btn-slot text x-huge" id="slot-btn-inssymbol"></span>' +
                '</div>' +
            '</section>';

        return {
            options: {},

            setEvents: function () {
                var me = this;

                // me.btnEditHeader.on('click', _.bind(function () {
                //     me.fireEvent('insert:header', ['header']);
                // }, me));
                // me.btnInsDateTime.on('click', _.bind(function () {
                //     me.fireEvent('insert:header', ['datetime']);
                // }, me));
                // me.btnInsSlideNum.on('click', _.bind(function () {
                //     me.fireEvent('insert:header', ['slidenum']);
                // }, me));
                me.btnInsertHyperlink.on('click', _.bind(function () {
                    me.fireEvent('insert:hyperlink');
                }, me));
                 me.mnuTablePicker.on('select', _.bind(function (picker, columns, rows, e) {
                    me.fireEvent('insert:table', ['picker', columns, rows]);
                }, me));
                me.btnInsertTable.menu.on('item:click', function (menu, item, e) {
                    me.fireEvent('insert:table', [item.value]);
                });
                me.btnInsertEquation.on('click', _.bind(function () {
                    me.fireEvent('insert:equation');
                }, me));
                me.btnInsertSymbol.menu.items[2].on('click', _.bind(function () {
                    me.fireEvent('insert:symbol');
                }, this));
                me.mnuInsertSymbolsPicker.on('item:click',_.bind(function (picker, item, record, e) {
                    me.fireEvent('insert:symbol', [record]);
                }, this));
            },

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this);
                this.toolbar = options.toolbar;
                this.appConfig = options.mode;

                this.lockedControls = [];

                var me = this;
                var _set = Common.enumLock;

                me.btnInsertTable = new Common.UI.Button({
                    id: 'tlbtn-inserttable',
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-inserttable',
                    caption: me.capInsertTable,
                    lock: [_set.lostConnect, _set.disableOnStart],
                    menu: new Common.UI.Menu({
                        cls: 'shifted-left',
                        items: [
                            {template: _.template('<div id="id-toolbar-menu-tablepicker" class="dimension-picker" style="margin: 5px 10px;"></div>')},
                            {caption: me.mniCustomTable, value: 'custom'},
                            // {caption: me.mniInsertSSE, value: 'sse'}
                        ]
                    }),
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                me.lockedControls.push(me.btnInsertTable);
/*
                me.btnInsertChart = new Common.UI.Button({
                    id: 'tlbtn-insertchart',
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-insertchart',
                    caption: me.capInsertChart,
                    lock: [_set.lostConnect, _set.disableOnStart],
                    menu: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                me.lockedControls.push(me.btnInsertChart);

                this.btnInsertSmartArt = new Common.UI.Button({
                    id: 'tlbtn-insertsmartart',
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-smart-art',
                    lock: [_set.lostConnect, _set.disableOnStart],
                    caption: me.capBtnInsSmartArt,
                    menu: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                me.lockedControls.push(this.btnInsertSmartArt);
*/
                me.btnInsertEquation = new Common.UI.Button({
                    id: 'tlbtn-insertequation',
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-insertequation',
                    caption: me.capInsertEquation,
                    lock: [_set.paragraphLock, _set.lostConnect, _set.disableOnStart],
                    split: true,
                    menu: new Common.UI.Menu({cls: 'menu-shapes'}),
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                me.lockedControls.push(this.btnInsertEquation);

                me.btnInsertSymbol = new Common.UI.Button({
                    id: 'tlbtn-insertsymbol',
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-symbol',
                    caption: me.capBtnInsSymbol,
                    lock: [_set.paragraphLock, _set.lostConnect, _set.noParagraphSelected],
                    menu: new Common.UI.Menu({
                        style: 'min-width: 100px;',
                        items: [
                            {template: _.template('<div id="id-toolbar-menu-symbols"></div>')},
                            {caption: '--'},
                            new Common.UI.MenuItem({
                                caption: this.textMoreSymbols
                            })
                        ]
                    }),
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                me.lockedControls.push(me.btnInsertSymbol);

                me.btnInsertHyperlink = new Common.UI.Button({
                    id: 'tlbtn-insertlink',
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-big-inserthyperlink',
                    caption: me.capInsertHyperlink,
                    lock: [_set.hyperlinkLock, _set.paragraphLock, _set.lostConnect, _set.noParagraphSelected],
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                me.lockedControls.push(me.btnInsertHyperlink);

                me.btnInsertTextArt = new Common.UI.Button({
                    id: 'tlbtn-inserttextart',
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-textart',
                    caption: me.capInsertTextArt,
                    lock: [_set.lostConnect, _set.disableOnStart],
                    menu: new Common.UI.Menu({
                        cls: 'menu-shapes',
                        items: [
                            {template: _.template('<div id="view-insert-art" class="margin-left-5" style="width: 239px;"></div>')}
                        ]
                    }),
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                me.lockedControls.push(me.btnInsertTextArt);
/*
                me.btnEditHeader = new Common.UI.Button({
                    id: 'id-toolbar-btn-editheader',
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-editheader',
                    caption: me.capBtnInsHeaderFooter,
                    lock: [_set.lostConnect, _set.disableOnStart],
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                me.lockedControls.push(me.btnEditHeader);

                me.btnInsDateTime = new Common.UI.Button({
                    id: 'id-toolbar-btn-datetime',
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-datetime',
                    caption: me.capBtnDateTime,
                    lock: [_set.lostConnect, _set.paragraphLock, _set.disableOnStart],
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                me.lockedControls.push(me.btnInsDateTime);

                me.btnInsSlideNum = new Common.UI.Button({
                    id: 'id-toolbar-btn-slidenum',
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-pagenum',
                    caption: me.capBtnSlideNum,
                    lock: [_set.lostConnect, _set.paragraphLock, _set.disableOnStart],
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                me.lockedControls.push(me.btnInsSlideNum);
*/
                me.btnInsertShape = new Common.UI.Button({
                    id: 'tlbtn-insertshape',
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-insertshape',
                    caption: me.capInsertShape,
                    lock: [_set.lostConnect, _set.disableOnStart],
                    menu: true,
                    enableToggle: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                me.lockedControls.push(me.btnInsertShape);

                me.cmbInsertShape = new Common.UI.ComboDataViewShape({
                    cls: 'combo-styles shapes',
                    itemWidth: 20,
                    itemHeight: 20,
                    menuMaxHeight: 652,
                    menuWidth: 330,
                    style: 'width: 140px;',
                    enableKeyEvents: true,
                    lock: [_set.lostConnect, _set.disableOnStart],
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: '-16, 0'
                });
                me.lockedControls.push(me.cmbInsertShape);

                Common.Utils.lockControls(_set.disableOnStart, true, {array: this.lockedControls});
            },

            render: function (el) {
                if ( el ) el.html( this.getPanel() );

                return this;
            },

            getPanel: function () {
                this.$el = $(_.template(template)( {} ));
                var $host = this.$el;
                var _injectComponent = function (id, cmp) {
                    Common.Utils.injectComponent($host.find(id), cmp);
                };
                // _injectComponent('#slot-btn-inssmartart', this.btnInsertSmartArt);
                _injectComponent('#slot-btn-insertequation', this.btnInsertEquation);
                _injectComponent('#slot-btn-inssymbol', this.btnInsertSymbol);
                _injectComponent('#slot-btn-insertlink', this.btnInsertHyperlink);
                _injectComponent('#slot-btn-inserttable', this.btnInsertTable);
                // _injectComponent('#slot-btn-insertchart', this.btnInsertChart);
                _injectComponent('#slot-btn-instextart', this.btnInsertTextArt);
                // _injectComponent('#slot-btn-editheader', this.btnEditHeader);
                // _injectComponent('#slot-btn-datetime', this.btnInsDateTime);
                // _injectComponent('#slot-btn-slidenum', this.btnInsSlideNum);
                _injectComponent('#slot-combo-insertshape', this.cmbInsertShape);

                if (this.toolbar && this.toolbar.$el) {
                    this.btnsInsertImage = Common.Utils.injectButtons($host.find('.slot-insertimg').add(this.toolbar.$el.find('.slot-insertimg')), 'tlbtn-insertimage-', 'toolbar__icon btn-insertimage', this.capInsertImage,
                        [Common.enumLock.lostConnect, Common.enumLock.disableOnStart], false, true, undefined, '1', 'bottom', 'small');
                    this.btnsInsertText = Common.Utils.injectButtons($host.find('.slot-instext').add(this.toolbar.$el.find('.slot-instext')), 'tlbtn-inserttext-', 'toolbar__icon btn-big-text', this.capInsertText,
                        [Common.enumLock.lostConnect, Common.enumLock.disableOnStart], true, false, true, '1', 'bottom', 'small');
                    this.btnsInsertShape = Common.Utils.injectButtons($host.find('.slot-insertshape').add(this.toolbar.$el.find('.slot-insertshape')), 'tlbtn-insertshape-', 'toolbar__icon btn-insertshape', this.capInsertShape,
                        [Common.enumLock.lostConnect, Common.enumLock.disableOnStart], false, true, true, '1', 'bottom', 'small');
                    this.btnsAddPage = Common.Utils.injectButtons($host.find('.slot-inspage').add(this.toolbar.$el.find('.slot-inspage')), 'tlbtn-insertpage-', 'toolbar__icon btn-blankpage', this.capInsPage,
                        [Common.enumLock.lostConnect, Common.enumLock.disableOnStart], true, true, false, '1', 'bottom', 'small');
                }

                var created = this.btnsInsertImage.concat(this.btnsInsertText, this.btnsInsertShape, this.btnsAddPage);
                Common.Utils.lockControls(Common.enumLock.disableOnStart, true, {array: created});
                Array.prototype.push.apply(this.lockedControls, created);

                return this.$el;
            },

            onAppReady: function (config) {
                var me = this;
                me.btnsInsertImage.forEach(function (btn) {
                    btn.updateHint(me.tipInsertImage);
                    btn.setMenu(
                        new Common.UI.Menu({
                            items: [
                                {caption: me.mniImageFromFile, value: 'file'},
                                {caption: me.mniImageFromUrl, value: 'url'},
                                {caption: me.mniImageFromStorage, value: 'storage'}
                            ]
                        }).on('item:click', function (menu, item, e) {
                            me.fireEvent('insert:image', [item.value]);
                        })
                    );
                    btn.menu.items[2].setVisible(config.canRequestInsertImage || config.fileChoiceUrl && config.fileChoiceUrl.indexOf("{documentType}")>-1);
                });

                me.btnsInsertText.forEach(function (button) {
                    button.updateHint([me.tipInsertHorizontalText, me.tipInsertText]);
                    button.options.textboxType = 'textRect';
                    button.setMenu(new Common.UI.Menu({
                        items: [
                            {
                                caption: me.tipInsertHorizontalText,
                                checkable: true,
                                checkmark: false,
                                iconCls     : 'menu__icon btn-text',
                                toggleGroup: 'textbox',
                                value: 'textRect',
                                iconClsForMainBtn: 'btn-big-text'
                            },
                            {
                                caption: me.tipInsertVerticalText,
                                checkable: true,
                                checkmark: false,
                                iconCls     : 'menu__icon btn-text-vertical',
                                toggleGroup: 'textbox',
                                value: 'textRectVertical',
                                iconClsForMainBtn: 'btn-big-text-vertical'
                            },
                        ]
                    }));
                    button.on('click', function (btn, e) {
                        me.fireEvent('insert:text-btn', [btn, e]);
                    });
                    button.menu.on('item:click', function(btn, e) {
                        button.toggle(true);
                        me.fireEvent('insert:text-menu', [button, e]);
                    });
                });

                me.btnsInsertShape.forEach(function (btn) {
                    btn.updateHint(me.tipInsertShape);
                    btn.setMenu(
                        new Common.UI.Menu({
                            cls: 'menu-shapes menu-insert-shape'
                        }).on('hide:after', function (e) {
                            me.fireEvent('insert:shape', ['menu:hide']);
                        })
                    );
                });

                me.btnsAddPage.forEach(function (btn) {
                    btn.updateHint([me.tipInsertPageAfter, me.tipInsertPage]);
                    btn.setMenu(
                        new Common.UI.Menu({
                            items: [
                                {caption: me.txtNewPageBefore, value: true},
                                {caption: me.txtNewPageAfter, value: false}
                            ]
                        }).on('item:click', function (menu, item, e) {
                            me.fireEvent('insert:page', [item.value]);
                        })
                    );
                    btn.on('click', function (btn, e) {
                        me.fireEvent('insert:page');
                    });
                    if (btn.cmpEl.closest('[data-tab=ins]').length>0)
                        btn.setCaption(me.capBlankPage);
                });

                this.btnInsertTable.updateHint(this.tipInsertTable);
                // this.btnInsertChart.updateHint(this.tipInsertChart);
                // this.btnInsertSmartArt.updateHint(this.tipInsertSmartArt);
                this.btnInsertEquation.updateHint(this.tipInsertEquation);
                this.btnInsertSymbol.updateHint(this.tipInsertSymbol);
                this.btnInsertHyperlink.updateHint(this.tipInsertHyperlink + Common.Utils.String.platformKey('Ctrl+K'));
                this.btnInsertTextArt.updateHint(this.tipInsertTextArt);
                // this.btnEditHeader.updateHint(this.tipEditHeaderFooter);
                // this.btnInsDateTime.updateHint(this.tipDateTime);
                // this.btnInsSlideNum.updateHint(this.tipPageNum);
/*
                this.btnInsertChart.setMenu( new Common.UI.Menu({
                    style: 'width: 364px;padding-top: 12px;',
                    items: [
                        {template: _.template('<div id="id-toolbar-menu-insertchart" class="menu-insertchart"></div>')}
                    ]
                }));

                var onShowBefore = function(menu) {
                    var picker = new Common.UI.DataView({
                        el: $('#id-toolbar-menu-insertchart'),
                        parentMenu: menu,
                        showLast: false,
                        restoreHeight: 535,
                        groups: new Common.UI.DataViewGroupStore(Common.define.chartData.getChartGroupData()),
                        store: new Common.UI.DataViewStore(Common.define.chartData.getChartData()),
                        itemTemplate: _.template('<div id="<%= id %>" class="item-chartlist"><svg width="40" height="40" class=\"icon uni-scale\"><use xlink:href=\"#chart-<%= iconCls %>\"></use></svg></div>')
                    });
                    picker.on('item:click', function (picker, item, record, e) {
                        if (record)
                            me.fireEvent('insert:chart', [record.get('type')]);
                    });
                    menu.off('show:before', onShowBefore);
                };
                this.btnInsertChart.menu.on('show:before', onShowBefore);

                this.btnInsertSmartArt.setMenu(new Common.UI.Menu({
                    cls: 'shifted-right',
                    items: []
                }));

                var onShowBeforeSmartArt = function (menu) { // + <% if(typeof imageUrl === "undefined" || imageUrl===null || imageUrl==="") { %> style="visibility: hidden;" <% } %>/>',
                    var smartArtData = Common.define.smartArt.getSmartArtData();
                    smartArtData.forEach(function (item, index) {
                        var length = item.items.length,
                            width = 399;
                        if (length < 5) {
                            width = length * (70 + 8) + 9; // 4px margin + 4px margin
                        }
                        me.btnInsertSmartArt.menu.addItem({
                            caption: item.caption,
                            value: item.sectionId,
                            itemId: item.id,
                            itemsLength: length,
                            iconCls: item.icon ? 'menu__icon ' + item.icon : undefined,
                            menu: new Common.UI.Menu({
                                items: [
                                    {template: _.template('<div id="' + item.id + '" class="menu-add-smart-art margin-left-5" style="width: ' + width + 'px; height: 500px;"></div>')}
                                ],
                                menuAlign: 'tl-tr',
                            })});
                    });
                    me.btnInsertSmartArt.menu.items.forEach(function (item, index) {
                        var items = [];
                        for (var i=0; i<item.options.itemsLength; i++) {
                            items.push({
                                isLoading: true
                            });
                        }
                        item.menuPicker = new Common.UI.DataView({
                            el: $('#' + item.options.itemId),
                            parentMenu: me.btnInsertSmartArt.menu.items[index].menu,
                            itemTemplate: _.template([
                                '<% if (isLoading) { %>',
                                '<div class="loading-item" style="width: 70px; height: 70px;">',
                                '<i class="loading-spinner"></i>',
                                '</div>',
                                '<% } else { %>',
                                '<div>',
                                '<img src="<%= imageUrl %>" width="' + 70 + '" height="' + 70 + '" />',
                                '</div>',
                                '<% } %>'
                            ].join('')),
                            store: new Common.UI.DataViewStore(items),
                            delayRenderTips: true,
                            scrollAlwaysVisible: true,
                            showLast: false
                        });
                        item.menuPicker.on('item:click', function(picker, item, record, e) {
                            if (record && record.get('value') !== null) {
                                me.fireEvent('insert:smartart', [record.get('value')]);
                            }
                            Common.NotificationCenter.trigger('edit:complete', me);
                        });
                        item.menuPicker.loaded = false;
                        item.$el.on('mouseenter', function () {
                            if (!item.menuPicker.loaded) {
                                me.fireEvent('smartart:mouseenter', [item.value]);
                            }
                        });
                        item.$el.on('mouseleave', function () {
                            me.fireEvent('smartart:mouseleave', [item.value]);
                        });
                    });
                    menu.off('show:before', onShowBeforeSmartArt);
                };
                this.btnInsertSmartArt.menu.on('show:before', onShowBeforeSmartArt);
*/
                var onShowBeforeTextArt = function (menu) {
                    var collection = PDFE.getCollection('Common.Collections.TextArt');
                    if (collection.length<1)
                        PDFE.getController('Main').fillTextArt(null, true);
                    var picker = new Common.UI.DataView({
                        el: $('#view-insert-art', menu.$el),
                        store: collection,
                        parentMenu: menu,
                        showLast: false,
                        itemTemplate: _.template('<div class="item-art"><img src="<%= imageUrl %>" id="<%= id %>" style="width:50px;height:50px;"></div>')
                    });
                    picker.on('item:click', function (picker, item, record, e) {
                        if (record)
                            me.fireEvent('insert:textart', [record.get('data')]);
                        if (e.type !== 'click') menu.hide();
                    });
                    menu.off('show:before', onShowBeforeTextArt);
                };
                this.btnInsertTextArt.menu.on('show:before', onShowBeforeTextArt);

                // set dataviews
                this.specSymbols = [
                    {symbol: 8226,     description: this.textBullet},
                    {symbol: 8364,     description: this.textEuro},
                    {symbol: 65284,    description: this.textDollar},
                    {symbol: 165,      description: this.textYen},
                    {symbol: 169,      description: this.textCopyright},
                    {symbol: 174,      description: this.textRegistered},
                    {symbol: 189,      description: this.textOneHalf},
                    {symbol: 188,      description: this.textOneQuarter},
                    {symbol: 8800,     description: this.textNotEqualTo},
                    {symbol: 177,      description: this.textPlusMinus},
                    {symbol: 247,      description: this.textDivision},
                    {symbol: 8730,     description: this.textSquareRoot},
                    {symbol: 8804,     description: this.textLessEqual},
                    {symbol: 8805,     description: this.textGreaterEqual},
                    {symbol: 8482,     description: this.textTradeMark},
                    {symbol: 8734,     description: this.textInfinity},
                    {symbol: 126,      description: this.textTilde},
                    {symbol: 176,      description: this.textDegree},
                    {symbol: 167,      description: this.textSection},
                    {symbol: 945,      description: this.textAlpha},
                    {symbol: 946,      description: this.textBetta},
                    {symbol: 960,      description: this.textLetterPi},
                    {symbol: 916,      description: this.textDelta},
                    {symbol: 9786,     description: this.textSmile},
                    {symbol: 9829,     description: this.textBlackHeart}
                ];
                this.mnuInsertSymbolsPicker = new Common.UI.DataView({
                    el: $('#id-toolbar-menu-symbols'),
                    parentMenu: this.btnInsertSymbol.menu,
                    outerMenu: {menu: this.btnInsertSymbol.menu, index:0},
                    restoreHeight: 290,
                    delayRenderTips: true,
                    scrollAlwaysVisible: true,
                    store: new Common.UI.DataViewStore(this.loadRecentSymbolsFromStorage()),
                    itemTemplate: _.template('<div class="item-symbol" dir="ltr" <% if (typeof font !== "undefined" && font !=="") { %> style ="font-family: <%= font %>"<% } %>>&#<%= symbol %></div>')
                });
                this.btnInsertSymbol.menu.setInnerMenu([{menu: this.mnuInsertSymbolsPicker, index: 0}]);
                this.btnInsertSymbol.menu.on('show:before',  _.bind(function() {
                    this.mnuInsertSymbolsPicker.deselectAll();
                }, this));

                this.mnuTablePicker = new Common.UI.DimensionPicker({
                    el: $('#id-toolbar-menu-tablepicker'),
                    minRows: 8,
                    minColumns: 10,
                    maxRows: 8,
                    maxColumns: 10
                });

            },

            show: function () {
                Common.UI.BaseView.prototype.show.call(this);
                this.fireEvent('show', this);
            },

            getButtons: function(type) {
                if (type===undefined)
                    return this.lockedControls;
                return [];
            },

            SetDisabled: function (state) {
                this.lockedControls && this.lockedControls.forEach(function(button) {
                    if ( button ) {
                        button.setDisabled(state);
                    }
                }, this);
            },

            loadRecentSymbolsFromStorage: function(){
                var recents = Common.localStorage.getItem('pdfe-fastRecentSymbols');
                var arr = (!!recents) ? JSON.parse(recents) :
                    [
                        { symbol: 8226,     font: 'Arial'},
                        { symbol: 8364,     font: 'Arial'},
                        { symbol: 65284,    font: 'Arial'},
                        { symbol: 165,      font: 'Arial'},
                        { symbol: 169,      font: 'Arial'},
                        { symbol: 174,      font: 'Arial'},
                        { symbol: 189,      font: 'Arial'},
                        { symbol: 188,      font: 'Arial'},
                        { symbol: 8800,     font: 'Arial'},
                        { symbol: 177,      font: 'Arial'},
                        { symbol: 247,      font: 'Arial'},
                        { symbol: 8730,     font: 'Arial'},
                        { symbol: 8804,     font: 'Arial'},
                        { symbol: 8805,     font: 'Arial'},
                        { symbol: 8482,     font: 'Arial'},
                        { symbol: 8734,     font: 'Arial'},
                        { symbol: 126,      font: 'Arial'},
                        { symbol: 176,      font: 'Arial'},
                        { symbol: 167,      font: 'Arial'},
                        { symbol: 945,      font: 'Arial'},
                        { symbol: 946,      font: 'Arial'},
                        { symbol: 960,      font: 'Arial'},
                        { symbol: 916,      font: 'Arial'},
                        { symbol: 9786,     font: 'Arial'},
                        { symbol: 9829,     font: 'Arial'}
                    ];
                arr.forEach(function (item){
                    item.tip = this.getSymbolDescription(item.symbol);
                }.bind(this));
                return arr;
            },

            saveSymbol: function(symbol, font) {
                var maxLength =25,
                    picker = this.mnuInsertSymbolsPicker;
                var item = picker.store.find(function(item){
                    return item.get('symbol') == symbol && item.get('font') == font
                });

                item && picker.store.remove(item);
                picker.store.add({symbol: symbol, font: font, tip: this.getSymbolDescription(symbol)},{at:0});
                picker.store.length > maxLength && picker.store.remove(picker.store.last());

                var arr = picker.store.map(function (item){
                    return {symbol: item.get('symbol'), font: item.get('font')};
                });
                var sJSON = JSON.stringify(arr);
                Common.localStorage.setItem( 'pdfe-fastRecentSymbols', sJSON);
            },

            getSymbolDescription: function(symbol){
                var  specSymbol = this.specSymbols.find(function (item){return item.symbol == symbol});
                return !!specSymbol ? specSymbol.description : this.capBtnInsSymbol + ': ' + symbol;
            },

            onComboOpen: function (needfocus, combo, e, params) {
                if (params && params.fromKeyDown) return;
                _.delay(function() {
                    var input = $('input', combo.cmpEl).select();
                    if (needfocus) input.focus();
                    else if (!combo.isMenuOpen()) input.one('mouseup', function (e) { e.preventDefault(); });
                }, 10);
            },

            updateComboAutoshapeMenu: function (collection) {
                var me = this,
                    recents = Common.localStorage.getItem('pdfe-recent-shapes');
                recents = recents ? JSON.parse(recents) : null;
                me.cmbInsertShape.setMenuPicker(collection, recents, me.textRecentlyUsed);
            },

            updateAutoshapeMenu: function (menuShape, collection) {
                var me = this,
                    index = $(menuShape.el).prop('id').slice(-1);

                var menuitem = new Common.UI.MenuItem({
                    template: _.template('<div id="id-toolbar-menu-insertshape-<%= options.index %>" class="menu-insertshape"></div>'),
                    index: index
                });
                menuShape.addItem(menuitem);

                var recents = Common.localStorage.getItem('pdfe-recent-shapes');
                recents = recents ? JSON.parse(recents) : null;

                var shapePicker = new Common.UI.DataViewShape({
                    el: $('#id-toolbar-menu-insertshape-'+index),
                    itemTemplate: _.template('<div class="item-shape" id="<%= id %>"><svg width="20" height="20" class=\"icon uni-scale\"><use xlink:href=\"#svg-icon-<%= data.shapeType %>\"></use></svg></div>'),
                    groups: collection,
                    parentMenu: menuShape,
                    restoreHeight: 652,
                    textRecentlyUsed: me.textRecentlyUsed,
                    recentShapes: recents
                });
                shapePicker.on('item:click', function(picker, item, record, e) {
                    if (e.type !== 'click') Common.UI.Menu.Manager.hideAll();
                    if (record) {
                        me.fireEvent('insert:shape', [record.get('data').shapeType]);
                        me.cmbInsertShape.updateComboView(record);
                    }
                });

            }
        }
    }()), PDFE.Views.InsTab || {}));
});