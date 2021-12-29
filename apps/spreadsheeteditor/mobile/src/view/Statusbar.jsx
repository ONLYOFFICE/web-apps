import React, { Fragment, useEffect, useState } from 'react';
import {f7, View, Link, Icon, Popover, Navbar, NavRight, List, ListItem, ListButton, Actions, ActionsGroup, ActionsButton, Sheet, Page } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { Device } from '../../../../common/mobile/utils/device';
import { inject, observer } from 'mobx-react';
import { ThemeColorPalette, CustomColorPicker } from '../../../../common/mobile/lib/component/ThemeColorPalette.jsx';

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

const PageCustomTabColor =  inject("storePalette")(observer (props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    const onAddNewColor = (colors, color) => {
        props.storePalette.changeCustomColors(colors);
        props.onSetWorkSheetColor(color);
        props.sheets.changeTabColor(color);
        props.f7router.back();
    };

    return (
        <Page>
            <Navbar title={_t.textCustomColor} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link icon='icon-expand-down' sheetClose ></Link>
                    </NavRight>
                }
            </Navbar>
            <CustomColorPicker currentColor={props.sheets.colorTab} onAddNewColor={onAddNewColor}/>
        </Page>
    )
}));

const PageTabColor =  inject("storePalette")(observer(props =>  {
    const { t } = useTranslation();
    const {sheets} = props;
    const allSheets = sheets.sheets;
    const storePalette = props.storePalette;
    const customColors = storePalette.customColors;
    const activeIndex = sheets.activeWorksheet;

    useEffect(() => {
        if (allSheets.length !== 0) {
            let color = sheets.at(activeIndex).color;
            if(sheets.at(activeIndex).color !== null) {
                sheets.changeTabColor('' + Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()));
            } else {
                sheets.changeTabColor('transparent');
            }
        }
    }, [allSheets])

    const changeColor = (color, effectId, effectValue) => {
        if (color !== 'empty') {
            if (effectId !== undefined ) {
                const newColor = {color: color, effectId: effectId, effectValue: effectValue};
                sheets.changeTabColor(newColor);
                props.onSetWorkSheetColor(color);
            } else {
                sheets.changeTabColor(color);
                props.onSetWorkSheetColor(color);
            }
            
        Device.isPhone ? f7.sheet.close('.tab-color-sheet') : f7.popover.close('#idx-tab-color-popover');

        } else {
            f7.views.current.router.navigate('/sheet-tab-custom-color/', {props:{onSetWorkSheetColor: props.onSetWorkSheetColor, sheets}});
        }
    };

    return (
        <Page>
            <Navbar title={t('Statusbar.textTabColor')}>
            {Device.phone &&
                <NavRight>
                    <Link sheetClose>
                        <Icon icon='icon-expand-down'/>
                    </Link>
                </NavRight>
            }
           </Navbar>

           { allSheets.length !== 0 && 
           <ThemeColorPalette changeColor={changeColor} curColor={sheets.colorTab} customColors={customColors} transparent={true}/> }
           <List>
                <ListItem title={t('View.Edit.textAddCustomColor')} link="/sheet-tab-custom-color/" routeProps={{
                    onSetWorkSheetColor: props.onSetWorkSheetColor,
                    sheets,
                }}></ListItem>
            </List>
        </Page>
    )
}));


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
                                    <a className={`tab-color-${model.index}`}>{model.name}</a>
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
                            <ListButton title={_t.textTabColor} onClick={() => props.onTabMenu('tab-color')} />
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
                        <ActionsButton onClick={() => props.onTabMenu('tab-color')}>{_t.textTabColor}</ActionsButton>
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
            { isPhone ?
                <Sheet style={{height: '50%'}} className='tab-color-sheet' backdrop={false} 
                onSheetClose={() =>
                    {
                        f7.navbar.show('.main-navbar');
                        $$('.statusbar').css('top', '0%');
                    }}>
                        <View routes={routes}>
                            <PageTabColor sheets={sheets} onSetWorkSheetColor={props.onSetWorkSheetColor}/>
                        </View>
                </Sheet>
                : 
                <Popover id="idx-tab-color-popover" backdrop={false}>
                    <View style={{height: '450px'}} routes={routes}> 
                        <PageTabColor sheets={sheets} onSetWorkSheetColor={props.onSetWorkSheetColor}/>
                    </View>
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

const routes = [
    {
        path: '/sheet-tab-custom-color/',
        component: PageCustomTabColor
    },
];

export {StatusbarView};
