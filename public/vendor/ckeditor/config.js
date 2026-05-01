/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function (config) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';

	config.removeButtons = 'Image,Flash,Smiley,Iframe,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,About';

	// The location of an external file browser, that should be launched when "Browse Server" button is pressed in the Image dialog.
	config.filebrowserImageBrowseUrl = "/ckeditor/pictures";

	// The location of a script that handles file uploads in the Image dialog.
	config.filebrowserImageUploadUrl = "/ckeditor/pictures?";

	config.font_defaultLabel = 'Times New Roman';

	config.extraPlugins = 'lineheight,uploadimage';
};
