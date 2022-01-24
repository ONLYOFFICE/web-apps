import React, {Fragment, useEffect, useState } from 'react';
import {observer, inject} from "mobx-react";
import {f7, View, List, ListItem, Icon, Row, Button, Page, Navbar, NavRight, Segmented, BlockTitle, Link, ListButton, Toggle} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';

const EditTableContents = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const api = Common.EditorApi.get();
    const propsTableContents = api.asc_GetTableOfContentsPr();
    console.log(propsTableContents);
    const storeTableContent = props.storeTableContent;
    const type = storeTableContent.type;
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

    const activeStyle = arrStyles.find(style => style.value === propsTableContents.get_StylesType());

    return (
        <Fragment>
            <List>
                <ListItem title={t('Edit.textStyle')} link="/edit-style-table-contents/" after={activeStyle.displayValue} routeProps={{onStyle: props.onStyle, arrStyles}}></ListItem>
            </List>
            <List>
                <ListItem>
                    <span>{t('Edit.textPageNumbers')}</span>
                    <Toggle defaultChecked></Toggle>
                </ListItem>
                <ListItem>
                    <span>{t('Edit.textRightAlign')}</span>
                    <Toggle defaultChecked></Toggle>
                </ListItem>
                <ListItem title={t('Edit.textLeader')} link="/edit-table-contents-leader" after=""></ListItem>
                <ListItem title={t('Edit.textStructure')} link="/edit-table-contents-structure/" after={t('Edit.textLevels')}></ListItem>
            </List>
            <List className="buttons-list">
                <ListButton className={'button-fill button-raised'} title={t('Edit.textRefresh')} />
                <ListButton className='button-red button-fill button-raised' title={t('Edit.textRemoveTableContent')} />
            </List>
        </Fragment>
    )
};

const PageEditStylesTableContents = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const api = Common.EditorApi.get();
    const propsTableContents = api.asc_GetTableOfContentsPr();
    const storeTableContent = props.storeTableContent;
    const type = storeTableContent.type;
    const [styleValue, setStyleValue] = useState(propsTableContents.get_StylesType());
    // const styleValue = propsTableContents.get_StylesType();
    console.log(styleValue);

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
                        <ListItem key={index} radio title={style.displayValue} value={style.value} checked={style.value === styleValue} onClick={() => {setStyleValue(style.value); props.onStyle(style.value, type)}}></ListItem>
                    )
                })}
            </List>
        </Page>
    )
}

const EditTableContentsContainer = inject("storeTableContent")(observer(EditTableContents));
const EditStylesTableContents = inject("storeTableContent")(observer(PageEditStylesTableContents));

export {
    EditTableContentsContainer as EditTableContents,
    EditStylesTableContents
};