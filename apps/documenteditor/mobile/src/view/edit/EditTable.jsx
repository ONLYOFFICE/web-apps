import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";
import {Page, Navbar, NavRight, List, ListItem, ListButton, Row, BlockTitle, Range, Toggle, Icon, Link, Tabs, Tab} from 'framework7-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';
import {CustomColorPicker, ThemeColorPalette} from "../../../../../common/mobile/lib/component/ThemeColorPalette.jsx";

const PageTableOptions = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const metricText = Common.Utils.Metric.getCurrentMetricName();
    const storeFocusObjects = props.storeFocusObjects;
    const tableObject = storeFocusObjects.tableObject;
    const storeTableSettings = props.storeTableSettings;

    let distance, isRepeat, isResize;
    if (tableObject) {
        distance = Common.Utils.Metric.fnRecalcFromMM(storeTableSettings.getCellMargins(tableObject));
        isRepeat = storeTableSettings.getRepeatOption(tableObject);
        isResize = storeTableSettings.getResizeOption(tableObject);
    }
    const [stateDistance, setDistance] = useState(distance);

    if (!tableObject && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page>
            <Navbar title={_t.textOptions} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem title={_t.textRepeatAsHeaderRow} className={isRepeat === null ? 'disabled' : ''}>
                    <Toggle checked={isRepeat} onChange={() => {props.onOptionRepeat(!isRepeat)}}/>
                </ListItem>
                <ListItem title={_t.textResizeToFitContent}>
                    <Toggle checked={isResize} onChange={() => {props.onOptionResize(!isResize)}}/>
                </ListItem>
            </List>
            <BlockTitle>{_t.textCellMargins}</BlockTitle>
            <List>
                <ListItem>
                    <div slot='inner' style={{width: '100%'}}>
                        <Range min={0} max={200} step={1} value={stateDistance}
                               onRangeChange={(value) => {setDistance(value)}}
                               onRangeChanged={(value) => {props.onCellMargins(value)}}
                        ></Range>
                    </div>
                    <div slot='inner-end' style={{minWidth: '60px', textAlign: 'right'}}>
                        {stateDistance + ' ' + metricText}
                    </div>
                </ListItem>
            </List>
        </Page>
    )
};

const PageWrap = props => {
    const c_tableWrap = {
        TABLE_WRAP_NONE: 0,
        TABLE_WRAP_PARALLEL: 1
    };
    const c_tableAlign = {
        TABLE_ALIGN_LEFT: 0,
        TABLE_ALIGN_CENTER: 1,
        TABLE_ALIGN_RIGHT: 2
    };
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const storeTableSettings = props.storeTableSettings;
    const tableObject = props.storeFocusObjects.tableObject;
    let wrapType, align, moveText, distance;
    if (tableObject) {
        wrapType = storeTableSettings.getWrapType(tableObject);
        align = storeTableSettings.getAlign(tableObject);
        moveText = storeTableSettings.getMoveText(tableObject);
        distance = Common.Utils.Metric.fnRecalcFromMM(storeTableSettings.getWrapDistance(tableObject));
    }
    const metricText = Common.Utils.Metric.getCurrentMetricName();
    const [stateDistance, setDistance] = useState(distance);

    if (!tableObject && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page>
            <Navbar title={_t.textWrap} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem title={_t.textInline} radio checked={wrapType === 'inline'} onChange={() => {props.onWrapType(c_tableWrap.TABLE_WRAP_NONE)}}>
                    {!isAndroid && <Icon slot="media" icon="icon-wrap-table-inline"></Icon>}
                </ListItem>
                <ListItem title={_t.textFlow} radio checked={wrapType === 'flow'} onChange={() => {props.onWrapType(c_tableWrap.TABLE_WRAP_PARALLEL)}}>
                    {!isAndroid && <Icon slot="media" icon="icon-wrap-table-flow"></Icon>}
                </ListItem>
            </List>
            <List>
                <ListItem title={_t.textMoveWithText} className={'inline' === wrapType ? 'disabled' : ''}>
                    <Toggle checked={moveText} onChange={() => {props.onWrapMoveText(!moveText)}}/>
                </ListItem>
            </List>
            {
                wrapType === 'inline' &&
                <Fragment>
                    <BlockTitle>{_t.textAlign}</BlockTitle>
                    <List>
                        <ListItem className='buttons'>
                            <Row>
                                <a className={'button' + (align === c_tableAlign.TABLE_ALIGN_LEFT ? ' active' : '')}
                                   onClick={() => {
                                       props.onWrapAlign(c_tableAlign.TABLE_ALIGN_LEFT)
                                   }}>
                                    <Icon slot="media" icon="icon-block-align-left"></Icon>
                                </a>
                                <a className={'button' + (align === c_tableAlign.TABLE_ALIGN_CENTER ? ' active' : '')}
                                   onClick={() => {
                                       props.onWrapAlign(c_tableAlign.TABLE_ALIGN_CENTER)
                                   }}>
                                    <Icon slot="media" icon="icon-block-align-center"></Icon>
                                </a>
                                <a className={'button' + (align === c_tableAlign.TABLE_ALIGN_RIGHT ? ' active' : '')}
                                   onClick={() => {
                                       props.onWrapAlign(c_tableAlign.TABLE_ALIGN_RIGHT)
                                   }}>
                                    <Icon slot="media" icon="icon-block-align-right"></Icon>
                                </a>
                            </Row>
                        </ListItem>
                    </List>
                </Fragment>
            }
            {
                (wrapType === 'flow') &&
                <Fragment>
                    <BlockTitle>{_t.textDistanceFromText}</BlockTitle>
                    <List>
                        <ListItem>
                            <div slot='inner' style={{width: '100%'}}>
                                <Range min={0} max={200} step={1} value={stateDistance}
                                       onRangeChange={(value) => {setDistance(value)}}
                                       onRangeChanged={(value) => {props.onWrapDistance(value)}}
                                ></Range>
                            </div>
                            <div slot='inner-end' style={{minWidth: '60px', textAlign: 'right'}}>
                                {stateDistance + ' ' + metricText}
                            </div>
                        </ListItem>
                    </List>
                </Fragment>
            }
        </Page>
    )
};

