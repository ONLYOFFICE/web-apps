import React, { Component } from "react";
import {Transition} from "../../view/edit/Transition";
class TransitionController extends Component {
    constructor(props) {
        super(props);
    };

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

    onEffectClick(value) {
        const api = Common.EditorApi.get();

        // let props = new Asc.CAscSlideProps(),
        //     timing = new Asc.CAscSlideTransition(),
        //     _effectType = this.fillEffectTypes(value);

        // timing.put_TransitionType(value);
        // timing.put_TransitionOption(_effectType);
        // props.put_transition(timing);
        // api.SetSlideProps(props);
        
    };

    render() {
        return (
            <Transition 
                onApplyAll={this.onApplyAll} 
                changeDuration={this.changeDuration}
                onStartClick={this.onStartClick}
                onDelayCheck={this.onDelayCheck}
                onDelay={this.onDelay}
                onEffectClick={this.onEffectClick}
            />
        );
    }
}


export default TransitionController;