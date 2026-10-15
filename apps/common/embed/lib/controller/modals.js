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

+function () {
    !window.common && (window.common = {});
    !common.controller && (common.controller = {});

    common.controller.modals = new(function() {
        var $dlgShare, $dlgEmbed, $dlgWarning;
        var appConfig;
        var embedCode = '<iframe allowtransparency="true" frameborder="0" scrolling="no" src="{embed-url}" width="{width}" height="{height}"></iframe>',
            minEmbedWidth = 400,
            minEmbedHeight = 600;

        function copytext(el, event) {
            el.select();
            if ( !document.execCommand('copy') ) {
                window.alert('Browser\'s error! Use keyboard shortcut [Ctrl] + [C]');
            }
        }

        var createDlgShare = function () {
            $dlgShare = common.view.modals.create('share');

            var _encoded = encodeURIComponent(appConfig.shareUrl);
            var _mailto = 'mailto:?subject=I have shared a document with you: ' + appConfig.docTitle + '&body=I have shared a document with you: ' + _encoded;

            $dlgShare.find('#btn-copyshort').on('click', copytext.bind(this, $dlgShare.find('#id-short-url')));
            $dlgShare.find('.share-buttons > span').on('click', function(e){
                if ( window.config ) {
                    const key = $(e.target).attr('data-name');
                    const btn = window.config.btnsShare[key];
                    if ( btn && btn.getUrl ) {
                        window.open(btn.getUrl(appConfig.shareUrl, appConfig.docTitle), btn.target || '',
                            btn.features || 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
                        return;
                    }
                }

                var _url;
                switch ($(e.target).attr('data-name')) {
                    case 'facebook':
                        _url = 'https://www.facebook.com/sharer/sharer.php?u=' + appConfig.shareUrl + '&t=' + encodeURI(appConfig.docTitle);
                        window.open(_url, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
                        break;
                    case 'twitter':
                        _url = 'https://twitter.com/share?url='+ _encoded;
                        !!appConfig.docTitle && (_url += encodeURIComponent('&text=' + appConfig.docTitle));
                        window.open(_url, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
                        break;
                    case 'email':
                        window.open(_mailto, '_self');
                        break;
                }
            });

            $dlgShare.find('#id-short-url').val(appConfig.shareUrl);
            $dlgShare.find('.share-buttons > #email.autotest').attr('data-test', _mailto);
        };

        var createDlgEmbed =function () {
            $dlgEmbed = common.view.modals.create('embed');

            var txtembed = $dlgEmbed.find('#txt-embed-url');
            txtembed.text(embedCode.replace('{embed-url}', appConfig.embedUrl).replace('{width}', minEmbedWidth).replace('{height}', minEmbedHeight));
            $dlgEmbed.find('#btn-copyembed').on('click', copytext.bind(this, txtembed));
            $dlgEmbed.find('#txt-embed-width, #txt-embed-height').on({
                'keypress': function(e){
                    if (e.keyCode == 13)
                        updateEmbedCode();
                }
                , 'focusout': function(e){
                    updateEmbedCode();
                }
            });
        };

        var dialogManager = {};

        /**
         * Creates and shows a password dialog.
         * @param {string} dialogKey - Unique key for the dialog instance.
         * @param {Function} submitCallback - Callback invoked with the entered password after submit.
         * @param {Object} [options] - Optional dialog configuration.
         * @param {boolean} [options.allowClose=true] - Whether the dialog can be closed by the user.
         * @param {boolean} [options.showError=false] - Whether to display an error state for the password input.
         * @param {string} [options.label] - Custom label shown in the dialog header.
         */
        var createPasswordDialog = function (dialogKey, submitCallback, options) {
            options = options || {};
            var allowClose = options.allowClose || false;
            var showError = options.showError || false;

            if (!dialogManager[dialogKey]) {
                dialogManager[dialogKey] = {};
            }

            var dialog = dialogManager[dialogKey];

            if (!dialog.$elem) {
                var submit = function() {
                    if (submitCallback) {
                        dialog.$elem.modal('hide');
                        dialog.$elem.find('#password-input').attr('disabled', true);
                        dialog.$elem.find('#password-btn').attr('disabled', true);
                        setTimeout(function() {
                            submitCallback(dialog.$elem.find('#password-input').val());
                        }, 350);
                    }
                };

                dialog.$elem = common.view.modals.create(dialogKey, 'body', {closable: allowClose, label: options.label});
                dialog.$elem.modal({backdrop: 'static', keyboard: false});
                dialog.$elem.modal('show');

                dialog.$elem.find('#password-btn').on('click', function() {
                    submit();
                });

                dialog.$elem.find('#password-input').keyup(function(e) {
                    if (e.key === "Enter") {
                        submit();
                    }
                });

                if (allowClose) {
                    dialog.$elem.on('keydown', function (e) {
                        if (e.key === 'Escape') {
                            dialog.$elem.modal('hide');
                        }
                    });
                }
            } else {
                dialog.$elem.modal('show');
                dialog.$elem.find('#password-input')
                    .attr('disabled', false)
                    [showError ? 'addClass' : 'removeClass']('error')
                    .val('');
                dialog.$elem.find('#password-label-error')[showError ? 'addClass' : 'removeClass']('error');
                dialog.$elem.find('#password-btn').attr('disabled', false);
            }

            setTimeout(function() {
                dialog.$elem.find('#password-input').focus();
            }, 500);

            return dialog.$elem;
        };

        var createDlgPassword = function (submitCallback, options) {
            createPasswordDialog('password', submitCallback, options || {});
        };

        var createDlgPrintPassword = function (submitCallback, options) {
            options = options || {};
            options.allowClose = true;
            createPasswordDialog('printPassword', submitCallback, options);
        };

        var showWarning = function(config) {
            $dlgWarning = common.view.modals.create('warning', 'body', {
                title: config.title, 
                message: config.message,
                buttons: config.buttons || ['ok'],
                primary: config.primary 
            });
            $dlgWarning.on('click', '[data-btn]', function() {
                const btn = $(this).data('btn');
                $dlgWarning.modal('hide');
                 if (config.callback) {
                    config.callback(btn);
                }
            });
            $dlgWarning.on('click', '[data-dismiss="modal"]', function() {
                 if (config.closecallback) {
                    config.closecallback();
                }
            });

            $dlgWarning.on('hidden.bs.modal', function() {
                $dlgWarning.remove();
            });
            
            $dlgWarning.modal({
                backdrop: 'static',
                keyboard: false,
                show: true
            });
        };

        function updateEmbedCode(){
            var $txtwidth = $dlgEmbed.find('#txt-embed-width');
            var $txtheight = $dlgEmbed.find('#txt-embed-height');
            var newWidth  = parseInt($txtwidth.val()),
                newHeight = parseInt($txtheight.val());

            if (newWidth < minEmbedWidth)
                newWidth = minEmbedWidth;

            if (newHeight < minEmbedHeight)
                newHeight = minEmbedHeight;

            $dlgEmbed.find('#txt-embed-url').text(embedCode.replace('{embed-url}', appConfig.embedUrl).replace('{width}', newWidth).replace('{height}', newHeight));

            $txtwidth.val(newWidth + 'px');
            $txtheight.val(newHeight + 'px');
        }

        var attachToView = function(config) {
            if ( config.share && !!appConfig.shareUrl ) {
                if ( !$dlgShare ) {
                    createDlgShare();
                }

                $(config.share).on('click', function(e){
                    $dlgShare.modal('show');
                });
            }

            if ( config.embed && !!appConfig.embedUrl ) {
                if ( !$dlgEmbed ) {
                    createDlgEmbed();
                }

                $(config.embed).on('click', function(e) {
                    $dlgEmbed.modal('show');
                })
            }
        };

        return {
            init: function(config) { appConfig = config; }, 
            attach: attachToView,
            createDlgPassword: createDlgPassword,
            createDlgPrintPassword: createDlgPrintPassword,
            showWarning: showWarning
        };
    });
}();