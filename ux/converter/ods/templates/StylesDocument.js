Ext.define('Ext.ux.converter.ods.templates.StylesDocument', {
    extend: 'Ext.ux.converter.ods.templates.OfficeDocument',

    documentType: 'styles',

    bodyTemplate: [
        '<office:font-face-decls>',
        '    <style:font-face svg:font-family="Calibri" style:name="Calibri"/>',
        '</office:font-face-decls>',

        '<office:styles>',
        '    <number:number-style style:name="N0">',
        '       <number:number number:min-integer-digits="1"/>',
        '    </number:number-style>',
        '    <number:date-style style:name="N20">',
        '       <number:day number:style="long"/>',
        '       <number:text>/</number:text>',
        '       <number:month number:style="long"/>',
        '       <number:text>/</number:text>',
        '       <number:year number:style="long"/>',
        '    </number:date-style>',
        '    <style:style style:name="Default" style:data-style-name="N0" style:family="table-cell">',
        '       <style:table-cell-properties fo:background-color="transparent" style:vertical-align="automatic"/>',
        '       <style:text-properties style:font-size-complex="11pt" style:font-size-asian="11pt" fo:font-size="11pt" style:font-name-complex="Calibri" style:font-name-asian="Calibri" style:font-name="Calibri" fo:color="#000000"/>',
        '    </style:style>',
        '    <style:default-style style:family="graphic">',
        '       <style:graphic-properties svg:stroke-opacity="100%" svg:stroke-color="#385d8a" svg:stroke-width="0.02778in" draw:stroke="solid" draw:opacity="100%" draw:fill-color="#4f81bd" draw:fill="solid"/>',
        '    </style:default-style>',
        '</office:styles>',

        '<office:automatic-styles>',
        '    <style:page-layout style:name="pm1">',
        '       <style:page-layout-properties style:print="objects charts drawings" style:table-centering="none" fo:margin-right="0.7in" fo:margin-left="0.7in" fo:margin-bottom="0.3in" fo:margin-top="0.3in"/>',
        '       <style:header-style>',
        '           <style:header-footer-properties fo:margin-right="0.7in" fo:margin-left="0.7in" fo:margin-bottom="0in" fo:min-height="0.45in"/>',
        '       </style:header-style>',
        '       <style:footer-style>',
        '           <style:header-footer-properties fo:margin-right="0.7in" fo:margin-left="0.7in" fo:margin-top="0in" fo:min-height="0.45in"/>',
        '       </style:footer-style>',
        '    </style:page-layout>',
        '</office:automatic-styles>',

        '<office:master-styles>',
        '    <style:master-page style:name="mp1" style:page-layout-name="pm1">',
        '       <style:header/>',
        '       <style:header-left style:display="false"/>',
        '       <style:footer/>',
        '       <style:footer-left style:display="false"/>',
        '    </style:master-page>',
        '</office:master-styles>'
    ]
});
