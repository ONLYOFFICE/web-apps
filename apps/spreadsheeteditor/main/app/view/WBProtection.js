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
 *  WBProtection.js
 *
 *  Created on 21.06.2021
 *
 */
define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout',
    'common/main/lib/component/Window',
    'common/main/lib/view/OpenDialog'
], function (template) {
    'use strict';

    SSE.Views.WBProtection = Common.UI.BaseView.extend(_.extend((function(){
        var template =
            '<div class="group">' +
                '<span id="slot-btn-protect-wb" class="btn-slot text x-huge margin-right-2"></span>' +
                '<span id="slot-btn-protect-sheet" class="btn-slot text x-huge"></span>' +
                // '<span id="slot-btn-allow-ranges" class="btn-slot text x-huge"></span>' +
            '</div>' +
            '<div class="separator long invisible"></div>' +
            '<div class="group small">' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-locked-cell"></span>' +
                '</div>' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-hidden-formula"></span>' +
                '</div>' +
            '</div>' +
            '<div class="separator long invisible"></div>' +
            '<div class="group small">' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-locked-shape"></span>' +
                '</div>' +
                '<div class="elset">' +
                    '<span class="btn-slot text" id="slot-chk-locked-text"></span>' +
                '</div>' +
            '</div>' +
            '<div class="separator long"></div>' +
            '<div class="group">' +
                '<span id="slot-btn-protect-range" class="btn-slot text x-huge"></span>' +
            '</div>';

        function setEvents() {
            var me = this;

            this.btnProtectWB.on('click', function (btn, e) {
                me.fireEvent('protect:workbook', [btn.pressed]);
            });
            this.btnProtectSheet.on('click', function (btn, e) {
                me.fireEvent('protect:sheet', [btn.pressed]);
            });
            this.btnAllowRanges.on('click', function (btn, e) {
                me.fireEvent('protect:allow-ranges');
            });
            this.chLockedCell.on('change', function (field, value) {
                me.fireEvent('protect:lock-options', [0, value]);
            });
            this.chLockedShape.on('change', function (field, value) {
                me.fireEvent('protect:lock-options', [1, value]);
            });
            this.chLockedText.on('change', function (field, value) {
                me.fireEvent('protect:lock-options', [2, value]);
            });
            this.chHiddenFormula.on('change', function (field, value) {
                me.fireEvent('protect:lock-options', [3, value]);
            });
            this.btnProtectRange.on('click', function (btn, e) {
                me.fireEvent('protect:range');
            });
            me._isSetEvents = true;
        }

        return {

            options: {},

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                this.appConfig = options.mode;

                var _set = Common.enumLock;
                this.lockedControls = [];
                this._state = {disabled: false};

                this.btnProtectWB = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-protect-workbook',
                    enableToggle: true,
                    caption: this.txtProtectWB,
                    lock        : [_set.editCell, _set.selRangeEdit, _set.lostConnect, _set.coAuth],
                    dataHint    : '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnProtectWB);

                this.btnProtectSheet = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-protect-sheet',
                    enableToggle: true,
                    caption: this.txtProtectSheet,
                    lock        : [_set.editCell, _set.selRangeEdit, _set.lostConnect, _set.coAuth],
                    dataHint    : '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnProtectSheet);

                this.btnAllowRanges = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-allow-edit-ranges',
                    caption: this.txtAllowRanges,
                    lock        : [_set.editCell, _set.selRangeEdit, _set.lostConnect, _set.coAuth, _set.wsLock],
                    dataHint    : '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.btnAllowRanges);

                this.chLockedCell = new Common.UI.CheckBox({
                    labelText: this.txtLockedCell,
                    lock        : [_set.editCell, _set.selRangeEdit, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.wsLock, _set.wbLock, _set.lostConnect, _set.coAuth, _set.userProtected],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chLockedCell);

                this.chLockedShape = new Common.UI.CheckBox({
                    labelText: this.txtLockedShape,
                    lock        : [_set.selRange, _set.selRangeEdit, _set.wbLock, _set.lostConnect, _set.coAuth, _set['Objects'], _set.wsLockShape],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chLockedShape);

                this.chLockedText = new Common.UI.CheckBox({
                    labelText: this.txtLockedText,
                    lock        : [_set.selRange, _set.selRangeEdit, _set.selRangeEdit, _set.selImage, _set.selSlicer, _set.wbLock, _set.lostConnect, _set.coAuth, _set['Objects'], _set.wsLockText],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chLockedText);

                this.chHiddenFormula = new Common.UI.CheckBox({
                    labelText: this.txtHiddenFormula,
                    lock        : [_set.editCell, _set.selRangeEdit, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.selSlicer, _set.wsLock, _set.wbLock, _set.lostConnect, _set.coAuth, _set.userProtected],
                    dataHint    : '1',
                    dataHintDirection: 'left',
                    dataHintOffset: 'small'
                });
                this.lockedControls.push(this.chHiddenFormula);

                this.btnProtectRange = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'toolbar__icon btn-protect-range',
                    caption: this.txtProtectRange,
                    lock        : [_set.editCell, _set.selRangeEdit, _set.lostConnect, _set.coAuth, _set.wsLock],
                    dataHint    : '1',
                    dataHintDirection: 'bottom',
                    dataHintOffset: 'small',
                    visible: !this.appConfig.isOffline
                });
                this.lockedControls.push(this.btnProtectRange);

                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            },

            render: function (el) {
                return this;
            },

            onAppReady: function (config) {
                var me = this;
                (new Promise(function (accept, reject) {
                    accept();
                })).then(function(){
                    me.btnProtectWB.updateHint(me.hintProtectWB);
                    me.btnProtectSheet.updateHint(me.hintProtectSheet);
                    me.btnAllowRanges.updateHint(me.hintAllowRanges);
                    me.btnProtectRange.updateHint(me.hintProtectRange);

                    config.isOffline && me.btnProtectRange.cmpEl.parents('.group').hide().prev('.separator').hide();

                    setEvents.call(me);
                });
            },

            getPanel: function () {
                this.$el = $(_.template(template)( {} ));

                this.btnProtectWB.render(this.$el.find('#slot-btn-protect-wb'));
                this.btnProtectSheet.render(this.$el.find('#slot-btn-protect-sheet'));
                this.btnAllowRanges.render(this.$el.find('#slot-btn-allow-ranges'));
                this.chLockedCell.render(this.$el.find('#slot-chk-locked-cell'));
                this.chLockedShape.render(this.$el.find('#slot-chk-locked-shape'));
                this.chLockedText.render(this.$el.find('#slot-chk-locked-text'));
                this.chHiddenFormula.render(this.$el.find('#slot-chk-hidden-formula'));
                this.btnProtectRange.render(this.$el.find('#slot-btn-protect-range'));

                return this.$el;
            },

            getButtons: function(type) {
                if (type===undefined)
                    return this.lockedControls;
                return [];
            },

            show: function () {
                Common.UI.BaseView.prototype.show.call(this);
                this.fireEvent('show', this);
            },

            txtProtectWB: 'Protect Workbook',
            txtProtectSheet: 'Protect Sheet',
            txtAllowRanges: 'Allow Edit Ranges',
            hintProtectWB: 'Protect workbook',
            hintProtectSheet: 'Protect sheet',
            hintAllowRanges: 'Allow edit ranges',
            txtLockedCell: 'Locked Cell',
            txtLockedShape: 'Shape Locked',
            txtLockedText: 'Lock Text',
            txtHiddenFormula: 'Hidden Formulas',
            txtWBUnlockTitle: 'Unprotect Workbook',
            txtWBUnlockDescription: 'Enter a password to unprotect workbook',
            txtSheetUnlockTitle: 'Unprotect Sheet',
            txtSheetUnlockDescription: 'Enter a password to unprotect sheet',
            hintProtectRange: 'Protect range',
            txtProtectRange: 'Protect Range'
        }
    }()), SSE.Views.WBProtection || {}));
});