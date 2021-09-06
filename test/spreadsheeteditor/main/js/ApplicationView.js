/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
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
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
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
if (SSE === undefined) {
    var SSE = {};
}

SSE.ApplicationView = new(function(){

    var $btnTools
        ,$cellname
        ,$btnexpand
        ,$btnfunc
        ,btnNamedRanges;



    // Initialize view

    function createView(){

        $cellname = $('#ce-cell-name');
        $btnexpand = $('#ce-btn-expand');
        $btnfunc = $('#ce-func-label');
        $btnfunc.addClass('disabled');
        /*btnNamedRanges = new Common.UI.Button({
            parentEl: $('#ce-cell-name-menu'),
            menu        : new Common.UI.Menu({
                style   : 'min-width: 70px;max-width:400px;',
                maxHeight: 250,
                items: [
                    { caption: this.textManager, value: 'manager' },
                    { caption: '--' }
                ]
            })
        });
        this.btnNamedRanges.setVisible(false);
        this.btnNamedRanges.menu.setOffset(-81);*/

        $btnTools = $('#box-tools button');


        $btnTools.addClass('dropdown-toggle').attr('data-toggle', 'dropdown').attr('aria-expanded', 'true');
        $btnTools.parent().append(
            '<ul class="dropdown-menu pull-right">' +
                '<li><a id="idt-print"><span class="mi-icon svg-icon print"></span>' + this.txtPrint + '</a></li>' +
                '<li><a id="idt-download"><span class="mi-icon svg-icon download"></span>' + this.txtDownload + '</a></li>' +
                '<li><a id="idt-share" data-toggle="modal"><span class="mi-icon svg-icon share"></span>' + this.txtShare + '</a></li>' +
                '<li><a id="idt-close" data-toggle="modal"><span class="mi-icon svg-icon go-to-location"></span>' + this.txtFileLocation + '</a></li>' +
                '<li class="divider"></li>' +
                '<li><a id="idt-embed" data-toggle="modal"><span class="mi-icon svg-icon embed"></span>' + this.txtEmbed + '</a></li>' +
                '<li><a id="idt-fullscreen"><span class="mi-icon svg-icon fullscr"></span>' + this.txtFullScreen + '</a></li>' +
            '</ul>');
    }

    function getTools(name) {
        return $btnTools.parent().find(name);
    }
    function updateCellInfo(info) {
        if (info) {
            this.$cellname.val(typeof(info)=='string' ? info : info.asc_getName());
        }
    }
    function cellNameDisabled(disabled){
        (disabled) ? this.$cellname.attr('disabled', 'disabled') : this.$cellname.removeAttr('disabled');
        this.btnNamedRanges.setDisabled(disabled);
    }

    return {
        create: createView
        , tools: {
            get: getTools
        },
        cell:   {
            updateInfo: updateCellInfo,
            nameDisabled: cellNameDisabled
        },

        txtDownload: 'Download',
        txtPrint: 'Print',
        txtShare: 'Share',
        txtEmbed: 'Embed',
        txtFullScreen: 'Full Screen',
        txtFileLocation: 'Open file location'
    }
})();
