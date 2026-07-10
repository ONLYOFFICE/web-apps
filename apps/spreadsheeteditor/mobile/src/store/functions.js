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

import {action, observable, makeObservable} from 'mobx';

export class storeFunctions {
    constructor() {
        makeObservable(this, {
            initFunctions: action,
            functions: observable
        });
    }

    functions = {};

    initFunctions (groups, data, separator) {
        this.functions = this.getFunctions(groups, data, separator);
    }

    getFunctions (groups, data, separator) {
        const api = Common.EditorApi.get();
        const functions = {};

        for (let g in groups) {
            const group = groups[g];
            const groupname = group.asc_getGroupName();
            const funcarr = group.asc_getFormulasArray();

            for (let f in funcarr) {
                const func = funcarr[f];
                const funcName = func.asc_getName();
                const customFuncInfo = api.asc_getCustomFunctionInfo(funcName);
                let args = '';
                let descr = '';

                if (customFuncInfo) {
                    const arrArgs = customFuncInfo.asc_getArg() || [];
                    args = '(' + arrArgs.map(function (item) { 
                        return item.asc_getIsOptional() ? '[' + item.asc_getName() + ']' : item.asc_getName(); }).join(api.asc_getFunctionArgumentSeparator() + ' ') + ')';
                    descr = customFuncInfo.asc_getDescription();
                } else {
                    args = ((data && data[funcName]) ? data[funcName].a : '').replace(/[,;]/g, separator);
                    descr = (data && data[funcName]) ? data[funcName].d : '';
                }

                functions[funcName] = {
                    type: funcName,
                    group: groupname,
                    caption: func.asc_getLocaleName(),
                    args,
                    descr,
                };
            }
        }
        return functions;
    }
}
