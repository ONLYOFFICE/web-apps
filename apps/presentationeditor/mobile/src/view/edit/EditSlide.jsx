import React, {Fragment, useEffect, useState} from 'react';
import {observer, inject} from "mobx-react";
import {f7, Page, Navbar, List, ListItem, Row, BlockTitle, Link, Toggle, Icon, View, NavRight, ListItemCell, Range, Button, Segmented, ListButton} from 'framework7-react';
import { ThemeColorPalette, CustomColorPicker } from '../../../../../common/mobile/lib/component/ThemeColorPalette.jsx';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';

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
                <ListItem title={t('View.Edit.textTransitions')} link="/transition/" routeProps={{
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
            <List className="buttons-list">
                <ListButton className="button-fill button-raised" onClick={props.onDuplicateSlide}>{_t.textDuplicateSlide}</ListButton>
                <ListButton className="button-red button-fill button-raised" onClick={props.onRemoveSlide}>{_t.textDeleteSlide}</ListButton>
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

    return (
        <Page className="slide-theme">
            <Navbar title={_t.textTheme} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            {arrayThemes.length && (
                <List className="slide-theme__list">
                    {arrayThemes.map(theme => {
                        return (
                            <ListItem key={theme.themeId} className={theme.themeId === slideThemeIndex ? "item-theme active" : "item-theme"} 
                                style={{backgroundPosition: `0 -${theme.offsety}px`, backgroundImage: theme.imageUrl && `url(${theme.imageUrl})`}}
                                onClick={() => {
                                    storeSlideSettings.changeSlideThemeIndex(theme.themeId);
                                    props.onThemeClick(theme.themeId);
                                }}>
                            </ListItem>
                        );
                    })}
                </List>
            )}
        </Page>
    );
};

const PageLayout = props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });
    const storeFocusObjects = props.storeFocusObjects;
    const storeSlideSettings = props.storeSlideSettings;
    storeSlideSettings.changeSlideLayoutIndex(storeFocusObjects.slideObject.get_LayoutIndex());
    const arrayLayouts = storeSlideSettings.slideLayouts;
    const slideLayoutIndex = storeSlideSettings.slideLayoutIndex;
   
    return (
        <Page className="slide-layout">
            <Navbar title={_t.textLayout} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            {arrayLayouts.length && 
                arrayLayouts.map((layouts, index) => {
                    return (
                        <List className="slide-layout__list" key={index}>
                            {layouts.map(layout => {
                                return (
                                    <ListItem key={layout.type} className={slideLayoutIndex === layout.type ? "active" : ""} 
                                        onClick={() => {
                                            storeSlideSettings.changeSlideLayoutIndex(layout.type);
                                            props.onLayoutClick(layout.type);
                                        }}>
                                        <img src={layout.image} style={{width: layout.width, height: layout.height}} alt=""/>
                                    </ListItem>
                                )
                            })}
                        </List>
                    );
                })
            }
        </Page>
    );
};

