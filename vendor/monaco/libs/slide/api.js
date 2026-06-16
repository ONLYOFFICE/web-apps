/**
* @global
* @class
* @name Api
*/
var ApiInterface = function() {};
var Api = new ApiInterface();

/**
* Class representing a container for paragraphs and tables.
* @param Document
* @constructor
*/
function ApiDocumentContent() {}

/**
* Class representing the paragraph properties.
* @constructor
*/
function ApiParaPr() {}

/**
* Class representing a paragraph bullet.
* @constructor
*/
function ApiBullet() {}

/**
* Class representing a paragraph.
* @constructor
* @extends {ApiParaPr}
*/
function ApiParagraph() {}

ApiParagraph.prototype = new ApiParaPr();

/**
* Class representing a table.
* @param oGraphicFrame
* @constructor
* @extends {ApiDrawing}
*/
function ApiTable() {}

ApiTable.prototype = new ApiDrawing();

/**
* Class representing the text properties.
* @constructor
*/
function ApiTextPr() {}

/**
* Class representing a small text block called 'run'.
* @constructor
* @extends {ApiTextPr}
*/
function ApiRun() {}

ApiRun.prototype = new ApiTextPr();

/**
* Class representing a comment.
* @constructor
*/
function ApiComment() {}

/**
* Class representing a comment reply.
* @constructor
*/
function ApiCommentReply() {}

/**
* Class representing a Paragraph hyperlink.
* @constructor
*/
function ApiHyperlink() {}

/**
* Class representing a table row.
* @param oTableRow
* @constructor
*/
function ApiTableRow() {}

/**
* Class representing a table cell.
* @param oCell
* @constructor
*/
function ApiTableCell() {}

/**
* Class representing an unsupported element.
* @constructor
*/
function ApiUnsupported() {}

/**
* Class representing a graphical object.
* @constructor
*/
function ApiDrawing() {}

/**
* Class representing an image.
* @constructor
* @extends {ApiDrawing}
*/
function ApiImage() {}

ApiImage.prototype = new ApiDrawing();

/**
* Class representing an OLE object.
* @constructor
* @extends {ApiDrawing}
*/
function ApiOleObject() {}

ApiOleObject.prototype = new ApiDrawing();

/**
* Class representing a shape.
* @constructor
* @extends {ApiDrawing}
*/
function ApiShape() {}

ApiShape.prototype = new ApiDrawing();

/**
* Class representing a chart.
* @constructor
* @extends {ApiDrawing}
*/
function ApiChart() {}

ApiChart.prototype = new ApiDrawing();

/**
* Class representing a group of drawings.
* @constructor
* @extends {ApiDrawing}
*/
function ApiGroup() {}

ApiGroup.prototype = new ApiDrawing();

/**
* Class representing the shape geometry.
* @constructor
*/
function ApiGeometry() {}

/**
* Class representing a path command.
* @constructor
*/
function ApiPathCommand() {}

/**
* Class representing a path in geometry.
* @constructor
*/
function ApiPath() {}

/**
* Class representing a chart series.
* @constructor
*
*/
function ApiChartSeries() {}

/**
* Class representing a base class for color types.
* @constructor
*/
function ApiUniColor() {}

/**
* Class representing an RGB Color.
* @constructor
* @extends {ApiUniColor}
*/
function ApiRGBColor() {}

ApiRGBColor.prototype = new ApiUniColor();

/**
* Class representing a Scheme Color.
* @constructor
* @extends {ApiUniColor}
*/
function ApiSchemeColor() {}

ApiSchemeColor.prototype = new ApiUniColor();

/**
* Class representing a Preset Color.
* @constructor
* @extends {ApiUniColor}
*/
function ApiPresetColor() {}

ApiPresetColor.prototype = new ApiUniColor();

/**
* Represents a color that can be applied to text.
* @constructor
*/
function ApiColor() {}

/**
* Class representing a base class for fill.
* @constructor
*/
function ApiFill() {}

/**
* Class representing a stroke.
* @constructor
*/
function ApiStroke() {}

/**
* Class representing gradient stop.
* @constructor
*/
function ApiGradientStop() {}

/**
* Class representing document properties (similar to BuiltInDocumentProperties in VBA).
* @constructor
*/
function ApiCore() {}

/**
* Class representing custom properties of the document.
* @constructor
*/
function ApiCustomProperties() {}

/**
* Class representing a custom XML manager, which provides methods to manage custom XML parts in the document.
* @param doc - The current document.
* @constructor
*/
function ApiCustomXmlParts() {}

/**
* Class representing a custom XML part.
* @constructor
* @since 9.0.0
* @param {Object} customXMl - The custom XML object.
* @param {Object} customXmlManager - The custom XML manager instance.
* @memberof ApiCustomXmlPart
*/
function ApiCustomXmlPart() {}

/**
* Class representing a custom XML node.
* @constructor
* @since 9.0.0
* @param xmlNode - The custom XML node.
* @param xmlPart - The custom XML part.
*/
function ApiCustomXmlNode() {}

/**
* Class representing a smart art.
* @constructor
* @extends {ApiDrawing}
*/
function ApiSmartArt() {}

ApiSmartArt.prototype = new ApiDrawing();

/**
* Class representing a presentation.
* @constructor
*/
function ApiPresentation() {}

/**
* Class representing a slide master.
* @constructor
*/
function ApiMaster() {}

/**
* Class representing a slide layout.
* @constructor
*/
function ApiLayout() {}

/**
* Class representing a placeholder.
* @constructor
*/
function ApiPlaceholder() {}

/**
* Class representing a presentation theme.
* @constructor
*/
function ApiTheme() {}

/**
* Class representing a theme color scheme.
* @constructor
*/
function ApiThemeColorScheme() {}

/**
* Class representing a theme format scheme.
* @constructor
*/
function ApiThemeFormatScheme() {}

/**
* Class representing a theme font scheme.
* @constructor
*/
function ApiThemeFontScheme() {}

/**
* Class representing a slide.
* @constructor
*/
function ApiSlide() {}

/**
* Class representing a notes page.
* @constructor
*/
function ApiNotesPage() {}

/**
* Class representing a slide show transition.
* @constructor
*/
function ApiSlideShowTransition() {}

/**
* Class representing animation timeline for a slide.
* @constructor
*/
function ApiTimeLine() {}

/**
* Class representing an animation sequence (main sequence or interactive sequence).
* @constructor
*/
function ApiAnimationSequence() {}

/**
* Class representing an animation effect.
* @constructor
*/
function ApiAnimationEffect() {}

/**
* Class representing the selection in the presentation.
* @constructor
*/
function ApiSelection() {}

/**
* Returns a type of the ApiHyperlink class.
* @memberof ApiHyperlink
* @returns {"hyperlink"}
*/
ApiHyperlink.prototype.GetClassType = function() { return ""; };

/**
* Sets the hyperlink address.
* @memberof ApiHyperlink
* @param {string} sLink - The hyperlink address.
* @returns {boolean}
*/
ApiHyperlink.prototype.SetLink = function(sLink) { return true; };

/**
* Sets the screen tip text of the hyperlink.
* @memberof ApiHyperlink
* @param {string} sScreenTipText - The screen tip text of the hyperlink.
* @returns {boolean}
*/
ApiHyperlink.prototype.SetScreenTipText = function(sScreenTipText) { return true; };

/**
* Returns the hyperlink address.
* @memberof ApiHyperlink
* @returns {string} 
*/
ApiHyperlink.prototype.GetLinkedText = function() { return ""; };

/**
* Returns the screen tip text of the hyperlink.
* @memberof ApiHyperlink
* @returns {string} 
*/
ApiHyperlink.prototype.GetScreenTipText = function() { return ""; };

/**
* Returns the hyperlink element using the position specified.
* @memberof ApiHyperlink
* @param {number} nPos - The position where the element which content we want to get must be located.
* @returns {?ParagraphContent}
*/
ApiHyperlink.prototype.GetElement = function(nPos) { return new ParagraphContent(); };

/**
* Returns a number of elements in the current hyperlink.
* @memberof ApiHyperlink
* @returns {number}
*/
ApiHyperlink.prototype.GetElementsCount = function() { return 0; };

/**
* Creates a new smaller text block to be inserted to the current paragraph or table.
* @memberof Api
* @returns {ApiRun}
*/
ApiInterface.prototype.CreateRun = function() { return new ApiRun(); };

/**
* Creates a new custom geometry.
* @memberof Api
* @returns {ApiGeometry}
* @since 9.1.0
*/
ApiInterface.prototype.CreateCustomGeometry = function() { return new ApiGeometry(); };

/**
* Creates a geometry using one of the available preset shapes.
* @memberof Api
* @param {ShapeType} sPreset - The preset name.
* @returns {ApiGeometry | null}
* @since 9.1.0
*/
ApiInterface.prototype.CreatePresetGeometry = function(sPreset) { return new ApiGeometry(); };

/**
* Creates an RGB color setting the appropriate values for the red, green and blue color components.
* @memberof Api
* @param {byte} r - Red color component value.
* @param {byte} g - Green color component value.
* @param {byte} b - Blue color component value.
* @returns {ApiRGBColor}
*/
ApiInterface.prototype.CreateRGBColor = function(r, g, b) { return new ApiRGBColor(); };

/**
* Creates a complex color scheme selecting from one of the available schemes.
* @memberof Api
* @param {SchemeColorId} schemeColorId - The color scheme identifier.
* @returns {ApiSchemeColor}
*/
ApiInterface.prototype.CreateSchemeColor = function(schemeColorId) { return new ApiSchemeColor(); };

/**
* Creates a color selecting it from one of the available color presets.
* @memberof Api
* @param {PresetColor} presetColor - A preset selected from the list of the available color preset names.
* @returns {ApiPresetColor};
*/
ApiInterface.prototype.CreatePresetColor = function(presetColor) { return new ApiPresetColor(); };

/**
* Creates an RGB color from red, green and blue components.
*
* @memberof Api
* @param {byte} r - Red component (0-255).
* @param {byte} g - Green component (0-255).
* @param {byte} b - Blue component (0-255).
* @returns {ApiColor}
*/
ApiInterface.prototype.RGB = function(r, g, b) { return new ApiColor(); };

/**
* Creates an RGBA color from red, green, blue and alpha components.
*
* @memberof Api
* @param {byte} r - Red component (0-255).
* @param {byte} g - Green component (0-255).
* @param {byte} b - Blue component (0-255).
* @param {byte} a - Alpha component (0-255).
* @returns {ApiColor}
*/
ApiInterface.prototype.RGBA = function(r, g, b, a) { return new ApiColor(); };

/**
* Creates a color from a HEX string.
*
* @memberof Api
* @param {string} hexString
* @returns {ApiColor}
*/
ApiInterface.prototype.HexColor = function(hexString) { return new ApiColor(); };

/**
* Creates a theme color.
*
* @memberof Api
* @param {SchemeColorId} [name="tx1"] The theme color name. If the provided name is not supported, the 'tx1' color will be used.
* @returns {ApiColor} Instance of ApiColor with 'theme' type.
*/
ApiInterface.prototype.ThemeColor = function(name) { return new ApiColor(); };

/**
* Creates a solid fill to apply to the object using a selected solid color as the object background.
*
* @memberof Api
*
* @since 9.1.0
* @param {ApiColor} color - The color used for the element fill.
* @returns {ApiFill}
*
*/
ApiInterface.prototype.CreateSolidFill = function(color) { return new ApiFill(); };

/**
* Creates a linear gradient fill to apply to the object using the selected linear gradient as the object background.
* @memberof Api
* @param {number[]} gradientStops - The array of gradient color stops measured in 1000th of percent.
* @param {PositiveFixedAngle} angle - The angle measured in 60000th of a degree that will define the gradient direction.
* @returns {ApiFill}
*/
ApiInterface.prototype.CreateLinearGradientFill = function(gradientStops, angle) { return new ApiFill(); };

/**
* Creates a radial gradient fill to apply to the object using the selected radial gradient as the object background.
* @memberof Api
* @param {number[]} gradientStops - The array of gradient color stops measured in 1000th of percent.
* @returns {ApiFill}
*/
ApiInterface.prototype.CreateRadialGradientFill = function(gradientStops) { return new ApiFill(); };

/**
* Creates a pattern fill to apply to the object using the selected pattern as the object background.
*
* @memberof Api
*
* @since 9.1.0
* @param {PatternType} patternType - The pattern type used for the fill selected from one of the available pattern types.
* @param {ApiColor} bgColor - The background color used for the pattern creation.
* @param {ApiColor} fgColor - The foreground color used for the pattern creation.
* @returns {ApiFill}
*
*/
ApiInterface.prototype.CreatePatternFill = function(patternType, bgColor, fgColor) { return new ApiFill(); };

/**
* Creates a blip fill to apply to the object using the selected image as the object background.
* @memberof Api
* @param {string} imageUrl - The path to the image used for the blip fill (currently only internet URL or Base64 encoded images are supported).
* @param {BlipFillType} blipFillType - The type of the fill used for the blip fill (tile or stretch).
* @returns {ApiFill}
*/
ApiInterface.prototype.CreateBlipFill = function(imageUrl, blipFillType) { return new ApiFill(); };

/**
* Creates no fill and removes the fill from the element.
* @memberof Api
* @returns {ApiFill}
*/
ApiInterface.prototype.CreateNoFill = function() { return new ApiFill(); };

/**
* Creates a stroke adding shadows to the element.
*
* @memberof Api
*
* @since 9.3.0
* @param {EMU} width - The width of the shadow measured in English measure units.
* @param {ApiFill} fill - The fill type used to create the shadow.
* @param {DashType} [sDash="solid"] - The type of line dash.
* @returns {ApiStroke}
*
*/
ApiInterface.prototype.CreateStroke = function(width, fill, sDash) { return new ApiStroke(); };

/**
* Creates a gradient stop used for different types of gradients.
*
* @memberof Api
*
* @since 9.1.0
* @param {ApiColor} color - The color used for the gradient stop.
* @param {PositivePercentage} pos - The position of the gradient stop measured in 1000th of percent.
* @returns {ApiGradientStop}
*
*/
ApiInterface.prototype.CreateGradientStop = function(color, pos) { return new ApiGradientStop(); };

/**
* Creates a bullet for a paragraph with the character or symbol specified with the sSymbol parameter.
* @memberof Api
* @param {string} sSymbol - The character or symbol which will be used to create the bullet for the paragraph.
* @returns {ApiBullet}
*/
ApiInterface.prototype.CreateBullet = function(sSymbol) { return new ApiBullet(); };

/**
* Creates a bullet for a paragraph with the numbering character or symbol specified with the numType parameter.
* @memberof Api
* @param {BulletType} numType - The numbering type the paragraphs will be numbered with.
* @param {number} startAt - The number the first numbered paragraph will start with.
* @returns {ApiBullet}
*/
ApiInterface.prototype.CreateNumbering = function(numType, startAt) { return new ApiBullet(); };

/**
* Replaces each paragraph (or text in cell) in the select with the corresponding text from an array of strings.
* @memberof Api
* @param {string[]} textStrings - An array of replacement strings.
* @param {string} [tab="\t"] - A character which is used to specify the tab in the source text.
* @param {string} [newLine="\r\n"] - A character which is used to specify the line break character in the source text.
* @returns {boolean}
*/
ApiInterface.prototype.ReplaceTextSmart = function(textStrings, tab, newLine) { return true; };

/**
* Creates the empty text properties.
* @memberof Api
* @returns {ApiTextPr}
*/
ApiInterface.prototype.CreateTextPr = function() { return new ApiTextPr(); };

/**
* Returns the full name of the currently opened file.
* @memberof Api
* @returns {string}
*/
ApiInterface.prototype.GetFullName = function() { return ""; };

/**
* Converts pixels to EMUs (English Metric Units).
* @memberof Api
* @param {number} px - The number of pixels to convert to EMUs.
* @returns {number}
*/
ApiInterface.prototype.PixelsToEmus = function(px) { return 0; };

/**
* Converts millimeters to pixels.
* @memberof Api
* @param {number} mm - The number of millimeters to convert to pixels.
* @returns {number}
*/
ApiInterface.prototype.MillimetersToPixels = function(mm) { return 0; };

/**
* Converts points to centimeters.
* @memberof Api
* @param {number} pt - The number of points to convert to centimeters.
* @returns {number}
*/
ApiInterface.prototype.PointsToCentimeters = function(pt) { return 0; };

/**
* Converts points to EMUs (English Metric Units).
* @memberof Api
* @param {number} pt - The number of points to convert to EMUs.
* @returns {number}
*/
ApiInterface.prototype.PointsToEmus = function(pt) { return 0; };

/**
* Converts points to inches.
* @memberof Api
* @param {number} pt - The number of points to convert to inches.
* @returns {number}
*/
ApiInterface.prototype.PointsToInches = function(pt) { return 0; };

/**
* Converts points to lines (1 line = 12 points).
* @memberof Api
* @param {number} pt - The number of points to convert to lines.
* @returns {number}
*/
ApiInterface.prototype.PointsToLines = function(pt) { return 0; };

/**
* Converts points to millimeters.
* @memberof Api
* @param {number} pt - The number of points to convert to millimeters.
* @returns {number}
*/
ApiInterface.prototype.PointsToMillimeters = function(pt) { return 0; };

/**
* Converts points to picas (1 pica = 12 points).
* @memberof Api
* @param {number} pt - The number of points to convert to picas.
* @returns {number}
*/
ApiInterface.prototype.PointsToPicas = function(pt) { return 0; };

/**
* Converts points to pixels.
* @memberof Api
* @param {number} pt - The number of points to convert to pixels.
* @returns {number}
*/
ApiInterface.prototype.PointsToPixels = function(pt) { return 0; };

/**
* Converts points to twips.
* @memberof Api
* @param {number} pt - The number of points to convert to twips.
* @returns {number}
*/
ApiInterface.prototype.PointsToTwips = function(pt) { return 0; };

/**
* Converts centimeters to points.
* @memberof Api
* @param {number} cm - The number of centimeters to convert to points.
* @returns {number}
*/
ApiInterface.prototype.CentimetersToPoints = function(cm) { return 0; };

/**
* Converts EMUs (English Metric Units) to points.
* @memberof Api
* @param {number} emu - The number of EMUs to convert to points.
* @returns {number}
*/
ApiInterface.prototype.EmusToPoints = function(emu) { return 0; };

/**
* Converts inches to points.
* @memberof Api
* @param {number} inches - The number of inches to convert to points.
* @returns {number}
*/
ApiInterface.prototype.InchesToPoints = function(inches) { return 0; };

/**
* Converts lines to points (1 line = 12 points).
* @memberof Api
* @param {number} lines - The number of lines to convert to points.
* @returns {number}
*/
ApiInterface.prototype.LinesToPoints = function(lines) { return 0; };

/**
* Converts millimeters to points.
* @memberof Api
* @param {number} mm - The number of millimeters to convert to points.
* @returns {number}
*/
ApiInterface.prototype.MillimetersToPoints = function(mm) { return 0; };

/**
* Converts picas to points.
* @memberof Api
* @param {number} pc - The number of picas to convert to points.
* @returns {number}
*/
ApiInterface.prototype.PicasToPoints = function(pc) { return 0; };

/**
* Converts pixels to points.
* @memberof Api
* @param {number} px - The number of pixels to convert to points.
* @returns {number}
*/
ApiInterface.prototype.PixelsToPoints = function(px) { return 0; };

/**
* Converts twips to points.
* @memberof Api
* @param {number} twips - The number of twips to convert to points.
* @returns {number}
*/
ApiInterface.prototype.TwipsToPoints = function(twips) { return 0; };

/**
* Converts millimeters to English Metric Units (EMUs).
* The result is an integer value.
*
* @memberof Api
* @param {mm} mm
* @returns {EMU} - The value in English Metric Units (EMUs), as an integer.
*/
ApiInterface.prototype.MillimetersToEmus = function(mm) { return new EMU(); };

/**
* Converts English measure units (EMU) to millimeters.
* @memberof Api
* @param {EMU} emu
* @returns {mm}
*/
ApiInterface.prototype.EmusToMillimeters = function(emu) { return new mm(); };

/**
* Returns the main presentation.
* @memberof Api
* @returns {ApiPresentation}
*/
ApiInterface.prototype.GetPresentation = function() { return new ApiPresentation(); };

/**
* Creates a new slide master.
* @memberof Api
* @param {ApiTheme} [oTheme = ApiPresentation.GetMaster(0).GetTheme()] - The presentation theme object.
* @returns {?ApiMaster} - returns null if presentation theme doesn't exist.
*/
ApiInterface.prototype.CreateMaster = function(oTheme) { return new ApiMaster(); };

/**
* Creates a new slide layout and adds it to the slide master if it is specified.
* @memberof Api
* @param {ApiMaster} [oMaster = null] - Parent slide master.
* @returns {ApiLayout}
*/
ApiInterface.prototype.CreateLayout = function(oMaster) { return new ApiLayout(); };

/**
* Creates a new placeholder.
* @memberof Api
* @param {string} sType - The placeholder type ("body", "chart", "clipArt", "ctrTitle", "diagram", "date", "footer", "header", "media", "object", "picture", "sldImage", "sldNumber", "subTitle", "table", "title").
* @returns {ApiPlaceholder}
*/
ApiInterface.prototype.CreatePlaceholder = function(sType) { return new ApiPlaceholder(); };

/**
* Creates a new presentation theme.
* @memberof Api
* @param {string} sName - Theme name.
* @param {ApiMaster} oMaster - Slide master. Required parameter.
* @param {ApiThemeColorScheme} oClrScheme - Theme color scheme. Required parameter.
* @param {ApiThemeFormatScheme} oFormatScheme - Theme format scheme. Required parameter.
* @param {ApiThemeFontScheme} oFontScheme - Theme font scheme. Required parameter.
* @returns {ApiTheme | null} 
*/
ApiInterface.prototype.CreateTheme = function(sName, oMaster, oClrScheme, oFormatScheme, oFontScheme) { return new ApiTheme(); };

/**
* Creates a new theme color scheme.
*
* @memberof Api
*
* @param {(ApiUniColor[] | ApiRGBColor[] | ApiColor[])} arrColors - Set of colors which are referred to as a color scheme.
* The color scheme is responsible for defining a list of twelve colors.
* The array should contain a sequence of colors: 2 dark, 2 light, 6 primary, a color for a hyperlink and a color for the followed hyperlink.
* @param {string} sName - Theme color scheme name.
* @returns {?ApiThemeColorScheme}
*
*/
ApiInterface.prototype.CreateThemeColorScheme = function(arrColors, sName) { return new ApiThemeColorScheme(); };

/**
* Creates a new theme format scheme.
* @memberof Api
* @param {ApiFill[]} arrFill - This array contains the fill styles. It should be consist of subtle, moderate and intense fills.
* @param {ApiFill[]} arrBgFill - This array contains the background fill styles. It should be consist of subtle, moderate and intense fills.
* @param {ApiStroke[]} arrLine - This array contains the line styles. It should be consist of subtle, moderate and intense lines.
* @param {string} sName - Theme format scheme name.
* @returns {?ApiThemeFormatScheme} 
*/
ApiInterface.prototype.CreateThemeFormatScheme = function(arrFill, arrBgFill, arrLine, sName) { return new ApiThemeFormatScheme(); };

/**
* Creates a new theme font scheme.
* @memberof Api
* @param {string} mjLatin - The major theme font applied to the latin text.
* @param {string} mjEa - The major theme font applied to the east asian text.
* @param {string} mjCs - The major theme font applied to the complex script text.
* @param {string} mnLatin - The minor theme font applied to the latin text.
* @param {string} mnEa - The minor theme font applied to the east asian text.
* @param {string} mnCs - The minor theme font applied to the complex script text.
* @param {string} sName - Theme font scheme name.
* @returns {ApiThemeFontScheme}
*/
ApiInterface.prototype.CreateThemeFontScheme = function(mjLatin, mjEa, mjCs, mnLatin, mnEa, mnCs, sName) { return new ApiThemeFontScheme(); };

/**
* Creates a new slide.
* @memberof Api
* @returns {ApiSlide}
*/
ApiInterface.prototype.CreateSlide = function() { return new ApiSlide(); };

/**
* Creates an image with the parameters specified.
* @memberof Api
* @param {string} sImageSrc - The image source where the image to be inserted should be taken from (currently,
* only internet URL or Base64 encoded images are supported).
* @param {EMU} nWidth - The image width in English measure units.
* @param {EMU} nHeight - The image height in English measure units.
* @returns {ApiImage}
*/
ApiInterface.prototype.CreateImage = function(sImageSrc, nWidth, nHeight) { return new ApiImage(); };

/**
* Creates an OLE object with the parameters specified.
* @memberof Api
* @param {string} sImageSrc - The image source where the image to be inserted should be taken from (currently, only internet URL or Base64 encoded images are supported).
* @param {EMU} nWidth - The OLE object width in English measure units.
* @param {EMU} nHeight - The OLE object height in English measure units.
* @param {string} sData - The OLE object string data.
* @param {string} sAppId - The application ID associated with the current OLE object.
* @returns {ApiOleObject}
*/
ApiInterface.prototype.CreateOleObject = function(sImageSrc, nWidth, nHeight, sData, sAppId) { return new ApiOleObject(); };

/**
* Creates a shape with the parameters specified.
* @memberof Api
* @param {ShapeType} [sType="rect"] - The shape type which specifies the preset shape geometry.
* @param {EMU} [nWidth = 914400] - The shape width in English measure units.
* @param {EMU} [nHeight = 914400] - The shape height in English measure units.
* @param {ApiFill} [oFill    = Api.CreateNoFill()] - The color or pattern used to fill the shape.
* @param {ApiStroke} [oStroke    = Api.CreateStroke(0, Api.CreateNoFill())] - The stroke used to create the element shadow.
* @returns {ApiShape}
*/
ApiInterface.prototype.CreateShape = function(sType, nWidth, nHeight, oFill, oStroke) { return new ApiShape(); };

/**
* Creates a chart with the parameters specified.
* :::note
* Values of <em>nStyleIndex</em> outside <b>1 - 48</b> are interpreted as a chart style id from the <em>cs:chartStyle</em> element (e.g. 201, 215, 284) and are available only for [ONLYOFFICE Docs Enterprise](https://www.onlyoffice.com/docs-enterprise-prices.aspx?from=api) and [ONLYOFFICE Docs Developer](https://www.onlyoffice.com/developer-edition-prices.aspx?from=api).
* :::
* @memberof Api
* @param {ChartType} [sType="bar"] - The chart type used for the chart display.
* @param {number[][]} aSeries - The array of the data used to build the chart from.
* @param {number[] | string[]} aSeriesNames - The array of the names (the source table column names) used for the data which the chart will be build from.
* @param {number[] | string[]} aCatNames - The array of the names (the source table row names) used for the data which the chart will be build from.
* @param {EMU} nWidth - The chart width in English measure units.
* @param {EMU} nHeight - The chart height in English measure units.
* @param {number} nStyleIndex - The chart color style index (can be <b>1 - 48</b>, as described in OOXML specification).
* @param {NumFormat[] | String[]} aNumFormats - Numeric formats which will be applied to the series (can be custom formats).
* The default numeric format is "General".
* @returns {ApiChart}
*/
ApiInterface.prototype.CreateChart = function(sType, aSeries, aSeriesNames, aCatNames, nWidth, nHeight, nStyleIndex, aNumFormats) { return new ApiChart(); };

/**
* Creates a group of drawings.
* @memberof Api
* @param {DrawingForGroup[]} drawings - An array of drawings to group.
* @returns {ApiGroup}
* @since 8.3.0
*/
ApiInterface.prototype.CreateGroup = function(drawings) { return new ApiGroup(); };

/**
* Creates a table.
* :::danger[Breaking Change]
* Starting from version 9.4.0, the parameter order has been changed from `Api.CreateTable(cols, rows)` to `Api.CreateTable(rows, cols)`.
* :::
* @memberof Api
* @param rows - Number of rows.
* @param cols - Number of columns.
* @returns {?ApiTable}
*/
ApiInterface.prototype.CreateTable = function(rows, cols) { return new ApiTable(); };

/**
* Creates a new paragraph.
* @memberof Api
* @returns {ApiParagraph}
*/
ApiInterface.prototype.CreateParagraph = function() { return new ApiParagraph(); };

/**
* Saves changes to the specified document.
* @memberof Api
*/
ApiInterface.prototype.Save = function() {};

/**
* Creates a Text Art object with the parameters specified.
* @memberof Api
* @param {ApiTextPr} [oTextPr=Api.CreateTextPr()] - The text properties.
* @param {string} [sText="Your text here"] - The text for the Text Art object.
* @param {TextTransform} [sTransform="textNoShape"] - Text transform type.
* @param {ApiFill} [oFill=Api.CreateNoFill()] - The color or pattern used to fill the Text Art object.
* @param {ApiStroke} [oStroke=Api.CreateStroke(0, Api.CreateNoFill())] - The stroke used to create the Text Art object shadow.
* @param {number} [nRotAngle=0] - Rotation angle.
* @param {EMU} [nWidth=1828800] - The Text Art width measured in English measure units.
* @param {EMU} [nHeight=1828800] - The Text Art heigth measured in English measure units.
* @param {EMU} [nIndLeft=ApiPresentation.GetWidth() / 2] - The Text Art left side indentation value measured in English measure units.
* @param {EMU} [nIndTop=ApiPresentation.GetHeight() / 2] - The Text Art top side indentation value measured in English measure units.
* @returns {ApiDrawing}
*/
ApiInterface.prototype.CreateWordArt = function(oTextPr, sText, sTransform, oFill, oStroke, nRotAngle, nWidth, nHeight, nIndLeft, nIndTop) { return new ApiDrawing(); };

/**
* Creates a new slide show transition object.
*
* @memberof Api
* @since 9.3.0
*
* @returns {ApiSlideShowTransition} - Name of the transition effect.
*/
ApiInterface.prototype.CreateSlideShowTransition = function() { return new ApiSlideShowTransition(); };

/**
* Converts the specified JSON object into the Document Builder object of the corresponding type.
* @memberof Api
* @param {JSON} sMessage - The JSON object to convert.
*/
ApiInterface.prototype.FromJSON = function(sMessage) {};

/**
* Returns the selection from the current presentation.
* @memberof Api
* @returns {ApiSelection}
* @since 8.3.0
*/
ApiInterface.prototype.GetSelection = function() { return new ApiSelection(); };

/**
* Creates a new hyperlink object to be used for setting hyperlinks on drawing objects (shapes or images).
*
* @memberof Api
*
* @param {string} link - The hyperlink address. Accepts an external URL (http, https, mailto, ftp) or one of the internal slide actions: "ppaction://hlinkshowjump?jump=firstslide", "ppaction://hlinkshowjump?jump=lastslide", "ppaction://hlinkshowjump?jump=nextslide", "ppaction://hlinkshowjump?jump=previousslide", "ppaction://hlinksldjumpslide{N}" (N is the zero-based slide index), "ppaction://hlinkfile?file={path}" (opens an external file).
* @param {string} tooltip - The tooltip text.
*
* @returns {ApiHyperlink}
*/
ApiInterface.prototype.CreateHyperlink = function(link, tooltip) { return new ApiHyperlink(); };

/**
* Subscribes to the specified event and calls the callback function when the event fires.
* @function
* @memberof Api
* @param {string} eventName - The event name.
* @param {function} callback - Function to be called when the event fires.
*/
ApiInterface.prototype.attachEvent = function(eventName, callback) {};

/**
* Unsubscribes from the specified event.
* @function
* @memberof Api
* @param {string} eventName - The event name.
*/
ApiInterface.prototype.detachEvent = function(eventName) {};

/**
* Returns a slide by its position in the presentation.
* @memberof Api
* @param {number} nIndex - The slide index (position) in the presentation.
* @returns {?ApiSlide}
* @since 9.4.0
*/
ApiInterface.prototype.GetSlideByIndex = function(nIndex) { return new ApiSlide(); };

/**
* Returns the first slide of the presentation.
* @memberof Api
* @returns {?ApiSlide}
* @since 9.4.0
*/
ApiInterface.prototype.GetFirstSlide = function() { return new ApiSlide(); };

/**
* Returns the last slide of the presentation.
* @memberof Api
* @returns {?ApiSlide}
* @since 9.4.0
*/
ApiInterface.prototype.GetLastSlide = function() { return new ApiSlide(); };

/**
* Returns a type of the ApiUnsupported class.
* @memberof ApiUnsupported
* @returns {"unsupported"}
*/
ApiUnsupported.prototype.GetClassType = function() { return ""; };

/**
* Returns a type of the ApiDocumentContent class. 
* @memberof ApiDocumentContent
* @returns {"documentContent"}
*/
ApiDocumentContent.prototype.GetClassType = function() { return ""; };

/**
* Returns an internal ID of the current document content.
* @memberof ApiDocumentContent
* @returns {string}
* @since 9.0.4
*/
ApiDocumentContent.prototype.GetInternalId = function() { return ""; };

/**
* Returns a number of elements in the current document.
* @memberof ApiDocumentContent
* @returns {number}
*/
ApiDocumentContent.prototype.GetElementsCount = function() { return 0; };

/**
* Returns an element by its position in the document.
* @memberof ApiDocumentContent
* @param {number} nPos - The element position that will be taken from the document.
* @returns {?DocumentElement}
*/
ApiDocumentContent.prototype.GetElement = function(nPos) { return new DocumentElement(); };

/**
* Adds a paragraph or a table or a blockLvl content control using its position in the document content.
* @memberof ApiDocumentContent
* @param {number} nPos - The position where the current element will be added.
* @param {DocumentElement} oElement - The document element which will be added at the current position.
* @returns {boolean}
*/
ApiDocumentContent.prototype.AddElement = function(nPos, oElement) { return true; };

/**
* Pushes a paragraph or a table to actually add it to the document.
* @memberof ApiDocumentContent
* @param {DocumentElement} oElement - The element type which will be pushed to the document.
* @returns {boolean} - returns false if oElement is unsupported.
*/
ApiDocumentContent.prototype.Push = function(oElement) { return true; };

/**
* Removes all the elements from the current document or from the current document element.
* <note>When all elements are removed, a new empty paragraph is automatically created. If you want to add
* content to this paragraph, use the {@link ApiDocumentContent#GetElement} method.</note>
* @memberof ApiDocumentContent
* @returns {boolean}
*/
ApiDocumentContent.prototype.RemoveAllElements = function() { return true; };

/**
* Removes an element using the position specified.
* @memberof ApiDocumentContent
* @param {number} nPos - The element number (position) in the document or inside other element.
* @returns {boolean}
*/
ApiDocumentContent.prototype.RemoveElement = function(nPos) { return true; };

/**
* Returns an array of all paragraphs from the current document content.
* @memberof ApiDocumentContent
* @return {ApiParagraph[]}
*/
ApiDocumentContent.prototype.GetAllParagraphs = function() { return []; };

