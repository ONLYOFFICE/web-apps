/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useEffect } from 'react';
import { f7 } from 'framework7-react';
import { inject } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import IrregularStack from "../../../../common/mobile/utils/IrregularStack";

const LongActionsController = inject('storeAppOptions')(({storeAppOptions}) => {
    const {t} = useTranslation();
    const _t = t("LongActions", {returnObjects: true});

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

        return (() => {
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

        Common.Notifications.trigger('update:windowtitle', true);

        action = stackLongActions.get({type: Asc.c_oAscAsyncActionType.Information}) || stackLongActions.get({type: Asc.c_oAscAsyncActionType.BlockInteraction});

        if (action && !forceClose) {
            setLongActionView(action)
        } else {
            loadMask && loadMask.el && loadMask.el.classList.contains('modal-in') ?
            f7.dialog.close(loadMask.el) :
            f7.dialog.close($$('.dialog-preloader'));
        }

        if ((id==Asc.c_oAscAsyncAction['Save'] || id==Asc.c_oAscAsyncAction['ForceSaveButton'])) {
            storeAppOptions.changeSavingDocStatusText(_t.changesSaved);
            storeAppOptions.isSaveBadgeShown && storeAppOptions.changeIsSaveBadgeShown(false);
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
                storeAppOptions.changeSavingDocStatusText(_t.saveTextText);
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

            case Asc.c_oAscAsyncAction['LoadTheme']:
                title   = _t.loadThemeTitleText;
                // text    = _t.loadThemeTextText;
                break;

            case Asc.c_oAscAsyncAction['ApplyChanges']:
                title   = _t.applyChangesTitleText;
                // text    = _t.applyChangesTextText;
                break;

            case Asc.c_oAscAsyncAction['PrepareToSave']:
                title   = _t.savePreparingText;
                // text    = _t.savePreparingTitle;
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

        if (action.type === Asc.c_oAscAsyncActionType['BlockInteraction']) {
            if (action.id === Asc.c_oAscAsyncAction['ApplyChanges'] || action.id === Asc.c_oAscAsyncAction['LoadDocumentFonts']) {
                return;
            }

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

        if (id === Asc.c_oAscConfirm.ConfirmMaxChangesSize) {
            f7.dialog.create({
                title: _t.notcriticalErrorTitle,
                text: _t.confirmMaxChangesSize,
                buttons: [
                    {text: _t.textUndo,
                        onClick: () => {
                            if (apiCallback) apiCallback(true);
                            Common.Gateway.reportWarning(id, 'undo');
                        }
                    },
                    {text: _t.textContinue,
                        onClick: () => {
                            if (apiCallback) apiCallback(false);
                            Common.Gateway.reportWarning(id, 'continue');
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
