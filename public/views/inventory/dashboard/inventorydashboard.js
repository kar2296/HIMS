(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('inventorydashboardController', inventorydashboardController);

    function inventorydashboardController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.item = {
            IsActive: true,
            isDisabled: false
        };
        $scope.Items = {};
        $scope.Items.purchaseorderCount = '0';
        $scope.Items.grnCount = '0';
        $scope.Items.prCount = '0';
        $scope.Items.stockrequestCount = '0';
        $scope.Items.FollowupCount = '0';
        $scope.Items.stockacceptCount = '0';
        $scope.Items.purchasereturnCount = '0';
        $scope.item.FacilityId = utl.Session.getCurrentFacilityId();

        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.getGRNList();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'pharmacy/inventorydashboard/GetinventorydashboardById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.inventorydashboard');
        }
        $scope.addNew = function () {
            $state.go('app.inventorydashboard', { id: 0 });
        }


        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.save = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        }

        $scope.saveandApprove = function () {

            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            }
            else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        }
        $scope.clear = function () {
            $scope.item = {};
        }
        $scope.saveItem = function () {

            // if(!$scope.item_form.isValid()) {
            //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            //    return;
            // }
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'pharmacy/inventorydashboard/Addinventorydashboard';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'pharmacy/inventorydashboard/Updateinventorydashboard';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getGRNListCallBack = function (scope, res, options, hasError) {
            $scope.grndetails = res.Data;
        }
        $scope.getGRNList = function () {
            var FromDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [
                    { Key: 8, Value: FromDate },
                    { Key: 9, Value: ToDate },
                ],
                PageContext: {
                    PageSize: 3,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/grn/GetGrns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getGRNListCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getpoListCallBack = function (scope, res, options, hasError) {
            $scope.podetails = res.Data;
        }
        $scope.getpoList = function () {
            var FromDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [
                    { Key: 8, Value: FromDate },
                    { Key: 9, Value: ToDate },
                ],
                PageContext: {
                    PageSize: 3,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/purchaseorder/GetPurchaseOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getpoListCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getpurchaserequestListCallBack = function (scope, res, options, hasError) {
            $scope.purchaserequestdetails = res.Data;
        }
        $scope.getpurchaserequestList = function () {
            var FromDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [
                    { Key: 9, Value: FromDate },
                    { Key: 10, Value: ToDate },
                ],
                PageContext: {
                    PageSize: 3,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/purchaserequest/GetPurchaseRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getpurchaserequestListCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getpurchasereturnListCallBack = function (scope, res, options, hasError) {
            $scope.purchasereturndetails = res.Data;
        }
        $scope.getpurchasereturnList = function () {
            var FromDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [
                    { Key: 9, Value: FromDate },
                    { Key: 10, Value: ToDate },
                ],
                PageContext: {
                    PageSize: 3,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/PurchaseReturn/GetPurchaseReturns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getpurchasereturnListCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getInventoryDashboardCountCallBack = function (scope, res, options, hasError) {
            $scope.Items.purchaseorderCount = res.purchaseorderbo.purchaseorderCount;
            $scope.Items.grnCount = res.grnbo.grnCount;
            $scope.Items.prCount = res.purchaserequestbo.prCount;
            $scope.Items.FollowupCount = res.stockrequestbo.FollowupCount;
            $scope.Items.stockrequestCount = res.stockrequestbo.stockrequestCount;
            $scope.Items.stockacceptCount = res.stocktransferbo.stockacceptCount;
            $scope.Items.purchasereturnCount = res.purchasereturnbo.purchasereturnCount;
            if (!$scope.Items.purchaseorderCount)
                $scope.Items.purchaseorderCount = '0';
            if (!$scope.Items.grnCount)
                $scope.Items.grnCount = '0';
            if (!$scope.Items.prCount)
                $scope.Items.prCount = '0';
            if (!$scope.Items.stockrequestCount)
                $scope.Items.stockrequestCount = '0';
            if (!$scope.Items.FollowupCount)
                $scope.Items.FollowupCount = '0';
            if (!$scope.Items.stockacceptCount)
                $scope.Items.stockacceptCount = '0';
            if (!$scope.Items.purchasereturnCount)
                $scope.Items.purchasereturnCount = '0';
        };
        $scope.getCount = function () {
            var inputData = {
                Data: {
                    Keys: [
                        { Key: 'purchaseorderbo' },
                        { Key: 'grnbo' },
                        { Key: 'purchaserequestbo' },
                        { Key: 'stockrequestbo' },
                        { Key: 'stocktransferbo' },
                        { Key: 'purchasereturnbo' },

                    ]
                },
                Attributes: $scope.currentcontext
            };

            var options = {
                action: 'pharmacy/InventoryDashboard/GetInventoryDashboardOptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getInventoryDashboardCountCallBack
            };
            utl.Http.doAction(options);
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
            $scope.getGRNList();
            $scope.getpoList();
            $scope.getpurchasereturnList();
            $scope.getpurchaserequestList();
            $scope.getCount();
        }

        $scope.initLookup = function () {
            var inputData = [
                // { "Key": "Organization" },
                // { "Key": "Facility" }

            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            $scope.$doAction(options);
        }

        $scope.initLookup();
    }

    inventorydashboardController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();