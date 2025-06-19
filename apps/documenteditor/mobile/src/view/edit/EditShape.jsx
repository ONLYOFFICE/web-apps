import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";
import {List, ListItem, Icon, Page, Navbar, NavRight, BlockTitle, Toggle, Range, ListButton, Link, Tabs, Tab} from 'framework7-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';
import {CustomColorPicker, ThemeColorPalette} from "../../../../../common/mobile/lib/component/ThemeColorPalette.jsx";
import SvgIcon from '@common/lib/component/SvgIcon';
import IconExpandDownAndroid from '@common-android-icons/icon-expand-down.svg';
import IconExpandDownIos from '@common-ios-icons/icon-expand-down.svg?ios';
import IconWrapInline from '@ios-icons/icon-wrap-inline.svg';
import IconWrapSquare from '@ios-icons/icon-wrap-square.svg';
import IconWrapTight from '@ios-icons/icon-wrap-tight.svg';
import IconWrapThrough from '@ios-icons/icon-wrap-through.svg';
import IconWrapTopBottom from '@ios-icons/icon-wrap-top-bottom.svg';
import IconWrapInfront from '@ios-icons/icon-wrap-infront.svg';
import IconWrapBehind from '@ios-icons/icon-wrap-behind.svg';
import IconTextAlignLeft from '@common-icons/icon-text-align-left.svg';
import IconTextAlignCenter from '@common-icons/icon-text-align-center.svg';
import IconTextAlignRight from '@common-icons/icon-text-align-right.svg';
import IconMoveForeground from '@common-icons/icon-move-foreground.svg';
import IconMoveBackground from '@common-icons/icon-move-background.svg';
import IconMoveForward from '@common-icons/icon-move-forward.svg';
import IconMoveBackward from '@common-icons/icon-move-backward.svg';

const PageCustomFillColor = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
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
                        <Link sheetClose='#edit-sheet'>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg white'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <CustomColorPicker currentColor={fillColor} onAddNewColor={onAddNewColor}/>
        </Page>
    )
};

