(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PreviouslabResultListController', PreviouslabResultListController);

    function PreviouslabResultListController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        vm.orders = [];
        $scope.AttachementImgs = [];
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
        };

        $scope.currentfilter = {
            orderno: '',
            testname: '',
            DoctorId: -1,
            From: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            To: utl.Formatter.getCurrentDate()
        }
        if (utl.Session.getUserTypeId() == 2) // 2=> Physician
        {
            $scope.currentfilter.DoctorId = utl.Session.getCurrentUserId();
        }
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.eid = modalConfig.params.eid;
            $scope.currentcontext.pid = modalConfig.params.pid;
            $scope.currentcontext.cid = modalConfig.params.cid;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.eid = parseInt($stateParams.eid);
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
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
            var inputParams = { pid: $scope.currentcontext.pid, woid: -1, readonly: true };
            if (wo && wo.Id) {
                inputParams.woid = wo.Id;
            }
            utl.Modal.open('app.woattachments', {
                params: inputParams
            });
        };
        $scope.resultview = function (wo) {
            if ($scope.currentcontext.statusid >= 7) {
                var inputParams = { pid: $scope.currentcontext.pid, eid: $scope.currentcontext.eid };
                utl.Modal.open('patientemr.labresultview', {
                    params: inputParams
                });
            } else
                utl.Alert.showErrorMsg($translate.instant('ordermanagement.labresult-list.alertmsg.lbl'));
        };
        //back
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }

        $scope.toggleCanShowDetails = function (clickedItem) {
            for (var idx in vm.orders) {
                var item = vm.orders[idx];
                if (item.Id == clickedItem.Id) {
                    item.CanShowDetails = !item.CanShowDetails;
                } else {
                    item.CanShowDetails = false;
                }
            }
            $scope.getDetails(clickedItem);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.orders = res.Data;
            var workorder = [];
            for (var idx in vm.orders) {
                workorder = vm.orders[idx].PatientWorkorders;
                for (var idx in workorder) {
                    var wodetails = workorder[idx];
                }
            }
            $scope.currentcontext.statusid = wodetails.WorkOrderStatusId;
            // prepareTestResult();
            $scope.getAttachementImgList(wodetails);
        };

        $scope.getList = function () {
            var fromdate = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var todate = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    // {
                    //     Key: 18,
                    //     Value: $scope.currentcontext.eid
                    // },
                    {
                        Key: 12,
                        Value: fromdate
                    },
                    {
                        Key: 13,
                        Value: todate
                    },
                    {
                        Key: 4,
                        Value: '11'
                    }, //orderstatus = completed
                    {
                        Key: 9,
                        Value: 1
                    }, // testtype = lab
                    {
                        Key: 22,
                        Value: [4, 5, 7, 8, 9]
                    } // includeWOStatus Approved and Released
                ]
            }


            var options = {
                action: 'emr/patientorder/GetPatientOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getDetailsCallback = function (scope, res, options, hasError) {
            vm.woorders = [];
            vm.woorders = res.Data;
            prepareTestResult();

        };

        $scope.getDetails = function (item) {
            $scope.PatOrdId = item.Id;
            var fromdate = $filter('date')($scope.currentfilter.fromdate, 'yyyy-MM-dd 00:00:00') || null;
            var todate = $filter('date')($scope.currentfilter.todate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 0,
                        Value: item.Id
                    },
                    {
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    // {
                    //     Key: 18,
                    //     Value: $scope.currentcontext.eid
                    // },
                    {
                        Key: 4,
                        Value: '11'
                    }, //orderstatus = completed
                    {
                        Key: 9,
                        Value: 1
                    }, // testtype = lab
                    // { Key: 12, Value: fromdate },
                    // { Key: 13, Value: todate },
                    {
                        Key: 22,
                        Value: [4, 5, 7, 8, 9]
                    } // includeWOStatus Approved and Released
                ]
            };

            var options = {
                action: 'emr/patientorder/GetPatientOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDetailsCallback
            };

            utl.Http.doAction(options);
        }

        $scope.getAttachementImgList = function (wodetails) {
            if ($scope.currentcontext && $scope.currentcontext.pid > 0 && wodetails.Id > 0) {
                var pid = $scope.currentcontext.pid;
                var woid = wodetails.Id;
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

            // $scope.getDetails();

            // $scope.getAttachementImgList();

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



        $scope.openNav = function () {
            if ($('#mySidenav').hasClass('hidden')) {
                $('#mySidenav').removeClass('hidden');
                $('#mySidenav').attr('style', 'width: 250px');
                $('#imgOpen').attr('style', 'position: relative;right: 215px;');
                $('#imgOpen').text("Close");
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
                    eid: $scope.currentcontext.eid,
                    pid: $scope.currentcontext.pid,
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
                'WOId': options.data.Data.woid,
                'WODId': options.data.Data.wodid,
                'ImgEncData': data.Photo,
                'filename': options.data.Data.FileName,
                'filepath': options.data.Data.PhotoPath,
            });
        };
        $scope.getAttachementImgs = function (Id_, WOId, WODId, FilePath_, FileName_) {
            if (FilePath_) {
                var inputData = { Id: Id_, woid: WOId, wodid: WODId, PhotoPath: FilePath_, FileName: FileName_ };
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
            $scope.AttachmentCount = res.Data.length;
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


        function prepareTestResult() {
            for (var jdx in vm.woorders) {
                for (var kdx in vm.woorders[jdx].PatientWorkorders) {

                    var result = vm.woorders[jdx].PatientWorkorders[kdx].PatientWorkorderdetails;
                    var testArr = [];
                    var tabIndex = 0;
                    var profileName = "";
                    var rootProfileName = "";
                    for (var idx in result) {
                        var item = result[idx];
                        if (item.Resultvalue) {
                            var found = testArr.find(function (t) {
                                return t.Testname == item.Testname;
                            });
                            if (!found) {
                                found = {
                                    Testid: item.Testid,
                                    Testname: item.Testname,
                                    details: [],
                                    TestDisplayOrder: item.TestDisplayOrder
                                };
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
                    }

                    //Sorting by test and analyte displayorder
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
                    }

                    vm.woorders[jdx].PatientWorkorders[kdx].woDetails = testArr;
                }
            }
        }

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'view') {
                utl.Modal.open('app.orderresultview', {
                    params: { id: row.entity.Id, pid: row.entity.Patientid },
                    confirmCallback: $scope.onDetailSave
                });
            } else if (actionType == 'BIO') {
                printBIO(row);
            } else if (actionType == 'HIS') {
                printHIS(row);
            } else if (actionType == 'MIc') {
                printMIC(row);
            } else if (actionType == 'RIS') {
                printRIS(row);
            } else if (actionType == 'Endoscopy') {
                printEndo(row);
            } else if (actionType == 'ERCP') {
                printERCP(row);
            }
            // else if (actionType == 'print') {
            //     $scope.print(row.entity);
            // }
        };


        function printBIO(row) {
            var inputData = {
                Id: row.entity.Id
            };
            var options = {
                action: 'lis/patientworkorder/PrintPatientWorkorder',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        function printHIS(row) {
            var inputData = {
                Id: row.entity.Id
            };
            var options = {
                action: 'lis/patientworkorder/Printmicrobiology',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        function printMIC(row) {
            var inputData = {
                Id: row.entity.Id,
                Data: true
            };
            var options = {
                action: 'lis/patientworkorder/Printmicrobiology',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        function printRIS(row) {
            var inputData = {
                Id: row.entity.Id,
                Data: true
            };
            var options = {
                action: 'lis/patientworkorder/PrintExternalLab',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        function printEndo(row) {
            var inputData = {
                Id: row.entity.Id,
                Data: true
            };
            var options = {
                action: 'lis/patientworkorder/Printpathaology',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        function printERCP(row) {
            var inputData = {
                Id: row.entity.Id,
                Data: true
            };
            var options = {
                action: 'lis/patientworkorder/PrintERCP',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }


        $scope.PrintConsolidateLabResult = function () {

            var inputData = {
                Data: {
                    PatientId: $scope.currentcontext.pid,
                    EncounterId: $scope.currentcontext.eid,
                    ConsultationId: $scope.currentcontext.cid
                }
            };
            var options = {
                action: 'emr/consultation/PrintDischargeLabResult',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        //Lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
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

    PreviouslabResultListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();