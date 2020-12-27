import React from 'react';

import {App,Panel,Views,View,Popup,Page,Navbar,Toolbar,NavRight,Link,Block,BlockTitle,List,ListItem,ListInput,ListButton,BlockFooter} from 'framework7-react';

import routes from '../js/routes';

import '../../../../common/Gateway.js';
import '../../../../common/main/lib/util/utils.js';
import Notifications from '../../../../common/mobile/utils/notifications.js'
import {MainController} from '../controller/Main';
import {Device} from '../../../../common/mobile/utils/device'

export default class extends React.Component {
  constructor() {
    super();

    this.state = {
      // Framework7 Parameters
      f7params: {
        name: 'Desktop Editor', // App name
        theme: 'auto', // Automatic theme detection

        // App routes
        routes: routes,
      },
    }

      Common.Notifications = new Notifications();
  }
  render() {
    return (
      <App params={ this.state.f7params } >

        {/* Your main view, should have "view-main" class */}
        <View main className="safe-areas" url="/" />
          <MainController />
      </App>
    )
  }

    componentDidMount() {
        this.$f7ready((f7) => {
        // Call F7 APIs here
            Device.initDom();
        });
    }
}
