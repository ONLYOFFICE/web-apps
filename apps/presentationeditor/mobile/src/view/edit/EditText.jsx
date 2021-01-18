import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";
import {f7, List, ListItem, Icon, Row, Button, Page, Navbar, Segmented, BlockTitle} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';
import { ThemeColorPalette, CustomColorPicker } from '../../../../../common/mobile/lib/component/ThemeColorPalette.jsx';

const EditText = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const metricText = Common.Utils.Metric.getCurrentMetricName();
    const storeTextSettings = props.storeTextSettings;
    const storeFocusObjects = props.storeFocusObjects;
    const fontName = storeTextSettings.fontName || _t.textFonts;
    const fontSize = storeTextSettings.fontSize;
    const fontColor = storeTextSettings.textColor;
    const displaySize = typeof fontSize === 'undefined' ? _t.textAuto : fontSize + ' ' + _t.textPt;
    const isBold = storeTextSettings.isBold;
    const isItalic = storeTextSettings.isItalic;
    const isUnderline = storeTextSettings.isUnderline;
    const isStrikethrough = storeTextSettings.isStrikethrough;
    const paragraphAlign = storeTextSettings.paragraphAlign;
    const paragraphValign = storeTextSettings.paragraphValign;
    const canIncreaseIndent = storeTextSettings.canIncreaseIndent;
    const canDecreaseIndent = storeTextSettings.canDecreaseIndent;

    const paragraphObj = storeFocusObjects.paragraphObject;

    // if (paragraphObj.get_Ind()===null || paragraphObj.get_Ind()===undefined) {
    //     paragraphObj.get_Ind().put_FirstLine(0);
    // }

    // const firstLine = parseFloat(Common.Utils.Metric.fnRecalcFromMM(paragraphObj.get_Ind().get_FirstLine()).toFixed(2));

    const spaceBefore = paragraphObj.get_Spacing().get_Before() < 0 ? paragraphObj.get_Spacing().get_Before() : Common.Utils.Metric.fnRecalcFromMM(paragraphObj.get_Spacing().get_Before());
    const spaceAfter  = paragraphObj.get_Spacing().get_After() < 0 ? paragraphObj.get_Spacing().get_After() : Common.Utils.Metric.fnRecalcFromMM(paragraphObj.get_Spacing().get_After());

    const spaceBeforeFix = parseFloat(spaceBefore.toFixed(2));
    const spaceAfterFix = parseFloat(spaceAfter.toFixed(2));

    const displayBefore = spaceBefore < 0 ? _t.textAuto : spaceBeforeFix + ' ' + metricText;
    const displayAfter = spaceAfter < 0 ? _t.textAuto : spaceAfterFix + ' ' + metricText;

    const fontColorPreview = fontColor !== 'auto' ?
        <span className="color-preview" style={{ background: `#${(typeof fontColor === "object" ? fontColor.color : fontColor)}`}}></span> :
        <span className="color-preview auto"></span>;

    return (
        <Fragment>
            <List>
                <ListItem title={fontName} link="/edit-text-fonts/" after={displaySize} routeProps={{
                    changeFontSize: props.changeFontSize,
                    changeFontFamily: props.changeFontFamily
                }}/>
                <ListItem className='buttons'>
                    <Row>
                        <a className={'button' + (isBold ? ' active' : '')} onClick={() => { props.toggleBold(!isBold)}}><b>B</b></a>
                        <a className={'button' + (isItalic ? ' active' : '')} onClick={() => {props.toggleItalic(!isItalic)}}><i>I</i></a>
                        <a className={'button' + (isUnderline ? ' active' : '')} onClick={() => {props.toggleUnderline(!isUnderline)}} style={{textDecoration: "underline"}}>U</a>
                        <a className={'button' + (isStrikethrough ? ' active' : '')} onClick={() => {props.toggleStrikethrough(!isStrikethrough)}} style={{textDecoration: "line-through"}}>S</a>
                    </Row>
                </ListItem>
                <ListItem title={_t.textFontColor} link="/edit-text-font-color/" routeProps={{
                    onTextColorAuto: props.onTextColorAuto,
                    onTextColor: props.onTextColor
                }}>
                    {!isAndroid ?
                        <Icon slot="media" icon="icon-text-color">{fontColorPreview}</Icon> :
                        fontColorPreview
                    }
                </ListItem>
                <ListItem title={_t.textAdditionalFormatting} link="/edit-text-add-formatting/" routeProps={{
                    onAdditionalStrikethrough: props.onAdditionalStrikethrough,
                    onAdditionalCaps: props.onAdditionalCaps,
                    onAdditionalScript: props.onAdditionalScript,
                    changeLetterSpacing: props.changeLetterSpacing
                }}>
                    {!isAndroid && <Icon slot="media" icon="icon-text-additional"></Icon>}
                </ListItem>
            </List>
            <List>
                <ListItem className='buttons'>
                    <Row>
                        <a className={'button' + (paragraphAlign === 'left' ? ' active' : '')} onClick={() => {props.onParagraphAlign('left')}}>
                            <Icon slot="media" icon="icon-text-align-left"></Icon>
                        </a>
                        <a className={'button' + (paragraphAlign === 'center' ? ' active' : '')} onClick={() => {props.onParagraphAlign('center')}}>
                            <Icon slot="media" icon="icon-text-align-center"></Icon>
                        </a>
                        <a className={'button' + (paragraphAlign === 'right' ? ' active' : '')} onClick={() => {props.onParagraphAlign('right')}}>
                            <Icon slot="media" icon="icon-text-align-right"></Icon>
                        </a>
                        <a className={'button' + (paragraphAlign === 'just' ? ' active' : '')} onClick={() => {props.onParagraphAlign('just')}}>
                            <Icon slot="media" icon="icon-text-align-just"></Icon>
                        </a>
                    </Row>
                </ListItem>
                <ListItem className='buttons'>
                    <Row>
                        <a className={'button' + (paragraphValign === 'top' ? ' active' : '')} onClick={() => {props.onParagraphValign('top')}}>
                            <Icon slot="media" icon="icon-text-valign-top"></Icon>
                        </a>
                        <a className={'button' + (paragraphValign === 'center' ? ' active' : '')} onClick={() => {props.onParagraphValign('center')}}>
                            <Icon slot="media" icon="icon-text-valign-middle"></Icon>
                        </a>
                        <a className={'button' + (paragraphValign === 'bottom' ? ' active' : '')} onClick={() => {props.onParagraphValign('bottom')}}>
                            <Icon slot="media" icon="icon-text-valign-bottom"></Icon>
                        </a>
                    </Row>
                </ListItem>
                <ListItem className='buttons'>
                    <Row>
                        <a className={'button item-link' + (!canDecreaseIndent ? ' disabled' : '') } onClick={() => {props.onParagraphMove('left')}}>
                            <Icon slot="media" icon="icon-de-indent"></Icon>
                        </a>
                        <a className={'button item-link' + (!canIncreaseIndent ? ' disabled' : '') } onClick={() => {props.onParagraphMove('right')}}>
                            <Icon slot="media" icon="icon-in-indent"></Icon>
                        </a>
                    </Row>
                </ListItem>
                <ListItem title={_t.textBullets} link='/edit-text-bullets/' routeProps={{
                    onBullet: props.onBullet
                }}>
                    {!isAndroid && <Icon slot="media" icon="icon-bullets"></Icon>}
                </ListItem>
                <ListItem title={_t.textNumbers} link='/edit-text-numbers/' routeProps={{
                    onNumber: props.onNumber
                }}>
                    {!isAndroid && <Icon slot="media" icon="icon-numbers"></Icon>}
                </ListItem>
                <ListItem title={_t.textLineSpacing} link='/edit-text-line-spacing/' routeProps={{
                    onLineSpacing: props.onLineSpacing
                }}>
                    {!isAndroid && <Icon slot="media" icon="icon-linespacing"></Icon>}
                </ListItem>
            </List>
            <BlockTitle>{_t.textDistanceFromText}</BlockTitle>
            <List>
                <ListItem title={_t.textBefore}>
                    {!isAndroid && <div slot='after-start'>{displayBefore}</div>}
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='decrement item-link' onClick={() => {props.onDistanceBefore(spaceBefore, true)}}>
                                {isAndroid ? <Icon icon="icon-expand-down"></Icon> : ' - '}
                            </Button>
                            {isAndroid && <label>{displayBefore}</label>}
                            <Button outline className='increment item-link' onClick={() => {props.onDistanceBefore(spaceBefore, false)}}>
                                {isAndroid ? <Icon icon="icon-expand-up"></Icon> : ' + '}
                            </Button>
                        </Segmented>
                    </div>
                </ListItem>
                <ListItem title={_t.textAfter}>
                    {!isAndroid && <div slot='after-start'>{displayAfter}</div>}
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='decrement item-link' onClick={() => {props.onDistanceAfter(spaceAfter, true)}}>
                                {isAndroid ? <Icon icon="icon-expand-down"></Icon> : ' - '}
                            </Button>
                            {isAndroid && <label>{displayAfter}</label>}
                            <Button outline className='increment item-link' onClick={() => {props.onDistanceAfter(spaceAfter, false)}}>
                                {isAndroid ? <Icon icon="icon-expand-up"></Icon> : ' + '}
                            </Button>
                        </Segmented>
                    </div>
                </ListItem>
            </List>
        </Fragment>
    )
};

const EditTextContainer = inject("storeTextSettings", "storeFocusObjects")(observer(EditText));

export {
    EditTextContainer as EditText
};