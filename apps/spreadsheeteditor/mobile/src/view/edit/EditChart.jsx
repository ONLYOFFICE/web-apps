import React, {Fragment, useState, useEffect} from 'react';
import {observer, inject} from "mobx-react";
import {List, ListItem, ListButton, ListInput, Icon, Row, Page, Navbar, BlockTitle, Toggle, Range, Link, Tabs, Tab, NavTitle, NavRight} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';
import {CustomColorPicker, ThemeColorPalette} from "../../../../../common/mobile/lib/component/ThemeColorPalette.jsx";

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
            <Navbar title={_t.textCustomColor} backLink={_t.textBack} />
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
            props.f7router.navigate('/edit-chart-custom-fill-color/');
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
            <Navbar title={_t.textCustomColor} backLink={_t.textBack} />
            <CustomColorPicker currentColor={borderColor} onAddNewColor={onAddNewColor}/>
        </Page>
    )
};

const PageBorderColor = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const borderColor = props.storeChartSettings.borderColor;
    const customColors = props.storePalette.customColors;

    const changeColor = (color, effectId, effectValue) => {
        if (color !== 'empty') {
            if (effectId !== undefined ) {
                const newColor = {color: color, effectId: effectId, effectValue: effectValue};
                props.onBorderColor(newColor);
                props.storeChartSettings.setBorderColor(newColor);
            } else {
                props.onBorderColor(color);
                props.storeChartSettings.setBorderColor(color);
            }
        } else {
            // open custom color menu
            props.f7router.navigate('/edit-chart-custom-border-color/');
        }
    };

    return (
        <Page>
            <Navbar title={_t.textColor} backLink={_t.textBack} />
            <ThemeColorPalette changeColor={changeColor} curColor={borderColor} customColors={customColors}/>
            <List>
                <ListItem title={_t.textAddCustomColor} link={'/edit-chart-custom-border-color/'} routeProps={{
                    onBorderColor: props.onBorderColor
                }}></ListItem>
            </List>
        </Page>
    )
};

