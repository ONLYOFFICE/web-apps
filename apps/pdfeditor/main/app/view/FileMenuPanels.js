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
 *    Created on 20 February 2014
 *
 */

define([], function () {
    'use strict';

    !PDFE.Views.FileMenuPanels && (PDFE.Views.FileMenuPanels = {});

    PDFE.Views.FileMenuPanels.ViewSaveAs = Common.UI.BaseView.extend({
        el: '#panel-saveas',
        menu: undefined,

        formats: [[
            {name: 'DOCX',  imgCls: 'docx',  type: Asc.c_oAscFileType.DOCX},
            {name: 'PDF',   imgCls: 'pdf',   type: Asc.c_oAscFileType.PDF},
            {name: 'ODT',   imgCls: 'odt',   type: Asc.c_oAscFileType.ODT}
        ],[
            {name: 'DOTX',  imgCls: 'dotx',  type: Asc.c_oAscFileType.DOTX},
            {name: 'PDFA',  imgCls: 'pdfa',  type: Asc.c_oAscFileType.PDFA},
            {name: 'OTT',   imgCls: 'ott',   type: Asc.c_oAscFileType.OTT}
        ],[
            {name: 'RTF',   imgCls: 'rtf',   type: Asc.c_oAscFileType.RTF},
            {name: 'TXT',   imgCls: 'txt',   type: Asc.c_oAscFileType.TXT},
            {name: 'FB2',   imgCls: 'fb2',  type: Asc.c_oAscFileType.FB2},
            {name: 'EPUB',  imgCls: 'epub',  type: Asc.c_oAscFileType.EPUB},
            {name: 'HTML (Zipped)',  imgCls: 'html',  type: Asc.c_oAscFileType.HTML}
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
            this.mode = options.mode;

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
            if (/^pdf$/.test(this.fileType)) {
                !(this.mode && this.mode.isForm) && this.formats[0].splice(1, 1, {name: 'PDF',  imgCls: 'pdf', type: ''}); // remove pdf
                this.formats[1].splice(1, 1); // remove pdfa
            } else if (/^xps|oxps$/.test(this.fileType)) {
                this.formats[0].push({name: this.fileType.toUpperCase(),  imgCls: this.fileType, type: ''}); // original xps/oxps
            } else if (/^djvu$/.test(this.fileType)) {
                this.formats = [[
                    {name: 'DJVU',  imgCls: 'djvu',  type: ''}, // original djvu
                    {name: 'PDF',   imgCls: 'pdf',   type: Asc.c_oAscFileType.PDF}
                ]];
            }

            this.$el.html(this.template({rows:this.formats,
                fileType: (this.fileType || 'docx').toLowerCase(),
                header: /*this.textDownloadAs*/ Common.Locale.get('btnDownloadCaption', {name:'PDFE.Views.FileMenu', default:this.textDownloadAs})}));

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
                this.menu.fireEvent('saveas:format', [this.menu, type.value ? parseInt(type.value) : undefined]);
            }
        },

        textDownloadAs: "Download as"
    });

    PDFE.Views.FileMenuPanels.ViewSaveCopy = Common.UI.BaseView.extend({
        el: '#panel-savecopy',
        menu: undefined,

        formats: [[
            {name: 'DOCX',  imgCls: 'docx',  type: Asc.c_oAscFileType.DOCX, ext: '.docx'},
            {name: 'PDF',   imgCls: 'pdf',   type: Asc.c_oAscFileType.PDF, ext: '.pdf'},
            {name: 'ODT',   imgCls: 'odt',   type: Asc.c_oAscFileType.ODT, ext: '.odt'}
        ],[
            {name: 'DOTX',  imgCls: 'dotx',  type: Asc.c_oAscFileType.DOTX, ext: '.dotx'},
            {name: 'PDFA',  imgCls: 'pdfa',  type: Asc.c_oAscFileType.PDFA, ext: '.pdf'},
            {name: 'OTT',   imgCls: 'ott',   type: Asc.c_oAscFileType.OTT, ext: '.ott'}
        ],[
            {name: 'RTF',   imgCls: 'rtf',   type: Asc.c_oAscFileType.RTF, ext: '.rtf'},
            {name: 'TXT',   imgCls: 'txt',   type: Asc.c_oAscFileType.TXT, ext: '.txt'},
            {name: 'FB2',   imgCls: 'fb2',  type: Asc.c_oAscFileType.FB2, ext: '.fb2'},
            {name: 'EPUB',  imgCls: 'epub',  type: Asc.c_oAscFileType.EPUB, ext: '.epub'},
            {name: 'HTML (Zipped)',  imgCls: 'html',  type: Asc.c_oAscFileType.HTML, ext: '.html'}
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
            this.mode = options.mode;

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
            if (/^pdf$/.test(this.fileType)) {
                !(this.mode && this.mode.isForm) && this.formats[0].splice(1, 1, {name: 'PDF',  imgCls: 'pdf', type: '', ext: true}); // remove pdf
                this.formats[1].splice(1, 1); // remove pdfa
            } else if (/^xps|oxps$/.test(this.fileType)) {
                this.formats[0].push({name: this.fileType.toUpperCase(),  imgCls: this.fileType, type: '', ext: true}); // original xps/oxps
            } else if (/^djvu$/.test(this.fileType)) {
                this.formats = [[
                    {name: 'DJVU',  imgCls: 'djvu',  type: '', ext: true}, // original djvu
                    {name: 'PDF',   imgCls: 'pdf',   type: Asc.c_oAscFileType.PDF, ext: '.pdf'}
                ]];
            }

            this.$el.html(this.template({rows:this.formats,
                fileType: (this.fileType || 'docx').toLowerCase(),
                header: /*this.textSaveCopyAs*/ Common.Locale.get('btnSaveCopyAsCaption', {name:'PDFE.Views.FileMenu', default:this.textSaveCopyAs})}));
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
                this.menu.fireEvent('saveas:format', [this.menu, type.value ? parseInt(type.value) : undefined, ext.value]);
            }
        },

        textSaveCopyAs: "Save Copy as"
    });

    PDFE.Views.FileMenuPanels.Settings = Common.UI.BaseView.extend(_.extend({
        el: '#panel-settings',
        menu: undefined,

        template: _.template([
        '<div class="flex-settings">',
            '<div class="header"><%= scope.txtAdvancedSettings %></div>',
            '<table><tbody>',
                '<tr class="editsave">',
                    '<td colspan="2" class="group-name top"><label><%= scope.txtEditingSaving %></label></td>',
                '</tr>',
                '<tr class="autosave">',
                    '<td colspan="2"><span id="fms-chb-autosave"></span></td>',
                '</tr>',
                '<tr class="forcesave">',
                    '<td colspan="2"><span id="fms-chb-forcesave"></span></td>',
                '</tr>',
                '<tr class ="editsave divider-group"></tr>',
                '<tr class="collaboration">',
                    '<td colspan="2" class="group-name"><label><%= scope.txtCollaboration %></label></td>',
                '</tr>',
                '<tr class="coauth changes-mode">',
                    '<td colspan="2" class="subgroup-name"><label><%= scope.strCoAuthMode %></label></td>',
                '</tr>',
                '<tr class="coauth changes-mode">',
                    '<td colspan="2"><div style="display: flex;" role="radiogroup" aria-owns="fms-rb-coauth-mode-strict"><div id="fms-rb-coauth-mode-fast"></div>',
                    '<span style ="display: flex; flex-direction: column;"><label><%= scope.strFast %></label>',
                    '<label class="comment-text"><%= scope.txtFastTip %></label></span></div>',
                    '</td>',
                '</tr>',
                '<tr class="coauth changes-mode">',
                    '<td colspan="2"><div style="display: flex;"><div id="fms-rb-coauth-mode-strict"></div>',
                    '<span style ="display: flex; flex-direction: column;"><label><%= scope.strStrict %></label>',
                    '<label class="comment-text"><%= scope.txtStrictTip %></label></span>',
                    '</div></td>',
                '</tr>',
                '<tr class ="divider-subgroup coauth changes-mode"></tr>',
                '<tr class="coauth changes-show">',
                    '<td colspan="2" class="subgroup-name"><label><%= scope.strShowChanges %></label></td>',
                '</tr>',
                '<tr class="coauth changes-show">',
                    '<td colspan="2" role="radiogroup" aria-owns="fms-rb-show-changes-all fms-rb-show-changes-last"><div id="fms-rb-show-changes-none"></div></td>',
                '</tr>',
                '<tr class="coauth changes-show">',
                    '<td colspan="2"><div id="fms-rb-show-changes-all"></div></td>',
                '</tr>',
                '<tr class="coauth changes-show">',
                    '<td colspan="2"><div id="fms-rb-show-changes-last"></div></td>',
                '</tr>','<tr class="divider coauth changes-show"></tr>',
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
                '<td>',
                    '<div><div id="fms-cmb-theme"></div>',
                    '<div id="fms-chb-dark-mode"></div></div></td>',
                '</tr>',
                '<tr class="tab-style">',
                    '<td><label><%= scope.strTabStyle %></label></td>',
                    '<td><div id="fms-cmb-tab-style"></div></td>',
                '</tr>',
                '<tr class="tab-background">',
                    '<td colspan="2"><div id="fms-chb-tab-background"></div></td>',
                '</tr>',
                '<tr class ="collaboration divider-group"></tr>',
                '<tr>',
                    '<td colspan="2" class="group-name"><label><%= scope.txtWorkspace %></label></td>',
                '</tr>',
                '<tr>',
                    '<td colspan="2"><div id="fms-chb-scrn-reader"></div></td>',
                '</tr>',
                '<tr>',
                    '<td colspan="2"><div id="fms-chb-use-alt-key"></div></td>',
                '</tr>',
                '<tr class="edit">',
                    '<td colspan="2"><div id="fms-chb-annotation-bar"></div></td>',
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
                '<tr class="edit-pdf">',
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

            this.chUseAnnotateBar = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-annotation-bar'),
                labelText: this.txtUseAnnotateBar,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            this.chScreenReader = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-scrn-reader'),
                labelText: this.txtScreenReader,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            /** coauthoring begin **/
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
            /** coauthoring end **/

            this.chAutosave = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-autosave'),
                labelText: this.textAutoSave,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            }).on('change', function(field, newValue, oldValue, eOpts){
                if (field.getValue()!=='checked' && me.rbCoAuthModeFast.getValue()) {
                    me.rbCoAuthModeStrict.setValue(true);
                    me.onChangeCoAuthMode(me.rbCoAuthModeFast.getValue()?1:0);
                }
            });

            this.chForcesave = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-forcesave'),
                labelText: this.textForceSave,
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
                restoreMenuHeight: false,
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

            this.rbCoAuthModeFast = new Common.UI.RadioBox({
                el          :$markup.findById('#fms-rb-coauth-mode-fast'),
                name        : 'coauth-mode',
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small',
                ariaLabel: this.strFast + ' ' + this.txtFastTip
            });
            this.rbCoAuthModeFast.on('change', function(field, newValue, eOpts){
                if (newValue) {
                    me.chAutosave.setValue(1);
                    me.onChangeCoAuthMode(1);
                }
            });
            this.rbCoAuthModeFast.$el.parent().on('click', function (){me.rbCoAuthModeFast.setValue(true);});

            this.rbCoAuthModeStrict = new Common.UI.RadioBox({
                el          :$markup.findById('#fms-rb-coauth-mode-strict'),
                name        : 'coauth-mode',
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small',
                ariaLabel: this.strStrict + ' ' + this.txtStrictTip
            });
            this.rbCoAuthModeStrict.on('change', function(field, newValue, eOpts){
                newValue && me.onChangeCoAuthMode(0);
            });
            this.rbCoAuthModeStrict.$el.parent().on('click', function (){me.rbCoAuthModeStrict.setValue(true);});

            this.rbShowChangesNone = new Common.UI.RadioBox({
                el          :$markup.findById('#fms-rb-show-changes-none'),
                name        : 'show-changes',
                labelText   : this.txtNone,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            this.rbShowChangesAll = new Common.UI.RadioBox({
                el          :$markup.findById('#fms-rb-show-changes-all'),
                name        : 'show-changes',
                labelText   : this.txtAll,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            this.rbShowChangesLast = new Common.UI.RadioBox({
                el          :$markup.findById('#fms-rb-show-changes-last'),
                name        : 'show-changes',
                labelText   : this.txtLast,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });

            /** coauthoring end **/

            var itemsTemplate =
                _.template([
                    '<% _.each(items, function(item) { %>',
                    '<li id="<%= item.id %>" data-value="<%= item.value %>" <% if (item.value === "custom") { %> class="border-top" style="margin-top: 5px;padding-top: 5px;" <% } %> ><a tabindex="-1" type="menuitem" <% if (typeof(item.checked) !== "undefined" && item.checked) { %> class="checked" <% } %> ><%= scope.getDisplayValue(item) %></a></li>',
                    '<% }); %>'
                ].join(''));
            this.cmbFontRender = new Common.UI.ComboBox({
                el          : $markup.find('#fms-cmb-font-render'),
                style       : 'width: 160px;',
                editable    : false,
                restoreMenuHeightAndTop: true,
                menuStyle   : 'min-width:100%;',
                cls         : 'input-group-nr',
                itemsTemplate: itemsTemplate,
                data        : [
                    { value: 0, displayValue: this.txtWin },
                    { value: 1, displayValue: this.txtMac },
                    { value: 2, displayValue: this.txtNative },
                    { value: 'custom', displayValue: this.txtCacheMode }
                ],
                dataHint: '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.cmbFontRender.on('selected', _.bind(this.onFontRenderSelected, this));

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
                dataHint: '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });

            this.btnCustomizeQuickAccess = new Common.UI.Button({
                el: $markup.findById('#fms-btn-customize-quick-access')
            });
            this.btnCustomizeQuickAccess.on('click', _.bind(this.customizeQuickAccess, this));

            this.cmbTheme = new Common.UI.ComboBox({
                el          : $markup.findById('#fms-cmb-theme'),
                style       : 'width: 160px;',
                menuStyle   : 'min-width:100%;',
                editable    : false,
                restoreMenuHeightAndTop: true,
                cls         : 'input-group-nr',
                dataHint: '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            }).on('selected', function(combo, record) {
                me.chDarkMode.setDisabled(!Common.UI.Themes.isDarkTheme(record.value));
            });

            this.chDarkMode = new Common.UI.CheckBox({
                el: $markup.findById('#fms-chb-dark-mode'),
                labelText: this.txtDarkMode,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            $markup.find('.btn.primary').each(function(index, el){
                (new Common.UI.Button({
                    el: $(el)
                })).on('click', _.bind(me.applySettings, me));
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
                var scrolled = this.$el.height()< this.pnlTable.parent().height() + 25 + this.pnlApply.height();
                this.pnlApply.toggleClass('hidden', !scrolled);
                this.trApply.toggleClass('hidden', scrolled);
                this.pnlSettings.css('overflow', scrolled ? 'hidden' : 'visible');
                this.scroller.update();
                this.pnlSettings.toggleClass('bordered', this.scroller.isVisible());
                this.cmbZoom.options.menuAlignEl = scrolled ? this.pnlSettings : null;
                this.cmbUnit.options.menuAlignEl = scrolled ? this.pnlSettings : null;
                this.cmbFontRender.options.menuAlignEl = scrolled ? this.pnlSettings : null;
                this.cmbTheme.options.menuAlignEl = scrolled ? this.pnlSettings : null;
                this.cmbTabStyle.options.menuAlignEl = scrolled ? this.pnlSettings : null;
            }
        },

        setMode: function(mode) {
            this.mode = mode;

            var fast_coauth = Common.Utils.InternalSettings.get("pdfe-settings-coauthmode"),
                canPDFSave = (mode.isPDFAnnotate || mode.isPDFEdit) && mode.canSaveToFile && !mode.isOffline;

            $('tr.edit', this.el)[mode.isEdit?'show':'hide']();
            $('tr.edit-pdf', this.el)[mode.isPDFEdit?'show':'hide']();
            $('tr.autosave', this.el)[mode.isEdit && canPDFSave && (mode.canChangeCoAuthoring || !fast_coauth) ? 'show' : 'hide']();
            $('tr.forcesave', this.el)[mode.canForcesave && canPDFSave ? 'show' : 'hide']();
            $('tr.editsave',this.el)[(mode.isEdit  || mode.canForcesave) && canPDFSave ? 'show' : 'hide']();
            if (this.mode.isDesktopApp && this.mode.isOffline) {
                this.chAutosave.setCaption(this.textAutoRecover);
            }
            /** coauthoring begin **/
            $('tr.collaboration', this.el)[mode.canCoAuthoring && !mode.isForm || mode.canViewReview ? 'show' : 'hide']();
            $('tr.coauth.changes-mode', this.el)[mode.isEdit && !mode.isOffline && mode.canCoAuthoring && mode.canChangeCoAuthoring && canPDFSave ? 'show' : 'hide']();
            $('tr.coauth.changes-show', this.el)[mode.isEdit && !mode.isOffline && mode.canCoAuthoring && canPDFSave ? 'show' : 'hide']();
            $('tr.comments', this.el)[mode.canCoAuthoring && !mode.isForm ? 'show' : 'hide']();
            $('tr.ui-rtl', this.el)[mode.uiRtl ? 'show' : 'hide']();
            /** coauthoring end **/
            $('tr.tab-background', this.el)[!Common.Utils.isIE && Common.UI.FeaturesManager.canChange('tabBackground', true) ? 'show' : 'hide']();
            $('tr.tab-style', this.el)[Common.UI.FeaturesManager.canChange('tabStyle', true) ? 'show' : 'hide']();
            $('tr.quick-print', this.el)[mode.canQuickPrint && !(mode.compactHeader && mode.isEdit) ? 'show' : 'hide']();
            if ( !Common.UI.Themes.available() ) {
                $('tr.themes, tr.themes + tr.divider', this.el).hide();
            }

            if (mode.compactHeader) {
                $('tr.quick-access', this.el).hide();
            }
        },

        setApi: function(o) {
            this.api = o;
            return this;
        },

        updateSettings: function() {
            this.chUseAltKey.setValue(Common.Utils.InternalSettings.get("pdfe-settings-show-alt-hints"));
            this.chScreenReader.setValue(Common.Utils.InternalSettings.get("app-settings-screen-reader"));
            this.chUseAnnotateBar.setValue(Common.Utils.InternalSettings.get("pdfe-settings-annot-bar"));

            var value = Common.Utils.InternalSettings.get("pdfe-settings-zoom");
            value = (value!==null) ? parseInt(value) : (this.mode.customization && this.mode.customization.zoom ? parseInt(this.mode.customization.zoom) : 100);
            var item = this.cmbZoom.store.findWhere({value: value});
            this.cmbZoom.setValue(item ? parseInt(item.get('value')) : (value>0 ? value+'%' : 100));

            /** coauthoring begin **/
            this.chLiveComment.setValue(Common.Utils.InternalSettings.get("pdfe-settings-livecomment"));
            this.chResolvedComment.setValue(Common.Utils.InternalSettings.get("pdfe-settings-resolvedcomment"));

            var fast_coauth = Common.Utils.InternalSettings.get("pdfe-settings-coauthmode");
            this.rbCoAuthModeFast.setValue(fast_coauth);
            this.rbCoAuthModeStrict.setValue(!fast_coauth);
            this.fillShowChanges(fast_coauth);

            value = Common.Utils.InternalSettings.get((fast_coauth) ? "pdfe-settings-showchanges-fast" : "pdfe-settings-showchanges-strict");

            this.rbShowChangesNone.setValue(value=='none');
            this.rbShowChangesLast.setValue(value=='last');
            this.rbShowChangesAll.setValue(value=='all');
            /** coauthoring end **/

            value = Common.Utils.InternalSettings.get("pdfe-settings-fontrender");
            item = this.cmbFontRender.store.findWhere({value: parseInt(value)});
            this.cmbFontRender.setValue(item ? item.get('value') : 0);
            this._fontRender = this.cmbFontRender.getValue();

            value = Common.Utils.InternalSettings.get("pdfe-settings-cachemode");
            item = this.cmbFontRender.store.findWhere({value: 'custom'});
            item && value && item.set('checked', !!value);
            item && value && this.cmbFontRender.cmpEl.find('#' + item.get('id') + ' a').addClass('checked');

            value = Common.Utils.InternalSettings.get("pdfe-settings-unit");
            item = this.cmbUnit.store.findWhere({value: value});
            this.cmbUnit.setValue(item ? parseInt(item.get('value')) : Common.Utils.Metric.getDefaultMetric());
            this._oldUnits = this.cmbUnit.getValue();

            value = Common.Utils.InternalSettings.get("pdfe-settings-autosave");
            this.chAutosave.setValue(value == 1);

            if (this.mode.canForcesave)
                this.chForcesave.setValue(Common.Utils.InternalSettings.get("pdfe-settings-forcesave"));

            //this.chQuickPrint.setValue(Common.Utils.InternalSettings.get("pdfe-settings-quick-print-button"));

            var data = [];
            for (var t in Common.UI.Themes.map()) {
                data.push({value: t, displayValue: Common.UI.Themes.get(t).text, themeType: Common.UI.Themes.get(t).type});
            }

            if ( data.length ) {
                this.cmbTheme.setData(data);
                item = this.cmbTheme.store.findWhere({value: Common.UI.Themes.currentThemeId()});
                this.cmbTheme.setValue(item ? item.get('value') : Common.UI.Themes.defaultThemeId());
            }
            this.chDarkMode.setValue(Common.UI.Themes.isContentThemeDark());
            this.chDarkMode.setDisabled(!Common.UI.Themes.isDarkTheme());
            this.chRTL.setValue(Common.localStorage.getBool("ui-rtl", Common.Locale.isCurrentLanguageRtl()));
            this.chTabBack.setValue(Common.Utils.InternalSettings.get("settings-tab-background")==='toolbar');
            value = Common.Utils.InternalSettings.get("settings-tab-style");
            item = this.cmbTabStyle.store.findWhere({value: value});
            this.cmbTabStyle.setValue(item ? item.get('value') : 'fill');
        },

        applySettings: function() {
            Common.UI.Themes.setTheme(this.cmbTheme.getValue());
            if (!this.chDarkMode.isDisabled() && (this.chDarkMode.isChecked() !== Common.UI.Themes.isContentThemeDark()))
                Common.UI.Themes.toggleContentTheme();
            Common.localStorage.setItem("pdfe-settings-show-alt-hints", this.chUseAltKey.isChecked() ? 1 : 0);
            Common.Utils.InternalSettings.set("pdfe-settings-show-alt-hints", Common.localStorage.getBool("pdfe-settings-show-alt-hints"));

            Common.localStorage.setItem("pdfe-settings-zoom", this.cmbZoom.getValue());

            Common.localStorage.setItem("app-settings-screen-reader", this.chScreenReader.isChecked() ? 1 : 0);
            Common.localStorage.setItem("pdfe-settings-annot-bar", this.chUseAnnotateBar.isChecked() ? 1 : 0);
            Common.Utils.InternalSettings.set("pdfe-settings-annot-bar", Common.localStorage.getBool("pdfe-settings-annot-bar"));

            /** coauthoring begin **/
            Common.Utils.InternalSettings.set("pdfe-settings-livecomment", this.chLiveComment.isChecked());
            Common.Utils.InternalSettings.set("pdfe-settings-resolvedcomment", this.chResolvedComment.isChecked());
            if (this.mode.isEdit && !this.mode.isOffline && this.mode.canCoAuthoring) {
                this.mode.canChangeCoAuthoring && Common.localStorage.setItem("pdfe-settings-coauthmode", this.rbCoAuthModeFast.getValue() ? 1 : 0 );
                Common.localStorage.setItem(this.rbCoAuthModeFast.getValue() ? "pdfe-settings-showchanges-fast" : "pdfe-settings-showchanges-strict",
                    this.rbShowChangesNone.getValue()?'none':this.rbShowChangesLast.getValue()?'last':'all');
            }
            /** coauthoring end **/
            Common.localStorage.setItem("pdfe-settings-fontrender", this.cmbFontRender.getValue());
            var item = this.cmbFontRender.store.findWhere({value: 'custom'});
            Common.localStorage.setItem("pdfe-settings-cachemode", item && !item.get('checked') ? 0 : 1);
            if (this.mode.isEdit && (this.mode.canChangeCoAuthoring || !Common.Utils.InternalSettings.get("pdfe-settings-coauthmode")))
                Common.localStorage.setItem("pdfe-settings-autosave", this.chAutosave.isChecked() ? 1 : 0);
            if (this.mode.canForcesave)
                Common.localStorage.setItem("pdfe-settings-forcesave", this.chForcesave.isChecked() ? 1 : 0);

            Common.localStorage.setItem("pdfe-settings-unit", this.cmbUnit.getValue());

            var isRtlChanged = this.chRTL.$el.is(':visible') && Common.localStorage.getBool("ui-rtl", Common.Locale.isCurrentLanguageRtl()) !== this.chRTL.isChecked();
            Common.localStorage.setBool("ui-rtl", this.chRTL.isChecked());
            //Common.localStorage.setBool("pdfe-settings-quick-print-button", this.chQuickPrint.isChecked());
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

        fillShowChanges: function(fastmode) {
            if(fastmode)
                this.rbShowChangesLast.$el.parent().hide();
            else
                this.rbShowChangesLast.$el.parent().show();
        },

        onChangeCoAuthMode: function (val){
            this.fillShowChanges(val == 1);
            this.rbShowChangesNone.setValue(val == 1);
            this.rbShowChangesLast.setValue(val == 0);
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

        customizeQuickAccess: function () {
            if (this.dlgQuickAccess && this.dlgQuickAccess.isVisible()) return;
            this.dlgQuickAccess = new Common.Views.CustomizeQuickAccessDialog({
                showSave: this.mode.showSaveButton,
                showPrint: this.mode.canPrint && this.mode.twoLevelHeader,
                showQuickPrint: this.mode.canQuickPrint && this.mode.twoLevelHeader,
                props: {
                    save: Common.localStorage.getBool('pdfe-quick-access-save', true),
                    print: Common.localStorage.getBool('pdfe-quick-access-print', true),
                    quickPrint: Common.localStorage.getBool('pdfe-quick-access-quick-print', true),
                    undo: Common.localStorage.getBool('pdfe-quick-access-undo', true),
                    redo: Common.localStorage.getBool('pdfe-quick-access-redo', true)
                }
            });
            this.dlgQuickAccess.show();
        },

        strZoom: 'Default Zoom Value',
        strShowChanges: 'Real-time Collaboration Changes',
        txtAll: 'View All',
        txtNone: 'View Nothing',
        txtLast: 'View Last',
        okButtonText: 'Apply',
        txtWin: 'as Windows',
        txtMac: 'as OS X',
        txtNative: 'Native',
        strFontRender: 'Font Hinting',
        textAutoSave: 'Autosave',
        strCoAuthMode: 'Co-editing mode',
        strFast: 'Fast',
        strStrict: 'Strict',
        textAutoRecover: 'Autorecover',
        txtFitPage: 'Fit to Page',
        txtFitWidth: 'Fit to Width',
        textForceSave: 'Save to Server',
        txtCacheMode: 'Default cache mode',
        strRTLSupport: 'RTL interface',
        strTheme: 'Theme',
        txtDarkMode: 'Turn on document dark mode',
        txtEditingSaving: 'Editing and saving',
        txtCollaboration: 'Collaboration',
        txtWorkspace: 'Workspace',
        txtHieroglyphs: 'Hieroglyphs',
        txtUseAltKey: 'Use Alt key to navigate the user interface using the keyboard',
        txtUseOptionKey: 'Use ⌘F6 to navigate the user interface using the keyboard',
        strShowComments: 'Show comments in text',
        strShowResolvedComments: 'Show resolved comments',
        txtFastTip: 'Real-time co-editing. All changes are saved automatically',
        txtStrictTip: 'Use the \'Save\' button to sync the changes you and others make',
        strShowOthersChanges: 'Show changes from other users',
        txtAdvancedSettings: 'Advanced Settings',
        txtQuickPrint: 'Show the Quick Print button in the editor header',
        txtQuickPrintTip: 'The document will be printed on the last selected or default printer',
        txtWorkspaceSettingChange: 'Workspace setting (RTL interface) change',
        txtRestartEditor: 'Please restart document editor so that your workspace settings can take effect',
        txtLastUsed: 'Last used',
        txtScreenReader: 'Turn on screen reader support',
        strUnit: 'Unit of Measurement',
        txtInch: 'Inch',
        txtCm: 'Centimeter',
        txtPt: 'Point',
        txtUseAnnotateBar: 'Use the mini toolbar when selecting text',
        txtCustomizeQuickAccess: 'Customize quick access',
        txtTabBack: 'Use toolbar color as tabs background',
        strTabStyle: 'Tab style',
        textFill: 'Fill',
        textLine: 'Line',
        txtAppearance: 'Appearance'

    }, PDFE.Views.FileMenuPanels.Settings || {}));

    PDFE.Views.FileMenuPanels.CreateNew = Common.UI.BaseView.extend(_.extend({
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
                    '<div class="blank-document-btn" data-hint="2" data-hint-direction="left-top" data-hint-offset="2, 10">',
                        '<div class="btn-blank-format"><div class ="svg-format-blank"></div></div>',
                    '</div>',
                    '<div class="title"><%= scope.txtBlank %></div>',
                '</div>',
                '<% } %>',
                '<% _.each(docs, function(item, index) { %>',
                '<div class="thumb-wrap" template="<%= item.url %>" data-hint="2" data-hint-direction="left-top" data-hint-offset="14, 22">',
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

        txtBlank: 'Blank document',
        txtCreateNew: 'Create New'
    }, PDFE.Views.FileMenuPanels.CreateNew || {}));

    PDFE.Views.FileMenuPanels.DocumentInfo = Common.UI.BaseView.extend(_.extend({
        el: '#panel-info',
        menu: undefined,

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);
            this.rendered = false;

            this.template = _.template([
            '<div class="flex-settings">',
                '<div class="header">' + this.txtDocumentInfo + '</div>',
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
                        '<td class="left"><label>' + this.txtPages + '</label></td>',
                        '<td class="right"><label id="id-info-pages"></label></td>',
                    '</tr>',
                    '<tr>',
                        '<td class="left"><label>' + this.txtParagraphs + '</label></td>',
                        '<td class="right"><label id="id-info-paragraphs"></label></td>',
                    '</tr>',
                    '<tr>',
                        '<td class="left"><label>' + this.txtWords + '</label></td>',
                        '<td class="right"><label id="id-info-words"></label></td>',
                    '</tr>',
                    '<tr>',
                        '<td class="left"><label>' + this.txtSymbols + '</label></td>',
                        '<td class="right"><label id="id-info-symbols"></label></td>',
                    '</tr>',
                    '<tr>',
                        '<td class="left"><label>' + this.txtSpaces + '</label></td>',
                        '<td class="right"><label id="id-info-spaces"></label></td>',
                    '</tr>',
                    '<tr class="pdf-info">',
                        '<td class="left"><label>' + this.txtPageSize + '</label></td>',
                        '<td class="right"><label id="id-info-page-size"></label></td>',
                    '</tr>',
                    '<tr class="divider"></tr>',
                    '<tr class="divider"></tr>',
                    // '<tr>',
                    //     '<td class="left"><label>' + this.txtEditTime + '</label></td>',
                    //     '<td class="right"><label id="id-info-edittime"></label></td>',
                    // '</tr>',
                    '<tr class="docx-info">',
                        '<td class="left"><label>' + this.txtTitle + '</label></td>',
                        '<td class="right"><div id="id-info-title"></div></td>',
                    '</tr>',
                    '<tr class="docx-info">',
                        '<td class="left"><label>' + this.txtTags + '</label></td>',
                        '<td class="right"><div id="id-info-tags"></div></td>',
                    '</tr>',
                    '<tr class="docx-info">',
                        '<td class="left"><label>' + this.txtSubject + '</label></td>',
                        '<td class="right"><div id="id-info-subject"></div></td>',
                    '</tr>',
                    '<tr class="docx-info">',
                        '<td class="left"><label>' + this.txtComment + '</label></td>',
                        '<td class="right"><div id="id-info-comment"></div></td>',
                    '</tr>',
                    '<tr class="divider docx-info"></tr>',
                    '<tr class="divider docx-info"></tr>',
                    '<tr class="pdf-info">',
                        '<td class="left"><label>' + this.txtTitle + '</label></td>',
                        '<td class="right"><label id="id-lbl-info-title"></label></td>',
                    '</tr>',
                    '<tr class="pdf-info">',
                        '<td class="left"><label>' + this.txtSubject + '</label></td>',
                        '<td class="right"><label id="id-lbl-info-subject"></label></td>',
                    '</tr>',
                    '<tr class="divider pdf-info pdf-title"></tr>',
                    '<tr class="divider pdf-info pdf-title"></tr>',
                    '<tr>',
                        '<td class="left"><label>' + this.txtModifyDate + '</label></td>',
                        '<td class="right"><label id="id-info-modify-date"></label></td>',
                    '</tr>',
                    '<tr>',
                        '<td class="left"><label>' + this.txtModifyBy + '</label></td>',
                        '<td class="right"><label id="id-info-modify-by"></label></td>',
                    '</tr>',
                    '<tr class="divider modify"></tr>',
                    '<tr class="divider modify"></tr>',
                    '<tr>',
                        '<td class="left"><label>' + this.txtCreated + '</label></td>',
                        '<td class="right"><label id="id-info-date"></label></td>',
                    '</tr>',
                    '<tr>',
                         '<td class="left"><label>' + this.txtAppName + '</label></td>',
                         '<td class="right"><label id="id-info-appname"></label></td>',
                    '</tr>',
                    '<tr class="pdf-info">',
                        '<td class="left"><label>' + this.txtAuthor + '</label></td>',
                        '<td class="right"><label id="id-lbl-info-author"></label></td>',
                    '</tr>',
                    '<tr class="divider pdf-info"></tr>',
                    '<tr class="pdf-info">',
                         '<td class="left"><label>' + this.txtPdfProducer + '</label></td>',
                         '<td class="right"><label id="id-info-pdf-produce"></label></td>',
                    '</tr>',
                    '<tr class="pdf-info">',
                         '<td class="left"><label>' + this.txtPdfVer + '</label></td>',
                         '<td class="right"><label id="id-info-pdf-ver"></label></td>',
                    '</tr>',
                    '<tr class="pdf-info">',
                         '<td class="left"><label>' + this.txtPdfTagged + '</label></td>',
                         '<td class="right"><label id="id-info-pdf-tagged"></label></td>',
                    '</tr>',
                    '<tr class="pdf-info">',
                         '<td class="left"><label>' + this.txtFastWV + '</label></td>',
                         '<td class="right"><label id="id-info-fast-wv"></label></td>',
                    '</tr>',
                    '<tr class="docx-info">',
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
                '<table class="main">',
                    '<tr>',
                        '<td class="left"></td>',
                        '<td class="right"><button id="fminfo-btn-apply" class="btn normal dlg-btn primary" data-hint="2" data-hint-direction="bottom" data-hint-offset="big"><%= scope.okButtonText %></button></td>',
                    '</tr>',
                '</table>',
            '</div>'
            ].join(''));

            this.infoObj = {PageCount: 0, WordsCount: 0, ParagraphCount: 0, SymbolsCount: 0, SymbolsWSCount:0};
            this.menu = options.menu;
            this.coreProps = null;
            this.authors = [];
            this._state = {
                _locked: false,
                disableEditing: false
            };
        },

        render: function(node) {
            var me = this;
            var $markup = $(me.template({scope: me}));

            // server info
            this.lblPlacement = $markup.findById('#id-info-placement');
            this.lblOwner = $markup.findById('#id-info-owner');
            this.lblUploaded = $markup.findById('#id-info-uploaded');

            // statistic info
            this.lblStatPages = $markup.findById('#id-info-pages');
            this.lblStatWords = $markup.findById('#id-info-words');
            this.lblStatParagraphs = $markup.findById('#id-info-paragraphs');
            this.lblStatSymbols = $markup.findById('#id-info-symbols');
            this.lblStatSpaces = $markup.findById('#id-info-spaces');
            this.lblPageSize = $markup.findById('#id-info-pages-size');
            // this.lblEditTime = $markup.find('#id-info-edittime');

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
            this.authorTpl = '<tr><td><div style="display: inline-block;width: 200px;"><input type="text" spellcheck="false" class="form-control" readonly="true" value="{0}"></div><div class="tool close img-commonctrl img-colored" data-hint="2" data-hint-direction="right" data-hint-offset="small"></div></td></tr>';

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

            // pdf info
            this.lblPageSize = $markup.findById('#id-info-page-size');
            this.lblPdfTitle = $markup.findById('#id-lbl-info-title');
            this.lblPdfSubject = $markup.findById('#id-lbl-info-subject');
            this.lblPdfAuthor = $markup.findById('#id-lbl-info-author');
            this.lblPdfVer = $markup.findById('#id-info-pdf-ver');
            this.lblPdfTagged = $markup.findById('#id-info-pdf-tagged');
            this.lblPdfProducer = $markup.findById('#id-info-pdf-produce');
            this.lblFastWV = $markup.findById('#id-info-fast-wv');

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

            this.updateStatisticInfo();
            this.updateFileInfo();
            this.scroller && this.scroller.scrollTop(0);
            this.updateScroller();
        },

        hide: function() {
            Common.UI.BaseView.prototype.hide.call(this,arguments);

            this.stopUpdatingStatisticInfo();
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

            var pdfProps = (this.api) ? this.api.asc_getPdfProps() : null;
            var appname = (this.api) ? this.api.asc_getAppProps() : null;
            if (appname) {
                $('.pdf-info', this.el).hide();
                appname = (appname.asc_getApplication() || '') + (appname.asc_getAppVersion() ? ' ' : '') + (appname.asc_getAppVersion() || '');
                this.lblApplication.text(appname);
            } else if (pdfProps) {
                $('.docx-info', this.el).hide();
                appname = pdfProps ? pdfProps.Creator || '' : '';
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
            } else if (pdfProps)
                this.updatePdfInfo(pdfProps);
        },

        updateFileInfo: function() {
            if (!this.rendered)
                return;

            var me = this,
                props = (this.api) ? this.api.asc_getCoreProps() : null,
                value;

            this.coreProps = props;
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
                this.tblAuthor.find('.close').toggleClass('hidden', !this.mode.isPDFEdit);
                this._ShowHideInfoItem(this.tblAuthor, this.mode.isPDFEdit || !!this.authors.length);
            }
            this.SetDisabled();
        },

        updatePdfInfo: function(props) {
            if (!this.rendered)
                return;

            var me = this,
                value;

            if (props) {
                value = props.CreationDate;
                if (value) {
                    value = new Date(value);
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

                var visible = false;
                value = props.ModDate;
                if (value) {
                    value = new Date(value);
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
                visible = this._ShowHideInfoItem(this.lblModifyBy, false) || visible;
                $('tr.divider.modify', this.el)[visible?'show':'hide']();

                if (props.PageWidth && props.PageHeight && (typeof props.PageWidth === 'number') && (typeof props.PageHeight === 'number')) {
                    var w = props.PageWidth,
                        h = props.PageHeight;
                    switch (Common.Utils.Metric.getCurrentMetric()) {
                        case Common.Utils.Metric.c_MetricUnits.cm:
                            w = parseFloat((w* 25.4 / 72000.).toFixed(2));
                            h = parseFloat((h* 25.4 / 72000.).toFixed(2));
                            break;
                        case Common.Utils.Metric.c_MetricUnits.pt:
                            w = parseFloat((w/100.).toFixed(2));
                            h = parseFloat((h/100.).toFixed(2));
                            break;
                        case Common.Utils.Metric.c_MetricUnits.inch:
                            w = parseFloat((w/7200.).toFixed(2));
                            h = parseFloat((h/7200.).toFixed(2));
                            break;
                    }
                    var pageSizeTemplate = !Common.UI.isRTL() ?
                        w + ' ' + Common.Utils.Metric.getCurrentMetricName() + ' x ' + h + ' ' + Common.Utils.Metric.getCurrentMetricName() :
                        '<span dir="ltr"><span dir="ltr">' + Common.Utils.Metric.getCurrentMetricName() + ' </span><span dir="ltr">' + h + ' x </span>' +
                        '<span dir="ltr">' + Common.Utils.Metric.getCurrentMetricName() + ' </span><span dir="ltr">' + w + '</span></span>';
                    this.lblPageSize.html(pageSizeTemplate);
                    this._ShowHideInfoItem(this.lblPageSize, true);
                } else
                    this._ShowHideInfoItem(this.lblPageSize, false);

                value = props.Title;
                value && this.lblPdfTitle.text(value);
                visible = this._ShowHideInfoItem(this.lblPdfTitle, !!value);

                value = props.Subject;
                value && this.lblPdfSubject.text(value);
                visible = this._ShowHideInfoItem(this.lblPdfSubject, !!value) || visible;
                $('tr.divider.pdf-title', this.el)[visible?'show':'hide']();

                value = props.Author;
                value && this.lblPdfAuthor.text(value);
                this._ShowHideInfoItem(this.lblPdfAuthor, !!value);

                value = props.Version;
                value && this.lblPdfVer.text(value);
                this._ShowHideInfoItem(this.lblPdfVer, !!value);

                value = props.Tagged;
                if (value !== undefined)
                    this.lblPdfTagged.text(value===true ? this.txtYes : this.txtNo);
                this._ShowHideInfoItem(this.lblPdfTagged, value !== undefined);

                value = props.Producer;
                value && this.lblPdfProducer.text(value);
                this._ShowHideInfoItem(this.lblPdfProducer, !!value);

                value = props.FastWebView;
                if (value !== undefined)
                    this.lblFastWV.text(value===true ? this.txtYes : this.txtNo);
                this._ShowHideInfoItem(this.lblFastWV, value !== undefined);
            }
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

        updateStatisticInfo: function() {
            if ( this.api && this.doc ) {
                this.api.startGetDocInfo();
            }
        },

        stopUpdatingStatisticInfo: function() {
            if ( this.api ) {
                this.api.stopGetDocInfo();
            }
        },

        setApi: function(o) {
            this.api = o;
            this.api.asc_registerCallback('asc_onGetDocInfoStart', _.bind(this._onGetDocInfoStart, this));
            this.api.asc_registerCallback('asc_onGetDocInfoStop', _.bind(this._onGetDocInfoEnd, this));
            this.api.asc_registerCallback('asc_onDocInfo', _.bind(this._onDocInfo, this));
            this.api.asc_registerCallback('asc_onGetDocInfoEnd', _.bind(this._onGetDocInfoEnd, this));
            // this.api.asc_registerCallback('asc_onDocumentName',  _.bind(this.onDocumentName, this));
            this.api.asc_registerCallback('asc_onLockCore',  _.bind(this.onLockCore, this));
            this.updateInfo(this.doc);
            return this;
        },

        setMode: function(mode) {
            this.mode = mode;
            var isEdit = false; // isPDFEdit?
            this.inputAuthor.setVisible(isEdit);
            this.pnlApply.toggleClass('hidden', !isEdit);
            this.tblAuthor.find('.close').toggleClass('hidden', !isEdit);
            this.inputTitle._input.attr('placeholder', isEdit ? this.txtAddText : '');
            this.inputTags._input.attr('placeholder', isEdit ? this.txtAddText : '');
            this.inputSubject._input.attr('placeholder', isEdit ? this.txtAddText : '');
            this.inputComment._input.attr('placeholder', isEdit ? this.txtAddText : '');
            this.inputAuthor._input.attr('placeholder', isEdit ? this.txtAddAuthor : '');
            this.SetDisabled();
            return this;
        },

        setPreviewMode: function(mode) {
            this._state.disableEditing = mode;
        },

        _onGetDocInfoStart: function() {
            var me = this;
            this.infoObj = {PageCount: 0, WordsCount: 0, ParagraphCount: 0, SymbolsCount: 0, SymbolsWSCount:0};
            this.timerLoading = setTimeout(function(){
                me.lblStatPages.text(me.txtLoading);
                me.lblStatWords.text(me.txtLoading);
                me.lblStatParagraphs.text(me.txtLoading);
                me.lblStatSymbols.text(me.txtLoading);
                me.lblStatSpaces.text(me.txtLoading);
            }, 2000);
        },

        _onDocInfo: function(obj) {
            if (obj) {
                clearTimeout(this.timerLoading);
                if (obj.get_PageCount()>-1)
                    this.infoObj.PageCount = obj.get_PageCount();
                if (obj.get_WordsCount()>-1)
                    this.infoObj.WordsCount = obj.get_WordsCount();
                if (obj.get_ParagraphCount()>-1)
                    this.infoObj.ParagraphCount = obj.get_ParagraphCount();
                if (obj.get_SymbolsCount()>-1)
                    this.infoObj.SymbolsCount = obj.get_SymbolsCount();
                if (obj.get_SymbolsWSCount()>-1)
                    this.infoObj.SymbolsWSCount = obj.get_SymbolsWSCount();
                if (!this.timerDocInfo) { // start timer for filling info
                    var me = this;
                    this.timerDocInfo = setInterval(function(){
                        me.fillDocInfo();
                    }, 300);
                    this.fillDocInfo();
                }
            }
        },

        _onGetDocInfoEnd: function() {
            clearTimeout(this.timerLoading);
            clearInterval(this.timerDocInfo);
            this.timerLoading = this.timerDocInfo = undefined;
            this.fillDocInfo();
        },

        fillDocInfo:  function() {
            this.lblStatPages.text(this.infoObj.PageCount);
            this.lblStatWords.text(this.infoObj.WordsCount);
            this.lblStatParagraphs.text(this.infoObj.ParagraphCount);
            this.lblStatSymbols.text(this.infoObj.SymbolsCount);
            this.lblStatSpaces.text(this.infoObj.SymbolsWSCount);
        },

        onDocumentName: function(name) {
            // this.lblTitle.text((name) ? name : '-');
        },

        onLockCore: function(lock) {
            this._state._locked = lock;
            this.updateFileInfo();
        },

        SetDisabled: function() {
            var disable = !this.mode.isEdit || this._state._locked || this._state.disableEditing;
            this.inputTitle.setDisabled(disable);
            this.inputTags.setDisabled(disable);
            this.inputSubject.setDisabled(disable);
            this.inputComment.setDisabled(disable);
            this.inputAuthor.setDisabled(disable);
            this.tblAuthor.find('.close').toggleClass('disabled', this._state._locked);
            this.tblAuthor.toggleClass('disabled', disable);
            this.btnApply.setDisabled(this._state._locked);
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
        txtPages: 'Pages',
        txtWords: 'Words',
        txtParagraphs: 'Paragraphs',
        txtSymbols: 'Symbols',
        txtSpaces: 'Symbols with spaces',
        txtLoading: 'Loading...',
        txtAppName: 'Application',
        txtEditTime: 'Total Editing time',
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
        txtPageSize: 'Page Size',
        txtPdfVer: 'PDF Version',
        txtPdfTagged: 'Tagged PDF',
        txtFastWV: 'Fast Web View',
        txtYes: 'Yes',
        txtNo: 'No',
        txtPdfProducer: 'PDF Producer',
        txtDocumentInfo: 'Document Info'

    }, PDFE.Views.FileMenuPanels.DocumentInfo || {}));

    PDFE.Views.FileMenuPanels.DocumentRights = Common.UI.BaseView.extend(_.extend({
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
                        '<td class="left"></td><td class="right"><button id="id-info-btn-edit" class="btn normal dlg-btn primary auto margin-right-10">' + this.txtBtnAccessRights + '</button></td>',
                    '</tr>',
                '</table>'
            ].join(''));

            this.templateRights = _.template([
                '<table>',
                    '<% _.each(users, function(item) { %>',
                    '<tr>',
                        '<td><span class="userLink img-commonctrl  <% if (item.isLink) { %>sharedLink<% } %>"></span><span><%= Common.Utils.String.htmlEncode(item.user) %></span></td>',
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
                el: $markup.elementById('#id-info-btn-edit')
            });
            this.btnEditRights.on('click', _.bind(this.changeAccessRights, this));

            this.rendered = true;

            this.updateInfo(this.doc);

            Common.NotificationCenter.on('collaboration:sharingupdate', this.updateSharingSettings.bind(this));
            Common.NotificationCenter.on('collaboration:sharingdeny', this.onLostEditRights.bind(this));

            this.$el = $(node).html($markup);

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

        setApi: function(o) {
            this.api = o;
            return this;
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
    }, PDFE.Views.FileMenuPanels.DocumentRights || {}));

    PDFE.Views.FileMenuPanels.Help = Common.UI.BaseView.extend({
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
                {"src": "ProgramInterface/ProgramInterface.htm", "name": "Introducing Document Editor user interface", "headername": "Program Interface"},
                {"src": "ProgramInterface/FileTab.htm", "name": "File tab"},
                {"src": "ProgramInterface/HomeTab.htm", "name": "Home Tab"},
                {"src": "ProgramInterface/InsertTab.htm", "name": "Insert tab"},
                {"src": "ProgramInterface/LayoutTab.htm", "name": "Layout tab"},
                {"src": "ProgramInterface/ReviewTab.htm", "name": "Review tab"},
                {"src": "ProgramInterface/PluginsTab.htm", "name": "Plugins tab"},
                {"src": "UsageInstructions/ChangeColorScheme.htm", "name": "Change color scheme", "headername": "Basic operations"},
                {"src": "UsageInstructions/CopyPasteUndoRedo.htm", "name": "Copy/paste text passages, undo/redo your actions"},
                {"src": "UsageInstructions/OpenCreateNew.htm", "name": "Create a new document or open an existing one"},
                {"src": "UsageInstructions/SetPageParameters.htm", "name": "Set page parameters", "headername": "Page formatting"},
                {"src": "UsageInstructions/NonprintingCharacters.htm", "name": "Show/hide nonprinting characters" },
                {"src": "UsageInstructions/SectionBreaks.htm", "name": "Insert section breaks" },
                {"src": "UsageInstructions/InsertHeadersFooters.htm", "name": "Insert headers and footers"},
                {"src": "UsageInstructions/InsertPageNumbers.htm", "name": "Insert page numbers"},
                {"src": "UsageInstructions/InsertFootnotes.htm", "name": "Insert footnotes"},
                {"src": "UsageInstructions/AlignText.htm", "name": "Align your text in a paragraph", "headername": "Paragraph formatting"},
                {"src": "UsageInstructions/BackgroundColor.htm", "name": "Select background color for a paragraph"},
                {"src": "UsageInstructions/ParagraphIndents.htm", "name": "Change paragraph indents"},
                {"src": "UsageInstructions/LineSpacing.htm", "name": "Set paragraph line spacing"},
                {"src": "UsageInstructions/PageBreaks.htm", "name": "Insert page breaks"},
                {"src": "UsageInstructions/AddBorders.htm", "name": "Add borders"},
                {"src": "UsageInstructions/SetTabStops.htm", "name": "Set tab stops"},
                {"src": "UsageInstructions/CreateLists.htm", "name": "Create lists"},
                {"src": "UsageInstructions/FormattingPresets.htm", "name": "Apply formatting styles", "headername": "Text formatting"},
                {"src": "UsageInstructions/FontTypeSizeColor.htm", "name": "Set font type, size, and color"},
                {"src": "UsageInstructions/DecorationStyles.htm", "name": "Apply font decoration styles"},
                {"src": "UsageInstructions/CopyClearFormatting.htm", "name": "Copy/clear text formatting" },
                {"src": "UsageInstructions/AddHyperlinks.htm", "name": "Add hyperlinks"},
                {"src": "UsageInstructions/InsertDropCap.htm", "name": "Insert a drop cap"},
                {"src": "UsageInstructions/InsertTables.htm", "name": "Insert tables", "headername": "Operations on objects"},
                {"src": "UsageInstructions/InsertImages.htm", "name": "Insert images"},
                {"src": "UsageInstructions/InsertAutoshapes.htm", "name": "Insert autoshapes"},
                {"src": "UsageInstructions/InsertCharts.htm", "name": "Insert charts" },
                {"src": "UsageInstructions/InsertTextObjects.htm", "name": "Insert text objects" },
                {"src": "UsageInstructions/AlignArrangeObjects.htm", "name": "Align and arrange objects on a page" },
                {"src": "UsageInstructions/ChangeWrappingStyle.htm", "name": "Change wrapping style" },
                {"src": "UsageInstructions/UseMailMerge.htm", "name": "Use mail merge", "headername": "Mail Merge"},
                {"src": "UsageInstructions/InsertEquation.htm", "name": "Insert equations", "headername": "Math equations"},
                {"src": "HelpfulHints/CollaborativeEditing.htm", "name": "Collaborative document editing", "headername": "Document co-editing"},
                {"src": "HelpfulHints/Review.htm", "name": "Document Review"},
                {"src": "UsageInstructions/ViewDocInfo.htm", "name": "View document information", "headername": "Tools and settings"},
                {"src": "UsageInstructions/SavePrintDownload.htm", "name": "Save/download/print your document" },
                {"src": "HelpfulHints/AdvancedSettings.htm", "name": "Advanced settings of Document Editor"},
                {"src": "HelpfulHints/Navigation.htm", "name": "View settings and navigation tools"},
                {"src": "HelpfulHints/Search.htm", "name": "Search and replace function"},
                {"src": "HelpfulHints/SpellChecking.htm", "name": "Spell-checking"},
                {"src": "HelpfulHints/About.htm", "name": "About Document Editor", "headername": "Helpful hints"},
                {"src": "HelpfulHints/SupportedFormats.htm", "name": "Supported formats of electronic documents" },
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

    PDFE.Views.FileMenuPanels.ProtectDoc = Common.UI.BaseView.extend(_.extend({
        el: '#panel-protect',
        menu: undefined,

        template: _.template([
            '<label id="id-fms-lbl-protect-header"><%= scope.strProtect %></label>',
            '<div id="id-fms-password">',
            '<label class="header"><%= scope.strEncrypt %></label>',
            '<div class="encrypt-block">',
            '<div class="description"><%= scope.txtProtectDocument %></div>',
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
                '<div class="<% if (!hasSigned) { %>hidden<% } %>"">',
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

            var protection = PDFE.getController('Common.Controllers.Protection').getView();

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
            // PDFE.getController('RightMenu').rightmenu.SetActivePane(Common.Utils.documentSettingsType.Signature, true);
        },

        updateSignatures: function(){
            var valid = this.api.asc_getSignatures(),
                hasValid = false,
                hasInvalid = false;

            _.each(valid, function(item, index){
                if (item.asc_getValid()==0)
                    hasValid = true;
                else
                    hasInvalid = true;
            });

            // hasValid = true;
            // hasInvalid = true;

            var tipText = (hasInvalid) ? this.txtSignedInvalid : (hasValid ? this.txtSigned : "");
            this.cntSignatureView.html(this.templateSignature({tipText: tipText, hasSigned: (hasValid || hasInvalid)}));

            var isAddedSignature = this.btnAddInvisibleSign.$el.find('button').hasClass('hidden');
            this.cntAddSignature.toggleClass('hidden', isAddedSignature);
            this.cntAddedSignature.toggleClass('hidden', !isAddedSignature);
        },

        updateEncrypt: function() {
            var isProtected = this.btnAddPwd.$el.find('button').hasClass('hidden');
            this.cntEncryptBlock.toggleClass('hidden', isProtected);
            this.cntEncryptedBlock.toggleClass('hidden', !isProtected);
        },

        strProtect: 'Protect Document',
        strSignature: 'With Signature',
        txtView: 'View signatures',
        txtEdit: 'Edit document',
        txtSigned: 'Valid signatures has been added to the document. The document is protected from editing.',
        txtSignedInvalid: 'Some of the digital signatures in document are invalid or could not be verified. The document is protected from editing.',
        notcriticalErrorTitle: 'Warning',
        txtEditWarning: 'Editing will remove the signatures from the document.<br>Are you sure you want to continue?',
        strEncrypt: 'With Password',
        txtProtectDocument: 'Encrypt this document with a password',
        txtEncrypted: 'A password is required to open this document',
        txtAddSignature: 'Ensure the integrity of the document by adding an<br>invisible digital signature',
        txtAddedSignature: 'Valid signatures have been added to the document.<br>The document is protected from editing.'

    }, PDFE.Views.FileMenuPanels.ProtectDoc || {}));

    PDFE.Views.PrintWithPreview = Common.UI.BaseView.extend(_.extend({
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
                                '<tr><td><label class="header"><%= scope.txtPrintRange %></label></td></tr>',
                                '<tr><td class="padding-large"><div id="print-combo-range" style="width: 248px;"></div></td></tr>',
                                '<tr><td class="padding-large">',
                                    '<table style="width: 100%;"><tbody>',
                                        '<tr><td class="padding-large"><%= scope.txtPages %>:</td><td class="padding-large" style="width: 100%;"><div id="print-txt-pages" style="width: 100%;"></div></td></tr>',
                                        '<tr><td><%= scope.txtCopies %>:</td><td style="width: 100%;"><div id="print-txt-copies" style="width: 60px;"></div></td></tr>',
                                    '</tbody></table>',
                                '</td></tr>',
                                '<tr><td><label class="header"><%= scope.txtPrintSides %></label></td></tr>',
                                '<tr><td class="padding-large"><div id="print-combo-sides" style="width: 248px;"></div></td></tr>',
                                '<tr><td><label class="header"><%= scope.txtPageSize %></label></td></tr>',
                                '<tr><td class="padding-large"><div id="print-combo-pages" style="width: 248px;"></div></td></tr>',
                                '<tr><td><label class="header"><%= scope.txtPageOrientation %></label></td></tr>',
                                '<tr><td class="padding-large"><div id="print-combo-orient" style="width: 150px;"></div></td></tr>',
                                '<tr><td><label class="header"><%= scope.txtMargins %></label></td></tr>',
                                '<tr><td class="padding-large"><div id="print-combo-margins" style="width: 248px;"></div></td></tr>',
                                '<tr class="fms-btn-apply"><td>',
                                    '<div class="footer justify">',
                                        '<button id="print-btn-print" class="btn normal dlg-btn primary margin-right-8" result="print" style="width: 96px;" data-hint="2" data-hint-direction="bottom" data-hint-offset="big"><%= scope.txtPrint %></button>',
                                        '<button id="print-btn-print-pdf" class="btn normal dlg-btn" result="pdf" style="min-width: 96px;width: auto;" data-hint="2" data-hint-direction="bottom" data-hint-offset="big"><%= scope.txtPrintPdf %></button>',
                                    '</div>',
                                '</td></tr>',
                            '</tbody>',
                            '</table>',
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
                    '</div>',
                '</div>',
            '</div>'
        ].join('')),

        initialize: function(options) {
            Common.UI.BaseView.prototype.initialize.call(this,arguments);

            this.menu = options.menu;

            this._initSettings = true;
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
                    { value: 'all', displayValue: this.txtAllPages },
                    { value: 'current', displayValue: this.txtCurrentPage },
                    { value: -1, displayValue: this.txtCustomPages }
                ],
                dataHint: '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.cmbRange.setValue('all');

            this.inputPages = new Common.UI.InputField({
                el: $markup.findById('#print-txt-pages'),
                allowBlank: true,
                validateOnChange: true,
                validateOnBlur: false,
                maskExp: /[0-9,\-]/,
                dataHint: '2',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
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
                    '<label><%= scope.getDisplayValue(item) %></label><label class="comment-text"><%= item.descValue %></label></a></li>',
                    '<% }); %>'
                ].join('')),
                dataHint: '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big'
            });
            this.cmbSides.setValue('one');

            var paperSizeItemsTemplate = !Common.UI.isRTL() ?
                _.template([
                    '<% _.each(items, function(item) { %>',
                    '<li id="<%= item.id %>" data-value="<%- item.value %>"><a tabindex="-1" type="menuitem">',
                    '<% if (typeof item.displayValue === "string") { %>',
                    '<%= item.displayValue %>',
                    '<% } else { %>',
                    '<%= item.displayValue[0] %>',
                    ' (<%= item.displayValue[1] %> <%= item.displayValue[3] %> x',
                    ' <%= item.displayValue[2] %> <%= item.displayValue[3] %>)',
                    '<% } %>',
                    '</a></li>',
                    '<% }); %>'
                ].join('')) :
                _.template([
                    '<% _.each(items, function(item) { %>',
                    '<li id="<%= item.id %>" data-value="<%- item.value %>"><a tabindex="-1" type="menuitem" dir="ltr">',
                    '<% if (typeof item.displayValue === "string") { %>',
                    '<%= item.displayValue %>',
                    '<% } else { %>',
                    '(<span dir="rtl"><%= item.displayValue[2] %> <%= item.displayValue[3] %></span>',
                    '<span> x </span>',
                    '<span dir="rtl"><%= item.displayValue[1] %> <%= item.displayValue[3] %></span>)',
                    '<span> <%= item.displayValue[0] %></span>',
                    '<% } %>',
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
                    { value: 0, displayValue: ['US Letter', '21,59', '27,94', 'cm'], caption: 'US Letter', size: [215.9, 279.4]},
                    { value: 1, displayValue: ['US Legal', '21,59', '35,56', 'cm'], caption: 'US Legal', size: [215.9, 355.6]},
                    { value: 2, displayValue: ['A4', '21', '29,7', 'cm'], caption: 'A4', size: [210, 297]},
                    { value: 3, displayValue: ['A5', '14,8', '21', 'cm'], caption: 'A5', size: [148, 210]},
                    { value: 4, displayValue: ['B5', '17,6', '25', 'cm'], caption: 'B5', size: [176, 250]},
                    { value: 5, displayValue: ['Envelope #10', '10,48', '24,13', 'cm'], caption: 'Envelope #10', size: [104.8, 241.3]},
                    { value: 6, displayValue: ['Envelope DL', '11', '22', 'cm'], caption: 'Envelope DL', size: [110, 220]},
                    { value: 7, displayValue: ['Tabloid', '27,94', '43,18', 'cm'], caption: 'Tabloid', size: [279.4, 431.8]},
                    { value: 8, displayValue: ['A3', '29,7', '42', 'cm'], caption: 'A3', size: [297, 420]},
                    { value: 9, displayValue: ['Tabloid Oversize', '29,69', '45,72', 'cm'], caption: 'Tabloid Oversize', size: [296.9, 457.2]},
                    { value: 10, displayValue: ['ROC 16K', '19,68', '27,3', 'cm'], caption: 'ROC 16K', size: [196.8, 273]},
                    { value: 11, displayValue: ['Envelope Choukei 3', '12', '23,5', 'cm'], caption: 'Envelope Choukei 3', size: [120, 235]},
                    { value: 12, displayValue: ['Super B/A3', '30,5', '48,7', 'cm'], caption: 'Super B/A3', size: [305, 487]},
                    { value: 13, displayValue: ['A4', '84,1', '118,9', 'cm'], caption: 'A0', size: [841, 1189]},
                    { value: 14, displayValue: ['A4', '59,4', '84,1', 'cm'], caption: 'A1', size: [594, 841]},
                    { value: 16, displayValue: ['A4', '42', '59,4', 'cm'], caption: 'A2', size: [420, 594]},
                    { value: 17, displayValue: ['A4', '10,5', '14,8', 'cm'], caption: 'A6', size: [105, 148]},
                    { value: -1, displayValue: this.txtCustom, caption: this.txtCustom, size: []}
                ],
                dataHint: '2',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                updateFormControl: function (record, customValue){
                    var formcontrol = $(this.el).find('.form-control');
                    if (record || customValue) {
                        var displayValue = customValue ? customValue : record.get('displayValue');
                        if (typeof displayValue === 'string') {
                            formcontrol[0].innerHTML = displayValue;
                        } else {
                            if (!Common.UI.isRTL()) {
                                formcontrol[0].innerHTML = displayValue[0] + ' (' + displayValue[1] + ' ' + displayValue[3] + ' x ' +
                                    displayValue[2] + ' ' + displayValue[3] + ')';
                            } else {
                                formcontrol[0].innerHTML = '<span dir="ltr">(<span dir="rtl">' + displayValue[2] + ' ' + displayValue[3] + '</span>' +
                                    '<span> x </span>' + '<span dir="rtl">' + displayValue[1] + ' ' + displayValue[3] + '</span>)' +
                                    '<span> ' + displayValue[0] + '</span></span>';
                            }
                        }
                    } else
                        formcontrol[0].innerHTML = '';
                }
            });

            this.cmbPaperOrientation = new Common.UI.ComboBox({
                el          : $markup.findById('#print-combo-orient'),
                menuStyle   : 'min-width: 150px;',
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

            this.cmbPaperMargins = new Common.UI.ComboBox({
                el: $markup.findById('#print-combo-margins'),
                menuStyle: 'max-height: 280px; min-width: 248px;',
                editable: false,
                takeFocusOnClose: true,
                cls: 'input-group-nr',
                data: [
                    { value: 0, displayValue: this.textMarginsNormal, size: [20, 30, 20, 15]},
                    { value: 2, displayValue: this.textMarginsNarrow, size: [12.7, 12.7, 12.7, 12.7]},
                    { value: 3, displayValue: this.textMarginsModerate, size: [25.4, 19.1, 25.4, 19.1]},
                    { value: 4, displayValue: this.textMarginsWide, size: [25.4, 50.8, 25.4, 50.8]},
                    { value: -1, displayValue: this.txtCustom, size: null}
                ],
                itemsTemplate: _.template([
                    '<% _.each(items, function(item) { %>',
                        '<li id="<%= item.id %>" data-value="<%- item.value %>"><a tabindex="-1" type="menuitem">',
                        '<div><b><%= scope.getDisplayValue(item) %></b></div>',
                        '<% if (item.size !== null) { %><div class="margin-right-20" style="display: inline-block;min-width: 80px;">' +
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

            this.pnlSettings = $markup.find('.flex-settings').addBack().filter('.flex-settings');
            this.pnlTable = $(this.pnlSettings.find('table')[0]);
            this.trApply = $markup.find('.fms-btn-apply');

            this.btnPrint = new Common.UI.Button({
                el: $markup.findById('#print-btn-print')
            });
            this.btnPrintPdf = new Common.UI.Button({
                el: $markup.findById('#print-btn-print-pdf')
            });

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

           this.$el = $(node).html($markup);
            this.$previewBox = $('#print-preview-box');

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
                var scrolled = this.$el.height()< this.pnlTable.height() + 25 + this.$el.find('.main-header').outerHeight(true);
                this.pnlSettings.css('overflow', scrolled ? 'hidden' : 'visible');
                this.scroller.update();
            }
        },

        setMode: function(mode) {
            this.mode = mode;
        },

        setApi: function(api) {

        },

        updateMetricUnit: function() {
            if (!this.cmbPaperSize) return;
            var store = this.cmbPaperSize.store;
            for (var i=0; i<store.length-1; i++) {
                var item = store.at(i),
                    size = item.get('size'),
                    pagewidth = size[0],
                    pageheight = size[1];

                item.set('displayValue', [item.get('caption'),
                    parseFloat(Common.Utils.Metric.fnRecalcFromMM(pagewidth).toFixed(2)),
                    parseFloat(Common.Utils.Metric.fnRecalcFromMM(pageheight).toFixed(2)),
                    Common.Utils.Metric.getCurrentMetricName()]);
            }
            this.cmbPaperSize.onResetItems();
            this.cmbPaperMargins.onResetItems();
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

        updateCountOfPages: function (count) {
            this.countOfPages.text(
                Common.Utils.String.format(this.txtOf, count)
            );
            this.pageCount = count;
        },

        updateCurrentPage: function (index) {
            this.txtNumberPage.setValue(index + 1);
        },

        txtPrint: 'Print',
        txtPrintPdf: 'Print to PDF',
        txtPrintRange: 'Print range',
        txtCurrentPage: 'Current page',
        txtAllPages: 'All pages',
        txtSelection: 'Selection',
        txtCustomPages: 'Custom print',
        txtPageSize: 'Page size',
        txtPageOrientation: 'Page orientation',
        txtPortrait: 'Portrait',
        txtLandscape: 'Landscape',
        txtCustom: 'Custom',
        txtMargins: 'Margins',
        txtTop: 'Top',
        txtBottom: 'Bottom',
        txtLeft: 'Left',
        txtRight: 'Right',
        txtPage: 'Page',
        txtOf: 'of {0}',
        txtPageNumInvalid: 'Page number invalid',
        txtPages: 'Pages',
        textMarginsLast: 'Last Custom',
        textMarginsNormal: 'Normal',
        textMarginsNarrow: 'Narrow',
        textMarginsModerate: 'Moderate',
        textMarginsWide: 'Wide',
        txtCopies: 'Copies',
        txtPrintSides: 'Print sides',
        txtOneSide: 'Print one sided',
        txtOneSideDesc: 'Only print on one side of the page',
        txtBothSides: 'Print on both sides',
        txtBothSidesLongDesc: 'Flip pages on long edge',
        txtBothSidesShortDesc: 'Flip pages on short edge'

    }, PDFE.Views.PrintWithPreview || {}));
});
