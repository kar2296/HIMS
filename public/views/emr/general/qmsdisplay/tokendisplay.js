(function () {
    'use strict';
    angular
        .module('app.pages')
        .controller('tokendisplayController', tokendisplayController);

    function tokendisplayController($scope, $stateParams, $translate, $interval, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
        $scope.currentcontext = {};
        $scope.ListofTokens = []; 
        $scope.CurrentPage = 1;
        $scope.PageInitialzation = 1;
        $scope.totalrecord = -1;
        $scope.MissedDisplay = '';
        $scope.startinterval = null;
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.getTokenListCallback = function (scope, res, options, hasError) {
            $scope.ListofTokens = res;
            var listLength = $scope.ListofTokens.length;
            var pageCount = Math.ceil(listLength / 8);
            if ($scope.totalrecord != $scope.ListofTokens.length) {
                $scope.totalrecord = $scope.ListofTokens.length;
                $scope.CurrentPage = 1;
                $scope.PageInitialzation = 1;
                $interval.cancel($scope.startinterval);
            }

            if ($scope.PageInitialzation == 1) {
                $scope.getList($scope.CurrentPage);
                $scope.PageInitialzation++;


                $scope.startinterval = $interval(function () {
                    $scope.getTokenList();
                    if ($scope.CurrentPage <= pageCount) {
                        $scope.getList($scope.CurrentPage);
                        $scope.CurrentPage += 1;
                    } else {
                        $scope.CurrentPage = 1;
                        $scope.getList($scope.CurrentPage);
                    }
                }, 3 * 1000);
            }
        }
        $scope.getTokenList = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: { Status: 1, TokenStatusId: 2 }
            };
            var options = {
                action: 'Appointment/TokenDisplay/GetListofTokens',
                data: inputData,
                type: 'post',
                onComplete: $scope.getTokenListCallback
            };
            utl.Http.doAction(options);

        };
        $scope.getMissedTokenListCallback = function (scope, res, options, hasError) {
            var MissedTokens = res.Data;
            var MissedTokenDisplay = '';
            for (var i = 0; i < res.Data.length; i++) {
                if (res.Data[i].TokenStatusId == 4) {
                    if (res.Data.length > 0) {
                        MissedTokenDisplay += res.Data[i].TokenNo + ',';
                    }
                }
            }
            $scope.MissedDisplay = MissedTokenDisplay;
        };
        $scope.getMissedTokenList = function () {
            var inputData = {
                Params: [
                    { Key: 2, Value: 4 },
                    { Key: 1, Value: $scope.currentcontext.id }
                ],

            };
            var options = {
                action: 'Appointment/TokenDisplay/GetTokenDisplays',
                data: inputData,
                type: 'post',
                onComplete: $scope.getMissedTokenListCallback
            };
            utl.Http.doAction(options);

        };
        $scope.backToList = function () {          
            $scope.confirmCallback();
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            var totaldata = res.Data;
            for (var i = res.Data.length; i < 8; i++) {
                var emptydata = {
                    "Id": i, "OrganizationId": null, "FacilityId": null, "PatientId": null, "EncounterId": null,
                    "DepartmentId": null, "TokenNo": '', "RoomNo": '', "TokenStatusId": 2, "PatientOrderId": null, "Status": 1,
                    "Rev": null, "CreatedBy": null, "CreatedAt": null, "UpdatedBy": null, "UpdatedAt": null,
                    "TokenStatus": { "Description": null }, "Department": { "DepartmentName": null },
                    "Patient": {
                        "Id": i, "TitleId": '', "FirstName": '', "MiddleName": null, "LastName": '', "MRN": '', "Age": '',
                        "GenderId": '', "DOB": null, "AddressLine1": null, "AddressLine2": null, "Pincode": null, "Area": null, "City": null,
                        "State": null, "Mobile": null, "PhotoPath": null, "MaritalStatusId": null, "Title": { "Description": '' },
                        "Gender": { "Description": '' }, "MaritalStatus": { "Description": null }
                    }
                };
                totaldata.push(emptydata);
            }
            $scope.TokenDisplay = totaldata;
            $scope.getMissedTokenList();
        };
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
                    { Key: 2, Value: [2, 4] },
                    { Key: 1, Value: $scope.currentcontext.id }
                ],

                PageContext: {
                    PageSize: 8,
                    PageNumber: PageNumber
                }
            };
            var options = {
                action: 'Appointment/TokenDisplay/GetTokenDisplays',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };
        $scope.getTokenList();

    }
    tokendisplayController.$inject = ['$scope', '$stateParams', '$translate', '$interval', 'utl', '$uibModalInstance', 'modalConfig'];
})();