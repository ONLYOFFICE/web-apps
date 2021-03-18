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
    canReview: stores.storeAppOptions.canReview
}))
class ContextMenu extends ContextMenuController {
    constructor(props) {
        super(props);

        // console.log('context menu controller created');
        this.onApiShowComment = this.onApiShowComment.bind(this);
        this.onApiHideComment = this.onApiHideComment.bind(this);
        this.onApiShowChange = this.onApiShowChange.bind(this);
    }

    static closeContextMenu() {
        f7.popover.close(idContextMenuElement, false);
    }

    componentWillUnmount() {
        super.componentWillUnmount();

        const api = Common.EditorApi.get();
        api.asc_unregisterCallback('asc_onShowComment', this.onApiShowComment);
        api.asc_unregisterCallback('asc_onHideComment', this.onApiHideComment);
        api.asc_unregisterCallback('asc_onShowRevisionsChange', this.onApiShowChange);
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

        const api = Common.EditorApi.get();
        switch (action) {
            case 'cut':
                if (!api.Cut() && !LocalStorage.getBool("de-hide-copy-cut-paste-warning")) {
                    this.showCopyCutPasteModal();
                }
                break;
            case 'copy':
                if (!api.Copy() && !LocalStorage.getBool("de-hide-copy-cut-paste-warning")) {
                    this.showCopyCutPasteModal();
                }
                break;
            case 'paste':
                if (!api.Paste() && !LocalStorage.getBool("de-hide-copy-cut-paste-warning")) {
                    this.showCopyCutPasteModal();
                }
                break;
            case 'addcomment':
                Common.Notifications.trigger('addcomment');
                break;
            case 'viewcomment':
                Common.Notifications.trigger('viewcomment');
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
            case 'merge':
                api.MergeCells();
                break;
            case 'split':
                this.showSplitModal();
                break;
            case 'delete':
                api.asc_Remove();
                break;
            case 'deletetable':
                api.remTable();
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

    showSplitModal() {
        const { t } = this.props;
        const _t = t("ContextMenu", { returnObjects: true });
        let picker;
        const dialog = f7.dialog.create({
            title: _t.menuSplit,
            text: '',
            content:
                '<div class="content-block">' +
                '<div class="row">' +
                '<div class="col-50">' + _t.textColumns + '</div>' +
                '<div class="col-50">' + _t.textRows + '</div>' +
                '</div>' +
                '<div id="picker-split-size"></div>' +
                '</div>',
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
    }

    initMenuItems() {
        if ( !Common.EditorApi ) return [];

        const { t } = this.props;
        const _t = t("ContextMenu", { returnObjects: true });

        const { isEdit, canViewComments, canReview } = this.props;

        const api = Common.EditorApi.get();
        const stack = api.getSelectedElements();
        const canCopy = api.can_CopyCut();

        let itemsIcon = [],
            itemsText = [];

        if ( canCopy ) {
            itemsIcon.push({
                event: 'copy',
                icon: 'icon-copy'
            });
        }

        if ( canViewComments && this.isComments && !isEdit ) {
            itemsText.push({
                caption: _t.menuViewComment,
                event: 'viewcomment'
            });
        }

        let isText = false,
            isTable = false,
            isImage = false,
            isChart = false,
            isShape = false,
            isLink = false,
            lockedText = false,
            lockedTable = false,
            lockedImage = false,
            lockedHeader = false;

        stack.forEach(item => {
            const objectType = item.get_ObjectType(),
                    objectValue = item.get_ObjectValue();

            if ( objectType == Asc.c_oAscTypeSelectElement.Header ) {
                lockedHeader = objectValue.get_Locked();
            } else
            if ( objectType == Asc.c_oAscTypeSelectElement.Paragraph ) {
                lockedText = objectValue.get_Locked();
                isText = true;
            } else
            if ( objectType == Asc.c_oAscTypeSelectElement.Image ) {
                lockedImage = objectValue.get_Locked();
                if ( objectValue && objectValue.get_ChartProperties() ) {
                    isChart = true;
                } else
                if ( objectValue && objectValue.get_ShapeProperties() ) {
                    isShape = true;
                } else {
                    isImage = true;
                }
            } else
            if ( objectType == Asc.c_oAscTypeSelectElement.Table ) {
                lockedTable = objectValue.get_Locked();
                isTable = true;
            } else
            if ( objectType == Asc.c_oAscTypeSelectElement.Hyperlink ) {
                isLink = true;
            }
        });

        if ( stack.length > 0 ) {
            const swapItems = function(items, indexBefore, indexAfter) {
                items[indexAfter] = items.splice(indexBefore, 1, items[indexAfter])[0];
            };

            if ( isEdit && !this.isDisconnected ) {
                if ( !lockedText && !lockedTable && !lockedImage && !lockedHeader && canCopy ) {
                    itemsIcon.push({
                        event: 'cut',
                        icon: 'icon-cut'
                    });

                    // Swap 'Copy' and 'Cut'
                    swapItems(itemsIcon, 0, 1);
                }

                if ( !lockedText && !lockedTable && !lockedImage && !lockedHeader ) {
                    itemsIcon.push({
                        event: 'paste',
                        icon: 'icon-paste'
                    });
                }

                if ( isTable && api.CheckBeforeMergeCells() && !lockedTable && !lockedHeader) {
                    itemsText.push({
                        caption: _t.menuMerge,
                        event: 'merge'
                    });
                }

                if ( isTable && api.CheckBeforeSplitCells() && !lockedTable && !lockedHeader ) {
                    itemsText.push({
                        caption: _t.menuSplit,
                        event: 'split'
                    });
                }

                if ( !lockedText && !lockedTable && !lockedImage && !lockedHeader ) {
                    itemsText.push({
                        caption: _t.menuDelete,
                        event: 'delete'
                    });
                }

                if ( isTable && !lockedTable && !lockedText && !lockedHeader ) {
                    itemsText.push({
                        caption: _t.menuDeleteTable,
                        event: 'deletetable'
                    });
                }

                if ( !lockedText && !lockedTable && !lockedImage && !lockedHeader ){
                    itemsText.push({
                        caption: _t.menuEdit,
                        event: 'edit'
                    });
                }

                if ( !!api.can_AddHyperlink() && !lockedHeader) {
                    itemsText.push({
                        caption: _t.menuAddLink,
                        event: 'addlink'
                    });
                }

                if ( canReview ) {
                    if (this.inRevisionChange) {
                        itemsText.push({
                            caption: _t.menuReviewChange,
                            event: 'reviewchange'
                        });
                    } else {
                        itemsText.push({
                            caption: _t.menuReview,
                            event: 'review'
                        });
                    }
                }

                if ( this.isComments && canViewComments ) {
                    itemsText.push({
                        caption: _t.menuViewComment,
                        event: 'viewcomment'
                    });
                }

                const isObject = isShape || isChart || isImage || isTable;
                const hideAddComment = !canViewComments || api.can_AddQuotedComment() === false || lockedText || lockedTable || lockedImage || lockedHeader || (!isText && isObject);
                if ( !hideAddComment ) {
                    itemsText.push({
                        caption: _t.menuAddComment,
                        event: 'addcomment'
                    });
                }
            }
        }

        if ( isLink ) {
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