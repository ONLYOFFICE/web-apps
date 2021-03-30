
import React, { Component } from 'react';
import { f7 } from 'framework7-react';
import { Page, View } from 'framework7-react';
import { inject } from "mobx-react";

import EditOptions from '../view/edit/Edit';
import AddOptions from '../view/add/Add';
import Settings from '../view/settings/Settings';
import Collaboration from '../../../../common/mobile/lib/view/collaboration/Collaboration.jsx'
import { Device } from '../../../../common/mobile/utils/device'
import { Search, SearchSettings } from '../controller/Search';
import ContextMenu from '../controller/ContextMenu';
import { Toolbar } from "../controller/Toolbar";

export default class MainPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editOptionsVisible: false,
            addOptionsVisible: false,
            addShowOptions: null,
            settingsVisible: false,
            collaborationVisible: false
        };
    }

    handleClickToOpenOptions = (opts, showOpts) => {
        ContextMenu.closeContextMenu();

        this.setState(state => {
            if ( opts == 'edit' )
                return {editOptionsVisible: true};
            else if ( opts == 'add' )
                return {
                    addOptionsVisible: true,
                    addShowOptions: showOpts
                };
            else if ( opts == 'settings' )
                return {settingsVisible: true};
            else if ( opts == 'coauth' )
                return {
                    collaborationVisible: true,
                    collaborationPage: showOpts
                };
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
              <Toolbar openOptions={this.handleClickToOpenOptions} closeOptions={this.handleOptionsViewClosed}/>
              {/* Page content */}
              <View id="editor_sdk">
            
              </View>
              {/* {
                  Device.phone ? null : <SearchSettings />
              } */}
              <SearchSettings useSuspense={false} />
              {
                  !this.state.editOptionsVisible ? null :
                      <EditOptions onclosed={this.handleOptionsViewClosed.bind(this, 'edit')} />
              }
              {
                  !this.state.addOptionsVisible ? null :
                      <AddOptions onclosed={this.handleOptionsViewClosed.bind(this, 'add')} showOptions={this.state.addShowOptions} />
              }
              {
                  !this.state.settingsVisible ? null :
                      <Settings onclosed={this.handleOptionsViewClosed.bind(this, 'settings')} />
              }
              {
                  !this.state.collaborationVisible ? null :
                      <Collaboration onclosed={this.handleOptionsViewClosed.bind(this, 'coauth')} page={this.state.collaborationPage} />
              }
              <ContextMenu openOptions={this.handleClickToOpenOptions.bind(this)} />
          </Page>
      )
  }
};