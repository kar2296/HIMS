(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('GuarantorUpdateFormController', GuarantorUpdateFormController);

    function GuarantorUpdateFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));

        $scope.item = {
            ActiveStatusId: 2,
            GuarantorLetterDate: utl.Formatter.getCurrentDate(),
            GuarantorId: -1,
            GuarantorCustomerId: -1,
            RankId: 1,
            IsActive: true,
            GuarantorTypeId: 2
        };
        $scope.PGuarantor = [];
        $scope.currentcontext = {};
        var isDatachanged = 0;
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.gid = parseInt(modalConfig.params.gid);
            $scope.currentcontext.eid = parseInt(modalConfig.params.encid);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.wardId = parseInt(modalConfig.params.wardId);
            $scope.currentcontext.admissionstatusid = parseInt(modalConfig.params.admissionstatusid);
            $scope.IsRankExist = modalConfig.params.isrankexst;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.guarantorChange = function (selectedItem) {
            $scope.item.GuarantorId = selectedItem.Id;
            if ($scope.item.OldGuarantorId != $scope.item.GuarantorId) {
                // $scope.currentcontext.id = gData.Id;
                isDatachanged = 1;
                $scope.item = {};
            }
            $scope.item.GuarantorName = selectedItem.Text;
            $scope.item.GuarantorId = selectedItem.Id;
            $scope.item.GuarantorTypeId = selectedItem.GuarantorTypeId;
            $scope.item.TpaId = selectedItem.TPAId;
            $scope.item.CoPayPercent = selectedItem.CoPayPercent;
            $scope.item.ServiceRateCategoryId = $scope.currentcontext.ServiceRateCategoryId;
        };


        $scope.getinfoCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                $scope.item = data.Data[0];
                $scope.currentcontext.id = $scope.item.Id;
                $scope.item.OldGuarantorId = $scope.item.GuarantorId;
            }
            $scope.GetGuarantor(false);
            isDatachanged = 1;
            $scope.PGuarantor = data.Data;
        };

        $scope.getinfo = function () {
            var inputData = {
                Params: [{
                        Key: 7,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 5,
                        Value: $scope.currentcontext.gid
                    }
                ]
            };

            var options = {
                action: 'registration/PatientGuarantor/GetPatientGuarantors',
                data: inputData,
                type: 'post',
                onComplete: $scope.getinfoCallback
            };

            utl.Http.doAction(options);
        };

        // $scope.getItemCallback = function (scope, data, options, hasError) {
        //     $scope.item = data;
        //     $scope.item.IsActive = $scope.item.ActiveStatusId == 2 ? true : false;
        //     // $scope.IsRankExist = !$scope.item.Rank == 1;
        // };

        // $scope.getItem = function (pageNo) {
        //     if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
        //         var options = {
        //             action: 'registration/PatientGuarantor/GetPatientGuarantorById',
        //             data: {
        //                 Id: $scope.currentcontext.id
        //             },
        //             type: 'post',
        //             onComplete: $scope.getItemCallback
        //         };
        //         utl.Http.doAction(options);
        //     }
        // };

        $scope.clear = function () {
            $scope.item = {};
        };


        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback($scope.item);
        };

        $scope.saveItem = function () {
            $scope.item.ActiveStatusId = 2;

            if (!utl.Validator.validate($scope)) {
                return;
            }
            if ($scope.item.GuarantorTypeId == 2 && $scope.item.GuarantorLetterNo == null) {
                utl.Alert.showErrorMsg($translate.instant('Please enter GL / Approval No'));
                return false;
            }

            // for (var gx in $scope.PGuarantor) {
            //     var gData = $scope.PGuarantor[gx];

            // }
            var actionName = 'registration/PatientGuarantor/AddPatientGuarantor';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0 && isDatachanged == 1) {
                actionName = 'registration/PatientGuarantor/UpdatePatientGuarantor';
            }
            $scope.item.IsWardInsTariff = true;
            $scope.item.PatientId = $scope.currentcontext.pid;
            $scope.item.EncounterId = $scope.currentcontext.eid;

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

        $scope.getWardInsuranceTariffCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.currentcontext.ServiceRateCategoryId = res.Data[0].RateTypeId;
            }
        };

        $scope.getWardInsuranceTariffs = function () {
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.wardId
                    },
                    {
                        Key: 5,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    },
                    {
                        Key: 6,
                        Value: $scope.item.GuarantorTypeId
                    },
                ],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'generalmaster/WardInsuranceTariff/GetWardInsuranceTariffs',
                data: inputData,
                type: 'post',
                onComplete: $scope.getWardInsuranceTariffCallback
            };

            utl.Http.doAction(options);
        }
        $scope.guarantorTypeChange = function (ischanged) {
            if (ischanged) {
                $scope.item.GuarantorId = -1;
                $scope.item.TpaId = -1;
            }
            if ($scope.item.GuarantorTypeId && $scope.currentcontext.wardId) {
                $scope.getWardInsuranceTariffs();
            }
        };

        $scope.GetGuarantorCallback = function (scope, data, options, hasError) {
            $scope.lookup["Guarantor"] = data["Guarantor"];
            var ischanged = options.data[0].Request.Data;
            $scope.guarantorTypeChange(ischanged);
        };

        $scope.GetGuarantor = function (ischanged) {
            var inputData = [{
                "Key": "Guarantor",
                Request: {
                    Data: ischanged,
                    Params: [{
                            Key: 2,
                            Value: $scope.item.GuarantorTypeId
                        },
                        {
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },
                        {
                            Key: 5,
                            Value: 2
                        }
                    ]
                }
            }];

            $scope.initLookupCall(inputData, $scope.GetGuarantorCallback);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getinfo();
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
            var inputData = [{
                    "Key": "GuarantorType"
                },
                {
                    "Key": "Tpa"
                },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                {
                    "Key": "ActiveStatus"
                },
                {
                    "Key": "DiscountMode"
                }
            ];

            $scope.initLookupCall(inputData, $scope.lookupCallback);
        };

        $scope.initLookup();

        // ---------------------------------------------------------------
        // REACT BRIDGE WIRING (migrated to
        // EncounterGuarantorUpdateFormScreen.tsx). All API calls/business
        // logic above are untouched.
        // ---------------------------------------------------------------
        $scope.reactProps = {
            item: $scope.item,
            lookup: $scope.lookup,
            currentcontext: $scope.currentcontext
        };

        var origLookupCallback = $scope.lookupCallback;
        $scope.lookupCallback = function (scope, data, options, hasError) {
            origLookupCallback(scope, data, options, hasError);
            $scope.reactProps.lookup = $scope.lookup;
        };

        var origGetinfoCallback = $scope.getinfoCallback;
        $scope.getinfoCallback = function (scope, data, options, hasError) {
            origGetinfoCallback(scope, data, options, hasError);
            $scope.reactProps.item = $scope.item;
        };

        var origGetGuarantorCallback = $scope.GetGuarantorCallback;
        $scope.GetGuarantorCallback = function (scope, data, options, hasError) {
            origGetGuarantorCallback(scope, data, options, hasError);
            $scope.reactProps.lookup = $scope.lookup;
            $scope.reactProps.item = $scope.item;
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'itemFieldChange':
                    $scope.item[payload.field] = payload.value;
                    break;
                case 'guarantorTypeIdChange':
                    // Mirrors the original ui-select's ng-model bind
                    // (item.GuarantorTypeId) landing before its
                    // ng-change="GetGuarantor(true)" fires.
                    $scope.item.GuarantorTypeId = payload.value;
                    $scope.GetGuarantor(true);
                    $scope.reactProps.item = $scope.item;
                    break;
                case 'guarantorSelect': {
                    // The original ui-select's on-select handed
                    // guarantorChange() the whole lookup record directly;
                    // reconstruct it here from lookup.Guarantor by Id since
                    // the React <Select> only reports the chosen id.
                    var match = null;
                    var guarantorOptions = ($scope.lookup && $scope.lookup.Guarantor) || [];
                    for (var i = 0; i < guarantorOptions.length; i++) {
                        if (guarantorOptions[i].Id === payload.value) {
                            match = guarantorOptions[i];
                            break;
                        }
                    }
                    if (match) {
                        $scope.guarantorChange(match);
                        $scope.reactProps.item = $scope.item;
                    }
                    break;
                }
                case 'effectiveFromChange':
                    $scope.item.EffectiveFrom = payload.value ? new Date(payload.value) : null;
                    break;
                case 'effectiveToChange':
                    $scope.item.EffectiveTo = payload.value ? new Date(payload.value) : null;
                    break;
                case 'glDateChange':
                    $scope.item.GuarantorLetterDate = payload.value ? new Date(payload.value) : null;
                    break;
                case 'saveItem':
                    $scope.saveItem();
                    break;
                default:
                    break;
            }
            $scope.$applyAsync();
        };
    }

    GuarantorUpdateFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();