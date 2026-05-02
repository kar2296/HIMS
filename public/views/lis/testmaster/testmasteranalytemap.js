(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('testmasterAnalyteMapFormController', testmasterAnalyteMapFormController);

function testmasterAnalyteMapFormController($scope, $stateParams, $state, $translate, utl) {
     var vm = this;
    angular.extend(this, utl.Ctrl.getBaseCtrl({$scope: $scope}));   
    
    $scope.item = {
        IsActive : true
    }; 

    $scope.currentcontext =  {};
    $scope.currentcontext.testmasterid = parseInt($stateParams.id);
    $scope.currentcontext.id = parseInt($stateParams.tstanalyteid);
        var IsProfile = $scope.$parent.IsProfile;
    console.log("IsProfile" + IsProfile);
    
    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'lis/testmaster/GetTestmasteranalytemapById',
                data: { Id: $scope.currentcontext.id },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.backToList = function () {
       $state.go('app.testmastertab.testmasteranalytemaps');
    }

    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        $scope.backToList();
    };

    $scope.clear = function () {
        $scope.item = {};
    };

    $scope.saveItem = function () {
        
        if(!utl.Validator.validate($scope)) {
            return;
        }

        $scope.item.TestmasterId = $scope.currentcontext.testmasterid;    
        var actionName = 'lis/testmaster/AddTestmasteranalytemap';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'lis/testmaster/UpdateTestmasteranalytemap';
        }
      
        var options = {
            action: actionName,
            data: {Data : $scope.item },
            type: 'post',
            onComplete: $scope.saveItemCallback
        };
        utl.Http.doAction(options);


    };

    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        $scope.lookup.TestOrAnalyteMaster = IsProfile ? $scope.lookup.TestMaster : $scope.lookup.AnalyteMaster;
        $scope.getItem();
    }
    
    $scope.initLookup = function () {
        var inputData = [
                            { "Key": "TestMaster", "Request": {
                                 "Params": [{'Key': 2, 'Value': 0}],
                                 "Attributes": ['Id', ['Name', 'Text'], 'Code',
                                                'Name',
                                                'Mnemonics',
                                                'DisplayOrder',
                                                'Methodology' ]
                            }},
                            { "Key": "AnalyteMaster", "Request": {
                                 "Params": [ ],
                                 "Attributes": ['Id', ['Name', 'Text'], 'Code',
                                                'Description',
                                                'Name',
                                                'Mnemonics',
                                                'Displayorder',
                                                'Excludefromprint',
                                                'Loinccode',
                                                'Loincname',
                                                'Methodology' ]
                            }} 

                        ]
        var options = {
            action: 'General/Options/getoptions',
            data: inputData,
            type: 'post',
            onComplete: $scope.lookupCallback
        };
        utl.Http.doAction(options);
    }

    $scope.onAnalyteSelected = function (selectedItem) {
        //do selectedItem.PropertyName like selectedItem.Name or selectedItem.Key 
        //whatever property your list has.
        console.log(selectedItem);
        if(IsProfile) {
            $scope.item.TestAnalyteName = selectedItem.Text;
            $scope.item.DisplayID = selectedItem.Code;
            $scope.item.Mnemonics = selectedItem.Mnemonics;
            $scope.item.Methodology = selectedItem.Methodology; 
        }
        else{ 
            $scope.item.TestAnalyteName = selectedItem.Text;
            $scope.item.DisplayID = selectedItem.Code;
            $scope.item.Mnemonics = selectedItem.Mnemonics;
            $scope.item.Loinccode = selectedItem.Loinccode;
            $scope.item.Loincname = selectedItem.Loincname;
            $scope.item.Methodology = selectedItem.Methodology;
            $scope.item.Excludefromprint = selectedItem.Excludefromprint;
        }

    }
    
    $scope.initLookup();
}

testmasterAnalyteMapFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();