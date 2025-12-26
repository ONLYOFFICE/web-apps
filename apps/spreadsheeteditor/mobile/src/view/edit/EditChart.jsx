import React, {Fragment, useState, useEffect} from 'react';
import {observer, inject} from "mobx-react";
import {f7, List, ListItem, ListButton, ListInput, Icon, Page, Navbar, NavRight, BlockTitle, Toggle, Range, Link} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';
import {CustomColorPicker, ThemeColorPalette} from "../../../../../common/mobile/lib/component/ThemeColorPalette.jsx";
import { Swiper, SwiperSlide } from 'swiper/react';
import SvgIcon from '@common/lib/component/SvgIcon';
import IconExpandDownIos from '@common-ios-icons/icon-expand-down.svg?ios';
import IconExpandDownAndroid from '@common-android-icons/icon-expand-down.svg';
import IconMoveForeground from '@common-icons/icon-move-foreground.svg';
import IconMoveBackground from '@common-icons/icon-move-background.svg';
import IconMoveForward from '@common-icons/icon-move-forward.svg';
import IconMoveBackward from '@common-icons/icon-move-backward.svg';

const PageCustomFillColor = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    let fillColor = props.storeChartSettings.fillColor;

    if (typeof fillColor === 'object') {
        fillColor = fillColor.color;
    }

    const onAddNewColor = (colors, color) => {
        props.storePalette.changeCustomColors(colors);
        props.onFillColor(color);
        props.storeChartSettings.setFillColor(color);
        props.f7router.back();
    };

    return (
        <Page>
            <Navbar title={_t.textCustomColor} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <CustomColorPicker currentColor={fillColor} onAddNewColor={onAddNewColor}/>
        </Page>
    )
};

const PaletteFill = inject("storeFocusObjects", "storeChartSettings", "storePalette")(observer(props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeChartSettings = props.storeChartSettings;
    const shapeProperties = props.storeFocusObjects.shapeObject.get_ShapeProperties();
    const curFillColor = storeChartSettings.fillColor ? storeChartSettings.fillColor : storeChartSettings.getFillColor(shapeProperties);
    const customColors = props.storePalette.customColors;

    const changeColor = (color, effectId, effectValue) => {
        if (color !== 'empty') {
            if (effectId !==undefined ) {
                const newColor = {color: color, effectId: effectId, effectValue: effectValue};
                props.onFillColor(newColor);
                storeChartSettings.setFillColor(newColor);
            } else {
                props.onFillColor(color);
                storeChartSettings.setFillColor(color);
            }
        } else {
            // open custom color menu
            props.f7router.navigate('/edit-chart-custom-fill-color/', {props: {onFillColor: props.onFillColor}});
        }
    };

    return (
        <Fragment>
            <ThemeColorPalette changeColor={changeColor} curColor={curFillColor} customColors={customColors} transparent={true}/>
            <List>
                <ListItem title={_t.textAddCustomColor} link={'/edit-chart-custom-fill-color/'} routeProps={{
                    onFillColor: props.onFillColor
                }}></ListItem>
            </List>
        </Fragment>
    )
}));

const PageCustomBorderColor = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    let borderColor = props.storeChartSettings.borderColor;

    if (typeof borderColor === 'object') {
        borderColor = borderColor.color;
    }

    const onAddNewColor = (colors, color) => {
        props.storePalette.changeCustomColors(colors);
        props.onBorderColor(color);
        props.storeChartSettings.setBorderColor(color);
        props.f7router.back();
    };

    return (
        <Page>
            <Navbar title={_t.textCustomColor} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <CustomColorPicker currentColor={borderColor} onAddNewColor={onAddNewColor}/>
        </Page>
    )
};

const PageBorderColor = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeChartSettings = props.storeChartSettings;
    const storePalette = props.storePalette;
    const borderColor = storeChartSettings.borderColor;
    const customColors = storePalette.customColors;

    const changeColor = (color, effectId, effectValue) => {
        if (color !== 'empty') {
            if (effectId !== undefined) {
                const newColor = {color: color, effectId: effectId, effectValue: effectValue};
                props.onBorderColor(newColor);
                storeChartSettings.setBorderColor(newColor);
            } else {
                props.onBorderColor(color);
                storeChartSettings.setBorderColor(color);
            }
        } else {
            // open custom color menu
            props.f7router.navigate('/edit-chart-custom-border-color/', {props: {onBorderColor: props.onBorderColor}});
        }
    };

    return (
        <Page>
            <Navbar title={_t.textColor} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <ThemeColorPalette changeColor={changeColor} curColor={borderColor} customColors={customColors} />
            <List>
                <ListItem title={_t.textAddCustomColor} link={'/edit-chart-custom-border-color/'} routeProps={{
                    onBorderColor: props.onBorderColor
                }}></ListItem>
            </List>
        </Page>
    )
};

const PageChartType = props => {
    const { t } = useTranslation();
    const storeChartSettings = props.storeChartSettings;
    const types = storeChartSettings.types;
    const countSlides = Math.floor(types.length / 3);
    const arraySlides = Array(countSlides).fill(countSlides);
    const storeFocusObjects = props.storeFocusObjects;
    const chartProperties = storeFocusObjects.chartObject && storeFocusObjects.chartObject.get_ChartProperties();
    const curType = chartProperties && chartProperties.getType();

    return (
        <Page>
            <Navbar backLink={t('View.Edit.textBack')} title={t('View.Edit.textType')} />
            <div id={"edit-chart-type"} className="page-content no-padding-top dataview">
                <div className="chart-types">
                    {types && types.length ? (
                        <Swiper pagination={true}>
                            {arraySlides.map((_, indexSlide) => {
                                let typesSlide = types.slice(indexSlide * 3, (indexSlide * 3) + 3);

                                return (
                                    <SwiperSlide key={indexSlide}>
                                        {typesSlide.map((row, rowIndex) => {
                                            return (
                                                <ul className="row" key={`row-${rowIndex}`}>
                                                    {row.map((type, index) => {
                                                        return (
                                                            <li key={`${rowIndex}-${index}`}
                                                                className={curType === type.type ? ' active' : ''}
                                                                onClick={() => {props.onType(type.type)}}>
                                                                <div className={'thumb' + ` ${type.thumb}`}></div>
                                                            </li>
                                                        )
                                                    })}
                                                </ul>
                                            )
                                        })}
                                    </SwiperSlide>
                                )
                            })}
                        </Swiper>
                    ) : null}
                </div>
            </div>
        </Page>
    )
}

const PageChartStyle = props => {
    const { t } = useTranslation();
    const storeChartSettings = props.storeChartSettings;
    const styles = storeChartSettings.styles;
    const chartStyles = storeChartSettings.chartStyles;

    return (
        <Page>
            <Navbar backLink={t('View.Edit.textBack')} title={t('View.Edit.textStyle')} />

            {chartStyles ? 
                    <div id={"edit-chart-style"} className="page-content no-padding-top dataview">
                        <div className={'chart-styles'}>
                            <ul className="row">
                                {styles ? styles.map((row, rowIndex) => {
                                    return (
                                        row.map((style, index)=>{
                                            return(
                                                <li key={`${rowIndex}-${index}`}
                                                    onClick={() => {props.onStyle(style.asc_getName())}}>
                                                    <img src={`${style.asc_getImage()}`}/>
                                                </li>
                                            )
                                        })
                                    )        
                                }) : <div className={'text-content'}>{t('View.Edit.textNoStyles')}</div>
                                }
                            </ul>
                        </div>
                    </div>
                : null}
        </Page>
    )
}

