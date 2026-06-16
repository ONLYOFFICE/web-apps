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

import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import { EditSlide } from '../../view/edit/EditSlide';
import {observer, inject} from "mobx-react";

class EditSlideController extends Component {
    constructor (props) {
        super(props);
        this.onDuplicateSlide = this.onDuplicateSlide.bind(this);
        this.onRemoveSlide = this.onRemoveSlide.bind(this);
        this.slideObject = this.props.storeFocusObjects.slideObject;
        this.props.storeSlideSettings.getFillColor(this.slideObject);
    }

    onThemeClick(index) {
        const api = Common.EditorApi.get();
        api.ChangeTheme(index);
    }

    onLayoutClick(index) {
        const api = Common.EditorApi.get();
        api.ChangeLayout(index);
    }

    onApplyAll() {
        const api = Common.EditorApi.get();
        api.SlideTransitionApplyToAll();
    };

    changeDuration(duration) {
        const api = Common.EditorApi.get();

        let props = new Asc.CAscSlideProps(),
            timing = new Asc.CAscSlideTransition(),
            _effectDuration = duration * 1000;

        timing.put_TransitionDuration(_effectDuration);
        props.put_transition(timing);
        api.SetSlideProps(props);
    };

    onStartClick(value) {
        const api = Common.EditorApi.get();

        let props = new Asc.CAscSlideProps(),
            timing = new Asc.CAscSlideTransition();

        timing.put_SlideAdvanceOnMouseClick(value);
        props.put_transition(timing);
        api.SetSlideProps(props);
    };

    onDelayCheck(value, _effectDelay) {
        const api = Common.EditorApi.get();

        let props = new Asc.CAscSlideProps(),
            timing = new Asc.CAscSlideTransition();

        timing.put_SlideAdvanceAfter(value);
        timing.put_SlideAdvanceDuration(_effectDelay);
        props.put_transition(timing);
        api.SetSlideProps(props);
    };

    onDelay(value) {
        const api = Common.EditorApi.get();

        let props = new Asc.CAscSlideProps(),
            timing = new Asc.CAscSlideTransition(),
            _effectDelay = value * 1000;

        timing.put_SlideAdvanceDuration(_effectDelay);
        props.put_transition(timing);
        api.SetSlideProps(props);
    };

    onEffectClick(value, effectType) {
        const api = Common.EditorApi.get();

        let props = new Asc.CAscSlideProps(),
            timing = new Asc.CAscSlideTransition();
        //  _effectType = this.fillEffectTypes(value);

        timing.put_TransitionType(value);
        timing.put_TransitionOption(effectType);
        props.put_transition(timing);
        api.SetSlideProps(props);
    };

    onEffectTypeClick(value, effect) {
        const api = Common.EditorApi.get();

        let props = new Asc.CAscSlideProps(),
            timing = new Asc.CAscSlideTransition();

        timing.put_TransitionType(effect);
        timing.put_TransitionOption(value);
        props.put_transition(timing);
        api.SetSlideProps(props);
    }

    onFillColor(color) {
        const api = Common.EditorApi.get();

        let props = new Asc.CAscSlideProps(),
            fill = new Asc.asc_CShapeFill();
        fill.put_type(Asc.c_oAscFill.FILL_TYPE_SOLID);
        fill.put_fill(new Asc.asc_CFillSolid());
        fill.get_fill().put_color(Common.Utils.ThemeColor.getRgbColor(color));
        props.put_background(fill);
        api.SetSlideProps(props);
        
    };

    closeModal() {
        if (Device.phone) {
            f7.sheet.close('#edit-sheet', true);
        } else {
            f7.popover.close('#edit-popover');
        }
    };

    onDuplicateSlide() {
        const api = Common.EditorApi.get();
        api.DublicateSlide();
        this.closeModal();
    };

    onRemoveSlide() {
        const api = Common.EditorApi.get();
        api.DeleteSlide();
        this.closeModal();
    };

    onResetBackground() {
        const api = Common.EditorApi.get();
        const props = new Asc.CAscSlideProps();                 
        props.put_ResetBackground(true);
        api.SetSlideProps(props);
    }

    render () {
        return (
            <EditSlide 
                onThemeClick={this.onThemeClick}
                onLayoutClick={this.onLayoutClick}
                onApplyAll={this.onApplyAll} 
                changeDuration={this.changeDuration}
                onStartClick={this.onStartClick}
                onDelayCheck={this.onDelayCheck}
                onDelay={this.onDelay}
                onEffectClick={this.onEffectClick}
                onEffectTypeClick={this.onEffectTypeClick}
                onFillColor={this.onFillColor}
                onDuplicateSlide={this.onDuplicateSlide}
                onRemoveSlide={this.onRemoveSlide}
                onResetBackground={this.onResetBackground}
            />
        )
    }
}

export default inject('storeFocusObjects', 'storeSlideSettings')(observer(EditSlideController));
