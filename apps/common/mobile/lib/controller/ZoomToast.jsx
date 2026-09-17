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

import { useEffect } from 'react';
import { f7 } from 'framework7-react';

let isTouch = false;
let toast = null;
let hideTimer = null;
let isNewZoom = true;
let midX = null;
let midY = null;

function updateTouches(touches) {
    midX = (touches[0].clientX + touches[1].clientX) / 2;
    midY = (touches[0].clientY + touches[1].clientY) / 2;
}

function resetTracking(touches) {
    updateTouches(touches);
    isNewZoom = true;
}

function showToast(percent) {
    if (!isTouch) return;

    if (!toast) {
        toast = f7.toast.create({ text: `${percent}%`, position: 'center' });
    } else {
        toast.$el.find('.toast-text').text(`${percent}%`);
    }
    if (isNewZoom) {
        toast.$el.css({ left: `${midX}px`, top: `${midY - 40}px` });
        isNewZoom = false;
    }
    toast.$el.css('width', '60px');
    toast.open();

    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => toast && toast.close(), 1000);
}

const ZoomToast = () => {
    useEffect(() => {
        const onTouchStart = e => {
            if (e.touches && e.touches.length > 1) {
                isTouch = true;
                resetTracking(e.touches);
            }
        };
        const onTouchEnd = e => {
            if (!e.touches || e.touches.length < 2) isTouch = false;
        };
        const onTouchMove = e => {
            if (e.touches && e.touches.length > 1) updateTouches(e.touches);
        };

        document.addEventListener('touchstart', onTouchStart, true);
        document.addEventListener('touchend', onTouchEnd, true);
        document.addEventListener('touchmove', onTouchMove, true);

        const handleEngineCreated = api => {
            if (window.editorType === 'sse') api.asc_registerCallback('asc_onZoomChanged', scale => showToast(Math.floor((scale + .005) * 100)));
            else api.asc_registerCallback('asc_onZoomChange', showToast);
        };

        const api = Common.EditorApi ? Common.EditorApi.get() : undefined;
        if (api) handleEngineCreated(api);
        else Common.Notifications.on('engineCreated', handleEngineCreated);

        return () => {
            document.removeEventListener('touchstart', onTouchStart, true);
            document.removeEventListener('touchend', onTouchEnd, true);
            document.removeEventListener('touchmove', onTouchMove, true);
            Common.Notifications.off('engineCreated', handleEngineCreated);
        };
    }, []);

    return null;
};

export default ZoomToast;