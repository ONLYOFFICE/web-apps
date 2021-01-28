import React, { Component } from 'react';
import { Searchbar, Popover, Popup, View, Page, List, ListItem, Navbar, NavRight, Link } from 'framework7-react';
import { Toggle } from 'framework7-react';
import { f7 } from 'framework7-react';
import { Dom7 } from 'framework7';
import { Device } from '../../../../common/mobile/utils/device';
import { observable } from "mobx";
import { observer } from "mobx-react";

const searchOptions = observable({
    usereplace: false
});

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
        searchOptions.usereplace = action == 'replace';
        this.setState({
            useReplace: searchOptions.usereplace
        });


        if (this.onReplaceChecked) {}
    }

    extraSearchOptions() {
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
        const extra = this.extraSearchOptions();
        const content =
            <View style={popoverStyle}>
                <Page>
                    {navbar}
                    <List>
                        <ListItem radio title="Find" name="find-replace-checkbox" checked={!this.state.useReplace} onClick={e => this.onFindReplaceClick('find')} />
                        <ListItem radio title="Find and replace" name="find-replace-checkbox" checked={this.state.useReplace} onClick={e => this.onFindReplaceClick('replace')} />
                    </List>
                    { extra }
                </Page>
            </View>;
        return (
            show_popover ?
                <Popover id="idx-search-settings" className="popover__titled">{content}</Popover> :
                <Popup id="idx-search-settings">{content}</Popup>
        )
    }
}

@observer
class SearchView extends Component {
    constructor(props) {
        super(props);

        $$(document).on('page:init', (e, page) => {
            if ( page.name == 'home' ) {
                this.searchbar = f7.searchbar.create({
                    el: '.searchbar',
                    customSearch: true,
                    expandable: true,
                    backdrop: false,
                    on: {
                        search: (bar, curval, prevval) => {
                        }
                    }
                });
            }
        });

        this.onSettingsClick = this.onSettingsClick.bind(this);
        this.onSearchClick = this.onSearchClick.bind(this);
    }

    componentDidMount(){
        const $$ = Dom7;
        this.$repalce = $$('#idx-replace-val');
    }

    onSettingsClick(e) {
        if ( Device.phone ) {
            // f7.popup.open('.settings-popup');
        } else f7.popover.open('#idx-search-settings', '#idx-btn-search-settings');
    }

    searchParams() {
        let params = {
            find: this.searchbar.query
        };

        if ( searchOptions.usereplace )
            params.replace = this.$replace.val();

        return params;
    }

    onSearchClick(action) {
        if ( this.searchbar && this.searchbar.query) {
            if ( this.props.onSearchQuery ) {
                let params = this.searchParams();
                params.to = action;

                this.props.onSearchQuery(params);
            }
        }
    }

    render() {
        const usereplace = searchOptions.usereplace;
        const hidden = {display: "none"};
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
                    <div className="searchbar-input-wrap" style={!usereplace ? hidden: null}>
                        <input placeholder="Replace" type="search" id="idx-replace-val" />
                        <i className="searchbar-icon" />
                        <span className="input-clear-button" />
                    </div>
                    <div className="buttons-row">
                        <a className="link icon-only prev disabled1" onClick={e => this.onSearchClick('back')}>
                            <i className="icon icon-prev" />
                        </a>
                        <a className="link icon-only next disabled1" onClick={e => this.onSearchClick('next')}>
                            <i className="icon icon-next" />
                        </a>
                    </div>
                    <span className="searchbar-disable-button">Cancel</span>
                </div>
            </form>
        )
    }
}

export {SearchView as default, SearchView, SearchSettingsView};
