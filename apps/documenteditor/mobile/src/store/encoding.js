import {action, observable, makeObservable} from 'mobx';

export class storeEncoding {
    constructor() {
        makeObservable(this, {
            type: observable,
            advOptions: observable,
            formatOptions: observable,
            pages: observable,
            pagesName: observable,
            initOptions: action,
            valueEncoding: observable,
            nameEncoding: observable,
            initPages: action,
            changeEncoding: action
        });
    }

    pages = [];
    pagesName = [];
    type;
    advOptions;
    formatOptions;
    valueEncoding;
    nameEncoding;

    initOptions ({type, advOptions, formatOptions}) {
        this.type= type;
        this.advOptions = advOptions;
        this.formatOptions = formatOptions;
    }

    initPages() {
        for (let page of this.advOptions.asc_getCodePages()) {
            this.pages.push(page.asc_getCodePage());
            this.pagesName.push(page.asc_getCodePageName());
        }
    }

    changeEncoding(value) {
        this.nameEncoding = this.pagesName[this.pages.indexOf(value)];
        this.valueEncoding = value;
    }
}
