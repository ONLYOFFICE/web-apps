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

import React from 'react';

const NavControls = ({ t, isPlaying, onPrev, onNext, onTogglePlay }) => (
    <>
        <button className="pe-preview__btn" aria-label={t.textPreviousSlide} onClick={onPrev}>
            <SvgIcon symbolId={IconMediaPrevious.id} className={'icon icon-svg'}/>
        </button>
        <button className="pe-preview__btn" aria-label={isPlaying ? t.textPause : t.textPlay} onClick={onTogglePlay}>
            <SvgIcon symbolId={(isPlaying ? IconMediaPause : IconMediaPlay).id} className={'icon icon-svg'}/>
        </button>
        <button className="pe-preview__btn" aria-label={t.textNextSlide} onClick={onNext}>
            <SvgIcon symbolId={IconMediaNext.id} className={'icon icon-svg'}/>
        </button>
    </>
);

const Preview = ({
    t,
    currentSlide,
    countPages,
    isPlaying,
    isBarsShown,
    isAtEnd,
    onClose,
    onPrev,
    onNext,
    onTogglePlay,
}) => {
    const counter = useMemo(() => (t.textSlideXofY || 'Slide {0} of {1}')
        .replace('{0}', countPages > 0 ? Math.min(currentSlide + 1, countPages) : 0)
        .replace('{1}', countPages),
    [t.textSlideXofY, currentSlide, countPages]);

    const rootClass = ['pe-preview'];
    if (!isBarsShown) rootClass.push('bars-hidden');
    if (Device.isTablet) rootClass.push('is-tablet');
    if (isAtEnd) rootClass.push('is-at-end');

    return (
        <div id="pe-preview" className={rootClass.join(' ')}>
            <div className="pe-preview__top-bar">
                <button className="pe-preview__btn pe-preview__close" aria-label={t.textClose} onClick={onClose}>
                    {Device.ios ? <span>{t.textClose}</span> : <SvgIcon symbolId={IconClose.id} className={'icon icon-svg'}/>}
                </button>
                <span className="pe-preview__counter">{counter}</span>
                <div className="pe-preview__top-controls">
                    <NavControls t={t} isPlaying={isPlaying} onPrev={onPrev} onNext={onNext} onTogglePlay={onTogglePlay}/>
                </div>
            </div>
            <div id="presentation-preview" className="pe-preview__canvas"/>
            <div className="pe-preview__bottom-bar">
                <NavControls t={t} isPlaying={isPlaying} onPrev={onPrev} onNext={onNext} onTogglePlay={onTogglePlay}/>
            </div>
        </div>
    );
};

export default Preview;
