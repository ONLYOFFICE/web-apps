import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";
import {List, ListItem, Icon, Row, Col, Button, Page, Navbar, Segmented, BlockTitle, Toggle} from 'framework7-react';
import { useTranslation } from 'react-i18next';

const PageAdvancedSettings = props => {
    const { t } = useTranslation();
    const metricText = Common.Utils.Metric.getCurrentMetricName();
    const storeFocusObjects = props.storeFocusObjects;
    const paragraphObj = storeFocusObjects.paragraphObject;
    if (paragraphObj.get_Ind()===null || paragraphObj.get_Ind()===undefined) {
        paragraphObj.get_Ind().put_FirstLine(0);
    }
    const firstLine = parseFloat(Common.Utils.Metric.fnRecalcFromMM(paragraphObj.get_Ind().get_FirstLine()).toFixed(2));

    const spaceBefore = paragraphObj.get_Spacing().get_Before() < 0 ? paragraphObj.get_Spacing().get_Before() : Common.Utils.Metric.fnRecalcFromMM(paragraphObj.get_Spacing().get_Before());
    const spaceAfter  = paragraphObj.get_Spacing().get_After() < 0 ? paragraphObj.get_Spacing().get_After() : Common.Utils.Metric.fnRecalcFromMM(paragraphObj.get_Spacing().get_After());
    const spaceBeforeFix = parseFloat(spaceBefore.toFixed(2));
    const spaceAfterFix = parseFloat(spaceAfter.toFixed(2));
    const displayBefore = spaceBefore < 0 ? t('Edit.textAuto') : spaceBeforeFix + ' ' + metricText;
    const displayAfter = spaceAfter < 0 ? t('Edit.textAuto') : spaceAfterFix + ' ' + metricText;

    const spaceBetween = paragraphObj.get_ContextualSpacing();
    const breakBefore = paragraphObj.get_PageBreakBefore();
    const orphanControl = paragraphObj.get_WidowControl();
    const keepTogether = paragraphObj.get_KeepLines();
    const keepWithNext = paragraphObj.get_KeepNext();

    return(
        <Page>
            <Navbar title={t('Edit.textAdvanced')} backLink={t('Edit.textBack')} />
            <BlockTitle>{t('Edit.textDistanceFromText')}</BlockTitle>
            <List>
                <ListItem title={t('Edit.textBefore')}>
                    <div slot='after-start'>{displayBefore}</div>
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='decrement' onClick={() => {props.onDistanceBefore(spaceBefore, true)}}> - </Button>
                            <Button outline className='increment' onClick={() => {props.onDistanceBefore(spaceBefore, false)}}> + </Button>
                        </Segmented>
                    </div>
                </ListItem>
                <ListItem title={t('Edit.textAfter')}>
                    <div slot='after-start'>{displayAfter}</div>
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='decrement' onClick={() => {props.onDistanceAfter(spaceAfter, true)}}> - </Button>
                            <Button outline className='increment' onClick={() => {props.onDistanceAfter(spaceAfter, false)}}> + </Button>
                        </Segmented>
                    </div>
                </ListItem>
                <ListItem title={t('Edit.textFirstLine')}>
                    <div slot='after-start'>{firstLine + ' ' + metricText}</div>
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='decrement' onClick={() => {props.onSpinFirstLine(paragraphObj, true)}}> - </Button>
                            <Button outline className='increment' onClick={() => {props.onSpinFirstLine(paragraphObj, false)}}> + </Button>
                        </Segmented>
                    </div>
                </ListItem>
            </List>
            <List>
                <ListItem title={t('Edit.textSpaceBetweenParagraphs')}>
                    <Toggle checked={spaceBetween} onToggleChange={() => {props.onSpaceBetween(!spaceBetween)}}/>
                </ListItem>
            </List>
            <List>
                <ListItem title={t('Edit.textPageBreakBefore')}>
                    <Toggle checked={breakBefore} onToggleChange={() => {props.onBreakBefore(!breakBefore)}}/>
                </ListItem>
                <ListItem title={t('Edit.textOrphanControl')}>
                    <Toggle checked={orphanControl} onToggleChange={() => {props.onOrphan(!orphanControl)}}/>
                </ListItem>
                <ListItem title={t('Edit.textKeepLinesTogether')}>
                    <Toggle checked={keepTogether} onToggleChange={() => {props.onKeepTogether(!keepTogether)}}/>
                </ListItem>
                <ListItem title={t('Edit.textKeepWithNext')}>
                    <Toggle checked={keepWithNext} onToggleChange={() => {props.onKeepNext(!keepWithNext)}}/>
                </ListItem>
            </List>
        </Page>
    )
};

const EditParagraph = props => {
    const { t } = useTranslation();
    const storeParagraphSettings = props.storeParagraphSettings;
    const paragraphStyles = storeParagraphSettings.paragraphStyles;
    const curStyleName = storeParagraphSettings.styleName;
    const thumbSize = storeParagraphSettings.styleThumbSize;
    return (
        <Fragment>
            <List>
                <ListItem title={t('Edit.textBackground')} link=''>
                    <span className="color-preview" slot="after"></span>
                </ListItem>
            </List>
            <List>
                <ListItem title={t('Edit.textAdvancedSettings')} link='/edit-paragraph-adv/' routeProps={{
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
            <BlockTitle>{t('Edit.textParagraphStyles')}</BlockTitle>
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
const AdvSettingsContainer = inject("storeParagraphSettings", "storeFocusObjects")(observer(PageAdvancedSettings));

export {EditParagraphContainer as EditParagraph,
        AdvSettingsContainer as PageAdvancedSettings};