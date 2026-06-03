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

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Preview from "../view/Preview";
import ContextMenu from './ContextMenu';

const PreviewController = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true})
    let _view, _touches, _touchStart, _touchEnd;

    useEffect(() => {
        const onDocumentReady = () => {
            const api = Common.EditorApi.get();

            api.asc_registerCallback('asc_onEndDemonstration', onEndDemonstration);
            api.DemonstrationEndShowMessage(_t.textFinalMessage);
        };

        ContextMenu.closeContextMenu();

        _view = $$('#pe-preview');
        _view.on('touchstart', onTouchStart);
        _view.on('touchmove', onTouchMove);
        _view.on('touchend', onTouchEnd);

        show();
        onDocumentReady();

        return () => {
            const api = Common.EditorApi.get();

            api.asc_unregisterCallback('asc_onEndDemonstration', onEndDemonstration);
        
            _view.off('touchstart', onTouchStart);
            _view.off('touchmove', onTouchMove);
            _view.off('touchend', onTouchEnd);
        };
    }, []);

    const enterFullScreen = element => {
        if(element) {
            if(element.requestFullscreen) {
                element.requestFullscreen();
            } else if(element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if(element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if(element.msRequestFullscreen) {
                element.msRequestFullscreen();
            } else {
                console.error('Full screen API is not supported in this browser.');
            }
        }
    }

    const exitFullScreen = () => {
        if(document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if(document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        } else if(document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if(document.msExitFullscreen) {
            document.msExitFullscreen();
        } else {
            console.error('Full screen exit API is not supported in this browser.');
        }
    };

    const show = () => {
        const api = Common.EditorApi.get();

        api.StartDemonstrationFromCurrentSlide('presentation-preview');
        enterFullScreen(_view[0]);
    };

    const onTouchStart = e => {
        e.preventDefault();

        _touches = [];

        for (let i = 0; i < e.touches.length; i++) {
            _touches.push([e.touches[i].pageX, e.touches[i].pageY]);
        }
        _touchEnd = _touchStart = [e.touches[0].pageX, e.touches[0].pageY];
    };

    const onTouchMove = e => {
        e.preventDefault();

        const api = Common.EditorApi.get();

        _touchEnd = [e.touches[0].pageX, e.touches[0].pageY];

        if (e.touches.length < 2 ) return;

        for (let i = 0; i < e.touches.length; i++) {
            if (Math.abs(e.touches[i].pageX - _touches[i][0]) > 20 || Math.abs(e.touches[i].pageY - _touches[i][1]) > 20 ) {
                api.EndDemonstration();
                break;
            }
        }
    };

    const onTouchEnd = e => {
        e.preventDefault();

        // const api = Common.EditorApi.get();
        //
        // if (_touchEnd[0] - _touchStart[0] > 20)
        //     api.DemonstrationPrevSlide();
        // else if (_touchStart[0] - _touchEnd[0] > 20 || (Math.abs(_touchEnd[0] - _touchStart[0]) < 1 && Math.abs(_touchEnd[1] - _touchStart[1]) < 1))
        //     api.DemonstrationNextSlide();
    };

    // API Handlers

    const onEndDemonstration = () => {
        props.closeOptions('preview');
        exitFullScreen();
    };

    return (
        <Preview />
    )
};

export {PreviewController as Preview};



