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
 *  FirefoxClickManager.js
 *
 *  Created on 04.06.2025
 *
 */


if (Common === undefined)
    var Common = {};

if (Common.UI === undefined) {
    Common.UI = {};
}

Common.UI.FirefoxClickManager = new(function() {
    var _init = function() {
        var mouseDownTarget = null;

        var setMouseDownTarget = function(e) {
            mouseDownTarget = e.currentTarget;
        };

        var preventMismatchedClickInFirefox = function(e) {
            if (mouseDownTarget !== e.currentTarget) {
                e.preventDefault();
                e.stopImmediatePropagation();
                mouseDownTarget = null;
                return false;
            }
            mouseDownTarget = null;
        };

        document.body.addEventListener('mousedown', function(e) {
            if (e.target.closest('.ribtab, [role="checkbox"], [type="menuitem"]')) {
                setMouseDownTarget(e);
            }
        }, true);

        document.body.addEventListener('click', function(e) {
            if (e.target.closest('.ribtab, [role="checkbox"], [type="menuitem"]')) {
                preventMismatchedClickInFirefox(e);
            }
        }, true);
        var slotSelectors = [
            '#slot-field-styles', '#transit-field-effects', '#animation-field-effects',
            '#tlbtn-insertshape-1', '#slot-field-zoom', '#slot-field-fontsize',
            '#slot-field-fontname', '#tlbtn-insertshape-0', '#slot-btn-format',
            '#animation-label-start', '#animation-spin-duration', '#animation-spin-repeat', '[id^="chb-"][id$="-description"]'
        ].join(',');

        document.body.addEventListener('mousedown', function (e) {
            const match = e.target.closest(slotSelectors);
            if (match) {
                setMouseDownTarget({ currentTarget: match });
            }
        }, true);

        document.body.addEventListener('click', function (e) {
            const match = e.target.closest(slotSelectors);
            if (match) {
                preventMismatchedClickInFirefox({ currentTarget: match, preventDefault: e.preventDefault.bind(e), stopImmediatePropagation: e.stopImmediatePropagation.bind(e) });
                mouseDownTarget = null;
            }
        }, true);
    };

    return {
        init: _init,
    }
})();