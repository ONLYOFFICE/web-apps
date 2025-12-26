import React, { useEffect, useState } from 'react';
import CellEditorView from '../view/CellEditor';
import { f7 } from 'framework7-react';
import { Device } from '../../../../common/mobile/utils/device';
import { useTranslation } from 'react-i18next';
import {observer, inject} from "mobx-react";

const CellEditor = inject("storeFunctions")(observer(props => {
    useEffect(() => {
        Common.Notifications.on('engineCreated', api => {
            api.asc_registerCallback('asc_onSelectionNameChanged', onApiCellSelection.bind(this));
            api.asc_registerCallback('asc_onSelectionChanged', onApiSelectionChanged.bind(this));
            api.asc_registerCallback('asc_onFormulaCompleteMenu', onApiFormulaCompleteMenu.bind(this));
            api.asc_registerCallback('asc_onFormulaInfo', onFormulaInfo.bind(this));
        });
    }, []);

    const { t } = useTranslation();
    const [cellName, setCellName] = useState('');
    const [stateFunctions, setFunctionshDisabled] = useState(null);
    const [stateFuncArr, setFuncArr] = useState('');
    const [stateHintArr, setHintArr] = useState('');
    const [funcHint, setFuncHint] = useState('');

    const onApiCellSelection = info => {
        setCellName(typeof(info)=='string' ? info : info.asc_getName());
    };

    const onApiSelectionChanged = info => {
        let seltype = info.asc_getSelectionType(),
            coauth_disable = info.asc_getLocked() === true || info.asc_getLockedTable() === true || info.asc_getLockedPivotTable()===true;

        let is_chart_text   = seltype == Asc.c_oAscSelectionType.RangeChartText,
            is_chart        = seltype == Asc.c_oAscSelectionType.RangeChart,
            is_shape_text   = seltype == Asc.c_oAscSelectionType.RangeShapeText,
            is_shape        = seltype == Asc.c_oAscSelectionType.RangeShape,
            is_image        = seltype == Asc.c_oAscSelectionType.RangeImage || seltype == Asc.c_oAscSelectionType.RangeSlicer,
            is_mode_2       = is_shape_text || is_shape || is_chart_text || is_chart;

        setFunctionshDisabled(is_image || is_mode_2 || coauth_disable);
    }

    const onApiFormulaCompleteMenu = (funcarr) => {
        setTimeout(function() {
            onFormulaCompleteMenu(funcarr);
        }, 0);
    };

    const onFormulaInfo = (name, shiftpos, funcInfo) => {
        if (!name) {
            setFuncHint(null);
            return;
        }
        
        const api = Common.EditorApi.get(),
            storeFunctions = props.storeFunctions,
            functions = storeFunctions.functions,
            origName = api.asc_getFormulaNameByLocale(name),
            separator = api.asc_getFunctionArgumentSeparator(),
            argstype = funcInfo ? funcInfo.asc_getArgumentsType() : null,
            activeArg = funcInfo ? funcInfo.asc_getActiveArgPos() : null,
            activeArgsCount = funcInfo ? funcInfo.asc_getActiveArgsCount() : null;
        let funcName = api.asc_getFormulaLocaleName(name);

        const parseArgsDesc = (args) => {
            if (!args) return [];
            
            if (args.charAt(0)=='(')
                args = args.substring(1);
            if (args.charAt(args.length-1)==')')
                args = args.substring(0, args.length-1);
                
            var arr = args.split(separator);
            arr.forEach((item, index) => {
                let str = item.trim();
                if (str.charAt(0)=='[')
                    str = str.substring(1);
                if (str.charAt(str.length-1)==']')
                    str = str.substring(0, str.length-1);
                arr[index] = str.trim();
            });
            return arr;
        };

        const fillRepeatedNames = (argsNames, repeatedArg) => {
            var repeatedIdx = 1;
            if (argsNames.length>=1) {
                if (repeatedArg && repeatedArg.length>0 && argsNames[argsNames.length-1]==='...') {
                    var req = argsNames.length-1 - repeatedArg.length;
                    for (var i=0; i<repeatedArg.length; i++) {
                        var str = argsNames[argsNames.length-2-i],
                            ch = str.charAt(str.length-1);
                        if ('123456789'.indexOf(ch)>-1) {
                            repeatedIdx = parseInt(ch);
                            argsNames[argsNames.length-2-i] = str.substring(0, str.length-1);
                        }
                    }
                }
            }
            return repeatedIdx;
        };

        const getArgumentName = function(argcount, argsNames, repeatedArg, minArgCount, maxArgCount, repeatedIdx) {
            var name = '',
                namesLen = argsNames.length,
                idxInRepeatedArr = -1,
                textArgument = t('View.Edit.textArgument') || 'arg';
            
            if ((!repeatedArg || repeatedArg.length<1) && argcount<namesLen && argsNames[argcount]!=='...') {
                name = argsNames[argcount];
                (name==='') && (name = textArgument + (maxArgCount>1 ? (' ' + (argcount+1)) : ''));
            } else if (repeatedArg && repeatedArg.length>0 && argsNames[namesLen-1]==='...') {
                var repeatedLen = repeatedArg.length;
                var req = namesLen-1 - repeatedLen;
                if (argcount<req)
                    name = argsNames[argcount];
                else {
                    var idx = repeatedLen - (argcount - req)%repeatedLen,
                        num = Math.floor((argcount - req)/repeatedLen) + repeatedIdx;
                    idxInRepeatedArr = repeatedLen - idx;
                    name = argsNames[namesLen-1-idx] + num;
                }
            } else
                name = textArgument + (maxArgCount>1 ? (' ' + (argcount+1)) : '');
            
            if (maxArgCount>0 && argcount>=minArgCount)
                name = (idxInRepeatedArr<=0 ? '[' : '') + name + (idxInRepeatedArr<0 || (repeatedArg && idxInRepeatedArr===repeatedArg.length-1) ? ']' : '');
            
            return name;
        };

        if (argstype && activeArgsCount) {
            let args = '';

            if (functions && functions[origName] && functions[origName].args) {
                args = functions[origName].args.replace(/[,;]/g, separator);
            } else {
                const custom = api.asc_getCustomFunctionInfo(origName),
                    arr_args = custom ? custom.asc_getArg() || [] : [];
                args = '(' + arr_args.map(item => 
                    item.asc_getIsOptional() ? '[' + item.asc_getName() + ']' : item.asc_getName()
                ).join(separator + ' ') + ')';
            }

            const argsNames = parseArgsDesc(args),
                minArgCount = funcInfo.asc_getArgumentMin(),
                maxArgCount = funcInfo.asc_getArgumentMax();
            let repeatedArg = undefined,
                repeatedIdx = 1,
                arr = [];

            const fillArgs = (types) => {
                let argcount = arr.length;
                for (let j = 0; j < types.length; j++) {
                    const str = getArgumentName(argcount, argsNames, repeatedArg, minArgCount, maxArgCount, repeatedIdx);
                    const isActive = activeArg && (argcount === activeArg - 1);
                    arr.push({ name: str, isActive });
                    argcount++;
                }
            };

            for (let i = 0; i < argstype.length; i++) {
                const type = argstype[i];
                let types = [];

                if (typeof type === 'object') {
                    repeatedArg = type;
                    repeatedIdx = fillRepeatedNames(argsNames, repeatedArg);
                    types = type;
                } else {
                    types.push(type);
                }

                fillArgs(types);
            }

            if (arr.length <= activeArgsCount && repeatedArg) {
                while (arr.length <= activeArgsCount) {
                    fillArgs(repeatedArg);
                }
            }

            if (repeatedArg) {
                arr.push({ name: '...', isActive: false });
            }

            setFuncHint({
                name: funcName,
                nameIsActive: !activeArg,
                args: arr,
                separator: separator
            });
        } else {
            let hint = '';
            if (functions && functions[origName] && functions[origName].args) {
                hint = funcName + functions[origName].args;
                hint = hint.replace(/[,;]/g, separator);
            } else {
                const custom = api.asc_getCustomFunctionInfo(origName),
                    arr_args = custom ? custom.asc_getArg() || [] : [];
                hint = funcName + '(' + arr_args.map(item => 
                    item.asc_getIsOptional() ? '[' + item.asc_getName() + ']' : item.asc_getName()
                ).join(separator + ' ') + ')';
            }

            const argsStr = hint.substring(hint.indexOf('(')),
                argsNames = parseArgsDesc(argsStr),
                args = argsNames.map(argName => ({ name: argName, isActive: false }));

            setFuncHint({
                name: funcName,
                nameIsActive: false,
                args: args,
                separator: separator
            });
        }
    };

    const onFormulaCompleteMenu = async funcArr => {
        const api = Common.EditorApi.get();
        const storeFunctions = props.storeFunctions;
        const functions = storeFunctions.functions;

        if(funcArr) {
            funcArr.sort(function (a, b) {
                let atype = a.asc_getType(),
                    btype = b.asc_getType();
                if (atype===btype && (atype === Asc.c_oAscPopUpSelectorType.TableColumnName))
                    return 0;
                if (atype === Asc.c_oAscPopUpSelectorType.TableThisRow) return -1;
                if (btype === Asc.c_oAscPopUpSelectorType.TableThisRow) return 1;
                if ((atype === Asc.c_oAscPopUpSelectorType.TableColumnName || btype === Asc.c_oAscPopUpSelectorType.TableColumnName) && atype !== btype)
                    return atype === Asc.c_oAscPopUpSelectorType.TableColumnName ? -1 : 1;
                let aname = a.asc_getName(true).toLocaleUpperCase(),
                    bname = b.asc_getName(true).toLocaleUpperCase();
                if (aname < bname) return -1;
                if (aname > bname) return 1;
    
                return 0;
            });
    
            let hintArr = funcArr.map(item => {
                let type = item.asc_getType(),
                    name = item.asc_getName(true),
                    origName = api.asc_getFormulaNameByLocale(name),
                    args = '',
                    caption = name,
                    descr = '';

                switch (type) {
                    case Asc.c_oAscPopUpSelectorType.Func:
                        if (functions && functions[origName] && functions[origName].descr)
                            descr = functions[origName].descr;
                        else {
                            let custom = api.asc_getCustomFunctionInfo(origName);
                            descr = custom ? custom.asc_getDescription() || '' : '';
                        }
                        if (functions && functions[origName] && functions[origName].args)
                            args = functions[origName].args;
                        else {
                            let custom = api.asc_getCustomFunctionInfo(origName);
                            if (custom) {
                                let arr_args = custom.asc_getArg() || [];
                                args = '(' + arr_args.map(function (item) { return item.asc_getIsOptional() ? '[' + item.asc_getName() + ']' : item.asc_getName(); }).join(api.asc_getFunctionArgumentSeparator() + ' ') + ')';
                            }
                        }
                        break;
                    case Asc.c_oAscPopUpSelectorType.TableThisRow:
                        descr = t('View.Add.textThisRowHint');
                        break;
                    case Asc.c_oAscPopUpSelectorType.TableAll:
                        descr = t('View.Add.textAllTableHint');
                        break;
                    case Asc.c_oAscPopUpSelectorType.TableData:
                        descr = t('View.Add.textDataTableHint');
                        break;
                    case Asc.c_oAscPopUpSelectorType.TableHeaders:
                        descr = t('View.Add.textHeadersTableHint');
                        break;
                    case Asc.c_oAscPopUpSelectorType.TableTotals:
                        descr = t('View.Add.textTotalsTableHint');
                        break;
                }

                return {name, type, descr, caption, args};
            });

            setFuncArr(funcArr);
            setHintArr(hintArr);

            await f7.popover.open('#idx-functions-list', '#idx-list-target');
        } else {
            await f7.popover.close('#idx-functions-list');

            setFuncArr('');
            setHintArr('');
        }
    }

    const insertFormula = (name, type) => {
        const api = Common.EditorApi.get();
        api.asc_insertInCell(name, type, false);
        f7.popover.close('#idx-functions-list');
    }
    
    return (
        <CellEditorView 
            cellName={cellName}
            stateFunctions={stateFunctions}
            onClickToOpenAddOptions={props.onClickToOpenAddOptions} 
            funcArr={stateFuncArr}
            hintArr={stateHintArr}
            insertFormula={insertFormula}
            funcHint={funcHint} 
        />
    )
}));

export default CellEditor;