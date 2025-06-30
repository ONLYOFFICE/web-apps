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
 * Returns a type of the ApiRange class.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @returns {"range"}
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/GetClassType.js
 */
ApiRange.prototype.GetClassType = function(){ return ""; };

/**
 * Returns a paragraph from all the paragraphs that are in the range.
 * @typeofeditors ["CDE"]
 * @param {Number} nPos - The paragraph position in the range.
 * @returns {ApiParagraph | null} - returns null if position is invalid.
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/GetParagraph.js
 */
ApiRange.prototype.GetParagraph = function(nPos){ return new ApiParagraph(); };

/**
 * Adds a text to the specified position.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @param {String} text - The text that will be added.
 * @param {"after" | "before"} [position = "after"] - The position where the text will be added ("before" or "after" the range specified).
 * @returns {boolean} - returns true if the text was successfully added.
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/AddText.js
 */
ApiRange.prototype.AddText = function(text, position){ return true; };

/**
 * Adds a bookmark to the specified range.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @param {String} sName - The bookmark name.
 * @returns {boolean} - returns false if range is empty.
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/AddBookmark.js
 */
ApiRange.prototype.AddBookmark = function(sName){ return true; };

/**
 * Adds a hyperlink to the specified range. 
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @param {string} sLink - The link address.
 * @param {string} sScreenTipText - The screen tip text.
 * @returns {ApiHyperlink | null}  - returns null if range contains more than one paragraph or sLink is invalid. 
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/AddHyperlink.js
 */
ApiRange.prototype.AddHyperlink = function(sLink, sScreenTipText){ return new ApiHyperlink(); };

/**
 * Returns a text from the specified range.
 * @memberof ApiRange
 * @param {object} oPr - The resulting string display properties.
 * @param {boolean} [oPr.Numbering=false] - Defines if the resulting string will include numbering or not.
 * @param {boolean} [oPr.Math=false] - Defines if the resulting string will include mathematical expressions or not.
 * @param {string} [oPr.NewLineSeparator='\r'] - Defines how the line separator will be specified in the resulting string. Any symbol can be used. The default separator is "\r".
 * @param {string} [oPr.TableCellSeparator='\t'] - Defines how the table cell separator will be specified in the resulting string. Any symbol can be used. The default separator is "\t".
 * @param {string} [oPr.TableRowSeparator='\r\n'] - Defines how the table row separator will be specified in the resulting string. Any symbol can be used. The default separator is "\r\n".
 * @param {string} [oPr.ParaSeparator='\r\n'] - Defines how the paragraph separator will be specified in the resulting string. Any symbol can be used. The default separator is "\r\n".
 * @param {string} [oPr.TabSymbol='\t'] - Defines how the tab will be specified in the resulting string (does not apply to numbering). Any symbol can be used. The default symbol is "\t".
 * @typeofeditors ["CDE"]
 * @returns {String} - returns "" if range is empty.
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/GetText.js
 */
ApiRange.prototype.GetText = function(oPr){ return ""; };

/**
 * Returns a collection of paragraphs that represents all the paragraphs in the specified range.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @returns {ApiParagraph[]}
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/GetAllParagraphs.js
 */
ApiRange.prototype.GetAllParagraphs = function(){ return [new ApiParagraph()]; };

/**
 * Sets the selection to the specified range.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/Select.js
 */
ApiRange.prototype.Select = function(bUpdate){ return true; };

/**
 * Returns a new range that goes beyond the specified range in any direction and spans a different range. The current range has not changed.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @param {ApiRange} oRange - The range that will be expanded.
 * @returns {ApiRange | null} - returns null if the specified range can't be expanded. 
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/ExpandTo.js
 */
ApiRange.prototype.ExpandTo = function(oRange){ return new ApiRange(); };

/**
 * Returns a new range as the intersection of the current range with another range. The current range has not changed.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @param {ApiRange} oRange - The range that will be intersected with the current range.
 * @returns {ApiRange | null} - returns null if can't intersect.
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/IntersectWith.js
 */
ApiRange.prototype.IntersectWith = function(oRange){ return new ApiRange(); };

/**
 * Sets the bold property to the text character.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @param {boolean} isBold - Specifies if the Range contents are displayed bold or not.
 * @returns {ApiRange | null} - returns null if can't apply bold.
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/SetBold.js
 */
ApiRange.prototype.SetBold = function(isBold){ return new ApiRange(); };

/**
 * Specifies that any lowercase characters in the current text Range are formatted for display only as their capital letter character equivalents.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @param {boolean} isCaps - Specifies if the Range contents are displayed capitalized or not.
 * @returns {ApiRange | null} - returns null if can't apply caps.
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/SetCaps.js
 */
ApiRange.prototype.SetCaps = function(isCaps){ return new ApiRange(); };

/**
 * Sets the text color to the current text Range in the RGB format.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @param {boolean} [isAuto=false] - If this parameter is set to "true", then r,g,b parameters will be ignored.
 * @returns {ApiRange | null} - returns null if can't apply color.
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/SetColor.js
 */
ApiRange.prototype.SetColor = function(r, g, b, isAuto){ return new ApiRange(); };

/**
 * Specifies that the contents of the current Range are displayed with two horizontal lines through each character displayed on the line.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @param {boolean} isDoubleStrikeout - Specifies if the contents of the current Range are displayed double struck through or not.
 * @returns {ApiRange | null} - returns null if can't apply double strikeout.
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/SetDoubleStrikeout.js
 */
ApiRange.prototype.SetDoubleStrikeout = function(isDoubleStrikeout){ return new ApiRange(); };

/**
 * Specifies a highlighting color which is applied as a background to the contents of the current Range.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @param {highlightColor} sColor - Available highlight color.
 * @returns {ApiRange | null} - returns null if can't apply highlight.
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/SetHighlight.js
 */
ApiRange.prototype.SetHighlight = function(sColor){ return new ApiRange(); };

/**
 * Specifies the shading applied to the contents of the current text Range.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @param {ShdType} sType - The shading type applied to the contents of the current text Range.
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @returns {ApiRange | null} - returns null if can't apply shadow.
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/SetShd.js
 */
ApiRange.prototype.SetShd = function(sType, r, g, b){ return new ApiRange(); };

/**
 * Sets the italic property to the text character.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @param {boolean} isItalic - Specifies if the contents of the current Range are displayed italicized or not.
 * @returns {ApiRange | null} - returns null if can't apply italic.
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/SetItalic.js
 */
ApiRange.prototype.SetItalic = function(isItalic){ return new ApiRange(); };

/**
 * Specifies that the contents of the current Range are displayed with a single horizontal line through the range center.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @param {boolean} isStrikeout - Specifies if the contents of the current Range are displayed struck through or not.
 * @returns {ApiRange | null} - returns null if can't apply strikeout.
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/SetStrikeout.js
 */
ApiRange.prototype.SetStrikeout = function(isStrikeout){ return new ApiRange(); };

/**
 * Specifies that all the lowercase letter characters in the current text Range are formatted for display only as their capital
 * letter character equivalents which are two points smaller than the actual font size specified for this text.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @param {boolean} isSmallCaps - Specifies if the contents of the current Range are displayed capitalized two points smaller or not.
 * @returns {ApiRange | null} - returns null if can't apply small caps.
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/SetSmallCaps.js
 */
ApiRange.prototype.SetSmallCaps = function(isSmallCaps){ return new ApiRange(); };

/**
 * Sets the text spacing measured in twentieths of a point.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @param {twips} nSpacing - The value of the text spacing measured in twentieths of a point (1/1440 of an inch).
 * @returns {ApiRange | null} - returns null if can't apply spacing.
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/SetSpacing.js
 */
ApiRange.prototype.SetSpacing = function(nSpacing){ return new ApiRange(); };

/**
 * Specifies that the contents of the current Range are displayed along with a line appearing directly below the character
 * (less than all the spacing above and below the characters on the line).
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @param {boolean} isUnderline - Specifies if the contents of the current Range are displayed underlined or not.
 * @returns {ApiRange | null} - returns null if can't apply underline.
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/SetUnderline.js
 */
ApiRange.prototype.SetUnderline = function(isUnderline){ return new ApiRange(); };

/**
 * Specifies the alignment which will be applied to the Range contents in relation to the default appearance of the Range text:
 * <b>"baseline"</b> - the characters in the current text Range will be aligned by the default text baseline.
 * <b>"subscript"</b> - the characters in the current text Range will be aligned below the default text baseline.
 * <b>"superscript"</b> - the characters in the current text Range will be aligned above the default text baseline.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @param {("baseline" | "subscript" | "superscript")} sType - The vertical alignment type applied to the text contents.
 * @returns {ApiRange | null} - returns null if can't apply align.
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/SetVertAlign.js
 */
ApiRange.prototype.SetVertAlign = function(sType){ return new ApiRange(); };

/**
 * Specifies the amount by which text is raised or lowered for the current Range in relation to the default
 * baseline of the surrounding non-positioned text.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @param {hps} nPosition - Specifies a positive (raised text) or negative (lowered text)
 * measurement in half-points (1/144 of an inch).
 * @returns {ApiRange | null} - returns null if can't set position.
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/SetPosition.js
 */
ApiRange.prototype.SetPosition = function(nPosition){ return new ApiRange(); };

/**
 * Sets the font size to the characters of the current text Range.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @param {hps} FontSize - The text size value measured in half-points (1/144 of an inch).
 * @returns {ApiRange | null} - returns null if can't set font size.
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/SetFontSize.js
 */
ApiRange.prototype.SetFontSize = function(FontSize){ return new ApiRange(); };

/**
 * Sets all 4 font slots with the specified font family.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @param {string} sFontFamily - The font family or families used for the current text Range.
 * @returns {ApiRange | null} - returns null if can't set font family.
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/SetFontFamily.js
 */
ApiRange.prototype.SetFontFamily = function(sFontFamily){ return new ApiRange(); };

/**
 * Sets the style to the current Range.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @param {ApiStyle} oStyle - The style which must be applied to the text character.
 * @returns {ApiRange | null} - returns null if can't set style.
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/SetStyle.js
 */
ApiRange.prototype.SetStyle = function(oStyle){ return new ApiRange(); };

/**
 * Sets the text properties to the current Range.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @param {ApiTextPr} oTextPr - The text properties that will be applied to the current range.
 * @returns {ApiRange | null} - returns null if can't set text properties.
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/SetTextPr.js
 */
ApiRange.prototype.SetTextPr = function(oTextPr){ return new ApiRange(); };

/**
 * Returns the merged text properties of the entire range.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @returns {ApiTextPr}
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/GetTextPr.js
 */
ApiRange.prototype.GetTextPr = function(){ return new ApiTextPr(); };

/**
 * Deletes all the contents from the current range.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @returns {boolean} - returns false if range is empty.
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/Delete.js
 */
ApiRange.prototype.Delete = function(){ return true; };

/**
 * Converts the ApiRange object into the JSON object.
 * @memberof ApiRange
 * @param {boolean} bWriteNumberings - Specifies if the used numberings will be written to the JSON object or not.
 * @param {boolean} bWriteStyles - Specifies if the used styles will be written to the JSON object or not.
 * @typeofeditors ["CDE"]
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/ToJSON.js
 */
ApiRange.prototype.ToJSON = function(bWriteNumberings, bWriteStyles){ return new JSON(); };

/**
 * Adds a comment to the current range.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @param {string} sText - The comment text.
 * @param {string} [sAuthor] - The author's name.
 * @param {string} [sUserId] - The user ID of the comment author.
 * @returns {ApiComment} - Returns null if the comment was not added.
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/AddComment.js
 */
ApiRange.prototype.AddComment = function(sText, sAuthor, sUserId){ return new ApiComment(); };

/**
 * Returns a Range object that represents the document part contained in the specified range.
 * @typeofeditors ["CDE"]
 * @param {Number} [Start=0] - Start position index in the current range.
 * @param {Number} [End=-1] - End position index in the current range (if <= 0, then the range is taken to the end).
 * @returns {ApiRange}
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/GetRange.js
 */
ApiRange.prototype.GetRange = function(nStart, nEnd){ return new ApiRange(); };

/**
 * Returns the start page number of the current range.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @returns {Number}
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/GetStartPage.js
 */
ApiRange.prototype.GetStartPage = function(){ return 0; };

/**
 * Returns the end page number of the current range.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @returns {Number}
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/GetEndPage.js
 */
ApiRange.prototype.GetEndPage = function(){ return 0; };

/**
 * Sets the start position of the current range object.
 * @memberof ApiRange
 * @param {Number} nPos - Start position.
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/SetStartPos.js
 */
ApiRange.prototype.SetStartPos = function(nPos){ return true; };

/**
 * Sets the end position of the current range object.
 * @memberof ApiRange
 * @param {Number} nPos - End position.
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/SetEndPos.js
 */
ApiRange.prototype.SetEndPos = function(nPos){ return true; };

/**
 * Returns the start position of the current range.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @returns {number}
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/GetStartPos.js
 */
ApiRange.prototype.GetStartPos = function() { return 0; };

/**
 * Returns the start position of the current range.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @returns {number}
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/GetStartPos.js
 */
ApiRange.prototype.Start = ApiRange.prototype.GetStartPos ();

/**
 * Returns the end position of the current range.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @returns {number}
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/GetEndPos.js
 */
ApiRange.prototype.GetEndPos = function() { return 0; };

/**
 * Returns the end position of the current range.
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @returns {number}
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/GetEndPos.js
 */
ApiRange.prototype.End = ApiRange.prototype.GetEndPos ();

/**
 * Moves a cursor to a specified position of the current range object.
 * If there is any selection in the document, it will be removed.
 * @memberof ApiRange
 * @param {number} [nPos=0] - The desired cursor position.
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/MoveCursorToPos.js
 */
ApiRange.prototype.MoveCursorToPos = function(nPos){ return true; };

/**
 * Adds a field to the specified range by the field instruction code.
 * <note> This method removes text within a range. </note>
 * @memberof ApiRange
 * @typeofeditors ["CDE"]
 * @param {string} sCode - The field instruction code.
 * @returns {boolean}
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiRange/Methods/AddField.js
 */
ApiRange.prototype.AddField = function(sCode) { return true; };

/**
 * Class representing a document.
 * @constructor
 * @typeofeditors ["CDE", "CFE"]
 * @extends {ApiDocumentContent}
 */
function ApiDocument(Document){}
ApiDocument.prototype = Object.create(ApiDocumentContent.prototype);
ApiDocument.prototype.constructor = ApiDocument;

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
 * Class representing a table.
 * @constructor
 * @extends {ApiTablePr}
 */
function ApiTable(Table){}
ApiTable.prototype = Object.create(ApiTablePr.prototype);
ApiTable.prototype.constructor = ApiTable;

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
 * Class representing a document form base.
 * @constructor
 * @typeofeditors ["CDE", "CFE"]
 */
function ApiFormBase(oSdt){}

/**
 * Class representing a document text field.
 * @constructor
 * @typeofeditors ["CDE", "CFE"]
 * @extends {ApiFormBase}
 * @see office-js-api/Examples/{Editor}/ApiTextForm/Methods/constructor.js
 */
function ApiTextForm(oSdt){}
ApiTextForm.prototype = Object.create(ApiFormBase.prototype);
ApiTextForm.prototype.constructor = ApiTextForm;

/**
 * Class representing a document combo box / drop-down list.
 * @constructor
 * @typeofeditors ["CDE", "CFE"]
 * @extends {ApiFormBase}
 * @see office-js-api/Examples/{Editor}/ApiComboBoxForm/Methods/constructor.js
 */
function ApiComboBoxForm(oSdt){}
ApiComboBoxForm.prototype = Object.create(ApiFormBase.prototype);
ApiComboBoxForm.prototype.constructor = ApiComboBoxForm;

/**
 * Class representing a document checkbox / radio button.
 * @constructor
 * @typeofeditors ["CDE", "CFE"]
 * @extends {ApiFormBase}
 * @see office-js-api/Examples/{Editor}/ApiCheckBoxForm/Methods/constructor.js
 */
function ApiCheckBoxForm(oSdt){}
ApiCheckBoxForm.prototype = Object.create(ApiFormBase.prototype);
ApiCheckBoxForm.prototype.constructor = ApiCheckBoxForm;

/**
 * Class representing a document picture form.
 * @constructor
 * @typeofeditors ["CDE", "CFE"]
 * @extends {ApiFormBase}
 * @see office-js-api/Examples/{Editor}/ApiPictureForm/Methods/constructor.js
 */
function ApiPictureForm(oSdt){}
ApiPictureForm.prototype = Object.create(ApiFormBase.prototype);
ApiPictureForm.prototype.constructor = ApiPictureForm;

/**
 * Class representing a document date field.
 * @constructor
 * @typeofeditors ["CDE", "CFE"]
 * @extends {ApiFormBase}
 * @see office-js-api/Examples/{Editor}/ApiDateForm/Methods/constructor.js
 */
function ApiDateForm(oSdt){}
ApiDateForm.prototype = Object.create(ApiFormBase.prototype);
ApiDateForm.prototype.constructor = ApiDateForm;

/**
 * Class representing a complex field.
 * @param oSdt
 * @constructor
 * @typeofeditors ["CDE", "CFE"]
 * @extends {ApiFormBase}
 * @see office-js-api/Examples/{Editor}/ApiComplexForm/Methods/constructor.js
 */
function ApiComplexForm(oSdt){}
ApiComplexForm.prototype = Object.create(ApiFormBase.prototype);
ApiComplexForm.prototype.constructor = ApiComplexForm;

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
 * Returns a Range object that represents the document part contained in the specified hyperlink.
 * @typeofeditors ["CDE"]
 * @param {Number} Start - Start position index in the current element.
 * @param {Number} End - End position index in the current element.
 * @returns {ApiRange} 
 * @see office-js-api/Examples/{Editor}/ApiHyperlink/Methods/GetRange.js
 */
ApiHyperlink.prototype.GetRange = function(Start, End){ return new ApiRange(); };

/**
 * Converts the ApiHyperlink object into the JSON object.
 * @memberof ApiHyperlink
 * @param {boolean} bWriteStyles - Specifies if the used styles will be written to the JSON object or not.
 * @typeofeditors ["CDE"]
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiHyperlink/Methods/ToJSON.js
 */
ApiHyperlink.prototype.ToJSON = function(bWriteStyles){ return new JSON(); };

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
 * Class representing a table row.
 * @constructor
 * @extends {ApiTableRowPr}
 */
function ApiTableRow(Row){}
ApiTableRow.prototype = Object.create(ApiTableRowPr.prototype);
ApiTableRow.prototype.constructor = ApiTableRow;

/**
 * Class representing the table cell properties.
 * @constructor
 */
function ApiTableCellPr(Parent, CellPr){}

/**
 * Class representing a table cell.
 * @constructor
 * @extends {ApiTableCellPr}
 */
function ApiTableCell(Cell){}
ApiTableCell.prototype = Object.create(ApiTableCellPr.prototype);
ApiTableCell.prototype.constructor = ApiTableCell;

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
 * Class representing a graphical object.
 * @constructor
 */
function ApiDrawing(Drawing){}

/**
 * Class representing an image.
 * @constructor
 */
function ApiImage(Image){}
ApiImage.prototype = Object.create(ApiDrawing.prototype);
ApiImage.prototype.constructor = ApiImage;

/**
 * Class representing an Ole object.
 * @constructor
 */
function ApiOleObject(OleObject){}
ApiOleObject.prototype = Object.create(ApiDrawing.prototype);
ApiOleObject.prototype.constructor = ApiOleObject;

/**
 * Class representing a shape.
 * @constructor
 */
function ApiShape(Shape){}
ApiShape.prototype = Object.create(ApiDrawing.prototype);
ApiShape.prototype.constructor = ApiShape;

/**
 * Class representing a chart.
 * @constructor
 *
 */
function ApiChart(Chart){}
ApiChart.prototype = Object.create(ApiDrawing.prototype);
ApiChart.prototype.constructor = ApiChart;

/**
 * Class representing a group of drawings.
 * @constructor
 */
function ApiGroup(oGroup){}
ApiGroup.prototype = Object.create(ApiDrawing.prototype);
ApiGroup.prototype.constructor = ApiGroup;

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
 * Returns the main document.
 * @memberof ApiInterface
 * @typeofeditors ["CDE"]
 * @returns {ApiDocument}
 * @see office-js-api/Examples/{Editor}/Api/Methods/GetDocument.js
 */
ApiInterface.prototype.GetDocument = function(){ return new ApiDocument(); };

/**
 * Creates a new paragraph.
 * @memberof ApiInterface
 * @typeofeditors ["CDE", "CSE"]
 * @returns {ApiParagraph}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateParagraph.js
 */
ApiInterface.prototype.CreateParagraph = function(){ return new ApiParagraph(); };

/**
 * Creates an element range.
 * If you do not specify the start and end positions, the range will be taken from the entire element.
 * @memberof ApiInterface
 * @typeofeditors ["CDE"]
 * @param element - The element from which the range will be taken.
 * @param start - Start range position.
 * @param end - End range position.
 * @returns {ApiRange | null} - returns null if element isn't supported.
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateRange.js
 */
ApiInterface.prototype.CreateRange = function(element, start, end){ return new ApiRange(); };

/**
 * Creates a new table with a specified number of rows and columns.
 * @memberof ApiInterface
 * @typeofeditors ["CDE"]
 * @param {number} cols - Number of columns.
 * @param {number} rows - Number of rows.
 * @returns {ApiTable}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateTable.js
 */
ApiInterface.prototype.CreateTable = function(cols, rows){ return new ApiTable(); };

/**
 * Creates a new smaller text block to be inserted to the current paragraph or table.
 * @memberof ApiInterface
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {ApiRun}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateRun.js
 */
ApiInterface.prototype.CreateRun = function(){ return new ApiRun(); };

/**
 * Creates a new hyperlink text block to be inserted to the current paragraph or table.
 * @memberof ApiInterface
 * @typeofeditors ["CDE"]
 * @param {string} link - The hyperlink address.
 * @param {string} display - The text to display the hyperlink.
 * @param {string} screenTipText - The screen tip text.
 * @returns {ApiHyperlink}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateHyperlink.js
 */
ApiInterface.prototype.CreateHyperlink = function(link, display, screenTipText){ return new ApiHyperlink(); };

/**
 * Creates an image with the parameters specified.
 * @memberof ApiInterface
 * @typeofeditors ["CDE"]
 * @param {string} imageSrc - The image source where the image to be inserted should be taken from (currently only internet URL or Base64 encoded images are supported).
 * @param {EMU} width - The image width in English measure units.
 * @param {EMU} height - The image height in English measure units.
 * @returns {ApiImage}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateImage.js
 */
ApiInterface.prototype.CreateImage = function(imageSrc, width, height){ return new ApiImage(); };

/**
 * Creates a shape with the parameters specified.
 * @memberof ApiInterface
 * @typeofeditors ["CDE"]
 * @param {ShapeType} [shapeType="rect"] - The shape type which specifies the preset shape geometry.
 * @param {EMU} [width = 914400] - The shape width in English measure units.
 * @param {EMU} [height = 914400] - The shape height in English measure units.
 * @param {ApiFill} [fill = Api.CreateNoFill()] - The color or pattern used to fill the shape.
 * @param {ApiStroke} [stroke = Api.CreateStroke(0, Api.CreateNoFill())] - The stroke used to create the element shadow.
 * @returns {ApiShape}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateShape.js
 */
ApiInterface.prototype.CreateShape = function(shapeType, width, height, fill, stroke){ return new ApiShape(); };

/**
 * Groups an array of drawings.
 * @memberof ApiInterface
 * @typeofeditors ["CDE"]
 * @param {DrawingForGroup[]} drawings - An array of drawings to group.
 * @returns {ApiGroup}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateGroup.js
 */
ApiInterface.prototype.CreateGroup = function(drawings){ return new ApiGroup(); };

/**
 * Creates a chart with the parameters specified.
 * @memberof ApiInterface
 * @typeofeditors ["CDE"]
 * @param {ChartType} [chartType="bar"] - The chart type used for the chart display.
 * @param {number[][]} series - The array of the data used to build the chart from.
 * @param {number[] | string[]} seriesNames - The array of the names (the source table column names) used for the data which the chart will be build from.
 * @param {number[] | string[]} catNames - The array of the names (the source table row names) used for the data which the chart will be build from.
 * @param {EMU} width - The chart width in English measure units.
 * @param {EMU} height - The chart height in English measure units.
 * @param {number} styleIndex - The chart color style index (can be 1 - 48, as described in OOXML specification).
 * @param {NumFormat[] | String[]} numFormats - Numeric formats which will be applied to the series (can be custom formats).
 * The default numeric format is "General".
 * @returns {ApiChart}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateChart.js
 */
ApiInterface.prototype.CreateChart = function(chartType, series, seriesNames, catNames, width, height, styleIndex, numFormats){ return new ApiChart(); };

/**
 * Creates an OLE object with the parameters specified.
 * @memberof ApiInterface
 * @typeofeditors ["CDE"]
 * @param {string} imageSrc - The image source where the image to be inserted should be taken from (currently, only internet URL or Base64 encoded images are supported).
 * @param {EMU} width - The OLE object width in English measure units.
 * @param {EMU} height - The OLE object height in English measure units.
 * @param {string} data - The OLE object string data.
 * @param {string} appId - The application ID associated with the current OLE object.
 * @returns {ApiOleObject}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateOleObject.js
 */
ApiInterface.prototype.CreateOleObject = function(imageSrc, width, height, data, appId){ return new ApiOleObject(); };

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
 * Creates a new inline container.
 * @memberof ApiInterface
 * @typeofeditors ["CDE"]
 * @returns {ApiInlineLvlSdt}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateInlineLvlSdt.js
 */
ApiInterface.prototype.CreateInlineLvlSdt = function(){ return new ApiInlineLvlSdt(); };

/**
 * The checkbox content control properties
 * @typedef {Object} ContentControlCheckBoxPr
 * @property {boolean} [checked] Indicates whether the checkbox is checked by default.
 * @property {string} [checkedSymbol] A custom symbol to display when the checkbox is checked (e.g., "в�’").
 * @property {string} [uncheckedSymbol] A custom symbol to display when the checkbox is unchecked (e.g., "в�ђ").
 */

/**
 * Creates a checkbox content control.
 * @memberof ApiInterface
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {ContentControlCheckBoxPr} checkBoxPr The configuration object with the checkbox properties.
 * @returns {ApiInlineLvlSdt} An inline-level content control that represents a checkbox.
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateCheckBoxContentControl.js
 */
ApiInterface.prototype.CreateCheckBoxContentControl = function(checkBoxPr){ return new ApiInlineLvlSdt(); };

/**
 * Creates a new picture container.
 * @memberof ApiInterface
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {EMU} [width] - The optional image width.
 * @param {EMU} [height] - The optional image height.
 * @returns {ApiInlineLvlSdt} An inline-level content control that represents a picture container.
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreatePictureContentControl.js
 */
ApiInterface.prototype.CreatePictureContentControl = function(width, height){ return new ApiInlineLvlSdt(); };

/**
 * The object representing the items in the combo box or drop-down list.
 * @typedef {Object} ContentControlListItem
 * @property {string} display - The text to be displayed in the combo box or drop-down list.
 * @property {string} value - The value associated with the item.
 */

/**
 * Creates a new combo box container with the given list of options.
 * @memberof ApiInterface
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {ContentControlListItem[]} [list] - An array of objects representing the items in the combo box.
 * @param {number} [selected=-1] - The selected item index.
 * @returns {ApiInlineLvlSdt} An inline-level content control that represents a combo box.
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateComboBoxContentControl.js
 */
ApiInterface.prototype.CreateComboBoxContentControl = function(list, selected){ return new ApiInlineLvlSdt(); };

/**
 * Creates a new drop-down list container with the given list of options.
 * @memberof ApiInterface
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {ContentControlListItem[]} [list] - An array of objects representing the items in the drop-down list.
 * @param {number} [selected=-1] - The selected item index.
 * @returns {ApiInlineLvlSdt} An inline-level content control that represents a drop-down list.
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateDropDownListContentControl.js
 */
ApiInterface.prototype.CreateDropDownListContentControl = function(list, selected){ return new ApiInlineLvlSdt(); };

/**
 * The date picker content control properties.
 * @typedef {Object} ContentControlDatePr
 * @property {string} format - The date format. Example: "mm.dd.yyyy".
 * @property {string} lang   - The date language. Possible value for this parameter is a language identifier as defined by
 * RFC 4646/BCP 47. Example: "en-CA".
 */

/**
 * Creates a new date picker content control.
 * @memberof ApiInterface
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {ContentControlDatePr} [datePickerPr] - The optional date picker properties.
 * @returns {ApiInlineLvlSdt} An inline-level content control that represents a date-time picker.
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateDatePickerContentControl.js
 */
ApiInterface.prototype.CreateDatePickerContentControl = function(datePickerPr){ return new ApiInlineLvlSdt(); };

/**
 * Creates a new block level container.
 * @memberof ApiInterface
 * @typeofeditors ["CDE"]
 * @returns {ApiBlockLvlSdt}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateBlockLvlSdt.js
 */
ApiInterface.prototype.CreateBlockLvlSdt = function(){ return new ApiBlockLvlSdt(); };

/**
 * Saves changes to the specified document.
 * @typeofeditors ["CDE"]
 * @memberof ApiInterface
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/Api/Methods/Save.js
 */
ApiInterface.prototype.Save = function(){ return true; };

/**
 * Loads data for the mail merge. 
 * @memberof ApiInterface
 * @typeofeditors ["CDE"]
 * @param {String[][]} data - Mail merge data. The first element of the array is the array with names of the merge fields.
 * The rest of the array elements are arrays with values for the merge fields.
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/Api/Methods/LoadMailMergeData.js
 */
ApiInterface.prototype.LoadMailMergeData = function(data){ return true; };

/**
 * Returns the mail merge template document.
 * @memberof ApiInterface
 * @typeofeditors ["CDE"]
 * @returns {ApiDocumentContent}  
 * @see office-js-api/Examples/{Editor}/Api/Methods/GetMailMergeTemplateDocContent.js
 */
ApiInterface.prototype.GetMailMergeTemplateDocContent = function(){ return new ApiDocumentContent(); };

/**
 * Returns the mail merge receptions count.
 * @memberof ApiInterface
 * @typeofeditors ["CDE"]
 * @returns {number}  
 * @see office-js-api/Examples/{Editor}/Api/Methods/GetMailMergeReceptionsCount.js
 */
ApiInterface.prototype.GetMailMergeReceptionsCount = function(){ return 0; };

/**
 * Replaces the main document content with another document content.
 * @memberof ApiInterface
 * @typeofeditors ["CDE"]
 * @param {ApiDocumentContent} documentContent - The document content which the main document content will be replaced with.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/Api/Methods/ReplaceDocumentContent.js
 */
ApiInterface.prototype.ReplaceDocumentContent = function(documentContent){ return true; };

/**
 * Starts the mail merge process.
 * @memberof ApiInterface
 * @typeofeditors ["CDE"]
 * @param {number} [startIndex=0] - The start index of the document for mail merge process.
 * @param {number} [endIndex=Api.GetMailMergeReceptionsCount() - 1] - The end index of the document for mail merge process.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/Api/Methods/MailMerge.js
 */
ApiInterface.prototype.MailMerge = function(startIndex, endIndex){ return true; };

/**
 * Converts the specified JSON object into the Document Builder object of the corresponding type.
 * @memberof ApiInterface
 * @param {JSON} message - The JSON object to convert.
 * @typeofeditors ["CDE"]
 * @returns {object} - readed api class element
 * @see office-js-api/Examples/{Editor}/Api/Methods/FromJSON.js
 */
ApiInterface.prototype.FromJSON = function(message){ return new object(); };

/**
 * Returns a type of the ApiUnsupported class.
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"unsupported"}
 * @see office-js-api/Examples/{Editor}/ApiUnsupported/Methods/GetClassType.js
 */
ApiUnsupported.prototype.GetClassType = function(){ return ""; };

/**
 * Adds a comment to the specifed document element or array of Runs.
 * @memberof ApiInterface
 * @typeofeditors ["CDE"]
 * @param {ApiRun[] | DocumentElement} element - The element where the comment will be added. It may be applied to any element which has the *AddComment* method.
 * @param {string} text - The comment text.
 * @param {string} [author] - The author's name.
 * @param {string} [userId] - The user ID of the comment author.
 * @returns {ApiComment} - Returns null if the comment was not added.
 * @see office-js-api/Examples/{Editor}/Api/Methods/AddComment.js
 */
ApiInterface.prototype.AddComment = function(element, text, author, userId){ return new ApiComment(); };

/**
 * Subscribes to the specified event and calls the callback function when the event fires.
 * @function
 * @memberof ApiInterface
 * @typeofeditors ["CDE"]
 * @param {string} eventName - The event name.
 * @param {function} callback - Function to be called when the event fires.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/Api/Methods/attachEvent.js
 */
ApiInterface.prototype["attachEvent"] = ApiInterface.prototype.attachEvent;{ return true; };

/**
 * Unsubscribes from the specified event.
 * @function
 * @memberof ApiInterface
 * @typeofeditors ["CDE"]
 * @param {string} eventName - The event name.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/Api/Methods/detachEvent.js
 */
ApiInterface.prototype["detachEvent"] = ApiInterface.prototype.detachEvent;{ return true; };

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
 * Returns a Range object that represents the part of the document contained in the document content.
 * @memberof ApiDocumentContent
 * @typeofeditors ["CDE"]
 * @param {Number} Start - Start position index in the current element.
 * @param {Number} End - End position index in the current element.
 * @returns {ApiRange} 
 * @see office-js-api/Examples/{Editor}/ApiDocumentContent/Methods/GetRange.js
 */
ApiDocumentContent.prototype.GetRange = function(Start, End){ return new ApiRange(); };

/**
 * Converts the ApiDocumentContent object into the JSON object.
 * @memberof ApiDocumentContent
 * @typeofeditors ["CDE"]
 * @param {boolean} isWriteNumberings - Specifies if the used numberings will be written to the JSON object or not.
 * @param {boolean} isWriteStyles - Specifies if the used styles will be written to the JSON object or not.
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiDocumentContent/Methods/ToJSON.js
 */
ApiDocumentContent.prototype.ToJSON = function(isWriteNumberings, isWriteStyles){ return new JSON(); };

/**
 * Returns an array of document elements from the current ApiDocumentContent object.
 * @memberof ApiDocumentContent
 * @typeofeditors ["CDE"]
 * @param {boolean} bGetCopies - Specifies if the copies of the document elements will be returned or not.
 * @returns {DocumentElement[]}
 * @see office-js-api/Examples/{Editor}/ApiDocumentContent/Methods/GetContent.js
 */
ApiDocumentContent.prototype.GetContent = function(bGetCopies){ return [new DocumentElement()]; };

/**
 * Returns a collection of drawing objects from the document content.
 * @memberof ApiDocumentContent
 * @typeofeditors ["CDE"]
 * @returns {Drawing[]}  
 * @see office-js-api/Examples/{Editor}/ApiDocumentContent/Methods/GetAllDrawingObjects.js
 */
ApiDocumentContent.prototype.GetAllDrawingObjects = function(){ return [new Drawing()]; };

/**
 * Returns a collection of shape objects from the document content.
 * @memberof ApiDocumentContent
 * @typeofeditors ["CDE"]
 * @returns {ApiShape[]}  
 * @see office-js-api/Examples/{Editor}/ApiDocumentContent/Methods/GetAllShapes.js
 */
ApiDocumentContent.prototype.GetAllShapes = function(){ return [new ApiShape()]; };

/**
 * Returns a collection of image objects from the document content.
 * @memberof ApiDocumentContent
 * @typeofeditors ["CDE"]
 * @returns {ApiImage[]}  
 * @see office-js-api/Examples/{Editor}/ApiDocumentContent/Methods/GetAllImages.js
 */
ApiDocumentContent.prototype.GetAllImages = function(){ return [new ApiImage()]; };

/**
 * Returns a collection of chart objects from the document content.
 * @memberof ApiDocumentContent
 * @typeofeditors ["CDE"]
 * @returns {ApiChart[]}  
 * @see office-js-api/Examples/{Editor}/ApiDocumentContent/Methods/GetAllCharts.js
 */
ApiDocumentContent.prototype.GetAllCharts = function(){ return [new ApiChart()]; };

/**
 * Returns a collection of OLE objects from the document content.
 * @memberof ApiDocumentContent
 * @typeofeditors ["CDE"]
 * @returns {ApiOleObject[]}  
 * @see office-js-api/Examples/{Editor}/ApiDocumentContent/Methods/GetAllOleObjects.js
 */
ApiDocumentContent.prototype.GetAllOleObjects = function(){ return [new ApiOleObject()]; };

/**
 * Returns an array of all paragraphs from the current document content.
 * @memberof ApiDocumentContent
 * @typeofeditors ["CDE"]
 * @returns {ApiParagraph[]}
 * @see office-js-api/Examples/{Editor}/ApiDocumentContent/Methods/GetAllParagraphs.js
 */
