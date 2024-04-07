import React, { useContext } from 'react';
import { f7 } from 'framework7-react';
import { inject, observer } from "mobx-react";
import { withTranslation} from 'react-i18next';
import { LocalStorage } from '../../../../common/mobile/utils/LocalStorage.mjs';

import ContextMenuController from '../../../../common/mobile/lib/controller/ContextMenu';
import { idContextMenuElement } from '../../../../common/mobile/lib/view/ContextMenu';
// import { Device } from '../../../../common/mobile/utils/device';
import EditorUIController from '../lib/patch';

@inject(stores => ({
    isEdit: stores.storeAppOptions.isEdit,
    canComments: stores.storeAppOptions.canComments,
    canViewComments: stores.storeAppOptions.canViewComments,
    canCoAuthoring: stores.storeAppOptions.canCoAuthoring,
    users: stores.users,
    isDisconnected: stores.users.isDisconnected,
    objects: stores.storeFocusObjects.settings,
    isVersionHistoryMode: stores.storeVersionHistory.isVersionHistoryMode
}))
class ContextMenu extends ContextMenuController {
    constructor(props) {
        super(props);

        // console.log('context menu controller created');
        this.onApiShowComment = this.onApiShowComment.bind(this);
        this.onApiHideComment = this.onApiHideComment.bind(this);
        this.getUserName = this.getUserName.bind(this);
        this.isUserVisible = this.isUserVisible.bind(this);
        this.checkShapeSelection = this.checkShapeSelection.bind(this);
    }

    static closeContextMenu() {
        f7.popover.close(idContextMenuElement, false);
    }

    getUserName(id) {
        const user = this.props.users.searchUserByCurrentId(id);
        return AscCommon.UserInfoParser.getParsedName(user.asc_getUserName());
    }

    isUserVisible(id) {
        const user = this.props.users.searchUserByCurrentId(id);
        return user ? (user.asc_getIdOriginal()===this.props.users.currentUser.asc_getIdOriginal() || AscCommon.UserInfoParser.isUserVisible(user.asc_getUserName())) : true;
    }

    componentWillUnmount() {
        super.componentWillUnmount();

        const api = Common.EditorApi.get();
        if ( api ) {
            api.asc_unregisterCallback('asc_onShowComment', this.onApiShowComment);
            api.asc_unregisterCallback('asc_onHideComment', this.onApiHideComment);
            api.asc_unregisterCallback('asc_onShowPopMenu', this.checkShapeSelection);
        }
    }


    onApiShowComment(comments) {
        this.isComments = comments && comments.length > 0;
    }

    onApiHideComment() {
        this.isComments = false;
    }

    // onMenuClosed() {
    //     super.onMenuClosed();
    // }

    onMenuItemClick(action) {
        super.onMenuItemClick(action);

        if ( EditorUIController.ContextMenu && EditorUIController.ContextMenu.handleMenuItemClick(this, action) )
            return;

        const api = Common.EditorApi.get();
        switch (action) {
            case 'cut':
                if ( !LocalStorage.getBool("pe-hide-copy-cut-paste-warning")) {
                    this.showCopyCutPasteModal();
                }
                break;
            case 'copy':
                if (!api.Copy() && !LocalStorage.getBool("pe-hide-copy-cut-paste-warning")) {
                    this.showCopyCutPasteModal();
                }
                break;
            case 'paste':
                if ( !LocalStorage.getBool("pe-hide-copy-cut-paste-warning")) {
                    this.showCopyCutPasteModal();
                }
                break;
            case 'viewcomment':
                Common.Notifications.trigger('viewcomment');
                break;
            case 'openlink':
                const stack = Common.EditorApi.get().getSelectedElements();
                let value;
                stack.forEach((item) => {
                    if (item.get_ObjectType() == Asc.c_oAscTypeSelectElement.Hyperlink) {
                        value = item.get_ObjectValue().get_Value();
                    }
                });
                value && this.openLink(value);
                break;
        }
    }

    checkShapeSelection() {
        const objects = this.props.objects;
        const contextMenuElem = document.querySelector('#idx-context-menu-popover');

        if(objects?.indexOf('shape') > -1) {
            contextMenuElem.style.top = `${+(contextMenuElem.style.top.replace(/px$/, '')) - 40}px`;
        }
    }

    showCopyCutPasteModal() {
        const { t } = this.props;
        const _t = t("ContextMenu", { returnObjects: true });
        f7.dialog.create({
            title: _t.textCopyCutPasteActions,
            text: _t.errorCopyCutPaste,
            content: `<div class="checkbox-in-modal">
                      <label class="checkbox">
                        <input type="checkbox" name="checkbox-show" />
                        <i class="icon-checkbox"></i>
                      </label>
                      <span class="right-text">${_t.textDoNotShowAgain}</span>
                      </div>`,
            buttons: [{
                text: 'OK',
                onClick: () => {
                    const dontShow = $$('input[name="checkbox-show"]').prop('checked');
                    if (dontShow) LocalStorage.setItem("pe-hide-copy-cut-paste-warning", 1);
                }
            }]
        }).open();
    }

