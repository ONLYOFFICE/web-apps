/**
 * Base class
 * @global
 * @class
 * @name ApiInterface
 */
var ApiInterface = function() {};
var Api = new ApiInterface();


/**
 * This element specifies the information which shall be used to establish a mapping to an XML element stored within a Custom XML.
 * @typedef {Object} XmlMapping
 * @property {string} prefixMapping The set of prefix mappings which shall be used to interpret the XPath expression specified in xpath.
 * @property {string} xpath The XPath expression.
 * @property {string} storeItemID The custom XML data identifier.
 * @example
 * {
 *   "prefixMapping": "xmlns:ns0='http://example.com/example'",
 *   "xpath": "//ns0:book",
 *   "storeItemID": "testXmlPart"
 * }
 */

/**
 * Class representing a bookmark in the document.
 * @constructor
 */
function ApiBookmark(startMark, endMark){}

/**
 * Class representing a container for paragraphs and tables.
 * @param Document
 * @constructor
 */
function ApiDocumentContent(Document){}

/**
 * Class representing a continuous region in a document. 
 * Each Range object is determined by the position of the start and end characters.
 * @param oElement - The document element that may be Document, Table, Paragraph, Run or Hyperlink.
 * @param {Number} Start - The start element of Range in the current Element.
 * @param {Number} End - The end element of Range in the current Element.
 * @constructor
 */
function ApiRange(oElement, Start, End){}
ApiRange.prototype.constructor = ApiRange;

/**
 * Class representing the paragraph properties.
 * @constructor
 */
function ApiParaPr(Parent, ParaPr){}

/**
 * Class representing a paragraph bullet.
 * @constructor
 */
function ApiBullet(Bullet){}

/**
 * Class representing a paragraph.
 * @constructor
 * @extends {ApiParaPr}
 */
function ApiParagraph(Paragraph){}
ApiParagraph.prototype = Object.create(ApiParaPr.prototype);
ApiParagraph.prototype.constructor = ApiParagraph;

/**
 * Class representing the table properties.
 * @constructor
 */
function ApiTablePr(Parent, TablePr){}

/**
 * Class representing the text properties.
 * @constructor
 */
function ApiTextPr(Parent, TextPr){}

/**
 * Class representing a small text block called 'run'.
 * @constructor
 * @extends {ApiTextPr}
 */
function ApiRun(Run){}
ApiRun.prototype = Object.create(ApiTextPr.prototype);
ApiRun.prototype.constructor = ApiRun;

/**
 * Class representing a comment.
 * @constructor
 */
function ApiComment(oComment){}

/**
 * Class representing a comment reply.
 * @typeofeditors ["CDE", "CPE"]
 * @constructor
 */
function ApiCommentReply(oParentComm, oCommentReply){}

/**
 * Class representing a Paragraph hyperlink.
 * @constructor
 */
function ApiHyperlink(ParaHyperlink){}
ApiHyperlink.prototype.constructor = ApiHyperlink;

/**
 * Returns a type of the ApiHyperlink class.
 * @memberof ApiHyperlink
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"hyperlink"}
 * @see office-js-api/Examples/{Editor}/ApiHyperlink/Methods/GetClassType.js
 */
ApiHyperlink.prototype.GetClassType = function(){ return ""; };

/**
 * Sets the hyperlink address.
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {string} sLink - The hyperlink address.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiHyperlink/Methods/SetLink.js
 */
ApiHyperlink.prototype.SetLink = function(sLink){ return true; };

/**
 * Sets the hyperlink display text.
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {string} sDisplay - The text to display the hyperlink.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiHyperlink/Methods/SetDisplayedText.js
 */
ApiHyperlink.prototype.SetDisplayedText = function(sDisplay){ return true; };

/**
 * Sets the screen tip text of the hyperlink.
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {string} sScreenTipText - The screen tip text of the hyperlink.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiHyperlink/Methods/SetScreenTipText.js
 */
ApiHyperlink.prototype.SetScreenTipText = function(sScreenTipText){ return true; };

/**
 * Returns the hyperlink address.
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {string} 
 * @see office-js-api/Examples/{Editor}/ApiHyperlink/Methods/GetLinkedText.js
 */
ApiHyperlink.prototype.GetLinkedText = function(){ return ""; };

/**
 * Returns the hyperlink display text.
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {string} 
 * @see office-js-api/Examples/{Editor}/ApiHyperlink/Methods/GetDisplayedText.js
 */
ApiHyperlink.prototype.GetDisplayedText = function(){ return ""; };

/**
 * Returns the screen tip text of the hyperlink.
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {string} 
 * @see office-js-api/Examples/{Editor}/ApiHyperlink/Methods/GetScreenTipText.js
 */
ApiHyperlink.prototype.GetScreenTipText = function(){ return ""; };

/**
 * Returns the hyperlink element using the position specified.
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {number} nPos - The position where the element which content we want to get must be located.
 * @returns {ParagraphContent}
 * @see office-js-api/Examples/{Editor}/ApiHyperlink/Methods/GetElement.js
 */
ApiHyperlink.prototype.GetElement = function(nPos){ return new ParagraphContent(); };

/**
 * Returns a number of elements in the current hyperlink.
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {number}
 * @see office-js-api/Examples/{Editor}/ApiHyperlink/Methods/GetElementsCount.js
 */
ApiHyperlink.prototype.GetElementsCount = function(){ return 0; };

/**
 * Sets the default hyperlink style.
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiHyperlink/Methods/SetDefaultStyle.js
 */
ApiHyperlink.prototype.SetDefaultStyle = function(){ return true; };

/**
 * Class representing a style.
 * @constructor
 */
function ApiStyle(Style){}

/**
 * Class representing a document section.
 * @constructor
 */
function ApiSection(Section){}

/**
 * Class representing the table row properties.
 * @constructor
 */
function ApiTableRowPr(Parent, RowPr){}

/**
 * Class representing the table cell properties.
 * @constructor
 */
function ApiTableCellPr(Parent, CellPr){}

/**
 * Class representing the numbering properties.
 * @constructor
 */
function ApiNumbering(Num){}

/**
 * Class representing a reference to a specified level of the numbering.
 * @constructor
 */
function ApiNumberingLevel(Num, Lvl){}

/**
 * Class representing a set of formatting properties which shall be conditionally applied to the parts of a table
 * which match the requirement specified on the <code>Type</code>.
 * @constructor
 */
function ApiTableStylePr(Type, Parent, TableStylePr){}

/**
 * Class representing an unsupported element.
 * @constructor
 */
function ApiUnsupported(){}

/**
 * Class representing a chart.
 * @constructor
 *
 */
function ApiChart(Chart){}
ApiChart.prototype = Object.create(ApiDrawing.prototype);
ApiChart.prototype.constructor = ApiChart;

/**
 * Class representing a chart series.
 * @constructor
 *
 */
function ApiChartSeries(oChartSpace, nIdx){}

/**
 * Class representing a base class for color types.
 * @constructor
 */
function ApiUniColor(Unicolor){}

/**
 * Class representing an RGB Color.
 * @constructor
 */
function ApiRGBColor(r, g, b){}
ApiRGBColor.prototype = Object.create(ApiUniColor.prototype);
ApiRGBColor.prototype.constructor = ApiRGBColor;

/**
 * Class representing a Scheme Color.
 * @constructor
 */
function ApiSchemeColor(sColorId){}
ApiSchemeColor.prototype = Object.create(ApiUniColor.prototype);
ApiSchemeColor.prototype.constructor = ApiSchemeColor;

/**
 * Class representing a Preset Color.
 * @constructor
 */
function ApiPresetColor(sPresetColor){}
ApiPresetColor.prototype = Object.create(ApiUniColor.prototype);
ApiPresetColor.prototype.constructor = ApiPresetColor;

/**
 * Class representing a base class for fill.
 * @constructor
 */
function ApiFill(UniFill){}

/**
 * Class representing a stroke.
 * @constructor
 */
function ApiStroke(oLn){}

/**
 * Class representing gradient stop.
 * @constructor
 */
function ApiGradientStop(oApiUniColor, pos){}

/**
 * Class representing a container for the paragraph elements.
 * @constructor
 */
function ApiInlineLvlSdt(Sdt){}

/**
 * Class representing a list of values of the combo box / drop-down list content control.
 * @constructor
 */
function ApiContentControlList(Parent){}

/**
 * Class representing an entry of the combo box / drop-down list content control.
 * @constructor
 */
function ApiContentControlListEntry(Sdt, Parent, Text, Value){}

/**
 * Class representing a container for the document content.
 * @constructor
 */
function ApiBlockLvlSdt(Sdt){}

/**
 * Class representing the settings which are used to create a watermark.
 * @constructor
 */
function ApiWatermarkSettings(oSettings){}

/**
 * Class representing document properties (similar to BuiltInDocumentProperties in VBA).
 * @constructor
 */
function ApiCore(oCore) {}

/**
 * Class representing custom properties of the document.
 * @constructor
 */
function ApiCustomProperties(oCustomProperties) {}

/**
 * Twentieths of a point (equivalent to 1/1440th of an inch).
 * @typedef {number} twips
 * @see office-js-api/Examples/Enumerations/twips.js
 */

/**
 * Any valid element which can be added to the document structure.
 * @typedef {(ApiParagraph | ApiTable | ApiBlockLvlSdt)} DocumentElement
 * @see office-js-api/Examples/Enumerations/DocumentElement.js
 */

/**
 * The style type used for the document element.
 * @typedef {("paragraph" | "table" | "run" | "numbering")} StyleType
 * @see office-js-api/Examples/Enumerations/StyleType.js
 */

/**
 * 240ths of a line.
 * @typedef {number} line240
 * @see office-js-api/Examples/Enumerations/line240.js
 */

/**
 * Half-points (2 half-points = 1 point).
 * @typedef {number} hps
 * @see office-js-api/Examples/Enumerations/hps.js
 */

/**
 * A numeric value from 0 to 255.
 * @typedef {number} byte
 * @see office-js-api/Examples/Enumerations/byte.js
 */

/**
 * 60000th of a degree (5400000 = 90 degrees).
 * @typedef {number} PositiveFixedAngle
 * @see office-js-api/Examples/Enumerations/PositiveFixedAngle.js
 */

/**
 * A border type which will be added to the document element.
 * <b>"none"</b> - no border will be added to the created element or the selected element side.
 * <b>"single"</b> - a single border will be added to the created element or the selected element side.
 * @typedef {("none" | "single")} BorderType
 * @see office-js-api/Examples/Enumerations/BorderType.js
 */

/**
 * A shade type which can be added to the document element.
 * @typedef {("nil" | "clear")} ShdType
 * @see office-js-api/Examples/Enumerations/ShdType.js
 */

/**
 * Custom tab types.
 * @typedef {("clear" | "left" | "right" | "center")} TabJc
 * @see office-js-api/Examples/Enumerations/TabJc.js
 */

/**
 * Eighths of a point (24 eighths of a point = 3 points).
 * @typedef {number} pt_8
 * @see office-js-api/Examples/Enumerations/pt_8.js
 */

/**
 * A point.
 * @typedef {number} pt
 * @see office-js-api/Examples/Enumerations/pt.js
 */

/**
 * Header and footer types which can be applied to the document sections.
 * <b>"default"</b> - a header or footer which can be applied to any default page.
 * <b>"title"</b> - a header or footer which is applied to the title page.
 * <b>"even"</b> - a header or footer which can be applied to even pages to distinguish them from the odd ones (which will be considered default).
 * @typedef {("default" | "title" | "even")} HdrFtrType
 * @see office-js-api/Examples/Enumerations/HdrFtrType.js
 */

/**
 * The possible values for the units of the width property are defined by a specific table or table cell width property.
 * <b>"auto"</b> - sets the table or table cell width to auto width.
 * <b>"twips"</b> - sets the table or table cell width to be measured in twentieths of a point.
 * <b>"nul"</b> - sets the table or table cell width to be of a zero value.
 * <b>"percent"</b> - sets the table or table cell width to be measured in percent to the parent container.
 * @typedef {("auto" | "twips" | "nul" | "percent")} TableWidth
 * @see office-js-api/Examples/Enumerations/TableWidth.js
 */

/**
 * This simple type specifies possible values for the table sections to which the current conditional formatting properties will be applied when this selected table style is used.
 * <b>"topLeftCell"</b> - specifies that the table formatting is applied to the top left cell.
 * <b>"topRightCell"</b> - specifies that the table formatting is applied to the top right cell.
 * <b>"bottomLeftCell"</b> - specifies that the table formatting is applied to the bottom left cell.
 * <b>"bottomRightCell"</b> - specifies that the table formatting is applied to the bottom right cell.
 * <b>"firstRow"</b> - specifies that the table formatting is applied to the first row.
 * <b>"lastRow"</b> - specifies that the table formatting is applied to the last row.
 * <b>"firstColumn"</b> - specifies that the table formatting is applied to the first column. Any subsequent row which is in *table header* ({@link ApiTableRowPr#SetTableHeader}) will also use this conditional format.
 * <b>"lastColumn"</b> - specifies that the table formatting is applied to the last column.
 * <b>"bandedColumn"</b> - specifies that the table formatting is applied to odd numbered groupings of rows.
 * <b>"bandedColumnEven"</b> - specifies that the table formatting is applied to even numbered groupings of rows.
 * <b>"bandedRow"</b> - specifies that the table formatting is applied to odd numbered groupings of columns.
 * <b>"bandedRowEven"</b> - specifies that the table formatting is applied to even numbered groupings of columns.
 * <b>"wholeTable"</b> - specifies that the conditional formatting is applied to the whole table.
 * @typedef {("topLeftCell" | "topRightCell" | "bottomLeftCell" | "bottomRightCell" | "firstRow" | "lastRow" |
 *     "firstColumn" | "lastColumn" | "bandedColumn" | "bandedColumnEven" | "bandedRow" | "bandedRowEven" |
 *     "wholeTable")} TableStyleOverrideType
 * @see office-js-api/Examples/Enumerations/TableStyleOverrideType.js
 */

/**
 * The types of elements that can be added to the paragraph structure.
 * @typedef {(ApiUnsupported | ApiRun | ApiInlineLvlSdt | ApiHyperlink | ApiFormBase)} ParagraphContent
 * @see office-js-api/Examples/Enumerations/ParagraphContent.js
 */

/**
 * The possible values for the base which the relative horizontal positioning of an object will be calculated from.
 * @typedef {("character" | "column" | "leftMargin" | "rightMargin" | "margin" | "page")} RelFromH
 * @see office-js-api/Examples/Enumerations/RelFromH.js
 */

/**
 * The possible values for the base which the relative vertical positioning of an object will be calculated from.
 * @typedef {("bottomMargin" | "topMargin" | "margin" | "page" | "line" | "paragraph")} RelFromV
 * @see office-js-api/Examples/Enumerations/RelFromV.js
 */

/**
 * English measure unit. 1 mm = 36000 EMUs, 1 inch = 914400 EMUs.
 * @typedef {number} EMU
 * @see office-js-api/Examples/Enumerations/EMU.js
 */

/**
 * This type specifies the preset shape geometry that will be used for a shape.
 * @typedef {("accentBorderCallout1" | "accentBorderCallout2" | "accentBorderCallout3" | "accentCallout1" |
 *     "accentCallout2" | "accentCallout3" | "actionButtonBackPrevious" | "actionButtonBeginning" |
 *     "actionButtonBlank" | "actionButtonDocument" | "actionButtonEnd" | "actionButtonForwardNext" |
 *     "actionButtonHelp" | "actionButtonHome" | "actionButtonInformation" | "actionButtonMovie" |
 *     "actionButtonReturn" | "actionButtonSound" | "arc" | "bentArrow" | "bentConnector2" | "bentConnector3" |
 *     "bentConnector4" | "bentConnector5" | "bentUpArrow" | "bevel" | "blockArc" | "borderCallout1" |
 *     "borderCallout2" | "borderCallout3" | "bracePair" | "bracketPair" | "callout1" | "callout2" | "callout3" |
 *     "can" | "chartPlus" | "chartStar" | "chartX" | "chevron" | "chord" | "circularArrow" | "cloud" |
 *     "cloudCallout" | "corner" | "cornerTabs" | "cube" | "curvedConnector2" | "curvedConnector3" |
 *     "curvedConnector4" | "curvedConnector5" | "curvedDownArrow" | "curvedLeftArrow" | "curvedRightArrow" |
 *     "curvedUpArrow" | "decagon" | "diagStripe" | "diamond" | "dodecagon" | "donut" | "doubleWave" | "downArrow" | "downArrowCallout" | "ellipse" | "ellipseRibbon" | "ellipseRibbon2" | "flowChartAlternateProcess" | "flowChartCollate" | "flowChartConnector" | "flowChartDecision" | "flowChartDelay" | "flowChartDisplay" | "flowChartDocument" | "flowChartExtract" | "flowChartInputOutput" | "flowChartInternalStorage" | "flowChartMagneticDisk" | "flowChartMagneticDrum" | "flowChartMagneticTape" | "flowChartManualInput" | "flowChartManualOperation" | "flowChartMerge" | "flowChartMultidocument" | "flowChartOfflineStorage" | "flowChartOffpageConnector" | "flowChartOnlineStorage" | "flowChartOr" | "flowChartPredefinedProcess" | "flowChartPreparation" | "flowChartProcess" | "flowChartPunchedCard" | "flowChartPunchedTape" | "flowChartSort" | "flowChartSummingJunction" | "flowChartTerminator" | "foldedCorner" | "frame" | "funnel" | "gear6" | "gear9" | "halfFrame" | "heart" | "heptagon" | "hexagon" | "homePlate" | "horizontalScroll" | "irregularSeal1" | "irregularSeal2" | "leftArrow" | "leftArrowCallout" | "leftBrace" | "leftBracket" | "leftCircularArrow" | "leftRightArrow" | "leftRightArrowCallout" | "leftRightCircularArrow" | "leftRightRibbon" | "leftRightUpArrow" | "leftUpArrow" | "lightningBolt" | "line" | "lineInv" | "mathDivide" | "mathEqual" | "mathMinus" | "mathMultiply" | "mathNotEqual" | "mathPlus" | "moon" | "nonIsoscelesTrapezoid" | "noSmoking" | "notchedRightArrow" | "octagon" | "parallelogram" | "pentagon" | "pie" | "pieWedge" | "plaque" | "plaqueTabs" | "plus" | "quadArrow" | "quadArrowCallout" | "rect" | "ribbon" | "ribbon2" | "rightArrow" | "rightArrowCallout" | "rightBrace" | "rightBracket" | "round1Rect" | "round2DiagRect" | "round2SameRect" | "roundRect" | "rtTriangle" | "smileyFace" | "snip1Rect" | "snip2DiagRect" | "snip2SameRect" | "snipRoundRect" | "squareTabs" | "star10" | "star12" | "star16" | "star24" | "star32" | "star4" | "star5" | "star6" | "star7" | "star8" | "straightConnector1" | "stripedRightArrow" | "sun" | "swooshArrow" | "teardrop" | "trapezoid" | "triangle" | "upArrowCallout" | "upDownArrow" | "upDownArrow" | "upDownArrowCallout" | "uturnArrow" | "verticalScroll" | "wave" | "wedgeEllipseCallout" | "wedgeRectCallout" | "wedgeRoundRectCallout")} ShapeType
 * @see office-js-api/Examples/Enumerations/ShapeType.js
 */

/**
 * This type specifies the available chart types which can be used to create a new chart.
 * @typedef {("bar" | "barStacked" | "barStackedPercent" | "bar3D" | "barStacked3D" | "barStackedPercent3D" |
 *     "barStackedPercent3DPerspective" | "horizontalBar" | "horizontalBarStacked" | "horizontalBarStackedPercent"
 *     | "horizontalBar3D" | "horizontalBarStacked3D" | "horizontalBarStackedPercent3D" | "lineNormal" |
 *     "lineStacked" | "lineStackedPercent" | "line3D" | "pie" | "pie3D" | "doughnut" | "scatter" | "stock" |
 *     "area" | "areaStacked" | "areaStackedPercent" | "comboBarLine" | "comboBarLineSecondary" | "comboCustom" | "unknown")} ChartType
 * @see office-js-api/Examples/Enumerations/ChartType.js
 */

/**
 * This type specifies the type of drawing lock.
 * @typedef {("noGrp" | "noUngrp" | "noSelect" | "noRot" | "noChangeAspect" | "noMove" | "noResize" | "noEditPoints" | "noAdjustHandles"
 * | "noChangeArrowheads" | "noChangeShapeType" | "noDrilldown" | "noTextEdit" | "noCrop" | "txBox")} DrawingLockType
 * @see office-js-api/Examples/Enumerations/DrawingLockType.js
 */

/**
 * The available text vertical alignment (used to align text in a shape with a placement for text inside it).
 * @typedef {("top" | "center" | "bottom")} VerticalTextAlign
 * @see office-js-api/Examples/Enumerations/VerticalTextAlign.js
 */

/**
 * The available color scheme identifiers.
 * @typedef {("accent1" | "accent2" | "accent3" | "accent4" | "accent5" | "accent6" | "bg1" | "bg2" | "dk1" | "dk2"
 *     | "lt1" | "lt2" | "tx1" | "tx2")} SchemeColorId
 * @see office-js-api/Examples/Enumerations/SchemeColorId.js
 */

/**
 * The available preset color names.
 * @typedef {("aliceBlue" | "antiqueWhite" | "aqua" | "aquamarine" | "azure" | "beige" | "bisque" | "black" |
 *     "blanchedAlmond" | "blue" | "blueViolet" | "brown" | "burlyWood" | "cadetBlue" | "chartreuse" | "chocolate"
 *     | "coral" | "cornflowerBlue" | "cornsilk" | "crimson" | "cyan" | "darkBlue" | "darkCyan" | "darkGoldenrod" |
 *     "darkGray" | "darkGreen" | "darkGrey" | "darkKhaki" | "darkMagenta" | "darkOliveGreen" | "darkOrange" |
 *     "darkOrchid" | "darkRed" | "darkSalmon" | "darkSeaGreen" | "darkSlateBlue" | "darkSlateGray" |
 *     "darkSlateGrey" | "darkTurquoise" | "darkViolet" | "deepPink" | "deepSkyBlue" | "dimGray" | "dimGrey" |
 *     "dkBlue" | "dkCyan" | "dkGoldenrod" | "dkGray" | "dkGreen" | "dkGrey" | "dkKhaki" | "dkMagenta" |
 *     "dkOliveGreen" | "dkOrange" | "dkOrchid" | "dkRed" | "dkSalmon" | "dkSeaGreen" | "dkSlateBlue" |
 *     "dkSlateGray" | "dkSlateGrey" | "dkTurquoise" | "dkViolet" | "dodgerBlue" | "firebrick" | "floralWhite" |
 *     "forestGreen" | "fuchsia" | "gainsboro" | "ghostWhite" | "gold" | "goldenrod" | "gray" | "green" |
 *     "greenYellow" | "grey" | "honeydew" | "hotPink" | "indianRed" | "indigo" | "ivory" | "khaki" | "lavender" | "lavenderBlush" | "lawnGreen" | "lemonChiffon" | "lightBlue" | "lightCoral" | "lightCyan" | "lightGoldenrodYellow" | "lightGray" | "lightGreen" | "lightGrey" | "lightPink" | "lightSalmon" | "lightSeaGreen" | "lightSkyBlue" | "lightSlateGray" | "lightSlateGrey" | "lightSteelBlue" | "lightYellow" | "lime" | "limeGreen" | "linen" | "ltBlue" | "ltCoral" | "ltCyan" | "ltGoldenrodYellow" | "ltGray" | "ltGreen" | "ltGrey" | "ltPink" | "ltSalmon" | "ltSeaGreen" | "ltSkyBlue" | "ltSlateGray" | "ltSlateGrey" | "ltSteelBlue" | "ltYellow" | "magenta" | "maroon" | "medAquamarine" | "medBlue" | "mediumAquamarine" | "mediumBlue" | "mediumOrchid" | "mediumPurple" | "mediumSeaGreen" | "mediumSlateBlue" | "mediumSpringGreen" | "mediumTurquoise" | "mediumVioletRed" | "medOrchid" | "medPurple" | "medSeaGreen" | "medSlateBlue" | "medSpringGreen" | "medTurquoise" | "medVioletRed" | "midnightBlue" | "mintCream" | "mistyRose" | "moccasin" | "navajoWhite" | "navy" | "oldLace" | "olive" | "oliveDrab" | "orange" | "orangeRed" | "orchid" | "paleGoldenrod" | "paleGreen" | "paleTurquoise" | "paleVioletRed" | "papayaWhip" | "peachPuff" | "peru" | "pink" | "plum" | "powderBlue" | "purple" | "red" | "rosyBrown" | "royalBlue" | "saddleBrown" | "salmon" | "sandyBrown" | "seaGreen" | "seaShell" | "sienna" | "silver" | "skyBlue" | "slateBlue" | "slateGray" | "slateGrey" | "snow" | "springGreen" | "steelBlue" | "tan" | "teal" | "thistle" | "tomato" | "turquoise" | "violet" | "wheat" | "white" | "whiteSmoke" | "yellow" | "yellowGreen")} PresetColor
 * @see office-js-api/Examples/Enumerations/PresetColor.js
 */

/**
 * Possible values for the position of chart tick labels (either horizontal or vertical).
 * <b>"none"</b> - not display the selected tick labels.
 * <b>"nextTo"</b> - sets the position of the selected tick labels next to the main label.
 * <b>"low"</b> - sets the position of the selected tick labels in the part of the chart with lower values.
 * <b>"high"</b> - sets the position of the selected tick labels in the part of the chart with higher values.
 * @typedef {("none" | "nextTo" | "low" | "high")} TickLabelPosition
 * @see office-js-api/Examples/Enumerations/TickLabelPosition.js
 */

/**
 * The type of a fill which uses an image as a background.
 * <b>"tile"</b> - if the image is smaller than the shape which is filled, the image will be tiled all over the created shape surface.
 * <b>"stretch"</b> - if the image is smaller than the shape which is filled, the image will be stretched to fit the created shape surface.
 * @typedef {"tile" | "stretch"} BlipFillType
 * @see office-js-api/Examples/Enumerations/BlipFillType.js
 */

/**
 * The available preset patterns which can be used for the fill.
 * @typedef {"cross" | "dashDnDiag" | "dashHorz" | "dashUpDiag" | "dashVert" | "diagBrick" | "diagCross" | "divot"
 *     | "dkDnDiag" | "dkHorz" | "dkUpDiag" | "dkVert" | "dnDiag" | "dotDmnd" | "dotGrid" | "horz" | "horzBrick" |
 *     "lgCheck" | "lgConfetti" | "lgGrid" | "ltDnDiag" | "ltHorz" | "ltUpDiag" | "ltVert" | "narHorz" | "narVert"
 *     | "openDmnd" | "pct10" | "pct20" | "pct25" | "pct30" | "pct40" | "pct5" | "pct50" | "pct60" | "pct70" |
 *     "pct75" | "pct80" | "pct90" | "plaid" | "shingle" | "smCheck" | "smConfetti" | "smGrid" | "solidDmnd" |
 *     "sphere" | "trellis" | "upDiag" | "vert" | "wave" | "wdDnDiag" | "wdUpDiag" | "weave" | "zigZag"}
 *     PatternType
 * @see office-js-api/Examples/Enumerations/PatternType.js
 */

