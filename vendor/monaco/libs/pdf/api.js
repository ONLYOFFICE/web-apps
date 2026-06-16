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
* Class representing a document.
* @constructor
*/
function ApiDocument() {}

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
* Class representing a custom XML part.
* @constructor
* @since 9.0.0
* @param {Object} customXMl - The custom XML object.
* @param {Object} customXmlManager - The custom XML manager instance.
* @memberof ApiCustomXmlPart
*/
function ApiCustomXmlPart() {}

/**
* Class representing a group of drawings.
* @constructor
* @extends {ApiDrawing}
*/
function ApiSmartArt() {}

ApiSmartArt.prototype = new ApiDrawing();

/**
* Class representing a document page.
* @constructor
*/
function ApiPage() {}

/**
* Class representing a base field.
* @constructor
*/
function ApiBaseField() {}

/**
* Class representing a base field widget.
* @constructor
*/
function ApiBaseWidget() {}

/**
* Class representing a text field.
* @constructor
* @extends {ApiBaseField}
*/
function ApiTextField() {}

ApiTextField.prototype = new ApiBaseField();

/**
* Class representing a text field widget.
* @constructor
* @extends {ApiBaseWidget}
*/
function ApiTextWidget() {}

ApiTextWidget.prototype = new ApiBaseWidget();

/**
* Class representing a base list field.
* @constructor
* @extends {ApiBaseField}
*/
function ApiBaseListField() {}

ApiBaseListField.prototype = new ApiBaseField();

/**
* Class representing a combobox field.
* @constructor
* @extends {ApiBaseListField}
*/
function ApiComboboxField() {}

ApiComboboxField.prototype = new ApiBaseListField();

/**
* Class representing a listbox field.
* @constructor
* @extends {ApiBaseListField}
*/
function ApiListboxField() {}

ApiListboxField.prototype = new ApiBaseListField();

/**
* Class representing a checkbox field.
* @constructor
* @extends {ApiBaseField}
*/
function ApiCheckboxField() {}

ApiCheckboxField.prototype = new ApiBaseField();

/**
* Class representing a radiobutton field.
* @constructor
* @extends {ApiCheckboxField}
*/
function ApiRadiobuttonField() {}

ApiRadiobuttonField.prototype = new ApiCheckboxField();

/**
* Class representing a checkbox field widget.
* @constructor
* @extends {ApiBaseWidget}
*/
function ApiCheckboxWidget() {}

ApiCheckboxWidget.prototype = new ApiBaseWidget();

/**
* Class representing a button field.
* @constructor
* @extends {ApiBaseField}
*/
function ApiButtonField() {}

ApiButtonField.prototype = new ApiBaseField();

/**
* Class representing a button widget.
* @constructor
* @extends {ApiBaseWidget}
*/
function ApiButtonWidget() {}

ApiButtonWidget.prototype = new ApiBaseWidget();

/**
* Class representing a base annotation.
* @constructor
*/
function ApiBaseAnnotation() {}

/**
* Class representing a text annotation.
* @constructor
* @extends {ApiBaseAnnotation}
*/
function ApiTextAnnotation() {}

ApiTextAnnotation.prototype = new ApiBaseAnnotation();

/**
* Class representing a circle annotation.
* @constructor
* @extends {ApiBaseAnnotation}
*/
function ApiCircleAnnotation() {}

ApiCircleAnnotation.prototype = new ApiBaseAnnotation();

/**
* Class representing a square annotation.
* @constructor
* @extends {ApiBaseAnnotation}
*/
function ApiSquareAnnotation() {}

ApiSquareAnnotation.prototype = new ApiBaseAnnotation();

/**
* Class representing a freeText annotation.
* @constructor
* @extends {ApiBaseAnnotation}
*/
function ApiFreeTextAnnotation() {}

ApiFreeTextAnnotation.prototype = new ApiBaseAnnotation();

/**
* Class representing a line annotation.
* @constructor
* @extends {ApiBaseAnnotation}
*/
function ApiLineAnnotation() {}

ApiLineAnnotation.prototype = new ApiBaseAnnotation();

/**
* Class representing a ink annotation.
* @constructor
* @extends {ApiBaseAnnotation}
*/
function ApiInkAnnotation() {}

ApiInkAnnotation.prototype = new ApiBaseAnnotation();

/**
* Class representing a polygon annotation.
* @constructor
* @extends {ApiBaseAnnotation}
*/
function ApiPolygonAnnotation() {}

ApiPolygonAnnotation.prototype = new ApiBaseAnnotation();

/**
* Class representing a polyline annotation.
* @constructor
* @extends {ApiBaseAnnotation}
*/
function ApiPolyLineAnnotation() {}

ApiPolyLineAnnotation.prototype = new ApiBaseAnnotation();

/**
* Class representing a stamp annotation.
* @constructor
* @extends {ApiBaseAnnotation}
*/
function ApiStampAnnotation() {}

ApiStampAnnotation.prototype = new ApiBaseAnnotation();

/**
* Class representing a base markup annotation.
* @constructor
* @extends {ApiBaseAnnotation}
*/
function ApiBaseMarkupAnnotation() {}

ApiBaseMarkupAnnotation.prototype = new ApiBaseAnnotation();

/**
* Class representing a highlight annotation.
* @constructor
* @extends {ApiBaseMarkupAnnotation}
*/
function ApiHighlightAnnotation() {}

ApiHighlightAnnotation.prototype = new ApiBaseMarkupAnnotation();

/**
* Class representing a strikeout annotation.
* @constructor
* @extends {ApiBaseMarkupAnnotation}
*/
function ApiStrikeoutAnnotation() {}

ApiStrikeoutAnnotation.prototype = new ApiBaseMarkupAnnotation();

/**
* Class representing a underline annotation.
* @constructor
* @extends {ApiBaseMarkupAnnotation}
*/
function ApiUnderlineAnnotation() {}

ApiUnderlineAnnotation.prototype = new ApiBaseMarkupAnnotation();

/**
* Class representing a caret annotation.
* @constructor
* @extends {ApiBaseMarkupAnnotation}
*/
function ApiCaretAnnotation() {}

ApiCaretAnnotation.prototype = new ApiBaseMarkupAnnotation();

/**
* Class representing a redact annotation.
* @constructor
* @extends {ApiBaseMarkupAnnotation}
*/
function ApiRedactAnnotation() {}

ApiRedactAnnotation.prototype = new ApiBaseMarkupAnnotation();

/**
* Class representing a link annotation.
* @constructor
* @extends {ApiBaseMarkupAnnotation}
*/
function ApiLinkAnnotation() {}

ApiLinkAnnotation.prototype = new ApiBaseMarkupAnnotation();

/**
* Class representing a rich content.
* @constructor
*/
function ApiRichContent() {}

/**
* Class representing the rich paragraph properties.
* @constructor
*/
function ApiRichParaPr() {}

/**
* Class representing a rich paragraph.
* @constructor
* @extends {ApiRichParaPr}
*/
function ApiRichParagraph() {}

ApiRichParagraph.prototype = new ApiRichParaPr();

/**
* Class representing the rich text properties.
* @constructor
*/
function ApiRichTextPr() {}

/**
* Class representing a small text block called 'run'.
* @constructor
* @extends {ApiRichTextPr}
*/
function ApiRichRun() {}

ApiRichRun.prototype = new ApiRichTextPr();

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
* Creates a text field with the specified text field properties.
* @memberof Api
* @returns {ApiDocument}
*/
ApiInterface.prototype.GetDocument = function() { return new ApiDocument(); };

/**
* Creates a text field.
* @memberof Api
* @param {Rect} aRect - widget rect
* @returns {ApiTextField}
*/
ApiInterface.prototype.CreateTextField = function(aRect) { return new ApiTextField(); };

/**
* Creates a text date field.
* @memberof Api
* @param {Rect} aRect - widget rect
* @returns {ApiTextField}
*/
ApiInterface.prototype.CreateDateField = function(aRect) { return new ApiTextField(); };

/**
* Creates a image field.
* @memberof Api
* @param {Rect} aRect - widget rect
* @returns {ApiButtonField}
*/
ApiInterface.prototype.CreateImageField = function(aRect) { return new ApiButtonField(); };

/**
* Creates a checkbox field.
* @memberof Api
* @param {Rect} aRect - widget rect
* @returns {ApiCheckboxField}
*/
ApiInterface.prototype.CreateCheckboxField = function(aRect) { return new ApiCheckboxField(); };

/**
* Creates a radiobutton field.
* @memberof Api
* @param {Rect} aRect - widget rect
* @returns {ApiRadiobuttonField}
*/
ApiInterface.prototype.CreateRadiobuttonField = function(aRect) { return new ApiRadiobuttonField(); };

/**
* Creates a combobox field.
* @memberof Api
* @param {Rect} aRect - widget rect
* @returns {ApiComboboxField}
*/
ApiInterface.prototype.CreateComboboxField = function(aRect) { return new ApiComboboxField(); };

/**
* Creates a listbox field.
* @memberof Api
* @param {Rect} aRect - widget rect
* @returns {ApiListboxField}
*/
ApiInterface.prototype.CreateListboxField = function(aRect) { return new ApiListboxField(); };

/**
* Creates text annotation.
* @memberof Api
* @param {Rect} rect - annotation rect.
* @returns {ApiTextAnnotation}
*/
ApiInterface.prototype.CreateTextAnnot = function(rect) { return new ApiTextAnnotation(); };

/**
* Creates circle annotation.
* @memberof Api
* @param {Rect} rect - annotation rect.
* @returns {ApiCircleAnnotation}
*/
ApiInterface.prototype.CreateCircleAnnot = function(rect) { return new ApiCircleAnnotation(); };

/**
* Creates square annotation.
* @memberof Api
* @param {Rect} rect - annotation rect.
* @returns {ApiSquareAnnotation}
*/
ApiInterface.prototype.CreateSquareAnnot = function(rect) { return new ApiSquareAnnotation(); };

/**
* Creates freeText annotation.
* @memberof Api
* @param {Rect} rect - annotation rect.
* @returns {ApiFreeTextAnnotation}
*/
ApiInterface.prototype.CreateFreeTextAnnot = function(rect) { return new ApiFreeTextAnnotation(); };

/**
* Creates line annotation.
* @memberof Api
* @param {Rect} rect - annotation rect.
* @param {Point} startPoint - start line point
* @param {Point} endPoint - end line point
* @returns {ApiLineAnnotation}
*/
ApiInterface.prototype.CreateLineAnnot = function(rect, startPoint, endPoint) { return new ApiLineAnnotation(); };

/**
* Creates ink annotation.
* @memberof Api
* @param {Rect} rect - annotation rect.
* @param {PathList} pathList - ink path list
* @returns {ApiInkAnnotation}
*/
ApiInterface.prototype.CreateInkAnnot = function(rect, pathList) { return new ApiInkAnnotation(); };

/**
* Creates polygon annotation.
* @memberof Api
* @param {Rect} rect - annotation rect.
* @param {Path} path - polygon path
* @returns {ApiPolygonAnnotation}
*/
ApiInterface.prototype.CreatePolygonAnnot = function(rect, path) { return new ApiPolygonAnnotation(); };

/**
* Creates polyline annotation.
* @memberof Api
* @param {Rect} rect - annotation rect.
* @param {Path} path - polyline path
* @returns {ApiPolyLineAnnotation}
*/
ApiInterface.prototype.CreatePolyLineAnnot = function(rect, path) { return new ApiPolyLineAnnotation(); };

/**
* Creates stamp annotation.
* @memberof Api
* @param {Rect} rect - annotation rect (only x1, y1 coordinates will be used, since the stamp dimensions are reserved).
* @param {StampType} type - stamp type
* @param {string} [author] - name of the author
* @param {number} [creationDate] - creation date (timeStamp)
* @returns {ApiStampAnnotation}
*/
ApiInterface.prototype.CreateStampAnnot = function(rect, type, author, creationDate) { return new ApiStampAnnotation(); };

/**
* Creates highlight annotation.
* @memberof Api
* @param {Rect | Quad[]} rect - region to apply highlight.
* @returns {ApiHighlightAnnotation}
*/
ApiInterface.prototype.CreateHighlightAnnot = function(rect) { return new ApiHighlightAnnotation(); };

/**
* Creates strikeout annotation.
* @memberof Api
* @param {Rect | Quad[]} rect - region to apply strikeout.
* @returns {ApiStrikeoutAnnotation}
*/
ApiInterface.prototype.CreateStrikeoutAnnot = function(rect) { return new ApiStrikeoutAnnotation(); };

/**
* Creates underline annotation.
* @memberof Api
* @param {Rect | Quad[]} rect - region to apply underline.
* @returns {ApiUnderlineAnnotation}
*/
ApiInterface.prototype.CreateUnderlineAnnot = function(rect) { return new ApiUnderlineAnnotation(); };

/**
* Creates caret annotation.
* @memberof Api
* @param {Rect | Quad[]} rect - region to apply caret.
* @returns {ApiCaretAnnotation}
*/
ApiInterface.prototype.CreateCaretAnnot = function(rect) { return new ApiCaretAnnotation(); };

/**
* Creates redact annotation.
* @memberof Api
* @param {Rect | Quad[]} rect - region to apply redact.
* @returns {ApiRedactAnnotation}
*/
ApiInterface.prototype.CreateRedactAnnot = function(rect) { return new ApiRedactAnnotation(); };

/**
* Creates a new paragraph.
* @memberof Api
* @returns {ApiParagraph}
*/
ApiInterface.prototype.CreateParagraph = function() { return new ApiParagraph(); };

/**
* Creates a new rich paragraph.
* @memberof Api
* @returns {ApiRichParagraph}
*/
ApiInterface.prototype.CreateRichParagraph = function() { return new ApiRichParagraph(); };

/**
* Creates a new rich run.
* @memberof Api
* @returns {ApiRichRun}
*/
ApiInterface.prototype.CreateRichRun = function() { return new ApiRichRun(); };

/**
* Creates the empty rich text properties.
* @memberof Api
* @returns {ApiTextPr}
*/
ApiInterface.prototype.CreateRichTextPr = function() { return new ApiTextPr(); };

/**
* Creates the empty rich paragraph properties.
* @memberof Api
* @returns {ApiParaPr}
*/
ApiInterface.prototype.CreateRichParaPr = function() { return new ApiParaPr(); };

/**
* Creates a shape with the parameters specified.
* @memberof Api
* @param {ShapeType} [sType= "rect"] - The shape type which specifies the preset shape geometry.
* @param {EMU} [nWidth = 72] - The shape width in English measure units.
* @param {EMU} [nHeight = 72] - The shape height in English measure units.
* @param {ApiFill} [oFill = Api.CreateNoFill()] - The color or pattern used to fill the shape.
* @param {ApiStroke} [oStroke = Api.CreateStroke(0, Api.CreateNoFill())] - The stroke used to create the element shadow.
* @returns {ApiShape}
*/
ApiInterface.prototype.CreateShape = function(sType, nWidth, nHeight, oFill, oStroke) { return new ApiShape(); };

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
* Creates a table.
* @memberof Api
* @param rows - Number of rows.
* @param cols - Number of columns.
* @returns {ApiTable}
*/
ApiInterface.prototype.CreateTable = function(rows, cols) { return new ApiTable(); };

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
* Returns the object by it's internal ID.
* @memberof Api
* @param {string} id - the object internal ID.
* @returns {?object}
* @since 9.4.0
*/
ApiInterface.prototype.GetByInternalId = function(id) { return new object(); };

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
* Returns the type of the ApiDrawing class.
* @memberof ApiDrawing
* @returns {?ApiPage}
*/
ApiChart.prototype.GetParentPage = function() { return new ApiPage(); };

/**
* Sets the position of the drawing on the page.
* @memberof ApiDrawing
* @param {EMU} posX - The distance from the left side of the page to the left side of the drawing measured in English measure units.
* @param {EMU} posY - The distance from the top side of the page to the upper side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiChart.prototype.SetPosition = function(posX, posY) { return true; };

/**
* Sets the x position of the drawing on the page.
* @memberof ApiDrawing
* @param {EMU} posX - The distance from the left side of the page to the left side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiChart.prototype.SetPosX = function(posX) { return true; };

/**
* Gets the x position of the drawing on the page.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiChart.prototype.GetPosX = function() { return new EMU(); };

/**
* Sets the y position of the drawing on the page.
* @memberof ApiDrawing
* @param {EMU} posY - The distance from the top side of the page to the upper side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiChart.prototype.SetPosY = function(posY) { return true; };

/**
* Gets the y position of the drawing on the page.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiChart.prototype.GetPosY = function() { return new EMU(); };

/**
* Returns an internal ID of the current drawing.
* @memberof ApiDrawing
* @returns {string}
* @since 9.4.0
*/
ApiChart.prototype.GetInternalId = function() { return ""; };

/**
* Sets the size of the object (image, shape, chart) bounding box.
* @memberof ApiDrawing
* @param {EMU} width - The object width measured in English measure units.
* @param {EMU} height - The object height measured in English measure units.
* @returns {boolean}
*/
ApiChart.prototype.SetSize = function(width, height) { return true; };

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
* Selects the current graphic object.
* @memberof ApiDrawing
* @returns {boolean}
*/
ApiChart.prototype.Select = function() { return true; };

/**
* Sets the rotation angle to the current drawing object.
* @memberof ApiDrawing
* @param {number} rotAngle - New drawing rotation angle.
* @returns {boolean}
*/
ApiChart.prototype.SetRotation = function(rotAngle) { return true; };

/**
* Returns the rotation angle of the current drawing object.
* @memberof ApiDrawing
* @returns {number}
*/
ApiChart.prototype.GetRotation = function() { return 0; };

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
* Returns a type of the ApiDocument class.
* @memberof ApiDocument
* @returns {"document"}
*/
ApiDocument.prototype.GetClassType = function() { return ""; };

/**
* Adds a new page to document.
* @memberof ApiDocument
* @param {number} nPos - pos to add page.
* @param {pt} [nWidth] - page width.
* @param {pt} [nHeight] - page height.
* @returns {ApiPage}
*/
ApiDocument.prototype.AddPage = function(nPos, nWidth, nHeight) { return new ApiPage(); };

/**
* Gets page by index from document.
* @memberof ApiDocument
* @param {number} nPos - page position
* @returns {ApiPage}
*/
ApiDocument.prototype.GetPage = function(nPos) { return new ApiPage(); };

/**
* Removes page by index from document
* <note> You can't delete last page </note>
* @memberof ApiDocument
* @param {number} pos - page position
* @returns {boolean}
*/
ApiDocument.prototype.RemovePage = function(pos) { return true; };

/**
* Gets document pages count
* @memberof ApiDocument
* @returns {number}
*/
ApiDocument.prototype.GetPagesCount = function() { return 0; };

/**
* Gets list of all fields in document.
* @memberof ApiDocument
* @returns {ApiField[]}
*/
ApiDocument.prototype.GetAllFields = function() { return []; };

/**
* Gets field by it's name.
* @memberof ApiDocument
* @returns {?ApiField}
*/
ApiDocument.prototype.GetFieldByName = function() { return new ApiField(); };

/**
* Searchs words and adds redact to it.
* @memberof ApiDocument
* @param {SearchProps} props
* @returns {ApiRedactAnnotation[]}
*/
ApiDocument.prototype.SearchAndRedact = function(props) { return []; };

/**
* Applies added redact.
* @memberof ApiDocument
* @returns {boolean}
*/
ApiDocument.prototype.ApplyRedact = function() { return true; };

/**
* Returns a type of the ApiPage class.
* @memberof ApiPage
* @returns {"page"}
*/
ApiPage.prototype.GetClassType = function() { return ""; };

/**
* Sets page rotation angle
* @memberof ApiPage
* @param {number} nAngle
* @returns {boolean}
*/
ApiPage.prototype.SetRotation = function(nAngle) { return true; };

/**
* Gets page rotation angle
* @memberof ApiPage
* @returns {number}
*/
ApiPage.prototype.GetRotation = function() { return 0; };

/**
* Gets page index
* @memberof ApiPage
* @returns {number}
*/
ApiPage.prototype.GetIndex = function() { return 0; };

/**
* Gets page widgets
* @memberof ApiPage
* @returns {ApiWidget[]}
*/
ApiPage.prototype.GetAllWidgets = function() { return []; };

/**
* Adds an available object to a page.
* @memberof ApiPage
* @param {FloatObject} object
* @returns {FloatObject}
*/
ApiPage.prototype.AddObject = function(object) { return new FloatObject(); };

/**
* Gets all annots on page
* @memberof ApiPage
* @returns {ApiBaseAnnotation[]}
*/
ApiPage.prototype.GetAllAnnots = function() { return []; };

/**
* Search words and returns their quads.
* @memberof ApiPage
* @param {SearchProps} props
* @returns {Quads[]}
*/
ApiPage.prototype.Search = function(props) { return []; };

/**
* Sets page selection.
* @memberof ApiPage
* @param {Point} startPoint
* @param {Point} endPoint
* @returns {boolean}
*/
ApiPage.prototype.SetSelection = function(startPoint, endPoint) { return true; };

/**
* Gets page selection quads
* @memberof ApiPage
* @returns {Quad[]}
*/
ApiPage.prototype.GetSelectionQuads = function() { return []; };

/**
* Gets selected text on page
* @memberof ApiPage
* @returns {string}
*/
ApiPage.prototype.GetSelectedText = function() { return ""; };

/**
* Recognizes content on the page and returns an array of recognized objects.
* @memberof ApiPage
* @returns {Drawing[]}
*/
ApiPage.prototype.RecognizeContent = function() { return []; };

/**
* Gets all drawing objects from the page.
* @memberof ApiPage
* @returns {Drawing[]}
*/
ApiPage.prototype.GetAllDrawings = function() { return []; };

/**
* Gets all text content on the page.
* @memberof ApiPage
* @returns {string}
* @since 9.4.0
*/
ApiPage.prototype.GetText = function() { return ""; };

/**
* Gets all text content on the page with quads per line.
* @memberof ApiPage
* @returns {TextWithQuads[]}
* @since 9.4.0
*/
ApiPage.prototype.GetTextWithQuads = function() { return []; };

/**
* Sets new field name if possible.
* @memberof ApiBaseField
* @param {string} sName
* @returns {boolean}
*/
ApiBaseField.prototype.SetFullName = function(sName) { return true; };

/**
* Gets field full name.
* @memberof ApiBaseField
* @returns {string}
*/
ApiBaseField.prototype.GetFullName = function() { return ""; };

/**
* Sets new field partial name.
* @memberof ApiBaseField
* @param {string} sName
* @returns {boolean}
*/
ApiBaseField.prototype.SetPartialName = function(sName) { return true; };

/**
* Gets field partial name.
* @memberof ApiBaseField
* @returns {string}
*/
ApiBaseField.prototype.GetPartialName = function() { return ""; };

/**
* Sets field required
* @memberof ApiBaseField
* @param {boolean} bRequired
* @returns {boolean}
*/
ApiBaseField.prototype.SetRequired = function(bRequired) { return true; };

/**
* Checks if field is required
* @memberof ApiBaseField
* @returns {boolean}
*/
ApiBaseField.prototype.IsRequired = function() { return true; };

/**
* Sets field read only
* @memberof ApiBaseField
* @param {boolean} bRequired
* @returns {boolean}
*/
ApiBaseField.prototype.SetReadOnly = function(bRequired) { return true; };

/**
* Checks if field is read only
* @memberof ApiBaseField
* @returns {boolean}
*/
ApiBaseField.prototype.IsReadOnly = function() { return true; };

/**
* Sets field value
* @memberof ApiBaseField
* @param {string} sValue
* @returns {boolean}
*/
ApiBaseField.prototype.SetValue = function(sValue) { return true; };

/**
* Gets field value
* @memberof ApiBaseField
* @returns {string}
*/
ApiBaseField.prototype.GetValue = function() { return ""; };

/**
* Adds new widget - visual representation for field
* @memberof ApiBaseField
* @param {number} nPage - page to add widget
* @param {Rect} aRect - field rect
* @returns {?ApiWidget}
*/
ApiBaseField.prototype.AddWidget = function(nPage, aRect) { return new ApiWidget(); };

/**
* Gets array with widgets of the current field.
* @memberof ApiBaseField
* @returns {ApiWidget[]}
*/
ApiBaseField.prototype.GetAllWidgets = function() { return []; };

/**
* Removes field from document.
* @memberof ApiBaseField
* @returns {boolean}
*/
ApiBaseField.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current field.
* @memberof ApiBaseField
* @returns {string}
* @since 9.4.0
*/
ApiBaseField.prototype.GetInternalId = function() { return ""; };

/**
* Sets field tooltip
* @memberof ApiBaseField
* @param {?string} tooltip
* @returns {boolean}
* @since 9.4.0
*/
ApiBaseField.prototype.SetTooltip = function(tooltip) { return true; };

/**
* Gets field tooltip
* @memberof ApiBaseField
* @returns {boolean}
* @since 9.4.0
*/
ApiBaseField.prototype.GetTooltip = function() { return true; };

/**
* Returns a type of the ApiBaseWidget class.
* @memberof ApiBaseWidget
* @returns {"baseWidget"}
*/
ApiBaseWidget.prototype.GetClassType = function() { return ""; };

/**
* Sets field rect.
* @memberof ApiBaseWidget
* @param {Rect} rect
* @returns {boolean}
*/
ApiBaseWidget.prototype.SetRect = function(rect) { return true; };

/**
* Sets field rect.
* @memberof ApiBaseWidget
* @returns {Rect}
*/
ApiBaseWidget.prototype.GetRect = function() { return new Rect(); };

/**
* Sets widget position.
* @memberof ApiBaseWidget
* @param {Point} position
* @returns {boolean}
*/
ApiBaseWidget.prototype.SetPosition = function(position) { return true; };

/**
* Gets widget position.
* @memberof ApiBaseWidget
* @returns {Point}
*/
ApiBaseWidget.prototype.GetPosition = function() { return new Point(); };

/**
* Sets widget border color.
* @memberof ApiBaseWidget
* @param {ApiColor} color
* @returns {boolean}
*/
ApiBaseWidget.prototype.SetBorderColor = function(color) { return true; };

/**
* Gets widget border color.
* @memberof ApiBaseWidget
* @returns {?ApiColor}
*/
ApiBaseWidget.prototype.GetBorderColor = function() { return new ApiColor(); };

/**
* Sets widget border width.
* @memberof ApiBaseWidget
* @param {WidgetBorderWidth} sBorderWidth
* @returns {boolean}
*/
ApiBaseWidget.prototype.SetBorderWidth = function(sBorderWidth) { return true; };

/**
* Gets widget border width.
* @memberof ApiBaseWidget
* @returns {WidgetBorderWidth}
*/
ApiBaseWidget.prototype.GetBorderWidth = function() { return new WidgetBorderWidth(); };

/**
* Sets widget border style.
* @memberof ApiBaseWidget
* @param {WidgetBorderStyle} sBorderStyle
* @returns {boolean}
*/
ApiBaseWidget.prototype.SetBorderStyle = function(sBorderStyle) { return true; };

/**
* Gets widget border style.
* @memberof ApiBaseWidget
* @returns {WidgetBorderStyle}
*/
ApiBaseWidget.prototype.GetBorderStyle = function() { return new WidgetBorderStyle(); };

/**
* Sets widget background color.
* @memberof ApiBaseWidget
* @param {ApiColor} color
* @returns {boolean}
*/
ApiBaseWidget.prototype.SetBackgroundColor = function(color) { return true; };

/**
* Gets widget background color.
* @memberof ApiBaseWidget
* @returns {?ApiColor}
*/
ApiBaseWidget.prototype.GetBackgroundColor = function() { return new ApiColor(); };

/**
* Sets widget text color.
* @memberof ApiBaseWidget
* @param {ApiColor} color
* @returns {boolean}
*/
ApiBaseWidget.prototype.SetTextColor = function(color) { return true; };

/**
* Gets widget text color.
* @memberof ApiBaseWidget
* @returns {?ApiColor}
*/
ApiBaseWidget.prototype.GetTextColor = function() { return new ApiColor(); };

/**
* Sets widget text size.
* <note> Text size === 0 means autofit </note>
* @memberof ApiBaseWidget
* @param {pt} nSize
* @returns {boolean}
*/
ApiBaseWidget.prototype.SetTextSize = function(nSize) { return true; };

/**
* Gets widget text size.
* <note> Text size === 0 means autofit </note>
* @memberof ApiBaseWidget
* @returns {pt}
*/
ApiBaseWidget.prototype.GetTextSize = function() { return new pt(); };

/**
* Sets text autofit.
* @memberof ApiBaseWidget
* @param {boolean} bAuto
* @returns {boolean}
*/
ApiBaseWidget.prototype.SetAutoFit = function(bAuto) { return true; };

/**
* Checks if text is autofit.
* @memberof ApiBaseWidget
* @returns {boolean}
*/
ApiBaseWidget.prototype.IsAutoFit = function() { return true; };

/**
* Removes widget from parent field.
* @memberof ApiBaseWidget
* @returns {boolean}
*/
ApiBaseWidget.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current field widget.
* @memberof ApiBaseWidget
* @returns {string}
* @since 9.4.0
*/
ApiBaseWidget.prototype.GetInternalId = function() { return ""; };

/**
* Gets all field actions in json format.
* @memberof ApiBaseWidget
* @returns {JSON}
* @since 9.4.0
*/
ApiBaseWidget.prototype.GetActionsJSON = function() { return new JSON(); };

/**
* Returns a type of the ApiTextField class.
* @memberof ApiTextField
* @returns {"textField"}
*/
ApiTextField.prototype.GetClassType = function() { return ""; };

/**
* Sets text field multiline prop.
* @memberof ApiTextField
* @param {boolean} bMultiline - will the field be multiline
* @returns {boolean}
*/
ApiTextField.prototype.SetMultiline = function(bMultiline) { return true; };

/**
* Checks if text field is multiline.
* @memberof ApiTextField
* @returns {boolean}
*/
ApiTextField.prototype.IsMultiline = function() { return true; };

/**
* Sets text field chars limit.
* <note> Char limit 0 means field doesn't have char limit
* @memberof ApiTextField
* @param {number} nChars - chars limit number
* @returns {boolean}
*/
ApiTextField.prototype.SetCharLimit = function(nChars) { return true; };

