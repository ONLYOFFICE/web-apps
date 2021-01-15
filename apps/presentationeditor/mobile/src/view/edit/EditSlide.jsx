import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";
import {f7, Page, Navbar, List, ListItem, Row, BlockTitle, Link, Toggle, Icon, View, NavRight, ListItemCell} from 'framework7-react';
import { ThemeColorPalette, CustomColorPicker } from '../../../../../common/mobile/lib/component/ThemeColorPalette.jsx';
import { useTranslation } from 'react-i18next';
// import {Device} from '../../../../../common/mobile/utils/device';

const EditSlide = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    return (
        <Fragment>
            <List>
                <ListItem title={_t.textTheme} link="/theme/" routeProps={{
                    onThemeClick: props.onThemeClick
                }}></ListItem>
                <ListItem title={_t.textLayout} link="/layout/" routeProps={{
                    onLayoutClick: props.onLayoutClick
                }}></ListItem>
                <ListItem title={_t.textTransition} link="/transition/" routeProps={{
                    onEffectClick: props.onEffectClick,
                    onEffectTypeClick: props.onEffectTypeClick,
                    changeDuration: props.changeDuration,
                    onStartClick: props.onStartClick,
                    onDelayCheck: props.onDelayCheck,
                    onDelay: props.onDelay,
                    onApplyAll: props.onApplyAll
                }}></ListItem>
                <ListItem title={_t.textStyle} link="/style/" routeProps={{
                    onFillColor: props.onFillColor
                }}></ListItem>
            </List>
            <List>
                <ListItem href="#" className="duplicate-slide" onClick={props.onDuplicateSlide}>{_t.textDuplicateSlide}</ListItem>
                <ListItem href="#" className="delete-slide" onClick={props.onRemoveSlide}>{_t.textDeleteSlide}</ListItem>
            </List>
        </Fragment>
    )
};

const PageTheme = props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });
    const storeSlideSettings = props.storeSlideSettings;
    const arrayThemes = storeSlideSettings.arrayThemes;
    const slideThemeIndex = storeSlideSettings.slideThemeIndex;
    const defaultThemes = arrayThemes[0];
    const docThemes = arrayThemes[1];
   
    // console.log(slideThemeIndex);
    // console.log(arrayThemes);
  
    return (
        <Page className="slide-theme">
            <Navbar title={_t.textTheme} backLink={_t.textBack}>
                <NavRight>
                    <Link icon='icon-expand-down' sheetClose></Link>
                </NavRight>
            </Navbar>
            {arrayThemes.length ? (
                <List className="slide-theme__list">
                    {defaultThemes.map((elem, index) => {
                        return (
                            <ListItem key={elem.Index} className={elem.Index === slideThemeIndex ? "item-theme active" : "item-theme"} 
                                style={{backgroundPosition: "0 " + index * -38 + "px"}} 
                                onClick={() => {
                                    storeSlideSettings.changeSlideThemeIndex(elem.Index);
                                    props.onThemeClick(elem.Index);
                                }}>
                            </ListItem>
                        );
                    })}
                    {docThemes.map((elem, index) => {
                        return (
                            <ListItem key={elem.Index} className={elem.Index === slideThemeIndex ? "item-theme active" : "item-theme"}
                                style={{backgroundPosition: "0 -0px", backgroundImage: "url(" + elem.ThemeInfo.Thumbnail + ")"}}
                                onClick={() => {
                                    storeSlideSettings.changeSlideThemeIndex(elem.Index);
                                    props.onThemeClick(elem.Index);
                                }}>
                            </ListItem>
                        );
                    })}
                </List>
            ) : null}
        </Page>
    );
};

