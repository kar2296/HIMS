(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('createorderDashboardController', createorderDashboardController);

    function createorderDashboardController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));
        $scope.VirtualCategory = [];

        $scope.GetVirtualctgryimgCallback = function (scope, data, options, hasError) {
            var ctgryid = data.Id;
            var image = data.Image;
            for (var idx in $scope.VirtualCategory) {
                var item = $scope.VirtualCategory[idx];
                if (item.Id == ctgryid) {
                    item.Image = image;
                }
            }
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.GetVirtualctgryimg = function (item) {
            if (item.Imagepath) {
                var inputData = {
                    Id: item.Id,
                    Imagepath: item.Imagepath
                };
                var options = {
                    action: 'VirtualHealthcare/VirtualCategory/GetVirtualCategoryImage',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.GetVirtualctgryimgCallback
                };
                utl.Http.doAction(options);
            }
        };

        function loadImages() {
            for (var idx in $scope.VirtualCategory) {
                var item = $scope.VirtualCategory[idx];
                if (item.Imagepath) {
                    $scope.GetVirtualctgryimg(item);
                }
            }
        }
        $scope.getVirtualCategoryCallback = function (scope, res, options, hasError) {
            $scope.VirtualCategory = res.Data || [];
            loadImages();
        };
        $scope.getVirtualCategory = function (pageNo) {
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                }],
            };

            var options = {
                action: 'VirtualHealthcare/VirtualCategory/GetVirtualCategorys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getVirtualCategoryCallback
            };

            utl.Http.doAction(options);
        };



        // $scope.backToList = function () {
        //     $state.go('app.doctorconsultant');
        // };
        $scope.mycalendar = function () {
            $state.go('app.mycalendar');
        };


        $scope.getvirtualsubcategory = function (items) {
            $state.go('app.doctorconsultant', {
                categoryid: items.Id
            });
        };


        $scope.getVirtualCategory();

    }

    createorderDashboardController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();