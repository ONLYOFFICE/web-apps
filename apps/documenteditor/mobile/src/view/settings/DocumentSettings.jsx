import React, {useState} from 'react';
import {observer, inject} from "mobx-react";
import {Page, Navbar, List, ListItem, BlockTitle, Segmented, Button, Icon} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';
import { f7 } from 'framework7-react';

const PageDocumentFormats = props => {
    const { t } = useTranslation();
    const _t = t('Settings', {returnObjects: true});
    const storeSettings = props.storeDocumentSettings;
    const pageSizesIndex = storeSettings.pageSizesIndex;
    const pageSizes = storeSettings.getPageSizesList();
    const textMetric = Common.Utils.Metric.getCurrentMetricName();
    
    return (
        <Page>
            <Navbar title={_t.textDocumentSettings} backLink={_t.textBack} />
            <List mediaList>
                {pageSizes.map((item, index) => <ListItem key={index}
                                                          radio
                                                          title={item.caption}
                                                          subtitle={parseFloat(Common.Utils.Metric.fnRecalcFromMM(item.value[0]).toFixed(2)) + ' ' + textMetric + ' x ' + parseFloat(Common.Utils.Metric.fnRecalcFromMM(item.value[1]).toFixed(2)) + ' ' + textMetric}
                                                          name="format-size-checkbox"
                                                          checked={pageSizesIndex === index}
                                                          onClick={e => props.onFormatChange(item.value)}
                ></ListItem>)}
            </List>
        </Page>
    )
};

