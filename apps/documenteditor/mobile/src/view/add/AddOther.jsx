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
            <ListItem title={_t.textPageNumber}>
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

export {AddOther, PageLink as PageAddLink};