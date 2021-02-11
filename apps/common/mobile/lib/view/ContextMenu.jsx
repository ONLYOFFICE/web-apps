import React, { Component } from 'react';
import { Popover, List, ListItem, ListButton, Link, Icon } from 'framework7-react';
import { f7 } from 'framework7-react';

class ContextMenuView extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        // f7.popover.open('#idx-context-menu-popover', '#idx-context-menu-target');
    }

    render() {
        const buttons = this.props.items || {};

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
                            <ListButton className="asd" title={b.text} key={index} onClick={e => this.props.onMenuItemClick(b.action)} /> :
                            <ListButton className="asd" title={b.text} key={index}>
                                <Icon slot="media" icon={`icon_mask ${b.icon}`} />
                            </ListButton>
                    )}
                </List>
            </Popover>
        )
    }
}

export default ContextMenuView;