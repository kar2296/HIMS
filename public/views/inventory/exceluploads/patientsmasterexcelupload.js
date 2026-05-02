(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientsMasterExceluploadController', PatientsMasterExceluploadController);

    function PatientsMasterExceluploadController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate()
        };
        $scope.lookup = {};

        $scope.backtoDashboard = function () {
            $state.go('app.exceluploads');
        }
        $scope.openModal = function (Id) {
            utl.Modal.open('app.importpatientmasterexcel', {
                params: { id: Id },
                confirmCallback: $scope.getList
            });
        };

        $scope.itemUpload = function() {
            $scope.openModal(0,false);
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                //     {
                //     Key: 43,
                //     Value: From
                // },
                // {
                //     Key: 44,
                //     Value: To
                // },
                {
                    Key: 46,
                    Value: true
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'registration/patient/GetPatients',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
            {
                field: "FirstName",
                displayName: $translate.instant('reports.patient.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.Title && entity.Title.Description'>{{entity.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.FirstName}}</span>&nbsp;<span>{{entity.LastName}}</span>\
                                        </div>"
            },
            {
                field: "Age",
                displayName: $translate.instant('reports.age.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                           <span>{{entity.Age}}</span>&nbsp;/<span>{{entity.Gender.Description}}</span>\
                                     </div>"
            },
            {
                field: "MRN",
                displayName: $translate.instant('reports.mrn.lbl')
            },
            {
                field: "Mobile",
                displayName: $translate.instant('Mobile No')
            },

            {
                field: "CreatedAt",
                displayName: $translate.instant('Uploaded Date'),
                // cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.RegisteredDate | date : 'dd-MM-yyyy'}} </span></div>"
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.CreatedAt | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.RegisteredDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "AddressLine1",
                displayName: $translate.instant('Address')
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
            // $scope.getList();
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
        $scope.getList();

    }

    PatientsMasterExceluploadController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();