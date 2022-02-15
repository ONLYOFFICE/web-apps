import React, { Component } from "react";
import { NavigationPopover, NavigationSheet } from "../../view/settings/Navigation";
import { Device } from '../../../../../common/mobile/utils/device';
import { withTranslation } from 'react-i18next';

class NavigationController extends Component {
    constructor(props) {
        super(props);
        this.updateNavigation = this.updateNavigation.bind(this);
    }

    updateNavigation() {
        const api = Common.EditorApi.get();
        const navigationObject = api.asc_ShowDocumentOutline();

        if (!navigationObject) return;

        const count = navigationObject.get_ElementsCount();
        const { t } = this.props;
       
        let arrHeaders = [],
            prevLevel = -1,
            headerLevel = -1,
            firstHeader = !navigationObject.isFirstItemNotHeader();

        for (let i = 0; i < count; i++) {
            let level = navigationObject.get_Level(i),
                hasParent = true;
            if (level > prevLevel && i > 0)
                arrHeaders[i - 1]['hasSubItems'] = true;
            if (headerLevel < 0 || level <= headerLevel) {
                if (i > 0 || firstHeader)
                    headerLevel = level;
                hasParent = false;
            }

            arrHeaders.push({
                name: navigationObject.get_Text(i),
                level,
                index: i,
                hasParent,
                isEmptyItem: navigationObject.isEmptyItem(i)
            });

            prevLevel = level;
        }

        if (count > 0 && !firstHeader) {
            arrHeaders[0]['hasSubItems'] = false;
            arrHeaders[0]['isNotHeader'] =  true;
            arrHeaders[0]['name'] = t('Settings.textBeginningDocument');
        }

        return arrHeaders;
    }

    onSelectItem(index) {
        const api = Common.EditorApi.get();
        const navigationObject = api.asc_ShowDocumentOutline();

        if (navigationObject) {
            navigationObject.goto(index);
        }
    };

    render() {
        return (
            !Device.phone ? 
                <NavigationPopover
                    onSelectItem={this.onSelectItem} 
                    updateNavigation={this.updateNavigation}
                />
            :
                <NavigationSheet
                    onSelectItem={this.onSelectItem} 
                    updateNavigation={this.updateNavigation}
                    onclosed={this.props.onclosed}
                /> 
        );
    }
}

export default withTranslation()(NavigationController);