const PageChartDesignFill = props => {
    const { t } = useTranslation();

    return (
        <Page>
            <Navbar backLink={t('View.Edit.textBack')} title={t('View.Edit.textFill')} />
            <div id={"edit-chart-fill"} className="page-content no-padding-top">
                <PaletteFill onFillColor={props.onFillColor} f7router={props.f7router}/>
            </div>
        </Page>
    )
}

const PageChartBorder = props => {
    const { t } = useTranslation();
    const storeChartSettings = props.storeChartSettings;
    const storeFocusObjects = props.storeFocusObjects;
    const shapeProperties = storeFocusObjects.shapeObject && storeFocusObjects.shapeObject.get_ShapeProperties();

    // Init border size
    let borderSize, borderType;
    if (shapeProperties) {
        const shapeStroke = shapeProperties.get_stroke();
        borderSize = shapeStroke.get_width() * 72.0 / 25.4;
        borderType = shapeStroke.get_type();
    }
    const borderSizeTransform = storeChartSettings.borderSizeTransform();
    const displayBorderSize = (borderType == Asc.c_oAscStrokeType.STROKE_NONE || borderType === undefined) ? 0 : borderSizeTransform.indexSizeByValue(borderSize);
    const displayTextBorderSize = (borderType == Asc.c_oAscStrokeType.STROKE_NONE || borderType === undefined) ? 0 : borderSizeTransform.sizeByValue(borderSize);
    const [stateBorderSize, setBorderSize] = useState(displayBorderSize);
    const [stateTextBorderSize, setTextBorderSize] = useState(displayTextBorderSize);

    // Init border color

    if(!storeChartSettings.borderColor && shapeProperties) {
        storeChartSettings.initBorderColor(shapeProperties);
    }

    const borderColor = storeChartSettings.borderColor;
    const displayBorderColor = borderColor == 'transparent' ? borderColor : `#${(typeof borderColor === "object" ? borderColor.color : borderColor)}`;
    
    return (
        <Page>
            <Navbar backLink={t('View.Edit.textBack')} title={t('View.Edit.textBorder')} />

            <div id={"edit-chart-border"} className="page-content no-padding-top">
               <List>
                    <ListItem>
                        <div slot="root-start" className='inner-range-title'>{t('View.Edit.textSize')}</div>
                        <div slot='inner' style={{width: '100%'}}>
                            <Range min="0" max="7" step="1" value={stateBorderSize}
                                   onRangeChange={(value) => {setBorderSize(value); setTextBorderSize(borderSizeTransform.sizeByIndex(value));}}
                                   onRangeChanged={(value) => {props.onBorderSize(borderSizeTransform.sizeByIndex(value))}}
                            ></Range>
                        </div>
                        <div slot='inner-end' style={{minWidth: '60px', textAlign: 'right'}}>
                            {stateTextBorderSize + ' ' + Common.Utils.Metric.getMetricName(Common.Utils.Metric.c_MetricUnits.pt)}
                        </div>
                    </ListItem>
                    <ListItem title={t('View.Edit.textColor')} link='/edit-chart-border-color/' routeProps={{
                        onBorderColor: props.onBorderColor
                    }}>
                        <span className="color-preview"
                              slot="after"
                              style={{ background: displayBorderColor }}
                        ></span>
                    </ListItem>
                </List>
            </div>
        </Page>
    )
}

const PageDesign = props => {
    const { t } = useTranslation();
    const storeFocusObjects = props.storeFocusObjects;
    const chartProperties = storeFocusObjects.chartObject && storeFocusObjects.chartObject.get_ChartProperties();

    // console.log(chartStyles, curType);
    // console.log(Asc.c_oAscChartTypeSettings.comboBarLine, Asc.c_oAscChartTypeSettings.comboBarLineSecondary, Asc.c_oAscChartTypeSettings.comboAreaBar, Asc.c_oAscChartTypeSettings.comboCustom);

    if ((!chartProperties || storeFocusObjects.focusOn === 'cell') && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page>
            <Navbar backLink={t('View.Edit.textBack')} title={t('View.Edit.textDesign')}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <Fragment>
                <List>
                    <ListItem title={t('View.Edit.textType')} link='/edit-chart-type/' routeProps = {{onType: props.onType}} />
                    <ListItem title={t('View.Edit.textStyle')} link='/edit-chart-style/' routeProps = {{onStyle: props.onStyle}} />
                    <ListItem title={t('View.Edit.textFill')} link='/edit-chart-fill/' routeProps = {{onFillColor: props.onFillColor}} />
                    <ListItem title={t('View.Edit.textBorder')} link='/edit-chart-border/' routeProps = {{
                        onBorderSize: props.onBorderSize,
                        onBorderColor: props.onBorderColor
                    }} />
                </List>
            </Fragment>
        </Page>
    )
};

const PageReorder = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    if ((!props.storeFocusObjects.chartObject || props.storeFocusObjects.focusOn === 'cell') && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }
    return (
        <Page>
            <Navbar title={t('View.Edit.textArrange')} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem title={_t.textBringToForeground} onClick={() => {props.onReorder('all-up')}} link='#' className='no-indicator'>
                    <SvgIcon slot="media" symbolId={IconMoveForeground.id} className={'icon icon-svg'} /> 
                </ListItem>
                <ListItem title={_t.textSendToBackground} onClick={() => {props.onReorder('all-down')}} link='#' className='no-indicator'>
                    <SvgIcon slot="media" symbolId={IconMoveBackground.id} className={'icon icon-svg'} />
                </ListItem>
                <ListItem title={_t.textMoveForward} onClick={() => {props.onReorder('move-up')}} link='#' className='no-indicator'>
                    <SvgIcon slot="media" symbolId={IconMoveForward.id} className={'icon icon-svg'} />
                </ListItem>
                <ListItem title={_t.textMoveBackward} onClick={() => {props.onReorder('move-down')}} link='#' className='no-indicator'>
                    <SvgIcon slot="media" symbolId={IconMoveBackward.id} className={'icon icon-svg'} />
                </ListItem>
            </List>
        </Page>
    )
};

