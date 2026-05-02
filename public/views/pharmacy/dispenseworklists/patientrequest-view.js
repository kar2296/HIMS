(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientRequestViewController', PatientRequestViewController);

    function PatientRequestViewController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            StoreMasterId: 0,
            StoreTypeId: 0,
            PatientRequestStatusId: 0,
            TotalGrossAmount: 0,
            TotalGstAmount: 0,
            TotalNetAmount: 0,
            Comments: null,
            PatientRequestNumber: null,
            PatientStockRequestId: 0,
            RequestedBy: 0,
            PatientRequestDateTime: null,
            DisplayPatientRequestStatus: null,
            ReadOnly: true,
            TitleId: 0,
            GenderId: 0,
            Age: 0
        };

        $scope.lookup = {};
        $scope.selectedPatient = {};

        $scope.currentcontext = {
            id: -1,
            patientstockrequestid: -1,
            storemasterid: -1,
        };

        /*
        $scope.currentcontext.CanApprove = utl.Privilege.hasPrivilege('CanApprove');
        $scope.currentcontext.CanPrint = utl.Privilege.hasPrivilege('CanPrint');
        $scope.currentcontext.CanAttachment = utl.Privilege.hasPrivilege('CanAttachment');
        $scope.currentcontext.CanDelete = utl.Privilege.hasPrivilege('CanDelete');
        $scope.currentcontext.CanAddNew = utl.Privilege.hasPrivilege('CanAddNew');
        $scope.currentcontext.CanSWTransfer = utl.Privilege.hasPrivilege('CanSWTransfer');
        $scope.currentcontext.CanComplete = utl.Privilege.hasPrivilege('CanComplete');
        $scope.currentcontext.CanHistory = utl.Privilege.hasPrivilege('CanHistory');
        $scope.currentcontext.CanSWDMPrint = utl.Privilege.hasPrivilege('CanSWDMPrint');
        */

        $scope.openAttachments = function () {
            utl.Modal.open('app.dispenseattachments', {
                params: { patientdispenseid: 0, itemmasterid: 0 },
                confirmCallback: $scope.initLookup,
                cancelCallback: $scope.initLookup
            });
        };

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.patientstockrequestid = $state.params.PatientStockRequestId;
        $scope.currentcontext.storemasterid = $state.params.StoreMasterId;
        $scope.patientstockrequestDetails = [];

        $scope.addNewLineItem = function () {
            var patientstockrequestDetail = {
                Id: 0,
                PatientStockRequestDetailId: 0,
                ItemMasterId: 0,
                ItemCode: '',
                ItemName: '',
                BaseUom: { Id: 0, UomCode: '' },
                BaseUomId: 0,
                PurchaseUomId: 0,
                RequestedQuantity: 0,
                DispensedQuantity: 0,
                TotalAvailableQuantity: 0,
                Ucp: 0,
                Mrp: 0,
                GstMaster: { Id: 0, GstCode: '', GstName: '', GstPercentage: '' },
                GstId: 0,
                GstPercentage: 0,
                UnitGstAmount: 0,
                GstAmount: 0,
                InGstMaster: { Id: 0, GstCode: '', GstName: '', GstPercentage: '' },
                InGstId: 0,
                InGstPercentage: 0,
                InUnitGstAmount: 0,
                InGstAmount: 0,
                CGstMaster: { Id: 0, GstCode: '', GstName: '', GstPercentage: '' },
                CGstId: 0,
                CGstPercentage: 0,
                CUnitGstAmount: 0,
                CGstAmount: 0,
                SGstMaster: { Id: 0, GstCode: '', GstName: '', GstPercentage: '' },
                SGstId: 0,
                SGstPercentage: 0,
                SUnitGstAmount: 0,
                SGstAmount: 0,
                GrossAmount: 0.00,
                NetAmount: 0.00,
                Status: 1,

                tabindex: $scope.tabindexmap.detailtabindex++
            };

            if ($scope.currentcontext.id > 0) {
                patientstockrequestDetail.PatientStockRequestId = $scope.currentcontext.id;
            }
            $scope.patientstockrequestDetails.push(patientstockrequestDetail);
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'IPManagement/PatientStockRequests/PrintPatientStockRequest',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.history = function (HistoryId) {
            utl.Modal.open('app.requesthistory', {});
        };

        $scope.History = function (item, idx) {
            utl.Modal.open('app.patientrequesthistory', {
                params: {
                    storemasterid: $scope.item.StoreMasterId,
                    itemmasterid: item.ItemMasterId,
                    itemcode: item.ItemCode,
                    itemname: item.ItemName,
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.Stock = function (selectedItem, idx) {
            utl.Modal.open('app.stockdetails', {
                params: { itemmasterid: selectedItem.ItemMasterId, itemcode: selectedItem.ItemCode, itemname: selectedItem.ItemName },
                confirmCallback: $scope.getList
            });
        };

        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: $scope.currentfilter.PatientId
                },
                confirmCallback: $scope.getItem
            });
        };

        $scope.patientrequestdetails = function (PatientRequestId) {
            utl.Modal.open('app.patientrequestprofile', {
                params: { prid: PatientRequestId },
                confirmCallback: $scope.getList
            });
        };

        $scope.getPatientRequestInfoById = function () {
            var SearchRequestId = $scope.currentcontext.id;
            if (SearchRequestId && SearchRequestId > 0) {
                var inputData = {
                    Params: [
                        { Key: 0, Value: SearchRequestId },
                        { Key: 9, Value: $scope.currentcontext.storemasterid }
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'IPManagement/PatientStockRequests/GetPatientStockRequests',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getRequestInfoCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.clear();
            }
        };

        $scope.getRequestInfoCallback = function (scope, res, options, hasError) {
            $scope.PatientRequestInfo = res.Data || [];
            if ($scope.PatientRequestInfo && $scope.PatientRequestInfo.length > 0) {
                $scope.PatientRequestInfo.forEach(patientrequest => {
                    if (patientrequest.Patient) {
                        $scope.selectedPatient = patientrequest.Patient;
                        $scope.item.TitleId = patientrequest.Patient.TitleId;
                        $scope.item.GenderId = patientrequest.Patient.GenderId;
                        $scope.item.Age = patientrequest.Patient.Age;
                    }
                    $scope.item.PatientRequestStatusId = patientrequest.PatientRequestStatusId;
                    if (patientrequest.PatientRequestStatusId == 1) {
                        $scope.item.DisplayPatientRequestStatus = 'Draft';
                    } else if (patientrequest.PatientRequestStatusId == 2) {
                        $scope.item.DisplayPatientRequestStatus = 'Requested';
                    } else if (patientrequest.PatientRequestStatusId == 3) {
                        $scope.item.DisplayPatientRequestStatus = 'Authorized';
                    } else if (patientrequest.PatientRequestStatusId == 4) {
                        $scope.item.DisplayPatientRequestStatus = 'Partially Dispensed';
                    } else if (patientrequest.PatientRequestStatusId == 5) {
                        $scope.item.DisplayPatientRequestStatus = 'Dispensed';
                    } else if (patientrequest.PatientRequestStatusId == 6) {
                        $scope.item.DisplayPatientRequestStatus = 'Cancelled';
                    }

                    $scope.item.PatientStockRequestId = patientrequest.Id;
                    $scope.item.PatientRequestNumber = patientrequest.PatientRequestNumber;
                    $scope.item.PatientRequestDateTime = patientrequest.PatientRequestDateTime;
                    $scope.item.StoreMasterId = patientrequest.ToStoreId;
                    $scope.item.StoreName = '';
                    $scope.item.PatientId = patientrequest.PatientId;
                    $scope.item.PatientTypeId = patientrequest.PatientTypeId;
                    $scope.item.PatientMRN = patientrequest.PatientMRN;
                    $scope.item.PatientName = patientrequest.PatientName;
                    $scope.item.EncounterId = patientrequest.EncounterId;
                    $scope.item.EncounterTypeId = patientrequest.EncounterTypeId;
                    $scope.item.DoctorId = patientrequest.DoctorId;
                    $scope.item.DoctorName = patientrequest.DoctorName;
                    $scope.item.ReferralId = patientrequest.ReferralId;
                    $scope.item.ReferralName = patientrequest.ReferralName;
                    $scope.item.DepartmentId = patientrequest.DepartmentId;
                    $scope.item.GuarantorId = patientrequest.GuarantorId;
                    $scope.item.GuarantorTypeId = patientrequest.GuarantorTypeId;
                    $scope.item.GuarantorName = patientrequest.GuarantorName;
                    $scope.item.LocationId = patientrequest.LocationId;
                    $scope.item.WardId = patientrequest.WardId;
                    $scope.item.WardName = '';
                    if (patientrequest.WardMaster) {
                        $scope.item.WardName = patientrequest.WardMaster.WardName;
                    }
                    $scope.item.RoomId = patientrequest.RoomId;
                    $scope.item.RoomName = '';
                    if (patientrequest.WardRoomMaster) {
                        $scope.item.RoomName = patientrequest.WardRoomMaster.RoomNo;
                    }
                    $scope.item.WardRoom = $scope.item.WardName + ' / ' + $scope.item.RoomName;
                    $scope.item.BedId = patientrequest.BedId;
                    $scope.item.ToStoreId = patientrequest.ToStoreId;
                    $scope.item.FacilityId = patientrequest.FacilityId;

                    $scope.item.TotalGrossAmount = patientrequest.TotalGrossAmount;
                    $scope.item.TotalGstAmount = patientrequest.TotalGstAmount;
                    $scope.item.TotalNetAmount = patientrequest.TotalNetAmount;

                    $scope.item.RequestedBy = patientrequest.RequestedBy;
                    $scope.item.RequestedDate = patientrequest.RequestedDate;
                    $scope.item.ApprovedBy = patientrequest.ApprovedBy;
                    $scope.item.ApprovedDate = patientrequest.ApprovedDate;
                    $scope.item.AuthorizedBy = patientrequest.AuthorizedBy;
                    $scope.item.AuthorizedDate = patientrequest.AuthorizedDate;

                    $scope.patientstockrequestDetails = patientrequest.PatientStockRequestDetails || [];
                    for (var psridx in $scope.patientstockrequestDetails) {
                        var psritem = $scope.patientstockrequestDetails[psridx];
                        if (psritem.ItemMasterId > 0) {
                            if (psritem.ItemMaster.StockItem !== null) {
                                psritem.TotalAvailableQuantity = psritem.ItemMaster.StockItem.Quantity;
                            }
                        }
                    }
                });
            }
        };

        $scope.backToList = function () {
            $state.go('app.dispenseworklisttab.dispenseworklists', $scope.currentcontext.id);
        };

        function loadData() {
            if ($scope.currentcontext.id > 0) {
                $scope.getPatientRequestInfoById();
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    $scope.item.StoreMasterId = value[0].Id;
                    $scope.item.StoreTypeId = value[0].StoreMaster.StoreTypeId;
                }
            });
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "PatientRequestType" },
                { "Key": "PatientRequestStatus" },
                {
                    "Key": "UserStores",
                    Request: {
                        Params: [{
                            Key: 1,
                            Value: utl.Session.getCurrentUserId()
                        },
                        {
                            Key: 2,
                            Value: utl.Session.getCurrentFacilityId(),
                        },
                        {
                            Key: 5,
                            Value: 2
                        }
                        ]
                    },
                    Default: false
                },
            ];

            $scope.getLookUp(inputData);
            loadData();
        };

        $scope.getLookUp = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    PatientRequestViewController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();