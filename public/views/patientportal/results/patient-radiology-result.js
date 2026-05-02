(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientRadiologyResultController', patientRadiologyResultController);

    function patientRadiologyResultController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        vm.items = [];

        $scope.currentcontext = {
            pid: parseInt(utl.Session.getPatientPortalPatientId())
        };

        $scope.currentfilter = {
            orderno: '',
            testname: '',
            FromDate: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            ToDate: utl.Formatter.getCurrentDate()
        }

        $scope.currentcontext.testList = [];

        $scope.openObservations = function (wodetail) {
            var inputParams = { pid: $scope.currentcontext.pid, woid: -1, readonly: true };
            if (wodetail && wodetail.Id) {
                inputParams.wodid = wodetail.Id;
            }

            utl.Modal.open('app.woobservations', {
                params: inputParams
            });
        };

        $scope.openAttachments = function (wodetail) {
            var inputParams = { pid: $scope.currentcontext.pid, woid: -1, readonly: true };
            if (wodetail && wodetail.Id) {
                inputParams.wodid = wodetail.Id;
            }

            utl.Modal.open('app.woattachments', {
                params: inputParams
            });
        };

        $scope.openWOAttachments = function (wo) {
            var inputParams = { pid: $scope.currentcontext.pid, woid: wo.Id, readonly: true };

            utl.Modal.open('app.woattachments', {
                params: inputParams
            });
        };

        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.orders = [];
            vm.orders = res.Data;

            prepareTestResult();
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    //{ Key: 4, Value: '11' }, //orderstatus = completed
                    { Key: 6, Value: $scope.currentfilter.orderno },
                    { Key: 9, Value: 2 }, // testtype = radiology 
                    // { Key: 12, Value: $scope.currentfilter.fromdate },
                    // { Key: 13, Value: $scope.currentfilter.todate },
                    {
                        Key: 12,
                        Value: From
                    },
                    {
                        Key: 13,
                        Value: To
                    },
                    { Key: 22, Value: "7,8" }
                ]
            };

            var options = {
                action: 'emr/patientorder/GetPatientOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        function prepareTestResult() {
            for (var jdx in vm.orders) {
                for (var kdx in vm.orders[jdx].PatientWorkorders) {

                    var result = vm.orders[jdx].PatientWorkorders[kdx].PatientWorkorderdetails;
                    var testArr = [];
                    var tabIndex = 0;
                    var profileName = "";
                    var rootProfileName = "";
                    for (var idx in result) {
                        var item = result[idx];

                        var found = testArr.find(function (t) {
                            return t.Testname == item.Testname;
                        });
                        if (!found) {
                            found = { Testid: item.Testid, Testname: item.Testname, details: [], TestDisplayOrder: item.TestDisplayOrder };
                            if (profileName != item.ProfileName) {
                                profileName = item.ProfileName;
                                found.ProfileName = profileName;
                            }
                            if (rootProfileName != item.RootProfileName) {
                                rootProfileName = item.RootProfileName;
                                found.RootProfileName = rootProfileName;
                            }
                            testArr.push(found);
                        }
                        item.tabIndex = tabIndex++;
                        found.details.push(item);
                    }

                    //Sorting by test and analyte displayorder
                    testArr = $filter('sortArrayItems')(testArr, [
                        { name: 'TestDisplayOrder', direction: 'asc', priority: 1, type: 'int' }
                    ]);

                    for (var idx in testArr) {
                        var item = testArr[idx];
                        item.details = $filter('sortArrayItems')(item.details, [
                            { name: 'AnalyteDisplayOrder', direction: 'asc', priority: 1, type: 'int' }
                        ]);
                    }

                    vm.orders[jdx].PatientWorkorders[kdx].woDetails = testArr;
                }
            }
        }




        $scope.records = function () {
            $state.go('patientportal.myhealthrecord');
        }
        $scope.back = function () {
            $state.go('patientportal.portalmyhealthrecord');
        }
        $scope.Home = function () {
            $state.go('patientportal.virtualhealthcare');
        }

        //Lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getDetails();
        }

        $scope.initLookup = function () {
            var inputData = [
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.getList();
    }

    patientRadiologyResultController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();   