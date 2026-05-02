(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('VirtualServiceFormController', VirtualServiceFormController);

    function VirtualServiceFormController($scope, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));

        $scope.item = {
            IsActive: true,
            MasterTypeId: 2,
            IsDuplicateAlert: true,
            IsVirtualService: true,
            GstId: 1
        };
        $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
        $scope.lookup = {};
        $scope.currentcontext = {};
        $scope.currentcontext.file = null;
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.item.ActiveFrom = utl.Formatter.getCurrentDate();


        $scope.GetVirtualserviceimgCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.Image = data.Image;
        };

        $scope.GetVirtualserviceimg = function () {
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


        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.masterChange();
            $scope.GetVirtualserviceimg();
        };

        $scope.getItem = function (pageNo) {
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

        $scope.backToList = function () {
            $state.go('app.virtualserviceitems');
        }

        $scope.errorItemCallback = function (data, options) {
            if (data.Error && data.Error.Code == 'ALREADYEXIST') {
                utl.Alert.showErrorMsg($translate.instant('clinicalmaster.serviceitem-form.excode.lbl'));

            }
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof (data) == "boolean") {
                if (options && options.data != null && options.data.Data != null) {
                    $scope.currentcontext.id = options.data.Data.Id;
                    $scope.getItem();
                }
            } else if (typeof (data) == "number") {
                //  $state.go('app.usertab.general');
                $state.go('app.virtualtab.virtualserviceform', {
                    id: data
                });
            } else {
                $scope.backToList(); // Safer side added
            }
            loadImages();
        };

        $scope.saveItem = function () {

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
                }).then(function (resp) { //upload function returns a promise
                        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                        $scope.currentcontext.file = null;
                        $scope.backToList();
                    },
                    function (resp) { //catch error
                        console.log('Error status: ' + resp.status);
                        utl.Alert.showErrorMsg('Error status: ' + resp.status);
                    },
                    function (evt) {
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

        $scope.clear = function () {
            $scope.item = {};
        };
        // TestMaster AutoSearch
        var code = {
            header: 'Code',
            field: 'Code',
            datatype: 'string',
            headercls: 'td-code',
            fieldcls: 'td-code'
        };
        var Name = {
            header: 'Name',
            field: 'Name',
            datatype: 'string',
            headercls: 'td-name',
            fieldcls: 'td-name'
        };
        var Type = {
            header: 'Type',
            field: 'Sampletype',
            datatype: 'string',
            headercls: 'td-type',
            fieldcls: 'td-type'
        };
        var Department = {
            header: 'Department',
            field: 'Department',
            datatype: 'string',
            headercls: 'td-dept',
            fieldcls: 'td-dept'
        };
        var DrugName = {
            header: 'Drug Name',
            field: 'DrugName',
            datatype: 'string',
            headercls: 'td-price',
            fieldcls: 'td-name'
        };
        var DrugCode = {
            header: 'Drug Code',
            field: 'DrugCode',
            datatype: 'string',
            headercls: 'td-price',
            fieldcls: 'td-code'
        };
        var DrugType = {
            header: 'Drug Type',
            field: 'DrugType',
            datatype: 'string',
            headercls: 'td-price',
            fieldcls: 'td-type'
        };
        var GenericName = {
            header: 'Generic Name',
            field: 'GenericName',
            datatype: 'string',
            headercls: 'td-price',
            fieldcls: 'td-generic'
        };
        var DietCode = {
            header: 'Code',
            field: 'DietItemCode',
            datatype: 'string',
            headercls: 'td-code',
            fieldcls: 'td-code'
        };
        var DietName = {
            header: 'Name',
            field: 'DietName',
            datatype: 'string',
            headercls: 'td-name',
            fieldcls: 'td-name'
        };
        vm.testcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [code, Name, Type, Department],
            searchparams: {},
            result: {},
            api: '',
            formatdisplay: formatselectedtest,
            presearch: presearchtest,
            postsearch: postsearchtest,
            type: 2
        };
        $scope.changeOrderable = function () {
            if (!$scope.item.IsOrderable) {
                $scope.item.MasterTypeId = -1;
                $scope.item.MasterItemId = 0;
            }
        }
        $scope.masterChange = function () {
            vm.testcontrolconfig.type = $scope.item.MasterTypeId;
            vm.testcontrolconfig.api = $scope.item.MasterTypeId == 1 ? 'clinicalmaster/DrugMaster/GetDrugMasters' : 'lis/testmaster/GetTestmasters';
            if (vm.testcontrolconfig.type == 3)
                vm.testcontrolconfig.api = 'clinicalmaster/DietItemMaster/GetDietItemMasters'
        }

        function formatselectedtest() {
            var selectedItem = vm.testcontrolconfig.selected;
            var result = '';
            if (vm.testcontrolconfig.type == 2) {
                if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                    result = [selectedItem.Name + '(' + selectedItem.Code + ')'].join('  ');
                    $scope.item.MasterName = selectedItem.Name;
                    $scope.item.OrderTypeId = selectedItem.TESTMASTERTYPId;
                } else if (vm.testcontrolconfig.rowdata) {
                    result = [vm.testcontrolconfig.rowdata.TestCode, vm.testcontrolconfig.rowdata.TestName].join(' ');
                }
            }
            if (vm.testcontrolconfig.type == 1) {
                if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                    result = [selectedItem.DrugName + '(' + selectedItem.DrugCode + ')'].join('  ');
                } else if (vm.testcontrolconfig.rowdata) {
                    result = [vm.testcontrolconfig.rowdata.DrugName, vm.testcontrolconfig.rowdata.DrugCode].join(' ');
                }
            }
            if (vm.testcontrolconfig.type == 3) {
                if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                    result = [selectedItem.DietName + '(' + selectedItem.DietItemCode + ')'].join('  ');
                } else if (vm.testcontrolconfig.rowdata) {
                    result = [vm.testcontrolconfig.rowdata.DietName, vm.testcontrolconfig.rowdata.DietItemCode].join(' ');
                }
            }
            return result;
        }

        function presearchtest() {

            var query = vm.testcontrolconfig.query;

            var inputData = {
                Params: [
                    // $scope.item.MasterTypeId == 1 ? { Key: 3, Value: 2 } : { Key: 6, Value: 2 },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if (vm.testcontrolconfig.type == 1)
                inputData.Params.push({
                    Key: 3,
                    Value: 2
                })
            else if (vm.testcontrolconfig.type == 2)
                inputData.Params.push({
                    Key: 6,
                    Value: 2
                })
            else if (vm.testcontrolconfig.type == 3)
                inputData.Params.push({
                    Key: 3,
                    Value: 2
                })

            if (vm.testcontrolconfig.type != 3) {
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
            }
            if (vm.testcontrolconfig.type == 3) {
                if (vm.testcontrolconfig.searchbyid == true) {
                    inputData.Params.push({
                        Key: 0,
                        Value: query
                    });
                } else if (query && query.length > 2) {
                    inputData.Params.push({
                        Key: 4,
                        Value: query
                    });
                }
            }
            vm.testcontrolconfig.searchparams = inputData;
        }

        function postsearchtest() {
            if (vm.testcontrolconfig.type == 2) {
                vm.testcontrolconfig.options = [code, Name, Type, Department];
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
                    item.Department = item.Department.DepartmentName;
                    if (item.SampletypeId > 0) {
                        item.Sampletype = item.Sampletype.Name;
                    }
                }
            }
            if (vm.testcontrolconfig.type == 1) {
                vm.testcontrolconfig.options = [DrugCode, DrugName, DrugType, GenericName];
                for (var idx in vm.testcontrolconfig.result) {
                    var item = vm.testcontrolconfig.result[idx];
                    item.DrugName = item.DrugName;
                    item.DrugCode = item.DrugCode;
                    item.DrugType = item.DrugType.Description;
                    if (item.GenericMaster)
                        item.GenericName = item.GenericMaster.GenericName;
                }
            }
            if (vm.testcontrolconfig.type == 3) {
                vm.testcontrolconfig.options = [DietCode, DietName];
                for (var idx in vm.testcontrolconfig.result) {
                    var item = vm.testcontrolconfig.result[idx];
                    item.DietName = item.DietName;
                    item.DietItemCode = item.DietItemCode;
                }
            }

        }

        $scope.onDeptSelected = function (selectedItem) {
            $scope.item.SubDepartmentId = selectedItem.Id;
        };
        $scope.deptChange = function () {
            var deptObj = utl.Lookup.getObject($scope.lookup.Department, $scope.item.SubDepartmentId);
            $scope.item.DepartmentId = deptObj.DepartmentId;
            setAssignToDetails();
            $scope.getList();
        };
        $scope.onCategorySelected = function (selectedItem) {
            $scope.item.SubCategoryId = selectedItem.Id;
        };
        $scope.categoryChange = function () {
            var deptObj = utl.Lookup.getObject($scope.lookup.ServiceCategory, $scope.item.SubCategoryId);
            $scope.item.CategoryId = deptObj.CategoryId;
            setAssignToDetails();
            $scope.getList();
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
            if ($scope.item.ActiveFrom == null)
                $scope.item.ActiveFrom = new Date();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "TESTMASTERTYP"
                },
                {
                    "Key": "ServiceCategory"
                },
                {
                    "Key": "GstMaster",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 5,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },]
                    }
                },
                {
                    "Key": "MasterType"
                },
                {
                    "Key": "TESTMASTERTYP"
                },
                {
                    "Key": 'ServiceSubCategory',
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: $scope.item.CategoryId
                        }]
                    }
                },
                {
                    "Key": "Department"
                },
                // {
                //     "Key": 'Department',
                //     Request: {
                //         Params: [{ Key: 4, Value: 1 }]
                //     }
                // },
                {
                    "Key": 'SubDepartment',
                    Request: {
                        Params: [{
                            Key: 6,
                            Value: $scope.item.DepartmentId
                        }]
                    }
                },

                {
                    "Key": 'Facility',
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 4,
                            Value: true
                        }]
                    }
                },
                {
                    "Key": 'VirtualSubCategory',
                    Request: {
                        Params: [{
                            Key: 1,
                            Value: $scope.item.CategoryId
                        }]
                    }
                },
                {
                    "Key": "VirtualCategory"
                },
                // {
                //     "Key": "VirtualSubCategory"
                // },


            ];
            $scope.getLookUp(inputData);
        }
        $scope.getLookUp = function (inputData) {
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

        $scope.getsubdeptUsers = function () {
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
        $scope.getsubcategory = function () {
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
        $scope.getvirtualsubcategory = function () {
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

    VirtualServiceFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();