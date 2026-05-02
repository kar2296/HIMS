(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('IncidentReportingFormController', IncidentReportingFormController);

    function IncidentReportingFormController($scope, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;
        $scope.item = {
            IsActive: true,
            IncidentReportingTime: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            IncidentReportingStatusId: 2,
        };

        $scope.currentcontext = {};
        $scope.lookup = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        // $scope.currentcontext = {
        //     file: null,
        //     fileAtt1: null,
        //     fileAtt2: null,
        // };
        // $scope.UploadedFile = '';
        $scope.attachment1FileChanged = function () {
            if ($scope.currentcontext.fileAtt1 || $scope.currentcontext.fileAtt1.name) {
                $scope.item.Attachment1Name = $scope.currentcontext.fileAtt1.name;
            }
        }
        $scope.attachment2FileChanged = function () {
            if ($scope.currentcontext.fileAtt2 || $scope.currentcontext.fileAtt2.name) {
                $scope.item.Attachment2Name = $scope.currentcontext.fileAtt2.name;
            }
        }
        $scope.getviewattachmentCallback1 = function (scope, data, options, hasError) {
            $scope.currentcontext.Attachment1 = data.Logo;
        };

        $scope.getviewattachment1 = function () {
            if ($scope.item.Attachment1) {
                var inputData = {
                    Id: $scope.item.Id,
                    Attachment1: $scope.item.Attachment1
                };
                var options = {
                    action: 'emr/IncidentReporting/GetViewAttachment1',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getviewattachmentCallback1
                };
                utl.Http.doAction(options);
            }
        };
        $scope.getviewattachmentCallback2 = function (scope, data, options, hasError) {
            $scope.currentcontext.Attachment2 = data.Logo;
        };

        $scope.getviewattachment2 = function () {
            if ($scope.item.Attachment2) {
                var inputData = {
                    Id: $scope.item.Id,
                    Attachment2: $scope.item.Attachment2
                };
                var options = {
                    action: 'emr/IncidentReporting/GetViewAttachment2',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getviewattachmentCallback2
                };
                utl.Http.doAction(options);
            }
        };
        // For Displaying Created User - End 
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if ($scope.currentcontext.fileAtt1 && data.Id) {
                $scope.UploadAttachment1File();
            }
            if ($scope.currentcontext.fileAtt2 && data.Id) {
                $scope.UploadAttachment2File();
            }
            $scope.getviewattachment1();
            $scope.getviewattachment2();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'emr/IncidentReporting/GetIncidentReportingById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.UploadAttachment1File = function () {
            var actionName = 'emr/IncidentReporting/UploadAttachment';
            if ($scope.currentcontext.fileAtt1) {
                $scope.data = {};
                $scope.data.Id = $scope.item.Id;
                $scope.data.UploadedFile = 'Attachment1';
                var actionUrl = utl.Http.getRootPath() + actionName;
                Upload.upload({
                    url: actionUrl,
                    data: {
                        file: $scope.currentcontext.fileAtt1,
                        Data: $scope.data,
                    }
                }).then(function (resp) { //upload function returns a promise
                        // $scope.getItem();
                        console.log('Uploaded...');
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
        };
        $scope.UploadAttachment2File = function () {
            var actionName = 'emr/IncidentReporting/UploadAttachment';
            if ($scope.currentcontext.fileAtt2) {
                $scope.data = {};
                $scope.data.Id = $scope.item.Id;
                $scope.data.UploadedFile = 'Attachment2';
                var actionUrl = utl.Http.getRootPath() + actionName;
                Upload.upload({
                    url: actionUrl,
                    data: {
                        file: $scope.currentcontext.fileAtt2,
                        Data: $scope.data,
                    }
                }).then(function (resp) { //upload function returns a promise
                        // $scope.getItem();
                        console.log('Uploaded...');
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
        };
        //Download File
        $scope.downloadFile1Callback = function (scope, data, options, hasError) {
            console.log('File downloaded successfully...');
        };

        $scope.downloadFile1 = function (item) {
            var inputData = {
                Attachment1: item.Attachment1
            };
            var options = {
                action: 'emr/IncidentReporting/GetAttachment1File',
                data: {
                    Data: inputData
                },
                onComplete: $scope.downloadFile1Callback
            };
            utl.Http.doDownload(options);
        }
        //Download File
        $scope.downloadFile2Callback = function (scope, data, options, hasError) {
            console.log('File downloaded successfully...');
        };

        $scope.downloadFile2 = function (item) {
            var inputData = {
                Attachment2: item.Attachment2
            };
            var options = {
                action: 'emr/IncidentReporting/GetAttachment2File',
                data: {
                    Data: inputData
                },
                onComplete: $scope.downloadFile2Callback
            };
            utl.Http.doDownload(options);
        }
        $scope.addNew = function () {
            $state.go('app.incidentreporting-form', {
                id: 0
            });
        };
        $scope.backToList = function () {
            $state.go('app.incidentreporting-list');
        }
        $scope.validateForm = function () {
            var isValid = true;
            if (!$scope.currentcontext.isnewpatient && (!$scope.item.PatientId || $scope.item.PatientId == -1)) {
                isValid = false;
                utl.Alert.showErrorMsg($translate.instant('worklists.req-validation-msg.lbl'));
            }
            return isValid;
        }

        $scope.save = function () {
            $scope.item.IncidentReportingStatusId = 1;
            $scope.item.CreatedAt = utl.Formatter.getCurrentDate();
            $scope.item.CreateddBy = utl.Session.getCurrentUserId();
            $scope.saveItem();
        };

        $scope.saveAndApprove = function () {
            // $scope.item.ActiveStatus = 'Active'
            $scope.item.IncidentReportingStatusId = 2;
            $scope.item.ApprovedBy = utl.Session.getCurrentUserId()
            $scope.item.ApprovedAt = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };


        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof (data) == "boolean") {
                if (options && options.data !== null && options.data.Data !== null) {
                    $scope.currentcontext.id = options.data.Data.Id;
                    $scope.getItem();
                }
            } else if (typeof (data) == "number") {
                $scope.currentcontext.id = data;
                $scope.getItem();
            }
        };

        $scope.saveItem = function (status) {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'emr/IncidentReporting/AddIncidentReporting';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/IncidentReporting/UpdateIncidentReporting';
            }
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.print = function () {
            var inputData = {
                Id: $scope.item.Id
            };
            var options = {
                action: 'emr/IncidentReporting/PrintIncidentReporting',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        //autosearch related code ends for Doctors
        //autosearch related code starts for Diagnosis
        vm.diagnosiscontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Code',
                    field: 'Code',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'DiagnosisName',
                    field: 'DiagnosisName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Version',
                    field: 'Version',
                    datatype: 'string',
                    headercls: 'td-Version',
                    fieldcls: 'td-Version'
                },
                {
                    header: 'Speciality',
                    field: 'Speciality',
                    datatype: 'string',
                    headercls: 'td-Speciality',
                    fieldcls: 'td-Speciality'
                },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/diagnosis/GetDiagnosiss',
            formatdisplay: formatselecteddiagnosis,
            presearch: presearchdiagnosis,
            postsearch: postsearchdiagnosis
        };

        function formatselecteddiagnosis() {
            var selectedItem = vm.diagnosiscontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DiagnosisName, selectedItem.Code].join('  ');
                $scope.item.DiagnosisName = selectedItem.DiagnosisName;
            } else if (vm.diagnosiscontrolconfig.rowdata) {
                result = [vm.diagnosiscontrolconfig.rowdata.Code, vm.diagnosiscontrolconfig.rowdata.DiagnosisName,
                    vm.diagnosiscontrolconfig.rowdata.DiagnosisVersionId, vm.diagnosiscontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            return result;
        }

        function presearchdiagnosis() {
            var query = vm.diagnosiscontrolconfig.query;

            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.diagnosiscontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 3,
                    Value: query
                });
            }

            vm.diagnosiscontrolconfig.searchparams = inputData;
        }

        function postsearchdiagnosis() {
            for (var idx in vm.diagnosiscontrolconfig.result) {
                var item = vm.diagnosiscontrolconfig.result[idx];
                item.Code = item.Code;
                item.DiagnosisName = item.DiagnosisName;
                item.DiagnosisVersion = item.DiagnosisVersion.Description;
                item.Speciality = item.Speciality;
            }
        }
        //autosearch related code ends for Diagnosis

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
            $scope.getItem();
        }

        $scope.initAllLookup = function () {
            var inputData = [{
                "Key": "IncidentReportingStatus",
                Default: false
            }, {
                "Key": "IncidentReportingType",
                Default: false
            }, {
                "Key": "IncidentOccurred",
                Default: false
            }, {
                "Key": "ClassificationIncident",
                Default: false
            }, {
                "Key": "TypeOfIncident",
                Default: false
            }, {
                "Key": "AdverseDrug",
                Default: false
            }, {
                "Key": "Fall",
                Default: false
            }, {
                "Key": "SurgicalError",
                Default: false
            }, {
                "Key": "PatientCare",
                Default: false
            }, {
                "Key": "Miscellaneous",
                Default: false
            }, {
                "Key": "Equipment",
                Default: false
            }, {
                "Key": "Security",
                Default: false
            }, ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,

                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);

        }

        $scope.initAllLookup();
    }
    IncidentReportingFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();