const PageLayout = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeFocusObjects = props.storeFocusObjects;
    const chartObject = storeFocusObjects.chartObject;
    const chartProperties = chartObject && chartObject.get_ChartProperties();
    const chartType = chartProperties && chartProperties.getType();

    let title, legend, axisHorTitle, axisVertTitle, horGridlines, vertGridlines, dataLabel;
    if (chartProperties) {
        title = chartProperties.getTitle();
        legend = chartProperties.getLegendPos();
        axisHorTitle = chartProperties.getHorAxisLabel();
        axisVertTitle = chartProperties.getVertAxisLabel();
        horGridlines = chartProperties.getHorGridLines();
        vertGridlines = chartProperties.getVertGridLines();
        dataLabel = chartProperties.getDataLabelsPos();
    }

    const [chartTitle, setTitle] = useState(title);
    const [chartLegend, setLegend] = useState(legend);
    const [chartAxisHorTitle, setAxisHorTitle] = useState(axisHorTitle);
    const [chartAxisVertTitle, setAxisVertTitle] = useState(axisVertTitle);
    const [chartHorGridlines, setHorGridlines] = useState(horGridlines);
    const [chartVertGridlines, setVertGridlines] = useState(vertGridlines);
    const [chartDataLabel, setDataLabel] = useState(dataLabel);

    let dataLabelPos = [
        { value: Asc.c_oAscChartDataLabelsPos.none, displayValue: _t.textNone },
        { value: Asc.c_oAscChartDataLabelsPos.ctr, displayValue: _t.textCenter }
    ];

    if (chartType == Asc.c_oAscChartTypeSettings.barNormal || chartType == Asc.c_oAscChartTypeSettings.hBarNormal) {
        dataLabelPos.push(
            {value: Asc.c_oAscChartDataLabelsPos.inBase, displayValue: _t.textInnerBottom},
            {value: Asc.c_oAscChartDataLabelsPos.inEnd, displayValue: _t.textInnerTop},
            {value: Asc.c_oAscChartDataLabelsPos.outEnd, displayValue: _t.textOuterTop}
        );
    } else if ( chartType == Asc.c_oAscChartTypeSettings.barStacked ||
        chartType == Asc.c_oAscChartTypeSettings.barStackedPer ||
        chartType == Asc.c_oAscChartTypeSettings.hBarStacked ||
        chartType == Asc.c_oAscChartTypeSettings.hBarStackedPer ) {
        dataLabelPos.push(
            { value: Asc.c_oAscChartDataLabelsPos.inBase, displayValue: _t.textInnerBottom },
            { value: Asc.c_oAscChartDataLabelsPos.inEnd, displayValue: _t.textInnerTop }
        );
    } else if (chartType == Asc.c_oAscChartTypeSettings.lineNormal ||
        chartType == Asc.c_oAscChartTypeSettings.lineStacked ||
        chartType == Asc.c_oAscChartTypeSettings.lineStackedPer ||
        chartType == Asc.c_oAscChartTypeSettings.stock ||
        chartType == Asc.c_oAscChartTypeSettings.scatter ||
        chartType == Asc.c_oAscChartTypeSettings.scatterSmoothMarker || chartType == Asc.c_oAscChartTypeSettings.scatterSmooth ||
        chartType == Asc.c_oAscChartTypeSettings.scatterLineMarker || chartType == Asc.c_oAscChartTypeSettings.scatterLine) {
        dataLabelPos.push(
            { value: Asc.c_oAscChartDataLabelsPos.l, displayValue: _t.textLeft },
            { value: Asc.c_oAscChartDataLabelsPos.r, displayValue: _t.textRight },
            { value: Asc.c_oAscChartDataLabelsPos.t, displayValue: _t.textTop },
            { value: Asc.c_oAscChartDataLabelsPos.b, displayValue: _t.textBottom }
        );
    } else if (chartType == Asc.c_oAscChartTypeSettings.pie || chartType == Asc.c_oAscChartTypeSettings.pie3d) {
        dataLabelPos.push(
            {value: Asc.c_oAscChartDataLabelsPos.bestFit, displayValue: _t.textFit},
            {value: Asc.c_oAscChartDataLabelsPos.inEnd, displayValue: _t.textInnerTop},
            {value: Asc.c_oAscChartDataLabelsPos.outEnd, displayValue: _t.textOuterTop}
        );
    }

    const disableEditAxis = props.disableEditAxis;

    const chartLayoutTitles = {
        0: `${_t.textNone}`,
        1: `${_t.textOverlay}`,
        2: `${_t.textNoOverlay}`
    };

    const chartLayoutLegends = {
        0: `${_t.textNone}`,
        1: `${_t.textLeft}`,
        2: `${_t.textTop}`,
        3: `${_t.textRight}`,
        4: `${_t.textBottom}`,
        5: `${_t.textLeftOverlay}`,
        6: `${_t.textRightOverlay}`
    };

    const chartLayoutAxisTitleHorizontal = {
        0: `${_t.textNone}`,
        1: `${_t.textNoOverlay}`
    };

    const chartLayoutAxisTitleVertical = {
        0: `${_t.textNone}`,
        1: `${_t.textRotated}`,
        3: `${_t.textHorizontal}`
    };

    const chartLayoutGridlinesHorizontal = {
        0: `${_t.textNone}`,
        1: `${_t.textMajor}`,
        2: `${_t.textMinor}`,
        3: `${_t.textMajorAndMinor}`
    };

    const chartLayoutGridlinesVertical = {
        0: `${_t.textNone}`,
        1: `${_t.textMajor}`,
        2: `${_t.textMinor}`,
        3: `${_t.textMajorAndMinor}`
    };

    const chartDataLabels = {
        0: `${_t.textNone}`,
        3: `${_t.textCenter}`,
        2: `${_t.textFit}`,
        5: `${_t.textInnerTop}`,
        7: `${_t.textOuterTop}`
    };

    if ((!chartObject || storeFocusObjects.focusOn === 'cell') && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page>
            <Navbar title={_t.textLayout} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem title={_t.textChartTitle} 
                    after={chartLayoutTitles[chartTitle]} link="/edit-chart-title/" routeProps={{
                        chartLayoutTitles,
                        chartTitle,
                        setTitle,
                        setLayoutProperty: props.setLayoutProperty,
                    }}>
                </ListItem>
                <ListItem title={_t.textLegend} 
                    after={chartLayoutLegends[chartLegend]} link="/edit-chart-legend/" routeProps={{
                        chartLayoutLegends,
                        setLayoutProperty: props.setLayoutProperty,
                        chartLegend,
                        setLegend
                    }}>
                </ListItem>
            </List>
            <BlockTitle>{_t.textAxisTitle}</BlockTitle>
            <List>
                <ListItem title={_t.textHorizontal} link="/edit-horizontal-axis-title/" 
                    after={chartLayoutAxisTitleHorizontal[chartAxisHorTitle]} disabled={disableEditAxis} routeProps={{
                        chartLayoutAxisTitleHorizontal,
                        setLayoutProperty: props.setLayoutProperty,
                        chartAxisHorTitle,
                        setAxisHorTitle
                    }}>
                </ListItem>
                <ListItem title={_t.textVertical} link="/edit-vertical-axis-title/" 
                    after={chartLayoutAxisTitleVertical[chartAxisVertTitle]} disabled={disableEditAxis} routeProps={{
                        chartLayoutAxisTitleVertical,
                        setLayoutProperty: props.setLayoutProperty,
                        chartAxisVertTitle,
                        setAxisVertTitle
                    }}>
                </ListItem>
            </List>
            <BlockTitle>{_t.textGridlines}</BlockTitle>
            <List>
                <ListItem title={_t.textHorizontal} link="/edit-horizontal-gridlines/" 
                    after={chartLayoutGridlinesHorizontal[chartHorGridlines]} disabled={disableEditAxis} routeProps={{
                        chartLayoutGridlinesHorizontal,
                        setLayoutProperty: props.setLayoutProperty,
                        chartHorGridlines,
                        setHorGridlines
                    }}>
                </ListItem>
                <ListItem title={_t.textVertical} link="/edit-vertical-gridlines/" 
                    after={chartLayoutGridlinesVertical[chartVertGridlines]} disabled={disableEditAxis} routeProps={{
                        chartLayoutGridlinesVertical,
                        setLayoutProperty: props.setLayoutProperty,
                        chartVertGridlines,
                        setVertGridlines
                    }}>
                </ListItem>
            </List>
            <List>
                <ListItem title={_t.textDataLabels} link="/edit-data-labels/" after={chartDataLabels[chartDataLabel]} routeProps={{
                    chartDataLabels,
                    setLayoutProperty: props.setLayoutProperty,
                    chartDataLabel,
                    setDataLabel
                }}>
                </ListItem>
            </List>
        </Page>
    )
}

