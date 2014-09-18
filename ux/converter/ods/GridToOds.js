Ext.define('Ext.ux.converter.ods.GridToOds', {
    requires: [
        'Ext.XTemplate',
        'Ext.ux.converter.ods.templates.XmlDocument',
        'Ext.ux.converter.ods.templates.ManifestDocument',
        'Ext.ux.converter.ods.templates.MetaDocument',
        'Ext.ux.converter.ods.templates.OfficeDocument',
        'Ext.ux.converter.ods.templates.StylesDocument',
        'Ext.ux.converter.ods.templates.ContentDocument'
    ],

    mimetype: 'application/vnd.oasis.opendocument.spreadsheet',

    convert: function (grid) {
        var me = this,
            contentDocument = me.getContentDocument(grid),
            stylesDocument = me.getStylesDocument(),
            manifestDocument = me.getManifestDocument(),
            metaDocument = me.getMetaDocument(),
            odsDocuments = {
                contentDocument: contentDocument,
                metaDocument: metaDocument,
                stylesDocument: stylesDocument,
                manifestDocument: manifestDocument,
                mimetype: me.mimetype
            };
        return odsDocuments;
    },

    getContentDocument: function (grid) {
        var me = this,
            contentDocument = Ext.create('Ext.ux.converter.ods.templates.ContentDocument'),
            headerColumns = me.getHeaderColumns(grid),
            bodyColumns = me.getBodyColumns(grid),
            records = grid.getStore().getRange(),
            data = {
                tableName: grid.title,
                headerColumns: headerColumns,
                bodyColumns: bodyColumns,
                records: records
            },
            odsContent = contentDocument.renderDocument(data);
        return odsContent;
    },

    getStylesDocument: function () {
        var documentTemplate = Ext.create('Ext.ux.converter.ods.templates.StylesDocument'),
            documentContent = documentTemplate.renderDocument();
        return documentContent;
    },

    getManifestDocument: function () {
        var documentTemplate = Ext.create('Ext.ux.converter.ods.templates.ManifestDocument'),
            documentContent = documentTemplate.renderDocument();
        return documentContent;
    },

    getMetaDocument: function () {
        var documentTemplate = Ext.create('Ext.ux.converter.ods.templates.MetaDocument'),
            documentContent = documentTemplate.renderDocument();
        return documentContent;
    },

    getHeaderColumns: function (grid) {
           var me = this,
            columns = me.getColumns(grid),
            columnsOrderMap = {
                0: columns
            },
            deepestLevel = me.getDeepestLevel(columns),
            mapIndex = 0;
        return me.getOrderedHeaderColumns(columnsOrderMap, deepestLevel, mapIndex);
    },

    getOrderedHeaderColumns: function (columnsOrderMap, deepestLevel, mapIndex) {
        var me = this,
            indexColumns,
            nextMapIndex = mapIndex + 1,
            indexesToRemove = [],
            indexToRemove,
            columnData,
            childColumns,
            childIndex;

        indexColumns = columnsOrderMap[mapIndex].filter(function (column) {
            return !column.hidden;
        });

        indexColumns.forEach(function (column, i) {
            columnData = me.getColumnAndRowSpan(column, deepestLevel - mapIndex);
            columnData.officeValue = column.text;
            indexColumns[i] = columnData;

            childColumns = column.items.getRange();
            if (childColumns.length > 0) {
                childIndex = mapIndex + columnData.numberRowsSpanned;
                columnsOrderMap[childIndex] = columnsOrderMap[childIndex] || [];
                Array.prototype.push.apply(columnsOrderMap[nextMapIndex], childColumns);
            }
        });

        columnsOrderMap[mapIndex] = indexColumns;

        if (columnsOrderMap[nextMapIndex] === undefined) {
            return columnsOrderMap;
        }

        return me.getOrderedHeaderColumns(columnsOrderMap, deepestLevel, nextMapIndex);
    },

    getBodyColumns: function (grid) {
        var me = this,
            officeValueTypeMap = me.getOfficeValueTypeMap(grid),
            columns = me.getVisibleColumns(grid),
            bodyColumns = [];

        columns.forEach(function (column) {
            var dataIndex = column.dataIndex,
                value = column.text,
                valueType = officeValueTypeMap[dataIndex],
                bodyColumn = {
                    officeValue: value,
                    officeValueType: valueType,
                    dataIndex: dataIndex
                };
            bodyColumns.push(bodyColumn);
        });

        return bodyColumns;
    },

    getOfficeValueTypeMap: function (grid) {
        var me = this,
            officeValueTypeMap = {},
            columns = me.getVisibleColumns(grid),
            model = grid.getStore().model,
            fields = model.getFields();
        columns.forEach(function (column) {
            var field,
                i,
                officeValueType;
            for (i in fields) {
                field = fields[i];
                if (field.name === column.dataIndex) {
                    officeValueType = me.convertFieldTypeToOfficeType(field.type.type);
                    officeValueTypeMap[column.dataIndex] = officeValueType;
                    break;
                }
            }
        });

        return officeValueTypeMap;
    },

    convertFieldTypeToOfficeType: function (fieldType) {
        switch (fieldType) {
            case 'boolean':
                return 'boolean';
            case 'date':
                return 'date';
            case 'int':
            case 'float':
            case 'number':
            case 'numeric':
                return 'float';
            case 'auto':
            case 'string':
                return 'string';
            default:
                return 'string';
        }
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
            numberColumnsSpanned: columnspan,
            numberRowsSpanned: rowspan
        };
    }
});