    showSplitModal() {
        const { t } = this.props;
        const _t = t("ContextMenu", { returnObjects: true });
        let picker;
        const dialog = f7.dialog.create({
            title: _t.menuSplit,
            text: '',
            content: `<div class="content-block">
                        <div class="row">
                            <div class="col-50">${_t.textColumns}</div>
                            <div class="col-50">${_t.textRows}</div>
                        </div>
                        <div id="picker-split-size"></div>
                    </div>`,
            buttons: [
                {
                    text: _t.menuCancel
                },
                {
                    text: 'OK',
                    bold: true,
                    onClick: function () {
                        const size = picker.value;
                        Common.EditorApi.get().SplitCell(parseInt(size[0]), parseInt(size[1]));
                    }
                }
            ],
            on: {
                open: () => {
                    picker = f7.picker.create({
                        containerEl: document.getElementById('picker-split-size'),
                        cols: [
                            {
                                textAlign: 'center',
                                width: '100%',
                                values: [1,2,3,4,5,6,7,8,9,10]
                            },
                            {
                                textAlign: 'center',
                                width: '100%',
                                values: [1,2,3,4,5,6,7,8,9,10]
                            }
                        ],
                        toolbar: false,
                        rotateEffect: true,
                        value: [3, 3]
                    });
                }
            }
        }).open();
    }

    openLink(url) {
        if (url) {
            const api = Common.EditorApi.get();
            if (url.indexOf("ppaction://hlink")>=0) { // internal link
                api.asc_GoToInternalHyperlink(url);
            } else {
                const type = api.asc_getUrlType(url);
                if (type===AscCommon.c_oAscUrlType.Http || type===AscCommon.c_oAscUrlType.Email) {
                    const newDocumentPage = window.open(url, '_blank');
                    if (newDocumentPage) {
                        newDocumentPage.focus();
                    }
                } else {
                    const { t } = this.props;
                    const _t = t("ContextMenu", { returnObjects: true });
                    f7.dialog.create({
                        title: t('View.Settings', {returnObjects: true}).notcriticalErrorTitle,
                        text  : _t.txtWarnUrl,
                        buttons: [{
                            text: t('View.Settings', {returnObjects: true}).textOk,
                            bold: true,
                            onClick: () => {
                                const newDocumentPage = window.open(url, '_blank');
                                if (newDocumentPage) {
                                    newDocumentPage.focus();
                                }
                            }
                        },
                        { text: _t.menuCancel }]
                    }).open();
                }
            }
        }
    }

    onDocumentReady() {
        super.onDocumentReady();

        const api = Common.EditorApi.get();
        api.asc_registerCallback('asc_onShowComment', this.onApiShowComment);
        api.asc_registerCallback('asc_onHideComment', this.onApiHideComment);
        api.asc_registerCallback('asc_onShowPopMenu', this.checkShapeSelection);
    }

    initMenuItems() {
        if ( !Common.EditorApi ) return [];

        const { isEdit, isDisconnected, isVersionHistoryMode } = this.props;

        if (isEdit && EditorUIController.ContextMenu) {
            return EditorUIController.ContextMenu.mapMenuItems(this);
        } else {
            const { t } = this.props;
            const _t = t("ContextMenu", { returnObjects: true });

            const { canViewComments, canCoAuthoring, canComments } = this.props;

            const api = Common.EditorApi.get();
            const stack = api.getSelectedElements();
            const canCopy = api.can_CopyCut();

            let itemsIcon = [],
                itemsText = [];

            let isText = false,
                isTable = false,
                isImage = false,
                isChart = false,
                isShape = false,
                isLink = false,
                isSlide = false,
                isObject,
                locked = false;

            stack.forEach(item => {
                const objectType = item.get_ObjectType(),
                    objectValue = item.get_ObjectValue();
                locked = typeof objectValue.get_Locked === 'function' ? objectValue.get_Locked() : false;

                if (objectType == Asc.c_oAscTypeSelectElement.Paragraph) {
                    isText = true;
                } else if (objectType == Asc.c_oAscTypeSelectElement.Image) {
                    isImage = true;
                } else if (objectType == Asc.c_oAscTypeSelectElement.Chart) {
                    isChart = true;
                } else if (objectType == Asc.c_oAscTypeSelectElement.Shape) {
                    isShape = true;
                } else if (objectType == Asc.c_oAscTypeSelectElement.Table) {
                    isTable = true;
                } else if (objectType == Asc.c_oAscTypeSelectElement.Hyperlink) {
                    isLink = true;
                } else if (objectType == Asc.c_oAscTypeSelectElement.Slide) {
                    isSlide = true;
                }
            });

            isObject = isText || isImage || isChart || isShape || isTable;

            if (canCopy && isObject) {
                itemsIcon.push({
                    event: 'copy',
                    icon: 'icon-copy'
                });
            }
            if(!isDisconnected && !isVersionHistoryMode) {
                if (canViewComments && this.isComments) {
                    itemsText.push({
                        caption: _t.menuViewComment,
                        event: 'viewcomment'
                    });
                }
    
                if (!isChart && api.can_AddQuotedComment() !== false && canCoAuthoring && canComments && !locked) {
                    itemsText.push({
                        caption: _t.menuAddComment,
                        event: 'addcomment'
                    });
                }
            }

            if (isLink) {
                itemsText.push({
                    caption: _t.menuOpenLink,
                    event: 'openlink'
                });
            }

            return itemsIcon.concat(itemsText);
        }
    }

    initExtraItems () {
        return (this.extraItems && this.extraItems.length > 0 ? this.extraItems : []);
    }
}

const _ContextMenu = withTranslation()(ContextMenu);
_ContextMenu.closeContextMenu = ContextMenu.closeContextMenu;
export { _ContextMenu as default };