/**
* Gets text field chars limit.
* <note> Char limit 0 means field doesn't have char limit
* @memberof ApiTextField
* @returns {number}
*/
ApiTextField.prototype.GetCharLimit = function() { return 0; };

/**
* Sets text field comb prop.
* <note> Should have char limit more then 0 </note>
* @memberof ApiTextField
* @param {boolean} bComb - will the field be comb
* @returns {boolean}
*/
ApiTextField.prototype.SetComb = function(bComb) { return true; };

/**
* Checks if text field is comb.
* @memberof ApiTextField
* @returns {boolean}
*/
ApiTextField.prototype.IsComb = function() { return true; };

/**
* Sets text field can scroll long text prop.
* @memberof ApiTextField
* @param {boolean} bScroll - can the field scroll long text 
* @returns {boolean}
*/
ApiTextField.prototype.SetScrollLongText = function(bScroll) { return true; };

/**
* Checks if text field can scroll long text.
* @memberof ApiTextField
* @returns {boolean}
*/
ApiTextField.prototype.IsScrollLongText = function() { return true; };

/**
* Sets number format for field.
* @memberof ApiTextField
* @param {number} nDemical - number of decimals
* @param {NumberSepStyle} - number separate style
* @param {NumberNegStyle} - number negative style
* @param {string} sCurrency - currency sybmol
* @param {boolean} bCurrencyPrepend - If true, places the currency symbol before the number (e.g., $1,234.56); 
* if false, places it after (e.g., 1,234.56$).
* @returns {boolean}
*/
ApiTextField.prototype.SetNumberFormat = function(nDemical, sSepStyle, sNegStyle, sCurrency, bCurrencyPrepend) { return true; };

/**
* Sets percentage format for field.
* @memberof ApiTextField
* @param {number} nDemical - number of decimals
* @param {NumberSepStyle} sSepStyle - number separate style
* @returns {boolean}
*/
ApiTextField.prototype.SetPercentageFormat = function(nDemical, sSepStyle) { return true; };

/**
* Sets date format for field.
* @memberof ApiTextField
* @param {string} sFormat - date format (e.g. "dd.mm.yyyy")
* @returns {boolean}
*/
ApiTextField.prototype.SetDateFormat = function(sFormat) { return true; };

/**
* Sets time format for field.
* @memberof ApiTextField
* @param {TimeFormat} sFormat - available time format
* @returns {boolean}
*/
ApiTextField.prototype.SetTimeFormat = function(sFormat) { return true; };

/**
* Sets special format for field.
* @memberof ApiTextField
* @param {PsfFormat} sFormat - the formatting style to apply to the value
* @returns {boolean}
*/
ApiTextField.prototype.SetSpecialFormat = function(sFormat) { return true; };

/**
* Sets mask for entered text for field.
* @memberof ApiTextField
* @param {string} sMask - field mask (e.g. "(999)999-9999")
* @returns {boolean}
*/
ApiTextField.prototype.SetMask = function(sMask) { return true; };

/**
* Sets regular expression validate string for field.
* @memberof ApiTextField
* @param {string} sReg - field regular expression (e.g. "\\S+@\\S+\\.\\S+")
* @returns {boolean}
*/
ApiTextField.prototype.SetRegularExp = function(sReg) { return true; };

/**
* Clears format of field.
* @memberof ApiTextField
* @returns {boolean}
*/
ApiTextField.prototype.ClearFormat = function() { return true; };

/**
* Sets validate range for field.
* <note> Can only be applied to fields with a percentage or number format. </note>
* @memberof ApiTextField
* @param {boolean} [bGreaterThan=false] - If true, enables minimum value check using `nGreaterThan`.
* @param {number} nGreaterThan - Minimum allowed value (inclusive or exclusive based on implementation).
* @param {boolean} [bLessThan=false] - If true, enables maximum value check using `nLessThan`.
* @param {number} nLessThan - Maximum allowed value (inclusive or exclusive based on implementation).
* @returns {boolean}
*/
ApiTextField.prototype.SetValidateRange = function(bGreaterThan, nGreaterThan, bLessThan, nLessThan) { return true; };

/**
* Sets new field name if possible.
* @memberof ApiBaseField
* @param {string} sName
* @returns {boolean}
*/
ApiTextField.prototype.SetFullName = function(sName) { return true; };

/**
* Gets field full name.
* @memberof ApiBaseField
* @returns {string}
*/
ApiTextField.prototype.GetFullName = function() { return ""; };

/**
* Sets new field partial name.
* @memberof ApiBaseField
* @param {string} sName
* @returns {boolean}
*/
ApiTextField.prototype.SetPartialName = function(sName) { return true; };

/**
* Gets field partial name.
* @memberof ApiBaseField
* @returns {string}
*/
ApiTextField.prototype.GetPartialName = function() { return ""; };

/**
* Sets field required
* @memberof ApiBaseField
* @param {boolean} bRequired
* @returns {boolean}
*/
ApiTextField.prototype.SetRequired = function(bRequired) { return true; };

/**
* Checks if field is required
* @memberof ApiBaseField
* @returns {boolean}
*/
ApiTextField.prototype.IsRequired = function() { return true; };

/**
* Sets field read only
* @memberof ApiBaseField
* @param {boolean} bRequired
* @returns {boolean}
*/
ApiTextField.prototype.SetReadOnly = function(bRequired) { return true; };

/**
* Checks if field is read only
* @memberof ApiBaseField
* @returns {boolean}
*/
ApiTextField.prototype.IsReadOnly = function() { return true; };

/**
* Sets field value
* @memberof ApiBaseField
* @param {string} sValue
* @returns {boolean}
*/
ApiTextField.prototype.SetValue = function(sValue) { return true; };

/**
* Gets field value
* @memberof ApiBaseField
* @returns {string}
*/
ApiTextField.prototype.GetValue = function() { return ""; };

/**
* Adds new widget - visual representation for field
* @memberof ApiBaseField
* @param {number} nPage - page to add widget
* @param {Rect} aRect - field rect
* @returns {?ApiWidget}
*/
ApiTextField.prototype.AddWidget = function(nPage, aRect) { return new ApiWidget(); };

/**
* Gets array with widgets of the current field.
* @memberof ApiBaseField
* @returns {ApiWidget[]}
*/
ApiTextField.prototype.GetAllWidgets = function() { return []; };

/**
* Removes field from document.
* @memberof ApiBaseField
* @returns {boolean}
*/
ApiTextField.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current field.
* @memberof ApiBaseField
* @returns {string}
* @since 9.4.0
*/
ApiTextField.prototype.GetInternalId = function() { return ""; };

/**
* Sets field tooltip
* @memberof ApiBaseField
* @param {?string} tooltip
* @returns {boolean}
* @since 9.4.0
*/
ApiTextField.prototype.SetTooltip = function(tooltip) { return true; };

/**
* Gets field tooltip
* @memberof ApiBaseField
* @returns {boolean}
* @since 9.4.0
*/
ApiTextField.prototype.GetTooltip = function() { return true; };

/**
* Returns a type of the ApiTextWidget class.
* @memberof ApiTextWidget
* @returns {"textWidget"}
*/
ApiTextWidget.prototype.GetClassType = function() { return ""; };

/**
* Sets text field placeholder.
* @memberof ApiTextWidget
* @param {string} sPlaceholder - field placeholder 
* @returns {boolean}
*/
ApiTextWidget.prototype.SetPlaceholder = function(sPlaceholder) { return true; };

/**
* Gets text field placeholder.
* @memberof ApiTextWidget
* @returns {string}
*/
ApiTextWidget.prototype.GetPlaceholder = function() { return ""; };

/**
* Sets text widget regular validate expression.
* @memberof ApiTextWidget
* @param {string} sReg - field regular exp 
* @returns {boolean}
*/
ApiTextWidget.prototype.SetRegularExp = function(sReg) { return true; };

/**
* Gets text widget regular validate expression.
* @memberof ApiTextWidget
* @returns {boolean}
*/
ApiTextWidget.prototype.GetRegularExp = function() { return true; };

/**
* Sets field rect.
* @memberof ApiBaseWidget
* @param {Rect} rect
* @returns {boolean}
*/
ApiTextWidget.prototype.SetRect = function(rect) { return true; };

/**
* Sets field rect.
* @memberof ApiBaseWidget
* @returns {Rect}
*/
ApiTextWidget.prototype.GetRect = function() { return new Rect(); };

/**
* Sets widget position.
* @memberof ApiBaseWidget
* @param {Point} position
* @returns {boolean}
*/
ApiTextWidget.prototype.SetPosition = function(position) { return true; };

/**
* Gets widget position.
* @memberof ApiBaseWidget
* @returns {Point}
*/
ApiTextWidget.prototype.GetPosition = function() { return new Point(); };

/**
* Sets widget border color.
* @memberof ApiBaseWidget
* @param {ApiColor} color
* @returns {boolean}
*/
ApiTextWidget.prototype.SetBorderColor = function(color) { return true; };

/**
* Gets widget border color.
* @memberof ApiBaseWidget
* @returns {?ApiColor}
*/
ApiTextWidget.prototype.GetBorderColor = function() { return new ApiColor(); };

/**
* Sets widget border width.
* @memberof ApiBaseWidget
* @param {WidgetBorderWidth} sBorderWidth
* @returns {boolean}
*/
ApiTextWidget.prototype.SetBorderWidth = function(sBorderWidth) { return true; };

/**
* Gets widget border width.
* @memberof ApiBaseWidget
* @returns {WidgetBorderWidth}
*/
ApiTextWidget.prototype.GetBorderWidth = function() { return new WidgetBorderWidth(); };

/**
* Sets widget border style.
* @memberof ApiBaseWidget
* @param {WidgetBorderStyle} sBorderStyle
* @returns {boolean}
*/
ApiTextWidget.prototype.SetBorderStyle = function(sBorderStyle) { return true; };

/**
* Gets widget border style.
* @memberof ApiBaseWidget
* @returns {WidgetBorderStyle}
*/
ApiTextWidget.prototype.GetBorderStyle = function() { return new WidgetBorderStyle(); };

/**
* Sets widget background color.
* @memberof ApiBaseWidget
* @param {ApiColor} color
* @returns {boolean}
*/
ApiTextWidget.prototype.SetBackgroundColor = function(color) { return true; };

/**
* Gets widget background color.
* @memberof ApiBaseWidget
* @returns {?ApiColor}
*/
ApiTextWidget.prototype.GetBackgroundColor = function() { return new ApiColor(); };

/**
* Sets widget text color.
* @memberof ApiBaseWidget
* @param {ApiColor} color
* @returns {boolean}
*/
ApiTextWidget.prototype.SetTextColor = function(color) { return true; };

/**
* Gets widget text color.
* @memberof ApiBaseWidget
* @returns {?ApiColor}
*/
ApiTextWidget.prototype.GetTextColor = function() { return new ApiColor(); };

/**
* Sets widget text size.
* <note> Text size === 0 means autofit </note>
* @memberof ApiBaseWidget
* @param {pt} nSize
* @returns {boolean}
*/
ApiTextWidget.prototype.SetTextSize = function(nSize) { return true; };

/**
* Gets widget text size.
* <note> Text size === 0 means autofit </note>
* @memberof ApiBaseWidget
* @returns {pt}
*/
ApiTextWidget.prototype.GetTextSize = function() { return new pt(); };

/**
* Sets text autofit.
* @memberof ApiBaseWidget
* @param {boolean} bAuto
* @returns {boolean}
*/
ApiTextWidget.prototype.SetAutoFit = function(bAuto) { return true; };

/**
* Checks if text is autofit.
* @memberof ApiBaseWidget
* @returns {boolean}
*/
ApiTextWidget.prototype.IsAutoFit = function() { return true; };

/**
* Removes widget from parent field.
* @memberof ApiBaseWidget
* @returns {boolean}
*/
ApiTextWidget.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current field widget.
* @memberof ApiBaseWidget
* @returns {string}
* @since 9.4.0
*/
ApiTextWidget.prototype.GetInternalId = function() { return ""; };

/**
* Gets all field actions in json format.
* @memberof ApiBaseWidget
* @returns {JSON}
* @since 9.4.0
*/
ApiTextWidget.prototype.GetActionsJSON = function() { return new JSON(); };

/**
* Adds new option to list options.
* @memberof ApiBaseListField
* @param {ListOption} option - list option to add
* @param {number} [nPos=this.GetOptions().lenght] - pos to add option
* @returns {boolean}
*/
ApiBaseListField.prototype.AddOption = function(option, nPos) { return true; };

/**
* Removes option from list options.
* @memberof ApiBaseListField
* @param {number} nPos - pos to remove option
* @returns {boolean}
*/
ApiBaseListField.prototype.RemoveOption = function(nPos) { return true; };

/**
* Moves option to specified position in list options.
* @memberof ApiBaseListField
* @param {number} nCurPos - index of moved option
* @param {number} nNewPos - new positon for option
* @returns {boolean}
*/
ApiBaseListField.prototype.MoveOption = function(nCurPos, nNewPos) { return true; };

/**
* Gets option from list options.
* @memberof ApiBaseListField
* @param {number} nPos - option index to get
* @returns {ListOption}
*/
ApiBaseListField.prototype.GetOption = function(nPos) { return new ListOption(); };

/**
* Gets all options from list options.
* @memberof ApiBaseListField
* @returns {ListOption[]}
*/
ApiBaseListField.prototype.GetOptions = function() { return []; };

/**
* Sets field commit on selection change prop.
* @memberof ApiBaseListField
* @param {boolean} bCommit - will the field value be applied to all with the same name immediately after the change
* @returns {boolean}
*/
ApiBaseListField.prototype.SetCommitOnSelChange = function(bCommit) { return true; };

/**
* Checks if field can commit on selection change.
* @memberof ApiBaseListField
* @returns {boolean}
*/
ApiBaseListField.prototype.IsCommitOnSelChange = function() { return true; };

/**
* Sets selected value indexes.
* @memberof ApiBaseListField
* @param {number[]} aIndexes - selected indexes
* @returns {boolean}
*/
ApiBaseListField.prototype.SetValueIndexes = function(aIndexes) { return true; };

/**
* Gets selected value indexes.
* @memberof ApiBaseListField
* @returns {number[]}
*/
ApiBaseListField.prototype.GetValueIndexes = function() { return []; };

/**
* Sets new field name if possible.
* @memberof ApiBaseField
* @param {string} sName
* @returns {boolean}
*/
ApiBaseListField.prototype.SetFullName = function(sName) { return true; };

/**
* Gets field full name.
* @memberof ApiBaseField
* @returns {string}
*/
ApiBaseListField.prototype.GetFullName = function() { return ""; };

/**
* Sets new field partial name.
* @memberof ApiBaseField
* @param {string} sName
* @returns {boolean}
*/
ApiBaseListField.prototype.SetPartialName = function(sName) { return true; };

/**
* Gets field partial name.
* @memberof ApiBaseField
* @returns {string}
*/
ApiBaseListField.prototype.GetPartialName = function() { return ""; };

/**
* Sets field required
* @memberof ApiBaseField
* @param {boolean} bRequired
* @returns {boolean}
*/
ApiBaseListField.prototype.SetRequired = function(bRequired) { return true; };

/**
* Checks if field is required
* @memberof ApiBaseField
* @returns {boolean}
*/
ApiBaseListField.prototype.IsRequired = function() { return true; };

/**
* Sets field read only
* @memberof ApiBaseField
* @param {boolean} bRequired
* @returns {boolean}
*/
ApiBaseListField.prototype.SetReadOnly = function(bRequired) { return true; };

/**
* Checks if field is read only
* @memberof ApiBaseField
* @returns {boolean}
*/
ApiBaseListField.prototype.IsReadOnly = function() { return true; };

/**
* Sets field value
* @memberof ApiBaseField
* @param {string} sValue
* @returns {boolean}
*/
ApiBaseListField.prototype.SetValue = function(sValue) { return true; };

/**
* Gets field value
* @memberof ApiBaseField
* @returns {string}
*/
ApiBaseListField.prototype.GetValue = function() { return ""; };

/**
* Adds new widget - visual representation for field
* @memberof ApiBaseField
* @param {number} nPage - page to add widget
* @param {Rect} aRect - field rect
* @returns {?ApiWidget}
*/
ApiBaseListField.prototype.AddWidget = function(nPage, aRect) { return new ApiWidget(); };

/**
* Gets array with widgets of the current field.
* @memberof ApiBaseField
* @returns {ApiWidget[]}
*/
ApiBaseListField.prototype.GetAllWidgets = function() { return []; };

/**
* Removes field from document.
* @memberof ApiBaseField
* @returns {boolean}
*/
ApiBaseListField.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current field.
* @memberof ApiBaseField
* @returns {string}
* @since 9.4.0
*/
ApiBaseListField.prototype.GetInternalId = function() { return ""; };

/**
* Sets field tooltip
* @memberof ApiBaseField
* @param {?string} tooltip
* @returns {boolean}
* @since 9.4.0
*/
ApiBaseListField.prototype.SetTooltip = function(tooltip) { return true; };

/**
* Gets field tooltip
* @memberof ApiBaseField
* @returns {boolean}
* @since 9.4.0
*/
ApiBaseListField.prototype.GetTooltip = function() { return true; };

/**
* Returns a type of the ApiComboboxField class.
* @memberof ApiComboboxField
* @returns {"comboboxField"}
*/
ApiComboboxField.prototype.GetClassType = function() { return ""; };

/**
* Sets field editable prop.
* @memberof ApiComboboxField
* @param {boolean} bEditable - allow user enter custom text
* @returns {boolean}
*/
ApiComboboxField.prototype.SetEditable = function(bEditable) { return true; };

/**
* Checks if field is editable.
* @memberof ApiComboboxField
* @returns {boolean}
*/
ApiComboboxField.prototype.IsEditable = function() { return true; };

/**
* Sets number format for field.
* @memberof ApiComboboxField
* @param {number} nDemical - number of decimals
* @param {NumberSepStyle} sSepStyle - number separate style
* @param {NumberNegStyle} sNegStyle - number negative style
* @param {string} sCurrency - currency sybmol
* @param {boolean} bCurrencyPrepend - If true, places the currency symbol before the number (e.g., $1,234.56); 
* if false, places it after (e.g., 1,234.56$).
* @returns {boolean}
*/
ApiComboboxField.prototype.SetNumberFormat = function(nDemical, sSepStyle, sNegStyle, sCurrency, bCurrencyPrepend) { return true; };

/**
* Sets percentage format for field.
* @memberof ApiComboboxField
* @param {number} nDemical - number of decimals
* @param {NumberSepStyle} sSepStyle - number separate style
* @returns {boolean}
*/
ApiComboboxField.prototype.SetPercentageFormat = function(nDemical, sSepStyle) { return true; };

/**
* Sets date format for field.
* @memberof ApiComboboxField
* @param {string} sFormat - date format (e.g. "dd.mm.yyyy")
* @returns {boolean}
*/
ApiComboboxField.prototype.SetDateFormat = function(sFormat) { return true; };

/**
* Sets time format for field.
* @memberof ApiComboboxField
* @param {TimeFormat} sFormat - available time format
* @returns {boolean}
*/
ApiComboboxField.prototype.SetTimeFormat = function(sFormat) { return true; };

/**
* Sets special format for field.
* @memberof ApiComboboxField
* @param {PsfFormat} sFormat - the formatting style to apply to the value
* @returns {boolean}
*/
ApiComboboxField.prototype.SetSpecialFormat = function(sFormat) { return true; };

/**
* Sets mask for field.
* @memberof ApiComboboxField
* @param {string} sMask - field mask (e.g. "(999)999-9999")
* @returns {boolean}
*/
ApiComboboxField.prototype.SetMask = function(sMask) { return true; };

/**
* Sets regular expression for field.
* @memberof ApiComboboxField
* @param {string} sReg - field regular expression (e.g. "\\S+@\\S+\\.\\S+")
* @returns {boolean}
*/
ApiComboboxField.prototype.SetRegularExp = function(sReg) { return true; };

/**
* Clears format of field.
* @memberof ApiComboboxField
* @returns {boolean}
*/
ApiComboboxField.prototype.ClearFormat = function() { return true; };

/**
* Sets validate range for field.
* <note> Can only be applied to fields with a percentage or number format. </note>
* @memberof ApiComboboxField
* @param {boolean} [bGreaterThan=false] - If true, enables minimum value check using `nGreaterThan`.
* @param {number} nGreaterThan - Minimum allowed value (inclusive or exclusive based on implementation).
* @param {boolean} [bLessThan=false] - If true, enables maximum value check using `nLessThan`.
* @param {number} nLessThan - Maximum allowed value (inclusive or exclusive based on implementation).
* @returns {boolean}
*/
ApiComboboxField.prototype.SetValidateRange = function(bGreaterThan, nGreaterThan, bLessThan, nLessThan) { return true; };

/**
* Adds new option to list options.
* @memberof ApiBaseListField
* @param {ListOption} option - list option to add
* @param {number} [nPos=this.GetOptions().lenght] - pos to add option
* @returns {boolean}
*/
ApiComboboxField.prototype.AddOption = function(option, nPos) { return true; };

/**
* Removes option from list options.
* @memberof ApiBaseListField
* @param {number} nPos - pos to remove option
* @returns {boolean}
*/
ApiComboboxField.prototype.RemoveOption = function(nPos) { return true; };

/**
* Moves option to specified position in list options.
* @memberof ApiBaseListField
* @param {number} nCurPos - index of moved option
* @param {number} nNewPos - new positon for option
* @returns {boolean}
*/
ApiComboboxField.prototype.MoveOption = function(nCurPos, nNewPos) { return true; };

/**
* Gets option from list options.
* @memberof ApiBaseListField
* @param {number} nPos - option index to get
* @returns {ListOption}
*/
ApiComboboxField.prototype.GetOption = function(nPos) { return new ListOption(); };

/**
* Gets all options from list options.
* @memberof ApiBaseListField
* @returns {ListOption[]}
*/
ApiComboboxField.prototype.GetOptions = function() { return []; };

/**
* Sets field commit on selection change prop.
* @memberof ApiBaseListField
* @param {boolean} bCommit - will the field value be applied to all with the same name immediately after the change
* @returns {boolean}
*/
ApiComboboxField.prototype.SetCommitOnSelChange = function(bCommit) { return true; };

/**
* Checks if field can commit on selection change.
* @memberof ApiBaseListField
* @returns {boolean}
*/
ApiComboboxField.prototype.IsCommitOnSelChange = function() { return true; };

/**
* Sets selected value indexes.
* @memberof ApiBaseListField
* @param {number[]} aIndexes - selected indexes
* @returns {boolean}
*/
ApiComboboxField.prototype.SetValueIndexes = function(aIndexes) { return true; };

/**
* Gets selected value indexes.
* @memberof ApiBaseListField
* @returns {number[]}
*/
ApiComboboxField.prototype.GetValueIndexes = function() { return []; };

/**
* Sets new field name if possible.
* @memberof ApiBaseField
* @param {string} sName
* @returns {boolean}
*/
ApiComboboxField.prototype.SetFullName = function(sName) { return true; };

/**
* Gets field full name.
* @memberof ApiBaseField
* @returns {string}
*/
ApiComboboxField.prototype.GetFullName = function() { return ""; };

/**
* Sets new field partial name.
* @memberof ApiBaseField
* @param {string} sName
* @returns {boolean}
*/
ApiComboboxField.prototype.SetPartialName = function(sName) { return true; };

/**
* Gets field partial name.
* @memberof ApiBaseField
* @returns {string}
*/
ApiComboboxField.prototype.GetPartialName = function() { return ""; };

/**
* Sets field required
* @memberof ApiBaseField
* @param {boolean} bRequired
* @returns {boolean}
*/
ApiComboboxField.prototype.SetRequired = function(bRequired) { return true; };

/**
* Checks if field is required
* @memberof ApiBaseField
* @returns {boolean}
*/
ApiComboboxField.prototype.IsRequired = function() { return true; };

/**
* Sets field read only
* @memberof ApiBaseField
* @param {boolean} bRequired
* @returns {boolean}
*/
ApiComboboxField.prototype.SetReadOnly = function(bRequired) { return true; };

/**
* Checks if field is read only
* @memberof ApiBaseField
* @returns {boolean}
*/
ApiComboboxField.prototype.IsReadOnly = function() { return true; };

/**
* Sets field value
* @memberof ApiBaseField
* @param {string} sValue
* @returns {boolean}
*/
ApiComboboxField.prototype.SetValue = function(sValue) { return true; };

/**
* Gets field value
* @memberof ApiBaseField
* @returns {string}
*/
ApiComboboxField.prototype.GetValue = function() { return ""; };

/**
* Adds new widget - visual representation for field
* @memberof ApiBaseField
* @param {number} nPage - page to add widget
* @param {Rect} aRect - field rect
* @returns {?ApiWidget}
*/
ApiComboboxField.prototype.AddWidget = function(nPage, aRect) { return new ApiWidget(); };

/**
* Gets array with widgets of the current field.
* @memberof ApiBaseField
* @returns {ApiWidget[]}
*/
ApiComboboxField.prototype.GetAllWidgets = function() { return []; };

/**
* Removes field from document.
* @memberof ApiBaseField
* @returns {boolean}
*/
ApiComboboxField.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current field.
* @memberof ApiBaseField
* @returns {string}
* @since 9.4.0
*/
ApiComboboxField.prototype.GetInternalId = function() { return ""; };

/**
* Sets field tooltip
* @memberof ApiBaseField
* @param {?string} tooltip
* @returns {boolean}
* @since 9.4.0
*/
ApiComboboxField.prototype.SetTooltip = function(tooltip) { return true; };

/**
* Gets field tooltip
* @memberof ApiBaseField
* @returns {boolean}
* @since 9.4.0
*/
ApiComboboxField.prototype.GetTooltip = function() { return true; };

/**
* Returns a type of the ApiListboxField class.
* @memberof ApiListboxField
* @returns {"listboxField"}
*/
ApiListboxField.prototype.GetClassType = function() { return ""; };

/**
* Sets field multiselect prop.
* @memberof ApiListboxField
* @param {boolean} bMulti - allow user select multi values
* @returns {boolean}
*/
ApiListboxField.prototype.SetMultipleSelection = function(bMulti) { return true; };

/**
* Checks if field is multiselect.
* @memberof ApiListboxField
* @returns {boolean}
*/
ApiListboxField.prototype.IsMultipleSelection = function() { return true; };

/**
* Adds new option to list options.
* @memberof ApiBaseListField
* @param {ListOption} option - list option to add
* @param {number} [nPos=this.GetOptions().lenght] - pos to add option
* @returns {boolean}
*/
ApiListboxField.prototype.AddOption = function(option, nPos) { return true; };

/**
* Removes option from list options.
* @memberof ApiBaseListField
* @param {number} nPos - pos to remove option
* @returns {boolean}
*/
ApiListboxField.prototype.RemoveOption = function(nPos) { return true; };

/**
* Moves option to specified position in list options.
* @memberof ApiBaseListField
* @param {number} nCurPos - index of moved option
* @param {number} nNewPos - new positon for option
* @returns {boolean}
*/
ApiListboxField.prototype.MoveOption = function(nCurPos, nNewPos) { return true; };

/**
* Gets option from list options.
* @memberof ApiBaseListField
* @param {number} nPos - option index to get
* @returns {ListOption}
*/
ApiListboxField.prototype.GetOption = function(nPos) { return new ListOption(); };

/**
* Gets all options from list options.
* @memberof ApiBaseListField
* @returns {ListOption[]}
*/
ApiListboxField.prototype.GetOptions = function() { return []; };

/**
* Sets field commit on selection change prop.
* @memberof ApiBaseListField
* @param {boolean} bCommit - will the field value be applied to all with the same name immediately after the change
* @returns {boolean}
*/
ApiListboxField.prototype.SetCommitOnSelChange = function(bCommit) { return true; };

/**
* Checks if field can commit on selection change.
* @memberof ApiBaseListField
* @returns {boolean}
*/
ApiListboxField.prototype.IsCommitOnSelChange = function() { return true; };

/**
* Sets selected value indexes.
* @memberof ApiBaseListField
* @param {number[]} aIndexes - selected indexes
* @returns {boolean}
*/
ApiListboxField.prototype.SetValueIndexes = function(aIndexes) { return true; };

/**
* Gets selected value indexes.
* @memberof ApiBaseListField
* @returns {number[]}
*/
ApiListboxField.prototype.GetValueIndexes = function() { return []; };

/**
* Sets new field name if possible.
* @memberof ApiBaseField
* @param {string} sName
* @returns {boolean}
*/
ApiListboxField.prototype.SetFullName = function(sName) { return true; };

/**
* Gets field full name.
* @memberof ApiBaseField
* @returns {string}
*/
ApiListboxField.prototype.GetFullName = function() { return ""; };

/**
* Sets new field partial name.
* @memberof ApiBaseField
* @param {string} sName
* @returns {boolean}
*/
ApiListboxField.prototype.SetPartialName = function(sName) { return true; };

/**
* Gets field partial name.
* @memberof ApiBaseField
* @returns {string}
*/
ApiListboxField.prototype.GetPartialName = function() { return ""; };

/**
* Sets field required
* @memberof ApiBaseField
* @param {boolean} bRequired
* @returns {boolean}
*/
ApiListboxField.prototype.SetRequired = function(bRequired) { return true; };

/**
* Checks if field is required
* @memberof ApiBaseField
* @returns {boolean}
*/
ApiListboxField.prototype.IsRequired = function() { return true; };

/**
* Sets field read only
* @memberof ApiBaseField
* @param {boolean} bRequired
* @returns {boolean}
*/
ApiListboxField.prototype.SetReadOnly = function(bRequired) { return true; };

/**
* Checks if field is read only
* @memberof ApiBaseField
* @returns {boolean}
*/
ApiListboxField.prototype.IsReadOnly = function() { return true; };

/**
* Sets field value
* @memberof ApiBaseField
* @param {string} sValue
* @returns {boolean}
*/
ApiListboxField.prototype.SetValue = function(sValue) { return true; };

/**
* Gets field value
* @memberof ApiBaseField
* @returns {string}
*/
ApiListboxField.prototype.GetValue = function() { return ""; };

/**
* Adds new widget - visual representation for field
* @memberof ApiBaseField
* @param {number} nPage - page to add widget
* @param {Rect} aRect - field rect
* @returns {?ApiWidget}
*/
ApiListboxField.prototype.AddWidget = function(nPage, aRect) { return new ApiWidget(); };

