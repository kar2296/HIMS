(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('chiefComplaintFormController', chiefComplaintFormController);

function chiefComplaintFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
    var vm = this;

    $scope.Items = [];
    $scope.currentfilter= {
        Name : '',
    };


    $scope.currentcontext =  {
        ismodal : modalConfig && modalConfig.params ? true : false,
        chiefComplaintId : -1,
        selectedCC : null
    };

    $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
    $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());

    if (modalConfig && modalConfig.params) {
        $scope.currentcontext.cid  = modalConfig.params.cid ? parseInt(modalConfig.params.cid) : null;

        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;
    } else {
        $scope.currentcontext.cid = $scope.$parent.cncontext.consultationid;
    }

    $scope.backTohome = function(){
        $scope.confirmCallback();
    }


    //autosearch starts

    vm.chiefcomplaintconfig = {
        query: '',
        searchbyid: false,
        options: [
            { header: 'Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
            { header: 'Name', field: 'ChiefComplaint', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' }
        ],
        searchparams: {},
        result: {},
        api: 'clinicalmaster/chiefcomplaint/GetChiefComplaints',
        formatdisplay: formatselectedcc,
        presearch: presearchcc,
        postsearch: postsearchcc
    };

    function formatselectedcc() {
        var selectedItem = vm.chiefcomplaintconfig.selected;
        var result = '';
        if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
            result = [selectedItem.ChiefComplaint].join('  ');
        }
        return result;
    }

    function presearchcc() {
        var query = vm.chiefcomplaintconfig.query;
        var inputData = {
            Params: [
                { Key: 3, Value: 2 }
            ],
            PageContext: {
                PageSize: 25,
                PageNumber: 1
            }
        };

        if (vm.chiefcomplaintconfig.searchbyid === true) {
            inputData.Params.push({ Key: 0, Value: query });
        } else if (query && query.length > 2) {
            inputData.Params.push({ Key: 1, Value: query });
        }
        vm.chiefcomplaintconfig.searchparams = inputData;
    }

    function postsearchcc() {
    }


    $scope.chiefComplaintChange = function() {
        var list = [];
        if($scope.currentcontext.selectedCC) {
            var item = { PatientId : $scope.currentcontext.pid,
                ChiefComplaint : $scope.currentcontext.selectedCC.ChiefComplaint, ChiefComplaintId : $scope.currentcontext.selectedCC.Id,
                Description : $scope.currentcontext.selectedCC.Description, StartDate : utl.Formatter.getCurrentDate(),
                PatientChiefComplaintStatusId : 1, EncounterId : $scope.currentcontext.eid,
                ConsultationId : $scope.currentcontext.cid
            };
            list.push(item);
        }
        saveData(list);
    }

    //autosearch ends

    //Favorite area starts
    $scope.favconfig = {
        favoritetypeid : 7,
        selectedlist : [],
        selecteddetail : {}
    };

    $scope.addFavorite = function() {

    }

    $scope.saveDataCallback = function (scope, res, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        $scope.confirmCallback();
    };
    $scope.saveFavorites = function() {
        var list= [];
        for(var idx in $scope.favconfig.selectedlist) {
            var favitem = $scope.favconfig.selectedlist[idx];
            var cc = utl.Lookup.getObject($scope.lookup.ChiefComplaint, favitem.ItemId);

            var item = { PatientId : $scope.currentcontext.pid,
                            ChiefComplaint : cc.ChiefComplaint, ChiefComplaintId : favitem.ItemId,
                            Description : cc.Description, StartDate : utl.Formatter.getCurrentDate(),
                            PatientChiefComplaintStatusId : 1, EncounterId : $scope.currentcontext.eid,
                            ConsultationId : $scope.currentcontext.cid
                        };
           list.push(item);
        }

        saveData(list);
    }

    function saveData(list) {
        if(list.length > 0) {
            var options = {
                action: 'emr/PatientChiefComplaint/ManagePatientChiefComplaints',
                data: {Data : list },
                type: 'post',
                onComplete: $scope.saveDataCallback
            };
            utl.Http.doAction(options);
        }
    }

    //Favorite area ends

    //getlist
    $scope.getListCallback = function (scope, res, options, hasError) {
        vm.gridConfig.data = res.Data;
        vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
    };

    $scope.getList = function () {

        var inputData = {
            Params :[
                { Key: 1, Value: $scope.currentfilter.Name },
                { Key: 2, Value: $scope.currentcontext.pid },
                { Key: 3, Value:  $scope.currentcontext.eid },
                { Key: 4, Value:  $scope.currentcontext.cid }
            ],
            PageContext:{
                PageSize: vm.gridConfig.pagerObj.pageSize,
                PageNumber: vm.gridConfig.pagerObj.currentPage
            }
        };

        var options = {
            action: 'emr/PatientChiefComplaint/GetPatientChiefComplaints',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    //Grid Actions
    $scope.addNew = function() {

    }

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'emr/PatientChiefComplaint/DeletePatientChiefComplaint',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);
    }

     $scope.handleEvents = function(actionType, row) {

        if(actionType == 'edit') {

        }
        else if(actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
        }
    }

    vm.gridConfig = {
        enableColumnResizing: true,
        columnDefs: [
                        { field: "ChiefComplaint", displayName: $translate.instant('patientemr.patientchiefcomplaint-list.name.lbl') },
                        { field: "StartDate", displayName: $translate.instant('patientemr.patientchiefcomplaint-list.date.lbl'),
                            cellTemplate : "<ngformatdate date-val='row.entity.StartDate'></ngformatdate>" },
                        { field: "PatientChiefComplaintStatus.Description", displayName: $translate.instant('patientemr.patientchiefcomplaint-list.status.lbl') },
                        { field : "Id", displayName : $translate.instant('common.actions_col.lbl'),
                                cellTemplate : 'actionTemplate.html',
                                actions : [
                                            {actiontype: 'delete', display : 'common.deleteaction.lbl'}
                                         ]
                        }
                    ],
        pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
    };

    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        $scope.getList();
    }

    $scope.initLookup = function () {
        var inputData = [
            { "Key": "ChiefComplaint" }
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

chiefComplaintFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();