const PageStyle = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeChartSettings = props.storeChartSettings;
    const chartProperties = props.storeFocusObjects.chartObject.get_ChartProperties();
    const shapeProperties = props.storeFocusObjects.shapeObject.get_ShapeProperties();

    const styles = storeChartSettings.styles;
    const types = storeChartSettings.types;
    const curType = chartProperties.getType();

    // Init border size

    const shapeStroke = shapeProperties.get_stroke();
    const borderSizeTransform = storeChartSettings.borderSizeTransform();
    const borderSize = shapeStroke.get_width() * 72.0 / 25.4;
    const borderType = shapeStroke.get_type();
    const displayBorderSize = (borderType == Asc.c_oAscStrokeType.STROKE_NONE) ? 0 : borderSizeTransform.indexSizeByValue(borderSize);
    const displayTextBorderSize = (borderType == Asc.c_oAscStrokeType.STROKE_NONE) ? 0 : borderSizeTransform.sizeByValue(borderSize);
    const [stateBorderSize, setBorderSize] = useState(displayBorderSize);
    const [stateTextBorderSize, setTextBorderSize] = useState(displayTextBorderSize);

    // Init border color

    const borderColor = storeChartSettings.initBorderColor(shapeProperties);
    const displayBorderColor = borderColor == 'transparent' ? borderColor : `#${(typeof borderColor === "object" ? borderColor.color : borderColor)}`;

    return (
        <Page>
            <Navbar backLink={_t.textBack}>
                <div className="tab-buttons tabbar">
                    <Link key={"sse-link-chart-type"} tabLink={"#edit-chart-type"} tabLinkActive={true}>{_t.textType}</Link>
                    <Link key={"sse-link-chart-style"} tabLink={"#edit-chart-style"}>{_t.textStyle}</Link>
                    <Link key={"sse-link-chart-fill"} tabLink={"#edit-chart-fill"}>{_t.textFill}</Link>
                    <Link key={"sse-link-chart-border"} tabLink={"#edit-chart-border"}>{_t.textBorder}</Link>
                </div>
            </Navbar>
            <Tabs animated>
                <Tab key={"sse-tab-chart-type"} id={"edit-chart-type"} className="page-content no-padding-top dataview" tabActive={true}>
                    <div className="chart-types">
                        {types.map((row, rowIndex) => {
                            return (
                                <ul className="row" key={`row-${rowIndex}`}>
                                    {row.map((type, index)=>{
                                        return(
                                            <li key={`${rowIndex}-${index}`}
                                                className={curType === type.type ? ' active' : ''}
                                                onClick={() => {props.onType(type.type)}}>
                                                <div className={'thumb' + ` ${type.thumb}`}></div>
                                                {/* style={{backgroundImage: `url('resources/img/charts/${type.thumb}')`}} */}
                                            </li>
                                        )
                                    })}
                                </ul>
                            )
                        })}
                    </div>
                </Tab>
                <Tab key={"sse-tab-chart-style"} id={"edit-chart-style"} className="page-content no-padding-top dataview">
                    <div className={'chart-styles'}>
                        {styles ? styles.map((row, rowIndex) => {
                            return (
                                <ul className="row" key={`row-${rowIndex}`}>
                                    {row.map((style, index)=>{
                                        return(
                                            <li key={`${rowIndex}-${index}`}
                                                onClick={() => {props.onStyle(style.asc_getName())}}>
                                                <img src={`${style.asc_getImage()}`}/>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )
                        }) :
                            <div className={'text-content'}>{_t.textNoStyles}</div>
                        }
                    </div>
                </Tab>
                <Tab key={"sse-tab-chart-fill"} id={"edit-chart-fill"} className="page-content no-padding-top">
                    <PaletteFill onFillColor={props.onFillColor}/>
                </Tab>
                <Tab key={"sse-tab-chart-border"} id={"edit-chart-border"} className="page-content no-padding-top">
                    <List>
                        <ListItem>
                            <div slot="root-start" className='inner-range-title'>{_t.textSize}</div>
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
                        <ListItem title={_t.textColor} link='/edit-chart-border-color/' routeProps={{
                            onBorderColor: props.onBorderColor
                        }}>
                            <span className="color-preview"
                                  slot="after"
                                  style={{ background: displayBorderColor }}
                            ></span>
                        </ListItem>
                    </List>
                </Tab>
            </Tabs>
        </Page>
    )
};

const PageReorder = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    return (
        <Page>
            <Navbar title={_t.textReorder} backLink={_t.textBack} />
            <List>
                <ListItem title={_t.textBringToForeground} onClick={() => {props.onReorder('all-up')}} link='#' className='no-indicator'>
                    <Icon slot="media" icon="icon-move-foreground"></Icon>
                </ListItem>
                <ListItem title={_t.textSendToBackground} onClick={() => {props.onReorder('all-down')}} link='#' className='no-indicator'>
                    <Icon slot="media" icon="icon-move-background"></Icon>
                </ListItem>
                <ListItem title={_t.textMoveForward} onClick={() => {props.onReorder('move-up')}} link='#' className='no-indicator'>
                    <Icon slot="media" icon="icon-move-forward"></Icon>
                </ListItem>
                <ListItem title={_t.textMoveBackward} onClick={() => {props.onReorder('move-down')}} link='#' className='no-indicator'>
                    <Icon slot="media" icon="icon-move-backward"></Icon>
                </ListItem>
            </List>
        </Page>
    )
};

const PageLayout = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeFocusObjects = props.storeFocusObjects;
    const storeChartSettings = props.storeChartSettings;
    const chartProperties = storeFocusObjects.chartObject.get_ChartProperties();
    const chartType = chartProperties.getType();

    storeChartSettings.initChartLayout(chartProperties);

    const chartTitle = storeChartSettings.chartTitle;
    const chartLegend = storeChartSettings.chartLegend;
    const chartAxisHorTitle = storeChartSettings.chartAxisHorTitle;
    const chartAxisVertTitle = storeChartSettings.chartAxisVertTitle;
    const chartHorGridlines = storeChartSettings.chartHorGridlines;
    const chartVertGridlines = storeChartSettings.chartVertGridlines;
    const chartDataLabel = storeChartSettings.chartDataLabel;

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
        chartType == Asc.c_oAscChartTypeSettings.scatter) {
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

    const disableSetting = props.disableSetting;

    const chartLayoutTitles = {
        0: `${_t.textNone}`,
        1: `${_t.textOverlay}`,
        2: `${_t.textNoOverlay}`
    }

    const chartLayoutLegends = {
        0: `${_t.textNone}`,
        1: `${_t.textLeft}`,
        2: `${_t.textTop}`,
        3: `${_t.textRight}`,
        4: `${_t.textBottom}`,
        5: `${_t.textLeftOverlay}`,
        6: `${_t.textRightOverlay}`
    }

    const chartLayoutAxisTitleHorizontal = {
        0: {
            displayValue: `${_t.textNone}`,
            value: 0
        },
        2: {
            displayValue: `${_t.textNoOverlay}`,
            value: 1
        }
    }

    const chartLayoutAxisTitleVertical = {
        0: `${_t.textNone}`,
        1: `${_t.textRotated}`,
        3: `${_t.textHorizontal}`
    }

    const chartLayoutGridlinesHorizontal = {
        0: `${_t.textNone}`,
        1: `${_t.textMajor}`,
        2: `${_t.textMinor}`,
        3: `${_t.textMajorAndMinor}`
    }

    const chartLayoutGridlinesVertical = {
        0: `${_t.textNone}`,
        1: `${_t.textMajor}`,
        2: `${_t.textMinor}`,
        3: `${_t.textMajorAndMinor}`
    }

    const chartDataLabels = {
        0: `${_t.textNone}`,
        3: `${_t.textCenter}`,
        2: `${_t.textFit}`,
        5: `${_t.textInnerTop}`,
        7: `${_t.textOuterTop}`
    }

    return (
        <Page>
            <Navbar title={_t.textLayout} backLink={_t.textBack} />
            <List>
                <ListItem title={_t.textChartTitle} 
                    after={chartLayoutTitles[chartTitle]} link="/edit-chart-title/" routeProps={{
                        chartLayoutTitles,
                        setLayoutProperty: props.setLayoutProperty
                    }}>
                </ListItem>
                <ListItem title={_t.textLegend} 
                    after={chartLayoutLegends[chartLegend]} link="/edit-chart-legend/" routeProps={{
                        chartLayoutLegends,
                        setLayoutProperty: props.setLayoutProperty
                    }}>
                </ListItem>
            </List>
            <BlockTitle>{_t.textAxisTitle}</BlockTitle>
            <List>
                <ListItem title={_t.textHorizontal} link="/edit-horizontal-axis-title/" 
                    after={chartLayoutAxisTitleHorizontal[chartAxisHorTitle].displayValue} disabled={disableSetting} routeProps={{
                        chartLayoutAxisTitleHorizontal,
                        setLayoutProperty: props.setLayoutProperty
                    }}>
                </ListItem>
                <ListItem title={_t.textVertical} link="/edit-vertical-axis-title/" 
                    after={chartLayoutAxisTitleVertical[chartAxisVertTitle]} disabled={disableSetting} routeProps={{
                        chartLayoutAxisTitleVertical,
                        setLayoutProperty: props.setLayoutProperty
                    }}>
                </ListItem>
            </List>
            <BlockTitle>{_t.textGridlines}</BlockTitle>
            <List>
                <ListItem title={_t.textHorizontal} link="/edit-horizontal-gridlines/" 
                    after={chartLayoutGridlinesHorizontal[chartHorGridlines]} disabled={disableSetting} routeProps={{
                        chartLayoutGridlinesHorizontal,
                        setLayoutProperty: props.setLayoutProperty
                    }}>
                </ListItem>
                <ListItem title={_t.textVertical} link="/edit-vertical-gridlines/" 
                    after={chartLayoutGridlinesVertical[chartVertGridlines]} disabled={disableSetting} routeProps={{
                        chartLayoutGridlinesVertical,
                        setLayoutProperty: props.setLayoutProperty
                    }}>
                </ListItem>
            </List>
            <List>
                <ListItem title={_t.textDataLabels} link="/edit-data-labels/" after={chartDataLabels[chartDataLabel]} routeProps={{
                    chartDataLabels,
                    setLayoutProperty: props.setLayoutProperty
                }}>
                </ListItem>
            </List>
        </Page>
    )
}

const PageChartTitle = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeChartSettings = props.storeChartSettings;
    const chartLayoutTitles = props.chartLayoutTitles;
    const currentTitle = storeChartSettings.chartTitle;

    return (
        <Page>
            <Navbar title={_t.textChartTitle} backLink={_t.textBack} />
            <List>
                {Object.keys(chartLayoutTitles).map(key => {
                    return (
                        <ListItem key={key} title={chartLayoutTitles[key]} radio checked={+key === currentTitle} onChange={() => {
                            storeChartSettings.changeChartTitle(+key);
                            props.setLayoutProperty('putTitle', key);
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
    const storeChartSettings = props.storeChartSettings;
    const chartLayoutLegends = props.chartLayoutLegends;
    const currentLegend = storeChartSettings.chartLegend;

    return (
        <Page>
            <Navbar title={_t.textLegend} backLink={_t.textBack} />
            <List>
                {Object.keys(chartLayoutLegends).map(key => {
                    return (
                        <ListItem key={key} title={chartLayoutLegends[key]} radio checked={+key === currentLegend} onChange={() => {
                            storeChartSettings.changeChartLegend(+key);
                            props.setLayoutProperty('putLegendPos', key);
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
    const storeChartSettings = props.storeChartSettings;
    const chartLayoutAxisTitleHorizontal = props.chartLayoutAxisTitleHorizontal;
    const currentAxisHorTitle = storeChartSettings.chartAxisHorTitle;

    return (
        <Page>
            <Navbar title={_t.textHorizontal} backLink={_t.textBack} />
            <List>
                {Object.keys(chartLayoutAxisTitleHorizontal).map(key => {
                    return (
                        <ListItem key={key} title={chartLayoutAxisTitleHorizontal[key].displayValue} radio checked={+key === currentAxisHorTitle} onChange={() => {
                            console.log(chartLayoutAxisTitleHorizontal[key].value);
                            storeChartSettings.changeChartAxisHorTitle(chartLayoutAxisTitleHorizontal[key].value);
                            props.setLayoutProperty('putHorAxisLabel', chartLayoutAxisTitleHorizontal[key].value);
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
    const storeChartSettings = props.storeChartSettings;
    const chartLayoutAxisTitleVertical = props.chartLayoutAxisTitleVertical;
    const currentAxisVertTitle = storeChartSettings.chartAxisVertTitle;

    return (
        <Page>
            <Navbar title={_t.textVertical} backLink={_t.textBack} />
            <List>
                {Object.keys(chartLayoutAxisTitleVertical).map(key => {
                    return (
                        <ListItem key={key} title={chartLayoutAxisTitleVertical[key]} radio checked={+key === currentAxisVertTitle} onChange={() => {
                            storeChartSettings.changeChartAxisVertTitle(+key);
                            props.setLayoutProperty('putVertAxisLabel', key);
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
    const storeChartSettings = props.storeChartSettings;
    const chartLayoutGridlinesHorizontal = props.chartLayoutGridlinesHorizontal;
    const currentChartHorGridlines = storeChartSettings.chartHorGridlines;

    return (
        <Page>
            <Navbar title={_t.textHorizontal} backLink={_t.textBack} />
            <List>
                {Object.keys(chartLayoutGridlinesHorizontal).map(key => {
                    return (
                        <ListItem key={key} title={chartLayoutGridlinesHorizontal[key]} radio checked={+key === currentChartHorGridlines} onChange={() => {
                            storeChartSettings.changeChartHorGridlines(+key);
                            props.setLayoutProperty('putHorGridLines', key);
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
    const storeChartSettings = props.storeChartSettings;
    const chartLayoutGridlinesVertical = props.chartLayoutGridlinesVertical;
    const currentChartVertGridlines = storeChartSettings.chartVertGridlines;

    return (
        <Page>
            <Navbar title={_t.textVertical} backLink={_t.textBack} />
            <List>
                {Object.keys(chartLayoutGridlinesVertical).map(key => {
                    return (
                        <ListItem key={key} title={chartLayoutGridlinesVertical[key]} radio checked={+key === currentChartVertGridlines} onChange={() => {
                            storeChartSettings.changeChartVertGridlines(+key);
                            props.setLayoutProperty('putVertGridLines', key);
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
    const storeChartSettings = props.storeChartSettings;
    const chartDataLabels = props.chartDataLabels;
    const currentChartDataLabel = storeChartSettings.chartDataLabel;
    
    return (
        <Page>
            <Navbar title={_t.textDataLabels} backLink={_t.textBack} />
            <List>
                {Object.keys(chartDataLabels).map(key => {
                    return (
                        <ListItem key={key} title={chartDataLabels[key]} radio checked={+key === currentChartDataLabel} onChange={() => {
                            storeChartSettings.changeChartDataLabel(+key);
                            props.setLayoutProperty('putDataLabelsPos', key);
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
    const storeChartSettings = props.storeChartSettings;
    const axisProps = props.initVertAxis();
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
    const currentAxisCrosses = defineCurrentAxisCrosses();

    if(!storeChartSettings.axisVertCrosses) {
        storeChartSettings.changeVertAxisCrosses(currentAxisCrosses);
    }

    // console.log(storeChartSettings.axisCrosses);

    const defineCurrentDisplayUnits = () => vertAxisDisplayUnits.find(elem => elem.value ===  axisProps.getDispUnitsRule());
    const currentDisplayUnits = defineCurrentDisplayUnits();

    if(!storeChartSettings.displayUnits) {
        storeChartSettings.changeDisplayUnits(currentDisplayUnits);
    }

    // console.log(storeChartSettings.displayUnits);

    if(storeChartSettings.valuesVertReverseOrder == undefined) {
        storeChartSettings.toggleVertValuesReverseOrder(axisProps.getInvertValOrder());
    }

    const valueMajorType = axisProps.getMajorTickMark();
    const valueMinorType = axisProps.getMinorTickMark();
    const defineCurrentTickOption = (elemType) => tickOptions.find(elem => elem.value === elemType);
    const currentMajorType = defineCurrentTickOption(valueMajorType);

    if(!storeChartSettings.vertMajorType) {
        storeChartSettings.changeVertMajorType(currentMajorType);
    }

    const currentMinorType = defineCurrentTickOption(valueMinorType);

    if(!storeChartSettings.vertMinorType) {
        storeChartSettings.changeVertMinorType(currentMinorType);
    }

    // console.log(storeChartSettings.vertMajorType);
    // console.log(storeChartSettings.vertMinorType);

    const defineLabelsPosition = () => verticalAxisLabelsPosition.find(elem => elem.value === axisProps.getTickLabelsPos());
    const currentLabelsPosition = defineLabelsPosition();

    if(!storeChartSettings.vertLabelPosition) {
        storeChartSettings.changeVertLabelPosition(currentLabelsPosition);
    }

    // console.log(storeChartSettings.vertLabelPosition);

    const [minValue, setMinValue] = useState(axisProps.getMinValRule() == Asc.c_oAscValAxisRule.auto ? '' : axisProps.getMinVal());
    const [maxValue, setMaxValue] = useState(axisProps.getMaxValRule() == Asc.c_oAscValAxisRule.auto ? '' : axisProps.getMaxVal());

    const currentCrossesValue = axisProps.getCrosses();
    const [crossesValue, setCrossesValue] = useState(!currentCrossesValue ? '' : currentCrossesValue);

    return (
        <Page>
            <Navbar title={_t.textAxisOptions} backLink={_t.textBack} />
            <List>
                <ListItem title={_t.textMinimumValue}>
                    <div slot="after">
                        <div className="item-input">
                            <input type="number" className="field right placeholder-color" value={minValue} 
                                onChange={e => props.onVerAxisMinValue(e.target.value)}
                                onInput={e => setMinValue(e.target.value)} placeholder="Auto" />
                        </div>
                    </div>
                </ListItem>
                <ListItem title={_t.textMaximumValue}>
                    <div slot="after">
                        <div className="item-input">
                            <input type="number" className="field right placeholder-color" value={maxValue} 
                                onChange={e => props.onVerAxisMaxValue(e.target.value)} 
                                onInput={e => setMaxValue(e.target.value)} placeholder="Auto" />
                        </div>
                    </div>
                </ListItem>
            </List>
            <List>
                <ListItem title={_t.textAxisCrosses} link="/edit-vert-axis-crosses/" after={storeChartSettings.axisVertCrosses.display} routeProps={{
                    axisCrosses,
                    onVerAxisCrossType: props.onVerAxisCrossType
                }}></ListItem>
                {storeChartSettings.axisVertCrosses.value == Asc.c_oAscCrossesRule.value ? (
                    <ListItem title={_t.textCrossesValue}>
                        <div slot="after">
                            <div className="item-input">
                                <input type="number" className="field right placeholder-color" value={crossesValue} 
                                    onChange={e => props.onVerAxisCrossValue(e.target.value)} 
                                    onInput={e => setCrossesValue(e.target.value)} placeholder="0" />
                            </div>
                        </div>
                    </ListItem>
                ) : null}
            </List>
            <List>
                <ListItem title={_t.textDisplayUnits} link="/edit-display-units/" after={storeChartSettings.displayUnits.display} routeProps={{
                    vertAxisDisplayUnits,
                    onVerAxisDisplayUnits: props.onVerAxisDisplayUnits
                }}></ListItem>
                <ListItem title={_t.textValuesInReverseOrder}>
                    <div slot="after">
                        <Toggle checked={storeChartSettings.valuesVertReverseOrder} 
                            onToggleChange={() => {
                                storeChartSettings.toggleVertValuesReverseOrder(!storeChartSettings.valuesVertReverseOrder);
                                props.onVerAxisReverse(!storeChartSettings.valuesVertReverseOrder);
                            }} />
                    </div>
                </ListItem>
            </List>
            <BlockTitle>{_t.textTickOptions}</BlockTitle>
            <List>
                <ListItem title={_t.textMajorType} after={storeChartSettings.vertMajorType.display} link="/edit-vert-major-type/" routeProps={{
                    tickOptions,
                    onVerAxisTickMajor: props.onVerAxisTickMajor
                }}></ListItem>
                <ListItem title={_t.textMinorType} after={storeChartSettings.vertMinorType.display} link="/edit-vert-minor-type/" routeProps={{
                    tickOptions,
                    onVerAxisTickMinor: props.onVerAxisTickMinor
                }}></ListItem>
            </List>
            <BlockTitle>{_t.textLabelOptions}</BlockTitle>
            <List>
                <ListItem title={_t.textLabelPosition} after={storeChartSettings.vertLabelPosition.display} link="/edit-vert-label-position/" routeProps={{
                    verticalAxisLabelsPosition,
                    onVerAxisLabelPos: props.onVerAxisLabelPos
                }}></ListItem>
            </List>
        </Page>
    )
}

const PageVertAxisCrosses = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeChartSettings = props.storeChartSettings;
    const currentAxisCrosses = storeChartSettings.axisVertCrosses;
    const axisCrosses = props.axisCrosses;

    return (    
        <Page>
            <Navbar title={_t.textAxisCrosses} backLink={_t.textBack} />
            <List>
                {axisCrosses.map((elem, index) => {
                    return (
                        <ListItem title={elem.display} key={index} radio
                            checked={currentAxisCrosses.value === elem.value} 
                            onChange={() => { 
                                storeChartSettings.changeVertAxisCrosses(elem);
                                props.onVerAxisCrossType(elem.value);
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
    const storeChartSettings = props.storeChartSettings;
    const displayUnits = storeChartSettings.displayUnits;
    const vertAxisDisplayUnits = props.vertAxisDisplayUnits;
    
    return (
        <Page>
            <Navbar title={_t.textDisplayUnits} backLink={_t.textBack} />
            <List>
                {vertAxisDisplayUnits.map((elem, index) => {
                    return (
                        <ListItem title={elem.display} key={index} radio
                            checked={displayUnits.value === elem.value}
                            onChange={() => {
                                storeChartSettings.changeDisplayUnits(elem);
                                props.onVerAxisDisplayUnits(elem.value);
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
    const storeChartSettings = props.storeChartSettings;
    const vertMajorType = storeChartSettings.vertMajorType;
    const tickOptions = props.tickOptions;

    return (
        <Page>
            <Navbar title={_t.textMajorType} backLink={_t.textBack} />
            <List>
                {tickOptions.map((elem, index) => {
                    return (
                        <ListItem title={elem.display} key={index} radio
                            checked={vertMajorType.value === elem.value}
                            onChange={() => {
                                storeChartSettings.changeVertMajorType(elem);
                                props.onVerAxisTickMajor(elem.value);
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
    const storeChartSettings = props.storeChartSettings;
    const vertMinorType = storeChartSettings.vertMinorType;
    const tickOptions = props.tickOptions;

    return (
        <Page>
            <Navbar title={_t.textMinorType} backLink={_t.textBack} />
            <List>
                {tickOptions.map((elem, index) => {
                    return (
                        <ListItem title={elem.display} key={index} radio
                            checked={vertMinorType.value === elem.value}
                            onChange={() => {
                                storeChartSettings.changeVertMinorType(elem);
                                props.onVerAxisTickMinor(elem.value);
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
    const storeChartSettings = props.storeChartSettings;
    const vertLabelPosition = storeChartSettings.vertLabelPosition;
    const verticalAxisLabelsPosition = props.verticalAxisLabelsPosition;

    return (
        <Page>
            <Navbar title={_t.textLabelPosition} backLink={_t.textBack} />
            <List>
                {verticalAxisLabelsPosition.map((elem, index) => {
                    return (
                        <ListItem title={elem.display} key={index} radio
                            checked={vertLabelPosition.value === elem.value}
                            onChange={() => {
                                storeChartSettings.changeVertLabelPosition(elem);
                                props.onVerAxisLabelPos(elem.value);
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
    const storeChartSettings = props.storeChartSettings;
    const axisProps = props.initHorAxis();
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
    const currentAxisCrosses = defineCurrentAxisCrosses();

    if(!storeChartSettings.axisHorCrosses) {
        storeChartSettings.changeHorAxisCrosses(currentAxisCrosses);
    }

    console.log(storeChartSettings.axisHorCrosses);

    const defineAxisPosition = () => horAxisPosition.find(elem => elem.value === axisProps.getLabelsPosition());
    const axisPosition = defineAxisPosition();

    if(!storeChartSettings.axisPosition) {
        storeChartSettings.changeAxisPosition(axisPosition);
    }

    console.log(storeChartSettings.axisPosition)

    if(storeChartSettings.valuesHorReverseOrder == undefined) {
        storeChartSettings.toggleHorValuesReverseOrder(axisProps.getInvertCatOrder());
    }

    console.log(storeChartSettings.valuesHorReverseOrder);

    const valueMajorType = axisProps.getMajorTickMark();
    const valueMinorType = axisProps.getMinorTickMark();
    const defineCurrentTickOption = (elemType) => tickOptions.find(elem => elem.value === elemType);
    const currentMajorType = defineCurrentTickOption(valueMajorType);

    if(!storeChartSettings.horMajorType) {
        storeChartSettings.changeHorMajorType(currentMajorType);
    }

    const currentMinorType = defineCurrentTickOption(valueMinorType);

    if(!storeChartSettings.horMinorType) {
        storeChartSettings.changeHorMinorType(currentMinorType);
    }

    console.log(storeChartSettings.horMajorType);
    console.log(storeChartSettings.horMinorType);

    const defineLabelsPosition = () => horAxisLabelsPosition.find(elem => elem.value === axisProps.getTickLabelsPos());
    const currentLabelsPosition = defineLabelsPosition();

    if(!storeChartSettings.horLabelPosition) {
        storeChartSettings.changeHorLabelPosition(currentLabelsPosition);
    }

    console.log(storeChartSettings.horLabelPosition);

    const currentCrossesValue = axisProps.getCrosses();
    const [crossesValue, setCrossesValue] = useState(!currentCrossesValue ? '' : currentCrossesValue);

    return (
        <Page>
            <Navbar title={_t.textAxisOptions} backLink={_t.textBack} />
            <List>
                <ListItem title={_t.textAxisCrosses} link="/edit-hor-axis-crosses/" after={storeChartSettings.axisHorCrosses.display} routeProps={{
                    axisCrosses,
                    onHorAxisCrossType: props.onHorAxisCrossType
                }}></ListItem>
                {storeChartSettings.axisHorCrosses.value == Asc.c_oAscCrossesRule.value ? (
                    <ListItem title={_t.textCrossesValue}>
                        <div slot="after">
                            <div className="item-input">
                                <input type="number" className="field right placeholder-color" value={crossesValue} 
                                    onChange={e => props.onHorAxisCrossValue(e.target.value)} 
                                    onInput={e => setCrossesValue(e.target.value)} placeholder="0" />
                            </div>
                        </div>
                    </ListItem>
                ) : null}
            </List>
            <List>
                <ListItem title={_t.textAxisPosition} link="/edit-hor-axis-position/" after={storeChartSettings.axisPosition.display} routeProps={{
                    horAxisPosition,
                    onHorAxisPos: props.onHorAxisPos
                }}></ListItem>
                <ListItem title={_t.textValuesInReverseOrder}>
                    <div slot="after">
                        <Toggle checked={storeChartSettings.valuesHorReverseOrder} 
                            onToggleChange={() => {
                                storeChartSettings.toggleHorValuesReverseOrder(!storeChartSettings.valuesHorReverseOrder);
                                props.onHorAxisReverse(!storeChartSettings.valuesHorReverseOrder);
                            }} />
                    </div>
                </ListItem>
            </List>
            <BlockTitle>{_t.textTickOptions}</BlockTitle>
            <List>
                <ListItem title={_t.textMajorType} after={storeChartSettings.horMajorType.display} link="/edit-hor-major-type/" routeProps={{
                    tickOptions,
                    onHorAxisTickMajor: props.onHorAxisTickMajor
                }}></ListItem>
                <ListItem title={_t.textMinorType} after={storeChartSettings.horMinorType.display} link="/edit-hor-minor-type/" routeProps={{
                    tickOptions,
                    onHorAxisTickMinor: props.onHorAxisTickMinor
                }}></ListItem>
            </List>
            <BlockTitle>{_t.textLabelOptions}</BlockTitle>
            <List>
                <ListItem title={_t.textLabelPosition} after={storeChartSettings.horLabelPosition.display} link="/edit-hor-label-position/" routeProps={{
                    horAxisLabelsPosition,
                    onHorAxisLabelPos: props.onHorAxisLabelPos
                }}></ListItem>
            </List>
        </Page>
    )
}

const PageHorAxisCrosses = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeChartSettings = props.storeChartSettings;
    const currentAxisCrosses = storeChartSettings.axisHorCrosses;
    const axisCrosses = props.axisCrosses;

    return (    
        <Page>
            <Navbar title={_t.textAxisCrosses} backLink={_t.textBack} />
            <List>
                {axisCrosses.map((elem, index) => {
                    return (
                        <ListItem title={elem.display} key={index} radio
                            checked={currentAxisCrosses.value === elem.value} 
                            onChange={() => { 
                                storeChartSettings.changeHorAxisCrosses(elem);
                                props.onHorAxisCrossType(elem.value);
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
    const storeChartSettings = props.storeChartSettings;
    const axisPosition = storeChartSettings.axisPosition;
    const horAxisPosition = props.horAxisPosition;

    return (    
        <Page>
            <Navbar title={_t.textAxisPosition} backLink={_t.textBack} />
            <List>
                {horAxisPosition.map((elem, index) => {
                    return (
                        <ListItem title={elem.display} key={index} radio
                            checked={axisPosition.value === elem.value} 
                            onChange={() => { 
                                storeChartSettings.changeAxisPosition(elem);
                                props.onHorAxisPos(elem.value);
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
    const storeChartSettings = props.storeChartSettings;
    const horMajorType = storeChartSettings.horMajorType;
    const tickOptions = props.tickOptions;

    return (
        <Page>
            <Navbar title={_t.textMajorType} backLink={_t.textBack} />
            <List>
                {tickOptions.map((elem, index) => {
                    return (
                        <ListItem title={elem.display} key={index} radio
                            checked={horMajorType.value === elem.value}
                            onChange={() => {
                                storeChartSettings.changeHorMajorType(elem);
                                props.onHorAxisTickMajor(elem.value);
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
    const storeChartSettings = props.storeChartSettings;
    const horMinorType = storeChartSettings.horMinorType;
    const tickOptions = props.tickOptions;

    return (
        <Page>
            <Navbar title={_t.textMinorType} backLink={_t.textBack} />
            <List>
                {tickOptions.map((elem, index) => {
                    return (
                        <ListItem title={elem.display} key={index} radio
                            checked={horMinorType.value === elem.value}
                            onChange={() => {
                                storeChartSettings.changeHorMinorType(elem);
                                props.onHorAxisTickMinor(elem.value);
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
    const storeChartSettings = props.storeChartSettings;
    const horLabelPosition = storeChartSettings.horLabelPosition;
    const horAxisLabelsPosition = props.horAxisLabelsPosition;

    return (
        <Page>
            <Navbar title={_t.textLabelPosition} backLink={_t.textBack} />
            <List>
                {horAxisLabelsPosition.map((elem, index) => {
                    return (
                        <ListItem title={elem.display} key={index} radio
                            checked={horLabelPosition.value === elem.value}
                            onChange={() => {
                                storeChartSettings.changeHorLabelPosition(elem);
                                props.onHorAxisLabelPos(elem.value);
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
    const _t = t('View.Edit', {returnObjects: true});
    const storeFocusObjects = props.storeFocusObjects;
    const chartProperties = storeFocusObjects.chartObject.get_ChartProperties();
    const chartType = chartProperties.getType();

    const disableSetting = (
        chartType == Asc.c_oAscChartTypeSettings.pie ||
        chartType == Asc.c_oAscChartTypeSettings.doughnut ||
        chartType == Asc.c_oAscChartTypeSettings.pie3d
    );

    return (
        <Fragment>
            <List>
                <ListItem title={_t.textDesign} link='/edit-chart-style/' routeProps={{
                    onType: props.onType,
                    onStyle: props.onStyle,
                    onFillColor: props.onFillColor,
                    onBorderColor: props.onBorderColor,
                    onBorderSize: props.onBorderSize
                }}></ListItem>
                <ListItem title={_t.textLayout} link='/edit-chart-layout/' routeProps={{
                    disableSetting, 
                    setLayoutProperty: props.setLayoutProperty
                }}></ListItem>
                <ListItem title={_t.textVerticalAxis} link='/edit-chart-vertical-axis/' disabled={disableSetting} routeProps={{
                    initVertAxis: props.initVertAxis,
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
                <ListItem title={_t.textHorizontalAxis} link='/edit-chart-horizontal-axis/' disabled={disableSetting} routeProps={{
                    initHorAxis: props.initHorAxis,
                    onHorAxisCrossType: props.onHorAxisCrossType,
                    onHorAxisCrossValue: props.onHorAxisCrossValue,
                    onHorAxisPos: props.onHorAxisPos,
                    onHorAxisReverse: props.onHorAxisReverse,
                    onHorAxisTickMajor: props.onHorAxisTickMajor,
                    onHorAxisTickMinor: props.onHorAxisTickMinor,
                    onHorAxisLabelPos: props.onHorAxisLabelPos
                }}></ListItem>
                <ListItem title={_t.textReorder} link='/edit-chart-reorder/' routeProps={{
                    onReorder: props.onReorder
                }}></ListItem>
            </List>
            <List>
                <ListButton title={_t.textRemoveChart} onClick={() => {props.onRemoveChart()}} className='button-red button-fill button-raised'/>
            </List>
        </Fragment>
    )
};

const PageEditChart = inject("storeFocusObjects")(observer(EditChart));
const PageChartStyle = inject("storeChartSettings", "storeFocusObjects")(observer(PageStyle));
const PageChartCustomFillColor = inject("storeChartSettings", "storePalette")(observer(PageCustomFillColor));
const PageChartBorderColor = inject("storeChartSettings", "storePalette")(observer(PageBorderColor));
const PageChartCustomBorderColor = inject("storeChartSettings", "storePalette")(observer(PageCustomBorderColor));
const PageChartLayout = inject("storeChartSettings", "storeFocusObjects")(observer(PageLayout));
const PageChartLegend = inject("storeChartSettings")(observer(PageLegend));
const ChartTitle = inject("storeChartSettings")(observer(PageChartTitle));
const PageChartHorizontalAxisTitle = inject("storeChartSettings")(observer(PageHorizontalAxisTitle));
const PageChartVerticalAxisTitle = inject("storeChartSettings", "storeFocusObjects")(observer(PageVerticalAxisTitle));
const PageChartHorizontalGridlines = inject("storeChartSettings")(observer(PageHorizontalGridlines));
const PageChartVerticalGridlines = inject("storeChartSettings")(observer(PageVerticalGridlines));
const PageChartDataLabels = inject("storeChartSettings")(observer(PageDataLabels));
const PageChartVerticalAxis = inject("storeChartSettings")(observer(PageVerticalAxis));
const PageChartVertAxisCrosses = inject("storeChartSettings")(observer(PageVertAxisCrosses));
const PageChartDisplayUnits = inject("storeChartSettings")(observer(PageDisplayUnits));
const PageChartVertMajorType = inject("storeChartSettings")(observer(PageVertMajorType));
const PageChartVertMinorType = inject("storeChartSettings")(observer(PageVertMinorType));
const PageChartVertLabelPosition = inject("storeChartSettings")(observer(PageVertLabelPosition));
const PageChartHorizontalAxis = inject("storeChartSettings")(observer(PageHorizontalAxis));
const PageChartHorAxisCrosses = inject("storeChartSettings")(observer(PageHorAxisCrosses));
const PageChartHorAxisPosition = inject("storeChartSettings")(observer(PageHorAxisPosition));
const PageChartHorMajorType = inject("storeChartSettings")(observer(PageHorMajorType));
const PageChartHorMinorType = inject("storeChartSettings")(observer(PageHorMinorType));
const PageChartHorLabelPosition = inject("storeChartSettings")(observer(PageHorLabelPosition));

export {
    PageEditChart as EditChart,
    PageChartStyle,
    PageChartCustomFillColor,
    PageChartBorderColor,
    PageChartCustomBorderColor,
    PageReorder as PageChartReorder,
    PageChartLayout,
    PageChartLegend,
    ChartTitle as PageChartTitle,
    PageChartHorizontalAxisTitle,
    PageChartVerticalAxisTitle,
    PageChartHorizontalGridlines,
    PageChartVerticalGridlines,
    PageChartDataLabels,
    PageChartVerticalAxis,
    PageChartVertAxisCrosses,
    PageChartDisplayUnits,
    PageChartVertMajorType,
    PageChartVertMinorType,
    PageChartVertLabelPosition, 
    PageChartHorizontalAxis,
    PageChartHorAxisCrosses,
    PageChartHorAxisPosition, 
    PageChartHorMajorType,
    PageChartHorMinorType,
    PageChartHorLabelPosition
}