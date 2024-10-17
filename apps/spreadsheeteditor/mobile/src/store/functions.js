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
