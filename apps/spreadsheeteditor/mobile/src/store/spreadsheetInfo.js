import {action, observable, computed} from 'mobx';

export class storeSpreadsheetInfo {
   
    @observable dataDoc;

    @action setDataDoc(obj) {
        this.dataDoc = obj;
    }
}