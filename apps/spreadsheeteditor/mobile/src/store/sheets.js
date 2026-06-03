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

import {observable, action, makeObservable, computed} from 'mobx';

class Worksheet {
    sheet = {
        index       : -1,
        active      : false,
        name        : '',
        locked      : false,
        hidden      : false,
        color       : ''
    };

    constructor(data = {}) {
        makeObservable(this, {
            sheet: observable
        });
        this.sheet.merge(data);
    }
}

export class storeWorksheets {
    sheets = [];

    constructor() {
        makeObservable(this, {
            sheets: observable,
            resetSheets: action,
            setActiveWorksheet: action,
            activeWorksheet: computed,

            isWorkbookLocked: observable,
            setWorkbookLocked: action,

            isWorksheetLocked: observable,
            setWorksheetLocked: action,

            isProtectedWorkbook: observable,
            setProtectedWorkbook: action,

            wsProps: observable,
            setWsProps: action,

            isDisabledEditSheet: observable,
            setDisabledEditSheet: action,

            colorTab:observable,
            changeTabColor: action
        });
        this.sheets = [];
    }

    colorTab = undefined;

    resetSheets(sheets) {
        this.sheets = Object.values(sheets)
    }

    changeTabColor(color) {
        this.colorTab = color;
    }

    setActiveWorksheet(i) {
        if ( !this.sheets[i].active ) {
            this.sheets.forEach(model => {
                if ( model.active )
                    model.active = false;
            });

            this.sheets[i].active = true;
        }
    }

    get activeWorksheet() {
        for (let i = 0; i < this.sheets.length; i++) {
            if (this.sheets[i].active)
                return i;
        }
        return -1;
    }

    at(i) {
        return this.sheets[i]
    }

    hasHiddenWorksheet() {
        return this.sheets.some(model => model.hidden);
    }

    hiddenWorksheets() {
        return this.sheets.filter(model => model.hidden);
    }

    visibleWorksheets() {
        return this.sheets.filter(model => !model.hidden);
    }

    isWorkbookLocked = false;
    setWorkbookLocked(locked) {
        this.isWorkbookLocked = locked;
    }

    isWorksheetLocked = false;
    setWorksheetLocked(index, locked) {
        let model = this.sheets[index];
        if(model && model.locked !== locked)
            model.locked = locked;
        this.isWorksheetLocked = locked;
    }

    isProtectedWorkbook = false;
    setProtectedWorkbook(value) {
        this.isProtectedWorkbook = value;
    }

    wsProps;
    setWsProps(value) {
        this.wsProps = value;
    }

    wsLock;
    setWsLock(value) {
        this.wsLock = value;
    }

    isDisabledEditSheet;
    setDisabledEditSheet(value) {
        this.isDisabledEditSheet = value;
    }
}
