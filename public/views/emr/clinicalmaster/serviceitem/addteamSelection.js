(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('addteamSelectionController', addteamSelectionController);

    function addteamSelectionController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};
        $scope.DoctorsList = [];
        $scope.AllRateTypeList = [];
        $scope.PerfDrList = [];
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.serviceId = parseInt(modalConfig.params.serviceId);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getTeamDrsCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.DoctorsList = res.Data;
            } else {
                utl.Alert.showErrorMsg($translate.instant('Doctors not assigned under this Team'));
            }
        };

        $scope.getTeamDrs = function (item) {
            var inputData = {
                Params: [{
                    Key: 28,
                    Value: item.TeamId
                }]
            };

            var options = {
                action: 'SystemSettings/user/GetUsers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getTeamDrsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getRateDetailsCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.item.Rate = res.Data[0].Rate;
                if ($scope.item.ForAllRateTypes) {
                    var rateList = {
                        rateTypeId: -1,
                        rate: 0
                    }
                    rateList.rateTypeId = res.Data[0].ServiceRateCategoryId;
                    rateList.rate = res.Data[0].Rate;
                    $scope.AllRateTypeList.push(rateList);
                }
            } else {
                utl.Alert.showErrorMsg($translate.instant('Rate not assigned under this Type'));
            }
        };

        $scope.getRateDetails = function (item) {
            var rateId = -1;
            if ($scope.item.ForAllRateTypes) {
                rateId = item.Id;
            } else {
                rateId = item.ServiceRateCategoryId
            }
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.serviceId
                    },
                    {
                        Key: 3,
                        Value: rateId
                    }
                ],
            };
            var options = {
                action: 'clinicalmaster/serviceitemtariffdetail/GetServiceItemTariffDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getRateDetailsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.selectrateTypes = function () {
            for (var sdx in $scope.lookup.ServiceRateCategory) {
                var rateType = $scope.lookup.ServiceRateCategory[sdx];
                if (rateType.Id > 0) {
                    $scope.getRateDetails(rateType);
                }
            }
        }

        $scope.save = function () {
            if ($scope.item.ForAllRateTypes) {
                if ($scope.AllRateTypeList.length > 0) {
                    for (var adx in $scope.AllRateTypeList) {
                        var rateMap = $scope.AllRateTypeList[adx];
                        if ($scope.DoctorsList.length > 0) {
                            for (var dx in $scope.DoctorsList) {
                                var docData = $scope.DoctorsList[dx];
                                var docname = '';
                                if (docData.Title) {
                                    if (docData.Title.Description) {
                                        docname = docData.Title.Description
                                    }
                                    if (docData.FirstName) {
                                        docname += ' ' + docData.FirstName
                                    }
                                    if (docData.LastName) {
                                        docname += ' ' + docData.LastName
                                    }
                                }
                                var performData = {
                                    ServiceRateCategoryId: rateMap.rateTypeId,
                                    Rate: rateMap.rate,
                                    DoctorId: docData.Id,
                                    DoctorName: docname,
                                    ShareTypeId: $scope.item.ShareTypeId,
                                    DoctorShareValue: $scope.item.DoctorShareValue,
                                    VisitTypeId: 1,
                                    TeamId: $scope.item.TeamId
                                }
                                $scope.PerfDrList.push(performData);
                            }
                        }
                    }
                }
            } else {
                if ($scope.DoctorsList.length > 0) {
                    for (var dx in $scope.DoctorsList) {
                        var docData = $scope.DoctorsList[dx];
                        var docname = '';
                        if (docData.Title) {
                            if (docData.Title.Description) {
                                docname = docData.Title.Description
                            }
                            if (docData.FirstName) {
                                docname += ' ' + docData.FirstName
                            }
                            if (docData.LastName) {
                                docname += ' ' + docData.LastName
                            }
                        }
                        var performData = {
                            ServiceRateCategoryId: $scope.item.ServiceRateCategoryId,
                            Rate: $scope.item.Rate,
                            DoctorId: docData.Id,
                            DoctorName: docname,
                            ShareTypeId: $scope.item.ShareTypeId,
                            DoctorShareValue: $scope.item.DoctorShareValue,
                            VisitTypeId: 1,
                            TeamId: $scope.item.TeamId
                        }
                        $scope.PerfDrList.push(performData);
                    }
                }
            }
            $scope.confirmCallback($scope.PerfDrList);
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Team"
                },
                {
                    "Key": "DiscountMode"
                },
                {
                    "Key": "ServiceRateCategory",
                    Request: {
                        Params: [{
                            Key: 5,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
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

    addteamSelectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();