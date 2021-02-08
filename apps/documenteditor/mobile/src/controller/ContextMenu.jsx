import React, { Component } from 'react';
import { f7 } from 'framework7-react';

import ContextMenuView from '../view/ContextMenu';

class ContextMenuController extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pos: [-10000,-10000],
            show: false
        };

        this.onMenuClosed = this.onMenuClosed.bind(this);

        Common.Notifications.on({
            'engineCreated': api => {
                api.asc_registerCallback('asc_onShowPopMenu', this.onApiShowPopMenu.bind(this));
                api.asc_registerCallback('asc_onHidePopMenu', this.onApiHidePopMenu.bind(this));
            },
            'document:ready': () => {
                this.$targetEl = $$('<div id="idx-context-menu-target" style="position:absolute;width:15px;height:15px;background-color:green;z-index:1;"></div>');
                this.$targetEl.css({left: '-10000px', top: '-10000px'});

                $$('#editor_sdk').append(this.$targetEl);
            }
        });

        console.log('context menu controller created');
    }

    onApiShowPopMenu(x, y) {
        console.log('show context menu ' + [x,y]);

        this.$targetEl.css({left: `${x}px`, top: `${y}px`});
        this.setState({
            pos: [x,y],
            show: true });
    }

    onApiHidePopMenu() {
        // console.log('hide context menu');

        if ( this.state.show ) {
            f7.popover.close('#idx-context-menu-popover');
        }
    }

    onMenuClosed() {
        (async () => {
            await 1 && this.setState(state => {
                this.$targetEl.css({left: '-10000px', top: '-10000px'});
                return ({pos: [-10000, -10000], show: false});
            });
        })();
    }

    componentWillUnmount() {
        console.log('context menu controller will be unmounted');
    }

    componentDidMount() {
        console.log('context menu controller did mount');
    }

    render() {
        return (
            !this.state.show ? null :
                <ContextMenuView onMenuClosed={this.onMenuClosed} />)
    }
}

export { ContextMenuController as ContextMenu };