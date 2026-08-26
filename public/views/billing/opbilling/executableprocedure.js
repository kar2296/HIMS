(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ExecutableProceduresController', ExecutableProceduresController);

    function ExecutableProceduresController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId()
        };
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.item.ExecutableProcedureId = parseInt(modalConfig.params.ExecutableProcedureId);
            $scope.item.Id = parseInt(modalConfig.params.ExecutableProcedureId);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        //get item
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data.Data[0];
            $scope.PatientExecutableProcedures = data.Data[0];
            $scope.item.PatientId = $scope.PatientExecutableProcedures.PatientId;
            $scope.item.Title =  $scope.PatientExecutableProcedures.Patient.Title.Description;
            $scope.item.FirstName =  $scope.PatientExecutableProcedures.Patient.FirstName;
            $scope.item.LastName =  $scope.PatientExecutableProcedures.Patient.LastName;
            $scope.item.MRN =  $scope.PatientExecutableProcedures.Patient.MRN;
            $scope.item.Gender =  $scope.PatientExecutableProcedures.Patient.Gender.Description;
            $scope.item.Age =  $scope.PatientExecutableProcedures.Patient.Age;
            $scope.item.Mobile =  $scope.PatientExecutableProcedures.Patient.Mobile;
            $scope.item.EncounterId = $scope.PatientExecutableProcedures.EncounterId;
            $scope.item.VisitIdentifier = $scope.PatientExecutableProcedures.Encounter.VisitIdentifier;
            $scope.item.AdmissionDate = $scope.PatientExecutableProcedures.Encounter.AdmissionDate;
            $scope.item.DoctorId = $scope.PatientExecutableProcedures.DoctorId;
            $scope.item.DoctorTitle = $scope.PatientExecutableProcedures.User.Title.Description;
            $scope.item.DoctorFirstName = $scope.PatientExecutableProcedures.User.FirstName;
            $scope.item.DoctorLastName = $scope.PatientExecutableProcedures.User.LastName;
            $scope.item.PatientBillId = $scope.PatientExecutableProcedures.PatientBillId;
            if ($scope.PatientExecutableProcedures.PatientBills) {
                $scope.item.BillNumber = $scope.PatientExecutableProcedures.PatientBills.BillNumber;
            }
            if ($scope.PatientExecutableProcedures.PatientOrder) {
                $scope.item.OrderNumber = $scope.PatientExecutableProcedures.PatientOrder.OrderNumber;
            }
            $scope.item.BillDateTime = $scope.PatientExecutableProcedures.BillDateTime;
            $scope.item.OrderRequestDate = $scope.PatientExecutableProcedures.OrderRequestDate;
            $scope.item.PatientBillDetailId = $scope.PatientExecutableProcedures.PatientBillDetailId;
            $scope.item.ServiceId = $scope.PatientExecutableProcedures.ServiceId;
            $scope.item.ServiceName = $scope.PatientExecutableProcedures.ServiceName;
            $scope.item.ServiceCategoryId = $scope.PatientExecutableProcedures.ServiceCategoryId;
            $scope.item.TestId = $scope.PatientExecutableProcedures.TestId;
            $scope.item.TestCode = $scope.PatientExecutableProcedures.TestCode;
            $scope.item.TestName = $scope.PatientExecutableProcedures.TestName;
            $scope.item.DepartmentId = $scope.PatientExecutableProcedures.DepartmentId;
            $scope.item.DepartmentCode = $scope.PatientExecutableProcedures.ServiceDepartment.DepartmentCode;
            $scope.item.DepartmentName = $scope.PatientExecutableProcedures.ServiceDepartment.DepartmentName;
            $scope.item.ExecutableProcedureStatusId = $scope.PatientExecutableProcedures.ExecutableProcedureStatusId;
            $scope.item.Quantity = $scope.PatientExecutableProcedures.Quantity;
            $scope.item.Rate = $scope.PatientExecutableProcedures.Rate;
            $scope.item.Amount = $scope.PatientExecutableProcedures.Amount;
            $scope.item.Comments = $scope.PatientExecutableProcedures.Comments;
            $scope.item.BodySiteId = $scope.PatientExecutableProcedures.BodySiteId;
            $scope.item.AssignTypeId = $scope.PatientExecutableProcedures.AssignTypeId;
            $scope.item.ExecutedBy = $scope.PatientExecutableProcedures.ExecutedBy;
            $scope.item.ExecutedAt = $scope.PatientExecutableProcedures.ExecutedAt;
            if ($scope.item.ExecutedBy == 0 || $scope.item.ExecutedBy == null) {
                $scope.item.ExecutedBy = utl.Session.getCurrentUserId();
            }
            if (!$scope.item.ExecutedAt || $scope.item.ExecutedAt == null) {
                $scope.item.ExecutedAt = utl.Formatter.getCurrentDate();
            }
            if ($scope.item.BodySiteId == 0 || $scope.item.BodySiteId == null) {
                $scope.item.BodySiteId = -1;
            }
            if ($scope.item.AssignTypeId == 0 || $scope.item.AssignTypeId == null) {
                $scope.item.AssignTypeId = -1;
            }
            $scope.refreshReactProps();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.item.ExecutableProcedureId && $scope.item.ExecutableProcedureId > 0) {
                var inputData = {
                    Params: [
                        { Key: 0, Value: $scope.item.ExecutableProcedureId }
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'Billing/PatientExecutableProcedure/GetPatientExecutableProcedures',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            //$scope.getItem();
            $scope.confirmCallback();
        };

        $scope.saveItem = function () {
            if ($scope.item.Id && $scope.item.Id > 0) {
                var actionName = '';
                actionName = 'Billing/PatientExecutableProcedure/UpdatePatientExecutableProcedure';
                var options = {
                    action: actionName,
                    data: { Data: $scope.item },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
            $scope.refreshReactProps();
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
                },
                { "Key": "BodySite" },
                { "Key": "LabAssignType" },
                { "Key": "User" },
                { "Key": "ExecutableProcedureStatus" }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                assignTypeId: $scope.item.AssignTypeId,
                bodySiteId: $scope.item.BodySiteId,
                executableProcedureStatusId: $scope.item.ExecutableProcedureStatusId,
                executedBy: $scope.item.ExecutedBy,
                assignTypeOptions: ($scope.lookup && $scope.lookup.LabAssignType) || [],
                bodySiteOptions: ($scope.lookup && $scope.lookup.BodySite) || [],
                statusOptions: ($scope.lookup && $scope.lookup.ExecutableProcedureStatus) || [],
                userOptions: ($scope.lookup && $scope.lookup.User) || []
            };
            $scope.$applyAsync();
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'assignTypeChange':
                    $scope.item.AssignTypeId = payload.value;
                    $scope.refreshReactProps();
                    break;
                case 'bodySiteChange':
                    $scope.item.BodySiteId = payload.value;
                    $scope.refreshReactProps();
                    break;
                case 'statusChange':
                    $scope.item.ExecutableProcedureStatusId = payload.value;
                    $scope.refreshReactProps();
                    break;
                case 'executedByChange':
                    $scope.item.ExecutedBy = payload.value;
                    $scope.refreshReactProps();
                    break;
            }
        };

        $scope.initLookup();
    }

    ExecutableProceduresController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();