/**
* Returns the inner text of the current document content object.
* @memberof ApiDocumentContent
* @param {object} [options] - Options for formatting the returned text.
* @param {boolean} [options.Numbering=true] - Defines if the resulting string will include numbering or not.
* @param {boolean} [options.Math=true] - Defines if the resulting string will include mathematical expressions or not.
* @param {string} [options.TableCellSeparator='\t'] - Defines how the table cell separator will be specified in the resulting string. Any symbol can be used. The default separator is "\t".
* @param {string} [options.TableRowSeparator='\r\n'] - Defines how the table row separator will be specified in the resulting string. Any symbol can be used. The default separator is "\r\n".
* @param {string} [options.ParaSeparator='\r\n'] - Defines how the paragraph separator will be specified in the resulting string. Any symbol can be used. The default separator is "\r\n".
* @param {string} [options.TabSymbol='\t'] - Defines how the tab will be specified in the resulting string. Any symbol can be used. The default symbol is "\t".
* @param {string} [options.NewLineSeparator='\r'] - Defines how the line separator will be specified in the resulting string. Any symbol can be used. The default separator is "\r".
* @return {string}
* @since 8.3.0
*/
ApiDocumentContent.prototype.GetText = function(options) { return ""; };

/**
* Replaces all content of the current document content object with the specified text,
* preserving the formatting of the first paragraph.
* @memberof ApiDocumentContent
* @param {string} text - The text to set.
* @return {ApiRun}
* @since 9.4.0
*/
ApiDocumentContent.prototype.SetText = function(text) { return new ApiRun(); };

/**
* Returns the current paragraph where the cursor is located.
* @memberof ApiDocumentContent
* @return {?ApiParagraph}
* @since 9.0.0
*/
ApiDocumentContent.prototype.GetCurrentParagraph = function() { return new ApiParagraph(); };

/**
* Returns the current run where the cursor is located.
* @memberof ApiDocumentContent
* @return {?ApiRun}
* @since 9.0.0
*/
ApiDocumentContent.prototype.GetCurrentRun = function() { return new ApiRun(); };

/**
* Appends the specified text to the end of the document content.
* @memberof ApiDocumentContent
* @param {string} text - The text to add.
* @returns {ApiRun}
* @since 9.4.0
*/
ApiDocumentContent.prototype.AddText = function(text) { return new ApiRun(); };

/**
* Adds a new custom XML part to the XML manager.
* @memberof ApiCustomXmlParts
* @since 9.0.0
* @param {string} xml - The XML string to be added.
* @returns {ApiCustomXmlPart} The newly created ApiCustomXmlPart object.
*/
ApiCustomXmlParts.prototype.Add = function(xml) { return new ApiCustomXmlPart(); };

/**
* Returns a type of the ApiCustomXmlParts class.
* @memberof ApiCustomXmlParts
* @returns {"customXmlParts"}
*/
ApiCustomXmlParts.prototype.GetClassType = function() { return ""; };

/**
* Returns a custom XML part by its ID from the XML manager.
* @memberof ApiCustomXmlParts
* @since 9.0.0
* @param {string} xmlPartId - The XML part ID.
* @returns {ApiCustomXmlPart|null} The corresponding ApiCustomXmlPart object if found, or null if no match is found.
*/
ApiCustomXmlParts.prototype.GetById = function(xmlPartId) { return new ApiCustomXmlPart(); };

/**
* Returns custom XML parts by namespace from the XML manager.
* @memberof ApiCustomXmlParts
* @since 9.0.0
* @param {string} namespace - The namespace of the XML parts.
* @returns {ApiCustomXmlPart[]} An array of ApiCustomXmlPart objects or null if no matching XML parts are found.
*/
ApiCustomXmlParts.prototype.GetByNamespace = function(namespace) { return []; };

/**
* Returns a number of custom XML parts in the XML manager.
* @memberof ApiCustomXmlParts
* @since 9.0.0
* @returns {number} The number of custom XML parts.
*/
ApiCustomXmlParts.prototype.GetCount = function() { return 0; };

/**
* Returns all custom XML parts from the XML manager.
* @memberof ApiCustomXmlParts
* @since 9.0.0
* @returns {ApiCustomXmlPart[]} An array of all custom XML parts.
*/
ApiCustomXmlParts.prototype.GetAll = function() { return []; };

/**
* Returns a type of the ApiCustomXmlPart class.
* @memberof ApiCustomXmlPart
* @returns {"customXmlPart"}
*/
ApiCustomXmlPart.prototype.GetClassType = function() { return ""; };

/**
* Returns the ID of the custom XML part.
* @memberof ApiCustomXmlPart
* @returns {string}
*/
ApiCustomXmlPart.prototype.GetId = function() { return ""; };

/**
* Retrieves nodes from custom XML based on the provided XPath.
* @memberof ApiCustomXmlPart
* @since 9.0.0
* @param {string} xPath - The XPath expression to search for nodes.
* @returns {ApiCustomXmlNode[]} An array of ApiCustomXmlNode objects corresponding to the found nodes.
*/
ApiCustomXmlPart.prototype.GetNodes = function(xPath) { return []; };

/**
* Retrieves the XML string from the custom XML part.
* @memberof ApiCustomXmlPart
* @since 9.0.0
* @returns {string} The XML string.
*/
ApiCustomXmlPart.prototype.GetXml = function() { return ""; };

/**
* Deletes the XML from the custom XML manager.
* @memberof ApiCustomXmlPart
* @since 9.0.0
* @returns {boolean} True if the XML was successfully deleted.
*/
ApiCustomXmlPart.prototype.Delete = function() { return true; };

/**
* Deletes an attribute from the XML node at the specified XPath.
* @memberof ApiCustomXmlPart
* @since 9.0.0
* @param {string} xPath - The XPath of the node from which to delete the attribute.
* @param {string} name - The name of the attribute to delete.
* @returns {boolean} True if the attribute was successfully deleted.
*/
ApiCustomXmlPart.prototype.DeleteAttribute = function(xPath, name) { return true; };

/**
* Inserts an attribute into the XML node at the specified XPath.
* @memberof ApiCustomXmlPart
* @since 9.0.0
* @param {string} xPath - The XPath of the node to insert the attribute into.
* @param {string} name - The name of the attribute to insert.
* @param {string} value - The value of the attribute to insert.
* @returns {boolean} True if the attribute was successfully inserted.
*/
ApiCustomXmlPart.prototype.InsertAttribute = function(xPath, name, value) { return true; };

/**
* Returns an attribute from the XML node at the specified XPath.
* @memberof ApiCustomXmlPart
* @since 9.0.0
* @param {string} xPath - The XPath of the node from which to get the attribute.
* @param {string} name - The name of the attribute to find.
* @returns {string | null} The attribute value or null if no matching attributes are found.
*/
ApiCustomXmlPart.prototype.GetAttribute = function(xPath, name) { return ""; };

/**
* Updates an attribute of the XML node at the specified XPath.
* @memberof ApiCustomXmlPart
* @since 9.0.0
* @param {string} xPath - The XPath of the node whose attribute should be updated.
* @param {string} name - The name of the attribute to update.
* @param {string} value - The new value for the attribute.
* @returns {boolean} True if the attribute was successfully updated.
*/
ApiCustomXmlPart.prototype.UpdateAttribute = function(xPath, name, value) { return true; };

/**
* Deletes an XML element at the specified XPath.
* @memberof ApiCustomXmlPart
* @since 9.0.0
* @param {string} xPath - The XPath of the node to delete.
* @returns {boolean} True if the element was successfully deleted.
*/
ApiCustomXmlPart.prototype.DeleteElement = function(xPath) { return true; };

/**
* Inserts an XML element at the specified XPath.
* @memberof ApiCustomXmlPart
* @since 9.0.0
* @param {string} xPath - The XPath of the parent node where the new element will be inserted.
* @param {string} xmlStr - The XML string to insert.
* @param {number} [index] - The position at which to insert the new XML element. If omitted, the element will be appended as the last child.
* @returns {boolean} True if the insertion was successful.
*/
ApiCustomXmlPart.prototype.InsertElement = function(xPath, xmlStr, index) { return true; };

/**
* Updates an XML element at the specified XPath.
* @memberof ApiCustomXmlPart
* @since 9.0.0
* @param {string} xPath - The XPath of the node to update.
* @param {string} xmlStr - The XML string to replace the node content with.
* @returns {boolean} True if the update was successful.
*/
ApiCustomXmlPart.prototype.UpdateElement = function(xPath, xmlStr) { return true; };

/**
* Returns a type of the ApiCustomXmlNode class.
* @memberof ApiCustomXmlNode
* @returns {"customXmlNode"}
*/
ApiCustomXmlNode.prototype.GetClassType = function() { return ""; };

/**
* Returns nodes from the custom XML node based on the given XPath.
* @memberof ApiCustomXmlNode
* @since 9.0.0
* @param {string} xPath - The XPath expression to match nodes.
* @returns {ApiCustomXmlNode[]} An array of nodes that match the given XPath.
*/
ApiCustomXmlNode.prototype.GetNodes = function(xPath) { return []; };

/**
* Returns the absolute XPath of the current XML node.
* @memberof ApiCustomXmlNode
* @since 9.0.0
* @returns {string} The absolute XPath of the current node.
*/
ApiCustomXmlNode.prototype.GetXPath = function() { return ""; };

/**
* Returns the name of the current XML node.
* @memberof ApiCustomXmlNode
* @since 9.0.0
* @returns {string} The name of the current node.
*/
ApiCustomXmlNode.prototype.GetNodeName = function() { return ""; };

/**
* Returns the XML string representation of the current node content.
* @memberof ApiCustomXmlNode
* @since 9.0.0
* @returns {string} The XML string representation of the current node content.
*/
ApiCustomXmlNode.prototype.GetNodeValue = function() { return ""; };

/**
* Returns the XML string of the current node.
* @memberof ApiCustomXmlNode
* @since 9.0.0
* @returns {string} The XML string representation of the current node.
*/
ApiCustomXmlNode.prototype.GetXml = function() { return ""; };

/**
* Returns the inner text of the current node and its child nodes.
* For example: `<text>123<one>4</one></text>` returns `"1234"`.
* @memberof ApiCustomXmlNode
* @since 9.0.0
* @returns {string} The combined text content of the node and its descendants.
*/
ApiCustomXmlNode.prototype.GetText = function() { return ""; };

/**
* Sets the XML content for the current node.
* @memberof ApiCustomXmlNode
* @since 9.0.0
* @param {string} xml - The XML string to set as the content of the current node.
* @returns {boolean} Returns `true` if the XML was successfully set.
*/
ApiCustomXmlNode.prototype.SetNodeValue = function(xml) { return true; };

/**
* Sets the text content of the current XML node.
* @memberof ApiCustomXmlNode
* @since 9.0.0
* @param {string} str - The text content to set for the node.
* @returns {boolean} Returns `true` if the text was successfully set.
*/
ApiCustomXmlNode.prototype.SetText = function(str) { return true; };

/**
* Sets the XML content of the current XML node.
* @memberof ApiCustomXmlNode
* @since 9.0.0
* @param {string} strXml - The XML string to set as the node content.
* @returns {boolean} Returns `true` if the XML was successfully set.
*/
ApiCustomXmlNode.prototype.SetXml = function(strXml) { return true; };

/**
* Deletes the current XML node.
* @memberof ApiCustomXmlNode
* @since 9.0.0
* @returns {boolean} Returns `true` if the node was successfully deleted.
*/
ApiCustomXmlNode.prototype.Delete = function() { return true; };

/**
* Returns the parent of the current XML node.
* @memberof ApiCustomXmlNode
* @since 9.0.0
* @returns {ApiCustomXmlNode | null} The parent node, or `null` if the current node has no parent.
*/
ApiCustomXmlNode.prototype.GetParent = function() { return new ApiCustomXmlNode(); };

/**
* Creates a child node for the current XML node.
* @memberof ApiCustomXmlNode
* @since 9.0.0
* @param {string} nodeName - The name of the new child node.
* @returns {ApiCustomXmlNode} The newly created child node.
*/
ApiCustomXmlNode.prototype.Add = function(nodeName) { return new ApiCustomXmlNode(); };

/**
* Returns a list of attributes of the current XML node.
* @memberof ApiCustomXmlNode
* @since 9.0.0
* @returns {CustomXmlNodeAttribute[]} An array of attribute objects.
*/
ApiCustomXmlNode.prototype.GetAttributes = function() { return []; };

/**
* Sets an attribute for the custom XML node.
* If the attribute already exists, it will not be modified.
* @memberof ApiCustomXmlNode
* @since 9.0.0
* @param {string} name - The name of the attribute to set.
* @param {string} value - The value to assign to the attribute.
* @returns {boolean} Returns `true` if the attribute was successfully set, `false` if the attribute already exists.
*/
ApiCustomXmlNode.prototype.SetAttribute = function(name, value) { return true; };

/**
* Updates the value of an existing attribute in the custom XML node.
* If the attribute doesn't exist, the update will not occur.
* @memberof ApiCustomXmlNode
* @since 9.0.0
* @param {string} name - The name of the attribute to update.
* @param {string} value - The new value to assign to the attribute.
* @returns {boolean} Returns `true` if the attribute was successfully updated, `false` if the attribute doesn't exist.
*/
ApiCustomXmlNode.prototype.UpdateAttribute = function(name, value) { return true; };

/**
* Deletes an attribute from the custom XML node.
* If the attribute exists, it will be removed.
* @memberof ApiCustomXmlNode
* @since 9.0.0
* @param {string} name - The name of the attribute to delete.
* @returns {boolean} Returns `true` if the attribute was successfully deleted, `false` if the attribute didn't exist.
*/
ApiCustomXmlNode.prototype.DeleteAttribute = function(name) { return true; };

/**
* Retrieves the attribute value from the custom XML node.
* If the attribute doesn't exist, it returns `false`.
* @memberof ApiCustomXmlNode
* @since 9.0.0
* @param {string} name - The name of the attribute to retrieve.
* @returns {string |null} The value of the attribute if it exists, or `null` if the attribute is not found.
*/
ApiCustomXmlNode.prototype.GetAttribute = function(name) { return ""; };

/**
* Returns a type of the ApiParagraph class.
* @memberof ApiParagraph
* @returns {"paragraph"}
*/
ApiParagraph.prototype.GetClassType = function() { return ""; };

/**
* Returns an internal ID of the current content paragraph.
* @memberof ApiParagraph
* @returns {string}
*/
ApiParagraph.prototype.GetInternalId = function() { return ""; };

/**
* Adds some text to the current paragraph.
* @memberof ApiParagraph
* @param {string} text - The text that we want to insert into the current document element.
* @returns {ApiRun}
*/
ApiParagraph.prototype.AddText = function(text) { return new ApiRun(); };

/**
* Adds a line break to the current position and starts the next element from a new line.
* @memberof ApiParagraph
* @returns {ApiRun}
*/
ApiParagraph.prototype.AddLineBreak = function() { return new ApiRun(); };

/**
* Returns the paragraph properties.
* @memberof ApiParagraph
* @returns {ApiParaPr}
*/
ApiParagraph.prototype.GetParaPr = function() { return new ApiParaPr(); };

/**
* Returns a number of elements in the current paragraph.
* @memberof ApiParagraph
* @returns {number}
*/
ApiParagraph.prototype.GetElementsCount = function() { return 0; };

/**
* Returns a paragraph element using the position specified.
* @memberof ApiParagraph
* @param {number} nPos - The position where the element which content we want to get must be located.
* @returns {?ParagraphContent}
*/
ApiParagraph.prototype.GetElement = function(nPos) { return new ParagraphContent(); };

/**
* Removes an element using the position specified.
* <note>If the element you remove is the last paragraph element (i.e. all the elements are removed from the paragraph),
* a new empty run is automatically created. If you want to add
* content to this run, use the {@link ApiParagraph#GetElement} method.</note>
* @memberof ApiParagraph
* @param {number} nPos - The element position which we want to remove from the paragraph.
* @returns {boolean}
*/
ApiParagraph.prototype.RemoveElement = function(nPos) { return true; };

/**
* Removes all the elements from the current paragraph.
* <note>When all the elements are removed from the paragraph, a new empty run is automatically created. If you want to add
* content to this run, use the {@link ApiParagraph#GetElement} method.</note>
* @memberof ApiParagraph
* @returns {boolean}
*/
ApiParagraph.prototype.RemoveAllElements = function() { return true; };

/**
* Deletes the current paragraph.
* @memberof ApiParagraph
* @returns {boolean} - returns false if paragraph haven't parent.
*/
ApiParagraph.prototype.Delete = function() { return true; };

/**
* Returns the next paragraph.
* @memberof ApiParagraph
* @returns {ApiParagraph | null} - returns null if paragraph is last.
*/
ApiParagraph.prototype.GetNext = function() { return new ApiParagraph(); };

/**
* Returns the previous paragraph.
* @memberof ApiParagraph
* @returns {ApiParagraph} - returns null if paragraph is first.
*/
ApiParagraph.prototype.GetPrevious = function() { return new ApiParagraph(); };

/**
* Creates a paragraph copy. Ingnore comments, footnote references, complex fields.
* @memberof ApiParagraph
* @returns {ApiParagraph}
*/
ApiParagraph.prototype.Copy = function() { return new ApiParagraph(); };

/**
* Adds an element to the current paragraph.
* @memberof ApiParagraph
* @param {ParagraphContent} oElement - The document element which will be added at the current position. Returns false if the
* oElement type is not supported by a paragraph.
* @param {number} [nPos] - The position where the current element will be added. If this value is not
* specified, then the element will be added at the end of the current paragraph.
* @returns {boolean} Returns <code>false</code> if the type of <code>oElement</code> is not supported by paragraph
* content.
*/
ApiParagraph.prototype.AddElement = function(oElement, nPos) { return true; };

/**
* Adds a tab stop to the current paragraph.
* @memberof ApiParagraph
* @returns {ApiRun}
*/
ApiParagraph.prototype.AddTabStop = function() { return new ApiRun(); };

/**
* Adds an element to the current paragraph.
* @memberof ApiParagraph
* @param {ParagraphContent} oElement - The document element which will be added at the current position. Returns false if the
* oElement type is not supported by a paragraph.
* @returns {boolean} Returns <code>false</code> if the type of <code>oElement</code> is not supported by paragraph
* content.
*/
ApiParagraph.prototype.Push = function(oElement) { return true; };

/**
* Returns the last Run with text in the current paragraph.
* @memberof ApiParagraph
* @returns {ApiRun}
*/
ApiParagraph.prototype.GetLastRunWithText = function() { return new ApiRun(); };

/**
* Sets the bold property to the text character.
* @memberof ApiParagraph
* @param {boolean} isBold - Specifies that the contents of this paragraph are displayed bold.
* @returns {ApiParagraph} this
*/
ApiParagraph.prototype.SetBold = function(isBold) { return new ApiParagraph(); };

/**
* Specifies that any lowercase characters in this paragraph are formatted for display only as their capital letter character equivalents.
* @memberof ApiParagraph
* @param {boolean} isCaps - Specifies that the contents of the current paragraph are displayed capitalized.
* @returns {ApiParagraph} this
*/
ApiParagraph.prototype.SetCaps = function(isCaps) { return new ApiParagraph(); };

/**
* Sets the text color to the current paragraph.
*
* @memberof ApiParagraph
*
* @since 9.1.0
* @param {ApiColor} color - The text color.
* @return {ApiParagraph} this
*
*/
ApiParagraph.prototype.SetColor = function(color) { return new ApiParagraph(); };

/**
* Specifies that the contents of this paragraph are displayed with two horizontal lines through each character displayed on the line.
* @memberof ApiParagraph
* @param {boolean} isDoubleStrikeout - Specifies that the contents of the current paragraph are displayed double struck through.
* @returns {ApiParagraph} this
*/
ApiParagraph.prototype.SetDoubleStrikeout = function(isDoubleStrikeout) { return new ApiParagraph(); };

/**
* Sets all 4 font slots with the specified font family.
* @memberof ApiParagraph
* @param {string} sFontFamily - The font family or families used for the current paragraph.
* @returns {?ApiParagraph} this
*/
ApiParagraph.prototype.SetFontFamily = function(sFontFamily) { return new ApiParagraph(); };

/**
* Returns all font names from all elements inside the current paragraph.
* @memberof ApiParagraph
* @returns {string[]} - The font names used for the current paragraph.
*/
ApiParagraph.prototype.GetFontNames = function() { return []; };

/**
* Sets the font size to the characters of the current paragraph.
* @memberof ApiParagraph
* @param {hps} nSize - The text size value measured in half-points (1/144 of an inch).
* @returns {ApiParagraph} this
*/
ApiParagraph.prototype.SetFontSize = function(nSize) { return new ApiParagraph(); };

/**
* Specifies a highlighting color which is applied as a background to the contents of the current paragraph.
* @memberof ApiParagraph
* @param {highlightColor} sColor - Available highlight color.
* @returns {ApiParagraph} this
*/
ApiParagraph.prototype.SetHighlight = function(sColor) { return new ApiParagraph(); };

/**
* Sets the italic property to the text character.
* @memberof ApiParagraph
* @param {boolean} isItalic - Specifies that the contents of the current paragraph are displayed italicized.
* @returns {ApiParagraph} this
*/
ApiParagraph.prototype.SetItalic = function(isItalic) { return new ApiParagraph(); };

/**
* Specifies that all the small letter characters in this paragraph are formatted for display only as their capital
* letter character equivalents which are two points smaller than the actual font size specified for this text.
* @memberof ApiParagraph
* @param {boolean} isSmallCaps - Specifies if the contents of the current paragraph are displayed capitalized two points smaller or not.
* @returns {ApiParagraph} this
*/
ApiParagraph.prototype.SetSmallCaps = function(isSmallCaps) { return new ApiParagraph(); };

/**
* Sets the text spacing measured in twentieths of a point.
* @memberof ApiParagraph
* @param {twips} nSpacing - The value of the text spacing measured in twentieths of a point (1/1440 of an inch).
* @returns {ApiParagraph} this
*/
ApiParagraph.prototype.SetSpacing = function(nSpacing) { return new ApiParagraph(); };

/**
* Specifies that the contents of this paragraph are displayed with a single horizontal line through the center of the line.
* @memberof ApiParagraph
* @param {boolean} isStrikeout - Specifies that the contents of the current paragraph are displayed struck through.
* @returns {ApiParagraph} this
*/
ApiParagraph.prototype.SetStrikeout = function(isStrikeout) { return new ApiParagraph(); };

/**
* Specifies that the contents of this paragraph are displayed along with a line appearing directly below the character
* (less than all the spacing above and below the characters on the line).
* @memberof ApiParagraph
* @param {boolean} isUnderline - Specifies that the contents of the current paragraph are displayed underlined.
* @returns {ApiParagraph} this
*/
ApiParagraph.prototype.SetUnderline = function(isUnderline) { return new ApiParagraph(); };

/**
* Returns the last element of the paragraph.
* @memberof ApiParagraph
* @returns {?ParagraphContent}
*/
ApiParagraph.prototype.Last = function() { return new ParagraphContent(); };

/**
* Returns the paragraph text.
* @memberof ApiParagraph
* @param {object} [options] - Options for formatting the returned text.
* @param {boolean} [options.Numbering=false] - Defines if the resulting string will include numbering or not.
* @param {boolean} [options.Math=false] - Defines if the resulting string will include mathematical expressions or not.
* @param {string} [options.NewLineSeparator='\r'] - Defines how the line separator will be specified in the resulting string. Any string can be used. The default separator is "\r".
* @param {string} [options.TabSymbol='\t'] - Defines how the tab will be specified in the resulting string (does not apply to numbering). Any string can be used. The default symbol is "\t".
* @return {string}
*/
ApiParagraph.prototype.GetText = function(options) { return ""; };

/**
* Replaces the paragraph content with the specified text.
* @memberof ApiParagraph
* @param {string} text - The text to set.
* @return {ApiRun}
*/
ApiParagraph.prototype.SetText = function(text) { return new ApiRun(); };

/**
* Sets the paragraph text properties.
* @memberof ApiParagraph
* @param {ApiTextPr} oTextPr - The paragraph text properties.
* @return {boolean} - returns false if param is invalid.
*/
ApiParagraph.prototype.SetTextPr = function(oTextPr) { return true; };

/**
* Inserts a paragraph at the specified position.
* @memberof ApiParagraph
* @param {string | ApiParagraph} paragraph - Text or paragraph.
* @param {string} sPosition - The position where the text or paragraph will be inserted ("before" or "after" the paragraph specified).
* @param {boolean} beRNewPara - Defines if this method returns a new paragraph (true) or the current paragraph (false).
* @return {ApiParagraph | null} - returns null if param paragraph is invalid. 
*/
ApiParagraph.prototype.InsertParagraph = function(paragraph, sPosition, beRNewPara) { return new ApiParagraph(); };

/**
* Selects the current paragraph.
* @memberof ApiParagraph
* @return {boolean}
*/
ApiParagraph.prototype.Select = function() { return true; };

/**
* Converts the ApiParagraph object into the JSON object.
* @memberof ApiParagraph
* @param {boolean} bWriteNumberings - Specifies if the used numberings will be written to the JSON object or not.
* @param {boolean} bWriteStyles - Specifies if the used styles will be written to the JSON object or not.
* @returns {JSON}
*/
ApiParagraph.prototype.ToJSON = function(bWriteNumberings, bWriteStyles) { return new JSON(); };

/**
* Moves the cursor to the start of the paragraph.
* @memberof ApiParagraph
* @returns {boolean}
* @since 9.4.0
*/
ApiParagraph.prototype.MoveCursorToStart = function() { return true; };

/**
* Moves the cursor to the end of the paragraph.
* @memberof ApiParagraph
* @returns {boolean}
* @since 9.4.0
*/
ApiParagraph.prototype.MoveCursorToEnd = function() { return true; };

/**
* Sets the paragraph left side indentation.
* @memberof ApiParaPr
* @param {twips} nValue - The paragraph left side indentation value measured in twentieths of a point (1/1440 of an inch).
* @returns {boolean}
*/
ApiParagraph.prototype.SetIndLeft = function(nValue) { return true; };

/**
* Returns the paragraph left side indentation.
* @memberof ApiParaPr
* @returns {twips | undefined} - The paragraph left side indentation value measured in twentieths of a point (1/1440 of an inch).
*/
ApiParagraph.prototype.GetIndLeft = function() { return new twips(); };

/**
* Sets the paragraph right side indentation.
* @memberof ApiParaPr
* @param {twips} nValue - The paragraph right side indentation value measured in twentieths of a point (1/1440 of an inch).
* @returns {boolean}
*/
ApiParagraph.prototype.SetIndRight = function(nValue) { return true; };

/**
* Returns the paragraph right side indentation.
* @memberof ApiParaPr
* @returns {twips | undefined} - The paragraph right side indentation value measured in twentieths of a point (1/1440 of an inch).
*/
ApiParagraph.prototype.GetIndRight = function() { return new twips(); };

/**
* Sets the paragraph first line indentation.
* @memberof ApiParaPr
* @param {twips} nValue - The paragraph first line indentation value measured in twentieths of a point (1/1440 of an inch).
* @returns {boolean}
*/
ApiParagraph.prototype.SetIndFirstLine = function(nValue) { return true; };

/**
* Returns the paragraph first line indentation.
* @memberof ApiParaPr
* @returns {twips | undefined} - The paragraph first line indentation value measured in twentieths of a point (1/1440 of an inch).
*/
ApiParagraph.prototype.GetIndFirstLine = function() { return new twips(); };

/**
* Sets the paragraph contents justification.
* @memberof ApiParaPr
* @param {("left" | "right" | "both" | "center")} sJc - The justification type that
* will be applied to the paragraph contents.
* @returns {boolean}
*/
ApiParagraph.prototype.SetJc = function(sJc) { return true; };

/**
* Returns the paragraph contents justification.
* @memberof ApiParaPr
* @returns {("left" | "right" | "both" | "center" | undefined)} 
*/
ApiParagraph.prototype.GetJc = function() { return ""; };

/**
* Sets the paragraph line spacing. If the value of the sLineRule parameter is either 
* "atLeast" or "exact", then the value of nLine will be interpreted as twentieths of a point. If 
* the value of the sLineRule parameter is "auto", then the value of the 
* nLine parameter will be interpreted as 240ths of a line.
* @memberof ApiParaPr
* @param {(twips | line240)} nLine - The line spacing value measured either in twentieths of a point (1/1440 of an inch) or in 240ths of a line.
* @param {("auto" | "atLeast" | "exact")} sLineRule - The rule that determines the measuring units of the line spacing.
* @returns {boolean}
*/
ApiParagraph.prototype.SetSpacingLine = function(nLine, sLineRule) { return true; };

/**
* Returns the paragraph line spacing value.
* @memberof ApiParaPr
* @returns {twips | line240 | undefined} - to know is twips or line240 use ApiParaPr.prototype.GetSpacingLineRule().
*/
ApiParagraph.prototype.GetSpacingLineValue = function() { return new twips(); };

/**
* Returns the paragraph line spacing rule.
* @memberof ApiParaPr
* @returns {"auto" | "atLeast" | "exact" | undefined} 
*/
ApiParagraph.prototype.GetSpacingLineRule = function() { return ""; };

/**
* Sets the spacing before the current paragraph. If the value of the isBeforeAuto parameter is true, then 
* any value of the nBefore is ignored. If isBeforeAuto parameter is not specified, then 
* it will be interpreted as false.
* @memberof ApiParaPr
* @param {twips} nBefore - The value of the spacing before the current paragraph measured in twentieths of a point (1/1440 of an inch).
* @param {boolean} [isBeforeAuto=false] - The true value disables the spacing before the current paragraph.
* @returns {boolean}
*/
ApiParagraph.prototype.SetSpacingBefore = function(nBefore, isBeforeAuto) { return true; };

/**
* Returns the spacing before value of the current paragraph.
* @memberof ApiParaPr
* @returns {twips} - The value of the spacing before the current paragraph measured in twentieths of a point (1/1440 of an inch).
*/
ApiParagraph.prototype.GetSpacingBefore = function() { return new twips(); };

/**
* Sets the spacing after the current paragraph. If the value of the isAfterAuto parameter is true, then 
* any value of the nAfter is ignored. If isAfterAuto parameter is not specified, then it 
* will be interpreted as false.
* @memberof ApiParaPr
* @param {twips} nAfter - The value of the spacing after the current paragraph measured in twentieths of a point (1/1440 of an inch).
* @param {boolean} [isAfterAuto=false] - The true value disables the spacing after the current paragraph.
* @returns {boolean}
*/
ApiParagraph.prototype.SetSpacingAfter = function(nAfter, isAfterAuto) { return true; };

/**
* Returns the spacing after value of the current paragraph. 
* @memberof ApiParaPr
* @returns {twips} - The value of the spacing after the current paragraph measured in twentieths of a point (1/1440 of an inch).
*/
ApiParagraph.prototype.GetSpacingAfter = function() { return new twips(); };

/**
* Specifies a sequence of custom tab stops which will be used for any tab characters in the current paragraph.
* <b>Warning</b>: The lengths of aPos array and aVal array <b>MUST BE</b> equal to each other.
* @memberof ApiParaPr
* @param {twips[]} aPos - An array of the positions of custom tab stops with respect to the current page margins
* measured in twentieths of a point (1/1440 of an inch).
* @param {TabJc[]} aVal - An array of the styles of custom tab stops, which determines the behavior of the tab
* stop and the alignment which will be applied to text entered at the current custom tab stop.
* @returns {boolean}
*/
ApiParagraph.prototype.SetTabs = function(aPos, aVal) { return true; };

/**
* Returns the custom tab stops of the current paragraph.
* @memberof ApiParaPr
* @since 9.4.0
* @returns {TabStop[]}
*/
ApiParagraph.prototype.GetTabs = function() { return []; };

/**
* Sets the bullet or numbering to the current paragraph.
* @memberof ApiParaPr
* @param {?ApiBullet} oBullet - The bullet object created with the {@link Api#CreateBullet} or {@link Api#CreateNumbering} method.
*/
ApiParagraph.prototype.SetBullet = function(oBullet) {};

/**
* Sets the outline level for the specified properties.
* @memberof ApiParaPr
* @param {Number | null | undefined} [lvl=undefined] - The outline level. Possible values: 1-9. The 1The desired functionality is as follows: When inserting document A into document B using the merge document API during editing, the source of document A should be visible within document B. By clicking or hovering over the inserted content of document A in document B, information about the insertion of document A should be displayed in a pop-up/floating window, preserving the boundaries of document A. Document A should be able to be inserted between any two characters in document B.
* To set no outline level, use this method without a parameter.
* @returns {boolean}
* @since 8.2.0
*/
ApiParagraph.prototype.SetOutlineLvl = function(lvl) { return true; };

/**
* Returns the outline level of the specified properties.
* @memberof ApiParaPr
* @returns {Number | undefined}
* @since 8.2.0
*/
ApiParagraph.prototype.GetOutlineLvl = function() { return 0; };

/**
* Returns a type of the ApiRun class.
* @memberof ApiRun
* @returns {"run"}
*/
ApiRun.prototype.GetClassType = function() { return ""; };

/**
* Returns the text properties of the current run.
* @memberof ApiRun
* @returns {ApiTextPr}
*/
ApiRun.prototype.GetTextPr = function() { return new ApiTextPr(); };

/**
* Clears the content from the current run.
* @memberof ApiRun
* @returns {boolean}
*/
ApiRun.prototype.ClearContent = function() { return true; };

/**
* Removes all the elements from the current run.
* @memberof ApiRun
* @returns {boolean}
*/
ApiRun.prototype.RemoveAllElements = function() { return true; };

/**
* Deletes the current run.
* @memberof ApiRun
* @returns {boolean}
*/
ApiRun.prototype.Delete = function() { return true; };

/**
* Adds some text to the current run.
* @memberof ApiRun
* @param {string} text - The text which will be added to the current run.
* @returns {boolean}
*/
ApiRun.prototype.AddText = function(text) { return true; };

/**
* Adds a line break to the current run position and starts the next element from a new line.
* @memberof ApiRun
* @returns {boolean}
*/
ApiRun.prototype.AddLineBreak = function() { return true; };

/**
* Adds a tab stop to the current run.
* @memberof ApiRun
* @returns {boolean}
*/
ApiRun.prototype.AddTabStop = function() { return true; };

/**
* Creates a copy of the current run.
* @memberof ApiRun
* @returns {ApiRun}
*/
ApiRun.prototype.Copy = function() { return new ApiRun(); };

/**
* Sets the text properties to the current run.
* @memberof ApiRun
* @param {ApiTextPr} oTextPr - The text properties that will be set to the current run.
* @return {ApiTextPr}  
*/
ApiRun.prototype.SetTextPr = function(oTextPr) { return new ApiTextPr(); };

/**
* Sets the bold property to the text character.
* @memberof ApiRun
* @param {boolean} isBold - Specifies that the contents of the current run are displayed bold.
* @returns {ApiTextPr}
*/
ApiRun.prototype.SetBold = function(isBold) { return new ApiTextPr(); };

