(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('doctorpaymentnepalController', doctorpaymentnepalController);

    function doctorpaymentnepalController($rootScope,$scope, $filter, $stateParams, $state, $translate, utl,$timeout) {
        var vm = this;

        $scope.DrShareTotal = 0;

        $scope.currentfilter = {
            BillTypeId: -1,
            DoctorId: -1,
            FromBillDate: $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00'),
            ToBillDate: $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59')
        };

        $scope.item = {
            DoctorName: $stateParams.DoctorName,
            // ReferralName: $stateParams.ReferralName
        };
        $scope.currentcontext = {
            id: parseInt($stateParams.id),
        };

        $scope.clearfilter = function () {
            $scope.currentfilter = {
                DoctorId: -1,
                PatientId: -1,
                FromBillDate: $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00'),
                ToBillDate: $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59')
            };
            $scope.item.ServiceId = -1;
            $scope.currentfilter.ServiceId = -1;
            $scope.currentfilter.ServiceName = '';
            vm.gridConfig.data = [];
            $("#DoctorId").val("");
            $("#DoctorId").focus();
        }
        $scope.getItemCallback = function (scope, res, options, hasError) {
            $scope.item = res.Data[0];
            $scope.item.PatientName = $scope.item.Patient.FirstName;
            $scope.item.Age = $scope.item.Patient.Age;
            $scope.item.Gender = $scope.item.Patient.Gender.Description;
            $scope.getList();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: $scope.currentcontext.id
                    },],
                };
                var options = {
                    action: 'Visit/Visit/GetEncounters',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

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
                } catch (ex) { }

            }
            vm.gridConfig.data = res.Data;
        };

        $scope.getList = function () {
            if ($scope.item.DoctorId) {
                var Doctorid = $scope.item.DoctorId;
                var inputData = {
                    Params: [
                      
                        { Key: 16, Value: $scope.currentcontext.id },
                       
                    ],
                    PageContext: {
                        PageSize: -1,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'billing/patientbills/GetPatientBills', 
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
                    data: { Id: $scope.currentfilter.PatientId },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };
                utl.Http.doAction(options);
            }
        };
        $scope.onDoctorSelected = function (Selected) {
            $scope.item.DoctorId = Selected.Id;
            $scope.item.DoctorName = Selected.Text;
        }
        $scope.onReferralDoctorSelected = function (Selected) {
            $scope.item.ReferralId = Selected.Id;
            $scope.item.ReferralName = Selected.Text;
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            // $scope.confirmCallback();
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        };

        $scope.saveitem = function () {
                var updatedata = {
                    Id: $scope.currentcontext.id,
                    DoctorId: $scope.item.DoctorId,
                    DoctorName: $scope.item.DoctorName,
                    ReferralId: $scope.item.ReferralId,
                    ReferralName: $scope.item.ReferralName,
                };
                var options = {
                    action: 'Visit/Visit/UpdateEncounter',
                    data: { Data: updatedata },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            };


        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                utl.Modal.open('app.drpaymentmodifynepalform', {
                    params: {
                        patientbill: entity
                    },
                    confirmCallback: $scope.getList
                });
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "slno", displayName: $translate.instant('billing.drpaymentmodify.slno.lbl') },
                { field: "BillNumber", displayName: $translate.instant('billing.drpaymentmodify.billnumber.lbl') },
                {
                    field: "BillDateTime", displayName: $translate.instant('billing.drpaymentmodify.billdatetime.lbl'),
                    cellTemplate: " <ngformatdate datetime-val='entity.BillDateTime'></ngformatdate>"
                },
                // { field: "PatientBill.Patient.MRN", displayName: $translate.instant('billing.drpaymentmodify.mrn.lbl') },
                // { field: "PatientBill.Patient.FirstName", displayName: $translate.instant('billing.drpaymentmodify.patientname.lbl') },
                // { field: "ServiceName", displayName: $translate.instant('billing.drpaymentmodify.servicename.lbl') },
                { field: "DoctorName", displayName: $translate.instant('billing.drpaymentmodify.drname.lbl') },
                { field: "PaidAmount", displayName: $translate.instant('billing.drpaymentmodify.amount.lbl') },
                { field: "DoctorShare", displayName: $translate.instant('billing.drpaymentmodify.drshare.lbl') },
                // { field: "DiscountAmount", displayName: $translate.instant('billing.drpaymentmodify.disc.lbl') },
                // { field: "Remarks", displayName: $translate.instant('billing.drpaymentmodify.remarks.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
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
            options: [
                { header: 'Doctor Id', field: 'DoctorId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Doctor Name', field: 'DoctorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Qualification', field: 'Qualification', datatype: 'string', headercls: 'td-Qualification', fieldcls: 'td-Qualification' },
                { header: 'Speciality', field: 'Speciality', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
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
                Params: [
                    { Key: 3, Value: 2 },
                    { Key: 5, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.doctorcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
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
            options: [
                { header: 'Service Code', field: 'ServiceItemCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Short Code', field: 'ServiceItemShortCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Service Name', field: 'ServiceItemName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' }
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
                Params: [
                    { Key: 4, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.servicecontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
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
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "BillType" },
                { "Key": "Referral" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                
            ]
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

    doctorpaymentnepalController.$inject = ['$rootScope','$scope', '$filter', '$stateParams', '$state', '$translate', 'utl','$timeout'];

})();