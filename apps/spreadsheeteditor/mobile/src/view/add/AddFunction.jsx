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

import React, { Fragment, useEffect, useMemo } from 'react';
import { observer, inject } from "mobx-react";
import { useTranslation } from 'react-i18next';
import { List, ListItem, Page, Navbar, Icon, BlockTitle, f7 } from 'framework7-react';
import SvgIcon from '@common/lib/component/SvgIcon';
import IconInfo from '@common-icons/icon-info.svg';

const PageInfo = props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const f = props.functionInfo;
    return(
        <Page className='page-function-info'>
            <Navbar title={f.caption} backLink={_t.textBack}/>
            <div className='function-info'>
                <h3>{`${f.caption} ${f.args}`}</h3>
                <p>{f.descr}</p>
            </div>
        </Page>
    )
};

const PageGroup = ({ name, type, functions, onInsertFunction, f7router }) => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const items = [];

    for (let k in functions) {
        if (functions[k].group == type) {
            items.push(functions[k]);
        }     
    }

    items.sort(function(a, b) {
        return (a.caption.toLowerCase() > b.caption.toLowerCase()) ? 1 : -1;
    });
   
    return (
        <Page>
            <Navbar title={name} backLink={_t.textBack}/>
            <List>
                {items.map((f, index) => {
                    return(
                        <ListItem key={`f-${index}`}
                                  link={'#'}
                                  title={f.caption}
                                  className='no-indicator'
                                  onClick={() => {onInsertFunction(f.type);}}
                        >
                            <div slot='after'
                                 onClick={(event) => {
                                     f7router.navigate('/add-function-info/', {
                                         props: {
                                             functionInfo: f
                                         }
                                     });
                                     event.stopPropagation();
                                 }}>
                                <SvgIcon symbolId={IconInfo.id} className={'icon icon-svg'} />
                            </div>
                        </ListItem>
                    )
                })}
            </List>
        </Page>
    )
};

const AddFunction = props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const store = props.storeFunctions;
    const functions = store.functions;
    const isHaveCustomFunctions = useMemo(() => Object.values(functions).some(func => func.group === 'Custom'), [functions]);
    const descriptions = useMemo(() => {
        const initialArrDesc = [
            'DateAndTime', 
            'Engineering',
            'Database',
            'Financial', 
            'Information', 
            'Logical', 
            'LookupAndReference', 
            'Mathematic', 
            'Statistical', 
            'TextAndData',
            isHaveCustomFunctions && 'Custom'
        ].filter(Boolean);
    
        return initialArrDesc;
    }, [isHaveCustomFunctions]);

    const quickFunctions = [
        {caption: 'SUM',   type: 'SUM'},
        {caption: 'MIN',   type: 'MIN'},
        {caption: 'MAX',   type: 'MAX'},
        {caption: 'COUNT', type: 'COUNT'}
    ];

    const groups = useMemo(() => descriptions.map((name) => ({
        type: name,
        name: _t['sCat' + name] || name,
    })), []);

    useEffect(() => {
        if (Object.keys(functions).length) {
            quickFunctions.forEach((quickFunction) => {
                const f = functions[quickFunction.type];
                quickFunction.caption = f.caption;
                quickFunction.args = f.args;
                quickFunction.descr = f.descr;
            });
        }
    }, [functions])

    const onOptionClick = (page, props) => {
        f7.views.current.router.navigate(page, props);
    }

    return (
        <Fragment>
            <List>
                {quickFunctions.map((f, index) => {
                    return (
                        <ListItem key={`f-${index}`}
                                  title={f.caption}
                                  className='no-indicator'
                                  link='#'
                                  onClick={() => {props.onInsertFunction(f.type);}}
                        >
                            <div slot='after' onClick={e => {
                                    onOptionClick('/add-function-info/', {
                                        props: {
                                            functionInfo: f
                                        }
                                    });
                                    e.stopPropagation();
                                }}>
                                <SvgIcon symbolId={IconInfo.id} className={'icon icon-svg'} />
                            </div>
                        </ListItem>
                    )
                })}
            </List>
            <BlockTitle>{_t.textGroups}</BlockTitle>
            <List>
                {groups.map((group, index) => {
                    return(
                        <ListItem key={`gr-${index}`}
                                  link={'/add-function-group/'}
                                  title={group.name}
                                  routeProps={{
                                      name: group.name,
                                      type: group.type,
                                      functions: functions,
                                      onInsertFunction: props.onInsertFunction
                                  }}
                        />
                    )
                })}
            </List>
        </Fragment>
    )
};

const AddFunctionContainer = inject("storeFunctions")(observer(AddFunction));

export {
    AddFunctionContainer as AddFunction,
    PageGroup as PageFunctionGroup,
    PageInfo as PageFunctionInfo
};
