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
    users: stores.users,
    isDisconnected: stores.users.isDisconnected
}))
class ContextMenu extends ContextMenuController {
    constructor(props) {
        super(props);

        // console.log('context menu controller created');
        this.getUserName = this.getUserName.bind(this);
        this.isUserVisible = this.isUserVisible.bind(this);
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
        }
    }

    // onMenuClosed() {
    //     super.onMenuClosed();
    // }

    onMenuItemClick(action) {
        super.onMenuItemClick(action);

        if ( EditorUIController.ContextMenu && EditorUIController.ContextMenu.handleMenuItemClick(this, action) )
            return;

        switch (action) {
            case 'openlink':
                const api = Common.EditorApi.get();
                const stack = api.getSelectedElements ? api.getSelectedElements() : null;
                let value;
                stack && stack.forEach((item) => {
                    if (item.get_ObjectType() == Asc.c_oAscTypeSelectElement.Hyperlink) {
                        value = item.get_ObjectValue().get_Value();
                    }
                });
                value && this.openLink(value);
                break;
        }
    }

    openLink(url) {
        if (url) {
            const api = Common.EditorApi.get();
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
                    text  : _t.txtWarnUrl.replaceAll('{0}', url),
                    buttons: [
                        { text: _t.menuCancel, bold: true },
                        {
                        text: t('View.Settings', {returnObjects: true}).textOk,
                        bold: true,
                        onClick: () => {
                            const newDocumentPage = window.open(url, '_blank');
                            if (newDocumentPage) {
                                newDocumentPage.focus();
                            }
                        }
                    }]
                }).open();
            }
        }
    }

    onDocumentReady() {
        super.onDocumentReady();
    }

    initMenuItems() {
        if ( !Common.EditorApi ) return [];

        const { t } = this.props;
        const _t = t("ContextMenu", { returnObjects: true });

        const api = Common.EditorApi.get();
        const stack = api.getSelectedElements ? api.getSelectedElements() : null;

        let itemsText = [];
        let isLink = false;

        stack && stack.forEach(item => {
            const objectType = item.get_ObjectType();
            if (objectType == Asc.c_oAscTypeSelectElement.Hyperlink) {
                isLink = true;
            }
        });

        if (isLink) {
            itemsText.push({
                caption: _t.menuOpenLink,
                event: 'openlink'
            });
        }

        return itemsText;
    }

    initExtraItems () {
        return (this.extraItems && this.extraItems.length > 0 ? this.extraItems : []);
    }
}

const _ContextMenu = withTranslation()(ContextMenu);
_ContextMenu.closeContextMenu = ContextMenu.closeContextMenu;
export { _ContextMenu as default };