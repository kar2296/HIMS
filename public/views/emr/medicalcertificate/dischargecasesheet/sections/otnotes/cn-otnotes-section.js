(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OtNotesSectionController', OtNotesSectionController);

    function OtNotesSectionController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.OtRegister = [];

        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.cid = modalConfig.params.cid ? parseInt(modalConfig.params.cid) : null;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.cid = $scope.$parent.cncontext.consultationid;
        }

        $scope.Disabled = false;
        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.item = res.Data[0];
            $scope.currentcontext.id = $scope.item.Id;
            $scope.Disabled = false;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 13,
                        Value: $scope.currentcontext.eid
                    },
                ]
            };
            var options = {
                action: 'OtManagement/SurgeryEntry/GetSurgeryEntrys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        vm.procedurecontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Code',
                    field: 'Code',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Procedure Name',
                    field: 'ProcedureName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Category',
                    field: 'Category',
                    datatype: 'string',
                    headercls: 'td-category',
                    fieldcls: 'td-category'
                },
                {
                    header: 'Technique',
                    field: 'Technique',
                    datatype: 'string',
                    headercls: 'td-technique',
                    fieldcls: 'td-technique'
                },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/procedure/GetProcedures',
            formatdisplay: formatselectedprocedure,
            presearch: presearchprocedure,
            postsearch: postsearchprocedure
        };

        function formatselectedprocedure() {
            var selectedItem = vm.procedurecontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ProcedureName + '(' + selectedItem.Code + ')'].join('  ');
            } else if (vm.procedurecontrolconfig.rowdata) {
                result = [vm.procedurecontrolconfig.rowdata.Code, vm.procedurecontrolconfig.rowdata.ProcedureName].join(' ');
            }
            // $scope.item.ProcedureName = result;
            return result;
        }

        function presearchprocedure() {
            var query = vm.procedurecontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.procedurecontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 3,
                    Value: query
                });
            }

            vm.procedurecontrolconfig.searchparams = inputData;
        }

        function postsearchprocedure() {
            for (var idx in vm.procedurecontrolconfig.result) {
                var item = vm.procedurecontrolconfig.result[idx];
                item.ProcedureId = item.Code;
                item.ProcedureName = item.ProcedureName;
                if (item.ProcedureCategory)
                    item.Category = item.ProcedureCategory.Description;
                if (item.ProcedureTechnique)
                    item.Technique = item.ProcedureTechnique.Description;
            }
        }

        $scope.OnProcedureSelected = function (idx, item) {
            var ProcedureObj = item.SelectedItem;
            $scope.item.IsOtherProcedures = ProcedureObj.IsFreeText;
            if (ProcedureObj.IsFreeText == false)
                $scope.item.ProcedureName = ProcedureObj.ProcedureName;
        }

        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Doctor Id',
                    field: 'DoctorId',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Doctor Name',
                    field: 'DoctorName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Qualification',
                    field: 'Qualification',
                    datatype: 'string',
                    headercls: 'td-Qualification',
                    fieldcls: 'td-Qualification'
                },
                {
                    header: 'Speciality',
                    field: 'Speciality',
                    datatype: 'string',
                    headercls: 'td-dept',
                    fieldcls: 'td-dept'
                },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteddoctor,
            presearch: presearchdoctor,
            postsearch: postsearchdoctor
        };

        function setChiefSurgeon() {
            if ($scope.item.ChiefSurgeon)
                var surgeon = '';
            if ($scope.item.ChiefSurgeon.Title) surgeon = $scope.item.ChiefSurgeon.Title.Description
            if ($scope.item.ChiefSurgeon.FirstName) surgeon += ' ' + $scope.item.ChiefSurgeon.FirstName
            if ($scope.item.ChiefSurgeon.LastName) surgeon += ' ' + $scope.item.ChiefSurgeon.LastName
        }

        function formatselecteddoctor() {
            var selectedItem = vm.doctorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
                    vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            if (vm.doctorcontrolconfig.searchbyid == true)
                if (vm.doctorcontrolconfig.field == 'chiefsurgeon') {
                    if (!$scope.currentcontext.ismodal) {
                        setChiefSurgeon();
                    }
                    $scope.getDoctorTeam();
                }
            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if (vm.doctorcontrolconfig.field == 'surgeon' || vm.doctorcontrolconfig.field == 'chiefsurgeon')
                inputData.Params.push({
                    Key: 12,
                    Value: true
                });
            if (vm.doctorcontrolconfig.field == 'anesthesist')
                inputData.Params.push({
                    Key: 11,
                    Value: true
                });
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
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }
        $scope.clearasstsurgeon = function () {
            $scope.item.AssistantSurgeonId = null;
            $('#asstsurgeonid').val("");
        };

        $scope.clearanaesthesist = function () {
            $scope.item.AnaesthesistId = null;
            $('#anaesthisitid').val("");
        };

        $scope.clearsurgerynotes = function () {
            $scope.item.OtNotes[0].DataTemplate = '';
        };
        $scope.clearanaesthesistnotes = function () {
            $scope.item.OtNotes[1].DataTemplate = '';
        };
        $scope.openSurgeryNotes = function () {
            utl.Modal.open('app.otregistertab.surgicalnote', {
                params: {
                    id: $scope.currentcontext.id
                },
                confirmCallback: $scope.getList
            });
        }
        $scope.openAnaesthesistNotes = function () {
            utl.Modal.open('app.otregistertab.anesthesiannote', {
                params: {
                    id: $scope.currentcontext.id
                },
                confirmCallback: $scope.getList
            });
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        $scope.saveItem = function () {

            $scope.Disabled = true;
            if ($scope.item.ChiefSurgeon) {
                var surgeon = '';
                if ($scope.item.ChiefSurgeon.Title) surgeon = $scope.item.ChiefSurgeon.Title.Description
                if ($scope.item.ChiefSurgeon.FirstName) surgeon += ' ' + $scope.item.ChiefSurgeon.FirstName
                if ($scope.item.ChiefSurgeon.LastName) surgeon += ' ' + $scope.item.ChiefSurgeon.LastName
                $scope.item.ChiefSurgeon = surgeon;
            }
            $scope.item.ConsultationId = $scope.currentcontext.cid;
            var actionName = 'OtManagement/SurgeryEntry/AddSurgeryEntry';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'OtManagement/SurgeryEntry/UpdateSurgeryEntry';
            }

            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };

            utl.Http.doAction(options);
        };
        //Lookup
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

        $scope.getList();
    }

    OtNotesSectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();