const PageChartTitle = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const chartLayoutTitles = props.chartLayoutTitles;
    const [currentTitle, setTitle] = useState(props.chartTitle);

    return (
        <Page>
            <Navbar title={_t.textChartTitle} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                {Object.keys(chartLayoutTitles).map(key => {
                    return (
                        <ListItem key={key} title={chartLayoutTitles[key]} radio checked={+key === currentTitle} onChange={() => {
                            props.setTitle(+key);
                            setTitle(+key);
                            props.setLayoutProperty('putTitle', key);
                            props.f7router.back();
                        }}></ListItem>
                    )
                })}
            </List>
        </Page>
    )
}

const PageLegend = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const chartLayoutLegends = props.chartLayoutLegends;
    const [currentLegend, setLegend] = useState(props.chartLegend);

    return (
        <Page>
            <Navbar title={_t.textLegend} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                {Object.keys(chartLayoutLegends).map(key => {
                    return (
                        <ListItem key={key} title={chartLayoutLegends[key]} radio checked={+key === currentLegend} onChange={() => {
                            props.setLegend(+key);
                            setLegend(+key);
                            props.setLayoutProperty('putLegendPos', key);
                            props.f7router.back();
                        }}></ListItem>
                    )
                })}
            </List>
        </Page>
    )
}

const PageHorizontalAxisTitle = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const chartLayoutAxisTitleHorizontal = props.chartLayoutAxisTitleHorizontal;
    const [currentAxisHorTitle, setAxisHorTitle] = useState(props.chartAxisHorTitle);

    return (
        <Page>
            <Navbar title={_t.textHorizontal} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                {Object.keys(chartLayoutAxisTitleHorizontal).map(key => {
                    return (
                        <ListItem key={key} title={chartLayoutAxisTitleHorizontal[key]} radio checked={+key === currentAxisHorTitle} onChange={() => {
                            props.setAxisHorTitle(+key);
                            setAxisHorTitle(+key);
                            props.setLayoutProperty('putHorAxisLabel', key);
                            props.f7router.back();
                        }}></ListItem>
                    )
                })}
            </List>
        </Page>
    )
}

const PageVerticalAxisTitle = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const chartLayoutAxisTitleVertical = props.chartLayoutAxisTitleVertical;
    const [currentAxisVertTitle, setAxisVertTitle] = useState(props.chartAxisVertTitle);

    return (
        <Page>
            <Navbar title={_t.textVertical} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                {Object.keys(chartLayoutAxisTitleVertical).map(key => {
                    return (
                        <ListItem key={key} title={chartLayoutAxisTitleVertical[key]} radio checked={+key === currentAxisVertTitle} onChange={() => {
                            props.setAxisVertTitle(+key);
                            setAxisVertTitle(+key);
                            props.setLayoutProperty('putVertAxisLabel', key);
                            props.f7router.back();
                        }}></ListItem>
                    )
                })}
            </List>
        </Page>
    )
}

const PageHorizontalGridlines = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const chartLayoutGridlinesHorizontal = props.chartLayoutGridlinesHorizontal;
    const [currentChartHorGridlines, setHorGridlines] = useState(props.chartHorGridlines);

    return (
        <Page>
            <Navbar title={_t.textHorizontal} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                {Object.keys(chartLayoutGridlinesHorizontal).map(key => {
                    return (
                        <ListItem key={key} title={chartLayoutGridlinesHorizontal[key]} radio checked={+key === currentChartHorGridlines} onChange={() => {
                            props.setHorGridlines(+key);
                            setHorGridlines(+key);
                            props.setLayoutProperty('putHorGridLines', key);
                            props.f7router.back();
                        }}></ListItem>
                    )
                })}
            </List>
        </Page>
    )
}

const PageVerticalGridlines = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const chartLayoutGridlinesVertical = props.chartLayoutGridlinesVertical;
    const [currentChartVertGridlines, setVertGridlines] = useState(props.chartVertGridlines);

    return (
        <Page>
            <Navbar title={_t.textVertical} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                {Object.keys(chartLayoutGridlinesVertical).map(key => {
                    return (
                        <ListItem key={key} title={chartLayoutGridlinesVertical[key]} radio checked={+key === currentChartVertGridlines} onChange={() => {
                            props.setVertGridlines(+key);
                            setVertGridlines(+key);
                            props.setLayoutProperty('putVertGridLines', key);
                            props.f7router.back();
                        }}></ListItem>
                    )
                })}
            </List>
        </Page>
    )
}

const PageDataLabels = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const chartDataLabels = props.chartDataLabels;
    const [currentChartDataLabel, setDataLabel] = useState(props.chartDataLabel);

    return (
        <Page>
            <Navbar title={_t.textDataLabels} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                {Object.keys(chartDataLabels).map(key => {
                    return (
                        <ListItem key={key} title={chartDataLabels[key]} radio checked={+key === currentChartDataLabel} onChange={() => {
                            props.setDataLabel(+key);
                            setDataLabel(+key);
                            props.setLayoutProperty('putDataLabelsPos', key);
                            props.f7router.back();
                        }}></ListItem>
                    )
                })}
            </List>
        </Page>
    )
}

