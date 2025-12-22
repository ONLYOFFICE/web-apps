import React, { Component } from "react";
import SaveACopy from "../../view/settings/SaveACopy";
import { Device } from '../../../../../common/mobile/utils/device';
import { f7 } from 'framework7-react';
import { withTranslation } from 'react-i18next';
import { observer, inject } from "mobx-react";

class SaveACopyController extends Component {
    constructor(props) {
        super(props);
        this.onSaveFormat = this.onSaveFormat.bind(this);
        this.appOptions = this.props.storeAppOptions;
        this._state = {
            isFromGatewayRequestSaveAs: false,
            fileExt: undefined
        }
    }

    componentDidMount() {
        const api = Common.EditorApi.get();
        api.asc_registerCallback('asc_onDownloadUrl', this.onDownloadUrl.bind(this));
    }

    closeModal() {
        if (Device.phone) {
            f7.sheet.close('.settings-popup', false);
        } else {
            f7.popover.close('#settings-popover');
        }
    }

    onDownloadUrl (url, fileType) {
        if (this._state.isFromGatewayRequestSaveAs) {
            let docTitle = this.props.storeDocumentInfo.dataDoc.title;
            !docTitle && (docTitle = this.txtUntitled);

            if (typeof this._state.fileExt == 'string') {
                var idx = docTitle.lastIndexOf('.');
                if (idx>0)
                    docTitle = docTitle.substring(0, idx) + this._state.fileExt;
            }

            Common.Gateway.requestSaveAs(url, docTitle, fileType);
        }

        this._state.isFromGatewayRequestSaveAs = false;
    }

    onSaveFormat(format, ext) {
        const { t } = this.props;
        const _t = t("Settings", { returnObjects: true });
        const api = Common.EditorApi.get();
        const storeDocumentInfo = this.props.storeDocumentInfo;
        const dataDoc = storeDocumentInfo.dataDoc;
        const fileType = dataDoc.fileType;
        const isNeedDownload = !!format;
        const options = new Asc.asc_CDownloadOptions(format, true);
        this._state.fileExt = ext;
        options.asc_setIsSaveAs(isNeedDownload);
       
        if(/^pdf|xps|oxps|djvu$/.test(fileType)) {
            this.closeModal();

            if (format === Asc.c_oAscFileType.DJVU) {
                api.asc_DownloadOrigin(options);
            } else if(format === Asc.c_oAscFileType.PDF || format === Asc.c_oAscFileType.PDFA || format === Asc.c_oAscFileType.JPG || format === Asc.c_oAscFileType.PNG) {
                this._state.isFromGatewayRequestSaveAs = true;
                api.asc_DownloadAs(options);
            } else if (format === Asc.c_oAscFileType.TXT || format === Asc.c_oAscFileType.RTF) {
                options.asc_setTextParams(new AscCommon.asc_CTextParams(Asc.c_oAscTextAssociation.PlainLine));

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
                                if (format === Asc.c_oAscFileType.TXT) {
                                    const advOptions = api.asc_getAdvancedOptions();
                                    Common.Notifications.trigger('openEncoding', Asc.c_oAscAdvancedOptionsID.TXT, advOptions, 2, options);
                                } else {
                                    this._state.isFromGatewayRequestSaveAs = true;
                                    api.asc_DownloadAs(options);
                                }
                            }
                        }
                    ],
                }).open();
            } else {
                f7.dialog.create({
                    title: _t.notcriticalErrorTitle,
                    text: t('Main.warnDownloadAsPdf').replaceAll('{0}', fileType.toUpperCase()), 
                    buttons: [
                        {
                            text: _t.textCancel
                        },
                        {
                            text: _t.textOk,
                            onClick: () => {
                                options.asc_setTextParams(new AscCommon.asc_CTextParams(Asc.c_oAscTextAssociation.PlainLine));
                                this._state.isFromGatewayRequestSaveAs = true;
                                api.asc_DownloadAs(options);
                            }
                        }
                    ],
                }).open();
            }
        } else {
            this._state.isFromGatewayRequestSaveAs = true;
            api.asc_DownloadAs(options);
        }
    }

    render() {
        return (
            <SaveACopy 
                onSaveFormat={this.onSaveFormat} 
                isForm={this.appOptions.isForm}
                canFillForms={this.appOptions.canFillForms}
            />
        );
    }
}

const SaveACopyWithTranslation = inject("storeAppOptions", "storeDocumentInfo")(observer(withTranslation()(SaveACopyController)));

export {
    SaveACopyWithTranslation as SaveACopyController,
};