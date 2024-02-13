import { f7 } from 'framework7-react';
import { inject, observer } from "mobx-react";
import { withTranslation} from 'react-i18next';
import { LocalStorage } from '../../../../common/mobile/utils/LocalStorage.mjs';

import ContextMenuController from '../../../../common/mobile/lib/controller/ContextMenu';
import { idContextMenuElement } from '../../../../common/mobile/lib/view/ContextMenu';
import EditorUIController from '../lib/patch';

@inject(stores => ({
    isEdit: stores.storeAppOptions.isEdit,
    canComments: stores.storeAppOptions.canComments,
    canViewComments: stores.storeAppOptions.canViewComments,
    canCoAuthoring: stores.storeAppOptions.canCoAuthoring,
    isRestrictedEdit: stores.storeAppOptions.isRestrictedEdit,
    users: stores.users,
    isDisconnected: stores.users.isDisconnected,
    storeWorksheets: stores.storeWorksheets,
    wsProps: stores.storeWorksheets.wsProps,
    wsLock: stores.storeWorksheets.wsLock,
    objects: stores.storeFocusObjects.objects,
    focusOn: stores.storeFocusObjects.focusOn,
    isResolvedComments: stores.storeApplicationSettings.isResolvedComments,
    isVersionHistoryMode: stores.storeVersionHistory.isVersionHistoryMode
}))
class ContextMenu extends ContextMenuController {
    constructor(props) {
        super(props);

        // console.log('context menu controller created');
        this.onApiShowComment = this.onApiShowComment.bind(this);
        this.onApiHideComment = this.onApiHideComment.bind(this);
        this.isOpenWindowUser = false;
        this.timer;
        this.getUserName = this.getUserName.bind(this);
        this.isUserVisible = this.isUserVisible.bind(this);
        this.onApiMouseMove = this.onApiMouseMove.bind(this);
        this.onApiHyperlinkClick = this.onApiHyperlinkClick.bind(this);
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
            api.asc_unregisterCallback('asc_onMouseMove', this.onApiMouseMove);
            api.asc_unregisterCallback('asc_onHyperlinkClick', this.onApiHyperlinkClick);
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

    onApiHyperlinkClick(url) {
        const { t } = this.props;

        if(!url) {
            f7.dialog.create({
                title: t('ContextMenu.notcriticalErrorTitle'),
                text: t('ContextMenu.errorInvalidLink'),
                buttons:[
                    {text: 'OK'}
                ] 
            }).open();
        }
    }

    onMenuItemClick(action) {
        const { t } = this.props;
        const _t = t("ContextMenu", { returnObjects: true });

        super.onMenuItemClick(action);

        if ( EditorUIController.ContextMenu && EditorUIController.ContextMenu.handleMenuItemClick(this, action) )
            return;

        const api = Common.EditorApi.get();
        const info = api.asc_getCellInfo();

        switch (action) {
            case 'cut':
                if (!LocalStorage.getBool("sse-hide-copy-cut-paste-warning")) {
                    this.showCopyCutPasteModal();
                }
                break;
            case 'copy':
                if (!api.asc_Copy() && !LocalStorage.getBool("sse-hide-copy-cut-paste-warning")) {
                    this.showCopyCutPasteModal();
                }
                break;
            case 'paste':
                if (!LocalStorage.getBool("sse-hide-copy-cut-paste-warning")) {
                    this.showCopyCutPasteModal();
                }
                break;
            case 'viewcomment':
                Common.Notifications.trigger('viewcomment');
                break;
            case 'openlink':
                const linkinfo = info.asc_getHyperlink();

                if ( linkinfo.asc_getType() == Asc.c_oAscHyperlinkType.RangeLink ) {
                    const { storeWorksheets } = this.props;
                    const nameSheet = linkinfo.asc_getSheet();
                    const curActiveSheet = api.asc_getActiveWorksheetIndex();
                    const tab = storeWorksheets.sheets.find((sheet) => sheet.name === nameSheet);
                    api.asc_setWorksheetRange(linkinfo);

                    if (tab) {
                        const sdkIndex = tab.index;
                        if (sdkIndex !== curActiveSheet) {
                            const index = storeWorksheets.sheets.indexOf(tab);
                            storeWorksheets.setActiveWorksheet(index);
                            Common.Notifications.trigger('sheet:active', sdkIndex);
                        }
                    }
                } else {
                    const url = linkinfo.asc_getHyperlinkUrl().replace(/\s/g, "%20");
                    this.openLink(url);
                }
                break;
            case 'autofillCells':
                api.asc_fillHandleDone();
                break;
        }
    }

    onMergeCells() {
        const { t } = this.props;
        const api = Common.EditorApi.get();
        if (api.asc_mergeCellsDataLost(Asc.c_oAscMergeOptions.Merge)) {
            setTimeout(() => {
                f7.dialog.create({
                    title: t('ContextMenu.notcriticalErrorTitle'),
                    text: t('ContextMenu.warnMergeLostData'),
                    buttons: [
                        {
                            text: t('ContextMenu.menuCancel')
                        },
                        {
                            text: 'OK',
                            onClick: () => {
                                api.asc_mergeCells(Asc.c_oAscMergeOptions.Merge);
                            }
                        }
                ]   
                }).open();
            }, 0);
        } else {
            api.asc_mergeCells(Asc.c_oAscMergeOptions.Merge);
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
                    if (dontShow) LocalStorage.setItem("sse-hide-copy-cut-paste-warning", 1);
                }
            }]
        }).open();
    }

    openLink(url) {
        if (url) {
            const type = Common.EditorApi.get().asc_getUrlType(url);
            if (type===AscCommon.c_oAscUrlType.Http || type===AscCommon.c_oAscUrlType.Email) {
                const newDocumentPage = window.open(url, '_blank');
                if (newDocumentPage) {
                    newDocumentPage.focus();
                }
            } else {
                const { t } = this.props;
                const _t = t("ContextMenu", { returnObjects: true });
                f7.dialog.create({
                    title: _t.notcriticalErrorTitle,
                    text  : _t.txtWarnUrl,
                    buttons: [{
                        text: _t.textOk,
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

    onDocumentReady() {
        super.onDocumentReady();

        const api = Common.EditorApi.get();
        api.asc_registerCallback('asc_onShowComment', this.onApiShowComment);
        api.asc_registerCallback('asc_onHideComment', this.onApiHideComment);
        api.asc_registerCallback('asc_onMouseMove', this.onApiMouseMove);
        api.asc_registerCallback('asc_onHyperlinkClick', this.onApiHyperlinkClick);
        api.asc_registerCallback('asc_onShowPopMenu', this.checkShapeSelection);
    }

    initMenuItems() {
        if ( !Common.EditorApi ) return [];

        const { t } = this.props;
        const _t = t("ContextMenu", { returnObjects: true });

        const { isEdit, isRestrictedEdit, isDisconnected, isVersionHistoryMode } = this.props;

        if (isEdit && EditorUIController.ContextMenu) {
            return EditorUIController.ContextMenu.mapMenuItems(this);
        } else {
            const {canViewComments, canCoAuthoring, canComments, isResolvedComments} = this.props;

            const api = Common.EditorApi.get();
            const cellinfo = api.asc_getCellInfo();
            const isCanFillHandle = api.asc_canFillHandle();

            const itemsIcon = [];
            const itemsText = [];

            let iscellmenu, isrowmenu, iscolmenu, isallmenu, ischartmenu, isimagemenu, istextshapemenu, isshapemenu, istextchartmenu;
            const seltype = cellinfo.asc_getSelectionType();
            const comments = cellinfo.asc_getComments(); //prohibit adding multiple comments in one cell;
            const isSolvedComment = comments?.length && comments[0].asc_getSolved();

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

                itemsIcon.push({
                    event: 'copy',
                    icon: 'icon-copy'
                });
    
                if (iscellmenu && cellinfo.asc_getHyperlink()) {
                    itemsText.push({
                        caption: _t.menuOpenLink,
                        event: 'openlink'
                    });
                    
                    if(!isVersionHistoryMode) {
                        itemsText.push({
                            caption: t("ContextMenu.menuEditLink"),
                            event: 'editlink'
                        });
                    }
                }

                if(!isDisconnected && !isVersionHistoryMode) {
                    if (canViewComments && comments && comments.length && ((!isSolvedComment && !isResolvedComments) || isResolvedComments)) {
                        itemsText.push({
                            caption: _t.menuViewComment,
                            event: 'viewcomment'
                        });
                    }

                    if (iscellmenu && !api.isCellEdited && isRestrictedEdit && canCoAuthoring && canComments && comments && comments.length<1) {
                        itemsText.push({
                            caption: _t.menuAddComment,
                            event: 'addcomment'
                        });
                    }
                }

                if(isCanFillHandle) {
                    itemsText.push({
                        caption: t('ContextMenu.menuAutofill'),
                        event: 'autofillCells'
                    });
                }

            return itemsIcon.concat(itemsText);
        }
    }

    checkShapeSelection() {
        const objects = this.props.objects;
        const focusOn = this.props.focusOn;
        const contextMenuElem = document.querySelector('#idx-context-menu-popover');

        if(objects?.indexOf('shape') > -1 && focusOn === 'obj') {
            contextMenuElem.style.top = `${+(contextMenuElem.style.top.replace(/px$/, '')) - 40}px`;
        }
    }

    onApiMouseMove(dataarray) {
        const tipHeight = 20;
        let index_locked,
            index_foreign,
            editorOffset = $$("#editor_sdk").offset(),
            XY = [ editorOffset.left -  $(window).scrollLeft(), editorOffset.top - $(window).scrollTop()];

        for (let i = dataarray.length; i > 0; i--) {
            if (dataarray[i-1].asc_getType() === Asc.c_oAscMouseMoveType.LockedObject) index_locked = i;
            if (dataarray[i-1].asc_getType() === Asc.c_oAscMouseMoveType.ForeignSelect) index_foreign = i;
        }

        if (this.isOpenWindowUser) {
            this.timer = setTimeout(() => $$('.username-tip').remove(), 1500);
            this.isOpenWindowUser = false;
        } else {
            clearTimeout(this.timer);
            $$('.username-tip').remove();
        }

        if (index_locked && this.isUserVisible(dataarray[index_locked-1].asc_getUserId())) {
            let data = dataarray[index_locked - 1],
                X = data.asc_getX(),
                Y = data.asc_getY(),
                src = $$(`<div class="username-tip"></div>`);

            src.css({
                height      : tipHeight + 'px',
                position    : 'absolute',
                zIndex      : '5000',
                visibility  : 'visible',
            });

            src.text(this.getUserName(data.asc_getUserId()));
            src.addClass('active');
            $$(document.body).append(src);

            let showPoint = [ ($$(window).width() - (X + XY[0])), Y + XY[1] ];

            if ( $$(window).width() - showPoint[0] < src.outerWidth() ) {
                src.css({
                    left:  '0px',
                    top: (showPoint[1] - tipHeight)  + 'px',
                });
            } else {
                src.css({
                    right: showPoint[0] + 'px',
                    top: showPoint[1] - 1 + 'px',
                });
            }
            this.isOpenWindowUser = true;
        }

        if(index_foreign && this.isUserVisible(dataarray[index_foreign-1].asc_getUserId())) {
            let data = dataarray[index_foreign - 1],
                src = $$(`<div class="username-tip"></div>`),
                color = data.asc_getColor(),
                foreignSelectX = data.asc_getX(),
                foreignSelectY = data.asc_getY();
            
            src.css({
                height      : tipHeight + 'px',
                position    : 'absolute',
                zIndex      : '5000',
                visibility  : 'visible',
                'background-color': '#'+Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b())
            });

            src.text(this.getUserName(data.asc_getUserId()));
            src.addClass('active');
            $$(document.body).append(src);

            if ( foreignSelectX + src.outerWidth() > $$(window).width() ) {
                src.css({
                    left:  foreignSelectX - src.outerWidth() + 'px',
                    top: (foreignSelectY + XY[1] - tipHeight) + 'px',
                });
            } else {
                src.css({
                    left:  foreignSelectX + 'px',
                    top: (foreignSelectY + XY[1] - tipHeight) + 'px',
                });
            }
            this.isOpenWindowUser = true;
        }
    }

    initExtraItems () {
        return (this.extraItems && this.extraItems.length > 0 ? this.extraItems : []);
    }
}

const _ContextMenu = withTranslation()(ContextMenu);
_ContextMenu.closeContextMenu = ContextMenu.closeContextMenu;
export { _ContextMenu as default };