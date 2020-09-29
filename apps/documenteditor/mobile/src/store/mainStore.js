
import {storeDocumentSettings} from './documentSettings'
import {storeUsers} from '../../../../common/mobile/lib/store/users'

export const stores = {
    storeDocumentSettings: new storeDocumentSettings(),
    users: new storeUsers()
};

