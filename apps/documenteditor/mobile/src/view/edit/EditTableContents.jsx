import React, {Fragment, useEffect, useState } from 'react';
import {observer, inject} from "mobx-react";
import {f7, View, List, ListItem, Icon, Row, Button, Page, Navbar, NavRight, Segmented, BlockTitle, Link, ListButton, Toggle, Actions, ActionsButton, ActionsGroup} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';
import SvgIcon from '@common/lib/component/SvgIcon';
import IconExpandDownAndroid from '@common-android-icons/icon-expand-down.svg';
import IconExpandDownIos from '@common-ios-icons/icon-expand-down.svg?ios';
import IconExpandUp from '@common-android-icons/icon-expand-up.svg';

const EditTableContents = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const api = Common.EditorApi.get();
    const propsTableContents = api.asc_GetTableOfContentsPr();
    const stylesCount = propsTableContents.get_StylesCount();
    const [type, setType] = useState(0);
    const [styleValue, setStyleValue] = useState(propsTableContents.get_StylesType());
    const [pageNumbers, setPageNumbers] = useState(propsTableContents.get_ShowPageNumbers());
    const [rightAlign, setRightAlign] = useState(propsTableContents.get_RightAlignTab());
    const [leaderValue, setLeaderValue] = useState(propsTableContents.get_TabLeader() ? propsTableContents.get_TabLeader() : Asc.c_oAscTabLeader.Dot);

    const arrStyles = (type === 1) ? [
        { displayValue: t('Edit.textCurrent'),     value: Asc.c_oAscTOFStylesType.Current },
        { displayValue: t('Edit.textSimple'),     value: Asc.c_oAscTOFStylesType.Simple },
        { displayValue: t('Edit.textOnline'),     value: Asc.c_oAscTOFStylesType.Web },
        { displayValue: t('Edit.textClassic'),     value: Asc.c_oAscTOFStylesType.Classic },
        { displayValue: t('Edit.textDistinctive'),     value: Asc.c_oAscTOFStylesType.Distinctive },
        { displayValue: t('Edit.textCentered'),     value: Asc.c_oAscTOFStylesType.Centered },
        { displayValue: t('Edit.textFormal'),     value: Asc.c_oAscTOFStylesType.Formal }
    ] : [
        { displayValue: t('Edit.textSimple'),     value: Asc.c_oAscTOCStylesType.Simple },
        { displayValue: t('Edit.textOnline'),     value: Asc.c_oAscTOCStylesType.Web },
        { displayValue: t('Edit.textStandard'),     value: Asc.c_oAscTOCStylesType.Standard },
        { displayValue: t('Edit.textModern'),     value: Asc.c_oAscTOCStylesType.Modern },
        { displayValue: t('Edit.textClassic'),     value: Asc.c_oAscTOCStylesType.Classic }
    ];

    const arrLeaders = [
        { value: Asc.c_oAscTabLeader.None,      displayValue: t('Edit.textNone') },
        { value: Asc.c_oAscTabLeader.Dot,       displayValue: '....................' },
        { value: Asc.c_oAscTabLeader.Hyphen,    displayValue: '-----------------' },
        { value: Asc.c_oAscTabLeader.Underscore,displayValue: '__________' }
    ];

    const activeStyle = arrStyles.find(style => style.value === styleValue);
    const activeLeader = arrLeaders.find(leader => leader.value === leaderValue);

    const openActionsButtonsRefresh = () => {
        f7.actions.create({
            buttons: [
                [
                  {
                    text: t('Edit.textRefreshEntireTable'),
                    onClick: () => props.onUpdateTableContents('all')
                  },
                  {
                    text: t('Edit.textRefreshPageNumbersOnly'),
                    onClick: () => props.onUpdateTableContents('pages')
                  }
                ],
                [
                  {
                    text: t('Edit.textCancel'),
                    bold: true
                  }
                ]
              ]
        }).open();
    }

    return (
        <Fragment>
            <List>
                <ListItem title={t('Edit.textStyle')} link="/edit-style-table-contents/" after={activeStyle ? activeStyle.displayValue : ''} routeProps={{
                    onStyle: props.onStyle, 
                    arrStyles,
                    setStyleValue,
                    styleValue,
                    getStylesImages: props.getStylesImages
                }}></ListItem>
            </List>
            <List>
                <ListItem>
                    <span>{t('Edit.textPageNumbers')}</span>
                    <Toggle checked={pageNumbers} onToggleChange={() => {
                        setPageNumbers(!pageNumbers);
                        props.onPageNumbers(!pageNumbers);
                    }}></Toggle>
                </ListItem>
                {pageNumbers && 
                    <ListItem>
                        <span>{t('Edit.textRightAlign')}</span>
                        <Toggle checked={rightAlign} onToggleChange={() => {
                            setRightAlign(!rightAlign);
                            props.onRightAlign(!rightAlign);
                        }}></Toggle>
                    </ListItem>
                }
                {(pageNumbers && rightAlign) &&
                    <ListItem title={t('Edit.textLeader')} link="/edit-leader-table-contents/" 
                        after={activeLeader ? activeLeader.displayValue : arrLeaders[0].displayValue} routeProps={{
                        onLeader: props.onLeader,
                        arrLeaders,
                        leaderValue,
                        setLeaderValue
                    }}></ListItem>
                }
                <ListItem title={t('Edit.textStructure')} link="/edit-structure-table-contents/" after={stylesCount ? t('Edit.textStyles') : t('Edit.textLevels')} routeProps={{
                    onLevelsChange: props.onLevelsChange,
                    fillTOCProps: props.fillTOCProps,
                    addStyles: props.addStyles
                }}></ListItem>
            </List>
            <List className="buttons-list">
                <ListButton className={'button-fill button-raised'} title={t('Edit.textRefresh')} 
                    onClick={() => openActionsButtonsRefresh()} />
                <ListButton className='button-red button-fill button-raised' title={t('Edit.textRemoveTableContent')} onClick={() => props.onRemoveTableContents()} />
            </List>
        </Fragment>
    )
};

