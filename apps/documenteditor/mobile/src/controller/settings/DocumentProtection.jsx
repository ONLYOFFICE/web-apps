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

        protection.asc_setEditType(typeProtection);
        protection.asc_setPassword(password);
        api.asc_setDocumentProtection(protection);

        if(typeProtection !== Asc.c_oAscEDocProtect.TrackedChanges) {
            appOptions.changeViewerMode(true);
            api.asc_addRestriction(Asc.c_oAscRestrictionType.View);
        } else if(!isViewer) {
            api.asc_removeRestriction(Asc.c_oAscRestrictionType.View)
            api.asc_addRestriction(Asc.c_oAscRestrictionType.None);
        }

        this.closeModal();
    };

    render() {
        return <ProtectionDocumentView onProtectDocument={this.onProtectDocument} />
    }
}

export default inject('storeAppOptions')(observer(ProtectionDocumentController));