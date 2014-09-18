Ext.define('Ext.ux.converter.ods.templates.OfficeDocument', {
    extend: 'Ext.ux.converter.ods.templates.XmlDocument',

    documentTemplate: [
        '{xmlTag}',
        '<office:document-{documentType} xmlns:msoxl="http://schemas.microsoft.com/office/excel/formula" xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0" xmlns:number="urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0">',
        '   {bodyTemplate}',
        '</office:document-{documentType}>'
    ],

    documentType: null,
    bodyTemplate: null,

    renderDocument: function (data) {
        data = data || {};

        var me = this;

        Ext.applyIf(data, {
            documentType: me.documentType
        });

        return me.callParent([data]);
    }

});
