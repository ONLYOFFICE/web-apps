import React, {Fragment, useState, useEffect} from 'react';
import {observer, inject} from "mobx-react";
import {f7, Page, Navbar, List, ListItem, ListButton, Row, BlockTitle,SkeletonBlock, Range, Toggle, Icon, Link, Tabs, Tab, NavRight} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';
import {CustomColorPicker, ThemeColorPalette} from "../../../../../common/mobile/lib/component/ThemeColorPalette.jsx";

// Style

const StyleTemplates = inject("storeFocusObjects","storeTableSettings")(observer(({onStyleClick,storeTableSettings,storeFocusObjects,onGetTableStylesPreviews}) => {
    const tableObject = storeFocusObjects.tableObject;
    const styleId = tableObject ? tableObject.get_TableStyle() : null;
    const [stateId, setId] = useState(styleId);
    const styles =  storeTableSettings.arrayStyles;

    useEffect(() => {
        if(!styles.length) onGetTableStylesPreviews();
    }, []);

    if (!tableObject && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }
            
    return (
        <div className="dataview table-styles">
            <ul className="row">
                { !styles.length ?
                        Array.from({ length: 34 }).map((item,index) => (
                        <li className='skeleton-list' key={index}>    
                            <SkeletonBlock  width='70px' height='8px'  effect='wave'/>
                            <SkeletonBlock  width='70px' height='8px'  effect='wave' />
                            <SkeletonBlock  width='70px' height='8px'  effect='wave' />
                            <SkeletonBlock  width='70px' height='8px'  effect='wave' />
                            <SkeletonBlock  width='70px' height='8px'  effect='wave' />
                        </li> 
                    )) :
                        styles.map((style, index) => {
                            return (
                                <li key={index}
                                    className={style.templateId === stateId ? 'active' : ''}
                                    onClick={() => {onStyleClick(style.templateId); setId(style.templateId)}}>
                                    <img src={style.imageUrl}/>
                                </li>
                            )
                        })
                    }
            </ul>
        </div>
    )
}));

const PageStyleOptions = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

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
            <Navbar title={_t.textOptions} backLink={_t.textBack} onBackClick={props.onGetTableStylesPreviews}>
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
                    <Toggle checked={isFirstRow} onToggleChange={() => {props.onCheckTemplateChange(tableLook, 0, !isFirstRow)}}/>
                </ListItem>
                <ListItem title={_t.textTotalRow}>
                    <Toggle checked={isLastRow} onToggleChange={() => {props.onCheckTemplateChange(tableLook, 1, !isLastRow)}}/>
                </ListItem>
                <ListItem title={_t.textBandedRow}>
                    <Toggle checked={isBandHor} onToggleChange={() => {props.onCheckTemplateChange(tableLook, 2, !isBandHor)}}/>
                </ListItem>
            </List>
            <List>
                <ListItem title={_t.textFirstColumn}>
                    <Toggle checked={isFirstCol} onToggleChange={() => {props.onCheckTemplateChange(tableLook, 3, !isFirstCol)}}/>
                </ListItem>
                <ListItem title={_t.textLastColumn}>
                    <Toggle checked={isLastCol} onToggleChange={() => {props.onCheckTemplateChange(tableLook, 4, !isLastCol)}}/>
                </ListItem>
                <ListItem title={_t.textBandedColumn}>
                    <Toggle checked={isBandVer} onToggleChange={() => {props.onCheckTemplateChange(tableLook, 5, !isBandVer)}}/>
                </ListItem>
            </List>
        </Page>
    )
};

