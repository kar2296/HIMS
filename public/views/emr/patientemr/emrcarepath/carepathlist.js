(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('emrCarePathListController', emrCarePathListController);

    function emrCarePathListController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};

        $scope.currentcontext = {
            recordcount: 5,
            carepathid: -1,
            Diagnosis: '',
            AlosDays: -1,
            ismodal: modalConfig && modalConfig.params ? true : false,
            selectedMenu: 'list',
            view: 'listview'
        };

        //Download File
        $scope.downloadFileCallback = function (scope, data, options, hasError) {
            console.log('File downloaded successfully...');
        };

        $scope.downloadFile = function () {
            if ($scope.FilePath) {
                var inputData = { FilePath: $scope.FilePath };
                var options = {
                    action: 'emr/ClinicalDocument/GetDocumentFile',
                    data: { Data: inputData },
                    onComplete: $scope.downloadFileCallback
                };
                utl.Http.doDownload(options);
            }
        }


        $scope.getCarePathInfo = function () {
            if ($scope.currentfilter.Id > 0) {
                $scope.currentcontext.carepathid = $scope.currentfilter.Id;
                $scope.getCarePathsDetails();
                $scope.getAssementList();
                $scope.getInvestigationList();
                $scope.getPrescriptionList();
                $scope.getProcedureList();
                $scope.getQuestionaryList();
            }
        }

        $scope.currentfilter = {
            Id: -1,
            VitalId: -1,
            From: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            To: utl.Formatter.getCurrentDate()
        };


        // getVitallist
        $scope.getVitallistCallback = function (scope, res, options, hasError) {
            var vitals = res.Data;
            for (var idx in vitals) {
                var vital = vitals[idx];
                vitals[idx].PerformedDate = utl.Formatter.getDateTimeString(vitals[idx].PerformedDate);
                switch (vital.VitalId) {
                    case 1: //height
                        if (vital.VitalValue.includes("~")) {
                            var vitalvalues = vital.VitalValue.split("~");
                            vitals[idx].VitalValue = vitalvalues[0] + "'" + vitalvalues[1] + "\"";
                        }
                        break;
                    case 8: //BP
                        if (vital.VitalValue.includes("~")) {
                            var vitalvalues = vital.VitalValue.split("~");
                            vitals[idx].VitalValue = vitalvalues[0] + "/" + vitalvalues[1];
                        }
                        break;
                    default:
                        break;
                }
            }
            var finalData = [];
            var headerData = _.uniqBy(vitals, 'VitalName');
            var groupedData = _.groupBy(vitals, 'PerformedDate');
            for (var groupKey in groupedData) {
                var tr = [];
                tr.push({ ColVal: groupKey });
                for (var header in headerData) {
                    var td = _.find(groupedData[groupKey], { VitalName: headerData[header].VitalName });
                    var vitalValue = '';
                    if (td) {
                        vitalValue = td.VitalValue + ' ' + td.UOM;
                    }
                    tr.push({ ColVal: vitalValue });
                }
                finalData.push(tr);
            }
            $scope.currentcontext.groupedData = finalData;
            $scope.currentcontext.headerData = headerData;
            // vm.vitalgridConfig.data = vitals;
            // vm.vitalgridConfig.pagerObj.totalItems = 100; 

        };

        $scope.vitalhandleEvents = function (actionType, item) {

            if (actionType == 'edit') {
                utl.Modal.open('patientemr.patientvital', {
                    params: { id: item.Id, pid: $scope.currentcontext.pid },
                    confirmCallback: $scope.getList
                }
                );
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item.Id);
            }
            else if (actionType == 'list') {
                $state.go('patientemr.patientvitals');
            }
            else if (actionType == 'settings') {
                //TODO
            }
            else if (actionType == 'add') {
                utl.Modal.open('patientemr.patientvital', {
                    params: { id: 0, pid: $scope.currentcontext.pid },
                    confirmCallback: $scope.getList
                }
                );
            } else if (actionType == 'chart') {
                utl.Modal.open('patientemr.patientvitals', {
                    params: { id: 0, pid: $scope.currentcontext.pid, context: 'chart' },
                    confirmCallback: $scope.getList
                }
                );
            }
        };

        $scope.getVitallist = function () {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 3, Value: $scope.currentfilter.VitalId },
                    { Key: 7, Value: $scope.currentfilter.PerformedBy },
                    { Key: 5, Value: utl.Formatter.getFilterDate($scope.currentfilter.From) },
                    { Key: 6, Value: utl.Formatter.getFilterDate($scope.currentfilter.To) }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/patientvital/GetPatientVitals',
                data: inputData,
                type: 'post',
                onComplete: $scope.getVitallistCallback
            };

            utl.Http.doAction(options);
        };
        // getVitallist


        $scope.getDiagnosisNameCallback = function (scope, data, options, hasError) {
            $scope.DiagnosisName = (data.DiagnosisName + '(' + data.Code + ')') || '';
        };

        $scope.getDiagnosisName = function (Diagnosisid) {
            if ($scope.currentcontext.carepathid && $scope.currentcontext.carepathid > 0) {

                var options = {
                    action: 'clinicalmaster/diagnosis/GetDiagnosisById',
                    data: { Id: Diagnosisid },
                    type: 'post',
                    onComplete: $scope.getDiagnosisNameCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getSpecialityNameCallback = function (scope, data, options, hasError) {
            $scope.SpecialityName = data.SpecialityName || '';
        };

        $scope.getSpecialityName = function (SpecialityId) {
            if (SpecialityId && SpecialityId > 0) {
                var options = {
                    action: 'SystemSettings/speciality/GetSpecialityById',
                    data: { Id: SpecialityId },
                    type: 'post',
                    onComplete: $scope.getSpecialityNameCallback
                };
                utl.Http.doAction(options);
            }
        };


        // care path details   
        $scope.getCarePathsDetailsCallback = function (scope, data, options, hasError) {
            $scope.Alos = data.Alos || '';
            $scope.FilePath = data.FilePath;
            $scope.getDiagnosisName(data.DiagnosisId);
            $scope.getSpecialityName(data.SpecialityId);
        };

        $scope.getCarePathsDetails = function (pageNo) {
            if ($scope.currentcontext.carepathid && $scope.currentcontext.carepathid > 0) {

                var options = {
                    action: 'clinicalmaster/CarePath/GetCarePathById',
                    data: { Id: $scope.currentcontext.carepathid },
                    type: 'post',
                    onComplete: $scope.getCarePathsDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };

        // care path details 




        // care path assement 

        $scope.getAssementListCallback = function (scope, res, options, hasError) {
            vm.gridConfigAssessment.data = res.Data;
        };

        $scope.getAssementList = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.carepathid }
                ],
                PageContext: {
                    PageSize: 10000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'clinicalmaster/CarePathAssessment/GetCarePathAssessments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getAssementListCallback
            };

            utl.Http.doAction(options);
        };

        vm.gridConfigAssessment = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "AssessmentType.Description", displayName: $translate.instant('clinicalmaster.carepathassessment-list.aseesmenttype.lbl') },
                { field: "Assessment.AssessmentName", displayName: $translate.instant('clinicalmaster.carepathassessment-list.assessmentname.lbl') },
                { field: "IsManditory", displayName: $translate.instant('clinicalmaster.carepathassessment-list.ismanditory.lbl') }
                // ,
                // {
                //     field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                //     cellTemplate: 'actionTemplate.html',
                //     actions: [
                //         { actiontype: 'assessmentorder', display: 'Order' },
                //         { actiontype: 'assessmentreview', display: 'Review' },
                //         { actiontype: 'assessmentesclate', display: 'Esclate' },
                //         { actiontype: 'assessmentcomments', display: 'Comments' }
                //     ]
                // }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }

        };
        vm.gridConfigAssessment.enableRowSelection = true;
        vm.gridConfigAssessment.multiSelect = true;
        vm.gridConfigAssessment.enableFullRowSelection = true;
        vm.gridConfigAssessment.onRegisterApi = function (gridAssessmentApi) {
            $scope.gridAssessmentApi = gridAssessmentApi;
        };
        function getAssessmentSelectionRows() {
            var currentAssessmentSelection = $scope.gridAssessmentApi.selection.getSelectedRows();
            return currentAssessmentSelection;
        };

        // care path assement 

        // care path investigation 

        $scope.getInvestigationListCallback = function (scope, res, options, hasError) {
            vm.gridConfigInvestigation.data = res.Data;
            // vm.gridConfigInvestigation.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getInvestigationList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.carepathid }
                ],
                PageContext: {
                    PageSize: 10000,
                    PageNumber: 1
                    // PageSize: vm.gridConfigInvestigation.pagerObj.pageSize,
                    // PageNumber: vm.gridConfigInvestigation.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/CarePathClinicalOrder/GetCarePathClinicalOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getInvestigationListCallback
            };

            utl.Http.doAction(options);
        };

        vm.gridConfigInvestigation = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "TESTMASTERTYP.Description", displayName: $translate.instant('clinicalmaster.carepathclinicalorders.type.lbl') },
                { field: "Testmaster.Name", displayName: $translate.instant('clinicalmaster.carepathclinicalorders.testname.lbl') },
                { field: "Quantity", displayName: $translate.instant('clinicalmaster.carepathclinicalorders.quantity.lbl') },
                { field: "Day", displayName: $translate.instant('clinicalmaster.carepathclinicalorders.days.lbl') }
                // ,
                // {
                //     field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                //     cellTemplate: 'actionTemplate.html',
                //     actions: [
                //         { actiontype: 'investigationorder', display: 'Order' },
                //         { actiontype: 'investigationreview', display: 'Review' },
                //         { actiontype: 'investigationesclate', display: 'Esclate' },
                //         { actiontype: 'investigationcomments', display: 'Comments' }
                //     ]
                // }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }

        };
        vm.gridConfigInvestigation.enableRowSelection = true;
        vm.gridConfigInvestigation.multiSelect = true;
        vm.gridConfigInvestigation.enableFullRowSelection = true;
        vm.gridConfigInvestigation.onRegisterApi = function (gridInvestigationApi) {
            $scope.gridInvestigationApi = gridInvestigationApi;
        };
        function getInvestigationSelectionRows() {
            var currentInvestigationSelection = $scope.gridInvestigationApi.selection.getSelectedRows();
            return currentInvestigationSelection;
        };

        // care path investigation  

        // care path prescription   

        $scope.getPrescriptionListCallback = function (scope, res, options, hasError) {
            vm.gridConfigPrescription.data = res.Data;
            //vm.gridConfigPrescription.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getPrescriptionList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.carepathid }
                ],
                PageContext: {
                    PageSize: 10000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'clinicalmaster/CarePathPrescription/GetCarePathPrescriptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPrescriptionListCallback
            };

            utl.Http.doAction(options);
        };

        vm.gridConfigPrescription = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "DrugMaster.DrugName", displayName: $translate.instant('clinicalmaster.carepathprescriptions.drugname.lbl') },
                { field: "GenericMaster.GenericName", displayName: $translate.instant('clinicalmaster.carepathprescriptions.genericname.lbl') },
                { field: "DrugRoute.Description", displayName: $translate.instant('clinicalmaster.carepathprescriptions.drugroute.lbl') },
                { field: "DrugFrequency.Name", displayName: $translate.instant('clinicalmaster.carepathprescriptions.drugfrequency.lbl') },
                { field: "Dosage", displayName: $translate.instant('clinicalmaster.carepathprescriptions.dosage.lbl') },
                { field: "Quantity", displayName: $translate.instant('clinicalmaster.carepathprescriptions.quantity.lbl') },
                { field: "Duration", displayName: $translate.instant('clinicalmaster.carepathprescriptions.Duration.lbl') }
                // , 
                // {
                //     field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                //     cellTemplate: 'actionTemplate.html',
                //     actions: [
                //         { actiontype: 'prescriptionorder', display: 'Order' },
                //         { actiontype: 'prescriptionreview', display: 'Review' },
                //         { actiontype: 'prescriptionesclate', display: 'Esclate' },
                //         { actiontype: 'prescriptioncomments', display: 'Comments' }
                //     ]
                // }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        vm.gridConfigPrescription.enableRowSelection = true;
        vm.gridConfigPrescription.multiSelect = true;
        vm.gridConfigPrescription.enableFullRowSelection = true;
        vm.gridConfigPrescription.onRegisterApi = function (gridPrescriptionApi) {
            $scope.gridPrescriptionApi = gridPrescriptionApi;
        };
        function getPrescriptionSelectionRows() {
            var currentPrescriptionSelection = $scope.gridPrescriptionApi.selection.getSelectedRows();
            return currentPrescriptionSelection;
        };

        // care path prescription

        // care path procedure 

        $scope.getProcedureListCallback = function (scope, res, options, hasError) {
            vm.gridConfigProcedure.data = res.Data;
            //vm.gridConfigProcedure.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getProcedureList = function (pageNo) {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.carepathid }
                ],
                PageContext: {
                    PageSize: 10000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'clinicalmaster/CarePathProcedure/GetCarePathProcedures',
                data: inputData,
                type: 'post',
                onComplete: $scope.getProcedureListCallback
            };

            utl.Http.doAction(options);
        };

        vm.gridConfigProcedure = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "ProcedureCodeScheme.Description", displayName: $translate.instant('clinicalmaster.carepathprocedures.type.lbl') },
                { field: "Procedure.ProcedureName", displayName: $translate.instant('clinicalmaster.carepathprocedures.procedurename.lbl') },
                { field: "Code", displayName: $translate.instant('clinicalmaster.carepathprocedures.code.lbl') },
                { field: "IsManditory", displayName: $translate.instant('clinicalmaster.carepathclinicalorders.ismanditory.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    actions: [
                        { actiontype: 'procedureorder', display: 'Order' },
                        { actiontype: 'procedurereview', display: 'Review' },
                        { actiontype: 'procedureesclate', display: 'Esclate' },
                        { actiontype: 'procedurecomments', display: 'Comments' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }

        };
        vm.gridConfigProcedure.enableRowSelection = true;
        vm.gridConfigProcedure.multiSelect = true;
        vm.gridConfigProcedure.enableFullRowSelection = true;
        vm.gridConfigProcedure.onRegisterApi = function (gridProcedureApi) {
            $scope.gridProcedureApi = gridProcedureApi;
        };
        function getProcedureSelectionRows() {
            var currentPrescriptionSelection = $scope.gridProcedureApi.selection.getSelectedRows();
            return currentPrescriptionSelection;
        };

        // care path procedure 

        // care path Questionary

        $scope.getQuestionaryListCallback = function (scope, res, options, hasError) {
            vm.gridConfigQuestionary.data = res.Data;
            //vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getQuestionaryList = function (pageNo) {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.carepathid }
                ],
                PageContext: {
                    PageSize: 100000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'clinicalmaster/CarePathSection/GetCarePathSections',
                data: inputData,
                type: 'post',
                onComplete: $scope.getQuestionaryListCallback
            };

            utl.Http.doAction(options);
        };

        vm.gridConfigQuestionary = {
            enableColumnResizing: true,

            columnDefs: [
                { field: "SectionMaster.Name", displayName: $translate.instant('clinicalmaster.carepathsectios.sectionname.lbl') },
                { field: "SectionType.Description", displayName: $translate.instant('clinicalmaster.carepathsectios.type.lbl') },
                { field: "IsManditory", displayName: $translate.instant('clinicalmaster.carepathprocedures.ismanditory.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    actions: [
                        { actiontype: 'questionaryenter', display: 'Enter' },
                        { actiontype: 'questionaryreview', display: 'Review' },
                        { actiontype: 'questionaryesclate', display: 'Esclate' },
                        { actiontype: 'questionarycomments', display: 'Comments' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }

        };
        vm.gridConfigQuestionary.enableRowSelection = true;
        vm.gridConfigQuestionary.multiSelect = true;
        vm.gridConfigQuestionary.enableFullRowSelection = true;
        vm.gridConfigQuestionary.onRegisterApi = function (gridQuestionaryApi) {
            $scope.gridQuestionaryApi = gridQuestionaryApi;
        };
        function getQuestionarySelectionRows() {
            var currentQuestionarySelection = $scope.gridConfigQuestionary.selection.getSelectedRows();
            return currentQuestionarySelection;
        };

        // care path Questionary

        $scope.getSelectionRows = function (tablist, actiontype) {

            if (tablist == 1) // Assesment 
            {
                if (actiontype == 1) // Order
                {
                    var getAssessmentSelectionRows = getAssessmentSelectionRows;
                    utl.Alert.showSuccessMsg("Selected Item Ordered Successfully");
                }
                else if (actiontype == 2) // Review
                {
                    var getAssessmentSelectionRows = getAssessmentSelectionRows;
                    utl.Alert.showSuccessMsg("Selected Item Reviewed Successfully");
                }
                else if (actiontype == 3) // Esclate  
                {
                    var inputParams = { tablist: 1, actiontype: 3 };
                    utl.Modal.open('app.emrcomments', {
                        params: inputParams,
                        confirmCallback: $scope.getCarePathInfo,
                        cancelCallback: $scope.getCarePathInfo
                    });
                }
                else if (actiontype == 4) // Comments
                {
                    var inputParams = { tablist: 1, actiontype: 4 };
                    utl.Modal.open('app.emrcomments', {
                        params: inputParams,
                        confirmCallback: $scope.getCarePathInfo,
                        cancelCallback: $scope.getCarePathInfo
                    });

                }
            }
            else if (tablist == 2) // Investigation
            {
                if (actiontype == 1) // Order
                {
                    var getInvestigationSelectionRows = getInvestigationSelectionRows;
                    utl.Alert.showSuccessMsg("Selected Item Ordered Successfully");
                }
                else if (actiontype == 2) // Review
                {
                    var getInvestigationSelectionRows = getInvestigationSelectionRows;
                    utl.Alert.showSuccessMsg("Selected Item Reviewed Successfully");
                }
                else if (actiontype == 3) // Esclate  
                {
                    var inputParams = { tablist: 2, actiontype: 3 };
                    utl.Modal.open('app.emrcomments', {
                        params: inputParams,
                        confirmCallback: $scope.getCarePathInfo,
                        cancelCallback: $scope.getCarePathInfo
                    });
                }
                else if (actiontype == 4) // Comments
                {
                    var inputParams = { tablist: 2, actiontype: 4 };
                    utl.Modal.open('app.emrcomments', {
                        params: inputParams,
                        confirmCallback: $scope.getCarePathInfo,
                        cancelCallback: $scope.getCarePathInfo
                    });

                }

            }
            else if (tablist == 3) // Prescrition
            {
                if (actiontype == 1) // Order
                {
                    var PrescriptionSelectionRows = getPrescriptionSelectionRows;
                    utl.Alert.showSuccessMsg("Selected Item Ordered Successfully");
                }
                else if (actiontype == 2) // Review
                {
                    var PrescriptionSelectionRows = getPrescriptionSelectionRows;
                    utl.Alert.showSuccessMsg("Selected Item Reviewed Successfully");
                }
                else if (actiontype == 3) // Esclate  
                {
                    var inputParams = { tablist: 3, actiontype: 3 };
                    utl.Modal.open('app.emrcomments', {
                        params: inputParams,
                        confirmCallback: $scope.getCarePathInfo,
                        cancelCallback: $scope.getCarePathInfo
                    });
                }
                else if (actiontype == 4) // Comments
                {
                    var inputParams = { tablist: 3, actiontype: 4 };
                    utl.Modal.open('app.emrcomments', {
                        params: inputParams,
                        confirmCallback: $scope.getCarePathInfo,
                        cancelCallback: $scope.getCarePathInfo
                    });

                }

            }
            else if (tablist == 4) // Procedure
            {
                if (actiontype == 1) // Order
                {
                    var ProcedureSelectionRows = getProcedureSelectionRows;
                    utl.Alert.showSuccessMsg("Selected Item Ordered Successfully");
                }
                else if (actiontype == 2) // Review
                {
                    var ProcedureSelectionRows = getProcedureSelectionRows;
                    utl.Alert.showSuccessMsg("Selected Item Reviewed Successfully");
                }
                else if (actiontype == 3) // Esclate  
                {
                    var inputParams = { tablist: 4, actiontype: 3 };
                    utl.Modal.open('app.emrcomments', {
                        params: inputParams,
                        confirmCallback: $scope.getCarePathInfo,
                        cancelCallback: $scope.getCarePathInfo
                    });
                }
                else if (actiontype == 4) // Comments
                {
                    var inputParams = { tablist: 4, actiontype: 4 };
                    utl.Modal.open('app.emrcomments', {
                        params: inputParams,
                        confirmCallback: $scope.getCarePathInfo,
                        cancelCallback: $scope.getCarePathInfo
                    });

                }

            }
            else if (tablist == 5) // Questionary 
            {
                if (actiontype == 1) // Order
                {
                    var QuestionarySelectionRows = getQuestionarySelectionRows;
                    utl.Alert.showSuccessMsg("Selected Item Entry Completed");
                }
                else if (actiontype == 2) // Review
                {
                    var QuestionarySelectionRows = getQuestionarySelectionRows;
                    utl.Alert.showSuccessMsg("Selected Item Reviewed Successfully");
                }
                else if (actiontype == 3) // Esclate  
                {
                    var inputParams = { tablist: 5, actiontype: 3 };
                    utl.Modal.open('app.emrcomments', {
                        params: inputParams,
                        confirmCallback: $scope.getCarePathInfo,
                        cancelCallback: $scope.getCarePathInfo
                    });
                }
                else if (actiontype == 4) // Comments
                {
                    var inputParams = { tablist: 5, actiontype: 4 };
                    utl.Modal.open('app.emrcomments', {
                        params: inputParams,
                        confirmCallback: $scope.getCarePathInfo,
                        cancelCallback: $scope.getCarePathInfo
                    });

                }

            }

        }


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.currentcontext.carepathid = -1;
            $scope.getVitallist();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Vital" },
                { "Key": "User" },
                { "Key": "CarePath" }
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

    emrCarePathListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();