(function () {
	'use strict';

	angular 
		.module('common.utils')
		.controller('regpatientbannerCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
			var cvm = this;
			cvm.patientinfo = {};



			$scope.getPatientCallback = function (scope, res, options, hasError) {
				if (res.Data && res.Data.length > 0) {
					$scope.Patientdata = res.Data[0];
					$scope.item = res.Data[0];
					$scope.OpBillPrint = true;
	
					if (!$scope.item.NooFVisitFree) {
						$scope.item.NooFVisitFree = 0;
						$scope.NooFVisitFreeDisabled = false;
					} else $scope.NooFVisitFreeDisabled = true;
	
					$scope.item.PatientId = $scope.item.Id;
					$scope.item.BannerPatientId = 0;
					$timeout(function () {
						$scope.item.BannerPatientId = $scope.item.Id;
					}, 100);
					if ($scope.item.MRNTypeId == 1) { // TEMP to Active Patient
						$scope.item.IsTempPatient = true;
						$scope.item.MRN = null;
						$scope.item.OverrideDuplicate = true;
					}
					$scope.setTempPatDefaultValue();
					$scope.getPatientProfilePic();
					if ($scope.item.Encounters && $scope.item.Encounters.length > 0) {
						var encounteritem = $scope.item.Encounters[0];
						$scope.item.VisitTypeId = encounteritem.VisitTypeId;
						$scope.item.IsNoBill = encounteritem.IsNoBill;
						$scope.item.ReferredById = encounteritem.ReferralId;
						$scope.item.ReferralId = encounteritem.ReferralId;
						$scope.item.DepartmentId = encounteritem.DepartmentId;
						$scope.item.DoctorId = encounteritem.DoctorId;
						$scope.item.DiagnosisId = encounteritem.DiagnosisId;
						$scope.item.OtherDiagnosis = encounteritem.OtherDiagnosis;
						$scope.item.TeamId = encounteritem.TeamId;
						$scope.item.Comments = encounteritem.Comments;
						$scope.item.EncounterId = encounteritem.Id;
						$scope.AppointmentId = encounteritem.AppointmentId;
	
						if ($scope.AppointmentId)
							$scope.getOldPatientAppt();
	
						if (encounteritem.EncounterStatusId == 1) $scope.EncounterStatus = 'Checked-In';
						else $scope.EncounterStatus = 'Checked-Out';
	
						$scope.SaveCompleted = true;
						$scope.IsOpenEncounter = true;
					} else $scope.EncounterStatus = 'Checked-Out';
					$scope.lookup["Referral"].filter(function (item) {
						if (item.ReferralId == $scope.item.ReferralId)
							$scope.item.ReferralTypeId = item.ReferralTypeId;
					});
					var ageObj = utl.Formatter.getDetailedAgeFromDOB($scope.item.DOB);
					$scope.item.ApproxAgeDays = ageObj.d;
					$scope.item.ApproxAgeMonths = ageObj.m;
					$scope.item.Age = ageObj.y;
	
					if (!$scope.currentcontext.TokenNo)
						$scope.getTokenDisplay();
	
					$scope.getPatientBillInfo();
					if ($scope.currentcontext.file && $scope.item.PatientId) {
						$scope.UploadPatientPhoto();
					}
					$scope.getPatientGuarantor();
				}
				$scope.getMRDFlowRequired();
				$scope.getPatientAttachments();
			};
	
			$scope.getPatient = function () {
				var inputData = {
					Params: [{
						Key: 0,
						Value: $scope.item.Id
					}, ],
					PageContext: {
						PageSize: 50,
						PageNumber: 1
					}
				};
				var options = {
					action: 'registration/patient/GetPatients',
					data: inputData,
					type: 'post',
					onComplete: $scope.getPatientCallback
				};
				utl.Http.doAction(options);
			};
			
			$scope.$watch('cvm.patientid',
				function (newValue) {
					cvm.getPatientById();
				});
				$scope.saveAndInactive = function (item) {
					utl.Modal.open('app.deactiveremarks', {
						params: {
							item: $scope.item
						},
						confirmCallback: $scope.OnRemarkSave
					});
				};

				$scope.OnRemarkSave = function (itemFromModal) {
					$scope.item.DeactivateRemarks = itemFromModal.DeactivateRemarks;
					$scope.item.PatientStatus = 'Inactive';
					$scope.item.PatientStatusId = 3;
					$scope.item.DeactivatedDate = utl.Formatter.getCurrentDate();
					var message = "";
					message = $scope.item.Title ? $scope.item.Title.Description : "";
					message += message != "" ? ("." + $scope.item.FirstName) : $scope.item.FirstName;
					message += $scope.item.MRN ? (" / MRN-" + $scope.item.MRN) : "";
					utl.Dialog.confirmDeactivate($scope.saveItem, message);
				};

				$scope.openattachments = function () {
					if ($scope.currentcontext.id > 0) {
						utl.Modal.open('app.patientattachments', {
							params: {
								pid: $scope.currentcontext.id,
								itemid: $scope.item.Id,
								objecttypeid: 1
							},
							confirmCallback: $scope.getPatientAttachments,
							cancelCallback: $scope.getPatientAttachments
						});
					} else {
						utl.Alert.showErrorMsg($translate.instant('registration.fullregistration.savepatient-msg.lbl'));
					}
				};

				$scope.getPatientAttachmentsCallback = function (scope, res, options, hasError) {
					$scope.currentcontext.attachmentcount = res.PageContext.TotalRecords;
				};
				
				$scope.checkout = function () {
					if ($scope.AppointmentId && $scope.item.PatientId) {
						var msg = 'Do You Want to Checkout for ' + $scope.item.FirstName;
						var confirmOptions = {
							headingKey: 'common.confirm-modal-header.lbl',
							messageKey: msg,
							yesKey: 'common.yeskey.lbl',
							noKey: 'common.nokey.lbl',
							onSuccessMethod: $scope.confirmcheckout,
						};
						utl.Dialog.confirmMessage(confirmOptions);
						// utl.Modal.open('app.patienttracker', {
						//     params: {
						//         pid: $scope.item.PatientId,
						//         aid: $scope.AppointmentId,
						//         assignto: 3
						//     },
						//     confirmCallback: $scope.addNew
						// });
					}
				};
				$scope.confirmcheckout = function () {
					$scope.Checkout.AssignTo = 4;
					$scope.Checkout.AppointmentId = $scope.AppointmentId;
					$scope.Checkout.PatientId = $scope.item.PatientId;
					var options = {
						action: 'appointment/patienttracker/CheckoutPatient',
						data: {
							Data: $scope.Checkout
						},
						type: 'post',
						onComplete: $scope.checkoutCallback
					};
					utl.Http.doAction(options);
				}
				$scope.checkoutCallback = function (scope, data, options, hasError) {
					utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
					// var data = options.data ? options.data : null;
					// // if (options.data && options.data.Data) {
					// //     if (options.data.Data.AssignTo && options.data.Data.AssignTo == 4 && options.data.Data.Duration) {
					// //         openAppointmentForm(options.data.Data.FollowupAppointmentOn);
					// //     }
					// //     if (options.data.Data.AssignTo && options.data.Data.AssignTo == 3) {
					// //         $scope.doctor_dashboard();
					// //     }
					// // }
		
					//  $scope.confirmCallback();
				};
			//Code to reload the banner starts

    /* Print Coding - Starting  */
	$scope.printOPBill = function () {
		// if ($scope.BillInfo && $scope.BillInfo.length > 0) {
		var inputData = {
			Id: $scope.BillInfo[0].BillId
		};
		var options = {
			action: 'billing/patientbills/PrintPatientBills',
			data: inputData,
			type: 'post'
		};
		utl.Http.doPrint(options);
		// }
	};

	$scope.printMRDLabel = function () {
		var noofprint = 1;
		try {
			if ($scope.NoofPrintMRDLabel && !isNaN($scope.NoofPrintMRDLabel))
				noofprint = parseInt($scope.NoofPrintMRDLabel);
		} catch (ex) {
			noofprint = 1;
		}
		try {
			var vTitle = '';
			var vFirstName = '';
			var vLastName = '';
			var vMRN = '';
			var vEncoutnerType = '';
			try {
				if ($scope.Patientdata && $scope.Patientdata.Title &&
					$scope.Patientdata.Title.Description)
					vTitle += $scope.Patientdata.Title.Description;

				if ($scope.Patientdata && $scope.Patientdata &&
					$scope.Patientdata.FirstName)
					vFirstName += ' ' + $scope.Patientdata.FirstName;


				if ($scope.Patientdata && $scope.Patientdata &&
					$scope.Patientdata.MRN)
					vMRN = $scope.Patientdata.MRN;

			} catch (ex) {}

			var code = '';
			var printData = []
			var printCodes = {
				new_line: '\x0A'
			};
			var code = '';
			code += 'I8,A,001' + printCodes.new_line;
			code += 'Q406,024' + printCodes.new_line;
			code += 'q831' + printCodes.new_line;
			code += 'rN' + printCodes.new_line;
			code += 'S3' + printCodes.new_line;
			code += 'D7' + printCodes.new_line;
			code += 'ZT' + printCodes.new_line;
			code += 'JF' + printCodes.new_line;
			code += 'O' + printCodes.new_line;
			code += 'R111,0' + printCodes.new_line;
			code += 'f100' + printCodes.new_line;
			code += 'N' + printCodes.new_line;
			if (window.clientcode.toLowerCase() == 'lotus') {
				code += 'A546,245,2,4,3,3,N,"' + vMRN + '"' + printCodes.new_line;
				code += 'A586,164,2,4,2,2,N,"' + vTitle + ' ' + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
				code += 'B546,106,2,1,4,12,66,B,"' + vMRN + '"' + printCodes.new_line;
			} else {
				code += 'A414,254,2,4,3,3,N,"' + vMRN + '"' + printCodes.new_line;
				code += 'A507,174,2,4,2,2,N,"' + vTitle + ' ' + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
				code += 'B437,116,2,1,4,12,66,B,"' + vMRN + '"' + printCodes.new_line;
			}
			code += noofprint > 1 ? 'P' + noofprint + printCodes.new_line : 'P1' + printCodes.new_line;
			printData.push(code);
			$scope.printRaw(printData);
		} catch (ex) {
			console.log(ex);
		}
	};

	$scope.printPatientLabel = function () {
		var noofprint = 1;
		try {
			if ($scope.NoofPrintPatientLabel && !isNaN($scope.NoofPrintPatientLabel))
				noofprint = parseInt($scope.NoofPrintPatientLabel);
		} catch (ex) {
			noofprint = 1;
		}
		try {
			var vTitle = '';
			var vFirstName = '';
			var vLastName = '';
			var vMRN = '';
			var vEncoutnerType = '';
			var vAddress = '';
			var vRegisteredDate = '';
			var vPhoneNumber = '';
			var vGender = '';
			var vDoctor = '';
			var vDOB = '';
			var vArea = '';
			var vCityTownName = '';
			var vGender = '';
			var vAddressLine1 = '';
			var vAddressLine2 = '';
			var vAge = '';
			var vPincode = '';
			try {
				if ($scope.Patientdata && $scope.Patientdata.Title &&
					$scope.Patientdata.Title.Description)
					vTitle += $scope.Patientdata.Title.Description;

				if ($scope.Patientdata && $scope.Patientdata &&
					$scope.Patientdata.FirstName)
					vFirstName += ' ' + $scope.Patientdata.FirstName;

				if ($scope.Patientdata && $scope.Patientdata &&
					$scope.Patientdata.LastName)
					vLastName += ' ' + $scope.Patientdata.LastName;

				if ($scope.Patientdata && $scope.Patientdata &&
					$scope.Patientdata.MRN)
					vMRN = $scope.Patientdata.MRN;


				if ($scope.Patientdata && $scope.Patientdata &&
					$scope.Patientdata.DOB)
					vDOB = $scope.Patientdata.DOB;

				if ($scope.Patientdata && $scope.Patientdata &&
					$scope.Patientdata.RegisteredDate)
					vRegisteredDate = $scope.Patientdata.RegisteredDate;
				var dateString = vRegisteredDate.toString();
				vRegisteredDate = dateString.substring(10, 0);

				if ($scope.Patientdata && $scope.Patientdata &&
					$scope.Patientdata.Age)
					vAge = $scope.Patientdata.Age;
				vAge = (vAge == "") ? vAge = ((typeof $scope.Patientdata.ApproxAgeMonths != "undefined") ? $scope.Patientdata.ApproxAgeMonths + "M " : "0M ") + $scope.Patientdata.ApproxAgeDays + "D" : vAge + "Y";


				if ($scope.Patientdata && $scope.Patientdata &&
					$scope.Patientdata.Mobile)
					vPhoneNumber = $scope.Patientdata.Mobile;

				if ($scope.Patientdata && $scope.Patientdata &&
					$scope.Patientdata.Gender.Description)
					vGender = $scope.Patientdata.Gender.Description;

				if ($scope.Patientdata && $scope.Patientdata &&
					$scope.Patientdata.Area)
					vArea = $scope.Patientdata.Area;

				if ($scope.Patientdata && $scope.Patientdata &&
					$scope.Patientdata.AddressLine1)
					vAddressLine1 = $scope.Patientdata.AddressLine1;


				if ($scope.Patientdata && $scope.Patientdata &&
					$scope.Patientdata.AddressLine2)
					vAddressLine2 = $scope.Patientdata.AddressLine2;

				if ($scope.Patientdata && $scope.Patientdata &&
					$scope.Patientdata.City)
					vCityTownName = $scope.Patientdata.City;

				if ($scope.Patientdata && $scope.Patientdata &&
					$scope.Patientdata.Encounters[0].DoctorName)
					vDoctor = $scope.Patientdata.Encounters[0].DoctorName;

				if ($scope.Patientdata && $scope.Patientdata &&
					$scope.Patientdata.Age)
					vAge = $scope.Patientdata.Age;

				if ($scope.Patientdata && $scope.Patientdata &&
					$scope.Patientdata.Pincode)
					vPincode = $scope.Patientdata.Pincode;


			} catch (ex) {}

			var code = '';
			var printData = []
			var printCodes = {
				new_line: '\x0A'
			};
			var code = '';
			if (window.clientcode.toLowerCase() == 'lotus') {
				code += 'I8,A,001' + printCodes.new_line;
				code += 'Q406,024' + printCodes.new_line;
				code += 'q831' + printCodes.new_line;
				code += 'rN' + printCodes.new_line;
				code += 'S3' + printCodes.new_line;
				code += 'D7' + printCodes.new_line;
				code += 'ZT' + printCodes.new_line;
				code += 'JF' + printCodes.new_line;
				code += 'O' + printCodes.new_line;
				code += 'R111,0' + printCodes.new_line;
				code += 'f100' + printCodes.new_line;
				code += 'N' + printCodes.new_line;
				code += 'A620,256,2,4,1,1,N,"' + 'MRN' + '"' + printCodes.new_line;
				code += 'A530,256,2,4,1,1,N,"' + ' :' + ' ' + vMRN + '"' + printCodes.new_line;
				code += 'A305,256,2,4,1,1,N,"' + 'Reg.Date' + '"' + printCodes.new_line;
				code += 'A186,256,2,4,1,1,N,"' + ':' + ' ' + vRegisteredDate + '"' + printCodes.new_line;
				code += 'A620,225,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
				code += 'A530,225,2,4,1,1,N,"' + ' :' + ' ' + vTitle + ' ' + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
				code += 'A620,193,2,4,1,1,N,"' + 'Address' + '"' + printCodes.new_line;
				code += 'A530,193,2,4,1,1,N,"' + ' :' + ' ' + vAddressLine1 + ',' + vAddressLine2 + '"' + printCodes.new_line;
				code += 'A620,163,2,4,1,1,N,"' + ' ' + '"' + printCodes.new_line;
				code += 'A530,163,2,4,1,1,N,"' + '  ' + vArea + ',' + vCityTownName + '"' + printCodes.new_line;
				code += 'A620,133,2,4,1,1,N,"' + 'Phone' + '"' + printCodes.new_line;
				code += 'A530,133,2,4,1,1,N,"' + ':' + ' ' + vPhoneNumber + '"' + printCodes.new_line;
				code += 'A305,133,2,4,1,1,N,"' + 'Gender' + '"' + printCodes.new_line;
				code += 'A186,133,2,4,1,1,N,"' + ':' + ' ' + vGender + '"' + printCodes.new_line;
				code += 'A90,133,2,4,1,1,N,"' + '/' + ' ' + vAge + '"' + printCodes.new_line;
				code += 'A620,98,2,4,1,1,N,"' + 'Doctor' + '"' + printCodes.new_line;
				code += 'A530,98,2,4,1,1,N,"' + ':' + ' ' + vDoctor + '"' + printCodes.new_line;
				//code += 'A624,65,2,4,1,1,N,"' + 'DOB' + '"' + printCodes.new_line;
				//code += 'A570,65,2,4,1,1,N,"' + ':' + ' ' + vDOB + '"' + printCodes.new_line;
				code += 'B520,72,2,1,4,12,40,B,"' + vMRN + '"' + printCodes.new_line;
			} else if (window.clientcode.toLowerCase() == 'sundaram') {
				code += 'I8,A,001' + printCodes.new_line;
				code += 'Q406,024' + printCodes.new_line;
				code += 'q831' + printCodes.new_line;
				code += 'rN' + printCodes.new_line;
				code += 'S3' + printCodes.new_line;
				code += 'D7' + printCodes.new_line;
				code += 'ZT' + printCodes.new_line;
				code += 'JF' + printCodes.new_line;
				code += 'O' + printCodes.new_line;
				code += 'R111,0' + printCodes.new_line;
				code += 'f100' + printCodes.new_line;
				code += 'N' + printCodes.new_line;
				code += 'A600,255,2,4,1,1,N,"' + 'MRN.NO' + '"' + printCodes.new_line;
				code += 'A420,255,2,4,1,1,N,"' + ':' + ' ' + vMRN + '"' + printCodes.new_line;
				code += 'A600,225,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
				code += 'A420,225,2,4,1,1,N,"' + ':' + ' ' + vTitle + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
				code += 'A600,197,2,4,1,1,N,"' + 'DOB / Gender' + '"' + printCodes.new_line;
				code += 'A420,197,2,4,1,1,N,"' + ':' + ' ' + vDOB + ' / ' + vGender + '"' + printCodes.new_line;
				code += 'A600,169,2,4,1,1,N,"' + 'Address' + '"' + printCodes.new_line;
				code += 'A420,169,2,4,1,1,N,"' + ':' + ' ' + vArea + ',' + vPincode + '"' + printCodes.new_line;
				code += 'A600,140,2,4,1,1,N,"' + 'Phone No' + '"' + printCodes.new_line;
				code += 'A420,140,2,4,1,1,N,"' + ':' + ' ' + vPhoneNumber + '"' + printCodes.new_line;
				//code += 'A600,140,2,4,1,1,N,"' + 'Reg.Date' + '"' + printCodes.new_line;
				//code += 'A420,141,2,4,1,1,N,"' + ':' + ' ' + vRegisteredDate + '"' + printCodes.new_line;
				code += 'A600,113,2,4,1,1,N,"' + 'Doctor' + '"' + printCodes.new_line;
				code += 'A420,113,2,4,1,1,N,"' + ':' + ' ' + vDoctor + '"' + printCodes.new_line;
				code += 'B570,82,2,1,4,12,40,B,"' + vMRN + '"' + printCodes.new_line;
			} else {
				code += 'I8,A,001' + printCodes.new_line;
				code += 'Q406,024' + printCodes.new_line;
				code += 'q831' + printCodes.new_line;
				code += 'rN' + printCodes.new_line;
				code += 'S3' + printCodes.new_line;
				code += 'D7' + printCodes.new_line;
				code += 'ZT' + printCodes.new_line;
				code += 'JF' + printCodes.new_line;
				code += 'O' + printCodes.new_line;
				code += 'R111,0' + printCodes.new_line;
				code += 'f100' + printCodes.new_line;
				code += 'N' + printCodes.new_line;
				code += 'A600,255,2,4,1,1,N,"' + 'MRN.NO' + '"' + printCodes.new_line;
				code += 'A420,255,2,4,1,1,N,"' + ':' + ' ' + vMRN + '"' + printCodes.new_line;
				code += 'A600,225,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
				code += 'A420,226,2,4,1,1,N,"' + ':' + ' ' + vTitle + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
				code += 'A600,197,2,4,1,1,N,"' + 'Address' + '"' + printCodes.new_line;
				code += 'A420,198,2,4,1,1,N,"' + ':' + ' ' + vArea + ',' + vPincode + '"' + printCodes.new_line;
				code += 'A600,169,2,4,1,1,N,"' + 'Phone No' + '"' + printCodes.new_line;
				code += 'A420,169,2,4,1,1,N,"' + ':' + ' ' + vPhoneNumber + '"' + printCodes.new_line;
				code += 'A600,140,2,4,1,1,N,"' + 'Reg.Date' + '"' + printCodes.new_line;
				code += 'A420,141,2,4,1,1,N,"' + ':' + ' ' + vRegisteredDate + '"' + printCodes.new_line;
				code += 'A600,113,2,4,1,1,N,"' + 'Gender/Age' + '"' + printCodes.new_line;
				code += 'A420,113,2,4,1,1,N,"' + ':' + ' ' + vGender + ' /' + vAge + ' /' + vDOB + '"' + printCodes.new_line;
				code += 'B570,82,2,1,4,12,40,B,"' + vMRN + '"' + printCodes.new_line;
			}
			code += noofprint > 1 ? 'P' + noofprint + printCodes.new_line : 'P1' + printCodes.new_line;


			printData.push(code);
			$scope.printRaw(printData);
		} catch (ex) {
			console.log(ex);
		}
	};

	$scope.printRegistration = function () {
		var inputData = {
			Id: $scope.item.PatientId,
			Data: {
				EncounterId: $scope.item.EncounterId
			}
		};
		var options = {
			action: 'registration/Patient/PrintPatientWithEncounter',
			data: inputData,
			type: 'post'
		};
		utl.Http.doDownload(options);
	};

	$scope.printRegistrationIdlabel = function () {
		if (window.renderReactBarcodeModal && $scope.item) {
			var genderStr = typeof $scope.item.Gender === 'object' ? ($scope.item.Gender.Description || $scope.item.Gender.Text || '') : ($scope.item.Gender || '');
			var titleStr = typeof $scope.item.Title === 'object' ? ($scope.item.Title.Description || $scope.item.Title.Text || '') : ($scope.item.Title || '');
			window.renderReactBarcodeModal({
				data: {
					mrn: $scope.item.MRN || '',
					title: titleStr,
					firstName: $scope.item.FirstName || '',
					lastName: $scope.item.LastName || '',
					gender: genderStr,
					age: $scope.item.Age ? String($scope.item.Age) : '',
					dob: $scope.item.DOB || '',
					mobile: $scope.item.Mobile || '',
					visitDate: $scope.item.RegisteredDate ? utl.Formatter.getDateTimeString($scope.item.RegisteredDate) : '',
					facilityName: ($rootScope.currentFacility && $rootScope.currentFacility.FacilityName) || 'SHUVADARSINI HOSPITAL',
					address: $scope.item.AddressLine1 || ''
				},
				onRawPrint: function() {
					var inputData = {
						Id: $scope.item.PatientId,
						Data: true
					};
					var options = {
						action: 'registration/Patient/PrintPatientLabel',
						data: inputData,
						type: 'post'
					};
					utl.Http.doDownload(options);
				}
			});
			return;
		}

		var inputData = {
			Id: $scope.item.PatientId,
			Data: true
		};
		var options = {
			action: 'registration/Patient/PrintPatientLabel',
			data: inputData,
			type: 'post'
		};
		utl.Http.doDownload(options);
	};

	$scope.downloadFileCallback = function (scope, data, options, hasError) {
		console.log('Successfully downloaded....');
	};

	$scope.printRegistrationIdCard = function () {
		var inputData = {
			Id: $scope.item.PatientId,
			Data: true
		};
		var options = {
			action: 'registration/Patient/PrintPatientLabel',
			data: inputData,
			type: 'post',
			onComplete: $scope.downloadFileCallback
		};
		utl.Http.doDownload(options);
	};

	$scope.printVisitSlip = function () {
		if ($scope.AppointmentId) {
			var inputData = {
				Id: $scope.AppointmentId
			};
			var options = {
				action: 'appointment/Appointment/PrintAppointment',
				data: inputData,
				type: 'post',
				// onComplete:$scope.backToList
			};
			utl.Http.doDownload(options);
		}
	};
	/* Print Coding - End  */

			var cmpObj = {
				refresh: function () {
					cvm.getPatientById();
				}
			}
			

			cvm.delegatefn({
				cmp: cmpObj
			});
			//Code to reload the banner ends

			cvm.getPatientByIdCallback = function (scope, data, options, hasError) {

				cvm.patientinfo.Id = data.Id;
				cvm.patientinfo.MRN = data.MRN;
				cvm.patientinfo.Title = data.Title ? data.Title.Description : null;
				cvm.patientinfo.FirstName = data.FirstName;
				cvm.patientinfo.MiddleName = data.MiddleName;
				cvm.patientinfo.LastName = data.LastName;
				cvm.patientinfo.Age = data.Age;
				cvm.patientinfo.DOB = data.DOB;
				cvm.patientinfo.Gender = data.Gender ? data.Gender.Description : null;
				cvm.patientinfo.PatientName = '';

				if (cvm.patientinfo.Title) {
					cvm.patientinfo.PatientName = cvm.patientinfo.Title + ' ';
				}
				cvm.patientinfo.PatientName = cvm.patientinfo.PatientName + cvm.patientinfo.FirstName;
				if (cvm.patientinfo.LastName) {
					cvm.patientinfo.PatientName = cvm.patientinfo.PatientName + ' ' + cvm.patientinfo.LastName;
				}

				if (data.Age && data.Age != null) {
					cvm.patientinfo.Age = (data.Age > 1) ? data.Age + " Y" : data.Age + " M";
				}

				cvm.patientinfo.PatientStatus = data.PatientStatus.Description;
			}

			cvm.getPatientById = function () {
				if (cvm.patientid > 0) {
					var options = {
						action: 'registration/patient/GetPatientById',
						data: {
							Id: cvm.patientid
						},
						type: 'post',
						onComplete: cvm.getPatientByIdCallback
					};

					utl.Http.doAction(options);
				}
			}

			cvm.init = function () {}

			cvm.patientprofile = function () {
				utl.Modal.open('registration.patientprofile', {
					params: {
						pid: cvm.patientid
					}
				});
			}

			//caution : base method, please don't modifiy
			cvm.$onInit = function () {
				$timeout(cvm.init, 100);
			}
		}])
		.component('regpatientbanner', {
			bindings: {
				patientid: "=",
				delegatefn: "&"
			},
			controller: 'regpatientbannerCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/regpatientbanner.html'
		})

})();