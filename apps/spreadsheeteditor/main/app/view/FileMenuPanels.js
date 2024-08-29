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
define([], function () {
    'use strict';

    !SSE.Views.FileMenuPanels && (SSE.Views.FileMenuPanels = {});

    SSE.Views.FileMenuPanels.ViewSaveAs = Common.UI.BaseView.extend({
        el: '#panel-saveas',
        menu: undefined,

        formats: [[
            {name: 'XLSX', imgCls: 'xlsx', type: Asc.c_oAscFileType.XLSX},
            {name: 'ODS',  imgCls: 'ods',  type: Asc.c_oAscFileType.ODS},
            {name: 'CSV',  imgCls: 'csv',  type: Asc.c_oAscFileType.CSV},
            {name: 'PDF',  imgCls: 'pdf',  type: Asc.c_oAscFileType.PDF}
        ],[
            {name: 'XLTX', imgCls: 'xltx', type: Asc.c_oAscFileType.XLTX},
            {name: 'OTS',  imgCls: 'ots',  type: Asc.c_oAscFileType.OTS},
            {name: 'XLSB', imgCls: 'xlsb', type: Asc.c_oAscFileType.XLSB},
            {name: 'XLSM', imgCls: 'xlsm', type: Asc.c_oAscFileType.XLSM},
            {name: 'PDFA', imgCls: 'pdfa', type: Asc.c_oAscFileType.PDFA}
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
                            '<% if (item.type!==Asc.c_oAscFileType.XLSM || fileType=="xlsm") { %>',
                                '<div class="format-item float-left"><div class="btn-doc-format" format="<%= item.type %>" data-hint="2" data-hint-direction="left-top" data-hint-offset="4, 4">',
                                    '<div class ="svg-format-<%= item.imgCls %>"></div>',
                                '</div></div>',
                            '<% } %>',
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
                fileType: (this.fileType || 'xlsx').toLowerCase(),
                header: /*this.textDownloadAs*/ Common.Locale.get('btnDownloadCaption', {name:'SSE.Views.FileMenu', default:this.textDownloadAs})}));
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

    SSE.Views.FileMenuPanels.ViewSaveCopy = Common.UI.BaseView.extend({
        el: '#panel-savecopy',
        menu: undefined,

        formats: [[
            {name: 'XLSX', imgCls: 'xlsx', type: Asc.c_oAscFileType.XLSX, ext: '.xlsx'},
            {name: 'ODS',  imgCls: 'ods',  type: Asc.c_oAscFileType.ODS, ext: '.ods'},
            {name: 'CSV',  imgCls: 'csv',  type: Asc.c_oAscFileType.CSV, ext: '.csv'},
            {name: 'PDF',  imgCls: 'pdf',  type: Asc.c_oAscFileType.PDF, ext: '.pdf'}
        ],[
            {name: 'XLTX', imgCls: 'xltx', type: Asc.c_oAscFileType.XLTX, ext: '.xltx'},
            {name: 'OTS',  imgCls: 'ots',  type: Asc.c_oAscFileType.OTS, ext: '.ots'},
            {name: 'XLSB', imgCls: 'xlsb', type: Asc.c_oAscFileType.XLSB, ext: '.xlsb'},
            {name: 'XLSM', imgCls: 'xlsm', type: Asc.c_oAscFileType.XLSM, ext: '.xlsm'},
            {name: 'PDFA', imgCls: 'pdfa', type: Asc.c_oAscFileType.PDFA, ext: '.pdf'}
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
                            '<% if (item.type!==Asc.c_oAscFileType.XLSM || fileType=="xlsm") { %>',
                                '<div class="format-item float-left"><div class="btn-doc-format" format="<%= item.type %>" format-ext="<%= item.ext %>" data-hint="2" data-hint-direction="left-top" data-hint-offset="4, 4">',
                                    '<div class ="svg-format-<%= item.imgCls %>"></div>',
                                '</div></div>',
                            '<% } %>',
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
                fileType: (this.fileType || 'xlsx').toLowerCase(),
                header: /*this.textSaveCopyAs*/ Common.Locale.get('btnSaveCopyAsCaption', {name:'SSE.Views.FileMenu', default:this.textSaveCopyAs})}));
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

    SSE.Views.FileMenuPanels.MainSettingsGeneral = Common.UI.BaseView.extend(_.extend({
        el: '#panel-settings',
        menu: undefined,

        template: _.template([
        '<div class="flex-settings">',
            '<div class="header"><%= scope.txtAdvancedSettings %></div>',
            '<table class="main"><tbody>',
                '<tr class="editsave">',
                    '<td class="group-name top" colspan="2"><label><%= scope.txtEditingSaving %></label></td>',
                '</tr>',
                '<tr class="autosave">',
                    '<td colspan = "2"><span id="fms-chb-autosave"></span></td>',
                '</tr>',
                '<tr class="forcesave">',
                    '<td colspan="2"><span id="fms-chb-forcesave"></span></td>',
                '</tr>',
                '<tr class="edit">',
                    '<td colspan = "2"><div id="fms-chb-paste-settings"></div></td>',
                '</tr>',
                '<tr class ="editsave divider-group"></tr>',
                '<tr class="collaboration" >',
                    '<td class="group-name" colspan="2"><label><%= scope.txtCollaboration %></label></td>',
                '</tr>',
                '<tr class="coauth changes">',
                    '<td class="subgroup-name" colspan="2"><label><%= scope.strCoAuthMode %></label></td>',
                '</tr>',
                '<tr class="coauth changes">',
                    '<td colspan="2"><div style="display: flex;" role="radiogroup" aria-owns="fms-rb-coauth-mode-strict">',
                        '<div id="fms-rb-coauth-mode-fast"></div>',
                        '<span style ="display: flex; flex-direction: column;"><label><%= scope.strFast %></label>',
                        '<label class="comment-text"><%= scope.txtFastTip %></label></span>',
                    '</div></td>',
                '</tr>',
                '<tr class="coauth changes">',
                    '<td colspan="2"><div style="display: flex; ">',
                        '<div id="fms-rb-coauth-mode-strict"></div>',
                        '<span style ="display: flex; flex-direction: column;"><label><%= scope.strStrict %></label>',
                        '<label class="comment-text"><%= scope.txtStrictTip %></label></span>',
                    '</div></td>',
                '</div></tr>',
                '<tr class ="divider coauth changes"></tr>',
                '<tr class="live-viewer">',
                    '<td colspan="2"><div id="fms-chb-live-viewer"></div></td>',
                '</tr>',
                '<tr class="divider live-viewer"></tr>',
                '<tr class="comments">',
                    '<td colspan="2"><div id="fms-chb-live-comment"></div></td>',
                '</tr>',
                '<tr class="comments">',
                    '<td colspan="2"><div id="fms-chb-resolved-comment"></div></td>',
                '</tr>',
                '<tr class ="collaboration divider-group"></tr>',
                '<tr>',
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
                '<tr class ="collaboration divider-group"></tr>',
                '<tr >',
                    '<td class="group-name" colspan="2"><label><%= scope.txtWorkspace %></label></td>',
                '</tr>',
                '<tr>',
                    '<td colspan="2"><div id="fms-chb-scrn-reader"></div></td>',
                '</tr>',
                '<tr>',
                    //'<td class="left"><label><%= scope.textRefStyle %></label></td>',
                    '<td colspan="2"><div id="fms-chb-r1c1-style"></div></td>',
                '</tr>',
                '<tr>',
                    '<td colspan="2"><div id="fms-chb-use-alt-key"></div></td>',
                '</tr>',
                '<tr class="ui-rtl">',
                    '<td colspan="2"><div id="fms-chb-rtl-ui" style="display: inline-block;"></div><span class="beta-hint">Beta</span></td>',
                '</tr>',
                /*'<tr class="quick-print">',
                    '<td colspan="2"><div style="display: flex;"><div id="fms-chb-quick-print"></div>',
                        '<span style ="display: flex; flex-direction: column;"><label><%= scope.txtQuickPrint %></label>',
                        '<label class="comment-text"><%= scope.txtQuickPrintTip %></label></span></div>',
                    '</td>',
                '</tr>',*/
                '<tr class="edit quick-access">',
                    '<td colspan="2"><button type="button" class="btn btn-text-default" id="fms-btn-customize-quick-access" style="width:auto;display:inline-block;padding-right:10px;padding-left:10px;" data-hint="2" data-hint-direction="bottom" data-hint-offset="medium"><%= scope.txtCustomizeQuickAccess %></button></div></td>',
                '</tr>',
                '<tr>',
                    '<td><label><%= scope.strUnit %></label></td>',
                    '<td><span id="fms-cmb-unit"></span></td>',
                '</tr>',
                '<tr>',
                    '<td><label><%= scope.strZoom %></label></td>',
                    '<td><div id="fms-cmb-zoom" class="input-group-nr"></div></td>',
                '</tr>',
                '<tr>',
                    '<td><label><%= scope.strFontRender %></label></td>',
                    '<td><span id="fms-cmb-font-render"></span></td>',
                '</tr>',
                '<tr class="macros">',
                    '<td><label><%= scope.strMacrosSettings %></label></td>',
                    '<td>',
                        '<div><div id="fms-cmb-macros"></div>',
                    '</td>',
                '</tr>',
                '<tr class ="divider-group"></tr>',
                '<tr>',
                    '<td class="group-name" colspan="2"><label><%= scope.strRegSettings %></label></td>',
                '</tr>',
                '<tr class="">',
                    '<td><label><%= scope.strFuncLocale %></label></td>',
                    '<td>',
                        '<div><div id="fms-cmb-func-locale"></div>',
                        '<label id="fms-lbl-func-locale"><%= scope.strFuncLocaleEx %></label></div></td>',
                '</tr>',
                '<tr>',
                    '<td><label><%= scope.txtRegion %></label></td>',
                    '<td>',
                        '<div><div id="fms-cmb-reg-settings"></div>',
                        '<label id="fms-lbl-reg-settings"></label></div></td>',
                '</tr>',
                '<tr>',
                    '<td colspan="2"><div id="fms-chb-separator-settings"></div></td>',
                '</tr>',
                '<tr>',
                    '<td><label class = "label-separator"><%= scope.strDecimalSeparator %></label></td>',
                    '<td><div id="fms-decimal-separator"></div></td>',
                '</tr>',
                '<tr>',
                    '<td><label class = "label-separator"><%= scope.strThousandsSeparator %></label></td>',
                    '<td><div id="fms-thousands-separator"></div></td>',
                '</tr>',
                '<tr class ="divider-group"></tr>',
                '<tr class="edit">',
                    '<td colspan="2" class="group-name"><label><%= scope.txtProofing %></label></td>',
                '</tr>',
                '<tr class="spellcheck">',
                    '<td><label><%= scope.strDictionaryLanguage %></label></td>',
                    '<td><span id="fms-cmb-dictionary-language"></span></td>',
                '</tr>',
                '<tr class="spellcheck">',
                    '<td colspan="2"><span id="fms-chb-ignore-uppercase-words"></span></td>',
                '</tr>',
                '<tr class="spellcheck">',
                    '<td colspan="2"><span id="fms-chb-ignore-numbers-words"></span></td>',
                '</tr>',
                '<tr  class="edit">',
                    '<td colspan="2"><button type="button" class="btn btn-text-default" id="fms-btn-auto-correct" style="width:auto; display: inline-block;padding-right: 10px;padding-left: 10px;" data-hint="2" data-hint-direction="bottom" data-hint-offset="big"><%= scope.txtAutoCorrect %></button></div></td>',
                '</tr>',
                '<tr class ="edit divider-group"></tr>',
                '<tr class="edit">',
                    '<td colspan="2" class="group-name"><label><%= scope.txtCalculating %></label></td>',
                '</tr>',
                '<tr class="edit">',
                    '<td colspan="2"><span id="fms-chb-date-1904"></span></td>',
                '</tr>',
                '<tr class="edit">',
                    '<td colspan="2"><span id="fms-chb-iterative-calc"></span></td>',
                '</tr>',
                '<tr class="edit">',
                    '<td><label><%= scope.strMaxIterations %></label></td>',
                    '<td><div id="fms-max-iterations"></div></td>',
                '</tr>',
                '<tr class="edit">',
                    '<td><label><%= scope.strMaxChange %></label></td>',
                    '<td><div id="fms-max-change"></div></td>',
                '</tr>',
                '<tr class ="edit divider-group"></tr>',
                 '<tr class="fms-btn-apply">',
                    '<td style="padding-top:15px; padding-bottom: 15px;"><button class="btn normal dlg-btn primary" data-hint="3" data-hint-direction="bottom" data-hint-offset="big"><%= scope.okButtonText %></button></td>',
                    '<td></td>',
                '</tr>',
            '</tbody></table>',
        '</div>',
        '<div class="fms-flex-apply hidden">',
            '<table class="main" style="margin: 10px 20px; width: 100%"><tbody>',
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


            this.chLiveComment = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-live-comment'),
                labelText: this.strShowComments,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            }).on('change', function(field, newValue, oldValue, eOpts){
                me.chResolvedComment.setDisabled(field.getValue()!=='checked');
            });

            this.chResolvedComment = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-resolved-comment'),
                labelText: this.strShowResolvedComments,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            this.chR1C1Style = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-r1c1-style'),
                labelText: this.strReferenceStyle,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

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

            this.rbCoAuthModeFast = new Common.UI.RadioBox({
                el          : $markup.findById('#fms-rb-coauth-mode-fast'),
                name        : 'coauth-mode',
                dataHint    : '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small',
                ariaLabel: this.strFast + ' ' + this.txtFastTip
            }).on('change', function (field, newValue, eOpts) {
                newValue && me.chAutosave.setValue(1);
            });
            this.rbCoAuthModeFast.$el.parent().on('click', function (){me.rbCoAuthModeFast.setValue(true);});

            this.rbCoAuthModeStrict = new Common.UI.RadioBox({
                el          : $markup.findById('#fms-rb-coauth-mode-strict'),
                name        : 'coauth-mode',
                dataHint    : '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small',
                ariaLabel: this.strStrict + ' ' + this.txtStrictTip
            });
            this.rbCoAuthModeStrict.$el.parent().on('click', function (){me.rbCoAuthModeStrict.setValue(true);});
            /** coauthoring end **/

            this.chLiveViewer = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-live-viewer'),
                labelText: this.strShowOthersChanges,
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
                dataHint    : '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });

            var itemsTemplate =
                _.template([
                    '<% _.each(items, function(item) { %>',
                    '<li id="<%= item.id %>" data-value="<%= item.value %>" <% if (item.value === "custom") { %> class="border-top" style="margin-top: 5px;padding-top: 5px;" <% } %> ><a tabindex="-1" type="menuitem" <% if (typeof(item.checked) !== "undefined" && item.checked) { %> class="checked" <% } %> ><%= scope.getDisplayValue(item) %></a></li>',
                    '<% }); %>'
                ].join(''));
            this.cmbFontRender = new Common.UI.ComboBox({
                el          : $markup.findById('#fms-cmb-font-render'),
                style       : 'width: 160px;',
                editable    : false,
                restoreMenuHeightAndTop: true,
                cls         : 'input-group-nr',
                menuStyle   : 'min-width:100%;',
                itemsTemplate: itemsTemplate,
                data        : [
                    { value: Asc.c_oAscFontRenderingModeType.hintingAndSubpixeling, displayValue: this.txtWin },
                    { value: Asc.c_oAscFontRenderingModeType.noHinting, displayValue: this.txtMac },
                    { value: Asc.c_oAscFontRenderingModeType.hinting, displayValue: this.txtNative },
                    { value: 'custom', displayValue: this.txtCacheMode }
                ],
                dataHint    : '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.cmbFontRender.on('selected', _.bind(this.onFontRenderSelected, this));

            this.chAutosave = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-autosave'),
                labelText: this.textAutoSave,
                dataHint    : '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            }).on('change', function(field, newValue, oldValue, eOpts){
                if (field.getValue()!=='checked' && me.rbCoAuthModeFast.getValue()) {
                    me.rbCoAuthModeStrict.setValue(true);
                }
            });

            this.chForcesave = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-forcesave'),
                labelText: this.textForceSave,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            this.cmbUnit = new Common.UI.ComboBox({
                el          : $markup.findById('#fms-cmb-unit'),
                style       : 'width: 160px;',
                editable    : false,
                restoreMenuHeightAndTop: true,
                menuStyle   : 'min-width:100%;',
                cls         : 'input-group-nr',
                data        : [
                    { value: Common.Utils.Metric.c_MetricUnits['cm'], displayValue: this.txtCm },
                    { value: Common.Utils.Metric.c_MetricUnits['pt'], displayValue: this.txtPt },
                    { value: Common.Utils.Metric.c_MetricUnits['inch'], displayValue: this.txtInch }
                ],
                dataHint    : '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });

            var formula_arr = [];
            SSE.Collections.formulasLangs.forEach(function(item){
                var str = item.replace(/[\-_]/, '');
                str = str.charAt(0).toUpperCase() + str.substring(1, str.length);
                formula_arr.push({value: item, displayValue: me['txt' + str + 'lang'] || me['txt' + str], exampleValue: me['txtExample' + str] || me.txtExampleEn});
            });
            formula_arr.sort(function(a, b){
                if (a.displayValue < b.displayValue) return -1;
                if (a.displayValue > b.displayValue) return 1;
                return 0;
            });

            this.cmbFuncLocale = new Common.UI.ComboBox({
                el          : $markup.findById('#fms-cmb-func-locale'),
                style       : 'width: 200px;',
                menuStyle   : 'min-width:100%; max-height: 185px;',
                editable    : false,
                restoreMenuHeightAndTop: 110,
                cls         : 'input-group-nr',
                data        : formula_arr,
                dataHint    : '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            }).on('selected', function(combo, record) {
                me.updateFuncExample(record.exampleValue);
            });

            var regdata = [{ value: 0x0401 }, { value: 0x042C }, { value: 0x0402 }, { value: 0x0405 }, { value: 0x0406 }, { value: 0x0C07 }, { value: 0x0407 },  {value: 0x0807}, { value: 0x0408 }, { value: 0x0C09 }, { value: 0x3809 }, { value: 0x0809 }, { value: 0x0409 }, { value: 0x0C0A }, { value: 0x080A },
                            { value: 0x040B }, { value: 0x040C }, { value: 0x100C }, { value: 0x0421 }, { value: 0x0410 }, { value: 0x0810 }, { value: 0x0411 }, { value: 0x0412 }, { value: 0x0426 }, { value: 0x040E }, { value: 0x0413 }, { value: 0x0415 }, { value: 0x0416 },
                            { value: 0x0816 }, { value: 0x0419 }, { value: 0x041B }, { value: 0x0424 }, { value: 0x281A }, { value: 0x241A }, { value: 0x081D }, { value: 0x041D }, { value: 0x041F }, { value: 0x0422 }, { value: 0x042A }, { value: 0x0804 }, { value: 0x0404 }];
            regdata.forEach(function(item) {
                var langinfo = Common.util.LanguageInfo.getLocalLanguageName(item.value);
                item.displayValue = langinfo[1];
                item.langName = langinfo[0];
            });

            this.cmbRegSettings = new Common.UI.ComboBox({
                el          : $markup.findById('#fms-cmb-reg-settings'),
                style       : 'width: 200px;',
                menuStyle   : 'min-width:100%; max-height: 185px;',
                restoreMenuHeightAndTop: 110,
                editable    : false,
                cls         : 'input-group-nr',
                data        : regdata
            }).on('selected', function(combo, record) {
                me.updateRegionalExample(record.value);
                var isBaseSettings = me.chSeparator.getValue();
                if (isBaseSettings === 'checked') {
                    me.inputDecimalSeparator.setValue(me.api.asc_getDecimalSeparator(record.value), true);
                    me.inputThousandsSeparator.setValue(me.api.asc_getGroupSeparator(record.value), true);
                }
            });
            if (this.cmbRegSettings.scroller) this.cmbRegSettings.scroller.update({alwaysVisibleY: true});

            this.chSeparator = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-separator-settings'),
                labelText: this.strUseSeparatorsBasedOnRegionalSettings,
                dataHint    : '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            }).on('change', _.bind(function(field, newValue, oldValue, eOpts){
                var checked = field.getValue() === 'checked';
                if (checked) {
                    var lang = this.cmbRegSettings.getValue(),
                        decimal = this.api.asc_getDecimalSeparator(_.isNumber(lang) ? lang : undefined),
                        group = this.api.asc_getGroupSeparator(_.isNumber(lang) ? lang : undefined);
                    this.inputDecimalSeparator.setValue(decimal);
                    this.inputThousandsSeparator.setValue(group);
                }
                this.inputDecimalSeparator.setDisabled(checked);
                this.inputThousandsSeparator.setDisabled(checked);
                if (checked) {
                    this.$el.find('.label-separator').addClass('disabled');
                } else {
                    this.$el.find('.label-separator').removeClass('disabled');
                }
            }, this));

            var keyDown = function(event){
                var key = event.key,
                    value = event.target.value;
                if (key !== 'ArrowLeft' && key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'ArrowRight' &&
                    key !== 'Home' && key !== 'End' && key !== 'Backspace' && key !== 'Delete' && value.length > 0 &&
                    event.target.selectionEnd - event.target.selectionStart === 0) {
                    event.preventDefault();
                }
            };

            this.inputDecimalSeparator = new Common.UI.InputField({
                el: $markup.findById('#fms-decimal-separator'),
                style: 'width: 35px;',
                validateOnBlur: false,
                dataHint    : '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            var $decimalSeparatorInput = this.inputDecimalSeparator.$el.find('input');
            $decimalSeparatorInput.on('keydown', keyDown);

            this.inputThousandsSeparator = new Common.UI.InputField({
                el: $markup.findById('#fms-thousands-separator'),
                style: 'width: 35px;',
                validateOnBlur: false,
                dataHint    : '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            var $thousandsSeparatorInput = this.inputThousandsSeparator.$el.find('input');
            $thousandsSeparatorInput.on('keydown', keyDown);

            this.cmbMacros = new Common.UI.ComboBox({
                el          : $markup.findById('#fms-cmb-macros'),
                style       : 'width: 160px;',
                editable    : false,
                restoreMenuHeightAndTop: true,
                menuStyle   : 'min-width:100%;',
                cls         : 'input-group-nr',
                data        : [
                    { value: 2, displayValue: this.txtStopMacros, descValue: this.txtStopMacrosDesc },
                    { value: 0, displayValue: this.txtWarnMacros, descValue: this.txtWarnMacrosDesc },
                    { value: 1, displayValue: this.txtRunMacros, descValue: this.txtRunMacrosDesc }
                ],
                itemsTemplate: _.template([
                    '<% _.each(items, function(item) { %>',
                        '<li id="<%= item.id %>" data-value="<%- item.value %>"><a tabindex="-1" type="menuitem" style ="display: flex; flex-direction: column;">',
                        '<label class="font-weight-bold"><%= scope.getDisplayValue(item) %></label><label><%= item.descValue %></label></a></li>',
                    '<% }); %>'
                ].join('')),

                dataHint    : '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });

            this.chPaste = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-paste-settings'),
                labelText: this.strPasteButton,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

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
            });

            this.cmbDictionaryLanguage = new Common.UI.ComboBox({
                el:  $markup.findById('#fms-cmb-dictionary-language'),
                cls: 'input-group-nr',
                style: 'width: 200px;',
                editable: false,
                restoreMenuHeightAndTop: 110,
                menuStyle: 'min-width: 100%; max-height: 209px;',
                dataHint: '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });

            this.chIgnoreUppercase = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-ignore-uppercase-words'),
                labelText: this.strIgnoreWordsInUPPERCASE,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            this.chIgnoreNumbers = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-ignore-numbers-words'),
                labelText: this.strIgnoreWordsWithNumbers,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            this.chDateSystem = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-date-1904'),
                labelText: this.strDateFormat1904,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            this.btnAutoCorrect = new Common.UI.Button({
                el: $markup.findById('#fms-btn-auto-correct')
            });
            this.btnAutoCorrect.on('click', _.bind(this.autoCorrect, this));

            this.chRTL = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-rtl-ui'),
                labelText: this.strRTLSupport,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
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

            this.chIterative = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-iterative-calc'),
                labelText: this.strEnableIterative,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            this.inputMaxChange = new Common.UI.InputField({
                el: $markup.findById('#fms-max-change'),
                style: 'width: 60px;',
                validateOnBlur: false,
                maskExp:  /[0-9,\.]/,
                dataHint    : '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small',
                validation: function(value) {
                    return !_.isEmpty(value) && (!/^(\d*(\.|,)?\d+)$|^(\d+(\.|,)?\d*)$/.test(value) || isNaN(Common.Utils.String.parseFloat(value))) ? me.txtErrorNumber : true;
                }
            });

            this.spnMaxIterations = new Common.UI.MetricSpinner({
                el: $markup.findById('#fms-max-iterations'),
                step: 1,
                width: 60,
                defaultUnit : '',
                value: 100,
                maxValue: 32767,
                minValue: 1,
                allowDecimal: false,
                maskExp: /[0-9]/,
                dataHint    : '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

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

        isVisible: function() {
            return (this.$el || $(this.el)).is(":visible");
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
                this.cmbUnit.options.menuAlignEl = scrolled ? this.pnlSettings : null;
                this.cmbFontRender.options.menuAlignEl = scrolled ? this.pnlSettings : null;
                this.cmbTheme.options.menuAlignEl = scrolled ? this.pnlSettings : null;
                this.cmbMacros.options.menuAlignEl = scrolled ? this.pnlSettings : null;
                this.cmbFuncLocale.options.menuAlignEl = scrolled ? this.pnlSettings : null;
                this.cmbRegSettings.options.menuAlignEl = scrolled ? this.pnlSettings : null;
                this.cmbDictionaryLanguage.options.menuAlignEl = scrolled ? this.pnlSettings : null;
                this.cmbTabStyle.options.menuAlignEl = scrolled ? this.pnlSettings : null;
            }
        },

        setMode: function(mode) {
            this.mode = mode;

             var fast_coauth = Common.Utils.InternalSettings.get("sse-settings-coauthmode");

            $('tr.editsave', this.el)[mode.isEdit || mode.canForcesave ? 'show' : 'hide']();
            $('tr.collaboration', this.el)[mode.canCoAuthoring ? 'show' : 'hide']();
            $('tr.edit', this.el)[mode.isEdit ? 'show' : 'hide']();
            $('tr.autosave', this.el)[mode.isEdit && (mode.canChangeCoAuthoring || !fast_coauth) ? 'show' : 'hide']();
            if (this.mode.isDesktopApp && this.mode.isOffline) {
                this.chAutosave.setCaption(this.textAutoRecover);
            }
            $('tr.forcesave', this.el)[mode.canForcesave ? 'show' : 'hide']();
            $('tr.comments', this.el)[mode.canCoAuthoring ? 'show' : 'hide']();
            $('tr.coauth.changes', this.el)[mode.isEdit && !mode.isOffline && mode.canCoAuthoring && mode.canChangeCoAuthoring ? 'show' : 'hide']();
            $('tr.live-viewer', this.el)[mode.canLiveView && !mode.isOffline && mode.canChangeCoAuthoring ? 'show' : 'hide']();
            $('tr.macros', this.el)[(mode.customization && mode.customization.macros===false) ? 'hide' : 'show']();
            $('tr.quick-print', this.el)[mode.canQuickPrint && !(mode.compactHeader && mode.isEdit) ? 'show' : 'hide']();
            $('tr.tab-background', this.el)[!Common.Utils.isIE && Common.UI.FeaturesManager.canChange('tabBackground', true) ? 'show' : 'hide']();
            $('tr.tab-style', this.el)[Common.UI.FeaturesManager.canChange('tabStyle', true) ? 'show' : 'hide']();
            if ( !Common.UI.Themes.available() ) {
                $('tr.themes, tr.themes + tr.divider', this.el).hide();
            }
            $('tr.spellcheck', this.el)[Common.UI.FeaturesManager.canChange('spellcheck') && mode.isEdit ? 'show' : 'hide']();
            $('tr.ui-rtl', this.el)[mode.uiRtl ? 'show' : 'hide']();
            if (mode.compactHeader) {
                $('tr.quick-access', this.el).hide();
            }
        },

        setApi: function(api) {
            this.api = api;
        },

        updateSettings: function() {
            var value = Common.Utils.InternalSettings.get("sse-settings-zoom");
            value = (value!==null) ? parseInt(value) : (this.mode.customization && this.mode.customization.zoom ? parseInt(this.mode.customization.zoom) : 100);
            var item = this.cmbZoom.store.findWhere({value: value});
            this.cmbZoom.setValue(item ? parseInt(item.get('value')) : (value>0 ? value+'%' : 100));
            this.chUseAltKey.setValue(Common.Utils.InternalSettings.get("sse-settings-show-alt-hints"));
            this.chScreenReader.setValue(Common.Utils.InternalSettings.get("app-settings-screen-reader"));

            /** coauthoring begin **/
            this.chLiveComment.setValue(Common.Utils.InternalSettings.get("sse-settings-livecomment"));
            this.chResolvedComment.setValue(Common.Utils.InternalSettings.get("sse-settings-resolvedcomment"));
            this.chR1C1Style.setValue(Common.Utils.InternalSettings.get("sse-settings-r1c1"));

            var fast_coauth = Common.Utils.InternalSettings.get("sse-settings-coauthmode");
            this.rbCoAuthModeFast.setValue(fast_coauth);
            this.rbCoAuthModeStrict.setValue(!fast_coauth);
            /** coauthoring end **/
            this.chLiveViewer.setValue(Common.Utils.InternalSettings.get("sse-settings-coauthmode"));

            value = Common.Utils.InternalSettings.get("sse-settings-fontrender");
            item = this.cmbFontRender.store.findWhere({value: parseInt(value)});
            this.cmbFontRender.setValue(item ? item.get('value') : Asc.c_oAscFontRenderingModeType.hintingAndSubpixeling);
            this._fontRender = this.cmbFontRender.getValue();

            value = Common.Utils.InternalSettings.get("sse-settings-cachemode");
            item = this.cmbFontRender.store.findWhere({value: 'custom'});
            item && value && item.set('checked', !!value);
            item && value && this.cmbFontRender.cmpEl.find('#' + item.get('id') + ' a').addClass('checked');

            value = Common.Utils.InternalSettings.get("sse-settings-unit");
            item = this.cmbUnit.store.findWhere({value: value});
            this.cmbUnit.setValue(item ? parseInt(item.get('value')) : Common.Utils.Metric.getDefaultMetric());
            this._oldUnits = this.cmbUnit.getValue();

            value = Common.Utils.InternalSettings.get("sse-settings-autosave");
            this.chAutosave.setValue(value == 1);

            if (this.mode.canForcesave) {
                this.chForcesave.setValue(Common.Utils.InternalSettings.get("sse-settings-forcesave"));
            }

            value = Common.Utils.InternalSettings.get("sse-settings-func-locale");
            item = this.cmbFuncLocale.store.findWhere({value: value});
            if (!item && value)
                item = this.cmbFuncLocale.store.findWhere({value: value.split(/[\-\_]/)[0]});
            this.cmbFuncLocale.setValue(item ? item.get('value') : 'en');
            this.updateFuncExample(item ? item.get('exampleValue') : this.txtExampleEn);

            value = this.api.asc_getLocale();
            if (value) {
                item = this.cmbRegSettings.store.findWhere({value: value});
                this.cmbRegSettings.setValue(item ? item.get('value') : Common.util.LanguageInfo.getLocalLanguageName(value)[1]);
                item && (value = this.cmbRegSettings.getValue());
            } else {
                value = this.mode.lang ? parseInt(Common.util.LanguageInfo.getLocalLanguageCode(this.mode.lang)) : 0x0409;
                this.cmbRegSettings.setValue(Common.util.LanguageInfo.getLocalLanguageName(value)[1]);
            }
            this.updateRegionalExample(value);

            var isBaseSettings = Common.Utils.InternalSettings.get("sse-settings-use-base-separator");
            this.chSeparator.setValue(isBaseSettings, true);
            var decimal,
                group;
            if (!isBaseSettings) {
                decimal = Common.Utils.InternalSettings.get("sse-settings-decimal-separator") || this.api.asc_getDecimalSeparator();
                group = Common.Utils.InternalSettings.get("sse-settings-group-separator") || this.api.asc_getGroupSeparator();
            } else {
                var lang = this.cmbRegSettings.getValue();
                decimal = this.api.asc_getDecimalSeparator(_.isNumber(lang) ? lang : undefined);
                group = this.api.asc_getGroupSeparator(_.isNumber(lang) ? lang : undefined);
            }
            this.inputDecimalSeparator.setValue(decimal);
            this.inputThousandsSeparator.setValue(group);
            this.inputDecimalSeparator.setDisabled(isBaseSettings);
            this.inputThousandsSeparator.setDisabled(isBaseSettings);
            if (isBaseSettings) {
                this.$el.find('.label-separator').addClass('disabled');
            } else {
                this.$el.find('.label-separator').removeClass('disabled');
            }

            item = this.cmbMacros.store.findWhere({value: Common.Utils.InternalSettings.get("sse-macros-mode")});
            this.cmbMacros.setValue(item ? item.get('value') : 0);

            this.chPaste.setValue(Common.Utils.InternalSettings.get("sse-settings-paste-button"));
            this.chRTL.setValue(Common.localStorage.getBool("ui-rtl", Common.Locale.isCurrentLanguageRtl()));
            //this.chQuickPrint.setValue(Common.Utils.InternalSettings.get("sse-settings-quick-print-button"));

            value = this.api.asc_GetCalcSettings();
            if (value) {
                this.chIterative.setValue(!!value.asc_getIterativeCalc());
                this.spnMaxIterations.setValue(value.asc_getMaxIterations());
                this.inputMaxChange.setValue(value.asc_getMaxChange());
            }

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

            if (Common.UI.FeaturesManager.canChange('spellcheck') && this.mode.isEdit) {
                var arrLang = SSE.getController('Spellcheck').loadLanguages(),
                    defaultShortName = "en-US",
                    allLangs = arrLang[0],
                    langs = arrLang[1],
                    change = arrLang[2];
                var sessionValue = Common.Utils.InternalSettings.get("sse-spellcheck-locale"),
                    value;
                if (sessionValue)
                    value = parseInt(sessionValue);
                else
                    value = this.mode.lang ? parseInt(Common.util.LanguageInfo.getLocalLanguageCode(this.mode.lang)) : 0x0409;
                if (langs && langs.length > 0) {
                    if (this.cmbDictionaryLanguage.store.length === 0 || change) {
                        this.cmbDictionaryLanguage.setData(langs);
                    }
                    var item = this.cmbDictionaryLanguage.store.findWhere({value: value});
                    if (!item && allLangs[value]) {
                        value = allLangs[value][0].split(/[\-\_]/)[0];
                        item = this.cmbDictionaryLanguage.store.find(function (model) {
                            return model.get('shortName').indexOf(value) == 0;
                        });
                        if(!item)
                            item = this.cmbDictionaryLanguage.store.findWhere({shortName: defaultShortName})
                    }
                    this.cmbDictionaryLanguage.setValue(item ? item.get('value') : langs[0].value);
                    value = this.cmbDictionaryLanguage.getValue();
                    if (value !== parseInt(sessionValue)) {
                        Common.Utils.InternalSettings.set("sse-spellcheck-locale", value);
                    }
                } else {
                    this.cmbDictionaryLanguage.setValue(Common.util.LanguageInfo.getLocalLanguageName(value)[1]);
                    this.cmbDictionaryLanguage.setDisabled(true);
                }

                this.chIgnoreUppercase.setValue(Common.Utils.InternalSettings.get("sse-spellcheck-ignore-uppercase-words"));
                this.chIgnoreNumbers.setValue(Common.Utils.InternalSettings.get("sse-spellcheck-ignore-numbers-words"));
                this.chDateSystem.setValue(this.api.asc_getDate1904());
            }
        },

        isValid: function() {
            if (this.mode.isEdit) {
                if (this.inputMaxChange.checkValidate() !== true) {
                    this.inputMaxChange.focus();
                    return;
                }
            }
            return true;
        },

        applySettings: function() {
            if (!this.isValid())
                return;

            Common.UI.Themes.setTheme(this.cmbTheme.getValue());
            Common.localStorage.setItem("sse-settings-show-alt-hints", this.chUseAltKey.isChecked() ? 1 : 0);
            Common.Utils.InternalSettings.set("sse-settings-show-alt-hints", Common.localStorage.getBool("sse-settings-show-alt-hints"));

            Common.localStorage.setItem("sse-settings-zoom", this.cmbZoom.getValue());

            Common.localStorage.setItem("app-settings-screen-reader", this.chScreenReader.isChecked() ? 1 : 0);
            /** coauthoring begin **/
            Common.localStorage.setItem("sse-settings-livecomment", this.chLiveComment.isChecked() ? 1 : 0);
            Common.localStorage.setItem("sse-settings-resolvedcomment", this.chResolvedComment.isChecked() ? 1 : 0);
            if (this.mode.isEdit && !this.mode.isOffline && this.mode.canCoAuthoring && this.mode.canChangeCoAuthoring)
                Common.localStorage.setItem("sse-settings-coauthmode", this.rbCoAuthModeFast.getValue()? 1 : 0);
            else if (this.mode.canLiveView && !this.mode.isOffline && this.mode.canChangeCoAuthoring) { // viewer
                Common.localStorage.setItem("sse-settings-view-coauthmode", this.chLiveViewer.isChecked() ? 1 : 0);
            }
            /** coauthoring end **/
            Common.localStorage.setItem("sse-settings-r1c1", this.chR1C1Style.isChecked() ? 1 : 0);
            Common.localStorage.setItem("sse-settings-fontrender", this.cmbFontRender.getValue());
            var item = this.cmbFontRender.store.findWhere({value: 'custom'});
            Common.localStorage.setItem("sse-settings-cachemode", item && !item.get('checked') ? 0 : 1);
            Common.localStorage.setItem("sse-settings-unit", this.cmbUnit.getValue());
            if (this.mode.isEdit && (this.mode.canChangeCoAuthoring || !Common.Utils.InternalSettings.get("sse-settings-coauthmode")))
                Common.localStorage.setItem("sse-settings-autosave", this.chAutosave.isChecked() ? 1 : 0);
            if (this.mode.canForcesave)
                Common.localStorage.setItem("sse-settings-forcesave", this.chForcesave.isChecked() ? 1 : 0);
            Common.localStorage.setItem("sse-settings-func-locale", this.cmbFuncLocale.getValue());
            if (this.cmbRegSettings.getSelectedRecord())
                Common.localStorage.setItem("sse-settings-reg-settings", this.cmbRegSettings.getValue());

            var value,
                isChecked = this.chSeparator.isChecked();
            if (!isChecked) {
                value = this.inputDecimalSeparator.getValue();
                if (value.length > 0) {
                    Common.localStorage.setItem("sse-settings-decimal-separator", value);
                    Common.Utils.InternalSettings.set("sse-settings-decimal-separator", value);
                }
                value = this.inputThousandsSeparator.getValue();
                if (value.length > 0) {
                    Common.localStorage.setItem("sse-settings-group-separator", value);
                    Common.Utils.InternalSettings.set("sse-settings-group-separator", value);
                }
            }
            Common.localStorage.setBool("sse-settings-use-base-separator", isChecked);
            Common.Utils.InternalSettings.set("sse-settings-use-base-separator", isChecked);

            Common.localStorage.setItem("sse-macros-mode", this.cmbMacros.getValue());
            Common.Utils.InternalSettings.set("sse-macros-mode", this.cmbMacros.getValue());

            Common.localStorage.setItem("sse-settings-paste-button", this.chPaste.isChecked() ? 1 : 0);
            var isRtlChanged = this.chRTL.$el.is(':visible') && Common.localStorage.getBool("ui-rtl", Common.Locale.isCurrentLanguageRtl()) !== this.chRTL.isChecked();
            Common.localStorage.setBool("ui-rtl", this.chRTL.isChecked());
            //Common.localStorage.setBool("sse-settings-quick-print-button", this.chQuickPrint.isChecked());
            if (!Common.Utils.isIE && Common.UI.FeaturesManager.canChange('tabBackground', true)) {
                Common.UI.TabStyler.setBackground(this.chTabBack.isChecked() ? 'toolbar' : 'header');
            }
            if (Common.UI.FeaturesManager.canChange('tabStyle', true)) {
                Common.UI.TabStyler.setStyle(this.cmbTabStyle.getValue());
            }
            Common.localStorage.save();
            if (this.menu) {
                this.menu.fireEvent('settings:apply', [this.menu]);

                if (this._oldUnits !== this.cmbUnit.getValue())
                    Common.NotificationCenter.trigger('settings:unitschanged', this);
            }

            if (Common.UI.FeaturesManager.canChange('spellcheck') && this.mode.isEdit) {

                var value = this.chIgnoreUppercase.isChecked();
                Common.localStorage.setBool("sse-spellcheck-ignore-uppercase-words", value);
                Common.Utils.InternalSettings.set("sse-spellcheck-ignore-uppercase-words", value);
                value = this.chIgnoreNumbers.isChecked();
                Common.localStorage.setBool("sse-spellcheck-ignore-numbers-words", value);
                Common.Utils.InternalSettings.set("sse-spellcheck-ignore-numbers-words", value);

                if (!this.cmbDictionaryLanguage.isDisabled()) {
                    value = this.cmbDictionaryLanguage.getValue();
                    Common.localStorage.setItem("sse-spellcheck-locale", value);
                    Common.Utils.InternalSettings.set("sse-spellcheck-locale", value);
                }

                Common.localStorage.save();
                if (this.menu) {
                    this.menu.fireEvent('spellcheck:apply', [this.menu]);
                }
            }

            if (this.mode.isEdit) {
                this.api.asc_setDate1904(this.chDateSystem.isChecked());

                value = this.api.asc_GetCalcSettings();
                if (value) {
                    value.asc_setIterativeCalc(this.chIterative.isChecked());
                    value.asc_setMaxIterations(this.spnMaxIterations.getNumberValue());
                    this.inputMaxChange.getValue() && value.asc_setMaxChange(Common.Utils.String.parseFloat(this.inputMaxChange.getValue()));
                    this.api.asc_UpdateCalcSettings(value);
                }
            }

            if (isRtlChanged) {
                var config = {
                    title: this.txtWorkspaceSettingChange,
                    msg: this.txtRestartEditor,
                    iconCls: 'warn',
                    buttons: ['ok']
                };
                Common.UI.alert(config);
            }
        },

        updateRegionalExample: function(landId) {
            if (this.api) {
                var text = '';
                if (landId) {
                    var info = new Asc.asc_CFormatCellsInfo();
                    info.asc_setType(Asc.c_oAscNumFormatType.None);
                    info.asc_setSymbol(landId);
                    var arr = this.api.asc_getFormatCells(info); // all formats
                    text = this.api.asc_getLocaleExample(arr[4], 1000.01, landId);
                    text = text + ' ' + this.api.asc_getLocaleExample(arr[5], Asc.cDate().getExcelDateWithTime(), landId);
                    text = text + ' ' + this.api.asc_getLocaleExample(arr[7], Asc.cDate().getExcelDateWithTime(), landId);
                }
                $('#fms-lbl-reg-settings').text(_.isEmpty(text) ? '' : this.strRegSettingsEx + text);
            }
        },

        updateFuncExample: function(text) {
            $('#fms-lbl-func-locale').text(_.isEmpty(text) ? '' : this.strRegSettingsEx + ' ' + text);
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

        autoCorrect: function() {
            if (this.dlgAutoCorrect && this.dlgAutoCorrect.isVisible()) return;
            this.dlgAutoCorrect = new Common.Views.AutoCorrectDialog({
                api: this.api
            });
            this.dlgAutoCorrect.show();
        },

        SetDisabled: function(disabled) {
            if ( disabled ) {
                this.$el.hide();
            } else {
                if ( this.mode.isEdit ) {
                    this.$el.show();
                }
            }
        },

        customizeQuickAccess: function () {
            if (this.dlgQuickAccess && this.dlgQuickAccess.isVisible()) return;
            this.dlgQuickAccess = new Common.Views.CustomizeQuickAccessDialog({
                showSave: this.mode.showSaveButton,
                showPrint: this.mode.canPrint && this.mode.twoLevelHeader,
                showQuickPrint: this.mode.canQuickPrint && this.mode.twoLevelHeader,
                props: {
                    save: Common.localStorage.getBool('sse-quick-access-save', true),
                    print: Common.localStorage.getBool('sse-quick-access-print', true),
                    quickPrint: Common.localStorage.getBool('sse-quick-access-quick-print', true),
                    undo: Common.localStorage.getBool('sse-quick-access-undo', true),
                    redo: Common.localStorage.getBool('sse-quick-access-redo', true)
                }
            });
            this.dlgQuickAccess.show();
        },

        strZoom: 'Default Zoom Value',
        okButtonText: 'Apply',
        txtWin: 'as Windows',
        txtMac: 'as OS X',
        txtNative: 'Native',
        strFontRender: 'Font Hinting',
        strUnit: 'Unit of Measurement',
        txtCm: 'Centimeter',
        txtPt: 'Point',
        textAutoSave: 'Autosave',
        txtEn: 'English',
        txtDe: 'Deutsch',
        txtRu: 'Russian',
        txtPl: 'Polish',
        txtEs: 'Spanish',
        txtFr: 'French',
        txtIt: 'Italian',
        txtExampleEn: 'SUM; MIN; MAX; COUNT',
        txtExampleDe: 'SUMME; MIN; MAX; ANZAHL',
        txtExampleRu: 'СУММ; МИН; МАКС; СЧЁТ',
        txtExamplePl: 'SUMA; MIN; MAX; ILE.LICZB',
        txtExampleEs: 'SUMA; MIN; MAX; CALCULAR',
        txtExampleFr: 'SOMME; MIN; MAX; NB',
        txtExampleIt: 'SOMMA; MIN; MAX; CONTA.NUMERI',
        strFuncLocale: 'Formula Language',
        strFuncLocaleEx: 'Example: SUM; MIN; MAX; COUNT',
        strRegSettings: 'Regional Settings',
        strRegSettingsEx: 'Example: ',
        strCoAuthMode: 'Co-editing mode',
        strFast: 'Fast',
        strStrict: 'Strict',
        textAutoRecover: 'Autorecover',
        txtInch: 'Inch',
        textForceSave: 'Save to Server',
        textRefStyle: 'Reference Style',
        strUseSeparatorsBasedOnRegionalSettings: 'Use separators based on regional settings',
        strDecimalSeparator: 'Decimal separator',
        strThousandsSeparator: 'Thousands separator',
        txtCacheMode: 'Default cache mode',
        strRTLSupport: 'RTL interface',
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
        strPasteButton: 'Show Paste Options button when content is pasted',
        txtBe: 'Belarusian',
        txtBg: 'Bulgarian',
        txtCa: 'Catalan',
        txtZh: 'Chinese',
        txtCs: 'Czech',
        txtDa: 'Danish',
        txtNl: 'Dutch',
        txtFi: 'Finnish',
        txtEl: 'Greek',
        txtHu: 'Hungarian',
        txtId: 'Indonesian',
        txtJa: 'Japanese',
        txtKo: 'Korean',
        txtLv: 'Latvian',
        txtLo: 'Lao',
        txtNb: 'Norwegian',
        txtPtlang: 'Portuguese (Portugal)',
        txtPtbr: 'Portuguese (Brazil)',
        txtRo: 'Romanian',
        txtSk: 'Slovak',
        txtSl: 'Slovenian',
        txtSv: 'Swedish',
        txtTr: 'Turkish',
        txtUk: 'Ukrainian',
        txtVi: 'Vietnamese',
        txtExampleBe: 'СУММ; МИН; МАКС; СЧЁТ',
        txtExampleCa: 'SUMA; MIN; MAX; COMPT',
        txtExampleCs: 'SUMA; MIN; MAX; POČET',
        txtExampleDa: 'SUM; MIN; MAKS; TÆL',
        txtExampleNl: 'SOM; MIN; MAX; AANTAL',
        txtExampleFi: 'SUMMA; MIN; MAKS; LASKE',
        txtExampleHu: 'SZUM; MIN; MAX; DARAB',
        txtExampleNb: 'SUMMER; MIN; STØRST; ANTALL',
        txtExamplePt: 'SOMA; MÍNIMO; MÁXIMO; CONTAR',
        txtExamplePtbr: 'SOMA; MÍNIMO; MÁXIMO; CONT.NÚM',
        txtExampleSv: 'SUMMA; MIN; MAX; ANTAL',
        txtExampleTr: 'TOPLA; MİN; MAK; BAĞ_DEĞ_SAY',
        txtEditingSaving: 'Editing and saving',
        txtCollaboration: 'Collaboration',
        strShowComments: 'Show comments in sheet',
        strShowResolvedComments: 'Show resolved comments',
        txtWorkspace: 'Workspace',
        strReferenceStyle: 'R1C1 reference style',
        txtUseAltKey: 'Use Alt key to navigate the user interface using the keyboard',
        txtUseOptionKey: 'Use Option key to navigate the user interface using the keyboard',
        txtRegion: 'Region',
        txtProofing: 'Proofing',
        strDictionaryLanguage: 'Dictionary language',
        strIgnoreWordsInUPPERCASE: 'Ignore words in UPPERCASE',
        strIgnoreWordsWithNumbers: 'Ignore words with numbers',
        txtAutoCorrect: 'AutoCorrect options...',
        txtFastTip: 'Real-time co-editing. All changes are saved automatically',
        txtStrictTip: 'Use the \'Save\' button to sync the changes you and others make',
        strShowOthersChanges: 'Show changes from other users',
        txtCalculating: 'Calculating',
        strDateFormat1904: 'Use 1904 date system',
        txtAdvancedSettings: 'Advanced Settings',
        txtQuickPrint: 'Show the Quick Print button in the editor header',
        txtQuickPrintTip: 'The document will be printed on the last selected or default printer',
        txtWorkspaceSettingChange: 'Workspace setting (RTL interface) change',
        txtRestartEditor: 'Please restart spreadsheet editor so that your workspace settings can take effect',
        txtHy: 'Armenian',
        txtLastUsed: 'Last used',
        txtScreenReader: 'Turn on screen reader support',
        strMaxIterations: 'Maximum iterations',
        strMaxChange: 'Maximum change',
        strEnableIterative: 'Enable iterative calculation',
        txtErrorNumber: 'Your entry cannot be used. An integer or decimal number may be required.',
        txtCustomizeQuickAccess: 'Customize quick access',
        txtTabBack: 'Use toolbar color as tabs background',
        strTabStyle: 'Tab style',
        textFill: 'Fill',
        textLine: 'Line',
        txtAppearance: 'Appearance'

}, SSE.Views.FileMenuPanels.MainSettingsGeneral || {}));

    SSE.Views.FileMenuPanels.CreateNew = Common.UI.BaseView.extend(_.extend({
        el: '#panel-createnew',
        menu: undefined,

        events: function() {
            return {
                'click .blank-document-btn':_.bind(this._onBlankDocument, this),
                'click .thumb-list .thumb-wrap': _.bind(this._onDocumentTemplate, this)
            };
        },

        template: _.template([
            '<div class="header"><%= scope.txtCreateNew %></div>',
            '<div class="thumb-list">',
                '<% if (blank) { %> ',
                '<div class="blank-document">',
                    '<div class="blank-document-btn" data-hint="2" data-hint-direction="left-top" data-hint-offset="10, 1">',
                        '<div class="btn-blank-format"><div class="svg-format-blank"></div></div>',
                    '</div>',
                    '<div class="title"><%= scope.txtBlank %></div>',
                '</div>',
                '<% } %>',
                '<% _.each(docs, function(item, index) { %>',
                    '<div class="thumb-wrap" template="<%= item.url %>" data-hint="2" data-hint-direction="left-top" data-hint-offset="22, 13">',
                    '<div class="thumb" ',
                        '<% if (!_.isEmpty(item.image)) {%> ',
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

        txtBlank: 'Blank spreadsheet',
        txtCreateNew: 'Create New'
    }, SSE.Views.FileMenuPanels.CreateNew || {}));

    SSE.Views.FileMenuPanels.DocumentInfo = Common.UI.BaseView.extend(_.extend({
        el: '#panel-info',
        menu: undefined,

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);
            this.rendered = false;

            this.template = _.template([
            '<div class="flex-settings">',
                '<div class="header">' + this.txtSpreadsheetInfo + '</div>',
                '<table class="main">',
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
                    '<tr class="divider general"></tr>',
                    '<tr class="divider general"></tr>',
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
                    '<tr class="divider"></tr>',
                    '<tr class="divider"></tr>',
                    '<tr>',
                        '<td class="left"><label>' + this.txtModifyDate + '</label></td>',
                        '<td class="right"><label id="id-info-modify-date"></label></td>',
                    '</tr>',
                    '<tr>',
                        '<td class="left"><label>' + this.txtModifyBy + '</label></td>',
                        '<td class="right"><label id="id-info-modify-by"></label></td>',
                    '</tr>',
                    '<tr class="divider modify">',
                    '<tr class="divider modify">',
                    '<tr>',
                        '<td class="left"><label>' + this.txtCreated + '</label></td>',
                        '<td class="right"><label id="id-info-date"></label></td>',
                    '</tr>',
                    '<tr>',
                        '<td class="left"><label>' + this.txtAppName + '</label></td>',
                        '<td class="right"><label id="id-info-appname"></label></td>',
                    '</tr>',
                    '<tr>',
                        '<td class="left" style="vertical-align: top;"><label style="margin-top: 3px;">' + this.txtAuthor + '</label></td>',
                        '<td class="right" style="vertical-align: top;"><div id="id-info-author">',
                            '<table>',
                                '<tr>',
                                    '<td><div id="id-info-add-author"><input type="text" spellcheck="false" class="form-control" placeholder="' +  this.txtAddAuthor +'"></div></td>',
                                '</tr>',
                            '</table>',
                        '</div></td>',
                    '</tr>',
                '<tr style="height: 5px;"></tr>',
                '</table>',
            '</div>',
            '<div id="fms-flex-apply">',
                '<table class="main" style="margin: 10px 0;">',
                    '<tr>',
                        '<td class="left"></td>',
                        '<td class="right"><button id="fminfo-btn-apply" class="btn normal dlg-btn primary" data-hint="2" data-hint-direction="bottom" data-hint-offset="medium"><%= scope.okButtonText %></button></td>',
                    '</tr>',
                '</table>',
            '</div>'
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
            }).on('keydown:before', keyDownBefore);
            this.inputTags = new Common.UI.InputField({
                el          : $markup.findById('#id-info-tags'),
                style       : 'width: 200px;',
                placeHolder : this.txtAddText,
                validateOnBlur: false,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            }).on('keydown:before', keyDownBefore);
            this.inputSubject = new Common.UI.InputField({
                el          : $markup.findById('#id-info-subject'),
                style       : 'width: 200px;',
                placeHolder : this.txtAddText,
                validateOnBlur: false,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            }).on('keydown:before', keyDownBefore);
            this.inputComment = new Common.UI.InputField({
                el          : $markup.findById('#id-info-comment'),
                style       : 'width: 200px;',
                placeHolder : this.txtAddText,
                validateOnBlur: false,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            }).on('keydown:before', keyDownBefore);

            // modify info
            this.lblModifyDate = $markup.findById('#id-info-modify-date');
            this.lblModifyBy = $markup.findById('#id-info-modify-by');

            // creation info
            this.lblDate = $markup.findById('#id-info-date');
            this.lblApplication = $markup.findById('#id-info-appname');
            this.tblAuthor = $markup.findById('#id-info-author table');
            this.trAuthor = $markup.findById('#id-info-add-author').closest('tr');
            this.authorTpl = '<tr><td><div style="display: inline-block;width: 200px;"><input type="text" spellcheck="false" class="form-control" readonly="true" value="{0}" ></div><div class="tool close img-commonctrl img-colored" data-hint="2" data-hint-direction="right" data-hint-offset="small"></div></td></tr>';

            this.tblAuthor.on('click', function(e) {
                var btn = $markup.find(e.target);
                if (btn.hasClass('close') && !btn.hasClass('disabled')) {
                    var el = btn.closest('tr'),
                        idx = me.tblAuthor.find('tr').index(el);
                    el.remove();
                    me.authors.splice(idx, 1);
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
            }).on('keydown:before', keyDownBefore);

            this.btnApply = new Common.UI.Button({
                el: $markup.findById('#fminfo-btn-apply')
            });
            this.btnApply.on('click', _.bind(this.applySettings, this));

            this.pnlInfo = $markup.find('.flex-settings').addBack().filter('.flex-settings');
            this.pnlApply = $markup.findById('#fms-flex-apply');

            this.rendered = true;

            this.updateInfo(this.doc);

            this.$el = $(node).html($markup);
            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: this.pnlInfo,
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
                this.pnlInfo.toggleClass('bordered', this.scroller.isVisible());
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
            if (this.coreProps) {
                var value = this.coreProps.asc_getCreated();
                if (value) {
                    var lang = (this.mode.lang || 'en').replace('_', '-').toLowerCase();
                    try {
                        if ( lang == 'ar-SA'.toLowerCase() ) lang = lang + '-u-nu-latn-ca-gregory';
                        this.lblDate.text(value.toLocaleString(lang, {year: 'numeric', month: '2-digit', day: '2-digit'}) + ' ' + value.toLocaleString(lang, {timeStyle: 'short'}));
                    } catch (e) {
                        lang = 'en';
                        this.lblDate.text(value.toLocaleString(lang, {year: 'numeric', month: '2-digit', day: '2-digit'}) + ' ' + value.toLocaleString(lang, {timeStyle: 'short'}));
                    }
                }
                this._ShowHideInfoItem(this.lblDate, !!value);
            }
        },

        updateFileInfo: function() {
            if (!this.rendered)
                return;

            var me = this,
                props = (this.api) ? this.api.asc_getCoreProps() : null,
                value;

            this.coreProps = props;
            // var app = (this.api) ? this.api.asc_getAppProps() : null;
            // if (app) {
            //     value = app.asc_getTotalTime();
            //     if (value)
            //         this.lblEditTime.text(value + ' ' + this.txtMinutes);
            // }
            // this._ShowHideInfoItem(this.lblEditTime, !!value);

            if (props) {
                var visible = false;
                value = props.asc_getModified();
                if (value) {
                    var lang = (this.mode.lang || 'en').replace('_', '-').toLowerCase();
                    try {
                        if ( lang == 'ar-SA'.toLowerCase() ) lang = lang + '-u-nu-latn-ca-gregory';
                        this.lblModifyDate.text(value.toLocaleString(lang, {year: 'numeric', month: '2-digit', day: '2-digit'}) + ' ' + value.toLocaleString(lang, {timeStyle: 'short'}));
                    } catch (e) {
                        lang = 'en';
                        this.lblModifyDate.text(value.toLocaleString(lang, {year: 'numeric', month: '2-digit', day: '2-digit'}) + ' ' + value.toLocaleString(lang, {timeStyle: 'short'}));
                    }
                }
                visible = this._ShowHideInfoItem(this.lblModifyDate, !!value) || visible;
                value = props.asc_getLastModifiedBy();
                if (value)
                    this.lblModifyBy.text(AscCommon.UserInfoParser.getParsedName(value));
                visible = this._ShowHideInfoItem(this.lblModifyBy, !!value) || visible;
                $('tr.divider.modify', this.el)[visible?'show':'hide']();

                value = props.asc_getTitle();
                this.inputTitle.setValue(value || '');
                value = props.asc_getKeywords();
                this.inputTags.setValue(value || '');
                value = props.asc_getSubject();
                this.inputSubject.setValue(value || '');
                value = props.asc_getDescription();
                this.inputComment.setValue(value || '');

                this.inputAuthor.setValue('');
                this.tblAuthor.find('tr:not(:last-of-type)').remove();
                this.authors = [];
                value = props.asc_getCreator();//"123\"\"\"\<\>,456";
                value && value.split(/\s*[,;]\s*/).forEach(function(item) {
                    var div = $(Common.Utils.String.format(me.authorTpl, Common.Utils.String.htmlEncode(item)));
                    me.trAuthor.before(div);
                    me.authors.push(item);
                });
                this.tblAuthor.find('.close').toggleClass('hidden', !this.mode.isEdit);
                !this.mode.isEdit && this._ShowHideInfoItem(this.tblAuthor, !!this.authors.length);
            }
            this.SetDisabled();
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
            this.pnlApply.toggleClass('hidden', !mode.isEdit);
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
            this.btnApply.setDisabled(this._locked);
        },

        applySettings: function() {
            if (this.coreProps && this.api) {
                this.coreProps.asc_putTitle(this.inputTitle.getValue());
                this.coreProps.asc_putKeywords(this.inputTags.getValue());
                this.coreProps.asc_putSubject(this.inputSubject.getValue());
                this.coreProps.asc_putDescription(this.inputComment.getValue());
                this.coreProps.asc_putCreator(this.authors.join(';'));
                this.api.asc_setCoreProps(this.coreProps);
            }
            this.menu.hide();
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
        txtSpreadsheetInfo: 'Spreadsheet Info'
    }, SSE.Views.FileMenuPanels.DocumentInfo || {}));

    SSE.Views.FileMenuPanels.DocumentRights = Common.UI.BaseView.extend(_.extend({
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
    }, SSE.Views.FileMenuPanels.DocumentRights || {}));

    SSE.Views.FileMenuPanels.Help = Common.UI.BaseView.extend({
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
                {"src": "ProgramInterface/ProgramInterface.htm", "name": "Introducing Spreadsheet Editor user interface", "headername": "Program Interface"},
                {"src": "ProgramInterface/FileTab.htm", "name": "File tab"},
                {"src": "ProgramInterface/HomeTab.htm", "name": "Home Tab"},
                {"src": "ProgramInterface/InsertTab.htm", "name": "Insert tab"},
                {"src": "ProgramInterface/PluginsTab.htm", "name": "Plugins tab"},
                {"src": "UsageInstructions/OpenCreateNew.htm", "name": "Create a new spreadsheet or open an existing one", "headername": "Basic operations" },
                {"src": "UsageInstructions/CopyPasteData.htm", "name": "Cut/copy/paste data" },
                {"src": "UsageInstructions/UndoRedo.htm", "name": "Undo/redo your actions"},
                {"src": "UsageInstructions/ManageSheets.htm", "name": "Manage sheets", "headername": "Operations with sheets"},
                {"src": "UsageInstructions/FontTypeSizeStyle.htm", "name": "Set font type, size, style, and colors", "headername": "Cell text formatting" },
                {"src": "UsageInstructions/AddHyperlinks.htm", "name": "Add hyperlinks" },
                {"src": "UsageInstructions/ClearFormatting.htm", "name": "Clear text, format in a cell, copy cell format"},
                {"src": "UsageInstructions/AddBorders.htm", "name": "Add borders", "headername": "Editing cell properties"},
                {"src": "UsageInstructions/AlignText.htm", "name": "Align data in cells"},
                {"src": "UsageInstructions/MergeCells.htm", "name": "Merge cells" },
                {"src": "UsageInstructions/ChangeNumberFormat.htm", "name": "Change number format" },
                {"src": "UsageInstructions/InsertDeleteCells.htm", "name": "Manage cells, rows, and columns", "headername": "Editing rows/columns" },
                {"src": "UsageInstructions/SortData.htm", "name": "Sort and filter data" },
                {"src": "UsageInstructions/InsertFunction.htm", "name": "Insert function", "headername": "Work with functions"},
                {"src": "UsageInstructions/UseNamedRanges.htm", "name": "Use named ranges"},
                {"src": "UsageInstructions/InsertImages.htm", "name": "Insert images", "headername": "Operations on objects"},
                {"src": "UsageInstructions/InsertChart.htm", "name": "Insert chart"},
                {"src": "UsageInstructions/InsertAutoshapes.htm", "name": "Insert and format autoshapes" },
                {"src": "UsageInstructions/InsertTextObjects.htm", "name": "Insert text objects" },
                {"src": "UsageInstructions/ManipulateObjects.htm", "name": "Manipulate objects" },
                {"src": "UsageInstructions/InsertEquation.htm", "name": "Insert equations", "headername": "Math equations"},
                {"src": "HelpfulHints/CollaborativeEditing.htm", "name": "Collaborative spreadsheet editing", "headername": "Spreadsheet co-editing"},
                {"src": "UsageInstructions/ViewDocInfo.htm", "name": "View file information", "headername": "Tools and settings"},
                {"src": "UsageInstructions/SavePrintDownload.htm", "name": "Save/print/download your spreadsheet"},
                {"src": "HelpfulHints/AdvancedSettings.htm", "name": "Advanced settings of Spreadsheet Editor"},
                {"src": "HelpfulHints/Navigation.htm", "name": "View settings and navigation tools"},
                {"src": "HelpfulHints/Search.htm", "name": "Search and replace functions"},
                {"src": "HelpfulHints/About.htm", "name": "About Spreadsheet Editor", "headername": "Helpful hints"},
                {"src": "HelpfulHints/SupportedFormats.htm", "name": "Supported formats of spreadsheets"},
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

    SSE.Views.FileMenuPanels.ProtectDoc = Common.UI.BaseView.extend(_.extend({
        el: '#panel-protect',
        menu: undefined,

        template: _.template([
            '<label id="id-fms-lbl-protect-header"><%= scope.strProtect %></label>',
            '<div id="id-fms-password">',
                '<label class="header"><%= scope.strEncrypt %></label>',
                '<div class="encrypt-block">',
                    '<div class="description"><%= scope.txtProtectSpreadsheet %></div>',
                    '<div id="fms-btn-add-pwd"></div>',
                '</div>',
                '<div class="encrypted-block">',
                    '<div class="description"><%= scope.txtEncrypted %></div>',
                    '<div class="buttons">',
                        '<div id="fms-btn-change-pwd"></div>',
                        '<div id="fms-btn-delete-pwd" class="margin-left-16"></div>',
                    '</div>',
                '</div>',
            '</div>',
            '<div id="id-fms-signature">',
                '<label class="header"><%= scope.strSignature %></label>',
                '<div class="add-signature-block">',
                    '<div class="description"><%= scope.txtAddSignature %></div>',
                    '<div id="fms-btn-invisible-sign"></div>',
                '</div>',
                '<div class="added-signature-block">',
                    '<div class="description"><%= scope.txtAddedSignature %></div>',
                '</div>',
                '<div id="id-fms-signature-view"></div>',
            '</div>'
        ].join('')),

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);

            this.menu = options.menu;

            var me = this;
            this.templateSignature = _.template([
                '<div class="<% if (!hasRequested && !hasSigned) { %>hidden<% } %>"">',
                    '<div class="signature-tip"><%= tipText %></div>',
                    '<div class="buttons">',
                        '<label class="link signature-view-link margin-right-20" data-hint="2" data-hint-direction="bottom" data-hint-offset="medium">' + me.txtView + '</label>',
                        '<label class="link signature-edit-link <% if (!hasSigned) { %>hidden<% } %>" data-hint="2" data-hint-direction="bottom" data-hint-offset="medium">' + me.txtEdit + '</label>',
                    '</div>',
                '</div>'
            ].join(''));
        },

        render: function() {
            this.$el.html(this.template({scope: this}));

            var protection = SSE.getController('Common.Controllers.Protection').getView();

            this.btnAddPwd = protection.getButton('add-password');
            this.btnAddPwd.render(this.$el.find('#fms-btn-add-pwd'));
            this.btnAddPwd.on('click', _.bind(this.closeMenu, this));

            this.btnChangePwd = protection.getButton('change-password');
            this.btnChangePwd.render(this.$el.find('#fms-btn-change-pwd'));
            this.btnChangePwd.on('click', _.bind(this.closeMenu, this));

            this.btnDeletePwd = protection.getButton('del-password');
            this.btnDeletePwd.render(this.$el.find('#fms-btn-delete-pwd'));
            this.btnDeletePwd.on('click', _.bind(this.closeMenu, this));

            this.cntPassword = $('#id-fms-password');
            this.cntEncryptBlock = this.$el.find('.encrypt-block');
            this.cntEncryptedBlock = this.$el.find('.encrypted-block');

            this.btnAddInvisibleSign = protection.getButton('signature');
            this.btnAddInvisibleSign.render(this.$el.find('#fms-btn-invisible-sign'));
            this.btnAddInvisibleSign.on('click', _.bind(this.closeMenu, this));

            this.cntSignature = $('#id-fms-signature');
            this.cntSignatureView = $('#id-fms-signature-view');

            this.cntAddSignature = this.$el.find('.add-signature-block');
            this.cntAddedSignature = this.$el.find('.added-signature-block');

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: this.$el,
                    suppressScrollX: true,
                    alwaysVisibleY: true
                });
            }

            this.$el.on('click', '.signature-edit-link', _.bind(this.onEdit, this));
            this.$el.on('click', '.signature-view-link', _.bind(this.onView, this));

            return this;
        },

        show: function() {
            Common.UI.BaseView.prototype.show.call(this,arguments);
            this.updateSignatures();
            this.updateEncrypt();
            this.scroller && this.scroller.update();
        },

        setMode: function(mode) {
            this.mode = mode;
            this.cntSignature.toggleClass('hidden', !this.mode.isSignatureSupport);
            this.cntPassword.toggleClass('hidden', !this.mode.isPasswordSupport);
        },

        setApi: function(o) {
            this.api = o;
            return this;
        },

        closeMenu: function() {
            this.menu && this.menu.hide();
        },

        onEdit: function() {
            this.menu && this.menu.hide();

            var me = this;
            Common.UI.warning({
                title: this.notcriticalErrorTitle,
                msg: this.txtEditWarning,
                buttons: ['ok', 'cancel'],
                primary: 'ok',
                callback: function(btn) {
                    if (btn == 'ok') {
                        me.api.asc_RemoveAllSignatures();
                    }
                }
            });

        },

        onView: function() {
            this.menu && this.menu.hide();
            SSE.getController('RightMenu').rightmenu.SetActivePane(Common.Utils.documentSettingsType.Signature, true);
        },

        updateSignatures: function(){
            var requested = this.api.asc_getRequestSignatures(),
                valid = this.api.asc_getSignatures(),
                hasRequested = requested && requested.length>0,
                hasValid = false,
                hasInvalid = false;

            _.each(valid, function(item, index){
                if (item.asc_getValid()==0)
                    hasValid = true;
                else
                    hasInvalid = true;
            });

            // hasRequested = true;
            // hasValid = true;
            // hasInvalid = true;

            var tipText = (hasInvalid) ? this.txtSignedInvalid : (hasValid ? this.txtSigned : "");
            if (hasRequested)
                tipText = this.txtRequestedSignatures + (tipText!="" ? "<br><br>" : "")+ tipText;

            this.cntSignatureView.html(this.templateSignature({tipText: tipText, hasSigned: (hasValid || hasInvalid), hasRequested: hasRequested}));

            var isAddedSignature = this.btnAddInvisibleSign.$el.find('button').hasClass('hidden');
            this.cntAddSignature.toggleClass('hidden', isAddedSignature);
            this.cntAddedSignature.toggleClass('hidden', !isAddedSignature);
        },

        updateEncrypt: function() {
            var isProtected = this.btnAddPwd.$el.find('button').hasClass('hidden');
            this.cntEncryptBlock.toggleClass('hidden', isProtected);
            this.cntEncryptedBlock.toggleClass('hidden', !isProtected);
        },

        strProtect: 'Protect Workbook',
        strSignature: 'With Signature',
        txtView: 'View signatures',
        txtEdit: 'Edit workbook',
        txtSigned: 'Valid signatures has been added to the workbook. The workbook is protected from editing.',
        txtSignedInvalid: 'Some of the digital signatures in workbook are invalid or could not be verified. The workbook is protected from editing.',
        txtRequestedSignatures: 'This workbook needs to be signed.',
        notcriticalErrorTitle: 'Warning',
        txtEditWarning: 'Editing will remove the signatures from the workbook.<br>Are you sure you want to continue?',
        strEncrypt: 'With Password',
        txtProtectSpreadsheet: 'Encrypt this spreadsheet with a password',
        txtEncrypted: 'A password is required to open this spreadsheet',
        txtAddSignature: 'Ensure the integrity of the spreadsheet by adding an<br>invisible digital signature',
        txtAddedSignature: 'Valid signatures have been added to the spreadsheet.<br>The spreadsheet is protected from editing.'

    }, SSE.Views.FileMenuPanels.ProtectDoc || {}));

    SSE.Views.PrintWithPreview = Common.UI.BaseView.extend(_.extend({
        el: '#panel-print',
        menu: undefined,

        template: _.template([
            '<div style="width:100%; height:100%; position: relative;">',
                '<div id="id-print-settings" class="no-padding">',
                    '<div class="print-settings">',
                        '<div class="flex-settings ps-container oo settings-container">',
                            '<div class="main-header"><%= scope.txtPrint %></div>',
                            '<table style="width: 100%;">',
                                '<tbody>',
                                    '<tr><td><label class="font-weight-bold"><%= scope.txtPrintRange %></label></td></tr>',
                                    '<tr><td class="padding-small"><div id="print-combo-range" style="width: 248px;"></div></td></tr>',
                                    '<tr><td class="padding-large"><div id="print-chb-ignore" style="width: 248px;"></div></td></tr>',
                                    '<tr><td class="padding-large">',
                                        '<div class="pages">',
                                            '<label><%= scope.txtPages %></label>',
                                            '<div id="print-spin-pages-from"></div>',
                                            '<label><%= scope.txtTo %></label>',
                                            '<div id="print-spin-pages-to"></div>',
                                        '</div>',
                                    '</td></tr>',
                                    '<tr class="desktop-settings"><td class="padding-large">',
                                        '<div class="pages">',
                                            '<label><%= scope.txtCopies %>:</label>',
                                            '<div id="print-txt-copies"></div>',
                                        '</div>',
                                    '</td></tr>',
                                    '<tr class="desktop-settings"><td><label class="font-weight-bold"><%= scope.txtPrintSides %></label></td></tr>',
                                    '<tr class="desktop-settings"><td class="padding-large"><div id="print-combo-sides" style="width: 248px;"></div></td></tr>',
                                    '<tr class="desktop-settings"><td class="padding-large"><div class="separator horizontal" style="width: 248px;"></div></td></tr>',
                                    '<tr><td><label class="font-weight-bold"><%= scope.txtSettingsOfSheet %></label></td></tr>',
                                    '<tr><td class="padding-large"><div id="print-combo-sheets" style="width: 248px;"></div></td></tr>',
                                    '<tr><td><label class="font-weight-bold"><%= scope.txtPageSize %></label></td></tr>',
                                    '<tr><td class="padding-large"><div id="print-combo-pages" style="width: 248px;"></div></td></tr>',
                                    '<tr><td><label class="font-weight-bold"><%= scope.txtPageOrientation %></label></td></tr>',
                                    '<tr><td class="padding-large"><div id="print-combo-orient" style="width: 134px;"></div></td></tr>',
                                    '<tr><td><label class="font-weight-bold"><%= scope.txtMargins %></label></td></tr>',
                                    '<tr><td class="padding-large"><div id="print-combo-margins" style="width: 248px;"></div></td></tr>',
                                    '<tr><td><label class="font-weight-bold"><%= scope.txtScaling %></label></td></tr>',
                                    '<tr><td class="padding-large"><div id="print-combo-layout" style="width: 248px;"></div></td></tr>',
                                    '<tr><td class="padding-large">',
                                        '<table class="print-titles-container"><tbody>',
                                            '<tr class="print-titles-header"><td>',
                                                '<span class="print-titles-caret img-commonctrl"></span>',
                                                '<label class="font-weight-bold"><%= scope.txtPrintTitles %></label>',
                                            '</td></tr>',
                                            '<tr class="print-titles-options"><td><label><%= scope.txtRepeatRowsAtTop %></label></td></tr>',
                                            '<tr class="print-titles-options"><td class="padding-small">',
                                        '<table><tbody><tr>',
                                            '<td><div id="print-txt-top" style="width: 145px;"></div></td>',
                                            '<td><div id="print-presets-top" style="width: 95px;"></div></td>',
                                        '</tr></tbody></table>',
                                    '</td></tr>',
                                            '<tr class="print-titles-options"><td><label><%= scope.txtRepeatColumnsAtLeft %></label></td></tr>',
                                            '<tr class="print-titles-options"><td>',
                                        '<table><tbody><tr>',
                                            '<td><div id="print-txt-left" style="width: 145px;"></div></td>',
                                            '<td><div id="print-presets-left" style="width: 95px;"></div></td>',
                                        '</tr></tbody></table>',
                                    '</td></tr>',
                                        '</tbody></table>',
                                    '</td></tr>',
                                    '<tr><td class="padding-small"><label class="font-weight-bold"><%= scope.txtGridlinesAndHeadings %></label></td></tr>',
                                    '<tr><td class="padding-small"><div id="print-chb-grid" style="width: 248px;"></div></td></tr>',
                                    '<tr><td class="padding-large"><div id="print-chb-rows" style="width: 248px;"></div></td></tr>',
                                    '<tr class="header-settings"><td class="padding-large"><label class="link" id="print-header-footer-settings" data-hint="2" data-hint-direction="bottom" data-hint-offset="medium"><%= scope.txtHeaderFooterSettings %></label></td></tr>',
                                    '<tr><td class="padding-large first-page">',
                                        '<label><%= scope.txtFirstPageNumber %></label>',
                                        '<div id="print-spin-first-page"></div>',
                                    '</td></tr>',
                                    //'<tr><td class="padding-large"><button type="button" class="btn btn-text-default" id="print-apply-all" style="width: 118px;" data-hint="2" data-hint-direction="bottom" data-hint-offset="medium"><%= scope.txtApplyToAllSheets %></button></td></tr>',
                                    '<tr class="fms-btn-apply"><td>',
                                        '<div class="footer justify">',
                                            '<button id="print-btn-print-0" class="btn normal dlg-btn primary" result="print" style="width: 96px;" data-hint="2" data-hint-direction="bottom" data-hint-offset="big"><%= scope.txtPrint %></button>',
                                            '<button id="print-btn-save-0" class="btn normal dlg-btn" result="save" style="width: 96px;" data-hint="2" data-hint-direction="bottom" data-hint-offset="big"><%= scope.txtSave %></button>',
                                        '</div>',
                                    '</td></tr>',
                                '</tbody>',
                            '</table>',
                        '</div>',
                        '<div class="fms-flex-apply hidden">',
                            '<div class="footer justify">',
                                '<button id="print-btn-print-1" class="btn normal dlg-btn primary" result="print" style="width: 96px;" data-hint="2" data-hint-direction="bottom" data-hint-offset="big"><%= scope.txtPrint %></button>',
                                '<button id="print-btn-save-1" class="btn normal dlg-btn" result="save" style="width: 96px;" data-hint="2" data-hint-direction="bottom" data-hint-offset="big"><%= scope.txtSave %></button>',
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',
                '<div id="print-preview-box" class="no-padding">',
                    '<div id="print-preview"></div>',
                    '<div id="print-navigation">',
                        '<% if (!isRTL) { %>',
                        '<div id="print-prev-page"></div>',
                        '<div id="print-next-page"></div>',
                        '<% } else { %>',
                        '<div id="print-next-page"></div>',
                        '<div id="print-prev-page"></div>',
                        '<% } %>',
                        '<div class="page-number margin-left-10">',
                            '<label><%= scope.txtPage %></label>',
                            '<div id="print-number-page" class="margin-left-4"></div>',
                            '<label id="print-count-page" class="margin-left-4"><%= scope.txtOf %></label>',
                        '</div>',
                        '<label id="print-active-sheet"><%= scope.txtSheet %></label>',
                    '</div>',
                '</div>',
                '<div id="print-preview-empty" class="hidden">',
                    '<div><%= scope.txtEmptyTable %></div>',
                '</div>',
            '</div>'
        ].join('')),

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);

            this.menu = options.menu;

            this._initSettings = true;
            this.extendedPrintTitles = Common.localStorage.getBool('sse-print-titles-extended', true);
        },

        render: function(node) {
            var me = this;

            var $markup = $(this.template({scope: this, isRTL: Common.UI.isRTL()}));

            this.cmbRange = new Common.UI.ComboBox({
                el: $markup.findById('#print-combo-range'),
                menuStyle: 'min-width: 248px;max-height: 280px;',
                editable: false,
                takeFocusOnClose: true,
                cls: 'input-group-nr',
                data: [
                    { value: Asc.c_oAscPrintType.ActiveSheets, displayValue: this.txtActiveSheets },
                    { value: Asc.c_oAscPrintType.EntireWorkbook, displayValue: this.txtAllSheets },
                    { value: Asc.c_oAscPrintType.Selection, displayValue: this.txtSelection }
                ],
                dataHint: '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.cmbRange.on('selected', _.bind(this.comboRangeChange, this));

            this.chIgnorePrintArea = new Common.UI.CheckBox({
                el: $markup.findById('#print-chb-ignore'),
                labelText: this.txtIgnore,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            this.spnPagesFrom = new Common.UI.MetricSpinner({
                el: $markup.findById('#print-spin-pages-from'),
                step: 1,
                width: 60,
                defaultUnit : '',
                value: '',
                maxValue: 1000000,
                minValue: 1,
                allowDecimal: false,
                allowBlank: true,
                maskExp: /[0-9]/,
                dataHint: '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });

            this.spnPagesTo = new Common.UI.MetricSpinner({
                el: $markup.findById('#print-spin-pages-to'),
                step: 1,
                width: 60,
                defaultUnit : '',
                value: '',
                maxValue: 1000000,
                minValue: 1,
                allowDecimal: false,
                allowBlank: true,
                maskExp: /[0-9]/,
                dataHint: '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });

            this.spnCopies = new Common.UI.MetricSpinner({
                el: $markup.findById('#print-txt-copies'),
                step: 1,
                width: 60,
                defaultUnit : '',
                value: 1,
                maxValue: 32767,
                minValue: 1,
                allowDecimal: false,
                maskExp: /[0-9]/,
                dataHint: '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });

            this.cmbSides = new Common.UI.ComboBox({
                el          : $markup.findById('#print-combo-sides'),
                menuStyle   : 'width:100%;',
                editable: false,
                takeFocusOnClose: true,
                cls         : 'input-group-nr',
                data        : [
                    { value: 'one', displayValue: this.txtOneSide, descValue: this.txtOneSideDesc },
                    { value: 'both-long', displayValue: this.txtBothSides, descValue: this.txtBothSidesLongDesc },
                    { value: 'both-short', displayValue: this.txtBothSides, descValue: this.txtBothSidesShortDesc }
                ],
                itemsTemplate: _.template([
                    '<% _.each(items, function(item) { %>',
                    '<li id="<%= item.id %>" data-value="<%- item.value %>"><a tabindex="-1" type="menuitem" style ="display: flex; flex-direction: column;">',
                    '<label class="font-weight-bold"><%= scope.getDisplayValue(item) %></label><label class="comment-text"><%= item.descValue %></label></a></li>',
                    '<% }); %>'
                ].join('')),
                dataHint: '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.cmbSides.setValue('one');

            this.cmbSheet = new Common.UI.ComboBox({
                el: $markup.findById('#print-combo-sheets'),
                menuStyle: 'min-width: 248px;max-height: 280px;',
                editable: false,
                cls: 'input-group-nr',
                data: [],
                takeFocusOnClose: true,
                dataHint: '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });

            var paperSizeItemsTemplate = !Common.UI.isRTL() ?
                    _.template([
                        '<% _.each(items, function(item) { %>',
                        '<li id="<%= item.id %>" data-value="<%- item.value %>"><a tabindex="-1" type="menuitem">',
                        '<%= item.displayValue[0] %>',
                        ' (<%= item.displayValue[1] %> <%= item.displayValue[3] %> x',
                        ' <%= item.displayValue[2] %> <%= item.displayValue[3] %>)',
                        '</a></li>',
                        '<% }); %>'
                    ].join('')) :
                    _.template([
                        '<% _.each(items, function(item) { %>',
                        '<li id="<%= item.id %>" data-value="<%- item.value %>"><a tabindex="-1" type="menuitem" dir="ltr">',
                        '(<span dir="rtl"><%= item.displayValue[2] %> <%= item.displayValue[3] %></span>',
                        '<span> x </span>',
                        '<span dir="rtl"><%= item.displayValue[1] %> <%= item.displayValue[3] %></span>)',
                        '<span> <%= item.displayValue[0] %></span>',
                        '</a></li>',
                        '<% }); %>'
                    ].join(''));

            var paperSizeTemplate = _.template([
                '<div class="input-group combobox input-group-nr <%= cls %>" id="<%= id %>" style="<%= style %>">',
                '<div class="form-control" style="padding-top:3px; line-height: 14px; cursor: pointer; width: 248px; <%= style %>"',
                (Common.UI.isRTL() ? 'dir="rtl"' : ''), '></div>',
                '<div style="display: table-cell;"></div>',
                '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>',
                '<ul class="dropdown-menu <%= menuCls %>" style="<%= menuStyle %>" role="menu">'].concat(paperSizeItemsTemplate).concat([
                '</ul>',
                '</div>'
            ]).join(''));

            this.cmbPaperSize = new Common.UI.ComboBoxCustom({
                el: $markup.findById('#print-combo-pages'),
                menuStyle: 'max-height: 280px; min-width: 248px;',
                editable: false,
                takeFocusOnClose: true,
                template: paperSizeTemplate,
                itemsTemplate: paperSizeItemsTemplate,
                data: [
                    {value:'215.9|279.4',    displayValue:['US Letter', '21,59', '27,94', 'cm'], caption: 'US Letter'},
                    {value:'215.9|355.6',    displayValue:['US Legal', '21,59', '35,56', 'cm'], caption: 'US Legal'},
                    {value:'210|297',        displayValue:['A4', '21', '29,7', 'cm'], caption: 'A4'},
                    {value:'148|210',        displayValue:['A5', '14,8', '21', 'cm'], caption: 'A5'},
                    {value:'176|250',        displayValue:['B5', '17,6', '25', 'cm'], caption: 'B5'},
                    {value:'104.8|241.3',    displayValue:['Envelope #10', '10,48', '24,13', 'cm'], caption: 'Envelope #10'},
                    {value:'110|220',        displayValue:['Envelope DL', '11', '22', 'cm'], caption: 'Envelope DL'},
                    {value:'279.4|431.8',    displayValue:['Tabloid', '27,94', '43,18', 'cm'], caption: 'Tabloid'},
                    {value:'297|420',        displayValue:['A3', '29,7', '42', 'cm'], caption: 'A3'},
                    {value:'296.9|457.2',    displayValue:['Tabloid Oversize', '29,69', '45,72', 'cm'], caption: 'Tabloid Oversize'},
                    {value:'196.8|273',      displayValue:['ROC 16K', '19,68', '27,3', 'cm'], caption: 'ROC 16K'},
                    {value:'120|235',        displayValue:['Envelope Choukei 3', '12', '23,5', 'cm'], caption: 'Envelope Choukei 3'},
                    {value:'305|487',        displayValue:['Super B/A3', '30,5', '48,7', 'cm'], caption: 'Super B/A3'}
                ],
                dataHint: '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                updateFormControl: function (record){
                    var formcontrol = $(this.el).find('.form-control');
                    if (record) {
                        if (!Common.UI.isRTL()) {
                            formcontrol[0].innerHTML = record.get('displayValue')[0] + ' (' + record.get('displayValue')[1] + ' ' + record.get('displayValue')[3] + ' x ' +
                                record.get('displayValue')[2] + ' ' + record.get('displayValue')[3] + ')';
                        } else {
                            formcontrol[0].innerHTML = '<span dir="ltr">(<span dir="rtl">' + record.get("displayValue")[2] + ' ' + record.get('displayValue')[3] + '</span>' +
                                '<span> x </span>' + '<span dir="rtl">' + record.get('displayValue')[1] + ' ' + record.get('displayValue')[3] + '</span>)' +
                                '<span> ' + record.get('displayValue')[0] + '</span></span>';
                        }
                    } else
                        formcontrol[0].innerHTML = '';
                }
            });

            this.cmbPaperOrientation = new Common.UI.ComboBox({
                el          : $markup.findById('#print-combo-orient'),
                menuStyle   : 'min-width: 134px;',
                editable    : false,
                takeFocusOnClose: true,
                cls         : 'input-group-nr',
                data        : [
                    { value: Asc.c_oAscPageOrientation.PagePortrait, displayValue: this.txtPortrait },
                    { value: Asc.c_oAscPageOrientation.PageLandscape, displayValue: this.txtLandscape }
                ],
                dataHint: '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });

            var itemsTemplate =
                _.template([
                    '<% _.each(items, function(item) { %>',
                    '<li id="<%= item.id %>" data-value="<%= item.value %>" <% if (item.value === "customoptions") { %> class="border-top" style="margin-top: 5px;padding-top: 5px;" <% } %> ><a tabindex="-1" type="menuitem">',
                    '<%= scope.getDisplayValue(item) %>',
                    '</a></li>',
                    '<% }); %>'
                ].join(''));
            this.cmbLayout = new Common.UI.ComboBox({
                el          : $markup.findById('#print-combo-layout'),
                menuStyle   : 'min-width: 248px;',
                editable    : false,
                takeFocusOnClose: true,
                cls         : 'input-group-nr',
                data        : [
                    { value: 0, displayValue: this.txtActualSize },
                    { value: 1, displayValue: this.txtFitPage },
                    { value: 2, displayValue: this.txtFitCols },
                    { value: 3, displayValue: this.txtFitRows },
                    { value: 'customoptions', displayValue: this.txtCustomOptions }
                ],
                itemsTemplate: itemsTemplate,
                dataHint: '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });

            this.txtRangeTop = new Common.UI.InputField({
                el: $markup.findById('#print-txt-top'),
                allowBlank: true,
                validateOnChange: true,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            this.btnPresetsTop = new Common.UI.Button({
                parentEl: $markup.findById('#print-presets-top'),
                cls: 'btn-text-menu-default',
                caption: this.txtRepeat,
                style: 'width: 95px;',
                menu: true,
                takeFocusOnClose: true,
                dataHint: '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });

            this.txtRangeLeft = new Common.UI.InputField({
                el: $markup.findById('#print-txt-left'),
                allowBlank: true,
                validateOnChange: true,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            this.btnPresetsLeft = new Common.UI.Button({
                parentEl: $markup.findById('#print-presets-left'),
                cls: 'btn-text-menu-default',
                caption: this.txtRepeat,
                style: 'width: 95px;',
                menu: true,
                takeFocusOnClose: true,
                dataHint: '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });

            this.$printTitlesHeader = $markup.find('.print-titles-header');
            this.$printTitlesHeader.on('click', _.bind(this.expandPrintTitles, this));

            this.$printTitlesBlock = $markup.find('.print-titles-container');
            if (!this.extendedPrintTitles) {
                this.$printTitlesBlock.addClass('no-expand');
            }

            this.cmbPaperMargins = new Common.UI.ComboBox({
                el: $markup.findById('#print-combo-margins'),
                menuStyle: 'max-height: 280px; min-width: 248px;',
                editable: false,
                takeFocusOnClose: true,
                cls: 'input-group-nr',
                data: [
                    { value: 0, displayValue: this.txtMarginsNormal, size: [19.1, 17.8, 19.1, 17.8]},
                    { value: 1, displayValue: this.txtMarginsNarrow, size: [19.1, 6.4, 19.1, 6.4]},
                    { value: 2, displayValue: this.txtMarginsWide, size: [25.4, 25.4, 25.4, 25.4]},
                    { value: -1, displayValue: this.txtCustom, size: null}
                ],
                itemsTemplate: _.template([
                    '<% _.each(items, function(item) { %>',
                        '<li id="<%= item.id %>" data-value="<%- item.value %>"><a tabindex="-1" type="menuitem">',
                        '<div><b><%= scope.getDisplayValue(item) %></b></div>',
                        '<% if (item.size !== null) { %><div style="display: inline-block;margin-right: 20px;min-width: 80px;">' +
                        '<label style="display: block;">' + this.txtTop + ': <%= parseFloat(Common.Utils.Metric.fnRecalcFromMM(item.size[0]).toFixed(2)) %> <%= Common.Utils.Metric.getCurrentMetricName() %></label>' +
                        '<label style="display: block;">' + this.txtLeft + ': <%= parseFloat(Common.Utils.Metric.fnRecalcFromMM(item.size[1]).toFixed(2)) %> <%= Common.Utils.Metric.getCurrentMetricName() %></label></div><div style="display: inline-block;">' +
                        '<label style="display: block;">' + this.txtBottom + ': <%= parseFloat(Common.Utils.Metric.fnRecalcFromMM(item.size[2]).toFixed(2)) %> <%= Common.Utils.Metric.getCurrentMetricName() %></label>' +
                        '<label style="display: block;">' + this.txtRight + ': <%= parseFloat(Common.Utils.Metric.fnRecalcFromMM(item.size[3]).toFixed(2)) %> <%= Common.Utils.Metric.getCurrentMetricName() %></label></div>' +
                        '<% } %>',
                    '<% }); %>'
                ].join('')),
                dataHint: '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });

            this.chPrintGrid = new Common.UI.CheckBox({
                el: $markup.findById('#print-chb-grid'),
                labelText: this.txtPrintGrid,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            this.chPrintRows = new Common.UI.CheckBox({
                el: $markup.findById('#print-chb-rows'),
                labelText: this.txtPrintHeadings,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            this.spnFirstPage = new Common.UI.MetricSpinner({
                el: $markup.findById('#print-spin-first-page'),
                step: 1,
                width: 60,
                defaultUnit : "",
                value: '1',
                maxValue: 32767,
                minValue: -32767,
                allowDecimal: false,
                maskExp: /[0-9,\-]/,
                dataHint: '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });

            /*this.btnApplyAll = new Common.UI.Button({
                el: $markup.findById('#print-apply-all')
            });*/

            this.pnlSettings = $markup.find('.flex-settings').addBack().filter('.flex-settings');
            this.pnlApply = $markup.find('.fms-flex-apply').addBack().filter('.fms-flex-apply');
            this.pnlTable = $(this.pnlSettings.find('table')[0]);
            this.trApply = $markup.find('.fms-btn-apply');

            this.btnsSave = [];
            this.btnsPrint = [];
            if (this.mode.isDesktopApp) {
                this.btnsPrintPDF = [];
                for (var i=0; i<2; i++) {
                    var table =
                        ['<table>',
                            '<tr>',
                                '<td><button id="print-btn-print-<%= index %>" class="btn normal dlg-btn primary auto" result="print" data-hint="2" data-hint-direction="bottom" data-hint-offset="big"><%= scope.txtPrint %></button></td>',
                                '<td><button id="print-btn-print-pdf-<%= index %>" class="btn normal dlg-btn auto" result="save-pdf" data-hint="2" data-hint-direction="bottom" data-hint-offset="big"><%= scope.txtPrintToPDF %></button></td>',
                                '<td><button id="print-btn-save-<%= index %>" class="btn normal dlg-btn auto" result="save" data-hint="2" data-hint-direction="bottom" data-hint-offset="big"><%= scope.txtSave %></button></td>',
                            '</tr>', '</table>',
                        ].join('');
                    var tableTemplate = _.template(table)({scope: this, index: i});
                    $($markup.find('.footer')[i]).html(tableTemplate);
                    this.btnsPrintPDF.push(new Common.UI.Button({
                        el: $markup.findById('#print-btn-print-pdf-'+i)
                    }));
                }
                $markup.find('.footer').addClass('footer-with-pdf');
            }

            for (var i=0; i<2; i++) {
                this.btnsSave.push(new Common.UI.Button({
                    el: $markup.findById('#print-btn-save-'+i)
                }));
                this.btnsPrint.push(new Common.UI.Button({
                    el: $markup.findById('#print-btn-print-'+i)
                }));
            }

            this.btnPrevPage = new Common.UI.Button({
                parentEl: $markup.findById('#print-prev-page'),
                cls: 'btn-prev-page',
                iconCls: 'arrow',
                scaling: false,
                dataHint: '2',
                dataHintDirection: 'top'
            });

            this.btnNextPage = new Common.UI.Button({
                parentEl: $markup.findById('#print-next-page'),
                cls: 'btn-next-page',
                iconCls: 'arrow',
                scaling: false,
                dataHint: '2',
                dataHintDirection: 'top'
            });

            this.countOfPages = $markup.findById('#print-count-page');

            this.txtNumberPage = new Common.UI.InputField({
                el: $markup.findById('#print-number-page'),
                allowBlank: true,
                validateOnChange: true,
                style: 'width: 50px;',
                maskExp: /[0-9]/,
                validation: function(value) {
                    if (/(^[0-9]+$)/.test(value)) {
                        value = parseInt(value);
                        if (undefined !== value && value > 0 && value <= me.pageCount)
                            return true;
                    }

                    return me.txtPageNumInvalid;
                },
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            this.txtActiveSheet = $markup.findById('#print-active-sheet');

            this.$el = $(node).html($markup);
            this.$el.on('click', '#print-header-footer-settings', _.bind(this.openHeaderSettings, this));
            this.$previewBox = $('#print-preview-box');
            this.$previewEmpty = $('#print-preview-empty');

            this.applyMode();

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

            this.updateMetricUnit();

            this.fireEvent('render:after', this);

            return this;
        },

        show: function() {
            Common.UI.BaseView.prototype.show.call(this,arguments);
            if (this._initSettings) {
                this.updateMetricUnit();
                this._initSettings = false;
            }
            this.updateScroller();
            this.fireEvent('show', this);
        },

        updateScroller: function() {
            if (this.scroller) {
                Common.UI.Menu.Manager.hideAll();
                var scrolled = this.$el.height()< this.pnlTable.height() + 25 + this.pnlApply.height() + this.$el.find('.main-header').outerHeight(true);
                this.pnlApply.toggleClass('hidden', !scrolled);
                this.trApply.toggleClass('hidden', scrolled);
                this.pnlSettings.css('overflow', scrolled ? 'hidden' : 'visible');
                this.scroller.update();
                this.pnlSettings.toggleClass('bordered', this.scroller.isVisible());
            }
        },

        setMode: function(mode) {
            this.mode = mode;
            !this._initSettings && this.applyMode();
        },

        applyMode: function() {
            if (!this.mode || !this.$el) return;
            this.$el.find('.header-settings')[this.mode.isEdit ? 'show' : 'hide']();
            !this.mode.isDesktopApp && this.$el.find('.desktop-settings').hide();
        },

        setApi: function(api) {

        },

        updateMetricUnit: function() {
            var store = this.cmbPaperSize.store;
            for (var i=0; i<store.length; i++) {
                var item = store.at(i),
                    value = item.get('value'),
                    pagewidth = /^\d{3}\.?\d*/.exec(value),
                    pageheight = /\d{3}\.?\d*$/.exec(value);

                item.set('displayValue', [item.get('caption'),
                    parseFloat(Common.Utils.Metric.fnRecalcFromMM(pagewidth).toFixed(2)),
                    parseFloat(Common.Utils.Metric.fnRecalcFromMM(pageheight).toFixed(2)),
                    Common.Utils.Metric.getCurrentMetricName()]);
            }
            this.cmbPaperSize.onResetItems();
            this.cmbPaperMargins.onResetItems();
        },

        addCustomScale: function (add) {
            if (add) {
                this.cmbLayout.setData([
                    { value: 0, displayValue: this.txtActualSize },
                    { value: 1, displayValue: this.txtFitPage },
                    { value: 2, displayValue: this.txtFitCols },
                    { value: 3, displayValue: this.txtFitRows },
                    { value: 4, displayValue: this.txtCustom },
                    { value: 'customoptions', displayValue: this.txtCustomOptions }
                ]);
            } else {
                this.cmbLayout.setData([
                    { value: 0, displayValue: this.txtActualSize },
                    { value: 1, displayValue: this.txtFitPage },
                    { value: 2, displayValue: this.txtFitCols },
                    { value: 3, displayValue: this.txtFitRows },
                    { value: 'customoptions', displayValue: this.txtCustomOptions }
                ]);
            }
        },

        applySettings: function() {
            if (this.menu) {
                this.menu.hide();
                // this.menu.fireEvent('settings:apply', [this.menu]);
            }
        },

        isVisible: function() {
            return (this.$el || $(this.el)).is(":visible");
        },

        setRange: function(value) {
            this.cmbRange.setValue(value);
        },

        getRange: function() {
            return this.cmbRange.getValue();
        },

        setIgnorePrintArea: function(value) {
            this.chIgnorePrintArea.setValue(value);
        },

        getIgnorePrintArea: function() {
            return (this.chIgnorePrintArea.getValue()=='checked');
        },

        getPagesFrom: function () {
            return this.spnPagesFrom.getNumberValue();
        },

        getPagesTo: function () {
            return this.spnPagesTo.getNumberValue();
        },

        comboRangeChange: function(combo, record) {
            this.fireEvent('changerange', this);
        },

        openHeaderSettings: function() {
            this.fireEvent('openheader', this);
        },

        updateCountOfPages: function (count) {
            this.countOfPages.text(
                Common.Utils.String.format(this.txtOf, count)
            );
            this.pageCount = count;
        },

        updateActiveSheet: function (name) {
            this.txtActiveSheet.text(
                Common.Utils.String.format(this.txtSheet, name)
            );
        },

        updateCurrentPage: function (index) {
            this.txtNumberPage.setValue(index + 1);
        },

        expandPrintTitles: function () {
            this.extendedPrintTitles = !this.extendedPrintTitles;
            this.$printTitlesBlock[this.extendedPrintTitles ? 'removeClass' : 'addClass']('no-expand');
            Common.localStorage.setBool('sse-print-titles-extended', this.extendedPrintTitles);
        },

        txtPrint: 'Print',
        txtSave: 'Save',
        txtPrintToPDF: 'Print to PDF',
        txtPrintRange: 'Print range',
        txtCurrentSheet: 'Current sheet',
        txtActiveSheets: 'Active sheets',
        txtPages: 'Pages:',
        txtTo: 'to',
        txtAllSheets: 'All sheets',
        txtSelection: 'Selection',
        txtSettingsOfSheet: 'Settings of sheet',
        txtPageSize: 'Page size',
        txtPageOrientation: 'Page orientation',
        txtPortrait: 'Portrait',
        txtLandscape: 'Landscape',
        txtScaling: 'Scaling',
        txtActualSize: 'Actual Size',
        txtFitPage: 'Fit Sheet on One Page',
        txtFitCols: 'Fit All Columns on One Page',
        txtFitRows: 'Fit All Rows on One Pag',
        txtCustom: 'Custom',
        txtCustomOptions: 'Custom Options',
        txtPrintTitles: 'Print titles',
        txtRepeatRowsAtTop: 'Repeat rows at top',
        txtRepeatColumnsAtLeft: 'Repeat columns at left',
        txtRepeat: 'Repeat...',
        txtMargins: 'Margins',
        txtTop: 'Top',
        txtBottom: 'Bottom',
        txtLeft: 'Left',
        txtRight: 'Right',
        txtGridlinesAndHeadings: 'Gridlines and headings',
        txtPrintGrid: 'Print gridlines',
        txtPrintHeadings: 'Print row and columns headings',
        txtHeaderFooterSettings: 'Header/footer settings',
        txtApplyToAllSheets: 'Apply to all sheets',
        txtIgnore: 'Ignore print area',
        txtPage: 'Page',
        txtOf: 'of {0}',
        txtSheet: 'Sheet: {0}',
        txtPageNumInvalid: 'Page number invalid',
        txtEmptyTable: 'There is nothing to print because the table is empty',
        txtFirstPageNumber: 'First page number:',
        txtCopies: 'Copies',
        txtPrintSides: 'Print sides',
        txtOneSide: 'Print one sided',
        txtOneSideDesc: 'Only print on one side of the page',
        txtBothSides: 'Print on both sides',
        txtBothSidesLongDesc: 'Flip pages on long edge',
        txtBothSidesShortDesc: 'Flip pages on short edge',
        txtMarginsNormal: 'Normal',
        txtMarginsNarrow: 'Narrow',
        txtMarginsWide: 'Wide',
        txtMarginsLast: 'Last Custom'

    }, SSE.Views.PrintWithPreview || {}));

});
