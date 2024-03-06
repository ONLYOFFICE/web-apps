import React from 'react';

import {App,Panel,Views,View,Popup,Page,Navbar,Toolbar,NavRight,Link,Block,BlockTitle,List,ListItem,ListInput,ListButton,BlockFooter} from 'framework7-react';
import { f7ready } from 'framework7-react';

import '../../../../common/Analytics.js';

import '../../../../common/Gateway.js';
import '../../../../common/main/lib/util/utils.js';

import routes from '../router/routes.js';

import Notifications from '../../../../common/mobile/utils/notifications.js'
import {MainController} from '../controller/Main';
import {Device} from '../../../../common/mobile/utils/device'

    // Framework7 Parameters
const f7params = {
    name: 'Presentation Editor', // App name
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
