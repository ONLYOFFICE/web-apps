import {action, observable, makeObservable} from 'mobx';

export class storeEncoding {
    constructor() {
        makeObservable(this, {
            type: observable,
            mode: observable,
            setMode: action,
            advOptions: observable,
            formatOptions: observable,
            pages: observable,
            pagesName: observable,
            initOptions: action,
            valueEncoding: observable,
            nameEncoding: observable,
            initPages: action,
            changeEncoding: action,
            valueDelimeter: observable,
            nameDelimeter: observable,
            changeDelimeter: action,
            namesDelimeter: observable,
            valuesDelimeter: observable,
            initNamesDelimeter: action
        });
    }

    type;
    mode = 1;
    pages = [];
    pagesName = [];
    advOptions;
    formatOptions;
    valueEncoding;
    nameEncoding;
    namesDelimeter = [];
    valuesDelimeter = [4, 2, 3, 1, 5];
    nameDelimeter;
    valueDelimeter;

    initOptions ({type, advOptions, formatOptions}) {
        this.type = type;
        this.advOptions = advOptions;
        this.formatOptions = formatOptions;
    }

    initPages() {
        for (let page of this.advOptions.asc_getCodePages()) {
            this.pages.push(page.asc_getCodePage());
            this.pagesName.push(page.asc_getCodePageName());
        }
    }

    initNamesDelimeter(names) {
        this.namesDelimeter = names;
    }

    setMode(value) {
        this.mode = value;
    }

    changeEncoding(value) {
        this.nameEncoding = this.pagesName[this.pages.indexOf(value)];
        this.valueEncoding = value;
    }

    changeDelimeter(value) {
        this.nameDelimeter = this.namesDelimeter[this.valuesDelimeter.indexOf(value)];
        this.valueDelimeter = value;
    }
}
