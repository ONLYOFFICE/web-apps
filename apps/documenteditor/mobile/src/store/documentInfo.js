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
