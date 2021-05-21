import React, { Component } from "react";
import Download from "../../view/settings/Download";
import { Device } from '../../../../../common/mobile/utils/device';
import { withTranslation, useTranslation } from 'react-i18next';
import { f7 } from 'framework7-react';

class DownloadController extends Component {
    constructor(props) {
        super(props);
        this.onSaveFormat = this.onSaveFormat.bind(this);
    }

    onSaveFormat(format) {
        const api = Common.EditorApi.get();
        const { t } = this.props;
        const _t = t("View.Settings", {returnObjects: true});

        if (format) {
            if (format == Asc.c_oAscFileType.CSV) {
                f7.dialog.confirm(
                    _t.warnDownloadAs,
                    _t.notcriticalErrorTitle,
                    function () {
                        onAdvancedOptions(Asc.c_oAscAdvancedOptionsID.CSV, api.asc_getAdvancedOptions(), 2, new Asc.asc_CDownloadOptions(format), _t)
                    }
                )
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

const DownloadWithTranslation = withTranslation()(DownloadController);

const onAdvancedOptions = (type, advOptions, mode, formatOptions, _t, canRequestClose) => {
    const api = Common.EditorApi.get();

    if (type == Asc.c_oAscAdvancedOptionsID.CSV) {
        let picker;
        const pages = [];
        const pagesName = [];

        for (let page of advOptions.asc_getCodePages()) {
            pages.push(page.asc_getCodePage());
            pagesName.push(page.asc_getCodePageName());
        }

        // me.onLongActionEnd(Asc.c_oAscAsyncActionType.BlockInteraction, LoadingDocument);

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
                let encoding = picker.cols[0].value,
                    delimiter = picker.cols[1].value;

                if (mode == 2) {
                    formatOptions && formatOptions.asc_setAdvancedOptions(new Asc.asc_CTextOptions(encoding, delimiter));
                    api.asc_DownloadAs(formatOptions);
                } else {
                    api.asc_setAdvancedOptions(type, new Asc.asc_CTextOptions(encoding, delimiter));
                }

                //if (!me._isDocReady) {
                        //me.onLongActionBegin(Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument);
                //}
            }
        });

        const dialog = f7.dialog.create({
            title: _t.advCSVOptions,
            text: '',
            content:
            '<div class="content-block small-picker" style="padding: 0; margin: 20px 0 0;">' +
                '<div class="row">' +
                    '<div class="col-50" style="text-align: left;">' + _t.txtEncoding + '</div>' +
                    '<div class="col-50" style="text-align: right;">' + _t.txtDelimiter + '</div>' +
                '</div>' +
                '<div id="txt-encoding" class="small"></div>' +
            '</div>',
            buttons: buttons
        }).open();

        const recommendedSettings = advOptions.asc_getRecommendedSettings();

        dialog.on('opened', () => {
            picker = f7.picker.create({
                containerEl: document.getElementById('txt-encoding'),
                cols: [{
                    textAlign: 'left',
                    values: pages,
                    displayValues: pagesName
                },{
                    textAlign: 'right',
                    width: 120,
                    values: [4, 2, 3, 1, 5],
                    displayValues: [',', ';', ':', _t.txtTab, _t.txtSpace]
                }],
                toolbar: false,
                rotateEffect: true,
                value: [
                    recommendedSettings && recommendedSettings.asc_getCodePage(),
                    (recommendedSettings && recommendedSettings.asc_getDelimiter()) ? recommendedSettings.asc_getDelimiter() : 4
                ],
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
    DownloadWithTranslation,
    onAdvancedOptions
}