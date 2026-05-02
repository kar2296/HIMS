(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('outboundListController', outboundListController);

    function outboundListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.item = {
             ARCollectionId: 1,
             FacilityId: utl.Session.getCurrentFacilityId(), 
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $scope.getList = function () {

            var inputData = {
                Params: [
                             ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'AssetManagement/ServiceRequest/GetServiceRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.cancelItem = function () {
            $scope.item.ServiceRequestStatusId = 5;
            var options = {
                action: 'AssetManagement/ServiceRequest/UpdateServiceRequest',
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.getList
            };

            utl.Http.doAction(options);
        }
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.cancelItem()
        };
        $scope.getItem = function (pageNo) {

            var options = {
                action: 'AssetManagement/ServiceRequest/GetServiceRequestById',
                data: { Id: $scope.CancelId },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);

        };
        $scope.onCancelConfirmed = function (cancelId) {
            $scope.CancelId = cancelId;
            $scope.getItem();
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "date", displayName: $translate.instant('appmanager.erptab.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.date | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.date | date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "refnum", displayName: $translate.instant('appmanager.erptab.refnum.lbl') },
                { field: "patientdetails", displayName: $translate.instant('appmanager.erptab.patientdetails.lbl') },

                { field: "amount", displayName: $translate.instant('appmanager.erptab.amount.lbl') },

            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }

        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [              
                { "Key": "ERPMasters", Default: false },
                { "Key": "AccountPayable", Default: false },
                { "Key": "Inventory", Default: false },
                { "Key": "ARCollection", Default: false },
                { "Key": "Revenue", Default: false },
                { "Key": "Facility", },
    
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

    outboundListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();