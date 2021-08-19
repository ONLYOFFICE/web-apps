import React, { useEffect } from 'react';
import { inject } from 'mobx-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';

const ErrorController = inject('storeAppOptions')(({storeAppOptions, LoadingDocument}) => {
    const {t} = useTranslation();
    const _t = t("Error", { returnObjects: true });

    useEffect(() => {
        Common.Notifications.on('engineCreated', (api) => {
            api.asc_registerCallback('asc_onError', onError);
        });
        return () => {
            const api = Common.EditorApi.get();
            api.asc_unregisterCallback('asc_onError', onError);
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

        switch (id)
        {
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

            case Asc.c_oAscError.ID.PastInMergeAreaError:
                config.msg = _t.pastInMergeAreaError;
                break;

            case Asc.c_oAscError.ID.FrmlWrongCountParentheses:
                config.msg = _t.errorWrongBracketsCount;
                config.closable = true;
                break;

            case Asc.c_oAscError.ID.FrmlWrongOperator:
                config.msg = _t.errorWrongOperator;
                config.closable = true;
                break;

            case Asc.c_oAscError.ID.FrmlWrongMaxArgument:
                config.msg = _t.errorCountArgExceed;
                config.closable = true;
                break;

            case Asc.c_oAscError.ID.FrmlWrongCountArgument:
                config.msg = _t.errorCountArg;
                config.closable = true;
                break;

            case Asc.c_oAscError.ID.FrmlWrongFunctionName:
                config.msg = _t.errorFormulaName;
                config.closable = true;
                break;

            case Asc.c_oAscError.ID.FrmlAnotherParsingError:
                config.msg = _t.errorFormulaParsing;
                config.closable = true;
                break;

            case Asc.c_oAscError.ID.FrmlWrongArgumentRange:
                config.msg = _t.errorArgsRange;
                config.closable = true;
                break;

            case Asc.c_oAscError.ID.UnexpectedGuid:
                config.msg = _t.errorUnexpectedGuid;
                break;

            case Asc.c_oAscError.ID.FileRequest:
                config.msg = _t.errorFileRequest;
                break;

            case Asc.c_oAscError.ID.FileVKey:
                config.msg = _t.errorFileVKey;
                break;

            case Asc.c_oAscError.ID.MaxDataPointsError:
                config.msg = _t.errorMaxPoints;
                break;

            case Asc.c_oAscError.ID.FrmlOperandExpected:
                config.msg = _t.errorOperandExpected;
                config.closable = true;
                break;

            case Asc.c_oAscError.ID.CannotMoveRange:
                config.msg = _t.errorMoveRange;
                break;

            case Asc.c_oAscError.ID.AutoFilterDataRangeError:
                config.msg = _t.errorAutoFilterDataRange;
                break;

            case Asc.c_oAscError.ID.AutoFilterChangeFormatTableError:
                config.msg = _t.errorAutoFilterChangeFormatTable;
                break;

            case Asc.c_oAscError.ID.AutoFilterChangeError:
                config.msg = _t.errorAutoFilterChange;
                break;

            case Asc.c_oAscError.ID.AutoFilterMoveToHiddenRangeError:
                config.msg = _t.errorAutoFilterHiddenRange;
                break;

            case Asc.c_oAscError.ID.CannotFillRange:
                config.msg = _t.errorFillRange;
                break;

            case Asc.c_oAscError.ID.InvalidReferenceOrName:
                config.msg = _t.errorInvalidRef;
                break;

            case Asc.c_oAscError.ID.LockCreateDefName:
                config.msg = _t.errorCreateDefName;
                break;

            case Asc.c_oAscError.ID.PasteMaxRangeError:
                config.msg = _t.errorPasteMaxRange;
                break;
            
            case Asc.c_oAscError.ID.LockedCellPivot:
                config.msg = _t.errorLockedCellPivot;
                break;

            case Asc.c_oAscError.ID.LockedAllError:
                config.msg = _t.errorLockedAll;
                break;

            case Asc.c_oAscError.ID.LockedWorksheetRename:
                config.msg = _t.errorLockedWorksheetRename;
                break;

            case Asc.c_oAscError.ID.OpenWarning:
                config.msg = _t.errorOpenWarning;
                break;

            case Asc.c_oAscError.ID.FrmlWrongReferences:
                config.msg = _t.errorFrmlWrongReferences;
                config.closable = true;
                break;

            case Asc.c_oAscError.ID.CopyMultiselectAreaError:
                config.msg = _t.errorCopyMultiselectArea;
                break;

            case Asc.c_oAscError.ID.PrintMaxPagesCount:
                config.msg = _t.errorPrintMaxPagesCount;
                break;

            case Asc.c_oAscError.ID.CannotChangeFormulaArray:
                config.msg = _t.errorChangeArray;
                break;

            case Asc.c_oAscError.ID.MultiCellsInTablesFormulaArray:
                config.msg = _t.errorMultiCellFormula;
                break;

            case Asc.c_oAscError.ID.FrmlMaxTextLength:
                config.msg = _t.errorFrmlMaxTextLength;
                break;

            case  Asc.c_oAscError.ID.FrmlMaxLength:
                config.msg = _t.errorFrmlMaxLength;
                break;

            case Asc.c_oAscError.ID.FrmlMaxReference:
                config.msg = _t.errorFrmlMaxReference;
                break;

            case Asc.c_oAscError.ID.DataValidate:
                errData && errData.asc_getErrorTitle() && (config.title = Common.Utils.String.htmlEncode(errData.asc_getErrorTitle()));
                config.msg = errData && errData.asc_getError() ? Common.Utils.String.htmlEncode(errData.asc_getError()) : _t.errorDataValidate;
                break;

            case Asc.c_oAscError.ID.VKeyEncrypt:
                config.msg = _t.errorKeyEncrypt;
                break;

            case Asc.c_oAscError.ID.KeyExpire:
                config.msg = _t.errorKeyExpire;
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

            case Asc.c_oAscError.ID.EditingError:
                config.msg = _t.errorEditingDownloadas;
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

            default:
                config.msg = _t.errorDefaultMessage.replace('%1', id);
                break;
        }

        if (level === Asc.c_oAscError.Level.Critical) {

            // report only critical errors
            Common.Gateway.reportError(id, config.msg);

            config.title = _t.criticalErrorTitle;

            if (storeAppOptions.canBackToFolder && !storeAppOptions.isDesktopApp) {
                config.msg += '</br></br>' + _t.criticalErrorExtText;
                config.callback = function() {
                    Common.Notifications.trigger('goback', true);
                }
            }
            if (id === Asc.c_oAscError.ID.DataEncrypted) {
                api.asc_coAuthoringDisconnect();
                Common.Notifications.trigger('api:disconnect');
            }
        }
        else {
            Common.Gateway.reportWarning(id, config.msg);

            config.title    = config.title || _t.notcriticalErrorTitle;
            config.callback = (btn) => {
                if (id == Asc.c_oAscError.ID.DataValidate) {
                    api.asc_closeCellEditor(true);
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
                    text: 'OK',
                    onClick: config.callback
                }
            ]
        }).open();

        Common.component.Analytics.trackEvent('Internal Error', id.toString());
    };

    return null
});

export default ErrorController;