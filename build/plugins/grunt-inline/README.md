# grunt-inline[![build status](https://secure.travis-ci.org/miniflycn/grunt-inline.png)](http://travis-ci.org/miniflycn/grunt-inline)

Brings externally referenced resources, such as js, css and images, into
a single file.

For exmample: 

```html
<link href="css/style.css?__inline=true" rel="stylesheet" />
```

is replaced with

```html
<style>
/* contents of css/style.css */
</style>
```

JavaScript references are brought inline, and images in the html
and css blocks are converted to base-64 data: urls.

By default, only urls marked with `__inline` are converted, however this
behavior can be overrided via the `tag:` option.


## Getting Started

This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```bash
npm install grunt-inline --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```bash
grunt.loadNpmTasks('grunt-inline');
```

## The "grunt-inline" task

### Overview

In your project's Gruntfile, add a section named `inline` to the data object passed into `grunt.initConfig()`.

```javascript
grunt.initConfig({
  inline: {
    dist: {
      src: 'src/index.html',
      dest: 'dist/index.html'
    }
  }
});
```

### Options

#### dest

If dest is assigned, the the source file will be copied to the destination path. eg:
`src/index.html` will be processed and then copied to `dist/index.html`

```javascript
grunt.initConfig({
  inline: {
    dist: {
      src: 'src/index.html',
      dest: 'dist/index.html'
    }
  } 
});
```

### cssmin

If cssmin is assigned true, `.css` will be minified before inlined.

```javascript
grunt.initConfig({
  inline: {
    dist: {
      options:{
        cssmin: true
      },
      src: 'src/index.html',
      dest: 'dist/index.html'
    }
  }
});
```

### tag (defaults to ```__inline```)

Only URLs that contain the value for ```tag``` will be inlined.
Specify ```tag: ''``` to include all urls.

```javascript
grunt.initConfig({
  inline: {
    dist: {
      options:{
        tag: ''
      },
      src: 'src/index.html',
      dest: 'dist/index.html']
    }
  }
});
```


### inlineTagAttributes

Ability to add attributes string to inline tag.

```javascript
grunt.initConfig({
  inline: {
    dist: {
      options:{
        inlineTagAttributes: {
          js: 'data-inlined="true"',  // Adds <script data-inlined="true">...</script>
          css: 'data-inlined="true"'  // Adds <style data-inlined="true">...</style>
        },
        src: 'src/index.html',
        dest: 'dist/index.html'
     }
    }
  }
});
```

### uglify

If uglify is assigned true, `.js` file will be minified before inlined.

```javascript
grunt.initConfig({
  inline: {
    dist: {
      options:{
        uglify: true
      },
      src: 'src/index.html',
      dest: 'dist/index.html'
    }
  }
});
```

### exts

Setting an exts array allows multiple file extensions to be processed as
html.

```javascript
grunt.initConfig({
  inline: {
    dist: {
      options:{
        exts: ['jade'],
        uglify: true
      },
      src: 'src/index.jade',
      dest: 'dist/index.jade'
    }
  }
});
```

### Usage Examples

> config

```javascript
grunt.initConfig({
  inline: {
  	dist: {
  	  src: 'src/index.html'
  	}
  }
});
```

>src/index.html

```html
<html>
<head>
  <title>demo</title>
  <link href="css/style.css?__inline=true" rel="stylesheet" />
</head>
<body>
  <img src="img/icon.png?__inline=true" />

  <script src="js/erport.js?__inline=true"></script>
</body>
</html>
```

after `grunt inline` was run, it will be something like

```html
<html>
<head>
  <title>demo</title>
  <style>
  .container{
    padding: 0;
    }
  </style>
</head>
<body>
  <! -- base64, a terrible mass you know…so just show a little bit ...--> 
  <img src="idata:image/png;base64data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEMAAAAYCAYAAAChg0BHAA..." />

  <script>
  var Report = (function(){ 
    return {
      init: function(){
      }
    };
  })();
</script>
</body>
</html>
```

#### inline tag

Suppose there is an `<inline>` tag in `index.html` like bellow

```html
<!-- inline tag -->
<inline src="test.html" />
```

The content of `test.html` is

```html
<p>I'm inline html</p>
<span>hello world!</span>
```

Then, after the `inline` task is run, the original content in `index.html` will be replaced with

```html
<p>I'm inline html</p>
<span>hello world!</span>
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
* 2019-12-20 v0.3.7 document optimized: markdown style problems of README
* 2015-01-09 v0.3.3 bug fix: when processing files of a folder and then copy the processed content to another destination, the original files are changed unexpectedly, as mentioned in this issue [Support file globbing for input and output](https://github.com/chyingp/grunt-inline/issues/35)
* 2014-06-16 v0.3.1 bug fix: protocol-relative urls in css are messed up
* 2014-06-15 v0.3.1 bug fix: when options.tag is '', then all img tags, whose src attribute has already been inlined will be matched.
* 2014-05-19 v0.3.0 support for new options.exts
* 2014-05-19 v0.2.9 bug fix: options.tag is assigned '', bug image url in css are not converted to base64 formate
* 2014-03-06  v0.2.6 bug fix: script tags like <script src="index.js?__inline">\n</script> were not inlined
* 2014-01-31  v0.2.3 radded tag option, encode url(..) images.
* 2013-10-31  v0.2.2 bug fix: img urls like 'background: url(http://www.example.com/img/bg.png)' will be transformed to 'background: url(url(http://www.example.com/img/bg.png))'
* 2013-10-30  v0.2.1 bug fix: when processing relative file path of img url in css stylesheet, forgot to transform "\" to "/" for windows users
* 2013-10-30  v0.2.0 new feature: Support for minifing js、css when they ar inlined into html.
* 2013-08-30  v0.1.9 bug fix: stylesheets ended with ">" cannot be inlined
* 2013-09-02  v0.1.9 add feature: add options.dest to assign a destination path where the source file will be copied
* 2013-09-02  v0.1.8 add feature: support for `<inline>` tag
