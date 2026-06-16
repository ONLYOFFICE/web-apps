/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

﻿import React, {Fragment, useEffect, useState} from 'react';
import {observer, inject} from "mobx-react";
import {f7, Page, Navbar, List, ListItem, Row, BlockTitle, Link, Toggle, Icon, View, NavRight, ListItemCell, Range, Button, Segmented, ListButton} from 'framework7-react';
import { ThemeColorPalette, CustomColorPicker } from '../../../../../common/mobile/lib/component/ThemeColorPalette.jsx';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';
import SvgIcon from '@common/lib/component/SvgIcon';
import IconExpandDownIos from '@common-ios-icons/icon-expand-down.svg?ios';
import IconExpandDownAndroid from '@common-android-icons/icon-expand-down.svg';
import IconExpandUp from '@common-android-icons/icon-expand-up.svg';
import IconTransitionNone from '@icons/icon-transition-none.svg';
import IconTransitionMorph from '@icons/icon-transition-morph.svg';
import IconTransitionFade from '@icons/icon-transition-fade.svg';
import IconTransitionPush from '@icons/icon-transition-push.svg';
import IconTransitionWipe from '@icons/icon-transition-wipe.svg';
import IconTransitionSplit from '@icons/icon-transition-split.svg';
import IconTransitionCut from '@icons/icon-transition-cut.svg';
import IconTransitionRandomBars from '@icons/icon-transition-randombars.svg';
import IconTransitionShape from '@icons/icon-transition-shape.svg';
import IconTransitionUncover from '@icons/icon-transition-uncover.svg';
import IconTransitionCover from '@icons/icon-transition-cover.svg';
import IconTransitionDissolve from '@icons/icon-transition-dissolve.svg';
import IconTransitionChecker from '@icons/icon-transition-checker.svg';
import IconTransitionBlinds from '@icons/icon-transition-blinds.svg';
import IconTransitionClock from '@icons/icon-transition-clock.svg';
import IconTransitionRipple from '@icons/icon-transition-ripple.svg';
import IconTransitionHoneycomb from '@icons/icon-transition-honeycomb.svg';
import IconTransitionVortex from '@icons/icon-transition-vortex.svg';
import IconTransitionSwitch from '@icons/icon-transition-switch.svg';
import IconTransitionFlip from '@icons/icon-transition-flip.svg';
import IconTransitionGallery from '@icons/icon-transition-gallery.svg';
import IconTransitionCube from '@icons/icon-transition-cube.svg';
import IconTransitionDoors from '@icons/icon-transition-doors.svg';
import IconTransitionBox from '@icons/icon-transition-box.svg';
import IconTransitionComb from '@icons/icon-transition-comb.svg';
import IconTransitionZoom from '@icons/icon-transition-zoom.svg';
import IconTransitionRandom from '@icons/icon-transition-random.svg';
import IconTransitionFerris from '@icons/icon-transition-ferris.svg';
import IconTransitionRotate from '@icons/icon-transition-rotate.svg';
import IconTransitionWindow from '@icons/icon-transition-window.svg';
import IconTransitionOrbit from '@icons/icon-transition-orbit.svg';

