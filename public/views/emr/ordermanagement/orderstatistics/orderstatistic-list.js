(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OrderStatisticListController', OrderStatisticListController);

    function OrderStatisticListController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;
        $scope.currentcontext = {};
        $scope.currentcontext.TestTypeId = $stateParams.tp ? parseInt($stateParams.tp) : -1;

        if ($scope.currentcontext.TestTypeId == 1) { //lab
            $scope.DeptId = 8;
        } else if ($scope.currentcontext.TestTypeId == 2) { //radiology
            $scope.DeptId = 62;
        } else if ($scope.currentcontext.TestTypeId == 4) { //endoscopy
            $scope.DeptId = 60;
        }

        $scope.rows = [];
        $scope.row = { cols: [] };
        $scope.headerRow = { cols: [] };

        $scope.Items = {
            AllApproveDoc: {},
            AllEncType: {}
        };

        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FromDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00'),
            ToDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59'),
            Testtypeid: $stateParams.tp ? parseInt($stateParams.tp) : -1,
            MedValidationById: [],
            EncounterTypeId: []
        };

        $scope.getApproveDocListCallBack = function (scope, res, options, hasError) {
            for (var idx in res.Data) {
                $scope.currentcontext.MedValidationById.push(res.Data[idx].Id);
                var id = res.Data[idx].Id;
                var docname = '';
                if (res.Data[idx].Title) docname += res.Data[idx].Title.Description + ' ';
                if (res.Data[idx].FirstName) docname += res.Data[idx].FirstName;
                if (res.Data[idx].LastName) docname += res.Data[idx].LastName;
                var name = docname;
                $scope.Items.AllApproveDoc[id] = name;
            }
            $scope.getEncTypeList();
        }

        $scope.getApproveDocList = function () {
            var inputData = {
                Params: [
                    { Key: 6, Value: $scope.DeptId },
                ],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'SystemSettings/user/GetUsers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getApproveDocListCallBack
            };
            utl.Http.doAction(options);
        };
        $scope.getEncTypeListCallBack = function (scope, res, options, hasError) {
            for (var idx in res.Data) {
                if (res.Data[idx].ReferenceValueCodeId <= 2) {
                    $scope.currentcontext.EncounterTypeId.push(res.Data[idx].ReferenceValueCodeId);
                    var id = res.Data[idx].ReferenceValueCodeId;
                    var name = res.Data[idx].Description;
                    $scope.Items.AllEncType[id] = name;
                }
            }
            $scope.getList();
        }


        $scope.getEncTypeList = function () {
            var inputData = {
                Params: [
                    { Key: 3, Value: 'EncounterType' },
                ],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'SystemSettings/referencevalue/GetReferenceValues',
                data: inputData,
                type: 'post',
                onComplete: $scope.getEncTypeListCallBack
            };
            utl.Http.doAction(options);
        };
        var groupByMulti = function (obj, values, context) {
            if (!values.length)
                return obj;
            var byFirst = _.groupBy(obj, values[0], context),
                rest = values.slice(1);
            for (var prop in byFirst) {
                byFirst[prop] = groupByMulti(byFirst[prop], rest, context);
            }
            return byFirst;
        };

        var getDoctLabel = function (key) {
            var docname = $scope.Items.AllApproveDoc[key] || "";
            return docname;
        };
        var getEncLabel = function (key) {
            var enctyype = $scope.Items.AllEncType[key] || key;
            return enctyype;
        };
        var fillEmptyCols = function (colIndexes, cols) {
            for (var cIndex = cols.length; cIndex < colIndexes.length; cIndex++) {
                cols.push({ text: '' });
            }
        };

        var constructTable = function (gItems) {
            var colIndexes = ['DoctorName', 'Total'];
            $scope.rows = [];
            for (var docKey in gItems) {
                $scope.row = { cols: [] };
                fillEmptyCols(colIndexes, $scope.row.cols);
                $scope.row.cols[0] = { text: getDoctLabel(docKey) };
                var total = 0;
                for (var encKey in gItems[docKey]) {
                    var encIndex = colIndexes.indexOf(encKey);
                    var encTotal = gItems[docKey][encKey].length;
                    if (encIndex === -1) {
                        colIndexes.push(encKey);
                        encIndex = colIndexes.indexOf(encKey);
                        fillEmptyCols(colIndexes, $scope.row.cols);
                    }
                    $scope.row.cols[encIndex] = { text: encTotal };
                    total += encTotal;
                }
                $scope.row.cols[1] = { text: total };

                $scope.rows.push($scope.row);
            }
            $scope.headerRow = { cols: [] };
            for (var cIndex = 0; cIndex < colIndexes.length; cIndex++) {
                $scope.headerRow.cols.push({ text: getEncLabel(colIndexes[cIndex]) });
            }
            // $scope.rows.splice($scope.headerRow, 'Action');
            for (var rIndex = 0; rIndex < $scope.rows.length; rIndex++) {
                fillEmptyCols(colIndexes, $scope.rows[rIndex].cols);
            }
            return $scope.rows;
        };

        $scope.getListCallBack = function (scope, res, options, hasError) {

            var sourceData = res.Data;
            var groupedItems = groupByMulti(sourceData, ['MedValidationById', 'Encounter.EncounterTypeId']);
            var table = constructTable(groupedItems);
            //console.log(JSON.stringify(table));

        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 6, Value: $scope.currentcontext.Testtypeid },
                    { Key: 3, Value: 7 },
                    { Key: 16, Value: [1, 2] },
                ],
            };

            var options = {
                action: 'lis/patientworkorder/GetPatientWorkorders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallBack
            };
            utl.Http.doAction(options);
        };


        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                $state.go('app.containertype', { id: row.entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, '<br/>' + row.entity.Name);
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getApproveDocList();
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "SubDepartment",
                    Request: {
                        Params: [
                            { Key: 6, Value: $scope.DeptId }
                        ]
                    }
                },
                { "Key": "LabIncharge" },
                { "Key": "RadiologyIncharge" },
                { "Key": "EndoscopyIncharge" },
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

    OrderStatisticListController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();