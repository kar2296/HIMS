(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DocumentsFormController', DocumentsFormController);

    function DocumentsFormController($scope, $interval, $stateParams, $state, $translate, utl, Upload) {

        var vm = this;
        angular.extend(this, utl.Ctrl.getValidationCtrl({ $scope: $scope }));

        $scope.item = {
            ActiveStatusId: 2,
            FacilityId: utl.Session.getCurrentFacilityId(),
            OrganizationId: utl.Session.getCurrentOrgId(),
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
            DocumentDate: utl.Formatter.getCurrentDate(),
            PatientId: -1,
        };

        $scope.currentcontext = {};
        $scope.CanShowDownload = false;
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.isViewMode = $stateParams.isViewMode;

        $scope.getItemCallback = function (scope, res, options, hasError) {
            $scope.item = res;
            if ($scope.item.CancelledBy == null) {
                $scope.item.CancelledBy = -1;
            }
            if ($scope.item.CancelledAt == null) {
                $scope.item.CancelledAt = 0;
            }
        };
        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'emr/Document/GetDocumentById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.applyVisibilityRules();
            }
        };

        $scope.backToList = function () {
            $state.go('app.documentslist');
        }
        $scope.addNew = function () {
            if ($stateParams.id > 0) {
                $state.go('app.documentsform', { id: 0, isViewMode: false });
            }
            else {
                $state.reload();
            }
        }

        $scope.photoFileChanged = function () {
            $scope.item.iswebcamphoto = false;
            $scope.item.webcamphoto = '';
        }

        // $scope.addNew = function() {
        //     $state.go('app.documentform', { id: 0, isViewMode: false });
        // }
        $scope.fileSelected = function () {
            if ($scope.currentcontext.file && $scope.currentcontext.file.name) {
                $scope.item.DocumentPath = $scope.currentcontext.file.name;
            }
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.currentcontext.id = (typeof data === "number") ? data : $scope.currentcontext.id;
            // $scope.getItem();
            $scope.backToList();
        };
        $scope.saveItem = function (type) {
            if (!utl.Validator.validate($scope)) {
                $scope.showErrorMsg($translate.instant('common.validationmsg.lbl'));
                return;
            }
            if ($scope.item.DocumentForId == 2) {
                $scope.item.EmployeeId = -1;
            } else if ($scope.item.DocumentForId == 3) {
                $scope.item.EmployeeId = -1;
                $scope.item.DepartmentId = -1;
            }
            if (type == 'save' && $scope.item.DocumentStatusId != 2) {
                $scope.item.DocumentStatusId = 1;
            }
            if (type == 'cancel') {
                $scope.item.CancelledBy = utl.Session.getCurrentEmployeeId();
                $scope.item.CancelledAt = utl.Formatter.getCurrentDate();
                $scope.item.DocumentStatusId = 2
            }
            var actionName = 'emr/Document/AddDocument';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/Document/UpdateDocument';
            }
            console.log($scope.item);
            if ($scope.currentcontext.file) {
                var actionUrl = utl.Http.getRootPath() + actionName;
               
                Upload.upload({
                    url: actionUrl,
                    data: {
                        file: $scope.currentcontext.file,
                        Data: $scope.item,
                    }
                }).then(function (resp) { //upload function returns a promise
                    utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                    $scope.currentcontext.file = null;
                    $scope.backToList();
                    //$scope.currentcontext.id = (typeof data === "number") ? data : $scope.currentcontext.id;
                    //$state.go('app.employeetab.details', { id: $scope.currentcontext.id });
                },
                    function (resp) { //catch error
                        console.log('Error status: ' + resp.status);
                        utl.Alert.showErrorMsg('Error status: ' + resp.status);
                    },
                    function (evt) {
                        console.log(evt);
                    });
                return false;
            }
            else {
                var options = {
                    action: actionName,
                    data: {
                        Data: $scope.item,
                        file: $scope.currentcontext.file
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
            // var options = {
            //     action: actionName,
            //     data: { Data: $scope.item },
            //     type: 'post',
            //     onComplete: $scope.saveItemCallback
            // };
            // utl.Http.doAction(options);
        };

        //Employee AutoSearch Start
        vm.Employeecontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Employee Code', field: 'EmployeeCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Employee Name', field: 'EmployeeName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Designation', field: 'DesignationName', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
                { header: 'Department', field: 'DepartmentName', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
            ],
            searchparams: {},
            result: {},
            api: 'HRM/Employee/GetEmployees',
            formatdisplay: formatselectedemployee,
            presearch: presearchemployee,
            postsearch: postsearchemployee
        };

        function formatselectedemployee() {
            var selectedItem = vm.Employeecontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.EmployeeName].join('  ');
            } else if (vm.Employeecontrolconfig.rowdata) {
                result = [vm.Employeecontrolconfig.rowdata.EmployeeId].join(' ');
            }
            return result;
        }

        function presearchemployee() {
            var query = vm.Employeecontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 5, Value: 2 },
                    { Key: 6, Value: $scope.item.FacilityId },
                    { Key: 10, Value: [1, 2, 3, 4] },
                    { Key: 34, Value: false },
                    { Key: 35, Value: false }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if (vm.Employeecontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 2, Value: query });
            }
            vm.Employeecontrolconfig.searchparams = inputData;
        }

        function postsearchemployee() {
            for (var idx in vm.Employeecontrolconfig.result) {
                var item = vm.Employeecontrolconfig.result[idx];
                item.EmployeeId = item.Id;
                item.EmployeeCode = item.EmployeeCode;
                if (item.Title) {
                    item.EmployeeName = item.Title.Description + ' ' + item.FirstName + ' ' + item.LastName;
                } else {
                    item.EmployeeName = item.FirstName + ' ' + item.LastName;
                }
                if (item.Designation) {
                    item.DesignationName = item.Designation.Designation;
                }
                if (item.Department) {
                    item.DepartmentName = item.Department.DepartmentName;
                }
            }
        }
        //Employee AutoSearch End
        

        $scope.getencountersCallback = function (scope, data, options, hasError) {
            $scope.IsOpPatient = false;
            if (data.Data.length > 0) {
                $scope.Encounters = data.Data[0];
                $scope.item.EncounterId = $scope.Encounters.Id;
                $scope.item.DoctorId = $scope.Encounters.DoctorId;
                $scope.item.DoctorName = $scope.Encounters.DoctorName;
                $scope.item.DepartmentId = $scope.Encounters.DepartmentId;
                $scope.item.ServiceRateCategoryId = $scope.Encounters.ServiceRateCategoryId;
            }
        };

        $scope.getEncounters = function () {

            var inputData = {
                Params: [{
                    Key: 4,
                    Value: $scope.item.PatientId
                }, ]
            };
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getencountersCallback
            };

            utl.Http.doAction(options);
        };

        $scope.selectEmployee = function (idx, selectedItem) {
            $scope.item.DepartmentId = selectedItem.SelectedItem.DepartmentId;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
            $scope.getEncounters();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ActiveStatus" },
                { "Key": "AnnouncementFor" },
                { "Key": "DocumentAttachmentType" },
                { "Key": "DocumentStatus" },
                {
                    "Key": "Department", Request: {
                        Params: [{ Key: 4, Value: 2 },
                        { Key: 6, Value: [-1, $scope.item.FacilityId] }]
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

    DocumentsFormController.$inject = ['$scope', '$interval', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();