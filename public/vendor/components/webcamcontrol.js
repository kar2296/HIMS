(function () {
    'use strict';

    angular
        .module('common.utils')
	.controller('webcamcontrolCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
	    var cvm = this;

        cvm.webcam = utl.WebCamHelper.webcam;
		
        //override function for be call when capture is finalized
        cvm.webcam.success = function(image, type) {
            cvm.photo = image;
            cvm.fotoContentType = type;
            cvm.config.base64string = image;
        };

        cvm.turnOffWebCam = function() {
            if(cvm.webcam && cvm.webcam.isTurnOn===true) {
                cvm.webcam.turnOff();
			}
        }

	    cvm.init = function () {
			//Init logic
	    }

	    //caution : base method, please don't modifiy
	    cvm.$onInit = function () {
	        $timeout(cvm.init, 100);
	    }
	}])
    .component('webcamcontrol', {
        bindings: {
			config: "=",
        },
        controller: 'webcamcontrolCtrl',
        controllerAs: 'cvm',
        templateUrl: 'vendor/components/webcamcontrol.html'
    })

})();