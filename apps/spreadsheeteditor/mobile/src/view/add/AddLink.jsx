/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, {Fragment, useState} from 'react';
import {Page, Navbar, BlockTitle, List, ListItem, ListInput, ListButton, Icon, Link, NavLeft, NavRight, NavTitle, f7} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from "../../../../../common/mobile/utils/device";
import SvgIcon from '@common/lib/component/SvgIcon';
import IconClose from '@common-android-icons/icon-close.svg';
import IconDone from '@common-android-icons/icon-done.svg';
import IconDoneDisabled from '@common-android-icons/icon-done-disabled.svg';


const PageTypeLink = ({curType, changeType, isNavigate}) => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const [typeLink, setTypeLink] = useState(curType);

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
                <ListItem title={_t.textExternalLink} radio checked={typeLink === 'ext'} onClick={() => {setTypeLink('ext'); changeType('ext');}}></ListItem>
                <ListItem title={_t.textInternalDataRange} radio checked={typeLink === 'int'} onClick={() => {setTypeLink('int'); changeType('int');}}></ListItem>
            </List>
        </Page>
    )
};

const PageSheet = ({curSheet, sheets, changeSheet, isNavigate}) => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const [stateSheet, setSheet] = useState(curSheet.value);

    return (
        <Page>
            <Navbar className="navbar-link-settings" title={_t.textSheet} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-close' popupClose={!isNavigate ? "#add-link-popup" : ".add-popup"}></Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                {sheets.map((sheet) => {
                    return (
                        <ListItem key={`sheet-${sheet.value}`}
                                  title={sheet.caption}
                                  radio
                                  checked={stateSheet === sheet.value}
                                  onClick={() => {
                                      setSheet(sheet.value);
                                      changeSheet(sheet);
                                  }}
                        />
                    )
                })}

            </List>
        </Page>
    )
};

const AddLink = props => {
    const isIos = Device.ios;
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const isNavigate = props.isNavigate;

    const [typeLink, setTypeLink] = useState('ext');
    const textType = typeLink === 'ext' ? _t.textExternalLink : _t.textInternalDataRange;
    const changeType = (newType) => {
        setTypeLink(newType);
    };

    const [link, setLink] = useState('');

    let displayText = props.displayText;
    const displayDisabled = displayText === 'locked';
    displayText = displayDisabled ? _t.textSelectedRange : displayText;
    
    const [stateDisplayText, setDisplayText] = useState(displayText);
    const [stateAutoUpdate, setAutoUpdate] = useState(!stateDisplayText ? true : false);
    const [screenTip, setScreenTip] = useState('');

    const activeSheet = props.activeSheet;
    const [curSheet, setSheet] = useState(activeSheet);
    const changeSheet = (sheet) => {
        setSheet(sheet);
    };

    const [range, setRange] = useState('');

    return (
        <Page routes={props.routes}>
            <Navbar className="navbar-link-settings">
                <NavLeft>
                    <Link text={Device.ios ? t('View.Add.textCancel') : ''} onClick={() => {
                        isNavigate ? f7.views.current.router.back() : props.closeModal('#add-link-popup', '#add-link-popover');
                    }}>
                        {Device.android && 
                            <SvgIcon symbolId={IconClose.id} className={'icon icon-svg close'} />
                        }
                    </Link>
                </NavLeft>
                <NavTitle>{t('View.Add.textLinkSettings')}</NavTitle>
                <NavRight>
                    <Link className={`${(typeLink === 'ext' && link.length < 1 || typeLink === 'int' && range.length < 1) && 'disabled'}`} onClick={() => {
                        props.onInsertLink(typeLink === 'ext' ?
                            {type: 'ext', url: link, text: stateDisplayText} :
                            {type: 'int', url: range, sheet: curSheet.caption, text: stateDisplayText});
                        }} text={Device.ios ? t('View.Add.textDone') : ''}>
                        {Device.android && ( 
                            link.length < 1 ? 
                                <SvgIcon symbolId={IconDoneDisabled.id} className={'icon icon-svg inactive'} /> :
                                <SvgIcon symbolId={IconDone.id} className={'icon icon-svg active'} />
                        )}
                    </Link>
                </NavRight>
            </Navbar>
            <List inlineLabels className='inputs-list'>
                {props.allowInternal &&
                    <ListItem link={'/add-link-type/'} title={_t.textLinkType} after={textType} routeProps={{
                        changeType: changeType,
                        curType: typeLink,
                        isNavigate
                    }}/>
                }
                {typeLink === 'ext' &&
                    <ListInput 
                        label={_t.textLink}
                        type="text"
                        placeholder={_t.textRequired}
                        value={link}
                        onChange={(event) => {
                            setLink(event.target.value);
                                if(stateAutoUpdate && !displayDisabled) setDisplayText(event.target.value);
                            }}   
                    />
                }
                {typeLink === 'int' &&
                    <ListItem link={'/add-link-sheet/'} title={_t.textSheet} after={curSheet.caption} routeProps={{
                        changeSheet: changeSheet,
                        sheets: props.sheets,
                        curSheet: curSheet,
                        isNavigate
                    }}/>
                }
                {typeLink === 'int' &&
                    <ListInput label={_t.textRange}
                               type="text"
                               placeholder={_t.textRequired}
                               value={range}
                               onChange={(event) => {setRange(event.target.value)}}
                    />
                }
                <ListInput label={_t.textDisplay}
                           type="text"
                           placeholder={t('View.Add.textRecommended')}
                           value={stateDisplayText}
                           disabled={displayDisabled}
                           onChange={(event) => {
                                setDisplayText(event.target.value);
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

export {AddLink, PageTypeLink, PageSheet};