ApiDocumentContent.prototype.GetAllParagraphs = function(){ return [new ApiParagraph()]; };

/**
 * Returns an array of all tables from the current document content.
 * @memberof ApiDocumentContent
 * @typeofeditors ["CDE"]
 * @returns {ApiTable[]}
 * @see office-js-api/Examples/{Editor}/ApiDocumentContent/Methods/GetAllTables.js
 */
ApiDocumentContent.prototype.GetAllTables = function(){ return [new ApiTable()]; };

/**
 * Returns the inner text of the current document content object.
 * @memberof ApiDocumentContent
 * @typeofeditors ["CDE"]
 * @param {object} oProps - The resulting string display properties.
 * @param {boolean} oProps.Numbering - Defines if the resulting string will include numbering or not.
 * @param {boolean} oProps.Math - Defines if the resulting string will include mathematical expressions or not.
 * @param {string} [oProps.TableCellSeparator='\t'] - Defines how the table cell separator will be specified in the resulting string. Any symbol can be used. The default separator is "\t".
 * @param {string} [oProps.TableRowSeparator='\r\n'] - Defines how the table row separator will be specified in the resulting string. Any symbol can be used. The default separator is "\r\n".
 * @param {string} [oProps.ParaSeparator='\r\n'] - Defines how the paragraph separator will be specified in the resulting string. Any symbol can be used. The default separator is "\r\n".
 * @param {string} [oProps.TabSymbol='\t'] - Defines how the tab will be specified in the resulting string. Any symbol can be used. The default symbol is "\t".
 * @param {string} [oProps.NewLineSeparator='\r'] - Defines how the line separator will be specified in the resulting string. Any symbol can be used. The default separator is "\r".
 * @returns {string}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiDocumentContent/Methods/GetText.js
 */
ApiDocumentContent.prototype.GetText = function(oProps){ return ""; };

/**
 * Returns the current paragraph where the cursor is located.
 * @memberof ApiDocumentContent
 * @typeofeditors ["CDE"]
 * @returns {ApiParagraph}
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiDocumentContent/Methods/GetCurrentParagraph.js
 */
ApiDocumentContent.prototype.GetCurrentParagraph = function(){ return new ApiParagraph(); };

/**
 * Returns the current run where the cursor is located.
 * @memberof ApiDocumentContent
 * @typeofeditors ["CDE"]
 * @returns {ApiRun}
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiDocumentContent/Methods/GetCurrentRun.js
 */
ApiDocumentContent.prototype.GetCurrentRun = function(){ return new ApiRun(); };

/**
 * Returns the currently selected content control.
 * @memberof ApiDocumentContent
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {ApiBlockLvlSdt | ApiInlineLvlSdt | null}
 * @see office-js-api/Examples/{Editor}/ApiDocumentContent/Methods/GetCurrentContentControl.js
 */
ApiDocumentContent.prototype.GetCurrentContentControl = function(){ return new ApiBlockLvlSdt(); };

/**
 * Class representing a custom XML manager, which provides methods to manage custom XML parts in the document.
 * @param doc - The current document.
 * @constructor
 * @typeofeditors ["CDE"]
 */
function ApiCustomXmlParts(doc){}
ApiCustomXmlParts.prototype = Object.create(ApiCustomXmlParts.prototype);
ApiCustomXmlParts.prototype.constructor = ApiCustomXmlParts;

/**
 * Adds a new custom XML part to the XML manager.
 * @memberof ApiCustomXmlParts
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {string} xml - The XML string to be added.
 * @returns {ApiCustomXmlPart} The newly created ApiCustomXmlPart object.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlParts/Methods/Add.js
 */
ApiCustomXmlParts.prototype.Add = function(xml){ return new ApiCustomXmlPart(); };

/**
 * Returns a type of the ApiCustomXmlParts class.
 * @memberof ApiCustomXmlParts
 * @typeofeditors ["CDE"]
 * @returns {"customXmlParts"}
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlParts/Methods/GetClassType.js
 */
ApiCustomXmlParts.prototype.GetClassType = function(){ return ""; };

/**
 * Returns a custom XML part by its ID from the XML manager.
 * @memberof ApiCustomXmlParts
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {string} xmlPartId - The XML part ID.
 * @returns {ApiCustomXmlPart|null} The corresponding ApiCustomXmlPart object if found, or null if no match is found.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlParts/Methods/GetById.js
 */
ApiCustomXmlParts.prototype.GetById = function(xmlPartId){ return new ApiCustomXmlPart(); };

/**
 * Returns custom XML parts by namespace from the XML manager.
 * @memberof ApiCustomXmlParts
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {string} namespace - The namespace of the XML parts.
 * @returns {ApiCustomXmlPart[]} An array of ApiCustomXmlPart objects or null if no matching XML parts are found.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlParts/Methods/GetByNamespace.js
 */
ApiCustomXmlParts.prototype.GetByNamespace = function(namespace){ return [new ApiCustomXmlPart()]; };

/**
 * Returns a number of custom XML parts in the XML manager.
 * @memberof ApiCustomXmlParts
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {number} The number of custom XML parts.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlParts/Methods/GetCount.js
 */
ApiCustomXmlParts.prototype.GetCount = function(){ return 0; };

/**
 * Returns all custom XML parts from the XML manager.
 * @memberof ApiCustomXmlParts
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {ApiCustomXmlPart[]} An array of all custom XML parts.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlParts/Methods/GetAll.js
 */
ApiCustomXmlParts.prototype.GetAll = function(){ return [new ApiCustomXmlPart()]; };

/**
 * Class representing a custom XML part.
 * @constructor
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {Object} customXMl - The custom XML object.
 * @param {Object} customXmlManager - The custom XML manager instance.
 * @memberof ApiCustomXmlPart
 */
function ApiCustomXmlPart(customXMl, customXmlManager){}
ApiCustomXmlPart.prototype = Object.create(ApiCustomXmlPart.prototype);
ApiCustomXmlPart.prototype.constructor = ApiCustomXmlPart;

/**
 * Returns a type of the ApiCustomXmlPart class.
 * @memberof ApiCustomXmlPart
 * @typeofeditors ["CDE"]
 * @returns {"customXmlPart"}
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlPart/Methods/GetClassType.js
 */
ApiCustomXmlPart.prototype.GetClassType = function(){ return ""; };

/**
 * Returns the ID of the custom XML part.
 * @memberof ApiCustomXmlPart
 * @typeofeditors ["CDE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlPart/Methods/GetId.js
 */
ApiCustomXmlPart.prototype.GetId = function(){ return ""; };

/**
 * Retrieves nodes from custom XML based on the provided XPath.
 * @memberof ApiCustomXmlPart
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {string} xPath - The XPath expression to search for nodes.
 * @returns {ApiCustomXmlNode[]} An array of ApiCustomXmlNode objects corresponding to the found nodes.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlPart/Methods/GetNodes.js
 */
ApiCustomXmlPart.prototype.GetNodes = function(xPath){ return [new ApiCustomXmlNode()]; };

/**
 * Retrieves the XML string from the custom XML part.
 * @memberof ApiCustomXmlPart
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {string} The XML string.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlPart/Methods/GetXml.js
 */
ApiCustomXmlPart.prototype.GetXml = function(){ return ""; };

/**
 * Deletes the XML from the custom XML manager.
 * @memberof ApiCustomXmlPart
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {boolean} True if the XML was successfully deleted.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlPart/Methods/Delete.js
 */
ApiCustomXmlPart.prototype.Delete = function(){ return true; };

/**
 * Deletes an attribute from the XML node at the specified XPath.
 * @memberof ApiCustomXmlPart
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {string} xPath - The XPath of the node from which to delete the attribute.
 * @param {string} name - The name of the attribute to delete.
 * @returns {boolean} True if the attribute was successfully deleted.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlPart/Methods/DeleteAttribute.js
 */
ApiCustomXmlPart.prototype.DeleteAttribute = function(xPath, name){ return true; };

/**
 * Inserts an attribute into the XML node at the specified XPath.
 * @memberof ApiCustomXmlPart
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {string} xPath - The XPath of the node to insert the attribute into.
 * @param {string} name - The name of the attribute to insert.
 * @param {string} value - The value of the attribute to insert.
 * @returns {boolean} True if the attribute was successfully inserted.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlPart/Methods/InsertAttribute.js
 */
ApiCustomXmlPart.prototype.InsertAttribute = function(xPath, name, value){ return true; };

/**
 * Returns an attribute from the XML node at the specified XPath.
 * @memberof ApiCustomXmlPart
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {string} xPath - The XPath of the node from which to get the attribute.
 * @param {string} name - The name of the attribute to find.
 * @returns {string | null} The attribute value or null if no matching attributes are found.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlPart/Methods/GetAttribute.js
 */
ApiCustomXmlPart.prototype.GetAttribute = function(xPath, name){ return ""; };

/**
 * Updates an attribute of the XML node at the specified XPath.
 * @memberof ApiCustomXmlPart
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {string} xPath - The XPath of the node whose attribute should be updated.
 * @param {string} name - The name of the attribute to update.
 * @param {string} value - The new value for the attribute.
 * @returns {boolean} True if the attribute was successfully updated.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlPart/Methods/UpdateAttribute.js
 */
ApiCustomXmlPart.prototype.UpdateAttribute = function(xPath, name, value){ return true; };

/**
 * Deletes an XML element at the specified XPath.
 * @memberof ApiCustomXmlPart
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {string} xPath - The XPath of the node to delete.
 * @returns {boolean} True if the element was successfully deleted.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlPart/Methods/DeleteElement.js
 */
ApiCustomXmlPart.prototype.DeleteElement = function(xPath){ return true; };

/**
 * Inserts an XML element at the specified XPath.
 * @memberof ApiCustomXmlPart
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {string} xPath - The XPath of the parent node where the new element will be inserted.
 * @param {string} xmlStr - The XML string to insert.
 * @param {number} [index] - The position at which to insert the new XML element. If omitted, the element will be appended as the last child.
 * @returns {boolean} True if the insertion was successful.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlPart/Methods/InsertElement.js
 */
ApiCustomXmlPart.prototype.InsertElement = function(xPath, xmlStr, index){ return true; };

/**
 * Updates an XML element at the specified XPath.
 * @memberof ApiCustomXmlPart
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {string} xPath - The XPath of the node to update.
 * @param {string} xmlStr - The XML string to replace the node content with.
 * @returns {boolean} True if the update was successful.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlPart/Methods/UpdateElement.js
 */
ApiCustomXmlPart.prototype.UpdateElement = function(xPath, xmlStr){ return true; };

/**
 * Class representing a custom XML node.
 * @constructor
 * @since 9.0.0
 * @param xmlNode - The custom XML node.
 * @param xmlPart - The custom XML part.
 * @typeofeditors ["CDE"]
 */
function ApiCustomXmlNode(xmlNode, xmlPart){}
ApiCustomXmlNode.prototype = Object.create(ApiCustomXmlNode.prototype);
ApiCustomXmlNode.prototype.constructor = ApiCustomXmlNode;

/**
 * Returns a type of the ApiCustomXmlNode class.
 * @memberof ApiCustomXmlNode
 * @typeofeditors ["CDE"]
 * @returns {"customXmlNode"}
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlNode/Methods/GetClassType.js
 */
ApiCustomXmlNode.prototype.GetClassType = function(){ return ""; };

/**
 * Returns nodes from the custom XML node based on the given XPath.
 * @memberof ApiCustomXmlNode
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {string} xPath - The XPath expression to match nodes.
 * @returns {ApiCustomXmlNode[]} An array of nodes that match the given XPath.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlNode/Methods/GetNodes.js
 */
ApiCustomXmlNode.prototype.GetNodes = function(xPath){ return [new ApiCustomXmlNode()]; };

/**
 * Returns the absolute XPath of the current XML node.
 * @memberof ApiCustomXmlNode
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {string} The absolute XPath of the current node.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlNode/Methods/GetXPath.js
 */
ApiCustomXmlNode.prototype.GetXPath = function(){ return ""; };

/**
 * Returns the name of the current XML node.
 * @memberof ApiCustomXmlNode
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {string} The name of the current node.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlNode/Methods/GetNodeName.js
 */
ApiCustomXmlNode.prototype.GetNodeName = function(){ return ""; };

/**
 * Returns the XML string representation of the current node content.
 * @memberof ApiCustomXmlNode
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {string} The XML string representation of the current node content.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlNode/Methods/GetNodeValue.js
 */
ApiCustomXmlNode.prototype.GetNodeValue = function(){ return ""; };

/**
 * Returns the XML string of the current node.
 * @memberof ApiCustomXmlNode
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {string} The XML string representation of the current node.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlNode/Methods/GetXml.js
 */
ApiCustomXmlNode.prototype.GetXml = function(){ return ""; };

/**
 * Returns the inner text of the current node and its child nodes.
 * For example: `<text>123<one>4</one></text>` returns `"1234"`.
 * @memberof ApiCustomXmlNode
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {string} The combined text content of the node and its descendants.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlNode/Methods/GetText.js
 */
ApiCustomXmlNode.prototype.GetText = function(){ return ""; };

/**
 * Sets the XML content for the current node.
 * @memberof ApiCustomXmlNode
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {string} xml - The XML string to set as the content of the current node.
 * @returns {boolean} Returns `true` if the XML was successfully set.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlNode/Methods/SetNodeValue.js
 */
ApiCustomXmlNode.prototype.SetNodeValue = function(xml){ return true; };

/**
 * Sets the text content of the current XML node.
 * @memberof ApiCustomXmlNode
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {string} str - The text content to set for the node.
 * @returns {boolean} Returns `true` if the text was successfully set.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlNode/Methods/SetText.js
 */
ApiCustomXmlNode.prototype.SetText = function(str){ return true; };

/**
 * Sets the XML content of the current XML node.
 * @memberof ApiCustomXmlNode
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {string} strXml - The XML string to set as the node content.
 * @returns {boolean} Returns `true` if the XML was successfully set.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlNode/Methods/SetXml.js
 */
ApiCustomXmlNode.prototype.SetXml = function(strXml){ return true; };

/**
 * Deletes the current XML node.
 * @memberof ApiCustomXmlNode
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {boolean} Returns `true` if the node was successfully deleted.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlNode/Methods/Delete.js
 */
ApiCustomXmlNode.prototype.Delete = function(){ return true; };

/**
 * Returns the parent of the current XML node.
 * @memberof ApiCustomXmlNode
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {ApiCustomXmlNode | null} The parent node, or `null` if the current node has no parent.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlNode/Methods/GetParent.js
 */
ApiCustomXmlNode.prototype.GetParent = function(){ return new ApiCustomXmlNode(); };

/**
 * Creates a child node for the current XML node.
 * @memberof ApiCustomXmlNode
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {string} nodeName - The name of the new child node.
 * @returns {ApiCustomXmlNode} The newly created child node.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlNode/Methods/Add.js
 */
ApiCustomXmlNode.prototype.Add = function(nodeName){ return new ApiCustomXmlNode(); };

/**
 * Represents an attribute of an XML node.
 * @typedef {Object} CustomXmlNodeAttribute
 * @property {string} name - The attribute name.
 * @property {string} value - The attribute value.
 */

/**
 * Returns a list of attributes of the current XML node.
 * @memberof ApiCustomXmlNode
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {CustomXmlNodeAttribute[]} An array of attribute objects.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlNode/Methods/GetAttributes.js
 */
ApiCustomXmlNode.prototype.GetAttributes = function(){ return [new CustomXmlNodeAttribute()]; };

/**
 * Sets an attribute for the custom XML node.
 * If the attribute already exists, it will not be modified.
 * @memberof ApiCustomXmlNode
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {string} name - The name of the attribute to set.
 * @param {string} value - The value to assign to the attribute.
 * @returns {boolean} Returns `true` if the attribute was successfully set, `false` if the attribute already exists.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlNode/Methods/SetAttribute.js
 */
ApiCustomXmlNode.prototype.SetAttribute = function(name, value){ return true; };

/**
 * Updates the value of an existing attribute in the custom XML node.
 * If the attribute doesn't exist, the update will not occur.
 * @memberof ApiCustomXmlNode
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {string} name - The name of the attribute to update.
 * @param {string} value - The new value to assign to the attribute.
 * @returns {boolean} Returns `true` if the attribute was successfully updated, `false` if the attribute doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlNode/Methods/UpdateAttribute.js
 */
ApiCustomXmlNode.prototype.UpdateAttribute = function(name, value){ return true; };

/**
 * Deletes an attribute from the custom XML node.
 * If the attribute exists, it will be removed.
 * @memberof ApiCustomXmlNode
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {string} name - The name of the attribute to delete.
 * @returns {boolean} Returns `true` if the attribute was successfully deleted, `false` if the attribute didn't exist.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlNode/Methods/DeleteAttribute.js
 */
ApiCustomXmlNode.prototype.DeleteAttribute = function(name){ return true; };

/**
 * Retrieves the attribute value from the custom XML node.
 * If the attribute doesn't exist, it returns `false`.
 * @memberof ApiCustomXmlNode
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {string} name - The name of the attribute to retrieve.
 * @returns {string |null} The value of the attribute if it exists, or `null` if the attribute is not found.
 * @see office-js-api/Examples/{Editor}/ApiCustomXmlNode/Methods/GetAttribute.js
 */
ApiCustomXmlNode.prototype.GetAttribute = function(name){ return ""; };

/**
 * Returns a type of the ApiDocument class.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {"document"}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetClassType.js
 */
ApiDocument.prototype.GetClassType = function(){ return ""; };

/**
 * Creates a new history point.
 * @typeofeditors ["CDE"]
 * @memberof ApiDocument
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/CreateNewHistoryPoint.js
 */
ApiDocument.prototype.CreateNewHistoryPoint = function(){ return true; };

/**
 * Returns a style by its name.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {string} sStyleName - The style name.
 * @returns {ApiStyle}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetStyle.js
 */
ApiDocument.prototype.GetStyle = function(sStyleName){ return new ApiStyle(); };

/**
 * Creates a new style with the specified type and name. If there is a style with the same name it will be replaced with a new one.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {string} sStyleName - The name of the style which will be created.
 * @param {StyleType} [sType="paragraph"] - The document element which the style will be applied to.
 * @returns {ApiStyle}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/CreateStyle.js
 */
ApiDocument.prototype.CreateStyle = function(sStyleName, sType){ return new ApiStyle(); };

/**
 * Returns the default style parameters for the specified document element.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {StyleType} sStyleType - The document element which we want to get the style for.
 * @returns {ApiStyle}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetDefaultStyle.js
 */
ApiDocument.prototype.GetDefaultStyle = function(sStyleType){ return new ApiStyle(); };

/**
 * Returns a set of default properties for the text run in the current document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetDefaultTextPr.js
 */
ApiDocument.prototype.GetDefaultTextPr = function(){ return new ApiTextPr(); };

/**
 * Returns a set of default paragraph properties in the current document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {ApiParaPr}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetDefaultParaPr.js
 */
ApiDocument.prototype.GetDefaultParaPr = function(){ return new ApiParaPr(); };

/**
 * Returns the document final section.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {ApiSection}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetFinalSection.js
 */
ApiDocument.prototype.GetFinalSection = function(){ return new ApiSection(); };

/**
 * Creates a new document section which ends at the specified paragraph. Allows to set local parameters to the current
 * section - page size, footer, header, columns, etc.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {ApiParagraph} oParagraph - The paragraph after which a new document section will be inserted.
 * Paragraph must be in a document.
 * @returns {ApiSection | null} Returns null if parametr is invalid.
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/CreateSection.js
 */
ApiDocument.prototype.CreateSection = function(oParagraph){ return new ApiSection(); };

/**
 * Specifies whether sections in this document will have different headers and footers for even and
 * odd pages (one header/footer for odd pages and another header/footer for even pages).
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {boolean} isEvenAndOdd - If true the header/footer will be different for odd and even pages, if false they will be the same.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/SetEvenAndOddHdrFtr.js
 */
ApiDocument.prototype.SetEvenAndOddHdrFtr = function(isEvenAndOdd){ return true; };

/**
 * Creates an abstract multilevel numbering with a specified type.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {("bullet" | "numbered")} [sType="bullet"] - The type of the numbering which will be created.
 * @returns {ApiNumbering}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/CreateNumbering.js
 */
ApiDocument.prototype.CreateNumbering = function(sType){ return new ApiNumbering(); };

/**
 * Inserts an array of elements into the current position of the document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {DocumentElement[]} arrContent - An array of elements to insert.
 * @param {boolean} [isInline=false] - Inline insert or not (works only for the last and the first element and only if it's a paragraph).
 * @param {object} [oPr=undefined] - Specifies that text and paragraph document properties are preserved for the inserted elements. 
 * The object should look like this: {"KeepTextOnly": true}. 
 * @returns {boolean} Success?
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/InsertContent.js
 */
ApiDocument.prototype.InsertContent = function(arrContent, isInline, oPr){ return true; };

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
 * Returns a report about all the comments added to the document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {CommentReport}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetCommentsReport.js
 */
ApiDocument.prototype.GetCommentsReport = function(){ return new CommentReport(); };

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
 * Returns a report about every change which was made to the document in the review mode.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {ReviewReport}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetReviewReport.js
 */
ApiDocument.prototype.GetReviewReport = function(){ return new ReviewReport(); };

/**
 * Finds and replaces the text.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {Object} oProperties - The properties to find and replace.
 * @param {string} oProperties.searchString - Search string.
 * @param {string} oProperties.replaceString - Replacement string.
 * @param {string} [oProperties.matchCase=true] - Case sensitive or not.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/SearchAndReplace.js
 */
ApiDocument.prototype.SearchAndReplace = function(oProperties){ return true; };

/**
 * Returns a list of all the content controls from the document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {ApiBlockLvlSdt[] | ApiInlineLvlSdt[]}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetAllContentControls.js
 */
ApiDocument.prototype.GetAllContentControls = function(){ return [new ApiBlockLvlSdt()]; };

/**
 * Returns a list of all tags that are used for all content controls in the document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {String[]}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetTagsOfAllContentControls.js
 */
ApiDocument.prototype.GetTagsOfAllContentControls = function(){ return [""]; };

/**
 * Returns a list of all tags that are used for all forms in the document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE", "CFE"]
 * @returns {String[]}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetTagsOfAllForms.js
 */
ApiDocument.prototype.GetTagsOfAllForms = function(){ return [""]; };

/**
 * Returns a list of all content controls in the document with the specified tag name.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param sTag {string} - Content control tag.
 * @returns {ApiBlockLvlSdt[] | ApiInlineLvlSdt[]}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetContentControlsByTag.js
 */
ApiDocument.prototype.GetContentControlsByTag = function(sTag){ return [new ApiBlockLvlSdt()]; };

/**
 * Returns a list of all forms in the document with the specified tag name.
 * @memberof ApiDocument
 * @typeofeditors ["CDE", "CFE"]
 * @param sTag {string} - Form tag.
 * @returns {ApiForm[]}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetFormsByTag.js
 */
ApiDocument.prototype.GetFormsByTag = function(sTag){ return [new ApiForm()]; };

/**
 * Returns a list of all forms in the document with the specified role name.
 * @memberof ApiDocument
 * @typeofeditors ["CDE", "CFE"]
 * @param role {string} - The form role.
 * @returns {ApiForm[]}
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetFormsByRole.js
 */
ApiDocument.prototype.GetFormsByRole = function(role){ return [new ApiForm()]; };

/**
 * Returns a list of all forms in the document with the specified key.
 * @memberof ApiDocument
 * @typeofeditors ["CDE", "CFE"]
 * @param key {string} - The form key.
 * @returns {ApiForm[]}
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetFormsByKey.js
 */
ApiDocument.prototype.GetFormsByKey = function(key){ return [new ApiForm()]; };

/**
 * Returns a list of all form keys attached to the specified role.
 * @memberof ApiDocument
 * @typeofeditors ["CDE", "CFE"]
 * @param role {string} - The form role.
 * @returns {string[]} - A list of all form keys attached to the specified role.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetFormKeysByRole.js
 */
ApiDocument.prototype.GetFormKeysByRole = function(role){ return [""]; };

/**
 * Returns the form value for the specified key. For a group of radio buttons returns Choice, i.e. the name of the selected item.
 * @memberof ApiDocument
 * @typeofeditors ["CDE", "CFE"]
 * @param key {string} - The form key.
 * @returns {null | boolean | string} Returns true/false for checkboxes and string for other form types. Returns null if
 * there is no form with the specified key.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetFormValueByKey.js
 */
ApiDocument.prototype.GetFormValueByKey = function(key){ return null; };

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
 * Returns the data from all forms present in the current document.
 * If a form was created and not assigned to any part of the document, it won't appear in this list.
 * @memberof ApiDocument
 * @typeofeditors ["CDE", "CFE"]
 * @returns {Array.<FormData>}
 * @since 8.0.0
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetFormsData.js
 */
ApiDocument.prototype.GetFormsData = function(){ return []; };

/**
 * Sets the data to the specified forms.
 * @memberof ApiDocument
 * @typeofeditors ["CDE", "CFE"]
 * @param {Array.<FormData>} arrData - An array of form data to set to the specified forms.
 * @returns {boolean}
 * @since 8.0.0
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/SetFormsData.js
 */
ApiDocument.prototype.SetFormsData = function(arrData){ return true; };

/**
 * Sets the change tracking mode.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param isTrack {boolean} - Specifies if the change tracking mode is set or not.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/SetTrackRevisions.js
 */
ApiDocument.prototype.SetTrackRevisions = function(isTrack){ return true; };

/**
 * Checks if change tracking mode is enabled or not.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/IsTrackRevisions.js
 */
ApiDocument.prototype.IsTrackRevisions = function(){ return true; };

/**
 * Returns a Range object that represents the part of the document contained in the specified document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {Number} Start - Start position index in the current element.
 * @param {Number} End - End position index in the current element.
 * @returns {ApiRange} 
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetRange.js
 */
ApiDocument.prototype.GetRange = function(Start, End){ return new ApiRange(); };

/**
 * Returns a range object by the current selection.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {ApiRange | null} - returns null if selection doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetRangeBySelect.js
 */
ApiDocument.prototype.GetRangeBySelect = function(){ return new ApiRange(); };

/**
 * Returns the last document element. 
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {DocumentElement}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/Last.js
 */
ApiDocument.prototype.Last = function(){ return new DocumentElement(); };

/**
 * Removes a bookmark from the document, if one exists.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {string} sName - The bookmark name.
 * @returns {boolean} - returns false if param is invalid.
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/DeleteBookmark.js
 */
ApiDocument.prototype.DeleteBookmark = function(sName){ return true; };

/**
 * Returns a bookmark range.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {string} sName - The bookmark name.
 * @returns {ApiRange | null} - returns null if sName is invalid.
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetBookmarkRange.js
 */
ApiDocument.prototype.GetBookmarkRange = function(sName){ return new ApiRange(); };

/**
 * Returns a collection of section objects in the document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {ApiSection[]}  
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetSections.js
 */
ApiDocument.prototype.GetSections = function(){ return [new ApiSection()]; };

/**
 * Returns a collection of tables on a given absolute page.
 * <note>This method can be a little bit slow, because it runs the document calculation
 * process to arrange tables on the specified page.</note>
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {number} nPage - The page index.
 * @returns {ApiTable[]}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetAllTablesOnPage.js
 */
ApiDocument.prototype.GetAllTablesOnPage = function(nPage){ return [new ApiTable()]; };

/**
 * Adds a drawing to the specified page.
 * <note>This method can be a little bit slow, because it runs the document calculation
 * process to arrange tables on the specified page.</note>
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {ApiDrawing} oDrawing - A drawing to add to the page.
 * @param {number} nPage - The page index.
 * @param {EMU} x - The X coordinate in English measure units.
 * @param {EMU} y - The Y coordinate in English measure units.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/AddDrawingToPage.js
 */
ApiDocument.prototype.AddDrawingToPage = function(oDrawing, nPage, x, y){ return true; };

/**
 * Removes the current selection.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/RemoveSelection.js
 */
ApiDocument.prototype.RemoveSelection = function(){ return true; };

/**
 * Searches for a scope of a document object. The search results are a collection of ApiRange objects.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {string} sText - Search string.
 * @param {boolean} isMatchCase - Case sensitive or not.
 * @returns {ApiRange[]}  
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/Search.js
 */
ApiDocument.prototype.Search = function(sText, isMatchCase){ return [new ApiRange()]; };

/**
 * Converts a document to Markdown.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {boolean} [bHtmlHeadings=false] - Defines if the HTML headings and IDs will be generated when the Markdown renderer of your target platform does not handle Markdown-style IDs.
 * @param {boolean} [bBase64img=false] - Defines if the images will be created in the base64 format.
 * @param {boolean} [bDemoteHeadings=false] - Defines if all heading levels in your document will be demoted to conform with the following standard: single H1 as title, H2 as top-level heading in the text body.
 * @param {boolean} [bRenderHTMLTags=false] - Defines if HTML tags will be preserved in your Markdown. If you just want to use an occasional HTML tag, you can avoid using the opening angle bracket
 * in the following way: \<tag&gt;text\</tag&gt;. By default, the opening angle brackets will be replaced with the special characters.
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/ToMarkdown.js
 */
ApiDocument.prototype.ToMarkdown = function(bHtmlHeadings, bBase64img, bDemoteHeadings, bRenderHTMLTags){ return ""; };

/**
 * Converts a document to HTML.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {boolean} [bHtmlHeadings=false] - Defines if the HTML headings and IDs will be generated when the Markdown renderer of your target platform does not handle Markdown-style IDs.
 * @param {boolean} [bBase64img=false] - Defines if the images will be created in the base64 format.
 * @param {boolean} [bDemoteHeadings=false] - Defines if all heading levels in your document will be demoted to conform with the following standard: single H1 as title, H2 as top-level heading in the text body.
 * @param {boolean} [bRenderHTMLTags=false] - Defines if HTML tags will be preserved in your Markdown. If you just want to use an occasional HTML tag, you can avoid using the opening angle bracket
 * in the following way: \<tag&gt;text\</tag&gt;. By default, the opening angle brackets will be replaced with the special characters.
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/ToHtml.js
 */
ApiDocument.prototype.ToHtml = function(bHtmlHeadings, bBase64img, bDemoteHeadings, bRenderHTMLTags){ return ""; };

/**
 * Inserts a watermark on each document page.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {string} [sText="WATERMARK"] - Watermark text.
 * @param {boolean} [bIsDiagonal=false] - Specifies if the watermark is placed diagonally (true) or horizontally (false).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/InsertWatermark.js
 */
ApiDocument.prototype.InsertWatermark = function(sText, bIsDiagonal){ return true; };

/**
 * Returns the watermark settings in the current document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {ApiWatermarkSettings} - The object which represents the watermark settings.
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetWatermarkSettings.js
 */
ApiDocument.prototype.GetWatermarkSettings = function(){ return new ApiWatermarkSettings(); };

/**
 * Sets the watermark settings in the current document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {ApiWatermarkSettings} Settings - The object which represents the watermark settings.
 * @returns {ApiDrawing} - The object which represents the watermark drawing if the watermark type in Settings is not "none".
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/SetWatermarkSettings.js
 */
ApiDocument.prototype.SetWatermarkSettings = function(Settings){ return new ApiDrawing(); };

/**
 * Removes a watermark from the current document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/RemoveWatermark.js
 */
ApiDocument.prototype.RemoveWatermark = function(){ return true; };

/**
 * Updates all tables of contents in the current document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {boolean} [bOnlyPageNumbers=false] - Specifies that only page numbers will be updated.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/UpdateAllTOC.js
 */
ApiDocument.prototype.UpdateAllTOC = function(bOnlyPageNumbers){ return true; };

/**
 * Updates all tables of figures in the current document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {boolean} [bOnlyPageNumbers=false] - Specifies that only page numbers will be updated.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/UpdateAllTOF.js
 */
ApiDocument.prototype.UpdateAllTOF = function(bOnlyPageNumbers){ return true; };

/**
 * Updates all fields in the document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {boolean} [bBySelection=false] - Specifies whether all fields will be updated within the selection.
 * @returns {boolean}
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/UpdateAllFields.js
 */
ApiDocument.prototype.UpdateAllFields = function(bBySelection){ return true; };

/**
 * Converts the ApiDocument object into the JSON object.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {boolean} bWriteDefaultTextPr - Specifies if the default text properties will be written to the JSON object or not.
 * @param {boolean} bWriteDefaultParaPr - Specifies if the default paragraph properties will be written to the JSON object or not.
 * @param {boolean} bWriteTheme - Specifies if the document theme will be written to the JSON object or not.
 * @param {boolean} bWriteSectionPr - Specifies if the document section properties will be written to the JSON object or not.
 * @param {boolean} bWriteNumberings - Specifies if the document numberings will be written to the JSON object or not.
 * @param {boolean} bWriteStyles - Specifies if the document styles will be written to the JSON object or not.
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/ToJSON.js
 */
ApiDocument.prototype.ToJSON = function(bWriteDefaultTextPr, bWriteDefaultParaPr, bWriteTheme, bWriteSectionPr, bWriteNumberings, bWriteStyles){ return new JSON(); };

/**
 * Returns all existing forms in the document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE", "CFE"]
 * @returns {ApiForm[]}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetAllForms.js
 */
ApiDocument.prototype.GetAllForms = function(){ return [new ApiForm()]; };

/**
 * Clears all forms in the document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/ClearAllFields.js
 */
ApiDocument.prototype.ClearAllFields = function(){ return true; };

/**
 * Sets the highlight to the forms in the document.
 * @memberof ApiDocument
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @param {boolean} [bNone=false] - Defines that highlight will not be set.
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/SetFormsHighlight.js
 */
ApiDocument.prototype.SetFormsHighlight = function(r, g, b, bNone){ return true; };

/**
 * Returns all comments from the current document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {ApiComment[]}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetAllComments.js
 */
ApiDocument.prototype.GetAllComments = function(){ return [new ApiComment()]; };

/**
 * Returns a comment from the current document by its ID.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {string} sId - The comment ID.
 * @returns {ApiComment}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetCommentById.js
 */
ApiDocument.prototype.GetCommentById = function(sId){ return new ApiComment(); };

/**
 * Returns all numbered paragraphs from the current document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {ApiParagraph[]}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetAllNumberedParagraphs.js
 */
ApiDocument.prototype.GetAllNumberedParagraphs = function(){ return [new ApiParagraph()]; };

/**
 * Returns all heading paragraphs from the current document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {ApiParagraph[]}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetAllHeadingParagraphs.js
 */
ApiDocument.prototype.GetAllHeadingParagraphs = function(){ return [new ApiParagraph()]; };

/**
 * Returns the first paragraphs from all footnotes in the current document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {ApiParagraph[]}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetFootnotesFirstParagraphs.js
 */
ApiDocument.prototype.GetFootnotesFirstParagraphs = function(){ return [new ApiParagraph()]; };

/**
 * Returns the first paragraphs from all endnotes in the current document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {ApiParagraph[]}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetEndNotesFirstParagraphs.js
 */
ApiDocument.prototype.GetEndNotesFirstParagraphs = function(){ return [new ApiParagraph()]; };

/**
 * Returns all caption paragraphs of the specified type from the current document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {CaptionLabel | string} sCaption - The caption label ("Equation", "Figure", "Table", or another caption label).
 * @returns {ApiParagraph[]}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetAllCaptionParagraphs.js
 */
ApiDocument.prototype.GetAllCaptionParagraphs = function(sCaption){ return [new ApiParagraph()]; };

/**
 * Accepts all changes made in review mode.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/AcceptAllRevisionChanges.js
 */
ApiDocument.prototype.AcceptAllRevisionChanges = function(){ return true; };

/**
 * Rejects all changes made in review mode.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/RejectAllRevisionChanges.js
 */
ApiDocument.prototype.RejectAllRevisionChanges = function(){ return true; };

/**
 * Returns an array with names of all bookmarks in the current document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {string[]}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetAllBookmarksNames.js
 */
ApiDocument.prototype.GetAllBookmarksNames = function(){ return [""]; };

/**
 * Returns a bookmark by its name from the current document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {string} sBookmarkName - The bookmark name.
 * @returns {ApiBookmark}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetBookmark.js
 */
ApiDocument.prototype.GetBookmark = function(sBookmarkName){ return new ApiBookmark(); };

/**
 * Returns all the selected drawings in the current document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {ApiShape[] | ApiImage[] | ApiChart[] | ApiDrawing[]}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetSelectedDrawings.js
 */
ApiDocument.prototype.GetSelectedDrawings = function(){ return [new ApiShape()]; };

/**
 * Replaces the current image with an image specified.
 * @typeofeditors ["CDE"]
 * @memberof ApiDocument
 * @param {string} sImageUrl - The image source where the image to be inserted should be taken from (currently, only internet URL or Base64 encoded images are supported).
 * @param {EMU} Width - The image width in English measure units.
 * @param {EMU} Height - The image height in English measure units.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/ReplaceCurrentImage.js
 */
