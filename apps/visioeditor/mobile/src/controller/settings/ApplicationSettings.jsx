import React, { Component } from "react";
import { ApplicationSettings } from "../../view/settings/ApplicationSettings";
import { LocalStorage } from '../../../../../common/mobile/utils/LocalStorage.mjs';
import {observer, inject} from "mobx-react";
import { ThemesContext } from "../../../../../common/mobile/lib/controller/Themes";
import { withTranslation } from 'react-i18next';
import { f7 } from "framework7-react";

class ApplicationSettingsController extends Component {
    constructor(props) {
        super(props);
    }

    static contextType = ThemesContext;

    render() {
        return (
            <ApplicationSettings 
                changeTheme={this.context.changeTheme}
            />
        )
    }
}


export default inject("storeApplicationSettings", "storeAppOptions")(observer(withTranslation()(ApplicationSettingsController)));