import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";

import { AddShape } from '../../view/add/AddShape';

class AddShapeController extends Component {
    constructor (props) {
        super(props);
    }
    render () {
        return (
            <AddShape
            />
        )
    }
}

export default AddShapeController;