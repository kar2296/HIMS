(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('guarantoragreementFormController', guarantoragreementFormController);

    function guarantoragreementFormController($scope, $stateParams, $state, $translate, utl, $filter, uibButtonConfig) {
        var vm = this;
        $scope.currentcontext = {};
        $scope.currentcontext.guarantorid = parseInt($stateParams.gid);
        $scope.currentcontext.id = -1;

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            ActiveFrom: utl.Formatter.getCurrentDate(),
            ActiveTo: utl.Formatter.getCurrentDate(),
            OPDiscount: 0,
            OPDiscountRate: 0,
            IPDiscount: 0,
            IPDiscountRate: 0,
        };

        $scope.Item = [];
        $scope.Details = [];

        $scope.getServiceCategorysCallback = function (scope, res, options, hasError) {
            var item = [];           
            if (res.Data.length > 0) {
                res.Data.forEach((v, i) => {
                    var item = {
                        ServiceCategoryId: v.Id,
                        ServiceCategoryCode: v.ServiceCategoryCode,
                        ServiceCategoryName: v.ServiceCategoryName,
                        Description: v.Description,
                        ServiceGroupId: v.ServiceGroupId,
                        OrganizationId: v.OrganizationId,
                        FacilityId: v.FacilityId,
                        StatusId: v.StatusId,
                        Status: 1,
                    };
                    $scope.Details.push(item);
                });
            }
        };

        $scope.getServiceCategorys = function () {
            var inputData = {
                Params: [
                    { Key: 8, Value: [-1, utl.Session.getCurrentFacilityId()] },
                    { Key: 5, Value: 1 }
                ],
                PageContext: { PageSize: 250, PageNumber: 1 }
            };

            var options = {
                action: 'clinicalmaster/servicecategory/GetServiceCategorys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getServiceCategorysCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.Details = [];
            if (res.Data.length > 0) {
                $scope.item.ActiveFrom = res.Data[0].ActiveFrom;
                $scope.item.ActiveTo = res.Data[0].ActiveTo;
                res.Data.forEach((v, i) => {
                    var item = {
                        Id: v.Id,
                        FacilityId: v.FacilityId,
                        GuarantorId: v.GuarantorId,
                        ServiceCategoryId: v.ServiceCategoryId,
                        ServiceCategoryName: v.ServiceCategoryName,
                        OPDiscount: v.OPDiscount,
                        OPDiscountRate: v.OPDiscountRate,
                        IPDiscount: v.IPDiscount,
                        IPDiscountRate: v.IPDiscountRate,
                        ActiveFrom: v.ActiveFrom,
                        ActiveTo: v.ActiveTo,
                        ActiveStatusId: v.ActiveStatusId,
                        IsActive: v.IsActive,
                        Status: v.Status
                    };
                    $scope.currentcontext.id = item.GuarantorId;
                    $scope.Details.push(item);
                });
            } else {
                $scope.getServiceCategorys();
            }
        };

        $scope.getList = function () {
            var inputData = {
                Params: [{ Key: 1, Value: $scope.currentcontext.guarantorid }],
            };

            var options = {
                action: 'generalmaster/GuarantorAgreement/GetGuarantorAgreements',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.backToList = function () {
            $state.go('app.guarantortab.general');
        };

        $scope.numberonly = function (e) {
            if ($.inArray(e.keyCode, [8, 9, 27, 13]) !== -1 ||
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                return;
            }
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))) {
                e.preventDefault();
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        $scope.save = function () {
            $scope.saveItem();
        };

        $scope.saveAndApprove = function () {
            $scope.saveItem();
        };

        $scope.saveItem = function () {
            var lines = getlinesforsave();

            var actionName = 'generalmaster/GuarantorAgreement/AddGuarantorAgreement';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'generalmaster/GuarantorAgreement/UpdateGuarantorAgreement';
            }

            var options = {
                action: actionName,
                data: { Data: lines },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        function getlinesforsave() {
            var result = [];
            for (var idx in $scope.Details) {
                var item = $scope.Details[idx];
                var categorydetails = {};
                if (item.ServiceCategoryId > 0) {
                    if ($scope.Details[idx].Id > 0) {
                        categorydetails = {
                            Id: $scope.Details[idx].Id,
                            ServiceCategoryId: $scope.Details[idx].ServiceCategoryId,
                            ServiceCategoryName: $scope.Details[idx].ServiceCategoryName,
                            OPDiscount: $scope.Details[idx].OPDiscount,
                            OPDiscountRate: $scope.Details[idx].OPDiscountRate,
                            IPDiscount: $scope.Details[idx].IPDiscount,
                            IPDiscountRate: $scope.Details[idx].IPDiscountRate,
                            GuarantorId: $scope.currentcontext.guarantorid,
                            FacilityId: utl.Session.getCurrentFacilityId(),
                            ActiveFrom: $scope.item.ActiveFrom,
                            ActiveTo: $scope.item.ActiveTo,
                            Status: 1
                        }
                    } else {
                        categorydetails = {
                            ServiceCategoryId: $scope.Details[idx].ServiceCategoryId,
                            ServiceCategoryName: $scope.Details[idx].ServiceCategoryName,
                            OPDiscount: $scope.Details[idx].OPDiscount,
                            OPDiscountRate: $scope.Details[idx].OPDiscountRate,
                            IPDiscount: $scope.Details[idx].IPDiscount,
                            IPDiscountRate: $scope.Details[idx].IPDiscountRate,
                            GuarantorId: $scope.currentcontext.guarantorid,
                            FacilityId: utl.Session.getCurrentFacilityId(),
                            ActiveFrom: $scope.item.ActiveFrom,
                            ActiveTo: $scope.item.ActiveTo,
                            Status: 1
                        }
                    }
                    result.push(categorydetails);
                }
            }
            return result;
        }

        $scope.clear = function () {
            $scope.Details = [];
            $scope.item = {};
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility",
                Request: {
                    Params: [{
                        Key: 4,
                        Value: true
                    }]
                }
            }];

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

    guarantoragreementFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();