const getEffectOptions = _t => [
    {group: 'subtle',          displayValue: _t.textNone,       value: Asc.c_oAscSlideTransitionTypes.None,      thumb: IconTransitionNone},
    {group: 'subtle',          displayValue: _t.textMorph,      value: Asc.c_oAscSlideTransitionTypes.Morph,     thumb: IconTransitionMorph},
    {group: 'subtle',          displayValue: _t.textFade,       value: Asc.c_oAscSlideTransitionTypes.Fade,      thumb: IconTransitionFade},
    {group: 'subtle',          displayValue: _t.textPush,       value: Asc.c_oAscSlideTransitionTypes.Push,      thumb: IconTransitionPush},
    {group: 'subtle',          displayValue: _t.textWipe,       value: Asc.c_oAscSlideTransitionTypes.Wipe,      thumb: IconTransitionWipe},
    {group: 'subtle',          displayValue: _t.textSplit,      value: Asc.c_oAscSlideTransitionTypes.Split,     thumb: IconTransitionSplit},
    {group: 'subtle',          displayValue: _t.textCut,        value: Asc.c_oAscSlideTransitionTypes.Cut,       thumb: IconTransitionCut},
    {group: 'subtle',          displayValue: _t.textRandomBars, value: Asc.c_oAscSlideTransitionTypes.RandomBar, thumb: IconTransitionRandomBars},
    {group: 'subtle',          displayValue: _t.textShape,      value: Asc.c_oAscSlideTransitionTypes.Circle,    thumb: IconTransitionShape},
    {group: 'subtle',          displayValue: _t.textUnCover,    value: Asc.c_oAscSlideTransitionTypes.UnCover,   thumb: IconTransitionUncover},
    {group: 'subtle',          displayValue: _t.textCover,      value: Asc.c_oAscSlideTransitionTypes.Cover,     thumb: IconTransitionCover},
    {group: 'exciting',        displayValue: _t.textDissolve,   value: Asc.c_oAscSlideTransitionTypes.Dissolve,  thumb: IconTransitionDissolve},
    {group: 'exciting',        displayValue: _t.textChecker,    value: Asc.c_oAscSlideTransitionTypes.Checker,   thumb: IconTransitionChecker},
    {group: 'exciting',        displayValue: _t.textBlinds,     value: Asc.c_oAscSlideTransitionTypes.Blinds,    thumb: IconTransitionBlinds},
    {group: 'exciting',        displayValue: _t.textClock,      value: Asc.c_oAscSlideTransitionTypes.Clock,     thumb: IconTransitionClock},
    {group: 'exciting',        displayValue: _t.textRipple,     value: Asc.c_oAscSlideTransitionTypes.Ripple,    thumb: IconTransitionRipple},
    {group: 'exciting',        displayValue: _t.textHoneycomb,  value: Asc.c_oAscSlideTransitionTypes.Honeycomb, thumb: IconTransitionHoneycomb},
    {group: 'exciting',        displayValue: _t.textVortex,     value: Asc.c_oAscSlideTransitionTypes.Vortex,    thumb: IconTransitionVortex},
    {group: 'exciting',        displayValue: _t.textSwitch,     value: Asc.c_oAscSlideTransitionTypes.Switch,    thumb: IconTransitionSwitch},
    {group: 'exciting',        displayValue: _t.textFlip,       value: Asc.c_oAscSlideTransitionTypes.Flip,      thumb: IconTransitionFlip},
    {group: 'exciting',        displayValue: _t.textGallery,    value: Asc.c_oAscSlideTransitionTypes.Gallery,   thumb: IconTransitionGallery},
    {group: 'exciting',        displayValue: _t.textCube,       value: Asc.c_oAscSlideTransitionTypes.Prism,     thumb: IconTransitionCube,  prismId: 'prism-cube'},
    {group: 'exciting',        displayValue: _t.textDoors,      value: Asc.c_oAscSlideTransitionTypes.Doors,     thumb: IconTransitionDoors},
    {group: 'exciting',        displayValue: _t.textBox,        value: Asc.c_oAscSlideTransitionTypes.Prism,     thumb: IconTransitionBox,   prismId: 'prism-box'},
    {group: 'exciting',        displayValue: _t.textComb,       value: Asc.c_oAscSlideTransitionTypes.Comb,      thumb: IconTransitionComb},
    {group: 'exciting',        displayValue: _t.textZoom,       value: Asc.c_oAscSlideTransitionTypes.Zoom,      thumb: IconTransitionZoom},
    {group: 'exciting',        displayValue: _t.textRandom,     value: Asc.c_oAscSlideTransitionTypes.Random,    thumb: IconTransitionRandom},
    {group: 'dynamic-content', displayValue: _t.textFerris,     value: Asc.c_oAscSlideTransitionTypes.Ferris,    thumb: IconTransitionFerris},
    {group: 'dynamic-content', displayValue: _t.textRotate,     value: Asc.c_oAscSlideTransitionTypes.Prism,     thumb: IconTransitionRotate, prismId: 'prism-rotate'},
    {group: 'dynamic-content', displayValue: _t.textWindow,     value: Asc.c_oAscSlideTransitionTypes.Window,    thumb: IconTransitionWindow},
    {group: 'dynamic-content', displayValue: _t.textOrbit,      value: Asc.c_oAscSlideTransitionTypes.Prism,     thumb: IconTransitionOrbit,  prismId: 'prism-orbit'}
];

