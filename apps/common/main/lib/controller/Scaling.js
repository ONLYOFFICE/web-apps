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
 * Created on 2/5/2021.
 */

define([
    'core'
], function () {
    'use strict';

    !Common.UI && (Common.UI = {});

    Common.UI.Scaling = new (function() {
        const scales_map = {
            'pixel-ratio__1'    : 1,
            'pixel-ratio__1_25' : 1.25,
            'pixel-ratio__1_5'  : 1.5,
            'pixel-ratio__1_75' : 1.75,
            'pixel-ratio__2'    : 2,
            'pixel-ratio__2_5'  : 2.25,
        }

        let _body_classes = document.body.className;

        const _from_class_list = function (str) {
            const reg_ratio = /(pixel-ratio__[\w-]+)/.exec(str);
            if ( reg_ratio && (reg_ratio[1] in scales_map) ) {
                return reg_ratio[1];
            }

            return 'pixel-ratio__1';
        }

        let _current_ratio_str = _from_class_list(_body_classes);

        const _callback = function (records, observer) {
            const _changed_ratio = _from_class_list(document.body.className);
            if ( _changed_ratio != _current_ratio_str ) {
                $('[ratio]').trigger('app:scaling', {ratio: scales_map[_changed_ratio]});

                _current_ratio_str = _changed_ratio;
            }
        };

        (new MutationObserver(_callback.bind(this)))
            .observe(document.body, {
                attributes : true,
                attributeFilter : ['class'],
            })

        return {
            currentRatio: function () { return scales_map[_current_ratio_str] },
            currentRatioSelector: function () { return _current_ratio_str },
        };
    });
});