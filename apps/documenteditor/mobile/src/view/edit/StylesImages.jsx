import React, {Fragment, useEffect, useState } from 'react';
import {observer, inject} from "mobx-react";
import {f7, View, List, ListItem, Icon, Row, Button, Page, Navbar, NavRight, Segmented, BlockTitle, Link, ListButton, Toggle, Actions, ActionsButton, ActionsGroup} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';

const StylesImages = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const api = Common.EditorApi.get();
    const propsTableContents = api.asc_GetTableOfContentsPr();
    const [type, setType] = useState(0);
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
    const [styleValue, setStyleValue] = useState(propsTableContents.get_StylesType());

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
            {/* <List> */}
                {arrStyles.map((style, index) => {
                    return (
                        <div key={index}>
                            <BlockTitle>{style.displayValue}</BlockTitle>
                            <div id={`image-style${index}`}></div>
                        </div>
                    )
                })}
            {/* </List> */}
        </Page>
    )

       {/* <ListItem key={index} radio title={style.displayValue} value={style.value} checked={style.value === styleValue} onClick={() => {
                            setStyleValue(style.value); 
                            props.setStyleValue(style.value);
                            props.onStyle(style.value)
                        }}></ListItem> */}
}

export default StylesImages;