import React, { useState, useEffect, Component } from "react";
import { Device } from '../../../../../common/mobile/utils/device';
import {f7, View, List, ListItem, Icon, Row, Button, Page, Navbar, NavRight, Segmented, BlockTitle, Link, ListButton, Toggle, Actions, ActionsButton, ActionsGroup, Sheet} from 'framework7-react';
import { useTranslation } from 'react-i18next';

const Navigation = props => {
    const { t } = useTranslation();
    const _t = t('Settings', {returnObjects: true});
    const android = Device.android;
    const api = Common.EditorApi.get();
    const navigationObject = api.asc_ShowDocumentOutline();
    const [currentPosition, setCurrentPosition] = useState(navigationObject.get_CurrentPosition());
    const arrHeaders = props.updateNavigation();

    return (
        <Page>
            {!Device.phone && <Navbar title={t('Settings.textNavigation')} backLink={_t.textBack} />}
            {!arrHeaders.length 
                ?
                <div className="empty-screens">
                    {!android && 
                        <div className="empty-screens__icon">
                            <Icon slot="media" icon="icon-empty-screens"></Icon>
                        </div>
                    }
                    <p className="empty-screens__text">{t('Settings.textEmptyScreens')}</p>
                </div>
                :
                <List>
                    {arrHeaders.map((header, index) => {
                        return (
                            <ListItem radio key={index} title={header.name} checked={header.index === currentPosition} style={{paddingLeft: header.level * 16}} onClick={() => {
                                setCurrentPosition(header.index);
                                props.onSelectItem(header.index);
                            }}></ListItem>
                        )
                    })}
                </List>
            }
        </Page>
    )
}

const NavigationSheetView = props => {
    useEffect(() => {
        if(Device.phone) {
            f7.sheet.open('#view-navigation-sheet', true);
        }

        return () => {}
    });

    return (
        <Sheet id="view-navigation-sheet" swipeToClose>
            {/* <div id='swipe-handler' className='swipe-container' onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                <Icon icon='icon-swipe' />
            </div> */}
            <Navigation 
                updateNavigation={props.updateNavigation} 
                onSelectItem={props.onSelectItem} 
                closeModal={props.closeModal}
            />
        </Sheet>
    )
}

const NavigationView = props => {

    return (
        !Device.phone 
            ? 
                <Navigation 
                    updateNavigation={props.updateNavigation} 
                    onSelectItem={props.onSelectItem} 
                    closeModal={props.closeModal}
                />
                
            :
                <NavigationSheetView
                    updateNavigation={props.updateNavigation} 
                    onSelectItem={props.onSelectItem} 
                    closeModal={props.closeModal}
                />
            
    )
}

export default NavigationView;