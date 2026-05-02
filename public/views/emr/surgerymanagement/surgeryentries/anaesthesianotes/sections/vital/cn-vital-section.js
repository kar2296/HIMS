(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('cnVitalSectionController', cnVitalSectionController);

    function cnVitalSectionController($scope, $interval, $stateParams, $state, $translate, utl, uibButtonConfig) {
        var vm = this;

        uibButtonConfig.activeClass = "opt-selected";

        $scope.item = {
            PatientVitalStatusId: 1,
            PerformedDate: utl.Formatter.getCurrentDate(),
            PerformedBy: utl.Session.getCurrentUserId(),
            VitalValue: '',
            EncounterId: utl.Session.getEncounterId()
        };


        if (utl.Session.getUserTypeId() == 2) // 2=> Physician
        {
            $scope.item.PerformedBy = utl.Session.getCurrentUserId();
        }

        $scope.vitals = [];
        $scope.panelvitals = [];
        $scope.currentcontext = {
            vitalid: -1,
            panelmasterid: -1,
            selectedPanel: {},
            selectedVital: {},
            selectedMenu: 'form',
            growthchartselected: 'headcircum'
        };

        $scope.currentcontext.ConsultationId = $scope.$parent.cncontext.consultationid;
        $scope.item.ConsultationId = $scope.$parent.cncontext.consultationid;


        //$scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter) {
            $scope.item.EncounterId = $scope.currentcontext.encounter.Id;
            $scope.item.EncounterTypeId = $scope.currentcontext.encounter.EncounterTypeId;
        }

        $scope.currentcontext.otregid = $scope.$parent.currentcontext.id;
        $scope.currentcontext.pid = $scope.$parent.currentcontext.pid;
        $scope.currentcontext.eid = $scope.$parent.currentcontext.eid;
        $scope.item.EncounterId = $scope.$parent.currentcontext.eid;

        $scope.item.PatientId = $scope.currentcontext.pid;

        $scope.topmenus = [
            { key: 'form', name: $translate.instant('patientemr.patientvital-form.form-menu.lbl') },
            { key: 'chart', name: $translate.instant('patientemr.patientvital-form.chart-menu.lbl') }
        ];

        $scope.chartview = function () {
            utl.Modal.open('patientemr.patientvitals', {
                params: { id: 0, pid: $scope.currentcontext.pid, context: 'chart' },
                confirmCallback: $scope.getList
            }
            );
        }

        $scope.listView = function () {
            utl.Modal.open('patientemr.patientvitals', {
                params: { id: 0, pid: $scope.currentcontext.pid, context: 'list' },
                confirmCallback: $scope.getList
            }
            );
        }

        //Visibility Rules starts

        $scope.canShowFormArea = function () {
            return $scope.currentcontext.selectedMenu == 'form';
        }

        $scope.canShowChartArea = function () {
            return $scope.currentcontext.selectedMenu == 'chart';
        }
        $scope.showGrowthChart = function () {
            var patientAge = utl.Formatter.getAgeFromDOB(utl.Session.getPatientDOB());
            if (patientAge >= 5) {
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'patientemr.patientvital-list.growthchart-confirmmsg.lbl',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: openGrowthChart,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            } else {
                openGrowthChart();
            }
        }

        function openGrowthChart() {
            //$scope.currentcontext.view = "growthchart";
            utl.Modal.open('patientemr.growthchartmodal', {
                params: { id: 0 }, confirmCallback: $scope.initLookup
            });
        }
        //Visibility Rules ends
        /*
        //growth chart code starts
        $scope.growthcharttabs = [
            {
                key: 'headcircum', name: $translate.instant('patientemr.patientvital-list.growth-headcircum.lbl'),
                xaxislbl: 'Age (in months)', yaxislbl: 'Head circumference'
            },
            {
                key: 'bmi', name: $translate.instant('patientemr.patientvital-list.growth-bmi.lbl'),
                xaxislbl: 'Age (in months)', yaxislbl: 'BMI'
            },
            {
                key: 'height', name: $translate.instant('patientemr.patientvital-list.growth-height.lbl'),
                xaxislbl: 'Age (in months)', yaxislbl: 'Height'
            },
            {
                key: 'weight', name: $translate.instant('patientemr.patientvital-list.growth-weight.lbl'),
                xaxislbl: 'Age (in months)', yaxislbl: 'Weight'
            }
        ];

        $scope.growthchartconfig = {
            patientid: $scope.currentcontext.pid,
            gender: utl.Session.getPatientGender(),
            patientdob: utl.Session.getPatientDOB(),
            vital: $scope.growthcharttabs[0].key,
            xaxislbl: $scope.growthcharttabs[0].xaxislbl,
            yaxislbl: $scope.growthcharttabs[0].yaxislbl
        };

        $scope.growhtchartChange = function (item) {
            $scope.growthchartconfig = {
                patientid: $scope.currentcontext.pid,
                gender: utl.Session.getPatientGender(),
                patientdob: utl.Session.getPatientDOB(),
                vital: item.key,
                xaxislbl: item.xaxislbl,
                yaxislbl: item.yaxislbl
            };
        }
        //growth chart code ends
        */
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

        $scope.getItemCallback = function (scope, res, options, hasError) {
            if(res.Data && res.Data.length > 0) {
                $scope.vitals = res.Data;
                computeVitalValues();
            } else {
                $scope.addpanelClick();
            }
        };

        function computeVitalValues() {
            for (var idx in $scope.vitals) {
                var vital = $scope.vitals[idx];
                switch (vital.VitalId) {
                    case 8:
                        var vitalValArr = vital.VitalValue.split("~");
                        vital.VitalValue1 = vitalValArr[0];
                        vital.VitalValue2 = vitalValArr[1];
                        break;
                    default:
                        break;
                }
            }
        }

        $scope.addvital = function (vital) {
            if ($scope.checkExisting(vital)) {
                var item = {
                    PatientId: $scope.currentcontext.pid,
                    VitalId: vital.Id,
                    Description: vital.Description,
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
                    EncounterTypeId: $scope.currentcontext.encounter.EncounterTypeId
                };
                $scope.vitals.push(item);
                checkForBMI(vital);
            }
        }
        $scope.addvitalClick = function () {
            var vital = $scope.currentcontext.selectedVital;
            $scope.addvital(vital);
        }

        $scope.addpanelClick = function () {
            if($scope.currentcontext.selectedPanel && $scope.currentcontext.selectedPanel.PanelMasterDetails.length > 0) {
                var panelMasterDetails = $scope.currentcontext.selectedPanel.PanelMasterDetails;
                for (var idx in panelMasterDetails) {
                    var vital = utl.Lookup.getObject($scope.lookup.Vital, panelMasterDetails[idx].ItemId);
                    $scope.addvital(vital);
                }
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
                var hasWeight = _.findIndex($scope.vitals, { VitalId: 2 });
                var hasBMI = _.findIndex($scope.vitals, { VitalId: 5 });
                if ((hasWeight > -1) && (hasBMI == -1)) {
                    addBMI();
                }
            }

            if (vital.Description.toLowerCase() == 'weight') {
                var hasHeight = _.findIndex($scope.vitals, { VitalId: 1 });
                var hasBMI = _.findIndex($scope.vitals, { VitalId: 5 });
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
                        bmiValues.height = vital.VitalValue / 100; // converting to meter
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
                EncounterTypeId: $scope.currentcontext.encounter.EncounterTypeId
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

        $scope.getPanels = function () {
            var inputData = {
                Params: [
                    { Key: 3, Value: 3 },
                    { Key: 5, Value: utl.Session.getCurrentUserId() }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'clinicalmaster/PanelMaster/GetPanelMasters',
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
                Params: [
                    { Key: 3, Value: 3 },
                    { Key: 6, Value: true } //AdminFav - true
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'clinicalmaster/PanelMaster/GetPanelMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPanelsByAdminCallback
            };
            utl.Http.doAction(options);
        };

        function afterGet(res) {
            for (var idx in res.Data) {
                var panel = res.Data[idx];
                var item = { Id: panel.Id, Text: panel.Name, PanelMasterDetails: panel.PanelMasterDetails };
                $scope.panelvitals.push(item);
            }
            $scope.lookup.PanelMaster = $scope.panelvitals;
            //Set first value as default
            if ($scope.panelvitals.length > 0) {
                $scope.currentcontext.panelmasterid = $scope.panelvitals[0].Id;
                $scope.currentcontext.selectedPanel = $scope.panelvitals[0];
            }

            $scope.getItem();
        }
        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
        }
        $scope.deleteVital = function (item) {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, item.Description);
        }
        $scope.getItem = function (pageNo) {

            if($scope.currentcontext.ConsultationId > 0) {
                var inputData = {
                    Params: [
                        { Key: 10, Value: $scope.currentcontext.ConsultationId },
                    ]
                };

                var options = {
                    action: 'emr/patientvital/GetPatientVitals',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };

                utl.Http.doAction(options);
            } else {
                $scope.addpanelClick();
            }
        };

        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            } else {
                $state.go('patientemr.patientvitals', { pid: $scope.currentcontext.pid });
            }
        }
        $scope.backTovitallist = function () {

                $state.go('patientemr.consultations', { pid: $scope.currentcontext.pid });

        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getItem();
        };

        $scope.saveItem = function () {

            $scope.vitals1 = [];
            for (var idx in $scope.vitals) {
                if ($scope.vitals[idx].VitalValue) {
                    $scope.vitals1.push($scope.vitals[idx]);
                }
            }

            if ($scope.vitals1.length > 0) {
                var options = {
                    action: 'emr/patientvital/ManagePatientVitals',
                    data: { Data: $scope.vitals1 },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.saveVitals = function () {
            for (var idx in $scope.vitals) {
                var vital = $scope.vitals[idx];
                vital.EncounterId = $scope.item.EncounterId
                vital.ConsultationId = $scope.item.ConsultationId;
                switch (vital.VitalId) {
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
                    item.VitalQualifierId = 1; //Normal
                } else if (item.VitalValue < item.ReferenceRangeFrom) {
                    item.VitalQualifierId = 2; //Below low normal
                } else if (item.VitalValue > item.ReferenceRangeTo) {
                    item.VitalQualifierId = 3; //Above high normal
                }
            } else if (item.VitalId == 8 && item.VitalValue1) { // BP
                item.VitalValue1 = (item.VitalValue1 * 1);
                if (item.VitalValue1 >= item.ReferenceRangeTo && item.VitalValue1 <= item.ReferenceRangeFrom) {
                    item.VitalQualifierId = 1; //Normal
                } else if (item.VitalValue1 < item.ReferenceRangeTo) {
                    item.VitalQualifierId = 2; //Below low normal
                } else if (item.VitalValue1 > item.ReferenceRangeFrom) {
                    item.VitalQualifierId = 3; //Above high normal
                }
            } else {
                var vitalValueTemp = parseFloat(item.VitalValue);

                if (vitalValueTemp >= item.ReferenceRangeFrom && vitalValueTemp <= item.ReferenceRangeTo) {
                    item.VitalQualifierId = 1; //Normal
                } else if (vitalValueTemp < item.ReferenceRangeFrom) {
                    item.VitalQualifierId = 2; //Below low normal
                } else if (vitalValueTemp > item.ReferenceRangeTo) {
                    item.VitalQualifierId = 3; //Above high normal
                }
            }

            item.VitalQualifier = utl.Lookup.getDesc($scope.lookup.VitalQualifier, item.VitalQualifierId);
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getPanels();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Vital" },
                { "Key": "User" },
                { "Key": "PatientVitalStatus" },
                { "Key": "VitalQualifier" }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.fillMasterInfo = function (selectedItem) {
            $scope.item.VitalName = selectedItem.VitalName;
            $scope.item.UOM = selectedItem.UOM;
            $scope.item.GraphTypeId = selectedItem.GraphTypeId;
            $scope.item.VitalValueTypeId = selectedItem.VitalValueTypeId;
            $scope.item.LoincCode = selectedItem.LoincCode;
            $scope.item.Description = selectedItem.Description;
            $scope.item.ReferrenceLink = selectedItem.ReferrenceLink;
            $scope.item.ValueFormat = selectedItem.ValueFormat;
            $scope.item.ReferenceRangeFrom = selectedItem.ReferenceRangeFrom;
            $scope.item.ReferenceRangeTo = selectedItem.ReferenceRangeTo;
            $scope.item.Mnemonic = selectedItem.Mnemonic;
        }

        $scope.initLookup();
    }

    cnVitalSectionController.$inject = ['$scope', '$interval', '$stateParams', '$state', '$translate', 'utl', 'uibButtonConfig'];

})();