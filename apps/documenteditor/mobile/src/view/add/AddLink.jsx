import React, {useState} from 'react';
import {List, Page, Navbar, Icon, ListButton, ListInput} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from "../../../../../common/mobile/utils/device";

const PageLink = props => {
    const { t } = useTranslation();
    const _t = t('Add', {returnObjects: true});

    let display = props.getDisplayLinkText();
    display = typeof display === 'string' ? display : '';

    const [stateLink, setLink] = useState('');
    const [stateDisplay, setDisplay] = useState(display);
    const [stateTip, setTip] = useState('');
    const [stateAutoUpdate, setAutoUpdate] = useState(!stateDisplay ? true : false);
   
    return (
        <Page>
            {!props.noNavbar && <Navbar title={_t.textAddLink} backLink={_t.textBack}></Navbar>}
            <List inlineLabels className='inputs-list'>
                <ListInput
                    label={_t.textLink}
                    type="text"
                    placeholder={_t.textLink}
                    value={stateLink}
                    onChange={(event) => {
                        setLink(event.target.value); 
                        if(stateAutoUpdate) setDisplay(event.target.value); 
                    }}
                ></ListInput>
                <ListInput
                    label={_t.textDisplay}
                    type="text"
                    placeholder={_t.textDisplay}
                    value={stateDisplay}
                    onChange={(event) => {
                        setDisplay(event.target.value); 
                        setAutoUpdate(event.target.value == ''); 
                    }}
                ></ListInput>
                <ListInput
                    label={_t.textScreenTip}
                    type="text"
                    placeholder={_t.textScreenTip}
                    value={stateTip}
                    onChange={(event) => {setTip(event.target.value)}}
                ></ListInput>
            </List>
            <List className="buttons-list">
                <ListButton className={'button-fill button-raised' + (stateLink.length < 1 ? ' disabled' : '')} title={_t.textInsert} onClick={() => {
                    props.onInsertLink(stateLink, stateDisplay, stateTip)
                }}></ListButton>
            </List>
        </Page>
    )
};

export {PageLink as PageAddLink};