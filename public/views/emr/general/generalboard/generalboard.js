(function () {
    'use strict';
    angular
        .module('app.pages')
        .controller('generalboardFormController', generalboardFormController);
    function generalboardFormController($scope, $stateParams, $translate, $interval, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
        $scope.currentcontext = {};
        $scope.ListofContents = [];
        $scope.CurrentPage = 1;
        $scope.PageInitialzation = 1;
        $scope.totalrecord = -1;
        $scope.startinterval = null;
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.currentfilter = {
            GeneralDisplayStatusId: 2,
        };
        $scope.getContentListCallback = function (scope, res, options, hasError) {
            $scope.ListofContents = res;
            var listLength = $scope.ListofContents.length;
            var pageCount = Math.ceil(listLength / 8);
            if ($scope.totalrecord != $scope.ListofContents.length) {
                $scope.totalrecord = $scope.ListofContents.length;
                $scope.CurrentPage = 1;
                $scope.PageInitialzation = 1;
                $interval.cancel($scope.startinterval);
            }

            if ($scope.PageInitialzation == 1) {
                $scope.getList($scope.CurrentPage);
                $scope.PageInitialzation++;
                $scope.startinterval =$interval(function () {
                    $scope.getContentList();
                    if ($scope.CurrentPage <= pageCount) {
                        $scope.getList($scope.CurrentPage);
                        $scope.CurrentPage += 1;
                    }
                    else {
                        $scope.CurrentPage = 1;
                        $scope.getList($scope.CurrentPage);
                    }
                }, 3 * 1000);
            }
        }

        $scope.getContentList = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'Appointment/GeneralDisplay/GetListofContents',
                data: inputData,
                type: 'post',
                onComplete: $scope.getContentListCallback
            };
            utl.Http.doAction(options);
        };
        $scope.getListCallback = function (scope, res, options, hasError) {
            var totaldata = res.Data;
            for (var i = res.Data.length; i < 8; i++) {
                var emptydata = {
                    "Id": i, "Displaydate": null, "LOCATIONId": null, "DisplayNoId": null, "DisplayText": '',
                    "GeneralDisplayStatusId": null, "Status": 1, "Rev": 0, "CreatedBy": 1, "CreatedAt": null, "UpdatedBy": 1,
                    "UpdatedAt": null, "LOCATION": { "Description": null }, "DisplayNo": { "Description": null },
                    "GeneralDisplayStatus": { "Description": null }
                };
                totaldata.push(emptydata);
            }
            $scope.GeneralDisplay = totaldata;
        };
        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        $scope.getList = function (PageNumber) { 
            if ($uibModalInstance) {
                if ($uibModalInstance.closed) {
                    var statusclsd = $uibModalInstance.closed.$$state.status;
                    if (statusclsd == 1) {                       
                        $interval.cancel($scope.startinterval);
                    }
                }
            }

            var inputData = {
                Params: [
                    { Key: 3, Value: $scope.currentcontext.id },
                    { Key: 4, Value: $scope.currentfilter.GeneralDisplayStatusId }

                ],
                PageContext: {
                    PageSize: 8,
                    PageNumber: PageNumber
                }
            };
            var options = {
                action: 'Appointment/GeneralDisplay/GetGeneralDisplays',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };
        $scope.getContentList();
    }

    generalboardFormController.$inject = ['$scope', '$stateParams', '$translate', '$interval', 'utl', '$uibModalInstance', 'modalConfig'];
})();