/**
 *
 * The lock type of the content control.
 * @typedef {"unlocked" | "contentLocked" | "sdtContentLocked" | "sdtLocked"} SdtLock
 * @see office-js-api/Examples/Enumerations/SdtLock.js
 */

/**
 * Text transform type.
 * @typedef {("textArchDown" | "textArchDownPour" | "textArchUp" | "textArchUpPour" | "textButton" | "textButtonPour" | "textCanDown"
 * | "textCanUp" | "textCascadeDown" | "textCascadeUp" | "textChevron" | "textChevronInverted" | "textCircle" | "textCirclePour"
 * | "textCurveDown" | "textCurveUp" | "textDeflate" | "textDeflateBottom" | "textDeflateInflate" | "textDeflateInflateDeflate" | "textDeflateTop"
 * | "textDoubleWave1" | "textFadeDown" | "textFadeLeft" | "textFadeRight" | "textFadeUp" | "textInflate" | "textInflateBottom" | "textInflateTop"
 * | "textPlain" | "textRingInside" | "textRingOutside" | "textSlantDown" | "textSlantUp" | "textStop" | "textTriangle" | "textTriangleInverted"
 * | "textWave1" | "textWave2" | "textWave4" | "textNoShape")} TextTransform
 * @see office-js-api/Examples/Enumerations/TextTransform.js
 */

/**
 * Form type.
 * The available form types.
 * @typedef {"textForm" | "comboBoxForm" | "dropDownForm" | "checkBoxForm" | "radioButtonForm" | "pictureForm" | "complexForm"} FormType
 * @see office-js-api/Examples/Enumerations/FormType.js
 */

/**
 * 1 millimetre equals 1/10th of a centimetre.
 * @typedef {number} mm
 * @see office-js-api/Examples/Enumerations/mm.js
 */

/**
 * The condition to scale an image in the picture form.
 * @typedef {"always" | "never" | "tooBig" | "tooSmall"} ScaleFlag
 * @see office-js-api/Examples/Enumerations/ScaleFlag.js
 */

/**
 * Value from 0 to 100.
 * @typedef {number} percentage
 * @see office-js-api/Examples/Enumerations/percentage.js
 */

/**
 * Available highlight colors.
 * @typedef {"black" | "blue" | "cyan" | "green" | "magenta" | "red" | "yellow" | "white" | "darkBlue" |
 * "darkCyan" | "darkGreen" | "darkMagenta" | "darkRed" | "darkYellow" | "darkGray" | "lightGray" | "none"} highlightColor
 * @see office-js-api/Examples/Enumerations/highlightColor.js
 */

/**
 * Available values of the "numbered" reference type:
 * <b>"pageNum"</b> - the numbered item page number;
 * <b>"paraNum"</b> - the numbered item paragraph number;
 * <b>"noCtxParaNum"</b> - the abbreviated paragraph number (the specific item only, e.g. instead of "4.1.1" you refer to "1" only);
 * <b>"fullCtxParaNum"</b> - the full paragraph number, e.g. "4.1.1";
 * <b>"text"</b> - the paragraph text value, e.g. if you have "4.1.1. Terms and Conditions", you refer to "Terms and Conditions" only;
 * <b>"aboveBelow"</b> - the words "above" or "below" depending on the item position.
 * @typedef {"pageNum" | "paraNum" | "noCtxParaNum" | "fullCtxParaNum" | "text" | "aboveBelow"} numberedRefTo
 * @see office-js-api/Examples/Enumerations/numberedRefTo.js
 */

/**
 * Available values of the "heading" reference type:
 * <b>"text"</b> - the entire heading text;
 * <b>"pageNum"</b> - the heading page number;
 * <b>"headingNum"</b> - the heading sequence number;
 * <b>"noCtxHeadingNum"</b> - the abbreviated heading number. Make sure the cursor pointer is in the section you are referencing to, e.g. you are in section 4 and you wish to refer to heading 4.B, so instead of "4.B" you receive "B" only;
 * <b>"fullCtxHeadingNum"</b> - the full heading number even if the cursor pointer is in the same section;
 * <b>"aboveBelow"</b> - the words "above" or "below" depending on the item position.
 * @typedef {"text" | "pageNum" | "headingNum" | "noCtxHeadingNum" | "fullCtxHeadingNum" | "aboveBelow"} headingRefTo
 * @see office-js-api/Examples/Enumerations/headingRefTo.js
 */

/**
 * Available values of the "bookmark" reference type:
 * <b>"text"</b> - the entire bookmark text;
 * <b>"pageNum"</b> - the bookmark page number;
 * <b>"paraNum"</b> - the bookmark paragraph number;
 * <b>"noCtxParaNum"</b> - the abbreviated paragraph number (the specific item only, e.g. instead of "4.1.1" you refer to "1" only);
 * <b>"fullCtxParaNum</b> - the full paragraph number, e.g. "4.1.1";
 * <b>"aboveBelow"</b> - the words "above" or "below" depending on the item position.
 * @typedef {"text" | "pageNum" | "paraNum" | "noCtxParaNum" | "fullCtxParaNum" | "aboveBelow"} bookmarkRefTo
 * @see office-js-api/Examples/Enumerations/bookmarkRefTo.js
 */

/**
 * Available values of the "footnote" reference type:
 * <b>"footnoteNum"</b> - the footnote number;
 * <b>"pageNum"</b> - the page number of the footnote;
 * <b>"aboveBelow"</b> - the words "above" or "below" depending on the position of the item;
 * <b>"formFootnoteNum"</b> - the form number formatted as a footnote. The numbering of the actual footnotes is not affected.
 * @typedef {"footnoteNum" | "pageNum" | "aboveBelow" | "formFootnoteNum"} footnoteRefTo
 * @see office-js-api/Examples/Enumerations/footnoteRefTo.js
 */

/**
 * Available values of the "endnote" reference type:
 * <b>"endnoteNum"</b> - the endnote number;
 * <b>"pageNum"</b> - the endnote page number;
 * <b>"aboveBelow"</b> - the words "above" or "below" depending on the item position;
 * <b>"formEndnoteNum"</b> - the form number formatted as an endnote. The numbering of the actual endnotes is not affected.
 * @typedef {"endnoteNum" | "pageNum" | "aboveBelow" | "formEndnoteNum"} endnoteRefTo
 * @see office-js-api/Examples/Enumerations/endnoteRefTo.js
 */

/**
 * Available values of the "equation"/"figure"/"table" reference type:
 * <b>"entireCaption"</b>- the entire caption text;
 * <b>"labelNumber"</b> - the label and object number only, e.g. "Table 1.1";
 * <b>"captionText"</b> - the caption text only;
 * <b>"pageNum"</b> - the page number containing the referenced object;
 * <b>"aboveBelow"</b> - the words "above" or "below" depending on the item position.
 * @typedef {"entireCaption" | "labelNumber" | "captionText" | "pageNum" | "aboveBelow"} captionRefTo
 * @see office-js-api/Examples/Enumerations/captionRefTo.js
 */

/**
 * Axis position in the chart.
 * @typedef {("top" | "bottom" | "right" | "left")} AxisPos
 * @see office-js-api/Examples/Enumerations/AxisPos.js
 */

/**
 * Standard numeric format.
 * @typedef {("General" | "0" | "0.00" | "#,##0" | "#,##0.00" | "0%" | "0.00%" |
 * "0.00E+00" | "# ?/?" | "# ??/??" | "m/d/yyyy" | "d-mmm-yy" | "d-mmm" | "mmm-yy" | "h:mm AM/PM" |
 * "h:mm:ss AM/PM" | "h:mm" | "h:mm:ss" | "m/d/yyyy h:mm" | "#,##0_\);(#,##0)" | "#,##0_\);\[Red\]\(#,##0)" | 
 * "#,##0.00_\);\(#,##0.00\)" | "#,##0.00_\);\[Red\]\(#,##0.00\)" | "mm:ss" | "[h]:mm:ss" | "mm:ss.0" | "##0.0E+0" | "@")} NumFormat
 * @see office-js-api/Examples/Enumerations/NumFormat.js
 */

/**
 * Types of all supported forms.
 * @typedef {ApiTextForm | ApiComboBoxForm | ApiCheckBoxForm | ApiPictureForm | ApiDateForm | ApiComplexForm} ApiForm
 * @see office-js-api/Examples/Enumerations/ApiForm.js
 */

/**
 * Possible values for the caption numbering format.
 * <b>"ALPHABETIC"</b> - upper letter.
 * <b>"alphabetic"</b> - lower letter.
 * <b>"Roman"</b> - upper Roman.
 * <b>"roman"</b> - lower Roman.
 * <b>"Arabic"</b> - arabic.
 * @typedef {("ALPHABETIC" | "alphabetic" | "Roman" | "roman" | "Arabic")} CaptionNumberingFormat
 * @see office-js-api/Examples/Enumerations/CaptionNumberingFormat.js
 */

/**
 * Possible values for the caption separator.
 * <b>"hyphen"</b> - the "-" punctuation mark.
 * <b>"period"</b> - the "." punctuation mark.
 * <b>"colon"</b> - the ":" punctuation mark.
 * <b>"longDash"</b> - the "вЂ”" punctuation mark.
 * <b>"dash"</b> - the "-" punctuation mark.
 * @typedef {("hyphen" | "period" | "colon" | "longDash" | "dash")} CaptionSep
 * @see office-js-api/Examples/Enumerations/CaptionSep.js
 */

/**
 * Possible values for the caption label.
 * @typedef {("Table" | "Equation" | "Figure")} CaptionLabel
 * @see office-js-api/Examples/Enumerations/CaptionLabel.js
 */

/**
 * Table of contents properties.
 * @typedef {Object} TocPr
 * @property {boolean} [ShowPageNums=true] - Specifies whether to show page numbers in the table of contents.
 * @property {boolean} [RightAlgn=true] - Specifies whether to right-align page numbers in the table of contents.
 * @property {TocLeader} [LeaderType="dot"] - The leader type in the table of contents.
 * @property {boolean} [FormatAsLinks=true] - Specifies whether to format the table of contents as links.
 * @property {TocBuildFromPr} [BuildFrom={OutlineLvls=9}] - Specifies whether to generate the table of contents from the outline levels or the specified styles.
 * @property {TocStyle} [TocStyle="standard"] - The table of contents style type.
 * @see office-js-api/Examples/Enumerations/TocPr.js
 */

/**
 * Table of figures properties.
 * @typedef {Object} TofPr
 * @property {boolean} [ShowPageNums=true] - Specifies whether to show page numbers in the table of figures.
 * @property {boolean} [RightAlgn=true] - Specifies whether to right-align page numbers in the table of figures.
 * @property {TocLeader} [LeaderType="dot"] - The leader type in the table of figures.
 * @property {boolean} [FormatAsLinks=true] - Specifies whether to format the table of figures as links.
 * @property {CaptionLabel | string} [BuildFrom="Figure"] - Specifies whether to generate the table of figures based on the specified caption label or the paragraph style name used (for example, "Heading 1").
 * @property {boolean} [LabelNumber=true] - Specifies whether to include the label and number in the table of figures.
 * @property {TofStyle} [TofStyle="distinctive"] - The table of figures style type.
 * @see office-js-api/Examples/Enumerations/TofPr.js
 */

/**
 * Table of contents properties which specify whether to generate the table of contents from the outline levels or the specified styles.
 * @typedef {Object} TocBuildFromPr
 * @property {number} [OutlineLvls=9] - Maximum number of levels in the table of contents.
 * @property {TocStyleLvl[]} StylesLvls - Style levels (for example, [{Name: "Heading 1", Lvl: 2}, {Name: "Heading 2", Lvl: 3}]).
 * <note>If StylesLvls.length > 0, then the OutlineLvls property will be ignored.</note>
 * @see office-js-api/Examples/Enumerations/TocBuildFromPr.js
 */

/**
 * Table of contents style levels.
 * @typedef {Object} TocStyleLvl
 * @property {string} Name - Style name (for example, "Heading 1").
 * @property {number} Lvl - Level which will be applied to the specified style in the table of contents.
 * @see office-js-api/Examples/Enumerations/TocStyleLvl.js
 */

/**
 * Possible values for the table of contents leader:
 * <b>"dot"</b> - "......."
 * <b>"dash"</b> - "-------"
 * <b>"underline"</b> - "_______"
 * @typedef {("dot" | "dash" | "underline" | "none")} TocLeader
 * @see office-js-api/Examples/Enumerations/TocLeader.js
 */

/**
 * Possible values for the table of contents style.
 * @typedef {("simple" | "online" | "standard" | "modern" | "classic")} TocStyle
 * @see office-js-api/Examples/Enumerations/TocStyle.js
 */

/**
 * Possible values for the table of figures style.
 * @typedef {("simple" | "online" | "classic" | "distinctive" | "centered" | "formal")} TofStyle
 * @see office-js-api/Examples/Enumerations/TofStyle.js
 */

/**
 * Any valid drawing element.
 * @typedef {(ApiShape | ApiImage | ApiGroup | ApiOleObject | ApiChart )} Drawing
 * @see office-js-api/Examples/Enumerations/Drawing.js
 */

/**
 * Available drawing element for grouping.
 * @typedef {(ApiShape | ApiGroup | ApiImage | ApiChart)} DrawingForGroup
 * @see office-js-api/Examples/Enumerations/DrawingForGroup.js
 */

/**
 * The 1000th of a percent (100000 = 100%).
 * @typedef {number} PositivePercentage
 * @see office-js-api/Examples/Enumerations/PositivePercentage.js
 */

/**
 * The type of tick mark appearance.
 * @typedef {("cross" | "in" | "none" | "out")} TickMark
 * @see office-js-api/Examples/Enumerations/TickMark.js
 */

/**
 * The watermark type.
 * @typedef {("none" | "text" | "image")} WatermarkType
 * @see office-js-api/Examples/Enumerations/WatermarkType.js
 */

/**
 * The watermark direction.
 * @typedef {("horizontal" | "clockwise45" | "counterclockwise45" | "clockwise90" | "counterclockwise90")} WatermarkDirection
 * @see office-js-api/Examples/Enumerations/WatermarkDirection.js
 */

/**
 * The Base64 image string.
 * @typedef {string} Base64Img
 * @example "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA..."
 */

/**
 * Creates a new smaller text block to be inserted to the current paragraph or table.
 * @memberof ApiInterface
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {ApiRun}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateRun.js
 */
ApiInterface.prototype.CreateRun = function(){ return new ApiRun(); };

/**
 * Creates an RGB color setting the appropriate values for the red, green and blue color components.
 * @memberof ApiInterface
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @returns {ApiRGBColor}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateRGBColor.js
 */
ApiInterface.prototype.CreateRGBColor = function(r, g, b){ return new ApiRGBColor(); };

/**
 * Creates a complex color scheme selecting from one of the available schemes.
 * @memberof ApiInterface
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {SchemeColorId} schemeColorId - The color scheme identifier.
 * @returns {ApiSchemeColor}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateSchemeColor.js
 */
ApiInterface.prototype.CreateSchemeColor = function(schemeColorId){ return new ApiSchemeColor(); };

/**
 * Creates a color selecting it from one of the available color presets.
 * @memberof ApiInterface
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {PresetColor} presetColor - A preset selected from the list of the available color preset names.
 * @returns {ApiPresetColor};
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreatePresetColor.js
 */
ApiInterface.prototype.CreatePresetColor = function(presetColor){ return new ApiPresetColor(); };

/**
 * Creates a solid fill to apply to the object using a selected solid color as the object background.
 * @memberof ApiInterface
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {ApiUniColor} uniColor - The color used for the element fill.
 * @returns {ApiFill}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateSolidFill.js
 */
ApiInterface.prototype.CreateSolidFill = function(uniColor){ return new ApiFill(); };

/**
 * Creates a linear gradient fill to apply to the object using the selected linear gradient as the object background.
 * @memberof ApiInterface
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {number[]} gradientStops - The array of gradient color stops measured in 1000th of percent.
 * @param {PositiveFixedAngle} angle - The angle measured in 60000th of a degree that will define the gradient direction.
 * @returns {ApiFill}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateLinearGradientFill.js
 */
ApiInterface.prototype.CreateLinearGradientFill = function(gradientStops, angle){ return new ApiFill(); };

/**
 * Creates a radial gradient fill to apply to the object using the selected radial gradient as the object background.
 * @memberof ApiInterface
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {number[]} gradientStops - The array of gradient color stops measured in 1000th of percent.
 * @returns {ApiFill}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateRadialGradientFill.js
 */
ApiInterface.prototype.CreateRadialGradientFill = function(gradientStops){ return new ApiFill(); };

/**
 * Creates a pattern fill to apply to the object using the selected pattern as the object background.
 * @memberof ApiInterface
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {PatternType} patternType - The pattern type used for the fill selected from one of the available pattern types.
 * @param {ApiUniColor} bgColor - The background color used for the pattern creation.
 * @param {ApiUniColor} fgColor - The foreground color used for the pattern creation.
 * @returns {ApiFill}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreatePatternFill.js
 */
ApiInterface.prototype.CreatePatternFill = function(patternType, bgColor, fgColor){ return new ApiFill(); };

/**
 * Creates a blip fill to apply to the object using the selected image as the object background.
 * @memberof ApiInterface
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {string} imageUrl - The path to the image used for the blip fill (currently only internet URL or Base64 encoded images are supported).
 * @param {BlipFillType} blipFillType - The type of the fill used for the blip fill (tile or stretch).
 * @returns {ApiFill}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateBlipFill.js
 */
ApiInterface.prototype.CreateBlipFill = function(imageUrl, blipFillType){ return new ApiFill(); };

/**
 * Creates no fill and removes the fill from the element.
 * @memberof ApiInterface
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {ApiFill}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateNoFill.js
 */
ApiInterface.prototype.CreateNoFill = function(){ return new ApiFill(); };

/**
 * Creates a stroke adding shadows to the element.
 * @memberof ApiInterface
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {EMU} width - The width of the shadow measured in English measure units.
 * @param {ApiFill} fill - The fill type used to create the shadow.
 * @returns {ApiStroke}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateStroke.js
 */
ApiInterface.prototype.CreateStroke = function(width, fill){ return new ApiStroke(); };

/**
 * Creates a gradient stop used for different types of gradients.
 * @memberof ApiInterface
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {ApiUniColor} uniColor - The color used for the gradient stop.
 * @param {PositivePercentage} pos - The position of the gradient stop measured in 1000th of percent.
 * @returns {ApiGradientStop}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateGradientStop.js
 */
ApiInterface.prototype.CreateGradientStop = function(uniColor, pos){ return new ApiGradientStop(); };

/**
 * Creates a bullet for a paragraph with the character or symbol specified with the sSymbol parameter.
 * @memberof ApiInterface
 * @typeofeditors ["CSE", "CPE"]
 * @param {string} sSymbol - The character or symbol which will be used to create the bullet for the paragraph.
 * @returns {ApiBullet}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateBullet.js
 */
ApiInterface.prototype.CreateBullet = function(sSymbol){ return new ApiBullet(); };

/**
 * Creates a bullet for a paragraph with the numbering character or symbol specified with the numType parameter.
 * @memberof ApiInterface
 * @typeofeditors ["CPE", "CSE"]
 * @param {BulletType} numType - The numbering type the paragraphs will be numbered with.
 * @param {number} startAt - The number the first numbered paragraph will start with.
 * @returns {ApiBullet}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateNumbering.js
 */
ApiInterface.prototype.CreateNumbering = function(numType, startAt){ return new ApiBullet(); };

/**
 * The checkbox content control properties
 * @typedef {Object} ContentControlCheckBoxPr
 * @property {boolean} [checked] Indicates whether the checkbox is checked by default.
 * @property {string} [checkedSymbol] A custom symbol to display when the checkbox is checked (e.g., "в�’").
 * @property {string} [uncheckedSymbol] A custom symbol to display when the checkbox is unchecked (e.g., "в�ђ").
 */

/**
 * The object representing the items in the combo box or drop-down list.
 * @typedef {Object} ContentControlListItem
 * @property {string} display - The text to be displayed in the combo box or drop-down list.
 * @property {string} value - The value associated with the item.
 */

/**
 * The date picker content control properties.
 * @typedef {Object} ContentControlDatePr
 * @property {string} format - The date format. Example: "mm.dd.yyyy".
 * @property {string} lang   - The date language. Possible value for this parameter is a language identifier as defined by
 * RFC 4646/BCP 47. Example: "en-CA".
 */

/**
 * Returns a type of the ApiUnsupported class.
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"unsupported"}
 * @see office-js-api/Examples/{Editor}/ApiUnsupported/Methods/GetClassType.js
 */
ApiUnsupported.prototype.GetClassType = function(){ return ""; };

/**
 * Returns a type of the ApiDocumentContent class. 
 * @memberof ApiDocumentContent
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"documentContent"}
 * @see office-js-api/Examples/{Editor}/ApiDocumentContent/Methods/GetClassType.js
 */
ApiDocumentContent.prototype.GetClassType = function(){ return ""; };

/**
 * Returns a number of elements in the current document.
 * @memberof ApiDocumentContent
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {number}
 * @see office-js-api/Examples/{Editor}/ApiDocumentContent/Methods/GetElementsCount.js
 */
ApiDocumentContent.prototype.GetElementsCount = function(){ return 0; };

/**
 * Returns an element by its position in the document.
 * @memberof ApiDocumentContent
 * @param {number} nPos - The element position that will be taken from the document.
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {DocumentElement}
 * @see office-js-api/Examples/{Editor}/ApiDocumentContent/Methods/GetElement.js
 */
ApiDocumentContent.prototype.GetElement = function(nPos){ return new DocumentElement(); };

/**
 * Adds a paragraph or a table or a blockLvl content control using its position in the document content.
 * @memberof ApiDocumentContent
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {number} nPos - The position where the current element will be added.
 * @param {DocumentElement} oElement - The document element which will be added at the current position.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDocumentContent/Methods/AddElement.js
 */
ApiDocumentContent.prototype.AddElement = function(nPos, oElement){ return true; };

/**
 * Pushes a paragraph or a table to actually add it to the document.
 * @memberof ApiDocumentContent
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {DocumentElement} oElement - The element type which will be pushed to the document.
 * @returns {boolean} - returns false if oElement is unsupported.
 * @see office-js-api/Examples/{Editor}/ApiDocumentContent/Methods/Push.js
 */
ApiDocumentContent.prototype.Push = function(oElement){ return true; };

/**
 * Removes all the elements from the current document or from the current document element.
 * <note>When all elements are removed, a new empty paragraph is automatically created. If you want to add
 * content to this paragraph, use the {@link ApiDocumentContent#GetElement} method.</note>
 * @memberof ApiDocumentContent
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDocumentContent/Methods/RemoveAllElements.js
 */
ApiDocumentContent.prototype.RemoveAllElements = function(){ return true; };

/**
 * Removes an element using the position specified.
 * @memberof ApiDocumentContent
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {number} nPos - The element number (position) in the document or inside other element.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDocumentContent/Methods/RemoveElement.js
 */
ApiDocumentContent.prototype.RemoveElement = function(nPos){ return true; };

/**
 * Represents an attribute of an XML node.
 * @typedef {Object} CustomXmlNodeAttribute
 * @property {string} name - The attribute name.
 * @property {string} value - The attribute value.
 */

/**
 * Represents a single comment record.
 * @typedef {Object} CommentReportRecord
 * @property {boolean} IsAnswer Specifies whether the comment is a response.
 * @property {string} CommentMessage The comment text.
 * @property {number} Date The comment local timestamp.
 * @property {number} DateUTC The  comment UTC timestamp.
 * @property {string} [QuoteText] The quoted text (if available).
 */

/**
 * Represents a user's comment history.
 * @typedef {Object} UserComments
 * @property {CommentReportRecord[]} comments A list of comments.
 */

/**
 * A dictionary of users and their comments.
 * @typedef {Object} CommentReport
 * @property {UserComments} [username] The comments grouped by username.
 * @example
 * {
 *   "John Smith": {
 *     comments: [
 *       { IsAnswer: false, CommentMessage: "Good text", Date: 1688588002698, DateUTC: 1688570002698, QuoteText: "Some text" },
 *       { IsAnswer: true, CommentMessage: "I don't think so", Date: 1688588012661, DateUTC: 1688570012661 }
 *     ]
 *   },
 *   "Mark Pottato": {
 *     comments: [
 *       { IsAnswer: false, CommentMessage: "Need to change this part", Date: 1688587967245, DateUTC: 1688569967245, QuoteText: "The quick brown fox jumps over the lazy dog" },
 *       { IsAnswer: false, CommentMessage: "We need to add a link", Date: 1688587967245, DateUTC: 1688569967245, QuoteText: "OnlyOffice" }
 *     ]
 *   }
 * }
 */

/**
 * Review record type.
 * @typedef {("TextAdd" | "TextRem" | "ParaAdd" | "ParaRem" | "TextPr" | "ParaPr" | "Unknown")} ReviewReportRecordType
 * @see office-js-api/Examples/Enumerations/ReviewReportRecordType.js
 */

/**
 * Represents a single review change record.
 * @typedef {Object} ReviewReportRecord
 * @property {ReviewReportRecordType} Type The review record type.
 * @property {string} [Value] The review change value (only for "TextAdd" and "TextRem" types).
 * @property {number} Date The timestamp of the change.
 * @property {ApiParagraph | ApiTable} ReviewedElement The element that was reviewed.
 */

/**
 * Represents a user's review history.
 * @typedef {Object} UserReviewChanges
 * @property {ReviewReportRecord[]} reviews A list of review records.
 */

/**
 * A dictionary of users and their review changes.
 * @typedef {Object} ReviewReport
 * @property {UserReviewChanges} [username] The review changes grouped by username.
 * @example
 * {
 *   "John Smith": {
 *     reviews: [
 *       { Type: "TextRem", Value: "Hello, Mark!", Date: 1679941734161, ReviewedElement: ApiParagraph },
 *       { Type: "TextAdd", Value: "Dear Mr. Pottato.", Date: 1679941736189, ReviewedElement: ApiParagraph }
 *     ]
 *   },
 *   "Mark Pottato": {
 *     reviews: [
 *       { Type: "ParaRem", Date: 1679941755942, ReviewedElement: ApiParagraph },
 *       { Type: "TextPr", Date: 1679941757832, ReviewedElement: ApiParagraph }
 *     ]
 *   }
 * }
 */

/**
 * The specific form type.
 * @typedef {("text" | "checkBox" | "picture" | "comboBox" | "dropDownList" | "dateTime" | "radio")} FormSpecificType
 * @see office-js-api/Examples/Enumerations/FormSpecificType.js
 */

