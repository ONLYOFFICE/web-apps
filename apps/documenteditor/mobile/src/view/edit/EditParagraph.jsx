import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";
import {f7, List, ListItem, Icon, Button, Page, Navbar, NavRight, Segmented, BlockTitle, Toggle, Link} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';
import { ThemeColorPalette, CustomColorPicker } from '../../../../../common/mobile/lib/component/ThemeColorPalette.jsx';

const PageAdvancedSettings = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const metricText = Common.Utils.Metric.getCurrentMetricName();
    const storeFocusObjects = props.storeFocusObjects;
    const paragraphObj = storeFocusObjects.paragraphObject;
    let firstLine, spaceBefore, spaceAfter, spaceBeforeFix, spaceAfterFix, displayBefore, displayAfter, spaceBetween, breakBefore, orphanControl, keepTogether, keepWithNext;
    if (paragraphObj) {
        if (paragraphObj.get_Ind()===null || paragraphObj.get_Ind()===undefined) {
            paragraphObj.get_Ind().put_FirstLine(0);
        }
        firstLine = parseFloat(Common.Utils.Metric.fnRecalcFromMM(paragraphObj.get_Ind().get_FirstLine()).toFixed(2));

        spaceBefore = paragraphObj.get_Spacing().get_Before() < 0 ? paragraphObj.get_Spacing().get_Before() : Common.Utils.Metric.fnRecalcFromMM(paragraphObj.get_Spacing().get_Before());
        spaceAfter  = paragraphObj.get_Spacing().get_After() < 0 ? paragraphObj.get_Spacing().get_After() : Common.Utils.Metric.fnRecalcFromMM(paragraphObj.get_Spacing().get_After());
        spaceBeforeFix = parseFloat(spaceBefore.toFixed(2));
        spaceAfterFix = parseFloat(spaceAfter.toFixed(2));
        displayBefore = spaceBefore < 0 ? t('Edit.textAuto') : spaceBeforeFix + ' ' + metricText;
        displayAfter = spaceAfter < 0 ? t('Edit.textAuto') : spaceAfterFix + ' ' + metricText;

        spaceBetween = paragraphObj.get_ContextualSpacing();
        breakBefore = paragraphObj.get_PageBreakBefore();
        orphanControl = paragraphObj.get_WidowControl();
        keepTogether = paragraphObj.get_KeepLines();
        keepWithNext = paragraphObj.get_KeepNext();
    } else {
        if (Device.phone) {
            $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
            return null;
        }
    }
    return(
        <Page>
            <Navbar title={t('Edit.textAdvanced')} backLink={t('Edit.textBack')}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <BlockTitle>{t('Edit.textDistanceFromText')}</BlockTitle>
            <List>
                <ListItem title={t('Edit.textBefore')}>
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
                <ListItem title={t('Edit.textAfter')}>
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
                <ListItem title={t('Edit.textFirstLine')}>
                    {!isAndroid && <div slot='after-start'>{firstLine + ' ' + metricText}</div>}
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='decrement item-link' onClick={() => {props.onSpinFirstLine(paragraphObj, true)}}>
                                {isAndroid ? <Icon icon="icon-expand-down"></Icon> : ' - '}
                            </Button>
                            {isAndroid && <label>{firstLine + ' ' + metricText}</label>}
                            <Button outline className='increment item-link' onClick={() => {props.onSpinFirstLine(paragraphObj, false)}}>
                                {isAndroid ? <Icon icon="icon-expand-up"></Icon> : ' + '}
                            </Button>
                        </Segmented>
                    </div>
                </ListItem>
            </List>
            <List>
                <ListItem title={t('Edit.textSpaceBetweenParagraphs')}>
                    <Toggle checked={spaceBetween} onChange={() => {props.onSpaceBetween(!spaceBetween)}}/>
                </ListItem>
            </List>
            <List>
                <ListItem title={t('Edit.textPageBreakBefore')}>
                    <Toggle checked={breakBefore} onChange={() => {props.onBreakBefore(!breakBefore)}}/>
                </ListItem>
                <ListItem title={t('Edit.textOrphanControl')}>
                    <Toggle checked={orphanControl} onChange={() => {props.onOrphan(!orphanControl)}}/>
                </ListItem>
                <ListItem title={t('Edit.textKeepLinesTogether')}>
                    <Toggle checked={keepTogether} onChange={() => {props.onKeepTogether(!keepTogether)}}/>
                </ListItem>
                <ListItem title={t('Edit.textKeepWithNext')}>
                    <Toggle checked={keepWithNext} onChange={() => {props.onKeepNext(!keepWithNext)}}/>
                </ListItem>
            </List>
        </Page>
    )
};

