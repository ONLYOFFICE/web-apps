
import React, { useEffect } from 'react';
import { f7 } from 'framework7-react';
import StatusbarView from '../view/Statusbar';
import { inject } from 'mobx-react';

const Statusbar = inject('sheets')(props => {
    const {sheets} = props;

    useEffect(() => {
        const on_api_created = api => {
            api.asc_registerCallback('asc_onSheetsChanged', onApiSheetsChanged.bind(api));
        };

        const on_main_view_click = e => {
            // f7.popover.close('.document-menu.modal-in');
        };

        Common.Notifications.on('document:ready', onApiSheetsChanged);
        Common.Notifications.on('engineCreated', on_api_created);

        $$('.view-main').on('click', on_main_view_click);

        return () => {
            Common.Notifications.off('document:ready', onApiSheetsChanged);
            Common.Notifications.off('engineCreated', on_api_created);

            $$('.view-main').off('click', on_main_view_click);
        };
    }, []);

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

        // this.updateTabsColors();
    };

    const onTabClicked = i => {
        const model = sheets.at(i);

        const api = Common.EditorApi.get();
        api.asc_showWorksheet(model.index);
        sheets.setActiveWorksheet(i);

        Common.Notifications.trigger('sheet:active', model.index);
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

    return <StatusbarView onTabClicked={onTabClicked} onAddTabClicked={onAddTabClicked} />
});

export default Statusbar;