/**
 * Form data.
 * @typedef {Object} FormData
 * @property {string} key - The form key. If the current form is a radio button, then this field contains the group key.
 * @property {string | boolean} value - The current field value.
 * @property {string} tag - The form tag.
 * @property {FormSpecificType} type - The form type.
 * @example
 * {
 *   "key" : "CompanyName",
 *   "tag" : "companyName",
 *   "value" : "ONLYOFFICE",
 *   "type" : "text"
 * }
 * @see office-js-api/Examples/Enumerations/FormData.js
 */

/**
 * Returns a type of the ApiParagraph class.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"paragraph"}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/GetClassType.js
 */
ApiParagraph.prototype.GetClassType = function(){ return ""; };

/**
 * Adds some text to the current paragraph.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {string} [sText=""] - The text that we want to insert into the current document element.
 * @returns {ApiRun}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/AddText.js
 */
ApiParagraph.prototype.AddText = function(sText){ return new ApiRun(); };

/**
 * Adds a line break to the current position and starts the next element from a new line.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {ApiRun}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/AddLineBreak.js
 */
ApiParagraph.prototype.AddLineBreak = function(){ return new ApiRun(); };

/**
 * Returns the paragraph properties.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {ApiParaPr}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/GetParaPr.js
 */
ApiParagraph.prototype.GetParaPr = function(){ return new ApiParaPr(); };

/**
 * Returns a number of elements in the current paragraph.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {number}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/GetElementsCount.js
 */
ApiParagraph.prototype.GetElementsCount = function(){ return 0; };

/**
 * Returns a paragraph element using the position specified.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {number} nPos - The position where the element which content we want to get must be located.
 * @returns {ParagraphContent}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/GetElement.js
 */
ApiParagraph.prototype.GetElement = function(nPos){ return new ParagraphContent(); };

/**
 * Removes an element using the position specified.
 * <note>If the element you remove is the last paragraph element (i.e. all the elements are removed from the paragraph),
 * a new empty run is automatically created. If you want to add
 * content to this run, use the {@link ApiParagraph#GetElement} method.</note>
 * @memberof ApiParagraph
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {number} nPos - The element position which we want to remove from the paragraph.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/RemoveElement.js
 */
ApiParagraph.prototype.RemoveElement = function(nPos){ return true; };

/**
 * Removes all the elements from the current paragraph.
 * <note>When all the elements are removed from the paragraph, a new empty run is automatically created. If you want to add
 * content to this run, use the {@link ApiParagraph#GetElement} method.</note>
 * @memberof ApiParagraph
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/RemoveAllElements.js
 */
ApiParagraph.prototype.RemoveAllElements = function(){ return true; };

/**
 * Deletes the current paragraph.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {boolean} - returns false if paragraph haven't parent.
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/Delete.js
 */
ApiParagraph.prototype.Delete = function(){ return true; };

/**
 * Returns the next paragraph.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {ApiParagraph | null} - returns null if paragraph is last.
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/GetNext.js
 */
ApiParagraph.prototype.GetNext = function(){ return new ApiParagraph(); };

/**
 * Returns the previous paragraph.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {ApiParagraph} - returns null if paragraph is first.
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/GetPrevious.js
 */
ApiParagraph.prototype.GetPrevious = function(){ return new ApiParagraph(); };

/**
 * Creates a paragraph copy. Ingnore comments, footnote references, complex fields.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {ApiParagraph}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/Copy.js
 */
ApiParagraph.prototype.Copy = function(){ return new ApiParagraph(); };

/**
 * Adds an element to the current paragraph.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {ParagraphContent} oElement - The document element which will be added at the current position. Returns false if the
 * oElement type is not supported by a paragraph.
 * @param {number} [nPos] - The position where the current element will be added. If this value is not
 * specified, then the element will be added at the end of the current paragraph.
 * @returns {boolean} Returns <code>false</code> if the type of <code>oElement</code> is not supported by paragraph
 * content.
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/AddElement.js
 */
ApiParagraph.prototype.AddElement = function(oElement, nPos){ return true; };

/**
 * Adds a tab stop to the current paragraph.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {ApiRun}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/AddTabStop.js
 */
ApiParagraph.prototype.AddTabStop = function(){ return new ApiRun(); };

/**
 * Specifies a highlighting color which is applied as a background to the contents of the current paragraph.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE", "CPE"]
 * @param {highlightColor} sColor - Available highlight color.
 * @returns {ApiParagraph} this
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/SetHighlight.js
 */
ApiParagraph.prototype.SetHighlight = function(sColor){ return new ApiParagraph(); };

/**
 * Returns a type of the ApiRun class.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"run"}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/GetClassType.js
 */
ApiRun.prototype.GetClassType = function(){ return ""; };

/**
 * Returns the text properties of the current run.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/GetTextPr.js
 */
ApiRun.prototype.GetTextPr = function(){ return new ApiTextPr(); };

/**
 * Clears the content from the current run.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/ClearContent.js
 */
ApiRun.prototype.ClearContent = function(){ return true; };

/**
 * Removes all the elements from the current run.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/RemoveAllElements.js
 */
ApiRun.prototype.RemoveAllElements = function(){ return true; };

/**
 * Deletes the current run.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/Delete.js
 */
ApiRun.prototype.Delete = function(){ return true; };

/**
 * Adds some text to the current run.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {string} sText - The text which will be added to the current run.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/AddText.js
 */
ApiRun.prototype.AddText = function(sText){ return true; };

/**
 * Adds a line break to the current run position and starts the next element from a new line.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/AddLineBreak.js
 */
ApiRun.prototype.AddLineBreak = function(){ return true; };

/**
 * Adds a tab stop to the current run.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/AddTabStop.js
 */
ApiRun.prototype.AddTabStop = function(){ return true; };

/**
 * Creates a copy of the current run.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {ApiRun}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/Copy.js
 */
ApiRun.prototype.Copy = function(){ return new ApiRun(); };

/**
 * Sets the text properties to the current run.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {ApiTextPr} oTextPr - The text properties that will be set to the current run.
 * @returns {ApiTextPr}  
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/SetTextPr.js
 */
ApiRun.prototype.SetTextPr = function(oTextPr){ return new ApiTextPr(); };

/**
 * Sets the bold property to the text character.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {boolean} isBold - Specifies that the contents of the current run are displayed bold.
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/SetBold.js
 */
ApiRun.prototype.SetBold = function(isBold){ return new ApiTextPr(); };

/**
 * Specifies that any lowercase characters in the current text run are formatted for display only as their capital letter character equivalents.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {boolean} isCaps - Specifies that the contents of the current run are displayed capitalized.
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/SetCaps.js
 */
ApiRun.prototype.SetCaps = function(isCaps){ return new ApiTextPr(); };

/**
 * Sets the text color for the current text run in the RGB format.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @param {boolean} [isAuto=false] - If this parameter is set to "true", then r,g,b parameters will be ignored.
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/SetColor.js
 */
ApiRun.prototype.SetColor = function(r, g, b, isAuto){ return new ApiTextPr(); };

/**
 * Specifies that the contents of the current run are displayed with two horizontal lines through each character displayed on the line.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {boolean} isDoubleStrikeout - Specifies that the contents of the current run are displayed double struck through.
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/SetDoubleStrikeout.js
 */
ApiRun.prototype.SetDoubleStrikeout = function(isDoubleStrikeout){ return new ApiTextPr(); };

/**
 * Sets the text color to the current text run.
 * @memberof ApiRun
 * @typeofeditors ["CSE", "CPE"]
 * @param {ApiFill} oApiFill - The color or pattern used to fill the text color.
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/SetFill.js
 */
ApiRun.prototype.SetFill = function(oApiFill){ return new ApiTextPr(); };

/**
 * Sets all 4 font slots with the specified font family.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {string} sFontFamily - The font family or families used for the current text run.
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/SetFontFamily.js
 */
ApiRun.prototype.SetFontFamily = function(sFontFamily){ return new ApiTextPr(); };

/**
 * Returns all font names from all elements inside the current run.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {string[]} - The font names used for the current run.
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/GetFontNames.js
 */
ApiRun.prototype.GetFontNames = function(){ return [""]; };

/**
 * Sets the font size to the characters of the current text run.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {hps} nSize - The text size value measured in half-points (1/144 of an inch).
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/SetFontSize.js
 */
ApiRun.prototype.SetFontSize = function(nSize){ return new ApiTextPr(); };

/**
 * Specifies a highlighting color which is applied as a background to the contents of the current run.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {highlightColor} sColor - Available highlight color.
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/SetHighlight.js
 */
ApiRun.prototype.SetHighlight = function(sColor){ return new ApiTextPr(); };

/**
 * Sets the italic property to the text character.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {boolean} isItalic - Specifies that the contents of the current run are displayed italicized.
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/SetItalic.js
 */
ApiRun.prototype.SetItalic = function(isItalic){ return new ApiTextPr(); };

/**
 * Specifies the languages which will be used to check spelling and grammar (if requested) when processing
 * the contents of this text run.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {string} sLangId - The possible value for this parameter is a language identifier as defined by
 * RFC 4646/BCP 47. Example: "en-CA".
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/SetLanguage.js
 */
ApiRun.prototype.SetLanguage = function(sLangId){ return new ApiTextPr(); };

/**
 * Specifies an amount by which text is raised or lowered for this run in relation to the default
 * baseline of the surrounding non-positioned text.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {hps} nPosition - Specifies a positive (raised text) or negative (lowered text)
 * measurement in half-points (1/144 of an inch).
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/SetPosition.js
 */
ApiRun.prototype.SetPosition = function(nPosition){ return new ApiTextPr(); };

/**
 * Specifies the shading applied to the contents of the current text run.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {ShdType} sType - The shading type applied to the contents of the current text run.
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/SetShd.js
 */
ApiRun.prototype.SetShd = function(sType, r, g, b){ return new ApiTextPr(); };

/**
 * Specifies that all the small letter characters in this text run are formatted for display only as their capital
 * letter character equivalents which are two points smaller than the actual font size specified for this text.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {boolean} isSmallCaps - Specifies if the contents of the current run are displayed capitalized two points smaller or not.
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/SetSmallCaps.js
 */
ApiRun.prototype.SetSmallCaps = function(isSmallCaps){ return new ApiTextPr(); };

/**
 * Sets the text spacing measured in twentieths of a point.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {twips} nSpacing - The value of the text spacing measured in twentieths of a point (1/1440 of an inch).
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/SetSpacing.js
 */
ApiRun.prototype.SetSpacing = function(nSpacing){ return new ApiTextPr(); };

/**
 * Specifies that the contents of the current run are displayed with a single horizontal line through the center of the line.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {boolean} isStrikeout - Specifies that the contents of the current run are displayed struck through.
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/SetStrikeout.js
 */
ApiRun.prototype.SetStrikeout = function(isStrikeout){ return new ApiTextPr(); };

/**
 * Specifies that the contents of the current run are displayed along with a line appearing directly below the character
 * (less than all the spacing above and below the characters on the line).
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {boolean} isUnderline - Specifies that the contents of the current run are displayed underlined.
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/SetUnderline.js
 */
ApiRun.prototype.SetUnderline = function(isUnderline){ return new ApiTextPr(); };

/**
 * Specifies the alignment which will be applied to the contents of the current run in relation to the default appearance of the text run:
 * <b>"baseline"</b> - the characters in the current text run will be aligned by the default text baseline.
 * <b>"subscript"</b> - the characters in the current text run will be aligned below the default text baseline.
 * <b>"superscript"</b> - the characters in the current text run will be aligned above the default text baseline.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {("baseline" | "subscript" | "superscript")} sType - The vertical alignment type applied to the text contents.
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/SetVertAlign.js
 */
ApiRun.prototype.SetVertAlign = function(sType){ return new ApiTextPr(); };

/**
 * The section break type which defines how the contents of the current section are placed relative to the previous section.
 * WordprocessingML supports five distinct types of section breaks:
 * <b>Next page</b> ("nextPage") - starts a new section on the next page (the default value).
 * <b>Odd</b> ("oddPage") - starts a new section on the next odd-numbered page.
 * <b>Even</b> ("evenPage") - starts a new section on the next even-numbered page.
 * <b>Continuous</b> ("continuous") - starts a new section in the next paragraph.
 * This means that continuous section breaks might not specify certain page-level section properties,
 * since they shall be inherited from the following section.
 * However, these breaks can specify other section properties, such as line numbering and footnote/endnote settings.
 * <b>Column</b> ("nextColumn") - starts a new section in the next column on the page.
 * @typedef {("nextPage" | "oddPage" | "evenPage" | "continuous" | "nextColumn")} SectionBreakType
* @see office-js-api/Examples/Enumerations/SectionBreakType.js
*/

/**
 * Returns a type of the ApiTextPr class.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"textPr"}
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/GetClassType.js
 */
ApiTextPr.prototype.GetClassType = function(){ return ""; };

/**
 * Sets the bold property to the text character.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {boolean} isBold - Specifies that the contents of the run are displayed bold.
 * @returns {ApiTextPr} - this text properties.
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/SetBold.js
 */
ApiTextPr.prototype.SetBold = function(isBold){ return new ApiTextPr(); };

/**
 * Gets the bold property from the current text properties.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {boolean}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/GetBold.js
 */
ApiTextPr.prototype.GetBold = function(){ return true; };

/**
 * Sets the italic property to the text character.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {boolean} isItalic - Specifies that the contents of the current run are displayed italicized.
 * @returns {ApiTextPr} - this text properties.
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/SetItalic.js
 */
ApiTextPr.prototype.SetItalic = function(isItalic){ return new ApiTextPr(); };

/**
 * Gets the italic property from the current text properties.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {boolean}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/GetItalic.js
 */
ApiTextPr.prototype.GetItalic = function(){ return true; };

/**
 * Specifies that the contents of the run are displayed with a single horizontal line through the center of the line.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {boolean} isStrikeout - Specifies that the contents of the current run are displayed struck through.
 * @returns {ApiTextPr} - this text properties.
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/SetStrikeout.js
 */
ApiTextPr.prototype.SetStrikeout = function(isStrikeout){ return new ApiTextPr(); };

/**
 * Gets the strikeout property from the current text properties.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {boolean}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/GetStrikeout.js
 */
ApiTextPr.prototype.GetStrikeout = function(){ return true; };

/**
 * Specifies that the contents of the run are displayed along with a line appearing directly below the character
 * (less than all the spacing above and below the characters on the line).
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {boolean} isUnderline - Specifies that the contents of the current run are displayed underlined.
 * @returns {ApiTextPr} - this text properties.
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/SetUnderline.js
 */
ApiTextPr.prototype.SetUnderline = function(isUnderline){ return new ApiTextPr(); };

/**
 * Gets the underline property from the current text properties.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {boolean}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/GetUnderline.js
 */
ApiTextPr.prototype.GetUnderline = function(){ return true; };

/**
 * Sets all 4 font slots with the specified font family.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {string} sFontFamily - The font family or families used for the current text run.
 * @returns {ApiTextPr} - this text properties.
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/SetFontFamily.js
 */
ApiTextPr.prototype.SetFontFamily = function(sFontFamily){ return new ApiTextPr(); };

/**
 * Returns the font family from the current text properties.
 * The method automatically calculates the font from the theme if the font was set via the theme.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * param {undefined | "ascii" | "eastAsia" | "hAnsi" | "cs"} [fontSlot="ascii"] - The font slot.
 * If this parameter is not specified, the "ascii" value is used.
 * @returns {string}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/GetFontFamily.js
 */
ApiTextPr.prototype.GetFontFamily = function(fontSlot){ return ""; };

/**
 * Sets the font size to the characters of the current text run.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {hps} nSize - The text size value measured in half-points (1/144 of an inch).
 * @returns {ApiTextPr} - this text properties.
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/SetFontSize.js
 */
ApiTextPr.prototype.SetFontSize = function(nSize){ return new ApiTextPr(); };

/**
 * Gets the font size from the current text properties.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {hps}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/GetFontSize.js
 */
ApiTextPr.prototype.GetFontSize = function(){ return new hps(); };

/**
 * Specifies the alignment which will be applied to the contents of the run in relation to the default appearance of the run text:
 * <b>"baseline"</b> - the characters in the current text run will be aligned by the default text baseline.
 * <b>"subscript"</b> - the characters in the current text run will be aligned below the default text baseline.
 * <b>"superscript"</b> - the characters in the current text run will be aligned above the default text baseline.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {("baseline" | "subscript" | "superscript")} sType - The vertical alignment type applied to the text contents.
 * @returns {ApiTextPr} - this text properties.
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/SetVertAlign.js
 */
ApiTextPr.prototype.SetVertAlign = function(sType){ return new ApiTextPr(); };

/**
 * Specifies a highlighting color which is added to the text properties and applied as a background to the contents of the current run/range/paragraph.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CPE"]
 * @param {highlightColor} sColor - Available highlight color.
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/SetHighlight.js
 */
ApiTextPr.prototype.SetHighlight = function(sColor){ return new ApiTextPr(); };

/**
 * Gets the highlight property from the current text properties.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CPE"]
 * @returns {string}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/GetHighlight.js
 */
ApiTextPr.prototype.GetHighlight = function(){ return ""; };

/**
 * Sets the text spacing measured in twentieths of a point.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {twips} nSpacing - The value of the text spacing measured in twentieths of a point (1/1440 of an inch).
 * @returns {ApiTextPr} - this text properties.
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/SetSpacing.js
 */
ApiTextPr.prototype.SetSpacing = function(nSpacing){ return new ApiTextPr(); };

/**
 * Gets the text spacing from the current text properties measured in twentieths of a point.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {twips}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/GetSpacing.js
 */
ApiTextPr.prototype.GetSpacing = function(){ return new twips(); };

/**
 * Specifies that the contents of the run are displayed with two horizontal lines through each character displayed on the line.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {boolean} isDoubleStrikeout - Specifies that the contents of the current run are displayed double struck through.
 * @returns {ApiTextPr} - this text properties.
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/SetDoubleStrikeout.js
 */
ApiTextPr.prototype.SetDoubleStrikeout = function(isDoubleStrikeout){ return new ApiTextPr(); };

/**
 * Gets the double strikeout property from the current text properties.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {boolean}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/GetDoubleStrikeout.js
 */
ApiTextPr.prototype.GetDoubleStrikeout = function(){ return true; };

/**
 * Specifies that any lowercase characters in the text run are formatted for display only as their capital letter character equivalents.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {boolean} isCaps - Specifies that the contents of the current run are displayed capitalized.
 * @returns {ApiTextPr} - this text properties.
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/SetCaps.js
 */
ApiTextPr.prototype.SetCaps = function(isCaps){ return new ApiTextPr(); };

/**
 * Specifies whether the text with the current text properties are capitalized.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {boolean}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/GetCaps.js
 */
ApiTextPr.prototype.GetCaps = function(){ return true; };

/**
 * Specifies that all the small letter characters in the text run are formatted for display only as their capital
 * letter character equivalents which are two points smaller than the actual font size specified for this text.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {boolean} isSmallCaps - Specifies if the contents of the current run are displayed capitalized two points smaller or not.
 * @returns {ApiTextPr} - this text properties.
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/SetSmallCaps.js
 */
ApiTextPr.prototype.SetSmallCaps = function(isSmallCaps){ return new ApiTextPr(); };

/**
 * Specifies whether the text with the current text properties are displayed capitalized two points smaller than the actual font size.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {boolean}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/GetSmallCaps.js
 */
ApiTextPr.prototype.GetSmallCaps = function(){ return true; };

/**
 * Sets the text color to the current text run.
 * @memberof ApiTextPr
 * @typeofeditors ["CSE", "CPE"]
 * @param {ApiFill} oApiFill - The color or pattern used to fill the text color.
 * @returns {ApiTextPr} - this text properties.
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/SetFill.js
 */
ApiTextPr.prototype.SetFill = function(oApiFill){ return new ApiTextPr(); };

/**
 * Gets the text color from the current text properties.
 * @memberof ApiTextPr
 * @typeofeditors ["CSE", "CPE"]
 * @returns {ApiFill}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/GetFill.js
 */
ApiTextPr.prototype.GetFill = function(){ return new ApiFill(); };

/**
 * Sets the text fill to the current text run.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @param {ApiFill} oApiFill - The color or pattern used to fill the text color.
 * @returns {ApiTextPr} - this text properties.
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/SetTextFill.js
 */
ApiTextPr.prototype.SetTextFill = function(oApiFill){ return new ApiTextPr(); };

/**
 * Gets the text fill from the current text properties.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {ApiFill}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/GetTextFill.js
 */
ApiTextPr.prototype.GetTextFill = function(){ return new ApiFill(); };

/**
 * Sets the text outline to the current text run.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @param {ApiStroke} oStroke - The stroke used to create the text outline.
 * @returns {ApiTextPr} - this text properties.
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/SetOutLine.js
 */
ApiTextPr.prototype.SetOutLine = function(oStroke){ return new ApiTextPr(); };

/**
 * Gets the text outline from the current text properties.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {ApiStroke}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/GetOutLine.js
 */
ApiTextPr.prototype.GetOutLine = function(){ return new ApiStroke(); };

/**
 * Returns a type of the ApiParaPr class.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"paraPr"}
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/GetClassType.js
 */
ApiParaPr.prototype.GetClassType = function(){ return ""; };

/**
 * Sets the paragraph left side indentation.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {twips} nValue - The paragraph left side indentation value measured in twentieths of a point (1/1440 of an inch).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/SetIndLeft.js
 */
ApiParaPr.prototype.SetIndLeft = function(nValue){ return true; };

/**
 * Returns the paragraph left side indentation.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {twips | undefined} - The paragraph left side indentation value measured in twentieths of a point (1/1440 of an inch).
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/GetIndLeft.js
 */
ApiParaPr.prototype.GetIndLeft = function(){ return new twips(); };

/**
 * Sets the paragraph right side indentation.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {twips} nValue - The paragraph right side indentation value measured in twentieths of a point (1/1440 of an inch).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/SetIndRight.js
 */
ApiParaPr.prototype.SetIndRight = function(nValue){ return true; };

/**
 * Returns the paragraph right side indentation.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {twips | undefined} - The paragraph right side indentation value measured in twentieths of a point (1/1440 of an inch).
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/GetIndRight.js
 */
ApiParaPr.prototype.GetIndRight = function(){ return new twips(); };

/**
 * Sets the paragraph first line indentation.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {twips} nValue - The paragraph first line indentation value measured in twentieths of a point (1/1440 of an inch).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/SetIndFirstLine.js
 */
ApiParaPr.prototype.SetIndFirstLine = function(nValue){ return true; };

/**
 * Returns the paragraph first line indentation.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {twips | undefined} - The paragraph first line indentation value measured in twentieths of a point (1/1440 of an inch).
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/GetIndFirstLine.js
 */
ApiParaPr.prototype.GetIndFirstLine = function(){ return new twips(); };

/**
 * Sets the paragraph contents justification.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {("left" | "right" | "both" | "center")} sJc - The justification type that
 * will be applied to the paragraph contents.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/SetJc.js
 */
ApiParaPr.prototype.SetJc = function(sJc){ return true; };

/**
 * Returns the paragraph contents justification.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {("left" | "right" | "both" | "center" | undefined)} 
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/GetJc.js
 */
ApiParaPr.prototype.GetJc = function(){ return ""; };

/**
 * Sets the paragraph line spacing. If the value of the sLineRule parameter is either 
 * "atLeast" or "exact", then the value of nLine will be interpreted as twentieths of a point. If 
 * the value of the sLineRule parameter is "auto", then the value of the 
 * nLine parameter will be interpreted as 240ths of a line.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {(twips | line240)} nLine - The line spacing value measured either in twentieths of a point (1/1440 of an inch) or in 240ths of a line.
 * @param {("auto" | "atLeast" | "exact")} sLineRule - The rule that determines the measuring units of the line spacing.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/SetSpacingLine.js
 */
ApiParaPr.prototype.SetSpacingLine = function(nLine, sLineRule){ return true; };

/**
 * Returns the paragraph line spacing value.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {twips | line240 | undefined} - to know is twips or line240 use ApiParaPr.prototype.GetSpacingLineRule().
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/GetSpacingLineValue.js
 */
ApiParaPr.prototype.GetSpacingLineValue = function(){ return new twips(); };

/**
 * Returns the paragraph line spacing rule.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"auto" | "atLeast" | "exact" | undefined} 
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/GetSpacingLineRule.js
 */
ApiParaPr.prototype.GetSpacingLineRule = function(){ return ""; };

/**
 * Sets the spacing before the current paragraph. If the value of the isBeforeAuto parameter is true, then 
 * any value of the nBefore is ignored. If isBeforeAuto parameter is not specified, then 
 * it will be interpreted as false.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {twips} nBefore - The value of the spacing before the current paragraph measured in twentieths of a point (1/1440 of an inch).
 * @param {boolean} [isBeforeAuto=false] - The true value disables the spacing before the current paragraph.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/SetSpacingBefore.js
 */
ApiParaPr.prototype.SetSpacingBefore = function(nBefore, isBeforeAuto){ return true; };

/**
 * Returns the spacing before value of the current paragraph.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {twips} - The value of the spacing before the current paragraph measured in twentieths of a point (1/1440 of an inch).
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/GetSpacingBefore.js
 */
ApiParaPr.prototype.GetSpacingBefore = function(){ return new twips(); };

/**
 * Sets the spacing after the current paragraph. If the value of the isAfterAuto parameter is true, then 
 * any value of the nAfter is ignored. If isAfterAuto parameter is not specified, then it 
 * will be interpreted as false.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {twips} nAfter - The value of the spacing after the current paragraph measured in twentieths of a point (1/1440 of an inch).
 * @param {boolean} [isAfterAuto=false] - The true value disables the spacing after the current paragraph.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/SetSpacingAfter.js
 */
ApiParaPr.prototype.SetSpacingAfter = function(nAfter, isAfterAuto){ return true; };

/**
 * Returns the spacing after value of the current paragraph. 
 * @memberof ApiParaPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {twips} - The value of the spacing after the current paragraph measured in twentieths of a point (1/1440 of an inch).
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/GetSpacingAfter.js
 */
ApiParaPr.prototype.GetSpacingAfter = function(){ return new twips(); };

/**
 * Specifies a sequence of custom tab stops which will be used for any tab characters in the current paragraph.
 * <b>Warning</b>: The lengths of aPos array and aVal array <b>MUST BE</b> equal to each other.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {twips[]} aPos - An array of the positions of custom tab stops with respect to the current page margins
 * measured in twentieths of a point (1/1440 of an inch).
 * @param {TabJc[]} aVal - An array of the styles of custom tab stops, which determines the behavior of the tab
 * stop and the alignment which will be applied to text entered at the current custom tab stop.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/SetTabs.js
 */
ApiParaPr.prototype.SetTabs = function(aPos, aVal){ return true; };

/**
 * Sets the bullet or numbering to the current paragraph.
 * @memberof ApiParaPr
 * @typeofeditors ["CSE", "CPE"]
 * @param {?ApiBullet} oBullet - The bullet object created with the {@link Api#CreateBullet} or {@link Api#CreateNumbering} method.
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/SetBullet.js
 */
ApiParaPr.prototype.SetBullet = function(oBullet){};

/**
 * Sets the outline level for the specified properties.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {Number} [nLvl=undefined] - The outline level. Possible values: 0-8. The 0 value means the basic outline level.
 * To set no outline level, use this method without a parameter.
 * @returns {boolean}
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/SetOutlineLvl.js
 */
