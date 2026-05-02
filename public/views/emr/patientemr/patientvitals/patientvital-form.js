(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientVitalFormController', patientVitalFormController);

    function patientVitalFormController($scope, $interval, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, uibButtonConfig, $filter) {
        var vm = this;

        uibButtonConfig.activeClass = "opt-selected";
        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({
            $scope: $scope
        }));

        $scope.item = {
            PatientVitalStatusId: 1,
            PerformedDate: utl.Formatter.getCurrentDate(),
            PerformedBy: utl.Session.getCurrentUserId(),
            VitalValue: '',
            EncounterId: utl.Session.getEncounterId()
        };
        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        $scope.LastVitals = [];

        if (utl.Session.getUserTypeId() == 2) // 2=> Physician
        {
            $scope.item.PerformedBy = utl.Session.getCurrentUserId();
        }

        $scope.vitals = [];
        $scope.panelvitals = [];
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
            vitalid: -1,
            panelmasterid: -1,
            selectedPanel: {},
            selectedVital: {},
            selectedMenu: 'form'
        };
        if ($stateParams.pid)
            $scope.currentcontext.pid = $stateParams.pid;
        else
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());

        if ($stateParams.gid) {
            $scope.currentcontext.gid = parseInt($stateParams.gid);
        }
        if ($scope.currentcontext.ismodal) {
            $scope.currentcontext.gid = modalConfig.params.gid;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter) {
            $scope.item.PatientId = $scope.currentcontext.encounter.PatientId;
            $scope.item.DoctorId = $scope.currentcontext.encounter.DoctorId;
            $scope.item.DoctorName = $scope.currentcontext.encounter.DoctorName;
            $scope.item.OrderFromId = $scope.currentcontext.encounter.DepartmentId;
            $scope.item.DepartmentId = $scope.currentcontext.encounter.DepartmentId;
            $scope.currentcontext.userDepartmentId = $scope.currentcontext.encounter.DepartmentId;
            $scope.item.OrderToId = 8;
            $scope.item.ServiceRateCategoryId = $scope.currentcontext.encounter.ServiceRateCategoryId;
            if ($scope.currentcontext.encounter.EncounterTypeId == 2) {
                $scope.item.ServiceRateCategoryId = $scope.currentcontext.encounter.ServiceRateCategoryId;
            }
            $scope.item.EncounterId = $scope.currentcontext.encounter.Id;
            $scope.item.GuarantorId = $scope.currentcontext.encounter.GuarantorId;
            $scope.item.PatientGuarantorId = $scope.currentcontext.encounter.PatientGuarantorId;
            $scope.item.EncounterTypeId = $scope.currentcontext.encounter.EncounterTypeId;
            $scope.item.AppointmentId = $scope.currentcontext.encounter.AppointmentId;
            if ($scope.currentcontext.encounter.EncounterStatusId == 1) {
                $scope.EncounterStatus = 'CheckedIn'
            }
            if ($scope.currentcontext.encounter.EncounterStatusId == 2) {
                $scope.EncounterStatus = 'CheckedOut'
            }
        }

        $scope.changeperformeddate = function () {
            for (var idx in $scope.vitals)
                $scope.vitals[idx].PerformedDate = $scope.item.PerformedDate;
        };

        $scope.changeperformedby = function () {
            for (var idx in $scope.vitals)
                $scope.vitals[idx].PerformedBy = $scope.item.PerformedBy;
        };

        $scope.panelChange = function (item) {
            $scope.currentcontext.selectedPanel = item;
        };

        $scope.vitalChange = function (item) {
            $scope.currentcontext.selectedVital = item;
        };


        // if (modalConfig.params.EncounterType) {
        //     $scope.item.EncounterTypeId = modalConfig.params.EncounterType;
        // } else {
        //     $scope.item.EncounterTypeId = $scope.currentcontext.encounter.EncounterTypeId;
        // }

        $scope.addvital = function (vital) {
            if ($scope.checkExisting(vital)) {
                var item = {
                    SNo: 0,
                    PatientId: $scope.currentcontext.pid,
                    VitalId: vital.Id,
                    Description: vital.Description,
                    DisplayOrder: vital.DisplayOrder,
                    VitalName: vital.VitalName,
                    VitalValue: $scope.item.VitalValue,
                    VitalValue1: '',
                    VitalValue2: '',
                    VitalValueTypeId: vital.VitalValueTypeId,
                    UOM: vital.UOM,
                    LoincCode: vital.LoincCode,
                    Mnemonic: vital.Mnemonic,
                    GraphTypeId: vital.GraphTypeId,
                    ValueFormat: vital.ValueFormat,
                    ReferenceRangeFrom: vital.ReferenceRangeFrom,
                    ReferenceRangeTo: vital.ReferenceRangeTo,
                    EncounterId: $scope.item.EncounterId,
                    ConsultationId: $scope.item.ConsultationId,
                    PerformedDate: $scope.item.PerformedDate,
                    PerformedBy: $scope.item.PerformedBy,
                    PatientVitalStatusId: 1,
                    Status: 1,
                    EncounterTypeId: $scope.item.EncounterTypeId
                };
                $scope.vitals.push(item);
                $scope.vitals.sort($scope.custom_sort);
                checkForBMI(vital);
                $scope.setIndexforTableIndex();
            }
        }


        $scope.custom_sort = function (a, b) {
            if (b.DisplayOrder && a.DisplayOrder)
                return a.DisplayOrder - b.DisplayOrder;
            else
                return 0;
        }

        $scope.setIndexforTableIndex = function () {
            var SNo = 1;
            for (var idx in $scope.vitals) {
                if ($scope.vitals[idx].Status == 1) {
                    $scope.vitals[idx].SNo = SNo;
                    $scope.vitals[idx].itemidxdesc = 'desc' + (SNo - 1);
                    SNo++;
                }
            }
        };
        $scope.addvitalClick = function () {
            var vital = $scope.currentcontext.selectedVital;
            if ($scope.currentcontext.selectedVital.VitalName)
                $scope.addvital(vital);
        }

        $scope.addpanelClick = function () {
            var panelMasterDetails = $scope.currentcontext.selectedPanel.PanelMasterDetails;
            for (var idx in panelMasterDetails) {
                var vital = utl.Lookup.getObject($scope.lookup.Vital, panelMasterDetails[idx].ItemId);
                $scope.addvital(vital);
            }
        }

        $scope.checkExisting = function (vital) {
            for (var idx in $scope.vitals) {
                if (vital.Id == $scope.vitals[idx].VitalId)
                    return false;
            }
            return true
        }

        function checkForBMI(vital) {
            if (vital.Description.toLowerCase() == 'height') {
                var hasWeight = _.findIndex($scope.vitals, {
                    VitalId: 2
                });
                var hasBMI = _.findIndex($scope.vitals, {
                    VitalId: 5
                });
                if ((hasWeight > -1) && (hasBMI == -1)) {
                    addBMI();
                }
            }

            if (vital.Description.toLowerCase() == 'weight') {
                var hasHeight = _.findIndex($scope.vitals, {
                    VitalId: 1
                });
                var hasBMI = _.findIndex($scope.vitals, {
                    VitalId: 5
                });
                if ((hasHeight > -1) && (hasBMI == -1)) {
                    addBMI();
                }
            }
        }

        $scope.IsBMI = function (item) {
            if (item.Description.toLowerCase() == 'bmi')
                return true;
            return false;
        }
        $scope.IsHeight = function (item) {
            if (item.Description.toLowerCase() == 'height')
                return true;
            return false;
        }
        $scope.IsBP = function (item) {
            if (item.Description.toLowerCase() == 'blood pressure')
                return true;
            return false;
        }

        $scope.CalculateBMI = function () {
            var bmiValues = {
                height: 0,
                weight: 0
            }
            var bmi = {};
            for (var idx in $scope.vitals) {
                var vital = $scope.vitals[idx];
                switch (vital.VitalId) {
                    case 1:
                        bmiValues.height = vital.VitalValue / 100;
                        break;
                    case 2:
                        bmiValues.weight = vital.VitalValue;
                        break;
                    case 5:
                        bmi = vital;
                        break;
                    default:
                        break;
                }
                if (bmiValues.height && bmiValues.weight) {
                    bmi.VitalValue = (math.eval("(weight/(height * height))", bmiValues)).toFixed(2);
                }
                computeQualifier(vital);
            }
        }

        function addBMI() {
            var bmiObj = utl.Lookup.getObjectByText($scope.lookup.Vital, 'BMI');
            var item = {
                PatientId: $scope.currentcontext.pid,
                VitalId: bmiObj.Id,
                Description: bmiObj.Description,
                VitalName: bmiObj.VitalName,
                VitalValue: $scope.item.VitalValue,
                VitalValue1: '',
                VitalValue2: '',
                VitalValueTypeId: bmiObj.VitalValueTypeId,
                UOM: bmiObj.UOM,
                LoincCode: bmiObj.LoincCode,
                Mnemonic: bmiObj.Mnemonic,
                GraphTypeId: bmiObj.GraphTypeId,
                ValueFormat: bmiObj.ValueFormat,
                ReferenceRangeFrom: bmiObj.ReferenceRangeFrom,
                ReferenceRangeTo: bmiObj.ReferenceRangeTo,
                PerformedDate: $scope.item.PerformedDate,
                PerformedBy: $scope.item.PerformedBy,
                PatientVitalStatusId: 1,
                Status: 1,
                EncounterTypeId: $scope.item.EncounterTypeId
            };
            $scope.vitals.push(item);
        };

        $scope.getPanelsCallback = function (scope, res, options, hasError) {
            if (!res || !res.Data || res.Data.length == 0) {
                getPanelsByAdmin();
            } else {
                afterGet(res);
            }
        };

        $scope.previous_vitals = function () {
            utl.Modal.open('patientemr.previousvitals', {
                params: {
                    pid: $scope.currentcontext.pid
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.getPanels = function () {
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 5
                },
                    // {
                    //     Key: 5,
                    //     Value: utl.Session.getCurrentUserId()
                    // }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'clinicalmaster/TemplateMaster/GetTemplateMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPanelsCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getPanelsByAdminCallback = function (scope, res, options, hasError) {
            afterGet(res);
        };

        function getPanelsByAdmin() {
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 5
                },
                {
                    Key: 6,
                    Value: true
                } //AdminFav - true
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'clinicalmaster/TemplateMaster/GetTemplateMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPanelsByAdminCallback
            };
            utl.Http.doAction(options);
        };

        function afterGet(res) {
            for (var idx in res.Data) {
                var panel = res.Data[idx];
                var item = {
                    Id: panel.Id,
                    Text: panel.Name,
                    PanelMasterDetails: panel.TemplateMasterDetails
                };
                $scope.panelvitals.push(item);
            }
            $scope.lookup.PanelMaster = $scope.panelvitals;
            //Set first value as default
            if ($scope.panelvitals.length > 0) {
                $scope.currentcontext.panelmasterid = $scope.panelvitals[0].Id;
                $scope.currentcontext.selectedPanel = $scope.panelvitals[0];
                $scope.addpanelClick();
            }
        }
        $scope.onDeleteConfirmed = function (indx) {
            $scope.vitals.splice(indx, 1);
        }
        $scope.deleteVital = function (indx) {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed);

        }
        $scope.addNew = function () {
            $scope.vitals = [];
            $scope.getPanels();
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                var groupedData = _.groupBy(res.Data, 'GroupId');
                // for (var idx in groupedData) {
                //     var vitalData = groupedData[idx];
                // }
                for (var idx in groupedData) {
                    var vital = groupedData[idx];
                    for (var vx in vital) {
                        var vitaldata = vital[vx];
                        vital[vx].PerformedDate = utl.Formatter.getDateTimeString(vital[vx].PerformedDate);
                        if (vital[vx].PerformedDate) {
                            $scope.item.PerformedDate = vital[vx].PerformedDate;
                        }
                        switch (vitaldata.VitalId) {
                            case 1: //height
                                if (vitaldata.VitalValue.includes("~")) {
                                    var vitalvalues = vitaldata.VitalValue.split("~");
                                    vital[vx].VitalValue = vitalvalues[0] + "'" + vitalvalues[1] + "\"";
                                }
                                break;
                            case 8: //BP
                                if (vitaldata.VitalValue.includes("~")) {
                                    var vitalvalues = vitaldata.VitalValue.split("~");
                                    vital[vx].VitalValue1 = vitalvalues[0];
                                    vital[vx].VitalValue2 = vitalvalues[1];
                                }
                                break;
                            default:
                                break;
                        }
                    }
                }
                $scope.vitals = vital;
                $scope.setIndexforTableIndex();
            };
            if (res.Data.length == 0) {
                $scope.getPanels();
            }
        };

        $scope.getList = function () {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentcontext.pid
                },
                {
                    Key: 9,
                    Value: $scope.currentcontext.eid
                },
                ],
            };

            var options = {
                action: 'emr/patientvital/GetPatientVitals',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getvitalgroupCallback = function (scope, res, options, hasError) {
            $scope.vitals = res.Data;
        };

        $scope.getvitalgroup = function () {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentcontext.pid
                },
                {
                    Key: 9,
                    Value: $scope.currentcontext.eid
                },
                {
                    Key: 11,
                    Value: $scope.currentcontext.gid
                },
                ],
            };

            var options = {
                action: 'emr/patientvital/GetPatientVitals',
                data: inputData,
                type: 'post',
                onComplete: $scope.getvitalgroupCallback
            };

            utl.Http.doAction(options);
        };

        // $scope.getItemCallback = function (scope, data, options, hasError) {
        //     $scope.item = data;
        // };

        // $scope.getItem = function (pageNo) {
        //     if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

        //         var options = {
        //             action: 'emr/patientvital/GetPatientVitalById',
        //             data: {
        //                 Id: $scope.currentcontext.id
        //             },
        //             type: 'post',
        //             onComplete: $scope.getItemCallback
        //         };
        //         utl.Http.doAction(options);
        //     } else {
        //         $scope.setFocusTitle();
        //     }
        // };

        $scope.setFocusTitle = function () {
            if ($scope.currentcontext.id <= 0) {
                $scope.startinterval = $interval(function () {
                    $scope.callTitleFocus();
                }, 1000);
            }
        }
        $scope.callTitleFocus = function () {
            if ($scope.currentcontext.id <= 0) {
                console.log("test print by ");
                var uiSelect = angular.element(document.getElementById('vitalname'));
                var uichild = uiSelect.controller('uiSelect');
                uichild.focusser[0].focus();
                uichild.activate();
            }
            $interval.cancel($scope.startinterval);
        }
        // $scope.backToList = function () {
        //     if ($scope.currentcontext.ismodal) {
        //         $scope.confirmCallback();
        //     } else {
        //         $state.go('patientemr.patientvitals', {
        //             pid: $scope.currentcontext.pid
        //         });
        //     }
        // }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            } else {
                $scope.getList();
            }
        };

        $scope.saveItem = function () {

            $scope.vitals1 = [];
            for (var idx in $scope.vitals) {
                if ($scope.vitals[idx].VitalValue || $scope.vitals[idx].VitalValue1 || $scope.vitals[idx].VitalValue2) {
                    $scope.vitals1.push($scope.vitals[idx]);
                }
            }

            if ($scope.vitals1.length > 0) {
                // if (checkMandatoryFields()) {
                var options = {
                    action: 'emr/patientvital/ManagePatientVitals',
                    data: {
                        Data: $scope.vitals1
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
                // }
            }

            function checkMandatoryFields() {
                var activeRecords = $filter('filterArrayItems')($scope.vitals, [{
                    search: 1,
                    fields: ['Status']
                }]);
                for (var idx in activeRecords) {
                    var item = activeRecords[idx];
                    if (item.Description.toLowerCase() == 'blood pressure') {
                        // if (item.Description == 'BLOOD PRESSURE') {
                        if (!item.VitalValue1 && !item.VitalValue2) {
                            utl.Alert.showErrorMsg($translate.instant('patientemr.patientvital-form.enterbp.lbl'));
                            return false;
                        }
                    }
                    // if (item.Description == 'BODY TEMPERATURE') {
                    if (item.Description.toLowerCase() == 'body temperature') {
                        if (!item.VitalValue && !item.VitalValue1 && !item.VitalValue2) {
                            utl.Alert.showErrorMsg($translate.instant('patientemr.patientvital-form.enterbodytemp.lbl'));
                            return false;
                        }
                    }
                    // if (item.Description == 'PULSE RATE') {
                    if (item.Description.toLowerCase() == 'pulse rate') {
                        if (!item.VitalValue && !item.VitalValue1 && !item.VitalValue2) {
                            utl.Alert.showErrorMsg($translate.instant('patientemr.patientvital-form.enterpulse.lbl'));
                            return false;
                        }
                    }
                }
                return true;
            }
        };

        $scope.saveVitals = function () {
            for (var idx in $scope.vitals) {
                var vital = $scope.vitals[idx];
                vital.EncounterId = $scope.item.EncounterId
                vital.ConsultationId = $scope.item.ConsultationId;
                switch (vital.VitalId) {
                    // case 1:
                    //     $scope.vitals[idx].VitalValue = vital.VitalValue1 + "~" + vital.VitalValue2;
                    //     break;
                    case 8:
                        $scope.vitals[idx].VitalValue = vital.VitalValue1 + "~" + vital.VitalValue2;
                        break;
                    default:
                        break;
                }
            }
            $scope.saveItem();
        }

        function computeQualifier(item) {
            if (item.VitalId == 1 && item.VitalValue1) {
                item.VitalValue = (item.VitalValue1 * 1); // (item.VitalValue1 * 30.48) + (item.VitalValue2 * 2.54);
                if (item.VitalValue >= item.ReferenceRangeFrom && item.VitalValue <= item.ReferenceRangeTo) {
                    if (item.VitalQualifierId = 1) {
                        item.VitalQualifierId = 1; //Normal
                        item.VitalQualifierNormal = 'Normal';
                    }
                } else if (item.VitalValue < item.ReferenceRangeFrom) {
                    if (item.VitalQualifierId = 2) {
                        item.VitalQualifierId = 2; //Below low normal
                        item.VitalQualifierbelownormal = 'Low Upnormal';
                    }
                } else if (item.VitalValue > item.ReferenceRangeTo) {
                    if (item.VitalQualifierId = 3) {
                        item.VitalQualifierId = 3; //Above high normal
                        item.VitalQualifierhighnormal = 'High Upnormal';
                    }
                }
            } else if (item.VitalId == 8 && item.VitalValue1) { // BP
                item.VitalValue1 = (item.VitalValue1 * 1);
                if (item.VitalValue1 >= item.ReferenceRangeFrom && item.VitalValue1 <= item.ReferenceRangeTo) {
                    if (item.VitalQualifierId = 1) {
                        item.VitalQualifierId = 1; //Normal
                        item.VitalQualifierNormal = 'Normal';
                    }
                } else if (item.VitalValue1 < item.ReferenceRangeTo) {
                    if (item.VitalQualifierId = 2) {
                        item.VitalQualifierId = 2; //Below low normal
                        item.VitalQualifierbelownormal = 'Low Upnormal';
                    }
                } else if (item.VitalValue1 > item.ReferenceRangeFrom) {
                    if (item.VitalQualifierId = 3) {
                        item.VitalQualifierId = 3; //Above high normal
                        item.VitalQualifierhighnormal = 'High Upnormal';
                    }
                }
            } else {
                var vitalValueTemp = parseFloat(item.VitalValue);

                if (vitalValueTemp >= item.ReferenceRangeFrom && vitalValueTemp <= item.ReferenceRangeTo) {
                    if (item.VitalQualifierId = 1) {
                        item.VitalQualifierId = 1; //Normal
                        item.VitalQualifierNormal = 'Normal';
                    }
                } else if (vitalValueTemp < item.ReferenceRangeFrom) {
                    if (item.VitalQualifierId = 2) {
                        item.VitalQualifierId = 2; //Below low normal
                        item.VitalQualifierbelownormal = 'Low Upnormal';
                    }
                } else if (vitalValueTemp > item.ReferenceRangeTo) {
                    if (item.VitalQualifierId = 3) {
                        item.VitalQualifierId = 3; //Above high normal
                        item.VitalQualifierhighnormal = 'High Upnormal';
                    }
                } else if (item.VitalValue == '') {
                    item.VitalQualifierNormal = '';
                    item.VitalQualifierbelownormal = '';
                    item.VitalQualifierhighnormal = '';
                }
            }

            // item.VitalQualifier = utl.Lookup.getDesc($scope.lookup.VitalQualifier, item.VitalQualifierId);
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
            if ($scope.currentcontext.gid > 0) {
                $scope.getvitalgroup();
            }
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Vital"
            },
            // {
            //     "Key": "User"
            // },
            {
                "Key": "PatientVitalStatus"
            },
            {
                "Key": "VitalQualifier"
            }
            ];

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

    patientVitalFormController.$inject = ['$scope', '$interval', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', 'uibButtonConfig', '$filter'];

})();