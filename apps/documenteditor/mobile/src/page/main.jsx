
import React, { Component } from 'react';
import { f7 } from 'framework7-react';
import { Page, View, Navbar, Subnavbar, Icon } from 'framework7-react';
import { observer, inject } from "mobx-react";

import EditOptions from '../view/edit/Edit';
import AddOptions from '../view/add/Add';
import Settings from '../controller/settings/Settings';
import Collaboration from '../../../../common/mobile/lib/view/collaboration/Collaboration.jsx'
import { Device } from '../../../../common/mobile/utils/device'
import { Search, SearchSettings } from '../controller/Search';
import ContextMenu from '../controller/ContextMenu';
import { Toolbar } from "../controller/Toolbar";

class MainPage extends Component {
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

        if ((opts === 'edit' || opts === 'coauth') && Device.phone) {
            f7.navbar.hide('.main-navbar');
        }
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
            });
            if ((opts === 'edit' || opts === 'coauth') && Device.phone) {
                f7.navbar.show('.main-navbar');
            }
        })();
    };

  render() {
      const appOptions = this.props.storeAppOptions;
      const config = appOptions.config;
      const showLogo = !(appOptions.canBrandingExt && (config.customization && (config.customization.loaderName || config.customization.loaderLogo)));
      return (
          <Page name="home" className={`editor${ showLogo ? ' page-with-logo' : ''}`}>
              {/* Top Navbar */}
              <Navbar id='editor-navbar' className={`main-navbar${showLogo ? ' navbar-with-logo' : ''}`}>
                  {showLogo && <div className="main-logo"><Icon icon="icon-logo"></Icon></div>}
                  <Subnavbar>
                      <Toolbar openOptions={this.handleClickToOpenOptions} closeOptions={this.handleOptionsViewClosed}/>
                      <Search useSuspense={false}/>
                  </Subnavbar>
              </Navbar>
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
                      <Settings openOptions={this.handleClickToOpenOptions} onclosed={this.handleOptionsViewClosed.bind(this, 'settings')} />
              }
              {
                  !this.state.collaborationVisible ? null :
                      <Collaboration onclosed={this.handleOptionsViewClosed.bind(this, 'coauth')} page={this.state.collaborationPage} />
              }
              <ContextMenu openOptions={this.handleClickToOpenOptions.bind(this)} />
          </Page>
      )
  }
}

export default inject("storeAppOptions")(observer(MainPage));