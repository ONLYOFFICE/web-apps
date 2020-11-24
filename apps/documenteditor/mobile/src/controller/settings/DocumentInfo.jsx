import React, { Component } from "react";
import DocumentInfo from "../../view/settings/DocumentInfo";

class DocumentInfoController extends Component {
  constructor(props) {
    super(props);
  }

  getDocProps() {
    const api = Common.EditorApi.get();
    if (api) {
      let docProps = api.asc_getCoreProps();
      // console.log(docProps);
      return docProps;
    }
  }

  getAppProps() {
    const api = Common.EditorApi.get();
    if (api) {
      const appProps = api.asc_getAppProps();
      // console.log(appProps);
      if (appProps) {
        let appName =
          (appProps.asc_getApplication() || "") +
          (appProps.asc_getAppVersion() ? " " : "") +
          (appProps.asc_getAppVersion() || "");
        return appName;
      }
    }
  }

  getModified() {
    const docProps = this.getDocProps();
    if (docProps) {
      let valueModified = docProps.asc_getModified();

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
  }

  getModifiedBy() {
    const docProps = this.getDocProps();
    if (docProps) {
      let valueModifiedBy = docProps.asc_getLastModifiedBy();

      if (valueModifiedBy) {
        return Common.Utils.UserInfoParser.getParsedName(valueModifiedBy);
      }
    }
  }

  getCreators() {
    const docProps = this.getDocProps();
    if(docProps) {
      let valueCreators = docProps.asc_getCreator();
      return valueCreators;
    }
  }

  componentDidMount() {
    const api = Common.EditorApi.get();
    if (api) {
      api.startGetDocInfo();
    }
  }

  render() {
    return (
      <DocumentInfo
        getAppProps={this.getAppProps}
        getModified={this.getModified}
        getModifiedBy={this.getModifiedBy}
        getDocProps={this.getDocProps}
        getCreators={this.getCreators}
      />
    );
  }
}

export default DocumentInfoController;