ApiDocument.prototype.ReplaceCurrentImage = function(sImageUrl, Width, Height){ return true; };

/**
 * Replaces a drawing with a new drawing.
 * @memberof ApiDocument
 * @param {ApiDrawing} oOldDrawing - A drawing which will be replaced.
 * @param {ApiDrawing} oNewDrawing - A drawing to replace the old drawing.
 * @param {boolean} [bSaveOldDrawingPr=false] - Specifies if the old drawing settings will be saved.
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/ReplaceDrawing.js
 */
ApiDocument.prototype.ReplaceDrawing = function(oOldDrawing, oNewDrawing, bSaveOldDrawingPr){ return true; };

/**
 * Adds a footnote for the selected text (or the current position if the selection doesn't exist).
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {ApiDocumentContent}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/AddFootnote.js
 */
ApiDocument.prototype.AddFootnote = function(){ return new ApiDocumentContent(); };

/**
 * Adds an endnote for the selected text (or the current position if the selection doesn't exist).
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {ApiDocumentContent}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/AddEndnote.js
 */
ApiDocument.prototype.AddEndnote = function(){ return new ApiDocumentContent(); };

/**
 * Sets the highlight to the content controls from the current document.
 * @memberof ApiDocument
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @param {boolean} [bNone=false] - Defines that highlight will not be set.
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/SetControlsHighlight.js
 */
ApiDocument.prototype.SetControlsHighlight = function(r, g, b, bNone){ return true; };

/**
 * Adds a table of content to the current document.
 * <note>Please note that the new table of contents replaces the existing table of contents.</note>
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {TocPr} [oTocPr={}] - Table of contents properties.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/AddTableOfContents.js
 */
ApiDocument.prototype.AddTableOfContents = function(oTocPr){ return true; };

/**
 * Adds a table of figures to the current document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {TofPr} [oTofPr={}] - Table of figures properties.
 * <note>Please note that the table of figures properties will be filled with the default properties if they are undefined.</note>
 * @param {boolean} [bReplace=true] - Specifies whether to replace the selected table of figures instead of adding a new one.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/AddTableOfFigures.js
 */
ApiDocument.prototype.AddTableOfFigures = function(oTofPr, bReplace){ return true; };

/**
 * Returns the document statistics represented as an object with the following parameters:
 * <b>PageCount</b> - number of pages;
 * <b>WordsCount</b> - number of words;
 * <b>ParagraphCount</b> - number of paragraphs;
 * <b>SymbolsCount</b> - number of symbols;
 * <b>SymbolsWSCount</b> - number of symbols with spaces.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {object}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetStatistics.js
 */
ApiDocument.prototype.GetStatistics = function(){ return new object(); };

/**
 * Returns a number of pages in the current document.
 * <note>This method can be slow for large documents because it runs the document calculation
 * process before the full recalculation.</note>
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {number}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetPageCount.js
 */
ApiDocument.prototype.GetPageCount = function(){ return 0; };

/**
 * Returns the index of the current page.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {number}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetCurrentPage.js
 */
ApiDocument.prototype.GetCurrentPage = function(){ return 0; };

/**
 * Returns the indexes of the currently visible pages.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {number[]}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetCurrentVisiblePages.js
 */
ApiDocument.prototype.GetCurrentVisiblePages = function(){ return [0]; };

/**
 * Returns all styles of the current document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {ApiStyle[]}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetAllStyles.js
 */
ApiDocument.prototype.GetAllStyles = function(){ return [new ApiStyle()]; };

/**
 * Returns the document information:
 * <b>Application</b> - the application the document was created with.
 * <b>CreatedRaw</b> - the date and time when the file was created.
 * <b>Created</b> - the parsed date and time when the file was created.
 * <b>LastModifiedRaw</b> - the date and time when the file was last modified.
 * <b>LastModified</b> - the parsed date and time when the file was last modified.
 * <b>LastModifiedBy</b> - the name of the user who made the latest change to the document.
 * <b>Authors</b> - the persons who created the file.
 * <b>Title</b> - the document title (this property allows you to simplify your documents classification).
 * <b>Tags</b> - the document tags (this property allows you to simplify your documents classification).
 * <b>Subject</b> - the document subject (this property allows you to simplify your documents classification).
 * <b>Comment</b> - the comment to the document (this property allows you to simplify your documents classification).
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {object}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetDocumentInfo.js
 */
ApiDocument.prototype.GetDocumentInfo = function(){ return new object(); };

/**
 * Returns the current word or part of the current word.
 * @param {undefined | "before" | "after"} sWordPart - The desired part of the current word to be returned.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {string}
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetCurrentWord.js
 */
ApiDocument.prototype.GetCurrentWord = function(sWordPart){ return ""; };

/**
 * Replaces the current word or part of the current word with the specified text.
 * @param sReplace {string} - The string to replace the current word with.
 * @param {undefined | "before" | "after"} sPart - The desired part of the current word to be replaced.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/ReplaceCurrentWord.js
 */
ApiDocument.prototype.ReplaceCurrentWord = function(sReplace, sPart){ return true; };

/**
 * Selects the current word if it is possible.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {object}
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/SelectCurrentWord.js
 */
ApiDocument.prototype.SelectCurrentWord = function(){ return new object(); };

/**
 * Adds a comment to the current document selection, or to the current word if no text is selected.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {string} sText - The comment text.
 * @param {string} [sAuthor] - The author's name.
 * @param {string} [sUserId] - The user ID of the comment author.
 * @returns {ApiComment} - Returns null if the comment was not added.
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/AddComment.js
 */
ApiDocument.prototype.AddComment = function(sText, sAuthor, sUserId){ return new ApiComment(); };

/**
 * Returns the current sentence or part of the current sentence.
 * @param {undefined | "before" | "after"} sPart - The desired part of the current sentence to be returned.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {string}
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetCurrentSentence.js
 */
ApiDocument.prototype.GetCurrentSentence = function(sPart){ return ""; };

/**
 * Replaces the current sentence or part of the current sentence with the specified text.
 * @param sReplace {string} - The string to replace the current sentence with.
 * @param {undefined | "before" | "after"} sPart - The desired part of the current sentence to be replaced.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/ReplaceCurrentSentence.js
 */
ApiDocument.prototype.ReplaceCurrentSentence = function(sReplace, sPart){ return true; };

/**
 * Adds a math equation to the current document.
 * @param sText {string} - An equation written as a linear text string.
 * @param {"unicode" | "latex"} [sFormat="unicode"] - The format of the specified linear representation.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/AddMathEquation.js
 */
ApiDocument.prototype.AddMathEquation = function(sText, sFormat){ return true; };

/**
 * Groups an array of drawings in the current document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @param {DrawingForGroup[]} aDrawings - An array of drawings to group.
 * @returns {ApiGroup}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GroupDrawings.js
 */
ApiDocument.prototype.GroupDrawings = function(aDrawings){ return new ApiGroup(); };

/**
 * Moves a cursor to a specified position of the current document.
 * If there is any selection in the document, it will be removed.
 * @memberof ApiDocument
 * @param {number} [nPos=0] - The desired cursor position.
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/MoveCursorToPos.js
 */
ApiDocument.prototype.MoveCursorToPos = function(nPos){ return true; };

/**
 * Adds a new checkbox content control to the document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {ContentControlCheckBoxPr} checkBoxPr The configuration object for the checkbox.
 * @returns {ApiInlineLvlSdt} An instance of the ApiInlineLvlSdt object representing the checkbox content control.
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/AddCheckBoxContentControl.js
 */
ApiDocument.prototype.AddCheckBoxContentControl = function(checkBoxPr){ return new ApiInlineLvlSdt(); };

/**
 * Adds a new picture content control to the document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {EMU} [width] - The optional width of the image.
 * @param {EMU} [height] - The optional height of the image.
 * @returns {ApiInlineLvlSdt} An instance of the ApiInlineLvlSdt object representing the picture content control.
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/AddPictureContentControl.js
 */
ApiDocument.prototype.AddPictureContentControl = function(width, height){ return new ApiInlineLvlSdt(); };

/**
 * Adds a new combo box content control to the document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {ContentControlListItem[]} [list] - An array of objects representing the items in the combo box.
 * @param {string} [selected] - The optional value of the item that should be selected by default (must match one of the ListItem.Value).
 * @returns {ApiInlineLvlSdt}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/AddComboBoxContentControl.js
 */
ApiDocument.prototype.AddComboBoxContentControl = function(list, selected){ return new ApiInlineLvlSdt(); };

/**
 * Adds a new drop-down list content control to the document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {ContentControlListItem[]} [list] - An array of objects representing the items in the drop-down list.
 * @param {string} [selected] - The optional value of the item that should be selected by default (must match one of the ListItem.Value).
 * @returns {ApiInlineLvlSdt}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/AddDropDownListContentControl.js
 */
ApiDocument.prototype.AddDropDownListContentControl = function(list, selected){ return new ApiInlineLvlSdt(); };

/**
 * Adds a new date picker content control to the document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {ContentControlDatePr} [datePickerPr] - The optional date picker properties.
 * @returns {ApiInlineLvlSdt}
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/AddDatePickerContentControl.js
 */
ApiDocument.prototype.AddDatePickerContentControl = function(datePickerPr){ return new ApiInlineLvlSdt(); };

/**
 * Retrieves the custom XML manager associated with the document.
 * This manager allows manipulation and access to custom XML parts within the document.
 * @memberof ApiDocument
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {ApiCustomXmlParts|null} Returns an instance of ApiCustomXmlParts if the custom XML manager exists, otherwise returns null.
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetCustomXmlParts.js
 */
ApiDocument.prototype.GetCustomXmlParts = function(){ return new ApiCustomXmlParts(); };

/**
 * Retrieves the core properties interface for the current document.
 * This method is used to view or modify standard metadata such as title, author, and keywords.
 * @memberof ApiDocument
 * @returns {ApiCore} - The core document properties object.
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetCore.js
 */
ApiDocument.prototype.GetCore = function () { return new ApiCore(); };

/**
 * Retrieves the custom properties from the document.
 * @memberof ApiDocument
 * @returns {ApiCustomProperties}
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiDocument/Methods/GetCustomProperties.js
 */
ApiDocument.prototype.GetCustomProperties = function () { return new ApiCustomProperties(); };

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
 * Adds a page break and starts the next element from the next page.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @returns {ApiRun}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/AddPageBreak.js
 */
ApiParagraph.prototype.AddPageBreak = function(){ return new ApiRun(); };

/**
 * Adds a line break to the current position and starts the next element from a new line.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {ApiRun}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/AddLineBreak.js
 */
ApiParagraph.prototype.AddLineBreak = function(){ return new ApiRun(); };

/**
 * Adds a column break to the current position and starts the next element from a new column.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @returns {ApiRun}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/AddColumnBreak.js
 */
ApiParagraph.prototype.AddColumnBreak = function(){ return new ApiRun(); };

/**
 * Inserts a number of the current document page into the paragraph.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @returns {ApiRun}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/AddPageNumber.js
 */
ApiParagraph.prototype.AddPageNumber = function(){ return new ApiRun(); };

/**
 * Inserts a number of pages in the current document into the paragraph.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @returns {ApiRun}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/AddPagesCount.js
 */
ApiParagraph.prototype.AddPagesCount = function(){ return new ApiRun(); };

/**
 * Returns the text properties of the paragraph mark which is used to mark the paragraph end. The mark can also acquire
 * common text properties like bold, italic, underline, etc.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/GetParagraphMarkTextPr.js
 */
ApiParagraph.prototype.GetParagraphMarkTextPr = function(){ return new ApiTextPr(); };

/**
 * Returns the paragraph properties.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {ApiParaPr}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/GetParaPr.js
 */
ApiParagraph.prototype.GetParaPr = function(){ return new ApiParaPr(); };

/**
 * Returns the numbering definition and numbering level for the numbered list.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @returns {ApiNumberingLevel}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/GetNumbering.js
 */
ApiParagraph.prototype.GetNumbering = function(){ return new ApiNumberingLevel(); };

/**
 * Specifies that the current paragraph references the numbering definition instance in the current document.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @see Same as {@link ApiParagraph#SetNumPr}
 * @param {ApiNumberingLevel} oNumberingLevel - The numbering level which will be used for assigning the numbers to the paragraph.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/SetNumbering.js
 */
ApiParagraph.prototype.SetNumbering = function(oNumberingLevel){ return true; };

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
 * Adds a drawing object (image, shape or chart) to the current paragraph.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {ApiDrawing} oDrawing - The object which will be added to the current paragraph.
 * @returns {ApiRun}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/AddDrawing.js
 */
ApiParagraph.prototype.AddDrawing = function(oDrawing){ return new ApiRun(); };

/**
 * Adds an inline container.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {ApiInlineLvlSdt} oSdt - An inline container. If undefined or null, then new class ApiInlineLvlSdt will be created and added to the paragraph.
 * @returns {ApiInlineLvlSdt}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/AddInlineLvlSdt.js
 */
ApiParagraph.prototype.AddInlineLvlSdt = function(oSdt){ return new ApiInlineLvlSdt(); };

/**
 * Adds a comment to the current paragraph.
 * <note>Please note that this paragraph must be in the document.</note>
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {string} sText - The comment text.
 * @param {string} [sAuthor] - The author's name.
 * @param {string} [sUserId] - The user ID of the comment author.
 * @returns {ApiComment} - Returns null if the comment was not added.
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/AddComment.js
 */
ApiParagraph.prototype.AddComment = function(sText, sAuthor, sUserId){ return new ApiComment(); };

/**
 * Adds a hyperlink to a paragraph. 
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {string} sLink - The link address.
 * @param {string} sScreenTipText - The screen tip text.
 * @returns {ApiHyperlink | null} - returns null if params are invalid.
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/AddHyperlink.js
 */
ApiParagraph.prototype.AddHyperlink = function(sLink, sScreenTipText){ return new ApiHyperlink(); };

/**
 * Returns a Range object that represents the part of the document contained in the specified paragraph.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {Number} Start - Start position index in the current element.
 * @param {Number} End - End position index in the current element.
 * @returns {ApiRange} 
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/GetRange.js
 */
ApiParagraph.prototype.GetRange = function(Start, End){ return new ApiRange(); };

/**
 * Adds an element to the current paragraph.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {ParagraphContent} oElement - The document element which will be added at the current position. Returns false if the
 * oElement type is not supported by a paragraph.
 * @returns {boolean} Returns <code>false</code> if the type of <code>oElement</code> is not supported by paragraph
 * content.
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/Push.js
 */
ApiParagraph.prototype.Push = function(oElement){ return true; };

/**
 * Returns the last Run with text in the current paragraph.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @returns {ApiRun} Returns <code>false</code> if the paragraph doesn't containt the required run.
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/GetLastRunWithText.js
 */
ApiParagraph.prototype.GetLastRunWithText = function(){ return new ApiRun(); };

/**
 * Sets the bold property to the text character.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {boolean} isBold - Specifies that the contents of this paragraph are displayed bold.
 * @returns {ApiParagraph} this
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/SetBold.js
 */
ApiParagraph.prototype.SetBold = function(isBold){ return new ApiParagraph(); };

/**
 * Specifies that any lowercase characters in this paragraph are formatted for display only as their capital letter character equivalents.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {boolean} isCaps - Specifies that the contents of the current paragraph are displayed capitalized.
 * @returns {ApiParagraph} this
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/SetCaps.js
 */
ApiParagraph.prototype.SetCaps = function(isCaps){ return new ApiParagraph(); };

/**
 * Sets the text color to the current paragraph in the RGB format.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @param {boolean} [isAuto=false] - If this parameter is set to "true", then r,g,b parameters will be ignored.
 * @returns {ApiParagraph} this
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/SetColor.js
 */
ApiParagraph.prototype.SetColor = function(r, g, b, isAuto){ return new ApiParagraph(); };

/**
 * Specifies that the contents of this paragraph are displayed with two horizontal lines through each character displayed on the line.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {boolean} isDoubleStrikeout - Specifies that the contents of the current paragraph are displayed double struck through.
 * @returns {ApiParagraph} this
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/SetDoubleStrikeout.js
 */
ApiParagraph.prototype.SetDoubleStrikeout = function(isDoubleStrikeout){ return new ApiParagraph(); };

/**
 * Sets all 4 font slots with the specified font family.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {string} sFontFamily - The font family or families used for the current paragraph.
 * @returns {ApiParagraph} this
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/SetFontFamily.js
 */
ApiParagraph.prototype.SetFontFamily = function(sFontFamily){ return new ApiParagraph(); };

/**
 * Returns all font names from all elements inside the current paragraph.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @returns {string[]} - The font names used for the current paragraph.
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/GetFontNames.js
 */
ApiParagraph.prototype.GetFontNames = function(){ return [""]; };

/**
 * Sets the font size to the characters of the current paragraph.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {hps} nSize - The text size value measured in half-points (1/144 of an inch).
 * @returns {ApiParagraph} this
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/SetFontSize.js
 */
ApiParagraph.prototype.SetFontSize = function(nSize){ return new ApiParagraph(); };

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
 * Sets the italic property to the text character.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {boolean} isItalic - Specifies that the contents of the current paragraph are displayed italicized.
 * @returns {ApiParagraph} this
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/SetItalic.js
 */
ApiParagraph.prototype.SetItalic = function(isItalic){ return new ApiParagraph(); };

/**
 * Specifies an amount by which text is raised or lowered for this paragraph in relation to the default
 * baseline of the surrounding non-positioned text.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {hps} nPosition - Specifies a positive (raised text) or negative (lowered text)
 * measurement in half-points (1/144 of an inch).
 * @returns {ApiParagraph} this
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/SetPosition.js
 */
ApiParagraph.prototype.SetPosition = function(nPosition){ return new ApiParagraph(); };

/**
 * Specifies that all the small letter characters in this paragraph are formatted for display only as their capital
 * letter character equivalents which are two points smaller than the actual font size specified for this text.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {boolean} isSmallCaps - Specifies if the contents of the current paragraph are displayed capitalized two points smaller or not.
 * @returns {ApiParagraph} this
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/SetSmallCaps.js
 */
ApiParagraph.prototype.SetSmallCaps = function(isSmallCaps){ return new ApiParagraph(); };

/**
 * Sets the text spacing measured in twentieths of a point.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {twips} nSpacing - The value of the text spacing measured in twentieths of a point (1/1440 of an inch).
 * @returns {ApiParagraph} this
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/SetSpacing.js
 */
ApiParagraph.prototype.SetSpacing = function(nSpacing){ return new ApiParagraph(); };

/**
 * Specifies that the contents of this paragraph are displayed with a single horizontal line through the center of the line.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {boolean} isStrikeout - Specifies that the contents of the current paragraph are displayed struck through.
 * @returns {ApiParagraph} this
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/SetStrikeout.js
 */
ApiParagraph.prototype.SetStrikeout = function(isStrikeout){ return new ApiParagraph(); };

/**
 * Specifies that the contents of this paragraph are displayed along with a line appearing directly below the character
 * (less than all the spacing above and below the characters on the line).
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {boolean} isUnderline - Specifies that the contents of the current paragraph are displayed underlined.
 * @returns {ApiParagraph} this
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/SetUnderline.js
 */
ApiParagraph.prototype.SetUnderline = function(isUnderline){ return new ApiParagraph(); };

/**
 * Specifies the alignment which will be applied to the contents of this paragraph in relation to the default appearance of the paragraph text:
 * <b>"baseline"</b> - the characters in the current paragraph will be aligned by the default text baseline.
 * <b>"subscript"</b> - the characters in the current paragraph will be aligned below the default text baseline.
 * <b>"superscript"</b> - the characters in the current paragraph will be aligned above the default text baseline.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {("baseline" | "subscript" | "superscript")} sType - The vertical alignment type applied to the text contents.
 * @returns {ApiParagraph | null} - returns null is sType is invalid.
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/SetVertAlign.js
 */
ApiParagraph.prototype.SetVertAlign = function(sType){ return new ApiParagraph(); };

/**
 * Returns the last element of the paragraph which is not empty.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @returns {ParagraphContent}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/Last.js
 */
ApiParagraph.prototype.Last = function(){ return new ParagraphContent(); };

/**
 * Returns a collection of content control objects in the paragraph.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @returns {ApiInlineLvlSdt[]}   
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/GetAllContentControls.js
 */
ApiParagraph.prototype.GetAllContentControls = function(){ return [new ApiInlineLvlSdt()]; };

/**
 * Returns a collection of drawing objects in the paragraph.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @returns {Drawing[]}  
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/GetAllDrawingObjects.js
 */
ApiParagraph.prototype.GetAllDrawingObjects = function(){ return [new Drawing()]; };

/**
 * Returns a collection of shape objects in the paragraph.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @returns {ApiShape[]}  
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/GetAllShapes.js
 */
ApiParagraph.prototype.GetAllShapes = function(){ return [new ApiShape()]; };

/**
 * Returns a collection of image objects in the paragraph.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @returns {ApiImage[]}  
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/GetAllImages.js
 */
ApiParagraph.prototype.GetAllImages = function(){ return [new ApiImage()]; };

/**
 * Returns a collection of chart objects in the paragraph.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @returns {ApiChart[]}  
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/GetAllCharts.js
 */
ApiParagraph.prototype.GetAllCharts = function(){ return [new ApiChart()]; };

/**
 * Returns a collection of OLE objects in the paragraph.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @returns {ApiOleObject[]}  
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/GetAllOleObjects.js
 */
ApiParagraph.prototype.GetAllOleObjects = function(){ return [new ApiOleObject()]; };

/**
 * Returns a content control that contains the current paragraph.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @returns {ApiBlockLvlSdt | null} - returns null is parent content control doesn't exist.  
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/GetParentContentControl.js
 */
ApiParagraph.prototype.GetParentContentControl = function(){ return new ApiBlockLvlSdt(); };

/**
 * Returns a table that contains the current paragraph.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @returns {ApiTable | null} - returns null if parent table doesn't exist.  
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/GetParentTable.js
 */
ApiParagraph.prototype.GetParentTable = function(){ return new ApiTable(); };

/**
 * Returns a table cell that contains the current paragraph.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @returns {ApiTableCell | null} - returns null if parent cell doesn't exist.  
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/GetParentTableCell.js
 */
ApiParagraph.prototype.GetParentTableCell = function(){ return new ApiTableCell(); };

/**
 * Returns the paragraph text.
 * @memberof ApiParagraph
 * @param {object} oPr - The resulting string display properties.
 * @param {boolean} [oPr.Numbering=false] - Defines if the resulting string will include numbering or not.
 * @param {boolean} [oPr.Math=false] - Defines if the resulting string will include mathematical expressions or not.
 * @param {string} [oPr.NewLineSeparator='\r'] - Defines how the line separator will be specified in the resulting string. Any symbol can be used. The default separator is "\r".
 * @param {string} [oPr.TabSymbol='\t'] - Defines how the tab will be specified in the resulting string (does not apply to numbering). Any symbol can be used. The default symbol is "\t".
 * @typeofeditors ["CDE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/GetText.js
 */
ApiParagraph.prototype.GetText = function(oPr){ return ""; };

/**
 * Returns the text properties for a paragraph end mark.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @returns {ApiTextPr}  
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/GetTextPr.js
 */
ApiParagraph.prototype.GetTextPr = function(){ return new ApiTextPr(); };

/**
 * Sets the paragraph text properties.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {ApiTextPr} oTextPr - The paragraph text properties.
 * @returns {boolean} - returns false if param is invalid.
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/SetTextPr.js
 */
ApiParagraph.prototype.SetTextPr = function(oTextPr){ return true; };

/**
 * Wraps the paragraph object with a rich text content control.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {number} nType - Defines if this method returns the ApiBlockLvlSdt (nType === 1) or ApiParagraph (any value except 1) object.
 * @returns {ApiParagraph | ApiBlockLvlSdt}  
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/InsertInContentControl.js
 */
ApiParagraph.prototype.InsertInContentControl = function(nType){ return new ApiParagraph(); };

/**
 * Inserts a paragraph at the specified position.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {string | ApiParagraph} paragraph - Text or paragraph.
 * @param {string} sPosition - The position where the text or paragraph will be inserted ("before" or "after" the paragraph specified).
 * @param {boolean} beRNewPara - Defines if this method returns a new paragraph (true) or the current paragraph (false).
 * @returns {ApiParagraph | null} - returns null if param paragraph is invalid. 
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/InsertParagraph.js
 */
ApiParagraph.prototype.InsertParagraph = function(paragraph, sPosition, beRNewPara){ return new ApiParagraph(); };

/**
 * Selects the current paragraph.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/Select.js
 */
ApiParagraph.prototype.Select = function(){ return true; };

/**
 * Searches for a scope of a paragraph object. The search results are a collection of ApiRange objects.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {string} sText - Search string.
 * @param {boolean} isMatchCase - Case sensitive or not.
 * @returns {ApiRange[]}  
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/Search.js
 */
ApiParagraph.prototype.Search = function(sText, isMatchCase){ return [new ApiRange()]; };

/**
 * Wraps the paragraph content in a mail merge field.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/WrapInMailMergeField.js
 */
ApiParagraph.prototype.WrapInMailMergeField = function(){ return true; };

/**
 * Adds a numbered cross-reference to the current paragraph.
 * <note>Please note that this paragraph must be in the document.</note>
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {numberedRefTo} sRefType - The text or numeric value of a numbered reference you want to insert.
 * @param {ApiParagraph} oParaTo - The numbered paragraph to be referred to (must be in the document).
 * @param {boolean} [bLink=true] - Specifies if the reference will be inserted as a hyperlink.
 * @param {boolean} [bAboveBelow=false] - Specifies if the above/below words indicating the position of the reference should be included (don't used with the "text" and "aboveBelow" sRefType).
 * @param {string} [sSepWith=""] - A number separator (used only with the "fullCtxParaNum" sRefType).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/AddNumberedCrossRef.js
 */
ApiParagraph.prototype.AddNumberedCrossRef = function(sRefTo, oParaTo, bLink, bAboveBelow, sSepWith){ return true; };

/**
 * Adds a heading cross-reference to the current paragraph.
 * <note>Please note that this paragraph must be in the document.</note>
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {headingRefTo} sRefType - The text or numeric value of a heading reference you want to insert.
 * @param {ApiParagraph} oParaTo - The heading paragraph to be referred to (must be in the document).
 * @param {boolean} [bLink=true] - Specifies if the reference will be inserted as a hyperlink.
 * @param {boolean} [bAboveBelow=false] - Specifies if the above/below words indicating the position of the reference should be included (don't used with the "text" and "aboveBelow" sRefType).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/AddHeadingCrossRef.js
 */
ApiParagraph.prototype.AddHeadingCrossRef = function(sRefTo, oParaTo, bLink, bAboveBelow){ return true; };

/**
 * Adds a bookmark cross-reference to the current paragraph.
 * <note>Please note that this paragraph must be in the document.</note>
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {bookmarkRefTo} sRefTo - The text or numeric value of a bookmark reference you want to insert.
 * @param {string} sBookmarkName - The name of the bookmark to be referred to (must be in the document).
 * @param {boolean} [bLink=true] - Specifies if the reference will be inserted as a hyperlink.
 * @param {boolean} [bAboveBelow=false] - Specifies if the above/below words indicating the position of the reference should be included (don't used with the "text" and "aboveBelow" sRefType).
 * @param {string} [sSepWith=""] - A number separator (used only with the "fullCtxParaNum" sRefType).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/AddBookmarkCrossRef.js
 */
ApiParagraph.prototype.AddBookmarkCrossRef = function(sRefTo, sBookmarkName, bLink, bAboveBelow, sSepWith){ return true; };

/**
 * Adds a footnote cross-reference to the current paragraph.
 * <note>Please note that this paragraph must be in the document.</note>
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {footnoteRefTo} sRefType - The text or numeric value of a footnote reference you want to insert.
 * @param {ApiParagraph} oParaTo - The first paragraph from a footnote to be referred to (must be in the document).
 * @param {boolean} [bLink=true] - Specifies if the reference will be inserted as a hyperlink.
 * @param {boolean} [bAboveBelow=false] - Specifies if the above/below words indicating the position of the reference should be included (don't used with the "aboveBelow" sRefType).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/AddFootnoteCrossRef.js
 */
ApiParagraph.prototype.AddFootnoteCrossRef = function(sRefTo, oParaTo, bLink, bAboveBelow){ return true; };

/**
 * Adds an endnote cross-reference to the current paragraph.
 * <note>Please note that this paragraph must be in the document.</note>
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {endnoteRefTo} sRefType - The text or numeric value of an endnote reference you want to insert.
 * @param {ApiParagraph} oParaTo - The first paragraph from an endnote to be referred to (must be in the document).
 * @param {boolean} [bLink=true] - Specifies if the reference will be inserted as a hyperlink.
 * @param {boolean} [bAboveBelow=false] - Specifies if the above/below words indicating the position of the reference should be included (don't used with the "aboveBelow" sRefType).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/AddEndnoteCrossRef.js
 */
ApiParagraph.prototype.AddEndnoteCrossRef = function(sRefTo, oParaTo, bLink, bAboveBelow){ return true; };

/**
 * Adds a caption cross-reference to the current paragraph.
 * <note>Please note that this paragraph must be in the document.</note>
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {CaptionLabel | string} sCaption - The caption label ("Equation", "Figure", "Table", or another caption label).
 * @param {captionRefTo} sRefType - The text or numeric value of a caption reference you want to insert.
 * @param {ApiParagraph} oParaTo - The caption paragraph to be referred to (must be in the document).
 * @param {boolean} [bLink=true] - Specifies if the reference will be inserted as a hyperlink.
 * @param {boolean} [bAboveBelow=false] - Specifies if the above/below words indicating the position of the reference should be included (used only with the "pageNum" sRefType).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/AddCaptionCrossRef.js
 */
ApiParagraph.prototype.AddCaptionCrossRef = function(sCaption, sRefTo, oParaTo, bLink, bAboveBelow){ return true; };

/**
 * Converts the ApiParagraph object into the JSON object.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {boolean} bWriteNumberings - Specifies if the used numberings will be written to the JSON object or not.
 * @param {boolean} bWriteStyles - Specifies if the used styles will be written to the JSON object or not.
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/ToJSON.js
 */
ApiParagraph.prototype.ToJSON = function(bWriteNumberings, bWriteStyles){ return new JSON(); };

/**
 * Returns the paragraph position within its parent element.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @returns {Number} - returns -1 if the paragraph parent doesn't exist. 
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/GetPosInParent.js
 */
ApiParagraph.prototype.GetPosInParent = function(){ return 0; };

/**
 * Replaces the current paragraph with a new element.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {DocumentElement} oElement - The element to replace the current paragraph with.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/ReplaceByElement.js
 */
ApiParagraph.prototype.ReplaceByElement = function(oElement){ return true; };

/**
 * Adds a caption paragraph after (or before) the current paragraph.
 * <note>Please note that the current paragraph must be in the document (not in the footer/header).
 * And if the current paragraph is placed in a shape, then a caption is added after (or before) the parent shape.</note>
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {string} sAdditional - The additional text.
 * @param {CaptionLabel | String} [sLabel="Table"] - The caption label.
 * @param {boolean} [bExludeLabel=false] - Specifies whether to exclude the label from the caption.
 * @param {CaptionNumberingFormat} [sNumberingFormat="Arabic"] - The possible caption numbering format.
 * @param {boolean} [bBefore=false] - Specifies whether to insert the caption before the current paragraph (true) or after (false) (after/before the shape if it is placed in the shape).
 * @param {Number} [nHeadingLvl=undefined] - The heading level (used if you want to specify the chapter number).
 * <note>If you want to specify "Heading 1", then nHeadingLvl === 0 and etc.</note>
 * @param {CaptionSep} [sCaptionSep="hyphen"] - The caption separator (used if you want to specify the chapter number).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/AddCaption.js
 */
ApiParagraph.prototype.AddCaption = function(sAdditional, sLabel, bExludeLabel, sNumberingFormat, bBefore, nHeadingLvl, sCaptionSep){ return true; };

/**
 * Returns the paragraph section.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @returns {ApiSection}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/GetSection.js
 */
ApiParagraph.prototype.GetSection = function(){ return new ApiSection(); };

/**
 * Sets the specified section to the current paragraph.
 * @memberof ApiParagraph
 * @typeofeditors ["CDE"]
 * @param {ApiSection} oSection - The section which will be set to the paragraph.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParagraph/Methods/SetSection.js
 */
ApiParagraph.prototype.SetSection = function(oSection){ return true; };

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
 * Adds a page break and starts the next element from a new page.
 * @memberof ApiRun
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/AddPageBreak.js
 */
ApiRun.prototype.AddPageBreak = function(){ return true; };

/**
 * Adds a line break to the current run position and starts the next element from a new line.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/AddLineBreak.js
 */
ApiRun.prototype.AddLineBreak = function(){ return true; };

/**
 * Adds a column break to the current run position and starts the next element from a new column.
 * @memberof ApiRun
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/AddColumnBreak.js
 */
ApiRun.prototype.AddColumnBreak = function(){ return true; };

/**
 * Adds a tab stop to the current run.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/AddTabStop.js
 */
ApiRun.prototype.AddTabStop = function(){ return true; };

/**
 * Adds a drawing object (image, shape or chart) to the current text run.
 * @memberof ApiRun
 * @typeofeditors ["CDE"]
 * @param {ApiDrawing} oDrawing - The object which will be added to the current run.
 * @returns {boolean} - returns false if param is invalid.
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/AddDrawing.js
 */
ApiRun.prototype.AddDrawing = function(oDrawing){ return true; };

/**
 * Selects the current run.
 * @memberof ApiRun
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/Select.js
 */
ApiRun.prototype.Select = function(){ return true; };

/**
 * Adds a hyperlink to the current run. 
 * @memberof ApiRun
 * @typeofeditors ["CDE"]
 * @param {string} sLink - The link address.
 * @param {string} sScreenTipText - The screen tip text.
 * @returns {ApiHyperlink | null} - returns false if params are invalid.
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/AddHyperlink.js
 */
ApiRun.prototype.AddHyperlink = function(sLink, sScreenTipText){ return new ApiHyperlink(); };

/**
 * Creates a copy of the current run.
 * @memberof ApiRun
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {ApiRun}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/Copy.js
 */
ApiRun.prototype.Copy = function(){ return new ApiRun(); };

/**
 * Returns a Range object that represents the part of the document contained in the specified run.
 * @memberof ApiRun
 * @typeofeditors ["CDE"]
 * @param {Number} Start - Start position index in the current element.
 * @param {Number} End - End position index in the current element.
 * @returns {ApiRange} 
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/GetRange.js
 */
ApiRun.prototype.GetRange = function(Start, End){ return new ApiRange(); };

/**
 * Returns a content control that contains the current run.
 * @memberof ApiRun
 * @typeofeditors ["CDE"]
 * @returns {ApiBlockLvlSdt | ApiInlineLvlSdt | null} - returns null if parent content control doesn't exist.  
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/GetParentContentControl.js
 */
ApiRun.prototype.GetParentContentControl = function(){ return new ApiBlockLvlSdt(); };

/**
 * Returns a table that contains the current run.
 * @memberof ApiRun
 * @typeofeditors ["CDE"]
 * @returns {ApiTable | null} - returns null if parent table doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/GetParentTable.js
 */
ApiRun.prototype.GetParentTable = function(){ return new ApiTable(); };

/**
 * Returns a table cell that contains the current run.
 * @memberof ApiRun
 * @typeofeditors ["CDE"]
 * @returns {ApiTableCell | null} - returns null is parent cell doesn't exist.  
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/GetParentTableCell.js
 */
ApiRun.prototype.GetParentTableCell = function(){ return new ApiTableCell(); };

/**
 * Returns a parent paragraph of the current run.
 * @memberof ApiRun
 * @typeofeditors ["CDE"]
 * @returns {ApiParagraph}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/GetParentParagraph.js
 */
ApiRun.prototype.GetParentParagraph = function(){ return new ApiParagraph(); };

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
 * Sets a style to the current run.
 * @memberof ApiRun
 * @typeofeditors ["CDE"]
 * @param {ApiStyle} oStyle - The style which must be applied to the text run.
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/SetStyle.js
 */
ApiRun.prototype.SetStyle = function(oStyle){ return new ApiTextPr(); };

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
 * Wraps a run in a mail merge field.
 * @memberof ApiRun
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/WrapInMailMergeField.js
 */
ApiRun.prototype.WrapInMailMergeField = function(){ return true; };

/**
 * Converts the ApiRun object into the JSON object.
 * @memberof ApiRun
 * @typeofeditors ["CDE"]
 * @param {boolean} bWriteStyles - Specifies if the used styles will be written to the JSON object or not.
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/ToJSON.js
 */
ApiRun.prototype.ToJSON = function(bWriteStyles){ return new JSON(); };

