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
if (DE === undefined) {
    var DE = {};
}

DE.ApplicationView = new(function(){
    var $btnTools;
    var $menuForm;

    // Initialize view

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
                '<li><a id="idt-search"><span class="mi-icon svg-icon search"></span>' + this.txtSearch + '</a></li>' +
                '<li class="divider"></li>' +
                '<li><a id="idt-share" data-toggle="modal"><span class="mi-icon svg-icon share"></span>' + this.txtShare + '</a></li>' +
                '<li><a id="idt-close" data-toggle="modal"><span class="mi-icon svg-icon go-to-location"></span><span class="caption">' + this.txtFileLocation + '</span></a></li>' +
                '<li class="divider"></li>' +
                '<li><a id="idt-embed" data-toggle="modal"><span class="mi-icon svg-icon embed"></span>' + this.txtEmbed + '</a></li>' +
                '<li><a id="idt-fullscreen"><span class="mi-icon svg-icon fullscr"></span>' + this.txtFullScreen + '</a></li>' +
            '</ul>');
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
        txtSearch: 'Search'
    }
})();
