(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientlabourFormController', patientlabourFormController);

    function patientlabourFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            // Id:0,
            EncounterId: utl.Session.getEncounterId(),
            LMPDate: utl.Formatter.getCurrentDate(),
            EDD: utl.Formatter.getCurrentDate(),
            OnSetOfLabourDateTime: utl.Formatter.getCurrentDate(),

        };
        $scope.lookup = {};

        $scope.currentcontext.id = parseInt($stateParams.id);

        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        if ($stateParams.pid)
            $scope.currentcontext.pid = parseInt($stateParams.pid);
        $scope.item.PatientId = $scope.currentcontext.pid;

        if ($scope.item.EncounterId && $scope.item.EncounterId > 0) {
            $scope.item.encounter = utl.Session.getPatientEncounter();
            $scope.item.DoctorId = $scope.item.encounter.DoctorId;
            $scope.item.GenderId = $scope.item.encounter.Patient.GenderId;

        };
        // // $scope.currentcontext.encounterid = parseInt($stateParams.EncounterId);

        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;

            $scope.applyVisibilityRules();
        };


        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'emr/PatientLabourDetail/GetPatientLabourDetailById',
                    data: { Id: $scope.currentcontext.id, PatientId: $scope.currentcontext.pid },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function() {

            $state.go('patientemr.patientlabourlist');

        };
        $scope.save = function() {
            $scope.item.LabourStatusId = 1;
            $scope.saveItem();
        };
        $scope.saveactive = function() {

            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.LabourStatusId = 2;
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientemr.patientlabourdetails.confirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);

            // $scope.saveItem();
        };
        $scope.saveItemCallback = function(scope, data, options, hasError) {

            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (data === true) {
                $scope.currentcontext.id = options.data.Data.Id;
            } else {
                $scope.currentcontext.id = data;
            }

            loadData();
        };

        $scope.saveItem = function() {

            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'emr/PatientLabourDetail/AddPatientLabourDetail';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/PatientLabourDetail/UpdatePatientLabourDetail';
            }
            $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            $scope.item.OrganizationId = utl.Session.getCurrentFacilityId();
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };

            utl.Http.doAction(options);
        };
        $scope.print = function() {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'emr/PatientLabourDetail/PrintPatientLabourDetail',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
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
                item.Speciality = item.Department.DepartmentName;
            }
        }
        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Anesthesiologist Id', field: 'AnesthesiologistId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Name', field: 'AnesthesiologistName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                // { header: 'Qualification', field: 'Qualification', datatype: 'string', headercls: 'td-Qualification', fieldcls: 'td-Qualification' },
                { header: 'Department', field: 'Speciality', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
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
                result = [selectedItem.AnesthesiologistName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.UserId, vm.usercontrolconfig.rowdata.AnesthesiologistName,
                    vm.usercontrolconfig.rowdata.Qualification, vm.usercontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            $scope.item.AnesthesiologistName = result;

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            //Search only DoctorGroup 
            var inputData = {
                Params: [
                    { Key: 6, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.AnesthesiologistId = item.Id;
                item.AnesthesiologistName = item.Title.Description + ' ' + item.FirstName;
                // item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }
        vm.usernursecontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'ScrubNurse Id', field: 'ScrubNurseId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'ScrubNurse Name', field: 'ScrubNurseName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                // { header: 'Qualification', field: 'Qualification', datatype: 'string', headercls: 'td-Qualification', fieldcls: 'td-Qualification' },
                { header: 'UserType', field: 'UserTypeId', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselectedusernurse,
            presearch: presearchusernurse,
            postsearch: postsearchusernurse
        };

        function formatselectedusernurse() {
            var selectedItem = vm.usernursecontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ScrubNurseName].join('  ');
            } else if (vm.usernursecontrolconfig.rowdata) {
                result = [vm.usernursecontrolconfig.rowdata.UserId, vm.usernursecontrolconfig.rowdata.ScrubNurseName,
                    vm.usernursecontrolconfig.rowdata.Qualification, vm.usernursecontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            $scope.item.ScrubNurseName = result;

            return result;
        }

        function presearchusernurse() {
            var query = vm.usernursecontrolconfig.query;
            //Search only DoctorGroup 
            var inputData = {
                Params: [
                    { Key: 3, Value: 4 },
                    // { Key: 4, Value: 1 },

                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.usernursecontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.usernursecontrolconfig.searchparams = inputData;
        }

        function postsearchusernurse() {
            for (var idx in vm.usernursecontrolconfig.result) {
                var item = vm.usernursecontrolconfig.result[idx];
                item.ScrubNurseId = item.Id;
                item.ScrubNurseName = item.Title.Description + ' ' + item.FirstName;
                // item.Qualification = item.Qualification;
                item.UserTypeId = item.UserType.Description;
            }
        }
        $scope.clear = function() {
            $scope.item = {
                LMPDate: utl.Formatter.getCurrentDate(),
                EDD: utl.Formatter.getCurrentDate(),
                OnSetOfLabourDateTime: utl.Formatter.getCurrentDate(),
            };
        };
        $scope.applyVisibilityRules = function() {
            // Draft

            if ($scope.currentcontext.id <= 0) {

                $scope.canShowSaveBtn = true;
                $scope.canShowDeleteBtn = true;
                $scope.canShowBackBtn = true;
                $scope.canhistoryBtn = false;
                $scope.canShowCancelledBtn = false;
                $scope.canShowSaveandActiveBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowAddNewBtn = true;
                $scope.canPrintBtn = false;

            } else {
                $scope.canShowSaveBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowCancelledBtn = false;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowAddNewBtn = true;
                $scope.canPrintBtn = false;

                if ($scope.item.LabourStatusId == 1) {
                    $scope.canShowSaveBtn = false;
                    $scope.canShowClearBtn = true;
                    $scope.canShowCancelBtn = false;
                    // $scope.HidePrintBtn = true;
                    $scope.canShowSaveandActiveBtn = true;
                    $scope.canPrintBtn = false;

                }
                // Bill Completed
                if ($scope.item.LabourStatusId == 2) {
                    $scope.canShowSaveBtn = false;
                    $scope.canShowClearBtn = false;
                    $scope.canShowSaveandActiveBtn = true;
                    $scope.canShowPrintBtn = true;
                    $scope.canPrintBtn = true;

                    // $scope.canShowViewReceipt = true;
                }
                if ($scope.item.LabourStatusId == 3) {
                    $scope.canShowSaveBtn = false;
                    $scope.canShowClearBtn = false;
                    $scope.canShowSaveandActiveBtn = false;
                    $scope.canPrintBtn = true;

                    // $scope.canShowViewReceipt = true;
                }
                // Bill Cancelled 


            }
        };

        if ($scope.currentcontext.id <= 0)
            $scope.applyVisibilityRules();


        function loadData() {
            $scope.getItem();
        }
        //lookup
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;

            $scope.getItem();
        };

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "Gender" },
                { "Key": "YesNo", Default: false },
                // {

                //     "Key": "User",
                //     Request: {
                //         Params: [{
                //             Key: 6,
                //             Value: 2
                //         }]
                //     }
                // },
                // {

                //     "Key": "User",
                //     Request: {
                //         Params: [{
                //             Key: 3,
                //             Value: 4
                //         }]
                //     }
                // },
                { "Key": "AmnoticFluid" },
                { "Key": "GABy" },

                { "Key": "GABy" },
                { "Key": "Labour" },
                { "Key": "MembraneRuptured" },
                { "Key": "Presentation" },
                { "Key": "Indication" },
                { "Key": "GrossAppearance" },
                { "Key": "PostPartumCondition" },
                { "Key": "Medication" },
                { "Key": "Assistant" },
                { "Key": "PlacentaMembranes" },
                { "Key": "Episiotomy" },
                { "Key": "Laceration" },
                { "Key": "ModeOfDelivery" },

                { "Key": "UserType" },
                // { "Key": "User" },



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

    patientlabourFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();