const PageVerticalAxis = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const api = Common.EditorApi.get();
    const chartProperty = api.asc_getChartSettings(true);
    const isIos = Device.ios;
    const verAxisProps = chartProperty.getVertAxisProps();
    const axisProps = (verAxisProps.getAxisType() == Asc.c_oAscAxisType.val) ? verAxisProps : chartProperty.getHorAxisProps();
    const crossValue = axisProps.getCrossesRule();

    const axisCrosses = [
        {display: `${_t.textAuto}`, value: Asc.c_oAscCrossesRule.auto},
        {display: `${_t.textValue}`, value: Asc.c_oAscCrossesRule.value},
        {display: `${_t.textMinimumValue}`, value: Asc.c_oAscCrossesRule.minValue},
        {display: `${_t.textMaximumValue}`, value: Asc.c_oAscCrossesRule.maxValue}
    ];

    const vertAxisDisplayUnits = [
        {display: `${_t.textNone}`, value: Asc.c_oAscValAxUnits.none},
        {display: `${_t.textHundreds}`, value: Asc.c_oAscValAxUnits.HUNDREDS},
        {display: `${_t.textThousands}`, value: Asc.c_oAscValAxUnits.THOUSANDS},
        {display: `${_t.textTenThousands}`, value: Asc.c_oAscValAxUnits.TEN_THOUSANDS},
        {display: `${_t.textHundredThousands}`, value: Asc.c_oAscValAxUnits.HUNDRED_THOUSANDS},
        {display: `${_t.textMillions}`, value: Asc.c_oAscValAxUnits.MILLIONS},
        {display: `${_t.textTenMillions}`, value: Asc.c_oAscValAxUnits.TEN_MILLIONS},
        {display: `${_t.textHundredMil}`, value: Asc.c_oAscValAxUnits.HUNDRED_MILLIONS},
        {display: `${_t.textBillions}`, value: Asc.c_oAscValAxUnits.BILLIONS},
        {display: `${_t.textTrillions}`, value: Asc.c_oAscValAxUnits.TRILLIONS}
    ];

    const tickOptions = [
        {display: `${_t.textNone}`, value: Asc.c_oAscTickMark.TICK_MARK_NONE},
        {display: `${_t.textCross}`, value: Asc.c_oAscTickMark.TICK_MARK_CROSS},
        {display: `${_t.textIn}`, value: Asc.c_oAscTickMark.TICK_MARK_IN},
        {display: `${_t.textOut}`, value: Asc.c_oAscTickMark.TICK_MARK_OUT}
    ];

    const verticalAxisLabelsPosition = [
        {display: `${_t.textNone}`, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_NONE},
        {display: `${_t.textLow}`, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_LOW},
        {display: `${_t.textHigh}`, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_HIGH},
        {display: `${_t.textNextToAxis}`, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_NEXT_TO}
    ];

    const defineCurrentAxisCrosses = () => axisCrosses.find(elem => elem.value === crossValue);
    const [currentAxisCrosses, setAxisCrosses] = useState(defineCurrentAxisCrosses());

    const defineCurrentDisplayUnits = () => vertAxisDisplayUnits.find(elem => elem.value ===  axisProps.getDispUnitsRule());
    const [currentDisplayUnits, setDisplayUnits] = useState(defineCurrentDisplayUnits());

    const [valuesReverseOrder, toggleValuesReverseOrder] = useState(axisProps.getInvertValOrder());

    const valueMajorType = axisProps.getMajorTickMark();
    const valueMinorType = axisProps.getMinorTickMark();

    const defineCurrentTickOption = (elemType) => tickOptions.find(elem => elem.value === elemType);
    const [currentMajorType, setMajorType] = useState(defineCurrentTickOption(valueMajorType));
    const [currentMinorType, setMinorType] = useState(defineCurrentTickOption(valueMinorType));

    const defineLabelsPosition = () => verticalAxisLabelsPosition.find(elem => elem.value === axisProps.getTickLabelsPos());
    const [currentLabelsPosition, setLabelsPosition] = useState(defineLabelsPosition());

    const [minValue, setMinValue] = useState(axisProps.getMinValRule() == Asc.c_oAscValAxisRule.auto ? '' : axisProps.getMinVal());
    const [maxValue, setMaxValue] = useState(axisProps.getMaxValRule() == Asc.c_oAscValAxisRule.auto ? '' : axisProps.getMaxVal());

    const currentCrossesValue = axisProps.getCrosses();
    const [crossesValue, setCrossesValue] = useState(!currentCrossesValue ? '' : currentCrossesValue);

    if ((!props.storeFocusObjects.chartObject || props.storeFocusObjects.focusOn === 'cell') && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page>
            <Navbar title={_t.textAxisOptions} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List inlineLabels className="inputs-list">
                <ListInput 
                    label={_t.textMinimumValue}
                    type="number"
                    placeholder={_t.textAuto}
                    value={minValue}
                    onChange={e => props.onVerAxisMinValue(e.target.value)}
                    onInput={e => setMinValue(e.target.value)}
                    className={isIos ? 'list-input-right' : ''}
                />

                <ListInput 
                    label={_t.textMaximumValue}
                    type="number"
                    placeholder={_t.textAuto}
                    value={maxValue}
                    onChange={e => props.onVerAxisMaxValue(e.target.value)} 
                    onInput={e => setMaxValue(e.target.value)}
                    className={isIos ? 'list-input-right' : ''}
                />
            </List>
            <List inlineLabels className="inputs-list">
                <ListItem title={_t.textAxisCrosses} link="/edit-vert-axis-crosses/" after={currentAxisCrosses.display} routeProps={{
                    axisCrosses,
                    onVerAxisCrossType: props.onVerAxisCrossType,
                    currentAxisCrosses,
                    setAxisCrosses
                }}></ListItem>
                {currentAxisCrosses.value == Asc.c_oAscCrossesRule.value ? (
                    <ListInput 
                        label={_t.textCrossesValue}
                        type="number"
                        placeholder="0"
                        value={crossesValue}
                        onChange={e => props.onVerAxisCrossValue(e.target.value)} 
                        onInput={e => setCrossesValue(e.target.value)}
                        className={isIos ? 'list-input-right' : ''}
                    />
                ) : null}
            </List>
            <List>
                <ListItem title={_t.textDisplayUnits} link="/edit-display-units/" after={currentDisplayUnits.display} routeProps={{
                    vertAxisDisplayUnits,
                    onVerAxisDisplayUnits: props.onVerAxisDisplayUnits,
                    currentDisplayUnits,
                    setDisplayUnits
                }}></ListItem>
                <ListItem title={_t.textValuesInReverseOrder}>
                    <div slot="after">
                        <Toggle checked={valuesReverseOrder} 
                            onToggleChange={() => {
                                toggleValuesReverseOrder(!valuesReverseOrder);
                                props.onVerAxisReverse(!valuesReverseOrder);
                            }} />
                    </div>
                </ListItem>
            </List>
            <BlockTitle>{_t.textTickOptions}</BlockTitle>
            <List>
                <ListItem title={_t.textMajorType} after={currentMajorType.display} link="/edit-vert-major-type/" routeProps={{
                    tickOptions,
                    onVerAxisTickMajor: props.onVerAxisTickMajor,
                    currentMajorType,
                    setMajorType
                }}></ListItem>
                <ListItem title={_t.textMinorType} after={currentMinorType.display} link="/edit-vert-minor-type/" routeProps={{
                    tickOptions,
                    onVerAxisTickMinor: props.onVerAxisTickMinor,
                    currentMinorType,
                    setMinorType
                }}></ListItem>
            </List>
            <BlockTitle>{_t.textLabelOptions}</BlockTitle>
            <List>
                <ListItem title={_t.textLabelPosition} after={currentLabelsPosition.display} link="/edit-vert-label-position/" routeProps={{
                    verticalAxisLabelsPosition,
                    onVerAxisLabelPos: props.onVerAxisLabelPos,
                    currentLabelsPosition,
                    setLabelsPosition
                }}></ListItem>
            </List>
        </Page>
    )
}

