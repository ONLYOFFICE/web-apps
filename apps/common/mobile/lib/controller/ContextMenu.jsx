import React, { Component, Fragment } from 'react';
import { f7 } from 'framework7-react';
import {observer, inject} from "mobx-react";
import { Device } from '../../../../common/mobile/utils/device';

import ContextMenuView, { idContextMenuElement, ActionsWithExtraItems } from '../view/ContextMenu';

const idCntextMenuTargetElement = '#idx-context-menu-target';

class ContextMenuController extends Component {
    constructor(props) {
        super(props);

        this.state = {
            opened: false,
            items: [],
            openedMore: false,
            extraItems: []
        };

        this.fastCoAuthTips = [];
        this.onMenuItemClick = this.onMenuItemClick.bind(this);
        this.onMenuClosed = this.onMenuClosed.bind(this);
        this.onActionClosed = this.onActionClosed.bind(this);
        this.onDocumentReady = this.onDocumentReady.bind(this);
        this.onApiOpenContextMenu = this.onApiOpenContextMenu.bind(this);
        this.onApiHideContextMenu = this.onApiHideContextMenu.bind(this);
        this.onApiShowForeignCursorLabel = this.onApiShowForeignCursorLabel.bind(this);
        this.onApiHideForeignCursorLabel = this.onApiHideForeignCursorLabel.bind(this);
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
        api.asc_registerCallback('asc_onShowForeignCursorLabel', this.onApiShowForeignCursorLabel);
        api.asc_registerCallback('asc_onHideForeignCursorLabel', this.onApiHideForeignCursorLabel);
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
        if ( !this.state.opened && $$('.dialog.modal-in, .popover.modal-in, .sheet-modal.modal-in, .popup.modal-in, #pe-preview, .add-comment-popup').length < 1) {
            this.setState({
                items: this.initMenuItems(),
                extraItems: this.initExtraItems()
            });

            if ( this.state.items.length > 0 ) {
                this.$targetEl.css({left: `${x}px`, top: `${y}px`});
                const popover = f7.popover.open(idContextMenuElement, idCntextMenuTargetElement);

                if (Device.android)
                    this.offsetPopoverTop(popover);

                this.setState(state => {
                    return {opened: true}
                });
            }
        }
    }

    onApiHideContextMenu() {
        if ( this.state.opened ) {
            $$(idContextMenuElement).hide();
            f7.popover.close(idContextMenuElement, false);

            this.$targetEl.css({left: '-10000px', top: '-10000px'});
            this.setState({opened: false});
        }
    }

    onMenuClosed() {
        this.$targetEl.css({left: '-10000px', top: '-10000px'});
        this.setState({opened: false});

        // (async () => {
        //     await 1 && this.setState(state => {
        //         this.$targetEl.css({left: '-10000px', top: '-10000px'});
        //         return ({opened: false});
        //     });
        // })();
    }

    onActionClosed() {
        this.setState({openedMore: false});
    }

    async onMenuItemClick(action) {
        await this.onApiHideContextMenu();

        if (action === 'showActionSheet') {
            this.setState({openedMore: true});
        }
    }

    onApiShowForeignCursorLabel(UserId, X, Y, color) {
        /** coauthoring begin **/
        const tipHeight = 20;

        let src;
        for (let i=0; i<this.fastCoAuthTips.length; i++) {
            if (this.fastCoAuthTips[i].attr('userid') === UserId) {
                src = this.fastCoAuthTips[i];
                break;
            }
        }
        if (!src) {
            src = $$(`<div class="username-tip"></div>`);
            src.attr('userid', UserId);
            src.css({'background-color': '#'+Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b())});
            src.text(this.getUserName(UserId));
            $$('#id_main_parent').append(src);
            this.fastCoAuthTips.push(src);
            //src.fadeIn(150);
            src[0].classList.add('active');

            $$('#id_main_view').append(src);
        }
        src.css({
            top: (Y - tipHeight) + 'px',
            left: X + 'px'});
        /** coauthoring end **/
    }

    onApiHideForeignCursorLabel(userId) {
        /** coauthoring begin **/
        for (let i=0; i<this.fastCoAuthTips.length; i++) {
            if (this.fastCoAuthTips[i].attr('userid') == userId) {
                const src = this.fastCoAuthTips[i];
                //this.fastCoAuthTips[i].fadeOut(150, () => {src.remove()});
                src[0].classList.remove('active');
                src.remove();
                this.fastCoAuthTips.splice(i, 1);
                break;
            }
        }
        /** coauthoring end **/
    }

    componentWillUnmount() {
        Common.Notifications.off('document:ready', this.onDocumentReady);

        const api = Common.EditorApi.get();
        api.asc_unregisterCallback('asc_onShowPopMenu', this.onApiOpenContextMenu);
        api.asc_unregisterCallback('asc_onHidePopMenu', this.onApiHideContextMenu);
        api.asc_unregisterCallback('asc_onShowForeignCursorLabel', this.onApiShowForeignCursorLabel);
        api.asc_unregisterCallback('asc_onHideForeignCursorLabel', this.onApiHideForeignCursorLabel);
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

    initExtraItems () {
        return [];
    }

    render() {
        return (
            <Fragment>
                <ContextMenuView items={this.state.items} onMenuClosed={this.onMenuClosed} onMenuItemClick={this.onMenuItemClick} />
                <ActionsWithExtraItems items={this.state.extraItems} onMenuItemClick={this.onMenuItemClick} opened={this.state.openedMore} onActionClosed={this.onActionClosed}/>
            </Fragment>
        )
    }
}

export default ContextMenuController;