
import {observable, action} from 'mobx';

class Worksheet {
    @observable sheet = {
        index       : -1,
        active      : false,
        name        : '',
        locked      : false,
        hidden      : false,
        color       : ''
    };

    constructor(data = {}) {
        this.sheet.merge(data);
    }
}

export class storeWorksheets {
    @observable sheets;

    constructor() {
        this.sheets = [];
    }

    @action reset(sheets) {
        this.sheets = Object.values(sheets)
    }

    @action setActiveWorksheet(i) {
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
}