/**
* Specifies that any lowercase characters in the current text run are formatted for display only as their capital letter character equivalents.
* @memberof ApiRun
* @param {boolean} isCaps - Specifies that the contents of the current run are displayed capitalized.
* @returns {ApiTextPr}
*/
ApiRun.prototype.SetCaps = function(isCaps) { return new ApiTextPr(); };

/**
* Sets the text color for the current text run.
*
* @memberof ApiRun
*
* @since 9.1.0
* @param {ApiColor} color - The text color.
* @return {ApiTextPr}
*
*/
ApiRun.prototype.SetColor = function(color) { return new ApiTextPr(); };

/**
* Specifies that the contents of the current run are displayed with two horizontal lines through each character displayed on the line.
* @memberof ApiRun
* @param {boolean} isDoubleStrikeout - Specifies that the contents of the current run are displayed double struck through.
* @returns {ApiTextPr}
*/
ApiRun.prototype.SetDoubleStrikeout = function(isDoubleStrikeout) { return new ApiTextPr(); };

/**
* Sets the text color to the current text run.
* @memberof ApiRun
* @param {ApiFill} oApiFill - The color or pattern used to fill the text color.
* @returns {ApiTextPr}
*/
ApiRun.prototype.SetFill = function(oApiFill) { return new ApiTextPr(); };

/**
* Sets all 4 font slots with the specified font family.
* @memberof ApiRun
* @param {string} sFontFamily - The font family or families used for the current text run.
* @returns {ApiTextPr}
*/
ApiRun.prototype.SetFontFamily = function(sFontFamily) { return new ApiTextPr(); };

/**
* Returns all font names from all elements inside the current run.
* @memberof ApiRun
* @returns {string[]} - The font names used for the current run.
*/
ApiRun.prototype.GetFontNames = function() { return []; };

/**
* Sets the font size to the characters of the current text run.
* @memberof ApiRun
* @param {hps} nSize - The text size value measured in half-points (1/144 of an inch).
* @returns {ApiTextPr}
*/
ApiRun.prototype.SetFontSize = function(nSize) { return new ApiTextPr(); };

/**
* Specifies a highlighting color which is applied as a background to the contents of the current run.
* @memberof ApiRun
* @param {highlightColor} sColor - Available highlight color.
* @returns {ApiTextPr}
*/
ApiRun.prototype.SetHighlight = function(sColor) { return new ApiTextPr(); };

/**
* Sets the italic property to the text character.
* @memberof ApiRun
* @param {boolean} isItalic - Specifies that the contents of the current run are displayed italicized.
* @returns {ApiTextPr}
*/
ApiRun.prototype.SetItalic = function(isItalic) { return new ApiTextPr(); };

/**
* Specifies the languages which will be used to check spelling and grammar (if requested) when processing
* the contents of this text run.
* @memberof ApiRun
* @param {string} sLangId - The possible value for this parameter is a language identifier as defined by
* RFC 4646/BCP 47. Example: "en-CA".
* @returns {ApiTextPr}
*/
ApiRun.prototype.SetLanguage = function(sLangId) { return new ApiTextPr(); };

/**
* Specifies an amount by which text is raised or lowered for this run in relation to the default
* baseline of the surrounding non-positioned text.
* @memberof ApiRun
* @param {hps} nPosition - Specifies a positive (raised text) or negative (lowered text)
* measurement in half-points (1/144 of an inch).
* @returns {ApiTextPr}
*/
ApiRun.prototype.SetPosition = function(nPosition) { return new ApiTextPr(); };

/**
* Specifies that all the small letter characters in this text run are formatted for display only as their capital
* letter character equivalents which are two points smaller than the actual font size specified for this text.
* @memberof ApiRun
* @param {boolean} isSmallCaps - Specifies if the contents of the current run are displayed capitalized two points smaller or not.
* @returns {ApiTextPr}
*/
ApiRun.prototype.SetSmallCaps = function(isSmallCaps) { return new ApiTextPr(); };

/**
* Sets the text spacing measured in twentieths of a point.
* @memberof ApiRun
* @param {twips} nSpacing - The value of the text spacing measured in twentieths of a point (1/1440 of an inch).
* @returns {ApiTextPr}
*/
ApiRun.prototype.SetSpacing = function(nSpacing) { return new ApiTextPr(); };

/**
* Specifies that the contents of the current run are displayed with a single horizontal line through the center of the line.
* @memberof ApiRun
* @param {boolean} isStrikeout - Specifies that the contents of the current run are displayed struck through.
* @returns {ApiTextPr}
*/
ApiRun.prototype.SetStrikeout = function(isStrikeout) { return new ApiTextPr(); };

/**
* Specifies that the contents of the current run are displayed along with a line appearing directly below the character
* (less than all the spacing above and below the characters on the line).
* @memberof ApiRun
* @param {boolean} isUnderline - Specifies that the contents of the current run are displayed underlined.
* @returns {ApiTextPr}
*/
ApiRun.prototype.SetUnderline = function(isUnderline) { return new ApiTextPr(); };

/**
* Specifies the alignment which will be applied to the contents of the current run in relation to the default appearance of the text run:
* <b>"baseline"</b> - the characters in the current text run will be aligned by the default text baseline.
* <b>"subscript"</b> - the characters in the current text run will be aligned below the default text baseline.
* <b>"superscript"</b> - the characters in the current text run will be aligned above the default text baseline.
* @memberof ApiRun
* @param {("baseline" | "subscript" | "superscript")} sType - The vertical alignment type applied to the text contents.
* @returns {ApiTextPr}
*/
ApiRun.prototype.SetVertAlign = function(sType) { return new ApiTextPr(); };

/**
* Gets the bold property from the current text properties.
* @memberof ApiTextPr
* @return {?boolean}
* @since 8.1.0
*/
ApiRun.prototype.GetBold = function() { return true; };

/**
* Gets the italic property from the current text properties.
* @memberof ApiTextPr
* @return {?boolean}
* @since 8.1.0
*/
ApiRun.prototype.GetItalic = function() { return true; };

/**
* Gets the strikeout property from the current text properties.
* @memberof ApiTextPr
* @return {?boolean}
* @since 8.1.0
*/
ApiRun.prototype.GetStrikeout = function() { return true; };

/**
* Gets the underline property from the current text properties.
* @memberof ApiTextPr
* @return {?boolean}
* @since 8.1.0
*/
ApiRun.prototype.GetUnderline = function() { return true; };

/**
* Returns the font family from the current text properties.
* The method automatically calculates the font from the theme if the font was set via the theme.
* @memberof ApiTextPr
* param {undefined | "ascii" | "eastAsia" | "hAnsi" | "cs"} [fontSlot="ascii"] - The font slot.
* If this parameter is not specified, the "ascii" value is used.
* @return {?string}
* @since 8.1.0
*/
ApiRun.prototype.GetFontFamily = function() { return ""; };

/**
* Gets the font size from the current text properties.
* @memberof ApiTextPr
* @return {?hps}
* @since 8.1.0
*/
ApiRun.prototype.GetFontSize = function() { return new hps(); };

/**
* Gets the highlight property from the current text properties.
* @memberof ApiTextPr
* @return {?string}
* @since 8.1.0
*/
ApiRun.prototype.GetHighlight = function() { return ""; };

/**
* Gets the text spacing from the current text properties measured in twentieths of a point.
* @memberof ApiTextPr
* @return {?twips}
* @since 8.1.0
*/
ApiRun.prototype.GetSpacing = function() { return new twips(); };

/**
* Gets the double strikeout property from the current text properties.
* @memberof ApiTextPr
* @return {?boolean}
* @since 8.1.0
*/
ApiRun.prototype.GetDoubleStrikeout = function() { return true; };

/**
* Returns whether the text with the current text properties are capitalized.
* @memberof ApiTextPr
* @return {?boolean}
* @since 8.1.0
*/
ApiRun.prototype.GetCaps = function() { return true; };

/**
* Returns whether the text with the current text properties are displayed capitalized two points smaller than the actual font size.
* @memberof ApiTextPr
* @return {?boolean}
* @since 8.1.0
*/
ApiRun.prototype.GetSmallCaps = function() { return true; };

/**
* Gets the text color from the current text properties.
* @memberof ApiTextPr
* @return {ApiFill}
* @since 8.1.0
*/
ApiRun.prototype.GetFill = function() { return new ApiFill(); };

/**
* Sets the text fill to the current text run.
* @memberof ApiTextPr
* @param {ApiFill} oApiFill - The color or pattern used to fill the text color.
* @return {ApiTextPr} - this text properties.
*/
ApiRun.prototype.SetTextFill = function(oApiFill) { return new ApiTextPr(); };

/**
* Gets the text fill from the current text properties.
* @memberof ApiTextPr
* @return {ApiFill}
* @since 8.1.0
*/
ApiRun.prototype.GetTextFill = function() { return new ApiFill(); };

/**
* Sets the text outline to the current text run.
* @memberof ApiTextPr
* @param {ApiStroke} oStroke - The stroke used to create the text outline.
* @return {ApiTextPr} - this text properties.
*/
ApiRun.prototype.SetOutLine = function(oStroke) { return new ApiTextPr(); };

/**
* Gets the text outline from the current text properties.
* @memberof ApiTextPr
* @return {ApiStroke}
* @since 8.1.0
*/
ApiRun.prototype.GetOutLine = function() { return new ApiStroke(); };

/**
* Returns a type of the ApiTextPr class.
* @memberof ApiTextPr
* @returns {"textPr"}
*/
ApiTextPr.prototype.GetClassType = function() { return ""; };

/**
* Sets the bold property to the text character.
* @memberof ApiTextPr
* @param {boolean} isBold - Specifies that the contents of the run are displayed bold.
* @return {ApiTextPr} - this text properties.
*/
ApiTextPr.prototype.SetBold = function(isBold) { return new ApiTextPr(); };

/**
* Gets the bold property from the current text properties.
* @memberof ApiTextPr
* @return {?boolean}
* @since 8.1.0
*/
ApiTextPr.prototype.GetBold = function() { return true; };

/**
* Sets the italic property to the text character.
* @memberof ApiTextPr
* @param {boolean} isItalic - Specifies that the contents of the current run are displayed italicized.
* @return {ApiTextPr} - this text properties.
*/
ApiTextPr.prototype.SetItalic = function(isItalic) { return new ApiTextPr(); };

/**
* Gets the italic property from the current text properties.
* @memberof ApiTextPr
* @return {?boolean}
* @since 8.1.0
*/
ApiTextPr.prototype.GetItalic = function() { return true; };

/**
* Specifies that the contents of the run are displayed with a single horizontal line through the center of the line.
* @memberof ApiTextPr
* @param {boolean} isStrikeout - Specifies that the contents of the current run are displayed struck through.
* @return {ApiTextPr} - this text properties.
*/
ApiTextPr.prototype.SetStrikeout = function(isStrikeout) { return new ApiTextPr(); };

/**
* Gets the strikeout property from the current text properties.
* @memberof ApiTextPr
* @return {?boolean}
* @since 8.1.0
*/
ApiTextPr.prototype.GetStrikeout = function() { return true; };

/**
* Specifies that the contents of the run are displayed along with a line appearing directly below the character
* (less than all the spacing above and below the characters on the line).
* @memberof ApiTextPr
* @param {boolean} isUnderline - Specifies that the contents of the current run are displayed underlined.
* @return {ApiTextPr} - this text properties.
*/
ApiTextPr.prototype.SetUnderline = function(isUnderline) { return new ApiTextPr(); };

/**
* Gets the underline property from the current text properties.
* @memberof ApiTextPr
* @return {?boolean}
* @since 8.1.0
*/
ApiTextPr.prototype.GetUnderline = function() { return true; };

/**
* Sets all 4 font slots with the specified font family.
* @memberof ApiTextPr
* @param {string} sFontFamily - The font family or families used for the current text run.
* @return {ApiTextPr} - this text properties.
*/
ApiTextPr.prototype.SetFontFamily = function(sFontFamily) { return new ApiTextPr(); };

/**
* Returns the font family from the current text properties.
* The method automatically calculates the font from the theme if the font was set via the theme.
* @memberof ApiTextPr
* param {undefined | "ascii" | "eastAsia" | "hAnsi" | "cs"} [fontSlot="ascii"] - The font slot.
* If this parameter is not specified, the "ascii" value is used.
* @return {?string}
* @since 8.1.0
*/
ApiTextPr.prototype.GetFontFamily = function() { return ""; };

/**
* Sets the font size to the characters of the current text run.
* @memberof ApiTextPr
* @param {hps} nSize - The text size value measured in half-points (1/144 of an inch).
* @return {ApiTextPr} - this text properties.
*/
ApiTextPr.prototype.SetFontSize = function(nSize) { return new ApiTextPr(); };

/**
* Gets the font size from the current text properties.
* @memberof ApiTextPr
* @return {?hps}
* @since 8.1.0
*/
ApiTextPr.prototype.GetFontSize = function() { return new hps(); };

/**
* Specifies the alignment which will be applied to the contents of the run in relation to the default appearance of the run text:
* <b>"baseline"</b> - the characters in the current text run will be aligned by the default text baseline.
* <b>"subscript"</b> - the characters in the current text run will be aligned below the default text baseline.
* <b>"superscript"</b> - the characters in the current text run will be aligned above the default text baseline.
* @memberof ApiTextPr
* @param {("baseline" | "subscript" | "superscript")} sType - The vertical alignment type applied to the text contents.
* @return {ApiTextPr} - this text properties.
*/
ApiTextPr.prototype.SetVertAlign = function(sType) { return new ApiTextPr(); };

/**
* Specifies a highlighting color which is added to the text properties and applied as a background to the contents of the current run/range/paragraph.
* @memberof ApiTextPr
* @param {highlightColor} sColor - Available highlight color.
* @returns {ApiTextPr}
*/
ApiTextPr.prototype.SetHighlight = function(sColor) { return new ApiTextPr(); };

/**
* Gets the highlight property from the current text properties.
* @memberof ApiTextPr
* @return {?string}
* @since 8.1.0
*/
ApiTextPr.prototype.GetHighlight = function() { return ""; };

/**
* Sets the text spacing measured in twentieths of a point.
* @memberof ApiTextPr
* @param {twips} nSpacing - The value of the text spacing measured in twentieths of a point (1/1440 of an inch).
* @return {ApiTextPr} - this text properties.
*/
ApiTextPr.prototype.SetSpacing = function(nSpacing) { return new ApiTextPr(); };

/**
* Gets the text spacing from the current text properties measured in twentieths of a point.
* @memberof ApiTextPr
* @return {?twips}
* @since 8.1.0
*/
ApiTextPr.prototype.GetSpacing = function() { return new twips(); };

/**
* Specifies that the contents of the run are displayed with two horizontal lines through each character displayed on the line.
* @memberof ApiTextPr
* @param {boolean} isDoubleStrikeout - Specifies that the contents of the current run are displayed double struck through.
* @return {ApiTextPr} - this text properties.
*/
ApiTextPr.prototype.SetDoubleStrikeout = function(isDoubleStrikeout) { return new ApiTextPr(); };

/**
* Gets the double strikeout property from the current text properties.
* @memberof ApiTextPr
* @return {?boolean}
* @since 8.1.0
*/
ApiTextPr.prototype.GetDoubleStrikeout = function() { return true; };

/**
* Specifies that any lowercase characters in the text run are formatted for display only as their capital letter character equivalents.
* @memberof ApiTextPr
* @param {boolean} isCaps - Specifies that the contents of the current run are displayed capitalized.
* @return {ApiTextPr} - this text properties.
*/
ApiTextPr.prototype.SetCaps = function(isCaps) { return new ApiTextPr(); };

/**
* Returns whether the text with the current text properties are capitalized.
* @memberof ApiTextPr
* @return {?boolean}
* @since 8.1.0
*/
ApiTextPr.prototype.GetCaps = function() { return true; };

/**
* Specifies that all the small letter characters in the text run are formatted for display only as their capital
* letter character equivalents which are two points smaller than the actual font size specified for this text.
* @memberof ApiTextPr
* @param {boolean} isSmallCaps - Specifies if the contents of the current run are displayed capitalized two points smaller or not.
* @return {ApiTextPr} - this text properties.
*/
ApiTextPr.prototype.SetSmallCaps = function(isSmallCaps) { return new ApiTextPr(); };

/**
* Returns whether the text with the current text properties are displayed capitalized two points smaller than the actual font size.
* @memberof ApiTextPr
* @return {?boolean}
* @since 8.1.0
*/
ApiTextPr.prototype.GetSmallCaps = function() { return true; };

/**
* Sets the text color to the current text run.
* @memberof ApiTextPr
* @param {ApiFill} oApiFill - The color or pattern used to fill the text color.
* @return {ApiTextPr} - this text properties.
*/
ApiTextPr.prototype.SetFill = function(oApiFill) { return new ApiTextPr(); };

/**
* Gets the text color from the current text properties.
* @memberof ApiTextPr
* @return {ApiFill}
* @since 8.1.0
*/
ApiTextPr.prototype.GetFill = function() { return new ApiFill(); };

/**
* Sets the text fill to the current text run.
* @memberof ApiTextPr
* @param {ApiFill} oApiFill - The color or pattern used to fill the text color.
* @return {ApiTextPr} - this text properties.
*/
ApiTextPr.prototype.SetTextFill = function(oApiFill) { return new ApiTextPr(); };

/**
* Gets the text fill from the current text properties.
* @memberof ApiTextPr
* @return {ApiFill}
* @since 8.1.0
*/
ApiTextPr.prototype.GetTextFill = function() { return new ApiFill(); };

/**
* Sets the text outline to the current text run.
* @memberof ApiTextPr
* @param {ApiStroke} oStroke - The stroke used to create the text outline.
* @return {ApiTextPr} - this text properties.
*/
ApiTextPr.prototype.SetOutLine = function(oStroke) { return new ApiTextPr(); };

/**
* Gets the text outline from the current text properties.
* @memberof ApiTextPr
* @return {ApiStroke}
* @since 8.1.0
*/
ApiTextPr.prototype.GetOutLine = function() { return new ApiStroke(); };

/**
* Returns a type of the ApiParaPr class.
* @memberof ApiParaPr
* @returns {"paraPr"}
*/
ApiParaPr.prototype.GetClassType = function() { return ""; };

/**
* Sets the paragraph left side indentation.
* @memberof ApiParaPr
* @param {twips} nValue - The paragraph left side indentation value measured in twentieths of a point (1/1440 of an inch).
* @returns {boolean}
*/
ApiParaPr.prototype.SetIndLeft = function(nValue) { return true; };

/**
* Returns the paragraph left side indentation.
* @memberof ApiParaPr
* @returns {twips | undefined} - The paragraph left side indentation value measured in twentieths of a point (1/1440 of an inch).
*/
ApiParaPr.prototype.GetIndLeft = function() { return new twips(); };

/**
* Sets the paragraph right side indentation.
* @memberof ApiParaPr
* @param {twips} nValue - The paragraph right side indentation value measured in twentieths of a point (1/1440 of an inch).
* @returns {boolean}
*/
ApiParaPr.prototype.SetIndRight = function(nValue) { return true; };

/**
* Returns the paragraph right side indentation.
* @memberof ApiParaPr
* @returns {twips | undefined} - The paragraph right side indentation value measured in twentieths of a point (1/1440 of an inch).
*/
ApiParaPr.prototype.GetIndRight = function() { return new twips(); };

/**
* Sets the paragraph first line indentation.
* @memberof ApiParaPr
* @param {twips} nValue - The paragraph first line indentation value measured in twentieths of a point (1/1440 of an inch).
* @returns {boolean}
*/
ApiParaPr.prototype.SetIndFirstLine = function(nValue) { return true; };

/**
* Returns the paragraph first line indentation.
* @memberof ApiParaPr
* @returns {twips | undefined} - The paragraph first line indentation value measured in twentieths of a point (1/1440 of an inch).
*/
ApiParaPr.prototype.GetIndFirstLine = function() { return new twips(); };

/**
* Sets the paragraph contents justification.
* @memberof ApiParaPr
* @param {("left" | "right" | "both" | "center")} sJc - The justification type that
* will be applied to the paragraph contents.
* @returns {boolean}
*/
ApiParaPr.prototype.SetJc = function(sJc) { return true; };

/**
* Returns the paragraph contents justification.
* @memberof ApiParaPr
* @returns {("left" | "right" | "both" | "center" | undefined)} 
*/
ApiParaPr.prototype.GetJc = function() { return ""; };

/**
* Sets the paragraph line spacing. If the value of the sLineRule parameter is either 
* "atLeast" or "exact", then the value of nLine will be interpreted as twentieths of a point. If 
* the value of the sLineRule parameter is "auto", then the value of the 
* nLine parameter will be interpreted as 240ths of a line.
* @memberof ApiParaPr
* @param {(twips | line240)} nLine - The line spacing value measured either in twentieths of a point (1/1440 of an inch) or in 240ths of a line.
* @param {("auto" | "atLeast" | "exact")} sLineRule - The rule that determines the measuring units of the line spacing.
* @returns {boolean}
*/
ApiParaPr.prototype.SetSpacingLine = function(nLine, sLineRule) { return true; };

/**
* Returns the paragraph line spacing value.
* @memberof ApiParaPr
* @returns {twips | line240 | undefined} - to know is twips or line240 use ApiParaPr.prototype.GetSpacingLineRule().
*/
ApiParaPr.prototype.GetSpacingLineValue = function() { return new twips(); };

/**
* Returns the paragraph line spacing rule.
* @memberof ApiParaPr
* @returns {"auto" | "atLeast" | "exact" | undefined} 
*/
ApiParaPr.prototype.GetSpacingLineRule = function() { return ""; };

/**
* Sets the spacing before the current paragraph. If the value of the isBeforeAuto parameter is true, then 
* any value of the nBefore is ignored. If isBeforeAuto parameter is not specified, then 
* it will be interpreted as false.
* @memberof ApiParaPr
* @param {twips} nBefore - The value of the spacing before the current paragraph measured in twentieths of a point (1/1440 of an inch).
* @param {boolean} [isBeforeAuto=false] - The true value disables the spacing before the current paragraph.
* @returns {boolean}
*/
ApiParaPr.prototype.SetSpacingBefore = function(nBefore, isBeforeAuto) { return true; };

/**
* Returns the spacing before value of the current paragraph.
* @memberof ApiParaPr
* @returns {twips} - The value of the spacing before the current paragraph measured in twentieths of a point (1/1440 of an inch).
*/
ApiParaPr.prototype.GetSpacingBefore = function() { return new twips(); };

/**
* Sets the spacing after the current paragraph. If the value of the isAfterAuto parameter is true, then 
* any value of the nAfter is ignored. If isAfterAuto parameter is not specified, then it 
* will be interpreted as false.
* @memberof ApiParaPr
* @param {twips} nAfter - The value of the spacing after the current paragraph measured in twentieths of a point (1/1440 of an inch).
* @param {boolean} [isAfterAuto=false] - The true value disables the spacing after the current paragraph.
* @returns {boolean}
*/
ApiParaPr.prototype.SetSpacingAfter = function(nAfter, isAfterAuto) { return true; };

/**
* Returns the spacing after value of the current paragraph. 
* @memberof ApiParaPr
* @returns {twips} - The value of the spacing after the current paragraph measured in twentieths of a point (1/1440 of an inch).
*/
ApiParaPr.prototype.GetSpacingAfter = function() { return new twips(); };

/**
* Specifies a sequence of custom tab stops which will be used for any tab characters in the current paragraph.
* <b>Warning</b>: The lengths of aPos array and aVal array <b>MUST BE</b> equal to each other.
* @memberof ApiParaPr
* @param {twips[]} aPos - An array of the positions of custom tab stops with respect to the current page margins
* measured in twentieths of a point (1/1440 of an inch).
* @param {TabJc[]} aVal - An array of the styles of custom tab stops, which determines the behavior of the tab
* stop and the alignment which will be applied to text entered at the current custom tab stop.
* @returns {boolean}
*/
ApiParaPr.prototype.SetTabs = function(aPos, aVal) { return true; };

/**
* Returns the custom tab stops of the current paragraph.
* @memberof ApiParaPr
* @since 9.4.0
* @returns {TabStop[]}
*/
ApiParaPr.prototype.GetTabs = function() { return []; };

/**
* Sets the bullet or numbering to the current paragraph.
* @memberof ApiParaPr
* @param {?ApiBullet} oBullet - The bullet object created with the {@link Api#CreateBullet} or {@link Api#CreateNumbering} method.
*/
ApiParaPr.prototype.SetBullet = function(oBullet) {};

/**
* Sets the outline level for the specified properties.
* @memberof ApiParaPr
* @param {Number | null | undefined} [lvl=undefined] - The outline level. Possible values: 1-9. The 1The desired functionality is as follows: When inserting document A into document B using the merge document API during editing, the source of document A should be visible within document B. By clicking or hovering over the inserted content of document A in document B, information about the insertion of document A should be displayed in a pop-up/floating window, preserving the boundaries of document A. Document A should be able to be inserted between any two characters in document B.
* To set no outline level, use this method without a parameter.
* @returns {boolean}
* @since 8.2.0
*/
ApiParaPr.prototype.SetOutlineLvl = function(lvl) { return true; };

/**
* Returns the outline level of the specified properties.
* @memberof ApiParaPr
* @returns {Number | undefined}
* @since 8.2.0
*/
ApiParaPr.prototype.GetOutlineLvl = function() { return 0; };

/**
* Checks whether the current geometry is custom.
* @memberof ApiGeometry
* @returns {boolean}
* @since 9.1.0
*/
ApiGeometry.prototype.IsCustom = function() { return true; };

/**
* Returns the name of the preset shape if the current geometry is based on a preset.
* @memberof ApiGeometry
* @returns {ShapeType | null}
* @since 9.1.0
*/
ApiGeometry.prototype.GetPreset = function() { return new ShapeType(); };

/**
* Returns the number of paths in the current geometry.
* @memberof ApiGeometry
* @returns {number}
* @since 9.1.0
*/
ApiGeometry.prototype.GetPathCount = function() { return 0; };

/**
* Returns a geometry path by its index.
* @memberof ApiGeometry
* @param {number} nIndex - The path index.
* @returns {ApiPath}
* @since 9.1.0
*/
ApiGeometry.prototype.GetPath = function(nIndex) { return new ApiPath(); };

/**
* Returns all paths of the current geometry.
* @memberof ApiGeometry
* @returns {ApiPath[]}
* @since 9.1.0
*/
ApiGeometry.prototype.GetPaths = function() { return []; };

/**
* Adds a new path to the current geometry.
* @memberof ApiGeometry
* @returns {ApiPath | null}
* @since 9.1.0
*/
ApiGeometry.prototype.AddPath = function() { return new ApiPath(); };

/**
* Returns the adjustment value by its name from the current geometry.
* @memberof ApiGeometry
* @param {string} sName - The adjustment name.
* @returns {number | null}
* @since 9.1.0
*/
ApiGeometry.prototype.GetAdjValue = function(sName) { return 0; };

/**
* Adds a new adjustment parameter to the current geometry.
* @memberof ApiGeometry
* @param {string} sName - The adjustment name.
* @param {number} nValue - The adjustment value.
* @returns {boolean}
* @since 9.1.0
*/
ApiGeometry.prototype.AddAdj = function(sName, nValue) { return true; };

/**
* Sets the specified adjustment parameter for the current geometry.
* @memberof ApiGeometry
* @param {string} sName - The adjustment name.
* @param {number} nValue - The adjustment value.
* @since 9.1.0
*/
ApiGeometry.prototype.SetAdjValue = function(sName, nValue) {};

/**
* Adds a guide (formula) to the current geometry.
* @memberof ApiGeometry
* @param {string} sName - The guide name.
* @param {GeometryFormulaType} sFormula - The formula type.
* @param {string} sX - The X parameter.
* @param {string} sY - The Y parameter.
* @param {string} sZ - The Z parameter.
* @returns {boolean}
* @since 9.1.0
*/
ApiGeometry.prototype.AddGuide = function(sName, sFormula, sX, sY, sZ) { return true; };

/**
* Sets the text rectangle for the current geometry.
* @memberof ApiGeometry
* @param {string} sLeft - The left guide name or value.
* @param {string} sTop - The top guide name or value.
* @param {string} sRight - The right guide name or value.
* @param {string} sBottom - The bottom guide name or value.
* @returns {boolean}
* @since 9.1.0
*/
ApiGeometry.prototype.SetTextRect = function(sLeft, sTop, sRight, sBottom) { return true; };

/**
* Adds a connection point to the current geometry.
* @memberof ApiGeometry
* @param {string} sAngle - The angle of the connection point.
* @param {string} sX - The X position.
* @param {string} sY - The Y position.
* @returns {boolean}
* @since 9.1.0
*/
ApiGeometry.prototype.AddConnectionPoint = function(sAngle, sX, sY) { return true; };

/**
* Returns the type of the current path command.
* @memberof ApiPathCommand
* @returns {PathCommandType}
* @since 9.1.0
*/
ApiPathCommand.prototype.GetType = function() { return new PathCommandType(); };

/**
* Returns the X coordinate for the "moveTo"/"lineTo" path commands.
* @memberof ApiPathCommand
* @returns {string | null}
* @since 9.1.0
*/
ApiPathCommand.prototype.GetX = function() { return ""; };

/**
* Returns the Y coordinate for the "moveTo"/"lineTo" path commands.
* @memberof ApiPathCommand
* @returns {string | null}
* @since 9.1.0
*/
ApiPathCommand.prototype.GetY = function() { return ""; };

/**
* Returns the X coordinate of the first control point for the Bezier curves.
* @memberof ApiPathCommand
* @returns {string | null}
* @since 9.1.0
*/
ApiPathCommand.prototype.GetX0 = function() { return ""; };

/**
* Returns the Y coordinate of the first control point for the Bezier curves.
* @memberof ApiPathCommand
* @returns {string | null}
* @since 9.1.0
*/
ApiPathCommand.prototype.GetY0 = function() { return ""; };

/**
* Returns the X coordinate of the second control point for the cubic Bezier curves.
* @memberof ApiPathCommand
* @returns {string | null}
* @since 9.1.0
*/
ApiPathCommand.prototype.GetX1 = function() { return ""; };

/**
* Returns the Y coordinate of the second control point for the cubic Bezier curves.
* @memberof ApiPathCommand
* @returns {string | null}
* @since 9.1.0
*/
ApiPathCommand.prototype.GetY1 = function() { return ""; };

/**
* Returns the X coordinate of the end point for the cubic Bezier curves.
* @memberof ApiPathCommand
* @returns {string | null}
* @since 9.1.0
*/
ApiPathCommand.prototype.GetX2 = function() { return ""; };

/**
* Returns the Y coordinate of the end point for the cubic Bezier curves.
* @memberof ApiPathCommand
* @returns {string | null}
* @since 9.1.0
*/
ApiPathCommand.prototype.GetY2 = function() { return ""; };

/**
* Returns the width radius of the arc.
* @memberof ApiPathCommand
* @returns {string | null}
* @since 9.1.0
*/
ApiPathCommand.prototype.GetWR = function() { return ""; };

/**
* Returns the height radius of the arc.
* @memberof ApiPathCommand
* @returns {string | null}
* @since 9.1.0
*/
ApiPathCommand.prototype.GetHR = function() { return ""; };

/**
* Returns the start angle of the arc.
* @memberof ApiPathCommand
* @returns {string | null}
* @since 9.1.0
*/
ApiPathCommand.prototype.GetStartAngle = function() { return ""; };

/**
* Returns the sweep angle of the arc.
* @memberof ApiPathCommand
* @returns {string | null}
* @since 9.1.0
*/
ApiPathCommand.prototype.GetSweepAngle = function() { return ""; };

/**
* Returns true if the current path is stroked, otherwise false.
* @memberof ApiPath
* @returns {boolean}
* @since 9.1.0
*/
ApiPath.prototype.GetStroke = function() { return true; };

/**
* Sets whether the current path is stroked.
* @memberof ApiPath
* @param {boolean} bStroke - Specifies if the path is stroked (true) or not (false).
* @since 9.1.0
*/
ApiPath.prototype.SetStroke = function(bStroke) {};

/**
* Returns the fill type of the current path.
* @memberof ApiPath
* @returns {PathFillType}
* @since 9.1.0
*/
ApiPath.prototype.GetFill = function() { return new PathFillType(); };

/**
* Sets the fill type to the current path.
* @memberof ApiPath
* @param {PathFillType} sFill - The path fill type.
* @since 9.1.0
*/
ApiPath.prototype.SetFill = function(sFill) {};

/**
* Returns the width of the current path.
* @memberof ApiPath
* @returns {number}
* @since 9.1.0
*/
ApiPath.prototype.GetWidth = function() { return 0; };

/**
* Sets the width to the current path.
* @memberof ApiPath
* @param {number} nWidth - The path width in EMU.
* @since 9.1.0
*/
ApiPath.prototype.SetWidth = function(nWidth) {};

/**
* Returns the height of the current path.
* @memberof ApiPath
* @returns {number}
* @since 9.1.0
*/
ApiPath.prototype.GetHeight = function() { return 0; };

/**
* Sets the height to the current path.
* @memberof ApiPath
* @param {number} nHeight - The path height in EMU.
* @since 9.1.0
*/
ApiPath.prototype.SetHeight = function(nHeight) {};

/**
* Returns all commands of the current path.
* @memberof ApiPath
* @returns {ApiPathCommand[]}
* @since 9.1.0
*/
ApiPath.prototype.GetCommands = function() { return []; };

/**
* Returns the number of commands for the current path.
* @memberof ApiPath
* @returns {number}
* @since 9.1.0
*/
ApiPath.prototype.GetCommandCount = function() { return 0; };

/**
* Returns a specific path command by its index.
* @memberof ApiPath
* @param {number} nIndex - The path command index.
* @returns {ApiPathCommand | null}
* @since 9.1.0
*/
ApiPath.prototype.GetCommand = function(nIndex) { return new ApiPathCommand(); };

/**
* Moves the current path to the specified coordinates.
* @memberof ApiPath
* @param {GeometryCoordinate} x - The X coordinate.
* @param {GeometryCoordinate} y - The Y coordinate.
* @since 9.1.0
*/
ApiPath.prototype.MoveTo = function(x, y) {};

/**
* Draws a line from the current point to the specified coordinates.
* @memberof ApiPath
* @param {GeometryCoordinate} x - The X coordinate.
* @param {GeometryCoordinate} y - The Y coordinate.
* @since 9.1.0
*/
ApiPath.prototype.LineTo = function(x, y) {};

/**
* Draws a cubic Bezier curve from the current point to the specified end point using two control points.
* @memberof ApiPath
* @param {GeometryCoordinate} x1 - The X coordinate of the first control point.
* @param {GeometryCoordinate} y1 - The Y coordinate of the first control point.
* @param {GeometryCoordinate} x2 - The X coordinate of the second control point.
* @param {GeometryCoordinate} y2 - The Y coordinate of the second control point.
* @param {GeometryCoordinate} x3 - The X coordinate of the end point.
* @param {GeometryCoordinate} y3 - The Y coordinate of the end point.
* @since 9.1.0
*/
ApiPath.prototype.CubicBezTo = function(x1, y1, x2, y2, x3, y3) {};