// Style

const StyleTemplates = inject("storeFocusObjects","storeTableSettings")(observer(({onStyleClick,storeTableSettings,storeFocusObjects}) => {
    const tableObject = storeFocusObjects.tableObject;
    const styleId = tableObject && tableObject.get_TableStyle();
    const [stateId, setId] = useState(styleId);
    const styles =  storeTableSettings.styles;

    return (
        <div className="dataview table-styles">
            <ul className="row">
                    {styles.map((style, index) => {
                        return (
                            <li key={index}
                                className={style.templateId === stateId ? 'active' : ''}
                                onClick={() => {onStyleClick(style.templateId); setId(style.templateId)}}>
                                <img src={style.imageUrl}/>
                            </li>
                        )
                    })}
            </ul>
        </div>
    )
}));

const PageStyleOptions = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const tableObject = props.storeFocusObjects.tableObject;
    let tableLook, isFirstRow, isLastRow, isBandHor, isFirstCol, isLastCol, isBandVer;
    if (tableObject) {
        tableLook = tableObject.get_TableLook();
        isFirstRow = tableLook.get_FirstRow();
        isLastRow = tableLook.get_LastRow();
        isBandHor = tableLook.get_BandHor();
        isFirstCol = tableLook.get_FirstCol();
        isLastCol = tableLook.get_LastCol();
        isBandVer = tableLook.get_BandVer();
    }
    return (
        <Page>
            <Navbar title={_t.textOptions} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem title={_t.textHeaderRow}>
                    <Toggle checked={isFirstRow} onChange={() => {props.onCheckTemplateChange(tableLook, 0, !isFirstRow)}}/>
                </ListItem>
                <ListItem title={_t.textTotalRow}>
                    <Toggle checked={isLastRow} onChange={() => {props.onCheckTemplateChange(tableLook, 1, !isLastRow)}}/>
                </ListItem>
                <ListItem title={_t.textBandedRow}>
                    <Toggle checked={isBandHor} onChange={() => {props.onCheckTemplateChange(tableLook, 2, !isBandHor)}}/>
                </ListItem>
            </List>
            <List>
                <ListItem title={_t.textFirstColumn}>
                    <Toggle checked={isFirstCol} onChange={() => {props.onCheckTemplateChange(tableLook, 3, !isFirstCol)}}/>
                </ListItem>
                <ListItem title={_t.textLastColumn}>
                    <Toggle checked={isLastCol} onChange={() => {props.onCheckTemplateChange(tableLook, 4, !isLastCol)}}/>
                </ListItem>
                <ListItem title={_t.textBandedColumn}>
                    <Toggle checked={isBandVer} onChange={() => {props.onCheckTemplateChange(tableLook, 5, !isBandVer)}}/>
                </ListItem>
            </List>
        </Page>
    )
};