ApiParaPr.prototype.SetOutlineLvl = function(nLvl){ return true; };

/**
 * Returns the outline level of the specified properties.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {Number}
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/GetOutlineLvl.js
 */
ApiParaPr.prototype.GetOutlineLvl = function(){ return 0; };

/**
 * Returns a type of the ApiChart class.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"chart"}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/GetClassType.js
 */
ApiChart.prototype.GetClassType = function(){ return ""; };

/**
 * Returns a type of the chart object.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {ChartType}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/GetChartType.js
 */
ApiChart.prototype.GetChartType = function(){ return new ChartType(); };

/**
 *  Specifies the chart title.
 *  @memberof ApiChart
 *  @typeofeditors ["CDE", "CSE", "CPE"]
 *  @param {string} sTitle - The title which will be displayed for the current chart.
 *  @param {pt} nFontSize - The text size value measured in points.
 *  @param {boolean} bIsBold - Specifies if the chart title is written in bold font or not.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetTitle.js
 */
ApiChart.prototype.SetTitle = function (sTitle, nFontSize, bIsBold){ return true; };

/**
 *  Specifies the chart horizontal axis title.
 *  @memberof ApiChart
 *  @typeofeditors ["CDE", "CSE", "CPE"]
 *  @param {string} sTitle - The title which will be displayed for the horizontal axis of the current chart.
 *  @param {pt} nFontSize - The text size value measured in points.
 *  @param {boolean} bIsBold - Specifies if the horizontal axis title is written in bold font or not.
 *@returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetHorAxisTitle.js
 */
ApiChart.prototype.SetHorAxisTitle = function (sTitle, nFontSize, bIsBold){ return true; };

/**
 *  Specifies the chart vertical axis title.
 *  @memberof ApiChart
 *  @typeofeditors ["CDE", "CSE", "CPE"]
 *  @param {string} sTitle - The title which will be displayed for the vertical axis of the current chart.
 *  @param {pt} nFontSize - The text size value measured in points.
 *  @param {boolean} bIsBold - Specifies if the vertical axis title is written in bold font or not.
 *@returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetVerAxisTitle.js
 */
ApiChart.prototype.SetVerAxisTitle = function (sTitle, nFontSize, bIsBold){ return true; };

/**
 * Specifies the vertical axis orientation.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {boolean} bIsMinMax - The <code>true</code> value will set the normal data direction for the vertical axis (from minimum to maximum).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetVerAxisOrientation.js
 */
ApiChart.prototype.SetVerAxisOrientation = function(bIsMinMax){ return true; };

/**
 * Specifies the horizontal axis orientation.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {boolean} bIsMinMax - The <code>true</code> value will set the normal data direction for the horizontal axis (from minimum to maximum).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetHorAxisOrientation.js
 */
ApiChart.prototype.SetHorAxisOrientation = function(bIsMinMax){ return true; };

/**
 * Specifies the chart legend position.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {"left" | "top" | "right" | "bottom" | "none"} sLegendPos - The position of the chart legend inside the chart window.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetLegendPos.js
 */
ApiChart.prototype.SetLegendPos = function(sLegendPos){ return true; };

/**
 * Specifies the legend font size.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {pt} nFontSize - The text size value measured in points.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetLegendFontSize.js
 */
ApiChart.prototype.SetLegendFontSize = function(nFontSize){ return true; };

/**
 * Specifies which chart data labels are shown for the chart.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {boolean} bShowSerName - Whether to show or hide the source table column names used for the data which the chart will be build from.
 * @param {boolean} bShowCatName - Whether to show or hide the source table row names used for the data which the chart will be build from.
 * @param {boolean} bShowVal - Whether to show or hide the chart data values.
 * @param {boolean} bShowPercent - Whether to show or hide the percent for the data values (works with stacked chart types).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetShowDataLabels.js
 */
ApiChart.prototype.SetShowDataLabels = function(bShowSerName, bShowCatName, bShowVal, bShowPercent){ return true; };

/**
 * Spicifies the show options for data labels.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {number} nSeriesIndex - The series index from the array of the data used to build the chart from.
 * @param {number} nPointIndex - The point index from this series.
 * @param {boolean} bShowSerName - Whether to show or hide the source table column names used for the data which the chart will be build from.
 * @param {boolean} bShowCatName - Whether to show or hide the source table row names used for the data which the chart will be build from.
 * @param {boolean} bShowVal - Whether to show or hide the chart data values.
 * @param {boolean} bShowPercent - Whether to show or hide the percent for the data values (works with stacked chart types).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetShowPointDataLabel.js
 */
ApiChart.prototype.SetShowPointDataLabel = function(nSeriesIndex, nPointIndex, bShowSerName, bShowCatName, bShowVal, bShowPercent){ return true; };

/**
 * Spicifies tick labels position for the vertical axis.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {TickLabelPosition} sTickLabelPosition - The type for the position of chart vertical tick labels.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetVertAxisTickLabelPosition.js
 */
ApiChart.prototype.SetVertAxisTickLabelPosition = function(sTickLabelPosition){ return true; };

/**
 * Spicifies tick labels position for the horizontal axis.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {TickLabelPosition} sTickLabelPosition - The type for the position of chart horizontal tick labels.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetHorAxisTickLabelPosition.js
 */
ApiChart.prototype.SetHorAxisTickLabelPosition = function(sTickLabelPosition){ return true; };

/**
 * Specifies major tick mark for the horizontal axis.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {TickMark} sTickMark - The type of tick mark appearance.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetHorAxisMajorTickMark.js
 */
ApiChart.prototype.SetHorAxisMajorTickMark = function(sTickMark){ return true; };

/**
 * Specifies minor tick mark for the horizontal axis.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {TickMark} sTickMark - The type of tick mark appearance.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetHorAxisMinorTickMark.js
 */
ApiChart.prototype.SetHorAxisMinorTickMark = function(sTickMark){ return true; };

/**
 * Specifies major tick mark for the vertical axis.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {TickMark} sTickMark - The type of tick mark appearance.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetVertAxisMajorTickMark.js
 */
ApiChart.prototype.SetVertAxisMajorTickMark = function(sTickMark){ return true; };

/**
 * Specifies minor tick mark for the vertical axis.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {TickMark} sTickMark - The type of tick mark appearance.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetVertAxisMinorTickMark.js
 */
ApiChart.prototype.SetVertAxisMinorTickMark = function(sTickMark){ return true; };

/**
 * Specifies major vertical gridline visual properties.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {?ApiStroke} oStroke - The stroke used to create the element shadow.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetMajorVerticalGridlines.js
 */
ApiChart.prototype.SetMajorVerticalGridlines = function(oStroke){ return true; };

/**
 * Specifies minor vertical gridline visual properties.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {?ApiStroke} oStroke - The stroke used to create the element shadow.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetMinorVerticalGridlines.js
 */
ApiChart.prototype.SetMinorVerticalGridlines = function(oStroke){ return true; };

/**
 * Specifies major horizontal gridline visual properties.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {?ApiStroke} oStroke - The stroke used to create the element shadow.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetMajorHorizontalGridlines.js
 */
ApiChart.prototype.SetMajorHorizontalGridlines = function(oStroke){ return true; };

/**
 * Specifies minor horizontal gridline visual properties.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {?ApiStroke} oStroke - The stroke used to create the element shadow.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetMinorHorizontalGridlines.js
 */
ApiChart.prototype.SetMinorHorizontalGridlines = function(oStroke){ return true; };

/**
 * Removes the specified series from the current chart.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @param {number} nSeria - The index of the chart series.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/RemoveSeria.js
 */
ApiChart.prototype.RemoveSeria = function(nSeria){ return true; };

/**
 * Sets values to the specified chart series.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CPE"]
 * @param {number[]} aValues - The array of the data which will be set to the specified chart series.
 * @param {number} nSeria - The index of the chart series.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetSeriaValues.js
 */
ApiChart.prototype.SetSeriaValues = function(aValues, nSeria){ return true; };

/**
 * Sets the x-axis values to all chart series. It is used with the scatter charts only.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CPE"]
 * @param {string[]} aValues - The array of the data which will be set to the x-axis data points.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetXValues.js
 */
ApiChart.prototype.SetXValues = function(aValues){ return true; };

/**
 * Sets a name to the specified chart series.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CPE"]
 * @param {string} sName - The name which will be set to the specified chart series.
 * @param {number} nSeria - The index of the chart series.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetSeriaName.js
 */
ApiChart.prototype.SetSeriaName = function(sName, nSeria){ return true; };

/**
 * Sets a name to the specified chart category.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CPE"]
 * @param {string} sName - The name which will be set to the specified chart category.
 * @param {number} nCategory - The index of the chart category.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetCategoryName.js
 */
ApiChart.prototype.SetCategoryName = function(sName, nCategory){ return true; };

/**
 * Sets a style to the current chart by style ID.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @param nStyleId - One of the styles available in the editor.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/ApplyChartStyle.js
 */
ApiChart.prototype.ApplyChartStyle = function(nStyleId){ return true; };

/**
 * Sets the fill to the chart plot area.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @param {ApiFill} oFill - The fill type used to fill the plot area.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetPlotAreaFill.js
 */
ApiChart.prototype.SetPlotAreaFill = function(oFill){ return true; };

/**
 * Sets the outline to the chart plot area.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @param {ApiStroke} oStroke - The stroke used to create the plot area outline.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetPlotAreaOutLine.js
 */
ApiChart.prototype.SetPlotAreaOutLine = function(oStroke){ return true; };

/**
 * Sets the fill to the specified chart series.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @param {ApiFill} oFill - The fill type used to fill the series.
 * @param {number} nSeries - The index of the chart series.
 * @param {boolean} [bAll=false] - Specifies if the fill will be applied to all series.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetSeriesFill.js
 */
ApiChart.prototype.SetSeriesFill = function(oFill, nSeries, bAll){ return true; };

/**
 * Sets the outline to the specified chart series.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @param {ApiStroke} oStroke - The stroke used to create the series outline.
 * @param {number} nSeries - The index of the chart series.
 * @param {boolean} [bAll=false] - Specifies if the outline will be applied to all series.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetSeriesOutLine.js
 */
ApiChart.prototype.SetSeriesOutLine = function(oStroke, nSeries, bAll){ return true; };

/**
 * Sets the fill to the data point in the specified chart series.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @param {ApiFill} oFill - The fill type used to fill the data point.
 * @param {number} nSeries - The index of the chart series.
 * @param {number} nDataPoint - The index of the data point in the specified chart series.
 * @param {boolean} [bAllSeries=false] - Specifies if the fill will be applied to the specified data point in all series.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetDataPointFill.js
 */
ApiChart.prototype.SetDataPointFill = function(oFill, nSeries, nDataPoint, bAllSeries){ return true; };

/**
 * Sets the outline to the data point in the specified chart series.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @param {ApiStroke} oStroke - The stroke used to create the data point outline.
 * @param {number} nSeries - The index of the chart series.
 * @param {number} nDataPoint - The index of the data point in the specified chart series.
 * @param {boolean} bAllSeries - Specifies if the outline will be applied to the specified data point in all series.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetDataPointOutLine.js
 */
ApiChart.prototype.SetDataPointOutLine = function(oStroke, nSeries, nDataPoint, bAllSeries){ return true; };

/**
 * Sets the fill to the marker in the specified chart series.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @param {ApiFill} oFill - The fill type used to fill the marker.
 * @param {number} nSeries - The index of the chart series.
 * @param {number} nMarker - The index of the marker in the specified chart series.
 * @param {boolean} [bAllMarkers=false] - Specifies if the fill will be applied to all markers in the specified chart series.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetMarkerFill.js
 */
ApiChart.prototype.SetMarkerFill = function(oFill, nSeries, nMarker, bAllMarkers){ return true; };

/**
 * Sets the outline to the marker in the specified chart series.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @param {ApiStroke} oStroke - The stroke used to create the marker outline.
 * @param {number} nSeries - The index of the chart series.
 * @param {number} nMarker - The index of the marker in the specified chart series.
 * @param {boolean} [bAllMarkers=false] - Specifies if the outline will be applied to all markers in the specified chart series.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetMarkerOutLine.js
 */
ApiChart.prototype.SetMarkerOutLine = function(oStroke, nSeries, nMarker, bAllMarkers){ return true; };

/**
 * Sets the fill to the chart title.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @param {ApiFill} oFill - The fill type used to fill the title.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetTitleFill.js
 */
ApiChart.prototype.SetTitleFill = function(oFill){ return true; };

/**
 * Sets the outline to the chart title.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @param {ApiStroke} oStroke - The stroke used to create the title outline.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetTitleOutLine.js
 */
ApiChart.prototype.SetTitleOutLine = function(oStroke){ return true; };

/**
 * Sets the fill to the chart legend.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @param {ApiFill} oFill - The fill type used to fill the legend.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetLegendFill.js
 */
ApiChart.prototype.SetLegendFill = function(oFill){ return true; };

/**
 * Sets the outline to the chart legend.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @param {ApiStroke} oStroke - The stroke used to create the legend outline.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetLegendOutLine.js
 */
ApiChart.prototype.SetLegendOutLine = function(oStroke){ return true; };

/**
 * Sets the specified numeric format to the axis values.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @param {NumFormat | String} sFormat - Numeric format (can be custom format).
 * @param {AxisPos} - Axis position in the chart.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetAxieNumFormat.js
 */
ApiChart.prototype.SetAxieNumFormat = function(sFormat, sAxiePos){ return true; };

/**
 * Sets the specified numeric format to the chart series.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CPE"]
 * @param {NumFormat | String} sFormat - Numeric format (can be custom format).
 * @param {Number} nSeria - Series index.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetSeriaNumFormat.js
 */
ApiChart.prototype.SetSeriaNumFormat = function(sFormat, nSeria){ return true; };

/**
 * Sets the specified numeric format to the chart data point.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CPE"]
 * @param {NumFormat | String} sFormat - Numeric format (can be custom format).
 * @param {Number} nSeria - Series index.
 * @param {number} nDataPoint - The index of the data point in the specified chart series.
 * @param {boolean} bAllSeries - Specifies if the numeric format will be applied to the specified data point in all series.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetDataPointNumFormat.js
 */
ApiChart.prototype.SetDataPointNumFormat = function(sFormat, nSeria, nDataPoint, bAllSeries){ return true; };

/**
 * Returns all series from the chart space.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @returns {ApiChartSeries[]}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/GetAllSeries.js
 */
ApiChart.prototype.GetAllSeries = function(){ return [new ApiChartSeries()]; };

/**
 * Returns the series with a specific index.
 * @memberof ApiChart
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @param {number} nIdx - Series index.
 * @returns {ApiChartSeries}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/GetSeries.js
 */
ApiChart.prototype.GetSeries = function(nIdx){ return new ApiChartSeries(); };

/**
 * Returns a type of the ApiChartSeries class.
 * @memberof ApiChartSeries
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @returns {"chartSeries"}
 * @see office-js-api/Examples/{Editor}/ApiChartSeries/Methods/GetClassType.js
 */
ApiChartSeries.prototype.GetClassType = function(){ return ""; };

/**
 * Tries to change the series type. Returns true if successful.
 * @memberof ApiChartSeries
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @param {ChartType} sType - Chart type.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChartSeries/Methods/ChangeChartType.js
 */
ApiChartSeries.prototype.ChangeChartType = function(sType){ return true; };

/**
 * Returns a chart type of the current series.
 * @memberof ApiChartSeries
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @returns {ChartType}
 * @see office-js-api/Examples/{Editor}/ApiChartSeries/Methods/GetChartType.js
 */
ApiChartSeries.prototype.GetChartType = function(){ return new ChartType(); };

/**
 * Returns a type of the ApiFill class.
 * @memberof ApiFill
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"fill"}
 * @see office-js-api/Examples/{Editor}/ApiFill/Methods/GetClassType.js
 */
ApiFill.prototype.GetClassType = function(){ return ""; };

/**
 * Returns a type of the ApiStroke class.
 * @memberof ApiStroke
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"stroke"}
 * @see office-js-api/Examples/{Editor}/ApiStroke/Methods/GetClassType.js
 */
ApiStroke.prototype.GetClassType = function(){ return ""; };

/**
 * Returns a type of the ApiGradientStop class.
 * @memberof ApiGradientStop
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"gradientStop"}
 * @see office-js-api/Examples/{Editor}/ApiGradientStop/Methods/GetClassType.js
 */
ApiGradientStop.prototype.GetClassType = function (){ return ""; };

/**
 * Returns a type of the ApiUniColor class.
 * @memberof ApiUniColor
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"uniColor"}
 * @see office-js-api/Examples/{Editor}/ApiUniColor/Methods/GetClassType.js
 */
ApiUniColor.prototype.GetClassType = function (){ return ""; };

/**
 * Returns a type of the ApiRGBColor class.
 * @memberof ApiRGBColor
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"rgbColor"}
 * @see office-js-api/Examples/{Editor}/ApiRGBColor/Methods/GetClassType.js
 */
ApiRGBColor.prototype.GetClassType = function (){ return ""; };

/**
 * Returns a type of the ApiSchemeColor class.
 * @memberof ApiSchemeColor
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"schemeColor"}
 * @see office-js-api/Examples/{Editor}/ApiSchemeColor/Methods/GetClassType.js
 */
ApiSchemeColor.prototype.GetClassType = function (){ return ""; };

/**
 * Returns a type of the ApiPresetColor class.
 * @memberof ApiPresetColor
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"presetColor"}
 * @see office-js-api/Examples/{Editor}/ApiPresetColor/Methods/GetClassType.js
 */
ApiPresetColor.prototype.GetClassType = function (){ return ""; };

/**
 * Returns a type of the ApiBullet class.
 * @memberof ApiBullet
 * @typeofeditors ["CSE", "CPE"]
 * @returns {"bullet"}
 * @see office-js-api/Examples/{Editor}/ApiBullet/Methods/GetClassType.js
 */
ApiBullet.prototype.GetClassType = function(){ return ""; };

/**
 * Replaces each paragraph (or text in cell) in the select with the corresponding text from an array of strings.
 * @memberof ApiInterface
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {string[]} textStrings - An array of replacement strings.
 * @param {string} [tab="\t"] - A character which is used to specify the tab in the source text.
 * @param {string} [newLine="\r\n"] - A character which is used to specify the line break character in the source text.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/Api/Methods/ReplaceTextSmart.js
 */
ApiInterface.prototype.ReplaceTextSmart = function(textStrings, tab, newLine){ return true; };

/**
 * Creates the empty text properties.
 * @memberof ApiInterface
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateTextPr.js
 */
ApiInterface.prototype.CreateTextPr = function(){ return new ApiTextPr(); };

/**
 * Returns the full name of the currently opened file.
 * @memberof ApiInterface
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/Api/Methods/GetFullName.js
 */
ApiInterface.prototype.GetFullName = function(){ return ""; };

/**
 * Returns the full name of the currently opened file.
 * @memberof ApiInterface
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/Api/Methods/GetFullName.js
 */
ApiInterface.prototype.FullName = ApiInterface.prototype.GetFullName ();

/**
 * Returns a type of the ApiComment class.
 * @memberof ApiComment
 * @typeofeditors ["CDE", "CPE"]
 * @returns {"comment"}
 * @see office-js-api/Examples/{Editor}/ApiComment/Methods/GetClassType.js
 */
ApiComment.prototype.GetClassType = function (){ return ""; };

/**
 * Returns the comment text.
 * @memberof ApiComment
 * @typeofeditors ["CDE", "CPE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiComment/Methods/GetText.js
 */
ApiComment.prototype.GetText = function () { return ""; };

/**
 * Sets the comment text.
 * @memberof ApiComment
 * @typeofeditors ["CDE", "CPE"]
 * @param {string} sText - The comment text.
 * @returns {ApiComment} - this
 * @see office-js-api/Examples/{Editor}/ApiComment/Methods/SetText.js
 */
ApiComment.prototype.SetText = function (sText) { return new ApiComment(); };

/**
 * Returns the comment author's name.
 * @memberof ApiComment
 * @typeofeditors ["CDE", "CPE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiComment/Methods/GetAuthorName.js
 */
ApiComment.prototype.GetAuthorName = function () { return ""; };

/**
 * Sets the comment author's name.
 * @memberof ApiComment
 * @typeofeditors ["CDE", "CPE"]
 * @param {string} sAuthorName - The comment author's name.
 * @returns {ApiComment} - this
 * @see office-js-api/Examples/{Editor}/ApiComment/Methods/SetAuthorName.js
 */
ApiComment.prototype.SetAuthorName = function (sAuthorName) { return new ApiComment(); };

/**
 * Returns the user ID of the comment author.
 * @memberof ApiComment
 * @typeofeditors ["CDE", "CPE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiComment/Methods/GetUserId.js
 */
ApiComment.prototype.GetUserId = function () { return ""; };

/**
 * Sets the user ID to the comment author.
 * @memberof ApiComment
 * @typeofeditors ["CDE", "CPE"]
 * @param {string} sUserId - The user ID of the comment author.
 * @returns {ApiComment} - this
 * @see office-js-api/Examples/{Editor}/ApiComment/Methods/SetUserId.js
 */
ApiComment.prototype.SetUserId = function (sUserId) { return new ApiComment(); };

/**
 * Checks if a comment is solved or not.
 * @memberof ApiComment
 * @typeofeditors ["CDE", "CPE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiComment/Methods/IsSolved.js
 */
ApiComment.prototype.IsSolved = function () { return true; };

/**
 * Marks a comment as solved.
 * @memberof ApiComment
 * @typeofeditors ["CDE", "CPE"]
 * @param {boolean} bSolved - Specifies if a comment is solved or not.
 * @returns {ApiComment} - this
 * @see office-js-api/Examples/{Editor}/ApiComment/Methods/SetSolved.js
 */
ApiComment.prototype.SetSolved = function (bSolved) { return new ApiComment(); };

/**
 * Returns the timestamp of the comment creation in UTC format.
 * @memberof ApiComment
 * @typeofeditors ["CDE", "CPE"]
 * @returns {Number}
 * @see office-js-api/Examples/{Editor}/ApiComment/Methods/GetTimeUTC.js
 */
ApiComment.prototype.GetTimeUTC = function () { return 0; };

/**
 * Sets the timestamp of the comment creation in UTC format.
 * @memberof ApiComment
 * @typeofeditors ["CDE", "CPE"]
 * @param {Number | String} nTimeStamp - The timestamp of the comment creation in UTC format.
 * @returns {ApiComment} - this
 * @see office-js-api/Examples/{Editor}/ApiComment/Methods/SetTimeUTC.js
 */
ApiComment.prototype.SetTimeUTC = function (timeStamp) { return new ApiComment(); };

/**
 * Returns the timestamp of the comment creation in the current time zone format.
 * @memberof ApiComment
 * @typeofeditors ["CDE", "CPE"]
 * @returns {Number}
 * @see office-js-api/Examples/{Editor}/ApiComment/Methods/GetTime.js
 */
ApiComment.prototype.GetTime = function () { return 0; };

/**
 * Sets the timestamp of the comment creation in the current time zone format.
 * @memberof ApiComment
 * @typeofeditors ["CDE", "CPE"]
 * @param {Number | String} nTimeStamp - The timestamp of the comment creation in the current time zone format.
 * @returns {ApiComment} - this
 * @see office-js-api/Examples/{Editor}/ApiComment/Methods/SetTime.js
 */
ApiComment.prototype.SetTime = function (timeStamp) { return new ApiComment(); };

/**
 * Returns the quote text of the current comment.
 * @memberof ApiComment
 * @typeofeditors ["CDE", "CPE"]
 * @returns {Number}
 * @see office-js-api/Examples/{Editor}/ApiComment/Methods/GetQuoteText.js
 */
ApiComment.prototype.GetQuoteText = function () { return 0; };

/**
 * Returns a number of the comment replies.
 * @memberof ApiComment
 * @typeofeditors ["CDE", "CPE"]
 * @returns {Number}
 * @see office-js-api/Examples/{Editor}/ApiComment/Methods/GetRepliesCount.js
 */
ApiComment.prototype.GetRepliesCount = function () { return 0; };

/**
 * Adds a reply to a comment.
 * @memberof ApiComment
 * @typeofeditors ["CDE", "CPE"]
 * @param {String} sText - The comment reply text (required).
 * @param {String} sAuthorName - The name of the comment reply author (optional).
 * @param {String} sUserId - The user ID of the comment reply author (optional).
 * @param {Number} [nPos=-1] - The comment reply position. If nPos=-1 add to the end.
 * @returns {ApiComment} - this
 * @see office-js-api/Examples/{Editor}/ApiComment/Methods/AddReply.js
 */
ApiComment.prototype.AddReply = function (sText, sAuthorName, sUserId, nPos) { return new ApiComment(); };

/**
 * Removes the specified comment replies.
 * @memberof ApiComment
 * @typeofeditors ["CDE", "CPE"]
 * @param {Number} [nPos = 0] - The position of the first comment reply to remove.
 * @param {Number} [nCount = 1] - A number of comment replies to remove.
 * @param {boolean} [bRemoveAll = false] - Specifies whether to remove all comment replies or not.
 * @returns {ApiComment} - this
 * @see office-js-api/Examples/{Editor}/ApiComment/Methods/RemoveReplies.js
 */
ApiComment.prototype.RemoveReplies = function (nPos, nCount, bRemoveAll) { return new ApiComment(); };

/**
 * Deletes the current comment from the document.
 * @memberof ApiComment
 * @typeofeditors ["CDE", "CPE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiComment/Methods/Delete.js
 */
ApiComment.prototype.Delete = function (){ return true; };

/**
 * Sets the position of the comment in the document.
 * 
 * @memberof ApiComment
 * @typeofeditors ["CPE"]
 * @param {number} x - The X coordinate of the comment position in EMU.
 * @param {number} y - The Y coordinate of the comment position in EMU.
 * @see office-js-api/Examples/{Editor}/ApiComment/Methods/SetPosition.js
 */
ApiComment.prototype.SetPosition = function (x, y) {};

/**
 * Returns the position of the comment in the document.
 * 
 * @memberof ApiComment
 * @typeofeditors ["CPE"]
 * @returns {Object} - An object with the coordinates (in EMU) of the comment position.
 * @see office-js-api/Examples/{Editor}/ApiComment/Methods/GetPosition.js
 */
ApiComment.prototype.GetPosition = function () { return new Object(); };

/**
 * Returns a type of the ApiCommentReply class.
 * @memberof ApiCommentReply
 * @typeofeditors ["CDE", "CPE"]
 * @returns {"commentReply"}
 * @see office-js-api/Examples/{Editor}/ApiCommentReply/Methods/GetClassType.js
 */
ApiCommentReply.prototype.GetClassType = function () { return ""; };

/**
 * Returns the comment reply text.
 * @memberof ApiCommentReply
 * @typeofeditors ["CDE", "CPE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiCommentReply/Methods/GetText.js
 */
ApiCommentReply.prototype.GetText = function () { return ""; };

