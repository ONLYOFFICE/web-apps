import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import DocumentInfo from "../../view/settings/DocumentInfo";
import { withTranslation } from 'react-i18next';

class DocumentInfoController extends Component {
    constructor(props) {
        super(props);
        this.docProps = this.getDocProps();
        this.pdfProps = this.getPdfProps();
        this.docInfoObject = {};

        this.getAppProps = this.getAppProps.bind(this);

        if(this.docProps) {
            this.updateFileInfo(this.docProps);
        } else if (this.pdfProps) {
            this.updatePdfInfo(this.pdfProps);
        }
    }

    updateFileInfo(props) {
        let value;

        if(props) {
            value = props.asc_getCreated();
            if(value) this.docInfoObject.dateCreated = this.getModified(value);

            value = props.asc_getModified();
            if(value) this.docInfoObject.modifyDate = this.getModified(value);

            value = props.asc_getLastModifiedBy();
            if(value) this.docInfoObject.modifyBy = AscCommon.UserInfoParser.getParsedName(value);

            this.docInfoObject.title = props.asc_getTitle() || '';
            this.docInfoObject.subject = props.asc_getSubject() || '';
            this.docInfoObject.description = props.asc_getDescription() || '';

            value = props.asc_getCreator();
            if(value) this.docInfoObject.creators = value;
        }
    }

    updatePdfInfo(props) {
        const { t } = this.props;
        const _t = t("Settings", { returnObjects: true });
        let value;

        if(props) {
            value = props.CreationDate;
            if (value)
                this.docInfoObject.dateCreated = this.getModified(new Date(value));
            
            value = props.ModDate;
            if (value)
                this.docInfoObject.modifyDate = this.getModified(new Date(value));

            if(props.PageWidth && props.PageHeight && (typeof props.PageWidth === 'number') && (typeof props.PageHeight === 'number')) {
                let width = props.PageWidth,
                    heigth = props.PageHeight;
                switch(Common.Utils.Metric.getCurrentMetric()) {
                    case Common.Utils.Metric.c_MetricUnits.cm:
                        width = parseFloat((width* 25.4 / 72000.).toFixed(2));
                        heigth = parseFloat((heigth* 25.4 / 72000.).toFixed(2));
                        break;
                    case Common.Utils.Metric.c_MetricUnits.pt:
                        width = parseFloat((width/100.).toFixed(2));
                        heigth = parseFloat((heigth/100.).toFixed(2));
                        break;
                    case Common.Utils.Metric.c_MetricUnits.inch:
                        width = parseFloat((width/7200.).toFixed(2));
                        heigth = parseFloat((heigth/7200.).toFixed(2));
                        break;
                }

                this.docInfoObject.pageSize = (width + ' ' + Common.Utils.Metric.getCurrentMetricName() + ' x ' + heigth + ' ' + Common.Utils.Metric.getCurrentMetricName());
            } else this.docInfoObject.pageSize = null;

            value = props.Title;
            if(value) this.docInfoObject.title = value;

            value = props.Subject;
            if(value) this.docInfoObject.subject = value;

            value = props.Author;
            if(value) this.docInfoObject.author = value;

            value = props.Version;
            if(value) this.docInfoObject.version = value;

            value = props.Producer;
            if(value) this.docInfoObject.producer = value;

            value = props.Tagged;
            if (value !== undefined)
                this.docInfoObject.tagged = (value===true ? _t.textYes : _t.textNo);
            
            value = props.FastWebView;
            if (value !== undefined)
                this.docInfoObject.fastWebView = (value===true ? _t.textYes : _t.textNo);
        }
    }

    getDocProps() {
        const api = Common.EditorApi.get();
        return api.asc_getCoreProps();
    }

    getPdfProps() {
        const api = Common.EditorApi.get();
        return api.asc_getPdfProps();
    }

    getAppProps() {
        const api = Common.EditorApi.get();
        const appProps = api.asc_getAppProps();
        let appName;

        if (appProps) {
            appName = appProps.asc_getApplication();
            if ( appName && appProps.asc_getAppVersion() )
                appName += ` ${appProps.asc_getAppVersion()}`;
           
            return appName || '';
        } else if (this.pdfProps) {
            appName = this.pdfProps ? this.pdfProps.Creator || '' : '';
            return appName;
        }
    }

    getModified(valueModified) {
        const _lang = this.props.storeAppOptions.lang;

        if (valueModified) {
            return (
                valueModified.toLocaleString(_lang, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                }) +
                " " +
                valueModified.toLocaleTimeString(_lang, { timeStyle: "short" })
            );
        }
    }

    componentDidMount() {
        const api = Common.EditorApi.get();
        api.startGetDocInfo();
    }

    render() {
        return (
            <DocumentInfo
                getAppProps={this.getAppProps}
                docInfoObject={this.docInfoObject}
            />
        );
    }
}


export default inject("storeAppOptions")(observer(withTranslation()(DocumentInfoController)));
