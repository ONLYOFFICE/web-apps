import React, { Component } from 'react';
import { Page, View, Navbar, NavLeft, NavRight, Link, Icon } from 'framework7-react';

// import EditOptions from '../view/edit/Edit';
import Settings from '../view/settings/Settings';
import CollaborationView from '../../../../common/mobile/lib/view/Collaboration.jsx'
import CellEditor from '../controller/CellEditor';
import Statusbar from '../controller/StatusBar'
import AddOptions from "../view/add/Add";
import EditOptions from "../view/edit/Edit";

import {FunctionGroups} from "../controller/add/AddFunction";

export default class MainPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editOptionsVisible: false,
            addOptionsVisible: false,
            addShowOptions: null,
            settingsVisible: false,
            collaborationVisible: false,
        };
    }

    handleClickToOpenOptions = (opts, showOpts) => {
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
                  {/*<div slot="before-inner" className="main-logo"><Icon icon="icon-logo"></Icon></div>*/}
                  <NavLeft>
                      <Link icon='icon-undo'></Link>
                      <Link icon='icon-redo'></Link>
                  </NavLeft>
                  <NavRight>
                      <Link id='btn-edit' icon='icon-edit-settings' href={false} onClick={e => this.handleClickToOpenOptions('edit')}></Link>
                      <Link id='btn-add' icon='icon-plus' href={false} onClick={e => this.handleClickToOpenOptions('add')}></Link>
                      <Link href={false} icon='icon-collaboration' onClick={e => this.handleClickToOpenOptions('coauth')}></Link>
                      <Link id='btn-settings' icon='icon-settings' href={false} onClick={e => this.handleClickToOpenOptions('settings')}></Link>
                  </NavRight>
              </Navbar>
              <CellEditor onClickToOpenAddOptions={(panels, button) => this.handleClickToOpenOptions('add', {panels: panels, button: button})}/>
              {/* Page content */}
              <View id="editor_sdk" />
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
                    <CollaborationView onclosed={this.handleOptionsViewClosed.bind(this, 'coauth')} />
            }
              <Statusbar />

              <FunctionGroups /> {/* hidden component*/}
          </Page>
      )
  }
};