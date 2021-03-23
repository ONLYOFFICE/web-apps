
import React, { Fragment, useEffect, useState } from 'react';
import {StatusbarView} from '../view/Statusbar';
import { inject } from 'mobx-react';
import { f7 } from 'framework7-react';
import { Dom7 } from 'framework7';
import { useTranslation } from 'react-i18next';
import { Device } from '../../../../common/mobile/utils/device';

const Statusbar = inject('sheets', 'storeAppOptions')(props => {
    const {sheets, storeAppOptions} = props;
    const $$ = Dom7;
    const {t} = useTranslation();
    const _t = t('Statusbar', {returnObjects: true});
    console.log(props);

    let isEdit = storeAppOptions.isEdit;
    let isDisconnected = false;

    useEffect(() => {
        const on_api_created = api => {
            api.asc_registerCallback('asc_onSheetsChanged', onApiSheetsChanged.bind(api));
        };

        const on_main_view_click = e => {
            // f7.popover.close('.document-menu.modal-in');
        };

        Common.Notifications.on('api:disconnect', onApiDisconnect);
        Common.Notifications.on('document:ready', onApiSheetsChanged);
        Common.Notifications.on('engineCreated', on_api_created);

        $$('.view-main').on('click', on_main_view_click);

        return () => {
            Common.Notifications.off('document:ready', onApiSheetsChanged);
            Common.Notifications.off('engineCreated', on_api_created);

            $$('.view-main').off('click', on_main_view_click);
        };
    }, []);

//     const onWorkbookLocked = locked => {
//         this.statusbar.$btnAddTab.toggleClass('disabled', locked);
//         return;
//     };

//     const onWorksheetLocked = (index, locked) => {
//         let model = sheets.findWhere({index: index});
//         if(model && model.get('locked') != locked)
//             model.set('locked', locked);
//     };

    const onApiSheetsChanged = () => {
        console.log('on api sheets changed');

        const api = Common.EditorApi.get();
        const sheets_count = api.asc_getWorksheetsCount();
        const active_index = api.asc_getActiveWorksheetIndex();

        let i = -1,  items = [];

        while ( ++i < sheets_count ) {
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

        sheets.reset(items);
        // this.hiddensheets.reset(hiddentems);
        // updateTabsColors();
    };

    const loadTabColor = sheetindex => {
        const api = Common.EditorApi.get();
        let tab = sheets.sheets.find(sheet => sheet.index === sheetindex);

        if (tab) {
            setTabLineColor(tab, api.asc_getWorksheetTabColor(sheetindex));
        }
        
    };

    const onApiDisconnect = () => {
        isDisconnected = true;
    };

    const onApiUpdateTabColor = index => {
        loadTabColor(index);
    };

    // const setTabLineColor = (tab, color) => {
    //     if (tab) {
    //         if (null !== color) {
    //             color = '#' + Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
    //         } else {
    //             color = '';
    //         }

    //         if (color.length) {
    //             if (!tab.active) {
    //                 color = '0px 4px 0 ' + Common.Utils.RGBColor(color).toRGBA(0.7) + ' inset';
    //             } else {
    //                 color = '0px 4px 0 ' + color + ' inset';
    //             }
                
    //             $$('.tab')[tab.index].find('a').css('box-shadow', color);
    //         } else {
    //             $$('.tab')[tab.index].find('a').css('box-shadow', '');
    //         }
    //     }
    // };

    const updateTabsColors = () => {
        const api = Common.EditorApi.get();

        sheets.sheets.forEach(model => {
            setTabLineColor(model, api.asc_getWorksheetTabColor(model.index));
        });
    };

    const onTabClicked = i => {
        const model = sheets.at(i);
        const api = Common.EditorApi.get();

        api.asc_showWorksheet(model.index);
        sheets.setActiveWorksheet(i);
    };

    const createSheetName = () => {
        const api = Common.EditorApi.get();

        let items = [], wc = api.asc_getWorksheetsCount();
        while (wc--) {
            items.push(api.asc_getWorksheetName(wc).toLowerCase());
        }

        let index = 0, name;
        while(++index < 1000) {
            name = /*this.strSheet*/ 'Sheet' + index;
            if (items.indexOf(name.toLowerCase()) < 0) break;
        }

        return name;
    };

    const onAddTabClicked = () => {
        const api = Common.EditorApi.get();
        api.asc_closeCellEditor();
        f7.popover.close('#idx-tab-context-menu-popover');

        createSheetName();
        api.asc_addWorksheet(createSheetName());
    };

    // const _getTabMenuItems = model => {
    //     const api = Common.EditorApi.get();
    //     let wbLocked = api.asc_isWorkbookLocked();
    //     let shLocked = api.asc_isWorksheetLockedOrDeleted(model.index);

    //     let items = [{
    //             caption: _t.textDuplicate,
    //             event: 'copy',
    //             locked: wbLocked || shLocked
    //         },{
    //             caption: _t.textDelete,
    //             event: 'del',
    //             locked: wbLocked || shLocked
    //         },{
    //             caption: _t.textRename,
    //             event: 'ren',
    //             locked: wbLocked || shLocked
    //         },{
    //             caption: _t.textHide,
    //             event: 'hide',
    //             locked: wbLocked || shLocked
    //         }];


    //     if (!wbLocked && !shLocked && this.hiddensheets.length) {
    //         items.push({
    //             caption: _t.textUnhide,
    //             event: 'unhide'
    //         });
    //     }

    //     if (Common.SharedSettings.get('phone') && items.length > 3) {
    //         this._moreAction = items.slice(2);

    //         items = items.slice(0, 2);
    //         items.push({
    //             caption: this.menuMore,
    //             event: 'showMore'
    //         });
    //     }

    //     return items;
    // };

    const onTabClick = (i, target) => {
        const api = Common.EditorApi.get();
        const model = sheets.at(i);
        console.log(model);

        let opened = $$('.document-menu.modal-in').length;
        let index = model.index;

        f7.popover.close('.document-menu.modal-in');

        if (index == api.asc_getActiveWorksheetIndex()) {
            if (!opened) {
                if (!isDisconnected) {
                    api.asc_closeCellEditor();
                    // const items = _getTabMenuItems(model);
                    // this.statusbar.showTabContextMenu(this._getTabMenuItems(model), model);
                    f7.popover.open('#idx-tab-context-menu-popover', target);
                }
            }
        } else {
            f7.popover.close('#idx-tab-context-menu-popover');
            onTabClicked(i);
            Common.Notifications.trigger('sheet:active', index);
        }
    };

    const deleteWorksheet = () => {
        const api = Common.EditorApi.get();
        const visibleSheets = sheets.visibleWorksheets();

        if (sheets.sheets.length == 1 || visibleSheets.length == 1) {
            f7.dialog.alert(_t.textErrorLastSheet, _t.notcriticalErrorTitle);
        } else {
            f7.dialog.confirm(
                _t.textWarnDeleteSheet,
                _t.notcriticalErrorTitle,
                () => {
                    if (!api.asc_deleteWorksheet()) {
                        f7.dialog.alert(_t.textErrorRemoveSheet, _t.notcriticalErrorTitle);
                    }
                }
            );
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
                title: _t.textRenameSheet,
                content:
                    '<div class="input-field"><input type="text" name="modal-sheet-name" placeholder="' + _t.textSheetName + '" class="modal-text-input"></div>',
                buttons: [
                    {
                        text: 'OK',
                        bold: true,
                        onClick: function () {
                            let s = $$('.modal-text-input[name="modal-sheet-name"]').val(),
                                wc = api.asc_getWorksheetsCount(), items = [],
                                err = !s.trim().length ? _t.textErrNotEmpty : ((s.length > 2 && s[0] == '"' && s[s.length-1] == '"' || !/[:\\\/\*\?\[\]\']/.test(s)) ? null : _t.textErrNameWrongChar);
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
                ]
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
        const visibleSheets = sheets.visibleWorksheets();
      
        if(hide) {
            visibleSheets.length == 1 ? 
                f7.dialog.alert(_t.textErrorLastSheet, _t.notcriticalErrorTitle) :
                api['asc_hideWorksheet']([index]);
        } else {
            api['asc_showWorksheet'](index);
            // loadTabColor(index);
        }
    };

    const onTabMenu = (event) => {
        const api = Common.EditorApi.get();
        let index = sheets.sheets.find(sheet => sheet.active).index;
        f7.popover.close('#idx-tab-context-menu-popover');

        switch (event) {
            case 'del': deleteWorksheet(); break;
            case 'hide': hideWorksheet(true, index); break;
            case 'ins': api.asc_insertWorksheet(createSheetName()); break;
            case 'copy':
                let name = createCopyName(api.asc_getWorksheetName(api.asc_getActiveWorksheetIndex()));
                api.asc_copyWorksheet(index, name);
                break;
            case 'ren': renameWorksheet(); break;
            case 'unhide':
                f7.popover.open('#idx-hidden-sheets-popover', '.active');
                break;
            case 'showMore':
                if (me._moreAction.length > 0) {
                    _.delay(function () {
                        _.each(me._moreAction, function (action) {
                            action.text = action.caption;
                            action.onClick = function () {
                                me.onTabMenu(null, action.event, model)
                            }
                        });

                        uiApp.actions([me._moreAction, [
                            {
                                text: me.cancelButtonText,
                                bold: true
                            }
                        ]]);
                    }, 100);
                }
                break;
            default:
                let _re = /reveal\:(\d+)/.exec(event);
                if (_re && !!_re[1]) {
                    hideWorksheet(false, parseInt(_re[1]));
                }
        }
    };

    return (
        <StatusbarView onTabClick={onTabClick} onTabClicked={onTabClicked} onAddTabClicked={onAddTabClicked} onTabMenu={onTabMenu} />
    )
});

export default Statusbar;