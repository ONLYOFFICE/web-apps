import React, {useState} from 'react';
import {observer, inject} from "mobx-react";
import {List, ListItem, Page, Navbar, Icon, ListButton, ListInput, BlockTitle} from 'framework7-react';
import { useTranslation } from 'react-i18next';

const PageLinkSettings = props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const [stateValue, setValue] = useState('');
    return (
        <Page>
            <Navbar title={_t.textLinkSettings} backLink={_t.textBack}></Navbar>
            <BlockTitle>{_t.textAddress}</BlockTitle>
            <List className='add-image'>
                <ListInput
                    type='text'
                    placeholder={_t.textImageURL}
                    value={stateValue}
                    onChange={(event) => {setValue(event.target.value)}}
                >
                </ListInput>
            </List>
            <List className="buttons-list">
                <ListButton className={'button-fill button-raised' + (stateValue.length < 1 ? ' disabled' : '')}
                            title={_t.textInsertImage}
                            onClick={() => {props.onInsertByUrl(stateValue)}}></ListButton>
            </List>
        </Page>
    )
};

const AddImage = props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    return (
        <List>
            <ListItem title={_t.textPictureFromLibrary} onClick={() => {props.onInsertByFile()}}>
                <Icon slot="media" icon="icon-image-library"></Icon>
            </ListItem>
            <ListItem title={_t.textPictureFromURL} link={'/add-image-from-url/'} routeProps={{
                onInsertByUrl: props.onInsertByUrl
            }}>
                <Icon slot="media" icon="icon-link"></Icon>
            </ListItem>
        </List>
    )
};

export {AddImage, PageLinkSettings as PageImageLinkSettings};