import React, { createContext } from 'react';
import { f7 } from 'framework7-react';
import { Device } from '../../../../../common/mobile/utils/device';
import { withTranslation } from 'react-i18next';
import { AddAnnotationView } from '../../view/add/AddAnnotation';
import { LocalStorage } from '../../../../../common/mobile/utils/LocalStorage.mjs';
import { observer, inject } from "mobx-react";

export const AddAnnotationContext = createContext();

const AddAnnotationController = inject('storeAppOptions')(observer(props => {
    const appOptions = props.storeAppOptions;
    const closeModal = () => {
        if (Device.phone) {
            f7.sheet.close('#annotation-sheet', true);
        } else {
            f7.popover.close('#annotation-popover');
        }
    }

    const switchDisplayComments = (isComments) => {
        const api = Common.EditorApi.get();
        appOptions.changeCanViewComments(isComments);

        if (!isComments) {
            switchDisplayResolved(isComments);
            api.asc_hideComments();
            LocalStorage.setBool("de-settings-resolvedcomment", false);
        } else {
            const resolved = LocalStorage.getBool("de-settings-resolvedcomment");
            api.asc_showComments(resolved);
        }

        LocalStorage.setBool("de-mobile-settings-livecomment", isComments);
    }

    const switchDisplayResolved = (isComments) => {
        const api = Common.EditorApi.get();
        const displayComments = LocalStorage.getBool("de-mobile-settings-livecomment",true);

        if (displayComments) {
            api.asc_showComments(isComments);
            LocalStorage.setBool("de-settings-resolvedcomment", isComments);
        }
    }

    const changeMarkColor = (color) => {}

    const onMarkType = (type) => {
        const api = Common.EditorApi.get();
        api.SetMarkerFormat(type);
    }

    return (
        <AddAnnotationContext.Provider value={{
            switchDisplayComments,
            closeModal,
            onMarkType,
            changeMarkColor
        }}>
            <AddAnnotationView 
                closeModal={closeModal}
                switchDisplayComments={switchDisplayComments}
                changeMarkColor={changeMarkColor}
            />
        </AddAnnotationContext.Provider>
    )
}));

const AddAnnotationWithTranslation = withTranslation()(AddAnnotationController);

export { AddAnnotationWithTranslation as AddAnnotationController };