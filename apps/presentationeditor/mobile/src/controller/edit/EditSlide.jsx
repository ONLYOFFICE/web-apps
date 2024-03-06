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

        if (color == 'transparent') {
            fill.put_type(Asc.c_oAscFill.FILL_TYPE_NOFILL);
            fill.put_fill(null);
        } else {
            fill.put_type(Asc.c_oAscFill.FILL_TYPE_SOLID);
            fill.put_fill(new Asc.asc_CFillSolid());
            fill.get_fill().put_color(Common.Utils.ThemeColor.getRgbColor(color));
        }

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
            />
        )
    }
}

export default inject('storeFocusObjects', 'storeSlideSettings')(observer(EditSlideController));