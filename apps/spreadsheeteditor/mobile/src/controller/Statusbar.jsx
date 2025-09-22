
import React, { Fragment, useEffect, useRef, useState } from 'react';
import {StatusbarView} from '../view/Statusbar';
import { inject, observer } from 'mobx-react';
import { f7 } from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { Device } from '../../../../common/mobile/utils/device';

const StatusbarController = inject('storeWorksheets', 'storeFocusObjects', 'users')(observer(props => {
    const {storeWorksheets, storeFocusObjects, users} = props;
 
    useEffect(() => {
        Common.Notifications.on('engineCreated', api => {
            api.asc_registerCallback('asc_onWorkbookLocked', (locked) => {
                storeWorksheets.setWorkbookLocked(locked);
                storeFocusObjects.setIsLocked(api.asc_getCellInfo());
            });
            api.asc_registerCallback('asc_onWorksheetLocked', (index, locked) => {
                storeWorksheets.setWorksheetLocked(index, locked);
                storeFocusObjects.setIsLocked(api.asc_getCellInfo());
            });
            api.asc_registerCallback('asc_onChangeProtectWorkbook', () => {
                storeWorksheets.setProtectedWorkbook(api.asc_isProtectedWorkbook());
            });
            api.asc_registerCallback('asc_onEditCell', onApiEditCell);
            api.asc_registerCallback('asc_onSheetsChanged', onApiSheetsChanged);
            api.asc_registerCallback('asc_onActiveSheetChanged', onApiActiveSheetChanged);
            api.asc_registerCallback('asc_onHidePopMenu', onApiHideTabContextMenu);
            api.asc_registerCallback('asc_onUpdateTabColor', onApiUpdateTabColor);
            api.asc_registerCallback('asc_onCoAuthoringDisconnect', onApiDisconnect);
        });
        Common.Notifications.on('document:ready', onApiSheetsChanged);
        Common.Notifications.on('api:disconnect', onApiDisconnect);
    });

    const onApiEditCell = state => {
        let isDisable = state !== Asc.c_oAscCellEditorState.editEnd;
        storeWorksheets.setDisabledEditSheet(isDisable);
    }

    const onApiDisconnect = () => {
        users.resetDisconnected(true);
    }

    const onApiSheetsChanged = () => {
        const api = Common.EditorApi.get();
        const sheets_count = api.asc_getWorksheetsCount();
        const active_index = api.asc_getActiveWorksheetIndex();

        let i = -1, items = [];

        while (++i < sheets_count) {
            const tab = {
                index       : i,
                active      : active_index == i,
                name        : api.asc_getWorksheetName(i),
                locked      : api.asc_isWorksheetLockedOrDeleted(i),
                hidden      : api.asc_isWorksheetHidden(i),
                color       : api.asc_getWorksheetTabColor(i)
            };

            items.push(tab);
        }

        storeWorksheets.resetSheets(items);
    };

    const onApiActiveSheetChanged = (index) => {
        if (index < storeWorksheets.sheets.length) {
            storeWorksheets.setActiveWorksheet(index);
            Common.Notifications.trigger('sheet:active', index);
        }
    };

    const onApiHideTabContextMenu = () => {
        f7.popover.close('.document-menu.modal-in', false);
    }

    const onApiUpdateTabColor = sheetindex => {
        const api = Common.EditorApi.get();
        let tab = storeWorksheets.sheets.find(sheet => sheet.index === sheetindex);

        if (tab) {
            setTabLineColor(tab, api.asc_getWorksheetTabColor(sheetindex));
        }
    };

    const setTabLineColor = (tab, color) => {
        if (tab) {
            if (null !== color) {
                color = '#' + Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
            } else {
                color = '';
            }

            if (color.length) {
                if (!tab.active) {
                    color = '0px 3px 0 ' + Common.Utils.RGBColor(color).toRGBA(0.7) + ' inset';
                } else {
                    color = '0px 3px 0 ' + color + ' inset';
                }
                $$(`.sheet-tabs .tab a.tab-color-${tab.index}`).css('box-shadow', color);
            } else {
                $$(`.sheet-tabs .tab a.tab-color-${tab.index}`).css('box-shadow', '');
            }
        }
    };

    return null;
}));

