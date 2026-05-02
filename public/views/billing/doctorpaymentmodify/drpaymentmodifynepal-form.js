(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('drpaymentmodifynepalformController', drpaymentmodifynepalformController);

    function drpaymentmodifynepalformController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};

        if (modalConfig && modalConfig.params) {
            if (modalConfig.params.patientbill) {
                $scope.item.patientbill = modalConfig.params.patientbill;
                $scope.item.Id = $scope.item.patientbill.Id;
                $scope.item.DoctorId = $scope.item.patientbill.DoctorId;
                $scope.item.oldDrName = $scope.item.patientbill.DoctorName;
                $scope.item.DoctorName = $scope.item.patientbill.DoctorName;
                // $scope.item.NetAmount = $scope.item.patientbill.NetAmount;
                // $scope.item.DoctorShare = $scope.item.patientbill.DoctorShare;
                // $scope.item.Remarks = $scope.item.patientbill.Remarks;
            }
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.getItemCallback = function (scope, res, options, hasError) {
            $scope.PatientDoctorShareDetails = res.Data;
            // $scope.item.PatientName = $scope.item.Patient.FirstName;
            // $scope.item.Age = $scope.item.Patient.Age;
            // $scope.item.Gender = $scope.item.Patient.Gender.Description;
            // $scope.getList();
            getDocLookup();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.item.Id && $scope.item.Id > 0) {
                var inputData = {
                    Params: [{
                        Key: 10,
                        Value: $scope.item.Id
                    },],
                };
                var options = {
                    action: 'Billing/PatientDoctorShareDetails/GetPatientDoctorShareDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.getDocLookupCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var GroupedBatchData = _.groupBy(data.Data, 'TeamId');
                for (var cdx in GroupedBatchData) {
                    var performDr = GroupedBatchData[cdx];
                    var DrShare = {
                        Team: '',
                        IsLoadAllDocs: false,
                        DrLookup: []
                    }
                    for (var jdx in performDr) {
                        var DrTeamShare = performDr[jdx];
                        DrShare.Team = DrTeamShare.Team.Description;
                        DrShare.IsLoadAllDocs = DrTeamShare.IsDisplayAllDoctors;
                        DrShare.DrLookup.push(DrTeamShare);
                        // if (!DrTeamShare.IsDisplayAllDoctors) {
                        //     DrShare.DrLookup.push(DrTeamShare);
                        // } else {
                        //     DrShare.DrLookup = $scope.lookup.Doctor;
                        // }
                    }
                    $scope.TeamLookUp.push(DrShare);
                }
            }
        };

        $scope.getDocLookup = function () {
            var inputData = {
                Params: [{
                        Key: 5,
                        Value: $scope.item.ServiceId
                    },
                    {
                        Key: 6,
                        Value: $scope.RateTypeId
                    }
                ],
            };
            var options = {
                action: 'clinicalmaster/ServiceItemPerformingDoctor/GetServiceItemPerformingDoctors',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDocLookupCallback
            };
            utl.Http.doAction(options);
        }


        function getSelectionStart(o) {
            if (o.createTextRange) {
                var r = document.selection.createRange().duplicate()
                r.moveEnd('character', o.value.length)
                if (r.text == '') return o.value.length
                return o.value.lastIndexOf(r.text)
            } else return o.selectionStart
        }

        $scope.numberonly = function (e) {
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right, down, up
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                // Let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress && (e.keyCode < 96 || e.keyCode > 105)
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))) {
                e.preventDefault();
            }
        };

        $scope.DrShareValidation = function () {
            var oldDrshare = $scope.item.patientbill.DoctorShare;
            var NetAmount = $scope.item.patientbill.NetAmount;
            var DrShare = $scope.item.DoctorShare;
            if (NetAmount > 0 && NetAmount != null && NetAmount != undefined &&
                NetAmount != NaN && NetAmount != '') {
                try {
                    var dNetAmount = parseFloat(NetAmount);
                    var dDrShare = parseFloat(DrShare);
                    if (dDrShare > dNetAmount) {
                        utl.Alert.showErrorMsg('Dr. Share Amount should not greater than Amount');
                        $scope.item.DoctorShare = oldDrshare;
                    }
                } catch (ex) {
                    utl.Alert.showErrorMsg('Dr. Share Amount should not correct format');
                    $scope.item.DoctorShare = oldDrshare;
                }
            }
        }

        function onDoctorSelected(idx,SelectedItem) {
            $scope.PatientDoctorShareDetails[idx].DoctorName = SelectedItem.DoctorName;
        }
        function getLinesForSave() {
            var result = [];
            var lastIndex = $scope.PatientDoctorShareDetails.length - 1;

            for (var idx in $scope.PatientDoctorShareDetails) {
                var item = $scope.PatientDoctorShareDetails[idx];
                if (item.DoctorName && item.DoctorName != '') {
                    var items={};
                    items.DoctorId = item.DoctorId;
                    items.Id = item.Id;
                    items.DoctorName = item.DoctorName;
                    items.DoctorShareAmount = item.DoctorShareAmount;
                    // item.DoctorName = item.  
                    result.push(items);
                }
            }
            return result;
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            $scope.confirmCallback();
        };

        $scope.saveitem = function () {
            if ($scope.item.Id && $scope.item.DoctorId && $scope.item.DoctorName
               ) {
                    var lines = getLinesForSave();
                var options = {
                    action: 'billing/PatientDoctorShareDetails/ManagePatientDoctorShareDetailsUpdate',
                    data: {
                        Data: lines
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            } else {
                utl.Alert.showErrorMsg('Change Dr. and Share information is required');
            }
        };

        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Doctor Id', field: 'DoctorId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Doctor Name', field: 'DoctorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Qualification', field: 'Qualification', datatype: 'string', headercls: 'td-Qualification', fieldcls: 'td-Qualification' },
                { header: 'Speciality', field: 'Speciality', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
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
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
                vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            $scope.item.ScheduleApptId = null;
            $scope.item.ScheduleApptTime = null;
            $scope.item.IsCheckedInAppt = false;
            $scope.item.DoctorName = result;
            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [
                    { Key: 3, Value: 2 },
                    { Key: 5, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.doctorcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.doctorcontrolconfig.searchparams = inputData;
        }

        function postsearchdoctor() {
            for (var idx in vm.doctorcontrolconfig.result) {
                var item = vm.doctorcontrolconfig.result[idx];
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "BillType" },
                { "Key": "Referral" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                
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

       


    }

    drpaymentmodifynepalformController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();