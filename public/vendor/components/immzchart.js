(function () {
    'use strict';

    angular
        .module('common.utils')
	.controller('immzchartCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
	    var cvm = this;
		cvm.patientinfo = {};

		$scope.$watch('cvm.patientid',
			function(newValue) {
				cvm.getList();
		});
			
		cvm.getListCallback = function (scope, res, options, hasError) {
			//console.log(res.Data);
			var items = res.Data;

			var chartInput = { };
			var chartOptions = {
			};

			utl.Chart.drawGanttChart('chart-immz', chartInput, chartOptions);
		}
		
		cvm.getList = function() {
			var inputData = { 
					Params :[
						{ Key: 2, Value: cvm.patientid }
					],
					PageContext:{
						PageSize: 500,
						PageNumber: 1
					}
				};

				var options = {
					action: 'emr/patientvital/GetPatientVitals',
					data: inputData,
					type: 'post',
					onComplete: cvm.getListCallback
				};

			utl.Http.doAction(options);
		}
	
	    cvm.init = function () {
	    }

	    //caution : base method, please don't modifiy
	    cvm.$onInit = function () {
	        $timeout(cvm.init, 100);
	    }
	}])
    .component('immzchart', {
        bindings: {
			patientid: "="
        },
        controller: 'immzchartCtrl',
        controllerAs: 'cvm',
        templateUrl: 'vendor/components/immzchart.html'
    })

})();