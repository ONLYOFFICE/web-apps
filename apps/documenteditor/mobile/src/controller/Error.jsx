import React, { useEffect } from 'react';
import { inject } from 'mobx-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';

const ErrorController = inject('storeAppOptions','storeDocumentInfo')(({storeAppOptions, storeDocumentInfo, LoadingDocument}) => {
    const { t } = useTranslation();
    const _t = t("Error", { returnObjects: true });

    useEffect(() => {
        const on_engine_created = k => { k.asc_registerCallback('asc_onError', onError); };

        const api = Common.EditorApi.get();
        if ( !api ) Common.Notifications.on('engineCreated', on_engine_created);
        else on_engine_created(api);

        return () => {
            const api = Common.EditorApi.get();
            if ( api ) api.asc_unregisterCallback('asc_onError', onError);

            Common.Notifications.off('engineCreated', on_engine_created);
        }
    });

    const onError = (id, level, errData) => {
        if (id === Asc.c_oAscError.ID.LoadingScriptError) {
            f7.notification.create({
                title: _t.criticalErrorTitle,
                text: _t.scriptLoadError,
                closeButton: true
            }).open();
            return;
        }

        Common.Notifications.trigger('preloader:close');
        Common.Notifications.trigger('preloader:endAction', Asc.c_oAscAsyncActionType['BlockInteraction'], LoadingDocument,true);

        const api = Common.EditorApi.get();

        const config = {
            closable: false
        };

        switch (id) {
            case Asc.c_oAscError.ID.Unknown:
                config.msg = _t.unknownErrorText;
                break;

            case Asc.c_oAscError.ID.ConvertationTimeout:
                config.msg = _t.convertationTimeoutText;
                break;

            case Asc.c_oAscError.ID.ConvertationOpenError:
                config.msg = _t.openErrorText;
                break;

            case Asc.c_oAscError.ID.ConvertationSaveError:
                config.msg = _t.saveErrorText;
                break;

            case Asc.c_oAscError.ID.DownloadError:
                config.msg = _t.downloadErrorText;
                break;

            case Asc.c_oAscError.ID.UplImageSize:
                config.msg = _t.uploadImageSizeMessage;
                break;

            case Asc.c_oAscError.ID.UplImageExt:
                config.msg = _t.uploadImageExtMessage;
                break;

            case Asc.c_oAscError.ID.UplImageFileCount:
                config.msg = _t.uploadImageFileCountMessage;
                break;

            case Asc.c_oAscError.ID.UplDocumentSize:
                config.msg = t('Error.uploadDocSizeMessage');
                break;

            case Asc.c_oAscError.ID.UplDocumentExt:
                config.msg = t('Error.uploadDocExtMessage');
                break;

            case Asc.c_oAscError.ID.UplDocumentFileCount:
                config.msg = t('Error.uploadDocFileCountMessage');
                break;

            case Asc.c_oAscError.ID.SplitCellMaxRows:
                config.msg = _t.splitMaxRowsErrorText.replace('%1', errData.get_Value());
                break;

            case Asc.c_oAscError.ID.SplitCellMaxCols:
                config.msg = _t.splitMaxColsErrorText.replace('%1', errData.get_Value());
                break;

            case Asc.c_oAscError.ID.SplitCellRowsDivider:
                config.msg = _t.splitDividerErrorText.replace('%1', errData.get_Value());
                break;

            case Asc.c_oAscError.ID.VKeyEncrypt:
                config.msg = _t.errorToken;
                break;

            case Asc.c_oAscError.ID.KeyExpire:
                config.msg = _t.errorTokenExpire;
                break;

            case Asc.c_oAscError.ID.UserCountExceed:
                config.msg = _t.errorUsersExceed;
                break;

            case Asc.c_oAscError.ID.CoAuthoringDisconnect:
                config.msg = _t.errorViewerDisconnect;
                break;

            case Asc.c_oAscError.ID.ConvertationPassword:
                config.msg = _t.errorFilePassProtect;
                break;

            case Asc.c_oAscError.ID.PasswordIsNotCorrect:
                config.msg = t('Error.errorPasswordIsNotCorrect');
                break;

            case Asc.c_oAscError.ID.StockChartError:
                config.msg = _t.errorStockChart;
                break;

            case Asc.c_oAscError.ID.DataRangeError:
                config.msg = _t.errorDataRange;
                break;

            case Asc.c_oAscError.ID.Database:
                config.msg = _t.errorDatabaseConnection;
                break;

            case Asc.c_oAscError.ID.UserDrop:
                const lostEditingRights = storeAppOptions.lostEditingRights;
                if (lostEditingRights) {
                    storeAppOptions.changeEditingRights(false);
                    return;
                }
                storeAppOptions.changeEditingRights(true);
                config.msg = _t.errorUserDrop;
                break;

            case Asc.c_oAscError.ID.MailMergeLoadFile:
                config.msg = _t.errorMailMergeLoadFile;
                break;

            case Asc.c_oAscError.ID.MailMergeSaveFile:
                config.msg = _t.errorMailMergeSaveFile;
                break;

            case Asc.c_oAscError.ID.Warning:
                config.msg = _t.errorConnectToServer;
                break;

            case Asc.c_oAscError.ID.UplImageUrl:
                config.msg = _t.errorBadImageUrl;
                break;

            case Asc.c_oAscError.ID.SessionAbsolute:
                config.msg = _t.errorSessionAbsolute;
                break;

            case Asc.c_oAscError.ID.SessionIdle:
                config.msg = _t.errorSessionIdle;
                break;

            case Asc.c_oAscError.ID.SessionToken:
                config.msg = _t.errorSessionToken;
                break;

            case Asc.c_oAscError.ID.DataEncrypted:
                config.msg = _t.errorDataEncrypted;
                break;

            case Asc.c_oAscError.ID.AccessDeny:
                config.msg = _t.errorAccessDeny;
                break;
            
            case Asc.c_oAscError.ID.ForceSaveButton:
            case Asc.c_oAscError.ID.ForceSaveTimeout:
                config.msg = t('Error.errorForceSave');
                break;

            case Asc.c_oAscError.ID.EditingError:
                config.msg = _t.errorEditingDownloadas;
                break;

            case Asc.c_oAscError.ID.MailToClientMissing:
                config.msg = this.errorEmailClient;
                break;

            case Asc.c_oAscError.ID.ConvertationOpenLimitError:
                config.msg = _t.errorFileSizeExceed;
                break;

            case Asc.c_oAscError.ID.UpdateVersion:
                config.msg = _t.errorUpdateVersionOnDisconnect;
                break;

            case Asc.c_oAscError.ID.LoadingFontError:
                config.msg = _t.errorLoadingFont;
                break;

            case Asc.c_oAscError.ID.ComplexFieldEmptyTOC:
                config.msg = _t.errorEmptyTOC;
                break;

            case Asc.c_oAscError.ID.ComplexFieldNoTOC:
                config.msg = _t.errorNoTOC;
                break;

            case Asc.c_oAscError.ID.TextFormWrongFormat:
                config.msg = _t.errorTextFormWrongFormat;
                break;

            case Asc.c_oAscError.ID.DirectUrl:
                config.msg = _t.errorDirectUrl;
                break;

            case Asc.c_oAscError.ID.CannotCompareInCoEditing:
                config.msg = t('Error.errorCompare');
                break;

            case Asc.c_oAscError.ID.ComboSeriesError:
                config.msg = t('Error.errorComboSeries');
                break;

            case Asc.c_oAscError.ID.Password:
                config.msg = t('Error.errorSetPassword');
                break;

            case Asc.c_oAscError.ID.Submit:
                config.msg = t('Error.errorSubmit');
                break;

            case Asc.c_oAscError.ID.ConvertationOpenFormat:
                let docExt = storeDocumentInfo.dataDoc ? storeDocumentInfo.dataDoc.fileType || '' : '';
                if (errData === 'pdf')
                    config.msg = _t.errorInconsistentExtPdf.replace('%1', docExt);
                else if  (errData === 'docx')
                    config.msg = _t.errorInconsistentExtDocx.replace('%1', docExt);
                else if  (errData === 'xlsx')
                    config.msg = _t.errorInconsistentExtXlsx.replace('%1', docExt);
                else if  (errData === 'pptx')
                    config.msg = _t.errorInconsistentExtPptx.replace('%1', docExt);
                else
                    config.msg = _t.errorInconsistentExt;
                break;

            case Asc.c_oAscError.ID.CannotSaveWatermark:
                config.msg = t('Error.errorSaveWatermark');
                break;

            case Asc.c_oAscError.ID.PDFFormsLocked:
                config.msg = t('Error.errorPDFFormsLocked');
                break;

            case Asc.c_oAscError.ID.EditProtectedRange:
                config.msg = t('Error.errorEditProtectedRange');
                break;

            default:
                config.msg = _t.errorDefaultMessage.replace('%1', id);
                break;
        }

        if (level === Asc.c_oAscError.Level.Critical) {

            // report only critical errors
            Common.Gateway.reportError(id, config.msg);

            config.title = _t.criticalErrorTitle;
            if (storeAppOptions.canRequestClose) {
                config.msg += '<br><br>' + _t.criticalErrorExtTextClose;
                config.callback = function(btn) {
                    Common.Gateway.requestClose();
                };
            } else if (storeAppOptions.canBackToFolder && !storeAppOptions.isDesktopApp && typeof id !== 'string' && storeAppOptions.customization.goback.url && storeAppOptions.customization.goback.blank===false) {
                config.msg += '</br></br>' + _t.criticalErrorExtText;
                config.callback = function(btn) {
                    Common.Notifications.trigger('goback', true);
                };
            }
            if (id === Asc.c_oAscError.ID.DataEncrypted) {
                api.asc_coAuthoringDisconnect();
                Common.Notifications.trigger('api:disconnect');
            }
        }
        else {
            Common.Gateway.reportWarning(id, config.msg);

            config.title    = _t.notcriticalErrorTitle;
        
            config.callback = (btn) => {
                if (id === Asc.c_oAscError.ID.Warning && btn === 'ok' && (storeAppOptions.canDownload || storeAppOptions.canDownloadOrigin)) {
                    api.asc_DownloadOrigin();
                } else if(id === Asc.c_oAscError.ID.SplitCellMaxRows ||
                            id === Asc.c_oAscError.ID.SplitCellMaxCols ||
                            id === Asc.c_oAscError.ID.SplitCellRowsDivider) {
                        Common.Notifications.trigger('showSplitModal',true);
                }
                storeAppOptions.changeEditingRights(false);
            };
        }
        f7.dialog.create({
            cssClass: 'error-dialog',
            title   : config.title,
            text    : config.msg,
            buttons: [
                {
                    text: _t.textOk,
                    onClick: config.callback
                }
            ]
        }).open();

        Common.component.Analytics.trackEvent('Internal Error', id.toString());
    };

    return null
});

export default ErrorController;