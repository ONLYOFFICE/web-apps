import {action, observable, makeObservable} from "mobx";

export class storeDocumentInfo {
  constructor() {
    makeObservable(this, {
      infoObj: observable,
      isLoaded: observable,
      dataDoc: observable,
      switchIsLoaded: action,
      changeCount: action,
      setDataDoc: action,
      changeTitle: action,
      docInfo: observable,
      setDocInfo: action
    });
  }

  infoObj = {
    pageCount: 0,
    wordsCount: 0,
    paragraphCount: 0,
    symbolsCount: 0,
    symbolsWSCount: 0,
  };

  isLoaded = true;
  dataDoc;
  docInfo;

  setDocInfo(docInfo) {
    this.docInfo = docInfo;
  }

  switchIsLoaded(value) {
    this.isLoaded = value;
  }

  changeCount(obj) {
    if (obj) {
      if (obj.get_PageCount() > -1)
        this.infoObj.pageCount = obj.get_PageCount();
      if (obj.get_WordsCount() > -1)
        this.infoObj.wordsCount = obj.get_WordsCount();
      if (obj.get_ParagraphCount() > -1)
        this.infoObj.paragraphCount = obj.get_ParagraphCount();
      if (obj.get_SymbolsCount() > -1)
        this.infoObj.symbolsCount = obj.get_SymbolsCount();
      if (obj.get_SymbolsWSCount() > -1)
        this.infoObj.symbolsWSCount = obj.get_SymbolsWSCount();
    }
  }

  setDataDoc(obj) {
    this.dataDoc = obj;
  }

  changeTitle(title) {
    this.dataDoc.title = title;
  }
}
