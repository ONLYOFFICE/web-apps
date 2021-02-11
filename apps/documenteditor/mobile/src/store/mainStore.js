
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
import {storeAppOptions} from "./appOptions";
import {storePalette} from "./palette";
import {storeReview} from "./review";

export const stores = {
    storeAppOptions: new storeAppOptions(),
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
    storeApplicationSettings: new storeApplicationSettings(),
    storePalette: new storePalette(),
    storeReview: new storeReview()
};

