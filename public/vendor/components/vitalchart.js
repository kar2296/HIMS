(function () {
    'use strict';

    angular
        .module('common.utils')
	.controller('vitalchartCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
	    var cvm = this;
		cvm.patientinfo = {};

		$scope.$watch('cvm.patientid',
			function(newValue) {
				cvm.getList();
		});

		$scope.$watch('cvm.vitalid',
			function(newValue) {
				cvm.getList();
		});

		$scope.$watch('cvm.from',
			function(newValue) {
				cvm.getList();
		});

		$scope.$watch('cvm.to',
			function(newValue) {
				cvm.getList();
		});
			
		cvm.getListCallback = function (scope, res, options, hasError) {
			//console.log(res.Data);
			var items = res.Data;
			var metaData = {xaxis : 'xaxiscol', yaxis : '', legend : '', charttitle: 'Vital', xaxistitle: '', yaxismin : 0, yaxismax : 200, yaxisinterval : 50, yaxistitle : 'Vital Value' }
			var yaxisNameArr = [];
			var seriesData = {};

			//Preparing metaData
			for(var idx in items) {
				var item = items[idx];
				
				//Preparing meta
				var itemName = item.VitalName;
				if(item.UOM) {
					itemName += '(' + item.UOM + ')';
				}
				if(yaxisNameArr.indexOf(itemName) == -1){
					yaxisNameArr.push(itemName);
				}

				//Preparing items
				var xAxisData = utl.Formatter.getDateStringForVitalChart(item.PerformedDate);

				var seriesObj = seriesData[xAxisData];
				if(!seriesObj) {
					seriesObj = { xaxiscol : xAxisData };
				}

				seriesObj[itemName] = parseInt(item.VitalValue);

				seriesData[xAxisData] = seriesObj;
			}

			metaData.yaxis = yaxisNameArr.join(',');
			metaData.legend = yaxisNameArr.join(',');

			var chartData = [];
			for(var key in seriesData) {
				chartData.push(seriesData[key]);
			}
			var chartInput = { MetaData : metaData, Items : chartData};

			console.log('chartInput');
			console.log(chartInput);

			var chartOptions = {
				legend : {
					align: 'right',
					verticalAlign: 'top',
					layout: 'vertical',
					x: 0,
					y: 100
				}	
			};

			$timeout(utl.Chart.drawLineChart('chart-vital', chartInput, chartOptions), 1000);
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

				if(cvm.vitalid) {
					inputData.Params.push({ Key: 3, Value: cvm.vitalid } );
				}
				if(cvm.from) {
					inputData.Params.push({ Key: 5, Value: utl.Formatter.getFilterDate(cvm.from) } );
				}
				if(cvm.to) {
					inputData.Params.push({ Key: 6, Value: utl.Formatter.getFilterDate(cvm.to) } );
				}
				
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
    .component('vitalchart', {
        bindings: {
			patientid: "=",
			vitalid : "=",
			from : "=",
			to : "="
        },
        controller: 'vitalchartCtrl',
        controllerAs: 'cvm',
        templateUrl: 'vendor/components/vitalchart.html'
    })

})();