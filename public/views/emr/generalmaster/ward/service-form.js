(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('servicedetailFormController', servicedetailFormController);

    function servicedetailFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter) {
        var vm = this;
        $scope.item = {};
        $scope.serviceDetails = [];
        $scope.currentcontext = {};
        $scope.currentcontext.id = 0;
        $scope.WardInfo = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.roomid = parseInt(modalConfig.params.roomdetailid);
            $scope.currentcontext.wardid = parseInt($stateParams.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        // $scope.currentcontext.roomid = parseInt($stateParams.roomdetailid);
        // $scope.currentcontext.wardid = parseInt($stateParams.id);


        $scope.getListCallback = function(scope, data, options, hasError) {
            if (data.Data.length == 0)
                $scope.addNew();
            else
                $scope.serviceDetails = data.Data;

        };

        $scope.addNew = function() {
            var newItem = {
                Id: 0,
                ServiceItemId: 0,
                Quantity: 0,
                ApplyMainOccupancy: 0,
                ApplyDoubleOccupancy: 0,
                IsHourApply: 0,
                Status: 1
            }
            $scope.serviceDetails.push(newItem);
        }

        $scope.getList = function() {
            //if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.roomid
                    },
                    // { Key: 2, Value: $scope.currentcontext.wardid }
                ],
                PageContext: {
                    PageSize: 10,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'generalmaster/WardRoomServiceMap/GetWardRoomServiceMaps',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);

        };


        $scope.getWardByIdCallback = function(scope, data, options, hasError) {
            $scope.WardInfo = data;
        };

        $scope.getWardById = function(pageNo) {
            if ($scope.currentcontext.wardid && $scope.currentcontext.wardid > 0) {

                var options = {
                    action: 'generalmaster/wardmaster/GetwardmasterById',
                    data: { Id: $scope.currentcontext.wardid },
                    type: 'post',
                    onComplete: $scope.getWardByIdCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function() {
            // $state.go('app.wardtab.room');
            $scope.confirmCallback();
        }
        $scope.clear = function() {
            forEach($scope.serviceDetails, function(v, k) {
                v.Status = 2;
            });
            $scope.addNew();
        }
        $scope.itemCount = 0;
        $scope.saveItemCallback = function(scope, data, options, hasError) {
            $scope.itemCount += 1;
            if ($scope.serviceDetails.length == $scope.itemCount) {
                utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                $scope.backToList();
            }
            //$scope.backToList();
        };

        $scope.saveItem = function() {
            $scope.itemCount = 0;
            if (!utl.Validator.validate($scope)) {
                return;
            }

            for (var idx in $scope.serviceDetails) {
                var item = $scope.serviceDetails[idx];
                if (item.ServiceItemId == 0 || item.ServiceItemId == -1) {
                    if (item.Status == 1) {
                        utl.Alert.showErrorMsg($translate.instant('generalmaster.wardmastertab.selectserviceitem.lbl'));

                        return false;
                    }
                    //showInfoMsg
                    //showErrorMsg
                }
            }
            // var actionName = 'generalmaster/WardRoomServiceMap/AddWardRoomServiceMap';
            // if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            //     actionName = 'generalmaster/WardRoomServiceMap/UpdateWardRoomServiceMap';
            // }

            //$scope.item.RoomId = $scope.currentcontext.roomid;
            forEach($scope.serviceDetails, function(v, i) {
                if (v.Status != 2 || v.Id != 0) {
                    v.RoomId = $scope.currentcontext.roomid;
                    var actionName = 'generalmaster/WardRoomServiceMap/AddWardRoomServiceMap';
                    if (v.Id && v.Id > 0) {
                        actionName = 'generalmaster/WardRoomServiceMap/UpdateWardRoomServiceMap';
                    }
                    if (v.ServiceItemId != 0 && v.ServiceItemId != -1) {
                        var options = {
                            action: actionName,
                            data: {
                                Data: v
                            },
                            type: 'post',
                            onComplete: $scope.saveItemCallback
                        };
                    } else {
                        $scope.backToList();
                    }
                    utl.Http.doAction(options);
                }
            });


        };

        $scope.onDeleteConfirmed = function(item) {
            item.Status = 2;
            if ($scope.serviceDetails.length == 0)
                $scope.getList();
            // else {
            //     $scope.addNew();
            // }
        }

        $scope.deleteServiceDetail = function(idx, item) {
            // var name = '';
            // forEach($scope.lookup.ServiceItem, function (v, i) {
            //     if (v.Id == item.ServiceItemId) {
            //         name = v.Text;
            //     }
            // });
            if (item.ServiceItemId != -1)
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
            else
                utl.Alert.showErrorMsg($translate.instant('generalmaster.wardmastertab.invalidoperation.lbl'));
        }

        //autosearch related code starts - 
        vm.serviceitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Service Code',
                    field: 'ServiceCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Service Name',
                    field: 'ServiceName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                // { header : 'ServiceRate Catogory', field : 'ServiceRateCategory', datatype: 'string', headercls:'td-category', fieldcls:'td-category' },
                {
                    header: 'ServiceItem Rate',
                    field: 'ServiceItemRate',
                    datatype: 'string',
                    headercls: 'td-rate',
                    fieldcls: 'td-rate'
                }
            ],
            searchparams: {},
            result: {},
            api: 'ClinicalMaster/ServiceItem/GetServiceItems',
            formatdisplay: formatselectedserviceitem,
            presearch: presearchserviceitem,
            postsearch: postsearchserviceitem
        };

        function formatselectedserviceitem() {
            var selectedItem = vm.serviceitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemCode, selectedItem.Name].join(' ');
            } else if (vm.serviceitemcontrolconfig.rowdata) {
                result = [vm.serviceitemcontrolconfig.rowdata.ServiceItem.ItemCode, vm.serviceitemcontrolconfig.rowdata.ServiceItem.Name].join(' ');
            }
            return result;
        }

        function presearchserviceitem() {
            var query = vm.serviceitemcontrolconfig.query;

            //Search only active patients
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: 2
                    },
                    {
                        Key: 8,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.serviceitemcontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.serviceitemcontrolconfig.searchparams = inputData;
        }

        function postsearchserviceitem() {
            for (var idx in vm.serviceitemcontrolconfig.result) {
                var item = vm.serviceitemcontrolconfig.result[idx];
                item.ServiceCode = item.ItemCode;
                item.ServiceName = item.Name;
                if (item.ServiceItemTariffDetails && item.ServiceItemTariffDetails.length > 0) {
                    var ServiceTraiffobj = $filter('filter')(item.ServiceItemTariffDetails, {
                        ServiceRateCategoryId: $scope.WardInfo.ServiceRateCategoryId,
                        FacilityId: utl.Session.getCurrentFacilityId(),
                    }, true);
                }
                if (ServiceTraiffobj != null && ServiceTraiffobj.length > 0) {
                    item.ServiceItemRate = ServiceTraiffobj[0].Rate;
                }

            }
        }
        //autosearch related code ends - 


        $scope.getList();
        $scope.getWardById();
    }

    servicedetailFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$filter'];

})();