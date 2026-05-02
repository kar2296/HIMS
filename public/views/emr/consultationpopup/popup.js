  
    (function() {
        'use strict';
    
        angular
            .module('app.pages')
            .controller('questionCommentsController', questionCommentsController);
    
    function questionCommentsController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        
        $scope.currentcontext = {
            modelkey : '',
            comments : '',
            termcommentid : ''
        }

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.modelkey = modalConfig.params.modelkey;
            $scope.currentcontext.comments = modalConfig.params.comments;
            $scope.currentcontext.termcomments = modalConfig.params.termcomments;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.termCommentsChange = function(selectedItem) {
            $scope.currentcontext.comments = selectedItem && selectedItem.Text ? selectedItem.Text : '';
        }

        $scope.saveItem = function () {
            $scope.confirmCallback({ modelkey : $scope.currentcontext.modelkey, comments : $scope.currentcontext.comments });
        }
    }
    
    questionCommentsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
    
    })();