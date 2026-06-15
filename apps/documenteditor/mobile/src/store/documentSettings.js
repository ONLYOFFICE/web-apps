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

import {action, observable, computed, makeObservable} from 'mobx';

export class storeDocumentSettings {
    constructor() {
        makeObservable(this, {
            isPortrait: observable,
            widthDocument: observable,
            heightDocument: observable,
            allSchemes: observable,
            isHyphenation: observable,
            resetPortrait: action,
            changeDocSize: action,
            pageSizesIndex: computed,
            addSchemes: action,
            setHyphenation: action,
        });
    }

    isPortrait = true;
    isHyphenation = false;

    resetPortrait (isPortrait) {
        this.isPortrait = isPortrait === true;
    }

    setHyphenation (value) {
        this.isHyphenation = value;
    }

    getHyphenation () {
        this.setHyphenation(Common.EditorApi.get().asc_isAutoHyphenation());
        return this.isHyphenation;
    }

    //Document Formats

    widthDocument;
    heightDocument;

    changeDocSize (width, height) {
        let w = width;
        let h = height;
        if (!this.isPortrait) {
            const tempW = w;
            w = h;
            h = tempW;
        }
        this.widthDocument = w;
        this.heightDocument = h;
    }

    getPageSizesList () {
        const txtCm = Common.Utils.Metric.getMetricName(Common.Utils.Metric.c_MetricUnits.cm);
        const pageSizes = [
                { caption: 'US Letter',             subtitle: '21,59 ' + txtCm + ' x 27,94 ' + txtCm,  value: [215.9, 279.4] },
                { caption: 'US Legal',              subtitle: '21,59 ' + txtCm + ' x 35,56 ' + txtCm,  value: [215.9, 355.6] },
                { caption: 'A4',                    subtitle: '21 ' + txtCm + ' x 29,7 ' +  txtCm,     value: [210, 297] },
                { caption: 'A5',                    subtitle: '14,8 ' + txtCm + ' x 21 ' + txtCm,      value: [148, 210] },
                { caption: 'B5',                    subtitle: '17,6 ' + txtCm + ' x 25 ' + txtCm,      value: [176, 250] },
                { caption: 'Envelope #10',          subtitle: '10,48 ' + txtCm + ' x 24,13 ' + txtCm,  value: [104.8, 241.3] },
                { caption: 'Envelope DL',           subtitle: '11 ' + txtCm + ' x 22 ' + txtCm,        value: [110, 220] },
                { caption: 'Tabloid',               subtitle: '27,94 ' + txtCm + ' x 43,18 ' + txtCm,  value: [279.4, 431.8] },
                { caption: 'A3',                    subtitle: '29,7 ' + txtCm + ' x 42 ' + txtCm,      value: [297, 420] },
                { caption: 'Tabloid Oversize',      subtitle: '29,69 ' + txtCm + ' x 45,72 ' + txtCm,  value: [296.9, 457.2] },
                { caption: 'ROC 16K',               subtitle: '19,68 ' + txtCm + ' x 27,3 ' + txtCm,   value: [196.8, 273] },
                { caption: 'Envelope Choukei 3',    subtitle: '12 ' + txtCm + ' x 23,5 ' + txtCm,  value: [120, 235] },
                { caption: 'Super B/A3',            subtitle: '30,5 ' + txtCm + ' x 48,7 ' + txtCm,  value: [305, 487] },
                { caption: 'A0',                    subtitle: '84,1 ' + txtCm + ' x 118,9 ' + txtCm,   value: [841, 1189] },
                { caption: 'A1',                    subtitle: '59,4 ' + txtCm + ' x 84,1 ' + txtCm,    value: [594, 841] },
                { caption: 'A2',                    subtitle: '42 ' + txtCm + ' x 59,4 ' + txtCm,      value: [420, 594] },
                { caption: 'A6',                    subtitle: '10,5 ' + txtCm + ' x 14,8 ' + txtCm,    value: [105, 148] }
            ];
        return pageSizes;
    }

    get pageSizesIndex () {
        let w = this.widthDocument;
        let h = this.heightDocument;
        let ind = -1;
        const pageSizes = this.getPageSizesList();
        pageSizes.forEach(function callback(size, index) {
            if (Math.abs(size.value[0] - w) < 0.1 && Math.abs(size.value[1] - h) < 0.1) {
                ind = index;
            }
        }, this);
        if (ind === -1) {
            ind = -1;
        }
        return ind;
    }

    // Color Schemes

    allSchemes;

    addSchemes(arr) {
        this.allSchemes = arr;
    }

}
