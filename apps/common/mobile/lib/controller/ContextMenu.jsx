import React, { Component } from 'react';
import { f7 } from 'framework7-react';
import { Device } from '../../../../common/mobile/utils/device'

import ContextMenuView, { idContextMenuElement } from '../view/ContextMenu';

const idCntextMenuTargetElement = '#idx-context-menu-target';

class ContextMenuController extends Component {
    constructor(props) {
        super(props);

        this.state = {
            opened: false
        };

        this.onMenuClosed = this.onMenuClosed.bind(this);
        this.onDocumentReady = this.onDocumentReady.bind(this);
        this.onApiOpenContextMenu = this.onApiOpenContextMenu.bind(this);
        this.onApiHideContextMenu = this.onApiHideContextMenu.bind(this);
    }

    onDocumentReady() {
        this.$targetEl = $$(idCntextMenuTargetElement);
        if ( !this.$targetEl.length ) {
            // this.$targetEl = $$('<div id="idx-context-menu-target" style="position:absolute;width:15px;height:15px;background-color:green;z-index:1;"></div>');
            this.$targetEl = $$(`<div id="${idCntextMenuTargetElement.substr(1)}" style="position:absolute;"></div>`);
            this.$targetEl.css({left: '-10000px', top: '-10000px'});

            $$('#editor_sdk').append(this.$targetEl);
        }

        const api = Common.EditorApi.get();
        api.asc_registerCallback('asc_onShowPopMenu', this.onApiOpenContextMenu);
        api.asc_registerCallback('asc_onHidePopMenu', this.onApiHideContextMenu);
    }

    offsetPopoverTop(popover) {
            var app = popover.app,
                $el = popover.$el,
                $targetEl = popover.$targetEl;

            const width = $el.width(),
                height = $el.height();

            $el.removeClass('popover-on-left popover-on-right popover-on-top popover-on-bottom popover-on-middle').css({
                left: '',
                top: ''
            });

            let targetOffsetLeft, targetOffsetTop;
            // var safeAreaTop = parseInt($('html').css('--f7-safe-area-top'), 10);
            let safeAreaLeft = parseInt($('html').css('--f7-safe-area-left'), 10),
                safeAreaRight = parseInt($('html').css('--f7-safe-area-right'), 10);
            // if (Number.isNaN(safeAreaTop)) safeAreaTop = 0;
            if (Number.isNaN(safeAreaLeft)) safeAreaLeft = 0;
            if (Number.isNaN(safeAreaRight)) safeAreaRight = 0;

            if ($targetEl && $targetEl.length > 0) {
                let targetOffset = $targetEl.offset();
                targetOffsetLeft = targetOffset.left - app.left;
                targetOffsetTop = targetOffset.top - app.top;
                let targetParentPage = $targetEl.parents('.page');

                if (targetParentPage.length > 0) {
                    targetOffsetTop -= targetParentPage[0].scrollTop;
                }
            }

            let position = 'top';

            let top = targetOffsetTop - height - 10;
            top = Math.max(8, Math.min(top, app.height - height - 8)); // Horizontal Position

            let hPosition;

                // if (targetOffsetLeft < app.width / 2) {
                //     hPosition = 'right';
                //     left = position === 'middle' ? targetOffsetLeft + targetWidth : targetOffsetLeft;
                // } else {
                //     hPosition = 'left';
                //     left = position === 'middle' ? targetOffsetLeft - width : targetOffsetLeft + targetWidth - width;
                // }

            hPosition = 'middle';
            let left = targetOffsetLeft - width / 2;

            left = Math.max(8, Math.min(left, app.width - width - 8 - safeAreaRight), safeAreaLeft);
            $el.addClass(`popover-on-${position} popover-on-${hPosition}`);

            $el.css({top: `${top}px`,
                        left: `${left}px`});
    }

    onApiOpenContextMenu(x, y) {
        if ( !this.state.opened ) {
            this.$targetEl.css({left: `${x}px`, top: `${y}px`});
            const popover = f7.popover.open(idContextMenuElement, idCntextMenuTargetElement);

            if ( Device.android )
                this.offsetPopoverTop(popover);

            this.setState(state => {
                return {opened: true}
            });
        }
    }

    onApiHideContextMenu() {
        if ( this.state.opened ) {
            f7.popover.close(idContextMenuElement);

            this.$targetEl.css({left: '-10000px', top: '-10000px'});
            this.setState({opened: false});
        }
    }

    onMenuClosed() {
        // (async () => {
        //     await 1 && this.setState(state => {
        //         this.$targetEl.css({left: '-10000px', top: '-10000px'});
        //         return ({opened: false});
        //     });
        // })();
    }

    onMenuItemClick(action) {
    }

    componentWillUnmount() {
        Common.Notifications.off('document:ready', this.onDocumentReady);

        const api = Common.EditorApi.get();
        api.asc_unregisterCallback('asc_onShowPopMenu', this.onApiOpenContextMenu);
        api.asc_unregisterCallback('asc_onHidePopMenu', this.onApiHideContextMenu);
    }

    componentDidMount() {
        if ( !Common.EditorApi ) {
            Common.Notifications.on({
                'document:ready': this.onDocumentReady
            });
        } else {
            this.onDocumentReady();
        }
    }

    initMenuItems() {
        return [];
    }

    render() {
        return (
            <ContextMenuView items={this.initMenuItems()} onMenuClosed={this.onMenuClosed} onMenuItemClick={this.onMenuItemClick} />
        )
    }
}

export default ContextMenuController;