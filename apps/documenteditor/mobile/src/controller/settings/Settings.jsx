import React, { createContext } from 'react';
import { useTranslation } from 'react-i18next';
import { f7 } from 'framework7-react';
import { observer, inject } from "mobx-react";
import { Device } from '../../../../../common/mobile/utils/device';
import SettingsView from "../../view/settings/Settings";
import { LocalStorage } from "../../../../../common/mobile/utils/LocalStorage.mjs";

export const SettingsContext = createContext();

const SettingsController = props => {
    const storeDocumentInfo = props.storeDocumentInfo;
    const appOptions = props.storeAppOptions;
    const docExt = storeDocumentInfo.dataDoc.fileType;
    const { t } = useTranslation();

    const closeModal = () => {
        if(Device.phone) {
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
        let config = appOptions.config;

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
        const isMobileView = appOptions.isMobileView;

        LocalStorage.setBool('mobile-view', !isMobileView);
        appOptions.changeMobileView();
        api.ChangeReaderMode();
    };

    const changeTitleHandler = () => {
        if(!appOptions.canRename) return;

        const docTitle = storeDocumentInfo.dataDoc.title;
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
                    text: t('Edit.textCancel')
                },
                {
                    text: t('Edit.textOk'),
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
                    title: t('Edit.notcriticalErrorTitle'),
                    text: t('Edit.textInvalidName') + '*+:\"<>?|\/',
                    buttons: [
                        {
                            text: t('Edit.textOk'),
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
                storeDocumentInfo.changeTitle(newTitle);
            }
        }
    }

    const clearAllFields = () => {
        const api = Common.EditorApi.get();

        api.asc_ClearAllSpecialForms();
        closeModal();
    };

    const toggleFavorite = () => {
        const isFavorite = appOptions.isFavorite;
        Common.Notifications.trigger('markfavorite', !isFavorite);
    };

    const saveAsPdf = () => {
        const api = Common.EditorApi.get();

        if (appOptions.isOffline) {
            api.asc_DownloadAs(new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.PDF));
        } else {
            const isFromBtnDownload = appOptions.canRequestSaveAs || !!appOptions.saveAsUrl;
            let options = new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.PDF, isFromBtnDownload);
            options.asc_setIsSaveAs(isFromBtnDownload);
            api.asc_DownloadAs(options);
        }
    }

    const submitForm = () => {
        const api = Common.EditorApi.get();
        api.asc_SendForm();
    }

    return (
        <SettingsContext.Provider value={{
            onPrint,
            showHelp,
            showFeedback,
            onOrthographyCheck,
            onDownloadOrigin,
            onChangeMobileView,
            changeTitleHandler,
            closeModal,
            clearAllFields,
            toggleFavorite,
            saveAsPdf,
            submitForm
        }}>
            <SettingsView />
        </SettingsContext.Provider>
    );
};

export default inject("storeAppOptions", "storeDocumentInfo")(observer(SettingsController));