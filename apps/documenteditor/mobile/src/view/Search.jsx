import React, { Component } from 'react';
import { Searchbar, Popover, Popup, View, Page, List, ListItem, Navbar, NavRight, Link } from 'framework7-react';
import { Toggle } from 'framework7-react';
import { f7ready, f7 } from 'framework7-react';
import { Device } from '../../../../common/mobile/utils/device';

const popoverStyle = {
    height: '300px'
};

class SearchSettingsView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            useReplace: false,
            caseSensitive: false,
            markResults: false
        };
    }

    onFindReplaceClick(action) {
        this.setState({
            useReplace: action == 'replace'
        });
    }

    render() {
        const show_popover = true;
        const navbar =
            <Navbar title="Find and replace">
                {!show_popover &&
                    <NavRight>
                        <Link popupClose=".search-settings-popup">Done</Link>
                    </NavRight>}
            </Navbar>;
        const content =
            <View style={popoverStyle}>
                <Page>
                    {navbar}
                    <List>
                        <ListItem radio title="Find" name="find-replace-checkbox" checked={!this.state.useReplace} onClick={e => this.onFindReplaceClick('find')} />
                        <ListItem radio title="Find and replace" name="find-replace-checkbox" checked={this.state.useReplace} onClick={e => this.onFindReplaceClick('replace')} />
                    </List>
                    <List>
                        <ListItem title="Case sensitive">
                            <Toggle slot="after" />
                        </ListItem>
                        <ListItem title="Highlight results">
                            <Toggle slot="after" />
                        </ListItem>
                    </List>
                </Page>
            </View>;
        return (
            show_popover ?
                <Popover id="idx-search-settings" className="popover__titled">{content}</Popover> :
                <Popup id="idx-search-settings">{content}</Popup>
        )
    }
}

class SearchView extends Component {
    constructor(props) {
        super(props);

        $$(document).on('page:init', (e, page) => {
            if ( page.name == 'home' ) {
                f7.searchbar.create({
                    el: '.searchbar',
                    customSearch: true,
                    expandable: true,
                    backdrop: false,
                    on: {
                        search: (bar, curval, prevval) => {
                            console.log('on search results ' + curval);
                        }
                    }
                });
            }
        });

        this.onSettingsClick = this.onSettingsClick.bind(this);
    }

    componentDidMount(){
    }

    onSettingsClick(e) {
        if ( Device.phone ) {
            // f7.popup.open('.settings-popup');
        } else f7.popover.open('#idx-search-settings', '#idx-btn-search-settings');
    }

    render() {
        return (
            <form className="searchbar">
                <div className="searchbar-bg"></div>
                <div className="searchbar-inner">
                    <div className="buttons-row">
                        <a id="idx-btn-search-settings" className="link icon-only" onClick={this.onSettingsClick}>
                            <i className="icon icon-settings" />
                        </a>
                    </div>
                    <div className="searchbar-input-wrap">
                        <input placeholder="Search" type="search" />
                        <i className="searchbar-icon" />
                        <span className="input-clear-button" />
                    </div>
                    <div className="buttons-row">
                        <a className="link icon-only prev disabled">
                            <i className="icon icon-prev" />
                        </a>
                        <a className="link icon-only next disabled">
                            <i className="icon icon-next" />
                        </a>
                    </div>
                    <span className="searchbar-disable-button">Cancel</span>
                </div>
            </form>
        )
    }
}

export {SearchView as default, SearchSettingsView};