/**
* Draws a quadratic Bezier curve from the current point to the specified end point using a control point.
* @memberof ApiPath
* @param {GeometryCoordinate} x1 - The X coordinate of the control point.
* @param {GeometryCoordinate} y1 - The Y coordinate of the control point.
* @param {GeometryCoordinate} x2 - The X coordinate of the end point.
* @param {GeometryCoordinate} y2 - The Y coordinate of the end point.
* @since 9.1.0
*/
ApiPath.prototype.QuadBezTo = function(x1, y1, x2, y2) {};

/**
* Draws an arc from the current point using the specified width and height radii, start angle, and sweep angle.
* @memberof ApiPath
* @param {GeometryCoordinate} wR - The width radius.
* @param {GeometryCoordinate} hR - The height radius.
* @param {GeometryCoordinate} stAng - The start angle.
* @param {GeometryCoordinate} swAng - The sweep angle.
* @since 9.1.0
*/
ApiPath.prototype.ArcTo = function(wR, hR, stAng, swAng) {};

/**
* Closes the current path.
* @memberof ApiPath
* @since 9.1.0
*/
ApiPath.prototype.Close = function() {};

/**
* Returns a type of the ApiChart class.
* @memberof ApiChart
* @returns {"chart"}
*/
ApiChart.prototype.GetClassType = function() { return ""; };

/**
* Returns a type of the chart object.
* @memberof ApiChart
* @returns {ChartType}
*/
ApiChart.prototype.GetChartType = function() { return new ChartType(); };

/**
*  Specifies the chart title.
*  @memberof ApiChart
*  @param {string} sTitle - The title which will be displayed for the current chart.
*  @param {pt} nFontSize - The text size value measured in points.
*  @param {boolean} bIsBold - Specifies if the chart title is written in bold font or not.
* 	@returns {boolean}
*/
ApiChart.prototype.SetTitle = function(sTitle, nFontSize, bIsBold) { return true; };

/**
* Returns the chart title text.
* @memberof ApiChart
* @returns {string | null} - The chart title text or null if the chart has no title.
*/
ApiChart.prototype.GetTitle = function() { return ""; };

/**
*  Specifies the chart horizontal axis title.
*  @memberof ApiChart
*  @param {string} sTitle - The title which will be displayed for the horizontal axis of the current chart.
*  @param {pt} nFontSize - The text size value measured in points.
*  @param {boolean} bIsBold - Specifies if the horizontal axis title is written in bold font or not.
*	@returns {boolean}
*/
ApiChart.prototype.SetHorAxisTitle = function(sTitle, nFontSize, bIsBold) { return true; };

/**
*  Specifies the chart vertical axis title.
*  @memberof ApiChart
*  @param {string} sTitle - The title which will be displayed for the vertical axis of the current chart.
*  @param {pt} nFontSize - The text size value measured in points.
*  @param {boolean} bIsBold - Specifies if the vertical axis title is written in bold font or not.
*	@returns {boolean}
*/
ApiChart.prototype.SetVerAxisTitle = function(sTitle, nFontSize, bIsBold) { return true; };

/**
* Specifies the vertical axis orientation.
* @memberof ApiChart
* @param {boolean} bIsMinMax - The <code>true</code> value will set the normal data direction for the vertical axis (from minimum to maximum).
* @returns {boolean}
*/
ApiChart.prototype.SetVerAxisOrientation = function(bIsMinMax) { return true; };

/**
* Specifies the horizontal axis orientation.
* @memberof ApiChart
* @param {boolean} bIsMinMax - The <code>true</code> value will set the normal data direction for the horizontal axis (from minimum to maximum).
* @returns {boolean}
*/
ApiChart.prototype.SetHorAxisOrientation = function(bIsMinMax) { return true; };

/**
* Specifies the chart legend position.
* @memberof ApiChart
* @param {"left" | "top" | "right" | "bottom" | "none"} sLegendPos - The position of the chart legend inside the chart window.
* @returns {boolean}
*/
ApiChart.prototype.SetLegendPos = function(sLegendPos) { return true; };

/**
* Specifies the legend font size.
* @memberof ApiChart
* @param {pt} nFontSize - The text size value measured in points.
* @returns {boolean}
*/
ApiChart.prototype.SetLegendFontSize = function(nFontSize) { return true; };

/**
* Specifies which chart data labels are shown for the chart.
* @memberof ApiChart
* @param {boolean} bShowSerName - Whether to show or hide the source table column names used for the data which the chart will be build from.
* @param {boolean} bShowCatName - Whether to show or hide the source table row names used for the data which the chart will be build from.
* @param {boolean} bShowVal - Whether to show or hide the chart data values.
* @param {boolean} bShowPercent - Whether to show or hide the percent for the data values (works with stacked chart types).
* @returns {boolean}
*/
ApiChart.prototype.SetShowDataLabels = function(bShowSerName, bShowCatName, bShowVal, bShowPercent) { return true; };

/**
* Spicifies the show options for data labels.
* @memberof ApiChart
* @param {number} nSeriesIndex - The series index from the array of the data used to build the chart from.
* @param {number} nPointIndex - The point index from this series.
* @param {boolean} bShowSerName - Whether to show or hide the source table column names used for the data which the chart will be build from.
* @param {boolean} bShowCatName - Whether to show or hide the source table row names used for the data which the chart will be build from.
* @param {boolean} bShowVal - Whether to show or hide the chart data values.
* @param {boolean} bShowPercent - Whether to show or hide the percent for the data values (works with stacked chart types).
* @returns {boolean}
*/
ApiChart.prototype.SetShowPointDataLabel = function(nSeriesIndex, nPointIndex, bShowSerName, bShowCatName, bShowVal, bShowPercent) { return true; };

/**
* Spicifies tick labels position for the vertical axis.
* @memberof ApiChart
* @param {TickLabelPosition} sTickLabelPosition - The type for the position of chart vertical tick labels.
* @returns {boolean}
*/
ApiChart.prototype.SetVertAxisTickLabelPosition = function(sTickLabelPosition) { return true; };

/**
* Spicifies tick labels position for the horizontal axis.
* @memberof ApiChart
* @param {TickLabelPosition} sTickLabelPosition - The type for the position of chart horizontal tick labels.
* @returns {boolean}
*/
ApiChart.prototype.SetHorAxisTickLabelPosition = function(sTickLabelPosition) { return true; };

/**
* Specifies major tick mark for the horizontal axis.
* @memberof ApiChart
* @param {TickMark} sTickMark - The type of tick mark appearance.
* @returns {boolean}
*/
ApiChart.prototype.SetHorAxisMajorTickMark = function(sTickMark) { return true; };

/**
* Specifies minor tick mark for the horizontal axis.
* @memberof ApiChart
* @param {TickMark} sTickMark - The type of tick mark appearance.
* @returns {boolean}
*/
ApiChart.prototype.SetHorAxisMinorTickMark = function(sTickMark) { return true; };

/**
* Specifies major tick mark for the vertical axis.
* @memberof ApiChart
* @param {TickMark} sTickMark - The type of tick mark appearance.
* @returns {boolean}
*/
ApiChart.prototype.SetVertAxisMajorTickMark = function(sTickMark) { return true; };

/**
* Specifies minor tick mark for the vertical axis.
* @memberof ApiChart
* @param {TickMark} sTickMark - The type of tick mark appearance.
* @returns {boolean}
*/
ApiChart.prototype.SetVertAxisMinorTickMark = function(sTickMark) { return true; };

/**
* Specifies major vertical gridline visual properties.
* @memberof ApiChart
* @param {?ApiStroke} oStroke - The stroke used to create the element shadow.
* @returns {boolean}
*/
ApiChart.prototype.SetMajorVerticalGridlines = function(oStroke) { return true; };

/**
* Specifies minor vertical gridline visual properties.
* @memberof ApiChart
* @param {?ApiStroke} oStroke - The stroke used to create the element shadow.
* @returns {boolean}
*/
ApiChart.prototype.SetMinorVerticalGridlines = function(oStroke) { return true; };

/**
* Specifies major horizontal gridline visual properties.
* @memberof ApiChart
* @param {?ApiStroke} oStroke - The stroke used to create the element shadow.
* @returns {boolean}
*/
ApiChart.prototype.SetMajorHorizontalGridlines = function(oStroke) { return true; };

/**
* Specifies minor horizontal gridline visual properties.
* @memberof ApiChart
* @param {?ApiStroke} oStroke - The stroke used to create the element shadow.
* @returns {boolean}
*/
ApiChart.prototype.SetMinorHorizontalGridlines = function(oStroke) { return true; };

/**
* Specifies font size for labels of the horizontal axis.
* @memberof ApiChart
* @param {pt} nFontSize - The text size value measured in points.
* @returns {boolean}
*/
ApiChart.prototype.SetHorAxisLabelsFontSize = function(nFontSize) { return true; };

/**
* Specifies font size for labels of the vertical axis.
* @memberof ApiChart
* @param {pt} nFontSize - The text size value measured in points.
* @returns {boolean}
*/
ApiChart.prototype.SetVertAxisLabelsFontSize = function(nFontSize) { return true; };

/**
* Removes the specified series from the current chart.
* @memberof ApiChart
* @param {number} nSeria - The index of the chart series.
* @returns {boolean}
*/
ApiChart.prototype.RemoveSeria = function(nSeria) { return true; };

/**
* Sets values to the specified chart series.
* @memberof ApiChart
* @param {number[]} aValues - The array of the data which will be set to the specified chart series.
* @param {number} nSeria - The index of the chart series.
* @returns {boolean}
*/
ApiChart.prototype.SetSeriaValues = function(aValues, nSeria) { return true; };

/**
* Sets the x-axis values to all chart series. It is used with the scatter charts only.
* @memberof ApiChart
* @param {string[]} aValues - The array of the data which will be set to the x-axis data points.
* @returns {boolean}
*/
ApiChart.prototype.SetXValues = function(aValues) { return true; };

/**
* Sets a name to the specified chart series.
* @memberof ApiChart
* @param {string} sName - The name which will be set to the specified chart series.
* @param {number} nSeria - The index of the chart series.
* @returns {boolean}
*/
ApiChart.prototype.SetSeriaName = function(sName, nSeria) { return true; };

/**
* Sets a name to the specified chart category.
* @memberof ApiChart
* @param {string} sName - The name which will be set to the specified chart category.
* @param {number} nCategory - The index of the chart category.
* @returns {boolean}
*/
ApiChart.prototype.SetCategoryName = function(sName, nCategory) { return true; };

/**
* Sets a style to the current chart by style ID.
* @memberof ApiChart
* @param nStyleId - One of the styles available in the editor.
* @returns {boolean}
*/
ApiChart.prototype.ApplyChartStyle = function(nStyleId) { return true; };

/**
* Sets the fill to the chart plot area.
* @memberof ApiChart
* @param {ApiFill} oFill - The fill type used to fill the plot area.
* @returns {boolean}
*/
ApiChart.prototype.SetPlotAreaFill = function(oFill) { return true; };

/**
* Sets the outline to the chart plot area.
* @memberof ApiChart
* @param {ApiStroke} oStroke - The stroke used to create the plot area outline.
* @returns {boolean}
*/
ApiChart.prototype.SetPlotAreaOutLine = function(oStroke) { return true; };

/**
* Sets the fill to the specified chart series.
* @memberof ApiChart
* @param {ApiFill} oFill - The fill type used to fill the series.
* @param {number} nSeries - The index of the chart series.
* @param {boolean} [bAll=false] - Specifies if the fill will be applied to all series.
* @returns {boolean}
*/
ApiChart.prototype.SetSeriesFill = function(oFill, nSeries, bAll) { return true; };

/**
* Sets the outline to the specified chart series.
* @memberof ApiChart
* @param {ApiStroke} oStroke - The stroke used to create the series outline.
* @param {number} nSeries - The index of the chart series.
* @param {boolean} [bAll=false] - Specifies if the outline will be applied to all series.
* @returns {boolean}
*/
ApiChart.prototype.SetSeriesOutLine = function(oStroke, nSeries, bAll) { return true; };

/**
* Sets the fill to the data point in the specified chart series.
* @memberof ApiChart
* @param {ApiFill} oFill - The fill type used to fill the data point.
* @param {number} nSeries - The index of the chart series.
* @param {number} nDataPoint - The index of the data point in the specified chart series.
* @param {boolean} [bAllSeries=false] - Specifies if the fill will be applied to the specified data point in all series.
* @returns {boolean}
*/
ApiChart.prototype.SetDataPointFill = function(oFill, nSeries, nDataPoint, bAllSeries) { return true; };

/**
* Sets the outline to the data point in the specified chart series.
* @memberof ApiChart
* @param {ApiStroke} oStroke - The stroke used to create the data point outline.
* @param {number} nSeries - The index of the chart series.
* @param {number} nDataPoint - The index of the data point in the specified chart series.
* @param {boolean} bAllSeries - Specifies if the outline will be applied to the specified data point in all series.
* @returns {boolean}
*/
ApiChart.prototype.SetDataPointOutLine = function(oStroke, nSeries, nDataPoint, bAllSeries) { return true; };

/**
* Sets the fill to the marker in the specified chart series.
* @memberof ApiChart
* @param {ApiFill} oFill - The fill type used to fill the marker.
* @param {number} nSeries - The index of the chart series.
* @param {number} nMarker - The index of the marker in the specified chart series.
* @param {boolean} [bAllMarkers=false] - Specifies if the fill will be applied to all markers in the specified chart series.
* @returns {boolean}
*/
ApiChart.prototype.SetMarkerFill = function(oFill, nSeries, nMarker, bAllMarkers) { return true; };

/**
* Sets the outline to the marker in the specified chart series.
* @memberof ApiChart
* @param {ApiStroke} oStroke - The stroke used to create the marker outline.
* @param {number} nSeries - The index of the chart series.
* @param {number} nMarker - The index of the marker in the specified chart series.
* @param {boolean} [bAllMarkers=false] - Specifies if the outline will be applied to all markers in the specified chart series.
* @returns {boolean}
*/
ApiChart.prototype.SetMarkerOutLine = function(oStroke, nSeries, nMarker, bAllMarkers) { return true; };

/**
* Sets the fill to the chart title.
* @memberof ApiChart
* @param {ApiFill} oFill - The fill type used to fill the title.
* @returns {boolean}
*/
ApiChart.prototype.SetTitleFill = function(oFill) { return true; };

/**
* Sets the outline to the chart title.
* @memberof ApiChart
* @param {ApiStroke} oStroke - The stroke used to create the title outline.
* @returns {boolean}
*/
ApiChart.prototype.SetTitleOutLine = function(oStroke) { return true; };

/**
* Sets the fill to the chart legend.
* @memberof ApiChart
* @param {ApiFill} oFill - The fill type used to fill the legend.
* @returns {boolean}
*/
ApiChart.prototype.SetLegendFill = function(oFill) { return true; };

/**
* Sets the outline to the chart legend.
* @memberof ApiChart
* @param {ApiStroke} oStroke - The stroke used to create the legend outline.
* @returns {boolean}
*/
ApiChart.prototype.SetLegendOutLine = function(oStroke) { return true; };

/**
* Sets the specified numeric format to the axis values.
* @memberof ApiChart
* @param {NumFormat | String} sFormat - Numeric format (can be custom format).
* @param {AxisPos} - Axis position in the chart.
* @returns {boolean}
*/
ApiChart.prototype.SetAxieNumFormat = function(sFormat, sAxiePos) { return true; };

/**
* Sets the specified numeric format to the chart series.
* @memberof ApiChart
* @param {NumFormat | String} sFormat - Numeric format (can be custom format).
* @param {Number} nSeria - Series index.
* @returns {boolean}
*/
ApiChart.prototype.SetSeriaNumFormat = function(sFormat, nSeria) { return true; };

/**
* Sets the specified numeric format to the chart data point.
* @memberof ApiChart
* @param {NumFormat | String} sFormat - Numeric format (can be custom format).
* @param {Number} nSeria - Series index.
* @param {number} nDataPoint - The index of the data point in the specified chart series.
* @param {boolean} bAllSeries - Specifies if the numeric format will be applied to the specified data point in all series.
* @returns {boolean}
*/
ApiChart.prototype.SetDataPointNumFormat = function(sFormat, nSeria, nDataPoint, bAllSeries) { return true; };

/**
* Returns all series from the chart space.
* @memberof ApiChart
* @returns {ApiChartSeries[]}
*/
ApiChart.prototype.GetAllSeries = function() { return []; };

/**
* Returns the series with a specific index.
* @memberof ApiChart
* @param {number} nIdx - Series index.
* @returns {?ApiChartSeries}
*/
ApiChart.prototype.GetSeries = function(nIdx) { return new ApiChartSeries(); };

/**
* Creates a copy of the specified chart.
* @memberof ApiChart
* @returns {ApiChart} - return null if drawing doesn't exist.
* @since 9.4.0
*/
ApiChart.prototype.Copy = function() { return new ApiChart(); };

/**
* Sets the position of the drawing on the slide.
* @memberof ApiDrawing
* @param {EMU} nPosX - The distance from the left side of the slide to the left side of the drawing measured in English measure units.
* @param {EMU} nPosY - The distance from the top side of the slide to the upper side of the drawing measured in English measure units.
*/
ApiChart.prototype.SetPosition = function(nPosX, nPosY) {};

/**
* Returns the drawing parent object.
* @memberof ApiDrawing
* @returns {ApiSlide | ApiLayout | ApiMaster | null}
*/
ApiChart.prototype.GetParent = function() { return new ApiSlide(); };

/**
* Returns the drawing parent slide.
* @memberof ApiDrawing
* @returns {ApiSlide | null} - return null if parent ins't a slide.
*/
ApiChart.prototype.GetParentSlide = function() { return new ApiSlide(); };

/**
* Returns the drawing parent slide layout.
* @memberof ApiDrawing
* @returns {ApiLayout | null} - return null if parent ins't a slide layout.
*/
ApiChart.prototype.GetParentLayout = function() { return new ApiLayout(); };

/**
* Returns the drawing parent slide master.
* @memberof ApiDrawing
* @returns {ApiMaster | null} - return null if parent ins't a slide master.
*/
ApiChart.prototype.GetParentMaster = function() { return new ApiMaster(); };

/**
* Sets the specified placeholder to the current drawing object.
* @memberof ApiDrawing
* @param {ApiPlaceholder} oPlaceholder - Placeholder object.
* @returns {boolean} - returns false if parameter isn't a placeholder.
*/
ApiChart.prototype.SetPlaceholder = function(oPlaceholder) { return true; };

/**
* Returns a placeholder from the current drawing object.
* @memberof ApiDrawing
* @returns {ApiPlaceholder | null} - returns null if placeholder doesn't exist.
*/
ApiChart.prototype.GetPlaceholder = function() { return new ApiPlaceholder(); };

/**
* Gets the x position of the drawing on the slide.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiChart.prototype.GetPosX = function() { return new EMU(); };

/**
* Gets the y position of the drawing on the slide.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiChart.prototype.GetPosY = function() { return new EMU(); };

/**
* Sets the x position of the drawing on the slide.
* @memberof ApiDrawing
* @param {EMU} posX - The distance from the left side of the slide to the left side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiChart.prototype.SetPosX = function(posX) { return true; };

/**
* Sets the y position of the drawing on the slide.
* @memberof ApiDrawing
* @param {EMU} posY - The distance from the top side of the slide to the upper side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiChart.prototype.SetPosY = function(posY) { return true; };

/**
* Replaces the placeholder by a drawing on the slide.
* @memberof ApiDrawing
* @param {Drawing} oDrawing
* @returns {boolean}
*/
ApiChart.prototype.ReplacePlaceholder = function(oDrawing) { return true; };

/**
* Returns an internal ID of the current drawing object.
* @memberof ApiDrawing
* @returns {string}
*/
ApiChart.prototype.GetInternalId = function() { return ""; };

/**
* Sets a hyperlink to the current drawing object (shape or image).
* Pass null to remove the hyperlink.
*
* @memberof ApiDrawing
*
* @param {ApiHyperlink | null} hyperlink - The hyperlink object to be set to the drawing, or null to remove the hyperlink.
*
* @returns {boolean} - Returns true if the hyperlink was set or removed successfully.
*/
ApiChart.prototype.SetHyperlink = function(hyperlink) { return true; };

/**
* Returns the hyperlink from the current drawing object (shape or image).
*
* @memberof ApiDrawing
*
* @returns {ApiHyperlink | null} - Returns the hyperlink object or null if no hyperlink is set.
*/
ApiChart.prototype.GetHyperlink = function() { return new ApiHyperlink(); };

/**
* Sets the size of the object (image, shape, chart) bounding box.
* @memberof ApiDrawing
* @param {EMU} nWidth - The object width measured in English measure units.
* @param {EMU} nHeight - The object height measured in English measure units.
*/
ApiChart.prototype.SetSize = function(nWidth, nHeight) {};

/**
* Deletes the specified drawing object from the parent.
* @memberof ApiDrawing
* @returns {boolean} - false if drawing doesn't exist or drawing hasn't a parent.
*/
ApiChart.prototype.Delete = function() { return true; };

/**
* Returns the width of the current drawing.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiChart.prototype.GetWidth = function() { return new EMU(); };

/**
* Returns the height of the current drawing.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiChart.prototype.GetHeight = function() { return new EMU(); };

/**
* Returns the name of the current drawing.
* @memberof ApiDrawing
* @returns {string}
* @since 9.3.0
*/
ApiChart.prototype.GetName = function() { return ""; };

/**
* Sets the name of the current drawing.
* If another drawing with the same name already exists, that drawing's name will be reset to a default auto-generated name.
* @memberof ApiDrawing
* @param {string} name - The name which will be set to the current drawing.
* @returns {boolean} - Returns true if the name was successfully set, otherwise returns false.
* @since 9.3.0
*/
ApiChart.prototype.SetName = function(name) { return true; };

/**
* Returns the lock value for the specified lock type of the current drawing.
* @memberof ApiDrawing
* @param {DrawingLockType} sType - Lock type in the string format.
* @returns {boolean}
*/
ApiChart.prototype.GetLockValue = function(sType) { return true; };

/**
* Sets the lock value to the specified lock type of the current drawing.
* @memberof ApiDrawing
* @param {DrawingLockType} sType - Lock type in the string format.
* @param {boolean} bValue - Specifies if the specified lock is applied to the current drawing.
* @returns {boolean}
*/
ApiChart.prototype.SetLockValue = function(sType, bValue) { return true; };

/**
* Converts the ApiDrawing object into the JSON object.
* @memberof ApiDrawing
* @returns {JSON}
*/
ApiChart.prototype.ToJSON = function() { return new JSON(); };

/**
* Selects the current graphic object.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} [isReplace=false] - Specifies whether the selection should replace the current selection (true) or be added to it (false).
* @returns {boolean}
*/
ApiChart.prototype.Select = function(isReplace) { return true; };

/**
* Removes the current graphic object from the selection.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean}
*/
ApiChart.prototype.Unselect = function() { return true; };

/**
* Sets the rotation angle to the current drawing object.
* @memberof ApiDrawing
* @param {number} nRotAngle - New drawing rotation angle.
* @returns {boolean}
* @since 9.0.0
*/
ApiChart.prototype.SetRotation = function(nRotAngle) { return true; };

/**
* Returns the rotation angle of the current drawing object.
* @memberof ApiDrawing
* @returns {number}
* @since 9.0.0
*/
ApiChart.prototype.GetRotation = function() { return 0; };

/**
* Get horizontal flip of current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean | null} Returns true if the figure is flipped horizontally, false if not, or null if the drawing properties are not available.
*/
ApiChart.prototype.GetFlipH = function() { return true; };

/**
* Get vertical flip of current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean | null} Returns true if the figure is flipped vertically, false if not, or null if the drawing properties are not available.
*/
ApiChart.prototype.GetFlipV = function() { return true; };

/**
* Sets the horizontal flip of the current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} bFlip - Specifies if the figure will be flipped horizontally or not.
* @returns {boolean} Returns true if the operation is successful, false otherwise.
*/
ApiChart.prototype.SetFlipH = function(bFlip) { return true; };

/**
* Sets the vertical flip of the current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} bFlip - Specifies if the figure will be flipped vertically or not.
* @returns {boolean} Returns true if the operation is successful, false otherwise.
*/
ApiChart.prototype.SetFlipV = function(bFlip) { return true; };

/**
* Sets the fill formatting properties to the current graphic object.
* @memberof ApiDrawing
* @param {ApiFill} oFill - The fill type used to fill the graphic object.
* @returns {boolean} - returns false if param is invalid.
* @since 9.3.0
*/
ApiChart.prototype.Fill = function(oFill) { return true; };

/**
* Sets the outline properties to the specified graphic object.
* @memberof ApiDrawing
* @param {ApiStroke} oStroke - The stroke used to create the graphic object outline.
* @returns {boolean} - returns false if param is invalid.
* @since 9.3.0
*/
ApiChart.prototype.SetOutLine = function(oStroke) { return true; };

/**
* Returns a type of the ApiChartSeries class.
* @memberof ApiChartSeries
* @returns {"chartSeries"}
*/
ApiChartSeries.prototype.GetClassType = function() { return ""; };

/**
* Tries to change the series type. Returns true if successful.
* @memberof ApiChartSeries
* @param {ChartType} sType - Chart type.
* @returns {boolean}
*/
ApiChartSeries.prototype.ChangeChartType = function(sType) { return true; };

/**
* Returns a chart type of the current series.
* @memberof ApiChartSeries
* @returns {ChartType}
*/
ApiChartSeries.prototype.GetChartType = function() { return new ChartType(); };

/**
* Returns a type of the ApiFill class.
* @memberof ApiFill
* @returns {"fill"}
*/
ApiFill.prototype.GetClassType = function() { return ""; };

/**
* Gets the fill type.
* @memberof ApiFill
* @returns {FillType} - returns "solid", "gradient", "pattern", "blip", "nofill" or null.
*/
ApiFill.prototype.GetType = function() { return new FillType(); };

/**
* Returns a type of the ApiStroke class.
* @memberof ApiStroke
* @returns {"stroke"}
*/
ApiStroke.prototype.GetClassType = function() { return ""; };

/**
* Gets the width of the stroke in English Metric Units.
* @memberof ApiStroke
* @returns {EMU | null}
*/
ApiStroke.prototype.GetWidth = function() { return new EMU(); };

/**
* Gets the fill (color) of the stroke.
* @memberof ApiStroke
* @returns {ApiFill | null}
*/
ApiStroke.prototype.GetFill = function() { return new ApiFill(); };

/**
* Gets the dash type of the stroke.
* @memberof ApiStroke
* @returns {DashType | null} - returns dash type ("solid", "dash", etc.) or null.
*/
ApiStroke.prototype.GetDashType = function() { return new DashType(); };

/**
* Returns a type of the ApiGradientStop class.
* @memberof ApiGradientStop
* @returns {"gradientStop"}
*/
ApiGradientStop.prototype.GetClassType = function() { return ""; };

/**
* Returns a type of the ApiUniColor class.
* @memberof ApiUniColor
* @returns {"uniColor"}
*/
ApiUniColor.prototype.GetClassType = function() { return ""; };

/**
* Returns a type of the ApiRGBColor class.
* @memberof ApiRGBColor
* @returns {"rgbColor"}
*/
ApiRGBColor.prototype.GetClassType = function() { return ""; };

/**
* Returns a type of the ApiSchemeColor class.
* @memberof ApiSchemeColor
* @returns {"schemeColor"}
*/
ApiSchemeColor.prototype.GetClassType = function() { return ""; };

/**
* Returns a type of the ApiPresetColor class.
* @memberof ApiPresetColor
* @returns {"presetColor"}
*/
ApiPresetColor.prototype.GetClassType = function() { return ""; };

/**
* Returns a type of the ApiColor class.
*
* @memberof ApiColor
* @since 9.1.0
* @returns {"color"}
*/
ApiColor.prototype.GetClassType = function() { return ""; };

/**
* Returns true if the color is a theme color.
*
* @memberof ApiColor
* @since 9.1.0
* @returns {boolean}
*/
ApiColor.prototype.IsThemeColor = function() { return true; };

/**
* Gets the RGB components of the color.
*
* @memberof ApiColor
* @since 9.1.0
* @returns {{r: byte, g: byte, b: byte}}
*/
ApiColor.prototype.GetRGB = function() { return new Object(); };

/**
* Gets the RGBA components of the color.
*
* @memberof ApiColor
* @since 9.1.0
* @returns {{r: byte, g: byte, b: byte, a: byte}}
*/
ApiColor.prototype.GetRGBA = function() { return new Object(); };

/**
* Gets the HEX string representation of the color.
*
* @memberof ApiColor
* @since 9.1.0
* @returns {string} A six-digit uppercase hex string, e.g. "FF00AA".
*/
ApiColor.prototype.GetHex = function() { return ""; };

/**
* Gets the theme color name if the color is a theme color.
*
* @memberof ApiColor
* @since 9.3.0
* @returns {SchemeColorId | null} The theme color name or null if not a theme color.
*/
ApiColor.prototype.GetThemeName = function() { return new SchemeColorId(); };

/**
* Converts the ApiColor object into the JSON object.
*
* @memberof ApiColor
* @since 9.3.0
* @returns {string} JSON string representation of the color.
*/
ApiColor.prototype.ToJSON = function() { return ""; };

/**
* Converts the JSON object into the ApiColor object.
*
* @memberof ApiColor
* @since 9.3.0
* @param {string} jsonObject - JSON representation of the color.
* @returns {ApiColor|null} - new ApiColor object if the conversion was successful, null otherwise.
*/
ApiColor.prototype.FromJSON = function(jsonObject) { return new ApiColor(); };

/**
* Returns a type of the ApiBullet class.
* @memberof ApiBullet
* @returns {"bullet"}
*/
ApiBullet.prototype.GetClassType = function() { return ""; };

/**
* Returns a type of the ApiComment class.
* @memberof ApiComment
* @returns {"comment"}
*/
ApiComment.prototype.GetClassType = function() { return ""; };

/**
* Returns the comment text.
* @memberof ApiComment
* @returns {string}
*/
ApiComment.prototype.GetText = function() { return ""; };

/**
* Sets the comment text.
* @memberof ApiComment
* @param {string} sText - The comment text.
* @returns {?ApiComment} - this
*/
ApiComment.prototype.SetText = function(sText) { return new ApiComment(); };

/**
* Returns the comment author's name.
* @memberof ApiComment
* @returns {string}
*/
ApiComment.prototype.GetAuthorName = function() { return ""; };

/**
* Sets the comment author's name.
* @memberof ApiComment
* @param {string} sAuthorName - The comment author's name.
* @returns {?ApiComment} - this
*/
ApiComment.prototype.SetAuthorName = function(sAuthorName) { return new ApiComment(); };

/**
* Returns the user ID of the comment author.
* @memberof ApiComment
* @returns {string}
*/
ApiComment.prototype.GetUserId = function() { return ""; };

/**
* Sets the user ID to the comment author.
* @memberof ApiComment
* @param {string} sUserId - The user ID of the comment author.
* @returns {ApiComment} - this
*/
ApiComment.prototype.SetUserId = function(sUserId) { return new ApiComment(); };

/**
* Checks if a comment is solved or not.
* @memberof ApiComment
* @returns {boolean}
*/
ApiComment.prototype.IsSolved = function() { return true; };

/**
* Marks a comment as solved.
* @memberof ApiComment
* @param {boolean} bSolved - Specifies if a comment is solved or not.
* @returns {ApiComment} - this
*/
ApiComment.prototype.SetSolved = function(bSolved) { return new ApiComment(); };

/**
* Returns the timestamp of the comment creation in UTC format.
* @memberof ApiComment
* @returns {Number}
*/
ApiComment.prototype.GetTimeUTC = function() { return 0; };

/**
* Sets the timestamp of the comment creation in UTC format.
* @memberof ApiComment
* @param {Number | String} nTimeStamp - The timestamp of the comment creation in UTC format.
* @returns {ApiComment} - this
*/
ApiComment.prototype.SetTimeUTC = function(nTimeStamp) { return new ApiComment(); };

/**
* Returns the timestamp of the comment creation in the current time zone format.
* @memberof ApiComment
* @returns {Number}
*/
ApiComment.prototype.GetTime = function() { return 0; };

/**
* Sets the timestamp of the comment creation in the current time zone format.
* @memberof ApiComment
* @param {Number | String} nTimeStamp - The timestamp of the comment creation in the current time zone format.
* @returns {ApiComment} - this
*/
ApiComment.prototype.SetTime = function(nTimeStamp) { return new ApiComment(); };

/**
* Returns the quote text of the current comment.
* @memberof ApiComment
* @returns {Number?}
*/
ApiComment.prototype.GetQuoteText = function() { return 0; };

/**
* Returns a number of the comment replies.
* @memberof ApiComment
* @returns {Number?}
*/
ApiComment.prototype.GetRepliesCount = function() { return 0; };

/**
* Adds a reply to a comment.
* @memberof ApiComment
* @param {String} sText - The comment reply text.
* @param {String} [sAuthorName] - The name of the comment reply author.
* @param {String} [sUserId] - The user ID of the comment reply author.
* @param {Number} [nPos=-1] - The comment reply position. If nPos=-1 add to the end.
* @returns {ApiComment?} - this
*/
ApiComment.prototype.AddReply = function(sText, sAuthorName, sUserId, nPos) { return new ApiComment(); };

/**
* Removes the specified comment replies.
* @memberof ApiComment
* @param {Number} [nPos = 0] - The position of the first comment reply to remove.
* @param {Number} [nCount = 1] - A number of comment replies to remove.
* @param {boolean} [bRemoveAll = false] - Specifies whether to remove all comment replies or not.
* @returns {ApiComment?} - this
*/
ApiComment.prototype.RemoveReplies = function(nPos, nCount, bRemoveAll) { return new ApiComment(); };

/**
* Deletes the current comment from the document.
* @memberof ApiComment
* @returns {boolean}
*/
ApiComment.prototype.Delete = function() { return true; };

/**
* Sets the position of the comment in the document.
* 
* @memberof ApiComment
* @param {number} x - The X coordinate of the comment position in EMU.
* @param {number} y - The Y coordinate of the comment position in EMU.
*/
ApiComment.prototype.SetPosition = function(x, y) {};

/**
* Returns the position of the comment in the document.
* 
* @memberof ApiComment
* @returns {Object} - An object with the coordinates (in EMU) of the comment position.
*/
ApiComment.prototype.GetPosition = function() { return new Object(); };

/**
* Returns a type of the ApiCommentReply class.
* @memberof ApiCommentReply
* @returns {"commentReply"}
*/
ApiCommentReply.prototype.GetClassType = function() { return ""; };

/**
* Returns the comment reply text.
* @memberof ApiCommentReply
* @returns {string}
*/
ApiCommentReply.prototype.GetText = function() { return ""; };

