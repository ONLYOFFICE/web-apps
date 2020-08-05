import React, { Component } from 'react';
import {
  Page,
  View,
  Navbar,
  NavLeft,
  NavTitle,
  NavTitleLarge,
  NavRight,
  Link,
  Toolbar,
  Block,
  BlockTitle,
  List,
  ListItem,
  Row,
  Col,
  Button,
  Icon, Popup
} from 'framework7-react';

import EditPopup from '../components/edit/Edit.jsx';
import SettingsPopup from '../components/settings/Settings.jsx';

export default class Home extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    console.log(this.$f7router)
    return (
        <Page name="home">
          {/* Top Navbar */}
          <Navbar>
            <div slot="before-inner" className="main-logo"><Icon icon="icon-logo"></Icon></div>
            <NavLeft>
              <Link>Undo</Link>
              <Link>Redu</Link>
            </NavLeft>
            <NavRight>
              <Link href={false} popupOpen=".edit-popup">Edit</Link>
              <Link href={false} popupOpen=".settings-popup">Settings</Link>
            </NavRight>
          </Navbar>
          {/* Page content */}
          <View id="editor_sdk">
          </View>
          <EditPopup />
          <SettingsPopup />
        </Page>
    )
  }
};