import React, { Component } from 'react';
import { inject } from 'mobx-react';
import { f7 } from 'framework7-react';
import { withTranslation } from 'react-i18next';
import IrregularStack from "../../../../common/mobile/utils/IrregularStack";

class LongActions extends Component {
    constructor(props) {
        super(props);

        this.stackLongActions = new IrregularStack({
            strongCompare   : function(obj1, obj2){return obj1.id === obj2.id && obj1.type === obj2.type;},
            weakCompare     : function(obj1, obj2){return obj1.type === obj2.type;}
        });

        this.onLongActionBegin = this.onLongActionBegin.bind(this);
        this.onLongActionEnd = this.onLongActionEnd.bind(this);
        this.onOpenDocument = this.onOpenDocument.bind(this);
        this.closePreloader = this.closePreloader.bind(this);
    }

    closePreloader() {
        if (this.loadMask && this.loadMask.el) {
            f7.dialog.close(this.loadMask.el);
        }
    }

    componentDidMount() {
        Common.Notifications.on('engineCreated', (api) => {
            api.asc_registerCallback('asc_onStartAction', this.onLongActionBegin);
            api.asc_registerCallback('asc_onEndAction', this.onLongActionEnd);
            api.asc_registerCallback('asc_onOpenDocumentProgress', this.onOpenDocument);
        });
        Common.Notifications.on('preloader:endAction', this.onLongActionEnd);
        Common.Notifications.on('preloader:beginAction', this.onLongActionBegin);
        Common.Notifications.on('preloader:close', this.closePreloader);
    }

    componentWillUnmount() {
        const api = Common.EditorApi.get();
        api.asc_unregisterCallback('asc_onStartAction', this.onLongActionBegin);
        api.asc_unregisterCallback('asc_onEndAction', this.onLongActionEnd);
        api.asc_unregisterCallback('asc_onOpenDocumentProgress', this.onOpenDocument);

        Common.Notifications.off('preloader:endAction', this.onLongActionEnd);
        Common.Notifications.off('preloader:beginAction', this.onLongActionBegin);
        Common.Notifications.off('preloader:close', this.closePreloader);
    }

    onLongActionBegin (type, id) {
        const action = {id: id, type: type};
        this.stackLongActions.push(action);
        this.setLongActionView(action);
    }

    onLongActionEnd (type, id) {
        let action = {id: id, type: type};
        this.stackLongActions.pop(action);

        //this.updateWindowTitle(true);

        action = this.stackLongActions.get({type: Asc.c_oAscAsyncActionType.Information});

        if (action) {
            this.setLongActionView(action)
        }

        action = this.stackLongActions.get({type: Asc.c_oAscAsyncActionType.BlockInteraction});

        if (action) {
            this.setLongActionView(action)
        } else {
            this.loadMask && this.loadMask.el && this.loadMask.el.classList.contains('modal-in') && f7.dialog.close(this.loadMask.el);
        }
    }

    setLongActionView (action) {
        const { t } = this.props;
        const _t = t("LongActions", { returnObjects: true });
        let title = '';
        let text = '';
        switch (action.id) {
            case Asc.c_oAscAsyncAction['Open']:
                title   = _t.openTitleText;
                text    = _t.openTextText;
                break;

            case Asc.c_oAscAsyncAction['Save']:
                title   = _t.saveTitleText;
                text    = _t.saveTextText;
                break;

            case Asc.c_oAscAsyncAction['LoadDocumentFonts']:
                title   = _t.loadFontsTitleText;
                text    = _t.loadFontsTextText;
                break;

            case Asc.c_oAscAsyncAction['LoadDocumentImages']:
                title   = _t.loadImagesTitleText;
                text    = _t.loadImagesTextText;
                break;

            case Asc.c_oAscAsyncAction['LoadFont']:
                title   = _t.loadFontTitleText;
                text    = _t.loadFontTextText;
                break;

            case Asc.c_oAscAsyncAction['LoadImage']:
                title   = _t.loadImageTitleText;
                text    = _t.loadImageTextText;
                break;

            case Asc.c_oAscAsyncAction['DownloadAs']:
                title   = _t.downloadTitleText;
                text    = _t.downloadTextText;
                break;

            case Asc.c_oAscAsyncAction['Print']:
                title   = _t.printTitleText;
                text    = _t.printTextText;
                break;

            case Asc.c_oAscAsyncAction['UploadImage']:
                title   = _t.uploadImageTitleText;
                text    = _t.uploadImageTextText;
                break;

            case Asc.c_oAscAsyncAction['ApplyChanges']:
                title   = _t.applyChangesTitleText;
                text    = _t.applyChangesTextText;
                break;

            case Asc.c_oAscAsyncAction['PrepareToSave']:
                title   = _t.savePreparingText;
                text    = _t.savePreparingTitle;
                break;

            case Asc.c_oAscAsyncAction['MailMergeLoadFile']:
                title   = _t.mailMergeLoadFileText;
                text    = _t.mailMergeLoadFileTitle;
                break;

            case Asc.c_oAscAsyncAction['DownloadMerge']:
                title   = _t.downloadMergeTitle;
                text    = _t.downloadMergeText;
                break;

            case Asc.c_oAscAsyncAction['SendMailMerge']:
                title   = _t.sendMergeTitle;
                text    = _t.sendMergeText;
                break;

            case Asc.c_oAscAsyncAction['Waiting']:
                title   = _t.waitText;
                text    = _t.waitText;
                break;

            case ApplyEditRights:
                title   = _t.txtEditingMode;
                text    = _t.txtEditingMode;
                break;

            case LoadingDocument:
                title   = _t.loadingDocumentTitleText;
                text    = _t.loadingDocumentTextText;
                break;
            default:
                if (typeof action.id == 'string'){
                    title   = action.id;
                    text    = action.id;
                }
                break;
        }

        if (action.type === Asc.c_oAscAsyncActionType['BlockInteraction']) {
            if (action.id === Asc.c_oAscAsyncAction['ApplyChanges']) {
                return;
            }

            if (this.loadMask && this.loadMask.el && this.loadMask.el.classList.contains('modal-in')) {
                this.loadMask.el.getElementsByClassName('dialog-title')[0].innerHTML = title;
            } else {
                this.loadMask = f7.dialog.preloader(title);
            }
        }

    }

    onOpenDocument (progress) {
        if (this.loadMask && this.loadMask.el) {
            const $title = this.loadMask.el.getElementsByClassName('dialog-title')[0];
            const proc = (progress.asc_getCurrentFont() + progress.asc_getCurrentImage())/(progress.asc_getFontsCount() + progress.asc_getImagesCount());

            const { t } = this.props;
            const _t = t("LongActions", { returnObjects: true });
            $title.innerHTML = `${_t.textLoadingDocument}: ${Math.min(Math.round(proc * 100), 100)}%`;
        }
    }

    render() {
        return null;
    }
}

const LongActionsController = withTranslation()(LongActions);

export default LongActionsController;