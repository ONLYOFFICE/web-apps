import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";

import AddSlide from '../../view/add/AddSlide';

class AddSlideController extends Component {
    constructor (props) {
        super(props);
        this.onSlideLayout = this.onSlideLayout.bind(this);
    }

    closeModal () {
        if ( Device.phone ) {
            f7.sheet.close('.add-popup', true);
        } else {
            f7.popover.close('#add-popover');
        }
    }

    onSlideLayout (type) {
        const api = Common.EditorApi.get();
        api.AddSlide(type);
        this.closeModal();
    }

    render () {
        return (
            <AddSlide onSlideLayout={this.onSlideLayout}
            />
        )
    }
}

export default AddSlideController;