import React, { Fragment } from 'react';
import { View, Toolbar, Link, Icon, Popover, List, ListButton } from 'framework7-react';
import { observer, inject } from "mobx-react";
import { useTranslation } from 'react-i18next';

const viewStyle = {
    height: 30
};

const StatusbarView = inject('sheets')(observer(props => {
    const { t } = useTranslation();
    const _t = t('Statusbar', {returnObjects: true});
    const { sheets } = props;
    const hiddenSheets = sheets.hiddenWorksheets();
    const getTabClassList = model => `tab ${model.active ? 'active' : ''} ${model.locked ? 'locked' : ''}`;

    return  (
        <Fragment>
            <View id="idx-statusbar" className="statusbar" style={viewStyle}>
                <div id="idx-box-add-tab">
                    <Link href="false" id="idx-btn-addtab" className="tab" onClick={e => props.onAddTabClicked()}>
                        <Icon className="icon icon-plus" />
                    </Link>
                </div>
                <div className="statusbar--box-tabs">
                    <ul className="sheet-tabs bottom">
                        {sheets.sheets.map((model,i) =>
                            model.hidden ? null :
                                <li className={getTabClassList(model)} key={i} onClick={(e) => props.onTabClick(i, e.target)}>
                                    <a /*onClick={e => props.onTabClicked(i)} */>{model.name}</a>
                                </li>
                        )}
                    </ul>
                </div>
            </View>
            <Popover id="idx-tab-context-menu-popover"
                className="document-menu"
                backdrop={false}
                closeByBackdropClick={false}
                closeByOutsideClick={false}
            >
                <List className="list-block">
                    <ListButton title={_t.textDuplicate} onClick={() => props.onTabMenu('copy')} />
                    <ListButton title={_t.textDelete} onClick={() => props.onTabMenu('del')} />
                    <ListButton title={_t.textRename} onClick={() => props.onTabMenu('ren')} />
                    <ListButton title={_t.textHide} onClick={() => props.onTabMenu('hide')} />
                    {hiddenSheets.length ? (
                        <ListButton title={_t.textUnhide} onClick={(e) => props.onTabMenu('unhide')} />
                    ): null}
                </List>
            </Popover>
            {hiddenSheets.length ? (
                <Popover id="idx-hidden-sheets-popover"
                    className="document-menu"
                    backdrop={false}
                    closeByBackdropClick={false}
                    closeByOutsideClick={false}
                >
                    <List className="list-block">
                        {hiddenSheets.map(sheet => {
                            return (
                                <ListButton key={sheet.index} data-event={`reveal:${sheet.index}`} title={sheet.name} onClick={() => props.onTabMenu(`reveal:${sheet.index}`)} />
                            )
                        })}
                    </List>
                </Popover>
            ) : null}
        </Fragment>
    )
}));

export {StatusbarView};
