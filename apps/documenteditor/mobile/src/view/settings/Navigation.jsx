import React, { useState, useEffect, useContext } from "react";
import { Device } from '../../../../../common/mobile/utils/device';
import {f7, List, ListItem, Page, Navbar, Sheet, View} from 'framework7-react';
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

const NavigationPage = inject('storeNavigation')(observer(props => {
    const { t } = useTranslation();
    const _t = t('Settings', {returnObjects: true});
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

    const handleBack = () => {
        f7.sheet.close('#view-navigation-sheet');
    };

    return (
        <Page>
            <Navbar title={t('Settings.textNavigation')} backLink={_t.textBack} onBackClick={handleBack} />
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
        </Page>
    )
}));

const NavigationSheet = inject('storeNavigation')(observer(props => {
    const mainContext = useContext(MainContext);

    const routes = [
        {
            path: '/navigation-page/',
            component: NavigationPage,
            options: {
                props: {
                    onSelectItem: props.onSelectItem,
                    updateNavigation: props.updateNavigation,
                    updateViewerNavigation: props.updateViewerNavigation
                }
            }
        }
    ];

    routes.forEach(route => {
        route.options = {
            ...route.options,
            transition: 'f7-push'
        };
    });

    useEffect(() => {
        f7.sheet.open('#view-navigation-sheet', true);
    }, []);

    return (
        <Sheet id="view-navigation-sheet" className="navigation-sheet" backdrop={true} closeByBackdropClick={true} onSheetClosed={() => {mainContext.closeOptions('navigation'); mainContext.openOptions('settings');}}>
            <View routes={routes} url="/navigation-page/">
                <NavigationPage 
                    onSelectItem={props.onSelectItem}
                    updateNavigation={props.updateNavigation}
                    updateViewerNavigation={props.updateViewerNavigation}
                />
            </View>
        </Sheet>
    )
}));

export {
    NavigationPopover,
    NavigationSheet
};