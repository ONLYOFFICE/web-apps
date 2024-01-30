
import React from 'react';

import {App,Views,View,Navbar,NavLeft,NavRight,Link} from 'framework7-react';
import { f7ready } from 'framework7-react';

import '../../../../common/Analytics.js';

import '../../../../common/Gateway.js';

import routes from '../router/routes.js';

import '../../../../common/main/lib/util/utils.js';
import '../../../../common/main/lib/util/LanguageInfo.js';
import {LocalStorage} from '../../../../common/mobile/utils/LocalStorage.mjs';
import Notifications from '../../../../common/mobile/utils/notifications.js';
import {MainController} from '../controller/Main';
import {Device} from '../../../../common/mobile/utils/device';
import CellEditor from '../controller/CellEditor';

const f7params = {
    name: 'Spreadsheet Editor', // App name
    theme: 'auto', // Automatic theme detection

    routes: routes, // App routes
};

export default class extends React.Component {
    constructor() {
        super();
       
        Common.Notifications = new Notifications();
        Common.localStorage = LocalStorage;
    }

    render() {
        return (
            <App { ...f7params } className={'app-layout'}>
                {/* Your main view, should have "view-main" class */}
                <View main className="safe-areas" url="/" />
                <MainController />
            </App>
        )
    }

    componentDidMount() {
        f7ready(f7 => {
            Device.initDom();
        });
    }
}
