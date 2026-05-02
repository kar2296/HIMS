(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('radiologyResultspluginController', radiologyResultspluginController);

    function radiologyResultspluginController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};
        $scope.item.DataTemplate = '';

        $scope.currentcontext = {};

        $scope.currentcontext.ismodal = modalConfig && modalConfig.params ? true : false;

        $scope.currentfilter = {
            orderno: '',
            testname: '',
            fromdate: '',
            todate: utl.Formatter.getCurrentDate(),
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.eid = modalConfig.params.eid;
            $scope.currentcontext.pid = modalConfig.params.pid;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.eid = parseInt($stateParams.eid);
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }
        $scope.currentcontext.testList = [];


        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.orders = res.Data;
            prepareTestResult();
            $scope.LABResultView();
        };

        $scope.LABResultView = function () {
            for (var ordidx in vm.orders) {
                var order = vm.orders[ordidx];
                for (var patordidx in order.PatientWorkorders) {
                    var wo = order.PatientWorkorders[patordidx];
                    $scope.item.DataTemplate += "<style> .page-header {margin: 0px 0px 2px 0px !important;}.fontctrl {color: #ffffff;text-shadow: 0 1px 1px #194B7E;}.wobanner {background-color: #597A9A }.calender_align ul {left: -6px !important;}#patientlabresult {overflow-x: hidden;}.icon_emrboard {width: 5%;float: right;margin-right: 1%;margin-left: 1%;}.icon_home {width: 5%;float: right;}.btn-rounded {width: 33px;height: 24px;font-size: 16px !important;}#print .dropdown-menu {top: initial;margin-bottom: 6px;bottom: 100%;background-color: #1e7d9a !important;left: -41px;min-width: 160px;}#print .dropdown-menu>li {border-bottom: 1px solid #fff;}#print .dropdown-menu>li>a {color: #000000 !important;}#print .top>li {margin-bottom: 0px !important;}.dropdown-menu>li>a:hover, .dropdown-menu>li>a:focus {background-color: #ad1414 !important;text-decoration: none;color: #fff;}#print .dropdown-menu {top: initial;bottom: 100%;background-color: transparent;border: none;box-shadow: none;background-clip: none;}#print .top>li {margin-bottom: 5px;}#workorder {min-height: auto;}</style>";
                    $scope.item.DataTemplate += "<div>";
                    $scope.item.DataTemplate += "<div class='col-sm-12 fontctrl wobanner'>";
                    $scope.item.DataTemplate += "<span>";
                    if (wo.Orderedby && wo.Orderedby.Title && wo.Orderedby.Title.Description) {
                        $scope.item.DataTemplate += "<strong>" + wo.Orderedby.Title.Description + " </strong>";
                    } if (wo.Orderedby && wo.Orderedby.FirstName) {
                        $scope.item.DataTemplate += " <strong>" + wo.Orderedby.FirstName + " </strong> | ";
                    }
                    $scope.item.DataTemplate += " </span> ";

                    if (wo.Orderedby && wo.Department.DepartmentName) {
                        $scope.item.DataTemplate += "<span>";
                        $scope.item.DataTemplate += "<strong class='mrn-highlight'>" + wo.Department.DepartmentName + "</strong> |</span>";
                    }
                    if (wo.ApprovalSubmisdate) {
                        $scope.item.DataTemplate += "<span>";
                        $scope.item.DataTemplate += wo.ApprovalSubmisdate + " |</span>";
                    }

                    $scope.item.DataTemplate += "<span>";
                    if (wo.ApprovedUser && wo.ApprovedUser.Title && wo.ApprovedUser.Title.Description) {
                        $scope.item.DataTemplate += "<strong>" + wo.ApprovedUser.Title.Description;
                    } if (wo.ApprovedUser && wo.ApprovedUser.FirstName) {
                        $scope.item.DataTemplate += "" + wo.ApprovedUser.FirstName + "</strong> |</span>";
                    }

                    $scope.item.DataTemplate += "</div>";
                    $scope.item.DataTemplate += "</div>";
                    $scope.item.DataTemplate += "<table class='table table-hover table-responsive table-bordered'>";
                    $scope.item.DataTemplate += "<thead class='bg-subhead'>";
                    $scope.item.DataTemplate += "<tr>";
                    $scope.item.DataTemplate += "<th class='col-sm-2'>";
                    $scope.item.DataTemplate += "<span>" + $translate.instant('ordermanagement.labresult-list.observation.lbl') + "</span>";
                    $scope.item.DataTemplate += "</th>";
                    $scope.item.DataTemplate += "<th class='col-sm-2'>";
                    $scope.item.DataTemplate += "<span>" + $translate.instant('ordermanagement.labresult-list.result.lbl') + "</span>";
                    $scope.item.DataTemplate += "<span class='mandatory-asterix'>*</span>"
                    $scope.item.DataTemplate += "</th>";
                    $scope.item.DataTemplate += "</tr>";
                    $scope.item.DataTemplate += "</thead>";

                    for (var idx2 in wo.woDetails) {
                        var test = wo.woDetails[idx2];
                        $scope.item.DataTemplate += "<tbody>";
                        if (test.RootProfileName) {
                            $scope.item.DataTemplate += "<tr>";
                            $scope.item.DataTemplate += "<td colspan='9'>";
                            $scope.item.DataTemplate += "<span class='lbl-profile'>" + test.RootProfileName + "</span>";
                            $scope.item.DataTemplate += "</td>";
                            $scope.item.DataTemplate += "</tr>";
                        } if (test.ProfileName) {
                            $scope.item.DataTemplate += "<tr>";
                            $scope.item.DataTemplate += "<td colspan='9'>";
                            $scope.item.DataTemplate += "<span class='lbl-profile'>" + test.ProfileName + "</span>";
                            $scope.item.DataTemplate += "</td>";
                            $scope.item.DataTemplate += "</tr>";
                        } if (test.details.length == 1 && test.Testname.toLowerCase() == test.details[0].Analytename.toLowerCase()) {
                            $scope.item.DataTemplate += "<tr>";
                            $scope.item.DataTemplate += "<td colspan='9'>";
                            $scope.item.DataTemplate += "<span class=' btn btn-primary btn-xs'>" + test.Testname + "</span>";
                            $scope.item.DataTemplate += "</td>";
                            $scope.item.DataTemplate += "</tr>";
                        }
                        for (var idx3 in test.details) {
                            var item = test.details[idx3];
                            if (item.Status == 1) {
                                $scope.item.DataTemplate += "<tr>";
                                $scope.item.DataTemplate += "<td>";
                                $scope.item.DataTemplate += "<span style='margin-left:24px;  vertical-align: super; color: #0dbef1; font-weight: ";
                                $scope.item.DataTemplate += "bold; white-space: nowrap; text-overflow: ellipsis; overflow: auto;'>" + item.Analytename + "</span>";
                                $scope.item.DataTemplate += "</td>";
                                $scope.item.DataTemplate += "<td>";
                                if (item.Resultvalue) $scope.item.DataTemplate += "<span>" + item.Resultvalue + "</span>";
                                else $scope.item.DataTemplate += "<span> </span>";
                                $scope.item.DataTemplate += "</tr>";
                            }
                        }
                        $scope.item.DataTemplate += "</tbody>";
                    }
                    $scope.item.DataTemplate += "</table>";
                }
            }
        };

        $scope.getList = function () {
            var fromdate = $filter('date')($scope.currentfilter.fromdate, 'yyyy-MM-dd 00:00:00') || null;
            var todate = $filter('date')($scope.currentfilter.todate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    //{ Key: 4, Value: '11' }, //orderstatus = completed
                    { Key: 6, Value: $scope.currentfilter.orderno },
                    { Key: 9, Value: 2 }, // testtype = radiology
                    { Key: 12, Value: $scope.currentfilter.fromdate },
                    { Key: 23, Value: $scope.currentfilter.TestName },
                    { Key: 13, Value: $scope.currentfilter.todate },
                    { Key: 22, Value: [4, 5, 7, 8, 9] } // includeWOStatus Approved and Released
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


        $scope.backToList = function () {
            $scope.cancelCallback();
        };

        $scope.saveItem = function () {
            if ($scope.currentcontext.ismodal) {
                var title = '<h4>' + $translate.instant('ordermanagement.radiologyresult-list.pagetitle.lbl') + ' </h4>';
                $scope.confirmCallback({ data: (title +"<br/>"+$scope.item.DataTemplate) });
            }
        };



        $scope.getList();
    }

    radiologyResultspluginController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();