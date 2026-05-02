(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ReturnRequestViewController', ReturnRequestViewController);

    function ReturnRequestViewController($scope, $stateParams, $state, $translate, utl, $filter) {
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
            PatientReturnStatusId: 0,
            TotalGrossAmount: 0,
            TotalGstAmount: 0,
            TotalNetAmount: 0,
            Comments: null,
            PatientReturnNumber: null,
            PatientStockReturnId: 0,
            ReturnedBy: 0,
            PatientReturnDateTime: null,
            DisplayPatientReturnStatus: null,
            ReadOnly: true,
            TitleId: 0,
            GenderId: 0,
            Age: 0
        };

        $scope.lookup = {};
        $scope.selectedPatient = {};

        $scope.currentcontext = {
            id: -1,
            patientstockreturnid: -1,
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

        $scope.previousOrders = function () {
            utl.Modal.open('app.patientpreviousreturns', {
                params: {
                    pid: $scope.item.PatientId,
                    eid: $scope.item.EncounterId,
                    patientdispenseid: $scope.currentcontext.patientstockrequestid,
                    itemmasterid: 0
                },
                // confirmCallback: $scope.initLookup,
                // cancelCallback: $scope.initLookup
            });
        };

        $scope.openAttachments = function () {
            utl.Modal.open('app.dispenseattachments', {
                params: { patientdispenseid: 0, itemmasterid: 0 },
                confirmCallback: $scope.initLookup,
                cancelCallback: $scope.initLookup
            });
        };

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.patientstockreturnid = $state.params.PatientStockReturnId;
        $scope.currentcontext.storemasterid = $state.params.StoreMasterId;
        $scope.patientstockreturnDetails = [];

        $scope.addNewLineItem = function () {
            var patientstockreturnDetail = {
                Id: 0,
                PatientStockReturnDetailId: 0,
                ItemMasterId: 0,
                ItemCode: '',
                ItemName: '',
                BaseUom: { Id: 0, UomCode: '' },
                BaseUomId: 0,
                PurchaseUomId: 0,
                ReturnQuantity: 0,
                ReceivedQuantity: 0,
                TotalAvailableQuantity: 0,
                BatchQuantity: 0,
                BatchId: '',
                ExpiryDate: null,
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
                patientstockreturnDetail.PatientStockReturnId = $scope.currentcontext.id;
            }
            $scope.patientstockreturnDetails.push(patientstockreturnDetail);
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'IPManagement/PatientStockReturns/PrintPatientStockReturns',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.history = function (HistoryId) {
            utl.Modal.open('app.returnhistory', {});
        };

        $scope.History = function (item, idx) {
            utl.Modal.open('app.patientreturnhistory', {
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

        $scope.patientreturndetails = function (PatientReturnId) {
            utl.Modal.open('app.patientreturnprofile', {
                params: { prid: $scope.item.PatientReturnId },
                confirmCallback: $scope.getList
            });
        };

        $scope.getPatientReturnInfoById = function () {
            var SearchReturnId = $scope.currentcontext.id;
            if (SearchReturnId && SearchReturnId > 0) {
                var inputData = {
                    Params: [
                        { Key: 0, Value: SearchReturnId },
                        { Key: 9, Value: $scope.currentcontext.storemasterid }
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'IPManagement/PatientStockReturns/GetPatientStockReturns',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getReturnInfoCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.clear();
            }
        };

        $scope.getReturnInfoCallback = function (scope, res, options, hasError) {
            $scope.PatientReturnInfo = res.Data || [];
            if ($scope.PatientReturnInfo && $scope.PatientReturnInfo.length > 0) {
                $scope.PatientReturnInfo.forEach(patientreturn => {
                    if (patientreturn.Patient) {
                        $scope.selectedPatient = patientreturn.Patient;
                        $scope.item.TitleId = patientreturn.Patient.TitleId;
                        $scope.item.GenderId = patientreturn.Patient.GenderId;
                        $scope.item.Age = patientreturn.Patient.Age;
                    }
                    $scope.item.PatientReturnStatusId = patientreturn.PatientReturnStatusId;
                    if (patientreturn.PatientReturnStatusId == 1) {
                        $scope.item.DisplayPatientReturnStatus = 'Draft';
                    } else if (patientreturn.PatientReturnStatusId == 2) {
                        $scope.item.DisplayPatientReturnStatus = 'Returned';
                    } else if (patientreturn.PatientReturnStatusId == 3) {
                        $scope.item.DisplayPatientReturnStatus = 'Authorized';
                    } else if (patientreturn.PatientReturnStatusId == 4) {
                        $scope.item.DisplayPatientReturnStatus = 'Partially Received';
                    } else if (patientreturn.PatientReturnStatusId == 5) {
                        $scope.item.DisplayPatientReturnStatus = 'Received';
                    } else if (patientreturn.PatientReturnStatusId == 6) {
                        $scope.item.DisplayPatientReturnStatus = 'Cancelled';
                    }

                    $scope.item.PatientStockReturnId = patientreturn.Id;
                    $scope.item.PatientReturnNumber = patientreturn.PatientReturnNumber;
                    $scope.item.PatientReturnDateTime = patientreturn.PatientReturnDateTime;
                    $scope.item.StoreMasterId = patientreturn.ToStoreId;
                    $scope.item.PatientId = patientreturn.PatientId;
                    $scope.item.PatientTypeId = patientreturn.PatientTypeId;
                    $scope.item.PatientMRN = patientreturn.PatientMRN;
                    $scope.item.PatientName = patientreturn.PatientName;
                    $scope.item.EncounterId = patientreturn.EncounterId;
                    $scope.item.EncounterTypeId = patientreturn.EncounterTypeId;
                    $scope.item.DoctorId = patientreturn.DoctorId;
                    $scope.item.DoctorName = patientreturn.DoctorName;
                    $scope.item.ReferralId = patientreturn.ReferralId;
                    $scope.item.ReferralName = patientreturn.ReferralName;
                    $scope.item.DepartmentId = patientreturn.DepartmentId;
                    $scope.item.GuarantorId = patientreturn.GuarantorId;
                    $scope.item.GuarantorTypeId = patientreturn.GuarantorTypeId;
                    $scope.item.GuarantorName = patientreturn.GuarantorName;
                    $scope.item.LocationId = patientreturn.LocationId;
                    $scope.item.WardId = patientreturn.WardId;
                    $scope.item.WardName = '';
                    if (patientreturn.WardMaster) {
                        $scope.item.WardName = patientreturn.WardMaster.WardName;
                    }
                    $scope.item.RoomId = patientreturn.RoomId;
                    $scope.item.RoomName = '';
                    if (patientreturn.WardRoomMaster) {
                        $scope.item.RoomName = patientreturn.WardRoomMaster.RoomNo;
                    }
                    $scope.item.WardRoom = $scope.item.WardName + ' / ' + $scope.item.RoomName;
                    $scope.item.BedId = patientreturn.BedId;
                    $scope.item.ToStoreId = patientreturn.ToStoreId;
                    $scope.item.FacilityId = patientreturn.FacilityId;

                    $scope.item.TotalGrossAmount = patientreturn.TotalGrossAmount;
                    $scope.item.TotalGstAmount = patientreturn.TotalGstAmount;
                    $scope.item.TotalNetAmount = patientreturn.TotalNetAmount;

                    $scope.item.RequestedBy = patientreturn.ReturnedBy;
                    $scope.item.RequestedDate = patientreturn.ReturnedDate;
                    $scope.item.ApprovedBy = patientreturn.ApprovedBy;
                    $scope.item.ApprovedDate = patientreturn.ApprovedDate;
                    $scope.item.AuthorizedBy = patientreturn.AuthorizedBy;
                    $scope.item.AuthorizedDate = patientreturn.AuthorizedDate;

                    $scope.patientstockreturnDetails = patientreturn.PatientStockReturnDetails || [];
                    for (var psridx in $scope.patientstockreturnDetails) {
                        var psritem = $scope.patientstockreturnDetails[psridx];
                        if (psritem.ItemMasterId > 0) {
                            if (psritem.StockItem !== null) {
                                psritem.TotalAvailableQuantity = psritem.StockItem.Quantity;
                            }
                            if (psritem.StockSerialItem !== null) {
                                psritem.BatchQuantity = psritem.StockSerialItem.Quantity;
                            }
                        }
                    }
                });
            }
        };

        $scope.backToList = function () {
            $state.go('app.returnworklisttab.returnworklists', $scope.currentcontext.id);
        };

        function loadData() {
            if ($scope.currentcontext.id > 0) {
                $scope.getPatientReturnInfoById();
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
                { "Key": "PatientReturnType" },
                { "Key": "PatientReturnStatus" },
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

    ReturnRequestViewController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();