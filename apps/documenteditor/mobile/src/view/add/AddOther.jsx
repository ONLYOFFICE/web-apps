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

const PageBreak = props => {
    const { t } = useTranslation();
    const _t = t('Add', {returnObjects: true});
    return (
        <Page>
            <Navbar title={_t.textBreak} backLink={_t.textBack}/>
            <List>
                <ListItem title={_t.textPageBreak} link='#' className='no-indicator' onClick={() => {
                    props.onPageBreak()
                }}>
                    <Icon slot="media" icon="icon-pagebreak"></Icon>
                </ListItem>
                <ListItem title={_t.textColumnBreak} link='#' className='no-indicator' onClick={() => {
                    props.onColumnBreak();
                }}>
                    <Icon slot="media" icon="icon-stringbreak"></Icon>
                </ListItem>
                <ListItem title={_t.textSectionBreak} link={'/add-section-break/'} routeProps={{
                    onInsertSectionBreak: props.onInsertSectionBreak
                }}>
                    <Icon slot="media" icon="icon-sectionbreak"></Icon>
                </ListItem>
            </List>
        </Page>
    )
};

const PageSectionBreak = props => {
    const { t } = useTranslation();
    const _t = t('Add', {returnObjects: true});
    return (
        <Page>
            <Navbar title={_t.textSectionBreak} backLink={_t.textBack}/>
            <List>
                <ListItem title={_t.textNextPage} link='#' className='no-indicator' onClick={() => {
                    props.onInsertSectionBreak('next')
                }}></ListItem>
                <ListItem title={_t.textContinuousPage} link='#' className='no-indicator' onClick={() => {
                    props.onInsertSectionBreak('continuous')
                }}></ListItem>
                <ListItem title={_t.textEvenPage} link='#' className='no-indicator' onClick={() => {
                    props.onInsertSectionBreak('even')
                }}></ListItem>
                <ListItem title={_t.textOddPage} link='#' className='no-indicator' onClick={() => {
                    props.onInsertSectionBreak('odd')
                }}></ListItem>
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
            <ListItem title={_t.textBreak} link={'/add-break/'} routeProps={{
                onPageBreak: props.onPageBreak,
                onColumnBreak: props.onColumnBreak,
                onInsertSectionBreak: props.onInsertSectionBreak
            }}>
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
        PageNumber as PageAddNumber,
        PageBreak as PageAddBreak,
        PageSectionBreak as PageAddSectionBreak};