/**
 * Adds a comment to the current run.
 * <note>Please note that this run must be in the document.</note>
 * @memberof ApiRun
 * @typeofeditors ["CDE"]
 * @param {string} sText - The comment text.
 * @param {string} [sAuthor] - The author's name.
 * @param {string} [sUserId] - The user ID of the comment author.
 * @returns {ApiComment} - Returns null if the comment was not added.
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/AddComment.js
 */
ApiRun.prototype.AddComment = function(sText, sAuthor, sUserId){ return new ApiComment(); };

/**
 * Returns a text from the text run.
 * @memberof ApiRun
 * @param {object} oPr - The resulting string display properties.
 * @param {string} [oPr.NewLineSeparator='\r'] - Defines how the line separator will be specified in the resulting string. Any symbol can be used. The default separator is "\r".
 * @param {string} [oPr.TabSymbol='\t'] - Defines how the tab will be specified in the resulting string. Any symbol can be used. The default symbol is "\t".
 * @typeofeditors ["CDE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/GetText.js
 */
ApiRun.prototype.GetText = function(oPr){ return ""; };

/**
 * Moves a cursor to a specified position of the current text run.
 * If the current run is not assigned to any document part, then <b>false</b> is returned. Otherwise, this method returns <b>true</b>.
 * If there is any selection in the document, it will be removed.
 * @memberof ApiRun
 * @param {number} [nPos=0] - Desired cursor position.
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiRun/Methods/MoveCursorToPos.js
 */
ApiRun.prototype.MoveCursorToPos = function(nPos){ return true; };

/**
 * Returns a type of the ApiSection class.
 * @memberof ApiSection
 * @typeofeditors ["CDE"]
 * @returns {"section"}
 * @see office-js-api/Examples/{Editor}/ApiSection/Methods/GetClassType.js
 */
ApiSection.prototype.GetClassType = function(){ return ""; };

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
 * Specifies a type of the current section. The section type defines how the contents of the current 
 * section are placed relative to the previous section.
 * @memberof ApiSection
 * @typeofeditors ["CDE"]
 * @param {SectionBreakType} sType - The section break type.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiSection/Methods/SetType.js
 */
ApiSection.prototype.SetType = function(sType){ return true; };

/**
 * Returns the section break type.
 * @memberof ApiSection
 * @typeofeditors ["CDE"]
 * @returns {SectionBreakType} - The section break type.
 * @since 8.2.0
 * @see office-js-api/Examples/{Editor}/ApiSection/Methods/GetType.js
 */
ApiSection.prototype.GetType = function(){ return new SectionBreakType(); };

/**
 * Specifies that all the text columns in the current section are of equal width.
 * @memberof ApiSection
 * @typeofeditors ["CDE"]
 * @param {number} nCount - Number of columns.
 * @param {twips} nSpace - Distance between columns measured in twentieths of a point (1/1440 of an inch).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiSection/Methods/SetEqualColumns.js
 */
ApiSection.prototype.SetEqualColumns = function(nCount, nSpace){ return true; };

/**
 * Specifies that all the columns in the current section have the different widths. Number of columns is equal 
 * to the length of the aWidth array. The length of the aSpaces array MUST BE equal to (aWidth.length - 1).
 * @memberof ApiSection
 * @typeofeditors ["CDE"]
 * @param {twips[]} aWidths - An array of column width values measured in twentieths of a point (1/1440 of an inch).
 * @param {twips[]} aSpaces - An array of distance values between the columns measured in twentieths of a point (1/1440 of an inch).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiSection/Methods/SetNotEqualColumns.js
 */
ApiSection.prototype.SetNotEqualColumns = function(aWidths, aSpaces){ return true; };

/**
 * Specifies the properties (size and orientation) for all the pages in the current section.
 * @memberof ApiSection
 * @typeofeditors ["CDE"]
 * @param {twips} nWidth - The page width measured in twentieths of a point (1/1440 of an inch).
 * @param {twips} nHeight - The page height measured in twentieths of a point (1/1440 of an inch).
 * @param {boolean} [isPortrait=false] - Specifies the orientation of all the pages in this section (if set to true, then the portrait orientation is chosen).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiSection/Methods/SetPageSize.js
 */
ApiSection.prototype.SetPageSize = function(nWidth, nHeight, isPortrait){ return true; };

/**
 * Gets page height for current section.
 * @memberof ApiSection
 * @typeofeditors ["CDE"]
 * @returns {twips}
 * @see office-js-api/Examples/{Editor}/ApiSection/Methods/GetPageHeight.js
 */
ApiSection.prototype.GetPageHeight = function(){ return new twips(); };

/**
 * Gets page width for current section.
 * @memberof ApiSection
 * @typeofeditors ["CDE"]
 * @returns {twips}
 * @see office-js-api/Examples/{Editor}/ApiSection/Methods/GetPageWidth.js
 */
ApiSection.prototype.GetPageWidth = function(){ return new twips(); };

/**
 * Specifies the page margins for all the pages in this section.
 * @memberof ApiSection
 * @typeofeditors ["CDE"]
 * @param {twips} nLeft - The left margin width measured in twentieths of a point (1/1440 of an inch).
 * @param {twips} nTop - The top margin height measured in twentieths of a point (1/1440 of an inch).
 * @param {twips} nRight - The right margin width measured in twentieths of a point (1/1440 of an inch).
 * @param {twips} nBottom - The bottom margin height measured in twentieths of a point (1/1440 of an inch).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiSection/Methods/SetPageMargins.js
 */
ApiSection.prototype.SetPageMargins = function(nLeft, nTop, nRight, nBottom){ return true; };

/**
 * Specifies the distance from the top edge of the page to the top edge of the header.
 * @memberof ApiSection
 * @typeofeditors ["CDE"]
 * @param {twips} nDistance - The distance from the top edge of the page to the top edge of the header measured in twentieths of a point (1/1440 of an inch).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiSection/Methods/SetHeaderDistance.js
 */
ApiSection.prototype.SetHeaderDistance = function(nDistance){ return true; };

/**
 * Specifies the distance from the bottom edge of the page to the bottom edge of the footer.
 * @memberof ApiSection
 * @typeofeditors ["CDE"]
 * @param {twips} nDistance - The distance from the bottom edge of the page to the bottom edge of the footer measured
 * in twentieths of a point (1/1440 of an inch).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiSection/Methods/SetFooterDistance.js
 */
ApiSection.prototype.SetFooterDistance = function(nDistance){ return true; };

/**
 * Returns the content for the specified header type.
 * @memberof ApiSection
 * @typeofeditors ["CDE"]
 * @param {HdrFtrType} sType - Header type to get the content from.
 * @param {boolean} [isCreate=false] - Specifies whether to create a new header or not with the specified header type in case
 * no header with such a type could be found in the current section.
 * @returns {ApiDocumentContent}
 * @see office-js-api/Examples/{Editor}/ApiSection/Methods/GetHeader.js
 */
ApiSection.prototype.GetHeader = function(sType, isCreate){ return new ApiDocumentContent(); };

/**
 * Removes the header of the specified type from the current section. After removal, the header will be inherited from
 * the previous section, or if this is the first section in the document, no header of the specified type will be presented.
 * @memberof ApiSection
 * @typeofeditors ["CDE"]
 * @param {HdrFtrType} sType - Header type to be removed.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiSection/Methods/RemoveHeader.js
 */
ApiSection.prototype.RemoveHeader = function(sType){ return true; };

/**
 * Returns the content for the specified footer type.
 * @memberof ApiSection
 * @typeofeditors ["CDE"]
 * @param {HdrFtrType} sType - Footer type to get the content from.
 * @param {boolean} [isCreate=false] - Specifies whether to create a new footer or not with the specified footer type in case
 * no footer with such a type could be found in the current section.
 * @returns {ApiDocumentContent}
 * @see office-js-api/Examples/{Editor}/ApiSection/Methods/GetFooter.js
 */
ApiSection.prototype.GetFooter = function(sType, isCreate){ return new ApiDocumentContent(); };

/**
 * Removes the footer of the specified type from the current section. After removal, the footer will be inherited from 
 * the previous section, or if this is the first section in the document, no footer of the specified type will be presented.
 * @memberof ApiSection
 * @typeofeditors ["CDE"]
 * @param {HdrFtrType} sType - Footer type to be removed.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiSection/Methods/RemoveFooter.js
 */
ApiSection.prototype.RemoveFooter = function(sType){ return true; };

/**
 * Specifies whether the current section in this document has the different header and footer for the section first page.
 * @memberof ApiSection
 * @typeofeditors ["CDE"]
 * @param {boolean} isTitlePage - If true, the first page of the section will have header and footer that will differ from the other pages of the same section.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiSection/Methods/SetTitlePage.js
 */
ApiSection.prototype.SetTitlePage = function(isTitlePage){ return true; };

/**
 * Returns the next section if exists.
 * @memberof ApiSection
 * @typeofeditors ["CDE"]
 * @returns {ApiSection | null} - returns null if section is last.
 * @see office-js-api/Examples/{Editor}/ApiSection/Methods/GetNext.js
 */
ApiSection.prototype.GetNext = function(){ return new ApiSection(); };

/**
 * Returns the previous section if exists.
 * @memberof ApiSection
 * @typeofeditors ["CDE"]
 * @returns {ApiSection | null} - returns null if section is first.
 * @see office-js-api/Examples/{Editor}/ApiSection/Methods/GetPrevious.js
 */
ApiSection.prototype.GetPrevious = function(){ return new ApiSection(); };

/**
 * Converts the ApiSection object into the JSON object.
 * @memberof ApiSection
 * @typeofeditors ["CDE"]
 * @param {boolean} bWriteNumberings - Specifies if the used numberings will be written to the JSON object or not.
 * @param {boolean} bWriteStyles - Specifies if the used styles will be written to the JSON object or not.
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiSection/Methods/ToJSON.js
 */
ApiSection.prototype.ToJSON = function(bWriteNumberings, bWriteStyles){ return new JSON(); };

/**
 * Sets the start page number for the specified section.
 * @memberof ApiSection
 * @typeofeditors ["CDE"]
 * @param {number} nStartNumber - The start page number.
 * @returns {boolean}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiSection/Methods/SetStartPageNumber.js
 */
ApiSection.prototype.SetStartPageNumber = function(nStartNumber){ return true; };

/**
 * Returns the start page number of the specified section.
 * @memberof ApiSection
 * @typeofeditors ["CDE"]
 * @returns {number}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiSection/Methods/GetStartPageNumber.js
 */
ApiSection.prototype.GetStartPageNumber = function(){ return 0; };

/**
 * Returns a type of the ApiTable class.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @returns {"table"}
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/GetClassType.js
 */
ApiTable.prototype.GetClassType = function(){ return ""; };

/**
 * Returns a number of rows in the current table.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @returns {number}
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/GetRowsCount.js
 */
ApiTable.prototype.GetRowsCount = function(){ return 0; };

/**
 * Returns a table row by its position in the table.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @param {number} nPos - The row position within the table.
 * @returns {ApiTableRow | null} - returns null if param is invalid.
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/GetRow.js
 */
ApiTable.prototype.GetRow = function(nPos){ return new ApiTableRow(); };

/**
 * Returns a cell by its position.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @param {number} nRow - The row position in the current table where the specified cell is placed.
 * @param {number} nCell - The cell position in the current table.
 * @returns {ApiTableCell | null} - returns null if params are invalid.
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/GetCell.js
 */
ApiTable.prototype.GetCell = function(nRow, nCell){ return new ApiTableCell(); };

/**
 * Merges an array of cells. If the merge is done successfully, it will return the resulting merged cell, otherwise the result will be "null".
 * <note>The number of cells in any row and the number of rows in the current table may be changed.</note>
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @param {ApiTableCell[]} aCells - The array of cells to be merged.
 * @returns {ApiTableCell}
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/MergeCells.js
 */
ApiTable.prototype.MergeCells = function(aCells){ return new ApiTableCell(); };

/**
 * Sets a style to the current table.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @param {ApiStyle} oStyle - The style which will be applied to the current table.
 * @returns {boolean} - returns false if param is invalid.
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/SetStyle.js
 */
ApiTable.prototype.SetStyle = function(oStyle){ return true; };

/**
 * Specifies the conditional formatting components of the referenced table style (if one exists) 
 * which will be applied to the set of table rows with the current table-level property exceptions. A table style 
 * can specify up to six different optional conditional formats, for example, different formatting for the first column, 
 * which then can be applied or omitted from individual table rows in the parent table.
 * 
 * The default setting is to apply the row and column band formatting, but not the first row, last row, first 
 * column, or last column formatting.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @param {boolean} isFirstColumn - Specifies that the first column conditional formatting will be applied to the table.
 * @param {boolean} isFirstRow - Specifies that the first row conditional formatting will be applied to the table.
 * @param {boolean} isLastColumn - Specifies that the last column conditional formatting will be applied to the table.
 * @param {boolean} isLastRow - Specifies that the last row conditional formatting will be applied to the table.
 * @param {boolean} isHorBand - Specifies that the horizontal band conditional formatting will not be applied to the table.
 * @param {boolean} isVerBand - Specifies that the vertical band conditional formatting will not be applied to the table.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/SetTableLook.js
 */
ApiTable.prototype.SetTableLook = function(isFirstColumn, isFirstRow, isLastColumn, isLastRow, isHorBand, isVerBand){ return true; };

/**
 * Splits the cell into a given number of rows and columns.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @param {ApiTableCell} [oCell] - The cell which will be split.
 * @param {Number} [nRow=1] - Count of rows into which the cell will be split.
 * @param {Number} [nCol=1] - Count of columns into which the cell will be split.
 * @returns {ApiTable | null} - returns null if can't split.
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/Split.js
 */
ApiTable.prototype.Split = function(oCell, nRow, nCol){ return new ApiTable(); };

/**
 * Adds a new row to the current table.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @param {ApiTableCell} [oCell] - The cell after which a new row will be added. If not specified, a new row will
 * be added at the end of the table.
 * @param {boolean} [isBefore=false] - Adds a new row before (false) or after (true) the specified cell. If no cell is specified, then
 * this parameter will be ignored.
 * @returns {ApiTableRow}
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/AddRow.js
 */
ApiTable.prototype.AddRow = function(oCell, isBefore){ return new ApiTableRow(); };

/**
 * Adds the new rows to the current table.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @param {ApiTableCell} [oCell] - The cell after which the new rows will be added. If not specified, the new rows will
 * be added at the end of the table.
 * @param {Number} nCount - Count of rows to be added.
 * @param {boolean} [isBefore=false] - Adds the new rows before (false) or after (true) the specified cell. If no cell is specified, then
 * this parameter will be ignored.
 * @returns {ApiTable}
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/AddRows.js
 */
ApiTable.prototype.AddRows = function(oCell, nCount, isBefore){ return new ApiTable(); };

/**
 * Adds a new column to the current table.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @param {ApiTableCell} [oCell] - The cell after which a new column will be added. If not specified, a new column will be added at the end of the table.
 * @param {boolean} [isBefore=false] - Adds a new column before (false) or after (true) the specified cell. If no cell is specified,
 * then this parameter will be ignored.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/AddColumn.js
 */
ApiTable.prototype.AddColumn = function(oCell, isBefore){ return true; };

/**
 * Adds the new columns to the current table.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @param {ApiTableCell} [oCell] - The cell after which the new columns will be added. If not specified, the new columns will be added at the end of the table.
 * @param {Number} nCount - Count of columns to be added.
 * @param {boolean} [isBefore=false] - Adds the new columns before (false) or after (true) the specified cell. If no cell is specified,
 * then this parameter will be ignored.
 * @returns {ApiTable}
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/AddColumns.js
 */
ApiTable.prototype.AddColumns = function(oCell, nCount, isBefore){ return new ApiTable(); };

/**
 * Adds a paragraph or a table or a blockLvl content control using its position in the cell.
 * @memberof ApiTable
 * @typeofeditors ["CDE", "CPE"]
 * @param {ApiTableCell} oCell - The cell where the specified element will be added.
 * @param {number} nPos - The position in the cell where the specified element will be added.
 * @param {DocumentElement} oElement - The document element which will be added at the current position.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/AddElement.js
 */
ApiTable.prototype.AddElement = function(oCell, nPos, oElement){ return true; };

/**
 * Removes a table row with a specified cell.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @param {ApiTableCell} oCell - The cell which is placed in the row that will be removed.
 * @returns {boolean} Is the table empty after removing.
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/RemoveRow.js
 */
ApiTable.prototype.RemoveRow = function(oCell){ return true; };

/**
 * Removes a table column with a specified cell.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @param {ApiTableCell} oCell - The cell which is placed in the column that will be removed.
 * @returns {boolean} Is the table empty after removing.
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/RemoveColumn.js
 */
ApiTable.prototype.RemoveColumn = function(oCell){ return true; };

/**
 * Creates a copy of the current table.
 * @memberof ApiTable
 * @typeofeditors ["CDE", "CPE"]
 * @returns {ApiTable}
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/Copy.js
 */
ApiTable.prototype.Copy = function(){ return new ApiTable(); };

/**
 * Selects the current table.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/Select.js
 */
ApiTable.prototype.Select = function(){ return true; };

/**
 * Returns a Range object that represents the part of the document contained in the specified table.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @param {Number} Start - Start position index in the current element.
 * @param {Number} End - End position index in the current element.
 * @returns {ApiRange} 
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/GetRange.js
 */
ApiTable.prototype.GetRange = function(Start, End){ return new ApiRange(); };

/**
 * Sets the horizontal alignment to the table.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @param {String} sType - Horizontal alignment type: may be "left" or "center" or "right".
 * @returns {boolean} - returns false if param is invalid.
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/SetHAlign.js
 */
ApiTable.prototype.SetHAlign = function(sType){ return true; };

/**
 * Sets the vertical alignment to the table.
 * @typeofeditors ["CDE"]
 * @param {String} sType - Vertical alignment type: may be "top" or "center" or "bottom".
 * @returns {boolean} - returns false if param is invalid.
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/SetVAlign.js
 */
ApiTable.prototype.SetVAlign = function(sType){ return true; };

/**
 * Sets the table paddings.
 * If table is inline, then only left padding is applied.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @param {Number} nLeft - Left padding.
 * @param {Number} nTop - Top padding.
 * @param {Number} nRight - Right padding.
 * @param {Number} nBottom - Bottom padding.
 * @returns {boolean} - returns true.
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/SetPaddings.js
 */
ApiTable.prototype.SetPaddings = function(nLeft, nTop, nRight, nBottom){ return true; };

/**
 * Sets the table wrapping style.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @param {boolean} isFlow - Specifies if the table is inline or not.
 * @returns {boolean} - returns false if param is invalid.
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/SetWrappingStyle.js
 */
ApiTable.prototype.SetWrappingStyle = function(isFlow){ return true; };

/**
 * Returns a content control that contains the current table.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @returns {ApiBlockLvlSdt | null} - return null is parent content control doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/GetParentContentControl.js
 */
ApiTable.prototype.GetParentContentControl = function(){ return new ApiBlockLvlSdt(); };

/**
 * Wraps the current table object with a content control.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @param {number} nType - Defines if this method returns the ApiBlockLvlSdt (nType === 1) or ApiTable (any value except 1) object.
 * @returns {ApiTable | ApiBlockLvlSdt}  
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/InsertInContentControl.js
 */
ApiTable.prototype.InsertInContentControl = function(nType){ return new ApiTable(); };

/**
 * Returns a table that contains the current table.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @returns {ApiTable | null} - returns null if parent table doesn't exist.  
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/GetParentTable.js
 */
ApiTable.prototype.GetParentTable = function(){ return new ApiTable(); };

/**
 * Returns an array of tables that represents all the tables nested within the specified table.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @returns {ApiTable[]}
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/GetTables.js
 */
ApiTable.prototype.GetTables = function(){ return [new ApiTable()]; };

/**
 * Returns a table cell that contains the current table.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @returns {ApiTableCell | null} - returns null if parent cell doesn't exist.  
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/GetParentTableCell.js
 */
ApiTable.prototype.GetParentTableCell = function(){ return new ApiTableCell(); };

/**
 * Deletes the current table. 
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @returns {boolean} - returns false if parent of table doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/Delete.js
 */
ApiTable.prototype.Delete = function(){ return true; };

/**
 * Clears the content from the table.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @returns {boolean} - returns true.
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/Clear.js
 */
ApiTable.prototype.Clear = function(){ return true; };

/**
 * Searches for a scope of a table object. The search results are a collection of ApiRange objects.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @param {string} sText - Search string.
 * @param {boolean} isMatchCase - Case sensitive or not.
 * @returns {ApiRange[]}  
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/Search.js
 */
ApiTable.prototype.Search = function(sText, isMatchCase){ return [new ApiRange()]; };

/**
 * Applies the text settings to the entire contents of the table.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @param {ApiTextPr} oTextPr - The text properties that will be set to the current table.
 * @returns {boolean} - returns true.
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/SetTextPr.js
 */
ApiTable.prototype.SetTextPr = function(oTextPr){ return true; };

/**
 * Sets the background color to all cells in the current table.
 * @memberof ApiTable
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @param {boolean} bNone - Defines that background color will not be set.
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/SetBackgroundColor.js
 */
ApiTable.prototype.SetBackgroundColor = function(r, g, b, bNone){ return true; };

/**
 * Converts the ApiTable object into the JSON object.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @param {boolean} bWriteNumberings - Specifies if the used numberings will be written to the JSON object or not.
 * @param {boolean} bWriteStyles - Specifies if the used styles will be written to the JSON object or not.
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/ToJSON.js
 */
ApiTable.prototype.ToJSON = function(bWriteNumberings, bWriteStyles){ return new JSON(); };

/**
 * Returns the table position within its parent element.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @returns {Number} - returns -1 if the table parent doesn't exist. 
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/GetPosInParent.js
 */
ApiTable.prototype.GetPosInParent = function(){ return 0; };

/**
 * Replaces the current table with a new element.
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @param {DocumentElement} oElement - The element to replace the current table with.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/ReplaceByElement.js
 */
ApiTable.prototype.ReplaceByElement = function(oElement){ return true; };

/**
 * Adds a comment to all contents of the current table.
 * <note>Please note that this table must be in the document.</note>
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @param {string} sText - The comment text.
 * @param {string} [sAuthor] - The author's name.
 * @param {string} [sUserId] - The user ID of the comment author.
 * @returns {ApiComment} - Returns null if the comment was not added.
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/AddComment.js
 */
ApiTable.prototype.AddComment = function(sText, sAuthor, sUserId){ return new ApiComment(); };

/**
 * Adds a caption paragraph after (or before) the current table.
 * <note>Please note that the current table must be in the document (not in the footer/header).
 * And if the current table is placed in a shape, then a caption is added after (or before) the parent shape.</note>
 * @memberof ApiTable
 * @typeofeditors ["CDE"]
 * @param {string} sAdditional - The additional text.
 * @param {CaptionLabel | String} [sLabel="Table"] - The caption label.
 * @param {boolean} [bExludeLabel=false] - Specifies whether to exclude the label from the caption.
 * @param {CaptionNumberingFormat} [sNumberingFormat="Arabic"] - The possible caption numbering format.
 * @param {boolean} [bBefore=false] - Specifies whether to insert the caption before the current table (true) or after (false) (after/before the shape if it is placed in the shape).
 * @param {Number} [nHeadingLvl=undefined] - The heading level (used if you want to specify the chapter number).
 * <note>If you want to specify "Heading 1", then nHeadingLvl === 0 and etc.</note>
 * @param {CaptionSep} [sCaptionSep="hyphen"] - The caption separator (used if you want to specify the chapter number).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTable/Methods/AddCaption.js
 */
ApiTable.prototype.AddCaption = function(sAdditional, sLabel, bExludeLabel, sNumberingFormat, bBefore, nHeadingLvl, sCaptionSep){ return true; };

/**
 * Returns a type of the ApiTableRow class.
 * @memberof ApiTableRow
 * @typeofeditors ["CDE"]
 * @returns {"tableRow"}
 * @see office-js-api/Examples/{Editor}/ApiTableRow/Methods/GetClassType.js
 */
ApiTableRow.prototype.GetClassType = function(){ return ""; };

/**
 * Returns a number of cells in the current row.
 * @memberof ApiTableRow
 * @typeofeditors ["CDE"]
 * @returns {number}
 * @see office-js-api/Examples/{Editor}/ApiTableRow/Methods/GetCellsCount.js
 */
ApiTableRow.prototype.GetCellsCount = function(){ return 0; };

/**
 * Returns a cell by its position.
 * @memberof ApiTableRow
 * @typeofeditors ["CDE"]
 * @param {number} nPos - The cell position in the current row.
 * @returns {ApiTableCell}
 * @see office-js-api/Examples/{Editor}/ApiTableRow/Methods/GetCell.js
 */
ApiTableRow.prototype.GetCell = function(nPos){ return new ApiTableCell(); };

/**
 * Returns the current row index.
 * @memberof ApiTableRow
 * @typeofeditors ["CDE"]
 * @returns {Number}
 * @see office-js-api/Examples/{Editor}/ApiTableRow/Methods/GetIndex.js
 */
ApiTableRow.prototype.GetIndex = function(){ return 0; };

/**
 * Returns the parent table of the current row.
 * @memberof ApiTableRow
 * @typeofeditors ["CDE"]
 * @returns {ApiTable | null} - returns null if parent table doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiTableRow/Methods/GetParentTable.js
 */
ApiTableRow.prototype.GetParentTable = function(){ return new ApiTable(); };

/**
 * Returns the next row if exists.
 * @memberof ApiTableRow
 * @typeofeditors ["CDE"]
 * @returns {ApiTableRow | null} - returns null if row is last.
 * @see office-js-api/Examples/{Editor}/ApiTableRow/Methods/GetNext.js
 */
ApiTableRow.prototype.GetNext = function(){ return new ApiTableRow(); };

/**
 * Returns the previous row if exists.
 * @memberof ApiTableRow
 * @typeofeditors ["CDE"]
 * @returns {ApiTableRow | null} - returns null if row is first.
 * @see office-js-api/Examples/{Editor}/ApiTableRow/Methods/GetPrevious.js
 */
ApiTableRow.prototype.GetPrevious = function(){ return new ApiTableRow(); };

/**
 * Adds the new rows to the current table.
 * @memberof ApiTableRow
 * @typeofeditors ["CDE"]
 * @param {Number} nCount - Count of rows to be added.
 * @param {boolean} [isBefore=false] - Specifies if the rows will be added before or after the current row. 
 * @returns {ApiTable | null} - returns null if parent table doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiTableRow/Methods/AddRows.js
 */
ApiTableRow.prototype.AddRows = function(nCount, isBefore){ return new ApiTable(); };

/**
 * Merges the cells in the current row. 
 * @memberof ApiTableRow
 * @typeofeditors ["CDE"]
 * @returns {ApiTableCell | null} - return null if can't merge.
 * @see office-js-api/Examples/{Editor}/ApiTableRow/Methods/MergeCells.js
 */
ApiTableRow.prototype.MergeCells = function(){ return new ApiTableCell(); };

/**
 * Clears the content from the current row.
 * @memberof ApiTableRow
 * @typeofeditors ["CDE"]
 * @returns {boolean} - returns false if parent table doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiTableRow/Methods/Clear.js
 */
ApiTableRow.prototype.Clear = function(){ return true; };

/**
 * Removes the current table row.
 * @memberof ApiTableRow
 * @typeofeditors ["CDE"]
 * @returns {boolean} - return false if parent table doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiTableRow/Methods/Remove.js
 */
ApiTableRow.prototype.Remove = function(){ return true; };

/**
 * Sets the text properties to the current row.
 * @memberof ApiTableRow
 * @typeofeditors ["CDE"]
 * @param {ApiTextPr} oTextPr - The text properties that will be set to the current row.
 * @returns {boolean} - returns false if parent table doesn't exist or param is invalid.
 * @see office-js-api/Examples/{Editor}/ApiTableRow/Methods/SetTextPr.js
 */
ApiTableRow.prototype.SetTextPr = function(oTextPr){ return true; };

/**
 * Searches for a scope of a table row object. The search results are a collection of ApiRange objects.
 * @memberof ApiTableRow
 * @typeofeditors ["CDE"]
 * @param {string} sText - Search string.
 * @param {boolean} isMatchCase - Case sensitive or not.
 * @returns {ApiRange[]}
 * @see office-js-api/Examples/{Editor}/ApiTableRow/Methods/Search.js
 */
ApiTableRow.prototype.Search = function(sText, isMatchCase){ return [new ApiRange()]; };

/**
 * Sets the background color to all cells in the current table row.
 * @memberof ApiTableRow
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @param {boolean} bNone - Defines that background color will not be set.
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTableRow/Methods/SetBackgroundColor.js
 */
ApiTableRow.prototype.SetBackgroundColor = function(r, g, b, bNone){ return true; };

/**
 * Returns a type of the ApiTableCell class.
 * @memberof ApiTableCell
 * @typeofeditors ["CDE"]
 * @returns {"tableCell"}
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/GetClassType.js
 */
ApiTableCell.prototype.GetClassType = function(){ return ""; };

/**
 * Returns the current cell content.
 * @memberof ApiTableCell
 * @typeofeditors ["CDE"]
 * @returns {ApiDocumentContent}
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/GetContent.js
 */
ApiTableCell.prototype.GetContent = function(){ return new ApiDocumentContent(); };

/**
 * Returns the current cell index.
 * @memberof ApiTableCell
 * @typeofeditors ["CDE"]
 * @returns {Number}
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/GetIndex.js
 */
ApiTableCell.prototype.GetIndex = function(){ return 0; };

/**
 * Returns an index of the parent row.
 * @memberof ApiTableCell
 * @typeofeditors ["CDE"]
 * @returns {number}
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/GetRowIndex.js
 */
ApiTableCell.prototype.GetRowIndex = function(){ return 0; };

/**
 * Returns a parent row of the current cell.
 * @memberof ApiTableCell
 * @typeofeditors ["CDE"]
 * @returns {ApiTableRow | null} - returns null if parent row doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/GetParentRow.js
 */
ApiTableCell.prototype.GetParentRow = function(){ return new ApiTableRow(); };

/**
 * Returns a parent table of the current cell.
 * @memberof ApiTableCell
 * @typeofeditors ["CDE"]
 * @returns {ApiTable | null} - returns null if parent table doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/GetParentTable.js
 */
ApiTableCell.prototype.GetParentTable = function(){ return new ApiTable(); };

/**
 * Adds the new rows to the current table.
 * @memberof ApiTableCell
 * @typeofeditors ["CDE"]
 * @param {Number} nCount - Count of rows to be added.
 * @param {boolean} [isBefore=false] - Specifies if the new rows will be added before or after the current cell. 
 * @returns {ApiTable | null} - returns null if parent table doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/AddRows.js
 */
ApiTableCell.prototype.AddRows = function(nCount, isBefore){ return new ApiTable(); };

/**
 * Adds the new columns to the current table.
 * @memberof ApiTableCell
 * @typeofeditors ["CDE"]
 * @param {Number} nCount - Count of columns to be added.
 * @param {boolean} [isBefore=false] - Specifies if the new columns will be added before or after the current cell. 
 * @returns {ApiTable | null} - returns null if parent table doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/AddColumns.js
 */
ApiTableCell.prototype.AddColumns = function(nCount, isBefore){ return new ApiTable(); };

/**
 * Removes a column containing the current cell.
 * @memberof ApiTableCell
 * @typeofeditors ["CDE"]
 * @returns {boolean} - returns false if table doen't exist
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/RemoveColumn.js
 */
ApiTableCell.prototype.RemoveColumn = function(){ return true; };

/**
 * Removes a row containing the current cell.
 * @memberof ApiTableCell
 * @typeofeditors ["CDE"]
 * @returns {boolean} Is the table empty after removing.
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/RemoveRow.js
 */
ApiTableCell.prototype.RemoveRow = function(){ return true; };

/**
 * Searches for a scope of a table cell object. The search results are a collection of ApiRange objects.
 * @memberof ApiTableCell
 * @typeofeditors ["CDE"]
 * @param {string} sText - Search string.
 * @param {boolean} isMatchCase - Case sensitive or not.
 * @returns {ApiRange[]}  
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/Search.js
 */
ApiTableCell.prototype.Search = function(sText, isMatchCase){ return [new ApiRange()]; };

/**
 * Returns the next cell if exists.
 * @memberof ApiTableCell
 * @typeofeditors ["CDE"]
 * @returns {ApiTableCell | null} - returns null if cell is last.
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/GetNext.js
 */
ApiTableCell.prototype.GetNext = function(){ return new ApiTableCell(); };

/**
 * Returns the previous cell if exists.
 * @memberof ApiTableCell
 * @typeofeditors ["CDE"]
 * @returns {ApiTableCell | null} - returns null is cell is first. 
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/GetPrevious.js
 */
ApiTableCell.prototype.GetPrevious = function(){ return new ApiTableCell(); };

/**
 * Splits the cell into a given number of rows and columns.
 * @memberof ApiTableCell
 * @typeofeditors ["CDE"]
 * @param {Number} [nRow=1] - Count of rows into which the cell will be split.
 * @param {Number} [nCol=1] - Count of columns into which the cell will be split.
 * @returns {ApiTable | null} - returns null if parent table doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/Split.js
 */
ApiTableCell.prototype.Split = function(nRow, nCol){ return new ApiTable(); };

/**
 * Sets the cell properties to the current cell.
 * @memberof ApiTableCell
 * @typeofeditors ["CDE"]
 * @param {ApiTableCellPr} oApiTableCellPr - The properties that will be set to the current table cell.
 * @returns {boolean} - returns false if param is invalid.
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/SetCellPr.js
 */
ApiTableCell.prototype.SetCellPr = function(oApiTableCellPr){ return true; };

/**
 * Applies the text settings to the entire contents of the current cell.
 * @memberof ApiTableCell
 * @typeofeditors ["CDE"]
 * @param {ApiTextPr} oTextPr - The properties that will be set to the current table cell text.
 * @returns {boolean} - returns false if param is invalid.
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/SetTextPr.js
 */
ApiTableCell.prototype.SetTextPr = function(oTextPr){ return true; };

/**
 * Clears the content from the current cell.
 * @memberof ApiTableCell
 * @typeofeditors ["CDE"]
 * @returns {boolean} - returns false if parent row is invalid.
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/Clear.js
 */
ApiTableCell.prototype.Clear = function(){ return true; };

/**
 * Adds a paragraph or a table or a blockLvl content control using its position in the cell.
 * @memberof ApiTableCell
 * @typeofeditors ["CDE"]
 * @param {number} nPos - The position where the current element will be added.
 * @param {DocumentElement} oElement - The document element which will be added at the current position.
 * @returns {boolean} - returns false if oElement is invalid.
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/AddElement.js
 */
ApiTableCell.prototype.AddElement = function(nPos, oElement){ return true; };

/**
 * Sets the background color to the current table cell.
 * @memberof ApiTableCell
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @param {boolean} bNone - Defines that background color will not be set.
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/SetBackgroundColor.js
 */
ApiTableCell.prototype.SetBackgroundColor = function(r, g, b, bNone){ return true; };

/**
 * Sets the background color to all cells in the column containing the current cell.
 * @memberof ApiTableCell
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @param {boolean} bNone - Defines that background color will not be set.
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTableCell/Methods/SetColumnBackgroundColor.js
 */
ApiTableCell.prototype.SetColumnBackgroundColor = function(r, g, b, bNone){ return true; };

/**
 * Returns a type of the ApiStyle class.
 * @memberof ApiStyle
 * @typeofeditors ["CDE"]
 * @returns {"style"}
 * @see office-js-api/Examples/{Editor}/ApiStyle/Methods/GetClassType.js
 */
ApiStyle.prototype.GetClassType = function(){ return ""; };

/**
 * Returns a name of the current style.
 * @memberof ApiStyle
 * @typeofeditors ["CDE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiStyle/Methods/GetName.js
 */
ApiStyle.prototype.GetName = function(){ return ""; };

/**
 * Sets a name of the current style.
 * @memberof ApiStyle
 * @typeofeditors ["CDE"]
 * @param {string} sStyleName - The name which will be used for the current style.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiStyle/Methods/SetName.js
 */
ApiStyle.prototype.SetName = function(sStyleName){ return true; };

/**
 * Returns a type of the current style.
 * @memberof ApiStyle
 * @typeofeditors ["CDE"]
 * @returns {StyleType}
 * @see office-js-api/Examples/{Editor}/ApiStyle/Methods/GetType.js
 */
ApiStyle.prototype.GetType = function(){ return new StyleType(); };

/**
 * Returns the text properties of the current style.
 * @memberof ApiStyle
 * @typeofeditors ["CDE"]
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/ApiStyle/Methods/GetTextPr.js
 */
ApiStyle.prototype.GetTextPr = function(){ return new ApiTextPr(); };

/**
 * Returns the paragraph properties of the current style.
 * @memberof ApiStyle
 * @typeofeditors ["CDE"]
 * @returns {ApiParaPr}
 * @see office-js-api/Examples/{Editor}/ApiStyle/Methods/GetParaPr.js
 */
