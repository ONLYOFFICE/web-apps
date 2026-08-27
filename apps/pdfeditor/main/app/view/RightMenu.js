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
 *  Created on 20/03/24
 *
 */

var SCALE_MIN = 40;
var MENU_SCALE_PART = 260;
var MENU_BASE_WIDTH = 220;
var PLUGIN_MENU_DEFAULT_WIDTH = 450;

define([
    'text!pdfeditor/main/app/template/RightMenu.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/SideMenu',
    'common/main/lib/component/Button',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/CheckBox',
    'common/main/lib/view/SendForSigningSettings',
    'pdfeditor/main/app/view/ParagraphSettings',
    'pdfeditor/main/app/view/ImageSettings',
    // 'pdfeditor/main/app/view/ChartSettings',
    'pdfeditor/main/app/view/TableSettings',
    'pdfeditor/main/app/view/ShapeSettings',
    'pdfeditor/main/app/view/TextArtSettings',
    'pdfeditor/main/app/view/AnnotationSettings',
    'pdfeditor/main/app/view/FormSettings',
    // 'pdfeditor/main/app/view/SignatureSettings',
    'common/main/lib/component/Scroller',
    'common/main/lib/component/ListView',
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    PDFE.Views.RightMenu = Common.UI.SideMenu.extend(_.extend({
        el: '#right-menu',

        // Compile our stats template
        template: _.template(menuTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        initialize: function () {
            this.minimizedMode = true;

            this.btnText = new Common.UI.Button({
                hint: this.txtParagraphSettings,
                asctype: Common.Utils.documentSettingsType.Paragraph,
                enableToggle: true,
                disabled: true,
                iconCls: 'btn-paragraph',
                toggleGroup: 'tabpanelbtnsGroup',
                allowMouseEventsOnDisabled: true,
                ariaExpanded: true
            });
            this.btnTable = new Common.UI.Button({
                hint: this.txtTableSettings,
                asctype: Common.Utils.documentSettingsType.Table,
                enableToggle: true,
                disabled: true,
                iconCls: 'btn-menu-table',
                toggleGroup: 'tabpanelbtnsGroup',
                allowMouseEventsOnDisabled: true,
                ariaExpanded: true
            });
            this.btnImage = new Common.UI.Button({
                hint: this.txtImageSettings,
                asctype: Common.Utils.documentSettingsType.Image,
                enableToggle: true,
                disabled: true,
                iconCls: 'btn-menu-image',
                toggleGroup: 'tabpanelbtnsGroup',
                allowMouseEventsOnDisabled: true,
                ariaExpanded: true
            });
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
                allowMouseEventsOnDisabled: true,
                ariaExpanded: true
            });

            this.btnTextArt = new Common.UI.Button({
                hint: this.txtTextArtSettings,
                asctype: Common.Utils.documentSettingsType.TextArt,
                enableToggle: true,
                disabled: true,
                iconCls: 'btn-menu-textart',
                toggleGroup: 'tabpanelbtnsGroup',
                allowMouseEventsOnDisabled: true,
                ariaExpanded: true
            });

            this.btnAnnotation = new Common.UI.Button({
                hint: this.txtAnnotationSettings,
                asctype: Common.Utils.documentSettingsType.Annotation,
                enableToggle: true,
                disabled: true,
                iconCls: 'btn-menu-textart',
                toggleGroup: 'tabpanelbtnsGroup',
                allowMouseEventsOnDisabled: true,
                ariaExpanded: true
            });

            this._settings = [];
            this._settings[Common.Utils.documentSettingsType.Paragraph]   = {panel: "id-paragraph-settings",  btn: this.btnText};
            this._settings[Common.Utils.documentSettingsType.Table]       = {panel: "id-table-settings",      btn: this.btnTable};
            this._settings[Common.Utils.documentSettingsType.Image]       = {panel: "id-image-settings",      btn: this.btnImage};
            this._settings[Common.Utils.documentSettingsType.Shape]       = {panel: "id-shape-settings",      btn: this.btnShape};
            // this._settings[Common.Utils.documentSettingsType.Chart]       = {panel: "id-chart-settings",      btn: this.btnChart};
            this._settings[Common.Utils.documentSettingsType.TextArt]     = {panel: "id-textart-settings",    btn: this.btnTextArt};
            this._settings[Common.Utils.documentSettingsType.Annotation]  = {panel: "id-annotation-settings", btn: this.btnAnnotation};

            return this;
        },

        render: function (mode) {
            var el = $(this.el);

            this.trigger('render:before', this);

            this.defaultHideRightMenu = !(mode.customization && (mode.customization.hideRightMenu===false));
            var open = !Common.localStorage.getBool("pdfe-hide-right-settings", this.defaultHideRightMenu);
            Common.Utils.InternalSettings.set("pdfe-hide-right-settings", !open);

            Common.NotificationCenter.on('app:repaint', function() {
                el.css('width', SCALE_MIN + 'px');
            });

            Common.NotificationCenter.on('uitheme:changed', _.bind(function() {
                this.updateWidth();
                Common.NotificationCenter.trigger('layout:changed', 'rightmenu');
            }, this));

            var $markup = $(this.template({scope: this}));
            this.$el.html($markup);

            this.updateWidth();
            el.show();

            this.btnMoreContainer = $('#slot-right-menu-more');
            Common.UI.SideMenu.prototype.render.call(this);
            this.btnMore.menu.menuAlign = 'tr-tl';

            this.btnText.setElement($('#id-right-menu-text'), false);                   this.btnText.render();
            this.btnTable.setElement($('#id-right-menu-table'), false);                 this.btnTable.render();
            this.btnImage.setElement($('#id-right-menu-image'), false);                 this.btnImage.render();
            // this.btnChart.setElement($('#id-right-menu-chart'), false);         this.btnChart.render();
            this.btnShape.setElement($('#id-right-menu-shape'), false);                 this.btnShape.render();
            this.btnTextArt.setElement($('#id-right-menu-textart'), false);             this.btnTextArt.render();
            this.btnAnnotation.setElement($('#id-right-menu-annotation'), false);       this.btnAnnotation.render();

            this.btnText.on('click',            _.bind(this.onBtnMenuClick, this));
            this.btnTable.on('click',           _.bind(this.onBtnMenuClick, this));
            this.btnImage.on('click',           _.bind(this.onBtnMenuClick, this));
            // this.btnChart.on('click',           _.bind(this.onBtnMenuClick, this));
            this.btnShape.on('click',           _.bind(this.onBtnMenuClick, this));
            this.btnTextArt.on('click',         _.bind(this.onBtnMenuClick, this));
            this.btnAnnotation.on('click',         _.bind(this.onBtnMenuClick, this));

            this.paragraphSettings = new PDFE.Views.ParagraphSettings();
            this.imageSettings = new PDFE.Views.ImageSettings();
            // this.chartSettings = new PDFE.Views.ChartSettings();
            this.tableSettings = new PDFE.Views.TableSettings();
            this.shapeSettings = new PDFE.Views.ShapeSettings();
            this.textartSettings = new PDFE.Views.TextArtSettings();
            this.annotationSettings = new PDFE.Views.AnnotationSettings();

            // if (mode && mode.isSignatureSupport) {
            //     this.btnSignature = new Common.UI.Button({
            //         hint: this.txtSignatureSettings,
            //         asctype: Common.Utils.documentSettingsType.Signature,
            //         enableToggle: true,
            //         disabled: true,
            //         iconCls: 'btn-menu-signature',
            //         toggleGroup: 'tabpanelbtnsGroup',
            //         allowMouseEventsOnDisabled: true,
            //         ariaExpanded: true
            //     });
            //     this._settings[Common.Utils.documentSettingsType.Signature]   = {panel: "id-signature-settings",      btn: this.btnSignature};
            //
            //     this.btnSignature.setElement($('#id-right-menu-signature'), false); this.btnSignature.render().setVisible(true);
            //     this.btnSignature.on('click', _.bind(this.onBtnMenuClick, this));
            //     this.signatureSettings = new PDFE.Views.SignatureSettings();
            // }

            if (mode && mode.canFeatureForms) {
                this.btnForm = new Common.UI.Button({
                    hint: this.txtFormSettings,
                    asctype: Common.Utils.documentSettingsType.Form,
                    enableToggle: true,
                    disabled: true,
                    iconCls: 'btn-field',
                    toggleGroup: 'tabpanelbtnsGroup',
                    allowMouseEventsOnDisabled: true,
                    ariaExpanded: true
                });
                this._settings[Common.Utils.documentSettingsType.Form]   = {panel: "id-form-settings", btn: this.btnForm};
                this.btnForm.setElement($('#id-right-menu-form'), false); this.btnForm.render().setVisible(true);
                this.btnForm.on('click', this.onBtnMenuClick.bind(this));
                this.formSettings = new PDFE.Views.FormSettings();
            }

            if (mode && (mode.canStartFilling || mode.canRequestStartFilling) && mode.canSwitchMode &&
                mode.canFeatureForms && !mode.canRequestStartFilling && mode.canRequestUsers
            ) {
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
                            PDFE.getController('RightMenu').onRightMenuHide(null, true);
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
                this.sendForSigningSettings = new Common.Views.SendForSigningSettings({
                    handler: function(state, options) {
                        if(state == 'submit') {
                            me.btnSendForSigning.toggle(false);
                            me.onBtnMenuClick(me.btnSendForSigning);
                            me.disableUIForSendForSigning(false);
                            PDFE.getController('Main').onStartFilling(true, options);
                        } else if(state == 'cancel') {
                            me.btnSendForSigning.toggle(false);
                            me.onBtnMenuClick(me.btnSendForSigning);
                            me.btnSendForSigning.setDisabled(true);
                            me.disableUIForSendForSigning(false);
                        }
                    }
                });
            }

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: $(this.el).find('.right-panel > .content-box'),
                    suppressScrollX: true,
                    useKeyboard: false
                });
            }

            this.trigger('render:after', this);

            return this;
        },

        setApi: function(api) {
            var me = this;
            this.api = api;
            var fire = function() { Common.NotificationCenter.trigger('edit:complete', this); };
            var _isEyedropperStart = function (isStart) {this._isEyedropperStart = isStart;};
            var _updateScroller = function () {me.updateScroller();};
            this.paragraphSettings.setApi(api).on('editcomplete', _.bind( fire, this));
            this.imageSettings.setApi(api).on('editcomplete', _.bind( fire, this));
            // this.chartSettings.setApi(api).on('editcomplete', _.bind( fire, this)).on('updatescroller', _updateScroller);
            this.tableSettings.setApi(api).on('editcomplete', _.bind( fire, this)).on('eyedropper', _.bind(_isEyedropperStart, this));
            this.shapeSettings.setApi(api).on('editcomplete', _.bind( fire, this)).on('eyedropper', _.bind(_isEyedropperStart, this)).on('updatescroller', _updateScroller);
            this.textartSettings.setApi(api).on('editcomplete', _.bind( fire, this)).on('eyedropper', _.bind(_isEyedropperStart, this)).on('updatescroller', _updateScroller);
            this.annotationSettings.setApi(api).on('editcomplete', _.bind( fire, this)).on('eyedropper', _.bind(_isEyedropperStart, this)).on('updatescroller', _updateScroller);
            // if (this.signatureSettings) this.signatureSettings.setApi(api).on('editcomplete', _.bind( fire, this));
            if (this.formSettings) this.formSettings.setApi(api).on('editcomplete', fire).on('updatescroller', _updateScroller);
            if (this.sendForSigningSettings) this.sendForSigningSettings.setApi(api).on('editcomplete', fire).on('updatescroller', _updateScroller);
        },

        setMode: function(mode) {
            this.imageSettings && this.imageSettings.setMode(mode);
            this.shapeSettings && this.shapeSettings.setMode(mode);
            this.formSettings && this.formSettings.setMode(mode);
            // this.chartSettings && this.chartSettings.setMode(mode);
            this.annotationSettings && this.annotationSettings.setMode(mode);
            this.sendForSigningSettings && this.sendForSigningSettings.setMode(mode);
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
                    Common.localStorage.setItem("pdfe-hide-right-settings", 0);
                    Common.Utils.InternalSettings.set("pdfe-hide-right-settings", false);
                }
                target_pane_parent.find('.content-box > .active').removeClass('active');
                target_pane && target_pane.addClass("active");

                this.updateResizable();

                if (this.scroller) {
                    this.scroller.scrollTop(0);
                }
            } else {
                target_pane_parent.css("display", "none" );
                this.minimizedMode = true;
                this.updateResizable();
                Common.localStorage.setItem("pdfe-hide-right-settings", 1);
                Common.Utils.InternalSettings.set("pdfe-hide-right-settings", true);
            }

            btn && !isPlugin && this.fireEvent('rightmenuclick', [this, btn.options.asctype, this.minimizedMode, e]);
        },

        SetActivePane: function(type, open) {
            if (this.minimizedMode && open!==true || this._settings[type]===undefined ) return;

            if (this.minimizedMode) {
                this._settings[type].btn.toggle(true, false);
                this._settings[type].btn.trigger('click', this._settings[type].btn);
            } else {
                var target_pane = $("#" + this._settings[type].panel );
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

                this.updateResizable();
            }
        },

        GetActivePane: function() {
            var active = this.$el.find(".settings-panel.active");
            return (this.minimizedMode || active.length === 0) ? null : active[0].id;
        },

        clearSelection: function() {
            if(this.GetActivePane() == 'id-send-for-signing-settings') return;

            var target_pane = $(".right-panel");
            target_pane.find('.content-box > .active').removeClass('active');
            let btn = this.getPluginButtonPressed();
            if(!btn) {
                this._settings.forEach(function(item){
                    if (item.btn.isActive())
                        btn = item.btn;
                });
            }
            btn && btn.toggle(false, true);
            target_pane.css("display", "none" );
            this.minimizedMode = true;
            this.updateResizable();
            Common.NotificationCenter.trigger('layout:changed', 'rightmenu');
        },

        disableUIForSendForSigning: function(status) {
            if((this._sendForSigningState && this._sendForSigningState.isUIDisabled) == status) return;

            let newDocMode;
            if(status) {
                const header = PDFE.getController('Viewport').getView('Common.Views.Header');
                this._sendForSigningState = {
                    docMode: (header &&
                        header.btnPDFMode &&
                        header.btnPDFMode.options.value) ||
                        'edit',
                    isUIDisabled: true
                }
                newDocMode = 'view';
            } else {
                newDocMode = this._sendForSigningState.docMode;
                this._sendForSigningState.isUIDisabled = false;
            }

            PDFE.getController('LeftMenu').SetDisabled(status);
            PDFE.getController('Main').onPdfModeApply(newDocMode);
            Common.NotificationCenter.trigger('editing:disable', status, {
                header: {docmode: true},
            }, 'view');
            PDFE.getController('Toolbar').DisableToolbar(status);
        },

        updateScroller: function() {
            if (this.scroller) {
                this.scroller.update();
                this.scroller.scrollTop(0);
            }
        },

        setButtons: function () {
            var allButtons = [this.btnShape, this.btnImage, this.btnText, this.btnTable, this.btnTextArt, this.btnChart/*, this.btnSignature*/, this.btnForm, this.btnAnnotation];
            Common.UI.SideMenu.prototype.setButtons.apply(this, [allButtons]);
        },

        insertPanel: function ($panel) {
            this.$el.find('.side-panel .content-box').append($panel);
        },

        setInnerWidth: function(value) {
            const pane = $(this.el).find('.right-panel');
            const paddings = parseInt(pane.css('padding-left')) + parseInt(pane.css('padding-right'));
            MENU_SCALE_PART = value + paddings;
            this.$el.css('width', (this.minimizedMode ? SCALE_MIN : MENU_SCALE_PART) + 'px');
        },

        updateWidth: function() {
            var pane = $(this.el).find('.right-panel'),
                paddings = parseInt(pane.css('padding-left')) + parseInt(pane.css('padding-right'));
            MENU_SCALE_PART = MENU_BASE_WIDTH + paddings;
            if ( !this.isPluginButtonPressed() ) {
                this.$el.css('width', (this.minimizedMode ? SCALE_MIN : MENU_SCALE_PART) + 'px');
            }
        },

        updateResizable: function() {
            const isPlugin = this.isPluginButtonPressed();
            const viewport = PDFE.getController('Viewport').getView('Viewport');
            viewport.hlayout.hideItemResizer('right', this.minimizedMode || !isPlugin);

            if(this.minimizedMode) {
                $(this.el).width(SCALE_MIN);
            } else {
                const widthFromStorage = Common.localStorage.getItem('pdfe-rightmenu-width') || PLUGIN_MENU_DEFAULT_WIDTH;
                const oldWidth = this.$el.width();
                if(isPlugin && widthFromStorage) {
                    this.$el.width(parseInt(widthFromStorage));
                } else {
                    this.setInnerWidth(MENU_BASE_WIDTH);
                }
                if(oldWidth != this.$el.width()) {
                    Common.NotificationCenter.trigger('layout:changed', 'rightmenu');
                }
            }
        },

        txtParagraphSettings:       'Text Settings',
        txtImageSettings:           'Image Settings',
        txtTableSettings:           'Table Settings',
        txtShapeSettings:           'Shape Settings',
        txtTextArtSettings:         'Text Art Settings',
        txtChartSettings:           'Chart Settings',
        txtSignatureSettings:       'Signature Settings',
        ariaRightMenu:              'Right menu',
        txtFormSettings:            'Form Settings',
        txtAnnotationSettings:      'Annotation Settings'
    }, PDFE.Views.RightMenu || {}));
});