import React, { Fragment, useEffect, useState } from 'react';
import {f7, View, Link, Icon, Navbar, Popover, List, ListGroup, ListItem, ListButton, Actions, ActionsGroup, ActionsButton, Sheet, Page } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { Device } from '../../../../common/mobile/utils/device';
import { inject, observer } from 'mobx-react';

const viewStyle = {
    height: 30
};

const PageListMove = props => {
    const { t } = useTranslation();
    const { sheets, onMenuMoveClick } = props;
    const allSheets = sheets.sheets;

    return (
        <View style={!Device.phone ? {height: '420px'} : null}>
            <Page>
                <Navbar title={t('Statusbar.textMoveBefore')}/>
                <List>
                    <ListGroup>
                        { allSheets.map((model, index) => 
                            model.hidden ? null : 
                            <ListItem 
                            key={model.name} 
                            title={model.name} 
                            onClick={() => onMenuMoveClick(index)} />)
                        }
                        <ListItem 
                        title={t('Statusbar.textMoveToEnd')} 
                        onClick={() => onMenuMoveClick(-255)}/>
                    </ListGroup>
                </List>
            </Page>
        </View>
    )
};

const PageAllList = (props) => {
    const { t } = useTranslation();
    const { sheets, onTabListClick } = props;
    const allSheets = sheets.sheets;

    useEffect(() => {
        const tabs = $$('.sheet-tabs .tab');
        let tab = tabs.eq(sheets.activeWorksheet);

        if(sheets.activeWorksheet !== -1) {
            if(tab.length === 0) {
                tab = tabs.eq(tabs.length - 1);
                $$('.sheet-tabs').scrollLeft( tab.offset().left + tab.width(), 500);
            } else if(tab.offset().left < 0) {
                $$('.sheet-tabs').scrollLeft( $$('.sheet-tabs').scrollLeft() + tab.offset().left - 96, 500);
            } else {
                $$('.sheet-tabs').scrollLeft( $$('.sheet-tabs').scrollLeft() + (tab.offset().left + tab.width() - $$('.sheet-tabs').width()), 500);
            }
        }
    }, [sheets.activeWorksheet]);

    return (
        <View style={{height: '240px'}}>
            <Page>
                <List>
                    { allSheets.map( (model,sheetIndex) => 
                        <ListItem className='item-list' key={model.name} title={model.name} checkbox checked={model.active} onClick={() => onTabListClick(sheetIndex)}>
                            {model.hidden ?     
                                <div slot='after'>
                                    {t('Statusbar.textHidden')}
                                </div>
                            : null}
                        </ListItem>)
                    }
                </List>
            </Page>
        </View>
    )
};

const PopoverAllList = (props) => {
    const {sheets, onTabListClick} = props;

    const onScrollList = () => {
        const listHeight = $$('.list .item-list').height();
        $$('.all-list .page-content').scrollTop(listHeight*sheets.activeWorksheet);
    };

    return (
        <Popover id="idx-all-list" className="all-list" onPopoverOpen={onScrollList}>
            <PageAllList sheets={sheets} onTabListClick={onTabListClick}/>
        </Popover>
    )
};

