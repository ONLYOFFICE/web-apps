
import {storeDocumentSettings} from './documentSettings';
import {storeFocusObjects} from "./focusObjects";
import {storeUsers} from '../../../../common/mobile/lib/store/users';
import {storeTextSettings} from "./textSettings";
import {storeParagraphSettings} from "./paragraphSettings";
import {storeShapeSettings} from "./shapeSettings";
import {storeImageSettings} from "./imageSettings";
import {storeTableSettings} from "./tableSettings";
import {storeChartSettings} from "./chartSettings";
import {storeDocumentInfo} from "./documentInfo";
import {storeApplicationSettings} from './applicationSettings';

export const stores = {
    storeFocusObjects: new storeFocusObjects(),
    storeDocumentSettings: new storeDocumentSettings(),
    users: new storeUsers(),
    storeTextSettings: new storeTextSettings(),
    storeParagraphSettings: new storeParagraphSettings(),
    storeShapeSettings: new storeShapeSettings(),
    storeChartSettings: new storeChartSettings(),
    storeImageSettings: new storeImageSettings(),
    storeTableSettings: new storeTableSettings(),
    storeDocumentInfo: new storeDocumentInfo(),
    storeApplicationSettings: new storeApplicationSettings()
};

