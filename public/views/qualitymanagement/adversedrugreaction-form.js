(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('AdverseDrugReactionFormController', AdverseDrugReactionFormController);

    function AdverseDrugReactionFormController($scope, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;
        $scope.item = {
            IsActive: true,
            AdverseDateTime: utl.Formatter.getCurrentDate(),
            PatientId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            AdverseDrugReactionStatusId: 2,
        };
        $scope.multiselect = {}
        // $scope.item.PatientId = parseInt(utl.Session.getEMRPatientId());

        $scope.currentcontext = {};
        $scope.lookup = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.Attachment1 = null;
        $scope.item.Attachment1 = null;
        $scope.currentcontext.fileAtt1 = null;

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
                    action: 'emr/AdverseDrugReaction/GetAdverseDrugReactionById',
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
            console.log($scope.currentcontext.Attachment1,'scope.currentcontext.Attachment1');
        };

        $scope.getviewattachment1 = function () {
            if ($scope.item.Attachment1) {
                var inputData = {
                    Id: $scope.item.Id,
                    Attachment1: $scope.item.Attachment1
                };
                var options = {
                    action: 'emr/AdverseDrugReaction/GetViewAttachment1',
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
                    action: 'emr/AdverseDrugReaction/GetViewAttachment2',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getviewattachmentCallback2
                };
                utl.Http.doAction(options);
            }
        };
        $scope.UploadAttachment1File = function () {
            var actionName = 'emr/AdverseDrugReaction/UploadAttachment';
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
            var actionName = 'emr/AdverseDrugReaction/UploadAttachment';
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
                action: 'emr/AdverseDrugReaction/GetAttachment1File',
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
                action: 'emr/AdverseDrugReaction/GetAttachment2File',
                data: {
                    Data: inputData
                },
                onComplete: $scope.downloadFile2Callback
            };
            utl.Http.doDownload(options);
        }
        $scope.addNew = function () {
            $state.go('app.adversedrugreaction-form', {
                id: 0
            });
        };
        $scope.backToList = function () {
            $state.go('app.adversedrugreaction-list');
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
            if ($scope.item.AdverseDrugReactionStatusId == 1) {
                var element = document.getElementById("btnSaveApprove");
                element.classList.add("show");
            } else {
                var element = document.getElementById("btnSaveApprove");
                element.classList.add("hide");
            }
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
            $scope.item.AdverseDrugReactionStatusId = 1;
            $scope.item.CreatedAt = utl.Formatter.getCurrentDate();
            $scope.item.CreateddBy = utl.Session.getCurrentUserId();
            $scope.saveItem(1);
        };

        $scope.saveAndApprove = function () {
            // $scope.item.ActiveStatus = 'Active'
            $scope.item.AdverseDrugReactionStatusId = 2;
            $scope.item.ApprovedBy = utl.Session.getCurrentUserId()
            $scope.item.ApprovedAt = utl.Formatter.getCurrentDate();
            $scope.saveItem(2);
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
            $scope.getviewattachment1();
        };

        $scope.saveItem = function (status) {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.AdverseDrugReactionStatusId = status;
            var actionName = 'emr/AdverseDrugReaction/AddAdverseDrugReaction';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/AdverseDrugReaction/UpdateAdverseDrugReaction';
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
                action: 'emr/AdverseDrugReaction/PrintAdverseDrugReaction',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        $scope.lookupCallback = function (scope, data, options, hasError, detail) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
            $scope.getItem();
            $scope.getEncounters();
        }

        $scope.initAllLookup = function () {
            var inputData = [{
                "Key": "AdverseDrugReactionType",
                Default: false
            }, {
                "Key": "SourceofDrug",
                Default: false
            }, {
                "Key": "TypeofReaction",
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
    AdverseDrugReactionFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();