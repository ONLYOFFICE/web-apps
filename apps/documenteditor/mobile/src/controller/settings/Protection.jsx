import React, { useEffect, useState } from 'react';
import { observer, inject } from "mobx-react";
import ProtectionView from '../../view/settings/Protection';
import { useTranslation } from 'react-i18next';
import { f7 } from "framework7-react";
import { Device } from '../../../../../common/mobile/utils/device';
import Snackbar from '../../components/Snackbar/Snackbar';

const ProtectionController = props => {
    const { t } = useTranslation();
    const [isSnackbarVisible, setSnackbarVisible] = useState(false);

    const onProtectClick = () => {
        const api = Common.EditorApi.get();
        const appOptions = props.storeAppOptions;
        const isProtected = appOptions.isProtected;
        let propsProtection = api.asc_getDocumentProtection();
        const isPassword = propsProtection?.asc_getIsPassword();

        if(isProtected) {
            if(propsProtection && isPassword) {
                f7.dialog.create({
                    title: t('Settings.titleDialogUnprotect'),
                    text: t('Settings.textDialogUnprotect'),
                    content: Device.ios ?
                        '<div class="input-field"><input type="password" class="modal-text-input" name="protection-password" placeholder="' + t('Settings.advDRMPassword') + '" id="protection-password"></div>' : '<div class="input-field"><div class="inputs-list list inline-labels"><ul><li><div class="item-content item-input"><div class="item-inner"><div class="item-input-wrap"><input type="password" name="protection-password" id="protection-password" placeholder=' + t('Settings.advDRMPassword') + '></div></div></div></li></ul></div></div>',
                    cssClass: 'dlg-adv-options',
                    buttons: [
                        {
                            text: t('Settings.textCancel')
                        },
                        {
                            text: t('Settings.textOk'),
                            onClick: () => {
                                const passwordValue = document.querySelector('#protection-password')?.value;
                               
                                if(passwordValue) {
                                    propsProtection.asc_setEditType(Asc.c_oAscEDocProtect.None);
                                    propsProtection.asc_setPassword(passwordValue);
                                    api.asc_setDocumentProtection(propsProtection);
                                }
                            }
                        }
                    ]
                }).open();
            } else {
                if (!propsProtection) 
                    propsProtection = new AscCommonWord.CDocProtect();

                appOptions.setTypeProtection(null);
                propsProtection.asc_setEditType(Asc.c_oAscEDocProtect.None);
                api.asc_setDocumentProtection(propsProtection);

                setSnackbarVisible(true);
            }
        } else {
            f7.views.current.router.navigate('/protect');
        }
    }

    return (
        <>
            <ProtectionView onProtectClick={onProtectClick} />
            <Snackbar isShowSnackbar={isSnackbarVisible} message={t('Settings.textProtectTurnOff')} closeCallback={() => setSnackbarVisible(false)} />
        </>
    );
   
}

export default inject('storeAppOptions')(observer(ProtectionController));