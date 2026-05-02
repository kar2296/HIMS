(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('TreatmentplanExecutionController', TreatmentplanExecutionController);

    function TreatmentplanExecutionController($scope, $interval, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));

        $scope.item = {
            PlanRequestDate: utl.Formatter.getCurrentDate(),
            CapturedBy: utl.Session.getCurrentUserId(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            EncounterId: utl.Session.getEncounterId(),
            PlanStatusId: 1,
            PlanPriorityId: 1
        };
        $scope.TreatmentPlanDetails = [];

        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter) {
            $scope.item.EncounterTypeId = $scope.currentcontext.encounter.EncounterTypeId;
            $scope.item.DepartmentId = $scope.currentcontext.encounter.DepartmentId;
            $scope.item.DoctorId = $scope.currentcontext.encounter.DoctorId;
            $scope.item.ServiceRateCategoryId = $scope.currentcontext.encounter.ServiceRateCategoryId;
        }
        $scope.item.PatientId = $scope.currentcontext.pid;

        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'emr/TreatmentPlanDetail/GetTreatmentPlanDetailById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function() {
            $scope.confirmCallback();
        };



        vm.serviceitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Service Code',
                    field: 'ServiceCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Service Name',
                    field: 'ServiceName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'ServiceItem Rate',
                    field: 'TotalAmount',
                    datatype: 'string',
                    headercls: 'td-rate',
                    fieldcls: 'td-rate'
                }
            ],
            searchparams: {},
            result: {},
            api: 'ClinicalMaster/ServiceItem/GetServiceItems',
            formatdisplay: formatselectedserviceitem,
            presearch: presearchserviceitem,
            postsearch: postsearchserviceitem
        };

        function formatselectedserviceitem() {
            var selectedItem = vm.serviceitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ServiceName + '(' + selectedItem.ServiceCode + ')'].join(' ');
            } else if (vm.serviceitemcontrolconfig.rowdata) {
                result = [vm.serviceitemcontrolconfig.rowdata.ServiceCode, vm.serviceitemcontrolconfig.rowdata.ServiceName].join(' ');
            }
            return result;
        }

        function presearchserviceitem() {
            var query = vm.serviceitemcontrolconfig.query;
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: 2
                    },
                    {
                        Key: 30,
                        Value: $scope.item.ServiceRateCategoryId
                    },
                    {
                        Key: 29,
                        Value: true
                    }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.serviceitemcontrolconfig.searchbyid == true) {
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

            vm.serviceitemcontrolconfig.searchparams = inputData;
        }

        function postsearchserviceitem() {
            for (var idx in vm.serviceitemcontrolconfig.result) {
                var item = vm.serviceitemcontrolconfig.result[idx];
                item.ServiceCode = item.ItemCode;
                item.ServiceName = item.Name;
                var ServiceTraiffobj = $filter('filter')(item.ServiceItemTariffDetails, {
                    ServiceRateCategoryId: $scope.item.ServiceRateCategoryId,
                    FacilityId: $scope.item.FacilityId
                }, true);
                if (ServiceTraiffobj != null && ServiceTraiffobj.length > 0) {
                    item.TotalAmount = ServiceTraiffobj[0].Rate;
                }
            }
        }


        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };


        $scope.complete = function() {
            $scope.item.PlanDetailStatusId = 2;
            $scope.item.CompletedById = utl.Session.getCurrentUserId();
            $scope.item.CompletedDateTime = utl.Formatter.getCurrentDate();
            $scope.CompletePlan();
        }

        $scope.CompletePlan = function() {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You want to Complete this Plan?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.saveItem = function() {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            // var lines = getLinesForSave();
            var actionName = 'emr/TreatmentPlanDetail/AddTreatmentPlanDetail';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/TreatmentPlanDetail/UpdateTreatmentPlanDetail';
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
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();

        };
        $scope.initLookup = function() {
            var inputData = [];
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
    TreatmentplanExecutionController.$inject = ['$scope', '$interval', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$filter'];

})();