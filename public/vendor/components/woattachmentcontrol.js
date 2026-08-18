(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('woattachmentcontrolCtrl', ['utl', '$scope', '$timeout', '$translate', 'Upload',
			function (utl, $scope, $timeout, $translate, Upload) {
				var cvm = this;

				cvm.currentcontext = {
					file: null
				};
				cvm.item = {
					Comments: ''
				};

				$scope.$watch('cvm.config',
					function (newValue) {
						if (newValue) {
							cvm.getList();
						}
					});

				cvm.fileSelected = function () {
					if (cvm.currentcontext.file && cvm.currentcontext.file.name) {
						cvm.item.AttachmentName = cvm.currentcontext.file.name;
					}
				}

				//save item
				cvm.saveItem = function () {
					if (!cvm.currentcontext.file) {
						utl.Alert.showErrorMsg($translate.instant('lis.attachmentcontrol.nofilemsg.lbl'));
						return;
					}

					var actionName = "lis/WorkOrderAttachment/AddWorkOrderAttachment";
					var actionUrl = utl.Http.getRootPath() + actionName;

					cvm.item.PatientId = cvm.config.patientid;
					cvm.item.WorkOrderId = cvm.config.workorderid;
					if (cvm.config.workorderdetailid) {
						cvm.item.WorkOrderDetailId = cvm.config.workorderdetailid;
					}

					Upload.upload({
						url: actionUrl,
						data: {
							file: cvm.currentcontext.file,
							Data: cvm.item
						}
					}).then(function (resp) { //upload function returns a promise
							utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
							cvm.currentcontext.file = null;

							//reset form and reload list
							cvm.item = {
								Comments: ''
							};
							cvm.getList();
						},
						function (resp) { //catch error
							console.log('Error status: ' + resp.status);
							utl.Alert.showErrorMsg('Error status: ' + resp.status);
						},
						function (evt) {
							console.log(evt);
						});
				}

				//get list
				cvm.getListCallback = function (scope, res, options, hasError) {
					cvm.gridConfig.data = res.Data;
				}
				cvm.getList = function () {

					var inputData = {
						Params: [{
								Key: 2,
								Value: cvm.config.patientid
							},
							{
								Key: 3,
								Value: cvm.config.workorderid
							}
						],
						PageContext: {
							PageSize: 1000,
							PageNumber: 1
						}
					};

					if (cvm.config.workorderdetailid) {
						inputData.Params.push({
							Key: 4,
							Value: cvm.config.workorderdetailid
						});
					}

					var options = {
						action: 'lis/WorkOrderAttachment/GetWorkOrderAttachments',
						data: inputData,
						type: 'post',
						onComplete: cvm.getListCallback
					};
					utl.Http.doAction(options);
				}

				//Delete
				cvm.deleteItemCallback = function (scope, data, options, hasError) {
					utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
					cvm.getList();
				};

				cvm.onDeleteConfirmed = function (deleteId) {
					var options = {
						action: 'lis/WorkOrderAttachment/DeleteWorkOrderAttachment',
						data: {
							Id: deleteId
						},
						type: 'post',
						onComplete: cvm.deleteItemCallback
					};
					utl.Http.doAction(options);
				}

				//Download File
				cvm.downloadFileCallback = function (scope, data, options, hasError) {
					console.log('File downloaded successfully...');
					//window.open(data);
				};

				cvm.downloadFile = function (entity) {
					var inputData = {
						FilePath: entity.FilePath
					};
					var options = {
						action: 'lis/WorkOrderAttachment/GetAttachmentFile',
						data: {
							Data: inputData
						},
						onComplete: cvm.downloadFileCallback
					};
					utl.Http.doDownload(options);
				}


				$scope.canShowAction = function (actionType, entity) {
					if (cvm.config.readonly == true && actionType == 'delete') {
						return false;
					}
					return true;
				}

				$scope.handleEvents = function (actionType, entity) {

					if (actionType == 'delete') {
						utl.Dialog.confirmDelete(cvm.onDeleteConfirmed, entity.Id, entity.AttachmentName);
					} else if (actionType == 'download') {
						cvm.downloadFile(entity);
					}
				}

				cvm.gridConfig = {
					columnDefs: [{
							field: "AttachmentName",
							displayName: $translate.instant('lis.attachmentcontrol.attachmentname.lbl')
						},
						{
							field: "Comments",
							displayName: $translate.instant('lis.attachmentcontrol.comments.lbl')
						},
						{
							field: "Id",
							displayName: $translate.instant('common.actions_col.lbl'),
							cellTemplate: '<div class="ui-grid-cell-contents text-center" style="display: flex; align-items: center; justify-content: center; gap: 6px; padding: 4px;">\
                                       <button type="button" class="btn btn-xs btn-default" ng-click="handleEvents(\'download\',entity)" title="View / Download" style="padding: 4px 8px; border-radius: 5px; border: 1px solid #cbd5e1; background: #ffffff; color: #21008d; font-weight: 600; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.05);"><i class="fa fa-download" style="margin-right: 4px;"></i> View</button>\
                                       <button type="button" class="btn btn-xs btn-danger" ng-click="handleEvents(\'delete\',entity)" title="Delete" style="padding: 4px 8px; border-radius: 5px; border: 1px solid #ef4444; background: #ef4444; color: #ffffff; font-weight: 600; cursor: pointer; box-shadow: 0 1px 3px rgba(239,68,68,0.2);"><i class="fa fa-trash"></i></button>\
							</div>',
							handleEvent: $scope.handleEvents,
							actions: []
						}
					],
					data: []
				};

				cvm.init = function () {}

				//caution : base method, please don't modifiy
				cvm.$onInit = function () {
					$timeout(cvm.init, 100);
				}
			}
		])
		.component('woattachmentcontrol', {
			bindings: {
				config: "="
			},
			controller: 'woattachmentcontrolCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/woattachmentcontrol.html'
		})

})();