const PageVertAxisCrosses = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const axisCrosses = props.axisCrosses;
    const [currentAxisCrosses, setAxisCrosses] = useState(props.currentAxisCrosses);

    return (    
        <Page>
            <Navbar title={_t.textAxisCrosses} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                {axisCrosses.map((elem, index) => {
                    return (
                        <ListItem title={elem.display} key={index} radio
                            checked={currentAxisCrosses.value === elem.value} 
                            onChange={() => { 
                                props.setAxisCrosses(elem);
                                setAxisCrosses(elem);
                                props.onVerAxisCrossType(elem.value);
                                props.f7router.back();
                            }}>
                        </ListItem>
                    )
                })}
            </List>
        </Page>
    )
}

const PageDisplayUnits = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const vertAxisDisplayUnits = props.vertAxisDisplayUnits;
    const [currentDisplayUnits, setDisplayUnits] = useState(props.currentDisplayUnits);
    
    return (
        <Page>
            <Navbar title={_t.textDisplayUnits} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                       <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                {vertAxisDisplayUnits.map((elem, index) => {
                    return (
                        <ListItem title={elem.display} key={index} radio
                            checked={currentDisplayUnits.value === elem.value}
                            onChange={() => {
                                props.setDisplayUnits(elem);
                                setDisplayUnits(elem);
                                props.onVerAxisDisplayUnits(elem.value);
                                props.f7router.back();
                            }}>
                        </ListItem>
                    )
                })}
            </List>
        </Page>
    )
}

const PageVertMajorType = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const [currentMajorType, setMajorType] = useState(props.currentMajorType);
    const tickOptions = props.tickOptions;

    return (
        <Page>
            <Navbar title={_t.textMajorType} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                {tickOptions.map((elem, index) => {
                    return (
                        <ListItem title={elem.display} key={index} radio
                            checked={currentMajorType.value === elem.value}
                            onChange={() => {
                                props.setMajorType(elem);
                                setMajorType(elem);
                                props.onVerAxisTickMajor(elem.value);
                                props.f7router.back();
                            }}>
                        </ListItem>
                    )
                })}
            </List>
        </Page>
    )
}

const PageVertMinorType = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const [currentMinorType, setMinorType] = useState(props.currentMinorType);
    const tickOptions = props.tickOptions;

    return (
        <Page>
            <Navbar title={_t.textMinorType} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                {tickOptions.map((elem, index) => {
                    return (
                        <ListItem title={elem.display} key={index} radio
                            checked={currentMinorType.value === elem.value}
                            onChange={() => {
                                props.setMinorType(elem);
                                setMinorType(elem);
                                props.onVerAxisTickMinor(elem.value);
                                props.f7router.back();
                            }}>
                        </ListItem>
                    )
                })}
            </List>
        </Page>
    )
}

const PageVertLabelPosition = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const [currentLabelsPosition, setLabelsPosition] = useState(props.currentLabelsPosition);
    const verticalAxisLabelsPosition = props.verticalAxisLabelsPosition;

    return (
        <Page>
            <Navbar title={_t.textLabelPosition} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                {verticalAxisLabelsPosition.map((elem, index) => {
                    return (
                        <ListItem title={elem.display} key={index} radio
                            checked={currentLabelsPosition.value === elem.value}
                            onChange={() => {
                                props.setLabelsPosition(elem);
                                setLabelsPosition(elem);
                                props.onVerAxisLabelPos(elem.value);
                                props.f7router.back();
                            }}>
                        </ListItem>
                    )
                })}
            </List>
        </Page>
    )
}

const PageHorizontalAxis = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const api = Common.EditorApi.get();
    const isIos = Device.ios;
    const chartProperty = api.asc_getChartSettings(true);
    const horAxisProps = chartProperty.getHorAxisProps();
    const axisProps = (horAxisProps.getAxisType() == Asc.c_oAscAxisType.val) ? chartProperty.getVertAxisProps() : horAxisProps;
    const crossValue = axisProps.getCrossesRule();

    const axisCrosses = [
        {display: `${_t.textAuto}`, value: Asc.c_oAscCrossesRule.auto},
        {display: `${_t.textValue}`, value: Asc.c_oAscCrossesRule.value},
        {display: `${_t.textMinimumValue}`, value: Asc.c_oAscCrossesRule.minValue},
        {display: `${_t.textMaximumValue}`, value: Asc.c_oAscCrossesRule.maxValue}
    ];

    const tickOptions = [
        {display: `${_t.textNone}`, value: Asc.c_oAscTickMark.TICK_MARK_NONE},
        {display: `${_t.textCross}`, value: Asc.c_oAscTickMark.TICK_MARK_CROSS},
        {display: `${_t.textIn}`, value: Asc.c_oAscTickMark.TICK_MARK_IN},
        {display: `${_t.textOut}`, value: Asc.c_oAscTickMark.TICK_MARK_OUT}
    ];

    const horAxisLabelsPosition = [
        {display: `${_t.textNone}`, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_NONE},
        {display: `${_t.textLow}`, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_LOW},
        {display: `${_t.textHigh}`, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_HIGH},
        {display: `${_t.textNextToAxis}`, value: Asc.c_oAscTickLabelsPos.TICK_LABEL_POSITION_NEXT_TO}
    ];

    const horAxisPosition = [
        {display: `${_t.textOnTickMarks}`, value: Asc.c_oAscLabelsPosition.byDivisions},
        {display: `${_t.textBetweenTickMarks}`, value: Asc.c_oAscLabelsPosition.betweenDivisions}
    ];

    const defineCurrentAxisCrosses = () => axisCrosses.find(elem => elem.value === crossValue);
    const [currentAxisCrosses, setAxisCrosses] = useState(defineCurrentAxisCrosses());

    const defineAxisPosition = () => horAxisPosition.find(elem => elem.value === axisProps.getLabelsPosition());
    const [axisPosition, setAxisPosition] = useState(defineAxisPosition());

    const [valuesReverseOrder, toggleValuesReverseOrder] = useState(axisProps.getInvertCatOrder());

    const valueMajorType = axisProps.getMajorTickMark();
    const valueMinorType = axisProps.getMinorTickMark();

    const defineCurrentTickOption = (elemType) => tickOptions.find(elem => elem.value === elemType);

    const [currentMajorType, setMajorType] = useState(defineCurrentTickOption(valueMajorType));
    const [currentMinorType, setMinorType] = useState(defineCurrentTickOption(valueMinorType));

    const defineLabelsPosition = () => horAxisLabelsPosition.find(elem => elem.value === axisProps.getTickLabelsPos());
    const [currentLabelsPosition, setLabelsPosition] = useState(defineLabelsPosition());

    const currentCrossesValue = axisProps.getCrosses();
    const [crossesValue, setCrossesValue] = useState(!currentCrossesValue ? '' : currentCrossesValue);
    const isRadar = axisProps.isRadarAxis();

    if ((!props.storeFocusObjects.chartObject || props.storeFocusObjects.focusOn === 'cell') && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page>
            <Navbar title={_t.textAxisOptions} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List inlineLabels className="inputs-list">
                <ListItem title={_t.textAxisCrosses} link="/edit-hor-axis-crosses/" after={currentAxisCrosses.display} disabled={isRadar} routeProps={{
                    axisCrosses,
                    onHorAxisCrossType: props.onHorAxisCrossType,
                    currentAxisCrosses,
                    setAxisCrosses
                }}></ListItem>
                {currentAxisCrosses.value == Asc.c_oAscCrossesRule.value ? (
                    <ListInput 
                        label={_t.textCrossesValue}
                        type="number"
                        placeholder="0"
                        value={crossesValue}
                        onChange={e => props.onHorAxisCrossValue(e.target.value)} 
                        onInput={e => setCrossesValue(e.target.value)}
                        className={isIos ? 'list-input-right' : ''}
                    />
                ) : null}
            </List>
            <List>
                {!props.disableAxisPos ? 
                    <ListItem title={_t.textAxisPosition} link="/edit-hor-axis-position/" after={axisPosition.display} disabled={isRadar} routeProps={{
                        horAxisPosition,
                        onHorAxisPos: props.onHorAxisPos,
                        axisPosition,
                        setAxisPosition
                    }}></ListItem>
                : null}
                <ListItem title={_t.textValuesInReverseOrder} disabled={isRadar}>
                    <div slot="after">
                        <Toggle checked={valuesReverseOrder} 
                            onToggleChange={() => {
                                toggleValuesReverseOrder(!valuesReverseOrder);
                                props.onHorAxisReverse(!valuesReverseOrder);
                            }} />
                    </div>
                </ListItem>
            </List>
            <BlockTitle>{_t.textTickOptions}</BlockTitle>
            <List>
                <ListItem title={_t.textMajorType} after={currentMajorType.display} link="/edit-hor-major-type/" disabled={isRadar} routeProps={{
                    tickOptions,
                    onHorAxisTickMajor: props.onHorAxisTickMajor,
                    currentMajorType,
                    setMajorType
                }}></ListItem>
                <ListItem title={_t.textMinorType} after={currentMinorType.display} link="/edit-hor-minor-type/" disabled={isRadar} routeProps={{
                    tickOptions,
                    onHorAxisTickMinor: props.onHorAxisTickMinor,
                    currentMinorType,
                    setMinorType
                }}></ListItem>
            </List>
            <BlockTitle>{_t.textLabelOptions}</BlockTitle>
            <List>
                <ListItem title={_t.textLabelPosition} after={currentLabelsPosition.display} link="/edit-hor-label-position/" disabled={isRadar} routeProps={{
                    horAxisLabelsPosition,
                    onHorAxisLabelPos: props.onHorAxisLabelPos,
                    currentLabelsPosition,
                    setLabelsPosition
                }}></ListItem>
            </List>
        </Page>
    )
}

