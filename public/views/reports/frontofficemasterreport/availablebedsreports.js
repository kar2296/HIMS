(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('availablebedsreportsController', availablebedsreportsController);

    function availablebedsreportsController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.Items = [];
        $scope.currentfilter = {
            WardId: -1,
            BedStatusId: -1,
        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.backtoReport = function () {
            if ($scope.Context == 'ipopreport') {
                $state.go('app.ipopreportstab.masterreport');
            } if ($scope.Context == 'nursingreport') {
                $state.go('app.nursingreport');
            } if ($scope.Context == 'doctorreport') {
                $state.go('app.doctorreport');
            }
        };
        $scope.backtoReport = function () {
            $state.go('app.ipopreportstab.masterreport');
        }

        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Ward Name", "Room No", "Bed No", "Location", "Status"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var ward = '';
                var room = '';
                var bedNo = '';
                var location = '';
                var status = '';
             
                if (rowArray.WardMaster.WardName) {
                    ward = rowArray.WardMaster.WardName;
                }
                if (rowArray.WardRoomMaster.RoomNo) {
                    room = rowArray.WardRoomMaster.RoomNo;
                }
                if (rowArray.BedNo) {
                    bedNo = rowArray.BedNo;
                }
                if (rowArray.LocationMaster) {
                if (rowArray.LocationMaster.LocationName) {
                    location = rowArray.LocationMaster.LocationName;
                }
            }
                if (rowArray.BedStatus.Description) {
                    status = rowArray.BedStatus.Description;
                }
                csvContent += ward + ',' + room + ',' + bedNo + ',' + location + ',' + status + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'availablebeds-report.csv';
            hiddenElement.click();
        
        };
        
        $scope.excelDownload = function () {
       var inputData = {
                Params: [
                    {
                        Key: 9,
                        Value: 2
                    },
                    {
                        Key: 3,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 1,
                        Value: $scope.currentfilter.WardId
                    },
                    {
                        Key: 5,
                        Value: 1
                    }
                ],
        
            };
            var options = {
                action: "GeneralMaster/WardRoomBedMaster/GetWardRoomBedMasters",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };



        $scope.getListCallback = function (scope, data, options, hasError) {

            vm.gridConfig.data = [];
            if ($scope.currentfilter.WardId > 0) {
                $scope.WardName = data.Data[0].WardMaster.WardName;
            }
            else {
                $scope.WardName = '';
            }
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };
        $scope.getList = function () {

            var inputData = {
                Params: [
                    {
                        Key: 9,
                        Value: 2
                    },
                    {
                        Key: 3,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 1,
                        Value: $scope.currentfilter.WardId
                    },
                    {
                        Key: 5,
                        Value: 1
                    }],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'GeneralMaster/WardRoomBedMaster/GetWardRoomBedMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.print = function () {
            var inputData = {
                Data: {
                    WardName: $scope.WardName,

                },
                Params: [
                    {
                        Key: 9,
                        Value: 2
                    },
                    {
                        Key: 3,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 1,
                        Value: $scope.currentfilter.WardId
                    },
                    {
                        Key: 5,
                        Value: 1
                    }],
            };
            var options = {
                action: 'GeneralMaster/WardRoomBedMaster/PrintAvailableBedMasters',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "S.No",
                displayName: $translate.instant('S.No'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
            },
            {
                field: "WardMaster.WardName",
                displayName: $translate.instant('reports.wardname.lbl')
            },
            {
                field: "WardRoomMaster.RoomNo",
                displayName: $translate.instant('reports.roomno.lbl')
            },
            {
                field: "BedNo",
                displayName: $translate.instant('reports.bedno.lbl')
            },
            {
                field: "LocationMaster.LocationName",
                displayName: $translate.instant('reports.location.lbl')
            },

            {
                field: "BedStatus.Description",
                displayName: $translate.instant('reports.activestatus.lbl')
            }
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
        };

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "BedStatus"
                },
                {
                    "Key": "Ward",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: utl.Session.getCurrentFacilityId()
                        }]
                    }
                },
                {
                    "Key": "Facility"
                }

            ]
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

    availablebedsreportsController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();