const Statusbar = inject('storeWorksheets', 'storeAppOptions', 'users', 'storeSpreadsheetInfo')(observer(props => {
    const {storeWorksheets, storeAppOptions, users, storeSpreadsheetInfo} = props;
    const {t} = useTranslation();
    const _t = t('Statusbar', {returnObjects: true});
    const isEdit = storeAppOptions.isEdit;
    const isDisconnected = users.isDisconnected;
    const isProtectedWorkbook = storeWorksheets.isProtectedWorkbook;
    const isDisabledEditSheet = storeWorksheets.isDisabledEditSheet;
    const targetRef = useRef();

    useEffect(() => {
        const on_main_view_click = e => {
            if(!e.target.closest('.tab.active')) {
                f7.popover.close('.document-menu.modal-in', false);
            }
        };
        $$('.view-main').on('click', on_main_view_click);
        return () => {
            $$('.view-main').off('click', on_main_view_click);
        };
    }, []);

    const onTabClicked = i => {
        const model = storeWorksheets.at(i);
        const api = Common.EditorApi.get();

        api.asc_showWorksheet(model.index);
        storeWorksheets.setActiveWorksheet(i);

        Common.Notifications.trigger('sheet:active', model.index);
    };

    const createSheetName = () => {
        const api = Common.EditorApi.get();

        let items = [], wc = api.asc_getWorksheetsCount();
        while (wc--) {
            items.push(api.asc_getWorksheetName(wc).toLowerCase());
        }

        let index = 0, name;
        while(++index < 1000) {
            name = _t.textSheet + index;
            if (items.indexOf(name.toLowerCase()) < 0) break;
        }

        return name;
    };

    const onAddTabClicked = () => {
        const api = Common.EditorApi.get();
        api.asc_closeCellEditor();

        if ((storeSpreadsheetInfo.dataDoc?.fileType ?? '').toLowerCase() === 'csv') {
            f7.dialog.create({
                title: _t.notcriticalErrorTitle,
                text: _t.warnAddSheetCsv,
                buttons: [
                    {
                        text: _t.textCancel
                    },
                    {
                        text: _t.textContinue,
                        onClick: () => {
                            api.asc_addWorksheet(createSheetName());
                        }
                    }
                ]
            }).open();
        } else {
            api.asc_addWorksheet(createSheetName());
        }
    };

    const onTabClick = (i, target) => {
        const api = Common.EditorApi.get();
        const model = storeWorksheets.at(i);
        targetRef.current = target;

        let opened = $$('.document-menu.modal-in').length;
        let index = model.index;

        f7.popover.close('.document-menu.modal-in', false);

        if (index == api.asc_getActiveWorksheetIndex()) {
            if (!opened) {
                if (isEdit && !isDisconnected && !model.locked && !isProtectedWorkbook && !isDisabledEditSheet) {
                    api.asc_closeCellEditor();
                    f7.popover.open('#idx-tab-context-menu-popover', target);
                }
            }
        } 
        else {
            f7.popover.close('#idx-tab-context-menu-popover', false);
            onTabClicked(i);
        }
    };

    const deleteWorksheet = () => {
        const api = Common.EditorApi.get();
        const visibleSheets = storeWorksheets.visibleWorksheets();

        if (storeWorksheets.sheets.length == 1 || visibleSheets.length == 1) {
            f7.dialog.alert(_t.textErrorLastSheet, _t.notcriticalErrorTitle);
        } else {
            f7.dialog.create({
                title: _t.notcriticalErrorTitle,
                text: _t.textWarnDeleteSheet,
                buttons: [
                    {text: _t.textCancel},
                    {
                        text: _t.textOk,
                        onClick: () => {
                            if (!api.asc_deleteWorksheet()) {
                                f7.dialog.alert(_t.textErrorRemoveSheet, _t.notcriticalErrorTitle);
                            }
                        }
                    }]
            }).open();
        }
    };

    const renameWorksheet = () => {
        const api = Common.EditorApi.get();

        if (api.asc_getWorksheetsCount() > 0) {
            let sindex = api.asc_getActiveWorksheetIndex();

            if (api.asc_isWorksheetLockedOrDeleted(sindex)) {
                return;
            }

            let current = api.asc_getWorksheetName(api.asc_getActiveWorksheetIndex());

            f7.dialog.create({
                title: _t.textSheetName,
                content: Device.ios ?
                    '<div class="input-field"><input type="text" name="modal-sheet-name" maxlength="31" value="' + current + '" placeholder="' + _t.textSheetName + '" class="modal-text-input"></div>' : 
                    '<div class="item-content item-input" style="margin-top: 15px; position: relative; padding-bottom: 10px;"><div class="item-inner"><div class="item-input-wrap" style="min-height: initial; width: 100%;"><input type="text" style="width: 100%;" name="modal-sheet-name" value="' + current + '" maxlength="31" placeholder="' + _t.textSheetName + '" /></div></div></div>',
                buttons: [
                    {
                        text: _t.textOk,
                        bold: true,
                        onClick: function () {
                            let s = $$('input[name="modal-sheet-name"]').val(),
                                wc = api.asc_getWorksheetsCount(), items = [],
                                err = !s.trim().length ? _t.textErrNotEmpty : ((!/^(\')|[:\\\/\*\?\[\]]|(\')$/.test(s)) ? null : _t.textErrNameWrongChar);
                            if (!err) {
                                while (wc--) {
                                    if (sindex !== wc) {
                                        items.push(api.asc_getWorksheetName(wc).toLowerCase());
                                    }
                                }
                                if (items) {
                                    let testval = s.toLowerCase();
                                    for (var i = items.length - 1; i >= 0; --i) {
                                        if (items[i] === testval) {
                                            err = _t.textErrNameExists;
                                        }
                                    }
                                }
                            }
                            if (err) {
                                f7.dialog.alert(err, _t.notcriticalErrorTitle, () => {
                                    renameWorksheet();
                                });
                            } else if (s != current)
                                api.asc_renameWorksheet(s);
                        }
                    },
                    {
                        text: _t.textCancel
                    }
                ],
                on: {
                    opened: () => {
                        const nameField = document.querySelector('input[name="modal-sheet-name"]');
                        nameField.select();
                    },
                }
            }).open();
        }
    };

    const createCopyName = (orig) => {
        const api = Common.EditorApi.get();
        let wc = api.asc_getWorksheetsCount(), names = [];

        while (wc--) {
            names.push(api.asc_getWorksheetName(wc).toLowerCase());
        }

        let re = /^(.*)\((\d)\)$/.exec(orig);
        let first = re ? re[1] : orig + ' ';
        let index = 1, name;

        while(++index < 1000) {
            name = first + '(' + index + ')';
            if (names.indexOf(name.toLowerCase()) < 0) break;
        }

        return name;
    };

    const hideWorksheet = (hide, index) => {
        const api = Common.EditorApi.get();
        const visibleSheets = storeWorksheets.visibleWorksheets();

        if(hide) {
            visibleSheets.length == 1 ? 
                f7.dialog.alert(_t.textErrorLastSheet, _t.notcriticalErrorTitle) :
                api['asc_hideWorksheet']([index]);
        } else {
            f7.popover.close('#idx-hidden-sheets-popover');
            api['asc_showWorksheet'](index);
        }
    };

    const onTabMenu = (event) => {
        const api = Common.EditorApi.get();
        let index = storeWorksheets.sheets.find(sheet => sheet.active).index;

        f7.popover.close('.document-menu.modal-in', false);

        switch (event) {
            case 'del': deleteWorksheet(); break;
            case 'hide': hideWorksheet(true, index); break;
            case 'ins': api.asc_insertWorksheet(createSheetName()); break;
            case 'copy':
                let name = createCopyName(api.asc_getWorksheetName(api.asc_getActiveWorksheetIndex()));
                api.asc_copyWorksheet(index, name);
                break;
            case 'ren': renameWorksheet(); break;
            case 'move': 
                Device.phone ? f7.sheet.open('.move-sheet') : f7.popover.open('#idx-move-sheet-popover', targetRef.current); 
                break;
            case 'tab-color':
                if( Device.phone ) {
                    f7.sheet.open('.tab-color-sheet');
                    f7.navbar.hide('.main-navbar');
                    $$('.statusbar').css('top', '-50%');
                } else {
                    f7.popover.open('#idx-tab-color-popover',targetRef.current);
                }
                break;
            case 'unhide':
                f7.popover.open('#idx-hidden-sheets-popover', '.active');
                break;
            case 'showMore':
                f7.actions.open('#idx-tab-menu-actions');
                break;
            default:
                let _re = /reveal\:(\d+)/.exec(event);
                if (_re && !!_re[1]) {
                    hideWorksheet(false, parseInt(_re[1]));
                }
        }
    };

    const onMenuMoveClick = (index) => {
        const api = Common.EditorApi.get();

        let sheetsCount = api.asc_getWorksheetsCount();
        let activeIndex = api.asc_getActiveWorksheetIndex();

        api.asc_moveWorksheet(index === -255 ? sheetsCount : index , [activeIndex]);
    };

    const onTabListClick = (sheetIndex) => {
        const api = Common.EditorApi.get();
        if(api && api.asc_getActiveWorksheetIndex() !== sheetIndex) {
            api.asc_showWorksheet(sheetIndex);
            f7.popover.close('#idx-all-list');
        }
    };

    const onSetWorkSheetColor = (color) => {
        const api = Common.EditorApi.get();
        const active_index = api.asc_getActiveWorksheetIndex();
        const arrIndex = [];

        if (api) {
            arrIndex.push(active_index);
            if (arrIndex) {
                if(color === 'transparent') {
                    api.asc_setWorksheetTabColor(null, arrIndex);
                    storeWorksheets.sheets.forEach(tab => {
                        if(tab.active) $$(`.sheet-tabs .tab a.tab-color-${tab.index}`).css('box-shadow', '');
                    })
                } else {
                    let asc_clr = Common.Utils.ThemeColor.getRgbColor(color);
                    if (asc_clr) {
                        api.asc_setWorksheetTabColor(asc_clr, arrIndex);
                    }
                }
            }
            storeWorksheets.sheets[active_index].color = api.asc_getWorksheetTabColor(active_index);
        }
    }

    return (
        <StatusbarView 
            onTabClick={onTabClick}
            onTabClicked={onTabClicked}
            onAddTabClicked={onAddTabClicked}
            onTabMenu={onTabMenu}
            onTabListClick={onTabListClick}
            onMenuMoveClick = {onMenuMoveClick}
            onSetWorkSheetColor={onSetWorkSheetColor}
        />
    )
}));

export {Statusbar, StatusbarController};