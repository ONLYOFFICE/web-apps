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

const SEARCH_BACKWARD = 'back';
const SEARCH_FORWARD = 'next';

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

        this.state = {
            searchQuery: '',
            replaceQuery: ''
        };

        $$(document).on('page:init', (e, page) => {
            if ( page.name == 'home' ) {
                this.searchbar = f7.searchbar.create({
                    el: '.searchbar',
                    customSearch: true,
                    expandable: true,
                    backdrop: false,
                    on: {
                        search: (bar, curval, prevval) => {
                        },
                        enable: this.onSearchbarShow.bind(this, true),
                        disable: this.onSearchbarShow.bind(this, false)
                    }
                });

                // function iOSVersion() {
                //     var ua = navigator.userAgent;
                //     var m;
                //     return (m = /(iPad|iPhone|iphone).*?(OS |os |OS\_)(\d+((_|\.)\d)?((_|\.)\d)?)/.exec(ua)) ? parseFloat(m[3]) : 0;
                // }

                const $$ = Dom7;
                const $editor = $$('#editor_sdk');
                if (false /*iOSVersion() < 13*/) {
                    // $editor.single('mousedown touchstart', _.bind(me.onEditorTouchStart, me));
                    // $editor.single('mouseup touchend',     _.bind(me.onEditorTouchEnd, me));
                } else {
                    // $editor.single('pointerdown', this.onEditorTouchStart, me));
                    // $editor.single('pointerup',     _.bind(me.onEditorTouchEnd, me));
                }

                $editor.on('pointerdown', this.onEditorTouchStart.bind(this));
                $editor.on('pointerup',   this.onEditorTouchEnd.bind(this));
            }
        });

        this.onSettingsClick = this.onSettingsClick.bind(this);
        this.onSearchClick = this.onSearchClick.bind(this);
        this.onReplaceClick = this.onReplaceClick.bind(this);
    }

    componentDidMount(){
        const $$ = Dom7;
        this.$replace = $$('#idx-replace-val');
    }

    onSettingsClick(e) {
        if ( Device.phone ) {
            // f7.popup.open('.settings-popup');
            f7.popover.open('#idx-search-settings', '#idx-btn-search-settings');
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
                params.forward = action != SEARCH_BACKWARD;

                this.props.onSearchQuery(params);
            }
        }
    }

    onReplaceClick() {
        if ( this.searchbar && this.searchbar.query) {
            if ( this.props.onReplaceQuery ) {
                let params = this.searchParams();
                this.props.onReplaceQuery(params);
            }   
        }
    }

    onSearchbarShow(isshowed, bar) {
        if ( !isshowed ) {
            this.$replace.val('');
        }
    }

    onEditorTouchStart(e) {
        this.startPoint = this.pointerPosition(e);
    }

    onEditorTouchEnd(e) {
        const endPoint = this.pointerPosition(e);

        if ( this.searchbar.enabled ) {
            const distance = (this.startPoint.x === undefined || this.startPoint.y === undefined) ? 0 :
                Math.sqrt((endPoint.x -= this.startPoint.x) * endPoint.x + (endPoint.y -= this.startPoint.y) * endPoint.y);

            if ( distance < 1 ) {
                this.searchbar.disable();
            }
        }
    }

    pointerPosition(e) {
        let out = {x:0, y:0};
        if ( e.type == 'touchstart' || e.type == 'touchend' ) {
            const touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
            out.x = touch.pageX;
            out.y = touch.pageY;
        } else
        if ( e.type == 'mousedown' || e.type == 'mouseup' ) {
            out.x = e.pageX;
            out.y = e.pageY;
        }

        return out;
    }

    changeSearchQuery(value) {
        this.setState({
            searchQuery: value
        });
    }

    changeReplaceQuery(value) {
        this.setState({
            replaceQuery: value
        });
    }

    render() {
        const usereplace = searchOptions.usereplace;
        const hidden = {display: "none"};
        const searchQuery = this.state.searchQuery;
        const replaceQuery = this.state.replaceQuery;

        // console.log(searchQuery);
        // console.log(replaceQuery)

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
                        <input placeholder="Search" type="search" value={searchQuery} 
                            onChange={e => {this.changeSearchQuery(e.target.value)}} />
                        <i className="searchbar-icon" />
                        <span className="input-clear-button" />
                    </div>
                    <div className="searchbar-input-wrap" style={!usereplace ? hidden: null}>
                        <input placeholder="Replace" type="search" id="idx-replace-val" value={replaceQuery} 
                            onChange={e => {this.changeReplaceQuery(e.target.value)}} />
                        <i className="searchbar-icon" />
                        <span className="input-clear-button" />
                    </div>
                    <div className="buttons-row">
                        <a className={"link replace " + (searchQuery.trim().length ? "" : "disabled")} style={!usereplace ? hidden: null} onClick={() => this.onReplaceClick()}>Replace</a>
                        <a className={"link icon-only prev " + (searchQuery.trim().length ? "" : "disabled")} onClick={() => this.onSearchClick(SEARCH_BACKWARD)}>
                            <i className="icon icon-prev" />
                        </a>
                        <a className={"link icon-only next " + (searchQuery.trim().length ? "" : "disabled")} onClick={() => this.onSearchClick(SEARCH_FORWARD)}>
                            <i className="icon icon-next" />
                        </a>
                    </div>
                </div>
            </form>
        )
    }
}

export {SearchView as default, SearchView, SearchSettingsView};
