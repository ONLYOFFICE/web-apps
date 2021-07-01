import React, { Component } from 'react';
import { Popover, List, ListItem, ListButton, Link, Icon, Actions, ActionsGroup, ActionsButton } from 'framework7-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';

const idContextMenuElement = "idx-context-menu-popover";

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
            <Popover id={idContextMenuElement}
                     className="document-menu"
                     backdrop={false}
                     closeByBackdropClick={false}
                     closeByOutsideClick={false}
                     onPopoverClosed={e => this.props.onMenuClosed()}
            >
                <List className="list-block">
                    {buttons.map((b, index) =>
                        !b.icon ?
                            <ListButton title={b.caption} key={index} onClick={e => this.props.onMenuItemClick(b.event)} /> :
                            <ListButton key={index} onClick={e => this.props.onMenuItemClick(b.event)}>
                                <Icon slot="media" icon={`icon_mask ${b.icon}`} />
                            </ListButton>
                    )}
                </List>
            </Popover>
        )
    }
}

const ActionsWithExtraItems = ({items, onMenuItemClick, opened, onActionClosed}) => {
    const { t } = useTranslation();
    const _t = t('ContextMenu', {returnObjects: true});
    return (
        <Actions opened={opened} onActionsClosed={() => onActionClosed()}>
            <ActionsGroup>
                {items.length > 0 && items.map((item, index)=>{
                    return(
                        <ActionsButton key={`act-${index}`} onClick={() => {onMenuItemClick(item.event)}}>{item.caption}</ActionsButton>
                    )
                })}
            </ActionsGroup>
            <ActionsGroup>
                <ActionsButton>{_t.menuCancel}</ActionsButton>
            </ActionsGroup>
        </Actions>
    )
};

const exportedIdMenuElemen = `#${idContextMenuElement}`;
export {ContextMenuView as default, exportedIdMenuElemen as idContextMenuElement, ActionsWithExtraItems};