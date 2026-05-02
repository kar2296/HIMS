(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('beddetailFormController', beddetailFormController);

    function beddetailFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.Items = [];
        $scope.roomInfo = {};
        $scope.currentcontext = {};
        $scope.bedDetails = [];
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.wardid = parseInt($stateParams.id);
            $scope.currentcontext.roomid = parseInt(modalConfig.params.roomdetailid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        // $scope.currentcontext.wardid = parseInt($stateParams.id);
        //$scope.currentcontext.roomid = parseInt($stateParams.roomdetailid);

        $scope.addItem = function (BedNo, Prefix, ServiceRateCategoryId) {
            var bedDetail = {
                BedNo: BedNo,
                Prefix: Prefix,
                IsTemp: false,
                ServiceRateCategoryId: ServiceRateCategoryId,
                IsActive: true,
                Status: 1
            };
            return bedDetail;
        }
        $scope.addNew = function () {
            if ($scope.bedDetails.length > 0) {
                var bed = {};
                if ($scope.roomInfo.Id) {
                    bed = $scope.addItem($scope.bedDetails.length + 1, $scope.roomInfo.Prefix, $scope.roomInfo.ServiceRateCategoryId);
                }
                else {
                    bed = $scope.addItem(1, '', 0);
                }
                $scope.bedDetails.push(bed);
            }
            else {
                if ($scope.roomInfo.Id) {
                    var FromBedNo = $scope.roomInfo.BedStartNo;
                    var Prefix = $scope.roomInfo.Prefix;
                    var ServiceRateCategoryId = $scope.roomInfo.ServiceRateCategoryId;
                    for (var i = 0; i < $scope.roomInfo.NoOfBed; i++) {
                        var bed = $scope.addItem(FromBedNo, Prefix, ServiceRateCategoryId);
                        $scope.bedDetails.push(bed);
                        FromBedNo += 1;
                    }
                }
                else {
                    $scope.getRoomInfo();
                }
            }
        }
        $scope.clear = function () {

            $scope.bedDetails = [];
            var bedDetail = {
                BedNo: $scope.bedDetails.length + 1,
                Prefix: '',
                IsTemp: '',
                ServiceRateCategoryId: 0,
                IsActive: 0,
                BedStatusId: 1,
                Status: 1
            };
            $scope.bedDetails.push(bedDetail);
        }
        $scope.getRoomInfoCallback = function (scope, data, options, hasError) {
            $scope.roomInfo = data;
            $scope.addNew();
        }

        $scope.getRoomInfo = function () {
            if ($scope.currentcontext.roomid && $scope.currentcontext.roomid > 0) {
                var options = {
                    action: 'generalmaster/wardroommaster/GetWardRoomMasterById',
                    data: { Id: $scope.currentcontext.roomid },
                    type: 'post',
                    onComplete: $scope.getRoomInfoCallback
                };
                utl.Http.doAction(options);
            }
        }

        $scope.clear = function () {
            forEach($scope.bedDetails, function (value, idx) {
                value.Status = 2;
            });
            $scope.addNew();
        }

        $scope.getItemsCallback = function (scope, data, options, hasError) {
            if (data.Data.length == 0)
                $scope.addNew()
            else
                $scope.bedDetails = data.Data;
        }

        $scope.getItems = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.wardid },
                    { Key: 2, Value: $scope.currentcontext.roomid }
                ],
                PageContext: {
                    PageSize: 50,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'generalmaster/WardRoomBedMaster/GetWardRoomBedMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemsCallback
            };

            utl.Http.doAction(options);
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getItems();
            $scope.backToList();
        }

        $scope.saveItem = function () {
            // if (!utl.Validator.validate($scope)) {
            //     return;
            // }

            forEach($scope.bedDetails, function (v, idx) {
                v.WardId = $scope.currentcontext.wardid;
                v.RoomId = $scope.currentcontext.roomid;
                // v.LocationId = $scope.roomInfo.LocationId || 0;
                v.BedStatusId = v.BedStatusId || 1;
                v.FacilityId = utl.Session.getCurrentFacilityId();
                v.Code = v.Prefix + '-' + v.BedNo;
                v.Description = v.Code;
            });
            $scope.performSave($scope.bedDetails, $scope.saveItemCallback);
        }
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        }
        $scope.performSave = function (details, callbackFn) {
            var actionName = 'generalmaster/WardRoomBedMaster/UpdateWardRoomBedMaster';
            var inputData = { 'Details': details };
            var options = {
                action: actionName,
                data: { Data: inputData },
                type: 'post',
                onComplete: callbackFn
            };
            utl.Http.doAction(options);
        }

        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            if (item.Id || item.Id > 0)
                $scope.performSave(item, $scope.deleteItemCallback);
            else {
                var idx = $scope.bedDetails.indexOf(item);
                $scope.bedDetails.splice(idx, 1);
            }
        }

        $scope.deleteBedDetails = function (idx, item) {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, item.BedNo);
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItems();
            // $scope.getRoomInfo();
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "ServiceRateCategory", Request: {
                        Params: [
                            { Key: 2, Value: utl.Session.getCurrentFacilityId() }],
                    }
                }
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

    beddetailFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();