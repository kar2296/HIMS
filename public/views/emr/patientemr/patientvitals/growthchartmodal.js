(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('growthChartModalController', growthChartModalController);

    function growthChartModalController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            growthchartselected: 'headcircum',
            pid : parseInt(utl.Session.getEMRPatientId())
        };

        //growth chart code starts
        $scope.growthcharttabs = [
            {
                key: 'headcircum', name: $translate.instant('patientemr.growthchartmodal.growth-headcircum.lbl'),
                xaxislbl: 'Age (in months)', yaxislbl: 'Head circumference (cm)'
            },
            {
                key: 'bmi', name: $translate.instant('patientemr.growthchartmodal.growth-bmi.lbl'),
                xaxislbl: 'Age (in months)', yaxislbl: 'BMI (kg/m2)'
            },
            {
                key: 'height', name: $translate.instant('patientemr.growthchartmodal.growth-height.lbl'),
                xaxislbl: 'Age (in months)', yaxislbl: 'Height (cm)'
            },
            {
                key: 'weight', name: $translate.instant('patientemr.growthchartmodal.growth-weight.lbl'),
                xaxislbl: 'Age (in months)', yaxislbl: 'Weight (kg)'
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
        $scope.backToList = function () {
            $state.go('patientemr.nursingcharts')
        }
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
    }

    growthChartModalController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();