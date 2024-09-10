import React, {useState} from 'react';
import {observer, inject} from "mobx-react";
import {Page, Navbar, List, ListItem, BlockTitle, Segmented, Button, Icon, Toggle} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';

const PageSpreadsheetColorSchemes = props => {
    const { t } = useTranslation();
    const curScheme = props.initPageColorSchemes();
    const [stateScheme, setScheme] = useState(curScheme);
    const storeSpreadsheetSettings = props.storeSpreadsheetSettings;
    const allSchemes = storeSpreadsheetSettings.allSchemes;

    return (
        <Page>
            <Navbar title={t('View.Settings.textColorSchemes')} backLink={t('View.Settings.textBack')} />
            <List>
            {
                allSchemes ? allSchemes.map((scheme, index) => {
                    return (
                        <ListItem radio={true} className="color-schemes-menu no-fastclick" key={index} title={scheme.get_name()} checked={stateScheme === index}
                            onChange={() => {
                                setScheme(index);
                                setTimeout(() => props.onColorSchemeChange(index), 15);
                        }}>
                            <div slot="before-title">
                                <span className="color-schema-block">
                                    {
                                        scheme.get_colors().map((elem, index) => {
                                            if(index >=2 && index < 7) {
                                                let clr = {background: "#" + Common.Utils.ThemeColor.getHexColor(elem.get_r(), elem.get_g(), elem.get_b())};
                                                return (
                                                    <span className="color" key={index} style={clr}></span>
                                                )
                                            }
                                        })
                                    }
                                    
                                </span>
                            </div>
                        </ListItem>
                    )
                }) : null        
            }
            </List>
        </Page>

    )
};

const PageSpreadsheetFormats = props => {
    const { t } = useTranslation();
    const _t = t('View.Settings', {returnObjects: true});
    const storeSpreadsheetSettings = props.storeSpreadsheetSettings;
    const pageSizesIndex = storeSpreadsheetSettings.pageSizesIndex;
    const pageSizes = storeSpreadsheetSettings.getPageSizesList();
    const textMetric = Common.Utils.Metric.getCurrentMetricName();

    return (
        <Page>
            <Navbar title={_t.textSpreadsheetFormats} backLink={_t.textBack} />
            <List mediaList>
                {pageSizes.map((item, index) =>  (
                    <ListItem 
                        key={index}
                        radio
                        title={item.caption}
                        subtitle={parseFloat(Common.Utils.Metric.fnRecalcFromMM(item.value[0]).toFixed(2)) + ' ' + textMetric + ' x ' + parseFloat(Common.Utils.Metric.fnRecalcFromMM(item.value[1]).toFixed(2)) + ' ' + textMetric}
                        name="format-size-checkbox"
                        checked={pageSizesIndex === index}
                        onClick={e => {props.onFormatChange(item.value)}}>
                    </ListItem>
                ))}
            </List>
        </Page>
    )
};

