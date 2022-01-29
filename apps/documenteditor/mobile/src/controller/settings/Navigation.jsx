import React, { Component } from "react";
import Navigation from "../../view/settings/Navigation";
import { Device } from '../../../../../common/mobile/utils/device';
import { f7, Sheet } from 'framework7-react';

class NavigationController extends Component {
    constructor(props) {
        super(props);
    }

    closeModal() {
        if (Device.phone) {
            f7.sheet.close('.settings-popup', false);
        } else {
            f7.popover.close('#settings-popover');
        }
    }

    onSelectItem(index) {
        const api = Common.EditorApi.get();
        const navigationObject = api.asc_ShowDocumentOutline();

        if (navigationObject) {
            navigationObject.goto(index);
        }
    };

    render() {
        return (
            <Navigation onSelectItem={this.onSelectItem} />
        );
    }
}

export default NavigationController