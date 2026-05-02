(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ProcedureFavoriteOrdersController', ProcedureFavoriteOrdersController);

    function ProcedureFavoriteOrdersController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.lookup = {};
        $scope.item = {};
        $scope.details = [];
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        if ($stateParams.pid)
            $scope.currentcontext.pid = $stateParams.pid;
        $scope.item.PatientId = $stateParams.pid;

        $scope.item.EncounterId = utl.Session.getEncounterId();
        $scope.currentcontext.GuarantorId = 0;
        $scope.item = {
            SearchTypeId: 4,
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

        $scope.dashboard = function () {
            $state.go('patientemr.patientdashboard');
        }
        $scope.addorders = function () {
            $state.go('patientemr.procedureordertab.procedureorders');
        };
        $scope.favorders = function () {
            $state.go('patientemr.procedureordertab.favoriteorders', {
                pid: $scope.currentcontext.pid
            });
        };

        $scope.ticksheetconfig = {
            ticksheetmastertypeid: 4,
            selectedlist: [],
            selecteddetail: {},
            departmentid: $scope.currentcontext.userDepartmentId,
            additionalinfo: {
                ServiceRateCategoryId: $scope.item.ServiceRateCategoryId
            }
        };

        function checkExist(item) {
            for (var idx in $scope.details) {
                if ((item.TestId == $scope.details[idx].TestId) && ($scope.details[idx].Status == 1)) {
                    return true;
                }
            }
            return false
        }

        $scope.addTickSheet = function () {
            var testmaster = $scope.ticksheetconfig.selecteddetail.Testmaster;
            var currentItem = getNewItem();
            currentItem.ProcedureId = $scope.ticksheetconfig.selecteddetail.ItemId;
            currentItem.ServiceId = $scope.ticksheetconfig.selectedlist.ServiceId;
            currentItem.ServiceCode = $scope.ticksheetconfig.selectedlist.ServiceCode;
            currentItem.ServiceName = $scope.ticksheetconfig.selectedlist.ServiceName;
            currentItem.ServiceCategoryId = $scope.ticksheetconfig.selectedlist.ServiceCategoryId;
            currentItem.TestTypeId = testmaster.TESTMASTERTYPId;
            currentItem.TestName = testmaster.Name;
            currentItem.TestCode = testmaster.Code;
            currentItem.TestDescription = testmaster.Description;
            currentItem.SpecimanId = testmaster.SampletypeId;

            utl.Modal.open('patientemr.patientorderdetail', {
                params: {
                    id: 0,
                    pid: $scope.item.PatientId,
                    current_item: currentItem
                },
                confirmCallback: $scope.onDetailSave
            });
        }

        $scope.saveFavoritesCallback = function (scope, res, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.addorders();
            $scope.getList();
        };


        $scope.saveTickSheets = function () {
            $scope.details.splice(-1, 1);
            for (var idx in $scope.ticksheetconfig.selectedlist) {
                var ticksheetitem = $scope.ticksheetconfig.selectedlist[idx];
                var item = {
                    Id: 0,
                    ProcedureOrderId: 0,
                    RequestDate: utl.Formatter.getCurrentDate(),
                    ProcedureId: ticksheetitem.ItemId,
                    ProcedureName: ticksheetitem.ItemName,
                    ServiceItemId: ticksheetitem.ServiceId,
                    ServiceCode: ticksheetitem.ServiceCode,
                    ServiceName: ticksheetitem.ServiceName,
                    Quantity: ticksheetitem.Quantity,
                    ServiceCategoryId: ticksheetitem.ServiceCategoryId,
                    TestPrice: 10,
                    Discount: 0,
                    TaxCost: 0,
                    OrderPriorityId: $scope.item.OrderPriorityId,
                    OrderPriority: 'Routine',
                    IsDirectBill: ticksheetitem.IsDirectBill || false,
                    ProcedureTypeId: ticksheetitem.TestTypeId,
                    // ProcedureType: ticksheetitem.Testmaster.TESTMASTERTYP.Description,
                    NetAmount: 10,
                    OrderStatusId: $scope.item.OrderStatusId,
                    RequestDate: $scope.item.OrderRequestDate,
                    ScheduleDate: $scope.item.OrderScheduleDate,
                    Status: 1,
                }
                if (!checkExist(item)) {
                    // item.autoSearchName = item.autoSearchName || getAutoSearchName();
                    $scope.details.push(item);
//                     computeTestData(item, ticksheetitem.Testmaster);
                }
                $state.go('patientemr.procedureordertab.procedureorders', {
                    orddetails: $scope.details
                });
            }

        }

        function computeTestData(item, testMaster) {
            item.DepartmentId = testMaster.DepartmentId;
            item.IsDirectBill = testMaster.IsDirectBill || false;
            item.TestTypeId = testMaster.TESTMASTERTYPId;
            if (testMaster.TESTMASTERTYP)
                item.TestType = testMaster.TESTMASTERTYP.Description;
            item.TestCode = testMaster.Code;
            item.TestName = testMaster.Name;
            item.TestDescription = testMaster.Description;
            item.SpecimanId = testMaster.SampletypeId;
            item.ResourceId = testMaster.ResourceId || 0;
            if (testMaster.ServiceItem) {
                item.CategoryId = testMaster.ServiceItem.CategoryId || 0;
                if (testMaster.ServiceItem.ParentCategory) {
                    item.CategoryName = testMaster.ServiceItem.ParentCategory.ServiceCategoryName || '';
                }
            }
            if (testMaster.ScheduleDate) {
                item.ScheduleDate = testMaster.ScheduleDate;
            } else
                item.ScheduleDate = $scope.item.OrderScheduleDate;

            var Tariff = {
                Rate: 0,
                DoctorShare: 0
            };
            var ServiceItem = testMaster.ServiceItem;
            if (ServiceItem && ServiceItem.Id > 0 &&
                ServiceItem.ServiceItemTariffDetails && ServiceItem.ServiceItemTariffDetails.length > 0) {
                Tariff = ServiceItem.ServiceItemTariffDetails[0];
            }

            item.TestPrice = Tariff.Rate;
            $scope.item.TestPrice = Tariff.Rate;
            item.DoctorShare = Tariff.DoctorShare || 0;
            $scope.computeNetAmount(item);
        }

        $scope.computeNetAmount = function (item) {
            if (item.TestPrice && item.Quantity) {
                item.NetAmount = item.TestPrice * item.Quantity;
                $scope.BillCalc();
            }
        };

        $scope.BillCalc = function () {
            $scope.BillAmount = 0;
            $scope.BillDiscount = 0;
            $scope.item.OrderTotal = 0;
            for (var idx in $scope.details) {
                var item = $scope.details[idx];
                $scope.BillAmount += parseFloat(item.Quantity) * parseFloat(item.TestPrice);
                $scope.BillDiscount += parseFloat(item.Discount);
                item.Rate = item.TestPrice;
                item.Quantity = item.Quantity;
                item.Amount = parseFloat(item.Quantity) * parseFloat(item.TestPrice);
                item.GrossAmount = parseFloat(item.Quantity) * parseFloat(item.TestPrice);
                item.DiscountAmount = parseFloat(item.Discount);
                if (item.Discount) {
                    item.NetAmount = (parseFloat(item.Quantity) * parseFloat(item.TestPrice)) - parseFloat(item.Discount);
                } else {
                    item.NetAmount = (parseFloat(item.Quantity) * parseFloat(item.TestPrice));
                }
                $scope.item.OrderTotal += item.NetAmount;
            }
        };

        $scope.saveFavoritesCallback = function (scope, res, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.addprescribe();
            $scope.getList();
        };


        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.prescriptionDetails) {
                var item = $scope.prescriptionDetails[idx];
                if (item.DrugId > 0 || item.GenericId > 0) {
                    item.PharmacyId = $scope.item.PharmacyId;
                    item.PrescriptionId = 0;
                    item.GuarantorId = $scope.item.GuarantorId;
                    item.SearchTypeId = $scope.item.SearchTypeId;
                    item.NetAmount = item.Price * item.Quantity;
                    result.push(item);
                }
                for (var didx in $scope.prescriptionDetails) {
                    var ditem = $scope.prescriptionDetails[didx];
                    if (ditem.Status === 2 && ditem.Id > 0) {
                        result.push(ditem);
                    }
                }
            }
            return result;
        }

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

        $scope.initLookup();
    }

    ProcedureFavoriteOrdersController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();