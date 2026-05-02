
(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('otbedtransferController', otbedtransferController);

    function otbedtransferController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            isCompleted: true,
            TransferDate: utl.Formatter.getCurrentDate(),

            DisplayCertificateStatus: null,
            NoteTypeId: 1

        };

        $scope.lookup = {};

        $scope.item.FromFacilityId = utl.Session.getCurrentFacilityId();
        $scope.item.ToFacilityId = utl.Session.getCurrentFacilityId();

        $scope.confirmCallback = $uibModalInstance.close;

        $scope.cancelCallback = $uibModalInstance.dismiss;

        $scope.currentcontext = {};

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.historyid = parseInt(modalConfig.params.historyid);
        $scope.currentcontext.encounterid = parseInt(modalConfig.params.encounterid);
        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
        }

        $scope.patientChange = function () {
            if ($scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: { Id: $scope.item.PatientId },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };
                utl.Http.doAction(options);
            }
        }

        $scope.populateEstimateDisDate = function () {
            if ($scope.item.ALOS && $scope.item.ALOS != 0 && $scope.item.StartDate && $scope.item.StartDate != '') {
                var TransferDate = new Date($scope.item.TransferDate);
                $scope.item.ExpectedDischargeDate = new Date(StartDate.getFullYear(),
                    TransferDate.getMonth(),
                    TransferDate.getDate() + parseInt($scope.item.ALOS));
            }
        }
        //Visibility rules starts

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.item.isCompleted = $scope.item.RequestedStatusId == 2;
            $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.item.Id && $scope.item.Id > 0) {
                var options = {
                    action: 'IPManagement/BedTransfer/GetBedTransferById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
            else if ($scope.currentcontext.historyid && $scope.currentcontext.historyid > 0) {
                $scope.getBedTransfer();
            }
        };

        $scope.backToList = function () {
            $state.go('app.admissions');
        }

        $scope.save = function () {
            if ($scope.item.RequestedStatusId && $scope.item.RequestedStatusId > 1)
                $scope.saveItem($scope.item.RequestedStatusId);
            else
                $scope.saveItem(1);
        }

        $scope.onSaveandApproveConfirm = function () {
            if ($scope.item.RequestedStatusId && $scope.item.RequestedStatusId > 2)
                $scope.saveItem($scope.item.RequestedStatusId);
            else
                $scope.saveItem(2);
        }
        $scope.saveAndApprove = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'bedtransfer-list.confirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandApproveConfirm,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.onCompletedConfirm = function () {
            $scope.saveItem(3);
        }
        $scope.bedCharges = function () {
            utl.Modal.open('app.bedcharges', {
                params: { id: $scope.item.ToBedId }
            }
            );
        }

        $scope.Savecomplete = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'bedtransfer-list.completeconfirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCompletedConfirm,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.onCancelConfirmed = function () {
            $scope.saveItem(4);
        }

        $scope.bedDetail = function (data) {
            $scope.item.ToWardId = data.WardId;
            $scope.item.ToRoomId = data.RoomId;
            $scope.item.ToBedId = data.BedId;
            $scope.item.ToLocationId = data.LocationId;
            $scope.item.ToServiceRateCategoryId = data.ServiceRateCategoryId;
        }

        $scope.openWardBed = function () {
            utl.Modal.open('app.WardBedPicker', {
                params: {},
                confirmCallback: $scope.bedDetail
            });
        }

        $scope.occupancy = function () {
            if ($scope.item.PatientId > 0) {
                utl.Modal.open('app.bedoccupancyhistory', {
                    params: { pid: $scope.item.PatientId },
                    confirmCallback: $scope.getList
                });
            }
            else {
                utl.Alert.showErrorMsg($translate.instant('admission.previous-admi-nopatient-msg.lbl'));
            }
        }

        $scope.Cancel = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'medicalcertificate.dischargesummary-form.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                placeholder: $scope.item.ReceiptNumber,
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions, $scope.item.ReceiptNumber);
        }

        $scope.saveDeleteRpt = function () {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, $scope.currentcontext.id);
            // Deleted
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };
        $scope.doctorChange = function () {
            var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
            $scope.item.DepartmentId = doctorObj.DepartmentId;
        }
        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: $scope.item.PatientId },
                confirmCallback: $scope.getItem
            });
        }
        $scope.Bedoccupancy = function () {
            utl.Modal.open('app.bedoccupancyhistory', {
                params: {},
                confirmCallback: $scope.bedDetail
            });
        }
        $scope.getBedOccupancyCallback = function (scope, data, options, hasError) {
            if (data) {
                $scope.BedOccupancyHistorys = data;
                $scope.item.BedOccupancyHistoryId = $scope.BedOccupancyHistorys.Id;
                $scope.item.EncounterId = $scope.BedOccupancyHistorys.EncounterId;
                $scope.item.DoctorId = $scope.BedOccupancyHistorys.DoctorId;
                $scope.item.PatientId = $scope.BedOccupancyHistorys.PatientId;
                $scope.item.FromWardId = $scope.BedOccupancyHistorys.WardId;
                $scope.item.FromRoomId = $scope.BedOccupancyHistorys.RoomId;
                $scope.item.FromBedId = $scope.BedOccupancyHistorys.BedId;
                $scope.item.FromLocationId = $scope.BedOccupancyHistorys.LocationId;
                $scope.item.ServiceRateCategoryId = $scope.BedOccupancyHistorys.ServiceRateCategoryId;
                $scope.item.DepartmentId = $scope.BedOccupancyHistorys.DepartmentId;
                $scope.item.IsDoubleOccupancy = $scope.BedOccupancyHistorys.IsDoubleOccupancy;
                $scope.item.DoubleOccupancy = $scope.item.IsDoubleOccupancy;
            }
        };

        $scope.getBedTransferCallback = function (scope, data, options, hasError) {
            if (data && data.Id != -1) {
                $scope.item = data;
                if (!$scope.item.TransferDate)
                    $scope.item.TransferDate = utl.Formatter.getCurrentDate();
                else
                    $scope.item.TransferDate = new Date(utl.Formatter.getDateTimeStringForAppointment($scope.item.TransferDate));
            }
            else {
                $scope.getBedOccupancy();
            }
            $scope.item.isFrom = true;
        }

        $scope.getBedTransfer = function () {
            if ($scope.currentcontext.encounterid && $scope.currentcontext.encounterid > 0) {
                var options = {
                    action: 'IPManagement/BedTransfer/GetBedTransferByEncounterId',
                    data: { Data: { EncounterId: $scope.currentcontext.encounterid } },
                    type: 'post',
                    onComplete: $scope.getBedTransferCallback
                };
                utl.Http.doAction(options);
            }
        }

        $scope.getBedOccupancy = function () {
            var options = {
                action: 'IPManagement/BedOccupancyHistory/GetBedOccupancyHistoryById',
                data: { Id: $scope.currentcontext.historyid },
                type: 'post',
                onComplete: $scope.getBedOccupancyCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getDoubleOccupancyBedCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                var data = res.Data[0];
                $scope.item.ToWardId = data.WardId;
                $scope.item.ToRoomId = data.RoomId;
                $scope.item.ToBedId = data.BedId;
                $scope.item.ToLocationId = data.LocationId;
                $scope.item.ToServiceRateCategoryId = data.ServiceRateCategoryId;
                $scope.item.IsDoubleOccupancy = false;
            }
        }

        $scope.getDoubleOccupancyBed = function () {
            var inputParams = {
                Params: [{ Key: 1, Value: $scope.currentcontext.encounterid }, { Key: 2, Value: 1 }, { Key: 5, Value: 'false' }],
                PageContext: {
                    PageSize: 10,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'IPManagement/BedOccupancyHistory/GetBedOccupancyHistorys',
                data: inputParams,
                type: 'post',
                onComplete: $scope.getDoubleOccupancyBedCallback
            };
            utl.Http.doAction(options);
        };

        $scope.saveItem = function (statusId) {

            if ($scope.item.PatientId <= 0) {
                utl.Alert.showSuccessMsg($translate.instant('admission.selectthepatient.lbl'));

                return;
            }

            if ($scope.item.PaymentTypeId <= 0) {
                utl.Alert.showSuccessMsg($translate.instant('admission.selectthepaymentmode.lbl'));

                return;
            }

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'IPManagement/BedTransfer/AddBedTransfer';
            if ($scope.item.Id && $scope.item.Id > 0) {
                actionName = 'IPManagement/BedTransfer/UpdateBedTransfer';
            }
            console.log($scope.item);
            $scope.item.RequestedStatusId = statusId;
            $scope.item.RequestDate = !$scope.item.RequestDate ? new Date() : $scope.item.RequestDate;
            if (statusId == 3)
                $scope.item.ReqCompletedBy = utl.Session.getCurrentUserId();

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
        }
        $scope.lookupCall = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }
        $scope.loadAdditionalLookup = function () {
            $scope.wardLookUp();
            $scope.getRoomLookUp();
            $scope.getBedLookUp();

        }
        // $scope.lookupCallback = function (scope, data, options, hasError) {
        //     $scope.lookup = hasError ? {} : data;
        //     $scope.getItem();
        // }
        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Doctor Name', field: 'DoctorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' }
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
                Params: [
                    { Key: 3, Value: 2 }
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
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
            }
        }

        vm.procedurecontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Procedure Name', field: 'ProcedureName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/procedure/GetProcedures',
            formatdisplay: formatselectedprocedure,
            presearch: presearchprocedure,
            postsearch: postsearchprocedure
        };

        function formatselectedprocedure() {
            var selectedItem = vm.procedurecontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ProcedureName + '(' + selectedItem.Code + ')'].join('  ');
            } else if (vm.procedurecontrolconfig.rowdata) {
                result = [vm.procedurecontrolconfig.rowdata.Code, vm.procedurecontrolconfig.rowdata.ProcedureName].join(' ');
            }
            $scope.item.ProcedureName = result;

            return result;
        }

        function presearchprocedure() {
            var query = vm.procedurecontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.procedurecontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 3, Value: query });
            }

            vm.procedurecontrolconfig.searchparams = inputData;
        }

        function postsearchprocedure() {
            for (var idx in vm.procedurecontrolconfig.result) {
                var item = vm.procedurecontrolconfig.result[idx];
                item.ProcedureId = item.Code;
                item.ProcedureName = item.ProcedureName;
            }
        }

        $scope.initAllLookup = function () {
            var inputData =
                [
                    { "Key": "Facility" },
                    { "Key": "Bed" },
                    { "Key": "Room" } ,
                    { "Key": "OTRoom" },
                    { "Key": "Procedure" },
                    { "Key": "User", Request: { Params: [{ Key: 11, Value: true }] } },
                    { "Key": "Ward", Request: { Params: [{ Key: 7, Value: 3 }] } },// become slow put text box
                    {
                        Key: 'Doctor',
                        Request: {
                            Params: [{ Key: 5, Value: 2 }]

                        }
                    },
                    { "Key": "ServiceRateCategory" },

                    { "Key": "Location" }    // become slow put text box
                ]


            $scope.lookupCall(inputData);
            $scope.getItem();
            $scope.loadAdditionalLookup();
        }
        $scope.wardLookUp = function () {
            var inputData = [
                {
                    "Key": "Ward", Request: {
                        Params: [{ Key: 2, Value: $scope.item.FacilityId || null },
                        { Key: 5, Value: $scope.item.ToLocationId || null },
                        { Params: [{ Key: 7, Value: 3 }] }]
                    }
                },
            ];
            $scope.lookupCall(inputData);
            $scope.item.ToWardId = $scope.item.WardId || null;
            $scope.item.ToRoomId = $scope.item.RoomId || null;
            $scope.item.ToBedId = $scope.item.BedId || 0;
        }

        $scope.getRoomLookUp = function () {
            var inputData = [{
                "Key": "Room",
                Request: {
                    Params: [
                        { Key: 2, Value: $scope.item.ToWardId || null }
                    ]
                }
            }];
            $scope.lookupCall(inputData);
            $scope.item.ToRoomId = null;
            $scope.item.ToBedId = null;
        }

        $scope.getBedLookUp = function () {
            var inputData = [{
                "Key": "Bed",
                Request: {
                    Params: [
                        { Key: 1, Value: $scope.item.ToWardId || null },
                        { Key: 2, Value: $scope.item.ToRoomId || null },
                        { Key: 5, Value: 1 }
                    ]
                }
            }];
            if ($scope.currentcontext.id > 0) {
                inputData = [{
                    "Key": "Bed",
                    Request: {
                        Params: [
                            { Key: 1, Value: $scope.item.ToWardId || null },
                            { Key: 2, Value: $scope.item.ToRoomId || null }
                        ]
                    }
                }];
            }
            $scope.lookupCall(inputData);
            $scope.item.BedId = null;
        }

        // Referaltype based Referral Lookup - Start 
        $scope.getReferralLookUp = function () {
            var inputData = [{
                "Key": "Referral",
                Request: {
                    Params: [
                        { Key: 3, Value: $scope.item.ReferralTypeId || 0 }
                    ]
                }
            }];
            $scope.lookupCall(inputData);
        }
        $scope.initAllLookup();
    }

    otbedtransferController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();