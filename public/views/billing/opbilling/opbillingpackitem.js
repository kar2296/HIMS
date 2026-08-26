(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('opbillingPackageController', opbillingPackageController);

    function opbillingPackageController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.items = [];
        $scope.PackServices = [];
        $scope.item = {};
        $scope.DrLookup = [];
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.lookup = {};
        if (modalConfig && modalConfig.params) {
            $scope.selectedPatient = modalConfig.params.patient;
            $scope.RateTypeId = modalConfig.params.ratetype;
            $scope.IsEditable = modalConfig.params.IsEditable;
            var item = modalConfig.params.item;
            var itms = modalConfig.params.items;
            for (var idx in itms) {
                if (itms[idx].PackageMasterServiceId == item.ServiceId) {
                    $scope.items.push(itms[idx]);
                }
            }
            $scope.item = modalConfig.params.item;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.calcAmt = function (idx, item) {
            if (!item.DiscountAmount) item.DiscountAmount = 0;
            if (item.Amount > item.DiscountAmount) {
                item.NetAmount = (item.Amount - item.DiscountAmount);
            }
        }

        $scope.Save = function () {
            $scope.item.PackageDetails = $scope.items;
            // var data = {
            //     item: $scope.item,
            //     items: $scope.items,
            // };
            $scope.confirmCallback($scope.item);
        }


        //autosearch related code starts for Doctors

        $scope.SelectedDoctor = function (item, selectedItem) {
            item.PerformDoctorId = selectedItem.DoctorId;
            item.PerformDoctorName = selectedItem.DoctorName;
            item.PerformDrShareValue = selectedItem.DoctorShareValue;
            item.PerformDrShare = selectedItem.DoctorShare;
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
        $scope.getPerformDrlookup = function () {
            for (var idx in $scope.items) {
                var docData = $scope.items[idx];
                $scope.getDocLookup(docData);
            }
        }
        $scope.getDocLookupCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                for (var idx in $scope.items) {
                    var item = $scope.items[idx];
                    for (var cdx in data.Data) {
                        var performDr = data.Data[cdx];
                        if (item.ServiceId == performDr.ServiceItemId) {
                            item.DrLookup.push(performDr);
                        }
                    }
                }
            }
            $scope.refreshReactProps();
        };

        $scope.getDocLookup = function (drInfo) {
            var inputData = {
                Params: [{
                        Key: 5,
                        Value: drInfo.ServiceId
                    },
                    {
                        Key: 6,
                        Value: $scope.RateTypeId
                    }
                ],
            };
            // var inputData = [{
            //     "Key": "PerformingDoctor",
            //     Request: {
            //         Params: [{
            //             Key: 5,
            //             Value: drInfo.ServiceId
            //         }, {
            //             Key: 6,
            //             Value: $scope.RateTypeId
            //         }]
            //     }
            // }, ];
            var options = {
                action: 'clinicalmaster/ServiceItemPerformingDoctor/GetServiceItemPerformingDoctors',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDocLookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.getServicePackagesCallback = function (scope, res, options, hasError) {
            for (var idx in res.Data) {
                var item = res.Data[idx];
                item.DrLookup = [];
                $scope.items.push(item);
            }
            $scope.getPerformDrlookup();
            $scope.refreshReactProps();
        };

        $scope.getServicePackages = function () {

            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.item.ServiceId
                }],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'clinicalmaster/serviceitempackagemap/GetServiceItemPackageMaps',
                data: inputData,
                type: 'post',
                onComplete: $scope.getServicePackagesCallback
            };

            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });

        }

        // $scope.initLookup = function () {
        //     var inputData = [{
        //         "Key": "PerformingDoctor",
        //         Request: {
        //             Params: [{
        //                 Key: 6,
        //                 Value: $scope.RateTypeId
        //             }]
        //         }
        //     }, ];

        //     $scope.lookupCall(inputData);
        // }


        $scope.lookupCall = function (inputData) {
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
                packageName: $scope.PackageName,
                items: $scope.items
                    .map(function (item, idx) { item._idx = idx; return item; })
                    .filter(function (item) { return item.Status === 1; }),
                isEditable: $scope.IsEditable
            };
            $scope.$applyAsync();
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'doctorChange':
                    var item = $scope.items[payload.idx];
                    if (item) {
                        item.ServPerformDoctorId = payload.value;
                        var selected = null;
                        for (var idx in (item.DrLookup || [])) {
                            if (item.DrLookup[idx].Id === payload.value) {
                                selected = item.DrLookup[idx];
                                break;
                            }
                        }
                        if (selected) {
                            $scope.SelectedDoctor(item, selected);
                        }
                        $scope.refreshReactProps();
                    }
                    break;
            }
        };

        $scope.getServicePackages();
        // $scope.initLookup();

    }

    opbillingPackageController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();