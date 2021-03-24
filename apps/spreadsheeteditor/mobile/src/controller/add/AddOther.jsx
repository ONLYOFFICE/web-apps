import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import { withTranslation} from 'react-i18next';

import {AddOther} from '../../view/add/AddOther';

class AddOtherController extends Component {
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

    hideAddComment () {
        const cellinfo = Common.EditorApi.get().asc_getCellInfo();
        const iscelllocked = cellinfo.asc_getLocked();
        const seltype = cellinfo.asc_getSelectionType();
        return !(seltype === Asc.c_oAscSelectionType.RangeCells && !iscelllocked);
    }

    render () {
        return (
            <AddOther closeModal={this.closeModal}
                      hideAddComment={this.hideAddComment}
            />
        )
    }
}

const AddOtherWithTranslation = withTranslation()(AddOtherController);

export {AddOtherWithTranslation as AddOtherController};