/**
 * Sets the comment reply text.
 * @memberof ApiCommentReply
 * @typeofeditors ["CDE", "CPE"]
 * @param {string} sText - The comment reply text.
 * @returns {ApiCommentReply} - this
 * @see office-js-api/Examples/{Editor}/ApiCommentReply/Methods/SetText.js
 */
ApiCommentReply.prototype.SetText = function (sText) { return new ApiCommentReply(); };

/**
 * Returns the comment reply author's name.
 * @memberof ApiCommentReply
 * @typeofeditors ["CDE", "CPE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiCommentReply/Methods/GetAuthorName.js
 */
ApiCommentReply.prototype.GetAuthorName = function () { return ""; };

/**
 * Sets the comment reply author's name.
 * @memberof ApiCommentReply
 * @typeofeditors ["CDE", "CPE"]
 * @param {string} sAuthorName - The comment reply author's name.
 * @returns {ApiCommentReply} - this
 * @see office-js-api/Examples/{Editor}/ApiCommentReply/Methods/SetAuthorName.js
 */
ApiCommentReply.prototype.SetAuthorName = function (sAuthorName) { return new ApiCommentReply(); };

/**
 * Sets the user ID to the comment reply author.
 * @memberof ApiCommentReply
 * @typeofeditors ["CDE", "CPE"]
 * @param {string} sUserId - The user ID of the comment reply author.
 * @returns {ApiCommentReply} - this
 * @see office-js-api/Examples/{Editor}/ApiCommentReply/Methods/SetUserId.js
 */
ApiCommentReply.prototype.SetUserId = function (sUserId) { return new ApiCommentReply(); };

/**
 * Returns a type of the ApiCore class.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"core"}
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/GetClassType.js
 */
ApiCore.prototype.GetClassType = function () { return ""; };

/**
 * Sets the document category.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {string} sCategory - The document category.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/SetCategory.js
 */
ApiCore.prototype.SetCategory = function (sCategory) {};

/**
 * Returns the document category.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {string} - The document category.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/GetCategory.js
 */
ApiCore.prototype.GetCategory = function () { return ""; };

/**
 * Sets the document content status.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {string} sStatus - The document content status.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/SetContentStatus.js
 */
ApiCore.prototype.SetContentStatus = function (sStatus) {};

/**
 * Returns the document content status.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {string} - The document content status.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/GetContentStatus.js
 */
ApiCore.prototype.GetContentStatus = function () { return ""; };

/**
 * Sets the document creation date.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {Date} oCreated - The document creation date.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/SetCreated.js
 */
ApiCore.prototype.SetCreated = function (oCreated) {};

/**
 * Returns the document creation date.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {Date}- The document creation date.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/GetCreated.js
 */
ApiCore.prototype.GetCreated = function () { return new Date(); };

/**
 * Sets the document author.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {string} sCreator - The document author.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/SetCreator.js
 */
ApiCore.prototype.SetCreator = function (sCreator) {};

/**
 * Returns the document author.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {string} - The document author.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/GetCreator.js
 */
ApiCore.prototype.GetCreator = function () { return ""; };

/**
 * Sets the document description.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {string} sDescription - The document description.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/SetDescription.js
 */
ApiCore.prototype.SetDescription = function (sDescription) {};

/**
 * Returns the document description.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {string} - The document description.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/GetDescription.js
 */
ApiCore.prototype.GetDescription = function () { return ""; };

/**
 * Sets the document identifier.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {string} sIdentifier - The document identifier.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/SetIdentifier.js
 */
ApiCore.prototype.SetIdentifier = function (sIdentifier) {};

/**
 * Returns the document identifier.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {string} - The document identifier.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/GetIdentifier.js
 */
ApiCore.prototype.GetIdentifier = function () { return ""; };

/**
 * Sets the document keywords.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {string} sKeywords - The document keywords in the string format.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/SetKeywords.js
 *
 */
ApiCore.prototype.SetKeywords = function (sKeywords) {};

/**
 * Returns the document keywords.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {string} - The document keywords in the string format.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/GetKeywords.js
 */
ApiCore.prototype.GetKeywords = function () { return ""; };

/**
 * Sets the document language.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {string} sLanguage - The document language.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/SetLanguage.js
 */
ApiCore.prototype.SetLanguage = function (sLanguage) {};

/**
 * Returns the document language.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {string} - The document language.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/GetLanguage.js
 */
ApiCore.prototype.GetLanguage = function () { return ""; };

/**
 * Sets the name of the user who last modified the document.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {string} sLastModifiedBy - The name of the user who last modified the document.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/SetLastModifiedBy.js
 */
ApiCore.prototype.SetLastModifiedBy = function (sLastModifiedBy) {};

/**
 * Returns the name of the user who last modified the document.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {string} - The name of the user who last modified the document.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/GetLastModifiedBy.js
 */
ApiCore.prototype.GetLastModifiedBy = function () { return ""; };

/**
 * Sets the date when the document was last printed.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {Date} oLastPrinted - The date when the document was last printed.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/SetLastPrinted.js
 */
ApiCore.prototype.SetLastPrinted = function (oLastPrinted) {};

/**
 * Returns the date when the document was last printed.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {Date} - The date when the document was last printed.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/GetLastPrinted.js
 */
ApiCore.prototype.GetLastPrinted = function () { return new Date(); };

/**
 * Sets the date when the document was last modified.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {Date} oModified - The date when the document was last modified.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/SetModified.js
 */
ApiCore.prototype.SetModified = function (oModified) {};

/**
 * Returns the date when the document was last modified.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {Date} - The date when the document was last modified.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/GetModified.js
 */
ApiCore.prototype.GetModified = function () { return new Date(); };

/**
 * Sets the document revision.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {string} sRevision - The document revision.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/SetRevision.js
 */
ApiCore.prototype.SetRevision = function (sRevision) {};

/**
 * Returns the document revision.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {string} - The document revision.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/GetRevision.js
 */
ApiCore.prototype.GetRevision = function () { return ""; };

/**
 * Sets the document subject.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {string} sSubject - The document subject.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/SetSubject.js
 */
ApiCore.prototype.SetSubject = function (sSubject) {};

/**
 * Returns the document subject.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {string} - The document subject.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/GetSubject.js
 */
ApiCore.prototype.GetSubject = function () { return ""; };

/**
 * Sets the document title.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {string} sTitle - The document title.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/SetTitle.js
 */
ApiCore.prototype.SetTitle = function (sTitle) {};

/**
 * Returns the document title.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {string} - The document title.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/GetTitle.js
 */
ApiCore.prototype.GetTitle = function () { return ""; };

/**
 * Sets the document version.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {string} sVersion - The document version.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/SetVersion.js
 */
ApiCore.prototype.SetVersion = function (sVersion) {};

/**
 * Returns the document version.
 * @memberof ApiCore
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {string} - The document version.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCore/Methods/GetVersion.js
 */
ApiCore.prototype.GetVersion = function () { return ""; };

/**
 * Returns a type of the ApiCustomProperties class.
 * @memberof ApiCustomProperties
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"customProperties"}
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCustomProperties/Methods/GetClassType.js
 */
ApiCustomProperties.prototype.GetClassType = function () { return ""; };

/**
 * Adds a custom property to the document with automatic type detection.
 * @memberof ApiCustomProperties
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {string} name - The custom property name.
 * @param {string | number | boolean | Date} value - The custom property value.
 * @returns {boolean} - Returns false if the type is unsupported.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCustomProperties/Methods/Add.js
 */
ApiCustomProperties.prototype.Add = function (name, value) { return true; };

/**
 * Returns the value of a custom property by its name.
 * @memberof ApiCustomProperties
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @param {string} name - The custom property name.
 * @returns {string | number | Date | boolean | null} - The value of the custom property or null if the property does not exist.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiCustomProperties/Methods/Get.js
 */
ApiCustomProperties.prototype.Get = function (name) { return ""; };

/**
 * @param oApiRange
 * @param oTextPr
 * @constructor
 */
function ApiRangeTextPr(oApiRange, oTextPr){}
ApiRangeTextPr.prototype = Object.create(ApiTextPr.prototype);
ApiRangeTextPr.prototype.constructor = ApiRangeTextPr;

/**
 * Class representing a presentation.
 * @constructor
 */
function ApiPresentation(oPresentation){}

/**
 * Class representing a slide master.
 * @constructor
 */
function ApiMaster(oMaster){}

/**
 * Class representing a slide layout.
 * @constructor
 */
function ApiLayout(oLayout){}

/**
 * Class representing a placeholder.
 * @constructor
 */
function ApiPlaceholder(oPh){}

/**
 * Class representing a presentation theme.
 * @constructor
 */
function ApiTheme(oThemeInfo){}

/**
 * Class representing a theme color scheme.
 * @constructor
 */
function ApiThemeColorScheme(oClrScheme){}

/**
 * Class representing a theme format scheme.
 * @constructor
 */
function ApiThemeFormatScheme(ofmtScheme){}

/**
 * Class representing a theme font scheme.
 * @constructor
 */
function ApiThemeFontScheme(ofontScheme){}

/**
 * Class representing a slide.
 * @constructor
 */
function ApiSlide(oSlide){}

/**
 * Class representing a notes page.
 * @constructor
 */
function ApiNotesPage(oNotes) {}

/**
 * Class representing a graphical object.
 * @constructor
 */
function ApiDrawing(Drawing){}

/**
 * Class representing a shape.
 * @constructor
 */
function ApiShape(oShape){}
ApiShape.prototype = Object.create(ApiDrawing.prototype);
ApiShape.prototype.constructor = ApiShape;

/**
 * Class representing an image.
 * @constructor
 */
function ApiImage(oImage){}
ApiImage.prototype = Object.create(ApiDrawing.prototype);
ApiImage.prototype.constructor = ApiImage;

/**
 * Class representing a group of drawings.
 * @constructor
 */
function ApiGroup(oGroup){}
ApiGroup.prototype = Object.create(ApiDrawing.prototype);
ApiGroup.prototype.constructor = ApiGroup;

/**
 * Class representing an OLE object.
 * @constructor
 */
function ApiOleObject(OleObject){}
ApiOleObject.prototype = Object.create(ApiDrawing.prototype);
ApiOleObject.prototype.constructor = ApiOleObject;

/**
 * Class representing a table.
 * @param oGraphicFrame
 * @constructor
 */
function ApiTable(oGraphicFrame){}
ApiTable.prototype = Object.create(ApiDrawing.prototype);
ApiTable.prototype.constructor = ApiTable;

/**
 * Class representing a table row.
 * @param oTableRow
 * @constructor
 */
function ApiTableRow(oTableRow){}

/**
 * Class representing a table cell.
 * @param oCell
 * @constructor
 */
function ApiTableCell(oCell){}

/**
 * Twentieths of a point (equivalent to 1/1440th of an inch).
 * @typedef {number} twips
 * @see office-js-api/Examples/Enumerations/twips.js
 */

/**
 * 240ths of a line.
 * @typedef {number} line240
 * @see office-js-api/Examples/Enumerations/line240.js
 */

/**
 * Half-points (2 half-points = 1 point).
 * @typedef {number} hps
 * @see office-js-api/Examples/Enumerations/hps.js
 */

/**
 * A numeric value from 0 to 255.
 * @typedef {number} byte
 * @see office-js-api/Examples/Enumerations/byte.js
 */

/**
 * 60000th of a degree (5400000 = 90 degrees).
 * @typedef {number} PositiveFixedAngle
 * @see office-js-api/Examples/Enumerations/PositiveFixedAngle.js
 */

/**
 * A border type.
 * @typedef {("none" | "single")} BorderType
 * @see office-js-api/Examples/Enumerations/BorderType.js
 */

/**
 * Types of custom tab.
 * @typedef {("clear" | "left" | "right" | "center")} TabJc
 * @see office-js-api/Examples/Enumerations/TabJc.js
 */

/**
 * Eighths of a point (24 eighths of a point = 3 points).
 * @typedef {number} pt_8
 * @see office-js-api/Examples/Enumerations/pt_8.js
 */

/**
 * A point.
 * @typedef {number} pt
 * @see office-js-api/Examples/Enumerations/pt.js
 */

/**
 * English measure unit. 1 mm = 36000 EMUs, 1 inch = 914400 EMUs.
 * @typedef {number} EMU
 * @see office-js-api/Examples/Enumerations/EMU.js
 */

/**
 * This type specifies the preset shape geometry that will be used for a shape.
 * @typedef {("accentBorderCallout1" | "accentBorderCallout2" | "accentBorderCallout3" | "accentCallout1" | "accentCallout2" | "accentCallout3" | "actionButtonBackPrevious" | "actionButtonBeginning" | "actionButtonBlank" | "actionButtonDocument" | "actionButtonEnd" | "actionButtonForwardNext" | "actionButtonHelp" | "actionButtonHome" | "actionButtonInformation" | "actionButtonMovie" | "actionButtonReturn" | "actionButtonSound" | "arc" | "bentArrow" | "bentConnector2" | "bentConnector3" | "bentConnector4" | "bentConnector5" | "bentUpArrow" | "bevel" | "blockArc" | "borderCallout1" | "borderCallout2" | "borderCallout3" | "bracePair" | "bracketPair" | "callout1" | "callout2" | "callout3" | "can" | "chartPlus" | "chartStar" | "chartX" | "chevron" | "chord" | "circularArrow" | "cloud" | "cloudCallout" | "corner" | "cornerTabs" | "cube" | "curvedConnector2" | "curvedConnector3" | "curvedConnector4" | "curvedConnector5" | "curvedDownArrow" | "curvedLeftArrow" | "curvedRightArrow" | "curvedUpArrow" | "decagon" | "diagStripe" | "diamond" | "dodecagon" | "donut" | "doubleWave" | "downArrow" | "downArrowCallout" | "ellipse" | "ellipseRibbon" | "ellipseRibbon2" | "flowChartAlternateProcess" | "flowChartCollate" | "flowChartConnector" | "flowChartDecision" | "flowChartDelay" | "flowChartDisplay" | "flowChartDocument" | "flowChartExtract" | "flowChartInputOutput" | "flowChartInternalStorage" | "flowChartMagneticDisk" | "flowChartMagneticDrum" | "flowChartMagneticTape" | "flowChartManualInput" | "flowChartManualOperation" | "flowChartMerge" | "flowChartMultidocument" | "flowChartOfflineStorage" | "flowChartOffpageConnector" | "flowChartOnlineStorage" | "flowChartOr" | "flowChartPredefinedProcess" | "flowChartPreparation" | "flowChartProcess" | "flowChartPunchedCard" | "flowChartPunchedTape" | "flowChartSort" | "flowChartSummingJunction" | "flowChartTerminator" | "foldedCorner" | "frame" | "funnel" | "gear6" | "gear9" | "halfFrame" | "heart" | "heptagon" | "hexagon" | "homePlate" | "horizontalScroll" | "irregularSeal1" | "irregularSeal2" | "leftArrow" | "leftArrowCallout" | "leftBrace" | "leftBracket" | "leftCircularArrow" | "leftRightArrow" | "leftRightArrowCallout" | "leftRightCircularArrow" | "leftRightRibbon" | "leftRightUpArrow" | "leftUpArrow" | "lightningBolt" | "line" | "lineInv" | "mathDivide" | "mathEqual" | "mathMinus" | "mathMultiply" | "mathNotEqual" | "mathPlus" | "moon" | "nonIsoscelesTrapezoid" | "noSmoking" | "notchedRightArrow" | "octagon" | "parallelogram" | "pentagon" | "pie" | "pieWedge" | "plaque" | "plaqueTabs" | "plus" | "quadArrow" | "quadArrowCallout" | "rect" | "ribbon" | "ribbon2" | "rightArrow" | "rightArrowCallout" | "rightBrace" | "rightBracket" | "round1Rect" | "round2DiagRect" | "round2SameRect" | "roundRect" | "rtTriangle" | "smileyFace" | "snip1Rect" | "snip2DiagRect" | "snip2SameRect" | "snipRoundRect" | "squareTabs" | "star10" | "star12" | "star16" | "star24" | "star32" | "star4" | "star5" | "star6" | "star7" | "star8" | "straightConnector1" | "stripedRightArrow" | "sun" | "swooshArrow" | "teardrop" | "trapezoid" | "triangle" | "upArrowCallout" | "upDownArrow" | "upDownArrow" | "upDownArrowCallout" | "uturnArrow" | "verticalScroll" | "wave" | "wedgeEllipseCallout" | "wedgeRectCallout" | "wedgeRoundRectCallout")} ShapeType
 * @see office-js-api/Examples/Enumerations/ShapeType.js
 */

/**
* A bullet type which will be added to the paragraph in spreadsheet or presentation.
* @typedef {("None" | "ArabicPeriod"  | "ArabicParenR"  | "RomanUcPeriod" | "RomanLcPeriod" | "AlphaLcParenR" | "AlphaLcPeriod" | "AlphaUcParenR" | "AlphaUcPeriod")} BulletType
* @see office-js-api/Examples/Enumerations/BulletType.js
 */

/**
 * The available text vertical alignment (used to align text in a shape with a placement for text inside it).
 * @typedef {("top" | "center" | "bottom")} VerticalTextAlign
 * @see office-js-api/Examples/Enumerations/VerticalTextAlign.js
 */

/**
 * The available color scheme identifiers.
 * @typedef {("accent1" | "accent2" | "accent3" | "accent4" | "accent5" | "accent6" | "bg1" | "bg2" | "dk1" | "dk2" | "lt1" | "lt2" | "tx1" | "tx2")} SchemeColorId
 * @see office-js-api/Examples/Enumerations/SchemeColorId.js
 */

/**
 * The available preset color names.
 * @typedef {("aliceBlue" | "antiqueWhite" | "aqua" | "aquamarine" | "azure" | "beige" | "bisque" | "black" | "blanchedAlmond" | "blue" | "blueViolet" | "brown" | "burlyWood" | "cadetBlue" | "chartreuse" | "chocolate" | "coral" | "cornflowerBlue" | "cornsilk" | "crimson" | "cyan" | "darkBlue" | "darkCyan" | "darkGoldenrod" | "darkGray" | "darkGreen" | "darkGrey" | "darkKhaki" | "darkMagenta" | "darkOliveGreen" | "darkOrange" | "darkOrchid" | "darkRed" | "darkSalmon" | "darkSeaGreen" | "darkSlateBlue" | "darkSlateGray" | "darkSlateGrey" | "darkTurquoise" | "darkViolet" | "deepPink" | "deepSkyBlue" | "dimGray" | "dimGrey" | "dkBlue" | "dkCyan" | "dkGoldenrod" | "dkGray" | "dkGreen" | "dkGrey" | "dkKhaki" | "dkMagenta" | "dkOliveGreen" | "dkOrange" | "dkOrchid" | "dkRed" | "dkSalmon" | "dkSeaGreen" | "dkSlateBlue" | "dkSlateGray" | "dkSlateGrey" | "dkTurquoise" | "dkViolet" | "dodgerBlue" | "firebrick" | "floralWhite" | "forestGreen" | "fuchsia" | "gainsboro" | "ghostWhite" | "gold" | "goldenrod" | "gray" | "green" | "greenYellow" | "grey" | "honeydew" | "hotPink" | "indianRed" | "indigo" | "ivory" | "khaki" | "lavender" | "lavenderBlush" | "lawnGreen" | "lemonChiffon" | "lightBlue" | "lightCoral" | "lightCyan" | "lightGoldenrodYellow" | "lightGray" | "lightGreen" | "lightGrey" | "lightPink" | "lightSalmon" | "lightSeaGreen" | "lightSkyBlue" | "lightSlateGray" | "lightSlateGrey" | "lightSteelBlue" | "lightYellow" | "lime" | "limeGreen" | "linen" | "ltBlue" | "ltCoral" | "ltCyan" | "ltGoldenrodYellow" | "ltGray" | "ltGreen" | "ltGrey" | "ltPink" | "ltSalmon" | "ltSeaGreen" | "ltSkyBlue" | "ltSlateGray" | "ltSlateGrey" | "ltSteelBlue" | "ltYellow" | "magenta" | "maroon" | "medAquamarine" | "medBlue" | "mediumAquamarine" | "mediumBlue" | "mediumOrchid" | "mediumPurple" | "mediumSeaGreen" | "mediumSlateBlue" | "mediumSpringGreen" | "mediumTurquoise" | "mediumVioletRed" | "medOrchid" | "medPurple" | "medSeaGreen" | "medSlateBlue" | "medSpringGreen" | "medTurquoise" | "medVioletRed" | "midnightBlue" | "mintCream" | "mistyRose" | "moccasin" | "navajoWhite" | "navy" | "oldLace" | "olive" | "oliveDrab" | "orange" | "orangeRed" | "orchid" | "paleGoldenrod" | "paleGreen" | "paleTurquoise" | "paleVioletRed" | "papayaWhip" | "peachPuff" | "peru" | "pink" | "plum" | "powderBlue" | "purple" | "red" | "rosyBrown" | "royalBlue" | "saddleBrown" | "salmon" | "sandyBrown" | "seaGreen" | "seaShell" | "sienna" | "silver" | "skyBlue" | "slateBlue" | "slateGray" | "slateGrey" | "snow" | "springGreen" | "steelBlue" | "tan" | "teal" | "thistle" | "tomato" | "turquoise" | "violet" | "wheat" | "white" | "whiteSmoke" | "yellow" | "yellowGreen")} PresetColor
 * @see office-js-api/Examples/Enumerations/PresetColor.js
 */

/**
 * Possible values for the position of chart tick labels (either horizontal or vertical).
 * <b>"none"</b> - not display the selected tick labels.
 * <b>"nextTo"</b> - set the position of the selected tick labels next to the main label.
 * <b>"low"</b> - set the position of the selected tick labels in the part of the chart with lower values.
 * <b>"high"</b> - set the position of the selected tick labels in the part of the chart with higher values.
 * @typedef {("none" | "nextTo" | "low" | "high")} TickLabelPosition
 * @see office-js-api/Examples/Enumerations/TickLabelPosition.js
 */

/**
 * The type of a fill which uses an image as a background.
 * <b>"tile"</b> - if the image is smaller than the shape which is filled, the image will be tiled all over the created shape surface.
 * <b>"stretch"</b> - if the image is smaller than the shape which is filled, the image will be stretched to fit the created shape surface.
 * @typedef {"tile" | "stretch"} BlipFillType
 * @see office-js-api/Examples/Enumerations/BlipFillType.js
 */

/**
 * The available preset patterns which can be used for the fill.
 * @typedef {"cross" | "dashDnDiag" | "dashHorz" | "dashUpDiag" | "dashVert" | "diagBrick" | "diagCross" | "divot" | "dkDnDiag" | "dkHorz" | "dkUpDiag" | "dkVert" | "dnDiag" | "dotDmnd" | "dotGrid" | "horz" | "horzBrick" | "lgCheck" | "lgConfetti" | "lgGrid" | "ltDnDiag" | "ltHorz" | "ltUpDiag" | "ltVert" | "narHorz" | "narVert" | "openDmnd" | "pct10" | "pct20" | "pct25" | "pct30" | "pct40" | "pct5" | "pct50" | "pct60" | "pct70" | "pct75" | "pct80" | "pct90" | "plaid" | "shingle" | "smCheck" | "smConfetti" | "smGrid" | "solidDmnd" | "sphere" | "trellis" | "upDiag" | "vert" | "wave" | "wdDnDiag" | "wdUpDiag" | "weave" | "zigZag"} PatternType
 * @see office-js-api/Examples/Enumerations/PatternType.js
 */

/**
 * The available types of tick mark appearance.
 * @typedef {("cross" | "in" | "none" | "out")} TickMark
 * @see office-js-api/Examples/Enumerations/TickMark.js
 */

/**
 * Text transform type.
 * @typedef {("textArchDown" | "textArchDownPour" | "textArchUp" | "textArchUpPour" | "textButton" | "textButtonPour" | "textCanDown"
 * | "textCanUp" | "textCascadeDown" | "textCascadeUp" | "textChevron" | "textChevronInverted" | "textCircle" | "textCirclePour"
 * | "textCurveDown" | "textCurveUp" | "textDeflate" | "textDeflateBottom" | "textDeflateInflate" | "textDeflateInflateDeflate" | "textDeflateTop"
 * | "textDoubleWave1" | "textFadeDown" | "textFadeLeft" | "textFadeRight" | "textFadeUp" | "textInflate" | "textInflateBottom" | "textInflateTop"
 * | "textPlain" | "textRingInside" | "textRingOutside" | "textSlantDown" | "textSlantUp" | "textStop" | "textTriangle" | "textTriangleInverted"
 * | "textWave1" | "textWave2" | "textWave4" | "textNoShape")} TextTransform
 * @see office-js-api/Examples/Enumerations/TextTransform.js
 */

/**
 * Axis position in the chart.
 * @typedef {("top" | "bottom" | "right" | "left")} AxisPos
 * @see office-js-api/Examples/Enumerations/AxisPos.js
 */

/**
 * Standard numeric format.
 * @typedef {("General" | "0" | "0.00" | "#,##0" | "#,##0.00" | "0%" | "0.00%" |
 * "0.00E+00" | "# ?/?" | "# ??/??" | "m/d/yyyy" | "d-mmm-yy" | "d-mmm" | "mmm-yy" | "h:mm AM/PM" |
 * "h:mm:ss AM/PM" | "h:mm" | "h:mm:ss" | "m/d/yyyy h:mm" | "#,##0_\);(#,##0)" | "#,##0_\);\[Red\]\(#,##0)" | 
 * "#,##0.00_\);\(#,##0.00\)" | "#,##0.00_\);\[Red\]\(#,##0.00\)" | "mm:ss" | "[h]:mm:ss" | "mm:ss.0" | "##0.0E+0" | "@")} NumFormat
 * @see office-js-api/Examples/Enumerations/NumFormat.js
 */

/**
 * @typedef {("body" | "chart" | "clipArt" | "ctrTitle" | "diagram" | "date" | "footer" | "header" | "media" | "object" | "picture" | "sldImage" | "sldNumber" | "subTitle" | "table" | "title")} PlaceholderType - Available placeholder types.
 */

/**
 * Any valid drawing element.
 * @typedef {(ApiShape | ApiImage | ApiGroup | ApiOleObject | ApiTable | ApiChart )} Drawing
 * @see office-js-api/Examples/Enumerations/Drawing.js
 */

/**
 * Available drawing element for grouping.
 * @typedef {(ApiShape | ApiGroup | ApiImage | ApiChart)} DrawingForGroup
 * @see office-js-api/Examples/Enumerations/DrawingForGroup.js
 */

/**
 * Any valid element which can be added to the document structure.
 * @typedef {(ApiParagraph)} DocumentElement
 * @see office-js-api/Examples/Enumerations/DocumentElement.js
 */

/**
 * The types of elements that can be added to the paragraph structure.
 * @typedef {(ApiUnsupported | ApiRun | ApiHyperlink)} ParagraphContent
 * @see office-js-api/Examples/Enumerations/ParagraphContent.js
 */

/**
 * The 1000th of a percent (100000 = 100%).
 * @typedef {number} PositivePercentage
 * @see office-js-api/Examples/Enumerations/PositivePercentage.js
 */

