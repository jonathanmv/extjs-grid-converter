/**
 * Converts a grid into an html table
 */
Ext.define('Ext.ux.converter.GridToHtmlTable', {

    requires: [
        'Ext.XTemplate'
    ],

    /**
     * The template to be used for the table itself. It should include the {headerRow} and
     * {bodyRows} tags which will be replaced with the header and body rows respectively
     */
    tableTemplate: [
        '<table>',
        '   <thead>',
        '      {headerRow}',
        '   </thead>',
        '   <tbody>',
        '       {bodyRows}',
        '   </tbody>',
        '</table>'
    ],

    /**
     * The template to be used on the table headers
     */
    headerRowTemplate: [
        '<tr>',
        '   <tpl for=".">',
        '       <th colspan="{colspan}" rowspan="{rowspan}">{text}</th>',
        '   </tpl>',
        '</tr>'
    ],

    constructor: function () {
        var me = this;
        me.callParent(arguments);

        me.tableTemplate = new Ext.XTemplate(me.tableTemplate);
        me.headerRowTemplate = new Ext.XTemplate(me.headerRowTemplate);
    },

    /**
     * Obtains the html representation of the given grid using the columns and records information.
     * Notice it returns the html string for the table, not the html for a complete html document,
     * this means the string will start and end with the table tag <pre><table>...</table></pre>
     * insteand of the html tag <pre><!DOCTYPE html><html>...</html></pre>
     */
    convert: function (grid) {
        var me = this,
            headerColumns = me.getColumns(grid),
            bodyColumns = me.getVisibleColumns(grid),
            headerRow = me.renderHeaderRow(headerColumns),
            records = grid.getStore().getRange(),
            rowTemplate = me.getRowTemplateFromColumns(bodyColumns),
            bodyRows = me.renderBodyRows(records, rowTemplate),
            templateData = {
                headerRow: headerRow,
                bodyRows: bodyRows
            },
            htmlTable = me.tableTemplate.apply(templateData);
        return htmlTable;
    },

    /**
     * Generates the html to build the row that contains the table headers
     */
    renderHeaderRow: function (columns) {
        var me = this,
            columnsOrderMap = {
                0: columns
            },
            deepestLevel = me.getDeepestLevel(columns);
        return me.renderComplexHeaderRow(columnsOrderMap, deepestLevel);
    },

    /**
     * Calculates the order in which the header row template should be applied based on
     * the columns and their children.
     */
    renderComplexHeaderRow: function (columnsOrderMap, deepestLevel) {
        columnsOrderMap = columnsOrderMap || {};

        var me = this,
            templateData = [],
            columns = columnsOrderMap[0] || [],
            columnData,
            levelDiff,
            renderedRow;

        columns.forEach(function (column) {
            if (column.hidden === true) {
                return;
            }

            columnData = me.getColumnAndRowSpan(column, deepestLevel);
            columnData.text = column.text;
            templateData.push(columnData);

            childColumns = column.items.getRange();
            if (childColumns.length > 0) {
                levelDiff = deepestLevel - columnData.rowspan;
                columnsOrderMap[levelDiff] = columnsOrderMap[levelDiff] || [];
                columnsOrderMap[levelDiff] = columnsOrderMap[levelDiff].concat(childColumns);
            }
        });

        renderedRow = me.headerRowTemplate.apply(templateData);

        deepestLevel--;
        if (deepestLevel < 1) {
            return renderedRow;
        }

        if (columnsOrderMap.hasOwnProperty(deepestLevel) &&
            !Ext.isEmpty(columnsOrderMap[deepestLevel])) {
            columnsOrderMap[0] = columnsOrderMap[deepestLevel];
            delete columnsOrderMap[deepestLevel];
        }

        renderedRow += me.renderComplexHeaderRow(columnsOrderMap, deepestLevel);

        return renderedRow;
    },

    /**
     * Applies the given row template with the records
     */
    renderBodyRows: function (records, rowTemplate) {
        var template = new Ext.XTemplate(rowTemplate);
        return template.apply(records);
    },

    /**
     * Creates a template based on then dataindex of the given columns. It calls the get
     * method on the record to set the column's display value
     */
    getRowTemplateFromColumns: function (columns) {
        var me = this,
            template = '<tpl for="."><tr>';

        columns.forEach(function (column) {
            if (!Ext.isEmpty(column.dataIndex)) {
                template += '<td>{[values.get("' + column.dataIndex + '")]}</td>';
            }
        });

        template += '</tr></tpl>';

        return template;
    },

    /**
     * Looks for the columns in the header container. The returned columns are the ones without
     * parent columns
     */
    getColumns: function (grid) {
        if (!grid || Ext.isEmpty(grid)) {
            return [];
        }

        var view = grid.getView(),
            header = view.getHeaderCt(),
            columns = header.items.getRange();
        return columns;
    },

    /**
     * Asks the column manager for the columns. The returned columns are the ones without child
     * columns
     */
    getVisibleColumns: function (grid) {
        if (!grid || Ext.isEmpty(grid)) {
            return [];
        }

        var columnManager = grid.columnManager,
            columns = columnManager.getColumns();
        return columns;
    },

    /**
     * Finds the longer hierarchy between a given set of columns
     */
    getDeepestLevel: function (columns) {
        var me = this,
            deepestLevel = 1;
        deepestLevel = columns.reduce(function (level, column) {
            var depth = me.getColumnDepth(column);
            return Math.max(level, depth);
        }, 1);
        return deepestLevel;
    },

    /**
     * Calculates the depth for the column based on the children's hierarchy. If a column has
     * a child column which does not have children columns, the first column's depth is 2
     */
    getColumnDepth: function (column) {
        var me = this,
            depth = 1,
            children = column.items.getRange(),
            numberOfChildren = children.length;

        if (numberOfChildren > 0) {
            depth += me.getDeepestLevel(children);
        }

        return depth;
    },

    /**
     * Gets the columnspan and rowspan a cell should have based on the column's children and
     * deepLevel of the table respectively
     * __________________________________________________________________________________
     * |                |     Rowspan 2  Columnspan 2   |___Rowspan_1___|___Rowspan_1___|
     * |    Rowspan 3   |_______________________________|___Rowspan_1___|               |
     * |________________|___Rowspan_1___|___Rowspan_1___|___Rowspan_1___|___Rowspan_2___|
     */
    getColumnAndRowSpan: function (column, deepestLevel) {
        var me = this,
            columnspan = 1,
            rowspan = deepestLevel,
            childColumns = column.items.getRange();
        if (childColumns.length > 0) {
            columnspan = childColumns.length;
            rowspan -= me.getDeepestLevel(childColumns);
        }

        return {
            colspan: columnspan,
            rowspan: rowspan
        };
    }
});