const PageCustomBackColor = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    let backgroundColor = props.storeParagraphSettings.backColor;
    if (typeof backgroundColor === 'object') {
        backgroundColor = backgroundColor.color;
    }
    const onAddNewColor = (colors, color) => {
        props.storePalette.changeCustomColors(colors);
        props.onBackgroundColor(color);
        props.storeParagraphSettings.setBackColor(color);
        props.f7router.back();
    };
    return(
        <Page>
            <Navbar title={_t.textCustomColor} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <CustomColorPicker currentColor={backgroundColor} onAddNewColor={onAddNewColor}/>
        </Page>
    )
};

const PageBackgroundColor = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const backgroundColor = props.storeParagraphSettings.backColor;
    const customColors = props.storePalette.customColors;
    const changeColor = (color, effectId, effectValue) => {
        if (color !== 'empty') {
            if (effectId !==undefined ) {
                const newColor = {color: color, effectId: effectId, effectValue: effectValue};
                props.onBackgroundColor(newColor);
                props.storeParagraphSettings.setBackColor(newColor);
            } else {
                props.onBackgroundColor(color);
                props.storeParagraphSettings.setBackColor(color);
            }
        } else {
            // open custom color menu
            props.f7router.navigate('/edit-paragraph-custom-color/', {props: {onBackgroundColor: props.onBackgroundColor}});
        }
    };
    return(
        <Page>
            <Navbar title={_t.textBackground} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <ThemeColorPalette changeColor={changeColor} curColor={backgroundColor} customColors={customColors} transparent={true}/>
            <List>
                <ListItem title={_t.textAddCustomColor} link={'/edit-paragraph-custom-color/'} routeProps={{
                    onBackgroundColor: props.onBackgroundColor
                }}></ListItem>
            </List>
        </Page>
    )
};

const EditParagraph = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const storeParagraphSettings = props.storeParagraphSettings;
    const paragraphStyles = storeParagraphSettings.paragraphStyles;
    const curStyleName = storeParagraphSettings.styleName;
    const thumbSize = storeParagraphSettings.styleThumbSize;

    const paragraph = props.storeFocusObjects.paragraphObject;
    const curBackColor = storeParagraphSettings.backColor ? storeParagraphSettings.backColor : storeParagraphSettings.getBackgroundColor(paragraph);
    const background = curBackColor !== 'transparent' ? `#${(typeof curBackColor === "object" ? curBackColor.color : curBackColor)}` : curBackColor;

    return (
        <Fragment>
            <List>
                <ListItem title={_t.textBackground} link='/edit-paragraph-back-color/' routeProps={{
                    onBackgroundColor: props.onBackgroundColor
                }}>
                    <span className="color-preview"
                          slot="after"
                          style={{ background: background}}
                    ></span>
                </ListItem>
            </List>
            <List>
                <ListItem title={_t.textAdvancedSettings} link='/edit-paragraph-adv/' routeProps={{
                    onDistanceBefore: props.onDistanceBefore,
                    onDistanceAfter: props.onDistanceAfter,
                    onSpinFirstLine: props.onSpinFirstLine,
                    onSpaceBetween: props.onSpaceBetween,
                    onBreakBefore: props.onBreakBefore,
                    onOrphan: props.onOrphan,
                    onKeepTogether: props.onKeepTogether,
                    onKeepNext: props.onKeepNext
                }}></ListItem>
            </List>
            <BlockTitle>{_t.textParagraphStyles}</BlockTitle>
            <List>
                {paragraphStyles.map((style, index) => (
                    <ListItem
                        key={index}
                        radio
                        checked={curStyleName === style.name}
                        onClick={() => {props.onStyleClick(style.name)}}
                    >
                        <div slot="inner"
                             style={{backgroundImage: 'url(' + style.image + ')', width: thumbSize.width + 'px', height: thumbSize.height + 'px', backgroundSize: thumbSize.width + 'px ' + thumbSize.height + 'px', backgroundRepeat: 'no-repeat'}}
                        ></div>
                    </ListItem>
                ))}
            </List>
        </Fragment>
    )
};

const EditParagraphContainer = inject("storeParagraphSettings", "storeFocusObjects")(observer(EditParagraph));
const ParagraphAdvSettings = inject("storeParagraphSettings", "storeFocusObjects")(observer(PageAdvancedSettings));
const PageParagraphBackColor = inject("storeParagraphSettings", "storePalette")(observer(PageBackgroundColor));
const PageParagraphCustomColor = inject("storeParagraphSettings", "storePalette")(observer(PageCustomBackColor));

export {EditParagraphContainer as EditParagraph,
        ParagraphAdvSettings,
        PageParagraphBackColor,
        PageParagraphCustomColor};