const StatusbarView = inject('storeAppOptions', 'sheets', 'users')(observer(props => {
    const { t } = useTranslation();
    const _t = t('Statusbar', {returnObjects: true});
    const isAndroid = Device.android;
    const isPhone = Device.isPhone;
    const {sheets, storeAppOptions, users} = props;
    const allSheets = sheets.sheets;
    const hiddenSheets = sheets.hiddenWorksheets();
    const isWorkbookLocked = sheets.isWorkbookLocked;
    const isProtectedWorkbook = sheets.isProtectedWorkbook;
    const isEdit = storeAppOptions.isEdit;
    const isDisconnected = users.isDisconnected;
    const isDisabledEditSheet = sheets.isDisabledEditSheet;

    return (
        <Fragment>
            <View id="idx-statusbar" className="statusbar" style={viewStyle}>
                {isEdit &&
                    <div id="idx-box-add-tab" className={`${isDisconnected || isWorkbookLocked || isProtectedWorkbook ? 'disabled box-tab' : 'box-tab'}`}>
                        <Link href={false} id="idx-btn-addtab" className={`tab${isDisabledEditSheet || isDisconnected || isWorkbookLocked || isProtectedWorkbook  ? ' disabled' : ''}`} onClick={props.onAddTabClicked}>
                            <Icon className={`icon icon-plus ${isAndroid ? 'bold' : ''}`}/>
                        </Link>
                        <Link href={false} id="idx-btn-all-list-tab" className={`tab${isDisabledEditSheet || isDisconnected || isWorkbookLocked || isProtectedWorkbook  ? ' disabled' : ''}`} onClick={(e) => f7.popover.open('#idx-all-list', e.target)}>
                            <Icon className={`icon icon-list ${isAndroid ? 'bold' : ''}`}/>
                        </Link>
                    </div>
                }
                <div className="statusbar--box-tabs">
                    <ul className="sheet-tabs bottom">
                        {allSheets.map((model,i) => 
                            model.hidden ? null : 
                                <li className={`tab${model.active ? ' active' : ''} ${model.locked ? 'locked' : ''}`} key={i} onClick={(e) => props.onTabClick(i, e.target)}>
                                    <a>{model.name}</a>
                                </li>
                            
                        )}
                    </ul>
                </div>
            </View>
            {isEdit ? 
                <Popover id="idx-tab-context-menu-popover"
                    className="document-menu"
                    backdrop={false}
                    closeByBackdropClick={false}
                    closeByOutsideClick={false}
                >
                    {isPhone || isAndroid ? ( 
                        <List className="list-block">
                            <ListButton title={_t.textDuplicate} onClick={() => props.onTabMenu('copy')} />
                            <ListButton title={_t.textDelete} onClick={() => props.onTabMenu('del')} />
                            <ListButton title={_t.textMore} onClick={() => props.onTabMenu('showMore')} /> 
                        </List>
                    ) : (
                        <List className="list-block">
                            <ListButton title={_t.textDuplicate} onClick={() => props.onTabMenu('copy')} />
                            <ListButton title={_t.textDelete} onClick={() => props.onTabMenu('del')} />
                            <ListButton title={_t.textRename} onClick={() => props.onTabMenu('ren')} />
                            <ListButton title={_t.textHide} onClick={() => props.onTabMenu('hide')} />
                            <ListButton title={_t.textMove} onClick={() => props.onTabMenu('move')} />
                            {hiddenSheets.length ? (
                                <ListButton title={_t.textUnhide} onClick={() => props.onTabMenu('unhide')} />
                            ) : null}
                        </List>
                    )}
                </Popover>
            : null}
            {isPhone || isAndroid ? (
                <Actions id="idx-tab-menu-actions" backdrop={true} closeByBackdropClick={true}>
                    <ActionsGroup>
                        <ActionsButton onClick={() => props.onTabMenu('ren')}>{_t.textRename}</ActionsButton>
                        <ActionsButton onClick={() => props.onTabMenu('hide')}>{_t.textHide}</ActionsButton>
                        <ActionsButton onClick={() => props.onTabMenu('move')}>{_t.textMove}</ActionsButton>
                        {hiddenSheets.length ? (
                            <ActionsButton onClick={() => props.onTabMenu('unhide')}>{_t.textUnhide}</ActionsButton>
                        ) : null}
                    </ActionsGroup>
                    <ActionsGroup>
                        <ActionsButton bold={true}>{_t.textCancel}</ActionsButton>
                    </ActionsGroup> 
                </Actions>
            ) : null}
            {
                <PopoverAllList sheets={sheets} onTabListClick={props.onTabListClick}/>
            }
            {isPhone ? 
                <Sheet style={{height: '48%'}} className='move-sheet' swipeToClose={true}>
                    <div className='swipe-container'>
                        <Icon icon='icon-swipe'/>
                    </div>
                    <PageListMove sheets={sheets} onMenuMoveClick={props.onMenuMoveClick}/>
                </Sheet>
                :
                <Popover id="idx-move-sheet-popover" closeByOutsideClick={false}>
                    <PageListMove sheets={sheets} onMenuMoveClick={props.onMenuMoveClick}/>
                </Popover>
            }
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
                                <ListButton key={sheet.index} data-event={`reveal:${sheet.index}`} title={sheet.name} 
                                    onClick={() => props.onTabMenu(`reveal:${sheet.index}`)} />
                            )
                        })}
                    </List>
                </Popover>
            ) : null}
        </Fragment>
    )
}));

export {StatusbarView};
