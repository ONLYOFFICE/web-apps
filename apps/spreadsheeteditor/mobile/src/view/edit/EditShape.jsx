import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";
import {f7, Page, Navbar, NavRight, List, ListItem, Link, Icon, Range, Tab, Tabs, ListButton} from 'framework7-react';
import { ThemeColorPalette, CustomColorPicker } from '../../../../../common/mobile/lib/component/ThemeColorPalette.jsx';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';
import SvgIcon from '@common/lib/component/SvgIcon';
import IconExpandDownIos from '@common-ios-icons/icon-expand-down.svg?ios';
import IconExpandDownAndroid from '@common-android-icons/icon-expand-down.svg';
import IconMoveForeground from '@common-icons/icon-move-foreground.svg';
import IconMoveBackground from '@common-icons/icon-move-background.svg';
import IconMoveForward from '@common-icons/icon-move-forward.svg';
import IconMoveBackward from '@common-icons/icon-move-backward.svg';

const EditShape = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeFocusObjects = props.storeFocusObjects;
    const objects = storeFocusObjects.objects;
    const shapeObject = storeFocusObjects.shapeObject;
    const canFill = shapeObject && shapeObject.get_ShapeProperties().asc_getCanFill();

    const shapeType = shapeObject.get_ShapeProperties().asc_getType();
    const hideChangeType = shapeObject.get_ShapeProperties().get_FromChart() || shapeObject.get_ShapeProperties().get_FromSmartArt() 
    || shapeType=='line' || shapeType=='bentConnector2' || shapeType=='bentConnector3'
    || shapeType=='bentConnector4' || shapeType=='bentConnector5' || shapeType=='curvedConnector2'
    || shapeType=='curvedConnector3' || shapeType=='curvedConnector4' || shapeType=='curvedConnector5'
    || shapeType=='straightConnector1';

    const isSmartArtInternal = shapeObject.get_ShapeProperties().get_FromSmartArtInternal();
    let disableRemove = storeFocusObjects.selections.indexOf('text') > -1;

    return (
        <Fragment>
            <List>
                {canFill ?
                    <ListItem title={_t.textStyle} link="/edit-style-shape/" routeProps={{
                        onFillColor: props.onFillColor,
                        onBorderSize: props.onBorderSize,
                        onBorderColor: props.onBorderColor,
                        onOpacity: props.onOpacity
                    }}></ListItem>
                    :
                    <ListItem title={_t.textStyle} link="/edit-style-shape-no-fill/" routeProps={{
                        onBorderSize: props.onBorderSize,
                        onBorderColor: props.onBorderColor
                    }}></ListItem>
                }
                {!hideChangeType &&
                    <ListItem title={t('View.Edit.textChangeShape')} link="/edit-replace-shape/" routeProps={{
                        onReplace: props.onReplace
                    }}></ListItem>
                }
                {(!isSmartArtInternal && objects.indexOf('image') === -1) &&
                    <ListItem title={t('View.Edit.textArrange')} link="/edit-reorder-shape/" routeProps={{
                        onReorder: props.onReorder
                    }}></ListItem>
                }
            </List>
            {objects.indexOf('image') === -1 &&
                <List className="buttons-list">
                    <ListButton className={`button-red button-fill button-raised${disableRemove ? ' disabled' : ''}`} onClick={props.onRemoveShape}>{_t.textRemoveShape}</ListButton>
                </List>
            }
        </Fragment>
    )
};

