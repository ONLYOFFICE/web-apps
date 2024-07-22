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
 *  ParagraphSettingsAdvanced.js
 *
 *  Created on 4/15/14
 *
 */

define([
    'text!presentationeditor/main/app/template/ParagraphSettingsAdvanced.template',
    'common/main/lib/view/AdvancedSettingsWindow',
], function (contentTemplate) {
    'use strict';

    PE.Views.ParagraphSettingsAdvanced = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 370,
            contentHeight: 309,
            toggleGroup: 'paragraph-adv-settings-group',
            storageName: 'pe-para-settings-adv-category'
        },

        initialize : function(options) {
            var me = this;
            _.extend(this.options, {
                title: this.textTitle,
                items: [
                    {panelId: 'id-adv-paragraph-indents', panelCaption: this.strParagraphIndents},
                    {panelId: 'id-adv-paragraph-font',    panelCaption: this.strParagraphFont},
                    {panelId: 'id-adv-paragraph-tabs',    panelCaption: this.strTabs}
                ],
                contentTemplate: _.template(contentTemplate)({
                    scope: this
                })
            }, options);
            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);

            this._changedProps = null;
            this.checkGroup = 0; // 1-strike, 2-sub/super-script, 3-caps
            this._noApply = true;
            this._tabListChanged = false;
            this.spinners = [];
            this.FirstLine = undefined;
            this.Spacing = null;

            this.api = this.options.api;
            this._originalProps = new Asc.asc_CParagraphProperty(this.options.paragraphProps);

            this._arrLineRule = [
                {displayValue: this.textAuto,   defaultValue: 1, value: c_paragraphLinerule.LINERULE_AUTO, minValue: 0.5,    step: 0.01, defaultUnit: ''},
                {displayValue: this.textExact,  defaultValue: 5, value: c_paragraphLinerule.LINERULE_EXACT, minValue: 0.03,   step: 0.01, defaultUnit: 'cm'}
            ];

            var curLineRule = this._originalProps.get_Spacing().get_LineRule(),
                curItem = _.findWhere(this._arrLineRule, {value: curLineRule});
            this.CurLineRuleIdx = this._arrLineRule.indexOf(curItem);

            this._arrTextAlignment = [
                {displayValue: this.textTabLeft, value: c_paragraphTextAlignment.LEFT},
                {displayValue: this.textTabCenter, value: c_paragraphTextAlignment.CENTERED},
                {displayValue: this.textTabRight, value: c_paragraphTextAlignment.RIGHT},
                {displayValue: this.textJustified, value: c_paragraphTextAlignment.JUSTIFIED}
            ];

            this._arrSpecial = [
                {displayValue: this.textNoneSpecial, value: c_paragraphSpecial.NONE_SPECIAL, defaultValue: 0},
                {displayValue: this.textFirstLine, value: c_paragraphSpecial.FIRST_LINE, defaultValue: 12.7},
                {displayValue: this.textHanging, value: c_paragraphSpecial.HANGING, defaultValue: 12.7}
            ];

            this._arrTabAlign = [
                { value: Asc.c_oAscTabType.Left, displayValue: this.textTabLeft },
                { value: Asc.c_oAscTabType.Center, displayValue: this.textTabCenter },
                { value: Asc.c_oAscTabType.Right, displayValue: this.textTabRight }
            ];
            this._arrKeyTabAlign = [];
            this._arrTabAlign.forEach(function(item) {
                me._arrKeyTabAlign[item.value] = item.displayValue;
            });
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            var me = this;

            // Indents & Placement

            this.cmbTextAlignment = new Common.UI.ComboBox({
                el: $('#paragraphadv-spin-text-alignment'),
                cls: 'input-group-nr',
                editable: false,
                data: this._arrTextAlignment,
                style: 'width: 173px;',
                menuStyle   : 'min-width: 173px;',
                takeFocusOnClose: true
            });
            this.cmbTextAlignment.setValue('');

            this.numIndentsLeft = new Common.UI.MetricSpinner({
                el: $('#paragraphadv-spin-indent-left'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                defaultValue : 0,
                value: '0 cm',
                maxValue: 55.87,
                minValue: 0
            });
            this.numIndentsLeft.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var numval = field.getNumberValue();
                if (this._changedProps) {
                    if (this._changedProps.get_Ind()===null || this._changedProps.get_Ind()===undefined)
                        this._changedProps.put_Ind(new Asc.asc_CParagraphInd());
                    this._changedProps.get_Ind().put_Left(Common.Utils.Metric.fnRecalcToMM(numval));
                }
            }, this));
            this.spinners.push(this.numIndentsLeft);

            this.numIndentsRight = new Common.UI.MetricSpinner({
                el: $('#paragraphadv-spin-indent-right'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                defaultValue : 0,
                value: '0 cm',
                maxValue: 55.87,
                minValue: 0
            });
            this.numIndentsRight.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    if (this._changedProps.get_Ind()===null || this._changedProps.get_Ind()===undefined)
                        this._changedProps.put_Ind(new Asc.asc_CParagraphInd());
                    this._changedProps.get_Ind().put_Right(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
            }, this));
            this.spinners.push(this.numIndentsRight);

            this.cmbSpecial = new Common.UI.ComboBox({
                el: $('#paragraphadv-spin-special'),
                cls: 'input-group-nr',
                editable: false,
                data: this._arrSpecial,
                style: 'width: 85px;',
                menuStyle   : 'min-width: 85px;',
                takeFocusOnClose: true
            });
            this.cmbSpecial.setValue('');
            this.cmbSpecial.on('selected', _.bind(this.onSpecialSelect, this));

            this.numSpecialBy = new Common.UI.MetricSpinner({
                el: $('#paragraphadv-spin-special-by'),
                step: .1,
                width: 85,
                defaultUnit : "cm",
                defaultValue : 0,
                value: '0 cm',
                maxValue: 55.87,
                minValue: 0
            });
            this.spinners.push(this.numSpecialBy);
            this.numSpecialBy.on('change', _.bind(this.onFirstLineChange, this));

            this.numSpacingBefore = new Common.UI.MetricSpinner({
                el: $('#paragraphadv-spin-spacing-before'),
                step: .1,
                width: 85,
                value: '',
                defaultUnit : "cm",
                maxValue: 55.88,
                minValue: 0,
                allowAuto   : true,
                autoText    : this.txtAutoText
            });
            this.numSpacingBefore.on('change', _.bind(function (field, newValue, oldValue, eOpts) {
                if (this.Spacing === null) {
                    var properties = (this._originalProps) ? this._originalProps : new Asc.asc_CParagraphProperty();
                    this.Spacing = properties.get_Spacing();
                }
                var value = field.getNumberValue();
                this.Spacing.put_Before(value<0 ? -1 : Common.Utils.Metric.fnRecalcToMM(value));
            }, this));
            this.spinners.push(this.numSpacingBefore);

            this.numSpacingAfter = new Common.UI.MetricSpinner({
                el: $('#paragraphadv-spin-spacing-after'),
                step: .1,
                width: 85,
                value: '',
                defaultUnit : "cm",
                maxValue: 55.88,
                minValue: 0,
                allowAuto   : true,
                autoText    : this.txtAutoText
            });
            this.numSpacingAfter.on('change', _.bind(function (field, newValue, oldValue, eOpts) {
                if (this.Spacing === null) {
                    var properties = (this._originalProps) ? this._originalProps : new Asc.asc_CParagraphProperty();
                    this.Spacing = properties.get_Spacing();
                }
                var value = field.getNumberValue();
                this.Spacing.put_After(value<0 ? -1 : Common.Utils.Metric.fnRecalcToMM(value));
            }, this));
            this.spinners.push(this.numSpacingAfter);

            this.cmbLineRule = new Common.UI.ComboBox({
                el: $('#paragraphadv-spin-line-rule'),
                cls: 'input-group-nr',
                editable: false,
                data: this._arrLineRule,
                style: 'width: 85px;',
                menuStyle   : 'min-width: 85px;',
                takeFocusOnClose: true
            });
            this.cmbLineRule.setValue('');
            this.cmbLineRule.on('selected', _.bind(this.onLineRuleSelect, this));

            this.numLineHeight = new Common.UI.MetricSpinner({
                el: $('#paragraphadv-spin-line-height'),
                step: .01,
                width: 85,
                value: '',
                defaultUnit : "",
                maxValue: 132,
                minValue: 0.5
            });
            this.spinners.push(this.numLineHeight);
            this.numLineHeight.on('change', _.bind(this.onNumLineHeightChange, this));

            // Font

            this.chStrike = new Common.UI.CheckBox({
                el: $('#paragraphadv-checkbox-strike'),
                labelText: this.strStrike
            });
            this.chStrike.on('change', _.bind(this.onStrikeChange, this));

            this.chDoubleStrike = new Common.UI.CheckBox({
                el: $('#paragraphadv-checkbox-double-strike'),
                labelText: this.strDoubleStrike
            });
            this.chDoubleStrike.on('change', _.bind(this.onDoubleStrikeChange, this));

            this.chSuperscript = new Common.UI.CheckBox({
                el: $('#paragraphadv-checkbox-superscript'),
                labelText: this.strSuperscript
            });
            this.chSuperscript.on('change', _.bind(this.onSuperscriptChange, this));

            this.chSubscript = new Common.UI.CheckBox({
                el: $('#paragraphadv-checkbox-subscript'),
                labelText: this.strSubscript
            });
            this.chSubscript.on('change', _.bind(this.onSubscriptChange, this));

            this.chSmallCaps = new Common.UI.CheckBox({
                el: $('#paragraphadv-checkbox-small-caps'),
                labelText: this.strSmallCaps
            });
            this.chSmallCaps.on('change', _.bind(this.onSmallCapsChange, this));

            this.chAllCaps = new Common.UI.CheckBox({
                el: $('#paragraphadv-checkbox-all-caps'),
                labelText: this.strAllCaps
            });
            this.chAllCaps.on('change', _.bind(this.onAllCapsChange, this));

            this.numSpacing = new Common.UI.MetricSpinner({
                el: $('#paragraphadv-spin-spacing'),
                step: .01,
                width: 100,
                defaultUnit : "cm",
                defaultValue : 0,
                value: '0 cm',
                maxValue: 55.87,
                minValue: -55.87
            });
            this.numSpacing.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    this._changedProps.put_TextSpacing(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                }
                if (this.api && !this._noApply) {
                    var properties = (this._originalProps) ? this._originalProps : new Asc.asc_CParagraphProperty();
                    properties.put_TextSpacing(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
                    this.api.SetDrawImagePlaceParagraph('paragraphadv-font-img', properties);
                }
            }, this));
            this.spinners.push(this.numSpacing);

            // Tabs
            this.numTab = new Common.UI.MetricSpinner({
                el: $('#paraadv-spin-tab'),
                step: .1,
                width: 108,
                defaultUnit : "cm",
                value: '1.25 cm',
                maxValue: 55.87,
                minValue: 0
            });
            this.spinners.push(this.numTab);

            this.numDefaultTab = new Common.UI.MetricSpinner({
                el: $('#paraadv-spin-default-tab'),
                step: .1,
                width: 108,
                defaultUnit : "cm",
                value: '1.25 cm',
                maxValue: 55.87,
                minValue: 0
            });
            this.numDefaultTab.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this._changedProps) {
                    this._changedProps.put_DefaultTab(parseFloat(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()).toFixed(1)));
                }
            }, this));
            this.spinners.push(this.numDefaultTab);

            this.tabList = new Common.UI.ListView({
                el: $('#paraadv-list-tabs'),
                emptyText: this.noTabs,
                store: new Common.UI.DataViewStore(),
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="list-item" style="width: 100%;display:inline-block;">',
                    '<div style="width: 117px;display: inline-block;"><%= value %></div>',
                    '<div style="display: inline-block;"><%= displayTabAlign %></div>',
                    '</div>'
                ].join('')),
                tabindex: 1
            });
            this.tabList.store.comparator = function(rec) {
                return rec.get("tabPos");
            };
            this.tabList.on('item:select', _.bind(this.onSelectTab, this));

            var storechanged = function() {
                if (!me._noApply)
                    me._tabListChanged = true;
            };
            this.listenTo(this.tabList.store, 'add',    storechanged);
            this.listenTo(this.tabList.store, 'remove', storechanged);
            this.listenTo(this.tabList.store, 'reset',  storechanged);

            this.cmbAlign = new Common.UI.ComboBox({
                el          : $('#paraadv-cmb-align'),
                style       : 'width: 108px;',
                menuStyle   : 'min-width: 108px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : this._arrTabAlign,
                takeFocusOnClose: true
            });
            this.cmbAlign.setValue(Asc.c_oAscTabType.Left);

            this.btnAddTab = new Common.UI.Button({
                el: $('#paraadv-button-add-tab')
            });
            this.btnAddTab.on('click', _.bind(this.addTab, this));

            this.btnRemoveTab = new Common.UI.Button({
                el: $('#paraadv-button-remove-tab')
            });
            this.btnRemoveTab.on('click', _.bind(this.removeTab, this));

            this.btnRemoveAll = new Common.UI.Button({
                el: $('#paraadv-button-remove-all')
            });
            this.btnRemoveAll.on('click', _.bind(this.removeAllTabs, this));

            this.afterRender();
        },

        getFocusedComponents: function() {
            return this.btnsCategory.concat([
                this.cmbTextAlignment, this.numIndentsLeft, this.numIndentsRight, this.cmbSpecial, this.numSpecialBy,
                this.numSpacingBefore, this.numSpacingAfter, this.cmbLineRule, this.numLineHeight, // 0 tab
                this.chStrike, this.chSubscript, this.chDoubleStrike, this.chSmallCaps, this.chSuperscript, this.chAllCaps, this.numSpacing, // 1 tab
                this.numDefaultTab, this.numTab, this.cmbAlign, this.tabList, this.btnAddTab, this.btnRemoveTab, this.btnRemoveAll // 2 tab
            ]).concat(this.getFooterButtons());
        },

        onCategoryClick: function(btn, index, cmp, e) {
            Common.Views.AdvancedSettingsWindow.prototype.onCategoryClick.call(this, btn, index);

            var me = this;
            setTimeout(function(){
                switch (index) {
                    case 0:
                        me.cmbTextAlignment.focus();
                        break;
                    case 1:
                        me.chStrike.focus();
                        if (e && (e instanceof jQuery.Event))
                            me.api.SetDrawImagePlaceParagraph('paragraphadv-font-img', me._originalProps || new Asc.asc_CParagraphProperty());
                        break;
                    case 2:
                        me.numDefaultTab.focus();
                        break;
                }
            }, 10);
        },

        onAnimateAfter: function() {
            (this.getActiveCategory()==1) && this.api.SetDrawImagePlaceParagraph('paragraphadv-font-img', this._originalProps || new Asc.asc_CParagraphProperty());
        },

        getSettings: function() {
            if ( this._tabListChanged ) {
                if (this._changedProps.get_Tabs()===null || this._changedProps.get_Tabs()===undefined)
                    this._changedProps.put_Tabs(new Asc.asc_CParagraphTabs());
                this.tabList.store.each(function (item, index) {
                    var tab = new Asc.asc_CParagraphTab(Common.Utils.Metric.fnRecalcToMM(item.get('tabPos')), item.get('tabAlign'));
                    this._changedProps.get_Tabs().add_Tab(tab);
                }, this);
            }

            var horizontalAlign = this.cmbTextAlignment.getValue();
            this._changedProps.asc_putJc((horizontalAlign !== undefined && horizontalAlign !== null) ? horizontalAlign : c_paragraphTextAlignment.LEFT);

            if (this.Spacing !== null) {
                this._changedProps.asc_putSpacing(this.Spacing);
            }

            return { paragraphProps: this._changedProps };
        },

        _setDefaults: function(props) {
            if (props ){
                this._originalProps = new Asc.asc_CParagraphProperty(props);
                this.FirstLine = (props.get_Ind() !== null) ? props.get_Ind().get_FirstLine() : null;

                this.numIndentsLeft.setValue((props.get_Ind() !== null && props.get_Ind().get_Left() !== null) ? Common.Utils.Metric.fnRecalcFromMM(props.get_Ind().get_Left()) : '', true);
                this.numIndentsRight.setValue((props.get_Ind() !== null && props.get_Ind().get_Right() !== null) ? Common.Utils.Metric.fnRecalcFromMM(props.get_Ind().get_Right()) : '', true);

                this.cmbTextAlignment.setValue((props.get_Jc() !== undefined && props.get_Jc() !== null) ? props.get_Jc() : c_paragraphTextAlignment.CENTERED, true);

                if(this.CurSpecial === undefined) {
                    this.CurSpecial = (props.get_Ind().get_FirstLine() === 0) ? c_paragraphSpecial.NONE_SPECIAL : ((props.get_Ind().get_FirstLine() > 0) ? c_paragraphSpecial.FIRST_LINE : c_paragraphSpecial.HANGING);
                }
                this.cmbSpecial.setValue(this.CurSpecial);
                this.numSpecialBy.setValue(this.FirstLine!== null ? Math.abs(Common.Utils.Metric.fnRecalcFromMM(this.FirstLine)) : '', true);

                var value = props.get_Spacing() ? props.get_Spacing().get_Before() : null;
                this.numSpacingBefore.setValue((value !== null) ? (value<0 ? value : Common.Utils.Metric.fnRecalcFromMM(value)) : '', true);
                value = props.get_Spacing() ? props.get_Spacing().get_After() : null;
                this.numSpacingAfter.setValue((value !== null) ? (value<0 ? value : Common.Utils.Metric.fnRecalcFromMM(value)) : '', true);

                var linerule = props.get_Spacing().get_LineRule();
                this.cmbLineRule.setValue((linerule !== null) ? linerule : '');

                if(props.get_Spacing() !== null && props.get_Spacing().get_Line() !== null) {
                    this.numLineHeight.setValue((linerule==c_paragraphLinerule.LINERULE_AUTO) ? props.get_Spacing().get_Line() : Common.Utils.Metric.fnRecalcFromMM(props.get_Spacing().get_Line()), true);
                } else {
                    this.numLineHeight.setValue('', true);
                }

                // Font
                this._noApply = true;
                this.chStrike.setValue((props.get_Strikeout() !== null && props.get_Strikeout() !== undefined) ? props.get_Strikeout() : 'indeterminate', true);
                this.chDoubleStrike.setValue((props.get_DStrikeout() !== null && props.get_DStrikeout() !== undefined) ? props.get_DStrikeout() : 'indeterminate', true);
                this.chSubscript.setValue((props.get_Subscript() !== null && props.get_Subscript() !== undefined) ? props.get_Subscript() : 'indeterminate', true);
                this.chSuperscript.setValue((props.get_Superscript() !== null && props.get_Superscript() !== undefined) ? props.get_Superscript() : 'indeterminate', true);
                this.chSmallCaps.setValue((props.get_SmallCaps() !== null && props.get_SmallCaps() !== undefined) ? props.get_SmallCaps() : 'indeterminate', true);
                this.chAllCaps.setValue((props.get_AllCaps() !== null && props.get_AllCaps() !== undefined) ? props.get_AllCaps() : 'indeterminate', true);

                this.numSpacing.setValue((props.get_TextSpacing() !== null && props.get_TextSpacing() !== undefined) ? Common.Utils.Metric.fnRecalcFromMM(props.get_TextSpacing()) : '', true);

                // Tabs
                this.numDefaultTab.setValue((props.get_DefaultTab() !== null && props.get_DefaultTab() !== undefined) ? Common.Utils.Metric.fnRecalcFromMM(parseFloat(props.get_DefaultTab().toFixed(1))) : '', true);

                var store = this.tabList.store;
                var tabs = props.get_Tabs();
                if (tabs) {
                    var arr = [];
                    var count = tabs.get_Count();
                    for (var i=0; i<count; i++) {
                        var tab = tabs.get_Tab(i);
                        var pos = Common.Utils.Metric.fnRecalcFromMM(parseFloat(tab.get_Pos().toFixed(1)));
                        var rec = new Common.UI.DataViewModel();
                        rec.set({
                            tabPos: pos,
                            value: parseFloat(pos.toFixed(3)) + ' ' + Common.Utils.Metric.getCurrentMetricName(),
                            tabAlign: tab.get_Value(),
                            displayTabAlign: this._arrKeyTabAlign[tab.get_Value()]
                        });
                        arr.push(rec);
                    }

                    store.reset(arr, {silent: false});
                    this.tabList.selectByIndex(0);
                }

                this._noApply = false;

                this._changedProps = new Asc.asc_CParagraphProperty();
            }
        },

        updateMetricUnit: function() {
            if (this.spinners) {
                for (var i=0; i<this.spinners.length; i++) {
                    var spinner = this.spinners[i];
                    spinner.setDefaultUnit(Common.Utils.Metric.getCurrentMetricName());
                    if (spinner.el.id == 'paragraphadv-spin-spacing' || spinner.el.id == 'paragraphadv-spin-spacing-before' || spinner.el.id == 'paragraphadv-spin-spacing-after')
                        spinner.setStep(Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.pt ? 1 : 0.01);
                    else
                        spinner.setStep(Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.pt ? 1 : 0.1);
                }
            }
            this._arrLineRule[1].defaultUnit  = Common.Utils.Metric.getCurrentMetricName();
            this._arrLineRule[1].minValue = parseFloat(Common.Utils.Metric.fnRecalcFromMM(0.3).toFixed(2));
            this._arrLineRule[1].step = (Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.pt) ? 1 : 0.01;
            if (this.CurLineRuleIdx !== null) {
                var rec = this._arrLineRule[this.CurLineRuleIdx !== -1 ? this.CurLineRuleIdx : 0];
                this.numLineHeight.setDefaultUnit(rec.defaultUnit);
                this.numLineHeight.setStep(rec.step);
            }
        },

        afterRender: function() {
            this.updateMetricUnit();
            this._setDefaults(this._originalProps);
            if (this.storageName) {
                var value = Common.localStorage.getItem(this.storageName);
                this.setActiveCategory((value!==null) ? parseInt(value) : 0);
            }
        },

        onStrikeChange: function(field, newValue, oldValue, eOpts){
            if (this._changedProps && this.checkGroup!=1) {
                this._changedProps.put_Strikeout(field.getValue()=='checked');
            }
            this.checkGroup = 0;
            if (field.getValue()=='checked') {
                this.checkGroup = 1;
                this.chDoubleStrike.setValue(0);
                if (this._changedProps)
                    this._changedProps.put_DStrikeout(false);
                this.checkGroup = 0;
            }
            if (this.api && !this._noApply) {
                var properties = (this._originalProps) ? this._originalProps : new Asc.asc_CParagraphProperty();
                properties.put_Strikeout(field.getValue()=='checked');
                properties.put_DStrikeout(this.chDoubleStrike.getValue()=='checked');
                this.api.SetDrawImagePlaceParagraph('paragraphadv-font-img', properties);
            }
        },

        onDoubleStrikeChange: function(field, newValue, oldValue, eOpts){
            if (this._changedProps && this.checkGroup!=1) {
                this._changedProps.put_DStrikeout(field.getValue()=='checked');
            }
            this.checkGroup = 0;
            if (field.getValue()=='checked') {
                this.checkGroup = 1;
                this.chStrike.setValue(0);
                if (this._changedProps)
                    this._changedProps.put_Strikeout(false);
                this.checkGroup = 0;
            }
            if (this.api && !this._noApply) {
                var properties = (this._originalProps) ? this._originalProps : new Asc.asc_CParagraphProperty();
                properties.put_DStrikeout(field.getValue()=='checked');
                properties.put_Strikeout(this.chStrike.getValue()=='checked');
                this.api.SetDrawImagePlaceParagraph('paragraphadv-font-img', properties);
            }
        },

        onSuperscriptChange: function(field, newValue, oldValue, eOpts){
            if (this._changedProps && this.checkGroup!=2) {
                this._changedProps.put_Superscript(field.getValue()=='checked');
            }
            this.checkGroup = 0;
            if (field.getValue()=='checked') {
                this.checkGroup = 2;
                this.chSubscript.setValue(0);
                if (this._changedProps)
                    this._changedProps.put_Subscript(false);
                this.checkGroup = 0;
            }
            if (this.api && !this._noApply) {
                var properties = (this._originalProps) ? this._originalProps : new Asc.asc_CParagraphProperty();
                properties.put_Superscript(field.getValue()=='checked');
                properties.put_Subscript(this.chSubscript.getValue()=='checked');
                this.api.SetDrawImagePlaceParagraph('paragraphadv-font-img', properties);
            }
        },

        onSubscriptChange: function(field, newValue, oldValue, eOpts){
            if (this._changedProps && this.checkGroup!=2) {
                this._changedProps.put_Subscript(field.getValue()=='checked');
            }
            this.checkGroup = 0;
            if (field.getValue()=='checked') {
                this.checkGroup = 2;
                this.chSuperscript.setValue(0);
                if (this._changedProps)
                    this._changedProps.put_Superscript(false);
                this.checkGroup = 0;
            }
            if (this.api && !this._noApply) {
                var properties = (this._originalProps) ? this._originalProps : new Asc.asc_CParagraphProperty();
                properties.put_Subscript(field.getValue()=='checked');
                properties.put_Superscript(this.chSuperscript.getValue()=='checked');
                this.api.SetDrawImagePlaceParagraph('paragraphadv-font-img', properties);
            }
        },

        onSmallCapsChange: function(field, newValue, oldValue, eOpts){
            if (this._changedProps && this.checkGroup!=3) {
                this._changedProps.put_SmallCaps(field.getValue()=='checked');
            }
            this.checkGroup = 0;
            if (field.getValue()=='checked') {
                this.checkGroup = 3;
                this.chAllCaps.setValue(0);
                if (this._changedProps)
                    this._changedProps.put_AllCaps(false);
                this.checkGroup = 0;
            }
            if (this.api && !this._noApply) {
                var properties = (this._originalProps) ? this._originalProps : new Asc.asc_CParagraphProperty();
                properties.put_SmallCaps(field.getValue()=='checked');
                properties.put_AllCaps(this.chAllCaps.getValue()=='checked');
                this.api.SetDrawImagePlaceParagraph('paragraphadv-font-img', properties);
            }
        },

        onAllCapsChange: function(field, newValue, oldValue, eOpts){
            if (this._changedProps && this.checkGroup!=3) {
                this._changedProps.put_AllCaps(field.getValue()=='checked');
            }
            this.checkGroup = 0;
            if (field.getValue()=='checked') {
                this.checkGroup = 3;
                this.chSmallCaps.setValue(0);
                if (this._changedProps)
                    this._changedProps.put_SmallCaps(false);
                this.checkGroup = 0;
            }
            if (this.api && !this._noApply) {
                var properties = (this._originalProps) ? this._originalProps : new Asc.asc_CParagraphProperty();
                properties.put_AllCaps(field.getValue()=='checked');
                properties.put_SmallCaps(this.chSmallCaps.getValue()=='checked');
                this.api.SetDrawImagePlaceParagraph('paragraphadv-font-img', properties);
            }
        },

        addTab: function(btn, eOpts){
            var val = this.numTab.getNumberValue(),
                align = this.cmbAlign.getValue(),
                displayAlign = this._arrKeyTabAlign[align];

            var store = this.tabList.store;
            var rec = store.find(function(record){
                return (Math.abs(record.get('tabPos')-val)<0.001);
            });
            if (rec) {
                rec.set('tabAlign', align);
                rec.set('displayTabAlign', displayAlign);
                this._tabListChanged = true;
            } else {
                rec = new Common.UI.DataViewModel();
                rec.set({
                    tabPos: val,
                    value: val + ' ' + Common.Utils.Metric.getCurrentMetricName(),
                    tabAlign: align,
                    displayTabAlign: displayAlign
                });
                store.add(rec);
            }
            this.tabList.selectRecord(rec);
            this.tabList.scrollToRecord(rec);
        },

        removeTab: function(btn, eOpts){
            var rec = this.tabList.getSelectedRec();
            if (rec) {
                var store = this.tabList.store;
                var idx = _.indexOf(store.models, rec);
                store.remove(rec);
                if (idx>store.length-1) idx = store.length-1;
                if (store.length>0) {
                    this.tabList.selectByIndex(idx);
                    this.tabList.scrollToRecord(store.at(idx));
                }
            }
        },

        removeAllTabs: function(btn, eOpts){
            this.tabList.store.reset();
        },

        onSelectTab: function(lisvView, itemView, record) {
            if (!record) return;
            var rawData = {},
                isViewSelect = _.isFunction(record.toJSON);

            if (isViewSelect){
                if (record.get('selected')) {
                    rawData = record.toJSON();
                } else {
                    // record deselected
                    return;
                }
            } else {
                rawData = record;
            }
            this.numTab.setValue(rawData.tabPos);
            this.cmbAlign.setValue(rawData.tabAlign);
        },

        onSpecialSelect: function(combo, record) {
            this.CurSpecial = record.value;
            if (this.CurSpecial === c_paragraphSpecial.NONE_SPECIAL) {
                this.numSpecialBy.setValue(0, true);
            }
            if (this._changedProps) {
                if (this._changedProps.get_Ind()===null || this._changedProps.get_Ind()===undefined)
                    this._changedProps.put_Ind(new Asc.asc_CParagraphInd());
                var value = Common.Utils.Metric.fnRecalcToMM(this.numSpecialBy.getNumberValue());
                if (value === 0) {
                    this.numSpecialBy.setValue(Common.Utils.Metric.fnRecalcFromMM(this._arrSpecial[record.value].defaultValue), true);
                    value = this._arrSpecial[record.value].defaultValue;
                }
                if (this.CurSpecial === c_paragraphSpecial.HANGING) {
                    value = -value;
                }
                this._changedProps.get_Ind().put_FirstLine(value);
            }
        },

        onFirstLineChange: function(field, newValue, oldValue, eOpts){
            if (this._changedProps) {
                if (this._changedProps.get_Ind()===null || this._changedProps.get_Ind()===undefined)
                    this._changedProps.put_Ind(new Asc.asc_CParagraphInd());
                var value = Common.Utils.Metric.fnRecalcToMM(field.getNumberValue());
                if (this.CurSpecial === c_paragraphSpecial.HANGING) {
                    value = -value;
                } else if (this.CurSpecial === c_paragraphSpecial.NONE_SPECIAL && value > 0 )  {
                    this.CurSpecial = c_paragraphSpecial.FIRST_LINE;
                    this.cmbSpecial.setValue(c_paragraphSpecial.FIRST_LINE);
                } else if (value === 0) {
                    this.CurSpecial = c_paragraphSpecial.NONE_SPECIAL;
                    this.cmbSpecial.setValue(c_paragraphSpecial.NONE_SPECIAL);
                }
                this._changedProps.get_Ind().put_FirstLine(value);
            }
        },

        onLineRuleSelect: function(combo, record) {
            if (this.Spacing === null) {
                var properties = (this._originalProps) ? this._originalProps : new Asc.asc_CParagraphProperty();
                this.Spacing = properties.get_Spacing();
            }
            this.Spacing.put_LineRule(record.value);
            var selectItem = _.findWhere(this._arrLineRule, {value: record.value}),
                indexSelectItem = this._arrLineRule.indexOf(selectItem);
            if ( this.CurLineRuleIdx !== indexSelectItem ) {
                this.numLineHeight.setDefaultUnit(this._arrLineRule[indexSelectItem].defaultUnit);
                this.numLineHeight.setMinValue(this._arrLineRule[indexSelectItem].minValue);
                this.numLineHeight.setStep(this._arrLineRule[indexSelectItem].step);
                if (this.Spacing.get_LineRule() === c_paragraphLinerule.LINERULE_AUTO) {
                    this.numLineHeight.setValue(this._arrLineRule[indexSelectItem].defaultValue);
                } else {
                    this.numLineHeight.setValue(Common.Utils.Metric.fnRecalcFromMM(this._arrLineRule[indexSelectItem].defaultValue));
                }
                this.CurLineRuleIdx = indexSelectItem;
            }
        },

        onNumLineHeightChange: function(field, newValue, oldValue, eOpts) {
            if ( this.cmbLineRule.getRawValue() === '' )
                return;
            if (this.Spacing === null) {
                var properties = (this._originalProps) ? this._originalProps : new Asc.asc_CParagraphProperty();
                this.Spacing = properties.get_Spacing();
            }
            this.Spacing.put_Line((this.cmbLineRule.getValue()==c_paragraphLinerule.LINERULE_AUTO) ? field.getNumberValue() : Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
        },

        textTitle:      'Paragraph - Advanced Settings',
        strIndentsLeftText:     'Left',
        strIndentsRightText:    'Right',
        strParagraphIndents:    'Indents & Spacing',
        strParagraphFont:   'Font',
        textEffects: 'Effects',
        textCharacterSpacing: 'Character Spacing',
        strDoubleStrike: 'Double strikethrough',
        strStrike: 'Strikethrough',
        strSuperscript: 'Superscript',
        strSubscript: 'Subscript',
        strSmallCaps: 'Small caps',
        strAllCaps: 'All caps',
        strTabs: 'Tab',
        textSet: 'Specify',
        textRemove: 'Remove',
        textRemoveAll: 'Remove All',
        textTabLeft: 'Left',
        textTabRight: 'Right',
        textTabCenter: 'Center',
        textAlign: 'Alignment',
        textTabPosition: 'Tab Position',
        textDefault: 'Default Tab',
        noTabs: 'The specified tabs will appear in this field',
        textJustified: 'Justified',
        strIndentsSpecial: 'Special',
        textNoneSpecial: '(none)',
        textFirstLine: 'First line',
        textHanging: 'Hanging',
        strIndentsSpacingBefore: 'Before',
        strIndentsSpacingAfter: 'After',
        strIndentsLineSpacing: 'Line Spacing',
        txtAutoText: 'Auto',
        textAuto: 'Multiple',
        textExact: 'Exactly',
        strIndent: 'Indents',
        strSpacing: 'Spacing'
    }, PE.Views.ParagraphSettingsAdvanced || {}));
});