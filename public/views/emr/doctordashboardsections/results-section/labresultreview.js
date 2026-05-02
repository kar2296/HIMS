(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('LabResultReviewFormController', LabResultReviewFormController);

    function LabResultReviewFormController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        vm.orders = [];

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
        };
        $scope.item = {};
        $scope.currentfilter = {
            orderno: '',
            testname: '',
            DoctorId: -1,
            fromdate: '',
            todate: utl.Formatter.getCurrentDate(),
        }

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.eid = modalConfig.params.eid;
            $scope.currentcontext.pid = modalConfig.params.pid;
            $scope.currentcontext.id = modalConfig.params.id;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.eid = parseInt($stateParams.eid);
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }
        if (utl.Session.getUserTypeId() == 2) // 2=> Physician
        {
            $scope.currentfilter.DoctorId = utl.Session.getCurrentUserId();
            $scope.currentcontext.id = parseInt($stateParams.id)
            if ($stateParams.pid)
                $scope.currentcontext.pid = parseInt($stateParams.pid);
            else
                $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
            $scope.currentcontext.eid = parseInt($stateParams.eid);
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
        $scope.resultview = function (wo) {
            var inputParams = { pid: $scope.currentcontext.pid, eid: $scope.currentcontext.eid };
            utl.Modal.open('patientemr.labresultview', {
                params: inputParams
            });
        };
        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.orders = res.Data;

            prepareTestResult();
        };

        $scope.getList = function () {
            var fromdate = $filter('date')($scope.currentfilter.fromdate, 'yyyy-MM-dd 00:00:00') || null;
            var todate = $filter('date')($scope.currentfilter.todate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 6, Value: $scope.currentfilter.orderno },
                    { Key: 9, Value: 1 }, // testtype = lab
                    { Key: 12, Value: $scope.currentfilter.fromdate },
                    { Key: 13, Value: $scope.currentfilter.todate },
                    { Key: 10, Value: $scope.currentfilter.DoctorId },
                    { Key: 23, Value: $scope.currentfilter.TestName },
                    { Key: 22, Value: "7,8,9" } // includeWOStatus Approved and Released
                ]
            };
            if (utl.Session.getUserTypeId() == 2)
                inputData.Params.push({ Key: 0, Value: $scope.currentcontext.id });
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
                        if (item.QualifierId == 1)
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
            $state.go('app.labresultreviews');
        }
        $scope.reviewlist = function () {
            $scope.saveItem();
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('Order Reviewed Successfully'));
            $scope.backtoList();
        };
        $scope.saveItem = function () {
            //Check Mandatory values
            var lines = getLinesForSave();
            var actionName = 'emr/patientorder/AddPatientOrder';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/patientorder/UpdatePatientOrderReview';
            }
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        function getLinesForSave() {
            var result = [];
            for (var idx in vm.orders) {
                var item = vm.orders[idx];
                item.PatientId = item.PatientId;
                item.OrderStatusId = item.OrderStatusId;
                item.ReviewStatusId = 1;
                if (item.Id > 0) {
                    $scope.item.ReviewStatusId = item.ReviewStatusId;
                    $scope.item.Id = item.Id
                }
                for (var iddx in item.PatientOrderDetails) {
                    var details = item.PatientOrderDetails[iddx]
                }
                if (details.TestId > -1 && details.Status == 1) {
                    result.push(details);
                }
            }
            return result;
        }
        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.eid
            };
            var options = {
                action: 'emr/patientorder/PrintPatientOrder',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.print1 = function () {
            var inputData = {
                eid: $scope.currentcontext.eid
            };
            var options = {
                action: 'emr/patientorder/PrintPatientOrders',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $('#order').focus();
        //Lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getDetails();
        }
        //back
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard', { pid: $scope.currentcontext.pid });
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

        $scope.getList();
    }

    LabResultReviewFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();