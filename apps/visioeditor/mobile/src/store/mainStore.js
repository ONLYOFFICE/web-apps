
import {storeAppOptions} from './appOptions';
import {storeUsers} from '../../../../common/mobile/lib/store/users';
import {storeApplicationSettings} from './applicationSettings';
import {storeVisioInfo} from './visioInfo';
import {storeToolbarSettings} from "./toolbar";
import { storeThemes } from '../../../../common/mobile/lib/store/themes';

export const stores = {
    storeAppOptions: new storeAppOptions(),
    users: new storeUsers(),
    storeApplicationSettings: new storeApplicationSettings(),
    storeVisioInfo: new storeVisioInfo(),
    storeToolbarSettings: new storeToolbarSettings(),
    storeThemes: new storeThemes()
};

