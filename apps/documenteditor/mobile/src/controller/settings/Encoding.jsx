import React, { Component } from 'react';
import { Device } from '../../../../../common/mobile/utils/device';
import { f7, Page, Navbar, List, ListItem, BlockTitle, ListButton, Popover, Popup } from "framework7-react";
import { withTranslation } from 'react-i18next';
import { observer, inject } from "mobx-react";
import { Encoding } from "../../view/settings/Encoding";

class EncodingController extends Component {
    constructor(props) {
        super(props);
    }

    onSaveFormat(type, value) {
        const api = Common.EditorApi.get();
        api.asc_setAdvancedOptions(type, new Asc.asc_CTextOptions(value));
    }

    render() {
        return (
            <Encoding onSaveFormat={this.onSaveFormat} />
        );
    }
}

export default EncodingController;