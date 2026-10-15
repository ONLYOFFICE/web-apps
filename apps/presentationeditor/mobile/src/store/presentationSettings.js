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

import {action, observable, makeObservable} from 'mobx';

export class storePresentationSettings {
    constructor() {
        makeObservable(this, {
            slideSizes: observable,
            currentPageSize: observable,
            slideSizeIndex: observable,
            allSchemes: observable,
            isLoopSlideshow: observable,
            slideOrientation: observable,
            changeSizeIndex: action,
            changeSlideOrientation: action,
            addSchemes: action,
            initSlideSizes: action,
            setLoopSlideshow: action
        })
    }

    slideSizes = [];
    currentPageSize;
    slideSizeIndex;
    slideOrientation;
    isLoopSlideshow = false;

    changeSizeIndex(width, height) {
        this.currentPageSize = {width, height};
        let ratio = height / width;
        this.slideSizeIndex = -1;

        this.slideSizes.forEach((array, index) => {
            var presetRatio = this.slideOrientation ?
                array[1] / array[0] :
                array[0] / array[1];

            if (Math.abs(presetRatio - ratio) < 0.001) {
                this.slideSizeIndex = index;
            }
        });
    }

    changeSlideOrientation(width, height) {
        this.slideOrientation = width >= height ? 1 : 0;
    }

    initSlideSizes(value) {
        this.slideSizes = value;
    }

    setLoopSlideshow(value) {
        this.isLoopSlideshow = value;
    }

    getLoopSlideshow(slideObject) {
        let loop;
        if (slideObject) {
            loop = slideObject.get_transition().get_ShowLoop();
            this.setLoopSlideshow(loop);
        }
        return this.isLoopSlideshow;
    }

    // Color Schemes

    allSchemes;

    addSchemes(arr) {
        this.allSchemes = arr;
    }

}
