import React, { Component } from 'react';
import { Device } from '../../../../common/mobile/utils/device';
import { f7 } from "framework7-react";
import { Encoding } from "../view/Encoding";
import { withTranslation } from 'react-i18next';

class EncodingController extends Component {
    constructor(props) {
        super(props);

        this.valuesDelimeter = [4, 2, 3, 1, 5];
        this.onSaveFormat = this.onSaveFormat.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.state = {
            isOpen: false
        };

        Common.Notifications.on('engineCreated', api => {
            api.asc_registerCallback('asc_onAdvancedOptions', (type, advOptions, mode, formatOptions) => {
                this.initEncoding(type, advOptions, mode, formatOptions);
            });
        });

        Common.Notifications.on('openEncoding', (type, advOptions, mode, formatOptions) => {
            this.initEncoding(type, advOptions, mode, formatOptions);
        });
    }

    initEncoding(type, advOptions, mode, formatOptions) {
        const { t } = this.props;
        const _t = t("View.Settings", { returnObjects: true });
        
        if(type === Asc.c_oAscAdvancedOptionsID.CSV) {
            Common.Notifications.trigger('preloader:close');
            Common.Notifications.trigger('preloader:endAction', Asc.c_oAscAsyncActionType['BlockInteraction'], -256, true);

            this.mode = mode;
            this.advOptions = advOptions;
            this.formatOptions = formatOptions;
            this.encodeData = [];
            this.namesDelimeter = [_t.txtComma, _t.txtSemicolon, _t.txtColon, _t.txtTab, _t.txtSpace];
        
            const recommendedSettings = this.advOptions.asc_getRecommendedSettings();

            this.initEncodeData();
            this.valueEncoding = recommendedSettings.asc_getCodePage();
            this.valueDelimeter = recommendedSettings && recommendedSettings.asc_getDelimiter() ? recommendedSettings.asc_getDelimiter() : 4;
        
            this.setState({
                isOpen: true
            });
        }
    }

    initEncodeData() {
        for (let page of this.advOptions.asc_getCodePages()) {
            this.encodeData.push({
                value: page.asc_getCodePage(),
                displayValue: page.asc_getCodePageName(),
                lcid: page.asc_getLcid()
            });
        }
    }

    closeModal() {
        f7.sheet.close('.encoding-popup', true);
        this.setState({isOpen: false});
    }

    onSaveFormat(valueEncoding, valueDelimeter) {
        const api = Common.EditorApi.get();

        this.closeModal();

        if(this.mode === 2) {
            this.formatOptions && this.formatOptions.asc_setAdvancedOptions(new Asc.asc_CTextOptions(valueEncoding, valueDelimeter));
            api.asc_DownloadAs(this.formatOptions);
        } else {
            api.asc_setAdvancedOptions(Asc.c_oAscAdvancedOptionsID.CSV, new Asc.asc_CTextOptions(valueEncoding, valueDelimeter));
        }
    }

    render() {
        return (
            this.state.isOpen &&
                <Encoding 
                    closeModal={this.closeModal}
                    mode={this.mode}  
                    onSaveFormat={this.onSaveFormat} 
                    encodeData={this.encodeData}
                    namesDelimeter={this.namesDelimeter}
                    valueEncoding={this.valueEncoding}
                    valueDelimeter={this.valueDelimeter}
                    valuesDelimeter={this.valuesDelimeter}
                /> 
        );
    }
}

export default withTranslation()(EncodingController);