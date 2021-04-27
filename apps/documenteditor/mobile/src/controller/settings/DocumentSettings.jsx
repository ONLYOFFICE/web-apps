
import React, {Component} from 'react';
import {DocumentSettings} from '../../view/settings/DocumentSettings';


class DocumentSettingsController extends Component {
    constructor (props) {
        super (props);
        this.getMargins = this.getMargins.bind(this);
        this.applyMargins = this.applyMargins.bind(this);
    }

    onPageOrientation (value){
        const api = Common.EditorApi.get();
        if (api) {
            api.change_PageOrient(value == 'portrait');
        }
    }

    onFormatChange (value) {
        const api = Common.EditorApi.get();
        if (api) {
            api.change_DocSize(value[0], value[1]);
        }
    }

    getMargins() {
        const api = Common.EditorApi.get();
        if (api) {
            this.localSectionProps = api.asc_GetSectionProps();
            if (this.localSectionProps) {
                this.maxMarginsH = this.localSectionProps.get_H() - 2.6;
                this.maxMarginsW = this.localSectionProps.get_W() - 12.7;

                const top = this.localSectionProps.get_TopMargin();
                const bottom = this.localSectionProps.get_BottomMargin();
                const left = this.localSectionProps.get_LeftMargin();
                const right = this.localSectionProps.get_RightMargin();

                return {
                    top,
                    bottom,
                    left,
                    right,
                    maxMarginsW: this.maxMarginsW,
                    maxMarginsH: this.maxMarginsH
                }
            }
        }
    }

    applyMargins (align, value) {
        const api = Common.EditorApi.get();

        if (api) {
            switch (align) {
                case 'left':
                    this.localSectionProps.put_LeftMargin(value);
                    break;
                case 'top':
                    this.localSectionProps.put_TopMargin(value);
                    break;
                case 'right':
                    this.localSectionProps.put_RightMargin(value);
                    break;
                case 'bottom':
                    this.localSectionProps.put_BottomMargin(value);
                    break;
            }
            api.asc_SetSectionProps(this.localSectionProps);
        }
    }

    // Color Schemes

    initPageColorSchemes() {
        const api = Common.EditorApi.get();
        return api.asc_GetCurrentColorSchemeIndex();
    }

    onColorSchemeChange(newScheme) {
        const api = Common.EditorApi.get();
        api.asc_ChangeColorSchemeByIdx(+newScheme);
    }

    render () {
        return (
            <DocumentSettings onPageOrientation={this.onPageOrientation}
                              onFormatChange={this.onFormatChange}
                              getMargins={this.getMargins}
                              applyMargins={this.applyMargins}
                              onColorSchemeChange={this.onColorSchemeChange}
                              initPageColorSchemes={this.initPageColorSchemes}
            />
        )
    }
}

export default DocumentSettingsController;