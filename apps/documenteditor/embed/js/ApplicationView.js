var ApplicationView = new(function(){

    // Initialize view

    function createView(){
        $('#id-btn-share').popover({
            trigger     : 'manual',
            html        : true,
            template    : '<div class="popover share" id="id-popover-share"><div class="arrow"></div><div class="popover-inner"><div class="popover-content"><p></p></div></div></div>',
            content     : '<div class="share-link">' +
                              '<span class="caption">Link:</span>' +
                              '<input id="id-short-url" class="input-xs form-control" readonly/>' +
                              '<button id="id-btn-copy-short" type="button" class="btn btn-xs btn-primary" style="width: 65px;" data-copied-text="Copied">Copy</button>' +
                          '</div> ' +
                              '<div class="share-buttons" style="height: 25px" id="id-popover-social-container" data-loaded="false">' +
                              '<ul></ul>' +
                          '</div>'
        }).popover('show');

        $('#id-btn-embed').popover({
            trigger     : 'manual',
            html        : true,
            template    : '<div class="popover embed" id="id-popover-embed"><div class="arrow"></div><div class="popover-inner"><div class="popover-content"><p></p></div></div></div>',
            content     : '<div class="size-manual">' +
                              '<span class="caption">Width:</span>' +
                              '<input id="id-input-embed-width" class="form-control input-xs" type="text" value="400px">' +
                              '<input id="id-input-embed-height" class="form-control input-xs right" type="text" value="600px">' +
                              '<span class="right caption">Height:</span>' +
                          '</div>' +
                          '<textarea id="id-textarea-embed" rows="4" class="form-control" readonly></textarea>' +
                          '<button id="id-btn-copy-embed" type="button" class="btn btn-xs btn-primary" data-copied-text="Copied">Copy</button>'


        }).popover('show');

        $('body').popover({
            trigger     : 'manual',
            html        : true,
            animation   : false,
            template    : '<div class="popover hyperlink" id="id-tip-hyperlink"><div class="popover-inner"><div class="popover-content"><p></p></div></div></div>',
            content     : '<br><b>Press Ctrl and click link</b>'
        }).popover('show');
    }

    return {
        create: createView
    }
})();
