import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { App, Panel, View, Popup, Page, Navbar, NavRight, Link, Block, BlockTitle, List, ListItem } from 'framework7-react';

import i18n from '../js/i18n';
import routes from '../js/routes';

import { initApi } from '../store/actions/actions';

import '../../../../common/Gateway.js';
import '../../../../common/main/lib/util/utils.js';
import { CollaborationController } from '../../../../common/mobile/lib/controller/Collaboration.jsx';
import Notifications from '../../../../common/mobile/utils/notifications.js'

class ComponentApp extends React.Component {
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
      // Login screen demo data
      username: '',
      password: '',
    }

      Common.Notifications = new Notifications();

      Common.Controllers = {};
      Common.Controllers.Collaboration = new CollaborationController();
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
  alertLoginData() {
    this.$f7.dialog.alert('Username: ' + this.state.username + '<br>Password: ' + this.state.password, () => {
      this.$f7.loginScreen.close();
    });
  }
  componentDidMount() {
    this.$f7ready((f7) => {
      // Call F7 APIs here
    });

      const script = document.createElement("script");
      script.src = "../../../../sdkjs/develop/sdkjs/word/scripts.js";
      script.async = true;
      script.onload = () => {
          let dep_scripts = ['../../../vendor/xregexp/xregexp-all-min.js',
                                '../../../vendor/sockjs/sockjs.min.js',
                                '../../../vendor/jszip/jszip.min.js',
                                '../../../vendor/jszip-utils/jszip-utils.min.js'];
          dep_scripts.push(...sdk_scripts);

          const promise_get_script = (scriptpath) => {
              return new Promise((resolve, reject) => {
                  const script = document.createElement("script");
                  script.src = scriptpath;
                  script.onload = () => {
                      console.log('loaded ' + scriptpath);
                      resolve('ok');
                  };
                  script.onerror = () => {
                      console.log('error ' + scriptpath);
                      reject('error');
                  };

                  document.body.appendChild(script);
              });
          };

          const loadConfig = data => {
              let me = this;
              console.log('load config');

              me.editorConfig = Object.assign({}, this.editorConfig, data.config);
              me.appOptions.user = Common.Utils.fillUserInfo(me.editorConfig.user, me.editorConfig.lang, "Local.User"/*me.textAnonymous*/);
          };

          const loadDocument = data => {
              this.permissions = {};
              this.document = data.doc;

              let docInfo = {};

              if (data.doc) {
                  this.permissions = Object.assign(this.permissions, data.doc.permissions);

                  let _permissions = Object.assign({}, data.doc.permissions),
                      _user = new Asc.asc_CUserInfo();
                  _user.put_Id(this.appOptions.user.id);
                  _user.put_FullName(this.appOptions.user.fullname);

                  docInfo = new Asc.asc_CDocInfo();
                  docInfo.put_Id(data.doc.key);
                  docInfo.put_Url(data.doc.url);
                  docInfo.put_Title(data.doc.title);
                  docInfo.put_Format(data.doc.fileType);
                  docInfo.put_VKey(data.doc.vkey);
                  docInfo.put_Options(data.doc.options);
                  docInfo.put_UserInfo(_user);
                  docInfo.put_CallbackUrl(this.editorConfig.callbackUrl);
                  docInfo.put_Token(data.doc.token);
                  docInfo.put_Permissions(_permissions);
                  docInfo.put_EncryptedInfo(this.editorConfig.encryptionKeys);

                  // var enable = !this.editorConfig.customization || (this.editorConfig.customization.macros!==false);
                  // docInfo.asc_putIsEnabledMacroses(!!enable);
                  // enable = !this.editorConfig.customization || (this.editorConfig.customization.plugins!==false);
                  // docInfo.asc_putIsEnabledPlugins(!!enable);

                  // let type = /^(?:(pdf|djvu|xps))$/.exec(data.doc.fileType);
                  // if (type && typeof type[1] === 'string') {
                  //     this.permissions.edit = this.permissions.review = false;
                  // }
              }

              this.api.asc_registerCallback('asc_onGetEditorPermissions', onEditorPermissions);
              // this.api.asc_registerCallback('asc_onLicenseChanged',       _.bind(this.onLicenseChanged, this));
              // this.api.asc_registerCallback('asc_onRunAutostartMacroses', _.bind(this.onRunAutostartMacroses, this));
              this.api.asc_setDocInfo(docInfo);
              this.api.asc_getEditorPermissions(this.editorConfig.licenseUrl, this.editorConfig.customerId);

              // Common.SharedSettings.set('document', data.doc);

              // if (data.doc) {
              //     DE.getController('Toolbar').setDocumentTitle(data.doc.title);
              //     if (data.doc.info) {
              //         data.doc.info.author && console.log("Obsolete: The 'author' parameter of the document 'info' section is deprecated. Please use 'owner' instead.");
              //         data.doc.info.created && console.log("Obsolete: The 'created' parameter of the document 'info' section is deprecated. Please use 'uploaded' instead.");
              //     }
              // }
          };

          const onEditorPermissions = params => {
              let me = this;
              const licType = params.asc_getLicenseType();

              me.appOptions.canLicense      = (licType === Asc.c_oLicenseResult.Success || licType === Asc.c_oLicenseResult.SuccessLimit);
              // me.appOptions.canEdit         = (me.permissions.edit !== false || me.permissions.review === true) && // can edit or review
              //     (me.editorConfig.canRequestEditRights || me.editorConfig.mode !== 'view') && // if mode=="view" -> canRequestEditRights must be defined
              //     (!me.appOptions.isReviewOnly || me.appOptions.canLicense) && // if isReviewOnly==true -> canLicense must be true
              //     me.isSupportEditFeature();
              // me.appOptions.isEdit          = me.appOptions.canLicense && me.appOptions.canEdit && me.editorConfig.mode !== 'view';

              // me.api.asc_setViewMode(!me.appOptions.isEdit);
              me.api.asc_setViewMode(false);
              me.api.asc_LoadDocument();
              me.api.Resize();
          };

          const _process_array = (array, fn) => {
              let results = [];
              return array.reduce(function(p, item) {
                  return p.then(function() {
                      return fn(item).then(function(data) {
                          results.push(data);
                          return results;
                      });
                  });
              }, Promise.resolve());
          };

          _process_array(dep_scripts, promise_get_script)
              .then ( result => {
                  this.api = new Asc.asc_docs_api({
                      'id-view'  : 'editor_sdk',
                      'mobile'   : true,
                      // 'translate': translate
                  });

                  this.appOptions   = {};

                  Common.Gateway.on('init',           loadConfig);
                  // Common.Gateway.on('showmessage',    _.bind(me.onExternalMessage, me));
                  Common.Gateway.on('opendocument',   loadDocument);
                  Common.Gateway.appReady();

                  Common.Notifications.trigger('engineCreated', this.api);
                  const { initApi } = this.props;
                  initApi(this.api);
              }, error => {
                  console.log('promise failed ' + error);
              });
      };

      script.onerror = () => {
          console.log('error');
      };

      document.body.appendChild(script);
  }
}

const mapDispatchToProps = dispatch => bindActionCreators({
    initApi
}, dispatch);

export default connect(undefined, mapDispatchToProps)(ComponentApp);
