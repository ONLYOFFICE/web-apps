import React, {Component, Fragment} from 'react';
import {
    List,
    ListItem,
    BlockTitle
} from 'framework7-react';

export default class EditText extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const textBackground = "Background";
        const textAdvancedSettings = "Advanced settings";
        const textParagraphStyles = "Paragraph styles";

        return (
            <Fragment>
                <List>
                    <ListItem title={textBackground} link="#">
                        <span className="color-preview" slot="after"></span>
                    </ListItem>
                </List>
                <List>
                    <ListItem title={textAdvancedSettings} link="#"></ListItem>
                </List>
                <BlockTitle>{textParagraphStyles}</BlockTitle>
                <List>
                </List>
            </Fragment>
        )
    }
};