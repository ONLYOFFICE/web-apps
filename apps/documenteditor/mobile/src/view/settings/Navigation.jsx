import React, { useState, useEffect, useContext } from "react";
import { Device } from '../../../../../common/mobile/utils/device';
import {f7, List, ListItem, Icon, Page, Navbar, Sheet} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { inject, observer } from "mobx-react";
import { MainContext } from "../../page/main";

const NavigationPopover = inject('storeNavigation')(observer(props => {
    const { t } = useTranslation();
    const _t = t('Settings', {returnObjects: true});
    const api = Common.EditorApi.get();
    const storeNavigation = props.storeNavigation;
    const bookmarks = storeNavigation.bookmarks;
    const navigationObject = api.asc_ShowDocumentOutline();
    const [currentPosition, setCurrentPosition] = useState(navigationObject ? navigationObject.get_CurrentPosition() : bookmarks.length ? bookmarks[0] : null);
    let arrHeaders = [];

    if(navigationObject) {
        arrHeaders = props.updateNavigation();
    } else if(bookmarks.length) {
        arrHeaders = props.updateViewerNavigation(bookmarks);
    }

    return (
        <Page>
            <Navbar title={t('Settings.textNavigation')} backLink={_t.textBack} />
            {!arrHeaders || !arrHeaders.length 
                ?
                    <div className="empty-screens">
                        <p className="empty-screens__text">{t('Settings.textEmptyScreens')}</p>
                    </div>
                :
                    <List className="navigation-list" style={!Device.phone ? { height: '352px', marginTop: 0 } : null}>
                        {arrHeaders.map((header, index) => {
                            return (
                                <ListItem radio key={index} title={header.isEmptyItem ? t('Settings.textBeginningDocument') : header.name} checked={header.index === currentPosition} style={{paddingLeft: header.level * 16}} onClick={() => {
                                    setCurrentPosition(header.index);
                                    props.onSelectItem(header.index);
                                }}></ListItem>
                            )
                        })}
                    </List>
            }
        </Page>
    )
}));

const NavigationSheet = inject('storeNavigation')(observer(props => {
    const { t } = useTranslation();
    const mainContext = useContext(MainContext);
    const api = Common.EditorApi.get();
    const storeNavigation = props.storeNavigation;
    const bookmarks = storeNavigation.bookmarks;
    const navigationObject = api.asc_ShowDocumentOutline();
    const [currentPosition, setCurrentPosition] = useState(navigationObject ? navigationObject.get_CurrentPosition() : bookmarks.length ? bookmarks[0] : null);
    let arrHeaders = [];

    if(navigationObject) {
        arrHeaders = props.updateNavigation();
    } else if(bookmarks.length) {
        arrHeaders = props.updateViewerNavigation(bookmarks);
    }

    const [stateHeight, setHeight] = useState('45%');
    const [stateOpacity, setOpacity] = useState(1);

    const [stateStartY, setStartY] = useState();
    const [isNeedClose, setNeedClose] = useState(false);

    const handleTouchStart = (event) => {
        const touchObj = event.changedTouches[0];
        setStartY(parseInt(touchObj.clientY));
    };

    const handleTouchMove = (event) => {
        const touchObj = event.changedTouches[0];
        const dist = parseInt(touchObj.clientY) - stateStartY;

        if (dist < 0) { 
            setHeight('90%');
            setOpacity(1);
            setNeedClose(false);
        } else if (dist < 80) {
            setHeight('45%');
            setOpacity(1);
            setNeedClose(false);
        } else {
            setNeedClose(true);
            setOpacity(0.6);
        }
    };

    const handleTouchEnd = (event) => {
        const touchObj = event.changedTouches[0];
        const swipeEnd = parseInt(touchObj.clientY);
        const dist = swipeEnd - stateStartY;

        if (isNeedClose) {
            f7.sheet.close('#view-navigation-sheet');
        } else if (stateHeight === '90%' && dist > 20) {
            setHeight('45%');
        }
    };

    useEffect(() => {
        f7.sheet.open('#view-navigation-sheet', true);
    }, []);

    return (
        <Sheet id="view-navigation-sheet" className="navigation-sheet" backdrop={true} closeByBackdropClick={true} onSheetClosed={() => mainContext.closeOptions('navigation')} style={{height: `${stateHeight}`, opacity: `${stateOpacity}`}}>
            <div id='swipe-handler' className='swipe-container' onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                <Icon icon='icon icon-swipe'/>
            </div>
            <div className="navigation-sheet__title">
                <p>{t('Settings.textNavigation')}</p>
            </div>
            {!arrHeaders || !arrHeaders.length 
                ?
                    <div className="empty-screens">
                        <p className="empty-screens__text">{t('Settings.textEmptyScreens')}</p>
                    </div>
                :
                    <List className="navigation-list">
                        {arrHeaders.map((header, index) => {
                            return (
                                <ListItem radio key={index} title={header.isEmptyItem ? t('Settings.textBeginningDocument') : header.name} checked={header.index === currentPosition} style={{paddingLeft: header.level * 16}} onClick={() => {
                                    setCurrentPosition(header.index);
                                    props.onSelectItem(header.index);
                                }}></ListItem>
                            )
                        })}
                    </List>
            }
        </Sheet>
    )
}));

export {
    NavigationPopover,
    NavigationSheet
};