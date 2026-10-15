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
if (DE === undefined) {
    var DE = {};
}

DE.ApplicationView = new(function(){
    var $btnTools;
    var $menuForm;

    // Initialize view

    function createZoomMenu() {
        var items = '<li data-value="zoom:page"><a><span class="mi-icon menu-check"></span>' + this.textFitToPage + '</a></li>' +
                    '<li data-value="zoom:width"><a><span class="mi-icon menu-check"></span>' + this.textFitToWidth + '</a></li>' +
                    '<li data-value="zoom:multi"><a><span class="mi-icon menu-check"></span>' + this.textMultiplePages + '</a></li>' +
                    '<li class="divider"></li>';

        [50, 75, 100, 125, 150, 175, 200, 300, 400, 500].forEach(function(value){
            items += '<li data-value="' + value + '" data-group="zoom-list"><a><span class="mi-icon menu-check"></span>' + value + '%</a></li>';
        });

        return '<li id="idt-zoom" class="dropdown-submenu">' +
                    '<a><span class="mi-icon"></span>' + this.textZoom + '</a>' +
                    '<ul id="idt-zoom-menu" class="dropdown-menu">' + items + '</ul>' +
                '</li>';
    }

    function createView(){
        $btnTools = $('#box-tools button');

        $btnTools.addClass('dropdown-toggle').attr('data-toggle', 'dropdown').attr('aria-expanded', 'true');
        $btnTools.parent().append(
            '<ul class="dropdown-menu pull-right">' +
                '<li><a id="idt-download"><span class="mi-icon svg-icon download"></span>' + this.txtDownload + '</a></li>' +
                '<li><a id="idt-download-docx"><span class="mi-icon svg-icon download"></span>' + this.txtDownloadDocx + '</a></li>' +
                '<li><a id="idt-download-pdf"><span class="mi-icon"></span>' + this.txtDownloadPdf + '</a></li>' +
                '<li><a id="idt-print"><span class="mi-icon svg-icon print"></span>' + this.txtPrint + '</a></li>' +
                '<li class="divider"></li>' +
                createZoomMenu.call(this) +
                '<li><a id="idt-search"><span class="mi-icon svg-icon search"></span>' + this.txtSearch + '</a></li>' +
                '<li class="divider"></li>' +
                '<li><a id="idt-share" data-toggle="modal"><span class="mi-icon svg-icon share"></span>' + this.txtShare + '</a></li>' +
                '<li><a id="idt-close" data-toggle="modal"><span class="mi-icon svg-icon go-to-location"></span><span class="caption">' + this.txtFileLocation + '</span></a></li>' +
                '<li class="divider"></li>' +
                '<li><a id="idt-embed" data-toggle="modal"><span class="mi-icon svg-icon embed"></span>' + this.txtEmbed + '</a></li>' +
                '<li><a id="idt-fullscreen"><span class="mi-icon svg-icon fullscr"></span>' + this.txtFullScreen + '</a></li>' +
            '</ul>');

        $('#idt-zoom > a').on('click', function(e){
            e.preventDefault();
            e.stopPropagation();
        });

        $('#idt-zoom').on('mouseenter', function(){
            var space = $(window).height() - $(this).offset().top - 4;
            $('#idt-zoom-menu').css('max-height', Math.max(space, 100) + 'px');
        });
    }

    function getTools(name) {
        return $btnTools.parent().find(name);
    }

    function getMenuForm() {
        if (!$menuForm) {
            $menuForm = $('<div id="menu-container-form" style="position: absolute; z-index: 10000;" data-value="prevent-canvas-click">' +
                                                    '<div class="dropdown-toggle" data-toggle="dropdown"></div>' +
                                                    '<ul class="dropdown-menu" oo_editor_input="true" role="menu" style="right: 0; left: auto;max-height: 200px; overflow-y: auto;"></ul>' +
                                                '</div>');
            $('#editor_sdk').append($menuForm);
        }
        return $menuForm;
    }

    return {
        create: createView
        , tools: {
            get: getTools
        },
        getMenuForm: getMenuForm,

        txtDownload: 'Download',
        txtPrint: 'Print',
        txtShare: 'Share',
        txtEmbed: 'Embed',
        txtFullScreen: 'Full Screen',
        txtFileLocation: 'Open file location',
        txtDownloadDocx: 'Download as docx',
        txtDownloadPdf: 'Download as pdf',
        txtSearch: 'Search',
        textZoom: 'Zoom',
        textFitToPage: 'Fit to page',
        textFitToWidth: 'Fit to width',
        textMultiplePages: 'Multiple pages'
    }
})();
