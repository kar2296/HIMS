(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('referralFormController', referralFormController);

    function referralFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true,
            FacilityId: utl.Session.getCurrentFacilityId(),
            CountryId: 1
        };

        $scope.currentcontext = {};
        $scope.fillDefaultValues = function() {

        }
        if (!$scope.currentcontext.id || $scope.currentcontext.id == 0) {
            $scope.fillDefaultValues();
        }
        $scope.currentcontext.ismodal = modalConfig && modalConfig.params ? true : false

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.id = parseInt($stateParams.id);
        }

        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
        };
        $scope.numberonly = function (e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };
        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'generalmaster/referral/GetReferralById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.save = function() {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        }
        $scope.saveAndApprove = function() {
            if ($scope.item.IsActive == true) { $scope.item.ActiveStatusId = 2; } else { $scope.item.ActiveStatusId = 3 }
            $scope.saveItem();
        }
        $scope.backToList = function() {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            } else {
                $state.go('app.referrals');
            }
        }
        $scope.clear = function() {
            $scope.item = {};
            $scope.fillDefaultValues();
        }
        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function() {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'generalmaster/referral/AddReferral';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'generalmaster/referral/UpdateReferral';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        //$scope.saveAndApprove = function (){
        //if (new Date($scope.item.ActiveTo) < new Date()) {

        //  $scope.item.ActiveStatusId = 3;
        //}
        //else if(new Date($scope.item.ActiveTo) > new Date()){
        //  $scope.item.ActiveStatusId = 2;
        //}
        //else{
        //  $scope.item.ActiveStatusId = 1;
        //}
        //  $scope.saveItem();
        //}
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            var facilitydata = $scope.lookup.Facility;
            for (var idx in facilitydata) {
                if (facilitydata[idx].Id > 0) {
                    $scope.item.CountryId = facilitydata[idx].CountryId;
                    $scope.item.StateId = facilitydata[idx].StateId;

                    $scope.item.DistrictId = facilitydata[idx].DistrictId;
                    $scope.item.CityId = facilitydata[idx].CityId;

                    $scope.swosthaintegration = facilitydata[idx].IsSwosthaIntegration;
                }
            }
            $scope.getItem();
            $scope.getFacility();
        }

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "ReferralType" },
                { "Key": "MarketingPerson" },
                 {"Key" : "Speciality"},
                {"Key" : "City"},
                {"Key" : "State"},
                {"Key" : "Country"}
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.getFacilityCallback = function (scope, res, options, hasError) {
            $scope.facilityitem = res.Data;
            $scope.item.IsAddressSearch = $scope.facilityitem[0].IsAddressSearch;
            $scope.item.IsAlternateEmailMandatory = $scope.facilityitem[0].IsAlternateEmailMandatory;
            $scope.item.IsAlternateMobileMandatory = $scope.facilityitem[0].IsAlternateMobileMandatory;
            $scope.item.IsPincodeFreeText = $scope.facilityitem[0].IsPincodeFreeText;
            console.log('Facility pincode', $scope.item.IsPincodeFreeText);
        };
        $scope.getFacility = function () {

            var inputData = {
                Params: [{
                    Key: 0,
                    Value: utl.Session.getCurrentFacilityId()
                },],
            };

            var options = {
                action: 'SystemSettings/facility/GetFacilitys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getFacilityCallback
            };

            utl.Http.doAction(options);
        };

        // ------------------------------------------------------------------
        // React view and fixes (new code only; the functions above are not changed).
        // referral-form.html now mounts ReferralFormScreen, as a page and as the "add referral"
        // pop-up opened from the registration screens.
        //
        // 1. Editing showed an almost empty form: getItem() uses GetReferralById, which only
        //    returns Id, type, name, code and phone. So every other field was blank and Is Active
        //    was unticked, and Save & Approve then saved the referral as Inactive. The full record
        //    is now loaded with GetReferrals (filtered by Id). GetReferralById is left as it is
        //    because the admission and surgery screens use its short form.
        // 2. Address 1 and Area were never saved (Address 1 was bound to a variable outside the
        //    form, Area to item.Ward which is not a referral field). Both are saved now.
        // 3. District is not stored on a referral, so after reopening a referral the City list
        //    could not load. It is now looked up from the saved city.
        // 4. Save & Approve can no longer be sent twice by a double click (two referrals).
        // 5. Required fields and the phone number / e-mail format are checked, with the problem
        //    shown next to the field.
        // ------------------------------------------------------------------
        var rfLoading = false;
        var rfSaving = false;
        var rfSavingTimer = null;
        $scope.rfErrors = {};

        // Fields a referral has (Referral.Model.ts); only these are sent when saving.
        var rfSaveFields = ['Id', 'Rev', 'FacilityId', 'ReferralTypeId', 'ReferralCode', 'ReferralName', 'MarketingPersonId',
            'ContactPerson', 'PhoneNo', 'FaxNo', 'Email', 'ActiveFrom', 'ActiveTo', 'AddressLine1', 'AddressLine2', 'PinCodeId',
            'Area', 'CityId', 'StateId', 'CountryId', 'BirthDate', 'AnniversaryDate', 'Qualification', 'SpecialityId', 'PANNo',
            'AccountNo', 'BankNo', 'IFSCCode', 'Source', 'ActiveStatusId', 'IsActive', 'IsDefault'];

        // Fields the React form may change directly.
        var rfEditableFields = ['ReferralTypeId', 'ReferralName', 'Qualification', 'PhoneNo', 'Email', 'PANNo', 'Source',
            'AccountNo', 'BankNo', 'IFSCCode', 'AddressLine1', 'MarketingPersonId', 'ContactPerson', 'BirthDate',
            'IsActive', 'IsDefault'];

        function rfText(key, fallback) {
            var text = $translate.instant(key);
            return text && text !== key ? text : fallback;
        }

        function rfId(value) {
            return value === undefined || value === null || value === '' || value === -1 ? null : value;
        }

        function rfPad(n) {
            return (n < 10 ? '0' : '') + n;
        }

        // Date (or API date string) -> "yyyy-MM-dd" in local time; '' when empty.
        function rfToInputDate(value) {
            if (!value) {
                return '';
            }
            var date = value instanceof Date ? value : new Date(value);
            if (isNaN(date.getTime())) {
                return '';
            }
            return date.getFullYear() + '-' + rfPad(date.getMonth() + 1) + '-' + rfPad(date.getDate());
        }

        // "yyyy-MM-dd" -> Date at local midnight (null when empty or invalid).
        function rfParseInputDate(value) {
            var parts = String(value || '').split('-');
            if (parts.length !== 3) {
                return null;
            }
            var date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            return isNaN(date.getTime()) ? null : date;
        }

        function rfShowError(data) {
            if (data && data.Error && data.Error.Code) {
                var key = 'common.errors.' + data.Error.Code + '.lbl';
                var message = $translate.instant(key);
                utl.Alert.showErrorMsg(message !== key ? message : (data.Error.Message || message));
            }
        }

        $scope.buildReferralFormReactProps = function () {
            var item = $scope.item || {};
            var lookup = $scope.lookup || {};
            return {
                labels: {
                    modalTitle: rfText('generalmaster.referraltab.pagetitle.lbl', 'Manage Referral'),
                    close: 'Close',
                    loading: 'Loading referral...',
                    select: 'Select',
                    sourceType: rfText('registration.registrationcumvisit.sourcetype.lbl', 'Source Type'),
                    referralName: rfText('generalmaster.referral-form.referralname.lbl', 'Referral Name'),
                    qualification: rfText('generalmaster.referral-form.qualification.lbl', 'Qualification'),
                    phoneNo: rfText('generalmaster.referral-form.phoneno.lbl', 'Phone No'),
                    email: rfText('generalmaster.referral-form.emailid.lbl', 'Email ID'),
                    panNo: rfText('generalmaster.referral-form.panno.lbl', 'PAN No'),
                    source: 'Source',
                    accountNo: 'Account #',
                    bankNo: 'Bank #',
                    ifscCode: 'IFSC Code',
                    address1: rfText('registration.fullregistration.addressline1.lbl', 'Address 1'),
                    country: rfText('registration.fullregistration.country.lbl', 'Country'),
                    state: rfText('registration.fullregistration.state.lbl', 'State'),
                    district: 'District',
                    city: rfText('registration.fullregistration.citytown.lbl', 'City/Town'),
                    area: rfText('registration.fullregistration.area.lbl', 'Area'),
                    pincode: rfText('registration.fullregistration.pincode.lbl', 'Pin Code'),
                    marketingPerson: rfText('generalmaster.referral-form.markettingperson.lbl', 'Marketing Person'),
                    contactPerson: rfText('generalmaster.referral-form.contactperson.lbl', 'Contact Person'),
                    birthDate: rfText('generalmaster.referral-form.birthdate.lbl', 'Birth Date'),
                    isActive: rfText('clinicalmaster.allergy-form.isactive.lbl', 'Is Active'),
                    isDefault: rfText('generalmaster.referral-form.isdefault.lbl', 'Default Referral'),
                    back: rfText('common.backaction.lbl', 'Back'),
                    saveApprove: rfText('common.saveapprove-action.lbl', 'Save & Approve'),
                    saving: 'Saving...'
                },
                item: {
                    ReferralTypeId: rfId(item.ReferralTypeId),
                    ReferralName: item.ReferralName || '',
                    Qualification: item.Qualification || '',
                    PhoneNo: item.PhoneNo || '',
                    Email: item.Email || '',
                    PANNo: item.PANNo || '',
                    Source: item.Source || '',
                    AccountNo: item.AccountNo || '',
                    BankNo: item.BankNo || '',
                    IFSCCode: item.IFSCCode || '',
                    AddressLine1: item.AddressLine1 || '',
                    CountryId: rfId(item.CountryId),
                    StateId: rfId(item.StateId),
                    DistrictId: rfId(item.DistrictId),
                    CityId: rfId(item.CityId),
                    WardId: rfId(item.WardId),
                    PinCodeId: rfId(item.PinCodeId),
                    Pincode: item.Pincode || '',
                    MarketingPersonId: rfId(item.MarketingPersonId),
                    ContactPerson: item.ContactPerson || '',
                    BirthDate: rfToInputDate(item.BirthDate),
                    IsActive: !!item.IsActive,
                    IsDefault: !!item.IsDefault
                },
                lookup: {
                    ReferralType: lookup.ReferralType || [],
                    MarketingPerson: lookup.MarketingPerson || []
                },
                errors: $scope.rfErrors,
                isModal: !!$scope.currentcontext.ismodal,
                loading: rfLoading,
                busy: rfSaving
            };
        };

        $scope.reactProps = $scope.buildReferralFormReactProps();
        $scope.$watch($scope.buildReferralFormReactProps, function (props) {
            $scope.reactProps = props;
        }, true);

        // Address control updates (same keys every address control sends).
        function rfApplyAddress(updates) {
            var item = $scope.item;
            var map = {
                countryid: 'CountryId', country: 'Country', stateid: 'StateId', state: 'State',
                districtid: 'DistrictId', district: 'District', cityid: 'CityId', city: 'City',
                areaid: 'WardId', area: 'Area', pincodeid: 'PinCodeId', pincode: 'Pincode'
            };
            angular.forEach(map, function (field, key) {
                if (updates.hasOwnProperty(key)) {
                    item[field] = /id$/.test(key) ? rfId(updates[key]) : updates[key];
                }
            });
        }

        // Runs fn inside an AngularJS digest straight away (React events arrive outside one), so
        // the screen shows the result at once; falls back to the running digest if there is one.
        function rfRunInDigest(fn) {
            var phase = $scope.$root.$$phase;
            if (phase === '$apply' || phase === '$digest') {
                fn();
            } else {
                $scope.$apply(fn);
            }
        }

        $scope.handleReactAction = function (actionName, payload) {
            payload = payload || {};
            rfRunInDigest(function () {
                switch (actionName) {
                    case 'setField':
                        if (rfEditableFields.indexOf(payload.field) >= 0) {
                            $scope.item[payload.field] = payload.field === 'BirthDate' ? rfParseInputDate(payload.value) : payload.value;
                            if ($scope.rfErrors[payload.field]) {
                                $scope.rfErrors = angular.extend({}, $scope.rfErrors);
                                delete $scope.rfErrors[payload.field];
                            }
                        }
                        break;
                    case 'address':
                        rfApplyAddress(payload.updates || {});
                        break;
                    case 'save':
                        $scope.rfSaveAndApprove();
                        break;
                    case 'back':
                        $scope.backToList();
                        break;
                }
            });
        };

        // 1 + 3. Load the full referral (new function; the original getItem is kept unused).
        $scope.rfOriginalGetItem = $scope.getItem;
        $scope.getItem = function () {
            if (!($scope.currentcontext.id > 0)) {
                return;
            }
            rfLoading = true;
            utl.Http.doAction({
                action: 'generalmaster/referral/GetReferrals',
                data: { Params: [{ Key: 0, Value: $scope.currentcontext.id }], PageContext: { PageSize: 1, PageNumber: 1 } },
                type: 'post',
                onComplete: $scope.rfGetFullItemCallback,
                onError: function (data) {
                    $scope.$evalAsync(function () { rfLoading = false; rfShowError(data); });
                }
            });
        };

        $scope.rfGetFullItemCallback = function (scope, res) {
            var row = res && res.Data && res.Data[0];
            if (!row) {
                rfLoading = false;
                $scope.rfOriginalGetItem(); // fall back to the old short record
                return;
            }
            row.WardId = row.PinCodeId; // the Area list is the city's pin-code list
            $scope.item = row;
            if (!row.CityId) {
                rfLoading = false;
                return;
            }
            utl.Http.doAction({
                action: 'generalmaster/CityMaster/GetCityMasters',
                data: { Params: [{ Key: 0, Value: row.CityId }], PageContext: { PageSize: 1, PageNumber: 1 } },
                type: 'post',
                onComplete: function (s, cityRes) {
                    var city = cityRes && cityRes.Data && cityRes.Data[0];
                    if (city && $scope.item === row) {
                        row.DistrictId = city.DistrictId;
                    }
                    rfLoading = false;
                },
                onError: function () {
                    $scope.$evalAsync(function () { rfLoading = false; });
                }
            });
        };

        // 5. Validation.
        function rfValidate() {
            var item = $scope.item;
            var labels = $scope.reactProps.labels;
            var errors = {};
            var missing = [];
            if (!rfId(item.ReferralTypeId)) {
                errors.ReferralTypeId = 'Required';
                missing.push(labels.sourceType);
            }
            if (!(item.ReferralName || '').trim()) {
                errors.ReferralName = 'Required';
                missing.push(labels.referralName);
            }
            if (!item.PhoneNo) {
                errors.PhoneNo = 'Required';
                missing.push(labels.phoneNo);
            } else if (!/^\d{10}$/.test(item.PhoneNo)) {
                errors.PhoneNo = 'Enter a 10-digit number';
            }
            if (item.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.Email)) {
                errors.Email = 'Enter a valid e-mail address';
            }
            $scope.rfErrors = errors;
            if (missing.length) {
                utl.Alert.showErrorMsg('Please fill in: ' + missing.join(', '));
            } else if (Object.keys(errors).length) {
                utl.Alert.showErrorMsg('Please correct the highlighted fields');
            }
            return Object.keys(errors).length === 0;
        }

        function rfSetSaving(saving) {
            rfSaving = saving;
            if (rfSavingTimer) {
                clearTimeout(rfSavingTimer);
                rfSavingTimer = null;
            }
            if (saving) {
                // Safety net: a request that fails without a response calls no callback.
                rfSavingTimer = setTimeout(function () {
                    $scope.$evalAsync(function () { rfSetSaving(false); });
                }, 60000);
            }
        }

        // 2 + 4. Save & Approve (new function; saveAndApprove/saveItem above are kept).
        $scope.rfSaveAndApprove = function () {
            if (rfSaving || rfLoading || !rfValidate()) {
                return;
            }
            var item = $scope.item;
            item.ActiveStatusId = item.IsActive == true ? 2 : 3; // same rule as saveAndApprove()
            item.ReferralName = (item.ReferralName || '').trim().toUpperCase();
            var data = {};
            rfSaveFields.forEach(function (field) {
                if (item[field] !== undefined) {
                    data[field] = item[field];
                }
            });
            // The Area list and the pin-code list are both pin-code master rows.
            data.PinCodeId = rfId(item.PinCodeId) || rfId(item.WardId);
            var isUpdate = $scope.currentcontext.id && $scope.currentcontext.id > 0;
            rfSetSaving(true);
            utl.Http.doAction({
                action: isUpdate ? 'generalmaster/referral/UpdateReferral' : 'generalmaster/referral/AddReferral',
                data: { Data: data },
                type: 'post',
                onComplete: function () {
                    rfSetSaving(false);
                    $scope.saveItemCallback.apply(this, arguments);
                },
                onError: function (errorData) {
                    $scope.$evalAsync(function () {
                        rfSetSaving(false);
                        rfShowError(errorData);
                    });
                }
            });
        };

        $scope.initLookup();
        $scope.item.ActiveFrom = new Date();
    }

    referralFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();