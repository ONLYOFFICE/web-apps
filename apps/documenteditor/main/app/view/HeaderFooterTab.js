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
 *  HeaderFooterTab.js
 *
 *  Created on 10.21.2025
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout'
], function () {
    'use strict';

    DE.Views.HeaderFooterTab = Common.UI.BaseView.extend(_.extend((function(){
        var template =
        '<section class="panel" data-tab="headerfooter" role="tabpanel" aria-labelledby="headerfooter">' +
            '<div class="group small">' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-btn-header"></span>' +
                '</div>' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-btn-footer"></span>' +
                '</div>' +
            '</div>' +
            '<div class="separator long"></div>' +
            '<div class="group">' +
                '<span class="btn-slot text x-huge" id="slot-btn-ins-page-numb"></span>' +
                '<span class="btn-slot text x-huge" id="slot-btn-numb-of-pages"></span>' +
            '</div>' +
            '<div class="separator long"></div>' +
            '<div class="group small">' +
                '<div class="elset" style="display: flex; align-items: baseline;">' +
                    '<span class="btn-slot text font-size-normal margin-right-6" id="slot-lbl-header-top" style="flex-grow:1;"></span>' +
                    '<span id="slot-spin-header-top" class="btn-slot text spinner"></span>' +
                '</div>' +
                '<div class="elset" style="display: flex; align-items: baseline;">' +
                    '<span class="btn-slot text font-size-normal margin-right-6" id="slot-lbl-footer-bot" style="flex-grow:1;"></span>' +
                    '<span id="slot-spin-footer-bot" class="btn-slot text spinner"></span>' +
                '</div>' +
            '</div>' +
            '<div class="separator long"></div>' +
            '<div class="group small">' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-diff-odd-even"></span>' +
                '</div>' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-diff-first"></span>' +
                '</div>' +
            '</div>' +
            '<div class="group small">' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-sameas"></span>' +
                '</div>' +
                '<div class="elset"></div>' +
            '</div>' +
        '</section>';

        return {
            options: {},

            setEvents: function () {
                var me = this;

                this.btnHeader.menu.on('item:click', function(menu, item, e) {
                    me.fireEvent('header:editremove', [item]);
                });
                this.btnFooter.menu.on('item:click', function(menu, item, e) {
                    me.fireEvent('footer:editremove', [item]);
                });
                this.btnNumbOfPages.on('click', function(menu, item, e) {
                    me.fireEvent('headerfooter:pagecount', [item]);
                });
                this.mnuPageNumberPosPicker.on('item:click', function(picker, item, record, e) {
                    me.fireEvent('headerfooter:pospick', [picker, item, record, e]);
                });
                this.btnInsPageNumber.menu.on('item:click', function (menu, item, e) {
                    me.fireEvent('headerfooter:inspagenumber', [item]);
                });
                this.numHeaderPosition.on('change', function(field){
                    me.fireEvent('headerfooter:headerfooterpos', [field, true]);}
                );
                this.numFooterPosition.on('change', function(field){
                    me.fireEvent('headerfooter:headerfooterpos', [field, false]);}
                );
                this.chDiffFirst.on('change', function(field, newValue, oldValue, eOpts){
                    me.fireEvent('headerfooter:difffirst', [field]);}
                );
                this.chDiffOddEven.on('change', function(field, newValue, oldValue, eOpts){
                    me.fireEvent('headerfooter:diffoddeven', [field]);}
                );
                this.chSameAs.on('change', function(field, newValue, oldValue, eOpts){
                    me.fireEvent('headerfooter:sameas', [field]);}
                );
            },

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this);
                this.toolbar = options.toolbar;
                this.appConfig = options.mode;

                this.lockedControls = [];

                var me = this;
                var _set = Common.enumLock;

                this.btnHeader = new Common.UI.Button({
                    cls: 'btn-toolbar align-left',
                    iconCls: 'toolbar__icon btn-ic-zoomtopage',
                    lock: [_set.lostConnect, _set.disableOnStart],
                    caption: 'Header',
                    menu: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small',
                });
                this.lockedControls.push(this.btnHeader);

                this.btnFooter = new Common.UI.Button({
                    cls: 'btn-toolbar align-left',
                    iconCls: 'toolbar__icon btn-ic-zoomtowidth',
                    lock: [_set.lostConnect, _set.disableOnStart],
                    caption: 'Footer',
                    menu: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small',
                });
                this.lockedControls.push(this.btnFooter);

                this.btnInsPageNumber = new Common.UI.Button({
                    id: 'tlbtn-insertchart',
                    cls: 'btn-toolbar x-huge icon-top',
                    caption: 'Page Number',
                    iconCls: 'toolbar__icon btn-insertchart',
                    lock: [_set.lostConnect, _set.disableOnStart],
                    menu: true,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnInsPageNumber);

                this.btnNumbOfPages = new Common.UI.Button({
                    id: 'tlbtn-insertchart',
                    cls: 'btn-toolbar x-huge icon-top',
                    caption: 'Number Of Pages',
                    iconCls: 'toolbar__icon btn-text-from-file',
                    lock: [_set.lostConnect, _set.disableOnStart, _set.paragraphLock, _set.headerLock, _set.richEditLock, _set.plainEditLock],
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnNumbOfPages);

                this.lblHeaderTop = new Common.UI.Label({
                    caption: 'Header from top',
                    lock: [_set.paragraphLock,]
                });
                this.lockedControls.push(this.lblHeaderTop);

                this.lblFooterBottom = new Common.UI.Label({
                    caption: 'Footer from bottom',
                    lock: [_set.paragraphLock,]
                });
                this.lockedControls.push(this.lblFooterBottom);

                this.numHeaderPosition = new Common.UI.MetricSpinner({
                    step: .1,
                    width: 85,
                    value: '1.25 cm',
                    defaultUnit : "cm",
                    defaultValue : 0,
                    maxValue: 55.88,
                    minValue: 0,
                    lock: [_set.headerLock, _set.richEditLock],
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big',
                });
                this.lockedControls.push(this.numHeaderPosition);

                this.numHeaderPosition.on('inputleave', function(){ me.fireEvent('editcomplete', me);});

                this.numFooterPosition = new Common.UI.MetricSpinner({
                    step: .1,
                    width: 85,
                    value: '1.25 cm',
                    defaultUnit : "cm",
                    maxValue: 55.88,
                    minValue: 0,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big',
                });
                this.lockedControls.push(this.numFooterPosition);

                this.chDiffFirst = new Common.UI.CheckBox({
                    labelText: 'Different first page',
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chDiffFirst);

                this.chDiffOddEven = new Common.UI.CheckBox({
                    labelText: 'Different odd and even pages',
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chDiffOddEven);

                this.chSameAs = new Common.UI.CheckBox({
                    labelText: 'Link to previous',
                    dataHint: '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chSameAs);

                Common.Utils.lockControls(_set.disableOnStart, true, {array: this.lockedControls});
                Common.UI.LayoutManager.addControls(this.lockedControls);
                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            },

            render: function (el) {
                if ( el ) el.html( this.getPanel() );

                return this;
            },

            getPanel: function () {
                this.$el = $(_.template(template)( {} ));
                var $host = this.$el;

                var _injectComponent = function (id, cmp) {
                    Common.Utils.injectComponent($host.findById(id), cmp);
                };

                _injectComponent('#slot-spin-header-top', this.numHeaderPosition);
                _injectComponent('#slot-spin-footer-bot', this.numFooterPosition);
                this.btnHeader && this.btnHeader.render($host.find('#slot-btn-header'));
                this.btnFooter && this.btnFooter.render($host.find('#slot-btn-footer'));
                this.btnInsPageNumber && this.btnInsPageNumber.render($host.find('#slot-btn-ins-page-numb'));
                this.btnNumbOfPages && this.btnNumbOfPages.render($host.find('#slot-btn-numb-of-pages'));
                this.lblHeaderTop && this.lblHeaderTop.render($host.find('#slot-lbl-header-top'));
                this.lblFooterBottom && this.lblFooterBottom.render($host.find('#slot-lbl-footer-bot'));
                this.chDiffFirst && this.chDiffFirst.render($host.find('#slot-chk-diff-first'));
                this.chDiffOddEven && this.chDiffOddEven.render($host.find('#slot-chk-diff-odd-even'));
                this.chSameAs && this.chSameAs.render($host.find('#slot-chk-sameas'));
                // this.numHeaderPosition && this.numHeaderPosition.render($host.find('#slot-spin-header-top'));
                // this.numFooterPosition && this.numFooterPosition.render($host.find('#slot-spin-footer-bot'));
                // var created = this.btnsFitToPage.concat(this.btnsFitToWidth).concat(this.cmbsZoom);
                return this.$el;
            },

            onAppReady: function (config) {
                var me = this;

                this.btnHeader.setMenu(
                    new Common.UI.Menu({
                    items: [
                        {caption: 'Edit header', value: 'edit'},
                        {caption: 'Remove header', value: 'remove'},
                    ]})
                );

                this.btnFooter.setMenu(
                    new Common.UI.Menu({
                    items: [
                        {caption: 'Edit footer', value: 'edit'},
                        {caption: 'Remove footer', value: 'remove'},
                    ]})
                );

                this.btnInsPageNumber.setMenu(
                    new Common.UI.Menu({
                        style: 'min-width: 90px;',
                        items: [
                            {template: _.template('<div id="id-toolbar-menu-pageposition" class="menu-pageposition"></div>')},
                            this.mnuPageNumCurrentPos = new Common.UI.MenuItem({
                                caption: 'To current position',
                                // lock: this.mnuPageNumCurrentPos.options.lock,
                                // disabled: this.mnuPageNumCurrentPos.isDisabled(),
                                value: 'current'
                            }),
                            {caption: '--'},
                            this.mnuPageNumCurrentPos = new Common.UI.MenuItem({
                                caption: 'Format Page Numbers',
                                value: 'format'
                            })
                        ]
                    })
                );

                this.mnuPageNumberPosPicker = new Common.UI.DataView({
                    el: $('#id-toolbar-menu-pageposition'),
                    // lock: this.mnuPageNumberPosPicker.options.lock,
                    allowScrollbar: false,
                    parentMenu:  this.btnInsPageNumber.menu,
                    outerMenu:  {menu: this.btnInsPageNumber.menu, index: 0},
                    showLast: false,
                    store: new Common.UI.DataViewStore([
                        {
                            iconname: 'btn-page-number-top-left',
                            data: {
                                type: c_pageNumPosition.PAGE_NUM_POSITION_TOP,
                                subtype: c_pageNumPosition.PAGE_NUM_POSITION_LEFT
                            }
                        },
                        {
                            iconname: 'btn-page-number-top-center',
                            data: {
                                type: c_pageNumPosition.PAGE_NUM_POSITION_TOP,
                                subtype: c_pageNumPosition.PAGE_NUM_POSITION_CENTER
                            }
                        },
                        {
                            iconname: 'btn-page-number-top-right',
                            data: {
                                type: c_pageNumPosition.PAGE_NUM_POSITION_TOP,
                                subtype: c_pageNumPosition.PAGE_NUM_POSITION_RIGHT
                            }
                        },
                        {
                            iconname: 'btn-page-number-bottom-left',
                            data: {
                                type: c_pageNumPosition.PAGE_NUM_POSITION_BOTTOM,
                                subtype: c_pageNumPosition.PAGE_NUM_POSITION_LEFT
                            }
                        },
                        {
                            iconname: 'btn-page-number-bottom-center',
                            data: {
                                type: c_pageNumPosition.PAGE_NUM_POSITION_BOTTOM,
                                subtype: c_pageNumPosition.PAGE_NUM_POSITION_CENTER
                            }
                        },
                        {
                            iconname: 'btn-page-number-bottom-right',
                            data: {
                                type: c_pageNumPosition.PAGE_NUM_POSITION_BOTTOM,
                                subtype: c_pageNumPosition.PAGE_NUM_POSITION_RIGHT
                            }
                        }
                    ]),
                    itemTemplate: _.template('<div id="<%= id %>" class="item-pagenumber options__icon options__icon-huge <%= iconname %>"></div>')
                });

                this.btnHeader.updateHint('Header menu');
                this.btnFooter.updateHint('Footer menu');
                this.btnInsPageNumber.updateHint('Insert page number');
                this.btnNumbOfPages.updateHint('Insert page number');
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

            textNavigation: 'Navigation',
            textOutline: 'Headings',
            textZoom: 'Zoom',
            textFitToPage: 'Fit To Page',
            textFitToWidth: 'Fit To Width',
            textInterfaceTheme: 'Interface theme',
            textStatusBar: 'Status Bar',
            textAlwaysShowToolbar: 'Always show toolbar',
            textRulers: 'Rulers',
            textDarkDocument: 'Dark document',
            tipHeadings: 'Headings',
            tipFitToPage: 'Fit to page',
            tipFitToWidth: 'Fit to width',
            tipInterfaceTheme: 'Interface theme',
            tipDarkDocument: 'Dark document',
            textLeftMenu: 'Left panel',
            textRightMenu: 'Right panel',
            textTabStyle: 'Tab style',
            textFill: 'Fill',
            textLine: 'Line',
            textMacros: 'Macros',
            tipMacros: 'Macros'
        }
    }()), DE.Views.HeaderFooterTab || {}));
});
