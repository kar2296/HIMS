(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('guarantorCardTypeController', guarantorCardTypeController);

    function guarantorCardTypeController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        vm.gridConfig = {};
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = [];
        $scope.gridData = [];
        $scope.selectediteminfo = {};
        $scope.currentcontext = {};
        $scope.currentcontext.gid = parseInt($stateParams.gid);

        $scope.getDetailsCallback = function (scope, res, options, hasError) {
            $scope.gridData = res.Data;
            var detail = [];
            for (var idx in res.Data) {
                var name = res.Data[idx];
                detail.push(name);
            }
            $scope.cardname = detail;
        };

        $scope.getDetails = function () {
            var inputData = {
                Params: []
            };

            var options = {
                action: 'generalmaster/CardMaster/GetCardMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDetailsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'generalmaster/GuarantorCardType/GetGuarantorCardTypeById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else
                $scope.getDetails();
        };

        $scope.clear = function () {
            $scope.item = {};
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getItem();
        };

        $scope.saveItem = function () {
            var lines = getlinesforsave();
            var actionName = 'generalmaster/GuarantorCardType/AddGuarantorCardType';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'generalmaster/GuarantorCardType/UpdateGuarantorCardType';
            }
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        function getlinesforsave() {
            for (var idx in $scope.gridData) {
                var item = $scope.gridData[idx];
                if (item.Id > 0 && item[item.Id] == true) {
                    var cardmasterdetail = {
                        CardMasterId: $scope.gridData[idx].Id,
                        CardMasterTypeId: $scope.gridData[idx].CardMasterTypeId,
                        Code: $scope.gridData[idx].Code,
                        Description: $scope.gridData[idx].Description,
                        CardName: $scope.gridData[idx].CardName,
                        FacilityId: utl.Session.getCurrentFacilityId(),
                        GuarantorId: $scope.currentcontext.gid
                    }
                    $scope.item.push(cardmasterdetail);
                }
            }
            return $scope.item;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "TickSheetType" },
                { "Key": "Department" },
                { "Key": "TickSheetMasterType" },
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
        };

        $scope.initLookup();
    }

    guarantorCardTypeController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();