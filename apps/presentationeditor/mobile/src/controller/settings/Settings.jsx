import React, { createContext } from 'react';
import { Device } from '../../../../../common/mobile/utils/device';
import SettingsView from '../../view/settings/Settings';
import { f7 } from 'framework7-react';
import { observer, inject } from "mobx-react";
import { useTranslation } from 'react-i18next';

export const SettingsContext = createContext();

const SettingsController = props => {
    const appOptions = props.storeAppOptions;
    const storePresentationInfo = props.storePresentationInfo;
    const docExt = storePresentationInfo.dataDoc.fileType;
    const { t } = useTranslation();

    const closeModal = () => {
        if (Device.phone) {
            f7.sheet.close('.settings-popup', false);
        } else {
            f7.popover.close('#settings-popover', false);
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
        // let url = '{{HELP_URL}}';
        let url = __HELP_URL__;
        // let url = 'https://helpcenter.onlyoffice.com';

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
        window.open(url, "_blank");
    };

    const showFeedback = () => {
        let config = props.storeAppOptions.config;

        closeModal();
        if(config && !!config.feedback && !!config.feedback.url) {
            window.open(config.feedback.url, "_blank");
        } else window.open(__SUPPORT_URL__, "_blank");
    };

    const onDownloadOrigin = () => {
        closeModal();
        setTimeout(() => {
            Common.EditorApi.get().asc_DownloadOrigin();
        }, 0);
    };

    const changeTitleHandler = () => {
        if(!appOptions.canRename) return;

        const docTitle = storePresentationInfo.dataDoc?.title ?? '';
        const api = Common.EditorApi.get();
        api.asc_enableKeyEvents(true);

        f7.dialog.create({
            title: t('Toolbar.textRenameFile'),
            text : t('Toolbar.textEnterNewFileName'),
            content: Device.ios ?
            '<div class="input-field"><input type="text" class="modal-text-input" name="modal-title" id="modal-title"></div>' : '<div class="input-field modal-title"><div class="inputs-list list inline-labels"><ul><li><div class="item-content item-input"><div class="item-inner"><div class="item-input-wrap"><input type="text" name="modal-title" id="modal-title"></div></div></div></li></ul></div></div>',
            cssClass: 'dlg-adv-options',
            buttons: [
                {
                    text: t('View.Edit.textCancel')
                },
                {
                    text: t('View.Edit.textOk'),
                    cssClass: 'btn-change-title',
                    bold: true,
                    close: false,
                    onClick: () => {
                        const titleFieldValue = document.querySelector('#modal-title').value;

                        if(titleFieldValue.trim().length) {
                            changeTitle(titleFieldValue);
                            f7.dialog.close();
                        }
                    }
                }
            ],
            on: {
                opened: () => {
                    const nameDoc = docTitle.split('.')[0];
                    const titleField = document.querySelector('#modal-title');
                    const btnChangeTitle = document.querySelector('.btn-change-title');

                    titleField.value = nameDoc;
                    titleField.focus();
                    titleField.select();

                    titleField.addEventListener('input', () => {
                        if(titleField.value.trim().length) {
                            btnChangeTitle.classList.remove('disabled');
                        } else {
                            btnChangeTitle.classList.add('disabled');
                        }
                    });
                }
            }
        }).open();
    };

    const cutDocName = name => {
        if(name.length <= docExt.length) return name;
        const idx = name.length - docExt.length;

        return name.substring(idx) == docExt ? name.substring(0, idx) : name;
    };

    const changeTitle = (name) => {
        const api = Common.EditorApi.get();
        const currentTitle = `${name}.${docExt}`;
        let formatName = name.trim();

        if(formatName.length > 0 && cutDocName(currentTitle) !== formatName) {
            if(/[\t*\+:\"<>?|\\\\/]/gim.test(formatName)) {
                f7.dialog.create({
                    title: t('View.Edit.notcriticalErrorTitle'),
                    text: t('View.Edit.textInvalidName') + '*+:\"<>?|\/',
                    buttons: [
                        {
                            text: t('View.Edit.textOk'),
                            close: true
                        }
                    ]
                }).open();
            } else {
                const wopi = appOptions.wopi;
                formatName = cutDocName(formatName);

                if(wopi) {
                    api.asc_wopi_renameFile(formatName);
                } else {
                    Common.Gateway.requestRename(formatName);
                }

                const newTitle = `${formatName}.${docExt}`;
                storePresentationInfo.changeTitle(newTitle);
            }
        }
    }

    return (
        <SettingsContext.Provider value={{
            onPrint,
            showHelp,
            showFeedback,
            onDownloadOrigin,
            closeModal,
            changeTitleHandler
        }}>
            <SettingsView />
        </SettingsContext.Provider>
    );
};

export default inject("storeAppOptions", "storePresentationInfo")(observer(SettingsController));