import React, { Component } from "react";
import SaveACopy from "../../view/settings/SaveACopy";
import { Device } from '../../../../../common/mobile/utils/device';
import { f7 } from 'framework7-react';
import { withTranslation } from 'react-i18next';
import { observer, inject } from "mobx-react";

class SaveACopyController extends Component {
    constructor(props) {
        super(props);
        this.onSaveFormat = this.onSaveFormat.bind(this);
        this.appOptions = this.props.storeAppOptions;
        this._state = {
            isFromGatewayRequestSaveAs: false,
            fileExt: undefined
        }
    }

    componentDidMount() {
        const api = Common.EditorApi.get();
        api.asc_registerCallback('asc_onDownloadUrl', this.onDownloadUrl.bind(this));
    }

    closeModal() {
        if (Device.phone) {
            f7.sheet.close('.settings-popup', false);
        } else {
            f7.popover.close('#settings-popover');
        }
    }

    onDownloadUrl (url, fileType) {
        if (this._state.isFromGatewayRequestSaveAs) {
            let docTitle = this.props.storePresentationInfo.dataDoc.title;
            !docTitle && (docTitle = this.txtUntitled);

            if (typeof this._state.fileExt == 'string') {
                var idx = docTitle.lastIndexOf('.');
                if (idx>0)
                    docTitle = docTitle.substring(0, idx) + this._state.fileExt;
            }

            Common.Gateway.requestSaveAs(url, docTitle, fileType);
        }

        this._state.isFromGatewayRequestSaveAs = false;
    }

    onSaveFormat(format, ext) {
        const api = Common.EditorApi.get();
        const options = new Asc.asc_CDownloadOptions(format, true);
        this._state.fileExt = ext;
        const isNeedDownload = !!format;
        options.asc_setIsSaveAs(isNeedDownload);

        if (format) {
            this._state.isFromGatewayRequestSaveAs = true;
            api.asc_DownloadAs(options);
        }
    }

    render() {
        return (
            <SaveACopy 
                onSaveFormat={this.onSaveFormat} 
            />
        );
    }
}

const SaveACopyWithTranslation = inject("storeAppOptions", "storePresentationInfo")(observer(withTranslation()(SaveACopyController)));

export {
    SaveACopyWithTranslation as SaveACopyController,
};