const PageHorAxisCrosses = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const [currentAxisCrosses, setAxisCrosses] = useState(props.currentAxisCrosses);
    const axisCrosses = props.axisCrosses;

    return (    
        <Page>
            <Navbar title={_t.textAxisCrosses} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                {axisCrosses.map((elem, index) => {
                    return (
                        <ListItem title={elem.display} key={index} radio
                            checked={currentAxisCrosses.value === elem.value} 
                            onChange={() => { 
                                props.setAxisCrosses(elem);
                                setAxisCrosses(elem);
                                props.onHorAxisCrossType(elem.value);
                                props.f7router.back();
                            }}>
                        </ListItem>
                    )
                })}
            </List>
        </Page>
    )
}

const PageHorAxisPosition = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const [axisPosition, setAxisPosition] = useState(props.axisPosition);
    const horAxisPosition = props.horAxisPosition;

    return (    
        <Page>
            <Navbar title={_t.textAxisPosition} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                {horAxisPosition.map((elem, index) => {
                    return (
                        <ListItem title={elem.display} key={index} radio
                            checked={axisPosition.value === elem.value} 
                            onChange={() => { 
                                props.setAxisPosition(elem);
                                setAxisPosition(elem);
                                props.onHorAxisPos(elem.value);
                                props.f7router.back();
                            }}>
                        </ListItem>
                    )
                })}
            </List>
        </Page>
    )
}

const PageHorMajorType = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const [currentMajorType, setMajorType] = useState(props.currentMajorType);
    const tickOptions = props.tickOptions;

    return (
        <Page>
            <Navbar title={_t.textMajorType} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                {tickOptions.map((elem, index) => {
                    return (
                        <ListItem title={elem.display} key={index} radio
                            checked={currentMajorType.value === elem.value}
                            onChange={() => {
                                props.setMajorType(elem);
                                setMajorType(elem);
                                props.onHorAxisTickMajor(elem.value);
                                props.f7router.back();
                            }}>
                        </ListItem>
                    )
                })}
            </List>
        </Page>
    )
}

const PageHorMinorType = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const [currentMinorType, setMinorType] = useState(props.currentMinorType);
    const tickOptions = props.tickOptions;

    return (
        <Page>
            <Navbar title={_t.textMinorType} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                {tickOptions.map((elem, index) => {
                    return (
                        <ListItem title={elem.display} key={index} radio
                            checked={currentMinorType.value === elem.value}
                            onChange={() => {
                                props.setMinorType(elem);
                                setMinorType(elem);
                                props.onHorAxisTickMinor(elem.value);
                                props.f7router.back();
                            }}>
                        </ListItem>
                    )
                })}
            </List>
        </Page>
    )
}

const PageHorLabelPosition = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const [currentLabelsPosition, setLabelsPosition] = useState(props.currentLabelsPosition);
    const horAxisLabelsPosition = props.horAxisLabelsPosition;

    return (
        <Page>
            <Navbar title={_t.textLabelPosition} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                {horAxisLabelsPosition.map((elem, index) => {
                    return (
                        <ListItem title={elem.display} key={index} radio
                            checked={currentLabelsPosition.value === elem.value}
                            onChange={() => {
                                props.setLabelsPosition(elem);
                                setLabelsPosition(elem);
                                props.onHorAxisLabelPos(elem.value);
                                props.f7router.back();
                            }}>
                        </ListItem>
                    )
                })}
            </List>
        </Page>
    )
}