/**
 * Represents the type of objects in a selection.
 * @typedef {("none" | "shapes" | "slides" | "text")} SelectionType - Available selection types.
 * @see office-js-api/Examples/Enumerations/SelectionType.js
 *
 */

/**
 * Returns the main presentation.
 * @typeofeditors ["CPE"]
 * @memberof ApiInterface
 * @returns {ApiPresentation}
 * @see office-js-api/Examples/{Editor}/Api/Methods/GetPresentation.js
 */
ApiInterface.prototype.GetPresentation = function(){ return new ApiPresentation(); };

/**
 * Creates a new slide master.
 * @typeofeditors ["CPE"]
 * @memberof ApiInterface
 * @param {ApiTheme} [oTheme = ApiPresentation.GetMaster(0).GetTheme()] - The presentation theme object.
 * @returns {ApiMaster} - returns null if presentation theme doesn't exist.
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateMaster.js
 */
ApiInterface.prototype.CreateMaster = function(oTheme){ return new ApiMaster(); };

/**
 * Creates a new slide layout and adds it to the slide master if it is specified.
 * @typeofeditors ["CPE"]
 * @memberof ApiInterface
 * @param {ApiMaster} [oMaster = null] - Parent slide master.
 * @returns {ApiLayout}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateLayout.js
 */
ApiInterface.prototype.CreateLayout = function(oMaster){ return new ApiLayout(); };

/**
 * Creates a new placeholder.
 * @typeofeditors ["CPE"]
 * @memberof ApiInterface
 * @param {string} sType - The placeholder type ("body", "chart", "clipArt", "ctrTitle", "diagram", "date", "footer", "header", "media", "object", "picture", "sldImage", "sldNumber", "subTitle", "table", "title").
 * @returns {ApiPlaceholder}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreatePlaceholder.js
 */
ApiInterface.prototype.CreatePlaceholder = function(sType){ return new ApiPlaceholder(); };

/**
 * Creates a new presentation theme.
 * @typeofeditors ["CPE"]
 * @memberof ApiInterface
 * @param {string} sName - Theme name.
 * @param {ApiMaster} oMaster - Slide master. Required parameter.
 * @param {ApiThemeColorScheme} oClrScheme - Theme color scheme. Required parameter.
 * @param {ApiThemeFormatScheme} oFormatScheme - Theme format scheme. Required parameter.
 * @param {ApiThemeFontScheme} oFontScheme - Theme font scheme. Required parameter.
 * @returns {ApiTheme | null} 
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateTheme.js
 */
ApiInterface.prototype.CreateTheme = function(sName, oMaster, oClrScheme, oFormatScheme, oFontScheme){ return new ApiTheme(); };

/**
 * Creates a new theme color scheme.
 * @typeofeditors ["CPE"]
 * @memberof ApiInterface
 * @param {(ApiUniColor[] | ApiRGBColor[])} arrColors - Set of colors which are referred to as a color scheme.
 * The color scheme is responsible for defining a list of twelve colors.
 * The array should contain a sequence of colors: 2 dark, 2 light, 6 primary, a color for a hyperlink and a color for the followed hyperlink.
 * @param {string} sName - Theme color scheme name.
 * @returns {ApiThemeColorScheme}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateThemeColorScheme.js
 */
ApiInterface.prototype.CreateThemeColorScheme = function(arrColors, sName){ return new ApiThemeColorScheme(); };

/**
 * Creates a new theme format scheme.
 * @typeofeditors ["CPE"]
 * @memberof ApiInterface
 * @param {ApiFill[]} arrFill - This array contains the fill styles. It should be consist of subtle, moderate and intense fills.
 * @param {ApiFill[]} arrBgFill - This array contains the background fill styles. It should be consist of subtle, moderate and intense fills.
 * @param {ApiStroke[]} arrLine - This array contains the line styles. It should be consist of subtle, moderate and intense lines.
 * @param {string} sName - Theme format scheme name.
 * @returns {ApiThemeFormatScheme} 
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateThemeFormatScheme.js
 */
ApiInterface.prototype.CreateThemeFormatScheme = function(arrFill, arrBgFill, arrLine, sName){ return new ApiThemeFormatScheme(); };

/**
 * Creates a new theme font scheme.
 * @typeofeditors ["CPE"]
 * @memberof ApiInterface
 * @param {string} mjLatin - The major theme font applied to the latin text.
 * @param {string} mjEa - The major theme font applied to the east asian text.
 * @param {string} mjCs - The major theme font applied to the complex script text.
 * @param {string} mnLatin - The minor theme font applied to the latin text.
 * @param {string} mnEa - The minor theme font applied to the east asian text.
 * @param {string} mnCs - The minor theme font applied to the complex script text.
 * @param {string} sName - Theme font scheme name.
 * @returns {ApiThemeFontScheme}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateThemeFontScheme.js
 */
ApiInterface.prototype.CreateThemeFontScheme = function(mjLatin, mjEa, mjCs, mnLatin, mnEa, mnCs, sName){ return new ApiThemeFontScheme(); };

/**
 * Creates a new slide.
 * @typeofeditors ["CPE"]
 * @memberof ApiInterface
 * @returns {ApiSlide}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateSlide.js
 */
ApiInterface.prototype.CreateSlide = function(){ return new ApiSlide(); };

/**
 * Creates an image with the parameters specified.
 * @memberof ApiInterface
 * @typeofeditors ["CPE"]
 * @param {string} sImageSrc - The image source where the image to be inserted should be taken from (currently,
 * only internet URL or Base64 encoded images are supported).
 * @param {EMU} nWidth - The image width in English measure units.
 * @param {EMU} nHeight - The image height in English measure units.
 * @returns {ApiImage}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateImage.js
 */
ApiInterface.prototype.CreateImage = function(sImageSrc, nWidth, nHeight){ return new ApiImage(); };

/**
 * Creates an OLE object with the parameters specified.
 * @memberof ApiInterface
 * @typeofeditors ["CPE"]
 * @param {string} sImageSrc - The image source where the image to be inserted should be taken from (currently, only internet URL or Base64 encoded images are supported).
 * @param {EMU} nWidth - The OLE object width in English measure units.
 * @param {EMU} nHeight - The OLE object height in English measure units.
 * @param {string} sData - The OLE object string data.
 * @param {string} sAppId - The application ID associated with the current OLE object.
 * @returns {ApiOleObject}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateOleObject.js
 */
ApiInterface.prototype.CreateOleObject = function(sImageSrc, nWidth, nHeight, sData, sAppId){ return new ApiOleObject(); };

/**
 * Creates a shape with the parameters specified.
 * @memberof ApiInterface
 * @typeofeditors ["CPE"]
 * @param {ShapeType} [sType="rect"] - The shape type which specifies the preset shape geometry.
 * @param {EMU} [nWidth = 914400] - The shape width in English measure units.
 * @param {EMU} [nHeight = 914400] - The shape height in English measure units.
 * @param {ApiFill} [oFill    = Api.CreateNoFill()] - The color or pattern used to fill the shape.
 * @param {ApiStroke} [oStroke    = Api.CreateStroke(0, Api.CreateNoFill())] - The stroke used to create the element shadow.
 * @returns {ApiShape}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateShape.js
 */
ApiInterface.prototype.CreateShape = function(sType, nWidth, nHeight, oFill, oStroke){ return new ApiShape(); };

/**
 * Creates a chart with the parameters specified.
 * @memberof ApiInterface
 * @typeofeditors ["CPE"]
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
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateChart.js
 */
ApiInterface.prototype.CreateChart = function(sType, aSeries, aSeriesNames, aCatNames, nWidth, nHeight, nStyleIndex, aNumFormats){ return new ApiChart(); };

/**
 * Creates a group of drawings.
 * @memberof ApiInterface
 * @typeofeditors ["CPE"]
 * @param {DrawingForGroup[]} aDrawings - An array of drawings to group.
 * @returns {ApiGroup}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateGroup.js
 */
ApiInterface.prototype.CreateGroup = function(aDrawings) { return new ApiGroup(); };

/**
 * Creates a table.
 * @memberof ApiInterface
 * @typeofeditors ["CPE"]
 * @param nCols - Number of columns.
 * @param nRows - Number of rows.
 * @returns {ApiTable}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateTable.js
 */
ApiInterface.prototype.CreateTable = function(nCols, nRows){ return new ApiTable(); };

/**
 * Creates a new paragraph.
 * @memberof ApiInterface
 * @typeofeditors ["CPE"]
 * @returns {ApiParagraph}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateParagraph.js
 */
ApiInterface.prototype.CreateParagraph = function(){ return new ApiParagraph(); };

/**
 * Saves changes to the specified document.
 * @typeofeditors ["CPE"]
 * @memberof ApiInterface
 * @see office-js-api/Examples/{Editor}/Api/Methods/Save.js
 */
ApiInterface.prototype.Save = function () {};

/**
 * Creates a Text Art object with the parameters specified.
 * @memberof ApiInterface
 * @typeofeditors ["CPE"]
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
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateWordArt.js
 */
ApiInterface.prototype.CreateWordArt = function(oTextPr, sText, sTransform, oFill, oStroke, nRotAngle, nWidth, nHeight, nIndLeft, nIndTop) { return new ApiDrawing(); };

/**
 * Converts the specified JSON object into the Document Builder object of the corresponding type.
 * @memberof ApiInterface
 * @param {JSON} sMessage - The JSON object to convert.
 * @typeofeditors ["CPE"]
 * @see office-js-api/Examples/{Editor}/Api/Methods/FromJSON.js
 */
ApiInterface.prototype.FromJSON = function(sMessage){};

/**
 * Returns the selection from the current presentation.
 * @memberof ApiInterface
 * @typeofeditors ["CPE"]
 * @returns {ApiSelection}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/Api/Methods/GetSelection.js
 */
ApiInterface.prototype.GetSelection = function(){ return new ApiSelection(); };

/**
 * Subscribes to the specified event and calls the callback function when the event fires.
 * @function
 * @memberof ApiInterface
 * @typeofeditors ["CPE"]
 * @param {string} eventName - The event name.
 * @param {function} callback - Function to be called when the event fires.
 * @see office-js-api/Examples/{Editor}/Api/Methods/attachEvent.js
 */
ApiInterface.prototype["attachEvent"] = ApiInterface.prototype.attachEvent;{};

/**
 * Unsubscribes from the specified event.
 * @function
 * @memberof ApiInterface
 * @typeofeditors ["CPE"]
 * @param {string} eventName - The event name.
 * @see office-js-api/Examples/{Editor}/Api/Methods/detachEvent.js
 */
ApiInterface.prototype["detachEvent"] = ApiInterface.prototype.detachEvent;{};

/**
 * Returns a type of the ApiPresentation class.
 * @typeofeditors ["CPE"]
 * @returns {"presentation"}
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/GetClassType.js
 */
ApiPresentation.prototype.GetClassType = function(){ return ""; };

/**
 * Returns the index for the current slide.
 * @typeofeditors ["CPE"]
 * @memberof ApiPresentation
 * @returns {number}
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/GetCurSlideIndex.js
 */
ApiPresentation.prototype.GetCurSlideIndex = function(){ return 0; };

/**
 * Returns a slide by its position in the presentation.
 * @memberof ApiPresentation
 * @typeofeditors ["CPE"]
 * @param {number} nIndex - The slide number (position) in the presentation.
 * @returns {ApiSlide}
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/GetSlideByIndex.js
 */
ApiPresentation.prototype.GetSlideByIndex = function(nIndex){ return new ApiSlide(); };

/**
 * Returns the current slide.
 * @typeofeditors ["CPE"]
 * @memberof ApiPresentation
 * @returns {ApiSlide}
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/GetCurrentSlide.js
 */
ApiPresentation.prototype.GetCurrentSlide = function () { return new ApiSlide(); };

/**
 * Returns the current visible slide.
 * @typeofeditors ["CPE"]
 * @memberof ApiPresentation
 * @returns {ApiSlide | null} - Returns null if the current slide is not found or not visible.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/GetCurrentVisibleSlide.js
 */
ApiPresentation.prototype.GetCurrentVisibleSlide = function () { return new ApiSlide(); };

/**
 * Appends a new slide to the end of the presentation.
 * @typeofeditors ["CPE"]
 * @memberof ApiPresentation
 * @param {ApiSlide} oSlide - The slide created using the {@link Api#CreateSlide} method.
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/AddSlide.js
 */
ApiPresentation.prototype.AddSlide = function(oSlide) {};

/**
 * Sets the size to the current presentation.
 * @typeofeditors ["CPE"]
 * @memberof ApiPresentation
 * @param {EMU} nWidth - The presentation width in English measure units.
 * @param {EMU} nHeight - The presentation height in English measure units.
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/SetSizes.js
 */
ApiPresentation.prototype.SetSizes = function(nWidth, nHeight) {};

/**
 * Creates a new history point.
 * @typeofeditors ["CPE"]
 * @memberof ApiPresentation
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/CreateNewHistoryPoint.js
 */
ApiPresentation.prototype.CreateNewHistoryPoint = function(){};

/**
 * Replaces the current image with an image specified.
 * @typeofeditors ["CPE"]
 * @memberof ApiPresentation
 * @param {string} sImageUrl - The image source where the image to be inserted should be taken from (currently, only internet URL or Base64 encoded images are supported).
 * @param {EMU} Width - The image width in English measure units.
 * @param {EMU} Height - The image height in English measure units.
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/ReplaceCurrentImage.js
 */
ApiPresentation.prototype.ReplaceCurrentImage = function(sImageUrl, Width, Height){};

/**
 * Specifies the languages which will be used to check spelling and grammar (if requested).
 * @memberof ApiPresentation
 * @typeofeditors ["CPE"]
 * @param {string} sLangId - The possible value for this parameter is a language identifier as defined by
 * RFC 4646/BCP 47. Example: "en-CA".
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/SetLanguage.js
 */
ApiPresentation.prototype.SetLanguage = function(sLangId){ return true; };

/**
 * Returns a number of slides.
 * @typeofeditors ["CPE"]
 * @returns {number}
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/GetSlidesCount.js
 */
ApiPresentation.prototype.GetSlidesCount = function(){ return 0; };

/**
 * Returns an array of all slides from the current presentation.
 * @typeofeditors ["CPE"]
 * @returns {ApiSlide[]}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/GetAllSlides.js
 */
ApiPresentation.prototype.GetAllSlides = function(){ return [new ApiSlide()]; };

/**
 * Returns a number of slide masters.
 * @typeofeditors ["CPE"]
 * @returns {number}
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/GetMastersCount.js
 */
ApiPresentation.prototype.GetMastersCount = function(){ return 0; };

/**
 * Returns an array of all slide masters from the current presentation.
 * @typeofeditors ["CPE"]
 * @returns {ApiMaster[]}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/GetAllSlideMasters.js
 */
ApiPresentation.prototype.GetAllSlideMasters = function(){ return [new ApiMaster()]; };

/**
 * Returns a slide master by its position in the presentation.
 * @typeofeditors ["CPE"]
 * @param {number} nPos - Slide master position in the presentation
 * @returns {ApiMaster | null} - returns null if position is invalid.
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/GetMaster.js
 */
ApiPresentation.prototype.GetMaster = function(nPos){ return new ApiMaster(); };

/**
 * Adds the slide master to the presentation slide masters collection.
 * @typeofeditors ["CPE"]
 * @param {number} [nPos    = ApiPresentation.GetMastersCount()]
 * @param {ApiMaster} oApiMaster - The slide master to be added.
 * @returns {boolean} - return false if position is invalid or oApiMaster doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/AddMaster.js
 */
ApiPresentation.prototype.AddMaster = function(nPos, oApiMaster){ return true; };

/**
 * Applies a theme to all the slides in the presentation.
 * @typeofeditors ["CPE"]
 * @param {ApiTheme} oApiTheme - The presentation theme.
 * @returns {boolean} - returns false if param isn't theme or presentation doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/ApplyTheme.js
 */
ApiPresentation.prototype.ApplyTheme = function(oApiTheme){ return true; };

/**
 * Removes a range of slides from the presentation.
 * Deletes all the slides from the presentation if no parameters are specified.
 * @memberof ApiPresentation
 * @param {Number} [nStart=0] - The starting position for the deletion range.
 * @param {Number} [nCount=ApiPresentation.GetSlidesCount()] - The number of slides to delete.
 * @typeofeditors ["CPE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/RemoveSlides.js
 */
ApiPresentation.prototype.RemoveSlides = function(nStart, nCount){ return true; };

/**
 * Returns the presentation width in English measure units.
 * @typeofeditors ["CPE"]
 * @memberof ApiPresentation
 * @returns {EMU}
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/GetWidth.js
 */
ApiPresentation.prototype.GetWidth = function() { return new EMU(); };

/**
 * Returns the presentation height in English measure units.
 * @typeofeditors ["CPE"]
 * @memberof ApiPresentation
 * @returns {EMU}
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/GetHeight.js
 */
ApiPresentation.prototype.GetHeight = function() { return new EMU(); };

/**
 * Converts the ApiPresentation object into the JSON object.
 * @memberof ApiPresentation
 * @typeofeditors ["CPE"]
 * @param {boolean} [bWriteTableStyles=false] - Specifies whether to write used table styles to the JSON object (true) or not (false).
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/ToJSON.js
 */
ApiPresentation.prototype.ToJSON = function(bWriteTableStyles){ return new JSON(); };

/**
 * Converts the slides from the current ApiPresentation object into the JSON objects.
 * @memberof ApiPresentation
 * @typeofeditors ["CPE"]
 * @param {boolean} [nStart=0] - The index to the start slide.
 * @param {boolean} [nStart=ApiPresentation.GetSlidesCount() - 1] - The index to the end slide.
 * @param {boolean} [bWriteLayout=false] - Specifies if the slide layout will be written to the JSON object or not.
 * @param {boolean} [bWriteMaster=false] - Specifies if the slide master will be written to the JSON object or not (bWriteMaster is false if bWriteLayout === false).
 * @param {boolean} [bWriteAllMasLayouts=false] - Specifies if all child layouts from the slide master will be written to the JSON object or not.
 * @param {boolean} [bWriteTableStyles=false] - Specifies whether to write used table styles to the JSON object (true) or not (false).
 * @returns {JSON[]}
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/SlidesToJSON.js
 */
ApiPresentation.prototype.SlidesToJSON = function(nStart, nEnd, bWriteLayout, bWriteMaster, bWriteAllMasLayouts, bWriteTableStyles){ return [new JSON()]; };

/**
 * Returns all comments from the current presentation.
 * @memberof ApiPresentation
 * @typeofeditors ["CPE"]
 * @returns {ApiComment[]}
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/GetAllComments.js
 */
ApiPresentation.prototype.GetAllComments = function(){ return [new ApiComment()]; };

/**
 * Private method to collect all objects of a specific type from the presentation (OleObjects, Charts, Shapes, Images).
 * Calls 'getObjectsMethod' method on each slide, master and layout to get the objects.
 */
ApiPresentation.prototype._collectAllObjects = function (getObjectsMethod) {};

/**
 * Returns an array with all the OLE objects from the current presentation.
 * @memberof ApiPresentation
 * @typeofeditors ["CPE"]
 * @returns {ApiOleObject[]}
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/GetAllOleObjects.js
 */
ApiPresentation.prototype.GetAllOleObjects = function () { return [new ApiOleObject()]; };

/**
 * Returns an array with all the chart objects from the current presentation.
 * @memberof ApiPresentation
 * @typeofeditors ["CPE"]
 * @returns {ApiChart[]}
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/GetAllCharts.js
 */
ApiPresentation.prototype.GetAllCharts = function () { return [new ApiChart()]; };

/**
 * Returns an array with all the shape objects from the current presentation.
 * @memberof ApiPresentation
 * @typeofeditors ["CPE"]
 * @returns {ApiShape[]}
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/GetAllShapes.js
 */
ApiPresentation.prototype.GetAllShapes = function () { return [new ApiShape()]; };

/**
 * Returns an array with all the image objects from the current presentation.
 * @memberof ApiPresentation
 * @typeofeditors ["CPE"]
 * @returns {ApiImage[]}
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/GetAllImages.js
 */
ApiPresentation.prototype.GetAllImages = function () { return [new ApiImage()]; };

/**
 * Returns an array with all the drawing objects from the current presentation.
 * @memberof ApiPresentation
 * @typeofeditors ["CPE"]
 * @returns {Drawing[]}
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/GetAllDrawings.js
 */
ApiPresentation.prototype.GetAllDrawings = function () { return [new Drawing()]; };

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
 * @typeofeditors ["CPE"]
 * @returns {object}
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/GetDocumentInfo.js
 */
ApiPresentation.prototype.GetDocumentInfo = function(){ return new object(); };

/**
 * Returns the core properties interface for the current presentation.
 * This method is used to view or modify standard metadata such as title, author, and keywords.
 * @memberof ApiPresentation
 * @returns {ApiCore}
 * @typeofeditors ["CPE"]
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/GetCore.js
 */
ApiPresentation.prototype.GetCore = function () { return new ApiCore(); };

/**
 * Returns the custom properties from the current presentation.
 * @memberof ApiPresentation
 * @returns {ApiCustomProperties}
 * @typeofeditors ["CPE"]
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/GetCustomProperties.js
 */
ApiPresentation.prototype.GetCustomProperties = function () { return new ApiCustomProperties(); };

/**
* Adds a math equation to the current presentation.
* @memberof ApiPresentation
* @typeofeditors ["CPE"]
* @param {string} sText - The math equation text.
* @param {string} sFormat - The math equation format. Possible values are "unicode" and "latex".
* @returns {boolean}
* @since 9.0.0
* @see office-js-api/Examples/{Editor}/ApiPresentation/Methods/AddMathEquation.js
*/
ApiPresentation.prototype.AddMathEquation = function (sText, sFormat) { return true; };

/**
 * Returns the type of the ApiMaster class.
 * @typeofeditors ["CPE"]
 * @returns {"master"}
 * @see office-js-api/Examples/{Editor}/ApiMaster/Methods/GetClassType.js
 */
ApiMaster.prototype.GetClassType = function(){ return ""; };

/**
 * Returns all layouts from the slide master.
 * @typeofeditors ["CPE"]
 * @returns {ApiLayout[]} - Returns an empty array if the slide master doesn't have layouts.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiMaster/Methods/GetAllLayouts.js
 */
ApiMaster.prototype.GetAllLayouts = function () { return [new ApiLayout()]; };

/**
 * Returns a layout of the specified slide master by its position.
 * @typeofeditors ["CPE"]
 * @param {number} nPos - Layout position.
 * @returns {ApiLayout | null} - returns null if position is invalid.
 * @see office-js-api/Examples/{Editor}/ApiMaster/Methods/GetLayout.js
 */
ApiMaster.prototype.GetLayout = function(nPos){ return new ApiLayout(); };

/**
 * Adds a layout to the specified slide master.
 * @typeofeditors ["CPE"]
 * @param {number} [nPos = ApiMaster.GetLayoutsCount()] - Position where a layout will be added.
 * @param {ApiLayout} oLayout - A layout to be added.
 * @returns {boolean} - returns false if oLayout isn't a layout.
 * @see office-js-api/Examples/{Editor}/ApiMaster/Methods/AddLayout.js
 */
ApiMaster.prototype.AddLayout = function(nPos, oLayout){ return true; };

/**
 * Removes the layouts from the current slide master.
 * @typeofeditors ["CPE"]
 * @param {number} nPos - Position from which a layout will be deleted.
 * @param {number} [nCount = 1] - Number of layouts to delete.
 * @returns {boolean} - return false if position is invalid.
 * @see office-js-api/Examples/{Editor}/ApiMaster/Methods/RemoveLayout.js
 */
ApiMaster.prototype.RemoveLayout = function(nPos, nCount){ return true; };

/**
 * Returns a number of layout objects.
 * @typeofeditors ["CPE"]
 * @returns {number}
 * @see office-js-api/Examples/{Editor}/ApiMaster/Methods/GetLayoutsCount.js
 */
ApiMaster.prototype.GetLayoutsCount = function(){ return 0; };

/**
 * Adds an object (image, shape or chart) to the current slide master.
 * @typeofeditors ["CPE"]
 * @memberof ApiMaster
 * @param {ApiDrawing} oDrawing - The object which will be added to the current slide master.
 * @returns {boolean} - returns false if slide master doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiMaster/Methods/AddObject.js
 */
ApiMaster.prototype.AddObject = function(oDrawing){ return true; };

/**
 * Removes objects (image, shape or chart) from the current slide master.
 * @typeofeditors ["CPE"]
 * @memberof ApiMaster
 * @param {number} nPos - Position from which the object will be deleted.
 * @param {number} [nCount = 1] - Number of objects to delete.
 * @returns {boolean} - returns false if master doesn't exist or position is invalid or master hasn't objects.
 * @see office-js-api/Examples/{Editor}/ApiMaster/Methods/RemoveObject.js
 */
ApiMaster.prototype.RemoveObject = function(nPos, nCount){ return true; };

/**
 * Sets the background to the current slide master.
 * @memberOf ApiMaster
 * @typeofeditors ["CPE"]
 * @param {ApiFill} oApiFill - The color or pattern used to fill the presentation slide master background.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiMaster/Methods/SetBackground.js
 */
ApiMaster.prototype.SetBackground = function(oApiFill){ return true; };

/**
 * Clears the slide master background.
 * @typeofeditors ["CPE"]
 * @returns {boolean} - return false if slide master doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiMaster/Methods/ClearBackground.js
 */
ApiMaster.prototype.ClearBackground = function(){ return true; };

/**
 * Creates a copy of the specified slide master object.
 * @typeofeditors ["CPE"]
 * @returns {ApiMaster | null} - returns new ApiMaster object that represents the copy of slide master. 
 * Returns null if slide doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiMaster/Methods/Copy.js
 */
ApiMaster.prototype.Copy = function(){ return new ApiMaster(); };

/**
 * Creates a duplicate of the specified slide master object, adds the new slide master to the slide masters collection.
 * @typeofeditors ["CPE"]
 * @param {number} [nPos    = ApiPresentation.GetMastersCount()] - Position where the new slide master will be added.
 * @returns {ApiMaster | null} - returns new ApiMaster object that represents the copy of slide master. 
 * Returns null if slide master doesn't exist or is not in the presentation.
 * @see office-js-api/Examples/{Editor}/ApiMaster/Methods/Duplicate.js
 */
ApiMaster.prototype.Duplicate = function(nPos){ return new ApiMaster(); };

/**
 * Deletes the specified object from the parent if it exists.
 * @typeofeditors ["CPE"]
 * @returns {boolean} - return false if master doesn't exist or is not in the presentation.
 * @see office-js-api/Examples/{Editor}/ApiMaster/Methods/Delete.js
 */
ApiMaster.prototype.Delete = function(){ return true; };

/**
 * Returns a theme of the slide master.
 * @typeofeditors ["CPE"]
 * @returns {ApiTheme | null} - returns null if theme doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiMaster/Methods/GetTheme.js
 */
ApiMaster.prototype.GetTheme = function(){ return new ApiTheme(); };

