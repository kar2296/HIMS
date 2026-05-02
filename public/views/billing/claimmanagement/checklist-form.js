(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('checklistFormController', checklistFormController);

    function checklistFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.currentcontext = {
            encounterid: parseInt($stateParams.id),
            guarantormasterid: $stateParams.gmid,
            billid: $stateParams.billid,
			  attachmentcount: 0,
        };
		 $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.selectedPatient = {};
        $scope.Details = [];

        $scope.getItemCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.Encounter = res.Data[0];
                $scope.selectedPatient = $scope.Encounter.Patient;
            }
			      $scope.getPatientAttachments();
            $scope.getList();
        };

        $scope.getItem = function () {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.encounterid }
            ]
            };
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.checklistcallback = function (scope, res, options, hasError) {
            $scope.Details = [];
            for (var idx in res.Data) {
                var item = {};
                item.GuarantorChecklist = {};
                item.GuarantorChecklist.Title = res.Data[idx].Title;
                item.GuarantorChecklist.SubTitle = res.Data[idx].SubTitle;
                item.ChecklistId = res.Data[idx].Id;
                item.ChecklistStatusId = res.Data[idx].ChecklistStatusId > 0 ? res.Data[idx].ChecklistStatusId
                : 2;
                $scope.Details.push(item);
            }
        }
        $scope.getGuarantorChecklist = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.guarantormasterid }
                ]
            };

            var options = {
                action: 'generalmaster/GuarantorChecklist/GetGuarantorChecklists',
                data: inputData,
                type: 'post',
                onComplete: $scope.checklistcallback
            };

            utl.Http.doAction(options);
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0)
                $scope.Details = res.Data;
            else
            $scope.getGuarantorChecklist();
        }
        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.billid }
                ]
            };

            var options = {
                action: 'billing/PatientInsuranceChecklist/GetPatientInsuranceChecklists',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        }
        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: $scope.Encounter.Patient.Id },
                confirmCallback: loadData
            });
        };
        function loadData() {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                $scope.getItem();
            } else {
                $scope.getEncounterById();
            }
        }
        $scope.generalalerts = function () {
            utl.Modal.open('app.alertview', {
                params: {},
                cancelCallback: $scope.updateCount
            });
        }
        $scope.patientalerts = function () {
            utl.Modal.open('app.alertview', {
                params: { pid: $scope.Encounter.Patient.Id },
                cancelCallback: $scope.updateCount
            });
        }
        $scope.updateCount = function () {
            $scope.getGeneralAlertsCount();
            $scope.getPatientAlertsCount();
        }
        $scope.getPatientAlertsCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.patientAlertsCount = res.Data.length;
        };

        $scope.getPatientAlertsCount = function () {
            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.item.PatientId },
                    { Key: 5, Value: utl.Session.getUserDepartments() },
                    { Key: 6, Value: utl.Session.getCurrentUserId() }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'generalmaster/PatientAlert/GetPatientAlerts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientAlertsCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getGeneralAlertsCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.generalAlertsCount = res.Data.length;
        };
 $scope.openattachments = function () {
            
                utl.Modal.open('app.patientattachments', {
                    params: { pid: $scope.currentcontext.id,  objecttypeid: 1 },
                    confirmCallback: $scope.getPatientAttachments,
                    cancelCallback: $scope.getPatientAttachments
                });
            
        }
        $scope.getPatientAttachmentsCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.attachmentcount = res.PageContext.TotalRecords;
        }

        $scope.getPatientAttachments = function () {
            var inputData = {
                Params: [{ Key: 2, Value: $scope.currentcontext.id }],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'registration/PatientAttachment/GetPatientAttachments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientAttachmentsCallback
            };
            utl.Http.doAction(options);
        }



        $scope.getGeneralAlertsCount = function () {
            var inputData = {
                Params: [
                    { Key: 5, Value: utl.Session.getUserDepartments() },
                    { Key: 6, Value: utl.Session.getCurrentUserId() },
                    { Key: 7, Value: true }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'generalmaster/PatientAlert/GetPatientAlerts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getGeneralAlertsCallback
            };

            utl.Http.doAction(options);
        };
        $scope.backToList = function () {
            $state.go('app.checklist')
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getItem();
        }
        $scope.saveItem = function () {

            var Details = getLineForSave();
            var options = {
                action: 'billing/PatientInsuranceChecklist/ManagePatientInsuranceChecklist',
                data: {
                    Data:
                    {
                        Details: Details, ChecklistStatusId: 2, BillId: $scope.currentcontext.billid
                    }
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        }

        function getLineForSave() {
            var result = [];
            for (var idx in $scope.Details) {
                var item = $scope.Details[idx];
                item.GuarantorId = $scope.Encounter.GuarantorId;
                item.EncounterId = $scope.Encounter.Id;
                item.GuarantorTypeId = $scope.Encounter.GuarantorTypeId;
                item.EncounterTypeId = $scope.Encounter.EncounterTypeId;
                item.PatientBillId = $scope.currentcontext.billid;
                item.PatientId = $scope.Encounter.PatientId;
                item.ChecklistId = $scope.Details[idx].ChecklistId;
                item.ChecklistStatusId = $scope.Details[idx].ChecklistStatusId;
                result.push(item);
            }
            return result;
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "YesNo", Default: false }
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

    checklistFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();