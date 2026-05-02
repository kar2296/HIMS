(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('LabManualResViewController', LabManualResViewController);

    function LabManualResViewController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        vm.orders = [];

        $scope.currentcontext = {};

        $scope.currentfilter = {
            orderno: '',
            testname: '',
            fromdate: utl.Formatter.getCurrentDate(),
            todate: utl.Formatter.getCurrentDate()
        }

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = modalConfig.params.id;
            $scope.currentcontext.wid = modalConfig.params.wid;
            $scope.currentcontext.pid = modalConfig.params.pid;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.currentcontext.testList = [];

        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.orders = res.Data;
            $scope.getDetails();
            // prepareTestResult();
        };
        // $scope.certificate = function (item) {
        //     $state.go('patientportal.labcertificate', {
        //         id: $scope.currentcontext.id,
        //         woid: $scope.currentcontext.wid
        //     });
        // };
        $scope.certificate = function(item) {
            $state.go('patientportal.labcertificate', {
                woid: $scope.currentcontext.id
            });
        }
        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        $scope.getList = function () {
            var fromdate = $filter('date')($scope.currentfilter.fromdate, 'yyyy-MM-dd 00:00:00') || null;
            var todate = $filter('date')($scope.currentfilter.todate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.wid },
                    // { Key: 2, Value: $scope.currentcontext.pid },
                    // { Key: 4, Value: '11' },
                    // { Key: 9, Value: 1 }, // testtype = lab 
                    // { Key: 12, Value: fromdate },
                    // { Key: 13, Value: todate },
                    // {
                    //     Key: 22,
                    //     Value: [4, 5, 7, 8, 9]
                    // } // includeWOStatus Approved and Released
                ]
            };

            var options = {
                action: 'lis/patientworkorder/GetVirtualPatientWorkorders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getDetailsCallback = function (scope, res, options, hasError) {
            var result = res.Data;
            for (var idx in vm.orders) {
                var item = vm.orders[idx];
                item.PatientWorkorderdetails = result;
                vm.orders = [];
                vm.orders.push(item);
            }
            prepareTestResult();
        };


        $scope.getDetails = function (pageNo) {
            if ($scope.currentcontext.wid && $scope.currentcontext.wid > 0) {
                var inputData = {
                    Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.wid
                    }],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'lis/patientworkorderdetails/GetPatientWorkorderdetailss',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };

        function prepareTestResult() {
            for (var jdx in vm.orders) {
                //                 for (var kdx in vm.orders[jdx]) {

                var result = vm.orders[jdx].PatientWorkorderdetails;
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

                vm.orders[jdx].woDetails = testArr;
                $scope.currentcontext.testList = testArr;
            }
            //             }
        }

        $scope.print = function () {

            var selectedTestList = "";
            var selectedTestArr = [];
            for (var idx in $scope.currentcontext.testList) {
                var test = $scope.currentcontext.testList[idx];
                // if (test.IsSelected == true) {
                selectedTestArr.push(test.Testid)
                // }
            }
            var inputData = {
                Id: $scope.currentcontext.wid
            };

            if (selectedTestArr.length > 0) {
                selectedTestList = selectedTestArr.join(',');
                inputData.Data = {
                    selectedtests: selectedTestList,
                    IsDepartment: true
                }
            }

            var options = {
                action: 'lis/patientworkorder/PrintVirtualPatientWorkorder',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }


        //Lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getDetails();
        }

        $scope.initLookup = function () {
            var inputData = [];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }
        $scope.back = function () {
            $state.go('patientportal.virtualhealthcare');
        }
        $scope.Home = function () {
            $state.go('patientportal.virtualhealthcare');
        }

        $scope.getList();
    }

    LabManualResViewController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();