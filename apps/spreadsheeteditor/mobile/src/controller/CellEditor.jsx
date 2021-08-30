
import React, { useEffect, useState } from 'react';
import CellEditorView from '../view/CellEditor';
import { f7 } from 'framework7-react';

const CellEditor = props => {
    useEffect(() => {
        Common.Notifications.on('engineCreated', api => {
            api.asc_registerCallback('asc_onSelectionNameChanged', onApiCellSelection.bind(this));
            api.asc_registerCallback('asc_onSelectionChanged', onApiSelectionChanged.bind(this));
            api.asc_registerCallback('asc_onFormulaCompleteMenu', onFormulaCompleteMenu.bind(this));
        });
    }, []);

    const [cellName, setCellName] = useState('');
    const [stateCoauth, setCoauthDisabled] = useState(null);
    const [stateFuncArr, setFuncArr] = useState('');

    const onApiCellSelection = info => {
        setCellName(typeof(info)=='string' ? info : info.asc_getName());
    };

    const onApiSelectionChanged = info => {
        setCoauthDisabled(info.asc_getLocked() === true || info.asc_getLockedTable() === true || info.asc_getLockedPivotTable()===true);
    }

    const onFormulaCompleteMenu = funcArr => setFuncArr(funcArr);

    const insertFormula = (name, type) => {
        const api = Common.EditorApi.get();
        api.asc_insertInCell(name, type, false);
    }
    
    return (
        <CellEditorView 
            cellName={cellName}
            stateCoauth={stateCoauth}
            onClickToOpenAddOptions={props.onClickToOpenAddOptions} 
            funcArr={stateFuncArr}
            insertFormula={insertFormula}
        />
    )
};

export default CellEditor;