(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('PrescriptionFavController', PrescriptionFavController);

    function PrescriptionFavController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.lookup = {};
        $scope.item = {};
        $scope.prescriptionDetails = [];
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        if ($stateParams.pid)
            $scope.currentcontext.pid = $stateParams.pid;
        $scope.item.PatientId = $stateParams.pid;

        $scope.item.EncounterId = utl.Session.getEncounterId();
        $scope.currentcontext.GuarantorId = 0;
        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        $scope.item = {
            SearchTypeId: 1,
            PharmacyId: 0,
            FacilityId: utl.Session.getCurrentFacilityId(),
            PrecriptionStatusId: 3,
            PrescriptionDate: utl.Formatter.getCurrentDate(),
            PrescriptionPriorityId: 1
        };

        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter) {
            $scope.item.EncounterId = $scope.currentcontext.encounter.Id;
            $scope.item.PatientId = $scope.currentcontext.encounter.PatientId;
            $scope.item.DoctorId = $scope.currentcontext.encounter.DoctorId;
            $scope.item.DepartmentId = $scope.currentcontext.encounter.DepartmentId;
            $scope.item.EncounterTypeId = $scope.currentcontext.encounter.EncounterTypeId;
            $scope.item.AppointmentId = $scope.currentcontext.encounter.AppointmentId;
            $scope.item.ServiceRateCategoryId = $scope.currentcontext.encounter.AppointmentId;
            $scope.item.PatientGuarantorId = $scope.currentcontext.encounter.PatientGuarantorId;
            $scope.item.GuarantorId = $scope.currentcontext.encounter.GuarantorId;
        }

        $scope.dashboard = function() {
            if ($scope.Context == 'surgery') {
                $state.go('app.surgerydashboard');
            } else {
                $state.go('patientemr.patientdashboard');
            }
        }

        $scope.addprescribe = function() {
            if ($scope.Context == 'surgery') {
                $state.go('surgeryentry.prescribetab.rxprescriptions');
            } else {
                $state.go('patientemr.prescribetab.rxprescriptions');
            }
        };

        $scope.favprescribe = function() {
            if ($scope.Context == 'surgery') {
                $state.go('surgeryentry.prescribetab.favprecriptions', {
                    pid: $scope.currentcontext.pid
                });
            } else {
                $state.go('patientemr.prescribetab.favprecriptions', {
                    pid: $scope.currentcontext.pid
                });
            }
        };


        $scope.ticksheetconfig = {
            ticksheetmastertypeid: 1,
            selectedlist: [],
            selecteddetail: {},
            departmentid: -1
        };

        $scope.addTickSheet = function() {
            var testmaster = $scope.ticksheetconfig.selecteddetail.DrugMaster;
            var currentItem = getNewItem();
            currentItem.DrugId = $scope.ticksheetconfig.selecteddetail.ItemId;
            currentItem.DrugName = testmaster.DrugName;
            currentItem.DrugCode = testmaster.DrugCode;
            utl.Modal.open('patientemr.prescriptiondetail', {
                params: {
                    id: 0,
                    pid: $scope.currentcontext.pid,
                    current_item: currentItem
                },
                confirmCallback: $scope.onDetailSave
            });
        };

        $scope.saveFavoritesCallback = function(scope, res, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            // $state.go('patientemr.prescribetab.rxprescriptions', {
            //     id: res
            // });
            $scope.addprescribe();
            // $scope.getList();
        };

        $scope.saveTickSheets = function() {
            $scope.prescriptionDetails.splice(-1, 1);
            for (var idx in $scope.ticksheetconfig.selectedlist) {
                var ticksheetitem = $scope.ticksheetconfig.selectedlist[idx];
                var vMrPrice = 0;
                var vAvailQuantity = 0;
                try {
                    vMrPrice = ticksheetitem.ItemMaster.MrPrice;
                } catch (ex) {}
                try {
                    vAvailQuantity = ticksheetitem.ItemMaster.StockItem.Quantity;
                } catch (ex) {}
                var item = {
                    DrugId: ticksheetitem.ItemId,
                    IsGeneric: false,
                    Duration: 0,
                    DurationPeriodId: 1,
                    Quantity: 0,
                    AvailQuantity: vAvailQuantity,
                    Status: 1,
                    Price: vMrPrice,
                    SearchTypeId: 1,
                    StartDate: utl.Formatter.getCurrentDate(),
                    DrugName: ticksheetitem.DrugName,
                    DrugCode: ticksheetitem.DrugCode,
                    DrugGenericId: ticksheetitem.DrugMaster.GenericId,
                    DrugGenericCode: ticksheetitem.DrugMaster.GenericCode,
                    DrugGenericName: ticksheetitem.DrugMaster.GenericName,
                    Morning: ticksheetitem.Morning,
                    Noon: ticksheetitem.Noon,
                    Night: ticksheetitem.Night,
                    Notes: ticksheetitem.Notes,
                    PrecriptionStatusId: 3,
                    PharmacyId: $scope.item.PharmacyId,
                    Dosage: ticksheetitem.Dosage,
                    Duration: ticksheetitem.Duration,
                    DurationPeriodId: ticksheetitem.DurationPeriodId,
                    DrugInstructionId: ticksheetitem.DrugInstructionId,
                };
                $scope.computeQuantity(item);
                if (!checkExist(item)) {
                    $scope.prescriptionDetails.push(item);
                }
                $state.go('patientemr.prescribetab.rxprescriptions', {
                    details: $scope.prescriptionDetails
                });
                // var lines = getLinesForSave();
                // var actionName = 'emr/prescription/AddPrescription';
                // if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                //     actionName = 'emr/prescription/UpdatePrescription';
                // }
                // var inputData = {
                //     Header: $scope.item,
                //     Details: lines
                // };
                // var options = {
                //     action: actionName,
                //     data: {
                //         Data: inputData
                //     },
                //     type: 'post',
                //     onComplete: $scope.saveFavoritesCallback
                // };
                // utl.Http.doAction(options);
            }
        };

        // function getLinesForSave() {
        //     var result = [];
        //     for (var idx in $scope.prescriptionDetails) {
        //         var item = $scope.prescriptionDetails[idx];
        //         if (item.DrugId > 0 || item.GenericId > 0) {
        //             item.PharmacyId = $scope.item.PharmacyId;
        //             item.PrescriptionId = 0;
        //             item.GuarantorId = $scope.item.GuarantorId;
        //             item.SearchTypeId = $scope.item.SearchTypeId;
        //             item.NetAmount = item.Price * item.Quantity;
        //             result.push(item);
        //         }
        //         for (var didx in $scope.prescriptionDetails) {
        //             var ditem = $scope.prescriptionDetails[didx];
        //             if (ditem.Status === 2 && ditem.Id > 0) {
        //                 result.push(ditem);
        //             }
        //         }
        //     }
        //     return result;
        // }


        function checkExist(item) {
            for (var idx in $scope.prescriptionDetails) {
                if ((item.DrugId == $scope.prescriptionDetails[idx].DrugId) && ($scope.prescriptionDetails[idx].Status == 1)) {
                    return true;
                }
            }
            return false;
        }

        $scope.computeQuantity = function(item) {
            var totalDays = 0;
            var noOfTimes = 0;
            if (item.DurationPeriodId == 1) { //Days
                totalDays = item.Duration * 1;
            } else if (item.DurationPeriodId == 2) { //Weeks
                totalDays = item.Duration * 7;
            } else if (item.DurationPeriodId == 3) { //Months
                totalDays = item.Duration * 30;
            }
            if (item.Morning > 0) {
                noOfTimes = noOfTimes + item.Morning;
            }
            if (item.Noon > 0) {
                noOfTimes = noOfTimes + item.Noon;
            }
            if (item.Night > 0) {
                noOfTimes = noOfTimes + item.Night;
            }
            item.Quantity = noOfTimes * totalDays;
            if (item.PackageSize == 0 || item.PackageSize == 1 || !item.PackageSize) {
                item.Quantity = noOfTimes * totalDays;
            } else {
                item.Quantity = Math.ceil((item.Quantity / item.PackageSize));
            }
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            forEach(data, function(value, key) {
                $scope.lookup[key] = value;
                if (key == 'StoreMaster' && $scope.item.PharmacyId === 0) {
                    /* $scope.item.PharmacyId = value[0].Id; */
                    for (var idx in value) {
                        var store = value[idx];
                        if (store.IsDefaultPrescriptionStore) {
                            $scope.item.PharmacyId = store.Id;
                        }
                    }
                    if ($scope.item.PharmacyId === 0) {
                        $scope.item.PharmacyId = value[0].Id;
                    }
                }
            });
        }

        $scope.initLookup = function() {
            var inputData = [{
                "Key": "StoreMaster",
                Request: {
                    Params: [{
                            Key: 2,
                            Value: 1
                        },
                        {
                            Key: 3,
                            Value: 2
                        },
                        {
                            Key: 7,
                            Value: 2
                        }
                    ]
                },
                Default: false
            }];
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

    PrescriptionFavController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();