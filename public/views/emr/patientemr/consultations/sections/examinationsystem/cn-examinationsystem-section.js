(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('cnExaminationSystemSectionController', cnExaminationSystemSectionController);
    function cnExaminationSystemSectionController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, uibButtonConfig) {
        var vm = this;
        // uibButtonConfig.activeClass = "btn-success";
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
        $scope.list = [];
        $scope.item = {};
        $scope.listItemMap = {};
        $scope.listmodel = {};
        $scope.currentcontext = {
            // option: 'favorites',
        };
        $scope.System = [];
        $scope.SystemData = [];
        $scope.Item = [];
        $scope.favconfig = {
            favoritetypeid: 9,
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
            $scope.SystemData = data.Data;
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
                action: 'emr/PatientExaminationSystem/GetPatientExaminationSystems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.$watch('$scope.favconfig.favoritetypeid',
            function (newValue) {
                if (newValue) {
                    $scope.getFavoriteMasters();
                }
            });

        $scope.emrfavouritesettings = function () {
            utl.Modal.open('app.favoritemaster', {
                params: { id: 0, favoritetypeid: 9, parent: "txn" },
                confirmCallback: $scope.getFavoriteMasters,
                cancelCallback: $scope.getFavoriteMasters
            });
        }
        function afterselect(Data) {
            $scope.System = Data;
            for (var idx in Data) {
                var parameter = Data[idx];
                var params = {
                    Id: parameter.ItemId, Text: parameter.DisplayName
                };
                $scope.addsystemline(params);
            }
        }

        $scope.addsystemline = function (params) {
            var item = {
                System: params.Text,
                SystemId: params.Id,
                Status: 1,
            };
            $scope.SystemData.push(item);
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

        $scope.caretClicked = function (detail) {
            $scope.favconfig.selecteddetail = detail;
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
                    { Key: 3, Value: 9 },
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
                    { Key: 3, Value: 9 },
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
            $scope.getItem();
        };

        $scope.saveItem = function () {
            for (var i = 0; i < $scope.SystemData.length; i++) {
                var parameter = $scope.SystemData[i];
                var data = {
                    PatientId: $scope.item.PatientId,
                    EncounterId: $scope.item.EncounterId,
                    ConsultationId: $scope.item.ConsultationId,
                    SystemId: parameter.SystemId,
                    System: parameter.System,
                    FindingsId: parameter.FindingsId,
                    LeftEye: parameter.LeftEye,
                    RightEye: parameter.RightEye,
                }
                // $scope.getqualifier();
                $scope.Item.push(data)
            }
            var lines = getLinesForSave();
            var actionName = 'emr/PatientExaminationSystem/ManagePatientExaminationSystems';

            var options = {
                action: actionName,
                data: { Data: lines },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.Item) {
                var item = $scope.Item[idx];
                if (item.SystemId > 0) {
                    item.PatientId = $scope.item.PatientId;
                    item.EncounterId = $scope.item.EncounterId;
                    item.ConsultationId = $scope.item.ConsultationId;
                    item.SystemId = item.SystemId;
                    item.System = item.System;
                    item.FindingsId = item.FindingsId;
                    item.LeftEye = item.LeftEye;
                    item.RightEye = item.RightEye;
                    result.push(item);
                }
            }
            return result;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.getFavoriteMasters();
            $scope.getItem();
        }
        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "ClinicalFindings",
                    Request: {
                        Params: [{ Key: 2, Value: 2 },],
                    }
                },
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
    cnExaminationSystemSectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();