/**
 * Sets a theme to the slide master.
 * Sets a copy of the theme object.
 * @typeofeditors ["CPE"]
 * @param {ApiTheme} oTheme - Presentation theme.
 * @returns {boolean} - return false if oTheme isn't a theme or slide master doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiMaster/Methods/SetTheme.js
 */
ApiMaster.prototype.SetTheme = function(oTheme){ return true; };

/**
 * Returns an array with all the drawing objects from the slide master.
 * @typeofeditors ["CPE"]
 * @returns {Drawing[]}
 * @see office-js-api/Examples/{Editor}/ApiMaster/Methods/GetAllDrawings.js
 */
ApiMaster.prototype.GetAllDrawings = function(){ return [new Drawing()]; };

/**
 * Returns an array with all the shape objects from the slide master.
 * @typeofeditors ["CPE"]
 * @returns {ApiShape[]}
 * @see office-js-api/Examples/{Editor}/ApiMaster/Methods/GetAllShapes.js
 */
ApiMaster.prototype.GetAllShapes = function(){ return [new ApiShape()]; };

/**
 * Returns an array with all the image objects from the slide master.
 * @typeofeditors ["CPE"]
 * @returns {ApiImage[]}
 * @see office-js-api/Examples/{Editor}/ApiMaster/Methods/GetAllImages.js
 */
ApiMaster.prototype.GetAllImages = function(){ return [new ApiImage()]; };

/**
 * Returns an array with all the chart objects from the slide master.
 * @typeofeditors ["CPE"]
 * @returns {ApiChart[]}
 * @see office-js-api/Examples/{Editor}/ApiMaster/Methods/GetAllCharts.js
 */
ApiMaster.prototype.GetAllCharts = function() { return [new ApiChart()]; };

/**
 * Returns an array with all the OLE objects from the slide master.
 * @typeofeditors ["CPE"]
 * @returns {ApiOleObject[]}
 * @see office-js-api/Examples/{Editor}/ApiMaster/Methods/GetAllOleObjects.js
 */
ApiMaster.prototype.GetAllOleObjects = function() { return [new ApiOleObject()]; };

/**
 * Converts the ApiMaster object into the JSON object.
 * @memberof ApiMaster
 * @typeofeditors ["CPE"]
 * @param {boolean} [bWriteTableStyles=false] - Specifies whether to write used table styles to the JSON object (true) or not (false).
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiMaster/Methods/ToJSON.js
 */
ApiMaster.prototype.ToJSON = function(bWriteTableStyles){ return new JSON(); };

/**
 * Returns an array of drawings by the specified placeholder type.
 * @memberof ApiMaster
 * @typeofeditors ["CPE"]
 * @param {PlaceholderType} sType - The placeholder type.
 * @returns {Drawing[]}
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiMaster/Methods/GetDrawingsByPlaceholderType.js
 */
ApiMaster.prototype.GetDrawingsByPlaceholderType = function(sType) { return [new Drawing()]; };

/**
 * Groups an array of drawings in the current slide master.
 * @memberof ApiMaster
 * @typeofeditors ["CPE"]
 * @param {DrawingForGroup[]} aDrawings - An array of drawings to group.
 * @returns {ApiGroup}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiMaster/Methods/GroupDrawings.js
 */
ApiMaster.prototype.GroupDrawings = function(aDrawings){ return new ApiGroup(); };

/**
 * Returns the type of the ApiLayout class.
 * @typeofeditors ["CPE"]
 * @returns {"layout"}
 * @see office-js-api/Examples/{Editor}/ApiLayout/Methods/GetClassType.js
 */
ApiLayout.prototype.GetClassType = function(){ return ""; };

/**
 * Sets a name to the current layout.
 * @typeofeditors ["CPE"]
 * @param {string} sName - Layout name to be set.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiLayout/Methods/SetName.js
 */
ApiLayout.prototype.SetName = function(sName){ return true; };

/**
 * Returns a name of the current layout.
 * @typeofeditors ["CPE"]
 * @returns {string}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiLayout/Methods/GetName.js
 */
ApiLayout.prototype.GetName = function(){ return ""; };

/**
 * Adds an object (image, shape or chart) to the current slide layout.
 * @typeofeditors ["CPE"]
 * @memberof ApiLayout
 * @param {ApiDrawing} oDrawing - The object which will be added to the current slide layout.
 * @returns {boolean} - returns false if slide layout doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiLayout/Methods/AddObject.js
 */
ApiLayout.prototype.AddObject = function(oDrawing){ return true; };

/**
 * Removes objects (image, shape or chart) from the current slide layout.
 * @typeofeditors ["CPE"]
 * @memberof ApiLayout
 * @param {number} nPos - Position from which the object will be deleted.
 * @param {number} [nCount = 1] - The number of elements to delete.
 * @returns {boolean} - returns false if layout doesn't exist or position is invalid or layout hasn't objects.
 * @see office-js-api/Examples/{Editor}/ApiLayout/Methods/RemoveObject.js
 */
ApiLayout.prototype.RemoveObject = function(nPos, nCount){ return true; };

/**
 * Sets the background to the current slide layout.
 * @memberOf ApiLayout
 * @typeofeditors ["CPE"]
 * @param {ApiFill} oApiFill - The color or pattern used to fill the presentation slide layout background.\
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiLayout/Methods/SetBackground.js
 */
ApiLayout.prototype.SetBackground = function(oApiFill){ return true; };

/**
 * Clears the slide layout background.
 * @typeofeditors ["CPE"]
 * @returns {boolean} - return false if slide layout doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiLayout/Methods/ClearBackground.js
 */
ApiLayout.prototype.ClearBackground = function(){ return true; };

/**
 * Sets the master background as the background of the layout.
 * @typeofeditors ["CPE"]
 * @returns {boolean} - returns false if master is null or master hasn't background.
 * @see office-js-api/Examples/{Editor}/ApiLayout/Methods/FollowMasterBackground.js
 */
ApiLayout.prototype.FollowMasterBackground = function(){ return true; };

/**
 * Creates a copy of the specified slide layout object.
 * Copies without master slide.
 * @typeofeditors ["CPE"]
 * @returns {ApiLayout | null} - returns new ApiLayout object that represents the copy of slide layout. 
 * Returns null if slide layout doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiLayout/Methods/Copy.js
 */
ApiLayout.prototype.Copy = function(){ return new ApiLayout(); };

/**
 * Deletes the specified object from the parent slide master if it exists.
 * @typeofeditors ["CPE"]
 * @returns {boolean} - return false if parent slide master doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiLayout/Methods/Delete.js
 */
ApiLayout.prototype.Delete = function(){ return true; };

/**
 * Creates a duplicate of the specified slide layout object, adds the new slide layout to the slide layout collection.
 * @typeofeditors ["CPE"]
 * @param {number} [nPos = ApiMaster.GetLayoutsCount()] - Position where the new slide layout will be added.
 * @returns {ApiLayout | null} - returns new ApiLayout object that represents the copy of slide layout. 
 * Returns null if slide layout doesn't exist or is not in the slide master.
 * @see office-js-api/Examples/{Editor}/ApiLayout/Methods/Duplicate.js
 */
ApiLayout.prototype.Duplicate = function(nPos){ return new ApiLayout(); };

/**
 * Moves the specified layout to a specific location within the same collection.
 * @typeofeditors ["CPE"]
 * @param {number} nPos - Position where the specified slide layout will be moved to.
 * @returns {boolean} - returns false if layout or parent slide master doesn't exist or position is invalid.
 * @see office-js-api/Examples/{Editor}/ApiLayout/Methods/MoveTo.js
 */
ApiLayout.prototype.MoveTo = function(nPos){ return true; };

/**
 * Returns an array with all the drawing objects from the slide layout.
 * @typeofeditors ["CPE"]
 * @returns {Drawing[]}
 * @see office-js-api/Examples/{Editor}/ApiLayout/Methods/GetAllDrawings.js
 */
ApiLayout.prototype.GetAllDrawings = function(){ return [new Drawing()]; };

/**
 * Returns an array with all the shape objects from the slide layout.
 * @typeofeditors ["CPE"]
 * @returns {ApiShape[]}
 * @see office-js-api/Examples/{Editor}/ApiLayout/Methods/GetAllShapes.js
 */
ApiLayout.prototype.GetAllShapes = function(){ return [new ApiShape()]; };

/**
 * Returns an array with all the image objects from the slide layout.
 * @typeofeditors ["CPE"]
 * @returns {ApiImage[]}
 * @see office-js-api/Examples/{Editor}/ApiLayout/Methods/GetAllImages.js
 */
ApiLayout.prototype.GetAllImages = function(){ return [new ApiImage()]; };

/**
 * Returns an array with all the chart objects from the slide layout.
 * @typeofeditors ["CPE"]
 * @returns {ApiChart[]}
 * @see office-js-api/Examples/{Editor}/ApiLayout/Methods/GetAllCharts.js
 */
ApiLayout.prototype.GetAllCharts = function() { return [new ApiChart()]; };

/**
 * Returns an array with all the OLE objects from the slide layout.
 * @typeofeditors ["CPE"]
 * @returns {ApiOleObject[]}
 * @see office-js-api/Examples/{Editor}/ApiLayout/Methods/GetAllOleObjects.js
 */
ApiLayout.prototype.GetAllOleObjects = function(){ return [new ApiOleObject()]; };

/**
 * Returns the parent slide master of the current layout.
 * @typeofeditors ["CPE"]
 * @returns {ApiMaster} - returns null if parent slide master doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiLayout/Methods/GetMaster.js
 */
ApiLayout.prototype.GetMaster = function(){ return new ApiMaster(); };

/**
 * Converts the ApiLayout object into the JSON object.
 * @memberof ApiLayout
 * @typeofeditors ["CPE"]
 * @param {boolean} [bWriteMaster=false] - Specifies if the slide master will be written to the JSON object or not.
 * @param {boolean} [bWriteTableStyles=false] - Specifies whether to write used table styles to the JSON object (true) or not (false).
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiLayout/Methods/ToJSON.js
 */
ApiLayout.prototype.ToJSON = function(bWriteMaster, bWriteTableStyles){ return new JSON(); };

/**
 * Returns an array of drawings by the specified placeholder type.
 * @memberof ApiLayout
 * @typeofeditors ["CPE"]
 * @param {PlaceholderType} sType - The placeholder type.
 * @returns {Drawing[]}
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiLayout/Methods/GetDrawingsByPlaceholderType.js
 */
ApiLayout.prototype.GetDrawingsByPlaceholderType = function(sType) { return [new Drawing()]; };

/**
 * Groups an array of drawings in the current layout.
 * @memberof ApiLayout
 * @typeofeditors ["CPE"]
 * @param {DrawingForGroup[]} aDrawings - An array of drawings to group.
 * @returns {ApiGroup}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiLayout/Methods/GroupDrawings.js
 */
ApiLayout.prototype.GroupDrawings = function(aDrawings){ return new ApiGroup(); };

/**
 * Returns the type of the ApiPlaceholder class.
 * @typeofeditors ["CPE"]
 * @returns {"placeholder"}
 * @see office-js-api/Examples/{Editor}/ApiPlaceholder/Methods/GetClassType.js
 */
ApiPlaceholder.prototype.GetClassType = function(){ return ""; };

/**
 * Sets the placeholder type.
 * @typeofeditors ["CPE"]
 * @param {PlaceholderType} sType - Placeholder type
 * @returns {boolean} - returns false if placeholder type doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiPlaceholder/Methods/SetType.js
 */
ApiPlaceholder.prototype.SetType = function(sType){ return true; };

/**
 * Returns the placeholder type.
 * @typeofeditors ["CPE"]
 * @returns {PlaceholderType} - Returns the placeholder type.
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiPlaceholder/Methods/GetType.js
 */
ApiPlaceholder.prototype.GetType = function(){ return new PlaceholderType(); };

/**
 * Returns the placeholder type.
 * @typeofeditors ["CPE"]
 * @returns {PlaceholderType} - Returns the placeholder type.
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiPlaceholder/Methods/GetType.js
 */
ApiPlaceholder.prototype.Type = ApiPlaceholder.prototype.GetType ();

/**
 * Sets the placeholder index.
 * @typeofeditors ["CPE"]
 * @param {number} nIdx - The placeholder index.
 * @returns {boolean} - Returns false if the placeholder index wasn't set.
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiPlaceholder/Methods/SetIndex.js
 */
ApiPlaceholder.prototype.SetIndex = function(nIdx){ return true; };

/**
 * Retuns the placeholder index.
 * @typeofeditors ["CPE"]
 * @returns {number | undefined} - Returns the placeholder index.
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiPlaceholder/Methods/GetIndex.js
 */
ApiPlaceholder.prototype.GetIndex = function(){ return 0; };

/**
 * Retuns the placeholder index.
 * @typeofeditors ["CPE"]
 * @returns {number | undefined} - Returns the placeholder index.
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiPlaceholder/Methods/GetIndex.js
 */
ApiPlaceholder.prototype.Index = ApiPlaceholder.prototype.GetIndex ();

/**
 * Returns the type of the ApiTheme class.
 * @typeofeditors ["CPE"]
 * @returns {"theme"}
 * @see office-js-api/Examples/{Editor}/ApiTheme/Methods/GetClassType.js
 */
ApiTheme.prototype.GetClassType = function(){ return ""; };

/**
 * Returns the slide master of the current theme.
 * @typeofeditors ["CPE"]
 * @returns {ApiMaster | null} - returns null if slide master doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiTheme/Methods/GetMaster.js
 */
ApiTheme.prototype.GetMaster = function(){ return new ApiMaster(); };

/**
 * Sets the color scheme to the current presentation theme.
 * @typeofeditors ["CPE"]
 * @param {ApiThemeColorScheme} oApiColorScheme - Theme color scheme.
 * @returns {boolean} - return false if color scheme doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiTheme/Methods/SetColorScheme.js
 */
ApiTheme.prototype.SetColorScheme = function(oApiColorScheme){ return true; };

/**
 * Returns the color scheme of the current theme.
 * @typeofeditors ["CPE"]
 * @returns {ApiThemeColorScheme}
 * @see office-js-api/Examples/{Editor}/ApiTheme/Methods/GetColorScheme.js
 */
ApiTheme.prototype.GetColorScheme = function(){ return new ApiThemeColorScheme(); };

/**
 * Sets the format scheme to the current presentation theme.
 * @typeofeditors ["CPE"]
 * @param {ApiThemeFormatScheme} oApiFormatScheme - Theme format scheme.
 * @returns {boolean} - return false if format scheme doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiTheme/Methods/SetFormatScheme.js
 */
ApiTheme.prototype.SetFormatScheme = function(oApiFormatScheme){ return true; };

/**
 * Returns the format scheme of the current theme.
 * @typeofeditors ["CPE"]
 * @returns {ApiThemeFormatScheme}
 * @see office-js-api/Examples/{Editor}/ApiTheme/Methods/GetFormatScheme.js
 */
ApiTheme.prototype.GetFormatScheme = function(){ return new ApiThemeFormatScheme(); };

/**
 * Sets the font scheme to the current presentation theme.
 * @typeofeditors ["CPE"]
 * @param {ApiThemeFontScheme} oApiFontScheme - Theme font scheme.
 * @returns {boolean} - return false if font scheme doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiTheme/Methods/SetFontScheme.js
 */
ApiTheme.prototype.SetFontScheme = function(oApiFontScheme){ return true; };

/**
 * Returns the font scheme of the current theme.
 * @typeofeditors ["CPE"]
 * @returns {ApiThemeFontScheme}
 * @see office-js-api/Examples/{Editor}/ApiTheme/Methods/GetFontScheme.js
 */
ApiTheme.prototype.GetFontScheme = function(){ return new ApiThemeFontScheme(); };

/**
 * Returns the type of the ApiThemeColorScheme class.
 * @typeofeditors ["CPE"]
 * @returns {"themeColorScheme"}
 * @see office-js-api/Examples/{Editor}/ApiThemeColorScheme/Methods/GetClassType.js
 */
ApiThemeColorScheme.prototype.GetClassType = function(){ return ""; };

/**
 * Sets a name to the current theme color scheme.
 * @typeofeditors ["CPE"]
 * @param {string} sName - Theme color scheme name.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiThemeColorScheme/Methods/SetSchemeName.js
 */
ApiThemeColorScheme.prototype.SetSchemeName = function(sName){ return true; };

/**
 * Changes a color in the theme color scheme.
 * @typeofeditors ["CPE"]
 * @param {number} nPos - Color position in the color scheme which will be changed.
 * @param {ApiUniColor | ApiRGBColor} oColor - New color of the theme color scheme.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiThemeColorScheme/Methods/ChangeColor.js
 */
ApiThemeColorScheme.prototype.ChangeColor = function(nPos, oColor){ return true; };

/**
 * Creates a copy of the current theme color scheme.
 * @typeofeditors ["CPE"]
 * @returns {ApiThemeColorScheme}
 * @see office-js-api/Examples/{Editor}/ApiThemeColorScheme/Methods/Copy.js
 */
ApiThemeColorScheme.prototype.Copy = function(){ return new ApiThemeColorScheme(); };

/**
 * Converts the ApiThemeColorScheme object into the JSON object.
 * @memberof ApiThemeColorScheme
 * @typeofeditors ["CPE"]
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiThemeColorScheme/Methods/ToJSON.js
 */
ApiThemeColorScheme.prototype.ToJSON = function(){ return new JSON(); };

/**
 * Returns the type of the ApiThemeFormatScheme class.
 * @typeofeditors ["CPE"]
 * @returns {"themeFormatScheme"}
 * @see office-js-api/Examples/{Editor}/ApiThemeFormatScheme/Methods/GetClassType.js
 */
ApiThemeFormatScheme.prototype.GetClassType = function(){ return ""; };

/**
 * Sets a name to the current theme format scheme.
 * @typeofeditors ["CPE"]
 * @param {string} sName - Theme format scheme name.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiThemeFormatScheme/Methods/SetSchemeName.js
 */
ApiThemeFormatScheme.prototype.SetSchemeName = function(sName){ return true; };

/**
 * Sets the fill styles to the current theme format scheme.
 * @typeofeditors ["CPE"]
 * @param {ApiFill[]} arrFill - The array of fill styles must contain 3 elements - subtle, moderate and intense fills.
 * If an array is empty or NoFill elements are in the array, it will be filled with the Api.CreateNoFill() elements.
 * @see office-js-api/Examples/{Editor}/ApiThemeFormatScheme/Methods/ChangeFillStyles.js
 */
ApiThemeFormatScheme.prototype.ChangeFillStyles = function(arrFill){};

/**
 * Sets the background fill styles to the current theme format scheme.
 * @typeofeditors ["CPE"]
 * @param {ApiFill[]} arrBgFill - The array of background fill styles must contains 3 elements - subtle, moderate and intense fills.
 * If an array is empty or NoFill elements are in the array, it will be filled with the Api.CreateNoFill() elements.
 * @see office-js-api/Examples/{Editor}/ApiThemeFormatScheme/Methods/ChangeBgFillStyles.js
 */
ApiThemeFormatScheme.prototype.ChangeBgFillStyles = function(arrBgFill){};

/**
 * Sets the line styles to the current theme format scheme.
 * @typeofeditors ["CPE"]
 * @param {ApiStroke[]} arrLine - The array of line styles must contain 3 elements - subtle, moderate and intense fills.
 * If an array is empty or ApiStroke elements are with no fill, it will be filled with the Api.CreateStroke(0, Api.CreateNoFill()) elements.
 * @see office-js-api/Examples/{Editor}/ApiThemeFormatScheme/Methods/ChangeLineStyles.js
 */
ApiThemeFormatScheme.prototype.ChangeLineStyles = function(arrLine){};

/**
//  * **Need to do**
//  * Sets the effect styles to the current theme format scheme.
//  * @typeofeditors ["CPE"]
//  * @param {?Array} arrEffect - The array of effect styles must contain 3 elements - subtle, moderate and intense fills.
//  * If an array is empty or NoFill elements are in the array, it will be filled with the Api.CreateStroke(0, Api.CreateNoFill()) elements.
//  * @returns {boolean}
//  * @see office-js-api/Examples/{Editor}/ApiThemeFormatScheme/Methods/ChangeEffectStyles.js
//  */
// ApiThemeFormatScheme.prototype.ChangeEffectStyles = function(arrEffect){ return true; };

/**
 * Creates a copy of the current theme format scheme.
 * @typeofeditors ["CPE"]
 * @returns {ApiThemeFormatScheme}
 * @see office-js-api/Examples/{Editor}/ApiThemeFormatScheme/Methods/Copy.js
 */
ApiThemeFormatScheme.prototype.Copy = function(){ return new ApiThemeFormatScheme(); };

/**
 * Converts the ApiThemeFormatScheme object into the JSON object.
 * @memberof ApiThemeFormatScheme
 * @typeofeditors ["CPE"]
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiThemeFormatScheme/Methods/ToJSON.js
 */
ApiThemeFormatScheme.prototype.ToJSON = function(){ return new JSON(); };

/**
 * Returns the type of the ApiThemeFontScheme class.
 * @typeofeditors ["CPE"]
 * @returns {"themeFontScheme"}
 * @see office-js-api/Examples/{Editor}/ApiThemeFontScheme/Methods/GetClassType.js
 */
ApiThemeFontScheme.prototype.GetClassType = function(){ return ""; };

/**
 * Sets a name to the current theme font scheme.
 * @typeofeditors ["CPE"]
 * @param {string} sName - Theme font scheme name.
 * @returns {boolean} - returns false if font scheme doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiThemeFontScheme/Methods/SetSchemeName.js
 */
ApiThemeFontScheme.prototype.SetSchemeName = function(sName){ return true; };

/**
 * Sets the fonts to the current theme font scheme.
 * @typeofeditors ["CPE"]
 * @memberof ApiThemeFontScheme
 * @param {string} mjLatin - The major theme font applied to the latin text.
 * @param {string} mjEa - The major theme font applied to the east asian text.
 * @param {string} mjCs - The major theme font applied to the complex script text.
 * @param {string} mnLatin - The minor theme font applied to the latin text.
 * @param {string} mnEa - The minor theme font applied to the east asian text.
 * @param {string} mnCs - The minor theme font applied to the complex script text.
 * @see office-js-api/Examples/{Editor}/ApiThemeFontScheme/Methods/SetFonts.js
 */
ApiThemeFontScheme.prototype.SetFonts = function(mjLatin, mjEa, mjCs, mnLatin, mnEa, mnCs){};

/**
 * Creates a copy of the current theme font scheme.
 * @typeofeditors ["CPE"]
 * @returns {ApiThemeFontScheme}
 * @see office-js-api/Examples/{Editor}/ApiThemeFontScheme/Methods/Copy.js
 */
ApiThemeFontScheme.prototype.Copy = function(){ return new ApiThemeFontScheme(); };

/**
 * Converts the ApiThemeFontScheme object into the JSON object.
 * @memberof ApiThemeFontScheme
 * @typeofeditors ["CPE"]
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiThemeFontScheme/Methods/ToJSON.js
 */
ApiThemeFontScheme.prototype.ToJSON = function(){ return new JSON(); };

/**
 * Returns the type of the ApiSlide class.
 * @typeofeditors ["CPE"]
 * @returns {"slide"}
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/GetClassType.js
 */
ApiSlide.prototype.GetClassType = function(){ return ""; };

/**
 * Removes all the objects from the current slide.
 * @typeofeditors ["CPE"]
 * @memberof ApiSlide
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/RemoveAllObjects.js
 */
ApiSlide.prototype.RemoveAllObjects =  function(){};

/**
 * Adds an object (image, shape or chart) to the current presentation slide.
 * @typeofeditors ["CPE"]
 * @memberof ApiSlide
 * @param {ApiDrawing} oDrawing - The object which will be added to the current presentation slide.
 * @returns {boolean} - returns false if slide doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/AddObject.js
 */
ApiSlide.prototype.AddObject = function(oDrawing){ return true; };

/**
 * Adds a comment to the current slide.
 *
 * @typeofeditors ["CPE"]
 * @memberof ApiSlide
 * @param {number} posX - The X position (in EMU) of the comment (defaults to 0).
 * @param {number} posY - The Y position (in EMU) of the comment (defaults to 0).
 * @param {string} text - The comment text.
 * @param {string} [author] - The author's name (defaults to the current user name).
 * @param {string} [userId] - The user ID of the comment author (defaults to the current user ID).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/AddComment.js
 */
ApiSlide.prototype.AddComment = function (posX, posY, text, author, userId) { return true; };

/**
 * Removes objects (image, shape or chart) from the current slide.
 * @typeofeditors ["CPE"]
 * @memberof ApiSlide
 * @param {number} nPos - Position from which the object will be deleted.
 * @param {number} [nCount = 1] - The number of elements to delete.
 * @returns {boolean} - returns false if slide doesn't exist or position is invalid or slide hasn't objects.
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/RemoveObject.js
 */
ApiSlide.prototype.RemoveObject = function(nPos, nCount){ return true; };

/**
 * Sets the background to the current presentation slide.
 * @memberOf ApiSlide
 * @typeofeditors ["CPE"]
 * @param {ApiFill} oApiFill - The color or pattern used to fill the presentation slide background.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/SetBackground.js
 */
ApiSlide.prototype.SetBackground = function(oApiFill){ return true; };

/**
 * Returns the visibility of the current presentation slide.
 * @memberOf ApiSlide
 * @typeofeditors ["CPE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/GetVisible.js
 */
ApiSlide.prototype.GetVisible = function(){ return true; };

/**
 * Sets the visibility to the current presentation slide.
 * @memberOf ApiSlide
 * @typeofeditors ["CPE"]
 * @param {boolean} value - Slide visibility.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/SetVisible.js
 */
ApiSlide.prototype.SetVisible = function(value){ return true; };

/**
 * Returns the slide width in English measure units.
 * @typeofeditors ["CPE"]
 * @returns {EMU}
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/GetWidth.js
 */
ApiSlide.prototype.GetWidth = function(){ return new EMU(); };

/**
 * Returns the slide height in English measure units.
 * @typeofeditors ["CPE"]
 * @returns {EMU}
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/GetHeight.js
 */
ApiSlide.prototype.GetHeight = function(){ return new EMU(); };

/**
 * Applies the specified layout to the current slide.
 * The layout must be in slide master.
 * @typeofeditors ["CPE"]
 * @param {ApiLayout} oLayout - Layout to be applied.
 * @returns {boolean} - returns false if slide doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/ApplyLayout.js
 */
ApiSlide.prototype.ApplyLayout = function(oLayout){ return true; };

/**
 * Deletes the current slide from the presentation.
 * @typeofeditors ["CPE"]
 * @returns {boolean} - returns false if slide doesn't exist or is not in the presentation.
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/Delete.js
 */
ApiSlide.prototype.Delete = function(){ return true; };

/**
 * Creates a copy of the current slide object.
 * @typeofeditors ["CPE"]
 * @returns {ApiSlide | null} - returns new ApiSlide object that represents the duplicate slide. 
 * Returns null if slide doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/Copy.js
 */
ApiSlide.prototype.Copy = function(){ return new ApiSlide(); };

