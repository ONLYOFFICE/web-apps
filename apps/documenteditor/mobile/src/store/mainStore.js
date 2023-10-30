
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
import {storeLinkSettings} from './linkSettings';
import {storeApplicationSettings} from './applicationSettings';
import {storeAppOptions} from "./appOptions";
import {storePalette} from "./palette";
import {storeReview} from '../../../../common/mobile/lib/store/review';
import {storeComments} from "../../../../common/mobile/lib/store/comments";
import {storeToolbarSettings} from "./toolbar";
import { storeNavigation } from './navigation';
import { storeThemes } from '../../../../common/mobile/lib/store/themes';
import { storeVersionHistory } from '../../../../common/mobile/lib/store/versionHistory';

export const stores = {
    storeAppOptions: new storeAppOptions(),
    storeFocusObjects: new storeFocusObjects(),
    storeDocumentSettings: new storeDocumentSettings(),
    users: new storeUsers(),
    storeTextSettings: new storeTextSettings(),
    storeLinkSettings: new storeLinkSettings(),
    storeParagraphSettings: new storeParagraphSettings(),
    storeShapeSettings: new storeShapeSettings(),
    storeChartSettings: new storeChartSettings(),
    storeImageSettings: new storeImageSettings(),
    storeTableSettings: new storeTableSettings(),
    storeDocumentInfo: new storeDocumentInfo(),
    storeApplicationSettings: new storeApplicationSettings(),
    storePalette: new storePalette(),
    storeReview: new storeReview(),
    storeComments: new storeComments(),
    storeToolbarSettings: new storeToolbarSettings(),
    storeNavigation: new storeNavigation(),
    storeThemes: new storeThemes(),
    storeVersionHistory: new storeVersionHistory()
};