/**
* Gets array with widgets of the current field.
* @memberof ApiBaseField
* @returns {ApiWidget[]}
*/
ApiListboxField.prototype.GetAllWidgets = function() { return []; };

/**
* Removes field from document.
* @memberof ApiBaseField
* @returns {boolean}
*/
ApiListboxField.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current field.
* @memberof ApiBaseField
* @returns {string}
* @since 9.4.0
*/
ApiListboxField.prototype.GetInternalId = function() { return ""; };

/**
* Sets field tooltip
* @memberof ApiBaseField
* @param {?string} tooltip
* @returns {boolean}
* @since 9.4.0
*/
ApiListboxField.prototype.SetTooltip = function(tooltip) { return true; };

/**
* Gets field tooltip
* @memberof ApiBaseField
* @returns {boolean}
* @since 9.4.0
*/
ApiListboxField.prototype.GetTooltip = function() { return true; };

/**
* Returns a type of the ApiCheckboxField class.
* @memberof ApiCheckboxField
* @returns {"checkboxField"}
*/
ApiCheckboxField.prototype.GetClassType = function() { return ""; };

/**
* Sets field toggle to off prop.
* @memberof ApiCheckboxField
* @param {boolean} bToggle - can toggle to off
* @returns {boolean}
*/
ApiCheckboxField.prototype.SetToggleToOff = function(bToggle) { return true; };

/**
* Checks if field is toggle to off.
* @memberof ApiCheckboxField
* @returns {boolean}
*/
ApiCheckboxField.prototype.IsToggleToOff = function() { return true; };

/**
* Adds options to checkbox group.
* @memberof ApiCheckboxField
* @param {number} nPage - page to add option
* @param {Rect} - rect of new option
* @param {string} [sExportValue] - option checked value
* @returns {ApiCheckboxWidget}
*/
ApiCheckboxField.prototype.AddOption = function(nPage, aRect, sExportValue) { return new ApiCheckboxWidget(); };

/**
* Sets new field name if possible.
* @memberof ApiBaseField
* @param {string} sName
* @returns {boolean}
*/
ApiCheckboxField.prototype.SetFullName = function(sName) { return true; };

/**
* Gets field full name.
* @memberof ApiBaseField
* @returns {string}
*/
ApiCheckboxField.prototype.GetFullName = function() { return ""; };

/**
* Sets new field partial name.
* @memberof ApiBaseField
* @param {string} sName
* @returns {boolean}
*/
ApiCheckboxField.prototype.SetPartialName = function(sName) { return true; };

/**
* Gets field partial name.
* @memberof ApiBaseField
* @returns {string}
*/
ApiCheckboxField.prototype.GetPartialName = function() { return ""; };

/**
* Sets field required
* @memberof ApiBaseField
* @param {boolean} bRequired
* @returns {boolean}
*/
ApiCheckboxField.prototype.SetRequired = function(bRequired) { return true; };

/**
* Checks if field is required
* @memberof ApiBaseField
* @returns {boolean}
*/
ApiCheckboxField.prototype.IsRequired = function() { return true; };

/**
* Sets field read only
* @memberof ApiBaseField
* @param {boolean} bRequired
* @returns {boolean}
*/
ApiCheckboxField.prototype.SetReadOnly = function(bRequired) { return true; };

/**
* Checks if field is read only
* @memberof ApiBaseField
* @returns {boolean}
*/
ApiCheckboxField.prototype.IsReadOnly = function() { return true; };

/**
* Sets field value
* @memberof ApiBaseField
* @param {string} sValue
* @returns {boolean}
*/
ApiCheckboxField.prototype.SetValue = function(sValue) { return true; };

/**
* Gets field value
* @memberof ApiBaseField
* @returns {string}
*/
ApiCheckboxField.prototype.GetValue = function() { return ""; };

/**
* Adds new widget - visual representation for field
* @memberof ApiBaseField
* @param {number} nPage - page to add widget
* @param {Rect} aRect - field rect
* @returns {?ApiWidget}
*/
ApiCheckboxField.prototype.AddWidget = function(nPage, aRect) { return new ApiWidget(); };

/**
* Gets array with widgets of the current field.
* @memberof ApiBaseField
* @returns {ApiWidget[]}
*/
ApiCheckboxField.prototype.GetAllWidgets = function() { return []; };

/**
* Removes field from document.
* @memberof ApiBaseField
* @returns {boolean}
*/
ApiCheckboxField.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current field.
* @memberof ApiBaseField
* @returns {string}
* @since 9.4.0
*/
ApiCheckboxField.prototype.GetInternalId = function() { return ""; };

/**
* Sets field tooltip
* @memberof ApiBaseField
* @param {?string} tooltip
* @returns {boolean}
* @since 9.4.0
*/
ApiCheckboxField.prototype.SetTooltip = function(tooltip) { return true; };

/**
* Gets field tooltip
* @memberof ApiBaseField
* @returns {boolean}
* @since 9.4.0
*/
ApiCheckboxField.prototype.GetTooltip = function() { return true; };

/**
* Returns a type of the ApiRadiobuttonField class.
* @memberof ApiRadiobuttonField
* @returns {"radiobuttonField"}
*/
ApiRadiobuttonField.prototype.GetClassType = function() { return ""; };

/**
* Sets field in unison prop.
* @memberof ApiRadiobuttonField
* @param {boolean} bInUnison - will fields with the same export value be checked at the same time
* @returns {boolean}
*/
ApiRadiobuttonField.prototype.SetCheckInUnison = function(bInUnison) { return true; };

/**
* Checks if field will check in unison.
* @memberof ApiRadiobuttonField
* @returns {boolean}
*/
ApiRadiobuttonField.prototype.IsCheckInUnison = function() { return true; };

/**
* Sets field toggle to off prop.
* @memberof ApiCheckboxField
* @param {boolean} bToggle - can toggle to off
* @returns {boolean}
*/
ApiRadiobuttonField.prototype.SetToggleToOff = function(bToggle) { return true; };

/**
* Checks if field is toggle to off.
* @memberof ApiCheckboxField
* @returns {boolean}
*/
ApiRadiobuttonField.prototype.IsToggleToOff = function() { return true; };

/**
* Adds options to checkbox group.
* @memberof ApiCheckboxField
* @param {number} nPage - page to add option
* @param {Rect} - rect of new option
* @param {string} [sExportValue] - option checked value
* @returns {ApiCheckboxWidget}
*/
ApiRadiobuttonField.prototype.AddOption = function(nPage, aRect, sExportValue) { return new ApiCheckboxWidget(); };

/**
* Sets new field name if possible.
* @memberof ApiBaseField
* @param {string} sName
* @returns {boolean}
*/
ApiRadiobuttonField.prototype.SetFullName = function(sName) { return true; };

/**
* Gets field full name.
* @memberof ApiBaseField
* @returns {string}
*/
ApiRadiobuttonField.prototype.GetFullName = function() { return ""; };

/**
* Sets new field partial name.
* @memberof ApiBaseField
* @param {string} sName
* @returns {boolean}
*/
ApiRadiobuttonField.prototype.SetPartialName = function(sName) { return true; };

/**
* Gets field partial name.
* @memberof ApiBaseField
* @returns {string}
*/
ApiRadiobuttonField.prototype.GetPartialName = function() { return ""; };

/**
* Sets field required
* @memberof ApiBaseField
* @param {boolean} bRequired
* @returns {boolean}
*/
ApiRadiobuttonField.prototype.SetRequired = function(bRequired) { return true; };

/**
* Checks if field is required
* @memberof ApiBaseField
* @returns {boolean}
*/
ApiRadiobuttonField.prototype.IsRequired = function() { return true; };

/**
* Sets field read only
* @memberof ApiBaseField
* @param {boolean} bRequired
* @returns {boolean}
*/
ApiRadiobuttonField.prototype.SetReadOnly = function(bRequired) { return true; };

/**
* Checks if field is read only
* @memberof ApiBaseField
* @returns {boolean}
*/
ApiRadiobuttonField.prototype.IsReadOnly = function() { return true; };

/**
* Sets field value
* @memberof ApiBaseField
* @param {string} sValue
* @returns {boolean}
*/
ApiRadiobuttonField.prototype.SetValue = function(sValue) { return true; };

/**
* Gets field value
* @memberof ApiBaseField
* @returns {string}
*/
ApiRadiobuttonField.prototype.GetValue = function() { return ""; };

/**
* Adds new widget - visual representation for field
* @memberof ApiBaseField
* @param {number} nPage - page to add widget
* @param {Rect} aRect - field rect
* @returns {?ApiWidget}
*/
ApiRadiobuttonField.prototype.AddWidget = function(nPage, aRect) { return new ApiWidget(); };

/**
* Gets array with widgets of the current field.
* @memberof ApiBaseField
* @returns {ApiWidget[]}
*/
ApiRadiobuttonField.prototype.GetAllWidgets = function() { return []; };

/**
* Removes field from document.
* @memberof ApiBaseField
* @returns {boolean}
*/
ApiRadiobuttonField.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current field.
* @memberof ApiBaseField
* @returns {string}
* @since 9.4.0
*/
ApiRadiobuttonField.prototype.GetInternalId = function() { return ""; };

/**
* Sets field tooltip
* @memberof ApiBaseField
* @param {?string} tooltip
* @returns {boolean}
* @since 9.4.0
*/
ApiRadiobuttonField.prototype.SetTooltip = function(tooltip) { return true; };

/**
* Gets field tooltip
* @memberof ApiBaseField
* @returns {boolean}
* @since 9.4.0
*/
ApiRadiobuttonField.prototype.GetTooltip = function() { return true; };

/**
* Returns a type of the ApiCheckboxWidget class.
* @memberof ApiCheckboxWidget
* @returns {"checkboxWidget"}
*/
ApiCheckboxWidget.prototype.GetClassType = function() { return ""; };

/**
* Sets checkbox widget checked.
* @memberof ApiCheckboxWidget
* @param {boolean} bChecked
* @returns {boolean}
*/
ApiCheckboxWidget.prototype.SetChecked = function(bChecked) { return true; };

/**
* Checks if checkbox widget is checked.
* @memberof ApiCheckboxWidget
* @returns {boolean}
*/
ApiCheckboxWidget.prototype.IsChecked = function() { return true; };

/**
* Sets widget checkbox style.
* @memberof ApiCheckboxWidget
* @param {CheckStyle} sStyle
* @returns {boolean}
*/
ApiCheckboxWidget.prototype.SetCheckStyle = function(sStyle) { return true; };

/**
* Gets widget checkbox style.
* @memberof ApiCheckboxWidget
* @returns {CheckStyle}
*/
ApiCheckboxWidget.prototype.GetCheckStyle = function() { return new CheckStyle(); };

/**
* Sets widget export value.
* @memberof ApiCheckboxWidget
* @param {string} sValue
* @returns {boolean}
*/
ApiCheckboxWidget.prototype.SetExportValue = function(sValue) { return true; };

/**
* Gets widget export value.
* @memberof ApiCheckboxWidget
* @returns {string}
*/
ApiCheckboxWidget.prototype.GetExportValue = function() { return ""; };

/**
* Sets widget checked by default.
* @memberof ApiCheckboxWidget
* @param {boolean} bChecked
* @returns {boolean}
*/
ApiCheckboxWidget.prototype.SetCheckedByDefault = function(bChecked) { return true; };

/**
* Checks if widget is checked by default.
* @memberof ApiCheckboxWidget
* @returns {boolean}
*/
ApiCheckboxWidget.prototype.IsCheckedByDefault = function() { return true; };

/**
* Sets field rect.
* @memberof ApiBaseWidget
* @param {Rect} rect
* @returns {boolean}
*/
ApiCheckboxWidget.prototype.SetRect = function(rect) { return true; };

/**
* Sets field rect.
* @memberof ApiBaseWidget
* @returns {Rect}
*/
ApiCheckboxWidget.prototype.GetRect = function() { return new Rect(); };

/**
* Sets widget position.
* @memberof ApiBaseWidget
* @param {Point} position
* @returns {boolean}
*/
ApiCheckboxWidget.prototype.SetPosition = function(position) { return true; };

/**
* Gets widget position.
* @memberof ApiBaseWidget
* @returns {Point}
*/
ApiCheckboxWidget.prototype.GetPosition = function() { return new Point(); };

/**
* Sets widget border color.
* @memberof ApiBaseWidget
* @param {ApiColor} color
* @returns {boolean}
*/
ApiCheckboxWidget.prototype.SetBorderColor = function(color) { return true; };

/**
* Gets widget border color.
* @memberof ApiBaseWidget
* @returns {?ApiColor}
*/
ApiCheckboxWidget.prototype.GetBorderColor = function() { return new ApiColor(); };

/**
* Sets widget border width.
* @memberof ApiBaseWidget
* @param {WidgetBorderWidth} sBorderWidth
* @returns {boolean}
*/
ApiCheckboxWidget.prototype.SetBorderWidth = function(sBorderWidth) { return true; };

/**
* Gets widget border width.
* @memberof ApiBaseWidget
* @returns {WidgetBorderWidth}
*/
ApiCheckboxWidget.prototype.GetBorderWidth = function() { return new WidgetBorderWidth(); };

/**
* Sets widget border style.
* @memberof ApiBaseWidget
* @param {WidgetBorderStyle} sBorderStyle
* @returns {boolean}
*/
ApiCheckboxWidget.prototype.SetBorderStyle = function(sBorderStyle) { return true; };

/**
* Gets widget border style.
* @memberof ApiBaseWidget
* @returns {WidgetBorderStyle}
*/
ApiCheckboxWidget.prototype.GetBorderStyle = function() { return new WidgetBorderStyle(); };

/**
* Sets widget background color.
* @memberof ApiBaseWidget
* @param {ApiColor} color
* @returns {boolean}
*/
ApiCheckboxWidget.prototype.SetBackgroundColor = function(color) { return true; };

/**
* Gets widget background color.
* @memberof ApiBaseWidget
* @returns {?ApiColor}
*/
ApiCheckboxWidget.prototype.GetBackgroundColor = function() { return new ApiColor(); };

/**
* Sets widget text color.
* @memberof ApiBaseWidget
* @param {ApiColor} color
* @returns {boolean}
*/
ApiCheckboxWidget.prototype.SetTextColor = function(color) { return true; };

/**
* Gets widget text color.
* @memberof ApiBaseWidget
* @returns {?ApiColor}
*/
ApiCheckboxWidget.prototype.GetTextColor = function() { return new ApiColor(); };

/**
* Sets widget text size.
* <note> Text size === 0 means autofit </note>
* @memberof ApiBaseWidget
* @param {pt} nSize
* @returns {boolean}
*/
ApiCheckboxWidget.prototype.SetTextSize = function(nSize) { return true; };

/**
* Gets widget text size.
* <note> Text size === 0 means autofit </note>
* @memberof ApiBaseWidget
* @returns {pt}
*/
ApiCheckboxWidget.prototype.GetTextSize = function() { return new pt(); };

/**
* Sets text autofit.
* @memberof ApiBaseWidget
* @param {boolean} bAuto
* @returns {boolean}
*/
ApiCheckboxWidget.prototype.SetAutoFit = function(bAuto) { return true; };

/**
* Checks if text is autofit.
* @memberof ApiBaseWidget
* @returns {boolean}
*/
ApiCheckboxWidget.prototype.IsAutoFit = function() { return true; };

/**
* Removes widget from parent field.
* @memberof ApiBaseWidget
* @returns {boolean}
*/
ApiCheckboxWidget.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current field widget.
* @memberof ApiBaseWidget
* @returns {string}
* @since 9.4.0
*/
ApiCheckboxWidget.prototype.GetInternalId = function() { return ""; };

/**
* Gets all field actions in json format.
* @memberof ApiBaseWidget
* @returns {JSON}
* @since 9.4.0
*/
ApiCheckboxWidget.prototype.GetActionsJSON = function() { return new JSON(); };

/**
* Returns a type of the ApiButtonField class.
* @memberof ApiButtonField
* @returns {"buttonField"}
*/
ApiButtonField.prototype.GetClassType = function() { return ""; };

/**
* Sets image for all button field widgets
* @memberof ApiButtonField
* @param {string} imageUrl
* @returns {boolean}
* @since 9.4.0
*/
ApiButtonField.prototype.SetValue = function(imageUrl) { return true; };

/**
* Sets new field name if possible.
* @memberof ApiBaseField
* @param {string} sName
* @returns {boolean}
*/
ApiButtonField.prototype.SetFullName = function(sName) { return true; };

/**
* Gets field full name.
* @memberof ApiBaseField
* @returns {string}
*/
ApiButtonField.prototype.GetFullName = function() { return ""; };

/**
* Sets new field partial name.
* @memberof ApiBaseField
* @param {string} sName
* @returns {boolean}
*/
ApiButtonField.prototype.SetPartialName = function(sName) { return true; };

/**
* Gets field partial name.
* @memberof ApiBaseField
* @returns {string}
*/
ApiButtonField.prototype.GetPartialName = function() { return ""; };

/**
* Sets field required
* @memberof ApiBaseField
* @param {boolean} bRequired
* @returns {boolean}
*/
ApiButtonField.prototype.SetRequired = function(bRequired) { return true; };

/**
* Checks if field is required
* @memberof ApiBaseField
* @returns {boolean}
*/
ApiButtonField.prototype.IsRequired = function() { return true; };

/**
* Sets field read only
* @memberof ApiBaseField
* @param {boolean} bRequired
* @returns {boolean}
*/
ApiButtonField.prototype.SetReadOnly = function(bRequired) { return true; };

/**
* Checks if field is read only
* @memberof ApiBaseField
* @returns {boolean}
*/
ApiButtonField.prototype.IsReadOnly = function() { return true; };

/**
* Gets field value
* @memberof ApiBaseField
* @returns {string}
*/
ApiButtonField.prototype.GetValue = function() { return ""; };

/**
* Adds new widget - visual representation for field
* @memberof ApiBaseField
* @param {number} nPage - page to add widget
* @param {Rect} aRect - field rect
* @returns {?ApiWidget}
*/
ApiButtonField.prototype.AddWidget = function(nPage, aRect) { return new ApiWidget(); };

/**
* Gets array with widgets of the current field.
* @memberof ApiBaseField
* @returns {ApiWidget[]}
*/
ApiButtonField.prototype.GetAllWidgets = function() { return []; };

/**
* Removes field from document.
* @memberof ApiBaseField
* @returns {boolean}
*/
ApiButtonField.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current field.
* @memberof ApiBaseField
* @returns {string}
* @since 9.4.0
*/
ApiButtonField.prototype.GetInternalId = function() { return ""; };

/**
* Sets field tooltip
* @memberof ApiBaseField
* @param {?string} tooltip
* @returns {boolean}
* @since 9.4.0
*/
ApiButtonField.prototype.SetTooltip = function(tooltip) { return true; };

/**
* Gets field tooltip
* @memberof ApiBaseField
* @returns {boolean}
* @since 9.4.0
*/
ApiButtonField.prototype.GetTooltip = function() { return true; };

/**
* Returns a type of the ApiButtonWidget class.
* @memberof ApiButtonWidget
* @returns {"buttonWidget"}
*/
ApiButtonWidget.prototype.GetClassType = function() { return ""; };

/**
* Sets button widget layout type
* @memberof ApiButtonWidget
* @param {ButtonLayout} sType - button layout type
* @returns {boolean}
*/
ApiButtonWidget.prototype.SetLayout = function(sType) { return true; };

/**
* Gets button widget layout type
* @memberof ApiButtonWidget
* @returns {ButtonLayout}
*/
ApiButtonWidget.prototype.GetLayout = function() { return new ButtonLayout(); };

/**
* Sets button widget scale when type
* @memberof ApiButtonWidget
* @param {ButtonScaleWhen} sType - button widget scale when type
* @returns {boolean}
*/
ApiButtonWidget.prototype.SetScaleWhen = function(sType) { return true; };

/**
* Gets button widget scale when type
* @memberof ApiButtonWidget
* @returns {ButtonScaleWhen}
*/
ApiButtonWidget.prototype.GetScaleWhen = function() { return new ButtonScaleWhen(); };

/**
* Sets button widget scale how type
* @memberof ApiButtonWidget
* @param {ButtonScaleHow} sType - button widget scale how type
* @returns {boolean}
*/
ApiButtonWidget.prototype.SetScaleHow = function(sType) { return true; };

/**
* Gets button widget scale when type
* @memberof ApiButtonWidget
* @returns {ButtonScaleHow}
*/
ApiButtonWidget.prototype.GetScaleHow = function() { return new ButtonScaleHow(); };

/**
* Sets button widget fit bounds.
* @memberof ApiButtonWidget
* @param {boolean} bFit
* @returns {boolean}
*/
ApiButtonWidget.prototype.SetFitBounds = function(bFit) { return true; };

/**
* Checks if button widget is fit bounds.
* @memberof ApiButtonWidget
* @returns {boolean}
*/
ApiButtonWidget.prototype.IsFitBounds = function() { return true; };

/**
* Sets button widget icon x position.
* @memberof ApiButtonWidget
* @param {percentage} nPosX
* @returns {boolean}
*/
ApiButtonWidget.prototype.SetIconXPos = function(nPosX) { return true; };

/**
* Gets button widget icon x position.
* @memberof ApiButtonWidget
* @returns {percentage}
*/
ApiButtonWidget.prototype.GetIconXPos = function() { return new percentage(); };

/**
* Sets button widget icon y position.
* @memberof ApiButtonWidget
* @param {percentage} nPosY
* @returns {boolean}
*/
ApiButtonWidget.prototype.SetIconYPos = function(nPosY) { return true; };

/**
* Gets button widget icon y position.
* @memberof ApiButtonWidget
* @returns {percentage}
*/
ApiButtonWidget.prototype.GetIconYPos = function() { return new percentage(); };

/**
* Sets button widget behavior.
* @memberof ApiButtonWidget
* @param {ButtonBehavior} sType
* @returns {boolean}
*/
ApiButtonWidget.prototype.SetBehavior = function(sType) { return true; };

/**
* Gets button widget behavior.
* @memberof ApiButtonWidget
* @returns {ButtonBehavior}
*/
ApiButtonWidget.prototype.GetBehavior = function() { return new ButtonBehavior(); };

/**
* Sets label to button widget field.
* @memberof ApiButtonWidget
* @param {string} sLabel - button label
* @param {ButtonAppearance} [sApType='normal'] - for what state is the label set 
* @returns {boolean}
*/
ApiButtonWidget.prototype.SetLabel = function(sLabel, sApType) { return true; };

/**
* Gets label from button widget field.
* @memberof ApiButtonWidget
* @param {ButtonAppearance} [sApType='normal'] - from what state is the label set 
* @returns {?string}
*/
ApiButtonWidget.prototype.GetLabel = function(sApType) { return ""; };

/**
* Sets image to button widget field.
* @memberof ApiButtonWidget
* @param {string} [sImageUrl=''] - image url
* @param {ButtonAppearance} [sApType='normal'] - for what state is the picture set 
* @returns {boolean}
*/
ApiButtonWidget.prototype.SetImage = function(sImageUrl, sApType) { return true; };

/**
* Sets field rect.
* @memberof ApiBaseWidget
* @param {Rect} rect
* @returns {boolean}
*/
ApiButtonWidget.prototype.SetRect = function(rect) { return true; };

/**
* Sets field rect.
* @memberof ApiBaseWidget
* @returns {Rect}
*/
ApiButtonWidget.prototype.GetRect = function() { return new Rect(); };

/**
* Sets widget position.
* @memberof ApiBaseWidget
* @param {Point} position
* @returns {boolean}
*/
ApiButtonWidget.prototype.SetPosition = function(position) { return true; };

/**
* Gets widget position.
* @memberof ApiBaseWidget
* @returns {Point}
*/
ApiButtonWidget.prototype.GetPosition = function() { return new Point(); };

/**
* Sets widget border color.
* @memberof ApiBaseWidget
* @param {ApiColor} color
* @returns {boolean}
*/
ApiButtonWidget.prototype.SetBorderColor = function(color) { return true; };

/**
* Gets widget border color.
* @memberof ApiBaseWidget
* @returns {?ApiColor}
*/
ApiButtonWidget.prototype.GetBorderColor = function() { return new ApiColor(); };

/**
* Sets widget border width.
* @memberof ApiBaseWidget
* @param {WidgetBorderWidth} sBorderWidth
* @returns {boolean}
*/
ApiButtonWidget.prototype.SetBorderWidth = function(sBorderWidth) { return true; };

/**
* Gets widget border width.
* @memberof ApiBaseWidget
* @returns {WidgetBorderWidth}
*/
ApiButtonWidget.prototype.GetBorderWidth = function() { return new WidgetBorderWidth(); };

/**
* Sets widget border style.
* @memberof ApiBaseWidget
* @param {WidgetBorderStyle} sBorderStyle
* @returns {boolean}
*/
ApiButtonWidget.prototype.SetBorderStyle = function(sBorderStyle) { return true; };

/**
* Gets widget border style.
* @memberof ApiBaseWidget
* @returns {WidgetBorderStyle}
*/
ApiButtonWidget.prototype.GetBorderStyle = function() { return new WidgetBorderStyle(); };

/**
* Sets widget background color.
* @memberof ApiBaseWidget
* @param {ApiColor} color
* @returns {boolean}
*/
ApiButtonWidget.prototype.SetBackgroundColor = function(color) { return true; };

/**
* Gets widget background color.
* @memberof ApiBaseWidget
* @returns {?ApiColor}
*/
ApiButtonWidget.prototype.GetBackgroundColor = function() { return new ApiColor(); };

/**
* Sets widget text color.
* @memberof ApiBaseWidget
* @param {ApiColor} color
* @returns {boolean}
*/
ApiButtonWidget.prototype.SetTextColor = function(color) { return true; };

/**
* Gets widget text color.
* @memberof ApiBaseWidget
* @returns {?ApiColor}
*/
ApiButtonWidget.prototype.GetTextColor = function() { return new ApiColor(); };

/**
* Sets widget text size.
* <note> Text size === 0 means autofit </note>
* @memberof ApiBaseWidget
* @param {pt} nSize
* @returns {boolean}
*/
ApiButtonWidget.prototype.SetTextSize = function(nSize) { return true; };

/**
* Gets widget text size.
* <note> Text size === 0 means autofit </note>
* @memberof ApiBaseWidget
* @returns {pt}
*/
ApiButtonWidget.prototype.GetTextSize = function() { return new pt(); };

/**
* Sets text autofit.
* @memberof ApiBaseWidget
* @param {boolean} bAuto
* @returns {boolean}
*/
ApiButtonWidget.prototype.SetAutoFit = function(bAuto) { return true; };

/**
* Checks if text is autofit.
* @memberof ApiBaseWidget
* @returns {boolean}
*/
ApiButtonWidget.prototype.IsAutoFit = function() { return true; };

/**
* Removes widget from parent field.
* @memberof ApiBaseWidget
* @returns {boolean}
*/
ApiButtonWidget.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current field widget.
* @memberof ApiBaseWidget
* @returns {string}
* @since 9.4.0
*/
ApiButtonWidget.prototype.GetInternalId = function() { return ""; };

/**
* Gets all field actions in json format.
* @memberof ApiBaseWidget
* @returns {JSON}
* @since 9.4.0
*/
ApiButtonWidget.prototype.GetActionsJSON = function() { return new JSON(); };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @param {Rect} rect
* @returns {boolean}
*/
ApiBaseAnnotation.prototype.SetRect = function(rect) { return true; };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @returns {Rect}
*/
ApiBaseAnnotation.prototype.GetRect = function() { return new Rect(); };

/**
* Sets annotation position.
* @memberof ApiBaseAnnotation
* @param {Point} position
* @returns {boolean}
*/
ApiBaseAnnotation.prototype.SetPosition = function(position) { return true; };

/**
* Gets annotation position.
* @memberof ApiBaseAnnotation
* @returns {Point}
*/
ApiBaseAnnotation.prototype.GetPosition = function() { return new Point(); };

/**
* Sets annotation border color.
* @memberof ApiBaseAnnotation
* @param {ApiColor} color
* @returns {boolean}
*/
ApiBaseAnnotation.prototype.SetBorderColor = function(color) { return true; };

/**
* Gets annotation border color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiBaseAnnotation.prototype.GetBorderColor = function() { return new ApiColor(); };

/**
* Sets annotation fill color.
* @memberof ApiBaseAnnotation
* @param {?ApiColor} color - color to set fill (omit the argument to set no fill)
* @returns {boolean}
*/
ApiBaseAnnotation.prototype.SetFillColor = function(color) { return true; };

/**
* Gets annotation fill color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiBaseAnnotation.prototype.GetFillColor = function() { return new ApiColor(); };

/**
* Sets annotation border width.
* @memberof ApiBaseAnnotation
* @param {pt} width
* @returns {boolean}
*/
ApiBaseAnnotation.prototype.SetBorderWidth = function(width) { return true; };

/**
* Gets annotation border width.
* @memberof ApiBaseAnnotation
* @returns {pt}
*/
ApiBaseAnnotation.prototype.GetBorderWidth = function() { return new pt(); };

/**
* Sets annotation border style.
* @memberof ApiBaseAnnotation
* @param {AnnotBorderStyle} borderStyle
* @returns {boolean}
*/
ApiBaseAnnotation.prototype.SetBorderStyle = function(borderStyle) { return true; };

/**
* Gets annotation border style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderStyle}
*/
ApiBaseAnnotation.prototype.GetBorderStyle = function() { return new AnnotBorderStyle(); };

/**
* Sets annotation author name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiBaseAnnotation.prototype.SetAuthorName = function(name) { return true; };

/**
* Gets annotation author name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiBaseAnnotation.prototype.GetAuthorName = function() { return ""; };

/**
* Sets annotation contents.
* @memberof ApiBaseAnnotation
* @param {?string} contents
* @returns {boolean}
*/
ApiBaseAnnotation.prototype.SetContents = function(contents) { return true; };

