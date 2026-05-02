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
            for (var idx in res.Data) {
                var samples = res.Data[idx];
                if (samples.SampleStatusId == 1) {
                    $scope.currentcontext.id = samples.Id;
                    loadData();
                }
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

                item.IsAllSampleTypeSelected = true;
                item.IsAllSampleTypeReadOnly = true;
                //3 - Collected
                if ($scope.item.SampleStatusId == 7) {
                    item.IsSelected =
                        (item.SampleDetailStatusId == 3) ? true : false;
                    item.IsReadOnly =
                        (item.SampleDetailStatusId == 3) ? true : false;
                } else {
                    item.IsSelected =
                        (item.SampleDetailStatusId == 5) ? true : false;
                    item.IsReadOnly =
                        (item.SampleDetailStatusId == 5) ? true : false;
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
                    if (detail.SampleDetailStatusId != 5) {
                        detail.IsAllSampleTypeSelected = false;
                        detail.IsAllSampleTypeReadOnly = false;
                    }
                    if ($scope.item.SampleStatusId == 7) {
                        if (detail.SampleDetailStatusId != 6) {
                            detail.IsAllSampleTypeSelected = false;
                            detail.IsAllSampleTypeReadOnly = false;
                        }
                    }

                }
            }

            console.log(result);
            $scope.details = result;
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

                if ($scope.details.length == lines.length) {
                    $scope.item.SampleStatusId = 3; //Collected
                } else {
                    $scope.item.SampleStatusId = 2; //Partially Collected
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
                if (item.CollectedDate && !item.IsReadOnly && item.IsSelected) {
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
            $scope.getItem();
            $scope.getDetails();
        }

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

        $scope.initLookup();
    }

    sampleCollectFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();