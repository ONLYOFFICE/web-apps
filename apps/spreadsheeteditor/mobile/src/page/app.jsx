import React from 'react';

import {App,Views,View,Navbar,NavLeft,NavRight,Link} from 'framework7-react';

import routes from '../router/routes.js';

import '../../../../common/Gateway.js';
import '../../../../common/main/lib/util/utils.js';
import Notifications from '../../../../common/mobile/utils/notifications.js'
import {MainController} from '../controller/Main';
import {Device} from '../../../../common/mobile/utils/device'
import CellEditor from '../controller/CellEditor';

export default class extends React.Component {
    constructor() {
        super();

        this.state = {
        // Framework7 Parameters
            f7params: {
                name: 'Spreadsheet Editor', // App name
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
                <View main className="safe-areas" url="/">
                    {/* Top Navbar */}
                    <Navbar id='editor-navbar'>
                        {/*<div slot="before-inner" className="main-logo"><Icon icon="icon-logo"></Icon></div>*/}
                        <NavLeft>
                            <Link icon='icon-undo'></Link>
                            <Link icon='icon-redo'></Link>
                        </NavLeft>
                        <NavRight>
                            <Link id='btn-edit' icon='icon-edit-settings' href={false} onClick={e => this.handleClickToOpenOptions('edit')}></Link>
                            <Link href={false} icon='icon-collaboration' onClick={e => this.handleClickToOpenOptions('coauth')}></Link>
                            <Link id='btn-settings' icon='icon-settings' href={false} onClick={e => this.handleClickToOpenOptions('settings')}></Link>
                        </NavRight>
                    </Navbar>
                    {/*<CellEditor />*/}
                    <MainController />
                </View>
            </App>
        )
    }

    componentDidMount() {
        this.$f7ready((f7) => {
            Device.initDom();
        });
    }
}
