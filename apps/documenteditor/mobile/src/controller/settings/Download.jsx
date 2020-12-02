import React, { Component } from "react";
import Download from "../../view/settings/Download";
import { Device } from '../../../../../common/mobile/utils/device';
import { f7 } from 'framework7-react';
import { withTranslation } from 'react-i18next';

class DownloadController extends Component {
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

    onSaveFormat(format) {
        const api = Common.EditorApi.get();
        const { t } = this.props;

        if(format) {
            if (format == Asc.c_oAscFileType.TXT || format == Asc.c_oAscFileType.RTF) {
                f7.dialog.confirm(
                    (format === Asc.c_oAscFileType.TXT) ? t("Settings.textDownloadTxt") : t("Settings.textDownloadRtf"),
                    t("Settings.notcriticalErrorTitle"),
                    function () {
                        if (format == Asc.c_oAscFileType.TXT) {
                            // ToDo: choose txt options
                        }
                        else {
                            api.asc_DownloadAs(new Asc.asc_CDownloadOptions(format));
                        }
                    }
                );
            } 
            else {
                api.asc_DownloadAs(new Asc.asc_CDownloadOptions(format));
            }

            this.closeModal();
        }
    }

    render() {
        return (
            <Download onSaveFormat={this.onSaveFormat} />
        );
    }
}


export default withTranslation()(DownloadController);