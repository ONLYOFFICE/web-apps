import React, {Component, Fragment} from 'react';
import {
    List,
    ListItem,
    Icon,
    Row,
    Col,
    Button
} from 'framework7-react';

export default class EditText extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const textFontColor = "Font Color";
        const textHighlightColor = "Highlight Color";
        const textAdditionalFormatting = "Additional Formatting";
        const textBullets = "Bullets";
        const textNumbers = "Numbers";
        const textLineSpacing = "Line Spacing";

        const fontName = 'Arial';
        const fontSize = '11pt';
        return (
            <Fragment>
            <List>
                <ListItem title={fontName} link="#" after={fontSize}></ListItem>
                <ListItem>
                    <Row>
                        <Col>
                            <Button>Button</Button>
                        </Col>
                        <Col>
                            <Button>Button</Button>
                        </Col>
                        <Col>
                            <Button>Button</Button>
                        </Col>
                        <Col>
                            <Button>Button</Button>
                        </Col>
                    </Row>
                </ListItem>
                <ListItem title={textFontColor} link="#">
                    <Icon slot="media" icon="icon-text-color"></Icon>
                    <span className="color-preview"></span>
                </ListItem>
                <ListItem title={textHighlightColor} link="#">
                    <Icon slot="media" icon="icon-text-selection"></Icon>
                </ListItem>
                <ListItem title={textAdditionalFormatting} link="#">
                    <Icon slot="media" icon="icon-text-additional"></Icon>
                </ListItem>
            </List>
            <List>
                <ListItem>
                    <Row>
                        <Col>
                            <Button>Button</Button>
                        </Col>
                        <Col>
                            <Button>Button</Button>
                        </Col>
                        <Col>
                            <Button>Button</Button>
                        </Col>
                        <Col>
                            <Button>Button</Button>
                        </Col>
                    </Row>
                </ListItem>
                <ListItem>
                    <Row>
                        <Col>
                            <Button>Button</Button>
                        </Col>
                        <Col>
                            <Button>Button</Button>
                        </Col>
                    </Row>
                </ListItem>
                <ListItem title={textBullets} link="#">
                    <Icon slot="media" icon="icon-bullets"></Icon>
                </ListItem>
                <ListItem title={textNumbers} link="#">
                    <Icon slot="media" icon="icon-numbers"></Icon>
                </ListItem>
                <ListItem title={textLineSpacing} link="#">
                    <Icon slot="media" icon="icon-linespacing"></Icon>
                </ListItem>
            </List>
            </Fragment>
        )
    }
};