import React, {useState, useEffect} from 'react';
import {observer, inject} from "mobx-react";
import {List, ListItem, Page, Navbar, Icon, ListButton, ListInput, Segmented, Button} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from "../../../../../common/mobile/utils/device";

const PageTypeLink = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeLinkSettings = props.storeLinkSettings;
    const typeLink = storeLinkSettings.typeLink;

    return (
        <Page>
            <Navbar title={_t.textLinkType} backLink={_t.textBack}/>
            <List>
                <ListItem title={_t.textExternalLink} radio checked={typeLink === 1} onClick={() => {storeLinkSettings.changeLinkType(1);}}></ListItem>
                <ListItem title={_t.textSlideInThisPresentation} radio checked={typeLink === 0} onClick={() => {storeLinkSettings.changeLinkType(0);}}></ListItem>
            </List>
        </Page>
    )
};

const PageLinkTo = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const api = Common.EditorApi.get();
    const slidesCount = api.getCountPages();
    const storeLinkSettings = props.storeLinkSettings;
    const slideLink = storeLinkSettings.slideLink;
    // console.log(slideLink);
    // const slideNum = storeLinkSettings.slideNum;
    // const [stateTypeTo, setTypeTo] = useState(props.curTo);

    const changeTypeTo = (type) => {
        storeLinkSettings.changeSlideLink(type);
        props.changeTo(type);
    };

    const [stateNumberTo, setNumberTo] = useState(0);

    const changeNumber = (curNumber, isDecrement) => {
        storeLinkSettings.changeSlideLink(4);
        let value;

        if (isDecrement) {
            value = Math.max(0, --curNumber);
        } else {
            value = Math.min(slidesCount - 1, ++curNumber);
        }

        setNumberTo(value);
        storeLinkSettings.changeSlideNum(value);
        props.changeTo(4, value);
    };

    return (
        <Page>
            <Navbar title={_t.textLinkTo} backLink={_t.textBack}/>
            <List>
                <ListItem title={_t.textNextSlide} radio checked={slideLink === 0} onClick={() => {changeTypeTo(0)}}></ListItem>
                <ListItem title={_t.textPreviousSlide} radio checked={slideLink === 1} onClick={() => {changeTypeTo(1)}}></ListItem>
                <ListItem title={_t.textFirstSlide} radio checked={slideLink === 2} onClick={() => {changeTypeTo(2)}}></ListItem>
                <ListItem title={_t.textLastSlide} radio checked={slideLink === 3} onClick={() => {changeTypeTo(3)}}></ListItem>
                <ListItem title={_t.textSlideNumber} radio checked={slideLink === 4}>
                    {!isAndroid && <div slot='after-start'>{stateNumberTo + 1}</div>}
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='decrement item-link' onClick={() => {changeNumber(stateNumberTo, true);}}>
                                {isAndroid ? <Icon icon="icon-expand-down"></Icon> : ' - '}
                            </Button>
                            {isAndroid && <label>{stateNumberTo + 1}</label>}
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
    const _t = t('View.Edit', {returnObjects: true});
    const storeFocusObjects = props.storeFocusObjects;
    const storeLinkSettings = props.storeLinkSettings;
    const linkObject = storeFocusObjects.linkObject;
    
    useEffect(() => {
        storeLinkSettings.initCategory(linkObject);
    }, [linkObject]);

    const url = linkObject.get_Value();
    const tooltip = linkObject.get_ToolTip();
    const display = linkObject.get_Text();
    const slideNum = storeLinkSettings.slideNum;
    const slideLink = storeLinkSettings.slideLink;
    const typeLink = storeLinkSettings.typeLink;
    
    if(typeLink === 1) {
        storeLinkSettings.changeSlideName(_t.textNextSlide);
        storeLinkSettings.changeSlideLink(0);
    } 

    const textType = typeLink === 1 ? _t.textExternalLink : _t.textSlideInThisPresentation;
    const [link, setLink] = useState(typeLink !== 0 ? url : '');

    const changeTo = (slideLink, number) => {
        switch (slideLink) {
            case 0 : storeLinkSettings.changeSlideName(_t.textNextSlide); break;
            case 1 : storeLinkSettings.changeSlideName(_t.textPreviousSlide); break;
            case 2 : storeLinkSettings.changeSlideName(_t.textFirstSlide); break;
            case 3 : storeLinkSettings.changeSlideName(_t.textLastSlide); break;
            case 4 : storeLinkSettings.changeSlideName(`${_t.textSlide} ${number + 1}`); storeLinkSettings.changeSlideNum(number);
        }
    }

    changeTo(slideLink, slideNum);
    
    const slideName = storeLinkSettings.slideName;
    const [screenTip, setScreenTip] = useState(tooltip);
    const displayDisabled = display !== false && display === null;
    const [stateDisplay, setDisplay] = useState(display !== false ? ((display !== null) ? display : _t.textDefault) : "");

    return (
        <Page>
            <Navbar title={_t.textLink} backLink={_t.textBack}/>
            <List inlineLabels className='inputs-list'>
                <ListItem link={'/edit-link-type/'} title={_t.textLinkType} after={textType} routeProps={{
                    curType: typeLink
                }} />
                {typeLink !== 0 ?
                    <ListInput label={_t.textLink}
                               type="text"
                               placeholder={_t.textLink}
                               value={link}
                               onChange={(event) => {setLink(event.target.value)}}
                    /> :
                    <ListItem link={'/edit-link-to/'} title={_t.textLinkTo} after={slideName} routeProps={{
                        changeTo: changeTo,
                        curTo: slideLink
                    }}/>
                }
                <ListInput label={_t.textDisplay}
                           type="text"
                           placeholder={_t.textDisplay}
                           value={stateDisplay}
                           disabled={displayDisabled}
                           onChange={(event) => {setDisplay(event.target.value)}}
                />
                <ListInput label={_t.textScreenTip}
                           type="text"
                           placeholder={_t.textScreenTip}
                           value={screenTip}
                           onChange={(event) => {setScreenTip(event.target.value)}}
                />
            </List>
            <List>
                <ListButton title={_t.textEditLink}
                            className={`button-fill button-raised${typeLink === 1 && url.length < 1 && ' disabled'}`}
                            onClick={() => {
                                props.onEditLink(typeLink, (typeLink === 1 ?
                                    {url: link, display: stateDisplay, tip: screenTip, displayDisabled: displayDisabled } :
                                    {linkTo: slideLink, numberTo: slideNum, display: stateDisplay, tip: screenTip, displayDisabled: displayDisabled}));
                            }}
                />
                <ListButton title={_t.textRemoveLink}
                            className={`button-fill button-red`}
                            onClick={() => {
                                props.onRemoveLink()
                            }}
                />
            </List>
        </Page>
    )
};

const EditLink = inject("storeFocusObjects", "storeLinkSettings")(observer(PageLink));
const LinkTo = inject("storeFocusObjects", "storeLinkSettings")(observer(PageLinkTo));
const TypeLink = inject("storeFocusObjects", "storeLinkSettings")(observer(PageTypeLink));

export {EditLink,
        LinkTo as PageLinkTo,
        TypeLink as PageTypeLink}