const PaletteFill = inject("storeFocusObjects", "storeShapeSettings", "storePalette")(observer(props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeShapeSettings = props.storeShapeSettings;
    const shapeObject = props.storeFocusObjects.shapeObject.get_ShapeProperties();
    const curFillColor = storeShapeSettings.fillColor ? storeShapeSettings.fillColor : storeShapeSettings.getFillColor(shapeObject);
    const customColors = props.storePalette.customColors;

    const changeColor = (color, effectId, effectValue) => {
        if (color !== 'empty') {
            if (effectId !==undefined ) {
                const newColor = {color: color, effectId: effectId, effectValue: effectValue};
                props.onFillColor(newColor);
                storeShapeSettings.setFillColor(newColor);
            } else {
                props.onFillColor(color);
                storeShapeSettings.setFillColor(color);
            }
        } else {
            // open custom color menu
            props.f7router.navigate('/edit-shape-custom-fill-color/', {props: {onFillColor: props.onFillColor}});
        }
    };

    return (
        <Fragment>
            <ThemeColorPalette changeColor={changeColor} curColor={curFillColor} customColors={customColors} transparent={true}/>
            <List>
                <ListItem title={_t.textAddCustomColor} link={'/edit-shape-custom-fill-color/'} routeProps={{
                    onFillColor: props.onFillColor
                }}></ListItem>
            </List>
        </Fragment>
    )
}));

const PageStyle = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const isAndroid = Device.android;
    const storeShapeSettings = props.storeShapeSettings;
    const storeFocusObjects = props.storeFocusObjects;
    const shapeObject = storeFocusObjects.shapeObject.get_ShapeProperties();
    const stroke = shapeObject.get_stroke();
    
    // Init border size
    
    const borderSizeTransform = storeShapeSettings.borderSizeTransform();
    const borderSize = stroke.get_width() * 72.0 / 25.4;
    const borderType = stroke.get_type();
    const displayBorderSize = (borderType == Asc.c_oAscStrokeType.STROKE_NONE) ? 0 : borderSizeTransform.indexSizeByValue(borderSize);
    const displayTextBorderSize = (borderType == Asc.c_oAscStrokeType.STROKE_NONE) ? 0 : borderSizeTransform.sizeByValue(borderSize);
    const [stateBorderSize, setBorderSize] = useState(displayBorderSize);
    const [stateTextBorderSize, setTextBorderSize] = useState(displayTextBorderSize);
    
    // Init border color
    
    const borderColor = !storeShapeSettings.borderColorView ? storeShapeSettings.initBorderColorView(shapeObject) : storeShapeSettings.borderColorView;
    const displayBorderColor = borderColor !== 'transparent' ? `#${(typeof borderColor === "object" ? borderColor.color : borderColor)}` : borderColor;
    
    // Init opacity
    
    const transparent = shapeObject.get_fill().asc_getTransparent();
    const opacity = transparent !== null && transparent !== undefined ? transparent / 2.55 : 100;
    const [stateOpacity, setOpacity] = useState(Math.round(opacity));

    if ((!shapeObject || storeFocusObjects.chartObject || storeFocusObjects.focusOn === 'cell') && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }
   
    return (
        <Page>
            <Navbar backLink={_t.textBack}>
                <div className='tab-buttons tabbar'>
                    <Link key={"se-link-shape-fill"}  tabLink={"#edit-shape-fill"} tabLinkActive={true}>{_t.textFill}</Link>
                    <Link key={"se-link-shape-border"}  tabLink={"#edit-shape-border"}>{_t.textBorder}</Link>
                    <Link key={"se-link-shape-effects"}  tabLink={"#edit-shape-effects"}>{_t.textEffects}</Link>
                    {isAndroid && <span className='tab-link-highlight'></span>}
                </div>
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
            <Tabs animated>
                <Tab key={"se-tab-shape-fill"} id={"edit-shape-fill"} className="page-content no-padding-top" tabActive={true}>
                    <PaletteFill onFillColor={props.onFillColor} f7router={props.f7router}/>
                </Tab>
                <Tab key={"se-tab-shape-border"} id={"edit-shape-border"} className="page-content no-padding-top">
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
                        <ListItem title={_t.textColor} link='/edit-shape-border-color/' routeProps={{
                            onBorderColor: props.onBorderColor
                        }}>
                            <span className="color-preview"
                                  slot="after"
                                  style={{ background: displayBorderColor}}
                            ></span>
                        </ListItem>
                    </List>
                </Tab>
                <Tab key={"se-tab-shape-effects"} id={"edit-shape-effects"} className="page-content no-padding-top">
                    <List>
                        <ListItem>
                            <div slot="root-start" className='inner-range-title'>{_t.textOpacity}</div>
                            <div slot='inner' style={{width: '100%'}}>
                                <Range min={0} max={100} step={1} value={stateOpacity}
                                       onRangeChange={(value) => {setOpacity(value)}}
                                       onRangeChanged={(value) => {props.onOpacity(value)}}
                                ></Range>
                            </div>
                            <div slot='inner-end' style={{minWidth: '60px', textAlign: 'right'}}>
                                {stateOpacity + ' %'}
                            </div>
                        </ListItem>
                    </List>
                </Tab>
            </Tabs>
        </Page>
    )
};

