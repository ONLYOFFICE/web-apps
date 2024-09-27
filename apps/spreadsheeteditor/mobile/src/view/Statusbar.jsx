import React, { Fragment, useEffect, useState } from 'react';
import {f7, View, Link, Icon, Popover, Navbar, NavRight, List, ListGroup, ListItem, ListButton, Actions, ActionsGroup, ActionsButton, Sheet, Page } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { Device } from '../../../../common/mobile/utils/device';
import { inject, observer } from 'mobx-react';
import { ThemeColorPalette, CustomColorPicker } from '../../../../common/mobile/lib/component/ThemeColorPalette.jsx';

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

const PageAllList = observer((props) => {
    const { t } = useTranslation();
    const { sheets, onTabListClick } = props;
    const allSheets = sheets.sheets;
    const heightView = Device.android ? allSheets.length * 48 : allSheets.length * 44;

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
        <View style={{maxHeight: '240px', height: heightView > 240 ? '240px' : `${heightView}px`}}>
            <Page>
                <List>
                    {allSheets.map((model, sheetIndex) =>
                        <ListItem className={`item-list ${model.active ? 'active' : null}`} key={model.name} title={model.name} checkbox checked={model.active} onClick={() => onTabListClick(sheetIndex)}>
                            <div slot='after'>
                                {model.hidden ? 
                                    t('Statusbar.textHidden')
                                :
                                    <div className='marker-color-sheet' style={{
                                        background: model.color ? '#' + Common.Utils.ThemeColor.getHexColor(model.color.get_r(), model.color.get_g(), model.color.get_b()) : 'transparent'}}></div>
                                }
                            </div>
                        </ListItem>
                    )}
                </List>
            </Page>
        </View>
    )
});

const PageCustomTabColor = inject("storePalette")(observer (props => {
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

const PageTabColor = inject("storePalette")(observer(props =>  {
    const { t } = useTranslation();
    const {sheets, allSheets = sheets.sheets} = props;
    const storePalette = props.storePalette;
    const customColors = storePalette.customColors;
    const activeIndex = sheets.activeWorksheet;

    useEffect(() => {
        if (allSheets.length !== 0) {
            let color = sheets.at(activeIndex).color;
            if(color !== null) {
                sheets.changeTabColor('' + Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()));
            } else {
                sheets.changeTabColor('transparent');
            }
        }
    }, [activeIndex]);

    const changeColor = (color, effectId, effectValue) => {
        if (color !== 'empty') {
            if (effectId !== undefined ) {
                sheets.changeTabColor(color);
                props.onSetWorkSheetColor(color);
            } else {
                sheets.changeTabColor(color);
                props.onSetWorkSheetColor(color);
            }
            
        Device.isPhone ? f7.sheet.close('.tab-color-sheet') : f7.popover.close('#idx-tab-color-popover');

        } else {
            f7.views.tabColorView.router.navigate('/sheet-tab-custom-color/', {props:{onSetWorkSheetColor: props.onSetWorkSheetColor, sheets}});
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

const StatusbarView = inject('storeAppOptions', 'storeWorksheets', 'users')(observer(props => {
    const { t } = useTranslation();
    const _t = t('Statusbar', {returnObjects: true});
    const isAndroid = Device.android;
    const isPhone = Device.isPhone;
    const {storeWorksheets, storeAppOptions, users} = props;
    const allSheets = storeWorksheets.sheets;
    const hiddenSheets = storeWorksheets.hiddenWorksheets();
    const isWorkbookLocked = storeWorksheets.isWorkbookLocked;
    const isProtectedWorkbook = storeWorksheets.isProtectedWorkbook;
    const isEdit = storeAppOptions.isEdit;
    const isDisconnected = users.isDisconnected;
    const isDisabledEditSheet = storeWorksheets.isDisabledEditSheet;

    const setSheetColor = sheet => {
        if(sheet) {
            let color;

            if (sheet.color) {
                color = '#' + Common.Utils.ThemeColor.getHexColor(sheet.color.get_r(), sheet.color.get_g(), sheet.color.get_b());
            } else {
                color = '';
            }

            if(color) {
                if(!sheet.active) {
                    color = '0px 3px 0 ' + Common.Utils.RGBColor(color).toRGBA(0.7) + ' inset';
                } else {
                    color = '0px 3px 0 ' + color + ' inset';
                }
            }

            return color;
        }
    };

    return (
        <Fragment>
            <View id="idx-statusbar" className="statusbar" style={viewStyle}>
                {isEdit &&
                    <div id="idx-box-add-tab" className={`${isDisconnected || isWorkbookLocked ? 'disabled box-tab' : 'box-tab'}`}>
                        <Link href={false} id="idx-btn-addtab" className={`tab${isDisabledEditSheet || isDisconnected || isWorkbookLocked || isProtectedWorkbook  ? ' disabled' : ''}`} onClick={props.onAddTabClicked}>
                            <Icon className={`icon icon-plus ${isAndroid ? 'bold' : ''}`}/>
                        </Link>
                        <Link href={false} id="idx-btn-all-list-tab" className={`tab${isDisabledEditSheet || isDisconnected || isWorkbookLocked ? ' disabled' : ''}`} onClick={(e) => f7.popover.open('#idx-all-list', e.target)}>
                            <Icon className={`icon icon-list ${isAndroid ? 'bold' : ''}`}/>
                        </Link>
                    </div>
                }
                <div className="statusbar--box-tabs">
                    <ul className="sheet-tabs bottom">
                        {allSheets.map((model, i) => 
                            model.hidden ? null : 
                                <li className={`tab${model.active ? ' active' : ''} ${model.locked ? 'locked' : ''}`} key={i} onClick={(e) => props.onTabClick(i, e.target)}>
                                    <a style={{boxShadow: setSheetColor(model)}} className={`tab-color-${model.index}`}>{model.name}</a>
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
            {
                <PopoverAllList sheets={storeWorksheets} onTabListClick={props.onTabListClick}/>
            }
            {isPhone ? 
                <Sheet style={{height: '48%'}} className='move-sheet' swipeToClose={true}>
                    <div className='swipe-container'>
                        <Icon icon='icon-swipe'/>
                    </div>
                    <PageListMove sheets={storeWorksheets} onMenuMoveClick={props.onMenuMoveClick}/>
                </Sheet>
                :
                <Popover id="idx-move-sheet-popover" closeByOutsideClick={false}>
                    <PageListMove sheets={storeWorksheets} onMenuMoveClick={props.onMenuMoveClick}/>
                </Popover>
            }
            { isPhone ?
                <Sheet style={{height: '50%'}} className='tab-color-sheet' backdrop={false} 
                onSheetClose={() =>
                    {
                        f7.navbar.show('.main-navbar');
                        $$('.statusbar').css('top', '0%');
                    }}>
                        <View routes={routes} name='tabColorView'>
                            <PageTabColor sheets={storeWorksheets} onSetWorkSheetColor={props.onSetWorkSheetColor}/>
                        </View>
                </Sheet>
                : 
                <Popover id="idx-tab-color-popover" backdrop={false}>
                    <View style={{height: '450px'}} routes={routes} name='tabColorView'> 
                        <PageTabColor sheets={storeWorksheets} onSetWorkSheetColor={props.onSetWorkSheetColor}/>
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
