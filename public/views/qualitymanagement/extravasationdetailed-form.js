(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ExtravasationDetailedFormController', ExtravasationDetailedFormController);

    function ExtravasationDetailedFormController($rootScope, $scope, $stateParams, $state, $translate, utl, Upload, $timeout) {
        var vm = this;
        $scope.item = {
            ExtravasationDateTime: utl.Formatter.getCurrentDate(),
            PatientId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            ExtravasationProformaStatusId: 2,
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        $scope.currentcontext = {};
        $scope.lookup = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.file = null;
        $scope.currentcontext.file1 = null;

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.getPhotoAfterextravasationCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.PhotoAfterextravasation = data.PhotoAfterextravasationImg;
        };

        $scope.getPhotoAfterextravasation = function () {
            if ($scope.item.PhotoAfterextravasation) {
                var inputData = {
                    Id: $scope.item.Id,
                    PhotoAfterextravasation: $scope.item.PhotoAfterextravasation
                };
                var options = {
                    action: 'emr/ExtravasationProforma/GetPhotoAfterextravasation',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getPhotoAfterextravasationCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.PhotoAfterHealingFileChanged = function () {
            if ($scope.currentcontext.fileAtt1 || $scope.currentcontext.fileAtt1.name) {
                $scope.item.PhotoAfterextravasationName = $scope.currentcontext.fileAtt1.name;
            }
        }
        $scope.PhotoAfterHealingFileChanged = function () {
            if ($scope.currentcontext.fileAtt2 || $scope.currentcontext.fileAtt2.name) {
                $scope.item.PhotoAfterHealingName = $scope.currentcontext.fileAtt2.name;
            }
        }
        $scope.getviewattachmentCallback1 = function (scope, data, options, hasError) {
            $scope.currentcontext.PhotoAfterextravasation = data.Logo;
        };

        $scope.getviewPhotoAfterextravasation = function () {
            if ($scope.item.PhotoAfterextravasation) {
                var inputData = {
                    Id: $scope.item.Id,
                    PhotoAfterextravasation: $scope.item.PhotoAfterextravasation
                };
                var options = {
                    action: 'emr/ExtravasationProforma/GetPhotoAfterextravasation',
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
            $scope.currentcontext.PhotoAfterHealing = data.Logo;
        };

        $scope.getviewPhotoAfterHealing = function () {
            if ($scope.item.PhotoAfterHealing) {
                var inputData = {
                    Id: $scope.item.Id,
                    PhotoAfterHealing: $scope.item.PhotoAfterHealing
                };
                var options = {
                    action: 'emr/ExtravasationProforma/GetPhotoAfterHealing',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getviewattachmentCallback2
                };
                utl.Http.doAction(options);
            }
        };
        $scope.getPhotoAfterHealingCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.PhotoAfterHealing = data.Logo;
        };
        $scope.getPhotoAfterHealing = function () {
            if ($scope.item.PhotoAfterHealing) {
                var inputData = {
                    Id: $scope.item.Id,
                    PhotoAfterHealing: $scope.item.PhotoAfterHealing
                };
                var options = {
                    action: 'emr/ExtravasationProforma/GetPhotoAfterHealing',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getPhotoAfterHealingCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.UploadPhotoAfterextravasationFile = function () {
            var actionName = 'emr/ExtravasationProforma/UploadPhoto';
            if ($scope.currentcontext.fileAtt1) {
                $scope.data = {};
                $scope.data.Id = $scope.item.Id;
                $scope.data.UploadedFile = 'PhotoAfterextravasation';
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
        $scope.UploadPhotoAfterHealingFile = function () {
            var actionName = 'emr/ExtravasationProforma/UploadPhoto';
            if ($scope.currentcontext.fileAtt2) {
                $scope.data = {};
                $scope.data.Id = $scope.item.Id;
                $scope.data.UploadedFile = 'PhotoAfterHealing';
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
        // For Displaying Created User - End 
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.applyVisibilityRules();
            if ($scope.currentcontext.fileAtt1 && data.Id) {
                $scope.UploadPhotoAfterextravasationFile();
            }
            if ($scope.currentcontext.fileAtt2 && data.Id) {
                $scope.UploadPhotoAfterHealingFile();
            }
            $scope.getviewPhotoAfterextravasation();
            $scope.getviewPhotoAfterHealing();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'emr/ExtravasationProforma/GetExtravasationProformaById',
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
        //Download File
        $scope.downloadFile1Callback = function (scope, data, options, hasError) {
            console.log('File downloaded successfully...');
        };

        $scope.downloadFile1 = function (item) {
            var inputData = {
                PhotoAfterextravasation: item.PhotoAfterextravasation
            };
            var options = {
                action: 'emr/ExtravasationProforma/GetAttachment1File',
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
                PhotoAfterHealing: item.PhotoAfterHealing
            };
            var options = {
                action: 'emr/ExtravasationProforma/GetAttachment2File',
                data: {
                    Data: inputData
                },
                onComplete: $scope.downloadFile2Callback
            };
            utl.Http.doDownload(options);
        }
        $scope.addNew = function () {
            $state.go('app.extravasationdetailed-form', {
                id: 0
            });
        };

        $scope.backToList = function () {
            $state.go('app.extravasationdetailed-list');
        }


        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }

        $scope.applyVisibilityRules = function (data) {
            if ($scope.currentcontext.id === 0) {
                var element = document.getElementById("visibility");
                element.classList.add("hide");
            } else {
                var element = document.getElementById("visibility");
                element.classList.add("show");
            }
            if ($scope.currentcontext.id != 0) {
                var element = document.getElementById("btnSaveApprove");
                element.classList.add("hide");
            } else {
                var element = document.getElementById("btnSaveApprove");
                element.classList.add("show");
            }
            if ($scope.currentcontext.id != 0) {
                var element = document.getElementById("btnSave");
                element.classList.add("hide");
            }
            if ($scope.item.ExtravasationProformaStatusId == 1) {
                var element = document.getElementById("btnSaveApprove");
                element.classList.add("show");
            } else {
                var element = document.getElementById("btnSaveApprove");
                element.classList.add("hide");
            }
            // if ($scope.item.IsAntibiotics == false) {
            //     var element = document.getElementById("no");
            //     element.classList.add("show");
            //     var element = document.getElementById("yes");
            //     element.classList.add("hide");
            // }
            // else {
            //     var element = document.getElementById("yes");
            //     element.classList.add("show");
            //     var element = document.getElementById("no");
            //     element.classList.add("hide");
            // }
            // if ($scope.currentcontext.id != 0) {
            //     var element = document.getElementById("yn-tg");
            //     element.classList.add("show");
            // } else {
            //     var element = document.getElementById("yn-tg");
            //     element.classList.add("hide");
            // }
        }

        $scope.validateForm = function () {
            var isValid = true;
            if (!$scope.currentcontext.isnewpatient && (!$scope.item.PatientId || $scope.item.PatientId == -1)) {
                isValid = false;
                utl.Alert.showErrorMsg($translate.instant('worklists.req-validation-msg.lbl'));
            }
            return isValid;
        }

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

        $scope.save = function () {
            $scope.item.ExtravasationProformaStatusId = 1;
            $scope.item.CreatedAt = utl.Formatter.getCurrentDate();
            $scope.item.CreateddBy = utl.Session.getCurrentUserId();
            $scope.saveItem(1);
        };

        $scope.saveAndApprove = function () {
            $scope.item.ExtravasationProformaStatusId = 2;
            $scope.item.ApprovedBy = utl.Session.getCurrentUserId()
            $scope.item.ApprovedAt = utl.Formatter.getCurrentDate();
            $scope.saveItem(2);
        };

        // $scope.saveItemCallback = function (scope, data, options, hasError) {
        //     utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        //     $scope.backToList();
        // };

        // $scope.saveItem = function (status) {
        //     // if (!utl.Validator.validate($scope)) {
        //     //     return;
        //     // }
        //     // $scope.item.ExtravasationProformaStatusId = status;
        //     var actionName = 'emr/ExtravasationProforma/AddExtravasationProforma';
        //     if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
        //         actionName = 'emr/ExtravasationProforma/UpdateExtravasationProforma';
        //     }

        //     if ($scope.currentcontext.file) {
        //         var actionUrl = utl.Http.getRootPath() + actionName;
        //         Upload.upload({
        //             url: actionUrl,
        //             data: {
        //                 file: $scope.currentcontext.file,
        //                 Data: $scope.item
        //             }
        //         }).then(function (resp) { //upload function returns a promise
        //                 utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        //                 $scope.currentcontext.file = null;
        //                 $scope.backToList();
        //             },
        //             function (resp) { //catch error
        //                 console.log('Error status: ' + resp.status);
        //                 utl.Alert.showErrorMsg('Error status: ' + resp.status);
        //             },
        //             function (evt) {
        //                 console.log(evt);
        //             });
        //         return false;
        //     } else {
        //         var options = {
        //             action: actionName,
        //             data: {
        //                 Data: $scope.item
        //             },
        //             type: 'post',
        //             onComplete: $scope.saveItemCallback
        //         };
        //         utl.Http.doAction(options);
        //     }
        // };
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
        $scope.saveItem = function () {
            var actionName = 'emr/ExtravasationProforma/AddExtravasationProforma';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/ExtravasationProforma/UpdateExtravasationProforma';
            }
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item,
                },
                type: 'post',
                onComplete: $scope.saveItemCallback,
            };
            utl.Http.doAction(options);
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.item.Id
            };
            var options = {
                action: 'emr/ExtravasationProforma/PrintExtravasationProforma',
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
            $scope.getEncounters();
        }

        $scope.initAllLookup = function () {
            var inputData = [{
                "Key": "ExtravasationProformaType",
                Default: false
            }]
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
    ExtravasationDetailedFormController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload', '$timeout'];

})();