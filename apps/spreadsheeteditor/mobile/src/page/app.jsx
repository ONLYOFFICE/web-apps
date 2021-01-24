import React from 'react';

import {App,Views,View,Navbar,NavLeft,NavRight,Link} from 'framework7-react';
import { f7ready } from 'framework7-react';

import routes from '../router/routes.js';

import '../../../../common/Gateway.js';
import '../../../../common/main/lib/util/utils.js';
import Notifications from '../../../../common/mobile/utils/notifications.js'
import {MainController} from '../controller/Main';
import {Device} from '../../../../common/mobile/utils/device'
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
    }

    render() {
        return (
            <App { ...f7params } >
                {/* Your main view, should have "view-main" class */}
                <View main className="safe-areas" url="/">
                    <MainController />
                </View>
            </App>
        )
    }

    componentDidMount() {
        f7ready(f7 => {
            Device.initDom();
        });
    }
}
