
// import {storeDocumentSettings} from './documentSettings';
// import {storeFocusObjects} from "./focusObjects";
import {storeUsers} from '../../../../common/mobile/lib/store/users';
import {storeWorksheets} from './sheets';
// import {storeTextSettings} from "./textSettings";
// import {storeParagraphSettings} from "./paragraphSettings";
// import {storeShapeSettings} from "./shapeSettings";
// import {storeImageSettings} from "./imageSettings";
// import {storeTableSettings} from "./tableSettings";
// import {storeChartSettings} from "./chartSettings";

export const stores = {
    // storeFocusObjects: new storeFocusObjects(),
    // storeDocumentSettings: new storeDocumentSettings(),
    users: new storeUsers(),
    sheets: new storeWorksheets()
    // storeTextSettings: new storeTextSettings(),
    // storeParagraphSettings: new storeParagraphSettings(),
    // storeShapeSettings: new storeShapeSettings(),
    // storeChartSettings: new storeChartSettings(),
    // storeImageSettings: new storeImageSettings(),
    // storeTableSettings: new storeTableSettings()
};

