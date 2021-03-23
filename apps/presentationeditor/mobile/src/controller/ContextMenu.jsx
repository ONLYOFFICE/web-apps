import React, { useContext } from 'react';
import { f7 } from 'framework7-react';
import { inject, observer } from "mobx-react";
import { withTranslation} from 'react-i18next';
import { LocalStorage } from '../../../../common/mobile/utils/LocalStorage';

import ContextMenuController from '../../../../common/mobile/lib/controller/ContextMenu';
import { idContextMenuElement } from '../../../../common/mobile/lib/view/ContextMenu';
import { Device } from '../../../../common/mobile/utils/device';

@inject ( stores => ({
    isEdit: stores.storeAppOptions.isEdit,
    canViewComments: stores.storeAppOptions.canViewComments,
    users: stores.users,
    isDisconnected: stores.users.isDisconnected
}))
class ContextMenu extends ContextMenuController {
    constructor(props) {
        super(props);

        // console.log('context menu controller created');
        this.onApiShowComment = this.onApiShowComment.bind(this);
        this.onApiHideComment = this.onApiHideComment.bind(this);
        this.getUserName = this.getUserName.bind(this);
    }

    static closeContextMenu() {
        f7.popover.close(idContextMenuElement, false);
    }

    getUserName(id) {
        const user = this.props.users.searchUserByCurrentId(id);
        return Common.Utils.UserInfoParser.getParsedName(user.asc_getUserName());
    }

    componentWillUnmount() {
        super.componentWillUnmount();

        const api = Common.EditorApi.get();
        api.asc_unregisterCallback('asc_onShowComment', this.onApiShowComment);
        api.asc_unregisterCallback('asc_onHideComment', this.onApiHideComment);
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

        const api = Common.EditorApi.get();
        switch (action) {
            case 'cut':
                if (!api.Cut() && !LocalStorage.getBool("pe-hide-copy-cut-paste-warning")) {
                    this.showCopyCutPasteModal();
                }
                break;
            case 'copy':
                if (!api.Copy() && !LocalStorage.getBool("pe-hide-copy-cut-paste-warning")) {
                    this.showCopyCutPasteModal();
                }
                break;
            case 'paste':
                if (!api.Paste() && !LocalStorage.getBool("pe-hide-copy-cut-paste-warning")) {
                    this.showCopyCutPasteModal();
                }
                break;
            case 'addcomment':
                Common.Notifications.trigger('addcomment');
                break;
            case 'viewcomment':
                Common.Notifications.trigger('viewcomment');
                break;
            case 'delete':
                api.asc_Remove();
                break;
            case 'edit':
                setTimeout(() => {
                    this.props.openOptions('edit');
                }, 0);
                break;
            case 'addlink':
                setTimeout(() => {
                    this.props.openOptions('add', 'link');
                }, 400)
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

        console.log("click context menu item: " + action);
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

    openLink(url) {
        const api = Common.EditorApi.get();
        if (api.asc_getUrlType(url) > 0) {
            const newDocumentPage = window.open(url, '_blank');
            if (newDocumentPage) {
                newDocumentPage.focus();
            }
        } else {
            api.asc_GoToInternalHyperlink(url);
        }
    }

    onDocumentReady() {
        super.onDocumentReady();

        const api = Common.EditorApi.get();
        api.asc_registerCallback('asc_onShowComment', this.onApiShowComment);
        api.asc_registerCallback('asc_onHideComment', this.onApiHideComment);
    }

    initMenuItems() {
        if ( !Common.EditorApi ) return [];

        const { t } = this.props;
        const _t = t("ContextMenu", { returnObjects: true });

        const { isEdit, canViewComments, canReview, isDisconnected } = this.props;

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
            isObject = false;

        stack.forEach(item => {
            const objectType = item.get_ObjectType(),
                objectValue = item.get_ObjectValue();

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
        if (canViewComments && this.isComments && !isEdit) {
            itemsText.push({
                caption: _t.menuViewComment,
                event: 'viewcomment'
            });
        }

        if ( stack.length > 0 ) {
            let topObject = stack[stack.length - 1],
                topObjectType = topObject.get_ObjectType(),
                topObjectValue = topObject.get_ObjectValue(),
                objectLocked = typeof topObjectValue.get_Locked === 'function' ? topObjectValue.get_Locked() : false;

            !objectLocked && (objectLocked = typeof topObjectValue.get_LockDelete === 'function' ? topObjectValue.get_LockDelete() : false);

            const swapItems = function(items, indexBefore, indexAfter) {
                items[indexAfter] = items.splice(indexBefore, 1, items[indexAfter])[0];
            };

            if (!objectLocked && isEdit && !isDisconnected) {
                if (canCopy && isObject) {
                    itemsIcon.push({
                        event: 'cut',
                        icon: 'icon-cut'
                    });

                    // Swap 'Copy' and 'Cut'
                    swapItems(itemsIcon, 0, 1);
                }

                itemsIcon.push({
                    event: 'paste',
                    icon: 'icon-paste'
                });

                if (isObject)
                    itemsText.push({
                        caption: _t.menuDelete,
                        event: 'delete'
                    });

                itemsText.push({
                    caption: _t.menuEdit,
                    event: 'edit'
                });

                if (!isLink && api.can_AddHyperlink() !== false) {
                    itemsText.push({
                        caption: _t.menuAddLink,
                        event: 'addlink'
                    });
                }

                if (this.isComments && canViewComments) {
                    itemsText.push({
                        caption: _t.menuViewComment,
                        event: 'viewcomment'
                    });
                }

                var hideAddComment = (isText && isChart) || api.can_AddQuotedComment() === false || !canViewComments;
                if (!hideAddComment) {
                    itemsText.push({
                        caption: _t.menuAddComment,
                        event: 'addcomment'
                    });
                }
            }
        }

        if (isLink) {
            itemsText.push({
                caption: _t.menuOpenLink,
                event: 'openlink'
            });
        }


        if ( Device.phone && itemsText.length > 2 ) {
            this.extraItems = itemsText.splice(2,itemsText.length, {
                caption: _t.menuMore,
                event: 'showActionSheet'
            });
        }

        return itemsIcon.concat(itemsText);
        // return [{
        //         caption: 'Edit',
        //         event: 'edit'
        //     }, {
        //         caption: 'View',
        //         event: 'view'
        //     }, {
        //         icon: 'icon-paste',
        //         event: 'review'
        //     }];
    }

    initExtraItems () {
        return (this.extraItems && this.extraItems.length > 0 ? this.extraItems : []);
    }
}

const _ContextMenu = withTranslation()(ContextMenu);
_ContextMenu.closeContextMenu = ContextMenu.closeContextMenu;
export { _ContextMenu as default };