const PageSpreadsheetMargins = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('View.Settings', {returnObjects: true});
    const metricText = Common.Utils.Metric.getMetricName(Common.Utils.Metric.getCurrentMetric());
    const margins = props.initSpreadsheetMargins();

    const [stateTop, setTop] = useState(margins.top);
    const [stateBottom, setBottom] = useState(margins.bottom);
    const [stateLeft, setLeft] = useState(margins.left);
    const [stateRight, setRight] = useState(margins.right);

    const onChangeMargins = (align, isDecrement) => {
        let step = Common.Utils.Metric.getCurrentMetric() == Common.Utils.Metric.c_MetricUnits.pt ? 1 : 0.1;
        step = Common.Utils.Metric.fnRecalcToMM(step);

        let marginValue,
            maxMarginsH = 482.5,
            maxMarginsW = 482.5;

        switch (align) {
            case 'left': marginValue = stateLeft; break;
            case 'top': marginValue = stateTop; break;
            case 'right': marginValue = stateRight; break;
            case 'bottom': marginValue = stateBottom; break;
        }

        if (isDecrement) {
            marginValue = Math.max(0, marginValue - step);
        } else {
            marginValue = Math.min((align == 'left' || align == 'right') ? maxMarginsW : maxMarginsH, marginValue + step);
        }

        switch (align) {
            case 'left': setLeft(marginValue); break;
            case 'top': setTop(marginValue); break;
            case 'right': setRight(marginValue); break;
            case 'bottom': setBottom(marginValue); break;
        }

        props.onPageMarginsChange(align, marginValue);
    };

    return (
        <Page>
            <Navbar title={_t.textMargins} backLink={_t.textBack} />
            <List>
                <ListItem title={_t.textTop}>
                    {!isAndroid && <div slot='after-start'>{parseFloat(Common.Utils.Metric.fnRecalcFromMM(stateTop).toFixed(2)) + ' ' + metricText}</div>}
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='decrement item-link' onClick={() => {onChangeMargins('top', true)}}>
                                {isAndroid ? <Icon icon="icon-expand-down"></Icon> : ' - '}
                            </Button>
                            {isAndroid && <label>{parseFloat(Common.Utils.Metric.fnRecalcFromMM(stateTop).toFixed(2)) + ' ' + metricText}</label>}
                            <Button outline className='increment item-link' onClick={() => {onChangeMargins('top', false)}}>
                                {isAndroid ? <Icon icon="icon-expand-up"></Icon> : ' + '}
                            </Button>
                        </Segmented>
                    </div>
                </ListItem>
                <ListItem title={_t.textBottom}>
                    {!isAndroid && <div slot='after-start'>{parseFloat(Common.Utils.Metric.fnRecalcFromMM(stateBottom).toFixed(2)) + ' ' + metricText}</div>}
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='decrement item-link' onClick={() => {onChangeMargins('bottom', true)}}>
                                {isAndroid ? <Icon icon="icon-expand-down"></Icon> : ' - '}
                            </Button>
                            {isAndroid && <label>{parseFloat(Common.Utils.Metric.fnRecalcFromMM(stateBottom).toFixed(2)) + ' ' + metricText}</label>}
                            <Button outline className='increment item-link' onClick={() => {onChangeMargins('bottom', false)}}>
                                {isAndroid ? <Icon icon="icon-expand-up"></Icon> : ' + '}
                            </Button>
                        </Segmented>
                    </div>
                </ListItem>
                <ListItem title={_t.textLeft}>
                    {!isAndroid && <div slot='after-start'>{parseFloat(Common.Utils.Metric.fnRecalcFromMM(stateLeft).toFixed(2)) + ' ' + metricText}</div>}
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='decrement item-link' onClick={() => {onChangeMargins('left', true)}}>
                                {isAndroid ? <Icon icon="icon-expand-down"></Icon> : ' - '}
                            </Button>
                            {isAndroid && <label>{parseFloat(Common.Utils.Metric.fnRecalcFromMM(stateLeft).toFixed(2)) + ' ' + metricText}</label>}
                            <Button outline className='increment item-link' onClick={() => {onChangeMargins('left', false)}}>
                                {isAndroid ? <Icon icon="icon-expand-up"></Icon> : ' + '}
                            </Button>
                        </Segmented>
                    </div>
                </ListItem>
                <ListItem title={_t.textRight}>
                    {!isAndroid && <div slot='after-start'>{parseFloat(Common.Utils.Metric.fnRecalcFromMM(stateRight).toFixed(2)) + ' ' + metricText}</div>}
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='decrement item-link' onClick={() => {onChangeMargins('right', true)}}>
                                {isAndroid ? <Icon icon="icon-expand-down"></Icon> : ' - '}
                            </Button>
                            {isAndroid && <label>{parseFloat(Common.Utils.Metric.fnRecalcFromMM(stateRight).toFixed(2)) + ' ' + metricText}</label>}
                            <Button outline className='increment item-link' onClick={() => {onChangeMargins('right', false)}}>
                                {isAndroid ? <Icon icon="icon-expand-up"></Icon> : ' + '}
                            </Button>
                        </Segmented>
                    </div>
                </ListItem>
            </List>
        </Page>
    )
};

