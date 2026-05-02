(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('EndoscopyResultController', EndoscopyResultController);

    function EndoscopyResultController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
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
            fromdate: '',
            todate: utl.Formatter.getCurrentDate(),
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
        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            // vm.orders = res.Data;
            // var workorder = [];
            // for (var idx in vm.orders) {
            //     workorder = vm.orders[idx].PatientWorkorders;
            //     for (var idx in workorder) {
            //         var wodetails = workorder[idx];
            //     }
            // }
            // $scope.currentcontext.statusid = wodetails.WorkOrderStatusId;
            // prepareTestResult();
            // $scope.getAttachementImgList(wodetails);
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.fromdate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.todate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 3, Value: [4, 5, 7, 8, 9] },
                    { Key: 6, Value: 4 }, // testtype = endoscopy
                    { Key: 7, Value: $scope.currentcontext.pid },
                    { Key: 24, Value: $scope.currentcontext.eid },
                    { Key: 26, Value: From },
                    { Key: 27, Value: To },
                    { Key: 28, Value: $scope.currentfilter.orderno },
                    { Key: 29, Value: $scope.currentfilter.TestName },
                    // { Key: 2, Value: $scope.currentcontext.pid },
                    // { Key: 18, Value: $scope.currentcontext.eid },
                    // //{ Key: 4, Value: '11' }, //orderstatus = completed
                    // { Key: 6, Value: $scope.currentfilter.orderno },
                    // { Key: 9, Value: 4 }, // testtype = endoscopy
                    // { Key: 12, Value: $scope.currentfilter.fromdate },
                    // { Key: 13, Value: $scope.currentfilter.todate },
                    // { Key: 10, Value: $scope.currentfilter.DoctorId },
                    // { Key: 23, Value: $scope.currentfilter.TestName },
                    // { Key: 22, Value: [4, 5, 7, 8, 9] } // includeWOStatus Approved and Released
                ]
            };

            var options = {
                action: 'lis/patientworkorder/GetPatientWorkorders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
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



        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "idx", displayName: $translate.instant('S.No'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{rowRenderIndex+ 1}} </span> </div>"
                },

                {
                    field: "TechValidationdate", displayName: $translate.instant('ordermanagement.correlation.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.TechValidationdate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.TechValidationdate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "WorkOrderdid", displayName: $translate.instant('ordermanagement.correlation.wonum.lbl')
                },
                {
                    field: "PatientOrder.OrderNumber", displayName: $translate.instant('ordermanagement.myorderprocess-list.ordernumber.lbl')
                },
                {
                    field: "Orderedbyname",
                    displayName: $translate.instant('ordermanagement.correlation.doctor.lbl')
                },
                {
                    field: "MedValidationByName",
                    displayName: $translate.instant('ordermanagement.correlation.approvedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.MedUser.Title.Description}}&nbsp;</span>" + "<span >{{row.entity.MedUser.FirstName}}&nbsp;</span>" + "<span >{{row.entity.MedUser.LastName}}</span>" + "</div>"
                },
                {
                    field: "WardRoomMaster",
                    displayName: $translate.instant('admissions.roomdetails.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span  ng-if='row.entity.Encounter.WardMaster'>{{row.entity.Encounter.WardMaster.WardName }}</span>" +
                        "<span  ng-if='row.entity.Encounter.WardRoomMaster'>/</span>" +
                        "<span  ng-if='row.entity.Encounter.WardRoomMaster'>{{row.entity.Encounter.WardRoomMaster.RoomNo }}</span>" +
                        "<span  ng-if='row.entity.Encounter.WardRoomBedMaster'>/</span>" +
                        "<span  ng-if='row.entity.Encounter.WardRoomBedMaster'>{{row.entity.Encounter.WardRoomBedMaster.BedNo}}</span>" +
                        "</div>"
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                <span class="grid-action"ng-click="grid.appScope.handleEvents(\'view\',row)" ><i class="btn btn-default btn-xs fa fa-eye" aria-hidden="true"></i></span>\
                                <a class="grid-action" ng-show="row.entity.TestTypeId ==1" ng-click="grid.appScope.handleEvents(\'BIO\',row)" translate="BIO"></a>\
                                <a class="grid-action"  ng-show="row.entity.TestTypeId ==1" ng-click="grid.appScope.handleEvents(\'HIS\',row)" translate="HIS"></a>\
                                <a class="grid-action"  ng-show="row.entity.TestTypeId ==1" ng-click="grid.appScope.handleEvents(\'MIc\',row)" translate="MIc"></a>\
                                <a class="grid-action"  ng-show="row.entity.TestTypeId ==2"ng-click="grid.appScope.handleEvents(\'RIS\',row)" translate="RIS"></a>\
                                <a class="grid-action"  ng-show="row.entity.TestTypeId ==4"ng-click="grid.appScope.handleEvents(\'Endoscopy\',row)" translate="Endoscopy"></a>\
                                <a class="grid-action"  ng-show="row.entity.TestTypeId ==4"ng-click="grid.appScope.handleEvents(\'ERCP\',row)" translate="ERCP"></a>\
                            </div>'
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        $scope.print = function (wo) {
            $scope.currentcontext.id = wo.Orderid;
            var inputData = {
                Id: $scope.currentcontext.id
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
                Id: $scope.currentcontext.eid
            };
            var options = {
                action: 'emr/patientorder/Printpreviousendoscopyresults',
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
        $('#order').focus();
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

    EndoscopyResultController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();