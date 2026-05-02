(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('cathlabsummarybyanaesthetistController', cathlabsummarybyanaesthetistController);

    function cathlabsummarybyanaesthetistController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };

        $scope.CanShowPrint = false;
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.AnaesthesistSummary = res;
            $scope.NetAnaesthesistSummary = [];
            if ($scope.AnaesthesistSummary) {
                for (var idx in $scope.AnaesthesistSummary) {
                    var AnaesthesistSummary = $scope.AnaesthesistSummary[idx];
                    var Key = '';
                    var AnaesthesistName = '';
                    var AnaesthesistCount = 0;
                    for (var px in AnaesthesistSummary) {
                        var psummary = AnaesthesistSummary[px];
                        if (psummary.AnaesthesistName) {
                            AnaesthesistName = psummary.AnaesthesistName;
                        }
                        if (psummary.AnaesthesistCount) {
                            AnaesthesistCount = psummary.AnaesthesistCount;
                        }
                    }
                    Key = AnaesthesistName;
                    AnaesthesistCount = AnaesthesistCount;
                    $scope.NetAnaesthesistSummary.push({
                        'Key': Key,
                        'AnaesthesistCount': AnaesthesistCount,
                    });
                }
            }
            $scope.TotAnaesthesistCount = 0;
            var totAnaesthesistCount = 0;
            for (var ix in $scope.NetAnaesthesistSummary) {
                let netsummary = $scope.NetAnaesthesistSummary[ix];
                if (netsummary.AnaesthesistCount) {
                    totAnaesthesistCount += netsummary.AnaesthesistCount;
                }
            }
            $scope.TotAnaesthesistCount = totAnaesthesistCount;
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    IsCathlab: true,
                    AnaesthesistId: $scope.currentfilter.AnaesthesistId || 0,
                }
            };
            var options = {
                action: 'OtManagement/SurgeryEntry/GetSurgerysummarybyAnaesthetist',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.backtoReport = function () {
            if ($scope.Context == 'cathlabreport') {
                $state.go('app.cathlabreports');
            }
        };
        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Doctor Id',
                    field: 'DoctorId',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Doctor Name',
                    field: 'DoctorName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Qualification',
                    field: 'Qualification',
                    datatype: 'string',
                    headercls: 'td-Qualification',
                    fieldcls: 'td-Qualification'
                },
                {
                    header: 'Speciality',
                    field: 'Speciality',
                    datatype: 'string',
                    headercls: 'td-dept',
                    fieldcls: 'td-dept'
                },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.usercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.DoctorId, vm.usercontrolconfig.rowdata.DoctorName,
                    vm.usercontrolconfig.rowdata.Qualification, vm.usercontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            $scope.AnaesthesistName = result;

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [{
                    Key: 11,
                    Value: 1
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
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

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    IsCathlab: true,
                    AnaesthesistId: $scope.currentfilter.AnaesthesistId || 0,
                    AnaesthesistName: $scope.AnaesthesistName
                }
            };
            var options = {
                action: 'OtManagement/SurgeryEntry/PrintSurgerysummarybyAnaesthesist',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Doctor",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }]
                }
            }, ];

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

    cathlabsummarybyanaesthetistController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();