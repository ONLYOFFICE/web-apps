import React, {useState} from 'react';
import {List, Page, Navbar, Icon, ListButton, ListInput, NavRight, Link, NavLeft, f7, NavTitle} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from "../../../../../common/mobile/utils/device";
import SvgIcon from '@common/lib/component/SvgIcon';
import IconClose from '@common-android-icons/icon-close.svg';
import IconDone from '@common-android-icons/icon-done.svg';
import IconDoneDisabled from '@common-android-icons/icon-done-disabled.svg';

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
            <Navbar className="navbar-link-settings">
                <NavLeft>
                    <Link text={Device.ios ? t('Add.textCancel') : ''} onClick={() => {
                        props.isNavigate ? f7.views.current.router.back() : props.closeModal('#add-link-popup', '#add-link-popover');
                    }}>
                        {Device.android && 
                            <SvgIcon symbolId={IconClose.id} className={'icon icon-svg close'} />
                        }
                    </Link>
                </NavLeft>
                <NavTitle>{t('Add.textLinkSettings')}</NavTitle>
                <NavRight>
                    <Link className={`${stateLink.length < 1 && 'disabled'}`} onClick={() => {
                        props.onInsertLink(stateLink, stateDisplay, stateTip);
                    }} text={Device.ios ? t('Add.textDone') : ''}>
                        {Device.android && ( 
                            stateLink.length < 1 ? 
                                <SvgIcon symbolId={IconDoneDisabled.id} className={'icon icon-svg inactive'} /> :
                                <SvgIcon symbolId={IconDone.id} className={'icon icon-svg active'} />
                        )}
                    </Link>
                </NavRight>
            </Navbar>
            <List inlineLabels className='inputs-list'>
                <ListInput
                    label={_t.textLink}
                    type="text"
                    placeholder={t('Add.textRequired')}
                    value={stateLink}
                    onChange={(event) => {
                        setLink(event.target.value); 
                        if(stateAutoUpdate) setDisplay(event.target.value); 
                    }}
                ></ListInput>
                <ListInput
                    label={_t.textDisplay}
                    type="text"
                    placeholder={t('Add.textRecommended')}
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
            {/* <List className="buttons-list">
                <ListButton className={'button-fill button-raised' + (stateLink.length < 1 ? ' disabled' : '')} title={_t.textInsert} onClick={() => {
                    props.onInsertLink(stateLink, stateDisplay)
                }}></ListButton>
            </List> */}
        </Page>
    )
};

export {PageLink as PageAddLink};