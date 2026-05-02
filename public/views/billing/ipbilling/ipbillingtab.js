(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('ipbillingTabController', ipbillingTabController);

    function ipbillingTabController($scope, $stateParams, $state, $translate, utl) {
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.currentcontext = {};
        $scope.lookup = {};
        console.log($stateParams);
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.isdaycare = $stateParams.isdaycare;
        console.log($scope.currentcontext.id);
        $scope.selectedPatient = {};
        $scope.item = {};
        var tabvm = this;
        $scope.Islocked = $stateParams.islocked;
        $scope.EncounterDetails = $scope.$parent.EncounterDetails;
        console.log($scope.EncounterDetails);
        $scope.ReceivedAmt = 0;
        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [];
        tabvm.currentcontext = {
            patientid: 0
        };
        $scope.CanSummaryBill = $scope.HasAccess('IPBILLING_TAB', 'SummaryBill');
        $scope.CanIPBillDetails = $scope.HasAccess('IPBILLING_TAB', 'IPBillDetails');
        $scope.CanAdvanceReceipts = $scope.HasAccess('IPBILLING_TAB', 'Advance/Receipts');
        $scope.CanRefund = $scope.HasAccess('IPBILLING_TAB', 'Refund');
        $scope.CanCollectionModification = $scope.HasAccess('IPBILLING_TAB', 'CollectionModification');
        $scope.CanNonPharmacyCollectionModification = $scope.HasAccess('IPBILLING_TAB', 'PharmacyCollectionModification');

        if ($scope.CanSummaryBill) {
            $scope.tabs.push({
                title: $translate.instant('billing.ipbillingtab.tabsummary.lbl'),
                state: 'app.ipbillingtab.summary',
                canDisable: false
            });
        }
        if ($scope.CanIPBillDetails) {
            $scope.tabs.push({
                title: $translate.instant('billing.ipbillingtab.tabdetails.lbl'),
                state: 'app.ipbillingtab.billdetails',
                canDisable: canDisableTab
            })
        }
        if ($scope.CanAdvanceReceipts) {
            $scope.tabs.push({
                title: $translate.instant('Advance / Receipts'),
                state: 'app.ipbillingtab.receipts',
                canDisable: canDisableTab
            })
        }
        if ($scope.CanRefund) {
            $scope.tabs.push({
                title: $translate.instant('billing.ipbillingtab.tabrefund.lbl'),
                state: 'app.ipbillingtab.refunds',
                canDisable: canDisableTab
            })
        }
        if ($scope.CanCollectionModification) {
            $scope.tabs.push({
                title: $translate.instant('billing.ipbillingtab.modifybill.lbl'),
                state: 'app.ipbillingtab.insurancebill',
                canDisable: canDisableTab
            })
        }
        if ($scope.CanNonPharmacyCollectionModification) {
            $scope.tabs.push({
                title: $translate.instant('billing.ipbillingtab.pharmacymodifybill.lbl'),
                state: 'app.ipbillingtab.pharmacybillmodify',
                canDisable: canDisableTab
            })
        }
        // $scope.tabs.push({
        //     title: $translate.instant('IP Fund'),
        //     state: 'app.ipbillingtab.ipfundlist',
        //     canDisable: canDisableTab
        // })
        $scope.getIPClearence = function() {
            utl.Modal.open('app.emripclearenceform', {
                EncounterId: $scope.currentcontext.id,
            });
        };

        $scope.editdischarge = function() {
            utl.Modal.open('app.editdischargedate', {
                params: {
                    eid: $scope.currentcontext.id,
                    discdate: $scope.Data.DischargeDate
                },
                confirmCallback: $scope.getinfo
            });
        };

        $scope.openattachments = function() {
            if ($scope.item.PatientId > 0) {
                utl.Modal.open('app.patientattachments', {
                    params: {
                        pid: $scope.item.PatientId,
                        itemid: $scope.item.Id
                    },
                    confirmCallback: $scope.getPatientAttachments,
                    cancelCallback: $scope.getPatientAttachments
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.nopatient-msg.lbl'));
            }
        };

        $scope.switchTab = function(tab) {
            $state.go(tab.state);
        };

        $scope.addNewFull = function() {
            $state.go('app.fullbillingtab.basic', {
                id: 0
            });
        };

        $scope.addAttachment = function() {
            utl.Modal.open('patientemr.clinicaldocumenttab.clinicaldocument', {
                params: {
                    id: 0,
                    encounterid: $scope.currentcontext.id,
                    patientid: $scope.Data.PatientId,
                    from: 'billing'
                },
                confirmCallback: $scope.getList
            });
        }
        $scope.updateCount = function() {
            $scope.getPatientAlertsCount();
        };

        $scope.getPatientAlertsCallback = function(scope, res, options, hasError) {
            $scope.currentcontext.patientAlertsCount = res.Data.length;
        };

        $scope.getPatientAlertsCount = function() {
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: $scope.Data.PatientId
                    },
                    {
                        Key: 5,
                        Value: utl.Session.getUserDepartments()
                    },
                    {
                        Key: 6,
                        Value: utl.Session.getCurrentUserId()
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'generalmaster/PatientAlert/GetPatientAlerts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientAlertsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.alertviewclick = function() {
            utl.Modal.open('app.alertview', {
                params: {
                    pid: $scope.Data.PatientId
                },
                confirmCallback: $scope.updateCount,
                cancelCallback: $scope.updateCount,
            });
        };


        $scope.addNewQuick = function() {
            $state.go('app.quickbilling', {
                id: 0
            });
        }

        //Patient picker related code starts
        function patientPickerCallback(patientdata) {
            $state.go('app.fullbillingtab.basic', {
                id: patientdata.pid
            });
        }

        $scope.Bedoccupancy = function() {
            if ($scope.Data.PatientId > 0) {
                utl.Modal.open('app.bedoccupancyhistory', {
                    params: {
                        pid: $scope.Data.PatientId,
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('admission.previous-admi-nopatient-msg.lbl'));
            }
        };

        $scope.pickPatient = function() {
                utl.Modal.open('app.patientpicker', {
                    params: {},
                    confirmCallback: patientPickerCallback
                });
            }
            //Patient picker related code ends

        //Reload banner code starts
        $scope.setBannerDelegate = function(cmp) {
            $scope.bannercmp = cmp;
        };

        tabvm.refreshBanner = function() {
                if ($scope.bannercmp) {
                    $scope.bannercmp.refresh();
                }
            }
            //Reload banner code ends
        $scope.patientprofiledetails = function() {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: $scope.Data.PatientId
                },
                confirmCallback: $scope.getItem
            });
        }

        $scope.print = function() {
            utl.Modal.open('app.transaction-iddetails', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        }


        $scope.getPatientInfo = function(scope, data, options, hasError) {
            $scope.selectedPatient = data;
        }

        $scope.patientChange = function() {
                if ($scope.Data.PatientId > 0) {
                    var options = {
                        action: 'registration/patient/GetPatientById',
                        data: {
                            Id: $scope.Data.PatientId
                        },
                        type: 'post',
                        onComplete: $scope.getPatientInfo
                    };

                    utl.Http.doAction(options);
                }
            }
            // For Displaying Created User - Start
        $scope.getEncounterCallback = function(scope, res, options, hasError) {
            $scope.Encounter = res.Data[0];
            console.log(Encounter);
            $scope.item.DOA = Encounter.AdmissionDate;
            // vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getEncounters = function() {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.id
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
        $scope.GetPatientBillSummaryCallback = function(scope, res, options, hasError) {
            if (res.FinalBillInfo && res.FinalBillInfo.Id > 0) {
                $scope.FinalBillInfo = res.FinalBillInfo;
            }
        }

        $scope.GetPatientBillSummary = function() {
            var options = {
                action: 'billing/PatientBillSummary/GetPatientBillSummaryDetails',
                data: {
                    Data: {
                        EncounterId: $scope.Data.Id
                    }
                },
                type: 'post',
                onComplete: $scope.GetPatientBillSummaryCallback
            };
            utl.Http.doAction(options);
        }

        $scope.patientprofiledetails = function(selectedPatient) {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: selectedPatient.Id
                },
                confirmCallback: $scope.getList
            });
        };
        // For Displaying Created User - End
        $scope.getinfoCallback = function(scope, data, options, hasError) {
            $scope.Data = data.Data[0];
            $scope.item.DoctorName = '';
            $scope.item.ReferralName = $scope.Data.ReferralName;
            $scope.item.WardDetails = '';
            if ($scope.Data.Doctor) {
                if ($scope.Data.Doctor.Title)
                    $scope.item.DoctorName = $scope.Data.Doctor.Title.Description;
                if ($scope.Data.Doctor.FirstName)
                    $scope.item.DoctorName += ' ' + $scope.Data.Doctor.FirstName;
                if ($scope.Data.Doctor.LastName)
                    $scope.item.DoctorName += ' ' + $scope.Data.Doctor.LastName;
            }
            if ($scope.Data.WardMaster)
                $scope.item.WardDetails = $scope.Data.WardMaster.WardName;
            if ($scope.Data.WardRoomMaster)
                $scope.item.WardDetails += ' / ' + $scope.Data.WardRoomMaster.RoomNo;
            if ($scope.Data.WardRoomBedMaster)
                $scope.item.WardDetails += ' / ' + $scope.Data.WardRoomBedMaster.BedNo;

            $scope.getPatientAlertsCount();
            $scope.patientChange();
            //$scope.getEncounters();
            $scope.GetPatientBillSummary();
            $scope.clinicalDischarge();
            $scope.patientBills();
        };

        $scope.addDoctor = function() {
            utl.Modal.openFixedDialog('app.doctortransfer', {
                params: {
                    eid: $scope.currentcontext.id,
                    pid: $scope.Data.PatientId,
                    doctorid: $scope.Data.DoctorId,
                    admissionstatusid: $scope.Data.AdmissionStatusId,
                },
                confirmCallback: $scope.getinfo
            });
        }

        $scope.patcmnts = function() {
            utl.Modal.open('app.patcomments', {
                params: {
                    eid: $scope.currentcontext.id
                },
                confirmCallback: $scope.getItem
            });
        }

        $scope.getinfo = function(pageNo) {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.id
                }]
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getinfoCallback
            };

            utl.Http.doAction(options);
        };

        // if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
        //     var options = {
        //         action: 'Visit/Visit/GetEncounterById',
        //         data: { Id: $scope.currentcontext.id },
        //         type: 'post',
        //         onComplete: $scope.getinfoCallback
        //     };
        //     utl.Http.doAction(options);
        // }
        if ($scope.CanSummaryBill) {
            $scope.switchTab($scope.tabs[0]);
        }
        if ($scope.CanIPBillDetails) {
            $scope.switchTab($scope.tabs[0]);
        }
        if ($scope.CanAdvanceReceipts) {
            $scope.switchTab($scope.tabs[0]);
        }
        if ($scope.CanRefund) {
            $scope.switchTab($scope.tabs[0]);
        }
        if ($scope.CanCollectionModification) {
            $scope.switchTab($scope.tabs[0]);
        }

        $scope.loadData = function() {
            $state.go('app.ipbillingtab.billdetails', {
                id: $scope.currentcontext.id
            });
        }
        $scope.UpdateallBillsCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getinfo();
        };

        $scope.updateBillSummary = function() {
            var options = {
                action: 'billing/PatientBillSummary/UpdateBillSummary',
                data: {
                    Data: $scope.PatientBillDetails
                },
                type: 'post',
                onComplete: $scope.UpdateallBillsCallback
            };
            utl.Http.doAction(options);
        }

        $scope.UpdateallBills = function() {
            var inputData = {
                Details: $scope.PatientBillDetails,
                Header: $scope.UpdateInfo
            }
            var actionName = 'billing/PatientbillDetails/UpdateBillRates';
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.UpdateallBillsCallback
            };
            utl.Http.doAction(options);
        }

        $scope.getallBillsCallback = function(scope, res, options, hasError) {
            $scope.PatientBillDetails = [];
            if (res.Data.length > 0) {
                for (var idx in res.Data) {
                    var billdetail = res.Data[idx];
                    // if (!billdetail.IsPharmacySale && !billdetail.IsPharmacyReturn) {
                    //     $scope.PatientBillDetails.push(billdetail);
                    // }
                    $scope.PatientBillDetails.push(billdetail);
                };
            }
            $scope.UpdateallBills();
        };
        $scope.getallBills = function() {
            var inputData = {
                Data: {
                    EncounterId: $scope.currentcontext.id,
                    IsOtherBills: true
                }
            };

            var options = {
                action: 'Billing/PatientBillDetails/GetPharmacyBillDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getallBillsCallback
            };
            utl.Http.doAction(options);
        }
        $scope.UpdateTariff = function() {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You Want to update Tariff to all Bills?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.getallBills,
                onDismissMethod: $scope.getinfo
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }
        $scope.getUpdateInfo = function(itemFromModal) {
            $scope.UpdateInfo = {};
            $scope.UpdateInfo.GuarantorId = itemFromModal.GuarantorId;
            $scope.UpdateInfo.GuarantorTypeId = itemFromModal.GuarantorTypeId;
            $scope.UpdateInfo.GuarantorLetterNo = itemFromModal.GuarantorLetterNo;
            $scope.UpdateInfo.EligibleAmount = itemFromModal.EligibleAmount;
            $scope.UpdateInfo.CreditLimit = itemFromModal.CreditLimit;
            $scope.UpdateInfo.TpaId = itemFromModal.TpaId;
            $scope.UpdateInfo.ServiceRateCategoryId = itemFromModal.ServiceRateCategoryId;
            $scope.UpdateInfo.FacilityId = utl.Session.getCurrentFacilityId();
            $scope.UpdateInfo.EncounterId = $scope.currentcontext.id;
            $scope.UpdateTariff($scope.UpdateInfo);


            // $scope.getallBills();
        }

        $scope.patientDischarge = function() {
            utl.Modal.open('app.discharpatienthistory', {
                params: {
                    eid:  $scope.currentcontext.id,
                    id: $scope.dischargeEventId,
                    billdId: $scope.PatientBillsId
                },
                confirmCallback: $scope.getItem,
            });
        }
        $scope.openModal = function (appKey, stateParams) {
            utl.Modal.open(appKey, {
                params: stateParams,
                confirmCallback: $scope.getEncounter
            });
        }
        $scope.getPatientBillsCallback = function (scope, data, options, hasError) {
            $scope.PatientBillsId = data;
        }
        $scope.patientBills = function () {
            var options = {
                action: 'billing/PatientBills/GetPatientBillsByEncounterId',
                data: {
                    Id: $scope.currentcontext.id
                },
                type: 'post',
                onComplete: $scope.getPatientBillsCallback
            };
            utl.Http.doAction(options);
        };
        $scope.getPatientDischargeEventCallback = function (scope, data, options, hasError) {
            $scope.dischargeEventId = data;
            // $scope.openModal('app.discharpatienthistory', {
            //     id: data,
            //     EncounterId: options.data.Id,
            //     Encounter: options.data.Encounter
            // });
        }
        // $scope.patientDischarge = function () {
        //     var options = {
        //         action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventByEncounterId',
        //         data: {
        //             Id: $scope.currentcontext.eid
        //         },
        //         type: 'post',
        //         onComplete: $scope.getPatientDischargeEventCallback
        //     };

        //     utl.Http.doAction(options);
        // };

        $scope.clinicalDischarge = function () {
            // if ($scope.ipbillflowrequired == 1) {
            //     if ($scope.Encounter.AdmissionStatusId == 2) {
            //         utl.Alert.showErrorMsg("Patient not yet fit for discharge");
            //         return;
            //     }
            // }
            var options = {
                action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventByEncounterId',
                data: {
                    Id: $scope.currentcontext.id,
                    // Encounter: $scope.Encounter
                },
                type: 'post',
                onComplete: $scope.getPatientDischargeEventCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getPhysicalDischargeCallback = function (scope, data, options, hasError) {
            $scope.openModal('app.physicalpatient', {
                id: data,
                EncounterId: options.data.Id,
                Encounter: options.data.Encounter
            });
        }

        // $scope.getPhysicalDischargeCallback = function (scope, data, options, hasError) {
        //     $scope.openModal('app.physicalpatient', {
        //         Data: {
        //             EncounterId: $scope.currentcontext.id,
        //         },
        //         type: 1
        //     });
        // };

        // $scope.patientDischarge = function () {
        //     var options = {
        //         action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventByEncounterId',
        //         data: {
        //             Id: $scope.currentcontext.id
        //         },
        //         type: 'post',
        //         onComplete: $scope.getPhysicalDischargeCallback
        //     };

        //     utl.Http.doAction(options);
        // };
        // $scope.getPhysicalDischargeCallback = function (scope, data, options, hasError) {
        //     $scope.openModal('app.physicalpatient', {
        //         id: data,
        //         EncounterId: $scope.currentcontext.id,
        //     });
        // }
        $scope.addGuarantor = function() {
            if ($scope.Data.PatientId) {
                utl.Modal.open('app.guarantorupdateform', {
                    params: {
                        gid: $scope.Data.GuarantorId,
                        encid: $scope.Data.Id,
                        pid: $scope.Data.PatientId,
                        admissionstatusid: $scope.Data.AdmissionStatusId,
                        wardId: $scope.Data.WardId,
                        parent: 'txn',
                        isFinalized: $scope.isFinalized
                    },
                    confirmCallback: $scope.getUpdateInfo,
                    // cancelCallback: $scope.loadPatientGuarantors
                });
            }
        };

        $scope.getinfo();
    }

    ipbillingTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();