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
 *  TableOfContentsSettings.js
 *
 *  Created on 26.12.2017
 *
 */

define([
    'common/main/lib/view/AdvancedSettingsWindow',
], function () { 'use strict';

    DE.Views.TableOfContentsSettings = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 500,
            contentHeight: 375,
            id: 'window-table-contents'
        },

        initialize : function(options) {
            var me = this;

            var height = options.type ? 300 : 375;
            _.extend(this.options, {
                title: options.type ? this.textTitleTOF : this.textTitle,
                contentHeight: height,
                contentStyle: 'padding: 15px 10px;',
                contentTemplate: _.template([
                    '<div class="settings-panel active">',
                        '<div class="inner-content">',
                                '<table cols="2" style="width: 100%;">',
                                    '<tr>',
                                        '<td class="padding-small">',
                                        '<div id="tableofcontents-chb-pages"></div>',
                                        '</td>',
                                        '<td rowspan="5" class="padding-small" style="vertical-align: top;">',
                                        '<div class="canvas-box float-right" style="width: 240px; height: 182px; position:relative; overflow:hidden;">',
                                            '<div id="tableofcontents-img" style="width: 230px; height: 100%;"></div>',
                                        '</div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-small">',
                                            '<div id="tableofcontents-chb-align"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-large">',
                                            '<label class="input-label vertical-align-baseline">' + me.textLeader + '</label>',
                                            '<div id="tableofcontents-combo-leader" class="input-group-nr margin-left-10 vertical-align-baseline" style="display: inline-block; width:95px;"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-large">',
                                            '<div id="tableofcontents-chb-links"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-small">',
                                        '<% if (type == 1) { %>',
                                            '<label class="input-label padding-small" style="display: block;">' + me.textBuildTableOF + '</label>',
                                            '<div id="tableofcontents-radio-caption" class="padding-small" style="display: block;"></div>',
                                            '<div id="tableofcontents-radio-style" class="" style="display: block;"></div>',
                                        '<% } else { %>',
                                            '<label class="input-label padding-small" style="display: block;">' + me.textBuildTable + '</label>',
                                            '<div id="tableofcontents-radio-levels" class="padding-small" style="display: block;"></div>',
                                            '<div id="tableofcontents-radio-styles" class="" style="display: block;"></div>',
                                        '<% } %>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-small" style="vertical-align: top;">',
                                        '<% if (type == 1) { %>',
                                            '<div id="tableofcontents-tof-from-caption" style="width:220px;">',
                                                '<div id="tableofcontents-combo-captions" style="display: inline-block; width:129px; margin-bottom: 10px;"></div>',
                                            '</div>',
                                            '<div id="tableofcontents-tof-from-style" style="width:220px;" class="hidden">',
                                                '<div id="tableofcontents-combo-tof-styles" style="display: inline-block; width:129px; margin-bottom: 10px;"></div>',
                                            '</div>',
                                            '<div id="tableofcontents-chb-full-caption"></div>',
                                        '<% } else { %>',
                                            '<div id="tableofcontents-from-levels" style="width:220px;">',
                                                '<label class="input-label vertical-align-baseline">' + me.textLevels + '</label>',
                                                '<div id="tableofcontents-spin-levels" class="margin-left-10 vertical-align-baseline" style="display: inline-block; width:95px;"></div>',
                                            '</div>',
                                            '<div id="tableofcontents-from-styles" class="hidden">',
                                                '<table>',
                                                    '<tr>',
                                                        '<td>',
                                                            '<div id="tableofcontents-styles-list" class="header-styles-tableview" style="width:100%; height: 143px;"></div>',
                                                        '</td>',
                                                    '</tr>',
                                                '</table>',
                                            '</div>',
                                        '<% } %>',
                                        '</td>',
                                        '<td class="padding-small" style="vertical-align: top;">',
                                            '<label class="input-label margin-left-10 vertical-align-baseline">' + me.textStyles + '</label>',
                                            '<div id="tableofcontents-combo-styles" class="input-group-nr margin-left-10 vertical-align-baseline" style="display: inline-block; width:129px;"></div>',
                                        '</td>',
                                    '</tr>',
                                '</table>',
                            '</div></div>'
                ].join(''))({type: options.type || 0})
            }, options);

            this.api        = options.api;
            this.handler    = options.handler;
            this.props      = options.props;
            this.type       = options.type || 0; // 0 - TOC, 1 - TOF
            this.startLevel = 1;
            this.endLevel = 3;
            this.isInitStylesListHeaders = false;
            this._noApply = true;
            this._originalProps = null;

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.chPages = new Common.UI.CheckBox({
                el: $('#tableofcontents-chb-pages'),
                labelText: this.strShowPages,
                value: 'checked'
            });
            this.chPages.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var checked = (field.getValue()=='checked'),
                    centered = (this.type==1) && (this.cmbStyles.getValue()==Asc.c_oAscTOFStylesType.Centered);
                this.chAlign.setDisabled(!checked || centered);
                this.cmbLeader.setDisabled(!checked || centered);
                if (this.api && !this._noApply) {
                    var properties = (this._originalProps) ? this._originalProps : new Asc.CTableOfContentsPr();
                    properties.put_ShowPageNumbers(checked);
                    if (checked && !centered) {
                        properties.put_RightAlignTab(this.chAlign.getValue() == 'checked');
                        properties.put_TabLeader(this.cmbLeader.getValue());
                    }
                    (this.type==1) ? this.api.SetDrawImagePlaceTableOfFigures('tableofcontents-img', properties) : this.api.SetDrawImagePlaceContents('tableofcontents-img', properties);
                    this.scrollerY.update();
                }
            }, this));

            this.chAlign = new Common.UI.CheckBox({
                el: $('#tableofcontents-chb-align'),
                labelText: this.strAlign,
                value: 'checked'
            });
            this.chAlign.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var checked = (field.getValue()=='checked');
                this.cmbLeader.setDisabled(!checked);
                if (this.api && !this._noApply) {
                    var properties = (this._originalProps) ? this._originalProps : new Asc.CTableOfContentsPr();
                    properties.put_RightAlignTab(checked);
                    if (checked) {
                        properties.put_TabLeader(this.cmbLeader.getValue());
                    }
                    (this.type==1) ? this.api.SetDrawImagePlaceTableOfFigures('tableofcontents-img', properties) : this.api.SetDrawImagePlaceContents('tableofcontents-img', properties);
                    this.scrollerY.update();
                }
            }, this));

            this.cmbLeader = new Common.UI.ComboBoxCustom({
                el          : $('#tableofcontents-combo-leader'),
                style       : 'width: 85px;',
                menuStyle   : 'min-width: 85px;',
                editable    : false,
                takeFocusOnClose: true,
                cls         : 'input-group-nr',
                data        : [
                    { value: Asc.c_oAscTabLeader.None,      cls: '', displayValue: this.textNone },
                    { value: Asc.c_oAscTabLeader.Dot,       cls: 'font-sans-serif', displayValue: '....................' },
                    { value: Asc.c_oAscTabLeader.Hyphen,    cls: 'font-sans-serif', displayValue: '-----------------' },
                    { value: Asc.c_oAscTabLeader.Underscore,cls: 'font-sans-serif', displayValue: '__________' }
                ],
                itemsTemplate: _.template([
                    '<% _.each(items, function(item) { %>',
                    '<li id="<%= item.id %>" data-value="<%- item.value %>" class="<%= item.cls %>"><a tabindex="-1" type="menuitem"><%= scope.getDisplayValue(item) %></a></li>',
                    '<% }); %>',
                ].join('')),
                updateFormControl: function(record) {
                    this._input && this._input.toggleClass('font-sans-serif', record.get('value')!==Asc.c_oAscTabLeader.None);
                }
            });
            this.cmbLeader.setValue(Asc.c_oAscTabLeader.Dot);
            this.cmbLeader.on('selected', _.bind(function(combo, record) {
                if (this.api && !this._noApply) {
                    var properties = (this._originalProps) ? this._originalProps : new Asc.CTableOfContentsPr();
                    properties.put_TabLeader(record.value);
                    (this.type==1) ? this.api.SetDrawImagePlaceTableOfFigures('tableofcontents-img', properties) : this.api.SetDrawImagePlaceContents('tableofcontents-img', properties);
                    this.scrollerY.update();
                }
            }, this));

            this.chLinks = new Common.UI.CheckBox({
                el: $('#tableofcontents-chb-links'),
                labelText: (this.type==1) ? this.strLinksOF : this.strLinks,
                value: 'checked'
            });
            this.chLinks.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                if (this.api && !this._noApply) {
                    var properties = (this._originalProps) ? this._originalProps : new Asc.CTableOfContentsPr();
                    properties.put_Hyperlink(field.getValue()=='checked');
                    (this.type==1) ? this.api.SetDrawImagePlaceTableOfFigures('tableofcontents-img', properties) : this.api.SetDrawImagePlaceContents('tableofcontents-img', properties);
                    this.scrollerY.update();
                }
            }, this));

            if (this.type==1) {
                this.radioCaption = new Common.UI.RadioBox({
                    el: $('#tableofcontents-radio-caption'),
                    labelText: this.textRadioCaption,
                    name: 'asc-radio-content-tof-build',
                    checked: true
                });
                this.radioCaption.on('change', _.bind(function(field, newValue, eOpts) {
                    if (newValue) {
                        this.captionContainer.toggleClass('hidden', !newValue);
                        this.styleContainer.toggleClass('hidden', newValue);
                        this.changeCaption(this.cmbCaptions.getSelectedRecord());
                        this.disableButtons();
                    }
                }, this));

                this.radioStyle = new Common.UI.RadioBox({
                    el: $('#tableofcontents-radio-style'),
                    labelText: this.textRadioStyle,
                    name: 'asc-radio-content-tof-build'
                });
                this.radioStyle.on('change', _.bind(function(field, newValue, eOpts) {
                    if (newValue) {
                        this.styleContainer.toggleClass('hidden', !newValue);
                        this.captionContainer.toggleClass('hidden', newValue);
                        this.changeTOFStyle(this.cmbTOFStyles.getSelectedRecord());
                        this.disableButtons();
                    }
                }, this));

                this.cmbCaptions = new Common.UI.ComboBox({
                    el: $('#tableofcontents-combo-captions'),
                    cls: 'input-group-nr',
                    menuStyle: 'min-width: 100%;max-height: 233px;',
                    editable: false,
                    takeFocusOnClose: true,
                    data: []
                });
                this.cmbCaptions.on('selected', _.bind(function(combo, record) {
                    this.changeCaption(record);
                    this.disableButtons();
                }, this));

                this.cmbTOFStyles = new Common.UI.ComboBox({
                    el: $('#tableofcontents-combo-tof-styles'),
                    cls: 'input-group-nr',
                    menuStyle: 'min-width: 100%;max-height: 233px;',
                    editable: false,
                    takeFocusOnClose: true,
                    data: []
                });
                this.cmbTOFStyles.on('selected', _.bind(function(combo, record) {
                    this.changeTOFStyle(record);
                }, this));

                this.chFullCaption = new Common.UI.CheckBox({
                    el: $('#tableofcontents-chb-full-caption'),
                    labelText: this.strFullCaption,
                    value: 'checked'
                });
                this.chFullCaption.on('change', _.bind(function(field, newValue, oldValue, eOpts){
                    if (this.api && !this._noApply) {
                        var properties = (this._originalProps) ? this._originalProps : new Asc.CTableOfContentsPr();
                        properties.put_IncludeLabelAndNumber(field.getValue()=='checked');
                        this.api.SetDrawImagePlaceTableOfFigures('tableofcontents-img', properties);
                        this.scrollerY.update();
                    }
                }, this));

                this.captionContainer = $('#tableofcontents-tof-from-caption');
                this.styleContainer = $('#tableofcontents-tof-from-style');
            } else {
                this.radioLevels = new Common.UI.RadioBox({
                    el: $('#tableofcontents-radio-levels'),
                    labelText: this.textRadioLevels,
                    name: 'asc-radio-content-build',
                    checked: true
                });
                this.radioLevels.on('change', _.bind(function(field, newValue, eOpts) {
                    if (newValue) {
                        this.levelsContainer.toggleClass('hidden', !newValue);
                        this.stylesContainer.toggleClass('hidden', newValue);
                        if (this._needUpdateOutlineLevels || this._forceUpdateOutlineLevels)
                            this.synchronizeLevelsFromStyles(true);
                    }
                }, this));

                this.radioStyles = new Common.UI.RadioBox({
                    el: $('#tableofcontents-radio-styles'),
                    labelText: this.textRadioStyles,
                    name: 'asc-radio-content-build'
                });
                this.radioStyles.on('change', _.bind(function(field, newValue, eOpts) {
                    if (newValue) {
                        this.stylesContainer.toggleClass('hidden', !newValue);
                        this.levelsContainer.toggleClass('hidden', newValue);

                        if(newValue && !this.isInitStylesListHeaders) {
                            this.initListHeaders();
                            this.stylesList.setOffsetFromHeader(true);
                            this.isInitStylesListHeaders = true;
                        }
                        if (this._needUpdateStyles)
                            this.synchronizeLevelsFromOutline();
                        this.stylesList.scroller.update({alwaysVisibleY: true});
                        setTimeout(function(){
                            var rec = me.stylesLevels.findWhere({checked: true});
                            if (rec)
                                me.stylesList.scrollToRecord(rec);
                        }, 10);
                    }
                }, this));
                this.spnLevels = new Common.UI.CustomSpinner({
                    el: $('#tableofcontents-spin-levels'),
                    step: 1,
                    width: 85,
                    defaultUnit : "",
                    value: this.endLevel,
                    maxValue: 9,
                    minValue: 1,
                    allowDecimal: false,
                    maskExp: /[1-9]/
                });
                this.spnLevels.on('change', _.bind(this.onLevelsChange, this));

                this.stylesLevels = new Common.UI.DataViewStore();

                if (this.stylesLevels) {
                    this.stylesList = new Common.UI.ListView({
                        el: $('#tableofcontents-styles-list', this.$window),
                        store: this.stylesLevels,
                        simpleAddMode: true,
                        showLast: false,
                        tabindex: 1,
                        headers: [
                            {name: me.textStyle, width: 144, style: Common.UI.isRTL() ? 'margin-right: 16px;' : 'margin-left: 16px;'},
                            {name: me.textLevel},
                        ],
                        template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                        itemTemplate: _.template([
                            '<div id="<%= id %>" class="list-item">',
                            '<div class="<% if (checked) { %>checked<% } %>"><%= Common.Utils.String.htmlEncode(displayValue) %></div>',
                            '<div>',
                            '<div class="input-field" style="width:40px;"><input type="text" class="form-control text-align-right" value="<%= value %>" maxLength="1">',
                            '</div>',
                            '</div>',
                            '</div>'
                        ].join(''))
                    });
                    this.stylesList.on('item:change', _.bind(this.onItemChange, this));
                    this.stylesList.on('item:add', _.bind(this.addEvents, this));
                }

                this.levelsContainer = $('#tableofcontents-from-levels');
                this.stylesContainer = $('#tableofcontents-from-styles');
            }

            var arr = (this.type==1) ? [
                { displayValue: this.txtCurrent,     value: Asc.c_oAscTOFStylesType.Current },
                { displayValue: this.txtSimple,     value: Asc.c_oAscTOFStylesType.Simple },
                { displayValue: this.txtOnline,     value: Asc.c_oAscTOFStylesType.Web },
                { displayValue: this.txtClassic,     value: Asc.c_oAscTOFStylesType.Classic },
                { displayValue: this.txtDistinctive,     value: Asc.c_oAscTOFStylesType.Distinctive },
                { displayValue: this.txtCentered,     value: Asc.c_oAscTOFStylesType.Centered },
                { displayValue: this.txtFormal,     value: Asc.c_oAscTOFStylesType.Formal }
            ] : [
                { displayValue: this.txtCurrent,     value: Asc.c_oAscTOCStylesType.Current },
                { displayValue: this.txtSimple,     value: Asc.c_oAscTOCStylesType.Simple },
                { displayValue: this.txtOnline,     value: Asc.c_oAscTOCStylesType.Web },
                { displayValue: this.txtStandard,     value: Asc.c_oAscTOCStylesType.Standard },
                { displayValue: this.txtModern,     value: Asc.c_oAscTOCStylesType.Modern },
                { displayValue: this.txtClassic,     value: Asc.c_oAscTOCStylesType.Classic }
            ];
            this.cmbStyles = new Common.UI.ComboBox({
                el: $('#tableofcontents-combo-styles'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;',
                editable: false,
                takeFocusOnClose: true,
                data: arr
            });
            this.cmbStyles.setValue(this.type==1 ? Asc.c_oAscTOFStylesType.Current : Asc.c_oAscTOCStylesType.Current);
            this.cmbStyles.on('selected', _.bind(function(combo, record) {
                if (this.api && !this._noApply) {
                    var properties = (this._originalProps) ? this._originalProps : new Asc.CTableOfContentsPr();
                    properties.put_StylesType(record.value);
                    if (this.type==1) {
                        var checked = (record.value!==Asc.c_oAscTOFStylesType.Centered);
                        this.chAlign.setValue(checked, true);
                        this.chAlign.setDisabled(!checked);
                        this.cmbLeader.setDisabled(!checked);
                        properties.put_RightAlignTab(checked);
                        checked && properties.put_TabLeader(this.cmbLeader.getValue());
                    }
                    (this.type==1) ? this.api.SetDrawImagePlaceTableOfFigures('tableofcontents-img', properties) : this.api.SetDrawImagePlaceContents('tableofcontents-img', properties);
                    this.scrollerY.update();
                }
            }, this));

            this.scrollerY = new Common.UI.Scroller({
                el: this.$window.find('#tableofcontents-img').parent(),
                minScrollbarLength  : 20
            });
            this.scrollerY.update();
            this.scrollerY.scrollTop(0);

            this.btnOk = _.find(this.getFooterButtons(), function (item) {
                return (item.$el && item.$el.find('.primary').addBack().filter('.primary').length>0);
            }) || new Common.UI.Button({ el: this.$window.find('.primary') });

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [ this.chPages, this.chAlign, this.cmbLeader, this.chLinks, this.radioLevels, this.radioStyles, this.spnLevels, this.stylesList, this.cmbStyles,
                     this.radioCaption, this.radioStyle, this.cmbCaptions, this.cmbTOFStyles, this.chFullCaption].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.chPages;
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        close: function() {
            (this.type==1) ? this.api.SetDrawImagePlaceTableOfFigures(null) : this.api.SetDrawImagePlaceContents(null);
            this.scrollerY.update();
            Common.Views.AdvancedSettingsWindow.prototype.close.apply(this);
        },

        _setDefaults: function (props) {
            this._noApply = true;

            if (props) {
                var value = props.get_Hyperlink();
                this.chLinks.setValue((value !== null && value !== undefined) ? value : 'indeterminate', true);
                value = props.get_StylesType();
                this.cmbStyles.setValue((value!==null) ? value : Asc.c_oAscTOCStylesType.Current);
                value = props.get_ShowPageNumbers();
                this.chPages.setValue((value !== null && value !== undefined) ? value : 'indeterminate');
                if (this.chPages.getValue() == 'checked') {
                    value = props.get_RightAlignTab();
                    this.chAlign.setValue((value !== null && value !== undefined) ? value : 'indeterminate');
                    if (this.chAlign.getValue() == 'checked') {
                        value = props.get_TabLeader();
                        (value!==undefined) && this.cmbLeader.setValue(value);
                    }
                } else {
                    (this.type==1) && (this.cmbStyles.getValue()==Asc.c_oAscTOFStylesType.Centered) && this.chAlign.setValue(false);
                }
            }

            (this.type==1) ? this.fillTOFProps(props) : this.fillTOCProps(props);

            // Show Pages is always true when window is opened
            this._originalProps = (props) ? props : new Asc.CTableOfContentsPr();
            if (!props) {
                if (this.type==1) {
                    this._originalProps.put_Caption(this.textFigure);
                    this._originalProps.put_IncludeLabelAndNumber(this.chFullCaption.getValue() == 'checked');
                } else {
                    this._originalProps.put_OutlineRange(this.startLevel, this.endLevel);
                }
                this._originalProps.put_Hyperlink(this.chLinks.getValue() == 'checked');
                this._originalProps.put_ShowPageNumbers(this.chPages.getValue() == 'checked');
                if (this.chPages.getValue() == 'checked') {
                    this._originalProps.put_RightAlignTab(this.chAlign.getValue() == 'checked');
                    this._originalProps.put_TabLeader(this.cmbLeader.getValue());
                }
            }

            (this.type==1) ? this.api.SetDrawImagePlaceTableOfFigures('tableofcontents-img', this._originalProps) : this.api.SetDrawImagePlaceContents('tableofcontents-img', this._originalProps);
            this.scrollerY.update();

            this._noApply = false;
        },

        initListHeaders: function() {
            var headersArr = this.stylesList.headerEl.find('.table-header-item'),
                widthHeader = this.stylesList.headerEl.width(),
                widthFirstHeader = $(headersArr[0]).width(),
                marginFirstHeader = parseFloat($(headersArr[0]).css('margin-left'));
            
            $(headersArr[0]).addClass('hidden');
            var widthLastHeader = $(headersArr[1]).width();
            $(headersArr[0]).removeClass('hidden');

            if(marginFirstHeader + widthFirstHeader + widthLastHeader > widthHeader) {
                this.stylesList.setHeaderWidth(0, widthHeader - widthLastHeader - marginFirstHeader);
            }
        },

        fillTOCProps: function(props) {
            var me = this,
                docStyles = this.api.asc_GetStylesArray(),
                styles = [],
                checkStyles = false;
            _.each(docStyles, function (style) {
                var name = style.get_Name(),
                    level = me.api.asc_GetHeadingLevel(name);
                if (style.get_QFormat() || level>=0) {
                    styles.push({
                        name: name,
                        displayValue: style.get_TranslatedName(),
                        allowSelected: false,
                        checked: false,
                        value: '',
                        headerLevel: (level>=0) ? level+1 : -1 // -1 if is not header
                    });
                }
            });
            if (props) {
                var start = props.get_OutlineStart(),
                    end = props.get_OutlineEnd(),
                    count = props.get_StylesCount();

                this.startLevel = start;
                this.endLevel = end;

                if ((start<0 || end<0) && count<1) {
                    start = 1;
                    end = 9;
                    this.spnLevels.setValue(end, true);
                }

                var disable_outlines = false;
                for (var i=0; i<count; i++) {
                    var style = props.get_StyleName(i),
                        level = props.get_StyleLevel(i),
                        rec = _.findWhere(styles, {name: style});
                    if (rec) {
                        rec.checked = true;
                        rec.value = level;
                        if (rec.headerLevel !== level)
                            disable_outlines = true;
                    } else {
                        styles.push({
                            name: style,
                            displayValue: style,
                            allowSelected: false,
                            checked: true,
                            value: level,
                            headerLevel: -1
                        });
                        disable_outlines = true;
                    }
                }

                if (start>0 && end>0) {
                    for (var i=start; i<=end; i++) {
                        var rec = _.findWhere(styles, {headerLevel: i});
                        if (rec) {
                            rec.checked = true;
                            rec.value = i;
                        }
                    }
                }
                var new_start = -1, new_end = -1, empty_index = -1;
                for (var i=0; i<9; i++) {
                    var rec = _.findWhere(styles, {headerLevel: i+1});
                    if (rec) {
                        var headerLevel = rec.headerLevel,
                            level = rec.value;
                        if (headerLevel == level) {
                            if (empty_index<1) {
                                if (new_start<1)
                                    new_start = level;
                                new_end = level;
                            } else {
                                new_start = new_end = -1;
                                disable_outlines = true;
                                break;
                            }
                        } else if (!rec.checked) {
                            (new_start>0) && (empty_index = i+1);
                        } else {
                            new_start = new_end = -1;
                            disable_outlines = true;
                            break;
                        }
                    }
                }

                this.spnLevels.setValue(new_end>0 ? new_end : '', true);
                checkStyles = (disable_outlines || new_start>1);
            } else {
                for (var i=this.startLevel; i<=this.endLevel; i++) {
                    var rec = _.findWhere(styles, {headerLevel: i});
                    if (rec) {
                        rec.checked = true;
                        rec.value = i;
                    }
                }
            }
            styles.sort(function(a, b){
                var aname = a.displayValue.toLocaleLowerCase(),
                    bname = b.displayValue.toLocaleLowerCase();
                if (aname < bname) return -1;
                if (aname > bname) return 1;
                return 0;
            });
            this.stylesLevels.reset(styles);
            if (checkStyles) {
                this._forceUpdateOutlineLevels = true;
                this.radioStyles.setValue(true);
                this.stylesList.scroller.update({alwaysVisibleY: true});
                var rec = this.stylesLevels.findWhere({checked: true});
                if (rec)
                    this.stylesList.scrollToRecord(rec);
            }
        },

        fillTOFProps: function(props) {
            var me = this,
                isCaption = true;
            var arr = Common.Utils.InternalSettings.get("de-settings-captions");
            if (arr==null || arr==undefined) {
                arr = Common.localStorage.getItem("de-settings-captions") || '';
                Common.Utils.InternalSettings.set("de-settings-captions", arr);
            }
            arr = arr ? JSON.parse(arr) : [];

            // 0 - not removable
            arr = arr.concat([{ value: this.textEquation, displayValue: this.textEquation },
                { value: this.textFigure, displayValue: this.textFigure },
                { value: this.textTable, displayValue: this.textTable }
            ]);
            arr.sort(function(a,b){
                var sa = a.displayValue.toLowerCase(),
                    sb = b.displayValue.toLowerCase();
                return sa>sb ? 1 : (sa<sb ? -1 : 0);
            });
            arr = [{ value: null, displayValue: this.textNone }].concat(arr);
            this.cmbCaptions.setData(arr);
            var value;
            if (props) {
                isCaption = !!props.get_Caption();
                var rec = this.cmbCaptions.store.findWhere({value: props.get_Caption()});
                rec && (value = rec.get('value'));
            }
            (arr.length>0) && this.cmbCaptions.setValue(value ? value : this.textFigure);

            arr = [];
            _.each(this.api.asc_getAllUsedParagraphStyles(), function (style, index) {
                arr.push({
                    displayValue: style.get_TranslatedName(),
                    styleName: style.get_Name(),
                    value: index
                });
            });
            arr.sort(function(a, b){
                var aname = a.displayValue.toLocaleLowerCase(),
                    bname = b.displayValue.toLocaleLowerCase();
                if (aname < bname) return -1;
                if (aname > bname) return 1;
                return 0;
            });
            this.cmbTOFStyles.setData(arr);
            value = undefined;
            if (props) {
                var count = props.get_StylesCount();
                if (count>0) {
                    var rec = this.cmbTOFStyles.store.findWhere({styleName: props.get_StyleName(0)});
                    rec && (value = rec.get('value'));
                }
            }
            (arr.length>0) && this.cmbTOFStyles.setValue(value ? value : arr[0].value);

            if (props) {
                value = props.get_IncludeLabelAndNumber();
                this.chFullCaption.setValue((value !== null && value !== undefined) ? value : 'indeterminate', true);
            }
            !isCaption && this.radioStyle.setValue(true);
        },

        synchronizeLevelsFromOutline: function() {
            var start = 1, end = this.spnLevels.getNumberValue();
            this.stylesLevels.each(function (style) {
                var header = style.get('headerLevel');
                if (header>=start && header<=end) {
                    style.set('checked', true);
                    style.set('value', header);
                } else {
                    style.set('checked', false);
                    style.set('value', '');
                }
            });
            this._needUpdateStyles = false;
        },

        synchronizeLevelsFromStyles: function(reset) {
            var new_start = -1, new_end = -1, empty_index = -1,
                disable_outlines = false;

            for (var i=0; i<9; i++) {
                var rec = this.stylesLevels.findWhere({headerLevel: i+1});
                if (rec) {
                    var headerLevel = rec.get('headerLevel'),
                        level = rec.get('value');
                    if (headerLevel == level) {
                        if (empty_index<1) {
                            if (new_start<1)
                                new_start = level;
                            new_end = level;
                        } else {
                            new_start = new_end = -1;
                            disable_outlines = true;
                            break;
                        }
                    } else if (!rec.get('checked')) {
                        (new_start>0) && (empty_index = i+1);
                    } else {
                        new_start = new_end = -1;
                        disable_outlines = true;
                        break;
                    }
                }
            }
            if (new_start<0 && new_end<0) {
                var rec = this.stylesLevels.findWhere({checked: true});
                if (rec) { // has checked style
                    disable_outlines = true;
                } else { // all levels are empty
                    new_start = 1;
                    new_end = 9;
                }
            }

            this.startLevel = new_start;
            this.endLevel = new_end;

            this.spnLevels.setValue(new_end>0 ? new_end : (reset ? 9 : ''), true);
            reset && (new_end<=0) && this.onLevelsChange(this.spnLevels);
            this._needUpdateOutlineLevels = false;
            this._forceUpdateOutlineLevels = false;
        },

        getSettings: function () {
            var props = this._originalProps;

            props.put_Hyperlink(this.chLinks.getValue() == 'checked');
            props.put_ShowPageNumbers(this.chPages.getValue() == 'checked');
            if (this.chPages.getValue() == 'checked') {
                props.put_RightAlignTab(this.chAlign.getValue() == 'checked');
                props.put_TabLeader(this.cmbLeader.getValue());
            }
            props.put_StylesType(this.cmbStyles.getValue());

            props.clear_Styles();
            if (this.type==1) {
                if (this.radioCaption.getValue()) {
                    props.put_Caption(this.cmbCaptions.getValue());
                } else {
                    props.put_Caption(null);
                    var rec = this.cmbTOFStyles.getSelectedRecord();
                    rec && props.add_Style(rec.styleName);
                }
            } else {
                if (this._needUpdateOutlineLevels) {
                    this.synchronizeLevelsFromStyles();
                }
                if (!this._needUpdateStyles)  // if this._needUpdateStyles==true - fill only OutlineRange
                    this.stylesLevels.each(function (style) {
                        if (style.get('checked'))
                            props.add_Style(style.get('name'), style.get('value'));
                    });
                props.put_OutlineRange(this.startLevel, this.endLevel);
            }
            return props;
        },

        addEvents: function(listView, itemView, record) {
            var input = itemView.$el.find('input'),
                me = this;
            input.on('keypress', function(e) {
                var charCode = String.fromCharCode(e.which);
                if(!/[1-9]/.test(charCode) && !e.ctrlKey){
                    e.preventDefault();
                    e.stopPropagation();
                }

            });
            input.on('input', function(e) {
                // console.log(input.val());
                var isEmpty = _.isEmpty(input.val());
                if (record.get('checked') !== !isEmpty) {
                    record.set('checked', !isEmpty);
                }
                record.set('value', (isEmpty) ? '' : parseInt(input.val()));
                me._needUpdateOutlineLevels = true;

                if (me.api && !me._noApply) {
                    var properties = (me._originalProps) ? me._originalProps : new Asc.CTableOfContentsPr();
                    properties.clear_Styles();
                    me.stylesLevels.each(function (style) {
                        if (style.get('checked'))
                            properties.add_Style(style.get('name'), style.get('value'));
                    });
                    if (properties.get_StylesCount()>0)
                        properties.put_OutlineRange(-1, -1);
                    else
                        properties.put_OutlineRange(1, 9);
                    me.api.SetDrawImagePlaceContents('tableofcontents-img', properties);
                    me.scrollerY.update();
                }

            });
        },

        onItemChange: function(listView, itemView, record) {
            this.addEvents(listView, itemView, record);
            var inp = itemView.$el.find('input');
            setTimeout(function(){
                inp.focus();
                inp[0].selectionStart = inp[0].selectionEnd = inp[0].value.length;
            }, 10);
        },

        changeCaption: function(record) {
            if (this.api && !this._noApply && record) {
                var properties = (this._originalProps) ? this._originalProps : new Asc.CTableOfContentsPr();
                properties.put_Caption(record.value);
                properties.clear_Styles();
                this.api.SetDrawImagePlaceTableOfFigures('tableofcontents-img', properties);
                this.scrollerY.update();
            }
        },

        changeTOFStyle: function(record) {
            if (this.api && !this._noApply) {
                var properties = (this._originalProps) ? this._originalProps : new Asc.CTableOfContentsPr();
                properties.put_Caption(null);
                properties.clear_Styles();
                properties.add_Style(record.styleName);
                this.api.SetDrawImagePlaceTableOfFigures('tableofcontents-img', properties);
                this.scrollerY.update();
            }
        },

        onLevelsChange: function(field, newValue, oldValue, eOpts){
            this._needUpdateStyles = true;
            this.startLevel = 1;
            this.endLevel = field.getNumberValue();

            if (this.api && !this._noApply) {
                var properties = (this._originalProps) ? this._originalProps : new Asc.CTableOfContentsPr();
                properties.clear_Styles();
                properties.put_OutlineRange(this.startLevel, this.endLevel);
                this.api.SetDrawImagePlaceContents('tableofcontents-img', properties);
                this.scrollerY.update();
            }
        },

        disableButtons: function() {
            this.type && this.btnOk.setDisabled(this.radioCaption.getValue() && this.cmbCaptions.getValue()===null || this.radioStyle.getValue() && this.cmbTOFStyles.length<1);
        },

        onDlgBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        _handleInput: function(state) {
            if (this.handler) {
                if (state == 'ok' && this.btnOk.isDisabled()) {
                    return;
                }
                this.handler.call(this, state, this.getSettings());
            }

            this.close();
        },

        textTitle:  'Table of Contents',
        textLeader: 'Leader',
        textBuildTable: 'Build table of contents from',
        textLevels: 'Levels',
        textStyles: 'Styles',
        strShowPages: 'Show page numbers',
        strAlign: 'Right align page numbers',
        strLinks: 'Format Table of Contents as links',
        textNone: 'None',
        textRadioLevels: 'Outline levels',
        textRadioStyles: 'Selected styles',
        textStyle: 'Style',
        textLevel: 'Level',
        txtCurrent: 'Current',
        txtSimple: 'Simple',
        txtStandard: 'Standard',
        txtModern: 'Modern',
        txtClassic: 'Classic',
        txtOnline: 'Online',
        textTitleTOF: 'Table of Figures',
        textBuildTableOF: 'Build table of figures from',
        textRadioCaption: 'Caption',
        textRadioStyle: 'Style',
        strFullCaption: 'Include label and number',
        textEquation: 'Equation',
        textFigure: 'Figure',
        textTable: 'Table',
        txtDistinctive: 'Distinctive',
        txtCentered: 'Centered',
        txtFormal: 'Formal',
        strLinksOF: 'Format table of figures as links'

    }, DE.Views.TableOfContentsSettings || {}))
});