const PageSpreadsheetSettings = props => {
    const { t } = useTranslation();
    const _t = t('View.Settings', {returnObjects: true});
    const storeSpreadsheetSettings = props.storeSpreadsheetSettings;
    const storeWorksheets = props.storeWorksheets;
    const wsProps = storeWorksheets.wsProps;
    const isPortrait = storeSpreadsheetSettings.isPortrait;
    const isHideHeadings = storeSpreadsheetSettings.isHideHeadings;
    const isHideGridlines = storeSpreadsheetSettings.isHideGridlines;

    // Init Format

    const curMetricName = Common.Utils.Metric.getMetricName(Common.Utils.Metric.getCurrentMetric());
    const pageSizesIndex = storeSpreadsheetSettings.pageSizesIndex;

    const pageSizes = storeSpreadsheetSettings.getPageSizesList();
    const textFormat = pageSizes[pageSizesIndex]['caption'];
    const sizeW = parseFloat(Common.Utils.Metric.fnRecalcFromMM(pageSizes[pageSizesIndex]['value'][0]).toFixed(2));
    const sizeH = parseFloat(Common.Utils.Metric.fnRecalcFromMM(pageSizes[pageSizesIndex]['value'][1]).toFixed(2));
    const pageSizeTxt = sizeW + ' ' + curMetricName + ' x ' + sizeH + ' ' + curMetricName;

    return (
        <Page>
            <Navbar title={_t.textSpreadsheetSettings} backLink={_t.textBack} />
            <BlockTitle>{_t.textOrientation}</BlockTitle>
            <List>
                <ListItem radio title={_t.textPortrait} name="orientation-checkbox" checked={isPortrait} onClick={() => {
                    storeSpreadsheetSettings.resetPortrait(true);
                    props.onOrientationChange(0)}}>   
                </ListItem>
                <ListItem radio title={_t.textLandscape} name="orientation-checkbox" checked={!isPortrait} onClick={() => { 
                    storeSpreadsheetSettings.resetPortrait(false);
                    props.onOrientationChange(1)}}>
                </ListItem>
            </List>
            <BlockTitle>{_t.textFormat}</BlockTitle>
            <List mediaList>
                <ListItem title={textFormat} subtitle={pageSizeTxt} link="/spreadsheet-formats/" routeProps={{
                    onFormatChange: props.onFormatChange
                }}></ListItem>
                <ListItem title={_t.textMargins} link="/margins/" routeProps={{
                    initSpreadsheetMargins: props.initSpreadsheetMargins,
                    onPageMarginsChange: props.onPageMarginsChange
                }}></ListItem>
            </List>
            <List>
                <ListItem title={_t.textHideHeadings}>
                    <Toggle checked={isHideHeadings} onToggleChange={() => {
                        storeSpreadsheetSettings.changeHideHeadings(!isHideHeadings);
                        props.clickCheckboxHideHeadings(!isHideHeadings)
                    }} />
                </ListItem>
                <ListItem title={_t.textHideGridlines}>
                    <Toggle checked={isHideGridlines} onToggleChange={() => {
                        storeSpreadsheetSettings.changeHideGridlines(!isHideGridlines);
                        props.clickCheckboxHideGridlines(!isHideGridlines)
                    }} />
                </ListItem>
            </List>
            <List>
                <ListItem title={_t.textColorSchemes} className={wsProps.FormatCells ? 'disabled' : ''} link="/color-schemes/" routeProps={{
                    onColorSchemeChange: props.onColorSchemeChange,
                    initPageColorSchemes: props.initPageColorSchemes
                }}></ListItem>
            </List>
        </Page>
     )
};

const SpreadsheetFormats = inject("storeSpreadsheetSettings")(observer(PageSpreadsheetFormats));
const SpreadsheetMargins = inject("storeSpreadsheetSettings")(observer(PageSpreadsheetMargins));
const SpreadsheetSettings = inject("storeSpreadsheetSettings", "storeWorksheets")(observer(PageSpreadsheetSettings));
const SpreadsheetColorSchemes = inject("storeSpreadsheetSettings")(observer(PageSpreadsheetColorSchemes));

export {
    SpreadsheetSettings,
    SpreadsheetFormats,
    SpreadsheetMargins,
    SpreadsheetColorSchemes
};
