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
            selectall: false,
            id: parseInt($stateParams.id) || 0,
            testList: []
        };

        // Selection Handlers
        $scope.selectAllItems = function() {
            for (var idx in $scope.details) {
                var item = $scope.details[idx];
                if (!item.IsReadOnly && item.SampleDetailStatusId != 5) {
                    item.IsSelected = $scope.currentcontext.selectall;
                    item.IsAllSampleTypeSelected = $scope.currentcontext.selectall;
                    item.ReviewDate = item.IsSelected ? utl.Formatter.getCurrentDate() : null;
                }
            }
        };

        $scope.sampletypeSelectionChange = function(list, item) {
            for (var idx1 in list) {
                var detail = list[idx1];
                if (detail.SampleDetailStatusId == 5 || detail.IsReadOnly) continue;
                if (item.IsAllSampleTypeSelected && item.SampleType == detail.SampleType) {
                    detail.IsSelected = true;
                    detail.ReviewDate = utl.Formatter.getCurrentDate();
                } else if (!item.IsAllSampleTypeSelected && item.SampleType == detail.SampleType) {
                    detail.IsSelected = false;
                    detail.ReviewDate = null;
                }
            }
        };

        $scope.detailSelectionChanged = function(item) {
            if (item.SampleDetailStatusId == 5 || item.IsReadOnly) return;
            if (item.IsSelected === true) {
                if (!item.ReviewDate) {
                    item.ReviewDate = utl.Formatter.getCurrentDate();
                }
            } else {
                item.ReviewDate = null;
            }
        };

        // API Callbacks & Loaders
        $scope.getDetailsCallback = function(scope, res, options, hasError) {
            var result = (res && res.Data) ? res.Data : [];
            var testArr = [];

            for (var idx in result) {
                var item = result[idx];

                item.SubDepartmentName = (item.Testmaster && item.Testmaster.SubDepartment)
                    ? item.Testmaster.SubDepartment.DepartmentName
                    : null;

                var found = testArr.find(function(t) {
                    return t.SubDepartmentName === item.SubDepartmentName;
                });
                if (!found) {
                    found = { SubDepartmentName: item.SubDepartmentName, details: [] };
                    testArr.push(found);
                }

                var isAlreadyReceived = (item.SampleDetailStatusId == 5);
                item.IsAllSampleTypeSelected = isAlreadyReceived;
                item.IsAllSampleTypeReadOnly = isAlreadyReceived;
                item.IsSelected = isAlreadyReceived;
                item.IsReadOnly = isAlreadyReceived;
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
                    } else {
                        detail.SampleTypeIndex++;
                    }

                    if (detail.SampleIdentifier) {
                        $scope.canShowBarcodeButton = true;
                    }

                    if (detail.SampleDetailStatusId != 5) {
                        detail.IsAllSampleTypeSelected = false;
                        detail.IsAllSampleTypeReadOnly = false;
                    }
                }
            }

            $scope.details = result;
            $scope.refreshReactProps();
        };

        $scope.testtat = function(item) {
            var orderDetailId = item ? (item.OrderDetailId || item.Orderdetailid) : null;
            var testId = item ? item.TestId : null;
            utl.Modal.open('app.tatdetails', {
                params: {
                    pid: $scope.item.PatientId,
                    oid: $scope.item.PatientOrderId,
                    odid: orderDetailId,
                    tid: testId
                },
                confirmCallback: loadData
            });
        };

        $scope.openAttachments = function(wodetail) {
            var inputParams = { pid: $scope.item.PatientId, woid: $scope.item.Id };
            if (wodetail && wodetail.Id) {
                inputParams.wodid = wodetail.Id;
            }

            utl.Modal.open('app.woattachments', {
                params: inputParams,
                confirmCallback: loadData,
                cancelCallback: loadData
            });
        };

        $scope.testprofiledetails = function(testId) {
            utl.Modal.open('app.testprofile', {
                params: { tid: testId },
                confirmCallback: loadData
            });
        };

        $scope.getDetails = function() {
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
        };

        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data || {};
            $scope.getEncounters();
            $scope.refreshReactProps();
        };

        $scope.getItem = function() {
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

        $scope.getEncounterCallback = function(scope, res, options, hasError) {
            $scope.EncounterInfo = (res && res.Data && res.Data.length > 0) ? res.Data[0] : {};
            $scope.refreshReactProps();
        };

        $scope.getEncounters = function() {
            if ($scope.item && $scope.item.Encounterid) {
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
            }
        };

        // Save review items
        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl') || 'Specimens successfully reviewed and received!');
            loadData();
        };

        $scope.saveItem = function() {
            if (checkMandatoryFields()) {
                var actionName = 'lis/WorkOrderSample/ManageWorkOrderReviewSample';
                var lines = getLinesForSave();

                if ($scope.details.length === lines.length) {
                    $scope.item.SampleStatusId = 5; // Received
                } else {
                    $scope.item.SampleStatusId = 4; // Partially Received
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
            ]) || $scope.details;

            var atLeastOneSelected = false;
            for (var idx in activeRecords) {
                var itm = activeRecords[idx];
                if (itm.IsSelected && itm.SampleDetailStatusId != 5) {
                    atLeastOneSelected = true;
                    break;
                }
            }

            if (!atLeastOneSelected) {
                utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl') || 'Please select at least one specimen to review and receive.');
                return false;
            }
            return true;
        }

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.details) {
                var item = $scope.details[idx];
                if (item.IsSelected) {
                    if (!item.ReviewDate) {
                        item.ReviewDate = utl.Formatter.getCurrentDate();
                    }
                    item.SampleDetailStatusId = 5; // Received
                    result.push(item);
                }
            }
            return result;
        }

        function loadData() {
            $scope.getItem();
            $scope.getDetails();
        }

        // Barcode printing
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
                            if (detail.Testmaster && detail.Testmaster.SampleDisplay) {
                                vSampleDisplay = detail.Testmaster.SampleDisplay;
                            }
                            if (detail.OrderPriority && detail.OrderPriority.Description) {
                                vOrderPriority = detail.OrderPriority.Description;
                            }
                            $scope.generateBarcodeScript(detail.CollectedDate, detail.SampleIdentifier, detail.SampleType, vSampleDisplay, vOrderPriority);
                        }
                    }
                }
            }
        };

        $scope.generateBarcodeScript = function(collectiondt, barcodenr, sampletype, vSampleDisplay, vOrderPriority) {
            var vPatientName = '';
            var vMRN = '';
            var vVisitIdentifier = '';
            var vAge = '';
            var vGender = '';
            var vEncounterType = '';
            var vWardName = '';
            var vCollectiondt = '';

            try {
                if ($scope.EncounterInfo && $scope.EncounterInfo.Patient) {
                    var p = $scope.EncounterInfo.Patient;
                    if (p.Title && p.Title.Description) vPatientName += p.Title.Description + ' ';
                    if (p.FirstName) vPatientName += p.FirstName + ' ';
                    if (p.LastName) vPatientName += p.LastName;
                    if (p.MRN) vMRN = p.MRN;
                    if (p.Age) vAge = p.Age + ' Y';
                    if (p.Gender && p.Gender.Description) vGender = p.Gender.Description[0] || '';
                }

                if ($scope.EncounterInfo && $scope.EncounterInfo.VisitIdentifier) {
                    vVisitIdentifier = $scope.EncounterInfo.VisitIdentifier;
                }

                if ($scope.EncounterInfo && $scope.EncounterInfo.EncounterType && $scope.EncounterInfo.EncounterType.Description) {
                    vEncounterType = $scope.EncounterInfo.EncounterType.Description;
                }

                if ($scope.EncounterInfo && $scope.EncounterInfo.WardMaster && $scope.EncounterInfo.WardMaster.WardName) {
                    vWardName = $scope.EncounterInfo.WardMaster.WardName;
                    if (vWardName.length > 8) vWardName = vWardName.substr(0, 8);
                }

                if (collectiondt) {
                    vCollectiondt = utl.Formatter.getDateTimeString(collectiondt);
                }
            } catch (ex) {}

            var printData = [];
            var nl = '\x0A';
            var code = '';
            code += 'I8,A,001' + nl;
            code += 'Q200,024' + nl;
            code += 'q831' + nl;
            code += 'rN' + nl;
            code += 'S2' + nl;
            code += 'D15' + nl;
            code += 'ZT' + nl;
            code += 'JF' + nl;
            code += 'O' + nl;
            code += 'R215,0' + nl;
            code += 'f100' + nl;
            code += 'N' + nl;
            code += 'B327,95,2,1,3,9,61,B,"' + barcodenr + '"' + nl;
            code += 'A373,178,2,2,1,1,N,"' + vPatientName + '"' + nl;
            code += 'A373,158,2,2,1,1,N,"MRN:' + vMRN + '/ ' + vVisitIdentifier + '"' + nl;
            code += 'A374,138,2,2,1,1,N,"' + vAge + '/' + vGender + '-' + vEncounterType + '-' + vWardName + '"' + nl;
            code += 'A374,117,2,2,1,1,N,"' + vCollectiondt + '"' + nl;
            code += 'P1,1' + nl;
            printData.push(code);

            if (typeof $scope.printRaw === 'function') {
                $scope.printRaw(printData);
            }
        };

        // MediFlow React Bridge State Synchronization
        $scope.refreshReactProps = function() {
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
                WardName: ward.WardName || 'OPD / Diagnostic Lab',
                BedNo: bed.BedNo || '',
                RoomNo: room.RoomNo || '',
                VisitIdentifier: $scope.EncounterInfo ? $scope.EncounterInfo.VisitIdentifier : '',
                EncounterType: ($scope.EncounterInfo && $scope.EncounterInfo.EncounterType) ? $scope.EncounterInfo.EncounterType.Description : ''
            };

            var orderInfoData = {};
            if ($scope.item) {
                var order = $scope.item.PatientOrder || {};
                var doc = order.User ? ((order.User.FirstName || '') + ' ' + (order.User.LastName || '')) : '';
                orderInfoData = {
                    Id: $scope.item.Id,
                    OrderNumber: order.OrderNumber || '',
                    BillNumber: order.BillNumber || '',
                    OrderDate: order.OrderRequestDate || null,
                    SampleStatus: $scope.item.SampleStatus ? $scope.item.SampleStatus.Description : 'Pending',
                    SampleStatusId: $scope.item.SampleStatusId || 1,
                    DoctorName: doc
                };
            }

            var hasPendingItems = false;
            var cleanDetails = ($scope.details || []).map(function(d) {
                var isReceived = Boolean(d.SampleDetailStatusId == 5 || (d.SampleStatus && d.SampleStatus.Description === 'Received'));
                if (!isReceived) {
                    hasPendingItems = true;
                }

                return {
                    Id: d.Id,
                    WorkOrderSampleId: d.WorkOrderSampleId,
                    OrderDetailId: d.OrderDetailId || d.Orderdetailid,
                    TestId: d.TestId,
                    TestName: d.TestName,
                    TestCode: d.Testmaster ? d.Testmaster.Code : '',
                    SampleType: d.SampleType,
                    SampleIdentifier: d.SampleIdentifier || null,
                    OrderPriority: d.OrderPriority ? d.OrderPriority.Description : 'Routine',
                    SampleStatus: d.SampleStatus ? d.SampleStatus.Description : (isReceived ? 'Received' : 'Collected'),
                    SampleStatusId: d.SampleStatusId,
                    SampleDetailStatusId: d.SampleDetailStatusId,
                    CollectedDate: d.CollectedDate,
                    ReviewDate: d.ReviewDate,
                    IsSelected: isReceived ? true : Boolean(d.IsSelected),
                    IsReadOnly: isReceived ? true : Boolean(d.IsReadOnly),
                    SampleVolume: d.Testmaster ? d.Testmaster.SampleVolume : '',
                    SubDepartmentName: d.SubDepartmentName,
                    IsSeparateSampleId: d.IsSeparateSampleId
                };
            });

            var canBarcode = Boolean(
                $scope.canShowBarcodeButton ||
                $scope.currentcontext.id ||
                ($scope.details && $scope.details.some(function(d) { return Boolean(d.SampleIdentifier); }))
            );

            $scope.reactProps = {
                sampleId: $scope.currentcontext.id,
                orderId: $scope.item ? $scope.item.PatientOrderId : null,
                patient: patientData,
                encounter: encounterData,
                orderInfo: orderInfoData,
                details: cleanDetails,
                canShowSave: hasPendingItems,
                canShowBarcodeButton: canBarcode,
                facilityName: utl.Session.getCurrentFacilityName ? utl.Session.getCurrentFacilityName() : 'SHUVADARSINI HOSPITAL'
            };

            $scope.$applyAsync();
        };

        // MediFlow Action Dispatcher Bridge
        $scope.handleReactAction = function(actionName, payload) {
            if (actionName === 'back') {
                $scope.backToList();
            } else if (actionName === 'toggleSelectAll') {
                $scope.currentcontext.selectall = payload ? Boolean(payload.selectAll) : true;
                $scope.selectAllItems();
                $scope.refreshReactProps();
            } else if (actionName === 'toggleSampleType') {
                if (payload) {
                    var targetItem = ($scope.details || []).find(function(d) {
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
                    var target = ($scope.details || []).find(function(d) {
                        return d.Id === payload.item.Id;
                    });
                    if (target) {
                        target.IsSelected = Boolean(payload.isSelected);
                        $scope.detailSelectionChanged(target);
                    }
                }
                $scope.refreshReactProps();
            } else if (actionName === 'updateReviewDate') {
                if (payload && payload.id) {
                    var targetRow = ($scope.details || []).find(function(d) {
                        return d.Id === payload.id;
                    });
                    if (targetRow) {
                        targetRow.ReviewDate = payload.date;
                    }
                }
                $scope.refreshReactProps();
            } else if (actionName === 'save') {
                $scope.saveItem();
            } else if (actionName === 'generateBarcode') {
                $scope.generatebarcode();
            } else if (actionName === 'tat') {
                if (payload) {
                    var targetTat = ($scope.details || []).find(function(d) {
                        return d.Id === payload.Id;
                    });
                    $scope.testtat(targetTat || payload);
                }
            } else if (actionName === 'attachments') {
                if (payload) {
                    var targetAtt = ($scope.details || []).find(function(d) {
                        return d.Id === payload.Id;
                    });
                    $scope.openAttachments(targetAtt || payload);
                }
            } else if (actionName === 'testProfile') {
                if (payload) {
                    $scope.testprofiledetails(payload);
                }
            }
        };

        // Initialize
        $scope.refreshReactProps();
        loadData();
    }

    sampleReviewFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();