extjs-grid-converter
====================

Helpers to convert extjs grid panels to something else like an html table or ods file

GridToHtmlTable
---------------------------

Use this converter when you need to print or somehow export the grid data shown in your exjs app. This converter transforms also the nested columns so the hierarchy won't be lost.

### Usage

1. Make sure you have set the path for the user extensions in your app.js file 

  ```javascript
  Ext.Loader.setPath({ 'Ext.ux': 'path/to/ux' });
  ```
2. Make sure to add the converter into the `requires` list on the class where you're going to use it
  
  ```javascript
  Ext.define('SomeClass', {
    requires: [
      'Ext.ux.converter.GridToHtmlTable'
    ]
  });
  ```
3. Create an instance of the converter and call the `convert` method giving the grid you want to convert as the only parameter

  ```javascript
  var converter = Ext.create('Ext.ux.converter.GridToHtmlTable'),
      htmlTableString = converter.convert(myGrid);
  ```
4. Use the `htmlTableString` as you want. You can create a component and set the `html` property with the `htmlTableString` value or write it in some other html element like a div.
