(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('QrcodeScannerController', QrcodeScannerController);

    function QrcodeScannerController($http, $scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        console.log($scope.$stateParams.id, '***********************');
        $scope.Items = [];
        $scope.currentfilter = {
            AssetTypeId: -1,
            AssetCategoryId: -1,
            ActiveStatusId: 2,
            DepartmentId: -1,
            EmployeeId: utl.Session.getCurrentUserId(),
        };
        // $scope.currentcontext = {};
        $scope.$stateParams = {};
        $scope.$stateParams.id = parseInt($stateParams.id);


        selfUserLogin();

        function selfUserLogin() {
            var options = {
                action: 'auth/getClientToken',
                data: {
                    userName: 'admin',
                    password: 'arun@123',
                    userList: $scope.userData
                },
                type: 'post',
                onComplete: (scope, data) => {
                    console.log('jjjjjj', data);
                    var clientToken = data.token;
                    localStorage.setItem('token', clientToken)
                    $http.defaults.headers.post.Authorization = `bearer ${localStorage.getItem('token')}`;
                    $scope.getList();
                }
            };
            utl.Http.doAction(options);
        }

        // $scope.currentcontext = {
        //     ismodal: modalConfig && modalConfig.params ? true : false
        // };
        // $scope.currentcontext.id = parseInt(modalConfig.params.id);

        // $scope.confirmCallback = $uibModalInstance.close;
        // $scope.cancelCallback = $uibModalInstance.dismiss;

        $scope.warrentyitem = {};
        $scope.insuranceitem = {};

        $scope.Asset_dashboard = function () {
            $state.go('app.newassetdashboard')
        };



        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.item = res.Data[0];
            $scope.getInsuranceList();
            $scope.getWarrentyList();
        };

        $scope.getList = function () {
                var inputData = {
                    Params: [
                        {
                            Key: 0,
                            Value: $scope.$stateParams.id
                        },
                    ],
                };

                var options = {
                    action: 'AssetManagement/Asset/GetAssets',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };

                utl.Http.doAction(options);
        };

        $scope.getWarrentyListCallback = function (scope, res, options, hasError) {
            $scope.warrentyitem = res.Data[0];
            // vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getWarrentyList = function () {
            var inputData = {

                Params: [

                    {
                        Key: 5,
                        Value: $scope.$stateParams.id
                    },
                ],
            };

            var options = {
                action: 'AssetManagement/Assetwarranty/GetAssetWarranties',
                data: inputData,
                type: 'post',
                onComplete: $scope.getWarrentyListCallback
            };

            utl.Http.doAction(options);

        };

        $scope.getInsuranceListCallback = function (scope, res, options, hasError) {
            $scope.insuranceitem = res.Data[0];
        };

        $scope.getInsuranceList = function () {
            var inputData = {

                Params: [
                    {
                        Key: 2,
                        Value: $scope.$stateParams.id
                    },
                ],

            };

            var options = {
                action: 'AssetManagement/AssetInsurance/GetAssetInsurances',
                data: inputData,
                type: 'post',
                onComplete: $scope.getInsuranceListCallback
            };

            utl.Http.doAction(options);

        };

        // $scope.backToList = function () {
        //     $state.go('app.assettab.details');
        //     // $scope.confirmCallback();
        // }

        // $scope.lookupCallback = function (scope, data, options, hasError) {
        //     $scope.lookup = hasError ? {} : data;
        //     // $scope.getList();
        // }

        // $scope.initLookup = function () {
        //     // var curdeptids = utl.Session.getUserDepartments();
        //     var inputData = [];

        //     var options = {
        //         action: 'General/Options/getoptions',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.lookupCallback
        //     };
        //     utl.Http.doAction(options);
        // }

        // $scope.initLookup();
    }

    QrcodeScannerController.$inject = ['$http', '$scope', '$stateParams', '$state', '$translate', 'utl'];

})();