const PageCustomFillColor = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    let fillColor = props.storeShapeSettings.fillColor;

    if (typeof fillColor === 'object') {
        fillColor = fillColor.color;
    }

    const onAddNewColor = (colors, color) => {
        props.storePalette.changeCustomColors(colors);
        props.onFillColor(color);
        props.storeShapeSettings.setFillColor(color);
        props.f7router.back();
    };

    return(
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

const PageStyleNoFill = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeShapeSettings = props.storeShapeSettings;
    const shapeObject = props.storeFocusObjects.shapeObject.get_ShapeProperties();
    const stroke = shapeObject.get_stroke();

    // Init border size

    const borderSizeTransform = storeShapeSettings.borderSizeTransform();
    const borderSize = stroke.get_width() * 72.0 / 25.4;
    const borderType = stroke.get_type();
    const displayBorderSize = (borderType == Asc.c_oAscStrokeType.STROKE_NONE) ? 0 : borderSizeTransform.indexSizeByValue(borderSize);
    const displayTextBorderSize = (borderType == Asc.c_oAscStrokeType.STROKE_NONE) ? 0 : borderSizeTransform.sizeByValue(borderSize);
    const [stateBorderSize, setBorderSize] = useState(displayBorderSize);
    const [stateTextBorderSize, setTextBorderSize] = useState(displayTextBorderSize);

    // Init border color

    const borderColor = !storeShapeSettings.borderColorView ? storeShapeSettings.initBorderColorView(shapeObject) : storeShapeSettings.borderColorView;
    const displayBorderColor = borderColor !== 'transparent' ? `#${(typeof borderColor === "object" ? borderColor.color : borderColor)}` : borderColor;

    return (
        <Page>
            <Navbar backLink={_t.textBack} title={_t.textBorder}>
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
                <ListItem title={_t.textColor} link='/edit-shape-border-color/' routeProps={{
                    onBorderColor: props.onBorderColor
                }}>
                    <span className="color-preview"
                          slot="after"
                          style={{ background: displayBorderColor}}
                    ></span>
                </ListItem>
            </List>
        </Page>
    )
};

