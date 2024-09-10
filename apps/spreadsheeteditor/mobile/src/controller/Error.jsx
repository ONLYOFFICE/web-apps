import React, { useEffect } from 'react';
import { inject } from 'mobx-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';

const ErrorController = inject('storeAppOptions','storeSpreadsheetInfo')(({storeAppOptions, storeSpreadsheetInfo, LoadingDocument}) => {
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
        const api = Common.EditorApi.get();
        
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

            case Asc.c_oAscError.ID.PivotLabledColumns:
                config.msg = t('Error.errorLabledColumnsPivot');
                break;

            case Asc.c_oAscError.ID.PivotOverlap:
                config.msg = t('Error.errorPivotOverlap');
                break;

            case Asc.c_oAscError.ID.ForceSaveButton:
            case Asc.c_oAscError.ID.ForceSaveTimeout:
                config.msg = t('Error.errorForceSave');
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

            case Asc.c_oAscError.ID.MailToClientMissing:
                config.msg = t('Error.errorEmailClient');
                break;

            case Asc.c_oAscError.ID.NoDataToParse:
                config.msg = t('Error.errorNoDataToParse');
                break;

            case Asc.c_oAscError.ID.CannotUngroupError:
                config.msg = t('Error.errorCannotUngroup');
                break;

            case Asc.c_oAscError.ID.FrmlMaxTextLength:
                config.msg = _t.errorFrmlMaxTextLength;
                break;

            case  Asc.c_oAscError.ID.FrmlMaxLength:
                config.msg = _t.errorFrmlMaxLength;
                break;

            case Asc.c_oAscError.ID.MoveSlicerError:
                config.msg = t('Error.errorMoveSlicerError');
                break;

            case Asc.c_oAscError.ID.LockedEditView:
                config.msg = t('Error.errorEditView');
                break;

            case Asc.c_oAscError.ID.ChangeFilteredRangeError:
                config.msg = t('Error.errorChangeFilteredRange');
                break;

            case Asc.c_oAscError.ID.FrmlMaxReference:
                config.msg = _t.errorFrmlMaxReference;
                break;

            case Asc.c_oAscError.ID.DataValidate:
                errData && errData.asc_getErrorTitle() && (config.title = Common.Utils.String.htmlEncode(errData.asc_getErrorTitle()));
                config.buttons  = [t('Error.textOk'), t('Error.textCancel')];
                config.msg = errData && errData.asc_getError() ? Common.Utils.String.htmlEncode(errData.asc_getError()) : _t.errorDataValidate;
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

            case Asc.c_oAscError.ID.StockChartError:
                config.msg = _t.errorStockChart;
                break;

            case Asc.c_oAscError.ID.MaxDataSeriesError:
                config.msg = t('Error.errorMaxRows');
                break;

            case Asc.c_oAscError.ID.ComboSeriesError:
                config.msg = t('Error.errorComboSeries');
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

            case Asc.c_oAscError.ID.FTChangeTableRangeError:
                config.msg = t('Error.errorFTChangeTableRangeError');
                break;

            case Asc.c_oAscError.ID.FTRangeIncludedOtherTables:
                config.msg = t('Error.errorFTRangeIncludedOtherTables');
                break;

            case Asc.c_oAscError.ID.PasteSlicerError:
                config.msg = t('Error.errorPasteSlicerError');
                break;

            case Asc.c_oAscError.ID.RemoveDuplicates:
                config.iconCls = 'info';
                config.title = t('Error.textInformation');
                config.msg = (errData.asc_getDuplicateValues() !== null && errData.asc_getUniqueValues() !== null) ? t('Error.errRemDuplicates').replace("{0}", errData.asc_getDuplicateValues()).replace("{1}", errData.asc_getUniqueValues()) : t('Error.errNoDuplicates');
                break;
            
            case Asc.c_oAscError.ID.ChangeOnProtectedSheet:
                config.msg = t('Error.errorChangeOnProtectedSheet');
                break;

            case Asc.c_oAscError.ID.SingleColumnOrRowError:
                config.msg = t('Error.errorSingleColumnOrRowError');
                break;

            case Asc.c_oAscError.ID.LocationOrDataRangeError:
                config.msg = t('Error.errorLocationOrDataRangeError');
                break;

            case Asc.c_oAscError.ID.LoadingFontError:
                config.msg = _t.errorLoadingFont;
                break;

            case Asc.c_oAscError.ID.FillAllRowsWarning:
                let fill = errData[0],
                    have = errData[1],
                    lang = (storeAppOptions.lang || 'en').replace('_', '-').toLowerCase(),
                    fillWithSeparator;

                try {
                    fillWithSeparator = fill.toLocaleString(lang);
                } catch (e) {
                    lang = 'en';
                    fillWithSeparator = fill.toLocaleString(lang);
                }

                if (storeAppOptions.isDesktopApp && storeAppOptions.isOffline) {
                    config.msg = fill > have ? 
                        t('Error.textFormulaFilledAllRowsWithEmpty').replace('{0}', fillWithSeparator) :
                        t('Error.textFormulaFilledAllRows').replace('{0}', fillWithSeparator);
                    config.buttons = [
                        {caption: this.textFillOtherRows, primary: true, value: 'fillOther'}, {caption: t('Error.textClose')}
                    ];
                } else {
                    config.msg = fill >= have ? 
                        t('Error.textFormulaFilledFirstRowsOtherIsEmpty').replace('{0}', fillWithSeparator) :
                        t('Error.textFormulaFilledFirstRowsOtherHaveData').replace('{0}', fillWithSeparator).replace('{1}', (have - fill).toLocaleString(lang));
                }
                break;

            case Asc.c_oAscError.ID.PasswordIsNotCorrect:
                config.msg = t('Error.textErrorPasswordIsNotCorrect');
                break;
            
            case Asc.c_oAscError.ID.UplDocumentSize:
                config.msg = t('Error.uploadDocSizeMessage');
                break;

            case Asc.c_oAscError.ID.DeleteColumnContainsLockedCell:
                config.msg = t('Error.errorDeleteColumnContainsLockedCell');
                break;

            case Asc.c_oAscError.ID.DeleteRowContainsLockedCell:
                config.msg = t('Error.errorDeleteRowContainsLockedCell');
                break;

            case Asc.c_oAscError.ID.UplDocumentFileCount:
                config.msg = t('Error.uploadDocFileCountMessage');
                break;

            case Asc.c_oAscError.ID.UplDocumentExt:
                config.msg = t('Error.uploadDocExtMessage');
                break;

            case Asc.c_oAscError.ID.Password:
                config.msg = t('Error.errorSetPassword');
                break;

            case Asc.c_oAscError.ID.PivotGroup:
                config.msg = t('Error.errorPivotGroup');
                break;

            case Asc.c_oAscError.ID.PasteMultiSelectError:
                config.msg = t('Error.errorPasteMultiSelect');
                break;

            case Asc.c_oAscError.ID.CannotUseCommandProtectedSheet:
                config.msg = t('Error.errorCannotUseCommandProtectedSheet');
                break;

            case Asc.c_oAscError.ID.PivotWithoutUnderlyingData:
                config.msg = t('Error.errorPivotWithoutUnderlying');
                break;

            case Asc.c_oAscError.ID.DirectUrl:
                config.msg = _t.errorDirectUrl;
                break;

            case Asc.c_oAscError.ID.ConvertationOpenFormat:
                let docExt = storeSpreadsheetInfo.dataDoc ? storeSpreadsheetInfo.dataDoc.fileType || '' : '';
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

            case Asc.c_oAscError.ID.ProtectedRangeByOtherUser:
                config.msg = t('Error.errorProtectedRange');
                break;

            case Asc.c_oAscError.ID.TraceDependentsNoFormulas:
                config.msg = t('Error.errorDependentsNoFormulas');
                break;

            case Asc.c_oAscError.ID.TracePrecedentsNoValidReference:
                config.msg = t('Error.errorPrecedentsNoValidRef');
                break;

            case Asc.c_oAscError.ID.CircularReference:
                config.msg = t('Error.errorCircularReference');
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
            config.buttons  = config.buttons || [t('Error.textOk')];
            config.callback = (_, btn) => {
                if (id == Asc.c_oAscError.ID.DataValidate && btn.target.textContent !== 'OK') {
                    api.asc_closeCellEditor(true);
                }
                storeAppOptions.changeEditingRights(false);
            };
        }

        f7.dialog.create({
            cssClass: 'error-dialog',
            title   : config.title,
            text    : config.msg,
            buttons: config.buttons ? config.buttons.map(button => (
                {
                    text: button,
                    onClick: (_, btn) => config.callback(_, btn)
                }
            )) : [
                {
                    text: t('Error.textOk'),
                    onClick: (dlg, _) => dlg.close()
                }
            ]
        }).open();

        Common.component.Analytics.trackEvent('Internal Error', id.toString());
    };

    return null
});

export default ErrorController;