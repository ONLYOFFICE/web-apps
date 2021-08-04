
import React, { useEffect, useState } from 'react';
import CellEditorView from '../view/CellEditor';

const CellEditor = props => {
    useEffect(() => {
        Common.Notifications.on('engineCreated', api => {
            api.asc_registerCallback('asc_onSelectionNameChanged', onApiCellSelection.bind(this));
            api.asc_registerCallback('asc_onSelectionChanged', onApiSelectionChanged.bind(this));
        });
    }, []);

    const [cellName, setCellName] = useState('');
    const [stateCoauth, setCoauthDisabled] = useState(null);

    const onApiCellSelection = info => {
        setCellName(typeof(info)=='string' ? info : info.asc_getName());
    };

    const onApiSelectionChanged = info => {
        setCoauthDisabled(info.asc_getLocked() === true || info.asc_getLockedTable() === true || info.asc_getLockedPivotTable()===true);
    }
    
    return <CellEditorView cellName={cellName}
                           stateCoauth = {stateCoauth}
                           onClickToOpenAddOptions={props.onClickToOpenAddOptions}/>
};

export default CellEditor;