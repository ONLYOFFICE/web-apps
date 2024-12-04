// Import React and ReactDOM
import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';

// Import Framework7
import Framework7 from 'framework7/lite-bundle';
import { Dom7 } from 'framework7/lite-bundle';
window.$$ = Dom7;

// Import Framework7-React Plugin
import Framework7React from 'framework7-react';

import jQuery from 'jquery';
window.jQuery = jQuery;
window.$ = jQuery;

// Import Framework7 or Framework7-RTL Styles

// Import App Custom Styles
import('./less/app.less');

// Import App Component
import App from './page/app.jsx';
import { I18nextProvider } from 'react-i18next';
import i18n from './lib/i18n.js';

import { Provider } from 'mobx-react';
import { stores } from './store/mainStore.js';
// import { LocalStorage } from '../../../common/mobile/utils/LocalStorage';

const container = document.getElementById('app');
const root = createRoot(container); 

// Init F7 React Plugin
Framework7.use(Framework7React);

// Mount React App
root.render(
    <I18nextProvider i18n={i18n}>
        <Provider {...stores}>
            {/*<Suspense fallback="loading...">*/}
                <App />
            {/*</Suspense>*/}
        </Provider>
    </I18nextProvider>
);
