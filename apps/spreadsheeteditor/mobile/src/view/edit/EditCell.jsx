import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";
import {f7, List, ListItem, Icon, Row, Button, Page, Navbar, Segmented, BlockTitle, NavRight, Link} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';
import { ThemeColorPalette, CustomColorPicker } from '../../../../../common/mobile/lib/component/ThemeColorPalette.jsx';

const EditCell = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    // const metricText = Common.Utils.Metric.getCurrentMetricName();
    const storeCellSettings = props.storeCellSettings;
    const cellStyles = storeCellSettings.cellStyles;
    const styleName = storeCellSettings.styleName;
    console.log(styleName);
    console.log(cellStyles);
    console.log(storeCellSettings);

    const fontInfo = storeCellSettings.fontInfo;
    console.log(fontInfo);

    const fontName = fontInfo.name || _t.textFonts;
    const fontSize = fontInfo.size;
    const fontColor = storeCellSettings.fontColor;
    const displaySize = typeof fontSize === 'undefined' ? _t.textAuto : fontSize + ' ' + _t.textPt;
    const fillColor = storeCellSettings.fillColor;
    console.log(fillColor);

    const isBold = storeCellSettings.isBold;
    const isItalic = storeCellSettings.isItalic;
    const isUnderline = storeCellSettings.isUnderline;

    const fontColorPreview = fontColor !== 'auto' ?
        <span className="color-preview" style={{ background: `#${(typeof fontColor === "object" ? fontColor.color : fontColor)}`}}></span> :
        <span className="color-preview auto"></span>;
    
    const fillColorPreview = fillColor !== 'auto' ?
        <span className="color-preview" style={{ background: `#${(typeof fillColor === "object" ? fillColor.color : fillColor)}`}}></span> :
        <span className="color-preview auto"></span>;

    return (
        <Fragment>
            <List>
                <ListItem title={fontName} link="/edit-cell-text-fonts/" after={displaySize} routeProps={{
                    changeFontSize: props.changeFontSize,
                    changeFontFamily: props.changeFontFamily
                }}/>
                <ListItem className='buttons'>
                    <Row>
                        <a className={'button' + (isBold ? ' active' : '')} onClick={() => {props.toggleBold(!isBold)}}><b>B</b></a>
                        <a className={'button' + (isItalic ? ' active' : '')} onClick={() => {props.toggleItalic(!isItalic)}}><i>I</i></a>
                        <a className={'button' + (isUnderline ? ' active' : '')} onClick={() => {props.toggleUnderline(!isUnderline)}} style={{textDecoration: "underline"}}>U</a>
                    </Row>
                </ListItem>
                <ListItem title={_t.textTextColor} link="/edit-cell-text-color/" routeProps={{
                    onTextColor: props.onTextColor
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-color">{fontColorPreview}</Icon> :
                        fontColorPreview
                    }
                </ListItem>
                <ListItem title={_t.textFillColor} link="/edit-cell-fill-color/" routeProps={{
                    onFillColor: props.onFillColor
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-fill-color">{fillColorPreview}</Icon> :
                        fillColorPreview
                    }
                </ListItem>
                <ListItem title={_t.textTextFormat} link="/edit-cell-text-format/" routeProps={{
                    onTextColor: props.onTextColor
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-align-left"></Icon> : null
                    }
                </ListItem>
                <ListItem title={_t.textTextOrientation} link="/edit-cell-text-orientation/" routeProps={{
                    onTextColor: props.onTextColor
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-orientation-horizontal"></Icon> : null
                    }
                </ListItem>
                <ListItem title={_t.textBorderStyle} link="/edit-cell-border-style/" routeProps={{
                    onTextColor: props.onTextColor
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-table-borders-all"></Icon> : null
                    }
                </ListItem>
            </List>
            <List>
                <ListItem title={_t.textFormat} link="/edit-cell-format/" routeProps={{
                    onTextColor: props.onTextColor
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-format-general"></Icon> : null
                    }
                </ListItem>
            </List>
            <BlockTitle>{_t.textCellStyles}</BlockTitle>
            {cellStyles.length ? (
                <List className="cell-styles-list">
                    {cellStyles.map((elem, index) => {
                        return (
                            <ListItem key={index} style={{backgroundImage: `url(${elem.image})`}} 
                                className={elem.name === styleName ? "item-theme active" : "item-theme"} onClick={() => props.onStyleClick(elem.name)}>

                            </ListItem>
                        )
                    })}
                </List>
            ) : null}    
        </Fragment>
    )
};

const PageTextColorCell = props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });
    // const storeFocusObjects = props.storeFocusObjects;
    // const slideObject = storeFocusObjects.slideObject;
    const storePalette = props.storePalette;
    const storeCellSettings = props.storeCellSettings;
    const customColors = storePalette.customColors;
    const fontColor = storeCellSettings.fontColor;

    const changeColor = (color, effectId, effectValue) => {
        if (color !== 'empty') {
            if (effectId !== undefined ) {
                const newColor = {color: color, effectId: effectId, effectValue: effectValue};
                props.onTextColor(newColor);
                storeCellSettings.changeFontColor(newColor);
            } else {
                props.onTextColor(color);
                storeCellSettings.changeFontColor(color);
            }
        } else {
            // open custom color menu
            props.f7router.navigate('/edit-cell-text-custom-color/');
        }
    };
  
    return (
        <Page>
            <Navbar title={_t.textFill} backLink={_t.textBack}>
                <NavRight>
                    <Link icon='icon-expand-down' sheetClose></Link>
                </NavRight>
            </Navbar>
            <ThemeColorPalette changeColor={changeColor} curColor={fontColor} customColors={customColors} transparent={true} />
            <List>
                <ListItem title={_t.textAddCustomColor} link={'/edit-cell-text-custom-color/'} routeProps={{
                    onTextColor: props.onTextColor
                }}></ListItem>
            </List>
        </Page>
    );
};

const PageFillColorCell = props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });
    // const storeFocusObjects = props.storeFocusObjects;
    // const slideObject = storeFocusObjects.slideObject;
    const storePalette = props.storePalette;
    const storeCellSettings = props.storeCellSettings;
    const customColors = storePalette.customColors;
    const fillColor = storeCellSettings.fillColor;

    const changeColor = (color, effectId, effectValue) => {
        if (color !== 'empty') {
            if (effectId !== undefined ) {
                const newColor = {color: color, effectId: effectId, effectValue: effectValue};
                props.onFillColor(newColor);
                storeCellSettings.changeFillColor(newColor);
            } else {
                props.onFillColor(color);
                storeCellSettings.changeFillColor(color);
            }
        } else {
            // open custom color menu
            props.f7router.navigate('/edit-cell-fill-custom-color/');
        }
    };
  
    return (
        <Page>
            <Navbar title={_t.textFill} backLink={_t.textBack}>
                <NavRight>
                    <Link icon='icon-expand-down' sheetClose></Link>
                </NavRight>
            </Navbar>
            <ThemeColorPalette changeColor={changeColor} curColor={fillColor} customColors={customColors} transparent={true} />
            <List>
                <ListItem title={_t.textAddCustomColor} link={'/edit-cell-fill-custom-color/'} routeProps={{
                    onFillColor: props.onFillColor
                }}></ListItem>
            </List>
        </Page>
    );
};

