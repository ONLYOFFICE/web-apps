import React, { useEffect } from 'react';
import { f7 } from 'framework7-react';
import { inject } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import IrregularStack from "../../../../common/mobile/utils/IrregularStack";
import { Device } from '../../../../common/mobile/utils/device';

const LongActionsController = inject('storeAppOptions')(({storeAppOptions}) => {
    const {t} = useTranslation();
    const _t = t("LongActions", { returnObjects: true });

    const ApplyEditRights = -255;
    const LoadingDocument = -256;

    const stackLongActions = new IrregularStack({
        strongCompare   : function(obj1, obj2){return obj1.id === obj2.id && obj1.type === obj2.type;},
        weakCompare     : function(obj1, obj2){return obj1.type === obj2.type;}
    });

    let loadMask = null;

    const closePreloader = () => {
        if (loadMask && loadMask.el) {
            f7.dialog.close(loadMask.el);
        }
    };

    useEffect( () => {
        const on_engine_created = api => { 
            api.asc_registerCallback('asc_onStartAction', onLongActionBegin);
            api.asc_registerCallback('asc_onEndAction', onLongActionEnd);
            api.asc_registerCallback('asc_onOpenDocumentProgress', onOpenDocument);
            api.asc_registerCallback('asc_onConfirmAction', onConfirmAction);
        };

        const api = Common.EditorApi.get();
        if(!api) Common.Notifications.on('engineCreated', on_engine_created);
        else on_engine_created(api);

        Common.Notifications.on('preloader:endAction', onLongActionEnd);
        Common.Notifications.on('preloader:beginAction', onLongActionBegin);
        Common.Notifications.on('preloader:close', closePreloader);

        return ( () => {
            const api = Common.EditorApi.get();
            if ( api ) {
                api.asc_unregisterCallback('asc_onStartAction', onLongActionBegin);
                api.asc_unregisterCallback('asc_onEndAction', onLongActionEnd);
                api.asc_unregisterCallback('asc_onOpenDocumentProgress', onOpenDocument);
                api.asc_unregisterCallback('asc_onConfirmAction', onConfirmAction);
            }

            Common.Notifications.off('engineCreated', on_engine_created);
            Common.Notifications.off('preloader:endAction', onLongActionEnd);
            Common.Notifications.off('preloader:beginAction', onLongActionBegin);
            Common.Notifications.off('preloader:close', closePreloader);
        })
    });

    const onLongActionBegin = (type, id) => {
        const action = {id: id, type: type};
        stackLongActions.push(action);
        setLongActionView(action);
    };

    const onLongActionEnd = (type, id, forceClose) => {
        if (!stackLongActions.exist({id: id, type: type})) return;

        let action = {id: id, type: type};
        stackLongActions.pop(action);

        //this.updateWindowTitle(true);

        action = stackLongActions.get({type: Asc.c_oAscAsyncActionType.Information}) || stackLongActions.get({type: Asc.c_oAscAsyncActionType.BlockInteraction});

        if (action && !forceClose) {
            setLongActionView(action)
        } else {
            loadMask && loadMask.el && loadMask.el.classList.contains('modal-in') ?
            f7.dialog.close(loadMask.el) :
            f7.dialog.close($$('.dialog-preloader'));
        }
    };

    const setLongActionView = (action) => {
        let title = '';
        // let text = '';
        switch (action.id) {
            case Asc.c_oAscAsyncAction['Open']:
                title   = _t.textLoadingDocument;
                // title   = _t.openTitleText;
                // text    = _t.openTextText;
                break;

            case Asc.c_oAscAsyncAction['Save']:
                title   = _t.saveTitleText;
                // text    = _t.saveTextText;
                break;

            case Asc.c_oAscAsyncAction['LoadDocumentFonts']:
                if ( !storeAppOptions.isDocReady ) return;
                title   = _t.loadFontsTitleText;
                // text    = _t.loadFontsTextText;
                break;

            case Asc.c_oAscAsyncAction['LoadDocumentImages']:
                title   = _t.loadImagesTitleText;
                // text    = _t.loadImagesTextText;
                break;

            case Asc.c_oAscAsyncAction['LoadFont']:
                title   = _t.loadFontTitleText;
                // text    = _t.loadFontTextText;
                break;

            case Asc.c_oAscAsyncAction['LoadImage']:
                title   = _t.loadImageTitleText;
                // text    = _t.loadImageTextText;
                break;

            case Asc.c_oAscAsyncAction['DownloadAs']:
                title   = _t.downloadTitleText;
                // text    = _t.downloadTextText;
                break;

            case Asc.c_oAscAsyncAction['Print']:
                title   = _t.printTitleText;
                // text    = _t.printTextText;
                break;

            case Asc.c_oAscAsyncAction['UploadImage']:
                title   = _t.uploadImageTitleText;
                // text    = _t.uploadImageTextText;
                break;

            case Asc.c_oAscAsyncAction['ApplyChanges']:
                title   = _t.applyChangesTitleText;
                // text    = _t.applyChangesTextText;
                break;

            case Asc.c_oAscAsyncAction['PrepareToSave']:
                title   = _t.savePreparingText;
                // text    = _t.savePreparingTitle;
                break;

            case Asc.c_oAscAsyncAction['MailMergeLoadFile']:
                title   = _t.mailMergeLoadFileText;
                // text    = _t.mailMergeLoadFileTitle;
                break;

            case Asc.c_oAscAsyncAction['DownloadMerge']:
                title   = _t.downloadMergeTitle;
                // text    = _t.downloadMergeText;
                break;

            case Asc.c_oAscAsyncAction['SendMailMerge']:
                title   = _t.sendMergeTitle;
                // text    = _t.sendMergeText;
                break;

            case Asc.c_oAscAsyncAction['Waiting']:
                title   = _t.waitText;
                // text    = _t.waitText;
                break;

            case ApplyEditRights:
                title   = _t.txtEditingMode;
                // text    = _t.txtEditingMode;
                break;

            case LoadingDocument:
                title   = _t.loadingDocumentTitleText;
                // text    = _t.loadingDocumentTextText;
                break;
            default:
                if (typeof action.id == 'string'){
                    title   = action.id;
                    // text    = action.id;
                }
                break;
        }

        if (action.type == Asc.c_oAscAsyncActionType.BlockInteraction) {

            if (loadMask && loadMask.el && loadMask.el.classList.contains('modal-in')) {
                loadMask.el.getElementsByClassName('dialog-title')[0].innerHTML = title;
            } else if ($$('.dialog-preloader').hasClass('modal-in')) {
                $$('.dialog-preloader').find('dialog-title').text(title);
            } else {
                loadMask = f7.dialog.preloader(title);
            }
        }

    };

    const onConfirmAction = (id, apiCallback, data) => {
        const api = Common.EditorApi.get();

        if (id === Asc.c_oAscConfirm.ConfirmReplaceRange || id === Asc.c_oAscConfirm.ConfirmReplaceFormulaInTable) {
            f7.dialog.create({
                title: _t.notcriticalErrorTitle,
                text: id == Asc.c_oAscConfirm.ConfirmReplaceRange ? _t.confirmMoveCellRange : _t.confirmReplaceFormulaInTable,
                buttons: [
                    {text: _t.textYes,
                        onClick: () => {
                            if (apiCallback) apiCallback(true);
                        }},
                    {text: _t.textNo,
                        onClick: () => {
                            if (apiCallback) apiCallback(false);
                        }}
                ],
            }).open();
        } else if (id === Asc.c_oAscConfirm.ConfirmPutMergeRange) {
            f7.dialog.create({
                title: _t.notcriticalErrorTitle,
                text: _t.confirmPutMergeRange,
                buttons: [
                    {text: _t.textOk,
                        onClick: () => {
                            if (apiCallback) apiCallback();
                        }},
                ],
            }).open();
        } else if (id == Asc.c_oAscConfirm.ConfirmChangeProtectRange) {
            f7.dialog.create({
                title: t('LongActions.textUnlockRange'),
                text: t('LongActions.textUnlockRangeWarning'),
                content: Device.ios ?
                    '<div class="input-field"><input type="password" class="modal-text-input" name="modal-password" placeholder="' + _t.advDRMPassword + '" id="modal-password"></div>' : '<div class="input-field"><div class="inputs-list list inline-labels"><ul><li><div class="item-content item-input"><div class="item-inner"><div class="item-input-wrap"><input type="password" name="modal-password" id="modal-password" placeholder=' + _t.advDRMPassword + '></div></div></div></li></ul></div></div>',
                buttons: [
                    {
                        text: t('LongActions.textOk'),
                        onClick: () => {
                            let password = document.getElementById('modal-password').value;
                            if(apiCallback) {
                                api.asc_checkProtectedRangesPassword(password, data, (res) => {
                                    apiCallback(res, false);
                                });
                            }
                        }
                    }, 
                    {
                        text: t('LongActions.textCancel'),
                        onClick: () => apiCallback(false, true)
                    }
                ]
            }).open();
        } else if (id === Asc.c_oAscConfirm.ConfirmMaxChangesSize) {
            f7.dialog.create({
                title: _t.notcriticalErrorTitle,
                text: _t.confirmMaxChangesSize,
                buttons: [
                    {text: _t.textUndo,
                        onClick: () => {
                            if (apiCallback) apiCallback(true);
                        }
                    },
                    {text: _t.textContinue,
                        onClick: () => {
                            if (apiCallback) apiCallback(false);
                        }
                    }
                ],
            }).open();
        }
    };

    const onOpenDocument = (progress) => {
        if (loadMask && loadMask.el) {
            const $title = loadMask.el.getElementsByClassName('dialog-title')[0];
            const proc = (progress.asc_getCurrentFont() + progress.asc_getCurrentImage())/(progress.asc_getFontsCount() + progress.asc_getImagesCount());

            $title.innerHTML = `${_t.textLoadingDocument}: ${Math.min(Math.round(proc * 100), 100)}%`;
        }
    };

    return null;
});

export default LongActionsController;