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
 *    FileMenuPanels.js
 *
 *    Contains views for menu 'File'
 *
 *    Created on 11/07/24
 *
 */

define([], function () {
    'use strict';

    !VE.Views.FileMenuPanels && (VE.Views.FileMenuPanels = {});

    VE.Views.FileMenuPanels.ViewSaveAs = Common.UI.BaseView.extend({
        el: '#panel-saveas',
        menu: undefined,

        formats: [[
            {name: 'VSDX',  imgCls: 'vsdx',  type: Asc.c_oAscFileType.VSDX},
            {name: 'PDF',   imgCls: 'pdf',   type: Asc.c_oAscFileType.PDF},
            {name: 'PDFA',  imgCls: 'pdfa',  type: Asc.c_oAscFileType.PDFA}
        ], [
            {name: 'JPG',   imgCls: 'jpg',  type: Asc.c_oAscFileType.JPG},
            {name: 'PNG',   imgCls: 'png',  type: Asc.c_oAscFileType.PNG}
        ]],


        template: _.template([
            '<div class="content-container">',
                '<div class="header"><%= header %></div>',
                '<div class="format-items">',
                    '<% _.each(rows, function(row) { %>',
                        '<% _.each(row, function(item) { %>',
                            '<div class="format-item float-left"><div class="btn-doc-format" format="<%= item.type %>" data-hint="2" data-hint-direction="left-top" data-hint-offset="4, 4">',
                                '<div class ="svg-format-<%= item.imgCls %>"></div>',
                            '</div></div>',
                        '<% }) %>',
                        '<div class="divider"></div>',
                    '<% }) %>',
                '</div>',
            '</div>'
        ].join('')),

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);

            this.menu = options.menu;
            this.fileType = options.fileType;

            Common.NotificationCenter.on({
                'window:resize': _.bind(function() {
                    var divided = Common.Utils.innerWidth() >= this.maxWidth;
                    if (this.isDivided !== divided) {
                        this.$el.find('.divider').css('width', divided ? '100%' : '0');
                        this.isDivided = divided;
                    }
                }, this)
            });
        },

        render: function() {
            this.$el.html(this.template({rows:this.formats,
                fileType: (this.fileType || 'vsdx').toLowerCase(),
                header: /*this.textDownloadAs*/ Common.Locale.get('btnDownloadCaption', {name:'VE.Views.FileMenu', default:this.textDownloadAs})}));
            $('.btn-doc-format',this.el).on('click', _.bind(this.onFormatClick,this));

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: this.$el,
                    suppressScrollX: true,
                    alwaysVisibleY: true
                });
            }

            var itemWidth = 70 + 24, // width + margin
                maxCount = 0;
            this.formats.forEach(_.bind(function (item, index) {
                var count = item.length;
                if (count > maxCount) {
                    maxCount = count;
                }
            }, this));
            this.maxWidth = $('#file-menu-panel .panel-menu').outerWidth() + 20 + 10 + itemWidth * maxCount; // menu + left padding + margin

            if (Common.Utils.innerWidth() >= this.maxWidth) {
                this.$el.find('.divider').css('width', '100%');
                this.isDivided = true;
            }

            return this;
        },

        show: function() {
            Common.UI.BaseView.prototype.show.call(this,arguments);
            this.scroller && this.scroller.update();
        },

        onFormatClick: function(e) {
            var type = e.currentTarget.attributes['format'];
            if (!_.isUndefined(type) && this.menu) {
                this.menu.fireEvent('saveas:format', [this.menu, parseInt(type.value)]);
            }
        },

        textDownloadAs: "Download as"
    });

    VE.Views.FileMenuPanels.ViewSaveCopy = Common.UI.BaseView.extend({
        el: '#panel-savecopy',
        menu: undefined,

        formats: [[
            {name: 'VSDX',  imgCls: 'vsdx',  type: Asc.c_oAscFileType.VSDX, ext: '.vsdx'},
            {name: 'PDF',   imgCls: 'pdf',   type: Asc.c_oAscFileType.PDF, ext: '.pdf'},
            {name: 'PDFA',  imgCls: 'pdfa',  type: Asc.c_oAscFileType.PDFA, ext: '.pdf'}
        ], [
            {name: 'JPG',   imgCls: 'jpg',  type: Asc.c_oAscFileType.JPG, ext: '.zip'},
            {name: 'PNG',   imgCls: 'png',  type: Asc.c_oAscFileType.PNG, ext: '.zip'}
        ]],

        template: _.template([
            '<div class="content-container">',
                '<div class="header"><%= header %></div>',
                '<div class="format-items">',
                    '<% _.each(rows, function(row) { %>',
                        '<% _.each(row, function(item) { %>',
                            '<div class="format-item float-left"><div class="btn-doc-format" format="<%= item.type %>" format-ext="<%= item.ext %>" data-hint="2" data-hint-direction="left-top" data-hint-offset="4, 4">',
                                '<div class ="svg-format-<%= item.imgCls %>"></div>',
                            '</div></div>',
                        '<% }) %>',
                        '<div class="divider"></div>',
                    '<% }) %>',
                '</div>',
            '</div>'
        ].join('')),

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);

            this.menu = options.menu;
            this.fileType = options.fileType;

            Common.NotificationCenter.on({
                'window:resize': _.bind(function() {
                    var divided = Common.Utils.innerWidth() >= this.maxWidth;
                    if (this.isDivided !== divided) {
                        this.$el.find('.divider').css('width', divided ? '100%' : '0');
                        this.isDivided = divided;
                    }
                }, this)
            });
        },

        render: function() {
            this.$el.html(this.template({rows:this.formats,
                fileType: (this.fileType || 'vsdx').toLowerCase(),
                header: /*this.textSaveCopyAs*/ Common.Locale.get('btnSaveCopyAsCaption', {name:'VE.Views.FileMenu', default:this.textSaveCopyAs})}));
            $('.btn-doc-format',this.el).on('click', _.bind(this.onFormatClick,this));

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: this.$el,
                    suppressScrollX: true,
                    alwaysVisibleY: true
                });
            }

            var itemWidth = 70 + 24, // width + margin
                maxCount = 0;
            this.formats.forEach(_.bind(function (item, index) {
                var count = item.length;
                if (count > maxCount) {
                    maxCount = count;
                }
            }, this));
            this.maxWidth = $('#file-menu-panel .panel-menu').outerWidth() + 20 + 10 + itemWidth * maxCount; // menu + left padding + margin

            if (Common.Utils.innerWidth() >= this.maxWidth) {
                this.$el.find('.divider').css('width', '100%');
                this.isDivided = true;
            }

            return this;
        },

        show: function() {
            Common.UI.BaseView.prototype.show.call(this,arguments);
            this.scroller && this.scroller.update();
        },

        onFormatClick: function(e) {
            var type = e.currentTarget.attributes['format'],
                ext = e.currentTarget.attributes['format-ext'];
            if (!_.isUndefined(type) && !_.isUndefined(ext) && this.menu) {
                this.menu.fireEvent('savecopy:format', [this.menu, parseInt(type.value), ext.value]);
            }
        },

        textSaveCopyAs: "Save Copy as"
    });

    VE.Views.FileMenuPanels.Settings = Common.UI.BaseView.extend(_.extend({
        el: '#panel-settings',
        menu: undefined,

        template: _.template([
        '<div class="flex-settings">',
            '<div class="header"><%= scope.txtAdvancedSettings %></div>',
            '<table><tbody>',
                '<tr class="appearance">',
                    '<td colspan="2" class="group-name"><label><%= scope.txtAppearance %></label></td>',
                '</tr>',
                '<tr class="themes">',
                    '<td><label><%= scope.strTheme %></label></td>',
                    '<td><span id="fms-cmb-theme"></span></td>',
                '</tr>',
                '<tr class="tab-style">',
                    '<td><label><%= scope.strTabStyle %></label></td>',
                    '<td><div id="fms-cmb-tab-style"></div></td>',
                '</tr>',
                '<tr class="tab-background">',
                    '<td colspan="2"><div id="fms-chb-tab-background"></div></td>',
                '</tr>',
                '<tr class ="edit divider-group"></tr>',
                '<tr>',
                    '<td colspan="2" class="group-name"><label><%= scope.txtWorkspace %></label></td>',
                    '</tr>',
                '<tr>',
                    '<td colspan="2"><div id="fms-chb-scrn-reader"></div></td>',
                '</tr>',
                '<tr>',
                    '<td colspan="2"><div id="fms-chb-use-alt-key"></div></td>',
                '</tr>',
                '<tr class="edit quick-access">',
                    '<td colspan="2"><button type="button" class="btn btn-text-default" id="fms-btn-customize-quick-access" style="width:auto;display:inline-block;padding-right:10px;padding-left:10px;" data-hint="2" data-hint-direction="bottom" data-hint-offset="medium"><%= scope.txtCustomizeQuickAccess %></button></div></td>',
                '</tr>',
                '<tr>',
                    '<td><label><%= scope.strZoom %></label></td>',
                    '<td><div id="fms-cmb-zoom" class="input-group-nr"></div></td>',
                '</tr>',
                '<tr>',
                    '<td><label><%= scope.strFontRender %></label></td>',
                    '<td><span id="fms-cmb-font-render"></span></td>',
                '</tr>',
                // '<tr>',
                //     '<td><label><%= scope.strKeyboardShortcuts %></label></td>',
                //     '<td colspan="2"><button type="button" class="btn btn-text-default" id="fms-btn-keyboard-shortcuts" style="width:auto; display: inline-block;padding-right: 10px;padding-left: 10px;" data-hint="2" data-hint-direction="bottom" data-hint-offset="medium"><%= scope.txtCustomize %></button></div></td>',
                // '</tr>',
                // '<tr class="macros">',
                //     '<td><label><%= scope.strMacrosSettings %></label></td>',
                //     '<td><div><div id="fms-cmb-macros"></div></div></td>',
                // '</tr>',
                '<tr class ="divider-group"></tr>',
                '<tr class="fms-btn-apply">',
                    '<td style="padding-top:15px; padding-bottom: 15px;"><button class="btn normal dlg-btn primary" data-hint="2" data-hint-direction="bottom" data-hint-offset="medium"><%= scope.okButtonText %></button></td>',
                    '<td></td>',
                '</tr>',
            '</tbody></table>',
        '</div>',
        '<div class="fms-flex-apply hidden">',
            '<table style="margin: 10px 20px;"><tbody>',
                '<tr>',
                    '<td><button class="btn normal dlg-btn primary" data-hint="2" data-hint-direction="bottom" data-hint-offset="big"><%= scope.okButtonText %></button></td>',
                    '<td></td>',
                '</tr>',
            '</tbody></table>',
        '</div>'
        ].join('')),

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);

            this.menu = options.menu;
        },

        render: function(node) {
            var me = this;
            var $markup = $(this.template({scope: this}));


            this.chUseAltKey = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-use-alt-key'),
                labelText: Common.Utils.isMac ? this.txtUseOptionKey : this.txtUseAltKey,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            (Common.Utils.isIE || Common.Utils.isMac && Common.Utils.isGecko) && this.chUseAltKey.$el.parent().parent().hide();

            this.chScreenReader = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-scrn-reader'),
                labelText: this.txtScreenReader,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            this.cmbZoom = new Common.UI.ComboBox({
                el          : $markup.findById('#fms-cmb-zoom'),
                style       : 'width: 160px;',
                editable    : false,
                restoreMenuHeightAndTop: true,
                cls         : 'input-group-nr',
                menuStyle   : 'min-width:100%; max-height: 157px;',
                data        : [
                    { value: -3, displayValue: this.txtLastUsed },
                    { value: -1, displayValue: this.txtFitPage },
                    { value: -2, displayValue: this.txtFitWidth },
                    { value: 50, displayValue: "50%" },
                    { value: 60, displayValue: "60%" },
                    { value: 70, displayValue: "70%" },
                    { value: 80, displayValue: "80%" },
                    { value: 90, displayValue: "90%" },
                    { value: 100, displayValue: "100%" },
                    { value: 110, displayValue: "110%" },
                    { value: 120, displayValue: "120%" },
                    { value: 150, displayValue: "150%" },
                    { value: 175, displayValue: "175%" },
                    { value: 200, displayValue: "200%" },
                    { value: 300, displayValue: "300%" },
                    { value: 400, displayValue: "400%" },
                    { value: 500, displayValue: "500%" }
                ],
                dataHint: '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });

            var itemsTemplate =
                _.template([
                    '<% _.each(items, function(item) { %>',
                    '<li id="<%= item.id %>" data-value="<%= item.value %>" <% if (item.value === "custom") { %> class="border-top" <% } %> ><a tabindex="-1" type="menuitem" <% if (typeof(item.checked) !== "undefined" && item.checked) { %> class="checked" <% } %> ><%= scope.getDisplayValue(item) %></a></li>',
                    '<% }); %>'
                ].join(''));
            this.cmbFontRender = new Common.UI.ComboBox({
                el          : $markup.findById('#fms-cmb-font-render'),
                style       : 'width: 160px;',
                editable    : false,
                restoreMenuHeightAndTop: true,
                menuStyle   : 'min-width:100%;',
                cls         : 'input-group-nr',
                itemsTemplate: itemsTemplate,
                data        : [
                    { value: Asc.c_oAscFontRenderingModeType.hintingAndSubpixeling, displayValue: this.txtWin },
                    { value: Asc.c_oAscFontRenderingModeType.noHinting, displayValue: this.txtMac },
                    { value: Asc.c_oAscFontRenderingModeType.hinting, displayValue: this.txtNative },
                    { value: 'custom', displayValue: this.txtCacheMode }
                ],
                dataHint: '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.cmbFontRender.on('selected', _.bind(this.onFontRenderSelected, this));

            // this.btnKeyboardMacros = new Common.UI.Button({
            //     el: $markup.findById('#fms-btn-keyboard-shortcuts')
            // });
            // this.btnKeyboardMacros.on('click', _.bind(this.onClickKeyboardShortcut, this));

            // this.cmbMacros = new Common.UI.ComboBox({
            //     el          : $markup.findById('#fms-cmb-macros'),
            //     style       : 'width: 160px;',
            //     editable    : false,
            //     restoreMenuHeightAndTop: true,
            //     menuStyle   : 'min-width:100%;',
            //     cls         : 'input-group-nr',
            //     data        : [
            //         { value: 2, displayValue: this.txtStopMacros, descValue: this.txtStopMacrosDesc },
            //         { value: 0, displayValue: this.txtWarnMacros, descValue: this.txtWarnMacrosDesc },
            //         { value: 1, displayValue: this.txtRunMacros, descValue: this.txtRunMacrosDesc }
            //     ],
            //     itemsTemplate: _.template([
            //         '<% _.each(items, function(item) { %>',
            //         '<li id="<%= item.id %>" data-value="<%- item.value %>"><a tabindex="-1" type="menuitem" style ="display: flex; flex-direction: column;">',
            //         '<label class="font-weight-bold"><%= scope.getDisplayValue(item) %></label><label><%= item.descValue %></label></a></li>',
            //         '<% }); %>'
            //     ].join('')),
            //     dataHint: '2',
            //     dataHintDirection: 'bottom',
            //     dataHintOffset: 'big'
            // }).on('selected', function(combo, record) {
            //     me.lblMacrosDesc.text(record.descValue);
            // });
            // this.lblMacrosDesc = $markup.findById('#fms-lbl-macros');

            this.btnCustomizeQuickAccess = new Common.UI.Button({
                el: $markup.findById('#fms-btn-customize-quick-access')
            });
            this.btnCustomizeQuickAccess.on('click', _.bind(this.customizeQuickAccess, this));

            this.cmbTheme = new Common.UI.ComboBox({
                el          : $markup.findById('#fms-cmb-theme'),
                style       : 'width: 160px;',
                editable    : false,
                restoreMenuHeightAndTop: true,
                menuStyle   : 'min-width:100%;',
                cls         : 'input-group-nr',
                dataHint    : '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });

            this.cmbTabStyle = new Common.UI.ComboBox({
                el          : $markup.findById('#fms-cmb-tab-style'),
                style       : 'width: 160px;',
                menuStyle   : 'min-width:100%;',
                editable    : false,
                restoreMenuHeightAndTop: true,
                cls         : 'input-group-nr',
                data        : [
                    {value: 'fill', displayValue: this.textFill},
                    {value: 'line', displayValue: this.textLine}
                ],
                dataHint: '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            }).on('selected', function(combo, record) {
                me._isTabStyleChanged = true;
            });

            this.chTabBack = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-tab-background'),
                labelText: this.txtTabBack,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            $markup.find('.btn.primary').each(function(index, el){
                (new Common.UI.Button({
                    el: $(el)
                })).on('click', _.bind(me.applySettings, me));
            });

            /*this.chQuickPrint = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-quick-print'),
                labelText: '',
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.chQuickPrint.$el.parent().on('click', function (){
                me.chQuickPrint.setValue(!me.chQuickPrint.isChecked());
            });*/

            this.pnlSettings = $markup.find('.flex-settings').addBack().filter('.flex-settings');
            this.pnlApply = $markup.find('.fms-flex-apply').addBack().filter('.fms-flex-apply');
            this.pnlTable = this.pnlSettings.find('table');
            this.trApply = $markup.find('.fms-btn-apply');

            this.$el = $(node).html($markup);

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: this.pnlSettings,
                    suppressScrollX: true,
                    alwaysVisibleY: true
                });
            }

            Common.NotificationCenter.on({
                'window:resize': function() {
                    me.isVisible() && me.updateScroller();
                }
            });

            return this;
        },

        show: function() {
            Common.UI.BaseView.prototype.show.call(this,arguments);

            this.updateSettings();
            this.updateScroller();
        },

        updateScroller: function() {
            if (this.scroller) {
                Common.UI.Menu.Manager.hideAll();
                var scrolled = this.$el.height() < this.pnlTable.parent().height() + 25 + this.pnlApply.height();
                this.pnlApply.toggleClass('hidden', !scrolled);
                this.trApply.toggleClass('hidden', scrolled);
                this.pnlSettings.css('overflow', scrolled ? 'hidden' : 'visible');
                this.scroller.update();
                this.pnlSettings.toggleClass('bordered', this.scroller.isVisible());
                this.cmbZoom.options.menuAlignEl = scrolled ? this.pnlSettings : null;
                this.cmbFontRender.options.menuAlignEl = scrolled ? this.pnlSettings : null;
                this.cmbTheme.options.menuAlignEl = scrolled ? this.pnlSettings : null;
                // this.cmbMacros.options.menuAlignEl = scrolled ? this.pnlSettings : null;
                this.cmbTabStyle.options.menuAlignEl = scrolled ? this.pnlSettings : null;
            }
        },

        setMode: function(mode) {
            this.mode = mode;

            $('tr.edit', this.el)[mode.isEdit?'show':'hide']();
            $('tr.macros', this.el)[(mode.customization && mode.customization.macros===false) ? 'hide' : 'show']();
            $('tr.quick-print', this.el)[mode.canQuickPrint && !(mode.compactHeader && mode.isEdit) ? 'show' : 'hide']();
            $('tr.tab-background', this.el)[!Common.Utils.isIE && Common.UI.FeaturesManager.canChange('tabBackground', true) ? 'show' : 'hide']();
            $('tr.tab-style', this.el)[!Common.Utils.isIE && !Common.Controllers.Desktop.isWinXp() && Common.UI.FeaturesManager.canChange('tabStyle', true) ? 'show' : 'hide']();
            if ( !Common.UI.Themes.available() ) {
                $('tr.themes, tr.themes + tr.divider', this.el).hide();
            }
            $('tr.appearance', this.el)[!Common.Utils.isIE ? 'show' : 'hide']();
            if (mode.compactHeader) {
                $('tr.quick-access', this.el).hide();
            }
        },

        setApi: function(o) {
            this.api = o;
            return this;
        },

        updateSettings: function() {
            this.chUseAltKey.setValue(Common.Utils.InternalSettings.get("ve-settings-show-alt-hints"));
            this.chScreenReader.setValue(Common.Utils.InternalSettings.get("app-settings-screen-reader"));

            var value = Common.Utils.InternalSettings.get("ve-settings-zoom");
            value = (value!==null) ? parseInt(value) : (this.mode.customization && this.mode.customization.zoom ? parseInt(this.mode.customization.zoom) : -1);
            var item = this.cmbZoom.store.findWhere({value: value});
            this.cmbZoom.setValue(item ? parseInt(item.get('value')) : (value>0 ? value+'%' : 100));

            value = Common.Utils.InternalSettings.get("ve-settings-fontrender");
            item = this.cmbFontRender.store.findWhere({value: parseInt(value)});
            this.cmbFontRender.setValue(item ? item.get('value') : Asc.c_oAscFontRenderingModeType.hintingAndSubpixeling);
            this._fontRender = this.cmbFontRender.getValue();

            value = Common.Utils.InternalSettings.get("ve-settings-cachemode");
            item = this.cmbFontRender.store.findWhere({value: 'custom'});
            item && value && item.set('checked', !!value);
            item && value && this.cmbFontRender.cmpEl.find('#' + item.get('id') + ' a').addClass('checked');

            // item = this.cmbMacros.store.findWhere({value: Common.Utils.InternalSettings.get("ve-macros-mode")});
            // this.cmbMacros.setValue(item ? item.get('value') : 0);
            // this.lblMacrosDesc.text(item ? item.get('descValue') : this.txtWarnMacrosDesc);

            var data = [];
            for (var t in Common.UI.Themes.map()) {
                data.push({value: t, displayValue: Common.UI.Themes.get(t).text});
            }

            if ( data.length ) {
                this.cmbTheme.setData(data);
                item = this.cmbTheme.store.findWhere({value: Common.UI.Themes.currentThemeId()});
                this.cmbTheme.setValue(item ? item.get('value') : Common.UI.Themes.defaultThemeId());
            }
            this.chTabBack.setValue(Common.Utils.InternalSettings.get("settings-tab-background")==='toolbar');
            value = Common.Utils.InternalSettings.get("settings-tab-style");
            item = this.cmbTabStyle.store.findWhere({value: value});
            this.cmbTabStyle.setValue(item ? item.get('value') : 'fill');
        },

        applySettings: function() {
            Common.UI.Themes.setTheme(this.cmbTheme.getValue());
            Common.localStorage.setItem("ve-settings-show-alt-hints", this.chUseAltKey.isChecked() ? 1 : 0);
            Common.Utils.InternalSettings.set("ve-settings-show-alt-hints", Common.localStorage.getBool("ve-settings-show-alt-hints"));
            Common.localStorage.setItem("ve-settings-zoom", this.cmbZoom.getValue());
            Common.localStorage.setItem("app-settings-screen-reader", this.chScreenReader.isChecked() ? 1 : 0);
            Common.localStorage.setItem("ve-settings-fontrender", this.cmbFontRender.getValue());
            var item = this.cmbFontRender.store.findWhere({value: 'custom'});
            Common.localStorage.setItem("ve-settings-cachemode", item && !item.get('checked') ? 0 : 1);
            // Common.localStorage.setItem("ve-macros-mode", this.cmbMacros.getValue());
            // Common.Utils.InternalSettings.set("ve-macros-mode", this.cmbMacros.getValue());

            if (!Common.Utils.isIE && Common.UI.FeaturesManager.canChange('tabBackground', true)) {
                Common.UI.TabStyler.setBackground(this.chTabBack.isChecked() ? 'toolbar' : 'header');
            }
            if (!Common.Utils.isIE && Common.UI.FeaturesManager.canChange('tabStyle', true) && this._isTabStyleChanged) {
                Common.UI.TabStyler.setStyle(this.cmbTabStyle.getValue());
                Common.localStorage.setBool("settings-tab-style-newtheme", true); // use tab style from lc for all themes
                this._isTabStyleChanged = false;
            }
            Common.localStorage.save();

            if (this.menu) {
                this.menu.fireEvent('settings:apply', [this.menu]);
            }
        },

        onFontRenderSelected: function(combo, record) {
            if (record.value == 'custom') {
                var item = combo.store.findWhere({value: 'custom'});
                item && item.set('checked', !record.checked);
                combo.cmpEl.find('#' + record.id + ' a').toggleClass('checked', !record.checked);
                combo.setValue(this._fontRender);
            }
            this._fontRender = combo.getValue();
        },

        // onClickKeyboardShortcut: function() {
        //     const win = new Common.Views.ShortcutsDialog({
        //         api: this.api
        //     });
        //     win.show();
        // },

        customizeQuickAccess: function () {
            if (this.dlgQuickAccess && this.dlgQuickAccess.isVisible()) return;
            this.dlgQuickAccess = new Common.Views.CustomizeQuickAccessDialog({
                showSave: this.mode.showSaveButton && Common.UI.LayoutManager.isElementVisible('header-save'),
                showPrint: this.mode.canPrint && this.mode.twoLevelHeader,
                showQuickPrint: this.mode.canQuickPrint && this.mode.twoLevelHeader,
                mode: this.mode,
                props: {
                    print: Common.localStorage.getBool('ve-quick-access-print', true),
                    quickPrint: Common.localStorage.getBool('ve-quick-access-quick-print', true)
                }
            });
            this.dlgQuickAccess.show();
        },

        strZoom: 'Default Zoom Value',
        okButtonText: 'Apply',
        txtFitPage: 'Fit to Page',
        txtWin: 'as Windows',
        txtMac: 'as OS X',
        txtNative: 'Native',
        strFontRender: 'Font Hinting',
        strKeyboardShortcuts: 'Keyboard Shortcuts',
        txtCustomize: 'Customize',
        txtFitWidth: 'Fit to Width',
        txtCacheMode: 'Default cache mode',
        strMacrosSettings: 'Macros Settings',
        txtWarnMacros: 'Show Notification',
        txtRunMacros: 'Enable All',
        txtStopMacros: 'Disable All',
        txtWarnMacrosDesc: 'Disable all macros with notification',
        txtRunMacrosDesc: 'Enable all macros without notification',
        txtStopMacrosDesc: 'Disable all macros without notification',
        strTheme: 'Theme',
        txtThemeLight: 'Light',
        txtThemeDark: 'Dark',
        txtWorkspace: 'Workspace',
        txtUseAltKey: 'Use Alt key to navigate the user interface using the keyboard',
        txtUseOptionKey: 'Use Option key to navigate the user interface using the keyboard',
        txtAdvancedSettings: 'Advanced Settings',
        txtQuickPrint: 'Show the Quick Print button in the editor header',
        txtQuickPrintTip: 'The document will be printed on the last selected or default printer',
        txtLastUsed: 'Last used',
        txtScreenReader: 'Turn on screen reader support',
        txtCustomizeQuickAccess: 'Customize quick access',
        txtTabBack: 'Use toolbar color as tabs background',
        strTabStyle: 'Tab style',
        textFill: 'Fill',
        textLine: 'Line',
        txtAppearance: 'Appearance'
    }, VE.Views.FileMenuPanels.Settings || {}));

    VE.Views.FileMenuPanels.CreateNew = Common.UI.BaseView.extend(_.extend({
        el: '#panel-createnew',
        menu: undefined,

        events: function() {
            return {
                'click .blank-document':_.bind(this._onBlankDocument, this),
                'click .thumb-list .thumb-wrap': _.bind(this._onDocumentTemplate, this)
            };
        },

        template: _.template([
            '<div class="header"><%= scope.txtCreateNew %></div>',
            '<div class="thumb-list">',
                '<% if (blank) { %> ',
                '<div class="blank-document" data-hint="2" data-hint-direction="left-top" data-hint-offset="22, 13">',
                    '<div class="blank-document-btn">',
                        '<div class="btn-blank-format"><div class="svg-format-blank"></div></div>',
                    '</div>',
                    '<div class="title"><%= scope.txtBlank %></div>',
                '</div>',
                '<% } %>',
                '<% _.each(docs, function(item, index) { %>',
                    '<div class="thumb-wrap" template="<%= item.url %>" data-hint="2" data-hint-direction="left-top" data-hint-offset="22, 13">',
                        '<div class="thumb" ',
                        '<%  if (!_.isEmpty(item.image)) {%> ',
                            ' style="background-image: url(<%= item.image %>);">',
                        ' <%} else {' +
                            'print(\"><div class=\'btn-blank-format\'><div class=\'svg-file-template\'></div></div>\")' +
                        ' } %>',
                        '</div>',
                        '<div class="title"><%= Common.Utils.String.htmlEncode(item.title || item.name || "") %></div>',
                    '</div>',
                '<% }) %>',
            '</div>'
        ].join('')),
        
        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);

            this.menu = options.menu;
            this.docs = options.docs;
            this.blank = !!options.blank;
        },

        render: function() {
            this.$el.html(this.template({
                scope: this,
                docs: this.docs,
                blank: this.blank
            }));
            var docs = (this.blank ? [{title: this.txtBlank}] : []).concat(this.docs);
            var thumbsElm= this.$el.find('.thumb-wrap, .blank-document');
            _.each(thumbsElm, function (tmb, index){
                $(tmb).find('.title').tooltip({
                    title       : docs[index].title,
                    placement   : 'cursor'
                });
            });

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: this.$el,
                    suppressScrollX: true,
                    alwaysVisibleY: true
                });
            }

            return this;
        },

        show: function() {
            Common.UI.BaseView.prototype.show.call(this,arguments);
            this.scroller && this.scroller.update();
        },

        _onBlankDocument: function() {
            if ( this.menu )
                this.menu.fireEvent('create:new', [this.menu, 'blank']);
        },

        _onDocumentTemplate: function(e) {
            if ( this.menu )
                this.menu.fireEvent('create:new', [this.menu, e.currentTarget.attributes['template'].value]);
        },

        txtBlank: 'Blank document',
        txtCreateNew: 'Create New'
    }, VE.Views.FileMenuPanels.CreateNew || {}));

    VE.Views.FileMenuPanels.DocumentInfo = Common.UI.BaseView.extend(_.extend({
        el: '#panel-info',
        menu: undefined,

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);
            this.rendered = false;

            this.template = _.template([
                '<table class="main">',
                    '<tbody><td class="header">' + this.txtVisioInfo + '</td></tbody>',
                    '<tbody>',
                        '<tr><td class="title"><label>' + this.txtCommon + '</label></td></tr>',
                        '<tr>',
                            '<td class="left"><label>' + this.txtPlacement + '</label></td>',
                            '<td class="right"><label id="id-info-placement">-</label></td>',
                        '</tr>',
                        '<tr>',
                            '<td class="left"><label>' + this.txtOwner + '</label></td>',
                            '<td class="right"><label id="id-info-owner">-</label></td>',
                        '</tr>',
                        '<tr>',
                            '<td class="left"><label>' + this.txtUploaded + '</label></td>',
                            '<td class="right"><label id="id-info-uploaded">-</label></td>',
                        '</tr>',
                        '<tr></tr>',
                        '<tr>',
                            '<td class="left"><label>' + this.txtModifyDate + '</label></td>',
                            '<td class="right"><label id="id-info-modify-date"></label></td>',
                        '</tr>',
                        '<tr>',
                            '<td class="left"><label>' + this.txtModifyBy + '</label></td>',
                            '<td class="right"><label id="id-info-modify-by"></label></td>',
                        '</tr>',
                        '<tr>',
                            '<td class="left"><label>' + this.txtCreated + '</label></td>',
                            '<td class="right"><label id="id-info-date"></label></td>',
                        '</tr>',
                        '<tr>',
                            '<td class="left"><label>' + this.txtAppName + '</label></td>',
                            '<td class="right"><label id="id-info-appname"></label></td>',
                        '</tr>',
                    '</tbody>',
                    '<tbody class="properties-tab">',
                        '<tr><td class="title"><label>' + this.txtProperties + '</label></td></tr>',
                        '<tr class="author-info">',
                            '<td class="left"><label>' + this.txtAuthor + '</label></td>',
                            '<td class="right"><div id="id-info-author">',
                                '<table>',
                                    '<tr>',
                                        '<td><div id="id-info-add-author"><input type="text" spellcheck="false" class="form-control" placeholder="' +  this.txtAddAuthor +'"></div></td>',
                                    '</tr>',
                                '</table>',
                            '</div></td>',
                        '</tr>',
                        '<tr>',
                            '<td class="left"><label>' + this.txtTitle + '</label></td>',
                            '<td class="right"><div id="id-info-title"></div></td>',
                        '</tr>',
                        '<tr>',
                            '<td class="left"><label>' + this.txtTags + '</label></td>',
                            '<td class="right"><div id="id-info-tags"></div></td>',
                        '</tr>',
                        '<tr>',
                            '<td class="left"><label>' + this.txtSubject + '</label></td>',
                            '<td class="right"><div id="id-info-subject"></div></td>',
                        '</tr>',
                        '<tr>',
                            '<td class="left"><label>' + this.txtComment + '</label></td>',
                            '<td class="right"><div id="id-info-comment"></div></td>',
                        '</tr>',
                    '</tbody>',
                '</table>',
            ].join(''));

            this.menu = options.menu;
            this.coreProps = null;
            this.authors = [];
            this._locked = false;
        },

        render: function(node) {
            var me = this;
            var $markup = $(me.template({scope: me}));

            // server info
            this.lblPlacement = $markup.findById('#id-info-placement');
            this.lblOwner = $markup.findById('#id-info-owner');
            this.lblUploaded = $markup.findById('#id-info-uploaded');

            // edited info
            var keyDownBefore = function(input, e){
                if (e.keyCode === Common.UI.Keys.ESC) {
                    var newVal = input._input.val(),
                        oldVal = input.getValue();
                    if (newVal !== oldVal) {
                        input.setValue(oldVal);
                        e.stopPropagation();
                    }
                }
            };

            this.inputTitle = new Common.UI.InputField({
                el          : $markup.findById('#id-info-title'),
                style       : 'width: 200px;',
                placeHolder : this.txtAddText,
                validateOnBlur: false,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            }).on('keydown:before', keyDownBefore).on('changed:after', function(_, newValue) {
                me.coreProps.asc_putTitle(newValue);
                me.api.asc_setCoreProps(me.coreProps);
            });

            this.inputTags = new Common.UI.InputField({
                el          : $markup.findById('#id-info-tags'),
                style       : 'width: 200px;',
                placeHolder : this.txtAddText,
                validateOnBlur: false,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            }).on('keydown:before', keyDownBefore).on('changed:after', function(_, newValue) {
                me.coreProps.asc_putKeywords(newValue);
                me.api.asc_setCoreProps(me.coreProps);
            });

            this.inputSubject = new Common.UI.InputField({
                el          : $markup.findById('#id-info-subject'),
                style       : 'width: 200px;',
                placeHolder : this.txtAddText,
                validateOnBlur: false,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            }).on('keydown:before', keyDownBefore).on('changed:after', function(_, newValue) {
                me.coreProps.asc_putSubject(newValue);
                me.api.asc_setCoreProps(me.coreProps);
            });

            this.inputComment = new Common.UI.InputField({
                el          : $markup.findById('#id-info-comment'),
                style       : 'width: 200px;',
                placeHolder : this.txtAddText,
                validateOnBlur: false,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            }).on('keydown:before', keyDownBefore).on('changed:after', function(_, newValue) {
                me.coreProps.asc_putDescription(newValue);
                me.api.asc_setCoreProps(me.coreProps);
            });

            // modify info
            this.lblModifyDate = $markup.findById('#id-info-modify-date');
            this.lblModifyBy = $markup.findById('#id-info-modify-by');

            // creation info
            this.lblDate = $markup.findById('#id-info-date');
            this.lblApplication = $markup.findById('#id-info-appname');
            this.tblAuthor = $markup.findById('#id-info-author table');
            this.trAuthor = $markup.findById('#id-info-add-author').closest('tr');
            this.authorTpl = '<tr><td><div style="display: inline-block;width: 200px;"><input type="text" spellcheck="false" class="form-control" readonly="true" value="{0}" ></div><div class="tool close img-colored" data-hint="2" data-hint-direction="right" data-hint-offset="small"></div></td></tr>';

            this.tblAuthor.on('click', function(e) {
                var btn = $markup.find(e.target);
                if (btn.hasClass('close') && !btn.hasClass('disabled')) {
                    var el = btn.closest('tr'),
                        idx = me.tblAuthor.find('tr').index(el);
                    el.remove();
                    me.authors.splice(idx, 1);
                    me.coreProps.asc_putCreator(me.authors.join(';'));
                    me.api.asc_setCoreProps(me.coreProps);
                    me.updateScroller(true);
                }
            });

            this.inputAuthor = new Common.UI.InputField({
                el          : $markup.findById('#id-info-add-author'),
                style       : 'width: 200px;',
                validateOnBlur: false,
                placeHolder: this.txtAddAuthor,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            }).on('changed:after', function(input, newValue, oldValue, e) {
                if (newValue == oldValue) return;

                var val = newValue.trim();
                if (!!val && val !== oldValue.trim()) {
                    var isFromApply = e && e.relatedTarget && (e.relatedTarget.id == 'fminfo-btn-apply');
                    val.split(/\s*[,;]\s*/).forEach(function(item){
                        var str = item.trim();
                        if (str) {
                            me.authors.push(item);
                            if (!isFromApply) {
                                var div = $(Common.Utils.String.format(me.authorTpl, Common.Utils.String.htmlEncode(str)));
                                me.trAuthor.before(div);
                                me.updateScroller();
                            }
                        }
                    });
                    !isFromApply && me.inputAuthor.setValue('');
                }

                me.coreProps.asc_putCreator(me.authors.join(';'));
                me.api.asc_setCoreProps(me.coreProps);
            }).on('keydown:before', keyDownBefore);

            this.rendered = true;

            this.updateInfo(this.doc);

            this.$el = $(node).html($markup);
            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: this.$el,
                    alwaysVisibleY: true
                });
            }

            Common.NotificationCenter.on({
                'window:resize': function() {
                    me.isVisible() && me.updateScroller();
                }
            });

            return this;
        },

        show: function() {
            Common.UI.BaseView.prototype.show.call(this,arguments);

            this.updateFileInfo();
            this.scroller && this.scroller.scrollTop(0);
            this.updateScroller();
        },

        hide: function() {
            Common.UI.BaseView.prototype.hide.call(this,arguments);
        },

        updateScroller: function(destroy) {
            if (this.scroller) {
                this.scroller.update(destroy ? {} : undefined);
            }
        },

        updateInfo: function(doc) {
            this.doc = doc;
            if (!this.rendered)
                return;

            var visible = false;
            doc = doc || {};
            if (doc.info) {
                // server info
                if (doc.info.folder )
                    this.lblPlacement.text( doc.info.folder );
                visible = this._ShowHideInfoItem(this.lblPlacement, doc.info.folder!==undefined && doc.info.folder!==null) || visible;
                var value = doc.info.owner;
                if (value)
                    this.lblOwner.text(value);
                visible = this._ShowHideInfoItem(this.lblOwner, !!value) || visible;
                value = doc.info.uploaded;
                if (value)
                    this.lblUploaded.text(value);
                visible = this._ShowHideInfoItem(this.lblUploaded, !!value) || visible;
            } else
                this._ShowHideDocInfo(false);
            $('tr.divider.general', this.el)[visible?'show':'hide']();

            var appname = (this.api) ? this.api.asc_getAppProps() : null;
            if (appname) {
                appname = (appname.asc_getApplication() || '') + (appname.asc_getAppVersion() ? ' ' : '') + (appname.asc_getAppVersion() || '');
                this.lblApplication.text(appname);
            }
            this._ShowHideInfoItem(this.lblApplication, !!appname);

            this.coreProps = (this.api) ? this.api.asc_getCoreProps() : null;
            var value = this.coreProps ? this.coreProps.asc_getCreated() : '';
            this.lblDate.text(this.dateToString(value));
            this._ShowHideInfoItem(this.lblDate, !!value);

            this.renderCustomProperties();
        },

        updateFileInfo: function() {
            if (!this.rendered)
                return;

            var me = this,
                props = (this.api) ? this.api.asc_getCoreProps() : null,
                value;

            this.coreProps = props;
            var visible = false;
            value = props ? props.asc_getModified() : '';
            this.lblModifyDate.text(this.dateToString(value));
            visible = this._ShowHideInfoItem(this.lblModifyDate, !!value) || visible;
            value = props ? props.asc_getLastModifiedBy() : '';
            if (value)
                this.lblModifyBy.text(AscCommon.UserInfoParser.getParsedName(value));
            visible = this._ShowHideInfoItem(this.lblModifyBy, !!value) || visible;
            $('tr.divider.modify', this.el)[visible?'show':'hide']();

            value = props ? props.asc_getTitle() : '';
            this.inputTitle.setValue(value || '');
            value = props ? props.asc_getKeywords() : '';
            this.inputTags.setValue(value || '');
            value = props ? props.asc_getSubject() : '';
            this.inputSubject.setValue(value || '');
            value = props ? props.asc_getDescription() : '';
            this.inputComment.setValue(value || '');

            this.inputAuthor.setValue('');
            this.tblAuthor.find('tr:not(:last-of-type)').remove();
            this.authors = [];
            value = props ? props.asc_getCreator() : '';//"123\"\"\"\<\>,456";
            value && value.split(/\s*[,;]\s*/).forEach(function(item) {
                var div = $(Common.Utils.String.format(me.authorTpl, Common.Utils.String.htmlEncode(item)));
                me.trAuthor.before(div);
                me.authors.push(item);
            });
            this.tblAuthor.find('.close').toggleClass('hidden', !this.mode.isEdit);
            !this.mode.isEdit && this._ShowHideInfoItem(this.tblAuthor, !!this.authors.length);
            this.SetDisabled();
        },

        tplCustomProperty: function(name, type, value) {
            if (type === AscCommon.c_oVariantTypes.vtBool) {
                value = value ? this.txtYes : this.txtNo;
            } else if (type === AscCommon.c_oVariantTypes.vtFiletime) {
                value = this.dateToString(new Date(value), true);
            } else {
                value = Common.Utils.String.htmlEncode(value);
            }

            return '<tr data-custom-property>' +
                '<td class="left"><label>' + Common.Utils.String.htmlEncode(name) + '</label></td>' +
                '<td class="right"><div class="custom-property-wrapper">' +
                '<input type="text" spellcheck="false" class="form-control" readonly style="width: 200px;" value="' + value +'">' +
                '<div class="tool close img-colored" data-hint="2" data-hint-direction="right" data-hint-offset="small"></div>' +
                '</div></td></tr>';
        },

        dateToString: function (value, hideTime) {
            var text = '';
            if (value) {
                var lang = (this.mode.lang || 'en').replace('_', '-').toLowerCase();
                try {
                    if ( lang == 'ar-SA'.toLowerCase() ) lang = lang + '-u-nu-latn-ca-gregory';
                    text = value.toLocaleString(lang, {year: 'numeric', month: '2-digit', day: '2-digit'}) + (!hideTime ? ' ' + value.toLocaleString(lang, {timeStyle: 'short'}) : '');
                } catch (e) {
                    lang = 'en';
                    text = value.toLocaleString(lang, {year: 'numeric', month: '2-digit', day: '2-digit'}) + (!hideTime ? ' ' + value.toLocaleString(lang, {timeStyle: 'short'}) : '');
                }
            }
            return text;
        },

        renderCustomProperties: function() {
            if (!this.api) {
                return;
            }

            $('tr[data-custom-property]').remove();

            var properties = this.api.asc_getAllCustomProperties();
            _.each(properties, _.bind(function(prop, idx) {
                var me = this, name = prop.asc_getName(), type = prop.asc_getType(), value = prop.asc_getValue();
                var $propertyEl = $(this.tplCustomProperty(name, type, value));

                $('tbody.properties-tab').append($propertyEl);

                $propertyEl.on('click', function (e) {
                    if ($propertyEl.find('div.disabled').length) {
                        return;
                    }

                    var btn = $propertyEl.find(e.target);
                    if (btn.hasClass('close')) {
                        // me.api.asc_removeCustomProperty(idx);
                        me.renderCustomProperties();
                    } else if (btn.hasClass('form-control')) {
                        // edit custom props
                    }
                });
            }, this));
        },

        setDisabledCustomProperties: function(disable) {
            _.each($('tr[data-custom-property]'), function(prop) {
                $(prop).find('div.custom-property-wrapper')[disable ? 'addClass' : 'removeClass']('disabled');
                $(prop).find('div.close')[disable ? 'hide' : 'show']();
            })
        },

        _ShowHideInfoItem: function(el, visible) {
            el.closest('tr')[visible?'show':'hide']();
            return visible;
        },

        _ShowHideDocInfo: function(visible) {
            this._ShowHideInfoItem(this.lblPlacement, visible);
            this._ShowHideInfoItem(this.lblOwner, visible);
            this._ShowHideInfoItem(this.lblUploaded, visible);
        },

        setMode: function(mode) {
            this.mode = mode;
            this.inputAuthor.setVisible(mode.isEdit);
            this.tblAuthor.find('.close').toggleClass('hidden', !mode.isEdit);
            if (!mode.isEdit) {
                this.inputTitle._input.attr('placeholder', '');
                this.inputTags._input.attr('placeholder', '');
                this.inputSubject._input.attr('placeholder', '');
                this.inputComment._input.attr('placeholder', '');
                this.inputAuthor._input.attr('placeholder', '');
            }
            this.SetDisabled();
            return this;
        },

        setApi: function(o) {
            this.api = o;
            this.api.asc_registerCallback('asc_onLockCore',  _.bind(this.onLockCore, this));
            this.updateInfo(this.doc);
            return this;
        },

        onLockCore: function(lock) {
            this._locked = lock;
            this.updateFileInfo();
        },

        SetDisabled: function() {
            var disable = !this.mode.isEdit || this._locked;
            this.inputTitle.setDisabled(disable);
            this.inputTags.setDisabled(disable);
            this.inputSubject.setDisabled(disable);
            this.inputComment.setDisabled(disable);
            this.inputAuthor.setDisabled(disable);
            this.tblAuthor.find('.close').toggleClass('disabled', this._locked);
            this.tblAuthor.toggleClass('disabled', disable);
            this.setDisabledCustomProperties(disable);
        },

        txtPlacement: 'Location',
        txtOwner: 'Owner',
        txtUploaded: 'Uploaded',
        txtAppName: 'Application',
        txtTitle: 'Title',
        txtTags: 'Tags',
        txtSubject: 'Subject',
        txtComment: 'Comment',
        txtModifyDate: 'Last Modified',
        txtModifyBy: 'Last Modified By',
        txtCreated: 'Created',
        txtAuthor: 'Author',
        txtAddAuthor: 'Add Author',
        txtAddText: 'Add Text',
        txtMinutes: 'min',
        okButtonText: 'Apply',
        txtVisioInfo: 'Document Info',
        txtCommon: 'Common',
        txtProperties: 'Properties',
        txtDocumentPropertyUpdateTitle: "Document Property",
        txtYes: 'Yes',
        txtNo: 'No'
    }, VE.Views.FileMenuPanels.DocumentInfo || {}));

    VE.Views.FileMenuPanels.DocumentRights = Common.UI.BaseView.extend(_.extend({
        el: '#panel-rights',
        menu: undefined,

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);
            this.rendered = false;

            this.template = _.template([
                '<div class="header">' + this.txtAccessRights + '</div>',
                '<table class="main">',
                    '<tr class="rights">',
                        '<td class="left" style="vertical-align: top;"><label>' + this.txtRights + '</label></td>',
                        '<td class="right"><div id="id-info-rights"></div></td>',
                    '</tr>',
                    '<tr class="edit-rights">',
                        '<td class="left"></td><td class="right"><button id="id-info-btn-edit" class="btn normal dlg-btn primary auto">' + this.txtBtnAccessRights + '</button></td>',
                    '</tr>',
                '</table>'
            ].join(''));

            this.templateRights = _.template([
                '<table>',
                    '<% _.each(users, function(item) { %>',
                    '<tr>',
                        '<td><span class="userLink img-commonctrl <% if (item.isLink) { %>sharedLink<% } %>"></span><span><%= Common.Utils.String.htmlEncode(item.user) %></span></td>',
                        '<td><%= Common.Utils.String.htmlEncode(item.permissions) %></td>',
                    '</tr>',
                    '<% }); %>',
                '</table>'
            ].join(''));

            this.menu = options.menu;
        },

        render: function(node) {
            var $markup = $(this.template());

            this.cntRights = $markup.findById('#id-info-rights');
            this.btnEditRights = new Common.UI.Button({
                el: $markup.findById('#id-info-btn-edit')
            });
            this.btnEditRights.on('click', _.bind(this.changeAccessRights, this));

            this.rendered = true;

            this.updateInfo(this.doc);

            this.$el = $(node).html($markup);

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: this.$el,
                    suppressScrollX: true,
                    alwaysVisibleY: true
                });
            }

            Common.NotificationCenter.on('collaboration:sharingupdate', this.updateSharingSettings.bind(this));
            Common.NotificationCenter.on('collaboration:sharingdeny', this.onLostEditRights.bind(this));

            return this;
        },

        show: function() {
            Common.UI.BaseView.prototype.show.call(this,arguments);
            this.scroller && this.scroller.update();
        },

        hide: function() {
            Common.UI.BaseView.prototype.hide.call(this,arguments);
        },

        updateInfo: function(doc) {
            this.doc = doc;
            if (!this.rendered)
                return;

            doc = doc || {};

            if (doc.info) {
                if (doc.info.sharingSettings)
                    this.cntRights.html(this.templateRights({users: doc.info.sharingSettings}));
                this._ShowHideInfoItem('rights', doc.info.sharingSettings!==undefined && doc.info.sharingSettings!==null && doc.info.sharingSettings.length>0);
                this._ShowHideInfoItem('edit-rights', (!!this.sharingSettingsUrl && this.sharingSettingsUrl.length || this.mode.canRequestSharingSettings) && this._readonlyRights!==true);
            } else
                this._ShowHideDocInfo(false);
        },

        _ShowHideInfoItem: function(cls, visible) {
            $('tr.'+cls, this.el)[visible?'show':'hide']();
        },

        _ShowHideDocInfo: function(visible) {
            this._ShowHideInfoItem('rights', visible);
            this._ShowHideInfoItem('edit-rights', visible);
        },

        setMode: function(mode) {
            this.mode = mode;
            this.sharingSettingsUrl = mode.sharingSettingsUrl;
            return this;
        },

        changeAccessRights: function(btn,event,opts) {
            Common.NotificationCenter.trigger('collaboration:sharing');
        },

        updateSharingSettings: function(rights) {
            this._ShowHideInfoItem('rights', this.doc.info.sharingSettings!==undefined && this.doc.info.sharingSettings!==null && this.doc.info.sharingSettings.length>0);
            this.cntRights.html(this.templateRights({users: this.doc.info.sharingSettings}));
        },

        onLostEditRights: function() {
            this._readonlyRights = true;
            if (!this.rendered)
                return;

            this._ShowHideInfoItem('edit-rights', false);
        },

        txtRights: 'Persons who have rights',
        txtBtnAccessRights: 'Change access rights',
        txtAccessRights: 'Access Rights'
    }, VE.Views.FileMenuPanels.DocumentRights || {}));

    VE.Views.FileMenuPanels.Help = Common.UI.BaseView.extend({
        el: '#panel-help',
        menu: undefined,

        template: _.template([
            '<div style="width:100%; height:100%; position: relative;">',
                '<div id="id-help-contents" style="position: absolute; width:220px; top: 0; bottom: 0;" class="no-padding"></div>',
                '<div id="id-help-frame" class="no-padding"></div>',
            '</div>'
        ].join('')),

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);

            this.menu = options.menu;
            this.urlPref = 'resources/help/{{DEFAULT_LANG}}/';
            this.openUrl = null;

            this.en_data = [
                {"src": "ProgramInterface/ProgramInterface.htm", "name": "Introducing Visio Editor user interface", "headername": "Program Interface"},
                {"src": "ProgramInterface/FileTab.htm", "name": "File tab"},
                {"src": "UsageInstructions/OpenCreateNew.htm", "name": "Create a new document or open an existing one", "headername": "Basic operations" },
                {"src": "UsageInstructions/ViewVisioInfo.htm", "name": "View document information", "headername": "Tools and settings"},
                {"src": "HelpfulHints/About.htm", "name": "About Visio Editor", "headername": "Helpful hints"},
                {"src": "HelpfulHints/SupportedFormats.htm", "name": "Supported formats of electronic documents"},
                {"src": "HelpfulHints/KeyboardShortcuts.htm", "name": "Keyboard shortcuts"}
            ];

            if (Common.Utils.isIE) {
                window.onhelp = function () { return false; }
            }
        },

        render: function() {
            var me = this;
            this.$el.html(this.template());

            this.viewHelpPicker = new Common.UI.DataView({
                el: $('#id-help-contents'),
                store: new Common.UI.DataViewStore([]),
                keyMoveDirection: 'vertical',
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="help-item-wrap">',
                        '<div class="caption"><%= name %></div>',
                    '</div>'
                ].join(''))
            });
            this.viewHelpPicker.on('item:add', function(dataview, itemview, record) {
                if (record.has('headername')) {
                    $(itemview.el).before('<div class="header-name">' + record.get('headername') + '</div>');
                }
            });

            this.viewHelpPicker.on('item:select', function(dataview, itemview, record) {
                me.onSelectItem(record.get('src'));
            });

            this.iFrame = document.createElement('iframe');

            this.iFrame.src = "";
            this.iFrame.align = "top";
            this.iFrame.frameBorder = "0";
            this.iFrame.width = "100%";
            this.iFrame.height = "100%";
            if (Common.Utils.isChrome || Common.Utils.isOpera || Common.Utils.isGecko && Common.Utils.firefoxVersion>86)
                this.iFrame.onload = function() {
                    try {
                        me.findUrl(me.iFrame.contentWindow.location.href);
                    } catch (e) {
                    }
                };

            Common.Gateway.on('internalcommand', function(data) {
                if (data.type == 'help:hyperlink') {
                    me.findUrl(data.data);
                }
            });
            
            $('#id-help-frame').append(this.iFrame);

            return this;
        },

        setLangConfig: function(lang) {
            var me = this;
            var store = this.viewHelpPicker.store;
            if (lang) {
                lang = lang.split(/[\-\_]/)[0];
                var config = {
                    dataType: 'json',
                    error: function () {
                        if ( me.urlPref.indexOf('resources/help/{{DEFAULT_LANG}}/')<0 ) {
                            me.urlPref = 'resources/help/{{DEFAULT_LANG}}/';
                            store.url = 'resources/help/{{DEFAULT_LANG}}/Contents.json';
                            store.fetch(config);
                        } else {
                            me.urlPref = 'resources/help/{{DEFAULT_LANG}}/';
                            store.reset(me.en_data);
                        }
                    },
                    success: function () {
                        var rec = me.openUrl ? store.find(function(record){
                            return (me.openUrl.indexOf(record.get('src'))>=0);
                        }) : store.at(0);
                        if (rec) {
                            me.viewHelpPicker.selectRecord(rec, true);
                            me.viewHelpPicker.scrollToRecord(rec);
                        }
                        me.onSelectItem(me.openUrl ? me.openUrl : rec.get('src'));
                    }
                };

                if ( Common.Controllers.Desktop.isActive() ) {
                    if ( !Common.Controllers.Desktop.isHelpAvailable() ) {
                        me.noHelpContents = true;
                        me.iFrame.src = '../../common/main/resources/help/download.html';
                    } else {
                        me.urlPref = Common.Controllers.Desktop.helpUrl() + '/';
                        store.url = me.urlPref + 'Contents.json';
                        store.fetch(config);
                    }
                } else {
                    store.url = 'resources/help/' + lang + '/Contents.json';
                    store.fetch(config);
                    this.urlPref = 'resources/help/' + lang + '/';
                }
            }
        },

        show: function (url) {
            Common.UI.BaseView.prototype.show.call(this);
            if (!this._scrollerInited) {
                this.viewHelpPicker.scroller.update();
                this._scrollerInited = true;
            }
            if (url) {
                if (this.viewHelpPicker.store.length>0) {
                    this.findUrl(url);
                    this.onSelectItem(url);
                } else
                    this.openUrl = url;
            }
        },

        onSelectItem: function(src) {
            this.iFrame.src = this.urlPref + src;
        },

        findUrl: function(src) {
            var rec = this.viewHelpPicker.store.find(function(record){
                return (src.indexOf(record.get('src'))>=0);
            });
            if (rec) {
                this.viewHelpPicker.selectRecord(rec, true);
                this.viewHelpPicker.scrollToRecord(rec);
            }
        }
    });

});
