(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('housekeepRequestFormController', housekeepRequestFormController);

    function housekeepRequestFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.item = {
            HousekeepingActivityId: 1,
            RequestTypeId: 1,
            HousekeepingStatusId: -1
        };
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.currentcontext.id = -1;
        $scope.lookup = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.selectedPatient = {};

        if (modalConfig && modalConfig.params) {
            $scope.item.PatientId = modalConfig.params.pid;
            $scope.item.EncounterId = modalConfig.params.eid;
            if (modalConfig.params.isbed)
                $scope.IsBedScreen = true;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.IsBedScreen = false;
        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
        }
        //$scope.currentfilter = { PatientId: -1 };
        $scope.patientChange = function () {
            //console.log($scope.item.PatientId);
            if ($scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.item.PatientId
                    },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };
                utl.Http.doAction(options);
            }
        }

        $scope.getCreatedUserCallback = function (scope, res, options, hasError) {
            $scope.CreatedUser = res.Data[0];
            // vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getCreatedUser = function () {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.id
                }]
            };

            var options = {
                action: 'IPManagement/BedHousekeeping/GetBedHousekeepings',
                data: inputData,
                type: 'post',
                onComplete: $scope.getCreatedUserCallback
            };

            utl.Http.doAction(options);
        };
        $scope.visiblityRule = function () {
            if ($scope.item.HousekeepingStatusId == -1) {
                $scope.backBtn = true;
                $scope.cancelBtn = false;
                $scope.printBtn = false;
                $scope.assignBtn = false;
                $scope.saveBtn = true;
                $scope.approveBtn = true;
                $scope.clearBtn = true;
                $scope.completedBtn = false;
                $scope.assigned = true;
            }
            if ($scope.item.HousekeepingStatusId == 1 || $scope.currentcontext.id == 0) {
                $scope.backBtn = true;
                $scope.cancelBtn = false;
                $scope.printBtn = false;
                $scope.assignBtn = false;
                $scope.saveBtn = true;
                $scope.approveBtn = true;
                $scope.clearBtn = true;
                $scope.completedBtn = false;
            } else if ($scope.item.HousekeepingStatusId == 2) {
                $scope.backBtn = true;
                $scope.cancelBtn = true;
                $scope.printBtn = true;
                $scope.assignBtn = true;
                $scope.saveBtn = false;
                $scope.approveBtn = false;
                $scope.clearBtn = false;
                $scope.completedBtn = false;
                $scope.assigned = true;
            } else if ($scope.item.HousekeepingStatusId == 3) {
                $scope.backBtn = true;
                $scope.cancelBtn = true;
                $scope.printBtn = true;
                $scope.assignBtn = false;
                $scope.saveBtn = false;
                $scope.approveBtn = false;
                $scope.clearBtn = false;
                $scope.completedBtn = true;
                $scope.assigned = true;
            } else if ($scope.item.HousekeepingStatusId == 4 || $scope.item.HousekeepingStatusId == 5) {
                $scope.backBtn = true;
                $scope.cancelBtn = false;
                $scope.printBtn = true;
                $scope.assignBtn = false;
                $scope.saveBtn = false;
                $scope.approveBtn = false;
                $scope.clearBtn = false;
                $scope.completedBtn = false;
                if ($scope.item.HousekeepingStatusId == 4) {
                    $scope.assigned = true;
                }
            }
        }
        $scope.getItemCallback = function (scope, data, options, hasError) {
            // if (data.Data) {
            $scope.item = data;
            //$scope.currentfilter.PatientId = $scope.item.PatientId;
            // $scope.item.AdmissionDate = new Date(data.AdmissionDate);
            if ($scope.item.HousekeepingStatusId >= 2) {
                $scope.isDisabled = true;
            }
            // } else {
            //     $scope.patientChange();
            // }
            $scope.loadAdditionalLookup();
            $scope.getCreatedUser();
            $scope.visiblityRule();
            $scope.patientChange();
        };
        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                $scope.IsDisbled = false;
                var options = {
                    action: 'IPManagement/BedHousekeeping/GetBedHousekeepingById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
            $scope.visiblityRule();
        };
        // $scope.getItem = function () {
        //     var inputData = {
        //         Params: [
        //             { Key: 12, Value: $scope.item.PatientId },
        //             { Key: 13, Value: $scope.item.EncounterId },
        //         ]
        //     };
        //     var options = {
        //         action: 'IPManagement/BedHousekeeping/GetBedHousekeepings',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.getItemCallback
        //     };
        //     utl.Http.doAction(options);
        //     $scope.visiblityRule();
        // };

        // $scope.getItem = function (pageNo) {
        //     if ($scope.item.PatientId && $scope.item.PatientId > 0) {
        //     $scope.IsDisbled = false;
        //     var options = {
        //         action: 'IPManagement/BedHousekeeping/GetBedHousekeepingById',
        //         data: {
        //             PatientId: $scope.item.PatientId,
        //             EncounterId: $scope.item.EncounterId
        //         },
        //         type: 'post',
        //         onComplete: $scope.getItemCallback
        //     };
        //     utl.Http.doAction(options);
        //     }
        //     $scope.visiblityRule();
        // };

        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: $scope.item.PatientId
                },
                confirmCallback: $scope.getList
            });
        }

        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            } else
                $state.go('app.housekeeprequests');
        }
        $scope.housekeephistory = function () {
            if ($scope.item.PatientId > 0) {
                utl.Modal.open('app.housekeephistory', {
                    params: {
                        pid: $scope.item.PatientId,
                        EncounterId: $scope.currentcontext.id
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('admission.previous-admi-nopatient-msg.lbl'));
            }
        }

        $scope.clearItem = function () {
            $scope.item = {};
            $scope.fillDefaultValues();
        }

        $scope.save = function () {
            // if ($scope.currentcontext.id == 0) {
            $scope.item.HousekeepingStatusId = 1;
            // }

            $scope.saveItem();
        };
        $scope.confirmation = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Are you sure do you want to Complete this Request',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveAndComplete,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }
        $scope.saveAndApprove = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            // if ($scope.currentcontext.id == 0 || $scope.item.HousekeepingStatusId == 1) {
            $scope.item.HousekeepingStatusId = 2;
            // }
            $scope.saveItem();
        };
        $scope.saveAndAssign = function () {
            // if (!utl.Validator.validate($scope)) {
            //     return;
            // }
            if (!$scope.item.AssignedId) {
                utl.Alert.showErrorMsg($translate.instant('Please Assigned to some one else'));
                return false;
            }
            $scope.item.HousekeepingStatusId = 3;
            $scope.saveItem();
        }
        $scope.saveAndComplete = function () {
            $scope.item.HousekeepingStatusId = 4;
            $scope.saveItem();
        }
        $scope.onCancelConfirmed = function () {
            $scope.item.HousekeepingStatusId = 5;
            var actionName = 'ipmanagement/BedHousekeeping/UpdateBedHousekeeping';
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.CancelRequest = function () {
            utl.Dialog.confirmCancel($scope.onCancelConfirmed, $scope.currentcontext.id, $scope.item.RequestIdentifier);
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };


        // $scope.changeServiceRateCategory = function (selectedItem) {
        //     $scope.item.ServiceRateCategoryId = selectedItem.ServiceRateCategory.Id;
        // }
        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'ipmanagement/BedHousekeeping/AddBedHousekeeping';
            if ($scope.item.Id && $scope.item.Id > 0) {
                actionName = 'ipmanagement/BedHousekeeping/UpdateBedHousekeeping';
                if ($scope.item.HousekeepingStatusId == 1) {
                    $scope.item.HousekeepingStatusId = 2;
                }
            }

            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            $scope.GlobalSave = options;
            utl.Http.doAction(options);
        };

        $scope.getEncounterInfo = function () {
            var Encounter = $scope.item.SelectedItem;
            $scope.item.PatientId = Encounter.PatientId;
            $scope.item.LocationId = Encounter.LocationId;
            $scope.item.WardId = Encounter.WardId;
            $scope.item.RoomId = Encounter.RoomId;
            $scope.item.BedId = Encounter.BedId;
            $scope.patientChange();
        }

        //autosearch related code starts - 
        vm.patientcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Title',
                    field: 'TitleId',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Patient Name',
                    field: 'PatientName',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'MRN',
                    field: 'PatientMrn',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Visit Number',
                    field: 'VisitIdentifier',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Ward Name',
                    field: 'WardName',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Room No',
                    field: 'RoomNo',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Bed No',
                    field: 'BedNo',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },



            ],
            searchparams: {},
            result: {},
            api: 'Visit/Visit/GetEncounters',
            presearch: presearchencounter,
            formatdisplay: formatselectedencounter,
            postsearch: postsearchencounter
        };

        function formatselectedencounter() {
            var selectedItem = vm.patientcontrolconfig.selected;
            var result = '';
            $scope.item.PatientId = result.PatientId;
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.Patient.Title.Description, selectedItem.Patient.FirstName, selectedItem.Patient.LastName].join(' ');
            } else if (vm.patientcontrolconfig.rowdata) {
                if (vm.patientcontrolconfig.rowdata.Patient) {
                    result = [vm.patientcontrolconfig.rowdata.Patient.TitleId, vm.patientcontrolconfig.rowdata.Patient.FirstName].join(' ');
                }
            }
            $scope.getEncounterInfo();
            return result;
        }

        function presearchencounter() {
            var query = vm.patientcontrolconfig.query;

            //Search only active patients
            var inputData = {
                Params: [{
                    Key: 15,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.patientcontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 11,
                    Value: query
                });
            }

            vm.patientcontrolconfig.searchparams = inputData;
        }

        function postsearchencounter() {
            for (var idx in vm.patientcontrolconfig.result) {
                var item = vm.patientcontrolconfig.result[idx];
                item.PatientName = item.Patient.FirstName;
                item.WardName = item.WardMaster.WardName;
                item.RoomNo = item.WardRoomMaster.RoomNo;
                item.BedNo = item.WardRoomBedMaster.BedNo;
                item.TitleId = item.Patient.Title.Description;

            }
        }
        //autosearch related code ends - 

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
        }

        $scope.print = function () {
            var actionName = 'ipmanagement/BedHousekeeping/PrintBedHousekeeping';
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doDownload(options);
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

        $scope.initAllLookup = function () {
            var inputData = [{
                    "Key": "Facility"
                },
                {
                    "Key": "Location"
                },
                {
                    "Key": "HousekeepingActivity"
                },
                {
                    "Key": "RequestType"
                },
                {
                    "Key": "HousekeepingStatus"
                },
                {
                    "Key": "User",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 12
                        }]
                    }
                }
            ]
            $scope.lookupCall(inputData);
            // $scope.patientChange();
            $scope.getItem();
            $scope.loadAdditionalLookup();
        }

        $scope.wardLookUp = function () {
            var inputData = [{
                "Key": "Ward",
                Request: {
                    Params: [{
                            Key: 2,
                            Value: $scope.item.FacilityId || 0
                        },
                        {
                            Key: 5,
                            Value: $scope.item.LocationId || 0
                        }
                    ]
                }
            }, ];
            $scope.lookupCall(inputData);
            $scope.item.WardId = $scope.item.WardId || 0;
            $scope.item.RoomId = $scope.item.RoomId || 0;
            $scope.item.BedId = $scope.item.BedId || 0;
        }

        $scope.getRoomLookUp = function () {
            var inputData = [{
                "Key": "Room",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: $scope.item.WardId || 0
                    }]
                }
            }];
            $scope.lookupCall(inputData);
        }

        $scope.getBedLookUp = function () {
            var inputData = [{
                "Key": "Bed",
                Request: {
                    Params: [{
                            Key: 1,
                            Value: $scope.item.WardId || 0
                        },
                        {
                            Key: 2,
                            Value: $scope.item.RoomId || 0
                        }
                    ]
                }
            }];
            $scope.lookupCall(inputData);
        }
        $scope.getDeptUser = function () {
            var inputData = [{
                "Key": "User",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: 12
                    }]
                }
            }];
            $scope.lookupCall(inputData);
        }

        $scope.loadAdditionalLookup = function () {
            $scope.wardLookUp();
            $scope.getRoomLookUp();
            $scope.getBedLookUp();
            $scope.getDeptUser();
        }

        $scope.initAllLookup();
    }
    housekeepRequestFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();