const PaletteFill = inject("storeFocusObjects", "storeShapeSettings", "storePalette")(observer(props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const storeShapeSettings = props.storeShapeSettings;
    const shapeObject = props.storeFocusObjects.shapeObject;
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
    return(
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

const PageCustomBorderColor = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
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
    return(
        <Page>
            <Navbar title={_t.textCustomColor} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg white'} />
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
    const _t = t('Edit', {returnObjects: true});
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
    return(
        <Page>
            <Navbar title={_t.textColor} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg white'} />
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

const PageStyle = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const storeShapeSettings = props.storeShapeSettings;
    const shapeObject = props.storeFocusObjects.shapeObject;
    const isAndroid = Device.android;

    let borderSize, borderType, transparent;
    if (shapeObject) {
        const stroke = shapeObject.get_ShapeProperties().get_stroke();
        borderSize = stroke.get_width() * 72.0 / 25.4;
        borderType = stroke.get_type();
        transparent = shapeObject.get_ShapeProperties().get_fill().asc_getTransparent();
    }

    // Init border size
    const borderSizeTransform = storeShapeSettings.borderSizeTransform();
    const displayBorderSize = (borderType == Asc.c_oAscStrokeType.STROKE_NONE || borderType === undefined) ? 0 : borderSizeTransform.indexSizeByValue(borderSize);
    const displayTextBorderSize = (borderType == Asc.c_oAscStrokeType.STROKE_NONE || borderType === undefined) ? 0 : borderSizeTransform.sizeByValue(borderSize);
    const [stateBorderSize, setBorderSize] = useState(displayBorderSize);
    const [stateTextBorderSize, setTextBorderSize] = useState(displayTextBorderSize);

    // Init border color
    const borderColor = !storeShapeSettings.borderColorView ? storeShapeSettings.initBorderColorView(shapeObject) : storeShapeSettings.borderColorView;
    const displayBorderColor = borderColor !== 'transparent' ? `#${(typeof borderColor === "object" ? borderColor.color : borderColor)}` : borderColor;

    // Init opacity
    const opacity = transparent !== null && transparent !== undefined ? transparent / 2.55 : 100;
    const [stateOpacity, setOpacity] = useState(Math.round(opacity));

    if (!shapeObject && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page>
            <Navbar backLink={_t.textBack}>
                <div className='tab-buttons tabbar'>
                    <Link key={"de-link-shape-fill"} tabLink={"#edit-shape-fill"} tabLinkActive={true}>{_t.textFill}</Link>
                    <Link key={"de-link-shape-border"} tabLink={"#edit-shape-border"}>{_t.textBorder}</Link>
                    <Link key={"de-link-shape-effects"} tabLink={"#edit-shape-effects"}>{_t.textEffects}</Link>
                    {isAndroid && <span className='tab-link-highlight'></span>}
                </div>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg white'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <Tabs animated>
                <Tab key={"de-tab-shape-fill"} id={"edit-shape-fill"} className="page-content no-padding-top" tabActive={true}>
                    <PaletteFill onFillColor={props.onFillColor} f7router={props.f7router} />
                </Tab>
                <Tab key={"de-tab-shape-border"} id={"edit-shape-border"} className="page-content no-padding-top">
                    <List>
                        <ListItem>
                            <div slot="root-start" className='inner-range-title'>{_t.textSize}</div>
                            <div slot='inner' style={{width: '100%'}}>
                                <Range min="0" max="7" step="1" value={stateBorderSize}
                                       onRangeChange={(value) => {setBorderSize(value); setTextBorderSize(borderSizeTransform.sizeByIndex(value));}}
                                       onRangeChanged={(value) => {props.onBorderSize(borderSizeTransform.sizeByIndex(value))}}
                                ></Range>
                            </div>
                            <div className='range-number' slot='inner-end'>
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
                <Tab key={"de-tab-shape-effects"} id={"edit-shape-effects"} className="page-content no-padding-top">
                    <List>
                        <ListItem>
                            <div slot="root-start" className='inner-range-title'>{_t.textOpacity}</div>
                            <div slot='inner' style={{width: '100%'}}>
                                <Range min={0} max={100} step={1} value={stateOpacity}
                                       onRangeChange={(value) => {setOpacity(value)}}
                                       onRangeChanged={(value) => {props.onOpacity(value)}}
                                ></Range>
                            </div>
                            <div className='range-number' slot='inner-end'>
                                {stateOpacity + ' %'}
                            </div>
                        </ListItem>
                    </List>
                </Tab>
            </Tabs>
        </Page>
    )
};

const PageStyleNoFill = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const storeShapeSettings = props.storeShapeSettings;
    const shapeObject = props.storeFocusObjects.shapeObject;
    let borderSize, borderType;
    if (shapeObject) {
        const stroke = shapeObject.get_ShapeProperties().get_stroke();
        borderSize = stroke.get_width() * 72.0 / 25.4;
        borderType = stroke.get_type();
    }

    // Init border size
    const borderSizeTransform = storeShapeSettings.borderSizeTransform();
    const displayBorderSize = (borderType == Asc.c_oAscStrokeType.STROKE_NONE || borderType === undefined) ? 0 : borderSizeTransform.indexSizeByValue(borderSize);
    const displayTextBorderSize = (borderType == Asc.c_oAscStrokeType.STROKE_NONE || borderType === undefined) ? 0 : borderSizeTransform.sizeByValue(borderSize);
    const [stateBorderSize, setBorderSize] = useState(displayBorderSize);
    const [stateTextBorderSize, setTextBorderSize] = useState(displayTextBorderSize);

    // Init border color
    const borderColor = !storeShapeSettings.borderColorView ? storeShapeSettings.initBorderColorView(shapeObject) : storeShapeSettings.borderColorView;
    const displayBorderColor = borderColor !== 'transparent' ? `#${(typeof borderColor === "object" ? borderColor.color : borderColor)}` : borderColor;

    if (!shapeObject && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page>
            <Navbar backLink={_t.textBack} title={_t.textBorder}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg white'} />
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

const PageWrap = props => {
    const isAndroid = Device.android;
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const storeShapeSettings = props.storeShapeSettings;
    const shapeObject = props.storeFocusObjects.shapeObject;
    let wrapType, align, moveText, overlap, distance;

    if (shapeObject) {
        wrapType = storeShapeSettings.getWrapType(shapeObject);
        align = storeShapeSettings.getAlign(shapeObject);
        moveText = storeShapeSettings.getMoveText(shapeObject);
        overlap = storeShapeSettings.getOverlap(shapeObject);
        distance = Common.Utils.Metric.fnRecalcFromMM(storeShapeSettings.getWrapDistance(shapeObject));
    }

    const metricText = Common.Utils.Metric.getCurrentMetricName();
    const [stateDistance, setDistance] = useState(distance);

    if (!shapeObject && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page>
            <Navbar title={_t.textWrap} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg white'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem title={_t.textInline} radio checked={wrapType === 'inline'} onClick={() => {props.onWrapType('inline')}}>
                    {!isAndroid && 
                        <SvgIcon slot="media" symbolId={IconWrapInline.id} className={'icon icon-svg'} />
                    }
                </ListItem>
                <ListItem title={_t.textSquare} radio checked={wrapType === 'square'} onClick={() => {props.onWrapType('square')}}>
                    {!isAndroid && 
                        <SvgIcon slot="media" symbolId={IconWrapSquare.id} className={'icon icon-svg'} />
                    }
                </ListItem>
                <ListItem title={_t.textTight} radio checked={wrapType === 'tight'} onClick={() => {props.onWrapType('tight')}}>
                    {!isAndroid && 
                        <SvgIcon slot="media" symbolId={IconWrapTight.id} className={'icon icon-svg'} />
                    }
                </ListItem>
                <ListItem title={_t.textThrough} radio checked={wrapType === 'through'} onClick={() => {props.onWrapType('through')}}>
                    {!isAndroid && 
                        <SvgIcon slot="media" symbolId={IconWrapThrough.id} className={'icon icon-svg'} />
                    }
                </ListItem>
                <ListItem title={_t.textTopAndBottom} radio checked={wrapType === 'top-bottom'} onClick={() => {props.onWrapType('top-bottom')}}>
                    {!isAndroid && 
                        <SvgIcon slot="media" symbolId={IconWrapTopBottom.id} className={'icon icon-svg'} />
                    }
                </ListItem>
                <ListItem title={_t.textInFront} radio checked={wrapType === 'infront'} onClick={() => {props.onWrapType('infront')}}>
                    {!isAndroid && 
                        <SvgIcon slot="media" symbolId={IconWrapInfront.id} className={'icon icon-svg'} />
                    }
                </ListItem>
                <ListItem title={_t.textBehind} radio checked={wrapType === 'behind'} onClick={() => {props.onWrapType('behind')}}>
                    {!isAndroid && 
                        <SvgIcon slot="media" symbolId={IconWrapBehind.id} className={'icon icon-svg'} />
                    }
                </ListItem>
            </List>
            {('behind' !== wrapType && 'infront' !== wrapType) &&
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
            {wrapType !== 'inline' &&
                <Fragment>
                    <BlockTitle>{_t.textAlign}</BlockTitle>
                    <List>
                        <ListItem className='buttons'>
                            <div className="row">
                                <a className={'button' + (align === Asc.c_oAscAlignH.Left ? ' active' : '')}
                                   onClick={() => {
                                       props.onShapeAlign(Asc.c_oAscAlignH.Left)
                                   }}>
                                    <SvgIcon slot="media" symbolId={IconTextAlignLeft.id} className={'icon icon-svg'} />
                                </a>
                                <a className={'button' + (align === Asc.c_oAscAlignH.Center ? ' active' : '')}
                                   onClick={() => {
                                       props.onShapeAlign(Asc.c_oAscAlignH.Center)
                                   }}>
                                    <SvgIcon slot="media" symbolId={IconTextAlignCenter.id} className={'icon icon-svg'} />
                                </a>
                                <a className={'button' + (align === Asc.c_oAscAlignH.Right ? ' active' : '')}
                                   onClick={() => {
                                       props.onShapeAlign(Asc.c_oAscAlignH.Right)
                                   }}>
                                    <SvgIcon slot="media" symbolId={IconTextAlignRight.id} className={'icon icon-svg'} />
                                </a>
                            </div>
                        </ListItem>
                    </List>
                </Fragment>
            }
            <List>
                <ListItem title={_t.textMoveWithText} className={'inline' === wrapType ? 'disabled' : ''}>
                    <Toggle checked={moveText} onToggleChange={() => {props.onMoveText(!moveText)}}/>
                </ListItem>
                <ListItem title={_t.textAllowOverlap}>
                    <Toggle checked={overlap} onToggleChange={() => {props.onOverlap(!overlap)}}/>
                </ListItem>
            </List>
        </Page>
    )
};

const PageReplace = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const storeShapeSettings = props.storeShapeSettings;
    let shapes = storeShapeSettings.getStyleGroups();
    shapes.splice(0, 1); // Remove line shapes

    const shapeObject = props.storeFocusObjects.shapeObject;
    if (!shapeObject && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page className="shapes dataview">
            <Navbar title={_t.textReplace} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg white'} />
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
    const _t = t('Edit', {returnObjects: true});

    const shapeObject = props.storeFocusObjects.shapeObject;
    if (!shapeObject && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page>
            <Navbar title={t('Edit.textArrange')} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg white'} />
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

const EditShape = props => {
    const { t } = useTranslation();
    const _t = t('Edit', {returnObjects: true});
    const api = Common.EditorApi.get();
    const canFill = props.storeFocusObjects.shapeObject.get_ShapeProperties().get_CanFill();
    const shapeObject = props.storeFocusObjects.shapeObject;
    const wrapType = props.storeShapeSettings.getWrapType(shapeObject);
    const settings = props.storeFocusObjects.settings;

    const shapeType = shapeObject.get_ShapeProperties().asc_getType();
    const hideChangeType = shapeObject.get_ShapeProperties().get_FromChart() || shapeObject.get_ShapeProperties().get_FromSmartArt() 
    || shapeType=='line' || shapeType=='bentConnector2' || shapeType=='bentConnector3'
    || shapeType=='bentConnector4' || shapeType=='bentConnector5' || shapeType=='curvedConnector2'
    || shapeType=='curvedConnector3' || shapeType=='curvedConnector4' || shapeType=='curvedConnector5'
    || shapeType=='straightConnector1';

    const isSmartArtInternal = shapeObject.get_ShapeProperties().get_FromSmartArtInternal();
    const isFromGroup = shapeObject.get_ShapeProperties().get_FromGroup();
    const inControl = api.asc_IsContentControl();
    const controlProps = (api && inControl) ? api.asc_GetContentControlProperties() : null;
    const lockType = controlProps ? controlProps.get_Lock() : Asc.c_oAscSdtLockType.Unlocked;

    let fixedSize = false;

    if (controlProps) {
        let spectype = controlProps.get_SpecificType();
        fixedSize = (spectype == Asc.c_oAscContentControlSpecificType.CheckBox || spectype == Asc. c_oAscContentControlSpecificType.ComboBox || spectype == Asc.c_oAscContentControlSpecificType.DropDownList ||
                     spectype == Asc.c_oAscContentControlSpecificType.None || spectype == Asc.c_oAscContentControlSpecificType.Picture || spectype == Asc.c_oAscContentControlSpecificType.Signature || spectype == Asc.c_oAscContentControlSpecificType.Complex) &&
                     controlProps.get_FormPr() && controlProps.get_FormPr().get_Fixed();
    }

    let disableRemove = !!props.storeFocusObjects.paragraphObject || (lockType == Asc.c_oAscSdtLockType.SdtContentLocked || lockType == Asc.c_oAscSdtLockType.SdtLocked);

    return (
        <Fragment>
            <List>
                {!fixedSize ?
                    canFill ?
                        <ListItem title={_t.textStyle} link='/edit-shape-style/' routeProps={{
                            onFillColor: props.onFillColor,
                            onBorderSize: props.onBorderSize,
                            onBorderColor: props.onBorderColor,
                            onOpacity: props.onOpacity
                        }}></ListItem> :
                        <ListItem title={_t.textStyle} link='/edit-shape-style-no-fill/' routeProps={{
                            onBorderSize: props.onBorderSize,
                            onBorderColor: props.onBorderColor
                        }}></ListItem>
                : null}
                {(!isFromGroup && settings.indexOf('image') === -1) &&
                    <ListItem title={_t.textWrap} link='/edit-shape-wrap/' routeProps={{
                        onWrapType: props.onWrapType,
                        onShapeAlign: props.onShapeAlign,
                        onMoveText: props.onMoveText,
                        onOverlap: props.onOverlap,
                        onWrapDistance: props.onWrapDistance
                    }}></ListItem>
                }
                {(!hideChangeType && !fixedSize) &&
                    <ListItem title={t('Edit.textChangeShape')} link='/edit-shape-replace/' routeProps={{
                        onReplace: props.onReplace
                    }}></ListItem>
                }
                {(wrapType !== 'inline' && !isSmartArtInternal && settings.indexOf('image') === -1) && <ListItem title={t('Edit.textArrange')} link='/edit-shape-reorder/' routeProps={{
                    onReorder: props.onReorder
                }}></ListItem> }
            </List>
            {settings.indexOf('image') === -1 &&
                <List className="buttons-list">
                    <ListButton title={_t.textRemoveShape} onClick={() => {props.onRemoveShape()}} className={`button-red button-fill button-raised${disableRemove ? ' disabled' : ''}`} />
                </List>
            }
        </Fragment>
    )
};

const EditShapeContainer = inject("storeFocusObjects","storeShapeSettings")(observer(EditShape));
const PageShapeStyle = inject("storeFocusObjects", "storeShapeSettings")(observer(PageStyle));
const PageShapeStyleNoFill = inject("storeFocusObjects", "storeShapeSettings")(observer(PageStyleNoFill));
const PageShapeCustomFillColor = inject("storeFocusObjects", "storeShapeSettings", "storePalette")(observer(PageCustomFillColor));
const PageShapeBorderColor = inject("storeShapeSettings", "storePalette")(observer(PageBorderColor));
const PageShapeCustomBorderColor = inject("storeShapeSettings", "storePalette")(observer(PageCustomBorderColor));
const PageWrapContainer = inject("storeShapeSettings", "storeFocusObjects")(observer(PageWrap));
const PageReplaceContainer = inject("storeShapeSettings","storeFocusObjects")(observer(PageReplace));
const PageReorderContainer = inject("storeFocusObjects")(observer(PageReorder));

export {EditShapeContainer as EditShape,
        PageShapeStyle,
        PageShapeStyleNoFill,
        PageShapeCustomFillColor,
        PageShapeBorderColor,
        PageShapeCustomBorderColor,
        PageWrapContainer as PageWrap,
        PageReplaceContainer as PageReplace,
        PageReorderContainer as PageReorder}