import React, { useContext, useEffect } from 'react';
import { View, Popup, Popover, f7 } from 'framework7-react';
import { Device } from '../../../../../common/mobile/utils/device';
import { PageFunctionGroup, PageFunctionInfo } from "./AddFunction";
import { AddImageController } from "../../controller/add/AddImage";
import { PageImageLinkSettings } from "./AddImage";
import { AddLinkController } from "../../controller/add/AddLink";
import { EditLinkController } from "../../controller/edit/EditLink";
import { PageTypeLink, PageSheet } from "./AddLink";
import { PageEditTypeLink, PageEditSheet } from "../../view/edit/EditLink";
import AddFilterController from "../../controller/add/AddFilter";
import AddingPage from './AddingPage';
import { MainContext } from '../../page/main';

const routes = [
    {
        path: '/adding-page/',
        component: AddingPage,
    },
    // Functions
    {
        path: '/add-function-group/',
        component: PageFunctionGroup
    },
    {
        path: '/add-function-info/',
        component: PageFunctionInfo
    },
    // Image
    {
        path: '/add-image/',
        component: AddImageController
    },
    {
        path: '/add-image-from-url/',
        component: PageImageLinkSettings
    },
    // Link
    {
        path: '/add-link/',
        component: AddLinkController
    },
    {
        path: '/add-link-type/',
        component: PageTypeLink
    },
    {
        path: '/add-link-sheet/',
        component: PageSheet
    },
    {
        path: '/edit-link/',
        component: EditLinkController
    },
    {
        path: '/edit-link-type/',
        component: PageEditTypeLink
    },
    {
        path: '/edit-link-sheet/',
        component: PageEditSheet
    },
    // Other
    {
        path: '/add-sort-and-filter/',
        component: AddFilterController
    }
];

routes.forEach(route => {
    route.options = {
        ...route.options,
        transition: 'f7-push'
    };
});

const AddView = props => {
    const mainContext = useContext(MainContext);

    useEffect(() => {
        if(Device.phone) {
            f7.popup.open('.add-popup');
        } else {
            const targetElem = !props.showOptions || !props.showOptions.button ? '#btn-add' : props.showOptions.button;
            f7.popover.open('#add-popover', targetElem);
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