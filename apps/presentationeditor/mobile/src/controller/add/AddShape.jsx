import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";

import AddShape from '../../view/add/AddShape';

class AddShapeController extends Component {
    constructor (props) {
        super(props);
        this.onShapeClick = this.onShapeClick.bind(this);
    }

    closeModal () {
        if ( Device.phone ) {
            f7.sheet.close('.add-popup', true);
        } else {
            f7.popover.close('#add-popover');
        }
    }

    onShapeClick (type) {
        const api = Common.EditorApi.get();
        api.AddShapeOnCurrentPage(type);
        this.closeModal();
    }

    render () {
        return (
            <AddShape onShapeClick={this.onShapeClick}
            />
        )
    }
}

export default AddShapeController;