import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";

import { AddSlide } from '../../view/add/AddSlide';

class AddSlideController extends Component {
    constructor (props) {
        super(props);
    }
    render () {
        return (
            <AddSlide
            />
        )
    }
}

export default AddSlideController;