const getEffectGroups = _t => [
    {id: 'subtle', displayValue: _t.textSubtle},
    {id: 'exciting', displayValue: _t.textExciting},
    {id: 'dynamic-content', displayValue: _t.textDynamicContent}
];

const EditSlide = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true}); 
    const storeFocusObjects = props.storeFocusObjects;  
    const isLockResetBackground = storeFocusObjects.slideObject.get_LockResetBackground();
    const _arrEffect = getEffectOptions(_t);
    const transitionObj = storeFocusObjects.slideObject.get_transition();
    const _effect = transitionObj.get_TransitionType();
    const _effectType = transitionObj.get_TransitionOption();
    const prismId = getPrismId(_effectType);
    const effectItem = getEffectItem(_effect, prismId, _arrEffect);
    const nameEffect = effectItem ? effectItem.displayValue : '';
    const thumbEffect = effectItem ? effectItem.thumb : '';

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
                }}>
                    {getEffectPreview(nameEffect, thumbEffect)}
                </ListItem>
            </List>
            <List>
                <ListItem title={_t.textBackground} link="/style/" routeProps={{
                    onFillColor: props.onFillColor
                }}></ListItem>
                <ListItem className={isLockResetBackground ? 'disabled' : ''} title={_t.textResetBackground} onClick={()=>{props.onResetBackground()}}></ListItem>
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
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg white'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            {arrayThemes.length && (
                <List className="multi-column slide-theme__list">
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
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg white'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            {arrayLayouts.length && 
                arrayLayouts.map((layouts, index) => {
                    return (
                        <List className="multi-column slide-layout__list" key={index}>
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

const getPrismId = value => {
    var prismId = 'prism-cube';
    if (value >= Asc.c_oAscSlideTransitionParams.Prism_Left_Inverted && value <= Asc.c_oAscSlideTransitionParams.Prism_Down_Inverted)
        prismId = 'prism-box';
    else if (value >= Asc.c_oAscSlideTransitionParams.Prism_Left_Content && value <= Asc.c_oAscSlideTransitionParams.Prism_Down_Content)
        prismId = 'prism-rotate';
    else if (value >= Asc.c_oAscSlideTransitionParams.Prism_Left_ContentInv && value <= Asc.c_oAscSlideTransitionParams.Prism_Down_ContentInv)
        prismId = 'prism-orbit';
    return prismId;
};

const isShape = effect => {
    return effect == Asc.c_oAscSlideTransitionTypes.Circle ||
        effect == Asc.c_oAscSlideTransitionTypes.Diamond ||
        effect == Asc.c_oAscSlideTransitionTypes.Plus ||
        effect == Asc.c_oAscSlideTransitionTypes.BoxZoom;
};

const getShapeType = value => {
    if (value == Asc.c_oAscSlideTransitionParams.Diamond_Default)
        return Asc.c_oAscSlideTransitionTypes.Diamond;
    if (value == Asc.c_oAscSlideTransitionParams.Plus_Default)
        return Asc.c_oAscSlideTransitionTypes.Plus;
    if (value == Asc.c_oAscSlideTransitionParams.BoxZoom_In || value == Asc.c_oAscSlideTransitionParams.BoxZoom_Out)
        return Asc.c_oAscSlideTransitionTypes.BoxZoom;
    return Asc.c_oAscSlideTransitionTypes.Circle;
};

const getEffectItem = (effect, prismId, _arrEffect) => {
    if (isShape(effect))
        effect = Asc.c_oAscSlideTransitionTypes.Circle;
    for (var i=0; i < _arrEffect.length; i++) {
        if (_arrEffect[i].value == effect &&
            (effect != Asc.c_oAscSlideTransitionTypes.Prism || _arrEffect[i].prismId == prismId)) return _arrEffect[i];
    }
    return _arrEffect[0];
};

const getEffectPreview = (nameEffect, thumbEffect) => (
    <span slot="after" className="transition-effect-preview">
        {thumbEffect && (
            <SvgIcon symbolId={thumbEffect.id} className="icon icon-svg transition"/>
        )}
        {nameEffect}
    </span>
);

const PageTransition = props => {
    const { t } = useTranslation();
    const _t = t("View.Edit", { returnObjects: true });
    const isAndroid = Device.android;
    const _arrEffect = getEffectOptions(_t);
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
        {displayValue: _t.textMorphWords,         value: Asc.c_oAscSlideTransitionParams.Morph_Words},
        {displayValue: _t.textMorphLetters,       value: Asc.c_oAscSlideTransitionParams.Morph_Letters},
        {displayValue: _t.textNone,               value: Asc.c_oAscSlideTransitionParams.Cut_Default},
        {displayValue: _t.textBlack,              value: Asc.c_oAscSlideTransitionParams.Cut_ThroughBlack},
        {displayValue: _t.textHorizontal,         value: Asc.c_oAscSlideTransitionParams.Blinds_Horizontal},
        {displayValue: _t.textVertical,           value: Asc.c_oAscSlideTransitionParams.Blinds_Vertical},
        {displayValue: _t.textHorizontal,         value: Asc.c_oAscSlideTransitionParams.Checker_Horizontal},
        {displayValue: _t.textVertical,           value: Asc.c_oAscSlideTransitionParams.Checker_Vertical},
        {displayValue: _t.textHorizontal,         value: Asc.c_oAscSlideTransitionParams.Comb_Horizontal},
        {displayValue: _t.textVertical,           value: Asc.c_oAscSlideTransitionParams.Comb_Vertical},
        {displayValue: _t.textCircle,             value: Asc.c_oAscSlideTransitionParams.Circle_Default},
        {displayValue: _t.textDiamond,            value: Asc.c_oAscSlideTransitionParams.Diamond_Default},
        {displayValue: _t.textDissolve,           value: Asc.c_oAscSlideTransitionParams.Dissolve_Default},
        {displayValue: _t.textPlus,               value: Asc.c_oAscSlideTransitionParams.Plus_Default},
        {displayValue: _t.textHorizontal,         value: Asc.c_oAscSlideTransitionParams.RandomBar_Horizontal},
        {displayValue: _t.textVertical,           value: Asc.c_oAscSlideTransitionParams.RandomBar_Vertical},
        {displayValue: _t.textIn,                 value: Asc.c_oAscSlideTransitionParams.BoxZoom_In},
        {displayValue: _t.textOut,                value: Asc.c_oAscSlideTransitionParams.BoxZoom_Out},
        {displayValue: _t.textFromLeft,           value: Asc.c_oAscSlideTransitionParams.Vortex_Left},
        {displayValue: _t.textFromRight,          value: Asc.c_oAscSlideTransitionParams.Vortex_Right},
        {displayValue: _t.textFromTop,            value: Asc.c_oAscSlideTransitionParams.Vortex_Up},
        {displayValue: _t.textFromBottom,         value: Asc.c_oAscSlideTransitionParams.Vortex_Down},
        {displayValue: _t.textLeft,               value: Asc.c_oAscSlideTransitionParams.Switch_Left},
        {displayValue: _t.textRight,              value: Asc.c_oAscSlideTransitionParams.Switch_Right},
        {displayValue: _t.textLeft,               value: Asc.c_oAscSlideTransitionParams.Flip_Left},
        {displayValue: _t.textRight,              value: Asc.c_oAscSlideTransitionParams.Flip_Right},
        {displayValue: _t.textCenter,             value: Asc.c_oAscSlideTransitionParams.Ripple_Center},
        {displayValue: _t.textFromTopLeft,        value: Asc.c_oAscSlideTransitionParams.Ripple_LeftUp},
        {displayValue: _t.textFromTopRight,       value: Asc.c_oAscSlideTransitionParams.Ripple_RightUp},
        {displayValue: _t.textFromBottomLeft,     value: Asc.c_oAscSlideTransitionParams.Ripple_LeftDown},
        {displayValue: _t.textFromBottomRight,    value: Asc.c_oAscSlideTransitionParams.Ripple_RightDown},
        {displayValue: _t.textHoneycomb,         value: Asc.c_oAscSlideTransitionParams.Honeycomb_Default},
        {displayValue: _t.textFromLeft,           value: Asc.c_oAscSlideTransitionParams.Prism_Left},
        {displayValue: _t.textFromRight,          value: Asc.c_oAscSlideTransitionParams.Prism_Right},
        {displayValue: _t.textFromTop,            value: Asc.c_oAscSlideTransitionParams.Prism_Up},
        {displayValue: _t.textFromBottom,         value: Asc.c_oAscSlideTransitionParams.Prism_Down},
        {displayValue: _t.textFromLeft,           value: Asc.c_oAscSlideTransitionParams.Prism_Left_Inverted},
        {displayValue: _t.textFromRight,          value: Asc.c_oAscSlideTransitionParams.Prism_Right_Inverted},
        {displayValue: _t.textFromTop,            value: Asc.c_oAscSlideTransitionParams.Prism_Up_Inverted},
        {displayValue: _t.textFromBottom,         value: Asc.c_oAscSlideTransitionParams.Prism_Down_Inverted},
        {displayValue: _t.textFromLeft,           value: Asc.c_oAscSlideTransitionParams.Prism_Left_Content},
        {displayValue: _t.textFromRight,          value: Asc.c_oAscSlideTransitionParams.Prism_Right_Content},
        {displayValue: _t.textFromTop,            value: Asc.c_oAscSlideTransitionParams.Prism_Up_Content},
        {displayValue: _t.textFromBottom,         value: Asc.c_oAscSlideTransitionParams.Prism_Down_Content},
        {displayValue: _t.textFromLeft,           value: Asc.c_oAscSlideTransitionParams.Prism_Left_ContentInv},
        {displayValue: _t.textFromRight,          value: Asc.c_oAscSlideTransitionParams.Prism_Right_ContentInv},
        {displayValue: _t.textFromTop,            value: Asc.c_oAscSlideTransitionParams.Prism_Up_ContentInv},
        {displayValue: _t.textFromBottom,         value: Asc.c_oAscSlideTransitionParams.Prism_Down_ContentInv},
        {displayValue: _t.textHorizontal,         value: Asc.c_oAscSlideTransitionParams.Doors_Horizontal},
        {displayValue: _t.textVertical,           value: Asc.c_oAscSlideTransitionParams.Doors_Vertical},
        {displayValue: _t.textHorizontal,         value: Asc.c_oAscSlideTransitionParams.Window_Horizontal},
        {displayValue: _t.textVertical,           value: Asc.c_oAscSlideTransitionParams.Window_Vertical},
        {displayValue: _t.textFromLeft,           value: Asc.c_oAscSlideTransitionParams.Ferris_Left},
        {displayValue: _t.textFromRight,          value: Asc.c_oAscSlideTransitionParams.Ferris_Right},
        {displayValue: _t.textLeft,               value: Asc.c_oAscSlideTransitionParams.Gallery_Left},
        {displayValue: _t.textRight,              value: Asc.c_oAscSlideTransitionParams.Gallery_Right}
    ];

    let _arrCurrentEffectTypes = [];

    const fillEffectTypes = (type, prismId) => {
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
                _arrCurrentEffectTypes = _arrEffectType.slice(20, 23);
                break;
            case Asc.c_oAscSlideTransitionTypes.Cut:
                _arrCurrentEffectTypes = _arrEffectType.slice(23, 25);
                break;
            case Asc.c_oAscSlideTransitionTypes.Blinds:
                _arrCurrentEffectTypes = _arrEffectType.slice(25, 27);
                break;
            case Asc.c_oAscSlideTransitionTypes.Checker:
                _arrCurrentEffectTypes = _arrEffectType.slice(27, 29);
                break;
            case Asc.c_oAscSlideTransitionTypes.Comb:
                _arrCurrentEffectTypes = _arrEffectType.slice(29, 31);
                break;
            case Asc.c_oAscSlideTransitionTypes.RandomBar:
                _arrCurrentEffectTypes = _arrEffectType.slice(35, 37);
                break;
            case Asc.c_oAscSlideTransitionTypes.Circle:
            case Asc.c_oAscSlideTransitionTypes.Diamond:
            case Asc.c_oAscSlideTransitionTypes.Plus:
            case Asc.c_oAscSlideTransitionTypes.BoxZoom:
                _arrCurrentEffectTypes.push(_arrEffectType[31], _arrEffectType[32], _arrEffectType[34], _arrEffectType[37], _arrEffectType[38]);
                break;
            case Asc.c_oAscSlideTransitionTypes.Vortex:
                _arrCurrentEffectTypes = _arrEffectType.slice(39, 43);
                break;
            case Asc.c_oAscSlideTransitionTypes.Switch:
                _arrCurrentEffectTypes = _arrEffectType.slice(43, 45);
                break;
            case Asc.c_oAscSlideTransitionTypes.Flip:
                _arrCurrentEffectTypes = _arrEffectType.slice(45, 47);
                break;
            case Asc.c_oAscSlideTransitionTypes.Ripple:
                _arrCurrentEffectTypes = _arrEffectType.slice(47, 52);
                break;
            case Asc.c_oAscSlideTransitionTypes.Prism:
                var currentPrismId = prismId || 'prism-cube';
                switch (currentPrismId) {
                    case 'prism-box':
                        _arrCurrentEffectTypes = _arrEffectType.slice(57, 61);
                        break;
                    case 'prism-rotate':
                        _arrCurrentEffectTypes = _arrEffectType.slice(61, 65);
                        break;
                    case 'prism-orbit':
                        _arrCurrentEffectTypes = _arrEffectType.slice(65, 69);
                        break;
                    default:
                        _arrCurrentEffectTypes = _arrEffectType.slice(53, 57);
                        break;
                }
                break;
            case Asc.c_oAscSlideTransitionTypes.Doors:
                _arrCurrentEffectTypes = _arrEffectType.slice(69, 71);
                break;
            case Asc.c_oAscSlideTransitionTypes.Window:
                _arrCurrentEffectTypes = _arrEffectType.slice(71, 73);
                break;
            case Asc.c_oAscSlideTransitionTypes.Ferris:
                _arrCurrentEffectTypes = _arrEffectType.slice(73, 75);
                break;
            case Asc.c_oAscSlideTransitionTypes.Gallery:
                _arrCurrentEffectTypes = _arrEffectType.slice(75, 77);
                break;
        }
        return (_arrCurrentEffectTypes.length > 0) ? _arrCurrentEffectTypes[0].value : -1;
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
    const _effectType = transitionObj.get_TransitionOption();
    const prismId = getPrismId(_effectType);
    const effectItem = getEffectItem(_effect, prismId, _arrEffect);
    const nameEffect = effectItem ? effectItem.displayValue : '';
    const thumbEffect = effectItem ? effectItem.thumb : '';
    if(_effect != Asc.c_oAscSlideTransitionTypes.None) fillEffectTypes(_effect, prismId);
    const nameEffectType = getEffectTypeName(_effectType);

    const _effectDuration = transitionObj.get_TransitionDuration();
    const noParameters = _effect == Asc.c_oAscSlideTransitionTypes.None ||
                        _effect == Asc.c_oAscSlideTransitionTypes.Random ||
                        _effect == Asc.c_oAscSlideTransitionTypes.Dissolve ||
                        _effect == Asc.c_oAscSlideTransitionTypes.Honeycomb;

    useEffect(() => {
        changeRange((_effectDelay !== null && _effectDelay !== undefined) ? parseInt(_effectDelay / 1000.) : 0);
    }, [_effectDelay])

    return (
        <Page className="slide-transition">
            <Navbar title={t('View.Edit.textTransitions')} backLink={_t.textBack}>
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
                <ListItem link="/effect/" title={_t.textEffect} routeProps={{
                    _arrEffect,
                    onEffectClick: props.onEffectClick,
                    fillEffectTypes,
                    _effect,
                    _prismId: prismId
                }}>
                    {getEffectPreview(nameEffect, thumbEffect)}
                </ListItem>
                <ListItem link="/type/" title={_t.textType} 
                    after={!noParameters ? nameEffectType : ''} 
                    disabled={noParameters} routeProps={{
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
                                {isAndroid ? 
                                    <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                                : ' - '}
                            </Button>
                            {isAndroid && <label>{(_effectDuration !== null && _effectDuration !== undefined) ?  (parseInt(_effectDuration / 1000.) + ' ' + _t.textSec) : ''}</label>}
                            <Button outline className='increment item-link' onClick={() => {
                                let duration = parseInt(_effectDuration / 1000);
                                duration = Math.min(300, ++duration);
                                props.changeDuration(duration);
                            }}>
                                {isAndroid ? 
                                    <SvgIcon symbolId={IconExpandUp.id} className={'icon icon-svg'} />
                                : ' + '}
                            </Button>
                        </Segmented>
                    </div>
                </ListItem>
            </List>
            <List>
                <ListItem>
                    <span>{_t.textStartOnTap}</span>
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
    const [currentPrismId, setPrismId] = useState(props._prismId);
    const _arrEffect = props._arrEffect;
    const _arrEffectGroups = getEffectGroups(_t);

    return (
        <Page className="style-effect">
            <Navbar title={_t.textEffect} backLink={_t.textBack}>
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
            {_arrEffect.length ? (
                _arrEffectGroups.map(group => {
                    const groupItems = _arrEffect.filter(elem => elem.group == group.id);
                    return groupItems.length ? (
                        <Fragment key={group.id}>
                            <BlockTitle>{group.displayValue}</BlockTitle>
                            <List mediaList>
                                {groupItems.map((elem, index) => {
                                    const prismId = elem.value == Asc.c_oAscSlideTransitionTypes.Prism ? elem.prismId : undefined;
                                    const checked = (elem.value == currentEffect || (elem.value == Asc.c_oAscSlideTransitionTypes.Circle && isShape(currentEffect))) &&
                                        (elem.value != Asc.c_oAscSlideTransitionTypes.Prism || prismId == currentPrismId);
                                    return (
                                        <ListItem key={index} radio name="editslide-effect" title={elem.displayValue} value={elem.value} 
                                            checked={checked} onChange={() => {
                                                const selectedPrismId = elem.value == Asc.c_oAscSlideTransitionTypes.Prism ? prismId : undefined;
                                                setEffect(elem.value);
                                                setPrismId(selectedPrismId);
                                                let valueEffectTypes = props.fillEffectTypes(elem.value, selectedPrismId);
                                                let effect = isShape(elem.value) ? getShapeType(valueEffectTypes) : elem.value;
                                                props.onEffectClick(effect, valueEffectTypes);
                                            }}>
                                                <span slot="media" className="transition-effect-icon">
                                                    <SvgIcon symbolId={elem.thumb.id} className="icon icon-svg transition"/>
                                                </span>
                                            </ListItem>
                                    )
                                })}
                            </List>
                            </Fragment>
                    ) : null;
                })
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
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg white'} />
                            }
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
                                    let effect = isShape(props._effect) ? getShapeType(elem.value) : props._effect;
                                    props.onEffectTypeClick(elem.value, effect);
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
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg white'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <ThemeColorPalette changeColor={changeColor} curColor={fillColor} customColors={customColors} transparent={false} />
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
                            {Device.ios ? 
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg white'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <CustomColorPicker currentColor={fillColor} onAddNewColor={onAddNewColor} />
        </Page>
    )
};

const InjectEditSlide = inject("storeFocusObjects")(observer(EditSlide));
const Theme = inject("storeSlideSettings")(observer(PageTheme));
const Layout = inject("storeSlideSettings", "storeFocusObjects")(observer(PageLayout));
const Transition = inject("storeSlideSettings", "storeFocusObjects")(observer(PageTransition));
const Type = inject("storeSlideSettings", "storeFocusObjects")(observer(PageType));
const Effect = inject("storeSlideSettings", "storeFocusObjects")(observer(PageEffect));
const StyleFillColor = inject("storeSlideSettings", "storePalette", "storeFocusObjects")(observer(PageFillColor));
const CustomFillColor = inject("storeSlideSettings", "storePalette", "storeFocusObjects")(observer(PageCustomFillColor));

export {
    InjectEditSlide as EditSlide,
    Theme,
    Layout,
    Transition,
    Type,
    Effect,
    StyleFillColor,
    CustomFillColor
};
