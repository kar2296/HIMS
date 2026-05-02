(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('TreatmentPlanFormController', TreatmentPlanFormController);

    function TreatmentPlanFormController($scope, $interval, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter) {
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
            PlanPriorityId: 1,
            NoOfDays: 1,
            IntervalDays: 1
        };
        $scope.TreatmentPlanDetails = [];
        $scope.SelectedServices = [];
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        };
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter) {
            $scope.item.EncounterTypeId = $scope.currentcontext.encounter.EncounterTypeId;
            $scope.item.DepartmentId = $scope.currentcontext.encounter.DepartmentId;
            $scope.item.DoctorId = $scope.currentcontext.encounter.DoctorId;
            $scope.item.ServiceRateCategoryId = $scope.currentcontext.encounter.ServiceRateCategoryId;
        };
        $scope.item.PatientId = $scope.currentcontext.pid;

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.getDetails();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'emr/TreatmentPlan/GetTreatmentPlanById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.getDetailsCallback = function (scope, data, options, hasError) {
            $scope.TreatmentPlanDetails = data.Data;
            if ($scope.TreatmentPlanDetails.length > 0) {
                var GroupedBatchData = _.groupBy($scope.TreatmentPlanDetails, 'ServiceItemId');
                for (var idx in GroupedBatchData) {
                    var serviceInfo = GroupedBatchData[idx];
                    var itemservice = {
                        ServiceItemId: serviceInfo[0].ServiceItemId,
                        ServiceCode: serviceInfo[0].ServiceCode,
                        ServiceName: serviceInfo[0].ServiceName,
                        ServiceCategoryId: serviceInfo[0].ServiceCategoryId,
                        ServicePrice: serviceInfo[0].ServicePrice
                    };
                    $scope.SelectedServices.push(itemservice);
                }
                // $scope.item.ServiceItemId = $scope.TreatmentPlanDetails[0].ServiceItemId;
                // $scope.item.ServicePrice = $scope.TreatmentPlanDetails[0].ServicePrice;
            }
        };

        $scope.getDetails = function () {
            if ($scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.id
                    }],
                };
                var options = {
                    action: 'emr/TreatmentPlanDetail/GetTreatmentPlanDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $scope.confirmCallback();
        };

        $scope.computedays = function (item) {
            $scope.TreatmentPlanDetails = [];
            for (var dx in $scope.SelectedServices) {
                var serviceData = $scope.SelectedServices[dx];
                if ($scope.item.NoOfDays > 0) {
                    for (var i = 1; i <= $scope.item.NoOfDays; i++) {
                        var scheduledate = '';
                        var item = {};
                        var repeat_every = i;
                        if (i == 1) {
                            $scope.item.LastScheduled = $scope.item.PlanRequestDate;
                        }
                        var repeat_every = 1;
                        if ($scope.item.IntervalDays > 0) {
                            if (i > 1) {
                                for (var j = 1; j <= $scope.item.IntervalDays; j++) {
                                    repeat_every = j + 1;
                                }
                            }
                        }
                        var last = new Date($scope.item.LastScheduled);
                        scheduledate = last.setDate(last.getDate() + repeat_every);
                        item.PatientId = $scope.item.PatientId;
                        item.Quantity = 1;
                        item.EncounterId = $scope.item.EncounterId;
                        item.DepartmentId = $scope.item.DepartmentId;
                        item.DoctorId = $scope.item.DoctorId;
                        item.ServiceItemId = serviceData.ServiceItemId;
                        item.ServiceCode = serviceData.ServiceCode;
                        item.ServiceName = serviceData.ServiceName;
                        item.ServiceCategoryId = serviceData.ServiceCategoryId;
                        item.ServicePrice = serviceData.ServicePrice;
                        item.PlanScheduleDate = new Date(scheduledate);
                        $scope.item.LastScheduled = new Date(scheduledate);
                        // if (i > 1) {
                            // item.IsFollowup = true;
                        // }
                        item.Status = 1;
                        if (i == 1) {
                            $scope.item.PlanScheduledFrom = item.PlanScheduleDate;
                        }
                        if (i == $scope.item.NoOfDays) {
                            $scope.item.PlanScheduledTo = item.PlanScheduleDate;
                        }
                        $scope.TreatmentPlanDetails.push(item);
                    }
                }
                // if ($scope.item.NoOfDays > 0 && !$scope.item.IntervalDays) {
                //     for (var i = 1; i <= $scope.item.NoOfDays; i++) {
                //         var scheduledate = '';
                //         var item = {};
                //         var repeat_every = i;
                //         var last = new Date($scope.item.PlanRequestDate);
                //         scheduledate = last.setDate(last.getDate() + repeat_every);
                //         item.PatientId = $scope.item.PatientId;
                //         item.Quantity = 1;
                //         item.EncounterId = $scope.item.EncounterId;
                //         item.DepartmentId = $scope.item.DepartmentId;
                //         item.DoctorId = $scope.item.DoctorId;
                //         item.ServiceItemId = serviceData.ServiceItemId;
                //         item.ServiceCode = serviceData.ServiceCode;
                //         item.ServiceName = serviceData.ServiceName;
                //         item.ServiceCategoryId = serviceData.ServiceCategoryId;
                //         item.ServicePrice = serviceData.ServicePrice;
                //         item.PlanScheduleDate = new Date(scheduledate);
                //         item.Status = 1;
                //         if (i == 1) {
                //             $scope.item.PlanScheduledFrom = item.PlanScheduleDate;
                //         }
                //         if (i == $scope.item.NoOfDays) {
                //             $scope.item.PlanScheduledTo = item.PlanScheduleDate;
                //         }
                //         $scope.TreatmentPlanDetails.push(item);
                //     }
                // }             
            }
        }


        $scope.serviceChanged = function (item) {
            var itemservice = {};
            var selectedservice = item.SelectedItem;
            var isExist = _.find($scope.SelectedServices, {
                'ServiceItemId': selectedservice.Id
            });
            if (!isExist) {
                var serviceInfo = item.SelectedItem;
                var Tariff = {};
                if (serviceInfo.ServiceItemTariffDetails && serviceInfo.ServiceItemTariffDetails.length > 0) {
                    Tariff = serviceInfo.ServiceItemTariffDetails[0];
                }
                item.PatientId = $scope.item.PatientId;
                item.EncounterId = $scope.item.EncounterId;
                item.DepartmentId = $scope.item.DepartmentId;
                item.DoctorId = $scope.item.DoctorId;
                $scope.item.ServiceItemId = serviceInfo.Id;
                $scope.item.ServiceCode = serviceInfo.ItemCode;
                $scope.item.ServiceName = serviceInfo.Name;
                $scope.item.ServiceCategoryId = serviceInfo.CategoryId;
                $scope.item.ServicePrice = Tariff.Rate;

                itemservice = {
                    ServiceItemId: serviceInfo.Id,
                    ServiceCode: serviceInfo.ItemCode,
                    ServiceName: serviceInfo.Name,
                    ServiceCategoryId: serviceInfo.CategoryId,
                    ServicePrice: Tariff.Rate
                };
                $scope.SelectedServices.push(itemservice);
            }
            document.getElementById("serviceid").value = '';
            $scope.computedays(item);
        };

        $scope.removeService = function (item, ServiceItemId) {
            $scope.SelectedServices = _.remove($scope.SelectedServices, function (currentObject) {
                return currentObject.ServiceItemId !== ServiceItemId;
            });
        }

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

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        function getLinesForSave() {
            var result = [];
            var ordertotal = 0;
            for (var idx in $scope.TreatmentPlanDetails) {
                var item = $scope.TreatmentPlanDetails[idx];
                item.PatientId = $scope.item.PatientId;
                item.PlanDetailStatusId = $scope.item.PlanStatusId;

                if (item.ServiceItemId > 0 && item.Status == 1) {
                    result.push(item);
                    ordertotal += item.ServicePrice;
                }
            }
            $scope.item.TotalAmount = ordertotal;
            return result;
        }

        $scope.create = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You want to create this Plan?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var lines = getLinesForSave();
            if (lines.length > 0) {
                var actionName = 'emr/TreatmentPlan/AddTreatmentPlan';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'emr/TreatmentPlan/UpdateTreatmentPlan';
                }
                var inputData = {
                    Header: $scope.item,
                    Details: lines
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
            } else {
                utl.Alert.showErrorMsg("Enter Required Fields!....");
            }
        };

        $scope.getItem();
    }
    TreatmentPlanFormController.$inject = ['$scope', '$interval', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$filter'];

})();