const PageEditStylesTableContents = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const [styleValue, setStyleValue] = useState(props.styleValue);
    const widthImage = !Device.phone ? '330px' :  window.innerWidth - 30 + 'px';

    useEffect(() => {
        props.getStylesImages();
    }, []);

    return (
        <Page>
            <Navbar title={_t.textStyle} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg white'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                {props.arrStyles.map((style, index) => {
                    return (
                        <div className='style-toc' key={index} onClick={() => {
                            setStyleValue(style.value); 
                            props.setStyleValue(style.value);
                            props.onStyle(style.value)
                        }}>
                            <BlockTitle>{style.displayValue}</BlockTitle>
                            <div className={'style-toc__image ' + (style.value === styleValue ? 'style-toc__image_active' : '')}> 
                                <canvas style={{width: widthImage, height: '10px'}} id={`image-toc-style${index}`}></canvas>
                            </div>
                        </div>
                    )
                })}
            </List>
        </Page>
    )
}

const PageEditLeaderTableContents = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const [leaderValue, setLeaderValue] = useState(props.leaderValue);

    return (
        <Page>
            <Navbar title={t('Edit.textLeader')} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg white'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                {props.arrLeaders.map((leader, index) => {
                    return (
                        <ListItem key={index} radio title={leader.displayValue} checked={leaderValue === leader.value} onClick={() => {
                            setLeaderValue(leader.value);
                            props.setLeaderValue(leader.value);
                            props.onLeader(leader.value);
                        }}></ListItem>
                    )
                })}
            </List>
        </Page>
    )
}

const PageEditStructureTableContents = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const isAndroid = Device.android;
    const api = Common.EditorApi.get();
    const propsTableContents = api.asc_GetTableOfContentsPr();
    const {styles, end, count} = props.fillTOCProps(propsTableContents);
    const chosenStyles = styles.filter(style => style.checked);
    
    const [structure, setStructure] = useState(count ? 1 : 0);
    const [amountLevels, setAmountLevels] = useState(end);

    const addNewStyle = (style) => {
        let indexStyle = chosenStyles.findIndex(currentStyle => currentStyle.name === style.name);

        if(indexStyle === -1) { 
            chosenStyles.push(style); 
        }
    }

    return (
        <Page>
            <Navbar title={t('Edit.textStructure')} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg white'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem radio checked={structure === 0} title={t('Edit.textLevels')} onClick={() => setStructure(0)}></ListItem>
                <ListItem radio checked={structure === 1} title={t('Edit.textStyles')} onClick={() => setStructure(1)}></ListItem>
            </List>
            {structure === 0 ?
                <List>
                    <ListItem title={t('Edit.textAmountOfLevels')}>
                        {!isAndroid && <div slot='after-start'>{amountLevels === -1 ? '-' : amountLevels}</div>}
                        <div slot='after'>
                            <Segmented>
                                <Button outline className='decrement item-link' onClick={() => {
                                    if(amountLevels > 1) {
                                        setAmountLevels(amountLevels - 1); 
                                        props.onLevelsChange(amountLevels - 1);
                                    }
                                }}>
                                    {isAndroid ? 
                                        <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                                    : ' - '}
                                </Button>
                                {isAndroid && <label>{amountLevels === -1 ? '-' : amountLevels}</label>}
                                <Button outline className='increment item-link' onClick={() => {
                                    if(amountLevels < 9) {
                                        if(amountLevels === -1) {
                                            setAmountLevels(9); 
                                            props.onLevelsChange(9);
                                        } else {
                                            setAmountLevels(amountLevels + 1); 
                                            props.onLevelsChange(amountLevels + 1);
                                        }
                                    }
                                }}>
                                    {isAndroid ? 
                                        <SvgIcon symbolId={IconExpandUp.id} className={'icon icon-svg'} />
                                    : ' + '}
                                </Button>
                            </Segmented>
                        </div>
                    </ListItem>
                </List>
            : 
                <List>
                    {styles.map((style, index) => {
                        return (
                            <ListItem checkbox key={index} title={style.displayValue} checked={style.checked && style.value >= 1}>
                                {!isAndroid && <div slot='after-start'>{style.value === 0 ? '' : style.value}</div>}
                                <div slot='after'>
                                    <Segmented>
                                        <Button outline className='decrement item-link' onClick={() => {
                                            if(style.value >= 1) {
                                                setAmountLevels(-1);
                                                addNewStyle(style);
                                                props.addStyles(chosenStyles, style.name, style.value - 1);
                                            }
                                        }}>
                                            {isAndroid ? 
                                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                                            : ' - '}
                                        </Button>
                                        {isAndroid && <label>{style.value === 0 ? '' : style.value}</label>}
                                        <Button outline className='increment item-link' onClick={() => {
                                            if(style.value < 9) {
                                                setAmountLevels(-1);
                                                addNewStyle(style);
                                                props.addStyles(chosenStyles, style.name, style.value + 1);
                                            }
                                        }}>
                                            {isAndroid ? 
                                                <SvgIcon symbolId={IconExpandUp.id} className={'icon icon-svg'} />
                                            : ' + '}
                                        </Button>
                                    </Segmented>
                                </div>
                            </ListItem>
                        )
                    })}
                </List>
            }
        </Page>
    )
}

export {
    EditTableContents,
    PageEditStylesTableContents,
    PageEditLeaderTableContents,
    PageEditStructureTableContents
};