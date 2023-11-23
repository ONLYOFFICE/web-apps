import React from 'react';

import { App, View } from 'framework7-react';
import { f7ready } from 'framework7-react';

import '../../../../common/Analytics.js';

import '../../../../common/Gateway.js';
import '../../../../common/main/lib/util/utils.js';

import routes from '../router/routes';

import Notifications from '../../../../common/mobile/utils/notifications.js'
import {MainController} from '../controller/Main';
import {Device} from '../../../../common/mobile/utils/device'
import {Themes} from '../../../../common/mobile/lib/controller/Themes'

const f7params = {
    name: 'Desktop Editor', // App name
    theme: 'auto', // Automatic theme detection
    routes: routes, // App routes
};

export default class extends React.Component {
    constructor(props) {
        super(props);

        Common.Notifications = new Notifications();
        // Themes.init();
    }

    render() {
        return (
            <App { ...f7params } className={'app-layout'} >
                {/* Your main view, should have "view-main" class */}
                <View main className="safe-areas" url="/" />
                <MainController />
            </App>
        )
    }

    componentDidMount() {
        f7ready(f7 => {
        // Call F7 APIs here
            Device.initDom();
        });
    }
}
