
import React, { useEffect, useState } from 'react';
import CellEditorView from '../view/CellEditor';
import { f7 } from 'framework7-react';
import { Device } from '../../../../common/mobile/utils/device';

const CellEditor = props => {
    useEffect(() => {
        Common.Notifications.on('engineCreated', api => {
            api.asc_registerCallback('asc_onSelectionNameChanged', onApiCellSelection.bind(this));
            api.asc_registerCallback('asc_onSelectionChanged', onApiSelectionChanged.bind(this));
            api.asc_registerCallback('asc_onFormulaCompleteMenu', onFormulaCompleteMenu.bind(this));
        });
    }, []);

    const [cellName, setCellName] = useState('');
    const [stateFunctions, setFunctionshDisabled] = useState(null);
    const [stateFuncArr, setFuncArr] = useState('');

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

    const onFormulaCompleteMenu = funcArr => {
        setFuncArr(funcArr);

        if(funcArr) {
            f7.popover.open('#idx-functions-list', '#idx-list-target');
        } else {
            f7.popover.close('#idx-functions-list');
        }
    }

    const insertFormula = (name, type) => {
        const api = Common.EditorApi.get();
        api.asc_insertInCell(name, type, false);
    }
    
    return (
        <CellEditorView 
            cellName={cellName}
            stateFunctions={stateFunctions}
            onClickToOpenAddOptions={props.onClickToOpenAddOptions} 
            funcArr={stateFuncArr}
            insertFormula={insertFormula}
        />
    )
};

export default CellEditor;