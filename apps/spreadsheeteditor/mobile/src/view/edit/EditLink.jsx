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

import React, {useState, useEffect, Fragment} from 'react';
import {observer, inject} from "mobx-react";
import {f7, List, ListItem, Page, Navbar, NavRight, Icon, ListButton, ListInput, Link, NavLeft, NavTitle, BlockTitle} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from "../../../../../common/mobile/utils/device";
import SvgIcon from '@common/lib/component/SvgIcon';
import IconClose from '@common-android-icons/icon-close.svg';
import IconDone from '@common-android-icons/icon-done.svg';
import IconDoneDisabled from '@common-android-icons/icon-done-disabled.svg';

const PageEditTypeLink = ({curType, changeType, storeFocusObjects}) => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const [typeLink, setTypeLink] = useState(curType);

    const settings = !storeFocusObjects.focusOn ? [] : (storeFocusObjects.focusOn === 'obj' ? storeFocusObjects.objects : storeFocusObjects.selections);
    if (storeFocusObjects.focusOn === 'obj' || settings.indexOf('hyperlink') === -1) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page>
            <Navbar className="navbar-link-settings" title={_t.textLinkType} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-close' popupClose="#edit-link-popup"></Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem title={_t.textExternalLink} radio checked={typeLink === 1} onClick={() => {setTypeLink(1); changeType(1);}}></ListItem>
                <ListItem title={_t.textInternalDataRange} radio checked={typeLink === 2} onClick={() => {setTypeLink(2); changeType(2);}}></ListItem>
            </List>
        </Page>
    )
};

const PageEditSheet = ({curSheet, sheets, changeSheet, storeFocusObjects}) => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const [stateSheet, setSheet] = useState(curSheet ? curSheet.type + '-' + curSheet.value : '');
    const sheetItems = sheets.filter(item => item.type === 'sheet');
    const definedNameItems = sheets.filter(item => item.type === 'name');
    const getLinkItem = item => (
        <ListItem key={`${item.type}-${item.value}`} title={item.caption} radio checked={stateSheet === item.type + '-' + item.value} onClick={() => {
                setSheet(item.type + '-' + item.value);
                changeSheet(item);
            }}
        />
    );

    const settings = !storeFocusObjects.focusOn ? [] : (storeFocusObjects.focusOn === 'obj' ? storeFocusObjects.objects : storeFocusObjects.selections);
    if (storeFocusObjects.focusOn === 'obj' || settings.indexOf('hyperlink') === -1) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page>
            <Navbar className="navbar-link-settings" title={_t.textLinkTo} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-close' popupClose="#edit-link-popup"></Link>
                    </NavRight>
                }
            </Navbar>
            {sheetItems.length > 0 && <BlockTitle>{_t.textSheets}</BlockTitle>}
            <List>
                {sheetItems.map(getLinkItem)}
            </List>
            {definedNameItems.length > 0 &&
                <Fragment>
                    <BlockTitle>{_t.textDefinedName}</BlockTitle>
                    <List>
                        {definedNameItems.map(getLinkItem)}
                    </List>
                </Fragment>
            }
        </Page>
    )
};

