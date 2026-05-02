    (function () {
        'use strict';

        angular
            .module('app.pages')
            .controller('estimationbillingFormController', estimationbillingFormController);

        function estimationbillingFormController($scope, $filter, $stateParams, $state, $translate, utl) {
            var vm = this;
            $scope.item = {
                EstimationDate: utl.Formatter.getCurrentDate(),
                RequestedBy: utl.Session.getCurrentUserId(),
                FacilityId: utl.Session.getCurrentFacilityId(),
                GuarantorId: -1,
                RelationshipId: -1,
                BedTypeId:-1

            };
            var savehitcompleted = 0;
            $scope.lookup = {};
            $scope.currentcontext = {};
            $scope.details = [];
    
            $scope.currentcontext.id = parseInt($stateParams.id);

            $scope.addNewLineItem = function() {
                var detail = getNewItem();
                if ($scope.currentcontext.id > 0) {
                    detail.PatientEstimationId = $scope.currentcontext.id;
                }
                $scope.details.push(detail);
            };
    
            function getNewItem() {
                var detail = {
                    Id: 0,
                    // ServiceGroupId: 0,
                    BedTypeId: '',
                    Rate: 0.00,
                    Days: 1,
                    EstimationAmount: 0.00,
                    Remarks: '',
                    Status: 1
                };
                return detail;
            }
    
            $scope.addNew = function() {
                $state.go('app.estimationbillingForm', { id: 0 });
            };
    
            $scope.onDetailSave = function(itemFromModal) {
                var isaddnew = true;
                $scope.details.splice(-1, 1);
                for (var idx in $scope.details) {
                    var item = $scope.details[idx];
                    if (item.currenteditable) {
                        item = itemFromModal;
                        item.currenteditable = false;
                        isaddnew = false;
                    }
                }
                if (isaddnew) {
                    itemFromModal.Status = 1;
                    if ($scope.currentcontext.id > 0) {
                        itemFromModal.PatientEstimationId = $scope.currentcontext.id;
                    }
                    $scope.details.push(itemFromModal);
                }
                $scope.addNewLineItem();
            };
            function removeLastEntryBeforeSave() {
                var item = $scope.details[$scope.details.length - 1];
                if (!item.PatientEstimationId || item.PatientEstimationId == -1) {
                    $scope.details.splice(-1, 1);
                }
            }
            $scope.packageChanged = function(idx, items) {
                var isDuplicate = utl.Common.isDuplicateRec($scope.details, { pivotkey: 'ServiceGroupId', displaykey: 'ServiceGroup' });
                if (isDuplicate) {
                    items.ServiceGroupId = '';
                    items.ServiceGroup = '';
                    items.BedTypes = '';
                    items.BedTypeId = '';
                    items.Rate = '';
                    return;
                }
    
                items.ServiceGroup = items.SelectedItem.ServiceGroup;
                items.BedTypes = items.SelectedItem.BedTypes;
                items.BedTypeId = items.SelectedItem.BedTypeId;
                items.Rate = items.SelectedItem.Rate;
    
                var lastIndex = $scope.details.length - 1;
                if (idx == lastIndex) {
                    $scope.updateEstimationAmount();
                    $scope.addNewLineItem();
                }

            };
            $scope.getDetailsCallback = function(scope, res, options, hasError) {
                $scope.details =res.Data || [];
                $scope.addNewLineItem();
            };
    
            $scope.getDetails = function(pageNo) {
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    var inputData = {
                        Params: [{ Key: 1, Value: $scope.currentcontext.id }],
                        PageContext: { PageSize: 100, PageNumber: 1 }
                    };
    
                    var options = {
                        action: 'BillingMaster/PatientEstimationDetails/GetPatientEstimationDetails',
                        data: inputData,
                        type: 'post',
                        onComplete: $scope.getDetailsCallback
                    };
                    utl.Http.doAction(options);
                } else {
                    $scope.addNewLineItem();
                }
            };

            $scope.getItemCallback = function (scope, data, options, hasError) {
                $scope.item = data;
                $scope.applyVisibilityRules();
            };

            $scope.getItem = function () {
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    var options = {
                        action: 'BillingMaster/PatientEstimation/GetPatientEstimationById',
                        data: {
                            Id: $scope.currentcontext.id
                        },
                        type: 'post',
                        onComplete: $scope.getItemCallback
                    };
                    utl.Http.doAction(options);
                } else {
                    $scope.applyVisibilityRules();
                }
            };
          
            $scope.backToList = function () {
                $state.go('app.estimationbillingList');
            }
            
            $scope.save = function () {
                if (!utl.Validator.validate($scope)) {
                    return;
                }
            
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'Do you want to Save User?',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.onSaveandDraftConfirmed,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            };
            $scope.onSaveandDraftConfirmed = function () {
                savehitcompleted = 0;
                $scope.saveItem();
                // $scope.backToList();
            };
            $scope.saveAndApprove = function () {
                console.log("approve button clicked");
                if (!utl.Validator.validate($scope)) {
                    return;
                }
                $scope.SaveTypeId=2;
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'Do you Approve User?',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.saveItem,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            };

            $scope.onsaveAndApproveConfirmed = function () {
                $scope.saveItem();
                // $scope.backToList();
            };
            $scope.Clear = function() {
                $scope.item = {};
                $scope.details = [];
                $scope.addNewLineItem();
            };
            function removeLastEntryBeforeSave() {
                var item = $scope.details[$scope.details.length - 1];
                if (!item.IPPackageId || item.IPPackageId == -1) {
                    $scope.details.splice(-1, 1);
                }
            }

            $scope.saveItemCallback = function(scope, data, options, hasError) {
                utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                if (typeof(data) == "boolean") {
                    if (options && options.data != null && options.data.Data != null) {
                        $scope.currentcontext.id = options.data.Data.Id;
                        loadData();
                    }
                } else if (typeof(data) == "number") {
                    $scope.currentcontext.id = data;
                    loadData();
                }
            };

            $scope.saveItem = function(saveTypeId) {
                if (!utl.Validator.validate($scope)) {
                    return;
                }
    
                var lines = getLinesForSave();
                var actionName = 'BillingMaster/PatientEstimation/AddPatientEstimation';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'BillingMaster/PatientEstimation/UpdatePatientEstimation';
                }
                $scope.item.SaveTypeId = saveTypeId;
                var inputData = { Header: $scope.item, Details: lines };
                var options = {
                    action: actionName,
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
    
                utl.Http.doAction(options);
            };

            $scope.save = function () {
                console.log(" save button clicked");
                if (!utl.Validator.validate($scope)) {
                    return;
                }
                $scope.saveItem(1);
                // $scope.backToList();
            };
            
            $scope.saveAndApprove = function () {
                console.log("approve button clicked");
                if (!utl.Validator.validate($scope)) {
                    return;
                }
                $scope.saveItem(2);
                // $scope.backToList();
            };
            function getLinesForSave() {
                var result = [];
                for (var idx in $scope.details) {
                    var item = $scope.details[idx];
                    if (item.ServiceGroupId > -1) {
                        result.push(item);
                    }
                }
                return result;
            }
      
            $scope.computeAmount = function (item) {
                item.EstimationAmount = (item.Rate || 0) * (item.Days || 0);
            };
            $scope.updateEstimationAmount = function (item) {
                angular.forEach($scope.details, function (item) {
                    $scope.computeAmount(item);
                });
            };
            $scope.$watch('details', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    $scope.updateEstimationAmount();
                    $scope.calculateTotalAmount();
                }
            }, true);
            $scope.calculateTotalAmount = function() {
                $scope.TotalAmount = 0;
                for (var idx in $scope.details) {
                    $scope.TotalAmount += parseFloat($scope.details[idx].EstimationAmount || 0);
                }
            };

            function loadData() {
                $scope.getItem();
                $scope.getDetails();
            }
            //Print
            $scope.print = function () {
                var inputData = {
                    Id: $scope.currentcontext.id
                };
                var options = {
                    action: 'BillingMaster/PatientEstimation/PrintPatientEstimation',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            };
            $scope.print2 = function () {
                var inputData = {
                    Id: $scope.currentcontext.id
                };
                var options = {
                    action: 'BillingMaster/PatientEstimation/PrintPatientEstimationwithoutheader',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            };
            $scope.applyVisibilityRules = function() {
                if (!$scope.currentcontext.id || $scope.currentcontext.id <= 0) {
                    $scope.canprintBtn = false;
    
                }
                // for save
                if ($scope.item.SaveTypeId == 1) {
                    $scope.canprintBtn = true;
    
                }
                // for approve
                if ($scope.item.SaveTypeId == 2) {
                    $scope.canprintBtn = true;
                }
            }
    
            if ($scope.currentcontext.id <= 0)
                $scope.applyVisibilityRules();
            vm.servicegroupratemappingconfig = {
                query: '',
                searchbyid: false,
                options: [
                    {
                        header: 'Service name',
                        field: 'ServiceGroup',
                        datatype: 'string',
                        headercls: 'td-code',
                        fieldcls: 'td-code'
                    },
                    {
                        header: 'BedType',
                        field: 'BedTypes',
                        datatype: 'string',
                        headercls: 'td-name',
                        fieldcls: 'td-name'
                    },
                    {
                        header: 'Rate',
                        field: 'Rate',
                        datatype: 'string',
                        headercls: 'td-rate',
                        fieldcls: 'td-rate'
                    },
                    // {
                    //     header: 'BedType',
                    //     field: 'BedTypeId',
                    //     datatype: 'string',
                    //     headercls: 'td-name',
                    //     fieldcls: 'td-name'
                    // }
                ],
                searchparams: {},
                result: {},
                api: 'BillingMaster/ServiceGroupRateMapping/GetAllServiceGroupRateMapping',
                formatdisplay: formatselectedservicecategory,
                presearch: presearchservicecategory,
                postsearch: postsearchservicecategory
            };

            function formatselectedservicecategory() {
                var selectedItem = vm.servicegroupratemappingconfig.selected;
                var result = '';
                if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                    result = [selectedItem.ServiceGroup].join('    ');
                } else if (vm.servicegroupratemappingconfig.rowdata) {
                    result = [vm.servicegroupratemappingconfig.rowdata.ServiceGroup].join(' ');
                }
                return result;
            }
    

            function presearchservicecategory() {
                var query = vm.servicegroupratemappingconfig.query;

                //Search only active patients
                var inputData = {
                    Params: [],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                if (vm.servicegroupratemappingconfig.searchbyid == true) {
                    inputData.Params.push({
                        Key: 0,
                        Value: query
                    });
                } else if (query && query.length > 2) {
                    inputData.Params.push({
                        Key: 1,
                        Value: query
                    });
                }

                vm.servicegroupratemappingconfig.searchparams = inputData;
            }

            function postsearchservicecategory() {
                var selectedBedTypeId = $scope.item.BedTypeId;
                // $scope.autosearchpopup = 1;
                for (var idx in vm.servicegroupratemappingconfig.result) {
                    var item = vm.servicegroupratemappingconfig.result[idx];
                    item.ServiceGroup = item.ServiceGroup;
                    item.BedTypeId = item.BedTypeId;
                    item.BedTypes = item.BedType.Description;
                    item.Rate = item.Amount;
                }
                if (selectedBedTypeId) {
                    vm.servicegroupratemappingconfig.result = vm.servicegroupratemappingconfig.result.filter(function(item) {
                        return item.BedTypeId == selectedBedTypeId;
                    });
                } 
            }
            
            vm.doctorcontrolconfig = {
                query: '',
                searchbyid: false,
                options: [
                    {
                        header: 'Doctor Name',
                        field: 'DoctorName',
                        datatype: 'string',
                        headercls: 'td-name',
                        fieldcls: 'td-name'
                    },
                    {
                        header: 'Department',
                        field: 'Speciality',
                        datatype: 'string',
                        headercls: 'td-Department',
                        fieldcls: 'td-Department'
                    },
                ],
                searchparams: {},
                result: {},
                api: 'SystemSettings/User/GetMinUsers',
                formatdisplay: formatselecteddoctor,
                presearch: presearchdoctor,
                postsearch: postsearchdoctor
            };

            function formatselecteddoctor() {
                var selectedItem = vm.doctorcontrolconfig.selected;
                var result = '';
                if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                    result = [selectedItem.DoctorName].join('  ');
                    $scope.item.DepartmentId = selectedItem.DepartmentId;

                    if (selectedItem.Department) {
                        $scope.item.IsEmergencyPatient = selectedItem.Department.IsEmergency;
                        $scope.item.DepartmentName = selectedItem.UserDept.DepartmentName;
                    }
                } else if (vm.doctorcontrolconfig.rowdata) {
                    result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
                    vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.UserDept.DepartmentName, vm.doctorcontrolconfig.rowdata.Speciality
                    ].join(' ');
                }
                $scope.item.DoctorName = result;
                return result;
            }

            function presearchdoctor() {
                var query = vm.doctorcontrolconfig.query;
                var inputData = {
                    Params: [{
                        Key: 3,
                        Value: 2
                    },
                    {
                        Key: 5,
                        Value: 2
                    },
                    {
                        Key: 2,
                        Value: utl.Session.getCurrentFacilityId()
                    }
                    ],
                    PageContext: {
                        PageSize: 25,
                        PageNumber: 1
                    }
                };

                if (vm.doctorcontrolconfig.searchbyid == true) {
                    inputData.Params.push({
                        Key: 0,
                        Value: query
                    });
                } else if (query && query.length > 2) {
                    inputData.Params.push({
                        Key: 1,
                        Value: query
                    });
                }

                vm.doctorcontrolconfig.searchparams = inputData;
            }

            function postsearchdoctor() {
                for (var idx in vm.doctorcontrolconfig.result) {
                    var item = vm.doctorcontrolconfig.result[idx];
                    item.DoctorId = item.Id;
                    if (item.Title)
                        item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                    item.Qualification = item.Qualification;
                    if (item.Department)
                        item.Speciality = item.Department.DepartmentName;
                }
            }

            $scope.getPatientInfo = function (scope, data, options, hasError) {
                $scope.selectedPatient = data;
                $scope.item.PatientName = $scope.selectedPatient.FirstName;
                $scope.item.PatientId = $scope.selectedPatient.Id;
                $scope.item.Age = $scope.selectedPatient.Age;
                $scope.item.GenderId = $scope.selectedPatient.GenderId;
                $scope.item.PatientMrn = $scope.selectedPatient.MRN;
                $scope.item.PatientTypeId = $scope.selectedPatient.PatientTypeId;
                $scope.item.GuarantorId = $scope.selectedPatient.GuarantorId;
                $scope.item.DoctorId = $scope.selectedPatient.Encounters[0].DoctorId;
            };

            $scope.patientChange = function () {
                if ($scope.item.PatientId > 0) {
                    var options = {
                        action: 'registration/patient/GetPatientById',
                        data: {
                            Id: $scope.item.PatientId
                        },
                        type: 'post',
                        onComplete: $scope.getPatientInfo
                    };
                    utl.Http.doAction(options);
                }
            };
            $scope.numberonly = function (e) {
                if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                    return;
                } else
                    e.preventDefault();
            };

            // lookup
            $scope.lookupCallback = function (scope, data, options, hasError) {
                $scope.lookup = hasError ? {} : data;
                loadData();
                
            }
            $scope.initLookup = function () {
                var inputData = [
                    {
                        "Key": "GuardianType"
                    },
                    {
                        "Key": "BedType"
                    },
                    {
                        "Key": "GuarantorType"
                    },
                    {
                        "Key": "EstimationInclusion"
                    },
                    {
                        "Key": "EstimationExclusion"
                    }
                ]
                var options = {
                    action: 'General/Options/getoptions',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.lookupCallback
                };
                utl.Http.doAction(options);
            }
            $scope.initLookup();
            // lookup finish
        }

        estimationbillingFormController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

    })();