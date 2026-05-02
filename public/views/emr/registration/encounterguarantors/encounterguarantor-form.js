(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('encounterGuarantorFormController', encounterGuarantorFormController);

    function encounterGuarantorFormController($scope, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            ActiveStatusId: 2,
            GuarantorLetterDate: utl.Formatter.getCurrentDate(),
            GuarantorId: -1,
            RankId: 1
        };
        $scope.currentcontext = {};

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.encounterid = parseInt(modalConfig.params.encounterid);

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.guarantorChange = function (selectedItem) {
            $scope.item.GuarantorName = selectedItem.Text;
        }

        //get item
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
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

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'registration/EncounterGuarantor/GetEncounterGuarantorById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.clear = function () {
            $scope.item = {};
        }
        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {

            // if(!$scope.item_form.isValid()) {
            //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            //    return;
            // }
            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'registration/EncounterGuarantor/AddEncounterGuarantor';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'registration/EncounterGuarantor/UpdateEncounterGuarantor';
            }

            $scope.item.EncounterId = $scope.currentcontext.encounterid;
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.guarantorTypeChangeCallback = function (scope, data, options, hasError) {
            $scope.lookup.Guarantor = data.Guarantor;
        };

        $scope.guarantorTypeChange = function () {
            var inputData = [
                { Key: "Guarantor", Request: { Params: [{ Key: 2, Value: $scope.item.GuarantorTypeId }] } }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.guarantorTypeChangeCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "GuarantorType" },
                { "Key": "PatientGuarantor" },
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
                { "Key": "ActiveStatus" }
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

    encounterGuarantorFormController.$inject = ['$scope', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();