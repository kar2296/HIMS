(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PastVisitsController', PastVisitsController);

    function PastVisitsController($scope, $filter, $stateParams, $state, $translate, utl, $rootScope) {
        var vm = this;
        $scope.gridData = [];
        $scope.Items = [];
        $scope.currentfilter = {
            EncounterTypeId: -1
        };
        $scope.item = {}
        $scope.currentcontext = {};
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.gridData = res.Data;
            var items = $scope.gridData;
            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 3, Value: $scope.currentcontext.pid },
                    { Key: 9, Value: $scope.currentfilter.EncounterTypeId }

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/consultation/GetConsultations',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.changeencountertype = function (enctypeId) {
            $scope.currentfilter.EncounterTypeId = enctypeId;
            $scope.getList();
        }

        //Grid Actions

        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'encounter') {
                $rootScope.$broadcast('patientemr-view-encounter', { encounter: row.entity.Encounter });
            } else if (actionType == 'reviewnote') {
                utl.Modal.open('patientemr.reviewnotes', {
                    params: { cid: row.entity.Id, pid: $scope.currentcontext.pid }
                });
            }
        };
        vm.gridConfig = {
            columnDefs: [
                { field: "Id", name: 'Past Visit Details', cellTemplate: 'pastvisitTemplate.html' }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };
        $scope.initLookup = function () {
            var inputData = [];
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
    PastVisitsController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$rootScope'];

})();