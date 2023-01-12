import React from 'react';
import { Device } from '../../../../../common/mobile/utils/device';
// import { withTranslation } from 'react-i18next';
import ProtectionDocumentView from '../../view/settings/DocumentProtection';
import { f7 } from "framework7-react";

class ProtectionDocumentController extends React.Component {
    constructor(props) {
        super(props);
        this.onProtectDocument = this.onProtectDocument.bind(this);
    }

    closeModal() {
        if (Device.phone) {
            f7.sheet.close('.settings-popup', false);
        } else {
            f7.popover.close('#settings-popover', false);
        }
    };

    onProtectDocument(typeProtection, password) {
        const api = Common.EditorApi.get();
        const protection = api.asc_getDocumentProtection() || new AscCommonWord.CDocProtect();

        protection.asc_setEditType(typeProtection);
        protection.asc_setPassword(password);
        api.asc_setDocumentProtection(protection);

        this.closeModal();
    };

    render() {
        return <ProtectionDocumentView onProtectDocument={this.onProtectDocument} />
    }
}

export default ProtectionDocumentController;