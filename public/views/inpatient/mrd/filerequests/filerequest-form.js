(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('filerequestFormController', filerequestFormController);

    function filerequestFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsManual: true,
            PriorityId: 3, //Medium
            RequestDate: utl.Formatter.getCurrentDate(),
            RequestedDoctorId: utl.Session.getCurrentUserId(),
            FromDepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
            // ToDepartmentId: 146, //MRD Department
            MRDFileStatusId: 1, //File Created
            MRDTypeId: 1,
            RequestTypeId: 1
        };
        $scope.MrdLocations = [];
        $scope.currentcontext = {};
        var MrdFileLocationId = 0;
        var IsMRDLocation = true;
        var IsFileRequestCreated = false;
        var FileRequestedDepartments = '';
        var FileLocatedDepartmentName = '';
        $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.item.PatientId = modalConfig.params.pid;
            $scope.item.EncounterId = modalConfig.params.encounterid;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        if (modalConfig && modalConfig.params.patient) {
            $scope.currentcontext.id = 0;
            $scope.currentcontext.patient = modalConfig.params.patient;
            $scope.item.PatientId = $scope.currentcontext.patient.Id;
            $scope.item.PatientMrn = $scope.currentcontext.patient.MRN
            if (modalConfig.params.encounter) {
                $scope.currentcontext.encounter = modalConfig.params.encounter;
                $scope.item.EncounterId = $scope.currentcontext.encounter.EncounterId;
                $scope.item.DoctorId = $scope.currentcontext.encounter.DoctorId;
            }
            if (modalConfig.params.mrdtype) {
                $scope.item.MRDTypeId = modalConfig.params.mrdtype;
            }
        }
        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
            $scope.item.PatientMrn = $scope.selectedPatient.MRN
            $scope.getEncounters();
            $scope.getmrdlocation();
            $scope.getmrdRequest();
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
        // Patient autoSearch starts
        vm.patientconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Id', field: 'PatientId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Patient Name', field: 'PatientName', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'MRN', field: 'MRN', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Age', field: 'Age', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Gender', field: 'Gender', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                // { header: 'NationalityId', field: 'NationalityId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
            ],
            searchparams: {},
            result: {},
            api: 'registration/patient/GetPatients',
            formatdisplay: formatselectedtest,
            presearch: presearchserviceitem,
            postsearch: postsearchserviceitem
        };

        function formatselectedtest() {

            var selectedItem = vm.patientconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.Title.Description + ' ' + selectedItem.FirstName];
            } else if (vm.patientconfig.rowdata) {
                result = [vm.patientconfig.rowdata.PatientId].join(' ');
            }
            return result;
        }

        function presearchserviceitem() {

            var query = vm.patientconfig.query;

            var inputData = {
                Params: [
                    { Key: 7, Value: 2 }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            if (vm.patientconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 32, Value: query });
            }

            vm.patientconfig.searchparams = inputData;
        }

        function postsearchserviceitem() {
            for (var idx in vm.patientconfig.result) {
                var item = vm.patientconfig.result[idx];
                item.PatientId = item.Id;
                if (item.Title)
                    item.PatientName = item.Title.Description + ' ' + item.FirstName;
                item.Age = item.Age;
                item.MRN = item.MRN;
                if (item.Gender)
                    item.Gender = item.Gender.Description;
                item.NationalityId = item.NationalityId;
            }
        }
        $scope.getencountersCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                $scope.Encounters = data.Data[0];
                $scope.item.EncounterId = $scope.Encounters.Id
                $scope.item.DoctorId = $scope.Encounters.DoctorId
                $scope.item.DepartmentId = $scope.Encounters.DepartmentId
                $scope.item.PatientId = $scope.Encounters.PatientId;
            }
        };
        $scope.getEncounters = function () {
            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.item.PatientId },
                    // { Key: 15, Value: 2 }
                ]
            };
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getencountersCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.patientChange();
            if ($scope.item.MRDMovementStatusId == 1 || $scope.item.MRDMovementStatusId == 2 || $scope.item.MRDMovementStatusId == 3 || $scope.item.MRDMovementStatusId == 4) {
                $scope.IsDisabled = true;
            }
            if (data.MRDMovementStatusId == 1) {
                $scope.item.DisplayMRDMovementStatus = 'Requested';
            }
            if (data.MRDMovementStatusId == 2) {
                $scope.item.DisplayMRDMovementStatus = 'Issued';
            }
            if (data.MRDMovementStatusId == 3) {
                $scope.item.DisplayMRDMovementStatus = 'Received';
            }
            if (data.MRDMovementStatusId == 6) {
                $scope.item.DisplayMRDMovementStatus = 'Cancelled';
            }
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'IPManagement/FileRequest/GetFileRequestById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.getdepartments();
            }

        };
        $scope.clear = function () {
            $scope.item = {};
        }
        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: $scope.item.PatientId },
                confirmCallback: $scope.getList
            });
        }
        $scope.getmrdlocationCallback = function (scope, data, options, hasError) {
            $scope.MrdLocations = data;
            $scope.item.MrdLocId = data.Data[0].Id;
            $scope.item.MrdFileLocationId = data.Data[0].LocationId;
            $scope.item.IsMRDLocation = data.Data[0].FileLocation.IsMRDLocation;
            $scope.item.FileLocatedDepartmentName = data.Data[0].FileLocation.DepartmentName;
            if (data.Data.length == 0) {
                utl.Alert.showErrorMsg('File For the Patient is Not Created');
            }
            // $scope.updatemrdlocation();
        };
        $scope.getmrdlocation = function () {
            var inputData = {
                Params: [
                    { Key: 5, Value: $scope.item.PatientId },
                    // { Key: 7, Value: $scope.item.EncounterId },
                ]
            };
            var options = {
                action: 'IPManagement/MRDLocation/GetMRDLocations',
                data: inputData,
                type: 'post',
                onComplete: $scope.getmrdlocationCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getmrdRequestCallback = function (scope, data, options, hasError) {
            $scope.MrdRequests = data.Data;
            if (data.Data.length > 0) {
                IsFileRequestCreated = true;
                $scope.MrdRequests.forEach((FileRequest, index) => {
                    FileRequestedDepartments = FileRequestedDepartments + FileRequest.ParentDepartment.DepartmentName + ' , ';
                });
            }
        };
        $scope.getmrdRequest = function () {
            var inputData = {
                Params: [
                    { Key: 9, Value: $scope.item.PatientId },
                    { Key: 12, Value: 1 },
                ]
            };
            var options = {
                action: 'IPManagement/FileRequest/GetFileRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getmrdRequestCallback
            };

            utl.Http.doAction(options);
        };
        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        $scope.updatemrdlocation = function () {
            // $scope.item.MrdLocId = $scope.item.MrdLocId;
            $scope.item.MRDMovementStatusId = 1;
            var options = {
                action: 'IPManagement/MRDLocation/UpdateMRDLocationFromRequest',
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.issueCallback
            };
            utl.Http.doAction(options);
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.validateForm = function () {
            var isValid = true;
            if (!$scope.currentcontext.isnewpatient && (!$scope.item.PatientId || $scope.item.PatientId == -1)) {
                isValid = false;
                utl.Alert.showErrorMsg($translate.instant('worklists.req-validation-msg.lbl'));
            }
            return isValid;
        }
        $scope.onSaveRequest = function () {
            $scope.saveItem(1);
        }
        $scope.saverequest = function () {
            var message = '';
            /*
                        if($scope.item.MrdFileLocationId > 0 && $scope.item.IsMRDLocation == false){
                            message = 'This File is Located on ' + $scope.item.FileLocatedDepartmentName + '. Do You Want to Request The File?';
                        }else{
                            message = 'worklists.requestmsg.lbl';
                        }

                        if((FileRequestedDepartments != '' && IsFileRequestCreated == true) || ($scope.item.MrdFileLocationId > 0 && $scope.item.IsMRDLocation == false)){
                            message = 'Already File Request Created From The Following Departments ' + FileRequestedDepartments + '. This File Currently Located on  '+ $scope.item.FileLocatedDepartmentName +'. Do You Want to Request The File?';
                        }else{
                            message = 'worklists.requestmsg.lbl';
                        }
            */
            if (FileRequestedDepartments != '' && IsFileRequestCreated == true && $scope.item.MrdFileLocationId > 0 && $scope.item.IsMRDLocation == false) {
                message = 'Already File Request Created From The Following Departments ' + FileRequestedDepartments + '. This File Currently Located on  ' + $scope.item.FileLocatedDepartmentName + '. Do You Want to Request The File?';
            } else if (FileRequestedDepartments != '' && IsFileRequestCreated == true && $scope.item.IsMRDLocation == true) {
                message = 'Already File Request Created From The Following Departments ' + FileRequestedDepartments + '. Do You Want to Request The File?';
            } else if ($scope.item.MrdFileLocationId > 0 && $scope.item.IsMRDLocation == false && FileRequestedDepartments == '' && IsFileRequestCreated == false) {
                message = 'This File Currently Located on ' + $scope.item.FileLocatedDepartmentName + '. Do You Want to Request The File?';
            }
            else {
                message = 'worklists.requestmsg.lbl';
            }

            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: message,
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveRequest,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }
        $scope.onCancelRequest = function () {
            $scope.saveItem(6);
        }
        $scope.cancelrequest = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'worklists.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCancelRequest,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }
        $scope.saveItem = function (StatusId) {

            if (!utl.Validator.validate($scope)) {
                return;
            }
            if (!$scope.validateForm()) {
                return;
            }
            if ($scope.item.MRDMovementStatusId != 1 && !utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.MRDMovementStatusId = StatusId;

            var actionName = 'IPManagement/filerequest/AddFileRequest';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'IPManagement/filerequest/UpdateFileRequest';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        //autosearch related code starts for Doctors
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
            iteminfo: {},
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
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department ? item.Department.DepartmentName : '';
            }
        }
        //autosearch related code ends for Doctors
        $scope.getdeptCallback = function (scope, data, options, hasError) {
            $scope.department = data.Data[0];
            $scope.item.ToDepartmentId = $scope.department.Id;
            $scope.patientChange();
        };
        $scope.getdepartments = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 7, Value: true }
                ]
            };
            var options = {
                action: 'SystemSettings/department/GetDepartments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getdeptCallback
            };
            utl.Http.doAction(options);
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Department" },
                //  { "Key": "Doctor" },
                { "Key": "User" },
                { "Key": "EncounterType" },
                { "Key": "Priority" },
                { "Key": "MRDFileStatus" },
                { "Key": "MRDLocation" },
                { "Key": "MRDMovementStatus" },
                { "Key": "MRDRequestType" },
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

    filerequestFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();