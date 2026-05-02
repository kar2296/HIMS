(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('externalProviderFormController', externalProviderFormController);

    function externalProviderFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            OrganizationId: utl.Session.getCurrentFacilityId(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            ActiveFrom: utl.Formatter.getCurrentDate(),
            IsActive: true,
            isDisabled: false,
        };

        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);

        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            if (data.ActiveStatusId == 2)
                $scope.item.isRequested = true;

            /*   if ($scope.item.Activefrom == null)
                  $scope.item.Activefrom = new Date();*/
        };

        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'lis/ExternalProvider/GetExternalProviderById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function() {
            $state.go('app.externalprovider');
        }

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof(data) == "boolean") {
                if (options && options.data != null && options.data.Data != null) {
                    $scope.currentcontext.id = options.data.Data.Id;
                    $scope.getItem();
                }
            } else if (typeof(data) == "number") {
                //  $state.go('app.usertab.general');
                $state.go('app.externalprovidertab.externalproviders', { id: data, IsProfile: null, ProviderName: options.data.Data.ProviderName });
            } else {
                $scope.backToList(); // Safer side added
            }

        };

        $scope.clear = function() {
            $scope.item = {};
        };
        $scope.save = function() {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        }

        $scope.saveandApprove = function() {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        }

        $scope.saveItem = function() {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'lis/ExternalProvider/AddExternalProvider';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'lis/ExternalProvider/UpdateExternalProvider';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
            if ($scope.item.Activefrom == null)
                $scope.item.Activefrom = new Date();
        }

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "Organization" },
                { "Key": "TESTMASTERTYP" },
                //  { "Key": "Pincode" },
                //  { "Key": "State" },
                //  { "Key": "City" },
                //  { "Key": "Country" },
                // { "Key": "Area" },
                {
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
                },

            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initLookup();
    }

    externalProviderFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();