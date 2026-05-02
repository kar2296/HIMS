(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('BloodBankRequestController', BloodBankRequestController);

    function BloodBankRequestController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            BloodRequestDate: utl.Formatter.getCurrentDate(),
            EncounterId: utl.Session.getEncounterId(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            PatientId: parseInt(utl.Session.getEMRPatientId()),
            IsWhiteBlood: false,
            IsPackedCell: false,
            IsPlatelet: false,
            IsFFP: false,
            IsOthers: false,
        };
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter) {
            $scope.item.EncounterId = $scope.currentcontext.encounter.Id;
            $scope.item.EncounterTypeId = $scope.currentcontext.encounter.EncounterTypeId;
            $scope.item.DoctorId = $scope.currentcontext.encounter.DoctorId;
        }
        $scope.$parent.Encounter = $scope.currentcontext.encounter;
        $scope.lookup = {};
        $scope.lookup = {};
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        // $scope.currentcontext.eid = parseInt($stateParams.eid);
        // $scope.currentcontext.pid = parseInt($stateParams.pid);

        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.$parent.SelectedItem.PatientId = data.PatientId;
            $scope.$parent.SelectedItem.BloodRequestDate = data.BloodRequestDate;
            $scope.$parent.SelectedItem.OTIdentifier = data.OTIdentifier;
            $scope.$parent.SelectedItem.CreatedUser = data.CreatedUser.Title.Description + ' ' +
                data.CreatedUser.FirstName + ' ' + data.CreatedUser.LastName;
            $scope.$parent.SelectedItem.BloodBankStatusId = data.BloodBankStatusId;
            if (data.BloodBankStatusId == 1) {
                $scope.SelectedItem.BloodBankStatusId = "Draft";
            }
            if (data.BloodBankStatusId == 2) {
                $scope.SelectedItem.BloodBankStatusId = "Requested";
            }
            if (data.BloodBankStatusId == 3) {
                $scope.SelectedItem.BloodBankStatusId = "Approved";
            }
            if (data.BloodBankStatusId == 4) {
                $scope.SelectedItem.BloodBankStatusId = "Transferred";
            }
            if (data.BloodBankStatusId == 5) {
                $scope.SelectedItem.BloodBankStatusId = "Cancelled";
            }
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'emr/BloodRequest/GetBloodRequestById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('patientemr.bloodbanks');
        }

        $scope.save = function () {
            $scope.saveItem();
        }
        $scope.saveAndApprove = function () {
            $scope.item.BloodBankStatusId = 2;
            $scope.saveItem();
        }

        $scope.onCancelConfirmed = function () {
            $scope.saveItem(4);// Completed
        }
        $scope.Cancel = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'otrequest-form.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                // placeholder: $scope.item.ReceiptNumber,
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions, $scope.item.ReceiptNumber);
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'OtManagement/OtRequest/DeleteOtRequest',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
            $scope.backToList();
        };
        $scope.saveDeleteRpt = function () {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, $scope.currentcontext.id);
            // Deleted
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof (data) == "boolean") {
                if (options && options.data != null && options.data.Data != null) {
                    $scope.currentcontext.id = options.data.Data.Id;
                    $scope.getItem();
                }
            }
            else if (typeof (data) == "number") {
                //  $state.go('app.usertab.general');
                $state.go('patientemr.bloodbanktab.bloodrequest', { id: data });
                $scope.currentcontext.id = data;
                $scope.getItem();
            }
            else {
                $scope.backToList(); // Safer side added
            }

            // loadData();
        };
        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: $scope.item.PatientId },
                confirmCallback: $scope.getItem
            });
        }

        $scope.clear = function () {
            $scope.item = {};
        }
        $scope.saveItem = function (status) {
            if ($scope.item.PatientId <= 0) {
                utl.Alert.showSuccessMsg($translate.instant('admission.selectthepatient.lbl'));
                return;
            }
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'emr/BloodRequest/AddBloodRequest';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/BloodRequest/UpdateBloodRequest';
            }
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        // function loadData() {
        //     $scope.getItem();
        // }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
        }
        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "BloodPriority", Default: false },
                { "Key": "Feedbacks", Default: false }
            ];
            $scope.getLookUp(inputData);
        }
        $scope.getLookUp = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }
        $scope.initLookup();
        $scope.getItem();
    }

    BloodBankRequestController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();