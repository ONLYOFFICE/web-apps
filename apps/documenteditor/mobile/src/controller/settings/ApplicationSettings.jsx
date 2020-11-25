import React, { Component } from "react";
import { ApplicationSettings } from "../../view/settings/ApplicationSettings";

class ApplicationSettingsController extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <ApplicationSettings />
        )
    }
}


export default ApplicationSettingsController;