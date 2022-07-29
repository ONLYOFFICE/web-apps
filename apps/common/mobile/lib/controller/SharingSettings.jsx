import React, { Component } from 'react'
import {observer, inject} from "mobx-react"
import { withTranslation } from 'react-i18next';
import SharingSettings from '../view/SharingSettings';

class SharingSettingsController extends Component {
    constructor(props){
        super(props);
    }

    render() {
        return (
            <SharingSettings />
        )
    }
}

export default SharingSettingsController;