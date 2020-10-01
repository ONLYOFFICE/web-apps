import React, { Component } from 'react';
import { Page, View, Navbar, NavLeft, NavRight, Link, Icon } from 'framework7-react';

import EditSheet from '../components/edit/Edit.jsx';
import SettingsPopup from '../components/settings/Settings.jsx';
import { CollaborationPopover, CollaborationSheet } from '../../../../common/mobile/lib/view/Collaboration.jsx'

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
              <Link href={false} sheetOpen=".edit__sheet">Edit</Link>
              {/*<Link href={false} popoverOpen=".collab__popover">Users</Link>*/}
              <Link href={false} sheetOpen=".collab__sheet">Users</Link>
              <Link href={false} popupOpen=".settings-popup">Settings</Link>
            </NavRight>
          </Navbar>
          {/* Page content */}
          <View id="editor_sdk">
          </View>
          <EditSheet />
          <SettingsPopup />
          <CollaborationPopover />
          <CollaborationSheet />
        </Page>
    )
  }
};