const PageTransition = props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });
    const isAndroid = Device.android;
    const _arrEffect = [
        {displayValue: _t.textNone,    value: Asc.c_oAscSlideTransitionTypes.None},
        {displayValue: _t.textFade,    value: Asc.c_oAscSlideTransitionTypes.Fade},
        {displayValue: _t.textPush,    value: Asc.c_oAscSlideTransitionTypes.Push},
        {displayValue: _t.textWipe,    value: Asc.c_oAscSlideTransitionTypes.Wipe},
        {displayValue: _t.textSplit,   value: Asc.c_oAscSlideTransitionTypes.Split},
        {displayValue: _t.textUnCover, value: Asc.c_oAscSlideTransitionTypes.UnCover},
        {displayValue: _t.textCover,   value: Asc.c_oAscSlideTransitionTypes.Cover},
        {displayValue: _t.textClock,   value: Asc.c_oAscSlideTransitionTypes.Clock},
        {displayValue: _t.textZoom,    value: Asc.c_oAscSlideTransitionTypes.Zoom},
        {displayValue: _t.textMorph,    value: Asc.c_oAscSlideTransitionTypes.Morph}
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
        {displayValue: _t.textZoomRotate,         value: Asc.c_oAscSlideTransitionParams.Zoom_AndRotate},
        {displayValue: _t.textMorphObjects,       value: Asc.c_oAscSlideTransitionParams.Morph_Objects},
        {displayValue: _t.textMorphWords,          value: Asc.c_oAscSlideTransitionParams.Morph_Words},
        {displayValue: _t.textMorphLetters,       value: Asc.c_oAscSlideTransitionParams.Morph_Letters}
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
                _arrCurrentEffectTypes = _arrEffectType.slice(17,20);
                break;
            case Asc.c_oAscSlideTransitionTypes.Morph:
                _arrCurrentEffectTypes = _arrEffectType.slice(20);
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
    const transitionObj = storeFocusObjects.slideObject.get_transition();

    let _effectDelay = transitionObj.get_SlideAdvanceDuration();

    const [stateRange, changeRange] = useState((_effectDelay !== null && _effectDelay !== undefined) ? parseInt(_effectDelay / 1000.) : 0);
    const isDelay = transitionObj.get_SlideAdvanceAfter();
    const isStartOnClick = transitionObj.get_SlideAdvanceOnMouseClick();

    const _effect = transitionObj.get_TransitionType();
    const nameEffect = getEffectName(_effect);
    if(_effect != Asc.c_oAscSlideTransitionTypes.None) fillEffectTypes(_effect);

    const _effectType = transitionObj.get_TransitionOption();
    const nameEffectType = getEffectTypeName(_effectType);

    const _effectDuration = transitionObj.get_TransitionDuration();

    useEffect(() => {
        changeRange((_effectDelay !== null && _effectDelay !== undefined) ? parseInt(_effectDelay / 1000.) : 0);
    }, [_effectDelay])

    return (
        <Page className="slide-transition">
            <Navbar title={t('View.Edit.textTransitions')} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem link="/effect/" title={_t.textEffect} after={nameEffect} routeProps={{
                    _arrEffect,
                    onEffectClick: props.onEffectClick,
                    fillEffectTypes,
                    _effect,
                }}></ListItem>
                <ListItem link="/type/" title={_t.textType} 
                    after={_effect != Asc.c_oAscSlideTransitionTypes.None ? nameEffectType : ''} 
                    disabled={_effect == Asc.c_oAscSlideTransitionTypes.None} routeProps={{
                        _arrCurrentEffectTypes, 
                        onEffectTypeClick: props.onEffectTypeClick,
                        _effect,
                        _effectType,
                    }}>
                </ListItem>
                <ListItem title={_t.textDuration} disabled={_effect == Asc.c_oAscSlideTransitionTypes.None}>
                    {!isAndroid && <div slot='after-start'>
                        <label>{(_effectDuration !== null && _effectDuration !== undefined) ?  (parseInt(_effectDuration / 1000.) + ' ' + _t.textSec) : ''}</label>
                    </div>}
                    <div slot="after" className="splitter">
                        <Segmented>
                            <Button outline className='decrement item-link' onClick={() => {
                                let duration = parseInt(_effectDuration / 1000);
                                duration = Math.max(0, --duration);
                                props.changeDuration(duration);
                            }}>
                                {isAndroid ? <Icon icon="icon-expand-down"></Icon> : ' - '}
                            </Button>
                            {isAndroid && <label>{(_effectDuration !== null && _effectDuration !== undefined) ?  (parseInt(_effectDuration / 1000.) + ' ' + _t.textSec) : ''}</label>}
                            <Button outline className='increment item-link' onClick={() => {
                                let duration = parseInt(_effectDuration / 1000);
                                duration = Math.min(300, ++duration);
                                props.changeDuration(duration);
                            }}>
                                {isAndroid ? <Icon icon="icon-expand-up"></Icon> : ' + '}
                            </Button>
                        </Segmented>
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
                    <div slot='inner' style={{width: '100%'}}>
                        <Range min={0} max={300} step={1}
                               value={stateRange}
                               disabled={!isDelay}
                               onRangeChange={(value) => {changeRange(value)}}
                               onRangeChanged={(value) => {props.onDelay(value)}}
                        ></Range>
                    </div>
                    <div className='range-number' slot='inner-end'>
                        {stateRange + ' ' + _t.textSec}
                    </div>
                </ListItem>
            </List>
            <List className="buttons-list">
                <ListButton className="button-fill button-raised" onClick={props.onApplyAll}>{_t.textApplyAll}</ListButton>
            </List>
        </Page>
    );
};


const PageEffect = props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });
    const [currentEffect, setEffect] = useState(props._effect);
    const _arrEffect = props._arrEffect;

    return (
        <Page className="style-effect">
            <Navbar title={_t.textEffect} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            {_arrEffect.length ? (
                <List mediaList>
                    {_arrEffect.map((elem, index) => {
                        return (
                            <ListItem key={index} radio name="editslide-effect" title={elem.displayValue} value={elem.value} 
                                checked={elem.value === currentEffect} onChange={() => {
                                    setEffect(elem.value);
                                    let valueEffectTypes = props.fillEffectTypes(elem.value);
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
    const [currentType, setType] = useState(props._effectType);

    return (
        <Page className="style-type">
            <Navbar title={_t.textType} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
            {_arrCurrentEffectTypes.length ? (
                <List mediaList>
                    {_arrCurrentEffectTypes.map((elem, index) => {
                        return (
                            <ListItem key={index} radio name="editslide-effect-type" title={elem.displayValue} value={elem.value}
                                checked={elem.value === currentType} onChange={() => {
                                    setType(elem.value);
                                    props.onEffectTypeClick(elem.value, props._effect);
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
    const fillColor = storeSlideSettings.fillColor;

    const changeColor = (color, effectId, effectValue) => {
        if (color !== 'empty') {
            if (effectId !== undefined) {
                const newColor = {color: color, effectId: effectId, effectValue: effectValue};
                props.onFillColor(newColor);
                storeSlideSettings.changeFillColor(newColor);
            } else {
                props.onFillColor(color);
                storeSlideSettings.changeFillColor(color);
            }
        } else {
            // open custom color menu
            props.f7router.navigate('/edit-custom-color/', {props: {onFillColor: props.onFillColor}});
        }
    };
  
    return (
        <Page>
            <Navbar title={_t.textFill} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
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
            <Navbar title={_t.textCustomColor} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose='#edit-sheet'>
                            <Icon icon='icon-expand-down'/>
                        </Link>
                    </NavRight>
                }
            </Navbar>
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