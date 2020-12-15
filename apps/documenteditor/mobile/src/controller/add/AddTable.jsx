import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";

import { AddTable } from '../../view/add/AddTable';

class AddTableController extends Component {
    constructor (props) {
        super(props);
    }
    render () {
        return (
            <AddTable
            />
        )
    }
}

export default AddTableController;