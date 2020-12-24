import React, { Component } from "react";
import Theme from "../../view/edit/Theme";

class ThemeController extends Component {
    constructor(props) {
        super(props);
    }

    onThemeClick(index) {
        const api = Common.EditorApi.get();
        api.ChangeTheme(index);
    }

    render() {
        return (
            <Theme onThemeClick={this.onThemeClick} />
        );
    }
}

export default ThemeController;