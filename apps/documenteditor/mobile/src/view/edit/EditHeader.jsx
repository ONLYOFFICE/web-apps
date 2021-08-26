import React, { Fragment, useState } from 'react';
import { observer, inject } from "mobx-react";
import { List, ListItem, Segmented, Button, Toggle, BlockTitle, Icon } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from "../../../../../common/mobile/utils/device";

const EditHeader = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const headerObject = props.storeFocusObjects.headerObject;
    const isDiffFirst = headerObject.get_DifferentFirst();
    const isDiffOdd = headerObject.get_DifferentEvenOdd();
    const linkToPrev = headerObject.get_LinkToPrevious();
    const boolLinkToPrev = !!linkToPrev;
    const startPageNumber = headerObject.get_StartPageNumber();
    let _startAt = 1;
    if (startPageNumber >= 0) {
        _startAt = startPageNumber;
    }
    return (
        <Fragment>
            <List>
                <ListItem title={_t.textDifferentFirstPage}>
                    <Toggle checked={isDiffFirst} onChange={() => {props.onDiffFirst(!isDiffFirst)}}/>
                </ListItem>
                <ListItem title={_t.textDifferentOddAndEvenPages}>
                    <Toggle checked={isDiffOdd} onChange={() => {props.onDiffOdd(!isDiffOdd)}}/>
                </ListItem>
                <ListItem title={_t.textLinkToPrevious} className={linkToPrev===null ? 'disabled' : ''}>
                    <Toggle checked={boolLinkToPrev} onChange={() => {props.onSameAs(!boolLinkToPrev)}}/>
                </ListItem>
            </List>
            <BlockTitle>{_t.textPageNumbering}</BlockTitle>
            <List>
                <ListItem title={_t.textContinueFromPreviousSection}>
                    <Toggle checked={startPageNumber<0} onChange={() => {props.onNumberingContinue(!(startPageNumber<0), _startAt)}}/>
                </ListItem>
                <ListItem title={_t.textStartAt} className={startPageNumber<0 ? 'disabled' : ''}>
                    {!isAndroid && <div slot='after-start'>{_startAt}</div>}
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='decrement item-link' onClick={() => {props.onStartAt(_startAt, true)}}>
                                {isAndroid ? <Icon icon="icon-expand-down"></Icon> : ' - '}
                            </Button>
                            {isAndroid && <label>{_startAt}</label>}
                            <Button outline className='increment item-link' onClick={() => {props.onStartAt(_startAt, false)}}>
                                {isAndroid ? <Icon icon="icon-expand-up"></Icon> : ' + '}
                            </Button>
                        </Segmented>
                    </div>
                </ListItem>
            </List>
        </Fragment>
    )
};

export default inject("storeFocusObjects")(observer(EditHeader));