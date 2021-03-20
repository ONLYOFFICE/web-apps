
import React, { Fragment, useEffect } from 'react';
import {StatusbarView, TabContextMenu} from '../view/Statusbar';
import { inject } from 'mobx-react';
import { f7 } from 'framework7-react';
import { Dom7 } from 'framework7';
import { useTranslation } from 'react-i18next';
import ContextMenuController from '../../../../common/mobile/lib/controller/ContextMenu';
import { idContextMenuElement } from '../../../../common/mobile/lib/view/ContextMenu';
import { Device } from '../../../../common/mobile/utils/device';

// @inject (stores => ({
//     isEdit: stores.storeAppOptions.isEdit,
//     sheets: stores.sheets,
// }))
// class Statusbar extends ContextMenuController {
//     constructor(props) {
//         super(props);

//         this.loadTabColor = this.loadTabColor.bind(this);
//         this.onTabClick = this.onTabClick.bind(this);
//         this.onTabClicked = this.onTabClicked.bind(this);
//         this.onApiUpdateTabColor = this.onApiUpdateTabColor.bind(this);
//         this.onApiSheetsChanged = this.onApiSheetsChanged.bind(this);
//         this.onApiDisconnect = this.onApiDisconnect.bind(this);
//     };

//     onDocumentReady() {
//         super.onDocumentReady();

//         const api = Common.EditorApi.get();
//         api.asc_registerCallback('asc_onUpdateTabColor', this.onApiUpdateTabColor);
//         api.asc_registerCallback('asc_onSheetsChanged', this.onApiSheetsChanged);
//         api.asc_registerCallback('asc_onCoAuthoringDisconnect', this.onApiDisconnect);
//     };

//     componentWillUnmount() {
//         super.componentWillUnmount();

//         const api = Common.EditorApi.get();
//         api.asc_registerCallback('asc_onUpdateTabColor', this.onApiUpdateTabColor);
//         api.asc_registerCallback('asc_onSheetsChanged', this.onApiSheetsChanged);
//         api.asc_registerCallback('asc_onCoAuthoringDisconnect', this.onApiDisconnect);
//     };

//     //     const onWorkbookLocked = locked => {
//     //         this.statusbar.$btnAddTab.toggleClass('disabled', locked);
//     //         return;

//     //         this.statusbar.tabbar[locked?'addClass':'removeClass']('coauth-locked');
//     //         this.statusbar.btnAddWorksheet.setDisabled(locked || this.statusbar.rangeSelectionMode==Asc.c_oAscSelectionDialogType.Chart ||
//     //                                                              this.statusbar.rangeSelectionMode==Asc.c_oAscSelectionDialogType.FormatTable);
//     //         var item, i = this.statusbar.tabbar.getCount();
//     //         while (i-- > 0) {
//     //             item = this.statusbar.tabbar.getAt(i);
//     //             if (item.sheetindex >= 0) {
//     // //              if (locked) item.reorderable = false;
//     // //              else item.reorderable = !this.api.asc_isWorksheetLockedOrDeleted(item.sheetindex);
//     //             } else {
//     //                 item.disable(locked);
//     //             }
//     //         }
//     //     };

//     //     const onWorksheetLocked = (index, locked) => {
//     //         let model = sheets.findWhere({index: index});
//     //         if(model && model.get('locked') != locked)
//     //             model.set('locked', locked);
//     //     };

//     onApiSheetsChanged() {
//         console.log('on api sheets changed');

//         const {sheets} = this.props;
//         const api = Common.EditorApi.get();
//         const sheets_count = api.asc_getWorksheetsCount();
//         const active_index = api.asc_getActiveWorksheetIndex();

//         let i = -1,  items = [];

//         while ( ++i < sheets_count ) {
//             const tab = {
//                 index       : i,
//                 active      : active_index == i,
//                 name        : api.asc_getWorksheetName(i),
//                 locked      : api.asc_isWorksheetLockedOrDeleted(i),
//                 hidden      : api.asc_isWorksheetHidden(i),
//                 color       : api.asc_getWorksheetTabColor(i)
//             };

