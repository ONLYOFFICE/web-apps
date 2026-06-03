/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/**
 *  RightMenu.js
 *
 *  Created on 1/17/14
 *
 */

var SCALE_MIN = 40;
var MENU_SCALE_PART = 260;
var MENU_BASE_WIDTH = 220;

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
    // 'documenteditor/main/app/view/HeaderFooterSettings',
    'documenteditor/main/app/view/ImageSettings',
    // 'documenteditor/main/app/view/ChartSettings',
    'documenteditor/main/app/view/TableSettings',
    'documenteditor/main/app/view/ShapeSettings',
    'documenteditor/main/app/view/MailMergeSettings',
    'documenteditor/main/app/view/TextArtSettings',
    'documenteditor/main/app/view/SignatureSettings',
    'documenteditor/main/app/view/FormSettings',
    'documenteditor/main/app/view/SendForSigningSettings',
    'documenteditor/main/app/view/FillingStatusSettings',
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
            this._settings = [];
            return this;
        },

        render: function (mode) {
            this.trigger('render:before', this);

            this.defaultHideRightMenu = !(mode.customization && (mode.customization.hideRightMenu===false));
            var open = !Common.localStorage.getBool("de-hide-right-settings", this.defaultHideRightMenu);
            (mode.isPDFForm && !mode.isEdit) && (open = false);
            Common.Utils.InternalSettings.set("de-hide-right-settings", !open);

            Common.NotificationCenter.on('app:repaint', _.bind(function() {
                this.$el.css('width', ((open) ? MENU_SCALE_PART : SCALE_MIN) + 'px');
            }, this));

            Common.NotificationCenter.on('uitheme:changed', _.bind(function() {
                this.updateWidth();
                Common.NotificationCenter.trigger('layout:changed', 'rightmenu');
            }, this));

            var $markup = $(this.template({scope: this}));
            this.$el.html($markup);

            this.updateWidth();
            this.$el.show();

            this.btnMoreContainer = $markup.find('#slot-right-menu-more');
            Common.UI.SideMenu.prototype.render.call(this);
            this.btnMore.menu.menuAlign = 'tr-tl';

            if(mode && mode.isEdit)  {
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

                // this.btnHeaderFooter = new Common.UI.Button({
                //     hint: this.txtHeaderFooterSettings,
                //     asctype: Common.Utils.documentSettingsType.Header,
                //     enableToggle: true,
                //     disabled: true,
                //     iconCls: 'btn-menu-header',
                //     toggleGroup: 'tabpanelbtnsGroup',
                //     allowMouseEventsOnDisabled: true
                // });
                // this.btnChart = new Common.UI.Button({
                //     hint: this.txtChartSettings,
                //     asctype: Common.Utils.documentSettingsType.Chart,
                //     enableToggle: true,
                //     disabled: true,
                //     iconCls: 'btn-menu-chart',
                //     toggleGroup: 'tabpanelbtnsGroup',
                //     allowMouseEventsOnDisabled: true
                // });
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
    
                this._settings[Common.Utils.documentSettingsType.Paragraph]   = {panel: "id-paragraph-settings",  btn: this.btnText};
                this._settings[Common.Utils.documentSettingsType.Table]       = {panel: "id-table-settings",      btn: this.btnTable};
                this._settings[Common.Utils.documentSettingsType.Image]       = {panel: "id-image-settings",      btn: this.btnImage};
                // this._settings[Common.Utils.documentSettingsType.Header]      = {panel: "id-header-settings",     btn: this.btnHeaderFooter};
                this._settings[Common.Utils.documentSettingsType.Shape]       = {panel: "id-shape-settings",      btn: this.btnShape};
                // this._settings[Common.Utils.documentSettingsType.Chart]       = {panel: "id-chart-settings",      btn: this.btnChart};
                this._settings[Common.Utils.documentSettingsType.TextArt]     = {panel: "id-textart-settings",    btn: this.btnTextArt};
                
                this.btnText.setElement($markup.findById('#id-right-menu-text'), false);           this.btnText.render().setVisible(true);
                this.btnTable.setElement($markup.findById('#id-right-menu-table'), false);         this.btnTable.render().setVisible(true);
                this.btnImage.setElement($markup.findById('#id-right-menu-image'), false);         this.btnImage.render().setVisible(true);
                // this.btnHeaderFooter.setElement($markup.findById('#id-right-menu-header'), false); this.btnHeaderFooter.render().setVisible(true);
                // this.btnChart.setElement($markup.findById('#id-right-menu-chart'), false);         this.btnChart.render().setVisible(true);
                this.btnShape.setElement($markup.findById('#id-right-menu-shape'), false);         this.btnShape.render().setVisible(true);
                this.btnTextArt.setElement($markup.findById('#id-right-menu-textart'), false);     this.btnTextArt.render().setVisible(true);
    
                this.btnText.on('click',            this.onBtnMenuClick.bind(this));
                this.btnTable.on('click',           this.onBtnMenuClick.bind(this));
                this.btnImage.on('click',           this.onBtnMenuClick.bind(this));
                // this.btnHeaderFooter.on('click',    this.onBtnMenuClick.bind(this));
                // this.btnChart.on('click',           this.onBtnMenuClick.bind(this));
                this.btnShape.on('click',           this.onBtnMenuClick.bind(this));
                this.btnTextArt.on('click',         this.onBtnMenuClick.bind(this));
    
                this.paragraphSettings = new DE.Views.ParagraphSettings();
                // this.headerSettings = new DE.Views.HeaderFooterSettings();
                this.imageSettings = new DE.Views.ImageSettings();
                // this.chartSettings = new DE.Views.ChartSettings();
                this.tableSettings = new DE.Views.TableSettings();
                this.shapeSettings = new DE.Views.ShapeSettings();
                this.textartSettings = new DE.Views.TextArtSettings();

                if (mode && mode.canCoAuthoring && mode.canUseMailMerge && Common.UI.LayoutManager.isElementVisible('toolbar-collaboration-mailmerge')) {
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
    
                if (mode && (mode.isSignatureSupport || mode.isPDFSignatureSupport)) {
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
    
                if (mode && mode.isPDFForm && !mode.canRequestStartFilling && mode.canRequestUsers) {
                    const me = this;
                    this.btnSendForSigning = new Common.UI.Button({
                        hint: this.txtSendForSigning,
                        asctype: Common.Utils.documentSettingsType.SendForSigning,
                        enableToggle: true,
                        disabled: true,
                        iconCls: 'btn-menu-send-to-sign',
                        toggleGroup: 'tabpanelbtnsGroup',
                        allowMouseEventsOnDisabled: true
                    });
                    this._settings[Common.Utils.documentSettingsType.SendForSigning]   = {panel: "id-send-for-signing-settings", btn: this.btnSendForSigning};
                    this.btnSendForSigning.setElement($markup.findById('#id-right-menu-send-for-signing'), false); 
                    this.btnSendForSigning.render().setVisible(true);
                    this.btnSendForSigning.on('click', function(btn, e, openStatus) {
                        if(!btn) return;

                        if(openStatus === true || btn.pressed) {
                            if(!this.$el.is(':visible')) {
                                DE.getController('RightMenu').onRightMenuHide(null, true);
                            }
                            this.disableUIForSendForSigning(true);
                            const panelType = Common.Utils.documentSettingsType.SendForSigning;
                            this._settings[panelType].btn.setDisabled(false);
                            this._settings[panelType].btn.toggle(true);
                            this.onBtnMenuClick(btn, e);
                        } else {
                            btn.toggle(true);
                            btn.$el.blur();
                        }
                    }.bind(this));
                    this.sendForSigningSettings = new DE.Views.SendForSigningSettings({
                        handler: function(state, options) {
                            if(state == 'submit') {
                                me.disableUIForSendForSigning(false);
                                DE.getController('Main').onStartFilling(true, options);
                            } else if(state == 'cancel') {
                                me.btnSendForSigning.toggle(false);
                                me.onBtnMenuClick(me.btnSendForSigning);
                                me.btnSendForSigning.setDisabled(true);
                                me.disableUIForSendForSigning(false);
                            }
                        }
                    });
                }
            }
            
            if(mode && !mode.isEdit && isPDFForm && !mode.canRequestFillingStatus && 
                (mode.user && mode.user.roles && mode.user.roles.length > 0)
            ) {
                this.btnFillingStatus = new Common.UI.Button({
                    hint: this.txtFillingStatus,
                    asctype: Common.Utils.documentSettingsType.FillingStatus,
                    enableToggle: true,
                    disabled: false,
                    iconCls: 'btn-filling-status',
                    toggleGroup: 'tabpanelbtnsGroup',
                    allowMouseEventsOnDisabled: true
                });
                this._settings[Common.Utils.documentSettingsType.FillingStatus]   = {panel: "id-filling-status-settings", btn: this.btnFillingStatus};
                this.btnFillingStatus.setElement($markup.findById('#id-right-menu-filling-status'), false); 
                this.btnFillingStatus.render().setVisible(true);
                this.btnFillingStatus.on('click', this.onBtnMenuClick.bind(this));
                this.fillingStatusSettings = new DE.Views.FillingStatusSettings();
            }

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: $(this.el).find('.right-panel > .content-box'),
                    suppressScrollX: true,
                    useKeyboard: false
                });
            }

            if (open) {
                $markup.findById('#id-paragraph-settings').closest('.right-panel').css("display", "inline-block" );
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
            if(this.paragraphSettings) this.paragraphSettings.setApi(api).on('editcomplete', _fire_editcomplete).on('eyedropper', _.bind(_isEyedropperStart, this));
            // if(this.headerSettings) this.headerSettings.setApi(api).on('editcomplete', _fire_editcomplete);
            if(this.imageSettings) this.imageSettings.setApi(api).on('editcomplete', _fire_editcomplete);
            // if(this.chartSettings) this.chartSettings.setApi(api).on('editcomplete', _fire_editcomplete).on('updatescroller', _updateScroller);
            if(this.tableSettings) this.tableSettings.setApi(api).on('editcomplete', _fire_editcomplete).on('eyedropper', _.bind(_isEyedropperStart, this));
            if(this.shapeSettings) this.shapeSettings.setApi(api).on('editcomplete', _fire_editcomplete).on('eyedropper', _.bind(_isEyedropperStart, this)).on('updatescroller', _updateScroller);
            if(this.textartSettings) this.textartSettings.setApi(api).on('editcomplete', _fire_editcomplete).on('eyedropper', _.bind(_isEyedropperStart, this)).on('updatescroller', _updateScroller);
            if (this.mergeSettings) this.mergeSettings.setApi(api).on('editcomplete', _fire_editcomplete);
            if (this.signatureSettings) this.signatureSettings.setApi(api).on('editcomplete', _fire_editcomplete);
            if (this.formSettings) this.formSettings.setApi(api).on('editcomplete', _fire_editcomplete).on('updatescroller', _updateScroller);
            if (this.sendForSigningSettings) this.sendForSigningSettings.setApi(api).on('editcomplete', _fire_editcomplete).on('updatescroller', _updateScroller);
            if (this.fillingStatusSettings) this.fillingStatusSettings.setApi(api).on('editcomplete', _fire_editcomplete).on('updatescroller', _updateScroller);
        },

        setMode: function(mode) {
            this.mode = mode;
            this.mergeSettings && this.mergeSettings.setMode(mode);
            this.imageSettings && this.imageSettings.setMode(mode);
            this.shapeSettings && this.shapeSettings.setMode(mode);
            this.formSettings && this.formSettings.setMode(mode);
            // this.chartSettings && this.chartSettings.setMode(mode);
            // this.headerSettings && this.headerSettings.setMode(mode);
            this.signatureSettings && this.signatureSettings.setMode(mode);
            this.sendForSigningSettings && this.sendForSigningSettings.setMode(mode);
            this.fillingStatusSettings && this.fillingStatusSettings.setMode(mode);
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
                target_pane_parent.find('.content-box > .active').removeClass('active');
                target_pane && target_pane.addClass("active");

                const viewport = DE.getController('Viewport').getView('Viewport');
                viewport.hlayout.hideItemResizer('right', !isPlugin);

                const widthFromStorage = Common.localStorage.getItem('de-rightmenu-width');
                if(isPlugin && widthFromStorage) {
                    this.$el.width(parseInt(widthFromStorage));
                } else {
                    this.setInnerWidth(MENU_BASE_WIDTH);
                }
                Common.NotificationCenter.trigger('layout:changed', 'rightmenu');

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

        GetActivePluginPane: function() {
            var active = this.$el.find(".plugin-panel.active");
            return (this.minimizedMode || active.length === 0) ? null : active[0].id;
        },

        getVisibleButtons: function() {
            return this.$el.find('.tool-menu-btns > button:not(.hidden)');
        },

        clearSelection: function() {
            if (this.mergeSettings)
                this.mergeSettings.disablePreviewMode();

            var target_pane = $(".right-panel");
            target_pane.find('.content-box > .active').removeClass('active');
            this._settings.forEach(function(item){
                if (item.btn.isActive())
                    item.btn.toggle(false, true);
            });
            target_pane.css("display", "none" );
            $(this.el).width(SCALE_MIN);
            this.minimizedMode = true;
            Common.NotificationCenter.trigger('layout:changed', 'rightmenu');
        },

        disableUIForSendForSigning: function(status) {
            if((this._sendForSigningState && this._sendForSigningState.isUIDisabled) == status) return;

            let newDocMode;
            if(status) {
                const header = DE.getController('Viewport').getView('Common.Views.Header');
                this._disableUIForSendForSigningState
                this._sendForSigningState = {
                    docMode: (header &&
                        header.btnDocMode &&
                        header.btnDocMode.options.value) ||
                        'edit',
                    isUIDisabled: true
                }
                newDocMode = 'view';
            } else {
                newDocMode = this._sendForSigningState.docMode;
                this._sendForSigningState.isUIDisabled = false;
            }

            DE.getController('LeftMenu').SetDisabled(status);
            DE.getController('Main').onDocModeApply(newDocMode, true, true);
            DE.getController('Toolbar').DisableToolbar(status);
        },

        updateScroller: function() {
            if (this.scroller) {
                this.scroller.update();
                this.scroller.scrollTop(0);
            }
        },

        setButtons: function () {
            var allButtons = [this.btnText, this.btnTable, this.btnImage, this.btnShape, this.btnTextArt,
                    this.btnMailMerge, this.btnSignature, this.btnForm, this.btnSendForSigning, this.btnFillingStatus];
            Common.UI.SideMenu.prototype.setButtons.apply(this, [allButtons]);
        },

        insertPanel: function ($panel) {
            this.$el.find('.side-panel .content-box').append($panel);
        },

        setInnerWidth: function(value) {
            const pane = $(this.el).find('.right-panel');
            const paddings = parseInt(pane.css('padding-left')) + parseInt(pane.css('padding-right'));
            MENU_SCALE_PART = value + paddings;
            this.$el.css('width', (!Common.Utils.InternalSettings.get("de-hide-right-settings") ? MENU_SCALE_PART : SCALE_MIN) + 'px');
        },

        updateWidth: function() {
            var pane = $(this.el).find('.right-panel'),
                paddings = parseInt(pane.css('padding-left')) + parseInt(pane.css('padding-right'));
            MENU_SCALE_PART = MENU_BASE_WIDTH + paddings;
            if ( !this.isPluginButtonPressed() ) {
                this.$el.css('width', (!Common.Utils.InternalSettings.get("de-hide-right-settings") ? MENU_SCALE_PART : SCALE_MIN) + 'px');
            }
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
        txtSendForSigning:          'Send for signing',
        txtFillingStatus:           'Filling status',
        ariaRightMenu:              'Right menu'
    }, DE.Views.RightMenu || {}));
});