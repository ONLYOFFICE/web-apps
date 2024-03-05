import React, {useState} from 'react';
import {observer, inject} from "mobx-react";
import {List, ListItem, Page, Navbar, Icon, ListInput, Segmented, Button, Link, NavLeft, NavRight, NavTitle, f7} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from "../../../../../common/mobile/utils/device";

const PageTypeLink = props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const [typeLink, setTypeLink] = useState(props.curType);
    const isNavigate = props.isNavigate;

    return (
        <Page>
            <Navbar className="navbar-link-settings" title={_t.textLinkType} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-close' popupClose={!isNavigate ? "#add-link-popup" : ".add-popup"}></Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem title={_t.textExternalLink} radio checked={typeLink === 1} onClick={() => {setTypeLink(1); props.changeType(1);}}></ListItem>
                <ListItem title={_t.textSlideInThisPresentation} radio checked={typeLink === 0} onClick={() => {setTypeLink(0); props.changeType(0);}}></ListItem>
            </List>
        </Page>
    )
};

const PageLinkTo = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const countPages = props.countPages;
    const isNavigate = props.isNavigate;

    const [stateTypeTo, setTypeTo] = useState(props.curTo);
    const changeTypeTo = (type) => {
        setTypeTo(type);
        props.changeTo(type);
    };

    const [stateNumberTo, setNumberTo] = useState(props.numberTo);
    
    const changeNumber = (curNumber, isDecrement) => {
        let value = isDecrement ? Math.max(curNumber - 1, 1) : Math.min(curNumber + 1, countPages);

        if (value !== curNumber) {
            setTypeTo(4);
            setNumberTo(value);
            props.changeTo(4, value);
        }
    };

    return (
        <Page>
            <Navbar className="navbar-link-settings" title={_t.textLinkTo}  backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-close' popupClose={!isNavigate ? "#add-link-popup" : ".add-popup"}></Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem title={_t.textNextSlide} radio checked={stateTypeTo === 0} onClick={() => {changeTypeTo(0)}}></ListItem>
                <ListItem title={_t.textPreviousSlide} radio checked={stateTypeTo === 1} onClick={() => {changeTypeTo(1)}}></ListItem>
                <ListItem title={_t.textFirstSlide} radio checked={stateTypeTo === 2} onClick={() => {changeTypeTo(2)}}></ListItem>
                <ListItem title={_t.textLastSlide} radio checked={stateTypeTo === 3} onClick={() => {changeTypeTo(3)}}></ListItem>
                <ListItem title={_t.textSlideNumber}>
                    {!isAndroid && <div slot='after-start'>{stateNumberTo}</div>}
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='decrement item-link' onClick={() => {changeNumber(stateNumberTo, true);}}>
                                {isAndroid ? <Icon icon="icon-expand-down"></Icon> : ' - '}
                            </Button>
                            {isAndroid && <label>{stateNumberTo}</label>}
                            <Button outline className='increment item-link' onClick={() => {changeNumber(stateNumberTo, false);}}>
                                {isAndroid ? <Icon icon="icon-expand-up"></Icon> : ' + '}
                            </Button>
                        </Segmented>
                    </div>
                </ListItem>
            </List>
        </Page>
    )
};

const PageLink = props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const countPages = props.storeToolbarSettings?.countPages;
    const regx = /["https://"]/g
    const isNavigate = props.isNavigate;
    const [typeLink, setTypeLink] = useState(1);
    const textType = typeLink === 1 ? _t.textExternalLink : _t.textSlideInThisPresentation;
    const changeType = (newType) => {
        setTypeLink(newType);
    };

    const [link, setLink] = useState('');
    const [linkTo, setLinkTo] = useState(0);
    const [displayTo, setDisplayTo] = useState(_t.textNextSlide);
    const [numberTo, setNumberTo] = useState(1);

    const changeTo = (type, number) => {
        setLinkTo(type);
        switch (type) {
            case 0 : setDisplayTo(_t.textNextSlide); break;
            case 1 : setDisplayTo(_t.textPreviousSlide); break;
            case 2 : setDisplayTo(_t.textFirstSlide); break;
            case 3 : setDisplayTo(_t.textLastSlide); break;
            case 4 : setDisplayTo(`${_t.textSlide} ${number}`); setNumberTo(number); break;
        }
    };

    const display = props.getTextDisplay();
    const displayDisabled = display !== false && display === null;
    const [stateDisplay, setDisplay] = useState(display !== false ? ((display !== null) ? display : _t.textDefault) : "");
    const [stateAutoUpdate, setAutoUpdate] = useState(!stateDisplay ? true : false);
    const [screenTip, setScreenTip] = useState('');

    return (
        <Page>
            <Navbar className="navbar-link-settings">
                <NavLeft>
                    <Link text={Device.ios ? t('View.Add.textCancel') : ''} onClick={() => {
                        isNavigate ? f7.views.current.router.back() : props.closeModal('#add-link-popup', '#add-link-popover');
                    }}>
                        {Device.android && <Icon icon='icon-close' />}
                    </Link>
                </NavLeft>
                <NavTitle>{t('View.Add.textLinkSettings')}</NavTitle>
                <NavRight>
                    <Link className={`${typeLink === 1 && link.length < 1 && 'disabled'}`} onClick={() => {
                        props.onInsertLink(typeLink, (typeLink === 1 ?
                            {url: link, display: stateDisplay, displayDisabled, tip: screenTip } :
                            {linkTo: linkTo, numberTo: numberTo, display: stateDisplay, displayDisabled, tip: screenTip}));
                    }} text={Device.ios ? t('View.Add.textDone') : ''}>
                        {Device.android && <Icon icon={link.length < 1 ? 'icon-done-disabled' : 'icon-done'} />}
                    </Link>
                </NavRight>
            </Navbar>
            <List inlineLabels className='inputs-list'>
                <ListItem link={'/add-link-type/'} title={_t.textLinkType} after={textType} routeProps={{
                    changeType: changeType,
                    curType: typeLink,
                    isNavigate
                }}/>
                {typeLink === 1 ?
                    <ListInput label={_t.textLink}
                               type="text"
                               placeholder={t('View.Add.textRequired')}
                               value={link}
                               onChange={(event) => {
                                setLink(event.target.value);
                                if(stateAutoUpdate) setDisplay(event.target.value);
                            }}
                    /> :
                    <ListItem link={'/add-link-to/'} title={_t.textLinkTo} after={displayTo} routeProps={{
                        changeTo: changeTo,
                        curTo: linkTo,
                        isNavigate,
                        countPages,
                        numberTo
                    }}/>
                }
                <ListInput label={_t.textDisplay}
                           type="text"
                           placeholder={t('View.Add.textRecommended')}
                           value={stateDisplay}
                           disabled={displayDisabled}
                           onChange={(event) => {
                                setDisplay(event.target.value);
                                setAutoUpdate(event.target.value == ''); 
                            }}
                />
                <ListInput label={_t.textScreenTip}
                           type="text"
                           placeholder={_t.textScreenTip}
                           value={screenTip}
                           onChange={(event) => {setScreenTip(event.target.value)}}
                />
            </List>
        </Page>
    )
};

const ObservablePageLink = inject('storeToolbarSettings')(observer(PageLink))

export {ObservablePageLink,
        PageLinkTo,
        PageTypeLink}