//             items.push(tab);
//         }

//         sheets.reset(items);
//         // this.hiddensheets.reset(hiddentems);
//         // updateTabsColors();
//     };

//     loadTabColor(sheetindex) {
//         const api = Common.EditorApi.get();
//         const {sheets} = this.props;
//         let tab = sheets.findWhere({index: sheetindex});

//         if (tab) {
//             this.setTabLineColor(tab, api.asc_getWorksheetTabColor(sheetindex));
//         }
        
//     };

//     onApiDisconnect() {
//         this.isDisconnected = true;
//     };

//     onApiUpdateTabColor(index) {
//         this.loadTabColor(index);
//     };

//     setTabLineColor(tab, color) {
//         if (tab) {
//             if (null !== color) {
//                 color = '#' + Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
//             } else {
//                 color = '';
//             }

//             if (color.length) {
//                 if (!tab.get('active')) {
//                     color = '0px 4px 0 ' + Common.Utils.RGBColor(color).toRGBA(0.7) + ' inset';
//                 } else {
//                     color = '0px 4px 0 ' + color + ' inset';
//                 }

//                 tab.get('el').find('a').css('box-shadow', color);
//             } else {
//                 tab.get('el').find('a').css('box-shadow', '');
//             }
//         }
//     };

//     updateTabsColors() {
//         const api = Common.EditorApi.get();
//         const {sheets} = this.props;

//         sheets.forEach(model => {
//             setTabLineColor(model, api.asc_getWorksheetTabColor(model.get('index')));
//         });
//     };

//     onTabClicked(i) {
//         const {sheets} = this.props;
//         const model = sheets.at(i);
//         const api = Common.EditorApi.get();

//         api.asc_showWorksheet(model.index);
//         sheets.setActiveWorksheet(i);
//     };

//     onAddTabClicked() {
//         const api = Common.EditorApi.get();
//         api.asc_closeCellEditor();

//         const createSheetName = () => {
//             let items = [], wc = api.asc_getWorksheetsCount();
//             while (wc--) {
//                 items.push(api.asc_getWorksheetName(wc).toLowerCase());
//             }

//             let index = 0, name;
//             while(++index < 1000) {
//                 name = /*this.strSheet*/ 'Sheet' + index;
//                 if (items.indexOf(name.toLowerCase()) < 0) break;
//             }

//             return name;
//         };

//         api.asc_addWorksheet(createSheetName());
//     };

//     _getTabMenuItems(model) {
//         const api = Common.EditorApi.get();
//         let wbLocked = api.asc_isWorkbookLocked();
//         let shLocked = api.asc_isWorksheetLockedOrDeleted(model.index);

//         let items = [{
//                 caption: _t.textDuplicate,
//                 event: 'copy',
//                 locked: wbLocked || shLocked
//             },{
//                 caption: _t.textDelete,
//                 event: 'del',
//                 locked: wbLocked || shLocked
//             },{
//                 caption: _t.textRename,
//                 event: 'ren',
//                 locked: wbLocked || shLocked
//             },{
//                 caption: _t.textHide,
//                 event: 'hide',
//                 locked: wbLocked || shLocked
//             }];


//         // if (!wbLocked && !shLocked && this.hiddensheets.length) {
//         //     items.push({
//         //         caption: _t.textUnhide,
//         //         event: 'unhide'
//         //     });
//         // }

//         // if (Common.SharedSettings.get('phone') && items.length > 3) {
//         //     this._moreAction = items.slice(2);

//         //     items = items.slice(0, 2);
//         //     items.push({
//         //         caption: this.menuMore,
//         //         event: 'showMore'
//         //     });
//         // }

//         return items;
//     };

//     onTabClick(i) {
//         const api = Common.EditorApi.get();
//         const {sheets} = this.props;
//         const model = sheets.at(i);
//         const $$ = Dom7;