const PageCustomFillColor = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const tableObject = props.storeFocusObjects.tableObject;
    let fillColor;
    if (tableObject) {
        fillColor = props.storeTableSettings.getFillColor(tableObject);
        if (typeof fillColor === 'object') {
            fillColor = fillColor.color;
        }
    }
    const onAddNewColor = (colors, color) => {
        props.storePalette.changeCustomColors(colors);
        props.onFillColor(color);
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
            <CustomColorPicker currentColor={fillColor} onAddNewColor={onAddNewColor}/>
        </Page>
    )
};

const TabFillColor = inject("storeFocusObjects", "storeTableSettings", "storePalette")(observer(props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const tableObject = props.storeFocusObjects.tableObject;
    const fillColor = props.storeTableSettings.getFillColor(tableObject);
    const customColors = props.storePalette.customColors;
    const changeColor = (color, effectId, effectValue) => {
        if (color !== 'empty') {
            if (effectId !==undefined ) {
                const newColor = {color: color, effectId: effectId, effectValue: effectValue};
                props.onFillColor(newColor);
            } else {
                props.onFillColor(color);
            }
        } else {
            // open custom color menu
            props.f7router.navigate('/edit-table-custom-fill-color/', {props: {onFillColor: props.onFillColor}});
        }
    };
    return(
       <Fragment>
           <ThemeColorPalette changeColor={changeColor} curColor={fillColor} customColors={customColors} transparent={true}/>
           <List>
               <ListItem title={_t.textAddCustomColor} link={'/edit-table-custom-fill-color/'} routeProps={{
                   onFillColor: props.onFillColor
               }}></ListItem>
           </List>
       </Fragment>
    )
}));

const PageCustomBorderColor = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    let borderColor = props.storeTableSettings.cellBorderColor;
    if (typeof borderColor === 'object') {
        borderColor = borderColor.color;
    }
    const onAddNewColor = (colors, color) => {
        props.storePalette.changeCustomColors(colors);
        props.storeTableSettings.updateCellBorderColor(color);
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
            <CustomColorPicker currentColor={borderColor} onAddNewColor={onAddNewColor}/>
        </Page>
    )
};

const PageBorderColor = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const storeTableSettings = props.storeTableSettings;
    const borderColor = storeTableSettings.cellBorderColor;
    const customColors = props.storePalette.customColors;
    const changeColor = (color, effectId, effectValue) => {
        if (color !== 'empty') {
            if (effectId !==undefined ) {
                const newColor = {color: color, effectId: effectId, effectValue: effectValue};
                storeTableSettings.updateCellBorderColor(newColor);
            } else {
                storeTableSettings.updateCellBorderColor(color);
            }
        } else {
            // open custom color menu
            props.f7router.navigate('/edit-table-custom-border-color/');
        }
    };
    return(
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
                <ListItem title={_t.textAddCustomColor} link={'/edit-table-custom-border-color/'}></ListItem>
            </List>
        </Page>
    )
};

