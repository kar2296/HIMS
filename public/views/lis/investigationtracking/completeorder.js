(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('completeinvestigationtrackingController', completeinvestigationtrackingController);

    function completeinvestigationtrackingController($scope, $stateParams, $state, $translate, $filter, utl, uibButtonConfig, $timeout) {
        var vm = this;

        $scope.currentfilter = {
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
        };



        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;

            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 13,
                        Value: $scope.currentfilter.PatientId
                    },
                    {
                        Key: 18,
                        Value: From
                    },
                    {
                        Key: 19,
                        Value: To
                    }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/patientorderdetail/GetPatientOrderDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "idx",
                    displayName: $translate.instant('S.No'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
                },
                {
                    field: "RequestDate",
                    displayName: $translate.instant('reports.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.RequestDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.BillDateTime| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "Patient Name",
                    displayName: $translate.instant('reports.patient.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.Patient.Title && entity.Patient.Title.Description'>{{entity.Patient.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.Patient.FirstName}}</span>&nbsp;<span>{{entity.Patient.LastName}}</span>\
                                        </div>"
                },
                {
                    field: "Doctor Name",
                    displayName: $translate.instant('reports.doctorname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.PatientOrder.Doctor.Title && entity.PatientOrder.Doctor.Title.Description'>{{entity.PatientOrder.Doctor.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.PatientOrder.Doctor.FirstName}}</span>&nbsp;<span>{{entity.PatientOrder.Doctor.LastName}}</span>\
                                        </div>"
                },
                {
                    field: "Testmaster.Name",
                    displayName: $translate.instant('reports.testname.lbl')
                },
                {
                    field: "OrderStatus.DisplayName",
                    displayName: $translate.instant('reports.statusr.lbl')
                },

            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "VirtualOrderStatus"
            }, ]
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

    completeinvestigationtrackingController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', 'uibButtonConfig', '$timeout'];

})();