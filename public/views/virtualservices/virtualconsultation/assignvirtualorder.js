(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('AssignOrderController', AssignOrderController);

    function AssignOrderController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};
        $scope.VirtualOrderDetails = [];
        $scope.currentcontext = {};
        $scope.currentcontext.oid = parseInt(modalConfig.params.id);
        $scope.currentcontext.ctgryId = parseInt(modalConfig.params.ctgryId);
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;


        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data.Data[0];
            $scope.VirtualOrderDetails = $scope.item.VirtualOrderDetails;
        };

        $scope.getItem = function (pageNo) {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.oid
                }, ]
            }
            var options = {
                action: 'VirtualHealthcare/VirtualOrder/GetVirtualOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.backToList = function () {
            $scope.confirmCallback();
        };


        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Doctor Id',
                    field: 'DoctorId',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Doctor Name',
                    field: 'DoctorName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                }
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteddoctor,
            presearch: presearchdoctor,
            postsearch: postsearchdoctor
        };

        function formatselecteddoctor() {
            var selectedItem = vm.doctorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.DepartmentId = selectedItem.DepartmentId;
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName].join(' ');
            }
            $scope.item.DoctorName = result;
            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [{
                        Key: 3,
                        Value: 2
                    },
                    {
                        Key: 21,
                        Value: $scope.currentcontext.ctgryId
                    }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if (vm.doctorcontrolconfig.searchbyid == true) {
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
            vm.doctorcontrolconfig.searchparams = inputData;
        }

        function postsearchdoctor() {
            for (var idx in vm.doctorcontrolconfig.result) {
                var item = vm.doctorcontrolconfig.result[idx];
                item.DoctorId = item.Id;
                if (item.Title)
                    item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                if (item.Department)
                    item.Speciality = item.Department.DepartmentName;
            }
        }

        $scope.assignorder = function () {
            $scope.item.VirtualOrderStatusId = 3;
            $scope.saveItem();
        };

        $scope.cancelorder = function () {
            $scope.item.VirtualOrderStatusId = 8;
            $scope.saveItem();
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        $scope.saveItem = function () {
            var lines = getLinesForSave();
            var actionName = '';
            if ($scope.item.VirtualOrderStatusId == 3) {
                actionName = 'VirtualHealthcare/VirtualOrder/AssignVirtualOrder';
            }
            if ($scope.item.VirtualOrderStatusId == 8) {
                actionName = 'VirtualHealthcare/VirtualOrder/UpdateVirtualOrder';
            }

            var inputData = {
                Header: $scope.item,
                Details: lines
            };
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.VirtualOrderDetails) {
                var item = $scope.VirtualOrderDetails[idx];
                if (item.ServiceId > -1 && item.Status == 1) {
                    item.VirtualOrderDetailStatusId = $scope.item.VirtualOrderStatusId;
                    result.push(item);
                }
            }
            return result;
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        };

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "VirtualOrderStatus"
                },
                {
                    "Key": "Department"
                }
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    AssignOrderController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();