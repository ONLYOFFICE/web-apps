import React, { PureComponent } from 'react';
import {observer, inject} from "mobx-react";
import {List, ListItem, Page, Navbar, Icon, ListButton, ListInput, BlockTitle} from 'framework7-react';
import { useTranslation } from 'react-i18next';

const AddTableContents = props => {
    const { t } = useTranslation();
    const _t = t('Add', {returnObjects: true});

    return (
        <Page>
            <Navbar title={_t.textTableContents} backLink={_t.textBack}></Navbar>
            <BlockTitle>{_t.textWithPageNumbers}</BlockTitle>
            <div className="item-contents" id="toc1" onClick={() => props.onTableContents(0)}></div>
            <BlockTitle>{_t.textWithBlueLinks}</BlockTitle>
            <div className="item-contents" id="toc2" onClick={() => props.onTableContents(1)}></div>
        </Page>
    )      
};

export {AddTableContents}
