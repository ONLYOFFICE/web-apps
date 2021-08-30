
import React, { useState } from 'react';
import { Input, View, Button, Link, Popover, ListItem, List } from 'framework7-react';
import {observer, inject} from "mobx-react";

const viewStyle = {
    height: 30
};

const contentStyle = {
    flexGrow: 1
};

const CellEditorView = props => {
    const [expanded, setExpanded] = useState(false);
    const storeAppOptions = props.storeAppOptions;
    const isEdit = storeAppOptions.isEdit;
    const funcArr = props.funcArr;

    const expandClick = e => {
        setExpanded(!expanded);
    };

    return <View id="idx-celleditor" style={viewStyle} className={expanded ? 'cell-editor expanded' : 'cell-editor collapsed'}>
                <div id="box-cell-name" className="ce-group">
                    <span id="idx-cell-name">{props.cellName}</span>
                    <a href="#" id="idx-btn-function" className='link icon-only' disabled={(!isEdit && true) || props.stateCoauth} onClick={() => {props.onClickToOpenAddOptions('function', '#idx-btn-function');}}>
                        <i className="icon icon-function" />
                    </a>
                </div>
                <div className="ce-group group--content" style={contentStyle}>
                    <textarea id="idx-cell-content" spellCheck="false" />
                </div>
                <div className="ce-group">
                    <Link icon="caret" onClick={expandClick} />
                </div>
                {funcArr && funcArr.length &&
                    <div id="idx-functions-list" className="functions-list">
                        <List>
                            {funcArr.map((elem, index) => {
                                return (
                                    <ListItem key={index} title={elem.name} onClick={() => props.insertFormula(elem.name, elem.type)}></ListItem>
                                )
                            })}
                        </List>
                    </div>
                }
            </View>;
};

export default inject("storeAppOptions")(observer(CellEditorView));
