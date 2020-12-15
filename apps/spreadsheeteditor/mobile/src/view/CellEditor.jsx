
import React, { useState } from 'react';
import { Input, View, Button, Link } from 'framework7-react';

const viewStyle = {
    height: 30
};

const contentStyle = {
    flexGrow: 1
};

const CellEditorView = props => {
    const [expanded, setExpanded] = useState(false);

    const expandClick = e => {
        setExpanded(!expanded);
    };

    return <View id="idx-celleditor" style={viewStyle} className={expanded?'expanded':'collapsed'}>
                <div id="box-cell-name" className="ce-group">
                    F(x)
                </div>
                <div className="ce-group" style={contentStyle}>
                    <textarea id="ce-cell-content" spellCheck="false"></textarea>
                </div>
                <div className="ce-group">
                    <Link icon="caret" onClick={expandClick}></Link>
                </div>
            </View>;
};

export default CellEditorView;
