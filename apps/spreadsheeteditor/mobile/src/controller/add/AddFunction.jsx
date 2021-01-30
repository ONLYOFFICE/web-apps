import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';

import AddFunction from '../../view/add/AddFunction';

class AddFunctionController extends Component {
    constructor (props) {
        super(props);
    }

    closeModal () {
        if ( Device.phone ) {
            f7.sheet.close('.add-popup', true);
        } else {
            f7.popover.close('#add-popover');
        }
    }

    render () {
        return (
            <AddFunction
            />
        )
    }
}

export default AddFunctionController;