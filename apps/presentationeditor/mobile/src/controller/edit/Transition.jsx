import React, { Component } from "react";
import Transition from "../../view/edit/Transition";

class TransitionController extends Component {
    constructor(props) {
        super(props);
    }

    onApplyAll() {
        const api = Common.EditorApi.get();
        console.log(api);
        // api.SlideTimingApplyToAll();
    };

    changeDuration(_effectDuration) {
        const api = Common.EditorApi.get();
        let props = new Asc.CAscSlideProps(),
            timing = new Asc.CAscSlideTiming();

        timing.put_TransitionDuration(_effectDuration);
        props.put_timing(timing);
        api.SetSlideProps(props);
    };

    onStartClick(value) {
        const api = Common.EditorApi.get();
        let props = new Asc.CAscSlideProps(),
            timing = new Asc.CAscSlideTiming();

        timing.put_SlideAdvanceOnMouseClick(value);
        props.put_timing(timing);
        api.SetSlideProps(props);
    };

    onDelayCheck(value, _effectDelay) {
        const api = Common.EditorApi.get();
        let props = new Asc.CAscSlideProps(),
            timing = new Asc.CAscSlideTiming();

        timing.put_SlideAdvanceAfter(value);
        timing.put_SlideAdvanceDuration(_effectDelay);
        props.put_timing(timing);
        api.SetSlideProps(props);
    }

    onDelay(_effectDelay) {
        const api = Common.EditorApi.get();
        let props = new Asc.CAscSlideProps(),
            timing = new Asc.CAscSlideTiming();

        timing.put_SlideAdvanceDuration(_effectDelay);
        props.put_timing(timing);
        api.SetSlideProps(props);
    };

    render() {
        return (
            <Transition 
                onApplyAll={this.onApplyAll} 
                onStartClick={this.onStartClick}
                onDelayCheck={this.onDelayCheck}
                onDelay={this.onDelay}
            />
        );
    }
}


export default TransitionController;