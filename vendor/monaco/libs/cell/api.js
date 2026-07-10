/**
* Base class.
* @global
* @class
* @name Api
* @property {ApiWorksheet[]} Sheets - Returns the Sheets collection that represents all the sheets in the active workbook.
* @property {ApiWorksheet} ActiveSheet - Returns an object that represents the active sheet.
* @property {ApiRange} Selection - Returns an object that represents the selected range.
* @property {ApiComment[]} Comments - Returns all comments related to the whole workbook.
* @property {FreezePaneType} FreezePanes - Returns or sets the type of freeze panes.
* @property {ApiComment[]} AllComments - Returns all comments from the current workbook including comments from all worksheets.
* @property {ReferenceStyle} ReferenceStyle - Returns or sets the reference style.
* @property {ApiWorksheetFunction} WorksheetFunction - Returns an object that represents the function list.
* @property {ApiPivotTable[]} PivotTables - Returns all pivot tables.
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
* Class representing a range.
* @constructor
* @property {number} Row - Returns the row number for the selected cell.
* @property {number} Col - Returns the column number for the selected cell.
* @property {ApiRange} Rows - Returns the ApiRange object that represents the rows of the specified range.
* @property {ApiRange} Cols - Returns the ApiRange object that represents the columns of the specified range.
* @property {ApiRange} Columns - Returns the ApiRange object that represents the columns of the specified range.
* @property {ApiRange} Cells - Returns a Range object that represents all the cells in the specified range or a specified cell.
* @property {ApiRange} EntireRow - Returns a Range object that represents the entire row(s) containing the specified range.
* @property {ApiRange} EntireColumn - Returns a Range object that represents the entire column(s) containing the specified range.
* @property {number} Count - Returns the rows or columns count.
* @property {string} Address - Returns the range address.
* @property {string} Value - Returns a value from the first cell of the specified range or sets it to this cell.
* @property {string} Formula - Returns a formula from the first cell of the specified range or sets it to this cell.
* @property {string} Value2 - Returns the value2 (value without format) from the first cell of the specified range or sets it to this cell.
* @property {string} Text - Returns the text from the first cell of the specified range or sets it to this cell.
* @property {ApiColor} FontColor - Sets the text color to the current cell range with the previously created color object.
* @property {boolean} Hidden - Returns or sets the value hiding property.
* @property {number} ColumnWidth - Returns or sets the width of all the columns in the specified range measured in points.
* @property {number} Width - Returns a value that represents the range width measured in points.
* @property {number} RowHeight - Returns or sets the height of the first row in the specified range measured in points.
* @property {number} Height - Returns a value that represents the range height measured in points.
* @property {number} FontSize - Sets the font size to the characters of the current cell range.
* @property {string} FontName - Sets the specified font family as the font name for the current cell range.
* @property {'center' | 'bottom' | 'top' | 'distributed' | 'justify'} AlignVertical - Sets the text vertical alignment to the current cell range.
* @property {'left' | 'right' | 'center' | 'justify'} AlignHorizontal - Sets the text horizontal alignment to the current cell range.
* @property {'context' | 'ltr' | 'rtl'} ReadingOrder - Sets the direction (reading order) of the text in the current cell range.
* @property {boolean} Bold - Sets the bold property to the text characters from the current cell or cell range.
* @property {boolean} Italic - Sets the italic property to the text characters in the current cell or cell range.
* @property {'none' | 'single' | 'singleAccounting' | 'double' | 'doubleAccounting'} Underline - Sets the type of underline applied to the font.
* @property {boolean} Strikeout - Sets a value that indicates whether the contents of the current cell or cell range are displayed struck through.
* @property {boolean} WrapText - Returns the information about the wrapping cell style or specifies whether the words in the cell must be wrapped to fit the cell size or not.
* @property {ApiColor|'No Fill'} FillColor - Returns or sets the background color of the current cell range.
* @property {string} NumberFormat - Sets a value that represents the format code for the object.
* @property {ApiRange} MergeArea - Returns the cell or cell range from the merge area.
* @property {ApiRange} CurrentRegion - Returns a range that represents the expanded range around the current range.
* @property {ApiWorksheet} Worksheet - Returns the ApiWorksheet object that represents the worksheet containing the specified range.
* @property {ApiName} DefName - Returns the ApiName object.
* @property {ApiComment | null} Comments - Returns the ApiComment collection that represents all the comments from the specified worksheet.
* @property {Angle} Orientation - Returns an angle to the current cell range.
* @property {ApiAreas} Areas - Returns a collection of the areas.
* @property {ApiCharacters} Characters - Returns the ApiCharacters object that represents a range of characters within the object text. Use the ApiCharacters object to format characters within a text string.
* @property {ApiPivotTable | null} PivotTable - Returns the ApiPivotTable object that represents the pivot table report containing the upper-left corner of the specified range.
* @property {number} CellsCount - Returns a number of cells in the current range.
* @property {number} ColumnsCount - Returns a number of columns in the current range.
* @property {number} RowsCount - Returns a number of rows in the current range.
* @property {ApiFormatConditions} FormatConditions - Returns the collection of conditional formatting rules for the current range.
* @property {ApiValidation} Validation - Returns the ApiValidation class instance associated with this range. If no validation instance exists yet, it will be created.
*/
function ApiRange() {}

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
* @property {string} Text - Returns or sets the comment text.
* @property {string} Id - Returns the current comment ID.
* @property {string} AuthorName - Returns or sets the comment author's name.
* @property {string} UserId - Returns or sets the user ID of the comment author.
* @property {boolean} Solved - Checks if a comment is solved or not or marks a comment as solved.
* @property {number | string} TimeUTC - Returns or sets the timestamp of the comment creation in UTC format.
* @property {number | string} Time - Returns or sets the timestamp of the comment creation in the current time zone format.
* @property {string} QuoteText - Returns the quote text of the current comment.
* @property {Number} RepliesCount - Returns a number of the comment replies.
*/
function ApiComment() {}

/**
* Class representing a comment reply.
* @constructor
* @property {string} Text - Returns or sets the comment reply text.
* @property {string} AuthorName - Returns or sets the comment reply author's name.
* @property {string} UserId - Returns or sets the user ID of the comment reply author.
* @property {number | string} TimeUTC - Returns or sets the timestamp of the comment reply creation in UTC format.
* @property {number | string} Time - Returns or sets the timestamp of the comment reply creation in the current time zone format.
*/
function ApiCommentReply() {}

/**
* Class representing a Paragraph hyperlink.
* @constructor
*/
function ApiHyperlink() {}

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
* @extends ApiDrawing
*/
function ApiImage() {}

ApiImage.prototype = new ApiDrawing();

/**
* Class representing an OLE object.
* @constructor
* @extends ApiDrawing
*/
function ApiOleObject() {}

ApiOleObject.prototype = new ApiDrawing();

/**
* Class representing a shape.
* @constructor
* @extends ApiDrawing
*/
function ApiShape() {}

ApiShape.prototype = new ApiDrawing();

/**
* Class representing a chart.
* @constructor
* @extends ApiDrawing
*/
function ApiChart() {}

ApiChart.prototype = new ApiDrawing();

/**
* Class representing a group of drawings.
* @constructor
* @extends ApiDrawing
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
* Class representing a base class for the color types.
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
* @extends ApiDrawing
*/
function ApiSmartArt() {}

ApiSmartArt.prototype = new ApiDrawing();

/**
* Class representing a theme.
* @constructor
*/
function ApiTheme() {}

/**
* Class representing the currently active workbook
*
* @constructor
*/
function ApiWorkbook() {}

/**
* Class representing a sheet.
* @constructor
* @property {boolean} Visible - Returns or sets the state of sheet visibility.
* @property {number} Active - Makes the current sheet active.
* @property {ApiRange} ActiveCell - Returns an object that represents an active cell.
* @property {ApiRange} Selection - Returns an object that represents the selected range.
* @property {ApiRange} Cells - Returns ApiRange that represents all the cells on the worksheet (not just the cells that are currently in use).
* @property {ApiRange} Rows - Returns ApiRange that represents all the cells of the rows range.
* @property {ApiAutoFilter} AutoFilter - Returns AutoFilter that represents all applied autofilters
* @property {ApiRange} Cols - Returns ApiRange that represents all the cells of the columns range.
* @property {ApiRange} UsedRange - Returns ApiRange that represents the used range on the specified worksheet.
* @property {string} Name - Returns or sets a name of the active sheet.
* @property {number} Index - Returns a sheet index.
* @property {number} LeftMargin - Returns or sets the size of the sheet left margin measured in points.
* @property {number} RightMargin - Returns or sets the size of the sheet right margin measured in points.
* @property {number} TopMargin - Returns or sets the size of the sheet top margin measured in points.
* @property {number} BottomMargin - Returns or sets the size of the sheet bottom margin measured in points.
* @property {PageOrientation} PageOrientation - Returns or sets the page orientation.
* @property {boolean} PrintHeadings - Returns or sets the page PrintHeadings property.
* @property {boolean} PrintGridlines - Returns or sets the page PrintGridlines property.
* @property {ApiName[]} Defnames - Returns an array of the ApiName objects.
* @property {ApiComment[]} Comments - Returns all comments from the current worksheet.
* @property {ApiFreezePanes} FreezePanes - Returns the freeze panes for the current worksheet.
* @property {ApiProtectedRange[]} AllProtectedRanges - Returns all protected ranges from the current worksheet.
* @property {ApiPivotTable[]} PivotTables - Returns all pivot tables from the current worksheet.
*/
function ApiWorksheet() {}

/**
* Class representing a name.
* @constructor
* @property {string} Name - Sets a name to the active sheet.
* @property {string} RefersTo - Returns or sets a formula that the name is defined to refer to.
* @property {ApiRange} RefersToRange - Returns the ApiRange object by reference.
*/
function ApiName() {}

/**
* Class representing the areas.
* @constructor
* @property {number} Count - Returns a value that represents the number of objects in the collection.
* @property {ApiRange} Parent - Returns the parent object for the specified collection.
*/
function ApiAreas() {}

/**
* Class representing a pivot table.
* @constructor
* @property {string} Name - Returns or sets a name of the pivot table.
* @property {boolean} ColumnGrand - Returns or sets the <b>Grand Totals</b> setting for the pivot table columns.
* @property {boolean} RowGrand - Returns or sets the <b>Grand Totals</b> setting for the pivot table rows.
* @property {boolean} DisplayFieldCaptions - Returns or sets the setting which specifies whether to display field headers for rows and columns.
* @property {string} Title - Returns or sets the pivot table title.
* @property {string} Description - Returns or sets the pivot table description.
* @property {string} StyleName - Returns or sets the pivot table style name.
* @property {ApiWorksheet} Parent - Returns the parent object for the current pivot table.
* @property {boolean} ShowTableStyleRowHeaders - Returns or sets the setting which specifies whether the row headers of the pivot table will be highlighted with the special formatting.
* @property {boolean} ShowTableStyleColumnHeaders - Returns or sets the setting which specifies whether the column headers of the pivot table will be highlighted with the special formatting.
* @property {boolean} ShowTableStyleRowStripes - Returns or sets the setting which specifies whether the background color alternation for odd and even rows will be enabled for the pivot table.
* @property {boolean} ShowTableStyleColumnStripes - Returns or sets the setting which specifies whether the background color alternation for odd and even columns will be enabled for the pivot table.
* @property {ApiRange} Source - Returns or sets the source range for the pivot table.
* @property {ApiRange | null} ColumnRange - Returns a Range object that represents the column area in the pivot table report.
* @property {ApiRange | null} RowRange - Returns a Range object that represents the row area in the pivot table report.
* @property {ApiRange} DataBodyRange - Returns a Range object that represents the range of values in the pivot table.
* @property {ApiRange | null} TableRange1 - Returns a Range object that represents the entire pivot table report, but doesn't include page fields.
* @property {ApiRange | null} TableRange2 - Returns a Range object that represents the entire pivot table report, including page fields.
* @property {string} GrandTotalName - Returns or sets the text string label that is displayed in the grand total column or row heading in the specified pivot table report.
* @property {boolean} RepeatAllLabels - Specifies whether to repeat item labels for all pivot fields in the specified pivot table.
* @property {object} RowAxisLayout - Sets the way the specified pivot table items appear — in table format or in outline format.
* @property {boolean} LayoutBlankLine - Sets the setting which specifies whether to insert blank rows after each item in the pivot table.
* @property {boolean} LayoutSubtotals - Sets the setting which specifies whether to show subtotals in the pivot table.
* @property {number} SubtotalLocation - Sets the layout subtotal location.
* @property {ApiPivotField[]} PivotFields - Returns all pivot fields in the pivot table.
* @property {ApiPivotField[]} ColumnFields - Returns an array that is currently displayed as column fields in the pivot table.
* @property {ApiPivotField[]} DataFields - Returns an array that is currently displayed as data fields in the pivot table.
* @property {ApiPivotField[]} HiddenFields - Returns an array that represents all hidden fields in the pivot table.
* @property {ApiPivotField[]} VisibleFields - Returns an array that represents all visible fields in the pivot table.
* @property {ApiPivotField[]} PageFields - Returns an array that is currently displayed as page fields in the pivot table.
* @property {ApiPivotField[]} RowFields - Returns an array that is currently displayed as row fields in the pivot table.
*/
function ApiPivotTable() {}

/**
* Class representing a pivot table field.
* @constructor
* @property {number} Position - Returns or sets a value that represents the position of the field (first, second, third, and so on) among all the fields in its orientation (Rows, Columns, Pages, Data).
* @property {number} Orientation - Returns or sets a pivot field orientation value that represents the location of the field in the specified pivot table report.
* @property {string} Caption - Returns or sets a value that represents the label text for the pivot field.
* @property {string} Name - Returns or sets a value representing the object name.
* @property {string} Value - Returns or sets a value representing the name of the specified field in the pivot table report.
* @property {string} SourceName - Returns a source name for the pivot table field.
* @property {number} Index - Returns an index for the pivot table field.
* @property {ApiPivotTable} Table - Returns the ApiPivotTable object which represents the pivot table for the current field.
* @property {ApiPivotTable} Parent - Returns the parent object for the current field.
* @property {boolean} LayoutCompactRow - Returns or sets the setting which specifies whether a pivot table field is compacted.
* @property {number} LayoutForm - Returns or sets the way the specified pivot table items appear — in table format or in outline format.
* @property {boolean} LayoutPageBreak - Returns or sets the setting which specifies whether to insert a page break after each field.
* @property {boolean} ShowingInAxis - Returns the setting which specifies whether the pivot table field is currently visible in the pivot table.
* @property {boolean} RepeatLabels - Returns or sets the setting which specifies whether to repeat items labels at each row.
* @property {boolean} LayoutBlankLine - Returns and sets the setting which specifies whether to insert blank rows after each item.
* @property {boolean} ShowAllItems - Returns or sets the setting which specifies whether to show items with no data.
* @property {boolean} LayoutSubtotals - Returns or sets the setting which specifies whether to show subtotals.
* @property {number} LayoutSubtotalLocation - Returns or sets the layout subtotal location.
* @property {string} SubtotalName - Returns or sets the text label displayed in the subtotal column or row heading in the specified pivot table report.
* @property {object} Subtotals - Returns or sets the subtotals.
* @property {number} Formula - Returns or sets a value that represents the object's formula.
* @property {boolean} DragToColumn - Returns or sets the setting which specifies whether the specified field can be dragged to the column position.
* @property {boolean} DragToRow - Returns or sets the setting which specifies whether the specified field can be dragged to the row position.
* @property {boolean} DragToData - Returns or sets the setting which specifies whether the specified field can be dragged to the data position.
* @property {boolean} DragToPage - Returns or sets the setting which specifies whether the specified field can be dragged to the page position.
* @property {string | null} NumberFormat - Returns or sets a value that represents the format code for the object.
* @property {string | number} CurrentPage - Returns the current page which is displayed for the page field (valid only for page fields).
* @property {ApiPivotItem | ApiPivotItem[]} PivotItems - Returns an object that represents either a single pivot table item (the ApiPivotItem object)
* or a collection of all the visible and hidden items (an array of the ApiPivotItem objects) in the specified field.
* @property {ApiPivotFilters} PivotFilters - Returns an object that represents the filters for the specified field.
* @property {string} AutoSortField - Returns the name of the field that is used to sort the specified field.
* @property {SortOrder} AutoSortOrder - Returns the sort order for the specified field.
*/
function ApiPivotField() {}

/**
* Class representing a pivot table data field.
* @constructor
* @extends ApiPivotField
* @property {DataConsolidateFunctionType} Function - Returns or sets a function for the data field.
* @property {number} Position - Returns or sets a value that represents the data field position within a category.
* @property {PivotFieldOrientationType} Orientation - Returns a data field orientation value
* that represents the data field location in the specified pivot table report.
* @property {string} Name - Returns or sets a value representing the object name.
* @property {string} Value - Returns or sets a value representing the name of the specified data field in the pivot table report.
* @property {string} Caption - Returns or sets a value that represents the label text for the data field.
* @property {string | null} NumberFormat - Returns or sets a value that represents the format code for the object.
* @property {number} Index - Returns an index of the data field.
* @property {ApiPivotField} PivotField - Returns the pivot field from which the data field was created.
*/
function ApiPivotDataField() {}

ApiPivotDataField.prototype = new ApiPivotField();

/**
* Class representing a pivot table field item.
* @constructor
* @property {string} Name - Returns a name of the pivot item.
* @property {string} Caption - Returns a caption of the pivot item.
* @property {string} Value - Returns a name of the specified item in the pivot table field.
* @property {string} Parent - Returns a parent of the pivot item.
* @property {string} Field - Returns a field of the pivot item.
* @property {boolean} Visible - Returns or sets the visibility of the pivot item.
*/
function ApiPivotItem() {}

/**
* Class representing characters in an object that contains text.
* @constructor
* @property {number} Count - The number of characters in the collection.
* @property {ApiRange} Parent - The parent object of the specified characters.
* @property {string} Caption - The text of the specified range of characters.
* @property {string} Text - The string value representing the text of the specified range of characters.
* @property {ApiFont} Font - The font of the specified characters.
*/
function ApiCharacters() {}

/**
* Class that contains the font attributes (font name, font size, color, and so on).
* @constructor
* @property {ApiCharacters} Parent - The parent object of the specified font object.
* @property {boolean | null} Bold - The font bold property.
* @property {boolean | null} Italic - The font italic property.
* @property {number | null} Size - The font size property.
* @property {boolean | null} Strikethrough - The font strikethrough property.
* @property {string | null} Underline - The font type of underline.
* @property {boolean | null} Subscript - The font subscript property.
* @property {boolean | null} Superscript - The font superscript property.
* @property {string | null} Name - The font name.
* @property {ApiColor | null} Color - The font color property.
*/
function ApiFont() {}

/**
* Class representing freeze panes.
* @constructor
*/
function ApiFreezePanes() {}

/**
* Class representing a worksheet function.
* @constructor
*/
function ApiWorksheetFunction() {}

/**
* Class representing a user-protected range.
* @constructor
*/
function ApiProtectedRange() {}

/**
* Class representing a user from the current protected range.
* @constructor
*/
function ApiProtectedRangeUserInfo() {}

/**
* Class representing a collection of pivot filters applied to a pivot field.
* @constructor
* @param {ApiPivotField} field - The pivot field that owns this filter collection.
*/
function ApiPivotFilters() {}

/**
* Class representing data validation.
* @constructor
* @property {ValidationType} Type - Returns the validation type.
* @property {ValidationAlertStyle} AlertStyle - Returns the validation alert style.
* @property {boolean} IgnoreBlank - Returns or sets a Boolean value that specifies whether blank values are permitted by the range data validation.
* @property {boolean} InCellDropdown - Returns or sets a Boolean value indicating whether data validation displays a drop-down list that contains acceptable values.
* @property {boolean} ShowInput - Returns or sets a Boolean value indicating whether the data validation input message will be displayed whenever the user selects a cell in the data validation range.
* @property {boolean} ShowError - Returns or sets a Boolean value indicating whether the data validation error message will be displayed whenever the user enters invalid data.
* @property {string} InputTitle - Returns or sets the title of the data-validation input dialog box.
* @property {string} InputMessage - Returns or sets the data validation input message.
* @property {string} ErrorTitle - Returns or sets the title of the data-validation error dialog box.
* @property {string} ErrorMessage - Returns or sets the data validation error message.
* @property {string} Formula1 - Returns the value or expression associated with the conditional format or data validation.
* @property {string} Formula2 - Returns the value or expression associated with the second part of a conditional format or data validation.
* @property {ValidationOperator} Operator - Returns the data validation operator.
* @property {ApiRange} Parent - Returns the parent range object.
* @property {string} Value - Returns the validation value.
*/
function ApiValidation() {}

/**
* Class representing a collection of format conditions.
* @constructor
* @property {number} Count - Returns the number of conditional formatting rules in the collection.
* @property {ApiRange} Parent - Returns the parent range object associated with the current conditional formatting collection.
*/
function ApiFormatConditions() {}

/**
* Class representing a single format condition.
* @constructor
* @property {XlFormatConditionType} Type - Returns the format condition type.
* @property {XlFormatConditionOperator} Operator - Returns the format condition operator.
* @property {string} Formula1 - Returns or sets the first formula used by the format condition.
* @property {string} Formula2 - Returns or sets the second formula used by the format condition.
* @property {XlTimePeriods} DateOperator - Returns or sets the date operator for time period conditions.
* @property {string} Text - Returns or sets the text for text-based conditions.
* @property {number} Rank - Returns or sets the rank for top/bottom conditional formatting rules.
* @property {boolean} PercentRank - Returns or sets whether the rank is percentage-based.
* @property {boolean} AboveBelow - Returns or sets whether the condition applies above or below the average.
* @property {number} StdDev - Returns or sets the number of standard deviations for average conditions.
* @property {number} Priority - Returns or sets the priority of the condition.
* @property {boolean} StopIfTrue - Returns or sets whether subsequent conditional formatting rules should be evaluated when this rule evaluates to true.
* @property {ApiRange} AppliesTo - Returns the range to which this condition applies.
* @property {string} NumberFormat - Returns or sets the number format applied to a cell when the conditional formatting rule evaluates to true.
* @property {ApiRange} Parent - Returns the parent range object of the format condition.
* @property {PTCondition} PTCondition - Returns the pivot table condition object.
* @property {XlPivotConditionScope} ScopeType - Returns or sets the scope type for the format condition.
* @property {XlContainsOperator} TextOperator - Returns or sets the text operator for text-based conditions.
* @property {ApiColor|'No Fill'} FillColor - Returns or sets the background color of the format condition.
*/
function ApiFormatCondition() {}

/**
* Class representing an above average conditional formatting rule.
* @constructor
* @extends ApiFormatCondition
* @property {boolean} AboveBelow - Returns or sets whether the rule is configured to detect values above or below the average.
* @property {number} NumStdDev - Returns or sets the number of standard deviations from the average.
* @property {XlFormatConditionType} Type - Returns the type of the above average conditional formatting rule.
*/
function ApiAboveAverage() {}

ApiAboveAverage.prototype = new ApiFormatCondition();

/**
* Class representing a color scale conditional formatting rule.
* @constructor
* @extends ApiFormatCondition
* @property {ApiColorScaleCriterion[]} ColorScaleCriteria - Returns the collection of criteria that define this color scale rule.
* @property {XlFormatConditionType} Type - Returns the type of the color scale conditional formatting rule.
*/
function ApiColorScale() {}

ApiColorScale.prototype = new ApiFormatCondition();

/**
* Class representing single criterion in a color scale conditional formatting rule.
* @constructor
* @property {XlConditionValueTypes} Type - Returns or sets the type of the color scale criterion.
* @property {string} Value - Returns or sets the value of the color scale criterion.
* @property {number} Index - Returns the index indicating which threshold the criterion represents.
* @property {ApiColor} Color - Returns or sets the format color of the color scale criterion.
*/
function ApiColorScaleCriterion() {}

/**
* Class representing a data bar conditional formatting rule.
* @constructor
* @extends ApiFormatCondition
* @property {XlDataBarAxisPosition} AxisPosition - Returns or sets the axis position of the data bar conditional formatting rule.
* @property {boolean} ShowValue - Returns or sets whether the data bar shows or hides the cell value.
* @property {XlReadingOrder} Direction - Returns or sets the direction of the data bar.
* @property {XlDataBarFillType} BarFillType - Returns or sets the bar fill type of the data bar.
* @property {object} MinPoint - Returns the minimum value condition of the data bar.
* @property {object} MaxPoint - Returns the maximum value condition of the data bar.
* @property {ApiColor} NegativeBarColor - Returns or sets the negative bar color of the data bar.
* @property {ApiColor} NegativeBorderColor - Returns or sets the negative bar border color of the data bar.
* @property {number} PercentMax - Returns or sets the percent maximum value of the data bar.
* @property {number} PercentMin - Returns or sets the percent minimum value of the data bar.
* @property {string} Formula - Returns the formula of the data bar.
* @property {XlFormatConditionType} Type - Returns the type of the data bar conditional formatting rule.
*/
function ApiDatabar() {}

ApiDatabar.prototype = new ApiFormatCondition();

/**
* Class representing an icon set conditional formatting rule.
* @constructor
* @extends ApiFormatCondition
* @property {XlIconSet} IconSet - Returns or sets the icon set type used in the conditional formatting rule.
* @property {boolean} PercentileValues - Returns or sets whether the thresholds for the icon set conditional format are determined by using percentiles.
* @property {boolean} ReverseOrder - Returns or sets whether the icon order in the icon set rule is reversed.
* @property {boolean} ShowIconOnly - Returns or sets whether to display only icons in the icon set rule (without cell values).
* @property {ApiIconCriterion[]} IconCriteria - Returns a collection of icon criteria that represent the threshold values and icons for the icon set conditional formatting rule.
* @property {string} Formula - Returns the formula associated with the icon set condition.
* @property {XlFormatConditionType} Type - Returns the type of the icon set conditional formatting rule.
*/
function ApiIconSetCondition() {}

ApiIconSetCondition.prototype = new ApiFormatCondition();

/**
* Class representing a single icon criterion.
* @constructor
* @property {XlConditionValueTypes} Type - Returns or sets the condition value type of the icon criterion.
* @property {string | number} Value - Returns or sets the threshold value of the icon criterion.
* @property {string} Operator - Returns or sets the comparison operator of the icon criterion.
* @property {number} Index - Returns the index of the icon criterion in the collection.
* @property {XlIcon} Icon - Returns or sets the icon of the icon criterion.
*/
function ApiIconCriterion() {}

/**
* Class representing a top 10 conditional formatting rule.
* @constructor
* @extends ApiFormatCondition
* @property {XlTopBottom} TopBottom - Returns or sets the "XlTopBottom" constant indicating whether the ranking is evaluated from the top or bottom.
* @property {boolean} Percent - Returns or sets whether the top 10 ranking is percentage-based.
* @property {number} Rank - Returns or sets the rank value of the top 10 condition.
* @property {XlFormatConditionType} Type - Returns the type of the top 10 conditional formatting rule.
*/
function ApiTop10() {}

ApiTop10.prototype = new ApiFormatCondition();

/**
* Class representing a unique values conditional formatting rule.
* @constructor
* @extends ApiFormatCondition
* @property {XlDuplicateValues} DupeUnique - Returns or sets the setting that specifies whether to format duplicate or unique values for the unique values conditional formatting rule.
* @property {XlFormatConditionType} Type - Returns the type of the unique values conditional formatting rule.
*/
function ApiUniqueValues() {}

ApiUniqueValues.prototype = new ApiFormatCondition();

/**
* Class representing worksheet autofilters.
* @constructor
* @property {ApiFilter[]} Filters - Returns the array of ApiFilter objects that represents the filters applied to the range.
* @property {boolean} FilterMode - Returns a value that indicates whether the worksheet has an AutoFilter applied.
* @property {ApiWorksheet} Parent - Returns the ApiWorksheet object that contains the AutoFilter.
* @property {ApiRange | null} Range - Returns the ApiRange object that represents the AutoFilter range; null if no AutoFilter is defined.
*/
function ApiAutoFilter() {}

/**
* Class representing a single AutoFilter column.
* @constructor
* @property {ApiAutoFilter} Parent - Returns the parent filters collection for this filter column.
* @property {string|string[]|number|XlDynamicFilterCriteria|null} Criteria1 - Returns the first criteria associated with the filter.
* @property {string|null} Criteria2 - Returns the second criteria associated with the filter (used with xlAnd/xlOr).
* @property {boolean} On - Indicates whether any filter is applied to this column.
* @property {XlAutoFilterOperator|null} Operator - Returns the operator used for the filter on this column.
*/
function ApiFilter() {}

/**
* Class representing a single column in a list object (table).
* @constructor
* @property {ApiRange | null} DataBodyRange - Returns the data body range of the column, excluding header and totals rows.
* @property {number} Index - Returns the 1-based index of the column within the table.
* @property {string} Name - Returns or sets the name of the column.
* @property {ApiListObject} Parent - Returns the parent list object.
* @property {ApiRange | null} Range - Returns the full range of the column, including header and totals rows.
* @property {XlTotalsCalculation} TotalsCalculation - Returns or sets the totals row calculation type.
* @property {ApiRange | null} Total - Returns the totals row cell range for the column.
*/
function ApiListColumn() {}

/**
* Class representing a formatted table.
* @constructor
* @property {boolean} Active - Indicates whether the active cell is within the table range.
* @property {string} AlternativeText - Returns or sets the alternative text for the table.
* @property {string} Comment - Returns or sets the comment (summary alternative text) for the table.
* @property {string} Name - Returns or sets the display name of the table.
* @property {string} DisplayName - Returns or sets the display name of the table.
* @property {string} Summary - Returns or sets the description of the table.
* @property {ApiWorksheet} Parent - Returns the parent worksheet.
* @property {ApiRange | null} Range - Returns the range of the table.
* @property {ApiRange | null} HeaderRowRange - Returns the range of the header row.
* @property {ApiRange | null} DataBodyRange - Returns the range of the data rows.
* @property {ApiRange | null} TotalsRowRange - Returns the range of the totals row; null if not shown.
* @property {XlListObjectSourceType} SourceType - Returns the data source type of the table.
* @property {string} TableStyle - Returns or sets the name of the table style.
* @property {boolean} ShowHeaders - Returns or sets whether the header row is displayed.
* @property {boolean} ShowTotals - Returns or sets whether the totals row is displayed.
* @property {boolean} ShowAutoFilter - Returns or sets whether the AutoFilter is present.
* @property {boolean} ShowAutoFilterDropDown - Returns or sets whether the AutoFilter dropdown arrows are shown.
* @property {boolean} ShowTableStyleColumnStripes - Returns or sets whether column stripes are applied.
* @property {boolean} ShowTableStyleFirstColumn - Returns or sets whether the first column style is applied.
* @property {boolean} ShowTableStyleLastColumn - Returns or sets whether the last column style is applied.
* @property {boolean} ShowTableStyleRowStripes - Returns or sets whether row stripes are applied.
* @property {ApiAutoFilter | null} AutoFilter - Returns the AutoFilter object for the table, or null.
* @property {ApiSort} Sort - Returns the Sort object associated with the table.
*/
function ApiListObject() {}

/**
* Class representing a single data row in a list object (table).
* @constructor
* @property {number} Index - Returns the 1-based index of the row within the data body.
* @property {ApiListObject} Parent - Returns the parent list object.
* @property {ApiRange | null} Range - Returns the range of the entire row spanning all columns.
*/
function ApiListRow() {}

/**
* Class representing the sort state of a list object (table).
* @constructor
* @property {ApiSortFields} SortFields - Returns the collection of sort fields.
* @property {boolean} MatchCase - Returns or sets whether the sort is case-sensitive.
* @property {string} Header - Returns the header setting (always "xlYes" for a ListObject).
* @property {XlSortOrientation} Orientation - Returns or sets the sort orientation.
* @property {XlSortMethod} SortMethod - Returns or sets the sort method for Chinese text.
* @property {ApiListObject} Parent - Returns the parent list object.
* @property {ApiRange | null} Rng - Returns the data body range that the sort applies to.
*/
function ApiSort() {}

/**
* Class representing the collection of sort fields for a Sort object.
* @constructor
* @property {ApiSort} Parent - Returns the parent Sort object.
* @property {number} Count - Returns the number of sort fields in the collection.
*/
function ApiSortFields() {}

/**
* Class representing a single sort field within a SortFields collection.
* @constructor
* @property {ApiSortFields} Parent - Returns the parent SortFields collection.
* @property {ApiRange | null} Key - Returns or sets the sort key range (the full table column).
* @property {XlSortOn} SortOn - Returns or sets what value is used as the sort criteria.
* @property {SortOrder} Order - Returns or sets the sort order.
* @property {number} Priority - Returns or sets the 1-based sort priority.
*/
function ApiSortField() {}

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
* Creates a new paragraph.
* @memberof Api
* @returns {ApiParagraph}
*/
ApiInterface.prototype.CreateParagraph = function() { return new ApiParagraph(); };

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
* Returns a class formatted according to the instructions contained in the format expression.
* @memberof Api
* @param {string} expression - Any valid expression.
* @param {string} [format] - A valid named or user-defined format expression.
* @returns {string}
*/
ApiInterface.prototype.Format = function(expression, format) { return ""; };

/**
* Creates a new custom function.
* The description of the function parameters and result is specified using JSDoc. The *@customfunction* tag is required in JSDoc.
* Parameters and results can be specified as the *number / string / boolean / any / number[][] / string[][] / boolean[][] / any[][]* types.
* Parameters can be required or optional. A user can also set a default value.
* The passed function can be asynchronous (async function or function returning a Promise).
* Inside the passed function, you can access the current cell address where the calculation is performed using *this.address*.
* You can also access the addresses of function arguments using *this.args[0].address*, *this.args[1].address*, etc.
* This method is not used in ONLYOFFICE Document Builder. Use AddCustomFunctionLibrary instead.
* @memberof Api
* @param {Function} fCustom - A new function for calculating. Can be synchronous or asynchronous.
*/
ApiInterface.prototype.AddCustomFunction = function(fCustom) {};

/**
* Registers a new custom functions library (see the <b>SetCustomFunctions</b> plugin method).
* The description of the function parameters and result is specified using JSDoc. The *@customfunction* tag is required in JSDoc.
* Parameters and results can be specified as the *number / string / boolean / any / number[][] / string[][] / boolean[][] / any[][]* types.
* Parameters can be required or optional. A user can also set a default value.
* @memberof Api
* @param {string} sName - The library name.
* @param {Function} Func - The custom functions library code.
* @since 8.2.0
*/
ApiInterface.prototype.AddCustomFunctionLibrary = function(sName, Func) {};

/**
* Removes a custom function.
* @memberof Api
* @param {string} sName - The name of a custom function.
* @returns {boolean} - returns false if such a function does not exist.
*/
ApiInterface.prototype.RemoveCustomFunction = function(sName) { return true; };

/**
* Clears all custom functions.
* @memberof Api
* @returns {boolean} - returns false if such functions do not exist.
*/
ApiInterface.prototype.ClearCustomFunctions = function() { return true; };

/**
* Creates a new worksheet. The new worksheet becomes the active sheet.
* @memberof Api
* @param {string} sName - The name of a new worksheet.
* @returns {ApiWorksheet}
*/
ApiInterface.prototype.AddSheet = function(sName) { return new ApiWorksheet(); };

/**
* Returns a sheet collection that represents all the sheets in the active workbook.
* @memberof Api
* @returns {ApiWorksheet[]}
*/
ApiInterface.prototype.GetSheets = function() { return []; };

/**
* Sets a locale to the document.
* @memberof Api
* @param {number} LCID - The locale specified.
* @returns {boolean} - returns true if the locale was set successfully.
*/
ApiInterface.prototype.SetLocale = function(LCID) { return true; };

/**
* Returns the current locale ID.
* @memberof Api
* @returns {number}
*/
ApiInterface.prototype.GetLocale = function() { return 0; };

/**
* Returns an object that represents the active sheet.
* @memberof Api
* @returns {ApiWorksheet}
*/
ApiInterface.prototype.GetActiveSheet = function() { return new ApiWorksheet(); };

/**
* Returns an object that represents the active workbook.
* @memberof Api
* @returns {ApiWorkbook}
*/
ApiInterface.prototype.GetActiveWorkbook = function() { return new ApiWorkbook(); };

/**
* Returns an object that represents a sheet.
* @memberof Api
* @param {string | number} nameOrIndex - Sheet name or sheet index.
* @returns {ApiWorksheet | null}
*/
ApiInterface.prototype.GetSheet = function(nameOrIndex) { return new ApiWorksheet(); };

/**
* Returns a list of all the available theme colors for the spreadsheet.
* @memberof Api
* @returns {string[]}
*/
ApiInterface.prototype.GetThemesColors = function() { return []; };

/**
* Sets the theme colors to the current spreadsheet.
* @memberof Api
* @param {string} sTheme - The color scheme that will be set to the current spreadsheet.
* @returns {boolean} - returns false if sTheme isn't a string.
*/
ApiInterface.prototype.SetThemeColors = function(sTheme) { return true; };

/**
* Creates a new history point.
* @memberof Api
* @returns {boolean} - returns true if the history point was created successfully.
*/
ApiInterface.prototype.CreateNewHistoryPoint = function() { return true; };

/**
* Creates an RGB color setting the appropriate values for the red, green and blue color components.
* @memberof Api
* @param {byte} r - Red color component value.
* @param {byte} g - Green color component value.
* @param {byte} b - Blue color component value.
* @returns {ApiColor}
*/
ApiInterface.prototype.CreateColorFromRGB = function(r, g, b) { return new ApiColor(); };

/**
* Creates a color selecting it from one of the available color presets.
* @memberof Api
* @param {PresetColor} sPresetColor - A preset selected from the list of the available color preset names.
* @returns {ApiColor}
*/
ApiInterface.prototype.CreateColorByName = function(sPresetColor) { return new ApiColor(); };

/**
* Returns the ApiRange object that represents the rectangular intersection of two or more ranges. If one or more ranges from a different worksheet are specified, an error will be returned.
* @memberof Api
* @param {ApiRange} Range1 - One of the intersecting ranges. At least two Range objects must be specified.
* @param {ApiRange} Range2 - One of the intersecting ranges. At least two Range objects must be specified.
* @returns {ApiRange | null}
*/
ApiInterface.prototype.Intersect = function(Range1, Range2) { return new ApiRange(); };

/**
* Returns an object that represents the selected range.
* @memberof Api
* @returns {ApiRange}
*/
ApiInterface.prototype.GetSelection = function() { return new ApiRange(); };

/**
* Adds a new name to a range of cells.
* @memberof Api
* @param {string} sName - The range name.
* @param {string} sRef - The reference to the specified range. It must contain the sheet name, followed by sign ! and a range of cells.
* Example: "Sheet1!$A$1:$B$2".
* @param {boolean} isHidden - Defines if the range name is hidden or not.
* @returns {boolean} - returns false if sName or sRef are invalid.
*/
ApiInterface.prototype.AddDefName = function(sName, sRef, isHidden) { return true; };

/**
* Returns the ApiName object by the range name.
* @memberof Api
* @param {string} defName - The range name.
* @returns {ApiName}
*/
ApiInterface.prototype.GetDefName = function(defName) { return new ApiName(); };

/**
* Saves changes to the specified document.
* @memberof Api
* @returns {boolean}
*/
ApiInterface.prototype.Save = function() { return true; };

/**
* Returns the ApiRange object by the range reference.
* @memberof Api
* @param {string} sRange - The range of cells from the current sheet.
* @returns {ApiRange}
*/
ApiInterface.prototype.GetRange = function(sRange) { return new ApiRange(); };

/**
* Returns the ApiWorksheetFunction object.
* @memberof Api
* @returns {ApiWorksheetFunction}
*/
ApiInterface.prototype.GetWorksheetFunction = function() { return new ApiWorksheetFunction(); };

/**
* Returns the mail merge data.
* @memberof Api
* @param {number} nSheet - The sheet index.
* @param {boolean} [bWithFormat=false] - Specifies that the data will be received with the format.
* @returns {string[][]}
*/
ApiInterface.prototype.GetMailMergeData = function(nSheet, bWithFormat) { return []; };

/**
* Recalculates all formulas in the active workbook.
* @memberof Api
* @param {Function} [fLogger] - A function which specifies the logger object for checking recalculation of formulas.
* @returns {boolean}
*/
ApiInterface.prototype.RecalculateAllFormulas = function(fLogger) { return true; };

/**
* Inserts the specified pivot table into an existing worksheet.
* @memberof Api
* @param {ApiRange} dataRef - The source data range.
* @param {ApiRange} pivotRef - A range in which the pivot table will be located.
* @param {boolean} confirmation - Specifies whether to replace the data in the specified pivot table range (if it exists) or create a dialog box for this (if it exists).
* @returns {ApiPivotTable}
* @since 8.2.0
*/
ApiInterface.prototype.InsertPivotExistingWorksheet = function(dataRef, pivotRef, confirmation) { return new ApiPivotTable(); };

/**
* Inserts the specified pivot table into a new worksheet.
* @memberof Api
* @param {ApiRange} dataRef - The source data range.
* @param {ApiRange} [newSheetName] - A new worksheet name.
* @returns {ApiPivotTable}
* @since 8.2.0
*/
ApiInterface.prototype.InsertPivotNewWorksheet = function(dataRef, newSheetName) { return new ApiPivotTable(); };

/**
* Returns a pivot table by its name, or null if it does not exist.
* @memberof Api
* @param {string} name - The pivot table name.
* @returns {ApiPivotTable|null}
* @since 8.2.0
*/
ApiInterface.prototype.GetPivotByName = function(name) { return new ApiPivotTable(); };

/**
* Refreshes all pivot tables.
* @memberof Api
* @since 8.2.0
*/
ApiInterface.prototype.RefreshAllPivots = function() {};

/**
* Returns all pivot tables.
* @memberof Api
* @returns {ApiPivotTable[]}
* @since 8.2.0
*/
ApiInterface.prototype.GetAllPivotTables = function() { return []; };

/**
* Subscribes to the specified event and calls the callback function when the event fires.
* @function
* @memberof Api
* @param {string} eventName - The event name.
* @param {function} callback - Function to be called when the event fires.
* @fires Api#onWorksheetChange
*/
ApiInterface.prototype.attachEvent = function(eventName, callback) {};

/**
* Unsubscribes from the specified event.
* @function
* @memberof Api
* @param {string} eventName - The event name.
* @fires Api#onWorksheetChange
*/
ApiInterface.prototype.detachEvent = function(eventName) {};

/**
* Returns an array of ApiComment objects.
* @memberof Api
* @param {string} sText - The comment text.
* @param {string} sAuthor - The author's name (optional).
* @returns {ApiComment | null}
* @since 7.5.0
*/
ApiInterface.prototype.AddComment = function(sText, sAuthor) { return new ApiComment(); };

/**
* Returns a comment from the current document by its ID.
* @memberof Api
* @param {string} sId - The comment ID.
* @returns {?ApiComment}
*/
ApiInterface.prototype.GetCommentById = function(sId) { return new ApiComment(); };

/**
* Returns all comments related to the whole workbook.
* @memberof Api
* @returns {ApiComment[]}
*/
ApiInterface.prototype.GetComments = function() { return []; };

/**
* Returns all comments from the current workbook including comments from all worksheets.
* @memberof Api
* @returns {ApiComment[]}
*/
ApiInterface.prototype.GetAllComments = function() { return []; };

/**
* Sets a type to the freeze panes.
* @memberof Api
* @param {FreezePaneType} FreezePaneType - The freeze panes type ("null" to unfreeze).
* @since 8.0.0
*/
ApiInterface.prototype.SetFreezePanesType = function(FreezePaneType) {};

/**
* Returns the freeze panes type.
* @memberof Api
* @returns {FreezePaneType} FreezePaneType - The freeze panes type ("null" if there are no freeze panes).
* @since 8.0.0
*/
ApiInterface.prototype.GetFreezePanesType = function() { return new FreezePaneType(); };

/**
* Returns the cell reference style.
* @memberof Api
* @returns {ReferenceStyle} - The cell reference style.
* @since 8.1.0
*/
ApiInterface.prototype.GetReferenceStyle = function() { return new ReferenceStyle(); };

/**
* Sets the cell reference style.
* @memberof Api
* @param {ReferenceStyle} sReferenceStyle - The cell reference style.
* @since 8.1.0
*/
ApiInterface.prototype.SetReferenceStyle = function(sReferenceStyle) {};

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
* @memberof Api
* @returns {object}
*/
ApiInterface.prototype.GetDocumentInfo = function() { return new object(); };

/**
* Returns the core properties interface for the workbook.
* This method is used to view or modify standard metadata such as title, author, and keywords.
* @memberof Api
* @returns {ApiCore}
* @since 9.0.0
*/
ApiInterface.prototype.GetCore = function() { return new ApiCore(); };

/**
* Returns the workbook custom properties.
* @memberof Api
* @returns {ApiCustomProperties}
* @since 9.0.0
*/
ApiInterface.prototype.GetCustomProperties = function() { return new ApiCustomProperties(); };

/**
* Returns an array of all ApiName objects defined in the workbook, across all scopes (workbook-level and sheet-level).
* @memberof Api
* @returns {ApiName[]} - Returns an empty array if no defined names are found.
*/
ApiInterface.prototype.GetDefNames = function() { return []; };

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
* Sets values from the specified range to the specified series.
* @memberof ApiChart
* @param {string} sRange - A range of cells from the sheet with series values. For example:
* "'sheet 1'!$A$2:$A$5" - must be a single cell, row or column,
* "A1:A5" - must be a single cell, row or column,
* "Example series".
* @param {number} nSeria - The index of the chart series.
* @returns {boolean}
*/
ApiChart.prototype.SetSeriaValues = function(sRange, nSeria) { return true; };

/**
* Sets the x-axis values from the specified range to the specified series. It is used with the scatter charts only.
* @memberof ApiChart
* @param {string} sRange - A range of cells from the sheet with series x-axis values. For example:
* "'sheet 1'!$A$2:$A$5" - must be a single cell, row or column,
* "A1:A5" - must be a single cell, row or column,
* "Example series".
* @param {number} nSeria - The index of the chart series.
* @returns {boolean}
*/
ApiChart.prototype.SetSeriaXValues = function(sRange, nSeria) { return true; };

/**
* Sets a name to the specified series.
* @memberof ApiChart
* @param {string} sNameRange - The series name. Can be a range of cells or usual text. For example:
* "'sheet 1'!$A$2:$A$5" - must be a single cell, row or column,
* "A1:A5" - must be a single cell, row or column,
* "Example series".
* @param {number} nSeria - The index of the chart series.
* @returns {boolean}
*/
ApiChart.prototype.SetSeriaName = function(sNameRange, nSeria) { return true; };

/**
* Sets a range with the category values to the current chart.
* @memberof ApiChart
* @param {string} sRange - A range of cells from the sheet with the category names. For example:
* "'sheet 1'!$A$2:$A$5" - must be a single cell, row or column,
* "A1:A5" - must be a single cell, row or column.
*/
ApiChart.prototype.SetCatFormula = function(sRange) {};

/**
* Adds a new series to the current chart.
* @memberof ApiChart
* @param {string} sNameRange - The series name. Can be a range of cells or usual text. For example:
* "'sheet 1'!$A$2:$A$5" - must be a single cell, row or column,
* "A1:A5" - must be a single cell, row or column,
* "Example series".
* @param {string} sValuesRange - A range of cells from the sheet with series values. For example:
* "'sheet 1'!$A$2:$A$5" - must be a single cell, row or column,
* "A1:A5" - must be a single cell, row or column.
* @param {string} [sXValuesRange=undefined] - A range of cells from the sheet with series x-axis values. It is used with the scatter charts only. For example:
* "'sheet 1'!$A$2:$A$5" - must be a single cell, row or column,
* "A1:A5" - must be a single cell, row or column.
*/
ApiChart.prototype.AddSeria = function(sNameRange, sValuesRange, sXValuesRange) {};

/**
* Creates a copy of the specified chart.
* @memberof ApiChart
* @returns {ApiChart} - return null if drawing doesn't exist.
* @since 9.4.0
*/
ApiChart.prototype.Copy = function() { return new ApiChart(); };

/**
* Returns the parent sheet of the current drawing.
* @memberof ApiDrawing
* @returns {?ApiWorksheet}
* @since 8.3.0
*/
ApiChart.prototype.GetParentSheet = function() { return new ApiWorksheet(); };

/**
* Sets a size of the object (image, shape, chart) bounding box.
* @memberof ApiDrawing
* @param {EMU} nWidth - The object width measured in English measure units.
* @param {EMU} nHeight - The object height measured in English measure units.
*/
ApiChart.prototype.SetSize = function(nWidth, nHeight) {};

/**
* Changes the position for the drawing object.
* <note>Please note that the horizontal and vertical offsets are calculated within the limits of
* the specified column and row cells only. If this value exceeds the cell width or height, another vertical/horizontal position will be set.</note>
* @memberof ApiDrawing
* @param {number} nFromCol - The number of the column where the beginning of the drawing object will be placed.
* @param {EMU} nColOffset - The offset from the nFromCol column to the left part of the drawing object measured in English measure units.
* @param {number} nFromRow - The number of the row where the beginning of the drawing object will be placed.
* @param {EMU} nRowOffset - The offset from the nFromRow row to the upper part of the drawing object measured in English measure units.
*/
ApiChart.prototype.SetPosition = function(nFromCol, nColOffset, nFromRow, nRowOffset) {};

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
* Selects the current graphic object.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} [isReplace=false] - Specifies whether the selection should replace the current selection (true) or be added to it (false).
*/
ApiChart.prototype.Select = function(isReplace) {};

/**
* Removes the current drawing from the selection.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean} - Returns false if the drawing or controller is not available, otherwise returns true.
*/
ApiChart.prototype.Unselect = function() { return true; };

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
* Deletes the specified drawing object.
*
* @memberof ApiDrawing
* @returns {boolean} - returns false if the drawing object can not be deleted.
*
* @since 9.4.0
*/
ApiChart.prototype.Delete = function() { return true; };

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
* @memberof ApiColor
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
* Returns a color value in RGB format.
* @memberof ApiColor
* @returns {number}
*/
ApiColor.prototype.GetRGB = function() { return 0; };

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
* For double-byte character set (DBCS) languages, the function changes full-width (double-byte) characters to half-width (single-byte) characters.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The text or a reference to a cell containing the text to change.
* @returns {string}
*/
ApiWorksheetFunction.prototype.ASC = function(arg1) { return ""; };

/**
* Returns the character specified by the code number from your computer's character set.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A number between 1 and 255 specifying a character from the computer character set.
* @returns {string}
*/
ApiWorksheetFunction.prototype.CHAR = function(arg1) { return ""; };

/**
* Removes all the nonprintable characters from the text.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - A string from which nonprintable characters will be removed.
* @returns {string}
*/
ApiWorksheetFunction.prototype.CLEAN = function(arg1) { return ""; };

/**
* Returns the code number from your computer's character set for the first character in the specified text string.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The text for which to get the code of the first character.
* @returns {number}
*/
ApiWorksheetFunction.prototype.CODE = function(arg1) { return 0; };

/**
* Combines multiple text strings into one text string.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg_n - Up to 255 data values that will be combined.
* @returns {string}
*/
ApiWorksheetFunction.prototype.CONCATENATE = function(arg_n) { return ""; };

/**
* Converts a number to text, using a currency format $#.##.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number | string} arg1 - A number, a reference to a cell containing a number, or a formula that returns a number.
* @param {ApiRange | ApiName | number} [arg2] - A number of digits to the right of the decimal point. The number is rounded as necessary.
* If it is omitted, the function will assume it to be 2.
* @returns {string}
*/
ApiWorksheetFunction.prototype.DOLLAR = function(arg1, arg2) { return ""; };

/**
* Checks whether two text strings are exactly the same, and returns <b>true</b> or <b>false</b>. This function is case-sensitive.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The first text string.
* @param {ApiRange | ApiName | string} arg2 - The second text string.
* @returns {boolean}
*/
ApiWorksheetFunction.prototype.EXACT = function(arg1, arg2) { return true; };

/**
* Returns the starting position of one text string within another text string. This function is case-sensitive.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The text to find. Use double quotes (empty text) to match the first character in the search string.
* Wildcard characters are not allowed.
* @param {ApiRange | ApiName | string} arg2 - The text containing the text to find.
* @param {ApiRange | ApiName | number} [arg3] - Specifies the character at which to start the search. The first character in the search string is character number 1.
* If omitted, this parameter is equal to 1.
* @returns {number}
*/
ApiWorksheetFunction.prototype.FIND = function(arg1, arg2, arg3) { return 0; };

/**
* Finds the specified substring within another string and is intended for languages that use the double-byte character set (DBCS) like Japanese, Chinese, Korean etc.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The text to find. Use double quotes (empty text) to match the first character in the search string.
* Wildcard characters are not allowed.
* @param {ApiRange | ApiName | string} arg2 - The text containing the text to find.
* @param {ApiRange | ApiName | number} [arg3] - Specifies the character at which to start the search. The first character in the search string is character number 1.
* If omitted, this parameter is equal to 1.
* @returns {number}
*/
ApiWorksheetFunction.prototype.FINDB = function(arg1, arg2, arg3) { return 0; };

/**
* Rounds a number to the specified number of decimals and returns the result as text with or without commas.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The number to round and convert to text.
* @param {ApiRange | ApiName | number} [arg2] - The number of digits to the right of the decimal point. If omitted, the function will assume it to be 2.
* @param {ApiRange | ApiName | boolean} [arg3] - Specifies whether do display commas in the returned text (<b>false</b> or omitted) or not (<b>true</b>).
* @returns {string}
*/
ApiWorksheetFunction.prototype.FIXED = function(arg1, arg2, arg3) { return ""; };

/**
* Returns the specified number of characters from the start of a text string.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The text string containing the characters to extract.
* @param {ApiRange | ApiName | number} [arg2] - A number of the substring characters. It must be greater than or equal to 0.
* @returns {string}
*/
ApiWorksheetFunction.prototype.LEFT = function(arg1, arg2) { return ""; };

/**
* Extracts the substring from the specified string starting from the left character and is intended for languages that use the double-byte character set (DBCS) like Japanese, Chinese, Korean etc.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The text string containing the characters to extract.
* @param {ApiRange | ApiName | number} [arg2] - A number of the substring characters, based on bytes.
* @returns {string}
*/
ApiWorksheetFunction.prototype.LEFTB = function(arg1, arg2) { return ""; };

/**
* Returns the number of characters in a text string.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The text whose length will be returned. Spaces are considered as characters.
* @returns {number}
*/
ApiWorksheetFunction.prototype.LEN = function(arg1) { return 0; };

/**
* Analyses the specified string and returns the number of characters it contains and is intended for languages that use the double-byte character set (DBCS) like Japanese, Chinese, Korean etc.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The text whose length will be returned. Spaces are considered as characters.
* @returns {number}
*/
ApiWorksheetFunction.prototype.LENB = function(arg1) { return 0; };

/**
* Converts all letters in a text string to lowercase.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The text to convert to lowercase. The text characters that are not letters are not changed.
* @returns {string}
*/
ApiWorksheetFunction.prototype.LOWER = function(arg1) { return ""; };

/**
* Returns the characters from the middle of a text string, given a starting position and length.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The text string from which to extract the characters.
* @param {ApiRange | ApiName | number} arg2 - The position of the first character to extract. The first text character is 1.
* @param {ApiRange | ApiName | number} arg3 - A number of the characters to extract.
* @returns {string}
*/
ApiWorksheetFunction.prototype.MID = function(arg1, arg2, arg3) { return ""; };

/**
* Extracts the characters from the specified string starting from any position and is intended for languages that use the double-byte character set (DBCS) like Japanese, Chinese, Korean etc.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The text string from which to extract the characters.
* @param {ApiRange | ApiName | number} arg2 - The position of the first character to extract. The first text character is 1.
* @param {ApiRange | ApiName | number} arg3 - A number of the characters to extract, based on bytes.
* @returns {string}
*/
ApiWorksheetFunction.prototype.MIDB = function(arg1, arg2, arg3) { return ""; };

/**
* Converts text to a number, in a locale-independent way.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The string representing a number to convert.
* @param {ApiRange | ApiName | string} [arg2] - The character used as the decimal separator in the string.
* @param {ApiRange | ApiName | string} [arg3] - The character used as the group separator in the string.
* @returns {number}
*/
ApiWorksheetFunction.prototype.NUMBERVALUE = function(arg1, arg2, arg3) { return 0; };

/**
* Converts a text string to proper case: the first letter in each word to uppercase, and all other letters to lowercase.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The text enclosed in quotation marks, a formula that returns text, or a reference to a cell containing text to partially capitalize.
* @returns {string}
*/
ApiWorksheetFunction.prototype.PROPER = function(arg1) { return ""; };

/**
* Replaces part of a text string with a different text string.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The text where some characters will be replaced.
* @param {ApiRange | ApiName | number} arg2 - The position of the character in the original text that will be replaced with the new text.
* @param {ApiRange | ApiName | number} arg3 - The number of characters in the original text that will be replaced.
* @param {ApiRange | ApiName | string} arg4 - The text that will replace characters in the original text.
* @returns {string}
*/
ApiWorksheetFunction.prototype.REPLACE = function(arg1, arg2, arg3, arg4) { return ""; };

/**
* Replaces a set of characters, based on the number of characters and the start position specified, with a new set of characters and is intended for languages that use the double-byte character set (DBCS) like Japanese, Chinese, Korean etc.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The text where some characters will be replaced.
* @param {ApiRange | ApiName | number} arg2 - The position of the character in the original text that will be replaced with the new text.
* @param {ApiRange | ApiName | number} arg3 - The number of characters in the original text that will be replaced, based on bytes.
* @param {ApiRange | ApiName | string} arg4 - The text that will replace characters in the original text.
* @returns {string}
*/
ApiWorksheetFunction.prototype.REPLACEB = function(arg1, arg2, arg3, arg4) { return ""; };

/**
* Repeats text a given number of times. Use this function to fill a cell with a number of instances of a text string.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The text that will be repeated.
* @param {ApiRange | ApiName | number} arg2 - A positive number specifying the number of times to repeat text.
* @returns {string}
*/
ApiWorksheetFunction.prototype.REPT = function(arg1, arg2) { return ""; };

/**
* Returns the specified number of characters from the end of a text string.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The text string that contains the characters to extract.
* @param {ApiRange | ApiName | number} [arg2] - A number of the substring characters. If it is omitted, the function will assume it to be 1.
* @returns {string}
*/
ApiWorksheetFunction.prototype.RIGHT = function(arg1, arg2) { return ""; };

/**
* Extracts a substring from a string starting from the right-most character, based on the specified number of characters and is intended for languages that use the double-byte character set (DBCS) like Japanese, Chinese, Korean etc.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The text string that contains the characters to extract.
* @param {ApiRange | ApiName | number} [arg2] - A number of the substring characters, based on bytes.
* @returns {string}
*/
ApiWorksheetFunction.prototype.RIGHTB = function(arg1, arg2) { return ""; };

/**
* Returns the number of the character at which a specific character or text string is first found, reading left to right (not case-sensitive).
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The text to find. The ? and * wildcard characters can be used. Use ~? and ~* to find the ? and * characters.
* @param {ApiRange | ApiName | string} arg2 - The text where to search for the specified text.
* @param {ApiRange | ApiName | number} [arg3] - The character number in the search text, counting from the left, at which to start searching. If omitted, 1 is used.
* @returns {number}
*/
ApiWorksheetFunction.prototype.SEARCH = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the location of the specified substring in a string and is intended for languages that use the double-byte character set (DBCS) like Japanese, Chinese, Korean etc.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The text to find. The ? and * wildcard characters can be used. Use ~? and ~* to find the ? and * characters.
* @param {ApiRange | ApiName | string} arg2 - The text where to search for the specified text.
* @param {ApiRange | ApiName | number} [arg3] - The character number in the search text, counting from the left, at which to start searching. If omitted, 1 is used.
* @returns {number}
*/
ApiWorksheetFunction.prototype.SEARCHB = function(arg1, arg2, arg3) { return 0; };

/**
* Replaces existing text with new text in a text string.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The text or the reference to a cell containing text in which the characters will be substituted.
* @param {ApiRange | ApiName | string} arg2 - The existing text to replace. If the case of the original text does not match the case of text, the function will not replace the text.
* @param {ApiRange | ApiName | string} arg3 - The text to replace the original text with.
* @param {ApiRange | ApiName | string} [arg4] - Specifies which occurrence of the original text to replace. If omitted, every instance of the original text will be replaced.
* @returns {string}
*/
ApiWorksheetFunction.prototype.SUBSTITUTE = function(arg1, arg2, arg3, arg4) { return ""; };

/**
* Checks whether a value is text, and returns the text if it is, or returns double quotes (empty text) if it is not.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number | string | boolean} arg1 - The value to test.
* @returns {ApiRange | ApiName | string}
*/
ApiWorksheetFunction.prototype.T = function(arg1) { return new ApiRange(); };

/**
* Converts a value to text in a specific number format.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number | string} arg1 - A number, a formula that evaluates to a numeric value, or a reference to a cell containing a numeric value.
* @param {ApiRange | ApiName | string} arg2 - A number format in the text form from the <b>Number format</b> combo box on the <b>Home</b> tab.
* @returns {string}
*/
ApiWorksheetFunction.prototype.TEXT = function(arg1, arg2) { return ""; };

/**
* Removes all spaces from a text string except for single spaces between words.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The text from which the spaces will be removed.
* @returns {string}
*/
ApiWorksheetFunction.prototype.TRIM = function(arg1) { return ""; };

/**
* Returns the Unicode character referenced by the given numeric value.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The Unicode number representing a character.
* @returns {string}
*/
ApiWorksheetFunction.prototype.UNICHAR = function(arg1) { return ""; };

/**
* Returns the number (code point) corresponding to the first character of the text.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The character for which the Unicode value will be returned.
* @returns {number}
*/
ApiWorksheetFunction.prototype.UNICODE = function(arg1) { return 0; };

/**
* Converts a text string to all uppercase letters.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The text which will be converted to uppercase, a reference or a text string.
* @returns {string}
*/
ApiWorksheetFunction.prototype.UPPER = function(arg1) { return ""; };

/**
* Converts a text string that represents a number to a number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The text enclosed in quotation marks or a reference to a cell containing the text which will be converted to a number.
* @returns {number}
*/
ApiWorksheetFunction.prototype.VALUE = function(arg1) { return 0; };

/**
* Returns the average of the absolute deviations of data points from their mean.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number | number[]} args - Up to 255 numeric values for which the average of the absolute deviations will be returned. The first argument is required,
* subsequent arguments are optional. Arguments can be numbers, names, or arrays of numbers.
* @returns {number}
*/
ApiWorksheetFunction.prototype.AVEDEV = function(args) { return 0; };

/**
* Returns the average (arithmetic mean) of the specified arguments.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number | number[]} args - Up to 255 numeric values for which the average value will be returned. The first argument is required,
* subsequent arguments are optional. Arguments can be numbers, names, or arrays of numbers.
* @returns {number}
*/
ApiWorksheetFunction.prototype.AVERAGE = function(args) { return 0; };

/**
* Returns the average (arithmetic mean) of the specified arguments, evaluating text and <b>false</b> in arguments as 0; <b>true</b> evaluates as 1.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number | string | number[]} args - Up to 255 numeric values for which the average value will be returned. The first argument is required,
* subsequent arguments are optional. Arguments can be numbers, text, or logical values, such as <b>true</b> and <b>false</b>, names, or arrays of numbers.
* @returns {number}
*/
ApiWorksheetFunction.prototype.AVERAGEA = function(args) { return 0; };

/**
* Finds the average (arithmetic mean) for the cells specified by a given condition or criteria.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName} arg1 - The range of cells which will be evaluated.
* @param {ApiRange | ApiName | number | string} arg2 - The condition or criteria in the form of a number, expression, or text that defines which cells will be used to find the average.
* @param {ApiRange | ApiName} [arg3] - The actual cells to be used to find the average. If omitted, the cells in the range are used.
* @returns {number}
*/
ApiWorksheetFunction.prototype.AVERAGEIF = function(arg1, arg2, arg3) { return 0; };

/**
* Finds the average (arithmetic mean) for the cells specified by a given set of conditions or criteria.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName} arg1 - The range of cells which will be evaluated.
* @param {ApiRange | ApiName | number | string} arg2 - The first condition or criteria in the form of a number, expression, or text that defines which cells will be used to find the average.
* @param {ApiRange | ApiName} [arg3] - The actual cells to be used to find the average. If omitted, the cells in the range are used.
* @param {ApiRange | ApiName | number | string} [arg4] - Up to 127 additional conditions or criteria in the form of a number, expression, or text that defines which cells will be used to find the average.
* These arguments are optional.
* @param {ApiRange | ApiName} [arg5] - Up to 127 actual ranges to be used to find the average. If omitted, the cells in the range are used. These arguments are optional.
* @returns {number}
*/
ApiWorksheetFunction.prototype.AVERAGEIFS = function(arg1, arg2, arg3, arg4, arg5) { return 0; };

/**
* Returns the cumulative beta probability density function.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value between A and B at which to evaluate the function.
* @param {ApiRange | ApiName | number} arg2 - The alpha parameter of the distribution which must be greater than 0.
* @param {ApiRange | ApiName | number} arg3 - The beta parameter of the distribution which must be greater than 0.
* @param {ApiRange | ApiName | number} [arg4] - An optional lower bound to the interval of x (A). If omitted, it is equal to 0.
* @param {ApiRange | ApiName | number} [arg5] - An optional upper bound to the interval of x (B). If omitted, it is equal to 1.
* @returns {number}
*/
ApiWorksheetFunction.prototype.BETADIST = function(arg1, arg2, arg3, arg4, arg5) { return 0; };

/**
* Returns the beta probability distribution function.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value between A and B at which to evaluate the function.
* @param {ApiRange | ApiName | number} arg2 - The alpha parameter of the distribution which must be greater than 0.
* @param {ApiRange | ApiName | number} arg3 - The beta parameter of the distribution which must be greater than 0.
* @param {ApiRange | ApiName | boolean} arg4 - Specifies if this is the cumulative distribution function (<b>true</b>) or the probability density function (<b>false</b>).
* @param {ApiRange | ApiName | number} [arg5] - An optional lower bound to the interval of x (A). If omitted, it is equal to 0.
* @param {ApiRange | ApiName | number} [arg6] - An optional upper bound to the interval of x (B). If omitted, it is equal to 1.
* @returns {number}
*/
ApiWorksheetFunction.prototype.BETA_DIST = function(arg1, arg2, arg3, arg4, arg5, arg6) { return 0; };

/**
* Returns the inverse of the cumulative beta probability density function (BETA_DIST).
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A probability associated with the beta distribution.
* @param {ApiRange | ApiName | number} arg2 - The alpha parameter of the distribution which must be greater than 0.
* @param {ApiRange | ApiName | number} arg3 - The beta parameter of the distribution which must be greater than 0.
* @param {ApiRange | ApiName | number} [arg4] - An optional lower bound to the interval of x (A). If omitted, it is equal to 0.
* @param {ApiRange | ApiName | number} [arg5] - An optional upper bound to the interval of x (B). If omitted, it is equal to 1.
* @returns {number}
*/
ApiWorksheetFunction.prototype.BETA_INV = function(arg1, arg2, arg3, arg4, arg5) { return 0; };

/**
* Returns the inverse of the cumulative beta probability density function for a specified beta distribution (BETADIST).
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A probability associated with the beta distribution.
* @param {ApiRange | ApiName | number} arg2 - The alpha parameter of the distribution which must be greater than 0.
* @param {ApiRange | ApiName | number} arg3 - The beta parameter of the distribution which must be greater than 0.
* @param {ApiRange | ApiName | number} [arg4] - An optional lower bound to the interval of x (A). If omitted, it is equal to 0.
* @param {ApiRange | ApiName | number} [arg5] - An optional upper bound to the interval of x (B). If omitted, it is equal to 1.
* @returns {number}
*/
ApiWorksheetFunction.prototype.BETAINV = function(arg1, arg2, arg3, arg4, arg5) { return 0; };

/**
* Returns the individual term binomial distribution probability.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The number of successes in trials.
* @param {ApiRange | ApiName | number} arg2 - The number of independent trials.
* @param {ApiRange | ApiName | number} arg3 - The probability of success on each trial.
* @param {ApiRange | ApiName | boolean} arg4 - Specifies if this is the cumulative distribution function (<b>true</b>) or the probability mass function (<b>false</b>).
* @returns {number}
*/
ApiWorksheetFunction.prototype.BINOMDIST = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the individual term binomial distribution probability.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The number of successes in trials.
* @param {ApiRange | ApiName | number} arg2 - The number of independent trials.
* @param {ApiRange | ApiName | number} arg3 - The probability of success on each trial.
* @param {ApiRange | ApiName | boolean} arg4 - Specifies if this is the cumulative distribution function (<b>true</b>) or the probability mass function (<b>false</b>).
* @returns {number}
*/
ApiWorksheetFunction.prototype.BINOM_DIST = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the probability of a trial result using a binomial distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The number of independent trials.
* @param {ApiRange | ApiName | number} arg2 - The probability of success on each trial.
* @param {ApiRange | ApiName | number} arg3 - The minimum number of successes in the trials to calculate probability for, a numeric value greater than or equal to 0.
* @param {ApiRange | ApiName | number} [arg4] - The maximum number of successes in the trials to calculate probability for,
* a numeric value greater than the minimum number of successes and less than or equal to trials.
* @returns {number}
*/
ApiWorksheetFunction.prototype.BINOM_DIST_RANGE = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the smallest value for which the cumulative binomial distribution is greater than or equal to a criterion value.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The number of Bernoulli trials.
* @param {ApiRange | ApiName | number} arg2 - The probability of success on each trial, a number between 0 and 1 inclusive.
* @param {ApiRange | ApiName | number} arg3 - The criterion value, a number between 0 and 1 inclusive.
* @returns {number}
*/
ApiWorksheetFunction.prototype.BINOM_INV = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the right-tailed probability of the chi-squared distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value at which the distribution will be evaluated, a nonnegative number.
* @param {ApiRange | ApiName | number} arg2 - The number of degrees of freedom, a number between 1 and 10^10, excluding 10^10.
* @returns {number}
*/
ApiWorksheetFunction.prototype.CHIDIST = function(arg1, arg2) { return 0; };

/**
* Returns the inverse of the right-tailed probability of the chi-squared distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A probability associated with the chi-squared distribution, a value between 0 and 1 inclusive.
* @param {ApiRange | ApiName | number} arg2 - The number of degrees of freedom, a number between 1 and 10^10, excluding 10^10.
* @returns {number}
*/
ApiWorksheetFunction.prototype.CHIINV = function(arg1, arg2) { return 0; };

/**
* Returns the left-tailed probability of the chi-squared distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value at which the distribution will be evaluated, a nonnegative number.
* @param {ApiRange | ApiName | number} arg2 - The number of degrees of freedom, a number between 1 and 10^10, excluding 10^10.
* @param {ApiRange | ApiName | boolean} arg3 - A logical value that determines the form of the function. If this argument is equal to <b>true</b>,
* the cumulative distribution function is returned; if  it is equal to <b>false</b>, the probability density function is returned.
* @returns {number}
*/
ApiWorksheetFunction.prototype.CHISQ_DIST = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the right-tailed probability of the chi-squared distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value at which the distribution will be evaluated, a nonnegative number.
* @param {ApiRange | ApiName | number} arg2 - The number of degrees of freedom, a number between 1 and 10^10, excluding 10^10.
* @returns {number}
*/
ApiWorksheetFunction.prototype.CHISQ_DIST_RT = function(arg1, arg2) { return 0; };

/**
* Returns the inverse of the left-tailed probability of the chi-squared distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A probability associated with the chi-squared distribution, a value between 0 and 1 inclusive.
* @param {ApiRange | ApiName | number} arg2- The number of degrees of freedom, a number between 1 and 10^10, excluding 10^10.
* @returns {number}
*/
ApiWorksheetFunction.prototype.CHISQ_INV = function(arg1, arg2-) { return 0; };

/**
* Returns the inverse of the right-tailed probability of the chi-squared distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A probability associated with the chi-squared distribution, a value between 0 and 1 inclusive.
* @param {ApiRange | ApiName | number} arg2 - The number of degrees of freedom, a number between 1 and 10^10, excluding 10^10.
* @returns {number}
*/
ApiWorksheetFunction.prototype.CHISQ_INV_RT = function(arg1, arg2) { return 0; };

/**
* Returns the test for independence: the value from the chi-squared distribution for the statistic and the appropriate degrees of freedom.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number | string | boolean} arg1 - The range of data that contains observations to test against expected values.
* @param {ApiRange | ApiName | number | string | boolean} arg2 - The range of data that contains the ratio of the product of row totals and column totals to the grand total.
* @returns {number}
*/
ApiWorksheetFunction.prototype.CHITEST = function(arg1, arg2) { return 0; };

/**
* Returns the confidence interval for a population mean, using a normal distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The significance level used to compute the confidence level, a number greater than 0 and less than 1.
* @param {ApiRange | ApiName | number} arg2 - The population standard deviation for the data range and is assumed to be known. This value must be greater than 0.
* @param {ApiRange | ApiName | number} arg3 - The sample size.
* @returns {number}
*/
ApiWorksheetFunction.prototype.CONFIDENCE = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the confidence interval for a population mean, using a normal distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The significance level used to compute the confidence level, a number greater than 0 and less than 1.
* @param {ApiRange | ApiName | number} arg2 - The population standard deviation for the data range and is assumed to be known. This value must be greater than 0.
* @param {ApiRange | ApiName | number} arg3 - The sample size.
* @returns {number}
*/
ApiWorksheetFunction.prototype.CONFIDENCE_NORM = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the confidence interval for a population mean, using a Student's t distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The significance level used to compute the confidence level, a number greater than 0 and less than 1.
* @param {ApiRange | ApiName | number} arg2 - The population standard deviation for the data range and is assumed to be known. This value must be greater than 0.
* @param {ApiRange | ApiName | number} arg3 - The sample size.
* @returns {number}
*/
ApiWorksheetFunction.prototype.CONFIDENCE_T = function(arg1, arg2, arg3) { return 0; };

/**
* Counts a number of cells in a range that contains numbers ignoring empty cells or those contaning text.
* @memberof ApiWorksheetFunction
* @param {string | number | boolean | Array<string | number | boolean> | ApiRange | ApiName} args - Up to 255 items, or ranges to count numbers.
* The first argument is required, subsequent arguments are optional. Arguments can be numbers, logical values and text representations of numbers, ranges, names, or arrays.
* @returns {number}
*/
ApiWorksheetFunction.prototype.COUNT = function(args) { return 0; };

/**
* Counts a number of cells in a range that are not empty.
* @memberof ApiWorksheetFunction
* @param {string | number | boolean | Array<string | number | boolean> | ApiRange | ApiName} args - Up to 255 items, or ranges to count values.
* The first argument is required, subsequent arguments are optional. Arguments can be numbers, logical values, text strings, ranges, names, or arrays.
* @returns {number}
*/
ApiWorksheetFunction.prototype.COUNTA = function(args) { return 0; };

/**
* Counts a number of empty cells in a specified range of cells.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName} arg1 - The range to count the empty cells.
* @returns {number}
*/
ApiWorksheetFunction.prototype.COUNTBLANK = function(arg1) { return 0; };

/**
* Counts a number of cells within a range that meet the given condition.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName} arg1 - The range of cells to count nonblank cells.
* @param {ApiRange | ApiName | number | string} arg2 - The condition in the form of a number, expression, or text that defines which cells will be counted.
* @returns {number}
*/
ApiWorksheetFunction.prototype.COUNTIF = function(arg1, arg2) { return 0; };

/**
* Counts a number of cells specified by a given set of conditions or criteria.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName} arg1 - The first range of cells to count nonblank cells.
* @param {ApiRange | ApiName | number | string} arg2 - The first condition in the form of a number, expression, or text that defines which cells will be counted.
* @param {ApiRange | ApiName} arg3 - Up to 127 additional ranges of cells to count nonblank cells. This argument is optional.
* @param {ApiRange | ApiName | number | string} arg4 - Up to 127 additional conditions in the form of a number, expression, or text that define which cells will be counted.
* @returns {number}
*/
ApiWorksheetFunction.prototype.COUNTIFS = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the smallest value for which the cumulative binomial distribution is greater than or equal to a criterion value.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The number of Bernoulli trials.
* @param {ApiRange | ApiName | number} arg2 - The probability of success on each trial, a number between 0 and 1 inclusive.
* @param {ApiRange | ApiName | number} arg3 - The criterion value, a number between 0 and 1 inclusive.
* @returns {number}
*/
ApiWorksheetFunction.prototype.CRITBINOM = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the sum of squares of deviations of data points from their sample mean.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number | number[]} args - Up to 255 numerical values for which to find the sum of squares of deviations.
* The first argument is required, subsequent arguments are optional. Arguments can be numbers, names, or arrays of numbers.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DEVSQ = function(args) { return 0; };

/**
* Returns the exponential distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value of the x function, a nonnegative number.
* @param {ApiRange | ApiName | number} arg2 - The lambda parameter value, a positive number.
* @param {ApiRange | ApiName | boolean} arg3 - A logical value that determines the function form. If this parameter is <b>true</b>,
* the function will return the cumulative distribution function, if it is <b>false</b>, it will return the probability density function.
* @returns {number}
*/
ApiWorksheetFunction.prototype.EXPON_DIST = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the exponential distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value of the x function, a nonnegative number.
* @param {ApiRange | ApiName | number} arg2 - The lambda parameter value, a positive number.
* @param {ApiRange | ApiName | boolean} arg3 - A logical value that determines the function form. If this parameter is <b>true</b>,
* the function will return the cumulative distribution function, if it is <b>false</b>, it will return the probability density function.
* @returns {number}
*/
ApiWorksheetFunction.prototype.EXPONDIST = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the (left-tailed) F probability distribution (degree of diversity) for two data sets.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value at which to evaluate the function, a nonnegative number.
* @param {ApiRange | ApiName | number} arg2 - The numerator degrees of freedom, a number between 1 and 10^10, excluding 10^10.
* @param {ApiRange | ApiName | number} arg3 - The denominator degrees of freedom, a number between 1 and 10^10, excluding 10^10.
* @param {ApiRange | ApiName | boolean} arg4 - A logical value that determines the function form. If this parameter is <b>true</b>,
* the function will return the cumulative distribution function, if it is <b>false</b>, it will return the probability density function.
* @returns {number}
*/
ApiWorksheetFunction.prototype.F_DIST = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the (right-tailed) F probability distribution (degree of diversity) for two data sets.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value at which to evaluate the function, a nonnegative number.
* @param {ApiRange | ApiName | number} arg2 - The numerator degrees of freedom, a number between 1 and 10^10, excluding 10^10.
* @param {ApiRange | ApiName | number} arg3 - The denominator degrees of freedom, a number between 1 and 10^10, excluding 10^10.
* @returns {number}
*/
ApiWorksheetFunction.prototype.FDIST = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the (right-tailed) F probability distribution (degree of diversity) for two data sets.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value at which to evaluate the function, a nonnegative number.
* @param {ApiRange | ApiName | number} arg2 - The numerator degrees of freedom, a number between 1 and 10^10, excluding 10^10.
* @param {ApiRange | ApiName | number} arg3 - The denominator degrees of freedom, a number between 1 and 10^10, excluding 10^10.
* @returns {number}
*/
ApiWorksheetFunction.prototype.F_DIST_RT = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the inverse of the (left-tailed) F probability distribution: if p = F.DIST(x,...), then F.INV(p,...) = x.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A probability associated with the F cumulative distribution, a number between 0 and 1 inclusive.
* @param {ApiRange | ApiName | number} arg2 - The numerator degrees of freedom, a number between 1 and 10^10, excluding 10^10.
* @param {ApiRange | ApiName | number} arg3 - The denominator degrees of freedom, a number between 1 and 10^10, excluding 10^10.
* @returns {number}
*/
ApiWorksheetFunction.prototype.F_INV = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the inverse of the (right-tailed) F probability distribution: if p = FDIST(x,...), then FINV(p,...) = x.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A probability associated with the F cumulative distribution, a number between 0 and 1 inclusive.
* @param {ApiRange | ApiName | number} arg2 - The numerator degrees of freedom, a number between 1 and 10^10, excluding 10^10.
* @param {ApiRange | ApiName | number} arg3 - The denominator degrees of freedom, a number between 1 and 10^10, excluding 10^10.
* @returns {number}
*/
ApiWorksheetFunction.prototype.FINV = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the inverse of the (right-tailed) F probability distribution: if p = F.DIST.RT(x,...), then F.INV.RT(p,...) = x.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A probability associated with the F cumulative distribution, a number between 0 and 1 inclusive.
* @param {ApiRange | ApiName | number} arg2 - The numerator degrees of freedom, a number between 1 and 10^10, excluding 10^10.
* @param {ApiRange | ApiName | number} arg3 - The denominator degrees of freedom, a number between 1 and 10^10, excluding 10^10.
* @returns {number}
*/
ApiWorksheetFunction.prototype.F_INV_RT = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the Fisher transformation.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value for the transformation, a number between -1 and 1, excluding -1 and 1.
* @returns {number}
*/
ApiWorksheetFunction.prototype.FISHER = function(arg1) { return 0; };

/**
* Returns the inverse of the Fisher transformation: if y = FISHER(x), then FISHERINV(y) = x.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value to perform the inverse of the transformation.
* @returns {number}
*/
ApiWorksheetFunction.prototype.FISHERINV = function(arg1) { return 0; };

/**
* Calculates or predicts a future value based on existing (historical) values by using the AAA version of the Exponential Smoothing (ETS) algorithm.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A date for which a new value will be predicted. Must be after the last date in the timeline.
* @param {ApiRange | ApiName | number[]} arg2 - A range or an array of numeric data that determines the historical values for which a new point will be predicted.
* @param {ApiRange | ApiName} arg3 - A range of date/time values that correspond to the historical values.
* The timeline range must be of the same size as the second argument. Date/time values must have a constant step between them and can't be zero.
* @param {ApiRange | ApiName | number} [arg4] - An optional numeric value that specifies the length of the seasonal pattern. The default value of 1 indicates seasonality is detected automatically.
* The 0 value means no seasonality.
* @param {ApiRange | ApiName | number} [arg5] - An optional numeric value to handle missing values. The default value of 1 replaces missing values by interpolation, and 0 replaces them with zeros.
* @param {ApiRange | ApiName | number} [arg6] - An optional numeric value to aggregate multiple values with the same time stamp.
* @returns {number}
*/
ApiWorksheetFunction.prototype.FORECAST_ETS = function(arg1, arg2, arg3, arg4, arg5, arg6) { return 0; };

/**
* Returns a confidence interval for the forecast value at the specified target date.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A date for which a new value will be predicted. Must be after the last date in the timeline.
* @param {ApiRange | ApiName | number[]} arg2 - A range or an array of numeric data that determines the historical values for which a new point will be predicted.
* @param {ApiRange | ApiName} arg3 - A range of date/time values that correspond to the historical values.
* The timeline range must be of the same size as the second argument. Date/time values must have a constant step between them and can't be zero.
* @param {ApiRange | ApiName | number} [arg4] - A number between 0 and 1 that shows the confidence level for the calculated confidence interval. The default value is .95.
* @param {ApiRange | ApiName | number} [arg5] - An optional numeric value that specifies the length of the seasonal pattern. The default value of 1 indicates seasonality is detected automatically.
* The 0 value means no seasonality.
* @param {ApiRange | ApiName | number} [arg6] - An optional numeric value to handle missing values. The default value of 1 replaces missing values by interpolation, and 0 replaces them with zeros.
* @param {ApiRange | ApiName | number} [arg7] - An optional numeric value to aggregate multiple values with the same time stamp.
* @returns {number}
*/
ApiWorksheetFunction.prototype.FORECAST_ETS_CONFINT = function(arg1, arg2, arg3, arg4, arg5, arg6, arg7) { return 0; };

/**
* Returns the length of the repetitive pattern an application detects for the specified time series.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number[]} arg1 - A range or an array of numeric data that determines the historical values for which a new point will be predicted.
* @param {ApiRange | ApiName} arg2 - A range of date/time values that correspond to the historical values.
* The timeline range must be of the same size as the second argument. Date/time values must have a constant step between them and can't be zero.
* @param {ApiRange | ApiName | number} [arg3] - An optional numeric value to handle missing values. The default value of 1 replaces missing values by interpolation, and 0 replaces them with zeros.
* @param {ApiRange | ApiName | number} [arg4] - An optional numeric value to aggregate multiple values with the same time stamp.
* @returns {number}
*/
ApiWorksheetFunction.prototype.FORECAST_ETS_SEASONALITY = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the requested statistic for the forecast.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number[]} arg1 - A range or an array of numeric data that determines the historical values for which a new point will be predicted.
* @param {ApiRange | ApiName} arg2 - A range of date/time values that correspond to the historical values.
* The timeline range must be of the same size as the second argument. Date/time values must have a constant step between them and can't be zero.
* @param {ApiRange | ApiName | number} arg3 - A number between 1 and 8, indicating which statistic will be returned for the calculated forecast.
* @param {ApiRange | ApiName | number} [arg4] - An optional numeric value that specifies the length of the seasonal pattern. The default value of 1 indicates seasonality is detected automatically.
* The 0 value means no seasonality.
* @param {ApiRange | ApiName | number} [arg5] - An optional numeric value to handle missing values. The default value of 1 replaces missing values by interpolation, and 0 replaces them with zeros.
* @param {ApiRange | ApiName | number} [arg6] - An optional numeric value to aggregate multiple values with the same time stamp.
* @returns {number}
*/
ApiWorksheetFunction.prototype.FORECAST_ETS_STAT = function(arg1, arg2, arg3, arg4, arg5, arg6) { return 0; };

/**
* Calculates how often values occur within a range of values and then returns the first value of the returned vertical array of numbers.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number[]} arg1 - An array of values or the selected range for which the frequencies will be counted (blanks and text are ignored).
* @param {ApiRange | ApiName | number[]} arg2 - An array of intervals or the selected range into which the values in the first range will be grouped.
* @returns {number}
*/
ApiWorksheetFunction.prototype.FREQUENCY = function(arg1, arg2) { return 0; };

/**
* Returns the gamma function value.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value for which the gamma function will be calculated.
* @returns {number}
*/
ApiWorksheetFunction.prototype.GAMMA = function(arg1) { return 0; };

/**
* Returns the gamma distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value at which the distribution will be calculated, a nonnegative number.
* @param {ApiRange | ApiName | number} arg2 - The alpha parameter of the distribution, a positive number.
* @param {ApiRange | ApiName | number} arg3 - The beta parameter of the distribution, a positive number. If this parameter is equal to 1, the function returns the standard gamma distribution.
* @param {ApiRange | ApiName | boolean} arg4 - A logical value (<b>true</b>> or <b>false</b>) that determines the function form.
* If it is <b>true</b>, the function returns the cumulative distribution function. If it is <b>false</b>, the function returns the probability density function.
* @returns {number}
*/
ApiWorksheetFunction.prototype.GAMMA_DIST = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the gamma distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value at which the distribution will be calculated, a nonnegative number.
* @param {ApiRange | ApiName | number} arg2 - The alpha parameter of the distribution, a positive number.
* @param {ApiRange | ApiName | number} arg3 - The beta parameter of the distribution, a positive number. If this parameter is equal to 1, the function returns the standard gamma distribution.
* @param {ApiRange | ApiName | boolean} arg4 - A logical value (<b>true</b>> or <b>false</b>) that determines the function form.
* If it is <b>true</b>, the function returns the cumulative distribution function. If it is <b>false</b>, the function returns the probability density function.
* @returns {number}
*/
ApiWorksheetFunction.prototype.GAMMADIST = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the inverse of the gamma cumulative distribution: if p = GAMMA.DIST(x,...), then GAMMA.INV(p,...) = x.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The probability associated with the gamma distribution, a number between 0 and 1, inclusive.
* @param {ApiRange | ApiName | number} arg2 - The alpha parameter of the distribution, a positive number.
* @param {ApiRange | ApiName | number} arg3 - The beta parameter of the distribution, a positive number. If this parameter is equal to 1, the function returns the standard gamma distribution.
* @returns {number}
*/
ApiWorksheetFunction.prototype.GAMMA_INV = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the inverse of the gamma cumulative distribution: if p = GAMMADIST(x,...), then GAMMAINV(p,...) = x.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The probability associated with the gamma distribution, a number between 0 and 1, inclusive.
* @param {ApiRange | ApiName | number} arg2 - The alpha parameter of the distribution, a positive number.
* @param {ApiRange | ApiName | number} arg3 - The beta parameter of the distribution, a positive number. If this parameter is equal to 1, the function returns the standard gamma distribution.
* @returns {number}
*/
ApiWorksheetFunction.prototype.GAMMAINV = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the natural logarithm of the gamma function.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value for which the natural logarithm of the gamma function will be calculated, a positive number.
* @returns {number}
*/
ApiWorksheetFunction.prototype.GAMMALN = function(arg1) { return 0; };

/**
* Returns the natural logarithm of the gamma function.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value for which the natural logarithm of the gamma function will be calculated, a positive number.
* @returns {number}
*/
ApiWorksheetFunction.prototype.GAMMALN_PRECISE = function(arg1) { return 0; };

/**
* Calculates the probability that a member of a standard normal population will fall between the mean and arg1 standard deviations from the mean.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value for which the distribution will be calculated.
* @returns {number}
*/
ApiWorksheetFunction.prototype.GAUSS = function(arg1) { return 0; };

/**
* Returns the geometric mean of positive numeric data.
* @memberof ApiWorksheetFunction
* @param {ApiRange | number[] | ApiName} args - Up to 255 numeric values for which the geometric mean will be calculated.
* Arguments can be numbers, names, ranges, or arrays of numbers.
* @returns {number}
*/
ApiWorksheetFunction.prototype.GEOMEAN = function(args) { return 0; };

/**
* Calculates predicted exponential growth by using existing data.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number[]} arg1 - The set of y-values from the *y = b*m^x* equation, an array or range of positive numbers.
* @param {ApiRange | ApiName | number[]} [arg2] - An optional set of x-values from the *y = b*m^x* equation, an array or range of positive numbers that has the same size as the set of y-values.
* @param {ApiRange | ApiName | number[]} [arg3] - New x-values for which the function will return the corresponding y-values.
* @param {ApiRange | ApiName | boolean} [arg4] - A logical value: the constant *b* is calculated normally if this parameter is set to <b>true</b>,
* and *b* is set equal to 1 if the parameter is <b>false</b> or omitted.
* @returns {number}
*/
ApiWorksheetFunction.prototype.GROWTH = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the harmonic mean of a data set of positive numbers: the reciprocal of the arithmetic mean of reciprocals.
* @memberof ApiWorksheetFunction
* @param {ApiRange | number[] | ApiName} args - Up to 255 numeric values for which the harmonic mean will be calculated.
* Arguments can be numbers, names, ranges, or arrays of numbers.
* @returns {number}
*/
ApiWorksheetFunction.prototype.HARMEAN = function(args) { return 0; };

/**
* Returns the hypergeometric distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The number of successes in the sample.
* @param {ApiRange | ApiName | number} arg2 - The size of the sample.
* @param {ApiRange | ApiName | number} arg3 - The number of successes in the population.
* @param {ApiRange | ApiName | number} arg4 - The population size.
* @returns {number}
*/
ApiWorksheetFunction.prototype.HYPGEOMDIST = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the hypergeometric distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The number of successes in the sample.
* @param {ApiRange | ApiName | number} arg2 - The size of the sample.
* @param {ApiRange | ApiName | number} arg3 - The number of successes in the population.
* @param {ApiRange | ApiName | number} arg4 - The population size.
* @param {ApiRange | ApiName | boolean} arg5 - A logical value (<b>true</b> or <b>false</b>) that determines the function form.
* If it is <b>true</b>, the function returns the cumulative distribution function. If it is <b>false</b>, the function returns the probability mass function.
* @returns {number}
*/
ApiWorksheetFunction.prototype.HYPGEOM_DIST = function(arg1, arg2, arg3, arg4, arg5) { return 0; };

/**
* Returns the kurtosis of a data set.
* @memberof ApiWorksheetFunction
* @param {ApiRange | number[] | ApiName} args - Up to 255 numeric values for which the kurtosis will be calculated.
* Arguments can be numbers, names, ranges, or arrays of numbers.
* @returns {number}
*/
ApiWorksheetFunction.prototype.KURT = function(args) { return 0; };

/**
* Returns the k-th largest value in a data set. For example, the fifth largest number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number[]} arg1 - The array or range of data for which the k-th largest value will be determined.
* @param {ApiRange | ApiName | number} arg2 - The position (from the largest) in the array or cell range of data to return.
* @returns {number}
*/
ApiWorksheetFunction.prototype.LARGE = function(arg1, arg2) { return 0; };

/**
* Returns statistics that describe a linear trend matching known data points, by fitting a straight line using the least squares method.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName} arg1 - The set of y-values from the *y = mx + b* equation.
* @param {ApiRange | ApiName} [arg2] - An optional set of x-values from the *y = mx + b* equation.
* @param {ApiRange | ApiName | boolean} [arg3] - A logical value: the constant *b* is calculated normally if this parameter is set to <b>true</b> or omitted,
* and *b* is set equal to 0 if the parameter is <b>false</b>.
* @param {ApiRange | ApiName | boolean} [arg4] - A logical value: return additional regression statistics if this parameter is set to <b>true</b>,
* and return m-coefficients and the constant *b* if the parameter is <b>false</b> or omitted.
* @returns {number}
*/
ApiWorksheetFunction.prototype.LINEST = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns statistics that describe an exponential curve matching known data points.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | ApiRange} arg1 - The set of y-values from the *y = b*m^x* equation.
* @param {ApiRange | ApiName | ApiRange} [arg2] - An optional set of x-values from the *y = b*m^x* equation.
* @param {ApiRange | ApiName | boolean} [arg3] - A logical value: the constant *b* is calculated normally if this parameter is set to <b>true</b> or omitted,
* and *b* is set equal to 1 if the parameter is <b>false</b>.
* @param {ApiRange | ApiName | boolean} [arg4] - A logical value: return additional regression statistics if this parameter is set to <b>true</b>,
* and return m-coefficients and the constant *b* if the parameter is <b>false</b> or omitted.
* @returns {number}
*/
ApiWorksheetFunction.prototype.LOGEST = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the inverse of the lognormal cumulative distribution function of x, where ln(x) is normally distributed with the specified parameters.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A probability associated with the lognormal distribution, a number between 0 and 1, inclusive.
* @param {ApiRange | ApiName | number} arg2 - The mean of ln(x).
* @param {ApiRange | ApiName | number} arg3 - The standard deviation of ln(x), a positive number.
* @returns {number}
*/
ApiWorksheetFunction.prototype.LOGINV = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the lognormal distribution of x, where ln(x) is normally distributed with the specified parameters.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value at which to evaluate the function, a positive number.
* @param {ApiRange | ApiName | number} arg2 - The mean of ln(x).
* @param {ApiRange | ApiName | number} arg3 - The standard deviation of ln(x), a positive number.
* @param {ApiRange | ApiName | boolean} arg4 - A logical value (<b>true</b> or <b>false</b>) that determines the function form.
* If it is <b>true</b>, the function returns the cumulative distribution function.
* If it is <b>false</b>, the function returns the probability density function.
* @returns {number}
*/
ApiWorksheetFunction.prototype.LOGNORM_DIST = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the inverse of the lognormal cumulative distribution function of x, where ln(x) is normally distributed with the specified parameters.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A probability associated with the lognormal distribution, a number between 0 and 1, inclusive.
* @param {ApiRange | ApiName | number} arg2 - The mean of ln(x).
* @param {ApiRange | ApiName | number} arg3 - The standard deviation of ln(x), a positive number.
* @returns {number}
*/
ApiWorksheetFunction.prototype.LOGNORM_INV = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the cumulative lognormal distribution of x, where ln(x) is normally distributed with the specified parameters.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value at which to evaluate the function, a positive number.
* @param {ApiRange | ApiName | number} arg2 - The mean of ln(x).
* @param {ApiRange | ApiName | number} arg3 - The standard deviation of ln(x), a positive number.
* @returns {number}
*/
ApiWorksheetFunction.prototype.LOGNORMDIST = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the largest value in a set of values. Ignores logical values and text.
* @memberof ApiWorksheetFunction
* @param {number | number[] | ApiRange | ApiName} args - Up to 255 numeric values for which the largest number will be returned.
* The first argument is required, subsequent arguments are optional. Arguments can be numbers, names, ranges, or arrays of numbers.
* @returns {number}
*/
ApiWorksheetFunction.prototype.MAX = function(args) { return 0; };

/**
* Returns the largest value in a set of values. Does not ignore logical values and text.
* @memberof ApiWorksheetFunction
* @param {number | string | boolean | Array<number | string | boolean> | ApiRange | ApiName} args - Up to 255 values (number, text, logical value) for which the largest value will be returned.
* The first argument is required, subsequent arguments are optional. Arguments can be numbers, logical values and text representations of numbers, names, ranges, or arrays.
* @returns {number}
*/
ApiWorksheetFunction.prototype.MAXA = function(args) { return 0; };

/**
* Returns the median, or the number in the middle of the set of given numbers.
* @memberof ApiWorksheetFunction
* @param {number | number[] | ApiRange | ApiName} args - Up to 255 numeric values for which the median will be calculated.
* The first argument is required, subsequent arguments are optional. Arguments can be numbers, names, ranges, or arrays of numbers.
* @returns {number}
*/
ApiWorksheetFunction.prototype.MEDIAN = function(args) { return 0; };

/**
* Returns the smallest number in a set of values. Ignores logical values and text.
* @memberof ApiWorksheetFunction
* @param {number | number[] | ApiRange | ApiName} args - Up to 255 numeric values for which the smallest number will be returned.
* The first argument is required, subsequent arguments are optional. Arguments can be numbers, names, ranges, or arrays of numbers.
* @returns {number}
*/
ApiWorksheetFunction.prototype.MIN = function(args) { return 0; };

/**
* Returns the smallest value in a set of values. Does not ignore logical values and text.
* @memberof ApiWorksheetFunction
* @param {number | string | boolean | Array<number | string | boolean> | ApiRange | ApiName} args - Up to 255 values (number, text, logical value) for which the smallest value will be returned.
* The first argument is required, subsequent arguments are optional. Arguments can be numbers, logical values and text representations of numbers, names, ranges, or arrays.
* @returns {number}
*/
ApiWorksheetFunction.prototype.MINA = function(args) { return 0; };

/**
* Returns the negative binomial distribution, the probability that there will be the specified number of failures before the last success, with the specified probability of a success.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The number of failures.
* @param {ApiRange | ApiName | number} arg2 - The threshold number of successes.
* @param {ApiRange | ApiName | number} arg3 - The probability of a success; a number between 0 and 1.
* @returns {number}
*/
ApiWorksheetFunction.prototype.NEGBINOMDIST = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the negative binomial distribution, the probability that there will be the specified number of failures before the last success, with the specified probability of a success.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The number of failures.
* @param {ApiRange | ApiName | number} arg2 - The threshold number of successes.
* @param {ApiRange | ApiName | number} arg3 - The probability of a success; a number between 0 and 1.
* @param {ApiRange | ApiName | boolean} arg4 - A logical value (<b>true</b> or <b>false</b>) that determines the function form.
* If it is <b>true</b>, the function returns the cumulative distribution function.
* If it is <b>false</b>, the function returns the probability density function.
* @returns {number}
*/
ApiWorksheetFunction.prototype.NEGBINOM_DIST = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the normal cumulative distribution for the specified mean and standard deviation.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value for which the distribution will be returned.
* @param {ApiRange | ApiName | number} arg2 - The arithmetic mean of the distribution.
* @param {ApiRange | ApiName | number} arg3 - The standard deviation of the distribution, a positive number.
* @param {ApiRange | ApiName | boolean} arg4 - A logical value (<b>true</b> or <b>false</b>) that determines the function form.
* If it is <b>true</b>, the function returns the cumulative distribution function.
* If it is <b>false</b>, the function returns the probability mass function.
* @returns {number}
*/
ApiWorksheetFunction.prototype.NORMDIST = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the normal distribution for the specified mean and standard deviation.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value for which the distribution will be returned.
* @param {ApiRange | ApiName | number} arg2 - The arithmetic mean of the distribution.
* @param {ApiRange | ApiName | number} arg3 - The standard deviation of the distribution, a positive number.
* @param {ApiRange | ApiName | boolean} arg4 - A logical value (<b>true</b> or <b>false</b>) that determines the function form.
* If it is <b>true</b>, the function returns the cumulative distribution function.
* If it is <b>false</b>, the function returns the probability mass function.
* @returns {number}
*/
ApiWorksheetFunction.prototype.NORM_DIST = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the inverse of the normal cumulative distribution for the specified mean and standard deviation.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A probability corresponding to the normal distribution, a number between 0 and 1 inclusive.
* @param {ApiRange | ApiName | number} arg2 - The arithmetic mean of the distribution.
* @param {ApiRange | ApiName | number} arg3 - The standard deviation of the distribution, a positive number.
* @returns {number}
*/
ApiWorksheetFunction.prototype.NORMINV = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the inverse of the normal cumulative distribution for the specified mean and standard deviation.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A probability corresponding to the normal distribution, a number between 0 and 1 inclusive.
* @param {ApiRange | ApiName | number} arg2 - The arithmetic mean of the distribution.
* @param {ApiRange | ApiName | number} arg3 - The standard deviation of the distribution, a positive number.
* @returns {number}
*/
ApiWorksheetFunction.prototype.NORM_INV = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the standard normal cumulative distribution (has a mean of zero and a standard deviation of one).
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value for which the distribution will be returned.
* @returns {number}
*/
ApiWorksheetFunction.prototype.NORMSDIST = function(arg1) { return 0; };

/**
* Returns the standard normal distribution (has a mean of zero and a standard deviation of one).
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value for which the distribution will be returned.
* @param {ApiRange | ApiName | boolean} arg2 - A logical value (<b>true</b> or <b>false</b>) that determines the function form.
* If it is <b>true</b>, the function returns the cumulative distribution function.
* If it is <b>false</b>, the function returns the probability mass function.
* @returns {number}
*/
ApiWorksheetFunction.prototype.NORM_S_DIST = function(arg1, arg2) { return 0; };

/**
* Returns the inverse of the standard normal cumulative distribution (has a mean of zero and a standard deviation of one).
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A probability corresponding to the normal distribution, a number between 0 and 1 inclusive.
* @returns {number}
*/
ApiWorksheetFunction.prototype.NORMSINV = function(arg1) { return 0; };

/**
* Returns the inverse of the standard normal cumulative distribution (has a mean of zero and a standard deviation of one).
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A probability corresponding to the normal distribution, a number between 0 and 1 inclusive.
* @returns {number}
*/
ApiWorksheetFunction.prototype.NORM_S_INV = function(arg1) { return 0; };

/**
* Returns the k-th percentile of values in a range.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number[]} arg1 - The array or range of data that defines relative standing.
* @param {ApiRange | ApiName | number} arg2 - The percentile value that is equal to 0 but less than or equal to 1.
* @returns {number}
*/
ApiWorksheetFunction.prototype.PERCENTILE = function(arg1, arg2) { return 0; };

/**
* Returns the k-th percentile of values in a range, where k is in the range 0..1, exclusive.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number[]} arg1 - The array or range of data that defines relative standing.
* @param {ApiRange | ApiName | number} arg2 - The percentile value that is greater than 0 but less than 1.
* @returns {number}
*/
ApiWorksheetFunction.prototype.PERCENTILE_EXC = function(arg1, arg2) { return 0; };

/**
* Returns the k-th percentile of values in a range, where k is in the range 0..1, inclusive.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number[]} arg1 - The array or range of data that defines relative standing.
* @param {ApiRange | ApiName | number} arg2 - The percentile value that is equal to 0 but less than or equal to 1.
* @returns {number}
*/
ApiWorksheetFunction.prototype.PERCENTILE_INC = function(arg1, arg2) { return 0; };

/**
* Returns the rank of a value in a data set as a percentage of the data set.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number[]} arg1 - The array or range of data with numeric values that defines relative standing.
* @param {ApiRange | ApiName | number} arg2 - The value for which the rank will be returned.
* @param {ApiRange | ApiName | number} [arg3] - An optional value that identifies the number of significant digits for the returned percentage, three digits if omitted (0.xxx%).
* @returns {number}
*/
ApiWorksheetFunction.prototype.PERCENTRANK = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the rank of a value in a data set as a percentage (0..1, exclusive) of the data set.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number[]} arg1 - The array or range of data with numeric values that defines relative standing.
* @param {ApiRange | ApiName | number} arg2 - The value for which the rank will be returned.
* @param {ApiRange | ApiName | number} [arg3] - An optional value that identifies the number of significant digits for the returned percentage, three digits if omitted (0.xxx%).
* @returns {number}
*/
ApiWorksheetFunction.prototype.PERCENTRANK_EXC = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the rank of a value in a data set as a percentage (0..1, inclusive) of the data set.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number[]} arg1 - The array or range of data with numeric values that defines relative standing.
* @param {ApiRange | ApiName | number} arg2 - The value for which the rank will be returned.
* @param {ApiRange | ApiName | number} [arg3] - An optional value that identifies the number of significant digits for the returned percentage, three digits if omitted (0.xxx%).
* @returns {number}
*/
ApiWorksheetFunction.prototype.PERCENTRANK_INC = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the number of permutations for a given number of objects that can be selected from the total objects.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The total number of objects.
* @param {ApiRange | ApiName | number} arg2 - The number of objects in each permutation.
* @returns {number}
*/
ApiWorksheetFunction.prototype.PERMUT = function(arg1, arg2) { return 0; };

/**
* Returns the number of permutations for a given number of objects (with repetitions) that can be selected from the total objects.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The total number of objects.
* @param {ApiRange | ApiName | number} arg2 - The number of objects in each permutation.
* @returns {number}
*/
ApiWorksheetFunction.prototype.PERMUTATIONA = function(arg1, arg2) { return 0; };

/**
* Returns the value of the density function for a standard normal distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The number for which the density of the standard normal distribution will be returned.
* @returns {number}
*/
ApiWorksheetFunction.prototype.PHI = function(arg1) { return 0; };

/**
* Returns the Poisson distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The number of events.
* @param {ApiRange | ApiName | number} arg2 - The expected numeric value, a positive number.
* @param {ApiRange | ApiName | boolean} arg3 - A logical value (<b>true</b> or <b>false</b>) that determines the function form.
* If it is <b>true</b>, the function returns the cumulative Poisson probability.
* If it is <b>false</b>, the function returns the Poisson probability mass function.
* @returns {number}
*/
ApiWorksheetFunction.prototype.POISSON = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the Poisson distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The number of events.
* @param {ApiRange | ApiName | number} arg2 - The expected numeric value, a positive number.
* @param {ApiRange | ApiName | boolean} arg3 - A logical value (<b>true</b> or <b>false</b>) that determines the function form.
* If it is <b>true</b>, the function returns the cumulative Poisson probability.
* If it is <b>false</b>, the function returns the Poisson probability mass function.
* @returns {number}
*/
ApiWorksheetFunction.prototype.POISSON_DIST = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the quartile of a data set.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number[]} arg1 - The array or cell range of numeric values for which the quartile value will be returned.
* @param {ApiRange | ApiName | number} arg2 - The quartile value to return: minimum value = 0; 1st quartile = 1; median value = 2; 3rd quartile = 3; maximum value = 4.
* @returns {number}
*/
ApiWorksheetFunction.prototype.QUARTILE = function(arg1, arg2) { return 0; };

/**
* Returns the quartile of a data set, based on percentile values from 0..1, exclusive.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number[]} arg1 - The array or cell range of numeric values for which the quartile value will be returned.
* @param {ApiRange | ApiName | number} arg2 - The quartile value to return: 1st quartile = 1; median value = 2; 3rd quartile = 3.
* @returns {number}
*/
ApiWorksheetFunction.prototype.QUARTILE_EXC = function(arg1, arg2) { return 0; };

/**
* Returns the quartile of a data set, based on percentile values from 0..1, inclusive.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number[]} arg1 - The array or cell range of numeric values for which the quartile value will be returned.
* @param {ApiRange | ApiName | number} arg2 - The quartile value to return: minimum value = 0; 1st quartile = 1; median value = 2; 3rd quartile = 3; maximum value = 4.
* @returns {number}
*/
ApiWorksheetFunction.prototype.QUARTILE_INC = function(arg1, arg2) { return 0; };

/**
* Returns the rank of a number in a list of numbers: its size relative to other values in the list.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The number for which the rank will be returned.
* @param {ApiRange | ApiName | number[]} arg2 - An array or range of numbers. Nonnumeric values are ignored.
* @param {ApiRange | ApiName | boolean} [arg3] - The numeric value that specifyes how to order the numbers. If it is 0 or omitted, the rank in the list will be sorted in descending order.
* Any other numeric value means that the rank in the list will be sorted in ascending order.
* @returns {number}
*/
ApiWorksheetFunction.prototype.RANK = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the rank of a number in a list of numbers: its size relative to other values in the list. If more than one value has the same rank, the average rank is returned.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The number for which the rank will be returned.
* @param {ApiRange | ApiName | number[]} arg2 - An array or range of numbers. Nonnumeric values are ignored.
* @param {ApiRange | ApiName | boolean} [arg3] - The numeric value that specifyes how to order the numbers. If it is 0 or omitted, the rank in the list will be sorted in descending order.
* Any other numeric value means that the rank in the list will be sorted in ascending order.
* @returns {number}
*/
ApiWorksheetFunction.prototype.RANK_AVG = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the rank of a number in a list of numbers: its size relative to other values in the list. If more than one value has the same rank, the top rank of that set of values is returned.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The number for which the rank will be returned.
* @param {ApiRange | ApiName | number[]} arg2 - An array or range of numbers. Nonnumeric values are ignored.
* @param {ApiRange | ApiName | boolean} [arg3] - The numeric value that specifyes how to order the numbers. If it is 0 or omitted, the rank in the list will be sorted in descending order.
* Any other numeric value means that the rank in the list will be sorted in ascending order.
* @returns {number}
*/
ApiWorksheetFunction.prototype.RANK_EQ = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the skewness of a distribution: a characterization of the degree of asymmetry of a distribution around its mean.
* @memberof ApiWorksheetFunction
* @param {number | ApiName | number[] | ApiRange} args - Up to 255 numeric values for which the skewness of a distribution will be returned.
* The first argument is required, subsequent arguments are optional. Arguments can be numbers, names, ranges, or arrays of numbers.
* @returns {number}
*/
ApiWorksheetFunction.prototype.SKEW = function(args) { return 0; };

/**
* Returns the skewness of a distribution based on a population: a characterization of the degree of asymmetry of a distribution around its mean.
* @memberof ApiWorksheetFunction
* @param {number | ApiName | number[] | ApiRange} args - Up to 255 numeric values for which the skewness of a distribution will be returned.
* The first argument is required, subsequent arguments are optional. Arguments can be numbers, names, ranges, or arrays of numbers.
* @returns {number}
*/
ApiWorksheetFunction.prototype.SKEW_P = function(args) { return 0; };

/**
* Returns the k-th smallest value in a data set. For example, the fifth smallest number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number[]} arg1 - An array or range of numerical data for which the k-th smallest value will be determined.
* @param {ApiRange | ApiName | number} arg2 - The position (from the smallest) in the range of the value to return.
* @returns {number}
*/
ApiWorksheetFunction.prototype.SMALL = function(arg1, arg2) { return 0; };

/**
* Returns a normalised value from a distribution characterised by a mean and standard deviation.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value to normalize.
* @param {ApiRange | ApiName | number} arg2 - The arithmetic mean of the distribution.
* @param {ApiRange | ApiName | number} arg3 - The standard deviation of the distribution, a positive number.
* @returns {number}
*/
ApiWorksheetFunction.prototype.STANDARDIZE = function(arg1, arg2, arg3) { return 0; };

/**
* Estimates standard deviation based on a sample (ignores logical values and text in the sample).
* @memberof ApiWorksheetFunction
* @param {number[] | number | ApiName | ApiRange} args - Up to 255 numeric values for which the standard deviation will be calculated.
* The first argument is required, subsequent arguments are optional. Arguments can be numbers, names, ranges, or arrays of numbers.
* @returns {number}
*/
ApiWorksheetFunction.prototype.STDEV = function(args) { return 0; };

/**
* Estimates standard deviation based on a sample (ignores logical values and text in the sample).
* @memberof ApiWorksheetFunction
* @param {number[] | number | ApiName | ApiRange} args - Up to 255 numeric values for which the standard deviation will be calculated.
* The first argument is required, subsequent arguments are optional. Arguments can be numbers, names, ranges, or arrays of numbers.
* @returns {number}
*/
ApiWorksheetFunction.prototype.STDEV_S = function(args) { return 0; };

/**
* Estimates standard deviation based on a sample, including logical values and text. Text and the <b>false</b> logical value have the value 0; the <b>true</b> logical value has the value 1.
* @memberof ApiWorksheetFunction
* @param {number[] | number | string | boolean | ApiRange | ApiName} args - Up to 255 values for which the standard deviation will be calculated.
* The first argument is required, subsequent arguments are optional. Arguments can be numbers, logical values, text strings, names, ranges, or arrays.
* @returns {number}
*/
ApiWorksheetFunction.prototype.STDEVA = function(args) { return 0; };

/**
* Calculates standard deviation based on the entire population given as arguments (ignores logical values and text).
* @memberof ApiWorksheetFunction
* @param {number[] | number | ApiName | ApiRange} args - Up to 255 numeric values for which the standard deviation will be calculated.
* The first argument is required, subsequent arguments are optional. Arguments can be numbers, names, ranges, or arrays of numbers.
* @returns {number}
*/
ApiWorksheetFunction.prototype.STDEVP = function(args) { return 0; };

/**
* Calculates standard deviation based on the entire population given as arguments (ignores logical values and text).
* @memberof ApiWorksheetFunction
* @param {number[] | number | ApiName | ApiRange} args - Up to 255 numeric values for which the standard deviation will be calculated.
* The first argument is required, subsequent arguments are optional. Arguments can be numbers, names, ranges, or arrays of numbers.
* @returns {number}
*/
ApiWorksheetFunction.prototype.STDEV_P = function(args) { return 0; };

/**
* Calculates standard deviation based on the entire population, including logical values and text.
* Text and the <b>false</b> logical value have the value 0; the <b>true</b> logical value has the value 1.
* @memberof ApiWorksheetFunction
* @param {number[] | number | string | boolean | ApiRange | ApiName} args - Up to 255 values for which the standard deviation will be calculated.
* The first argument is required, subsequent arguments are optional. Arguments can be numbers, logical values, text strings, names, ranges, or arrays.
* @returns {number}
*/
ApiWorksheetFunction.prototype.STDEVPA = function(args) { return 0; };

/**
* Returns the Student's t-distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The numeric value at which to evaluate the distribution.
* @param {ApiRange | ApiName | number} arg2 - An integer indicating the number of degrees of freedom that characterize the distribution.
* @param {ApiRange | ApiName | number} arg3 - Specifies the number of distribution tails to return: one-tailed distribution = 1; two-tailed distribution = 2.
* @returns {number}
*/
ApiWorksheetFunction.prototype.TDIST = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the left-tailed Student's t-distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The numeric value at which to evaluate the distribution.
* @param {ApiRange | ApiName | number} arg2 - An integer indicating the number of degrees of freedom that characterize the distribution.
* @param {ApiRange | ApiName | boolean} arg3 - A logical value (<b>true</b> or <b>false</b>) that determines the function form.
* If it is <b>true</b>, the function returns the cumulative distribution function.
* If it is <b>false</b>, the function returns the probability density function.
* @returns {number}
*/
ApiWorksheetFunction.prototype.T_DIST = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the two-tailed Student's t-distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The numeric value at which to evaluate the distribution.
* @param {ApiRange | ApiName | number} arg2 - An integer indicating the number of degrees of freedom that characterize the distribution.
* @returns {number}
*/
ApiWorksheetFunction.prototype.T_DIST_2T = function(arg1, arg2) { return 0; };

/**
* Returns the right-tailed Student's t-distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The numeric value at which to evaluate the distribution.
* @param {ApiRange | ApiName | number} arg2 - An integer indicating the number of degrees of freedom that characterize the distribution.
* @returns {number}
*/
ApiWorksheetFunction.prototype.T_DIST_RT = function(arg1, arg2) { return 0; };

/**
* Returns the left-tailed inverse of the Student's t-distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The probability associated with the two-tailed Student's t-distribution, a number between 0 and 1 inclusive.
* @param {ApiRange | ApiName | number} arg2 - A positive integer indicating the number of degrees of freedom to characterize the distribution.
* @returns {number}
*/
ApiWorksheetFunction.prototype.T_INV = function(arg1, arg2) { return 0; };

/**
* Returns the two-tailed inverse of the Student's t-distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The probability associated with the two-tailed Student's t-distribution, a number between 0 and 1 inclusive.
* @param {ApiRange | ApiName | number} arg2 - A positive integer indicating the number of degrees of freedom to characterize the distribution.
* @returns {number}
*/
ApiWorksheetFunction.prototype.T_INV_2T = function(arg1, arg2) { return 0; };

/**
* Returns the two-tailed inverse of the Student's t-distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The probability associated with the two-tailed Student's t-distribution, a number between 0 and 1 inclusive.
* @param {ApiRange | ApiName | number} arg2 - A positive integer indicating the number of degrees of freedom to characterize the distribution.
* @returns {number}
*/
ApiWorksheetFunction.prototype.TINV = function(arg1, arg2) { return 0; };

/**
* Returns numbers in a linear trend matching known data points, using the least squares method.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number[]} arg1 - A range or array of y-values from the *y = mx + b* equation.
* @param {ApiRange | ApiName | number[]} [arg2] - An optional range or array of x-values from the *y = mx + b* equation, an array of the same size as an array of y-values.
* @param {ApiRange | ApiName | number[]} [arg3] - A range or array of new x-values for which this function will return corresponding y-values.
* @param {ApiRange | ApiName | boolean} [arg4] - A logical value: the constant *b* is calculated normally if this parameter is set to <b>true</b> or omitted,
* and *b* is set equal to 0 if the parameter is <b>false</b>.
* @returns {number}
*/
ApiWorksheetFunction.prototype.TREND = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the mean of the interior portion of a set of data values.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number[]} arg1 - The array or range of values to trim and average.
* @param {ApiRange | ApiName | number} arg2 - The fractional number of data points to exclude from the top and bottom of the data set.
* @returns {number}
*/
ApiWorksheetFunction.prototype.TRIMMEAN = function(arg1, arg2) { return 0; };

/**
* Estimates variance based on a sample (ignores logical values and text in the sample).
* @memberof ApiWorksheetFunction
* @param {number | ApiName | ApiRange | number[]} args - Up to 255 numeric values for which the variance will be calculated.
* The first argument is required, subsequent arguments are optional. Arguments can be numbers, names, ranges, or arrays of numbers.
* @returns {number}
*/
ApiWorksheetFunction.prototype.VAR = function(args) { return 0; };

/**
* Estimates variance based on a sample, including logical values and text. Text and the <b>false</b> logical value have the value 0; the <b>true</b> logical value has the value 1.
* @memberof ApiWorksheetFunction
* @param {number | string | boolean | Array<number | string | boolean> | ApiRange | ApiName} args - Up to 255 values for which the variance will be calculated.
* The first argument is required, subsequent arguments are optional. Arguments can be numbers, logical values or text representations of numbers, names, ranges, or arrays.
* @returns {number}
*/
ApiWorksheetFunction.prototype.VARA = function(args) { return 0; };

/**
* Calculates variance based on the entire population (ignores logical values and text in the population).
* @memberof ApiWorksheetFunction
* @param {number | ApiName | ApiRange | number[]} args - Up to 255 numeric values for which the variance will be calculated.
* The first argument is required, subsequent arguments are optional. Arguments can be numbers, names, ranges, or arrays of numbers.
* @returns {number}
*/
ApiWorksheetFunction.prototype.VARP = function(args) { return 0; };

/**
* Calculates variance based on the entire population (ignores logical values and text in the population).
* @memberof ApiWorksheetFunction
* @param {number | ApiName | ApiRange | number[]} args - Up to 255 numeric values for which the variance will be calculated.
* The first argument is required, subsequent arguments are optional. Arguments can be numbers, names, ranges, or arrays of numbers.
* @returns {number}
*/
ApiWorksheetFunction.prototype.VAR_P = function(args) { return 0; };

/**
* Estimates variance based on a sample (ignores logical values and text in the sample).
* @memberof ApiWorksheetFunction
* @param {number | ApiName | ApiRange | number[]} args - Up to 255 numeric values for which the variance will be calculated.
* The first argument is required, subsequent arguments are optional. Arguments can be numbers, names, ranges, or arrays of numbers.
* @returns {number}
*/
ApiWorksheetFunction.prototype.VAR_S = function(args) { return 0; };

/**
* Calculates variance based on the entire population, including logical values and text. Text and the <b>false</b> logical value have the value 0; the <b>true</b> logical value has the value 1.
* @memberof ApiWorksheetFunction
* @param {number | string | boolean | Array<number | string | boolean> | ApiRange | ApiName} args - Up to 255 values for which the variance will be calculated.
* The first argument is required, subsequent arguments are optional. Arguments can be numbers, logical values or text representations of numbers, names, ranges, or arrays.
* @returns {number}
*/
ApiWorksheetFunction.prototype.VARPA = function(args) { return 0; };

/**
* Returns the Weibull distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value at which to evaluate the function, a nonnegative number.
* @param {ApiRange | ApiName | number} arg2 - The alpha parameter of the distribution, a positive number.
* @param {ApiRange | ApiName | number} arg3 - The beta parameter of the distribution, a positive number.
* @param {ApiRange | ApiName | boolean} arg4 - A logical value (<b>true</b> or <b>false</b>) that determines the function form.
* If it is <b>true</b>, the function returns the cumulative distribution function.
* If it is <b>false</b>, the function returns the probability mass function.
* @returns {number}
*/
ApiWorksheetFunction.prototype.WEIBULL = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the Weibull distribution.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value at which to evaluate the function, a nonnegative number.
* @param {ApiRange | ApiName | number} arg2 - The alpha parameter of the distribution, a positive number.
* @param {ApiRange | ApiName | number} arg3 - The beta parameter of the distribution, a positive number.
* @param {ApiRange | ApiName | boolean} arg4 - A logical value (<b>true</b> or <b>false</b>) that determines the function form.
* If it is <b>true</b>, the function returns the cumulative distribution function.
* If it is <b>false</b>, the function returns the probability mass function.
* @returns {number}
*/
ApiWorksheetFunction.prototype.WEIBULL_DIST = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the one-tailed P-value of a z-test.
* @memberof ApiWorksheetFunction
* @param {number[] | ApiRange | ApiName} arg1 - The array or range of data against which to test X.
* @param {ApiRange | ApiName | number} arg2 - The value to test.
* @param {ApiRange | ApiName | number} [arg3] - The population (known) standard deviation. If omitted, the sample standard deviation is used.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ZTEST = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the one-tailed P-value of a z-test.
* @memberof ApiWorksheetFunction
* @param {number[] | ApiRange} arg1 - The array or range of data against which to test X.
* @param {ApiRange | ApiName | number} arg2 - The value to test.
* @param {ApiRange | ApiName | number} [arg3] - The population (known) standard deviation. If omitted, the sample standard deviation is used.
* @returns {number}
*/
ApiWorksheetFunction.prototype.Z_TEST = function(arg1, arg2, arg3) { return 0; };

/**
* Returns a number that represents the date in the date-time code.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A number from 1900 or 1904 (depending on the workbook's date system) to 9999.
* @param {ApiRange | ApiName | number} arg2 - A number from 1 to 12 representing the month of the year.
* @param {ApiRange | ApiName | number} arg3 - A number from 1 to 31 representing the day of the month.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DATE = function(arg1, arg2, arg3) { return 0; };

/**
* Converts a date in the form of text to a number that represents the date in the date-time code.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The text that represents a date, between 1/1/1900 or 1/1/1904 (depending on the workbook's date system) and 12/31/9999.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DATEVALUE = function(arg1) { return 0; };

/**
* Returns the day of the date given in the numerical format, a number from 1 to 31.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A number in the date-time code.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DAY = function(arg1) { return 0; };

/**
* Returns the number of days between the two dates.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - Start date from which days will be counted.
* @param {ApiRange | ApiName | number} arg2 - End date until which days will be counted.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DAYS = function(arg1, arg2) { return 0; };

/**
* Returns the number of days between two dates based on a 360-day year (twelve 30-day months).
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - Start date from which days will be counted.
* @param {ApiRange | ApiName | number} arg2 - End date until which days will be counted.
* @param {ApiRange | ApiName | boolean} [arg3] - A logical value that specifies whether to use the U.S. (NASD) (false or omitted) or European (true) method in the calculation.
* According to the European method, the start and end dates that occur on the 31st of a month become equal to the 30th of the same month.
* According to the U.S. method, the start date is the last day of a month, it becomes equal to the 30th of the same month.
* If the end date is the last day of a month and the start date is earlier than the 30th of a month, the end date becomes equal to the 1st of the next month.
* Otherwise the end date becomes equal to the 30th of the same month.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DAYS360 = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the serial number of the date which comes the indicated number of months before or after the start date.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A serial date number that represents the start date.
* @param {ApiRange | ApiName | number} arg2 - The number of months before or after the start date.
* @returns {number}
*/
ApiWorksheetFunction.prototype.EDATE = function(arg1, arg2) { return 0; };

/**
* Returns the serial number of the last day of the month before or after the specified number of months.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A serial date number that represents the start date.
* @param {ApiRange | ApiName | number} arg2 - The number of months before or after the start date.
* @returns {number}
*/
ApiWorksheetFunction.prototype.EOMONTH = function(arg1, arg2) { return 0; };

/**
* Returns the hour as a number from 0 (12:00 A.M.) to 23 (11:00 P.M.).
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number | string} arg1 - A number in the date-time code, or text in the time format, such as "16:48:00" or "4:48:00 PM", or a result of other formulas or functions.
* @returns {number}
*/
ApiWorksheetFunction.prototype.HOUR = function(arg1) { return 0; };

/**
* Returns the ISO week number in the year for a given date.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The date-time code used for date and time calculation.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ISOWEEKNUM = function(arg1) { return 0; };

/**
* Returns the minute, a number from 0 to 59.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number | string} arg1 - A number in the date-time code, or text in the time format, such as "16:48:00" or "4:48:00 PM", or a result of other formulas or functions.
* @returns {number}
*/
ApiWorksheetFunction.prototype.MINUTE = function(arg1) { return 0; };

/**
* Returns the month, a number from 1 (January) to 12 (December).
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1- A number in the date-time code.
* @returns {number}
*/
ApiWorksheetFunction.prototype.MONTH = function(arg1-) { return 0; };

/**
* Returns the number of whole workdays between two dates.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A serial date number that represents the start date.
* @param {ApiRange | ApiName | number} arg2 - A serial date number that represents the end date.
* @param {ApiRange | number[]} [arg3] - An optional range or array of one or more serial date numbers to exclude from the working calendar, such as state and federal holidays and floating holidays.
* @returns {number}
*/
ApiWorksheetFunction.prototype.NETWORKDAYS = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the number of whole workdays between two dates with custom weekend parameters.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A serial date number that represents the start date.
* @param {ApiRange | ApiName | number} arg2 - A serial date number that represents the end date.
* @param {ApiRange | ApiName | number | string} [arg3] - A number or string specifying when weekends occur.
* @param {ApiRange | number[]} [arg4] - An optional range or array of one or more serial date numbers to exclude from the working calendar, such as state and federal holidays and floating holidays.
* @returns {number}
*/
ApiWorksheetFunction.prototype.NETWORKDAYS_INTL = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the current date and time in the *MM/dd/yy hh:mm* format.
* @memberof ApiWorksheetFunction
* @returns {number}
*/
ApiWorksheetFunction.prototype.NOW = function() { return 0; };

/**
* Returns the second, a number from 0 to 59.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number | string} arg1 - A number in the date-time code, or text in the time format, such as "16:48:00" or "4:48:00 PM", or a result of other formulas or functions.
* @returns {number}
*/
ApiWorksheetFunction.prototype.SECOND = function(arg1) { return 0; };

/**
* Converts hours, minutes and seconds given as numbers to a serial number, formatted with the time format.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A number from 0 to 23 representing the hour.
* @param {ApiRange | ApiName | number} arg2 - A number from 0 to 59 representing the minute.
* @param {ApiRange | ApiName | number} arg3 - A number from 0 to 59 representing the second.
* @returns {number}
*/
ApiWorksheetFunction.prototype.TIME = function(arg1, arg2, arg3) { return 0; };

/**
* Converts a text time to a serial number for a time, a number from 0 (12:00:00 AM) to 0.999988426 (11:59:59 PM). Format the number with a time format after entering the formula.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - A text string that represents a time in one of the time formats (date information in the string is ignored).
* @returns {number}
*/
ApiWorksheetFunction.prototype.TIMEVALUE = function(arg1) { return 0; };

/**
* Returns the current date in the *MM/dd/yy* format.
* @memberof ApiWorksheetFunction
* @returns {number}
*/
ApiWorksheetFunction.prototype.TODAY = function() { return 0; };

/**
* Returns a number from 1 to 7 identifying the day of the week of the specified date.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A number that represents a date, or a result of other formulas or functions.
* @param {ApiRange | ApiName | number} [arg2] - A number that determines the type of return value: <b>1</b> - returns a number from 1 (Sunday) to 7 (Saturday);
* <b>2</b> - returns a number from 1 (Monday) to 7 (Sunday); <b>3</b> - returns a number from 0 (Monday) to 6 (Sunday).
* @returns {number}
*/
ApiWorksheetFunction.prototype.WEEKDAY = function(arg1, arg2) { return 0; };

/**
* Returns the week number in the year.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The date-time code used for date and time calculation.
* @param {ApiRange | ApiName | number} [arg2] - A number (1 or 2) that determines the type of the return value: Sunday (1) or Monday (2).
* @returns {number}
*/
ApiWorksheetFunction.prototype.WEEKNUM = function(arg1, arg2) { return 0; };

/**
* Returns the serial number of the date before or after a specified number of workdays.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A serial date number that represents the start date.
* @param {ApiRange | ApiName | number} arg2 - The number of nonweekend and non-holiday days before or after the start date. A positive value for days yields a future date; a negative value yields a past date.
* @param {ApiRange | ApiName | number[]} [arg3] - An optional range or array of one or more serial date numbers to exclude from the working calendar, such as state and federal holidays and floating holidays.
* @returns {number}
*/
ApiWorksheetFunction.prototype.WORKDAY = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the serial number of the date before or after a specified number of workdays with custom weekend parameters.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A serial date number that represents the start date.
* @param {ApiRange | ApiName | number} arg2 - The number of nonweekend and non-holiday days before or after the start date. A positive value for days yields a future date; a negative value yields a past date.
* @param {ApiRange | ApiName | number | string} [arg3] - A number or string specifying when weekends occur.
* @param {ApiRange | ApiName | number[]} [arg4] - An optional range or array of one or more serial date numbers to exclude from the working calendar, such as state and federal holidays and floating holidays.
* @returns {number}
*/
ApiWorksheetFunction.prototype.WORKDAY_INTL = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the year of a date, an integer in the range 1900-9999.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A number in the date-time code, or a result of other formulas or functions.
* @returns {number}
*/
ApiWorksheetFunction.prototype.YEAR = function(arg1) { return 0; };

/**
* Returns the year fraction representing the number of whole days between the start date and end date.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A serial date number that represents the start date.
* @param {ApiRange | ApiName | number} arg2 - A serial date number that represents the end date.
* @param {ApiRange | ApiName | number} [arg3] - The type of day count basis to use: <b>0</b> or omitted - US (NASD) 30/360; <b>1</b> - Actual/actual; <b>2</b> - Actual/360; <b>3</b> - Actual/365; <b>4</b> - European 30/360.
* @returns {number}
*/
ApiWorksheetFunction.prototype.YEARFRAC = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the modified Bessel function In(x).
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value at which to evaluate the function.
* @param {ApiRange | ApiName | number} arg2 - The order of the Bessel function.
* @returns {number}
*/
ApiWorksheetFunction.prototype.BESSELI = function(arg1, arg2) { return 0; };

/**
* Returns the Bessel function Jn(x).
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value at which to evaluate the function.
* @param {ApiRange | ApiName | number} arg2 - The order of the Bessel function.
* @returns {number}
*/
ApiWorksheetFunction.prototype.BESSELJ = function(arg1, arg2) { return 0; };

/**
* Returns the modified Bessel function Kn(x).
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value at which to evaluate the function.
* @param {ApiRange | ApiName | number} arg2 - The order of the function.
* @returns {number}
*/
ApiWorksheetFunction.prototype.BESSELK = function(arg1, arg2) { return 0; };

/**
* Returns the Bessel function Yn(x).
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value at which to evaluate the function.
* @param {ApiRange | ApiName | number} arg2 - The order of the function.
* @returns {number}
*/
ApiWorksheetFunction.prototype.BESSELY = function(arg1, arg2) { return 0; };

/**
* Converts a binary number to decimal.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The binary number which will be convertrd.
* @returns {number}
*/
ApiWorksheetFunction.prototype.BIN2DEC = function(arg1) { return 0; };

/**
* Converts a binary number to hexadecimal.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The binary number which will be convertrd.
* @param {ApiRange | ApiName | number} [arg2] - The number of characters to use.
* @returns {number}
*/
ApiWorksheetFunction.prototype.BIN2HEX = function(arg1, arg2) { return 0; };

/**
* Converts a binary number to octal.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The binary number which will be convertrd.
* @param {ApiRange | ApiName | number} [arg2] - The number of characters to use.
* @returns {number}
*/
ApiWorksheetFunction.prototype.BIN2OCT = function(arg1, arg2) { return 0; };

/**
* Returns a bitwise "AND" of two numbers.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The first decimal representation of the binary number to evaluate.
* @param {ApiRange | ApiName | number} arg2 - The second decimal representation of the binary number to evaluate.
* @returns {number}
*/
ApiWorksheetFunction.prototype.BITAND = function(arg1, arg2) { return 0; };

/**
* Returns a number shifted left by the specified number of bits.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The decimal representation of the binary number to evaluate.
* @param {ApiRange | ApiName | number} arg2 - The number of bits by which the number will be shifted left.
* @returns {number}
*/
ApiWorksheetFunction.prototype.BITLSHIFT = function(arg1, arg2) { return 0; };

/**
* Returns a bitwise "OR" of two numbers.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The first decimal representation of the binary number to evaluate.
* @param {ApiRange | ApiName | number} arg2 - The second decimal representation of the binary number to evaluate.
* @returns {number}
*/
ApiWorksheetFunction.prototype.BITOR = function(arg1, arg2) { return 0; };

/**
* Returns a number shifted right by the specified number of bits.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The decimal representation of the binary number to evaluate.
* @param {ApiRange | ApiName | number} arg2 - The number of bits by which the number will be shifted right.
* @returns {number}
*/
ApiWorksheetFunction.prototype.BITRSHIFT = function(arg1, arg2) { return 0; };

/**
* Returns a bitwise "XOR" (Exclusive Or) of two numbers.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The first decimal representation of the binary number to evaluate.
* @param {ApiRange | ApiName | number} arg2 - The second decimal representation of the binary number to evaluate.
* @returns {number}
*/
ApiWorksheetFunction.prototype.BITXOR = function(arg1, arg2) { return 0; };

/**
* Converts real and imaginary coefficients into a complex number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The real coefficient of the complex number.
* @param {ApiRange | ApiName | number} arg2 - The imaginary coefficient of the complex number.
* @param {ApiRange | ApiName | string} [arg3] - The suffix for the imaginary component of the complex number. It can be either "i" or "j" in lowercase.
* If it is omitted, the function will assume suffix to be "i".
* @returns {number}
*/
ApiWorksheetFunction.prototype.COMPLEX = function(arg1, arg2, arg3) { return 0; };

/**
* Converts a number from one measurement system to another.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value in the specified units to be converted.
* @param {ApiRange | ApiName | string} arg2 - The original measurement unit.
* @param {ApiRange | ApiName | string} arg3 - The units for the result.
* @returns {number}
*/
ApiWorksheetFunction.prototype.CONVERT = function(arg1, arg2, arg3) { return 0; };

/**
* Converts a decimal number to binary.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The decimal integer to convert.
* @param {ApiRange | ApiName | number} [arg2] - The number of characters to use.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DEC2BIN = function(arg1, arg2) { return 0; };

/**
* Converts a decimal number to hexadecimal.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The decimal integer to convert.
* @param {ApiRange | ApiName | number} [arg2] - The number of characters to use.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DEC2HEX = function(arg1, arg2) { return 0; };

/**
* Converts a decimal number to octal.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - Te decimal integer to convert.
* @param {ApiRange | ApiName | number} [arg2] - The number of characters to use.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DEC2OCT = function(arg1, arg2) { return 0; };

/**
* Tests whether two numbers are equal. The function returns 1 if the numbers are equal and 0 otherwise.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The first number.
* @param {ApiRange | ApiName | number} [arg2] - The second number.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DELTA = function(arg1, arg2) { return 0; };

/**
* Returns the error function integrated between the specified lower and upper limits.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The lower bound for integrating the error function.
* @param {ApiRange | ApiName | number} [arg2] - The upper bound for integrating the error function.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ERF = function(arg1, arg2) { return 0; };

/**
* Returns the error function integrated between 0 and the specified lower limit.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The lower bound for integrating the error function.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ERF_PRECISE = function(arg1) { return 0; };

/**
* Returns the complementary error function integrated between the specified lower limit and infinity.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The lower bound for integrating the complementary error function.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ERFC = function(arg1) { return 0; };

/**
* Returns the complementary error function integrated between the specified lower limit and infinity.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The lower bound for integrating the complementary error function.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ERFC_PRECISE = function(arg1) { return 0; };

/**
* Tests whether a number is greater than a threshold value. The function returns 1 if the number is greater than or equal to the threshold value and 0 otherwise.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value to test against step.
* @param {ApiRange | ApiName | number} [arg2] - The threshold value.
* @returns {number}
*/
ApiWorksheetFunction.prototype.GESTEP = function(arg1, arg2) { return 0; };

/**
* Converts a hexadecimal number to binary.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The hexadecimal number to convert.
* @param {ApiRange | ApiName | number} [arg2] - The number of characters to use.
* @returns {number}
*/
ApiWorksheetFunction.prototype.HEX2BIN = function(arg1, arg2) { return 0; };

/**
* Converts a hexadecimal number to decimal.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The hexadecimal number to convert.
* @returns {number}
*/
ApiWorksheetFunction.prototype.HEX2DEC = function(arg1) { return 0; };

/**
* Converts a hexadecimal number to octal.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The hexadecimal number to convert.
* @param {ApiRange | ApiName | number} [arg2] - The number of characters to use.
* @returns {number}
*/
ApiWorksheetFunction.prototype.HEX2OCT = function(arg1, arg2) { return 0; };

/**
* Returns the absolute value (modulus) of a complex number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A complex number expressed in the *x + yi* or *x + yj* form.
* @returns {number}
*/
ApiWorksheetFunction.prototype.IMABS = function(arg1) { return 0; };

/**
* Returns the imaginary coefficient of a complex number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A complex number expressed in the *x + yi* or *x + yj* form.
* @returns {number}
*/
ApiWorksheetFunction.prototype.IMAGINARY = function(arg1) { return 0; };

/**
* Returns the argument Theta, an angle expressed in radians.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A complex number expressed in the *x + yi* or *x + yj* form.
* @returns {number}
*/
ApiWorksheetFunction.prototype.IMARGUMENT = function(arg1) { return 0; };

/**
* Returns the complex conjugate of a complex number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A complex number expressed in the *x + yi* or *x + yj* form.
* @returns {number}
*/
ApiWorksheetFunction.prototype.IMCONJUGATE = function(arg1) { return 0; };

/**
* Returns the cosine of a complex number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A complex number expressed in the *x + yi* or *x + yj* form.
* @returns {number}
*/
ApiWorksheetFunction.prototype.IMCOS = function(arg1) { return 0; };

/**
* Returns the hyperbolic cosine of a complex number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A complex number expressed in the *x + yi* or *x + yj* form.
* @returns {number}
*/
ApiWorksheetFunction.prototype.IMCOSH = function(arg1) { return 0; };

/**
* Returns the cotangent of a complex number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A complex number expressed in the *x + yi* or *x + yj* form.
* @returns {number}
*/
ApiWorksheetFunction.prototype.IMCOT = function(arg1) { return 0; };

/**
* Returns the cosecant of a complex number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A complex number expressed in the *x + yi* or *x + yj* form.
* @returns {number}
*/
ApiWorksheetFunction.prototype.IMCSC = function(arg1) { return 0; };

/**
* Returns the hyperbolic cosecant of a complex number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A complex number expressed in the *x + yi* or *x + yj* form.
* @returns {number}
*/
ApiWorksheetFunction.prototype.IMCSCH = function(arg1) { return 0; };

/**
* Returns the quotient of two complex numbers.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The complex numerator or dividend in the *x + yi* or *x + yj* form.
* @param {ApiRange | ApiName | number} arg2 - The complex denominator or divisor in the *x + yi* or *x + yj* form.
* @returns {number}
*/
ApiWorksheetFunction.prototype.IMDIV = function(arg1, arg2) { return 0; };

/**
* Returns the exponential of a complex number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A complex number expressed in the *x + yi* or *x + yj* form.
* @returns {number}
*/
ApiWorksheetFunction.prototype.IMEXP = function(arg1) { return 0; };

/**
* Returns the natural logarithm of a complex number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A complex number expressed in the *x + yi* or *x + yj* form.
* @returns {number}
*/
ApiWorksheetFunction.prototype.IMLN = function(arg1) { return 0; };

/**
* Returns the base-10 logarithm of a complex number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A complex number expressed in the *x + yi* or *x + yj* form.
* @returns {number}
*/
ApiWorksheetFunction.prototype.IMLOG10 = function(arg1) { return 0; };

/**
* Returns the base-2 logarithm of a complex number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A complex number expressed in the *x + yi* or *x + yj* form.
* @returns {number}
*/
ApiWorksheetFunction.prototype.IMLOG2 = function(arg1) { return 0; };

/**
* Returns a complex number raised to an integer power.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A complex number expressed in the *x + yi* or *x + yj* form.
* @param {ApiRange | ApiName | number} arg2 - The power to which the complex number will be raised.
* @returns {number}
*/
ApiWorksheetFunction.prototype.IMPOWER = function(arg1, arg2) { return 0; };

/**
* Returns the product of the specified complex numbers.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} args - Up to 255 complex numbers expressed in the *x + yi* or *x + yj* form.
* @returns {number}
*/
ApiWorksheetFunction.prototype.IMPRODUCT = function(args) { return 0; };

/**
* Returns the real coefficient of a complex number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A complex number expressed in the *x + yi* or *x + yj* form.
* @returns {number}
*/
ApiWorksheetFunction.prototype.IMREAL = function(arg1) { return 0; };

/**
* Returns the secant of a complex number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A complex number expressed in the *x + yi* or *x + yj* form.
* @returns {number}
*/
ApiWorksheetFunction.prototype.IMSEC = function(arg1) { return 0; };

/**
* Returns the hyperbolic secant of a complex number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A complex number expressed in the *x + yi* or *x + yj* form.
* @returns {number}
*/
ApiWorksheetFunction.prototype.IMSECH = function(arg1) { return 0; };

/**
* Returns the sine of a complex number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A complex number expressed in the *x + yi* or *x + yj* form.
* @returns {number}
*/
ApiWorksheetFunction.prototype.IMSIN = function(arg1) { return 0; };

/**
* Returns the hyperbolic sine of a complex number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A complex number expressed in the *x + yi* or *x + yj* form.
* @returns {number}
*/
ApiWorksheetFunction.prototype.IMSINH = function(arg1) { return 0; };

/**
* Returns the square root of a complex number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A complex number expressed in the *x + yi* or *x + yj* form.
* @returns {number}
*/
ApiWorksheetFunction.prototype.IMSQRT = function(arg1) { return 0; };

/**
* Returns the difference of two complex numbers expressed in the *x + yi* or *x + yj* form.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The complex number from which to subtract the second number.
* @param {ApiRange | ApiName | number} arg2 - The complex number to subtract from the first number.
* @returns {number}
*/
ApiWorksheetFunction.prototype.IMSUB = function(arg1, arg2) { return 0; };

/**
* Returns the sum of the specified complex numbers.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} args - Up to 255 complex numbers expressed in the *x + yi* or *x + yj* form.
* @returns {number}
*/
ApiWorksheetFunction.prototype.IMSUM = function(args) { return 0; };

/**
* Returns the tangent of a complex number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A complex number expressed in the *x + yi* or *x + yj* form.
* @returns {number}
*/
ApiWorksheetFunction.prototype.IMTAN = function(arg1) { return 0; };

/**
* Converts an octal number to binary.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The octal number to convert.
* @param {ApiRange | ApiName | number} [arg2] - The number of characters to use.
* @returns {number}
*/
ApiWorksheetFunction.prototype.OCT2BIN = function(arg1, arg2) { return 0; };

/**
* Converts an octal number to decimal.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The octal number to convert.
* @returns {number}
*/
ApiWorksheetFunction.prototype.OCT2DEC = function(arg1) { return 0; };

/**
* Converts an octal number to hexadecimal.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The octal number to convert.
* @param {ApiRange | ApiName | number} [arg2] -The number of characters to use.
* @returns {number}
*/
ApiWorksheetFunction.prototype.OCT2HEX = function(arg1, arg2) { return 0; };

/**
* Averages the values in a field (column) of records in a list or database that match conditions you specify.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName} arg1 - The range of cells that makes up the list or database. A database is a list of related data.
* @param {ApiRange | ApiName | number | string} arg2 - The column which is used in the function. Either the label of the column in double quotation marks or a number that represents the column's position in the list.
* @param {ApiRange | ApiName} arg3 - The range of cells that contains the conditions you specify. The range includes at least one column label and at least one cell below the column label for a condition.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DAVERAGE = function(arg1, arg2, arg3) { return 0; };

/**
* Counts the cells containing numbers in the field (column) of records in the database that match the conditions you specify.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName} arg1 - The range of cells that makes up the list or database. A database is a list of related data.
* @param {ApiRange | ApiName | number | string} arg2 - The column which is used in the function. Either the label of the column in double quotation marks or a number that represents the column's position in the list.
* @param {ApiRange | ApiName} arg3 - The range of cells that contains the conditions you specify. The range includes at least one column label and at least one cell below the column label for a condition.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DCOUNT = function(arg1, arg2, arg3) { return 0; };

/**
* Counts nonblank cells in the field (column) of records in the database that match the conditions you specify.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName} arg1- The range of cells that makes up the list or database. A database is a list of related data.
* @param {ApiRange | ApiName | number | string} arg2 - The column which is used in the function. Either the label of the column in double quotation marks or a number that represents the column's position in the list.
* @param {ApiRange | ApiName} arg3 - The range of cells that contains the conditions you specify. The range includes at least one column label and at least one cell below the column label for a condition.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DCOUNTA = function(arg1-, arg2, arg3) { return 0; };

/**
* Extracts from a database a single record that matches the conditions you specify.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName} arg1 - The range of cells that makes up the list or database. A database is a list of related data.
* @param {ApiRange | ApiName | number | string} arg2 - The column which is used in the function. Either the label of the column in double quotation marks or a number that represents the column's position in the list.
* @param {ApiRange | ApiName} arg3 - The range of cells that contains the conditions you specify. The range includes at least one column label and at least one cell below the column label for a condition.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DGET = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the largest number in the field (column) of records in the database that match the conditions you specify.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName} arg1 - The range of cells that makes up the list or database. A database is a list of related data.
* @param {ApiRange | ApiName | number | string} arg2 - The column which is used in the function. Either the label of the column in double quotation marks or a number that represents the column's position in the list.
* @param {ApiRange | ApiName} arg3 - The range of cells that contains the conditions you specify. The range includes at least one column label and at least one cell below the column label for a condition.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DMAX = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the smallest number in the field (column) of records in the database that match the conditions you specify.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName} arg1 - The range of cells that makes up the list or database. A database is a list of related data.
* @param {ApiRange | ApiName | number | string} arg2 - The column which is used in the function. Either the label of the column in double quotation marks or a number that represents the column's position in the list.
* @param {ApiRange | ApiName} arg3 - The range of cells that contains the conditions you specify. The range includes at least one column label and at least one cell below the column label for a condition.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DMIN = function(arg1, arg2, arg3) { return 0; };

/**
* Multiplies the values in the field (column) of records in the database that match the conditions you specify.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName} arg1 - The range of cells that makes up the list or database. A database is a list of related data.
* @param {ApiRange | ApiName | number | string} arg2 - The column which is used in the function. Either the label of the column in double quotation marks or a number that represents the column's position in the list.
* @param {ApiRange | ApiName} arg3 - The range of cells that contains the conditions you specify. The range includes at least one column label and at least one cell below the column label for a condition.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DPRODUCT = function(arg1, arg2, arg3) { return 0; };

/**
* Estimates the standard deviation based on a sample from the selected database entries.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName} arg1 - The range of cells that makes up the list or database. A database is a list of related data.
* @param {ApiRange | ApiName | number | string} arg2 - The column which is used in the function. Either the label of the column in double quotation marks or a number that represents the column's position in the list.
* @param {ApiRange | ApiName} arg3 - The range of cells that contains the conditions you specify. The range includes at least one column label and at least one cell below the column label for a condition.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DSTDEV = function(arg1, arg2, arg3) { return 0; };

/**
* Calculates the standard deviation based on the entire population of the selected database entries.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName} arg1 - The range of cells that makes up the list or database. A database is a list of related data.
* @param {ApiRange | ApiName | number | string} arg2 - The column which is used in the function. Either the label of the column in double quotation marks or a number that represents the column's position in the list.
* @param {ApiRange | ApiName} arg3 - The range of cells that contains the conditions you specify. The range includes at least one column label and at least one cell below the column label for a condition.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DSTDEVP = function(arg1, arg2, arg3) { return 0; };

/**
* Adds the numbers in the field (column) of records in the database that match the conditions you specify.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName} arg1 - The range of cells that makes up the list or database. A database is a list of related data.
* @param {ApiRange | ApiName | number | string} arg2 - The column which is used in the function. Either the label of the column in double quotation marks or a number that represents the column's position in the list.
* @param {ApiRange | ApiName} arg3 - The range of cells that contains the conditions you specify. The range includes at least one column label and at least one cell below the column label for a condition.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DSUM = function(arg1, arg2, arg3) { return 0; };

/**
* Estimates variance based on a sample from the selected database entries.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName} arg1 - The range of cells that makes up the list or database. A database is a list of related data.
* @param {ApiRange | ApiName | number | string} arg2 - The column which is used in the function. Either the label of the column in double quotation marks or a number that represents the column's position in the list.
* @param {ApiRange | ApiName} arg3 - The range of cells that contains the conditions you specify. The range includes at least one column label and at least one cell below the column label for a condition.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DVAR = function(arg1, arg2, arg3) { return 0; };

/**
* Calculates variance based on the entire population of the selected database entries.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName} arg1 - The range of cells that makes up the list or database. A database is a list of related data.
* @param {ApiRange | ApiName | number | string} arg2 - The column which is used in the function. Either the label of the column in double quotation marks or a number that represents the column's position in the list.
* @param {ApiRange | ApiName} arg3 - The range of cells that contains the conditions you specify. The range includes at least one column label and at least one cell below the column label for a condition.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DVARP = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the accrued interest for a security that pays periodic interest.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The issue date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg2 - The date when the first interest is paid, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg3 - The security settlement date, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg4 - The annual coupon rate of the security.
* @param {ApiRange | ApiName | number} arg5 - The par value of the security.
* @param {ApiRange | ApiName | number} arg6 - The number of interest payments per year. The possible values are: 1 for annual payments, 2 for semiannual payments, 4 for quarterly payments.
* @param {ApiRange | ApiName | number} [arg7] - The day count basis to use: <b>0</b> or omitted - US (NASD) 30/360; <b>1</b> - Actual/actual; <b>2</b> - Actual/360; <b>3</b> - Actual/365; <b>4</b> - European 30/360.
* @param {ApiRange | ApiName | number} [arg8] - A logical value: <b>true</b> (1) or omitted returns the accrued interest from the issue date to the settlement date.
* <b>false</b> (0) returns the accrued interest from the first interest date to the settlement date.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ACCRINT = function(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) { return 0; };

/**
* Returns the accrued interest for a security that pays interest at maturity.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The issue date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg2 - The maturity date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg3 - The annual coupon rate of the security.
* @param {ApiRange | ApiName | number} arg4 - The par value of the security.
* @param {ApiRange | ApiName | number} [arg5] - The day count basis to use: <b>0</b> or omitted - US (NASD) 30/360; <b>1</b> - Actual/actual; <b>2</b> - Actual/360; <b>3</b> - Actual/365; <b>4</b> - European 30/360.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ACCRINTM = function(arg1, arg2, arg3, arg4, arg5) { return 0; };

/**
* Returns the prorated linear depreciation of an asset for each accounting period.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The cost of the asset.
* @param {ApiRange | ApiName | number} arg2 - The date when asset is purchased.
* @param {ApiRange | ApiName | number} arg3 - The date when the first period ends.
* @param {ApiRange | ApiName | number} arg4 - The salvage value of the asset at the end of its lifetime.
* @param {ApiRange | ApiName | number} arg5 - The period for which the depreciation will be calculated.
* @param {ApiRange | ApiName | number} arg6 - The rate of depreciation.
* @param {ApiRange | ApiName | number} [arg7] - The day count basis to use: <b>0</b> or omitted - US (NASD) 30/360; <b>1</b> - Actual/actual; <b>2</b> - Actual/360; <b>3</b> - Actual/365; <b>4</b> - European 30/360.
* @returns {number}
*/
ApiWorksheetFunction.prototype.AMORDEGRC = function(arg1, arg2, arg3, arg4, arg5, arg6, arg7) { return 0; };

/**
* Returns the prorated linear depreciation of an asset for each accounting period.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The cost of the asset.
* @param {ApiRange | ApiName | number} arg2 - The date when asset is purchased.
* @param {ApiRange | ApiName | number} arg3 - The date when the first period ends.
* @param {ApiRange | ApiName | number} arg4 - The salvage value of the asset at the end of its lifetime.
* @param {ApiRange | ApiName | number} arg5 - The period for which the depreciation will be calculated.
* @param {ApiRange | ApiName | number} arg6 - The rate of depreciation.
* @param {ApiRange | ApiName | number} [arg7] - The day count basis to use: <b>0</b> or omitted - US (NASD) 30/360; <b>1</b> - Actual/actual; <b>2</b> - Actual/360; <b>3</b> - Actual/365; <b>4</b> - European 30/360.
* @returns {number}
*/
ApiWorksheetFunction.prototype.AMORLINC = function(arg1, arg2, arg3, arg4, arg5, arg6, arg7) { return 0; };

/**
* Returns the number of days from the beginning of the coupon period to the settlement date.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The security settlement date, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg2 - The maturity date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg3 - The number of interest payments per year. The possible values are: 1 for annual payments, 2 for semiannual payments, 4 for quarterly payments.
* @param {ApiRange | ApiName | number} [arg4] - The day count basis to use: <b>0</b> or omitted - US (NASD) 30/360; <b>1</b> - Actual/actual; <b>2</b> - Actual/360; <b>3</b> - Actual/365; <b>4</b> - European 30/360.
* @returns {number}
*/
ApiWorksheetFunction.prototype.COUPDAYBS = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the number of days in the coupon period that contains the settlement date.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The security settlement date, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg2 - The maturity date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg3 - The number of interest payments per year. The possible values are: 1 for annual payments, 2 for semiannual payments, 4 for quarterly payments.
* @param {ApiRange | ApiName | number} [arg4] - The day count basis to use: <b>0</b> or omitted - US (NASD) 30/360; <b>1</b> - Actual/actual; <b>2</b> - Actual/360; <b>3</b> - Actual/365; <b>4</b> - European 30/360.
* @returns {number}
*/
ApiWorksheetFunction.prototype.COUPDAYS = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the number of days from the settlement date to the next coupon date.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The security settlement date, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg2 - The maturity date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg3 - The number of interest payments per year. The possible values are: 1 for annual payments, 2 for semiannual payments, 4 for quarterly payments.
* @param {ApiRange | ApiName | number} [arg4] - The day count basis to use: <b>0</b> or omitted - US (NASD) 30/360; <b>1</b> - Actual/actual; <b>2</b> - Actual/360; <b>3</b> - Actual/365; <b>4</b> - European 30/360.
* @returns {number}
*/
ApiWorksheetFunction.prototype.COUPDAYSNC = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the next coupon date after the settlement date.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The security settlement date, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg2 - The maturity date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg3 - The number of interest payments per year. The possible values are: 1 for annual payments, 2 for semiannual payments, 4 for quarterly payments.
* @param {ApiRange | ApiName | number} [arg4] - The day count basis to use: <b>0</b> or omitted - US (NASD) 30/360; <b>1</b> - Actual/actual; <b>2</b> - Actual/360; <b>3</b> - Actual/365; <b>4</b> - European 30/360.
* @returns {number}
*/
ApiWorksheetFunction.prototype.COUPNCD = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the number of coupons payable between the settlement date and maturity date.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The security settlement date, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg2 - The maturity date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg3 - The number of interest payments per year. The possible values are: 1 for annual payments, 2 for semiannual payments, 4 for quarterly payments.
* @param {ApiRange | ApiName | number} [arg4] - The day count basis to use: <b>0</b> or omitted - US (NASD) 30/360; <b>1</b> - Actual/actual; <b>2</b> - Actual/360; <b>3</b> - Actual/365; <b>4</b> - European 30/360.
* @returns {number}
*/
ApiWorksheetFunction.prototype.COUPNUM = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the previous coupon date before the settlement date.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The security settlement date, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg2 - The maturity date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg3 - The number of interest payments per year. The possible values are: 1 for annual payments, 2 for semiannual payments, 4 for quarterly payments.
* @param {ApiRange | ApiName | number} [arg4] - The day count basis to use: <b>0</b> or omitted - US (NASD) 30/360; <b>1</b> - Actual/actual; <b>2</b> - Actual/360; <b>3</b> - Actual/365; <b>4</b> - European 30/360.
* @returns {number}
*/
ApiWorksheetFunction.prototype.COUPPCD = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the cumulative interest paid between two periods.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The interest rate for the investment.
* @param {ApiRange | ApiName | number} arg2 - The total number of payment periods.
* @param {ApiRange | ApiName | number} arg3 - A present value of the payments.
* @param {ApiRange | ApiName | number} arg4 - The first period included into the calculation.
* @param {ApiRange | ApiName | number} arg5 - The last period included into the calculation.
* @param {ApiRange | ApiName | number} arg6 - The timing of the payment.
* @returns {number}
*/
ApiWorksheetFunction.prototype.CUMIPMT = function(arg1, arg2, arg3, arg4, arg5, arg6) { return 0; };

/**
* Returns the cumulative principal paid on a loan between two periods.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The interest rate for the investment.
* @param {ApiRange | ApiName | number} arg2 - The total number of payment periods.
* @param {ApiRange | ApiName | number} arg3 - A present value of the payments.
* @param {ApiRange | ApiName | number} arg4 - The first period included into the calculation.
* @param {ApiRange | ApiName | number} arg5 - The last period included into the calculation.
* @param {ApiRange | ApiName | number} arg6 - The timing of the payment.
* @returns {number}
*/
ApiWorksheetFunction.prototype.CUMPRINC = function(arg1, arg2, arg3, arg4, arg5, arg6) { return 0; };

/**
* Returns the depreciation of an asset for a specified period using the fixed-declining balance method.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The initial cost of the asset.
* @param {ApiRange | ApiName | number} arg2 - The salvage value of the asset at the end of its lifetime.
* @param {ApiRange | ApiName | number} arg3 - The number of periods over which the asset is being depreciated (sometimes called the useful life of the asset).
* @param {ApiRange | ApiName | number} arg4 - The period for which the depreciation will be calculated. Period must use the same units as the useful life of the asset.
* @param {ApiRange | ApiName | number} [arg5] - The number of months in the first year. If this parameter is omitted, it is assumed to be 12.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DB = function(arg1, arg2, arg3, arg4, arg5) { return 0; };

/**
* Returns the depreciation of an asset for a specified period using the double-declining balance method or some other method you specify.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The initial cost of the asset.
* @param {ApiRange | ApiName | number} arg2 - The salvage value of the asset at the end of its lifetime.
* @param {ApiRange | ApiName | number} arg3 - The number of periods over which the asset is being depreciated (sometimes called the useful life of the asset).
* @param {ApiRange | ApiName | number} arg4 - The period for which the depreciation will be calculated. Period must use the same units as the useful life of the asset.
* @param {ApiRange | ApiName | number} [arg5] - The rate at which the balance declines. If this parameter is omitted, it is assumed to be 2 (the double-declining balance method).
* @returns {number}
*/
ApiWorksheetFunction.prototype.DDB = function(arg1, arg2, arg3, arg4, arg5) { return 0; };

/**
* Returns the discount rate for a security.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The security settlement date, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg2 - The maturity date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg3 - The purchase price of the security, per $100 par value.
* @param {ApiRange | ApiName | number} arg4 - The redemption value of the security, per $100 par value.
* @param {ApiRange | ApiName | number} [arg5] - The day count basis to use: <b>0</b> or omitted - US (NASD) 30/360; <b>1</b> - Actual/actual; <b>2</b> - Actual/360; <b>3</b> - Actual/365; <b>4</b> - European 30/360.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DISC = function(arg1, arg2, arg3, arg4, arg5) { return 0; };

/**
* Converts a dollar price, expressed as a fraction, into a dollar price, expressed as a decimal number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A number expressed as a fraction.
* @param {ApiRange | ApiName | number} arg2 - The integer to use in the denominator of the fraction.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DOLLARDE = function(arg1, arg2) { return 0; };

/**
* Converts a dollar price, expressed as a decimal number, into a dollar price, expressed as a fraction.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A decimal number.
* @param {ApiRange | ApiName | number} arg2 - The integer to use in the denominator of a fraction.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DOLLARFR = function(arg1, arg2) { return 0; };

/**
* Returns the annual duration of a security with periodic interest payments.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The security settlement date, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg2 - The maturity date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg3 - The annual coupon rate of the security.
* @param {ApiRange | ApiName | number} arg4 - The annual yield of the security.
* @param {ApiRange | ApiName | number} arg5 - The number of interest payments per year. The possible values are: 1 for annual payments, 2 for semiannual payments, 4 for quarterly payments.
* @param {ApiRange | ApiName | number} [arg6] - The day count basis to use: <b>0</b> or omitted - US (NASD) 30/360; <b>1</b> - Actual/actual; <b>2</b> - Actual/360; <b>3</b> - Actual/365; <b>4</b> - European 30/360.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DURATION = function(arg1, arg2, arg3, arg4, arg5, arg6) { return 0; };

/**
* Returns the effective annual interest rate.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The nominal interest rate.
* @param {ApiRange | ApiName | number} arg2 - The number of compounding periods per year.
* @returns {number}
*/
ApiWorksheetFunction.prototype.EFFECT = function(arg1, arg2) { return 0; };

/**
* Returns the future value of an investment based on periodic, constant payments and a constant interest rate.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The interest rate per period. For example, use 6%/4 for quarterly payments at 6% APR.
* @param {ApiRange | ApiName | number} arg2 - The total number of payment periods in the investment.
* @param {ApiRange | ApiName | number} arg3 - The payment made each period; it cannot change over the life of the investment.
* @param {ApiRange | ApiName | number} [arg4] - The present value, or the lump-sum amount that a series of future payments is worth now. If omitted, it is equal to 0.
* @param {ApiRange | ApiName | number} [arg5] - A value representing the timing of payment: payment at the beginning of the period = 1; payment at the end of the period = 0 or omitted.
* @returns {number}
*/
ApiWorksheetFunction.prototype.FV = function(arg1, arg2, arg3, arg4, arg5) { return 0; };

/**
* Returns the future value of an initial principal after applying a series of compound interest rates.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The present value of an investment.
* @param {number[] | ApiRange | ApiName} arg2 - An array of interest rates to apply.
* @returns {number}
*/
ApiWorksheetFunction.prototype.FVSCHEDULE = function(arg1, arg2) { return 0; };

/**
* Returns the interest rate for a fully invested security.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The security settlement date, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg2 - The maturity date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg3 - The amount invested in the security.
* @param {ApiRange | ApiName | number} arg4 - The amount to be received at maturity.
* @param {ApiRange | ApiName | number} [arg6] - The day count basis to use: <b>0</b> or omitted - US (NASD) 30/360; <b>1</b> - Actual/actual; <b>2</b> - Actual/360; <b>3</b> - Actual/365; <b>4</b> - European 30/360.
* @returns {number}
*/
ApiWorksheetFunction.prototype.INTRATE = function(arg1, arg2, arg3, arg4, arg6) { return 0; };

/**
* Returns the interest payment for a given period for an investment, based on periodic, constant payments and a constant interest rate.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The interest rate per period. For example, use 6%/4 for quarterly payments at 6% APR.
* @param {ApiRange | ApiName | number} arg2 - The period for which the interest will be returned. It must be in the range from 1 to the total number of payments.
* @param {ApiRange | ApiName | number} arg3 - The total number of payment periods in an investment.
* @param {ApiRange | ApiName | number} arg4 - The present value, or the lump-sum amount that a series of future payments is worth now.
* @param {ApiRange | ApiName | number} [arg5] - The future value, or a cash balance which will be attained after the last payment is made. If omitted, it is equal to 0.
* @param {ApiRange | ApiName | number} [arg6] - A logical value representing the timing of payment: at the end of the period = 0 or omitted, at the beginning of the period = 1.
* @returns {number}
*/
ApiWorksheetFunction.prototype.IPMT = function(arg1, arg2, arg3, arg4, arg5, arg6) { return 0; };

/**
* Returns the internal rate of return for a series of cash flows.
* @memberof ApiWorksheetFunction
* @param {number[] | ApiRange} arg1 - A range or array of cells that contain numbers for which the internal rate of return will be calculated.
* @param {ApiRange | ApiName | number} [arg2] - An estimate at what the internal rate of return will be. If it is omitted, the function will assume guess to be 0.1 (10 percent).
* @returns {number}
*/
ApiWorksheetFunction.prototype.IRR = function(arg1, arg2) { return 0; };

/**
* Returns the interest paid during a specific period of an investment.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The interest rate per period. For example, use 6%/4 for quarterly payments at 6% APR.
* @param {ApiRange | ApiName | number} arg2 - The period for which the interest will be retuned. It must be in the range from 1 to the total number of payments.
* @param {ApiRange | ApiName | number} arg3 - The total number of payment periods in an investment.
* @param {ApiRange | ApiName | number} arg4 - The present value, or the lump-sum amount that a series of future payments is worth now.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ISPMT = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the modified Macauley duration of a security with an assumed par value of $100.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The security settlement date, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg2 - The maturity date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg3 - The annual coupon rate of the security.
* @param {ApiRange | ApiName | number} arg4 - The annual yield of the security.
* @param {ApiRange | ApiName | number} arg5 - The number of interest payments per year. The possible values are: 1 for annual payments, 2 for semiannual payments, 4 for quarterly payments.
* @param {ApiRange | ApiName | number} [arg6] - The day count basis to use: <b>0</b> or omitted - US (NASD) 30/360; <b>1</b> - Actual/actual; <b>2</b> - Actual/360; <b>3</b> - Actual/365; <b>4</b> - European 30/360.
* @returns {number}
*/
ApiWorksheetFunction.prototype.MDURATION = function(arg1, arg2, arg3, arg4, arg5, arg6) { return 0; };

/**
* Returns the internal rate of return for a series of periodic cash flows, considering both cost of investment and interest on reinvestment of cash.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number[]} arg1 - A range or array of cells that contain numbers that represent a series of payments (negative) and income (positive) at regular periods.
* @param {ApiRange | ApiName | number} arg2 - The interest rate paid on the money used in the cash flows.
* @param {ApiRange | ApiName | number} arg3 - The interest rate received on the cash reinvestment.
* @returns {number}
*/
ApiWorksheetFunction.prototype.MIRR = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the annual nominal interest rate.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The effective interest rate of the security.
* @param {ApiRange | ApiName | number} arg2 - The number of compounding periods per year.
* @returns {number}
*/
ApiWorksheetFunction.prototype.NOMINAL = function(arg1, arg2) { return 0; };

/**
* Returns the number of periods for an investment based on periodic, constant payments and a constant interest rate.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The interest rate per period. For example, use 6%/4 for quarterly payments at 6% APR.
* @param {ApiRange | ApiName | number} arg2 - The payment made each period; it cannot change over the life of the investment.
* @param {ApiRange | ApiName | number} arg3 - Te present value, or the lump-sum amount that a series of future payments is worth now.
* @param {ApiRange | ApiName | number} [arg4] - The future value, or a cash balance which will be attained after the last payment is made. If omitted, zero is used.
* @param {ApiRange | ApiName | number} [arg5] - A logical value: payment at the beginning of the period = 1; payment at the end of the period = 0 or omitted.
* @returns {number}
*/
ApiWorksheetFunction.prototype.NPER = function(arg1, arg2, arg3, arg4, arg5) { return 0; };

/**
* Returns the net present value of an investment based on a discount rate and a series of future payments (negative values) and income (positive values).
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The discount rate.
* @param {number | ApiRange | number[]} args - Up to 255 arguments representing future payments (negative values) and income (positive values).
* The first argument is required, the subsequent values are optional. Arguments can be numbers, ranges, arrays of numbers.
* @returns {number}
*/
ApiWorksheetFunction.prototype.NPV = function(arg1, args) { return 0; };

/**
* Returns the price per $100 face value of a security with an odd first period.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The security settlement date, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg2 - The maturity date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg3 - The issue date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg4 - The first coupon date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg5 - The interest rate of the security.
* @param {ApiRange | ApiName | number} arg6 - The annual yield of the security.
* @param {ApiRange | ApiName | number} arg7 - The redemption value of the security, per $100 face value.
* @param {ApiRange | ApiName | number} arg8 - The number of interest payments per year. The possible values are: 1 for annual payments, 2 for semiannual payments, 4 for quarterly payments.
* @param {ApiRange | ApiName | number} [arg9] - The day count basis to use: <b>0</b> or omitted - US (NASD) 30/360; <b>1</b> - Actual/actual; <b>2</b> - Actual/360; <b>3</b> - Actual/365; <b>4</b> - European 30/360.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ODDFPRICE = function(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) { return 0; };

/**
* Returns the yield of a security with an odd first period.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The security settlement date, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg2 - The maturity date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg3 - The issue date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg4 - The first coupon date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg5 - The interest rate of the security.
* @param {ApiRange | ApiName | number} arg6 - The purchase price of the security, per $100 par value.
* @param {ApiRange | ApiName | number} arg7 - The redemption value of the security, per $100 par value.
* @param {ApiRange | ApiName | number} arg8 - The number of interest payments per year. The possible values are: 1 for annual payments, 2 for semiannual payments, 4 for quarterly payments.
* @param {ApiRange | ApiName | number} [arg9] - The day count basis to use: <b>0</b> or omitted - US (NASD) 30/360; <b>1</b> - Actual/actual; <b>2</b> - Actual/360; <b>3</b> - Actual/365; <b>4</b> - European 30/360.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ODDFYIELD = function(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) { return 0; };

/**
* Returns the price per $100 face value of a security with an odd last period.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The security settlement date, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg2 - The maturity date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg3 - The last coupon date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg5 - The interest rate of the security.
* @param {ApiRange | ApiName | number} arg5 - The annual yield of the security.
* @param {ApiRange | ApiName | number} arg6 - The redemption value of the security, per $100 par value.
* @param {ApiRange | ApiName | number} arg8 - The number of interest payments per year. The possible values are: 1 for annual payments, 2 for semiannual payments, 4 for quarterly payments.
* @param {ApiRange | ApiName | number} [arg9] - The day count basis to use: <b>0</b> or omitted - US (NASD) 30/360; <b>1</b> - Actual/actual; <b>2</b> - Actual/360; <b>3</b> - Actual/365; <b>4</b> - European 30/360.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ODDLPRICE = function(arg1, arg2, arg3, arg5, arg5, arg6, arg8, arg9) { return 0; };

/**
* Returns the yield of a security with an odd last period.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The security settlement date, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg2 - The maturity date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg3 - The last coupon date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg5 - The interest rate of the security.
* @param {ApiRange | ApiName | number} arg6 - The purchase price of the security, per $100 par value.
* @param {ApiRange | ApiName | number} arg6 - The redemption value of the security, per $100 par value.
* @param {ApiRange | ApiName | number} arg8 - The number of interest payments per year. The possible values are: 1 for annual payments, 2 for semiannual payments, 4 for quarterly payments.
* @param {ApiRange | ApiName | number} [arg9] - The day count basis to use: <b>0</b> or omitted - US (NASD) 30/360; <b>1</b> - Actual/actual; <b>2</b> - Actual/360; <b>3</b> - Actual/365; <b>4</b> - European 30/360.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ODDLYIELD = function(arg1, arg2, arg3, arg5, arg6, arg6, arg8, arg9) { return 0; };

/**
* Returns the number of periods required by an investment to reach a specified value.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The interest rate per period.
* @param {ApiRange | ApiName | number} arg2 - The present value of the investment.
* @param {ApiRange | ApiName | number} arg3 - The desired future value of the investment.
* @returns {number}
*/
ApiWorksheetFunction.prototype.PDURATION = function(arg1, arg2, arg3) { return 0; };

/**
* Calculates the payment for a loan based on constant payments and a constant interest rate.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The interest rate per period for the loan. For example, use 6%/4 for quarterly payments at 6% APR.
* @param {ApiRange | ApiName | number} arg2 - The total number of payments for the loan.
* @param {ApiRange | ApiName | number} arg3 - The present value: the total amount that a series of future payments is worth now.
* @param {ApiRange | ApiName | number} [arg4] - The future value, or a cash balance which will be attained after the last payment is made. If omitted, it is equal to 0.
* @param {ApiRange | ApiName | number} [arg5] - A logical value: payment at the beginning of the period = 1; payment at the end of the period = 0 or omitted.
* @returns {number}
*/
ApiWorksheetFunction.prototype.PMT = function(arg1, arg2, arg3, arg4, arg5) { return 0; };

/**
* Returns the payment on the principal for a given investment based on periodic, constant payments and a constant interest rate.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The interest rate per period. For example, use 6%/4 for quarterly payments at 6% APR.
* @param {ApiRange | ApiName | number} arg2 - The period for which the principal payment will be returned. It must be in the range from 1 to to the total number of payment periods.
* @param {ApiRange | ApiName | number} arg3 - The total number of payment periods in an investment.
* @param {ApiRange | ApiName | number} arg4 - The present value: the total amount that a series of future payments is worth now.
* @param {ApiRange | ApiName | number} [arg5] - The future value, or cash balance which will be attained after the last payment is made.
* @param {ApiRange | ApiName | number} [arg6] - A logical value: payment at the beginning of the period = 1; payment at the end of the period = 0 or omitted.
* @returns {number}
*/
ApiWorksheetFunction.prototype.PPMT = function(arg1, arg2, arg3, arg4, arg5, arg6) { return 0; };

/**
* Returns the price per $100 face value for a security that pays periodic interest.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The security settlement date, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg2 - The maturity date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg3 - The annual coupon rate of the security.
* @param {ApiRange | ApiName | number} arg4 - The annual yield of the security.
* @param {ApiRange | ApiName | number} arg5 - The redemption value of the security, per $100 par value.
* @param {ApiRange | ApiName | number} arg6 - The number of interest payments per year. The possible values are: 1 for annual payments, 2 for semiannual payments, 4 for quarterly payments.
* @param {ApiRange | ApiName | number} [arg7] - The day count basis to use: <b>0</b> or omitted - US (NASD) 30/360; <b>1</b> - Actual/actual; <b>2</b> - Actual/360; <b>3</b> - Actual/365; <b>4</b> - European 30/360.
* @returns {number}
*/
ApiWorksheetFunction.prototype.PRICE = function(arg1, arg2, arg3, arg4, arg5, arg6, arg7) { return 0; };

/**
* Returns the price per $100 face value for a discounted security.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The security settlement date, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg2 - The maturity date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg3 - The discount rate of the security.
* @param {ApiRange | ApiName | number} arg4 - The redemption value of the security, per $100 par value.
* @param {ApiRange | ApiName | number} [arg5] - The day count basis to use: <b>0</b> or omitted - US (NASD) 30/360; <b>1</b> - Actual/actual; <b>2</b> - Actual/360; <b>3</b> - Actual/365; <b>4</b> - European 30/360.
* @returns {number}
*/
ApiWorksheetFunction.prototype.PRICEDISC = function(arg1, arg2, arg3, arg4, arg5) { return 0; };

/**
* Returns the price per $100 face value for a security that pays interest at maturity.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The security settlement date, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg2 - The maturity date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg3 - The issue date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg4 - The security interest rate at the issue date.
* @param {ApiRange | ApiName | number} arg5 - The annual yield of the security.
* @param {ApiRange | ApiName | number} [arg6] - The day count basis to use: <b>0</b> or omitted - US (NASD) 30/360; <b>1</b> - Actual/actual; <b>2</b> - Actual/360; <b>3</b> - Actual/365; <b>4</b> - European 30/360.
* @returns {number}
*/
ApiWorksheetFunction.prototype.PRICEMAT = function(arg1, arg2, arg3, arg4, arg5, arg6) { return 0; };

/**
* Returns the present value of an investment: the total amount that a series of future payments is worth now.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The interest rate per period. For example, use 6%/4 for quarterly payments at 6% APR.
* @param {ApiRange | ApiName | number} arg2 - The total number of payment periods in an investment.
* @param {ApiRange | ApiName | number} arg3 - The payment made each period and cannot change over the life of the investment.
* @param {ApiRange | ApiName | number} [arg4] - The future value, or a cash balance which will be attained after the last payment is made. If omitted, it is equal to 0.
* @param {ApiRange | ApiName | number} [arg5] - A logical value: payment at the beginning of the period = 1; payment at the end of the period = 0 or omitted.
* @returns {number}
*/
ApiWorksheetFunction.prototype.PV = function(arg1, arg2, arg3, arg4, arg5) { return 0; };

/**
* Returns the interest rate per period for a loan or an investment. For example, use 6%/4 for quarterly payments at 6% APR.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The total number of payment periods for the loan or investment.
* @param {ApiRange | ApiName | number} arg2 - The payment made each period and cannot change over the life of the loan or investment.
* @param {ApiRange | ApiName | number} arg3 - The present value: the total amount that a series of future payments is worth now.
* @param {ApiRange | ApiName | number} [arg4] - The future value, or a cash balance which will be attained after the last payment is made. If omitted, it is equal to 0.
* @param {ApiRange | ApiName | number} [arg5] - A logical value: payment at the beginning of the period = 1; payment at the end of the period = 0 or omitted.
* @param {ApiRange | ApiName | number} [arg6] - An estimate at what the rate will be. If it is omitted, the function will assume guess to be 0.1 (10 percent).
* @returns {number}
*/
ApiWorksheetFunction.prototype.RATE = function(arg1, arg2, arg3, arg4, arg5, arg6) { return 0; };

/**
* Returns the amount received at maturity for a fully invested security.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The security settlement date, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg2 - The maturity date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg3 - The amount invested in the security.
* @param {ApiRange | ApiName | number} arg4 - 	The security discount rate.
* @param {ApiRange | ApiName | number} [arg6] - The day count basis to use: <b>0</b> or omitted - US (NASD) 30/360; <b>1</b> - Actual/actual; <b>2</b> - Actual/360; <b>3</b> - Actual/365; <b>4</b> - European 30/360.
* @returns {number}
*/
ApiWorksheetFunction.prototype.RECEIVED = function(arg1, arg2, arg3, arg4, arg6) { return 0; };

/**
* Returns an equivalent interest rate for the growth of an investment.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The number of periods for the investment.
* @param {ApiRange | ApiName | number} arg2 - The present value of the investment.
* @param {ApiRange | ApiName | number} arg3 - The future value of the investment.
* @returns {number}
*/
ApiWorksheetFunction.prototype.RRI = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the straight-line depreciation of an asset for one period.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The initial cost of the asset.
* @param {ApiRange | ApiName | number} arg2 - The salvage value of the asset at the end of its lifetime.
* @param {ApiRange | ApiName | number} arg3 - The number of periods over which the asset is being depreciated (sometimes called the useful life of the asset).
* @returns {number}
*/
ApiWorksheetFunction.prototype.SLN = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the sum-of-years' digits depreciation of an asset for a specified period.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The initial cost of the asset.
* @param {ApiRange | ApiName | number} arg2 - The salvage value of the asset at the end of its lifetime.
* @param {ApiRange | ApiName | number} arg3 - The number of periods over which the asset is being depreciated (sometimes called the useful life of the asset).
* @param {ApiRange | ApiName | number} arg4 - The period for which the depreciation will be calculated. It must use the same units as the useful life of the asset.
* @returns {number}
*/
ApiWorksheetFunction.prototype.SYD = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the bond-equivalent yield for a treasury bill.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The settlement date of the Treasury bill, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg2 - The maturity date of the Treasury bill, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg3 - The discount rate of the Treasury bill.
* @returns {number}
*/
ApiWorksheetFunction.prototype.TBILLEQ = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the price per $100 face value for a Treasury bill.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The settlement date of the Treasury bill, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg2 - The maturity date of the Treasury bill, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg3 - The discount rate of the Treasury bill.
* @returns {number}
*/
ApiWorksheetFunction.prototype.TBILLPRICE = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the yield for a Treasury bill.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The settlement date of the Treasury bill, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg2 - The maturity date of the Treasury bill, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg3 - The purchase price of the Treasury bill, per $100 par value.
* @returns {number}
*/
ApiWorksheetFunction.prototype.TBILLYIELD = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the depreciation of an asset for any specified period, including partial periods, using the double-declining balance method or some other method specified.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The initial cost of the asset.
* @param {ApiRange | ApiName | number} arg2 - The salvage value of the asset at the end of its lifetime.
* @param {ApiRange | ApiName | number} arg3 - The number of periods over which the asset is being depreciated (sometimes called the useful life of the asset).
* @param {ApiRange | ApiName | number} arg4 - The starting period for which the depreciation will be calculated, in the same units as the useful life of the asset.
* @param {ApiRange | ApiName | number} arg5 - The ending period for which the depreciation will be calculated, in the same units as the useful life of the asset.
* @param {ApiRange | ApiName | number} [arg6] - The rate at which the balance declines. If it is omitted, the function will assume it to be 2
* @param {ApiRange | ApiName | boolean} [arg7] - Specifies whether to use straight-line depreciation when depreciation is greater than the declining balance calculation (<b>false</b> or omitted).
* If it is set to <b>true</b>, the function uses the declining balance method.
* @returns {number}
*/
ApiWorksheetFunction.prototype.VDB = function(arg1, arg2, arg3, arg4, arg5, arg6, arg7) { return 0; };

/**
* Returns the internal rate of return for a schedule of cash flows.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName} arg1 - A range that contains the series of cash flows that corresponds to a schedule of payments in dates.
* @param {ApiRange | ApiName} arg2 - A range that contains the schedule of payment dates that corresponds to the cash flow payments.
* @param {ApiRange | ApiName | number} [arg3] - An estimate at what the internal rate of return will be. If it is omitted, the function will assume guess to be 0.1 (10 percent).
* @returns {number}
*/
ApiWorksheetFunction.prototype.XIRR = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the net present value for a schedule of cash flows.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The discount rate to apply to the cash flows.
* @param {ApiRange | ApiName} arg2 - A range that contains the series of cash flows that corresponds to a schedule of payments in dates.
* @param {ApiRange | ApiName} arg3 - A range that contains the schedule of payment dates that corresponds to the cash flow payments.
* @returns {number}
*/
ApiWorksheetFunction.prototype.XNPV = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the yield on a security that pays periodic interest.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The settlement date of the Treasury bill, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg2 - The maturity date of the Treasury bill, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg3 - The annual coupon rate of the security.
* @param {ApiRange | ApiName | number} arg4 - The purchase price of the security, per $100 par value.
* @param {ApiRange | ApiName | number} arg5 - The redemption value of the security, per $100 par value.
* @param {ApiRange | ApiName | number} arg6 - The number of interest payments per year. The possible values are: 1 for annual payments, 2 for semiannual payments, 4 for quarterly payments.
* @param {ApiRange | ApiName | number} [arg7] - The day count basis to use: <b>0</b> or omitted - US (NASD) 30/360; <b>1</b> - Actual/actual; <b>2</b> - Actual/360; <b>3</b> - Actual/365; <b>4</b> - European 30/360.
* @returns {number}
*/
ApiWorksheetFunction.prototype.YIELD = function(arg1, arg2, arg3, arg4, arg5, arg6, arg7) { return 0; };

/**
* Returns the annual yield for a discounted security. For example, a Treasury bill.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The settlement date of the Treasury bill, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg2 - The maturity date of the Treasury bill, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg3 - The purchase price of the security, per $100 par value.
* @param {ApiRange | ApiName | number} arg4 - The redemption value of the security, per $100 par value.
* @param {ApiRange | ApiName | number} [arg5] - The day count basis to use: <b>0</b> or omitted - US (NASD) 30/360; <b>1</b> - Actual/actual; <b>2</b> - Actual/360; <b>3</b> - Actual/365; <b>4</b> - European 30/360.
* @returns {number}
*/
ApiWorksheetFunction.prototype.YIELDDISC = function(arg1, arg2, arg3, arg4, arg5) { return 0; };

/**
* Returns the annual yield of a security that pays interest at maturity.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The settlement date of the Treasury bill, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg2 - The maturity date of the Treasury bill, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg3 - The issue date of the security, expressed as a serial date number.
* @param {ApiRange | ApiName | number} arg4 - The interest rate of the security at the issue date.
* @param {ApiRange | ApiName | number} arg5 - The purchase price of the security, per $100 par value.
* @param {ApiRange | ApiName | number} [arg6] - The day count basis to use: <b>0</b> or omitted - US (NASD) 30/360; <b>1</b> - Actual/actual; <b>2</b> - Actual/360; <b>3</b> - Actual/365; <b>4</b> - European 30/360.
* @returns {number}
*/
ApiWorksheetFunction.prototype.YIELDMAT = function(arg1, arg2, arg3, arg4, arg5, arg6) { return 0; };

/**
* Returns the absolute value of a number, a number without its sign.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The real number for which the absolute value will be returned.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ABS = function(arg1) { return 0; };

/**
* Returns the arccosine of a number, in radians in the range from 0 to Pi. The arccosine is the angle whose cosine is a number specified in the parameters.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The angle cosine. It must be from -1 to 1.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ACOS = function(arg1) { return 0; };

/**
* Returns the inverse hyperbolic cosine of a number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - Any real number equal to or greater than 1.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ACOSH = function(arg1) { return 0; };

/**
* Returns the arccotangent of a number, in radians in the range from 0 to Pi.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The angle cotangent.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ACOT = function(arg1) { return 0; };

/**
* Returns the inverse hyperbolic cotangent of a number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The angle hyperbolic cotangent. It must be less than -1 or greater than 1.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ACOTH = function(arg1) { return 0; };

/**
* Returns an aggregate in a list or database.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A numeric value that specifies which function to use: <b>1</b> - AVERAGE, <b>2</b> - COUNT, <b>3</b> - COUNTA, <b>4</b> - MAX, <b>5</b> - MIN,
* <b>6</b> - PRODUCT, <b>7</b> - STDEV.S, <b>8</b> - STDEV.P, <b>9</b> - SUM, <b>10</b> - VAR.S, <b>11</b> - VAR.P, <b>12</b> - MEDIAN, <b>13</b> - MODE.SNGL, <b>14</b> - LARGE,
* <b>15</b> - SMALL, <b>16</b> - PERCENTILE.INC, <b>17</b> - QUARTILE.INC, <b>18</b> - PERCENTILE.EXC, <b>19</b> - QUARTILE.EXC.
* @param {ApiRange | ApiName | number} arg2 - A numeric value that specifies which values should be ignored: <b>0</b> or omitted - nested SUBTOTAL and AGGREGATE functions,
* <b>1</b> - hidden rows, nested SUBTOTAL and AGGREGATE functions, <b>2</b> - error values, nested SUBTOTAL and AGGREGATE functions,
* <b>3</b> - hidden rows, error values, nested SUBTOTAL and AGGREGATE functions, <b>4</b> - nothing, <b>5</b> - hidden rows, <b>6</b> - error values, <b>7</b> - hidden rows and error values.
* @param {number | ApiRange | number[]} arg3 - The first numeric value for which the aggregate value will be returned.
* @param {number | ApiRange | number[]} args - Up to 253 numeric values or a range of cells containing the values for which the aggregate value will be returned.
* Arguments can be numbers, ranges, or arrays of numbers.
* @returns {number}
*/
ApiWorksheetFunction.prototype.AGGREGATE = function(arg1, arg2, arg3, args) { return 0; };

/**
* Converts a Roman numeral to Arabic.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The Roman numeral to convert.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ARABIC = function(arg1) { return 0; };

/**
* Returns the arcsine of a number in radians, in the range from *-Pi/2* to *Pi/2*.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The angle sine. It must be from -1 to 1.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ASIN = function(arg1) { return 0; };

/**
* Returns the inverse hyperbolic sine of a number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - Any real number equal to or greater than 1.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ASINH = function(arg1) { return 0; };

/**
* Returns the arctangent of a number in radians, in the range from *-Pi/2* to *Pi/2*.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The angle tangent.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ATAN = function(arg1) { return 0; };

/**
* Returns the arctangent of the specified x and y coordinates, in radians between -Pi and Pi, excluding -Pi.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The x coordinate of the point.
* @param {ApiRange | ApiName | number} arg2 - The y coordinate of the point.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ATAN2 = function(arg1, arg2) { return 0; };

/**
* Returns the inverse hyperbolic tangent of a number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - Any real number between -1 and 1 excluding -1 and 1.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ATANH = function(arg1) { return 0; };

/**
* Converts a number into a text representation with the given radix (base).
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The number to convert.
* @param {ApiRange | ApiName | number} arg2 - The base radix into which the number will be converted. An integer greater than or equal to 2 and less than or equal to 36.
* @param {ApiRange | ApiName | number} [arg3] - The minimum length of the returned string. An integer greater than or equal to 0 and less than 256. If omitted, leading zeros are not added to the result.
* @returns {number}
*/
ApiWorksheetFunction.prototype.BASE = function(arg1, arg2, arg3) { return 0; };

/**
* Rounds a number up, to the nearest multiple of significance.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value to round up.
* @param {ApiRange | ApiName | number} arg2 - The multiple of significance to round up to.
* @returns {number}
*/
ApiWorksheetFunction.prototype.CEILING = function(arg1, arg2) { return 0; };

/**
* Rounds a number up, to the nearest integer or to the nearest multiple of significance.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value to round up.
* @param {ApiRange | ApiName | number} [arg2] - The multiple of significance to round up to. If it is omitted, the default value of 1 is used.
* @param {ApiRange | ApiName | number} [arg3] - Specifies if negative numbers are rounded towards or away from zero. If it is omitted or set to 0, negative numbers are rounded towards zero.
* If any other numeric value is specified, negative numbers are rounded away from zero.
* @returns {number}
*/
ApiWorksheetFunction.prototype.CEILING_MATH = function(arg1, arg2, arg3) { return 0; };

/**
* Returns a number that is rounded up to the nearest integer or to the nearest multiple of significance. The number is always rounded up regardless of its sing.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value to round up.
* @param {ApiRange | ApiName | number} [arg2] - The multiple of significance to round up to. If it is omitted, the default value of 1 is used. If it is set to zero, the function returns 0.
* @returns {number}
*/
ApiWorksheetFunction.prototype.CEILING_PRECISE = function(arg1, arg2) { return 0; };

/**
* Returns the number of combinations for a given number of items.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The total number of items, a numeric value greater than or equal to 0.
* @param {ApiRange | ApiName | number} arg2 - The number of items in each combination, a numeric value greater than or equal to 0 but less than the total number of items.
* @returns {number}
*/
ApiWorksheetFunction.prototype.COMBIN = function(arg1, arg2) { return 0; };

/**
* Returns the number of combinations with repetitions for a given number of items.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The total number of items, a numeric value greater than or equal to 0.
* @param {ApiRange | ApiName | number} arg2 - The number of items in each combination, a numeric value greater than or equal to 0 but less than the total number of items.
* @returns {number}
*/
ApiWorksheetFunction.prototype.COMBINA = function(arg1, arg2) { return 0; };

/**
* Returns the cosine of an angle.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The angle in radians for which the cosine will be returned.
* @returns {number}
*/
ApiWorksheetFunction.prototype.COS = function(arg1) { return 0; };

/**
* Returns the hyperbolic cosine of a number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - Any real number for which the hyperbolic cosine will be returned.
* @returns {number}
*/
ApiWorksheetFunction.prototype.COSH = function(arg1) { return 0; };

/**
* Returns the cotangent of an angle.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The angle in radians for which the cotangent will be returned.
* @returns {number}
*/
ApiWorksheetFunction.prototype.COT = function(arg1) { return 0; };

/**
* Returns the hyperbolic cotangent of a number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The angle in radians for which the hyperbolic cotangent will be calculated. Its absolute value must be less than *2^27*.
* @returns {number}
*/
ApiWorksheetFunction.prototype.COTH = function(arg1) { return 0; };

/**
* Returns the cosecant of an angle.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The angle in radians for which the cosecant will be returned.
* @returns {number}
*/
ApiWorksheetFunction.prototype.CSC = function(arg1) { return 0; };

/**
* Returns the hyperbolic cosecant of an angle.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The angle in radians for which the hyperbolic cosecant will be calculated. Its absolute value must be less than *2^27*.
* @returns {number}
*/
ApiWorksheetFunction.prototype.CSCH = function(arg1) { return 0; };

/**
* Converts a text representation of a number in a given base into a decimal number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string} arg1 - The number to convert. The string lenght must be less than or equal to 255 characters.
* @param {ApiRange | ApiName | number} arg2 - The base Radix of the number that is converting. An integer greater than or equal to 2 and less than or equal to 36.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DECIMAL = function(arg1, arg2) { return 0; };

/**
* Converts radians to degrees.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The angle in radians to convert.
* @returns {number}
*/
ApiWorksheetFunction.prototype.DEGREES = function(arg1) { return 0; };

/**
* Rounds the number up to the nearest multiple of significance. Negative numbers are rounded towards zero.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value to round up.
* @param {ApiRange | ApiName | number} arg2 - The multiple of significance to round up to.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ECMA_CEILING = function(arg1, arg2) { return 0; };

/**
* Rounds a positive number up and negative number down to the nearest even integer.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value to round up.
* @returns {number}
*/
ApiWorksheetFunction.prototype.EVEN = function(arg1) { return 0; };

/**
* Returns the <b>e</b> constant raised to the power of a given number. The <b>e</b> constant is equal to <b>2.71828182845904</b>, the base of the natural logarithm.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The exponent applied to the base <b>e</b>.
* @returns {number}
*/
ApiWorksheetFunction.prototype.EXP = function(arg1) { return 0; };

/**
* Returns the factorial of a number, which is equal to *1*2*3*...** number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The nonnegative number for which the factorial will be calculated.
* @returns {number}
*/
ApiWorksheetFunction.prototype.FACT = function(arg1) { return 0; };

/**
* Returns the double factorial of a number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value for which to return the double factorial.
* @returns {number}
*/
ApiWorksheetFunction.prototype.FACTDOUBLE = function(arg1) { return 0; };

/**
* Rounds a number down to the nearest multiple of significance.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The numeric value to round down.
* @param {ApiRange | ApiName | number} arg2 - The multiple of significance to round down to. The number to round down and the multiple of significance must have the same sign.
* @returns {number}
*/
ApiWorksheetFunction.prototype.FLOOR = function(arg1, arg2) { return 0; };

/**
* Returns a number that is rounded down to the nearest integer or to the nearest multiple of significance. The number is always rounded down regardless of its sign.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The numeric value to round down.
* @param {ApiRange | ApiName | number} [arg2] - The multiple of significance to round down to. If it is omitted, the default value of 1 is used. If it is set to zero, the function returns 0.
* @returns {number}
*/
ApiWorksheetFunction.prototype.FLOOR_PRECISE = function(arg1, arg2) { return 0; };

/**
* Rounds a number down, to the nearest integer or to the nearest multiple of significance.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The numeric value to round down.
* @param {ApiRange | ApiName | number} [arg2] - The multiple of significance to round down to. If it is omitted, the default value of 1 is used.
* @param {ApiRange | ApiName | number} [arg3] - Specifies if negative numbers are rounded towards or away from zero. If it is omitted or set to 0, negative numbers are rounded away from zero.
* If any other numeric value is specified, negative numbers are rounded towards zero.
* @returns {number}
*/
ApiWorksheetFunction.prototype.FLOOR_MATH = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the greatest common divisor.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} args - Up to 255 numeric values for which the greatest common divisor will be returned. The first argument is required, subsequent arguments are optional.
* @returns {number}
*/
ApiWorksheetFunction.prototype.GCD = function(args) { return 0; };

/**
* Rounds a number down to the nearest integer.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The real number to round down to an integer.
* @returns {number}
*/
ApiWorksheetFunction.prototype.INT = function(arg1) { return 0; };

/**
* Returns a number that is rounded up to the nearest integer or to the nearest multiple of significance regardless of the sign of the number.
* The number is always rounded up regardless of its sing.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The numeric value to round up.
* @param {ApiRange | ApiName | number} [arg2] - The multiple of significance to round up to. If it is omitted, the default value of 1 is used. If it is set to zero, the function returns 0.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ISO_CEILING = function(arg1, arg2) { return 0; };

/**
* Returns the least common multiple.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} args - Up to 255 numeric values for which the least common multiple will be returned. The first argument is required, subsequent arguments are optional.
* @returns {number}
*/
ApiWorksheetFunction.prototype.LCM = function(args) { return 0; };

/**
* Returns the natural logarithm of a number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The positive real number for which the natural logarithm will be returned.
* @returns {number}
*/
ApiWorksheetFunction.prototype.LN = function(arg1) { return 0; };

/**
* Returns the logarithm of a number to the specified base.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The positive real number for which the logarithm will be returned.
* @param {ApiRange | ApiName | number} [arg2] - The logarithm base. If omitted, it is equal to 10.
* @returns {number}
*/
ApiWorksheetFunction.prototype.LOG = function(arg1, arg2) { return 0; };

/**
* Returns the base-10 logarithm of a number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The positive real number for which the base-10 logarithm will be returned.
* @returns {number}
*/
ApiWorksheetFunction.prototype.LOG10 = function(arg1) { return 0; };

/**
* Returns the remainder after a number is divided by a divisor.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The number to divide and find the remainder.
* @param {ApiRange | ApiName | number} arg2 - The number to divide by.
* @returns {number}
*/
ApiWorksheetFunction.prototype.MOD = function(arg1, arg2) { return 0; };

/**
* Returns a number rounded to the desired multiple.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value to round.
* @param {ApiRange | ApiName | number} arg2 - The multiple to round the number to.
* @returns {number}
*/
ApiWorksheetFunction.prototype.MROUND = function(arg1, arg2) { return 0; };

/**
* Returns the ratio of the factorial of a sum of numbers to the product of factorials.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} args - Up to 255 numeric values for which the multinomial will be returned. The first argument is required, subsequent arguments are optional.
* @returns {number}
*/
ApiWorksheetFunction.prototype.MULTINOMIAL = function(args) { return 0; };

/**
* Returns the unit matrix for the specified dimension.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - An integer specifying the dimension of the unit matrix to be returned.
* @returns {number}
*/
ApiWorksheetFunction.prototype.MUNIT = function(arg1) { return 0; };

/**
* Rounds a positive number up and negative number down to the nearest odd integer.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value to round.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ODD = function(arg1) { return 0; };

/**
* Returns the mathematical constant <b>pi</b>, equal to <b>3.14159265358979</b>, accurate to 15 digits.
* @memberof ApiWorksheetFunction
* @returns {number}
*/
ApiWorksheetFunction.prototype.PI = function() { return 0; };

/**
* Returns the result of a number raised to a power.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The base number. It can be any real number.
* @param {ApiRange | ApiName | number} arg2 - The exponent to which the base number is raised.
* @returns {number}
*/
ApiWorksheetFunction.prototype.POWER = function(arg1, arg2) { return 0; };

/**
* Multiplies all the numbers given as arguments.
* @memberof ApiWorksheetFunction
* @param {number | ApiRange | number[]} args - Up to 255 numeric values that will be multiplied. The first argument is required, subsequent arguments are optional.
* Arguments can be numbers, ranges, or arrays of numbers.
* @returns {number}
*/
ApiWorksheetFunction.prototype.PRODUCT = function(args) { return 0; };

/**
* Returns the integer portion of a division.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The dividend, a numeric value.
* @param {ApiRange | ApiName | number} arg2 - The divisor, a numeric value.
* @returns {number}
*/
ApiWorksheetFunction.prototype.QUOTIENT = function(arg1, arg2) { return 0; };

/**
* Converts degrees to radians.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - An angle in degrees to convert.
* @returns {number}
*/
ApiWorksheetFunction.prototype.RADIANS = function(arg1) { return 0; };

/**
* Returns a random number greater than or equal to 0 and less than 1, evenly distributed (changes on recalculation).
* @memberof ApiWorksheetFunction
* @returns {number}
*/
ApiWorksheetFunction.prototype.RAND = function() { return 0; };

/**
* Returns a random number between the numbers specified.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The smallest integer value.
* @param {ApiRange | ApiName | number} arg2 - The largest integer value.
* @returns {number}
*/
ApiWorksheetFunction.prototype.RANDBETWEEN = function(arg1, arg2) { return 0; };

/**
* Converts an arabic numeral to a roman numeral in the string format.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A numeric value greater than or equal to 1 and less than 3999.
* @param {ApiRange | ApiName | number} [arg2] - A roman numeral type: <b>0</b> - classic, <b>1</b> - more concise, <b>2</b> - more concise, <b>3</b> - more concise, <b>4</b> - simplified.
* @returns {string}
*/
ApiWorksheetFunction.prototype.ROMAN = function(arg1, arg2) { return ""; };

/**
* Rounds a number to a specified number of digits.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The number to round.
* @param {ApiRange | ApiName | number} arg2 - The number of digits to round to. If this argument is negative, the number will be rounded to the left of the decimal point.
* If it is equal to zero, the number will be rounded to the nearest integer.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ROUND = function(arg1, arg2) { return 0; };

/**
* Rounds a number down, toward zero.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - Any real number that will be rounded down.
* @param {ApiRange | ApiName | number} arg2 - The number of digits to round to. If this argument is negative, the number will be rounded to the left of the decimal point.
* If it is equal to zero, the number will be rounded to the nearest integer.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ROUNDDOWN = function(arg1, arg2) { return 0; };

/**
* Rounds a number up, away from zero.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - Any real number that will be rounded up.
* @param {ApiRange | ApiName | number} arg2 - The number of digits to round to. If this argument is negative, the number will be rounded to the left of the decimal point.
* If it is equal to zero, the number will be rounded to the nearest integer.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ROUNDUP = function(arg1, arg2) { return 0; };

/**
* Returns the secant of an angle.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The angle in radians for which the secant will be returned.
* @returns {number}
*/
ApiWorksheetFunction.prototype.SEC = function(arg1) { return 0; };

/**
* Returns the hyperbolic secant of an angle.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The angle in radians for which the hyperbolic secant will be returned.
* @returns {number}
*/
ApiWorksheetFunction.prototype.SECH = function(arg1) { return 0; };

/**
* Returns the sum of a power series based on the formula.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The input value to the power series.
* @param {ApiRange | ApiName | number} arg2 - The initial power to which x will be raised.
* @param {ApiRange | ApiName | number} arg3 - The step by which to increase n for each term in the series.
* @param {ApiRange | ApiName | number} arg4 - A set of coefficients by which each successive power of x is multiplied.
* @returns {number}
*/
ApiWorksheetFunction.prototype.SERIESSUM = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns the sign of a number: <b>1</b> if the number is positive, <b>0</b> if the number is zero, or <b>-1</b> if the number is negative.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - Any real number.
* @returns {number}
*/
ApiWorksheetFunction.prototype.SIGN = function(arg1) { return 0; };

/**
* Returns the sine of an angle.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The angle in radians for which the sine will be returned. If your argument is in degrees, multiply it by *PI()/180*.
* @returns {number}
*/
ApiWorksheetFunction.prototype.SIN = function(arg1) { return 0; };

/**
* Returns the hyperbolic sine of a number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - Any real number for which the hyperbolic sine will be returned.
* @returns {number}
*/
ApiWorksheetFunction.prototype.SINH = function(arg1) { return 0; };

/**
* Returns the square root of a number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The number for which the square root will be returned.
* @returns {number}
*/
ApiWorksheetFunction.prototype.SQRT = function(arg1) { return 0; };

/**
* Returns the square root of (number * pi).
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The number by which pi is multiplied.
* @returns {number}
*/
ApiWorksheetFunction.prototype.SQRTPI = function(arg1) { return 0; };

/**
* Returns a subtotal in a list or database.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - A numeric value that specifies which function to use for the subtotal: <b>1 (101)</b> - AVERAGE, <b>2 (102)</b> - COUNT,
* <b>3 (103)</b> - COUNTA, <b>4 (104)</b> - MAX, <b>5 (105)</b> - MIN,
* <b>6 (106)</b> - PRODUCT, <b>7 (107)</b> - STDEV, <b>8 (108)</b> - STDEVP, <b>9 (109)</b> - SUM, <b>10 (110)</b> - VAR, <b>11 (111)</b> - VARP.
* 1-11 includes manually-hidden rows, while 101-111 excludes them;
* filtered-out cells are always excluded.
* @param {ApiRange | ApiName} args - Up to 255 ranges containing the values for which the subtotal will be returned. The first argument is required, subsequent arguments are optional.
* @returns {number}
*/
ApiWorksheetFunction.prototype.SUBTOTAL = function(arg1, args) { return 0; };

/**
* Adds all the numbers in a range of cells.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | string | number | boolean | Array<string | number | boolean>} args - Up to 255 numeric values to add. The first argument is required, subsequent arguments are optional.
* Arguments can be numbers, logical values, text representations of numbers, ranges, or arrays.
* @returns {number}
*/
ApiWorksheetFunction.prototype.SUM = function(args) { return 0; };

/**
* Adds the cells specified by a given condition or criteria.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName} arg1 - The range of cells to be evaluated.
* @param {ApiRange | ApiName | number | string} arg2 - The condition or criteria in the form of a number, expression, or text that defines which cells will be added.
* @param {ApiRange | ApiName} [arg3] - The range to sum. If omitted, the cells in range are used.
* @returns {number}
*/
ApiWorksheetFunction.prototype.SUMIF = function(arg1, arg2, arg3) { return 0; };

/**
* Adds the cells specified by a given set of conditions or criteria.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName} arg1 - The range of cells to be evaluated.
* @param {ApiRange | ApiName | number | string} arg2 - The first condition or criteria in the form of a number, expression, or text that defines which cells will be added.
* @param {ApiRange | ApiName} [arg3] - The first range to sum. If omitted, the cells in range are used.
* @param {ApiRange | ApiName | number | string} arg4 - Up to 127 additional conditions or criteria in the form of a number, expression, or text that defines which cells will be added.
* These arguments are optional.
* @param {ApiRange | ApiName} [arg5] - Up to 127 actual ranges to be used to be added. If omitted, the cells in the range are used. These arguments are optional.
* @returns {number}
*/
ApiWorksheetFunction.prototype.SUMIFS = function(arg1, arg2, arg3, arg4, arg5) { return 0; };

/**
* Returns the sum of the squares of the arguments.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number | string | boolean | Array<number | string | boolean>} args - Up to 255 numeric values for which the sum of the squares will be calculated.
* The first argument is required, subsequent arguments are optional.
* The arguments can be numbers, names, logical values or text representations of numbers, ranges of cells that contain numbers, or arrays.
* @returns {number}
*/
ApiWorksheetFunction.prototype.SUMSQ = function(args) { return 0; };

/**
* Returns the tangent of an angle.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The angle in radians for which the tangent will be returned. If the argument is in degrees, multiply it by *PI()/180*.
* @returns {number}
*/
ApiWorksheetFunction.prototype.TAN = function(arg1) { return 0; };

/**
* Returns the hyperbolic tangent of a number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - Any real number for which the hyperbolic tangent will be returned.
* @returns {number}
*/
ApiWorksheetFunction.prototype.TANH = function(arg1) { return 0; };

/**
* Truncates a number to an integer by removing the decimal, or fractional, part of the number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The number which will be truncated.
* @param {ApiRange | ApiName | number} [arg2] - A number specifying the precision of the truncation. If this argument is omitted, it is equal to 0 (zero).
* @returns {number}
*/
ApiWorksheetFunction.prototype.TRUNC = function(arg1, arg2) { return 0; };

/**
* Chooses a value or action to perform from a list of values, based on an index number.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The position of the value in the list of values, a numeric value greater than or equal to 1 but less than the number of values in the list of values.
* @param {number | string | ApiRange | ApiName} args - Up to 254 values or the selected range of cells to analyze.
* The first argument is required, subsequent arguments are optional. Arguments can be numbers, ranges, names, or text strings.
* @returns {number}
*/
ApiWorksheetFunction.prototype.CHOOSE = function(arg1, args) { return 0; };

/**
* Returns the number of columns in the cell range.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number[]} arg1 - A range or array of cells for which the number of columns will be returned.
* @returns {number}
*/
ApiWorksheetFunction.prototype.COLUMNS = function(arg1) { return 0; };

/**
* Looks for a value in the top row of a table or array of values and returns the value in the same column from the specified row.
* @memberof ApiWorksheetFunction
* @param {number | string | ApiRange | ApiName} arg1 - The value to be found in the first row of the table and can be a value, a reference, or a text string.
* @param {ApiRange | ApiName} arg2 - A table of text, numbers, or logical values in which data is looked up. The data is sorted in ascending order.
* This argument can be a range of cells or a range name.
* @param {ApiRange | ApiName | number} arg3 - The row number in data table from which the matching value should be returned. The first row of values in the table is row 1.
* @param {ApiRange | ApiName | boolean} [arg4] - A logical value which specifies whether to find the closest match in the top row (sorted in ascending order) (<b>true</b> or omitted)
* or find an exact match (<b>false</b>).
* @returns {number | string}
*/
ApiWorksheetFunction.prototype.HLOOKUP = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Creates a shortcut that jumps to another location in the current workbook, or opens a document stored on your hard drive, a network server, or on the Internet.
* @memberof ApiWorksheetFunction
* @param {string | ApiRange | ApiName} arg1 - The text giving the path and file name to the document to be opened, a hard drive location, UNC address, or URL path.
* @param {string | ApiRange | number | ApiName} [arg2] - Text or a number that is displayed in the cell. If omitted, the cell displays the link location text.
* @returns {string}
*/
ApiWorksheetFunction.prototype.HYPERLINK = function(arg1, arg2) { return ""; };

/**
* Returns a value or reference of the cell at the intersection of a particular row and column, in a given range.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number[]} arg1 - A range of cells or an array constant.
* @param {ApiRange | ApiName | number} arg2 - The row in the range from which to return a value. If omitted, the column number is required.
* @param {ApiRange | ApiName | number} [arg3] - The column in the range from which to return a value. If omitted, the row number is required.
* @param {ApiRange | ApiName | number} [arg4] - An area to use in case the range contains several ranges. If it is omitted, the function will assume argument to be 1.
* @returns {number | string}
*/
ApiWorksheetFunction.prototype.INDEX = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Looks up a value either from a one-row or one-column range. Provided for backwards compatibility.
* @memberof ApiWorksheetFunction
* @param {number | string | boolean | ApiRange | ApiName} arg1 - A value that is searched for in the first vector. It can be a number, text, a logical value, or a name or reference to a value.
* @param {ApiRange | ApiName} arg2 - A range that contains only one row or one column of text, numbers, or logical values, placed in ascending order.
* @param {ApiRange | ApiName} [arg3] - A range that contains only one row or column. It must be the same size as the first vector.
* @returns {number | string | boolean}
*/
ApiWorksheetFunction.prototype.LOOKUP = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the relative position of an item in a range that matches the specified value in the specified order.
* @memberof ApiWorksheetFunction
* @param {number | string | boolean | ApiRange | ApiName} arg1 - The value to be matched in the range. It can be a number, text, or logical value, or a reference to one of these.
* @param {ApiRange | ApiName | Array<number | string | boolean>} arg2 - A contiguous range of cells or an array containing possible lookup values.
* @param {ApiRange | ApiName | number} [arg3] - A number 1, 0, or -1 indicating which value to return.
* @returns {number}
*/
ApiWorksheetFunction.prototype.MATCH = function(arg1, arg2, arg3) { return 0; };

/**
* Returns the number of rows in a range.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | Array<number | string | boolean>} arg1 - A range of cells or an array for which the number of rows will be returned.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ROWS = function(arg1) { return 0; };

/**
* Converts a vertical range of cells to a horizontal range, or vice versa.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | Array<number | string | boolean>} arg1 - A range of cells on a worksheet or an array that will be transposed.
* @returns {ApiRange}
*/
ApiWorksheetFunction.prototype.TRANSPOSE = function(arg1) { return new ApiRange(); };

/**
* Looks for a value in the leftmost column of a table and then returns a value in the same row from the specified column. By default, the table must be sorted in an ascending order.
* @memberof ApiWorksheetFunction
* @param {number | string | ApiRange | ApiName} arg1 - The value to be found in the first column of the table. It can be a value, a reference, or a text string.
* @param {ApiRange | ApiName} arg2 - A table of text, numbers, or logical values, in which data is retrieved. It can be a range of cells.
* @param {ApiRange | ApiName | number} arg3 - The column number in the data table from which the matching value should be returned. The first column of values in the table is column 1.
* @param {ApiRange | ApiName | boolean} [arg4] - A logical value that specifies whether to find the closest match in the first column (sorted in ascending order) (<b>true</b> or omitted)
* or find an exact match (<b>false</b>).
* @returns {number | string}
*/
ApiWorksheetFunction.prototype.VLOOKUP = function(arg1, arg2, arg3, arg4) { return 0; };

/**
* Returns a number matching an error value.
* @memberof ApiWorksheetFunction
* @param {ErrorValue | ApiRange | ApiName} arg1 - The error value for which the identifying number will be returned. It can be an actual error value or a reference to a cell containing an error value.
* @returns {number}
*/
ApiWorksheetFunction.prototype.ERROR_TYPE = function(arg1) { return 0; };

/**
* Checks whether a value is an error other than *#N/A*, and returns <b>true</b> or <b>false</b>.
* @memberof ApiWorksheetFunction
* @param {number | string | boolean | ApiRange | ApiName} arg1 - The value to test.
* The value can be an empty cell, error, logical value, text, number, range, or range name.
* @returns {boolean}
*/
ApiWorksheetFunction.prototype.ISERR = function(arg1) { return true; };

/**
* Checks whether a value is an error, and returns <b>true</b> or <b>false</b>.
* @memberof ApiWorksheetFunction
* @param {number | string | boolean | ApiRange | ApiName} arg1 - The value to test.
* The value can be an empty cell, error, logical value, text, number, range, or range name.
* @returns {boolean}
*/
ApiWorksheetFunction.prototype.ISERROR = function(arg1) { return true; };

/**
* Returns <b>true</b> if a number is even.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value to test.
* @returns {boolean}
*/
ApiWorksheetFunction.prototype.ISEVEN = function(arg1) { return true; };

/**
* Checks whether a reference to a cell contains a formula, and returns <b>true</b> or <b>false</b>.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName} arg1 - A cell range to test. This argument can be a range or a range name.
* @returns {boolean}
*/
ApiWorksheetFunction.prototype.ISFORMULA = function(arg1) { return true; };

/**
* Checks whether a value is a logical value (<b>true</b> or <b>false</b>), and returns <b>true</b> or <b>false</b>.
* @memberof ApiWorksheetFunction
* @param {ApiRange | string | number | boolean | ApiName} arg1 - The value to test.
* The value can be an empty cell, error, logical value, text, number, range, or range name.
* @returns {boolean}
*/
ApiWorksheetFunction.prototype.ISLOGICAL = function(arg1) { return true; };

/**
* Checks whether a value is *#N/A*, and returns <b>true</b> or <b>false</b>.
* @memberof ApiWorksheetFunction
* @param {ApiRange | string | number | boolean | ApiName} arg1 - The value to test.
* The value can be an empty cell, error, logical value, text, number, range, or range name.
* @returns {boolean}
*/
ApiWorksheetFunction.prototype.ISNA = function(arg1) { return true; };

/**
* Checks whether a value is not text (blank cells are not text), and returns <b>true</b> or <b>false</b>.
* @memberof ApiWorksheetFunction
* @param {ApiRange | string | number | boolean | ApiName} arg1 - The value to test.
* The value can be an empty cell, error, logical value, text, number, range, or range name.
* @returns {boolean}
*/
ApiWorksheetFunction.prototype.ISNONTEXT = function(arg1) { return true; };

/**
* Checks whether a value is a number, and returns <b>true</b> or <b>false</b>.
* @memberof ApiWorksheetFunction
* @param {ApiRange | string | number | boolean | ApiName} arg1 - The value to test.
* The value can be an empty cell, error, logical value, text, number, range, or range name.
* @returns {boolean}
*/
ApiWorksheetFunction.prototype.ISNUMBER = function(arg1) { return true; };

/**
* Returns <b>true</b> if a number is odd.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number} arg1 - The value to test.
* @returns {boolean}
*/
ApiWorksheetFunction.prototype.ISODD = function(arg1) { return true; };

/**
* Checks whether a value is a reference, and returns <b>true</b> or <b>false</b>.
* @memberof ApiWorksheetFunction
* @param {ApiRange | string | number | boolean | ApiName} arg1 - The value to test.
* The value can be an empty cell, error, logical value, text, number, range, or range name.
* @returns {boolean}
*/
ApiWorksheetFunction.prototype.ISREF = function(arg1) { return true; };

/**
* Checks whether a value is text, and returns <b>true</b> or <b>false</b>.
* @memberof ApiWorksheetFunction
* @param {ApiRange | string | number | boolean | ApiName} arg1 - The value to test.
* The value can be an empty cell, error, logical value, text, number, range, or range name.
* @returns {boolean}
*/
ApiWorksheetFunction.prototype.ISTEXT = function(arg1) { return true; };

/**
* Converts a value to a number, dates to serial numbers, <b>true</b> to 1, error to {@link global#ErrorValue ErrorValue}, anything else to 0 (zero).
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number | string | boolean} arg1 - The value to be converted. The value can be a logical value, text, or number.
* @returns {number}
*/
ApiWorksheetFunction.prototype.N = function(arg1) { return 0; };

/**
* Returns the *#N/A* error value which means "no value is available".
* @memberof ApiWorksheetFunction
* @returns {string}
*/
ApiWorksheetFunction.prototype.NA = function() { return ""; };

/**
* Returns the sheet number of the reference sheet.
* @memberof ApiWorksheetFunction
* @param {string | ApiRange | ApiName} [arg1] - The name of a sheet or a reference for which the sheet number will be returned. If omitted the number of the sheet containing the function is returned.
* @returns {number}
*/
ApiWorksheetFunction.prototype.SHEET = function(arg1) { return 0; };

/**
* Returns the number of sheets in a reference.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName} [arg1] - A reference for which the number of sheets will be returned. If omitted the number of sheets in the workbook containing the function is returned.
* @returns {number}
*/
ApiWorksheetFunction.prototype.SHEETS = function(arg1) { return 0; };

/**
* Returns an integer representing the data type of a value: number = 1; text = 2; logical value = 4; error value = 16; array = 64; compound data = 128.
* @memberof ApiWorksheetFunction
* @param {number | string | boolean | Array<number | string | boolean> | ApiRange | ApiName} arg1 - A value to test.
* @returns {number}
*/
ApiWorksheetFunction.prototype.TYPE = function(arg1) { return 0; };

/**
* Checks whether all conditions in a test are <b>true</b>.
* @memberof ApiWorksheetFunction
* @param {number | string | ApiRange | boolean | ApiName} args - A condition to check.
* @returns {boolean}
*/
ApiWorksheetFunction.prototype.AND = function(args) { return true; };

/**
* Returns the <b>false</b> logical value.
* @memberof ApiWorksheetFunction
* @returns {boolean}
*/
ApiWorksheetFunction.prototype.FALSE = function() { return true; };

/**
* Checks whether a condition is met, and returns one value if <b>true</b>, and another value if <b>false</b>.
* @memberof ApiWorksheetFunction
* @param {number | string | ApiRange | ApiName | boolean} arg1 - Any value or expression that can be evaluated to <b>true</b> or <b>false</b>.
* @param {number | string | ApiRange | ApiName | boolean} arg2 - The value that is returned if the condition is <b>true</b>. If omitted, <b>true</b> is returned. You can nest up to seven IF functions.
* @param {ApiRange | ApiName | number | string | boolean} [arg3] - The value that is returned if the condition is <b>false</b>. If omitted, <b>false</b> is returned.
* @returns {number | string | boolean}
*/
ApiWorksheetFunction.prototype.IF = function(arg1, arg2, arg3) { return 0; };

/**
* Checks if there is an error in the formula in the first argument. The function returns the result of the formula if there is no error, or the value specified in the second argument if there is one.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number | string | boolean} arg1 - The value, expression, or reference that is checked for an error.
* @param {ApiRange | ApiName | number | string | boolean} arg2 - The value to be returned if the formula evaluates to an error. The following errors are evaluated: <b>#N/A</b>, <b>#VALUE!</b>, <b>#REF!</b>, <b>#DIV/0!</b>, <b>#NUM!</b>, <b>#NAME?</b>, <b>#NULL!</b>.
* @returns {number | string | boolean}
*/
ApiWorksheetFunction.prototype.IFERROR = function(arg1, arg2) { return 0; };

/**
* Checks if there is an error in the formula in the first argument. The function returns the specified value if the formula returns the *#N/A* error value, otherwise returns the result of the formula.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number | string | boolean} arg1 - The value, expression, or reference that is checked for an error.
* @param {ApiRange | ApiName | number | string | boolean} arg2 - The value to return if the formula evaluates to the *#N/A* error value.
* @returns {number | string | boolean}
*/
ApiWorksheetFunction.prototype.IFNA = function(arg1, arg2) { return 0; };

/**
* Checks if the specified logical value is <b>true</b> or <b>false</b>. The function returns <b>true</b> if the argument is <b>false</b> and <b>false</b> if the argument is <b>true</b>.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | number | string | boolean} arg1 - A value or expression that can be evaluated to <b>true</b> or <b>false</b>.
* @returns {boolean}
*/
ApiWorksheetFunction.prototype.NOT = function(arg1) { return true; };

/**
* Checks whether any of the arguments are <b>true</b>. Returns <b>false</b> only if all arguments are <b>false</b>.
* @memberof ApiWorksheetFunction
* @param {number | string | ApiRange | ApiName | boolean} args - A condition to check.
* @returns {boolean}
*/
ApiWorksheetFunction.prototype.OR = function(args) { return true; };

/**
* Returns the <b>true</b> logical value.
* @memberof ApiWorksheetFunction
* @returns {boolean}
*/
ApiWorksheetFunction.prototype.TRUE = function() { return true; };

/**
* Returns the logical <b>Exclusive Or</b> value of all arguments. The function returns <b>true</b> when the number of <b>true</b> inputs is odd and <b>false</b> when the number of <b>true</b> inputs is even.
* @memberof ApiWorksheetFunction
* @param {ApiRange | ApiName | boolean | boolean[]} args - The conditions to check.
* @returns {boolean}
*/
ApiWorksheetFunction.prototype.XOR = function(args) { return true; };

/**
* Saves changes to the specified document.
*
* @memberof ApiWorkbook
* @since 9.1.0
*/
ApiWorkbook.prototype.Save = function() {};

/**
* Returns a sheet collection that represents all the sheets in the workbook.
*
* @memberof ApiWorkbook
* @returns {ApiWorksheet[]}
* @since 9.1.0
*/
ApiWorkbook.prototype.GetSheets = function() { return []; };

/**
* Returns all pivot tables in the workbook.
*
* @memberof ApiWorkbook
* @returns {ApiPivotTable[]}
* @since 9.1.0
*/
ApiWorkbook.prototype.GetAllPivotTables = function() { return []; };

/**
* Returns the custom properties of the workbook.
*
* @memberof ApiWorkbook
* @returns {ApiCustomProperties}
* @since 9.1.0
*/
ApiWorkbook.prototype.GetCustomProperties = function() { return new ApiCustomProperties(); };

/**
* Returns the theme of the workbook.
*
* @memberof ApiWorkbook
* @returns {ApiTheme}
* @since 9.1.0
*/
ApiWorkbook.prototype.GetTheme = function() { return new ApiTheme(); };

/**
* Returns the name of the workbook.
*
* @memberof ApiWorkbook
* @returns {string}
* @since 9.1.0
*/
ApiWorkbook.prototype.GetName = function() { return ""; };

/**
* Returns the active sheet of the workbook.
*
* @memberof ApiWorkbook
* @returns {ApiWorksheet}
* @since 9.1.0
*/
ApiWorkbook.prototype.GetActiveSheet = function() { return new ApiWorksheet(); };

/**
* Returns the active chart of the workbook.
*
* @memberof ApiWorkbook
* @returns {ApiChart | null}
* @since 9.1.0
*/
ApiWorkbook.prototype.GetActiveChart = function() { return new ApiChart(); };

/**
* Returns drawings with the specified names from the workbook.
* @memberof ApiWorkbook
* @param {string[]} ids - An array of drawing names.
* @returns {Drawing[]} - Returns an array of drawing obkects filtered by the specified names.
* @since 9.3.0
*/
ApiWorkbook.prototype.GetDrawingsByName = function(ids) { return []; };

/**
* Returns the state of sheet visibility.
* @memberof ApiWorksheet
* @returns {boolean}
*/
ApiWorksheet.prototype.GetVisible = function() { return true; };

/**
* Sets the state of sheet visibility.
* @memberof ApiWorksheet
* @param {boolean} isVisible - Specifies if the sheet is visible or not.
* @returns {boolean} - returns true if the visibility state was set successfully.
*/
ApiWorksheet.prototype.SetVisible = function(isVisible) { return true; };

/**
* Makes the current sheet active.
* @memberof ApiWorksheet
* @returns {boolean} - returns true if the sheet was made active successfully.
*/
ApiWorksheet.prototype.SetActive = function() { return true; };

/**
* Returns an object that represents an active cell.
* @memberof ApiWorksheet
* @returns {ApiRange}
*/
ApiWorksheet.prototype.GetActiveCell = function() { return new ApiRange(); };

/**
* Returns an object that represents the selected range.
* @memberof ApiWorksheet
* @returns {ApiRange}
*/
ApiWorksheet.prototype.GetSelection = function() { return new ApiRange(); };

/**
* Returns the ApiRange that represents all the cells on the worksheet (not just the cells that are currently in use).
* @memberof ApiWorksheet
* @param {number} row - The row number or the cell number (if only row is defined).
* @param {number} col - The column number.
* @returns {ApiRange | null}
*/
ApiWorksheet.prototype.GetCells = function(row, col) { return new ApiRange(); };

/**
* Returns the ApiRange object that represents all the cells on the rows range.
* @memberof ApiWorksheet
* @param {string | number} value - Specifies the rows range in the string or number format.
* @returns {ApiRange | null}
*/
ApiWorksheet.prototype.GetRows = function(value) { return new ApiRange(); };

/**
* Returns the instante of ApiAutoFilter object that represents the worksheet AutoFilter.
* @memberof ApiWorksheet
* @returns {ApiAutoFilter}
*/
ApiWorksheet.prototype.GetAutoFilter = function() { return new ApiAutoFilter(); };

/**
* Returns the ApiRange object that represents all the cells on the columns range.
* @memberof ApiWorksheet
* @param {string} sRange - Specifies the columns range in the string format.
* @returns {ApiRange}
*/
ApiWorksheet.prototype.GetCols = function(sRange) { return new ApiRange(); };

/**
* Returns the ApiRange object that represents the used range on the specified worksheet.
* @memberof ApiWorksheet
* @returns {ApiRange}
*/
ApiWorksheet.prototype.GetUsedRange = function() { return new ApiRange(); };

/**
* Returns a sheet name.
* @memberof ApiWorksheet
* @returns {string}
*/
ApiWorksheet.prototype.GetName = function() { return ""; };

/**
* Sets a name to the current active sheet.
* @memberof ApiWorksheet
* @param {string} sName - The name which will be displayed for the current sheet at the sheet tab.
*/
ApiWorksheet.prototype.SetName = function(sName) {};

/**
* Returns a sheet index.
* @memberof ApiWorksheet
* @returns {number}
*/
ApiWorksheet.prototype.GetIndex = function() { return 0; };

/**
* Returns an object that represents the selected range of the current sheet. Can be a single cell - <b>A1</b>, or cells
* from a single row - <b>A1:E1</b>, or cells from a single column - <b>A1:A10</b>, or cells from several rows and columns - <b>A1:E10</b>.
* @memberof ApiWorksheet
* @param {string | ApiRange} Range1 - The range of cells from the current sheet.
* @param {string | ApiRange} Range2 - The range of cells from the current sheet.
* @returns {ApiRange | null} - returns null if such a range does not exist.
*/
ApiWorksheet.prototype.GetRange = function(Range1, Range2) { return new ApiRange(); };

/**
* Returns an object that represents the selected range of the current sheet using the <b>row/column</b> coordinates for the cell selection.
* @memberof ApiWorksheet
* @param {number} nRow - The row number.
* @param {number} nCol - The column number.
* @returns {ApiRange}
*/
ApiWorksheet.prototype.GetRangeByNumber = function(nRow, nCol) { return new ApiRange(); };

/**
* Formats the selected range of cells from the current sheet as a table (with the first row formatted as a header).
* <note>As the first row is always formatted as a table header, you need to select at least two rows for the table to be formed correctly.</note>
* @memberof ApiWorksheet
* @param {string} sRange - The range of cells from the current sheet which will be formatted as a table.
* @returns {boolean} - returns true if the range was formatted as a table successfully.
*/
ApiWorksheet.prototype.FormatAsTable = function(sRange) { return true; };

/**
* Sets the width of the specified column.
* One unit of column width is equal to the width of one character in the Normal style.
* For proportional fonts, the width of the character 0 (zero) is used.
* @memberof ApiWorksheet
* @param {number} nColumn - The number of the column to set the width to.
* @param {number} nWidth - The width of the column divided by 7 pixels.
* @param {boolean} [bWithotPaddings=false] - Specifies whether nWidth will be set without standard paddings.
* @returns {boolean} - returns true if the column width was set successfully.
*/
ApiWorksheet.prototype.SetColumnWidth = function(nColumn, nWidth, bWithotPaddings) { return true; };

/**
* Sets the height of the specified row measured in points.
* A point is 1/72 inch.
* @memberof ApiWorksheet
* @param {number} nRow - The number of the row to set the height to.
* @param {number} nHeight - The height of the row measured in points.
* @returns {boolean} - returns true if the row height was set successfully.
*/
ApiWorksheet.prototype.SetRowHeight = function(nRow, nHeight) { return true; };

/**
* Specifies whether the current sheet gridlines must be displayed or not.
* @memberof ApiWorksheet
* @param {boolean} isDisplayed - Specifies whether the current sheet gridlines must be displayed or not. The default value is <b>true</b>.
* @returns {boolean} - returns true if the display of gridlines was set successfully.
*/
ApiWorksheet.prototype.SetDisplayGridlines = function(isDisplayed) { return true; };

/**
* Specifies whether the current sheet row/column headers must be displayed or not.
* @memberof ApiWorksheet
* @param {boolean} isDisplayed - Specifies whether the current sheet row/column headers must be displayed or not. The default value is <b>true</b>.
* @returns {boolean} - returns true if the display of headings was set successfully.
*/
ApiWorksheet.prototype.SetDisplayHeadings = function(isDisplayed) { return true; };

/**
* Sets the left margin of the sheet.
* @memberof ApiWorksheet
* @param {number} nPoints - The left margin size measured in points.
* @returns {boolean} - returns true if the left margin was set successfully.
*/
ApiWorksheet.prototype.SetLeftMargin = function(nPoints) { return true; };

/**
* Returns the left margin of the sheet.
* @memberof ApiWorksheet
* @returns {number} - The left margin size measured in points.
*/
ApiWorksheet.prototype.GetLeftMargin = function() { return 0; };

/**
* Sets the right margin of the sheet.
* @memberof ApiWorksheet
* @param {number} nPoints - The right margin size measured in points.
* @returns {boolean} - returns true if the right margin was set successfully.
*/
ApiWorksheet.prototype.SetRightMargin = function(nPoints) { return true; };

/**
* Returns the right margin of the sheet.
* @memberof ApiWorksheet
* @returns {number} - The right margin size measured in points.
*/
ApiWorksheet.prototype.GetRightMargin = function() { return 0; };

/**
* Sets the top margin of the sheet.
* @memberof ApiWorksheet
* @param {number} nPoints - The top margin size measured in points.
* @returns {boolean} - returns true if the top margin was set successfully.
*/
ApiWorksheet.prototype.SetTopMargin = function(nPoints) { return true; };

/**
* Returns the top margin of the sheet.
* @memberof ApiWorksheet
* @returns {number} - The top margin size measured in points.
*/
ApiWorksheet.prototype.GetTopMargin = function() { return 0; };

/**
* Sets the bottom margin of the sheet.
* @memberof ApiWorksheet
* @param {number} nPoints - The bottom margin size measured in points.
* @returns {boolean} - returns true if the bottom margin was set successfully.
*/
ApiWorksheet.prototype.SetBottomMargin = function(nPoints) { return true; };

/**
* Returns the bottom margin of the sheet.
* @memberof ApiWorksheet
* @returns {number} - The bottom margin size measured in points.
*/
ApiWorksheet.prototype.GetBottomMargin = function() { return 0; };

/**
* Sets the page orientation.
* @memberof ApiWorksheet
* @param {PageOrientation} sPageOrientation - The page orientation type.
* @returns {boolean} - returns true if the page orientation was set successfully.
*/
ApiWorksheet.prototype.SetPageOrientation = function(sPageOrientation) { return true; };

/**
* Returns the page orientation.
* @memberof ApiWorksheet
* @returns {PageOrientation}
*/
ApiWorksheet.prototype.GetPageOrientation = function() { return new PageOrientation(); };

/**
* Returns the page PrintHeadings property which specifies whether the current sheet row/column headings must be printed or not.
* @memberof ApiWorksheet
* @returns {boolean} - Specifies whether the current sheet row/column headings must be printed or not.
*/
ApiWorksheet.prototype.GetPrintHeadings = function() { return true; };

/**
* Specifies whether the current sheet row/column headers must be printed or not.
* @memberof ApiWorksheet
* @param {boolean} bPrint - Specifies whether the current sheet row/column headers must be printed or not.
* @returns {boolean} - returns true if the print headings option was set successfully.
*/
ApiWorksheet.prototype.SetPrintHeadings = function(bPrint) { return true; };

/**
* Returns the page PrintGridlines property which specifies whether the current sheet gridlines must be printed or not.
* @memberof ApiWorksheet
* @returns {boolean} - True if cell gridlines are printed on this page.
*/
ApiWorksheet.prototype.GetPrintGridlines = function() { return true; };

/**
* Specifies whether the current sheet gridlines must be printed or not.
* @memberof ApiWorksheet
* @param {boolean} bPrint - Defines if cell gridlines are printed on this page or not.
* @returns {boolean} - returns true if the print gridlines option was set successfully.
*/
ApiWorksheet.prototype.SetPrintGridlines = function(bPrint) { return true; };

/**
* Returns an array of ApiName objects.
* @memberof ApiWorksheet
* @returns {ApiName[]} - Returns an empty array if no defined names are found.
*/
ApiWorksheet.prototype.GetDefNames = function() { return []; };

/**
* Returns the ApiName object by the worksheet name.
* @memberof ApiWorksheet
* @param {string} defName - The worksheet name.
* @returns {ApiName | null} - returns null if definition name doesn't exist.
*/
ApiWorksheet.prototype.GetDefName = function(defName) { return new ApiName(); };

/**
* Adds a new name to the current worksheet.
* @memberof ApiWorksheet
* @param {string} sName - The range name.
* @param {string} sRef  - Must contain the sheet name, followed by sign ! and a range of cells.
* Example: "Sheet1!$A$1:$B$2".
* @param {boolean} isHidden - Defines if the range name is hidden or not.
* @returns {boolean} - returns false if sName or sRef are invalid.
*/
ApiWorksheet.prototype.AddDefName = function(sName, sRef, isHidden) { return true; };

/**
* Returns all comments from the current worksheet.
* @memberof ApiWorksheet
* @returns {ApiComment[]}
*/
ApiWorksheet.prototype.GetComments = function() { return []; };

/**
* Deletes the current worksheet.
* @memberof ApiWorksheet
* @returns {boolean} - returns true if the sheet was deleted successfully.
*/
ApiWorksheet.prototype.Delete = function() { return true; };

/**
* Adds a hyperlink to the specified range.
* @memberof ApiWorksheet
* @param {string} sRange - The range where the hyperlink will be added to.
* @param {string} sAddress - The link address.
* @param {string} [subAddress] - The link subaddress to insert internal sheet hyperlinks.
* @param {string} [sScreenTip] - The screen tip text.
* @param {string} [sTextToDisplay] - The link text that will be displayed on the sheet.
* @returns {boolean} - returns true if the hyperlink was set successfully.
*/
ApiWorksheet.prototype.SetHyperlink = function(sRange, sAddress, subAddress, sScreenTip, sTextToDisplay) { return true; };

/**
* Creates a chart of the specified type from the selected data range of the current sheet.
* <note>Please note that the horizontal and vertical offsets are calculated within the limits of the specified column and
* row cells only. If this value exceeds the cell width or height, another vertical/horizontal position will be set.</note>
* :::note
* Values of <em>nStyleIndex</em> outside <b>1 - 48</b> are interpreted as a chart style id from the <em>cs:chartStyle</em> element (e.g. 201, 215, 284) and are available only for [ONLYOFFICE Docs Enterprise](https://www.onlyoffice.com/docs-enterprise-prices.aspx?from=api) and [ONLYOFFICE Docs Developer](https://www.onlyoffice.com/developer-edition-prices.aspx?from=api).
* :::
* @memberof ApiWorksheet
* @param {string} sDataRange - The selected cell range which will be used to get the data for the chart, formed specifically and including the sheet name.
* @param {boolean} bInRows - Specifies whether to take the data from the rows or from the columns. If true, the data from the rows will be used.
* @param {ChartType} sType - The chart type used for the chart display.
* @param {number} nStyleIndex - The chart color style index (can be <b>1 - 48</b>, as described in OOXML specification).
* @param {EMU} nExtX - The chart width in English measure units
* @param {EMU} nExtY - The chart height in English measure units.
* @param {number} nFromCol - The number of the column where the beginning of the chart will be placed.
* @param {EMU} nColOffset - The offset from the nFromCol column to the left part of the chart measured in English measure units.
* @param {number} nFromRow - The number of the row where the beginning of the chart will be placed.
* @param {EMU} nRowOffset - The offset from the nFromRow row to the upper part of the chart measured in English measure units.
* @returns {ApiChart | null}
*/
ApiWorksheet.prototype.AddChart = function(sDataRange, bInRows, sType, nStyleIndex, nExtX, nExtY, nFromCol, nColOffset, nFromRow, nRowOffset) { return new ApiChart(); };

/**
* Adds a shape to the current sheet with the parameters specified.
* <note>Please note that the horizontal and vertical offsets are
* calculated within the limits of the specified column and row cells
* only. If this value exceeds the cell width or height, another vertical/horizontal position will be set.</note>
* @memberof ApiWorksheet
* @param {ShapeType} [sType="rect"] - The shape type which specifies the preset shape geometry.
* @param {EMU} nWidth - The shape width in English measure units.
* @param {EMU} nHeight - The shape height in English measure units.
* @param {ApiFill} oFill - The color or pattern used to fill the shape.
* @param {ApiStroke} oStroke - The stroke used to create the element shadow.
* @param {number} nFromCol - The number of the column where the beginning of the shape will be placed.
* @param {EMU} nColOffset - The offset from the nFromCol column to the left part of the shape measured in English measure units.
* @param {number} nFromRow - The number of the row where the beginning of the shape will be placed.
* @param {EMU} nRowOffset - The offset from the nFromRow row to the upper part of the shape measured in English measure units.
* @returns {ApiShape}
*/
ApiWorksheet.prototype.AddShape = function(sType, nWidth, nHeight, oFill, oStroke, nFromCol, nColOffset, nFromRow, nRowOffset) { return new ApiShape(); };

/**
* Adds an image to the current sheet with the parameters specified.
* @memberof ApiWorksheet
* @param {string} sImageSrc - The image source where the image to be inserted should be taken from (currently only internet URL or Base64 encoded images are supported).
* @param {EMU} nWidth - The image width in English measure units.
* @param {EMU} nHeight - The image height in English measure units.
* @param {number} nFromCol - The number of the column where the beginning of the image will be placed.
* @param {EMU} nColOffset - The offset from the nFromCol column to the left part of the image measured in English measure units.
* @param {number} nFromRow - The number of the row where the beginning of the image will be placed.
* @param {EMU} nRowOffset - The offset from the nFromRow row to the upper part of the image measured in English measure units.
* @returns {ApiImage}
*/
ApiWorksheet.prototype.AddImage = function(sImageSrc, nWidth, nHeight, nFromCol, nColOffset, nFromRow, nRowOffset) { return new ApiImage(); };

/**
* Adds a Text Art object to the current sheet with the parameters specified.
* @memberof ApiWorksheet
* @param {ApiTextPr} [oTextPr=Api.CreateTextPr()] - The text properties.
* @param {string} [sText="Your text here"] - The text for the Text Art object.
* @param {TextTransform} [sTransform="textNoShape"] - Text transform type.
* @param {ApiFill} [oFill=Api.CreateNoFill()] - The color or pattern used to fill the Text Art object.
* @param {ApiStroke} [oStroke=Api.CreateStroke(0, Api.CreateNoFill())] - The stroke used to create the Text Art object shadow.
* @param {number} [nRotAngle=0] - Rotation angle.
* @param {EMU} [nWidth=1828800] - The Text Art width measured in English measure units.
* @param {EMU} [nHeight=1828800] - The Text Art heigth measured in English measure units.
* @param {number} [nFromCol=0] - The column number where the beginning of the Text Art object will be placed.
* @param {number} [nFromRow=0] - The row number where the beginning of the Text Art object will be placed.
* @param {EMU} [nColOffset=0] - The offset from the nFromCol column to the left part of the Text Art object measured in English measure units.
* @param {EMU} [nRowOffset=0] - The offset from the nFromRow row to the upper part of the Text Art object measured in English measure units.
* @returns {ApiDrawing}
*/
ApiWorksheet.prototype.AddWordArt = function(oTextPr, sText, sTransform, oFill, oStroke, nRotAngle, nWidth, nHeight, nFromCol, nFromRow, nColOffset, nRowOffset) { return new ApiDrawing(); };

/**
* Adds an OLE object to the current sheet with the parameters specified.
* @memberof ApiWorksheet
* @param {string} sImageSrc - The image source where the image to be inserted should be taken from (currently, only internet URL or Base64 encoded images are supported).
* @param {EMU} nWidth - The OLE object width in English measure units.
* @param {EMU} nHeight - The OLE object height in English measure units.
* @param {string} sData - The OLE object string data.
* @param {string} sAppId - The application ID associated with the current OLE object.
* @param {number} nFromCol - The number of the column where the beginning of the OLE object will be placed.
* @param {EMU} nColOffset - The offset from the nFromCol column to the left part of the OLE object measured in English measure units.
* @param {number} nFromRow - The number of the row where the beginning of the OLE object will be placed.
* @param {EMU} nRowOffset - The offset from the nFromRow row to the upper part of the OLE object measured in English measure units.
* @returns {ApiOleObject}
*/
ApiWorksheet.prototype.AddOleObject = function(sImageSrc, nWidth, nHeight, sData, sAppId, nFromCol, nColOffset, nFromRow, nRowOffset) { return new ApiOleObject(); };

/**
* Replaces the current image with a new one.
* @memberof ApiWorksheet
* @param {string} sImageUrl - The image source where the image to be inserted should be taken from (currently only internet URL or Base64 encoded images are supported).
* @param {EMU} nWidth - The image width in English measure units.
* @param {EMU} nHeight - The image height in English measure units.
* @returns {boolean} - returns true if the image was replaced successfully.
*/
ApiWorksheet.prototype.ReplaceCurrentImage = function(sImageUrl, nWidth, nHeight) { return true; };

/**
* Returns all drawings from the current sheet.
* @memberof ApiWorksheet
* @returns {Drawing[]}.
*/
ApiWorksheet.prototype.GetAllDrawings = function() { return []; };

/**
* Returns all images from the current sheet.
* @memberof ApiWorksheet
* @returns {ApiImage[]}.
*/
ApiWorksheet.prototype.GetAllImages = function() { return []; };

/**
* Returns all shapes from the current sheet.
* @memberof ApiWorksheet
* @returns {ApiShape[]}.
*/
ApiWorksheet.prototype.GetAllShapes = function() { return []; };

/**
* Returns selected shapes from the current sheet.
* @memberof ApiWorksheet
* @returns {ApiShape[]}.
*/
ApiWorksheet.prototype.GetSelectedShapes = function() { return []; };

/**
* Returns selected drawings from the current sheet.
* @memberof ApiWorksheet
* @returns {Drawing[]}.
*/
ApiWorksheet.prototype.GetSelectedDrawings = function() { return []; };

/**
* Returns all charts from the current sheet.
* @memberof ApiWorksheet
* @returns {ApiChart[]}.
*/
ApiWorksheet.prototype.GetAllCharts = function() { return []; };

/**
* Returns all OLE objects from the current sheet.
* @memberof ApiWorksheet
* @returns {ApiOleObject[]}.
*/
ApiWorksheet.prototype.GetAllOleObjects = function() { return []; };

/**
* Moves the current sheet to another location in the workbook.
* @memberof ApiWorksheet
* @param {ApiWorksheet} before - The sheet before which the current sheet will be placed. You cannot specify "before" if you specify "after".
* @param {ApiWorksheet} after - The sheet after which the current sheet will be placed. You cannot specify "after" if you specify "before".
*/
ApiWorksheet.prototype.Move = function(before, after) {};

/**
* Returns a pivot table by its name from the current worksheet, or null if it does not exist.
* @memberof ApiWorksheet
* @param {string} name - The pivot table name.
* @returns {ApiPivotTable|null}
* @since 8.2.0
*/
ApiWorksheet.prototype.GetPivotByName = function(name) { return new ApiPivotTable(); };

/**
* Returns all pivot tables from the current worksheet.
* @memberof ApiWorksheet
* @returns {ApiPivotTable[]}
* @since 8.2.0
*/
ApiWorksheet.prototype.GetAllPivotTables = function() { return []; };

/**
* Refreshes all pivot tables on the current worksheet.
* @memberof ApiWorksheet
* @since 8.2.0
*/
ApiWorksheet.prototype.RefreshAllPivots = function() {};

/**
* Returns the freeze panes from the current worksheet.
* @memberof ApiWorksheet
* @returns {ApiFreezePanes}
* @since 8.0.0
*/
ApiWorksheet.prototype.GetFreezePanes = function() { return new ApiFreezePanes(); };

/**
* Creates a protected range of the specified type from the selected data range of the current sheet.
* @memberof ApiWorksheet
* @param {string} sTitle - The title which will be displayed for the current protected range.
* @param {string} sDataRange - The selected cell range which will be used to get the data for the protected range.
* @returns {ApiProtectedRange | null}
* @since 8.1.0
*/
ApiWorksheet.prototype.AddProtectedRange = function(sTitle, sDataRange) { return new ApiProtectedRange(); };

/**
* Returns a protected range object by its title.
* @memberof ApiWorksheet
* @param {string} sTitle - The title of the protected range that will be returned.
* @returns {ApiProtectedRange | null}
* @since 8.1.0
*/
ApiWorksheet.prototype.GetProtectedRange = function(sTitle) { return new ApiProtectedRange(); };

/**
* Returns all protected ranges from the current worksheet.
* @memberof ApiWorksheet
* @returns {ApiProtectedRange[] | null}
* @since 8.1.0
*/
ApiWorksheet.prototype.GetAllProtectedRanges = function() { return []; };

/**
* Pastes the contents of the clipboard to the current sheet.
* @memberof ApiWorksheet
* @param {ApiRange?} [destination] - The cell range where the clipboard contents should be pasted. If this argument is omitted, the current selection is used.
* @since 8.1.0
*/
ApiWorksheet.prototype.Paste = function(destination) {};

/**
* Retrieves the custom XML manager associated with the current sheet.
* This manager allows manipulation and access to custom XML parts within the current sheet.
* @memberof ApiWorksheet
* @since 9.1.0
* @returns {ApiCustomXmlParts|null} Returns an instance of ApiCustomXmlParts if the custom XML manager exists, otherwise returns null.
*/
ApiWorksheet.prototype.GetCustomXmlParts = function() { return new ApiCustomXmlParts(); };

/**
* Returns an array of ApiListObject objects representing the formatted tables on the worksheet.
* @memberof ApiWorksheet
* @returns {ApiListObject[]}
*/
ApiWorksheet.prototype.GetListObjects = function() { return []; };

/**
* Adds a formatted table to the worksheet and returns the ApiListObject object.
* @memberof ApiWorksheet
* @param {XlListObjectSourceType} [sSourceType="xlSrcRange"] - The source type for the table. Currently only <b>"xlSrcRange"</b> is supported.
* @param {string} [sSource] - The range to which the table will be applied, e.g. <b>"A1:D10"</b>. Required when <em>sSourceType</em> is <b>"xlSrcRange"</b>.
* @param {boolean} [bLinkSource=false] - Not supported.
* @param {XlYesNoGuess} [sHasHeaders="xlGuess"] - Specifies whether the source range has column labels.
* @param {string} [sDestination] - Not supported.
* @param {string} [sTableStyleName="TableStyleLight9"] - The table style name.
* @returns {ApiListObject | null}
*/
ApiWorksheet.prototype.AddListObject = function(sSourceType, sSource, bLinkSource, sHasHeaders, sDestination, sTableStyleName) { return new ApiListObject(); };

/**
* Adds a detached drawing object (e.g. a copy returned by ApiDrawing.Copy) to the worksheet at the specified anchor.
* @memberof ApiWorksheet
* @param {ApiDrawing} oDrawing - The drawing object to add.
* @param {number} nFromCol - The number of the column where the upper-left corner of the drawing will be placed.
* @param {EMU} nColOffset - The offset from the nFromCol column to the upper-left corner of the drawing measured in English measure units.
* @param {number} nFromRow - The number of the row where the upper-left corner of the drawing will be placed.
* @param {EMU} nRowOffset - The offset from the nFromRow row to the upper-left corner of the drawing measured in English measure units.
* @returns {boolean} - returns false if the drawing is missing or already attached to a worksheet.
* @since 9.4.0
*/
ApiWorksheet.prototype.AddDrawing = function(oDrawing, nFromCol, nColOffset, nFromRow, nRowOffset) { return true; };

/**
* Returns a type of the ApiRange class.
* @memberof ApiRange
* @returns {"range"}
*/
ApiRange.prototype.GetClassType = function() { return ""; };

/**
* Returns a row number for the selected cell.
* @memberof ApiRange
* @returns {number}
*/
ApiRange.prototype.GetRow = function() { return 0; };

/**
* Returns a column number for the selected cell.
* @memberof ApiRange
* @returns {number}
*/
ApiRange.prototype.GetCol = function() { return 0; };

/**
* Clears the current range.
* @memberof ApiRange
* @returns {boolean} - returns true if the range was cleared successfully.
*/
ApiRange.prototype.Clear = function() { return true; };

/**
* Clears all formatting from the current range.
* @memberof ApiRange
* @since 9.1.0
*/
ApiRange.prototype.ClearFormats = function() {};

/**
* Clears all contents from the current range.
* @memberof ApiRange
* @since 9.1.0
*/
ApiRange.prototype.ClearContents = function() {};

/**
* Clears all hyperlinks from the current range.
* @memberof ApiRange
* @since 9.1.0
*/
ApiRange.prototype.ClearHyperlinks = function() {};

/**
* Returns a Range object that represents the rows in the specified range. If the specified row is outside the Range object, a new Range will be returned that represents the cells between the columns of the original range in the specified row.
* @memberof ApiRange
* @param {number} nRow - The row number (starts counting from 1, the 0 value returns an error).
* @returns {ApiRange | null}
*/
ApiRange.prototype.GetRows = function(nRow) { return new ApiRange(); };

/**
* Returns a number of cells in the current range.
* @memberof ApiRange
* @returns {number}
* @since 9.1.0
*/
ApiRange.prototype.GetCellsCount = function() { return 0; };

/**
* Returns a number of columns in the current range.
* @memberof ApiRange
* @returns {number}
* @since 9.1.0
*/
ApiRange.prototype.GetColumnsCount = function() { return 0; };

/**
* Returns a number of rows in the current range.
* @memberof ApiRange
* @returns {number}
* @since 9.1.0
*/
ApiRange.prototype.GetRowsCount = function() { return 0; };

/**
* Returns a Range object that represents the columns in the specified range.
* @memberof ApiRange
* @param {number} nCol - The column number. *
* @returns {ApiRange | null}
*/
ApiRange.prototype.GetCols = function(nCol) { return new ApiRange(); };

/**
* Returns a Range object that represents the end in the specified direction in the specified range.
* @memberof ApiRange
* @param {Direction} direction - The direction of end in the specified range. *
* @returns {ApiRange}
*/
ApiRange.prototype.End = function(direction) { return new ApiRange(); };

/**
* Returns a Range object that represents all the cells in the specified range or a specified cell.
* @memberof ApiRange
* @param {number} row - The row number or the cell number (if only row is defined).
* @param {number} col - The column number.
* @returns {ApiRange}
*/
ApiRange.prototype.GetCells = function(row, col) { return new ApiRange(); };

/**
* Sets the cell offset.
* @memberof ApiRange
* @param {number} nRow - The row number.
* @param {number} nCol - The column number.
* @returns {boolean} - returns true if the offset was set successfully.
*/
ApiRange.prototype.SetOffset = function(nRow, nCol) { return true; };

/**
* Returns the range address.
* @memberof ApiRange
* @param {boolean} RowAbs - Defines if the link to the row is absolute or not.
* @param {boolean} ColAbs - Defines if the link to the column is absolute or not.
* @param {string} RefStyle - The reference style.
* @param {boolean} External - Defines if the range is in the current file or not.
* @param {ApiRange} RelativeTo - The range which the current range is relative to.
* @returns {string | null} - returns address of range as string.
*/
ApiRange.prototype.GetAddress = function(RowAbs, ColAbs, RefStyle, External, RelativeTo) { return ""; };

/**
* Returns the rows or columns count.
* @memberof ApiRange
* @returns {number}
*/
ApiRange.prototype.GetCount = function() { return 0; };

/**
* Returns a value of the specified range.
* @memberof ApiRange
* @returns {string | number | boolean | Array<Array<string | number | boolean>>}
*/
ApiRange.prototype.GetValue = function() { return ""; };

/**
* Sets a value to the current cell or cell range.
* @memberof ApiRange
* @param {string | boolean | number | Array<string | boolean | number> | Array<Array<string | boolean | number>>} data - The general value for the cell or cell range.
* @returns {boolean} - returns false if such a range does not exist.
*/
ApiRange.prototype.SetValue = function(data) { return true; };

/**
* Returns a formula of the specified range.
* @memberof ApiRange
* @returns {string | string[][]} - return Value2 property (value without format) if formula doesn't exist.
*/
ApiRange.prototype.GetFormula = function() { return ""; };

/**
* Returns the Value2 property (value without format) of the specified range.
* @memberof ApiRange
* @returns {string | string[][]}
*/
ApiRange.prototype.GetValue2 = function() { return ""; };

/**
* Returns the text of the specified range.
* @memberof ApiRange
* @returns {string | string[][]}
*/
ApiRange.prototype.GetText = function() { return ""; };

/**
* Sets the text color to the current cell range with the previously created color object.
* @memberof ApiRange
* @param {ApiColor} oColor - The color object which specifies the color to be set to the text in the cell / cell range.
* @returns {boolean} - returns true if the font color was set successfully.
*/
ApiRange.prototype.SetFontColor = function(oColor) { return true; };

/**
* Returns the value hiding property. The specified range must span an entire column or row.
* @memberof ApiRange
* @returns {boolean} - returns true if the values in the range specified are hidden.
*/
ApiRange.prototype.GetHidden = function() { return true; };

/**
* Sets the value hiding property. The specified range must span an entire column or row.
* @memberof ApiRange
* @param {boolean} isHidden - Specifies if the values in the current range are hidden or not.
* @returns {boolean} - returns true if the hidden property was set successfully.
*/
ApiRange.prototype.SetHidden = function(isHidden) { return true; };

/**
* Returns the column width value.
* @memberof ApiRange
* @returns {number}
*/
ApiRange.prototype.GetColumnWidth = function() { return 0; };

/**
* Sets the width of all the columns in the current range.
* One unit of column width is equal to the width of one character in the Normal style.
* For proportional fonts, the width of the character 0 (zero) is used.
* @memberof ApiRange
* @param {number} nWidth - The width of the column divided by 7 pixels.
*/
ApiRange.prototype.SetColumnWidth = function(nWidth) {};

/**
* Returns the row height value.
* @memberof ApiRange
* @returns {pt} - The row height in the range specified, measured in points.
*/
ApiRange.prototype.GetRowHeight = function() { return new pt(); };

/**
* Sets the row height value.
* @memberof ApiRange
* @param {pt} nHeight - The row height in the current range measured in points.
* @returns {boolean} - returns true if the row height was set successfully.
*/
ApiRange.prototype.SetRowHeight = function(nHeight) { return true; };

/**
* Sets the font size to the characters of the current cell range.
* @memberof ApiRange
* @param {number} nSize - The font size value measured in points.
* @returns {boolean} - returns true if the font size was set successfully.
*/
ApiRange.prototype.SetFontSize = function(nSize) { return true; };

/**
* Sets the specified font family as the font name for the current cell range.
* @memberof ApiRange
* @param {string} sName - The font family name used for the current cell range.
* @returns {boolean} - returns true if the font name was set successfully.
*/
ApiRange.prototype.SetFontName = function(sName) { return true; };

/**
* Sets the vertical alignment of the text in the current cell range.
* @memberof ApiRange
* @param {'center' | 'bottom' | 'top' | 'distributed' | 'justify'} sAligment - The vertical alignment that will be applied to the cell contents.
* @returns {boolean} - return false if sAligment doesn't exist.
*/
ApiRange.prototype.SetAlignVertical = function(sAligment) { return true; };

/**
* Sets the horizontal alignment of the text in the current cell range.
* @memberof ApiRange
* @param {'left' | 'right' | 'center' | 'justify'} sAlignment - The horizontal alignment that will be applied to the cell contents.
* @returns {boolean} - return false if sAligment doesn't exist.
*/
ApiRange.prototype.SetAlignHorizontal = function(sAlignment) { return true; };

/**
* Sets the direction (reading order) of the text in the current cell range.
*
* @memberof ApiRange
* @param {'context' | 'ltr' | 'rtl'} direction - The direction (reading order) that will be applied to the cell contents.
*/
ApiRange.prototype.SetReadingOrder = function(direction) {};

/**
* Sets the bold property to the text characters in the current cell or cell range.
* @memberof ApiRange
* @param {boolean} isBold - Specifies that the contents of the current cell / cell range are displayed bold.
* @returns {boolean} - returns true if the bold property was set successfully.
*/
ApiRange.prototype.SetBold = function(isBold) { return true; };

/**
* Sets the italic property to the text characters in the current cell or cell range.
* @memberof ApiRange
* @param {boolean} isItalic - Specifies that the contents of the current cell / cell range are displayed italicized.
* @returns {boolean} - returns true if the italic property was set successfully.
*/
ApiRange.prototype.SetItalic = function(isItalic) { return true; };

/**
* Specifies that the contents of the current cell / cell range are displayed along with a line appearing directly below the character.
* @memberof ApiRange
* @param {'none' | 'single' | 'singleAccounting' | 'double' | 'doubleAccounting'} undelineType - Specifies the type of the
* line displayed under the characters. The following values are available:
* <b>"none"</b> - for no underlining;
* <b>"single"</b> - for a single line underlining the cell contents;
* <b>"singleAccounting"</b> - for a single line underlining the cell contents but not protruding beyond the cell borders;
* <b>"double"</b> - for a double line underlining the cell contents;
* <b>"doubleAccounting"</b> - for a double line underlining the cell contents but not protruding beyond the cell borders.
* @returns {boolean} - returns true if the underline property was set successfully.
*/
ApiRange.prototype.SetUnderline = function(undelineType) { return true; };

/**
* Specifies that the contents of the cell / cell range are displayed with a single horizontal line through the center of the contents.
* @memberof ApiRange
* @param {boolean} isStrikeout - Specifies if the contents of the current cell / cell range are displayed struck through.
* @returns {boolean} - returns true if the strikeout property was set successfully.
*/
ApiRange.prototype.SetStrikeout = function(isStrikeout) { return true; };

/**
* Specifies whether the words in the cell must be wrapped to fit the cell size or not.
* @memberof ApiRange
* @param {boolean} isWrap - Specifies if the words in the cell will be wrapped to fit the cell size.
* @returns {boolean} - returns true if the wrap property was set successfully.
*/
ApiRange.prototype.SetWrap = function(isWrap) { return true; };

/**
* Returns the information about the wrapping cell style.
* @memberof ApiRange
* @returns {boolean}
*/
ApiRange.prototype.GetWrapText = function() { return true; };

/**
* Sets the background color to the current cell range with the previously created color object.
* Sets 'No Fill' when previously created color object is null.
* @memberof ApiRange
* @param {ApiColor} oColor - The color object which specifies the color to be set to the background in the cell / cell range.
* @returns {boolean} - returns true if the fill color was set successfully.
*/
ApiRange.prototype.SetFillColor = function(oColor) { return true; };

/**
* Returns the background color for the current cell range. Returns 'No Fill' when the color of the background in the cell / cell range is null.
* @memberof ApiRange
* @returns {ApiColor|'No Fill'} - return 'No Fill' when the color to the background in the cell / cell range is null.
*/
ApiRange.prototype.GetFillColor = function() { return new ApiColor(); };

/**
* Returns a value that represents the format code for the current range.
* @memberof ApiRange
* @returns {string | null} This property returns null if all cells in the specified range don't have the same number format.
*/
ApiRange.prototype.GetNumberFormat = function() { return ""; };

/**
* Specifies whether a number in the cell should be treated like number, currency, date, time, etc. or just like text.
* @memberof ApiRange
* @param {string} sFormat - Specifies the mask applied to the number in the cell.
* @returns {boolean} - returns true if the number format was set successfully.
*/
ApiRange.prototype.SetNumberFormat = function(sFormat) { return true; };

/**
* Sets the border to the cell / cell range with the parameters specified.
* @memberof ApiRange
* @param {BordersIndex} bordersIndex - Specifies the cell border position.
* @param {LineStyle} lineStyle - Specifies the line style used to form the cell border.
* @param {ApiColor} oColor - The color object which specifies the color to be set to the cell border.
* @returns {boolean} - returns true if the borders were set successfully.
*/
ApiRange.prototype.SetBorders = function(bordersIndex, lineStyle, oColor) { return true; };

/**
* Merges the selected cell range into a single cell or a cell row.
* @memberof ApiRange
* @param {boolean} isAcross - When set to <b>true</b>, the cells within the selected range will be merged along the rows,
* but remain split in the columns. When set to <b>false</b>, the whole selected range of cells will be merged into a single cell.
* @returns {boolean} - returns true if the range was merged successfully.
*/
ApiRange.prototype.Merge = function(isAcross) { return true; };

/**
* Splits the selected merged cell range into the single cells.
* @memberof ApiRange
* @returns {boolean} - returns true if the range was unmerged successfully.
*/
ApiRange.prototype.UnMerge = function() { return true; };

/**
* Executes a provided function once for each cell.
* @memberof ApiRange
* @param {Function} fCallback - A function which will be executed for each cell.
* @returns {boolean} - returns true if the callback was executed, false if the callback is not a function.
*/
ApiRange.prototype.ForEach = function(fCallback) { return true; };

/**
* Adds a comment to the current range.
* @memberof ApiRange
* @param {string} sText - The comment text.
* @param {string} sAuthor - The author's name (optional).
* @returns {ApiComment | null} - returns false if comment can't be added.
*/
ApiRange.prototype.AddComment = function(sText, sAuthor) { return new ApiComment(); };

/**
* Returns the Worksheet object that represents the worksheet containing the specified range. It will be available in the read-only mode.
* @memberof ApiRange
* @returns {ApiWorksheet}
*/
ApiRange.prototype.GetWorksheet = function() { return new ApiWorksheet(); };

/**
* Returns the ApiName object of the current range.
* @memberof ApiRange
* @returns {ApiName}
*/
ApiRange.prototype.GetDefName = function() { return new ApiName(); };

/**
* Returns the ApiComment object of the current range.
* @memberof ApiRange
* @returns {ApiComment | null} - returns null if range does not consist of one cell.
*/
ApiRange.prototype.GetComment = function() { return new ApiComment(); };

/**
* Selects the current range.
* @memberof ApiRange
* @returns {boolean} - returns true if the range was selected successfully.
*/
ApiRange.prototype.Select = function() { return true; };

/**
* Returns the current range angle.
* @memberof ApiRange
* @returns {Angle}
*/
ApiRange.prototype.GetOrientation = function() { return new Angle(); };

/**
* Sets an angle to the current cell range.
* @memberof ApiRange
* @param {Angle} angle - Specifies the range angle.
*/
ApiRange.prototype.SetOrientation = function(angle) {};

/**
* Sorts the cells in the given range by the parameters specified in the request.
* @memberof ApiRange
* @param {ApiRange | String} key1 - First sort field.
* @param {SortOrder} sSortOrder1 - The sort order for the values specified in Key1.
* @param {ApiRange | String} key2 - Second sort field.
* @param {SortOrder} sSortOrder2 - The sort order for the values specified in Key2.
* @param {ApiRange | String} key3 - Third sort field.
* @param {SortOrder} sSortOrder3 - The sort order for the values specified in Key3.
* @param {SortHeader} sHeader - Specifies whether the first row contains header information.
* @param {SortOrientation} sOrientation - Specifies if the sort should be by row (default) or column.
*/
ApiRange.prototype.SetSort = function(key1, sSortOrder1, key2, sSortOrder2, key3, sSortOrder3, sHeader, sOrientation) {};

/**
* Deletes the Range object.
* @memberof ApiRange
* @param {DeleteShiftDirection} [shift] - Specifies how to shift cells to replace the deleted cells.
*/
ApiRange.prototype.Delete = function(shift) {};

/**
* Inserts a cell or a range of cells into the worksheet or macro sheet and shifts other cells away to make space.
* @memberof ApiRange
* @param {string} [shift] - Specifies which way to shift the cells ("right", "down").
*/
ApiRange.prototype.Insert = function(shift) {};

/**
* Changes the width of the columns or the height of the rows in the range to achieve the best fit.
* @memberof ApiRange
* @param {boolean} [bRows] - Specifies if the width of the columns will be autofit.
* @param {boolean} [bCols] - Specifies if the height of the rows will be autofit.
*/
ApiRange.prototype.AutoFit = function(bRows, bCols) {};

/**
* Returns a collection of the ranges.
* @memberof ApiRange
* @returns {ApiAreas}
*/
ApiRange.prototype.GetAreas = function() { return new ApiAreas(); };

/**
* Copies the range to the specified range or to the clipboard.
* @memberof ApiRange
* @param {ApiRange?} [destination] - Specifies the new range to which the specified range will be copied. If this argument is omitted, the range will be copied to the clipboard.
*/
ApiRange.prototype.Copy = function(destination) {};

/**
* Cuts the range and save it to the clipboard or paste it to the specified range.
* @memberof ApiRange
* @param {ApiRange?} [destination] - Specifies the new range to which the cut range will be pasted. If this argument is omitted, the range will be copied to the clipboard.
* @since 8.1.0
*/
ApiRange.prototype.Cut = function(destination) {};

/**
* Pastes the Range object to the specified range.
* @memberof ApiRange
* @param {ApiRange} rangeFrom - Specifies the range to be pasted to the current range
*/
ApiRange.prototype.Paste = function(rangeFrom) {};

/**
* Pastes the Range object to the specified range using the special paste options.
* @memberof ApiRange
* @param {PasteType} [sPasteType="xlPasteAll"]  - Paste option.
* @param {PasteSpecialOperation} [sPasteSpecialOperation="xlPasteSpecialOperationNone"] - The mathematical operation which will be applied to the copied data.
* @param {boolean} [bSkipBlanks=false] - Specifies whether to avoid replacing values in the paste area when blank cells occur in the copy area.
* @param {boolean} [bTranspose=false] - Specifies whether the pasted data will be transposed from rows to columns.
* @since 8.1.0
*/
ApiRange.prototype.PasteSpecial = function(sPasteType, sPasteSpecialOperation, bSkipBlanks, bTranspose) {};

/**
* Returns the ApiPivotTable object that represents the pivot table report containing the upper-left corner of the specified range.
* @memberof ApiRange
* @returns {ApiPivotTable | null}
* @since 8.2.0
*/
ApiRange.prototype.GetPivotTable = function() { return new ApiPivotTable(); };

/**
* Finds specific information in the current range.
* @memberof ApiRange
* @param {SearchData} oSearchData - The search data used to make search.
* @returns {ApiRange | null} - Returns null if the current range does not contain such text.
*/
ApiRange.prototype.Find = function(oSearchData) { return new ApiRange(); };

/**
* Continues a search that was begun with the {@link ApiRange#Find} method. Finds the next cell that matches those same conditions and returns the ApiRange object that represents that cell. This does not affect the selection or the active cell.
* @memberof ApiRange
* @param {ApiRange} After - The cell after which the search will start. If this argument is not specified, the search starts from the last cell found.
* @returns {ApiRange | null} - Returns null if the range does not contain such text.
*
*/
ApiRange.prototype.FindNext = function(After) { return new ApiRange(); };

/**
* Continues a search that was begun with the {@link ApiRange#Find} method. Finds the previous cell that matches those same conditions and returns the ApiRange object that represents that cell. This does not affect the selection or the active cell.
* @memberof ApiRange
* @param {ApiRange} Before - The cell before which the search will start. If this argument is not specified, the search starts from the last cell found.
* @returns {ApiRange | null} - Returns null if the range does not contain such text.
*
*/
ApiRange.prototype.FindPrevious = function(Before) { return new ApiRange(); };

/**
* Replaces specific information to another one in a range.
* @memberof ApiRange
* @param {ReplaceData} oReplaceData - The data used to make search and replace.
* @returns {boolean} - Returns true if at least one match was found and replacement was initiated, false otherwise.
*/
ApiRange.prototype.Replace = function(oReplaceData) { return true; };

/**
* Returns the ApiCharacters object that represents a range of characters within the object text. Use the ApiCharacters object to format characters within a text string.
* @memberof ApiRange
* @param {number} Start - The first character to be returned. If this argument is either 1 or omitted, this property returns a range of characters starting with the first character.
* @param {number} Length - The number of characters to be returned. If this argument is omitted, this property returns the remainder of the string (everything after the Start character).
* @returns {ApiCharacters}
* @since 7.4.0
*/
ApiRange.prototype.GetCharacters = function(Start, Length) { return new ApiCharacters(); };

/**
* Adds an AutoFilter to the current range.
* @memberof ApiRange
* @param {number|null} [Field] - The integer offset of the field on which you want to base the filter (from the left of the list; the leftmost field is field one). If {null} provided, clears the AutoFilter for the range.
* @param {string | string[] | ApiColor | XlDynamicFilterCriteria} [Criteria1] - The criteria (a string; for example, "101"). Use "=" to find blank fields, "<>" to find non-blank fields, and "><" to select (No Data) fields in data types.
* If this argument is omitted, the criteria is All. If Operator is xlTop10Items, Criteria1 specifies the number of items (for example, "10").
* @param {XlAutoFilterOperator} [Operator] - An XlAutoFilterOperator constant specifying the type of filter.
* @param {string} [Criteria2] - The second criteria (a string). Used with Criteria1 and Operator to construct compound criteria.
* @param {boolean} [VisibleDropDown] - True to display the AutoFilter drop-down arrow for the filtered field. False to hide the AutoFilter drop-down arrow for the filtered field. True by default.
* @since 8.3.0
*/
ApiRange.prototype.SetAutoFilter = function(Field, Criteria1, Operator, Criteria2, VisibleDropDown) {};

/**
* Sets an array formula to the current range.
* @memberof ApiRange
* @param {string | boolean | number} data - The general value for the cell or cell range.
* @returns {boolean} - Returns false if such a range does not exist.
* @since 9.0.0
*/
ApiRange.prototype.SetFormulaArray = function(data) { return true; };

/**
* Returns an array formula from the current range.
* @memberof ApiRange
* @returns {string | null}
* @since 9.0.0
*/
ApiRange.prototype.GetFormulaArray = function() { return ""; };

/**
* Returns a range that represents the expanded range around the current range.
* @memberof ApiRange
* @returns {ApiRange | null} - Returns the expanded range or null if the range cannot be expanded.
* @since 9.1.0
*/
ApiRange.prototype.GetCurrentRegion = function() { return new ApiRange(); };

/**
* Returns a Range object offset from the current range.
* @memberof ApiRange
* @param {number} rowOffset - The number of rows to offset the range.
* @param {number} columnOffset - The number of columns to offset the range.
* @returns {ApiRange | null} - Returns the offset range, or null if invalid.
* @since 9.1.0
*/
ApiRange.prototype.Offset = function(rowOffset, columnOffset) { return new ApiRange(); };

/**
* Resizes the current range by changing the number of rows and columns.
* @memberof ApiRange
* @param {number} rowSize - The number of rows for the new range.
* @param {number} columnSize - The number of columns for the new range.
* @returns {ApiRange | null} - Returns the resized range, or null if invalid.
* @since 9.1.0
*/
ApiRange.prototype.Resize = function(rowSize, columnSize) { return new ApiRange(); };

/**
* Returns a Range object that represents a cell or a range of cells.
* When applied to a Range object, the property is relative to that Range object.
* @memberof ApiRange
* @param {string | ApiRange} cell1 - The first cell address (e.g., "A1" or "A1:B2").
* @param {string | ApiRange} [cell2] - The second cell address (optional, defines the corner with "cell1").
* @returns {ApiRange | null} - Returns the range relative to this range, or null if invalid.
* @since 9.1.0
*/
ApiRange.prototype.GetRange = function(cell1, cell2) { return new ApiRange(); };

/**
* Returns a Range object that represents the entire row(s) containing the specified range.
* @memberof ApiRange
* @returns {ApiRange | null} - Returns the entire row range, or null if invalid.
* @since 9.1.0
*/
ApiRange.prototype.GetEntireRow = function() { return new ApiRange(); };

/**
* Returns a Range object that represents the entire column(s) containing the specified range.
* @memberof ApiRange
* @returns {ApiRange | null} - Returns the entire column range, or null if invalid.
* @since 9.1.0
*/
ApiRange.prototype.GetEntireColumn = function() { return new ApiRange(); };

/**
* Returns the data validation object associated with this range. If no validation object exists yet, it will be created.
* @memberof ApiRange
* @returns {ApiValidation}
*/
ApiRange.prototype.GetValidation = function() { return new ApiValidation(); };

/**
* Returns the collection of conditional formatting rules for the current range.
* @memberof ApiRange
* @returns {ApiFormatConditions}
* @since 9.1.0
*/
ApiRange.prototype.GetFormatConditions = function() { return new ApiFormatConditions(); };

/**
* Sets a formula or value to the current cell or cell range.
* @memberof ApiRange
* @param {string | number | boolean | Array<string | number | boolean> | Array<Array<string | number | boolean>>} data - The formula or value for the cell or cell range.
* @returns {boolean} - returns false if such a range does not exist.
*/
ApiRange.prototype.SetFormula = function(data) { return true; };

/**
* Copies the contents and formatting of the top row of the range into the remaining rows.
* If the range has only one row, the method succeeds but makes no changes.
* @memberof ApiRange
* @returns {boolean} - returns false if the operation was blocked by sheet protection or an incompatible merged cell structure.
* @since 9.4.0
*/
ApiRange.prototype.FillDown = function() { return true; };

/**
* Copies the contents and formatting of the bottom row of the range into the remaining rows.
* If the range has only one row, the method succeeds but makes no changes.
* @memberof ApiRange
* @returns {boolean} - returns false if the operation was blocked by sheet protection or an incompatible merged cell structure.
* @since 9.4.0
*/
ApiRange.prototype.FillUp = function() { return true; };

/**
* Copies the contents and formatting of the leftmost column of the range into the remaining columns.
* If the range has only one column, the method succeeds but makes no changes.
* @memberof ApiRange
* @returns {boolean} - returns false if the operation was blocked by sheet protection or an incompatible merged cell structure.
* @since 9.4.0
*/
ApiRange.prototype.FillRight = function() { return true; };

/**
* Copies the contents and formatting of the rightmost column of the range into the remaining columns.
* If the range has only one column, the method succeeds but makes no changes.
* @memberof ApiRange
* @returns {boolean} - returns false if the operation was blocked by sheet protection or an incompatible merged cell structure.
* @since 9.4.0
*/
ApiRange.prototype.FillLeft = function() { return true; };


ApiRange.prototype.InsertRows = function() {};


ApiRange.prototype.InsertColumns = function() {};


ApiRange.prototype.DeleteRows = function() {};


ApiRange.prototype.DeleteColumns = function() {};

/**
* Returns a type of the ApiDrawing class.
* @memberof ApiDrawing
* @returns {"drawing"}
*/
ApiDrawing.prototype.GetClassType = function() { return ""; };

/**
* Sets a size of the object (image, shape, chart) bounding box.
* @memberof ApiDrawing
* @param {EMU} nWidth - The object width measured in English measure units.
* @param {EMU} nHeight - The object height measured in English measure units.
*/
ApiDrawing.prototype.SetSize = function(nWidth, nHeight) {};

/**
* Changes the position for the drawing object.
* <note>Please note that the horizontal and vertical offsets are calculated within the limits of
* the specified column and row cells only. If this value exceeds the cell width or height, another vertical/horizontal position will be set.</note>
* @memberof ApiDrawing
* @param {number} nFromCol - The number of the column where the beginning of the drawing object will be placed.
* @param {EMU} nColOffset - The offset from the nFromCol column to the left part of the drawing object measured in English measure units.
* @param {number} nFromRow - The number of the row where the beginning of the drawing object will be placed.
* @param {EMU} nRowOffset - The offset from the nFromRow row to the upper part of the drawing object measured in English measure units.
*/
ApiDrawing.prototype.SetPosition = function(nFromCol, nColOffset, nFromRow, nRowOffset) {};

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
* Returns the parent sheet of the current drawing.
* @memberof ApiDrawing
* @returns {?ApiWorksheet}
* @since 8.3.0
*/
ApiDrawing.prototype.GetParentSheet = function() { return new ApiWorksheet(); };

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
* Selects the current graphic object.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} [isReplace=false] - Specifies whether the selection should replace the current selection (true) or be added to it (false).
*/
ApiDrawing.prototype.Select = function(isReplace) {};

/**
* Removes the current drawing from the selection.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean} - Returns false if the drawing or controller is not available, otherwise returns true.
*/
ApiDrawing.prototype.Unselect = function() { return true; };

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
* Deletes the specified drawing object.
*
* @memberof ApiDrawing
* @returns {boolean} - returns false if the drawing object can not be deleted.
*
* @since 9.4.0
*/
ApiDrawing.prototype.Delete = function() { return true; };

/**
* Creates a copy of the specified drawing object.
* @memberof ApiDrawing
* @returns {ApiDrawing} - return null if drawing doesn't exist.
* @since 9.4.0
*/
ApiDrawing.prototype.Copy = function() { return new ApiDrawing(); };

/**
* Returns a type of the ApiImage class.
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
* Returns the parent sheet of the current drawing.
* @memberof ApiDrawing
* @returns {?ApiWorksheet}
* @since 8.3.0
*/
ApiImage.prototype.GetParentSheet = function() { return new ApiWorksheet(); };

/**
* Sets a size of the object (image, shape, chart) bounding box.
* @memberof ApiDrawing
* @param {EMU} nWidth - The object width measured in English measure units.
* @param {EMU} nHeight - The object height measured in English measure units.
*/
ApiImage.prototype.SetSize = function(nWidth, nHeight) {};

/**
* Changes the position for the drawing object.
* <note>Please note that the horizontal and vertical offsets are calculated within the limits of
* the specified column and row cells only. If this value exceeds the cell width or height, another vertical/horizontal position will be set.</note>
* @memberof ApiDrawing
* @param {number} nFromCol - The number of the column where the beginning of the drawing object will be placed.
* @param {EMU} nColOffset - The offset from the nFromCol column to the left part of the drawing object measured in English measure units.
* @param {number} nFromRow - The number of the row where the beginning of the drawing object will be placed.
* @param {EMU} nRowOffset - The offset from the nFromRow row to the upper part of the drawing object measured in English measure units.
*/
ApiImage.prototype.SetPosition = function(nFromCol, nColOffset, nFromRow, nRowOffset) {};

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
* Selects the current graphic object.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} [isReplace=false] - Specifies whether the selection should replace the current selection (true) or be added to it (false).
*/
ApiImage.prototype.Select = function(isReplace) {};

/**
* Removes the current drawing from the selection.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean} - Returns false if the drawing or controller is not available, otherwise returns true.
*/
ApiImage.prototype.Unselect = function() { return true; };

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
* Deletes the specified drawing object.
*
* @memberof ApiDrawing
* @returns {boolean} - returns false if the drawing object can not be deleted.
*
* @since 9.4.0
*/
ApiImage.prototype.Delete = function() { return true; };

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
* Returns the parent sheet of the current drawing.
* @memberof ApiDrawing
* @returns {?ApiWorksheet}
* @since 8.3.0
*/
ApiGroup.prototype.GetParentSheet = function() { return new ApiWorksheet(); };

/**
* Sets a size of the object (image, shape, chart) bounding box.
* @memberof ApiDrawing
* @param {EMU} nWidth - The object width measured in English measure units.
* @param {EMU} nHeight - The object height measured in English measure units.
*/
ApiGroup.prototype.SetSize = function(nWidth, nHeight) {};

/**
* Changes the position for the drawing object.
* <note>Please note that the horizontal and vertical offsets are calculated within the limits of
* the specified column and row cells only. If this value exceeds the cell width or height, another vertical/horizontal position will be set.</note>
* @memberof ApiDrawing
* @param {number} nFromCol - The number of the column where the beginning of the drawing object will be placed.
* @param {EMU} nColOffset - The offset from the nFromCol column to the left part of the drawing object measured in English measure units.
* @param {number} nFromRow - The number of the row where the beginning of the drawing object will be placed.
* @param {EMU} nRowOffset - The offset from the nFromRow row to the upper part of the drawing object measured in English measure units.
*/
ApiGroup.prototype.SetPosition = function(nFromCol, nColOffset, nFromRow, nRowOffset) {};

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
* Selects the current graphic object.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} [isReplace=false] - Specifies whether the selection should replace the current selection (true) or be added to it (false).
*/
ApiGroup.prototype.Select = function(isReplace) {};

/**
* Removes the current drawing from the selection.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean} - Returns false if the drawing or controller is not available, otherwise returns true.
*/
ApiGroup.prototype.Unselect = function() { return true; };

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
* Deletes the specified drawing object.
*
* @memberof ApiDrawing
* @returns {boolean} - returns false if the drawing object can not be deleted.
*
* @since 9.4.0
*/
ApiGroup.prototype.Delete = function() { return true; };

/**
* Returns a type of the ApiSmartArt class.
* @memberof ApiSmartArt
* @returns {"smartArt"}
*/
ApiSmartArt.prototype.GetClassType = function() { return ""; };

/**
* Returns the parent sheet of the current drawing.
* @memberof ApiDrawing
* @returns {?ApiWorksheet}
* @since 8.3.0
*/
ApiSmartArt.prototype.GetParentSheet = function() { return new ApiWorksheet(); };

/**
* Sets a size of the object (image, shape, chart) bounding box.
* @memberof ApiDrawing
* @param {EMU} nWidth - The object width measured in English measure units.
* @param {EMU} nHeight - The object height measured in English measure units.
*/
ApiSmartArt.prototype.SetSize = function(nWidth, nHeight) {};

/**
* Changes the position for the drawing object.
* <note>Please note that the horizontal and vertical offsets are calculated within the limits of
* the specified column and row cells only. If this value exceeds the cell width or height, another vertical/horizontal position will be set.</note>
* @memberof ApiDrawing
* @param {number} nFromCol - The number of the column where the beginning of the drawing object will be placed.
* @param {EMU} nColOffset - The offset from the nFromCol column to the left part of the drawing object measured in English measure units.
* @param {number} nFromRow - The number of the row where the beginning of the drawing object will be placed.
* @param {EMU} nRowOffset - The offset from the nFromRow row to the upper part of the drawing object measured in English measure units.
*/
ApiSmartArt.prototype.SetPosition = function(nFromCol, nColOffset, nFromRow, nRowOffset) {};

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
* Selects the current graphic object.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} [isReplace=false] - Specifies whether the selection should replace the current selection (true) or be added to it (false).
*/
ApiSmartArt.prototype.Select = function(isReplace) {};

/**
* Removes the current drawing from the selection.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean} - Returns false if the drawing or controller is not available, otherwise returns true.
*/
ApiSmartArt.prototype.Unselect = function() { return true; };

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
* Deletes the specified drawing object.
*
* @memberof ApiDrawing
* @returns {boolean} - returns false if the drawing object can not be deleted.
*
* @since 9.4.0
*/
ApiSmartArt.prototype.Delete = function() { return true; };

/**
* Creates a copy of the specified drawing object.
* @memberof ApiDrawing
* @returns {ApiDrawing} - return null if drawing doesn't exist.
* @since 9.4.0
*/
ApiSmartArt.prototype.Copy = function() { return new ApiDrawing(); };

/**
* Returns a type of the ApiShape class.
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
* Returns the shape inner contents where a paragraph or text runs can be inserted.
* @memberof ApiShape
* @returns {?ApiDocumentContent}
*/
ApiShape.prototype.GetDocContent = function() { return new ApiDocumentContent(); };

/**
* Sets the vertical alignment to the shape content where a paragraph or text runs can be inserted.
* @memberof ApiShape
* @param {VerticalTextAlign} verticalAlign - The vertical alignment type for the shape inner contents.
* @returns {boolean} - returns false if shape or aligment doesn't exist.
*/
ApiShape.prototype.SetVerticalTextAlign = function(verticalAlign) { return true; };

/**
* Sets the text paddings to the current shape.
* @memberof ApiShape
* @param {?EMU} nLeft - Left padding.
* @param {?EMU} nTop - Top padding.
* @param {?EMU} nRight - Right padding.
* @param {?EMU} nBottom - Bottom padding.
* @returns {boolean}
*/
ApiShape.prototype.SetPaddings = function(nLeft, nTop, nRight, nBottom) { return true; };

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
* Creates a copy of the specified shape.
* @memberof ApiShape
* @returns {ApiShape} - return null if drawing doesn't exist.
* @since 9.4.0
*/
ApiShape.prototype.Copy = function() { return new ApiShape(); };

/**
* Returns the parent sheet of the current drawing.
* @memberof ApiDrawing
* @returns {?ApiWorksheet}
* @since 8.3.0
*/
ApiShape.prototype.GetParentSheet = function() { return new ApiWorksheet(); };

/**
* Sets a size of the object (image, shape, chart) bounding box.
* @memberof ApiDrawing
* @param {EMU} nWidth - The object width measured in English measure units.
* @param {EMU} nHeight - The object height measured in English measure units.
*/
ApiShape.prototype.SetSize = function(nWidth, nHeight) {};

/**
* Changes the position for the drawing object.
* <note>Please note that the horizontal and vertical offsets are calculated within the limits of
* the specified column and row cells only. If this value exceeds the cell width or height, another vertical/horizontal position will be set.</note>
* @memberof ApiDrawing
* @param {number} nFromCol - The number of the column where the beginning of the drawing object will be placed.
* @param {EMU} nColOffset - The offset from the nFromCol column to the left part of the drawing object measured in English measure units.
* @param {number} nFromRow - The number of the row where the beginning of the drawing object will be placed.
* @param {EMU} nRowOffset - The offset from the nFromRow row to the upper part of the drawing object measured in English measure units.
*/
ApiShape.prototype.SetPosition = function(nFromCol, nColOffset, nFromRow, nRowOffset) {};

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
* Selects the current graphic object.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} [isReplace=false] - Specifies whether the selection should replace the current selection (true) or be added to it (false).
*/
ApiShape.prototype.Select = function(isReplace) {};

/**
* Removes the current drawing from the selection.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean} - Returns false if the drawing or controller is not available, otherwise returns true.
*/
ApiShape.prototype.Unselect = function() { return true; };

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
* Deletes the specified drawing object.
*
* @memberof ApiDrawing
* @returns {boolean} - returns false if the drawing object can not be deleted.
*
* @since 9.4.0
*/
ApiShape.prototype.Delete = function() { return true; };

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
* Returns the parent sheet of the current drawing.
* @memberof ApiDrawing
* @returns {?ApiWorksheet}
* @since 8.3.0
*/
ApiOleObject.prototype.GetParentSheet = function() { return new ApiWorksheet(); };

/**
* Sets a size of the object (image, shape, chart) bounding box.
* @memberof ApiDrawing
* @param {EMU} nWidth - The object width measured in English measure units.
* @param {EMU} nHeight - The object height measured in English measure units.
*/
ApiOleObject.prototype.SetSize = function(nWidth, nHeight) {};

/**
* Changes the position for the drawing object.
* <note>Please note that the horizontal and vertical offsets are calculated within the limits of
* the specified column and row cells only. If this value exceeds the cell width or height, another vertical/horizontal position will be set.</note>
* @memberof ApiDrawing
* @param {number} nFromCol - The number of the column where the beginning of the drawing object will be placed.
* @param {EMU} nColOffset - The offset from the nFromCol column to the left part of the drawing object measured in English measure units.
* @param {number} nFromRow - The number of the row where the beginning of the drawing object will be placed.
* @param {EMU} nRowOffset - The offset from the nFromRow row to the upper part of the drawing object measured in English measure units.
*/
ApiOleObject.prototype.SetPosition = function(nFromCol, nColOffset, nFromRow, nRowOffset) {};

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
* Selects the current graphic object.
* @memberof ApiDrawing
* @since 9.3.0
* @param {boolean} [isReplace=false] - Specifies whether the selection should replace the current selection (true) or be added to it (false).
*/
ApiOleObject.prototype.Select = function(isReplace) {};

/**
* Removes the current drawing from the selection.
* @memberof ApiDrawing
* @since 9.3.0
* @returns {boolean} - Returns false if the drawing or controller is not available, otherwise returns true.
*/
ApiOleObject.prototype.Unselect = function() { return true; };

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
* Deletes the specified drawing object.
*
* @memberof ApiDrawing
* @returns {boolean} - returns false if the drawing object can not be deleted.
*
* @since 9.4.0
*/
ApiOleObject.prototype.Delete = function() { return true; };

/**
* Returns a type of the ApiName class.
* @memberof ApiName
* @returns {string}
*/
ApiName.prototype.GetName = function() { return ""; };

/**
* Sets a string value representing the object name.
* @memberof ApiName
* @param {string} sName - New name for the range.
* @returns {boolean} - returns false if sName is invalid.
*/
ApiName.prototype.SetName = function(sName) { return true; };

/**
* Deletes the DefName object.
* @memberof ApiName
* @returns {boolean} - returns true if the name was deleted successfully.
*/
ApiName.prototype.Delete = function() { return true; };

/**
* Sets a formula that the name is defined to refer to.
* @memberof ApiName
* @param {string} sRef    - The range reference which must contain the sheet name, followed by sign ! and a range of cells.
* Example: "Sheet1!$A$1:$B$2".
* @returns {boolean} - returns true if the reference was set successfully.
*/
ApiName.prototype.SetRefersTo = function(sRef) { return true; };

/**
* Returns a formula that the name is defined to refer to.
* @memberof ApiName
* @returns {string}
*/
ApiName.prototype.GetRefersTo = function() { return ""; };

/**
* Returns the ApiRange object by its name.
* @memberof ApiName
* @returns {ApiRange}
*/
ApiName.prototype.GetRefersToRange = function() { return new ApiRange(); };

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
* @param {string} text - New text for comment.
* @since 7.5.0
*/
ApiComment.prototype.SetText = function(text) {};

/**
* Returns the current comment ID.
* @memberof ApiComment
* @returns {string}
* @since 7.5.0
*/
ApiComment.prototype.GetId = function() { return ""; };

/**
* Returns the comment author's name.
* @memberof ApiComment
* @returns {string}
* @since 7.5.0
*/
ApiComment.prototype.GetAuthorName = function() { return ""; };

/**
* Sets the comment author's name.
* @memberof ApiComment
* @param {string} sAuthorName - The comment author's name.
* @since 7.5.0
*/
ApiComment.prototype.SetAuthorName = function(sAuthorName) {};

/**
* Returns the user ID of the comment author.
* @memberof ApiComment
* @returns {string}
* @since 7.5.0
*/
ApiComment.prototype.GetUserId = function() { return ""; };

/**
* Sets the user ID to the comment author.
* @memberof ApiComment
* @param {string} sUserId - The user ID of the comment author.
* @since 7.5.0
*/
ApiComment.prototype.SetUserId = function(sUserId) {};

/**
* Checks if a comment is solved or not.
* @memberof ApiComment
* @returns {boolean}
* @since 7.5.0
*/
ApiComment.prototype.IsSolved = function() { return true; };

/**
* Marks a comment as solved.
* @memberof ApiComment
* @param {boolean} bSolved - Specifies if a comment is solved or not.
* @since 7.5.0
*/
ApiComment.prototype.SetSolved = function(bSolved) {};

/**
* Returns the timestamp of the comment creation in UTC format.
* @memberof ApiComment
* @returns {Number}
* @since 7.5.0
*/
ApiComment.prototype.GetTimeUTC = function() { return 0; };

/**
* Sets the timestamp of the comment creation in UTC format.
* @memberof ApiComment
* @param {Number | String} nTimeStamp - The timestamp of the comment creation in UTC format.
* @since 7.5.0
*/
ApiComment.prototype.SetTimeUTC = function(nTimeStamp) {};

/**
* Returns the timestamp of the comment creation in the current time zone format.
* @memberof ApiComment
* @returns {Number}
* @since 7.5.0
*/
ApiComment.prototype.GetTime = function() { return 0; };

/**
* Sets the timestamp of the comment creation in the current time zone format.
* @memberof ApiComment
* @param {Number | String} nTimeStamp - The timestamp of the comment creation in the current time zone format.
* @since 7.5.0
*/
ApiComment.prototype.SetTime = function(nTimeStamp) {};

/**
* Returns the quote text of the current comment.
* @memberof ApiComment
* @returns {String | null}
* @since 7.5.0
*/
ApiComment.prototype.GetQuoteText = function() { return ""; };

/**
* Returns a number of the comment replies.
* @memberof ApiComment
* @returns {Number?}
* @since 7.5.0
*/
ApiComment.prototype.GetRepliesCount = function() { return 0; };

/**
* Returns the specified comment reply.
* @memberof ApiComment
* @param {Number} [nIndex = 0] - The comment reply index.
* @returns {ApiCommentReply?}
* @since 7.5.0
*/
ApiComment.prototype.GetReply = function(nIndex) { return new ApiCommentReply(); };

/**
* Adds a reply to a comment.
* @memberof ApiComment
* @param {String} sText - The comment reply text (required).
* @param {String} sAuthorName - The name of the comment reply author (optional).
* @param {String} sUserId - The user ID of the comment reply author (optional).
* @param {Number} [nPos=this.GetRepliesCount()] - The comment reply position.
* @since 7.5.0
*/
ApiComment.prototype.AddReply = function(sText, sAuthorName, sUserId, nPos) {};

/**
* Removes the specified comment replies.
* @memberof ApiComment
* @param {Number} [nPos = 0] - The position of the first comment reply to remove.
* @param {Number} [nCount = 1] - A number of comment replies to remove.
* @param {boolean} [bRemoveAll = false] - Specifies whether to remove all comment replies or not.
* @since 7.5.0
*/
ApiComment.prototype.RemoveReplies = function(nPos, nCount, bRemoveAll) {};

/**
* Deletes the ApiComment object.
* @memberof ApiComment
* @returns {boolean} - returns true if the comment was deleted successfully.
*/
ApiComment.prototype.Delete = function() { return true; };

/**
* Returns a type of the ApiCommentReply class.
* @memberof ApiCommentReply
* @returns {"commentReply"}
* @since 7.5.0
*/
ApiCommentReply.prototype.GetClassType = function() { return ""; };

/**
* Returns the comment reply text.
* @memberof ApiCommentReply
* @returns {string}
* @since 7.5.0
*/
ApiCommentReply.prototype.GetText = function() { return ""; };

/**
* Sets the comment reply text.
* @memberof ApiCommentReply
* @param {string} sText - The comment reply text.
* @since 7.5.0
*/
ApiCommentReply.prototype.SetText = function(sText) {};

/**
* Returns the comment reply author's name.
* @memberof ApiCommentReply
* @returns {string}
* @since 7.5.0
*/
ApiCommentReply.prototype.GetAuthorName = function() { return ""; };

/**
* Sets the comment reply author's name.
* @memberof ApiCommentReply
* @param {string} sAuthorName - The comment reply author's name.
* @since 7.5.0
*/
ApiCommentReply.prototype.SetAuthorName = function(sAuthorName) {};

/**
* Returns the user ID of the comment reply author.
* @memberof ApiCommentReply
* @returns {string}
* @since 7.5.0
*/
ApiCommentReply.prototype.GetUserId = function() { return ""; };

/**
* Sets the user ID to the comment reply author.
* @memberof ApiCommentReply
* @param {string} sUserId - The user ID of the comment reply author.
* @since 7.5.0
*/
ApiCommentReply.prototype.SetUserId = function(sUserId) {};

/**
* Returns the timestamp of the comment reply creation in UTC format.
* @memberof ApiCommentReply
* @returns {Number}
* @since 7.5.0
*/
ApiCommentReply.prototype.GetTimeUTC = function() { return 0; };

/**
* Sets the timestamp of the comment reply creation in UTC format.
* @memberof ApiCommentReply
* @param {Number | String} nTimeStamp - The timestamp of the comment reply creation in UTC format.
* @since 7.5.0
*/
ApiCommentReply.prototype.SetTimeUTC = function(nTimeStamp) {};

/**
* Returns the timestamp of the comment reply creation in the current time zone format.
* @memberof ApiCommentReply
* @returns {Number}
* @since 7.5.0
*/
ApiCommentReply.prototype.GetTime = function() { return 0; };

/**
* Sets the timestamp of the comment reply creation in the current time zone format.
* @memberof ApiCommentReply
* @param {Number | String} nTimeStamp - The timestamp of the comment reply creation in the current time zone format.
* @since 7.5.0
*/
ApiCommentReply.prototype.SetTime = function(nTimeStamp) {};

/**
* Returns a value that represents the number of objects in the collection.
* @memberof ApiAreas
* @returns {number}
*/
ApiAreas.prototype.GetCount = function() { return 0; };

/**
* Returns a single object from a collection by its ID.
* @memberof ApiAreas
* @param {number} ind - The index number of the object.
* @returns {ApiRange}
*/
ApiAreas.prototype.GetItem = function(ind) { return new ApiRange(); };

/**
* Returns the parent object for the specified collection.
* @memberof ApiAreas
* @returns {number}
*/
ApiAreas.prototype.GetParent = function() { return 0; };

/**
* Returns a value that represents a number of objects in the collection.
* @memberof ApiCharacters
* @returns {number}
* @since 7.4.0
*/
ApiCharacters.prototype.GetCount = function() { return 0; };

/**
* Returns the parent object of the specified characters.
* @memberof ApiCharacters
* @returns {ApiRange}
* @since 7.4.0
*/
ApiCharacters.prototype.GetParent = function() { return new ApiRange(); };

/**
* Deletes the ApiCharacters object.
* @memberof ApiCharacters
* @since 7.4.0
*/
ApiCharacters.prototype.Delete = function() {};

/**
* Inserts a string replacing the specified characters.
* @memberof ApiCharacters
* @param {string} String - The string to insert.
* @since 7.4.0
*/
ApiCharacters.prototype.Insert = function(String) {};

/**
* Sets a string value that represents the text of the specified range of characters.
* @memberof ApiCharacters
* @param {string} Caption - A string value that represents the text of the specified range of characters.
* @since 7.4.0
*/
ApiCharacters.prototype.SetCaption = function(Caption) {};

/**
* Returns a string value that represents the text of the specified range of characters.
* @memberof ApiCharacters
* @returns {string} - A string value that represents the text of the specified range of characters.
* @since 7.4.0
*/
ApiCharacters.prototype.GetCaption = function() { return ""; };

/**
* Sets the text for the specified characters.
* @memberof ApiCharacters
* @param {string} Text - The text to be set.
* @since 7.4.0
*/
ApiCharacters.prototype.SetText = function(Text) {};

/**
* Returns the text of the specified range of characters.
* @memberof ApiCharacters
* @returns {string} - The text of the specified range of characters.
* @since 7.4.0
*/
ApiCharacters.prototype.GetText = function() { return ""; };

/**
* Returns the ApiFont object that represents the font of the specified characters.
* @memberof ApiCharacters
* @returns {ApiFont}
* @since 7.4.0
*/
ApiCharacters.prototype.GetFont = function() { return new ApiFont(); };

/**
* Returns a type of the ApiTheme class.
*
* @memberof ApiTheme
* @returns {"theme"}
* @since 9.1.0
*/
ApiTheme.prototype.GetClassType = function() { return ""; };

/**
* Returns the name of the theme.
*
* @memberof ApiTheme
* @returns {string} - The theme name.
* @since 9.1.0
*/
ApiTheme.prototype.GetName = function() { return ""; };

/**
* Returns the parent ApiCharacters object of the specified font.
* @memberof ApiFont
* @returns {ApiCharacters} - The parent ApiCharacters object.
* @since 7.4.0
*/
ApiFont.prototype.GetParent = function() { return new ApiCharacters(); };

/**
* Returns the bold property of the specified font.
* @memberof ApiFont
* @returns {boolean | null}
* @since 7.4.0
*/
ApiFont.prototype.GetBold = function() { return true; };

/**
* Sets the bold property to the specified font.
* <note>This method will work only with the text format of the cell.</note>
* @memberof ApiFont
* @param {boolean} isBold - Specifies that the text characters are displayed bold.
* @since 7.4.0
*/
ApiFont.prototype.SetBold = function(isBold) {};

/**
* Returns the italic property of the specified font.
* @memberof ApiFont
* @returns {boolean | null}
* @since 7.4.0
*/
ApiFont.prototype.GetItalic = function() { return true; };

/**
* Sets the italic property to the specified font.
* <note>This method will work only with the text format of the cell.</note>
* @memberof ApiFont
* @param {boolean} isItalic - Specifies that the text characters are displayed italic.
* @since 7.4.0
*/
ApiFont.prototype.SetItalic = function(isItalic) {};

/**
* Returns the font size property of the specified font.
* @memberof ApiFont
* @returns {number | null}
* @since 7.4.0
*/
ApiFont.prototype.GetSize = function() { return 0; };

/**
* Sets the font size property to the specified font.
* <note>This method will work only with the text format of the cell.</note>
* @memberof ApiFont
* @param {number} Size - Font size.
* @since 7.4.0
*/
ApiFont.prototype.SetSize = function(Size) {};

/**
* Returns the strikethrough property of the specified font.
* @memberof ApiFont
* @returns {boolean | null}
* @since 7.4.0
*/
ApiFont.prototype.GetStrikethrough = function() { return true; };

/**
* Sets the strikethrough property to the specified font.
* <note>This method will work only with the text format of the cell.</note>
* @memberof ApiFont
* @param {boolean} isStrikethrough - Specifies that the text characters are displayed strikethrough.
* @since 7.4.0
*/
ApiFont.prototype.SetStrikethrough = function(isStrikethrough) {};

/**
* Returns the type of underline applied to the specified font.
* @memberof ApiFont
* @returns {XlUnderlineStyle | null}
* @since 7.4.0
*/
ApiFont.prototype.GetUnderline = function() { return new XlUnderlineStyle(); };

/**
* Sets an underline of the type specified in the request to the current font.
* <note>This method will work only with the text format of the cell.</note>
* @memberof ApiFont
* @param {XlUnderlineStyle} Underline - Underline type.
* @since 7.4.0
*/
ApiFont.prototype.SetUnderline = function(Underline) {};

/**
* Returns the subscript property of the specified font.
* @memberof ApiFont
* @returns {boolean | null}
* @since 7.4.0
*/
ApiFont.prototype.GetSubscript = function() { return true; };

/**
* Sets the subscript property to the specified font.
* <note>This method will work only with the text format of the cell.</note>
* @memberof ApiFont
* @param {boolean} isSubscript - Specifies that the text characters are displayed subscript.
* @since 7.4.0
*/
ApiFont.prototype.SetSubscript = function(isSubscript) {};

/**
* Returns the superscript property of the specified font.
* @memberof ApiFont
* @returns {boolean | null}
* @since 7.4.0
*/
ApiFont.prototype.GetSuperscript = function() { return true; };

/**
* Sets the superscript property to the specified font.
* <note>This method will work only with the text format of the cell.</note>
* @memberof ApiFont
* @param {boolean} isSuperscript - Specifies that the text characters are displayed superscript.
* @since 7.4.0
*/
ApiFont.prototype.SetSuperscript = function(isSuperscript) {};

/**
* Returns the font name property of the specified font.
* @memberof ApiFont
* @returns {string | null}
* @since 7.4.0
*/
ApiFont.prototype.GetName = function() { return ""; };

/**
* Sets the font name property to the specified font.
* <note>This method will work only with the text format of the cell.</note>
* @memberof ApiFont
* @param {string} FontName - Font name.
* @since 7.4.0
*/
ApiFont.prototype.SetName = function(FontName) {};

/**
* Returns the font color property of the specified font.
* @memberof ApiFont
* @returns {ApiColor | null}
* @since 7.4.0
*/
ApiFont.prototype.GetColor = function() { return new ApiColor(); };

/**
* Sets the font color property to the specified font.
* <note>This method will work only with the text format of the cell.</note>
* @memberof ApiFont
* @param {ApiColor} Color - Font color.
* @since 7.4.0
*/
ApiFont.prototype.SetColor = function(Color) {};

/**
* Sets the frozen cells in the active worksheet view. The range provided corresponds to the cells that will be frozen in the top- and left-most pane.
* @memberof ApiFreezePanes
* @param {ApiRange | String} frozenRange - A range that represents the cells to be frozen.
* @since 8.0.0
*/
ApiFreezePanes.prototype.FreezeAt = function(frozenRange) {};

/**
* Freezes the first column or columns of the current worksheet.
* @memberof ApiFreezePanes
* @param {Number?} [count=0] - Optional number of columns to freeze, or zero to unfreeze all columns.
* @since 8.0.0
*/
ApiFreezePanes.prototype.FreezeColumns = function(count) {};

/**
* Freezes the top row or rows of the current worksheet.
* @memberof ApiFreezePanes
* @param {Number?} [count=0] - Optional number of rows to freeze, or zero to unfreeze all rows.
* @since 8.0.0
*/
ApiFreezePanes.prototype.FreezeRows = function(count) {};

/**
* Returns a range that describes the frozen cells in the active worksheet view.
* @memberof ApiFreezePanes
* @returns {ApiRange | null} - Returns null if there is no frozen pane.
* @since 8.0.0
*/
ApiFreezePanes.prototype.GetLocation = function() { return new ApiRange(); };

/**
* Removes all frozen panes in the current worksheet.
* @memberof ApiFreezePanes
* @since 8.0.0
*/
ApiFreezePanes.prototype.Unfreeze = function() {};

/**
* Sets a title to the current protected range.
* @memberof ApiProtectedRange
* @param {string} sTitle - The title which will be displayed for the current protected range.
* @returns {boolean} - Returns false if a user doesn't have permission to modify the protected range.
* @since 8.1.0
*/
ApiProtectedRange.prototype.SetTitle = function(sTitle) { return true; };

/**
* Sets a range to the current protected range.
* @memberof ApiProtectedRange
* @param {string} sRange - The cell range which will be set for the current protected range.
* @returns {boolean} - Returns false if a user doesn't have permission to modify the protected range.
* @since 8.1.0
*/
ApiProtectedRange.prototype.SetRange = function(sRange) { return true; };

/**
* Sets a user to the current protected range.
* @memberof ApiProtectedRange
* @param {string} sId - The user ID.
* @param {string} sName - The user name.
* @param {ProtectedRangeUserType} protectedRangeUserType - The user type of the protected range.
* @returns {ApiProtectedRangeUserInfo | null} - Returns null if a user doesn't have permission to modify the protected range.
* @since 8.1.0
*/
ApiProtectedRange.prototype.AddUser = function(sId, sName, protectedRangeUserType) { return new ApiProtectedRangeUserInfo(); };

/**
* Removes a user from the current protected range.
* @memberof ApiProtectedRange
* @param {string} sId - The user ID.
* @returns {boolean}
* @since 8.1.0
*/
ApiProtectedRange.prototype.DeleteUser = function(sId) { return true; };

/**
* Returns all users from the current protected range.
* @memberof ApiProtectedRange
* @returns {ApiProtectedRangeUserInfo[] | null}
* @since 8.1.0
*/
ApiProtectedRange.prototype.GetAllUsers = function() { return []; };

/**
* Sets the type of the "Anyone" user to the current protected range.
* @memberof ApiProtectedRange
* @param {ProtectedRangeUserType} protectedRangeUserType - The user type of the protected range.
* @returns {boolean}
* @since 8.1.0
*/
ApiProtectedRange.prototype.SetAnyoneType = function(protectedRangeUserType) { return true; };

/**
* Returns an object that represents a user from the current protected range.
* @memberof ApiProtectedRange
* @param {string} sId - The user ID.
* @returns {ApiProtectedRangeUserInfo | null}
* @since 8.1.0
*/
ApiProtectedRange.prototype.GetUser = function(sId) { return new ApiProtectedRangeUserInfo(); };

/**
* Returns the name property of the current user's information.
* @memberof ApiProtectedRangeUserInfo
* @returns {string | null}
* @since 8.1.0
*/
ApiProtectedRangeUserInfo.prototype.GetName = function() { return ""; };

/**
* Returns the type property of the current user's information.
* @memberof ApiProtectedRangeUserInfo
* @returns {ProtectedRangeUserType}
* @since 8.1.0
*/
ApiProtectedRangeUserInfo.prototype.GetType = function() { return new ProtectedRangeUserType(); };

/**
* Returns the ID property of the current user's information.
* @memberof ApiProtectedRangeUserInfo
* @returns {string | null}
* @since 8.1.0
*/
ApiProtectedRangeUserInfo.prototype.GetId = function() { return ""; };

/**
* Adds a data field to the pivot table report.
* @memberof ApiPivotTable
* @param {number | string} field - The index number or name of the data field.
* @returns {ApiPivotDataField}
* @since 8.2.0
*/
ApiPivotTable.prototype.AddDataField = function(field) { return new ApiPivotDataField(); };

/**
* Adds the row, column, and page fields to the pivot table report.
* @memberof ApiPivotTable
* @param {PivotTableFieldOptions} options - The settings for adding row, column, and page fields to the pivot table report.
* @since 8.2.0
*/
ApiPivotTable.prototype.AddFields = function(options) {};

/**
* Deletes all filters currently applied to the pivot table.
* @memberof ApiPivotTable
* @since 8.2.0
*/
ApiPivotTable.prototype.ClearAllFilters = function() {};

/**
* Clears the pivot table.
* @memberof ApiPivotTable
* @since 8.2.0
*/
ApiPivotTable.prototype.ClearTable = function() {};

/**
* Returns the value for the data field in a pivot table.
* @memberof ApiPivotTable
* @param {string[]} items - Describes a single cell in the pivot table report.
* For example, "'Estimated Costs' Tables May", which shows the estimated costs for tables in May
* (Data field = Costs, Product = Tables, Month = May).
* @returns {number | null}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetData = function(items) { return 0; };

/**
* Returns a Range object with information about a data item in the pivot table report.
* @memberof ApiPivotTable
* @param {string} [dataField] - The name of the field containing the data for the PivotTable.
* @param {string[]} [fieldItemsArray] - An array of field items from the pivot table.
* @returns {ApiRange}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetPivotData = function(dataField, fieldItemsArray) { return new ApiRange(); };

/**
* Returns a collection that represents either a single pivot table field
* or a collection of both the visible and hidden fields in the pivot table report.
* @memberof ApiPivotTable
* @param {string | number} [field] - The name or index of the field to be returned.
* @returns {ApiPivotField[] | ApiPivotField | ApiPivotDataField | null}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetPivotFields = function(field) { return []; };

/**
* Returns the value of a pivot table cell.
* @memberof ApiPivotTable
* @param {number} rowLine - The position of the pivot line (a line of rows in the pivot table) on the row area.
* @param {number} colLine - The position of the pivot line (a line of columns in the pivot table) on the column area.
* @returns {number | string | null}
* @since 8.2.0
*/
ApiPivotTable.prototype.PivotValueCell = function(rowLine, colLine) { return 0; };

/**
* Shows details of the pivot table cell.
* @memberof ApiPivotTable
* @param {number} rowLine - The position of the pivot line (a line of rows in the pivot table) on the row area.
* @param {number} colLine - The position of the pivot line (a line of columns in the pivot table) on the column area.
* @returns {boolean} - Returns true if the operation is successful.
* @since 8.2.0
*/
ApiPivotTable.prototype.ShowDetails = function(rowLine, colLine) { return true; };

/**
* Refreshes the pivot table report from the source data.
* @memberof ApiPivotTable
* @since 8.2.0
*/
ApiPivotTable.prototype.RefreshTable = function() {};

/**
* Updates the current pivot table.
* @memberof ApiPivotTable
* @since 8.2.0
*/
ApiPivotTable.prototype.Update = function() {};

/**
* Specifies whether to repeat item labels for all pivot fields in the specified pivot table.
* @memberof ApiPivotTable
* @param {boolean} repeat - Specifies whether to repeat all field item labels in a pivot table report.
* @since 8.2.0
*/
ApiPivotTable.prototype.SetRepeatAllLabels = function(repeat) {};

/**
* Sets the way the specified pivot table items appear — in table format or in outline format.
* @memberof ApiPivotTable
* @param {PivotLayoutType} type - The layout type of the pivot table report.
* @param {boolean} compact - Specifies whether the pivot table items will be displayed in the compact form.
* @since 8.2.0
*/
ApiPivotTable.prototype.SetRowAxisLayout = function(type, compact) {};

/**
* Sets the layout subtotal location in the pivot table.
* @memberof ApiPivotTable
* @param {PivotSubtotalLayoutType} type - The type of the pivot table subtotal layout.
* @since 8.2.0
*/
ApiPivotTable.prototype.SetSubtotalLocation = function(type) {};

/**
* Removes the specified field from all the pivot table categories.
* @memberof ApiPivotTable
* @param {number | string} identifier - The index number or name of the field.
* @since 8.2.0
*/
ApiPivotTable.prototype.RemoveField = function(identifier) {};

/**
* Moves the specified field from one category to another.
* @memberof ApiPivotTable
* @param {number | string} identifier - The index number or name of the field.
* @param {PivotMoveFieldType | PivotFieldOrientationType} type - The direction to move the pivot table field,
* or the pivot field orientation type.
* @param {number} [index] - The field index in a new category.
* @since 8.2.0
*/
ApiPivotTable.prototype.MoveField = function(identifier, type, index) {};

/**
* Selects the current pivot table.
* @memberof ApiPivotTable
* @since 8.2.0
*/
ApiPivotTable.prototype.Select = function() {};

/**
* Returns a collection that is currently displayed as column fields in the pivot table.
* @memberof ApiPivotTable
* @param {number | string | undefined} field - The name or index of the field to be returned.
* @returns {ApiPivotField[]}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetColumnFields = function(field) { return []; };

/**
* Returns a collection that represents either a single pivot table data field
* or a collection of all visible data fields.
* @memberof ApiPivotTable
* @param {number | string |undefined} field - The name or index of the field to be returned.
* @returns {ApiPivotDataField[] | ApiPivotDataField | null}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetDataFields = function(field) { return []; };

/**
* Returns an array that represents all the hidden fields in the pivot table.
* @memberof ApiPivotTable
* @returns {ApiPivotField[]}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetHiddenFields = function() { return []; };

/**
* Returns an array that represents all the visible fields in the pivot table.
* @memberof ApiPivotTable
* @returns {ApiPivotField[]}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetVisibleFields = function() { return []; };

/**
* Returns a collection that represents either a single pivot table page field
* or a collection of all visible page fields.
* @memberof ApiPivotTable
* @param {number | string |undefined} field - The name or index of the field to be returned.
* @returns {ApiPivotField[]}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetPageFields = function(field) { return []; };

/**
* Returns a collection that is currently displayed as row fields in the pivot table.
* @memberof ApiPivotTable
* @param {number | string |undefined} field - The name or index of the field to be returned.
* @returns {ApiPivotField[]}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetRowFields = function(field) { return []; };

/**
* Returns the pivot table name.
* @memberof ApiPivotTable
* @returns {string}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetName = function() { return ""; };

/**
* Sets the pivot table name.
* @memberof ApiPivotTable
* @param {string} name - The pivot table name.
* @since 8.2.0
*/
ApiPivotTable.prototype.SetName = function(name) {};

/**
* Returns the <b>Grand Totals</b> setting of the pivot table columns.
* @memberof ApiPivotTable
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetColumnGrand = function() { return true; };

/**
* Sets the <b>Grand Totals</b> setting to the pivot table columns.
* @memberof ApiPivotTable
* @param {boolean} show - Specifies whether to display the grand totals for columns.
* @since 8.2.0
*/
ApiPivotTable.prototype.SetColumnGrand = function(show) {};

/**
* Returns the <b>Grand Totals</b> setting of the pivot table rows.
* @memberof ApiPivotTable
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetRowGrand = function() { return true; };

/**
* Sets the <b>Grand Totals</b> setting to the pivot table rows.
* @memberof ApiPivotTable
* @param {boolean} show - Specifies whether to display the grand totals for rows.
* @since 8.2.0
*/
ApiPivotTable.prototype.SetRowGrand = function(show) {};

/**
* Returns the pivot table display fields in the report filter area settings.
* @memberof ApiPivotTable
* @returns {PivotTableFilterAreaInfo}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetDisplayFieldsInReportFilterArea = function() { return new PivotTableFilterAreaInfo(); };

/**
* Sets the pivot table display fields in the report filter area settings.
* @memberof ApiPivotTable
* @param {FieldsInReportFilterType} type - Specifies how the report filter fields are located.
* @param {number} fields - A number of the report filter fields.
* @since 8.2.0
*/
ApiPivotTable.prototype.SetDisplayFieldsInReportFilterArea = function(type, fields) {};

/**
* Returns the setting which specifies whether to display field headers for rows and columns.
* @memberof ApiPivotTable
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetDisplayFieldCaptions = function() { return true; };

/**
* Sets whether to display field headers for rows and columns.
* @memberof ApiPivotTable
* @param {boolean} show - Specifies whether to display field headers for rows and columns.
* @since 8.2.0
*/
ApiPivotTable.prototype.SetDisplayFieldCaptions = function(show) {};

/**
* Returns the pivot table title.
* @memberof ApiPivotTable
* @returns {string}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetTitle = function() { return ""; };

/**
* Sets the pivot table title.
* @memberof ApiPivotTable
* @param {string} title - The pivot table title.
* @since 8.2.0
*/
ApiPivotTable.prototype.SetTitle = function(title) {};

/**
* Returns the pivot table description.
* @memberof ApiPivotTable
* @returns {string}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetDescription = function() { return ""; };

/**
* Sets the pivot table description.
* @memberof ApiPivotTable
* @param {string} description - The pivot table description.
* @since 8.2.0
*/
ApiPivotTable.prototype.SetDescription = function(description) {};

/**
* Returns the pivot table style name.
* @memberof ApiPivotTable
* @returns {string}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetStyleName = function() { return ""; };

/**
* Sets the pivot table style name.
* @memberof ApiPivotTable
* @param {string} name - The pivot table style name.
* @since 8.2.0
*/
ApiPivotTable.prototype.SetStyleName = function(name) {};

/**
* Returns the setting which specifies whether the row headers of the pivot table will be highlighted with the special formatting.
* @memberof ApiPivotTable
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetTableStyleRowHeaders = function() { return true; };

/**
* Sets the setting which specifies whether the row headers of the pivot table will be highlighted with the special formatting.
* @memberof ApiPivotTable
* @param {boolean} show - Specifies whether the row headers of the pivot table will be highlighted with the special formatting.
* @since 8.2.0
*/
ApiPivotTable.prototype.SetTableStyleRowHeaders = function(show) {};

/**
* Returns the setting which specifies whether the column headers of the pivot table will be highlighted with the special formatting.
* @memberof ApiPivotTable
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetTableStyleColumnHeaders = function() { return true; };

/**
* Sets the setting which specifies whether the column headers of the pivot table will be highlighted with the special formatting.
* @memberof ApiPivotTable
* @param {boolean} show - Specifies whether the column headers of the pivot table will be highlighted with the special formatting.
* @since 8.2.0
*/
ApiPivotTable.prototype.SetTableStyleColumnHeaders = function(show) {};

/**
* Returns the setting which specifies whether the background color alternation for odd and even rows will be enabled for the pivot table.
* @memberof ApiPivotTable
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetTableStyleRowStripes = function() { return true; };

/**
* Sets the setting which specifies whether the background color alternation for odd and even rows will be enabled for the pivot table.
* @memberof ApiPivotTable
* @param {boolean} show - Specifies whether the background color alternation for odd and even rows will be enabled for the pivot table.
* @since 8.2.0
*/
ApiPivotTable.prototype.SetTableStyleRowStripes = function(show) {};

/**
* Returns the setting which specifies whether the background color alternation for odd and even columns will be enabled for the pivot table.
* @memberof ApiPivotTable
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetTableStyleColumnStripes = function() { return true; };

/**
* Sets the setting which specifies whether the background color alternation for odd and even columns will be enabled for the pivot table.
* @memberof ApiPivotTable
* @param {boolean} show - Specifies whether the background color alternation for odd and even columns will be enabled for the pivot table.
* @since 8.2.0
*/
ApiPivotTable.prototype.SetTableStyleColumnStripes = function(show) {};

/**
* Returns the source range for the pivot table.
* @memberof ApiPivotTable
* @returns {ApiRange}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetSource = function() { return new ApiRange(); };

/**
* Sets the source range for the pivot table.
* @memberof ApiPivotTable
* @param {ApiRange} source - The range where the pivot table will be located.
* @since 8.2.0
*/
ApiPivotTable.prototype.SetSource = function(source) {};

/**
* Returns a Range object that represents the column area in the pivot table report.
* @memberof ApiPivotTable
* @returns {ApiRange | null}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetColumnRange = function() { return new ApiRange(); };

/**
* Returns a Range object that represents the row area in the pivot table report.
* @memberof ApiPivotTable
* @returns {ApiRange | null}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetRowRange = function() { return new ApiRange(); };

/**
* Returns a Range object that represents the range of values in the pivot table.
* @memberof ApiPivotTable
* @returns {ApiRange}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetDataBodyRange = function() { return new ApiRange(); };

/**
* Returns a Range object that represents the entire pivot table report, but doesn't include page fields.
* @memberof ApiPivotTable
* @returns {ApiRange | null}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetTableRange1 = function() { return new ApiRange(); };

/**
* Returns a Range object that represents the entire pivot table report, including page fields.
* @memberof ApiPivotTable
* @returns {ApiRange | null}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetTableRange2 = function() { return new ApiRange(); };

/**
* Returns the text string label that is displayed in the grand total column or row heading in the specified pivot table report.
* @memberof ApiPivotTable
* @returns {string}
* @since 8.2.0
*/
ApiPivotTable.prototype.GetGrandTotalName = function() { return ""; };

/**
* Sets the text string label that is displayed in the grand total column or row heading in the specified pivot table report.
* @memberof ApiPivotTable
* @param {string} name - The grand total name.
* @since 8.2.0
*/
ApiPivotTable.prototype.SetGrandTotalName = function(name) {};

/**
* Sets the setting which specifies whether to insert blank rows after each item.
* @memberof ApiPivotTable
* @param {boolean} insert - Specifies whether to insert blank rows after each item.
* @since 8.2.0
*/
ApiPivotTable.prototype.SetLayoutBlankLine = function(insert) {};

/**
* Sets the setting which specifies whether to show subtotals.
* @memberof ApiPivotTable
* @param {boolean} show - Specifies whether to show subtotals.
* @since 8.2.0
*/
ApiPivotTable.prototype.SetLayoutSubtotals = function(show) {};

/**
* Returns the parent object for the current pivot table.
* @memberof ApiPivotTable
* @returns {ApiWorksheet} - The parent object for the current pivot table.
* @since 8.2.0
*/
ApiPivotTable.prototype.GetParent = function() { return new ApiWorksheet(); };

/**
* Removes  the current data field from the category.
* @memberof ApiPivotDataField
* @since 8.2.0
*/
ApiPivotDataField.prototype.Remove = function() {};

/**
* Moves the current data field inside the category.
* @memberof ApiPivotDataField
* @param {PivotMoveFieldType | PivotFieldOrientationType} type - The direction to move the pivot table field,
* or the pivot field orientation type.
* @param {number} [index] - The index of the data field in a new category.
* @since 8.2.0
*/
ApiPivotDataField.prototype.Move = function(type, index) {};

/**
* Sets a function to the current data field.
* @memberof ApiPivotDataField
* @param {DataConsolidateFunctionType} func - The function to perform in the added data field.
* @since 8.2.0
*/
ApiPivotDataField.prototype.SetFunction = function(func) {};

/**
* Returns a function performed in the data field.
* @memberof ApiPivotDataField
* @returns {DataConsolidateFunctionType} func - The function performed in the added data field.
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetFunction = function() { return new DataConsolidateFunctionType(); };

/**
* Returns a value that represents the data field position within a category.
* @memberof ApiPivotDataField
* @returns {number}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetPosition = function() { return 0; };

/**
* Sets a value that represents the data field position within a category.
* @memberof ApiPivotDataField
* @param {number} position - The data field position.
* @since 8.2.0
*/
ApiPivotDataField.prototype.SetPosition = function(position) {};

/**
* Returns a data field orientation value that represents the data field location in the specified pivot table report.
* @memberof ApiPivotDataField
* @returns {PivotFieldOrientationType}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetOrientation = function() { return new PivotFieldOrientationType(); };

/**
* Returns a value representing the name of the specified data field in the pivot table report.
* @memberof ApiPivotDataField
* @returns {string}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetValue = function() { return ""; };

/**
* Sets a value representing the name of the specified data field in the pivot table report.
* @memberof ApiPivotDataField
* @param {string} name - The name of the specified field in the pivot table report.
* @since 8.2.0
*/
ApiPivotDataField.prototype.SetValue = function(name) {};

/**
* Returns a value that represents the label text for the data field.
* @memberof ApiPivotDataField
* @returns {string}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetCaption = function() { return ""; };

/**
* Sets a value that represents the label text for the data field.
* @memberof ApiPivotDataField
* @param {string} caption - The label text for the data field.
* @since 8.2.0
*/
ApiPivotDataField.prototype.SetCaption = function(caption) {};

/**
* Returns a value representing the object name.
* @memberof ApiPivotDataField
* @returns {string}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetName = function() { return ""; };

/**
* Sets a value representing the object name.
* @memberof ApiPivotDataField
* @param {string} name - The object name.
* @since 8.2.0
*/
ApiPivotDataField.prototype.SetName = function(name) {};

/**
* Returns a value that represents the format code for the object.
* @memberof ApiPivotDataField
* @returns {string | null}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetNumberFormat = function() { return ""; };

/**
* Sets a value that represents the format code for the object.
* @memberof ApiPivotDataField
* @param {string} format - The format code for the object.
* @since 8.2.0
*/
ApiPivotDataField.prototype.SetNumberFormat = function(format) {};

/**
* Returns an index of the data field.
* @memberof ApiPivotDataField
* @returns {number}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetIndex = function() { return 0; };

/**
* Returns the pivot field from which the data field was created.
* @memberof ApiPivotDataField
* @returns {ApiPivotField}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetPivotField = function() { return new ApiPivotField(); };

/**
* Deletes all filters currently applied to the pivot field.
* @memberof ApiPivotField
* @since 8.2.0
*/
ApiPivotDataField.prototype.ClearAllFilters = function() {};

/**
* Deletes all label filters or all date filters from the pivot filters collection.
* @memberof ApiPivotField
* @since 8.2.0
*/
ApiPivotDataField.prototype.ClearLabelFilters = function() {};

/**
* Deletes all manual filters from the pivot filters collection.
* @memberof ApiPivotField
* @since 8.2.0
*/
ApiPivotDataField.prototype.ClearManualFilters = function() {};

/**
* Deletes all value filters from the pivot filters collection.
* @memberof ApiPivotField
* @since 8.2.0
*/
ApiPivotDataField.prototype.ClearValueFilters = function() {};

/**
* Returns an object that represents either a single pivot table item (the ApiPivotItem object)
* or a collection of all the visible and hidden items (an array of the ApiPivotItem objects) in the specified field.
* @memberof ApiPivotField
* @param {number} [index] - The item index.
* @returns {ApiPivotItem[] | ApiPivotItem | null}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetPivotItems = function(index) { return []; };

/**
* Sets a pivot field orientation value that represents the location
* of the field in the specified pivot table report.
* @memberof ApiPivotField
* @param {PivotFieldOrientationType} type - The pivot field orientation type.
* @since 8.2.0
*/
ApiPivotDataField.prototype.SetOrientation = function(type) {};

/**
* Returns a source name for the pivot table field.
* @memberof ApiPivotField
* @returns {string}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetSourceName = function() { return ""; };

/**
* Returns the ApiPivotTable object which represents the pivot table for the current field.
* @memberof ApiPivotField
* @returns {ApiPivotTable}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetTable = function() { return new ApiPivotTable(); };

/**
* Returns the parent object for the current field.
* @memberof ApiPivotField
* @returns {ApiPivotTable}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetParent = function() { return new ApiPivotTable(); };

/**
* Returns the setting which specifies whether a pivot table field is compacted.
* @memberof ApiPivotField
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetLayoutCompactRow = function() { return true; };

/**
* Sets the setting which specifies whether a pivot table field is compacted.
* @memberof ApiPivotField
* @param {boolean} compact - Specifies whether a pivot table field is compacted.
* @since 8.2.0
*/
ApiPivotDataField.prototype.SetLayoutCompactRow = function(compact) {};

/**
* Returns the way the specified pivot table items appear — in table format or in outline format.
* @memberof ApiPivotField
* @returns {PivotLayoutType}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetLayoutForm = function() { return new PivotLayoutType(); };

/**
* Sets the way the specified pivot table items appear — in table format or in outline format.
* @memberof ApiPivotField
* @param {PivotLayoutType} type - The layout type of the pivot table report.
* @since 8.2.0
*/
ApiPivotDataField.prototype.SetLayoutForm = function(type) {};

/**
* Returns the setting which specifies whether to insert a page break after each field.
* @memberof ApiPivotField
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetLayoutPageBreak = function() { return true; };

/**
* Sets the setting which specifies whether to insert a page break after each field.
* @memberof ApiPivotField
* @param {boolean} insert - Specifies whether to insert a page break after each field.
* @since 8.2.0
*/
ApiPivotDataField.prototype.SetLayoutPageBreak = function(insert) {};

/**
* Returns the setting which specifies whether the pivot table field is currently visible in the pivot table.
* @memberof ApiPivotField
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetShowingInAxis = function() { return true; };

/**
* Returns the setting which specifies whether to repeat items labels at each row.
* @memberof ApiPivotField
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetRepeatLabels = function() { return true; };

/**
* Sets the setting which specifies whether to repeat items labels at each row.
* @memberof ApiPivotField
* @param {boolean} repeat - Specifies whether to repeat items labels at each row.
* @since 8.2.0
*/
ApiPivotDataField.prototype.SetRepeatLabels = function(repeat) {};

/**
* Returns the setting which specifies whether to insert blank rows after each item.
* @memberof ApiPivotField
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetLayoutBlankLine = function() { return true; };

/**
* Sets the setting which specifies whether to insert blank rows after each item.
* @memberof ApiPivotField
* @param {boolean} insert - Specifies whether to insert blank rows after each item.
* @since 8.2.0
*/
ApiPivotDataField.prototype.SetLayoutBlankLine = function(insert) {};

/**
* Returns the setting which specifies whether to show items with no data.
* @memberof ApiPivotField
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetShowAllItems = function() { return true; };

/**
* Sets the setting which specifies whether to show items with no data.
* @memberof ApiPivotField
* @param {boolean} show - Specifies whether to show items with no data.
* @since 8.2.0
*/
ApiPivotDataField.prototype.SetShowAllItems = function(show) {};

/**
* Returns the setting which specifies whether to show subtotals.
* @memberof ApiPivotField
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetLayoutSubtotals = function() { return true; };

/**
* Sets the setting which specifies whether to show subtotals.
* @memberof ApiPivotField
* @param {boolean} show - Specifies whether to show subtotals.
* @since 8.2.0
*/
ApiPivotDataField.prototype.SetLayoutSubtotals = function(show) {};

/**
* Returns the layout subtotal location.
* @memberof ApiPivotField
* @returns {LayoutSubtotalLocationType}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetLayoutSubtotalLocation = function() { return new LayoutSubtotalLocationType(); };

/**
* Sets the layout subtotal location.
* @memberof ApiPivotField
* @param {LayoutSubtotalLocationType} type - The layout subtotal location.
* @since 8.2.0
*/
ApiPivotDataField.prototype.SetLayoutSubtotalLocation = function(type) {};

/**
* Returns the text label displayed in the subtotal column or row heading in the specified pivot table report.
* @memberof ApiPivotField
* @returns {string}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetSubtotalName = function() { return ""; };

/**
* Sets the text label displayed in the subtotal column or row heading in the specified pivot table report.
* @memberof ApiPivotField
* @param {string} caption - The text label displayed in the subtotal column or row heading.
* @since 8.2.0
*/
ApiPivotDataField.prototype.SetSubtotalName = function(caption) {};

/**
* Returns an object that represents all subtotals.
* @memberof ApiPivotField
* @returns {PivotFieldSubtotals}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetSubtotals = function() { return new PivotFieldSubtotals(); };

/**
* Sets an object that represents all subtotals.
* @memberof ApiPivotField
* @param {PivotFieldSubtotals} subtotals - An object that represents all subtotals or some of them.
* @since 8.2.0
*/
ApiPivotDataField.prototype.SetSubtotals = function(subtotals) {};

/**
* Returns the setting which specifies whether the specified field can be dragged to the column position.
* @memberof ApiPivotField
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetDragToColumn = function() { return true; };

/**
* Sets the setting which specifies whether the specified field can be dragged to the column position.
* @memberof ApiPivotField
* @param {boolean} flag - Specifies whether the specified field can be dragged to the column position.
* @since 8.2.0
*/
ApiPivotDataField.prototype.SetDragToColumn = function(flag) {};

/**
* Returns the setting which specifies whether the specified field can be dragged to the row position.
* @memberof ApiPivotField
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetDragToRow = function() { return true; };

/**
* Sets the setting which specifies whether the specified field can be dragged to the row position.
* @memberof ApiPivotField
* @param {boolean} flag - Specifies whether the specified field can be dragged to the row position.
* @since 8.2.0
*/
ApiPivotDataField.prototype.SetDragToRow = function(flag) {};

/**
* Returns the setting which specifies whether the specified field can be dragged to the data position.
* @memberof ApiPivotField
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetDragToData = function() { return true; };

/**
* Sets the setting which specifies whether the specified field can be dragged to the data position.
* @memberof ApiPivotField
* @param {boolean} flag - Specifies whether the specified field can be dragged to the data position.
* @since 8.2.0
*/
ApiPivotDataField.prototype.SetDragToData = function(flag) {};

/**
* Returns the setting which specifies whether the specified field can be dragged to the page position.
* @memberof ApiPivotField
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetDragToPage = function() { return true; };

/**
* Sets the setting which specifies whether the specified field can be dragged to the page position.
* @memberof ApiPivotField
* @param {boolean} flag - Specifies whether the specified field can be dragged to the page position.
* @since 8.2.0
*/
ApiPivotDataField.prototype.SetDragToPage = function(flag) {};

/**
* Returns the current page which is displayed for the page field (valid only for page fields).
* @memberof ApiPivotField
* @returns {string | number}
* @since 8.2.0
*/
ApiPivotDataField.prototype.GetCurrentPage = function() { return ""; };

/**
* Returns the collection of pivot filters applied to the specified pivot field.
* @memberof ApiPivotField
* @returns {ApiPivotFilters}
* @since 9.1.0
*/
ApiPivotDataField.prototype.GetPivotFilters = function() { return new ApiPivotFilters(); };

/**
* Establishes automatic field-sorting rules for the pivot table reports.
* @memberof ApiPivotField
* @param {SortOrder} order - The sort order.
* @param {string} field - The name of the field to sort by (pivotField.SourceName, pivotField.Name, dataField.Name).
* @since 9.1.0
*/
ApiPivotDataField.prototype.AutoSort = function(order, field) {};

/**
* Deletes all filters currently applied to the pivot field.
* @memberof ApiPivotField
* @since 8.2.0
*/
ApiPivotField.prototype.ClearAllFilters = function() {};

/**
* Deletes all label filters or all date filters from the pivot filters collection.
* @memberof ApiPivotField
* @since 8.2.0
*/
ApiPivotField.prototype.ClearLabelFilters = function() {};

/**
* Deletes all manual filters from the pivot filters collection.
* @memberof ApiPivotField
* @since 8.2.0
*/
ApiPivotField.prototype.ClearManualFilters = function() {};

/**
* Deletes all value filters from the pivot filters collection.
* @memberof ApiPivotField
* @since 8.2.0
*/
ApiPivotField.prototype.ClearValueFilters = function() {};

/**
* Returns an object that represents either a single pivot table item (the ApiPivotItem object)
* or a collection of all the visible and hidden items (an array of the ApiPivotItem objects) in the specified field.
* @memberof ApiPivotField
* @param {number} [index] - The item index.
* @returns {ApiPivotItem[] | ApiPivotItem | null}
* @since 8.2.0
*/
ApiPivotField.prototype.GetPivotItems = function(index) { return []; };

/**
* Moves the current pivot field inside the category.
* @memberof ApiPivotField
* @param {PivotMoveFieldType | PivotFieldOrientationType} type - The direction to move the pivot table field,
* or the pivot field orientation type.
* @param {number | undefined} index - The field index in a new category.
* @since 8.2.0
*/
ApiPivotField.prototype.Move = function(type, index) {};

/**
* Removes the current pivot field from the pivot table.
* @memberof ApiPivotField
* @since 8.2.0
*/
ApiPivotField.prototype.Remove = function() {};

/**
* Returns a value that represents the position of the field (first, second, third, and so on)
* among all the fields in its orientation (Rows, Columns, Pages, Data).
* @memberof ApiPivotField
* @returns {number}
* @since 8.2.0
*/
ApiPivotField.prototype.GetPosition = function() { return 0; };

/**
* Sets a value that represents the position of the field (first, second, third, and so on)
* among all the fields in its orientation (Rows, Columns, Pages, Data).
* @memberof ApiPivotField
* @param {number} position - The field position.
* @since 8.2.0
*/
ApiPivotField.prototype.SetPosition = function(position) {};

/**
* Returns a pivot field orientation value that represents the location
* of the field in the specified pivot table report.
* @memberof ApiPivotField
* @returns {PivotFieldOrientationType}
* @since 8.2.0
*/
ApiPivotField.prototype.GetOrientation = function() { return new PivotFieldOrientationType(); };

/**
* Sets a pivot field orientation value that represents the location
* of the field in the specified pivot table report.
* @memberof ApiPivotField
* @param {PivotFieldOrientationType} type - The pivot field orientation type.
* @since 8.2.0
*/
ApiPivotField.prototype.SetOrientation = function(type) {};

/**
* Returns a value representing the name of the specified field in the pivot table report.
* @memberof ApiPivotField
* @returns {string}
* @since 8.2.0
*/
ApiPivotField.prototype.GetValue = function() { return ""; };

/**
* Sets a value representing the name of the specified field in the pivot table report.
* @memberof ApiPivotField
* @param {string} name - The name of the specified field in the pivot table report.
* @since 8.2.0
*/
ApiPivotField.prototype.SetValue = function(name) {};

/**
* Returns a value that represents the label text for the pivot field.
* @memberof ApiPivotField
* @returns {string}
* @since 8.2.0
*/
ApiPivotField.prototype.GetCaption = function() { return ""; };

/**
* Sets a value that represents the label text for the pivot field.
* @memberof ApiPivotField
* @param {string} caption - The label text for the pivot field.
* @since 8.2.0
*/
ApiPivotField.prototype.SetCaption = function(caption) {};

/**
* Returns a value representing the object name.
* @memberof ApiPivotField
* @returns {string}
* @since 8.2.0
*/
ApiPivotField.prototype.GetName = function() { return ""; };

/**
* Sets a value representing the object name.
* @memberof ApiPivotField
* @param {string} name - The object name.
* @since 8.2.0
*/
ApiPivotField.prototype.SetName = function(name) {};

/**
* Returns a source name for the pivot table field.
* @memberof ApiPivotField
* @returns {string}
* @since 8.2.0
*/
ApiPivotField.prototype.GetSourceName = function() { return ""; };

/**
* Returns an index for the pivot table field.
* @memberof ApiPivotField
* @returns {number}
* @since 8.2.0
*/
ApiPivotField.prototype.GetIndex = function() { return 0; };

/**
* Returns the ApiPivotTable object which represents the pivot table for the current field.
* @memberof ApiPivotField
* @returns {ApiPivotTable}
* @since 8.2.0
*/
ApiPivotField.prototype.GetTable = function() { return new ApiPivotTable(); };

/**
* Returns the parent object for the current field.
* @memberof ApiPivotField
* @returns {ApiPivotTable}
* @since 8.2.0
*/
ApiPivotField.prototype.GetParent = function() { return new ApiPivotTable(); };

/**
* Returns the setting which specifies whether a pivot table field is compacted.
* @memberof ApiPivotField
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotField.prototype.GetLayoutCompactRow = function() { return true; };

/**
* Sets the setting which specifies whether a pivot table field is compacted.
* @memberof ApiPivotField
* @param {boolean} compact - Specifies whether a pivot table field is compacted.
* @since 8.2.0
*/
ApiPivotField.prototype.SetLayoutCompactRow = function(compact) {};

/**
* Returns the way the specified pivot table items appear — in table format or in outline format.
* @memberof ApiPivotField
* @returns {PivotLayoutType}
* @since 8.2.0
*/
ApiPivotField.prototype.GetLayoutForm = function() { return new PivotLayoutType(); };

/**
* Sets the way the specified pivot table items appear — in table format or in outline format.
* @memberof ApiPivotField
* @param {PivotLayoutType} type - The layout type of the pivot table report.
* @since 8.2.0
*/
ApiPivotField.prototype.SetLayoutForm = function(type) {};

/**
* Returns the setting which specifies whether to insert a page break after each field.
* @memberof ApiPivotField
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotField.prototype.GetLayoutPageBreak = function() { return true; };

/**
* Sets the setting which specifies whether to insert a page break after each field.
* @memberof ApiPivotField
* @param {boolean} insert - Specifies whether to insert a page break after each field.
* @since 8.2.0
*/
ApiPivotField.prototype.SetLayoutPageBreak = function(insert) {};

/**
* Returns the setting which specifies whether the pivot table field is currently visible in the pivot table.
* @memberof ApiPivotField
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotField.prototype.GetShowingInAxis = function() { return true; };

/**
* Returns the setting which specifies whether to repeat items labels at each row.
* @memberof ApiPivotField
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotField.prototype.GetRepeatLabels = function() { return true; };

/**
* Sets the setting which specifies whether to repeat items labels at each row.
* @memberof ApiPivotField
* @param {boolean} repeat - Specifies whether to repeat items labels at each row.
* @since 8.2.0
*/
ApiPivotField.prototype.SetRepeatLabels = function(repeat) {};

/**
* Returns the setting which specifies whether to insert blank rows after each item.
* @memberof ApiPivotField
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotField.prototype.GetLayoutBlankLine = function() { return true; };

/**
* Sets the setting which specifies whether to insert blank rows after each item.
* @memberof ApiPivotField
* @param {boolean} insert - Specifies whether to insert blank rows after each item.
* @since 8.2.0
*/
ApiPivotField.prototype.SetLayoutBlankLine = function(insert) {};

/**
* Returns the setting which specifies whether to show items with no data.
* @memberof ApiPivotField
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotField.prototype.GetShowAllItems = function() { return true; };

/**
* Sets the setting which specifies whether to show items with no data.
* @memberof ApiPivotField
* @param {boolean} show - Specifies whether to show items with no data.
* @since 8.2.0
*/
ApiPivotField.prototype.SetShowAllItems = function(show) {};

/**
* Returns the setting which specifies whether to show subtotals.
* @memberof ApiPivotField
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotField.prototype.GetLayoutSubtotals = function() { return true; };

/**
* Sets the setting which specifies whether to show subtotals.
* @memberof ApiPivotField
* @param {boolean} show - Specifies whether to show subtotals.
* @since 8.2.0
*/
ApiPivotField.prototype.SetLayoutSubtotals = function(show) {};

/**
* Returns the layout subtotal location.
* @memberof ApiPivotField
* @returns {LayoutSubtotalLocationType}
* @since 8.2.0
*/
ApiPivotField.prototype.GetLayoutSubtotalLocation = function() { return new LayoutSubtotalLocationType(); };

/**
* Sets the layout subtotal location.
* @memberof ApiPivotField
* @param {LayoutSubtotalLocationType} type - The layout subtotal location.
* @since 8.2.0
*/
ApiPivotField.prototype.SetLayoutSubtotalLocation = function(type) {};

/**
* Returns the text label displayed in the subtotal column or row heading in the specified pivot table report.
* @memberof ApiPivotField
* @returns {string}
* @since 8.2.0
*/
ApiPivotField.prototype.GetSubtotalName = function() { return ""; };

/**
* Sets the text label displayed in the subtotal column or row heading in the specified pivot table report.
* @memberof ApiPivotField
* @param {string} caption - The text label displayed in the subtotal column or row heading.
* @since 8.2.0
*/
ApiPivotField.prototype.SetSubtotalName = function(caption) {};

/**
* Returns an object that represents all subtotals.
* @memberof ApiPivotField
* @returns {PivotFieldSubtotals}
* @since 8.2.0
*/
ApiPivotField.prototype.GetSubtotals = function() { return new PivotFieldSubtotals(); };

/**
* Sets an object that represents all subtotals.
* @memberof ApiPivotField
* @param {PivotFieldSubtotals} subtotals - An object that represents all subtotals or some of them.
* @since 8.2.0
*/
ApiPivotField.prototype.SetSubtotals = function(subtotals) {};

/**
* Returns the setting which specifies whether the specified field can be dragged to the column position.
* @memberof ApiPivotField
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotField.prototype.GetDragToColumn = function() { return true; };

/**
* Sets the setting which specifies whether the specified field can be dragged to the column position.
* @memberof ApiPivotField
* @param {boolean} flag - Specifies whether the specified field can be dragged to the column position.
* @since 8.2.0
*/
ApiPivotField.prototype.SetDragToColumn = function(flag) {};

/**
* Returns the setting which specifies whether the specified field can be dragged to the row position.
* @memberof ApiPivotField
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotField.prototype.GetDragToRow = function() { return true; };

/**
* Sets the setting which specifies whether the specified field can be dragged to the row position.
* @memberof ApiPivotField
* @param {boolean} flag - Specifies whether the specified field can be dragged to the row position.
* @since 8.2.0
*/
ApiPivotField.prototype.SetDragToRow = function(flag) {};

/**
* Returns the setting which specifies whether the specified field can be dragged to the data position.
* @memberof ApiPivotField
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotField.prototype.GetDragToData = function() { return true; };

/**
* Sets the setting which specifies whether the specified field can be dragged to the data position.
* @memberof ApiPivotField
* @param {boolean} flag - Specifies whether the specified field can be dragged to the data position.
* @since 8.2.0
*/
ApiPivotField.prototype.SetDragToData = function(flag) {};

/**
* Returns the setting which specifies whether the specified field can be dragged to the page position.
* @memberof ApiPivotField
* @returns {boolean}
* @since 8.2.0
*/
ApiPivotField.prototype.GetDragToPage = function() { return true; };

/**
* Sets the setting which specifies whether the specified field can be dragged to the page position.
* @memberof ApiPivotField
* @param {boolean} flag - Specifies whether the specified field can be dragged to the page position.
* @since 8.2.0
*/
ApiPivotField.prototype.SetDragToPage = function(flag) {};

/**
* Returns the current page which is displayed for the page field (valid only for page fields).
* @memberof ApiPivotField
* @returns {string | number}
* @since 8.2.0
*/
ApiPivotField.prototype.GetCurrentPage = function() { return ""; };

/**
* Returns the collection of pivot filters applied to the specified pivot field.
* @memberof ApiPivotField
* @returns {ApiPivotFilters}
* @since 9.1.0
*/
ApiPivotField.prototype.GetPivotFilters = function() { return new ApiPivotFilters(); };

/**
* Establishes automatic field-sorting rules for the pivot table reports.
* @memberof ApiPivotField
* @param {SortOrder} order - The sort order.
* @param {string} field - The name of the field to sort by (pivotField.SourceName, pivotField.Name, dataField.Name).
* @since 9.1.0
*/
ApiPivotField.prototype.AutoSort = function(order, field) {};

/**
* Adds a new filter to the pivot field. This method is VBA-compatible and follows the PivotFilters.Add signature from Excel VBA.
* Supports all major filter types including label filters, value filters, top/bottom filters, and date filters.
* @memberof ApiPivotFilters
* @param {XlPivotFilterType} filterType - The type of filter to add. Must match VBA XlPivotFilterType enum values.
* @param {ApiPivotDataField} [dataField] - The data field object to filter by. Required for value filters (xlValue* types) and top/bottom filters.
* @param {string | number | Date} [value1] - The first value for the filter condition. Required for comparison, between, and top/bottom count filters.
* @param {string | number | Date} [value2] - The second value for "Between" conditions (xlCaptionIsBetween, xlCaptionIsNotBetween, xlValueIsBetween).
* @param {boolean} [wholeDayFilter] - Specifies whether to filter by whole day for date filters. Reserved for future use, currently not implemented.
* @since 9.1.0
*/
ApiPivotFilters.prototype.Add = function(filterType, dataField, value1, value2, wholeDayFilter) {};

/**
* Returns a name of the pivot item.
* @memberof ApiPivotItem
* @returns {string}
* @since 8.2.0
*/
ApiPivotItem.prototype.GetName = function() { return ""; };

/**
* Returns a caption of the pivot item.
* @memberof ApiPivotItem
* @returns {string}
* @since 8.2.0
*/
ApiPivotItem.prototype.GetCaption = function() { return ""; };

/**
* Returns a name of the specified item in the pivot table field.
* @memberof ApiPivotItem
* @returns {string}
* @since 8.2.0
*/
ApiPivotItem.prototype.GetValue = function() { return ""; };

/**
* Returns a parent of the pivot item.
* @memberof ApiPivotItem
* @returns {ApiPivotField}
* @since 8.2.0
*/
ApiPivotItem.prototype.GetParent = function() { return new ApiPivotField(); };

/**
* Returns the visibility of the pivot item.
* @memberof ApiPivotItem
* @returns {boolean} True if the pivot item is visible, false otherwise.
* @since 9.1.0
*/
ApiPivotItem.prototype.GetVisible = function() { return true; };

/**
* Sets the visibility of the pivot item.
* <note> At least one item must remain visible when hiding others. </note>
* @memberof ApiPivotItem
* @param {boolean} visible - Specifies whether the pivot item is visible.
* @since 9.1.0
*/
ApiPivotItem.prototype.SetVisible = function(visible) {};

/**
* Adds data validation to the specified range.
* @memberof ApiValidation
* @param {ValidationType} Type - The validation type.
* @param {ValidationAlertStyle} [AlertStyle] - The validation alert style.
* @param {ValidationOperator} [Operator] - The data validation operator.
* @param {string | number | ApiRange} [Formula1] - The first formula in the data validation.
* @param {string | number | ApiRange} [Formula2] - The second formula in the data validation.
* @returns {ApiValidation | null}
*/
ApiValidation.prototype.Add = function(Type, AlertStyle, Operator, Formula1, Formula2) { return new ApiValidation(); };

/**
* Deletes the object.
* @memberof ApiValidation
*/
ApiValidation.prototype.Delete = function() {};

/**
* Modifies data validation for a range.
* @memberof ApiValidation
* @param {ValidationType} [Type] - The validation type.
* @param {ValidationAlertStyle} [AlertStyle] - The validation alert style.
* @param {ValidationOperator} [Operator] - The data validation operator.
* @param {string | number | ApiRange} [Formula1] - The first formula in the data validation.
* @param {string | number | ApiRange} [Formula2] - The second formula in the data validation.
* @returns {ApiValidation | null}
*/
ApiValidation.prototype.Modify = function(Type, AlertStyle, Operator, Formula1, Formula2) { return new ApiValidation(); };

/**
* Returns the validation type.
* @memberof ApiValidation
* @returns {ValidationType}
*/
ApiValidation.prototype.GetType = function() { return new ValidationType(); };

/**
* Returns the validation alert style.
* @memberof ApiValidation
* @returns {ValidationAlertStyle}
*/
ApiValidation.prototype.GetAlertStyle = function() { return new ValidationAlertStyle(); };

/**
* Returns whether blank values are permitted by the range data validation.
* @memberof ApiValidation
* @returns {boolean}
*/
ApiValidation.prototype.GetIgnoreBlank = function() { return true; };

/**
* Sets whether blank values are permitted by the range data validation.
* @memberof ApiValidation
* @param {boolean} IgnoreBlank - Specifies whether blank values are permitted.
*/
ApiValidation.prototype.SetIgnoreBlank = function(IgnoreBlank) {};

/**
* Returns whether data validation displays a drop-down list that contains acceptable values.
* @memberof ApiValidation
* @returns {boolean}
*/
ApiValidation.prototype.GetInCellDropdown = function() { return true; };

/**
* Sets whether data validation displays a drop-down list that contains acceptable values.
* @memberof ApiValidation
* @param {boolean} InCellDropdown - Specifies whether to display a drop-down list.
*/
ApiValidation.prototype.SetInCellDropdown = function(InCellDropdown) {};

/**
* Returns whether the data validation input message will be displayed.
* @memberof ApiValidation
* @returns {boolean}
*/
ApiValidation.prototype.GetShowInput = function() { return true; };

/**
* Sets whether the data validation input message will be displayed.
* @memberof ApiValidation
* @param {boolean} ShowInput - Specifies whether to show input message.
*/
ApiValidation.prototype.SetShowInput = function(ShowInput) {};

/**
* Returns whether the data validation error message will be displayed.
* @memberof ApiValidation
* @returns {boolean}
*/
ApiValidation.prototype.GetShowError = function() { return true; };

/**
* Sets whether the data validation error message will be displayed.
* @memberof ApiValidation
* @param {boolean} ShowError - Specifies whether to show error message.
*/
ApiValidation.prototype.SetShowError = function(ShowError) {};

/**
* Returns the title of the data-validation input dialog box.
* @memberof ApiValidation
* @returns {string}
*/
ApiValidation.prototype.GetInputTitle = function() { return ""; };

/**
* Sets the title of the data-validation input dialog box.
* @memberof ApiValidation
* @param {string} InputTitle - The input dialog title.
*/
ApiValidation.prototype.SetInputTitle = function(InputTitle) {};

/**
* Returns the data validation input message.
* @memberof ApiValidation
* @returns {string}
*/
ApiValidation.prototype.GetInputMessage = function() { return ""; };

/**
* Sets the data validation input message.
* @memberof ApiValidation
* @param {string} InputMessage - The input message.
*/
ApiValidation.prototype.SetInputMessage = function(InputMessage) {};

/**
* Returns the title of the data-validation error dialog box.
* @memberof ApiValidation
* @returns {string}
*/
ApiValidation.prototype.GetErrorTitle = function() { return ""; };

/**
* Sets the title of the data-validation error dialog box.
* @memberof ApiValidation
* @param {string} ErrorTitle - The error dialog title.
*/
ApiValidation.prototype.SetErrorTitle = function(ErrorTitle) {};

/**
* Returns the data validation error message.
* @memberof ApiValidation
* @returns {string}
*/
ApiValidation.prototype.GetErrorMessage = function() { return ""; };

/**
* Sets the data validation error message.
* @memberof ApiValidation
* @param {string} ErrorMessage - The error message.
*/
ApiValidation.prototype.SetErrorMessage = function(ErrorMessage) {};

/**
* Returns the first formula in the data validation.
* @memberof ApiValidation
* @returns {string}
*/
ApiValidation.prototype.GetFormula1 = function() { return ""; };

/**
* Returns the second formula in the data validation.
* @memberof ApiValidation
* @returns {string}
*/
ApiValidation.prototype.GetFormula2 = function() { return ""; };

/**
* Returns the data validation operator.
* @memberof ApiValidation
* @returns {ValidationOperator}
*/
ApiValidation.prototype.GetOperator = function() { return new ValidationOperator(); };

/**
* Returns the parent range object.
* @memberof ApiValidation
* @returns {ApiRange}
*/
ApiValidation.prototype.GetParent = function() { return new ApiRange(); };

/**
* Adds a new format condition to the collection.
* @memberof ApiFormatConditions
* @param {XlFormatConditionType} Type - The format condition type.
* @param {XlFormatConditionOperator} [Operator] - The format condition operator.
* @param {string | number | ApiRange} [Formula1] - The first formula.
* @param {string | number | ApiRange} [Formula2] - The second formula.
* @returns {ApiFormatCondition | null} The created format condition, or null if the operation failed.
* @since 9.1.0
*/
ApiFormatConditions.prototype.Add = function(Type, Operator, Formula1, Formula2) { return new ApiFormatCondition(); };

/**
* Adds a new above average conditional formatting rule to the collection.
* @memberof ApiFormatConditions
* @returns {ApiAboveAverage | null} The created above average rule, or null if the operation fails.
* @since 9.1.0
*/
ApiFormatConditions.prototype.AddAboveAverage = function() { return new ApiAboveAverage(); };

/**
* Adds a new color scale conditional formatting rule to the collection.
* @memberof ApiFormatConditions
* @param {number} [ColorScaleType=3] - The type of color scale (2 for two-color scale, 3 for three-color scale).
* @returns {ApiColorScale | null} The created color scale rule, or null if the operation fails.
* @since 9.1.0
*/
ApiFormatConditions.prototype.AddColorScale = function(ColorScaleType) { return new ApiColorScale(); };

/**
* Adds a new data bar conditional formatting rule to the collection.
* @memberof ApiFormatConditions
* @returns {ApiDatabar | null} The created data bar rule, or null if the operation fails.
* @since 9.1.0
*/
ApiFormatConditions.prototype.AddDatabar = function() { return new ApiDatabar(); };

/**
* Adds a new icon set conditional formatting rule to the collection.
* @memberof ApiFormatConditions
* @returns {ApiIconSetCondition | null} The created icon set rule, or null if the operation fails.
* @since 9.1.0
*/
ApiFormatConditions.prototype.AddIconSetCondition = function() { return new ApiIconSetCondition(); };

/**
* Adds a new top 10 conditional formatting rule to the collection.
* @memberof ApiFormatConditions
* @returns {ApiTop10 | null} The created top 10 rule, or null if the operation fails.
* @since 9.1.0
*/
ApiFormatConditions.prototype.AddTop10 = function() { return new ApiTop10(); };

/**
* Adds a new unique values conditional formatting rule to the collection.
* @memberof ApiFormatConditions
* @returns {ApiUniqueValues | null} The created unique values rule, or null if the operation fails.
* @since 9.1.0
*/
ApiFormatConditions.prototype.AddUniqueValues = function() { return new ApiUniqueValues(); };

/**
* Deletes all format conditions from the collection.
* @memberof ApiFormatConditions
* @since 9.1.0
*/
ApiFormatConditions.prototype.Delete = function() {};

/**
* Returns the number of conditional formatting rules in the collection.
* @memberof ApiFormatConditions
* @returns {number} The number of conditional formatting rules in the collection.
* @since 9.1.0
*/
ApiFormatConditions.prototype.GetCount = function() { return 0; };

/**
* Returns a format condition by its index.
* @memberof ApiFormatConditions
* @param {number} index - The index of the format condition (1-based).
* @returns {ApiFormatCondition | null} - The format condition.
* @since 9.1.0
*/
ApiFormatConditions.prototype.GetItem = function(index) { return new ApiFormatCondition(); };

/**
* Returns the parent range object associated with the current conditional formatting collection.
* @memberof ApiFormatConditions
* @returns {ApiRange} The parent range object.
* @since 9.1.0
*/
ApiFormatConditions.prototype.GetParent = function() { return new ApiRange(); };

/**
* Deletes the current format condition.
* @memberof ApiFormatCondition
* @since 9.1.0
*/
ApiFormatCondition.prototype.Delete = function() {};

/**
* Modifies the current format condition with the specified parameters.
* @memberof ApiFormatCondition
* @param {XlFormatConditionType} [Type] - The format condition type.
* @param {XlFormatConditionOperator} [Operator] - The format condition operator.
* @param {string | number | ApiRange} [Formula1] - The first formula.
* @param {string | number | ApiRange} [Formula2] - The second formula.
* @returns {ApiFormatCondition | null} The modified format condition, or null if the rule does not exist.
* @since 9.1.0
*/
ApiFormatCondition.prototype.Modify = function(Type, Operator, Formula1, Formula2) { return new ApiFormatCondition(); };

/**
* Sets the cell range to which the current conditional formatting rule applies.
* @memberof ApiFormatCondition
* @param {ApiRange} Range - The range to which the current conditional formatting rule will be applied.
* @since 9.1.0
*/
ApiFormatCondition.prototype.ModifyAppliesToRange = function(Range) {};

/**
* Sets the priority value for the current conditional formatting rule to "1" so that it will be evaluated before all other rules on the worksheet.
* @memberof ApiFormatCondition
* @since 9.1.0
*/
ApiFormatCondition.prototype.SetFirstPriority = function() {};

/**
* Sets the evaluation order for the current conditional formatting rule so it is evaluated after all other rules on the worksheet.
* @memberof ApiFormatCondition
* @since 9.1.0
*/
ApiFormatCondition.prototype.SetLastPriority = function() {};

/**
* Returns the range of cells to which the current conditional formatting rule applies.
* @memberof ApiFormatCondition
* @returns {ApiRange | null} The range of cells affected by the current condition, or null if no range is set.
* @since 9.1.0
*/
ApiFormatCondition.prototype.GetAppliesTo = function() { return new ApiRange(); };

/**
* Returns the font applied by the current format condition.
* @memberof ApiFormatCondition
* @returns {ApiFont | null} An ApiFont object representing the font applied by the format condition, or null if no font is defined.
* @since 9.1.0
*/
ApiFormatCondition.prototype.GetFont = function() { return new ApiFont(); };

/**
* Returns the format condition type.
* @memberof ApiFormatCondition
* @returns {XlFormatConditionType} The format condition type.
* @since 9.1.0
*/
ApiFormatCondition.prototype.GetType = function() { return new XlFormatConditionType(); };

/**
* Returns the first formula used by the current conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {string} The first formula.
* @since 9.1.0
*/
ApiFormatCondition.prototype.GetFormula1 = function() { return ""; };

/**
* Returns the second formula used by the current conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {string} The second formula.
* @since 9.1.0
*/
ApiFormatCondition.prototype.GetFormula2 = function() { return ""; };

/**
* Sets the number format applied to a cell when the conditional formatting rule evaluates to true.
* @memberof ApiFormatCondition
* @param {string} NumberFormat - The number format code (e.g., "General", "#,##0.00", etc.)
* @since 9.1.0
*/
ApiFormatCondition.prototype.SetNumberFormat = function(NumberFormat) {};

/**
* Returns the number format applied to a cell when the conditional formatting rule evaluates to true.
* @memberof ApiFormatCondition
* @returns {string} The number format.
* @since 9.1.0
*/
ApiFormatCondition.prototype.GetNumberFormat = function() { return ""; };

/**
* Returns the format condition operator.
* @memberof ApiFormatCondition
* @returns {XlFormatConditionOperator} The format condition operator.
* @since 9.1.0
*/
ApiFormatCondition.prototype.GetOperator = function() { return new XlFormatConditionOperator(); };

/**
* Returns the parent range object of the current format condition.
* @memberof ApiFormatCondition
* @returns {ApiRange} The parent range object.
* @since 9.1.0
*/
ApiFormatCondition.prototype.GetParent = function() { return new ApiRange(); };

/**
* Returns the pivot table condition object.
* @memberof ApiFormatCondition
* @returns {PTCondition | null} The pivot table condition object.
* @since 9.1.0
*/
ApiFormatCondition.prototype.GetPTCondition = function() { return new PTCondition(); };

/**
* Returns the priority value of the conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {number} The priority value of the conditional formatting rule.
* @since 9.1.0
*/
ApiFormatCondition.prototype.GetPriority = function() { return 0; };

/**
* Sets the priority value of the conditional formatting rule.
* @memberof ApiFormatCondition
* @param {number} Priority - The priority value (1-based).
* @since 9.1.0
*/
ApiFormatCondition.prototype.SetPriority = function(Priority) {};

/**
* Returns the scope type of the conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {XlPivotConditionScope} - Returns "xlSelectionScope" for normal ranges, "xlDataFieldScope" for entire worksheet, "xlFieldsScope" for pivot tables.
* @since 9.1.0
*/
ApiFormatCondition.prototype.GetScopeType = function() { return new XlPivotConditionScope(); };

/**
* Sets the scope type for the conditional formatting rule.
* @memberof ApiFormatCondition
* @param {XlPivotConditionScope} ScopeType - The scope type: "xlSelectionScope", "xlDataFieldScope", or "xlFieldsScope".
* @since 9.1.0
*/
ApiFormatCondition.prototype.SetScopeType = function(ScopeType) {};

/**
* Returns the text value used in text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @returns {string} The text value used in text-based conditional formatting rules.
* @since 9.1.0
*/
ApiFormatCondition.prototype.GetText = function() { return ""; };

/**
* Sets the text value used in text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @param {string} Text - The text value to compare against.
* @since 9.1.0
*/
ApiFormatCondition.prototype.SetText = function(Text) {};

/**
* Returns the text operator for text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @returns {XlContainsOperator | null} The operator defining how the text comparison is performed,
* or null if the rule is not text-based.
* @since 9.1.0
*/
ApiFormatCondition.prototype.GetTextOperator = function() { return new XlContainsOperator(); };

/**
* Sets the text operator for text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @param {XlContainsOperator} TextOperator - The text operator: "xlContains", "xlDoesNotContain", "xlBeginsWith", "xlEndsWith".
* @since 9.1.0
*/
ApiFormatCondition.prototype.SetTextOperator = function(TextOperator) {};

/**
* Returns the date operator for time period conditions.
* @memberof ApiFormatCondition
* @returns {XlTimePeriods | null} The time period operator that defines how the date condition is evaluated,
* or null if the rule is not date-based.
* @since 9.1.0
*/
ApiFormatCondition.prototype.GetDateOperator = function() { return new XlTimePeriods(); };

/**
* Sets the date operator for time period conditions.
* @memberof ApiFormatCondition
* @param {XlTimePeriods} DateOperator - The date operator for time period conditions.
* @since 9.1.0
*/
ApiFormatCondition.prototype.SetDateOperator = function(DateOperator) {};

/**
* Sets the border style for the conditional formatting rule.
* @memberof ApiFormatCondition
* @param {BordersIndex} bordersIndex - Specifies the cell border position.
* @param {LineStyle} lineStyle - Specifies the line style used to form the cell border.
* @param {ApiColor} oColor - The color object which specifies the color to be set to the cell border.
* @since 9.1.0
*/
ApiFormatCondition.prototype.SetBorders = function(bordersIndex, lineStyle, oColor) {};

/**
* Sets the background color to the format condition with the previously created color object.
* Sets 'No Fill' when previously created color object is null.
* @memberof ApiFormatCondition
* @param {ApiColor} oColor - The color object that specifies the background color for the format condition.
* @since 9.1.0
*/
ApiFormatCondition.prototype.SetFillColor = function(oColor) {};

/**
* Returns the background color for the format condition. Returns 'No Fill' when the background color of the format condition is null.
* @memberof ApiFormatCondition
* @returns {ApiColor|'No Fill'} - The background color applied by the format condition, or 'No Fill' if none is set.
* @since 9.1.0
*/
ApiFormatCondition.prototype.GetFillColor = function() { return new ApiColor(); };

/**
* Returns whether the rule is configured to detect values above or below the average.
* @memberof ApiAboveAverage
* @returns {boolean} True if the rule targets above-average values; false if it targets below-average values.
* @since 9.1.0
*/
ApiAboveAverage.prototype.GetAboveBelow = function() { return true; };

/**
* Sets whether the rule targets values above or below the average.
* @memberof ApiAboveAverage
* @param {boolean} aboveBelow - True if the rule targets above-average values; false if it targets below-average values.
* @since 9.1.0
*/
ApiAboveAverage.prototype.SetAboveBelow = function(aboveBelow) {};

/**
* Returns the number of standard deviations from the average.
* @memberof ApiAboveAverage
* @returns {number} The number of standard deviations from the average.
* @since 9.1.0
*/
ApiAboveAverage.prototype.GetNumStdDev = function() { return 0; };

/**
* Sets the number of standard deviations from the average.
* @memberof ApiAboveAverage
* @param {number} numStdDev - The number of standard deviations (0 for simple average, positive numbers for deviations).
* @since 9.1.0
*/
ApiAboveAverage.prototype.SetNumStdDev = function(numStdDev) {};

/**
* Returns the type of the above average conditional formatting rule.
* @memberof ApiAboveAverage
* @returns {XlFormatConditionType} The type of the above average conditional formatting rule.
* @since 9.1.0
*/
ApiAboveAverage.prototype.GetType = function() { return new XlFormatConditionType(); };

/**
* Deletes the current format condition.
* @memberof ApiFormatCondition
* @since 9.1.0
*/
ApiAboveAverage.prototype.Delete = function() {};

/**
* Modifies the current format condition with the specified parameters.
* @memberof ApiFormatCondition
* @param {XlFormatConditionType} [Type] - The format condition type.
* @param {XlFormatConditionOperator} [Operator] - The format condition operator.
* @param {string | number | ApiRange} [Formula1] - The first formula.
* @param {string | number | ApiRange} [Formula2] - The second formula.
* @returns {ApiFormatCondition | null} The modified format condition, or null if the rule does not exist.
* @since 9.1.0
*/
ApiAboveAverage.prototype.Modify = function(Type, Operator, Formula1, Formula2) { return new ApiFormatCondition(); };

/**
* Sets the cell range to which the current conditional formatting rule applies.
* @memberof ApiFormatCondition
* @param {ApiRange} Range - The range to which the current conditional formatting rule will be applied.
* @since 9.1.0
*/
ApiAboveAverage.prototype.ModifyAppliesToRange = function(Range) {};

/**
* Sets the priority value for the current conditional formatting rule to "1" so that it will be evaluated before all other rules on the worksheet.
* @memberof ApiFormatCondition
* @since 9.1.0
*/
ApiAboveAverage.prototype.SetFirstPriority = function() {};

/**
* Sets the evaluation order for the current conditional formatting rule so it is evaluated after all other rules on the worksheet.
* @memberof ApiFormatCondition
* @since 9.1.0
*/
ApiAboveAverage.prototype.SetLastPriority = function() {};

/**
* Returns the range of cells to which the current conditional formatting rule applies.
* @memberof ApiFormatCondition
* @returns {ApiRange | null} The range of cells affected by the current condition, or null if no range is set.
* @since 9.1.0
*/
ApiAboveAverage.prototype.GetAppliesTo = function() { return new ApiRange(); };

/**
* Returns the font applied by the current format condition.
* @memberof ApiFormatCondition
* @returns {ApiFont | null} An ApiFont object representing the font applied by the format condition, or null if no font is defined.
* @since 9.1.0
*/
ApiAboveAverage.prototype.GetFont = function() { return new ApiFont(); };

/**
* Returns the first formula used by the current conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {string} The first formula.
* @since 9.1.0
*/
ApiAboveAverage.prototype.GetFormula1 = function() { return ""; };

/**
* Returns the second formula used by the current conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {string} The second formula.
* @since 9.1.0
*/
ApiAboveAverage.prototype.GetFormula2 = function() { return ""; };

/**
* Sets the number format applied to a cell when the conditional formatting rule evaluates to true.
* @memberof ApiFormatCondition
* @param {string} NumberFormat - The number format code (e.g., "General", "#,##0.00", etc.)
* @since 9.1.0
*/
ApiAboveAverage.prototype.SetNumberFormat = function(NumberFormat) {};

/**
* Returns the number format applied to a cell when the conditional formatting rule evaluates to true.
* @memberof ApiFormatCondition
* @returns {string} The number format.
* @since 9.1.0
*/
ApiAboveAverage.prototype.GetNumberFormat = function() { return ""; };

/**
* Returns the format condition operator.
* @memberof ApiFormatCondition
* @returns {XlFormatConditionOperator} The format condition operator.
* @since 9.1.0
*/
ApiAboveAverage.prototype.GetOperator = function() { return new XlFormatConditionOperator(); };

/**
* Returns the parent range object of the current format condition.
* @memberof ApiFormatCondition
* @returns {ApiRange} The parent range object.
* @since 9.1.0
*/
ApiAboveAverage.prototype.GetParent = function() { return new ApiRange(); };

/**
* Returns the pivot table condition object.
* @memberof ApiFormatCondition
* @returns {PTCondition | null} The pivot table condition object.
* @since 9.1.0
*/
ApiAboveAverage.prototype.GetPTCondition = function() { return new PTCondition(); };

/**
* Returns the priority value of the conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {number} The priority value of the conditional formatting rule.
* @since 9.1.0
*/
ApiAboveAverage.prototype.GetPriority = function() { return 0; };

/**
* Sets the priority value of the conditional formatting rule.
* @memberof ApiFormatCondition
* @param {number} Priority - The priority value (1-based).
* @since 9.1.0
*/
ApiAboveAverage.prototype.SetPriority = function(Priority) {};

/**
* Returns the scope type of the conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {XlPivotConditionScope} - Returns "xlSelectionScope" for normal ranges, "xlDataFieldScope" for entire worksheet, "xlFieldsScope" for pivot tables.
* @since 9.1.0
*/
ApiAboveAverage.prototype.GetScopeType = function() { return new XlPivotConditionScope(); };

/**
* Sets the scope type for the conditional formatting rule.
* @memberof ApiFormatCondition
* @param {XlPivotConditionScope} ScopeType - The scope type: "xlSelectionScope", "xlDataFieldScope", or "xlFieldsScope".
* @since 9.1.0
*/
ApiAboveAverage.prototype.SetScopeType = function(ScopeType) {};

/**
* Returns the text value used in text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @returns {string} The text value used in text-based conditional formatting rules.
* @since 9.1.0
*/
ApiAboveAverage.prototype.GetText = function() { return ""; };

/**
* Sets the text value used in text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @param {string} Text - The text value to compare against.
* @since 9.1.0
*/
ApiAboveAverage.prototype.SetText = function(Text) {};

/**
* Returns the text operator for text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @returns {XlContainsOperator | null} The operator defining how the text comparison is performed,
* or null if the rule is not text-based.
* @since 9.1.0
*/
ApiAboveAverage.prototype.GetTextOperator = function() { return new XlContainsOperator(); };

/**
* Sets the text operator for text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @param {XlContainsOperator} TextOperator - The text operator: "xlContains", "xlDoesNotContain", "xlBeginsWith", "xlEndsWith".
* @since 9.1.0
*/
ApiAboveAverage.prototype.SetTextOperator = function(TextOperator) {};

/**
* Returns the date operator for time period conditions.
* @memberof ApiFormatCondition
* @returns {XlTimePeriods | null} The time period operator that defines how the date condition is evaluated,
* or null if the rule is not date-based.
* @since 9.1.0
*/
ApiAboveAverage.prototype.GetDateOperator = function() { return new XlTimePeriods(); };

/**
* Sets the date operator for time period conditions.
* @memberof ApiFormatCondition
* @param {XlTimePeriods} DateOperator - The date operator for time period conditions.
* @since 9.1.0
*/
ApiAboveAverage.prototype.SetDateOperator = function(DateOperator) {};

/**
* Sets the border style for the conditional formatting rule.
* @memberof ApiFormatCondition
* @param {BordersIndex} bordersIndex - Specifies the cell border position.
* @param {LineStyle} lineStyle - Specifies the line style used to form the cell border.
* @param {ApiColor} oColor - The color object which specifies the color to be set to the cell border.
* @since 9.1.0
*/
ApiAboveAverage.prototype.SetBorders = function(bordersIndex, lineStyle, oColor) {};

/**
* Sets the background color to the format condition with the previously created color object.
* Sets 'No Fill' when previously created color object is null.
* @memberof ApiFormatCondition
* @param {ApiColor} oColor - The color object that specifies the background color for the format condition.
* @since 9.1.0
*/
ApiAboveAverage.prototype.SetFillColor = function(oColor) {};

/**
* Returns the background color for the format condition. Returns 'No Fill' when the background color of the format condition is null.
* @memberof ApiFormatCondition
* @returns {ApiColor|'No Fill'} - The background color applied by the format condition, or 'No Fill' if none is set.
* @since 9.1.0
*/
ApiAboveAverage.prototype.GetFillColor = function() { return new ApiColor(); };

/**
* Returns the collection of criteria that define this color scale rule.
* @memberof ApiColorScale
* @returns {ApiColorScaleCriterion[] | null} An array of ApiColorScaleCriterion objects representing the color scale criteria,
* or `null` if the rule is not a color scale type.
* @since 9.1.0
*/
ApiColorScale.prototype.GetColorScaleCriteria = function() { return []; };

/**
* Returns the type of the color scale conditional formatting rule.
* @memberof ApiColorScale
* @returns {XlFormatConditionType} The type of the color scale conditional formatting rule.
* @since 9.1.0
*/
ApiColorScale.prototype.GetType = function() { return new XlFormatConditionType(); };

/**
* Deletes the current format condition.
* @memberof ApiFormatCondition
* @since 9.1.0
*/
ApiColorScale.prototype.Delete = function() {};

/**
* Modifies the current format condition with the specified parameters.
* @memberof ApiFormatCondition
* @param {XlFormatConditionType} [Type] - The format condition type.
* @param {XlFormatConditionOperator} [Operator] - The format condition operator.
* @param {string | number | ApiRange} [Formula1] - The first formula.
* @param {string | number | ApiRange} [Formula2] - The second formula.
* @returns {ApiFormatCondition | null} The modified format condition, or null if the rule does not exist.
* @since 9.1.0
*/
ApiColorScale.prototype.Modify = function(Type, Operator, Formula1, Formula2) { return new ApiFormatCondition(); };

/**
* Sets the cell range to which the current conditional formatting rule applies.
* @memberof ApiFormatCondition
* @param {ApiRange} Range - The range to which the current conditional formatting rule will be applied.
* @since 9.1.0
*/
ApiColorScale.prototype.ModifyAppliesToRange = function(Range) {};

/**
* Sets the priority value for the current conditional formatting rule to "1" so that it will be evaluated before all other rules on the worksheet.
* @memberof ApiFormatCondition
* @since 9.1.0
*/
ApiColorScale.prototype.SetFirstPriority = function() {};

/**
* Sets the evaluation order for the current conditional formatting rule so it is evaluated after all other rules on the worksheet.
* @memberof ApiFormatCondition
* @since 9.1.0
*/
ApiColorScale.prototype.SetLastPriority = function() {};

/**
* Returns the range of cells to which the current conditional formatting rule applies.
* @memberof ApiFormatCondition
* @returns {ApiRange | null} The range of cells affected by the current condition, or null if no range is set.
* @since 9.1.0
*/
ApiColorScale.prototype.GetAppliesTo = function() { return new ApiRange(); };

/**
* Returns the font applied by the current format condition.
* @memberof ApiFormatCondition
* @returns {ApiFont | null} An ApiFont object representing the font applied by the format condition, or null if no font is defined.
* @since 9.1.0
*/
ApiColorScale.prototype.GetFont = function() { return new ApiFont(); };

/**
* Returns the first formula used by the current conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {string} The first formula.
* @since 9.1.0
*/
ApiColorScale.prototype.GetFormula1 = function() { return ""; };

/**
* Returns the second formula used by the current conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {string} The second formula.
* @since 9.1.0
*/
ApiColorScale.prototype.GetFormula2 = function() { return ""; };

/**
* Sets the number format applied to a cell when the conditional formatting rule evaluates to true.
* @memberof ApiFormatCondition
* @param {string} NumberFormat - The number format code (e.g., "General", "#,##0.00", etc.)
* @since 9.1.0
*/
ApiColorScale.prototype.SetNumberFormat = function(NumberFormat) {};

/**
* Returns the number format applied to a cell when the conditional formatting rule evaluates to true.
* @memberof ApiFormatCondition
* @returns {string} The number format.
* @since 9.1.0
*/
ApiColorScale.prototype.GetNumberFormat = function() { return ""; };

/**
* Returns the format condition operator.
* @memberof ApiFormatCondition
* @returns {XlFormatConditionOperator} The format condition operator.
* @since 9.1.0
*/
ApiColorScale.prototype.GetOperator = function() { return new XlFormatConditionOperator(); };

/**
* Returns the parent range object of the current format condition.
* @memberof ApiFormatCondition
* @returns {ApiRange} The parent range object.
* @since 9.1.0
*/
ApiColorScale.prototype.GetParent = function() { return new ApiRange(); };

/**
* Returns the pivot table condition object.
* @memberof ApiFormatCondition
* @returns {PTCondition | null} The pivot table condition object.
* @since 9.1.0
*/
ApiColorScale.prototype.GetPTCondition = function() { return new PTCondition(); };

/**
* Returns the priority value of the conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {number} The priority value of the conditional formatting rule.
* @since 9.1.0
*/
ApiColorScale.prototype.GetPriority = function() { return 0; };

/**
* Sets the priority value of the conditional formatting rule.
* @memberof ApiFormatCondition
* @param {number} Priority - The priority value (1-based).
* @since 9.1.0
*/
ApiColorScale.prototype.SetPriority = function(Priority) {};

/**
* Returns the scope type of the conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {XlPivotConditionScope} - Returns "xlSelectionScope" for normal ranges, "xlDataFieldScope" for entire worksheet, "xlFieldsScope" for pivot tables.
* @since 9.1.0
*/
ApiColorScale.prototype.GetScopeType = function() { return new XlPivotConditionScope(); };

/**
* Sets the scope type for the conditional formatting rule.
* @memberof ApiFormatCondition
* @param {XlPivotConditionScope} ScopeType - The scope type: "xlSelectionScope", "xlDataFieldScope", or "xlFieldsScope".
* @since 9.1.0
*/
ApiColorScale.prototype.SetScopeType = function(ScopeType) {};

/**
* Returns the text value used in text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @returns {string} The text value used in text-based conditional formatting rules.
* @since 9.1.0
*/
ApiColorScale.prototype.GetText = function() { return ""; };

/**
* Sets the text value used in text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @param {string} Text - The text value to compare against.
* @since 9.1.0
*/
ApiColorScale.prototype.SetText = function(Text) {};

/**
* Returns the text operator for text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @returns {XlContainsOperator | null} The operator defining how the text comparison is performed,
* or null if the rule is not text-based.
* @since 9.1.0
*/
ApiColorScale.prototype.GetTextOperator = function() { return new XlContainsOperator(); };

/**
* Sets the text operator for text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @param {XlContainsOperator} TextOperator - The text operator: "xlContains", "xlDoesNotContain", "xlBeginsWith", "xlEndsWith".
* @since 9.1.0
*/
ApiColorScale.prototype.SetTextOperator = function(TextOperator) {};

/**
* Returns the date operator for time period conditions.
* @memberof ApiFormatCondition
* @returns {XlTimePeriods | null} The time period operator that defines how the date condition is evaluated,
* or null if the rule is not date-based.
* @since 9.1.0
*/
ApiColorScale.prototype.GetDateOperator = function() { return new XlTimePeriods(); };

/**
* Sets the date operator for time period conditions.
* @memberof ApiFormatCondition
* @param {XlTimePeriods} DateOperator - The date operator for time period conditions.
* @since 9.1.0
*/
ApiColorScale.prototype.SetDateOperator = function(DateOperator) {};

/**
* Sets the border style for the conditional formatting rule.
* @memberof ApiFormatCondition
* @param {BordersIndex} bordersIndex - Specifies the cell border position.
* @param {LineStyle} lineStyle - Specifies the line style used to form the cell border.
* @param {ApiColor} oColor - The color object which specifies the color to be set to the cell border.
* @since 9.1.0
*/
ApiColorScale.prototype.SetBorders = function(bordersIndex, lineStyle, oColor) {};

/**
* Sets the background color to the format condition with the previously created color object.
* Sets 'No Fill' when previously created color object is null.
* @memberof ApiFormatCondition
* @param {ApiColor} oColor - The color object that specifies the background color for the format condition.
* @since 9.1.0
*/
ApiColorScale.prototype.SetFillColor = function(oColor) {};

/**
* Returns the background color for the format condition. Returns 'No Fill' when the background color of the format condition is null.
* @memberof ApiFormatCondition
* @returns {ApiColor|'No Fill'} - The background color applied by the format condition, or 'No Fill' if none is set.
* @since 9.1.0
*/
ApiColorScale.prototype.GetFillColor = function() { return new ApiColor(); };

/**
* Returns the type of the color scale criterion.
* @memberof ApiColorScaleCriterion
* @returns {XlConditionValueTypes | null} The type of the color scale criterion.
* @since 9.1.0
*/
ApiColorScaleCriterion.prototype.GetType = function() { return new XlConditionValueTypes(); };

/**
* Sets the type for the color scale criterion.
* @memberof ApiColorScaleCriterion
* @param {XlConditionValueTypes} type - The type of the color scale criterion.
* @since 9.1.0
*/
ApiColorScaleCriterion.prototype.SetType = function(type) {};

/**
* Returns the value of the color scale criterion.
* @memberof ApiColorScaleCriterion
* @returns {string | null} The value of the color scale criterion, or `null` if not set.
* @since 9.1.0
*/
ApiColorScaleCriterion.prototype.GetValue = function() { return ""; };

/**
* Sets the value for the color scale criterion.
* @memberof ApiColorScaleCriterion
* @param {string} value - The value of the color scale criterion.
* @since 9.1.0
*/
ApiColorScaleCriterion.prototype.SetValue = function(value) {};

/**
* Returns the index indicating which threshold the criterion represents.
* @memberof ApiColorScaleCriterion
* @returns {number} Returns 0 for minimum threshold, 1 for midpoint (3-color scale) or maximum (2-color scale), and 2 for maximum threshold (3-color scale only).
* @since 9.1.0
*/
ApiColorScaleCriterion.prototype.GetIndex = function() { return 0; };

/**
* Returns the format color of the color scale criterion.
* @memberof ApiColorScaleCriterion
* @returns {ApiColor | null} An ApiColor object representing the criterion's color, or `null` if no color is set.
* @since 9.1.0
*/
ApiColorScaleCriterion.prototype.GetColor = function() { return new ApiColor(); };

/**
* Sets the format color for the color scale criterion.
* @memberof ApiColorScaleCriterion
* @param {ApiColor} oColor - The ApiColor object specifying the color.
* @since 9.1.0
*/
ApiColorScaleCriterion.prototype.SetColor = function(oColor) {};

/**
* Returns the axis color of the data bar conditional formatting rule.
* @memberof ApiDatabar
* @returns {ApiColor | null} The axis color as an ApiColor object, or null if no color is specified.
* @since 9.1.0
*/
ApiDatabar.prototype.GetAxisColor = function() { return new ApiColor(); };

/**
* Sets the axis color for the data bar conditional formatting rule.
* @memberof ApiDatabar
* @param {ApiColor} oColor - The axis color as an ApiColor object.
* @since 9.1.0
*/
ApiDatabar.prototype.SetAxisColor = function(oColor) {};

/**
* Returns the axis position of the data bar conditional formatting rule.
* @memberof ApiDatabar
* @returns {XlDataBarAxisPosition} The axis position setting for the data bar.
* @since 9.1.0
*/
ApiDatabar.prototype.GetAxisPosition = function() { return new XlDataBarAxisPosition(); };

/**
* Sets the axis position for the data bar conditional formatting rule.
* @memberof ApiDatabar
* @param {XlDataBarAxisPosition} position - The axis position setting for the data bar.
* @since 9.1.0
*/
ApiDatabar.prototype.SetAxisPosition = function(position) {};

/**
* Returns whether the data bar displays the cell value.
* @memberof ApiDatabar
* @returns {boolean} True if the data bar shows the value, false otherwise.
* @since 9.1.0
*/
ApiDatabar.prototype.GetShowValue = function() { return true; };

/**
* Specifies whether the data bar displays the cell value.
* @memberof ApiDatabar
* @param {boolean} showValue - True to show the value, false to hide it.
* @since 9.1.0
*/
ApiDatabar.prototype.SetShowValue = function(showValue) {};

/**
* Returns the direction of the data bar.
* @memberof ApiDatabar
* @returns {XlReadingOrder} The direction setting for the data bar (context, left-to-right, or right-to-left).
* @since 9.1.0
*/
ApiDatabar.prototype.GetDirection = function() { return new XlReadingOrder(); };

/**
* Sets the direction for the data bar.
* @memberof ApiDatabar
* @param {XlReadingOrder} direction - The direction setting for the data bar (context, left-to-right, or right-to-left).
* @since 9.1.0
*/
ApiDatabar.prototype.SetDirection = function(direction) {};

/**
* Returns the bar color of the data bar.
* @memberof ApiDatabar
* @returns {ApiColor | null} Returns the ApiColor object representing the bar color, or null if the bar color is not specified.
* @since 9.1.0
*/
ApiDatabar.prototype.GetBarColor = function() { return new ApiColor(); };

/**
* Sets the bar color for the data bar.
* @memberof ApiDatabar
* @param {ApiColor} oColor - The ApiColor object representing the bar color.
* @since 9.1.0
*/
ApiDatabar.prototype.SetBarColor = function(oColor) {};

/**
* Returns the bar fill type of the data bar.
* @memberof ApiDatabar
* @returns {XlDataBarFillType} The fill type setting for the data bar (solid or gradient).
* @since 9.1.0
*/
ApiDatabar.prototype.GetBarFillType = function() { return new XlDataBarFillType(); };

/**
* Sets the bar fill type for the data bar.
* @memberof ApiDatabar
* @param {XlDataBarFillType} fillType - The fill type setting for the data bar (solid or gradient).
* @since 9.1.0
*/
ApiDatabar.prototype.SetBarFillType = function(fillType) {};

/**
* Returns the type of the minimum value condition for the data bar.
* @memberof ApiDatabar
* @returns {XlConditionValueTypes | null} The type of the minimum value condition, or null if not specified.
* @since 9.1.0
*/
ApiDatabar.prototype.GetMinPointType = function() { return new XlConditionValueTypes(); };

/**
* Sets the type for the minimum value condition for the data bar.
* @memberof ApiDatabar
* @param {XlConditionValueTypes} type - The type of the minimum value condition.
* @since 9.1.0
*/
ApiDatabar.prototype.SetMinPointType = function(type) {};

/**
* Returns the value of the minimum value condition for the data bar.
* @memberof ApiDatabar
* @returns {string | number | null} The value of the minimum value condition.
* @since 9.1.0
*/
ApiDatabar.prototype.GetMinPointValue = function() { return ""; };

/**
* Sets the value for the minimum value condition for the data bar.
* @memberof ApiDatabar
* @param {string | number} value - The value of the minimum value condition.
* @since 9.1.0
*/
ApiDatabar.prototype.SetMinPointValue = function(value) {};

/**
* Returns the type of the maximum value condition for the data bar.
* @memberof ApiDatabar
* @returns {XlConditionValueTypes | null} The type of the maximum value condition, or null if not specified.
* @since 9.1.0
*/
ApiDatabar.prototype.GetMaxPointType = function() { return new XlConditionValueTypes(); };

/**
* Sets the type for the maximum value condition for the data bar.
* @memberof ApiDatabar
* @param {XlConditionValueTypes} type - The type of the maximum value condition.
* @since 9.1.0
*/
ApiDatabar.prototype.SetMaxPointType = function(type) {};

/**
* Returns the value of the maximum value condition for the data bar.
* @memberof ApiDatabar
* @returns {string | number | null} The value of the maximum value condition.
* @since 9.1.0
*/
ApiDatabar.prototype.GetMaxPointValue = function() { return ""; };

/**
* Sets the value for the maximum value condition for the data bar.
* @memberof ApiDatabar
* @param {string | number} value - The value of the maximum value condition.
* @since 9.1.0
*/
ApiDatabar.prototype.SetMaxPointValue = function(value) {};

/**
* Returns the negative bar color of the data bar.
* @memberof ApiDatabar
* @returns {ApiColor | null} Returns the ApiColor object representing the negative bar color, or null if not specified.
* @since 9.1.0
*/
ApiDatabar.prototype.GetNegativeBarColor = function() { return new ApiColor(); };

/**
* Sets the negative bar color for the data bar.
* @memberof ApiDatabar
* @param {ApiColor} oColor - The ApiColor object for the negative bars.
* @since 9.1.0
*/
ApiDatabar.prototype.SetNegativeBarColor = function(oColor) {};

/**
* Returns the negative bar border color of the data bar.
* @memberof ApiDatabar
* @returns {ApiColor | null} Returns the ApiColor object representing the negative bar border color, or null if not specified.
* @since 9.1.0
*/
ApiDatabar.prototype.GetNegativeBorderColor = function() { return new ApiColor(); };

/**
* Sets the negative bar border color for the data bar.
* @memberof ApiDatabar
* @param {ApiColor} oColor - The ApiColor object for the negative bar borders.
* @since 9.1.0
*/
ApiDatabar.prototype.SetNegativeBorderColor = function(oColor) {};

/**
* Returns the bar border color of the data bar.
* @memberof ApiDatabar
* @returns {ApiColor | null} Returns the ApiColor object representing the bar border color, or null if not specified.
* @since 9.1.0
*/
ApiDatabar.prototype.GetBarBorderColor = function() { return new ApiColor(); };

/**
* Sets the bar border color for the data bar.
* @memberof ApiDatabar
* @param {ApiColor} oColor - The ApiColor object for the bar borders.
* @since 9.1.0
*/
ApiDatabar.prototype.SetBarBorderColor = function(oColor) {};

/**
* Returns the percent maximum value of the data bar.
* @memberof ApiDatabar
* @returns {number} The maximum length of the data bar in percent.
* @since 9.1.0
*/
ApiDatabar.prototype.GetPercentMax = function() { return 0; };

/**
* Sets the percent maximum value for the data bar.
* @memberof ApiDatabar
* @param {number} percent - The maximum length of the data bar in percent.
* @since 9.1.0
*/
ApiDatabar.prototype.SetPercentMax = function(percent) {};

/**
* Returns the percent minimum value of the data bar.
* @memberof ApiDatabar
* @returns {number} Returns the minimum length of the data bar in percent.
* @since 9.1.0
*/
ApiDatabar.prototype.GetPercentMin = function() { return 0; };

/**
* Sets the percent minimum value for the data bar.
* @memberof ApiDatabar
* @param {number} percent - The minimum length of the data bar in percent.
* @since 9.1.0
*/
ApiDatabar.prototype.SetPercentMin = function(percent) {};

/**
* Returns the formula of the data bar.
* @memberof ApiDatabar
* @returns {string} Returns the formula string.
* @since 9.1.0
*/
ApiDatabar.prototype.GetFormula = function() { return ""; };

/**
* Returns the type of the data bar conditional formatting rule.
* @memberof ApiDatabar
* @returns {XlFormatConditionType} The type of the data bar conditional formatting rule.
* @since 9.1.0
*/
ApiDatabar.prototype.GetType = function() { return new XlFormatConditionType(); };

/**
* Deletes the current format condition.
* @memberof ApiFormatCondition
* @since 9.1.0
*/
ApiDatabar.prototype.Delete = function() {};

/**
* Modifies the current format condition with the specified parameters.
* @memberof ApiFormatCondition
* @param {XlFormatConditionType} [Type] - The format condition type.
* @param {XlFormatConditionOperator} [Operator] - The format condition operator.
* @param {string | number | ApiRange} [Formula1] - The first formula.
* @param {string | number | ApiRange} [Formula2] - The second formula.
* @returns {ApiFormatCondition | null} The modified format condition, or null if the rule does not exist.
* @since 9.1.0
*/
ApiDatabar.prototype.Modify = function(Type, Operator, Formula1, Formula2) { return new ApiFormatCondition(); };

/**
* Sets the cell range to which the current conditional formatting rule applies.
* @memberof ApiFormatCondition
* @param {ApiRange} Range - The range to which the current conditional formatting rule will be applied.
* @since 9.1.0
*/
ApiDatabar.prototype.ModifyAppliesToRange = function(Range) {};

/**
* Sets the priority value for the current conditional formatting rule to "1" so that it will be evaluated before all other rules on the worksheet.
* @memberof ApiFormatCondition
* @since 9.1.0
*/
ApiDatabar.prototype.SetFirstPriority = function() {};

/**
* Sets the evaluation order for the current conditional formatting rule so it is evaluated after all other rules on the worksheet.
* @memberof ApiFormatCondition
* @since 9.1.0
*/
ApiDatabar.prototype.SetLastPriority = function() {};

/**
* Returns the range of cells to which the current conditional formatting rule applies.
* @memberof ApiFormatCondition
* @returns {ApiRange | null} The range of cells affected by the current condition, or null if no range is set.
* @since 9.1.0
*/
ApiDatabar.prototype.GetAppliesTo = function() { return new ApiRange(); };

/**
* Returns the font applied by the current format condition.
* @memberof ApiFormatCondition
* @returns {ApiFont | null} An ApiFont object representing the font applied by the format condition, or null if no font is defined.
* @since 9.1.0
*/
ApiDatabar.prototype.GetFont = function() { return new ApiFont(); };

/**
* Returns the first formula used by the current conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {string} The first formula.
* @since 9.1.0
*/
ApiDatabar.prototype.GetFormula1 = function() { return ""; };

/**
* Returns the second formula used by the current conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {string} The second formula.
* @since 9.1.0
*/
ApiDatabar.prototype.GetFormula2 = function() { return ""; };

/**
* Sets the number format applied to a cell when the conditional formatting rule evaluates to true.
* @memberof ApiFormatCondition
* @param {string} NumberFormat - The number format code (e.g., "General", "#,##0.00", etc.)
* @since 9.1.0
*/
ApiDatabar.prototype.SetNumberFormat = function(NumberFormat) {};

/**
* Returns the number format applied to a cell when the conditional formatting rule evaluates to true.
* @memberof ApiFormatCondition
* @returns {string} The number format.
* @since 9.1.0
*/
ApiDatabar.prototype.GetNumberFormat = function() { return ""; };

/**
* Returns the format condition operator.
* @memberof ApiFormatCondition
* @returns {XlFormatConditionOperator} The format condition operator.
* @since 9.1.0
*/
ApiDatabar.prototype.GetOperator = function() { return new XlFormatConditionOperator(); };

/**
* Returns the parent range object of the current format condition.
* @memberof ApiFormatCondition
* @returns {ApiRange} The parent range object.
* @since 9.1.0
*/
ApiDatabar.prototype.GetParent = function() { return new ApiRange(); };

/**
* Returns the pivot table condition object.
* @memberof ApiFormatCondition
* @returns {PTCondition | null} The pivot table condition object.
* @since 9.1.0
*/
ApiDatabar.prototype.GetPTCondition = function() { return new PTCondition(); };

/**
* Returns the priority value of the conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {number} The priority value of the conditional formatting rule.
* @since 9.1.0
*/
ApiDatabar.prototype.GetPriority = function() { return 0; };

/**
* Sets the priority value of the conditional formatting rule.
* @memberof ApiFormatCondition
* @param {number} Priority - The priority value (1-based).
* @since 9.1.0
*/
ApiDatabar.prototype.SetPriority = function(Priority) {};

/**
* Returns the scope type of the conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {XlPivotConditionScope} - Returns "xlSelectionScope" for normal ranges, "xlDataFieldScope" for entire worksheet, "xlFieldsScope" for pivot tables.
* @since 9.1.0
*/
ApiDatabar.prototype.GetScopeType = function() { return new XlPivotConditionScope(); };

/**
* Sets the scope type for the conditional formatting rule.
* @memberof ApiFormatCondition
* @param {XlPivotConditionScope} ScopeType - The scope type: "xlSelectionScope", "xlDataFieldScope", or "xlFieldsScope".
* @since 9.1.0
*/
ApiDatabar.prototype.SetScopeType = function(ScopeType) {};

/**
* Returns the text value used in text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @returns {string} The text value used in text-based conditional formatting rules.
* @since 9.1.0
*/
ApiDatabar.prototype.GetText = function() { return ""; };

/**
* Sets the text value used in text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @param {string} Text - The text value to compare against.
* @since 9.1.0
*/
ApiDatabar.prototype.SetText = function(Text) {};

/**
* Returns the text operator for text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @returns {XlContainsOperator | null} The operator defining how the text comparison is performed,
* or null if the rule is not text-based.
* @since 9.1.0
*/
ApiDatabar.prototype.GetTextOperator = function() { return new XlContainsOperator(); };

/**
* Sets the text operator for text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @param {XlContainsOperator} TextOperator - The text operator: "xlContains", "xlDoesNotContain", "xlBeginsWith", "xlEndsWith".
* @since 9.1.0
*/
ApiDatabar.prototype.SetTextOperator = function(TextOperator) {};

/**
* Returns the date operator for time period conditions.
* @memberof ApiFormatCondition
* @returns {XlTimePeriods | null} The time period operator that defines how the date condition is evaluated,
* or null if the rule is not date-based.
* @since 9.1.0
*/
ApiDatabar.prototype.GetDateOperator = function() { return new XlTimePeriods(); };

/**
* Sets the date operator for time period conditions.
* @memberof ApiFormatCondition
* @param {XlTimePeriods} DateOperator - The date operator for time period conditions.
* @since 9.1.0
*/
ApiDatabar.prototype.SetDateOperator = function(DateOperator) {};

/**
* Sets the border style for the conditional formatting rule.
* @memberof ApiFormatCondition
* @param {BordersIndex} bordersIndex - Specifies the cell border position.
* @param {LineStyle} lineStyle - Specifies the line style used to form the cell border.
* @param {ApiColor} oColor - The color object which specifies the color to be set to the cell border.
* @since 9.1.0
*/
ApiDatabar.prototype.SetBorders = function(bordersIndex, lineStyle, oColor) {};

/**
* Sets the background color to the format condition with the previously created color object.
* Sets 'No Fill' when previously created color object is null.
* @memberof ApiFormatCondition
* @param {ApiColor} oColor - The color object that specifies the background color for the format condition.
* @since 9.1.0
*/
ApiDatabar.prototype.SetFillColor = function(oColor) {};

/**
* Returns the background color for the format condition. Returns 'No Fill' when the background color of the format condition is null.
* @memberof ApiFormatCondition
* @returns {ApiColor|'No Fill'} - The background color applied by the format condition, or 'No Fill' if none is set.
* @since 9.1.0
*/
ApiDatabar.prototype.GetFillColor = function() { return new ApiColor(); };

/**
* Returns the icon set type used in the conditional formatting rule.
* @memberof ApiIconSetCondition
* @returns {XlIconSet | null} The icon set type, or null if not applicable.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.GetIconSet = function() { return new XlIconSet(); };

/**
* Sets the icon set type for the conditional formatting rule.
* @memberof ApiIconSetCondition
* @param {XlIconSet} iconSet - The icon set type to apply.
* @returns {boolean} True if the icon set was successfully set, false otherwise.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.SetIconSet = function(iconSet) { return true; };

/**
* Returns whether the thresholds for the icon set conditional format are determined by using percentiles.
* @memberof ApiIconSetCondition
* @returns {boolean} True if all thresholds are set to percentile, false otherwise.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.GetPercentileValues = function() { return true; };

/**
* Specifies whether the thresholds for the icon set conditional format are determined by using percentiles.
* @memberof ApiIconSetCondition
* @param {boolean} percentileValues - True to set all thresholds to percentile, false otherwise.
* @returns {boolean} True if the percentile values were successfully set, false otherwise.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.SetPercentileValues = function(percentileValues) { return true; };

/**
* Returns whether the icon order in the icon set rule is reversed.
* @memberof ApiIconSetCondition
* @returns {boolean | null} True if the icon order is reversed, false otherwise, or null if not applicable.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.GetReverseOrder = function() { return true; };

/**
* Specifies whether the icon order in the icon set rule is reversed.
* @memberof ApiIconSetCondition
* @param {boolean} reverse - True to reverse the icon order, false otherwise.
* @returns {boolean} True if the setting was successfully applied, false otherwise.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.SetReverseOrder = function(reverse) { return true; };

/**
* Returns whether only icons are displayed in the icon set rule (without cell values).
* @memberof ApiIconSetCondition
* @returns {boolean | null} True if only icons are shown, false if values are also shown, or null if not applicable.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.GetShowIconOnly = function() { return true; };

/**
* Specifies whether to display only icons in the icon set rule (without cell values).
* @memberof ApiIconSetCondition
* @param {boolean} showIconOnly - True to show only icons, false to show both icons and values.
* @returns {boolean} True if the setting was successfully applied, false otherwise.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.SetShowIconOnly = function(showIconOnly) { return true; };

/**
* Returns a collection of icon criteria that represent the threshold values and icons for the icon set conditional formatting rule.
* @memberof ApiIconSetCondition
* @returns {ApiIconCriterion[] | null} A collection of icon criteria objects, or null if the rule is not an icon set type.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.GetIconCriteria = function() { return []; };

/**
* Returns the formula associated with the icon set condition.
* @memberof ApiIconSetCondition
* @returns {string} The formula string, or empty string if no formula is set.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.GetFormula = function() { return ""; };

/**
* Returns the type of the icon set conditional formatting rule.
* @memberof ApiIconSetCondition
* @returns {XlFormatConditionType} The type of the icon set conditional formatting rule.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.GetType = function() { return new XlFormatConditionType(); };

/**
* Deletes the current format condition.
* @memberof ApiFormatCondition
* @since 9.1.0
*/
ApiIconSetCondition.prototype.Delete = function() {};

/**
* Modifies the current format condition with the specified parameters.
* @memberof ApiFormatCondition
* @param {XlFormatConditionType} [Type] - The format condition type.
* @param {XlFormatConditionOperator} [Operator] - The format condition operator.
* @param {string | number | ApiRange} [Formula1] - The first formula.
* @param {string | number | ApiRange} [Formula2] - The second formula.
* @returns {ApiFormatCondition | null} The modified format condition, or null if the rule does not exist.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.Modify = function(Type, Operator, Formula1, Formula2) { return new ApiFormatCondition(); };

/**
* Sets the cell range to which the current conditional formatting rule applies.
* @memberof ApiFormatCondition
* @param {ApiRange} Range - The range to which the current conditional formatting rule will be applied.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.ModifyAppliesToRange = function(Range) {};

/**
* Sets the priority value for the current conditional formatting rule to "1" so that it will be evaluated before all other rules on the worksheet.
* @memberof ApiFormatCondition
* @since 9.1.0
*/
ApiIconSetCondition.prototype.SetFirstPriority = function() {};

/**
* Sets the evaluation order for the current conditional formatting rule so it is evaluated after all other rules on the worksheet.
* @memberof ApiFormatCondition
* @since 9.1.0
*/
ApiIconSetCondition.prototype.SetLastPriority = function() {};

/**
* Returns the range of cells to which the current conditional formatting rule applies.
* @memberof ApiFormatCondition
* @returns {ApiRange | null} The range of cells affected by the current condition, or null if no range is set.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.GetAppliesTo = function() { return new ApiRange(); };

/**
* Returns the font applied by the current format condition.
* @memberof ApiFormatCondition
* @returns {ApiFont | null} An ApiFont object representing the font applied by the format condition, or null if no font is defined.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.GetFont = function() { return new ApiFont(); };

/**
* Returns the first formula used by the current conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {string} The first formula.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.GetFormula1 = function() { return ""; };

/**
* Returns the second formula used by the current conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {string} The second formula.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.GetFormula2 = function() { return ""; };

/**
* Sets the number format applied to a cell when the conditional formatting rule evaluates to true.
* @memberof ApiFormatCondition
* @param {string} NumberFormat - The number format code (e.g., "General", "#,##0.00", etc.)
* @since 9.1.0
*/
ApiIconSetCondition.prototype.SetNumberFormat = function(NumberFormat) {};

/**
* Returns the number format applied to a cell when the conditional formatting rule evaluates to true.
* @memberof ApiFormatCondition
* @returns {string} The number format.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.GetNumberFormat = function() { return ""; };

/**
* Returns the format condition operator.
* @memberof ApiFormatCondition
* @returns {XlFormatConditionOperator} The format condition operator.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.GetOperator = function() { return new XlFormatConditionOperator(); };

/**
* Returns the parent range object of the current format condition.
* @memberof ApiFormatCondition
* @returns {ApiRange} The parent range object.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.GetParent = function() { return new ApiRange(); };

/**
* Returns the pivot table condition object.
* @memberof ApiFormatCondition
* @returns {PTCondition | null} The pivot table condition object.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.GetPTCondition = function() { return new PTCondition(); };

/**
* Returns the priority value of the conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {number} The priority value of the conditional formatting rule.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.GetPriority = function() { return 0; };

/**
* Sets the priority value of the conditional formatting rule.
* @memberof ApiFormatCondition
* @param {number} Priority - The priority value (1-based).
* @since 9.1.0
*/
ApiIconSetCondition.prototype.SetPriority = function(Priority) {};

/**
* Returns the scope type of the conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {XlPivotConditionScope} - Returns "xlSelectionScope" for normal ranges, "xlDataFieldScope" for entire worksheet, "xlFieldsScope" for pivot tables.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.GetScopeType = function() { return new XlPivotConditionScope(); };

/**
* Sets the scope type for the conditional formatting rule.
* @memberof ApiFormatCondition
* @param {XlPivotConditionScope} ScopeType - The scope type: "xlSelectionScope", "xlDataFieldScope", or "xlFieldsScope".
* @since 9.1.0
*/
ApiIconSetCondition.prototype.SetScopeType = function(ScopeType) {};

/**
* Returns the text value used in text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @returns {string} The text value used in text-based conditional formatting rules.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.GetText = function() { return ""; };

/**
* Sets the text value used in text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @param {string} Text - The text value to compare against.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.SetText = function(Text) {};

/**
* Returns the text operator for text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @returns {XlContainsOperator | null} The operator defining how the text comparison is performed,
* or null if the rule is not text-based.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.GetTextOperator = function() { return new XlContainsOperator(); };

/**
* Sets the text operator for text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @param {XlContainsOperator} TextOperator - The text operator: "xlContains", "xlDoesNotContain", "xlBeginsWith", "xlEndsWith".
* @since 9.1.0
*/
ApiIconSetCondition.prototype.SetTextOperator = function(TextOperator) {};

/**
* Returns the date operator for time period conditions.
* @memberof ApiFormatCondition
* @returns {XlTimePeriods | null} The time period operator that defines how the date condition is evaluated,
* or null if the rule is not date-based.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.GetDateOperator = function() { return new XlTimePeriods(); };

/**
* Sets the date operator for time period conditions.
* @memberof ApiFormatCondition
* @param {XlTimePeriods} DateOperator - The date operator for time period conditions.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.SetDateOperator = function(DateOperator) {};

/**
* Sets the border style for the conditional formatting rule.
* @memberof ApiFormatCondition
* @param {BordersIndex} bordersIndex - Specifies the cell border position.
* @param {LineStyle} lineStyle - Specifies the line style used to form the cell border.
* @param {ApiColor} oColor - The color object which specifies the color to be set to the cell border.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.SetBorders = function(bordersIndex, lineStyle, oColor) {};

/**
* Sets the background color to the format condition with the previously created color object.
* Sets 'No Fill' when previously created color object is null.
* @memberof ApiFormatCondition
* @param {ApiColor} oColor - The color object that specifies the background color for the format condition.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.SetFillColor = function(oColor) {};

/**
* Returns the background color for the format condition. Returns 'No Fill' when the background color of the format condition is null.
* @memberof ApiFormatCondition
* @returns {ApiColor|'No Fill'} - The background color applied by the format condition, or 'No Fill' if none is set.
* @since 9.1.0
*/
ApiIconSetCondition.prototype.GetFillColor = function() { return new ApiColor(); };

/**
* Returns the condition value type for the icon criterion.
* @memberof ApiIconCriterion
* @returns {XlConditionValueTypes | null} The condition value type, or null if not available.
* @since 9.1.0
*/
ApiIconCriterion.prototype.GetType = function() { return new XlConditionValueTypes(); };

/**
* Sets the condition value type for the icon criterion.
* @memberof ApiIconCriterion
* @param {XlConditionValueTypes} type - The condition value type. Only "xlConditionValueNumber", "xlConditionValuePercent", "xlConditionValuePercentile", or "xlConditionValueFormula" are supported.
* @since 9.1.0
*/
ApiIconCriterion.prototype.SetType = function(type) {};

/**
* Returns the threshold value for the icon criterion.
* @memberof ApiIconCriterion
* @returns {string | number | null} The threshold value, or null if not available.
* @since 9.1.0
*/
ApiIconCriterion.prototype.GetValue = function() { return ""; };

/**
* Sets the threshold value for the icon criterion.
* @memberof ApiIconCriterion
* @param {string | number} value - The threshold value to set.
* @since 9.1.0
*/
ApiIconCriterion.prototype.SetValue = function(value) {};

/**
* Returns the comparison operator of the icon criterion.
* @memberof ApiIconCriterion
* @returns {string | null} The operator ("xlGreaterEqual" or "xlGreater"), or null if not available.
* @since 9.1.0
*/
ApiIconCriterion.prototype.GetOperator = function() { return ""; };

/**
* Sets the comparison operator for the icon criterion.
* @memberof ApiIconCriterion
* @param {string} operator - The operator to set ("xlGreaterEqual" or "xlGreater").
* @since 9.1.0
*/
ApiIconCriterion.prototype.SetOperator = function(operator) {};

/**
* Returns the index of the icon criterion in the collection.
* @memberof ApiIconCriterion
* @returns {number} The 1-based index of the icon criterion.
* @since 9.1.0
*/
ApiIconCriterion.prototype.GetIndex = function() { return 0; };

/**
* Returns the icon associated with the current icon criterion.
* @memberof ApiIconCriterion
* @returns {XlIcon | null} The icon constant, or null if not available.
* @since 9.1.0
*/
ApiIconCriterion.prototype.GetIcon = function() { return new XlIcon(); };

/**
* Sets the icon for the current icon criterion.
* @memberof ApiIconCriterion
* @param {XlIcon} icon - The icon constant to set.
* @since 9.1.0
*/
ApiIconCriterion.prototype.SetIcon = function(icon) {};

/**
* Returns the "XlTopBottom" constant indicating whether the ranking is evaluated from the top or bottom.
* @memberof ApiTop10
* @returns {XlTopBottom} The ranking direction.
* @since 9.1.0
*/
ApiTop10.prototype.GetTopBottom = function() { return new XlTopBottom(); };

/**
* Sets the "XlTopBottom" constant indicating whether the ranking is evaluated from the top or bottom.
* @memberof ApiTop10
* @param {XlTopBottom} topBottom - The ranking direction.
* @since 9.1.0
*/
ApiTop10.prototype.SetTopBottom = function(topBottom) {};

/**
* Returns whether the top 10 ranking is percentage-based.
* @memberof ApiTop10
* @returns {boolean} True if the ranking is percentage-based, false if count-based.
* @since 9.1.0
*/
ApiTop10.prototype.GetPercent = function() { return true; };

/**
* Sets whether the top 10 ranking is percentage-based.
* @memberof ApiTop10
* @param {boolean} percent - True if the ranking is percentage-based, false if count-based.
* @since 9.1.0
*/
ApiTop10.prototype.SetPercent = function(percent) {};

/**
* Returns the rank value for the top 10 condition.
* @memberof ApiTop10
* @returns {number} The rank value.
* @since 9.1.0
*/
ApiTop10.prototype.GetRank = function() { return 0; };

/**
* Sets the rank value for the top 10 condition.
* @memberof ApiTop10
* @param {number} rank - The rank value.
* @since 9.1.0
*/
ApiTop10.prototype.SetRank = function(rank) {};

/**
* Returns the type of the top 10 conditional formatting rule.
* @memberof ApiTop10
* @returns {XlFormatConditionType} The type of the top 10 conditional formatting rule.
* @since 9.1.0
*/
ApiTop10.prototype.GetType = function() { return new XlFormatConditionType(); };

/**
* Deletes the current format condition.
* @memberof ApiFormatCondition
* @since 9.1.0
*/
ApiTop10.prototype.Delete = function() {};

/**
* Modifies the current format condition with the specified parameters.
* @memberof ApiFormatCondition
* @param {XlFormatConditionType} [Type] - The format condition type.
* @param {XlFormatConditionOperator} [Operator] - The format condition operator.
* @param {string | number | ApiRange} [Formula1] - The first formula.
* @param {string | number | ApiRange} [Formula2] - The second formula.
* @returns {ApiFormatCondition | null} The modified format condition, or null if the rule does not exist.
* @since 9.1.0
*/
ApiTop10.prototype.Modify = function(Type, Operator, Formula1, Formula2) { return new ApiFormatCondition(); };

/**
* Sets the cell range to which the current conditional formatting rule applies.
* @memberof ApiFormatCondition
* @param {ApiRange} Range - The range to which the current conditional formatting rule will be applied.
* @since 9.1.0
*/
ApiTop10.prototype.ModifyAppliesToRange = function(Range) {};

/**
* Sets the priority value for the current conditional formatting rule to "1" so that it will be evaluated before all other rules on the worksheet.
* @memberof ApiFormatCondition
* @since 9.1.0
*/
ApiTop10.prototype.SetFirstPriority = function() {};

/**
* Sets the evaluation order for the current conditional formatting rule so it is evaluated after all other rules on the worksheet.
* @memberof ApiFormatCondition
* @since 9.1.0
*/
ApiTop10.prototype.SetLastPriority = function() {};

/**
* Returns the range of cells to which the current conditional formatting rule applies.
* @memberof ApiFormatCondition
* @returns {ApiRange | null} The range of cells affected by the current condition, or null if no range is set.
* @since 9.1.0
*/
ApiTop10.prototype.GetAppliesTo = function() { return new ApiRange(); };

/**
* Returns the font applied by the current format condition.
* @memberof ApiFormatCondition
* @returns {ApiFont | null} An ApiFont object representing the font applied by the format condition, or null if no font is defined.
* @since 9.1.0
*/
ApiTop10.prototype.GetFont = function() { return new ApiFont(); };

/**
* Returns the first formula used by the current conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {string} The first formula.
* @since 9.1.0
*/
ApiTop10.prototype.GetFormula1 = function() { return ""; };

/**
* Returns the second formula used by the current conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {string} The second formula.
* @since 9.1.0
*/
ApiTop10.prototype.GetFormula2 = function() { return ""; };

/**
* Sets the number format applied to a cell when the conditional formatting rule evaluates to true.
* @memberof ApiFormatCondition
* @param {string} NumberFormat - The number format code (e.g., "General", "#,##0.00", etc.)
* @since 9.1.0
*/
ApiTop10.prototype.SetNumberFormat = function(NumberFormat) {};

/**
* Returns the number format applied to a cell when the conditional formatting rule evaluates to true.
* @memberof ApiFormatCondition
* @returns {string} The number format.
* @since 9.1.0
*/
ApiTop10.prototype.GetNumberFormat = function() { return ""; };

/**
* Returns the format condition operator.
* @memberof ApiFormatCondition
* @returns {XlFormatConditionOperator} The format condition operator.
* @since 9.1.0
*/
ApiTop10.prototype.GetOperator = function() { return new XlFormatConditionOperator(); };

/**
* Returns the parent range object of the current format condition.
* @memberof ApiFormatCondition
* @returns {ApiRange} The parent range object.
* @since 9.1.0
*/
ApiTop10.prototype.GetParent = function() { return new ApiRange(); };

/**
* Returns the pivot table condition object.
* @memberof ApiFormatCondition
* @returns {PTCondition | null} The pivot table condition object.
* @since 9.1.0
*/
ApiTop10.prototype.GetPTCondition = function() { return new PTCondition(); };

/**
* Returns the priority value of the conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {number} The priority value of the conditional formatting rule.
* @since 9.1.0
*/
ApiTop10.prototype.GetPriority = function() { return 0; };

/**
* Sets the priority value of the conditional formatting rule.
* @memberof ApiFormatCondition
* @param {number} Priority - The priority value (1-based).
* @since 9.1.0
*/
ApiTop10.prototype.SetPriority = function(Priority) {};

/**
* Returns the scope type of the conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {XlPivotConditionScope} - Returns "xlSelectionScope" for normal ranges, "xlDataFieldScope" for entire worksheet, "xlFieldsScope" for pivot tables.
* @since 9.1.0
*/
ApiTop10.prototype.GetScopeType = function() { return new XlPivotConditionScope(); };

/**
* Sets the scope type for the conditional formatting rule.
* @memberof ApiFormatCondition
* @param {XlPivotConditionScope} ScopeType - The scope type: "xlSelectionScope", "xlDataFieldScope", or "xlFieldsScope".
* @since 9.1.0
*/
ApiTop10.prototype.SetScopeType = function(ScopeType) {};

/**
* Returns the text value used in text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @returns {string} The text value used in text-based conditional formatting rules.
* @since 9.1.0
*/
ApiTop10.prototype.GetText = function() { return ""; };

/**
* Sets the text value used in text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @param {string} Text - The text value to compare against.
* @since 9.1.0
*/
ApiTop10.prototype.SetText = function(Text) {};

/**
* Returns the text operator for text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @returns {XlContainsOperator | null} The operator defining how the text comparison is performed,
* or null if the rule is not text-based.
* @since 9.1.0
*/
ApiTop10.prototype.GetTextOperator = function() { return new XlContainsOperator(); };

/**
* Sets the text operator for text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @param {XlContainsOperator} TextOperator - The text operator: "xlContains", "xlDoesNotContain", "xlBeginsWith", "xlEndsWith".
* @since 9.1.0
*/
ApiTop10.prototype.SetTextOperator = function(TextOperator) {};

/**
* Returns the date operator for time period conditions.
* @memberof ApiFormatCondition
* @returns {XlTimePeriods | null} The time period operator that defines how the date condition is evaluated,
* or null if the rule is not date-based.
* @since 9.1.0
*/
ApiTop10.prototype.GetDateOperator = function() { return new XlTimePeriods(); };

/**
* Sets the date operator for time period conditions.
* @memberof ApiFormatCondition
* @param {XlTimePeriods} DateOperator - The date operator for time period conditions.
* @since 9.1.0
*/
ApiTop10.prototype.SetDateOperator = function(DateOperator) {};

/**
* Sets the border style for the conditional formatting rule.
* @memberof ApiFormatCondition
* @param {BordersIndex} bordersIndex - Specifies the cell border position.
* @param {LineStyle} lineStyle - Specifies the line style used to form the cell border.
* @param {ApiColor} oColor - The color object which specifies the color to be set to the cell border.
* @since 9.1.0
*/
ApiTop10.prototype.SetBorders = function(bordersIndex, lineStyle, oColor) {};

/**
* Sets the background color to the format condition with the previously created color object.
* Sets 'No Fill' when previously created color object is null.
* @memberof ApiFormatCondition
* @param {ApiColor} oColor - The color object that specifies the background color for the format condition.
* @since 9.1.0
*/
ApiTop10.prototype.SetFillColor = function(oColor) {};

/**
* Returns the background color for the format condition. Returns 'No Fill' when the background color of the format condition is null.
* @memberof ApiFormatCondition
* @returns {ApiColor|'No Fill'} - The background color applied by the format condition, or 'No Fill' if none is set.
* @since 9.1.0
*/
ApiTop10.prototype.GetFillColor = function() { return new ApiColor(); };

/**
* Returns the setting that specifies whether to format duplicate or unique values for the unique values conditional formatting rule.
* @memberof ApiUniqueValues
* @returns {XlDuplicateValues} Specifies whether to format duplicate or unique values.
* @since 9.1.0
*/
ApiUniqueValues.prototype.GetDupeUnique = function() { return new XlDuplicateValues(); };

/**
* Sets the setting that specifies whether to format duplicate or unique values for the unique values conditional formatting rule.
* @memberof ApiUniqueValues
* @param {XlDuplicateValues} dupeUnique - Specifies whether to format duplicate or unique values.
* @since 9.1.0
*/
ApiUniqueValues.prototype.SetDupeUnique = function(dupeUnique) {};

/**
* Returns the type of the unique values conditional formatting rule.
* @memberof ApiUniqueValues
* @returns {XlFormatConditionType} The type of the unique values conditional formatting rule.
* @since 9.1.0
*/
ApiUniqueValues.prototype.GetType = function() { return new XlFormatConditionType(); };

/**
* Deletes the current format condition.
* @memberof ApiFormatCondition
* @since 9.1.0
*/
ApiUniqueValues.prototype.Delete = function() {};

/**
* Modifies the current format condition with the specified parameters.
* @memberof ApiFormatCondition
* @param {XlFormatConditionType} [Type] - The format condition type.
* @param {XlFormatConditionOperator} [Operator] - The format condition operator.
* @param {string | number | ApiRange} [Formula1] - The first formula.
* @param {string | number | ApiRange} [Formula2] - The second formula.
* @returns {ApiFormatCondition | null} The modified format condition, or null if the rule does not exist.
* @since 9.1.0
*/
ApiUniqueValues.prototype.Modify = function(Type, Operator, Formula1, Formula2) { return new ApiFormatCondition(); };

/**
* Sets the cell range to which the current conditional formatting rule applies.
* @memberof ApiFormatCondition
* @param {ApiRange} Range - The range to which the current conditional formatting rule will be applied.
* @since 9.1.0
*/
ApiUniqueValues.prototype.ModifyAppliesToRange = function(Range) {};

/**
* Sets the priority value for the current conditional formatting rule to "1" so that it will be evaluated before all other rules on the worksheet.
* @memberof ApiFormatCondition
* @since 9.1.0
*/
ApiUniqueValues.prototype.SetFirstPriority = function() {};

/**
* Sets the evaluation order for the current conditional formatting rule so it is evaluated after all other rules on the worksheet.
* @memberof ApiFormatCondition
* @since 9.1.0
*/
ApiUniqueValues.prototype.SetLastPriority = function() {};

/**
* Returns the range of cells to which the current conditional formatting rule applies.
* @memberof ApiFormatCondition
* @returns {ApiRange | null} The range of cells affected by the current condition, or null if no range is set.
* @since 9.1.0
*/
ApiUniqueValues.prototype.GetAppliesTo = function() { return new ApiRange(); };

/**
* Returns the font applied by the current format condition.
* @memberof ApiFormatCondition
* @returns {ApiFont | null} An ApiFont object representing the font applied by the format condition, or null if no font is defined.
* @since 9.1.0
*/
ApiUniqueValues.prototype.GetFont = function() { return new ApiFont(); };

/**
* Returns the first formula used by the current conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {string} The first formula.
* @since 9.1.0
*/
ApiUniqueValues.prototype.GetFormula1 = function() { return ""; };

/**
* Returns the second formula used by the current conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {string} The second formula.
* @since 9.1.0
*/
ApiUniqueValues.prototype.GetFormula2 = function() { return ""; };

/**
* Sets the number format applied to a cell when the conditional formatting rule evaluates to true.
* @memberof ApiFormatCondition
* @param {string} NumberFormat - The number format code (e.g., "General", "#,##0.00", etc.)
* @since 9.1.0
*/
ApiUniqueValues.prototype.SetNumberFormat = function(NumberFormat) {};

/**
* Returns the number format applied to a cell when the conditional formatting rule evaluates to true.
* @memberof ApiFormatCondition
* @returns {string} The number format.
* @since 9.1.0
*/
ApiUniqueValues.prototype.GetNumberFormat = function() { return ""; };

/**
* Returns the format condition operator.
* @memberof ApiFormatCondition
* @returns {XlFormatConditionOperator} The format condition operator.
* @since 9.1.0
*/
ApiUniqueValues.prototype.GetOperator = function() { return new XlFormatConditionOperator(); };

/**
* Returns the parent range object of the current format condition.
* @memberof ApiFormatCondition
* @returns {ApiRange} The parent range object.
* @since 9.1.0
*/
ApiUniqueValues.prototype.GetParent = function() { return new ApiRange(); };

/**
* Returns the pivot table condition object.
* @memberof ApiFormatCondition
* @returns {PTCondition | null} The pivot table condition object.
* @since 9.1.0
*/
ApiUniqueValues.prototype.GetPTCondition = function() { return new PTCondition(); };

/**
* Returns the priority value of the conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {number} The priority value of the conditional formatting rule.
* @since 9.1.0
*/
ApiUniqueValues.prototype.GetPriority = function() { return 0; };

/**
* Sets the priority value of the conditional formatting rule.
* @memberof ApiFormatCondition
* @param {number} Priority - The priority value (1-based).
* @since 9.1.0
*/
ApiUniqueValues.prototype.SetPriority = function(Priority) {};

/**
* Returns the scope type of the conditional formatting rule.
* @memberof ApiFormatCondition
* @returns {XlPivotConditionScope} - Returns "xlSelectionScope" for normal ranges, "xlDataFieldScope" for entire worksheet, "xlFieldsScope" for pivot tables.
* @since 9.1.0
*/
ApiUniqueValues.prototype.GetScopeType = function() { return new XlPivotConditionScope(); };

/**
* Sets the scope type for the conditional formatting rule.
* @memberof ApiFormatCondition
* @param {XlPivotConditionScope} ScopeType - The scope type: "xlSelectionScope", "xlDataFieldScope", or "xlFieldsScope".
* @since 9.1.0
*/
ApiUniqueValues.prototype.SetScopeType = function(ScopeType) {};

/**
* Returns the text value used in text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @returns {string} The text value used in text-based conditional formatting rules.
* @since 9.1.0
*/
ApiUniqueValues.prototype.GetText = function() { return ""; };

/**
* Sets the text value used in text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @param {string} Text - The text value to compare against.
* @since 9.1.0
*/
ApiUniqueValues.prototype.SetText = function(Text) {};

/**
* Returns the text operator for text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @returns {XlContainsOperator | null} The operator defining how the text comparison is performed,
* or null if the rule is not text-based.
* @since 9.1.0
*/
ApiUniqueValues.prototype.GetTextOperator = function() { return new XlContainsOperator(); };

/**
* Sets the text operator for text-based conditional formatting rules.
* @memberof ApiFormatCondition
* @param {XlContainsOperator} TextOperator - The text operator: "xlContains", "xlDoesNotContain", "xlBeginsWith", "xlEndsWith".
* @since 9.1.0
*/
ApiUniqueValues.prototype.SetTextOperator = function(TextOperator) {};

/**
* Returns the date operator for time period conditions.
* @memberof ApiFormatCondition
* @returns {XlTimePeriods | null} The time period operator that defines how the date condition is evaluated,
* or null if the rule is not date-based.
* @since 9.1.0
*/
ApiUniqueValues.prototype.GetDateOperator = function() { return new XlTimePeriods(); };

/**
* Sets the date operator for time period conditions.
* @memberof ApiFormatCondition
* @param {XlTimePeriods} DateOperator - The date operator for time period conditions.
* @since 9.1.0
*/
ApiUniqueValues.prototype.SetDateOperator = function(DateOperator) {};

/**
* Sets the border style for the conditional formatting rule.
* @memberof ApiFormatCondition
* @param {BordersIndex} bordersIndex - Specifies the cell border position.
* @param {LineStyle} lineStyle - Specifies the line style used to form the cell border.
* @param {ApiColor} oColor - The color object which specifies the color to be set to the cell border.
* @since 9.1.0
*/
ApiUniqueValues.prototype.SetBorders = function(bordersIndex, lineStyle, oColor) {};

/**
* Sets the background color to the format condition with the previously created color object.
* Sets 'No Fill' when previously created color object is null.
* @memberof ApiFormatCondition
* @param {ApiColor} oColor - The color object that specifies the background color for the format condition.
* @since 9.1.0
*/
ApiUniqueValues.prototype.SetFillColor = function(oColor) {};

/**
* Returns the background color for the format condition. Returns 'No Fill' when the background color of the format condition is null.
* @memberof ApiFormatCondition
* @returns {ApiColor|'No Fill'} - The background color applied by the format condition, or 'No Fill' if none is set.
* @since 9.1.0
*/
ApiUniqueValues.prototype.GetFillColor = function() { return new ApiColor(); };

/**
* Reapplies the AutoFilter to the worksheet using the existing filter criteria.
*
* This method corresponds to the Excel AutoFilter.ApplyFilter behavior:
* it does not change the currently defined filter conditions; it only
* reevaluates which rows should be visible based on the active filters.
* If no AutoFilter is defined for the worksheet, the method does nothing.
*
* @memberof ApiAutoFilter
* @returns {void}
*/
ApiAutoFilter.prototype.ApplyFilter = function() { return new void(); };

/**
* Clears all filters and displays all rows in the AutoFilter range.
*
* This method corresponds to the Excel AutoFilter.ShowAllData behavior:
* it removes any active filtering from the worksheet while preserving the
* AutoFilter drop-downs on the header row. If no AutoFilter is defined
* for the worksheet, the method does nothing.
*
* @memberof ApiAutoFilter
* @returns {void}
*/
ApiAutoFilter.prototype.ShowAllData = function() { return new void(); };

/**
* Returns the array of ApiFilter objects that represents the filters applied to the AutoFilter range.
* @memberof ApiAutoFilter
* @returns {ApiFilter[]}
*/
ApiAutoFilter.prototype.GetFilters = function() { return []; };

/**
* Returns a value that indicates whether the worksheet has an AutoFilter applied.
* @memberof ApiAutoFilter
* @returns {boolean} true if the worksheet has an AutoFilter; otherwise, false.
*/
ApiAutoFilter.prototype.GetFilterMode = function() { return true; };

/**
* Returns the parent ApiWorksheet object for the AutoFilter.
* @memberof ApiAutoFilter
* @returns {ApiWorksheet}
*/
ApiAutoFilter.prototype.GetParent = function() { return new ApiWorksheet(); };

/**
* Returns the ApiRange object that represents the AutoFilter range.
* @memberof ApiAutoFilter
* @returns {ApiRange | null} The range to which the AutoFilter is applied; null if no AutoFilter is defined.
*/
ApiAutoFilter.prototype.GetRange = function() { return new ApiRange(); };

/**
* Returns the first criteria associated with the filter for this column.
*
*
* @memberof ApiFilter
* @returns {string|string[]|number|XlDynamicFilterCriteria|null} The first criteria for the filter.
*/
ApiFilter.prototype.GetCriteria1 = function() { return ""; };

/**
* Returns the second criteria associated with the filter for this column.
*
* @memberof ApiFilter
* @returns {string|null} The second criteria for the filter, or null if not applicable.
*/
ApiFilter.prototype.GetCriteria2 = function() { return ""; };

/**
* Indicates whether any filter is applied on this column.
*
* The property is true when at least one of the following underlying
* structures is present for the column:
* - Filters
* - CustomFiltersObj
* - DynamicFilter
* - ColorFilter
* - Top10
*
* @memberof ApiFilter
* @returns {boolean} True if a filter is applied; otherwise, false.
*/
ApiFilter.prototype.GetOn = function() { return true; };

/**
* Returns the operator used for the filter on this column.
*
* @memberof ApiFilter
* @returns {XlAutoFilterOperator|null} The operator for the current filter.
*/
ApiFilter.prototype.GetOperator = function() { return new XlAutoFilterOperator(); };

/**
* Returns the parent filters collection for this filter column.
* @memberof ApiFilter
* @returns {ApiAutoFilter} The parent filters collection.
*/
ApiFilter.prototype.GetParent = function() { return new ApiAutoFilter(); };

/**
* Returns the range of the data body of the column, excluding the header and totals rows.
* @memberof ApiListColumn
* @returns {ApiRange | null}
*/
ApiListColumn.prototype.GetDataBodyRange = function() { return new ApiRange(); };

/**
* Returns the 1-based index of the column within the table.
* @memberof ApiListColumn
* @returns {number}
*/
ApiListColumn.prototype.GetIndex = function() { return 0; };

/**
* Returns the name of the table column.
* @memberof ApiListColumn
* @returns {string}
*/
ApiListColumn.prototype.GetName = function() { return ""; };

/**
* Sets the name of the table column.
* @memberof ApiListColumn
* @param {string} sName - The new column name.
*/
ApiListColumn.prototype.SetName = function(sName) {};

/**
* Returns the parent list object.
* @memberof ApiListColumn
* @returns {ApiListObject}
*/
ApiListColumn.prototype.GetParent = function() { return new ApiListObject(); };

/**
* Returns the range of the entire column, including the header and totals rows.
* @memberof ApiListColumn
* @returns {ApiRange | null}
*/
ApiListColumn.prototype.GetRange = function() { return new ApiRange(); };

/**
* Returns the totals calculation type for the column.
* @memberof ApiListColumn
* @returns {XlTotalsCalculation}
*/
ApiListColumn.prototype.GetTotalsCalculation = function() { return new XlTotalsCalculation(); };

/**
* Sets the totals calculation type for the column.
* @memberof ApiListColumn
* @param {XlTotalsCalculation} sType - The totals calculation type.
*/
ApiListColumn.prototype.SetTotalsCalculation = function(sType) {};

/**
* Returns the range of the totals row cell for the column.
* Returns null if the table has no totals row.
* @memberof ApiListColumn
* @returns {ApiRange | null}
*/
ApiListColumn.prototype.GetTotal = function() { return new ApiRange(); };

/**
* Deletes the column from the table.
* @memberof ApiListColumn
* @returns {boolean} - Returns false if the column cannot be deleted due to a table intersection conflict, otherwise true.
*/
ApiListColumn.prototype.Delete = function() { return true; };

/**
* Returns a Boolean value that indicates whether the ListObject is active,
* i.e., whether the active cell is within the range of the ListObject.
* @memberof ApiListObject
* @returns {boolean}
*/
ApiListObject.prototype.GetActive = function() { return true; };

/**
* Returns the alternative text for the table.
* @memberof ApiListObject
* @returns {string}
*/
ApiListObject.prototype.GetAlternativeText = function() { return ""; };

/**
* Sets the alternative text for the table.
* @memberof ApiListObject
* @param {string} sAltText - The alternative text string.
*/
ApiListObject.prototype.SetAlternativeText = function(sAltText) {};

/**
* Returns the comment (summary alternative text) for the table.
* @memberof ApiListObject
* @returns {string}
*/
ApiListObject.prototype.GetComment = function() { return ""; };

/**
* Sets the comment (summary alternative text) for the table.
* @memberof ApiListObject
* @param {string} sComment - The comment string.
*/
ApiListObject.prototype.SetComment = function(sComment) {};

/**
* Returns the display name of the table.
* @memberof ApiListObject
* @returns {string}
*/
ApiListObject.prototype.GetName = function() { return ""; };

/**
* Sets the name of the table. Equivalent to SetDisplayName.
* @memberof ApiListObject
* @param {string} sName
* @returns {boolean} - Returns false if the name is invalid or already used by another table.
*/
ApiListObject.prototype.SetName = function(sName) { return true; };

/**
* Returns the ApiWorksheet object that is the parent of the table.
* @memberof ApiListObject
* @returns {ApiWorksheet}
*/
ApiListObject.prototype.GetParent = function() { return new ApiWorksheet(); };

/**
* Returns the display name of the table.
* @memberof ApiListObject
* @returns {string}
*/
ApiListObject.prototype.GetDisplayName = function() { return ""; };

/**
* Sets the display name of the table.
* @memberof ApiListObject
* @param {string} sDisplayName - The new display name for the table.
* @returns {boolean} - Returns false if the name is invalid or already used by another table.
*/
ApiListObject.prototype.SetDisplayName = function(sDisplayName) { return true; };

/**
* Returns the ApiRange object that represents the range of the table.
* @memberof ApiListObject
* @returns {ApiRange | null}
*/
ApiListObject.prototype.GetRange = function() { return new ApiRange(); };

/**
* Returns the range of the header row of the table.
* Returns null if the table has no header row.
* @memberof ApiListObject
* @returns {ApiRange | null}
*/
ApiListObject.prototype.GetHeaderRowRange = function() { return new ApiRange(); };

/**
* Returns whether the AutoFilter dropdown buttons are displayed on the header row of the table.
* Returns true by default for a new table.
* @memberof ApiListObject
* @returns {boolean}
*/
ApiListObject.prototype.GetShowAutoFilter = function() { return true; };

/**
* Sets whether the AutoFilter is present on the table.
* Setting to false removes the AutoFilter entirely; setting to true creates it if not present.
* @memberof ApiListObject
* @param {boolean} bShow
*/
ApiListObject.prototype.SetShowAutoFilter = function(bShow) {};

/**
* Returns whether the AutoFilter dropdown arrows are displayed on the header row of the table.
* Returns true by default for a new table.
* @memberof ApiListObject
* @returns {boolean}
*/
ApiListObject.prototype.GetShowAutoFilterDropDown = function() { return true; };

/**
* Sets whether the AutoFilter dropdown arrows are displayed on the header row of the table.
* Does not remove the AutoFilter itself, only hides or shows the dropdown buttons.
* @memberof ApiListObject
* @param {boolean} bShow - Pass true to show the dropdown arrows, false to hide them.
*/
ApiListObject.prototype.SetShowAutoFilterDropDown = function(bShow) {};

/**
* Returns whether the header row is displayed for the table.
* @memberof ApiListObject
* @returns {boolean}
*/
ApiListObject.prototype.GetShowHeaders = function() { return true; };

/**
* Sets whether the header row is displayed for the table.
* @memberof ApiListObject
* @param {boolean} bShow
*/
ApiListObject.prototype.SetShowHeaders = function(bShow) {};

/**
* Returns the ApiAutoFilter object representing the autofilter applied to the table.
* Returns null if the table has no autofilter.
* @memberof ApiListObject
* @returns {ApiAutoFilter | null}
*/
ApiListObject.prototype.GetAutoFilter = function() { return new ApiAutoFilter(); };

/**
* Returns the range of the data rows in the table, excluding the header row and totals row.
* Returns null if the table has no data rows.
* @memberof ApiListObject
* @returns {ApiRange | null}
*/
ApiListObject.prototype.GetDataBodyRange = function() { return new ApiRange(); };

/**
* Returns whether banded column formatting is applied to the table.
* @memberof ApiListObject
* @returns {boolean}
*/
ApiListObject.prototype.GetShowTableStyleColumnStripes = function() { return true; };

/**
* Sets whether banded column formatting is applied to the table.
* @memberof ApiListObject
* @param {boolean} bShow
*/
ApiListObject.prototype.SetShowTableStyleColumnStripes = function(bShow) {};

/**
* Returns whether the first column formatting is applied to the table.
* @memberof ApiListObject
* @returns {boolean}
*/
ApiListObject.prototype.GetShowTableStyleFirstColumn = function() { return true; };

/**
* Sets whether the first column formatting is applied to the table.
* @memberof ApiListObject
* @param {boolean} bShow
*/
ApiListObject.prototype.SetShowTableStyleFirstColumn = function(bShow) {};

/**
* Returns whether the last column formatting is applied to the table.
* @memberof ApiListObject
* @returns {boolean}
*/
ApiListObject.prototype.GetShowTableStyleLastColumn = function() { return true; };

/**
* Sets whether the last column formatting is applied to the table.
* @memberof ApiListObject
* @param {boolean} bShow
*/
ApiListObject.prototype.SetShowTableStyleLastColumn = function(bShow) {};

/**
* Returns whether banded row formatting is applied to the table.
* @memberof ApiListObject
* @returns {boolean}
*/
ApiListObject.prototype.GetShowTableStyleRowStripes = function() { return true; };

/**
* Sets whether banded row formatting is applied to the table.
* @memberof ApiListObject
* @param {boolean} bShow
*/
ApiListObject.prototype.SetShowTableStyleRowStripes = function(bShow) {};

/**
* Returns whether the totals row is displayed for the table.
* @memberof ApiListObject
* @returns {boolean}
*/
ApiListObject.prototype.GetShowTotals = function() { return true; };

/**
* Sets whether the totals row is displayed for the table.
* @memberof ApiListObject
* @param {boolean} bShow
*/
ApiListObject.prototype.SetShowTotals = function(bShow) {};

/**
* Deletes the ListObject object and clears the cell formatting.
* @memberof ApiListObject
*/
ApiListObject.prototype.Delete = function() {};

/**
* Removes the list functionality from the ListObject and converts it to a regular data range.
* Cell data, formatting, and formulas remain on the sheet.
* @memberof ApiListObject
*/
ApiListObject.prototype.Unlist = function() {};

/**
* Resizes the ListObject to a new range. Cells are not inserted or moved.
* @memberof ApiListObject
* @param {ApiRange | string} Range - The new range for the table as an ApiRange object or address string, e.g. <b>"A1:D10"</b>.
*/
ApiListObject.prototype.Resize = function(Range) {};

/**
* Returns the source type of the table. Always returns "xlSrcRange" for range-based tables.
* @memberof ApiListObject
* @returns {string}
*/
ApiListObject.prototype.GetSourceType = function() { return ""; };

/**
* Returns the name of the table style applied to the table.
* @memberof ApiListObject
* @returns {string}
*/
ApiListObject.prototype.GetTableStyle = function() { return ""; };

/**
* Sets the table style by name.
* @memberof ApiListObject
* @param {string} sStyleName
*/
ApiListObject.prototype.SetTableStyle = function(sStyleName) {};

/**
* Returns the range of the totals row of the table.
* Returns null if the table has no totals row.
* @memberof ApiListObject
* @returns {ApiRange | null}
*/
ApiListObject.prototype.GetTotalsRowRange = function() { return new ApiRange(); };

/**
* Returns the summary description (alternative text summary) for the table.
* @memberof ApiListObject
* @returns {string}
*/
ApiListObject.prototype.GetSummary = function() { return ""; };

/**
* Sets the summary description (alternative text summary) for the table.
* @memberof ApiListObject
* @param {string} sSummary
*/
ApiListObject.prototype.SetSummary = function(sSummary) {};

/**
* Returns an array of all columns in the table.
* @memberof ApiListObject
* @returns {ApiListColumn[]}
*/
ApiListObject.prototype.GetListColumns = function() { return []; };

/**
* Adds a new column to the table at the specified 1-based position.
* If no position is provided, the column is appended at the end.
* @memberof ApiListObject
* @param {number} [nPosition] - The 1-based position at which to insert the new column.
* @returns {ApiListColumn | null}
*/
ApiListObject.prototype.AddListColumn = function(nPosition) { return new ApiListColumn(); };

/**
* Returns an array of all data rows in the table, excluding the header and totals rows.
* @memberof ApiListObject
* @returns {ApiListRow[]}
*/
ApiListObject.prototype.GetListRows = function() { return []; };

/**
* Adds a new data row to the table at the specified 1-based position.
* If no position is provided, the row is appended at the end.
* @memberof ApiListObject
* @param {number} [nPosition] - The 1-based position within the data body at which to insert the row. If omitted, the row is appended at the end.
* @param {boolean} [bAlwaysInsert=true] - Specifies whether cells outside the table are shifted when a row is added.
* @returns {ApiListRow | null}
*/
ApiListObject.prototype.AddListRow = function(nPosition, bAlwaysInsert) { return new ApiListRow(); };

/**
* Returns the Sort object for this list object.
* @memberof ApiListObject
* @returns {ApiSort}
*/
ApiListObject.prototype.GetSort = function() { return new ApiSort(); };

/**
* Returns the 1-based index of the row within the data body of the table.
* @memberof ApiListRow
* @returns {number}
*/
ApiListRow.prototype.GetIndex = function() { return 0; };

/**
* Returns the parent list object.
* @memberof ApiListRow
* @returns {ApiListObject}
*/
ApiListRow.prototype.GetParent = function() { return new ApiListObject(); };

/**
* Returns the range of the entire row, spanning all columns of the table.
* @memberof ApiListRow
* @returns {ApiRange | null}
*/
ApiListRow.prototype.GetRange = function() { return new ApiRange(); };

/**
* Deletes the row from the table.
* @memberof ApiListRow
* @returns {boolean} - Returns false if the row cannot be deleted due to a table intersection conflict, otherwise true.
*/
ApiListRow.prototype.Delete = function() { return true; };

/**
* Returns the sort fields collection.
* @memberof ApiSort
* @returns {ApiSortFields}
*/
ApiSort.prototype.GetSortFields = function() { return new ApiSortFields(); };

/**
* Returns whether the sort is case-sensitive.
* @memberof ApiSort
* @returns {boolean}
*/
ApiSort.prototype.GetMatchCase = function() { return true; };

/**
* Sets whether the sort is case-sensitive.
* @memberof ApiSort
* @param {boolean} bMatchCase
*/
ApiSort.prototype.SetMatchCase = function(bMatchCase) {};

/**
* Returns the header setting. Always "xlYes" for a ListObject.
* @memberof ApiSort
* @returns {string}
*/
ApiSort.prototype.GetHeader = function() { return ""; };

/**
* Returns the sort orientation: "xlTopToBottom" or "xlLeftToRight".
* @memberof ApiSort
* @returns {XlSortOrientation}
*/
ApiSort.prototype.GetOrientation = function() { return new XlSortOrientation(); };

/**
* Sets the sort orientation.
* @memberof ApiSort
* @param {XlSortOrientation} sOrientation
*/
ApiSort.prototype.SetOrientation = function(sOrientation) {};

/**
* Returns the sort method: "xlPinYin" or "xlStroke".
* @memberof ApiSort
* @returns {XlSortMethod}
*/
ApiSort.prototype.GetSortMethod = function() { return new XlSortMethod(); };

/**
* Sets the sort method.
* @memberof ApiSort
* @param {XlSortMethod} sSortMethod
*/
ApiSort.prototype.SetSortMethod = function(sSortMethod) {};

/**
* Returns the parent list object.
* @memberof ApiSort
* @returns {ApiListObject}
*/
ApiSort.prototype.GetParent = function() { return new ApiListObject(); };

/**
* Returns the data body range that the sort applies to.
* @memberof ApiSort
* @returns {ApiRange | null}
*/
ApiSort.prototype.GetRng = function() { return new ApiRange(); };

/**
* Applies the current sort settings to the table.
* @memberof ApiSort
*/
ApiSort.prototype.Apply = function() {};

/**
* Returns the parent Sort object.
* @memberof ApiSortFields
* @returns {ApiSort}
*/
ApiSortFields.prototype.GetParent = function() { return new ApiSort(); };

/**
* Returns the number of sort fields.
* @memberof ApiSortFields
* @returns {number}
*/
ApiSortFields.prototype.GetCount = function() { return 0; };

/**
* Returns the sort field at the given 1-based index.
* @memberof ApiSortFields
* @param {number} nIndex - 1-based index.
* @returns {ApiSortField | null}
*/
ApiSortFields.prototype.Item = function(nIndex) { return new ApiSortField(); };

/**
* Adds a sort field to the collection.
* @memberof ApiSortFields
* @param {ApiRange} Key - A range within the table that defines the sort column.
* @param {XlSortOn} [SortOn="xlSortOnValues"] - The value used as the sort criteria.
* @param {SortOrder} [Order="xlAscending"] - The sort order.
* @param {number | string} [CustomOrder=0] - Reserved. Custom order sorting is not yet supported by the engine.
* @param {XlSortDataOption} [DataOption="xlSortNormal"] - The data sort option.
* @returns {ApiSortField | null}
*/
ApiSortFields.prototype.Add = function(Key, SortOn, Order, CustomOrder, DataOption) { return new ApiSortField(); };

/**
* Adds a sort field with subfield support for linked data types (Stocks, Geography).
* @memberof ApiSortFields
* @param {ApiRange} Key - A range within the table that defines the sort column.
* @param {XlSortOn} [SortOn="xlSortOnValues"] - The value used as the sort criteria.
* @param {SortOrder} [Order="xlAscending"] - The sort order.
* @param {number | string} [CustomOrder=0] - Reserved. Custom order sorting is not yet supported by the engine.
* @param {XlSortDataOption} [DataOption="xlSortNormal"] - The data sort option.
* @param {string} [SubField] - Subfield name for linked data types (e.g. "Population", "Volume").
* @returns {ApiSortField | null}
*/
ApiSortFields.prototype.Add2 = function(Key, SortOn, Order, CustomOrder, DataOption, SubField) { return new ApiSortField(); };

/**
* Removes all sort fields from the collection.
* @memberof ApiSortFields
*/
ApiSortFields.prototype.Clear = function() {};

/**
* Returns the parent SortFields collection.
* @memberof ApiSortField
* @returns {ApiSortFields}
*/
ApiSortField.prototype.GetParent = function() { return new ApiSortFields(); };

/**
* Returns the sort key range (the full table column).
* @memberof ApiSortField
* @returns {ApiRange | null}
*/
ApiSortField.prototype.GetKey = function() { return new ApiRange(); };

/**
* Returns the sort-on type: "xlSortOnValues", "xlSortOnCellColor", "xlSortOnFontColor", "xlSortOnIcon".
* @memberof ApiSortField
* @returns {XlSortOn}
*/
ApiSortField.prototype.GetSortOn = function() { return new XlSortOn(); };

/**
* Sets the sort-on type.
* @memberof ApiSortField
* @param {XlSortOn} sSortOn - The value used as the sort criteria.
*/
ApiSortField.prototype.SetSortOn = function(sSortOn) {};

/**
* Returns the sort order: "xlAscending" or "xlDescending".
* @memberof ApiSortField
* @returns {SortOrder}
*/
ApiSortField.prototype.GetOrder = function() { return new SortOrder(); };

/**
* Sets the sort order.
* @memberof ApiSortField
* @param {SortOrder} sOrder - The sort order.
*/
ApiSortField.prototype.SetOrder = function(sOrder) {};

/**
* Returns the 1-based priority of this sort field within the collection.
* @memberof ApiSortField
* @returns {number}
*/
ApiSortField.prototype.GetPriority = function() { return 0; };

/**
* Sets the 1-based priority of this sort field, repositioning it within the collection.
* @memberof ApiSortField
* @param {number} nPriority
*/
ApiSortField.prototype.SetPriority = function(nPriority) {};

/**
* Returns the value (color or null) by which this sort field is sorted.
* For color-based sorts returns the fill/font color; otherwise returns null.
* @memberof ApiSortField
* @returns {ApiColor | null}
*/
ApiSortField.prototype.GetSortOnValue = function() { return new ApiColor(); };

/**
* Sets the color for color-based sorting.
* @memberof ApiSortField
* @param {ApiColor} oColor - The color to sort by.
* @param {XlSortOn} [sSortOn="xlSortOnCellColor"] - "xlSortOnCellColor" or "xlSortOnFontColor".
*/
ApiSortField.prototype.SetSortOnColor = function(oColor, sSortOn) {};

/**
* Changes the sort key column.
* @memberof ApiSortField
* @param {ApiRange} rng - New sort key range.
*/
ApiSortField.prototype.ModifyKey = function(rng) {};

/**
* Removes this sort field from the collection.
* @memberof ApiSortField
*/
ApiSortField.prototype.Delete = function() {};

