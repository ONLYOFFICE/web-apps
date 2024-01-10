import {storeFocusObjects} from "./focusObjects";
import {storeUsers} from '../../../../common/mobile/lib/store/users';
import {storeFunctions} from './functions';
import {storePalette} from "./palette";
import {storeTextSettings} from "./textSettings";
import {storeApplicationSettings} from "./applicationSettings";
import {storeShapeSettings} from "./shapeSettings";
import {storeCellSettings} from "./cellSettings";
import {storeSpreadsheetInfo} from "./spreadsheetInfo";
import {storeAppOptions} from "./appOptions";
// import {storeImageSettings} from "./imageSettings";
// import {storeTableSettings} from "./tableSettings";
import {storeChartSettings} from "./chartSettings";
import {storeSpreadsheetSettings} from "./spreadsheetSettings";
import {storeReview} from '../../../../common/mobile/lib/store/review';
import {storeComments} from "../../../../common/mobile/lib/store/comments";
import {storeToolbarSettings} from "./toolbar";
import { storeThemes } from '../../../../common/mobile/lib/store/themes';
import { storeVersionHistory } from "../../../../common/mobile/lib/store/versionHistory";
import {storeWorksheets} from "./sheets";

export const stores = {
    storeFocusObjects: new storeFocusObjects(),
    storeSpreadsheetSettings: new storeSpreadsheetSettings(),
    storeApplicationSettings: new storeApplicationSettings(),
    users: new storeUsers(),
    storeFunctions: new storeFunctions(),
    storeTextSettings: new storeTextSettings(),
    storeSpreadsheetInfo: new storeSpreadsheetInfo(),
    storeAppOptions: new storeAppOptions(),
    // storeParagraphSettings: new storeParagraphSettings(),
    storeShapeSettings: new storeShapeSettings(),
    storeChartSettings: new storeChartSettings(),
    storePalette: new storePalette(),
    storeCellSettings: new storeCellSettings(),
    storeReview: new storeReview(),
    // storeImageSettings: new storeImageSettings(),
    // storeTableSettings: new storeTableSettings()
    storeComments: new storeComments(),
    storeVersionHistory: new storeVersionHistory(),
    storeToolbarSettings: new storeToolbarSettings(),
    storeWorksheets: new storeWorksheets(),
    storeThemes: new storeThemes()
};

