import { action, observable, makeObservable } from "mobx";

export class storePresentationInfo {
    constructor() {
      makeObservable(this, {
        dataDoc: observable,
        setDataDoc: action
      });
    }

    dataDoc;

    setDataDoc(obj) {
      this.dataDoc = obj;
    }
}