import React, { Component } from "react";
import Layout from "../../view/edit/Layout";

class LayoutController extends Component {
    constructor(props) {
        super(props);
    }

    onLayoutClick(index) {
        const api = Common.EditorApi.get();
        let props = new Asc.CAscSlideProps();
        console.log(api);

        props.LayoutIndex = index;
        api.SetSlideProps(props);

        console.log(props);
    }

    render() {
        return (
            <Layout onLayoutClick={this.onLayoutClick} />
        );
    }
}

export default LayoutController;