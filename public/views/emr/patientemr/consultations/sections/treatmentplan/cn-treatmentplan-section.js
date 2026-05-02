(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('cnTreatmentplanSectionController', cnTreatmentplanSectionController);

    function cnTreatmentplanSectionController($scope, $interval, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter) {
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
        $scope.canShowCreate = false;
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
        $scope.currentcontext.ConsultationId = $scope.$parent.cncontext.consultationid;
        $scope.item.ConsultationId = $scope.$parent.cncontext.consultationid;
        $scope.currentcontext.cid = $scope.item.ConsultationId;

        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter) {
            $scope.item.EncounterTypeId = $scope.currentcontext.encounter.EncounterTypeId;
            $scope.item.DepartmentId = $scope.currentcontext.encounter.DepartmentId;
            $scope.item.DoctorId = $scope.currentcontext.encounter.DoctorId;
            $scope.item.ServiceRateCategoryId = $scope.currentcontext.encounter.ServiceRateCategoryId;
        };
        $scope.item.PatientId = $scope.currentcontext.pid;

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            if (res.Data.length > 0) {
                for (var idx in res.Data) {
                    var item = res.Data[idx];
                    if (item.TreatmentPlanDetails.length > 0) {
                        var GroupedBatchData = _.groupBy(item.TreatmentPlanDetails, 'ServiceItemId');
                        for (var gdx in GroupedBatchData) {
                            var serviceInfo = GroupedBatchData[gdx];
                            if (!item.TreatmentName) {
                                item.TreatmentName = serviceInfo[0].ServiceName;
                            } else {
                                item.TreatmentName += ' ,' + serviceInfo[0].ServiceName;
                            }
                        }
                        vm.gridConfig.data.push(item);
                    }
                }
            }
        };

        $scope.getList = function () {
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentcontext.pid
                },
                {
                    Key: 11,
                    Value: $scope.currentcontext.eid
                },
                {
                    Key: 12,
                    Value: $scope.currentcontext.ConsultationId
                },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/TreatmentPlan/GetTreatmentPlans',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getDetailsCallback = function (scope, data, options, hasError) {
            $scope.TreatmentPlanDetails = [];
            $scope.SelectedServices = [];
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
            }
        };

        $scope.getDetails = function () {
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.item.Id
                }],
            };

            var options = {
                action: 'emr/TreatmentPlanDetail/GetTreatmentPlanDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDetailsCallback
            };

            utl.Http.doAction(options);
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
                        item.DepartmentId = serviceData.DepartmentId;
                        item.DoctorId = $scope.item.DoctorId;
                        item.ServiceItemId = serviceData.ServiceItemId;
                        item.ServiceCode = serviceData.ServiceCode;
                        item.ServiceName = serviceData.ServiceName;
                        item.ServiceCategoryId = serviceData.ServiceCategoryId;
                        item.ServicePrice = serviceData.ServicePrice;
                        item.PlanScheduleDate = new Date(scheduledate);
                        $scope.item.LastScheduled = new Date(scheduledate);
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
            if ($scope.SelectedServices.length > 0) {
                $scope.canShowCreate = true;
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
            $scope.canShowCreate = false;
            $scope.SelectedServices = [];
            $scope.item.NoOfDays = 0;
            $scope.item.Comments = '';
            // $scope.item = {};
            // $scope.item.ConsultationId = $scope.$parent.cncontext.consultationid;
            // $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
            // if ($scope.currentcontext.encounter) {
            //     $scope.item.EncounterTypeId = $scope.currentcontext.encounter.EncounterTypeId;
            //     $scope.item.DepartmentId = $scope.currentcontext.encounter.DepartmentId;
            //     $scope.item.DoctorId = $scope.currentcontext.encounter.DoctorId;
            //     $scope.item.ServiceRateCategoryId = $scope.currentcontext.encounter.ServiceRateCategoryId;
            // };
            $scope.getList();
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
            // if (!utl.Validator.validate($scope)) {
            //     return;
            // }
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

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/TreatmentPlan/DeleteTreatmentPlan',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }


        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [

                {
                    field: "S.No",
                    displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                // {
                //     field: "ConditionStatus.Description",
                //     displayName: $translate.instant('Request Date')
                // },
                {
                    field: "TreatmentName",
                    width: "40%",
                    displayName: $translate.instant('Procedure Name')
                },
                {
                    field: "NoOfDays",
                    width: "25%",
                    displayName: $translate.instant('No Of Days')
                },
                {
                    field: "Comments",
                    displayName: $translate.instant('Comments')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                   <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                </div>',
                    handleEvent: $scope.handleEvents,
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };


        $scope.getCurrentConsultationCallback = function (scope, data, options, hasError) {
            $scope.Consult = data;
            $scope.currentcontext.eid = data.EncounterId;
            //loadSectionData();
        };

        $scope.getCurrentConsultation = function (pageNo) {
            if ($scope.currentcontext.cid && $scope.currentcontext.cid > 0) {

                var options = {
                    action: 'emr/consultation/GetConsultationById',
                    data: {
                        Id: $scope.currentcontext.cid
                    },
                    type: 'post',
                    onComplete: $scope.getCurrentConsultationCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.getList();
        $scope.getCurrentConsultation();
    }
    cnTreatmentplanSectionController.$inject = ['$scope', '$interval', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$filter'];

})();