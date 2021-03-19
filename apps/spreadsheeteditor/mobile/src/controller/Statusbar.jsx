
import React, { Fragment, useEffect } from 'react';
import {StatusbarView, TabContextMenu} from '../view/Statusbar';
import { inject } from 'mobx-react';
import { f7 } from 'framework7-react';
import { Dom7 } from 'framework7';

const Statusbar = inject('sheets', 'storeAppOptions')(props => {
    const {sheets, storeAppOptions} = props;
    console.log(sheets);

    let isEdit = storeAppOptions.isEdit;
    let isDisconnected = undefined;

    useEffect(() => {
        console.log("status bar did mount");

        Common.Notifications.on('document:ready', onApiSheetsChanged);
        Common.Notifications.on('api:disconnect', onApiDisconnect);
        Common.Notifications.on('engineCreated', api => {
            api.asc_registerCallback('asc_onUpdateTabColor', onApiUpdateTabColor);
            // api.asc_registerCallback('asc_onWorkbookLocked', onWorkbookLocked);
            // api.asc_registerCallback('asc_onWorksheetLocked', onWorksheetLocked);
            api.asc_registerCallback('asc_onSheetsChanged', onApiSheetsChanged.bind(api));
            api.asc_registerCallback('asc_onCoAuthoringDisconnect', onApiDisconnect);
        });
    }, []);

//     const onWorkbookLocked = locked => {
//         this.statusbar.$btnAddTab.toggleClass('disabled', locked);
//         return;

//         this.statusbar.tabbar[locked?'addClass':'removeClass']('coauth-locked');
//         this.statusbar.btnAddWorksheet.setDisabled(locked || this.statusbar.rangeSelectionMode==Asc.c_oAscSelectionDialogType.Chart ||
//                                                              this.statusbar.rangeSelectionMode==Asc.c_oAscSelectionDialogType.FormatTable);
//         var item, i = this.statusbar.tabbar.getCount();
//         while (i-- > 0) {
//             item = this.statusbar.tabbar.getAt(i);
//             if (item.sheetindex >= 0) {
// //              if (locked) item.reorderable = false;
// //              else item.reorderable = !this.api.asc_isWorksheetLockedOrDeleted(item.sheetindex);
//             } else {
//                 item.disable(locked);
//             }
//         }
//     };

//     const onWorksheetLocked = (index, locked) => {
//         let model = sheets.findWhere({index: index});
//         if(model && model.get('locked') != locked)
//             model.set('locked', locked);
//     };

    const onApiSheetsChanged = api => {
        console.log('on api sheets changed');

        !api && (api = Common.EditorApi.get());

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
        let tab = sheets.findWhere({index: sheetindex});

        if (tab) {
            setTabLineColor(tab, api.asc_getWorksheetTabColor(sheetindex));
        }
        
    };

    const onApiDisconnect = () => {
        isDisconnected = true;
    }

    const onApiUpdateTabColor = index => {
        loadTabColor(index);
    }

    const setTabLineColor = (tab, color) => {
        if (tab) {
            if (null !== color) {
                color = '#' + Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
            } else {
                color = '';
            }

            if (color.length) {
                if (!tab.get('active')) {
                    color = '0px 4px 0 ' + Common.Utils.RGBColor(color).toRGBA(0.7) + ' inset';
                } else {
                    color = '0px 4px 0 ' + color + ' inset';
                }

                tab.get('el').find('a').css('box-shadow', color);
            } else {
                tab.get('el').find('a').css('box-shadow', '');
            }
        }
    };

    const updateTabsColors = () => {
        const api = Common.EditorApi.get();

        sheets.forEach(model => {
            setTabLineColor(model, api.asc_getWorksheetTabColor(model.get('index')));
        });
    };

    const onTabClicked = i => {
        const model = sheets.at(i);

        const api = Common.EditorApi.get();
        api.asc_showWorksheet(model.index);
        sheets.setActiveWorksheet(i);
    };

    const onAddTabClicked = () => {
        const api = Common.EditorApi.get();
        api.asc_closeCellEditor();

        const createSheetName = () => {
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

        api.asc_addWorksheet(createSheetName());
    };

    const onTabClick = i => {
        const api = Common.EditorApi.get();
        const model = sheets.at(i);
        const $$ = Dom7;

        let opened = $$('.document-menu.modal-in').length;
        f7.popover.close('.document-menu.modal-in');

        if (i == api.asc_getActiveWorksheetIndex()) {
            if (!opened) {
                if (isEdit && !isDisconnected) {
                    api.asc_closeCellEditor();
                    // this.statusbar.showTabContextMenu(this._getTabMenuItems(model), model);
                }
            }
        } else {
            // this.api.asc_showWorksheet(i);
            // this.statusbar.setActiveTab(index);
            api.asc_showWorksheet(model.index);
            sheets.setActiveWorksheet(i);
            // Common.NotificationCenter.trigger('sheet:active', sdkindex);
        }

    }

    return (
        <Fragment>
            <StatusbarView onTabClick={onTabClick} onTabClicked={onTabClicked} onAddTabClicked={onAddTabClicked} />
            <TabContextMenu />
        </Fragment>
    )
});

export default Statusbar;