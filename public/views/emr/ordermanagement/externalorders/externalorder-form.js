(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('externalorderFormController', externalorderFormController);

    function externalorderFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            LabAssignTypeId: 1,
            UserId: utl.Session.getCurrentUserId(),
            Assigndate: utl.Formatter.getCurrentDate()
        };
        $scope.currentcontext = {};
        $scope.OrdDetails = {};
        $scope.PriceData = {};
        $scope.CanshowAssign = true;
        $scope.CanshowComplete = false;
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.worderid = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.oid = parseInt(modalConfig.params.oid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if ($scope.item.UserId) {
                $scope.item.UserId = data.UserId;
            } else {
                $scope.item.UserId = utl.Session.getCurrentUserId();
            }
            if ($scope.item.Assigndate) {
                $scope.item.Assigndate = data.Assigndate;
            } else {
                $scope.item.Assigndate = utl.Formatter.getCurrentDate();
            }
            if ($scope.item.ExternalOrderStatusId == 1) {
                $scope.CanshowAssign = true;
                $scope.CanshowComplete = false;
            }
            if ($scope.item.ExternalOrderStatusId == 2) {
                $scope.CanshowAssign = false;
                $scope.CanshowComplete = true;
            }
            $scope.getordDetails();
        };
        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.worderid && $scope.currentcontext.worderid > 0) {
                var options = {
                    action: 'lis/patientworkorder/GetPatientWorkorderById',
                    data: {
                        Id: $scope.currentcontext.worderid
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.getordDetailsCallback = function (scope, res, options, hasError) {
            $scope.OrdDetails = res.Data[0];
        };

        $scope.getordDetails = function () {
            if ($scope.currentcontext.oid && $scope.currentcontext.oid > 0) {
                var inputData = {
                    Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.oid
                    }],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'emr/patientorderdetail/GetPatientOrderDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getordDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.SelectedProvider = function (selectedItem) {
            $scope.getPriceInfo(selectedItem);
        };

        $scope.getPriceInfoCallback = function (scope, res, options, hasError) {
            $scope.PriceData = res.Data[0];
            if (res.Data.length > 0) {
                $scope.item.ExternalPrice = $scope.PriceData.Price;
            }
        };

        $scope.getPriceInfo = function (extItem) {
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: $scope.OrdDetails.TestId
                    },
                    {
                        Key: 3,
                        Value: 2
                    },
                    {
                        Key: 5,
                        Value: extItem.Id
                    }
                ],
            };

            var options = {
                action: 'lis/PriceMapping/GetPriceMappings',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPriceInfoCallback
            };

            utl.Http.doAction(options);
        };

        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Doctor Id',
                    field: 'UserId',
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
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.usercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.DoctorId, vm.usercontrolconfig.rowdata.DoctorName,
                    vm.usercontrolconfig.rowdata.Qualification, vm.usercontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            $scope.item.DoctorName = result;

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [{
                    Key: 5,
                    Value: 2
                }],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
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

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.UserId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
            }
        }

        $scope.assignOrderCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.CanshowAssign = false;
            $scope.CanshowComplete = true;
            $scope.confirmCallback();
        };

        $scope.Assign = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do you want to assign this Order?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.assignOrder,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.assignOrder = function () {
            $scope.item.Id = $scope.currentcontext.worderid;
            $scope.item.ExternalOrderStatusId = 2;
            var options = {
                action: 'lis/patientworkorder/AssignExternalProvider',
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.assignOrderCallback
            };
            utl.Http.doAction(options);
        };

        $scope.completeOrderCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.CanshowAssign = false;
            $scope.CanshowComplete = false;
            $scope.confirmCallback();
        };

        $scope.complete = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do you want to complete this Order?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.completeOrder,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.completeOrder = function () {
            $scope.item.Id = $scope.currentcontext.worderid;
            $scope.item.ExternalOrderStatusId = 3;
            $scope.item.WorkOrderStatusId = 4;
            var options = {
                action: 'lis/patientworkorder/CompleteExternalProvider',
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.completeOrderCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }
        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "ExternalProvider"
                },

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
    externalorderFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();