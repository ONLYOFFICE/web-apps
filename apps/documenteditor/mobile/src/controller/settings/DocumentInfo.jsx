import React, { Component } from "react";
import DocumentInfo from "../../view/settings/DocumentInfo";

class DocumentInfoController extends Component {
    constructor(props) {
        super(props);
        this.docProps = this.getDocProps();
        this.getModified = this.getModified();
        this.getModifiedBy = this.getModifiedBy();
        this.getCreators = this.getCreators();
    }

    getDocProps() {
        const api = Common.EditorApi.get();
        return api.asc_getCoreProps();
    }

    getAppProps() {
        const api = Common.EditorApi.get();
        const appProps = api.asc_getAppProps();

        if (appProps) {
            let appName =
                (appProps.asc_getApplication() || "") +
                (appProps.asc_getAppVersion() ? " " : "") +
                (appProps.asc_getAppVersion() || "");
            return appName;
        }
    }

    getModified() {
        let valueModified = this.docProps.asc_getModified();

        if (valueModified) {
            return (
                valueModified.toLocaleString('en', {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                }) +
                " " +
                valueModified.toLocaleTimeString('en', { timeStyle: "short" })
            );
        }
    }

    getModifiedBy() {
        let valueModifiedBy = this.docProps.asc_getLastModifiedBy();

        if (valueModifiedBy) {
            return Common.Utils.UserInfoParser.getParsedName(valueModifiedBy);
        }
    }

    getCreators() {
        return this.docProps.asc_getCreator();
    }

    componentDidMount() {
        const api = Common.EditorApi.get();
        api.startGetDocInfo();
    }

    render() {
        return (
            <DocumentInfo
                getAppProps={this.getAppProps}
                getModified={this.getModified}
                getModifiedBy={this.getModifiedBy}
                getCreators={this.getCreators} 
            />
        );
    }
}


export default DocumentInfoController;