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