/**
 * Creates a duplicate of the specified slide object, adds the new slide to the slides collection.
 * @typeofeditors ["CPE"]
 * @param {number} [nPos    = ApiPresentation.GetSlidesCount()] - Position where the new slide will be added.
 * @returns {ApiSlide | null} - returns new ApiSlide object that represents the duplicate slide. 
 * Returns null if slide doesn't exist or is not in the presentation.
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/Duplicate.js
 */
ApiSlide.prototype.Duplicate = function(nPos){ return new ApiSlide(); };

/**
 * Moves the current slide to a specific location within the same collection.
 * @typeofeditors ["CPE"]
 * @param {number} nPos - Position where the current slide will be moved to.
 * @returns {boolean} - returns false if slide doesn't exist or position is invalid or slide is not in the presentation.
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/MoveTo.js
 */
ApiSlide.prototype.MoveTo = function(nPos){ return true; };

/**
 * Returns a position of the current slide in the presentation.
 * @typeofeditors ["CPE"]
 * @returns {number} - returns -1 if slide doesn't exist or is not in the presentation.
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/GetSlideIndex.js
 */
ApiSlide.prototype.GetSlideIndex = function (){ return 0; };

/**
 * Clears the slide background.
 * @typeofeditors ["CPE"]
 * @returns {boolean} - return false if slide doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/ClearBackground.js
 */
ApiSlide.prototype.ClearBackground = function(){ return true; };

/**
 * Sets the layout background as the background of the slide.
 * @typeofeditors ["CPE"]
 * @returns {boolean} - returns false if layout is null or layout hasn't background or slide doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/FollowLayoutBackground.js
 */
ApiSlide.prototype.FollowLayoutBackground = function(){ return true; };

/**
 * Sets the master background as the background of the slide.
 * @typeofeditors ["CPE"]
 * @returns {boolean} - returns false if master is null or master hasn't background or slide doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/FollowMasterBackground.js
 */
ApiSlide.prototype.FollowMasterBackground = function(){ return true; };

/**
 * Applies the specified theme to the current slide.
 * @typeofeditors ["CPE"]
 * @param {ApiTheme} oApiTheme - Presentation theme.
 * @returns {boolean} - returns false if master is null or master hasn't background.
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/ApplyTheme.js
 */
ApiSlide.prototype.ApplyTheme = function(oApiTheme){ return true; };

/**
 * Returns a layout of the current slide.
 * @typeofeditors ["CPE"]
 * @returns {ApiLayout | null} - returns null if slide or layout doesn't exist. 
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/GetLayout.js
 */
ApiSlide.prototype.GetLayout = function(){ return new ApiLayout(); };

/**
 * Returns a theme of the current slide.
 * @typeofeditors ["CPE"]
 * @returns {ApiTheme} - returns null if slide or layout or master or theme doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/GetTheme.js
 */
ApiSlide.prototype.GetTheme = function(){ return new ApiTheme(); };

/**
 * Returns an array with all the drawing objects from the slide.
 * @typeofeditors ["CPE"]
 * @returns {Drawing[]} 
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/GetAllDrawings.js
 */
ApiSlide.prototype.GetAllDrawings = function(){ return [new Drawing()]; };

/**
 * Returns an array with all the shape objects from the slide.
 * @typeofeditors ["CPE"]
 * @returns {ApiShape[]} 
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/GetAllShapes.js
 */
ApiSlide.prototype.GetAllShapes = function(){ return [new ApiShape()]; };

/**
 * Returns an array with all the image objects from the slide.
 * @typeofeditors ["CPE"]
 * @returns {ApiImage[]} 
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/GetAllImages.js
 */
ApiSlide.prototype.GetAllImages = function() { return [new ApiImage()]; };

/**
 * Returns an array with all the chart objects from the slide.
 * @typeofeditors ["CPE"]
 * @returns {ApiChart[]} 
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/GetAllCharts.js
 */
ApiSlide.prototype.GetAllCharts = function() { return [new ApiChart()]; };

/**
 * Returns an array with all the OLE objects from the slide.
 * @typeofeditors ["CPE"]
 * @returns {ApiOleObject[]} 
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/GetAllOleObjects.js
 */
ApiSlide.prototype.GetAllOleObjects = function() { return [new ApiOleObject()]; };

/**
 * Converts the ApiSlide object into the JSON object.
 * @memberof ApiSlide
 * @typeofeditors ["CPE"]
 * @param {boolean} [bWriteLayout=false] - Specifies if the slide layout will be written to the JSON object or not.
 * @param {boolean} [bWriteMaster=false] - Specifies if the slide master will be written to the JSON object or not (bWriteMaster is false if bWriteLayout === false).
 * @param {boolean} [bWriteAllMasLayouts=false] - Specifies if all child layouts from the slide master will be written to the JSON object or not.
 * @param {boolean} [bWriteTableStyles=false] - Specifies whether to write used table styles to the JSON object (true) or not (false).
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/ToJSON.js
 */
ApiSlide.prototype.ToJSON = function(bWriteLayout, bWriteMaster, bWriteAllMasLayouts, bWriteTableStyles){ return new JSON(); };

/**
 * Returns an array of drawings by the specified placeholder type.
 * @memberof ApiSlide
 * @typeofeditors ["CPE"]
 * @param {PlaceholderType} sType - The placeholder type.
 * @returns {Drawing[]}
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/GetDrawingsByPlaceholderType.js
 */
ApiSlide.prototype.GetDrawingsByPlaceholderType = function(sType) { return [new Drawing()]; };

/**
 * Selects the current slide.
 * @memberof ApiSlide
 * @typeofeditors ["CPE"]
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/Select.js
 */
ApiSlide.prototype.Select = function() {};

/**
 * Groups an array of drawings in the current slide.
 * @memberof ApiSlide
 * @typeofeditors ["CPE"]
 * @param {DrawingForGroup[]} aDrawings - An array of drawings to group.
 * @returns {ApiGroup}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/GroupDrawings.js
 */
ApiSlide.prototype.GroupDrawings = function(aDrawings){ return new ApiGroup(); };

/**
 * Returns the notes page from the current slide.
 * @typeofeditors ["CPE"]
 * @memberof ApiSlide
 * @returns {ApiNotesPage | null}
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/GetNotesPage.js
  */
ApiSlide.prototype.GetNotesPage = function () { return new ApiNotesPage(); };

/**
 * Adds a text to the notes page of the current slide.
 * @typeofeditors ["CPE"]
 * @memberof ApiSlide
 * @param {string} sText - The text to be added to the notes page.
 * @returns {boolean} - Returns true if text was added successfully, otherwise false.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiSlide/Methods/AddNotesText.js
 */
ApiSlide.prototype.AddNotesText = function (sText) { return true; };

/**
 * Returns the type of the ApiNotesPage class.
 *
 * @typeofeditors ["CPE"]
 * @returns {"notesPage"}
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiNotesPage/Methods/GetClassType.js
 */
ApiNotesPage.prototype.GetClassType = function () { return ""; };

/**
 * Returns a shape with the type="body" attribute from the current notes page.
 * @typeofeditors ["CPE"]
 * @memberof ApiNotesPage
 * @returns {ApiShape | null}
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiNotesPage/Methods/GetBodyShape.js
 */
ApiNotesPage.prototype.GetBodyShape = function () { return new ApiShape(); };

/**
 * Adds a text to the body shape of the current notes page.
 * @typeofeditors ["CPE"]
 * @memberof ApiNotesPage
 * @param {string} sText - The text to be added to the body shape.
 * @returns {boolean} - Returns true if text was added successfully, otherwise false.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiNotesPage/Methods/AddBodyShapeText.js
 */
ApiNotesPage.prototype.AddBodyShapeText = function (sText) { return true; };

/**
 * Returns the type of the ApiDrawing class.
 * @typeofeditors ["CPE"]
 * @returns {"drawing"}
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/GetClassType.js
 */
ApiDrawing.prototype.GetClassType = function(){ return ""; };

/**
 * Sets the size of the object (image, shape, chart) bounding box.
 * @typeofeditors ["CPE"]
 * @param {EMU} nWidth - The object width measured in English measure units.
 * @param {EMU} nHeight - The object height measured in English measure units.
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/SetSize.js
 */
ApiDrawing.prototype.SetSize = function(nWidth, nHeight){};

/**
 * Sets the position of the drawing on the slide.
 * @typeofeditors ["CPE"]
 * @param {EMU} nPosX - The distance from the left side of the slide to the left side of the drawing measured in English measure units.
 * @param {EMU} nPosY - The distance from the top side of the slide to the upper side of the drawing measured in English measure units.
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/SetPosition.js
 */
ApiDrawing.prototype.SetPosition = function(nPosX, nPosY){};

/**
 * Returns the drawing parent object.
 * @typeofeditors ["CPE"]
 * @returns {ApiSlide | ApiLayout | ApiMaster | null}
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/GetParent.js
 */
ApiDrawing.prototype.GetParent = function(){ return new ApiSlide(); };

/**
 * Returns the drawing parent slide.
 * @typeofeditors ["CPE"]
 * @returns {ApiSlide | null} - return null if parent ins't a slide.
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/GetParentSlide.js
 */
ApiDrawing.prototype.GetParentSlide = function(){ return new ApiSlide(); };

/**
 * Returns the drawing parent slide layout.
 * @typeofeditors ["CPE"]
 * @returns {ApiLayout | null} - return null if parent ins't a slide layout.
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/GetParentLayout.js
 */
ApiDrawing.prototype.GetParentLayout = function(){ return new ApiLayout(); };

/**
 * Returns the drawing parent slide master.
 * @typeofeditors ["CPE"]
 * @returns {ApiMaster | null} - return null if parent ins't a slide master.
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/GetParentMaster.js
 */
ApiDrawing.prototype.GetParentMaster = function(){ return new ApiMaster(); };

/**
 * Creates a copy of the specified drawing object.
 * @typeofeditors ["CPE"]
 * @returns {ApiDrawing} - return null if drawing doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/Copy.js
 */
ApiDrawing.prototype.Copy = function(){ return new ApiDrawing(); };

/**
 * Deletes the specified drawing object from the parent.
 * @typeofeditors ["CPE"]
 * @returns {boolean} - false if drawing doesn't exist or drawing hasn't a parent.
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/Delete.js
 */
ApiDrawing.prototype.Delete = function(){ return true; };

/**
 * Sets the specified placeholder to the current drawing object.
 * @typeofeditors ["CPE"]
 * @param {ApiPlaceholder} oPlaceholder - Placeholder object.
 * @returns {boolean} - returns false if parameter isn't a placeholder.
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/SetPlaceholder.js
 */
ApiDrawing.prototype.SetPlaceholder = function(oPlaceholder){ return true; };

/**
 * Returns a placeholder from the current drawing object.
 * @typeofeditors ["CPE"]
 * @returns {ApiPlaceholder | null} - returns null if placeholder doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/GetPlaceholder.js
 */
ApiDrawing.prototype.GetPlaceholder = function(){ return new ApiPlaceholder(); };

/**
 * Returns the width of the current drawing.
 * @memberof ApiDrawing
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @returns {EMU}
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/GetWidth.js
 */
ApiDrawing.prototype.GetWidth = function(){ return new EMU(); };

/**
 * Returns the height of the current drawing.
 * @memberof ApiDrawing
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @returns {EMU}
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/GetHeight.js
 */
ApiDrawing.prototype.GetHeight = function(){ return new EMU(); };

/**
 * Returns the lock value for the specified lock type of the current drawing.
 * @typeofeditors ["CPE"]
 * @param {DrawingLockType} sType - Lock type in the string format.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/GetLockValue.js
 */
ApiDrawing.prototype.GetLockValue = function(sType){ return true; };

/**
 * Sets the lock value to the specified lock type of the current drawing.
 * @typeofeditors ["CPE"]
 * @param {DrawingLockType} sType - Lock type in the string format.
 * @param {boolean} bValue - Specifies if the specified lock is applied to the current drawing.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/SetLockValue.js
 */
ApiDrawing.prototype.SetLockValue = function(sType, bValue){ return true; };

/**
 * Converts the ApiDrawing object into the JSON object.
 * @memberof ApiDrawing
 * @typeofeditors ["CPE"]
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/ToJSON.js
 */
ApiDrawing.prototype.ToJSON = function(){ return new JSON(); };

/**
 * Selects the current graphic object.
 * @memberof ApiDrawing
 * @typeofeditors ["CPE"]
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/Select.js
 */
ApiDrawing.prototype.Select = function() {};

/**
 * Sets the rotation angle to the current drawing object.
 * @memberof ApiDrawing
 * @param {number} nRotAngle - New drawing rotation angle.
 * @typeofeditors ["CPE"]
 * @returns {boolean}
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/SetRotation.js
 */
ApiDrawing.prototype.SetRotation = function(nRotAngle){ return true; };

/**
 * Returns the rotation angle of the current drawing object.
 * @memberof ApiDrawing
 * @typeofeditors ["CPE"]
 * @returns {number}
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/GetRotation.js
 */
ApiDrawing.prototype.GetRotation = function(){ return 0; };

/**
 * Returns a type of the ApiGroup class.
 * @memberof ApiGroup
 * @typeofeditors ["CPE"]
 * @returns {"group"}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiGroup/Methods/GetClassType.js
 */
ApiGroup.prototype.GetClassType = function(){ return ""; };

/**
 * Ungroups the current group of drawings.
 * @memberof ApiGroup
 * @typeofeditors ["CPE"]
 * @returns {boolean}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiGroup/Methods/Ungroup.js
 */
ApiGroup.prototype.Ungroup = function(){ return true; };

/**
 * Returns the type of the ApiImage class.
 * @typeofeditors ["CPE"]
 * @returns {"image"}
 * @see office-js-api/Examples/{Editor}/ApiImage/Methods/GetClassType.js
 */
ApiImage.prototype.GetClassType = function(){ return ""; };

/**
 * Returns the type of the ApiShape class.
 * @typeofeditors ["CPE"]
 * @returns {"shape"}
 * @see office-js-api/Examples/{Editor}/ApiShape/Methods/GetClassType.js
 */
ApiShape.prototype.GetClassType = function(){ return ""; };

/**
 * Deprecated in 6.2.
 * Returns the shape inner contents where a paragraph or text runs can be inserted.
 * @typeofeditors ["CPE"]
 * @returns {ApiDocumentContent}
 * @see office-js-api/Examples/{Editor}/ApiShape/Methods/GetDocContent.js
 */
ApiShape.prototype.GetDocContent = function(){ return new ApiDocumentContent(); };

/**
 * Returns the shape inner contents where a paragraph or text runs can be inserted.
 * @typeofeditors ["CPE"]
 * @returns {ApiDocumentContent}
 * @see office-js-api/Examples/{Editor}/ApiShape/Methods/GetContent.js
 */
ApiShape.prototype.GetContent = function(){ return new ApiDocumentContent(); };

/**
 * Sets the vertical alignment to the shape content where a paragraph or text runs can be inserted.
 * @typeofeditors ["CPE"]
 * @param {VerticalTextAlign} VerticalAlign - The type of the vertical alignment for the shape inner contents.
 * @see office-js-api/Examples/{Editor}/ApiShape/Methods/SetVerticalTextAlign.js
 */
ApiShape.prototype.SetVerticalTextAlign = function(VerticalAlign){};

/**
 * Returns a type of the ApiOleObject class.
 * @memberof ApiOleObject
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @returns {"oleObject"}
 * @see office-js-api/Examples/{Editor}/ApiOleObject/Methods/GetClassType.js
 */
ApiOleObject.prototype.GetClassType = function(){ return ""; };

/**
 * Sets the data to the current OLE object.
 * @memberof ApiOleObject
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @param {string} sData - The OLE object string data.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiOleObject/Methods/SetData.js
 */
ApiOleObject.prototype.SetData = function(sData){ return true; };

/**
 * Returns the string data from the current OLE object.
 * @memberof ApiOleObject
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiOleObject/Methods/GetData.js
 */
ApiOleObject.prototype.GetData = function(){ return ""; };

/**
 * Sets the application ID to the current OLE object.
 * @memberof ApiOleObject
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @param {string} sAppId - The application ID associated with the current OLE object.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiOleObject/Methods/SetApplicationId.js
 */
ApiOleObject.prototype.SetApplicationId = function(sAppId){ return true; };

/**
 * Returns the application ID from the current OLE object.
 * @memberof ApiOleObject
 * @typeofeditors ["CDE", "CPE", "CSE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiOleObject/Methods/GetApplicationId.js
 */
ApiOleObject.prototype.GetApplicationId = function(){ return ""; };

/**
 * Returns the type of the ApiTable object.
 * @typeofeditors ["CPE"]
 * @returns {"table"}
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/GetClassType.js
 */
ApiTable.prototype.GetClassType = function(){ return ""; };

/**
 * Returns a row by its index.
 * @typeofeditors ["CPE"]
 * @param nIndex {number} - The row index (position) in the table.
 * @returns {ApiTableRow}
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/GetRow.js
 */
ApiTable.prototype.GetRow = function(nIndex){ return new ApiTableRow(); };

/**
 * Merges an array of cells. If merge is successful, it will return merged cell, otherwise "null".
 * <b>Warning</b>: The number of cells in any row and the number of rows in the current table may be changed.
 * @typeofeditors ["CPE"]
 * @param {ApiTableCell[]} aCells - The array of cells.
 * @returns {ApiTableCell}
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/MergeCells.js
 */
ApiTable.prototype.MergeCells = function(aCells){ return new ApiTableCell(); };

/**
 * Specifies the components of the conditional formatting of the referenced table style (if one exists)
 * which shall be applied to the set of table rows with the current table-level property exceptions. A table style
 * can specify up to six different optional conditional formats [Example: Different formatting for first column],
 * which then can be applied or omitted from individual table rows in the parent table.
 *
 * The default setting is to apply the row and column banding formatting, but not the first row, last row, first
 * column, or last column formatting.
 * @typeofeditors ["CPE"]
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
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/SetTableLook.js
 */
ApiTable.prototype.SetTableLook = function(isFirstColumn, isFirstRow, isLastColumn, isLastRow, isHorBand, isVerBand){};

/**
 * Adds a new row to the current table.
 * @typeofeditors ["CPE"]
 * @param {ApiTableCell} [oCell] - If not specified, a new row will be added to the end of the table.
 * @param {boolean} [isBefore=false] - Adds a new row before or after the specified cell. If no cell is specified,
 * then this parameter will be ignored.
 * @returns {ApiTableRow}
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/AddRow.js
 */
ApiTable.prototype.AddRow = function(oCell, isBefore){ return new ApiTableRow(); };

/**
 * Adds a new column to the end of the current table.
 * @typeofeditors ["CPE"]
 * @param {ApiTableCell} [oCell] - If not specified, a new column will be added to the end of the table.
 * @param {boolean} [isBefore=false] - Add a new column before or after the specified cell. If no cell is specified,
 * then this parameter will be ignored.
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/AddColumn.js
 */
ApiTable.prototype.AddColumn = function(oCell, isBefore){};

/**
 * Removes a table row with the specified cell.
 * @typeofeditors ["CPE"]
 * @param {ApiTableCell} oCell - The table cell from the row which will be removed.
 * @returns {boolean} - defines if the table is empty after removing or not.
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/RemoveRow.js
 */
ApiTable.prototype.RemoveRow = function(oCell){ return true; };

/**
 * Removes a table column with the specified cell.
 * @typeofeditors ["CPE"]
 * @param {ApiTableCell} oCell - The table cell from the column which will be removed.
 * @returns {boolean} - defines if the table is empty after removing or not.
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/RemoveColumn.js
 */
ApiTable.prototype.RemoveColumn = function(oCell){ return true; };

/**
 * Specifies the shading which shall be applied to the extents of the current table.
 * @typeofeditors ["CPE"]
 * @param {ShdType | ApiFill} sType - The shading type applied to the contents of the current table. Can be ShdType or ApiFill.
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/SetShd.js
 */
ApiTable.prototype.SetShd = function(sType, r, g, b){};

/**
 * Converts the ApiTable object into the JSON object.
 * @memberof ApiTable
 * @typeofeditors ["CPE"]
 * @param {boolean} [bWriteTableStyles=false] - Specifies whether to write used table styles to the JSON object (true) or not (false).
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/ToJSON.js
 */
ApiTable.prototype.ToJSON = function(bWriteTableStyles){ return new JSON(); };

/**
 * Returns the type of the ApiTableRow class.
 * @typeofeditors ["CPE"]
 * @returns {"tableRow"}
 * @see office-js-api/Examples/{Editor}/ApiTableRow/Methods/GetClassType.js
 */
ApiTableRow.prototype.GetClassType = function(){ return ""; };

/**
 * Returns a number of cells in the current row.
 * @typeofeditors ["CPE"]
 * @returns {number}
 * @see office-js-api/Examples/{Editor}/ApiTableRow/Methods/GetCellsCount.js
 */
ApiTableRow.prototype.GetCellsCount = function(){ return 0; };

/**
 * Returns a cell by its position in the current row.
 * @typeofeditors ["CPE"]
 * @param {number} nPos - The cell position in the table row.
 * @returns {ApiTableCell}
 * @see office-js-api/Examples/{Editor}/ApiTableRow/Methods/GetCell.js
 */
ApiTableRow.prototype.GetCell = function(nPos){ return new ApiTableCell(); };

/**
 * Sets the height to the current table row.
 * @typeofeditors ["CPE"]
 * @param {EMU} [nValue] - The row height in English measure units.
 * @see office-js-api/Examples/{Editor}/ApiTableRow/Methods/SetHeight.js
 */
ApiTableRow.prototype.SetHeight = function(nValue){};

/**
 * Returns the type of the ApiTableCell class.
 * @typeofeditors ["CPE"]
 * @returns {"tableCell"}
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/GetClassType.js
 */
ApiTableCell.prototype.GetClassType = function(){ return ""; };

/**
 * Returns the current cell content.
 * @typeofeditors ["CPE"]
 * @returns {ApiDocumentContent}
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/GetContent.js
 */
ApiTableCell.prototype.GetContent = function(){ return new ApiDocumentContent(); };

/**
 * Specifies the shading which shall be applied to the extents of the current table cell.
 * @typeofeditors ["CPE"]
 * @param {ShdType | ApiFill} sType - The shading type applied to the contents of the current table. Can be ShdType or ApiFill.
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/SetShd.js
 */
ApiTableCell.prototype.SetShd = function(sType, r, g, b){};

/**
 * Specifies an amount of space which shall be left between the bottom extent of the cell contents and the border
 * of a specific individual table cell within a table.
 * @typeofeditors ["CPE"]
 * @param {?twips} nValue - If this value is <code>null</code>, then default table cell bottom margin shall be used,
 * otherwise override the table cell bottom margin with specified value for the current cell.
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/SetCellMarginBottom.js
 */
ApiTableCell.prototype.SetCellMarginBottom = function(nValue){};

/**
 * Specifies an amount of space which shall be left between the left extent of the current cell contents and the
 * left edge border of a specific individual table cell within a table.
 * @typeofeditors ["CPE"]
 * @param {?twips} nValue - If this value is <code>null</code>, then default table cell left margin shall be used,
 * otherwise override the table cell left margin with specified value for the current cell.
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/SetCellMarginLeft.js
 */
ApiTableCell.prototype.SetCellMarginLeft = function(nValue){};

/**
 * Specifies an amount of space which shall be left between the right extent of the current cell contents and the
 * right edge border of a specific individual table cell within a table.
 * @typeofeditors ["CPE"]
 * @param {?twips} nValue - If this value is <code>null</code>, then default table cell right margin shall be used,
 * otherwise override the table cell right margin with specified value for the current cell.
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/SetCellMarginRight.js
 */
ApiTableCell.prototype.SetCellMarginRight = function(nValue){};

/**
 * Specifies an amount of space which shall be left between the top extent of the current cell contents and the
 * top edge border of a specific individual table cell within a table.
 * @typeofeditors ["CPE"]
 * @param {?twips} nValue - If this value is <code>null</code>, then default table cell top margin shall be used,
 * otherwise override the table cell top margin with specified value for the current cell.
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/SetCellMarginTop.js
 */
ApiTableCell.prototype.SetCellMarginTop = function(nValue){};

/**
 * Sets the border which shall be displayed at the bottom of the current table cell.
 * @typeofeditors ["CPE"]
 * @param {mm} fSize - The width of the current border.
 * @param {ApiFill} oApiFill - The color or pattern used to fill the current border.
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/SetCellBorderBottom.js
 */
ApiTableCell.prototype.SetCellBorderBottom = function(fSize, oApiFill){};

/**
 * Sets the border which shall be displayed at the left of the current table cell.
 * @typeofeditors ["CPE"]
 * @param {mm} fSize - The width of the current border.
 * @param {ApiFill} oApiFill - The color or pattern used to fill the current border.
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/SetCellBorderLeft.js
 */
ApiTableCell.prototype.SetCellBorderLeft = function(fSize, oApiFill){};

/**
 * Sets the border which shall be displayed at the right of the current table cell.
 * @typeofeditors ["CPE"]
 * @param {mm} fSize - The width of the current border.
 * @param {ApiFill} oApiFill - The color or pattern used to fill the current border.
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/SetCellBorderRight.js
 */
ApiTableCell.prototype.SetCellBorderRight = function(fSize, oApiFill){};

/**
 * Sets the border which shall be displayed at the top of the current table cell.
 * @typeofeditors ["CPE"]
 * @param {mm} fSize - The width of the current border.
 * @param {ApiFill} oApiFill - The color or pattern used to fill the current border.
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/SetCellBorderTop.js
 */
ApiTableCell.prototype.SetCellBorderTop = function(fSize, oApiFill){};

/**
 * Specifies the vertical alignment for text within the current table cell.
 * @typeofeditors ["CPE"]
 * @param {("top" | "center" | "bottom")} sType - The type of the vertical alignment.
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/SetVerticalAlign.js
 */
ApiTableCell.prototype.SetVerticalAlign = function(sType){};

/**
 * Specifies the direction of the text flow for the current table cell.
 * @typeofeditors ["CPE"]
 * @param {("lrtb" | "tbrl" | "btlr")} sType - The type of the text flow direction. 
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/SetTextDirection.js
 */
ApiTableCell.prototype.SetTextDirection = function(sType){};

/**
 * Class representing the selection in the presentation.
 * @constructor
 */
function ApiSelection() {}

/**
 * Returns the type of the current selection.
 * @memberof ApiSelection
 * @typeofeditors ["CPE"]
 * @returns {SelectionType}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiSelection/Methods/GetType.js
 */
ApiSelection.prototype.GetType = function() { return new SelectionType(); };

/**
 * Returns the selected shapes.
 * @memberof ApiSelection
 * @typeofeditors ["CPE"]
 * @returns {ApiDrawing[]}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiSelection/Methods/GetShapes.js
 */
ApiSelection.prototype.GetShapes = function() { return [new ApiDrawing()]; };

/**
 * Returns the selected slides.
 * @memberof ApiSelection
 * @typeofeditors ["CPE"]
 * @returns {ApiSlide[]}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiSelection/Methods/GetSlides.js
 */
ApiSelection.prototype.GetSlides = function() { return [new ApiSlide()]; };


