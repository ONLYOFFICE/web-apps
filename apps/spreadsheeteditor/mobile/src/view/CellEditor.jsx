
import React, { Fragment, useState, useEffect } from 'react';
import { Input, View, Button, Link, Popover, ListItem, List, Icon, f7, Page, Navbar, NavRight } from 'framework7-react';
import {observer, inject} from "mobx-react";
// import { __interactionsRef } from 'scheduler/tracing';
import { Device } from '../../../../common/mobile/utils/device';
import { useTranslation } from 'react-i18next';
import SvgIcon from '@common/lib/component/SvgIcon';
import IconFunction from '@icons/icon-function.svg';
import IconInfo from '@common-icons/icon-info.svg';

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
    const storeWorksheets = props.storeWorksheets;
    const wsLock = storeWorksheets.wsLock;
    const {functionsDisable} = props.storeFocusObjects;
    const functions = storeFunctions.functions;
    const isEdit = storeAppOptions.isEdit;
    const funcArr = props.funcArr;
    const hintArr = props.hintArr;

    const expandClick = e => {
        setExpanded(!expanded);
    };

    return (
        <>
            <View id="idx-celleditor" style={viewStyle} routes={routes} className={expanded ? 'cell-editor expanded' : 'cell-editor collapsed'}>
                <div id="box-cell-name" className="ce-group">
                    <span id="idx-cell-name">{props.cellName}</span>
                    <a href="#" id="idx-btn-function" className='link icon-only' disabled={(!isEdit && true) || props.stateFunctions || functionsDisable || wsLock} onClick={() => {props.onClickToOpenAddOptions('function', '#idx-btn-function');}}>
                        <SvgIcon symbolId={IconFunction.id} className={'icon icon-svg icon_function'} />
                    </a>
                </div>
                <div className="ce-group group--content" style={contentStyle}>
                    <div id="idx-list-target" className="target-function-list"></div>
                    <textarea id="idx-cell-content" spellCheck="false" />
                </div>
                <div className="ce-group">
                    <Link icon="caret" onClick={expandClick} /> 
                </div>
            </View>
            {
                <Popover 
                    id="idx-functions-list" 
                    className="popover__titled popover__functions" 
                    closeByBackdropClick={false} 
                    backdrop={false} 
                    closeByOutsideClick={true}
                >
                    {funcArr && funcArr.length ?
                        <View style={{height: '200px'}} routes={routes}>
                            <Page pageContent={false}>
                                <Navbar className="navbar-hidden" />
                                <FunctionsList
                                    functions={functions}
                                    funcArr={funcArr}
                                    hintArr={hintArr}
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

const FunctionsList = props => {
    const isPhone = Device.isPhone;
    const functions = props.functions;
    const funcArr = props.funcArr;
    const hintArr = props.hintArr;
    const functionsList = document.querySelector('#functions-list');

    useEffect(() => {
        if(functionsList) {
            const height = functionsList.offsetHeight + 'px';
            functionsList.closest('.view').style.height = height;
        }
    }, [funcArr]);

    return (
        <div id="functions-list" className={isPhone ? 'functions-list functions-list__mobile' : 'functions-list'}>
            <List>
                {funcArr && funcArr.length && funcArr.map((elem, index) => {
                    return (
                        <ListItem key={index} title={elem.name} className="no-indicator" onClick={() => props.insertFormula(elem.name, elem.type)}>
                            {(functions[elem.name] || hintArr[index]?.descr) &&
                                <div slot='after'
                                     onClick={(e) => {
                                         e.stopPropagation();
                                         let functionInfo = functions[elem.name] || hintArr[index];

                                         if(functionInfo) {
                                             f7.views.current.router.navigate('/function-info/', {props: {functionInfo, functionObj: elem, insertFormula: props.insertFormula}});
                                         }
                                     }}>
                                    <SvgIcon symbolId={IconInfo.id} className={'icon icon-svg'} />
                                </div>
                            }
                        </ListItem>
                    )
                })}
            </List>
        </div>
    )
}

const FunctionInfo = props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const functionObj = props.functionObj;
    const functionInfo = props.functionInfo;
    const functionsList = document.querySelector('#functions-list');

    useEffect(() => {
        if(functionsList) {
            const height = functionsList.offsetHeight + 'px';
            functionsList.closest('.view').style.height = '200px';

            return () => {
                functionsList.closest('.view').style.height = height;
            }
        }
    }, [functionsList]);

    return (
        <Page className='page-function-info'>
            <Navbar title={functionInfo.caption} backLink={_t.textBack} backLinkUrl='/functions-list/'>
                <NavRight>
                    <Link text={t('View.Add.textInsert')} onClick={() => props.insertFormula(functionObj.name, functionObj.type)}></Link>
                </NavRight>
            </Navbar>
            <div className='function-info'>
                <h3>{functionInfo.caption && functionInfo.args ? `${functionInfo.caption} ${functionInfo.args}` : functionInfo.name}</h3>
                <p>{functionInfo.descr}</p>
            </div>
        </Page>
    )
}

const routes = [
    {
        path: '/function-info/',
        component: FunctionInfo
    },
    {
        path: '/functions-list/',
        component: FunctionsList
    }
];


export default inject("storeAppOptions", "storeFunctions", "storeFocusObjects", "storeWorksheets")(observer(CellEditorView));
