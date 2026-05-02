(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('cnSurgeryAdviceSectionController', cnSurgeryAdviceSectionController);
    function cnSurgeryAdviceSectionController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, uibButtonConfig) {
        var vm = this;
        // uibButtonConfig.activeClass = "btn-success";
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
        $scope.list = [];
        $scope.item = {};
        $scope.listItemMap = {};
        $scope.listmodel = {};
        $scope.currentcontext = {};
        $scope.SurgeryAdvice = [];
        $scope.favconfig = {
            favoritetypeid: 10,
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
            $scope.SurgeryAdvice = data.Data;
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
                action: 'emr/PatientSurgeryAdvice/GetPatientSurgeryAdvices',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.view = function (item, idx) {
            utl.Modal.open('patientemr.surgeryadviceform', {
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
                params: { id: 0, favoritetypeid: 10, parent: "txn" },
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
        $scope.addsurgeryadvice = function () {
            utl.Modal.open('patientemr.surgeryadviceform', {
                params: {
                    id: 0, pid: $scope.currentcontext.pid, eid: $scope.currentcontext.eid,
                    cid: $scope.currentcontext.cid, surgid: $scope.favconfig.selecteddetail.ItemId,
                    surgname: $scope.favconfig.selecteddetail.DisplayName
                },
                confirmCallback: $scope.getItem
            });
        }
        $scope.caretClicked = function (detail) {
            $scope.favconfig.selecteddetail = detail;
            $scope.addsurgeryadvice();
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
                    { Key: 3, Value: 10 },
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
                    { Key: 3, Value: 10 },
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
            // $scope.confirmCallback();
            $state.go('patientemr.consultations', {
                pid: $scope.currentcontext.pid
            });
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getItem();
        };

        $scope.saveItem = function () {
            // for (var i = 0; i < $scope.SurgeryAdvice.length; i++) {
            //     var parameter = $scope.SurgeryAdvice[i];
            //     var data = {
            //         PatientId: $scope.item.PatientId,
            //         EncounterId: $scope.item.EncounterId,
            //         ConsultationId: $scope.item.ConsultationId,
            //         SystemId: parameter.SystemId,
            //         System: parameter.System,
            //         FindingsId: parameter.FindingsId,
            //         LeftEye: parameter.LeftEye,
            //         RightEye: parameter.RightEye,
            //     }
            //     // $scope.getqualifier();
            //     $scope.Item.push(data)
            // }
            // var lines = getLinesForSave();
            var actionName = 'emr/PatientSurgeryAdvice/ManagePatientSurgeryAdvices';

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        // function getLinesForSave() {
        //     var result = [];
        //     for (var idx in $scope.Item) {
        //         var item = $scope.Item[idx];
        //         if (item.SystemId > 0) {
        //             item.PatientId = $scope.item.PatientId;
        //             item.EncounterId = $scope.item.EncounterId;
        //             item.ConsultationId = $scope.item.ConsultationId;
        //             item.SystemId = item.SystemId;
        //             item.System = item.System;
        //             item.FindingsId = item.FindingsId;
        //             item.LeftEye = item.LeftEye;
        //             item.RightEye = item.RightEye;
        //             result.push(item);
        //         }
        //     }
        //     return result;
        // }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.getFavoriteMasters();
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
    cnSurgeryAdviceSectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();