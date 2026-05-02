(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('guarantorFormController', guarantorFormController);

    function guarantorFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));

        $scope.item = {
            IsActive: true,
            FacilityId: utl.Session.getCurrentFacilityId(),
            IsIPBedTariff: 1,
            IsAllFacility: false,
            CountryId: 1
        };

        $scope.currentcontext = {
            attachmentcount: 0,
        };
        $scope.currentcontext.id = parseInt($stateParams.gid);
        $scope.fillDefaultValues = function () {

        }
        if (!$scope.currentcontext.id || $scope.currentcontext.id == 0) {
            $scope.fillDefaultValues();
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.getPatientAttachments();
        };

        $scope.getSelfGuarantorCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id == -1) {
                var inputData = {
                    Params: []
                };

                var options = {
                    action: 'generalmaster/guarantor/GetSelfGuarantor',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getSelfGuarantorCallback
                };
                utl.Http.doAction(options);
            }
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'generalmaster/guarantor/GetGuarantorById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.guarantors');
        }
        $scope.openattachments = function () {
            if ($scope.currentcontext.id > 0) {
                utl.Modal.open('app.patientattachments', {
                    params: {
                        pid: $scope.currentcontext.id,
                        itemid: $scope.item.Id,
                        objecttypeid: 3
                    },
                    confirmCallback: $scope.getPatientAttachments,
                    cancelCallback: $scope.getPatientAttachments
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('generalmaster.guarantor-form.alert.lbl'));
            }
        }
        $scope.getPatientAttachmentsCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.attachmentcount = res.PageContext.TotalRecords;
        }

        $scope.getPatientAttachments = function () {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentcontext.id
                }, {
                    Key: 3,
                    Value: 3
                }],
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

        // $scope.saveItemCallback = function (scope, data, options, hasError) {
        //     utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        //     if (typeof (data) == "boolean") {
        //         if (options && options.data != null && options.data.Data != null) {
        //             $scope.currentcontext.id = options.data.Data.Id;
        //             $scope.getItem();
        //         }
        //     }
        //     else if (typeof (data) == "number") {
        //         //  $state.go('app.usertab.general');
        //         $state.go('app.guarantortab.general', { id: data, GuarantorName: options.data.Data.Code + ' - ' + options.data.Data.GuarantorName });
        //     }
        //     else {
        //         $scope.backToList(); // Safer side added
        //     }
        //     // $scope.backToList();
        // };
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            //  $scope.backToList();
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }
            if ($scope.item.IsAllFacility == true) {
                $scope.item.FacilityId = -1;
            }
            if ($scope.item.IsAllFacility == false) {
                $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            }
            if (utl.Formatter.isPastDate($scope.item.ContractExpiryDate)) {
                utl.Alert.showErrorMsg($translate.instant('generalmaster.guarantor-form.contractexpirydate-cant-past-msg.lbl'));
                return;
            }

            if (utl.Formatter.isFutureDate($scope.item.ContractDate)) {
                utl.Alert.showErrorMsg($translate.instant('generalmaster.guarantor-form.contractdate-cant-future-msg.lbl'));
                return;
            }

            var actionName = 'generalmaster/guarantor/AddGuarantor';
            if (($scope.currentcontext.id && $scope.currentcontext.id > 0) || $scope.currentcontext.id == -1) {
                actionName = 'generalmaster/guarantor/UpdateGuarantor';
            }

            if ($scope.item.CreditLimit) {
                $scope.item.CreditLimit = Math.abs($scope.item.CreditLimit);
            }
            if ($scope.item.AvailableLimit) {
                $scope.item.AvailableLimit = Math.abs($scope.item.AvailableLimit);
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
        $scope.clear = function () {
            $scope.item = {};
            $scope.fillDefaultValues();
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
                },
                {
                    "Key": "GuarantorType"
                },
                {
                    "Key": "TPA"
                },
                {
                    "Key": "ServiceRateCategory",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, $scope.item.FacilityId]
                        }]
                    }
                },
                {
                    "Key": "GuarantorClientType"
                },
                {
                    "Key": "Pincode"
                },
                {
                    "Key": "City"
                },
                {
                    "Key": "District"
                },
                {
                    "Key": "State"
                },
                {
                    "Key": "Country"
                }
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

    guarantorFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();