(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('sampleTypeFormController', sampleTypeFormController);

function sampleTypeFormController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    angular.extend(this, utl.Ctrl.getBaseCtrl({$scope: $scope}));

    $scope.item = {
        IsActive : true,
        FacilityId : utl.Session.getCurrentFacilityId()
    };

    $scope.currentcontext =  {};
    $scope.currentcontext.id = parseInt($stateParams.id);

    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'lis/sampletype/GetSampletypeById',
                data: { Id: $scope.currentcontext.id },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.backToList = function () {
       $state.go('app.sampletypes');
    }

    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        $scope.backToList();
    };

    $scope.clear = function () {
        $scope.item = {};
    };


    $scope.saveItem = function () {

        if(!utl.Validator.validate($scope)) {
            return;
        }

        var actionName = 'lis/sampletype/AddSampletype';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'lis/sampletype/UpdateSampletype';
        }

        var options = {
            action: actionName,
            data: {Data : $scope.item },
            type: 'post',
            onComplete: $scope.saveItemCallback
        };
        utl.Http.doAction(options);
    };

    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        $scope.getItem();
        if ($scope.item.Activefrom == null)
            $scope.item.Activefrom = new Date();
    }

    $scope.initLookup = function () {
         var inputData = [
                            { "Key": "Organization" },
                            {
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
                },
                            { "Key": "SAMPLETYP" },
                            { "Key": "GENERICIND" },
                            { "Key": "SampleUnits" },
                            { "Key": "CollectionSite"},
                            { "Key": "ContainterMaster"},
                            { "Key": "CollectionRoute"},
                            { "Key": "CollectionMethod"}
                         ]
        var options = {
            action: 'General/Options/getoptions',
            data: inputData,
            type: 'post',
            onComplete: $scope.lookupCallback
        };
        $scope.$doAction(options);
    }

    $scope.initLookup();
}

sampleTypeFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();