/**
* Sets the comment reply text.
* @memberof ApiCommentReply
* @param {string} sText - The comment reply text.
* @returns {?ApiCommentReply} - this
*/
ApiCommentReply.prototype.SetText = function(sText) { return new ApiCommentReply(); };

/**
* Returns the comment reply author's name.
* @memberof ApiCommentReply
* @returns {string}
*/
ApiCommentReply.prototype.GetAuthorName = function() { return ""; };

/**
* Sets the comment reply author's name.
* @memberof ApiCommentReply
* @param {string} sAuthorName - The comment reply author's name.
* @returns {?ApiCommentReply} - this
*/
ApiCommentReply.prototype.SetAuthorName = function(sAuthorName) { return new ApiCommentReply(); };

/**
* Sets the user ID to the comment reply author.
* @memberof ApiCommentReply
* @param {string} sUserId - The user ID of the comment reply author.
* @returns {ApiCommentReply} - this
*/
ApiCommentReply.prototype.SetUserId = function(sUserId) { return new ApiCommentReply(); };

/**
* Returns a type of the ApiCore class.
* @memberof ApiCore
* @returns {"core"}
* @since 9.0.0
*/
ApiCore.prototype.GetClassType = function() { return ""; };

/**
* Sets the document category.
* @memberof ApiCore
* @param {string} sCategory - The document category.
* @since 9.0.0
*/
ApiCore.prototype.SetCategory = function(sCategory) {};

/**
* Returns the document category.
* @memberof ApiCore
* @returns {string} - The document category.
* @since 9.0.0
*/
ApiCore.prototype.GetCategory = function() { return ""; };

/**
* Sets the document content status.
* @memberof ApiCore
* @param {string} sStatus - The document content status.
* @since 9.0.0
*/
ApiCore.prototype.SetContentStatus = function(sStatus) {};

/**
* Returns the document content status.
* @memberof ApiCore
* @returns {string} - The document content status.
* @since 9.0.0
*/
ApiCore.prototype.GetContentStatus = function() { return ""; };

/**
* Sets the document creation date.
* @memberof ApiCore
* @param {Date} oCreated - The document creation date.
* @since 9.0.0
*/
ApiCore.prototype.SetCreated = function(oCreated) {};

/**
* Returns the document creation date.
* @memberof ApiCore
* @returns {Date}- The document creation date.
* @since 9.0.0
*/
ApiCore.prototype.GetCreated = function() { return new Date(); };

/**
* Sets the document author.
* @memberof ApiCore
* @param {string} sCreator - The document author.
* @since 9.0.0
*/
ApiCore.prototype.SetCreator = function(sCreator) {};

/**
* Returns the document author.
* @memberof ApiCore
* @returns {string} - The document author.
* @since 9.0.0
*/
ApiCore.prototype.GetCreator = function() { return ""; };

/**
* Sets the document description.
* @memberof ApiCore
* @param {string} sDescription - The document description.
* @since 9.0.0
*/
ApiCore.prototype.SetDescription = function(sDescription) {};

/**
* Returns the document description.
* @memberof ApiCore
* @returns {string} - The document description.
* @since 9.0.0
*/
ApiCore.prototype.GetDescription = function() { return ""; };

/**
* Sets the document identifier.
* @memberof ApiCore
* @param {string} sIdentifier - The document identifier.
* @since 9.0.0
*/
ApiCore.prototype.SetIdentifier = function(sIdentifier) {};

/**
* Returns the document identifier.
* @memberof ApiCore
* @returns {string} - The document identifier.
* @since 9.0.0
*/
ApiCore.prototype.GetIdentifier = function() { return ""; };

/**
* Sets the document keywords.
* @memberof ApiCore
* @param {string} sKeywords - The document keywords in the string format.
* @since 9.0.0
*
*/
ApiCore.prototype.SetKeywords = function(sKeywords) {};

/**
* Returns the document keywords.
* @memberof ApiCore
* @returns {string} - The document keywords in the string format.
* @since 9.0.0
*/
ApiCore.prototype.GetKeywords = function() { return ""; };

/**
* Sets the document language.
* @memberof ApiCore
* @param {string} sLanguage - The document language.
* @since 9.0.0
*/
ApiCore.prototype.SetLanguage = function(sLanguage) {};

/**
* Returns the document language.
* @memberof ApiCore
* @returns {string} - The document language.
* @since 9.0.0
*/
ApiCore.prototype.GetLanguage = function() { return ""; };

/**
* Sets the name of the user who last modified the document.
* @memberof ApiCore
* @param {string} sLastModifiedBy - The name of the user who last modified the document.
* @since 9.0.0
*/
ApiCore.prototype.SetLastModifiedBy = function(sLastModifiedBy) {};

/**
* Returns the name of the user who last modified the document.
* @memberof ApiCore
* @returns {string} - The name of the user who last modified the document.
* @since 9.0.0
*/
ApiCore.prototype.GetLastModifiedBy = function() { return ""; };

/**
* Sets the date when the document was last printed.
* @memberof ApiCore
* @param {Date} oLastPrinted - The date when the document was last printed.
* @since 9.0.0
*/
ApiCore.prototype.SetLastPrinted = function(oLastPrinted) {};

/**
* Returns the date when the document was last printed.
* @memberof ApiCore
* @returns {Date} - The date when the document was last printed.
* @since 9.0.0
*/
ApiCore.prototype.GetLastPrinted = function() { return new Date(); };

/**
* Sets the date when the document was last modified.
* @memberof ApiCore
* @param {Date} oModified - The date when the document was last modified.
* @since 9.0.0
*/
ApiCore.prototype.SetModified = function(oModified) {};

/**
* Returns the date when the document was last modified.
* @memberof ApiCore
* @returns {Date} - The date when the document was last modified.
* @since 9.0.0
*/
ApiCore.prototype.GetModified = function() { return new Date(); };

/**
* Sets the document revision.
* @memberof ApiCore
* @param {string} sRevision - The document revision.
* @since 9.0.0
*/
ApiCore.prototype.SetRevision = function(sRevision) {};

/**
* Returns the document revision.
* @memberof ApiCore
* @returns {string} - The document revision.
* @since 9.0.0
*/
ApiCore.prototype.GetRevision = function() { return ""; };

/**
* Sets the document subject.
* @memberof ApiCore
* @param {string} sSubject - The document subject.
* @since 9.0.0
*/
ApiCore.prototype.SetSubject = function(sSubject) {};

/**
* Returns the document subject.
* @memberof ApiCore
* @returns {string} - The document subject.
* @since 9.0.0
*/
ApiCore.prototype.GetSubject = function() { return ""; };

/**
* Sets the document title.
* @memberof ApiCore
* @param {string} sTitle - The document title.
* @since 9.0.0
*/
ApiCore.prototype.SetTitle = function(sTitle) {};

/**
* Returns the document title.
* @memberof ApiCore
* @returns {string} - The document title.
* @since 9.0.0
*/
ApiCore.prototype.GetTitle = function() { return ""; };

/**
* Sets the document version.
* @memberof ApiCore
* @param {string} sVersion - The document version.
* @since 9.0.0
*/
ApiCore.prototype.SetVersion = function(sVersion) {};

/**
* Returns the document version.
* @memberof ApiCore
* @returns {string} - The document version.
* @since 9.0.0
*/
ApiCore.prototype.GetVersion = function() { return ""; };

/**
* Returns a type of the ApiCustomProperties class.
* @memberof ApiCustomProperties
* @returns {"customProperties"}
* @since 9.0.0
*/
ApiCustomProperties.prototype.GetClassType = function() { return ""; };

/**
* Adds a custom property to the document with automatic type detection.
* @memberof ApiCustomProperties
* @param {string} name - The custom property name.
* @param {string | number | boolean | Date} value - The custom property value.
* @returns {boolean} - Returns false if the type is unsupported.
* @since 9.0.0
*/
ApiCustomProperties.prototype.Add = function(name, value) { return true; };

/**
* Returns the value of a custom property by its name.
* @memberof ApiCustomProperties
* @param {string} name - The custom property name.
* @returns {string | number | Date | boolean | null} - The value of the custom property or null if the property does not exist.
* @since 9.0.0
*/
ApiCustomProperties.prototype.Get = function(name) { return ""; };

/**
* Returns a type of the ApiPresentation class.
* @memberof ApiPresentation
* @returns {"presentation"}
*/
ApiPresentation.prototype.GetClassType = function() { return ""; };

/**
* Returns the index for the current slide.
* @memberof ApiPresentation
* @returns {number}
*/
ApiPresentation.prototype.GetCurSlideIndex = function() { return 0; };

/**
* Returns a slide by its position in the presentation.
* @memberof ApiPresentation
* @param {number} nIndex - The slide number (position) in the presentation.
* @returns {?ApiSlide}
*/
ApiPresentation.prototype.GetSlideByIndex = function(nIndex) { return new ApiSlide(); };

/**
* Returns the current slide.
* @memberof ApiPresentation
* @returns {?ApiSlide}
*/
ApiPresentation.prototype.GetCurrentSlide = function() { return new ApiSlide(); };

/**
* Returns the current visible slide.
* @memberof ApiPresentation
* @returns {ApiSlide | null} - Returns null if the current slide is not found or not visible.
* @since 9.0.0
*/
ApiPresentation.prototype.GetCurrentVisibleSlide = function() { return new ApiSlide(); };

/**
* Appends a new slide to the end of the presentation.
* @memberof ApiPresentation
* @param {ApiSlide} oSlide - The slide created using the {@link Api#CreateSlide} method.
* @param {?number} nIndex - Index of the slide to be added. If not specified, the slide will be added to the end of the presentation.
*/
ApiPresentation.prototype.AddSlide = function(oSlide, nIndex) {};

/**
* Sets the size to the current presentation.
* @memberof ApiPresentation
* @param {EMU} nWidth - The presentation width in English measure units.
* @param {EMU} nHeight - The presentation height in English measure units.
*/
ApiPresentation.prototype.SetSizes = function(nWidth, nHeight) {};

/**
* Creates a new history point.
* @memberof ApiPresentation
*/
ApiPresentation.prototype.CreateNewHistoryPoint = function() {};

/**
* Replaces the current image with an image specified.
* @memberof ApiPresentation
* @param {string} sImageUrl - The image source where the image to be inserted should be taken from (currently, only internet URL or Base64 encoded images are supported).
* @param {EMU} Width - The image width in English measure units.
* @param {EMU} Height - The image height in English measure units.
*/
ApiPresentation.prototype.ReplaceCurrentImage = function(sImageUrl, Width, Height) {};

/**
* Specifies the languages which will be used to check spelling and grammar (if requested).
* @memberof ApiPresentation
* @param {string} sLangId - The possible value for this parameter is a language identifier as defined by
* RFC 4646/BCP 47. Example: "en-CA".
* @returns {boolean}
*/
ApiPresentation.prototype.SetLanguage = function(sLangId) { return true; };

/**
* Returns a number of slides.
* @memberof ApiPresentation
* @returns {number}
*/
ApiPresentation.prototype.GetSlidesCount = function() { return 0; };

/**
* Returns an array of all slides from the current presentation.
* @memberof ApiPresentation
* @returns {ApiSlide[]}
* @since 8.3.0
*/
ApiPresentation.prototype.GetAllSlides = function() { return []; };

/**
* Returns a number of slide masters.
* @memberof ApiPresentation
* @returns {number}
*/
ApiPresentation.prototype.GetMastersCount = function() { return 0; };

/**
* Returns an array of all slide masters from the current presentation.
* @memberof ApiPresentation
* @returns {ApiMaster[]}
* @since 8.3.0
*/
ApiPresentation.prototype.GetAllSlideMasters = function() { return []; };

/**
* Returns a slide master by its position in the presentation.
* @memberof ApiPresentation
* @param {number} nPos - Slide master position in the presentation
* @returns {ApiMaster | null} - returns null if position is invalid.
*/
ApiPresentation.prototype.GetMaster = function(nPos) { return new ApiMaster(); };

/**
* Adds the slide master to the presentation slide masters collection.
* @memberof ApiPresentation
* @param {number} [nPos    = ApiPresentation.GetMastersCount()]
* @param {ApiMaster} oApiMaster - The slide master to be added.
* @returns {boolean} - return false if position is invalid or oApiMaster doesn't exist.
*/
ApiPresentation.prototype.AddMaster = function(nPos, oApiMaster) { return true; };

/**
* Applies a theme to all the slides in the presentation.
* @memberof ApiPresentation
* @param {ApiTheme} oApiTheme - The presentation theme.
* @returns {boolean} - returns false if param isn't theme or presentation doesn't exist.
*/
ApiPresentation.prototype.ApplyTheme = function(oApiTheme) { return true; };

/**
* Removes a range of slides from the presentation.
* Deletes all the slides from the presentation if no parameters are specified.
* @memberof ApiPresentation
* @param {Number} [nStart=0] - The starting position for the deletion range.
* @param {Number} [nCount=ApiPresentation.GetSlidesCount()] - The number of slides to delete.
* @returns {boolean}
*/
ApiPresentation.prototype.RemoveSlides = function(nStart, nCount) { return true; };

/**
* Returns the presentation width in English measure units.
* @memberof ApiPresentation
* @returns {EMU}
*/
ApiPresentation.prototype.GetWidth = function() { return new EMU(); };

/**
* Returns the presentation height in English measure units.
* @memberof ApiPresentation
* @returns {EMU}
*/
ApiPresentation.prototype.GetHeight = function() { return new EMU(); };

/**
* Converts the ApiPresentation object into the JSON object.
* @memberof ApiPresentation
* @param {boolean} [bWriteTableStyles=false] - Specifies whether to write used table styles to the JSON object (true) or not (false).
* @returns {JSON}
*/
ApiPresentation.prototype.ToJSON = function(bWriteTableStyles) { return new JSON(); };

/**
* Converts the slides from the current ApiPresentation object into the JSON objects.
* @memberof ApiPresentation
* @param {boolean} [nStart=0] - The index to the start slide.
* @param {boolean} [nStart=ApiPresentation.GetSlidesCount() - 1] - The index to the end slide.
* @param {boolean} [bWriteLayout=false] - Specifies if the slide layout will be written to the JSON object or not.
* @param {boolean} [bWriteMaster=false] - Specifies if the slide master will be written to the JSON object or not (bWriteMaster is false if bWriteLayout === false).
* @param {boolean} [bWriteAllMasLayouts=false] - Specifies if all child layouts from the slide master will be written to the JSON object or not.
* @param {boolean} [bWriteTableStyles=false] - Specifies whether to write used table styles to the JSON object (true) or not (false).
* @returns {JSON[]}
*/
ApiPresentation.prototype.SlidesToJSON = function(nStart, nStart, bWriteLayout, bWriteMaster, bWriteAllMasLayouts, bWriteTableStyles) { return []; };

/**
* Returns all comments from the current presentation.
* @memberof ApiPresentation
* @returns {ApiComment[]}
*/
ApiPresentation.prototype.GetAllComments = function() { return []; };

/**
* Returns an array with all the OLE objects from the current presentation.
* @memberof ApiPresentation
* @returns {ApiOleObject[]}
* @since 9.0.0
*/
ApiPresentation.prototype.GetAllOleObjects = function() { return []; };

/**
* Returns an array with all tables from the current presentation (including slide masters and slide layouts).
*
* @memberof ApiPresentation
* @returns {ApiTable[]} An array with all tables from the current presentation.
* @since 9.1.0
*/
ApiPresentation.prototype.GetAllTables = function() { return []; };

/**
* Returns an array with all the chart objects from the current presentation.
* @memberof ApiPresentation
* @returns {ApiChart[]}
* @since 9.0.0
*/
ApiPresentation.prototype.GetAllCharts = function() { return []; };

/**
* Returns an array with all the shape objects from the current presentation.
* @memberof ApiPresentation
* @returns {ApiShape[]}
* @since 9.0.0
*/
ApiPresentation.prototype.GetAllShapes = function() { return []; };

/**
* Returns an array with all the image objects from the current presentation.
* @memberof ApiPresentation
* @returns {ApiImage[]}
* @since 9.0.0
*/
ApiPresentation.prototype.GetAllImages = function() { return []; };

/**
* Returns an array with all the drawing objects from the current presentation.
* @memberof ApiPresentation
* @returns {Drawing[]}
* @since 9.0.0
*/
ApiPresentation.prototype.GetAllDrawings = function() { return []; };

/**
* Returns a collection of drawing objects from the document content filtered by their names.
* @memberof ApiPresentation
* @since 9.3.0
* @param {string[]} ids - An array of drawing names to filter by.
* @return {Drawing[]}
*/
ApiPresentation.prototype.GetDrawingsByName = function(ids) { return []; };

/**
* Returns the document information:
* <b>Application</b> - the application the document has been created with.
* <b>CreatedRaw</b> - the date and time when the file was created.
* <b>Created</b> - the parsed date and time when the file was created.
* <b>LastModifiedRaw</b> - the date and time when the file was last modified.
* <b>LastModified</b> - the parsed date and time when the file was last modified.
* <b>LastModifiedBy</b> - the name of the user who has made the latest change to the document.
* <b>Authors</b> - the persons who has created the file.
* <b>Title</b> - this property allows you to simplify your documents classification.
* <b>Tags</b> - this property allows you to simplify your documents classification.
* <b>Subject</b> - this property allows you to simplify your documents classification.
* <b>Comment</b> - this property allows you to simplify your documents classification.
* @memberof ApiPresentation
* @returns {object}
*/
ApiPresentation.prototype.GetDocumentInfo = function() { return new object(); };

/**
* Returns the core properties interface for the current presentation.
* This method is used to view or modify standard metadata such as title, author, and keywords.
* @memberof ApiPresentation
* @returns {ApiCore}
* @since 9.0.0
*/
ApiPresentation.prototype.GetCore = function() { return new ApiCore(); };

/**
* Returns the custom properties from the current presentation.
* @memberof ApiPresentation
* @returns {ApiCustomProperties}
* @since 9.0.0
*/
ApiPresentation.prototype.GetCustomProperties = function() { return new ApiCustomProperties(); };

/**
* Adds a math equation to the current presentation.
* @memberof ApiPresentation
* @param {string} sText - The math equation text.
* @param {string} sFormat - The math equation format. Possible values are "unicode", "latex", and "mathml".
* @returns {boolean}
* @since 9.0.0
*/
ApiPresentation.prototype.AddMathEquation = function(sText, sFormat) { return true; };

/**
* Retrieves the custom XML manager associated with the presentation.
* This manager allows manipulation and access to custom XML parts within the presentation.
* @memberof ApiPresentation
* @since 9.1.0
* @returns {ApiCustomXmlParts|null} Returns an instance of ApiCustomXmlParts if the custom XML manager exists, otherwise returns null.
*/
ApiPresentation.prototype.GetCustomXmlParts = function() { return new ApiCustomXmlParts(); };

/**
* Returns whether the presentation loops continuously until the user stops it.
*
* @memberof ApiPresentation
* @since 9.3.0
*
* @returns {boolean} - True if the presentation is set to loop until stopped; otherwise, false.
*/
ApiPresentation.prototype.GetLoopUntilStopped = function() { return true; };

/**
* Sets whether the presentation loops continuously until the user stops it.
*
* @memberof ApiPresentation
* @since 9.3.0
*
* @param {boolean} loopUntilStopped - True to set the presentation to loop until stopped; false otherwise.
* @returns {boolean} - True if the new setting was applied successfully; otherwise, false.
*/
ApiPresentation.prototype.SetLoopUntilStopped = function(loopUntilStopped) { return true; };

/**
* Returns a number of slides.
* @memberof ApiPresentation
* @returns {number}
* @since 9.4.0
*/
ApiPresentation.prototype.GetSlideCount = function() { return 0; };

/**
* Removes a slide at the specified position from the presentation.
* @memberof ApiPresentation
* @param {number} nIndex - The zero-based slide index.
* @returns {boolean}
* @since 9.4.0
*/
ApiPresentation.prototype.RemoveSlide = function(nIndex) { return true; };

/**
* Returns the type of the ApiMaster class.
* @memberof ApiMaster
* @returns {"master"}
*/
ApiMaster.prototype.GetClassType = function() { return ""; };

/**
* Returns all layouts from the slide master.
* @memberof ApiMaster
* @returns {ApiLayout[]} - Returns an empty array if the slide master doesn't have layouts.
* @since 9.0.0
*/
ApiMaster.prototype.GetAllLayouts = function() { return []; };

/**
* Returns a layout of the specified slide master by its position.
* @memberof ApiMaster
* @param {number} nPos - Layout position.
* @returns {ApiLayout | null} - returns null if position is invalid.
*/
ApiMaster.prototype.GetLayout = function(nPos) { return new ApiLayout(); };

/**
* Returns the layout corresponding to the specified layout type of the slide master.
* @memberof ApiMaster
* @param {LayoutType} sType - The layout type.
* @returns {ApiLayout | null} - The layout at the specified position, or null if the position is invalid.
*/
ApiMaster.prototype.GetLayoutByType = function(sType) { return new ApiLayout(); };

/**
* Adds a layout to the specified slide master.
* @memberof ApiMaster
* @param {number} [nPos = ApiMaster.GetLayoutsCount()] - Position where a layout will be added.
* @param {ApiLayout} oLayout - A layout to be added.
* @returns {boolean} - returns false if oLayout isn't a layout.
*/
ApiMaster.prototype.AddLayout = function(nPos, oLayout) { return true; };

/**
* Removes the layouts from the current slide master.
* @memberof ApiMaster
* @param {number} nPos - Position from which a layout will be deleted.
* @param {number} [nCount = 1] - Number of layouts to delete.
* @returns {boolean} - return false if position is invalid.
*/
ApiMaster.prototype.RemoveLayout = function(nPos, nCount) { return true; };

/**
* Returns a number of layout objects.
* @memberof ApiMaster
* @returns {number}
*/
ApiMaster.prototype.GetLayoutsCount = function() { return 0; };

/**
* Adds an object (image, shape or chart) to the current slide master.
* @memberof ApiMaster
* @param {ApiDrawing} oDrawing - The object which will be added to the current slide master.
* @returns {boolean} - returns false if slide master doesn't exist.
*/
ApiMaster.prototype.AddObject = function(oDrawing) { return true; };

/**
* Removes objects (image, shape or chart) from the current slide master.
* @memberof ApiMaster
* @param {number} nPos - Position from which the object will be deleted.
* @param {number} [nCount = 1] - Number of objects to delete.
* @returns {boolean} - returns false if master doesn't exist or position is invalid or master hasn't objects.
*/
ApiMaster.prototype.RemoveObject = function(nPos, nCount) { return true; };

/**
* Sets the background to the current slide master.
* @memberof ApiMaster
* @memberOf ApiMaster
* @param {ApiFill} oApiFill - The color or pattern used to fill the presentation slide master background.
* @returns {boolean}
*/
ApiMaster.prototype.SetBackground = function(oApiFill) { return true; };

/**
* Clears the slide master background.
* @memberof ApiMaster
* @returns {boolean} - return false if slide master doesn't exist.
*/
ApiMaster.prototype.ClearBackground = function() { return true; };

/**
* Creates a copy of the specified slide master object.
* @memberof ApiMaster
* @returns {ApiMaster | null} - returns new ApiMaster object that represents the copy of slide master. 
* Returns null if slide doesn't exist.
*/
ApiMaster.prototype.Copy = function() { return new ApiMaster(); };

/**
* Creates a duplicate of the specified slide master object, adds the new slide master to the slide masters collection.
* @memberof ApiMaster
* @param {number} [nPos    = ApiPresentation.GetMastersCount()] - Position where the new slide master will be added.
* @returns {ApiMaster | null} - returns new ApiMaster object that represents the copy of slide master. 
* Returns null if slide master doesn't exist or is not in the presentation.
*/
ApiMaster.prototype.Duplicate = function(nPos) { return new ApiMaster(); };

/**
* Deletes the specified object from the parent if it exists.
* Note: Master can't be deleted if it's the last one in the presentation.
*
* @memberof ApiMaster
* @returns {boolean} - return false if master doesn't exist or is not in the presentation or couldn't be deleted (e.g. the last master).
*
*/
ApiMaster.prototype.Delete = function() { return true; };

/**
* Returns a theme of the slide master.
* @memberof ApiMaster
* @returns {ApiTheme | null} - returns null if theme doesn't exist.
*/
ApiMaster.prototype.GetTheme = function() { return new ApiTheme(); };

/**
* Sets a theme to the slide master.
* Sets a copy of the theme object.
* @memberof ApiMaster
* @param {ApiTheme} oTheme - Presentation theme.
* @returns {boolean} - return false if oTheme isn't a theme or slide master doesn't exist.
*/
ApiMaster.prototype.SetTheme = function(oTheme) { return true; };

/**
* Returns an array with all the drawing objects from the slide master.
* @memberof ApiMaster
* @returns {Drawing[]}
*/
ApiMaster.prototype.GetAllDrawings = function() { return []; };

/**
* Returns an array with all the shape objects from the slide master.
* @memberof ApiMaster
* @returns {ApiShape[]}
*/
ApiMaster.prototype.GetAllShapes = function() { return []; };

/**
* Returns an array with all the image objects from the slide master.
* @memberof ApiMaster
* @returns {ApiImage[]}
*/
ApiMaster.prototype.GetAllImages = function() { return []; };

/**
* Returns an array with all the chart objects from the slide master.
* @memberof ApiMaster
* @returns {ApiChart[]}
*/
ApiMaster.prototype.GetAllCharts = function() { return []; };

/**
* Returns an array with all the OLE objects from the slide master.
* @memberof ApiMaster
* @returns {ApiOleObject[]}
*/
ApiMaster.prototype.GetAllOleObjects = function() { return []; };

/**
* Returns an array with all tables from the slide master.
*
* @memberof ApiMaster
* @returns {ApiTable[]} An array with all tables from the slide master.
* @since 9.1.0
*/
ApiMaster.prototype.GetAllTables = function() { return []; };

/**
* Converts the ApiMaster object into the JSON object.
* @memberof ApiMaster
* @param {boolean} [bWriteTableStyles=false] - Specifies whether to write used table styles to the JSON object (true) or not (false).
* @returns {JSON}
*/
ApiMaster.prototype.ToJSON = function(bWriteTableStyles) { return new JSON(); };

/**
* Returns an array of drawings by the specified placeholder type.
* @memberof ApiMaster
* @param {PlaceholderType} sType - The placeholder type.
* @returns {Drawing[]}
* @since 8.2.0
*/
ApiMaster.prototype.GetDrawingsByPlaceholderType = function(sType) { return []; };

/**
* Groups an array of drawings in the current slide master.
* @memberof ApiMaster
* @param {DrawingForGroup[]} aDrawings - An array of drawings to group.
* @returns {ApiGroup}
* @since 8.3.0
*/
ApiMaster.prototype.GroupDrawings = function(aDrawings) { return new ApiGroup(); };

/**
* Returns the type of the ApiLayout class.
* @memberof ApiLayout
* @returns {"layout"}
*/
ApiLayout.prototype.GetClassType = function() { return ""; };

/**
* Sets a name to the current layout.
* @memberof ApiLayout
* @param {string} sName - Layout name to be set.
* @returns {boolean}
*/
ApiLayout.prototype.SetName = function(sName) { return true; };

/**
* Returns the type of the current layout.
* @memberof ApiLayout
* @returns {LayoutType} The layout type.
*/
ApiLayout.prototype.GetLayoutType = function() { return new LayoutType(); };

/**
* Returns a name of the current layout.
* @memberof ApiLayout
* @returns {string}
* @since 8.3.0
*/
ApiLayout.prototype.GetName = function() { return ""; };

/**
* Adds an object (image, shape or chart) to the current slide layout.
* @memberof ApiLayout
* @param {ApiDrawing} oDrawing - The object which will be added to the current slide layout.
* @returns {boolean} - returns false if slide layout doesn't exist.
*/
ApiLayout.prototype.AddObject = function(oDrawing) { return true; };

/**
* Removes objects (image, shape or chart) from the current slide layout.
* @memberof ApiLayout
* @param {number} nPos - Position from which the object will be deleted.
* @param {number} [nCount = 1] - The number of elements to delete.
* @returns {boolean} - returns false if layout doesn't exist or position is invalid or layout hasn't objects.
*/
ApiLayout.prototype.RemoveObject = function(nPos, nCount) { return true; };

/**
* Sets the background to the current slide layout.
* @memberof ApiLayout
* @memberOf ApiLayout
* @param {ApiFill} oApiFill - The color or pattern used to fill the presentation slide layout background.\
* @returns {boolean}
*/
ApiLayout.prototype.SetBackground = function(oApiFill) { return true; };

/**
* Clears the slide layout background.
* @memberof ApiLayout
* @returns {boolean} - return false if slide layout doesn't exist.
*/
ApiLayout.prototype.ClearBackground = function() { return true; };

/**
* Sets the master background as the background of the layout.
* @memberof ApiLayout
* @returns {boolean} - returns false if master is null or master hasn't background.
*/
ApiLayout.prototype.FollowMasterBackground = function() { return true; };

/**
* Creates a copy of the specified slide layout object.
* Copies without master slide.
* @memberof ApiLayout
* @returns {ApiLayout | null} - returns new ApiLayout object that represents the copy of slide layout. 
* Returns null if slide layout doesn't exist.
*/
ApiLayout.prototype.Copy = function() { return new ApiLayout(); };

/**
* Deletes the specified object from the parent slide master if it exists.
* @memberof ApiLayout
* @returns {boolean} - return false if parent slide master doesn't exist.
*/
ApiLayout.prototype.Delete = function() { return true; };

/**
* Creates a duplicate of the specified slide layout object, adds the new slide layout to the slide layout collection.
* @memberof ApiLayout
* @param {number} [nPos = ApiMaster.GetLayoutsCount()] - Position where the new slide layout will be added.
* @returns {ApiLayout | null} - returns new ApiLayout object that represents the copy of slide layout. 
* Returns null if slide layout doesn't exist or is not in the slide master.
*/
ApiLayout.prototype.Duplicate = function(nPos) { return new ApiLayout(); };

/**
* Moves the specified layout to a specific location within the same collection.
* @memberof ApiLayout
* @param {number} nPos - Position where the specified slide layout will be moved to.
* @returns {boolean} - returns false if layout or parent slide master doesn't exist or position is invalid.
*/
ApiLayout.prototype.MoveTo = function(nPos) { return true; };

/**
* Returns an array with all the drawing objects from the slide layout.
* @memberof ApiLayout
* @returns {Drawing[]}
*/
ApiLayout.prototype.GetAllDrawings = function() { return []; };

/**
* Returns an array with all the shape objects from the slide layout.
* @memberof ApiLayout
* @returns {ApiShape[]}
*/
ApiLayout.prototype.GetAllShapes = function() { return []; };

/**
* Returns an array with all the image objects from the slide layout.
* @memberof ApiLayout
* @returns {ApiImage[]}
*/
ApiLayout.prototype.GetAllImages = function() { return []; };

/**
* Returns an array with all the chart objects from the slide layout.
* @memberof ApiLayout
* @returns {ApiChart[]}
*/
ApiLayout.prototype.GetAllCharts = function() { return []; };

/**
* Returns an array with all the OLE objects from the slide layout.
* @memberof ApiLayout
* @returns {ApiOleObject[]}
*/
ApiLayout.prototype.GetAllOleObjects = function() { return []; };

/**
* Returns an array with all tables from the current slide layout.
*
* @memberof ApiLayout
* @returns {ApiTable[]} An array with all tables from the current slide layout.
* @sine 9.1.0
*/
ApiLayout.prototype.GetAllTables = function() { return []; };

/**
* Returns the parent slide master of the current layout.
* @memberof ApiLayout
* @returns {?ApiMaster} - returns null if parent slide master doesn't exist.
*/
ApiLayout.prototype.GetMaster = function() { return new ApiMaster(); };

/**
* Converts the ApiLayout object into the JSON object.
* @memberof ApiLayout
* @param {boolean} [bWriteMaster=false] - Specifies if the slide master will be written to the JSON object or not.
* @param {boolean} [bWriteTableStyles=false] - Specifies whether to write used table styles to the JSON object (true) or not (false).
* @returns {JSON}
*/
ApiLayout.prototype.ToJSON = function(bWriteMaster, bWriteTableStyles) { return new JSON(); };

/**
* Returns an array of drawings by the specified placeholder type.
* @memberof ApiLayout
* @param {PlaceholderType} sType - The placeholder type.
* @returns {Drawing[]}
* @since 8.2.0
*/
ApiLayout.prototype.GetDrawingsByPlaceholderType = function(sType) { return []; };

/**
* Groups an array of drawings in the current layout.
* @memberof ApiLayout
* @param {DrawingForGroup[]} aDrawings - An array of drawings to group.
* @returns {ApiGroup}
* @since 8.3.0
*/
ApiLayout.prototype.GroupDrawings = function(aDrawings) { return new ApiGroup(); };

/**
* Returns the type of the ApiPlaceholder class.
* @memberof ApiPlaceholder
* @returns {"placeholder"}
*/
ApiPlaceholder.prototype.GetClassType = function() { return ""; };

/**
* Sets the placeholder type.
* @memberof ApiPlaceholder
* @param {PlaceholderType} sType - Placeholder type
* @returns {boolean} - returns false if placeholder type doesn't exist.
*/
ApiPlaceholder.prototype.SetType = function(sType) { return true; };

/**
* Returns the placeholder type.
* @memberof ApiPlaceholder
* @returns {PlaceholderType} - Returns the placeholder type.
* @since 8.2.0
*/
ApiPlaceholder.prototype.GetType = function() { return new PlaceholderType(); };

/**
* Sets the placeholder index.
* @memberof ApiPlaceholder
* @param {number} nIdx - The placeholder index.
* @returns {boolean} - Returns false if the placeholder index wasn't set.
* @since 8.2.0
*/
ApiPlaceholder.prototype.SetIndex = function(nIdx) { return true; };

/**
* Retuns the placeholder index.
* @memberof ApiPlaceholder
* @returns {number | undefined} - Returns the placeholder index.
* @since 8.2.0
*/
ApiPlaceholder.prototype.GetIndex = function() { return 0; };

/**
* Returns the type of the ApiTheme class.
* @memberof ApiTheme
* @returns {"theme"}
*/
ApiTheme.prototype.GetClassType = function() { return ""; };

/**
* Returns the slide master of the current theme.
* @memberof ApiTheme
* @returns {ApiMaster | null} - returns null if slide master doesn't exist.
*/
ApiTheme.prototype.GetMaster = function() { return new ApiMaster(); };

/**
* Sets the color scheme to the current presentation theme.
* @memberof ApiTheme
* @param {ApiThemeColorScheme} oApiColorScheme - Theme color scheme.
* @returns {boolean} - return false if color scheme doesn't exist.
*/
ApiTheme.prototype.SetColorScheme = function(oApiColorScheme) { return true; };

/**
* Returns the color scheme of the current theme.
* @memberof ApiTheme
* @returns {?ApiThemeColorScheme}
*/
ApiTheme.prototype.GetColorScheme = function() { return new ApiThemeColorScheme(); };

