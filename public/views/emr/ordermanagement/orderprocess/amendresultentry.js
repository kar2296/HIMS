(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('AmendresultEntryFormController', AmendresultEntryFormController);

    function AmendresultEntryFormController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        $scope.item = {};
        vm.details = [];
        $scope.AttachementImgs = [];
        $scope.item.isExternal = false;
        $scope.item.isExternaldisaled = false;
        $scope.IsDisabled = false;
        $scope.currentcontext = {};
        $scope.currentcontext.CanSave = utl.Privilege.hasPrivilege('CanSave')
        $scope.currentcontext.CanLOPSendForApproval = utl.Privilege.hasPrivilege('CanLOPSendForApproval')
        $scope.currentcontext.CanROPSendForApproval = utl.Privilege.hasPrivilege('CanROPSendForApproval')
        $scope.currentcontext.CanEOPSendForApproval = utl.Privilege.hasPrivilege('CanEOPSendForApproval')
        $scope.currentcontext.CanPrint = utl.Privilege.hasPrivilege('CanPrint')
        $scope.currentcontext.CanLOPDepartment = utl.Privilege.hasPrivilege('CanLOPDepartment')
        $scope.currentcontext.CanROPDepartment = utl.Privilege.hasPrivilege('CanROPDepartment')
        $scope.currentcontext.CanLOPComments = utl.Privilege.hasPrivilege('CanLOPComments')
        $scope.currentcontext.CanROPComments = utl.Privilege.hasPrivilege('CanROPComments')
        $scope.currentcontext.CanLOPAttachment = utl.Privilege.hasPrivilege('CanLOPAttachment')
        $scope.currentcontext.CanROPAttachment = utl.Privilege.hasPrivilege('CanROPAttachment')
        $scope.currentcontext.CanLAPReject = utl.Privilege.hasPrivilege('CanLAPReject')
        $scope.currentcontext.CanRAPReject = utl.Privilege.hasPrivilege('CanRAPReject')
        $scope.currentcontext.CanApprove = utl.Privilege.hasPrivilege('CanApprove')
        $scope.currentcontext.CanLAPPrint = utl.Privilege.hasPrivilege('CanLAPPrint')
        $scope.currentcontext.CanBiochemistry = utl.Privilege.hasPrivilege('CanBiochemistry')
        $scope.currentcontext.CanPathology = utl.Privilege.hasPrivilege('CanPathology')
        $scope.currentcontext.CanMicrobiology = utl.Privilege.hasPrivilege('CanMicrobiology')
        $scope.currentcontext.CanLOPPrint = utl.Privilege.hasPrivilege('CanLOPPrint')
        $scope.currentcontext.CanOPBiochemistry = utl.Privilege.hasPrivilege('CanOPBiochemistry')
        $scope.currentcontext.CanOPPathology = utl.Privilege.hasPrivilege('CanOPPathology')
        $scope.currentcontext.CanOPMicrobiology = utl.Privilege.hasPrivilege('CanOPMicrobiology')
        $scope.currentcontext.CanPrintERCP = utl.Privilege.hasPrivilege('CanPrintERCP')
        // $scope.currentcontext.CanE_Save = utl.Privilege.hasPrivilege('CanE_Save')
        // $scope.currentcontext.CanE_Approve = utl.Privilege.hasPrivilege('CanE_Approve')
        // $scope.currentcontext.CanE_Reject = utl.Privilege.hasPrivilege('CanE_Reject')
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.testtypeid = parseInt($stateParams.testtypeid);
        $scope.currentcontext.parent = $stateParams.pt;
        $scope.currentfilter = {};
        $scope.currentfilter.filter_from = $stateParams.filter_from;
        $scope.currentfilter.filter_to = $stateParams.filter_to;
        $scope.currentfilter.filter_workorderid = $stateParams.filter_workorderid;
        $scope.currentfilter.filter_orderbyid = $stateParams.filter_orderbyid;
        $scope.currentfilter.filter_dept = $stateParams.filter_dept;
        $scope.currentfilter.filter_ward = $stateParams.filter_ward;
        $scope.currentfilter.filter_guarantor = $stateParams.filter_guarantor;
        $scope.currentfilter.filter_guarantortype = $stateParams.filter_guarantortype;
        $scope.currentfilter.filter_workorderstatus = $stateParams.filter_workorderstatus;
        $scope.currentfilter.filter_labassigntype = $stateParams.filter_labassigntype;
        $scope.currentfilter.filter_patientname = $stateParams.filter_patientname;
        $scope.currentfilter.filter_wostatus = $stateParams.filter_wostatus;
        $scope.currentcontext.context = $stateParams.context;
        $scope.currentcontext.parentpage = $translate.instant('ordermanagement.resultentry-form.myorderprocess.lbl');
        if (isFromApproval()) {
            $scope.currentcontext.parentpage = $translate.instant('ordermanagement.resultentry-form.myresultapproval.lbl');
        }
        if ($scope.currentcontext.testtypeid == 1) { //lab
            $scope.currentcontext.deptcode = 8;
        } else if ($scope.currentcontext.testtypeid == 2) { //radiology
            $scope.currentcontext.deptcode = 62;
        } else if ($scope.currentcontext.testtypeid == 4) { //endoscopy
            $scope.currentcontext.deptcode = 60;
        }
        function isFromApproval() {
            return $scope.currentcontext.parent == 'myapproval';
        }

        $scope.CanShowSendForApproval = function () {
            return !isFromApproval();
        }

        $scope.CanShowApprovalArea = function () {
            return isFromApproval();
        }

        $scope.CanDisableApproveRejectButton = function () {
            if (this.item.WorkOrderStatusId == 6 || this.item.WorkOrderStatusId == 7 || this.item.WorkOrderStatusId == 8)
                $scope.IsDisabled = true;
            //REJECTED, APPROVED, RELEASED
        }

        $scope.CanShowLISTable = function () {
            return $scope.item.TestTypeId == 1;
            $scope.currentcontext.deptcode = 8;
        }

        $scope.CanShowRISTable = function () {
            return ($scope.item.TestTypeId == 2 || $scope.item.TestTypeId == 3);
            $scope.currentcontext.deptcode = 62;
        }
        $scope.CanShowEndoscopyTable = function () {
            return ($scope.item.TestTypeId == 4);
            $scope.currentcontext.deptcode = 60;
        }

        $scope.currentcontext.testList = [];

        $scope.getformulajson = function (item) {
            var result = {};
            for (var idx in vm.details) {
                var detail = vm.details[idx];
                if (detail.AnalyteCode) {
                    result[detail.AnalyteCode] = detail.Resultvalue;
                } else if (detail.Analyte) {
                    result[detail.Analyte.Code] = detail.Resultvalue;
                }
            }
            return result;
        }

        $scope.testvaluechange = function (item) {

            //Automatically select Test checkbox
            for (var idx in $scope.currentcontext.testList) {
                var test = $scope.currentcontext.testList[idx];
                if (test.Testid == item.Testid && item.Resultvalue) {
                    test.IsSelected = true;
                    break;
                }
            }
        }
        $scope.openLabResults = function () {
            utl.Modal.open('patientemr.labresults', {
                params: { eid: $scope.item.EncounterId, pid: $scope.item.Patientid },
                confirmCallback: $scope.getList
            });

        };
        $scope.openRadiologyResults = function () {
            utl.Modal.open('patientemr.radiologyresults', {
                params: { eid: $scope.item.EncounterId, pid: $scope.item.Patientid },
                confirmCallback: $scope.getList
            });
        };
        $scope.openEndoscopyResults = function () {
            utl.Modal.open('patientemr.endoscopyresults', {
                params: { eid: $scope.item.EncounterId, pid: $scope.item.Patientid },
                confirmCallback: $scope.getList
            });
        };

        //getItem
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.item.Approvedbyid = $scope.item.Approvedbyid || -1;
            $scope.item.Patient.AgeInDays = utl.Formatter.getAgeInDaysFromDOB($scope.item.Patient.DOB);
            $scope.item.isExternal = false;
            $scope.item.isExternaldisaled = false;
            if (isFromApproval()) {
                $scope.item.ApprovalSubmisdate = $scope.item.ApprovalSubmisdate || utl.Formatter.getCurrentDate();
                $scope.item.Approvedbyid = $scope.item.Approvedbyid || utl.Session.getCurrentUserId();
            }
            $scope.item.TechValidationById = $scope.item.TechValidationById || utl.Session.getCurrentUserId();
            $scope.item.TechValidationdate = $scope.item.TechValidationdate || utl.Formatter.getCurrentDate();

            if ($scope.item.WorkOrderStatusId == 4 || $scope.item.WorkOrderStatusId == 7) {
                $scope.item.isExternal = true;
                if ($scope.item.WorkOrderStatusId == 7)
                    $scope.item.isExternaldisaled = true;
            }

            $scope.getDetails();

            $scope.getAttachementImgList();

        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'lis/patientworkorder/GetPatientWorkorderById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        function computeRefRange(detail) {
            try {
                if ($scope.item.Patient.GenderId && detail.Analyte && detail.Analyte.Analyterefmasters) { // only gender matched
                    var refmaster = detail.Analyte.Analyterefmasters;
                    detail.Analyte.Analyterefmasters = [];
                    for (var idxrfms in refmaster) {
                        var anarefmas = refmaster[idxrfms];
                        if (anarefmas.GenderId == $scope.item.Patient.GenderId &&
                            (anarefmas.Agefrom <= $scope.item.Patient.AgeInDays && $scope.item.Patient.AgeInDays <= anarefmas.Ageto))
                            detail.Analyte.Analyterefmasters.push(refmaster[idxrfms]);
                    }
                }
                if (!detail.Analyterange && detail.Analyte.Analyterefmasters && detail.Analyte.Analyterefmasters.length > 0) {
                    for (var idx in detail.Analyte.Analyterefmasters) {
                        var refRange = detail.Analyte.Analyterefmasters[idx];

                        if (refRange.GenderId == $scope.item.Patient.GenderId &&
                            (refRange.Agefrom <= $scope.item.Patient.AgeInDays && $scope.item.Patient.AgeInDays <= refRange.Ageto)) {
                            detail.Analyterange = refRange.Refvalue;
                            break;
                        }
                    }
                }
                if ($scope.CanShowRISTable()) {
                    if (detail && !detail.Resultvalue && detail.Testmaster
                        && detail.Testmaster.TestmasterTemplate) {
                        if (!detail.Resultvalue && $scope.item.Patient.GenderId == 1) {
                            detail.Resultvalue = detail.Testmaster.TestmasterTemplate.MaleDataTemplate;
                        } else if (!detail.Resultvalue && $scope.item.Patient.GenderId == 2) {
                            detail.Resultvalue = detail.Testmaster.TestmasterTemplate.FemaleDataTemplate;
                        }
                    }
                }
            } catch (ex) { console.log(ex); }
        }

        //getDetails
        $scope.getDetailsCallback = function (scope, res, options, hasError) {
            var result = res.Data;
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
                    found.RootProfileName = item.RootProfileName;
                    testArr.push(found);
                }
                computeRefRange(item);
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
            rootProfileName = '';
            for (var idx in testArr) {
                var item = testArr[idx];
                if (item.RootProfileName) {
                    if (rootProfileName != item.RootProfileName) {
                        rootProfileName = item.RootProfileName;
                    } else {
                        testArr[idx].RootProfileName = '';
                    }
                }
            }

            $scope.currentcontext.testList = testArr;
            vm.details = result;
        };

        $scope.getDetails = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.currentcontext.id }
                    ],
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

        $scope.openAttachments = function (wodetail) {
            var inputParams = { pid: $scope.item.PatientId, woid: $scope.item.Id };
            if (wodetail && wodetail.Id) {
                inputParams.wodid = wodetail.Id;
            }

            utl.Modal.open('app.woattachments', {
                params: inputParams,
                confirmCallback: $scope.getItem,
                cancelCallback: $scope.getItem
            });
        }

        $scope.historypage = function () {
            utl.Modal.open('app.patientorderhistory', {
                params: { id: 0, pid: $scope.item.PatientId, oid: $scope.item.Orderid },
                confirmCallback: $scope.onDetailSave
            });
        }
        $scope.testprofiledetails = function (Testid) {
            utl.Modal.open('app.testprofile', {
                params: { tid: Testid },
                confirmCallback: $scope.getList
            });
        }
        $scope.testtat = function (item) {
            utl.Modal.open('app.tatdetails', {
                params: { pid: $scope.item.PatientId, oid: $scope.item.Orderid, odid: item.Orderdetailid, tid: item.Testid },
                confirmCallback: $scope.getList
            });
        }
        $scope.analyteprofiledetails = function (Analyteid) {
            utl.Modal.open('app.analyteprofile', {
                params: { aid: Analyteid },
                confirmCallback: $scope.getList
            });
        }
        $scope.openObservations = function (wodetail) {
            var inputParams = { pid: $scope.item.PatientId, woid: $scope.item.Id };
            if (wodetail && wodetail.Id) {
                inputParams.wodid = wodetail.Id;
            }

            utl.Modal.open('app.woobservations', {
                params: inputParams,
                confirmCallback: $scope.loadData,
                cancelCallback: $scope.loadData
            });
        };

        //original print
        // $scope.originalprint = function () {
        //     var inputData = {
        //         Id: $scope.currentcontext.id,
        //         Data: {
        //             Reason: $scope.currentcontext.printreason
        //         }
        //     };
        //     var options = {
        //         action: 'lis/patientworkorder/PrintPatientWorkorder',
        //         data: inputData,
        //         type: 'post'
        //     };
        //     utl.Http.doDownload(options);
        // }
        $scope.print = function () {
            var selectedTestList = "";
            var selectedTestArr = [];
            for (var idx in $scope.currentcontext.testList) {
                var test = $scope.currentcontext.testList[idx];
                if (test.IsSelected == true) {
                    selectedTestArr.push(test.Testid)
                }
            }
            var inputData = {
                Id: $scope.currentcontext.id
            };

            if (selectedTestArr.length > 0) {
                selectedTestList = selectedTestArr.join(',');
                inputData.Data = { selectedtests: selectedTestList }
            }

            var options = {
                action: 'lis/patientworkorder/PrintExternalLab',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.print1 = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: { IsDepartment: true }
            };
            var options = {
                action: 'lis/patientworkorder/Printpathaology',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.printercp = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: { IsDepartment: true }
            };
            var options = {
                action: 'lis/patientworkorder/PrintERCP',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.print11 = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: { IsDepartment: true }
            };
            var options = {
                action: 'lis/patientworkorder/Printendoscopy',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.printmicrobiology = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: { IsDepartment: true }
            };
            var options = {
                action: 'lis/patientworkorder/Printmicrobiology',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.printpathology = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: { IsDepartment: true }
            };
            var options = {
                action: 'lis/patientworkorder/Printpathaology',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.printbiochemistry = function () {

            var selectedTestList = "";
            var selectedTestArr = [];
            for (var idx in $scope.currentcontext.testList) {
                var test = $scope.currentcontext.testList[idx];
                if (test.IsSelected == true) {
                    selectedTestArr.push(test.Testid)
                }
            }
            var inputData = {
                Id: $scope.currentcontext.id
            };

            if (selectedTestArr.length > 0) {
                selectedTestList = selectedTestArr.join(',');
                inputData.Data = { selectedtests: selectedTestList, IsDepartment: true }
            }

            var options = {
                action: 'lis/patientworkorder/PrintPatientWorkorder',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        $scope.print3 = function () {

            var inputData = {
                Id: $scope.currentcontext.id,
                Data: { IsDepartment: false }
            };
            var options = {
                action: 'lis/patientworkorder/PrintExternalLab',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.printendoscopy = function () {

            var inputData = {
                Id: $scope.currentcontext.id,
                Data: { IsDepartment: false }
            };
            var options = {
                action: 'lis/patientworkorder/Printendoscopy',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.backToList = function () {
            if (isFromApproval()) {
                $state.go('app.resultapprovaltab.approvalmyorders');
            } else {
                if ($scope.currentcontext.context == 'myorder') {
                    $state.go('app.orderprocesstab.processmyorders', {
                        tp: $scope.currentcontext.testtypeid,
                        filter_id: $scope.item.Id,
                        filter_from: $scope.currentfilter.filter_from,
                        filter_to: $scope.currentfilter.filter_to,
                        filter_workorderid: $scope.currentfilter.filter_workorderid,
                        filter_orderbyid: $scope.currentfilter.filter_orderbyid,
                        filter_dept: $scope.currentfilter.filter_dept,
                        filter_ward: $scope.currentfilter.filter_ward,
                        filter_guarantor: $scope.currentfilter.filter_guarantor,
                        filter_guarantortype: $scope.currentfilter.filter_guarantortype,
                        filter_workorderstatus: $scope.currentfilter.filter_workorderstatus,
                        filter_labassigntype: $scope.currentfilter.filter_labassigntype,
                        filter_orderdate: $scope.currentfilter.filter_orderdate,
                        filter_patientname: $scope.currentfilter.filter_patientname,
                        filter_wostatus: $scope.currentfilter.filter_wostatus,
                    });
                }
                if ($scope.currentcontext.context == 'allorder') {
                    $state.go('app.orderprocesstab.processallorders', {
                        tp: $scope.currentcontext.testtypeid,
                        filter_id: $scope.item.Id,
                        filter_from: $scope.currentfilter.filter_from,
                        filter_to: $scope.currentfilter.filter_to,
                        filter_workorderid: $scope.currentfilter.filter_workorderid,
                        filter_orderbyid: $scope.currentfilter.filter_orderbyid,
                        filter_dept: $scope.currentfilter.filter_dept,
                        filter_ward: $scope.currentfilter.filter_ward,
                        filter_guarantor: $scope.currentfilter.filter_guarantor,
                        filter_guarantortype: $scope.currentfilter.filter_guarantortype,
                        filter_workorderstatus: $scope.currentfilter.filter_workorderstatus,
                        filter_orderdate: $scope.currentfilter.filter_orderdate,
                        filter_patientname: $scope.currentfilter.filter_patientname,
                        filter_wostatus: $scope.currentfilter.filter_wostatus,
                    });
                }
                if ($scope.currentcontext.context == 'otherorder') {
                    $state.go('app.orderprocesstab.processotherfacilityorders', {
                        tp: $scope.currentcontext.testtypeid,
                        filter_id: $scope.item.Id,
                        filter_from: $scope.currentfilter.filter_from,
                        filter_to: $scope.currentfilter.filter_to,
                        filter_workorderid: $scope.currentfilter.filter_workorderid,
                        filter_orderbyid: $scope.currentfilter.filter_orderbyid,
                        filter_dept: $scope.currentfilter.filter_dept,
                        filter_ward: $scope.currentfilter.filter_ward,
                        filter_guarantor: $scope.currentfilter.filter_guarantor,
                        filter_guarantortype: $scope.currentfilter.filter_guarantortype,
                        filter_workorderstatus: $scope.currentfilter.filter_workorderstatus,
                        filter_orderdate: $scope.currentfilter.filter_orderdate,
                        filter_patientname: $scope.currentfilter.filter_patientname,
                        filter_wostatus: $scope.currentfilter.filter_wostatus,
                    });
                }
            }
        }

        $scope.confirmSendForApproval = function () {
            $scope.item.WorkOrderStatusId = 5; //SEND FOR APPROVAL
            $scope.saveItem(false);
        }
        $scope.sendForApproval = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'ordermanagement.resultentry-form.confirmsendapproval.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.confirmSendForApproval,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.confirmApproveOrder = function () {
            $scope.item.WorkOrderStatusId = 7; //Approved
            $scope.saveItem(true, 'approve');
        }
        $scope.approveOrder = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'ordermanagement.resultentry-form.confirmapproval.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.confirmApproveOrder,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }


        $scope.confirmsaveOrder = function () {
            $scope.item.WorkOrderStatusId = 1; //save
            $scope.saveItem(true);
        }
        $scope.saveOrder = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'ordermanagement.resultentry-form.confirmsave.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.confirmsaveOrder,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.ConfirmRejectOrder = function () {
            $scope.item.WorkOrderStatusId = 6; //Rejected
            $scope.saveItem(false);
        }

        $scope.rejectOrder = function (item) {
            utl.Modal.open('app.rejectreason', {
                params: { pid: $scope.item.PatientId, oid: $scope.item.Orderid, odid: item.Orderdetailid, tid: item.Testid },
                confirmCallback: $scope.ReasonSave
            });
            $scope.ReasonSave = function (itemFromModal) {
                $scope.item.Reason = itemFromModal.Reason;
                $scope.ConfirmRejectOrder();
            }
            // if (!$scope.item.Reason) {
            //     utl.Alert.showErrorMsg($translate.instant('ordermanagement.resultentry-form.enterrejectcomments.lbl'));
            //     return false;
            // }

            // var confirmOptions = {
            //     headingKey: 'common.confirm-modal-header.lbl',
            //     messageKey: 'ordermanagement.resultentry-form.rejectorder.lbl',
            //     yesKey: 'common.yeskey.lbl',
            //     noKey: 'common.nokey.lbl',
            //     onSuccessMethod: $scope.ConfirmRejectOrder,
            // };
            // utl.Dialog.confirmMessage(confirmOptions);
        }



        //save item
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.CanDisableApproveRejectButton();
            loadData();
        };

        $scope.saveItem = function (computeStatus, actionType) {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            if (checkMandatoryFields()) {

                $scope.item.TechValidationByName = utl.Lookup.getDesc($scope.lookup.User, $scope.item.TechValidationById);
                if ($scope.item.Approvedbyid > 0) {
                    $scope.item.MedValidationById = $scope.item.Approvedbyid;
                    $scope.item.MedValidationByName = utl.Lookup.getDesc($scope.lookup.User, $scope.item.Approvedbyid);
                    $scope.item.Approvedbyname = utl.Lookup.getDesc($scope.lookup.User, $scope.item.Approvedbyid);
                    $scope.item.MedValidationdate = $scope.item.ApprovalSubmisdate || utl.Formatter.getCurrentDate();
                }

                var actionName = 'lis/patientworkorder/ManagePatientWorkOrder';
                $scope.currentcontext.linesWithValues = 0;
                var lines = getLinesForSave();

                if ($scope.item.ExternalProviderId && $scope.item.isExternal && $scope.item.AttachmentsCount) {
                    $scope.currentcontext.linesWithValues = 0;
                }

                if (computeStatus) {
                    if ($scope.currentcontext.linesWithValues <= 0) {
                        if (actionType == 'approve') {
                            $scope.item.WorkOrderStatusId = 7; //APPROVED
                        } else {
                            $scope.item.WorkOrderStatusId = 4; //COMPLETED
                        }

                    } else {
                        if (actionType == 'approve') {
                            $scope.item.WorkOrderStatusId = 9; //PARTIALLY APPROVED
                        } else {
                            $scope.item.WorkOrderStatusId = 3; //PARTIALLY COMPLETED
                        }
                    }
                }

                var inputData = { Header: $scope.item, Details: lines };

                var options = {
                    action: actionName,
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        function checkMandatoryFields() {
            var activeRecords = $filter('filterArrayItems')(vm.details, [
                { search: 1, fields: ['Status'] }
            ]);

            /*for(var idx in activeRecords) {
                var item = activeRecords[idx];
                if(!item.Resultvalue || item.Detailsstatus == -1) {
                    utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                    return false;
                }
            }
            */

            return true;
        }

        function getLinesForSave() {
            var result = [];
            var groupedData = _.groupBy(vm.details, 'Testid');
            for (var testidgp in groupedData) {
                var iAtleastOneValue = 0;
                for (var idx in vm.details) {
                    var item = vm.details[idx];
                    if (testidgp == item.Testid) {
                        if (item.Resultvalue && item.Resultvalue != '') {
                            iAtleastOneValue++;
                            item.TechValidationId = $scope.item.TechValidationById;
                            item.TechValidationName = $scope.item.TechValidationByName;
                            item.TechValidationdate = $scope.item.TechValidationdate;
                            item.QualifierId = item.QualifierId;
                            item.Qualifier = item.Qualifier;
                            if ($scope.item.Approvedbyid > 0) {
                                item.MedValidationById = $scope.item.Approvedbyid;
                                item.MedValidationByName = $scope.item.MedValidationByName;
                                item.MedValidationdate = $scope.item.ApprovalSubmisdate || utl.Formatter.getCurrentDate();
                                item.QualifierId = item.QualifierId;
                                item.Qualifier = item.Qualifier;
                            }
                            item.WorkOrderDetailStatusId = 4; //Completed
                        }
                        result.push(item);
                    }
                }
                if (iAtleastOneValue == 0)
                    $scope.currentcontext.linesWithValues += 1;
            }
            return result;
        }



        function loadData() {
            $scope.getItem();
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $('#mySidenav').addClass('hidden');
            loadData();
        }

        $scope.initLookup = function () {
            var inputData = [
                // { "Key": "Doctor", Request: { Params: [{ Key: 6, Value: 8 }, { Key: 3, Value: 2 }] } },
                { "Key": "User", Request: { Params: [{ Key: 6, Value: $scope.currentcontext.deptcode }] } },
                { "Key": "ResultStatus" },
                { "Key": "ANALYTEUOM" },
                { "Key": "Qualifier" },
                { "Key": "LabIncharge" },
                { "Key": "RadiologyIncharge" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        /* Start -- Attachment Images */

        function removeFloatingNav(flag) { // Side bar Close
            $rootScope.app.layout.isCollapsed = flag;
        }

        $scope.openNav = function () {
            if ($('#mySidenav').hasClass('hidden')) {
                $('#mySidenav').removeClass('hidden');
                $('#mySidenav').attr('style', 'width: 250px');
                $('#imgOpen').attr('style', 'position: relative;right: 215px;');
                $('#imgOpen').text("Close");
                removeFloatingNav(true);
            } else { $scope.closeNav(); }
        }
        $scope.closeNav = function () {
            $('#mySidenav').attr('style', 'width: 0px');
            $('#mySidenav').addClass('hidden');
            $('#imgOpen').attr('style', 'position: relative;right: 0px;');
            $('#imgOpen').text("Images");
        }

        $scope.downloadAttachmentCallback = function (scope, data, options, hasError) {
            utl.Modal.open('app.downloadAttachementImages', {
                params: {
                    eid: $scope.item.EncounterId,
                    pid: $scope.item.Patientid,
                    url: options.data.Data.fileurl,
                    filename: options.data.Data.filename,
                    id: options.data.Data.Id,
                },
                confirmCallback: $scope.getList
            });
            console.log('Downloaded Completed...');
        };
        $scope.downloadAttachment = function (FilePath_, FileName_, Id_) {
            var inputData = {
                FilePath: FilePath_,
                fileurl: '', filename: FileName_,
                Id: Id_
            };
            var options = {
                action: 'lis/WorkOrderAttachment/GetAttachmentFile',
                data: { Data: inputData },
                onComplete: $scope.downloadAttachmentCallback
            };
            utl.Http.getDownloadedURL(options);
        }

        $scope.getAttachementImgsCallback = function (scope, data, options, hasError) {
            $scope.AttachementImgs.push({
                'Id': options.data.Data.Id,
                'WODId': options.data.Data.wodid,
                'ImgEncData': data.Photo,
                'filename': options.data.Data.FileName,
                'filepath': options.data.Data.PhotoPath,
            });
        };
        $scope.getAttachementImgs = function (Id_, WOId, WODId, FilePath_, FileName_) {
            if (FilePath_) {
                var inputData = { Id: Id_, wodid: WODId, PhotoPath: FilePath_, FileName: FileName_ };
                var options = {
                    action: 'registration/Patient/GetPatientProfilePic',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getAttachementImgsCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getAttachementImgListCallback = function (scope, res, options, hasError) {
            $scope.AttachementImgs = [];
            var ImageDataList = res.Data;
            for (var idx in ImageDataList) {
                var ImageData = ImageDataList[idx];
                $scope.getAttachementImgs(
                    ImageData.Id,
                    ImageData.WorkOrderId,
                    ImageData.WorkOrderDetailId,
                    ImageData.FilePath,
                    ImageData.AttachmentName
                );
            }
        }

        $scope.getAttachementImgList = function () {
            if ($scope.item && $scope.item.PatientId > 0 && $scope.item.Id > 0) {
                var pid = $scope.item.PatientId;
                var woid = $scope.item.Id;
                var inputData = {
                    Params: [
                        { Key: 2, Value: pid },
                        { Key: 3, Value: woid }
                    ],
                    PageContext: {
                        PageSize: -1,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'lis/WorkOrderAttachment/GetWorkOrderAttachments',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getAttachementImgListCallback
                };
                utl.Http.doAction(options);
            }
        }

        /*  End -- Attachment Images */


        $scope.initLookup();
    }

    AmendresultEntryFormController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();
