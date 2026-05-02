(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('FamilySocialHstryFormController', FamilySocialHstryFormController);
    function FamilySocialHstryFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, uibButtonConfig) {
        var vm = this;
        // uibButtonConfig.activeClass = "btn-success";
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
        $scope.list = [];
        $scope.item = {};
        $scope.listItemMap = {};
        $scope.listmodel = {};
        $scope.currentcontext = {
            option: 'favorites',
        };
        $scope.favconfig = {
            favoritetypeid: 5,
            selectedlist: [],
            selecteddetail: {}
        };
        $scope.options = [
            { key: 'favorites', name: $translate.instant('patientemr.eyehistorysections.favorites.lbl') },
            { key: 'detail', name: $translate.instant('patientemr.eyehistorysections.details.lbl') },
        ]
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
            if (modalConfig && modalConfig.params.option) {
                $scope.currentcontext.option = modalConfig.params.option;
            }
        }
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter) {
            $scope.currentcontext.eid = $scope.currentcontext.encounter.Id;
            $scope.currentcontext.enctypeid = $scope.currentcontext.encounter.EncounterTypeId;
        }
        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.item.EncounterId = $scope.currentcontext.eid;
        $scope.item.EncounterTypeId = $scope.currentcontext.enctypeid;

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'emr/familysocialhistory/GetfamilysocialhistoryById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.$watch('$scope.config.favoritetypeid',
            function (newValue) {
                if (newValue) {
                    $scope.getFavoriteMasters();
                }
            });

        $scope.emrfavouritesettings = function () {
            utl.Modal.open('app.favoritemaster', {
                params: { id: 0, favoritetypeid: 5, parent: "txn" },
                confirmCallback: $scope.getFavoriteMasters,
                cancelCallback: $scope.getFavoriteMasters
            });
        }

        //$scope.saveFavorites
        $scope.saveFavorites = function () {
            //console.log($scope.listmodel);
            $scope.favconfig.selectedlist = [];
            for (var itemId in $scope.listmodel) {
                var isselected = $scope.listmodel[itemId];
                if (isselected == true) {
                    var detail = $scope.listItemMap[itemId];
                    $scope.favconfig.selectedlist.push(detail);
                    $scope.listmodel[itemId] = false; //resetting the favorite
                }
            }
            if ($scope.favconfig.selectedlist && $scope.favconfig.selectedlist.length > 0) {
                $scope.saveclick();
            }
        }
        $scope.saveclickCallback = function (scope, res, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.saveclick = function () {
            var list = [];
            for (var idx in $scope.favconfig.selectedlist) {
                var favitem = $scope.favconfig.selectedlist[idx];
                var procedure = utl.Lookup.getObject($scope.lookup.Procedure, favitem.ItemId);
                var item = {
                    PatientId: $scope.currentcontext.pid, SocialTypeId: favitem.ItemId,
                    ReviewDate: utl.Formatter.getCurrentDate(), SocialHistoryStatusId: 1, EncounterId: utl.Session.getEncounterId()
                };
                list.push(item);
            }

            var options = {
                action: 'emr/familysocialhistory/Managefamilysocialhistorys',
                data: { Data: list },
                type: 'post',
                onComplete: $scope.saveclickCallback
            };
            utl.Http.doAction(options);
        }

        $scope.caretClicked = function (detail) {
            $scope.currentcontext.option = 'detail';
            $scope.item.SocialTypeId = detail.ItemId;
            // $scope.currentcontext.option = 'detail';
            // $scope.favconfig.selecteddetail = detail;
            // $scope.saveFavorites();
        }
        // get fav list
        function afterGet(res) {
            var result = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                for (var idx in item.FavoriteMasterDetails) {
                    var favdetail = item.FavoriteMasterDetails[idx];
                    favdetail.Header = item.Description;
                    result.push(favdetail);
                    $scope.listmodel[favdetail.ItemId] = false;
                    $scope.listItemMap[favdetail.ItemId] = favdetail;
                }
            }
            $scope.list = result;
        }

        $scope.CanFavGrouped = function () {
            if ($scope.groups && $scope.groups.length == 1 && !$scope.groups[0]) { //check for null grouped data
                return false;
            }
            return $scope.groups && $scope.groups.length > 0;
        }

        //getFavoriteMasters
        $scope.getFavoriteMastersCallback = function (scope, res, options, hasError) {
            if (!res || !res.Data || res.Data.length == 0) {
                $scope.getFavoriteMastersByAdmin();
            } else {
                afterGet(res);
            }
        }
        $scope.getFavoriteMasters = function () {

            var inputData = {
                Params: [
                    { Key: 3, Value: 5 },
                    { Key: 5, Value: utl.Session.getCurrentUserId() }
                ],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'clinicalmaster/FavoriteMaster/GetFavoriteMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getFavoriteMastersCallback
            };
            utl.Http.doAction(options);
        }

        //getFavoriteMastersByAdmin
        $scope.getFavoriteMastersByAdminCallback = function (scope, res, options, hasError) {
            afterGet(res);
        }
        $scope.getFavoriteMastersByAdmin = function () {

            var inputData = {
                Params: [
                    { Key: 3, Value: 5 },
                    { Key: 6, Value: true } //AdminFav - true
                ],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'clinicalmaster/FavoriteMaster/GetFavoriteMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getFavoriteMastersByAdminCallback
            };
            utl.Http.doAction(options);
        }
        //Favorite area ends

        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {
            var actionName = 'emr/familysocialhistory/Addfamilysocialhistory';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/familysocialhistory/Updatefamilysocialhistory';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getFavoriteMasters();
            if ($scope.currentcontext.option == 'detail') {
                $scope.getItem();
            }
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Severity" },
                { "Key": "SocialType" },
                { "Key": "SocialFrequency" },
                { "Key": "SocialHistoryStatus" },
                { "Key": "Relationship" },
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }
        $scope.initLookup();

    }
    FamilySocialHstryFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();