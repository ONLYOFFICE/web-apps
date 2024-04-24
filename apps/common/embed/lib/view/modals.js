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

    return {
        create: function(name, parent) {
            !parent && (parent = 'body');

            var _$dlg;
            if (name == 'share') {
                if ( window.config && window.config.btnsShare ) {
                    let _btns = [];
                    const _keys = Object.keys(config.btnsShare);
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
    };
})();
