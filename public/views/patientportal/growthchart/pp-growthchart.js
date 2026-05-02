(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('growthChartController', growthChartController);

    function growthChartController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {};
        $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());

        //growth chart code starts
        $scope.growthcharttabs = [
            {
                key: 'headcircum', name: $translate.instant('patientemr.patientvital-list.growth-headcircum.lbl'),
                xaxislbl: 'Age (in months)', yaxislbl: 'Head circumference'
            },
            {
                key: 'bmi', name: $translate.instant('patientemr.patientvital-list.growth-bmi.lbl'),
                xaxislbl: 'Age (in months)', yaxislbl: 'BMI'
            },
            {
                key: 'height', name: $translate.instant('patientemr.patientvital-list.growth-height.lbl'),
                xaxislbl: 'Age (in months)', yaxislbl: 'Height'
            },
            {
                key: 'weight', name: $translate.instant('patientemr.patientvital-list.growth-weight.lbl'),
                xaxislbl: 'Age (in months)', yaxislbl: 'Weight'
            }
        ];

        $scope.growthchartconfig = {
            patientid: $scope.currentcontext.pid,
            gender: utl.Session.getPatientGender(),
            patientdob: utl.Session.getPatientDOB(),
            vital: $scope.growthcharttabs[0].key,
            xaxislbl: $scope.growthcharttabs[0].xaxislbl,
            yaxislbl: $scope.growthcharttabs[0].yaxislbl
        };

        $scope.growhtchartChange = function (item) {
            $scope.growthchartconfig = {
                patientid: $scope.currentcontext.pid,
                gender: utl.Session.getPatientGender(),
                patientdob: utl.Session.getPatientDOB(),
                vital: item.key,
                xaxislbl: item.xaxislbl,
                yaxislbl: item.yaxislbl
            };
        }
        //growth chart code ends

        $scope.getListCallback = function (scope, res, options, hasError) {

        }

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid }
                ],
                PageContext: {
                    PageSize: 50,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/patientvital/GetPatientVitals',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
    }

    growthChartController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();