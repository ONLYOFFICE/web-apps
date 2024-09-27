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
 *  RightMenu.js
 *
 *  Created on 1/17/14
 *
 */

var SCALE_MIN = 40;
var MENU_SCALE_PART = 260;

define([
    'text!documenteditor/main/app/template/RightMenu.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/SideMenu',
    'common/main/lib/component/Button',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/CheckBox',
    'documenteditor/main/app/view/ParagraphSettings',
    'documenteditor/main/app/view/HeaderFooterSettings',
    'documenteditor/main/app/view/ImageSettings',
    'documenteditor/main/app/view/ChartSettings',
    'documenteditor/main/app/view/TableSettings',
    'documenteditor/main/app/view/ShapeSettings',
    'documenteditor/main/app/view/MailMergeSettings',
    'documenteditor/main/app/view/TextArtSettings',
    'documenteditor/main/app/view/SignatureSettings',
    'documenteditor/main/app/view/FormSettings',
    'common/main/lib/component/Scroller',
    'common/main/lib/component/ListView',
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    DE.Views.RightMenu = Common.UI.SideMenu.extend(_.extend({
        el: '#right-menu',

        // Compile our stats template
        template: _.template(menuTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        initialize: function () {
            this.minimizedMode = true;
            this.maximizedMode = false;

            this.btnText = new Common.UI.Button({
                hint: this.txtParagraphSettings,
                asctype: Common.Utils.documentSettingsType.Paragraph,
                enableToggle: true,
                disabled: true,
                iconCls: 'btn-paragraph',
                toggleGroup: 'tabpanelbtnsGroup',
                allowMouseEventsOnDisabled: true
            });
            this.btnTable = new Common.UI.Button({
                hint: this.txtTableSettings,
                asctype: Common.Utils.documentSettingsType.Table,
                enableToggle: true,
                disabled: true,
                iconCls: 'btn-menu-table',
                toggleGroup: 'tabpanelbtnsGroup',
                allowMouseEventsOnDisabled: true
            });
            this.btnImage = new Common.UI.Button({
                hint: this.txtImageSettings,
                asctype: Common.Utils.documentSettingsType.Image,
                enableToggle: true,
                disabled: true,
                iconCls: 'btn-menu-image',
                toggleGroup: 'tabpanelbtnsGroup',
                allowMouseEventsOnDisabled: true
            });
            this.btnHeaderFooter = new Common.UI.Button({
                hint: this.txtHeaderFooterSettings,
                asctype: Common.Utils.documentSettingsType.Header,
                enableToggle: true,
                disabled: true,
                iconCls: 'btn-menu-header',
                toggleGroup: 'tabpanelbtnsGroup',
                allowMouseEventsOnDisabled: true
            });
            this.btnChart = new Common.UI.Button({
                hint: this.txtChartSettings,
                asctype: Common.Utils.documentSettingsType.Chart,
                enableToggle: true,
                disabled: true,
                iconCls: 'btn-menu-chart',
                toggleGroup: 'tabpanelbtnsGroup',
                allowMouseEventsOnDisabled: true
            });
            this.btnShape = new Common.UI.Button({
                hint: this.txtShapeSettings,
                asctype: Common.Utils.documentSettingsType.Shape,
                enableToggle: true,
                disabled: true,
                iconCls: 'btn-menu-shape',
                toggleGroup: 'tabpanelbtnsGroup',
                allowMouseEventsOnDisabled: true
            });

            this.btnTextArt = new Common.UI.Button({
                hint: this.txtTextArtSettings,
                asctype: Common.Utils.documentSettingsType.TextArt,
                enableToggle: true,
                disabled: true,
                iconCls: 'btn-menu-textart',
                toggleGroup: 'tabpanelbtnsGroup',
                allowMouseEventsOnDisabled: true
            });

            this._settings = [];
            this._settings[Common.Utils.documentSettingsType.Paragraph]   = {panel: "id-paragraph-settings",  btn: this.btnText};
            this._settings[Common.Utils.documentSettingsType.Table]       = {panel: "id-table-settings",      btn: this.btnTable};
            this._settings[Common.Utils.documentSettingsType.Image]       = {panel: "id-image-settings",      btn: this.btnImage};
            this._settings[Common.Utils.documentSettingsType.Header]      = {panel: "id-header-settings",     btn: this.btnHeaderFooter};
            this._settings[Common.Utils.documentSettingsType.Shape]       = {panel: "id-shape-settings",      btn: this.btnShape};
            this._settings[Common.Utils.documentSettingsType.Chart]       = {panel: "id-chart-settings",      btn: this.btnChart};
            this._settings[Common.Utils.documentSettingsType.TextArt]     = {panel: "id-textart-settings",    btn: this.btnTextArt};

            return this;
        },

        render: function (mode) {
            this.trigger('render:before', this);

            this.defaultHideRightMenu = !(mode.customization && (mode.customization.hideRightMenu===false));
            var open = !Common.localStorage.getBool("de-hide-right-settings", this.defaultHideRightMenu);
            Common.Utils.InternalSettings.set("de-hide-right-settings", !open);
            this.$el.css('width', ((open) ? MENU_SCALE_PART : SCALE_MIN) + 'px');
            this.$el.show();

            var $markup = $(this.template({scope: this}));
            this.$el.html($markup);

            this.btnMoreContainer = $markup.find('#slot-right-menu-more');
            Common.UI.SideMenu.prototype.render.call(this);
            this.btnMore.menu.menuAlign = 'tr-tl';

            this.btnText.setElement($markup.findById('#id-right-menu-text'), false);           this.btnText.render();
            this.btnTable.setElement($markup.findById('#id-right-menu-table'), false);         this.btnTable.render();
            this.btnImage.setElement($markup.findById('#id-right-menu-image'), false);         this.btnImage.render();
            this.btnHeaderFooter.setElement($markup.findById('#id-right-menu-header'), false); this.btnHeaderFooter.render();
            this.btnChart.setElement($markup.findById('#id-right-menu-chart'), false);         this.btnChart.render();
            this.btnShape.setElement($markup.findById('#id-right-menu-shape'), false);         this.btnShape.render();
            this.btnTextArt.setElement($markup.findById('#id-right-menu-textart'), false);     this.btnTextArt.render();

            this.btnText.on('click',            this.onBtnMenuClick.bind(this));
            this.btnTable.on('click',           this.onBtnMenuClick.bind(this));
            this.btnImage.on('click',           this.onBtnMenuClick.bind(this));
            this.btnHeaderFooter.on('click',    this.onBtnMenuClick.bind(this));
            this.btnChart.on('click',           this.onBtnMenuClick.bind(this));
            this.btnShape.on('click',           this.onBtnMenuClick.bind(this));
            this.btnTextArt.on('click',         this.onBtnMenuClick.bind(this));

            this.paragraphSettings = new DE.Views.ParagraphSettings();
            this.headerSettings = new DE.Views.HeaderFooterSettings();
            this.imageSettings = new DE.Views.ImageSettings();
            this.chartSettings = new DE.Views.ChartSettings();
            this.tableSettings = new DE.Views.TableSettings();
            this.shapeSettings = new DE.Views.ShapeSettings();
            this.textartSettings = new DE.Views.TextArtSettings();

            if (mode && mode.canCoAuthoring && mode.canUseMailMerge) {
                this.btnMailMerge = new Common.UI.Button({
                    hint: this.txtMailMergeSettings,
                    asctype: Common.Utils.documentSettingsType.MailMerge,
                    enableToggle: true,
                    disabled: true,
                    iconCls: 'btn-mailmerge',
                    toggleGroup: 'tabpanelbtnsGroup',
                    allowMouseEventsOnDisabled: true
                });
                this._settings[Common.Utils.documentSettingsType.MailMerge]   = {panel: "id-mail-merge-settings", btn: this.btnMailMerge};
                this.btnMailMerge.setElement($markup.findById('#id-right-menu-mail-merge'), false); this.btnMailMerge.render().setVisible(true);
                this.btnMailMerge.on('click', this.onBtnMenuClick.bind(this));
                this.mergeSettings = new DE.Views.MailMergeSettings();
            }

            if (mode && mode.isSignatureSupport) {
                this.btnSignature = new Common.UI.Button({
                    hint: this.txtSignatureSettings,
                    asctype: Common.Utils.documentSettingsType.Signature,
                    enableToggle: true,
                    disabled: true,
                    iconCls: 'btn-menu-signature',
                    toggleGroup: 'tabpanelbtnsGroup',
                    allowMouseEventsOnDisabled: true
                });
                this._settings[Common.Utils.documentSettingsType.Signature]   = {panel: "id-signature-settings", btn: this.btnSignature};
                this.btnSignature.setElement($markup.findById('#id-right-menu-signature'), false); this.btnSignature.render().setVisible(true);
                this.btnSignature.on('click', this.onBtnMenuClick.bind(this));
                this.signatureSettings = new DE.Views.SignatureSettings();
            }

            if (mode && mode.canFeatureContentControl && mode.canEditContentControl && mode.isFormCreator) {
                this.btnForm = new Common.UI.Button({
                    hint: this.txtFormSettings,
                    asctype: Common.Utils.documentSettingsType.Form,
                    enableToggle: true,
                    disabled: true,
                    iconCls: 'btn-field',
                    toggleGroup: 'tabpanelbtnsGroup',
                    allowMouseEventsOnDisabled: true
                });
                this._settings[Common.Utils.documentSettingsType.Form]   = {panel: "id-form-settings", btn: this.btnForm};
                this.btnForm.setElement($markup.findById('#id-right-menu-form'), false); this.btnForm.render().setVisible(true);
                this.btnForm.on('click', this.onBtnMenuClick.bind(this));
                this.formSettings = new DE.Views.FormSettings();
            }


            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: $(this.el).find('.right-panel'),
                    suppressScrollX: true,
                    useKeyboard: false
                });
            }

            if (open) {
                $markup.findById('#id-paragraph-settings').parent().css("display", "inline-block" );
                $markup.findById('#id-paragraph-settings').addClass("active");
            }

            // this.$el.html($markup);
            this.trigger('render:after', this);

            return this;
        },

        setApi: function(api) {
            var me = this;
            me.api = api;
            var _fire_editcomplete = function() {me.fireEvent('editcomplete', me);};
            var _isEyedropperStart = function (isStart) {this._isEyedropperStart = isStart;};
            var _updateScroller = function () {me.updateScroller();};
            this.paragraphSettings.setApi(api).on('editcomplete', _fire_editcomplete).on('eyedropper', _.bind(_isEyedropperStart, this));
            this.headerSettings.setApi(api).on('editcomplete', _fire_editcomplete);
            this.imageSettings.setApi(api).on('editcomplete', _fire_editcomplete);
            this.chartSettings.setApi(api).on('editcomplete', _fire_editcomplete).on('updatescroller', _updateScroller);
            this.tableSettings.setApi(api).on('editcomplete', _fire_editcomplete).on('eyedropper', _.bind(_isEyedropperStart, this));
            this.shapeSettings.setApi(api).on('editcomplete', _fire_editcomplete).on('eyedropper', _.bind(_isEyedropperStart, this)).on('updatescroller', _updateScroller);
            this.textartSettings.setApi(api).on('editcomplete', _fire_editcomplete).on('eyedropper', _.bind(_isEyedropperStart, this)).on('updatescroller', _updateScroller);
            if (this.mergeSettings) this.mergeSettings.setApi(api).on('editcomplete', _fire_editcomplete);
            if (this.signatureSettings) this.signatureSettings.setApi(api).on('editcomplete', _fire_editcomplete);
            if (this.formSettings) this.formSettings.setApi(api).on('editcomplete', _fire_editcomplete).on('updatescroller', _updateScroller);
        },

        setMode: function(mode) {
            this.mode = mode;
            this.mergeSettings && this.mergeSettings.setMode(mode);
            this.imageSettings && this.imageSettings.setMode(mode);
            this.shapeSettings && this.shapeSettings.setMode(mode);
            this.formSettings && this.formSettings.setMode(mode);
            this.headerSettings && this.headerSettings.setMode(mode);
        },

        onBtnMenuClick: function(btn, e) {
            var isPlugin = btn && btn.options.type === 'plugin',
                target_pane_parent = $(this.el).find('.right-panel'),
                target_pane;
            if (btn && !isPlugin) {
                target_pane = $("#" + this._settings[btn.options.asctype].panel);
            }

            if (btn && btn.pressed) {
                if ( this.minimizedMode ) {
                    $(this.el).width(MENU_SCALE_PART);
                    target_pane_parent.css("display", "inline-block" );
                    this.minimizedMode = false;
                    Common.localStorage.setItem("de-hide-right-settings", 0);
                    Common.Utils.InternalSettings.set("de-hide-right-settings", false);
                }
                target_pane_parent.find('> .active').removeClass('active');
                target_pane && target_pane.addClass("active");

                if (this.scroller) {
                    this.scroller.scrollTop(0);
                }
            } else {
                target_pane_parent.css("display", "none" );
                $(this.el).width(SCALE_MIN);
                this.minimizedMode = true;
                Common.localStorage.setItem("de-hide-right-settings", 1);
                Common.Utils.InternalSettings.set("de-hide-right-settings", true);
            }

            btn && !isPlugin && this.fireEvent('rightmenuclick', [this, btn.options.asctype, this.minimizedMode, e]);
        },

        SetActivePane: function(type, open) {
            if (this.minimizedMode && open!==true || this._settings[type]===undefined ) return;

            if (this.minimizedMode) {
                this._settings[type].btn.toggle(true, false);
                this._settings[type].btn.trigger('click', this._settings[type].btn);
            } else {
                var target_pane = this.$el.find("#" + this._settings[type].panel );
                if ( !target_pane.hasClass('active') ) {
                    target_pane.parent().find('> .active').removeClass('active');
                    target_pane.addClass("active");
                    if (this.scroller) {
                        this.scroller.update();
                        this.scroller.scrollTop(0);
                    }
                }
                if (!this._settings[type].btn.isActive())
                    this._settings[type].btn.toggle(true, false);
            }
        },

        GetActivePane: function() {
            var active = this.$el.find(".settings-panel.active");
            return (this.minimizedMode || active.length === 0) ? null : active[0].id;
        },

        clearSelection: function() {
            if (this.mergeSettings)
                this.mergeSettings.disablePreviewMode();

            var target_pane = $(".right-panel");
            target_pane.find('> .active').removeClass('active');
            this._settings.forEach(function(item){
                if (item.btn.isActive())
                    item.btn.toggle(false, true);
            });
            target_pane.css("display", "none" );
            $(this.el).width(SCALE_MIN);
            this.minimizedMode = true;
            Common.NotificationCenter.trigger('layout:changed', 'rightmenu');
        },

        updateScroller: function() {
            if (this.scroller) {
                this.scroller.update();
                this.scroller.scrollTop(0);
            }
        },

        setButtons: function () {
            var allButtons = [this.btnText, this.btnTable, this.btnImage, this.btnHeaderFooter, this.btnShape, this.btnChart, this.btnTextArt,
                    this.btnMailMerge, this.btnSignature, this.btnForm];
            Common.UI.SideMenu.prototype.setButtons.apply(this, [allButtons]);
        },

        txtParagraphSettings:       'Paragraph Settings',
        txtImageSettings:           'Image Settings',
        txtTableSettings:           'Table Settings',
        txtHeaderFooterSettings:    'Header and Footer Settings',
        txtShapeSettings:           'Shape Settings',
        txtTextArtSettings:         'Text Art Settings',
        txtChartSettings:           'Chart Settings',
        txtMailMergeSettings:       'Mail Merge Settings',
        txtSignatureSettings:       'Signature Settings',
        txtFormSettings:            'Form Settings',
        ariaRightMenu:              'Right menu'
    }, DE.Views.RightMenu || {}));
});