/**
* Sets the format scheme to the current presentation theme.
* @memberof ApiTheme
* @param {ApiThemeFormatScheme} oApiFormatScheme - Theme format scheme.
* @returns {boolean} - return false if format scheme doesn't exist.
*/
ApiTheme.prototype.SetFormatScheme = function(oApiFormatScheme) { return true; };

/**
* Returns the format scheme of the current theme.
* @memberof ApiTheme
* @returns {?ApiThemeFormatScheme}
*/
ApiTheme.prototype.GetFormatScheme = function() { return new ApiThemeFormatScheme(); };

/**
* Sets the font scheme to the current presentation theme.
* @memberof ApiTheme
* @param {ApiThemeFontScheme} oApiFontScheme - Theme font scheme.
* @returns {boolean} - return false if font scheme doesn't exist.
*/
ApiTheme.prototype.SetFontScheme = function(oApiFontScheme) { return true; };

/**
* Returns the font scheme of the current theme.
* @memberof ApiTheme
* @returns {?ApiThemeFontScheme}
*/
ApiTheme.prototype.GetFontScheme = function() { return new ApiThemeFontScheme(); };

/**
* Returns the type of the ApiThemeColorScheme class.
* @memberof ApiThemeColorScheme
* @returns {"themeColorScheme"}
*/
ApiThemeColorScheme.prototype.GetClassType = function() { return ""; };

/**
* Sets a name to the current theme color scheme.
* @memberof ApiThemeColorScheme
* @param {string} sName - Theme color scheme name.
* @returns {boolean}
*/
ApiThemeColorScheme.prototype.SetSchemeName = function(sName) { return true; };

/**
* Changes a color in the theme color scheme.
* @memberof ApiThemeColorScheme
* @param {number} nPos - Color position in the color scheme which will be changed.
* @param {ApiUniColor | ApiRGBColor} oColor - New color of the theme color scheme.
* @returns {boolean}
*/
ApiThemeColorScheme.prototype.ChangeColor = function(nPos, oColor) { return true; };

/**
* Creates a copy of the current theme color scheme.
* @memberof ApiThemeColorScheme
* @returns {ApiThemeColorScheme}
*/
ApiThemeColorScheme.prototype.Copy = function() { return new ApiThemeColorScheme(); };

/**
* Converts the ApiThemeColorScheme object into the JSON object.
* @memberof ApiThemeColorScheme
* @returns {JSON}
*/
ApiThemeColorScheme.prototype.ToJSON = function() { return new JSON(); };

/**
* Returns the type of the ApiThemeFormatScheme class.
* @memberof ApiThemeFormatScheme
* @returns {"themeFormatScheme"}
*/
ApiThemeFormatScheme.prototype.GetClassType = function() { return ""; };

/**
* Sets a name to the current theme format scheme.
* @memberof ApiThemeFormatScheme
* @param {string} sName - Theme format scheme name.
* @returns {boolean}
*/
ApiThemeFormatScheme.prototype.SetSchemeName = function(sName) { return true; };

/**
* Sets the fill styles to the current theme format scheme.
* @memberof ApiThemeFormatScheme
* @param {ApiFill[]} arrFill - The array of fill styles must contain 3 elements - subtle, moderate and intense fills.
* If an array is empty or NoFill elements are in the array, it will be filled with the Api.CreateNoFill() elements.
*/
ApiThemeFormatScheme.prototype.ChangeFillStyles = function(arrFill) {};

/**
* Sets the background fill styles to the current theme format scheme.
* @memberof ApiThemeFormatScheme
* @param {ApiFill[]} arrBgFill - The array of background fill styles must contain 3 elements - subtle, moderate and intense fills.
* If an array is empty or NoFill elements are in the array, it will be filled with the Api.CreateNoFill() elements.
*/
ApiThemeFormatScheme.prototype.ChangeBgFillStyles = function(arrBgFill) {};

/**
* Sets the line styles to the current theme format scheme.
* @memberof ApiThemeFormatScheme
* @param {ApiStroke[]} arrLine - The array of line styles must contain 3 elements - subtle, moderate and intense fills.
* If an array is empty or ApiStroke elements are with no fill, it will be filled with the Api.CreateStroke(0, Api.CreateNoFill()) elements.
*/
ApiThemeFormatScheme.prototype.ChangeLineStyles = function(arrLine) {};

/**
* Creates a copy of the current theme format scheme.
* @memberof ApiThemeFormatScheme
* @returns {ApiThemeFormatScheme}
*/
ApiThemeFormatScheme.prototype.Copy = function() { return new ApiThemeFormatScheme(); };

/**
* Converts the ApiThemeFormatScheme object into the JSON object.
* @memberof ApiThemeFormatScheme
* @returns {JSON}
*/
ApiThemeFormatScheme.prototype.ToJSON = function() { return new JSON(); };

/**
* Returns the type of the ApiThemeFontScheme class.
* @memberof ApiThemeFontScheme
* @returns {"themeFontScheme"}
*/
ApiThemeFontScheme.prototype.GetClassType = function() { return ""; };

/**
* Sets a name to the current theme font scheme.
* @memberof ApiThemeFontScheme
* @param {string} sName - Theme font scheme name.
* @returns {boolean} - returns false if font scheme doesn't exist.
*/
ApiThemeFontScheme.prototype.SetSchemeName = function(sName) { return true; };

/**
* Sets the fonts to the current theme font scheme.
* @memberof ApiThemeFontScheme
* @param {string} mjLatin - The major theme font applied to the latin text.
* @param {string} mjEa - The major theme font applied to the east asian text.
* @param {string} mjCs - The major theme font applied to the complex script text.
* @param {string} mnLatin - The minor theme font applied to the latin text.
* @param {string} mnEa - The minor theme font applied to the east asian text.
* @param {string} mnCs - The minor theme font applied to the complex script text.
*/
ApiThemeFontScheme.prototype.SetFonts = function(mjLatin, mjEa, mjCs, mnLatin, mnEa, mnCs) {};

/**
* Creates a copy of the current theme font scheme.
* @memberof ApiThemeFontScheme
* @returns {ApiThemeFontScheme}
*/
ApiThemeFontScheme.prototype.Copy = function() { return new ApiThemeFontScheme(); };

/**
* Converts the ApiThemeFontScheme object into the JSON object.
* @memberof ApiThemeFontScheme
* @returns {JSON}
*/
ApiThemeFontScheme.prototype.ToJSON = function() { return new JSON(); };

/**
* Returns the type of the ApiSlide class.
* @memberof ApiSlide
* @returns {"slide"}
*/
ApiSlide.prototype.GetClassType = function() { return ""; };

/**
* Removes all the objects from the current slide.
* @memberof ApiSlide
*/
ApiSlide.prototype.RemoveAllObjects = function() {};

/**
* Adds an object (image, shape or chart) to the current presentation slide.
* @memberof ApiSlide
* @param {ApiDrawing} oDrawing - The object which will be added to the current presentation slide.
* @returns {boolean} - returns false if slide doesn't exist.
*/
ApiSlide.prototype.AddObject = function(oDrawing) { return true; };

/**
* Adds a comment to the current slide.
*
* @memberof ApiSlide
* @param {number} posX - The X position (in EMU) of the comment (defaults to 0).
* @param {number} posY - The Y position (in EMU) of the comment (defaults to 0).
* @param {string} text - The comment text.
* @param {string} [author] - The author's name (defaults to the current user name).
* @param {string} [userId] - The user ID of the comment author (defaults to the current user ID).
* @returns {boolean}
*/
ApiSlide.prototype.AddComment = function(posX, posY, text, author, userId) { return true; };

/**
* Removes objects (image, shape or chart) from the current slide.
* @memberof ApiSlide
* @param {number} nPos - Position from which the object will be deleted.
* @param {number} [nCount = 1] - The number of elements to delete.
* @returns {boolean} - returns false if slide doesn't exist or position is invalid or slide hasn't objects.
*/
ApiSlide.prototype.RemoveObject = function(nPos, nCount) { return true; };

/**
* Sets the background to the current presentation slide.
* @memberof ApiSlide
* @memberOf ApiSlide
* @param {ApiFill} oApiFill - The color or pattern used to fill the presentation slide background.
* @returns {boolean}
*/
ApiSlide.prototype.SetBackground = function(oApiFill) { return true; };

/**
* Returns the visibility of the current presentation slide.
* @memberof ApiSlide
* @memberOf ApiSlide
* @returns {boolean}
*/
ApiSlide.prototype.GetVisible = function() { return true; };

/**
* Sets the visibility to the current presentation slide.
* @memberof ApiSlide
* @memberOf ApiSlide
* @param {boolean} value - Slide visibility.
* @returns {boolean}
*/
ApiSlide.prototype.SetVisible = function(value) { return true; };

/**
* Returns the slide width in English measure units.
* @memberof ApiSlide
* @returns {EMU}
*/
ApiSlide.prototype.GetWidth = function() { return new EMU(); };

/**
* Returns the slide height in English measure units.
* @memberof ApiSlide
* @returns {EMU}
*/
ApiSlide.prototype.GetHeight = function() { return new EMU(); };

/**
* Applies the specified layout to the current slide.
* The layout must be in slide master.
* @memberof ApiSlide
* @param {ApiLayout} oLayout - Layout to be applied.
* @returns {boolean} - returns false if slide doesn't exist.
*/
ApiSlide.prototype.ApplyLayout = function(oLayout) { return true; };

/**
* Deletes the current slide from the presentation.
* @memberof ApiSlide
* @returns {boolean} - returns false if slide doesn't exist or is not in the presentation.
*/
ApiSlide.prototype.Delete = function() { return true; };

/**
* Creates a copy of the current slide object.
* @memberof ApiSlide
* @returns {ApiSlide | null} - returns new ApiSlide object that represents the duplicate slide. 
* Returns null if slide doesn't exist.
*/
ApiSlide.prototype.Copy = function() { return new ApiSlide(); };

/**
* Creates a duplicate of the specified slide object, adds the new slide to the slides collection.
* @memberof ApiSlide
* @param {number} [nPos    = ApiPresentation.GetSlidesCount()] - Position where the new slide will be added.
* @returns {ApiSlide | null} - returns new ApiSlide object that represents the duplicate slide. 
* Returns null if slide doesn't exist or is not in the presentation.
*/
ApiSlide.prototype.Duplicate = function(nPos) { return new ApiSlide(); };

/**
* Moves the current slide to a specific location within the same collection.
* @memberof ApiSlide
* @param {number} nPos - Position where the current slide will be moved to.
* @returns {boolean} - returns false if slide doesn't exist or position is invalid or slide is not in the presentation.
*/
ApiSlide.prototype.MoveTo = function(nPos) { return true; };

/**
* Returns a position of the current slide in the presentation.
* @memberof ApiSlide
* @returns {number} - returns -1 if slide doesn't exist or is not in the presentation.
*/
ApiSlide.prototype.GetSlideIndex = function() { return 0; };

/**
* Clears the slide background.
* @memberof ApiSlide
* @returns {boolean} - return false if slide doesn't exist.
*/
ApiSlide.prototype.ClearBackground = function() { return true; };

/**
* Sets the layout background as the background of the slide.
* @memberof ApiSlide
* @returns {boolean} - returns false if layout is null or layout hasn't background or slide doesn't exist.
*/
ApiSlide.prototype.FollowLayoutBackground = function() { return true; };

/**
* Sets the master background as the background of the slide.
* @memberof ApiSlide
* @returns {boolean} - returns false if master is null or master hasn't background or slide doesn't exist.
*/
ApiSlide.prototype.FollowMasterBackground = function() { return true; };

/**
* Applies the specified theme to the current slide.
* @memberof ApiSlide
* @param {ApiTheme} oApiTheme - Presentation theme.
* @returns {boolean} - returns false if master is null or master hasn't background.
*/
ApiSlide.prototype.ApplyTheme = function(oApiTheme) { return true; };

/**
* Returns a layout of the current slide.
* @memberof ApiSlide
* @returns {ApiLayout | null} - returns null if slide or layout doesn't exist. 
*/
ApiSlide.prototype.GetLayout = function() { return new ApiLayout(); };

/**
* Returns a theme of the current slide.
* @memberof ApiSlide
* @returns {ApiTheme} - returns null if slide or layout or master or theme doesn't exist.
*/
ApiSlide.prototype.GetTheme = function() { return new ApiTheme(); };

/**
* Returns an array with all the drawing objects from the slide.
* @memberof ApiSlide
* @returns {Drawing[]} 
*/
ApiSlide.prototype.GetAllDrawings = function() { return []; };

/**
* Returns an array with all the shape objects from the slide.
* @memberof ApiSlide
* @returns {ApiShape[]} 
*/
ApiSlide.prototype.GetAllShapes = function() { return []; };

/**
* Returns an array with all the image objects from the slide.
* @memberof ApiSlide
* @returns {ApiImage[]} 
*/
ApiSlide.prototype.GetAllImages = function() { return []; };

/**
* Returns an array with all the chart objects from the slide.
* @memberof ApiSlide
* @returns {ApiChart[]} 
*/
ApiSlide.prototype.GetAllCharts = function() { return []; };

/**
* Returns an array with all the OLE objects from the slide.
* @memberof ApiSlide
* @returns {ApiOleObject[]} 
*/
ApiSlide.prototype.GetAllOleObjects = function() { return []; };

/**
* Returns an array with all tables from the current slide.
*
* @memberof ApiSlide
* @returns {ApiTable[]} An array with all tables from the current slide.
* @since 9.1.0
*/
ApiSlide.prototype.GetAllTables = function() { return []; };

/**
* Converts the ApiSlide object into the JSON object.
* @memberof ApiSlide
* @param {boolean} [bWriteLayout=false] - Specifies if the slide layout will be written to the JSON object or not.
* @param {boolean} [bWriteMaster=false] - Specifies if the slide master will be written to the JSON object or not (bWriteMaster is false if bWriteLayout === false).
* @param {boolean} [bWriteAllMasLayouts=false] - Specifies if all child layouts from the slide master will be written to the JSON object or not.
* @param {boolean} [bWriteTableStyles=false] - Specifies whether to write used table styles to the JSON object (true) or not (false).
* @returns {JSON}
*/
ApiSlide.prototype.ToJSON = function(bWriteLayout, bWriteMaster, bWriteAllMasLayouts, bWriteTableStyles) { return new JSON(); };

/**
* Returns an array of drawings by the specified placeholder type.
* @memberof ApiSlide
* @param {PlaceholderType} sType - The placeholder type.
* @returns {Drawing[]}
* @since 8.2.0
*/
ApiSlide.prototype.GetDrawingsByPlaceholderType = function(sType) { return []; };

/**
* Selects the current slide.
* @memberof ApiSlide
* @since 8.3.0
*/
ApiSlide.prototype.Select = function() {};

/**
* Groups an array of drawings in the current slide.
* @memberof ApiSlide
* @param {DrawingForGroup[]} aDrawings - An array of drawings to group.
* @returns {ApiGroup}
* @since 8.3.0
*/
ApiSlide.prototype.GroupDrawings = function(aDrawings) { return new ApiGroup(); };

/**
* Returns the notes page from the current slide.
* @memberof ApiSlide
* @returns {ApiNotesPage | null}
* @since 9.0.0
*/
ApiSlide.prototype.GetNotesPage = function() { return new ApiNotesPage(); };

/**
* Adds a text to the notes page of the current slide.
* @memberof ApiSlide
* @param {string} sText - The text to be added to the notes page.
* @returns {boolean} - Returns true if text was added successfully, otherwise false.
* @since 9.0.0
*/
ApiSlide.prototype.AddNotesText = function(sText) { return true; };

/**
* Returns the slide show transition of the current slide.
*
* @memberof ApiSlide
* @since 9.3.0
*
* @returns {ApiSlideShowTransition | null} - Returns the slide show transition or null if the slide has no transition.
*/
ApiSlide.prototype.GetSlideShowTransition = function() { return new ApiSlideShowTransition(); };

/**
* Sets the slide show transition to the current slide.
*
* @memberof ApiSlide
* @since 9.3.0
*
* @param {ApiSlideShowTransition} transition - The slide show transition to be applied.
* @returns {boolean} - Returns true if the transition was applied successfully, otherwise false.
*/
ApiSlide.prototype.SetSlideShowTransition = function(transition) { return true; };

/**
* Returns the animation timeline for the slide.
*
* @memberof ApiSlide
* @since 9.3.0
*
* @returns {ApiTimeLine} - The animation timeline for the slide.
*/
ApiSlide.prototype.GetTimeLine = function() { return new ApiTimeLine(); };

/**
* Returns the type of the ApiNotesPage class.
*
* @memberof ApiNotesPage
* @returns {"notesPage"}
* @since 9.0.0
*/
ApiNotesPage.prototype.GetClassType = function() { return ""; };

/**
* Returns a shape with the type="body" attribute from the current notes page.
* @memberof ApiNotesPage
* @returns {ApiShape | null}
* @since 9.0.0
*/
ApiNotesPage.prototype.GetBodyShape = function() { return new ApiShape(); };

/**
* Adds a text to the body shape of the current notes page.
* @memberof ApiNotesPage
* @param {string} sText - The text to be added to the body shape.
* @returns {boolean} - Returns true if text was added successfully, otherwise false.
* @since 9.0.0
*/
ApiNotesPage.prototype.AddBodyShapeText = function(sText) { return true; };

/**
* Returns the text from the body shape of the current notes page.
*
* @memberof ApiNotesPage
* @returns {string} The text from the body shape.
* @since 9.1.0
*/
ApiNotesPage.prototype.GetBodyShapeText = function() { return ""; };

/**
* Returns the type of the ApiSlideShowTransition class.
*
* @memberof ApiSlideShowTransition
* @since 9.3.0
*
* @returns {"slideShowTransition"}
*/
ApiSlideShowTransition.prototype.GetClassType = function() { return ""; };

/**
* Returns the entry effect for the slide show transition.
*
* @memberof ApiSlideShowTransition
* @since 9.3.0
*
* @returns {EntryEffect} - The name of the entry effect in string format.
*/
ApiSlideShowTransition.prototype.GetEntryEffect = function() { return new EntryEffect(); };

/**
* Sets the entry effect for the slide show transition.
*
* @memberof ApiSlideShowTransition
* @since 9.3.0
*
* @param {EntryEffect} entryEffectName - The name of the entry effect in string format.
* @returns {boolean} - True if the entry effect name is supported and was set successfully; otherwise false.
*/
ApiSlideShowTransition.prototype.SetEntryEffect = function(entryEffectName) { return true; };

/**
* Returns the transition duration in milliseconds for the slide show transition.
*
* @memberof ApiSlideShowTransition
* @since 9.3.0
*
* @returns {number} - The transition duration in milliseconds.
*/
ApiSlideShowTransition.prototype.GetDuration = function() { return 0; };

/**
* Sets the transition duration in milliseconds for the slide show transition.
*
* @memberof ApiSlideShowTransition
* @since 9.3.0
*
* @param {number} duration - The transition duration in milliseconds.
* @returns {boolean} - True if the duration was set successfully; otherwise false.
*/
ApiSlideShowTransition.prototype.SetDuration = function(duration) { return true; };

/**
* Returns the transition speed (similar to PowerPoint VBA Speed property).
* Maps duration to speed based on OOXML spd attribute logic:
* - fast: duration <= 500ms
* - medium: 500ms < duration <= 750ms
* - slow: duration > 750ms
*
* @memberof ApiSlideShowTransition
* @since 9.3.0
*
* @returns {TransitionSpeed} - The transition speed in string format.
*/
ApiSlideShowTransition.prototype.GetSpeed = function() { return new TransitionSpeed(); };

/**
* Sets the transition speed (similar to PowerPoint VBA Speed property).
* Converts speed to duration based on standard values:
* - fast = 500ms
* - medium = 750ms
* - slow = 1000ms
*
* @memberof ApiSlideShowTransition
* @since 9.3.0
*
* @param {TransitionSpeed} speed - The transition speed in string format.
* @returns {boolean} - True if the given parameter is valid and was set successfully; otherwise false.
*/
ApiSlideShowTransition.prototype.SetSpeed = function(speed) { return true; };

/**
* Returns whether the slide advances on mouse click.
*
* @memberof ApiSlideShowTransition
* @since 9.3.0
*
* @returns {boolean} - True if the slide advances on mouse click; otherwise false.
*/
ApiSlideShowTransition.prototype.GetAdvanceOnClick = function() { return true; };

/**
* Sets whether the slide advances on mouse click.
*
* @memberof ApiSlideShowTransition
* @since 9.3.0
*
* @param {boolean} advanceOnClick - True to advance the slide on mouse click; otherwise false.
* @returns {boolean} - True if the value was set successfully; otherwise false.
*/
ApiSlideShowTransition.prototype.SetAdvanceOnClick = function(advanceOnClick) { return true; };

/**
* Returns whether the slide advances after a specified time.
*
* @memberof ApiSlideShowTransition
* @since 9.3.0
*
* @returns {boolean} - True if the slide advances after a specified time; otherwise false.
*/
ApiSlideShowTransition.prototype.GetAdvanceOnTime = function() { return true; };

/**
* Sets whether the slide advances after a specified time.
*
* @memberof ApiSlideShowTransition
* @since 9.3.0
*
* @param {boolean} advanceOnTime - True to advance the slide after a specified time; otherwise false.
* @returns {boolean} - True if the setting was set successfully; otherwise false.
*/
ApiSlideShowTransition.prototype.SetAdvanceOnTime = function(advanceOnTime) { return true; };

/**
* Returns the slide advance time in milliseconds.
*
* @memberof ApiSlideShowTransition
* @since 9.3.0
*
* @returns {number | undefined} - The slide advance time in milliseconds if set; otherwise undefined.
*/
ApiSlideShowTransition.prototype.GetAdvanceTime = function() { return 0; };

/**
* Sets the slide advance time in milliseconds.
*
* @memberof ApiSlideShowTransition
* @since 9.3.0
*
* @param {number} advanceTime - The slide advance time in milliseconds.
* @returns {boolean} - True if the time was set successfully; otherwise false.
*/
ApiSlideShowTransition.prototype.SetAdvanceTime = function(advanceTime) { return true; };

/**
* Returns the type of the ApiTimeLine class.
*
* @memberof ApiTimeLine
* @since 9.3.0
*
* @returns {"timeLine"}
*/
ApiTimeLine.prototype.GetClassType = function() { return ""; };

/**
* Returns the main animation sequence for the slide.
*
* @memberof ApiTimeLine
* @since 9.3.0
*
* @returns {ApiAnimationSequence} - The main animation sequence.
*/
ApiTimeLine.prototype.GetMainSequence = function() { return new ApiAnimationSequence(); };

/**
* Returns all interactive animation sequences for the slide.
*
* @memberof ApiTimeLine
* @since 9.3.0
*
* @returns {ApiAnimationSequence[]} - Array of interactive animation sequences.
*/
ApiTimeLine.prototype.GetInteractiveSequences = function() { return []; };

/**
* Creates an interactive animation sequence triggered by clicking on a specified object.
*
* @memberof ApiTimeLine
* @since 9.3.0
*
* @param {ApiDrawing} drawing - The drawing object that triggers the sequence when clicked.
* @returns {ApiAnimationSequence | null} - The interactive animation sequence or null if creation failed.
*/
ApiTimeLine.prototype.AddInteractiveSequence = function(drawing) { return new ApiAnimationSequence(); };

/**
* Returns all animation effects for the slide.
*
* @memberof ApiTimeLine
* @since 9.3.0
*
* @returns {ApiAnimationEffect[]} - Array of all animation effects.
*/
ApiTimeLine.prototype.GetAllEffects = function() { return []; };

/**
* Returns the type of the ApiAnimationSequence class.
*
* @memberof ApiAnimationSequence
* @since 9.3.0
*
* @returns {"animationSequence"}
*/
ApiAnimationSequence.prototype.GetClassType = function() { return ""; };

/**
* Returns the number of effects in the sequence.
*
* @memberof ApiAnimationSequence
* @since 9.3.0
*
* @returns {number} - The number of effects.
*/
ApiAnimationSequence.prototype.GetCount = function() { return 0; };

/**
* Returns the effect at the specified index.
*
* @memberof ApiAnimationSequence
* @since 9.3.0
*
* @param {number} index - The zero-based index of the effect.
* @returns {ApiAnimationEffect | null} - The effect at the specified index, or null if not found.
*/
ApiAnimationSequence.prototype.GetEffect = function(index) { return new ApiAnimationEffect(); };

/**
* Adds an animation effect to the sequence.
*
* @memberof ApiAnimationSequence
* @since 9.3.0
*
* @param {ApiDrawing} drawing - The drawing object to animate.
* @param {AnimationEffectType} effectType - The type of animation effect (e.g., "entranceFade", "entranceFlyIn", "emphasisPulse").
* @param {AnimationTriggerType} [trigger="onclick"] - The trigger type: "onclick", "withprevious", or "afterprevious".
* @returns {ApiAnimationEffect | null} - The created animation effect, or null if creation failed.
*/
ApiAnimationSequence.prototype.AddEffect = function(drawing, effectType, trigger) { return new ApiAnimationEffect(); };

/**
* Removes all effects from the sequence.
*
* @memberof ApiAnimationSequence
* @since 9.3.0
*
* @returns {boolean} - True if effects were removed successfully.
*/
ApiAnimationSequence.prototype.RemoveAllEffects = function() { return true; };

/**
* Returns the type of the ApiAnimationEffect class.
*
* @memberof ApiAnimationEffect
* @since 9.3.0
*
* @returns {"animationEffect"}
*/
ApiAnimationEffect.prototype.GetClassType = function() { return ""; };

/**
* Returns the animation effect type.
*
* @memberof ApiAnimationEffect
* @since 9.3.0
*
* @returns {AnimationEffectType | null} - The effect type name (e.g., "entranceFade", "exitFadeOut", "emphasisPulse"), or null if unknown.
*/
ApiAnimationEffect.prototype.GetEffectType = function() { return new AnimationEffectType(); };

/**
* Returns the trigger type for the animation effect.
*
* @memberof ApiAnimationEffect
* @since 9.3.0
*
* @returns {AnimationTriggerType} - The trigger type: "onclick", "withprevious", or "afterprevious".
*/
ApiAnimationEffect.prototype.GetTriggerType = function() { return new AnimationTriggerType(); };

/**
* Sets the trigger type for the animation effect.
*
* @memberof ApiAnimationEffect
* @since 9.3.0
*
* @param {AnimationTriggerType} trigger - The trigger type: "onclick", "withprevious", or "afterprevious".
* @returns {boolean} - True if the trigger type was set successfully.
*/
ApiAnimationEffect.prototype.SetTriggerType = function(trigger) { return true; };

/**
* Returns the duration of the animation effect in milliseconds.
*
* @memberof ApiAnimationEffect
* @since 9.3.0
*
* @returns {number} - The duration in milliseconds.
*/
ApiAnimationEffect.prototype.GetDuration = function() { return 0; };

/**
* Sets the duration of the animation effect in milliseconds.
*
* @memberof ApiAnimationEffect
* @since 9.3.0
*
* @param {number} duration - The duration in milliseconds.
* @returns {boolean} - True if the duration was set successfully.
*/
ApiAnimationEffect.prototype.SetDuration = function(duration) { return true; };

/**
* Returns the delay before the animation effect starts in milliseconds.
*
* @memberof ApiAnimationEffect
* @since 9.3.0
*
* @returns {number} - The delay in milliseconds.
*/
ApiAnimationEffect.prototype.GetDelay = function() { return 0; };

/**
* Sets the delay before the animation effect starts in milliseconds.
*
* @memberof ApiAnimationEffect
* @since 9.3.0
*
* @param {number} delay - The delay in milliseconds.
* @returns {boolean} - True if the delay was set successfully.
*/
ApiAnimationEffect.prototype.SetDelay = function(delay) { return true; };

/**
* Returns the animated drawing object.
*
* @memberof ApiAnimationEffect
* @since 9.3.0
*
* @returns {ApiDrawing | null} - The animated drawing or null if not found.
*/
ApiAnimationEffect.prototype.GetShape = function() { return new ApiDrawing(); };

/**
* Deletes the animation effect.
*
* @memberof ApiAnimationEffect
* @since 9.3.0
*
* @returns {boolean} - True if the effect was deleted successfully.
*/
ApiAnimationEffect.prototype.Delete = function() { return true; };

/**
* Moves the animation effect to the specified position in the sequence.
*
* @memberof ApiAnimationEffect
* @since 9.3.0
*
* @param {number} index - The new zero-based position for the effect.
* @returns {boolean} - True if the effect was moved successfully.
*/
ApiAnimationEffect.prototype.MoveTo = function(index) { return true; };

/**
* Returns the repeat count for the animation effect.
*
* @memberof ApiAnimationEffect
* @since 9.3.0
*
* @returns {number} - The repeat count (1 = play once, 2 = play twice, etc.). Returns 1 if not set.
*/
ApiAnimationEffect.prototype.GetRepeatCount = function() { return 0; };

/**
* Sets the repeat count for the animation effect.
*
* @memberof ApiAnimationEffect
* @since 9.3.0
*
* @param {number} count - The repeat count (1 = play once, 2 = play twice, etc.).
* @returns {boolean} - True if the repeat count was set successfully.
*/
ApiAnimationEffect.prototype.SetRepeatCount = function(count) { return true; };

/**
* Returns the type of the ApiDrawing class.
* @memberof ApiDrawing
* @returns {"drawing"}
*/
ApiDrawing.prototype.GetClassType = function() { return ""; };

/**
* Sets the size of the object (image, shape, chart) bounding box.
* @memberof ApiDrawing
* @param {EMU} nWidth - The object width measured in English measure units.
* @param {EMU} nHeight - The object height measured in English measure units.
*/
ApiDrawing.prototype.SetSize = function(nWidth, nHeight) {};

/**
* Sets the position of the drawing on the slide.
* @memberof ApiDrawing
* @param {EMU} nPosX - The distance from the left side of the slide to the left side of the drawing measured in English measure units.
* @param {EMU} nPosY - The distance from the top side of the slide to the upper side of the drawing measured in English measure units.
*/
ApiDrawing.prototype.SetPosition = function(nPosX, nPosY) {};

/**
* Returns the drawing parent object.
* @memberof ApiDrawing
* @returns {ApiSlide | ApiLayout | ApiMaster | null}
*/
ApiDrawing.prototype.GetParent = function() { return new ApiSlide(); };

/**
* Returns the drawing parent slide.
* @memberof ApiDrawing
* @returns {ApiSlide | null} - return null if parent ins't a slide.
*/
ApiDrawing.prototype.GetParentSlide = function() { return new ApiSlide(); };

/**
* Returns the drawing parent slide layout.
* @memberof ApiDrawing
* @returns {ApiLayout | null} - return null if parent ins't a slide layout.
*/
ApiDrawing.prototype.GetParentLayout = function() { return new ApiLayout(); };

/**
* Returns the drawing parent slide master.
* @memberof ApiDrawing
* @returns {ApiMaster | null} - return null if parent ins't a slide master.
*/
ApiDrawing.prototype.GetParentMaster = function() { return new ApiMaster(); };

/**
* Creates a copy of the specified drawing object.
* @memberof ApiDrawing
* @returns {ApiDrawing} - return null if drawing doesn't exist.
*/
ApiDrawing.prototype.Copy = function() { return new ApiDrawing(); };

/**
* Deletes the specified drawing object from the parent.
* @memberof ApiDrawing
* @returns {boolean} - false if drawing doesn't exist or drawing hasn't a parent.
*/
ApiDrawing.prototype.Delete = function() { return true; };

/**
* Sets the specified placeholder to the current drawing object.
* @memberof ApiDrawing
* @param {ApiPlaceholder} oPlaceholder - Placeholder object.
* @returns {boolean} - returns false if parameter isn't a placeholder.
*/
ApiDrawing.prototype.SetPlaceholder = function(oPlaceholder) { return true; };

/**
* Returns a placeholder from the current drawing object.
* @memberof ApiDrawing
* @returns {ApiPlaceholder | null} - returns null if placeholder doesn't exist.
*/
ApiDrawing.prototype.GetPlaceholder = function() { return new ApiPlaceholder(); };

/**
* Returns the width of the current drawing.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiDrawing.prototype.GetWidth = function() { return new EMU(); };

/**
* Returns the height of the current drawing.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiDrawing.prototype.GetHeight = function() { return new EMU(); };

/**
* Returns the name of the current drawing.
* @memberof ApiDrawing
* @returns {string}
* @since 9.3.0
*/
ApiDrawing.prototype.GetName = function() { return ""; };

/**
* Sets the name of the current drawing.
* If another drawing with the same name already exists, that drawing's name will be reset to a default auto-generated name.
* @memberof ApiDrawing
* @param {string} name - The name which will be set to the current drawing.
* @returns {boolean} - Returns true if the name was successfully set, otherwise returns false.
* @since 9.3.0
*/
ApiDrawing.prototype.SetName = function(name) { return true; };

/**
* Returns the lock value for the specified lock type of the current drawing.
* @memberof ApiDrawing
* @param {DrawingLockType} sType - Lock type in the string format.
* @returns {boolean}
*/
ApiDrawing.prototype.GetLockValue = function(sType) { return true; };

/**
* Sets the lock value to the specified lock type of the current drawing.
* @memberof ApiDrawing
* @param {DrawingLockType} sType - Lock type in the string format.
* @param {boolean} bValue - Specifies if the specified lock is applied to the current drawing.
* @returns {boolean}
*/
ApiDrawing.prototype.SetLockValue = function(sType, bValue) { return true; };

/**
* Converts the ApiDrawing object into the JSON object.
* @memberof ApiDrawing
* @returns {JSON}
*/
ApiDrawing.prototype.ToJSON = function() { return new JSON(); };

/**
* Selects the current graphic object.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} [isReplace=false] - Specifies whether the selection should replace the current selection (true) or be added to it (false).
* @returns {boolean}
*/
ApiDrawing.prototype.Select = function(isReplace) { return true; };

/**
* Removes the current graphic object from the selection.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean}
*/
ApiDrawing.prototype.Unselect = function() { return true; };

/**
* Sets the rotation angle to the current drawing object.
* @memberof ApiDrawing
* @param {number} nRotAngle - New drawing rotation angle.
* @returns {boolean}
* @since 9.0.0
*/
ApiDrawing.prototype.SetRotation = function(nRotAngle) { return true; };

/**
* Returns the rotation angle of the current drawing object.
* @memberof ApiDrawing
* @returns {number}
* @since 9.0.0
*/
ApiDrawing.prototype.GetRotation = function() { return 0; };

/**
* Get horizontal flip of current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean | null} Returns true if the figure is flipped horizontally, false if not, or null if the drawing properties are not available.
*/
ApiDrawing.prototype.GetFlipH = function() { return true; };

/**
* Get vertical flip of current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean | null} Returns true if the figure is flipped vertically, false if not, or null if the drawing properties are not available.
*/
ApiDrawing.prototype.GetFlipV = function() { return true; };

