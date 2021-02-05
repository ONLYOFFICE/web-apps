import React, { Component } from 'react';
import { Popover, List, ListItem, ListButton, Link, Icon } from 'framework7-react';
import { f7 } from 'framework7-react';

const buttons = [
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

class ContextMenuView extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        f7.popover.open('#idx-context-menu-popover', '#idx-context-menu-target');
    }

    render() {
        return (
            <Popover id="idx-context-menu-popover"
                     className="document-menu"
                     backdrop={false}
                     closeByBackdropClick={false}
                     closeByOutsideClick={false}
                     onPopoverClosed={e => this.props.onMenuClosed()}
            >
                <List className="list-block">
                    {buttons.map((b, index) =>
                        !!b.text ?
                            <ListButton className="asd" title={b.text} key={index} /> :
                            <ListButton className="asd" title={b.text} key={index}>
                                <Icon slot="media" icon={b.icon} />
                            </ListButton>
                    )}
                </List>
            </Popover>
        )
    }
}

export default ContextMenuView;