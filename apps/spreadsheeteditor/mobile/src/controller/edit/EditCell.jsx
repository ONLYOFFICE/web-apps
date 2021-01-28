import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';

import EditCell from '../../view/edit/EditCell';

class EditCellController extends Component {
    constructor (props) {
        super(props);
    }

    render () {
        return (
            <EditCell
            />
        )
    }
}

export default EditCellController;