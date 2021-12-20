import React, { Fragment, useState } from 'react';
import { View, Link, Icon, Popover, List, ListItem, ListButton, Actions, ActionsGroup, ActionsButton, Sheet, Page } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { Device } from '../../../../common/mobile/utils/device';
import { inject, observer } from 'mobx-react';

const viewStyle = {
    height: 30
};

const MoveMenuActions = (props) => {
    const { t } = useTranslation();
    let { opened, setOpenActions, onMenuMoveClick, visibleSheets } = props;

    return (
        <Actions className="actions-move-sheet" opened={opened} onActionsClosed={() => setOpenActions(false)}>
            <ActionsGroup>
                <ActionsButton className={visibleSheets[0]?.active ? 'disabled' : ''} onClick={() => onMenuMoveClick("back")}>
                    {t('Statusbar.textMoveBack')}
                </ActionsButton>
                <ActionsButton className={visibleSheets[visibleSheets.length - 1]?.active ? 'disabled' : ''} onClick={() => onMenuMoveClick("forward")}> 
                    {t('Statusbar.textMoveForward')}
                </ActionsButton>
            </ActionsGroup>
            <ActionsGroup>
                <ActionsButton>{t('Statusbar.textCancel')}</ActionsButton>
            </ActionsGroup>
        </Actions>
    )
}

const PageListMove = props => {
    const { sheets, onMenuMoveClick } = props;
    const allSheets = sheets.sheets;
    const visibleSheets = sheets.visibleWorksheets();
    const [stateActionsOpened, setOpenActions] = useState(false);

    return (
        <Page>
            <List>
                { allSheets.map(model => 
                    model.hidden ? null : 
                    <ListItem className={model.active ? '' : 'disabled'} key={model.name} title={model.name}>
                        <div slot='after'
                        onClick={() => setOpenActions(true) }>
                            <Icon icon='icon-menu-comment'/>
                        </div>
                    </ListItem>)
                }
            </List>
            <MoveMenuActions opened={stateActionsOpened} setOpenActions={setOpenActions} onMenuMoveClick={onMenuMoveClick} visibleSheets={visibleSheets}/>
        </Page>
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
                    <div id="idx-box-add-tab" className={`${isDisconnected || isWorkbookLocked || isProtectedWorkbook ? 'disabled' : ''}`}>
                        <Link href={false} id="idx-btn-addtab" className={`tab${isDisabledEditSheet || isDisconnected || isWorkbookLocked || isProtectedWorkbook  ? ' disabled' : ''}`} onClick={props.onAddTabClicked}>
                            <Icon className="icon icon-plus" />
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
            {isPhone ? 
                <Sheet style={{height: '48%'}} className='move-sheet' swipeToClose={true} backdrop={false}>
                    <div className='swipe-container'>
                        <Icon icon='icon-swipe'/>
                    </div>
                    <PageListMove sheets={sheets} onMenuMoveClick={props.onMenuMoveClick}/>
                </Sheet>
                :
                <Popover style={{height: '420px'}} id="idx-move-sheet-popover" closeByOutsideClick={false}>
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
