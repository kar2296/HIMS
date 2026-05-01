(function () {
    'use strict';

    angular
        .module('common.utils')
	.controller('testcontrolCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
	    var cvm = this;
		
	  	cvm.items = [];
		
		$scope.$watch('cvm.testid',
			function(newValue) {
				if(newValue) {
					cvm.searchItem(newValue, true);
				}
		});
			
		cvm.setItemInfo= function (iteminfo) {
			cvm.testinfo = iteminfo;
			cvm.testcode = iteminfo.Code;
			cvm.testname = iteminfo.Name;
			cvm.testdescription = iteminfo.Description;
			$timeout(function() {
				if(cvm.changeev) {
					cvm.changeev();
				}
			}, 100);
		}

		cvm.searchItemCallback = function(scope, res, options, hasError) {
			var result = [];
			for(var idx in res.Data) {
				var item = res.Data[idx];
				var newitem = { Id : item.Id, Text : item.Name, 
								Name : item.Name,
								Code : item.Code,
								Description : item.Description,
								DepartmentId : item.DepartmentId,
								SubDepartmentId : item.SubDepartmentId,
								FacilityId : item.FacilityId,
								TestTypeId : item.TESTMASTERTYPId
							};

				result.push(newitem);
			}
			cvm.items = result;
		};

		cvm.searchItem = function(query, isSearchByItemId) {

			var canSearch = false;
			var inputData = { 
					Params :[],
					PageContext:{
						PageSize: 10,
						PageNumber: 1
					}
			};

			if(isSearchByItemId == true) {
				inputData.Params.push({ Key: 0, Value: query });
				canSearch = true;
			} else if(query && query.length > 2) {
				inputData.Params.push({ Key: 1, Value: query });
				canSearch = true;
			}

			if(canSearch==true) {
				var options = {
					action: 'lis/Testmaster/GetTestmasters',
					data: inputData,
					type: 'post',
					onComplete: cvm.searchItemCallback
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
    .component('testcontrol', {
        bindings: {
			testid: "=",
			testcode: "=",
			testname: "=",
			testdescription : "=",
			testinfo : "=",
			changeev : "&"
        },
        controller: 'testcontrolCtrl',
        controllerAs: 'cvm',
        templateUrl: 'vendor/components/testcontrol.html'
    })

})();