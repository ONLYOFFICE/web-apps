import React, { Component } from "react";
import Download from "../../view/settings/Download";
import { Device } from '../../../../../common/mobile/utils/device';
import { f7 } from 'framework7-react';
// import { observer } from "mobx-react";
// import { withTranslation } from 'react-i18next';

class DownloadController extends Component {
    constructor(props) {
        super(props);
        this.onSaveFormat = this.onSaveFormat.bind(this);
    }

    closeModal() {
        if (Device.phone) {
            f7.sheet.close('#edit-sheet', true);
        } else {
            f7.popover.close('#edit-popover');
        }
    }

    onSaveFormat(format) {
        // const api = Common.EditorApi.get();
        console.log(format);
        if(format) {
            // if (format == Asc.c_oAscFileType.TXT || format == Asc.c_oAscFileType.RTF) {
            //     // const { t } = this.props;
            //     // f7.dialog.alert(t('Edit.textNotUrl'), t('Edit.notcriticalErrorTitle'));
            //     if (format == Asc.c_oAscFileType.TXT) {
            //         // Common.NotificationCenter.trigger('download:advanced', Asc.c_oAscAdvancedOptionsID.TXT, api.asc_getAdvancedOptions(), 2, new Asc.asc_CDownloadOptions(format));

            //         asc_CDownloadOptions(format);
            //     }
            //     else {
            //         api.asc_DownloadAs(new Asc.asc_CDownloadOptions(format));
            //     }
            // } 
            // else {
            //     api.asc_DownloadAs(new Asc.asc_CDownloadOptions(format));
            // }

            this.closeModal();
        }
    }

    render() {
        return (
            <Download onSaveFormat={this.onSaveFormat} />
        );
    }
}


export default DownloadController;