/**
* Gets annotation contents.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiBaseAnnotation.prototype.GetContents = function() { return ""; };

/**
* Sets annotation creation date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiBaseAnnotation.prototype.SetCreationDate = function(timeStamp) { return true; };

/**
* Gets annotation creation date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiBaseAnnotation.prototype.GetCreationDate = function() { return 0; };

/**
* Sets annotation last modification date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiBaseAnnotation.prototype.SetModDate = function(timeStamp) { return true; };

/**
* Gets annotation last modification date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiBaseAnnotation.prototype.GetModDate = function() { return 0; };

/**
* Sets annotation unique name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiBaseAnnotation.prototype.SetUniqueName = function(name) { return true; };

/**
* Gets annotation unique name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiBaseAnnotation.prototype.GetUniqueName = function() { return ""; };

/**
* Sets annotation opacity.
* @memberof ApiBaseAnnotation
* @param {percentage} name
* @returns {boolean}
*/
ApiBaseAnnotation.prototype.SetOpacity = function(name) { return true; };

/**
* Gets annotation opacity.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiBaseAnnotation.prototype.GetOpacity = function() { return ""; };

/**
* Sets annotation subject.
* @memberof ApiBaseAnnotation
* @param {?string} subject
* @returns {boolean}
*/
ApiBaseAnnotation.prototype.SetSubject = function(subject) { return true; };

/**
* Gets annotation subject.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiBaseAnnotation.prototype.GetSubject = function() { return ""; };

/**
* Sets annotation display type.
* @memberof ApiBaseAnnotation
* @param {DisplayType} display
* @returns {boolean}
*/
ApiBaseAnnotation.prototype.SetDisplay = function(display) { return true; };

/**
* Gets annotation display type.
* @memberof ApiBaseAnnotation
* @returns {DisplayType}
*/
ApiBaseAnnotation.prototype.GetDisplay = function() { return new DisplayType(); };

/**
* Sets annotation dash pattern.
* <note> The border style property must be set to "dashed". </note>
* @memberof ApiBaseAnnotation
* @param {number[]} pattern - A dash array defining a pattern of dashes and gaps to be used in drawing a dashed border. For example, a value of [3, 2] specifies a border drawn with 3-point dashes alternating with 2-point gaps.
* @returns {boolean}
*/
ApiBaseAnnotation.prototype.SetDashPattern = function(pattern) { return true; };

/**
* Gets annotation dash pattern.
* @memberof ApiBaseAnnotation
* @returns {number[]}
*/
ApiBaseAnnotation.prototype.GetDashPattern = function() { return []; };

/**
* Sets annotation border effect style.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {AnnotBorderEffectStyle} style
* @returns {boolean}
*/
ApiBaseAnnotation.prototype.SetBorderEffectStyle = function(style) { return true; };

/**
* Gets annotation border effect style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderEffectStyle}
*/
ApiBaseAnnotation.prototype.GetBorderEffectStyle = function() { return new AnnotBorderEffectStyle(); };

/**
* Sets annotation border effect intensity.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiBaseAnnotation.prototype.SetBorderEffectIntensity = function(value) { return true; };

/**
* Gets annotation border effect intensity.
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiBaseAnnotation.prototype.GetBorderEffectIntensity = function(value) { return true; };

/**
* Adds reply on this annot.
* @memberof ApiBaseAnnotation
* @param {ApiTextAnnotation} textAnnot
* @returns {boolean}
*/
ApiBaseAnnotation.prototype.AddReply = function(textAnnot) { return true; };

/**
* Gets replies on this annot.
* @memberof ApiBaseAnnotation
* @returns {ApiTextAnnotation[]}
*/
ApiBaseAnnotation.prototype.GetReplies = function() { return []; };

/**
* Removes annotation from document.
* @memberof ApiBaseAnnotation
* @returns {boolean}
*/
ApiBaseAnnotation.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current annotation.
* @memberof ApiBaseAnnotation
* @returns {string}
* @since 9.4.0
*/
ApiBaseAnnotation.prototype.GetInternalId = function() { return ""; };

/**
* Returns a type of the ApiTextAnnotation class.
* @memberof ApiTextAnnotation
* @returns {"textAnnot"}
*/
ApiTextAnnotation.prototype.GetClassType = function() { return ""; };

/**
* Sets icon type for this annotation.
* @memberof ApiTextAnnotation
* @param {TextIconType} iconType
* @returns {boolean}
*/
ApiTextAnnotation.prototype.SetIconType = function(iconType) { return true; };

/**
* Gets icon type of this annotation.
* @memberof ApiTextAnnotation
* @returns {TextIconType}
*/
ApiTextAnnotation.prototype.GetIconType = function() { return new TextIconType(); };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @param {Rect} rect
* @returns {boolean}
*/
ApiTextAnnotation.prototype.SetRect = function(rect) { return true; };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @returns {Rect}
*/
ApiTextAnnotation.prototype.GetRect = function() { return new Rect(); };

/**
* Sets annotation position.
* @memberof ApiBaseAnnotation
* @param {Point} position
* @returns {boolean}
*/
ApiTextAnnotation.prototype.SetPosition = function(position) { return true; };

/**
* Gets annotation position.
* @memberof ApiBaseAnnotation
* @returns {Point}
*/
ApiTextAnnotation.prototype.GetPosition = function() { return new Point(); };

/**
* Sets annotation border color.
* @memberof ApiBaseAnnotation
* @param {ApiColor} color
* @returns {boolean}
*/
ApiTextAnnotation.prototype.SetBorderColor = function(color) { return true; };

/**
* Gets annotation border color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiTextAnnotation.prototype.GetBorderColor = function() { return new ApiColor(); };

/**
* Sets annotation fill color.
* @memberof ApiBaseAnnotation
* @param {?ApiColor} color - color to set fill (omit the argument to set no fill)
* @returns {boolean}
*/
ApiTextAnnotation.prototype.SetFillColor = function(color) { return true; };

/**
* Gets annotation fill color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiTextAnnotation.prototype.GetFillColor = function() { return new ApiColor(); };

/**
* Sets annotation border width.
* @memberof ApiBaseAnnotation
* @param {pt} width
* @returns {boolean}
*/
ApiTextAnnotation.prototype.SetBorderWidth = function(width) { return true; };

/**
* Gets annotation border width.
* @memberof ApiBaseAnnotation
* @returns {pt}
*/
ApiTextAnnotation.prototype.GetBorderWidth = function() { return new pt(); };

/**
* Sets annotation border style.
* @memberof ApiBaseAnnotation
* @param {AnnotBorderStyle} borderStyle
* @returns {boolean}
*/
ApiTextAnnotation.prototype.SetBorderStyle = function(borderStyle) { return true; };

/**
* Gets annotation border style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderStyle}
*/
ApiTextAnnotation.prototype.GetBorderStyle = function() { return new AnnotBorderStyle(); };

/**
* Sets annotation author name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiTextAnnotation.prototype.SetAuthorName = function(name) { return true; };

/**
* Gets annotation author name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiTextAnnotation.prototype.GetAuthorName = function() { return ""; };

/**
* Sets annotation contents.
* @memberof ApiBaseAnnotation
* @param {?string} contents
* @returns {boolean}
*/
ApiTextAnnotation.prototype.SetContents = function(contents) { return true; };

/**
* Gets annotation contents.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiTextAnnotation.prototype.GetContents = function() { return ""; };

/**
* Sets annotation creation date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiTextAnnotation.prototype.SetCreationDate = function(timeStamp) { return true; };

/**
* Gets annotation creation date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiTextAnnotation.prototype.GetCreationDate = function() { return 0; };

/**
* Sets annotation last modification date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiTextAnnotation.prototype.SetModDate = function(timeStamp) { return true; };

/**
* Gets annotation last modification date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiTextAnnotation.prototype.GetModDate = function() { return 0; };

/**
* Sets annotation unique name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiTextAnnotation.prototype.SetUniqueName = function(name) { return true; };

/**
* Gets annotation unique name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiTextAnnotation.prototype.GetUniqueName = function() { return ""; };

/**
* Sets annotation opacity.
* @memberof ApiBaseAnnotation
* @param {percentage} name
* @returns {boolean}
*/
ApiTextAnnotation.prototype.SetOpacity = function(name) { return true; };

/**
* Gets annotation opacity.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiTextAnnotation.prototype.GetOpacity = function() { return ""; };

/**
* Sets annotation subject.
* @memberof ApiBaseAnnotation
* @param {?string} subject
* @returns {boolean}
*/
ApiTextAnnotation.prototype.SetSubject = function(subject) { return true; };

/**
* Gets annotation subject.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiTextAnnotation.prototype.GetSubject = function() { return ""; };

/**
* Sets annotation display type.
* @memberof ApiBaseAnnotation
* @param {DisplayType} display
* @returns {boolean}
*/
ApiTextAnnotation.prototype.SetDisplay = function(display) { return true; };

/**
* Gets annotation display type.
* @memberof ApiBaseAnnotation
* @returns {DisplayType}
*/
ApiTextAnnotation.prototype.GetDisplay = function() { return new DisplayType(); };

/**
* Sets annotation dash pattern.
* <note> The border style property must be set to "dashed". </note>
* @memberof ApiBaseAnnotation
* @param {number[]} pattern - A dash array defining a pattern of dashes and gaps to be used in drawing a dashed border. For example, a value of [3, 2] specifies a border drawn with 3-point dashes alternating with 2-point gaps.
* @returns {boolean}
*/
ApiTextAnnotation.prototype.SetDashPattern = function(pattern) { return true; };

/**
* Gets annotation dash pattern.
* @memberof ApiBaseAnnotation
* @returns {number[]}
*/
ApiTextAnnotation.prototype.GetDashPattern = function() { return []; };

/**
* Sets annotation border effect style.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {AnnotBorderEffectStyle} style
* @returns {boolean}
*/
ApiTextAnnotation.prototype.SetBorderEffectStyle = function(style) { return true; };

/**
* Gets annotation border effect style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderEffectStyle}
*/
ApiTextAnnotation.prototype.GetBorderEffectStyle = function() { return new AnnotBorderEffectStyle(); };

/**
* Sets annotation border effect intensity.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiTextAnnotation.prototype.SetBorderEffectIntensity = function(value) { return true; };

/**
* Gets annotation border effect intensity.
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiTextAnnotation.prototype.GetBorderEffectIntensity = function(value) { return true; };

/**
* Adds reply on this annot.
* @memberof ApiBaseAnnotation
* @param {ApiTextAnnotation} textAnnot
* @returns {boolean}
*/
ApiTextAnnotation.prototype.AddReply = function(textAnnot) { return true; };

/**
* Gets replies on this annot.
* @memberof ApiBaseAnnotation
* @returns {ApiTextAnnotation[]}
*/
ApiTextAnnotation.prototype.GetReplies = function() { return []; };

/**
* Removes annotation from document.
* @memberof ApiBaseAnnotation
* @returns {boolean}
*/
ApiTextAnnotation.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current annotation.
* @memberof ApiBaseAnnotation
* @returns {string}
* @since 9.4.0
*/
ApiTextAnnotation.prototype.GetInternalId = function() { return ""; };

/**
* Returns a type of the ApiCircleAnnotation class.
* @memberof ApiCircleAnnotation
* @returns {"circleAnnot"}
*/
ApiCircleAnnotation.prototype.GetClassType = function() { return ""; };

/**
* Sets annotation rect difference.
* @memberof ApiCircleAnnotation
* @param {RectDiff} rectDiff - A set of four numbers that shall describe the numerical differences between two rectangles.
* @returns {boolean}
*/
ApiCircleAnnotation.prototype.SetRectDiff = function(rectDiff) { return true; };

/**
* Gets annotation rect difference.
* @memberof ApiCircleAnnotation
* @returns {Rect}
*/
ApiCircleAnnotation.prototype.GetRectDiff = function() { return new Rect(); };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @param {Rect} rect
* @returns {boolean}
*/
ApiCircleAnnotation.prototype.SetRect = function(rect) { return true; };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @returns {Rect}
*/
ApiCircleAnnotation.prototype.GetRect = function() { return new Rect(); };

/**
* Sets annotation position.
* @memberof ApiBaseAnnotation
* @param {Point} position
* @returns {boolean}
*/
ApiCircleAnnotation.prototype.SetPosition = function(position) { return true; };

/**
* Gets annotation position.
* @memberof ApiBaseAnnotation
* @returns {Point}
*/
ApiCircleAnnotation.prototype.GetPosition = function() { return new Point(); };

/**
* Sets annotation border color.
* @memberof ApiBaseAnnotation
* @param {ApiColor} color
* @returns {boolean}
*/
ApiCircleAnnotation.prototype.SetBorderColor = function(color) { return true; };

/**
* Gets annotation border color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiCircleAnnotation.prototype.GetBorderColor = function() { return new ApiColor(); };

/**
* Sets annotation fill color.
* @memberof ApiBaseAnnotation
* @param {?ApiColor} color - color to set fill (omit the argument to set no fill)
* @returns {boolean}
*/
ApiCircleAnnotation.prototype.SetFillColor = function(color) { return true; };

/**
* Gets annotation fill color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiCircleAnnotation.prototype.GetFillColor = function() { return new ApiColor(); };

/**
* Sets annotation border width.
* @memberof ApiBaseAnnotation
* @param {pt} width
* @returns {boolean}
*/
ApiCircleAnnotation.prototype.SetBorderWidth = function(width) { return true; };

/**
* Gets annotation border width.
* @memberof ApiBaseAnnotation
* @returns {pt}
*/
ApiCircleAnnotation.prototype.GetBorderWidth = function() { return new pt(); };

/**
* Sets annotation border style.
* @memberof ApiBaseAnnotation
* @param {AnnotBorderStyle} borderStyle
* @returns {boolean}
*/
ApiCircleAnnotation.prototype.SetBorderStyle = function(borderStyle) { return true; };

/**
* Gets annotation border style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderStyle}
*/
ApiCircleAnnotation.prototype.GetBorderStyle = function() { return new AnnotBorderStyle(); };

/**
* Sets annotation author name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiCircleAnnotation.prototype.SetAuthorName = function(name) { return true; };

/**
* Gets annotation author name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiCircleAnnotation.prototype.GetAuthorName = function() { return ""; };

/**
* Sets annotation contents.
* @memberof ApiBaseAnnotation
* @param {?string} contents
* @returns {boolean}
*/
ApiCircleAnnotation.prototype.SetContents = function(contents) { return true; };

/**
* Gets annotation contents.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiCircleAnnotation.prototype.GetContents = function() { return ""; };

/**
* Sets annotation creation date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiCircleAnnotation.prototype.SetCreationDate = function(timeStamp) { return true; };

/**
* Gets annotation creation date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiCircleAnnotation.prototype.GetCreationDate = function() { return 0; };

/**
* Sets annotation last modification date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiCircleAnnotation.prototype.SetModDate = function(timeStamp) { return true; };

/**
* Gets annotation last modification date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiCircleAnnotation.prototype.GetModDate = function() { return 0; };

/**
* Sets annotation unique name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiCircleAnnotation.prototype.SetUniqueName = function(name) { return true; };

/**
* Gets annotation unique name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiCircleAnnotation.prototype.GetUniqueName = function() { return ""; };

/**
* Sets annotation opacity.
* @memberof ApiBaseAnnotation
* @param {percentage} name
* @returns {boolean}
*/
ApiCircleAnnotation.prototype.SetOpacity = function(name) { return true; };

/**
* Gets annotation opacity.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiCircleAnnotation.prototype.GetOpacity = function() { return ""; };

/**
* Sets annotation subject.
* @memberof ApiBaseAnnotation
* @param {?string} subject
* @returns {boolean}
*/
ApiCircleAnnotation.prototype.SetSubject = function(subject) { return true; };

/**
* Gets annotation subject.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiCircleAnnotation.prototype.GetSubject = function() { return ""; };

/**
* Sets annotation display type.
* @memberof ApiBaseAnnotation
* @param {DisplayType} display
* @returns {boolean}
*/
ApiCircleAnnotation.prototype.SetDisplay = function(display) { return true; };

/**
* Gets annotation display type.
* @memberof ApiBaseAnnotation
* @returns {DisplayType}
*/
ApiCircleAnnotation.prototype.GetDisplay = function() { return new DisplayType(); };

/**
* Sets annotation dash pattern.
* <note> The border style property must be set to "dashed". </note>
* @memberof ApiBaseAnnotation
* @param {number[]} pattern - A dash array defining a pattern of dashes and gaps to be used in drawing a dashed border. For example, a value of [3, 2] specifies a border drawn with 3-point dashes alternating with 2-point gaps.
* @returns {boolean}
*/
ApiCircleAnnotation.prototype.SetDashPattern = function(pattern) { return true; };

/**
* Gets annotation dash pattern.
* @memberof ApiBaseAnnotation
* @returns {number[]}
*/
ApiCircleAnnotation.prototype.GetDashPattern = function() { return []; };

/**
* Sets annotation border effect style.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {AnnotBorderEffectStyle} style
* @returns {boolean}
*/
ApiCircleAnnotation.prototype.SetBorderEffectStyle = function(style) { return true; };

/**
* Gets annotation border effect style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderEffectStyle}
*/
ApiCircleAnnotation.prototype.GetBorderEffectStyle = function() { return new AnnotBorderEffectStyle(); };

/**
* Sets annotation border effect intensity.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiCircleAnnotation.prototype.SetBorderEffectIntensity = function(value) { return true; };

/**
* Gets annotation border effect intensity.
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiCircleAnnotation.prototype.GetBorderEffectIntensity = function(value) { return true; };

/**
* Adds reply on this annot.
* @memberof ApiBaseAnnotation
* @param {ApiTextAnnotation} textAnnot
* @returns {boolean}
*/
ApiCircleAnnotation.prototype.AddReply = function(textAnnot) { return true; };

/**
* Gets replies on this annot.
* @memberof ApiBaseAnnotation
* @returns {ApiTextAnnotation[]}
*/
ApiCircleAnnotation.prototype.GetReplies = function() { return []; };

/**
* Removes annotation from document.
* @memberof ApiBaseAnnotation
* @returns {boolean}
*/
ApiCircleAnnotation.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current annotation.
* @memberof ApiBaseAnnotation
* @returns {string}
* @since 9.4.0
*/
ApiCircleAnnotation.prototype.GetInternalId = function() { return ""; };

/**
* Returns a type of the ApiSquareAnnotation class.
* @memberof ApiSquareAnnotation
* @returns {"squareAnnot"}
*/
ApiSquareAnnotation.prototype.GetClassType = function() { return ""; };

/**
* Sets annotation rect difference.
* @memberof ApiSquareAnnotation
* @param {RectDiff} rectDiff - A set of four numbers that shall describe the numerical differences between two rectangles.
* @returns {boolean}
*/
ApiSquareAnnotation.prototype.SetRectDiff = function(rectDiff) { return true; };

/**
* Gets annotation rect difference.
* @memberof ApiSquareAnnotation
* @returns {Rect}
*/
ApiSquareAnnotation.prototype.GetRectDiff = function() { return new Rect(); };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @param {Rect} rect
* @returns {boolean}
*/
ApiSquareAnnotation.prototype.SetRect = function(rect) { return true; };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @returns {Rect}
*/
ApiSquareAnnotation.prototype.GetRect = function() { return new Rect(); };

/**
* Sets annotation position.
* @memberof ApiBaseAnnotation
* @param {Point} position
* @returns {boolean}
*/
ApiSquareAnnotation.prototype.SetPosition = function(position) { return true; };

/**
* Gets annotation position.
* @memberof ApiBaseAnnotation
* @returns {Point}
*/
ApiSquareAnnotation.prototype.GetPosition = function() { return new Point(); };

/**
* Sets annotation border color.
* @memberof ApiBaseAnnotation
* @param {ApiColor} color
* @returns {boolean}
*/
ApiSquareAnnotation.prototype.SetBorderColor = function(color) { return true; };

/**
* Gets annotation border color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiSquareAnnotation.prototype.GetBorderColor = function() { return new ApiColor(); };

/**
* Sets annotation fill color.
* @memberof ApiBaseAnnotation
* @param {?ApiColor} color - color to set fill (omit the argument to set no fill)
* @returns {boolean}
*/
ApiSquareAnnotation.prototype.SetFillColor = function(color) { return true; };

/**
* Gets annotation fill color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiSquareAnnotation.prototype.GetFillColor = function() { return new ApiColor(); };

/**
* Sets annotation border width.
* @memberof ApiBaseAnnotation
* @param {pt} width
* @returns {boolean}
*/
ApiSquareAnnotation.prototype.SetBorderWidth = function(width) { return true; };

/**
* Gets annotation border width.
* @memberof ApiBaseAnnotation
* @returns {pt}
*/
ApiSquareAnnotation.prototype.GetBorderWidth = function() { return new pt(); };

/**
* Sets annotation border style.
* @memberof ApiBaseAnnotation
* @param {AnnotBorderStyle} borderStyle
* @returns {boolean}
*/
ApiSquareAnnotation.prototype.SetBorderStyle = function(borderStyle) { return true; };

/**
* Gets annotation border style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderStyle}
*/
ApiSquareAnnotation.prototype.GetBorderStyle = function() { return new AnnotBorderStyle(); };

/**
* Sets annotation author name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiSquareAnnotation.prototype.SetAuthorName = function(name) { return true; };

/**
* Gets annotation author name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiSquareAnnotation.prototype.GetAuthorName = function() { return ""; };

/**
* Sets annotation contents.
* @memberof ApiBaseAnnotation
* @param {?string} contents
* @returns {boolean}
*/
ApiSquareAnnotation.prototype.SetContents = function(contents) { return true; };

/**
* Gets annotation contents.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiSquareAnnotation.prototype.GetContents = function() { return ""; };

/**
* Sets annotation creation date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiSquareAnnotation.prototype.SetCreationDate = function(timeStamp) { return true; };

/**
* Gets annotation creation date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiSquareAnnotation.prototype.GetCreationDate = function() { return 0; };

/**
* Sets annotation last modification date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiSquareAnnotation.prototype.SetModDate = function(timeStamp) { return true; };

/**
* Gets annotation last modification date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiSquareAnnotation.prototype.GetModDate = function() { return 0; };

/**
* Sets annotation unique name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiSquareAnnotation.prototype.SetUniqueName = function(name) { return true; };

/**
* Gets annotation unique name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiSquareAnnotation.prototype.GetUniqueName = function() { return ""; };

/**
* Sets annotation opacity.
* @memberof ApiBaseAnnotation
* @param {percentage} name
* @returns {boolean}
*/
ApiSquareAnnotation.prototype.SetOpacity = function(name) { return true; };

/**
* Gets annotation opacity.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiSquareAnnotation.prototype.GetOpacity = function() { return ""; };

/**
* Sets annotation subject.
* @memberof ApiBaseAnnotation
* @param {?string} subject
* @returns {boolean}
*/
ApiSquareAnnotation.prototype.SetSubject = function(subject) { return true; };

/**
* Gets annotation subject.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiSquareAnnotation.prototype.GetSubject = function() { return ""; };

/**
* Sets annotation display type.
* @memberof ApiBaseAnnotation
* @param {DisplayType} display
* @returns {boolean}
*/
ApiSquareAnnotation.prototype.SetDisplay = function(display) { return true; };

/**
* Gets annotation display type.
* @memberof ApiBaseAnnotation
* @returns {DisplayType}
*/
ApiSquareAnnotation.prototype.GetDisplay = function() { return new DisplayType(); };

/**
* Sets annotation dash pattern.
* <note> The border style property must be set to "dashed". </note>
* @memberof ApiBaseAnnotation
* @param {number[]} pattern - A dash array defining a pattern of dashes and gaps to be used in drawing a dashed border. For example, a value of [3, 2] specifies a border drawn with 3-point dashes alternating with 2-point gaps.
* @returns {boolean}
*/
ApiSquareAnnotation.prototype.SetDashPattern = function(pattern) { return true; };

/**
* Gets annotation dash pattern.
* @memberof ApiBaseAnnotation
* @returns {number[]}
*/
ApiSquareAnnotation.prototype.GetDashPattern = function() { return []; };

/**
* Sets annotation border effect style.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {AnnotBorderEffectStyle} style
* @returns {boolean}
*/
ApiSquareAnnotation.prototype.SetBorderEffectStyle = function(style) { return true; };

/**
* Gets annotation border effect style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderEffectStyle}
*/
ApiSquareAnnotation.prototype.GetBorderEffectStyle = function() { return new AnnotBorderEffectStyle(); };

/**
* Sets annotation border effect intensity.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiSquareAnnotation.prototype.SetBorderEffectIntensity = function(value) { return true; };

/**
* Gets annotation border effect intensity.
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiSquareAnnotation.prototype.GetBorderEffectIntensity = function(value) { return true; };

/**
* Adds reply on this annot.
* @memberof ApiBaseAnnotation
* @param {ApiTextAnnotation} textAnnot
* @returns {boolean}
*/
ApiSquareAnnotation.prototype.AddReply = function(textAnnot) { return true; };

/**
* Gets replies on this annot.
* @memberof ApiBaseAnnotation
* @returns {ApiTextAnnotation[]}
*/
ApiSquareAnnotation.prototype.GetReplies = function() { return []; };

/**
* Removes annotation from document.
* @memberof ApiBaseAnnotation
* @returns {boolean}
*/
ApiSquareAnnotation.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current annotation.
* @memberof ApiBaseAnnotation
* @returns {string}
* @since 9.4.0
*/
ApiSquareAnnotation.prototype.GetInternalId = function() { return ""; };

/**
* Returns a type of the ApiFreeTextAnnotation class.
* @memberof ApiFreeTextAnnotation
* @returns {"freeTextAnnot"}
*/
ApiFreeTextAnnotation.prototype.GetClassType = function() { return ""; };

/**
* Sets intent type for this annotation.
* @memberof ApiFreeTextAnnotation
* @param {FreeTextIntent} intentType
* @returns {boolean}
*/
ApiFreeTextAnnotation.prototype.SetIntent = function(intentType) { return true; };

/**
* Gets intent type of this annotation.
* @memberof ApiFreeTextAnnotation
* @returns {FreeTextIntent}
*/
ApiFreeTextAnnotation.prototype.GetIntent = function() { return new FreeTextIntent(); };

/**
* Sets annot callout.
* @memberof ApiFreeTextAnnotation
* @param {FreeTextCallout} callout
* @returns {boolean}
*/
ApiFreeTextAnnotation.prototype.SetCallout = function(callout) { return true; };

/**
* Gets annot callout.
* @memberof ApiFreeTextAnnotation
* @returns {FreeTextCallout}
*/
ApiFreeTextAnnotation.prototype.GetCallout = function() { return new FreeTextCallout(); };

/**
* Sets annotation rect difference.
* @memberof ApiFreeTextAnnotation
* @param {RectDiff} rectDiff - A set of four numbers that shall describe the numerical differences between two rectangles.
* @returns {boolean}
*/
ApiFreeTextAnnotation.prototype.SetRectDiff = function(rectDiff) { return true; };

/**
* Gets annotation rect difference.
* @memberof ApiFreeTextAnnotation
* @returns {Rect}
*/
ApiFreeTextAnnotation.prototype.GetRectDiff = function() { return new Rect(); };

/**
* Gets annotation rich content.
* @memberof ApiFreeTextAnnotation
* @returns {ApiRichContent}
*/
ApiFreeTextAnnotation.prototype.GetContent = function() { return new ApiRichContent(); };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @param {Rect} rect
* @returns {boolean}
*/
ApiFreeTextAnnotation.prototype.SetRect = function(rect) { return true; };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @returns {Rect}
*/
ApiFreeTextAnnotation.prototype.GetRect = function() { return new Rect(); };

/**
* Sets annotation position.
* @memberof ApiBaseAnnotation
* @param {Point} position
* @returns {boolean}
*/
ApiFreeTextAnnotation.prototype.SetPosition = function(position) { return true; };

/**
* Gets annotation position.
* @memberof ApiBaseAnnotation
* @returns {Point}
*/
ApiFreeTextAnnotation.prototype.GetPosition = function() { return new Point(); };

/**
* Sets annotation border color.
* @memberof ApiBaseAnnotation
* @param {ApiColor} color
* @returns {boolean}
*/
ApiFreeTextAnnotation.prototype.SetBorderColor = function(color) { return true; };

/**
* Gets annotation border color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiFreeTextAnnotation.prototype.GetBorderColor = function() { return new ApiColor(); };

/**
* Sets annotation fill color.
* @memberof ApiBaseAnnotation
* @param {?ApiColor} color - color to set fill (omit the argument to set no fill)
* @returns {boolean}
*/
ApiFreeTextAnnotation.prototype.SetFillColor = function(color) { return true; };

/**
* Gets annotation fill color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiFreeTextAnnotation.prototype.GetFillColor = function() { return new ApiColor(); };

/**
* Sets annotation border width.
* @memberof ApiBaseAnnotation
* @param {pt} width
* @returns {boolean}
*/
ApiFreeTextAnnotation.prototype.SetBorderWidth = function(width) { return true; };

/**
* Gets annotation border width.
* @memberof ApiBaseAnnotation
* @returns {pt}
*/
ApiFreeTextAnnotation.prototype.GetBorderWidth = function() { return new pt(); };

/**
* Sets annotation border style.
* @memberof ApiBaseAnnotation
* @param {AnnotBorderStyle} borderStyle
* @returns {boolean}
*/
ApiFreeTextAnnotation.prototype.SetBorderStyle = function(borderStyle) { return true; };

/**
* Gets annotation border style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderStyle}
*/
ApiFreeTextAnnotation.prototype.GetBorderStyle = function() { return new AnnotBorderStyle(); };

/**
* Sets annotation author name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiFreeTextAnnotation.prototype.SetAuthorName = function(name) { return true; };

/**
* Gets annotation author name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiFreeTextAnnotation.prototype.GetAuthorName = function() { return ""; };

/**
* Sets annotation contents.
* @memberof ApiBaseAnnotation
* @param {?string} contents
* @returns {boolean}
*/
ApiFreeTextAnnotation.prototype.SetContents = function(contents) { return true; };

/**
* Gets annotation contents.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiFreeTextAnnotation.prototype.GetContents = function() { return ""; };

/**
* Sets annotation creation date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiFreeTextAnnotation.prototype.SetCreationDate = function(timeStamp) { return true; };

/**
* Gets annotation creation date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiFreeTextAnnotation.prototype.GetCreationDate = function() { return 0; };

/**
* Sets annotation last modification date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiFreeTextAnnotation.prototype.SetModDate = function(timeStamp) { return true; };

/**
* Gets annotation last modification date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiFreeTextAnnotation.prototype.GetModDate = function() { return 0; };

/**
* Sets annotation unique name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiFreeTextAnnotation.prototype.SetUniqueName = function(name) { return true; };

/**
* Gets annotation unique name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiFreeTextAnnotation.prototype.GetUniqueName = function() { return ""; };

/**
* Sets annotation opacity.
* @memberof ApiBaseAnnotation
* @param {percentage} name
* @returns {boolean}
*/
ApiFreeTextAnnotation.prototype.SetOpacity = function(name) { return true; };

