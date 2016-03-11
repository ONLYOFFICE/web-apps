Ext.define('DE.controller.Search', (function() {
    return {
        extend: 'Ext.app.Controller',

        config: {
            refs: {
                searchToolbar       : 'searchtoolbar',
                nextResultButton    : '#id-btn-search-down',
                previousResultButton: '#id-btn-search-up',
                searchField         : '#id-field-search'
            },

            control: {
                searchToolbar: {
                    hide        : 'onSearchToolbarHide'
                },
                previousResultButton: {
                    tap         : 'onPreviousResultButtonTap'
                },
                nextResultButton: {
                    tap         : 'onNextResultButtonTap'
                },
                searchField: {
                    keyup       : 'onSearchKeyUp',
                    change      : 'onSearchChange',
                    clearicontap: 'onClearSearch'
                }
            }
        },

        init: function() {
        },

        setApi: function(o) {
            this.api = o;
//            this.api.asc_registerCallback('asc_onSearchEnd',    Ext.bind(this.onApiSearchStop, this));
        },

        updateNavigation: function(){
            var text = this.getSearchField().getValue();

            this.getNextResultButton().setDisabled(!(text.length>0));
            this.getPreviousResultButton().setDisabled(!(text.length>0));
        },

        clearSearchResults: function() {
            if (this.getSearchField()) {
                this.getSearchField().setValue('');
                this.updateNavigation();
            }

            // workaround blur problem in iframe (bug #12685)
            window.focus();
            document.activeElement.blur();
        },

        onSearchToolbarHide: function() {
            this.clearSearchResults();
        },

        onNextResultButtonTap: function(){
            this.api.asc_findText(this.getSearchField().getValue(), true);
        },

        onPreviousResultButtonTap: function(){
            this.api.asc_findText(this.getSearchField().getValue(), false);
        },

        onSearchKeyUp: function(field, e){
            if (e.event.keyCode == 13 && field.getValue().length > 0) {
                this.api.asc_findText(field.getValue(), true);
            }
            this.updateNavigation();
        },

        onSearchChange: function(field, newValue, oldValue){
            this.updateNavigation();
        },

        onClearSearch: function(field, e){
            this.clearSearchResults();
        }

//        onApiSearchStop: function() {
//            Ext.Viewport.unmask();
//            this.updateNavigation();
//        }
    }
})());
