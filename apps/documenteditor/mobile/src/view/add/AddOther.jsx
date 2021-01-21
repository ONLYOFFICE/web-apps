import React, {useState} from 'react';
import {observer, inject} from "mobx-react";
import {List, ListItem, Page, Navbar, Icon, ListButton, ListInput, BlockTitle} from 'framework7-react';
import { useTranslation } from 'react-i18next';

const PageLink = props => {
    const { t } = useTranslation();
    const _t = t('Add', {returnObjects: true});

    let display = props.getDisplayLinkText();
    display = typeof display === 'string' ? display : '';

    const [stateLink, setLink] = useState('');
    const [stateDisplay, setDisplay] = useState(display);
    const [stateTip, setTip] = useState('');
    return (
        <Page>
            <Navbar title={_t.textAddLink} backLink={_t.textBack}></Navbar>
            <List inlineLabels className='inputs-list'>
                <ListInput
                    label={_t.textLink}
                    type="text"
                    placeholder={_t.textLink}
                    value={stateLink}
                    onChange={(event) => {setLink(event.target.value)}}
                ></ListInput>
                <ListInput
                    label={_t.textDisplay}
                    type="text"
                    placeholder={_t.textDisplay}
                    value={stateDisplay}
                    onChange={(event) => {setDisplay(event.target.value)}}
                ></ListInput>
                <ListInput
                    label={_t.textScreenTip}
                    type="text"
                    placeholder={_t.textScreenTip}
                    value={stateTip}
                    onChange={(event) => {setTip(event.target.value)}}
                ></ListInput>
            </List>
            <List>
                <ListButton className={'button-fill button-raised' + (stateLink.length < 1 ? ' disabled' : '')} title={_t.textInsert} onClick={() => {
                    props.onInsertLink(stateLink, stateDisplay, stateTip)
                }}></ListButton>
            </List>
        </Page>
    )
};

const PageNumber = props => {
    const { t } = useTranslation();
    const _t = t('Add', {returnObjects: true});
    return (
        <Page>
            <Navbar title={_t.textPosition} backLink={_t.textBack}/>
            <List>
                <ListItem title={_t.textLeftTop} link='#' className='no-indicator' onClick={()=>{props.onInsertPageNumber('lt')}}></ListItem>
                <ListItem title={_t.textCenterTop} link='#' className='no-indicator' onClick={()=>{props.onInsertPageNumber('ct')}}></ListItem>
                <ListItem title={_t.textRightTop} link='#' className='no-indicator' onClick={()=>{props.onInsertPageNumber('rt')}}></ListItem>
                <ListItem title={_t.textLeftBottom} link='#' className='no-indicator' onClick={()=>{props.onInsertPageNumber('lb')}}></ListItem>
                <ListItem title={_t.textCenterBottom} link='#' className='no-indicator' onClick={()=>{props.onInsertPageNumber('cb')}}></ListItem>
                <ListItem title={_t.textRightBottom} link='#' className='no-indicator' onClick={()=>{props.onInsertPageNumber('rb')}}></ListItem>
                <ListItem title={_t.textCurrentPosition} link='#' className='no-indicator' onClick={()=>{props.onInsertPageNumber('current')}}></ListItem>
            </List>
        </Page>
    )
};

const AddOther = props => {
    const { t } = useTranslation();
    const _t = t('Add', {returnObjects: true});
    return (
        <List>
            <ListItem title={_t.textComment}>
                <Icon slot="media" icon="icon-insert-comment"></Icon>
            </ListItem>
            <ListItem title={_t.textLink} link={'/add-link/'} routeProps={{
                onInsertLink: props.onInsertLink,
                getDisplayLinkText: props.getDisplayLinkText
            }}>
                <Icon slot="media" icon="icon-link"></Icon>
            </ListItem>
            <ListItem title={_t.textPageNumber} link={'/add-page-number/'} routeProps={{
                onInsertPageNumber: props.onInsertPageNumber
            }}>
                <Icon slot="media" icon="icon-pagenumber"></Icon>
            </ListItem>
            <ListItem title={_t.textBreak}>
                <Icon slot="media" icon="icon-sectionbreak"></Icon>
            </ListItem>
            <ListItem title={_t.textFootnote}>
                <Icon slot="media" icon="icon-footnote"></Icon>
            </ListItem>
        </List>
    )
};

export {AddOther,
        PageLink as PageAddLink,
        PageNumber as PageAddNumber};