/**
* Gets annotation opacity.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiFreeTextAnnotation.prototype.GetOpacity = function() { return ""; };

/**
* Sets annotation subject.
* @memberof ApiBaseAnnotation
* @param {?string} subject
* @returns {boolean}
*/
ApiFreeTextAnnotation.prototype.SetSubject = function(subject) { return true; };

/**
* Gets annotation subject.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiFreeTextAnnotation.prototype.GetSubject = function() { return ""; };

/**
* Sets annotation display type.
* @memberof ApiBaseAnnotation
* @param {DisplayType} display
* @returns {boolean}
*/
ApiFreeTextAnnotation.prototype.SetDisplay = function(display) { return true; };

/**
* Gets annotation display type.
* @memberof ApiBaseAnnotation
* @returns {DisplayType}
*/
ApiFreeTextAnnotation.prototype.GetDisplay = function() { return new DisplayType(); };

/**
* Sets annotation dash pattern.
* <note> The border style property must be set to "dashed". </note>
* @memberof ApiBaseAnnotation
* @param {number[]} pattern - A dash array defining a pattern of dashes and gaps to be used in drawing a dashed border. For example, a value of [3, 2] specifies a border drawn with 3-point dashes alternating with 2-point gaps.
* @returns {boolean}
*/
ApiFreeTextAnnotation.prototype.SetDashPattern = function(pattern) { return true; };

/**
* Gets annotation dash pattern.
* @memberof ApiBaseAnnotation
* @returns {number[]}
*/
ApiFreeTextAnnotation.prototype.GetDashPattern = function() { return []; };

/**
* Sets annotation border effect style.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {AnnotBorderEffectStyle} style
* @returns {boolean}
*/
ApiFreeTextAnnotation.prototype.SetBorderEffectStyle = function(style) { return true; };

/**
* Gets annotation border effect style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderEffectStyle}
*/
ApiFreeTextAnnotation.prototype.GetBorderEffectStyle = function() { return new AnnotBorderEffectStyle(); };

/**
* Sets annotation border effect intensity.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiFreeTextAnnotation.prototype.SetBorderEffectIntensity = function(value) { return true; };

/**
* Gets annotation border effect intensity.
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiFreeTextAnnotation.prototype.GetBorderEffectIntensity = function(value) { return true; };

/**
* Adds reply on this annot.
* @memberof ApiBaseAnnotation
* @param {ApiTextAnnotation} textAnnot
* @returns {boolean}
*/
ApiFreeTextAnnotation.prototype.AddReply = function(textAnnot) { return true; };

/**
* Gets replies on this annot.
* @memberof ApiBaseAnnotation
* @returns {ApiTextAnnotation[]}
*/
ApiFreeTextAnnotation.prototype.GetReplies = function() { return []; };

/**
* Removes annotation from document.
* @memberof ApiBaseAnnotation
* @returns {boolean}
*/
ApiFreeTextAnnotation.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current annotation.
* @memberof ApiBaseAnnotation
* @returns {string}
* @since 9.4.0
*/
ApiFreeTextAnnotation.prototype.GetInternalId = function() { return ""; };

/**
* Returns a type of the ApiLineAnnotation class.
* @memberof ApiLineAnnotation
* @returns {"lineAnnot"}
*/
ApiLineAnnotation.prototype.GetClassType = function() { return ""; };

/**
* Sets a line start point.
* @memberof ApiLineAnnotation
* @param {Point} point
* @returns {boolean}
*/
ApiLineAnnotation.prototype.SetStartPoint = function(point) { return true; };

/**
* Gets a line start point.
* @memberof ApiLineAnnotation
* @returns {Point}
*/
ApiLineAnnotation.prototype.GetStartPoint = function() { return new Point(); };

/**
* Sets a line end point.
* @memberof ApiLineAnnotation
* @param {Point} point
* @returns {boolean}
*/
ApiLineAnnotation.prototype.SetEndPoint = function(point) { return true; };

/**
* Gets a line end point.
* @memberof ApiLineAnnotation
* @returns {Point}
*/
ApiLineAnnotation.prototype.GetEndPoint = function() { return new Point(); };

/**
* Sets a line start style.
* @memberof ApiLineAnnotation
* @param {LineEndStyle} style
* @returns {boolean}
*/
ApiLineAnnotation.prototype.SetStartStyle = function(style) { return true; };

/**
* Gets a line start style.
* @memberof ApiLineAnnotation
* @returns {LineEndStyle}
*/
ApiLineAnnotation.prototype.GetStartStyle = function() { return new LineEndStyle(); };

/**
* Sets a line end style.
* @memberof ApiLineAnnotation
* @param {LineEndStyle} style
* @returns {boolean}
*/
ApiLineAnnotation.prototype.SetEndStyle = function(style) { return true; };

/**
* Gets a line end style.
* @memberof ApiLineAnnotation
* @returns {LineEndStyle}
*/
ApiLineAnnotation.prototype.GetEndStyle = function() { return new LineEndStyle(); };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @param {Rect} rect
* @returns {boolean}
*/
ApiLineAnnotation.prototype.SetRect = function(rect) { return true; };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @returns {Rect}
*/
ApiLineAnnotation.prototype.GetRect = function() { return new Rect(); };

/**
* Sets annotation position.
* @memberof ApiBaseAnnotation
* @param {Point} position
* @returns {boolean}
*/
ApiLineAnnotation.prototype.SetPosition = function(position) { return true; };

/**
* Gets annotation position.
* @memberof ApiBaseAnnotation
* @returns {Point}
*/
ApiLineAnnotation.prototype.GetPosition = function() { return new Point(); };

/**
* Sets annotation border color.
* @memberof ApiBaseAnnotation
* @param {ApiColor} color
* @returns {boolean}
*/
ApiLineAnnotation.prototype.SetBorderColor = function(color) { return true; };

/**
* Gets annotation border color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiLineAnnotation.prototype.GetBorderColor = function() { return new ApiColor(); };

/**
* Sets annotation fill color.
* @memberof ApiBaseAnnotation
* @param {?ApiColor} color - color to set fill (omit the argument to set no fill)
* @returns {boolean}
*/
ApiLineAnnotation.prototype.SetFillColor = function(color) { return true; };

/**
* Gets annotation fill color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiLineAnnotation.prototype.GetFillColor = function() { return new ApiColor(); };

/**
* Sets annotation border width.
* @memberof ApiBaseAnnotation
* @param {pt} width
* @returns {boolean}
*/
ApiLineAnnotation.prototype.SetBorderWidth = function(width) { return true; };

/**
* Gets annotation border width.
* @memberof ApiBaseAnnotation
* @returns {pt}
*/
ApiLineAnnotation.prototype.GetBorderWidth = function() { return new pt(); };

/**
* Sets annotation border style.
* @memberof ApiBaseAnnotation
* @param {AnnotBorderStyle} borderStyle
* @returns {boolean}
*/
ApiLineAnnotation.prototype.SetBorderStyle = function(borderStyle) { return true; };

/**
* Gets annotation border style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderStyle}
*/
ApiLineAnnotation.prototype.GetBorderStyle = function() { return new AnnotBorderStyle(); };

/**
* Sets annotation author name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiLineAnnotation.prototype.SetAuthorName = function(name) { return true; };

/**
* Gets annotation author name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiLineAnnotation.prototype.GetAuthorName = function() { return ""; };

/**
* Sets annotation contents.
* @memberof ApiBaseAnnotation
* @param {?string} contents
* @returns {boolean}
*/
ApiLineAnnotation.prototype.SetContents = function(contents) { return true; };

/**
* Gets annotation contents.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiLineAnnotation.prototype.GetContents = function() { return ""; };

/**
* Sets annotation creation date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiLineAnnotation.prototype.SetCreationDate = function(timeStamp) { return true; };

/**
* Gets annotation creation date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiLineAnnotation.prototype.GetCreationDate = function() { return 0; };

/**
* Sets annotation last modification date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiLineAnnotation.prototype.SetModDate = function(timeStamp) { return true; };

/**
* Gets annotation last modification date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiLineAnnotation.prototype.GetModDate = function() { return 0; };

/**
* Sets annotation unique name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiLineAnnotation.prototype.SetUniqueName = function(name) { return true; };

/**
* Gets annotation unique name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiLineAnnotation.prototype.GetUniqueName = function() { return ""; };

/**
* Sets annotation opacity.
* @memberof ApiBaseAnnotation
* @param {percentage} name
* @returns {boolean}
*/
ApiLineAnnotation.prototype.SetOpacity = function(name) { return true; };

/**
* Gets annotation opacity.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiLineAnnotation.prototype.GetOpacity = function() { return ""; };

/**
* Sets annotation subject.
* @memberof ApiBaseAnnotation
* @param {?string} subject
* @returns {boolean}
*/
ApiLineAnnotation.prototype.SetSubject = function(subject) { return true; };

/**
* Gets annotation subject.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiLineAnnotation.prototype.GetSubject = function() { return ""; };

/**
* Sets annotation display type.
* @memberof ApiBaseAnnotation
* @param {DisplayType} display
* @returns {boolean}
*/
ApiLineAnnotation.prototype.SetDisplay = function(display) { return true; };

/**
* Gets annotation display type.
* @memberof ApiBaseAnnotation
* @returns {DisplayType}
*/
ApiLineAnnotation.prototype.GetDisplay = function() { return new DisplayType(); };

/**
* Sets annotation dash pattern.
* <note> The border style property must be set to "dashed". </note>
* @memberof ApiBaseAnnotation
* @param {number[]} pattern - A dash array defining a pattern of dashes and gaps to be used in drawing a dashed border. For example, a value of [3, 2] specifies a border drawn with 3-point dashes alternating with 2-point gaps.
* @returns {boolean}
*/
ApiLineAnnotation.prototype.SetDashPattern = function(pattern) { return true; };

/**
* Gets annotation dash pattern.
* @memberof ApiBaseAnnotation
* @returns {number[]}
*/
ApiLineAnnotation.prototype.GetDashPattern = function() { return []; };

/**
* Sets annotation border effect style.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {AnnotBorderEffectStyle} style
* @returns {boolean}
*/
ApiLineAnnotation.prototype.SetBorderEffectStyle = function(style) { return true; };

/**
* Gets annotation border effect style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderEffectStyle}
*/
ApiLineAnnotation.prototype.GetBorderEffectStyle = function() { return new AnnotBorderEffectStyle(); };

/**
* Sets annotation border effect intensity.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiLineAnnotation.prototype.SetBorderEffectIntensity = function(value) { return true; };

/**
* Gets annotation border effect intensity.
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiLineAnnotation.prototype.GetBorderEffectIntensity = function(value) { return true; };

/**
* Adds reply on this annot.
* @memberof ApiBaseAnnotation
* @param {ApiTextAnnotation} textAnnot
* @returns {boolean}
*/
ApiLineAnnotation.prototype.AddReply = function(textAnnot) { return true; };

/**
* Gets replies on this annot.
* @memberof ApiBaseAnnotation
* @returns {ApiTextAnnotation[]}
*/
ApiLineAnnotation.prototype.GetReplies = function() { return []; };

/**
* Removes annotation from document.
* @memberof ApiBaseAnnotation
* @returns {boolean}
*/
ApiLineAnnotation.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current annotation.
* @memberof ApiBaseAnnotation
* @returns {string}
* @since 9.4.0
*/
ApiLineAnnotation.prototype.GetInternalId = function() { return ""; };

/**
* Returns a type of the ApiInkAnnotation class.
* @memberof ApiInkAnnotation
* @returns {"inkAnnot"}
*/
ApiInkAnnotation.prototype.GetClassType = function() { return ""; };

/**
* Sets ink path list.
* @memberof ApiInkAnnotation
* @param {PathList} inkPaths - ink path list
* @returns {boolean}
*/
ApiInkAnnotation.prototype.SetPathList = function(inkPaths) { return true; };

/**
* Gets ink path list.
* @memberof ApiInkAnnotation
* @returns {PathList}
*/
ApiInkAnnotation.prototype.GetPathList = function() { return new PathList(); };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @param {Rect} rect
* @returns {boolean}
*/
ApiInkAnnotation.prototype.SetRect = function(rect) { return true; };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @returns {Rect}
*/
ApiInkAnnotation.prototype.GetRect = function() { return new Rect(); };

/**
* Sets annotation position.
* @memberof ApiBaseAnnotation
* @param {Point} position
* @returns {boolean}
*/
ApiInkAnnotation.prototype.SetPosition = function(position) { return true; };

/**
* Gets annotation position.
* @memberof ApiBaseAnnotation
* @returns {Point}
*/
ApiInkAnnotation.prototype.GetPosition = function() { return new Point(); };

/**
* Sets annotation border color.
* @memberof ApiBaseAnnotation
* @param {ApiColor} color
* @returns {boolean}
*/
ApiInkAnnotation.prototype.SetBorderColor = function(color) { return true; };

/**
* Gets annotation border color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiInkAnnotation.prototype.GetBorderColor = function() { return new ApiColor(); };

/**
* Sets annotation fill color.
* @memberof ApiBaseAnnotation
* @param {?ApiColor} color - color to set fill (omit the argument to set no fill)
* @returns {boolean}
*/
ApiInkAnnotation.prototype.SetFillColor = function(color) { return true; };

/**
* Gets annotation fill color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiInkAnnotation.prototype.GetFillColor = function() { return new ApiColor(); };

/**
* Sets annotation border width.
* @memberof ApiBaseAnnotation
* @param {pt} width
* @returns {boolean}
*/
ApiInkAnnotation.prototype.SetBorderWidth = function(width) { return true; };

/**
* Gets annotation border width.
* @memberof ApiBaseAnnotation
* @returns {pt}
*/
ApiInkAnnotation.prototype.GetBorderWidth = function() { return new pt(); };

/**
* Sets annotation border style.
* @memberof ApiBaseAnnotation
* @param {AnnotBorderStyle} borderStyle
* @returns {boolean}
*/
ApiInkAnnotation.prototype.SetBorderStyle = function(borderStyle) { return true; };

/**
* Gets annotation border style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderStyle}
*/
ApiInkAnnotation.prototype.GetBorderStyle = function() { return new AnnotBorderStyle(); };

/**
* Sets annotation author name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiInkAnnotation.prototype.SetAuthorName = function(name) { return true; };

/**
* Gets annotation author name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiInkAnnotation.prototype.GetAuthorName = function() { return ""; };

/**
* Sets annotation contents.
* @memberof ApiBaseAnnotation
* @param {?string} contents
* @returns {boolean}
*/
ApiInkAnnotation.prototype.SetContents = function(contents) { return true; };

/**
* Gets annotation contents.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiInkAnnotation.prototype.GetContents = function() { return ""; };

/**
* Sets annotation creation date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiInkAnnotation.prototype.SetCreationDate = function(timeStamp) { return true; };

/**
* Gets annotation creation date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiInkAnnotation.prototype.GetCreationDate = function() { return 0; };

/**
* Sets annotation last modification date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiInkAnnotation.prototype.SetModDate = function(timeStamp) { return true; };

/**
* Gets annotation last modification date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiInkAnnotation.prototype.GetModDate = function() { return 0; };

/**
* Sets annotation unique name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiInkAnnotation.prototype.SetUniqueName = function(name) { return true; };

/**
* Gets annotation unique name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiInkAnnotation.prototype.GetUniqueName = function() { return ""; };

/**
* Sets annotation opacity.
* @memberof ApiBaseAnnotation
* @param {percentage} name
* @returns {boolean}
*/
ApiInkAnnotation.prototype.SetOpacity = function(name) { return true; };

/**
* Gets annotation opacity.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiInkAnnotation.prototype.GetOpacity = function() { return ""; };

/**
* Sets annotation subject.
* @memberof ApiBaseAnnotation
* @param {?string} subject
* @returns {boolean}
*/
ApiInkAnnotation.prototype.SetSubject = function(subject) { return true; };

/**
* Gets annotation subject.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiInkAnnotation.prototype.GetSubject = function() { return ""; };

/**
* Sets annotation display type.
* @memberof ApiBaseAnnotation
* @param {DisplayType} display
* @returns {boolean}
*/
ApiInkAnnotation.prototype.SetDisplay = function(display) { return true; };

/**
* Gets annotation display type.
* @memberof ApiBaseAnnotation
* @returns {DisplayType}
*/
ApiInkAnnotation.prototype.GetDisplay = function() { return new DisplayType(); };

/**
* Sets annotation dash pattern.
* <note> The border style property must be set to "dashed". </note>
* @memberof ApiBaseAnnotation
* @param {number[]} pattern - A dash array defining a pattern of dashes and gaps to be used in drawing a dashed border. For example, a value of [3, 2] specifies a border drawn with 3-point dashes alternating with 2-point gaps.
* @returns {boolean}
*/
ApiInkAnnotation.prototype.SetDashPattern = function(pattern) { return true; };

/**
* Gets annotation dash pattern.
* @memberof ApiBaseAnnotation
* @returns {number[]}
*/
ApiInkAnnotation.prototype.GetDashPattern = function() { return []; };

/**
* Sets annotation border effect style.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {AnnotBorderEffectStyle} style
* @returns {boolean}
*/
ApiInkAnnotation.prototype.SetBorderEffectStyle = function(style) { return true; };

/**
* Gets annotation border effect style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderEffectStyle}
*/
ApiInkAnnotation.prototype.GetBorderEffectStyle = function() { return new AnnotBorderEffectStyle(); };

/**
* Sets annotation border effect intensity.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiInkAnnotation.prototype.SetBorderEffectIntensity = function(value) { return true; };

/**
* Gets annotation border effect intensity.
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiInkAnnotation.prototype.GetBorderEffectIntensity = function(value) { return true; };

/**
* Adds reply on this annot.
* @memberof ApiBaseAnnotation
* @param {ApiTextAnnotation} textAnnot
* @returns {boolean}
*/
ApiInkAnnotation.prototype.AddReply = function(textAnnot) { return true; };

/**
* Gets replies on this annot.
* @memberof ApiBaseAnnotation
* @returns {ApiTextAnnotation[]}
*/
ApiInkAnnotation.prototype.GetReplies = function() { return []; };

/**
* Removes annotation from document.
* @memberof ApiBaseAnnotation
* @returns {boolean}
*/
ApiInkAnnotation.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current annotation.
* @memberof ApiBaseAnnotation
* @returns {string}
* @since 9.4.0
*/
ApiInkAnnotation.prototype.GetInternalId = function() { return ""; };

/**
* Returns a type of the ApiPolygonAnnotation class.
* @memberof ApiPolygonAnnotation
* @returns {"polygonAnnot"}
*/
ApiPolygonAnnotation.prototype.GetClassType = function() { return ""; };

/**
* Sets vertices to polygon annot.
* @memberof ApiPolygonAnnotation
* @param {Path} path - polygon path
* @returns {boolean}
*/
ApiPolygonAnnotation.prototype.SetVertices = function(path) { return true; };

/**
* Gets ink path list.
* @memberof ApiPolygonAnnotation
* @returns {Path}
*/
ApiPolygonAnnotation.prototype.GetVertices = function() { return new Path(); };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @param {Rect} rect
* @returns {boolean}
*/
ApiPolygonAnnotation.prototype.SetRect = function(rect) { return true; };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @returns {Rect}
*/
ApiPolygonAnnotation.prototype.GetRect = function() { return new Rect(); };

/**
* Sets annotation position.
* @memberof ApiBaseAnnotation
* @param {Point} position
* @returns {boolean}
*/
ApiPolygonAnnotation.prototype.SetPosition = function(position) { return true; };

/**
* Gets annotation position.
* @memberof ApiBaseAnnotation
* @returns {Point}
*/
ApiPolygonAnnotation.prototype.GetPosition = function() { return new Point(); };

/**
* Sets annotation border color.
* @memberof ApiBaseAnnotation
* @param {ApiColor} color
* @returns {boolean}
*/
ApiPolygonAnnotation.prototype.SetBorderColor = function(color) { return true; };

/**
* Gets annotation border color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiPolygonAnnotation.prototype.GetBorderColor = function() { return new ApiColor(); };

/**
* Sets annotation fill color.
* @memberof ApiBaseAnnotation
* @param {?ApiColor} color - color to set fill (omit the argument to set no fill)
* @returns {boolean}
*/
ApiPolygonAnnotation.prototype.SetFillColor = function(color) { return true; };

/**
* Gets annotation fill color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiPolygonAnnotation.prototype.GetFillColor = function() { return new ApiColor(); };

/**
* Sets annotation border width.
* @memberof ApiBaseAnnotation
* @param {pt} width
* @returns {boolean}
*/
ApiPolygonAnnotation.prototype.SetBorderWidth = function(width) { return true; };

/**
* Gets annotation border width.
* @memberof ApiBaseAnnotation
* @returns {pt}
*/
ApiPolygonAnnotation.prototype.GetBorderWidth = function() { return new pt(); };

/**
* Sets annotation border style.
* @memberof ApiBaseAnnotation
* @param {AnnotBorderStyle} borderStyle
* @returns {boolean}
*/
ApiPolygonAnnotation.prototype.SetBorderStyle = function(borderStyle) { return true; };

/**
* Gets annotation border style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderStyle}
*/
ApiPolygonAnnotation.prototype.GetBorderStyle = function() { return new AnnotBorderStyle(); };

/**
* Sets annotation author name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiPolygonAnnotation.prototype.SetAuthorName = function(name) { return true; };

/**
* Gets annotation author name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiPolygonAnnotation.prototype.GetAuthorName = function() { return ""; };

/**
* Sets annotation contents.
* @memberof ApiBaseAnnotation
* @param {?string} contents
* @returns {boolean}
*/
ApiPolygonAnnotation.prototype.SetContents = function(contents) { return true; };

/**
* Gets annotation contents.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiPolygonAnnotation.prototype.GetContents = function() { return ""; };

/**
* Sets annotation creation date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiPolygonAnnotation.prototype.SetCreationDate = function(timeStamp) { return true; };

/**
* Gets annotation creation date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiPolygonAnnotation.prototype.GetCreationDate = function() { return 0; };

/**
* Sets annotation last modification date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiPolygonAnnotation.prototype.SetModDate = function(timeStamp) { return true; };

/**
* Gets annotation last modification date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiPolygonAnnotation.prototype.GetModDate = function() { return 0; };

/**
* Sets annotation unique name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiPolygonAnnotation.prototype.SetUniqueName = function(name) { return true; };

/**
* Gets annotation unique name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiPolygonAnnotation.prototype.GetUniqueName = function() { return ""; };

/**
* Sets annotation opacity.
* @memberof ApiBaseAnnotation
* @param {percentage} name
* @returns {boolean}
*/
ApiPolygonAnnotation.prototype.SetOpacity = function(name) { return true; };

/**
* Gets annotation opacity.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiPolygonAnnotation.prototype.GetOpacity = function() { return ""; };

/**
* Sets annotation subject.
* @memberof ApiBaseAnnotation
* @param {?string} subject
* @returns {boolean}
*/
ApiPolygonAnnotation.prototype.SetSubject = function(subject) { return true; };

/**
* Gets annotation subject.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiPolygonAnnotation.prototype.GetSubject = function() { return ""; };

/**
* Sets annotation display type.
* @memberof ApiBaseAnnotation
* @param {DisplayType} display
* @returns {boolean}
*/
ApiPolygonAnnotation.prototype.SetDisplay = function(display) { return true; };

/**
* Gets annotation display type.
* @memberof ApiBaseAnnotation
* @returns {DisplayType}
*/
ApiPolygonAnnotation.prototype.GetDisplay = function() { return new DisplayType(); };

/**
* Sets annotation dash pattern.
* <note> The border style property must be set to "dashed". </note>
* @memberof ApiBaseAnnotation
* @param {number[]} pattern - A dash array defining a pattern of dashes and gaps to be used in drawing a dashed border. For example, a value of [3, 2] specifies a border drawn with 3-point dashes alternating with 2-point gaps.
* @returns {boolean}
*/
ApiPolygonAnnotation.prototype.SetDashPattern = function(pattern) { return true; };

/**
* Gets annotation dash pattern.
* @memberof ApiBaseAnnotation
* @returns {number[]}
*/
ApiPolygonAnnotation.prototype.GetDashPattern = function() { return []; };

/**
* Sets annotation border effect style.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {AnnotBorderEffectStyle} style
* @returns {boolean}
*/
ApiPolygonAnnotation.prototype.SetBorderEffectStyle = function(style) { return true; };

/**
* Gets annotation border effect style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderEffectStyle}
*/
ApiPolygonAnnotation.prototype.GetBorderEffectStyle = function() { return new AnnotBorderEffectStyle(); };

/**
* Sets annotation border effect intensity.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiPolygonAnnotation.prototype.SetBorderEffectIntensity = function(value) { return true; };

/**
* Gets annotation border effect intensity.
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiPolygonAnnotation.prototype.GetBorderEffectIntensity = function(value) { return true; };

/**
* Adds reply on this annot.
* @memberof ApiBaseAnnotation
* @param {ApiTextAnnotation} textAnnot
* @returns {boolean}
*/
ApiPolygonAnnotation.prototype.AddReply = function(textAnnot) { return true; };

/**
* Gets replies on this annot.
* @memberof ApiBaseAnnotation
* @returns {ApiTextAnnotation[]}
*/
ApiPolygonAnnotation.prototype.GetReplies = function() { return []; };

/**
* Removes annotation from document.
* @memberof ApiBaseAnnotation
* @returns {boolean}
*/
ApiPolygonAnnotation.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current annotation.
* @memberof ApiBaseAnnotation
* @returns {string}
* @since 9.4.0
*/
ApiPolygonAnnotation.prototype.GetInternalId = function() { return ""; };

/**
* Returns a type of the ApiPolyLineAnnotation class.
* @memberof ApiPolyLineAnnotation
* @returns {"polyLineAnnot"}
*/
ApiPolyLineAnnotation.prototype.GetClassType = function() { return ""; };

/**
* Sets vertices to polyline annot.
* @memberof ApiPolyLineAnnotation
* @param {Path} path - polyline path
* @returns {boolean}
*/
ApiPolyLineAnnotation.prototype.SetVertices = function(path) { return true; };

/**
* Gets ink path list.
* @memberof ApiPolyLineAnnotation
* @returns {Path}
*/
ApiPolyLineAnnotation.prototype.GetVertices = function() { return new Path(); };

/**
* Sets a line start style.
* @memberof ApiPolyLineAnnotation
* @param {LineEndStyle} style
* @returns {boolean}
*/
ApiPolyLineAnnotation.prototype.SetStartStyle = function(style) { return true; };

/**
* Gets a line start style.
* @memberof ApiPolyLineAnnotation
* @returns {LineEndStyle}
*/
ApiPolyLineAnnotation.prototype.GetStartStyle = function() { return new LineEndStyle(); };

/**
* Sets a line end style.
* @memberof ApiPolyLineAnnotation
* @param {LineEndStyle} style
* @returns {boolean}
*/
ApiPolyLineAnnotation.prototype.SetEndStyle = function(style) { return true; };

/**
* Gets a line end style.
* @memberof ApiPolyLineAnnotation
* @returns {LineEndStyle}
*/
ApiPolyLineAnnotation.prototype.GetEndStyle = function() { return new LineEndStyle(); };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @param {Rect} rect
* @returns {boolean}
*/
ApiPolyLineAnnotation.prototype.SetRect = function(rect) { return true; };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @returns {Rect}
*/
ApiPolyLineAnnotation.prototype.GetRect = function() { return new Rect(); };

/**
* Sets annotation position.
* @memberof ApiBaseAnnotation
* @param {Point} position
* @returns {boolean}
*/
ApiPolyLineAnnotation.prototype.SetPosition = function(position) { return true; };

/**
* Gets annotation position.
* @memberof ApiBaseAnnotation
* @returns {Point}
*/
ApiPolyLineAnnotation.prototype.GetPosition = function() { return new Point(); };

/**
* Sets annotation border color.
* @memberof ApiBaseAnnotation
* @param {ApiColor} color
* @returns {boolean}
*/
ApiPolyLineAnnotation.prototype.SetBorderColor = function(color) { return true; };

/**
* Gets annotation border color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiPolyLineAnnotation.prototype.GetBorderColor = function() { return new ApiColor(); };

/**
* Sets annotation fill color.
* @memberof ApiBaseAnnotation
* @param {?ApiColor} color - color to set fill (omit the argument to set no fill)
* @returns {boolean}
*/
ApiPolyLineAnnotation.prototype.SetFillColor = function(color) { return true; };

/**
* Gets annotation fill color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiPolyLineAnnotation.prototype.GetFillColor = function() { return new ApiColor(); };

/**
* Sets annotation border width.
* @memberof ApiBaseAnnotation
* @param {pt} width
* @returns {boolean}
*/
ApiPolyLineAnnotation.prototype.SetBorderWidth = function(width) { return true; };

/**
* Gets annotation border width.
* @memberof ApiBaseAnnotation
* @returns {pt}
*/
ApiPolyLineAnnotation.prototype.GetBorderWidth = function() { return new pt(); };

/**
* Sets annotation border style.
* @memberof ApiBaseAnnotation
* @param {AnnotBorderStyle} borderStyle
* @returns {boolean}
*/
ApiPolyLineAnnotation.prototype.SetBorderStyle = function(borderStyle) { return true; };

/**
* Gets annotation border style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderStyle}
*/
ApiPolyLineAnnotation.prototype.GetBorderStyle = function() { return new AnnotBorderStyle(); };

/**
* Sets annotation author name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiPolyLineAnnotation.prototype.SetAuthorName = function(name) { return true; };

/**
* Gets annotation author name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiPolyLineAnnotation.prototype.GetAuthorName = function() { return ""; };

/**
* Sets annotation contents.
* @memberof ApiBaseAnnotation
* @param {?string} contents
* @returns {boolean}
*/
ApiPolyLineAnnotation.prototype.SetContents = function(contents) { return true; };

