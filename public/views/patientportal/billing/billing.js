(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('billingController', billingController);

function billingController($scope, $stateParams, $state, $translate, utl) {
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
                action : 'billing/Billing/GetBillings',
                data : inputData,
                type : 'post',
                onComplete : $scope.getListCallback
             };
             utl.Http.doAction(options);    
    };
    
    vm.gridConfig = {
        columnDefs: [
                        { field: "Type.Description", displayName: $translate.instant('patientportal.billing.type.lbl') },
                        { field: "Date", displayName: $translate.instant('patientportal.billing.date.lbl') },
                        { field: "InsuranceType", displayName: $translate.instant('patientportal.billing.insurancetype.lbl') },
                        { field: "insuranceName", displayName: $translate.instant('patientportal.billing.insurancename.lbl') },
                        { field: "BillAmount", displayName: $translate.instant('patientportal.billing.billamount.lbl') },
                        { field: "discount", displayName: $translate.instant('patientportal.billing.discount.lbl') },
                        { field: "NetAmount", displayName: $translate.instant('patientportal.billing.netamount.lbl') },
                        { field: "Paid", displayName: $translate.instant('patientportal.billing.paid.lbl') },
                        { field: "Outstanding", displayName: $translate.instant('patientportal.billing.outstanding.lbl') },
                        { field: "billview", displayName: $translate.instant('patientportal.billing.billview.lbl') }
                     ],
                     pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
    };
    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        $scope.getList();
    }
    // function getSectionPath() {
    //        return "app/views/patientportal/billing/sections/";
    // }

    // $scope.sections = [
    // ];
}

billingController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();