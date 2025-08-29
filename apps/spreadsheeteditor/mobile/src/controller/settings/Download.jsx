import React, { Component } from "react";
import Download from "../../view/settings/Download";
import { Device } from '../../../../../common/mobile/utils/device';
import { withTranslation, useTranslation } from 'react-i18next';
import { f7 } from 'framework7-react';
import { observer, inject } from "mobx-react";

class DownloadController extends Component {
    constructor(props) {
        super(props);
        this.onSaveFormat = this.onSaveFormat.bind(this);
    }

    closeModal() {
        if (Device.phone) {
            f7.sheet.close('.settings-popup', false);
        } else {
            f7.popover.close('#settings-popover');
        }
    }

    onSaveFormat(format) {
        const api = Common.EditorApi.get();
        const { t } = this.props;
        const _t = t("View.Settings", {returnObjects: true});

        if (format) {
            this.closeModal();
            if (format == Asc.c_oAscFileType.CSV) {
                f7.dialog.create({
                    title: _t.notcriticalErrorTitle,
                    text: _t.warnDownloadCsv,
                    buttons: [
                        {
                            text: _t.textCancel
                        },
                        {
                            text: _t.textOk,
                            onClick: () => {
                                const advOptions = api.asc_getAdvancedOptions();
                                Common.Notifications.trigger('openEncoding', Asc.c_oAscAdvancedOptionsID.CSV, advOptions, 2, new Asc.asc_CDownloadOptions(format))
                                // onAdvancedOptions(Asc.c_oAscAdvancedOptionsID.CSV, api.asc_getAdvancedOptions(), 2, new Asc.asc_CDownloadOptions(format), _t, true);
                            }
                        }
                    ]
                }).open();
            } else {
                api.asc_DownloadAs(new Asc.asc_CDownloadOptions(format));
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

const onAdvancedOptions = (type, _t, isDocReady, canRequestClose, isDRM) => {
    const api = Common.EditorApi.get();

    Common.Notifications.trigger('preloader:close');
    Common.Notifications.trigger('preloader:endAction', Asc.c_oAscAsyncActionType['BlockInteraction'], -256, true);
    const buttons = [{
        text: _t.textOk,
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
                text: _t.textOk,
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
        buttons: buttons
    }).open();
    
};

export {
    DownloadWithTranslation,
    onAdvancedOptions
}