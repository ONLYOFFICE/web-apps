import React, {Fragment, useState} from 'react';
import {Page, Navbar, BlockTitle, List, ListItem, ListInput, ListButton, Icon, Link, NavLeft, NavRight, NavTitle, f7} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from "../../../../../common/mobile/utils/device";

const PageTypeLink = ({curType, changeType}) => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const [typeLink, setTypeLink] = useState(curType);

    return (
        <Page>
            <Navbar className="navbar-link-settings" title={_t.textLinkType} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-close' popupClose="#add-link-popup"></Link>
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

const PageSheet = ({curSheet, sheets, changeSheet}) => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const [stateSheet, setSheet] = useState(curSheet.value);

    return (
        <Page>
            <Navbar className="navbar-link-settings" title={_t.textSheet} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-close' popupClose="#add-link-popup"></Link>
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
                        props.isNavigate ? f7.views.current.router.back() : props.closeModal();
                    }}>
                        {Device.android && <Icon icon='icon-close' />}
                    </Link>
                </NavLeft>
                <NavTitle>{t('View.Add.textLinkSettings')}</NavTitle>
                <NavRight>
                    <Link className={`${(typeLink === 'ext' && link.length < 1 || typeLink === 'int' && range.length < 1) && 'disabled'}`} onClick={() => {
                        props.onInsertLink(typeLink === 'ext' ?
                            {type: 'ext', url: link, text: stateDisplayText} :
                            {type: 'int', url: range, sheet: curSheet.caption, text: stateDisplayText});
                        }} text={Device.ios ? t('View.Add.textDone') : ''}>
                        {Device.android && <Icon icon={link.length < 1 ? 'icon-done-disabled' : 'icon-done'} />}
                    </Link>
                </NavRight>
            </Navbar>
            <List inlineLabels className='inputs-list'>
                {props.allowInternal &&
                    <ListItem link={'/add-link-type/'} title={_t.textLinkType} after={textType} routeProps={{
                        changeType: changeType,
                        curType: typeLink
                    }}/>
                }
                {typeLink === 'ext' &&
                    <ListInput label={_t.textLink}
                               type="text"
                               placeholder={_t.textRequired}
                               value={link}
                               onChange={(event) => {
                                setLink(event.target.value);
                                if(stateAutoUpdate && !displayDisabled) setDisplayText(event.target.value);
                            }}
                               className={isIos ? 'list-input-right' : ''}
                    />
                }
                {typeLink === 'int' &&
                    <ListItem link={'/add-link-sheet/'} title={_t.textSheet} after={curSheet.caption} routeProps={{
                        changeSheet: changeSheet,
                        sheets: props.sheets,
                        curSheet: curSheet
                    }}/>
                }
                {typeLink === 'int' &&
                    <ListInput label={_t.textRange}
                               type="text"
                               placeholder={_t.textRequired}
                               value={range}
                               onChange={(event) => {setRange(event.target.value)}}
                               className={isIos ? 'list-input-right' : ''}
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
        </Page>
    )
};

export {AddLink, PageTypeLink, PageSheet};