(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('userPreferenceController', userPreferenceController);

    function userPreferenceController($scope, $stateParams, $state, $translate, utl) {

        $scope.prefKeys = {
            OPDashboardSections: "OPDashboardSections",
            IPDashboardSections: "IPDashboardSections",
            PMHXDashboardSections : "PMHXDashboardSections",
            ConsultationDefaultProfile : "ConsultationDefaultProfile",
            DischargeSummarySection : "DischargeSummarySection",
            HistoryComplaintSection : "HistoryComplaintSection"
        }

        $scope.userContext = {
            UserId: parseInt(utl.Session.getCurrentUserId())
        }

        $scope.prefMap = {};

        //Save User Preference
        $scope.saveUPCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (options.requestorComplete) {
                options.requestorComplete();
            }
        }

        $scope.saveUP = function (userPrefKey, userPrefObj, saveUPSuccess) {

            var userPrefValue = JSON.stringify(userPrefObj);

            var prefobj = {
                UserId: $scope.userContext.UserId,
                PrefKey: userPrefKey,
                PrefValue: userPrefValue,
                Id: 0
            };

            var actionName = 'SystemSettings/Userpreference/AddUserPreference';
            if ($scope.prefMap[userPrefKey]) {
                actionName = 'SystemSettings/Userpreference/UpdateUserPreference';
                prefobj.Id = $scope.prefMap[userPrefKey].Id;
            }

            var options = {
                action: actionName,
                data: { Data: prefobj },
                type: 'post',
                onComplete: $scope.saveUPCallback,
                currentPrefKey: userPrefKey,
                requestorComplete: saveUPSuccess
            };
            utl.Http.doAction(options);
        }

        //Get User Preference
        $scope.getUPCallback = function (scope, res, options, hasError) {
            //Get prefValue as JSON object
            var resultObj = null;
            if (res.Data && res.Data.length > 0) {
                var mapObj = {};
                for (var idx in res.Data) {
                    var currentItem = res.Data[idx];
                    var prefValueObj = currentItem.PrefValue ? JSON.parse(currentItem.PrefValue) : '';
                    currentItem.PrefValueObj = prefValueObj;
                    mapObj[currentItem.PrefKey] = currentItem;
                }
                $scope.prefMap = mapObj;
            }
            if ($scope.prefMap[options.currentPrefKey]) {
                var prefObj = $scope.prefMap[options.currentPrefKey];
                resultObj = prefObj.PrefValueObj;
            }

            if (options.requestorComplete) {
                options.requestorComplete(resultObj);
            }
        }

        $scope.getUP = function (userPrefKey, getUPSuccess) {

            //Check for the UP Key in available list
            if ($scope.prefMap[userPrefKey] != null) {
                var prefObj = $scope.prefMap[userPrefKey];
                getUPSuccess(prefObj.PrefValueObj);
                return;
            }

            var inputParams = {
                Params: [
                    { Key: 1, Value: $scope.userContext.UserId }
                ]
            }
            var actionName = 'SystemSettings/Userpreference/GetUserPreferences';

            var options = {
                action: actionName,
                data: inputParams,
                type: 'post',
                onComplete: $scope.getUPCallback,
                requestorComplete: getUPSuccess,
                currentPrefKey: userPrefKey
            };
            utl.Http.doAction(options);
        }

        $scope.refreshUP = function (userPrefKey, getUPSuccess) {
            $scope.prefMap[userPrefKey] = null;
            $scope.getUP(userPrefKey, getUPSuccess);
        }
    }

    userPreferenceController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();