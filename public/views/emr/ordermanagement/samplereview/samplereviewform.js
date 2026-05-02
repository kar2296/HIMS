(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('sampleReviewFormController', sampleReviewFormController);

    function sampleReviewFormController($scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;

        angular.extend(this, utl.Ctrl.getBarcodePrintCtrl({ $scope: $scope }));

        $scope.item = {};
        $scope.details = [];
        $scope.EncounterInfo = {};
        $scope.canShowBarcodeButton = false;


        $scope.currentcontext = {
            selectall: false
        };
        $scope.currentcontext.id = parseInt($stateParams.id);

        $scope.currentcontext.testList = [];

        $scope.selectAllItems = function() {
            for (var idx in $scope.details) {
                var item = $scope.details[idx];
                if (!item.IsReadOnly) {
                    item.IsSelected = $scope.currentcontext.selectall;
                    item.IsAllSampleTypeSelected = $scope.currentcontext.selectall;
                    if (item.SampleDetailStatusId != 5) {
                        item.ReviewDate = item.IsSelected == true ? utl.Formatter.getCurrentDate() : null;
                    }
                }
            }
        }

        $scope.sampletypeSelectionChange = function(list, item) {
            for (var idx1 in list) {
                var detail = list[idx1];
                if (item.IsAllSampleTypeSelected &&
                    item.SampleType == detail.SampleType && !detail.IsReadOnly) {
                    detail.IsSelected = true;
                    detail.ReviewDate = utl.Formatter.getCurrentDate();
                } else if (!item.IsAllSampleTypeSelected &&
                    item.SampleType == detail.SampleType && !detail.IsReadOnly) {
                    detail.IsSelected = false;
                    detail.ReviewDate = null;
                }
            }
        }

        $scope.detailSelectionChanged = function(item) {
            item.ReviewDate = null;
            if (item.IsSelected == true) {
                item.ReviewDate = utl.Formatter.getCurrentDate();
            }
        }

        //getDetails
        $scope.getDetailsCallback = function(scope, res, options, hasError) {
            var result = res.Data;

            var testArr = [];
            for (var idx in result) {
                var item = result[idx];

                item.SubDepartmentName = item.Testmaster.SubDepartment ? item.Testmaster.SubDepartment.DepartmentName : null;

                var found = testArr.find(function(t) {
                    return t.SubDepartmentName == item.Testmaster.SubDepartmentName;
                });
                if (!found) {
                    found = { SubDepartmentName: item.SubDepartmentName, details: [] };
                    testArr.push(found);
                }

                item.IsAllSampleTypeSelected = true;
                item.IsAllSampleTypeReadOnly = true;
                //3 - Collected
                item.IsSelected = item.SampleDetailStatusId == 5 ? true : false;
                item.IsReadOnly = item.SampleDetailStatusId == 5 ? true : false;
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
                }
            }

            console.log(result);
            $scope.details = result;
        };
        $scope.testtat = function(item) {
            utl.Modal.open('app.tatdetails', {
                params: { pid: $scope.item.PatientId, oid: $scope.item.PatientOrderId, odid: item.Orderdetailid, tid: item.TestId },
                confirmCallback: $scope.getList
            });
        }
        $scope.openAttachments = function(wodetail) {
            var inputParams = { pid: $scope.item.PatientId, woid: $scope.item.Id };
            if (wodetail && wodetail.Id) {
                inputParams.wodid = wodetail.Id;
            }

            utl.Modal.open('app.woattachments', {
                params: inputParams,
                confirmCallback: $scope.loadData,
                cancelCallback: $scope.loadData
            });
        };
        $scope.getDetails = function(pageNo) {
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
                    action: 'lis/WorkOrderSampleDetail/GetWorkOrderSampleDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function() {
            $state.go('app.samplereviewlist');
        }
        $scope.testprofiledetails = function(TestId) {
                utl.Modal.open('app.testprofile', {
                    params: { tid: TestId },
                    confirmCallback: $scope.getList
                });
            }
            //getItem
        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.getEncounters();
        };

        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'lis/WorkOrderSample/GetWorkOrderSampleById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };


        //save item
        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            loadData();
        };

        $scope.saveItem = function() {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            if (checkMandatoryFields()) {

                var actionName = 'lis/WorkOrderSample/ManageWorkOrderReviewSample';
                var lines = getLinesForSave();

                if ($scope.details.length == lines.length) {
                    $scope.item.SampleStatusId = 5; //Received
                } else {
                    $scope.item.SampleStatusId = 4; //Partially Received
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
            var activeRecords = $filter('filterArrayItems')($scope.details, [
                { search: 1, fields: ['Status'] }
            ]);

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
                if (item.ReviewDate && item.IsSelected) {
                    item.SampleDetailStatusId = 5; //Received
                    result.push(item);
                }
            }
            return result;
        }


        function loadData() {
            $scope.getItem();
            $scope.getDetails();
        }

        $scope.getEncounterCallback = function(scope, res, options, hasError) {
            $scope.EncounterInfo = res.Data[0];
        };

        $scope.getEncounters = function() {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.item.Encounterid }
                ]
            };
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getEncounterCallback
            };

            utl.Http.doAction(options);
        };

        $scope.generatebarcode = function() {
            var vsampletype = [];
            for (var idx in $scope.currentcontext.testList) {
                var test = $scope.currentcontext.testList[idx].details;
                for (var idx1 in test) {
                    var detail = test[idx1];
                    if (detail.SampleIdentifier) {
                        if (!vsampletype[detail.SampleIdentifier]) {
                            vsampletype[detail.SampleIdentifier] = detail.SampleIdentifier || null;
                            var vSampleDisplay = "";
                            var vOrderPriority = "";
                            if (detail.Testmaster && detail.Testmaster.SampleDisplay)
                                vSampleDisplay = detail.Testmaster.SampleDisplay;

                            if (detail.OrderPriority && detail.OrderPriority.Description)
                                vOrderPriority = detail.OrderPriority.Description;

                            $scope.generateBarcodeScript(detail.CollectedDate, detail.SampleIdentifier, detail.SampleType, vSampleDisplay, vOrderPriority);
                        }
                    }
                }
            }
        };

        $scope.generateBarcodeScript = function(collectiondt, barcodenr, sampletype, vSampleDisplay, vOrderPriority) {
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

                if (vWardName && vWardName.length > 8)
                    vWardName = vWardName.substr(0, 8);

                if (collectiondt)
                    vCollectiondt = utl.Formatter.getDateTimeString(collectiondt);

            } catch (ex) {}

            var code = '';
            var printData = []
            var printCodes = {
                new_line: '\x0A'
            };
            var code = '';
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
            code += 'B327,95,2,1,3,9,61,B,"' + barcodenr + '"' + printCodes.new_line;
            code += 'A373,178,2,2,1,1,N,"' + vPatientName + '"' + printCodes.new_line;
            code += 'A373,158,2,2,1,1,N,"MRN:' + vMRN + '/ ' + vVisitIdentifier + '"' + printCodes.new_line;
            code += 'A374,138,2,2,1,1,N,"' + vAge + '/' + vGender + '-' + vEncoutnerType + '-' + vWardName + '"' + printCodes.new_line;
            code += 'A374,117,2,2,1,1,N,"' + vCollectiondt + '"' + printCodes.new_line;
            // code += 'A165,117,2,2,1,1,N,"' + sampletype + '"' + printCodes.new_line;
            code += 'P1,1' + printCodes.new_line;
            printData.push(code);
            $scope.printRaw(printData);

        };


        //lookup
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
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

        loadData();
    }

    sampleReviewFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();