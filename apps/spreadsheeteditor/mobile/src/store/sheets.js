
import {observable, action, makeObservable} from 'mobx';

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
    sheets;
    hiddensheets;

    constructor() {
        makeObservable(this, {
            sheets: observable,
            hiddensheets: observable,
            resetSheets: action,
            resetHiddenSheets: action,
            setActiveWorksheet: action
        });
        this.sheets = [];
        this.hiddensheets = [];
    }

    resetSheets(sheets) {
        this.sheets = Object.values(sheets)
    }

    resetHiddenSheets(hiddensheets) {
        this.hiddensheets = Object.values(hiddensheets)
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
}
