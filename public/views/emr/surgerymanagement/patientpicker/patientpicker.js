(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientPickerController', patientPickerController);

    function patientPickerController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        /*Enter key - Shortcut Keys - Start */
        function keyupHandler(e) {
            var kCode = e.keyCode;
            if (kCode == 13) { // Enter Key
                $scope.actionClick('apply');
            }
        }
        angular.element(document).on('keydown', keyupHandler);
        $scope.$on('$destroy', function () {
            angular.element(document).off('keydown', keyupHandler);
        });
        /*Enter key - Shortcut Keys - End */

        //Dynamic form starts
        function initDynamicForm() {
            $scope.defaultdata = {
                mrn: '',
                patientname: '',
                dateofbirth: '',
                status: 2,
                phoneno: '',
                visitid: '',
                //To: utl.Formatter.getCurrentDate(),
                From: '',
                To:'',
                ReferralId: -1,
                PinCode: '',
                VisitDate: '',
                Country: '',
                VisitTypeId: -1,
                State: '',
                GuarantorId: -1,
                CityTown: '',
                IsAdmitted: false,
                Area: ''
            };

            $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));

            $scope.schema = {
                layout: 'grid',
                controls: [
                    { type: 'text', translate: 'registration.patientpicker.filter_mrn.lbl', model: 'mrn', position: { r: 0, c: 0 } },
                    { type: 'text', translate: 'registration.patientpicker.filter_patientname.lbl', model: 'patientname', position: { r: 0, c: 1 } },
                    { type: 'date', translate: 'registration.patientpicker.filter_dateofbirth.lbl', model: 'dateofbirth', position: { r: 0, c: 2 } },
                    { type: 'text', translate: 'registration.patientpicker.filter_phoneno.lbl', model: 'phoneno', position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'registration.patientpicker.filter_status.lbl', model: 'status', options: $scope.lookup.PatientStatus, position: { r: 1, c: 1 } },
                    { type: 'text', translate: 'registration.patientpicker.filter_visitid.lbl', model: 'visitid', position: { r: 1, c: 2 } },
                    { type: 'date', translate: 'registration.patientpicker.filter_registerfromdate.lbl', model: 'From', position: { r: 2, c: 0 } },
                    { type: 'date', translate: 'registration.patientpicker.filter_registertodate.lbl', model: 'To', position: { r: 2, c: 1 } },
                    { type: 'text', translate: 'registration.patientpicker.filter_area.lbl', model: 'Area', position: { r: 2, c: 2 } },
                    { type: 'text', translate: 'registration.patientpicker.filter_pincode.lbl', model: 'PinCode', position: { r: 3, c: 0 } },
                    { type: 'date', translate: 'registration.patientpicker.filter_visitdate.lbl', model: 'VisitDate', position: { r: 3, c: 1 } },
                    { type: 'text', translate: 'registration.patientpicker.filter_country.lbl', model: 'Country', position: { r: 3, c: 2 } },
                    { type: 'select', translate: 'registration.patientpicker.filter_visittype.lbl', model: 'VisitTypeId', options: $scope.lookup.VisitType, position: { r: 4, c: 0 } },
                    { type: 'text', translate: 'registration.patientpicker.filter_state.lbl', model: 'State', position: { r: 4, c: 1 } },
                    { type: 'text', translate: 'registration.patientpicker.filter_citytown.lbl', model: 'CityTown', position: { r: 4, c: 2 } },
                    { type: 'select', translate: 'registration.patientpicker.filter_guarantor.lbl', model: 'GuarantorId', options: $scope.lookup.Guarantor, position: { r: 5, c: 0 } },
                    { type: 'select', translate: 'registration.patientpicker.filter_referredby.lbl', model: 'ReferralId', options: $scope.lookup.Referral, position: { r: 5, c: 1 } },
                    { type: 'text', translate: 'registration.fullregistration.guardianname.lbl', model: 'GuardianName', position: { r: 5, c: 2 } },
                    { type: 'checkbox', translate: 'registration.patientpicker.filter_isadmitted.lbl', model: 'IsAdmitted', position: { r: 6, c: 0 } }


                ],
                actions: [
                    // { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' },
                    // { type: 'apply', translate: 'common.searchaction.lbl', cls: 'btn-primary' }
                    { type: 'apply', translate: 'common.searchaction.lbl', cls: 'btn-primary' },
                    { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }

                ]
            };
        }

        $scope.actionClick = function (actionType) {
            if (actionType == 'reset') {
                $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));;
            }
            $scope.getList();
        }

        //Dynamic form  ends

        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            var items = res.Data;
            for (var idx in items) {
                var item = items[idx];
                item.LatestAppointment = (item.Appointments != null
                    && item.Appointments.length > 0)
                    ? item.Appointments[0] : null;
            }
            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $('#mrn').focus();
        };

        $scope.getList = function (pageNo) {
            if (($scope.modeldata.patientname || $scope.modeldata.mrn) || $scope.modeldata.phoneno) {
                $scope.modeldata.From = '';
                $scope.modeldata.To = '';
            }
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.modeldata.patientname },
                    { Key: 26, Value: $scope.modeldata.mrn },
                    { Key: 3, Value: $scope.modeldata.dateofbirth },
                    { Key: 4, Value: $scope.modeldata.phoneno },
                    { Key: 5, Value: $scope.modeldata.visitid },
                    { Key: 7, Value: $scope.modeldata.status },
                    { Key: 8, Value: true }, //IncludeAppointments
                    { Key: 9, Value: utl.Formatter.getFilterDate($scope.modeldata.From) },
                    { Key: 10, Value: utl.Formatter.getFilterDate($scope.modeldata.To) },
                    { Key: 11, Value: $scope.modeldata.ReferralId },
                    //{ Key: 27, Value: [From, To] },
                    { Key: 31, Value: $scope.modeldata.VisitTypeId },
                    { Key: 14, Value: $scope.modeldata.GuarantorId },
                    { Key: 15, Value: $scope.modeldata.IsAdmitted ? 2 : -1 },
                    { Key: 16, Value: $scope.modeldata.PinCode },
                    { Key: 17, Value: $scope.modeldata.Country },
                    { Key: 18, Value: $scope.modeldata.State },
                    { Key: 19, Value: $scope.modeldata.CityTown },
                    { Key: 20, Value: $scope.modeldata.Area }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            if ($scope.modeldata.VisitDate) {
                var From = $filter('date')($scope.modeldata.VisitDate, 'yyyy-MM-dd 00:00:00') || null;
                var To = $filter('date')($scope.modeldata.VisitDate, 'yyyy-MM-dd 23:59:59') || null;
                inputData.Params.push(
                    { Key: 27, Value: [From, To] },
                );
            }
            if ($scope.modeldata.From) {
                var From = $filter('date')($scope.modeldata.From, 'yyyy-MM-dd 00:00:00') || null;
                var To = $filter('date')($scope.modeldata.To, 'yyyy-MM-dd 23:59:59') || null;
                inputData.Params.push(
                    { Key: 9, Value: From },
                    { Key: 10, Value: To },
                );
            }
            var options = {
                action: 'registration/patient/GetPatients',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "MRN", displayName: $translate.instant('registration.patientpicker.mrn.lbl') },
                {
                    field: "FirstName", displayName: $translate.instant('registration.patientpicker.patientname.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents"> {{row.entity.Title.Description}} {{row.entity.FirstName}} {{row.entity.LastName}}</div>'
                },
                {
                    field: "AddressLine1", displayName: $translate.instant('registration.patientpicker.address.lbl'), width: '30%',
                    cellTemplate: 'patientaddress.html'
                },
                {
                    field: "DOB", displayName: $translate.instant('registration.patientpicker.dob.lbl'),
                    cellTemplate: "<ngformatdate date-val='row.entity.DOB'></ngformatdate>"
                },
                {
                    field: "Appointments[0].AppointmentStatus.Description", displayName: $translate.instant('registration.patientpicker.visitstatus.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span  ng-hide='row.entity.Encounters[0].AdmissionStatus' ng-if='row.entity.Appointments[0].AppointmentStatus'>{{row.entity.Appointments[0].AppointmentStatus.Description}}</span>" +
                        "<span  ng-if='row.entity.Encounters[0].AdmissionStatus'>{{row.entity.Encounters[0].AdmissionStatus.Description }}</span>" +
                        "</div>"
                },
                { field: "PatientStatus.Description", displayName: $translate.instant('registration.patientpicker.regstatus.lbl') },
                {
                    field: "Contact", displayName: $translate.instant('registration.patientpicker.phone.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span ng-hide='row.entity.LandLine' ng-if='row.entity.Mobile'>{{row.entity.Mobile}}</span>" +
                        "<span  ng-if='row.entity.LandLine'>{{row.entity.LandLine}}</span>" +
                        "</div>"
                }
            ],
            enableFullRowSelection: true,
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        //Grid selection related code starts
        vm.gridConfig.enableRowSelection = true;
        vm.gridConfig.multiSelect = false
        vm.gridConfig.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                console.log(row.entity.Id);
                $scope.confirmCallback({ pid: row.entity.Id, patient: row.entity });
            });
        };
        //Grid selection related code ends

        //Lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "PatientStatus" },
                { "Key": "Referral" },
                { "Key": "VisitType" },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
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

    patientPickerController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();