ApiStyle.prototype.GetParaPr = function(){ return new ApiParaPr(); };

/**
 * Returns the table properties of the current style.
 * @memberof ApiStyle
 * @typeofeditors ["CDE"]
 * @returns {ApiTablePr} If the type of this style is not a <code>"table"</code> then it will return
 *     <code>null</code>.
 * @see office-js-api/Examples/{Editor}/ApiStyle/Methods/GetTablePr.js
 */
ApiStyle.prototype.GetTablePr = function(){ return new ApiTablePr(); };

/**
 * Returns the table row properties of the current style.
 * @memberof ApiStyle
 * @typeofeditors ["CDE"]
 * @returns {ApiTableRowPr} If the type of this style is not a <code>"table"</code> then it will return
 *     <code>null</code>.
 * @see office-js-api/Examples/{Editor}/ApiStyle/Methods/GetTableRowPr.js
 */
ApiStyle.prototype.GetTableRowPr = function(){ return new ApiTableRowPr(); };

/**
 * Returns the table cell properties of the current style.
 * @memberof ApiStyle
 * @typeofeditors ["CDE"]
 * @returns {ApiTableCellPr}
 * @see office-js-api/Examples/{Editor}/ApiStyle/Methods/GetTableCellPr.js
 */
ApiStyle.prototype.GetTableCellPr = function(){ return new ApiTableCellPr(); };

/**
 * Specifies the reference to the parent style which this style inherits from in the style hierarchy.
 * @memberof ApiStyle
 * @typeofeditors ["CDE"]
 * @param {ApiStyle} oStyle - The parent style which the style inherits properties from.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiStyle/Methods/SetBasedOn.js
 */
ApiStyle.prototype.SetBasedOn = function(oStyle){ return true; };

/**
 * Returns a set of formatting properties which will be conditionally applied to the parts of a table that match the 
 * requirement specified in the sType parameter.
 * @memberof ApiStyle
 * @typeofeditors ["CDE"]
 * @param {TableStyleOverrideType} [sType="wholeTable"] - The table part which the formatting properties must be applied to.
 * @returns {ApiTableStylePr}
 * @see office-js-api/Examples/{Editor}/ApiStyle/Methods/GetConditionalTableStyle.js
 */
ApiStyle.prototype.GetConditionalTableStyle = function(sType){ return new ApiTableStylePr(); };

/**
 * Converts the ApiStyle object into the JSON object.
 * @memberof ApiStyle
 * @typeofeditors ["CDE"]
 * @param {boolean} bWriteNumberings - Specifies if the used numberings will be written to the JSON object or not.
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiStyle/Methods/ToJSON.js
 */
ApiStyle.prototype.ToJSON = function(bWriteNumberings){ return new JSON(); };

/**
 * Returns a type of the ApiTextPr class.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"textPr"}
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/GetClassType.js
 */
ApiTextPr.prototype.GetClassType = function(){ return ""; };

/**
 * The text style base method.
 * <note>This method is not used by itself, as it only forms the basis for the {@link ApiRun#SetStyle} method which sets
 * the selected or created style to the text.</note>
 * @memberof ApiTextPr
 * @typeofeditors ["CDE"]
 * @param {ApiStyle} oStyle - The style which must be applied to the text character.
 * @returns {ApiTextPr} - this text properties.
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/SetStyle.js
 */
ApiTextPr.prototype.SetStyle = function(oStyle){ return new ApiTextPr(); };

/**
 * Gets the style of the current text properties.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE"]
 * @returns {ApiStyle} - The used style.
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/GetStyle.js
 */
ApiTextPr.prototype.GetStyle = function(){ return new ApiStyle(); };

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
 * Sets the text color to the current text run in the RGB format.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE"]
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @param {boolean} [isAuto=false] - If this parameter is set to "true", then r,g,b parameters will be ignored.
 * @returns {ApiTextPr} - this text properties.
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/SetColor.js
 */
ApiTextPr.prototype.SetColor = function(r, g, b, isAuto){ return new ApiTextPr(); };

/**
 * Gets the RGB color from the current text properties.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE"]
 * @returns {ApiRGBColor}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/GetColor.js
 */
ApiTextPr.prototype.GetColor = function(){ return new ApiRGBColor(); };

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
 * Gets the vertical alignment type from the current text properties.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE"]
 * @returns {string}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/GetVertAlign.js
 */
ApiTextPr.prototype.GetVertAlign = function(){ return ""; };

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
 * Specifies an amount by which text is raised or lowered for this run in relation to the default
 * baseline of the surrounding non-positioned text.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE"]
 * @param {hps} nPosition - Specifies a positive (raised text) or negative (lowered text)
 * measurement in half-points (1/144 of an inch).
 * @returns {ApiTextPr} - this text properties.
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/SetPosition.js
 */
ApiTextPr.prototype.SetPosition = function(nPosition){ return new ApiTextPr(); };

/**
 * Gets the text position from the current text properties measured in half-points (1/144 of an inch).
 * @memberof ApiTextPr
 * @typeofeditors ["CDE"]
 * @returns {hps}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/GetPosition.js
 */
ApiTextPr.prototype.GetPosition = function(){ return new hps(); };

/**
 * Specifies the languages which will be used to check spelling and grammar (if requested) when processing
 * the contents of the text run.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE"]
 * @param {string} sLangId - The possible value for this parameter is a language identifier as defined by
 * RFC 4646/BCP 47. Example: "en-CA".
 * @returns {ApiTextPr} - this text properties.
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/SetLanguage.js
 */
ApiTextPr.prototype.SetLanguage = function(sLangId){ return new ApiTextPr(); };

/**
 * Gets the language from the current text properties.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE"]
 * @returns {string}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/GetLanguage.js
 */
ApiTextPr.prototype.GetLanguage = function(){ return ""; };

/**
 * Specifies the shading applied to the contents of the current text run.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE"]
 * @param {ShdType} sType - The shading type applied to the contents of the current text run.
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @returns {ApiTextPr} - this text properties.
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/SetShd.js
 */
ApiTextPr.prototype.SetShd = function(sType, r, g, b){ return new ApiTextPr(); };

/**
 * Gets the text shading from the current text properties.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE"]
 * @returns {ApiRGBColor}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/GetShd.js
 */
ApiTextPr.prototype.GetShd = function(){ return new ApiRGBColor(); };

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
 * Converts the ApiTextPr object into the JSON object.
 * @memberof ApiTextPr
 * @typeofeditors ["CDE"]
 * @param {boolean} bWriteStyles - Specifies if the used styles will be written to the JSON object or not.
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiTextPr/Methods/ToJSON.js
 */
ApiTextPr.prototype.ToJSON = function(bWriteStyles){ return new JSON(); };

/**
 * Returns a type of the ApiParaPr class.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"paraPr"}
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/GetClassType.js
 */
ApiParaPr.prototype.GetClassType = function(){ return ""; };

/**
 * The paragraph style base method.
 * <note>This method is not used by itself, as it only forms the basis for the {@link ApiParagraph#SetStyle} method which sets the selected or created style for the paragraph.</note>
 * @memberof ApiParaPr
 * @typeofeditors ["CDE"]
 * @param {ApiStyle} oStyle - The style of the paragraph to be set.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/SetStyle.js
 */
ApiParaPr.prototype.SetStyle = function(oStyle){ return true; };

/**
 * Returns the paragraph style method.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE"]
 * @returns {ApiStyle} - The style of the paragraph.
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/GetStyle.js
 */
ApiParaPr.prototype.GetStyle = function(){ return new ApiStyle(); };

/**
 * Specifies that any space before or after this paragraph set using the 
 * {@link ApiParaPr#SetSpacingBefore} or {@link ApiParaPr#SetSpacingAfter} spacing element, should not be applied when the preceding and 
 * following paragraphs are of the same paragraph style, affecting the top and bottom spacing respectively.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE"]
 * @param {boolean} isContextualSpacing - The true value will enable the paragraph contextual spacing.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/SetContextualSpacing.js
 */
ApiParaPr.prototype.SetContextualSpacing = function(isContextualSpacing){ return true; };

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
 * Specifies that when rendering the document using a page view, all lines of the current paragraph are maintained on a single page whenever possible.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE"]
 * @param {boolean} isKeepLines - The true value enables the option to keep lines of the paragraph on a single page.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/SetKeepLines.js
 */
ApiParaPr.prototype.SetKeepLines = function(isKeepLines){ return true; };

/**
 * Specifies that when rendering the document using a paginated view, the contents of the current paragraph are at least
 * partly rendered on the same page as the following paragraph whenever possible.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE"]
 * @param {boolean} isKeepNext - The true value enables the option to keep lines of the paragraph on the same
 * page as the following paragraph.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/SetKeepNext.js
 */
ApiParaPr.prototype.SetKeepNext = function(isKeepNext){ return true; };

/**
 * Specifies that when rendering the document using a paginated view, the contents of the current paragraph are rendered at
 * the beginning of a new page in the document.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE"]
 * @param {boolean} isPageBreakBefore - The true value enables the option to render the contents of the paragraph
 * at the beginning of a new page in the document.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/SetPageBreakBefore.js
 */
ApiParaPr.prototype.SetPageBreakBefore = function(isPageBreakBefore){ return true; };

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
 * Specifies the shading applied to the contents of the paragraph.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE"]
 * @param {ShdType} sType - The shading type which will be applied to the contents of the current paragraph.
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @param {boolean} [isAuto=false] - The true value disables paragraph contents shading.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/SetShd.js
 */
ApiParaPr.prototype.SetShd = function(sType, r, g, b, isAuto){ return true; };

/**
 * Returns the shading applied to the contents of the paragraph.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE"]
 * @returns {ApiRGBColor}
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/GetShd.js
 */
ApiParaPr.prototype.GetShd = function(){ return new ApiRGBColor(); };

/**
 * Specifies the border which will be displayed below a set of paragraphs which have the same paragraph border settings.
 * <note>The paragraphs of the same style going one by one are considered as a single block, so the border is added
 * to the whole block rather than to every paragraph in this block.</note>
 * @memberof ApiParaPr
 * @typeofeditors ["CDE"]
 * @param {BorderType} sType - The border style.
 * @param {pt_8} nSize - The width of the current bottom border measured in eighths of a point.
 * @param {pt} nSpace - The spacing offset below the paragraph measured in points used to place this border.
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/SetBottomBorder.js
 */
ApiParaPr.prototype.SetBottomBorder = function(sType, nSize, nSpace, r, g, b){ return true; };

/**
 * Specifies the border which will be displayed at the left side of the page around the specified paragraph.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE"]
 * @param {BorderType} sType - The border style.
 * @param {pt_8} nSize - The width of the current left border measured in eighths of a point.
 * @param {pt} nSpace - The spacing offset to the left of the paragraph measured in points used to place this border.
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/SetLeftBorder.js
 */
ApiParaPr.prototype.SetLeftBorder = function(sType, nSize, nSpace, r, g, b){ return true; };

/**
 * Specifies the border which will be displayed at the right side of the page around the specified paragraph.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE"]
 * @param {BorderType} sType - The border style.
 * @param {pt_8} nSize - The width of the current right border measured in eighths of a point.
 * @param {pt} nSpace - The spacing offset to the right of the paragraph measured in points used to place this border.
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/SetRightBorder.js
 */
ApiParaPr.prototype.SetRightBorder = function(sType, nSize, nSpace, r, g, b){ return true; };

/**
 * Specifies the border which will be displayed above a set of paragraphs which have the same set of paragraph border settings.
 * <note>The paragraphs of the same style going one by one are considered as a single block, so the border is added to the whole block rather than to every paragraph in this block.</note>
 * @memberof ApiParaPr
 * @typeofeditors ["CDE"]
 * @param {BorderType} sType - The border style.
 * @param {pt_8} nSize - The width of the current top border measured in eighths of a point.
 * @param {pt} nSpace - The spacing offset above the paragraph measured in points used to place this border.
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/SetTopBorder.js
 */
ApiParaPr.prototype.SetTopBorder = function(sType, nSize, nSpace, r, g, b){ return true; };

/**
 * Specifies the border which will be displayed between each paragraph in a set of paragraphs which have the same set of paragraph border settings.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE"]
 * @param {BorderType} sType - The border style.
 * @param {pt_8} nSize - The width of the current border measured in eighths of a point.
 * @param {pt} nSpace - The spacing offset between the paragraphs measured in points used to place this border.
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/SetBetweenBorder.js
 */
ApiParaPr.prototype.SetBetweenBorder = function(sType, nSize, nSpace, r, g, b){ return true; };

/**
 * Specifies whether a single line of the current paragraph will be displayed on a separate page from the remaining content at display time by moving the line onto the following page.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE"]
 * @param {boolean} isWidowControl - The true value means that a single line of the current paragraph will be displayed on a separate page from the remaining content at display time by moving the line onto the following page.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/SetWidowControl.js
 */
ApiParaPr.prototype.SetWidowControl = function(isWidowControl){ return true; };

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
 * Specifies that the current paragraph references a numbering definition instance in the current document.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE"]
 * @param {ApiNumbering} oNumPr - Specifies a numbering definition.
 * @param {number} [nLvl=0] - Specifies a numbering level reference. If the current instance of the ApiParaPr class is direct
 * formatting of a paragraph, then this parameter MUST BE specified. Otherwise, if the current instance of the ApiParaPr class
 * is the part of ApiStyle properties, this parameter will be ignored.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/SetNumPr.js
 */
ApiParaPr.prototype.SetNumPr = function(oNumPr, nLvl){ return true; };

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
 * Converts the ApiParaPr object into the JSON object.
 * @memberof ApiParaPr
 * @typeofeditors ["CDE"]
 * @param {boolean} bWriteStyles - Specifies if the used styles will be written to the JSON object or not.
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiParaPr/Methods/ToJSON.js
 */
ApiParaPr.prototype.ToJSON = function(bWriteStyles){ return new JSON(); };

/**
 * Returns a type of the ApiNumbering class.
 * @memberof ApiNumbering
 * @typeofeditors ["CDE"]
 * @returns {"numbering"}
 * @see office-js-api/Examples/{Editor}/ApiNumbering/Methods/GetClassType.js
 */
ApiNumbering.prototype.GetClassType = function(){ return ""; };

/**
 * Returns the specified level of the current numbering.
 * @memberof ApiNumbering
 * @typeofeditors ["CDE"]
 * @param {number} nLevel - The numbering level index. This value MUST BE from 0 to 8.
 * @returns {ApiNumberingLevel}
 * @see office-js-api/Examples/{Editor}/ApiNumbering/Methods/GetLevel.js
 */
ApiNumbering.prototype.GetLevel = function(nLevel){ return new ApiNumberingLevel(); };

/**
 * Converts the ApiNumbering object into the JSON object.
 * @memberof ApiNumbering
 * @typeofeditors ["CDE"]
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiNumbering/Methods/ToJSON.js
 */
ApiNumbering.prototype.ToJSON = function(){ return new JSON(); };

/**
 * Returns a type of the ApiNumberingLevel class.
 * @memberof ApiNumberingLevel
 * @typeofeditors ["CDE"]
 * @returns {"numberingLevel"}
 * @see office-js-api/Examples/{Editor}/ApiNumberingLevel/Methods/GetClassType.js
 */
ApiNumberingLevel.prototype.GetClassType = function(){ return ""; };

/**
 * Returns the numbering definition.
 * @memberof ApiNumberingLevel
 * @typeofeditors ["CDE"]
 * @returns {ApiNumbering}
 * @see office-js-api/Examples/{Editor}/ApiNumberingLevel/Methods/GetNumbering.js
 */
ApiNumberingLevel.prototype.GetNumbering = function(){ return new ApiNumbering(); };

/**
 * Returns the level index.
 * @memberof ApiNumberingLevel
 * @typeofeditors ["CDE"]
 * @returns {number}
 * @see office-js-api/Examples/{Editor}/ApiNumberingLevel/Methods/GetLevelIndex.js
 */
ApiNumberingLevel.prototype.GetLevelIndex = function(){ return 0; };

/**
 * Specifies the text properties which will be applied to the text in the current numbering level itself, not to the text in the subsequent paragraph.
 * <note>To change the text style of the paragraph, a style must be applied to it using the {@link ApiRun#SetStyle} method.</note>
 * @memberof ApiNumberingLevel
 * @typeofeditors ["CDE"]
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/ApiNumberingLevel/Methods/GetTextPr.js
 */
ApiNumberingLevel.prototype.GetTextPr = function(){ return new ApiTextPr(); };

/**
 * Returns the paragraph properties which are applied to any numbered paragraph that references the given numbering definition and numbering level.
 * @memberof ApiNumberingLevel
 * @typeofeditors ["CDE"]
 * @returns {ApiParaPr}
 * @see office-js-api/Examples/{Editor}/ApiNumberingLevel/Methods/GetParaPr.js
 */
ApiNumberingLevel.prototype.GetParaPr = function(){ return new ApiParaPr(); };

/**
 * Sets one of the existing predefined numbering templates.
 * @memberof ApiNumberingLevel
 * @typeofeditors ["CDE"]
 * @param {("none" | "bullet" | "1)" | "1." | "I." | "A." | "a)" | "a." | "i." )} sType - The predefined numbering template.
 * @param {string} [sSymbol=""] - The symbol used for the list numbering. This parameter has the meaning only if the predefined numbering template is "bullet".
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiNumberingLevel/Methods/SetTemplateType.js
 */
ApiNumberingLevel.prototype.SetTemplateType = function(sType, sSymbol){ return true; };

/**
 * Sets your own customized numbering type.
 * @memberof ApiNumberingLevel
 * @typeofeditors ["CDE"]
 * @param {("none" | "bullet" | "decimal" | "lowerRoman" | "upperRoman" | "lowerLetter" | "upperLetter" |
 *     "decimalZero")} sType - The custom numbering type used for the current numbering definition.
 * @param {string} sTextFormatString - Any text in this parameter will be taken as literal text to be repeated in each instance of this numbering level, except for any use of the percent symbol (%) followed by a number, which will be used to indicate the one-based index of the number to be used at this level. Any number of a level higher than this level will be ignored.
 * @param {("left" | "right" | "center")} sAlign - Type of justification applied to the text run in the current numbering level.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiNumberingLevel/Methods/SetCustomType.js
 */
ApiNumberingLevel.prototype.SetCustomType = function(sType, sTextFormatString, sAlign){ return true; };

/**
 * Specifies a one-based index which determines when a numbering level should restart to its starting value. A numbering level restarts when an instance of the specified numbering level which is higher (earlier than this level) is used in the given document contents. By default this value is true.
 * @memberof ApiNumberingLevel
 * @typeofeditors ["CDE"]
 * @param {boolean} isRestart - The true value means that a numbering level will be restarted to its starting value.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiNumberingLevel/Methods/SetRestart.js
 */
ApiNumberingLevel.prototype.SetRestart = function(isRestart){ return true; };

/**
 * Specifies the starting value for the numbering used by the parent numbering level within a given numbering level definition. By default this value is 1.
 * @memberof ApiNumberingLevel
 * @typeofeditors ["CDE"]
 * @param {number} nStart - The starting value for the numbering used by the parent numbering level.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiNumberingLevel/Methods/SetStart.js
 */
ApiNumberingLevel.prototype.SetStart = function(nStart){ return true; };

/**
 * Specifies the content which will be added between the given numbering level text and the text of every numbered paragraph which references that numbering level. By default this value is "tab".
 * @memberof ApiNumberingLevel
 * @typeofeditors ["CDE"]
 * @param {("space" | "tab" | "none")} sType - The content added between the numbering level text and the text in the numbered paragraph.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiNumberingLevel/Methods/SetSuff.js
 */
ApiNumberingLevel.prototype.SetSuff = function(sType){ return true; };

/**
 * Links the specified paragraph style with the current numbering level.
 * @memberof ApiNumberingLevel
 * @typeofeditors ["CDE"]
 * @param {ApiStyle} oStyle - The paragraph style.
 * @returns {boolean}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiNumberingLevel/Methods/LinkWithStyle.js
 */
ApiNumberingLevel.prototype.LinkWithStyle = function(oStyle){ return true; };

/**
 * Returns a type of the ApiTablePr class.
 * @memberof ApiTablePr
 * @typeofeditors ["CDE"]
 * @returns {"tablePr"}
 * @see office-js-api/Examples/{Editor}/ApiTablePr/Methods/GetClassType.js
 */
ApiTablePr.prototype.GetClassType = function(){ return ""; };

/**
 * Specifies a number of columns which will comprise each table column band for this table style.
 * @memberof ApiTablePr
 * @typeofeditors ["CDE"]
 * @param {number} nCount - The number of columns measured in positive integers.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTablePr/Methods/SetStyleColBandSize.js
 */
ApiTablePr.prototype.SetStyleColBandSize = function(nCount){ return true; };

/**
 * Specifies a number of rows which will comprise each table row band for this table style.
 * @memberof ApiTablePr
 * @typeofeditors ["CDE"]
 * @param {number} nCount - The number of rows measured in positive integers.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTablePr/Methods/SetStyleRowBandSize.js
 */
ApiTablePr.prototype.SetStyleRowBandSize = function(nCount){ return true; };

/**
 * Specifies the alignment of the current table with respect to the text margins in the current section.
 * @memberof ApiTablePr
 * @typeofeditors ["CDE"]
 * @param {("left" | "right" | "center")} sJcType - The alignment type used for the current table placement.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTablePr/Methods/SetJc.js
 */
ApiTablePr.prototype.SetJc = function(sJcType){ return true; };

/**
 * Specifies the shading which is applied to the extents of the current table.
 * @memberof ApiTablePr
 * @typeofeditors ["CDE"]
 * @param {ShdType} sType - The shading type applied to the extents of the current table.
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @param {boolean} [isAuto=false] - The true value disables the SetShd method use.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTablePr/Methods/SetShd.js
 */
ApiTablePr.prototype.SetShd = function(sType, r, g, b, isAuto){ return true; };

/**
 * Sets the border which will be displayed at the top of the current table.
 * @memberof ApiTablePr
 * @typeofeditors ["CDE"]
 * @param {BorderType} sType - The top border style.
 * @param {pt_8} nSize - The width of the current top border measured in eighths of a point.
 * @param {pt} nSpace - The spacing offset in the top part of the table measured in points used to place this border.
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTablePr/Methods/SetTableBorderTop.js
 */
ApiTablePr.prototype.SetTableBorderTop = function(sType, nSize, nSpace, r, g, b){ return true; };

/**
 * Sets the border which will be displayed at the bottom of the current table.
 * @memberof ApiTablePr
 * @typeofeditors ["CDE"]
 * @param {BorderType} sType - The bottom border style.
 * @param {pt_8} nSize - The width of the current bottom border measured in eighths of a point.
 * @param {pt} nSpace - The spacing offset in the bottom part of the table measured in points used to place this border.
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTablePr/Methods/SetTableBorderBottom.js
 */
ApiTablePr.prototype.SetTableBorderBottom = function(sType, nSize, nSpace, r, g, b){ return true; };

/**
 * Sets the border which will be displayed on the left of the current table.
 * @memberof ApiTablePr
 * @typeofeditors ["CDE"]
 * @param {BorderType} sType - The left border style.
 * @param {pt_8} nSize - The width of the current left border measured in eighths of a point.
 * @param {pt} nSpace - The spacing offset in the left part of the table measured in points used to place this border.
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTablePr/Methods/SetTableBorderLeft.js
 */
ApiTablePr.prototype.SetTableBorderLeft = function(sType, nSize, nSpace, r, g, b){ return true; };

/**
 * Sets the border which will be displayed on the right of the current table.
 * @memberof ApiTablePr
 * @typeofeditors ["CDE"]
 * @param {BorderType} sType - The right border style.
 * @param {pt_8} nSize - The width of the current right border measured in eighths of a point.
 * @param {pt} nSpace - The spacing offset in the right part of the table measured in points used to place this border.
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTablePr/Methods/SetTableBorderRight.js
 */
ApiTablePr.prototype.SetTableBorderRight = function(sType, nSize, nSpace, r, g, b){ return true; };

/**
 * Specifies the border which will be displayed on all horizontal table cell borders which are not on the outmost edge
 * of the parent table (all horizontal borders which are not the topmost or bottommost borders).
 * @memberof ApiTablePr
 * @typeofeditors ["CDE"]
 * @param {BorderType} sType - The horizontal table cell border style.
 * @param {pt_8} nSize - The width of the current border measured in eighths of a point.
 * @param {pt} nSpace - The spacing offset in the horizontal table cells of the table measured in points used to place this border.
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTablePr/Methods/SetTableBorderInsideH.js
 */
ApiTablePr.prototype.SetTableBorderInsideH = function(sType, nSize, nSpace, r, g, b){ return true; };

/**
 * Specifies the border which will be displayed on all vertical table cell borders which are not on the outmost edge
 * of the parent table (all vertical borders which are not the leftmost or rightmost borders).
 * @memberof ApiTablePr
 * @typeofeditors ["CDE"]
 * @param {BorderType} sType - The vertical table cell border style.
 * @param {pt_8} nSize - The width of the current border measured in eighths of a point.
 * @param {pt} nSpace - The spacing offset in the vertical table cells of the table measured in points used to place this border.
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTablePr/Methods/SetTableBorderInsideV.js
 */
ApiTablePr.prototype.SetTableBorderInsideV = function(sType, nSize, nSpace, r, g, b){ return true; };

/**
 * Specifies a border which will be displayed on all table cell borders.
 * @memberof ApiTablePr
 * @typeofeditors ["CDE"]
 * @param {BorderType} sType - The border style.
 * @param {pt_8} nSize - The width of the current border measured in eighths of a point.
 * @param {pt} nSpace - The spacing offset in the table cells measured in points used to place this border.
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @returns {boolean}
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiTablePr/Methods/SetTableBorderAll.js
 */
ApiTablePr.prototype.SetTableBorderAll = function(sType, nSize, nSpace, r, g, b){ return true; };

/**
 * Specifies an amount of space which will be left between the bottom extent of the cell contents and the border
 * of all table cells within the parent table (or table row).
 * @memberof ApiTablePr
 * @typeofeditors ["CDE"]
 * @param {twips} nValue - The value for the amount of space below the bottom extent of the cell measured in
 * twentieths of a point (1/1440 of an inch).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTablePr/Methods/SetTableCellMarginBottom.js
 */
ApiTablePr.prototype.SetTableCellMarginBottom = function(nValue){ return true; };

/**
 * Specifies an amount of space which will be left between the left extent of the cell contents and the left
 * border of all table cells within the parent table (or table row).
 * @memberof ApiTablePr
 * @typeofeditors ["CDE"]
 * @param {twips} nValue - The value for the amount of space to the left extent of the cell measured in twentieths of a point (1/1440 of an inch).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTablePr/Methods/SetTableCellMarginLeft.js
 */
ApiTablePr.prototype.SetTableCellMarginLeft = function(nValue){ return true; };

/**
 * Specifies an amount of space which will be left between the right extent of the cell contents and the right
 * border of all table cells within the parent table (or table row).
 * @memberof ApiTablePr
 * @typeofeditors ["CDE"]
 * @param {twips} nValue - The value for the amount of space to the right extent of the cell measured in twentieths of a point (1/1440 of an inch).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTablePr/Methods/SetTableCellMarginRight.js
 */
ApiTablePr.prototype.SetTableCellMarginRight = function(nValue){ return true; };

/**
 * Specifies an amount of space which will be left between the top extent of the cell contents and the top border
 * of all table cells within the parent table (or table row).
 * @memberof ApiTablePr
 * @typeofeditors ["CDE"]
 * @param {twips} nValue - The value for the amount of space above the top extent of the cell measured in twentieths of a point (1/1440 of an inch).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTablePr/Methods/SetTableCellMarginTop.js
 */
ApiTablePr.prototype.SetTableCellMarginTop = function(nValue){ return true; };

/**
 * Specifies the default table cell spacing (the spacing between adjacent cells and the edges of the table).
 * @memberof ApiTablePr
 * @typeofeditors ["CDE"]
 * @param {?twips} nValue - Spacing value measured in twentieths of a point (1/1440 of an inch). <code>"Null"</code> means that no spacing will be applied.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTablePr/Methods/SetCellSpacing.js
 */
ApiTablePr.prototype.SetCellSpacing = function(nValue){ return true; };

/**
 * Specifies the indentation which will be added before the leading edge of the current table in the document
 * (the left edge in the left-to-right table, and the right edge in the right-to-left table).
 * @memberof ApiTablePr
 * @typeofeditors ["CDE"]
 * @param {twips} nValue - The indentation value measured in twentieths of a point (1/1440 of an inch).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTablePr/Methods/SetTableInd.js
 */
ApiTablePr.prototype.SetTableInd = function(nValue){ return true; };

/**
 * Sets the preferred width to the current table.
 * <note>Tables are created with the {@link ApiTable#SetWidth} method properties set by default, which always override the {@link ApiTablePr#SetWidth} method properties. That is why there is no use to try and apply {@link ApiTablePr#SetWidth}. We recommend you to use the  {@link ApiTablePr#SetWidth} method instead.</note>
 * @memberof ApiTablePr
 * @typeofeditors ["CDE"]
 * @param {TableWidth} sType - Type of the width value from one of the available width values types.
 * @param {number} [nValue] - The table width value measured in positive integers.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTablePr/Methods/SetWidth.js
 */
ApiTablePr.prototype.SetWidth = function(sType, nValue){ return true; };

/**
 * Specifies the algorithm which will be used to lay out the contents of the current table within the document.
 * @memberof ApiTablePr
 * @typeofeditors ["CDE"]
 * @param {("autofit" | "fixed")} sType - The type of the table layout in the document.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTablePr/Methods/SetTableLayout.js
 */
ApiTablePr.prototype.SetTableLayout = function(sType){ return true; };

/**
 * Sets the table title (caption).
 * @memberof ApiTablePr
 * @typeofeditors ["CDE"]
 * @param {string} sTitle - The table title to be set.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTablePr/Methods/SetTableTitle.js
 */
ApiTablePr.prototype.SetTableTitle = function(sTitle){ return true; };

/**
 * Returns the table title (caption).
 * @memberof ApiTablePr
 * @typeofeditors ["CDE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiTablePr/Methods/GetTableTitle.js
 */
ApiTablePr.prototype.GetTableTitle = function(){ return ""; };

/**
 * Sets the table description.
 * @memberof ApiTablePr
 * @typeofeditors ["CDE"]
 * @param {string} sDescr - The table description to be set.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTablePr/Methods/SetTableDescription.js
 */
ApiTablePr.prototype.SetTableDescription = function(sDescr){ return true; };

/**
 * Returns the table description.
 * @memberof ApiTablePr
 * @typeofeditors ["CDE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiTablePr/Methods/GetTableDescription.js
 */
ApiTablePr.prototype.GetTableDescription = function(){ return ""; };

/**
 * Converts the ApiTablePr object into the JSON object.
 * @memberof ApiTablePr
 * @typeofeditors ["CDE"]
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiTablePr/Methods/ToJSON.js
 */
ApiTablePr.prototype.ToJSON = function(){ return new JSON(); };

/**
 * Returns a type of the ApiTableRowPr class.
 * @memberof ApiTableRowPr
 * @typeofeditors ["CDE"]
 * @returns {"tableRowPr"}
 * @see office-js-api/Examples/{Editor}/ApiTableRowPr/Methods/GetClassType.js
 */
ApiTableRowPr.prototype.GetClassType = function(){ return ""; };

/**
 * Sets the height to the current table row within the current table.
 * @memberof ApiTableRowPr
 * @typeofeditors ["CDE"]
 * @param {("auto" | "atLeast")} sHRule - The rule to apply the height value to the current table row or ignore it. Use the <code>"atLeast"</code> value to enable the <code>SetHeight</code> method use.
 * @param {twips} [nValue] - The height for the current table row measured in twentieths of a point (1/1440 of an inch). This value will be ignored if <code>sHRule="auto"<code>.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTableRowPr/Methods/SetHeight.js
 */
ApiTableRowPr.prototype.SetHeight = function(sHRule, nValue){ return true; };

/**
 * Specifies that the current table row will be repeated at the top of each new page 
 * wherever this table is displayed. This gives this table row the behavior of a 'header' row on 
 * each of these pages. This element can be applied to any number of rows at the top of the 
 * table structure in order to generate multi-row table headers.
 * @memberof ApiTableRowPr
 * @typeofeditors ["CDE"]
 * @param {boolean} isHeader - The true value means that the current table row will be repeated at the top of each new page.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTableRowPr/Methods/SetTableHeader.js
 */
ApiTableRowPr.prototype.SetTableHeader = function(isHeader){ return true; };

/**
 * Converts the ApiTableRowPr object into the JSON object.
 * @memberof ApiTableRowPr
 * @typeofeditors ["CDE"]
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiTableRowPr/Methods/ToJSON.js
 */
ApiTableRowPr.prototype.ToJSON = function(){ return new JSON(); };

/**
 * Returns a type of the ApiTableCellPr class.
 * @memberof ApiTableCellPr
 * @typeofeditors ["CDE"]
 * @returns {"tableCellPr"}
 * @see office-js-api/Examples/{Editor}/ApiTableCellPr/Methods/GetClassType.js
 */
ApiTableCellPr.prototype.GetClassType = function(){ return ""; };

/**
 * Specifies the shading applied to the contents of the table cell.
 * @memberof ApiTableCellPr
 * @typeofeditors ["CDE"]
 * @param {ShdType} sType - The shading type which will be applied to the contents of the current table cell.
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @param {boolean} [isAuto=false] - The true value disables the table cell contents shading.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTableCellPr/Methods/SetShd.js
 */
ApiTableCellPr.prototype.SetShd = function(sType, r, g, b, isAuto){ return true; };

/**
 * Specifies an amount of space which will be left between the bottom extent of the cell contents and the border
 * of a specific table cell within a table.
 * @memberof ApiTableCellPr
 * @typeofeditors ["CDE"]
 * @param {?twips} nValue - The value for the amount of space below the bottom extent of the cell measured in twentieths
 * of a point (1/1440 of an inch). If this value is <code>null</code>, then default table cell bottom margin will be used, otherwise
 * the table cell bottom margin will be overridden with the specified value for the current cell.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTableCellPr/Methods/SetCellMarginBottom.js
 */
ApiTableCellPr.prototype.SetCellMarginBottom = function(nValue){ return true; };

/**
 * Specifies an amount of space which will be left between the left extent of the cell contents and 
 * the border of a specific table cell within a table.
 * @memberof ApiTableCellPr
 * @typeofeditors ["CDE"]
 * @param {?twips} nValue - The value for the amount of space to the left extent of the cell measured in twentieths
 * of a point (1/1440 of an inch). If this value is <code>null</code>, then default table cell left margin will be used, otherwise
 * the table cell left margin will be overridden with the specified value for the current cell.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTableCellPr/Methods/SetCellMarginLeft.js
 */
ApiTableCellPr.prototype.SetCellMarginLeft = function(nValue){ return true; };

/**
 * Specifies an amount of space which will be left between the right extent of the cell contents and the border of a specific table cell within a table.
 * @memberof ApiTableCellPr
 * @typeofeditors ["CDE"]
 * @param {?twips} nValue - The value for the amount of space to the right extent of the cell measured in twentieths
 * of a point (1/1440 of an inch). If this value is <code>null</code>, then default table cell right margin will be used, otherwise
 * the table cell right margin will be overridden with the specified value for the current cell.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTableCellPr/Methods/SetCellMarginRight.js
 */
ApiTableCellPr.prototype.SetCellMarginRight = function(nValue){ return true; };

/**
 * Specifies an amount of space which will be left between the upper extent of the cell contents
 * and the border of a specific table cell within a table.
 * @memberof ApiTableCellPr
 * @typeofeditors ["CDE"]
 * @param {?twips} nValue - The value for the amount of space above the upper extent of the cell measured in twentieths
 * of a point (1/1440 of an inch). If this value is <code>null</code>, then default table cell top margin will be used, otherwise
 * the table cell top margin will be overridden with the specified value for the current cell.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTableCellPr/Methods/SetCellMarginTop.js
 */
ApiTableCellPr.prototype.SetCellMarginTop = function(nValue){ return true; };

/**
 * Sets the border which will be displayed at the bottom of the current table cell.
 * @memberof ApiTableCellPr
 * @typeofeditors ["CDE"]
 * @param {BorderType} sType - The cell bottom border style.
 * @param {pt_8} nSize - The width of the current cell bottom border measured in eighths of a point.
 * @param {pt} nSpace - The spacing offset in the bottom part of the table cell measured in points used to place this border.
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTableCellPr/Methods/SetCellBorderBottom.js
 */
ApiTableCellPr.prototype.SetCellBorderBottom = function(sType, nSize, nSpace, r, g, b){ return true; };

/**
 * Sets the border which will be displayed to the left of the current table cell.
 * @memberof ApiTableCellPr
 * @typeofeditors ["CDE"]
 * @param {BorderType} sType - The cell left border style.
 * @param {pt_8} nSize - The width of the current cell left border measured in eighths of a point.
 * @param {pt} nSpace - The spacing offset in the left part of the table cell measured in points used to place this border.
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTableCellPr/Methods/SetCellBorderLeft.js
 */
