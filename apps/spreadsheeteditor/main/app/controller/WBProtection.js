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
    'core',
    'common/main/lib/view/Protection',
    'spreadsheeteditor/main/app/view/WBProtection'
], function () {
    'use strict';

    SSE.Controllers.WBProtection = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
        ],
        views : [
            'WBProtection'
        ],
        sdkViewName : '#id_main',

        initialize: function () {

            this.addListeners({
                'WBProtection': {
                    'protect:workbook':     _.bind(this.onWorkbookClick, this),
                    'protect:sheet':        _.bind(this.onSheetClick, this),
                    'protect:allow-ranges': _.bind(this.onAllowRangesClick, this),
                    'protect:lock-options': _.bind(this.onLockOptionClick, this),
                    'protect:range':       _.bind(this.onProtectRangeClick, this)
                }
            });
        },
        onLaunch: function () {
            this._state = {};
            this.wsLockOptions = ['SelectLockedCells', 'SelectUnlockedCells', 'FormatCells', 'FormatColumns', 'FormatRows', 'InsertColumns', 'InsertRows', 'InsertHyperlinks', 'DeleteColumns',
                'DeleteRows', 'Sort', 'AutoFilter', 'PivotTables', 'Objects', 'Scenarios'];
            Common.enumLock && this.wsLockOptions.forEach(function(item){
                Common.enumLock[item] = item;
            });

            Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            Common.NotificationCenter.on('protect:sheet', _.bind(this.onSheetClick, this));
        },
        setConfig: function (data, api) {
            this.setApi(api);

            if (data) {
                this.sdkViewName        =   data['sdkviewname'] || this.sdkViewName;
            }
        },
        setApi: function (api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onChangeProtectWorkbook',_.bind(this.onChangeProtectWorkbook, this));
                this.api.asc_registerCallback('asc_onChangeProtectWorksheet',_.bind(this.onChangeProtectSheet, this));
                this.api.asc_registerCallback('asc_onActiveSheetChanged',   _.bind(this.onActiveSheetChanged, this));
                this.api.asc_registerCallback('asc_onSelectionChanged',     _.bind(this.onApiSelectionChanged, this));
            }
        },

        setMode: function(mode) {
            this.appConfig = mode;

            this.appConfig.isEdit && this.appConfig.canProtect && (this.view = this.createView('WBProtection', {
                mode: mode
            }));

            return this;
        },

        createToolbarPanel: function() {
            if (this.view)
                return this.view.getPanel();
        },

        getView: function(name) {
            return !name && this.view ?
                this.view : Backbone.Controller.prototype.getView.call(this, name);
        },

        onWorkbookClick: function(state) {
            this.view.btnProtectWB.toggle(!state, true);
            if (state) {
                var me = this,
                    btn,
                    win = new SSE.Views.ProtectDialog({
                        type: 'workbook',
                        handler: function(result, value) {
                            btn = result;
                            if (result == 'ok') {
                                var props = me.api.asc_getProtectedWorkbook();
                                props.asc_setLockStructure(value);
                                me.api.asc_setProtectedWorkbook(props);
                            }
                            Common.NotificationCenter.trigger('edit:complete');
                        }
                    }).on('close', function() {
                        if (btn!=='ok')
                            me.view.btnProtectWB.toggle(false, true);
                    });

                win.show();
            } else {
                var me = this,
                    btn,
                    props = me.api.asc_getProtectedWorkbook();
                if (props.asc_isPassword()) {
                    var win = new Common.Views.OpenDialog({
                            title: me.view.txtWBUnlockTitle,
                            closable: true,
                            type: Common.Utils.importTextType.DRM,
                            txtOpenFile: me.view.txtWBUnlockDescription,
                            validatePwd: false,
                            handler: function (result, value) {
                                btn = result;
                                if (result == 'ok') {
                                    if (me.api) {
                                        props.asc_setLockStructure(value && value.drmOptions ? value.drmOptions.asc_getPassword() : undefined);
                                        me.api.asc_setProtectedWorkbook(props);
                                    }
                                    Common.NotificationCenter.trigger('edit:complete');
                                }
                            }
                        }).on('close', function() {
                            if (btn!=='ok')
                                me.view.btnProtectWB.toggle(true, true);
                        });

                    win.show();
                } else {
                    props.asc_setLockStructure();
                    me.api.asc_setProtectedWorkbook(props);
                }
            }
        },

        onSheetClick: function(state) {
            this.view.btnProtectSheet.toggle(!state, true);
            if (state) {
                var me = this,
                    btn,
                    props = me.api.asc_getProtectedSheet(),
                    win = new SSE.Views.ProtectDialog({
                        type: 'sheet',
                        props: props,
                        api: me.api,
                        handler: function(result, value, props) {
                            btn = result;
                            if (result == 'ok') {
                                props.asc_setSheet(value);
                                me.api.asc_setProtectedSheet(props);
                            }
                            Common.NotificationCenter.trigger('edit:complete');
                        }
                    }).on('close', function() {
                        if (btn!=='ok')
                            me.view.btnProtectSheet.toggle(false, true);
                    });

                win.show();
            } else {
                var me = this,
                    btn,
                    props = me.api.asc_getProtectedSheet();
                if (props.asc_isPassword()) {
                    var win = new Common.Views.OpenDialog({
                        title: me.view.txtSheetUnlockTitle,
                        closable: true,
                        type: Common.Utils.importTextType.DRM,
                        txtOpenFile: me.view.txtSheetUnlockDescription,
                        validatePwd: false,
                        handler: function (result, value) {
                            btn = result;
                            if (result == 'ok') {
                                if (me.api) {
                                    props.asc_setSheet(value && value.drmOptions ? value.drmOptions.asc_getPassword() : undefined);
                                    me.api.asc_setProtectedSheet(props);
                                }
                                Common.NotificationCenter.trigger('edit:complete');
                            }
                        }
                    }).on('close', function() {
                        if (btn!=='ok')
                            me.view.btnProtectSheet.toggle(true, true);
                    });

                    win.show();
                } else {
                    props.asc_setSheet();
                    me.api.asc_setProtectedSheet(props);
                }
            }
        },

        onAllowRangesClick: function() {
            var me = this,
                props = me.api.asc_getProtectedRanges(),
                win = new SSE.Views.ProtectRangesDlg({
                    api: me.api,
                    props: props,
                    handler: function(result, settings) {
                        if (result=='protect-sheet') {
                            me.api.asc_setProtectedRanges(settings.arr, settings.deletedArr);
                            me.onSheetClick(true);
                        } else if (result == 'ok') {
                            me.api.asc_setProtectedRanges(settings.arr, settings.deletedArr);
                        }
                        Common.NotificationCenter.trigger('edit:complete');
                    }
                });

            win.show();
        },

        onLockOptionClick: function(type, value) {
            switch (type) {
                case 0: // cell
                    this.api.asc_setCellLocked(value=='checked');
                    break;
                case 1: // shape
                    var props = new Asc.asc_CImgProperty();
                    props.asc_putProtectionLocked(value=='checked');
                    this.api.asc_setGraphicObjectProps(props);
                    break;
                case 2: // text
                    var props = new Asc.asc_CImgProperty();
                    props.asc_putProtectionLockText(value=='checked');
                    this.api.asc_setGraphicObjectProps(props);
                    break;
                case 3: // formula
                    this.api.asc_setCellHiddenFormulas(value=='checked');
                    break;
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onProtectRangeClick: function() {
            Common.UI.TooltipManager.closeTip('protectRange');

            var me = this,
                win = new SSE.Views.ProtectedRangesManagerDlg({
                    api: me.api,
                    canRequestUsers: me.appConfig.canRequestUsers,
                    currentUser: me.appConfig.user,
                    handler: function(result, settings) {
                        Common.NotificationCenter.trigger('edit:complete');
                    }
                });

            win.show();
        },

        onAppReady: function (config) {
            if (!this.view) return;

            var me = this;
            (new Promise(function (resolve) {
                resolve();
            })).then(function () {
                me.view.btnProtectWB.toggle(me.api.asc_isProtectedWorkbook(), true);

                var props = me.getWSProps();
                me.view.btnProtectSheet.toggle(props.wsLock, true); //current sheet
                Common.Utils.lockControls(Common.enumLock['Objects'], props.wsProps['Objects'], { array: [me.view.chLockedText, me.view.chLockedShape]});
                Common.Utils.lockControls(Common.enumLock.wsLock, props.wsLock, { array: [me.view.btnAllowRanges]});
            });
        },

        onChangeProtectWorkbook: function() {
            this.view && this.view.btnProtectWB.toggle(this.api.asc_isProtectedWorkbook(), true);
        },

        onChangeProtectSheet: function() {
            var props = this.getWSProps(true);

            if (this.view && props) {
                this.view.btnProtectSheet.toggle(props.wsLock, true); //current sheet
                Common.Utils.lockControls(Common.enumLock['Objects'], props.wsProps['Objects'], { array: [this.view.chLockedText, this.view.chLockedShape]});
                Common.Utils.lockControls(Common.enumLock.wsLock, props.wsLock, { array: [this.view.btnAllowRanges]});
            }
            Common.NotificationCenter.trigger('protect:wslock', props);
        },

        onActiveSheetChanged: function() {
            this.onChangeProtectSheet(); //current sheet
        },

        getWSProps: function(update) {
            if (!this.appConfig || !this.appConfig.isEdit && !this.appConfig.isRestrictedEdit) return;

            if (update || !this._state.protection) {
                var wsProtected = !!this.api.asc_isProtectedSheet();
                var arr = [];
                if (wsProtected) {
                    arr = [];
                    var props = this.api.asc_getProtectedSheet();
                    props && this.wsLockOptions.forEach(function(item){
                        arr[item] = props['asc_get' + item] ? props['asc_get' + item]() : false;
                    });
                } else {
                    this.wsLockOptions.forEach(function(item){
                        arr[item] = false;
                    });
                }
                this._state.protection = {wsLock: wsProtected, wsProps: arr};
            }

            return this._state.protection;
        },

        onApiSelectionChanged: function(info) {
            if (!this.view || !info) return;
            if ($('.asc-window.enable-key-events:visible').length>0) return;

            var selectionType = info.asc_getSelectionType();
            var need_disable = (selectionType === Asc.c_oAscSelectionType.RangeCells || selectionType === Asc.c_oAscSelectionType.RangeCol ||
                                selectionType === Asc.c_oAscSelectionType.RangeRow || selectionType === Asc.c_oAscSelectionType.RangeMax);
            Common.Utils.lockControls(Common.enumLock.selRange, need_disable, { array: [this.view.chLockedText, this.view.chLockedShape]});

            var xfs = info.asc_getXfs();
            this.view.chLockedCell.setValue(!!xfs.asc_getLocked(), true);
            this.view.chHiddenFormula.setValue(!!xfs.asc_getHidden(), true);

            if (selectionType === Asc.c_oAscSelectionType.RangeSlicer || selectionType === Asc.c_oAscSelectionType.RangeImage ||
                selectionType === Asc.c_oAscSelectionType.RangeShape || selectionType === Asc.c_oAscSelectionType.RangeShapeText ||
                selectionType === Asc.c_oAscSelectionType.RangeChart || selectionType === Asc.c_oAscSelectionType.RangeChartText) {
                var selectedObjects = this.api.asc_getGraphicObjectProps();
                for (var i = 0; i < selectedObjects.length; i++) {
                    if (selectedObjects[i].asc_getObjectType() == Asc.c_oAscTypeSelectElement.Image) {
                        var elValue = selectedObjects[i].asc_getObjectValue();
                        var locktext = elValue.asc_getProtectionLockText(),
                            lock = elValue.asc_getProtectionLocked();
                        this.view.chLockedText.setValue(locktext!==undefined ? !!locktext : 'indeterminate', true);
                        this.view.chLockedShape.setValue(lock!==undefined ? !!lock : 'indeterminate', true);
                        Common.Utils.lockControls(Common.enumLock.wsLockText, locktext===null, { array: [this.view.chLockedText]});
                        Common.Utils.lockControls(Common.enumLock.wsLockShape, lock===null, { array: [this.view.chLockedShape]});
                        break;
                    }
                }
            }
            Common.Utils.lockControls(Common.enumLock.userProtected, !!info.asc_getUserProtected(), { array: [this.view.chLockedCell, this.view.chHiddenFormula]});
        }

    }, SSE.Controllers.WBProtection || {}));
});