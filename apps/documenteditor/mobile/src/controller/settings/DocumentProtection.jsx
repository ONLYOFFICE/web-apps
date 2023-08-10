import React from 'react';
import { Device } from '../../../../../common/mobile/utils/device';
import { observer, inject } from "mobx-react";
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
        const appOptions = this.props.storeAppOptions;
        const isViewer = appOptions.isViewer;
        const protection = api.asc_getDocumentProtection() || new AscCommonWord.CDocProtect();

        appOptions.setProtection(true);
        appOptions.setTypeProtection(typeProtection);

        if(typeProtection !== Asc.c_oAscEDocProtect.TrackedChanges && !isViewer) {
             appOptions.changeViewerMode(true);
             api.asc_addRestriction(Asc.c_oAscRestrictionType.View);
        }

        protection.asc_setEditType(typeProtection);
        protection.asc_setPassword(password);
        api.asc_setDocumentProtection(protection);

        this.closeModal();
    };

    render() {
        return <ProtectionDocumentView onProtectDocument={this.onProtectDocument} />
    }
}

export default inject('storeAppOptions')(observer(ProtectionDocumentController));