const PageCustomTextColorCell = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    let fontColor = props.storeCellSettings.fontColor;

    if (typeof fontColor === 'object') {
        fontColor = fontColor.color;
    }

    const onAddNewColor = (colors, color) => {
        props.storePalette.changeCustomColors(colors);
        props.onTextColor(color);
        props.storeCellSettings.changeFontColor(color);
        props.f7router.back();
    };

    return (
        <Page>
            <Navbar title={_t.textCustomColor} backLink={_t.textBack} />
            <CustomColorPicker currentColor={fontColor} onAddNewColor={onAddNewColor} />
        </Page>
    )
};

const PageCustomFillColorCell = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    let fillColor = props.storeCellSettings.fillColor;

    if (typeof fillColor === 'object') {
        fillColor = fillColor.color;
    }

    const onAddNewColor = (colors, color) => {
        props.storePalette.changeCustomColors(colors);
        props.onFillColor(color);
        props.storeCellSettings.changeFillColor(color);
        props.f7router.back();
    };

    return (
        <Page>
            <Navbar title={_t.textCustomColor} backLink={_t.textBack} />
            <CustomColorPicker currentColor={fillColor} onAddNewColor={onAddNewColor} />
        </Page>
    )
};

const PageEditCell = inject("storeCellSettings")(observer(EditCell));
const TextColorCell = inject("storeCellSettings", "storePalette", "storeFocusObjects")(observer(PageTextColorCell));
const FillColorCell = inject("storeCellSettings", "storePalette", "storeFocusObjects")(observer(PageFillColorCell));
const CustomTextColorCell = inject("storeCellSettings", "storePalette", "storeFocusObjects")(observer(PageCustomTextColorCell));
const CustomFillColorCell = inject("storeCellSettings", "storePalette", "storeFocusObjects")(observer(PageCustomFillColorCell));

export {
    PageEditCell as EditCell,
    TextColorCell,
    FillColorCell,
    CustomFillColorCell,
    CustomTextColorCell
};