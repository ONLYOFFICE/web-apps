import React, {useState} from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, NavRight, Link, Toggle, Range, ListItemCell } from "framework7-react";
import { useTranslation } from "react-i18next";

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
    const storeTransition = props.storeTransition;
    const transitionObj = storeFocusObjects.slideObject.get_transition();

    if(!storeTransition.effect) {
        storeTransition.changeEffect(transitionObj.get_TransitionType());
    }

    const _effect = storeTransition.effect;
    const valueEffectTypes = fillEffectTypes(_effect);

    if(!storeTransition.type) {
        storeTransition.changeType(valueEffectTypes);
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
            <List className="apply-all">
                <ListItem className="apply-all__elem" href="#" onClick={props.onApplyAll}>{_t.textApplyAll}</ListItem>
            </List>
        </Page>
    );
};


const PageEffect = props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });
    const storeTransition = props.storeTransition;
    const _effect = storeTransition.effect;
    const _arrEffect = props._arrEffect;

    return (
        <Page>
            <Navbar title={_t.textEffect} backLink={_t.textBack} />
            {_arrEffect.length ? (
                <List mediaList>
                    {_arrEffect.map((elem, index) => {
                        return (
                            <ListItem key={index} radio name="editslide-effect" title={elem.displayValue} value={elem.value} 
                                checked={elem.value === _effect} onChange={() => {
                                    storeTransition.changeEffect(elem.value);
                                    let valueEffectTypes = props.fillEffectTypes(elem.value);
                                    storeTransition.changeType(valueEffectTypes);
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
    const storeTransition = props.storeTransition;
    const _effect = storeTransition.effect;
    const type = storeTransition.type;

    return (
        <Page>
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
                                    storeTransition.changeType(elem.value);
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

const Effect = inject("storeTransition", "storeFocusObjects")(observer(PageEffect));
const Type = inject("storeTransition", "storeFocusObjects")(observer(PageType));
const Transition = inject("storeTransition", "storeFocusObjects")(observer(PageTransition));

export {Transition, Effect, Type};