const PageCustomFillColor = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const tableObject = props.storeFocusObjects.tableObject;
    let fillColor = tableObject && props.storeTableSettings.getFillColor(tableObject);

    if (typeof fillColor === 'object') {
        fillColor = fillColor.color;
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
    const _t = t('View.Edit', {returnObjects: true});
    const tableObject = props.storeFocusObjects.tableObject;
    const fillColor = tableObject && props.storeTableSettings.getFillColor(tableObject);
    const customColors = props.storePalette.customColors;

    const changeColor = (color, effectId, effectValue) => {
        if (color !== 'empty') {
            if (effectId !== undefined ) {
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

    return (
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
    const _t = t('View.Edit', {returnObjects: true});
    let borderColor = props.storeTableSettings.cellBorderColor;

    if (typeof borderColor === 'object') {
        borderColor = borderColor.color;
    }

    const onAddNewColor = (colors, color) => {
        props.storePalette.changeCustomColors(colors);
        props.storeTableSettings.updateCellBorderColor(color);
        props.f7router.back();
    };
    const autoColor = props.storeTableSettings.colorAuto === 'auto' ? window.getComputedStyle(document.getElementById('font-color-auto')).backgroundColor : null;
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
            <CustomColorPicker autoColor={autoColor} currentColor={borderColor} onAddNewColor={onAddNewColor}/>
        </Page>
    )
};

const PageBorderColor = props => {
    const { t } = useTranslation();
    const storeTableSettings = props.storeTableSettings;
    const borderColor = storeTableSettings.cellBorderColor;
    const customColors = props.storePalette.customColors;

    const changeColor = (color, effectId, effectValue) => {
        if (color !== 'empty') {
            storeTableSettings.setAutoColor(null);
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

    return (
        <Page>
            <Navbar title={t('View.Edit.textColor')} backLink={t('View.Edit.textBack')}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem className={'item-color-auto' + (storeTableSettings.colorAuto === 'auto' ? ' active' : '')} title={t('View.Edit.textAutomatic')} onClick={() => {
                   storeTableSettings.setAutoColor('auto');
                }}>
                    <div slot="media">
                        <div id='font-color-auto' className={'color-auto'}></div>
                    </div>
                </ListItem>
            </List>
            <ThemeColorPalette changeColor={changeColor} curColor={storeTableSettings.colorAuto || borderColor} customColors={customColors}/>
            <List>
                <ListItem title={t('View.Edit.textAddCustomColor')} link={'/edit-table-custom-border-color/'}></ListItem>
            </List>
        </Page>
    )
};

const TabBorder = inject("storeFocusObjects", "storeTableSettings")(observer(props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
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
                <div className='range-number' slot='inner-end'>
                    {stateTextBorderSize + ' ' + Common.Utils.Metric.getMetricName(Common.Utils.Metric.c_MetricUnits.pt)}
                </div>
            </ListItem>
            <ListItem title={_t.textColor} link='/edit-table-border-color/'>
                <span className="color-preview"
                      slot="after"
                      style={{ background: storeTableSettings.colorAuto === 'auto' ? '#000' : displayBorderColor}}
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
    const _t = t('View.Edit', {returnObjects: true});
    const storeTableSettings = props.storeTableSettings;
    const templates = storeTableSettings.styles;
    const isAndroid = Device.android;

    return (
        <Page>
            <Navbar backLink={_t.textBack}>
                <div className="tab-buttons tabbar">
                    <Link key={"pe-link-table-style"} tabLink={"#edit-table-style"} tabLinkActive={true}>{_t.textStyle}</Link>
                    <Link key={"pe-link-table-fill"} tabLink={"#edit-table-fill"}>{_t.textFill}</Link>
                    <Link key={"pe-link-table-border"} tabLink={"#edit-table-border"}>{_t.textBorder}</Link>
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
                <Tab key={"pe-tab-table-style"} id={"edit-table-style"} className="page-content no-padding-top" tabActive={true}>
                    <List>
                        <ListItem>
                            <StyleTemplates onGetTableStylesPreviews={props.onGetTableStylesPreviews} templates={templates} onStyleClick={props.onStyleClick}/>
                        </ListItem>
                    </List>
                    <List>
                        <ListItem title={_t.textStyleOptions} link={'/edit-table-style-options/'} routeProps={{
                            onCheckTemplateChange: props.onCheckTemplateChange,
                            onGetTableStylesPreviews: props.onGetTableStylesPreviews,
                        }}/>
                    </List>
                </Tab>
                <Tab key={"pe-tab-table-fill"} id={"edit-table-fill"} className="page-content no-padding-top">
                    <TabFillColor onFillColor={props.onFillColor} f7router={props.f7router}/>
                </Tab>
                <Tab key={"pe-tab-table-border"} id={"edit-table-border"} className="page-content no-padding-top">
                    <TabBorder onBorderTypeClick={props.onBorderTypeClick}/>
                </Tab>
            </Tabs>
        </Page>
    )
};

const PageReorder = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    const tableObject = props.storeFocusObjects.tableObject;
    if (!tableObject && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page>
            <Navbar title={t('View.Edit.textArrange')} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem title={_t.textBringToForeground} link='#' onClick={() => {props.onReorder('all-up')}} className='no-indicator'>
                    <Icon slot="media" icon="icon-move-foreground"></Icon>
                </ListItem>
                <ListItem title={_t.textSendToBackground} link='#' onClick={() => {props.onReorder('all-down')}} className='no-indicator'>
                    <Icon slot="media" icon="icon-move-background"></Icon>
                </ListItem>
                <ListItem title={_t.textMoveForward} link='#' onClick={() => {props.onReorder('move-up')}} className='no-indicator'>
                    <Icon slot="media" icon="icon-move-forward"></Icon>
                </ListItem>
                <ListItem title={_t.textMoveBackward} link='#' onClick={() => {props.onReorder('move-down')}} className='no-indicator'>
                    <Icon slot="media" icon="icon-move-backward"></Icon>
                </ListItem>
            </List>
        </Page>
    )
};

const PageAlign = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    const tableObject = props.storeFocusObjects.tableObject;
    if (!tableObject && Device.phone) {
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

const EditTable = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const metricText = Common.Utils.Metric.getCurrentMetricName();
    const storeFocusObjects = props.storeFocusObjects;
    const tableObject = storeFocusObjects.tableObject;
    const storeTableSettings = props.storeTableSettings;
    const distance = Common.Utils.Metric.fnRecalcFromMM(storeTableSettings.getCellMargins(tableObject));
    const [stateDistance, setDistance] = useState(distance);

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
                <ListItem title={_t.textStyle} link='/edit-table-style/' routeProps={{
                    onStyleClick: props.onStyleClick,
                    onCheckTemplateChange: props.onCheckTemplateChange,
                    onGetTableStylesPreviews: props.onGetTableStylesPreviews,
                    onFillColor: props.onFillColor,
                    onBorderTypeClick: props.onBorderTypeClick
                }}></ListItem>
                 <ListItem title={t('View.Edit.textArrange')} link="/edit-table-reorder/" routeProps={{
                    onReorder: props.onReorder
                }}></ListItem>
                <ListItem title={_t.textAlign} link="/edit-table-align/" routeProps={{
                    onAlign: props.onAlign
                }}></ListItem>
                <BlockTitle>{_t.textCellMargins}</BlockTitle>
                <List>
                    <ListItem>
                        <div slot='inner' style={{width: '100%'}}>
                            <Range min={0} max={200} step={1} value={stateDistance}
                                onRangeChange={(value) => {setDistance(value)}}
                                onRangeChanged={(value) => {props.onOptionMargin(value)}}
                            ></Range>
                        </div>
                        <div className='range-number' slot='inner-end'>
                            {stateDistance + ' ' + metricText}
                        </div>
                    </ListItem>
                </List>
            </List>
        </Fragment>
    )
};

const EditTableContainer = inject("storeFocusObjects", "storeTableSettings")(observer(EditTable));
const PageTableStyle = inject("storeFocusObjects","storeTableSettings")(observer(PageStyle));
const PageTableStyleOptions = inject("storeFocusObjects","storeTableSettings")(observer(PageStyleOptions));
const PageTableCustomFillColor = inject("storeFocusObjects","storeTableSettings", "storePalette")(observer(PageCustomFillColor));
const PageTableBorderColor = inject("storeFocusObjects","storeTableSettings", "storePalette")(observer(PageBorderColor));
const PageTableCustomBorderColor = inject("storeFocusObjects","storeTableSettings", "storePalette")(observer(PageCustomBorderColor));
const PageTableReorder = inject("storeFocusObjects")(observer(PageReorder));
const PageTableAlign = inject("storeFocusObjects")(observer(PageAlign));

export {
    EditTableContainer as EditTable,
    PageTableStyle,
    PageTableStyleOptions,
    PageTableCustomFillColor,
    PageTableBorderColor,
    PageTableCustomBorderColor,
    PageTableReorder,
    PageTableAlign
}