const TabBorder = inject("storeFocusObjects", "storeTableSettings")(observer(props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});

    const storeTableSettings = props.storeTableSettings;
    const borderSizeTransform = storeTableSettings.borderSizeTransform();
    const borderSize = storeTableSettings.cellBorderWidth;
    const displayBorderSize = borderSizeTransform.indexSizeByValue(borderSize);
    const displayTextBorderSize = borderSizeTransform.sizeByValue(borderSize);
    const [stateBorderSize, setBorderSize] = useState(displayBorderSize);
    const [stateTextBorderSize, setTextBorderSize] = useState(displayTextBorderSize);

    const onBorderType = (type) => {
        storeTableSettings.updateBordersStyle(type);
        props.onBorderTypeClick(storeTableSettings.cellBorders);
    };

    const borderColor = storeTableSettings.cellBorderColor;
    const displayBorderColor = borderColor !== 'transparent' ? `#${(typeof borderColor === "object" ? borderColor.color : borderColor)}` : borderColor;

    return (
        <List>
            <ListItem>
                <div slot="root-start" className='inner-range-title'>{_t.textSize}</div>
                <div slot='inner' style={{width: '100%'}}>
                    <Range min="0" max="7" step="1" value={stateBorderSize}
                           onRangeChange={(value) => {
                               setBorderSize(value);
                               setTextBorderSize(borderSizeTransform.sizeByIndex(value));
                           }}
                           onRangeChanged={(value) => {storeTableSettings.updateCellBorderWidth(borderSizeTransform.sizeByIndex(value));}}
                    ></Range>
                </div>
                <div slot='inner-end' style={{minWidth: '60px', textAlign: 'right'}}>
                    {stateTextBorderSize + ' ' + Common.Utils.Metric.getMetricName(Common.Utils.Metric.c_MetricUnits.pt)}
                </div>
            </ListItem>
            <ListItem title={_t.textColor} link='/edit-table-border-color/'>
                <span className="color-preview"
                      slot="after"
                      style={{ background: displayBorderColor}}
                ></span>
            </ListItem>
            <ListItem className='buttons table-presets'>
                <Row>
                    <a className={'item-link button'} onClick={() => {onBorderType("lrtbcm")}}>
                        <Icon slot="media" icon="icon-table-borders-all"></Icon>
                    </a>
                    <a className={'item-link button'} onClick={() => {onBorderType("")}}>
                        <Icon slot="media" icon="icon-table-borders-none"></Icon>
                    </a>
                    <a className={'item-link button'} onClick={() => {onBorderType("cm")}}>
                        <Icon slot="media" icon="icon-table-borders-inner"></Icon>
                    </a>
                    <a className={'item-link button'} onClick={() => {onBorderType("lrtb")}}>
                        <Icon slot="media" icon="icon-table-borders-outer"></Icon>
                    </a>
                    <a className={'item-link button'} onClick={() => {onBorderType("l")}}>
                        <Icon slot="media" icon="icon icon-table-borders-left"></Icon>
                    </a>
                </Row>
            </ListItem>
            <ListItem className='buttons table-presets'>
                <Row>
                    <a className={'item-link button'} onClick={() => {onBorderType("c")}}>
                        <Icon slot="media" icon="icon-table-borders-center"></Icon>
                    </a>
                    <a className={'item-link button'} onClick={() => {onBorderType("r")}}>
                        <Icon slot="media" icon="icon-table-borders-right"></Icon>
                    </a>
                    <a className={'item-link button'} onClick={() => {onBorderType("t")}}>
                        <Icon slot="media" icon="icon-table-borders-top"></Icon>
                    </a>
                    <a className={'item-link button'} onClick={() => {onBorderType("m")}}>
                        <Icon slot="media" icon="icon-table-borders-middle"></Icon>
                    </a>
                    <a className={'item-link button'} onClick={() => {onBorderType("b")}}>
                        <Icon slot="media" icon="icon-table-borders-bottom"></Icon>
                    </a>
                </Row>
            </ListItem>
        </List>
    )
}));

const PageStyle = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const storeTableSettings = props.storeTableSettings;
    const templates = storeTableSettings.styles;
    const isAndroid = Device.android;

    const tableObject = props.storeFocusObjects.tableObject;
    if (!tableObject && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page>
            <Navbar backLink={_t.textBack}>
                <div className="tab-buttons tabbar">
                    <Link key={"de-link-table-style"} tabLink={"#edit-table-style"} tabLinkActive={true}>{_t.textStyle}</Link>
                    <Link key={"de-link-table-fill"} tabLink={"#edit-table-fill"}>{_t.textFill}</Link>
                    <Link key={"de-link-table-border"} tabLink={"#edit-table-border"}>{_t.textBorder}</Link>
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
                <Tab key={"de-tab-table-style"} id={"edit-table-style"} className="page-content no-padding-top" tabActive={true}>
                    <List>
                        <ListItem>
                            <StyleTemplates templates={templates} onStyleClick={props.onStyleClick}/>
                        </ListItem>
                    </List>
                    <List>
                        <ListItem title={_t.textStyleOptions} link={'/edit-table-style-options/'} routeProps={{
                            onCheckTemplateChange: props.onCheckTemplateChange
                        }}/>
                    </List>
                </Tab>
                <Tab key={"de-tab-table-fill"} id={"edit-table-fill"} className="page-content no-padding-top">
                    <TabFillColor onFillColor={props.onFillColor}/>
                </Tab>
                <Tab key={"de-tab-table-border"} id={"edit-table-border"} className="page-content no-padding-top">
                    <TabBorder onBorderTypeClick={props.onBorderTypeClick}/>
                </Tab>
            </Tabs>
        </Page>
    )
};