ApiTableCellPr.prototype.SetCellBorderLeft = function(sType, nSize, nSpace, r, g, b){ return true; };

/**
 * Sets the border which will be displayed to the right of the current table cell.
 * @memberof ApiTableCellPr
 * @typeofeditors ["CDE"]
 * @param {BorderType} sType - The cell right border style.
 * @param {pt_8} nSize - The width of the current cell right border measured in eighths of a point.
 * @param {pt} nSpace - The spacing offset in the right part of the table cell measured in points used to place this border.
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTableCellPr/Methods/SetCellBorderRight.js
 */
ApiTableCellPr.prototype.SetCellBorderRight = function(sType, nSize, nSpace, r, g, b){ return true; };

/**
 * Sets the border which will be displayed at the top of the current table cell.
 * @memberof ApiTableCellPr
 * @typeofeditors ["CDE"]
 * @param {BorderType} sType - The cell top border style.
 * @param {pt_8} nSize - The width of the current cell top border measured in eighths of a point.
 * @param {pt} nSpace - The spacing offset in the top part of the table cell measured in points used to place this border.
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTableCellPr/Methods/SetCellBorderTop.js
 */
ApiTableCellPr.prototype.SetCellBorderTop = function(sType, nSize, nSpace, r, g, b){ return true; };

/**
 * Sets the preferred width to the current table cell.
 * @memberof ApiTableCellPr
 * @typeofeditors ["CDE"]
 * @param {TableWidth} sType - Type of the width value from one of the available width values types.
 * @param {number} [nValue] - The table cell width value measured in positive integers.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTableCellPr/Methods/SetWidth.js
 */
ApiTableCellPr.prototype.SetWidth = function(sType, nValue){ return true; };

/**
 * Specifies the vertical alignment for the text contents within the current table cell.
 * @memberof ApiTableCellPr
 * @typeofeditors ["CDE"]
 * @param {("top" | "center" | "bottom")} sType - The available types of the vertical alignment for the text contents of the current table cell.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTableCellPr/Methods/SetVerticalAlign.js
 */
ApiTableCellPr.prototype.SetVerticalAlign = function(sType){ return true; };

/**
 * Specifies the direction of the text flow for this table cell.
 * @memberof ApiTableCellPr
 * @typeofeditors ["CDE"]
 * @param {("lrtb" | "tbrl" | "btlr")} sType - The available types of the text direction in the table cell: <code>"lrtb"</code>
 * - text direction left-to-right moving from top to bottom, <code>"tbrl"</code> - text direction top-to-bottom moving from right
 * to left, <code>"btlr"</code> - text direction bottom-to-top moving from left to right.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTableCellPr/Methods/SetTextDirection.js
 */
ApiTableCellPr.prototype.SetTextDirection = function(sType){ return true; };

/**
 * Specifies how the current table cell is laid out when the parent table is displayed in a document. This setting
 * only affects the behavior of the cell when the {@link ApiTablePr#SetTableLayout} table layout for this table is set to use the <code>"autofit"</code> algorithm.
 * @memberof ApiTableCellPr
 * @typeofeditors ["CDE"]
 * @param {boolean} isNoWrap - The true value means that the current table cell will not be wrapped in the parent table.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTableCellPr/Methods/SetNoWrap.js
 */
ApiTableCellPr.prototype.SetNoWrap = function(isNoWrap){ return true; };

/**
 * Converts the ApiTableCellPr object into the JSON object.
 * @memberof ApiTableCellPr
 * @typeofeditors ["CDE"]
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiTableCellPr/Methods/ToJSON.js
 */
ApiTableCellPr.prototype.ToJSON = function(){ return new JSON(); };

/**
 * Returns a type of the ApiTableStylePr class.
 * @memberof ApiTableStylePr
 * @typeofeditors ["CDE"]
 * @returns {"tableStylePr"}
 * @see office-js-api/Examples/{Editor}/ApiTableStylePr/Methods/GetClassType.js
 */
ApiTableStylePr.prototype.GetClassType = function(){ return ""; };

/**
 * Returns a type of the current table conditional style.
 * @memberof ApiTableStylePr
 * @typeofeditors ["CDE"]
 * @returns {TableStyleOverrideType}
 * @see office-js-api/Examples/{Editor}/ApiTableStylePr/Methods/GetType.js
 */
ApiTableStylePr.prototype.GetType = function(){ return new TableStyleOverrideType(); };

/**
 * Returns a set of the text run properties which will be applied to all the text runs within the table which match the conditional formatting type.
 * @memberof ApiTableStylePr
 * @typeofeditors ["CDE"]
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/ApiTableStylePr/Methods/GetTextPr.js
 */
ApiTableStylePr.prototype.GetTextPr = function(){ return new ApiTextPr(); };

/**
 * Returns a set of the paragraph properties which will be applied to all the paragraphs within a table which match the conditional formatting type.
 * @memberof ApiTableStylePr
 * @typeofeditors ["CDE"]
 * @returns {ApiParaPr}
 * @see office-js-api/Examples/{Editor}/ApiTableStylePr/Methods/GetParaPr.js
 */
ApiTableStylePr.prototype.GetParaPr = function(){ return new ApiParaPr(); };

/**
 * Returns a set of the table properties which will be applied to all the regions within a table which match the conditional formatting type.
 * @memberof ApiTableStylePr
 * @typeofeditors ["CDE"]
 * @returns {ApiTablePr}
 * @see office-js-api/Examples/{Editor}/ApiTableStylePr/Methods/GetTablePr.js
 */
ApiTableStylePr.prototype.GetTablePr = function(){ return new ApiTablePr(); };

/**
 * Returns a set of the table row properties which will be applied to all the rows within a table which match the conditional formatting type.
 * @memberof ApiTableStylePr
 * @typeofeditors ["CDE"]
 * @returns {ApiTableRowPr}
 * @see office-js-api/Examples/{Editor}/ApiTableStylePr/Methods/GetTableRowPr.js
 */
ApiTableStylePr.prototype.GetTableRowPr = function(){ return new ApiTableRowPr(); };

/**
 * Returns a set of the table cell properties which will be applied to all the cells within a table which match the conditional formatting type.
 * @memberof ApiTableStylePr
 * @typeofeditors ["CDE"]
 * @returns {ApiTableCellPr}
 * @see office-js-api/Examples/{Editor}/ApiTableStylePr/Methods/GetTableCellPr.js
 */
ApiTableStylePr.prototype.GetTableCellPr = function(){ return new ApiTableCellPr(); };

/**
 * Converts the ApiTableStylePr object into the JSON object.
 * @memberof ApiTableStylePr
 * @typeofeditors ["CDE"]
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiTableStylePr/Methods/ToJSON.js
 */
ApiTableStylePr.prototype.ToJSON = function(){ return new JSON(); };

/**
 * Returns a type of the ApiDrawing class.
 * @memberof ApiDrawing
 * @typeofeditors ["CDE", "CPE"]
 * @returns {"drawing"}
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/GetClassType.js
 */
ApiDrawing.prototype.GetClassType = function(){ return ""; };

/**
 * Returns the drawing inner contents where a paragraph or text runs can be inserted if it exists.
 * @memberof ApiDrawing
 * @typeofeditors ["CDE", "CSE"]
 * @returns {ApiDocumentContent}
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/GetContent.js
 */
ApiDrawing.prototype.GetContent = function(){ return new ApiDocumentContent(); };

/**
 * Sets the size of the object (image, shape, chart) bounding box.
 * @memberof ApiDrawing
 * @typeofeditors ["CDE"]
 * @param {EMU} nWidth - The object width measured in English measure units.
 * @param {EMU} nHeight - The object height measured in English measure units.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/SetSize.js
 */
ApiDrawing.prototype.SetSize = function(nWidth, nHeight){ return true; };

/**
 * Sets the wrapping type of the current object (image, shape, chart). One of the following wrapping style types can be set:
 * <b>"inline"</b> - the object is considered to be a part of the text, like a character, so when the text moves, the object moves as well. In this case the positioning options are inaccessible.
 * If one of the following styles is selected, the object can be moved independently of the text and positioned on the page exactly:
 * <b>"square"</b> - the text wraps the rectangular box that bounds the object.
 * <b>"tight"</b> - the text wraps the actual object edges.
 * <b>"through"</b> - the text wraps around the object edges and fills in the open white space within the object.
 * <b>"topAndBottom"</b> - the text is only above and below the object.
 * <b>"behind"</b> - the text overlaps the object.
 * <b>"inFront"</b> - the object overlaps the text.
 * @memberof ApiDrawing
 * @typeofeditors ["CDE"]
 * @param {"inline" | "square" | "tight" | "through" | "topAndBottom" | "behind" | "inFront"} sType - The wrapping style type available for the object.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/SetWrappingStyle.js
 */
ApiDrawing.prototype.SetWrappingStyle = function(sType){ return true; };

/**
 * Specifies how the floating object will be horizontally aligned.
 * @memberof ApiDrawing
 * @typeofeditors ["CDE"]
 * @param {RelFromH} [sRelativeFrom="page"] - The document element which will be taken as a countdown point for the object horizontal alignment.
 * @param {("left" | "right" | "center")} [sAlign="left"] - The alignment type which will be used for the object horizontal alignment.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/SetHorAlign.js
 */
ApiDrawing.prototype.SetHorAlign = function(sRelativeFrom, sAlign){ return true; };

/**
 * Specifies how the floating object will be vertically aligned.
 * @memberof ApiDrawing
 * @typeofeditors ["CDE"]
 * @param {RelFromV} [sRelativeFrom="page"] - The document element which will be taken as a countdown point for the object vertical alignment.
 * @param {("top" | "bottom" | "center")} [sAlign="top"] - The alingment type which will be used for the object vertical alignment.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/SetVerAlign.js
 */
ApiDrawing.prototype.SetVerAlign = function(sRelativeFrom, sAlign){ return true; };

/**
 * Sets the absolute measurement for the horizontal positioning of the floating object.
 * @memberof ApiDrawing
 * @typeofeditors ["CDE"]
 * @param {RelFromH} sRelativeFrom - The document element which will be taken as a countdown point for the object horizontal alignment.
 * @param {EMU} nDistance - The distance from the right side of the document element to the floating object measured in English measure units.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/SetHorPosition.js
 */
ApiDrawing.prototype.SetHorPosition = function(sRelativeFrom, nDistance){ return true; };

/**
 * Sets the absolute measurement for the vertical positioning of the floating object.
 * @memberof ApiDrawing
 * @typeofeditors ["CDE"]
 * @param {RelFromV} sRelativeFrom - The document element which will be taken as a countdown point for the object vertical alignment.
 * @param {EMU} nDistance - The distance from the bottom part of the document element to the floating object measured in English measure units.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/SetVerPosition.js
 */
ApiDrawing.prototype.SetVerPosition = function(sRelativeFrom, nDistance){ return true; };

/**
 * Specifies the minimum distance which will be maintained between the edges of the current drawing object and any
 * subsequent text.
 * @memberof ApiDrawing
 * @typeofeditors ["CDE"]
 * @param {EMU} nLeft - The distance from the left side of the current object and the subsequent text run measured in English measure units.
 * @param {EMU} nTop - The distance from the top side of the current object and the preceding text run measured in English measure units.
 * @param {EMU} nRight - The distance from the right side of the current object and the subsequent text run measured in English measure units.
 * @param {EMU} nBottom - The distance from the bottom side of the current object and the subsequent text run measured in English measure units.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/SetDistances.js
 */
ApiDrawing.prototype.SetDistances = function(nLeft, nTop, nRight, nBottom){ return true; };

/**
 * Returns a parent paragraph that contains the graphic object.
 * @memberof ApiDrawing
 * @typeofeditors ["CDE"]
 * @returns {ApiParagraph | null} - returns null if parent paragraph doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/GetParentParagraph.js
 */
ApiDrawing.prototype.GetParentParagraph = function(){ return new ApiParagraph(); };

/**
 * Returns a parent content control that contains the graphic object.
 * @memberof ApiDrawing
 * @typeofeditors ["CDE"]
 * @returns {ApiBlockLvlSdt | null} - returns null if parent content control doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/GetParentContentControl.js
 */
ApiDrawing.prototype.GetParentContentControl = function(){ return new ApiBlockLvlSdt(); };

/**
 * Returns a parent table that contains the graphic object.
 * @memberof ApiDrawing
 * @typeofeditors ["CDE"]
 * @returns {ApiTable | null} - returns null if parent table doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/GetParentTable.js
 */
ApiDrawing.prototype.GetParentTable = function(){ return new ApiTable(); };

/**
 * Returns a parent table cell that contains the graphic object.
 * @typeofeditors ["CDE"]
 * @returns {ApiTableCell | null} - returns null if parent cell doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/GetParentTableCell.js
 */
ApiDrawing.prototype.GetParentTableCell = function(){ return new ApiTableCell(); };

/**
 * Deletes the current graphic object. 
 * @typeofeditors ["CDE"]
 * @returns {boolean} - returns false if drawing object haven't parent.
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/Delete.js
 */
ApiDrawing.prototype.Delete = function(){ return true; };

/**
 * Copies the current graphic object. 
 * @memberof ApiDrawing
 * @typeofeditors ["CDE"]
 * @returns {ApiDrawing}
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/Copy.js
 */
ApiDrawing.prototype.Copy = function(){ return new ApiDrawing(); };

/**
 * Wraps the graphic object with a rich text content control.
 * @memberof ApiDrawing
 * @typeofeditors ["CDE"]
 * @param {number} nType - Defines if this method returns the ApiBlockLvlSdt (nType === 1) or ApiDrawing (any value except 1) object.
 * @returns {ApiDrawing | ApiBlockLvlSdt}  
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/InsertInContentControl.js
 */
ApiDrawing.prototype.InsertInContentControl = function(nType){ return new ApiDrawing(); };

/**
 * Inserts a paragraph at the specified position.
 * @memberof ApiDrawing
 * @typeofeditors ["CDE"]
 * @param {string | ApiParagraph} paragraph - Text or paragraph.
 * @param {string} sPosition - The position where the text or paragraph will be inserted ("before" or "after" the drawing specified).
 * @param {boolean} beRNewPara - Defines if this method returns a new paragraph (true) or the current ApiDrawing (false).
 * @returns {ApiParagraph | ApiDrawing} - returns null if parent paragraph doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/InsertParagraph.js
 */
ApiDrawing.prototype.InsertParagraph = function(paragraph, sPosition, beRNewPara){ return new ApiParagraph(); };

/**
 * Selects the current graphic object.
 * @memberof ApiDrawing
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/Select.js
 */
ApiDrawing.prototype.Select = function(){ return true; };

/**
 * Inserts a break at the specified location in the main document.
 * @memberof ApiDrawing
 * @typeofeditors ["CDE"]
 * @param {number}breakType - The break type: page break (0) or line break (1).
 * @param {string}position  - The position where the page or line break will be inserted ("before" or "after" the current drawing).
 * @returns {boolean}  - returns false if drawing object haven't parent run or params are invalid.
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/AddBreak.js
 */
ApiDrawing.prototype.AddBreak = function(breakType, position){ return true; };

/**
 * Flips the current drawing horizontally.
 * @memberof ApiDrawing
 * @typeofeditors ["CDE"]
 * @param {boolean} bFlip - Specifies if the figure will be flipped horizontally or not.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/SetHorFlip.js
 */
ApiDrawing.prototype.SetHorFlip = function(bFlip){ return true; };

/**
 * Flips the current drawing vertically.
 * @memberof ApiDrawing
 * @typeofeditors ["CDE"]
 * @param {boolean} bFlip - Specifies if the figure will be flipped vertically or not.
 * @returns {boolean} - returns false if param is invalid.
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/SetVertFlip.js
 */
ApiDrawing.prototype.SetVertFlip = function(bFlip){ return true; };

/**
 * Scales the height of the figure using the specified coefficient.
 * @memberof ApiDrawing
 * @typeofeditors ["CDE"]
 * @param {number} coefficient - The coefficient by which the figure height will be scaled.
 * @returns {boolean} - return false if param is invalid.
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/ScaleHeight.js
 */
ApiDrawing.prototype.ScaleHeight = function(coefficient){ return true; };

/**
 * Scales the width of the figure using the specified coefficient.
 * @memberof ApiDrawing
 * @typeofeditors ["CDE"]
 * @param {number} coefficient - The coefficient by which the figure width will be scaled.
 * @returns {boolean} - return false if param is invali.
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/ScaleWidth.js
 */
ApiDrawing.prototype.ScaleWidth = function(coefficient){ return true; };

/**
 * Sets the fill formatting properties to the current graphic object.
 * @memberof ApiDrawing
 * @typeofeditors ["CDE"]
 * @param {ApiFill} oFill - The fill type used to fill the graphic object.
 * @returns {boolean} - returns false if param is invalid.
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/Fill.js
 */
ApiDrawing.prototype.Fill = function(oFill){ return true; };

/**
 * Sets the outline properties to the specified graphic object.
 * @memberof ApiDrawing
 * @typeofeditors ["CDE"]
 * @param {ApiStroke} oStroke - The stroke used to create the graphic object outline.
 * @returns {boolean} - returns false if param is invalid.
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/SetOutLine.js
 */
ApiDrawing.prototype.SetOutLine = function(oStroke){ return true; };

/**
 * Returns the next inline drawing object if exists. 
 *  @memberof ApiDrawing
 * @typeofeditors ["CDE"]
 * @returns {ApiDrawing | null} - returns null if drawing object is last.
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/GetNextDrawing.js
 */
ApiDrawing.prototype.GetNextDrawing = function(){ return new ApiDrawing(); };

/**
 * Returns the previous inline drawing object if exists. 
 * @memberof ApiDrawing
 * @typeofeditors ["CDE"]
 * @returns {ApiDrawing | null} - returns null if drawing object is first.
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/GetPrevDrawing.js
 */
ApiDrawing.prototype.GetPrevDrawing = function(){ return new ApiDrawing(); };

/**
 * Converts the ApiDrawing object into the JSON object.
 * @memberof ApiDrawing
 * @typeofeditors ["CDE"]
 * @param {boolean} bWriteNumberings - Specifies if the used numberings will be written to the JSON object or not.
 * @param {boolean} bWriteStyles - Specifies if the used styles will be written to the JSON object or not.
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/ToJSON.js
 */
ApiDrawing.prototype.ToJSON = function(bWriteNumberings, bWriteStyles){ return new JSON(); };

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
 * @typeofeditors ["CDE"]
 * @param {DrawingLockType} sType - Lock type in the string format.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/GetLockValue.js
 */
ApiDrawing.prototype.GetLockValue = function(sType){ return true; };

/**
 * Sets the lock value to the specified lock type of the current drawing.
 * @typeofeditors ["CDE"]
 * @param {DrawingLockType} sType - Lock type in the string format.
 * @param {boolean} bValue - Specifies if the specified lock is applied to the current drawing.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/SetLockValue.js
 */
ApiDrawing.prototype.SetLockValue = function(sType, bValue){ return true; };

/**
 * Sets the properties from another drawing to the current drawing.
 * The following properties will be copied: horizontal and vertical alignment, distance between the edges of the current drawing object and any subsequent text, wrapping style, drawing name, title and description.
 * @memberof ApiDrawing
 * @param {ApiDrawing} oAnotherDrawing - The drawing which properties will be set to the current drawing.
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/SetDrawingPrFromDrawing.js
 */
ApiDrawing.prototype.SetDrawingPrFromDrawing = function(oAnotherDrawing){ return true; };

/**
 * Sets the rotation angle to the current drawing object.
 * @memberof ApiDrawing
 * @param {number} nRotAngle - New drawing rotation angle.
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/SetRotation.js
 */
ApiDrawing.prototype.SetRotation = function(nRotAngle){ return true; };

/**
 * Returns the rotation angle of the current drawing object.
 * @memberof ApiDrawing
 * @typeofeditors ["CDE"]
 * @returns {number}
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiDrawing/Methods/GetRotation.js
 */
ApiDrawing.prototype.GetRotation = function(){ return 0; };

/**
 * Returns a type of the ApiImage class.
 * @memberof ApiImage
 * @typeofeditors ["CDE", "CPE"]
 * @returns {"image"}
 * @see office-js-api/Examples/{Editor}/ApiImage/Methods/GetClassType.js
 */
ApiImage.prototype.GetClassType = function(){ return ""; };

/**
 * Returns the next inline image if exists. 
 * @memberof ApiImage
 * @typeofeditors ["CDE"]
 * @returns {ApiImage | null} - returns null if image is last.
 * @see office-js-api/Examples/{Editor}/ApiImage/Methods/GetNextImage.js
 */
ApiImage.prototype.GetNextImage= function(){ return new ApiImage(); };

/**
 * Returns the previous inline image if exists. 
 * @memberof ApiImage
 * @typeofeditors ["CDE"]
 * @returns {ApiImage | null} - returns null if image is first.
 * @see office-js-api/Examples/{Editor}/ApiImage/Methods/GetPrevImage.js
 */
ApiImage.prototype.GetPrevImage= function(){ return new ApiImage(); };

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
 * @param {string} sAppId - The application ID associated with the curent OLE object.
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
 * Returns a type of the ApiShape class.
 * @memberof ApiShape
 * @typeofeditors ["CDE", "CSE"]
 * @returns {"shape"}
 * @see office-js-api/Examples/{Editor}/ApiShape/Methods/GetClassType.js
 */
ApiShape.prototype.GetClassType = function(){ return ""; };

/**
 * Returns the shape inner contents where a paragraph or text runs can be inserted.
 * @memberof ApiShape
 * @typeofeditors ["CDE", "CSE"]
 * @returns {ApiDocumentContent}
 * @see office-js-api/Examples/{Editor}/ApiShape/Methods/GetDocContent.js
 */
ApiShape.prototype.GetDocContent = function(){ return new ApiDocumentContent(); };

/**
 * Sets the vertical alignment to the shape content where a paragraph or text runs can be inserted.
 * @memberof ApiShape
 * @typeofeditors ["CDE", "CSE"]
 * @param {VerticalTextAlign} VerticalAlign - The type of the vertical alignment for the shape inner contents.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiShape/Methods/SetVerticalTextAlign.js
 */
ApiShape.prototype.SetVerticalTextAlign = function(VerticalAlign){ return true; };

/**
 * Sets the text paddings to the current shape.
 * @memberof ApiShape
 * @typeofeditors ["CDE", "CSE"]
 * @param {?EMU} nLeft - Left padding.
 * @param {?EMU} nTop - Top padding.
 * @param {?EMU} nRight - Right padding.
 * @param {?EMU} nBottom - Bottom padding.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiShape/Methods/SetPaddings.js
 */
ApiShape.prototype.SetPaddings = function(nLeft, nTop, nRight, nBottom){ return true; };

/**
 * Returns the next inline shape if exists. 
 * @memberof ApiShape
 * @typeofeditors ["CDE"]
 * @returns {ApiShape | null} - returns null if shape is last.
 * @see office-js-api/Examples/{Editor}/ApiShape/Methods/GetNextShape.js
 */
ApiShape.prototype.GetNextShape = function(){ return new ApiShape(); };

/**
 * Returns the previous inline shape if exists. 
 * @memberof ApiShape
 * @typeofeditors ["CDE"]
 * @returns {ApiShape | null} - returns null is shape is first.
 * @see office-js-api/Examples/{Editor}/ApiShape/Methods/GetPrevShape.js
 */
ApiShape.prototype.GetPrevShape= function(){ return new ApiShape(); };

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
 * Specifies font size for labels of the horizontal axis.
 * @memberof ApiChart
 * @typeofeditors ["CDE"]
 * @param {pt} nFontSize - The text size value measured in points.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetHorAxisLablesFontSize.js
 */
ApiChart.prototype.SetHorAxisLablesFontSize = function(nFontSize){ return true; };

/**
 * Specifies font size for labels of the vertical axis.
 * @memberof ApiChart
 * @typeofeditors ["CDE"]
 * @param {pt} nFontSize - The text size value measured in points.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/SetVertAxisLablesFontSize.js
 */
ApiChart.prototype.SetVertAxisLablesFontSize = function(nFontSize){ return true; };

/**
 * Returns the next inline chart if exists.
 * @memberof ApiChart
 * @typeofeditors ["CDE"]
 * @returns {ApiChart | null} - returns null if chart is last.
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/GetNextChart.js
 */
ApiChart.prototype.GetNextChart = function(){ return new ApiChart(); };

/**
 * Returns the previous inline chart if exists. 
 * @memberof ApiChart
 * @typeofeditors ["CDE"]
 * @returns {ApiChart | null} - return null if char if first.
 * @see office-js-api/Examples/{Editor}/ApiChart/Methods/GetPrevChart.js
 */
ApiChart.prototype.GetPrevChart= function(){ return new ApiChart(); };

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
 * Returns a type of the ApiGroup class.
 * @memberof ApiGroup
 * @typeofeditors ["CDE"]
 * @returns {"group"}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiGroup/Methods/GetClassType.js
 */
ApiGroup.prototype.GetClassType = function(){ return ""; };

/**
 * Ungroups the current group of drawings.
 * @memberof ApiGroup
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiGroup/Methods/Ungroup.js
 */
ApiGroup.prototype.Ungroup = function(){ return true; };

/**
 * Returns a type of the ApiFill class.
 * @memberof ApiFill
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"fill"}
 * @see office-js-api/Examples/{Editor}/ApiFill/Methods/GetClassType.js
 */
ApiFill.prototype.GetClassType = function(){ return ""; };

/**
 * Converts the ApiFill object into the JSON object.
 * @memberof ApiFill
 * @typeofeditors ["CDE"]
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiFill/Methods/ToJSON.js
 */
ApiFill.prototype.ToJSON = function(){ return new JSON(); };

/**
 * Returns a type of the ApiStroke class.
 * @memberof ApiStroke
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"stroke"}
 * @see office-js-api/Examples/{Editor}/ApiStroke/Methods/GetClassType.js
 */
ApiStroke.prototype.GetClassType = function(){ return ""; };

/**
 * Converts the ApiStroke object into the JSON object.
 * @memberof ApiStroke
 * @typeofeditors ["CDE"]
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiStroke/Methods/ToJSON.js
 */
ApiStroke.prototype.ToJSON = function(){ return new JSON(); };

/**
 * Returns a type of the ApiGradientStop class.
 * @memberof ApiGradientStop
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"gradientStop"}
 * @see office-js-api/Examples/{Editor}/ApiGradientStop/Methods/GetClassType.js
 */
ApiGradientStop.prototype.GetClassType = function (){ return ""; };

/**
 * Converts the ApiGradientStop object into the JSON object.
 * @memberof ApiGradientStop
 * @typeofeditors ["CDE"]
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiGradientStop/Methods/ToJSON.js
 */
ApiGradientStop.prototype.ToJSON = function(){ return new JSON(); };

/**
 * Returns a type of the ApiUniColor class.
 * @memberof ApiUniColor
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"uniColor"}
 * @see office-js-api/Examples/{Editor}/ApiUniColor/Methods/GetClassType.js
 */
ApiUniColor.prototype.GetClassType = function (){ return ""; };

/**
 * Converts the ApiUniColor object into the JSON object.
 * @memberof ApiUniColor
 * @typeofeditors ["CDE"]
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiUniColor/Methods/ToJSON.js
 */
ApiUniColor.prototype.ToJSON = function(){ return new JSON(); };

/**
 * Returns a color value in RGB format.
 * @memberof ApiUniColor
 * @typeofeditors ["CDE"]
 * @returns {number}
 * @see office-js-api/Examples/{Editor}/ApiUniColor/Methods/GetRGB.js
 */
ApiUniColor.prototype.GetRGB = function(){ return 0; };

/**
 * Returns a type of the ApiRGBColor class.
 * @memberof ApiRGBColor
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"rgbColor"}
 * @see office-js-api/Examples/{Editor}/ApiRGBColor/Methods/GetClassType.js
 */
ApiRGBColor.prototype.GetClassType = function (){ return ""; };

/**
 * Converts the ApiRGBColor object into the JSON object.
 * @memberof ApiRGBColor
 * @typeofeditors ["CDE"]
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiRGBColor/Methods/ToJSON.js
 */
ApiRGBColor.prototype.ToJSON = function(){ return new JSON(); };

/**
 * Returns a type of the ApiSchemeColor class.
 * @memberof ApiSchemeColor
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"schemeColor"}
 * @see office-js-api/Examples/{Editor}/ApiSchemeColor/Methods/GetClassType.js
 */
ApiSchemeColor.prototype.GetClassType = function (){ return ""; };

/**
 * Converts the ApiSchemeColor object into the JSON object.
 * @memberof ApiSchemeColor
 * @typeofeditors ["CDE"]
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiSchemeColor/Methods/ToJSON.js
 */
ApiSchemeColor.prototype.ToJSON = function(){ return new JSON(); };

/**
 * Returns a type of the ApiPresetColor class.
 * @memberof ApiPresetColor
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {"presetColor"}
 * @see office-js-api/Examples/{Editor}/ApiPresetColor/Methods/GetClassType.js
 */
ApiPresetColor.prototype.GetClassType = function (){ return ""; };

/**
 * Converts the ApiPresetColor object into the JSON object.
 * @memberof ApiPresetColor
 * @typeofeditors ["CDE"]
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiPresetColor/Methods/ToJSON.js
 */
ApiPresetColor.prototype.ToJSON = function(){ return new JSON(); };

/**
 * Returns a type of the ApiInlineLvlSdt class.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {"inlineLvlSdt"}
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/GetClassType.js
 */
ApiInlineLvlSdt.prototype.GetClassType = function(){ return ""; };

/**
 * Returns an internal ID of the current content control.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/GetInternalId.js
 */
ApiInlineLvlSdt.prototype.GetInternalId = function(){ return ""; };

/**
 * Specifies a unique ID for the current content control.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @since 8.3.2
 * @param {number} id - The numerical ID which will be specified for the current content control.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/SetId.js
 */
ApiInlineLvlSdt.prototype.SetId = function(id){ return true; };

/**
 * Returns a unique ID for the current content control.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @since 8.3.2
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/GetId.js
 */
ApiInlineLvlSdt.prototype.GetId = function(){ return ""; };

/**
 * Sets the lock to the current inline text content control:
 * <b>"unlocked"</b> - content can be edited and the container can be deleted.
 * <b>"contentLocked"</b> - content cannot be edited.
 * <b>"sdtContentLocked"</b> - content cannot be edited and the container cannot be deleted.
 * <b>"sdtLocked"</b> - the container cannot be deleted.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @param {"unlocked" | "contentLocked" | "sdtContentLocked" | "sdtLocked"} lockType - The lock type applied to the inline text content control.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/SetLock.js
 */
ApiInlineLvlSdt.prototype.SetLock = function(lockType){ return true; };

/**
 * Returns the lock type of the current container.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {SdtLock}
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/GetLock.js
 */
ApiInlineLvlSdt.prototype.GetLock = function(){ return new SdtLock(); };

/**
 * Adds a string tag to the current inline text content control.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @param {string} sTag - The tag which will be added to the current inline text content control.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/SetTag.js
 */
ApiInlineLvlSdt.prototype.SetTag = function(sTag){ return true; };

/**
 * Returns the tag attribute for the current container.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/GetTag.js
 */
ApiInlineLvlSdt.prototype.GetTag = function(){ return ""; };

/**
 * Adds a string label to the current inline text content control.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @param {string} sLabel - The label which will be added to the current inline text content control. Can be a positive or negative integer from <b>-2147483647</b> to <b>2147483647</b>.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/SetLabel.js
 */
ApiInlineLvlSdt.prototype.SetLabel = function(sLabel){ return true; };

/**
 * Returns the label attribute for the current container.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/GetLabel.js
 */
ApiInlineLvlSdt.prototype.GetLabel = function(){ return ""; };

/**
 * Sets the alias attribute to the current container.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @param {string} sAlias - The alias which will be added to the current inline text content control.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/SetAlias.js
 */
ApiInlineLvlSdt.prototype.SetAlias = function(sAlias){ return true; };

/**
 * Returns the alias attribute for the current container.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/GetAlias.js
 */
ApiInlineLvlSdt.prototype.GetAlias = function(){ return ""; };

/**
 * Returns a number of elements in the current inline text content control. The text content 
 * control is created with one text run present in it by default, so even without any 
 * element added this method will return the value of '1'.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {number}
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/GetElementsCount.js
 */
ApiInlineLvlSdt.prototype.GetElementsCount = function(){ return 0; };

/**
 * Returns an element of the current inline text content control using the position specified.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @param {number} nPos - The position where the element which content we want to get must be located.
 * @returns {ParagraphContent}
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/GetElement.js
 */
ApiInlineLvlSdt.prototype.GetElement = function(nPos){ return new ParagraphContent(); };

/**
 * Removes an element using the position specified from the current inline text content control.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @param {number} nPos - The position of the element which we want to remove from the current inline text content control.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/RemoveElement.js
 */
ApiInlineLvlSdt.prototype.RemoveElement = function(nPos){ return true; };

/**
 * Removes all the elements from the current inline text content control.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {boolean} - returns false if control has not elements.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/RemoveAllElements.js
 */
ApiInlineLvlSdt.prototype.RemoveAllElements = function(){ return true; };

/**
 * Adds an element to the inline text content control.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @param {ParagraphContent} oElement - The document element which will be added at the position specified. Returns <b>false</b> if the type of *oElement* is not supported by an inline text content control.
 * @param {number} [nPos] - The position of the element where it will be added to the current inline text content control. If this value is not specified, then the element will be added to the end of the current inline text content control.
 * @returns {boolean} - returns false if oElement unsupported.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/AddElement.js
 */
ApiInlineLvlSdt.prototype.AddElement = function(oElement, nPos){ return true; };

/**
 * Adds an element to the end of inline text content control.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @param {DocumentElement} oElement - The document element which will be added to the end of the container.
 * @returns {boolean} - returns false if oElement unsupported.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/Push.js
 */
ApiInlineLvlSdt.prototype.Push = function(oElement){ return true; };

/**
 * Adds text to the current content control. 
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @param {String} sText - The text which will be added to the content control.
 * @returns {boolean} - returns false if param is invalid.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/AddText.js
 */
ApiInlineLvlSdt.prototype.AddText = function(sText){ return true; };

/**
 * Removes a content control and its content. If keepContent is true, the content is not deleted.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @param {boolean} keepContent - Specifies if the content will be deleted or not.
 * @returns {boolean} - returns false if control haven't parent paragraph.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/Delete.js
 */
ApiInlineLvlSdt.prototype.Delete = function(keepContent){ return true; };

/**
 * Applies text settings to the content of the content control.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @param {ApiTextPr} oTextPr - The properties that will be set to the content of the content control.
 * @returns {ApiInlineLvlSdt} this.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/SetTextPr.js
 */
ApiInlineLvlSdt.prototype.SetTextPr = function(oTextPr){ return new ApiInlineLvlSdt(); };

/**
 * Returns a paragraph that contains the current content control.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {ApiParagraph | null} - returns null if parent paragraph doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/GetParentParagraph.js
 */
ApiInlineLvlSdt.prototype.GetParentParagraph = function(){ return new ApiParagraph(); };

/**
 * Returns a content control that contains the current content control.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {ApiBlockLvlSdt | ApiInlineLvlSdt | null} - returns null if parent content control doesn't exist.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/GetParentContentControl.js
 */
ApiInlineLvlSdt.prototype.GetParentContentControl = function(){ return new ApiBlockLvlSdt(); };

/**
 * Returns a table that contains the current content control.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {ApiTable | null} - returns null if parent table doesn't exist.  
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/GetParentTable.js
 */
ApiInlineLvlSdt.prototype.GetParentTable = function(){ return new ApiTable(); };

/**
 * Returns a table cell that contains the current content control.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {ApiTableCell | null} - return null if parent cell doesn't exist.  
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/GetParentTableCell.js
 */
ApiInlineLvlSdt.prototype.GetParentTableCell = function(){ return new ApiTableCell(); };

/**
 * Returns a Range object that represents the part of the document contained in the specified content control.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @param {Number} Start - Start position index in the current element.
 * @param {Number} End - End position index in the current element.
 * @returns {ApiRange} 
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/GetRange.js
 */
ApiInlineLvlSdt.prototype.GetRange = function(Start, End){ return new ApiRange(); };

/**
 * Creates a copy of an inline content control. Ignores comments, footnote references, complex fields.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {ApiInlineLvlSdt}
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/Copy.js
 */
ApiInlineLvlSdt.prototype.Copy = function(){ return new ApiInlineLvlSdt(); };

/**
 * Converts the ApiInlineLvlSdt object into the JSON object.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @param {boolean} bWriteStyles - Specifies if the used styles will be written to the JSON object or not.
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/ToJSON.js
 */
ApiInlineLvlSdt.prototype.ToJSON = function(bWriteStyles){ return new JSON(); };

/**
 * Returns the placeholder text from the current inline content control.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/GetPlaceholderText.js
 */