const PageLayout = props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });
    const storeFocusObjects = props.storeFocusObjects;
    const storeSlideSettings = props.storeSlideSettings;
    storeSlideSettings.changeSlideLayoutIndex(storeFocusObjects.slideObject.get_LayoutIndex());
    const arrayLayouts = storeSlideSettings.arrayLayouts;
    const slideLayoutIndex = storeSlideSettings.slideLayoutIndex;
   
    // console.log(slideLayoutIndex);
    // console.log(arrayLayouts);
   
    return (
        <Page className="slide-layout">
            <Navbar title={_t.textLayout} backLink={_t.textBack}>
                <NavRight>
                    <Link icon='icon-expand-down' sheetClose></Link>
                </NavRight>
            </Navbar>
            {arrayLayouts.length ? (
                <List className="slide-layout__list">
                    {arrayLayouts.map((elem, index) => {
                        return (
                            <ListItem key={index} className={slideLayoutIndex === index ? "active" : ""} 
                                onClick={() => {
                                    storeSlideSettings.changeSlideLayoutIndex(index);
                                    props.onLayoutClick(index);
                                }}>
                                <img src={elem.Image} style={{width: elem.Width, height: elem.Height}} alt=""/>
                            </ListItem>
                        )
                    })}
                </List>
            ) : null}
        </Page>
    );
};

