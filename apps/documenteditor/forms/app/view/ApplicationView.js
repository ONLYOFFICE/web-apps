define([
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/util/utils',
    'common/main/lib/component/Button',
    'common/main/lib/component/Menu',
    'common/main/lib/component/Calendar'
], function ($, _, Backbone) {
    'use strict';

    var $btnTools;
    var $menuForm;

    DE.Views.ApplicationView = Backbone.View.extend({
        // Render layout
        render: function() {
            this.btnOptions = new Common.UI.Button({
                cls: 'btn-toolbar no-caret',
                iconCls: 'svg-icon more-vertical',
                menu: new Common.UI.Menu({
                    items: [
                        {caption: this.txtPrint, value: 'print', iconCls: 'mi-icon svg-icon print'},
                        {caption: '--'},
                        {caption: this.txtDownload, value: 'download', iconCls: 'mi-icon svg-icon download'},
                        {caption: this.txtDownloadDocx, value: 'download-docx', iconCls: 'mi-icon svg-icon download'},
                        {caption: this.txtDownloadPdf, value: 'download-pdf', iconCls: 'mi-icon'},
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

            this.btnClear = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'svg-icon clear-style',
                caption: this.textClear
            });
            this.btnClear.render($('#id-btn-clear-fields'));

            this.btnNext = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'svg-icon arrow-down',
                caption: this.textNext
            });
            this.btnNext.render($('#id-btn-next-field'));

            this.btnPrev = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'svg-icon arrow-up'
            });
            this.btnPrev.render($('#id-btn-prev-field'));
            return this;
        },

        getTools: function(name) {
            return $btnTools.parent().find(name);
        },

        getMenuForm: function() {
            if (!$menuForm) {
                $menuForm = $('<div id="menu-container-form" style="position: absolute; z-index: 10000;" data-value="prevent-canvas-click">' +
                    '<div class="dropdown-toggle" data-toggle="dropdown"></div>' +
                    '<ul class="dropdown-menu" oo_editor_input="true" role="menu" style="right: 0; left: auto;max-height: 200px; overflow-y: auto;"></ul>' +
                    '</div>');
                $('#editor_sdk').append($menuForm);
            }
            return $menuForm;
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
        textClear: 'Clear All Fields'
    });
});