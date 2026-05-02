(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('TestMasterWithParameterController', TestMasterWithParameterController);

    function TestMasterWithParameterController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),

        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.Items = res.Data;
            if ($scope.currentfilter.SubDepartmentId > 0) {
                $scope.SubDepartmentName = res.Data[0].SubDepartmentName;
            }
            if ($scope.currentfilter.TestId > 0) {
                $scope.TestName = res.Data[0].TestName;
            }
            // vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 15, Value: $scope.currentfilter.FacilityId },
                    { Key: 5, Value: $scope.currentfilter.SubDepartmentId },
                    { Key: 0, Value: $scope.currentfilter.TestId },
                ],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'lis/testmaster/GetTestmasterwithAnalytes',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.TestId = -1;
                $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            $state.go('app.reports')
        };

        $scope.print = function () {
            var inputData = {
                Data: { 
                    FacilityName: $scope.currentfilter.FacilityName,
                    SubDepartmentName: $scope.currentfilter.SubDepartmentName,
                    TestName: $scope.TestName
                },
                Params: [
                    { Key: 15, Value: $scope.currentfilter.FacilityId },
                    { Key: 5, Value: $scope.currentfilter.SubDepartmentId },
                    { Key: 0, Value: $scope.currentfilter.TestId },
                ],
            };
            var options = {
                action: 'lis/testmaster/PrintTestMasterParameter',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        vm.testcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Code',
                field: 'Code',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Name',
                field: 'Name',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },

            ],
            searchparams: {},
            result: {},
            api: 'lis/testmaster/GetTestmasters',
            formatdisplay: formatselectedtest,
            presearch: presearchtest,
            postsearch: postsearchtest
        };

        function formatselectedtest() {

            var selectedItem = vm.testcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.Name + '(' + selectedItem.Code + ')'].join('  ');
            } else if (vm.testcontrolconfig.rowdata) {
                result = [vm.testcontrolconfig.rowdata.TestCode, vm.testcontrolconfig.rowdata.TestName].join(' ');
            }
            return result;
        }

        function presearchtest() {

            var query = vm.testcontrolconfig.query;

            var inputData = {
                Params: [
                    {
                        Key: 6,
                        Value: 2
                    },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.testcontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.testcontrolconfig.searchparams = inputData;
        }

        function postsearchtest() {
            for (var idx in vm.testcontrolconfig.result) {
                var item = vm.testcontrolconfig.result[idx];
                item.Code = item.Code;
                item.Name = item.Name;
            }
        }
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
                    "Key": "Department"
                },
            ]
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

    TestMasterWithParameterController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();