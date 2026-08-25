(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('drpaymentmodifylistController', drpaymentmodifylistController);

    function drpaymentmodifylistController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.DrShareTotal = 0;

        $scope.currentfilter = {
            BillTypeId: -1,
            DoctorId: -1,
            FromBillDate: utl.Formatter.getCurrentDate(),
            ToBillDate: utl.Formatter.getCurrentDate(),
            // FromBillDate: $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00'),
            // ToBillDate: $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59')
        };

        $scope.item = {};

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                currentfilter: $scope.currentfilter,
                lookup: $scope.lookup,
                gridData: vm.gridConfig.data
            };
        };

        $scope.clearfilter = function () {
            $scope.currentfilter = {
                DoctorId: -1,
                PatientId: -1,
                FromBillDate: utl.Formatter.getCurrentDate(),
                ToBillDate: utl.Formatter.getCurrentDate(),
                // FromBillDate: $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00'),
                // ToBillDate: $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59')
            };
            $scope.item.ServiceId = -1;
            $scope.currentfilter.ServiceId = -1;
            $scope.currentfilter.ServiceName = '';
            vm.gridConfig.data = [];
            $("#DoctorId").val("");
            $("#DoctorId").focus();
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            var vslno = 1;
            var patientname = '';
            $scope.DrShareTotal = 0;
            for (var idx in res.Data) {
                res.Data[idx].slno = vslno++;
                patientname = '';
                if (res.Data[idx].PatientBill && res.Data[idx].PatientBill.Patient &&
                    res.Data[idx].PatientBill.Patient.Title &&
                    res.Data[idx].PatientBill.Patient.Title.Description)
                    patientname += res.Data[idx].PatientBill.Patient.Title.Description;

                if (res.Data[idx].PatientBill && res.Data[idx].PatientBill.Patient &&
                    res.Data[idx].PatientBill.Patient.FirstName)
                    patientname += ' ' + res.Data[idx].PatientBill.Patient.FirstName;

                if (res.Data[idx].PatientBill && res.Data[idx].PatientBill.Patient &&
                    res.Data[idx].PatientBill.Patient.LastName)
                    patientname += ' ' + res.Data[idx].PatientBill.Patient.LastName;

                if (res.Data[idx].PatientBill && res.Data[idx].PatientBill.Patient &&
                    res.Data[idx].PatientBill.Patient.FirstName)
                    res.Data[idx].PatientBill.Patient.FirstName = patientname;

                try {
                    if (res.Data[idx].DoctorShare) {
                        $scope.DrShareTotal += parseFloat(res.Data[idx].DoctorShare);
                    }
                } catch (ex) {}

            }
            vm.gridConfig.data = res.Data;
            $scope.refreshReactProps();
        };

        $scope.getList = function () {
            if (!$scope.item.DoctorId) {
                utl.Alert.showErrorMsg('Please Select Doctor First..!');
                return false;
            }
            if ($scope.item.DoctorId) {
                var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd 00:00:00') || null;
                var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd 23:59:59') || null;
                // var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd HH:mm:ss');
                // var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd HH:mm:ss');
                var Doctorid = $scope.item.DoctorId;
                var inputData = {
                    Params: [{
                            Key: 4,
                            Value: 3
                        },
                        {
                            Key: 6,
                            Value: FrmDate
                        },
                        {
                            Key: 7,
                            Value: ToDate
                        },
                        {
                            Key: 16,
                            Value: Doctorid
                        },
                        {
                            Key: 13,
                            Value: false
                        }, //IsInvoicedDoctorShare
                        {
                            Key: 18,
                            Value: 0
                        },
                        {
                            Key: 27,
                            Value: $scope.currentfilter.PatientId
                        },
                        {
                            Key: 11,
                            Value: $scope.currentfilter.BillNumber
                        },
                        {
                            Key: 28,
                            Value: $scope.item.ServiceId
                        },
                    ],
                    PageContext: {
                        PageSize: -1,
                        PageNumber: 1
                    }
                };

                if ($scope.currentfilter.BillTypeId == 2) {
                    inputData.Params.push({
                        Key: 32,
                        Value: [2, 3]
                    });
                } else {
                    inputData.Params.push({
                        Key: 32,
                        Value: $scope.currentfilter.BillTypeId
                    });
                }

                var options = {
                    action: 'billing/patientbilldetails/GetPatientBillDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.backToform = function () {
            $state.go('app.drpaymentmodifyform');
        };
        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
            $scope.currentfilter.PatientId = $scope.selectedPatient.Id;
            if ($scope.currentfilter.PatientId > 0) {
                $scope.getList();
            }
        };

        $scope.patientChange = function () {
            if ($scope.currentfilter.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.currentfilter.PatientId
                    },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };
                utl.Http.doAction(options);
            }
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                utl.Modal.open('app.drpaymentmodifyform', {
                    params: {
                        patientbilldetail: entity
                    },
                    confirmCallback: $scope.getList
                });
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "slno",
                    displayName: $translate.instant('billing.drpaymentmodify.slno.lbl')
                },
                {
                    field: "PatientBill.BillNumber",
                    displayName: $translate.instant('billing.drpaymentmodify.billnumber.lbl')
                },
                {
                    field: "BillDateTime",
                    displayName: $translate.instant('billing.drpaymentmodify.billdatetime.lbl'),
                    cellTemplate: " <ngformatdate datetime-val='entity.PatientBill.BillDateTime'></ngformatdate>"
                },
                {
                    field: "PatientBill.Patient.MRN",
                    displayName: $translate.instant('billing.drpaymentmodify.mrn.lbl')
                },
                {
                    field: "PatientBill.Patient.FirstName",
                    displayName: $translate.instant('billing.drpaymentmodify.patientname.lbl')
                },
                {
                    field: "ServiceName",
                    displayName: $translate.instant('billing.drpaymentmodify.servicename.lbl')
                },
                // { field: "DoctorName", displayName: $translate.instant('billing.drpaymentmodify.drname.lbl') },
                {
                    field: "DoctorName",
                    displayName: $translate.instant('registration.checkedinpatients.drname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents ptname'>" +
                        "{{entity.Doctor.Title.Description}}&nbsp;</span>" +
                        "<span >{{entity.Doctor.FirstName}}&nbsp;</span>" +
                        "<span >{{entity.Doctor.LastName}}</span>" +
                        "</a></div>",
                },
                {
                    field: "NetAmount",
                    displayName: $translate.instant('billing.drpaymentmodify.amount.lbl')
                },
                {
                    field: "DoctorShare",
                    displayName: $translate.instant('billing.drpaymentmodify.drshare.lbl')
                },
                {
                    field: "DiscountAmount",
                    displayName: $translate.instant('billing.drpaymentmodify.disc.lbl')
                },
                {
                    field: "Remarks",
                    displayName: $translate.instant('billing.drpaymentmodify.remarks.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                     <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"  ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                     </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
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
                $scope.item.DepartmentId = selectedItem.DepartmentId;
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
                    vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            $scope.item.ScheduleApptId = null;
            $scope.item.ScheduleApptTime = null;
            $scope.item.IsCheckedInAppt = false;
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
                        Key: 5,
                        Value: 2
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
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }


        vm.servicecontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Service Code',
                    field: 'ServiceItemCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Short Code',
                    field: 'ServiceItemShortCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Service Name',
                    field: 'ServiceItemName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                }
            ],
            searchparams: {},
            result: {},
            api: 'ClinicalMaster/ServiceItem/GetServiceItems',
            formatdisplay: formatselectedserviceitem,
            presearch: presearchserviceitem,
            postsearch: postsearchserviceitem
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        function formatselectedserviceitem() {
            var selectedItem = vm.servicecontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.Name].join('  ');
            } else if (vm.servicecontrolconfig.rowdata) {
                result = [vm.servicecontrolconfig.rowdata.ServiceItemId, vm.servicecontrolconfig.rowdata.ItemCode,
                    vm.servicecontrolconfig.rowdata.ShortCode, vm.servicecontrolconfig.rowdata.Name
                ].join(' ');
            }
            $scope.currentfilter.ServiceId = selectedItem.Id;
            $scope.currentfilter.ServiceName = result;
            return result;
        }

        function presearchserviceitem() {
            var query = vm.servicecontrolconfig.query;

            var inputData = {
                Params: [{
                    Key: 4,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.servicecontrolconfig.searchbyid == true) {
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

            vm.servicecontrolconfig.searchparams = inputData;
        }

        function postsearchserviceitem() {
            for (var idx in vm.servicecontrolconfig.result) {
                var item = vm.servicecontrolconfig.result[idx];
                item.ServiceItemId = item.ServiceItemId;
                item.ServiceItemCode = item.ItemCode;
                item.ServiceItemShortCode = item.ShortCode;
                item.ServiceItemName = item.Name;
            }
        }


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            var AllBillingType = $scope.lookup.BillType;
            $scope.lookup.BillType = [];
            for (var idx in AllBillingType) {
                var billingtype = AllBillingType[idx];
                if (billingtype.Id == -1 || billingtype.Id == 1 ||
                    billingtype.Id == 2 || billingtype.Id == 5) { // OP / IP / DG
                    $scope.lookup.BillType.push(billingtype);
                }
            }
            $scope.refreshReactProps();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "BillType"
            }, ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleReactAction = function (actionName, payload) {
            payload = payload || {};
            if (actionName === 'billNumberChange') {
                $scope.currentfilter.BillNumber = payload.value;
                $scope.refreshReactProps();
            } else if (actionName === 'fetch') {
                $scope.getList();
            } else if (actionName === 'fromDateChange') {
                $scope.currentfilter.FromBillDate = payload.value ? new Date(payload.value) : null;
                $scope.getList();
            } else if (actionName === 'toDateChange') {
                $scope.currentfilter.ToBillDate = payload.value ? new Date(payload.value) : null;
                $scope.getList();
            } else if (actionName === 'billTypeChange') {
                $scope.currentfilter.BillTypeId = payload.value;
                $scope.refreshReactProps();
            } else if (actionName === 'reset') {
                $scope.clearfilter();
                $scope.refreshReactProps();
            } else if (actionName === 'edit') {
                $scope.handleEvents('edit', payload.entity);
            }
            $scope.$applyAsync();
        };

        $scope.refreshReactProps();

        $scope.initLookup();

    }

    drpaymentmodifylistController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();