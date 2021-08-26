import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import SpreadsheetInfo from "../../view/settings/SpreadsheetInfo";

class SpreadsheetInfoController extends Component {
    constructor(props) {
        super(props);
        this.docProps = this.getDocProps();

        if (this.docProps) {
            this.modified = this.getModified();
            this.modifiedBy = this.getModifiedBy();
            this.creators = this.getCreators();
            this.title = this.getTitle();
            this.subject = this.getSubject();
            this.description = this.getDescription();
            this.created = this.getCreated();
        }
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
        return null;
    }

    getModified() {
        let valueModified = this.docProps.asc_getModified();
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
        return null;
    }

    getModifiedBy() {
        let valueModifiedBy = this.docProps.asc_getLastModifiedBy();
        if (valueModifiedBy) {
            return AscCommon.UserInfoParser.getParsedName(valueModifiedBy);
        }
        return null;
    }

    getCreators() {
        return this.docProps.asc_getCreator();
    }

    getTitle() {
        return this.docProps.asc_getTitle();
    }

    getSubject() {
        return this.docProps.asc_getSubject();
    }

    getDescription() {
        return this.docProps.asc_getDescription();
    }

    getCreated() {
        let value = this.docProps.asc_getCreated();
        const _lang = this.props.storeAppOptions.lang;

        if(value) {
            return value.toLocaleString(_lang, {year: 'numeric', month: '2-digit', day: '2-digit'}) + ' ' + value.toLocaleTimeString(_lang, {timeStyle: 'short'});
        }

        return null;
    }

    render() {
        return (
            <SpreadsheetInfo
                getAppProps={this.getAppProps}
                modified={this.modified}
                modifiedBy={this.modifiedBy}
                creators={this.creators}
                created={this.created}
                title={this.title}
                subject={this.subject}
                description={this.description}
            />
        );
    }
}


export default inject("storeAppOptions")(observer(SpreadsheetInfoController));