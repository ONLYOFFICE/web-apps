/**
 *  RightMenu.js
 *
 *  Created by Julia Radzhabova on 3/27/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

var SCALE_MIN = 40;
var MENU_SCALE_PART = 260;

define([
    'text!spreadsheeteditor/main/app/template/RightMenu.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/Button',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/CheckBox',
    'spreadsheeteditor/main/app/view/ParagraphSettings',
    'spreadsheeteditor/main/app/view/ImageSettings',
    'spreadsheeteditor/main/app/view/ChartSettings',
    'spreadsheeteditor/main/app/view/ShapeSettings',
    'spreadsheeteditor/main/app/view/TextArtSettings',
    'spreadsheeteditor/main/app/view/TableSettings',
    'common/main/lib/component/Scroller'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    SSE.Views.RightMenu = Backbone.View.extend(_.extend({
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
                toggleGroup: 'tabpanelbtnsGroup'
            });
            this.btnImage = new Common.UI.Button({
                hint: this.txtImageSettings,
                asctype: Common.Utils.documentSettingsType.Image,
                enableToggle: true,
                disabled: true,
                toggleGroup: 'tabpanelbtnsGroup'
            });
            this.btnChart = new Common.UI.Button({
                hint: this.txtChartSettings,
                asctype: Common.Utils.documentSettingsType.Chart,
                enableToggle: true,
                disabled: true,
                toggleGroup: 'tabpanelbtnsGroup'
            });
            this.btnShape = new Common.UI.Button({
                hint: this.txtShapeSettings,
                asctype: Common.Utils.documentSettingsType.Shape,
                enableToggle: true,
                disabled: true,
                toggleGroup: 'tabpanelbtnsGroup'
            });

            this.btnTextArt = new Common.UI.Button({
                hint: this.txtTextArtSettings,
                asctype: Common.Utils.documentSettingsType.TextArt,
                enableToggle: true,
                disabled: true,
                toggleGroup: 'tabpanelbtnsGroup'
            });

            this.btnTable = new Common.UI.Button({
                hint: this.txtTableSettings,
                asctype: Common.Utils.documentSettingsType.Table,
                enableToggle: true,
                disabled: true,
                toggleGroup: 'tabpanelbtnsGroup'
            });

            this._settings = [];
            this._settings[Common.Utils.documentSettingsType.Paragraph]   = {panel: "id-paragraph-settings",  btn: this.btnText};
            this._settings[Common.Utils.documentSettingsType.Image]       = {panel: "id-image-settings",      btn: this.btnImage};
            this._settings[Common.Utils.documentSettingsType.Shape]       = {panel: "id-shape-settings",      btn: this.btnShape};
            this._settings[Common.Utils.documentSettingsType.Chart]       = {panel: "id-chart-settings",      btn: this.btnChart};
            this._settings[Common.Utils.documentSettingsType.TextArt]     = {panel: "id-textart-settings",    btn: this.btnTextArt};
            this._settings[Common.Utils.documentSettingsType.Table]       = {panel: "id-table-settings",      btn: this.btnTable};

            return this;
        },

        render: function () {
            var el = $(this.el);

            this.trigger('render:before', this);

            el.css('width', '40px');
            el.css('z-index', 101);
            el.show();

            el.html(this.template({}));

            this.btnText.el         = $('#id-right-menu-text');     this.btnText.render();
            this.btnImage.el        = $('#id-right-menu-image');    this.btnImage.render();
            this.btnChart.el        = $('#id-right-menu-chart');    this.btnChart.render();
            this.btnShape.el        = $('#id-right-menu-shape');    this.btnShape.render();
            this.btnTextArt.el      = $('#id-right-menu-textart');  this.btnTextArt.render();
            this.btnTable.el        = $('#id-right-menu-table');    this.btnTable.render();

            this.btnText.on('click',            _.bind(this.onBtnMenuClick, this));
            this.btnImage.on('click',           _.bind(this.onBtnMenuClick, this));
            this.btnChart.on('click',           _.bind(this.onBtnMenuClick, this));
            this.btnShape.on('click',           _.bind(this.onBtnMenuClick, this));
            this.btnTextArt.on('click',         _.bind(this.onBtnMenuClick, this));
            this.btnTable.on('click',           _.bind(this.onBtnMenuClick, this));

            this.paragraphSettings = new SSE.Views.ParagraphSettings();
            this.imageSettings = new SSE.Views.ImageSettings();
            this.chartSettings = new SSE.Views.ChartSettings();
            this.shapeSettings = new SSE.Views.ShapeSettings();
            this.textartSettings = new SSE.Views.TextArtSettings();
            this.tableSettings = new SSE.Views.TableSettings();

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: $(this.el).find('.right-panel'),
                    suppressScrollX: true,
                    useKeyboard: false
                });
            }

            this.trigger('render:after', this);

            return this;
        },

        setApi: function(api) {
            this.api = api;
            this.paragraphSettings.setApi(api);
            this.imageSettings.setApi(api);
            this.chartSettings.setApi(api);
            this.shapeSettings.setApi(api);
            this.textartSettings.setApi(api);
            this.tableSettings.setApi(api);
        },

        setMode: function(mode) {

        },

        onBtnMenuClick: function(btn, e) {
            var target_pane = $("#" + this._settings[btn.options.asctype].panel);
            var target_pane_parent = target_pane.parent();

            if (btn.pressed) {
                if ( this.minimizedMode ) {
                    $(this.el).width(MENU_SCALE_PART);
                    target_pane_parent.css("display", "inline-block" );
                    this.minimizedMode = false;
                    Common.localStorage.setItem("sse-hidden-right-settings", 0);
                }
                target_pane_parent.find('> .active').removeClass('active');
                target_pane.addClass("active");

                if (this.scroller) {
                    this.scroller.scrollTop(0);
                }
            } else {
                target_pane_parent.css("display", "none" );
                $(this.el).width(SCALE_MIN);
                this.minimizedMode = true;
                Common.localStorage.setItem("sse-hidden-right-settings", 1);
            }

            this.fireEvent('rightmenuclick', [this, btn.options.asctype, this.minimizedMode]);
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
                    if (this.scroller)
                        this.scroller.update();
                }
                if (!this._settings[type].btn.isActive())
                    this._settings[type].btn.toggle(true, false);
            }
        },

        GetActivePane: function() {
            return (this.minimizedMode) ? null : $(".settings-panel.active")[0].id;
        },

        SetDisabled: function(id, disabled, all) {
            if (all) {
                this.paragraphSettings.disableControls(disabled);
                this.shapeSettings.disableControls(disabled);
                this.imageSettings.disableControls(disabled);
                this.chartSettings.disableControls(disabled);
                this.tableSettings.disableControls(disabled);
            } else {
                var cmp = $("#" + id);
                if (disabled !== cmp.hasClass('disabled')) {
                    cmp.toggleClass('disabled', disabled);
                    (disabled) ? cmp.attr({disabled: disabled}) : cmp.removeAttr('disabled');
                }
            }
        },

        clearSelection: function() {
            var target_pane = $(".right-panel");
            target_pane.find('> .active').removeClass('active');
            _.each(this._settings, function(item){
                if (item.btn.isActive())
                    item.btn.toggle(false, true);
            });
            target_pane.css("display", "none" );
            $(this.el).width(SCALE_MIN);
            this.minimizedMode = true;
            Common.localStorage.setItem("sse-hidden-right-settings", 1);
            Common.NotificationCenter.trigger('layout:changed', 'rightmenu');
        },

        txtParagraphSettings:       'Paragraph Settings',
        txtImageSettings:           'Image Settings',
        txtShapeSettings:           'Shape Settings',
        txtTextArtSettings:         'Text Art Settings',
        txtChartSettings:           'Chart Settings',
        txtTableSettings:           'Table Settings'
    }, SSE.Views.RightMenu || {}));
});