const PageTransition = props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });
    const _arrEffect = [
        {displayValue: _t.textNone,    value: Asc.c_oAscSlideTransitionTypes.None},
        {displayValue: _t.textFade,    value: Asc.c_oAscSlideTransitionTypes.Fade},
        {displayValue: _t.textPush,    value: Asc.c_oAscSlideTransitionTypes.Push},
        {displayValue: _t.textWipe,    value: Asc.c_oAscSlideTransitionTypes.Wipe},
        {displayValue: _t.textSplit,   value: Asc.c_oAscSlideTransitionTypes.Split},
        {displayValue: _t.textUnCover, value: Asc.c_oAscSlideTransitionTypes.UnCover},
        {displayValue: _t.textCover,   value: Asc.c_oAscSlideTransitionTypes.Cover},
        {displayValue: _t.textClock,   value: Asc.c_oAscSlideTransitionTypes.Clock},
        {displayValue: _t.textZoom,    value: Asc.c_oAscSlideTransitionTypes.Zoom}
    ];
    const _arrEffectType = [
        {displayValue: _t.textSmoothly,           value: Asc.c_oAscSlideTransitionParams.Fade_Smoothly},
        {displayValue: _t.textBlack,              value: Asc.c_oAscSlideTransitionParams.Fade_Through_Black},
        {displayValue: _t.textLeft,               value: Asc.c_oAscSlideTransitionParams.Param_Left},
        {displayValue: _t.textTop,                value: Asc.c_oAscSlideTransitionParams.Param_Top},
        {displayValue: _t.textRight,              value: Asc.c_oAscSlideTransitionParams.Param_Right},
        {displayValue: _t.textBottom,             value: Asc.c_oAscSlideTransitionParams.Param_Bottom},
        {displayValue: _t.textTopLeft,            value: Asc.c_oAscSlideTransitionParams.Param_TopLeft},
        {displayValue: _t.textTopRight,           value: Asc.c_oAscSlideTransitionParams.Param_TopRight},
        {displayValue: _t.textBottomLeft,         value: Asc.c_oAscSlideTransitionParams.Param_BottomLeft},
        {displayValue: _t.textBottomRight,        value: Asc.c_oAscSlideTransitionParams.Param_BottomRight},
        {displayValue: _t.textVerticalIn,         value: Asc.c_oAscSlideTransitionParams.Split_VerticalIn},
        {displayValue: _t.textVerticalOut,        value: Asc.c_oAscSlideTransitionParams.Split_VerticalOut},
        {displayValue: _t.textHorizontalIn,       value: Asc.c_oAscSlideTransitionParams.Split_HorizontalIn},
        {displayValue: _t.textHorizontalOut,      value: Asc.c_oAscSlideTransitionParams.Split_HorizontalOut},
        {displayValue: _t.textClockwise,          value: Asc.c_oAscSlideTransitionParams.Clock_Clockwise},
        {displayValue: _t.textCounterclockwise,   value: Asc.c_oAscSlideTransitionParams.Clock_Counterclockwise},
        {displayValue: _t.textWedge,              value: Asc.c_oAscSlideTransitionParams.Clock_Wedge},
        {displayValue: _t.textZoomIn,             value: Asc.c_oAscSlideTransitionParams.Zoom_In},
        {displayValue: _t.textZoomOut,            value: Asc.c_oAscSlideTransitionParams.Zoom_Out},
        {displayValue: _t.textZoomRotate,         value: Asc.c_oAscSlideTransitionParams.Zoom_AndRotate}
    ];

    let _arrCurrentEffectTypes = [];

    const fillEffectTypes = type => {
        _arrCurrentEffectTypes = [];
        switch (type) {
            case Asc.c_oAscSlideTransitionTypes.Fade:
                _arrCurrentEffectTypes.push(_arrEffectType[0], _arrEffectType[1]);
                break;
            case Asc.c_oAscSlideTransitionTypes.Push:
                _arrCurrentEffectTypes = _arrEffectType.slice(2, 6);
                break;
            case Asc.c_oAscSlideTransitionTypes.Wipe:
                _arrCurrentEffectTypes = _arrEffectType.slice(2, 10);
                break;
            case Asc.c_oAscSlideTransitionTypes.Split:
                _arrCurrentEffectTypes = _arrEffectType.slice(10, 14);
                break;
            case Asc.c_oAscSlideTransitionTypes.UnCover:
                _arrCurrentEffectTypes = _arrEffectType.slice(2, 10);
                break;
            case Asc.c_oAscSlideTransitionTypes.Cover:
                _arrCurrentEffectTypes = _arrEffectType.slice(2, 10);
                break;
            case Asc.c_oAscSlideTransitionTypes.Clock:
                _arrCurrentEffectTypes = _arrEffectType.slice(14, 17);
                break;
            case Asc.c_oAscSlideTransitionTypes.Zoom:
                _arrCurrentEffectTypes = _arrEffectType.slice(17);
                break;
        }
        return (_arrCurrentEffectTypes.length > 0) ? _arrCurrentEffectTypes[0].value : -1;
    };

    const getEffectName = effect => {
        for (var i=0; i < _arrEffect.length; i++) {
            if (_arrEffect[i].value == effect) return _arrEffect[i].displayValue;
        }
        return '';
    };
    
    const getEffectTypeName = type => {
        for (var i=0; i < _arrCurrentEffectTypes.length; i++) {
            if (_arrCurrentEffectTypes[i].value == type) return _arrCurrentEffectTypes[i].displayValue;
        }
        return '';
    };

    const storeFocusObjects = props.storeFocusObjects;
    const storeSlideSettings = props.storeSlideSettings;
    const transitionObj = storeFocusObjects.slideObject.get_transition();

    if(!storeSlideSettings.effect) {
        storeSlideSettings.changeEffect(transitionObj.get_TransitionType());
    }

    const _effect = storeSlideSettings.effect;
    const valueEffectTypes = fillEffectTypes(_effect);

    if(!storeSlideSettings.type) {
        storeSlideSettings.changeType(valueEffectTypes);
    }
    
    let _effectDelay = transitionObj.get_SlideAdvanceDuration();

    const [stateRange, changeRange] = useState((_effectDelay !== null && _effectDelay !== undefined) ? parseInt(_effectDelay / 1000.) : 0);
    const isDelay = transitionObj.get_SlideAdvanceAfter();
    const isStartOnClick = transitionObj.get_SlideAdvanceOnMouseClick();
    const nameEffect = getEffectName(_effect);

    const _effectType = transitionObj.get_TransitionOption();
    const nameEffectType = getEffectTypeName(_effectType);
    const _effectDuration = transitionObj.get_TransitionDuration();

    return (
        <Page className="slide-transition">
            <Navbar title={_t.textTransition} backLink={_t.textBack}>
                <NavRight>
                    <Link icon='icon-expand-down' sheetClose></Link>
                </NavRight>
            </Navbar>
            <List>
                <ListItem link="/effect/" title={_t.textEffect} after={nameEffect} routeProps={{
                    _arrEffect,
                    onEffectClick: props.onEffectClick,
                    fillEffectTypes
                }}></ListItem>
                <ListItem link="/type/" title={_t.textType} 
                    after={_effect != Asc.c_oAscSlideTransitionTypes.None ? nameEffectType : ''} 
                    disabled={_effect == Asc.c_oAscSlideTransitionTypes.None} routeProps={{
                        _arrCurrentEffectTypes, 
                        onEffectTypeClick: props.onEffectTypeClick
                    }}>
                </ListItem>
                <ListItem title={_t.textDuration} disabled={_effect == Asc.c_oAscSlideTransitionTypes.None}>
                    <div slot="after" className="splitter">
                        <label>{(_effectDuration !== null && _effectDuration !== undefined) ?  (parseInt(_effectDuration / 1000.) + ' ' + _t.textSec) : ''}</label>
                        <p className="buttons-row">
                            <span className="button" onClick={() => {
                                let duration = parseInt(_effectDuration / 1000);
                                duration = Math.max(0, --duration);
                                props.changeDuration(duration);
                            }}>-</span>  
                            <span className="button" onClick={() => {
                                let duration = parseInt(_effectDuration / 1000);
                                duration = Math.min(300, ++duration);
                                props.changeDuration(duration);
                            }}>+</span>
                        </p>
                    </div>
                </ListItem>
            </List>
            <List>
                <ListItem>
                    <span>{_t.textStartOnClick}</span>
                    <Toggle checked={isStartOnClick} onToggleChange={() => {props.onStartClick(!isStartOnClick)}} />
                </ListItem>
                <ListItem>
                    <span>{_t.textDelay}</span>
                    <Toggle checked={isDelay} onToggleChange={() => {props.onDelayCheck(!isDelay, _effectDelay)}} />
                </ListItem>
                <ListItem>
                    <ListItemCell className="flex-shrink-3">
                        <input type="range" className="range-slider-delay" min="0" max="300" value={stateRange} step="1"
                            onChange={(e) => {
                                changeRange(e.target.value);
                                props.onDelay(stateRange);
                            }} disabled={!isDelay} />
                    </ListItemCell>
                    <ListItemCell className="width-auto flex-shrink-0">
                        <span>{stateRange} {_t.textSec}</span>
                    </ListItemCell>
                </ListItem>
            </List>
            <List>
                <ListItem className="apply-all" href="#" onClick={props.onApplyAll}>{_t.textApplyAll}</ListItem>
            </List>
        </Page>
    );
};


