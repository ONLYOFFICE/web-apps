import React, { useState, useEffect, Component, Fragment } from "react";
import { Device } from '../../../../../common/mobile/utils/device';
import {f7, View, List, ListItem, Icon, Row, Button, Page, Navbar, NavRight, Segmented, BlockTitle, Link, ListButton, Toggle, Actions, ActionsButton, ActionsGroup, Sheet} from 'framework7-react';
import { useTranslation } from 'react-i18next';

const Navigation = props => {
    const { t } = useTranslation();
    const _t = t('Settings', {returnObjects: true});
    const android = Device.android;
    const isPhone = Device.phone;
    const api = Common.EditorApi.get();
    const navigationObject = api.asc_ShowDocumentOutline();
    const [currentPosition, setCurrentPosition] = useState(navigationObject.get_CurrentPosition());
    const arrHeaders = props.updateNavigation();

    return (
        <Page>
            {!isPhone && <Navbar title={t('Settings.textNavigation')} backLink={_t.textBack} />}
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

export default Navigation;