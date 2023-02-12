import React, {useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import {f7} from 'framework7-react';
import { observer, inject } from "mobx-react";
import {Device} from '../../../../../common/mobile/utils/device';
import SettingsView from "../../view/settings/Settings";
import {LocalStorage} from "../../../../../common/mobile/utils/LocalStorage.mjs";

const Settings = props => {
    const { t } = useTranslation();

    useEffect(() => {
        if ( Device.phone ) {
            f7.popup.open('.settings-popup');
        } else {
            f7.popover.open('#settings-popover', '#btn-settings');
        }

        return () => {
            // component will unmount
        }
    });

    const closeModal = () => {
        if (Device.phone) {
            f7.sheet.close('.settings-popup');
        } else {
            f7.popover.close('#settings-popover');
        }
    };

    const onPrint = () => {
        const api = Common.EditorApi.get();

        closeModal();
        setTimeout(() => {
            api.asc_Print();
        }, 400);
    };

    const showHelp = () => {
        let url = __HELP_URL__;

        if (url.charAt(url.length-1) !== '/') {
            url += '/';
        }

        if (Device.sailfish || Device.android) {
            url+='mobile-applications/documents/mobile-web-editors/android/index.aspx';
        }
        else {
            url+='mobile-applications/documents/mobile-web-editors/ios/index.aspx';
        }

        closeModal();
        setTimeout(() => {
            window.open(url, "_blank");
        }, 400);
    };

    const showFeedback = () => {
        let config = props.storeAppOptions.config;

        closeModal();
        setTimeout(() => {
            if(config && !!config.feedback && !!config.feedback.url) {
                window.open(config.feedback.url, "_blank");
            } else window.open(__SUPPORT_URL__, "_blank");
        }, 400);
    }

    const onOrthographyCheck = () => {
        closeModal();
        setTimeout(() => {
            Common.EditorApi.get().asc_pluginRun("asc.{B631E142-E40B-4B4C-90B9-2D00222A286E}", 0);
        }, 400);
    };

    const onDownloadOrigin = () => {
        closeModal();
        setTimeout(() => {
            Common.EditorApi.get().asc_DownloadOrigin();
        }, 0);
    };

    const onChangeMobileView = () => {
        const api = Common.EditorApi.get();
        const appOptions = props.storeAppOptions;
        const isMobileView = appOptions.isMobileView;

        LocalStorage.setBool('mobile-view', !isMobileView);
        appOptions.changeMobileView();
        api.ChangeReaderMode();
    };

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
            }
        } else {
            f7.views.current.router.navigate('/protect');
        }
    }

    return <SettingsView usePopover={!Device.phone}
                         openOptions={props.openOptions}
                         closeOptions={props.closeOptions}
                         // onclosed={props.onclosed}
                         onPrint={onPrint}
                         showHelp={showHelp}
                         showFeedback={showFeedback}
                         onOrthographyCheck={onOrthographyCheck}
                         onDownloadOrigin={onDownloadOrigin}
                         onChangeMobileView={onChangeMobileView}
                         onProtectClick={onProtectClick}
    />
};

export default inject("storeAppOptions")(observer(Settings));