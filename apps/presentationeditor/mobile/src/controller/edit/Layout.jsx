import React, { Component } from "react";
import Layout from "../../view/edit/Layout";

class LayoutController extends Component {
    constructor(props) {
        super(props);
    }

    onLayoutClick(index) {
        const api = Common.EditorApi.get();
        api.ChangeLayout(index);
    }

    render() {
        return (
            <Layout onLayoutClick={this.onLayoutClick} />
        );
    }
}

export default LayoutController;