(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('labResultListController', labResultListController);

    function labResultListController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
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
            // fromdate: '',
            // todate: utl.Formatter.getCurrentDate(),
            From: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            To: utl.Formatter.getCurrentDate()
        }
        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        if ($stateParams.from) {
            $scope.From = $stateParams.from;
        }
        if (utl.Session.getUserTypeId() == 2) // 2=> Physician
        {
            $scope.currentfilter.DoctorId = utl.Session.getCurrentUserId();
        }
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.eid = modalConfig.params.eid;
            $scope.currentcontext.pid = modalConfig.params.pid;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.eid = parseInt($stateParams.eid);
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }
        $scope.currentcontext.testList = [];

        $scope.currentcontext = {
            option: 'currentvisits'
        }
        $scope.checkedinpatients = function () {
            $state.go('app.inpatienttab.allinpatient');
        };
        $scope.options = [{
            key: 'currentvisits',
            name: $translate.instant('Current Visits')
        },
        {
            key: 'previousvisits',
            name: $translate.instant('Previous Visits')
        }
        ];

        if ($stateParams.pid)
            $scope.currentcontext.pid = $stateParams.pid;
        else
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());

        if ($stateParams.eid)
            $scope.currentcontext.eid = $stateParams.eid;
        else
            $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());


        $scope.openObservations = function (wodetail) {
            var inputParams = {
                pid: $scope.currentcontext.pid,
                woid: -1,
                readonly: true
            };
            if (wodetail && wodetail.Id) {
                inputParams.wodid = wodetail.Id;
            }

            utl.Modal.open('app.woobservations', {
                params: inputParams
            });
        };

        $scope.openAttachments = function (wodetail) {
            var inputParams = {
                pid: $scope.currentcontext.pid,
                woid: -1,
                readonly: true
            };
            if (wodetail && wodetail.Id) {
                inputParams.wodid = wodetail.Id;
            }

            utl.Modal.open('app.woattachments', {
                params: inputParams
            });
        };

        $scope.openWOAttachments = function (wo) {
            var inputParams = {
                pid: $scope.currentcontext.pid,
                woid: wo.Id,
                readonly: true
            };

            utl.Modal.open('app.woattachments', {
                params: inputParams
            });
        };
        $scope.resultview = function (wo) {
            if ($scope.currentcontext.statusid >= 7) {
                var inputParams = {
                    pid: $scope.currentcontext.pid,
                    eid: $scope.currentcontext.eid
                };
                utl.Modal.open('patientemr.labresultview', {
                    params: inputParams
                });
            } else
                utl.Alert.showErrorMsg($translate.instant('ordermanagement.labresult-list.alertmsg.lbl'));
        };
        //back
        $scope.doctor_dashboard = function () {
            if ($scope.context == 'surgery') {
                $state.go('app.surgerydashboard');
            }
            if ($scope.From == 'nursing') {
                $state.go('app.nursingdashboard');
            } else {
                $state.go('app.doctordashboard');
            }
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }
        //
        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.orders = res.Data;
            var workorder = [];
            for (var idx in vm.orders) {
                workorder = vm.orders[idx].PatientWorkorders;
                for (var wx in workorder) {
                    var wodetails = workorder[wx];
                    vm.orders[idx].IsProvisional = false;
                    if (wodetails.WorkOrderStatusId == 4 || wodetails.WorkOrderStatusId == 5) {
                        vm.orders[idx].IsProvisional = true;
                    }
                }
            }
            $scope.currentcontext.statusid = wodetails.WorkOrderStatusId;
            // prepareTestResult();
            $scope.getAttachementImgList(wodetails);
        };

        $scope.getList = function () {
            if ($scope.currentcontext.option == 'currentvisits') {
                var fromdate = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
                var todate = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
                var inputData = {
                    Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 18,
                        Value: $scope.currentcontext.eid
                    },
                    // {
                    //     Key: 4,
                    //     Value: '11'
                    // }, //orderstatus = completed
                    {
                        Key: 6,
                        Value: $scope.currentfilter.orderno
                    },
                    {
                        Key: 12,
                        Value: fromdate
                    },
                    {
                        Key: 13,
                        Value: todate
                    },
                    {
                        Key: 9,
                        Value: 1
                    }, // testtype = lab
                    // {
                    //     Key: 23,
                    //     Value: $scope.currentfilter.TestName
                    // },
                    {
                        Key: 22,
                        Value: [4, 5, 7, 8, 9]
                    } // includeWOStatus Approved and Released
                    ]
                }
            };

            if ($scope.currentcontext.option == 'previousvisits') {
                var inputData = {
                    Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    // {
                    //     Key: 4,
                    //     Value: '11'
                    // }, //orderstatus = completed
                    {
                        Key: 6,
                        Value: $scope.currentfilter.orderno
                    },
                    {
                        Key: 9,
                        Value: 1
                    }, // testtype = lab
                    // {
                    //     Key: 12,
                    //     Value: fromdate
                    // },
                    // {
                    //     Key: 13,
                    //     Value: todate
                    // },
                    // { Key: 10, Value: $scope.currentfilter.DoctorId },
                    // {
                    //     Key: 23,
                    //     Value: $scope.currentfilter.TestName
                    // },
                    {
                        Key: 22,
                        Value: [4, 5, 7, 8, 9]
                    } // includeWOStatus Approved and Released
                    ]
                };
            }
            var options = {
                action: 'emr/patientorder/GetMinPatientOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.openLabResults = function () {
            utl.Modal.open('app.previouslabresult', {
                params: {
                    eid: $scope.currentcontext.eid,
                    pid: $scope.currentcontext.pid
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.getDetailsCallback = function (scope, res, options, hasError) {
            vm.woorders = [];
            vm.woorders = res.Data;
            for (var idx in res.Data) {
                var orders = res.Data[idx];
                $scope.currentcontext.WoId = res.Data[0].Workorderid;
                $scope.currentcontext.OrderId = res.Data[0].Orderid;
            }

            prepareTestResult();
        };

        $scope.getDetails = function (item) {
            $scope.OrderInfo = item;
            $scope.PatOrdId = item.Id;
            var fromdate = $filter('date')($scope.currentfilter.fromdate, 'yyyy-MM-dd 00:00:00') || null;
            var todate = $filter('date')($scope.currentfilter.todate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: item.Id
                },
                {
                    Key: 4,
                    Value: $scope.currentcontext.pid
                },
                {
                    Key: 38,
                    Value: [4, 5, 7, 8, 9]
                },
                ]
            };

            var options = {
                action: 'lis/patientworkorderdetails/GetPatientWorkorderdetailss',
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


        $scope.openNav = function () {
            if ($('#mySidenav').hasClass('hidden')) {
                $('#mySidenav').removeClass('hidden');
                $('#mySidenav').attr('style', 'width: 250px; position: relative;float:right;right: 0px;');
                $('#imgOpen').attr('style', 'position: relative;');
                $('#imgOpen').text("Close");
            } else {
                $scope.closeNav();
            }
        }
        $scope.closeNav = function () {
            $('#mySidenav').attr('style', 'width: 0px;position: relative');
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



        function prepareTestResult() {
            // for (var jdx in vm.woorders) {

            var result = vm.woorders;
            var testArr = [];
            var tabIndex = 0;
            var profileName = "";
            var rootProfileName = "";
            for (var idx in vm.woorders) {
                var item = vm.woorders[idx];
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

            vm.woorders[idx].woDetails = testArr;

            // }
        }

        $scope.printcon = function () {
            var inputData = {
                Id: $scope.currentcontext.eid
            };
            var options = {
                action: 'emr/patientorder/PrintPatientOrders',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        // $scope.print = function(wo) {
        //     $scope.currentcontext.id = wo.Orderid;
        //     var inputData = {
        //         Id: $scope.currentcontext.id
        //     };
        //     var options = {
        //         action: 'emr/patientorder/PrintPatientOrder',
        //         data: inputData,
        //         type: 'post'
        //     };
        //     utl.Http.doDownload(options);
        // }
        $scope.print1 = function () {
            var inputData = {
                Id: $scope.currentcontext.eid
            };
            var options = {
                action: 'emr/patientorder/PrintPatientOrders',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.print2 = function () {
            var inputData = {
                Id: $scope.currentcontext.eid
            };
            var options = {
                action: 'emr/patientorder/PrintPatientOrdersWithoutHeader',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        $scope.print = function () {
            // console.log(vm.woorders)
            const unique = [...new Set(vm.woorders.map(item => item.Workorderid))];
            console.log(unique.length);
            console.log(typeof (unique));
            // return;
            var inputData = {
                Id: $scope.currentcontext.WoId,
                Data: {
                    IsDepartment: true,
                    isfrom: 'resultdispatch'
                }
            };
            var action = 'lis/patientworkorder/PrintPatientWorkorder';
            if (unique.length > 1) {
                action = 'lis/patientworkorder/PrintPatientWorkorderArray';
                inputData.Id = $scope.currentcontext.OrderId;
            }
            var options = {
                action: action,
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $('#order').focus();

        //Document attachment code starts
        $scope.fileSelected = function () {
            if ($scope.currentcontext.file && $scope.currentcontext.file.name) {
                $scope.item.Name = $scope.currentcontext.file.name;
            }
        }
        //Document attachment code ends

        $scope.saveItem = function () {

            if (!$scope.currentcontext.file) {
                utl.Alert.showErrorMsg($translate.instant('patientemr.patientdocument-form.nofilemsg.lbl'));
                return;
            }

            var actionName = 'emr/ClinicalDocument/AddClinicalDocument';
            var actionUrl = utl.Http.getRootPath() + actionName;
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/ClinicalDocument/UpdateClinicalDocument';
            }

            Upload.upload({
                url: actionUrl,
                data: {
                    file: $scope.currentcontext.file,
                    Data: $scope.item
                }
            }).then(function (resp) { //upload function returns a promise
                utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                $scope.currentcontext.file = null;
                $scope.backToList();
            },
                function (resp) { //catch error
                    console.log('Error status: ' + resp.status);
                    utl.Alert.showErrorMsg('Error status: ' + resp.status);
                },
                function (evt) {
                    console.log(evt);
                });
        };


        //Lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getDetails();
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

    labResultListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();