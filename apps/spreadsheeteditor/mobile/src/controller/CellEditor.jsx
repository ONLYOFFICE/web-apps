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
        if (!funcInfo || !name) {
            setFuncHint([]);
            return;
        }

        const api = Common.EditorApi.get();
        const storeFunctions = props.storeFunctions;
        const functions = storeFunctions.functions;
        const activeArg = funcInfo.asc_getActiveArgPos();
        const activeArgsCount = funcInfo.asc_getActiveArgsCount();
        const argTypes = funcInfo.asc_getArgumentsType() || [];

        let args = [];
        let argsNames = [];

        const origName = api.asc_getFormulaNameByLocale(name);

        if (functions && functions[origName] && functions[origName].args) {
            let separator = api.asc_getFunctionArgumentSeparator();
            argsNames = functions[origName].args
                .replace(/[()]/g, '') 
                .split(separator)
                .map(a => a.trim());
        } else {
            const custom = api.asc_getCustomFunctionInfo(name);
            if (custom) {
                const arr_args = custom.asc_getArg() || [];
                argsNames = arr_args.map(a =>
                    a.asc_getIsOptional() ? `[${a.asc_getName()}]` : a.asc_getName()
                );
            } 
        }

        let repeatedArg;
        function fillArgs(types) {
            let argCount = args.length;
            for (let j = 0; j < types.length; j++) {
                let str = argsNames[argCount] || `arg${argCount + 1}`;
                const isActive = activeArg && argCount === activeArg - 1;
                args.push({ name: str, isActive });
                argCount++;
            }
        }

        argTypes.forEach(type => {
            if (typeof type === 'object') {
                repeatedArg = type;
                fillArgs(type);
            } else fillArgs([type]);
        });

        if (repeatedArg && args.length < activeArgsCount) {
            while (args.length < activeArgsCount) fillArgs(repeatedArg);
        }
        if (repeatedArg) args.push({ name: '...', isActive: false });

        setFuncHint({ name, args });
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