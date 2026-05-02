(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OrderResultViewController', OrderResultViewController);

    function OrderResultViewController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        $scope.item = {};
        vm.details = [];
        $scope.AttachementImgs = [];
        $scope.item.isExternal = false;
        $scope.item.isExternaldisaled = false;
        $scope.currentcontext = {};
        $scope.currentcontext.testtypeid = parseInt($stateParams.testtypeid);
        $scope.currentcontext.parent = $stateParams.pt;
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
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
            // $scope.currentcontext.deptcode = 60;
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


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
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

        /*  Start -- Attachment Images */

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

        $scope.initLookup();
    }

    OrderResultViewController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();
