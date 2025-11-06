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
            '<div class="group">' +
                '<span class="btn-slot text x-huge slot-headerfooter"></span>' +
            '</div>' +
            '<div class="separator long"></div>' +
            '<div class="group">' +
                '<span class="btn-slot text x-huge slot-pagenumbers"></span>' +
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
            '<div class="separator long"></div>' +
            '<div class="group">' +
                '<span class="btn-slot text x-huge" id="slot-btn-close-tab"></span>' +
            '</div>' +
        '</section>';

        return {
            options: {},

            setEvents: function () {
                var me = this;

                this.btnsPageNumber.forEach(function (button) {
                    button.menu.on('item:click', function (menu, item, e) {
                        me.fireEvent('headerfooter:inspagenumber', [item]);
                    })
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
                this.btnCloseTab.on('click', function(field){
                    me.fireEvent('headerfooter:close');}
                );
                this.btnsHeaderFooter.forEach(function (button) {
                    button.menu.on('item:click', function(menu, item, e) {
                        me.fireEvent('headerfooter:editremove', [item]);
                    })
                })
            },

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this);
                this.toolbar = options.toolbar;
                this.appConfig = options.mode;

                this.lockedControls = [];
                this.paragraphControls = [];

                var me = this;
                var _set = Common.enumLock;

                this.btnCloseTab = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    caption: this.txtCloseTab,
                    iconCls: 'toolbar__icon btn-ic-protect',
                    lock: [_set.lostConnect, _set.disableOnStart],
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnCloseTab);

                this.lblHeaderTop = new Common.UI.Label({
                    caption: this.capHeaderTop,
                    lock: [_set.paragraphLock,]
                });
                this.lockedControls.push(this.lblHeaderTop);

                this.lblFooterBottom = new Common.UI.Label({
                    caption: this.capFooterBottom,
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
                    lock: [_set.headerLock],
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big',
                });
                this.lockedControls.push(this.numHeaderPosition);
                this.paragraphControls.push(this.numHeaderPosition);

                this.numHeaderPosition.on('inputleave', function(){ me.fireEvent('editcomplete', me);});

                this.numFooterPosition = new Common.UI.MetricSpinner({
                    step: .1,
                    width: 85,
                    value: '1.25 cm',
                    defaultUnit : "cm",
                    maxValue: 55.88,
                    lock: [_set.headerLock],
                    minValue: 0,
                    dataHint: '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'big',
                });
                this.lockedControls.push(this.numFooterPosition);
                this.paragraphControls.push(this.numFooterPosition);

                this.chDiffFirst = new Common.UI.CheckBox({
                    labelText: this.txtDiffFirst,
                    dataHint: '1',
                    lock: [_set.headerLock],
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chDiffFirst);
                this.paragraphControls.push(this.chDiffFirst);

                this.chDiffOddEven = new Common.UI.CheckBox({
                    labelText: this.txtDiffOddEven,
                    dataHint: '1',
                    lock: [_set.headerLock],
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chDiffOddEven);
                this.paragraphControls.push(this.chDiffOddEven);

                this.chSameAs = new Common.UI.CheckBox({
                    labelText: this.txtSameAs,
                    dataHint: '1',
                    lock: [_set.headerLock],
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.paragraphControls.push(this.chSameAs);

                this.mnuPageNumberPosPicker = {
                    conf: {disabled: false},
                    isDisabled: function () {
                        return this.conf.disabled;
                    },
                    setDisabled: function (val) {
                        this.conf.disabled = val;
                    },
                    options: {}
                };

                this.mnuPageNumberPosPicker.options.lock = [_set.headerFooterLock];

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
                var _set = Common.enumLock;
                _injectComponent('#slot-spin-header-top', this.numHeaderPosition);
                _injectComponent('#slot-spin-footer-bot', this.numFooterPosition);
                this.btnsHeaderFooter = Common.Utils.injectButtons($host.find('.btn-slot.slot-headerfooter').add(this.toolbar.$el.find('.btn-slot.slot-headerfooter')), '', 'toolbar__icon btn-editheader', this.txtHeaderFooter,
                    [_set.previewReviewMode, _set.viewFormMode, _set.inEquation, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.viewMode], undefined, true, undefined, '1', 'bottom', 'small');
                Array.prototype.push.apply(this.lockedControls, this.btnsHeaderFooter);

                this.btnsPageNumber = Common.Utils.injectButtons($host.find('.btn-slot.slot-pagenumbers').add(this.toolbar.$el.find('.btn-slot.slot-pagenumbers')), '', 'toolbar__icon btn-insertchart', this.txtPageNumbering,
                    [_set.previewReviewMode, _set.viewFormMode, _set.inEquation, _set.lostConnect, _set.disableOnStart, _set.docLockView, _set.docLockForms, _set.docLockComments, _set.viewMode], undefined, true, undefined, '1', 'bottom', 'small');
                Array.prototype.push.apply(this.lockedControls, this.btnsPageNumber);

                this.btnCloseTab && this.btnCloseTab.render($host.find('#slot-btn-close-tab'));
                this.lblHeaderTop && this.lblHeaderTop.render($host.find('#slot-lbl-header-top'));
                this.lblFooterBottom && this.lblFooterBottom.render($host.find('#slot-lbl-footer-bot'));
                this.chDiffFirst && this.chDiffFirst.render($host.find('#slot-chk-diff-first'));
                this.chDiffOddEven && this.chDiffOddEven.render($host.find('#slot-chk-diff-odd-even'));
                this.chSameAs && this.chSameAs.render($host.find('#slot-chk-sameas'));
                return this.$el;
            },

            onAppReady: function (config) {
                var me = this;
                this.$el = $(_.template(template)({}));
                var _set = Common.enumLock;

                me.mnuPageNumberPosPickers = [];
                me.numOfPages = [];
                me.numFormats = [];
                me.numCurrPos = [];

                this.btnsHeaderFooter.forEach(function (button) {
                    button.updateHint(me.tipHeaderFooter);

                    var _menu = new Common.UI.Menu({
                        items: [
                            {caption: me.txtEditHeader, value: 'edit-header'},
                            {caption: me.txtEditFooter, value: 'edit-footer'},
                            {caption: '--'},
                            {caption: me.txtRemoveHeader, value: 'remove-header'},
                            {caption: me.txtRemoveFooter, value: 'remove-footer'},
                        ]
                    });
                    button.setMenu(_menu); 
                });

                this.btnsPageNumber.forEach(function (button, index) {
                    button.updateHint(me.tipPageNumbering);
                    var id = `id-toolbar-menu-pageposition${index}`;

                    var _menu = new Common.UI.Menu({
                        style: 'min-width: 90px;',
                        items: [
                            {template: _.template(`<div id="${id}" class="menu-pageposition"></div>`)},
                            me[`mnuPageNumCurrentPos${index}`] = new Common.UI.MenuItem({
                                caption: me.capCurrentPos,
                                lock: [_set.paragraphLock, _set.headerLock, _set.richEditLock, _set.plainEditLock],
                                value: 'current'
                            }),
                            me[`mnuPageNumOfPages${index}`] = new Common.UI.MenuItem({
                                caption: me.capNumOfPages,
                                lock: [_set.paragraphLock, _set.headerLock, _set.richEditLock, _set.plainEditLock, _set.headerFooterLock],
                                value: 'quantity'
                            }),
                            {caption: '--'},
                            me[`mnuNumFormat${index}`] = new Common.UI.MenuItem({
                                caption: me.capFormatNums,
                                lock: [_set.inHeader, _set.paragraphLock, _set.headerLock, _set.richEditLock, _set.plainEditLock, _set.headerFooterLock],
                                value: 'format'
                            })
                        ]
                    });

                    button.setMenu(_menu);

                    var _conf = me.mnuPageNumberPosPicker ? me.mnuPageNumberPosPicker.conf : undefined;
                    var keepState = me.mnuPageNumberPosPicker ? me.mnuPageNumberPosPicker.keepState : undefined;

                    const picker = new Common.UI.DataView({
                        el: $(`#${id}`),
                        lock: me.mnuPageNumberPosPicker.options.lock,
                        allowScrollbar: false,
                        parentMenu: button.menu,
                        outerMenu: {menu: button.menu, index: 0},
                        showLast: false,
                        store: new Common.UI.DataViewStore([
                            { iconname: 'btn-page-number-top-left', data: { type: c_pageNumPosition.PAGE_NUM_POSITION_TOP, subtype: c_pageNumPosition.PAGE_NUM_POSITION_LEFT } },
                            { iconname: 'btn-page-number-top-center', data: { type: c_pageNumPosition.PAGE_NUM_POSITION_TOP, subtype: c_pageNumPosition.PAGE_NUM_POSITION_CENTER } },
                            { iconname: 'btn-page-number-top-right', data: { type: c_pageNumPosition.PAGE_NUM_POSITION_TOP, subtype: c_pageNumPosition.PAGE_NUM_POSITION_RIGHT } },
                            { iconname: 'btn-page-number-bottom-left', data: { type: c_pageNumPosition.PAGE_NUM_POSITION_BOTTOM, subtype: c_pageNumPosition.PAGE_NUM_POSITION_LEFT } },
                            { iconname: 'btn-page-number-bottom-center', data: { type: c_pageNumPosition.PAGE_NUM_POSITION_BOTTOM, subtype: c_pageNumPosition.PAGE_NUM_POSITION_CENTER } },
                            { iconname: 'btn-page-number-bottom-right', data: { type: c_pageNumPosition.PAGE_NUM_POSITION_BOTTOM, subtype: c_pageNumPosition.PAGE_NUM_POSITION_RIGHT } }
                        ]),
                        itemTemplate: _.template('<div id="<%= id %>" class="item-pagenumber options__icon options__icon-huge <%= iconname %>"></div>')
                    }).on('item:click', function (picker, item, record, e) {
                        me.fireEvent('headerfooter:pospick', [picker, item, record, e]);
                    });

                    me.mnuPageNumberPosPickers.push(picker);
                    me.numOfPages.push(me[`mnuPageNumOfPages${index}`]);
                    me.numFormats.push(me[`mnuNumFormat${index}`]);
                    me.numCurrPos.push(me[`mnuPageNumCurrentPos${index}`]);

                    picker.keepState = keepState;
                    _conf && picker.setDisabled(_conf.disabled);
                });

                Array.prototype.push.apply(me.paragraphControls, me.numOfPages);
                Array.prototype.push.apply(me.paragraphControls, me.numCurrPos);
                Array.prototype.push.apply(me.paragraphControls, me.numFormats);
                Array.prototype.push.apply(me.lockedControls, me.numFormats);
                this.btnCloseTab.updateHint(this.tipCloseTab);
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
        }
    }()), DE.Views.HeaderFooterTab || {}));
});