/**
* Gets annotation contents.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiPolyLineAnnotation.prototype.GetContents = function() { return ""; };

/**
* Sets annotation creation date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiPolyLineAnnotation.prototype.SetCreationDate = function(timeStamp) { return true; };

/**
* Gets annotation creation date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiPolyLineAnnotation.prototype.GetCreationDate = function() { return 0; };

/**
* Sets annotation last modification date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiPolyLineAnnotation.prototype.SetModDate = function(timeStamp) { return true; };

/**
* Gets annotation last modification date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiPolyLineAnnotation.prototype.GetModDate = function() { return 0; };

/**
* Sets annotation unique name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiPolyLineAnnotation.prototype.SetUniqueName = function(name) { return true; };

/**
* Gets annotation unique name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiPolyLineAnnotation.prototype.GetUniqueName = function() { return ""; };

/**
* Sets annotation opacity.
* @memberof ApiBaseAnnotation
* @param {percentage} name
* @returns {boolean}
*/
ApiPolyLineAnnotation.prototype.SetOpacity = function(name) { return true; };

/**
* Gets annotation opacity.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiPolyLineAnnotation.prototype.GetOpacity = function() { return ""; };

/**
* Sets annotation subject.
* @memberof ApiBaseAnnotation
* @param {?string} subject
* @returns {boolean}
*/
ApiPolyLineAnnotation.prototype.SetSubject = function(subject) { return true; };

/**
* Gets annotation subject.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiPolyLineAnnotation.prototype.GetSubject = function() { return ""; };

/**
* Sets annotation display type.
* @memberof ApiBaseAnnotation
* @param {DisplayType} display
* @returns {boolean}
*/
ApiPolyLineAnnotation.prototype.SetDisplay = function(display) { return true; };

/**
* Gets annotation display type.
* @memberof ApiBaseAnnotation
* @returns {DisplayType}
*/
ApiPolyLineAnnotation.prototype.GetDisplay = function() { return new DisplayType(); };

/**
* Sets annotation dash pattern.
* <note> The border style property must be set to "dashed". </note>
* @memberof ApiBaseAnnotation
* @param {number[]} pattern - A dash array defining a pattern of dashes and gaps to be used in drawing a dashed border. For example, a value of [3, 2] specifies a border drawn with 3-point dashes alternating with 2-point gaps.
* @returns {boolean}
*/
ApiPolyLineAnnotation.prototype.SetDashPattern = function(pattern) { return true; };

/**
* Gets annotation dash pattern.
* @memberof ApiBaseAnnotation
* @returns {number[]}
*/
ApiPolyLineAnnotation.prototype.GetDashPattern = function() { return []; };

/**
* Sets annotation border effect style.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {AnnotBorderEffectStyle} style
* @returns {boolean}
*/
ApiPolyLineAnnotation.prototype.SetBorderEffectStyle = function(style) { return true; };

/**
* Gets annotation border effect style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderEffectStyle}
*/
ApiPolyLineAnnotation.prototype.GetBorderEffectStyle = function() { return new AnnotBorderEffectStyle(); };

/**
* Sets annotation border effect intensity.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiPolyLineAnnotation.prototype.SetBorderEffectIntensity = function(value) { return true; };

/**
* Gets annotation border effect intensity.
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiPolyLineAnnotation.prototype.GetBorderEffectIntensity = function(value) { return true; };

/**
* Adds reply on this annot.
* @memberof ApiBaseAnnotation
* @param {ApiTextAnnotation} textAnnot
* @returns {boolean}
*/
ApiPolyLineAnnotation.prototype.AddReply = function(textAnnot) { return true; };

/**
* Gets replies on this annot.
* @memberof ApiBaseAnnotation
* @returns {ApiTextAnnotation[]}
*/
ApiPolyLineAnnotation.prototype.GetReplies = function() { return []; };

/**
* Removes annotation from document.
* @memberof ApiBaseAnnotation
* @returns {boolean}
*/
ApiPolyLineAnnotation.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current annotation.
* @memberof ApiBaseAnnotation
* @returns {string}
* @since 9.4.0
*/
ApiPolyLineAnnotation.prototype.GetInternalId = function() { return ""; };

/**
* Returns a type of the ApiStampAnnotation class.
* @memberof ApiStampAnnotation
* @returns {"stampAnnot"}
*/
ApiStampAnnotation.prototype.GetClassType = function() { return ""; };

/**
* Gets stamp type.
* @memberof ApiStampAnnotation
* @returns {StampType}
*/
ApiStampAnnotation.prototype.GetType = function() { return new StampType(); };

/**
* Sets stamp size scale.
* @memberof ApiStampAnnotation
* @param {number} scale - size scale
* @returns {boolean}
*/
ApiStampAnnotation.prototype.SetScale = function(scale) { return true; };

/**
* Gets stamp size scale.
* @memberof ApiStampAnnotation
* @returns {number}
*/
ApiStampAnnotation.prototype.GetScale = function() { return 0; };

/**
* Sets stamp rotate.
* @memberof ApiStampAnnotation
* @param {Degree} angle
* @returns {boolean}
*/
ApiStampAnnotation.prototype.SetRotation = function(angle) { return true; };

/**
* Gets stamp rotate.
* @memberof ApiStampAnnotation
* @returns {Degree}
*/
ApiStampAnnotation.prototype.GetRotation = function() { return new Degree(); };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @param {Rect} rect
* @returns {boolean}
*/
ApiStampAnnotation.prototype.SetRect = function(rect) { return true; };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @returns {Rect}
*/
ApiStampAnnotation.prototype.GetRect = function() { return new Rect(); };

/**
* Sets annotation position.
* @memberof ApiBaseAnnotation
* @param {Point} position
* @returns {boolean}
*/
ApiStampAnnotation.prototype.SetPosition = function(position) { return true; };

/**
* Gets annotation position.
* @memberof ApiBaseAnnotation
* @returns {Point}
*/
ApiStampAnnotation.prototype.GetPosition = function() { return new Point(); };

/**
* Sets annotation border color.
* @memberof ApiBaseAnnotation
* @param {ApiColor} color
* @returns {boolean}
*/
ApiStampAnnotation.prototype.SetBorderColor = function(color) { return true; };

/**
* Gets annotation border color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiStampAnnotation.prototype.GetBorderColor = function() { return new ApiColor(); };

/**
* Sets annotation fill color.
* @memberof ApiBaseAnnotation
* @param {?ApiColor} color - color to set fill (omit the argument to set no fill)
* @returns {boolean}
*/
ApiStampAnnotation.prototype.SetFillColor = function(color) { return true; };

/**
* Gets annotation fill color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiStampAnnotation.prototype.GetFillColor = function() { return new ApiColor(); };

/**
* Sets annotation border width.
* @memberof ApiBaseAnnotation
* @param {pt} width
* @returns {boolean}
*/
ApiStampAnnotation.prototype.SetBorderWidth = function(width) { return true; };

/**
* Gets annotation border width.
* @memberof ApiBaseAnnotation
* @returns {pt}
*/
ApiStampAnnotation.prototype.GetBorderWidth = function() { return new pt(); };

/**
* Sets annotation border style.
* @memberof ApiBaseAnnotation
* @param {AnnotBorderStyle} borderStyle
* @returns {boolean}
*/
ApiStampAnnotation.prototype.SetBorderStyle = function(borderStyle) { return true; };

/**
* Gets annotation border style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderStyle}
*/
ApiStampAnnotation.prototype.GetBorderStyle = function() { return new AnnotBorderStyle(); };

/**
* Sets annotation author name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiStampAnnotation.prototype.SetAuthorName = function(name) { return true; };

/**
* Gets annotation author name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiStampAnnotation.prototype.GetAuthorName = function() { return ""; };

/**
* Sets annotation contents.
* @memberof ApiBaseAnnotation
* @param {?string} contents
* @returns {boolean}
*/
ApiStampAnnotation.prototype.SetContents = function(contents) { return true; };

/**
* Gets annotation contents.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiStampAnnotation.prototype.GetContents = function() { return ""; };

/**
* Sets annotation creation date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiStampAnnotation.prototype.SetCreationDate = function(timeStamp) { return true; };

/**
* Gets annotation creation date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiStampAnnotation.prototype.GetCreationDate = function() { return 0; };

/**
* Sets annotation last modification date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiStampAnnotation.prototype.SetModDate = function(timeStamp) { return true; };

/**
* Gets annotation last modification date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiStampAnnotation.prototype.GetModDate = function() { return 0; };

/**
* Sets annotation unique name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiStampAnnotation.prototype.SetUniqueName = function(name) { return true; };

/**
* Gets annotation unique name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiStampAnnotation.prototype.GetUniqueName = function() { return ""; };

/**
* Sets annotation opacity.
* @memberof ApiBaseAnnotation
* @param {percentage} name
* @returns {boolean}
*/
ApiStampAnnotation.prototype.SetOpacity = function(name) { return true; };

/**
* Gets annotation opacity.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiStampAnnotation.prototype.GetOpacity = function() { return ""; };

/**
* Sets annotation subject.
* @memberof ApiBaseAnnotation
* @param {?string} subject
* @returns {boolean}
*/
ApiStampAnnotation.prototype.SetSubject = function(subject) { return true; };

/**
* Gets annotation subject.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiStampAnnotation.prototype.GetSubject = function() { return ""; };

/**
* Sets annotation display type.
* @memberof ApiBaseAnnotation
* @param {DisplayType} display
* @returns {boolean}
*/
ApiStampAnnotation.prototype.SetDisplay = function(display) { return true; };

/**
* Gets annotation display type.
* @memberof ApiBaseAnnotation
* @returns {DisplayType}
*/
ApiStampAnnotation.prototype.GetDisplay = function() { return new DisplayType(); };

/**
* Sets annotation dash pattern.
* <note> The border style property must be set to "dashed". </note>
* @memberof ApiBaseAnnotation
* @param {number[]} pattern - A dash array defining a pattern of dashes and gaps to be used in drawing a dashed border. For example, a value of [3, 2] specifies a border drawn with 3-point dashes alternating with 2-point gaps.
* @returns {boolean}
*/
ApiStampAnnotation.prototype.SetDashPattern = function(pattern) { return true; };

/**
* Gets annotation dash pattern.
* @memberof ApiBaseAnnotation
* @returns {number[]}
*/
ApiStampAnnotation.prototype.GetDashPattern = function() { return []; };

/**
* Sets annotation border effect style.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {AnnotBorderEffectStyle} style
* @returns {boolean}
*/
ApiStampAnnotation.prototype.SetBorderEffectStyle = function(style) { return true; };

/**
* Gets annotation border effect style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderEffectStyle}
*/
ApiStampAnnotation.prototype.GetBorderEffectStyle = function() { return new AnnotBorderEffectStyle(); };

/**
* Sets annotation border effect intensity.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiStampAnnotation.prototype.SetBorderEffectIntensity = function(value) { return true; };

/**
* Gets annotation border effect intensity.
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiStampAnnotation.prototype.GetBorderEffectIntensity = function(value) { return true; };

/**
* Adds reply on this annot.
* @memberof ApiBaseAnnotation
* @param {ApiTextAnnotation} textAnnot
* @returns {boolean}
*/
ApiStampAnnotation.prototype.AddReply = function(textAnnot) { return true; };

/**
* Gets replies on this annot.
* @memberof ApiBaseAnnotation
* @returns {ApiTextAnnotation[]}
*/
ApiStampAnnotation.prototype.GetReplies = function() { return []; };

/**
* Removes annotation from document.
* @memberof ApiBaseAnnotation
* @returns {boolean}
*/
ApiStampAnnotation.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current annotation.
* @memberof ApiBaseAnnotation
* @returns {string}
* @since 9.4.0
*/
ApiStampAnnotation.prototype.GetInternalId = function() { return ""; };

/**
* Sets quads to current markup annotation.
* @memberof ApiBaseMarkupAnnotation
* @param {Quad[]} quads
* @returns {boolean}
*/
ApiBaseMarkupAnnotation.prototype.SetQuads = function(quads) { return true; };

/**
* Gets quads from current markup annotation.
* @memberof ApiBaseMarkupAnnotation
* @returns {Quad[]}
*/
ApiBaseMarkupAnnotation.prototype.GetQuads = function() { return []; };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @param {Rect} rect
* @returns {boolean}
*/
ApiBaseMarkupAnnotation.prototype.SetRect = function(rect) { return true; };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @returns {Rect}
*/
ApiBaseMarkupAnnotation.prototype.GetRect = function() { return new Rect(); };

/**
* Sets annotation position.
* @memberof ApiBaseAnnotation
* @param {Point} position
* @returns {boolean}
*/
ApiBaseMarkupAnnotation.prototype.SetPosition = function(position) { return true; };

/**
* Gets annotation position.
* @memberof ApiBaseAnnotation
* @returns {Point}
*/
ApiBaseMarkupAnnotation.prototype.GetPosition = function() { return new Point(); };

/**
* Sets annotation border color.
* @memberof ApiBaseAnnotation
* @param {ApiColor} color
* @returns {boolean}
*/
ApiBaseMarkupAnnotation.prototype.SetBorderColor = function(color) { return true; };

/**
* Gets annotation border color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiBaseMarkupAnnotation.prototype.GetBorderColor = function() { return new ApiColor(); };

/**
* Sets annotation fill color.
* @memberof ApiBaseAnnotation
* @param {?ApiColor} color - color to set fill (omit the argument to set no fill)
* @returns {boolean}
*/
ApiBaseMarkupAnnotation.prototype.SetFillColor = function(color) { return true; };

/**
* Gets annotation fill color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiBaseMarkupAnnotation.prototype.GetFillColor = function() { return new ApiColor(); };

/**
* Sets annotation border width.
* @memberof ApiBaseAnnotation
* @param {pt} width
* @returns {boolean}
*/
ApiBaseMarkupAnnotation.prototype.SetBorderWidth = function(width) { return true; };

/**
* Gets annotation border width.
* @memberof ApiBaseAnnotation
* @returns {pt}
*/
ApiBaseMarkupAnnotation.prototype.GetBorderWidth = function() { return new pt(); };

/**
* Sets annotation border style.
* @memberof ApiBaseAnnotation
* @param {AnnotBorderStyle} borderStyle
* @returns {boolean}
*/
ApiBaseMarkupAnnotation.prototype.SetBorderStyle = function(borderStyle) { return true; };

/**
* Gets annotation border style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderStyle}
*/
ApiBaseMarkupAnnotation.prototype.GetBorderStyle = function() { return new AnnotBorderStyle(); };

/**
* Sets annotation author name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiBaseMarkupAnnotation.prototype.SetAuthorName = function(name) { return true; };

/**
* Gets annotation author name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiBaseMarkupAnnotation.prototype.GetAuthorName = function() { return ""; };

/**
* Sets annotation contents.
* @memberof ApiBaseAnnotation
* @param {?string} contents
* @returns {boolean}
*/
ApiBaseMarkupAnnotation.prototype.SetContents = function(contents) { return true; };

/**
* Gets annotation contents.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiBaseMarkupAnnotation.prototype.GetContents = function() { return ""; };

/**
* Sets annotation creation date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiBaseMarkupAnnotation.prototype.SetCreationDate = function(timeStamp) { return true; };

/**
* Gets annotation creation date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiBaseMarkupAnnotation.prototype.GetCreationDate = function() { return 0; };

/**
* Sets annotation last modification date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiBaseMarkupAnnotation.prototype.SetModDate = function(timeStamp) { return true; };

/**
* Gets annotation last modification date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiBaseMarkupAnnotation.prototype.GetModDate = function() { return 0; };

/**
* Sets annotation unique name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiBaseMarkupAnnotation.prototype.SetUniqueName = function(name) { return true; };

/**
* Gets annotation unique name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiBaseMarkupAnnotation.prototype.GetUniqueName = function() { return ""; };

/**
* Sets annotation opacity.
* @memberof ApiBaseAnnotation
* @param {percentage} name
* @returns {boolean}
*/
ApiBaseMarkupAnnotation.prototype.SetOpacity = function(name) { return true; };

/**
* Gets annotation opacity.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiBaseMarkupAnnotation.prototype.GetOpacity = function() { return ""; };

/**
* Sets annotation subject.
* @memberof ApiBaseAnnotation
* @param {?string} subject
* @returns {boolean}
*/
ApiBaseMarkupAnnotation.prototype.SetSubject = function(subject) { return true; };

/**
* Gets annotation subject.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiBaseMarkupAnnotation.prototype.GetSubject = function() { return ""; };

/**
* Sets annotation display type.
* @memberof ApiBaseAnnotation
* @param {DisplayType} display
* @returns {boolean}
*/
ApiBaseMarkupAnnotation.prototype.SetDisplay = function(display) { return true; };

/**
* Gets annotation display type.
* @memberof ApiBaseAnnotation
* @returns {DisplayType}
*/
ApiBaseMarkupAnnotation.prototype.GetDisplay = function() { return new DisplayType(); };

/**
* Sets annotation dash pattern.
* <note> The border style property must be set to "dashed". </note>
* @memberof ApiBaseAnnotation
* @param {number[]} pattern - A dash array defining a pattern of dashes and gaps to be used in drawing a dashed border. For example, a value of [3, 2] specifies a border drawn with 3-point dashes alternating with 2-point gaps.
* @returns {boolean}
*/
ApiBaseMarkupAnnotation.prototype.SetDashPattern = function(pattern) { return true; };

/**
* Gets annotation dash pattern.
* @memberof ApiBaseAnnotation
* @returns {number[]}
*/
ApiBaseMarkupAnnotation.prototype.GetDashPattern = function() { return []; };

/**
* Sets annotation border effect style.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {AnnotBorderEffectStyle} style
* @returns {boolean}
*/
ApiBaseMarkupAnnotation.prototype.SetBorderEffectStyle = function(style) { return true; };

/**
* Gets annotation border effect style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderEffectStyle}
*/
ApiBaseMarkupAnnotation.prototype.GetBorderEffectStyle = function() { return new AnnotBorderEffectStyle(); };

/**
* Sets annotation border effect intensity.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiBaseMarkupAnnotation.prototype.SetBorderEffectIntensity = function(value) { return true; };

/**
* Gets annotation border effect intensity.
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiBaseMarkupAnnotation.prototype.GetBorderEffectIntensity = function(value) { return true; };

/**
* Adds reply on this annot.
* @memberof ApiBaseAnnotation
* @param {ApiTextAnnotation} textAnnot
* @returns {boolean}
*/
ApiBaseMarkupAnnotation.prototype.AddReply = function(textAnnot) { return true; };

/**
* Gets replies on this annot.
* @memberof ApiBaseAnnotation
* @returns {ApiTextAnnotation[]}
*/
ApiBaseMarkupAnnotation.prototype.GetReplies = function() { return []; };

/**
* Removes annotation from document.
* @memberof ApiBaseAnnotation
* @returns {boolean}
*/
ApiBaseMarkupAnnotation.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current annotation.
* @memberof ApiBaseAnnotation
* @returns {string}
* @since 9.4.0
*/
ApiBaseMarkupAnnotation.prototype.GetInternalId = function() { return ""; };

/**
* Returns a type of the ApiHighlightAnnotation class.
* @memberof ApiHighlightAnnotation
* @returns {"highlightAnnot"}
*/
ApiHighlightAnnotation.prototype.GetClassType = function() { return ""; };

/**
* Sets quads to current markup annotation.
* @memberof ApiBaseMarkupAnnotation
* @param {Quad[]} quads
* @returns {boolean}
*/
ApiHighlightAnnotation.prototype.SetQuads = function(quads) { return true; };

/**
* Gets quads from current markup annotation.
* @memberof ApiBaseMarkupAnnotation
* @returns {Quad[]}
*/
ApiHighlightAnnotation.prototype.GetQuads = function() { return []; };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @param {Rect} rect
* @returns {boolean}
*/
ApiHighlightAnnotation.prototype.SetRect = function(rect) { return true; };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @returns {Rect}
*/
ApiHighlightAnnotation.prototype.GetRect = function() { return new Rect(); };

/**
* Sets annotation position.
* @memberof ApiBaseAnnotation
* @param {Point} position
* @returns {boolean}
*/
ApiHighlightAnnotation.prototype.SetPosition = function(position) { return true; };

/**
* Gets annotation position.
* @memberof ApiBaseAnnotation
* @returns {Point}
*/
ApiHighlightAnnotation.prototype.GetPosition = function() { return new Point(); };

/**
* Sets annotation border color.
* @memberof ApiBaseAnnotation
* @param {ApiColor} color
* @returns {boolean}
*/
ApiHighlightAnnotation.prototype.SetBorderColor = function(color) { return true; };

/**
* Gets annotation border color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiHighlightAnnotation.prototype.GetBorderColor = function() { return new ApiColor(); };

/**
* Sets annotation fill color.
* @memberof ApiBaseAnnotation
* @param {?ApiColor} color - color to set fill (omit the argument to set no fill)
* @returns {boolean}
*/
ApiHighlightAnnotation.prototype.SetFillColor = function(color) { return true; };

/**
* Gets annotation fill color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiHighlightAnnotation.prototype.GetFillColor = function() { return new ApiColor(); };

/**
* Sets annotation border width.
* @memberof ApiBaseAnnotation
* @param {pt} width
* @returns {boolean}
*/
ApiHighlightAnnotation.prototype.SetBorderWidth = function(width) { return true; };

/**
* Gets annotation border width.
* @memberof ApiBaseAnnotation
* @returns {pt}
*/
ApiHighlightAnnotation.prototype.GetBorderWidth = function() { return new pt(); };

/**
* Sets annotation border style.
* @memberof ApiBaseAnnotation
* @param {AnnotBorderStyle} borderStyle
* @returns {boolean}
*/
ApiHighlightAnnotation.prototype.SetBorderStyle = function(borderStyle) { return true; };

/**
* Gets annotation border style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderStyle}
*/
ApiHighlightAnnotation.prototype.GetBorderStyle = function() { return new AnnotBorderStyle(); };

/**
* Sets annotation author name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiHighlightAnnotation.prototype.SetAuthorName = function(name) { return true; };

/**
* Gets annotation author name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiHighlightAnnotation.prototype.GetAuthorName = function() { return ""; };

/**
* Sets annotation contents.
* @memberof ApiBaseAnnotation
* @param {?string} contents
* @returns {boolean}
*/
ApiHighlightAnnotation.prototype.SetContents = function(contents) { return true; };

/**
* Gets annotation contents.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiHighlightAnnotation.prototype.GetContents = function() { return ""; };

/**
* Sets annotation creation date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiHighlightAnnotation.prototype.SetCreationDate = function(timeStamp) { return true; };

/**
* Gets annotation creation date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiHighlightAnnotation.prototype.GetCreationDate = function() { return 0; };

/**
* Sets annotation last modification date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiHighlightAnnotation.prototype.SetModDate = function(timeStamp) { return true; };

/**
* Gets annotation last modification date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiHighlightAnnotation.prototype.GetModDate = function() { return 0; };

/**
* Sets annotation unique name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiHighlightAnnotation.prototype.SetUniqueName = function(name) { return true; };

/**
* Gets annotation unique name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiHighlightAnnotation.prototype.GetUniqueName = function() { return ""; };

/**
* Sets annotation opacity.
* @memberof ApiBaseAnnotation
* @param {percentage} name
* @returns {boolean}
*/
ApiHighlightAnnotation.prototype.SetOpacity = function(name) { return true; };

/**
* Gets annotation opacity.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiHighlightAnnotation.prototype.GetOpacity = function() { return ""; };

/**
* Sets annotation subject.
* @memberof ApiBaseAnnotation
* @param {?string} subject
* @returns {boolean}
*/
ApiHighlightAnnotation.prototype.SetSubject = function(subject) { return true; };

/**
* Gets annotation subject.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiHighlightAnnotation.prototype.GetSubject = function() { return ""; };

/**
* Sets annotation display type.
* @memberof ApiBaseAnnotation
* @param {DisplayType} display
* @returns {boolean}
*/
ApiHighlightAnnotation.prototype.SetDisplay = function(display) { return true; };

/**
* Gets annotation display type.
* @memberof ApiBaseAnnotation
* @returns {DisplayType}
*/
ApiHighlightAnnotation.prototype.GetDisplay = function() { return new DisplayType(); };

/**
* Sets annotation dash pattern.
* <note> The border style property must be set to "dashed". </note>
* @memberof ApiBaseAnnotation
* @param {number[]} pattern - A dash array defining a pattern of dashes and gaps to be used in drawing a dashed border. For example, a value of [3, 2] specifies a border drawn with 3-point dashes alternating with 2-point gaps.
* @returns {boolean}
*/
ApiHighlightAnnotation.prototype.SetDashPattern = function(pattern) { return true; };

/**
* Gets annotation dash pattern.
* @memberof ApiBaseAnnotation
* @returns {number[]}
*/
ApiHighlightAnnotation.prototype.GetDashPattern = function() { return []; };

/**
* Sets annotation border effect style.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {AnnotBorderEffectStyle} style
* @returns {boolean}
*/
ApiHighlightAnnotation.prototype.SetBorderEffectStyle = function(style) { return true; };

/**
* Gets annotation border effect style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderEffectStyle}
*/
ApiHighlightAnnotation.prototype.GetBorderEffectStyle = function() { return new AnnotBorderEffectStyle(); };

/**
* Sets annotation border effect intensity.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiHighlightAnnotation.prototype.SetBorderEffectIntensity = function(value) { return true; };

/**
* Gets annotation border effect intensity.
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiHighlightAnnotation.prototype.GetBorderEffectIntensity = function(value) { return true; };

/**
* Adds reply on this annot.
* @memberof ApiBaseAnnotation
* @param {ApiTextAnnotation} textAnnot
* @returns {boolean}
*/
ApiHighlightAnnotation.prototype.AddReply = function(textAnnot) { return true; };

/**
* Gets replies on this annot.
* @memberof ApiBaseAnnotation
* @returns {ApiTextAnnotation[]}
*/
ApiHighlightAnnotation.prototype.GetReplies = function() { return []; };

/**
* Removes annotation from document.
* @memberof ApiBaseAnnotation
* @returns {boolean}
*/
ApiHighlightAnnotation.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current annotation.
* @memberof ApiBaseAnnotation
* @returns {string}
* @since 9.4.0
*/
ApiHighlightAnnotation.prototype.GetInternalId = function() { return ""; };

/**
* Returns a type of the ApiStrikeoutAnnotation class.
* @memberof ApiStrikeoutAnnotation
* @returns {"strikeoutAnnot"}
*/
ApiStrikeoutAnnotation.prototype.GetClassType = function() { return ""; };

/**
* Sets quads to current markup annotation.
* @memberof ApiBaseMarkupAnnotation
* @param {Quad[]} quads
* @returns {boolean}
*/
ApiStrikeoutAnnotation.prototype.SetQuads = function(quads) { return true; };

/**
* Gets quads from current markup annotation.
* @memberof ApiBaseMarkupAnnotation
* @returns {Quad[]}
*/
ApiStrikeoutAnnotation.prototype.GetQuads = function() { return []; };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @param {Rect} rect
* @returns {boolean}
*/
ApiStrikeoutAnnotation.prototype.SetRect = function(rect) { return true; };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @returns {Rect}
*/
ApiStrikeoutAnnotation.prototype.GetRect = function() { return new Rect(); };

/**
* Sets annotation position.
* @memberof ApiBaseAnnotation
* @param {Point} position
* @returns {boolean}
*/
ApiStrikeoutAnnotation.prototype.SetPosition = function(position) { return true; };

/**
* Gets annotation position.
* @memberof ApiBaseAnnotation
* @returns {Point}
*/
ApiStrikeoutAnnotation.prototype.GetPosition = function() { return new Point(); };

/**
* Sets annotation border color.
* @memberof ApiBaseAnnotation
* @param {ApiColor} color
* @returns {boolean}
*/
ApiStrikeoutAnnotation.prototype.SetBorderColor = function(color) { return true; };

/**
* Gets annotation border color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiStrikeoutAnnotation.prototype.GetBorderColor = function() { return new ApiColor(); };

/**
* Sets annotation fill color.
* @memberof ApiBaseAnnotation
* @param {?ApiColor} color - color to set fill (omit the argument to set no fill)
* @returns {boolean}
*/
ApiStrikeoutAnnotation.prototype.SetFillColor = function(color) { return true; };

/**
* Gets annotation fill color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiStrikeoutAnnotation.prototype.GetFillColor = function() { return new ApiColor(); };

/**
* Sets annotation border width.
* @memberof ApiBaseAnnotation
* @param {pt} width
* @returns {boolean}
*/
ApiStrikeoutAnnotation.prototype.SetBorderWidth = function(width) { return true; };

/**
* Gets annotation border width.
* @memberof ApiBaseAnnotation
* @returns {pt}
*/
ApiStrikeoutAnnotation.prototype.GetBorderWidth = function() { return new pt(); };

/**
* Sets annotation border style.
* @memberof ApiBaseAnnotation
* @param {AnnotBorderStyle} borderStyle
* @returns {boolean}
*/
ApiStrikeoutAnnotation.prototype.SetBorderStyle = function(borderStyle) { return true; };

/**
* Gets annotation border style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderStyle}
*/
ApiStrikeoutAnnotation.prototype.GetBorderStyle = function() { return new AnnotBorderStyle(); };

/**
* Sets annotation author name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiStrikeoutAnnotation.prototype.SetAuthorName = function(name) { return true; };

/**
* Gets annotation author name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiStrikeoutAnnotation.prototype.GetAuthorName = function() { return ""; };

/**
* Sets annotation contents.
* @memberof ApiBaseAnnotation
* @param {?string} contents
* @returns {boolean}
*/
ApiStrikeoutAnnotation.prototype.SetContents = function(contents) { return true; };

/**
* Gets annotation contents.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiStrikeoutAnnotation.prototype.GetContents = function() { return ""; };

/**
* Sets annotation creation date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiStrikeoutAnnotation.prototype.SetCreationDate = function(timeStamp) { return true; };

/**
* Gets annotation creation date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiStrikeoutAnnotation.prototype.GetCreationDate = function() { return 0; };

/**
* Sets annotation last modification date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiStrikeoutAnnotation.prototype.SetModDate = function(timeStamp) { return true; };

/**
* Gets annotation last modification date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiStrikeoutAnnotation.prototype.GetModDate = function() { return 0; };

/**
* Sets annotation unique name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiStrikeoutAnnotation.prototype.SetUniqueName = function(name) { return true; };

/**
* Gets annotation unique name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiStrikeoutAnnotation.prototype.GetUniqueName = function() { return ""; };

/**
* Sets annotation opacity.
* @memberof ApiBaseAnnotation
* @param {percentage} name
* @returns {boolean}
*/
ApiStrikeoutAnnotation.prototype.SetOpacity = function(name) { return true; };

