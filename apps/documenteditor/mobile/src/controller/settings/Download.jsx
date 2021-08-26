import React, { Component } from "react";
import Download from "../../view/settings/Download";
import { Device } from '../../../../../common/mobile/utils/device';
import { f7 } from 'framework7-react';
import { withTranslation } from 'react-i18next';
import { observer, inject } from "mobx-react";

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
        const _t = t("Settings", { returnObjects: true });

        if(format) {
            this.closeModal();
            if (format == Asc.c_oAscFileType.TXT || format == Asc.c_oAscFileType.RTF) {
                f7.dialog.create({
                    title: _t.notcriticalErrorTitle,
                    text: (format === Asc.c_oAscFileType.TXT) ? _t.textDownloadTxt : _t.textDownloadRtf,
                    buttons: [
                        {
                            text: _t.textCancel
                        },
                        {
                            text: _t.textOk,
                            onClick: () => {
                                if (format == Asc.c_oAscFileType.TXT) {
                                    const isDocReady = this.props.storeAppOptions.isDocReady;
                                    onAdvancedOptions(Asc.c_oAscAdvancedOptionsID.TXT, api.asc_getAdvancedOptions(), 2, new Asc.asc_CDownloadOptions(format), _t, isDocReady);
                                }
                                else {
                                    setTimeout(() => {
                                        api.asc_DownloadAs(new Asc.asc_CDownloadOptions(format));
                                    }, 400);
                                }
                            }
                        }
                    ],
                }).open();
            } 
            else {
                setTimeout(() => {
                    api.asc_DownloadAs(new Asc.asc_CDownloadOptions(format));
                }, 400);
            }
        }
    }

    render() {
        return (
            <Download onSaveFormat={this.onSaveFormat} />
        );
    }
}

const DownloadWithTranslation = inject("storeAppOptions")(observer(withTranslation()(DownloadController)));

const onAdvancedOptions = (type, advOptions, mode, formatOptions, _t, isDocReady, canRequestClose, isDRM) => {
    if ($$('.dlg-adv-options.modal-in').length > 0) return;

    const api = Common.EditorApi.get();
    if (type == Asc.c_oAscAdvancedOptionsID.TXT) {
        let picker;
        const pages = [];
        const pagesName = [];
        for (let page of advOptions.asc_getCodePages()) {
            pages.push(page.asc_getCodePage());
            pagesName.push(page.asc_getCodePageName());
        }
        Common.Notifications.trigger('preloader:close');
        Common.Notifications.trigger('preloader:endAction', Asc.c_oAscAsyncActionType['BlockInteraction'], -256, true);
        const buttons = [];
        if (mode === 2) {
            buttons.push({
                text: _t.textCancel
            });
        }
        buttons.push({
            text: 'OK',
            bold: true,
            onClick: function() {
                const encoding = picker.value;
                if (mode==2) {
                    formatOptions && formatOptions.asc_setAdvancedOptions(new Asc.asc_CTextOptions(encoding));
                    api.asc_DownloadAs(formatOptions);
                } else {
                    api.asc_setAdvancedOptions(type, new Asc.asc_CTextOptions(encoding));
                }
                if (!isDocReady) {
                    Common.Notifications.trigger('preloader:beginAction', Asc.c_oAscAsyncActionType['BlockInteraction'], -256);
                }
            }
        });
        const dialog = f7.dialog.create({
            title: _t.advTxtOptions,
            text: '',
            content:
                '<div class="content-block">' +
                '<div class="row">' +
                '<div class="col-100">' + _t.textEncoding + '</div>' +
                '</div>' +
                '<div id="txt-encoding"></div>' +
                '</div>',
            buttons: buttons,
            cssClass: 'dlg-adv-options'
        }).open();
        dialog.on('opened', () => {
            picker = f7.picker.create({
                containerEl: document.getElementById('txt-encoding'),
                cols: [
                    {
                        values: pages,
                        displayValues: pagesName
                    }
                ],
                toolbar: false,
                rotateEffect: true,
                value: [advOptions.asc_getRecommendedSettings().asc_getCodePage()],
            });
        });
    } else if (type == Asc.c_oAscAdvancedOptionsID.DRM) {
        Common.Notifications.trigger('preloader:close');
        Common.Notifications.trigger('preloader:endAction', Asc.c_oAscAsyncActionType['BlockInteraction'], -256, true);
        const buttons = [{
            text: 'OK',
            bold: true,
            onClick: function () {
                const password = document.getElementById('modal-password').value;
                api.asc_setAdvancedOptions(type, new Asc.asc_CDRMAdvancedOptions(password));
                if (!isDocReady) {
                    Common.Notifications.trigger('preloader:beginAction', Asc.c_oAscAsyncActionType['BlockInteraction'], -256);
                }
            }
        }];

        if(isDRM) {
            f7.dialog.create({
                text: _t.txtIncorrectPwd,
                buttons : [{
                    text: 'OK',
                    bold: true,
                }]
            }).open();
        }

        if (canRequestClose)
            buttons.push({
                text: _t.closeButtonText,
                onClick: function () {
                    Common.Gateway.requestClose();
                }
            });
        f7.dialog.create({
            title: _t.advDRMOptions,
            text: _t.textOpenFile,
            content: Device.ios ?
            '<div class="input-field"><input type="password" class="modal-text-input" name="modal-password" placeholder="' + _t.advDRMPassword + '" id="modal-password"></div>' : '<div class="input-field"><div class="inputs-list list inline-labels"><ul><li><div class="item-content item-input"><div class="item-inner"><div class="item-input-wrap"><input type="password" name="modal-password" id="modal-password" placeholder=' + _t.advDRMPassword + '></div></div></div></li></ul></div></div>',
            buttons: buttons,
            cssClass: 'dlg-adv-options'
        }).open();
    }
};


export {
    DownloadWithTranslation as DownloadController,
    onAdvancedOptions
};