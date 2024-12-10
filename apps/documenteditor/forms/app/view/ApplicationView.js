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
define([
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/util/utils',
    'common/main/lib/component/InputField',
    'common/main/lib/component/Button',
    'common/main/lib/component/Menu'
], function ($, _, Backbone) {
    'use strict';

    DE.Views.ApplicationView = Backbone.View.extend(_.extend({
        // Render layout
        render: function() {
            this.btnOptions = new Common.UI.Button({
                cls: 'btn-toolbar no-caret',
                iconCls: 'svg-icon more-vertical',
                scaling: false,
                menu: new Common.UI.Menu({
                    cls: 'shifted-right',
                    items: [
                        {caption: this.textUndo, value: 'undo', iconCls: 'mi-icon svg-icon undo', cls: 'small-resolution'},
                        {caption: this.textRedo, value: 'redo', iconCls: 'mi-icon svg-icon redo', cls: 'small-resolution'},
                        {caption: '--'},
                        {caption: this.textClear, value: 'clear', iconCls: 'mi-icon svg-icon clear-style', cls: 'small-resolution'},
                        {caption: '--'},
                        {caption: this.txtDownload, value: 'download', iconCls: 'mi-icon svg-icon download'},
                        {caption: this.txtDownloadDocx, value: 'download-docx', iconCls: 'mi-icon svg-icon download'},
                        {caption: this.txtDownloadPdf, value: 'download-pdf', iconCls: 'mi-icon'},
                        {caption: this.txtPrint, value: 'print', iconCls: 'mi-icon svg-icon print'},
                        {caption: '--'},
                        {caption: this.txtSearch, value: 'search', iconCls: 'mi-icon svg-icon search'},
                        {caption: '--'},
                        {caption: this.txtTheme, value: 'theme', iconCls: 'mi-icon',
                            menu        : this.mnuThemes = new Common.UI.Menu({
                                cls: 'shifted-right',
                                menuAlign: 'tl-tr',
                                items: []
                            })
                        },
                        {caption: this.textZoom, value: 'zoomn',  conCls: 'mi-icon' ,
                            menu        : this.mnuZoom = new Common.UI.Menu({
                                cls: 'shifted-right',
                                menuAlign: 'tl-tr',
                                items: [
                                    {caption: this.textFitToPage, value: 'zoom:page', toggleGroup: 'view-zoom', checkable: true},
                                    {caption: this.textFitToWidth, value: 'zoom:width', toggleGroup: 'view-zoom', checkable: true},
                                    (new Common.UI.MenuItem({
                                        template: _.template([
                                            '<div id="id-menu-zoom" class="menu-zoom" style="height: 26px;" ',
                                            '<% if(!_.isUndefined(options.stopPropagation)) { %>',
                                            'data-stopPropagation="true"',
                                            '<% } %>', '>',
                                            '<label class="title">' + this.textZoom + '</label>',
                                            '<button id="id-menu-zoom-in" type="button" style="float:right; margin: 2px 5px 0 0;" class="btn btn-toolbar"><i class="mi-icon svg-icon zoom-in">&nbsp;</i></button>',
                                            '<label class="zoom"><%= options.value %>%</label>',
                                            '<button id="id-menu-zoom-out" type="button" style="float:right; margin-top: 2px;" class="btn btn-toolbar"><i class="mi-icon svg-icon zoom-out">&nbsp;</i></button>',
                                            '</div>'
                                        ].join('')),
                                        stopPropagation: true,
                                        value: 30
                                    }))
                                ]
                            })
                        },
                        {caption: '--'},
                        {caption: this.txtShare, value: 'share', iconCls: 'mi-icon svg-icon share'},
                        {caption: this.txtFileLocation, value: 'close', iconCls: 'mi-icon svg-icon go-to-location'},
                        {caption: '--'},
                        {caption: this.txtEmbed, value: 'embed', iconCls: 'mi-icon svg-icon embed'},
                        {caption: this.txtFullScreen, value: 'fullscr', iconCls: 'mi-icon svg-icon fullscr'}
                    ]
                })
            });
            this.btnOptions.render($('#box-tools'));
            this.btnOptions.menu.items[2].cmpEl.addClass('small-resolution');
            this.btnOptions.menu.items[4].cmpEl.addClass('small-resolution');


            this.btnClear = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'svg-icon clear-style',
                caption: this.textClear,
                scaling: false
            });
            this.btnClear.render($('#id-btn-clear-fields'));

            this.btnNext = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'svg-icon arrow-down',
                caption: this.textNext,
                scaling: false
            });
            this.btnNext.render($('#id-btn-next-field'));

            this.btnPrev = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'svg-icon arrow-up',
                scaling: false
            });
            this.btnPrev.render($('#id-btn-prev-field'));

            this.btnUndo = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'svg-icon undo',
                hint: this.tipUndo + Common.Utils.String.platformKey('Ctrl+Z'),
                scaling: false
            });
            this.btnUndo.render($('#id-btn-undo'));

            this.btnRedo = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'svg-icon redo',
                hint: this.tipRedo + Common.Utils.String.platformKey('Ctrl+Y'),
                scaling: false
            });
            this.btnRedo.render($('#id-btn-redo'));

            this.btnSubmit = new Common.UI.Button({
                cls: 'btn-text-default auto colored back-color margin-left-small margin-right-small',
                caption: this.textSubmit,
                hint: this.tipSubmit
            });
            this.btnSubmit.render($('#id-submit-group'));

            this.btnDownload = new Common.UI.Button({
                cls: 'btn-text-default auto colored yellow margin-left-small margin-right-small',
                caption: this.txtDownload,
                hint: this.txtDownloadPdf
            });
            this.btnDownload.render($('#id-download-group'));

            this.txtGoToPage = new Common.UI.InputField({
                el: $('#page-number'),
                cls: 'masked',
                allowBlank  : true,
                style       : 'width: 35px;',
                value: '1',
                maskExp: /[0-9]/
            });

            this.btnClose = new Common.UI.Button({
                cls: 'btn-toolbar margin-left-small',
                iconCls: 'svg-icon search-close',
                hint: this.textClose,
                visible: false,
                scaling: false
            });
            this.btnClose.render($('#id-btn-close-editor'));

            return this;
        },

        getContextMenu: function() {
            return new Common.UI.Menu({
                cls: 'shifted-right',
                items: [
                    { caption: this.textUndo, value: 'undo', iconCls: 'mi-icon svg-icon undo' },
                    { caption: this.textRedo, value: 'redo', iconCls: 'mi-icon svg-icon redo' },
                    { caption: '--' },
                    { caption: this.textClearField, value: 'clear', iconCls: 'mi-icon svg-icon clear-style' },
                    { caption: '--' },
                    { caption: this.textCut, value: 'cut', iconCls: 'mi-icon svg-icon cut' },
                    { caption: this.textCopy, value: 'copy', iconCls: 'mi-icon svg-icon copy' },
                    { caption: this.textPaste, value: 'paste', iconCls: 'mi-icon svg-icon paste' }
                ]
            });
        },

        txtDownload: 'Download',
        txtPrint: 'Print',
        txtShare: 'Share',
        txtEmbed: 'Embed',
        txtFullScreen: 'Full Screen',
        txtFileLocation: 'Open file location',
        txtDownloadDocx: 'Download as docx',
        txtDownloadPdf: 'Download as pdf',
        textNext: 'Next Field',
        textClear: 'Clear All Fields',
        textSubmit: 'Submit',
        txtTheme: 'Interface theme',
        textCut: 'Cut',
        textCopy: 'Copy',
        textPaste: 'Paste',
        textPrintSel: 'Print Selection',
        txtDarkMode: 'Dark mode',
        textUndo: 'Undo',
        textRedo: 'Redo',
        textZoom: 'Zoom',
        textFitToPage: 'Fit to Page',
        textFitToWidth: 'Fit to Width',
        txtSearch: 'Search',
        tipUndo: 'Undo',
        tipRedo: 'Redo',
        textClearField: 'Clear field',
        textClose: 'Close file',
        tipSubmit: 'Submit form'

    }, DE.Views.ApplicationView || {}));
});