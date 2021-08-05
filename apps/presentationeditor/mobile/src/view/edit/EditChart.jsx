import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";
import {List, ListItem, ListButton, Icon, Row, Page, Navbar, BlockTitle, Toggle, Range, Link, Tabs, Tab, NavRight} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';
import {CustomColorPicker, ThemeColorPalette} from "../../../../../common/mobile/lib/component/ThemeColorPalette.jsx";
import { f7 } from 'framework7-react';

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
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
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
    const shapeProperties = props.storeFocusObjects.shapeObject;
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
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
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
    const borderColor = props.storeChartSettings.borderColor;
    const customColors = props.storePalette.customColors;

    const changeColor = (color, effectId, effectValue) => {
        if (color !== 'empty') {
            if (effectId !==undefined ) {
                const newColor = {color: color, effectId: effectId, effectValue: effectValue};
                props.onBorderColor(newColor);
                props.storeChartSettings.setBorderColor(newColor);
            } else {
                props.onBorderColor(color);
                props.storeChartSettings.setBorderColor(color);
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
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
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
    const chartProperties = props.storeFocusObjects.chartObject ? props.storeFocusObjects.chartObject.get_ChartProperties() : null;
    const types = storeChartSettings.types;
    const curType = chartProperties ? chartProperties.getType() : null;
    const styles = storeChartSettings.styles;
    const shapeObject = props.storeFocusObjects.shapeObject;
    const chartStyles = storeChartSettings.chartStyles;
    const isAndroid = Device.android;

    let borderSize, borderType, borderColor;

    if(shapeObject) {
        const shapeStroke = shapeObject.get_stroke();
        borderSize = shapeStroke.get_width() * 72.0 / 25.4;
        borderType = shapeStroke.get_type();
        borderColor = !storeChartSettings.borderColor ? storeChartSettings.initBorderColor(shapeStroke) : storeChartSettings.borderColor;
    }

    // Init border size

    const borderSizeTransform = storeChartSettings.borderSizeTransform();
    const displayBorderSize = (borderType == Asc.c_oAscStrokeType.STROKE_NONE || borderType === undefined) ? 0 : borderSizeTransform.indexSizeByValue(borderSize);
    const displayTextBorderSize = (borderType == Asc.c_oAscStrokeType.STROKE_NONE || borderType === undefined) ? 0 : borderSizeTransform.sizeByValue(borderSize);
    const [stateBorderSize, setBorderSize] = useState(displayBorderSize);
    const [stateTextBorderSize, setTextBorderSize] = useState(displayTextBorderSize);

    // Init border color

    const displayBorderColor = borderColor !== 'transparent' ? `#${(typeof borderColor === "object" ? borderColor.color : borderColor)}` : borderColor;

    if (!chartProperties && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page>
            <Navbar backLink={_t.textBack}>
                <div className="tab-buttons tabbar">
                    <Link key={"pe-link-chart-type"} tabLink={"#edit-chart-type"} tabLinkActive={true}>{_t.textType}</Link>
                    {chartStyles ? <Link key={"pe-link-chart-style"} tabLink={"#edit-chart-style"}>{_t.textStyle}</Link> : null}
                    <Link key={"pe-link-chart-fill"} tabLink={"#edit-chart-fill"}>{_t.textFill}</Link>
                    <Link key={"pe-link-chart-border"} tabLink={"#edit-chart-border"}>{_t.textBorder}</Link>
                    {isAndroid && <span className='tab-link-highlight'></span>}
                </div>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <Tabs animated>
                <Tab key={"pe-tab-chart-type"} id={"edit-chart-type"} className="page-content no-padding-top dataview" tabActive={true}>
                    <div className="chart-types">
                        {types.map((row, rowIndex) => {
                            return (
                                <ul className="row" key={`row-${rowIndex}`}>
                                    {row.map((type, index)=>{
                                        return(
                                            <li key={`${rowIndex}-${index}`}
                                                className={curType === type.type ? ' active' : ''}
                                                onClick={()=>{props.onType(type.type)}}>
                                                <div className={'thumb'}
                                                     style={{backgroundImage: `url('resources/img/charts/${type.thumb}')`}}>
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )
                        })}
                    </div>
                </Tab>
                {chartStyles ? 
                    <Tab key={"pe-tab-chart-style"} id={"edit-chart-style"} className="page-content no-padding-top dataview">
                        <div className={'chart-styles'}>
                            {styles ? styles.map((row, rowIndex) => {
                                return (
                                    <ul className="row" key={`row-${rowIndex}`}>
                                        {row.map((style, index)=>{
                                            return(
                                                <li key={`${rowIndex}-${index}`}
                                                    onClick={()=>{props.onStyle(style.asc_getName())}}>
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
                : null}
                <Tab key={"pe-tab-chart-fill"} id={"edit-chart-fill"} className="page-content no-padding-top">
                    <PaletteFill onFillColor={props.onFillColor} f7router={props.f7router}/>
                </Tab>
                <Tab key={"pe-tab-chart-border"} id={"edit-chart-border"} className="page-content no-padding-top">
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
                                  style={{ background: displayBorderColor}}
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
    const chartObject = props.storeFocusObjects.chartObject;

    if (!chartObject && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page>
            <Navbar title={_t.textReorder} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
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

const PageAlign = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const chartObject = props.storeFocusObjects.chartObject;

    if (!chartObject && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page>
            <Navbar title={_t.textAlign} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem title={_t.textAlignLeft} link='#' onClick={() => {props.onAlign('align-left')}} className='no-indicator'>
                    <Icon slot="media" icon="icon-align-left"></Icon>
                </ListItem>
                <ListItem title={_t.textAlignCenter} link='#' onClick={() => {props.onAlign('align-center')}} className='no-indicator'>
                    <Icon slot="media" icon="icon-align-center"></Icon>
                </ListItem>
                <ListItem title={_t.textAlignRight} link='#' onClick={() => {props.onAlign('align-right')}} className='no-indicator'>
                    <Icon slot="media" icon="icon-align-right"></Icon>
                </ListItem>
                <ListItem title={_t.textAlignTop} link='#' onClick={() => {props.onAlign('align-top')}} className='no-indicator'>
                    <Icon slot="media" icon="icon-align-top"></Icon>
                </ListItem>
                <ListItem title={_t.textAlignMiddle} link='#' onClick={() => {props.onAlign('align-middle')}} className='no-indicator'>
                    <Icon slot="media" icon="icon-align-middle"></Icon>
                </ListItem>
                <ListItem title={_t.textAlignBottom} link='#' onClick={() => {props.onAlign('align-bottom')}} className='no-indicator'>
                    <Icon slot="media" icon="icon-align-bottom"></Icon>
                </ListItem>
            </List>
            <List>
                <ListItem title={_t.textDistributeHorizontally} link='#' onClick={() => {props.onAlign('distrib-hor')}} className='no-indicator'>
                    <Icon slot="media" icon="icon-align-horizontal"></Icon>
                </ListItem>
                <ListItem title={_t.textDistributeVertically} link='#' onClick={() => {props.onAlign('distrib-vert')}} className='no-indicator'>
                    <Icon slot="media" icon="icon-align-vertical"></Icon>
                </ListItem>
            </List>
        </Page>
    )
};

const EditChart = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    
    return (
        <Fragment>
            <List>
                <ListItem title={_t.textStyle} link='/edit-chart-style/' routeProps={{
                    onType: props.onType,
                    onStyle: props.onStyle,
                    onFillColor: props.onFillColor,
                    onBorderColor: props.onBorderColor,
                    onBorderSize: props.onBorderSize
                }}></ListItem>
                <ListItem title={_t.textReorder} link='/edit-chart-reorder/' routeProps={{
                    onReorder: props.onReorder
                }}></ListItem>
                 <ListItem title={_t.textAlign} link="/edit-chart-align/" routeProps={{
                    onAlign: props.onAlign
                }}></ListItem>
            </List>
            <List className="buttons-list">
                <ListButton title={_t.textRemoveChart} onClick={() => {props.onRemoveChart()}} className='button-red button-fill button-raised'/>
            </List>
        </Fragment>
    )
};

const PageChartStyle = inject("storeChartSettings", "storeFocusObjects")(observer(PageStyle));
const PageChartCustomFillColor = inject("storeChartSettings", "storePalette")(observer(PageCustomFillColor));
const PageChartBorderColor = inject("storeChartSettings", "storePalette")(observer(PageBorderColor));
const PageChartCustomBorderColor = inject("storeChartSettings", "storePalette")(observer(PageCustomBorderColor));
const PageChartReorder = inject("storeFocusObjects")(observer(PageReorder));
const PageChartAlign = inject("storeFocusObjects")(observer(PageAlign));

export {
    EditChart,
    PageChartStyle,
    PageChartCustomFillColor,
    PageChartBorderColor,
    PageChartCustomBorderColor,
    PageChartReorder,
    PageChartAlign
}