/**
* Sets the horizontal flip of the current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} bFlip - Specifies if the figure will be flipped horizontally or not.
* @returns {boolean} Returns true if the operation is successful, false otherwise.
*/
ApiDrawing.prototype.SetFlipH = function(bFlip) { return true; };

/**
* Sets the vertical flip of the current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} bFlip - Specifies if the figure will be flipped vertically or not.
* @returns {boolean} Returns true if the operation is successful, false otherwise.
*/
ApiDrawing.prototype.SetFlipV = function(bFlip) { return true; };

/**
* Gets the x position of the drawing on the slide.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiDrawing.prototype.GetPosX = function() { return new EMU(); };

/**
* Gets the y position of the drawing on the slide.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiDrawing.prototype.GetPosY = function() { return new EMU(); };

/**
* Sets the x position of the drawing on the slide.
* @memberof ApiDrawing
* @param {EMU} posX - The distance from the left side of the slide to the left side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiDrawing.prototype.SetPosX = function(posX) { return true; };

/**
* Sets the y position of the drawing on the slide.
* @memberof ApiDrawing
* @param {EMU} posY - The distance from the top side of the slide to the upper side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiDrawing.prototype.SetPosY = function(posY) { return true; };

/**
* Replaces the placeholder by a drawing on the slide.
* @memberof ApiDrawing
* @param {Drawing} oDrawing
* @returns {boolean}
*/
ApiDrawing.prototype.ReplacePlaceholder = function(oDrawing) { return true; };

/**
* Returns an internal ID of the current drawing object.
* @memberof ApiDrawing
* @returns {string}
*/
ApiDrawing.prototype.GetInternalId = function() { return ""; };

/**
* Sets a hyperlink to the current drawing object (shape or image).
* Pass null to remove the hyperlink.
*
* @memberof ApiDrawing
*
* @param {ApiHyperlink | null} hyperlink - The hyperlink object to be set to the drawing, or null to remove the hyperlink.
*
* @returns {boolean} - Returns true if the hyperlink was set or removed successfully.
*/
ApiDrawing.prototype.SetHyperlink = function(hyperlink) { return true; };

/**
* Returns the hyperlink from the current drawing object (shape or image).
*
* @memberof ApiDrawing
*
* @returns {ApiHyperlink | null} - Returns the hyperlink object or null if no hyperlink is set.
*/
ApiDrawing.prototype.GetHyperlink = function() { return new ApiHyperlink(); };

/**
* Sets the fill formatting properties to the current graphic object.
* @memberof ApiDrawing
* @param {ApiFill} oFill - The fill type used to fill the graphic object.
* @returns {boolean} - returns false if param is invalid.
* @since 9.3.0
*/
ApiDrawing.prototype.Fill = function(oFill) { return true; };

/**
* Sets the outline properties to the specified graphic object.
* @memberof ApiDrawing
* @param {ApiStroke} oStroke - The stroke used to create the graphic object outline.
* @returns {boolean} - returns false if param is invalid.
* @since 9.3.0
*/
ApiDrawing.prototype.SetOutLine = function(oStroke) { return true; };

/**
* Returns a type of the ApiGroup class.
* @memberof ApiGroup
* @returns {"group"}
* @since 8.3.0
*/
ApiGroup.prototype.GetClassType = function() { return ""; };

/**
* Ungroups the current group of drawings.
* @memberof ApiGroup
* @returns {boolean}
* @since 8.3.0
*/
ApiGroup.prototype.Ungroup = function() { return true; };

/**
* Creates a copy of the specified group of drawings.
* @memberof ApiGroup
* @returns {ApiGroup} - return null if drawing doesn't exist.
* @since 9.4.0
*/
ApiGroup.prototype.Copy = function() { return new ApiGroup(); };

/**
* Sets the position of the drawing on the slide.
* @memberof ApiDrawing
* @param {EMU} nPosX - The distance from the left side of the slide to the left side of the drawing measured in English measure units.
* @param {EMU} nPosY - The distance from the top side of the slide to the upper side of the drawing measured in English measure units.
*/
ApiGroup.prototype.SetPosition = function(nPosX, nPosY) {};

/**
* Returns the drawing parent object.
* @memberof ApiDrawing
* @returns {ApiSlide | ApiLayout | ApiMaster | null}
*/
ApiGroup.prototype.GetParent = function() { return new ApiSlide(); };

/**
* Returns the drawing parent slide.
* @memberof ApiDrawing
* @returns {ApiSlide | null} - return null if parent ins't a slide.
*/
ApiGroup.prototype.GetParentSlide = function() { return new ApiSlide(); };

/**
* Returns the drawing parent slide layout.
* @memberof ApiDrawing
* @returns {ApiLayout | null} - return null if parent ins't a slide layout.
*/
ApiGroup.prototype.GetParentLayout = function() { return new ApiLayout(); };

/**
* Returns the drawing parent slide master.
* @memberof ApiDrawing
* @returns {ApiMaster | null} - return null if parent ins't a slide master.
*/
ApiGroup.prototype.GetParentMaster = function() { return new ApiMaster(); };

/**
* Sets the specified placeholder to the current drawing object.
* @memberof ApiDrawing
* @param {ApiPlaceholder} oPlaceholder - Placeholder object.
* @returns {boolean} - returns false if parameter isn't a placeholder.
*/
ApiGroup.prototype.SetPlaceholder = function(oPlaceholder) { return true; };

/**
* Returns a placeholder from the current drawing object.
* @memberof ApiDrawing
* @returns {ApiPlaceholder | null} - returns null if placeholder doesn't exist.
*/
ApiGroup.prototype.GetPlaceholder = function() { return new ApiPlaceholder(); };

/**
* Gets the x position of the drawing on the slide.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiGroup.prototype.GetPosX = function() { return new EMU(); };

/**
* Gets the y position of the drawing on the slide.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiGroup.prototype.GetPosY = function() { return new EMU(); };

/**
* Sets the x position of the drawing on the slide.
* @memberof ApiDrawing
* @param {EMU} posX - The distance from the left side of the slide to the left side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiGroup.prototype.SetPosX = function(posX) { return true; };

/**
* Sets the y position of the drawing on the slide.
* @memberof ApiDrawing
* @param {EMU} posY - The distance from the top side of the slide to the upper side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiGroup.prototype.SetPosY = function(posY) { return true; };

/**
* Replaces the placeholder by a drawing on the slide.
* @memberof ApiDrawing
* @param {Drawing} oDrawing
* @returns {boolean}
*/
ApiGroup.prototype.ReplacePlaceholder = function(oDrawing) { return true; };

/**
* Returns an internal ID of the current drawing object.
* @memberof ApiDrawing
* @returns {string}
*/
ApiGroup.prototype.GetInternalId = function() { return ""; };

/**
* Sets a hyperlink to the current drawing object (shape or image).
* Pass null to remove the hyperlink.
*
* @memberof ApiDrawing
*
* @param {ApiHyperlink | null} hyperlink - The hyperlink object to be set to the drawing, or null to remove the hyperlink.
*
* @returns {boolean} - Returns true if the hyperlink was set or removed successfully.
*/
ApiGroup.prototype.SetHyperlink = function(hyperlink) { return true; };

/**
* Returns the hyperlink from the current drawing object (shape or image).
*
* @memberof ApiDrawing
*
* @returns {ApiHyperlink | null} - Returns the hyperlink object or null if no hyperlink is set.
*/
ApiGroup.prototype.GetHyperlink = function() { return new ApiHyperlink(); };

/**
* Sets the size of the object (image, shape, chart) bounding box.
* @memberof ApiDrawing
* @param {EMU} nWidth - The object width measured in English measure units.
* @param {EMU} nHeight - The object height measured in English measure units.
*/
ApiGroup.prototype.SetSize = function(nWidth, nHeight) {};

/**
* Deletes the specified drawing object from the parent.
* @memberof ApiDrawing
* @returns {boolean} - false if drawing doesn't exist or drawing hasn't a parent.
*/
ApiGroup.prototype.Delete = function() { return true; };

/**
* Returns the width of the current drawing.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiGroup.prototype.GetWidth = function() { return new EMU(); };

/**
* Returns the height of the current drawing.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiGroup.prototype.GetHeight = function() { return new EMU(); };

/**
* Returns the name of the current drawing.
* @memberof ApiDrawing
* @returns {string}
* @since 9.3.0
*/
ApiGroup.prototype.GetName = function() { return ""; };

/**
* Sets the name of the current drawing.
* If another drawing with the same name already exists, that drawing's name will be reset to a default auto-generated name.
* @memberof ApiDrawing
* @param {string} name - The name which will be set to the current drawing.
* @returns {boolean} - Returns true if the name was successfully set, otherwise returns false.
* @since 9.3.0
*/
ApiGroup.prototype.SetName = function(name) { return true; };

/**
* Returns the lock value for the specified lock type of the current drawing.
* @memberof ApiDrawing
* @param {DrawingLockType} sType - Lock type in the string format.
* @returns {boolean}
*/
ApiGroup.prototype.GetLockValue = function(sType) { return true; };

/**
* Sets the lock value to the specified lock type of the current drawing.
* @memberof ApiDrawing
* @param {DrawingLockType} sType - Lock type in the string format.
* @param {boolean} bValue - Specifies if the specified lock is applied to the current drawing.
* @returns {boolean}
*/
ApiGroup.prototype.SetLockValue = function(sType, bValue) { return true; };

/**
* Converts the ApiDrawing object into the JSON object.
* @memberof ApiDrawing
* @returns {JSON}
*/
ApiGroup.prototype.ToJSON = function() { return new JSON(); };

/**
* Selects the current graphic object.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} [isReplace=false] - Specifies whether the selection should replace the current selection (true) or be added to it (false).
* @returns {boolean}
*/
ApiGroup.prototype.Select = function(isReplace) { return true; };

/**
* Removes the current graphic object from the selection.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean}
*/
ApiGroup.prototype.Unselect = function() { return true; };

/**
* Sets the rotation angle to the current drawing object.
* @memberof ApiDrawing
* @param {number} nRotAngle - New drawing rotation angle.
* @returns {boolean}
* @since 9.0.0
*/
ApiGroup.prototype.SetRotation = function(nRotAngle) { return true; };

/**
* Returns the rotation angle of the current drawing object.
* @memberof ApiDrawing
* @returns {number}
* @since 9.0.0
*/
ApiGroup.prototype.GetRotation = function() { return 0; };

/**
* Get horizontal flip of current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean | null} Returns true if the figure is flipped horizontally, false if not, or null if the drawing properties are not available.
*/
ApiGroup.prototype.GetFlipH = function() { return true; };

/**
* Get vertical flip of current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean | null} Returns true if the figure is flipped vertically, false if not, or null if the drawing properties are not available.
*/
ApiGroup.prototype.GetFlipV = function() { return true; };

/**
* Sets the horizontal flip of the current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} bFlip - Specifies if the figure will be flipped horizontally or not.
* @returns {boolean} Returns true if the operation is successful, false otherwise.
*/
ApiGroup.prototype.SetFlipH = function(bFlip) { return true; };

/**
* Sets the vertical flip of the current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} bFlip - Specifies if the figure will be flipped vertically or not.
* @returns {boolean} Returns true if the operation is successful, false otherwise.
*/
ApiGroup.prototype.SetFlipV = function(bFlip) { return true; };

/**
* Sets the fill formatting properties to the current graphic object.
* @memberof ApiDrawing
* @param {ApiFill} oFill - The fill type used to fill the graphic object.
* @returns {boolean} - returns false if param is invalid.
* @since 9.3.0
*/
ApiGroup.prototype.Fill = function(oFill) { return true; };

/**
* Sets the outline properties to the specified graphic object.
* @memberof ApiDrawing
* @param {ApiStroke} oStroke - The stroke used to create the graphic object outline.
* @returns {boolean} - returns false if param is invalid.
* @since 9.3.0
*/
ApiGroup.prototype.SetOutLine = function(oStroke) { return true; };

/**
* Returns a type of the ApiSmartArt class.
* @memberof ApiSmartArt
* @returns {"smartArt"}
*/
ApiSmartArt.prototype.GetClassType = function() { return ""; };

/**
* Sets the position of the drawing on the slide.
* @memberof ApiDrawing
* @param {EMU} nPosX - The distance from the left side of the slide to the left side of the drawing measured in English measure units.
* @param {EMU} nPosY - The distance from the top side of the slide to the upper side of the drawing measured in English measure units.
*/
ApiSmartArt.prototype.SetPosition = function(nPosX, nPosY) {};

/**
* Returns the drawing parent object.
* @memberof ApiDrawing
* @returns {ApiSlide | ApiLayout | ApiMaster | null}
*/
ApiSmartArt.prototype.GetParent = function() { return new ApiSlide(); };

/**
* Returns the drawing parent slide.
* @memberof ApiDrawing
* @returns {ApiSlide | null} - return null if parent ins't a slide.
*/
ApiSmartArt.prototype.GetParentSlide = function() { return new ApiSlide(); };

/**
* Returns the drawing parent slide layout.
* @memberof ApiDrawing
* @returns {ApiLayout | null} - return null if parent ins't a slide layout.
*/
ApiSmartArt.prototype.GetParentLayout = function() { return new ApiLayout(); };

/**
* Returns the drawing parent slide master.
* @memberof ApiDrawing
* @returns {ApiMaster | null} - return null if parent ins't a slide master.
*/
ApiSmartArt.prototype.GetParentMaster = function() { return new ApiMaster(); };

/**
* Sets the specified placeholder to the current drawing object.
* @memberof ApiDrawing
* @param {ApiPlaceholder} oPlaceholder - Placeholder object.
* @returns {boolean} - returns false if parameter isn't a placeholder.
*/
ApiSmartArt.prototype.SetPlaceholder = function(oPlaceholder) { return true; };

/**
* Returns a placeholder from the current drawing object.
* @memberof ApiDrawing
* @returns {ApiPlaceholder | null} - returns null if placeholder doesn't exist.
*/
ApiSmartArt.prototype.GetPlaceholder = function() { return new ApiPlaceholder(); };

/**
* Gets the x position of the drawing on the slide.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiSmartArt.prototype.GetPosX = function() { return new EMU(); };

/**
* Gets the y position of the drawing on the slide.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiSmartArt.prototype.GetPosY = function() { return new EMU(); };

/**
* Sets the x position of the drawing on the slide.
* @memberof ApiDrawing
* @param {EMU} posX - The distance from the left side of the slide to the left side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiSmartArt.prototype.SetPosX = function(posX) { return true; };

/**
* Sets the y position of the drawing on the slide.
* @memberof ApiDrawing
* @param {EMU} posY - The distance from the top side of the slide to the upper side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiSmartArt.prototype.SetPosY = function(posY) { return true; };

/**
* Replaces the placeholder by a drawing on the slide.
* @memberof ApiDrawing
* @param {Drawing} oDrawing
* @returns {boolean}
*/
ApiSmartArt.prototype.ReplacePlaceholder = function(oDrawing) { return true; };

/**
* Returns an internal ID of the current drawing object.
* @memberof ApiDrawing
* @returns {string}
*/
ApiSmartArt.prototype.GetInternalId = function() { return ""; };

/**
* Sets a hyperlink to the current drawing object (shape or image).
* Pass null to remove the hyperlink.
*
* @memberof ApiDrawing
*
* @param {ApiHyperlink | null} hyperlink - The hyperlink object to be set to the drawing, or null to remove the hyperlink.
*
* @returns {boolean} - Returns true if the hyperlink was set or removed successfully.
*/
ApiSmartArt.prototype.SetHyperlink = function(hyperlink) { return true; };

/**
* Returns the hyperlink from the current drawing object (shape or image).
*
* @memberof ApiDrawing
*
* @returns {ApiHyperlink | null} - Returns the hyperlink object or null if no hyperlink is set.
*/
ApiSmartArt.prototype.GetHyperlink = function() { return new ApiHyperlink(); };

/**
* Sets the size of the object (image, shape, chart) bounding box.
* @memberof ApiDrawing
* @param {EMU} nWidth - The object width measured in English measure units.
* @param {EMU} nHeight - The object height measured in English measure units.
*/
ApiSmartArt.prototype.SetSize = function(nWidth, nHeight) {};

/**
* Creates a copy of the specified drawing object.
* @memberof ApiDrawing
* @returns {ApiDrawing} - return null if drawing doesn't exist.
*/
ApiSmartArt.prototype.Copy = function() { return new ApiDrawing(); };

/**
* Deletes the specified drawing object from the parent.
* @memberof ApiDrawing
* @returns {boolean} - false if drawing doesn't exist or drawing hasn't a parent.
*/
ApiSmartArt.prototype.Delete = function() { return true; };

/**
* Returns the width of the current drawing.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiSmartArt.prototype.GetWidth = function() { return new EMU(); };

/**
* Returns the height of the current drawing.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiSmartArt.prototype.GetHeight = function() { return new EMU(); };

/**
* Returns the name of the current drawing.
* @memberof ApiDrawing
* @returns {string}
* @since 9.3.0
*/
ApiSmartArt.prototype.GetName = function() { return ""; };

/**
* Sets the name of the current drawing.
* If another drawing with the same name already exists, that drawing's name will be reset to a default auto-generated name.
* @memberof ApiDrawing
* @param {string} name - The name which will be set to the current drawing.
* @returns {boolean} - Returns true if the name was successfully set, otherwise returns false.
* @since 9.3.0
*/
ApiSmartArt.prototype.SetName = function(name) { return true; };

/**
* Returns the lock value for the specified lock type of the current drawing.
* @memberof ApiDrawing
* @param {DrawingLockType} sType - Lock type in the string format.
* @returns {boolean}
*/
ApiSmartArt.prototype.GetLockValue = function(sType) { return true; };

/**
* Sets the lock value to the specified lock type of the current drawing.
* @memberof ApiDrawing
* @param {DrawingLockType} sType - Lock type in the string format.
* @param {boolean} bValue - Specifies if the specified lock is applied to the current drawing.
* @returns {boolean}
*/
ApiSmartArt.prototype.SetLockValue = function(sType, bValue) { return true; };

/**
* Converts the ApiDrawing object into the JSON object.
* @memberof ApiDrawing
* @returns {JSON}
*/
ApiSmartArt.prototype.ToJSON = function() { return new JSON(); };

/**
* Selects the current graphic object.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} [isReplace=false] - Specifies whether the selection should replace the current selection (true) or be added to it (false).
* @returns {boolean}
*/
ApiSmartArt.prototype.Select = function(isReplace) { return true; };

/**
* Removes the current graphic object from the selection.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean}
*/
ApiSmartArt.prototype.Unselect = function() { return true; };

/**
* Sets the rotation angle to the current drawing object.
* @memberof ApiDrawing
* @param {number} nRotAngle - New drawing rotation angle.
* @returns {boolean}
* @since 9.0.0
*/
ApiSmartArt.prototype.SetRotation = function(nRotAngle) { return true; };

/**
* Returns the rotation angle of the current drawing object.
* @memberof ApiDrawing
* @returns {number}
* @since 9.0.0
*/
ApiSmartArt.prototype.GetRotation = function() { return 0; };

/**
* Get horizontal flip of current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean | null} Returns true if the figure is flipped horizontally, false if not, or null if the drawing properties are not available.
*/
ApiSmartArt.prototype.GetFlipH = function() { return true; };

/**
* Get vertical flip of current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean | null} Returns true if the figure is flipped vertically, false if not, or null if the drawing properties are not available.
*/
ApiSmartArt.prototype.GetFlipV = function() { return true; };

/**
* Sets the horizontal flip of the current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} bFlip - Specifies if the figure will be flipped horizontally or not.
* @returns {boolean} Returns true if the operation is successful, false otherwise.
*/
ApiSmartArt.prototype.SetFlipH = function(bFlip) { return true; };

/**
* Sets the vertical flip of the current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} bFlip - Specifies if the figure will be flipped vertically or not.
* @returns {boolean} Returns true if the operation is successful, false otherwise.
*/
ApiSmartArt.prototype.SetFlipV = function(bFlip) { return true; };

/**
* Sets the fill formatting properties to the current graphic object.
* @memberof ApiDrawing
* @param {ApiFill} oFill - The fill type used to fill the graphic object.
* @returns {boolean} - returns false if param is invalid.
* @since 9.3.0
*/
ApiSmartArt.prototype.Fill = function(oFill) { return true; };

/**
* Sets the outline properties to the specified graphic object.
* @memberof ApiDrawing
* @param {ApiStroke} oStroke - The stroke used to create the graphic object outline.
* @returns {boolean} - returns false if param is invalid.
* @since 9.3.0
*/
ApiSmartArt.prototype.SetOutLine = function(oStroke) { return true; };

/**
* Returns the type of the ApiImage class.
* @memberof ApiImage
* @returns {"image"}
*/
ApiImage.prototype.GetClassType = function() { return ""; };

/**
* Creates a copy of the specified image.
* @memberof ApiImage
* @returns {ApiImage} - return null if drawing doesn't exist.
* @since 9.4.0
*/
ApiImage.prototype.Copy = function() { return new ApiImage(); };

/**
* Sets the position of the drawing on the slide.
* @memberof ApiDrawing
* @param {EMU} nPosX - The distance from the left side of the slide to the left side of the drawing measured in English measure units.
* @param {EMU} nPosY - The distance from the top side of the slide to the upper side of the drawing measured in English measure units.
*/
ApiImage.prototype.SetPosition = function(nPosX, nPosY) {};

/**
* Returns the drawing parent object.
* @memberof ApiDrawing
* @returns {ApiSlide | ApiLayout | ApiMaster | null}
*/
ApiImage.prototype.GetParent = function() { return new ApiSlide(); };

/**
* Returns the drawing parent slide.
* @memberof ApiDrawing
* @returns {ApiSlide | null} - return null if parent ins't a slide.
*/
ApiImage.prototype.GetParentSlide = function() { return new ApiSlide(); };

/**
* Returns the drawing parent slide layout.
* @memberof ApiDrawing
* @returns {ApiLayout | null} - return null if parent ins't a slide layout.
*/
ApiImage.prototype.GetParentLayout = function() { return new ApiLayout(); };

/**
* Returns the drawing parent slide master.
* @memberof ApiDrawing
* @returns {ApiMaster | null} - return null if parent ins't a slide master.
*/
ApiImage.prototype.GetParentMaster = function() { return new ApiMaster(); };

/**
* Sets the specified placeholder to the current drawing object.
* @memberof ApiDrawing
* @param {ApiPlaceholder} oPlaceholder - Placeholder object.
* @returns {boolean} - returns false if parameter isn't a placeholder.
*/
ApiImage.prototype.SetPlaceholder = function(oPlaceholder) { return true; };

/**
* Returns a placeholder from the current drawing object.
* @memberof ApiDrawing
* @returns {ApiPlaceholder | null} - returns null if placeholder doesn't exist.
*/
ApiImage.prototype.GetPlaceholder = function() { return new ApiPlaceholder(); };

/**
* Gets the x position of the drawing on the slide.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiImage.prototype.GetPosX = function() { return new EMU(); };

/**
* Gets the y position of the drawing on the slide.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiImage.prototype.GetPosY = function() { return new EMU(); };

/**
* Sets the x position of the drawing on the slide.
* @memberof ApiDrawing
* @param {EMU} posX - The distance from the left side of the slide to the left side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiImage.prototype.SetPosX = function(posX) { return true; };

/**
* Sets the y position of the drawing on the slide.
* @memberof ApiDrawing
* @param {EMU} posY - The distance from the top side of the slide to the upper side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiImage.prototype.SetPosY = function(posY) { return true; };

/**
* Replaces the placeholder by a drawing on the slide.
* @memberof ApiDrawing
* @param {Drawing} oDrawing
* @returns {boolean}
*/
ApiImage.prototype.ReplacePlaceholder = function(oDrawing) { return true; };

/**
* Returns an internal ID of the current drawing object.
* @memberof ApiDrawing
* @returns {string}
*/
ApiImage.prototype.GetInternalId = function() { return ""; };

/**
* Sets a hyperlink to the current drawing object (shape or image).
* Pass null to remove the hyperlink.
*
* @memberof ApiDrawing
*
* @param {ApiHyperlink | null} hyperlink - The hyperlink object to be set to the drawing, or null to remove the hyperlink.
*
* @returns {boolean} - Returns true if the hyperlink was set or removed successfully.
*/
ApiImage.prototype.SetHyperlink = function(hyperlink) { return true; };

/**
* Returns the hyperlink from the current drawing object (shape or image).
*
* @memberof ApiDrawing
*
* @returns {ApiHyperlink | null} - Returns the hyperlink object or null if no hyperlink is set.
*/
ApiImage.prototype.GetHyperlink = function() { return new ApiHyperlink(); };

/**
* Sets the size of the object (image, shape, chart) bounding box.
* @memberof ApiDrawing
* @param {EMU} nWidth - The object width measured in English measure units.
* @param {EMU} nHeight - The object height measured in English measure units.
*/
ApiImage.prototype.SetSize = function(nWidth, nHeight) {};

/**
* Deletes the specified drawing object from the parent.
* @memberof ApiDrawing
* @returns {boolean} - false if drawing doesn't exist or drawing hasn't a parent.
*/
ApiImage.prototype.Delete = function() { return true; };

/**
* Returns the width of the current drawing.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiImage.prototype.GetWidth = function() { return new EMU(); };

/**
* Returns the height of the current drawing.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiImage.prototype.GetHeight = function() { return new EMU(); };

/**
* Returns the name of the current drawing.
* @memberof ApiDrawing
* @returns {string}
* @since 9.3.0
*/
ApiImage.prototype.GetName = function() { return ""; };

/**
* Sets the name of the current drawing.
* If another drawing with the same name already exists, that drawing's name will be reset to a default auto-generated name.
* @memberof ApiDrawing
* @param {string} name - The name which will be set to the current drawing.
* @returns {boolean} - Returns true if the name was successfully set, otherwise returns false.
* @since 9.3.0
*/
ApiImage.prototype.SetName = function(name) { return true; };

/**
* Returns the lock value for the specified lock type of the current drawing.
* @memberof ApiDrawing
* @param {DrawingLockType} sType - Lock type in the string format.
* @returns {boolean}
*/
ApiImage.prototype.GetLockValue = function(sType) { return true; };

/**
* Sets the lock value to the specified lock type of the current drawing.
* @memberof ApiDrawing
* @param {DrawingLockType} sType - Lock type in the string format.
* @param {boolean} bValue - Specifies if the specified lock is applied to the current drawing.
* @returns {boolean}
*/
ApiImage.prototype.SetLockValue = function(sType, bValue) { return true; };

/**
* Converts the ApiDrawing object into the JSON object.
* @memberof ApiDrawing
* @returns {JSON}
*/
ApiImage.prototype.ToJSON = function() { return new JSON(); };

/**
* Selects the current graphic object.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} [isReplace=false] - Specifies whether the selection should replace the current selection (true) or be added to it (false).
* @returns {boolean}
*/
ApiImage.prototype.Select = function(isReplace) { return true; };

/**
* Removes the current graphic object from the selection.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean}
*/
ApiImage.prototype.Unselect = function() { return true; };

/**
* Sets the rotation angle to the current drawing object.
* @memberof ApiDrawing
* @param {number} nRotAngle - New drawing rotation angle.
* @returns {boolean}
* @since 9.0.0
*/
ApiImage.prototype.SetRotation = function(nRotAngle) { return true; };

/**
* Returns the rotation angle of the current drawing object.
* @memberof ApiDrawing
* @returns {number}
* @since 9.0.0
*/
ApiImage.prototype.GetRotation = function() { return 0; };

/**
* Get horizontal flip of current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean | null} Returns true if the figure is flipped horizontally, false if not, or null if the drawing properties are not available.
*/
ApiImage.prototype.GetFlipH = function() { return true; };

/**
* Get vertical flip of current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean | null} Returns true if the figure is flipped vertically, false if not, or null if the drawing properties are not available.
*/
ApiImage.prototype.GetFlipV = function() { return true; };

/**
* Sets the horizontal flip of the current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} bFlip - Specifies if the figure will be flipped horizontally or not.
* @returns {boolean} Returns true if the operation is successful, false otherwise.
*/
ApiImage.prototype.SetFlipH = function(bFlip) { return true; };

/**
* Sets the vertical flip of the current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} bFlip - Specifies if the figure will be flipped vertically or not.
* @returns {boolean} Returns true if the operation is successful, false otherwise.
*/
ApiImage.prototype.SetFlipV = function(bFlip) { return true; };

/**
* Sets the fill formatting properties to the current graphic object.
* @memberof ApiDrawing
* @param {ApiFill} oFill - The fill type used to fill the graphic object.
* @returns {boolean} - returns false if param is invalid.
* @since 9.3.0
*/
ApiImage.prototype.Fill = function(oFill) { return true; };

/**
* Sets the outline properties to the specified graphic object.
* @memberof ApiDrawing
* @param {ApiStroke} oStroke - The stroke used to create the graphic object outline.
* @returns {boolean} - returns false if param is invalid.
* @since 9.3.0
*/
ApiImage.prototype.SetOutLine = function(oStroke) { return true; };

/**
* Returns the type of the ApiShape class.
* @memberof ApiShape
* @returns {"shape"}
*/
ApiShape.prototype.GetClassType = function() { return ""; };

/**
* Deprecated in 6.2.
* Returns the shape inner contents where a paragraph or text runs can be inserted.
* @memberof ApiShape
* @returns {?ApiDocumentContent}
*/
ApiShape.prototype.GetDocContent = function() { return new ApiDocumentContent(); };

/**
* Returns the shape inner contents where a paragraph or text runs can be inserted.
* @memberof ApiShape
* @returns {?ApiDocumentContent}
*/
ApiShape.prototype.GetContent = function() { return new ApiDocumentContent(); };

/**
* Sets the vertical alignment to the shape content where a paragraph or text runs can be inserted.
* @memberof ApiShape
* @param {VerticalTextAlign} verticalAlign - The type of the vertical alignment for the shape inner contents.
*/
ApiShape.prototype.SetVerticalTextAlign = function(verticalAlign) {};

/**
* Returns the geometry object from the current shape.
* @memberof ApiShape
* @returns {ApiGeometry}
* @since 9.1.0
*/
ApiShape.prototype.GetGeometry = function() { return new ApiGeometry(); };

/**
* Sets a custom geometry for the current shape.
* @memberof ApiShape
* @param {ApiGeometry} oGeometry - The geometry to set.
* @returns {boolean}
* @since 9.1.0
*/
ApiShape.prototype.SetGeometry = function(oGeometry) { return true; };

/**
* Sets the fill properties to the current shape.
* @memberof ApiShape
* @param {ApiFill} oFill - The fill type used to fill the shape.
* @returns {boolean} - returns false if param is invalid.
*/
ApiShape.prototype.SetFill = function(oFill) { return true; };

/**
* Gets the fill properties from the current shape.
* @memberof ApiShape
* @returns {ApiFill | null}
*/
ApiShape.prototype.GetFill = function() { return new ApiFill(); };

/**
* Sets the outline properties to the current shape.
* @memberof ApiShape
* @param {ApiStroke} oStroke - The stroke used to create the shape outline.
* @returns {boolean} - returns false if param is invalid.
*/
ApiShape.prototype.SetLine = function(oStroke) { return true; };

/**
* Gets the outline properties from the current shape.
* @memberof ApiShape
* @returns {ApiStroke | null}
*/
ApiShape.prototype.GetLine = function() { return new ApiStroke(); };

/**
* Sets the text paddings to the current shape.
* @memberof ApiShape
* @param {?EMU} nLeft - Left padding.
* @param {?EMU} nTop - Top padding.
* @param {?EMU} nRight - Right padding.
* @param {?EMU} nBottom - Bottom padding.
* @returns {boolean}
* @since 9.3.0
*/
ApiShape.prototype.SetPaddings = function(nLeft, nTop, nRight, nBottom) { return true; };

/**
* Creates a copy of the specified shape.
* @memberof ApiShape
* @returns {ApiShape} - return null if drawing doesn't exist.
* @since 9.4.0
*/
ApiShape.prototype.Copy = function() { return new ApiShape(); };

/**
* Sets the position of the drawing on the slide.
* @memberof ApiDrawing
* @param {EMU} nPosX - The distance from the left side of the slide to the left side of the drawing measured in English measure units.
* @param {EMU} nPosY - The distance from the top side of the slide to the upper side of the drawing measured in English measure units.
*/
ApiShape.prototype.SetPosition = function(nPosX, nPosY) {};

/**
* Returns the drawing parent object.
* @memberof ApiDrawing
* @returns {ApiSlide | ApiLayout | ApiMaster | null}
*/
ApiShape.prototype.GetParent = function() { return new ApiSlide(); };

/**
* Returns the drawing parent slide.
* @memberof ApiDrawing
* @returns {ApiSlide | null} - return null if parent ins't a slide.
*/
ApiShape.prototype.GetParentSlide = function() { return new ApiSlide(); };

/**
* Returns the drawing parent slide layout.
* @memberof ApiDrawing
* @returns {ApiLayout | null} - return null if parent ins't a slide layout.
*/
ApiShape.prototype.GetParentLayout = function() { return new ApiLayout(); };

/**
* Returns the drawing parent slide master.
* @memberof ApiDrawing
* @returns {ApiMaster | null} - return null if parent ins't a slide master.
*/
ApiShape.prototype.GetParentMaster = function() { return new ApiMaster(); };

/**
* Sets the specified placeholder to the current drawing object.
* @memberof ApiDrawing
* @param {ApiPlaceholder} oPlaceholder - Placeholder object.
* @returns {boolean} - returns false if parameter isn't a placeholder.
*/
ApiShape.prototype.SetPlaceholder = function(oPlaceholder) { return true; };

/**
* Returns a placeholder from the current drawing object.
* @memberof ApiDrawing
* @returns {ApiPlaceholder | null} - returns null if placeholder doesn't exist.
*/
ApiShape.prototype.GetPlaceholder = function() { return new ApiPlaceholder(); };

/**
* Gets the x position of the drawing on the slide.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiShape.prototype.GetPosX = function() { return new EMU(); };

/**
* Gets the y position of the drawing on the slide.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiShape.prototype.GetPosY = function() { return new EMU(); };

/**
* Sets the x position of the drawing on the slide.
* @memberof ApiDrawing
* @param {EMU} posX - The distance from the left side of the slide to the left side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiShape.prototype.SetPosX = function(posX) { return true; };

/**
* Sets the y position of the drawing on the slide.
* @memberof ApiDrawing
* @param {EMU} posY - The distance from the top side of the slide to the upper side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiShape.prototype.SetPosY = function(posY) { return true; };

/**
* Replaces the placeholder by a drawing on the slide.
* @memberof ApiDrawing
* @param {Drawing} oDrawing
* @returns {boolean}
*/
ApiShape.prototype.ReplacePlaceholder = function(oDrawing) { return true; };

/**
* Returns an internal ID of the current drawing object.
* @memberof ApiDrawing
* @returns {string}
*/
ApiShape.prototype.GetInternalId = function() { return ""; };

