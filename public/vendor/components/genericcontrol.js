(function () {
    'use strict';

    angular
        .module('common.utils')
	.controller('genericcontrolCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
	    var cvm = this;
		cvm.genericinfo = {};
		
	  	cvm.generics = [];
		
		$scope.$watch('cvm.genericid',
			function(newValue) {
				if(newValue) {
					cvm.searchGeneric(newValue, true);
				}
		});
			
		cvm.setGenericInfo= function (genericinfo) {
			cvm.genericinfo = genericinfo;
			cvm.rxname = genericinfo.GenericName;
			$timeout(function() {
				if(cvm.changeev) {
					cvm.changeev();
				}
			}, 100);
		}

		cvm.searchGenericCallback = function(scope, res, options, hasError) {
			var result = [];
			for(var idx in res.Data) {
				var item = res.Data[idx];
				var newitem = { Id : item.Id, Text : item.GenericName,
								GenericName : item.GenericName,
								Description : item.Description };

				result.push(newitem);
			}
			cvm.generics = result;
		};

		cvm.searchGeneric = function(query, isSearchByGenericId) {

			var canSearch = false;
			var inputData = { 
					Params :[{ Key: 3, Value: 2 }],
					PageContext:{
						PageSize: 10,
						PageNumber: 1
					}
			};

			if(isSearchByGenericId == true) {
				inputData.Params.push({ Key: 0, Value: query });
				canSearch = true;
			} else if(query && query.length > 2) {
				inputData.Params.push({ Key: 1, Value: query });
				canSearch = true;
			}

			if(canSearch==true) {
				var options = {
					action: 'clinicalmaster/GenericMaster/GetGenericMasters',
					data: inputData,
					type: 'post',
					onComplete: cvm.searchGenericCallback
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
    .component('genericcontrol', {
        bindings: {
			genericid: "=",
			rxname : "=",
			changeev : "&"
        },
        controller: 'genericcontrolCtrl',
        controllerAs: 'cvm',
        templateUrl: 'vendor/components/genericcontrol.html'
    })

})();