(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('bedmanagementGridController', bedmanagementGridController);

    function bedmanagementGridController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.items = [];
        $scope.context = $stateParams.tp;
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            AdmissionDate: '',
            AdmissionStatusId: -1,
            WardId: -1,
            DoctorId: -1,
            PatientNameMRN: '',
            AdmissionRequestTypeId: -1,
            UserId: utl.Session.getCurrentUserId()
        };
        $scope.currentcontext = {};
        $scope.lookup = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.selectedPatient = {};

        $scope.toggleCanShowDetails = function (clickedItem) {
            for (var idx in $scope.Wards) {
                var ward = $scope.Wards[idx];
                if (ward.Id == clickedItem.Id) {
                    ward.CanShowDetails = !ward.CanShowDetails;
                }
                else {
                    ward.CanShowDetails = false;
                }
            }
        };

        $scope.StatusItems = [];
        $scope.StatusItems.push({ 'Text': 'Available', 'Colorcode': 'color:#54ac20;' })
        $scope.StatusItems.push({  'Text': 'Occupied', 'Colorcode': 'color:#65246b;' })
        $scope.StatusItems.push({ 'Text': 'Reserved', 'colorcode': 'color:#15baa6;' })
        $scope.StatusItems.push({ 'Text': 'Cleaning', 'Colorcode': 'color:#ff007e;' })
        $scope.StatusItems.push({ 'Text': 'Maintenance', 'Colorcode': 'color:#ed2324;' })
        $scope.StatusItems.push({ 'Text': 'TransferIn', 'Colorcode': 'color:#15bfaa;' });
        $scope.BedItems = [];

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'edit') {
                $state.go('app.wardtab.detail', { id: row.entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.Code);
            }
        };

        $scope.assignUIInfo = function (item) {
            if (item.IsTemp) {

            }
        };

        $scope.backToList = function () {
            $state.go('app.currentpatients', { tp: $scope.context });
        };

        $scope.patientdetails = function (bed) {
            if (bed.Patient.Id)
                utl.Modal.open('app.patientdetails', {
                    params: { pid: bed.Patient.Id, asid: bed.Encounter.AdmissionStatusId, IsAttender: bed.IsAttender },
                    confirmCallback: $scope.getWardBeds
                });
        };

        $scope.custom_sort = function (a, b) {
            return a.Id - b.Id;
        };

        $scope.custom_sort_disp_ord = function (a, b) {
            if (a.DisplayOrder >= 0 && b.DisplayOrder >= 0) return a.DisplayOrder - b.DisplayOrder;
            else return a.Id - b.Id;
        };



        $scope.getPatientProfilePicCallback = function (scope, data, options, hasError) {
            var patientId = data.Id;
            var photo = data.Photo;
            for (var idx in $scope.Wards) {
                var item = $scope.Wards[idx];
                if (idx === 1)
                    item.CanShowDetails = true;
                for (var bedidx in item.BedData) {
                    var bedItem = item.BedData[bedidx];
                    if (bedItem.Patient.Id == patientId) {
                        bedItem.isPhotoAvailable = true;
                        bedItem.PatientPhoto = photo;
                    }
                }
            }
        };

        $scope.getPatientProfilePic = function (item) {
            if (item.PhotoPath) {
                var inputData = { Id: item.Id, PhotoPath: item.PhotoPath };
                var options = {
                    action: 'registration/Patient/GetPatientProfilePic',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getPatientProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };

        function loadPhotos() {
            for (var idx in $scope.Wards) {
                var item = $scope.Wards[idx];
                if (parseInt(idx) === 0)
                    item.CanShowDetails = true;
                item.BedData.sort($scope.custom_sort);
                for (var bedidx in item.BedData) {
                    var bedItem = item.BedData[bedidx];
                    bedItem.isPatientAvailble = false;
                    bedItem.isPhotoAvailable = false;
                    bedItem.icons = [];
                    if (bedItem.Patient.Id && bedItem.Patient.Id > 0) {
                        var Patient = bedItem.Patient;
                        var Encounter = bedItem.Encounter;
                        bedItem.isPatientAvailble = true;
                        $scope.getPatientProfilePic(Patient);
                        bedItem.GenderId = Patient.GenderId;
                        if (Patient.IsVip)
                            bedItem.icons.push({ value: "fa fa-star", tooltip: "IS VIP" });
                        if (Patient.IsAllergy)
                            bedItem.icons.push({ value: "fa fa-font", tooltip: "Allergy" });
                        if (Patient.IsNBM)
                            bedItem.icons.push({ value: "fa fa-bolt", tooltip: "IS NBM" });
                        if (Encounter.IsBillLock)
                            bedItem.icons.push({ value: "fa fa-usd", tooltip: "Bill Process" });
                        if (Patient.IsDoubleOccupancy)
                            bedItem.icons.push({ value: "fa fa-user-plus", tooltip: "Double Occupancy" });
                        if (Patient.IsPatientAlert)
                            bedItem.icons.push({ value: "fa fa-bell", tooltip: "Patient Alert" });
                    }
                    else
                        bedItem.PatientPhoto = "app/ico/32-32/b1r.png";

                    if (bedItem.BedStatusId == 1 || bedItem.BedStatusId == 3 || bedItem.BedStatusId == 6) {
                        if (bedItem.BedStatusId == 1 || bedItem.BedStatusId == 3)
                            bedItem.icons.push({ value: "fa fa-user-times ", tooltip: "Reserve Bed", click: $scope.reserveBed });
                        if (bedItem.BedStatusId == 1 || bedItem.BedStatusId == 6)
                            bedItem.icons.push({ value: "fa fa-gears ", tooltip: "Maintenance", click: $scope.maintenance });
                    }
                }
            }
        };
        //back
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }

        $scope.reserveBed = function (bed) {
            utl.Modal.open('app.bedreservation', {
                params: { bedinfo: bed },
                confirmCallback: $scope.getWardBeds
            });
        };

        $scope.maintenance = function (bed) {
            utl.Modal.open('app.bedmaintenance', {
                params: { bedinfo: bed },
                confirmCallback: $scope.getWardBeds
            });
        };

        $scope.getWardBedsCallback = function (scope, res, options, hasError) {
            $scope.TotalBeds = 0;
            $scope.TodayAdmittedBed = 0;
            $scope.AvailableBed = 0;
            $scope.OccupiedBed = 0;
            $scope.Wards = [];
            for (var idx in res.Data) {
                var bv = res.Data[idx];
                if ($scope.currentfilter.FacilityId == -1
                    || bv.FacilityId == $scope.currentfilter.FacilityId) {
                    $scope.Wards.push(bv);
                }
            }
            if($scope.Wards && $scope.Wards.length <= 0)
               return false;
            $scope.Wards.sort($scope.custom_sort_disp_ord);
            $scope.Wards.forEach((v, i) => {
                v.BedData.forEach((bv, bi) => {
                    if (!bv.IsTemp)
                        $scope.TotalBeds += 1;
                    switch (parseInt(bv.BedStatusId)) {
                        case 1: //Available
                            bv.bedstatus_color = 'border-right: 20px solid #54ac20;';
                            if (!bv.IsTemp)
                                $scope.AvailableBed += 1;
                            //TODO: Define the css class or style element using some name. Add the appropriate icons
                            break;
                        case 2: //Occupied
                            if (!bv.IsTemp) {
                                $scope.OccupiedBed += 1;
                                var todayDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd');
                                var admissionDate = $filter('date')(bv.Encounter.AdmissionDate, 'yyyy-MM-dd');
                                if (todayDate === admissionDate)
                                    $scope.TodayAdmittedBed += 1;
                            }
                            bv.bedstatus_color = 'border-right: 20px solid #65246b';
                            //TODO: Define the css class or style element using some name. Add the appropriate icons
                            break;
                        case 3: //Reserved
                            bv.bedstatus_color = 'border-right: 20px solid #603317';
                            //TODO: Define the css class or style element using some name. Add the appropriate icons
                            break;
                        case 4: //House Keeping
                            bv.bedstatus_color = 'border-right: 20px solid #ff007e';
                            break;
                        case 5: //Temp.Bed
                            bv.bedstatus_color = 'border-right: 20px solid #15baa6';
                            break;
                        case 6: //Maintenance
                            bv.bedstatus_color = 'border-right: 20px solid #ed2324';
                            break;
                        default:
                            //sample bv.class = 'grey';
                            break;
                    }
                });
            });
            loadPhotos();
        };

        $scope.getWardBeds = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.UserId },
                    { Key: 2, Value: $scope.currentfilter.FacilityId },
                    { Key: 3, Value: $scope.currentfilter.WardId },
                    { Key: 7, Value: $scope.context == 'ae' ? 2 : $scope.context == 'ot' ? 3 : 1 },
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            inputData.Data = {
                AdmissionDate: $scope.currentfilter.AdmissionDate,
                AdmissionStatusId: $scope.currentfilter.AdmissionStatusId,
                DoctorId: $scope.currentfilter.DoctorId,
                PatientId: $scope.currentfilter.PatientId,
                AdmissionRequestTypeId: $scope.currentfilter.AdmissionRequestTypeId
            };
            var options = {
                action: 'generalmaster/WardMaster/GetWardBeds',
                data: inputData,
                type: 'post',
                onComplete: $scope.getWardBedsCallback
            };
            utl.Http.doAction(options);
        };

        $scope.item = {
            Bedboard: utl.Formatter.getCurrentDate()
        };

        // $scope.deleteItemCallback = function (scope, data, options, hasError) {
        //     utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        //     $scope.getList();
        // };

        $scope.UserId = [];
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            forEach(data, function (value, key) {
                if (key == "UserId")
                    $scope.UserId = value;
            });
            $scope.getWardBeds();
        };

        $scope.initLookup = function () {
            var inputData = [

                { "Key": "ActiveStatus" },
                { "Key": "ServiceRateCategory" },
                { "Key": "UserId" },
                { "Key": "AdmissionStatus" },
                { "Key": "AdmissionRequestType" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "Ward" },
                { "Key": "Facility" },
            ];
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
    bedmanagementGridController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];
})();