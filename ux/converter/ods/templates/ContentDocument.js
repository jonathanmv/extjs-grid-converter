Ext.define('Ext.ux.converter.ods.templates.ContentDocument', {
    extend: 'Ext.ux.converter.ods.templates.OfficeDocument',

    documentType: 'content',

    bodyTemplate: [
        '{stylesTemplate}',
        '<office:body>',
        '   <office:spreadsheet>',
        '       {tableTemplate}',
        '   </office:spreadsheet>',
        '</office:body>'
    ],

    stylesTemplate: [
        '<office:font-face-decls>',
        '   <style:font-face style:name="Calibri" svg:font-family="Calibri"/>',
        '</office:font-face-decls>',

        '<office:automatic-styles>',
        '    <style:style style:data-style-name="N0" style:family="table-cell" style:name="ce1" style:parent-style-name="Default"/>',
        '    <style:style style:data-style-name="N20" style:family="table-cell" style:name="ce2" style:parent-style-name="Default"/>',
        '    <style:style style:data-style-name="N0" style:family="table-cell" style:name="ce3" style:parent-style-name="Default">',
        '        <style:text-properties fo:font-weight="bold" style:font-weight-asian="bold" style:font-weight-complex="bold"/>',
        '    </style:style>',
        '    <style:style style:family="table-column" style:name="co1">',
        '        <style:table-column-properties fo:break-before="auto" style:column-width="1.69333333333333cm"/>',
        '    </style:style>',
        '    <style:style style:family="table-column" style:name="co2">',
        '        <style:table-column-properties fo:break-before="auto" style:column-width="2.206875cm" style:use-optimal-column-width="true"/>',
        '    </style:style>',
        '    <style:style style:family="table-row" style:name="ro1">',
        '        <style:table-row-properties fo:break-before="auto" style:row-height="15pt" style:use-optimal-row-height="true"/>',
        '    </style:style>',
        '    <style:style style:family="table" style:master-page-name="mp1" style:name="ta1">',
        '        <style:table-properties style:writing-mode="lr-tb" table:display="true"/>',
        '    </style:style>',
        '</office:automatic-styles>'
    ],

    tableTemplate: [
        '<table:table table:name="{tableName}">',
        '   {headerRow}',
        '   {bodyRows}',
        '</table:table>'
    ],

    headerRowTemplate: [
        '<table:table-row>',
        '   <tpl for="headerColumns">',
        '       <tpl if="isCoveredCell === true">',
        '           <table:covered-table-cell ' +
        '               table:number-columns-repeated="{numberColumnsRepeated}"/>',
        '       <tpl else>',
        '           <table:table-cell ',
        '               table:number-columns-spanned="{numberColumnsSpanned}"',
        '               table:number-rows-spanned="{numberRowsSpanned}"',
        '               table:style-name="ce3"',
        '               office:value-type="string">',
        '                   <text:p>{officeValue}</text:p>',
        '           </table:table-cell>',
        '       </tpl>',
        '   </tpl>',
        '</table:table-row>'
    ],

    bodyRowsTemplate: [
        '<table:table-row>',
        '   <tpl for="rowCells">',
        '       <table:table-cell office:value-type="{officeValueType}">',
        '           {officeValue}',
        '       </table:table-cell>',
        '   </tpl>',
        //'   <table:table-cell table:number-columns-repeated="{numberColumnsRepeated}"/>',
        '</table:table-row>'
    ],

    cellTemplate: [
        '<table:table-cell ',
        '   <tpl if="officeValueType != \'string\'">',
        '       office:value="{officeValue}"',
        '   </tpl>',
        '   office:value-type="{officeValueType}">',
        '    {officeValue}',
        '</table:table-cell>'
    ],

    maxColumnsNumber: Math.pow(2, 14) - 1,
    maxRowsNumber: Math.pow(2, 20) - 1,

    constructor: function () {
        var me = this;
        me.callParent(arguments);

        me.stylesTemplate = new Ext.XTemplate(me.stylesTemplate);
        me.tableTemplate = new Ext.XTemplate(me.tableTemplate);
        me.headerRowTemplate = new Ext.XTemplate(me.headerRowTemplate);
        me.bodyRowsTemplate = new Ext.XTemplate(me.bodyRowsTemplate);
        me.cellTemplate = new Ext.XTemplate(me.cellTemplate);
    },

    renderDocument: function (data) {
        var me = this,
            tableTemplate = me.getTableTemplate(data),
            stylesTemplate = me.getStylesTemplate(),
            templateData = {
                stylesTemplate: stylesTemplate,
                tableTemplate: tableTemplate
            };
        return me.callParent([templateData]);
    },

    getStylesTemplate: function () {
        return this.stylesTemplate.apply();
    },

    getTableTemplate: function (data) {
        if (!data || Ext.isEmpty(data)) {
            return;
        }

        var me = this,
            tableName = data.tableName,
            headerRow = me.getHeaderRows(data.headerColumns),
            bodyRows = me.getBodyRows(data.bodyColumns, data.records),
            templateData = {
                tableName: tableName,
                headerRow: headerRow,
                bodyRows: bodyRows
            };
        return me.tableTemplate.apply(templateData);
    },

    getHeaderRow: function (headerColumns) {
        if (!headerColumns || !Ext.isArray(headerColumns)) {
            return null;
        }

        var me = this,
            numberColumnsRepeated = me.getRemainingColumns(headerColumns.length),
            templateData = {
                headerColumns: headerColumns,
                numberColumnsRepeated: numberColumnsRepeated
            };

        return me.headerRowTemplate.apply(templateData);
    },

    getHeaderRows: function (headerColumnsMap) {
        if (!headerColumnsMap || Ext.Object.isEmpty(headerColumnsMap)) {
            return null;
        }

        var me = this,
            processedMap = me.processHeaderColumnsMap(headerColumnsMap),
            headerRowsString = '',
            i;
        for (i in processedMap) {
            headerRowsString += me.getHeaderRow(processedMap[i]);
        }

        return headerRowsString;
    },

    processHeaderColumnsMap: function (headerColumnsMap) {
        var rowIndex = 0,
            nextRowIndex = 0,
            columnIndex = 0,
            column,
            previousColumns = 0,
            processedMap = Ext.apply({}, headerColumnsMap),
            processedRow,
            row;
        for (rowIndex in headerColumnsMap) {
            // The key is a string
            rowIndex = parseInt(rowIndex);
            row = headerColumnsMap[rowIndex];
            processedRow = processedMap[rowIndex];
            for (columnIndex = 0; columnIndex < row.length; columnIndex++) {
                column = row[columnIndex];

                // Add convered cells only if the column span differs from the rowspan
                if (column.isCoveredCell === true ||
                    column.numberColumnsSpanned == column.numberRowsSpanned) {
                    continue;
                }

                // Add a covered cell to the right
                if (column.numberColumnsSpanned > 1) {
                    processedRow.splice(columnIndex + 1, 0, {
                        isCoveredCell: true,
                        numberColumnsRepeated: column.numberColumnsSpanned - 1
                    });
                }

                // Add convered cells to the bottom
                if (column.numberRowsSpanned > 1) {
                    nextRowIndex = rowIndex + 1;
                    for (; nextRowIndex <= column.numberRowsSpanned - 1; nextRowIndex++) {
                        processedMap[nextRowIndex] = processedMap[nextRowIndex] || [];
                        processedMap[nextRowIndex].splice(previousColumns, 0, {
                            isCoveredCell: true,
                            numberColumnsRepeated: column.numberColumnsSpanned
                        });
                    }
                }

                previousColumns += column.numberColumnsSpanned;
            }
            processedMap[rowIndex] = processedRow;
        }

        return processedMap;
    },

    getBodyRows: function (bodyColumns, records) {
        if (!bodyColumns || !Ext.isArray(bodyColumns)) {
            return null;
        }

        var me = this,
            bodyRowsTemplate = me.getBodyRowsTemplate(bodyColumns, records);

        return bodyRowsTemplate.apply(records);
    },

    getBodyRowsTemplate: function (columns, records) {
        var me = this,
            remainingColumns = me.getRemainingColumns(columns.length),
            repeatedCells = me.getRepeatedCells(columns.length),
            repeatedRows = me.getRepeatedRows(records.length),
            tplConfig = me.getBodyRowsTemplateConfig(),
            tpl = '<tpl for=".">' +
                  '     <table:table-row>';
        columns.forEach(function (column) {
            tpl += '        <table:table-cell ' +
                   '            table:style-name="{[this.getTableStyleName("' + column.officeValueType + '")]}"' +
                   '    <tpl if="data.' + column.dataIndex + ' === \'\' || data.' + column.dataIndex + ' === null || data.' + column.dataIndex + ' === undefined " >' +
                   '            />' +
                   '    <tpl else>';

            // Do not add the office:value attribute to those cells with office:value-type=string
            if (column.officeValueType != 'string') {
                tpl += '        {[this.getOfficeValueAttribute("' + column.officeValueType + '")]}="{[this.getOfficeValue(values.get("' + column.dataIndex + '"), "' + column.officeValueType + '")]}"';
            }

            tpl += '            office:value-type="' + column.officeValueType + '">' +
                   '            <text:p>{[this.getValue(values.get("' + column.dataIndex + '"), "' + column.officeValueType + '")]}</text:p>' +
                   '        </table:table-cell>' +
                   '    </tpl>';
        });
        tpl += '        </table:table-row>' +
               '</tpl>';
        return new Ext.XTemplate(tpl, tplConfig);
    },

    getBodyRowsTemplateConfig: function () {
        var config = {
            getOfficeValueAttribute: function (valueType) {
                if (valueType == 'string') {
                    return '';
                }
                if (valueType == 'float') {
                    return 'office:value';
                }

                var format = 'office:{0}-value';
                return Ext.util.Format.format(format, valueType);
            },
            getOfficeValue: function (value, valueType) {
                var processedValue;
                switch (valueType) {
                    case 'date':
                        processedValue = Date.parse(value);
                        if (!isNaN(processedValue)) {
                            processedValue = new Date(processedValue);
                            return processedValue.toISOString();
                        }
                        return value;
                    default:
                        return value;
                }
            },
            getValue: function (value, valueType) {
                var processedValue;
                switch (valueType) {
                    case 'date':
                        processedValue = Date.parse(value);
                        if (!isNaN(processedValue)) {
                            processedValue = new Date(processedValue);
                            return Ext.Date.format(processedValue, 'd/m/Y');
                        }
                        return value;
                    default:
                        return value;
                }
            },
            getTableStyleName: function (valueType) {
                switch (valueType) {
                    case 'date':
                        return 'ce2';
                    default:
                        return 'ce1';
                }
            }
        };

        return config;
    },

    getRepeatedCells: function (columnsNumber) {
        var me = this,
            remainingColumns = me.getRemainingColumns(columnsNumber);
        return '<table:table-cell table:number-columns-repeated="' + remainingColumns + '"/>';
    },

    getRepeatedRows: function (rowsNumber) {
        var me = this,
            repeatedCells = me.getRepeatedCells(-1),
            remainingRows = me.getRemainingRows(rowsNumber);
        return '<table:table-row table:number-rows-repeated="' + remainingRows + '">' +
                    repeatedCells +
               '</table:table-row>';
    },

    getRemainingRows: function (rowsNumber) {
        return this.maxRowsNumber - rowsNumber;
    },

    getRemainingColumns: function (columnsNumber) {
        return this.maxColumnsNumber - columnsNumber;
    }
});
