import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";

import { EditSlide } from '../../view/edit/EditSlide';

class EditSlideController extends Component {
    constructor (props) {
        super(props);
    }
    render () {
        return (
            <EditSlide
            />
        )
    }
}

export default EditSlideController;