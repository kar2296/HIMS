(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('LinenDashboardController', LinenDashboardController);

    function LinenDashboardController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.items = [];
        $scope.currentfilter = {}
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FromDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00'),
            ToDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59'),
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId())
        }
        $scope.Items = [];
        $scope.Items.StockEntryCount = '0';
        $scope.Items.IssueBookCount = '0';
        $scope.Items.ReceiptCount = '0';
        $scope.Items.StatusCount = '0';

        $scope.currentcontext.CanSurgeryRequest = utl.Privilege.hasPrivilege('CanSurgeryRequest');


        $scope.getLinenDashboardCountCallBack = function (scope, res, options, hasError) {
            $scope.Items.StockEntryCount = res.stockentrybo.StockEntryCount;
            $scope.Items.IssueBookCount = res.issuebookbo.IssueBookCount;
            $scope.Items.ReceiptCount = res.receiptbo.ReceiptCount;
            $scope.Items.StatusCount = res.stockstatusbo.StatusCount;

            if (!$scope.Items.StockEntryCount)
                $scope.Items.StockEntryCount = '0';
            if (!$scope.Items.IssueBookCount)
                $scope.Items.IssueBookCount = '0';
            if (!$scope.Items.ReceiptCount)
                $scope.Items.ReceiptCount = '0';
            if (!$scope.Items.StatusCount)
                $scope.Items.StatusCount = '0';

        };
        $scope.getLinenCount = function () {
            var inputData = {
                Data: {
                    Keys: [
                        { Key: 'stockentrybo' },
                        { Key: 'issuebookbo' },
                        { Key: 'receiptbo' },
                        { Key: 'stockstatusbo' },

                    ]
                },
                Attributes: $scope.currentcontext
            };

            var options = {
                action: 'LinenAndLaundry/LinenDashboard/GetLinenDashboardOptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getLinenDashboardCountCallBack
            };
            utl.Http.doAction(options);
        };

               $scope.linenstockentry = function () {
            $state.go('app.linenstockentryform');
        }
        $scope.dhobiissuebook = function () {
            $state.go('app.dhobiissuebookform');
        }
        $scope.dhobireceipt = function () {
            $state.go('app.dhobireceipt');
        }
        $scope.linenstockstatus = function () {
            $state.go('app.linenstockstatus');
        }

        $scope.getLinenCount();
    }
    LinenDashboardController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();