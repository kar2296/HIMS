(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('cnLaserAdviceSectionController', cnLaserAdviceSectionController);
    function cnLaserAdviceSectionController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, uibButtonConfig) {
        var vm = this;
        // uibButtonConfig.activeClass = "btn-success";
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
        $scope.list = [];
        $scope.item = {};
        $scope.listItemMap = {};
        $scope.listmodel = {};
        $scope.currentcontext = {};
        $scope.LaserAdvice = [];
        $scope.favconfig = {
            favoritetypeid: 12,
            selectedlist: [],
            selecteddetail: {}
        };
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.cid = modalConfig.params.cid ? parseInt(modalConfig.params.cid) : null;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.cid = parseInt($scope.$parent.cncontext.consultationid);
        }

        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.item.EncounterId = $scope.currentcontext.eid;
        $scope.item.ConsultationId = $scope.currentcontext.cid;

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.LaserAdvice = data.Data;
            $scope.getFavoriteMasters();
        };
        $scope.getItem = function () {
            var inputData = {
                Params: [
                    { Key: 3, Value: $scope.currentcontext.cid },
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'emr/PatientLaserAdvice/GetPatientLaserAdvices',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.view = function (item, idx) {
            utl.Modal.open('patientemr.laseradvice', {
                params: { id: item.Id },
                confirmCallback: $scope.getList
            });
        }
        $scope.$watch('$scope.favconfig.favoritetypeid',
            function (newValue) {
                if (newValue) {
                    $scope.getFavoriteMasters();
                }
            });

        $scope.emrfavouritesettings = function () {
            utl.Modal.open('app.favoritemaster', {
                params: { id: 0, favoritetypeid: 12, parent: "txn" },
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
                var Data = $scope.favconfig.selectedlist;
                afterselect(Data);
            }
        }
        $scope.addlaseradvice = function () {
            utl.Modal.open('patientemr.laseradvice', {
                params: {
                    id: 0, pid: $scope.currentcontext.pid, eid: $scope.currentcontext.eid,
                    cid: $scope.currentcontext.cid, laserid: $scope.favconfig.selecteddetail.ItemId,
                    lasername: $scope.favconfig.selecteddetail.DisplayName
                },
                confirmCallback: $scope.getItem
            });
        }
        $scope.caretClicked = function (detail) {
            $scope.favconfig.selecteddetail = detail;
            $scope.addlaseradvice();
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
                    { Key: 3, Value: 12 },
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
                    { Key: 3, Value: 12 },
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

        // $scope.saveItemCallback = function (scope, data, options, hasError) {
        //     utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        //     $scope.getItem();
        // };

        // $scope.saveItem = function () {
        //     var actionName = 'emr/PatientLaserAdvice/ManagePatientLaserAdvices';

        //     var options = {
        //         action: actionName,
        //         data: { Data: $scope.item },
        //         type: 'post',
        //         onComplete: $scope.saveItemCallback
        //     };
        //     utl.Http.doAction(options);
        // };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ClinicalFindings" },
                { "Key": "Severity" },
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
    cnLaserAdviceSectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();