const PageEffect = props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });
    const storeSlideSettings = props.storeSlideSettings;
    const _effect = storeSlideSettings.effect;
    const _arrEffect = props._arrEffect;

    return (
        <Page className="style-effect">
            <Navbar title={_t.textEffect} backLink={_t.textBack} />
            {_arrEffect.length ? (
                <List mediaList>
                    {_arrEffect.map((elem, index) => {
                        return (
                            <ListItem key={index} radio name="editslide-effect" title={elem.displayValue} value={elem.value} 
                                checked={elem.value === _effect} onChange={() => {
                                    storeSlideSettings.changeEffect(elem.value);
                                    let valueEffectTypes = props.fillEffectTypes(elem.value);
                                    storeSlideSettings.changeType(valueEffectTypes);
                                    props.onEffectClick(elem.value, valueEffectTypes);
                                }}></ListItem>
                        )
                    })}
                </List>
            ) : null}
        </Page>
    );
};

const PageType= props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });
    const _arrCurrentEffectTypes = props._arrCurrentEffectTypes;
    const storeSlideSettings = props.storeSlideSettings;
    const _effect = storeSlideSettings.effect;
    const type = storeSlideSettings.type;

    return (
        <Page className="style-type">
            <Navbar title={_t.textType} backLink={_t.textBack}>
                <NavRight>
                    <Link icon='icon-expand-down' sheetClose></Link>
                </NavRight>
            </Navbar>
            {_arrCurrentEffectTypes.length ? (
                <List mediaList>
                    {_arrCurrentEffectTypes.map((elem, index) => {
                        return (
                            <ListItem key={index} radio name="editslide-effect-type" title={elem.displayValue} value={elem.value}
                                checked={elem.value === type} onChange={() => {
                                    storeSlideSettings.changeType(elem.value);
                                    props.onEffectTypeClick(elem.value, _effect);
                                }}>
                            </ListItem>
                        )
                    })}
                </List>
            ) : null}
        </Page>
    );
};

