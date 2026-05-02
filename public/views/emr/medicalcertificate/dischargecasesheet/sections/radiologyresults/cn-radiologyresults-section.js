(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('discasshtcnRadiologyResultsSectionController', discasshtcnRadiologyResultsSectionController);

    function discasshtcnRadiologyResultsSectionController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        vm.orders = [];

        $scope.isSavebtnVisible = false;

        $scope.currentcontext.orders = [];

        $scope.currentcontext.woDetails = [];

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
        };

        if (utl.Session.getUserTypeId() == 2) // 2=> Physician
        {
            $scope.currentfilter.DoctorId = utl.Session.getCurrentUserId();
        }
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.eid = modalConfig.params.eid;
            $scope.currentcontext.pid = modalConfig.params.pid;
            $scope.currentcontext.cid  = modalConfig.params.cid ? parseInt(modalConfig.params.cid) : null;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.eid = parseInt($stateParams.eid);
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
            $scope.currentcontext.cid = $scope.$parent.cncontext.consultationid;
        }
        $scope.currentcontext.testList = [];

        $scope.openObservations = function (wodetail) {
            var inputParams =  { pid: $scope.currentcontext.pid, woid: -1, readonly: true };
            if(wodetail && wodetail.Id) {
                inputParams.wodid = wodetail.Id;
            }

            utl.Modal.open('app.woobservations', {
                params: inputParams
            });
        };

        $scope.openAttachments = function(wodetail) {
            var inputParams =  { pid: $scope.currentcontext.pid, woid: -1, readonly: true };
            if(wodetail && wodetail.Id) {
                inputParams.wodid = wodetail.Id;
            }

            utl.Modal.open('app.woattachments', {
                params: inputParams
            });
        };
        $scope.doctor_dashboard = function() {
            if ($scope.From == 'nursing') {
                $state.go('app.nursingdashboard');
            } else {
                $state.go('app.doctordashboard');
            }
        };
        $scope.openWOAttachments = function(wo) {
            var inputParams =  { pid: $scope.currentcontext.pid, woid: wo.Id, readonly: true };

            utl.Modal.open('app.woattachments', {
                params: inputParams
            });
        };

        $scope.saveItem = function () {
            if ($scope.currentcontext.eid && $scope.currentcontext.cid &&
                $scope.currentcontext.pid) {
                var options = {
                    action: 'emr/patientorder/UpdateLabConsultationNote',
                    data: { Data: $scope.currentcontext },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        };

        $scope.backToList = function () {
            $state.go('patientemr.dischargecasesheets', { pid: $scope.currentcontext.pid });
        };


        //getList
        $scope.getListCallback = function(scope, res, options, hasError) {
            $scope.currentcontext.orders = [];
            vm.orders = res.Data;
            $scope.currentcontext.orders = res.Data;
            $scope.isSavebtnVisible = false;
            prepareTestResult();
            if ($scope.currentcontext.orders && $scope.currentcontext.orders.length > 0) {
                var isfirstorder = $scope.currentcontext.orders[0];
                if (isfirstorder && isfirstorder.EncounterTypeId
                    && isfirstorder.EncounterTypeId == 2) $scope.isSavebtnVisible = true;
            }
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    //{ Key: 21, Value:  $scope.currentcontext.cid },
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 18, Value: $scope.currentcontext.eid },
                    { Key: 9, Value: 2 }, // testtype = lab
                    { Key: 22, Value: "7,8,9" } // includeWOStatus Approved and Released
                ]
            };

            var options = {
                action: 'emr/patientorder/GetPatientOrderWithoutDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        function prepareTestResult() {
            for(var jdx in vm.orders) {
                for(var kdx in vm.orders[jdx].PatientWorkorders) {

                    var result = vm.orders[jdx].PatientWorkorders[kdx].PatientWorkorderdetails;
                    var testArr = [];
                    var tabIndex = 0;
                    var profileName = "";
                    var rootProfileName = "";
                    for (var idx in result) {
                        var item = result[idx];

                        var found = testArr.find(function(t) {
                            return t.Testname == item.Testname;
                        });
                        if (!found) {
                            found = { Testid: item.Testid, Testname: item.Testname, details: [], TestDisplayOrder: item.TestDisplayOrder };
                            if (profileName != item.ProfileName) {
                                profileName = item.ProfileName;
                                found.ProfileName = profileName;
                            }
                            if ( rootProfileName != item.RootProfileName) {
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


            $scope.currentcontext.woDetails = [];
            for (var jdx in vm.orders) {
                for (var kdx in vm.orders[jdx].PatientWorkorders) {
                    var workorder = vm.orders[jdx].PatientWorkorders[kdx];
                    var woDetailres = vm.orders[jdx].PatientWorkorders[kdx].woDetails;
                    for (var idx in woDetailres) {
                        var test = woDetailres[idx];
                        $scope.currentcontext.woDetails.push(test);
                        var ApprovalSubmisdate = workorder.ApprovalSubmisdate;
                        var heading = "";
                        if (test.RootProfileName) {
                            if (!heading) heading += test.RootProfileName;
                            else heading += "/" + test.RootProfileName;
                        }
                        if (test.ProfileName) {
                            if (!heading) heading += test.ProfileName;
                            else heading += "/" + test.ProfileName;
                        }
                        if (test.details.length > 0) {
                            if (!(test.details.length == 1 && test.Testname.toLowerCase() == test.details[0].Analytename.toLowerCase())) {
                                if (!heading) heading += test.Testname;
                                else heading += "/" + test.Testname;
                            }
                        }
                        for (var idxdtls in test.details) {
                            test.details[0].ApprovalSubmisdate = ApprovalSubmisdate;
                            test.details[0].heading = heading;
                            break;
                        }

                        var testdetails =  test.details;
                        test.details = [];
                        for (var idxdtls in testdetails) {
                            if(testdetails[idxdtls].Resultvalue) {
                                if(testdetails[idxdtls].Resultvalue.length > 0) {
                                    test.details.push(testdetails[idxdtls]);
                                }
                            }
                        }

                    }
                }
            }


        }

            //Lookup
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getDetails();
        }

        $scope.initLookup = function() {
            var inputData = [];

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

    discasshtcnRadiologyResultsSectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();