Ext.define('SSE.controller.Search', {
    extend: 'Ext.app.Controller',

    config: {
        refs: {
            nextResult      : '#id-btn-search-prev',
            previousResult  : '#id-btn-search-next',
            searchField     : '#id-field-search'
        },

        control: {
            '#id-btn-search-prev': {
                tap: 'onPreviousResult'
            },
            '#id-btn-search-next': {
                tap: 'onNextResult'
            },
            '#id-field-search': {
                keyup: 'onSearchKeyUp',
                change: 'onSearchChange',
                clearicontap: 'onSearchClear'
            }
        }
    },

    _step: -1,

    init: function() {
    },

    setApi: function(o) {
        this.api = o;
    },

    onNextResult: function(){
        var searchField = this.getSearchField();
        if (this.api && searchField){
            this.api.asc_findText(searchField.getValue(), true, true);
        }
    },

    onPreviousResult: function(){
        var searchField = this.getSearchField();
        if (this.api && searchField){
            this.api.asc_findText(searchField.getValue(), true, false);
        }
    },

    onSearchKeyUp: function(field, e){
        var keyCode = e.event.keyCode,
            searchField = this.getSearchField();

        if (keyCode == 13 && this.api) {
            this.api.asc_findText(searchField.getValue(), true, true);
        }
        this.updateNavigation();
    },

    onSearchChange: function(field, newValue, oldValue){
        this.updateNavigation();
    },

    onSearchClear: function(field, e){
        this.updateNavigation();

        // workaround blur problem in iframe (bug #12685)
        window.focus();
        document.activeElement.blur();
    },

    updateNavigation: function(){
        var searchField = this.getSearchField(),
            nextResult = this.getNextResult(),
            previousResult = this.getPreviousResult();

        if (searchField && nextResult && previousResult){
            nextResult.setDisabled(searchField.getValue() == '');
            previousResult.setDisabled(searchField.getValue() == '');
        }
    }
});
