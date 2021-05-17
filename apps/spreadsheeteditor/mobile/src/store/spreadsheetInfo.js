import {action, observable, makeObservable} from 'mobx';

export class storeSpreadsheetInfo {
    constructor() {
        makeObservable(this, {
            dataDoc: observable,
            setDataDoc: action
        })
    }
    
    dataDoc;

    setDataDoc(obj) {
        this.dataDoc = obj;
    }
}