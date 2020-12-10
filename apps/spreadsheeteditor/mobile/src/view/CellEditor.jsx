
import React from 'react';
import { Input, View } from 'framework7-react';

const CellEditorView = props => {
    return <View name="cellEditor">
                <Input type="textarea" inputId="ce-cell-content" />
            </View>;
};

export default CellEditorView;
