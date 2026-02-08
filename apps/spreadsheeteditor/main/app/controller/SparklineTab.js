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
 *  SparklineTab.js
 *
 *  Created on 15.10.2025
 *
 */

define([
    'core',
    'spreadsheeteditor/main/app/view/SparklineTab'
], function () {
    'use strict';

    SSE.Controllers.SparklineTab = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
        ],
        views : [
            'SparklineTab'
        ],
        sdkViewName : '#id_main',

        initialize: function () {
            this._state = {
                SparkType: -1,
                SparkStyle: 1,
                DisabledControls: false,
                LineWeight: 1,
                MarkersPoint: false,
                HighPoint: false,
                LowPoint: false,
                FirstPoint: false,
                LastPoint: false,
                NegativePoint: false,
                SparkColor: '000000',
                MarkersColor: this.defColor,
                HighColor: this.defColor,
                LowColor: this.defColor,
                FirstColor: this.defColor,
                LastColor: this.defColor,
                NegativeColor: this.defColor,
                SparkId: undefined
            };
            this._nRatio = 1;
            this.spinners = [];
            this.lockedControls = [];
            this._locked = false;
            this.defColor = {color: '4f81bd', effectId: 24};

            this._noApply = false;
            this._originalProps = null;

            this.addListeners({
                'SparklineTab': {
                    'sparkline:checkbox': _.bind(this.onCheckPointChange, this),
                    'sparkline:type': _.bind(this.onSelectSparkType, this),
                    'sparkline:addnewcolor': _.bind(this.onSelectSparklineColorMenu, this),
                    'sparkline:clear': _.bind(this.onClear, this),
                    'sparkline:advanced': _.bind(this.openAdvancedSettings, this),
                    'sparkline:markerscolor': _.bind(this.onSelectMarkersColorMenu, this),
                    'sparkline:bordersizeselect': _.bind(this.onBorderSizeSelected, this),
                    'sparkline:bordersizechanged': _.bind(this.onBorderSizeChanged, this),
                    'sparkline:styleselect': _.bind(this.onSelectSparkStyle, this),
                },
                'Toolbar': {
                    'tab:active': _.bind(this.onActiveTab, this)
                }
            });
        },

        onSelectSparkStyle: function(combo, record) {
            if (this.api && this._originalProps) {
                var props = new Asc.sparklineGroup();
                props.asc_setStyle(record.get('data'));
                this.api.asc_setSparklineGroup(this._state.SparkId, props);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onBorderSizeChanged: function(combo, record, e, before) {
            var me = this;
            if (before) {
                var value = parseFloat(record.value),
                    expr = new RegExp('^\\s*(\\d*(\\.|,)?\\d+)\\s*(' + me.txtPt + ')?\\s*$');
                if (!(expr.exec(record.value)) || value<0.01 || value>1584) {
                    this._state.LineWeight = -1;
                    setTimeout( function() {
                        Common.UI.error({
                            msg: me.textBorderSizeErr,
                            callback: function() {
                                _.defer(function(btn) {
                                    Common.NotificationCenter.trigger('edit:complete', me);
                                })
                            }
                        });
                    }, 10);
                }
            } else
                this.applyBorderSize(record.value);
        },

        onBorderSizeSelected: function (combo, record) {
            this.applyBorderSize(record.value);
        },

        applyBorderSize: function(value) {
            value = Common.Utils.String.parseFloat(value);
            value = isNaN(value) ? 1 : Math.max(0.01, Math.min(1584, value));

            this.BorderSize = value;
            if (this.api && !this._noApply && this._originalProps) {
                var props = new Asc.sparklineGroup();
                props.asc_setLineWeight(this.BorderSize);
                this.api.asc_setSparklineGroup(this._state.SparkId, props);
                Common.NotificationCenter.trigger('edit:complete', this);
            }
        },

        onClear: function (menu, item, e) {
            Common.NotificationCenter.trigger('protect:check', this.onClearCallback, this, [menu, item]);
        },

        onClearCallback: function (menu, item) {
            this.api && this.api.asc_emptyCells(item.value, false);
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onSelectMarkersColorMenu: function (item, color, index) {
            if (this.api && !this._noApply && this._originalProps) {
                var props = new Asc.sparklineGroup();
                switch (index) {
                    case 0:
                        props.asc_setHighPoint(true);
                        props.asc_setColorHigh(Common.Utils.ThemeColor.getRgbColor(color));
                        break
                    case 1:
                        props.asc_setLowPoint(true);
                        props.asc_setColorLow(Common.Utils.ThemeColor.getRgbColor(color));
                        break
                    case 2:
                        props.asc_setFirstPoint(true);
                        props.asc_setColorFirst(Common.Utils.ThemeColor.getRgbColor(color));
                        break
                    case 3:
                        props.asc_setLastPoint(true);
                        props.asc_setColorLast(Common.Utils.ThemeColor.getRgbColor(color));
                        break
                    case 4:
                        props.asc_setNegativePoint(true);
                        props.asc_setColorNegative(Common.Utils.ThemeColor.getRgbColor(color));
                        break
                    case 5:
                        props.asc_setMarkersPoint(true);
                        props.asc_setColorMarkers(Common.Utils.ThemeColor.getRgbColor(color));
                        break
                }
                this.api.asc_setSparklineGroup(this._state.SparkId, props);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onSelectSparklineColorMenu: function (menu, item, picker, sparkColor) {
            if (!sparkColor) {
                if (item.value === 1 && picker) {
                    picker.addNewColor();
                };
            } else {
                if (item.value === 1 && this.mnuSparklineColorPicker) {
                    this.mnuSparklineColorPicker.addNewColor();
                };
            }
        },

        onSelectSparkType: function (type) {
            this._state.SparkType = -1;
            if (this.api && !this._noApply && this._originalProps) {
                var props = new Asc.sparklineGroup();
                props.asc_setType(type);
                this.api.asc_setSparklineGroup(this._state.SparkId, props);
            }

            this.view.btnLineType.toggle(type === 0);
            this.view.btnColumnType.toggle(type === 1);
            this.view.btnWinLossType.toggle(type === 2);

            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onCheckPointChange: function(type, field, newValue, oldValue, eOpts) {
            if (this.api && !this._noApply && this._originalProps) {
                var props = new Asc.sparklineGroup();
                switch (type) {
                    case 0:
                        props.asc_setHighPoint(field=='checked');
                    break;
                    case 1:
                        props.asc_setLowPoint(field=='checked');
                    break;
                    case 2:
                        props.asc_setNegativePoint(field=='checked');
                    break;
                    case 3:
                        props.asc_setFirstPoint(field=='checked');
                    break;
                    case 4:
                        props.asc_setLastPoint(field=='checked');
                    break;
                    case 5:
                        props.asc_setMarkersPoint(field=='checked');
                    break;
                }
                this.api.asc_setSparklineGroup(this._state.SparkId, props);
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        createDelayedElements: function () {
            var me = this
            if (this.mnuSparklineColorPicker) return

            this.mnuSparklineColorPicker = new Common.UI.ThemeColorPalette({
                el: $('#sparkline-color-menu-picker'),
                outerMenu: {menu: me.view.btnSparklineColor.menu, index: 0}
            });
            this.view.btnSparklineColor.menu.setInnerMenu([{menu: this.mnuSparklineColorPicker, index: 0}]);
            this.mnuSparklineColorPicker.updateColors(Common.Utils.ThemeColor.getEffectColors(), Common.Utils.ThemeColor.getStandartColors());
            this.mnuSparklineColorPicker.on('select', _.bind(this.onSparklineColorSelect, this));
        },

        onSparklineColorSelect: function (item, color) {
            if (this.api && this._originalProps) {
                var props = new Asc.sparklineGroup();
                props.asc_setColorSeries(Common.Utils.ThemeColor.getRgbColor(color));
                this.api.asc_setSparklineGroup(this._state.SparkId, props);
            }
            this.view.btnSparklineColor.menu.hide();
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        ChangeSettings: function(props) {
            this.createDelayedElements();
            this._props = props;

            if (this.api && props){
                    this._originalProps = props;
                    this._state.SparkId = props.asc_getId();

                    var type = props.asc_getType(),
                        styleChanged = false;
                    if (this._state.SparkType !== type) {
                        this._state.SparkType = type;
                        this.view.btnLineType.toggle(type === 0);
                        this.view.btnColumnType.toggle(type === 1);
                        this.view.btnWinLossType.toggle(type === 2);
                        styleChanged = true;
                    }

                    var w = props.asc_getLineWeight(),
                        check_value = (Math.abs(this._state.LineWeight-w)<0.001) && !((new RegExp(this.txtPt + '\\s*$')).test(this.view.cmbBorderSize.getRawValue()));
                    if ( Math.abs(this._state.LineWeight-w)>0.001 || check_value ||
                        (this._state.LineWeight===null || w===null)&&(this._state.LineWeight!==w)) {
                        this._state.LineWeight = w;

                        var _selectedItem = (w===null) ? w : _.find(this.view.cmbBorderSize.store.models, function(item) {
                            if ( w<item.attributes.value+0.01 && w>item.attributes.value-0.01) {
                                return true;
                            }
                        });
                        if (_selectedItem)
                            this.view.cmbBorderSize.selectRecord(_selectedItem);
                        else {
                            this.view.cmbBorderSize.setValue((w!==null) ? parseFloat(w.toFixed(2)) + ' ' + this.txtPt : '');
                        }
                        this.BorderSize = w;
                    }
                    var color = props.asc_getColorSeries();
                    if (color) {
                        this.SparkColor = (color.asc_getType() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) ?
                            {color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB()), effectValue: color.asc_getValue() } :
                            Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB());

                        var type1 = typeof(this.SparkColor),
                            type2 = typeof(this._state.SparkColor);
                        if ( (type1 !== type2) || (type1=='object' && (this.SparkColor.effectValue!==this._state.SparkColor.effectValue || this._state.SparkColor.color.indexOf(this.SparkColor.color)<0)) ||
                            (type1!='object' && (this._state.SparkColor.indexOf(this.SparkColor)<0))) {

                            Common.Utils.ThemeColor.selectPickerColorByEffect(this.SparkColor, this.mnuSparklineColorPicker);
                            this._state.SparkColor = this.SparkColor;
                            styleChanged = true;
                        }
                    }

                    var point = props.asc_getMarkersPoint();
                    color = props.asc_getColorMarkers();
                    if ( this._state.MarkersPoint!==point ) {
                        this.view.chMarkers.setValue((point !== null && point !== undefined) ? point : 'indeterminate', true);
                        this._state.MarkersPoint=point;
                        styleChanged = true;
                    }

                    if (color) {
                        this.MarkersColor = (color.asc_getType() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) ?
                            {color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB()), effectValue: color.asc_getValue() } :
                            Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB());

                        var type1 = typeof(this.MarkersColor),
                            type2 = typeof(this._state.MarkersColor);
                        if ( (type1 !== type2) || (type1=='object' && (this.MarkersColor.effectValue!==this._state.MarkersColor.effectValue || this._state.MarkersColor.color.indexOf(this.MarkersColor.color)<0)) ||
                            (type1!='object' && (this._state.MarkersColor.indexOf(this.MarkersColor)<0))) {
                            Common.Utils.ThemeColor.selectPickerColorByEffect(this.MarkersColor, this.view.colorMenus[5]);
                            this._state.MarkersColor = this.MarkersColor;
                            styleChanged = true;
                        }
                    }

                    point = props.asc_getHighPoint();
                    color = props.asc_getColorHigh();
                    if ( this._state.HighPoint!==point ) {
                        this.view.chHighPoint.setValue((point !== null && point !== undefined) ? point : 'indeterminate', true);
                        this._state.HighPoint=point;
                        styleChanged = true;
                    }
                    if (color) {
                        this.HighColor = (color.asc_getType() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) ?
                            {color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB()), effectValue: color.asc_getValue() } :
                            Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB());

                        var type1 = typeof(this.HighColor),
                            type2 = typeof(this._state.HighColor);
                        if ( (type1 !== type2) || (type1=='object' && (this.HighColor.effectValue!==this._state.HighColor.effectValue || this._state.HighColor.color.indexOf(this.HighColor.color)<0)) ||
                            (type1!='object' && (this._state.HighColor.indexOf(this.HighColor)<0))) {
                            Common.Utils.ThemeColor.selectPickerColorByEffect(this.HighColor, this.view.colorMenus[0]);
                            this._state.HighColor = this.HighColor;
                            styleChanged = true;
                        }
                    }

                    point = props.asc_getLowPoint();
                    color = props.asc_getColorLow();
                    if ( this._state.LowPoint!==point ) {
                        this.view.chLowPoint.setValue((point !== null && point !== undefined) ? point : 'indeterminate', true);
                        this._state.LowPoint=point;
                        styleChanged = true;
                    }
                    if (color) {
                        this.LowColor = (color.asc_getType() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) ?
                            {color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB()), effectValue: color.asc_getValue() } :
                            Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB());

                        var type1 = typeof(this.LowColor),
                            type2 = typeof(this._state.LowColor);
                        if ( (type1 !== type2) || (type1=='object' && (this.LowColor.effectValue!==this._state.LowColor.effectValue || this._state.LowColor.color.indexOf(this.LowColor.color)<0)) ||
                            (type1!='object' && (this._state.LowColor.indexOf(this.LowColor)<0))) {
                            Common.Utils.ThemeColor.selectPickerColorByEffect(this.LowColor, this.view.colorMenus[1]);
                            this._state.LowColor = this.LowColor;
                            styleChanged = true;
                        }
                    }

                    point = props.asc_getFirstPoint();
                    color = props.asc_getColorFirst();
                    if ( this._state.FirstPoint!==point ) {
                        this.view.chFirstPoint.setValue((point !== null && point !== undefined) ? point : 'indeterminate', true);
                        this._state.FirstPoint=point;
                        styleChanged = true;
                    }
                    if (color) {
                        this.FirstColor = (color.asc_getType() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) ?
                            {color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB()), effectValue: color.asc_getValue() } :
                            Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB());

                        var type1 = typeof(this.FirstColor),
                            type2 = typeof(this._state.FirstColor);
                        if ( (type1 !== type2) || (type1=='object' && (this.FirstColor.effectValue!==this._state.FirstColor.effectValue || this._state.FirstColor.color.indexOf(this.FirstColor.color)<0)) ||
                            (type1!='object' && (this._state.FirstColor.indexOf(this.FirstColor)<0))) {
                            Common.Utils.ThemeColor.selectPickerColorByEffect(this.FirstColor, this.view.colorMenus[2]);
                            this._state.FirstColor = this.FirstColor;
                            styleChanged = true;
                        }
                    }

                    point = props.asc_getLastPoint();
                    color = props.asc_getColorLast();
                    if ( this._state.LastPoint!==point ) {
                        this.view.chLastPoint.setValue((point !== null && point !== undefined) ? point : 'indeterminate', true);
                        this._state.LastPoint=point;
                        styleChanged = true;
                    }
                    if (color) {
                        this.LastColor = (color.asc_getType() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) ?
                            {color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB()), effectValue: color.asc_getValue() } :
                            Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB());

                        var type1 = typeof(this.LastColor),
                            type2 = typeof(this._state.LastColor);
                        if ( (type1 !== type2) || (type1=='object' && (this.LastColor.effectValue!==this._state.LastColor.effectValue || this._state.LastColor.color.indexOf(this.LastColor.color)<0)) ||
                            (type1!='object' && (this._state.LastColor.indexOf(this.LastColor)<0))) {
                            Common.Utils.ThemeColor.selectPickerColorByEffect(this.LastColor, this.view.colorMenus[3]);
                            this._state.LastColor = this.LastColor;
                            styleChanged = true;
                        }
                    }

                    point = props.asc_getNegativePoint();
                    color = props.asc_getColorNegative();
                    if ( this._state.NegativePoint!==point ) {
                        this.view.chNegativePoint.setValue((point !== null && point !== undefined) ? point : 'indeterminate', true);
                        this._state.NegativePoint=point;
                        styleChanged = true;
                    }
                    if (color) {
                        this.NegativeColor = (color.asc_getType() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) ?
                            {color: Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB()), effectValue: color.asc_getValue() } :
                            Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB());

                        var type1 = typeof(this.NegativeColor),
                            type2 = typeof(this._state.NegativeColor);
                        if ( (type1 !== type2) || (type1=='object' && (this.NegativeColor.effectValue!==this._state.NegativeColor.effectValue || this._state.NegativeColor.color.indexOf(this.NegativeColor.color)<0)) ||
                            (type1!='object' && (this._state.NegativeColor.indexOf(this.NegativeColor)<0))) {
                            Common.Utils.ThemeColor.selectPickerColorByEffect(this.NegativeColor, this.view.colorMenus[4]);
                            this._state.NegativeColor = this.NegativeColor;
                            styleChanged = true;
                        }
                    }

                    // if (styleChanged)
                        this.updateSparkStyles(props.asc_getStyles());

                    this.updateMarkerColors();
                    Common.Utils.lockControls(Common.enumLock.notLineType, this._state.SparkType !== Asc.c_oAscSparklineType.Line, {array: this.view.lockedControls});
            }
        },

        updateMarkerColors: function () {
            if (!this._props) return;

            const colorSpans = this.view.btnMarkerColor && this.view.btnMarkerColor.cmpEl ? this.view.btnMarkerColor.cmpEl.find('span.color') : [];
            const colors = [
                this._props.asc_getColorHigh(),
                this._props.asc_getColorLow(),
                this._props.asc_getColorFirst(),
                this._props.asc_getColorLast(),
                this._props.asc_getColorNegative(),
                this._props.asc_getColorMarkers()
            ];

            colorSpans.each((index, el) => {
                const color = colors[index];
                if (color) {
                    const hex = (color.asc_getType() === Asc.c_oAscColor.COLOR_TYPE_SCHEME)
                        ? Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB())
                        : Common.Utils.ThemeColor.getHexColor(color.asc_getR(), color.asc_getG(), color.asc_getB());
                    $(el).css('background','#' + hex);
                }
            });
        },

        openAdvancedSettings: function() {
            if (!Common.Controllers.LaunchController.isScriptLoaded()) return;

            var me = this;
            var win, props;
            if (me.api){
                props = me._originalProps;
                if (props) {
                    (new SSE.Views.ChartSettingsDlg(
                        {
                            chartSettings: props,
                            imageSettings: null,
                            sparklineStyles: me.sparklineStyles,
                            isChart: false,
                            api: me.api,
                            handler: function(result, value) {
                                if (result == 'ok') {
                                    if (me.api) {
                                        me.api.asc_setSparklineGroup(me._state.SparkId, value.chartSettings);
                                    }
                                }
                                Common.NotificationCenter.trigger('edit:complete', me);
                            }
                        })).show();
                }
            }
        },

        updateSparkStyles: function(styles) {
            var me = this;

            if (styles && styles.length>1){
                var stylesStore = this.view.cmbSparkStyle.menuPicker.store,
                    selectedIdx = styles[styles.length-1];
                this.sparklineStyles = styles;
                if (stylesStore.length == styles.length-1) {
                    var data = stylesStore.models;
                    for (var i=0; i<styles.length-1; i++) {
                        data[i].set('imageUrl', styles[i]);
                    }
                    if (selectedIdx<0) {
                        this.view.cmbSparkStyle.fillComboView(stylesStore.at(0), false);
                        this.view.cmbSparkStyle.fieldPicker.deselectAll();
                        this.view.cmbSparkStyle.menuPicker.deselectAll();
                    } else
                        this.view.cmbSparkStyle.menuPicker.selectRecord(stylesStore.at(selectedIdx));
                } else {
                    var stylearray = [];
                    for (var i=0; i<styles.length-1; i++) {
                        stylearray.push({
                            imageUrl: styles[i],
                            data    : i
                        });
                    }

                    stylesStore.reset(stylearray, {silent: false});
                    this.view.cmbSparkStyle.fillComboView(stylesStore.at(selectedIdx<0 ? 0 : selectedIdx), selectedIdx>-1);
                }
            }
        },

        setApi: function(api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.SetDisabled, this));
                Common.NotificationCenter.on('api:disconnect', _.bind(this.SetDisabled, this));
                this.api.asc_registerCallback('asc_onSelectionChanged',     _.bind(this.onSelectionChanged, this));
                Common.NotificationCenter.on('cells:range',                 _.bind(this.onCellsRange, this));
                Common.NotificationCenter.on('uitheme:changed', _.bind(this.onThemeChanged, this));
            }
            return this;
        },

        setMode: function(mode) {
            this.appConfig = mode;
            return this;
        },

        setConfig: function(config) {
            this.toolbar = config.toolbar;
            this.view = this.createView('SparklineTab', {
                toolbar: config.toolbar.toolbar
            });
        },

        SetDisabled: function(state) {
            this.view && this.view.SetDisabled(state);
        },

        createToolbarPanel: function() {
            return this.view.getPanel();
        },

        getView: function(name) {
            return !name && this.view ?
                this.view : Backbone.Controller.prototype.getView.call(this, name);
        },

        onCoAuthoringDisconnect: function() {
            this.SetDisabled(true);
        },

        onSelectionChanged: function(info) {
            if (this.rangeSelectionMode || !this.appConfig.isEdit || !this.view || !this.toolbar.toolbar.isTabActive('sparklinetab')) return;
            var sparkLineInfo = info.asc_getSparklineInfo();
            if (sparkLineInfo)
                this.ChangeSettings(sparkLineInfo);
        },

        onCellsRange: function(status) {
            this.rangeSelectionMode = (status != Asc.c_oAscSelectionDialogType.None);
        },

        onActiveTab: function(tab) {
            if (tab==='sparklinetab') {
                this.onSelectionChanged(this.api.asc_getCellInfo());
                if (this._themeChanged!==false)
                    this.onThemeChanged();
            }
        },

        onThemeChanged: function() {
            this._themeChanged = !(this.toolbar && this.toolbar.toolbar && this.toolbar.toolbar.isTabActive('sparklinetab'));
            if (!this._themeChanged && this.view) {
                this.view.onThemeChanged();
                this.toolbar.toolbar.onThemeChanged();
            }
        }

    }, SSE.Controllers.SparklineTab || {}));
});