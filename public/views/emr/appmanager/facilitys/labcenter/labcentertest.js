(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('LabCenterProfileTestController', LabCenterProfileTestController);

    function LabCenterProfileTestController($scope, $stateParams, $state, $translate, utl, Upload, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));

        $scope.item = {
            IsActive: true,
            MasterTypeId: 2,
            IsDuplicateAlert: true,
            IsVirtualService: true,
            GstId: 1,
            IsLab: true,
            IsOrderable: true,
            ResultFormatTypeId: 1,
            OrderTypeId: 1
        };
        $scope.currentcontext = {};
        $scope.currentcontext.file = null;
        $scope.CanShowMasterTest = false;
        // if ($stateParams.FacilityId) {
        //     $scope.currentcontext.FacilityId = $stateParams.FacilityId;
        //     $scope.item.FacilityId = $scope.currentcontext.FacilityId;
        // }
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        $scope.currentcontext.id = modalConfig.params.sid;
        $scope.currentcontext.resid = modalConfig.params.resid;

        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        if (modalConfig.params.FacilityId) {
            $scope.currentcontext.FacilityId = parseInt(modalConfig.params.FacilityId);
            $scope.item.FacilityId = $scope.currentcontext.FacilityId;
        }
        $scope.lookup = {};
        $scope.item.ActiveFrom = utl.Formatter.getCurrentDate();


        $scope.GetVirtualserviceimgCallback = function(scope, data, options, hasError) {
            $scope.currentcontext.Image = data.Image;
        };

        $scope.GetVirtualserviceimg = function() {
            if ($scope.item.Imagepath) {
                var inputData = {
                    Id: $scope.item.Id,
                    Imagepath: $scope.item.Imagepath
                };
                var options = {
                    action: 'clinicalmaster/ServiceItem/GetServiceItemImage',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.GetVirtualserviceimgCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.masterChange();
            $scope.GetVirtualserviceimg();
        };

        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'clinicalmaster/ServiceItem/GetServiceItemById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.computeAmount = function(item) {
            if (item.DiscountModeId == 1) {
                var discamt = item.DiscountAmount;
            }
            if (item.DiscountModeId == 2) {
                var discamt = (item.ItemCost) * (item.DiscountAmount) / 100;
            }
            if (item.VAT) {
                var vatamt = (item.ItemCost) * (item.VAT) / 100;
            }
            $scope.item.NetPrice = (parseFloat(item.ItemCost) - parseFloat(discamt || 0)) + parseFloat(vatamt || 0);
        }

        $scope.backToList = function() {
            $scope.confirmCallback();
        }

        $scope.errorItemCallback = function(data, options) {
            if (data.Error && data.Error.Code == 'CODEALREADYEXIST') {
                utl.Alert.showErrorMsg($translate.instant('inventory.itemmasters.codealreadyexist.lbl'));
            } else if (data.Error && data.Error.Code == 'NAMEALREADYEXIST') {
                utl.Alert.showErrorMsg($translate.instant('inventory.itemmasters.namealreadyexist.lbl'));
            } else if (data.Error && data.Error.Code == 'CANNOTINACTIVE') {
                utl.Alert.showErrorMsg($translate.instant('inventory.itemmasters.inactive.lbl'));
            }
        };

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        $scope.saveItem = function() {

            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'clinicalmaster/ServiceItem/AddServiceItem';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'clinicalmaster/ServiceItem/UpdateServiceItem';
            }
            if ($scope.currentcontext.file) {
                var actionUrl = utl.Http.getRootPath() + actionName;
                Upload.upload({
                    url: actionUrl,
                    data: {
                        file: $scope.currentcontext.file,
                        Data: $scope.item
                    }
                }).then(function(resp) { //upload function returns a promise
                        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                        $scope.currentcontext.file = null;
                        $scope.backToList();
                    },
                    function(resp) { //catch error
                        console.log('Error status: ' + resp.status);
                        utl.Alert.showErrorMsg('Error status: ' + resp.status);
                    },
                    function(evt) {
                        console.log(evt);
                    });
                return false;
            } else {
                var options = {
                    action: actionName,
                    data: {
                        Data: $scope.item
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback,
                    onError: $scope.errorItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.saveAndApprove = function() {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do you want to save Test Name?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandApproveConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandApproveConfirmed = function() {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        };

        $scope.clear = function() {
            $scope.item = {};
        };

        vm.testcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Code',
                    field: 'Code',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Name',
                    field: 'Name',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Department',
                    field: 'Department',
                    datatype: 'string',
                    headercls: 'td-dept',
                    fieldcls: 'td-dept'
                },
            ],
            searchparams: {},
            result: {},
            api: 'lis/testmaster/GetTestmasters',
            formatdisplay: formatselectedtest,
            presearch: presearchtest,
            postsearch: postsearchtest
        };

        function formatselectedtest() {
            var selectedItem = vm.testcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.Name + '(' + selectedItem.Code + ')'].join('  ');
            } else if (vm.testcontrolconfig.rowdata) {
                result = [vm.testcontrolconfig.rowdata.TestCode, vm.testcontrolconfig.rowdata.TestName].join(' ');
            }
            return result;
        }

        function presearchtest() {
            var query = vm.testcontrolconfig.query;
            var inputData = {
                Params: [{
                        Key: 6,
                        Value: 2
                    },
                    // {
                    //     Key: 8,
                    //     Value: {
                    //         'ServiceRateCategoryId': $scope.item.ServiceRateCategoryId
                    //     }
                    // }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            if (vm.testcontrolconfig.searchbyid == true) {
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

            vm.testcontrolconfig.searchparams = inputData;
        }

        function postsearchtest() {
            for (var idx in vm.testcontrolconfig.result) {
                var item = vm.testcontrolconfig.result[idx];
                var Tariff = {
                    Rate: 0,
                    DoctorShare: 0
                };
                var ServiceItem = item.ServiceItem;
                if (ServiceItem && ServiceItem.Id > 0 &&
                    ServiceItem.ServiceItemTariffDetails && ServiceItem.ServiceItemTariffDetails.length > 0) {
                    Tariff = ServiceItem.ServiceItemTariffDetails[0];
                }
                item.Tariff = Tariff;
                item.Price = Tariff.Rate;
                if (item.Department)
                    item.Department = item.Department.DepartmentName;
            }
        }


        $scope.onDeptSelected = function(selectedItem) {
            $scope.item.SubDepartmentId = selectedItem.Id;
        };
        $scope.deptChange = function() {
            var deptObj = utl.Lookup.getObject($scope.lookup.Department, $scope.item.SubDepartmentId);
            $scope.item.DepartmentId = deptObj.DepartmentId;
            setAssignToDetails();
            $scope.getList();
        };
        $scope.onCategorySelected = function(selectedItem) {
            $scope.item.SubCategoryId = selectedItem.Id;
        };
        $scope.categoryChange = function() {
            var deptObj = utl.Lookup.getObject($scope.lookup.ServiceCategory, $scope.item.SubCategoryId);
            $scope.item.CategoryId = deptObj.CategoryId;
            setAssignToDetails();
            $scope.getList();
        };

        $scope.getFacInfoCallback = function(scope, data, options, hasError) {
            if (data.ResultFormatTypeId == 2) {
                $scope.CanShowMasterTest = true;
            }
        };

        $scope.getFacInfo = function() {
            if ($scope.currentcontext.FacilityId && $scope.currentcontext.FacilityId > 0) {
                var options = {
                    action: 'SystemSettings/facility/GetFacilityById',
                    data: { Id: $scope.currentcontext.FacilityId },
                    type: 'post',
                    onComplete: $scope.getFacInfoCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            forEach(data, function(value, key) {
                $scope.lookup[key] = value;
            });
            if ($scope.item.ActiveFrom == null)
                $scope.item.ActiveFrom = new Date();
        }

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": 'VirtualSubCategory'
                },
                { "Key": "DiscountMode" },
                {
                    "Key": "VirtualCategory",
                    Request: {
                        Params: [{
                            Key: 5,
                            Value: true
                        }]
                    }
                }
            ];
            $scope.getLookUp(inputData);
        }
        $scope.getLookUp = function(inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initLookup();
        $scope.getItem();
        $scope.getFacInfo();

        $scope.getsubdeptUsers = function() {
            var inputData = [{
                "Key": "SubDepartment",
                Request: {
                    Params: [{
                            Key: 6,
                            Value: $scope.item.DepartmentId || -1
                        },
                        {
                            Key: 5,
                            Value: 2
                        }
                    ]
                }
            }];
            $scope.getLookUp(inputData);
        };
        $scope.getsubcategory = function() {
            var inputData = [{
                "Key": "ServiceSubCategory",
                Request: {
                    Params: [{
                            Key: 7,
                            Value: $scope.item.CategoryId || -1
                        },
                        //{ Key: 5, Value: 2 }
                    ]
                }
            }];
            $scope.getLookUp(inputData);
        };
        $scope.getvirtualsubcategory = function() {
            var inputData = [{
                "Key": "VirtualSubCategory",
                Request: {
                    Params: [{
                            Key: 1,
                            Value: $scope.item.VirtualCategoryId || -1
                        },
                        //{ Key: 5, Value: 2 }
                    ]
                }
            }];
            $scope.getLookUp(inputData);
        };
    }

    LabCenterProfileTestController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload', '$uibModalInstance', 'modalConfig'];

})();