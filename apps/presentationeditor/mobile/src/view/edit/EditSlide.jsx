import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";
import {Page, Navbar, List, ListItem, ListButton, Row, BlockTitle, Range, Toggle, Icon, View} from 'framework7-react';
import {f7} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';

const EditSlide = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    return (
        <Fragment>
            <List>
                <ListItem title={_t.textTheme} link="/theme/"></ListItem>
                <ListItem title={_t.textLayout} link="/layout/"></ListItem>
                <ListItem title={_t.textTransition} link="/transition/"></ListItem>
                <ListItem title={_t.textStyle} link="#"></ListItem>
            </List>
        </Fragment>
    )
};

export {EditSlide};