ApiInlineLvlSdt.prototype.GetPlaceholderText = function(){ return ""; };

/**
 * Sets the placeholder text to the current inline content control.
 *Can't be set to checkbox or radio button*
 * @memberof ApiInlineLvlSdt
 * @param {string} sText - The text that will be set to the current inline content control.
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/SetPlaceholderText.js
 */
ApiInlineLvlSdt.prototype.SetPlaceholderText = function(sText){ return true; };

/**
 * Checks if the content control is a form.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/IsForm.js
 */
ApiInlineLvlSdt.prototype.IsForm = function(){ return true; };

/**
 * Adds a comment to the current inline content control.
 * <note>Please note that this inline content control must be in the document.</note>
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @param {string} sText - The comment text.
 * @param {string} [sAuthor] - The author's name.
 * @param {string} [sUserId] - The user ID of the comment author.
 * @returns {ApiComment} - Returns null if the comment was not added.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/AddComment.js
 */
ApiInlineLvlSdt.prototype.AddComment = function(sText, sAuthor, sUserId){ return new ApiComment(); };

/**
 * Places a cursor before/after the current content control.
 * @param {boolean} [isAfter=true] - Specifies whether a cursor will be placed before (false) or after (true) the current content control.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/MoveCursorOutside.js
 */
ApiInlineLvlSdt.prototype.MoveCursorOutside = function(isAfter){ return true; };

/**
 * Returns a list of values of the combo box / drop-down list content control.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {ApiContentControlList}
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/GetDropdownList.js
 */
ApiInlineLvlSdt.prototype.GetDropdownList = function(){ return new ApiContentControlList(); };

/**
 * Sets the border color to the current content control.
 * @memberof ApiInlineLvlSdt
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @param {byte} a - Alpha color component value.
 * @typeofeditors ["CDE"]
 * @since 8.3.2
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/SetBorderColor.js
 */
ApiInlineLvlSdt.prototype.SetBorderColor = function(r, g, b, a){ return true; };

/**
 * Returns the border color of the current content control.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @since 8.3.2
 * @returns {null | {r:byte, g:byte, b:byte, a:byte}}
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/GetBorderColor.js
 */
ApiInlineLvlSdt.prototype.GetBorderColor = function(){ return null; };

/**
 * Sets the background color to the current content control.
 * @memberof ApiInlineLvlSdt
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @param {byte} a - Alpha color component value.
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/SetBackgroundColor.js
 */
ApiInlineLvlSdt.prototype.SetBackgroundColor = function(r, g, b, a){ return true; };

/**
 * Returns the background color of the current content control.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @since 8.3.2
 * @returns {null | {r:byte, g:byte, b:byte, a:byte}}
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/GetBackgroundColor.js
 */
ApiInlineLvlSdt.prototype.GetBackgroundColor = function(){ return null; };

/**
 * Selects the current content control.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/Select.js
 */
ApiInlineLvlSdt.prototype.Select = function(){ return true; };

/**
 * Sets the data binding for the current content control.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {XmlMapping | null} xmlMapping - The data binding to associate with the content control.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/SetDataBinding.js
 */
ApiInlineLvlSdt.prototype.SetDataBinding = function(xmlMapping){ return true; };

/**
 * Retrieves the data binding of the content control.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {XmlMapping} Returns the data binding of the content control if it exists, otherwise `null`.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/GetDataBinding.js
 */
ApiInlineLvlSdt.prototype.GetDataBinding = function(){ return new XmlMapping(); };

/**
 * Updates the content control using the value from the XML mapping.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {boolean} Returns `true` if the update was successful, otherwise `false`.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/UpdateFromXmlMapping.js
 */
ApiInlineLvlSdt.prototype.UpdateFromXmlMapping = function(){ return true; };

/**
 * Returns the content control data for the XML mapping.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {string} The string data representing the contents of the current content control.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/GetDataForXmlMapping.js
 */
ApiInlineLvlSdt.prototype.GetDataForXmlMapping = function(){ return ""; };

/**
 * Checks if the content control is a checkbox.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {boolean} Returns `true` if the content control is a checkbox, otherwise `false`.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/IsCheckBox.js
 */
ApiInlineLvlSdt.prototype.IsCheckBox = function(){ return true; };

/**
 * Sets the checkbox value for the content control.
 * This method updates the checkbox state of the content control to either checked or unchecked.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {boolean} isChecked - The state to set for the checkbox. `true` for checked, `false` for unchecked.
 * @returns {boolean} Returns `true` if the checkbox value was successfully set, `false` if the content control is not a checkbox.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/SetCheckBoxChecked.js
 */
ApiInlineLvlSdt.prototype.SetCheckBoxChecked = function(isChecked){ return true; };

/**
 * Determines whether a checkbox content control is currently checked or unchecked.
 *
 * Throws: Error if the content control is not a checkbox.
 *
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {boolean} Returns `true` if the checkbox is checked, `false` if the checkbox is unchecked.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/IsCheckBoxChecked.js
 */
ApiInlineLvlSdt.prototype.IsCheckBoxChecked = function(){ return true; };

/**
 * Checks whether the content control is a picture control.
 * This method verifies if the content control is specifically a picture control.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {boolean} Returns `true` if the content control is a picture, otherwise `false`.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/IsPicture.js
 */
ApiInlineLvlSdt.prototype.IsPicture = function(){ return true; };

/**
 * Sets the size for the picture in a content control.
 * This method adjusts the width and height of the image if the content control is a picture.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {EMU} width - The desired image width .
 * @param {EMU} height - The desired image height.
 * @returns {boolean} Returns `true` if the size was successfully set, or `false` if the content control is not a picture.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/SetPictureSize.js
 */
ApiInlineLvlSdt.prototype.SetPictureSize = function(width, height){ return true; };

/**
 * Sets the content (image) for the picture content control.
 * This method updates the picture inside a content control by setting an image from a provided URL.
 * The URL should be an internet link to the image.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {string} imageUrl - The URL of the image to be used for the content control.
 * Currently, only internet URLs are supported.
 * @returns {boolean} Returns `true` if the image was successfully set, otherwise `false`.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/SetPicture.js
 */
ApiInlineLvlSdt.prototype.SetPicture = function(imageUrl){ return true; };

/**
 * Checks whether the content control is a drop-down list.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {boolean} Returns `true` if the content control is a drop-down list, otherwise `false`.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/IsDropDownList.js
 */
ApiInlineLvlSdt.prototype.IsDropDownList = function(){ return true; };

/**
 * Checks whether the content control is a combo box list.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {boolean} Returns `true` if the content control is a combo box list, otherwise `false`.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/IsComboBox.js
 */
ApiInlineLvlSdt.prototype.IsComboBox = function(){ return true; };

/**
 * Sets the selected item for a combo box list or drop-down list.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {string} name - The name of the item to be selected in the list.
 * @returns {boolean} Returns `true` if the item was successfully selected, otherwise `false`.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/SelectListItem.js
 */
ApiInlineLvlSdt.prototype.SelectListItem = function(name){ return true; };

/**
 * Adds an item to a combo box list or drop-down list.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {string} name - The name of the item to add to the list.
 * @param {string} value - The value of the item to add to the list.
 * @param {number} [pos] - The optional position at which to insert the new item in the list.
 * @returns {boolean} Returns `true` if the item was successfully added, otherwise `false`.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/AddListItem.js
 */
ApiInlineLvlSdt.prototype.AddListItem = function(name, value, pos){ return true; };

/**
 * Removes an item from a combo box list or drop-down list.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {string} value - The value of the item to remove from the list.
 * @returns {boolean} Returns `true` if the item was successfully removed, otherwise `false`.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/RemoveListItem.js
 */
ApiInlineLvlSdt.prototype.RemoveListItem = function(value){ return true; };

/**
 * Checks whether the content control is a datepicker.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {boolean} Returns `true` if the content control is a datepicker, otherwise `false`.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/IsDatePicker.js
 */
ApiInlineLvlSdt.prototype.IsDatePicker = function(){ return true; };

/**
 * Sets the value for the datepicker content control.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {Date} date - The date value to set for the datepicker.
 * @returns {boolean} Returns `true` if the date was successfully set, otherwise `false`.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/SetDate.js
 */
ApiInlineLvlSdt.prototype.SetDate = function(date){ return true; };

/**
 * Retrieves the selected date value from a date picker content control and returns it as a Date object.
 *
 * Throws: Error if the content control is not a date picker.
 *
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {Date} Date object representing the selected date in the date picker control.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/GetDate.js
 */
ApiInlineLvlSdt.prototype.GetDate = function(){ return new Date(); };

/**
 * Sets the date format for the datepicker content control.
 * This method allows setting the format in which the date should be displayed in the datepicker content control.
 * The format string should be specified using common date format patterns (e.g., "mm.dd.yyyy").
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {string} dateFormat - The desired date format (e.g., "mm.dd.yyyy").
 * @returns {boolean} Returns `true` if the date format was successfully set, otherwise `false`.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/SetDateFormat.js
 */
ApiInlineLvlSdt.prototype.SetDateFormat = function(dateFormat){ return true; };

/**
 * Sets the visualization type of the content control.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {"boundingBox"|"hidden"} type - The desired visualization type.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/SetAppearance.js
 */
ApiInlineLvlSdt.prototype.SetAppearance = function(type){};

/**
 * Returns the visualization type of the content control.
 * @memberof ApiInlineLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {"boundingBox"|"hidden"} type - The visualization type of the content control.
 * @see office-js-api/Examples/{Editor}/ApiInlineLvlSdt/Methods/GetAppearance.js
 */
ApiInlineLvlSdt.prototype.GetAppearance = function(){ return ""; };

/**
 * Returns a type of the ApiContentControlList class.
 * @memberof ApiContentControlList
 * @typeofeditors ["CDE"]
 * @returns {"contentControlList"}
 * @see office-js-api/Examples/{Editor}/ApiContentControlList/Methods/GetClassType.js
 */
ApiContentControlList.prototype.GetClassType = function(){ return ""; };

/**
 * Returns a collection of items (the ApiContentControlListEntry objects) of the combo box / drop-down list content control.
 * @memberof ApiContentControlList
 * @typeofeditors ["CDE"]
 * @returns {ApiContentControlListEntry[]}
 * @see office-js-api/Examples/{Editor}/ApiContentControlList/Methods/GetAllItems.js
 */
ApiContentControlList.prototype.GetAllItems = function(){ return [new ApiContentControlListEntry()]; };

/**
 * Returns a number of items of the combo box / drop-down list content control.
 * @memberof ApiContentControlList
 * @typeofeditors ["CDE"]
 * @returns {number}
 * @see office-js-api/Examples/{Editor}/ApiContentControlList/Methods/GetElementsCount.js
 */
ApiContentControlList.prototype.GetElementsCount = function(){ return 0; };

/**
 * Returns a parent of the combo box / drop-down list content control.
 * @memberof ApiContentControlList
 * @typeofeditors ["CDE"]
 * @returns {ApiInlineLvlSdt | ApiBlockLvlSdt}
 * @see office-js-api/Examples/{Editor}/ApiContentControlList/Methods/GetParent.js
 */
ApiContentControlList.prototype.GetParent = function(){ return new ApiInlineLvlSdt(); };

/**
 * Adds a new value to the combo box / drop-down list content control.
 * @memberof ApiContentControlList
 * @param {string} sText - The display text for the list item.
 * @param {string} sValue - The list item value. By default is equal to sText parameter
 * @param {number} [nIndex=-1] - A position where a new value will be added. If nIndex=-1 add to the end.
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiContentControlList/Methods/Add.js
 */
ApiContentControlList.prototype.Add = function(sText, sValue, nIndex){ return true; };

/**
 * Clears a list of values of the combo box / drop-down list content control.
 * @memberof ApiContentControlList
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiContentControlList/Methods/Clear.js
 */
ApiContentControlList.prototype.Clear = function(){ return true; };

/**
 * Returns an item of the combo box / drop-down list content control by the position specified in the request.
 * @memberof ApiContentControlList
 * @param {number} nIndex - Item position.
 * @typeofeditors ["CDE"]
 * @returns {ApiContentControlListEntry}
 * @see office-js-api/Examples/{Editor}/ApiContentControlList/Methods/GetItem.js
 */
ApiContentControlList.prototype.GetItem = function(nIndex){ return new ApiContentControlListEntry(); };

/**
 * Returns a type of the ApiContentControlListEntry class.
 * @memberof ApiContentControlListEntry
 * @typeofeditors ["CDE"]
 * @returns {"contentControlList"}
 * @see office-js-api/Examples/{Editor}/ApiContentControlListEntry/Methods/GetClassType.js
 */
ApiContentControlListEntry.prototype.GetClassType = function(){ return ""; };

/**
 * Returns a parent of the content control list item in the combo box / drop-down list content control.
 * @memberof ApiContentControlListEntry
 * @typeofeditors ["CDE"]
 * @returns {ApiContentControlList}
 * @see office-js-api/Examples/{Editor}/ApiContentControlListEntry/Methods/GetParent.js
 */
ApiContentControlListEntry.prototype.GetParent = function(){ return new ApiContentControlList(); };

/**
 * Selects the list entry in the combo box / drop-down list content control and sets the text of the content control to the selected item value.
 * @memberof ApiContentControlListEntry
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiContentControlListEntry/Methods/Select.js
 */
ApiContentControlListEntry.prototype.Select = function(){ return true; };

/**
 * Moves the current item in the parent combo box / drop-down list content control up one element.
 * @memberof ApiContentControlListEntry
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiContentControlListEntry/Methods/MoveUp.js
 */
ApiContentControlListEntry.prototype.MoveUp = function(){ return true; };

/**
 * Moves the current item in the parent combo box / drop-down list content control down one element, so that it is after the item that originally followed it.
 * @memberof ApiContentControlListEntry
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiContentControlListEntry/Methods/MoveDown.js
 */
ApiContentControlListEntry.prototype.MoveDown = function(){ return true; };

/**
 * Returns an index of the content control list item in the combo box / drop-down list content control.
 * @memberof ApiContentControlListEntry
 * @typeofeditors ["CDE"]
 * @returns {number}
 * @see office-js-api/Examples/{Editor}/ApiContentControlListEntry/Methods/GetIndex.js
 */
ApiContentControlListEntry.prototype.GetIndex = function(){ return 0; };

/**
 * Sets an index to the content control list item in the combo box / drop-down list content control.
 * @memberof ApiContentControlListEntry
 * @param {number} nIndex - An index of the content control list item.
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiContentControlListEntry/Methods/SetIndex.js
 */
ApiContentControlListEntry.prototype.SetIndex = function(nIndex){ return true; };

/**
 * Deletes the specified item in the combo box / drop-down list content control.
 * @memberof ApiContentControlListEntry
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiContentControlListEntry/Methods/Delete.js
 */
ApiContentControlListEntry.prototype.Delete = function(){ return true; };

/**
 * Returns a String that represents the display text of a list item for the combo box / drop-down list content control.
 * @memberof ApiContentControlListEntry
 * @typeofeditors ["CDE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiContentControlListEntry/Methods/GetText.js
 */
ApiContentControlListEntry.prototype.GetText = function(){ return ""; };

/**
 * Sets a String that represents the display text of a list item for the combo box / drop-down list content control.
 * @memberof ApiContentControlListEntry
 * @typeofeditors ["CDE"]
 * @param {string} sText - The display text of a list item.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiContentControlListEntry/Methods/SetText.js
 */
ApiContentControlListEntry.prototype.SetText = function(sText){ return true; };

/**
 * Returns a String that represents the value of a list item for the combo box / drop-down list content control.
 * @memberof ApiContentControlListEntry
 * @typeofeditors ["CDE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiContentControlListEntry/Methods/GetValue.js
 */
ApiContentControlListEntry.prototype.GetValue = function(){ return ""; };

/**
 * Sets a String that represents the value of a list item for the combo box / drop-down list content control.
 * @memberof ApiContentControlListEntry
 * @typeofeditors ["CDE"]
 * @param {string} sValue - The value of a list item.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiContentControlListEntry/Methods/SetValue.js
 */
ApiContentControlListEntry.prototype.SetValue = function(sValue){ return true; };

/**
 * Returns a type of the ApiBlockLvlSdt class.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {"blockLvlSdt"}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/GetClassType.js
 */
ApiBlockLvlSdt.prototype.GetClassType = function(){ return ""; };

/**
 * Returns an internal id of the current content control.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/GetInternalId.js
 */
ApiBlockLvlSdt.prototype.GetInternalId = function(){ return ""; };

/**
 * Specifies a unique ID for the current content control.
 * @method
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @since 8.3.2
 * @param {number} id - The numerical ID which will be specified for the current content control.
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/SetId.js
 */
ApiBlockLvlSdt.prototype.SetId = ApiInlineLvlSdt.prototype.SetId;{};

/**
 * Returns a unique ID for the current content control.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @since 8.3.2
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/GetId.js
 */
ApiBlockLvlSdt.prototype.GetId = function(){ return ""; };

/**
 * Sets the lock to the current block text content control:
 * <b>"unlocked"</b> - content can be edited and the container can be deleted.
 * <b>"contentLocked"</b> - content cannot be edited.
 * <b>"sdtContentLocked"</b> - content cannot be edited and the container cannot be deleted.
 * <b>"sdtLocked"</b> - the container cannot be deleted.
 * @method
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @param {"unlocked" | "contentLocked" | "sdtContentLocked" | "sdtLocked"} lockType - The type of the lock applied to the block text content control.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/SetLock.js
 */
ApiBlockLvlSdt.prototype.SetLock = ApiInlineLvlSdt.prototype.SetLock;{ return true; };

/**
 * Returns the lock type of the current container.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {SdtLock}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/GetLock.js
 */
ApiBlockLvlSdt.prototype.GetLock = function(){ return new SdtLock(); };

/**
 * Sets the tag attribute to the current container.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @param {string} tag - The tag which will be added to the current container.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/SetTag.js
 */
ApiBlockLvlSdt.prototype.SetTag = function(tag){ return true; };

/**
 * Returns the tag attribute for the current container.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/GetTag.js
 */
ApiBlockLvlSdt.prototype.GetTag = function(){ return ""; };

/**
 * Sets the label attribute to the current container.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @param {string} label - The label which will be added to the current container. Can be a positive or negative integer from <b>-2147483647</b> to <b>2147483647</b>.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/SetLabel.js
 */
ApiBlockLvlSdt.prototype.SetLabel = function(label){ return true; };

/**
 * Returns the label attribute for the current container.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/GetLabel.js
 */
ApiBlockLvlSdt.prototype.GetLabel = function(){ return ""; };

/**
 * Sets the data binding for the content control.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {XmlMapping | null} xmlMapping - The data binding to associate with the content control.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/SetDataBinding.js
 */
ApiBlockLvlSdt.prototype.SetDataBinding = function(xmlMapping){ return true; };

/**
 * Sets the content (image) for the picture content control.
 * This method updates the picture inside a content control by setting an image from a provided URL.
 * The URL should be an internet link to the image.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {string} imageUrl - The URL of the image to be used for the content control.
 * Currently, only internet URLs are supported.
 * @returns {boolean} Returns `true` if the image was successfully set, otherwise `false`.
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/SetPicture.js
 */
ApiBlockLvlSdt.prototype.SetPicture = function(imageUrl){ return true; };

/**
 * Checks whether the content control is a picture control.
 * This method verifies if the content control is specifically a picture control.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {boolean} Returns `true` if the content control is a picture, otherwise `false`.
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/IsPicture.js
 */
ApiBlockLvlSdt.prototype.IsPicture = function(){ return true; };

/**
 * Retrieves the data binding of the content control.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {XmlMapping} Returns the data binding of the content control if it exists, otherwise `null`.
 */
ApiBlockLvlSdt.prototype.GetDataBinding = function(){ return new XmlMapping(); };

/**
 * Updates the content control using the value from the XML mapping.
 * @method
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {boolean} Returns `true` if the update was successful, otherwise `false`.
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/UpdateFromXmlMapping.js
 */
ApiBlockLvlSdt.prototype.UpdateFromXmlMapping = ApiInlineLvlSdt.prototype.UpdateFromXmlMapping;{ return true; };

/**
 * Returns the content control data for the XML mapping.
 * @method
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {string} The string data representing the contents of the current content control.
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/GetDataForXmlMapping.js
 */
ApiBlockLvlSdt.prototype.GetDataForXmlMapping = ApiInlineLvlSdt.prototype.GetDataForXmlMapping;{ return ""; };

/**
 * Sets the alias attribute to the current container.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @param {string} alias - The alias which will be added to the current container.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/SetAlias.js
 */
ApiBlockLvlSdt.prototype.SetAlias = function(alias){ return true; };

/**
 * Returns the alias attribute for the current container.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/GetAlias.js
 */
ApiBlockLvlSdt.prototype.GetAlias = function(){ return ""; };

/**
 * Returns the content of the current container.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {ApiDocumentContent}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/GetContent.js
 */
ApiBlockLvlSdt.prototype.GetContent = function(){ return new ApiDocumentContent(); };

/**
 * Returns a collection of content control objects in the current content control.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {ApiBlockLvlSdt[] | ApiInlineLvlSdt[]}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/GetAllContentControls.js
 */
ApiBlockLvlSdt.prototype.GetAllContentControls = function(){ return [new ApiBlockLvlSdt()]; };

/**
 * Returns a collection of paragraph objects in the current content control.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {ApiParagraph[]}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/GetAllParagraphs.js
 */
ApiBlockLvlSdt.prototype.GetAllParagraphs = function(){ return [new ApiParagraph()]; };

/**
 * Returns a collection of tables on a given absolute page.
 * <note>This method can be a little bit slow, because it runs the document calculation
 * process to arrange tables on the specified page.</note>
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @param page - Page number. If it is not specified, an empty array will be returned.
 * @returns {ApiTable[]}  
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/GetAllTablesOnPage.js
 */
ApiBlockLvlSdt.prototype.GetAllTablesOnPage = function(page){ return [new ApiTable()]; };

/**
 * Clears the contents from the current content control.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {boolean} - returns true.
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/RemoveAllElements.js
 */
ApiBlockLvlSdt.prototype.RemoveAllElements = function(){ return true; };

/**
 * Removes a content control and its content. If keepContent is true, the content is not deleted.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @param {boolean} keepContent - Specifies if the content will be deleted or not.
 * @returns {boolean} - returns false if content control haven't parent.
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/Delete.js
 */
ApiBlockLvlSdt.prototype.Delete = function(keepContent){ return true; };

/**
 * Applies text settings to the content of the content control.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @param {ApiTextPr} textPr - The properties that will be set to the content of the content control.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/SetTextPr.js
 */
ApiBlockLvlSdt.prototype.SetTextPr = function(textPr){ return true; };

/**
 * Returns a collection of drawing objects in the current content control.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {Drawing[]}  
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/GetAllDrawingObjects.js
 */
ApiBlockLvlSdt.prototype.GetAllDrawingObjects = function(){ return [new Drawing()]; };

/**
 * Returns a content control that contains the current content control.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {ApiBlockLvlSdt | null} - returns null if parent content control doesn't exist.  
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/GetParentContentControl.js
 */
ApiBlockLvlSdt.prototype.GetParentContentControl = function(){ return new ApiBlockLvlSdt(); };

/**
 * Returns a table that contains the current content control.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {ApiTable | null} - returns null is parent table does'n exist.  
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/GetParentTable.js
 */
ApiBlockLvlSdt.prototype.GetParentTable = function(){ return new ApiTable(); };

/**
 * Returns a table cell that contains the current content control.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {ApiTableCell | null} - returns null if parent cell doesn't exist.  
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/GetParentTableCell.js
 */
ApiBlockLvlSdt.prototype.GetParentTableCell = function(){ return new ApiTableCell(); };

/**
 * Pushes a paragraph or a table or a block content control to actually add it to the current container.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @param {DocumentElement} element - The type of the element which will be pushed to the current container.
 * @returns {boolean} - returns false if element unsupported.
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/Push.js
 */
ApiBlockLvlSdt.prototype.Push = function(element){ return true; };

/**
 * Adds a paragraph or a table or a block content control to the current container.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @param {DocumentElement} element - The type of the element which will be added to the current container.
 * @param {Number} pos - The specified position.
 * @returns {boolean} - returns false if element unsupported.
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/AddElement.js
 */
ApiBlockLvlSdt.prototype.AddElement = function(element, pos){ return true; };

/**
 * Adds a text to the current content control.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @param {String} text - The text which will be added to the content control.
 * @returns {boolean} - returns false if param is invalid.
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/AddText.js
 */
ApiBlockLvlSdt.prototype.AddText = function(text){ return true; };

/**
 * Returns a Range object that represents the part of the document contained in the specified content control.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @param {Number} start - Start position index in the current element.
 * @param {Number} end - End position index in the current element.
 * @returns {ApiRange} 
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/GetRange.js
 */
ApiBlockLvlSdt.prototype.GetRange = function(start, end){ return new ApiRange(); };

/**
 * Creates a copy of a block content control. Ignores comments, footnote references, complex fields.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {ApiBlockLvlSdt}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/Copy.js
 */
ApiBlockLvlSdt.prototype.Copy = function(){ return new ApiBlockLvlSdt(); };

/**
 * Searches for a scope of a content control object. The search results are a collection of ApiRange objects.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @param {string} text - Search string.
 * @param {boolean} isMatchCase - Case sensitive or not.
 * @returns {ApiRange[]}  
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/Search.js
 */
ApiBlockLvlSdt.prototype.Search = function(text, isMatchCase){ return [new ApiRange()]; };

/**
 * Selects the current content control.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/Select.js
 */
ApiBlockLvlSdt.prototype.Select = function(){ return true; };

/**
 * Returns the placeholder text from the current content control.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/GetPlaceholderText.js
 */
ApiBlockLvlSdt.prototype.GetPlaceholderText = function(){ return ""; };

/**
 * Sets the placeholder text to the current content control.
 * @memberof ApiBlockLvlSdt
 * @param {string} text - The text that will be set to the current content control.
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/SetPlaceholderText.js
 */
ApiBlockLvlSdt.prototype.SetPlaceholderText = function(text){ return true; };

/**
 * Returns the content control position within its parent element.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {Number} - returns -1 if the content control parent doesn't exist. 
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/GetPosInParent.js
 */
ApiBlockLvlSdt.prototype.GetPosInParent = function(){ return 0; };

/**
 * Replaces the current content control with a new element.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @param {DocumentElement} oElement - The element to replace the current content control with.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/ReplaceByElement.js
 */
ApiBlockLvlSdt.prototype.ReplaceByElement = function(oElement){ return true; };

/**
 * Adds a comment to the current block content control.
 * <note>Please note that the current block content control must be in the document.</note>
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @param {string} text - The comment text.
 * @param {string} [author] - The author's name.
 * @param {string} [userId] - The user ID of the comment author.
 * @returns {ApiComment} - Returns null if the comment was not added.
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/AddComment.js
 */
ApiBlockLvlSdt.prototype.AddComment = function(text, author, userId){ return new ApiComment(); };

/**
 * Adds a caption paragraph after (or before) the current content control.
 * <note>Please note that the current content control must be in the document (not in the footer/header).
 * And if the current content control is placed in a shape, then a caption is added after (or before) the parent shape.</note>
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @param {string} additionalText - The additional text.
 * @param {CaptionLabel | String} [label="Table"] - The caption label.
 * @param {boolean} [excludeLabel=false] - Specifies whether to exclude the label from the caption.
 * @param {CaptionNumberingFormat} [numFormat="Arabic"] - The possible caption numbering format.
 * @param {boolean} [isBefore=false] - Specifies whether to insert the caption before the current content control (true) or after (false) (after/before the shape if it is placed in the shape).
 * @param {Number} [headingLvl=undefined] - The heading level (used if you want to specify the chapter number).
 * <note>If you want to specify "Heading 1", then nHeadingLvl === 0 and etc.</note>
 * @param {CaptionSep} [captionSep="hyphen"] - The caption separator (used if you want to specify the chapter number).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/AddCaption.js
 */
ApiBlockLvlSdt.prototype.AddCaption = function(additionalText, label, excludeLabel, numFormat, isBefore, headingLvl, captionSep){ return true; };

/**
 * Returns a list of values of the combo box / drop-down list content control.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {ApiContentControlList}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/GetDropdownList.js
 */
ApiBlockLvlSdt.prototype.GetDropdownList = function(){ return new ApiContentControlList(); };

/**
 * Places a cursor before/after the current content control.
 * @param {boolean} [isAfter=true] - Specifies whether a cursor will be placed before (false) or after (true) the current content control.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/MoveCursorOutside.js
 */
ApiBlockLvlSdt.prototype.MoveCursorOutside = function(isAfter){ return true; };

/**
 * Creates a copy of an block content control. Ignores comments, footnote references, complex fields.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @returns {ApiBlockLvlSdt}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/Copy.js
 */
ApiBlockLvlSdt.prototype.Copy = function(){ return new ApiBlockLvlSdt(); };

/**
 * Sets the border color to the current content control.
 * @method
 * @memberof ApiBlockLvlSdt
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @param {byte} a - Alpha color component value.
 * @typeofeditors ["CDE"]
 * @since 8.3.2
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/SetBorderColor.js
 */
ApiBlockLvlSdt.prototype.SetBorderColor = ApiInlineLvlSdt.prototype.SetBorderColor;{ return true; };

/**
 * Returns the border color of the current content control.
 * @method
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @since 8.3.2
 * @returns {null | {r:byte, g:byte, b:byte, a:byte}}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/GetBorderColor.js
 */
ApiBlockLvlSdt.prototype.GetBorderColor = ApiInlineLvlSdt.prototype.GetBorderColor;{ return null; };

/**
 * Sets the background color to the current content control.
 * @memberof ApiBlockLvlSdt
 * @method
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @param {byte} a - Alpha color component value.
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/SetBackgroundColor.js
 */
ApiBlockLvlSdt.prototype.SetBackgroundColor = ApiInlineLvlSdt.prototype.SetBackgroundColor;{ return true; };

/**
 * Returns the background color of the current content control.
 * @memberof ApiBlockLvlSdt
 * @method
 * @typeofeditors ["CDE"]
 * @since 8.3.2
 * @returns {null | {r:byte, g:byte, b:byte, a:byte}}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/GetBackgroundColor.js
 */
ApiBlockLvlSdt.prototype.GetBackgroundColor = ApiInlineLvlSdt.prototype.GetBackgroundColor;{ return null; };

/**
 * Sets the visualization of the content control.
 *
 * @method
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @param {"boundingBox"|"hidden"} type - The desired type of visualization.
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/SetAppearance.js
 */
ApiBlockLvlSdt.prototype.SetAppearance = ApiInlineLvlSdt.prototype.SetAppearance;{};

/**
 * Gets the visualization of the content control.
 *
 * @method
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @since 9.0.0
 * @returns {"boundingBox"|"hidden"} type - The type of visualization.
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/GetAppearance.js
 */
ApiBlockLvlSdt.prototype.GetAppearance = ApiInlineLvlSdt.prototype.GetAppearance;{ return ""; };

/**
 * Returns a type of the ApiFormBase class.
 * @memberof ApiFormBase
 * @typeofeditors ["CDE", "CFE"]
 * @returns {"form"}
 * @see office-js-api/Examples/{Editor}/ApiFormBase/Methods/GetClassType.js
 */
ApiFormBase.prototype.GetClassType = function(){ return ""; };

/**
 * Returns a type of the current form.
 * @memberof ApiFormBase
 * @typeofeditors ["CDE", "CFE"]
 * @returns {FormType}
 * @see office-js-api/Examples/{Editor}/ApiFormBase/Methods/GetFormType.js
 */
ApiFormBase.prototype.GetFormType = function(){ return new FormType(); };

/**
 * Returns the current form key.
 * @memberof ApiFormBase
 * @typeofeditors ["CDE", "CFE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiFormBase/Methods/GetFormKey.js
 */
ApiFormBase.prototype.GetFormKey = function(){ return ""; };

/**
 * Sets a key to the current form.
 * @memberof ApiFormBase
 * @typeofeditors ["CDE", "CFE"]
 * @param {string} sKey - Form key.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiFormBase/Methods/SetFormKey.js
 */
ApiFormBase.prototype.SetFormKey = function(sKey){ return true; };

/**
 * Returns the tip text of the current form.
 * @memberof ApiFormBase
 * @typeofeditors ["CDE", "CFE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiFormBase/Methods/GetTipText.js
 */
ApiFormBase.prototype.GetTipText = function(){ return ""; };

/**
 * Sets the tip text to the current form.
 * @memberof ApiFormBase
 * @typeofeditors ["CDE", "CFE"]
 * @param {string} sText - Tip text.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiFormBase/Methods/SetTipText.js
 */
ApiFormBase.prototype.SetTipText = function(sText){ return true; };

/**
 * Checks if the current form is required.
 * @memberof ApiFormBase
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiFormBase/Methods/IsRequired.js
 */
ApiFormBase.prototype.IsRequired = function(){ return true; };

/**
 * Specifies if the current form should be required.
 * @memberof ApiFormBase
 * @typeofeditors ["CDE", "CFE"]
 * @param {boolean} bRequired - Defines if the current form is required (true) or not (false).
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiFormBase/Methods/SetRequired.js
 */
ApiFormBase.prototype.SetRequired = function(bRequired){ return true; };

/**
 * Checks if the current form is fixed size.
 * @memberof ApiFormBase
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiFormBase/Methods/IsFixed.js
 */
ApiFormBase.prototype.IsFixed = function(){ return true; };

/**
 * Converts the current form to a fixed size form.
 * @memberof ApiFormBase
 * @param {twips} width - The wrapper shape width measured in twentieths of a point (1/1440 of an inch).
 * @param {twips} height - The wrapper shape height measured in twentieths of a point (1/1440 of an inch).
 * @param {boolean} keepPosition - Save position on the page (it can be a little bit slow, because it runs the document calculation).
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiFormBase/Methods/ToFixed.js
 */
ApiFormBase.prototype.ToFixed = function(width, height, keepPosition){ return true; };

/**
 * Converts the current form to an inline form.
 *Picture form can't be converted to an inline form, it's always a fixed size object.*
 * @memberof ApiFormBase
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiFormBase/Methods/ToInline.js
 */
ApiFormBase.prototype.ToInline = function(){ return true; };

/**
 * Sets the border color to the current form.
 * @memberof ApiFormBase
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @param {boolean} bNone - Defines that border color will not be set.
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiFormBase/Methods/SetBorderColor.js
 */
ApiFormBase.prototype.SetBorderColor = function(r, g, b, bNone){ return true; };

/**
 * Sets the background color to the current form.
 * @memberof ApiFormBase
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @param {boolean} bNone - Defines that background color will not be set.
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiFormBase/Methods/SetBackgroundColor.js
 */
ApiFormBase.prototype.SetBackgroundColor = function(r, g, b, bNone){ return true; };

/**
 * Returns the text from the current form.
 * @memberof ApiFormBase
 * @typeofeditors ["CDE", "CFE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiFormBase/Methods/GetText.js
 */
ApiFormBase.prototype.GetText = function(){ return ""; };

/**
 * Clears the current form.
 * @memberof ApiFormBase
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiFormBase/Methods/Clear.js
 */
ApiFormBase.prototype.Clear = function(){ return true; };

/**
 * Returns a shape in which the form is placed to control the position and size of the fixed size form frame.
 * The null value will be returned for the inline forms.
 * @memberof ApiFormBase
 * @typeofeditors ["CDE", "CFE"]
 * @returns {ApiShape} - returns the shape in which the form is placed.
 * @see office-js-api/Examples/{Editor}/ApiFormBase/Methods/GetWrapperShape.js
 */
ApiFormBase.prototype.GetWrapperShape = function(){ return new ApiShape(); };

/**
 * Sets the placeholder text to the current form.
 *Can't be set to checkbox or radio button.*
 * @memberof ApiFormBase
 * @param {string} sText - The text that will be set to the current form.
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiFormBase/Methods/SetPlaceholderText.js
 */
ApiFormBase.prototype.SetPlaceholderText = function(sText){ return true; };

/**
 * Sets the text properties to the current form.
 *Used if possible for this type of form*
 * @memberof ApiFormBase
 * @typeofeditors ["CDE", "CFE"]
 * @param {ApiTextPr} textPr - The text properties that will be set to the current form.
 * @returns {boolean}  
 * @see office-js-api/Examples/{Editor}/ApiFormBase/Methods/SetTextPr.js
 */
ApiFormBase.prototype.SetTextPr = function(textPr){ return true; };

/**
 * Returns the text properties from the current form.
 *Used if possible for this type of form*
 * @memberof ApiFormBase
 * @typeofeditors ["CDE", "CFE"]
 * @returns {ApiTextPr}  
 * @see office-js-api/Examples/{Editor}/ApiFormBase/Methods/GetTextPr.js
 */
ApiFormBase.prototype.GetTextPr = function(){ return new ApiTextPr(); };

