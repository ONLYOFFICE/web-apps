/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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
    const argConstList = props.argConstList;

    const expandClick = e => {
        setExpanded(!expanded);
    };

    const FunctionHint = ({ funcHint }) => {
        if (!funcHint || !funcHint.args) return null;
        const separator = funcHint.separator;
        return (
            <div className="function-hint-card">
                <div className="name">
                    <span className={funcHint.nameIsActive ? 'contrast' : ''}>
                        {funcHint.name}
                    </span>
                    (
                    {funcHint.args.map((arg, i) => (
                        <span key={i} className={arg.isActive ? "contrast" : ""}>
                            {arg.name}
                            {i < funcHint.args.length - 1 ? `${separator} ` : ""}
                        </span>
                    ))}
                    )
                </div>
            </div>
        );
    };

    return (
        <>
            <View id="idx-celleditor" style={viewStyle} routes={routes} className={expanded ? 'cell-editor expanded' : 'cell-editor collapsed'}>
                <div id="box-cell-name" className="ce-group">
                    <span id="idx-cell-name">{props.cellName}</span>
                    {storeAppOptions.isDocReady && (
                        <a href="#" id="idx-btn-function" className='link icon-only'
                           disabled={(!isEdit && true) || props.stateFunctions || functionsDisable || wsLock}
                           onClick={() => {
                               props.onClickToOpenAddOptions('function', '#idx-btn-function');
                           }}>
                            <SvgIcon symbolId={IconFunction.id} className={'icon icon-svg icon_function'}/>
                        </a>)}
                </div>
                <div className="ce-group group--content" style={contentStyle}>
                    <div id="idx-list-target" className="target-function-list"></div>
                    <textarea id="idx-cell-content" spellCheck="false" />
                    <div className="formula-hints-overlay">
                        <FunctionHint funcHint={props.funcHint}/>
                        {argConstList && argConstList.length ?
                            <ArgConstList
                                argConstList={argConstList}
                                insertConstant={props.insertConstant}
                            />
                        : null}
                    </div>
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

const ArgConstList = props => {
    const argConstList = props.argConstList;
    return (
        <div className="arg-const-list">
            <List>
                {argConstList.map((item, index) => {
                    const value = item[0],
                          name  = item[1] || '',
                          caption = '(...) ' + value + (name ? ' - ' + name : '');
                    return (
                        <ListItem key={index} title={caption} className="no-indicator"
                            onClick={() => props.insertConstant(value)} />
                    );
                })}
            </List>
        </div>
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
