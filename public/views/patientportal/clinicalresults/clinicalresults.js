(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('clinicalresultsController', clinicalresultsController);

function clinicalresultsController($scope, $stateParams, $state, $translate, utl) {
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
                action : 'clinicalresult/clinicalresult/Getclinicalresults',
                data : inputData,
                type : 'post',
                onComplete : $scope.getListCallback
             };
             utl.Http.doAction(options);    
    };
    
    vm.gridConfig = {
        columnDefs: [
                        { field: "Type", displayName: $translate.instant('patientportal.clinicalresult.type.lbl') },
                        { field: "Date", displayName: $translate.instant('patientportal.clinicalresult.ordereddate.lbl') },
                        { field: "InsuranceType", displayName: $translate.instant('patientportal.clinicalresult.order.lbl') },
                        { field: "insuranceName", displayName: $translate.instant('patientportal.clinicalresult.department.lbl') },
                        { field: "BillAmount", displayName: $translate.instant('patientportal.clinicalresult.tests.lbl') },
                        { field: "discount", displayName: $translate.instant('patientportal.clinicalresult.orderingdoctor.lbl') },
                        { field: "NetAmount", displayName: $translate.instant('patientportal.clinicalresult.completeddate.lbl') },
                        { field: "Paid", displayName: $translate.instant('patientportal.clinicalresult.iproom.lbl') },
                        { field: "Outstanding", displayName: $translate.instant('patientportal.clinicalresult.resultstatus.lbl') }
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

clinicalresultsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();