/**
 * Places a cursor before/after the current form.
 * @param {boolean} [isAfter=true] - Specifies whether a cursor will be placed before (false) or after (true) the current form.
 * @memberof ApiFormBase
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiFormBase/Methods/MoveCursorOutside.js
 */
ApiFormBase.prototype.MoveCursorOutside = function(isAfter){ return true; };

/**
 * Copies the current form (copies with the shape if it exists).
 * @memberof ApiFormBase
 * @typeofeditors ["CDE", "CFE"]
 * @returns {ApiForm}
 * @see office-js-api/Examples/{Editor}/ApiFormBase/Methods/Copy.js
 */
ApiFormBase.prototype.Copy = function(){ return new ApiForm(); };

/**
 * Returns the tag attribute for the current form.
 * @memberof ApiFormBase
 * @typeofeditors ["CDE", "CFE"]
 * @since 9.0.0
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiFormBase/Methods/GetTag.js
 */
ApiFormBase.prototype.GetTag = function(){ return ""; };

/**
 * Sets the tag attribute to the current form.
 * @memberof ApiFormBase
 * @typeofeditors ["CDE", "CFE"]
 * @since 9.0.0
 * @param {string} tag - The tag which will be added to the current container.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiFormBase/Methods/SetTag.js
 */
ApiFormBase.prototype.SetTag = function(tag){ return true; };

/**
 * Returns the role of the current form.
 * @memberof ApiFormBase
 * @typeofeditors ["CDE", "CFE"]
 * @since 9.0.0
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiFormBase/Methods/GetRole.js
 */
ApiFormBase.prototype.GetRole = function(){ return ""; };

/**
 * Sets the role to the current form.
 * @memberof ApiFormBase
 * @typeofeditors ["CDE", "CFE"]
 * @since 9.0.0
 * @param {string} role - The role which will be attached to the current form.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiFormBase/Methods/SetRole.js
 */
ApiFormBase.prototype.SetRole = function(role){ return true; };

/**
 * Checks if the text field content is autofit, i.e. whether the font size adjusts to the size of the fixed size form.
 * @memberof ApiTextForm
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTextForm/Methods/IsAutoFit.js
 */
ApiTextForm.prototype.IsAutoFit = function(){ return true; };

/**
 * Specifies if the text field content should be autofit, i.e. whether the font size adjusts to the size of the fixed size form.
 * @memberof ApiTextForm
 * @param {boolean} bAutoFit - Defines if the text field content is autofit (true) or not (false).
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTextForm/Methods/SetAutoFit.js
 */
ApiTextForm.prototype.SetAutoFit = function(bAutoFit){ return true; };

/**
 * Checks if the current text field is multiline.
 * @memberof ApiTextForm
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTextForm/Methods/IsMultiline.js
 */
ApiTextForm.prototype.IsMultiline = function(){ return true; };

/**
 * Specifies if the current text field should be miltiline.
 * @memberof ApiTextForm
 * @param {boolean} bMultiline - Defines if the current text field is multiline (true) or not (false).
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean} - return false, if the text field is not fixed size.
 * @see office-js-api/Examples/{Editor}/ApiTextForm/Methods/SetMultiline.js
 */
ApiTextForm.prototype.SetMultiline = function(bMultiline){ return true; };

/**
 * Returns a limit of the text field characters.
 * @memberof ApiTextForm
 * @typeofeditors ["CDE", "CFE"]
 * @returns {number} - if this method returns -1 -> the form has no limit for characters
 * @see office-js-api/Examples/{Editor}/ApiTextForm/Methods/GetCharactersLimit.js
 */
ApiTextForm.prototype.GetCharactersLimit = function(){ return 0; };

/**
 * Sets a limit to the text field characters.
 * @memberof ApiTextForm
 * @param {number} nChars - The maximum number of characters in the text field. If this parameter is equal to -1, no limit will be set.
 * A limit is required to be set if a comb of characters is applied.
 * Maximum value for this parameter is 1000000.
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTextForm/Methods/SetCharactersLimit.js
 */
ApiTextForm.prototype.SetCharactersLimit = function(nChars){ return true; };

/**
 * Checks if the text field is a comb of characters with the same cell width.
 * @memberof ApiTextForm
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTextForm/Methods/IsComb.js
 */
ApiTextForm.prototype.IsComb = function(){ return true; };

/**
 * Specifies if the text field should be a comb of characters with the same cell width.
 * The maximum number of characters must be set to a positive value.
 * @memberof ApiTextForm
 * @param {boolean} bComb - Defines if the text field is a comb of characters (true) or not (false).
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTextForm/Methods/SetComb.js
 */
ApiTextForm.prototype.SetComb = function(bComb){ return true; };

/**
 * Sets the cell width to the applied comb of characters.
 * @memberof ApiTextForm
 * @param {mm} [nCellWidth=0] - The cell width measured in millimeters.
 * If this parameter is not specified or equal to 0 or less, then the width will be set automatically. Must be >= 1 and <= 558.8.
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTextForm/Methods/SetCellWidth.js
 */
ApiTextForm.prototype.SetCellWidth = function(nCellWidth){ return true; };

/**
 * Sets the text to the current text field.
 * @memberof ApiTextForm
 * @param {string} sText - The text that will be set to the current text field.
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiTextForm/Methods/SetText.js
 */
ApiTextForm.prototype.SetText = function(sText){ return true; };

/**
 * Returns the current scaling condition of the picture form.
 * @memberof ApiPictureForm
 * @typeofeditors ["CDE", "CFE"]
 * @returns {ScaleFlag}
 * @see office-js-api/Examples/{Editor}/ApiPictureForm/Methods/GetScaleFlag.js
 */
ApiPictureForm.prototype.GetScaleFlag = function(){ return new ScaleFlag(); };

/**
 * Sets the scaling condition to the current picture form.
 * @memberof ApiPictureForm
 * @param {ScaleFlag} sScaleFlag - Picture scaling condition: "always", "never", "tooBig" or "tooSmall".
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiPictureForm/Methods/SetScaleFlag.js
 */
ApiPictureForm.prototype.SetScaleFlag = function(sScaleFlag){ return true; };

/**
 * Locks the aspect ratio of the current picture form.
 * @memberof ApiPictureForm
 * @param {boolean} [isLock=true] - Specifies if the aspect ratio of the current picture form will be locked (true) or not (false).
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiPictureForm/Methods/SetLockAspectRatio.js
 */
ApiPictureForm.prototype.SetLockAspectRatio = function(isLock){ return true; };

/**
 * Checks if the aspect ratio of the current picture form is locked or not.
 * @memberof ApiPictureForm
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiPictureForm/Methods/IsLockAspectRatio.js
 */
ApiPictureForm.prototype.IsLockAspectRatio = function(){ return true; };

/**
 * Sets the picture position inside the current form:
 * <b>0</b> - the picture is placed on the left/top;
 * <b>50</b> - the picture is placed in the center;
 * <b>100</b> - the picture is placed on the right/bottom.
 * @memberof ApiPictureForm
 * @param {percentage} nShiftX - Horizontal position measured in percent.
 * @param {percentage} nShiftY - Vertical position measured in percent.
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiPictureForm/Methods/SetPicturePosition.js
 */
ApiPictureForm.prototype.SetPicturePosition = function(nShiftX, nShiftY){ return true; };

/**
 * Returns the picture position inside the current form.
 * @memberof ApiPictureForm
 * @typeofeditors ["CDE", "CFE"]
 * @returns {Array.<percentage>} Array of two numbers [shiftX, shiftY]
 * @see office-js-api/Examples/{Editor}/ApiPictureForm/Methods/GetPicturePosition.js
 */
ApiPictureForm.prototype.GetPicturePosition = function(){ return []; };

/**
 * Respects the form border width when scaling the image.
 * @memberof ApiPictureForm
 * @param {boolean} [isRespect=true] - Specifies if the form border width will be respected (true) or not (false).
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiPictureForm/Methods/SetRespectBorders.js
 */
ApiPictureForm.prototype.SetRespectBorders = function(isRespect){ return true; };

/**
 * Checks if the form border width is respected or not.
 * @memberof ApiPictureForm
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiPictureForm/Methods/IsRespectBorders.js
 */
ApiPictureForm.prototype.IsRespectBorders = function(){ return true; };

/**
 * Returns an image in the base64 format from the current picture form.
 * @memberof ApiPictureForm
 * @typeofeditors ["CDE", "CFE"]
 * @returns {Base64Img}
 * @see office-js-api/Examples/{Editor}/ApiPictureForm/Methods/GetImage.js
 */
ApiPictureForm.prototype.GetImage = function(){ return base64img; };

/**
 * Sets an image to the current picture form.
 * @memberof ApiPictureForm
 * @param {string} sImageSrc - The image source where the image to be inserted should be taken from (currently, only internet URL or base64 encoded images are supported).
 * @param {EMU} nWidth - The image width in English measure units.
 * @param {EMU} nHeight - The image height in English measure units.
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiPictureForm/Methods/SetImage.js
 */
ApiPictureForm.prototype.SetImage = function(sImageSrc, nWidth, nHeight){ return true; };

/**
 * Returns the list values from the current combo box.
 * @memberof ApiComboBoxForm
 * @typeofeditors ["CDE", "CFE"]
 * @returns {string[]}
 * @see office-js-api/Examples/{Editor}/ApiComboBoxForm/Methods/GetListValues.js
 */
ApiComboBoxForm.prototype.GetListValues = function(){ return [""]; };

/**
 * Sets the list values to the current combo box.
 * @memberof ApiComboBoxForm
 * @param {string[]} aListString - The combo box list values.
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiComboBoxForm/Methods/SetListValues.js
 */
ApiComboBoxForm.prototype.SetListValues = function(aListString){ return true; };

/**
 * Selects the specified value from the combo box list values. 
 * @memberof ApiComboBoxForm
 * @param {string} sValue - The combo box list value that will be selected.
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiComboBoxForm/Methods/SelectListValue.js
 */
ApiComboBoxForm.prototype.SelectListValue = function(sValue){ return true; };

/**
 * Sets the text to the current combo box.
 *Available only for editable combo box forms.*
 * @memberof ApiComboBoxForm
 * @param {string} sText - The combo box text.
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiComboBoxForm/Methods/SetText.js
 */
ApiComboBoxForm.prototype.SetText = function(sText){ return true; };

/**
 * Checks if the combo box text can be edited. If it is not editable, then this form is a drop-down list.
 * @memberof ApiComboBoxForm
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiComboBoxForm/Methods/IsEditable.js
 */
ApiComboBoxForm.prototype.IsEditable = function(){ return true; };

/**
 * Checks the current checkbox.
 * @memberof ApiCheckBoxForm
 * @param {boolean} isChecked - Specifies if the current checkbox will be checked (true) or not (false).
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiCheckBoxForm/Methods/SetChecked.js
 */
ApiCheckBoxForm.prototype.SetChecked = function(isChecked){ return true; };

/**
 * Returns the state of the current checkbox (checked or not).
 * @memberof ApiCheckBoxForm
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiCheckBoxForm/Methods/IsChecked.js
 */
ApiCheckBoxForm.prototype.IsChecked = function(){ return true; };

/**
 * Checks if the current checkbox is a radio button. 
 * @memberof ApiCheckBoxForm
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiCheckBoxForm/Methods/IsRadioButton.js
 */
ApiCheckBoxForm.prototype.IsRadioButton = function(){ return true; };

/**
 * Returns the radio group key if the current checkbox is a radio button.
 * @memberof ApiCheckBoxForm
 * @typeofeditors ["CDE", "CFE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiCheckBoxForm/Methods/GetRadioGroup.js
 */
ApiCheckBoxForm.prototype.GetRadioGroup = function(){ return ""; };

/**
 * Sets the radio group key to the current radio button.
 * @memberof ApiCheckBoxForm
 * @param {string} sKey - Radio group key.
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiCheckBoxForm/Methods/SetRadioGroup.js
 */
ApiCheckBoxForm.prototype.SetRadioGroup = function(sKey){ return true; };

/**
 * Returns the choice name of the current radio button.
 * @memberof ApiCheckBoxForm
 * @typeofeditors ["CDE", "CFE"]
 * @since 8.3.2
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiCheckBoxForm/Methods/GetChoiceName.js
 * */
ApiCheckBoxForm.prototype.GetChoiceName = function(){ return ""; };

/**
 * Sets the choice name for the current radio button.
 * @memberof ApiCheckBoxForm
 * @param {string} choiceName - The radio button choice name.
 * @typeofeditors ["CDE", "CFE"]
 * @since 8.3.2
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiCheckBoxForm/Methods/SetChoiceName.js
 * */
ApiCheckBoxForm.prototype.SetChoiceName = function(choiceName){ return true; };

/**
 * Gets the date format of the current form.
 * @memberof ApiDateForm
 * @typeofeditors ["CDE", "CFE"]
 * @returns {string}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiDateForm/Methods/GetFormat.js
 */
ApiDateForm.prototype.GetFormat = function() { return ""; };

/**
 * Sets the date format to the current form.
 * @memberof ApiDateForm
 * @typeofeditors ["CDE", "CFE"]
 * @param {string} sFormat - The date format. For example, mm.dd.yyyy
 * @returns {boolean}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiDateForm/Methods/SetFormat.js
 */
ApiDateForm.prototype.SetFormat = function(sFormat){ return true; };

/**
 * Gets the used date language of the current form.
 * @memberof ApiDateForm
 * @typeofeditors ["CDE", "CFE"]
 * @returns {string}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiDateForm/Methods/GetLanguage.js
 */
ApiDateForm.prototype.GetLanguage = function() { return ""; };

/**
 * Sets the date language to the current form.
 * @memberof ApiDateForm
 * @typeofeditors ["CDE", "CFE"]
 * @param {string} sLangId - The date language. The possible value for this parameter is a language identifier as defined in
 * RFC 4646/BCP 47. Example: "en-CA".
 * @returns {boolean}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiDateForm/Methods/SetLanguage.js
 */
ApiDateForm.prototype.SetLanguage = function(sLangId){ return true; };

/**
 * Returns the timestamp of the current form.
 * @memberof ApiDateForm
 * @typeofeditors ["CDE", "CFE"]
 * @returns {number}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiDateForm/Methods/GetTime.js
 */
ApiDateForm.prototype.GetTime = function(){ return 0; };

/**
 * Sets the timestamp to the current form.
 * @memberof ApiDateForm
 * @typeofeditors ["CDE", "CFE"]
 * @param {number} nTimeStamp The timestamp that will be set to the current date form.
 * @returns {boolean}
 * @since 8.1.0
 * @see office-js-api/Examples/{Editor}/ApiDateForm/Methods/SetTime.js
 */
ApiDateForm.prototype.SetTime = function(nTimeStamp){ return true; };

/**
 * Sets the date to the current form.
 * @memberof ApiDateForm
 * @typeofeditors ["CDE", "CFE"]
 * @param {Date | string} date - The date object or the date in the string format.
 * @returns {boolean}
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiDateForm/Methods/SetDate.js
 */
ApiDateForm.prototype.SetDate = function(date){ return true; };

/**
 * Returns the date of the current form.
 * @memberof ApiDateForm
 * @typeofeditors ["CDE", "CFE"]
 * @returns {Date} - The date object.
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiDateForm/Methods/GetDate.js
 */
ApiDateForm.prototype.GetDate = function(){ return new Date(); };

/**
 * Appends the text content of the given form to the end of the current complex form.
 * @memberof ApiComplexForm
 * @param value {string | ApiDateForm | ApiPictureForm | ApiCheckBoxForm | ApiComboBoxForm | ApiTextForm} - The text or the form to add.
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiComplexForm/Methods/Add.js
 */
ApiComplexForm.prototype.Add = function(value){ return true; };

/**
 * Returns an ordered list of subforms.
 * @memberof ApiComplexForm
 * @typeofeditors ["CDE", "CFE"]
 * @returns {ApiForm[]}
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiComplexForm/Methods/GetSubForms.js
 */
ApiComplexForm.prototype.GetSubForms = function(){ return [new ApiForm()]; };

/**
 * Clears all content from the current complex form, resetting it to its placeholder state.
 * @memberof ApiComplexForm
 * @typeofeditors ["CDE", "CFE"]
 * @returns {boolean}
 * @since 9.0.0
 * @see office-js-api/Examples/{Editor}/ApiComplexForm/Methods/ClearContent.js
 */
ApiComplexForm.prototype.ClearContent = function(){ return true; };

/**
 * Converts the ApiBlockLvlSdt object into the JSON object.
 * @memberof ApiBlockLvlSdt
 * @typeofeditors ["CDE"]
 * @param {boolean} bWriteNumberings - Specifies if the used numberings will be written to the JSON object or not.
 * @param {boolean} bWriteStyles - Specifies if the used styles will be written to the JSON object or not.
 * @returns {JSON}
 * @see office-js-api/Examples/{Editor}/ApiBlockLvlSdt/Methods/ToJSON.js
 */
ApiBlockLvlSdt.prototype.ToJSON = function(bWriteNumberings, bWriteStyles){ return new JSON(); };

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
 * Converts a document to Markdown or HTML text.
 * @memberof ApiInterface
 * @typeofeditors ["CDE"]
 * @param {"markdown" | "html"} [convertType="markdown"] - Conversion type.
 * @param {boolean} [htmlHeadings=false] - Defines if the HTML headings and IDs will be generated when the Markdown renderer of your target platform does not handle Markdown-style IDs.
 * @param {boolean} [base64img=false] - Defines if the images will be created in the base64 format.
 * @param {boolean} [demoteHeadings=false] - Defines if all heading levels in your document will be demoted to conform with the following standard: single H1 as title, H2 as top-level heading in the text body.
 * @param {boolean} [renderHTMLTags=false] - Defines if HTML tags will be preserved in your Markdown. If you just want to use an occasional HTML tag, you can avoid using the opening angle bracket
 * in the following way: \<tag&gt;text\</tag&gt;. By default, the opening angle brackets will be replaced with the special characters.
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/Api/Methods/ConvertDocument.js
 */
ApiInterface.prototype.ConvertDocument = function(convertType, htmlHeadings, base64img, demoteHeadings, renderHTMLTags){ return ""; };

/**
 * Creates the empty text properties.
 * @memberof ApiInterface
 * @typeofeditors ["CDE", "CSE", "CPE"]
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateTextPr.js
 */
ApiInterface.prototype.CreateTextPr = function(){ return new ApiTextPr(); };

/**
 * Creates a Text Art object with the parameters specified.
 * @memberof ApiInterface
 * @typeofeditors ["CDE"]
 * @param {ApiTextPr} [textPr=Api.CreateTextPr()] - The text properties.
 * @param {string} [text="Your text here"] - The text for the Text Art object.
 * @param {TextTransform} [transform="textNoShape"] - Text transform type.
 * @param {ApiFill}   [fill=Api.CreateNoFill()] - The color or pattern used to fill the Text Art object.
 * @param {ApiStroke} [stroke=Api.CreateStroke(0, Api.CreateNoFill())] - The stroke used to create the Text Art object shadow.
 * @param {number} [rotAngle=0] - Rotation angle.
 * @param {EMU} [width=1828800] - The Text Art width measured in English measure units.
 * @param {EMU} [height=1828800] - The Text Art heigth measured in English measure units.
 * @returns {ApiDrawing}
 * @see office-js-api/Examples/{Editor}/Api/Methods/CreateWordArt.js
 */
ApiInterface.prototype.CreateWordArt = function(textPr, text, transform, fill, stroke, rotAngle, width, height){ return new ApiDrawing(); };

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
 * Returns the current comment ID. If the comment doesn't have an ID, null is returned.
 * @memberof ApiComment
 * @typeofeditors ["CDE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiComment/Methods/GetId.js
 */
ApiComment.prototype.GetId = function (){ return ""; };

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
 * Returns the specified comment reply.
 * @memberof ApiComment
 * @typeofeditors ["CDE"]
 * @param {Number} [nIndex = 0] - The comment reply index.
 * @returns {ApiCommentReply}
 * @see office-js-api/Examples/{Editor}/ApiComment/Methods/GetReply.js
 */
ApiComment.prototype.GetReply = function (nIndex) { return new ApiCommentReply(); };

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
 * Returns the user ID of the comment reply author.
 * @memberof ApiCommentReply
 * @typeofeditors ["CDE"]
 * @returns {string}
 * @see office-js-api/Examples/{Editor}/ApiCommentReply/Methods/GetUserId.js
 */
ApiCommentReply.prototype.GetUserId = function () { return ""; };

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
 * Returns a type of the ApiWatermarkSettings class.
 * @memberof ApiWatermarkSettings
 * @typeofeditors ["CDE"]
 * @returns {"watermarkSettings"}
 * @see office-js-api/Examples/{Editor}/ApiWatermarkSettings/Methods/GetClassType.js
 */
ApiWatermarkSettings.prototype.GetClassType = function(){ return ""; };

/**
 * Sets the type of the watermark in the document.
 * @memberof ApiWatermarkSettings
 * @typeofeditors ["CDE"]
 * @param {WatermarkType} sType - The watermark type.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiWatermarkSettings/Methods/SetType.js
 */
ApiWatermarkSettings.prototype.SetType = function (sType){ return true; };

/**
 * Returns the type of the watermark in the document.
 * @memberof ApiWatermarkSettings
 * @typeofeditors ["CDE"]
 * @returns {WatermarkType}
 * @see office-js-api/Examples/{Editor}/ApiWatermarkSettings/Methods/GetType.js
 */
ApiWatermarkSettings.prototype.GetType = function (){ return new WatermarkType(); };

/**
 * Sets the text of the watermark in the document.
 * @memberof ApiWatermarkSettings
 * @typeofeditors ["CDE"]
 * @param {string} sText - The watermark text.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiWatermarkSettings/Methods/SetText.js
 */
ApiWatermarkSettings.prototype.SetText = function (sText){ return true; };

/**
 * Returns the text of the watermark in the document.
 * @memberof ApiWatermarkSettings
 * @typeofeditors ["CDE"]
 * @returns {string | null}
 * @see office-js-api/Examples/{Editor}/ApiWatermarkSettings/Methods/GetText.js
 */
ApiWatermarkSettings.prototype.GetText = function (){ return ""; };

/**
 * Sets the text properties of the watermark in the document.
 * @memberof ApiWatermarkSettings
 * @typeofeditors ["CDE"]
 * @param {ApiTextPr} oTextPr - The watermark text properties.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiWatermarkSettings/Methods/SetTextPr.js
 */
ApiWatermarkSettings.prototype.SetTextPr = function (oTextPr){ return true; };

/**
 * Returns the text properties of the watermark in the document.
 * @memberof ApiWatermarkSettings
 * @typeofeditors ["CDE"]
 * @returns {ApiTextPr}
 * @see office-js-api/Examples/{Editor}/ApiWatermarkSettings/Methods/GetTextPr.js
 */
ApiWatermarkSettings.prototype.GetTextPr = function (){ return new ApiTextPr(); };

/**
 * Sets the opacity of the watermark in the document.
 * @memberof ApiWatermarkSettings
 * @typeofeditors ["CDE"]
 * @param {number} nOpacity - The watermark opacity. This value must be from 0 to 255.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiWatermarkSettings/Methods/SetOpacity.js
 */
ApiWatermarkSettings.prototype.SetOpacity = function (nOpacity){ return true; };

/**
 * Returns the opacity of the watermark in the document.
 * @memberof ApiWatermarkSettings
 * @typeofeditors ["CDE"]
 * @returns {number} - The watermark opacity. This value must be from 0 to 255.
 * @see office-js-api/Examples/{Editor}/ApiWatermarkSettings/Methods/GetOpacity.js
 */
ApiWatermarkSettings.prototype.GetOpacity = function (){ return 0; };

/**
 * Sets the direction of the watermark in the document.
 * @memberof ApiWatermarkSettings
 * @typeofeditors ["CDE"]
 * @param {WatermarkDirection} sDirection - The watermark direction.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiWatermarkSettings/Methods/SetDirection.js
 */
ApiWatermarkSettings.prototype.SetDirection = function (sDirection){ return true; };

/**
 * Returns the direction of the watermark in the document.
 * @memberof ApiWatermarkSettings
 * @typeofeditors ["CDE"]
 * @returns {WatermarkDirection} - The watermark direction.
 * @see office-js-api/Examples/{Editor}/ApiWatermarkSettings/Methods/GetDirection.js
 */
ApiWatermarkSettings.prototype.GetDirection = function (){ return new WatermarkDirection(); };

/**
 * Sets the image URL of the watermark in the document.
 * @memberof ApiWatermarkSettings
 * @typeofeditors ["CDE"]
 * @param {string} sURL - The watermark image URL.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiWatermarkSettings/Methods/SetImageURL.js
 */
ApiWatermarkSettings.prototype.SetImageURL = function (sURL){ return true; };

/**
 * Returns the image URL of the watermark in the document.
 * @memberof ApiWatermarkSettings
 * @typeofeditors ["CDE"]
 * @returns {string | null} - The watermark image URL.
 * @see office-js-api/Examples/{Editor}/ApiWatermarkSettings/Methods/GetImageURL.js
 */
ApiWatermarkSettings.prototype.GetImageURL = function (){ return ""; };

/**
 * Returns the width of the watermark image in the document.
 * @memberof ApiWatermarkSettings
 * @typeofeditors ["CDE"]
 * @returns {EMU | null} - The watermark image width in EMU.
 * @see office-js-api/Examples/{Editor}/ApiWatermarkSettings/Methods/GetImageWidth.js
 */
ApiWatermarkSettings.prototype.GetImageWidth = function (){ return new EMU(); };

/**
 * Returns the height of the watermark image in the document.
 * @memberof ApiWatermarkSettings
 * @typeofeditors ["CDE"]
 * @returns {EMU | null} - The watermark image height in EMU.
 * @see office-js-api/Examples/{Editor}/ApiWatermarkSettings/Methods/GetImageHeight.js
 */
ApiWatermarkSettings.prototype.GetImageHeight = function (){ return new EMU(); };

/**
 * Sets the size (width and height) of the watermark image in the document.
 * @memberof ApiWatermarkSettings
 * @typeofeditors ["CDE"]
 * @param {EMU} nWidth - The watermark image width.
 * @param {EMU} nHeight - The watermark image height.
 * @returns {boolean}
 * @see office-js-api/Examples/{Editor}/ApiWatermarkSettings/Methods/SetImageSize.js
 */
ApiWatermarkSettings.prototype.SetImageSize = function (nWidth, nHeight){ return true; };

/**
 * Moves a cursor to the current bookmark.
 * @memberof ApiBookmark
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiBookmark/Methods/GoTo.js
 */
ApiBookmark.prototype.GoTo = function(){ return true; };

/**
 * Selects the current bookmark.
 * @memberof ApiBookmark
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiBookmark/Methods/Select.js
 */
ApiBookmark.prototype.Select = function(){ return true; };

/**
 * Changes the bookmark name.
 * @memberof ApiBookmark
 * @typeofeditors ["CDE"]
 * @param {string} sNewName - A new bookmark name.
 * @returns {boolean}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiBookmark/Methods/SetName.js
 */
ApiBookmark.prototype.SetName = function(sNewName){ return true; };

/**
 * Returns the bookmark name.
 * @memberof ApiBookmark
 * @typeofeditors ["CDE"]
 * @returns {string}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiBookmark/Methods/GetName.js
 */
ApiBookmark.prototype.GetName = function(){ return ""; };

/**
 * Sets the bookmark text.
 * @memberof ApiBookmark
 * @typeofeditors ["CDE"]
 * @param {string} sText - The bookmark text.
 * @returns {boolean}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiBookmark/Methods/SetText.js
 */
ApiBookmark.prototype.SetText = function(sText){ return true; };

/**
 * Returns the bookmark text.
 * @memberof ApiBookmark
 * @typeofeditors ["CDE"]
 * @param {object} oPr - The resulting string display properties.
 * @param {boolean} [oPr.Numbering=false] - Defines if the resulting string will include numbering or not.
 * @param {boolean} [oPr.Math=false] - Defines if the resulting string will include mathematical expressions or not.
 * @param {string} [oPr.NewLineSeparator='\r'] - Defines how the line separator will be specified in the resulting string. Any symbol can be used. The default separator is "\r".
 * @param {string} [oPr.TableCellSeparator='\t'] - Defines how the table cell separator will be specified in the resulting string. Any symbol can be used. The default separator is "\t".
 * @param {string} [oPr.TableRowSeparator='\r\n'] - Defines how the table row separator will be specified in the resulting string. Any symbol can be used. The default separator is "\r\n".
 * @param {string} [oPr.ParaSeparator='\r\n'] - Defines how the paragraph separator will be specified in the resulting string. Any symbol can be used. The default separator is "\r\n".
 * @param {string} [oPr.TabSymbol='\t'] - Defines how the tab will be specified in the resulting string (does not apply to numbering). Any symbol can be used. The default symbol is "\t".
 * @returns {string}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiBookmark/Methods/GetText.js
 */
ApiBookmark.prototype.GetText = function(oPr){ return ""; };

/**
 * Returns the bookmark range.
 * @memberof ApiBookmark
 * @typeofeditors ["CDE"]
 * @returns {ApiRange}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiBookmark/Methods/GetRange.js
 */
ApiBookmark.prototype.GetRange = function(){ return new ApiRange(); };

/**
 * Deletes the current bookmark from the document.
 * @memberof ApiBookmark
 * @typeofeditors ["CDE"]
 * @returns {boolean}
 * @since 8.3.0
 * @see office-js-api/Examples/{Editor}/ApiBookmark/Methods/Delete.js
 */
ApiBookmark.prototype.Delete = function(){ return true; };

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
 * Common form properties.
 * @typedef {Object} FormPrBase
 * @property {string} key - Form key.
 * @property {string} tip - Form tip text.
 * @property {string} tag - Form tag.
 * @property {boolean} required - Specifies if the form is required or not.
 * @property {string} placeholder - Form placeholder text.
 * @see office-js-api/Examples/Enumerations/FormPrBase.js
 */

/**
 * Specific text field properties.
 * @typedef {Object} TextFormPrBase
 * @property {boolean} comb - Specifies if the text field should be a comb of characters with the same cell width. The maximum number of characters must be set to a positive value.
 * @property {number} maxCharacters - The maximum number of characters in the text field.
 * @property {number} cellWidth - The cell width for each character measured in millimeters. If this parameter is not specified or equal to 0 or less, then the width will be set automatically.
 * @property {boolean} multiLine - Specifies if the current fixed size text field is multiline or not.
 * @property {boolean} autoFit - Specifies if the text field content should be autofit, i.e. whether the font size adjusts to the size of the fixed size form.
 * @see office-js-api/Examples/Enumerations/TextFormPrBase.js
 */

/**
 * Text field properties.
 * @typedef {FormPrBase | TextFormPrBase} TextFormPr
 * @see office-js-api/Examples/Enumerations/TextFormPr.js
 */

/**
 * Form insertion specific properties.
 * @typedef {Object} FormInsertPr
 * @property {boolean} [placeholderFromSelection=false] - Specifies if the currently selected text should be saved as a placeholder of the inserted form.
 * @property {boolean} [keepSelectedTextInForm=true] - Specifies if the currently selected text should be saved as the content of the inserted form.
 * @see office-js-api/Examples/Enumerations/FormInsertPr.js
 */

/**
 * Properties for inserting a text field.
 * @typedef {FormPrBase | TextFormPrBase | FormInsertPr} TextFormInsertPr
 * @see office-js-api/Examples/Enumerations/TextFormInsertPr.js
 */

/**
 * Specific checkbox / radio button properties.
 * @typedef {Object} CheckBoxFormPrBase
 * @property {boolean} radio - Specifies if the current checkbox is a radio button. In this case, the key parameter is considered as an identifier for the group of radio buttons.
 * @see office-js-api/Examples/Enumerations/CheckBoxFormPrBase.js
 */

/**
 * Checkbox / radio button properties.
 * @typedef {FormPrBase | CheckBoxFormPrBase} CheckBoxFormPr
 * @see office-js-api/Examples/Enumerations/CheckBoxFormPr.js
 */

/**
 * Specific combo box / dropdown list properties.
 * @typedef {Object} ComboBoxFormPrBase
 * @property {boolean} editable - Specifies if the combo box text can be edited.
 * @property {boolean} autoFit - Specifies if the combo box form content should be autofit, i.e. whether the font size adjusts to the size of the fixed size form.
 * @property {Array.<string | Array.<string>>} items - The combo box items.
В  В  В * This array consists of strings or arrays of two strings where the first string is the displayed value and the second one is its meaning.
В  В  В * If the array consists of single strings, then the displayed value and its meaning are the same.
В  В  В * Example: ["First", ["Second", "2"], ["Third", "3"], "Fourth"].

 * @see office-js-api/Examples/Enumerations/ComboBoxFormPrBase.js
 */

/**
 * Combo box / dropdown list properties.
 * @typedef {FormPrBase | ComboBoxFormPrBase} ComboBoxFormPr
 * @see office-js-api/Examples/Enumerations/ComboBoxFormPr.js
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
 * Specific picture form properties.
 * @typedef {Object} PictureFormPrBase
 * @property {ScaleFlag} scaleFlag - The condition to scale an image in the picture form: "always", "never", "tooBig" or "tooSmall".
 * @property {boolean} lockAspectRatio - Specifies if the aspect ratio of the picture form is locked or not.
 * @property {boolean} respectBorders - Specifies if the form border width is respected or not when scaling the image.
 * @property {percentage} shiftX - Horizontal picture position inside the picture form measured in percent:
 * <b>0</b> - the picture is placed on the left;
 * <b>50</b> - the picture is placed in the center;
 * <b>100</b> - the picture is placed on the right.
 * @property {percentage} shiftY - Vertical picture position inside the picture form measured in percent:
 * <b>0</b> - the picture is placed on top;
 * <b>50</b> - the picture is placed in the center;
 * <b>100</b> - the picture is placed on the bottom.
 * @see office-js-api/Examples/Enumerations/PictureFormPrBase.js
 */

/**
 * Picture form properties.
 * @typedef {FormPrBase | PictureFormPrBase} PictureFormPr
 * @see office-js-api/Examples/Enumerations/PictureFormPr.js
 */

/**
 * Specific date form properties.
 * @typedef {Object} DateFormPrBase
 * @property {string} format- The date format, ex: mm.dd.yyyy
 * @property {string} lang- The date language. Possible value for this parameter is a language identifier as defined by
 * RFC 4646/BCP 47. Example: "en-CA".
 * @see office-js-api/Examples/Enumerations/DateFormPrBase.js
 */

/**
 * Date form properties.
 * @typedef {FormPrBase | DateFormPrBase} DateFormPr
 * @see office-js-api/Examples/Enumerations/DateFormPr.js
 */

/**
 * Creates a text field with the specified text field properties.
 * @memberof ApiInterface
 * @typeofeditors ["CDE", "CFE"]
 * @param {TextFormPr} oFormPr - Text field properties.
 * @returns {ApiTextForm}
 * @see office-js-api/Examples/Forms/Api/Methods/CreateTextForm.js
 */
ApiInterface.prototype.CreateTextForm = function(oFormPr){ return new ApiTextForm(); };

/**
 * Creates a checkbox / radio button with the specified checkbox / radio button properties.
 * @memberof ApiInterface
 * @typeofeditors ["CDE", "CFE"]
 * @param {CheckBoxFormPr} oFormPr - Checkbox / radio button properties.
 * @returns {ApiCheckBoxForm}
 * @see office-js-api/Examples/Forms/Api/Methods/CreateCheckBoxForm.js
 */
ApiInterface.prototype.CreateCheckBoxForm = function(oFormPr){ return new ApiCheckBoxForm(); };

/**
 * Creates a combo box / dropdown list with the specified combo box / dropdown list properties.
 * @memberof ApiInterface
 * @typeofeditors ["CDE", "CFE"]
 * @param {ComboBoxFormPr} oFormPr - Combo box / dropdown list properties.
 * @returns {ApiComboBoxForm}
 * @see office-js-api/Examples/Forms/Api/Methods/CreateComboBoxForm.js
 */
ApiInterface.prototype.CreateComboBoxForm = function(oFormPr){ return new ApiComboBoxForm(); };

/**
 * Creates a picture form with the specified picture form properties.
 * @memberof ApiInterface
 * @typeofeditors ["CDE", "CFE"]
 * @param {PictureFormPr} oFormPr - Picture form properties.
 * @returns {ApiPictureForm}
 * @see office-js-api/Examples/Forms/Api/Methods/CreatePictureForm.js
 */
ApiInterface.prototype.CreatePictureForm = function(oFormPr){ return new ApiPictureForm(); };

/**
 * Creates a date form with the specified date form properties.
 * @memberof ApiInterface
 * @typeofeditors ["CDE", "CFE"]
 * @param {DateFormPr} oFormPr - Date form properties.
 * @returns {ApiDateForm}
 * @see office-js-api/Examples/Forms/Api/Methods/CreateDateForm.js
 */
ApiInterface.prototype.CreateDateForm = function(oFormPr){ return new ApiDateForm(); };