const EditTable = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    return (
        <Fragment>
            <List>
                <ListItem className='buttons'>
                    <Row>
                        <a className={'item-link button'} onClick={() => {props.onAddColumnLeft()}}>
                            <Icon slot="media" icon="icon-table-add-column-left"></Icon>
                        </a>
                        <a className={'item-link button'} onClick={() => {props.onAddColumnRight()}}>
                            <Icon slot="media" icon="icon-table-add-column-right"></Icon>
                        </a>
                        <a className={'item-link button'} onClick={() => {props.onAddRowAbove()}}>
                            <Icon slot="media" icon="icon-table-add-row-above"></Icon>
                        </a>
                        <a className={'item-link button'} onClick={() => {props.onAddRowBelow()}}>
                            <Icon slot="media" icon="icon-table-add-row-below"></Icon>
                        </a>
                    </Row>
                </ListItem>
                <ListItem className='buttons'>
                    <Row>
                        <a className={'item-link button'} onClick={() => {props.onRemoveColumn()}}>
                            <Icon slot="media" icon="icon-table-remove-column"></Icon>
                        </a>
                        <a className={'item-link button'} onClick={() => {props.onRemoveRow()}}>
                            <Icon slot="media" icon="icon icon-table-remove-row"></Icon>
                        </a>
                    </Row>
                </ListItem>
                <List className="buttons-list">
                    <ListButton title={_t.textRemoveTable} onClick={() => {props.onRemoveTable()}} className='button-red button-fill button-raised'></ListButton>
                </List>
            </List>
            <List>
                <ListItem title={_t.textTableOptions} link='/edit-table-options/' routeProps={{
                    onCellMargins: props.onCellMargins,
                    onOptionResize: props.onOptionResize,
                    onOptionRepeat: props.onOptionRepeat
                }}></ListItem>
                <ListItem title={_t.textStyle} link='/edit-table-style/' routeProps={{
                    onStyleClick: props.onStyleClick,
                    onCheckTemplateChange: props.onCheckTemplateChange,
                    onFillColor: props.onFillColor,
                    onBorderTypeClick: props.onBorderTypeClick
                }}></ListItem>
                <ListItem title={_t.textWrap} link='/edit-table-wrap/' routeProps={{
                    onWrapType: props.onWrapType,
                    onWrapAlign: props.onWrapAlign,
                    onWrapMoveText: props.onWrapMoveText,
                    onWrapDistance: props.onWrapDistance
                }}></ListItem>
            </List>
        </Fragment>
    )
};

const EditTableContainer = inject("storeFocusObjects")(observer(EditTable));
const PageTableOptionsContainer = inject("storeFocusObjects","storeTableSettings")(observer(PageTableOptions));
const PageTableWrap = inject("storeFocusObjects","storeTableSettings")(observer(PageWrap));
const PageTableStyle = inject("storeFocusObjects","storeTableSettings")(observer(PageStyle));
const PageTableStyleOptions = inject("storeFocusObjects","storeTableSettings")(observer(PageStyleOptions));
const PageTableCustomFillColor = inject("storeFocusObjects","storeTableSettings", "storePalette")(observer(PageCustomFillColor));
const PageTableBorderColor = inject("storeFocusObjects","storeTableSettings", "storePalette")(observer(PageBorderColor));
const PageTableCustomBorderColor = inject("storeFocusObjects","storeTableSettings", "storePalette")(observer(PageCustomBorderColor));


export {EditTableContainer as EditTable,
        PageTableOptionsContainer as PageTableOptions,
        PageTableWrap,
        PageTableStyle,
        PageTableStyleOptions,
        PageTableCustomFillColor,
        PageTableBorderColor,
        PageTableCustomBorderColor}