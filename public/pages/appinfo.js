(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('appInfoController', appInfoController);

function appInfoController($scope, $stateParams, $state, utl, $uibModalInstance, modalConfig) {
    var vm = this;
    
    $scope.Items = [];
    
    $scope.currentcontext =  {
        ismodal : modalConfig && modalConfig.params ? true : false
    };

    if (modalConfig && modalConfig.params) {
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;
    } 
    
    $scope.backToList = function () {
        if($scope.currentcontext.ismodal) {
            $scope.cancelCallback();
        } 
    }

    //get list
    $scope.getListCallback = function (scope, res, options, hasError) {
        vm.gridConfig.data = res.Data;
        vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
    };

    $scope.getList = function () {

        var inputData = { 
            Params :[
             /* { Key: 1, Value: $scope.currentfilter.name ? $scope.currentfilter.name : "" } */
            ],
            PageContext:{
                PageSize: vm.gridConfig.pagerObj.pageSize,
                PageNumber: vm.gridConfig.pagerObj.currentPage
            }
        };

        var options = {
            action: 'SystemSettings/AppInfo/GetAppInfos',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };
    
    vm.gridConfig = {
        columnDefs: [
                        { field: "Name", displayName: "Name" },
                        { field: "Version", displayName: "Version" },
                        { field: "UpdatedDate", displayName: "Updated Date",
                            cellTemplate : "<ngformatdate datetime-val='row.entity.UpdatedDate'></ngformatdate>" }
                    ],
        pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
    };
        
    $scope.getList();
}

appInfoController.$inject = ['$scope', '$stateParams', '$state', 'utl', '$uibModalInstance', 'modalConfig'];

})();