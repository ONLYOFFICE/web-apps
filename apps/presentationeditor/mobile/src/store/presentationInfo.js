import { action, observable } from "mobx";

export class storePresentationInfo {

  @observable dataDoc;

  @action setDataDoc(obj) {
    this.dataDoc = obj;
  }
}