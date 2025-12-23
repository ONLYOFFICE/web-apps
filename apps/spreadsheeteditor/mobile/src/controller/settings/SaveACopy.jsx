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

        Common.Notifications.on('fromencoding', () => {
            this._state.isFromGatewayRequestSaveAs = true;
        })
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
            let docTitle = this.props.storeSpreadsheetInfo.dataDoc.title;
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
        const { t } = this.props;
        const _t = t("View.Settings", { returnObjects: true });
        const api = Common.EditorApi.get();
        const isNeedDownload = !!format;
        const options = new Asc.asc_CDownloadOptions(format, true);
        this._state.fileExt = ext;
        options.asc_setIsSaveAs(isNeedDownload);
       
        if (format) {
            this.closeModal();
            if (format == Asc.c_oAscFileType.CSV) {
                f7.dialog.create({
                    title: _t.notcriticalErrorTitle,
                    text: _t.warnDownloadCsv,
                    buttons: [
                        {
                            text: _t.textCancel
                        },
                        {
                            text: _t.textOk,
                            onClick: () => {
                                const advOptions = api.asc_getAdvancedOptions();
                                Common.Notifications.trigger('fromsaveas');
                                Common.Notifications.trigger('openEncoding', Asc.c_oAscAdvancedOptionsID.CSV, advOptions, 2, options, true)
                            }
                        }
                    ]
                }).open();
            } else if (format == Asc.c_oAscFileType.ODS) {
                f7.dialog.create({
                    title: _t.notcriticalErrorTitle,
                    text: _t.warnDownloadOds,
                    buttons: [
                        {
                            text: _t.textCancel
                        },
                        {
                            text: _t.textOk,
                            onClick: () => {
                                this._state.isFromGatewayRequestSaveAs = true;
                                api.asc_DownloadAs(options);
                            }
                        }
                    ]
                }).open();
            } else {
                this._state.isFromGatewayRequestSaveAs = true;
                api.asc_DownloadAs(options);
            }
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

const SaveACopyWithTranslation = inject("storeAppOptions", "storeSpreadsheetInfo")(observer(withTranslation()(SaveACopyController)));

export {
    SaveACopyWithTranslation as SaveACopyController,
};