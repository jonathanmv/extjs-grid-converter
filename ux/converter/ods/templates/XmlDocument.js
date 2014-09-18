Ext.define('Ext.ux.converter.ods.templates.XmlDocument', {
    requires: [
        'Ext.XTemplate'
    ],

    xmlTag: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',

    bodyTemplate: null,

    documentTemplate: [
        '{xmlTag}',
        '{bodyTemplate}'
    ],

    constructor: function () {
        var me = this;
        me.callParent(arguments);

        me.documentTemplate = new Ext.XTemplate(me.documentTemplate);

        if (!Ext.isEmpty(me.bodyTemplate)){
            me.bodyTemplate = new Ext.XTemplate(me.bodyTemplate);
        }
    },

    renderDocument: function (data) {
        data = data || {};

        var me = this,
            bodyTemplate = me.getBodyTemplate(data);

        Ext.applyIf(data, {
            xmlTag: me.xmlTag,
            bodyTemplate: bodyTemplate
        });

        return me.documentTemplate.apply(data);
    },

    getBodyTemplate: function (data) {
        var me = this,
            bodyTemplate = me.bodyTemplate;
        if (!Ext.isEmpty(me.bodyTemplate) && me.bodyTemplate.isTemplate === true) {
            bodyTemplate = me.bodyTemplate.apply(data);
        }
        return bodyTemplate;
    }
});