/**
* Sets a hyperlink to the current drawing object (shape or image).
* Pass null to remove the hyperlink.
*
* @memberof ApiDrawing
*
* @param {ApiHyperlink | null} hyperlink - The hyperlink object to be set to the drawing, or null to remove the hyperlink.
*
* @returns {boolean} - Returns true if the hyperlink was set or removed successfully.
*/
ApiShape.prototype.SetHyperlink = function(hyperlink) { return true; };

/**
* Returns the hyperlink from the current drawing object (shape or image).
*
* @memberof ApiDrawing
*
* @returns {ApiHyperlink | null} - Returns the hyperlink object or null if no hyperlink is set.
*/
ApiShape.prototype.GetHyperlink = function() { return new ApiHyperlink(); };

/**
* Sets the size of the object (image, shape, chart) bounding box.
* @memberof ApiDrawing
* @param {EMU} nWidth - The object width measured in English measure units.
* @param {EMU} nHeight - The object height measured in English measure units.
*/
ApiShape.prototype.SetSize = function(nWidth, nHeight) {};

/**
* Deletes the specified drawing object from the parent.
* @memberof ApiDrawing
* @returns {boolean} - false if drawing doesn't exist or drawing hasn't a parent.
*/
ApiShape.prototype.Delete = function() { return true; };

/**
* Returns the width of the current drawing.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiShape.prototype.GetWidth = function() { return new EMU(); };

/**
* Returns the height of the current drawing.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiShape.prototype.GetHeight = function() { return new EMU(); };

/**
* Returns the name of the current drawing.
* @memberof ApiDrawing
* @returns {string}
* @since 9.3.0
*/
ApiShape.prototype.GetName = function() { return ""; };

/**
* Sets the name of the current drawing.
* If another drawing with the same name already exists, that drawing's name will be reset to a default auto-generated name.
* @memberof ApiDrawing
* @param {string} name - The name which will be set to the current drawing.
* @returns {boolean} - Returns true if the name was successfully set, otherwise returns false.
* @since 9.3.0
*/
ApiShape.prototype.SetName = function(name) { return true; };

/**
* Returns the lock value for the specified lock type of the current drawing.
* @memberof ApiDrawing
* @param {DrawingLockType} sType - Lock type in the string format.
* @returns {boolean}
*/
ApiShape.prototype.GetLockValue = function(sType) { return true; };

/**
* Sets the lock value to the specified lock type of the current drawing.
* @memberof ApiDrawing
* @param {DrawingLockType} sType - Lock type in the string format.
* @param {boolean} bValue - Specifies if the specified lock is applied to the current drawing.
* @returns {boolean}
*/
ApiShape.prototype.SetLockValue = function(sType, bValue) { return true; };

/**
* Converts the ApiDrawing object into the JSON object.
* @memberof ApiDrawing
* @returns {JSON}
*/
ApiShape.prototype.ToJSON = function() { return new JSON(); };

/**
* Selects the current graphic object.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} [isReplace=false] - Specifies whether the selection should replace the current selection (true) or be added to it (false).
* @returns {boolean}
*/
ApiShape.prototype.Select = function(isReplace) { return true; };

/**
* Removes the current graphic object from the selection.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean}
*/
ApiShape.prototype.Unselect = function() { return true; };

/**
* Sets the rotation angle to the current drawing object.
* @memberof ApiDrawing
* @param {number} nRotAngle - New drawing rotation angle.
* @returns {boolean}
* @since 9.0.0
*/
ApiShape.prototype.SetRotation = function(nRotAngle) { return true; };

/**
* Returns the rotation angle of the current drawing object.
* @memberof ApiDrawing
* @returns {number}
* @since 9.0.0
*/
ApiShape.prototype.GetRotation = function() { return 0; };

/**
* Get horizontal flip of current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean | null} Returns true if the figure is flipped horizontally, false if not, or null if the drawing properties are not available.
*/
ApiShape.prototype.GetFlipH = function() { return true; };

/**
* Get vertical flip of current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean | null} Returns true if the figure is flipped vertically, false if not, or null if the drawing properties are not available.
*/
ApiShape.prototype.GetFlipV = function() { return true; };

/**
* Sets the horizontal flip of the current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} bFlip - Specifies if the figure will be flipped horizontally or not.
* @returns {boolean} Returns true if the operation is successful, false otherwise.
*/
ApiShape.prototype.SetFlipH = function(bFlip) { return true; };

/**
* Sets the vertical flip of the current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} bFlip - Specifies if the figure will be flipped vertically or not.
* @returns {boolean} Returns true if the operation is successful, false otherwise.
*/
ApiShape.prototype.SetFlipV = function(bFlip) { return true; };

/**
* Sets the fill formatting properties to the current graphic object.
* @memberof ApiDrawing
* @param {ApiFill} oFill - The fill type used to fill the graphic object.
* @returns {boolean} - returns false if param is invalid.
* @since 9.3.0
*/
ApiShape.prototype.Fill = function(oFill) { return true; };

/**
* Sets the outline properties to the specified graphic object.
* @memberof ApiDrawing
* @param {ApiStroke} oStroke - The stroke used to create the graphic object outline.
* @returns {boolean} - returns false if param is invalid.
* @since 9.3.0
*/
ApiShape.prototype.SetOutLine = function(oStroke) { return true; };

/**
* Returns a type of the ApiOleObject class.
* @memberof ApiOleObject
* @returns {"oleObject"}
*/
ApiOleObject.prototype.GetClassType = function() { return ""; };

/**
* Sets the data to the current OLE object.
* @memberof ApiOleObject
* @param {string} sData - The OLE object string data.
* @returns {boolean}
*/
ApiOleObject.prototype.SetData = function(sData) { return true; };

/**
* Returns the string data from the current OLE object.
* @memberof ApiOleObject
* @returns {string}
*/
ApiOleObject.prototype.GetData = function() { return ""; };

/**
* Sets the application ID to the current OLE object.
* @memberof ApiOleObject
* @param {string} sAppId - The application ID associated with the current OLE object.
* @returns {boolean}
*/
ApiOleObject.prototype.SetApplicationId = function(sAppId) { return true; };

/**
* Returns the application ID from the current OLE object.
* @memberof ApiOleObject
* @returns {string}
*/
ApiOleObject.prototype.GetApplicationId = function() { return ""; };

/**
* Creates a copy of the specified OLE object.
* @memberof ApiOleObject
* @returns {ApiOleObject} - return null if drawing doesn't exist.
* @since 9.4.0
*/
ApiOleObject.prototype.Copy = function() { return new ApiOleObject(); };

/**
* Sets the position of the drawing on the slide.
* @memberof ApiDrawing
* @param {EMU} nPosX - The distance from the left side of the slide to the left side of the drawing measured in English measure units.
* @param {EMU} nPosY - The distance from the top side of the slide to the upper side of the drawing measured in English measure units.
*/
ApiOleObject.prototype.SetPosition = function(nPosX, nPosY) {};

/**
* Returns the drawing parent object.
* @memberof ApiDrawing
* @returns {ApiSlide | ApiLayout | ApiMaster | null}
*/
ApiOleObject.prototype.GetParent = function() { return new ApiSlide(); };

/**
* Returns the drawing parent slide.
* @memberof ApiDrawing
* @returns {ApiSlide | null} - return null if parent ins't a slide.
*/
ApiOleObject.prototype.GetParentSlide = function() { return new ApiSlide(); };

/**
* Returns the drawing parent slide layout.
* @memberof ApiDrawing
* @returns {ApiLayout | null} - return null if parent ins't a slide layout.
*/
ApiOleObject.prototype.GetParentLayout = function() { return new ApiLayout(); };

/**
* Returns the drawing parent slide master.
* @memberof ApiDrawing
* @returns {ApiMaster | null} - return null if parent ins't a slide master.
*/
ApiOleObject.prototype.GetParentMaster = function() { return new ApiMaster(); };

/**
* Sets the specified placeholder to the current drawing object.
* @memberof ApiDrawing
* @param {ApiPlaceholder} oPlaceholder - Placeholder object.
* @returns {boolean} - returns false if parameter isn't a placeholder.
*/
ApiOleObject.prototype.SetPlaceholder = function(oPlaceholder) { return true; };

/**
* Returns a placeholder from the current drawing object.
* @memberof ApiDrawing
* @returns {ApiPlaceholder | null} - returns null if placeholder doesn't exist.
*/
ApiOleObject.prototype.GetPlaceholder = function() { return new ApiPlaceholder(); };

/**
* Gets the x position of the drawing on the slide.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiOleObject.prototype.GetPosX = function() { return new EMU(); };

/**
* Gets the y position of the drawing on the slide.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiOleObject.prototype.GetPosY = function() { return new EMU(); };

/**
* Sets the x position of the drawing on the slide.
* @memberof ApiDrawing
* @param {EMU} posX - The distance from the left side of the slide to the left side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiOleObject.prototype.SetPosX = function(posX) { return true; };

/**
* Sets the y position of the drawing on the slide.
* @memberof ApiDrawing
* @param {EMU} posY - The distance from the top side of the slide to the upper side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiOleObject.prototype.SetPosY = function(posY) { return true; };

/**
* Replaces the placeholder by a drawing on the slide.
* @memberof ApiDrawing
* @param {Drawing} oDrawing
* @returns {boolean}
*/
ApiOleObject.prototype.ReplacePlaceholder = function(oDrawing) { return true; };

/**
* Returns an internal ID of the current drawing object.
* @memberof ApiDrawing
* @returns {string}
*/
ApiOleObject.prototype.GetInternalId = function() { return ""; };

/**
* Sets a hyperlink to the current drawing object (shape or image).
* Pass null to remove the hyperlink.
*
* @memberof ApiDrawing
*
* @param {ApiHyperlink | null} hyperlink - The hyperlink object to be set to the drawing, or null to remove the hyperlink.
*
* @returns {boolean} - Returns true if the hyperlink was set or removed successfully.
*/
ApiOleObject.prototype.SetHyperlink = function(hyperlink) { return true; };

/**
* Returns the hyperlink from the current drawing object (shape or image).
*
* @memberof ApiDrawing
*
* @returns {ApiHyperlink | null} - Returns the hyperlink object or null if no hyperlink is set.
*/
ApiOleObject.prototype.GetHyperlink = function() { return new ApiHyperlink(); };

/**
* Sets the size of the object (image, shape, chart) bounding box.
* @memberof ApiDrawing
* @param {EMU} nWidth - The object width measured in English measure units.
* @param {EMU} nHeight - The object height measured in English measure units.
*/
ApiOleObject.prototype.SetSize = function(nWidth, nHeight) {};

/**
* Deletes the specified drawing object from the parent.
* @memberof ApiDrawing
* @returns {boolean} - false if drawing doesn't exist or drawing hasn't a parent.
*/
ApiOleObject.prototype.Delete = function() { return true; };

/**
* Returns the width of the current drawing.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiOleObject.prototype.GetWidth = function() { return new EMU(); };

/**
* Returns the height of the current drawing.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiOleObject.prototype.GetHeight = function() { return new EMU(); };

/**
* Returns the name of the current drawing.
* @memberof ApiDrawing
* @returns {string}
* @since 9.3.0
*/
ApiOleObject.prototype.GetName = function() { return ""; };

/**
* Sets the name of the current drawing.
* If another drawing with the same name already exists, that drawing's name will be reset to a default auto-generated name.
* @memberof ApiDrawing
* @param {string} name - The name which will be set to the current drawing.
* @returns {boolean} - Returns true if the name was successfully set, otherwise returns false.
* @since 9.3.0
*/
ApiOleObject.prototype.SetName = function(name) { return true; };

/**
* Returns the lock value for the specified lock type of the current drawing.
* @memberof ApiDrawing
* @param {DrawingLockType} sType - Lock type in the string format.
* @returns {boolean}
*/
ApiOleObject.prototype.GetLockValue = function(sType) { return true; };

/**
* Sets the lock value to the specified lock type of the current drawing.
* @memberof ApiDrawing
* @param {DrawingLockType} sType - Lock type in the string format.
* @param {boolean} bValue - Specifies if the specified lock is applied to the current drawing.
* @returns {boolean}
*/
ApiOleObject.prototype.SetLockValue = function(sType, bValue) { return true; };

/**
* Converts the ApiDrawing object into the JSON object.
* @memberof ApiDrawing
* @returns {JSON}
*/
ApiOleObject.prototype.ToJSON = function() { return new JSON(); };

/**
* Selects the current graphic object.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} [isReplace=false] - Specifies whether the selection should replace the current selection (true) or be added to it (false).
* @returns {boolean}
*/
ApiOleObject.prototype.Select = function(isReplace) { return true; };

/**
* Removes the current graphic object from the selection.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean}
*/
ApiOleObject.prototype.Unselect = function() { return true; };

/**
* Sets the rotation angle to the current drawing object.
* @memberof ApiDrawing
* @param {number} nRotAngle - New drawing rotation angle.
* @returns {boolean}
* @since 9.0.0
*/
ApiOleObject.prototype.SetRotation = function(nRotAngle) { return true; };

/**
* Returns the rotation angle of the current drawing object.
* @memberof ApiDrawing
* @returns {number}
* @since 9.0.0
*/
ApiOleObject.prototype.GetRotation = function() { return 0; };

/**
* Get horizontal flip of current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean | null} Returns true if the figure is flipped horizontally, false if not, or null if the drawing properties are not available.
*/
ApiOleObject.prototype.GetFlipH = function() { return true; };

/**
* Get vertical flip of current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean | null} Returns true if the figure is flipped vertically, false if not, or null if the drawing properties are not available.
*/
ApiOleObject.prototype.GetFlipV = function() { return true; };

/**
* Sets the horizontal flip of the current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} bFlip - Specifies if the figure will be flipped horizontally or not.
* @returns {boolean} Returns true if the operation is successful, false otherwise.
*/
ApiOleObject.prototype.SetFlipH = function(bFlip) { return true; };

/**
* Sets the vertical flip of the current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} bFlip - Specifies if the figure will be flipped vertically or not.
* @returns {boolean} Returns true if the operation is successful, false otherwise.
*/
ApiOleObject.prototype.SetFlipV = function(bFlip) { return true; };

/**
* Sets the fill formatting properties to the current graphic object.
* @memberof ApiDrawing
* @param {ApiFill} oFill - The fill type used to fill the graphic object.
* @returns {boolean} - returns false if param is invalid.
* @since 9.3.0
*/
ApiOleObject.prototype.Fill = function(oFill) { return true; };

/**
* Sets the outline properties to the specified graphic object.
* @memberof ApiDrawing
* @param {ApiStroke} oStroke - The stroke used to create the graphic object outline.
* @returns {boolean} - returns false if param is invalid.
* @since 9.3.0
*/
ApiOleObject.prototype.SetOutLine = function(oStroke) { return true; };

/**
* Returns the type of the ApiTable object.
* @memberof ApiTable
* @returns {"table"}
*/
ApiTable.prototype.GetClassType = function() { return ""; };

/**
* Returns a row by its index.
* @memberof ApiTable
* @param nIndex {number} - The row index (position) in the table.
* @returns {?ApiTableRow}
*/
ApiTable.prototype.GetRow = function(nIndex) { return new ApiTableRow(); };

/**
* Merges an array of cells. If merge is successful, it will return merged cell, otherwise "null".
* <b>Warning</b>: The number of cells in any row and the number of rows in the current table may be changed.
* @memberof ApiTable
* @param {ApiTableCell[]} aCells - The array of cells.
* @returns {?ApiTableCell}
*/
ApiTable.prototype.MergeCells = function(aCells) { return new ApiTableCell(); };

/**
* Specifies the components of the conditional formatting of the referenced table style (if one exists)
* which shall be applied to the set of table rows with the current table-level property exceptions. A table style
* can specify up to six different optional conditional formats [Example: Different formatting for first column],
* which then can be applied or omitted from individual table rows in the parent table.
*
* The default setting is to apply the row and column banding formatting, but not the first row, last row, first
* column, or last column formatting.
* @memberof ApiTable
* @param {boolean} isFirstColumn - Specifies that the first column conditional formatting shall be applied to the
*     table.
* @param {boolean} isFirstRow - Specifies that the first row conditional formatting shall be applied to the table.
* @param {boolean} isLastColumn - Specifies that the last column conditional formatting shall be applied to the
*     table.
* @param {boolean} isLastRow - Specifies that the last row conditional formatting shall be applied to the table.
* @param {boolean} isHorBand - Specifies that the horizontal banding conditional formatting shall not be applied
*     to the table.
* @param {boolean} isVerBand - Specifies that the vertical banding conditional formatting shall not be applied to
*     the table.
*/
ApiTable.prototype.SetTableLook = function(isFirstColumn, isFirstRow, isLastColumn, isLastRow, isHorBand, isVerBand) {};

/**
* Adds a new row to the current table.
* @memberof ApiTable
* @param {ApiTableCell} [oCell] - If not specified, a new row will be added to the end of the table.
* @param {boolean} [isBefore=false] - Adds a new row before or after the specified cell. If no cell is specified,
* then this parameter will be ignored.
* @returns {ApiTableRow}
*/
ApiTable.prototype.AddRow = function(oCell, isBefore) { return new ApiTableRow(); };

/**
* Adds a new column to the end of the current table.
* @memberof ApiTable
* @param {ApiTableCell} [oCell] - If not specified, a new column will be added to the end of the table.
* @param {boolean} [isBefore=false] - Add a new column before or after the specified cell. If no cell is specified,
* then this parameter will be ignored.
*/
ApiTable.prototype.AddColumn = function(oCell, isBefore) {};

/**
* Removes a table row with the specified cell.
* @memberof ApiTable
* @param {ApiTableCell} oCell - The table cell from the row which will be removed.
* @returns {boolean} - defines if the table is empty after removing or not.
*/
ApiTable.prototype.RemoveRow = function(oCell) { return true; };

/**
* Removes a table column with the specified cell.
* @memberof ApiTable
* @param {ApiTableCell} oCell - The table cell from the column which will be removed.
* @returns {boolean} - defines if the table is empty after removing or not.
*/
ApiTable.prototype.RemoveColumn = function(oCell) { return true; };

/**
* Specifies the shading which shall be applied to the extents of the current table.
* @memberof ApiTable
* @param {ShdType | ApiFill} sType - The shading type applied to the contents of the current table. Can be ShdType or ApiFill.
* @param {byte} r - Red color component value.
* @param {byte} g - Green color component value.
* @param {byte} b - Blue color component value.
*/
ApiTable.prototype.SetShd = function(sType, r, g, b) {};

/**
* Sets the table size.
* @memberof ApiTable
* @param {EMU} width - The table width measured in English measure units.
* @param {EMU} height - The table height measured in English measure units.
*/
ApiTable.prototype.SetSize = function(width, height) {};

/**
* Sets the width of the specified column in the current table.
*
* @memberof ApiTable
*
* @param {number} columnIndex - The zero-based column index.
* @param {EMU} width - The column width measured in English measure units.
* @returns {EMU | null} - Returns the actual column width set (in EMU), or null if the column index is invalid.
*
* @since 9.4.0
*/
ApiTable.prototype.SetColumnWidth = function(columnIndex, width) { return new EMU(); };

/**
* Returns the width of the specified column (by index) of the current table.
*
* @memberof ApiTable
*
* @param {number} columnIndex - The zero-based column index.
* @returns {EMU | null}
*
* @since 9.4.0
*/
ApiTable.prototype.GetColumnWidth = function(columnIndex) { return new EMU(); };

/**
* Converts the ApiTable object into the JSON object.
* @memberof ApiTable
* @param {boolean} [bWriteTableStyles=false] - Specifies whether to write used table styles to the JSON object (true) or not (false).
* @returns {JSON}
*/
ApiTable.prototype.ToJSON = function(bWriteTableStyles) { return new JSON(); };

/**
* Creates a copy of the specified table.
* @memberof ApiTable
* @returns {ApiTable} - return null if drawing doesn't exist.
* @since 9.4.0
*/
ApiTable.prototype.Copy = function() { return new ApiTable(); };

/**
* Sets the position of the drawing on the slide.
* @memberof ApiDrawing
* @param {EMU} nPosX - The distance from the left side of the slide to the left side of the drawing measured in English measure units.
* @param {EMU} nPosY - The distance from the top side of the slide to the upper side of the drawing measured in English measure units.
*/
ApiTable.prototype.SetPosition = function(nPosX, nPosY) {};

/**
* Returns the drawing parent object.
* @memberof ApiDrawing
* @returns {ApiSlide | ApiLayout | ApiMaster | null}
*/
ApiTable.prototype.GetParent = function() { return new ApiSlide(); };

/**
* Returns the drawing parent slide.
* @memberof ApiDrawing
* @returns {ApiSlide | null} - return null if parent ins't a slide.
*/
ApiTable.prototype.GetParentSlide = function() { return new ApiSlide(); };

/**
* Returns the drawing parent slide layout.
* @memberof ApiDrawing
* @returns {ApiLayout | null} - return null if parent ins't a slide layout.
*/
ApiTable.prototype.GetParentLayout = function() { return new ApiLayout(); };

/**
* Returns the drawing parent slide master.
* @memberof ApiDrawing
* @returns {ApiMaster | null} - return null if parent ins't a slide master.
*/
ApiTable.prototype.GetParentMaster = function() { return new ApiMaster(); };

/**
* Sets the specified placeholder to the current drawing object.
* @memberof ApiDrawing
* @param {ApiPlaceholder} oPlaceholder - Placeholder object.
* @returns {boolean} - returns false if parameter isn't a placeholder.
*/
ApiTable.prototype.SetPlaceholder = function(oPlaceholder) { return true; };

/**
* Returns a placeholder from the current drawing object.
* @memberof ApiDrawing
* @returns {ApiPlaceholder | null} - returns null if placeholder doesn't exist.
*/
ApiTable.prototype.GetPlaceholder = function() { return new ApiPlaceholder(); };

/**
* Gets the x position of the drawing on the slide.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiTable.prototype.GetPosX = function() { return new EMU(); };

/**
* Gets the y position of the drawing on the slide.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiTable.prototype.GetPosY = function() { return new EMU(); };

/**
* Sets the x position of the drawing on the slide.
* @memberof ApiDrawing
* @param {EMU} posX - The distance from the left side of the slide to the left side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiTable.prototype.SetPosX = function(posX) { return true; };

/**
* Sets the y position of the drawing on the slide.
* @memberof ApiDrawing
* @param {EMU} posY - The distance from the top side of the slide to the upper side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiTable.prototype.SetPosY = function(posY) { return true; };

/**
* Replaces the placeholder by a drawing on the slide.
* @memberof ApiDrawing
* @param {Drawing} oDrawing
* @returns {boolean}
*/
ApiTable.prototype.ReplacePlaceholder = function(oDrawing) { return true; };

/**
* Returns an internal ID of the current drawing object.
* @memberof ApiDrawing
* @returns {string}
*/
ApiTable.prototype.GetInternalId = function() { return ""; };

/**
* Sets a hyperlink to the current drawing object (shape or image).
* Pass null to remove the hyperlink.
*
* @memberof ApiDrawing
*
* @param {ApiHyperlink | null} hyperlink - The hyperlink object to be set to the drawing, or null to remove the hyperlink.
*
* @returns {boolean} - Returns true if the hyperlink was set or removed successfully.
*/
ApiTable.prototype.SetHyperlink = function(hyperlink) { return true; };

/**
* Returns the hyperlink from the current drawing object (shape or image).
*
* @memberof ApiDrawing
*
* @returns {ApiHyperlink | null} - Returns the hyperlink object or null if no hyperlink is set.
*/
ApiTable.prototype.GetHyperlink = function() { return new ApiHyperlink(); };

/**
* Deletes the specified drawing object from the parent.
* @memberof ApiDrawing
* @returns {boolean} - false if drawing doesn't exist or drawing hasn't a parent.
*/
ApiTable.prototype.Delete = function() { return true; };

/**
* Returns the width of the current drawing.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiTable.prototype.GetWidth = function() { return new EMU(); };

/**
* Returns the height of the current drawing.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiTable.prototype.GetHeight = function() { return new EMU(); };

/**
* Returns the name of the current drawing.
* @memberof ApiDrawing
* @returns {string}
* @since 9.3.0
*/
ApiTable.prototype.GetName = function() { return ""; };

/**
* Sets the name of the current drawing.
* If another drawing with the same name already exists, that drawing's name will be reset to a default auto-generated name.
* @memberof ApiDrawing
* @param {string} name - The name which will be set to the current drawing.
* @returns {boolean} - Returns true if the name was successfully set, otherwise returns false.
* @since 9.3.0
*/
ApiTable.prototype.SetName = function(name) { return true; };

/**
* Returns the lock value for the specified lock type of the current drawing.
* @memberof ApiDrawing
* @param {DrawingLockType} sType - Lock type in the string format.
* @returns {boolean}
*/
ApiTable.prototype.GetLockValue = function(sType) { return true; };

/**
* Sets the lock value to the specified lock type of the current drawing.
* @memberof ApiDrawing
* @param {DrawingLockType} sType - Lock type in the string format.
* @param {boolean} bValue - Specifies if the specified lock is applied to the current drawing.
* @returns {boolean}
*/
ApiTable.prototype.SetLockValue = function(sType, bValue) { return true; };

/**
* Selects the current graphic object.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} [isReplace=false] - Specifies whether the selection should replace the current selection (true) or be added to it (false).
* @returns {boolean}
*/
ApiTable.prototype.Select = function(isReplace) { return true; };

/**
* Removes the current graphic object from the selection.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean}
*/
ApiTable.prototype.Unselect = function() { return true; };

/**
* Sets the rotation angle to the current drawing object.
* @memberof ApiDrawing
* @param {number} nRotAngle - New drawing rotation angle.
* @returns {boolean}
* @since 9.0.0
*/
ApiTable.prototype.SetRotation = function(nRotAngle) { return true; };

/**
* Returns the rotation angle of the current drawing object.
* @memberof ApiDrawing
* @returns {number}
* @since 9.0.0
*/
ApiTable.prototype.GetRotation = function() { return 0; };

/**
* Get horizontal flip of current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean | null} Returns true if the figure is flipped horizontally, false if not, or null if the drawing properties are not available.
*/
ApiTable.prototype.GetFlipH = function() { return true; };

/**
* Get vertical flip of current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean | null} Returns true if the figure is flipped vertically, false if not, or null if the drawing properties are not available.
*/
ApiTable.prototype.GetFlipV = function() { return true; };

/**
* Sets the horizontal flip of the current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} bFlip - Specifies if the figure will be flipped horizontally or not.
* @returns {boolean} Returns true if the operation is successful, false otherwise.
*/
ApiTable.prototype.SetFlipH = function(bFlip) { return true; };

/**
* Sets the vertical flip of the current drawing.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} bFlip - Specifies if the figure will be flipped vertically or not.
* @returns {boolean} Returns true if the operation is successful, false otherwise.
*/
ApiTable.prototype.SetFlipV = function(bFlip) { return true; };

/**
* Sets the fill formatting properties to the current graphic object.
* @memberof ApiDrawing
* @param {ApiFill} oFill - The fill type used to fill the graphic object.
* @returns {boolean} - returns false if param is invalid.
* @since 9.3.0
*/
ApiTable.prototype.Fill = function(oFill) { return true; };

/**
* Sets the outline properties to the specified graphic object.
* @memberof ApiDrawing
* @param {ApiStroke} oStroke - The stroke used to create the graphic object outline.
* @returns {boolean} - returns false if param is invalid.
* @since 9.3.0
*/
ApiTable.prototype.SetOutLine = function(oStroke) { return true; };

/**
* Returns the type of the ApiTableRow class.
* @memberof ApiTableRow
* @returns {"tableRow"}
*/
ApiTableRow.prototype.GetClassType = function() { return ""; };

/**
* Returns a number of cells in the current row.
* @memberof ApiTableRow
* @returns {number}
*/
ApiTableRow.prototype.GetCellsCount = function() { return 0; };

/**
* Returns a cell by its position in the current row.
* @memberof ApiTableRow
* @param {number} nPos - The cell position in the table row.
* @returns {ApiTableCell}
*/
ApiTableRow.prototype.GetCell = function(nPos) { return new ApiTableCell(); };

/**
* Sets the height to the current table row.
*
* @memberof ApiTableRow
*
* @param {EMU} [nValue] - The row height in English measure units.
* @returns {EMU | null}
* 
* @since 5.1.0
*/
ApiTableRow.prototype.SetHeight = function(nValue) { return new EMU(); };

/**
* Returns the height of the current table row.
*
* @memberof ApiTableRow
*
* @returns {EMU | null}
*
* @since 9.4.0
*/
ApiTableRow.prototype.GetHeight = function() { return new EMU(); };

/**
* Returns the type of the ApiTableCell class.
* @memberof ApiTableCell
* @returns {"tableCell"}
*/
ApiTableCell.prototype.GetClassType = function() { return ""; };

/**
* Returns the current cell content.
* @memberof ApiTableCell
* @returns {ApiDocumentContent}
*/
ApiTableCell.prototype.GetContent = function() { return new ApiDocumentContent(); };

/**
* Specifies the shading which shall be applied to the extents of the current table cell.
* @memberof ApiTableCell
* @param {ShdType | ApiFill} sType - The shading type applied to the contents of the current table. Can be ShdType or ApiFill.
* @param {byte} r - Red color component value.
* @param {byte} g - Green color component value.
* @param {byte} b - Blue color component value.
*/
ApiTableCell.prototype.SetShd = function(sType, r, g, b) {};

/**
* Specifies an amount of space which shall be left between the bottom extent of the cell contents and the border
* of a specific individual table cell within a table.
* @memberof ApiTableCell
* @param {?twips} nValue - If this value is <code>null</code>, then default table cell bottom margin shall be used,
* otherwise override the table cell bottom margin with specified value for the current cell.
*/
ApiTableCell.prototype.SetCellMarginBottom = function(nValue) {};

/**
* Specifies an amount of space which shall be left between the left extent of the current cell contents and the
* left edge border of a specific individual table cell within a table.
* @memberof ApiTableCell
* @param {?twips} nValue - If this value is <code>null</code>, then default table cell left margin shall be used,
* otherwise override the table cell left margin with specified value for the current cell.
*/
ApiTableCell.prototype.SetCellMarginLeft = function(nValue) {};

/**
* Specifies an amount of space which shall be left between the right extent of the current cell contents and the
* right edge border of a specific individual table cell within a table.
* @memberof ApiTableCell
* @param {?twips} nValue - If this value is <code>null</code>, then default table cell right margin shall be used,
* otherwise override the table cell right margin with specified value for the current cell.
*/
ApiTableCell.prototype.SetCellMarginRight = function(nValue) {};

/**
* Specifies an amount of space which shall be left between the top extent of the current cell contents and the
* top edge border of a specific individual table cell within a table.
* @memberof ApiTableCell
* @param {?twips} nValue - If this value is <code>null</code>, then default table cell top margin shall be used,
* otherwise override the table cell top margin with specified value for the current cell.
*/
ApiTableCell.prototype.SetCellMarginTop = function(nValue) {};

/**
* Sets the border which shall be displayed at the bottom of the current table cell.
* @memberof ApiTableCell
* @param {mm} fSize - The width of the current border.
* @param {ApiFill} oApiFill - The color or pattern used to fill the current border.
*/
ApiTableCell.prototype.SetCellBorderBottom = function(fSize, oApiFill) {};

/**
* Sets the border which shall be displayed at the left of the current table cell.
* @memberof ApiTableCell
* @param {mm} fSize - The width of the current border.
* @param {ApiFill} oApiFill - The color or pattern used to fill the current border.
*/
ApiTableCell.prototype.SetCellBorderLeft = function(fSize, oApiFill) {};

/**
* Sets the border which shall be displayed at the right of the current table cell.
* @memberof ApiTableCell
* @param {mm} fSize - The width of the current border.
* @param {ApiFill} oApiFill - The color or pattern used to fill the current border.
*/
ApiTableCell.prototype.SetCellBorderRight = function(fSize, oApiFill) {};

/**
* Sets the border which shall be displayed at the top of the current table cell.
* @memberof ApiTableCell
* @param {mm} fSize - The width of the current border.
* @param {ApiFill} oApiFill - The color or pattern used to fill the current border.
*/
ApiTableCell.prototype.SetCellBorderTop = function(fSize, oApiFill) {};

/**
* Specifies the vertical alignment for text within the current table cell.
* @memberof ApiTableCell
* @param {VerticalTextAlign} sType - The type of the vertical alignment.
*/
ApiTableCell.prototype.SetVerticalAlign = function(sType) {};

/**
* Specifies the direction of the text flow for the current table cell.
* @memberof ApiTableCell
* @param {TextFlowDirection} sType - The type of the text flow direction. 
*/
ApiTableCell.prototype.SetTextDirection = function(sType) {};

/**
* Appends text to the end of the cell content.
* @memberof ApiTableCell
* @param {string} text - The text to append.
* @returns {ApiRun}
* @since 9.4.0
*/
ApiTableCell.prototype.AddText = function(text) { return new ApiRun(); };

/**
* Returns the inner text of the current table cell.
* @memberof ApiTableCell
* @param {object} [pr] - Options for formatting the returned text.
* @param {boolean} [pr.Numbering=true] - Defines if the resulting string will include numbering or not.
* @param {boolean} [pr.Math=true] - Defines if the resulting string will include mathematical expressions or not.
* @param {string} [pr.TableCellSeparator='\t'] - Defines how the table cell separator will be specified in the resulting string.
* @param {string} [pr.TableRowSeparator='\r\n'] - Defines how the table row separator will be specified in the resulting string.
* @param {string} [pr.ParaSeparator='\r\n'] - Defines how the paragraph separator will be specified in the resulting string.
* @param {string} [pr.TabSymbol='\t'] - Defines how the tab will be specified in the resulting string.
* @param {string} [pr.NewLineSeparator='\r'] - Defines how the line separator will be specified in the resulting string.
* @return {string}
* @since 9.4.0
*/
ApiTableCell.prototype.GetText = function(pr) { return ""; };

/**
* Replaces all content of the current table cell with the specified text,
* preserving the formatting of the first paragraph.
* @memberof ApiTableCell
* @param {string} text - The text to set.
* @return {ApiRun}
* @since 9.4.0
*/
ApiTableCell.prototype.SetText = function(text) { return new ApiRun(); };

/**
* Returns the type of the current selection.
* @memberof ApiSelection
* @returns {SelectionType}
* @since 8.3.0
*/
ApiSelection.prototype.GetType = function() { return new SelectionType(); };

/**
* Returns the selected shapes.
* @memberof ApiSelection
* @returns {ApiDrawing[]}
* @since 8.3.0
*/
ApiSelection.prototype.GetShapes = function() { return []; };

/**
* Returns the selected slides.
* @memberof ApiSelection
* @returns {ApiSlide[]}
* @since 8.3.0
*/
ApiSelection.prototype.GetSlides = function() { return []; };

/**
* Specifies whether the current selection is empty or not.
* @memberof ApiSelection
* @returns {boolean}
* @since 8.3.0
*/
ApiSelection.prototype.IsEmpty = function() { return true; };