const EditChart = props => {
    const { t } = useTranslation();
    const storeFocusObjects = props.storeFocusObjects;
    const chartProperties = storeFocusObjects.chartObject && storeFocusObjects.chartObject.get_ChartProperties();
    const chartType = chartProperties && chartProperties.getType();

    const disableEditAxis = (
        chartType == Asc.c_oAscChartTypeSettings.pie ||
        chartType == Asc.c_oAscChartTypeSettings.doughnut ||
        chartType == Asc.c_oAscChartTypeSettings.pie3d
    );

    const disableAxisPos = (
        chartType == Asc.c_oAscChartTypeSettings.barNormal3d ||
        chartType == Asc.c_oAscChartTypeSettings.barStacked3d ||
        chartType == Asc.c_oAscChartTypeSettings.barStackedPer3d ||
        chartType == Asc.c_oAscChartTypeSettings.hBarNormal3d ||
        chartType == Asc.c_oAscChartTypeSettings.hBarStacked3d ||
        chartType == Asc.c_oAscChartTypeSettings.hBarStackedPer3d ||
        chartType == Asc.c_oAscChartTypeSettings.barNormal3dPerspective
    );

    const needReverse = (
        chartType == Asc.c_oAscChartTypeSettings.hBarNormal ||
        chartType == Asc.c_oAscChartTypeSettings.hBarStacked ||
        chartType == Asc.c_oAscChartTypeSettings.hBarStackedPer ||
        chartType == Asc.c_oAscChartTypeSettings.hBarNormal3d ||
        chartType == Asc.c_oAscChartTypeSettings.hBarStacked3d ||
        chartType == Asc.c_oAscChartTypeSettings.hBarStackedPer3d
    );

    return (
        <Fragment>
            <List>
                <ListItem title={t('View.Edit.textDesign')} link='/edit-chart-design/' routeProps={{
                    onType: props.onType,
                    onStyle: props.onStyle,
                    onFillColor: props.onFillColor,
                    onBorderColor: props.onBorderColor,
                    onBorderSize: props.onBorderSize
                }}></ListItem>
                <ListItem title={t('View.Edit.textLayout')} link='/edit-chart-layout/' routeProps={{
                    disableEditAxis, 
                    setLayoutProperty: props.setLayoutProperty,
                    initChartLayout: props.initChartLayout
                }}></ListItem>
                <ListItem title={t('View.Edit.textVerticalAxis')} link={needReverse ? '/edit-chart-horizontal-axis/' : '/edit-chart-vertical-axis/'} disabled={disableEditAxis} routeProps={needReverse ? {
                    onHorAxisCrossType: props.onHorAxisCrossType,
                    onHorAxisCrossValue: props.onHorAxisCrossValue,
                    onHorAxisPos: props.onHorAxisPos,
                    onHorAxisReverse: props.onHorAxisReverse,
                    onHorAxisTickMajor: props.onHorAxisTickMajor,
                    onHorAxisTickMinor: props.onHorAxisTickMinor,
                    onHorAxisLabelPos: props.onHorAxisLabelPos,
                    disableAxisPos,
                    needReverse
                } : {
                    onVerAxisMinValue: props.onVerAxisMinValue,
                    onVerAxisMaxValue: props.onVerAxisMaxValue,
                    onVerAxisCrossType: props.onVerAxisCrossType,
                    onVerAxisCrossValue: props.onVerAxisCrossValue,
                    onVerAxisDisplayUnits: props.onVerAxisDisplayUnits,
                    onVerAxisReverse: props.onVerAxisReverse,
                    onVerAxisTickMajor: props.onVerAxisTickMajor,
                    onVerAxisTickMinor: props.onVerAxisTickMinor,
                    onVerAxisLabelPos: props.onVerAxisLabelPos
                }}></ListItem>
                <ListItem title={t('View.Edit.textHorizontalAxis')} link={needReverse || chartType == Asc.c_oAscChartTypeSettings.scatter ? '/edit-chart-vertical-axis/' : '/edit-chart-horizontal-axis/'} disabled={disableEditAxis} routeProps={needReverse || chartType == Asc.c_oAscChartTypeSettings.scatter ? {
                    onVerAxisMinValue: props.onVerAxisMinValue,
                    onVerAxisMaxValue: props.onVerAxisMaxValue,
                    onVerAxisCrossType: props.onVerAxisCrossType,
                    onVerAxisCrossValue: props.onVerAxisCrossValue,
                    onVerAxisDisplayUnits: props.onVerAxisDisplayUnits,
                    onVerAxisReverse: props.onVerAxisReverse,
                    onVerAxisTickMajor: props.onVerAxisTickMajor,
                    onVerAxisTickMinor: props.onVerAxisTickMinor,
                    onVerAxisLabelPos: props.onVerAxisLabelPos
                } : {
                    onHorAxisCrossType: props.onHorAxisCrossType,
                    onHorAxisCrossValue: props.onHorAxisCrossValue,
                    onHorAxisPos: props.onHorAxisPos,
                    onHorAxisReverse: props.onHorAxisReverse,
                    onHorAxisTickMajor: props.onHorAxisTickMajor,
                    onHorAxisTickMinor: props.onHorAxisTickMinor,
                    onHorAxisLabelPos: props.onHorAxisLabelPos,
                    disableAxisPos,
                    needReverse
                }}></ListItem>
                <ListItem title={t('View.Edit.textArrange')} link='/edit-chart-reorder/' routeProps={{
                    onReorder: props.onReorder
                }}></ListItem>
            </List>
            <List className="buttons-list">
                <ListButton title={t('View.Edit.textRemoveChart')} onClick={() => {props.onRemoveChart()}} className='button-red button-fill button-raised'/>
            </List>
        </Fragment>
    )
};

const PageEditChart = inject("storeFocusObjects")(observer(EditChart));
const PageChartDesign = inject("storeChartSettings", "storeFocusObjects")(observer(PageDesign));
const PageChartDesignType = inject("storeChartSettings", "storeFocusObjects")(observer(PageChartType));
const PageChartDesignStyle = inject("storeChartSettings")(observer(PageChartStyle));
const PageChartDesignBorder = inject("storeChartSettings", "storeFocusObjects")(observer(PageChartBorder));
const PageChartCustomFillColor = inject("storeChartSettings", "storePalette")(observer(PageCustomFillColor));
const PageChartBorderColor = inject("storeChartSettings", "storePalette")(observer(PageBorderColor));
const PageChartCustomBorderColor = inject("storeChartSettings", "storePalette")(observer(PageCustomBorderColor));
const PageChartLayout = inject("storeFocusObjects")(observer(PageLayout));
const PageChartVerticalAxis = inject("storeFocusObjects")(observer(PageVerticalAxis));
const PageChartHorizontalAxis = inject("storeFocusObjects")(observer(PageHorizontalAxis));
const PageChartReorder = inject("storeFocusObjects")(observer(PageReorder));

export {
    PageEditChart as EditChart,
    PageChartDesign,
    PageChartDesignType,
    PageChartDesignStyle,
    PageChartDesignFill,
    PageChartDesignBorder,
    PageChartCustomFillColor,
    PageChartBorderColor,
    PageChartCustomBorderColor,
    PageChartReorder,
    PageChartLayout,
    PageLegend,
    PageChartTitle,
    PageHorizontalAxisTitle,
    PageVerticalAxisTitle,
    PageHorizontalGridlines,
    PageVerticalGridlines,
    PageDataLabels,
    PageChartVerticalAxis,
    PageVertAxisCrosses,
    PageDisplayUnits,
    PageVertMajorType,
    PageVertMinorType,
    PageVertLabelPosition, 
    PageChartHorizontalAxis,
    PageHorAxisCrosses,
    PageHorAxisPosition, 
    PageHorMajorType,
    PageHorMinorType,
    PageHorLabelPosition
}