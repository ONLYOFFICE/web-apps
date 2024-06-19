import React, { useContext, useEffect } from 'react';
import { View, Popup, Popover, f7 } from 'framework7-react';
import { Device } from '../../../../../common/mobile/utils/device';
import { AddImageController } from "../../controller/add/AddImage";
import { PageImageLinkSettings } from "./AddImage";
import { PageAddTable } from "./AddOther";
import { AddLinkController } from "../../controller/add/AddLink";
import { PageTypeLink, PageLinkTo } from "./AddLink";
import { EditLinkController } from '../../controller/edit/EditLink';
import { ObservablePageEditTypeLink, ObservablePageEditLinkTo } from '../../view/edit/EditLink';
import AddingPage from './AddingPage';
import { MainContext } from '../../page/main';

const routes = [
    {
        path: '/adding-page/',
        component: AddingPage,
    },
    // Image
    {
        path: '/add-image-from-url/',
        component: PageImageLinkSettings
    },

    // Other
    {
        path: '/add-table/',
        component: PageAddTable
    },
    {
        path: '/add-link/',
        component: AddLinkController
    },
    {
        path: '/add-link-type/',
        component: PageTypeLink
    },
    {
        path: '/add-link-to/',
        component: PageLinkTo
    },
    {
        path: '/edit-link/',
        component: EditLinkController
    },
    {
        path: '/edit-link-type/',
        component: ObservablePageEditTypeLink
    },
    {
        path: '/edit-link-to/',
        component: ObservablePageEditLinkTo
    },

    // Image 

    {
        path: '/add-image/',
        component: AddImageController
    }
];

routes.forEach(route => {
    route.options = {
        ...route.options,
        transition: 'f7-push'
    };
});

const AddView = () => {
    const mainContext = useContext(MainContext);

    useEffect(() => {
        if(Device.phone) {
            f7.popup.open('.add-popup');
        } else {
            f7.popover.open('#add-popover', '#btn-add');
        }
    }, []);

    return (
        !Device.phone ?
            <Popover id="add-popover" className="popover__titled" closeByOutsideClick={false} onPopoverClosed={() => mainContext.closeOptions('add')}>
                <View routes={routes} url='/adding-page/' style={{ height: '410px' }}>
                    <AddingPage />
                </View>
            </Popover> :
            <Popup className="add-popup" onPopupClosed={() => mainContext.closeOptions('add')}>
                <View routes={routes} url='/adding-page/'>
                    <AddingPage />
                </View>
            </Popup>
    )
}

export default AddView;