const PageReplace = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeShapeSettings = props.storeShapeSettings;
    let shapes = storeShapeSettings.getStyleGroups();
    shapes.splice(0, 1); // Remove line shapes

    const storeFocusObjects = props.storeFocusObjects;
    if ((!storeFocusObjects.shapeObject || storeFocusObjects.chartObject || storeFocusObjects.focusOn === 'cell') && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page className="shapes dataview">
            <Navbar title={_t.textReplace} backLink={_t.textBack}>
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
            {shapes.map((row, indexRow) => {
                return (
                    <ul className="row" key={'shape-row-' + indexRow}>
                        {row.map((shape, index) => {
                            return (
                                <li key={'shape-' + indexRow + '-' + index} onClick={() => {props.onReplace(shape.type)}}>
                                    <div className="thumb"
                                         style={{WebkitMaskImage: `url('resources/img/shapes/${shape.thumb}')`}}>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )
            })}
        </Page>
    )
};

const PageReorder = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    const storeFocusObjects = props.storeFocusObjects;
    if ((!storeFocusObjects.shapeObject || storeFocusObjects.chartObject || storeFocusObjects.focusOn === 'cell') && Device.phone) {
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
                <ListItem title={_t.textBringToForeground} link='#' onClick={() => {props.onReorder('all-up')}} className='no-indicator'>
                    <SvgIcon slot="media" symbolId={IconMoveForeground.id} className={'icon icon-svg'} /> 
                </ListItem>
                <ListItem title={_t.textSendToBackground} link='#' onClick={() => {props.onReorder('all-down')}} className='no-indicator'>
                    <SvgIcon slot="media" symbolId={IconMoveBackground.id} className={'icon icon-svg'} />
                </ListItem>
                <ListItem title={_t.textMoveForward} link='#' onClick={() => {props.onReorder('move-up')}} className='no-indicator'>
                    <SvgIcon slot="media" symbolId={IconMoveForward.id} className={'icon icon-svg'} />
                </ListItem>
                <ListItem title={_t.textMoveBackward} link='#' onClick={() => {props.onReorder('move-down')}} className='no-indicator'>
                    <SvgIcon slot="media" symbolId={IconMoveBackward.id} className={'icon icon-svg'} />
                </ListItem>
            </List>
        </Page>
    )
};

const PageBorderColor = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const borderColor = props.storeShapeSettings.borderColorView;
    const customColors = props.storePalette.customColors;

    const changeColor = (color, effectId, effectValue) => {
        if (color !== 'empty') {
            if (effectId !==undefined ) {
                const newColor = {color: color, effectId: effectId, effectValue: effectValue};
                props.onBorderColor(newColor);
                props.storeShapeSettings.setBorderColor(newColor);
            } else {
                props.onBorderColor(color);
                props.storeShapeSettings.setBorderColor(color);
            }
        } else {
            // open custom color menu
            props.f7router.navigate('/edit-shape-custom-border-color/', {props: {onBorderColor: props.onBorderColor}});
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
            <ThemeColorPalette changeColor={changeColor} curColor={borderColor} customColors={customColors}/>
            <List>
                <ListItem title={_t.textAddCustomColor} link={'/edit-shape-custom-border-color/'} routeProps={{
                    onBorderColor: props.onBorderColor
                }}></ListItem>
            </List>
        </Page>
    )
};

const PageCustomBorderColor = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    let borderColor = props.storeShapeSettings.borderColorView;
    if (typeof borderColor === 'object') {
        borderColor = borderColor.color;
    }
    const onAddNewColor = (colors, color) => {
        props.storePalette.changeCustomColors(colors);
        props.onBorderColor(color);
        props.storeShapeSettings.setBorderColor(color);
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

const EditShapeContainer = inject("storeShapeSettings", "storeFocusObjects")(observer(EditShape));
const PageShapeStyle = inject("storeFocusObjects", "storeShapeSettings")(observer(PageStyle));
const PageShapeStyleNoFill = inject("storeFocusObjects", "storeShapeSettings")(observer(PageStyleNoFill));
const PageShapeCustomFillColor = inject("storeFocusObjects", "storeShapeSettings", "storePalette")(observer(PageCustomFillColor));
const PageReplaceContainer = inject("storeShapeSettings","storeFocusObjects")(observer(PageReplace));
const PageReorderContainer = inject("storeFocusObjects")(observer(PageReorder));
const PageShapeBorderColor = inject("storeShapeSettings", "storePalette")(observer(PageBorderColor));
const PageShapeCustomBorderColor = inject("storeShapeSettings", "storePalette")(observer(PageCustomBorderColor));

export {
    EditShapeContainer as EditShape,
    PageShapeStyle,
    PageShapeStyleNoFill,
    PageReplaceContainer,
    PageReorderContainer,
    PageShapeBorderColor,
    PageShapeCustomBorderColor,
    PageShapeCustomFillColor
}