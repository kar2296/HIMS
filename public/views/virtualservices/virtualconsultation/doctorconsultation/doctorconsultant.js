(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('doctorconsultantController', doctorconsultantController);

    function doctorconsultantController($scope, $stateParams, $state, $translate, utl, Upload) {
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));
        $scope.VirtualSubCategory = [];
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.categoryid = parseInt($stateParams.categoryid);


        $scope.GetVirtualsubctgryimgCallback = function (scope, data, options, hasError) {
            var ctgryid = data.Id;
            var image = data.Image;
            for (var idx in $scope.VirtualSubCategory) {
                var item = $scope.VirtualSubCategory[idx];
                if (item.Id == ctgryid) {
                    item.Image = image;
                }
            }
        };

        $scope.GetVirtualsubctgryimg = function (item) {
            if (item.Imagepath) {
                var inputData = {
                    Id: item.Id,
                    Imagepath: item.Imagepath
                };
                var options = {
                    action: 'VirtualHealthcare/VirtualSubCategory/GetVirtualSubCategoryImage',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.GetVirtualsubctgryimgCallback
                };
                utl.Http.doAction(options);
            }
        };

        function loadImages() {
            for (var idx in $scope.VirtualSubCategory) {
                var item = $scope.VirtualSubCategory[idx];
                if (item.Imagepath) {
                    $scope.GetVirtualsubctgryimg(item);
                }
            }
        }


        $scope.getVirtualsubcategoryCallback = function (scope, res, options, hasError) {
            $scope.VirtualSubCategory = res.Data || [];
            loadImages();
        };

        $scope.getVirtualsubcategory = function (pageNo) {

            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.categoryid
                    },
                    {
                        Key: 4,
                        Value: 2
                    }
                ],
            };

            var options = {
                action: 'VirtualHealthcare/VirtualSubCategory/GetVirtualSubCategorys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getVirtualsubcategoryCallback
            };

            utl.Http.doAction(options);
        };
        $scope.backToList = function () {
            $state.go('app.createorderdashboard');
        }

        $scope.home = function () {
            $state.go('app.createorderdashboard');
        }


        $scope.selectorderInfo = function (item) {
            if (item.VirtualCategory.ConsultancyTypeId == 1) {
                $state.go('app.doctorselectInfo', {
                    ctgryInfo: item
                });
            }
            if (item.VirtualCategory.ConsultancyTypeId == 2) {
                $state.go('app.serviceselectInfo', {
                    ctgryInfo: item
                });
            }
        };
        $scope.getVirtualsubcategory();

    }

    doctorconsultantController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();