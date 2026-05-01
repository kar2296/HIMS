(function () {
    'use strict';

    angular
        .module('common.utils')
	.controller('drugcontrolCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
	    var cvm = this;
		cvm.druginfo = {};
		
	  	cvm.drugs = [];
		
		$scope.$watch('cvm.drugid',
			function(newValue) {
				if(newValue) {
					cvm.searchDrug(newValue, true);
				}
		});
			
		cvm.setDrugInfo= function (druginfo) {
			cvm.druginfo = druginfo;
			cvm.drugrouteid = druginfo.DrugRouteId;
			cvm.drugfrequencyid = druginfo.DrugFrequencyId;
			cvm.rxname = druginfo.DrugName;
			$timeout(function() {
				if(cvm.changeev) {
					cvm.changeev();
				}
			}, 100);
		}

		cvm.searchDrugCallback = function(scope, res, options, hasError) {
			var result = [];
			for(var idx in res.Data) {
				var item = res.Data[idx];
				var newitem = { Id : item.Id, Text : item.DrugName, 
								DrugName : item.DrugName,
								DrugCode : item.DrugCode,
								Description : item.Description, 
								DrugRouteId : item.DrugRouteId,
								DrugFrequencyId : item.DrugFrequencyId
							};

				result.push(newitem);
			}
			cvm.drugs = result;
		};

		cvm.searchDrug = function(query, isSearchByDrugId) {

			var canSearch = false;
			var inputData = { 
					Params :[{ Key: 3, Value: 2 }],
					PageContext:{
						PageSize: 10,
						PageNumber: 1
					}
			};

			if(isSearchByDrugId == true) {
				inputData.Params.push({ Key: 0, Value: query });
				canSearch = true;
			} else if(query && query.length > 2) {
				inputData.Params.push({ Key: 1, Value: query });
				canSearch = true;
			}

			if(canSearch==true) {
				var options = {
					action: 'clinicalmaster/DrugMaster/GetDrugMasters',
					data: inputData,
					type: 'post',
					onComplete: cvm.searchDrugCallback
				};

				utl.Http.doAction(options);
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
    .component('drugcontrol', {
        bindings: {
			drugid: "=",
			drugrouteid: "=",
			drugfrequencyid: "=",
			rxname : "=",
			changeev : "&"
        },
        controller: 'drugcontrolCtrl',
        controllerAs: 'cvm',
        templateUrl: 'vendor/components/drugcontrol.html'
    })

})();