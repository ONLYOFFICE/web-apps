import React from 'react';

import {App,Panel,Views,View,Popup,Page,Navbar,Toolbar,NavRight,Link,Block,BlockTitle,List,ListItem,ListInput,ListButton,BlockFooter} from 'framework7-react';

import routes from '../js/routes';

import '../../../../common/Gateway.js';
import '../../../../common/main/lib/util/utils.js';
import Notifications from '../../../../common/mobile/utils/notifications.js'
import MainController from '../controller/Main';
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

        {/* Left panel with cover effect when hidden */}
        <Panel left cover themeDark visibleBreakpoint={960}>
          <View>
            <Page>
              <Navbar title="Left Panel"/>
              <BlockTitle>Left View Navigation</BlockTitle>
              <List>
                <ListItem link="/left-page-1/" title="Left Page 1"/>
                <ListItem link="/left-page-2/" title="Left Page 2"/>
              </List>
            </Page>
          </View>
        </Panel>


        {/* Right panel with reveal effect*/}
        <Panel right reveal themeDark>
          <View>
            <Page>
              <Navbar title="Right Panel"/>
              <Block>Right panel content goes here</Block>
            </Page>
          </View>
        </Panel>


        {/* Your main view, should have "view-main" class */}
        <View main className="safe-areas" url="/" />
          <MainController ref="mainController" />

        {/* Popup */}
        <Popup id="my-popup">
          <View>
            <Page>
              <Navbar title="Popup">
                <NavRight>
                  <Link popupClose>Close</Link>
                </NavRight>
              </Navbar>
              <Block>
                <p>Popup content goes here.</p>
              </Block>
            </Page>
          </View>
        </Popup>
      </App>
    )
  }

    componentDidMount() {
        this.$f7ready((f7) => {
        // Call F7 APIs here
            Device.initDom();
        });

        this.refs.mainController.initSdk();
    }
}
