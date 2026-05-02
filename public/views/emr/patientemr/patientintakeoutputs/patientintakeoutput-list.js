(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientIntakeOutputListController', patientIntakeOutputListController);

    function patientIntakeOutputListController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.Items = [];
        $scope.currentcontext = {
            pid: parseInt(utl.Session.getEMRPatientId()),
            eid: parseInt(utl.Session.getEncounterId()),
            view: "list"
        }
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);

            if (modalConfig.params.context) {
                $scope.currentcontext.view = modalConfig.params.context;
            }
        } else {
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }
        $scope.currentfilter = {
            name: ''
        };
        //Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                CapturedBy: -1,
                IntakeOutputTypeId: -1,
                IntakeTypeId: -1,
                OutputTypeId: -1,
                IntakeOutputStatusId: -1,
                From: utl.Formatter.getCurrentDate(),
                To: utl.Formatter.getCurrentDate(),
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'ordermanagement.orderacknowledgement-form.from.lbl', model: 'From', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'ordermanagement.orderacknowledgement-form.to.lbl', model: 'To', position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'patientemr.patientintakeoutput-list.updatedby.lbl', model: 'CapturedBy', options: $scope.lookup.User, position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'patientemr.patientintakeoutput-form.type.lbl', model: 'IntakeOutputTypeId', options: $scope.lookup.IntakeOutputType, position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'patientemr.patientintakeoutput-form.intaketype.lbl', model: 'IntakeTypeId', options: $scope.lookup.IntakeType, position: { r: 2, c: 0 } },
                    { type: 'select', translate: 'patientemr.patientintakeoutput-form.outputtype.lbl', model: 'OutputTypeId', options: $scope.lookup.OutputType, position: { r: 2, c: 1 } },
                    { type: 'select', translate: 'patientemr.patientintakeoutput-list.status.lbl', model: 'IntakeOutputStatusId', options: $scope.lookup.IntakeOutputStatus, position: { r: 3, c: 0 } },
                    { position: { r: 3, c: 1 } },
                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-primary' },
                    { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
                ]
            };
        }

        function handleDynamicFormEvents(actionType, formData) {
            $scope.advancedfilter = formData;
            $scope.getList();
        }

        $scope.openAdvancedFilter = function() {

                utl.Modal.openDynamicForm({
                    modeldata: $scope.advancedfilter,
                    defaultdata: $scope.advancedfilterDefault,
                    schema: $scope.advancedFilterSchema,
                    relativeto: '#btnadvanced',
                    handleDynamicFormEvents: handleDynamicFormEvents
                });
            }
            //Dynamic form  ends    
            //Visibility Rules starts

        $scope.canShowListArea = function() {
            return $scope.currentcontext.view == 'list';
        }

        $scope.canShowChartArea = function() {
            return $scope.currentcontext.view == 'chart';
        }

        //Visibility Rules ends

        function prepareChartData(listData) {
            var metaData = {
                charttitle: '',
                xaxistitle: '',
                yaxistitle: '',
                xaxis: 'datepart',
                yaxis: 'drain, medication',
                yaxisData: [],
                legend: '',
                yaxismin: 0,
                yaxismax: 0,
                yaxisinterval: 10
            };

            var chartItems = [];

            var distinctCat = {};
            for (var idx in listData) {
                var item = listData[idx];
                item.datepart = utl.Formatter.formatDate(item.IntakeOutputTime, 'YYYY-MM-DD HH');
                item.desc = item.IntakeType ? item.IntakeType.Description : item.OutputType.Description;
                item.value = item.IntakeType ? item.IntakeVolume : item.OutputVolume;

                distinctCat[item.datepart] = distinctCat[item.datepart] || {};
                distinctCat[item.datepart][item.desc] = distinctCat[item.datepart][item.desc] || [];
                distinctCat[item.datepart][item.desc].push(item);
                if (metaData.yaxisData.indexOf(item.desc) == -1) {
                    metaData.yaxisData.push(item.desc);
                }
            }
            metaData.yaxis = metaData.yaxisData.join(',');
            metaData.legend = metaData.yaxis;

            for (var dBuck in distinctCat) {
                var bucket = distinctCat[dBuck];
                var chartItem = { datepart: dBuck };
                for (var idx in metaData.yaxisData) {
                    var typeDesc = metaData.yaxisData[idx];
                    var ioArr = bucket[typeDesc];
                    chartItem[typeDesc] = null;
                    if (ioArr && ioArr.length > 0) {
                        chartItem[typeDesc] = ioArr[0].value
                        if (ioArr[0].value > metaData.yaxismax) {
                            metaData.yaxismax = ioArr[0].value;
                        }
                    }
                }
                chartItems.push(chartItem);
            }

            if (metaData.yaxismax > 0) {
                metaData.yaxisinterval = parseInt(metaData.yaxismax / 10);
            }
            metaData.yaxismax += 10;

            var chartInput = { MetaData: metaData, Items: chartItems };
            console.log(chartInput);

            utl.Chart.drawColumnChart('chart-io', chartInput, {});
        }

        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            prepareChartData(res.Data);
        };

        $scope.getList = function() {
            if ($scope.advancedfilter.From || $scope.advancedfilter.To) {
                $scope.currentfilter.IntakeOutputTime = '';
            }
            // var From = $filter('date')($scope.advancedfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.advancedfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    /* { Key: 1, Value: $scope.currentfilter.name ? $scope.currentfilter.name : "" } */
					{ Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 4, Value: $scope.advancedfilter.From },
                    { Key: 5, Value: $scope.advancedfilter.To },
                    { Key: 6, Value: $scope.advancedfilter.CapturedBy },
                    { Key: 7, Value: $scope.advancedfilter.IntakeOutputTypeId },
                    { Key: 8, Value: $scope.advancedfilter.IntakeTypeId },
                    { Key: 9, Value: $scope.advancedfilter.OutputTypeId },
                    { Key: 10, Value: $scope.advancedfilter.IntakeOutputStatusId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/patientintakeoutput/GetPatientIntakeOutputs',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        //back
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }

        //Grid Actions
        $scope.addNew = function() {
            utl.Modal.open('patientemr.patientintakeoutput', {
                params: { id: 0, pid: $scope.currentcontext.pid, eid: $scope.currentcontext.eid },
                confirmCallback: $scope.getList
            });
        }

        $scope.dashboard = function() {
            $state.go('patientemr.patientdashboard');
        }

        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function(deleteId) {
            var options = {
                action: 'emr/patientintakeoutput/DeletePatientIntakeOutput',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function(actionType, row) {

            if (actionType == 'edit') {
                utl.Modal.open('patientemr.patientintakeoutput', {
                    params: { id: row.entity.Id, pid: $scope.currentcontext.pid },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        }

        $scope.listview = function() {
            $scope.currentcontext.view = "list";
        }

        $scope.chartview = function() {
            $scope.currentcontext.view = "chart";
        }

        vm.gridConfig = {
            columnDefs: [{
                    field: "IntakeOutputTime",
                    displayName: $translate.instant('patientemr.patientintakeoutput-list.datetime.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.IntakeOutputTime'></ngformatdate>"
                },
                { field: "IntakeType.Description", displayName: $translate.instant('patientemr.patientintakeoutput-list.intaketype.lbl') },
                { field: "IntakeVolume", displayName: $translate.instant('patientemr.patientintakeoutput-list.intakevolume.lbl') },
                { field: "OutputType.Description", displayName: $translate.instant('patientemr.patientintakeoutput-list.outputtype.lbl') },
                { field: "OutputVolume", displayName: $translate.instant('patientemr.patientintakeoutput-list.outputvolume.lbl') },
                {
                    field: "PerformedBy",
                    displayName: $translate.instant('patientemr.patientintakeoutput-list.updatedby.lbl'),
                    cellTemplate: "<displayuser user='row.entity.User'></displayuser>"
                },
                { field: "Signatory", displayName: $translate.instant('patientemr.patientintakeoutput-list.signatory.lbl') },
                { field: "IntakeOutputStatus.Description", displayName: $translate.instant('patientemr.patientintakeoutput-list.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "User" },
                { "Key": "IntakeOutputType" },
                { "Key": "IntakeType" },
                { "Key": "OutputType" },
                { "Key": "IntakeOutputStatus" }
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

    patientIntakeOutputListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();