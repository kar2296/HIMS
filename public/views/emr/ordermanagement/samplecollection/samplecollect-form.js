(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('sampleCollectFormController', sampleCollectFormController);

    function sampleCollectFormController($scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;

        angular.extend(this, utl.Ctrl.getBarcodePrintCtrl({
            $scope: $scope
        }));

        $scope.item = {};
        $scope.details = [];
        $scope.EncounterInfo = {};
        $scope.canShowBarcodeButton = false;
        $scope.CanShowSave = true;
        $scope.NoofPrintPatientLabel = 1;
        $scope.currentcontext = {
            selectall: false
        };

        if ($stateParams.id)
            $scope.currentcontext.id = parseInt($stateParams.id);
        if ($stateParams.ordid)
            $scope.currentcontext.ordid = parseInt($stateParams.ordid);

        $scope.currentcontext.testList = [];
        $scope.syncwithlis = 0;
        $scope.syncwithlis =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'syncwithlis');
        $scope.samplidbytype = 0;
        $scope.samplidbytype =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'samplidbytype');
        $scope.selectAllItems = function () {
            for (var idx in $scope.details) {
                var item = $scope.details[idx];
                if (!item.IsReadOnly) {
                    item.IsSelected = $scope.currentcontext.selectall;
                    item.IsAllSampleTypeSelected = $scope.currentcontext.selectall;
                    if (item.SampleDetailStatusId != 3) {
                        item.CollectedDate = item.IsSelected == true ? utl.Formatter.getCurrentDate() : null;
                    }
                }
            }
        }

        $scope.sampletypeSelectionChange = function (list, item) {
            for (var idx1 in list) {
                var detail = list[idx1];
                if (item.IsAllSampleTypeSelected &&
                    item.SampleType == detail.SampleType && !detail.IsReadOnly) {
                    detail.IsSelected = true;
                    detail.CollectedDate = utl.Formatter.getCurrentDate();
                } else if (!item.IsAllSampleTypeSelected &&
                    item.SampleType == detail.SampleType && !detail.IsReadOnly) {
                    detail.IsSelected = false;
                    detail.CollectedDate = null;
                }
            }
        }

        $scope.detailSelectionChanged = function (item) {
            item.CollectedDate = null;
            if (item.IsSelected == true) {
                item.CollectedDate = utl.Formatter.getCurrentDate();
            }
        }
        $scope.getSamplesCallback = function (scope, res, options, hasError) {
            if (!res || !res.Data || res.Data.length === 0) {
                return;
            }
            var targetSample = res.Data.find(function (s) {
                return s.SampleStatusId == 1 || s.SampleStatusId == 2;
            }) || res.Data[0];

            if (targetSample) {
                $scope.currentcontext.id = targetSample.Id;
                loadData();
            }
        };

        $scope.getSamples = function () {

            var inputData = {
                Params: [{
                    Key: 19,
                    Value: $scope.currentcontext.ordid
                },],
            };

            var options = {
                action: 'lis/workordersample/GetWorkOrderSamples',
                data: inputData,
                type: 'post',
                onComplete: $scope.getSamplesCallback
            };

            utl.Http.doAction(options);
        };

        //getDetails
        $scope.getDetailsCallback = function (scope, res, options, hasError) {
            var result = res.Data;

            var testArr = [];
            for (var idx in result) {
                var item = result[idx];

                item.SubDepartmentName = item.Testmaster.SubDepartment ? item.Testmaster.SubDepartment.DepartmentName : null;

                var found = testArr.find(function (t) {
                    return t.SubDepartmentName == item.Testmaster.SubDepartmentName;
                });
                if (!found) {
                    found = {
                        SubDepartmentName: item.SubDepartmentName,
                        details: []
                    };
                    testArr.push(found);
                }

                // 3 - Collected, 5 - Received/Approved, 6 - Rejected
                var hasValidDate = Boolean(item.CollectedDate) && (
                    typeof item.CollectedDate === 'string'
                        ? item.CollectedDate.trim().length > 0
                        : typeof item.CollectedDate === 'object' && Object.keys(item.CollectedDate).length > 0
                );
                var isCollectedOrApproved = (
                    item.SampleDetailStatusId == 3 ||
                    item.SampleDetailStatusId == 5 ||
                    item.SampleDetailStatusId == 6 ||
                    (item.SampleStatus && item.SampleStatus.Description === 'Collected') ||
                    (Boolean(item.SampleIdentifier) && hasValidDate && ($scope.item && $scope.item.SampleStatusId == 3))
                );
                if (item.SampleDetailStatusId == 1 || (item.SampleStatus && item.SampleStatus.Description === 'Pending')) {
                    isCollectedOrApproved = false;
                }

                if (isCollectedOrApproved) {
                    item.IsSelected = false;
                    item.IsReadOnly = true;
                    item.IsAllSampleTypeSelected = false;
                    item.IsAllSampleTypeReadOnly = true;
                } else {
                    if (item.SampleDetailStatusId == 1) {
                        item.SampleIdentifier = null;
                    }
                    item.IsSelected = true;
                    item.IsReadOnly = false;
                    item.IsAllSampleTypeSelected = true;
                    item.IsAllSampleTypeReadOnly = false;
                    if (!item.CollectedDate) {
                        item.CollectedDate = utl.Formatter.getCurrentDate();
                    }
                }
                item.SampleTypeIndex = 0;
                found.details.push(item);
            }

            $scope.currentcontext.testList = testArr;
            var vsampletype = [];
            for (var idx in $scope.currentcontext.testList) {
                var test = $scope.currentcontext.testList[idx].details;
                for (var idx1 in test) {
                    var detail = test[idx1];
                    if (!vsampletype[detail.SampleType]) {
                        vsampletype[detail.SampleType] = detail.SampleType || null;
                        detail.SampleTypeIndex = 0;
                    } else detail.SampleTypeIndex++;

                    if (detail.SampleIdentifier)
                        $scope.canShowBarcodeButton = true;

                    var isDetCollected = (
                        detail.SampleDetailStatusId == 3 ||
                        detail.SampleDetailStatusId == 5 ||
                        detail.SampleDetailStatusId == 6 ||
                        ($scope.item && $scope.item.SampleStatusId == 3) ||
                        (detail.SampleStatus && detail.SampleStatus.Description === 'Collected')
                    );

                    if (isDetCollected) {
                        detail.IsAllSampleTypeSelected = false;
                        detail.IsAllSampleTypeReadOnly = true;
                    }
                }
            }

            // Check if any items are pending collection
            var hasPendingItems = result.some(function (d) {
                return (
                    d.SampleDetailStatusId != 3 &&
                    d.SampleDetailStatusId != 5 &&
                    d.SampleDetailStatusId != 6 &&
                    !($scope.item && $scope.item.SampleStatusId == 3) &&
                    !(d.SampleStatus && d.SampleStatus.Description === 'Collected')
                );
            });

            if (!hasPendingItems) {
                $scope.CanShowSave = false;
            } else if ($scope.item.PatientWorkorder && $scope.item.PatientWorkorder.WorkOrderStatusId >= 7) {
                $scope.CanShowSave = false;
            } else {
                $scope.CanShowSave = true;
            }

            // Always enable barcode buttons if sample or identifier exists
            if ($scope.currentcontext.id || result.some(function (d) { return Boolean(d.SampleIdentifier); })) {
                $scope.canShowBarcodeButton = true;
            }

            console.log(result);
            $scope.details = result;
            $scope.refreshReactProps();
        };

        $scope.getDetails = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.id
                    }],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'lis/WorkOrderSampleDetail/GetWorkOrderSampleDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.samplecollectionlist');
        }
        $scope.testprofiledetails = function (TestId) {
            utl.Modal.open('app.testprofile', {
                params: {
                    tid: TestId
                },
                confirmCallback: $scope.getList
            });
        }
        //getItem
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.workorderid = '';
            if ($scope.item.PatientWorkorder) {
                $scope.workorderid = $scope.item.PatientWorkorder.Id;
                if ($scope.item.PatientWorkorder.WorkOrderStatusId >= 7) {
                    $scope.CanShowSave = false;
                }
            }
            $scope.getEncounters();
            $scope.refreshReactProps();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'lis/WorkOrderSample/GetWorkOrderSampleById',
                    data: {
                        Id: $scope.currentcontext.id,
                        Wid: $scope.currentcontext.workorderid,
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.rejectSample = function () {
            if ($scope.item.RejectionComments == '' || !$scope.item.RejectionComments) {
                utl.Alert.showErrorMsg($translate.instant('Please Enter Rejection Comments...'));
                return false;
            } else {
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'Do You Want to Reject this Sample?',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.rejectSampleOrder,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            }
        }

        $scope.rejectSampleOrder = function () {
            var actionName = 'lis/WorkOrderSample/ManageWorkOrderSample';
            var rejlines = getRejectLinesForSave();
            if ($scope.details.length == rejlines.length) {
                $scope.item.SampleStatusId = 6; //Reject
            } else {
                $scope.item.SampleStatusId = 7; //Partially Reject
            }
            // $scope.item.SampleStatusId = 6;
            var inputData = {
                Header: $scope.item,
                Details: rejlines
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
        };


        function getRejectLinesForSave() {
            var result = [];
            for (var idx in $scope.details) {
                var item = $scope.details[idx];
                if (item.IsSelected) {
                    item.SampleDetailStatusId = 6;
                    item.CollectedDate = null;
                    item.SampleIdentifier = null;
                    result.push(item);
                }
            }
            return result;
        }


        //save item
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if ($scope.item.SampleStatusId != 2) {
                $scope.CanShowSave = false;
            } else {
                $scope.CanShowSave = true;
            }
            loadData();
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            if (checkMandatoryFields()) {
                var actionName = '';
                if ($scope.samplidbytype == 1) {
                    actionName = 'lis/WorkOrderSample/ManageWorkOrderSampleByType';
                } else {
                    actionName = 'lis/WorkOrderSample/ManageWorkOrderSample';
                }
                var lines = getLinesForSave();

                // Compute if all details will be collected/finalized after this save
                var remainingPending = 0;
                for (var i = 0; i < ($scope.details || []).length; i++) {
                    var d = $scope.details[i];
                    var willBeCollected = lines.some(function (l) { return l.Id === d.Id; });
                    var alreadyDone = (
                        d.SampleDetailStatusId == 3 ||
                        d.SampleDetailStatusId == 5 ||
                        d.SampleDetailStatusId == 6 ||
                        (d.SampleStatus && d.SampleStatus.Description === 'Collected')
                    );
                    if (!willBeCollected && !alreadyDone) {
                        remainingPending++;
                    }
                }

                if (remainingPending === 0) {
                    $scope.item.SampleStatusId = 3; // Fully Collected
                } else {
                    $scope.item.SampleStatusId = 2; // Partially Collected
                }
                if ($scope.syncwithlis == 1) {
                    $scope.item.SyncLisInterface = true;
                }
                if ($scope.item.SampleStatusId == 7) {

                    $scope.item.SampleStatusId = 3; //Collected
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
            var activeRecords = $filter('filterArrayItems')($scope.details, [{
                search: 1,
                fields: ['Status']
            }]);

            var atleasedoneSelected = 0;
            for (var idx in activeRecords) {
                var item = activeRecords[idx];
                if (item.IsSelected) {
                    atleasedoneSelected = 1;
                }
            }
            if (atleasedoneSelected == 0) {
                utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                return false;
            }

            return true;
        }

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.details) {
                var item = $scope.details[idx];
                if (!item.IsReadOnly && item.IsSelected) {
                    if (!item.CollectedDate) {
                        item.CollectedDate = utl.Formatter.getCurrentDate();
                    }
                    item.SampleDetailStatusId = 3; //Collected
                    result.push(item);
                }
            }
            return result;
        }
        $scope.testtat = function (item) {
            utl.Modal.open('app.tatdetails', {
                params: {
                    pid: $scope.item.PatientId,
                    oid: $scope.item.PatientOrderId,
                    odid: item.OrderDetailId,
                    // tid: item.TestId
                },
                confirmCallback: $scope.getList
            });
        }

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
                confirmCallback: $scope.loadData,
                cancelCallback: $scope.loadData
            });
        };

        function loadData() {
            if (!$scope.currentcontext.id && !$scope.currentcontext.ordid) {
                var inputData = {
                    Params: [
                        { Key: 17, Value: utl.Session.getCurrentFacilityId() },
                        { Key: 21, Value: '1,2' }
                    ],
                    PageContext: { PageSize: 1, PageNumber: 1 }
                };
                utl.Http.doAction({
                    action: 'lis/workordersample/GetWorkOrderSamples',
                    data: inputData,
                    type: 'post',
                    onComplete: function (scope, res) {
                        if (res && res.Data && res.Data.length > 0) {
                            $scope.currentcontext.id = res.Data[0].Id;
                            $scope.getItem();
                            $scope.getDetails();
                        } else {
                            $scope.refreshReactProps();
                        }
                    }
                });
                return;
            }
            $scope.getItem();
            $scope.getDetails();
            $scope.refreshReactProps();
        }

        $scope.getEncounterCallback = function (scope, res, options, hasError) {
            $scope.EncounterInfo = res.Data[0];
            $scope.refreshReactProps();
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

        $scope.generatebarcode = function () {
            var vsampletype = [];
            var vSampleDisplay = "";
            var vOrderPriority = "";
            var vDepartmentCode = "";
            for (var idx in $scope.currentcontext.testList) {
                var test = $scope.currentcontext.testList[idx].details;
                for (var idx1 in test) {
                    var detail = test[idx1];
                    if (detail.SampleIdentifier) {
                        if (!vsampletype[detail.SampleIdentifier]) {
                            vsampletype[detail.SampleIdentifier] = detail.SampleIdentifier || null;
                            if (detail.Testmaster && detail.Testmaster.SampleDisplay)
                                vSampleDisplay = detail.Testmaster.SampleDisplay;
                            if (detail.OrderPriority && detail.OrderPriority.Description)
                                vOrderPriority = detail.OrderPriority.Description;
                            if (detail.Testmaster)
                                vDepartmentCode = detail.Testmaster.Department.DepartmentCode;
                            $scope.generateBarcodeScript(detail.CollectedDate, detail.SampleIdentifier,
                                detail.SampleType, vSampleDisplay, vOrderPriority, test, vDepartmentCode);
                        }
                    }
                }
            }
        };

        $scope.generateBarcodeScript = function (collectiondt, barcodenr, sampletype,
            vSampleDisplay, vOrderPriority, vtest, vDepartmentCode) {
            for (var idx1 in vtest) {
                var detail = vtest[idx1];
                if (detail.SampleIdentifier == barcodenr) {
                    if (detail.Testmaster && detail.Testmaster.SampleDisplay) {
                        if (detail.Testmaster.SampleDisplay.length > 0)
                            vSampleDisplay = detail.Testmaster.SampleDisplay;
                    }
                }
            }
            var vPatientName = '';
            //-------//
            var vMRN = '';
            var vVisitIdentifier = '';
            //-------//
            var vAge = '';
            var vGender = '';
            var vEncoutnerType = '';
            var vWardName = '';
            //-------//
            var vCollectiondt = '';
            var vOrderNumber = '';
            var vDeptcode = '';

            try {
                if ($scope.EncounterInfo && $scope.EncounterInfo.Patient &&
                    $scope.EncounterInfo.Patient.Title &&
                    $scope.EncounterInfo.Patient.Title.Description)
                    vPatientName += $scope.EncounterInfo.Patient.Title.Description;

                if ($scope.EncounterInfo && $scope.EncounterInfo.Patient &&
                    $scope.EncounterInfo.Patient.FirstName)
                    vPatientName += ' ' + $scope.EncounterInfo.Patient.FirstName;

                if ($scope.EncounterInfo && $scope.EncounterInfo.Patient &&
                    $scope.EncounterInfo.Patient.LastName)
                    vPatientName += ' ' + $scope.EncounterInfo.Patient.LastName;

                if ($scope.EncounterInfo && $scope.EncounterInfo.Patient &&
                    $scope.EncounterInfo.Patient.MRN)
                    vMRN = $scope.EncounterInfo.Patient.MRN;

                if ($scope.EncounterInfo && $scope.EncounterInfo.VisitIdentifier)
                    vVisitIdentifier = $scope.EncounterInfo.VisitIdentifier;

                if ($scope.EncounterInfo && $scope.EncounterInfo.Patient &&
                    $scope.EncounterInfo.Patient.Age)
                    vAge = $scope.EncounterInfo.Patient.Age + ' Y';

                if ($scope.EncounterInfo && $scope.EncounterInfo.Patient &&
                    $scope.EncounterInfo.Patient.Gender &&
                    $scope.EncounterInfo.Patient.Gender.Description)
                    vGender += $scope.EncounterInfo.Patient.Gender.Description;

                if (vGender)
                    vGender = vGender[0];

                if ($scope.EncounterInfo && $scope.EncounterInfo.EncounterType &&
                    $scope.EncounterInfo.EncounterType.Description)
                    vEncoutnerType = $scope.EncounterInfo.EncounterType.Description;

                if ($scope.EncounterInfo && $scope.EncounterInfo.WardMaster &&
                    $scope.EncounterInfo.WardMaster.WardName)
                    vWardName = $scope.EncounterInfo.WardMaster.WardName;


                if ($scope.item.PatientOrder && $scope.item.PatientOrder &&
                    $scope.item.PatientOrder.OrderNumber)
                    vOrderNumber = $scope.item.PatientOrder.OrderNumber;

                if (collectiondt)
                    vCollectiondt = utl.Formatter.getDateTimeString(collectiondt);

                if (vDepartmentCode)
                    vDeptcode = vDepartmentCode;

            } catch (ex) { }

            var code = '';
            var printData = []
            var printCodes = {
                new_line: '\x0A'
            };
            var code = '';
            if (window.clientcode.toLowerCase() == 'swostha') {
                code += 'I8,A,001' + printCodes.new_line;
                code += 'Q200,024' + printCodes.new_line;
                code += 'q831' + printCodes.new_line;
                code += 'rN' + printCodes.new_line;
                code += 'S2' + printCodes.new_line;
                code += 'D15' + printCodes.new_line;
                code += 'ZT' + printCodes.new_line;
                code += 'JF' + printCodes.new_line;
                code += 'O' + printCodes.new_line;
                code += 'R215,0' + printCodes.new_line;
                code += 'f100' + printCodes.new_line;
                code += 'N' + printCodes.new_line;
                code += 'B373,90,2,1,3,9,61,B,"' + barcodenr + '"' + printCodes.new_line;
                code += 'A373,150,2,2,1,1,N,"Lab No:' + vOrderNumber + '"' + printCodes.new_line;
                code += 'A373,170,2,2,1,1,N,"' + vPatientName + '"' + printCodes.new_line;
                code += 'A373,150,2,2,1,1,N,"MRN:' + vMRN + '/ ' + vVisitIdentifier + '/ ' + vSampleDisplay + '"' + printCodes.new_line;
                code += 'A374,130,2,2,1,1,N,"' + vAge + '/' + vGender + '-' + vEncoutnerType + '-' + vWardName + '"' + printCodes.new_line;
                code += 'A374,110,2,2,1,1,N,"' + vCollectiondt + '"' + printCodes.new_line;
                code += 'A165,110,2,2,1,1,N,"' + sampletype + '"' + printCodes.new_line;

                code += 'P1,1' + printCodes.new_line;
                printData.push(code);
                console.log(printData);
                $scope.printRaw(printData);
            } else if (window.barcodeclientcode.toLowerCase() == 'equitas') {
                code += 'I8,A,001' + printCodes.new_line;
                code += 'Q200,024' + printCodes.new_line;
                code += 'q831' + printCodes.new_line;
                code += 'rN' + printCodes.new_line;
                code += 'S2' + printCodes.new_line;
                code += 'D15' + printCodes.new_line;
                code += 'ZT' + printCodes.new_line;
                code += 'JF' + printCodes.new_line;
                code += 'O' + printCodes.new_line;
                code += 'R215,0' + printCodes.new_line;
                code += 'f100' + printCodes.new_line;
                code += 'N' + printCodes.new_line;
                code += 'B373,80,2,1,3,8,41,B,"' + barcodenr + '"' + printCodes.new_line;
                code += 'A373,180,2,2,1,1,N,"' + vPatientName + '"' + printCodes.new_line;
                code += 'A373,160,2,2,1,1,N,"MRN:' + vMRN + '/ ' + vVisitIdentifier + '/ ' + vSampleDisplay + '"' + printCodes.new_line;
                code += 'A374,140,2,2,1,1,N,"' + vAge + '/' + vGender + '-' + vEncoutnerType + '-' + vWardName + '"' + printCodes.new_line;
                code += 'A374,120,2,2,1,1,N,"' + vCollectiondt + '"' + printCodes.new_line;
                code += 'A165,120,2,2,1,1,N,"' + sampletype + '"' + printCodes.new_line;
                code += 'A374,98,2,2,1,1,N,"' + vDeptcode + '"' + printCodes.new_line;
                code += 'P1,1' + printCodes.new_line;
                printData.push(code);
                console.log(printData);
                $scope.printRaw(printData);
            }  else if (window.barcodeclientcode.toLowerCase() == 'nkhospital') {
                code += 'I8,A,001' + printCodes.new_line;
                code += 'Q200,024' + printCodes.new_line;
                code += 'q831' + printCodes.new_line;
                code += 'rN' + printCodes.new_line;
                code += 'S2' + printCodes.new_line;
                code += 'D15' + printCodes.new_line;
                code += 'ZT' + printCodes.new_line;
                code += 'JF' + printCodes.new_line;
                code += 'O' + printCodes.new_line;
                code += 'R215,0' + printCodes.new_line;
                code += 'f100' + printCodes.new_line;
                code += 'N' + printCodes.new_line;
                code += 'A410,185,2,3,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
                code += 'A410,160,2,3,1,1,N,"' + 'UHID' + '"' + printCodes.new_line;
                code += 'A410,135,2,3,1,1,N,"' + 'Sex/Age' + '"' + printCodes.new_line;
                code += 'A410,110,2,3,1,1,N,"' + 'Col.Date' + '"' + printCodes.new_line;
                code += 'A410,85,2,3,1,1,N,"' + 'Sample' + '"' + printCodes.new_line;
                // code += 'A410,85,2,3,1,1,N,"' + 'Consultant' + '"' + printCodes.new_line;
                code += 'A300,185,2,2,1,1,N,"' + ':' + '"' + printCodes.new_line;
                code += 'A300,160,2,2,1,1,N,"' + ':' + '"' + printCodes.new_line;
                code += 'A300,135,2,2,1,1,N,"' + ':' + '"' + printCodes.new_line;
                code += 'A300,110,2,2,1,1,N,"' + ':' + '"' + printCodes.new_line;
                code += 'A300,85,2,2,1,1,N,"' + ':' + '"' + printCodes.new_line;
                code += 'A280,185,2,2,1,1,N,"' + vPatientName + '"' + printCodes.new_line;
                code += 'A280,160,2,2,1,1,N,"' + vMRN + '"' + printCodes.new_line;
                code += 'A280,135,2,2,1,1,N,"' + vGender + ' / ' + vAge + ' Y ' + '"' + printCodes.new_line;
                code += 'A280,110,2,2,1,1,N,"' + vCollectiondt + '"' + printCodes.new_line;
                code += 'A280,85,2,2,1,1,N,"' + sampletype + '"' + printCodes.new_line;
                // code += 'A250,85,2,3,1,1,N,"' + vDoctorName + '"' + printCodes.new_line;
                code += 'B410,60,2,1,2,3,25,B,"' + ' ' + ' ' + ' ' + ' ' + barcodenr + '"' + printCodes.new_line;
                // $scope.printRaw(printData);

                code += 'P1,1' + printCodes.new_line;
                printData.push(code);
                console.log(printData);
                $scope.printRaw(printData);
            }  else {
                code += 'I8,A,001' + printCodes.new_line;
                code += 'Q200,024' + printCodes.new_line;
                code += 'q831' + printCodes.new_line;
                code += 'rN' + printCodes.new_line;
                code += 'S2' + printCodes.new_line;
                code += 'D15' + printCodes.new_line;
                code += 'ZT' + printCodes.new_line;
                code += 'JF' + printCodes.new_line;
                code += 'O' + printCodes.new_line;
                code += 'R215,0' + printCodes.new_line;
                code += 'f100' + printCodes.new_line;
                code += 'N' + printCodes.new_line;
                code += 'B373,90,2,1,3,9,61,B,"' + barcodenr + '"' + printCodes.new_line;
                code += 'A373,170,2,2,1,1,N,"' + vPatientName + '"' + printCodes.new_line;
                code += 'A373,150,2,2,1,1,N,"MRN:' + vMRN + '/ ' + vVisitIdentifier + '/ ' + vSampleDisplay + '"' + printCodes.new_line;
                code += 'A374,130,2,2,1,1,N,"' + vAge + '/' + vGender + '-' + vEncoutnerType + '-' + vWardName + '"' + printCodes.new_line;
                code += 'A374,110,2,2,1,1,N,"' + vCollectiondt + '"' + printCodes.new_line;
                code += 'A165,110,2,2,1,1,N,"' + sampletype + '"' + printCodes.new_line;
                code += 'P1,1' + printCodes.new_line;
                printData.push(code);
                console.log(printData);
                $scope.printRaw(printData);
            }

        };

        $scope.pathologistbarcode = function () {
            var vsampletype = [];
            var vSampleDisplay = "";
            var vOrderPriority = "";
            for (var idx in $scope.currentcontext.testList) {
                var test = $scope.currentcontext.testList[idx].details;
                for (var idx1 in test) {
                    var detail = test[idx1];
                    if (detail.SampleIdentifier) {
                        if (!vsampletype[detail.SampleIdentifier]) {
                            vsampletype[detail.SampleIdentifier] = detail.SampleIdentifier || null;
                            if (detail.Testmaster && detail.Testmaster.SampleDisplay)
                                vSampleDisplay = detail.Testmaster.SampleDisplay;
                            if (detail.OrderPriority && detail.OrderPriority.Description)
                                vOrderPriority = detail.OrderPriority.Description;
                            $scope.pathologistBarcodeScript(detail.CollectedDate, detail.SampleIdentifier,
                                detail.SampleType, vSampleDisplay, vOrderPriority, test);
                        }
                    }
                }
            }
        };


        $scope.pathologistBarcodeScript = function (collectiondt, barcodenr, sampletype,
            vSampleDisplay, vOrderPriority, vtest) {
            for (var idx1 in vtest) {
                var detail = vtest[idx1];
                if (detail.SampleIdentifier == barcodenr) {
                    if (detail.Testmaster && detail.Testmaster.SampleDisplay) {
                        if (detail.Testmaster.SampleDisplay.length > 0)
                            vSampleDisplay = detail.Testmaster.SampleDisplay;
                    }
                }
            }
            var vPatientName = '';
            //-------//
            var vMRN = '';
            var vVisitIdentifier = '';
            //-------//
            var vAge = '';
            var vGender = '';
            var vEncoutnerType = '';
            var vWardName = '';
            //-------//
            var vCollectiondt = '';
            var vOrderNumber = '';
            var vWorkOrderNumber = '';

            try {
                if ($scope.EncounterInfo && $scope.EncounterInfo.Patient &&
                    $scope.EncounterInfo.Patient.Title &&
                    $scope.EncounterInfo.Patient.Title.Description)
                    vPatientName += $scope.EncounterInfo.Patient.Title.Description;

                if ($scope.EncounterInfo && $scope.EncounterInfo.Patient &&
                    $scope.EncounterInfo.Patient.FirstName)
                    vPatientName += ' ' + $scope.EncounterInfo.Patient.FirstName;

                if ($scope.EncounterInfo && $scope.EncounterInfo.Patient &&
                    $scope.EncounterInfo.Patient.LastName)
                    vPatientName += ' ' + $scope.EncounterInfo.Patient.LastName;

                if ($scope.EncounterInfo && $scope.EncounterInfo.Patient &&
                    $scope.EncounterInfo.Patient.MRN)
                    vMRN = $scope.EncounterInfo.Patient.MRN;

                if ($scope.EncounterInfo && $scope.EncounterInfo.VisitIdentifier)
                    vVisitIdentifier = $scope.EncounterInfo.VisitIdentifier;

                if ($scope.EncounterInfo && $scope.EncounterInfo.Patient &&
                    $scope.EncounterInfo.Patient.Age)
                    vAge = $scope.EncounterInfo.Patient.Age + ' Y';

                if ($scope.EncounterInfo && $scope.EncounterInfo.Patient &&
                    $scope.EncounterInfo.Patient.Gender &&
                    $scope.EncounterInfo.Patient.Gender.Description)
                    vGender += $scope.EncounterInfo.Patient.Gender.Description;

                if (vGender)
                    vGender = vGender[0];

                if ($scope.EncounterInfo && $scope.EncounterInfo.EncounterType &&
                    $scope.EncounterInfo.EncounterType.Description)
                    vEncoutnerType = $scope.EncounterInfo.EncounterType.Description;

                if ($scope.EncounterInfo && $scope.EncounterInfo.WardMaster &&
                    $scope.EncounterInfo.WardMaster.WardName)
                    vWardName = $scope.EncounterInfo.WardMaster.WardName;


                if ($scope.item.PatientOrder && $scope.item.PatientOrder &&
                    $scope.item.PatientOrder.OrderNumber)
                    vOrderNumber = $scope.item.PatientOrder.OrderNumber;


                if ($scope.item.PatientWorkorder)
                    vWorkOrderNumber = $scope.item.PatientWorkorder.WorkOrderdid;

                if (collectiondt)
                    vCollectiondt = utl.Formatter.getDateTimeString(collectiondt);

            } catch (ex) { }

            var code = '';
            var printData = []
            var printCodes = {
                new_line: '\x0A'
            };
            var code = '';
            if (window.clientcode.toLowerCase() == 'swostha') {
                code += 'I8,A,001' + printCodes.new_line;
                code += 'Q200,024' + printCodes.new_line;
                code += 'q831' + printCodes.new_line;
                code += 'rN' + printCodes.new_line;
                code += 'S2' + printCodes.new_line;
                code += 'D15' + printCodes.new_line;
                code += 'ZT' + printCodes.new_line;
                code += 'JF' + printCodes.new_line;
                code += 'O' + printCodes.new_line;
                code += 'R215,0' + printCodes.new_line;
                code += 'f100' + printCodes.new_line;
                code += 'N' + printCodes.new_line;
                code += 'B373,90,2,1,3,9,61,B,"' + barcodenr + '"' + printCodes.new_line;
                code += 'A373,150,2,2,1,1,N,"Lab No:' + vOrderNumber + '"' + printCodes.new_line;
                code += 'A373,170,2,2,1,1,N,"' + vPatientName + '"' + printCodes.new_line;
                code += 'A373,150,2,2,1,1,N,"MRN:' + vMRN + '/ ' + vVisitIdentifier + '/ ' + vSampleDisplay + '"' + printCodes.new_line;
                code += 'A374,130,2,2,1,1,N,"' + vAge + '/' + vGender + '-' + vEncoutnerType + '-' + vWardName + '"' + printCodes.new_line;
                code += 'A374,110,2,2,1,1,N,"' + vCollectiondt + '"' + printCodes.new_line;
                code += 'A165,110,2,2,1,1,N,"' + sampletype + '"' + printCodes.new_line;

                code += 'P1,1' + printCodes.new_line;
                printData.push(code);
                console.log(printData);
                $scope.printRaw(printData);
            } else if (window.barcodeclientcode.toLowerCase() == 'nkhospital') {
                code += 'I8,A,001' + printCodes.new_line;
                code += 'Q200,024' + printCodes.new_line;
                code += 'q831' + printCodes.new_line;
                code += 'rN' + printCodes.new_line;
                code += 'S2' + printCodes.new_line;
                code += 'D15' + printCodes.new_line;
                code += 'ZT' + printCodes.new_line;
                code += 'JF' + printCodes.new_line;
                code += 'O' + printCodes.new_line;
                code += 'R215,0' + printCodes.new_line;
                code += 'f100' + printCodes.new_line;
                code += 'N' + printCodes.new_line;
                code += 'A410,185,2,3,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
                code += 'A410,160,2,3,1,1,N,"' + 'UHID' + '"' + printCodes.new_line;
                code += 'A410,135,2,3,1,1,N,"' + 'Sex/Age' + '"' + printCodes.new_line;
                code += 'A410,110,2,3,1,1,N,"' + 'Col.Date' + '"' + printCodes.new_line;
                code += 'A410,85,2,3,1,1,N,"' + 'Sample' + '"' + printCodes.new_line;
                // code += 'A410,85,2,3,1,1,N,"' + 'Consultant' + '"' + printCodes.new_line;
                code += 'A300,185,2,2,1,1,N,"' + ':' + '"' + printCodes.new_line;
                code += 'A300,160,2,2,1,1,N,"' + ':' + '"' + printCodes.new_line;
                code += 'A300,135,2,2,1,1,N,"' + ':' + '"' + printCodes.new_line;
                code += 'A300,110,2,2,1,1,N,"' + ':' + '"' + printCodes.new_line;
                code += 'A300,85,2,2,1,1,N,"' + ':' + '"' + printCodes.new_line;
                code += 'A280,185,2,2,1,1,N,"' + vPatientName + '"' + printCodes.new_line;
                code += 'A280,160,2,2,1,1,N,"' + vMRN + '"' + printCodes.new_line;
                code += 'A280,135,2,2,1,1,N,"' + vGender + ' / ' + vAge + ' Y ' + '"' + printCodes.new_line;
                code += 'A280,110,2,2,1,1,N,"' + vCollectiondt + '"' + printCodes.new_line;
                code += 'A280,85,2,2,1,1,N,"' + sampletype + '"' + printCodes.new_line;
                // code += 'A250,85,2,3,1,1,N,"' + vDoctorName + '"' + printCodes.new_line;
                code += 'B410,60,2,1,2,3,25,B,"' + ' ' + ' ' + ' ' + ' ' + barcodenr + '"' + printCodes.new_line;
                // $scope.printRaw(printData);

                code += 'P1,1' + printCodes.new_line;
                printData.push(code);
                console.log(printData);
                $scope.printRaw(printData);
            } else {
                code += 'I8,A,001' + printCodes.new_line;
                code += 'Q200,024' + printCodes.new_line;
                code += 'q831' + printCodes.new_line;
                code += 'rN' + printCodes.new_line;
                code += 'S2' + printCodes.new_line;
                code += 'D15' + printCodes.new_line;
                code += 'ZT' + printCodes.new_line;
                code += 'JF' + printCodes.new_line;
                code += 'O' + printCodes.new_line;
                code += 'R215,0' + printCodes.new_line;
                code += 'f100' + printCodes.new_line;
                code += 'N' + printCodes.new_line;
                code += 'B373,90,2,1,3,9,61,B,"' + barcodenr + '"' + printCodes.new_line;
                code += 'A373,170,2,2,1,1,N,"' + vPatientName + '"' + printCodes.new_line;
                code += 'A373,150,2,2,1,1,N,"MRN:' + vMRN + '/ ' + vVisitIdentifier + '/ ' + vSampleDisplay + '"' + printCodes.new_line;
                code += 'A374,130,2,2,1,1,N,"' + vAge + '/' + vGender + '-' + vEncoutnerType + '-' + vWardName + '"' + printCodes.new_line;
                code += 'A374,110,2,2,1,1,N,"' + vWorkOrderNumber + '"' + printCodes.new_line;
                code += 'P1,1' + printCodes.new_line;
                printData.push(code);
                console.log(printData);
                $scope.printRaw(printData);
            }

        };

        $scope.histobarcode = function () {
            var vsampletype = [];
            var vSampleDisplay = "";
            var vOrderPriority = "";
            var vDepartmentCode = "";
            var vsampleId = "";
            for (var idx in $scope.currentcontext.testList) {
                var test = $scope.currentcontext.testList[idx].details;
                for (var idx1 in test) {
                    var detail = test[idx1];
                    var dept = detail.Testmaster.Department.DepartmentCode;
                    if (detail.SampleIdentifier) {
                        if (!vsampletype[detail.SampleIdentifier]) {
                            vsampletype[detail.SampleIdentifier] = detail.SampleIdentifier || null;
                            if (detail.Testmaster && detail.Testmaster.SampleDisplay)
                                vSampleDisplay = detail.Testmaster.SampleDisplay;
                            if (detail.OrderPriority && detail.OrderPriority.Description)
                                vOrderPriority = detail.OrderPriority.Description;
                            if (detail.Testmaster)
                                vDepartmentCode = detail.Testmaster.Department.DepartmentCode;
                            if (detail && detail.SampleIdentifier)
                                vsampleId = detail.SampleIdentifier;
                            $scope.histoBarcodeScript(detail.CollectedDate, detail.SampleIdentifier,
                                detail.SampleType, vSampleDisplay, vOrderPriority, test, vDepartmentCode, vsampleId, dept);
                        }
                    }
                }
            }
        };

        $scope.histoBarcodeScript = function (collectiondt, barcodenr, sampletype,
            vSampleDisplay, vOrderPriority, vtest, vsampleId, vDepartmentCode, dept) {
            for (var idx1 in vtest) {
                var detail = vtest[idx1];
                if (detail.SampleIdentifier == barcodenr) {
                    if (detail.Testmaster && detail.Testmaster.SampleDisplay) {
                        if (detail.Testmaster.SampleDisplay.length > 0)
                            vSampleDisplay = detail.Testmaster.SampleDisplay;
                    }
                }
            }
            var vPatientName = '';
            //-------//
            var vMRN = '';
            var vVisitIdentifier = '';
            //-------//
            var vAge = '';
            var vGender = '';
            var vEncoutnerType = '';
            var vWardName = '';
            //-------//
            var vCollectiondt = '';
            var vOrderNumber = '';
            var vDoctorName = '';
            var vSampleID = '';
            var vDeptCode = '';

            try {
                if ($scope.EncounterInfo && $scope.EncounterInfo.Patient &&
                    $scope.EncounterInfo.Patient.Title &&
                    $scope.EncounterInfo.Patient.Title.Description)
                    vPatientName += $scope.EncounterInfo.Patient.Title.Description;

                if ($scope.EncounterInfo && $scope.EncounterInfo.Patient &&
                    $scope.EncounterInfo.Patient.FirstName)
                    vPatientName += ' ' + $scope.EncounterInfo.Patient.FirstName;

                if ($scope.EncounterInfo && $scope.EncounterInfo.Patient &&
                    $scope.EncounterInfo.Patient.LastName)
                    vPatientName += ' ' + $scope.EncounterInfo.Patient.LastName;

                if ($scope.EncounterInfo && $scope.EncounterInfo.Patient &&
                    $scope.EncounterInfo.Patient.MRN)
                    vMRN = $scope.EncounterInfo.Patient.MRN;

                if ($scope.EncounterInfo && $scope.EncounterInfo.VisitIdentifier)
                    vVisitIdentifier = $scope.EncounterInfo.VisitIdentifier;

                if ($scope.EncounterInfo && $scope.EncounterInfo.Patient &&
                    $scope.EncounterInfo.Patient.Age)
                    vAge = $scope.EncounterInfo.Patient.Age + ' Y';

                if ($scope.EncounterInfo && $scope.EncounterInfo.Patient &&
                    $scope.EncounterInfo.Patient.Gender &&
                    $scope.EncounterInfo.Patient.Gender.Description)
                    vGender += $scope.EncounterInfo.Patient.Gender.Description;

                if (vGender)
                    vGender = vGender[0];

                if ($scope.EncounterInfo && $scope.EncounterInfo.EncounterType &&
                    $scope.EncounterInfo.EncounterType.Description)
                    vEncoutnerType = $scope.EncounterInfo.EncounterType.Description;

                if ($scope.EncounterInfo && $scope.EncounterInfo.WardMaster &&
                    $scope.EncounterInfo.WardMaster.WardName)
                    vWardName = $scope.EncounterInfo.WardMaster.WardName;


                if ($scope.item.PatientOrder && $scope.item.PatientOrder &&
                    $scope.item.PatientOrder.OrderNumber)
                    vOrderNumber = $scope.item.PatientOrder.OrderNumber;

                if ($scope.item.PatientOrder && $scope.item.PatientOrder.DoctorName)
                    vDoctorName = $scope.item.PatientOrder.DoctorName;

                if (collectiondt)
                    vCollectiondt = utl.Formatter.getDateTimeString(collectiondt);

                vSampleID = barcodenr;

                if (dept)
                    vDeptCode = dept;

            } catch (ex) { }

            var code = '';
            var printData = []
            var printCodes = {
                new_line: '\x0A'
            };
            var code = '';
            if (window.clientcode.toLowerCase() == 'swostha') {
                code += 'I8,A,001' + printCodes.new_line;
                code += 'Q200,024' + printCodes.new_line;
                code += 'q831' + printCodes.new_line;
                code += 'rN' + printCodes.new_line;
                code += 'S2' + printCodes.new_line;
                code += 'D15' + printCodes.new_line;
                code += 'ZT' + printCodes.new_line;
                code += 'JF' + printCodes.new_line;
                code += 'O' + printCodes.new_line;
                code += 'R215,0' + printCodes.new_line;
                code += 'f100' + printCodes.new_line;
                code += 'N' + printCodes.new_line;
                code += 'B373,90,2,1,3,9,61,B,"' + barcodenr + '"' + printCodes.new_line;
                code += 'A373,150,2,2,1,1,N,"Lab No:' + vOrderNumber + '"' + printCodes.new_line;
                code += 'A373,170,2,2,1,1,N,"' + vPatientName + '"' + printCodes.new_line;
                code += 'A373,150,2,2,1,1,N,"MRN:' + vMRN + '/ ' + vVisitIdentifier + '/ ' + vSampleDisplay + '"' + printCodes.new_line;
                code += 'A374,130,2,2,1,1,N,"' + vAge + '/' + vGender + '-' + vEncoutnerType + '-' + vWardName + '"' + printCodes.new_line;
                code += 'A374,110,2,2,1,1,N,"' + vCollectiondt + '"' + printCodes.new_line;
                code += 'A165,110,2,2,1,1,N,"' + sampletype + '"' + printCodes.new_line;

                code += 'P1,1' + printCodes.new_line;
                printData.push(code);
                console.log(printData);
                $scope.printRaw(printData);
            } else {
                code += "<xpml><page quantity='0' pitch='50.0 mm'></xpml>SIZE 99.10 mm, 50 mm" + printCodes.new_line;
                code += "GAP 3 mm, 0 mm" + printCodes.new_line;
                code += "DIRECTION 0,0" + printCodes.new_line;
                code += "REFERENCE 0,0" + printCodes.new_line;
                code += "OFFSET 0 mm" + printCodes.new_line;
                code += "SET PEEL OFF" + printCodes.new_line;
                code += "SET CUTTER OFF" + printCodes.new_line;
                code += "SET PARTIAL_CUTTER OFF" + printCodes.new_line;
                code += "<xpml></page></xpml><xpml><page quantity='1' pitch='50.0 mm'></xpml>SET TEAR ON" + printCodes.new_line;
                code += "CLS" + printCodes.new_line;
                code += "CODEPAGE 1252" + printCodes.new_line;
                code += 'TEXT 771,381,"0",180,11,11,"PatientName"' + printCodes.new_line;
                code += 'TEXT 590,381,"0",180,16,11,":"' + printCodes.new_line;
                code += 'TEXT 565,381,"0",180,11,11,"' + vPatientName + '"' + printCodes.new_line;
                code += 'TEXT 771,341,"0",180,11,11,"UHID / VisitNo"' + printCodes.new_line;
                code += 'TEXT 590,341,"0",180,11,11,":"' + printCodes.new_line;
                code += 'TEXT 565,341,"0",180,11,11,"' + vMRN + "/" + vVisitIdentifier + '"' + printCodes.new_line;
                code += 'TEXT 771,301,"0",180,11,11,"Age/Sex"' + printCodes.new_line;
                code += 'TEXT 590,301,"0",180,11,11,":"' + printCodes.new_line;
                code += 'TEXT 565,301,"0",180,11,11,"' + vAge + '/' + vGender + '"' + printCodes.new_line;
                code += 'TEXT 771,261,"0",180,11,11,"Sample ID"' + printCodes.new_line;
                code += 'TEXT 590,261,"0",180,11,11,":"' + printCodes.new_line;
                code += 'TEXT 565,261,"0",180,11,11,"' + vSampleID + '"' + printCodes.new_line;
                code += 'TEXT 771,221,"0",180,11,11,"Dept Code"' + printCodes.new_line;
                code += 'TEXT 590,221,"0",180,11,11,":"' + printCodes.new_line;
                code += 'TEXT 565,221,"0",180,11,11,"' + vDeptCode + '"' + printCodes.new_line;
                code += 'TEXT 771,182,"0",180,11,11,"Order No"' + printCodes.new_line;
                code += 'TEXT 599,182,"0",180,11,11,":"' + printCodes.new_line;
                code += 'TEXT 565,182,"0",180,11,11,"' + vOrderNumber + '"' + printCodes.new_line;
                code += 'TEXT 771,142,"0",180,11,11,"Consultant"' + printCodes.new_line;
                code += 'TEXT 599,142,"0",180,11,11,":"' + printCodes.new_line;
                code += 'TEXT 565,142,"0",180,11,11,"' + vDoctorName + '"' + printCodes.new_line;
                code += 'BARCODE 573,90,"93",50,0,180,3,6,"' + barcodenr + '"' + printCodes.new_line;
                code += "PRINT 1,1" + printCodes.new_line;
                code += "<xpml></page></xpml><xpml><end/></xpml>" + printCodes.new_line;
                printData.push(code);
                console.log(printData);
                $scope.printRaw(printData);
            }

        };

        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            if ($scope.currentcontext.ordid > 0) {
                $scope.getSamples();
            } else {
                loadData();
            }
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

        $scope.refreshReactProps = function () {
            var pat = ($scope.EncounterInfo && $scope.EncounterInfo.Patient) || {};
            var ref = ($scope.EncounterInfo && $scope.EncounterInfo.Referral) || {};
            var fac = ($scope.EncounterInfo && $scope.EncounterInfo.Facility) || {};
            var ward = ($scope.EncounterInfo && $scope.EncounterInfo.WardMaster) || {};
            var bed = ($scope.EncounterInfo && $scope.EncounterInfo.WardRoomBedMaster) || {};
            var room = ($scope.EncounterInfo && $scope.EncounterInfo.WardRoomMaster) || {};

            var patientData = {
                Title: pat.Title ? pat.Title.Description : '',
                FirstName: pat.FirstName || '',
                LastName: pat.LastName || '',
                MRN: pat.MRN || '',
                Age: pat.Age,
                Gender: pat.Gender ? (typeof pat.Gender === 'object' ? pat.Gender.Description : pat.Gender) : '',
                PatientName: ((pat.Title && pat.Title.Description) ? pat.Title.Description + ' ' : '') +
                             (pat.FirstName || '') + (pat.LastName ? ' ' + pat.LastName : '')
            };

            var encounterData = {
                ReferralName: ref.ReferralName || 'SELF',
                FacilityName: fac.FacilityName || (utl.Session.getCurrentFacilityName ? utl.Session.getCurrentFacilityName() : 'SHUVADARSINI HOSPITAL'),
                WardName: ward.WardName || 'HDU',
                BedNo: bed.BedNo || '',
                RoomNo: room.RoomNo || ''
            };

            var orderInfoData = {};
            if ($scope.item) {
                orderInfoData = {
                    OrderNumber: $scope.item.PatientOrder ? $scope.item.PatientOrder.OrderNumber : '',
                    BillNumber: $scope.item.PatientOrder ? $scope.item.PatientOrder.BillNumber : '',
                    OrderDate: $scope.item.PatientOrder ? $scope.item.PatientOrder.OrderRequestDate : null,
                    SampleStatus: $scope.item.SampleStatus ? $scope.item.SampleStatus.Description : 'Pending',
                    SampleStatusId: $scope.item.SampleStatusId || 1,
                    RejectionComments: $scope.item.RejectionComments || '',
                    WorkOrderDID: $scope.item.PatientWorkorder ? $scope.item.PatientWorkorder.WorkOrderdid : ''
                };
            }

            var hasPendingItems = false;
            var cleanDetails = ($scope.details || []).map(function (d) {
                var hasDate = Boolean(d.CollectedDate) && (
                    typeof d.CollectedDate === 'string'
                        ? d.CollectedDate.trim().length > 0
                        : typeof d.CollectedDate === 'object' && Object.keys(d.CollectedDate).length > 0
                );
                var isCollected = Boolean(
                    d.SampleDetailStatusId == 3 ||
                    d.SampleDetailStatusId == 5 ||
                    d.SampleDetailStatusId == 6 ||
                    (d.SampleStatus && d.SampleStatus.Description === 'Collected') ||
                    (Boolean(d.SampleIdentifier) && hasDate && ($scope.item && $scope.item.SampleStatusId == 3))
                );
                if (d.SampleDetailStatusId == 1 || (d.SampleStatus && d.SampleStatus.Description === 'Pending')) {
                    isCollected = false;
                }

                if (!isCollected && !d.IsReadOnly) {
                    hasPendingItems = true;
                }

                return {
                    Id: d.Id,
                    WorkOrderSampleId: d.WorkOrderSampleId,
                    OrderDetailId: d.OrderDetailId,
                    TestId: d.TestId,
                    TestName: d.TestName,
                    TestCode: d.Testmaster ? d.Testmaster.Code : '',
                    SampleType: d.SampleType,
                    SampleIdentifier: d.SampleIdentifier || null,
                    SamplePriority: d.OrderPriority ? d.OrderPriority.Description : 'Routine',
                    SampleStatus: d.SampleStatus ? d.SampleStatus.Description : (isCollected ? 'Collected' : 'Pending'),
                    SampleStatusId: d.SampleStatusId,
                    SampleDetailStatusId: d.SampleDetailStatusId,
                    CollectedDate: d.CollectedDate,
                    IsSelected: isCollected ? false : Boolean(d.IsSelected),
                    IsReadOnly: isCollected ? true : Boolean(d.IsReadOnly),
                    IsAllSampleTypeSelected: isCollected ? false : Boolean(d.IsAllSampleTypeSelected),
                    IsAllSampleTypeReadOnly: isCollected ? true : Boolean(d.IsAllSampleTypeReadOnly),
                    SampleVolume: d.Testmaster ? d.Testmaster.SampleVolume : '',
                    SubDepartmentName: d.SubDepartmentName,
                    IsSeparateSampleId: d.IsSeparateSampleId
                };
            });

            var canBarcode = Boolean(
                $scope.canShowBarcodeButton ||
                $scope.currentcontext.id ||
                ($scope.details && $scope.details.some(function (d) { return Boolean(d.SampleIdentifier); }))
            );

            var isWorkOrderClosed = Boolean($scope.item && $scope.item.PatientWorkorder && $scope.item.PatientWorkorder.WorkOrderStatusId >= 7);
            var canSaveAllowed = hasPendingItems && !isWorkOrderClosed;
            $scope.CanShowSave = canSaveAllowed;

            $scope.reactProps = {
                sampleId: $scope.currentcontext.id,
                orderId: $scope.item ? $scope.item.PatientOrderId : null,
                patient: patientData,
                encounter: encounterData,
                orderInfo: orderInfoData,
                details: cleanDetails,
                canShowSave: canSaveAllowed,
                canShowBarcodeButton: canBarcode,
                canShowReject: $scope.item && ($scope.item.SampleStatusId == 3 || $scope.item.SampleStatusId == 2),
                facilityName: utl.Session.getCurrentFacilityName ? utl.Session.getCurrentFacilityName() : 'SHUVADARSINI HOSPITAL'
            };
            $scope.$applyAsync();
        };

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'back') {
                $scope.backToList();
            } else if (actionName === 'toggleSelectAll') {
                $scope.currentcontext.selectall = payload ? Boolean(payload.selectAll) : true;
                $scope.selectAllItems();
                $scope.refreshReactProps();
            } else if (actionName === 'toggleSampleType') {
                if (payload) {
                    var targetItem = ($scope.details || []).find(function (d) {
                        return d.SampleType === payload.sampleType;
                    });
                    if (targetItem) {
                        targetItem.IsAllSampleTypeSelected = Boolean(payload.isSelected);
                        $scope.sampletypeSelectionChange($scope.details, targetItem);
                    }
                }
                $scope.refreshReactProps();
            } else if (actionName === 'toggleItem') {
                if (payload && payload.item) {
                    var target = ($scope.details || []).find(function (d) {
                        return d.Id === payload.item.Id;
                    });
                    if (target) {
                        target.IsSelected = Boolean(payload.isSelected);
                        $scope.detailSelectionChanged(target);
                    }
                }
                $scope.refreshReactProps();
            } else if (actionName === 'updateRejectionRemarks') {
                if ($scope.item && payload) {
                    $scope.item.RejectionComments = payload.remarks;
                }
            } else if (actionName === 'save') {
                $scope.saveItem();
            } else if (actionName === 'reject') {
                $scope.rejectSample();
            } else if (actionName === 'tat') {
                if (payload) {
                    var target = ($scope.details || []).find(function (d) {
                        return d.Id === payload.Id;
                    });
                    $scope.testtat(target || payload);
                }
            } else if (actionName === 'generateBarcode') {
                $scope.generatebarcode();
            } else if (actionName === 'pathologistBarcode') {
                $scope.pathologistbarcode();
            } else if (actionName === 'histoBarcode') {
                $scope.histobarcode();
            }
        };

        $scope.refreshReactProps();
        $scope.initLookup();
    }

    sampleCollectFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();