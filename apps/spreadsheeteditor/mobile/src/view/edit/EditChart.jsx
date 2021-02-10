import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";
import {List, ListItem, ListButton, Icon, Row, Page, Navbar, BlockTitle, Toggle, Range, Link, Tabs, Tab, NavTitle, NavRight} from 'framework7-react';
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
    const chartProperties = storeFocusObjects.chartObject.get_ChartProperties();
    const chartType = chartProperties.getType();

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

    const disableSetting = (
        chartType == Asc.c_oAscChartTypeSettings.pie ||
        chartType == Asc.c_oAscChartTypeSettings.doughnut ||
        chartType == Asc.c_oAscChartTypeSettings.pie3d
    );

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

    return (
        <Page>
            <Navbar title={_t.textLayout} backLink={_t.textBack} />
            <List>
                <ListItem title={_t.textChartTitle} after={chartLayoutTitles[chartProperties.getTitle()]} link="/edit-chart-title/"></ListItem>
                <ListItem title={_t.textLegend} after={chartLayoutLegends[chartProperties.getLegendPos()]} link="/edit-chart-legend/"></ListItem>
            </List>
            <BlockTitle>{_t.textAxisTitle}</BlockTitle>
            <List>
                <ListItem title={_t.textHorizontal} link="/edit-horizontal-axis-title/" disabled={disableSetting}></ListItem>
                <ListItem title={_t.textVertical} link="/edit-vertical-axis-title/" disabled={disableSetting}></ListItem>
            </List>
            <BlockTitle>{_t.textGridlines}</BlockTitle>
            <List>
                <ListItem title={_t.textHorizontal} link="/edit-horizontal-gridlines/" disabled={disableSetting}></ListItem>
                <ListItem title={_t.textVertical} link="/edit-vertical-gridlines/" disabled={disableSetting}></ListItem>
            </List>
            <List>
                <ListItem title={_t.textDataLabels} link="/edit-data-labels/"></ListItem>
            </List>
        </Page>
    )
}

const PageChartTitle = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    return (
        <Page>
            <Navbar title={_t.textChartTitle} backLink={_t.textBack} />
            <List>
                <ListItem title={_t.textNone} radio></ListItem>
                <ListItem title={_t.textOverlay} radio></ListItem>
                <ListItem title={_t.textNoOverlay} radio></ListItem>
            </List>
        </Page>
    )
}

const PageLegend = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    return (
        <Page>
            <Navbar title={_t.textLegend} backLink={_t.textBack} />
            <List>
                <ListItem title={_t.textNone} radio></ListItem>
                <ListItem title={_t.textLeft} radio></ListItem>
                <ListItem title={_t.textTop} radio></ListItem>
                <ListItem title={_t.textRight} radio></ListItem>
                <ListItem title={_t.textBottom} radio></ListItem>
                <ListItem title={_t.textLeftOverlay} radio></ListItem>
                <ListItem title={_t.textRightOverlay} radio></ListItem>
            </List>
        </Page>
    )
}

const PageHorizontalAxisTitle = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    return (
        <Page>
            <Navbar title={_t.textHorizontal} backLink={_t.textBack} />
            <List>
                <ListItem title={_t.textNone} radio></ListItem>
                <ListItem title={_t.textNoOverlay} radio></ListItem>
            </List>
        </Page>
    )
}

const PageVerticalAxisTitle = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    return (
        <Page>
            <Navbar title={_t.textVertical} backLink={_t.textBack} />
            <List>
                <ListItem title={_t.textNone} radio></ListItem>
                <ListItem title={_t.textRotated} radio></ListItem>
                <ListItem title={_t.textHorizontal} radio></ListItem>
            </List>
        </Page>
    )
}

const PageHorizontalGridlines = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    return (
        <Page>
            <Navbar title={_t.textHorizontal} backLink={_t.textBack} />
            <List>
                <ListItem title={_t.textNone} radio></ListItem>
                <ListItem title={_t.textMajor} radio></ListItem>
                <ListItem title={_t.textMinor} radio></ListItem>
                <ListItem title={_t.textMajorAndMinor} radio></ListItem>
            </List>
        </Page>
    )
}

const PageVerticalGridlines = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    return (
        <Page>
            <Navbar title={_t.textVertical} backLink={_t.textBack} />
            <List>
                <ListItem title={_t.textNone} radio></ListItem>
                <ListItem title={_t.textMajor} radio></ListItem>
                <ListItem title={_t.textMinor} radio></ListItem>
                <ListItem title={_t.textMajorAndMinor} radio></ListItem>
            </List>
        </Page>
    )
}

const PageDataLabels = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    return (
        <Page>
            <Navbar title={_t.textDataLabels} backLink={_t.textBack} />
            <List>
                <ListItem title={_t.textNone} radio></ListItem>
                <ListItem title={_t.textCenter} radio></ListItem>
                <ListItem title={_t.textInnerBottom} radio></ListItem>
                <ListItem title={_t.textInnerTop} radio></ListItem>
                <ListItem title={_t.textOuterTop} radio></ListItem>
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
                <ListItem title={_t.textLayout} link='/edit-chart-layout/'></ListItem>
                <ListItem title={_t.textVerticalAxis} link='/edit-chart-vertical-axis/' disabled={disableSetting}></ListItem>
                <ListItem title={_t.textHorizontalAxis} link='/edit-chart-horizontal-axis/' disabled={disableSetting}></ListItem>
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
const PageChartVerticalAxisTitle = inject("storeChartSettings")(observer(PageVerticalAxisTitle));
const PageChartHorizontalGridlines = inject("storeChartSettings")(observer(PageHorizontalGridlines));
const PageChartVerticalGridlines = inject("storeChartSettings")(observer(PageVerticalGridlines));
const PageChartDataLabels = inject("storeChartSettings")(observer(PageDataLabels));

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
    PageChartDataLabels
}