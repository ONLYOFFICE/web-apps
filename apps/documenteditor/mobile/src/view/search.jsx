import React, { Component } from 'react';
import { Searchbar, Link } from 'framework7-react';
import { f7ready, f7 } from 'framework7-react';

export default class SearchView extends Component {
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
    }

    componentDidMount(){
    }

    render() {
        return (
            <form className="searchbar">
                <div className="searchbar-bg"></div>
                <div className="searchbar-inner">
                    <div className="buttons-row">
                        <a id="search-settings" className="link icon-only" onClick={e => console.log('search settings click')}>
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
