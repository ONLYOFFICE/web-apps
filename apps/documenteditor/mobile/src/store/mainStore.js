
import {storeDocumentSettings} from './documentSettings';
import {storeFocusObjects} from "./focusObjects";
import {storeUsers} from '../../../../common/mobile/lib/store/users';
import {storeTextSettings} from "./textSettings";
import {storeParagraphSettings} from "./paragraphSettings";
import {storeShapeSettings} from "./shapeSettings";
import {storeImageSettings} from "./imageSettings";
import {storeTableSettings} from "./tableSettings";

export const stores = {
    storeFocusObjects: new storeFocusObjects(),
    storeDocumentSettings: new storeDocumentSettings(),
    users: new storeUsers(),
    storeTextSettings: new storeTextSettings(),
    storeParagraphSettings: new storeParagraphSettings(),
    storeShapeSettings: new storeShapeSettings(),
    storeImageSettings: new storeImageSettings(),
    storeTableSettings: new storeTableSettings()
};