/**
* Gets annotation opacity.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiStrikeoutAnnotation.prototype.GetOpacity = function() { return ""; };

/**
* Sets annotation subject.
* @memberof ApiBaseAnnotation
* @param {?string} subject
* @returns {boolean}
*/
ApiStrikeoutAnnotation.prototype.SetSubject = function(subject) { return true; };

/**
* Gets annotation subject.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiStrikeoutAnnotation.prototype.GetSubject = function() { return ""; };

/**
* Sets annotation display type.
* @memberof ApiBaseAnnotation
* @param {DisplayType} display
* @returns {boolean}
*/
ApiStrikeoutAnnotation.prototype.SetDisplay = function(display) { return true; };

/**
* Gets annotation display type.
* @memberof ApiBaseAnnotation
* @returns {DisplayType}
*/
ApiStrikeoutAnnotation.prototype.GetDisplay = function() { return new DisplayType(); };

/**
* Sets annotation dash pattern.
* <note> The border style property must be set to "dashed". </note>
* @memberof ApiBaseAnnotation
* @param {number[]} pattern - A dash array defining a pattern of dashes and gaps to be used in drawing a dashed border. For example, a value of [3, 2] specifies a border drawn with 3-point dashes alternating with 2-point gaps.
* @returns {boolean}
*/
ApiStrikeoutAnnotation.prototype.SetDashPattern = function(pattern) { return true; };

/**
* Gets annotation dash pattern.
* @memberof ApiBaseAnnotation
* @returns {number[]}
*/
ApiStrikeoutAnnotation.prototype.GetDashPattern = function() { return []; };

/**
* Sets annotation border effect style.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {AnnotBorderEffectStyle} style
* @returns {boolean}
*/
ApiStrikeoutAnnotation.prototype.SetBorderEffectStyle = function(style) { return true; };

/**
* Gets annotation border effect style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderEffectStyle}
*/
ApiStrikeoutAnnotation.prototype.GetBorderEffectStyle = function() { return new AnnotBorderEffectStyle(); };

/**
* Sets annotation border effect intensity.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiStrikeoutAnnotation.prototype.SetBorderEffectIntensity = function(value) { return true; };

/**
* Gets annotation border effect intensity.
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiStrikeoutAnnotation.prototype.GetBorderEffectIntensity = function(value) { return true; };

/**
* Adds reply on this annot.
* @memberof ApiBaseAnnotation
* @param {ApiTextAnnotation} textAnnot
* @returns {boolean}
*/
ApiStrikeoutAnnotation.prototype.AddReply = function(textAnnot) { return true; };

/**
* Gets replies on this annot.
* @memberof ApiBaseAnnotation
* @returns {ApiTextAnnotation[]}
*/
ApiStrikeoutAnnotation.prototype.GetReplies = function() { return []; };

/**
* Removes annotation from document.
* @memberof ApiBaseAnnotation
* @returns {boolean}
*/
ApiStrikeoutAnnotation.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current annotation.
* @memberof ApiBaseAnnotation
* @returns {string}
* @since 9.4.0
*/
ApiStrikeoutAnnotation.prototype.GetInternalId = function() { return ""; };

/**
* Returns a type of the ApiUnderlineAnnotation class.
* @memberof ApiUnderlineAnnotation
* @returns {"underlineAnnot"}
*/
ApiUnderlineAnnotation.prototype.GetClassType = function() { return ""; };

/**
* Sets quads to current markup annotation.
* @memberof ApiBaseMarkupAnnotation
* @param {Quad[]} quads
* @returns {boolean}
*/
ApiUnderlineAnnotation.prototype.SetQuads = function(quads) { return true; };

/**
* Gets quads from current markup annotation.
* @memberof ApiBaseMarkupAnnotation
* @returns {Quad[]}
*/
ApiUnderlineAnnotation.prototype.GetQuads = function() { return []; };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @param {Rect} rect
* @returns {boolean}
*/
ApiUnderlineAnnotation.prototype.SetRect = function(rect) { return true; };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @returns {Rect}
*/
ApiUnderlineAnnotation.prototype.GetRect = function() { return new Rect(); };

/**
* Sets annotation position.
* @memberof ApiBaseAnnotation
* @param {Point} position
* @returns {boolean}
*/
ApiUnderlineAnnotation.prototype.SetPosition = function(position) { return true; };

/**
* Gets annotation position.
* @memberof ApiBaseAnnotation
* @returns {Point}
*/
ApiUnderlineAnnotation.prototype.GetPosition = function() { return new Point(); };

/**
* Sets annotation border color.
* @memberof ApiBaseAnnotation
* @param {ApiColor} color
* @returns {boolean}
*/
ApiUnderlineAnnotation.prototype.SetBorderColor = function(color) { return true; };

/**
* Gets annotation border color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiUnderlineAnnotation.prototype.GetBorderColor = function() { return new ApiColor(); };

/**
* Sets annotation fill color.
* @memberof ApiBaseAnnotation
* @param {?ApiColor} color - color to set fill (omit the argument to set no fill)
* @returns {boolean}
*/
ApiUnderlineAnnotation.prototype.SetFillColor = function(color) { return true; };

/**
* Gets annotation fill color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiUnderlineAnnotation.prototype.GetFillColor = function() { return new ApiColor(); };

/**
* Sets annotation border width.
* @memberof ApiBaseAnnotation
* @param {pt} width
* @returns {boolean}
*/
ApiUnderlineAnnotation.prototype.SetBorderWidth = function(width) { return true; };

/**
* Gets annotation border width.
* @memberof ApiBaseAnnotation
* @returns {pt}
*/
ApiUnderlineAnnotation.prototype.GetBorderWidth = function() { return new pt(); };

/**
* Sets annotation border style.
* @memberof ApiBaseAnnotation
* @param {AnnotBorderStyle} borderStyle
* @returns {boolean}
*/
ApiUnderlineAnnotation.prototype.SetBorderStyle = function(borderStyle) { return true; };

/**
* Gets annotation border style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderStyle}
*/
ApiUnderlineAnnotation.prototype.GetBorderStyle = function() { return new AnnotBorderStyle(); };

/**
* Sets annotation author name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiUnderlineAnnotation.prototype.SetAuthorName = function(name) { return true; };

/**
* Gets annotation author name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiUnderlineAnnotation.prototype.GetAuthorName = function() { return ""; };

/**
* Sets annotation contents.
* @memberof ApiBaseAnnotation
* @param {?string} contents
* @returns {boolean}
*/
ApiUnderlineAnnotation.prototype.SetContents = function(contents) { return true; };

/**
* Gets annotation contents.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiUnderlineAnnotation.prototype.GetContents = function() { return ""; };

/**
* Sets annotation creation date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiUnderlineAnnotation.prototype.SetCreationDate = function(timeStamp) { return true; };

/**
* Gets annotation creation date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiUnderlineAnnotation.prototype.GetCreationDate = function() { return 0; };

/**
* Sets annotation last modification date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiUnderlineAnnotation.prototype.SetModDate = function(timeStamp) { return true; };

/**
* Gets annotation last modification date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiUnderlineAnnotation.prototype.GetModDate = function() { return 0; };

/**
* Sets annotation unique name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiUnderlineAnnotation.prototype.SetUniqueName = function(name) { return true; };

/**
* Gets annotation unique name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiUnderlineAnnotation.prototype.GetUniqueName = function() { return ""; };

/**
* Sets annotation opacity.
* @memberof ApiBaseAnnotation
* @param {percentage} name
* @returns {boolean}
*/
ApiUnderlineAnnotation.prototype.SetOpacity = function(name) { return true; };

/**
* Gets annotation opacity.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiUnderlineAnnotation.prototype.GetOpacity = function() { return ""; };

/**
* Sets annotation subject.
* @memberof ApiBaseAnnotation
* @param {?string} subject
* @returns {boolean}
*/
ApiUnderlineAnnotation.prototype.SetSubject = function(subject) { return true; };

/**
* Gets annotation subject.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiUnderlineAnnotation.prototype.GetSubject = function() { return ""; };

/**
* Sets annotation display type.
* @memberof ApiBaseAnnotation
* @param {DisplayType} display
* @returns {boolean}
*/
ApiUnderlineAnnotation.prototype.SetDisplay = function(display) { return true; };

/**
* Gets annotation display type.
* @memberof ApiBaseAnnotation
* @returns {DisplayType}
*/
ApiUnderlineAnnotation.prototype.GetDisplay = function() { return new DisplayType(); };

/**
* Sets annotation dash pattern.
* <note> The border style property must be set to "dashed". </note>
* @memberof ApiBaseAnnotation
* @param {number[]} pattern - A dash array defining a pattern of dashes and gaps to be used in drawing a dashed border. For example, a value of [3, 2] specifies a border drawn with 3-point dashes alternating with 2-point gaps.
* @returns {boolean}
*/
ApiUnderlineAnnotation.prototype.SetDashPattern = function(pattern) { return true; };

/**
* Gets annotation dash pattern.
* @memberof ApiBaseAnnotation
* @returns {number[]}
*/
ApiUnderlineAnnotation.prototype.GetDashPattern = function() { return []; };

/**
* Sets annotation border effect style.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {AnnotBorderEffectStyle} style
* @returns {boolean}
*/
ApiUnderlineAnnotation.prototype.SetBorderEffectStyle = function(style) { return true; };

/**
* Gets annotation border effect style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderEffectStyle}
*/
ApiUnderlineAnnotation.prototype.GetBorderEffectStyle = function() { return new AnnotBorderEffectStyle(); };

/**
* Sets annotation border effect intensity.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiUnderlineAnnotation.prototype.SetBorderEffectIntensity = function(value) { return true; };

/**
* Gets annotation border effect intensity.
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiUnderlineAnnotation.prototype.GetBorderEffectIntensity = function(value) { return true; };

/**
* Adds reply on this annot.
* @memberof ApiBaseAnnotation
* @param {ApiTextAnnotation} textAnnot
* @returns {boolean}
*/
ApiUnderlineAnnotation.prototype.AddReply = function(textAnnot) { return true; };

/**
* Gets replies on this annot.
* @memberof ApiBaseAnnotation
* @returns {ApiTextAnnotation[]}
*/
ApiUnderlineAnnotation.prototype.GetReplies = function() { return []; };

/**
* Removes annotation from document.
* @memberof ApiBaseAnnotation
* @returns {boolean}
*/
ApiUnderlineAnnotation.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current annotation.
* @memberof ApiBaseAnnotation
* @returns {string}
* @since 9.4.0
*/
ApiUnderlineAnnotation.prototype.GetInternalId = function() { return ""; };

/**
* Returns a type of the ApiCaretAnnotation class.
* @memberof ApiCaretAnnotation
* @returns {"caretAnnot"}
*/
ApiCaretAnnotation.prototype.GetClassType = function() { return ""; };

/**
* Sets quads to current markup annotation.
* @memberof ApiBaseMarkupAnnotation
* @param {Quad[]} quads
* @returns {boolean}
*/
ApiCaretAnnotation.prototype.SetQuads = function(quads) { return true; };

/**
* Gets quads from current markup annotation.
* @memberof ApiBaseMarkupAnnotation
* @returns {Quad[]}
*/
ApiCaretAnnotation.prototype.GetQuads = function() { return []; };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @param {Rect} rect
* @returns {boolean}
*/
ApiCaretAnnotation.prototype.SetRect = function(rect) { return true; };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @returns {Rect}
*/
ApiCaretAnnotation.prototype.GetRect = function() { return new Rect(); };

/**
* Sets annotation position.
* @memberof ApiBaseAnnotation
* @param {Point} position
* @returns {boolean}
*/
ApiCaretAnnotation.prototype.SetPosition = function(position) { return true; };

/**
* Gets annotation position.
* @memberof ApiBaseAnnotation
* @returns {Point}
*/
ApiCaretAnnotation.prototype.GetPosition = function() { return new Point(); };

/**
* Sets annotation border color.
* @memberof ApiBaseAnnotation
* @param {ApiColor} color
* @returns {boolean}
*/
ApiCaretAnnotation.prototype.SetBorderColor = function(color) { return true; };

/**
* Gets annotation border color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiCaretAnnotation.prototype.GetBorderColor = function() { return new ApiColor(); };

/**
* Sets annotation fill color.
* @memberof ApiBaseAnnotation
* @param {?ApiColor} color - color to set fill (omit the argument to set no fill)
* @returns {boolean}
*/
ApiCaretAnnotation.prototype.SetFillColor = function(color) { return true; };

/**
* Gets annotation fill color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiCaretAnnotation.prototype.GetFillColor = function() { return new ApiColor(); };

/**
* Sets annotation border width.
* @memberof ApiBaseAnnotation
* @param {pt} width
* @returns {boolean}
*/
ApiCaretAnnotation.prototype.SetBorderWidth = function(width) { return true; };

/**
* Gets annotation border width.
* @memberof ApiBaseAnnotation
* @returns {pt}
*/
ApiCaretAnnotation.prototype.GetBorderWidth = function() { return new pt(); };

/**
* Sets annotation border style.
* @memberof ApiBaseAnnotation
* @param {AnnotBorderStyle} borderStyle
* @returns {boolean}
*/
ApiCaretAnnotation.prototype.SetBorderStyle = function(borderStyle) { return true; };

/**
* Gets annotation border style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderStyle}
*/
ApiCaretAnnotation.prototype.GetBorderStyle = function() { return new AnnotBorderStyle(); };

/**
* Sets annotation author name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiCaretAnnotation.prototype.SetAuthorName = function(name) { return true; };

/**
* Gets annotation author name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiCaretAnnotation.prototype.GetAuthorName = function() { return ""; };

/**
* Sets annotation contents.
* @memberof ApiBaseAnnotation
* @param {?string} contents
* @returns {boolean}
*/
ApiCaretAnnotation.prototype.SetContents = function(contents) { return true; };

/**
* Gets annotation contents.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiCaretAnnotation.prototype.GetContents = function() { return ""; };

/**
* Sets annotation creation date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiCaretAnnotation.prototype.SetCreationDate = function(timeStamp) { return true; };

/**
* Gets annotation creation date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiCaretAnnotation.prototype.GetCreationDate = function() { return 0; };

/**
* Sets annotation last modification date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiCaretAnnotation.prototype.SetModDate = function(timeStamp) { return true; };

/**
* Gets annotation last modification date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiCaretAnnotation.prototype.GetModDate = function() { return 0; };

/**
* Sets annotation unique name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiCaretAnnotation.prototype.SetUniqueName = function(name) { return true; };

/**
* Gets annotation unique name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiCaretAnnotation.prototype.GetUniqueName = function() { return ""; };

/**
* Sets annotation opacity.
* @memberof ApiBaseAnnotation
* @param {percentage} name
* @returns {boolean}
*/
ApiCaretAnnotation.prototype.SetOpacity = function(name) { return true; };

/**
* Gets annotation opacity.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiCaretAnnotation.prototype.GetOpacity = function() { return ""; };

/**
* Sets annotation subject.
* @memberof ApiBaseAnnotation
* @param {?string} subject
* @returns {boolean}
*/
ApiCaretAnnotation.prototype.SetSubject = function(subject) { return true; };

/**
* Gets annotation subject.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiCaretAnnotation.prototype.GetSubject = function() { return ""; };

/**
* Sets annotation display type.
* @memberof ApiBaseAnnotation
* @param {DisplayType} display
* @returns {boolean}
*/
ApiCaretAnnotation.prototype.SetDisplay = function(display) { return true; };

/**
* Gets annotation display type.
* @memberof ApiBaseAnnotation
* @returns {DisplayType}
*/
ApiCaretAnnotation.prototype.GetDisplay = function() { return new DisplayType(); };

/**
* Sets annotation dash pattern.
* <note> The border style property must be set to "dashed". </note>
* @memberof ApiBaseAnnotation
* @param {number[]} pattern - A dash array defining a pattern of dashes and gaps to be used in drawing a dashed border. For example, a value of [3, 2] specifies a border drawn with 3-point dashes alternating with 2-point gaps.
* @returns {boolean}
*/
ApiCaretAnnotation.prototype.SetDashPattern = function(pattern) { return true; };

/**
* Gets annotation dash pattern.
* @memberof ApiBaseAnnotation
* @returns {number[]}
*/
ApiCaretAnnotation.prototype.GetDashPattern = function() { return []; };

/**
* Sets annotation border effect style.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {AnnotBorderEffectStyle} style
* @returns {boolean}
*/
ApiCaretAnnotation.prototype.SetBorderEffectStyle = function(style) { return true; };

/**
* Gets annotation border effect style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderEffectStyle}
*/
ApiCaretAnnotation.prototype.GetBorderEffectStyle = function() { return new AnnotBorderEffectStyle(); };

/**
* Sets annotation border effect intensity.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiCaretAnnotation.prototype.SetBorderEffectIntensity = function(value) { return true; };

/**
* Gets annotation border effect intensity.
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiCaretAnnotation.prototype.GetBorderEffectIntensity = function(value) { return true; };

/**
* Adds reply on this annot.
* @memberof ApiBaseAnnotation
* @param {ApiTextAnnotation} textAnnot
* @returns {boolean}
*/
ApiCaretAnnotation.prototype.AddReply = function(textAnnot) { return true; };

/**
* Gets replies on this annot.
* @memberof ApiBaseAnnotation
* @returns {ApiTextAnnotation[]}
*/
ApiCaretAnnotation.prototype.GetReplies = function() { return []; };

/**
* Removes annotation from document.
* @memberof ApiBaseAnnotation
* @returns {boolean}
*/
ApiCaretAnnotation.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current annotation.
* @memberof ApiBaseAnnotation
* @returns {string}
* @since 9.4.0
*/
ApiCaretAnnotation.prototype.GetInternalId = function() { return ""; };

/**
* Returns a type of the ApiRedactAnnotation class.
* @memberof ApiRedactAnnotation
* @returns {"redactAnnot"}
*/
ApiRedactAnnotation.prototype.GetClassType = function() { return ""; };

/**
* Sets quads to current markup annotation.
* @memberof ApiBaseMarkupAnnotation
* @param {Quad[]} quads
* @returns {boolean}
*/
ApiRedactAnnotation.prototype.SetQuads = function(quads) { return true; };

/**
* Gets quads from current markup annotation.
* @memberof ApiBaseMarkupAnnotation
* @returns {Quad[]}
*/
ApiRedactAnnotation.prototype.GetQuads = function() { return []; };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @param {Rect} rect
* @returns {boolean}
*/
ApiRedactAnnotation.prototype.SetRect = function(rect) { return true; };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @returns {Rect}
*/
ApiRedactAnnotation.prototype.GetRect = function() { return new Rect(); };

/**
* Sets annotation position.
* @memberof ApiBaseAnnotation
* @param {Point} position
* @returns {boolean}
*/
ApiRedactAnnotation.prototype.SetPosition = function(position) { return true; };

/**
* Gets annotation position.
* @memberof ApiBaseAnnotation
* @returns {Point}
*/
ApiRedactAnnotation.prototype.GetPosition = function() { return new Point(); };

/**
* Sets annotation border color.
* @memberof ApiBaseAnnotation
* @param {ApiColor} color
* @returns {boolean}
*/
ApiRedactAnnotation.prototype.SetBorderColor = function(color) { return true; };

/**
* Gets annotation border color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiRedactAnnotation.prototype.GetBorderColor = function() { return new ApiColor(); };

/**
* Sets annotation fill color.
* @memberof ApiBaseAnnotation
* @param {?ApiColor} color - color to set fill (omit the argument to set no fill)
* @returns {boolean}
*/
ApiRedactAnnotation.prototype.SetFillColor = function(color) { return true; };

/**
* Gets annotation fill color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiRedactAnnotation.prototype.GetFillColor = function() { return new ApiColor(); };

/**
* Sets annotation border width.
* @memberof ApiBaseAnnotation
* @param {pt} width
* @returns {boolean}
*/
ApiRedactAnnotation.prototype.SetBorderWidth = function(width) { return true; };

/**
* Gets annotation border width.
* @memberof ApiBaseAnnotation
* @returns {pt}
*/
ApiRedactAnnotation.prototype.GetBorderWidth = function() { return new pt(); };

/**
* Sets annotation border style.
* @memberof ApiBaseAnnotation
* @param {AnnotBorderStyle} borderStyle
* @returns {boolean}
*/
ApiRedactAnnotation.prototype.SetBorderStyle = function(borderStyle) { return true; };

/**
* Gets annotation border style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderStyle}
*/
ApiRedactAnnotation.prototype.GetBorderStyle = function() { return new AnnotBorderStyle(); };

/**
* Sets annotation author name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiRedactAnnotation.prototype.SetAuthorName = function(name) { return true; };

/**
* Gets annotation author name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiRedactAnnotation.prototype.GetAuthorName = function() { return ""; };

/**
* Sets annotation contents.
* @memberof ApiBaseAnnotation
* @param {?string} contents
* @returns {boolean}
*/
ApiRedactAnnotation.prototype.SetContents = function(contents) { return true; };

/**
* Gets annotation contents.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiRedactAnnotation.prototype.GetContents = function() { return ""; };

/**
* Sets annotation creation date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiRedactAnnotation.prototype.SetCreationDate = function(timeStamp) { return true; };

/**
* Gets annotation creation date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiRedactAnnotation.prototype.GetCreationDate = function() { return 0; };

/**
* Sets annotation last modification date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiRedactAnnotation.prototype.SetModDate = function(timeStamp) { return true; };

/**
* Gets annotation last modification date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiRedactAnnotation.prototype.GetModDate = function() { return 0; };

/**
* Sets annotation unique name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiRedactAnnotation.prototype.SetUniqueName = function(name) { return true; };

/**
* Gets annotation unique name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiRedactAnnotation.prototype.GetUniqueName = function() { return ""; };

/**
* Sets annotation opacity.
* @memberof ApiBaseAnnotation
* @param {percentage} name
* @returns {boolean}
*/
ApiRedactAnnotation.prototype.SetOpacity = function(name) { return true; };

/**
* Gets annotation opacity.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiRedactAnnotation.prototype.GetOpacity = function() { return ""; };

/**
* Sets annotation subject.
* @memberof ApiBaseAnnotation
* @param {?string} subject
* @returns {boolean}
*/
ApiRedactAnnotation.prototype.SetSubject = function(subject) { return true; };

/**
* Gets annotation subject.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiRedactAnnotation.prototype.GetSubject = function() { return ""; };

/**
* Sets annotation display type.
* @memberof ApiBaseAnnotation
* @param {DisplayType} display
* @returns {boolean}
*/
ApiRedactAnnotation.prototype.SetDisplay = function(display) { return true; };

/**
* Gets annotation display type.
* @memberof ApiBaseAnnotation
* @returns {DisplayType}
*/
ApiRedactAnnotation.prototype.GetDisplay = function() { return new DisplayType(); };

/**
* Sets annotation dash pattern.
* <note> The border style property must be set to "dashed". </note>
* @memberof ApiBaseAnnotation
* @param {number[]} pattern - A dash array defining a pattern of dashes and gaps to be used in drawing a dashed border. For example, a value of [3, 2] specifies a border drawn with 3-point dashes alternating with 2-point gaps.
* @returns {boolean}
*/
ApiRedactAnnotation.prototype.SetDashPattern = function(pattern) { return true; };

/**
* Gets annotation dash pattern.
* @memberof ApiBaseAnnotation
* @returns {number[]}
*/
ApiRedactAnnotation.prototype.GetDashPattern = function() { return []; };

/**
* Sets annotation border effect style.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {AnnotBorderEffectStyle} style
* @returns {boolean}
*/
ApiRedactAnnotation.prototype.SetBorderEffectStyle = function(style) { return true; };

/**
* Gets annotation border effect style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderEffectStyle}
*/
ApiRedactAnnotation.prototype.GetBorderEffectStyle = function() { return new AnnotBorderEffectStyle(); };

/**
* Sets annotation border effect intensity.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiRedactAnnotation.prototype.SetBorderEffectIntensity = function(value) { return true; };

/**
* Gets annotation border effect intensity.
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiRedactAnnotation.prototype.GetBorderEffectIntensity = function(value) { return true; };

/**
* Adds reply on this annot.
* @memberof ApiBaseAnnotation
* @param {ApiTextAnnotation} textAnnot
* @returns {boolean}
*/
ApiRedactAnnotation.prototype.AddReply = function(textAnnot) { return true; };

/**
* Gets replies on this annot.
* @memberof ApiBaseAnnotation
* @returns {ApiTextAnnotation[]}
*/
ApiRedactAnnotation.prototype.GetReplies = function() { return []; };

/**
* Removes annotation from document.
* @memberof ApiBaseAnnotation
* @returns {boolean}
*/
ApiRedactAnnotation.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current annotation.
* @memberof ApiBaseAnnotation
* @returns {string}
* @since 9.4.0
*/
ApiRedactAnnotation.prototype.GetInternalId = function() { return ""; };

/**
* Returns a type of the ApiLinkAnnotation class.
* @memberof ApiLinkAnnotation
* @returns {"linkAnnot"}
*/
ApiLinkAnnotation.prototype.GetClassType = function() { return ""; };

/**
* Sets quads to current markup annotation.
* @memberof ApiBaseMarkupAnnotation
* @param {Quad[]} quads
* @returns {boolean}
*/
ApiLinkAnnotation.prototype.SetQuads = function(quads) { return true; };

/**
* Gets quads from current markup annotation.
* @memberof ApiBaseMarkupAnnotation
* @returns {Quad[]}
*/
ApiLinkAnnotation.prototype.GetQuads = function() { return []; };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @param {Rect} rect
* @returns {boolean}
*/
ApiLinkAnnotation.prototype.SetRect = function(rect) { return true; };

/**
* Sets annotation rect.
* @memberof ApiBaseAnnotation
* @returns {Rect}
*/
ApiLinkAnnotation.prototype.GetRect = function() { return new Rect(); };

/**
* Sets annotation position.
* @memberof ApiBaseAnnotation
* @param {Point} position
* @returns {boolean}
*/
ApiLinkAnnotation.prototype.SetPosition = function(position) { return true; };

/**
* Gets annotation position.
* @memberof ApiBaseAnnotation
* @returns {Point}
*/
ApiLinkAnnotation.prototype.GetPosition = function() { return new Point(); };

/**
* Sets annotation border color.
* @memberof ApiBaseAnnotation
* @param {ApiColor} color
* @returns {boolean}
*/
ApiLinkAnnotation.prototype.SetBorderColor = function(color) { return true; };

/**
* Gets annotation border color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiLinkAnnotation.prototype.GetBorderColor = function() { return new ApiColor(); };

/**
* Sets annotation fill color.
* @memberof ApiBaseAnnotation
* @param {?ApiColor} color - color to set fill (omit the argument to set no fill)
* @returns {boolean}
*/
ApiLinkAnnotation.prototype.SetFillColor = function(color) { return true; };

/**
* Gets annotation fill color.
* @memberof ApiBaseAnnotation
* @returns {?ApiColor}
*/
ApiLinkAnnotation.prototype.GetFillColor = function() { return new ApiColor(); };

/**
* Sets annotation border width.
* @memberof ApiBaseAnnotation
* @param {pt} width
* @returns {boolean}
*/
ApiLinkAnnotation.prototype.SetBorderWidth = function(width) { return true; };

/**
* Gets annotation border width.
* @memberof ApiBaseAnnotation
* @returns {pt}
*/
ApiLinkAnnotation.prototype.GetBorderWidth = function() { return new pt(); };

/**
* Sets annotation border style.
* @memberof ApiBaseAnnotation
* @param {AnnotBorderStyle} borderStyle
* @returns {boolean}
*/
ApiLinkAnnotation.prototype.SetBorderStyle = function(borderStyle) { return true; };

/**
* Gets annotation border style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderStyle}
*/
ApiLinkAnnotation.prototype.GetBorderStyle = function() { return new AnnotBorderStyle(); };

/**
* Sets annotation author name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiLinkAnnotation.prototype.SetAuthorName = function(name) { return true; };

/**
* Gets annotation author name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiLinkAnnotation.prototype.GetAuthorName = function() { return ""; };

/**
* Sets annotation contents.
* @memberof ApiBaseAnnotation
* @param {?string} contents
* @returns {boolean}
*/
ApiLinkAnnotation.prototype.SetContents = function(contents) { return true; };

/**
* Gets annotation contents.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiLinkAnnotation.prototype.GetContents = function() { return ""; };

/**
* Sets annotation creation date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiLinkAnnotation.prototype.SetCreationDate = function(timeStamp) { return true; };

/**
* Gets annotation creation date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiLinkAnnotation.prototype.GetCreationDate = function() { return 0; };

/**
* Sets annotation last modification date.
* @memberof ApiBaseAnnotation
* @param {number} timeStamp
* @returns {boolean}
*/
ApiLinkAnnotation.prototype.SetModDate = function(timeStamp) { return true; };

/**
* Gets annotation last modification date.
* @memberof ApiBaseAnnotation
* @returns {number}
*/
ApiLinkAnnotation.prototype.GetModDate = function() { return 0; };

/**
* Sets annotation unique name.
* @memberof ApiBaseAnnotation
* @param {string} name
* @returns {boolean}
*/
ApiLinkAnnotation.prototype.SetUniqueName = function(name) { return true; };

/**
* Gets annotation unique name.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiLinkAnnotation.prototype.GetUniqueName = function() { return ""; };

/**
* Sets annotation opacity.
* @memberof ApiBaseAnnotation
* @param {percentage} name
* @returns {boolean}
*/
ApiLinkAnnotation.prototype.SetOpacity = function(name) { return true; };

/**
* Gets annotation opacity.
* @memberof ApiBaseAnnotation
* @returns {string}
*/
ApiLinkAnnotation.prototype.GetOpacity = function() { return ""; };

/**
* Sets annotation subject.
* @memberof ApiBaseAnnotation
* @param {?string} subject
* @returns {boolean}
*/
ApiLinkAnnotation.prototype.SetSubject = function(subject) { return true; };

