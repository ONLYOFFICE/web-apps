import React from 'react';
import { f7 } from 'framework7-react';
import ContextMenuController from '../../../../common/mobile/lib/controller/ContextMenu';
import { idContextMenuElement } from '../../../../common/mobile/lib/view/ContextMenu';

class ContextMenu extends ContextMenuController {
    constructor(props) {
        super(props);

        // console.log('context menu controller created');
    }

    // onMenuClosed() {
    //     super.onMenuClosed();
    // }

    onMenuItemClick(action) {
        super.onMenuItemClick(action);

        console.log("on click item");
    }

    initMenuItems() {
        return [
            {
                text: 'Edit',
                action: 'edit'
            }, {
                text: 'View',
                action: 'view'
            }, {
                icon: 'icon-paste',
                action: 'review'
            }
        ];
    }
}

export { ContextMenu, idContextMenuElement };