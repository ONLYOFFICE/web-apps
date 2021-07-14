import React, { Component } from 'react';
import { Device } from '../../../../../common/mobile/utils/device';
import { f7 } from "framework7-react";
import { Encoding } from "../../view/settings/Encoding";

class EncodingController extends Component {
    constructor(props) {
        super(props);
        this.onSaveFormat = this.onSaveFormat.bind(this);
    }

    closeModal() {
        if (Device.phone) {
            f7.sheet.close('.settings-popup', true);
        } else {
            f7.popover.close('#settings-popover');
        }
    }

    onSaveFormat(formatOptions, valueEncoding, valueDelimeter) {
        const api = Common.EditorApi.get();

        this.closeModal();
        formatOptions && formatOptions.asc_setAdvancedOptions(new Asc.asc_CTextOptions(valueEncoding, valueDelimeter));
        api.asc_DownloadAs(formatOptions);
    }

    render() {
        return (
            <Encoding onSaveFormat={this.onSaveFormat} />
        );
    }
}

export default EncodingController;