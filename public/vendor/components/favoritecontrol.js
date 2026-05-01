(function () {
    'use strict';

    angular
        .module('common.utils')
	.controller('favoritecontrolCtrl', ['utl', '$scope', '$timeout', 'uibButtonConfig', function (utl, $scope, $timeout, uibButtonConfig) {
	    var cvm = this;
	  	
		uibButtonConfig.activeClass="";

		cvm.list = [];
		cvm.listItemMap = {};
		cvm.listmodel = {};

		$scope.$watch('cvm.config.favoritetypeid',
			function(newValue) {
				if(newValue) {
					cvm.getFavoriteMasters();
				}
		});
		
		 $scope.emrfavouritesettings = function() {
			utl.Modal.open('app.favoritemaster', {
					params: { id:0 , favoritetypeid: cvm.config.favoritetypeid , parent : "txn"},
					confirmCallback: cvm.getFavoriteMasters,
                    cancelCallback: cvm.getFavoriteMasters
			});
		}

		//cvm.saveFavorites
		cvm.saveFavorites = function() {
			//console.log(cvm.listmodel);
			cvm.config.selectedlist = [];
			for(var itemId in cvm.listmodel) {
				var isselected = cvm.listmodel[itemId];
				if(isselected == true) {
					var detail = cvm.listItemMap[itemId];
					cvm.config.selectedlist.push(detail);
					cvm.listmodel[itemId] = false; //resetting the favorite
				}
			}
			if(cvm.config.selectedlist && cvm.config.selectedlist.length > 0) {
				cvm.saveclick();
			}
		}
		

		cvm.caretClicked = function(detail) {
			//alert('caretClicked' + detail.ItemId);
			cvm.config.selecteddetail = detail;
			cvm.addclick();
		}
		
		//get fav list
		function afterGet(res) {
			var result = [];
			var groups = [];

			for(var idx in res.Data) {
				var item = res.Data[idx];
				for(var idx in item.FavoriteMasterDetails) {
					var favdetail = item.FavoriteMasterDetails[idx];
					if(groups.indexOf(favdetail.GroupName) == -1 ) {
						groups.push(favdetail.GroupName);
					}

					favdetail.Header = item.Description;
					result.push(favdetail);

					cvm.listmodel[favdetail.ItemId] = false;
					cvm.listItemMap[favdetail.ItemId] = favdetail;
				}
			}
			cvm.groups = groups;
			cvm.list = result;
		}

		cvm.CanFavGrouped = function() {
			if(cvm.groups && cvm.groups.length == 1 && !cvm.groups[0]) { //check for null grouped data
				return false;
			}
			return cvm.groups && cvm.groups.length > 0;
		}

		//getFavoriteMasters
		cvm.getFavoriteMastersCallback = function (scope, res, options, hasError) {
			if(!res || !res.Data || res.Data.length == 0) {
				cvm.getFavoriteMastersByAdmin();
			} else {
				afterGet(res);
			}
		}
		cvm.getFavoriteMasters = function() {

			var inputData = { 
					Params :[
						{ Key: 3, Value: cvm.config.favoritetypeid },
						{ Key: 5, Value: utl.Session.getCurrentUserId() }
					],
					PageContext:{
						PageSize: 1000,
						PageNumber: 1
					}
			};

			var options = {
				action: 'clinicalmaster/FavoriteMaster/GetFavoriteMasters',
				data: inputData,
				type: 'post',
				onComplete: cvm.getFavoriteMastersCallback
			};
			utl.Http.doAction(options);
		}

		//getFavoriteMastersByAdmin
		cvm.getFavoriteMastersByAdminCallback = function (scope, res, options, hasError) {
			afterGet(res);
		}
		cvm.getFavoriteMastersByAdmin = function() {

			var inputData = { 
					Params :[
						{ Key: 3, Value: cvm.config.favoritetypeid },
						{ Key: 6, Value: true } //AdminFav - true
					],
					PageContext:{
						PageSize: 1000,
						PageNumber: 1
					}
			};

			var options = {
				action: 'clinicalmaster/FavoriteMaster/GetFavoriteMasters',
				data: inputData,
				type: 'post',
				onComplete: cvm.getFavoriteMastersByAdminCallback
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
    .component('favoritecontrol', {
        bindings: {
			config : "=",
			addclick : "&",
			saveclick : "&"
        },
        controller: 'favoritecontrolCtrl',
        controllerAs: 'cvm',
        templateUrl: 'vendor/components/favoritecontrol.html'
    })

})();