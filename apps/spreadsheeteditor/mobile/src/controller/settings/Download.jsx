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
                f7.dialog.create({
                    title: _t.notcriticalErrorTitle,
                    text: _t.warnDownloadAs,
                    buttons: [
                        {
                            text: _t.textCancel
                        },
                        {
                            text: _t.textOk,
                            onClick: () => {
                                onAdvancedOptions(Asc.c_oAscAdvancedOptionsID.CSV, api.asc_getAdvancedOptions(), 2, new Asc.asc_CDownloadOptions(format), _t, true);
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

const DownloadWithTranslation = withTranslation()(DownloadController);

const onAdvancedOptions = (type, advOptions, mode, formatOptions, _t, isDocReady, canRequestClose, isDRM) => {
    const api = Common.EditorApi.get();

    if (type == Asc.c_oAscAdvancedOptionsID.CSV) {
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
                let encoding = picker.cols[0].value,
                    delimiter = picker.cols[1].value;

                if (mode == 2) {
                    formatOptions && formatOptions.asc_setAdvancedOptions(new Asc.asc_CTextOptions(encoding, delimiter));
                    api.asc_DownloadAs(formatOptions);
                } else {
                    api.asc_setAdvancedOptions(type, new Asc.asc_CTextOptions(encoding, delimiter));
                }

                if (!isDocReady) {
                    Common.Notifications.trigger('preloader:beginAction', Asc.c_oAscAsyncActionType['BlockInteraction'], -256);
                }
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
            buttons: buttons,
            cssClass: 'dlg-adv-options'
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
            buttons: buttons
        }).open();
    }
};

export {
    DownloadWithTranslation,
    onAdvancedOptions
}