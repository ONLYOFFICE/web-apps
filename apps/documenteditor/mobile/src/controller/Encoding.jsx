import React, { Component } from 'react';
import { Device } from '../../../../common/mobile/utils/device';
import { f7 } from "framework7-react";
import { Encoding } from "../view/Encoding";

class EncodingController extends Component {
    constructor(props) {
        super(props);
        
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
        if(type === Asc.c_oAscAdvancedOptionsID.TXT) {
            Common.Notifications.trigger('preloader:close');
            Common.Notifications.trigger('preloader:endAction', Asc.c_oAscAsyncActionType['BlockInteraction'], -256, true);

            this.mode = mode;
            this.advOptions = advOptions;
            this.formatOptions = formatOptions;
            this.pages = [];
            this.pagesName = [];
        
            const recommendedSettings = this.advOptions.asc_getRecommendedSettings();

            this.initPages();
            this.valueEncoding = recommendedSettings.asc_getCodePage();
        
            this.setState({
                isOpen: true
            });
        }
    }

    initPages() {
        for (let page of this.advOptions.asc_getCodePages()) {
            this.pages.push(page.asc_getCodePage());
            this.pagesName.push(page.asc_getCodePageName());
        }
    }

    closeModal() {
        f7.sheet.close('.encoding-popup', true);
        this.setState({isOpen: false});
    }

    onSaveFormat(valueEncoding) {
        const api = Common.EditorApi.get();

        this.closeModal();

        if(this.mode === 2) {
            this.formatOptions && this.formatOptions.asc_setAdvancedOptions(new Asc.asc_CTextOptions(valueEncoding));
            api.asc_DownloadAs(this.formatOptions);
        } else {
            api.asc_setAdvancedOptions(Asc.c_oAscAdvancedOptionsID.TXT, new Asc.asc_CTextOptions(valueEncoding));
        }
    }

    render() {
        return (
            this.state.isOpen &&
                <Encoding 
                    closeModal={this.closeModal}
                    mode={this.mode}  
                    onSaveFormat={this.onSaveFormat} 
                    pages={this.pages}
                    pagesName={this.pagesName}
                    valueEncoding={this.valueEncoding}
                /> 
        );
    }
}

export default EncodingController;