const PageDocumentMargins = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('Settings', {returnObjects: true});
    const metricText = Common.Utils.Metric.getMetricName(Common.Utils.Metric.getCurrentMetric());
    const margins = props.getMargins();
    const maxMarginsW = margins.maxMarginsW;
    const maxMarginsH = margins.maxMarginsH;
    const [stateTop, setTop] = useState(margins.top);
    const [stateBottom, setBottom] = useState(margins.bottom);
    const [stateLeft, setLeft] = useState(margins.left);
    const [stateRight, setRight] = useState(margins.right);

    const onChangeMargins = (align, isDecrement) => {
        const step = Common.Utils.Metric.fnRecalcToMM(Common.Utils.Metric.getCurrentMetric() === Common.Utils.Metric.c_MetricUnits.pt ? 1 : 0.1);
        let marginValue, errorMsg;

        switch (align) {
            case 'left': marginValue = stateLeft; break;
            case 'top': marginValue = stateTop; break;
            case 'right': marginValue = stateRight; break;
            case 'bottom': marginValue = stateBottom; break;
        }

        if (isDecrement) {
            marginValue = Math.max(0, marginValue - step);
        } else {
            if(align == 'left' || align == 'right') {
                marginValue = Math.min(maxMarginsW, marginValue + step);
                if(stateLeft + stateRight + step > maxMarginsW) 
                    errorMsg = _t.textMarginsW;

            } else {
                marginValue = Math.min(maxMarginsH, marginValue + step);
                if(stateTop + stateBottom + step > maxMarginsH)
                    errorMsg = _t.textMarginsH;
            }
    
            if(errorMsg) {
                f7.dialog.alert(errorMsg, _t.notcriticalErrorTitle);
                return;
            }
        }

        switch (align) {
            case 'left': setLeft(marginValue); break;
            case 'top': setTop(marginValue); break;
            case 'right': setRight(marginValue); break;
            case 'bottom': setBottom(marginValue); break;
        }

        props.applyMargins(align, marginValue);
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
                    {!isAndroid && <div slot='after-start'>{parseFloat(Common.Utils.Metric.fnRecalcFromMM(stateBottom).toFixed(2))+ ' ' + metricText}</div>}
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='decrement item-link' onClick={() => {onChangeMargins('bottom', true)}}>
                                {isAndroid ? <Icon icon="icon-expand-down"></Icon> : ' - '}
                            </Button>
                            {isAndroid && <label>{parseFloat(Common.Utils.Metric.fnRecalcFromMM(stateBottom).toFixed(2))+ ' ' + metricText}</label>}
                            <Button outline className='increment item-link' onClick={() => {onChangeMargins('bottom', false)}}>
                                {isAndroid ? <Icon icon="icon-expand-up"></Icon> : ' + '}
                            </Button>
                        </Segmented>
                    </div>
                </ListItem>
                <ListItem title={_t.textLeft}>
                    {!isAndroid && <div slot='after-start'>{parseFloat(Common.Utils.Metric.fnRecalcFromMM(stateLeft).toFixed(2))+ ' ' + metricText}</div>}
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='decrement item-link' onClick={() => {onChangeMargins('left', true)}}>
                                {isAndroid ? <Icon icon="icon-expand-down"></Icon> : ' - '}
                            </Button>
                            {isAndroid && <label>{parseFloat(Common.Utils.Metric.fnRecalcFromMM(stateLeft).toFixed(2))+ ' ' + metricText}</label>}
                            <Button outline className='increment item-link' onClick={() => {onChangeMargins('left', false)}}>
                                {isAndroid ? <Icon icon="icon-expand-up"></Icon> : ' + '}
                            </Button>
                        </Segmented>
                    </div>
                </ListItem>
                <ListItem title={_t.textRight}>
                    {!isAndroid && <div slot='after-start'>{parseFloat(Common.Utils.Metric.fnRecalcFromMM(stateRight).toFixed(2))+ ' ' + metricText}</div>}
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='decrement item-link' onClick={() => {onChangeMargins('right', true)}}>
                                {isAndroid ? <Icon icon="icon-expand-down"></Icon> : ' - '}
                            </Button>
                            {isAndroid && <label>{parseFloat(Common.Utils.Metric.fnRecalcFromMM(stateRight).toFixed(2))+ ' ' + metricText}</label>}
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

const PageDocumentColorSchemes = props => {
    const { t } = useTranslation();
    const curScheme = props.initPageColorSchemes();
    const [stateScheme, setScheme] = useState(curScheme);
    const storeSettings = props.storeDocumentSettings;
    const allSchemes = storeSettings.allSchemes;

    return (
        <Page>
            <Navbar title={t('Settings.textColorSchemes')} backLink={t('Settings.textBack')} />
            <List>
                {
                    allSchemes ? allSchemes.map((scheme, index) => {
                        return (
                            <ListItem radio={true} className="color-schemes-menu no-fastclick" key={index} title={scheme.get_name()} checked={stateScheme === index}
                                onChange={() => {
                                    setScheme(index);
                                    setTimeout(() => props.onColorSchemeChange(index), 10);
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

const PageDocumentSettings = props => {
    const { t } = useTranslation();
    const _t = t('Settings', {returnObjects: true});

    const storeSettings = props.storeDocumentSettings;

    //Init Format
    const curMetricName = Common.Utils.Metric.getMetricName(Common.Utils.Metric.getCurrentMetric());
    const pageSizesIndex = storeSettings.pageSizesIndex;
    const widthDoc = storeSettings.widthDocument;
    const heightDoc = storeSettings.heightDocument;
    let textFormat;
    let sizeW;
    let sizeH;
    if (pageSizesIndex === -1) {
        textFormat = _t.textCustomSize;
        sizeW = parseFloat(Common.Utils.Metric.fnRecalcFromMM(widthDoc).toFixed(2));
        sizeH = parseFloat(Common.Utils.Metric.fnRecalcFromMM(heightDoc).toFixed(2));
    } else {
        const pageSizes = storeSettings.getPageSizesList();
        textFormat = pageSizes[pageSizesIndex]['caption'];
        sizeW = parseFloat(Common.Utils.Metric.fnRecalcFromMM(pageSizes[pageSizesIndex]['value'][0]).toFixed(2));
        sizeH = parseFloat(Common.Utils.Metric.fnRecalcFromMM(pageSizes[pageSizesIndex]['value'][1]).toFixed(2));
    }
    const pageSizeTxt = sizeW + ' ' + curMetricName + ' x ' + sizeH + ' ' + curMetricName;

    return (
        <Page>
            <Navbar title={_t.textDocumentSettings} backLink={_t.textBack} />
            <BlockTitle>{_t.textOrientation}</BlockTitle>
            <List>
                <ListItem radio title={_t.textPortrait} name="orientation-checkbox" checked={storeSettings.isPortrait} onClick={e => props.onPageOrientation('portrait')}></ListItem>
                <ListItem radio title={_t.textLandscape} name="orientation-checkbox" checked={!storeSettings.isPortrait} onClick={e => props.onPageOrientation('landscape')}></ListItem>
            </List>
            <BlockTitle>{_t.textFormat}</BlockTitle>
            <List mediaList>
                <ListItem title={textFormat} subtitle={pageSizeTxt} link="/document-formats/" routeProps={{
                    onFormatChange: props.onFormatChange,
                    getMargins: props.getMargins
                }}></ListItem>
                <ListItem title={_t.textMargins} link="/margins/" routeProps={{
                    getMargins: props.getMargins,
                    applyMargins: props.applyMargins
                }}></ListItem>
            </List>
            <List>
                <ListItem title={_t.textColorSchemes} link="/color-schemes/" routeProps={{
                    onColorSchemeChange: props.onColorSchemeChange,
                    initPageColorSchemes: props.initPageColorSchemes
                }}></ListItem>
            </List>
        </Page>
     )
};

const DocumentFormats = inject("storeDocumentSettings")(observer(PageDocumentFormats));
const DocumentMargins = inject("storeDocumentSettings")(observer(PageDocumentMargins));
const DocumentSettings = inject("storeDocumentSettings")(observer(PageDocumentSettings));
const DocumentColorSchemes = inject("storeDocumentSettings")(observer(PageDocumentColorSchemes));

export {
    DocumentSettings,
    DocumentFormats,
    DocumentMargins,
    DocumentColorSchemes
};
