(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('privilegecardregController', privilegecardregController);

    function privilegecardregController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.item = {
            IsActive: true,
            OrganizationId: 1,
            FacilityId: utl.Session.getCurrentFacilityId()
        };
        $scope.currentcontext = {};
        $scope.currentcontext.isnewpatient = true;
        $scope.lookup = {};
        $scope.currentcontext.Id = $stateParams.id;
        $scope.PrivilegeCardDetails = [];

        $scope.getPramotionalSchemeCallback = function(scope, res, options, hasError) {
            $scope.item = res.Data[0];
            $scope.getDetails();
        };

        $scope.getPramotionalScheme = function() {
            if ($scope.currentcontext.Id > 0) {
                var inputData = {
                    Params: [{ Key: 0, Value: $scope.currentcontext.Id }]
                };
                var options = {
                    action: 'billing/PrivilegeCard/GetPrivilegeCards',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPramotionalSchemeCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getDetailsCallback = function(scope, res, options, hasError) {
            $scope.PrivilegeCardDetails = res.Data;
            if (res.Data.length > 0) {
                for (var idx in $scope.PrivilegeCardDetails) {
                    $scope.PrivilegeCardDetails[idx].Gender = $scope.PrivilegeCardDetails[idx].Gender.Description;
                    $scope.PrivilegeCardDetails[idx].PatientName = $scope.PrivilegeCardDetails[idx].Title.Description + ' ' +
                        $scope.PrivilegeCardDetails[idx].FirstName + ' ' + $scope.PrivilegeCardDetails[idx].LastName;
                }
            }
        };

        $scope.getDetails = function() {
            if ($scope.currentcontext.Id > 0) {
                var inputData = {
                    Params: [{ Key: 1, Value: $scope.currentcontext.Id }]
                };
                var options = {
                    action: 'billing/PrivilegeCardDetail/GetPrivilegeCardDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function() {
            $state.go('app.privilegecardlist');
        };

        $scope.save = function() {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        };

        $scope.addcard = function() {
            if ($scope.item.FirstName && $scope.item.MobileNo) {
                var patientInfo = {
                    Id: 0,
                    PatientId: $scope.item.PatientId,
                    TitleId: $scope.item.TitleId,
                    FirstName: $scope.item.FirstName,
                    LastName: $scope.item.LastName,
                    HolderName: $scope.item.title + ' ' + $scope.item.FirstName + ' ' + $scope.item.LastName,
                    PatientName: $scope.item.title + ' ' + $scope.item.FirstName + ' ' + $scope.item.LastName,
                    Age: $scope.item.Age,
                    DOB: $scope.item.DOB,
                    Mobile: $scope.item.MobileNo,
                    MobileNo: $scope.item.MobileNo,
                    Address: $scope.item.Address,
                    GenderId: $scope.item.GenderId,
                    Gender: $scope.item.Gender,
                    Title: $scope.item.title,
                    MRNTypeId: 2,
                    NationalityId: 238,
                    PreferredLanguageId: 4,
                    RegisteredDate: utl.Formatter.getCurrentDate(),
                    PatientStatusId: 2,
                    PatientStatus: 'Active',
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    OverrideDuplicate: false,
                    CountryId: 1,
                    CardTypeId: $scope.item.CardTypeId,
                    PromotionSchemeId: $scope.item.PromotionalSchemeId,
                    CardNo: $scope.item.CardNo,
                    ValidTo: $scope.item.ValidTo,
                    Status: 1
                }
                $scope.PrivilegeCardDetails.push(patientInfo);
            }
            $scope.ClearData();
        }

        $scope.ClearData = function() {
            $scope.item.PatientId = 0;
            $scope.item.FirstName = '';
            $scope.item.LastName = '';
            $scope.item.PatientName = '';
            $scope.item.Age = '';
            $scope.item.Address = '';
            $scope.item.MobileNo = '';
            $scope.item.GenderId = -1;
            $scope.item.TitleId = -1;
        }

        $scope.saveAndApprove = function() {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        };

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        $scope.saveItem = function() {
            var actionName = 'billing/PrivilegeCard/AddPrivilegeCard';
            if ($scope.currentcontext.Id && $scope.currentcontext.Id > 0) {
                actionName = 'billing/PrivilegeCard/UpdatePrivilegeCard';
            }
            var inputData = {
                Header: $scope.item,
                Details: $scope.PrivilegeCardDetails
            };
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getPromotionalSchemes = function(item) {
            var inputData = {
                Params: [{ Key: 0, Value: $scope.item.PromotionalSchemeId }],
            };

            var options = {
                action: 'billing/PromotionalScheme/GetPromotionalSchemes',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPromotionalSchemesCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getPromotionalSchemesCallback = function(scope, res, options, hasError) {
            $scope.items = res.Data;
            $scope.item.PromotionalSchemeId = $scope.items[0].Id;
            $scope.item.ValidTo = $scope.items[0].ActiveTo;
            $scope.item.PromotionSchemeCode = $scope.items[0].PromotionSchemeCode;
            $scope.item.PromotionSchemeName = $scope.items[0].PromotionSchemeName;
            $scope.item.CardTypeId = $scope.items[0].PromotionSchemeTypeId;

        };
        $scope.getSchemescardlookup = function() {
            $scope.item.PromotionalSchemeId = -1;
            if ($scope.item.CardTypeId > 0) {
                var inputData = [{
                    "Key": "PromotionalScheme",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: $scope.item.CardTypeId
                        }]
                    }
                }, ];
                $scope.getLookUp(inputData);
            }
        };
        $scope.patientChange = function(pageNo) {
            if ($scope.item.PatientId && $scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.item.PatientId
                    },
                    type: 'post',
                    onComplete: $scope.PatInfoCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.PatInfoCallback = function(scope, data, options, hasError) {
            $scope.PatientData = data;
            $scope.item.PatientId = $scope.PatientData.Id;
            $scope.item.TitleId = $scope.PatientData.TitleId;
            $scope.item.FirstName = $scope.PatientData.FirstName;
            $scope.item.LastName = $scope.PatientData.LastName;
            $scope.item.MRN = $scope.PatientData.MRN;
            $scope.item.Age = $scope.PatientData.Age;
            $scope.item.DOB = $scope.PatientData.DOB;
            $scope.item.MobileNo = $scope.PatientData.Mobile;
            $scope.item.GenderId = $scope.PatientData.GenderId;
            $scope.item.AddressLine1 = $scope.PatientData.AddressLine1;
            $scope.item.PatientTypeId = $scope.PatientData.PatientTypeId;
        }


        $scope.fillGenderInfo = function() {
            $scope.item.title = $scope.item.TitleId.Text;
            if ($scope.item.TitleId == 10 || $scope.item.TitleId == 37) { // 10-MR 37-master
                $scope.item.GenderId = 1; // 1-Male
                $scope.item.Gender = 'MALE';
            } else if ($scope.item.TitleId == 11 || $scope.item.TitleId == 12 || $scope.item.TitleId == 5) { //11- MRS, 12- MS, 5 - MISS
                $scope.item.GenderId = 2; // 2-FeMale
                $scope.item.Gender = 'FEMALE';
            }
        };

        $scope.SelectedTitle = function(selectedItem) {
            $scope.item.TitleId = selectedItem.Id;
            $scope.item.title = selectedItem.Text;
        };

        $scope.Selectedgender = function(selectedItem) {
            $scope.item.Gender = selectedItem.Text;
        };

        $scope.canShowApproxAge = function(vTitleId) {
            if (vTitleId && $scope.lookup) {
                for (var idx in $scope.lookup.Title) {
                    if (vTitleId == $scope.lookup.Title[idx].Id) {
                        if ($scope.lookup.Title[idx].Code.toLowerCase() == "babyof" || $scope.lookup.Title[idx].Code.toLowerCase() == "baby") {
                            return true;
                        }
                    }
                }
            }
            return false;
        };

        $scope.calculateAge = function() {
            $scope.item.Age = utl.Formatter.getAgeFromDOB($scope.item.DOB);
        };

        $scope.calculateDOB = function(age, substractPart) {
            var options = {
                d: $scope.item.ApproxAgeDays,
                m: $scope.item.ApproxAgeMonths,
                y: $scope.item.Age
            };
            $scope.item.DOB = utl.Formatter.getDOBFromAgeConfig(options);
            $scope.item.Age = utl.Formatter.getAgeFromDOB($scope.item.DOB);
            $scope.item.IsBirthDateApproximate = true;
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            forEach(data, function(value, key) {
                $scope.lookup[key] = value;
            })
        };

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "PromotionSchemeType" },
                { "Key": "PromotionalScheme" },
                {
                    "Key": "Title"
                },
                {
                    "Key": "Gender"
                },
            ]
            $scope.getLookUp(inputData);
        };

        $scope.getLookUp = function(inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
        $scope.getPramotionalScheme();
    }

    privilegecardregController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();