(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('resultEntryFormController', resultEntryFormController);

    function resultEntryFormController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.item = {
            WorkOrderStatusId: -1,
            WithHeader: true,
            WithoutHeader: false
        };
        vm.details = [];
        $scope.AttachementImgs = [];
        $scope.item.isExternal = false;
        $scope.item.isExternaldisaled = false;
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.testtypeid = parseInt($stateParams.testtypeid);
        $scope.currentcontext.parent = $stateParams.pt;
        $scope.currentfilter = {};
        $scope.EncounterInfo = {};
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
        console.log($scope.currentfilter.filter_wostatus);
        $scope.currentfilter.filter_subdept = $stateParams.filter_subdept;
        $scope.currentfilter.filter_orderdate = $stateParams.filter_orderdate;
        $scope.currentfilter.filter_encType = $stateParams.filter_encType;
        $scope.currentcontext.context = $stateParams.context;
        $scope.EchoPrint = false;
        $scope.islabsync =
            utl.FacilitySetting.getFacilitySettingValue('general', 'directlabsync');

        if ($stateParams.status)
            $scope.currentcontext.WorkOrderStatus = $stateParams.status;
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
        $scope.UserTypeId = utl.Session.getUserTypeId();

        function isFromApproval() {
            return $scope.currentcontext.parent == 'myapproval';
        }
        $scope.EchoPrint = utl.FacilitySetting.getFacilitySettingValue('general', 'echoprint');
        $scope.CanApprove = $scope.HasAccess('Resultentry', 'CanApprove');
        $scope.CanRedo = $scope.HasAccess('Resultentry', 'CanRedo');
        $scope.CanSave = $scope.HasAccess('Resultentry', 'CanSave');
        $scope.CanPrint = $scope.HasAccess('Resultentry', 'CanPrint');
        $scope.CanPrintWithoutHeader = $scope.HasAccess('Resultentry', 'CanPrintWithoutHeader');
        $scope.Cansendforapproval = $scope.HasAccess('Resultentry', 'Cansendforapproval');
        $scope.CanReject = $scope.HasAccess('Resultentry', 'CanReject');
        $scope.CanShowSendForApproval = function () {
            return !isFromApproval();
        }

        $scope.CanShowApprovalArea = function () {
            return isFromApproval();
        }
        // $scope.backtoList = function () {
        //     $state.go('app.labdashboard');
        // };
        $scope.CanDisableApproveRejectButton = function () {
            return this.item.WorkOrderStatusId == 7 || this.item.WorkOrderStatusId == 8;
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
        $scope.CanShowNucTable = function () {
            return ($scope.item.TestTypeId == 5);
        }
        $scope.CanShowEndoscopyTable = function () {
            return ($scope.item.TestTypeId == 4);
            // $scope.currentcontext.deptcode = 60;
        }

        $scope.currentcontext.testList = [];

        $scope.openRichTextEditor = function (concept) {
            $scope.currentcontext.currentrichtexteditor = concept;
            utl.Modal.open('richtexteditor-modal', {
                params: {
                    richtext: $scope.modeldata[concept].resultvaluerichtext,
                    notetypeid: 12
                },
                confirmCallback: $scope.richtexteditorCallback
            });
        }

        $scope.richtexteditorCallback = function (richtext) {
            if ($scope.currentcontext.currentrichtexteditor && richtext) {
                var concept = $scope.currentcontext.currentrichtexteditor;
                $scope.modeldata[concept].resultvaluerichtext = richtext.editortext;
                $scope.currentcontext.currentrichtexteditor = '';
            }
        }

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
        $scope.graphView = function (item) {
            utl.Modal.open('patientemr.labresultview', {
                params: {
                    analyteid: item.Analyteid,
                    eid: $scope.item.EncounterId,
                    pid: $scope.item.Patientid,
                    context: 'analyte'
                },
                confirmCallback: $scope.getItem
            });
        }

        $scope.openLabtests = function () {
            utl.Modal.open('app.previousorders-list', {
                params: {
                    eid: $scope.item.EncounterId,
                    pid: $scope.item.Patientid
                },
                confirmCallback: $scope.getItem,
                // cancelCallback: $scope.getItem
            });
        }
        $scope.openLabResults = function () {
            utl.Modal.open('app.previouslabresult', {
                params: {
                    eid: $scope.item.EncounterId,
                    pid: $scope.item.Patientid
                },
                confirmCallback: $scope.getItem,
                // cancelCallback: $scope.getItem
            });
            // $state.go('app.previouslabresult', {
            //     eid: $scope.item.EncounterId,
            //     pid: $scope.item.Patientid,
            //     context: $scope.pagecontext
            // });

        };
        $scope.openRadiologyResults = function () {
            utl.Modal.open('patientemr.radiologyresults', {
                params: {
                    // eid: $scope.item.EncounterId,
                    pid: $scope.item.Patientid
                },
                confirmCallback: $scope.getList
            });
        };
        $scope.openEndoscopyResults = function () {
            utl.Modal.open('patientemr.endoscopyresults', {
                params: {
                    eid: $scope.item.EncounterId,
                    pid: $scope.item.Patientid
                },
                confirmCallback: $scope.getList
            });
        };



        //getItem
        $scope.getItemCallback = function (scope, data, options, hasError) {

            $scope.item = data;
            $scope.item.WithoutHeader = true
            if ($scope.item.WorkOrderStatusId == 4) {
                if ($scope.item.Approvedbyid > 0) {
                    $scope.item.Approvedbyid = $scope.item.Approvedbyid;
                    $scope.item.TechValidationById = $scope.item.TechValidationById;
                } else {
                    if ($scope.UserTypeId == 2) {
                        $scope.item.Approvedbyid = utl.Session.getCurrentUserId();
                        $scope.item.TechValidationById = utl.Session.getCurrentUserId();
                    }
                }
                if ($scope.item.ResultEnteredBy > 0) {
                    $scope.item.ResultEnteredBy = $scope.item.ResultEnteredBy;
                    $scope.item.ResultEnteredBy = utl.Session.getCurrentUserId();
                }
                if ($scope.item.ApprovedUserBy > 0) {
                    $scope.item.ApprovedUserBy = $scope.item.ApprovedUserBy;
                    $scope.item.ApprovedUserBy = utl.Session.getCurrentUserId();
                }
            }
            $scope.item.ResultEntered = '';
            if ($scope.item.ResultEnteredUser) {
                if ($scope.item.ResultEnteredUser.Title) {
                    $scope.item.ResultEntered = $scope.item.ResultEnteredUser.Title.Description;
                }
                if ($scope.item.ResultEnteredUser.FirstName) {
                    $scope.item.ResultEntered += ' ' + $scope.item.ResultEnteredUser.FirstName;
                }
                if ($scope.item.ResultEnteredUser.LastName) {
                    $scope.item.ResultEntered += ' ' + $scope.item.ResultEnteredUser.LastName;
                }
            }
            $scope.item.ResultApproved = '';
            if ($scope.item.ResultApprovedUser) {
                if ($scope.item.ResultApprovedUser.Title) {
                    $scope.item.ResultApproved = $scope.item.ResultApprovedUser.Title.Description;
                }
                if ($scope.item.ResultApprovedUser.FirstName) {
                    $scope.item.ResultApproved += ' ' + $scope.item.ResultApprovedUser.FirstName;
                }
                if ($scope.item.ResultApprovedUser.LastName) {
                    $scope.item.ResultApproved += ' ' + $scope.item.ResultApprovedUser.LastName;
                }
            }
            $scope.item.Patient.AgeInDays = utl.Formatter.getAgeInDaysFromDOB($scope.item.Patient.DOB);
            $scope.item.isExternal = false;
            $scope.item.isExternaldisaled = false;
            if (data.WorkOrderStatusId >= 4) {
                // if (isFromApproval()) {
                $scope.item.ApprovalSubmisdate = $scope.item.ApprovalSubmisdate || utl.Formatter.getCurrentDate();
                if ($scope.item.Approvedbyid > 0) {
                    $scope.item.Approvedbyid = $scope.item.Approvedbyid
                } else {
                    if ($scope.UserTypeId == 2) {
                        $scope.item.Approvedbyid = utl.Session.getCurrentUserId();
                    }
                }
            }
            $scope.item.TechValidationById = $scope.item.TechValidationById || utl.Session.getCurrentUserId();
            $scope.item.ResultEnteredBy = $scope.item.ResultEnteredBy || utl.Session.getCurrentUserId();
            $scope.item.ApprovedUserBy = $scope.item.ApprovedUserBy || utl.Session.getCurrentUserId();
            $scope.item.TechValidationdate = $scope.item.TechValidationdate || utl.Formatter.getCurrentDate();

            if ($scope.item.WorkOrderStatusId == 4 || $scope.item.WorkOrderStatusId == 7) {
                $scope.item.isExternal = true;
                if ($scope.item.WorkOrderStatusId == 7)
                    $scope.item.isExternaldisaled = true;
            }
            if ($scope.item.TestTypeId == 1) {
                $scope.lookup.User = $scope.lookup.LabTechnician;
            } else if ($scope.item.TestTypeId == 2 || $scope.item.TestTypeId == 3) {
                $scope.lookup.User = $scope.lookup.RadiologyTechnician;
            }
            $scope.getDetails();
            $scope.getUserBills();
            $scope.getAttachementImgList();
            $scope.getEncounters();

        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'lis/patientworkorder/GetPatientWorkorderById',
                    data: {
                        Id: $scope.currentcontext.id,
                        Data: {
                        WOStatus: $scope.currentcontext.WorkOrderStatus,
                        IsLabSync: $scope.islabsync
                        }
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getEncounterCallback = function (scope, res, options, hasError) {
            $scope.EncounterInfo = res.Data[0];
        };

        $scope.getEncounters = function () {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.item.Encounterid
                }]
            };
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getEncounterCallback
            };

            utl.Http.doAction(options);
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
                    if (detail && !detail.Resultvalue && detail.Testmaster &&
                        detail.Testmaster.TestmasterTemplate) {
                        if (!detail.Resultvalue && $scope.item.Patient.GenderId == 1) {
                            detail.Resultvalue = detail.Testmaster.TestmasterTemplate.MaleDataTemplate;
                        } else if (!detail.Resultvalue && $scope.item.Patient.GenderId == 2) {
                            detail.Resultvalue = detail.Testmaster.TestmasterTemplate.FemaleDataTemplate;
                        }
                    }
                }
            } catch (ex) {
                console.log(ex);
            }
        }

        //getDetails
        $scope.getDetailsCallback = function (scope, res, options, hasError) {
            var result = res.Data;
            var testArr1 = [];
            var testArr = [];
            var tabIndex = 0;
            var profileName = "";
            var rootProfileName = "";
            $scope.currentcontext.PackageName = '';
            for (var idx in result) {
                var item = result[idx];
                if (item.PatientOrderDetail.Testmaster) {
                    if (item.PatientOrderDetail.Testmaster.IsNABLTest) {
                        item.IsNABLTest = item.PatientOrderDetail.Testmaster.IsNABLTest;
                    }
                }
                $scope.currentcontext.PackageName = item.PatientOrderDetail.PackageName;
                var found = testArr1.find(function (t) {
                    return (t.Testname == item.Testname && t.RootProfileName == item.RootProfileName);
                });
                if (!found) {
                    found = {
                        Testid: item.Testid,
                        Testname: item.Testname,
                        details: [],
                        isProfile: item.Testmaster.IsProfile,
                        IsNABLTest: item.IsNABLTest,
                        TestDisplayOrder: item.TestDisplayOrder,
                        SubdeptDisplayOrder: item.SubdeptDisplayOrder
                    };
                    if (profileName != item.ProfileName) {
                        profileName = item.ProfileName;
                        found.ProfileName = profileName;
                    }
                    found.RootProfileName = item.RootProfileName;
                    testArr1.push(found);
                }
                computeRefRange(item);
                //item.tabIndex = tabIndex++;

                var foundDetails = found.details.find(function (a) {
                    return (a.Analytename == item.Analytename && a.RootProfileName == item.RootProfileName);
                });
                console.log(found.details);
                console.log(item);
                if (!foundDetails) {
                    found.details.push(item);
                }
            }

            var finalArr = [];
            if (utl.Session.getdeptPrint()) {
                //Sorting by department displayorder
                testArr1 = $filter('sortArrayItems')(testArr1, [{
                    name: 'SubdeptDisplayOrder',
                    direction: 'asc',
                    priority: 1,
                    type: 'int'
                }]);



                var GrpData = _.groupBy(testArr1, 'SubdeptDisplayOrder');
                console.log(GrpData);

                //Sorting by test and analyte displayorder
                for (var jdx in GrpData) {
                    var testArr = GrpData[jdx];
                    testArr = $filter('sortArrayItems')(testArr, [{
                        name: 'TestDisplayOrder',
                        direction: 'asc',
                        priority: 1,
                        type: 'int'
                    }]);

                    for (var idx in testArr) {
                        var item = testArr[idx];
                        item.details = $filter('sortArrayItems')(item.details, [{
                            name: 'AnalyteDisplayOrder',
                            direction: 'asc',
                            priority: 1,
                            type: 'int'
                        }]);
                        finalArr.push(item);
                    }
                }
            } else {

                testArr1 = $filter('sortArrayItems')(testArr1, [{
                    name: 'TestDisplayOrder',
                    direction: 'asc',
                    priority: 1,
                    type: 'int'
                }]);

                for (var idx in testArr1) {
                    var item = testArr1[idx];
                    item.details = $filter('sortArrayItems')(item.details, [{
                        name: 'AnalyteDisplayOrder',
                        direction: 'asc',
                        priority: 1,
                        type: 'int'
                    }]);
                    finalArr.push(item);
                }

            }
            console.log(finalArr);

            // return;
            tabIndex = 0;
            // $scope.CanshowOtherfields = true;
            for (var idx in finalArr) {
                var item = finalArr[idx];
                for (var idx1 in item.details) {
                    item.details[idx1].IsAllOrderSelected = true;
                    var itemdetails = item.details[idx1];
                    // if (itemdetails.TestValueType == 1) {
                    //     $scope.CanshowOtherfields = false;
                    // }
                    $scope.ManualCompQualifier(itemdetails);
                    itemdetails.tabIndex = tabIndex++;
                }
            }

            rootProfileName = '';
            for (var idx in finalArr) {
                var item = finalArr[idx];
                finalArr[idx].IsAllOrderSelected = true;
                if (item.RootProfileName) {
                    if (item.IsNABLTest) {
                        item.RootProfileName = item.RootProfileName + '**';
                    } else {
                        item.RootProfileName = item.RootProfileName;
                    }
                    if (rootProfileName != item.RootProfileName) {
                        rootProfileName = item.RootProfileName;
                    } else {
                        finalArr[idx].RootProfileName = '';
                    }
                } else {
                    if (item.IsNABLTest) {
                        item.Testname = item.Testname + '**';
                    }
                }
            }

            $scope.currentcontext.testList = finalArr;
            vm.details = result;
        };

        $scope.selectAllItems = function () {
            for (var idx in $scope.currentcontext.testList) {
                var item = $scope.currentcontext.testList[idx];
                item.IsSelected = $scope.currentcontext.selectall;
                item.IsAllOrderSelected = $scope.currentcontext.selectall;
            }
        }

        $scope.IsAllOrderSelectedChange = function (list, item) {
            for (var idx1 in list) {
                var detail = list[idx1];
                if (detail.IsAllOrderSelected) {
                    detail.IsSelected = true;
                } else if (!detail.IsAllOrderSelected) {
                    detail.IsSelected = false;
                }
            }

            for (var jdx1 in item.details) {
                var detail1 = item.details[jdx1];
                if (item.IsAllOrderSelected) {
                    detail1.IsAllOrderSelected = true;
                } else if (!item.IsAllOrderSelected) {
                    detail1.IsAllOrderSelected = false;
                }
            }
        }

        $scope.IsAllOrderSelectedChange1 = function (list, item) {
            var count = 0;
            for (var idx1 in list.details) {
                var detail = list.details[idx1];
                if (detail.IsAllOrderSelected) {
                    count++;
                }
            }

            if (count == 0) {
                list.IsAllOrderSelected = false;
            } else {
                // if(count == list.details.length) {
                list.IsAllOrderSelected = true;
                // }
            }


        }

        $scope.ManualCompQualifier = function (item) {
            if (item.TestValueType == 5 || item.TestValueType == 7) { //Quantity, Computed value
                var sresultValue = item.Resultvalue;
                if (sresultValue) {
                    sresultValue = sresultValue.trim().replace(',', '');
                    var resultValue = parseFloat(sresultValue);
                    if (item.Analyte && item.Analyte.Analyterefmasters && item.Analyte.Analyterefmasters.length > 0) {
                        var refRange = item.Analyte.Analyterefmasters[0];
                        if (resultValue >= refRange.MinValue && resultValue <= refRange.MaxValue) {
                            item.QualifierId = 1; //Normal
                        } else if (resultValue < refRange.MinValue) {
                            item.QualifierId = 2; //Below low normal
                        } else if (resultValue > refRange.MaxValue) {
                            item.QualifierId = 3; //Above high normal
                        }
                        item.Qualifier = utl.Lookup.getDesc($scope.lookup.Qualifier, item.QualifierId);
                    }
                }
            }
        }


        $scope.getDetails = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.id
                    }, {
                        Key: 8,
                        Value: $scope.currentfilter.SubDepartmentId
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

        $scope.openAttachments = function (wodetail) {
            var inputParams = {
                pid: $scope.item.PatientId,
                woid: $scope.item.Id
            };
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
                params: {
                    id: 0,
                    pid: $scope.item.PatientId,
                    oid: $scope.item.Orderid
                },
                confirmCallback: $scope.onDetailSave
            });
        }
        $scope.testprofiledetails = function (Testid) {
            utl.Modal.open('app.testprofile', {
                params: {
                    tid: Testid
                },
                confirmCallback: $scope.getList
            });
        }
        $scope.patcmnts = function (patientid) {
            utl.Modal.open('app.patcomments', {
                params: {
                    tid: patientid
                },
                confirmCallback: $scope.getList
            });
        }

        $scope.testtat = function (item) {
            utl.Modal.open('app.tatdetails', {
                params: {
                    pid: $scope.item.PatientId,
                    oid: $scope.item.Orderid,
                    odid: item.Orderdetailid,
                    tid: item.Testid
                },
                confirmCallback: $scope.getList
            });
        }
        $scope.analyteprofiledetails = function (Analyteid) {
            utl.Modal.open('app.analyteprofile', {
                params: {
                    aid: Analyteid
                },
                confirmCallback: $scope.getList
            });
        }
        $scope.openParamObservations = function (wodetail) {
            var inputParams = {
                pid: $scope.item.PatientId,
                woid: $scope.item.Id
            };
            if (wodetail && wodetail.Id) {
                inputParams.wodid = wodetail.Id;
                inputParams.obs = wodetail.ParameterObservation;
            }

            utl.Modal.open('app.parameterobservation', {
                params: inputParams,
                confirmCallback: $scope.getdata
            });

            $scope.getdata = function (itemFromModal) {
                wodetail.ParameterObservation = itemFromModal.ParameterObservation;
            }
        };
        $scope.openTestObservations = function (wodetail) {
            var inputParams = {
                pid: $scope.item.PatientId,
                woid: $scope.item.Id
            };
            for (var idx in wodetail) {
                var wDetail = wodetail[idx];
                if (wDetail && wDetail.Id) {
                    inputParams.wodid = wDetail.Id;
                    inputParams.obs = wDetail.TestObservation;
                }
            }

            utl.Modal.open('app.testobservation', {
                params: inputParams,
                confirmCallback: $scope.gettestdata
            });

            $scope.gettestdata = function (itemFromModal) {
                wDetail.TestObservation = itemFromModal.TestObservation;
            }
        };

        $scope.openObservations = function (wodetail) {
            var inputParams = {
                pid: $scope.item.PatientId,
                woid: $scope.item.Id
            };
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
            var showHeader = true;
            if ($scope.item.IsCulture) {
                showHeader = false;
            }
            var inputData = {
                Id: $scope.currentcontext.id,
                HeaderInfo: showHeader,
                Data: {
                    isprint: false,
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader,
                }
            };

            if (selectedTestArr.length > 0) {
                selectedTestList = selectedTestArr.join(',');
                inputData.Data = {
                    selectedtests: selectedTestList
                }
            }

            var options = {
                action: 'lis/patientworkorder/PrintExternalLab',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.printecho = function () {
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
                inputData.Data = {
                    selectedtests: selectedTestList
                }
            }

            var options = {
                action: 'lis/patientworkorder/Printecho',
                data: inputData,
                type: 'post',
                onComplete: $scope.UpdateWo
            };
            utl.Http.doDownload(options);
        }
        $scope.print1 = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    IsDepartment: true
                }
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
                Data: {
                    IsDepartment: true
                }
            };
            var options = {
                action: 'lis/patientworkorder/PrintERCP',
                data: inputData,
                type: 'post',
                onComplete: $scope.UpdateWo
            };
            utl.Http.doDownload(options);
        }
        $scope.print11 = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    IsDepartment: true
                }
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
                Data: {
                    IsDepartment: true
                }
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
                Data: {
                    IsDepartment: true
                }
            };
            var options = {
                action: 'lis/patientworkorder/Printpathaology',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.UpdateWo = function () {
            var selectedTestArr = [];
            $scope.item.Id = $scope.currentcontext.id;
            $scope.item.IsPrinted = true;
            for (var idx in $scope.currentcontext.testList) {
                var test = $scope.currentcontext.testList[idx];
                if (test.IsAllOrderSelected == true) {

                    selectedTestArr.push(test.Testid)
                }
            }
            if (selectedTestArr.length > 0) {
                $scope.item.selectedTestList = selectedTestArr.join(',');
            }
            var options = {
                action: 'lis/patientworkorder/UpdatePrintPatientWorkorder',
                data: {
                    Data: $scope.item,
                },
                type: 'post',
                // onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.printbiochemistry = function () {

            var selectedTestList = "";
            var selectedTestArr = [];
            for (var idx in $scope.currentcontext.testList) {
                var test = $scope.currentcontext.testList[idx];
                if (test.IsAllOrderSelected == true) {
                    selectedTestArr.push(test.Testid)
                }
            }


            if (selectedTestArr.length > 0) {
                selectedTestList = selectedTestArr.join(',');
                // inputData.Data = {
                //     selectedtests: selectedTestList,
                //     IsDepartment: true
                // }
            }
            var showHeader = true;
            if ($scope.item.IsCulture) {
                showHeader = false;
            }
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    selectedtests: selectedTestList,
                    IsDepartment: true,
                    isfrom: 'resultentry',
                    HeaderInfo: showHeader,
                    PackageName: $scope.currentcontext.PackageName || ''
                }
            };

            var options = {
                action: 'lis/patientworkorder/PrintPatientWorkorder',
                data: inputData,
                type: 'post',
                onComplete: $scope.UpdateWo
            };
            utl.Http.doDownload(options);
        }
        $scope.consolidateprint = function () {

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
                inputData.Data = {
                    selectedtests: selectedTestList,
                    IsDepartment: true,
                    PackageName: $scope.currentcontext.PackageName || ''

                }
            }

            var options = {
                action: 'lis/patientworkorder/PrintPatientWorkorderWithoutheader',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        $scope.printwithoutheader = function () {

            var selectedTestList = "";
            var selectedTestArr = [];
            var selectedAnalayteArr = {};
            for (var idx in $scope.currentcontext.testList) {
                var test = $scope.currentcontext.testList[idx];
                if (test.IsAllOrderSelected == true) {
                    var arr = [];
                    for (var jdx in test.details) {

                        if (test.details[jdx].IsAllOrderSelected == true) {
                            arr.push(test.details[jdx].Analyteid)
                        }

                    }

                    console.log(arr);
                    console.log(idx);
                    selectedTestArr.push(test.Testid)
                    // selectedAnalayteArr.push(test.Testid)
                    selectedAnalayteArr[test.Testid] = arr;
                    // selectedAnalayteArr[test.Testid] = arr;
                }
            }
            // var inputData = {
            //     Id: $scope.currentcontext.id
            // };

            if (selectedTestArr.length > 0) {
                selectedTestList = selectedTestArr.join(',');
                // inputData.Data = {
                //     selectedtests: selectedTestList,
                //     IsDepartment: true
                // }
            }
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    selectedtests: selectedTestList,
                    selectedArray: selectedAnalayteArr,
                    IsDepartment: true,
                    PackageName: $scope.currentcontext.PackageName || '',
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader,
                }
            };
            // console.log(inputData);
            // return;
            var actionName = '';
            if ($scope.item.IsCulture) {
                actionName = 'lis/patientworkorder/PrintPatientWorkorderWithoutheader';
            } else {
                actionName = 'lis/patientworkorder/PrintPatientWorkorderWithoutheader';
            }
            var options = {
                action: actionName,
                data: inputData,
                type: 'post',
                onComplete: $scope.UpdateWo
            };
            // var options = {
            //     action: 'lis/patientworkorder/PrintPatientWorkorderWithoutheader',
            //     data: inputData,
            //     type: 'post',
            //     onComplete: $scope.UpdateWo
            // };
            utl.Http.doDownload(options);
        }

        $scope.Histopathologyprint = function () {

            var selectedTestList = "";
            var selectedTestArr = [];
            for (var idx in $scope.currentcontext.testList) {
                var test = $scope.currentcontext.testList[idx];
                if (test.IsAllOrderSelected == true) {
                    selectedTestArr.push(test.Testid)
                }
            }

            if (selectedTestArr.length > 0) {
                selectedTestList = selectedTestArr.join(',');
            }
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    selectedtests: selectedTestList,
                    IsDepartment: true,
                    ids: 1,
                    PackageName: $scope.currentcontext.PackageName || '',
                    isprint: false,
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader,
                }
            };

            var options = {
                action: 'lis/patientworkorder/PrintPatientWorkorderWithoutheader',
                data: inputData,
                type: 'post',
                onComplete: $scope.UpdateWo
            };
            utl.Http.doDownload(options);
        }

        $scope.print3 = function () {

            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    IsDepartment: false
                }
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
                Data: {
                    IsDepartment: false
                }
            };
            var options = {
                action: 'lis/patientworkorder/Printendoscopy',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.printcon = function () {
            var inputData = {
                Id: $scope.item.Encounterid
            };
            var options = {
                action: 'emr/patientorder/PrintPatientOrders',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.backToList = function () {
            if (isFromApproval()) {
                $state.go('app.approvalallorders', {
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
                    filter_subdept: $scope.currentfilter.filter_subdept,
                    filter_encType: $scope.currentfilter.filter_encType
                });
            } else {
                if (!$scope.currentcontext.context) {
                    $state.go('app.processallorders', {
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
                        filter_subdept: $scope.currentfilter.filter_subdept,
                        filter_encType: $scope.currentfilter.filter_encType
                    });
                }
                if ($scope.currentcontext.context == 'myorder') {
                    $state.go('app.processallorders', {
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
                        filter_subdept: $scope.currentfilter.filter_subdept,
                    });
                }
                if ($scope.currentcontext.context == 'allorder') {
                    $state.go('app.processallorders', {
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
                        filter_subdept: $scope.currentfilter.filter_subdept,
                        filter_encType: $scope.currentfilter.filter_encType
                    });
                }
                if ($scope.currentcontext.context == 'otherorder') {
                    $state.go('app.processallorders', {
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
                        filter_subdept: $scope.currentfilter.filter_subdept,
                        filter_encType: $scope.currentfilter.filter_encType
                    });
                }
                if ($scope.currentcontext.context == 'lab') {
                    $state.go('app.processallorders', {
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
                        filter_subdept: $scope.currentfilter.filter_subdept,
                        filter_encType: $scope.currentfilter.filter_encType
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
            if (!$scope.item.Approvedbyid) {
                utl.Alert.showErrorMsg('Approved by required...');
                return false;

            } else {
                if ($scope.item.Approvedbyid <= 0) {
                    utl.Alert.showErrorMsg('Approved by required...');
                    return false;
                }
                $scope.item.WorkOrderStatusId = 7; //Approved
                $scope.saveItem(true, 'approve');
            }

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
            $scope.item.IsRejected = true;
            $scope.item.WorkOrderStatusId = 6; //Rejected
            $scope.saveItem(false);
        }

        $scope.rejectOrder = function (item) {
            utl.Modal.open('app.rejectreason', {
                params: {
                    pid: $scope.item.PatientId,
                    oid: $scope.item.Orderid,
                    odid: item.Orderdetailid,
                    tid: item.Testid
                },
                confirmCallback: $scope.ReasonSave
            });
        }

        $scope.ReasonSave = function (itemFromModal) {
            $scope.item.Reason = itemFromModal.Reason;
            $scope.ConfirmRejectOrder();
        }

        //save item
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
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
                //console.log($scope.item.Approvedbyid);return;
                $scope.critical = 0;
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
                            if ($scope.item.IsApproved == true) {
                                $scope.item.WorkOrderStatusId = 7;
                            } else
                                $scope.item.WorkOrderStatusId = 9; //PARTIALLY APPROVED
                        } else {
                            if ($scope.item.IsCompleted == true) {
                                $scope.item.WorkOrderStatusId = 4;
                            } else
                                $scope.item.WorkOrderStatusId = 3; //PARTIALLY COMPLETED
                        }
                    }
                }
                $scope.item.IsCriticalOrder = false;
                if ($scope.critical > 0) {
                    $scope.item.IsCriticalOrder = true;
                }
                var inputData = {
                    Header: $scope.item,
                    Details: lines
                };

                var options = {
                    action: actionName,
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        function checkMandatoryFields() {
            var activeRecords = $filter('filterArrayItems')(vm.details, [{
                search: 1,
                fields: ['Status']
            }]);

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
                        if (item.IsCriticalValue) {
                            $scope.critical++;
                        }
                        if (item.Resultvalue && item.Resultvalue != '') {
                            iAtleastOneValue++;
                            item.TechValidationId = $scope.item.TechValidationById;
                            item.TechValidationName = $scope.item.TechValidationByName;
                            item.TechValidationdate = $scope.item.TechValidationdate;
                            item.QualifierId = item.QualifierId;
                            item.Qualifier = item.Qualifier;
                            item.ParameterObservation = item.ParameterObservation;
                            item.TestObservation = item.TestObservation;
                            if ($scope.item.Approvedbyid > 0) {
                                item.MedValidationById = $scope.item.Approvedbyid;
                                item.MedValidationByName = $scope.item.MedValidationByName;
                                item.MedValidationdate = $scope.item.ApprovalSubmisdate || utl.Formatter.getCurrentDate();
                                item.QualifierId = item.QualifierId;
                                item.Qualifier = item.Qualifier;
                                item.ParameterObservation = item.ParameterObservation;
                                item.TestObservation = item.TestObservation;
                                item.WorkOrderDetailStatusId = 7; //Approved
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


        $scope.getUserBillsCallback = function (scope, res, options, hasError) {
            $scope.item.OverallDue = 0;
            var overalldue = 0;
            if (res.Data.length > 0) {
                for (var dx in res.Data) {
                    var bill = res.Data[dx];
                    if (bill.OutStandingAmount) {
                        overalldue += bill.OutStandingAmount;
                    }
                }
                $scope.item.OverallDue = overalldue;

            }
        };

        $scope.getUserBills = function () {
            var inputData = {
                Params: [
                    // {
                    //     Key: 39,
                    //     Value: utl.Session.getCurrentUserId()
                    // },
                    {
                        Key: 12,
                        Value: $scope.item.PatientId
                    },
                    {
                        Key: 11,
                        Value: '0'
                    },
                    {
                        Key: 20,
                        Value: [1, 5, 4]
                    },
                    {
                        Key: 4,
                        Value: 3
                    },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'billing/patientbills/GetPatientBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getUserBillsCallback
            };
            utl.Http.doAction(options);
        };


        function loadData() {
            $scope.getItem();
            $scope.checkHeader();
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;

            $('#mySidenav').addClass('hidden');
            loadData();
        }

        $scope.initLookup = function () {
            var inputData = [
                // { "Key": "Doctor", Request: { Params: [{ Key: 6, Value: 8 }, { Key: 3, Value: 2 }] } },
                {
                    "Key": "User",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 6
                        },
                        {
                            Key: 33,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }
                        ]
                    }
                },
                {
                    "Key": "ResultStatus"
                },
                {
                    "Key": "ANALYTEUOM"
                },
                {
                    "Key": "Specimen",
                    Default: false
                },
                {
                    "Key": "ResultBlock",
                    Default: false
                },
                {
                    "Key": "ResultType",
                    Default: false
                },
                {
                    "Key": "Qualifier"
                },
                {
                    "Key": "LabIncharge",
                    Request: {
                        Params: [{
                            Key: 33,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                {
                    "Key": "RadiologyIncharge",
                    Request: {
                        Params: [{
                            Key: 33,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                {
                    "Key": "LabTechnician",
                    Request: {
                        Params: [{
                            Key: 33,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                {
                    "Key": "RadiologyTechnician",
                    Request: {
                        Params: [{
                            Key: 33,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                // {
                //     "Key": "Doctor"
                // },
                {
                    "Key": "Qualifier"
                },
                {
                    "Key": "Department",
                    Request: {
                        Params: [{
                            Key: 6,
                            Value: $scope.currentcontext.deptcode
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

        /*  Start -- Attachment Images */

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
            } else {
                $scope.closeNav();
            }
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
                fileurl: '',
                filename: FileName_,
                Id: Id_
            };
            var options = {
                action: 'lis/WorkOrderAttachment/GetAttachmentFile',
                data: {
                    Data: inputData
                },
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
                var inputData = {
                    Id: Id_,
                    wodid: WODId,
                    PhotoPath: FilePath_,
                    FileName: FileName_
                };
                var options = {
                    action: 'registration/Patient/GetPatientProfilePic',
                    data: {
                        Data: inputData
                    },
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
                    Params: [{
                        Key: 2,
                        Value: pid
                    },
                    {
                        Key: 3,
                        Value: woid
                    }
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
        $scope.checkHeader = function (iVal) {
            if (iVal == 1) {
                $scope.item.WithHeader = true;
                $scope.item.WithoutHeader = false;
            }
            if (iVal == 2) {
                $scope.item.WithHeader = false;
            }
        };
        document.getElementById("withheader").checked = true;
        $scope.initLookup();
    }

    resultEntryFormController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();