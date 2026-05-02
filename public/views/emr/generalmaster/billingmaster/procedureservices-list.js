(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('procedureservicesListController', procedureservicesListController);

function procedureservicesListController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;

    $scope.Items = [];
    $scope.currentfilter= {
        ProcedureCodeSchemeId : -1,
        Code : "",
        ProcedureName : "",
        ProcedureTypeId : -1,
        ActiveStatusId : 2
    };


    $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

    $scope.getList = function () {

        var inputData = {
            Params :[
                { Key: 1, Value: $scope.currentfilter.ProcedureName },
                { Key: 2, Value: $scope.currentfilter.ProcedureCodeSchemeId },
                { Key: 3, Value: $scope.currentfilter.Code },
                { Key: 4, Value: $scope.currentfilter.ProcedureTypeId },
                { Key: 5, Value: $scope.currentfilter.ActiveStatusId }
            ],
            PageContext:{
            PageSize: vm.gridConfig.pagerObj.pageSize,
            PageNumber: vm.gridConfig.pagerObj.currentPage
        }
        };

        var options = {
            action: 'clinicalmaster/procedure/GetProcedures',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    //Grid Actions
    $scope.addNew = function() {
        $state.go('app.procedureservices-form', { id:0 });
    }


     $scope.handleEvents = function(actionType, row) {

        if(actionType == 'edit') {
            $state.go('app.procedureservices-form', { id:row.entity.Id,IsProfile: row.entity.IsProfile, ProcedureName: row.entity.ProcedureName });
        }}


    vm.gridConfig = {
        enableColumnResizing: true,
        columnDefs: [
                        { field: "Code", displayName: $translate.instant('billingmaster.procedureservice-list.procedurecode.lbl') },
                        { field: "ProcedureName", displayName: $translate.instant('billingmaster.procedureservice-list.procedurename.lbl') },
                        { field: "Department.SpecialityName", displayName: $translate.instant('billingmaster.procedureservice-list.department.lbl') },
                        { field: "ProcedureCategory.Description", displayName: $translate.instant('billingmaster.procedureservice-list.surgerytype.lbl') },
                        { field: "ActiveStatus.Description", displayName: $translate.instant('billingmaster.procedureservice-list.status.lbl') },
                        { field : "Id", displayName : $translate.instant('common.actions_col.lbl'),
                                cellTemplate : 'actionTemplate.html',
                                actions : [
                                            {actiontype: 'edit', display : 'common.editaction.lbl'}
                                         ]
                        }
                    ],
                    pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
    };

    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        $scope.getList();
    }

    $scope.initLookup = function () {
        var inputData = [
                            { "Key": "ProcedureCodeScheme" },
                            { "Key": "ProcedureCategory" },
                            { "Key": "ActiveStatus" },
                            { "Key": "Department" }
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

procedureservicesListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();