//         let opened = $$('.document-menu.modal-in').length;
//         f7.popover.close('.document-menu.modal-in');

//         if (i == api.asc_getActiveWorksheetIndex()) {
//             if (!opened) {
//                 if (!this.isDisconnected) {
//                     api.asc_closeCellEditor();
//                     // const items = _getTabMenuItems(model);
//                     // this.statusbar.showTabContextMenu(this._getTabMenuItems(model), model);
//                     // f7.popover.open('#idx-tab-context-menu-popover');
//                 }
//             }
//         } else {
//             this.onTabClicked(i);
//             // Common.NotificationCenter.trigger('sheet:active', sdkindex);
//         }
//     }

//     render() {
//         return (
//             <Fragment>
//                 <StatusbarView onTabClick={this.onTabClick} onTabClicked={this.onTabClicked} onAddTabClicked={this.onAddTabClicked} />
//                 <TabContextMenu />
//             </Fragment>
//         );
//     }
// }

const Statusbar = inject('sheets', 'storeAppOptions')(props => {
    const {sheets, storeAppOptions} = props;
    const {t} = useTranslation();
    const _t = t('Statusbar', {returnObjects: true});
    console.log(props);

    let isEdit = storeAppOptions.isEdit;
    let isDisconnected = false;

    useEffect(() => {
        console.log("status bar did mount");

        // Common.Notifications.on('document:ready', onDocumentReady);
        Common.Notifications.on('api:disconnect', onApiDisconnect);
        Common.Notifications.on('engineCreated', api => {
            api.asc_registerCallback('asc_onUpdateTabColor', onApiUpdateTabColor);
            // api.asc_registerCallback('asc_onWorkbookLocked', onWorkbookLocked);
            // api.asc_registerCallback('asc_onWorksheetLocked', onWorksheetLocked);
            api.asc_registerCallback('asc_onSheetsChanged', onApiSheetsChanged.bind(api));
            // api.asc_registerCallback('asc_onCoAuthoringDisconnect', onApiDisconnect);
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

    const _getTabMenuItems = model => {
        const api = Common.EditorApi.get();
        let wbLocked = api.asc_isWorkbookLocked();
        let shLocked = api.asc_isWorksheetLockedOrDeleted(model.index);

        let items = [{
                caption: _t.textDuplicate,
                event: 'copy',
                locked: wbLocked || shLocked
            },{
                caption: _t.textDelete,
                event: 'del',
                locked: wbLocked || shLocked
            },{
                caption: _t.textRename,
                event: 'ren',
                locked: wbLocked || shLocked
            },{
                caption: _t.textHide,
                event: 'hide',
                locked: wbLocked || shLocked
            }];


        // if (!wbLocked && !shLocked && this.hiddensheets.length) {
        //     items.push({
        //         caption: _t.textUnhide,
        //         event: 'unhide'
        //     });
        // }

        // if (Common.SharedSettings.get('phone') && items.length > 3) {
        //     this._moreAction = items.slice(2);

        //     items = items.slice(0, 2);
        //     items.push({
        //         caption: this.menuMore,
        //         event: 'showMore'
        //     });
        // }

        return items;
    };

    const onTabClick = i => {
        const api = Common.EditorApi.get();
        const model = sheets.at(i);
        const $$ = Dom7;

        let opened = $$('.document-menu.modal-in').length;
        f7.popover.close('.document-menu.modal-in');

        // const $targetEl = $$(idCntextMenuTargetElement);
        // console.log($targetEl);

        if (i == api.asc_getActiveWorksheetIndex()) {
            if (!opened) {
                if (!isDisconnected) {
                    api.asc_closeCellEditor();
                    // const items = _getTabMenuItems(model);
                    // this.statusbar.showTabContextMenu(this._getTabMenuItems(model), model);
                    f7.popover.open('#idx-tab-context-menu-popover');
                }
            }
        } else {
            onTabClicked(i);
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