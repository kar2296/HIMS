(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('drpaymentmodifyformController', drpaymentmodifyformController);

    function drpaymentmodifyformController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};

        if (modalConfig && modalConfig.params) {
            if (modalConfig.params.patientbilldetail) {
                $scope.item.patientbilldetail = modalConfig.params.patientbilldetail;
                $scope.item.Id = $scope.item.patientbilldetail.Id;
                $scope.item.DoctorId = $scope.item.patientbilldetail.DoctorId;
                $scope.item.oldDrName = $scope.item.patientbilldetail.DoctorName;
                $scope.item.NetAmount = $scope.item.patientbilldetail.NetAmount;
                $scope.item.DoctorShare = $scope.item.patientbilldetail.DoctorShare;
                $scope.item.Remarks = $scope.item.patientbilldetail.Remarks;
            }
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
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
            var oldDrshare = $scope.item.patientbilldetail.DoctorShare;
            var NetAmount = $scope.item.patientbilldetail.NetAmount;
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

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            $scope.confirmCallback();
        };

        $scope.saveitem = function () {
            if ($scope.item.Id && $scope.item.DoctorId && $scope.item.DoctorName
                && $scope.item.DoctorShare >= 0) {
                var updatedata = {
                    Id: $scope.item.Id,
                    DoctorId: $scope.item.DoctorId,
                    DoctorName: $scope.item.DoctorName,
                    DoctorShare: $scope.item.DoctorShare,
                    Remarks: $scope.item.Remarks
                };
                var options = {
                    action: 'billing/patientbilldetails/UpdatePatientBillDetails',
                    data: { Data: updatedata },
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


    }

    drpaymentmodifyformController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();