const PageFillColor = props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });
    const storeFocusObjects = props.storeFocusObjects;
    const slideObject = storeFocusObjects.slideObject;
    const storePalette = props.storePalette;
    const storeSlideSettings = props.storeSlideSettings;
    const customColors = storePalette.customColors;
    const fillColor =  storeSlideSettings.fillColor ? storeSlideSettings.fillColor : storeSlideSettings.getFillColor(slideObject);

    const changeColor = (color, effectId, effectValue) => {
        if (color !== 'empty') {
            if (effectId !== undefined ) {
                const newColor = {color: color, effectId: effectId, effectValue: effectValue};
                props.onFillColor(newColor);
                storeSlideSettings.changeFillColor(newColor);
            } else {
                props.onFillColor(color);
                storeSlideSettings.changeFillColor(color);
            }
        } else {
            // open custom color menu
            props.f7router.navigate('/edit-custom-color/');
        }
    };
  
    return (
        <Page>
            <Navbar title={_t.textFill} backLink={_t.textBack}>
                <NavRight>
                    <Link icon='icon-expand-down' sheetClose></Link>
                </NavRight>
            </Navbar>
            <ThemeColorPalette changeColor={changeColor} curColor={fillColor} customColors={customColors} transparent={true} />
            <List>
                <ListItem title={_t.textAddCustomColor} link={'/edit-custom-color/'} routeProps={{
                    onFillColor: props.onFillColor
                }}></ListItem>
            </List>
        </Page>
    );
};

const PageCustomFillColor = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    let fillColor = props.storeSlideSettings.fillColor;

    if (typeof fillColor === 'object') {
        fillColor = fillColor.color;
    }

    const onAddNewColor = (colors, color) => {
        props.storePalette.changeCustomColors(colors);
        props.onFillColor(color);
        props.storeSlideSettings.changeFillColor(color);
        props.f7router.back();
    };

    return (
        <Page>
            <Navbar title={_t.textCustomColor} backLink={_t.textBack} />
            <CustomColorPicker currentColor={fillColor} onAddNewColor={onAddNewColor} />
        </Page>
    )
};

const Theme = inject("storeSlideSettings")(observer(PageTheme));
const Layout = inject("storeSlideSettings", "storeFocusObjects")(observer(PageLayout));
const Transition = inject("storeSlideSettings", "storeFocusObjects")(observer(PageTransition));
const Type = inject("storeSlideSettings", "storeFocusObjects")(observer(PageType));
const Effect = inject("storeSlideSettings", "storeFocusObjects")(observer(PageEffect));
const StyleFillColor = inject("storeSlideSettings", "storePalette", "storeFocusObjects")(observer(PageFillColor));
const CustomFillColor = inject("storeSlideSettings", "storePalette", "storeFocusObjects")(observer(PageCustomFillColor));

export {
    EditSlide,
    Theme,
    Layout,
    Transition,
    Type,
    Effect,
    StyleFillColor,
    CustomFillColor
};