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
    
    DE.Views.ApplicationView = Backbone.View.extend({
        // Render layout
        render: function() {
            $btnTools = $('#box-tools button');

            $btnTools.addClass('dropdown-toggle').attr('data-toggle', 'dropdown').attr('aria-expanded', 'true');
            $btnTools.parent().append(
                '<ul class="dropdown-menu pull-right">' +
                '<li><a id="idt-print"><span class="mi-icon svg-icon print"></span>' + this.txtPrint + '</a></li>' +
                '<li class="divider"></li>' +
                '<li><a id="idt-download"><span class="mi-icon svg-icon download"></span>' + this.txtDownload + '</a></li>' +
                '<li><a id="idt-download-docx"><span class="mi-icon svg-icon download"></span>' + this.txtDownloadDocx + '</a></li>' +
                '<li><a id="idt-download-pdf"><span class="mi-icon"></span>' + this.txtDownloadPdf + '</a></li>' +
                '<li class="divider"></li>' +
                '<li><a id="idt-share" data-toggle="modal"><span class="mi-icon svg-icon share"></span>' + this.txtShare + '</a></li>' +
                '<li><a id="idt-close" data-toggle="modal"><span class="mi-icon svg-icon go-to-location"></span>' + this.txtFileLocation + '</a></li>' +
                '<li class="divider"></li>' +
                '<li><a id="idt-embed" data-toggle="modal"><span class="mi-icon svg-icon embed"></span>' + this.txtEmbed + '</a></li>' +
                '<li><a id="idt-fullscreen"><span class="mi-icon svg-icon fullscr"></span>' + this.txtFullScreen + '</a></li>' +
                '</ul>');
            return this;
        },

        getTools: function(name) {
            return $btnTools.parent().find(name);
        },

        txtDownload: 'Download',
        txtPrint: 'Print',
        txtShare: 'Share',
        txtEmbed: 'Embed',
        txtFullScreen: 'Full Screen',
        txtFileLocation: 'Open file location',
        txtDownloadDocx: 'Download as docx',
        txtDownloadPdf: 'Download as pdf'
    });
});