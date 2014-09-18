Ext.define('Ext.ux.converter.ods.templates.MetaDocument', {
    extend: 'Ext.ux.converter.ods.templates.XmlDocument',

    initialCreator: null,
    creationDate: null,

    bodyTemplate: [
        '<office:document-meta office:version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0" xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0">',
        '   <office:meta>',
        '       <meta:generator>extjs-grid-converter GridToOds</meta:generator>',
        '       <meta:initial-creator>{initialCreator}</meta:initial-creator>',
        '       <dc:creator>{initialCreator}</dc:creator>',
        '       <meta:creation-date>{creationDate}</meta:creation-date>',
        '       <dc:date>{creationDate}</dc:date>',
        '   </office:meta>',
        '</office:document-meta>'
    ],

    renderDocument: function (initialCreator, creationDate) {
        var me = this,
            templateData = {
                initialCreator: initialCreator
            };

        if (Ext.isEmpty(initialCreator)) {
            templateData.initialCreator = me.initialCreator || 'Anonymous';
        }

        templateData.creationDate = me.processCreationDate(creationDate);

        return me.callParent([templateData]);
    },

    processCreationDate: function (creationDate) {
        var me = this,
            dateOptions = [creationDate, me.creationDate, new Date()],
            dateToProcess,
            i = 0;

        for (i in dateOptions) {
            dateToProcess = dateOptions[i];
            if (Ext.isDate(dateToProcess)) {
                return dateToProcess.toISOString();
            }

            dateToProcess = Date.parse(dateToProcess);
            if (!isNaN(dateToProcess)) {
                dateToProcess = new Date(dateToProcess);
                return dateToProcess.toISOString();
            }
        }
    }
});
