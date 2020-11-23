import React, {useState} from 'react';
import {observer, inject} from "mobx-react";
import {Page, Navbar, List, ListItem, BlockTitle, Segmented, Button} from 'framework7-react';
import { useTranslation } from 'react-i18next';

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
                                                          onClick={e => {props.onFormatChange(item.value)}}
                ></ListItem>)}
            </List>
        </Page>
    )
};

const PageDocumentMargins = props => {
    const { t } = useTranslation();
    const _t = t('Settings', {returnObjects: true});
    const metricText = Common.Utils.Metric.getMetricName(Common.Utils.Metric.getCurrentMetric());
    const margins = props.getMargins();
    const [stateTop, setTop] = useState(margins.top);
    const [stateBottom, setBottom] = useState(margins.bottom);
    const [stateLeft, setLeft] = useState(margins.left);
    const [stateRight, setRight] = useState(margins.right);
    const onChangeMargins = (align, isDecrement) => {
        const step = Common.Utils.Metric.fnRecalcToMM(Common.Utils.Metric.getCurrentMetric() === Common.Utils.Metric.c_MetricUnits.pt ? 1 : 0.1);
        let marginValue;
        switch (align) {
            case 'left': marginValue = stateLeft; break;
            case 'top': marginValue = stateTop; break;
            case 'right': marginValue = stateRight; break;
            case 'bottom': marginValue = stateBottom; break;
        }
        if (isDecrement) {
            marginValue = Math.max(0, marginValue - step);
        } else {
            marginValue = Math.min((align == 'left' || align == 'right') ? margins.maxMarginsW : margins.maxMarginsH, marginValue + step);
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
                    <div slot='after-start'>{parseFloat(Common.Utils.Metric.fnRecalcFromMM(stateTop).toFixed(2)) + ' ' + metricText}</div>
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='item-link decrement' onClick={() => {onChangeMargins('top', true)}}> - </Button>
                            <Button outline className='item-link increment' onClick={() => {onChangeMargins('top', false)}}> + </Button>
                        </Segmented>
                    </div>
                </ListItem>
                <ListItem title={_t.textBottom}>
                    <div slot='after-start'>{parseFloat(Common.Utils.Metric.fnRecalcFromMM(stateBottom).toFixed(2))+ ' ' + metricText}</div>
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='item-link decrement' onClick={() => {onChangeMargins('bottom', true)}}> - </Button>
                            <Button outline className='item-link increment' onClick={() => {onChangeMargins('bottom', false)}}> + </Button>
                        </Segmented>
                    </div>
                </ListItem>
                <ListItem title={_t.textLeft}>
                    <div slot='after-start'>{parseFloat(Common.Utils.Metric.fnRecalcFromMM(stateLeft).toFixed(2))+ ' ' + metricText}</div>
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='item-link decrement' onClick={() => {onChangeMargins('left', true)}}> - </Button>
                            <Button outline className='item-link increment' onClick={() => {onChangeMargins('left', false)}}> + </Button>
                        </Segmented>
                    </div>
                </ListItem>
                <ListItem title={_t.textRight}>
                    <div slot='after-start'>{parseFloat(Common.Utils.Metric.fnRecalcFromMM(stateRight).toFixed(2))+ ' ' + metricText}</div>
                    <div slot='after'>
                        <Segmented>
                            <Button outline className='item-link decrement' onClick={() => {onChangeMargins('right', true)}}> - </Button>
                            <Button outline className='item-link increment' onClick={() => {onChangeMargins('right', false)}}> + </Button>
                        </Segmented>
                    </div>
                </ListItem>
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
                    onFormatChange: props.onFormatChange
                }}></ListItem>
                <ListItem title={_t.textMargins} link="/margins/" routeProps={{
                    getMargins: props.getMargins,
                    applyMargins: props.applyMargins
                }}></ListItem>
            </List>
        </Page>
     )
};

const DocumentFormats = inject("storeDocumentSettings")(observer(PageDocumentFormats));
const DocumentMargins = inject("storeDocumentSettings")(observer(PageDocumentMargins));
const DocumentSettings = inject("storeDocumentSettings")(observer(PageDocumentSettings));

export {
    DocumentSettings,
    DocumentFormats,
    DocumentMargins
}
