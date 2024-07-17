import React, { Fragment, useEffect, useMemo } from 'react';
import { observer, inject } from "mobx-react";
import { useTranslation } from 'react-i18next';
import { List, ListItem, Page, Navbar, Icon, BlockTitle, f7 } from 'framework7-react';

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
                                <Icon icon='icon-info'/>
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
                                <Icon icon='icon-info'/>
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