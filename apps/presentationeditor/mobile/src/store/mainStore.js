
import {storeAppOptions} from './appOptions';
// import {storeDocumentSettings} from './documentSettings';
import {storeFocusObjects} from "./focusObjects";
import {storeUsers} from '../../../../common/mobile/lib/store/users';
import {storeApplicationSettings} from './applicationSettings';
import {storePresentationInfo} from './presentationInfo';
import {storePresentationSettings} from './presentationSettings';
import { storeLayout } from './layout';
import { storeTransition } from './transition';
import { storeTheme } from './theme';
import { storeSlideStyle } from './styleSlide';
import { storePalette } from './palette';
// import {storeTextSettings} from "./textSettings";
// import {storeParagraphSettings} from "./paragraphSettings";
// import {storeShapeSettings} from "./shapeSettings";
// import {storeImageSettings} from "./imageSettings";
// import {storeTableSettings} from "./tableSettings";
// import {storeChartSettings} from "./chartSettings";

export const stores = {
    storeAppOptions: new storeAppOptions(),
    storeFocusObjects: new storeFocusObjects(),
    // storeDocumentSettings: new storeDocumentSettings(),
    users: new storeUsers(),
    storeApplicationSettings: new storeApplicationSettings(),
    storePresentationInfo: new storePresentationInfo(),
    storePresentationSettings: new storePresentationSettings(),
    storeLayout: new storeLayout(),
    storeTransition: new storeTransition(),
    storeTheme: new storeTheme(),
    storeSlideStyle: new storeSlideStyle(),
    storePalette: new storePalette()
    // storeTextSettings: new storeTextSettings(),
    // storeParagraphSettings: new storeParagraphSettings(),
    // storeShapeSettings: new storeShapeSettings(),
    // storeChartSettings: new storeChartSettings(),
    // storeImageSettings: new storeImageSettings(),
    // storeTableSettings: new storeTableSettings()
};

