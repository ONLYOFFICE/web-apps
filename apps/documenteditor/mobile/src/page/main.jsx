import React, { Component } from 'react';
import { f7 } from 'framework7-react';
import { Page, View, Navbar, NavLeft, NavRight, Link, Icon } from 'framework7-react';

import EditOptions from '../view/edit/Edit';
import AddOptions from '../view/add/Add';
import Settings from '../view/settings/Settings';
import Collaboration from '../../../../common/mobile/lib/view/collaboration/Collaboration.jsx'
import { Device } from '../../../../common/mobile/utils/device'
import { Search, SearchSettings } from '../controller/Search';
import { ContextMenu, idContextMenuElement } from '../controller/ContextMenu';

export default class MainPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editOptionsVisible: false,
            addOptionsVisible: false,
            settingsVisible: false,
            collaborationVisible: false,
        };
    }

    handleClickToOpenOptions = opts => {
        f7.popover.close(idContextMenuElement, false);

        this.setState(state => {
            if ( opts == 'edit' )
                return {editOptionsVisible: true};
            else if ( opts == 'add' )
                return {addOptionsVisible: true};
            else if ( opts == 'settings' )
                return {settingsVisible: true};
            else if ( opts == 'coauth' )
                return {collaborationVisible: true};
        });
    };

    handleOptionsViewClosed = opts => {
        (async () => {
            await 1 && this.setState(state => {
                if ( opts == 'edit' )
                    return {editOptionsVisible: false};
                else if ( opts == 'add' )
                    return {addOptionsVisible: false};
                else if ( opts == 'settings' )
                    return {settingsVisible: false};
                else if ( opts == 'coauth' )
                    return {collaborationVisible: false};
            })
        })();
    };

  render() {
      return (
          <Page name="home">
              {/* Top Navbar */}
              <Navbar id='editor-navbar'>
                  <div slot="before-inner" className="main-logo"><Icon icon="icon-logo"></Icon></div>
                  <NavLeft>
                      <Link icon='icon-undo'></Link>
                      <Link icon='icon-redo'></Link>
                  </NavLeft>
                  <NavRight>
                      <Link id='btn-edit' icon='icon-edit-settings' href={false} onClick={e => this.handleClickToOpenOptions('edit')}></Link>
                      <Link id='btn-add' icon='icon-plus' href={false} onClick={e => this.handleClickToOpenOptions('add')}></Link>
                      { Device.phone ? null : <Link icon='icon-search' searchbarEnable='.searchbar' href={false}></Link> }
                      <Link id='btn-coauth' href={false} icon='icon-collaboration' onClick={e => this.handleClickToOpenOptions('coauth')}></Link>
                      <Link id='btn-settings' icon='icon-settings' href={false} onClick={e => this.handleClickToOpenOptions('settings')}></Link>
                  </NavRight>
                  { Device.phone ? null : <Search /> }
              </Navbar>
              {/* Page content */}
              <View id="editor_sdk">

              </View>
              {
                  Device.phone ? null : <SearchSettings />
              }
              {
                  !this.state.editOptionsVisible ? null :
                      <EditOptions onclosed={this.handleOptionsViewClosed.bind(this, 'edit')} />
              }
              {
                  !this.state.addOptionsVisible ? null :
                      <AddOptions onclosed={this.handleOptionsViewClosed.bind(this, 'add')} />
              }
              {
                  !this.state.settingsVisible ? null :
                      <Settings onclosed={this.handleOptionsViewClosed.bind(this, 'settings')} />
              }
              {
                  !this.state.collaborationVisible ? null :
                      <Collaboration onclosed={this.handleOptionsViewClosed.bind(this, 'coauth')} />
              }
              <ContextMenu />
          </Page>
      )
  }
};