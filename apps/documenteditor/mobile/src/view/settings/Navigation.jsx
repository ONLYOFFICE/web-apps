import React, { useState, useEffect } from "react";
import { Device } from '../../../../../common/mobile/utils/device';
import {f7, View, List, ListItem, Icon, Row, Button, Page, Navbar, NavRight, Segmented, BlockTitle, Link, ListButton, Toggle, Actions, ActionsButton, ActionsGroup, Sheet} from 'framework7-react';
import { useTranslation } from 'react-i18next';

const Navigation = props => {
    const { t } = useTranslation();
    const _t = t('Settings', {returnObjects: true});
    const android = Device.android;
    const api = Common.EditorApi.get();
    const navigationObject = api.asc_ShowDocumentOutline();
    const count = navigationObject.get_ElementsCount();
    const [currentPosition, setCurrentPosition] = useState(navigationObject.get_CurrentPosition());
    const arrHeaders = [];

    const updateNavigation = () => {
        if (!navigationObject) return;
       
        let prevLevel = -1,
            headerLevel = -1,
            firstHeader = !navigationObject.isFirstItemNotHeader();

        for (let i = 0; i < count; i++) {
            let level = navigationObject.get_Level(i),
                hasParent = true;
            if (level > prevLevel && i > 0)
                arrHeaders[i - 1]['hasSubItems'] = true;
            if (headerLevel < 0 || level <= headerLevel) {
                if (i > 0 || firstHeader)
                    headerLevel = level;
                hasParent = false;
            }

            arrHeaders.push({
                name: navigationObject.get_Text(i),
                level: level,
                index: i,
                hasParent: hasParent,
                isEmptyItem: navigationObject.isEmptyItem(i)
            });

            prevLevel = level;
        }

        if (count > 0 && !firstHeader) {
            arrHeaders[0]['hasSubItems'] = false;
            arrHeaders[0]['isNotHeader'] =  true;
            arrHeaders[0]['name'] = t('Settings.textBeginningDocument');
        }
    }

    updateNavigation();
    // console.log(navigationObject);

    return (
        <Page>
            <Navbar title={t('Settings.textNavigation')} backLink={_t.textBack} />
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

const NavigationSheet = () => {
    useEffect(() => {
        f7.sheet.open('#view-navigation-sheet');
    });

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

        if (dist < 0) { // to top
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
            closeCurComments();
        } else if (stateHeight === '90%' && dist > 20) {
            setHeight('45%');
        }
    };

    return (
        <Sheet id='view-navigation-sheet' style={{height: `${stateHeight}`, opacity: `${stateOpacity}`}}>
            <div id='swipe-handler' className='swipe-container' onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                <Icon icon='icon-swipe' />
            </div>
            <Navigation />
        </Sheet>
    )
};

export default Navigation;