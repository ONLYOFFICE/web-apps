
import React, { Fragment, useState } from 'react';
import { Input, View, Button, Link, Popover, ListItem, List, Icon, f7, Page, Navbar, NavRight } from 'framework7-react';
import {observer, inject} from "mobx-react";
import { __interactionsRef } from 'scheduler/tracing';
import { Device } from '../../../../common/mobile/utils/device';
import { useTranslation } from 'react-i18next';

const viewStyle = {
    height: 30
};

const contentStyle = {
    flexGrow: 1
};

const FunctionInfo = props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const functionObj = props.functionObj;
    const functionInfo = props.functionInfo;

    return (
        <Page className='page-function-info'>
            <Navbar title={functionInfo.caption} backLink={_t.textBack}>
                <NavRight>
                    <Link text={t('View.Add.textInsert')} onClick={() => props.insertFormula(functionObj.name, functionObj.type)}></Link>
                </NavRight>
            </Navbar>
            <div className='function-info'>
                <h3>{`${functionInfo.caption} ${functionInfo.args}`}</h3>
                <p>{functionInfo.descr}</p>
            </div>
        </Page>
    )
}

const FunctionsList = props => {
    const { t } = useTranslation();
    const isPhone = Device.isPhone;
    const functions = props.functions;
    const funcArr = props.funcArr;

    return (
        <div className={isPhone ? 'functions-list functions-list__mobile' : 'functions-list'}>
            <List>
                {funcArr.map((elem, index) => {
                    return (
                        <ListItem key={index} title={elem.name} className="no-indicator" onClick={() => props.insertFormula(elem.name, elem.type)}>
                            <div slot='after'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    let functionInfo = functions[elem.name];
    
                                    if(functionInfo) {    
                                        if(isPhone) {                                      
                                            f7.dialog.create({
                                                title: functionInfo.caption,
                                                content: `<h3>${functionInfo.caption} ${functionInfo.args}</h3><p>${functionInfo.descr}</p>`,
                                                buttons: [
                                                    {text: t('View.Add.textCancel')},
                                                    {
                                                        text: t('View.Add.textInsert'),
                                                        onClick: () => props.insertFormula(elem.name, elem.type)
                                                    }
                                                ]
                                            }).open();
                                        } else {
                                            f7.views.current.router.navigate('/function-info/', {props: {functionInfo, functionObj: elem, insertFormula: props.insertFormula}});
                                        }
                                    }
                                }}>
                                <Icon icon='icon-info'/>
                            </div>
                        </ListItem>
                    )
                })}
            </List>
        </div>
    )
}



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

    return (
        <>
            <View id="idx-celleditor" style={viewStyle} routes={routes} className={expanded ? 'cell-editor expanded' : 'cell-editor collapsed'}>
                <div id="box-cell-name" className="ce-group">
                    <span id="idx-cell-name">{props.cellName}</span>
                    <a href="#" id="idx-btn-function" className='link icon-only' disabled={(!isEdit && true) || props.stateCoauth} onClick={() => {props.onClickToOpenAddOptions('function', '#idx-btn-function');}}>
                        <i className="icon icon-function" />
                    </a>
                </div>
                <div className="ce-group group--content" style={contentStyle}>
                    <div id="idx-list-target" className="target-function-list"></div>
                    <textarea id="idx-cell-content" spellCheck="false" />
                </div>
                <div className="ce-group">
                    <Link icon="caret" onClick={expandClick} />
                </div>
                {funcArr && funcArr.length ?
                    isPhone &&
                        <FunctionsList 
                            functions={functions} 
                            funcArr={funcArr} 
                            insertFormula={props.insertFormula} 
                        />
                : null}
            </View>
            {!isPhone &&
                <Popover 
                    id="idx-functions-list" 
                    className="popover__titled popover__functions" 
                    closeByBackdropClick={false} 
                    backdrop={false} 
                    closeByOutsideClick={true}
                >
                    {funcArr && funcArr.length ?
                        <View style={{height: '175px'}} routes={routes}>
                            <Page pageContent={false}>
                                <Navbar className="navbar-hidden" />
                                <FunctionsList 
                                    functions={functions}
                                    funcArr={funcArr} 
                                    insertFormula={props.insertFormula}
                                />
                            </Page>
                        </View>
                    : null}
                </Popover>
            }
        </>
    );
};

const routes = [
    {
        path: '/function-info/',
        component: FunctionInfo
    }
];


export default inject("storeAppOptions", "storeFunctions")(observer(CellEditorView));
