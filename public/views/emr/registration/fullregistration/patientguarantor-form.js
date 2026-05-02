(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientguarantorFormController', patientguarantorFormController);

    function patientguarantorFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            ActiveStatusId: 2,
            GuarantorLetterDate: utl.Formatter.getCurrentDate(),
            GuarantorId: -1,
            GuarantorCustomerId: -1,
            RankId: 1,
            IsActive: true,
            GuarantorTypeId: 2
        };

        $scope.currentcontext = {};

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.patientid = parseInt(modalConfig.params.pid);
            $scope.IsRankExist = modalConfig.params.isrankexst;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.guarantorChange = function (selectedItem) {
            $scope.item.GuarantorName = selectedItem.Text;
            $scope.item.TpaId = selectedItem.TPAId;
            $scope.item.GuarantorId = selectedItem.Id;

            $scope.GetGuarantorCustomers();
        };

        $scope.GetGuarantorCustomers = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.item.GuarantorId },
                    { Key: 2, Value: 2 }
                ],
                PageContext: { PageSize: 250, PageNumber: 1 }
            };

            var options = {
                action: 'generalmaster/GuarantorCustomer/GetGuarantorCustomers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getGuarantorCustomersCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getGuarantorCustomersCallback = function (scope, res, options, hasError) {
            $scope.lookup["GuarantorCustomer"] = [];
            if (res.Data && res.Data.length > 0) {
                var PleaseSelect = {
                    Id: -1,
                    CustomerName: "Please Select"
                };
                $scope.lookup["GuarantorCustomer"].push(PleaseSelect);
                res.Data.forEach((val, idx) => {
                    $scope.lookup["GuarantorCustomer"].push(val);
                });
                $scope.item.GuarantorCustomerId = -1;
            }
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.item.IsActive = $scope.item.ActiveStatusId == 2 ? true : false;
            $scope.IsRankExist = !$scope.item.Rank == 1;
            if (data.Guarantor) {
                if (data.Guarantor.GuarantorCustomers) {
                    $scope.lookup["GuarantorCustomer"] = [];
                    var PleaseSelect = {
                        Id: -1,
                        CustomerName: "Please Select"
                    };
                    $scope.lookup["GuarantorCustomer"].push(PleaseSelect);
                    data.Guarantor.GuarantorCustomers.forEach((val, idx) => {
                        $scope.lookup["GuarantorCustomer"].push(val);
                    });
                }
            }
            $scope.getPatientAttachments();
        };

        $scope.openattachments = function () {
            if ($scope.currentcontext.id > 0) {
                utl.Modal.open('app.patientattachments', {
                    params: { pid: $scope.currentcontext.id, itemid: $scope.item.Id, objecttypeid: 1 },
                    confirmCallback: $scope.getPatientAttachments,
                    cancelCallback: $scope.getPatientAttachments
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('registration.fullregistration.savepatient-msg.lbl'));
            }
        };

        $scope.getPatientAttachmentsCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.attachmentcount = res.PageContext.TotalRecords;
        };

        $scope.getPatientAttachments = function () {
            var inputData = {
                Params: [{ Key: 2, Value: $scope.currentcontext.id }],
                PageContext: { PageSize: 1000, PageNumber: 1 }
            };

            var options = {
                action: 'registration/PatientAttachment/GetPatientAttachments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientAttachmentsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'registration/PatientGuarantor/GetPatientGuarantorById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };

                utl.Http.doAction(options);
            }
        };

        $scope.clear = function () {
            $scope.item = {};
        };

        $scope.backToList = function () {
            $scope.confirmCallback();
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }

            if ($scope.item.TpaId == -1) {
                if ($scope.item.GuarantorTypeId != 1 && $scope.item.GuarantorTypeId != 3) {
                    utl.Alert.showErrorMsg($translate.instant('TPA is Required'));
                    return false;
                }
            }

            if ($scope.IsRankExist && $scope.item.Rank == 1) {
                utl.Alert.showErrorMsg($translate.instant('registration.guarantor-form.alert.lbl'));
                return false;
            }

            if ($scope.item.GuarantorTypeId == 3) {
                if (!$scope.item.EmployeeId || !$scope.item.EmployeeName) {
                    utl.Alert.showErrorMsg($translate.instant('Employee Name and Id is Required'));
                    return false;
                }
            }

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'registration/PatientGuarantor/AddPatientGuarantor';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'registration/PatientGuarantor/UpdatePatientGuarantor';
            }

            $scope.item.PatientId = $scope.currentcontext.patientid;

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };

            utl.Http.doAction(options);
        };

        $scope.guarantorTypeChange = function () {
            $scope.item.GuarantorId = -1;
            $scope.item.TpaId = -1;
        };

        $scope.GetGuarantorCallback = function (scope, data, options, hasError) {
            $scope.lookup["Guarantor"] = data["Guarantor"];
            $scope.guarantorTypeChange();
        };

        $scope.GetGuarantor = function () {
            var inputData = [
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [
                            { Key: 2, Value: $scope.item.GuarantorTypeId },
                            { Key: 7, Value: [-1,utl.Session.getCurrentFacilityId()] }
                        ]
                    }
                }
            ];

            $scope.initLookupCall(inputData, $scope.GetGuarantorCallback);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        };

        $scope.initLookupCall = function (inputData, callback) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: callback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "GuarantorType" },
                { "Key": "Tpa" },
                { "Key": "Rank" },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "GuardianType" },
                { "Key": "ActiveStatus" },
                { "Key": "DiscountMode" }
            ];

            $scope.initLookupCall(inputData, $scope.lookupCallback);
        };

        $scope.initLookup();
    }

    patientguarantorFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();