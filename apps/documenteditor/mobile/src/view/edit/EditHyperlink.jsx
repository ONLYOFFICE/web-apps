import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";
import {List, ListInput, ListButton, Page, f7, Link, Navbar, NavLeft, NavTitle, NavRight} from 'framework7-react';
import { useTranslation } from 'react-i18next';

const EditHyperlink = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const linkObject = props.storeFocusObjects.linkObject;
    let link = '', display = '';

    if(linkObject) {
        link = linkObject.get_Value() ? linkObject.get_Value().replace(new RegExp(" ", 'g'), "%20") : '';
        display = !(linkObject.get_Text() === null) ? linkObject.get_Text() : '';
        // const tip = linkObject.get_ToolTip();
        // const [stateTip, setTip] = useState(tip);
    }

    const [stateLink, setLink] = useState(link);
    const [stateDisplay, setDisplay] = useState(display);

    return (
        <Page>
            {!props.noNavbar && 
                <Navbar>
                    <NavLeft>
                        <Link text={t('Add.textCancel')} onClick={() => {
                            props.isNavigate ? f7.views.current.router.back() : props.closeModal();
                        }}></Link>
                    </NavLeft>
                    <NavTitle>{t('Add.textLinkSettings')}</NavTitle>
                    <NavRight>
                        <Link className={`${stateLink.length < 1 && 'disabled'}`} onClick={() => {
                            props.onEditLink(stateLink, stateDisplay);
                            props.isNavigate ? f7.views.current.router.back() : props.closeModal();
                        }} text={t('Add.textDone')}></Link>
                    </NavRight>
                </Navbar>
            }
            <List inlineLabels className='inputs-list'>
                <ListInput
                    label={_t.textLink}
                    type="text"
                    placeholder={t('Edit.textRequired')}
                    value={stateLink}
                    onChange={(event) => {setLink(event.target.value)}}
                ></ListInput>
                <ListInput
                    label={_t.textDisplay}
                    type="text"
                    placeholder={t('Edit.textRecommended')}
                    value={stateDisplay}
                    onChange={(event) => {setDisplay(event.target.value)}}
                ></ListInput>
                {/* <ListInput
                    label={_t.textScreenTip}
                    type="text"
                    placeholder={_t.textScreenTip}
                    value={stateTip}
                    onChange={(event) => {setTip(event.target.value)}}
                ></ListInput> */}
            </List>
            <List className="buttons-list">
                {/* <ListButton className={'button-fill button-raised' + (stateLink.length < 1 ? ' disabled' : '')} title={_t.textEditLink} onClick={() => {
                    props.onEditLink(stateLink, stateDisplay)
                }}></ListButton> */}
                <ListButton title={t('Edit.textDeleteLink')} className='button-red button-fill button-raised' onClick={() => {
                    props.onRemoveLink();
                    props.isNavigate ? f7.views.current.router.back() : props.closeModal();
                }} />
            </List>
        </Page>
    )
};

export default inject("storeFocusObjects")(observer(EditHyperlink));