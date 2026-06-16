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
/**
 *  LoadMask.js
 *
 *  Displays loading mask over selected element(s) or component. Accepts both single and multiple selectors.
 *
 *  Created on 24.06.2021
 *
 */

!window.common && (window.common = {});
!common.view && (common.view = {});

common.view.LoadMask = function(owner) {
    var tpl = '<div class="asc-loadmask-body" role="presentation" tabindex="-1">' +
                '<i id="loadmask-spinner" class="asc-loadmask-image"></i>' +
                '<div class="asc-loadmask-title"></div>' +
               '</div>';
    var ownerEl = owner || $(document.body),
        loaderEl,
        maskedEl,
        title = '',
        timerId = 0,
        rendered = false;
    return {

        show: function(){
            if (!loaderEl || !maskedEl) {
                loaderEl = $(tpl);
                maskedEl = $('<div class="asc-loadmask"></div>');
            }

            $('.asc-loadmask-title', loaderEl).html(title);

            // show mask after 500 ms if it wont be hided
            if (!rendered) {
                rendered = true;
                timerId = setTimeout(function () {
                    ownerEl.append(maskedEl);
                    ownerEl.append(loaderEl);

                    loaderEl.css('min-width', $('.asc-loadmask-title', loaderEl).width() + 108);
                },500);
            }
        },

        hide: function() {
            if (timerId) {
                clearTimeout(timerId);
                timerId = 0;
            }
            maskedEl && maskedEl.remove();
            loaderEl && loaderEl.remove();
            maskedEl = loaderEl = null;
            rendered = false;
        },

        setTitle: function(text) {
            title = text;

            if (ownerEl && loaderEl){
                var el = $('.asc-loadmask-title', loaderEl);
                el.html(title);
                loaderEl.css('min-width', el.width() + 108);
            }
        }
    }
};

