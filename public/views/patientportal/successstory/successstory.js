(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientSuccessStoryController', PatientSuccessStoryController);

    function PatientSuccessStoryController($scope, $stateParams, $state, $translate, utl, Upload) {
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));
        $scope.SuccessStory = [];
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.categoryid = parseInt($stateParams.categoryid);


        // $scope.GetVirtualsubctgryimgCallback = function (scope, data, options, hasError) {
        //     var ctgryid = data.Id;
        //     var image = data.Image;
        //     for (var idx in $scope.SuccessStory) {
        //         var item = $scope.SuccessStory[idx];
        //         if (item.Id == ctgryid) {
        //             item.Image = image;
        //         }
        //     }
        // };

        // $scope.GetVirtualsubctgryimg = function (item) {
        //     if (item.Imagepath) {
        //         var inputData = {
        //             Id: item.Id,
        //             Imagepath: item.Imagepath
        //         };
        //         var options = {
        //             action: 'VirtualHealthcare/SuccessStory/getSuccessStoryCategoryImage',
        //             data: {
        //                 Data: inputData
        //             },
        //             type: 'post',
        //             onComplete: $scope.GetVirtualsubctgryimgCallback
        //         };
        //         utl.Http.doAction(options);
        //     }
        // };

        $scope.getImagesCallback = function (scope, data, options, hasError) {
            // $scope.currentcontext.Image = data.Attachment;
            var ctgryid = data.Id;
            var image = data.Attachment;
            for (var idx in $scope.SuccessStory) {
                var item = $scope.SuccessStory[idx];
                if (item.Id == ctgryid) {
                    item.Image = image;
                }
            }
        };
    

    $scope.getImages = function (item) {
        if (item.Attachment) {
            var inputData = {
                Id: item.Id,
                Attachment: item.Attachment
            };
            var options = {
                action: 'VirtualHealthcare/SuccessStory/GetAttachmentFile',
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.getImagesCallback
            };
            utl.Http.doAction(options);
        }
    };

    function loadImages() {
        for (var idx in $scope.SuccessStory) {
            var item = $scope.SuccessStory[idx];
            if (item.Attachment) {
                $scope.getImages(item);
            }
        }
    }


    $scope.getSuccessStoryCategoryCallback = function (scope, res, options, hasError) {
        $scope.SuccessStory = res.Data || [];
        loadImages()
        // $scope.getImages(item);
    };

    $scope.getSuccessStoryCategory = function (pageNo) {

        var inputData = {
            Params: [
//                 {
//                     Key: 1,
//                     Value: $scope.currentcontext.categoryid
//                 },
                {
                    Key: 3,
                    Value: 2
                }
            ],
        };

        var options = {
            action: 'VirtualHealthcare/SuccessStory/GetSuccessStorys',
            data: inputData,
            type: 'post',
            onComplete: $scope.getSuccessStoryCategoryCallback
        };

        utl.Http.doAction(options);
    };
    $scope.backToList = function () {
        $state.go('patientportal.virtualhealthcare');
    }

    $scope.home = function () {
        $state.go('patientportal.virtualhealthcare');
    }


    $scope.selectorderInfo = function (item) {
        // if (item.VirtualCategory.ConsultancyTypeId == 1) {
        $state.go('patientportal.successstoryform', {
            CategoryInfo: item
        });
        // }
        // if (item.VirtualCategory.ConsultancyTypeId == 2) {
        //     $state.go('patientportal.virtualserviceselection', {
        //         ctgryInfo: item
        //     });
        // }
    };
    $scope.getSuccessStoryCategory();

}

    PatientSuccessStoryController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

}) ();