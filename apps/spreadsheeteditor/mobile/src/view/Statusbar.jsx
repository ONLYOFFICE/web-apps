import React from 'react';
import { View, Toolbar, Link, Icon, Popover, List, ListButton } from 'framework7-react';
import { observer, inject } from "mobx-react";

const viewStyle = {
    height: 30
};

const StatusbarView = inject('sheets')(observer(props => {
    const { sheets } = props;

    const getTabClassList = model =>
            `tab ${model.active ? 'active':''} ${model.locked ? 'locked':''}`;

    return <View id="idx-statusbar" className="statusbar" style={viewStyle}>
                <div id="idx-box-add-tab">
                    <Link href="false" id="idx-btn-addtab" className="tab" onClick={e => props.onAddTabClicked()}>
                        <Icon className="icon icon-plus" />
                    </Link>
                </div>
                <div className="statusbar--box-tabs">
                    <ul className="sheet-tabs bottom">
                        {sheets.sheets.map((model,i) =>
                            model.hidden ? null :
                                <li className={getTabClassList(model)} key={i} onClick={() => props.onTabClick(i)}>
                                    <a onClick={e => props.onTabClicked(i)}>{model.name}</a>
                                </li>
                        )}
                    </ul>
                </div>
            </View>;
}));

const TabContextMenu = props => {
    return (
        <Popover id="idx-statusbar-context-menu-popover"
                className="document-menu"
                backdrop={false}
                closeByBackdropClick={false}
                closeByOutsideClick={false}
                // onPopoverClosed={e => this.props.onMenuClosed()}
            >
                <List className="list-block">
                    <ListButton title="Duplicate" onClick={() => this.props.onTabMenu('copy')} />
                    <ListButton title="Delete" onClick={() => this.props.onTabMenu('del')} />
                    <ListButton title="Rename" onClick={() => this.props.onTabMenu('ren')} />
                    <ListButton title="Hide" onClick={() => this.props.onTabMenu('hide')} />
                </List>
        </Popover>
    )
}

export {StatusbarView, TabContextMenu};
