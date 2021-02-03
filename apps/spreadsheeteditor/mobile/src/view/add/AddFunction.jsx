import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";
import { useTranslation } from 'react-i18next';
import {List, ListItem, Page, Navbar, Icon, ListButton, ListInput, Segmented, Button} from 'framework7-react';

const AddFunction = props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const store = props.storeFunctions;
    const functions = store.functions;
    const quickFunctions = [
        {caption: 'SUM',   type: 'SUM'},
        {caption: 'MIN',   type: 'MIN'},
        {caption: 'MAX',   type: 'MAX'},
        {caption: 'COUNT', type: 'COUNT'}
    ];
    if (functions) {
        quickFunctions.forEach((quickFunction) => {
            quickFunction.caption = functions[quickFunction.type].caption;
        });
    }
    let name = '';
    const descriptions = ['DateAndTime', 'Engineering', 'Financial', 'Information', 'Logical', 'LookupAndReference', 'Mathematic', 'Statistical', 'TextAndData' ];
    const groups = [];
    for (let i = 0; i < descriptions.length; i++) {
        name = descriptions[i];
        groups[name] = _t['sCat' + name] || name;
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
                            <div slot='after'><Icon icon='icon-info'/></div>
                        </ListItem>
                    )
                })}
            </List>
        </Fragment>
    )
};

export default inject("storeFunctions")(observer(AddFunction));