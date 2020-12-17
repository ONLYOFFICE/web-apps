import React, { Component } from "react";
import Download from "../../view/settings/Download";
import { Device } from '../../../../../common/mobile/utils/device';
import { f7 } from 'framework7-react';
import { withTranslation, useTranslation } from 'react-i18next';

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
            if (format == Asc.c_oAscFileType.TXT || format == Asc.c_oAscFileType.RTF) {
                f7.dialog.confirm(
                    (format === Asc.c_oAscFileType.TXT) ? _t.textDownloadTxt : _t.textDownloadRtf,
                    _t.notcriticalErrorTitle,
                    function () {
                        if (format == Asc.c_oAscFileType.TXT) {
                            onAdvancedOptions(Asc.c_oAscAdvancedOptionsID.TXT, api.asc_getAdvancedOptions(), 2, new Asc.asc_CDownloadOptions(format), _t);
                        }
                        else {
                            api.asc_DownloadAs(new Asc.asc_CDownloadOptions(format));
                        }
                    }
                );
            } 
            else {
                api.asc_DownloadAs(new Asc.asc_CDownloadOptions(format));
            }

            this.closeModal();
        }
    }

    render() {
        return (
            <Download onSaveFormat={this.onSaveFormat} />
        );
    }
}
const DownloadWithTranslation = withTranslation()(DownloadController);

const onAdvancedOptions = (type, advOptions, mode, formatOptions, _t, canRequestClose) => {
    const api = Common.EditorApi.get();
    if (type == Asc.c_oAscAdvancedOptionsID.TXT) {
        let picker;
        const pages = [];
        const pagesName = [];
        for (let page of advOptions.asc_getCodePages()) {
            pages.push(page.asc_getCodePage());
            pagesName.push(page.asc_getCodePageName());
        }
        //me.onLongActionEnd(Asc.c_oAscAsyncActionType.BlockInteraction, LoadingDocument);
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
                //if (!me._isDocReady) {
                        //me.onLongActionBegin(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
                //}
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
            buttons: buttons
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
        //me.onLongActionEnd(Asc.c_oAscAsyncActionType.BlockInteraction, LoadingDocument);
        const buttons = [{
            text: 'OK',
            bold: true,
            onClick: function () {
                const password = document.getElementById('modal-password').value;
                api.asc_setAdvancedOptions(type, new Asc.asc_CDRMAdvancedOptions(password));
                //if (!me._isDocReady) {
                    //me.onLongActionBegin(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
                //}
            }
        }];
        if (canRequestClose)
            buttons.push({
                text: _t.closeButtonText,
                onClick: function () {
                    Common.Gateway.requestClose();
                }
            });
        f7.dialog.create({
            title: _t.advDRMOptions,
            text: _t.txtProtected,
            content:
                '<div class="input-field"><input type="password" name="modal-password" placeholder="' + _t.advDRMPassword + '" id="modal-password"></div>',
            buttons: buttons
        }).open();
    }
};


export {
    DownloadWithTranslation as DownloadController,
    onAdvancedOptions
};