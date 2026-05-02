(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('labordersController', labordersController);

    function labordersController($scope,$stateParams, $filter, $state, $translate, utl) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {};
        $scope.currentfilter = {               
            showFilterTab: false,
            FromDate: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            ToDate: utl.Formatter.getCurrentDate()
        }

        $scope.currentcontext.PatientId = parseInt(utl.Session.getPatientPortalPatientId());

        $scope.toggleCanShowDetails = function(clickedItem) {
            for (var idx in $scope.items) {
                var item = $scope.items[idx];
                if (item.Id == clickedItem.Id) {
                    item.CanShowDetails = !item.CanShowDetails;
                } else {
                    item.CanShowDetails = false;
                }
            }
        };

         $scope.openFilterTab = function() {
        if ($scope.currentfilter.showFilterTab === true) {
            $scope.currentfilter.showFilterTab = false;
        } else {
            $scope.currentfilter.showFilterTab = true;
        }
    }
    
        $scope.getListCallback = function(scope, res, options, hasError) {
            $scope.items = res.Data;
            for (var idx in $scope.items) {
                var item = $scope.items[idx];
                if (idx === 0) {
                    item.CanShowDetails = true;
                } else {
                    item.CanShowDetails = false;
                }
            }
        };

        $scope.getList = function() {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.PatientId
                    },
                    {
                        Key: 12,
                        Value: From
                    },
                    {
                        Key: 13,
                        Value: To
                    },
                    // {
                    //     Key: 18,
                    //     Value: $scope.currentcontext.EncounterId
                    // },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/patientorder/GetPatientOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.loadOrderDatas = function(item) {
            $scope.confirmCallback({
                ordid: item.Id,
                pid: $scope.currentcontext.PatientId,
                eid: $scope.currentcontext.EncounterId,
            });
        };

        $scope.handleEvents = function(actionType, row) {};

        $scope.getList();
    }

    labordersController.$inject = ['$scope', '$stateParams', '$filter', '$state', '$translate', 'utl'];

})();