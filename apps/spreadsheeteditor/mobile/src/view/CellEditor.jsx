
import React, { useState } from 'react';
import { Input, View, Button, Link, Popover, ListItem, List, Icon, f7 } from 'framework7-react';
import {observer, inject} from "mobx-react";
// import {PageFunctionInfo} from "./add/AddFunction";
import { __interactionsRef } from 'scheduler/tracing';
import { Device } from '../../../../common/mobile/utils/device';

const viewStyle = {
    height: 30
};

const contentStyle = {
    flexGrow: 1
};

const CellEditorView = props => {
    const [expanded, setExpanded] = useState(false);
    const isPhone = Device.isPhone;
    const storeAppOptions = props.storeAppOptions;
    const storeFunctions = props.storeFunctions;
    const functions = storeFunctions.functions;
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
                    <div id="idx-functions-list" className="functions-list" style={{left: isPhone ? '0' : '132px', width: isPhone ? '100%' : '360px'}}>
                        <List>
                            {funcArr.map((elem, index) => {
                                return (
                                    <ListItem key={index} title={elem.name} className="no-indicator" onClick={() => props.insertFormula(elem.name, elem.type)}>
                                        <div slot='after'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                let functionInfo = functions[elem.name];
                
                                                if(functionInfo) {                                               
                                                    f7.dialog.create({
                                                        title: functionInfo.caption,
                                                        content: `<h3>${functionInfo.caption} ${functionInfo.args}</h3>
                                                        <p>${functionInfo.descr}</p>`,
                                                        buttons: [{text: 'Ok'}]
                                                    }).open();
                                                }
                                            }}>
                                            <Icon icon='icon-info'/>
                                        </div>
                                    </ListItem>
                                )
                            })}
                        </List>
                    </div>
                }
            </View>;
};

export default inject("storeAppOptions", "storeFunctions")(observer(CellEditorView));
