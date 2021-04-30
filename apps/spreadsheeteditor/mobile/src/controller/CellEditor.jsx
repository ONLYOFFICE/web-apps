
import React, { useEffect, useState } from 'react';
import CellEditorView from '../view/CellEditor';

const CellEditor = props => {
    useEffect(() => {
        Common.Notifications.on('engineCreated', api => {
            api.asc_registerCallback('asc_onSelectionNameChanged', onApiCellSelection.bind(this));
        });
    }, []);

    const [cellName, setCellName] = useState('');

    const onApiCellSelection = info => {
        setCellName(typeof(info)=='string' ? info : info.asc_getName());
    };

    return <CellEditorView cellName={cellName}
                           onClickToOpenAddOptions={props.onClickToOpenAddOptions}/>
};

export default CellEditor;