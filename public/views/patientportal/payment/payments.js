(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('paymentsController', paymentsController);

function paymentsController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    $scope.currentfilter= {
    };

    $scope.currentcontext =  {
        paneltype : 'panel-info'
    };
    
    utl.Session.set('dashboard-panel-type', $scope.currentcontext.paneltype);

    $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());
    $scope.dashboardinfo = {};

    $scope.getListCallback = function (scope, res, options, hasError) {
        vm.gridConfig.data = res.Data;
        vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
    };
    $scope.home = function () {
        $state.go('patientportal.portaldashboard');
    }
    
    $scope.getList = function () {
        
        var inputData = {
            Params : [
                {Key: 15, Value: $scope.currentcontext.pid }
            ],
            PageContext:{
                PageSize : vm.gridConfig.pagerObj.pageSize,
                PageNumber : vm.gridConfig.pagerObj.currentPage
            }
        };
                
            var options = {
                action : 'payment/payment/Getpayments',
                data : inputData,
                type : 'post',
                onComplete : $scope.getListCallback
             };
             utl.Http.doAction(options);    
    };
    
    vm.gridConfig = {
        columnDefs: [
                        { field: "ReceiptType", displayName: $translate.instant('patientportal.payment.receipttype.lbl') },
                        { field: "Date", displayName: $translate.instant('patientportal.payment.date.lbl') },
                        { field: "ReceiptNo", displayName: $translate.instant('patientportal.payment.receiptno.lbl') },
                        { field: "InsuranceName", displayName: $translate.instant('patientportal.payment.insurancename.lbl') },
                        { field: "ReceiptAmount", displayName: $translate.instant('patientportal.payment.receiptamount.lbl') },
                        { field: "PayType", displayName: $translate.instant('patientportal.payment.paytype.lbl') },
                        { field: "AdjustedAmount", displayName: $translate.instant('patientportal.payment.adjustedamount.lbl') },
                        { field: "unadjustedAmount", displayName: $translate.instant('patientportal.payment.unadjustedamount.lbl') },
                        { field: "Billview", displayName: $translate.instant('patientportal.payment.billview.lbl') },
                        { field: "Status", displayName: $translate.instant('patientportal.payment.status.lbl') }
                     ],
                     pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
    };
    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        $scope.getList();
    }

    // function getSectionPath() {
    //     return "app/views/patientportal/clinicalresults/sections/";
    // }

    // $scope.sections = [
    // ];
}

paymentsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();