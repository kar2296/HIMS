(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('pastLabFormController', pastLabFormController);

    function pastLabFormController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.item = {

        };

        $scope.lookup = {};

        $scope.currentcontext = {

        };

        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        if ($stateParams.pid)
            $scope.currentcontext.pid = parseInt($stateParams.pid);
        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.pastlabresultDetails = [];


        $scope.addNewLineItem = function () {
            var pastlabresultDetail = getNewItem();

            if ($scope.currentcontext.id > 0) {
                pastlabresultDetail.ClinicalResultId = $scope.currentcontext.id;
            }

            $scope.pastlabresultDetails.push(pastlabresultDetail);
        }

        function getNewItem() {
            var pastlabresultDetail = {
                Id: 0,
                PatientId: $scope.item.PatientId,
                TestId: -1,
                Status: 1,
                Resultvalue: '',
                Uom: '',
                Reference: '',

            };


            return pastlabresultDetail;
        }

        $scope.addNew = function () {
            $state.go('patientemr.pastlabresult', {
                id: 0,

            });
        };

        $scope.add_new = function () {
            utl.Modal.open('app.pastlabresultdetail', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.onDetailSave
            });
        };
        $scope.addnewclear = function () {
            $scope.pastlabresultDetails = [];
            $scope.addNewLineItem();
            $scope.item = {

            };
        }



        $scope.Clear = function () {
            $scope.item = {};
        };

        //deleteLineItem
        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            $scope.saveItem();
        }

        $scope.deleteItem = function (idx, item) {
            var name = item.SerialNO || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        }

        //deleteLineItem
        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
        }

        $scope.deleteDetail = function (idx, item) {
            var name = item.TestName || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, TestName);
        }




        $scope.onDetailSave = function (itemFromModal) {
            console.log(data.Data);
            var isaddnew = true;
            for (var idx in $scope.pastlabresultDetails) {
                var item = $scope.pastlabresultDetails[idx];
                if (item.currenteditable) {
                    item = itemFromModal;
                    item.currenteditable = false;
                    isaddnew = false;
                }
            }
            if (isaddnew) {
                itemFromModal.Status = 1;
                if ($scope.currentcontext.id > 0) {
                    itemFromModal.ClinicalResultId = $scope.currentcontext.id;
                }

                $scope.pastlabresultDetails.push(itemFromModal);


            }
            $scope.addNewLineItem();
        };


        $scope.getPastLabResultDetailsCallback = function (scope, res, options, hasError) {
            var result = [];

            for (var idx in res.Data) {
                var item = res.Data[idx];


                result.push(item);
            }
            $scope.pastlabresultDetails = result;
            // $scope.addNewLineItem();
        };
        $scope.getPastLabResultDetails = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.currentcontext.id }
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'emr/PastLabResultDetail/GetPastLabResultDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPastLabResultDetailsCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.addNewLineItem();
            }
        };
        $scope.addNew = function () {
            $scope.addNewLineItem();
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;

        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'emr/PastLabResult/GetPastLabResultById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            // $scope.backToList();
        };

         $scope.backToList = function () {
            $state.go('patientemr.pastlabresults', { id:0});
        }


        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            if (checkMandatoryFields()) {
                var lines = getLinesForSave();


                var actionName = 'emr/PastLabResult/AddPastLabResult';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'emr/PastLabResult/UpdatePastLabResult';
                }
  $scope.item.TESTMASTERTYPId = 1;
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
            }
        };

 function checkMandatoryFields() {
            for (var iddx in $scope.pastlabresultDetails) {
                var iddxitem = $scope.pastlabresultDetails[iddx];

            }

            return true;
        }

        function getLinesForSave() {
            var result = [];

            for (var idx in $scope.pastlabresultDetails) {
                var item = $scope.pastlabresultDetails[idx];
                item.PatientId = $scope.item.PatientId;
                if (item.TestId > -1) {
                    result.push(item);
                }
            }
            return result;
        }

        function loadData() {
            $scope.getItem();
            $scope.getPastLabResultDetails();
        }



        // TestMaster AutoSearch
        vm.testcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Name', field: 'Name', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                // { header: 'Type', field: 'Sampletype', datatype: 'string', headercls: 'td-type', fieldcls: 'td-type' },
                // { header: 'Department', field: 'Department', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
                // { header: 'Price', field: 'Price', datatype: 'string', headercls: 'td-price', fieldcls: 'td-price' },
            ],
            searchparams: {},
            result: {},
            api: 'lis/testmaster/GetTestmasters',
            formatdisplay: formatselectedtest,
            presearch: presearchtest,
            postsearch: postsearchtest
        };

        function formatselectedtest() {

            var selectedItem = vm.testcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.TestName + '(' + selectedItem.TestCode + ')'].join('  ');
            } else if (vm.testcontrolconfig.rowdata) {
                result = [vm.testcontrolconfig.rowdata.TestCode, vm.testcontrolconfig.rowdata.TestName].join(' ');
            }
            return result;
        }

        function presearchtest() {
            var query = vm.testcontrolconfig.query;

            var inputData = {
                Params: [
                    { Key: 3, Value: 1},
                    { Key: 6, Value: 2 },
                    // { Key: 8, Value: { 'ServiceRateCategoryId': $scope.item.ServiceRateCategoryId } }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.testcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.testcontrolconfig.searchparams = inputData;
        }

        function postsearchtest() {
            for (var idx in vm.testcontrolconfig.result) {
                var item = vm.testcontrolconfig.result[idx];
                item.TestCode = item.Code;
                item.TestName = item.Name;
                // item.DrugType = item.DrugType.Description;
                // if (item.GenericMaster)
                //     item.GenericMaster = item.GenericMaster.GenericName;
                // if (item.DrugForm)
                //     item.DrugForm = item.DrugForm.Description;
                // item.DrugFrequency = item.DrugFrequency.Name;

            }
        }

       $scope.getTest = function () {
            $scope.Test = $scope.item.selectedItem;
            $scope.item.TestCode = $scope.Test.Code;
            $scope.item.TestName = $scope.Test.Name;
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            loadData();
        }



        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "TestOrAnalyteMaster"
                },


                { "Key": "YesNo", Default: false },
                {
                    "Key": "TESTMASTERTYP",
                },

            ];
            $scope.getLookUp(inputData);
            loadData();

        };

        $scope.getLookUp = function (inputData) {
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

    pastLabFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();