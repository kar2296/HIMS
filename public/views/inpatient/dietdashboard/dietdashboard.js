(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dietdashboardController', dietdashboardController);

    function dietdashboardController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.item = {
            IsActive: true,
            isDisabled: false
        };
        $scope.Items = {};
        $scope.Items.checkedinpatientcount = '0';
        $scope.Items.appoinmentCount = '0';
        $scope.Items.patientordercount = '0';
        $scope.Items.inpatientCount = '0';
        $scope.Items.kitchenworklistcount = '0';
        $scope.Items.rejectedcount = '0';
        $scope.Items.stockrequestcount = '0';
        $scope.Items.stockreceivecount = '0';

        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.FacilityId = utl.Session.getCurrentFacilityId();



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



        $scope.getDietDashboardCountCallBack = function (scope, res, options, hasError) {
            $scope.Items.checkedinpatientcount = res.checkedinpatientbo.checkedinpatientcount;
            $scope.Items.appoinmentCount = res.appoinmentbo.appoinmentCount;
            $scope.Items.patientordercount = res.patientorderbo.patientordercount;
            $scope.Items.inpatientCount = res.inpatientbo.inpatientCount;
            $scope.Items.kitchenworklistcount = res.patientorderbo.kitchenworklistcount;
            $scope.Items.rejectedcount = res.patientorderbo.rejectedcount;
            $scope.Items.stockrequestcount = res.stockrequestbo.stockrequestcount;
            $scope.Items.stockreceivecount = res.stockreceivebo.stockreceivecount;
            if (!$scope.Items.checkedinpatientcount)
                $scope.Items.checkedinpatientcount = '0';
            if (!$scope.Items.appoinmentCount)
                $scope.Items.appoinmentCount = '0';
            if (!$scope.Items.patientordercount)
                $scope.Items.patientordercount = '0';
            if (!$scope.Items.inpatientCount)
                $scope.Items.inpatientCount = '0';
            if (!$scope.Items.kitchenworklistcount)
                $scope.Items.kitchenworklistcount = '0';
            if (!$scope.Items.rejectedcount)
                $scope.Items.rejectedcount = '0';
            if (!$scope.Items.stockrequestcount)
                $scope.Items.stockrequestcount = '0';
            if (!$scope.Items.stockreceivecount)
                $scope.Items.stockreceivecount = '0';
        };
        $scope.getCount = function () {
            var inputData = {
                Data: {
                    Keys: [
                        { Key: 'checkedinpatientbo' },
                        { Key: 'appoinmentbo' },
                        { Key: 'patientorderbo' },
                        { Key: 'inpatientbo' },
                        { Key: 'stockrequestbo' },
                        { Key: 'stockreceivebo' },

                    ]
                },
                Attributes: $scope.currentcontext
            };

            var options = {
                action: 'IPManagement/DietDashboard/GetDietDashboardOptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDietDashboardCountCallBack
            };
            utl.Http.doAction(options);
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getCount();
        }

        $scope.initLookup = function () {
            var inputData = [

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

    dietdashboardController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();