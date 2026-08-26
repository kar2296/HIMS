(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('opbillingMoreController', opbillingMoreController);

    function opbillingMoreController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.IsEditable = modalConfig.params.IsEditable;
        $scope.selectedPatient = modalConfig.params.patient;
        $scope.RateTypeId = modalConfig.params.ratetype;
        $scope.item = {

        }
        $scope.item = modalConfig.params.item;
        if ($scope.item.DoctorShare > 0)
            $scope.item.IsDoctorDiscount = true;

        $scope.Save = function () {
            $scope.confirmCallback($scope.item);
        }

        $scope.SelectedDoctor = function (selectedItem) {
            $scope.item.PerformDoctorId = selectedItem.DoctorId;
            $scope.item.PerformDoctorName = selectedItem.Text;
            $scope.item.PerformDrShareValue = selectedItem.DoctorShareValue;
            $scope.item.PerformDrShare = selectedItem.DoctorShare;
        };

        $scope.doctorChange = function () {
            $scope.item.DoctorClassId = -1;
            $scope.item.DrIncludeTax = 0;
            $scope.item.DrShareDetailInfo = {};
            $scope.item.SerItmCalculateTax = false;
            $scope.item.SerItmGSTInfo = {};
            if ($scope.item.DoctorId) {
                var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
                $scope.calDoctorShareInfo(doctorObj);
            }
        };

        $scope.calDoctorShareInfo = function (doctorObj) {
            if (doctorObj.DoctorClassId) {
                $scope.item.DoctorClassId = doctorObj.DoctorClassId;
                $scope.item.DrIncludeTax = doctorObj.IsIncludeTax;
                $scope.item.DrShareDetailInfo = {};
                $scope.item.SerItmCalculateTax = false;
                $scope.item.SerItmGSTInfo = {};
                if (doctorObj.DoctorClassId > 0) {
                    var inputData = {
                        Params: [{
                                Key: 2,
                                Value: doctorObj.DoctorClassId
                            },
                            {
                                Key: 4,
                                Value: 1
                            }, // EncounterTypeId
                        ],
                        PageContext: {
                            PageSize: -1,
                            PageNumber: 1
                        }
                    };
                    var options = {
                        action: 'billing/doctorshare/GetDoctorShare',
                        data: inputData,
                        type: 'post',
                        onComplete: $scope.getDoctorShareCallback
                    };
                    utl.Http.doAction(options);
                }
            }
        };

        $scope.getDoctorShareCallback = function (scope, res, options, hasError) {
            if (res && res.Data) {
                for (var idx in res.Data) {
                    var item = res.Data[idx];
                    $scope.item.DrShareDetailInfo = item.DoctorShareDetails;
                }
            }
        };

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
                result = [selectedItem.ServiceName + '(' + selectedItem.ServiceCode + ')'].join(' ');
            } else if (vm.serviceitemcontrolconfig.rowdata) {
                result = [vm.serviceitemcontrolconfig.rowdata.ServiceCode, vm.serviceitemcontrolconfig.rowdata.ServiceName].join(' ');
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
                }, ],
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
                // if (item.ServiceItemTariffDetails && item.ServiceItemTariffDetails.length > 0)
                //     item.ServiceItemRate = item.ServiceItemTariffDetails[0].Rate;

            }
        }
        //autosearch related code starts for Doctors
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
                },
                {
                    header: 'Qualification',
                    field: 'Qualification',
                    datatype: 'string',
                    headercls: 'td-Qualification',
                    fieldcls: 'td-Qualification'
                },
                {
                    header: 'Speciality',
                    field: 'Speciality',
                    datatype: 'string',
                    headercls: 'td-dept',
                    fieldcls: 'td-dept'
                },
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
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
                    vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.Speciality
                ].join(' ');
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
                }],
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
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }

        //autosearch related code ends for Doctors

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.refreshReactProps();
        }
        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "PerformingDoctor",
                    Request: {
                        Params: [{
                            Key: 5,
                            Value: $scope.item.ServiceId
                        }, {
                            Key: 6,
                            Value: $scope.RateTypeId
                        }]
                    }
                },
                {
                    "Key": "DiscountType"
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

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                isEditable: $scope.IsEditable,
                discountTypeId: $scope.item.DiscountTypeId,
                servPerformDoctorId: $scope.item.ServPerformDoctorId,
                discountTypeOptions: ($scope.lookup && $scope.lookup.DiscountType) || [],
                performingDoctorOptions: ($scope.lookup && $scope.lookup.PerformingDoctor) || []
            };
            $scope.$applyAsync();
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'discountTypeChange':
                    $scope.item.DiscountTypeId = payload.value;
                    $scope.refreshReactProps();
                    break;
                case 'performDoctorChange':
                    $scope.item.ServPerformDoctorId = payload.value;
                    var selected = null;
                    for (var idx in ($scope.lookup.PerformingDoctor || [])) {
                        if ($scope.lookup.PerformingDoctor[idx].Id === payload.value) {
                            selected = $scope.lookup.PerformingDoctor[idx];
                            break;
                        }
                    }
                    if (selected) {
                        $scope.SelectedDoctor(selected);
                    }
                    $scope.refreshReactProps();
                    break;
            }
        };

        $scope.initLookup();

    }

    opbillingMoreController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();