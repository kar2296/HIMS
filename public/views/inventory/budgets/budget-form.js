(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('budgetformController', budgetformController);

    function budgetformController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.currentfilter = {
        };
        $scope.item = {
            DateFrom: utl.Formatter.getCurrentDate(),
            CategoryId: -1,
            DepartmentId: -1
        };
        $scope.item.FacilityId = utl.Session.getCurrentFacilityId();

        $scope.Items = [];
        $scope.lookup = {};
        // $scope.currentcontext = {};
        $scope.budgetdetails = [];

        $scope.currentcontext = {
            id: !isNaN(parseInt($stateParams.id)) ? parseInt($stateParams.id) : 0,
        };
        // $scope.getProductTypesCallback = function (scope, res, options, hasError) {
        //     $scope.budgetdetails = res.Data;
        // };

        $scope.getProductTypesCallback = function (scope, res, options, hasError) {
            var details = [];
            if (res.Data.length > 0) {
                res.Data.forEach((v, i) => {
                    var item = {
                        ProductTypeId: v.Id,
                        CategoryId: v.CategoryId,
                        ProductTypeName: v.ProductTypeName,
                        BudgetCost: v.BudgetCost,
                        ConsumedCost: v.ConsumedCost,
                        PendingCost: v.PendingCost,
                        Status: 1,
                    };
                    details.push(item);
                });
                $scope.budgetdetails = details;
            }
            //  vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $scope.getProductTypes = function () {
            var inputData = {
                Params: [
                    { Key: 5, Value: $scope.item.CategoryId },
                    { Key: 6, Value: $scope.item.SubCategoryId }
                ],
                PageContext: {
                    PageSize: 250,
                    PageNumber: 1
                }
            };
            if ($scope.currentcontext.id || $scope.currentcontext.id <= 0) {

                var options = {
                    action: 'pharmacy/producttype/GetProductTypes',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getProductTypesCallback
                };

                utl.Http.doAction(options);
            }
            else {
                utl.Alert.showErrorMsg($translate.instant('inventory.budget-form.selectdoctor.lbl'));
            }
        };
        $scope.getDetailsCallback = function (scope, res, options, hasError) {
            $scope.budgetdetails = res.Data;

        };
        $scope.getDetails = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.currentcontext.id }
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'pharmacy/BudgetDetail/GetBudgetDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };
        // $scope.getItemCallback = function (scope, res, options, hasError) {
        //     $scope.item = res.Data;

        // };

        // $scope.getItem = function (pageNo) {
        //     if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
        //         var options = {
        //             action: 'pharmacy/Budget/GetBudgetById',
        //             data: { Id: $scope.currentcontext.id },
        //             type: 'post',
        //             onComplete: $scope.getItemCallback
        //         };
        //         utl.Http.doAction(options);
        //     }
        // };
        $scope.getItemCallBack = function (scope, res, options, hasError) {
            // $scope
            if (res.Data.length > 0) {

                var details = [];
                data.DoctorPaymentDetails.forEach((v, i) => {
                    var item = {
                        Id: v.Id,
                        ProductTypeId: v.ProductTypeId,
                        CategoryId: v.CategoryId,
                        ProductTypeName: v.ProductTypeName,
                        BudgetCost: v.InvoiceAmount,
                        ConsumedCost: v.ConsumedCost,
                        PendingCost: v.PendingCost,
                        Status: 1,
                    };
                    details.push(item);
                });
                $scope.budgetdetails = details;

            }
            //    $scope.DoctorInvoiceList = res.Data.
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputParams = {
                    Params: [
                        { Key: 0, Value: $scope.currentcontext.id }
                    ],
                    PageContext: {
                        PageSize: 1,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'pharmacy/Budget/GetBudgets',
                    data: inputParams,
                    type: 'post',
                    onComplete: $scope.getItemCallBack
                };
                utl.Http.doAction(options);
            }
        };
        $scope.SaveandApprove = function () {
            $scope.item.ActiveStatusId = 2;
            $scope.saveItem();
        };
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            // $scope.backToList();
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.Details = [];

            $scope.budgetdetails.forEach((v, i) => {
                var item = {
                    ProductTypeId: v.ProductTypeId,
                    CategoryId: v.CategoryId,
                    ProductTypeName: v.ProductTypeName,
                    BudgetCost: v.BudgetCost,
                    ConsumedCost: v.ConsumedCost,
                    PendingCost: v.PendingCost,
                    Id: v.Id ? v.Id : 0,
                    Status: v.Status
                };
                $scope.item.Details.push(item)
            })
            // $scope.budgetdetails.forEach((v, i) => {
            //     var item = {
            //         ProductTypeId: v.Id,
            //         CategoryId: v.CategoryId,
            //         ProductTypeName: v.ProductTypeName,
            //     };
            //     $scope.item.Details.push(item)
            // })
            //Check Mandatory values
            var actionName = 'pharmacy/Budget/AddBudget';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var actionName = 'pharmacy/Budget/UpdateBudget';
                $scope.item.Id = $scope.currentcontext.id
            }

            // var inputData = { Header: $scope.item, Details: $scope.budgetdetails };

            // var inputData = {
            //     Data: $scope.item,
            // };
            // inputData.Data.Details = $scope.budgetdetails;
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                // data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);

        };

        $scope.numberonly = function (e) {
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right, down, up
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                // let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress
            //&& (e.keyCode < 96 || e.keyCode > 105)
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))) {
                e.preventDefault();
            }
        };
        $scope.backToList = function () {
            $state.go('app.budgets', { id: 0 });
        };

        function loadData() {
            $scope.getItem();
            $scope.getDetails();
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });

            //loadData();
        };

        $scope.lookupCallbackOnSelect = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ItemCategory" },
                { "Key": "Department" },
                { "Key": "Facility" },
                { "Key": "Remarks" },

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
        };

        $scope.getSubCategory = function () {
            $scope.item.SubCategoryId = -1;
            var inputData = [{
                "Key": "ItemSubCategory",
                Request: {
                    Params:
                        [{
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 4,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },
                        { Key: 5, Value: $scope.item.CategoryId || -1 },
                        ]
                }
            }];
            $scope.getLookUpOnSelect(inputData);
        };

        $scope.getLookUpOnSelect = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallbackOnSelect
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    budgetformController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();