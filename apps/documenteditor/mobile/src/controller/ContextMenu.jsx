import React, { useContext } from 'react';
import { f7 } from 'framework7-react';
import { inject, observer } from "mobx-react";
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
    }

    static closeContextMenu() {
        f7.popover.close(idContextMenuElement, false);
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

        switch (action) {
            case 'addcomment':
                Common.Notifications.trigger('addcomment');
                break;
            case 'viewcomment':
                Common.Notifications.trigger('viewcomment');
                break;
        }

        console.log("click context menu item: " + action);
    }

    onDocumentReady() {
        super.onDocumentReady();

        const api = Common.EditorApi.get();
        api.asc_registerCallback('asc_onShowComment', this.onApiShowComment);
        api.asc_registerCallback('asc_onHideComment', this.onApiHideComment);
    }

    initMenuItems() {
        if ( !Common.EditorApi ) return [];

        const { isEdit, canViewComments, canReview } = this.props;

        const api = Common.EditorApi.get();
        const stack = api.getSelectedElements();
        const canCopy = api.can_CopyCut();

        let itemsIcon = [],
            itemsText = [];

        if ( canCopy ) {
            itemsIcon.push({
                caption: /*me.menuCopy*/ 'Copy',
                event: 'copy',
                icon: 'icon-copy'
            });
        }

        if ( canViewComments && this.isComments && !isEdit ) {
            itemsText.push({
                caption: /*me.menuViewComment*/'View Comment',
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
                        // caption: me.menuCut,
                        event: 'cut',
                        icon: 'icon-cut'
                    });

                    // Swap 'Copy' and 'Cut'
                    swapItems(itemsIcon, 0, 1);
                }

                if ( !lockedText && !lockedTable && !lockedImage && !lockedHeader ) {
                    itemsIcon.push({
                        // caption: me.menuPaste,
                        event: 'paste',
                        icon: 'icon-paste'
                    });
                }

                // For test
                if ( this.isComments && canViewComments ) {
                    itemsText.push({
                        caption: /*me.menuViewComment*/'View Comment',
                        event: 'viewcomment'
                    });
                }

                const isObject = isShape || isChart || isImage || isTable;
                const hideAddComment = !canViewComments || api.can_AddQuotedComment() === false || lockedText || lockedTable || lockedImage || lockedHeader || (!isText && isObject);
                if ( !hideAddComment ) {
                    itemsText.push({
                        caption: /*me.menuAddComment*/'Add Comment',
                        event: 'addcomment'
                    });
                }
                // end test

                if ( isTable && api.CheckBeforeMergeCells() && !lockedTable && !lockedHeader) {
                    itemsText.push({
                        caption: /*me.menuMerge*/'Merge',
                        event: 'merge'
                    });
                }

                if ( isTable && api.CheckBeforeSplitCells() && !lockedTable && !lockedHeader ) {
                    itemsText.push({
                        caption: /*me.menuSplit*/'Split',
                        event: 'split'
                    });
                }

                if ( !lockedText && !lockedTable && !lockedImage && !lockedHeader ) {
                    itemsText.push({
                        caption: /*me.menuDelete*/'Delete',
                        event: 'delete'
                    });
                }

                if ( isTable && !lockedTable && !lockedText && !lockedHeader ) {
                    itemsText.push({
                        caption: /*me.menuDeleteTable*/'Delete Table',
                        event: 'deletetable'
                    });
                }

                if ( !lockedText && !lockedTable && !lockedImage && !lockedHeader ){
                    itemsText.push({
                        caption: /*me.menuEdit*/'Edit',
                        event: 'edit'
                    });
                }

                // if ( !_.isEmpty(api.can_AddHyperlink()) && !lockedHeader) {
                //     arrItems.push({
                //         caption: me.menuAddLink,
                //         event: 'addlink'
                //     });
                // }

                if ( canReview ) {
                    if (false /*_inRevisionChange*/) {
                        itemsText.push({
                            caption: /*me.menuReviewChange*/'Review Change',
                            event: 'reviewchange'
                        });
                    } else {
                        itemsText.push({
                            caption: /*me.menuReview*/'Review',
                            event: 'review'
                        });
                    }
                }

                if ( this.isComments && canViewComments ) {
                    itemsText.push({
                        caption: /*me.menuViewComment*/'View Comment',
                        event: 'viewcomment'
                    });
                }

                /*const isObject = isShape || isChart || isImage || isTable;
                const hideAddComment = !canViewComments || api.can_AddQuotedComment() === false || lockedText || lockedTable || lockedImage || lockedHeader || (!isText && isObject);
                if ( !hideAddComment ) {
                    itemsText.push({
                        caption: 'Add Comment',
                        event: 'addcomment'
                    });
                }*/
            }
        }

        if ( isLink ) {
            itemsText.push({
                caption: /*me.menuOpenLink*/'Open Link',
                event: 'openlink'
            });
        }

        if ( Device.phone && itemsText.length > 2 ) {
            // _actionSheets = arrItems.slice(2);
            // arrItems = arrItems.slice(0, 2);
            // arrItems.push({
            //     caption: me.menuMore,
            //     event: 'showActionSheet'
            // });
            this.extraItems = itemsText.splice(2,itemsText.length, {
                caption: /*me.menuMore*/'More',
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
}

export { ContextMenu as default };