(function () {
    'use strict';
    angular
        .module('app.pages')
        .controller('displayboardFormController', displayboardFormController);
    function displayboardFormController($scope, $stateParams, $translate, $interval, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
        $scope.currentcontext = {};
        $scope.ListofDoctors = [];
        $scope.CurrentPage = 1;
        $scope.PageInitialzation = 1;
        $scope.totalrecord = -1;
        $scope.startinterval = null;
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.locid = parseInt(modalConfig.params.locid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.currentfilter = {
            DisplayStatusId: 1,
            LocationId: -1
        };

        $scope.getDoctorListCallback = function (scope, res, options, hasError) {
            $scope.ListofDoctors = res;
            var listLength = $scope.ListofDoctors.length;
            
            var pageCount = Math.ceil(listLength / 8);

            if($scope.totalrecord != $scope.ListofDoctors.length)
            {
                $scope.totalrecord = $scope.ListofDoctors.length;
                $scope.CurrentPage = 1;
                $scope.PageInitialzation = 1;
                $interval.cancel($scope.startinterval);
            }

            if ($scope.PageInitialzation == 1) {
                $scope.getList($scope.CurrentPage);
                $scope.PageInitialzation++;

                $scope.startinterval = $interval(function () { 
                    $scope.getDoctorList(); 
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

        $scope.getDoctorList = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'Appointment/DoctorDisplay/GetListofDoctors',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDoctorListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            var totaldata = res.Data;
            for (var i = res.Data.length; i < 8; i++) {
                var emptydata = {
                    "Id": i, "Displaydate": null, "DoctorId": null, "DoctorName": null,
                    "DepartmentId": null, "RoomNo": '', "LocationId": null, "Availablefrom": '',
                    "Availableto": '', "DisplayNoId": null, "DisplayStatusId": null, "Status": 1, "Rev": 0,
                    "CreatedBy": 1, "CreatedAt": null, "UpdatedBy": 1, "UpdatedAt": null, "LOCATIONId": 1,
                    "DisplayStatus": { "Description": null }, "DisplayNo": { "Description": null },
                    "LOCATION": { "Description": null }, "Department": { "DepartmentName": '' },
                    "User": { "FirstName": '', "LastName": '', "Title": { "Description": '' } }
                };
                totaldata.push(emptydata);
            }
            $scope.DoctorDisplay = totaldata;
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
                    { Key: 2, Value: $scope.currentcontext.locid },
                    { Key: 4, Value: $scope.currentfilter.DisplayStatusId },
                    { Key: 5, Value: $scope.currentcontext.id }
                ],
                PageContext: {
                    PageSize: 8,
                    PageNumber: PageNumber
                }
            };
            var options = {
                action: 'Appointment/DoctorDisplay/GetDoctorDisplays',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };
        $scope.getDoctorList();
    }
    displayboardFormController.$inject = ['$scope', '$stateParams', '$translate', '$interval', 'utl', '$uibModalInstance', 'modalConfig'];
})();