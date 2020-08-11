import React, {Component} from 'react';
import {
    Page,
    Navbar,
    NavRight,
    NavLeft,
    Link,
    Popup,
    Tabs,
    Tab
} from 'framework7-react';
import EditText from "./EditText";
import EditParagraph from "./EditParagraph";

export default class EditContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            popupOpened: false,
        };
    }
    render() {
        const editors = ['text', 'paragraph'];//, 'table', 'header', 'shape', 'image', 'chart', 'hyperlink'];
        const tabLinks = editors.map((item, index) =>
            <Link key={"de-tablink-" + item}  tabLink={"#" + item} tabLinkActive={index === 0}>{item}</Link>
        );
        const tabs = editors.map((item, index) =>
            <Tab key={"de-tab-" + item} id={item} className="page-content" tabActive={index === 0}>
                {item === 'text' && <EditText />}
                {item === 'paragraph' && <EditParagraph />}
                {/*{item === 'table' && <EditTable />}
                  {item === 'header' && <EditHeader />}
                  {item === 'shape' && <EditShape />}
                  {item === 'image' && <EditImage />}
                  {item === 'chart' && <EditChart />}
                  {item === 'hyperlink' && <EditHyperlink />}*/}
            </Tab>
        );
        return (
            <Popup className="edit-popup" opened={this.state.popupOpened} onPopupClosed={() => this.setState({popupOpened : false})}>
                <Page pageContent={false}>
                    <Navbar>
                        <NavLeft tabbar>
                            {tabLinks}
                        </NavLeft>
                        <NavRight>
                            <Link popupClose=".edit-popup">Close</Link>
                        </NavRight>
                    </Navbar>
                    <Tabs animated>
                        {tabs}
                    </Tabs>
                </Page>
            </Popup>
        )
    }
};