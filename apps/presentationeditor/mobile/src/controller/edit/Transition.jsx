import React, { Component } from "react";
import Transition from "../../view/edit/Transition";

class TransitionController extends Component {
    constructor(props) {
        super(props);
    }

    initTransitionView(timing) {
 
        const _effect = timing.get_TransitionType();
        // me.getView('EditSlide').fillEffectTypes(_effect);
        // $('#edit-slide-effect .item-after').text(me.getView('EditSlide').getEffectName(_effect));
        // $('#edit-slide-effect-type').toggleClass('disabled', _effect == Asc.c_oAscSlideTransitionTypes.None);
        // $('#edit-slide-duration').toggleClass('disabled', _effect == Asc.c_oAscSlideTransitionTypes.None);

        // _effectType = timing.get_TransitionOption();
        // $('#edit-slide-effect-type .item-after').text((_effect != Asc.c_oAscSlideTransitionTypes.None) ? me.getView('EditSlide').getEffectTypeName(_effectType) : '');

        // _effectDuration = timing.get_TransitionDuration();
        // $('#edit-slide-duration .item-after label').text((_effectDuration!==null && _effectDuration!==undefined) ?  (parseInt(_effectDuration/1000.) + ' ' + me.textSec) : '');

        // $('#edit-slide-start-click input:checkbox').prop('checked', !!timing.get_SlideAdvanceOnMouseClick());
        // $('#edit-slide-delay input:checkbox').prop('checked', !!timing.get_SlideAdvanceAfter());
        // $('#edit-slide-delay .item-content:nth-child(2)').toggleClass('disabled',!timing.get_SlideAdvanceAfter());

        // _effectDelay = timing.get_SlideAdvanceDuration();
        // $('#edit-slide-delay .item-content:nth-child(2) .item-after').text((_effectDelay!==null && _effectDelay!==undefined) ? (parseInt(_effectDelay/1000.) + ' ' + me.textSec) : '');
        // $('#edit-slide-delay .item-content:nth-child(2) input').val([(_effectDelay!==null && _effectDelay!==undefined) ? parseInt(_effectDelay/1000.) : 0]);
    }

    render() {
        return (
            <Transition />
        );
    }
}

// const initTransitionView = (timing) => {
        
// }

export default TransitionController;