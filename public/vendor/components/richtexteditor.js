(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('richtexteditorCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
			var cvm = this;

			cvm.editoroptions = {
				language: 'en',
				allowedContent: true,
				entities: false
			};

			$scope.$watch('cvm.inserthtml',
				function (newValue) {
					if (newValue) {
						var el = null;
						try {
							var editorsobj = $(CKEDITOR.instances);
							var editorobj = editorsobj[0];
							for (var idx in editorobj) {
								var container = editorobj[idx];
								if (el == null)
									el = container.getSelection().getNative().baseNode;
							}
							if (el && el.innerHTML) {
								el.innerHTML = newValue;
							} else {
								el = el.parentNode;
								if (el && el.innerHTML)
									el.innerHTML = newValue;
							}
							cvm.richtext = '';
							for(var instanceName in CKEDITOR.instances) {
								cvm.richtext = CKEDITOR.instances[instanceName].getData();
							}
							cvm.inserthtml = '';
						} catch (ex) { }
					}
				});

			// Called when the editor is completely ready.
			cvm.editorOnReady = function () {
				console.log('ckeditor - onready');
			};

			cvm.init = function () {
				//Init logic
			}

			//caution : base method, please don't modifiy
			cvm.$onInit = function () {
				$timeout(cvm.init, 100);
			}
		}])
		.component('richtexteditor', {
			bindings: {
				richtext: "=",
				inserthtml: "="
			},
			controller: 'richtexteditorCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/richtexteditor.html'
		})

})();