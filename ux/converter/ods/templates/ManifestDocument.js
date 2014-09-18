Ext.define('Ext.ux.converter.ods.templates.ManifestDocument', {
    extend: 'Ext.ux.converter.ods.templates.XmlDocument',

    bodyTemplate: [
        '<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0">',
        '   <manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.spreadsheet"/>',
        '   <manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/>',
        '   <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>',
        '   <manifest:file-entry manifest:full-path="meta.xml" manifest:media-type="text/xml"/>',
        '   <manifest:file-entry manifest:full-path="mimetype" manifest:media-type="text/plain"/>',
        '   <manifest:file-entry manifest:full-path="META-INF/manifest.xml" manifest:media-type="text/xml"/>',
        '</manifest:manifest>'
    ]
});