/**
* Gets annotation subject.
* @memberof ApiBaseAnnotation
* @returns {?string}
*/
ApiLinkAnnotation.prototype.GetSubject = function() { return ""; };

/**
* Sets annotation display type.
* @memberof ApiBaseAnnotation
* @param {DisplayType} display
* @returns {boolean}
*/
ApiLinkAnnotation.prototype.SetDisplay = function(display) { return true; };

/**
* Gets annotation display type.
* @memberof ApiBaseAnnotation
* @returns {DisplayType}
*/
ApiLinkAnnotation.prototype.GetDisplay = function() { return new DisplayType(); };

/**
* Sets annotation dash pattern.
* <note> The border style property must be set to "dashed". </note>
* @memberof ApiBaseAnnotation
* @param {number[]} pattern - A dash array defining a pattern of dashes and gaps to be used in drawing a dashed border. For example, a value of [3, 2] specifies a border drawn with 3-point dashes alternating with 2-point gaps.
* @returns {boolean}
*/
ApiLinkAnnotation.prototype.SetDashPattern = function(pattern) { return true; };

/**
* Gets annotation dash pattern.
* @memberof ApiBaseAnnotation
* @returns {number[]}
*/
ApiLinkAnnotation.prototype.GetDashPattern = function() { return []; };

/**
* Sets annotation border effect style.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {AnnotBorderEffectStyle} style
* @returns {boolean}
*/
ApiLinkAnnotation.prototype.SetBorderEffectStyle = function(style) { return true; };

/**
* Gets annotation border effect style.
* @memberof ApiBaseAnnotation
* @returns {AnnotBorderEffectStyle}
*/
ApiLinkAnnotation.prototype.GetBorderEffectStyle = function() { return new AnnotBorderEffectStyle(); };

/**
* Sets annotation border effect intensity.
* <note> Can be applied to circle, square, freeText and polygon annotations </note>
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiLinkAnnotation.prototype.SetBorderEffectIntensity = function(value) { return true; };

/**
* Gets annotation border effect intensity.
* @memberof ApiBaseAnnotation
* @param {number} value
* @returns {boolean}
*/
ApiLinkAnnotation.prototype.GetBorderEffectIntensity = function(value) { return true; };

/**
* Adds reply on this annot.
* @memberof ApiBaseAnnotation
* @param {ApiTextAnnotation} textAnnot
* @returns {boolean}
*/
ApiLinkAnnotation.prototype.AddReply = function(textAnnot) { return true; };

/**
* Gets replies on this annot.
* @memberof ApiBaseAnnotation
* @returns {ApiTextAnnotation[]}
*/
ApiLinkAnnotation.prototype.GetReplies = function() { return []; };

/**
* Removes annotation from document.
* @memberof ApiBaseAnnotation
* @returns {boolean}
*/
ApiLinkAnnotation.prototype.Delete = function() { return true; };

/**
* Returns an internal ID of the current annotation.
* @memberof ApiBaseAnnotation
* @returns {string}
* @since 9.4.0
*/
ApiLinkAnnotation.prototype.GetInternalId = function() { return ""; };

/**
* Returns a type of the ApiRichContent class. 
* @memberof ApiRichContent
* @returns {"richContent"}
*/
ApiRichContent.prototype.GetClassType = function() { return ""; };

/**
* Returns an rich paragraph by its position in the content.
* @memberof ApiRichContent
* @param {number} pos - The element position that will be taken from the content.
* @returns {?ApiRichParagraph}
*/
ApiRichContent.prototype.GetElement = function(pos) { return new ApiRichParagraph(); };

/**
* Adds a rich paragraph using its position in rich content.
* @memberof ApiRichContent
* @param {number} pos - The position where the rich paragraph will be added.
* @param {ApiRichParagraph} richPara - The rich paragraph which will be added at the current position.
* @returns {boolean}
*/
ApiRichContent.prototype.AddElement = function(pos, richPara) { return true; };

/**
* Pushes a rich paragraph to a rich content.
* @memberof ApiRichContent
* @param {ApiRichParagraph} richPara - The rich paragraph which will be pushed to the rich content.
* @returns {boolean}
*/
ApiRichContent.prototype.Push = function(richPara) { return true; };

/**
* Returns an array of rich paragraphs from the current rich content object.
* @memberof ApiRichContent
* @param {boolean} getCopies - Specifies if the copies of the document elements will be returned or not.
* @returns {ApiRichParagraph[]}
*/
ApiRichContent.prototype.GetContent = function(getCopies) { return []; };

/**
* Returns the current paragraph where the cursor is located.
* @memberof ApiRichContent
* @return {?ApiRichParagraph}
*/
ApiRichContent.prototype.GetCurrentParagraph = function() { return new ApiRichParagraph(); };

/**
* Returns the current run where the cursor is located.
* @memberof ApiRichContent
* @return {?ApiRichRun}
*/
ApiRichContent.prototype.GetCurrentRun = function() { return new ApiRichRun(); };

/**
* Returns a type of the ApiRichParaPr class.
* @memberof ApiRichParaPr
* @returns {"richParaPr"}
*/
ApiRichParaPr.prototype.GetClassType = function() { return ""; };

/**
* Returns a type of the ApiRichParagraph class.
* @memberof ApiRichParagraph
* @returns {"richParagraph"}
*/
ApiRichParagraph.prototype.GetClassType = function() { return ""; };

/**
* Adds some text to the current paragraph.
* @memberof ApiRichParagraph
* @param {string} text - The text that we want to insert into the current paragraph.
* @returns {ApiRichRun}
*/
ApiRichParagraph.prototype.AddText = function(text) { return new ApiRichRun(); };

/**
* Sets the paragraph properties.
* @memberof ApiRichParagraph
* @param {ApiRichParaPr} paraPr
* @returns {boolean}
*/
ApiRichParagraph.prototype.SetParaPr = function(paraPr) { return true; };

/**
* Returns the paragraph properties.
* @memberof ApiRichParagraph
* @returns {ApiRichParaPr}
*/
ApiRichParagraph.prototype.GetParaPr = function() { return new ApiRichParaPr(); };

/**
* Adds an element to the current paragraph.
* @memberof ApiRichParagraph
* @param {ApiRichRun} richRun - The element which will be added at the current position.
* @param {number} [pos] - The position where the current element will be added. If this value is not
* specified, then the element will be added at the end of the current paragraph.
* @returns {boolean}
*/
ApiRichParagraph.prototype.AddElement = function(richRun, pos) { return true; };

/**
* Adds an element to the current paragraph.
* @memberof ApiRichParagraph
* @param {ParagraphContent} richRun
* @returns {boolean}
*/
ApiRichParagraph.prototype.Push = function(richRun) { return true; };

/**
* Returns a paragraph element using the position specified.
* @memberof ApiRichParagraph
* @param {number} pos - The position where the element which content we want to get must be located.
* @returns {?ApiRichRun}
*/
ApiRichParagraph.prototype.GetElement = function(pos) { return new ApiRichRun(); };

/**
* Returns the next paragraph.
* @memberof ApiRichParagraph
* @returns {?ApiRichParagraph} - returns null if paragraph is last.
*/
ApiRichParagraph.prototype.GetNext = function() { return new ApiRichParagraph(); };

/**
* Returns the previous paragraph.
* @memberof ApiRichParagraph
* @returns {?ApiRichParagraph} - returns null if paragraph is first.
*/
ApiRichParagraph.prototype.GetPrevious = function() { return new ApiRichParagraph(); };

/**
* Returns the last element of the paragraph.
* @memberof ApiRichParagraph
* @returns {ApiRichRun}
*/
ApiRichParagraph.prototype.Last = function() { return new ApiRichRun(); };

/**
* Creates a paragraph copy.
* @memberof ApiRichParagraph
* @returns {ApiRichParagraph}
*/
ApiRichParagraph.prototype.Copy = function() { return new ApiRichParagraph(); };

/**
* Specifies the reading order for the current paragraph.
* Possible values are:
* <b>null</b> - use the standart direction parameter;
* <b>"ltr"</b> - left-to-right text direction;
* <b>"rtl"</b> - right-to-left text direction.
* @memberof ApiRichParagraph
* @param {?ReadingOrder} [readingOrder = undefined] - The reading order.
* @returns {ApiRichParagraph} - Returns the current paragraph itself (ApiRichParagraph).
*/
ApiRichParagraph.prototype.SetReadingOrder = function(readingOrder) { return new ApiRichParagraph(); };

/**
* Returns a type of the ApiRichTextPr class.
* @memberof ApiRichTextPr
* @returns {"richTextPr"}
*/
ApiRichTextPr.prototype.GetClassType = function() { return ""; };

/**
* Returns a type of the ApiRichRun class.
* @memberof ApiRichRun
* @returns {"richRun"}
*/
ApiRichRun.prototype.GetClassType = function() { return ""; };

/**
* Sets the text properties to the current run.
* @memberof ApiRichRun
* @param {ApiRichTextPr} textPr - The text properties that will be set to the current run.
* @return {ApiRichTextPr}  
*/
ApiRichRun.prototype.SetTextPr = function(textPr) { return new ApiRichTextPr(); };

/**
* Returns the text properties of the current run.
* @memberof ApiRichRun
* @returns {ApiRichTextPr}
*/
ApiRichRun.prototype.GetTextPr = function() { return new ApiRichTextPr(); };

/**
* Creates a copy of the current run.
* @memberof ApiRichRun
* @returns {ApiRichRun}
*/
ApiRichRun.prototype.Copy = function() { return new ApiRichRun(); };

/**
* Returns a parent paragraph of the current run.
* @memberof ApiRichRun
* @return {?ApiRichParagraph}
*/
ApiRichRun.prototype.GetParentParagraph = function() { return new ApiRichParagraph(); };

/**
* Returns the type of the ApiDrawing class.
* @memberof ApiDrawing
* @returns {"drawing"}
*/
ApiDrawing.prototype.GetClassType = function() { return ""; };

/**
* Returns the type of the ApiDrawing class.
* @memberof ApiDrawing
* @returns {?ApiPage}
*/
ApiDrawing.prototype.GetParentPage = function() { return new ApiPage(); };

/**
* Sets the size of the object (image, shape, chart) bounding box.
* @memberof ApiDrawing
* @param {EMU} width - The object width measured in English measure units.
* @param {EMU} height - The object height measured in English measure units.
* @returns {boolean}
*/
ApiDrawing.prototype.SetSize = function(width, height) { return true; };

/**
* Sets the position of the drawing on the page.
* @memberof ApiDrawing
* @param {EMU} posX - The distance from the left side of the page to the left side of the drawing measured in English measure units.
* @param {EMU} posY - The distance from the top side of the page to the upper side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiDrawing.prototype.SetPosition = function(posX, posY) { return true; };

/**
* Sets the x position of the drawing on the page.
* @memberof ApiDrawing
* @param {EMU} posX - The distance from the left side of the page to the left side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiDrawing.prototype.SetPosX = function(posX) { return true; };

/**
* Gets the x position of the drawing on the page.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiDrawing.prototype.GetPosX = function() { return new EMU(); };

/**
* Sets the y position of the drawing on the page.
* @memberof ApiDrawing
* @param {EMU} posY - The distance from the top side of the page to the upper side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiDrawing.prototype.SetPosY = function(posY) { return true; };

/**
* Gets the y position of the drawing on the page.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiDrawing.prototype.GetPosY = function() { return new EMU(); };

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
* Selects the current graphic object.
* @memberof ApiDrawing
* @returns {boolean}
*/
ApiDrawing.prototype.Select = function() { return true; };

/**
* Sets the rotation angle to the current drawing object.
* @memberof ApiDrawing
* @param {number} rotAngle - New drawing rotation angle.
* @returns {boolean}
*/
ApiDrawing.prototype.SetRotation = function(rotAngle) { return true; };

/**
* Returns the rotation angle of the current drawing object.
* @memberof ApiDrawing
* @returns {number}
*/
ApiDrawing.prototype.GetRotation = function() { return 0; };

/**
* Returns an internal ID of the current drawing.
* @memberof ApiDrawing
* @returns {string}
* @since 9.4.0
*/
ApiDrawing.prototype.GetInternalId = function() { return ""; };

/**
* Returns the type of the ApiShape class.
* @memberof ApiShape
* @returns {"shape"}
*/
ApiShape.prototype.GetClassType = function() { return ""; };

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
* @returns {boolean}
*/
ApiShape.prototype.SetVerticalTextAlign = function(verticalAlign) { return true; };

/**
* Returns the geometry object from the current shape.
* @memberof ApiShape
* @returns {ApiGeometry}
*/
ApiShape.prototype.GetGeometry = function() { return new ApiGeometry(); };

/**
* Sets a custom geometry for the current shape.
* @memberof ApiShape
* @param {ApiGeometry} oGeometry - The geometry to set.
* @returns {boolean}
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
* Creates a copy of the specified shape.
* @memberof ApiShape
* @returns {ApiShape} - return null if drawing doesn't exist.
* @since 9.4.0
*/
ApiShape.prototype.Copy = function() { return new ApiShape(); };

/**
* Returns the type of the ApiDrawing class.
* @memberof ApiDrawing
* @returns {?ApiPage}
*/
ApiShape.prototype.GetParentPage = function() { return new ApiPage(); };

/**
* Sets the position of the drawing on the page.
* @memberof ApiDrawing
* @param {EMU} posX - The distance from the left side of the page to the left side of the drawing measured in English measure units.
* @param {EMU} posY - The distance from the top side of the page to the upper side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiShape.prototype.SetPosition = function(posX, posY) { return true; };

/**
* Sets the x position of the drawing on the page.
* @memberof ApiDrawing
* @param {EMU} posX - The distance from the left side of the page to the left side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiShape.prototype.SetPosX = function(posX) { return true; };

/**
* Gets the x position of the drawing on the page.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiShape.prototype.GetPosX = function() { return new EMU(); };

/**
* Sets the y position of the drawing on the page.
* @memberof ApiDrawing
* @param {EMU} posY - The distance from the top side of the page to the upper side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiShape.prototype.SetPosY = function(posY) { return true; };

/**
* Gets the y position of the drawing on the page.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiShape.prototype.GetPosY = function() { return new EMU(); };

/**
* Returns an internal ID of the current drawing.
* @memberof ApiDrawing
* @returns {string}
* @since 9.4.0
*/
ApiShape.prototype.GetInternalId = function() { return ""; };

/**
* Sets the size of the object (image, shape, chart) bounding box.
* @memberof ApiDrawing
* @param {EMU} width - The object width measured in English measure units.
* @param {EMU} height - The object height measured in English measure units.
* @returns {boolean}
*/
ApiShape.prototype.SetSize = function(width, height) { return true; };

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
* Selects the current graphic object.
* @memberof ApiDrawing
* @returns {boolean}
*/
ApiShape.prototype.Select = function() { return true; };

/**
* Sets the rotation angle to the current drawing object.
* @memberof ApiDrawing
* @param {number} rotAngle - New drawing rotation angle.
* @returns {boolean}
*/
ApiShape.prototype.SetRotation = function(rotAngle) { return true; };

/**
* Returns the rotation angle of the current drawing object.
* @memberof ApiDrawing
* @returns {number}
*/
ApiShape.prototype.GetRotation = function() { return 0; };

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
* Returns the type of the ApiDrawing class.
* @memberof ApiDrawing
* @returns {?ApiPage}
*/
ApiImage.prototype.GetParentPage = function() { return new ApiPage(); };

/**
* Sets the position of the drawing on the page.
* @memberof ApiDrawing
* @param {EMU} posX - The distance from the left side of the page to the left side of the drawing measured in English measure units.
* @param {EMU} posY - The distance from the top side of the page to the upper side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiImage.prototype.SetPosition = function(posX, posY) { return true; };

/**
* Sets the x position of the drawing on the page.
* @memberof ApiDrawing
* @param {EMU} posX - The distance from the left side of the page to the left side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiImage.prototype.SetPosX = function(posX) { return true; };

/**
* Gets the x position of the drawing on the page.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiImage.prototype.GetPosX = function() { return new EMU(); };

/**
* Sets the y position of the drawing on the page.
* @memberof ApiDrawing
* @param {EMU} posY - The distance from the top side of the page to the upper side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiImage.prototype.SetPosY = function(posY) { return true; };

/**
* Gets the y position of the drawing on the page.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiImage.prototype.GetPosY = function() { return new EMU(); };

/**
* Returns an internal ID of the current drawing.
* @memberof ApiDrawing
* @returns {string}
* @since 9.4.0
*/
ApiImage.prototype.GetInternalId = function() { return ""; };

/**
* Sets the size of the object (image, shape, chart) bounding box.
* @memberof ApiDrawing
* @param {EMU} width - The object width measured in English measure units.
* @param {EMU} height - The object height measured in English measure units.
* @returns {boolean}
*/
ApiImage.prototype.SetSize = function(width, height) { return true; };

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
* Selects the current graphic object.
* @memberof ApiDrawing
* @returns {boolean}
*/
ApiImage.prototype.Select = function() { return true; };

/**
* Sets the rotation angle to the current drawing object.
* @memberof ApiDrawing
* @param {number} rotAngle - New drawing rotation angle.
* @returns {boolean}
*/
ApiImage.prototype.SetRotation = function(rotAngle) { return true; };

/**
* Returns the rotation angle of the current drawing object.
* @memberof ApiDrawing
* @returns {number}
*/
ApiImage.prototype.GetRotation = function() { return 0; };

/**
* Returns the type of the ApiTable object.
* @memberof ApiTable
* @returns {"table"}
*/
ApiTable.prototype.GetClassType = function() { return ""; };

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
* Returns a row by its index.
* @memberof ApiTable
* @param nIndex {number} - The row index (position) in the table.
* @returns {?ApiTableRow}
*/
ApiTable.prototype.GetRow = function(nIndex) { return new ApiTableRow(); };

/**
* Removes a table row with the specified cell.
* @memberof ApiTable
* @param {ApiTableCell} oCell - The table cell from the row which will be removed.
* @returns {boolean} - defines if the table is empty after removing or not.
*/
ApiTable.prototype.RemoveRow = function(oCell) { return true; };

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
* @returns {boolean}
*/
ApiTable.prototype.SetTableLook = function(isFirstColumn, isFirstRow, isLastColumn, isLastRow, isHorBand, isVerBand) { return true; };

/**
* Adds a new column to the end of the current table.
* @memberof ApiTable
* @param {ApiTableCell} [oCell] - If not specified, a new column will be added to the end of the table.
* @param {boolean} [isBefore=false] - Add a new column before or after the specified cell. If no cell is specified,
* then this parameter will be ignored.
* @returns {boolean}
*/
ApiTable.prototype.AddColumn = function(oCell, isBefore) { return true; };

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
* @returns {boolean}
*/
ApiTable.prototype.SetShd = function(sType, r, g, b) { return true; };

/**
* Creates a copy of the specified table.
* @memberof ApiTable
* @returns {ApiTable} - return null if drawing doesn't exist.
* @since 9.4.0
*/
ApiTable.prototype.Copy = function() { return new ApiTable(); };

/**
* Returns the type of the ApiDrawing class.
* @memberof ApiDrawing
* @returns {?ApiPage}
*/
ApiTable.prototype.GetParentPage = function() { return new ApiPage(); };

/**
* Sets the position of the drawing on the page.
* @memberof ApiDrawing
* @param {EMU} posX - The distance from the left side of the page to the left side of the drawing measured in English measure units.
* @param {EMU} posY - The distance from the top side of the page to the upper side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiTable.prototype.SetPosition = function(posX, posY) { return true; };

/**
* Sets the x position of the drawing on the page.
* @memberof ApiDrawing
* @param {EMU} posX - The distance from the left side of the page to the left side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiTable.prototype.SetPosX = function(posX) { return true; };

/**
* Gets the x position of the drawing on the page.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiTable.prototype.GetPosX = function() { return new EMU(); };

/**
* Sets the y position of the drawing on the page.
* @memberof ApiDrawing
* @param {EMU} posY - The distance from the top side of the page to the upper side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiTable.prototype.SetPosY = function(posY) { return true; };

/**
* Gets the y position of the drawing on the page.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiTable.prototype.GetPosY = function() { return new EMU(); };

/**
* Returns an internal ID of the current drawing.
* @memberof ApiDrawing
* @returns {string}
* @since 9.4.0
*/
ApiTable.prototype.GetInternalId = function() { return ""; };

/**
* Sets the size of the object (image, shape, chart) bounding box.
* @memberof ApiDrawing
* @param {EMU} width - The object width measured in English measure units.
* @param {EMU} height - The object height measured in English measure units.
* @returns {boolean}
*/
ApiTable.prototype.SetSize = function(width, height) { return true; };

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
* Selects the current graphic object.
* @memberof ApiDrawing
* @returns {boolean}
*/
ApiTable.prototype.Select = function() { return true; };

/**
* Sets the rotation angle to the current drawing object.
* @memberof ApiDrawing
* @param {number} rotAngle - New drawing rotation angle.
* @returns {boolean}
*/
ApiTable.prototype.SetRotation = function(rotAngle) { return true; };

/**
* Returns the rotation angle of the current drawing object.
* @memberof ApiDrawing
* @returns {number}
*/
ApiTable.prototype.GetRotation = function() { return 0; };

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
* @memberof ApiTableRow
* @param {EMU} [nValue] - The row height in English measure units.
* @returns {boolean}
*/
ApiTableRow.prototype.SetHeight = function(nValue) { return true; };

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
* @returns {boolean}
*/
ApiTableCell.prototype.SetShd = function(sType, r, g, b) { return true; };

/**
* Specifies an amount of space which shall be left between the bottom extent of the cell contents and the border
* of a specific individual table cell within a table.
* @memberof ApiTableCell
* @param {?twips} nValue - If this value is <code>null</code>, then default table cell bottom margin shall be used,
* otherwise override the table cell bottom margin with specified value for the current cell.
* @returns {boolean}
*/
ApiTableCell.prototype.SetCellMarginBottom = function(nValue) { return true; };

/**
* Specifies an amount of space which shall be left between the left extent of the current cell contents and the
* left edge border of a specific individual table cell within a table.
* @memberof ApiTableCell
* @param {?twips} nValue - If this value is <code>null</code>, then default table cell left margin shall be used,
* otherwise override the table cell left margin with specified value for the current cell.
* @returns {boolean}
*/
ApiTableCell.prototype.SetCellMarginLeft = function(nValue) { return true; };

/**
* Specifies an amount of space which shall be left between the right extent of the current cell contents and the
* right edge border of a specific individual table cell within a table.
* @memberof ApiTableCell
* @param {?twips} nValue - If this value is <code>null</code>, then default table cell right margin shall be used,
* otherwise override the table cell right margin with specified value for the current cell.
* @returns {boolean}
*/
ApiTableCell.prototype.SetCellMarginRight = function(nValue) { return true; };

/**
* Specifies an amount of space which shall be left between the top extent of the current cell contents and the
* top edge border of a specific individual table cell within a table.
* @memberof ApiTableCell
* @param {?twips} nValue - If this value is <code>null</code>, then default table cell top margin shall be used,
* otherwise override the table cell top margin with specified value for the current cell.
* @returns {boolean}
*/
ApiTableCell.prototype.SetCellMarginTop = function(nValue) { return true; };

/**
* Sets the border which shall be displayed at the bottom of the current table cell.
* @memberof ApiTableCell
* @param {mm} fSize - The width of the current border.
* @param {ApiFill} oApiFill - The color or pattern used to fill the current border.
* @returns {boolean}
*/
ApiTableCell.prototype.SetCellBorderBottom = function(fSize, oApiFill) { return true; };

/**
* Sets the border which shall be displayed at the left of the current table cell.
* @memberof ApiTableCell
* @param {mm} fSize - The width of the current border.
* @param {ApiFill} oApiFill - The color or pattern used to fill the current border.
* @returns {boolean}
*/
ApiTableCell.prototype.SetCellBorderLeft = function(fSize, oApiFill) { return true; };

/**
* Sets the border which shall be displayed at the right of the current table cell.
* @memberof ApiTableCell
* @param {mm} fSize - The width of the current border.
* @param {ApiFill} oApiFill - The color or pattern used to fill the current border.
* @returns {boolean}
*/
ApiTableCell.prototype.SetCellBorderRight = function(fSize, oApiFill) { return true; };

/**
* Sets the border which shall be displayed at the top of the current table cell.
* @memberof ApiTableCell
* @param {mm} fSize - The width of the current border.
* @param {ApiFill} oApiFill - The color or pattern used to fill the current border.
* @returns {boolean}
*/
ApiTableCell.prototype.SetCellBorderTop = function(fSize, oApiFill) { return true; };

/**
* Specifies the vertical alignment for text within the current table cell.
* @memberof ApiTableCell
* @param {VerticalTextAlign} sType - The type of the vertical alignment.
* @returns {boolean}
*/
ApiTableCell.prototype.SetVerticalAlign = function(sType) { return true; };

/**
* Specifies the direction of the text flow for the current table cell.
* @memberof ApiTableCell
* @param {TextFlowDirection} sType - The type of the text flow direction. 
* @returns {boolean}
*/
ApiTableCell.prototype.SetTextDirection = function(sType) { return true; };

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
* Returns a type of the ApiGroup class.
* @memberof ApiGroup
* @returns {"group"}
*/
ApiGroup.prototype.GetClassType = function() { return ""; };

/**
* Creates a copy of the specified group of drawings.
* @memberof ApiGroup
* @returns {ApiGroup} - return null if drawing doesn't exist.
* @since 9.4.0
*/
ApiGroup.prototype.Copy = function() { return new ApiGroup(); };

/**
* Returns the type of the ApiDrawing class.
* @memberof ApiDrawing
* @returns {?ApiPage}
*/
ApiGroup.prototype.GetParentPage = function() { return new ApiPage(); };

/**
* Sets the position of the drawing on the page.
* @memberof ApiDrawing
* @param {EMU} posX - The distance from the left side of the page to the left side of the drawing measured in English measure units.
* @param {EMU} posY - The distance from the top side of the page to the upper side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiGroup.prototype.SetPosition = function(posX, posY) { return true; };

/**
* Sets the x position of the drawing on the page.
* @memberof ApiDrawing
* @param {EMU} posX - The distance from the left side of the page to the left side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiGroup.prototype.SetPosX = function(posX) { return true; };

/**
* Gets the x position of the drawing on the page.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiGroup.prototype.GetPosX = function() { return new EMU(); };

/**
* Sets the y position of the drawing on the page.
* @memberof ApiDrawing
* @param {EMU} posY - The distance from the top side of the page to the upper side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiGroup.prototype.SetPosY = function(posY) { return true; };

/**
* Gets the y position of the drawing on the page.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiGroup.prototype.GetPosY = function() { return new EMU(); };

/**
* Returns an internal ID of the current drawing.
* @memberof ApiDrawing
* @returns {string}
* @since 9.4.0
*/
ApiGroup.prototype.GetInternalId = function() { return ""; };

/**
* Sets the size of the object (image, shape, chart) bounding box.
* @memberof ApiDrawing
* @param {EMU} width - The object width measured in English measure units.
* @param {EMU} height - The object height measured in English measure units.
* @returns {boolean}
*/
ApiGroup.prototype.SetSize = function(width, height) { return true; };

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
* Selects the current graphic object.
* @memberof ApiDrawing
* @returns {boolean}
*/
ApiGroup.prototype.Select = function() { return true; };

/**
* Sets the rotation angle to the current drawing object.
* @memberof ApiDrawing
* @param {number} rotAngle - New drawing rotation angle.
* @returns {boolean}
*/
ApiGroup.prototype.SetRotation = function(rotAngle) { return true; };

/**
* Returns the rotation angle of the current drawing object.
* @memberof ApiDrawing
* @returns {number}
*/
ApiGroup.prototype.GetRotation = function() { return 0; };

/**
* Returns a type of the ApiSmartArt class.
* @memberof ApiSmartArt
* @returns {"smartArt"}
*/
ApiSmartArt.prototype.GetClassType = function() { return ""; };

/**
* Returns the type of the ApiDrawing class.
* @memberof ApiDrawing
* @returns {?ApiPage}
*/
ApiSmartArt.prototype.GetParentPage = function() { return new ApiPage(); };

/**
* Sets the position of the drawing on the page.
* @memberof ApiDrawing
* @param {EMU} posX - The distance from the left side of the page to the left side of the drawing measured in English measure units.
* @param {EMU} posY - The distance from the top side of the page to the upper side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiSmartArt.prototype.SetPosition = function(posX, posY) { return true; };

/**
* Sets the x position of the drawing on the page.
* @memberof ApiDrawing
* @param {EMU} posX - The distance from the left side of the page to the left side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiSmartArt.prototype.SetPosX = function(posX) { return true; };

/**
* Gets the x position of the drawing on the page.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiSmartArt.prototype.GetPosX = function() { return new EMU(); };

/**
* Sets the y position of the drawing on the page.
* @memberof ApiDrawing
* @param {EMU} posY - The distance from the top side of the page to the upper side of the drawing measured in English measure units.
* @returns {boolean}
*/
ApiSmartArt.prototype.SetPosY = function(posY) { return true; };

/**
* Gets the y position of the drawing on the page.
* @memberof ApiDrawing
* @returns {EMU}
*/
ApiSmartArt.prototype.GetPosY = function() { return new EMU(); };

/**
* Returns an internal ID of the current drawing.
* @memberof ApiDrawing
* @returns {string}
* @since 9.4.0
*/
ApiSmartArt.prototype.GetInternalId = function() { return ""; };

/**
* Sets the size of the object (image, shape, chart) bounding box.
* @memberof ApiDrawing
* @param {EMU} width - The object width measured in English measure units.
* @param {EMU} height - The object height measured in English measure units.
* @returns {boolean}
*/
ApiSmartArt.prototype.SetSize = function(width, height) { return true; };

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
* Selects the current graphic object.
* @memberof ApiDrawing
* @returns {boolean}
*/
ApiSmartArt.prototype.Select = function() { return true; };

/**
* Sets the rotation angle to the current drawing object.
* @memberof ApiDrawing
* @param {number} rotAngle - New drawing rotation angle.
* @returns {boolean}
*/
ApiSmartArt.prototype.SetRotation = function(rotAngle) { return true; };

/**
* Returns the rotation angle of the current drawing object.
* @memberof ApiDrawing
* @returns {number}
*/
ApiSmartArt.prototype.GetRotation = function() { return 0; };

