/*
 * grunt-inline
 * https://github.com/chyingp/grunt-inline
 *
 * Copyright (c) 2015 Auguest G. casper & IMWEB TEAM
 */

'use strict';

module.exports = function(grunt) {

    var path = require('path');
    var datauri = require('datauri');
    var UglifyJS = require("uglify-js");
    var CleanCSS = require('clean-css');

    grunt.registerMultiTask('inline', "Replaces <link>, <script> and <img> tags to their inline contents", function() {

        var options = this.options({tag: '__inline'}),
            uglify = !!options.uglify,
            cssmin = !!options.cssmin,
            relativeTo = this.options().relativeTo,
            exts = options.exts,
            dest = this.data.dest,
            isExpandedPair;

        this.files.forEach(function(filePair){

            isExpandedPair = filePair.orig.expand || false;

            filePair.src.forEach(function(filepath){

                var fileType = path.extname(filepath).replace(/^\./, '');
                var fileContent = grunt.file.read(filepath);
                var destFilepath = '';

                grunt.log.write('Processing ' + filepath + '...')

                if(fileType==='html' || (exts && exts.indexOf(fileType) > -1)){
                    fileContent = html(filepath, fileContent, relativeTo, options);
                }else if(fileType==='css'){
                    fileContent = css(filepath, fileContent, relativeTo, options);
                }

                if(detectDestType(filePair.dest) === 'directory') {
                    destFilepath = (isExpandedPair) ? filePair.dest : unixifyPath(path.join(filePair.dest, filepath));
                }else{
                    destFilepath = filePair.dest || filepath;
                }

                grunt.file.write(destFilepath, fileContent);
                grunt.log.ok()
            });
        });
    });

    function isRemotePath( url ){
        return url.match(/^'?https?:\/\//) || url.match(/^\/\//);
    }

    function isBase64Path( url ){
        return url.match(/^'?data.*base64/);
    }

    // code from grunt-contrib-copy, with a little modification
    function detectDestType(dest) {
        if (grunt.util._.endsWith(dest, '/')) {
            return 'directory';
        } else {
            return 'file';
        }
    }

    function unixifyPath(filepath) {
        if (process.platform === 'win32') {
            return filepath.replace(/\\/g, '/');
        } else {
            return filepath;
        }
    }

    // from grunt-text-replace.js in grunt-text-replace
    function getPathToDestination(pathToSource, pathToDestinationFile) {
        var isDestinationDirectory = (/\/$/).test(pathToDestinationFile);
        var fileName = path.basename(pathToSource);
        var newPathToDestination;
        if (typeof pathToDestinationFile === 'undefined') {
            newPathToDestination = pathToSource;
        } else {
            newPathToDestination = pathToDestinationFile + (isDestinationDirectory ? fileName : '');
        }
        return newPathToDestination;
    }

    function html(filepath, fileContent, relativeTo, options){
        if(relativeTo){
            filepath = filepath.replace(/[^\/]+\//, relativeTo);
        }

        fileContent = fileContent.replace(/<inline.+?src=["']([^"']+?)["']\s*?\/>/g, function(matchedWord, src){
            var ret = matchedWord;

            if(isRemotePath(src) || !grunt.file.isPathAbsolute(src)){

                var inlineFilePath = path.resolve( path.dirname(filepath), src );
                if( grunt.file.exists(inlineFilePath) ){
                    ret = grunt.file.read( inlineFilePath );

                    // @otod need to be checked, add bye herbert
                    var _more = src.match(/^(..\/)+/ig);
                    if(_more = _more && _more[0]){
                        var _addMore = function(){
                            var _ret = arguments[0],_src = arguments[2];
                            if(!_src.match(/^http\:\/\//)){
                                _ret =arguments[1] +  _more + arguments[2] + arguments[3];
                                grunt.log.writeln('inline >含有相对目录进行替换操作,替换之后的路径：' + _ret );
                            }
                            return _ret;
                        }
                        ret = ret.replace(/(<script.+?src=["'])([^"']+?)(["'].*?><\/script>)/g,_addMore);
                    }
                }else{
                    grunt.log.error("Couldn't find " + inlineFilePath + '!');
                }
            }

            return ret;
        }).replace(/<script.+?src=["']([^"']+?)["'].*?>\s*<\/script>/g, function(matchedWord, src){
            var ret = matchedWord;

            if(!isRemotePath(src) && src.indexOf(options.tag)!=-1){
                var inlineFilePath = path.resolve( path.dirname(filepath), src ).replace(/\?.*$/, '');  // 将参数去掉
                if( grunt.file.exists(inlineFilePath) ) {
                    const rawstr = grunt.file.read(inlineFilePath);
                    let c = rawstr;
                    
                    if ( options.uglify ) {
                        const opts = {
                            output: {
                                comments: false,
                                beautify: false,
                            },
                            mangle: false,
                            compress: false,
                        };
                        const uglstr = UglifyJS.minify(rawstr, opts);
                        if ( uglstr.error == undefined ) 
                            c = uglstr.code;
                        else grunt.log.error("uglify error " + uglstr.code);
                    }

                    ret = '<script>\n' + c + '\n</script>';
                }else{
                    grunt.log.error("Couldn't find " + inlineFilePath + '!');
                }
            }
            grunt.log.debug('ret = : ' + ret +'\n');

            return ret;

        }).replace(/<link.+?href=["']([^"']+?)["'].*?\/?>/g, function(matchedWord, src){
            var ret = matchedWord;

            if(!isRemotePath(src) && src.indexOf(options.tag)!=-1){

                var inlineFilePath = path.resolve( path.dirname(filepath), src ).replace(/\?.*$/, '');  // 将参数去掉

                if( grunt.file.exists(inlineFilePath) ){
                    var styleSheetContent = grunt.file.read( inlineFilePath );
                    ret = '<style>\n' + cssInlineToHtml(filepath, inlineFilePath, styleSheetContent, relativeTo, options) + '\n</style>';
                }else{
                    grunt.log.error("Couldn't find " + inlineFilePath + '!');
                }
            }
            grunt.log.debug('ret = : ' + ret +'\n');

            return ret;
        }).replace(/<img.+?src=["']([^"':]+?)["'].*?\/?\s*?>/g, function(matchedWord, src){
            var ret = matchedWord;

            if(!grunt.file.isPathAbsolute(src) && src.indexOf(options.tag)!=-1){

                var inlineFilePath = path.resolve( path.dirname(filepath), src ).replace(/\?.*$/, '');  // 将参数去掉

                if( grunt.file.exists(inlineFilePath) ){
                    ret = matchedWord.replace(src, (new datauri(inlineFilePath)).content);
                }else{
                    grunt.log.error("Couldn't find " + inlineFilePath + '!');
                }
            }
            grunt.log.debug('ret = : ' + ret +'\n');

            return ret;
        });

        return fileContent;
    }

    function css(filepath, fileContent, relativeTo, options) {
        if(relativeTo){
            filepath = filepath.replace(/[^\/]+\//g, relativeTo);
        }

        fileContent = fileContent.replace(/url\(["']*([^)'"]+)["']*\)/g, function(matchedWord, imgUrl){
            var newUrl = imgUrl;
            var flag = imgUrl.indexOf(options.tag)!=-1; // urls like "img/bg.png?__inline" will be transformed to base64
            if(isBase64Path(imgUrl) || isRemotePath(imgUrl)){
                return matchedWord;
            }
            grunt.log.debug( 'imgUrl: '+imgUrl);
            grunt.log.debug( 'filepath: '+filepath);
            var absoluteImgurl = path.resolve( path.dirname(filepath),imgUrl );
            grunt.log.debug( 'absoluteImgurl: '+absoluteImgurl);
            newUrl = path.relative( path.dirname(filepath), absoluteImgurl );
            grunt.log.debug( 'newUrl: '+newUrl);

            absoluteImgurl = absoluteImgurl.replace(/\?.*$/, '');
            if(flag && grunt.file.exists(absoluteImgurl)){
                newUrl = datauri(absoluteImgurl);
            }else{
                newUrl = newUrl.replace(/\\/g, '/');
            }

            return matchedWord.replace(imgUrl, newUrl);
        });
        fileContent = options.cssmin ? CleanCSS.process(fileContent) : fileContent;

        return fileContent;
    }

    function cssInlineToHtml(htmlFilepath, filepath, fileContent, relativeTo, options) {
        if(relativeTo){
            filepath = filepath.replace(/[^\/]+\//g, relativeTo);
        }

        fileContent = fileContent.replace(/url\(["']*([^)'"]+)["']*\)/g, function(matchedWord, imgUrl){
            var newUrl = imgUrl;
            var flag = !!imgUrl.match(/\?__inline/);    // urls like "img/bg.png?__inline" will be transformed to base64
            grunt.log.debug('flag:'+flag);
            if(isBase64Path(imgUrl) || isRemotePath(imgUrl)){
                return matchedWord;
            }
            grunt.log.debug( 'imgUrl: '+imgUrl);
            grunt.log.debug( 'filepath: '+filepath);
            var absoluteImgurl = path.resolve( path.dirname(filepath),imgUrl ); // img url relative to project root
            grunt.log.debug( 'absoluteImgurl: '+absoluteImgurl);
            newUrl = path.relative( path.dirname(htmlFilepath), absoluteImgurl );   // img url relative to the html file
            grunt.log.debug([htmlFilepath, filepath, absoluteImgurl, imgUrl]);
            grunt.log.debug( 'newUrl: '+newUrl);

            absoluteImgurl = absoluteImgurl.replace(/\?.*$/, '');
            if(flag && grunt.file.exists(absoluteImgurl)){
                newUrl = datauri(absoluteImgurl);
            }else{
                newUrl = newUrl.replace(/\\/g, '/');
            }

            return matchedWord.replace(imgUrl, newUrl);
        });
        fileContent = options.cssmin ? CleanCSS.process(fileContent) : fileContent;

        return fileContent;
    }
};
