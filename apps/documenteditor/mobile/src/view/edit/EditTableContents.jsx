import React, {Fragment, useEffect, useState } from 'react';
import {observer, inject} from "mobx-react";
import {f7, View, List, ListItem, Icon, Row, Button, Page, Navbar, NavRight, Segmented, BlockTitle, Link, ListButton, Toggle, Actions, ActionsButton, ActionsGroup} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';

const EditTableContents = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const api = Common.EditorApi.get();
    const propsTableContents = api.asc_GetTableOfContentsPr();
    console.log(propsTableContents);
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
        { displayValue: t('Edit.textCurrent'),     value: Asc.c_oAscTOCStylesType.Current },
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
                    onClick: () => props.onTableContentsUpdate('all')
                  },
                  {
                    text: t('Edit.textRefreshPageNumbersOnly'),
                    onClick: () => props.onTableContentsUpdate('pages')
                  }
                ],
                [
                  {
                    text: t('Edit.textCancel'),
                    bold: true
                  }
                ]
              ]
        }).open()
    }

    return (
        <Fragment>
            <List>
                <ListItem title={t('Edit.textStyle')} link="/edit-style-table-contents/" after={activeStyle.displayValue} routeProps={{
                    onStyle: props.onStyle, 
                    arrStyles,
                    setStyleValue,
                    styleValue
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
                <ListItem title={t('Edit.textStructure')} link="/edit-table-contents-structure/" after={t('Edit.textLevels')}></ListItem>
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

    return (
        <Page>
            <Navbar title={_t.textStyle} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                {props.arrStyles.map((style, index) => {
                    return (
                        <ListItem key={index} radio title={style.displayValue} value={style.value} checked={style.value === styleValue} onClick={() => {
                            setStyleValue(style.value); 
                            props.setStyleValue(style.value);
                            props.onStyle(style.value)
                        }}></ListItem>
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
                            <Icon icon='icon-expand-down'/>
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

export {
    EditTableContents,
    PageEditStylesTableContents,
    PageEditLeaderTableContents
};