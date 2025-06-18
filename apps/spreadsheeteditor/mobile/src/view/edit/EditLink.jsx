import React, {useState, useEffect, Fragment} from 'react';
import {observer, inject} from "mobx-react";
import {f7, List, ListItem, Page, Navbar, NavRight, Icon, ListButton, ListInput, Link, NavLeft, NavTitle} from 'framework7-react';
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
    const [stateSheet, setSheet] = useState(curSheet);

    const settings = !storeFocusObjects.focusOn ? [] : (storeFocusObjects.focusOn === 'obj' ? storeFocusObjects.objects : storeFocusObjects.selections);
    if (storeFocusObjects.focusOn === 'obj' || settings.indexOf('hyperlink') === -1) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page>
            <Navbar className="navbar-link-settings" title={_t.textSheet} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-close' popupClose="#edit-link-popup"></Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                {sheets.map(sheet => {
                    return(
                        <ListItem 
                            key={`sheet-${sheet.value}`}
                            title={sheet.caption}
                            radio
                            checked={stateSheet === sheet.caption}
                            onChange={() => {
                                setSheet(sheet.caption);
                                changeSheet(sheet.caption);
                            }}
                        />
                    )
                })}

            </List>
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
    const getLinkSheet = () => sheets.find(sheet => sheet.caption === valueLinkSheet);
    const linkSheet = (valueTypeLink == Asc.c_oAscHyperlinkType.RangeLink) ? getLinkSheet() ? getLinkSheet().caption : '' : currentSheet;

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

    const valueRange = linkInfo.asc_getRange();
    const [range, setRange] = useState(valueRange || 'A1');

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
                    <Link className={`${(typeLink === 1 && !link.length) || (typeLink === 2 && (!range.length || !curSheet.length)) && 'disabled'}`} onClick={() => {
                        props.onEditLink(typeLink === 1 ?
                            {type: 1, url: link, text: stateDisplayText, tooltip: screenTip} :
                            {type: 2, url: range, sheet: curSheet, text: stateDisplayText, tooltip: screenTip});
                    }} text={Device.ios ? t('View.Edit.textDone') : ''}>
                        {Device.android && (
                            link.length < 1 ? 
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
                    <ListItem link={'/edit-link-sheet/'} title={_t.textSheet} after={curSheet} routeProps={{
                        changeSheet,
                        sheets,
                        curSheet
                    }}/>
                }
                {typeLink == Asc.c_oAscHyperlinkType.RangeLink &&
                    <ListInput label={_t.textRange}
                               type="text"
                               placeholder={_t.textRequired}
                               value={range}
                               onChange={(event) => {setRange(event.target.value)}}
                               disabled={curSheet === '' && 'disabled'}
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