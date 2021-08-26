import React, { useContext } from 'react';
import { f7 } from 'framework7-react';
import { inject, observer } from "mobx-react";
import { withTranslation} from 'react-i18next';
import { LocalStorage } from '../../../../common/mobile/utils/LocalStorage';

import ContextMenuController from '../../../../common/mobile/lib/controller/ContextMenu';
import { idContextMenuElement } from '../../../../common/mobile/lib/view/ContextMenu';
import { Device } from '../../../../common/mobile/utils/device';
import EditorUIController from '../lib/patch';

@inject ( stores => ({
    isEdit: stores.storeAppOptions.isEdit,
    canComments: stores.storeAppOptions.canComments,
    canViewComments: stores.storeAppOptions.canViewComments,
    canCoAuthoring: stores.storeAppOptions.canCoAuthoring,
    canReview: stores.storeAppOptions.canReview,
    users: stores.users,
    isDisconnected: stores.users.isDisconnected,
    displayMode: stores.storeReview.displayMode
}))
class ContextMenu extends ContextMenuController {
    constructor(props) {
        super(props);

        // console.log('context menu controller created');
        this.onApiShowComment = this.onApiShowComment.bind(this);
        this.onApiHideComment = this.onApiHideComment.bind(this);
        this.onApiShowChange = this.onApiShowChange.bind(this);
        this.getUserName = this.getUserName.bind(this);
        this.ShowModal = this.ShowModal.bind(this);
    }

    static closeContextMenu() {
        f7.popover.close(idContextMenuElement, false);
    }

    getUserName(id) {
        const user = this.props.users.searchUserByCurrentId(id);
        return AscCommon.UserInfoParser.getParsedName(user.asc_getUserName());
    }

    componentWillUnmount() {
        super.componentWillUnmount();

        const api = Common.EditorApi.get();
        api.asc_unregisterCallback('asc_onShowComment', this.onApiShowComment);
        api.asc_unregisterCallback('asc_onHideComment', this.onApiHideComment);
        api.asc_unregisterCallback('asc_onShowRevisionsChange', this.onApiShowChange);
        Common.Notifications.off('showSplitModal', this.ShowModal);
    }

    ShowModal() {
        this.showSplitModal()
    }
    
    onApiShowComment(comments) {
        this.isComments = comments && comments.length > 0;
    }

    onApiHideComment() {
        this.isComments = false;
    }

    onApiShowChange(sdkchange) {
        this.inRevisionChange = sdkchange && sdkchange.length>0;
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
                if ( !LocalStorage.getBool("de-hide-copy-cut-paste-warning") )
                    this.showCopyCutPasteModal();
                break;
            case 'copy':
                if (!api.Copy() && !LocalStorage.getBool("de-hide-copy-cut-paste-warning") )
                    this.showCopyCutPasteModal();
                break;
            case 'paste':
                if ( !LocalStorage.getBool("de-hide-copy-cut-paste-warning") )
                    this.showCopyCutPasteModal();
                break;
            case 'viewcomment':
                Common.Notifications.trigger('viewcomment');
                break;
            case 'openlink':
                const stack = api.getSelectedElements();
                let value;
                stack.forEach((item) => {
                    if (item.get_ObjectType() == Asc.c_oAscTypeSelectElement.Hyperlink) {
                        value = item.get_ObjectValue().get_Value();
                    }
                });
                value && this.openLink(value);
                break;
            case 'review':
                setTimeout(() => {
                    this.props.openOptions('coauth', 'cm-review');
                }, 400);
                break;
            case 'reviewchange':
                setTimeout(() => {
                    this.props.openOptions('coauth', 'cm-review-change');
                }, 400);
                break;
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
                    if (dontShow) LocalStorage.setItem("de-hide-copy-cut-paste-warning", 1);
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
            ]
        }).open();
        dialog.on('opened', () => {
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
        });
    }

    openLink(url) {
        if (Common.EditorApi.get().asc_getUrlType(url) > 0) {
            const newDocumentPage = window.open(url, '_blank');
            if (newDocumentPage) {
                newDocumentPage.focus();
            }
        }
    }

    onDocumentReady() {
        super.onDocumentReady();

        const api = Common.EditorApi.get();
        api.asc_registerCallback('asc_onShowComment', this.onApiShowComment);
        api.asc_registerCallback('asc_onHideComment', this.onApiHideComment);
        api.asc_registerCallback('asc_onShowRevisionsChange', this.onApiShowChange);
        Common.Notifications.on('showSplitModal', this.ShowModal);
    }

    initMenuItems() {
        if ( !Common.EditorApi ) return [];
        const { isEdit } = this.props;

        if (isEdit && EditorUIController.ContextMenu) {
            return EditorUIController.ContextMenu.mapMenuItems(this);
        } else {
            const { t } = this.props;
            const _t = t("ContextMenu", {returnObjects: true});
            const { canViewComments, canCoAuthoring, canComments } = this.props;

            const api = Common.EditorApi.get();
            const stack = api.getSelectedElements();
            const canCopy = api.can_CopyCut();

            let isText = false,
                isObject = false,
                isLink = false,
                locked = false;

            stack.forEach(item => {
                const objectType = item.get_ObjectType(),
                    objectValue = item.get_ObjectValue();
                if ( objectType == Asc.c_oAscTypeSelectElement.Header ) {
                    locked = objectValue.get_Locked();
                } else
                if ( objectType == Asc.c_oAscTypeSelectElement.Paragraph ) {
                    locked = objectValue.get_Locked();
                    isText = true;
                } else
                if ( objectType == Asc.c_oAscTypeSelectElement.Image || objectType == Asc.c_oAscTypeSelectElement.Table) {
                    locked = objectValue.get_Locked();
                    isObject = true;
                } else if ( objectType == Asc.c_oAscTypeSelectElement.Hyperlink ) {
                    isLink = true;
                }
            });

            let itemsIcon = [],
                itemsText = [];

            if ( canCopy ) {
                itemsIcon.push({
                    event: 'copy',
                    icon: 'icon-copy'
                });
            }

            if ( canViewComments && this.isComments ) {
                itemsText.push({
                    caption: _t.menuViewComment,
                    event: 'viewcomment'
                });
            }

            if (api.can_AddQuotedComment() !== false && canCoAuthoring && canComments && !locked && !(!isText && isObject)) {
                itemsText.push({
                    caption: _t.menuAddComment,
                    event: 'addcomment'
                });
            }

            if ( isLink ) {
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