const EditLink = props => {
    const isIos = Device.ios;
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const linkInfo = props.linkInfo;
    const isLock = props.isLock;
    const sheets = props.sheets;
    const currentSheet = props.currentSheet;
    const valueTypeLink = linkInfo.asc_getType();
    const valueLinkSheet = linkInfo.asc_getSheet();
    const valueLinkLocation = linkInfo.asc_getLocation();
    const getLinkSheet = () => sheets.find(sheet => sheet.type === 'sheet' && sheet.caption === valueLinkSheet);
    const getLinkName = () => sheets.find(sheet => sheet.type === 'name' && sheet.value === valueLinkLocation);
    const getCurrentSheet = () => sheets.find(sheet => sheet.type === 'sheet' && sheet.caption === currentSheet);
    const linkSheet = (valueTypeLink == Asc.c_oAscHyperlinkType.RangeLink) ? valueLinkSheet ? getLinkSheet() : getLinkName() : getCurrentSheet();

    const [typeLink, setTypeLink] = useState(valueTypeLink);
    const textType = typeLink != Asc.c_oAscHyperlinkType.RangeLink ? _t.textExternalLink : _t.textInternalDataRange;

    const changeType = (newType) => {
        setTypeLink(newType);
    };
   
    const [link, setLink] = useState(linkInfo.asc_getHyperlinkUrl() ? linkInfo.asc_getHyperlinkUrl().replace(new RegExp(" ", 'g'), "%20") : '');
   
    const displayText = isLock ? _t.textDefault : linkInfo.asc_getText();
    const [stateDisplayText, setDisplayText] = useState(displayText);
   
    const [screenTip, setScreenTip] = useState(linkInfo.asc_getTooltip());
  
    const [curSheet, setSheet] = useState(linkSheet);

    const changeSheet = (sheet) => {
        setSheet(sheet);
    };

    const valueRange = valueLinkSheet ? linkInfo.asc_getRange() : '';
    const [range, setRange] = useState(valueRange || 'A1');
    const isDefinedName = curSheet && curSheet.type === 'name';
    const doneDisabled = typeLink === 1 && !link.length || typeLink === 2 && (!curSheet || (!isDefinedName && !range.length));

    return (
        <Page>
            <Navbar className="navbar-link-settings">
                <NavLeft>
                    <Link text={Device.ios ? t('View.Edit.textCancel') : ''} onClick={() => {
                        props.isNavigate ? f7.views.current.router.back() : props.closeModal();
                    }}>
                        {Device.android && 
                            <SvgIcon symbolId={IconClose.id} className={'icon icon-svg close'} />
                        }
                    </Link>
                </NavLeft>
                <NavTitle>{t('View.Edit.textLinkSettings')}</NavTitle>
                <NavRight>
                    <Link className={`${doneDisabled && 'disabled'}`} onClick={() => {
                        props.onEditLink(typeLink === 1 ?
                            {type: 1, url: link, text: stateDisplayText, tooltip: screenTip} :
                            {type: 2, url: isDefinedName ? curSheet.value : range, sheet: isDefinedName ? null : curSheet.caption, text: stateDisplayText, tooltip: screenTip, isDefinedName});
                    }} text={Device.ios ? t('View.Edit.textDone') : ''}>
                        {Device.android && (
                            doneDisabled ? 
                                <SvgIcon symbolId={IconDoneDisabled.id} className={'icon icon-svg inactive'} /> :
                                <SvgIcon symbolId={IconDone.id} className={'icon icon-svg active'} />
                        )}
                    </Link>
                </NavRight>
            </Navbar>

            <List inlineLabels className='inputs-list'>
                <ListItem link={'/edit-link-type/'} title={_t.textLinkType} after={textType} routeProps={{
                    changeType: changeType,
                    curType: typeLink
                }}/>
                {typeLink != Asc.c_oAscHyperlinkType.RangeLink &&
                    <ListInput label={_t.textLink}
                               type="text"
                               placeholder={_t.textLink}
                               value={link}
                               onChange={(event) => {setLink(event.target.value)}}
                               className={isIos ? 'list-input-right' : ''}
                    />
                }
                {typeLink == Asc.c_oAscHyperlinkType.RangeLink &&
                    <ListItem link={'/edit-link-sheet/'} title={_t.textLinkTo} after={curSheet ? curSheet.caption : ''} routeProps={{
                        changeSheet,
                        sheets,
                        curSheet
                    }}/>
                }
                {typeLink == Asc.c_oAscHyperlinkType.RangeLink && !isDefinedName &&
                    <ListInput label={_t.textRange}
                               type="text"
                               placeholder={_t.textRequired}
                               value={range}
                               onChange={(event) => {setRange(event.target.value)}}
                               disabled={!curSheet && 'disabled'}
                               className={isIos ? 'list-input-right' : ''}
                    />
                }
                <ListInput label={_t.textDisplay}
                           type="text"
                           placeholder={t('View.Edit.textRecommended')}
                           value={stateDisplayText}
                           disabled={isLock}
                           onChange={(event) => {setDisplayText(event.target.value)}}
                           className={isIos ? 'list-input-right' : ''}
                />
                <ListInput label={_t.textScreenTip}
                           type="text"
                           placeholder={_t.textScreenTip}
                           value={screenTip}
                           onChange={(event) => {setScreenTip(event.target.value)}}
                           className={isIos ? 'list-input-right' : ''}
                />
            </List>
            <List className="buttons-list">
                <ListButton 
                    title={t('View.Edit.textDeleteLink')}
                    className={`button-red button-fill button-raised`}
                    onClick={() => {
                        props.onRemoveLink();
                        props.isNavigate ? f7.views.current.router.back() : props.closeModal();
                    }}
                />
            </List>
        </Page>
    )
};

const _PageEditTypeLink = inject("storeFocusObjects")(observer(PageEditTypeLink));
const _PageEditSheet = inject("storeFocusObjects")(observer(PageEditSheet));

export {
    EditLink,
    _PageEditTypeLink as PageEditTypeLink,
    _PageEditSheet as PageEditSheet
};
