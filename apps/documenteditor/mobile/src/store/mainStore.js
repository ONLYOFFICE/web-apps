
import {storeDocumentSettings} from './documentSettings'
import {storeFocusObjects} from "./focusObjects";
import {storeUsers} from '../../../../common/mobile/lib/store/users'

export const stores = {
    storeFocusObjects: new storeFocusObjects(),
    storeDocumentSettings: new storeDocumentSettings(),
    users: new storeUsers()
};

