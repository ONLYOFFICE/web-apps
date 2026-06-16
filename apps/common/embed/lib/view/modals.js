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

!window.common && (window.common = {});
!common.view && (common.view = {});
common.view.modals = new(function() {
    var tplDialog = '<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="idm-title" aria-hidden="true">' +
                        '<div class="modal-dialog" role="document">' +
                            '<div class="modal-content">' +
                                '<div class="modal-header">' +
                                    '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
                                        '<span aria-hidden="true">&times;</span>' +
                                    '</button>' +
                                    '<h4 id="idm-title" class="modal-title">{title}</h4>'+
                                '</div>'+
                                '<div class="modal-body">{body}</div>'+
                                '<div class="modal-footer">{footer}</div>'+
                            '</div>' +
                        '</div>' +
                    '</div>';

    var _tplbody_share = '<div class="share-link">' +
                            '<input id="id-short-url" class="form-control" type="text" readonly/>' +
                        '</div>' +
                        '<div class="share-buttons">' +
                            '<span class="svg big-facebook" data-name="facebook"></span>' +
                            '<span class="svg big-twitter" data-name="twitter"></span>' +
                            '<span class="svg big-email" data-name="email"></span>' +
                            '<div class="autotest" id="email" style="display: none"></div>' +
                        '</div>';

    var _tplbody_embed = '<div class="size-manual">' +
                            '<span class="caption">{width}:</span>' +
                            '<input id="txt-embed-width" class="form-control input-xs" type="text" value="400px">' +
                            '<input id="txt-embed-height" class="form-control input-xs right" type="text" value="600px">' +
                            '<span class="right caption">{height}:</span>' +
                        '</div>' +
                        '<textarea id="txt-embed-url" rows="4" class="form-control" readonly></textarea>';
    
    var _tplbody_password =  '<div class="password-body">' +
                                '<label>{label}</label>' + 
                                '<input id="password-input" class="form-control" type="password"/>' +
                                '<label id="password-label-error">{error}</label>' + 
                                '{button}' + 
                            '</div>';
    
    var _tplbody_warning = '<div class="warning-body">' +
                                '<span class="message">{message}</span>' +
                           '</div>';                        
                  

    return {
        create: function(name, parent, config) {
            !parent && (parent = 'body');

            var _$dlg;
            if (name == 'share') {
                if ( window.config && window.config.btnsShare ) {
                    let _btns = [];
                    const _keys = Object.keys(window.config.btnsShare);
                    for (var i in _keys)
                        _btns.push('<span class="svg big-'+ _keys[i] + '" data-name="' + _keys[i] + '"></span>');

                    if ( _btns ) {
                        let $sharebox = $(_tplbody_share);
                        $sharebox.find('.autotest').prevAll().remove();
                        $sharebox.eq(1).prepend(_btns.join(''));

                        _tplbody_share = $("<div>").append($sharebox).html();
                    }
                }

                _$dlg = $(tplDialog
                            .replace(/\{title}/, this.txtShare)
                            .replace(/\{body}/, _tplbody_share)
                            .replace(/\{footer}/, '<button id="btn-copyshort" type="button" class="btn">' + this.txtCopy + '</button>'))
                                .appendTo(parent)
                                .attr('id', 'dlg-share');
            } else if (name == 'embed') {
                _$dlg = $(tplDialog
                            .replace(/\{title}/, this.txtEmbed)
                            .replace(/\{body}/, _tplbody_embed)
                            .replace(/\{width}/, this.txtWidth)
                            .replace(/\{height}/, this.txtHeight)
                            .replace(/\{footer}/, '<button id="btn-copyembed" type="button" class="btn">' + this.txtCopy + '</button>'))
                                .appendTo(parent)
                                .attr('id', 'dlg-embed');
            } else if(name == 'password') {
                _$dlg = $(tplDialog
                    .replace(/\{title}/, this.txtTitleProtected)
                    .replace(/\{body}/, _tplbody_password)
                    .replace(/\{label}/, this.txtOpenFile)
                    .replace(/\{error}/, this.txtIncorrectPwd)
                    .replace(/\{button}/, '<button id="password-btn" type="button" class="btn">OK</button>'))
                        .appendTo(parent)
                        .attr('id', 'dlg-password');

                _$dlg.find('button.close').remove();
                _$dlg.find('.modal-footer').remove();
            } else if(name == 'printPassword') {
                _$dlg = $(tplDialog
                    .replace(/\{title}/, this.txtTitleProtectedPrint)
                    .replace(/\{body}/, _tplbody_password)
                    .replace(/\{label}/, this.txtPrintFile)
                    .replace(/\{error}/, this.txtIncorrectPwd)
                    .replace(/\{button}/, '<button id="password-btn" type="button" class="btn">OK</button>'))
                        .appendTo(parent)
                        .attr('id', 'dlg-password');

                _$dlg.find('.modal-footer').remove();
            } else if (name == 'warning') {
                var footerBtns = (config && config.buttons || ['ok']).map(btn => 
                    `<button type="button" class="btn ${config.primary === btn ? 'btn-primary' : ''}" 
                            data-btn="${btn}">${btn}</button>`
                ).join('');
    
                _$dlg = $(tplDialog
                    .replace(/{title}/g, (config && config.title))
                    .replace(/{body}/g, _tplbody_warning.replace(/{message}/g, (config && config.message)))
                    .replace(/{footer}/g, footerBtns))
                        .appendTo(parent)
                        .attr('id', 'dlg-warning');
            }

            return _$dlg;
        },
        txtWidth: 'Width',
        txtHeight: 'Height',
        txtShare: 'Share Link',
        txtCopy: 'Copy to clipboard',
        txtEmbed: 'Embed',
        txtTitleProtected: 'Protected file',
        txtOpenFile: 'Enter a password to open the file',
        txtIncorrectPwd: 'Password is incorrect',
        txtTitleProtectedPrint: 'Protected print',
        txtPrintFile: 'Enter a password to print the file',
    };
})();
