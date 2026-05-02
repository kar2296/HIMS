(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientcontrolController', patientcontrolController);

function patientcontrolController($rootScope,$scope, $stateParams, $state, $translate, utl,$timeout) {
    var vm = this;

    $scope.Items = [];
    $scope.currentfilter= {
        FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
    };
    $scope.patientdetails = [];
    

    $scope.getListCallback = function (scope, res, options, hasError) {
        $scope.patientdetails = res.Data;
    };
    $timeout(function () {
        removeFloatingNav();
    }, 100);

    function removeFloatingNav() {
        $rootScope.app.layout.isCollapsed = true;
    }

    $scope.getList = function () {

        var inputData = {
            Params: [
            {
                Key: 1,
                Value: $scope.currentfilter.FacilityId
            },
            {
                Key: 5,
                Value: $scope.currentfilter.DoctorId
            },
            {
                Key: 19,
                Value: $scope.currentfilter.GuarantorId
            },
            {
                Key: 54,
                Value: $scope.currentfilter.VisitTypeId
            },
            {
                Key: 68,
                Value: $scope.currentfilter.PatientTypeId
            },
            {
                Key: 15,
                Value: [1, 4]
            },
            {
                Key: 64,
                Value: true
            },
            ],
        };

        var options = {
            action: 'Visit/Visit/GetEncounters',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    

    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        $scope.getList();
    }

    $scope.initLookup = function () {
        var inputData = [{
            "Key": "Facility",
            Request: {
                Params: [{
                    Key: 4,
                    Value: true
                }]
            }
        },
        {
            "Key": "Doctor",
            Request: {
                Params: [{
                    Key: 2,
                    Value: [-1, utl.Session.getCurrentFacilityId()]
                }]
            }
        },
        {
            "Key": "VisitType"
        },
        {
            "Key": "PatientType"
        },
        {
            "Key": "Guarantor",
            Request: {
                Params: [{
                    Key: 7,
                    Value: [-1, utl.Session.getCurrentFacilityId()]
                }]
            }
        },]
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

patientcontrolController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', 'utl','$timeout'];

})();