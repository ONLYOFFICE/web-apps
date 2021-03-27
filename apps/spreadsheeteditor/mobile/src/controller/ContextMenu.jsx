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
        const { t } = this.props;
        const _t = t("ContextMenu", { returnObjects: true });

        super.onMenuItemClick(action);

        const api = Common.EditorApi.get();
        const info = api.asc_getCellInfo();
        switch (action) {
            case 'cut':
                if (!api.asc_Cut() && !LocalStorage.getBool("sse-hide-copy-cut-paste-warning")) {
                    this.showCopyCutPasteModal();
                }
                break;
            case 'copy':
                if (!api.asc_Copy() && !LocalStorage.getBool("sse-hide-copy-cut-paste-warning")) {
                    this.showCopyCutPasteModal();
                }
                break;
            case 'paste':
                if (!api.asc_Paste() && !LocalStorage.getBool("sse-hide-copy-cut-paste-warning")) {
                    this.showCopyCutPasteModal();
                }
                break;
            case 'addcomment':
                Common.Notifications.trigger('addcomment');
                break;
            case 'viewcomment':
                Common.Notifications.trigger('viewcomment');
                break;
            case 'del':
                api.asc_emptyCells(Asc.c_oAscCleanOptions.All);
                break;
            case 'wrap':
                api.asc_setCellTextWrap(true);
                break;
            case 'unwrap':
                api.asc_setCellTextWrap(false);
                break;
            case 'edit':
                setTimeout(() => {
                    this.props.openOptions('edit');
                }, 0);
                break;
            case 'merge':
                if (api.asc_mergeCellsDataLost(Asc.c_oAscMergeOptions.Merge)) {
                    setTimeout(() => {
                        f7.dialog.confirm(_t.warnMergeLostData, _t.notcriticalErrorTitle, () => {
                            api.asc_mergeCells(Asc.c_oAscMergeOptions.Merge);
                        });
                    }, 0);
                } else {
                    api.asc_mergeCells(Asc.c_oAscMergeOptions.Merge);
                }
                break;
            case 'unmerge':
                api.asc_mergeCells(Asc.c_oAscMergeOptions.None);
                break;
            case 'hide':
                api[info.asc_getSelectionType() == Asc.c_oAscSelectionType.RangeRow ? 'asc_hideRows' : 'asc_hideColumns']();
                break;
            case 'show':
                api[info.asc_getSelectionType() == Asc.c_oAscSelectionType.RangeRow ? 'asc_showRows' : 'asc_showColumns']();
                break;
            case 'addlink':
                setTimeout(() => {
                    this.props.openOptions('add', 'link');
                }, 400)
                break;
            case 'openlink':
                const linkinfo = info.asc_getHyperlink();
                if ( linkinfo.asc_getType() == Asc.c_oAscHyperlinkType.RangeLink ) {
                    const nameSheet = linkinfo.asc_getSheet();
                    const curActiveSheet = api.asc_getActiveWorksheetIndex();
                    api.asc_setWorksheetRange(linkinfo);
                    //SSE.getController('Statusbar').onLinkWorksheetRange(nameSheet, curActiveSheet);
                } else {
                    const url = linkinfo.asc_getHyperlinkUrl().replace(/\s/g, "%20");
                    api.asc_getUrlType(url) > 0 && this.openLink(url);
                }
                break;
            case 'freezePanes':
                api.asc_freezePane();
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
        const newDocumentPage = window.open(url, '_blank');

        if (newDocumentPage) {
            newDocumentPage.focus();
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

        const { isEdit, canViewComments, isDisconnected } = this.props;

        const api = Common.EditorApi.get();
        const cellinfo = api.asc_getCellInfo();

        const itemsIcon = [];
        const itemsText = [];

        let iscellmenu, isrowmenu, iscolmenu, isallmenu, ischartmenu, isimagemenu, istextshapemenu, isshapemenu, istextchartmenu;
        let iscelllocked = cellinfo.asc_getLocked();
        const seltype = cellinfo.asc_getSelectionType();
        const xfs = cellinfo.asc_getXfs();
        const isComments = cellinfo.asc_getComments().length > 0; //prohibit adding multiple comments in one cell;

        switch (seltype) {
            case Asc.c_oAscSelectionType.RangeCells:     iscellmenu  = true;     break;
            case Asc.c_oAscSelectionType.RangeRow:       isrowmenu   = true;     break;
            case Asc.c_oAscSelectionType.RangeCol:       iscolmenu   = true;     break;
            case Asc.c_oAscSelectionType.RangeMax:       isallmenu   = true;     break;
            case Asc.c_oAscSelectionType.RangeImage:     isimagemenu = true;     break;
            case Asc.c_oAscSelectionType.RangeShape:     isshapemenu = true;     break;
            case Asc.c_oAscSelectionType.RangeChart:     ischartmenu = true;     break;
            case Asc.c_oAscSelectionType.RangeChartText: istextchartmenu = true; break;
            case Asc.c_oAscSelectionType.RangeShapeText: istextshapemenu = true; break;
        }

        if (!isEdit) {
            if (iscellmenu || istextchartmenu || istextshapemenu) {
                itemsIcon.push({
                    event: 'copy',
                    icon: 'icon-copy'
                });
            }
            if (iscellmenu && cellinfo.asc_getHyperlink()) {
                itemsText.push({
                    caption: _t.menuOpenLink,
                    event: 'openlink'
                });
            }
            if (canViewComments && isComments) {
                itemsText.push({
                    caption: _t.menuViewComment,
                    event: 'viewcomment'
                });
            }
        } else {

            if (!iscelllocked && (isimagemenu || isshapemenu || ischartmenu || istextshapemenu || istextchartmenu)) {
                api.asc_getGraphicObjectProps().every((object) => {
                    if (object.asc_getObjectType() == Asc.c_oAscTypeSelectElement.Image) {
                        iscelllocked = object.asc_getObjectValue().asc_getLocked();
                    }
                    return !iscelllocked;
                });
            }

            if (iscelllocked || api.isCellEdited) {
                itemsIcon.push({
                    event: 'copy',
                    icon: 'icon-copy'
                });

            } else {
                itemsIcon.push({
                    event: 'cut',
                    icon: 'icon-cut'
                });
                itemsIcon.push({
                    event: 'copy',
                    icon: 'icon-copy'
                });
                itemsIcon.push({
                    event: 'paste',
                    icon: 'icon-paste'
                });
                itemsText.push({
                    caption: _t.menuDelete,
                    event: 'del'
                });

                if (isimagemenu || isshapemenu || ischartmenu ||
                    istextshapemenu || istextchartmenu) {
                    itemsText.push({
                        caption: _t.menuEdit,
                        event: 'edit'
                    });
                } else {
                    if (iscolmenu || isrowmenu) {
                        itemsText.push({
                            caption: _t.menuHide,
                            event: 'hide'
                        });
                        itemsText.push({
                            caption: _t.menuShow,
                            event: 'show'
                        });
                    } else if (iscellmenu) {
                        if (!iscelllocked) {
                            itemsText.push({
                                caption: _t.menuCell,
                                event: 'edit'
                            });
                        }

                        if (cellinfo.asc_getMerge() == Asc.c_oAscMergeOptions.None) {
                            itemsText.push({
                                caption: _t.menuMerge,
                                event: 'merge'
                            });
                        }

                        if (cellinfo.asc_getMerge() == Asc.c_oAscMergeOptions.Merge) {
                            itemsText.push({
                                caption: _t.menuUnmerge,
                                event: 'unmerge'
                            });
                        }

                        itemsText.push(
                            xfs.asc_getWrapText() ?
                                {
                                    caption: _t.menuUnwrap,
                                    event: 'unwrap'
                                } :
                                {
                                    caption: _t.menuWrap,
                                    event: 'wrap'
                                });

                        if (cellinfo.asc_getHyperlink() && !cellinfo.asc_getMultiselect()) {
                            itemsText.push({
                                caption: _t.menuOpenLink,
                                event: 'openlink'
                            });
                        } else if (!cellinfo.asc_getHyperlink() && !cellinfo.asc_getMultiselect() &&
                            !cellinfo.asc_getLockText() && !!cellinfo.asc_getText()) {
                            itemsText.push({
                                caption: _t.menuAddLink,
                                event: 'addlink'
                            });
                        }
                    }

                    itemsText.push({
                        caption: api.asc_getSheetViewSettings().asc_getIsFreezePane() ? _t.menuUnfreezePanes : _t.menuFreezePanes,
                        event: 'freezePanes'
                    });

                }

                if (canViewComments) {
                    if (isComments) {
                        itemsText.push({
                            caption: _t.menuViewComment,
                            event: 'viewcomment'
                        });
                    } else if (iscellmenu) {
                        itemsText.push({
                            caption: _t.menuAddComment,
                            event: 'addcomment'
                        });
                    }
                }
            }
        }


        if ( Device.phone && itemsText.length > 2 ) {
            this.extraItems = itemsText.splice(2,itemsText.length, {
                caption: _t.menuMore,
                event: 'showActionSheet'
            });
        }

        return itemsIcon.concat(itemsText);
    }

    initExtraItems () {
        return (this.extraItems && this.extraItems.length > 0 ? this.extraItems : []);
    }
}

const _ContextMenu = withTranslation()(ContextMenu);
_ContextMenu.closeContextMenu = ContextMenu.closeContextMenu;
export { _ContextMenu as default };