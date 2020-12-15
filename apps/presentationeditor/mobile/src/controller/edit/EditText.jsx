import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";

import { EditText } from '../../view/edit/EditText';

class EditTextController extends Component {
    constructor (props) {
        super(props);
    }
    render () {
        return (
            <EditText
            />
        )
    }
}

export default EditTextController;