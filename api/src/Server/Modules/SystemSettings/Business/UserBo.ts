import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { Request } from '../../../Core/Index';
import { BaseBo, IOptionProvider, MapBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, Template } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ISearchEnums, ApiResponse } from '../../../Common/Index';
import { UserInstance, UserAttributes } from '../Model/Interface/Index';
import { UserFilters, ReferenceValueFilters } from '../Common/Filters.e';
import { readFileSync, writeFileSync } from 'fs';
import { AppConfig } from '../../../../config/index';
import { BoFactory } from '../../Base/Business/Index';
import * as appMgrBO from '../../SystemSettings/Business/Index';
import * as regBO from '../../Registration/Business/Index';
import { join } from 'path';
import * as genMasbo from '../../GeneralMaster/Business/Index';
import { SequenceKeys } from '../../General/Common/Sequence.s';
export class UserBo extends BaseBo<UserInstance, UserAttributes> implements IOptionProvider {
protected UserCategoryMapBO: appMgrBO.UserCategoryMapBo;
public constructor(req?: Request) {
super(req);
this.UserCategoryMapBO = BoFactory.GetBo(appMgrBO.UserCategoryMapBo, req);
}
public async AddUser(req: BaseRequest): Promise<number> {
let file = this.Request.file;
if (file) {
req.Data.PhotoPath = file.path;
}
if (req.Data.iswebcamphoto === true || req.Data.iswebcamphoto === 'true') {
let base64String = req.Data.webcamphoto;
let datetimestamp = Date.now();
let filePath = AppConfig.UploadFilePath + '/' + req.Data.FirstName + '-' + datetimestamp + '.png';
await writeFileSync(filePath, new Buffer(base64String, 'base64'));
req.Data.PhotoPath = filePath;
}
//sign data code starts
if (req.Data.signdata && req.Data.signdata !== '') {
let datetimestamp = Date.now();
let signFilePath = AppConfig.UploadFilePath + '/' + req.Data.FirstName + '-sign-' + datetimestamp + '.png';
await writeFileSync(signFilePath, new Buffer(req.Data.signdata, 'base64'));
req.Data.SignPath = signFilePath;
}
//sign data code ends
//Handling for json 'null' value while save user with file upload
for (var idx in req.Data) {
var strValue = req.Data[idx];
if (strValue === 'null') {
req.Data[idx] = null;
}
}
this.HandleActiveState(req.Data);
//Assign PatientPortal Group id for the patient user
if (req.Data.GroupCode === 'PATIENTPORTAL') {
let groupbo = BoFactory.GetBo(appMgrBO.GroupBo, this.Request);
let groupInstance: any = await groupbo.Find({
where: { GroupCode: req.Data.GroupCode }
});
if (groupInstance) {
let group = this.GetAttribute(groupInstance);
req.Data.UserGroupId = group.Id;
}
}
let result = await this.Save(req.Data);
if (result && req.Data.Staff) {
await this.GetIsStaffPatients(req, result.dataValues.Id);
}
let apiDeptReq = { // New User - primary dept. map to deptmap table.
Id: 0,
Data: [{ 'UserId': result.dataValues.Id, 'DepartmentId': req.Data.DepartmentId }]
};
await this.MapDeparments(apiDeptReq);
let apiFacilityReq = { // New User - primary Facility. map to facilitymap table.
Id: 0,
Data: [{ 'UserId': result.dataValues.Id, 'FacilityId': req.Data.FacilityId }]
};
await this.MapFacilities(apiFacilityReq);
let apiCtgryReq = { // New User - primary dept. map to deptmap table.
Id: 0,
Data: [{ 'UserId': result.dataValues.Id, 'CategoryId': req.Data.VirtualCategoryId }]
};
await this.MapCategory(apiCtgryReq);
return result.dataValues.Id;
}
public async AddUserDoctorMasterExcel(req: BaseRequest): Promise<any> {
let details: UserAttributes[] = req.Data || [];
// const masterIds: number[] = [];
await Promise.all(details.map(async (DetailItem: UserAttributes) => {
try {
await this.Save(DetailItem);
// if (result) {
//     let MasterId = result.dataValues.Id;
//     masterIds.push(MasterId);
// }
} catch (error) {
console.error('Error saving detail:', DetailItem, error);
}
}));
return true;
}
public async AddSelfUser(req: BaseRequest): Promise<any> {
if (await this.IsAlreadyExist(req) <= -1) return -1;
let file = this.Request.file;
if (file) {
req.Data.Header.PhotoPath = file.path;
}
if (req.Data.Header.iswebcamphoto === true || req.Data.Header.iswebcamphoto === 'true') {
let base64String = req.Data.Header.webcamphoto;
let datetimestamp = Date.now();
let filePath = AppConfig.UploadFilePath + '/' + req.Data.Header.FirstName + '-' + datetimestamp + '.png';
await writeFileSync(filePath, new Buffer(base64String, 'base64'));
req.Data.Header.PhotoPath = filePath;
}
//Handling for json 'null' value while save user with file upload
for (var idx in req.Data.Header) {
var strValue = req.Data.Header[idx];
if (strValue === 'null') {
req.Data.Header[idx] = null;
}
}
this.HandleActiveState(req.Data.Header);
if (req.Data.Header.GroupCode === 'PATIENTPORTAL') {
let groupbo = BoFactory.GetBo(appMgrBO.GroupBo, this.Request);
let groupInstance: any = await groupbo.Find({
where: { GroupCode: req.Data.Header.GroupCode }
});
if (groupInstance) {
let group = this.GetAttribute(groupInstance);
req.Data.Header.UserGroupId = group.Id;
}
}
let result = await this.Save(req.Data.Header);
let apiDeptReq = { // New User - primary dept. map to deptmap table.
Id: 0,
Data: [{ 'UserId': result.dataValues.Id, 'DepartmentId': req.Data.Header.DepartmentId }]
};
await this.MapDeparments(apiDeptReq);
let apiFacilityReq = { // New User - primary Facility. map to facilitymap table.
Id: 0,
Data: [{ 'UserId': result.dataValues.Id, 'FacilityId': req.Data.Header.FacilityId }]
};
await this.MapFacilities(apiFacilityReq);
let apiCtgryReq = { // New User - primary dept. map to deptmap table.
Id: 0,
Data: [{ 'UserId': result.dataValues.Id, 'CategoryId': req.Data.Header.VirtualCategoryId }]
};
await this.MapCategory(apiCtgryReq);
let userid = result.dataValues.Id;
let DefServices: any = {
Data: []
};
for (let idx in req.Data.Details) {
let dser = req.Data.Details[idx];
dser.UserId = userid;
DefServices.Data.push(dser);
}
let userDefBO = BoFactory.GetBo(appMgrBO.UserDefaultServiceBo, this.Request);
await userDefBO.ManageUserDefaultService(DefServices);
return userid;
}
public async UpdateSelfUser(req: BaseRequest): Promise<boolean> {
if (req.Data.UploadedFile === 'Photo') {
let PhotoFile = this.Request.file;
if (PhotoFile) {
let filepath: string = PhotoFile.path;
req.Data.PhotoPath = filepath;
}
} else if (req.Data.UploadedFile === 'IDProof') {
let IDProofFile = this.Request.file;
if (IDProofFile) {
let filepath: string = IDProofFile.path;
req.Data.IDProof = filepath;
}
} else if (req.Data.UploadedFile === 'MedRegProof') {
let MedRegProofFile = this.Request.file;
if (MedRegProofFile) {
let filepath: string = MedRegProofFile.path;
req.Data.MedRegProof = filepath;
}
} else if (req.Data.UploadedFile === 'Signature') {
let SignatureFile = this.Request.file;
if (SignatureFile) {
let filepath: string = SignatureFile.path;
req.Data.SignPath = filepath;
}
} else if (req.Data.UploadedFile === 'PanCert') {
let PanCertFile = this.Request.file;
if (PanCertFile) {
let filepath: string = PanCertFile.path;
req.Data.PanCertPath = filepath;
}
} else {
let file = this.Request.file;
if (file) {
req.Data.PhotoPath = file.path;
}
}
let result = await this.Update(req.Data);
if (req.Data.ActiveStatusId === 2) {
await this.UserApproveSms(req);
}
if (req.Data.ActiveStatusId === 3) {
await this.UserRejectSms(req);
}
return result;
}
public async UserApproveSms(req: any) {
let smsProvider = this.GetSmsProvider();
let eventTemplateBO = BoFactory.GetBo(appMgrBO.EventTemplateBo, this.Request);
let smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('ProviderApprove', 'ProviderApprove', 1);
let vUser = '';
let smsmodel: any = {};
if (req.Data.FirstName) vUser += req.Data.FirstName;
if (req.Data.LastName) vUser += ' ' + req.Data.LastName;
let apiReqTitle = {
Id: 0,
PageContext: { PageSize: 50, PageNumber: 1 },
Params: [
{ Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Title' },
{ Key: ReferenceValueFilters.ReferenceValueCodeId, Value: req.Data.TitleId }
]
};
let vTitleName = '';
let refTitleBo = BoFactory.GetBo(appMgrBO.ReferenceValueBo, this.Request);
let TitleData = await refTitleBo.GetReferenceValues(apiReqTitle);
if (TitleData && TitleData.Data && TitleData.Data.length > 0) {
if (TitleData.Data[0].Description)
vTitleName = TitleData.Data[0].Description;
}
if (vTitleName)
vUser = vTitleName + '.' + vUser;
if (smsTemplateInfo) {
smsmodel = {
numbers: [req.Data.Mobile],
message: Template.Compile(smsTemplateInfo.TemplateContent,
{
user: vUser,
})
};
if (smsProvider) {
let SMSStatus = await smsProvider.send(smsmodel);
let eventDashboardOutboundBo = BoFactory.GetBo(appMgrBO.EventDashboardBo, this.Request);
await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + req.Data.Mobile);
}
}
let alertBO = BoFactory.GetBo(genMasbo.PatientAlertBo, this.Request);
let alertData: any = {
Data: {
Id: 0,
PatientId: req.Data.Id,
AlertDescription: smsmodel.message,
OnsetDate: new Date(),
Status: 1
}
};
await alertBO.AddPatientAlert(alertData);
}
public async UserRejectSms(req: any) {
let smsProvider = this.GetSmsProvider();
let eventTemplateBO = BoFactory.GetBo(appMgrBO.EventTemplateBo, this.Request);
let smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('ProviderReject', 'ProviderReject', 1);
let vUser = '';
let smsmodel: any = {};
if (req.Data.FirstName) vUser += req.Data.FirstName;
if (req.Data.LastName) vUser += ' ' + req.Data.LastName;
let apiReqTitle = {
Id: 0,
PageContext: { PageSize: 50, PageNumber: 1 },
Params: [
{ Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Title' },
{ Key: ReferenceValueFilters.ReferenceValueCodeId, Value: req.Data.TitleId }
]
};
let vTitleName = '';
let refTitleBo = BoFactory.GetBo(appMgrBO.ReferenceValueBo, this.Request);
let TitleData = await refTitleBo.GetReferenceValues(apiReqTitle);
if (TitleData && TitleData.Data && TitleData.Data.length > 0) {
if (TitleData.Data[0].Description)
vTitleName = TitleData.Data[0].Description;
}
if (vTitleName)
vUser = vTitleName + '.' + vUser;
if (smsTemplateInfo) {
smsmodel = {
numbers: [req.Data.Mobile],
message: Template.Compile(smsTemplateInfo.TemplateContent,
{
user: vUser,
rejectReason: req.Data.RejectReason
})
};
if (smsProvider) {
let SMSStatus = await smsProvider.send(smsmodel);
let eventDashboardOutboundBo = BoFactory.GetBo(appMgrBO.EventDashboardBo, this.Request);
await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + req.Data.Mobile);
}
}
let alertBO = BoFactory.GetBo(genMasbo.PatientAlertBo, this.Request);
let alertData: any = {
Data: {
Id: 0,
PatientId: req.Data.Id,
AlertDescription: smsmodel.message,
OnsetDate: new Date(),
Status: 1
}
};
await alertBO.AddPatientAlert(alertData);
}
public async UpdateOtp(req: BaseRequest): Promise<boolean> {
let firstLetter = req.Data.FirstName.charAt(0);
let secLetterCap = req.Data.FirstName.charAt(1);
let secLetter = secLetterCap.toLowerCase();
let digits = req.Data.Mobile;
let PWD = '';
for (let i = 0; i < 5; i++) {
PWD += digits[Math.floor(Math.random() * 10)];
}
req.Data.Password = firstLetter + secLetter + '@' + PWD;
let result = await this.Update(req.Data);
// this.deferSequenceKey(req.Data.Id, 'UserName',
//     this.getSequenceIdentifier(SequenceKeys.UserId));
let userId = req.Data.Id;
let generateUserno: string = null;
await this.ProcessUserIdGeneration(generateUserno, req, userId);
return result;
}
public async UpdateUser(req: BaseRequest): Promise<boolean> {
let file = this.Request.file;
if (file) {
req.Data.PhotoPath = file.path;
}
//sign data code starts
if (req.Data.signdata && req.Data.signdata !== '') {
let datetimestamp = Date.now();
let signFilePath = AppConfig.UploadFilePath + '/' + req.Data.FirstName + '-sign-' + datetimestamp + '.png';
await writeFileSync(signFilePath, new Buffer(req.Data.signdata, 'base64'));
req.Data.SignPath = signFilePath;
}
//sign data code ends
//Handling for json 'null' value while save user with file upload
for (var idx in req.Data) {
var strValue = req.Data[idx];
if (strValue === 'null') {
req.Data[idx] = null;
}
}
this.HandleActiveState(req.Data);
let result = await this.Update(req.Data);
if (req.Data.Id) {
let userData = await this.GetUserById({ Id: req.Data.Id });
if (userData.PatientId > 0) {
const updateData: any = {
Id: userData.PatientId,
NotificationToken: (userData.NotificationToken) ? userData.NotificationToken : ''
};
let PatientBO = BoFactory.GetBo(regBO.PatientBo, this.Request);
await PatientBO.Update(updateData);
}
}
if (result && req.Data.Staff) {
await this.GetIsStaffPatients(req, req.Data.Id);
}
return result;
}
public async GetUserProfilePic(req: BaseRequest): Promise<any> {
let fileBuff = await readFileSync(req.Data.PhotoPath);
let photoBase64 = new Buffer(fileBuff).toString('base64');
return { Id: req.Data.Id, Photo: photoBase64 };
// let result = await readFileSync(req.Data.PhotoPath);
// return new Buffer(result).toString('base64');
}
public async GetIsStaffPatients(req: BaseRequest, userid: number): Promise<any> {
if (req && req.Data && userid) {
let userreq = { Id: userid };
let userData = await this.GetUserById(userreq);
let UserStaffData: any = {
Data: {
UserId: userData.Id,
TitleId: userData.TitleId,
FirstName: userData.FirstName,
MiddleName: userData.MiddleName,
LastName: userData.LastName,
Age: userData.Age,
DOB: userData.DOB,
NationalityId: userData.NationalityId,
AddressLine1: userData.AddressLine1,
AddressLine2: userData.AddressLine2,
Pincode: userData.Pincode,
Area: userData.Area,
City: userData.City,
State: userData.State,
Country: userData.Country,
LandLine: userData.LandLine,
Mobile: userData.Mobile,
Email: userData.Email,
FacilityId: userData.FacilityId,
GenderId: userData.GenderId,
PinCodeId: userData.PinCodeId,
CityId: userData.CityId,
CountryId: userData.CountryId,
StateId: userData.StateId,
PatientStatusId: 2,
Staff: userData.Staff,
MRNTypeId: 2,
PatientStatus: 'Active'
}
};
let PatientBO = BoFactory.GetBo(regBO.PatientBo, this.Request);
await PatientBO.AddPatientFromUser(UserStaffData);
}
}
public async UpdateUserStaffBills(req: BaseRequest): Promise<boolean> {
let result = await this.Update(req.Data);
return result;
}
public async GetUserSignPic(req: BaseRequest): Promise<any> {
let result = await readFileSync(req.Data.SignPath);
return new Buffer(result).toString('base64');
}
public async ChangePassword(req: BaseRequest): Promise<boolean> {
let inputData = req.Data;
let result: boolean = false;
let userId = parseInt(inputData.UserId);
let userInstance: any = await this.GetById(userId);
if (userInstance) {
let userObj = this.GetAttribute(userInstance);
if (userObj.Password !== inputData.OldPassword) {
throw { code: 'OLD_PASSWORD_INCORRECT' };
}
userObj.Password = inputData.NewPassword;
result = await this.Update(userObj);
}
return result;
}
public async ChangePasswordNoSession(req: BaseRequest): Promise<boolean> {
let inputData = req.Data;
let result: boolean = false;
// let userId = parseInt(inputData.UserId);
// let userInstance: any = await this.GetById(userId);
let userReq = {
Id: 0,
PageContext: { PageSize: -1, PageNumber: 1 },
Params: [
//{ Key: UserFilters.Facility, Value: req.Data.FacilityId },
{ Key: UserFilters.UserName, Value: inputData.UserId },
]
};
let userList = await this.GetUsers(userReq);
console.log('********');
console.log(userList.Data);
if (userList.Data.length === 0) {
throw { code: 'Invalid UserName' };
} else {
let userObj = userList.Data[0];
const updateData: any = {
Id: userObj.Id,
Password: inputData.NewPassword
};
result = await this.UpdatewithoutSession(updateData);
}
if (result) {
await this.SendUserPwdChangeNoSession(req);
}
return result;
}
public async SendUserPwdChangeNoSession(req: BaseRequest): Promise<any> {
let smsProvider = this.GetSmsProvider();
let eventTemplateBO = BoFactory.GetBo(appMgrBO.EventTemplateBo, this.Request);
let smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('PwdChange', 'PwdChange', 1);
let vUser = '';
if (req.Data.FirstName) vUser += req.Data.FirstName;
if (req.Data.LastName) vUser += ' ' + req.Data.LastName;
let vTitleName = '';
if (req.Data.TitleId) {
let apiReqTitle = {
Id: 0,
PageContext: { PageSize: 50, PageNumber: 1 },
Params: [
{ Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Title' },
{ Key: ReferenceValueFilters.ReferenceValueCodeId, Value: req.Data.TitleId }
]
};
let refTitleBo = BoFactory.GetBo(appMgrBO.ReferenceValueBo, this.Request);
let TitleData = await refTitleBo.GetReferenceValues(apiReqTitle);
if (TitleData && TitleData.Data && TitleData.Data.length > 0) {
if (TitleData.Data[0].Description)
vTitleName = TitleData.Data[0].Description;
}
}
if (vTitleName)
vUser = vTitleName + '.' + vUser;
if (smsTemplateInfo) {
let smsmodel = {
numbers: [req.Data.Mobile],
message: Template.Compile(smsTemplateInfo.TemplateContent,
{
userName: vUser,
})
};
if (smsProvider) {
let SMSStatus = await smsProvider.send(smsmodel);
let eventDashboardOutboundBo = BoFactory.GetBo(appMgrBO.EventDashboardBo, this.Request);
await eventDashboardOutboundBo.ManageSMSOutBoundWithoutSession(SMSStatus, smsmodel.message + ' To : ' +
req.Data.Mobile);
}
}
return true;
}
public async ChangeSecurityPin(req: BaseRequest): Promise<boolean> {
let inputData = req.Data;
let result: boolean = false;
let userId = parseInt(inputData.UserId);
let userInstance: any = await this.GetById(userId);
if (userInstance) {
let userObj = this.GetAttribute(userInstance);
if (userObj.SecurityPin !== inputData.OldSecurityPin) {
throw { code: 'OLD_SECURITY_PIN_INCORRECT' };
}
userObj.SecurityPin = inputData.NewSecurityPin;
result = await this.Update(userObj);
}
return result;
}
public async SendUserNameSms(req: BaseRequest): Promise<any> {
let smsProvider = this.GetSmsProvider();
let eventTemplateBO = BoFactory.GetBo(appMgrBO.EventTemplateBo, this.Request);
let smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('ForgotUserName', 'ForgotUserName', 1);
if (smsTemplateInfo) {
let smsmodel = {
numbers: [req.Data.Mobile],
message: Template.Compile(smsTemplateInfo.TemplateContent,
{
userName: req.Data.UserName,
})
};
if (smsProvider) {
let SMSStatus = await smsProvider.send(smsmodel);
let eventDashboardOutboundBo = BoFactory.GetBo(appMgrBO.EventDashboardBo, this.Request);
await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' +
req.Data.Mobile);
}
}
return true;
}
public async GetUserById(req: BaseRequest): Promise<UserAttributes> {
let result = await this.GetById(req.Id);
return this.GetAttribute(result);
}
public async GetViewDetails(req: BaseRequest): Promise<any> {
// let datas: any = await this.Dal.query('SELECT "PatientBillId" FROM ipfinalbilldetails WHERE "Cars"."ownerId" = ?', {
//     replacements: ['active'], type: this.Dal.QueryTypes.SELECT
//   });
let datas: any = await this.Dal.query('SELECT * FROM mis_depatment_wise_count', {
replacements: ['active'], type: this.Dal.QueryTypes.SELECT
});
console.log(datas);
//   fs.writeFileSync(serviceDestPath + 'json.json', JSON.stringify(tables));
//         fs.writeFileSync(serviceDestPath + data.name, result);
//   fs.writeFile(AppConfig.UploadExternalFilePath + expfilename,
//     jsontoxml(MyData
//         , { escape: true, removeIllegalNameCharacters: true, prettyPrint: true, xmlHeader: true }));
let fs = require('fs');
fs.writeFile('output.json', JSON.stringify(datas), 'utf8', function (err: any) {
if (err) {
console.log('An error occured while writing JSON Object to File.');
return console.log(err);
}
console.log('JSON file has been saved.');
});
return 1;
}
public async getUserAndSendSms(req: BaseRequest): Promise<any> {
let getUsersList: any = await this.Find({
where: {
Mobile: req.Data.Mobile,
DOB: { [Op.between]: req.Data.DOB || '' }
}
});
if (getUsersList) {
let smsProvider = this.GetSmsProvider();
let eventTemplateBO = BoFactory.GetBo(appMgrBO.EventTemplateBo, this.Request);
let smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('ForgotUserName', 'ForgotUserName', 1);
if (smsTemplateInfo) {
let smsmodel = {
numbers: [req.Data.Mobile],
message: Template.Compile(smsTemplateInfo.TemplateContent,
{
userName: getUsersList.UserName,
})
};
if (smsProvider) {
let SMSStatus = await smsProvider.send(smsmodel);
let eventDashboardOutboundBo = BoFactory.GetBo(appMgrBO.EventDashboardBo, this.Request);
await eventDashboardOutboundBo.ManageSMSOutBoundWithoutSession(SMSStatus, smsmodel.message + ' To : ' +
req.Data.Mobile);
}
}
return true;
}
return false;
}
public async GetUsers(apiReq?: ApiRequest<UserFilters>): Promise<ApiResponse<UserAttributes[]>> {
let where: WhereOptions<any> = {};
let DepartmentWhere: WhereOptions<any> = {};
let isReqDepartmentSearch: boolean = false;
let include: Array<IncludeOptions> = [];
include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
include.push({ model: this.Models.Organization, attributes: ['OrgName'], required: false });
include.push({ model: this.Models.GstMaster, attributes: ['GstCode', 'GstName', 'GstPercentage'], required: false });
include.push({ model: this.Models.Speciality, attributes: ['SpecialityName'], required: false });
include.push({ model: this.Models.Group, attributes: ['GroupName'], required: false });
include.push({ model: this.Models.Department, as: 'UserDept', attributes: ['DepartmentName'], required: false });
include.push({ model: this.Models.Department, as: 'SubDepartment', attributes: ['DepartmentName'], required: false });
include.push({
model: this.Models.VirtualCategory,
attributes: ['CategoryCode', 'CategoryName', 'CategoryDescription'], required: false
});
include.push({
model: this.Models.VirtualSubCategory,
attributes: ['SubCategoryCode', 'SubCategoryName', 'SubCategoryDescription'], required: false
});
// include.push({
//     model: this.Models.Employee, required: false,
//     include: [this.GetReference('Title'), this.GetReference('Position')]
// });
include.push(this.GetReference('DoctorClass'));
include.push(this.GetReference('Title'));
include.push(this.GetReference('UserType'));
include.push(this.GetReference('ClinicalRole'));
include.push(this.GetReference('OPDRoom'));
include.push(this.GetReference('ActiveStatus'));
include.push(this.GetReference('Gender'));
include.push(this.GetReference('DoctorShareClass'));
include.push(this.GetReference('DiscountMode'));
include.push(this.GetReference('QmsLocation'));
apiReq.Params.forEach((filterParam) => {
if (this.IsValidParam(filterParam)) {
switch (filterParam.Key) {
case UserFilters.Id:
where['Id'] = filterParam.Value;
break;
case UserFilters.Name:
where = {
...where,
[Op.or]: [
{ FirstName: { [Op.like]: '%' + (filterParam.Value || '') + '%' } },
{ LastName: { [Op.like]: '%' + (filterParam.Value || '') + '%' } },
{ UserName: { [Op.like]: '%' + (filterParam.Value || '') + '%' } }
]
};
break;
case UserFilters.Facility:
where['FacilityId'] = filterParam.Value;
break;
case UserFilters.UserType:
where['UserTypeId'] = filterParam.Value;
break;
case UserFilters.Group:
where['UserGroupId'] = filterParam.Value;
break;
case UserFilters.ActiveStatus:
where['ActiveStatusId'] = filterParam.Value;
break;
case UserFilters.NotPatient:
where = {
...where,
[Op.not]: { UserTypeId: filterParam.Value }
};
break;
case UserFilters.Department:
where['DepartmentId'] = filterParam.Value;
break;
case UserFilters.DepartmentCode:
include.push({
model: this.Models.Department,
as: 'Departments',
where: { DepartmentCode: filterParam.Value }
});
break;
case UserFilters.IsPrivate:
where['IsPrivate'] = filterParam.Value;
break;
case UserFilters.IsHome:
where['IsHome'] = filterParam.Value;
break;
case UserFilters.IsActive:
where['IsActive'] = filterParam.Value;
break;
case UserFilters.IsDiscount:
where['IsDiscount'] = filterParam.Value;
break;
case UserFilters.IsPeadiatrician:
where['IsPeadiatrician'] = filterParam.Value;
break;
case UserFilters.IsAnaesthisist:
where['IsAnaesthisist'] = filterParam.Value;
break;
case UserFilters.IsSurgeon:
where['IsSurgeon'] = filterParam.Value;
break;
case UserFilters.EmployeeId:
//where['EmployeeId'] = filterParam.Value;
break;
case UserFilters.SubDepartmentId:
where['SubDepartmentId'] = filterParam.Value;
break;
case UserFilters.IsAssetDept:
DepartmentWhere['IsAssetDept'] = filterParam.Value;
isReqDepartmentSearch = true;
break;
case UserFilters.SecurityPin:
where['SecurityPin'] = filterParam.Value;
break;
case UserFilters.IsPatientPortalDoctor:
where['IsPatientPortalDoctor'] = filterParam.Value;
break;
case UserFilters.PatientUserType:
where['UserTypeId'] = { [Op.ne]: filterParam.Value };
break;
case UserFilters.Staff:
where['Staff'] = filterParam.Value;
break;
case UserFilters.IsVirtualUsers:
where['IsVirtualUsers'] = filterParam.Value;
break;
case UserFilters.VirtualCategoryId:
where['VirtualCategoryId'] = filterParam.Value;
break;
case UserFilters.VirtualSubCategoryId:
where['VirtualSubCategoryId'] = filterParam.Value;
break;
case UserFilters.PatientId:
where['PatientId'] = filterParam.Value;
break;
case UserFilters.GenderId:
where['GenderId'] = filterParam.Value;
break;
case UserFilters.EmergencyUsers:
include.push({
model: this.Models.Department,
as: 'UserDept',
where: { IsEmergency: filterParam.Value }
});
break;
case UserFilters.UserName:
where['UserName'] = filterParam.Value;
break;
case UserFilters.Mobile:
where['Mobile'] = filterParam.Value;
break;
case UserFilters.DOB:
where['DOB'] = { [Op.between]: filterParam.Value || '' };
break;
case UserFilters.TeamId:
where['TeamId'] = filterParam.Value;
break;
case UserFilters.UserFacility:
// where['$or'] = [{'FacilityId': this.Session.FacilityId}];
if (filterParam.Value) {
let paramArr: Array<number> = [];
if (filterParam.Value.toString().indexOf(',') > -1) {
paramArr = filterParam.Value.toString().split(',');
} else {
paramArr = [filterParam.Value];
}
include.push({
model: this.Models.UserFacilityMap,
where: { FacilityId: { [Op.in]: paramArr } },
// required: false
});
// facilityWhere['$or']
}
break;
case UserFilters.IsExcelUpload:
where['IsExcelUpload'] = filterParam.Value;
break;
default:
throw 'Not Implemented';
}
}
});
include.push({
model: this.Models.Department, as: 'Department',
required: false,
where: DepartmentWhere,
});
return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
}
public async GetUserswithAppointments(apiReq?: ApiRequest<UserFilters>): Promise<ApiResponse<UserAttributes[]>> {
let where: WhereOptions<any> = {};
let DepartmentWhere: WhereOptions<any> = {};
let isReqDepartmentSearch: boolean = false;
let include: Array<IncludeOptions> = [];
include.push({ model: this.Models.AppointmentMultiSession, as: 'AppointmentSessions' });
include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
include.push({ model: this.Models.Organization, attributes: ['OrgName'], required: false });
include.push({ model: this.Models.GstMaster, attributes: ['GstCode', 'GstName', 'GstPercentage'], required: false });
include.push({ model: this.Models.Speciality, attributes: ['SpecialityName'], required: false });
include.push({ model: this.Models.Group, attributes: ['GroupName'], required: false });
include.push({ model: this.Models.Department, as: 'UserDept', attributes: ['DepartmentName'], required: false });
include.push({ model: this.Models.Department, as: 'SubDepartment', attributes: ['DepartmentName'], required: false });
include.push({
model: this.Models.VirtualCategory,
attributes: ['CategoryCode', 'CategoryName', 'CategoryDescription'], required: false
});
include.push({
model: this.Models.VirtualSubCategory,
attributes: ['SubCategoryCode', 'SubCategoryName', 'SubCategoryDescription'], required: false
});
// include.push({
//     model: this.Models.Employee, required: false,
//     include: [this.GetReference('Title'), this.GetReference('Position')]
// });
include.push(this.GetReference('DoctorClass'));
include.push(this.GetReference('Title'));
include.push(this.GetReference('UserType'));
include.push(this.GetReference('ClinicalRole'));
include.push(this.GetReference('OPDRoom'));
include.push(this.GetReference('ActiveStatus'));
include.push(this.GetReference('Gender'));
include.push(this.GetReference('DoctorShareClass'));
include.push(this.GetReference('DiscountMode'));
include.push(this.GetReference('QmsLocation'));
apiReq.Params.forEach((filterParam) => {
if (this.IsValidParam(filterParam)) {
switch (filterParam.Key) {
case UserFilters.Id:
where['Id'] = filterParam.Value;
break;
case UserFilters.Name:
where = {
...where,
[Op.or]: [
{ FirstName: { [Op.like]: '%' + (filterParam.Value || '') + '%' } },
{ LastName: { [Op.like]: '%' + (filterParam.Value || '') + '%' } },
{ UserName: { [Op.like]: '%' + (filterParam.Value || '') + '%' } }
]
};
break;
case UserFilters.Facility:
where['FacilityId'] = filterParam.Value;
break;
case UserFilters.UserType:
where['UserTypeId'] = filterParam.Value;
break;
case UserFilters.Group:
where['UserGroupId'] = filterParam.Value;
break;
case UserFilters.ActiveStatus:
where['ActiveStatusId'] = filterParam.Value;
break;
case UserFilters.IsHome:
where['IsHome'] = filterParam.Value;
break;
case UserFilters.IsActive:
where['IsActive'] = filterParam.Value;
break;
case UserFilters.Department:
where['DepartmentId'] = filterParam.Value;
break;
case UserFilters.DepartmentCode:
include.push({
model: this.Models.Department,
as: 'Departments',
where: { DepartmentCode: filterParam.Value }
});
break;
case UserFilters.IsPrivate:
where['IsPrivate'] = filterParam.Value;
break;
case UserFilters.IsHome:
where['IsHome'] = filterParam.Value;
break;
case UserFilters.IsDiscount:
where['IsDiscount'] = filterParam.Value;
break;
case UserFilters.IsPeadiatrician:
where['IsPeadiatrician'] = filterParam.Value;
break;
case UserFilters.IsAnaesthisist:
where['IsAnaesthisist'] = filterParam.Value;
break;
case UserFilters.IsSurgeon:
where['IsSurgeon'] = filterParam.Value;
break;
case UserFilters.EmployeeId:
//where['EmployeeId'] = filterParam.Value;
break;
case UserFilters.SubDepartmentId:
where['SubDepartmentId'] = filterParam.Value;
break;
case UserFilters.IsAssetDept:
DepartmentWhere['IsAssetDept'] = filterParam.Value;
isReqDepartmentSearch = true;
break;
case UserFilters.SecurityPin:
where['SecurityPin'] = filterParam.Value;
break;
case UserFilters.IsPatientPortalDoctor:
where['IsPatientPortalDoctor'] = filterParam.Value;
break;
case UserFilters.PatientUserType:
where['UserTypeId'] = { [Op.ne]: filterParam.Value };
break;
case UserFilters.Staff:
where['Staff'] = filterParam.Value;
break;
case UserFilters.IsVirtualUsers:
where['IsVirtualUsers'] = filterParam.Value;
break;
case UserFilters.VirtualCategoryId:
where['VirtualCategoryId'] = filterParam.Value;
break;
case UserFilters.VirtualSubCategoryId:
where['VirtualSubCategoryId'] = filterParam.Value;
break;
case UserFilters.PatientId:
where['PatientId'] = filterParam.Value;
break;
case UserFilters.GenderId:
where['GenderId'] = filterParam.Value;
break;
case UserFilters.EmergencyUsers:
include.push({
model: this.Models.Department,
as: 'UserDept',
where: { IsEmergency: filterParam.Value }
});
break;
case UserFilters.UserName:
where['UserName'] = filterParam.Value;
break;
case UserFilters.Mobile:
where['Mobile'] = filterParam.Value;
break;
case UserFilters.DOB:
where['DOB'] = { [Op.between]: filterParam.Value || '' };
break;
case UserFilters.TeamId:
where['TeamId'] = filterParam.Value;
break;
default:
throw 'Not Implemented';
}
}
});
include.push({
model: this.Models.UserDefaultService, attributes: ['UserDefaultServiceId', 'UserId', 'ServiceItemId'],
as: 'Service',
required: false,
include: [{
model: this.Models.ServiceItem,
where: { CategoryId: 5 },//Consultation
attributes: ['ServiceItemId', 'Name', 'ItemCode', 'CategoryId'],
required: true,
include: [{
model: this.Models.ServiceItemTariffDetail,
// as: 'TariffDetail',
required: false,
include: [
{
model: this.Models.ServiceRateCategory,
attributes: ['ServiceRateCategory', 'Description'], required: false
}
]
}]
}]
});
include.push({
model: this.Models.Department, as: 'Department',
required: false,
where: DepartmentWhere,
});
return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
}
public async GetMinUsers(apiReq?: ApiRequest<UserFilters>): Promise<ApiResponse<UserAttributes[]>> {
let where: WhereOptions<any> = {};
let DepartmentWhere: WhereOptions<any> = {};
// let facilityWhere: WhereOptions<any> = {};
let isReqDepartmentSearch: boolean = false;
let include: Array<IncludeOptions> = [];
include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
include.push({ model: this.Models.Organization, attributes: ['OrgName'], required: false });
include.push({ model: this.Models.GstMaster, attributes: ['GstCode', 'GstName', 'GstPercentage'], required: false });
include.push({ model: this.Models.Speciality, attributes: ['SpecialityName'], required: false });
include.push({ model: this.Models.Group, attributes: ['GroupName'], required: false });
include.push({ model: this.Models.Department, as: 'UserDept', attributes: ['DepartmentName'], required: false });
include.push({ model: this.Models.Department, as: 'SubDepartment', attributes: ['DepartmentName'], required: false });
// include.push({
//     model: this.Models.Employee, required: false,
//     include: [this.GetReference('Title'), this.GetReference('Position')]
// });
include.push(this.GetReference('DoctorClass'));
include.push(this.GetReference('Title'));
include.push(this.GetReference('UserType'));
include.push(this.GetReference('ClinicalRole'));
include.push(this.GetReference('OPDRoom'));
include.push(this.GetReference('ActiveStatus'));
include.push(this.GetReference('Gender'));
include.push(this.GetReference('DoctorShareClass'));
include.push(this.GetReference('DiscountMode'));
include.push(this.GetReference('QmsLocation'));
apiReq.Params.forEach((filterParam) => {
if (this.IsValidParam(filterParam)) {
switch (filterParam.Key) {
case UserFilters.Id:
where['Id'] = filterParam.Value;
break;
case UserFilters.Name:
where = {
...where,
[Op.or]: [
{ FirstName: { [Op.like]: '%' + (filterParam.Value || '') + '%' } },
{ LastName: { [Op.like]: '%' + (filterParam.Value || '') + '%' } },
{ UserName: { [Op.like]: '%' + (filterParam.Value || '') + '%' } }
]
};
break;
case UserFilters.Facility:
where['FacilityId'] = filterParam.Value;
// facilityWhere['FacilityId'] = filterParam.Value;
break;
case UserFilters.UserType:
where['UserTypeId'] = filterParam.Value;
break;
case UserFilters.Group:
where['UserGroupId'] = filterParam.Value;
break;
case UserFilters.ActiveStatus:
where['ActiveStatusId'] = filterParam.Value;
break;
case UserFilters.Department:
where['DepartmentId'] = filterParam.Value;
break;
case UserFilters.DepartmentCode:
include.push({
model: this.Models.Department,
as: 'Departments',
where: { DepartmentCode: filterParam.Value }
});
break;
case UserFilters.IsPrivate:
where['IsPrivate'] = filterParam.Value;
break;
case UserFilters.IsDiscount:
where['IsDiscount'] = filterParam.Value;
break;
case UserFilters.IsPeadiatrician:
where['IsPeadiatrician'] = filterParam.Value;
break;
case UserFilters.IsAnaesthisist:
where['IsAnaesthisist'] = filterParam.Value;
break;
case UserFilters.IsSurgeon:
where['IsSurgeon'] = filterParam.Value;
break;
case UserFilters.EmployeeId:
//where['EmployeeId'] = filterParam.Value;
break;
case UserFilters.SubDepartmentId:
where['SubDepartmentId'] = filterParam.Value;
break;
case UserFilters.IsAssetDept:
DepartmentWhere['IsAssetDept'] = filterParam.Value;
isReqDepartmentSearch = true;
break;
case UserFilters.SecurityPin:
where['SecurityPin'] = filterParam.Value;
break;
case UserFilters.IsPatientPortalDoctor:
where['IsPatientPortalDoctor'] = filterParam.Value;
break;
case UserFilters.PatientUserType:
where['UserTypeId'] = { [Op.ne]: filterParam.Value };
break;
case UserFilters.Staff:
where['Staff'] = filterParam.Value;
break;
case UserFilters.IsVirtualUsers:
where['IsVirtualUsers'] = filterParam.Value;
break;
case UserFilters.VirtualCategoryId:
where['VirtualCategoryId'] = filterParam.Value;
break;
case UserFilters.VirtualSubCategoryId:
where['VirtualSubCategoryId'] = filterParam.Value;
break;
case UserFilters.PatientId:
where['PatientId'] = filterParam.Value;
break;
case UserFilters.EmergencyUsers:
include.push({
model: this.Models.Department,
as: 'UserDept',
where: { IsEmergency: filterParam.Value }
});
break;
case UserFilters.UserName:
where['UserName'] = filterParam.Value;
break;
case UserFilters.Mobile:
where['Mobile'] = filterParam.Value;
break;
case UserFilters.DOB:
where['DOB'] = { [Op.between]: filterParam.Value || '' };
break;
case UserFilters.TeamId:
where['TeamId'] = filterParam.Value;
break;
case UserFilters.UserFacility:
// where['$or'] = [{'FacilityId': this.Session.FacilityId}];
if (filterParam.Value) {
let paramArr: Array<number> = [];
if (filterParam.Value.toString().indexOf(',') > -1) {
paramArr = filterParam.Value.toString().split(',');
} else {
paramArr = [filterParam.Value];
}
include.push({
model: this.Models.UserFacilityMap,
where: { FacilityId: { [Op.in]: paramArr } },
// required: false
});
// facilityWhere['$or']
}
break;
default:
throw 'Not Implemented';
}
}
});
include.push({
model: this.Models.Department, as: 'Department',
attributes: ['Id', 'DepartmentName', 'IsEmergency'],
required: false,
where: DepartmentWhere,
});
// include.push({
//     model: this.Models.UserFacilityMap,
//     // as: 'UserFacility',
//     attributes: ['UserId', 'FacilityId'],
//     required: false,
//     where: facilityWhere,
// });
apiReq.Attributes = ['Id', 'DepartmentId', 'FacilityId',
'DoctorClassId', 'TitleId', 'UserTypeId', 'ClinicalRoleId',
'OPDRoomId', 'ActiveStatusId', 'GenderId', 'BillingCounterId',
'DoctorShareClassId', 'DiscountModeId',
'QmsLocationId',
'SpecialityId', 'UserGroupId',
['FirstName', 'Text'], 'FirstName', 'LastName', 'Qualification',
'IsDiscount', 'DiscountLimit'];
return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
}
public async GetEmergencyUsers(apiReq?: ApiRequest<UserFilters>): Promise<ApiResponse<UserAttributes[]>> {
let where: WhereOptions<any> = {};
let DepartmentWhere: WhereOptions<any> = {};
let isReqDepartmentSearch: boolean = false;
let include: Array<IncludeOptions> = [];
include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
include.push({ model: this.Models.Organization, attributes: ['OrgName'], required: false });
include.push({ model: this.Models.GstMaster, attributes: ['GstCode', 'GstName', 'GstPercentage'], required: false });
include.push({ model: this.Models.Speciality, attributes: ['SpecialityName'], required: false });
include.push({ model: this.Models.Group, attributes: ['GroupName'], required: false });
// include.push({ model: this.Models.Department, as: 'UserDept', required: false });
include.push({ model: this.Models.Department, as: 'SubDepartment', attributes: ['DepartmentName'], required: false });
// include.push({
//     model: this.Models.Employee, required: false,
//     include: [this.GetReference('Title'), this.GetReference('Position')]
// });
include.push(this.GetReference('DoctorClass'));
include.push(this.GetReference('Title'));
include.push(this.GetReference('UserType'));
include.push(this.GetReference('ClinicalRole'));
include.push(this.GetReference('OPDRoom'));
include.push(this.GetReference('ActiveStatus'));
include.push(this.GetReference('Gender'));
include.push(this.GetReference('DoctorShareClass'));
include.push(this.GetReference('DiscountMode'));
include.push(this.GetReference('QmsLocation'));
apiReq.Params.forEach((filterParam) => {
if (this.IsValidParam(filterParam)) {
switch (filterParam.Key) {
case UserFilters.Id:
where['Id'] = filterParam.Value;
break;
case UserFilters.Name:
where = {
...where,
[Op.or]: [
{ FirstName: { [Op.like]: '' + (filterParam.Value || '') + '%' } },
{ LastName: { [Op.like]: '' + (filterParam.Value || '') + '%' } },
{ UserName: { [Op.like]: '' + (filterParam.Value || '') + '%' } }
]
};
break;
case UserFilters.Facility:
where['FacilityId'] = filterParam.Value;
break;
case UserFilters.UserType:
where['UserTypeId'] = filterParam.Value;
break;
case UserFilters.Group:
where['UserGroupId'] = filterParam.Value;
break;
case UserFilters.ActiveStatus:
where['ActiveStatusId'] = filterParam.Value;
break;
case UserFilters.Department:
where['DepartmentId'] = filterParam.Value;
break;
case UserFilters.DepartmentCode:
include.push({
model: this.Models.Department,
as: 'Departments',
where: { DepartmentCode: filterParam.Value }
});
break;
case UserFilters.IsPrivate:
where['IsPrivate'] = filterParam.Value;
break;
case UserFilters.IsDiscount:
where['IsDiscount'] = filterParam.Value;
break;
case UserFilters.IsPeadiatrician:
where['IsPeadiatrician'] = filterParam.Value;
break;
case UserFilters.IsAnaesthisist:
where['IsAnaesthisist'] = filterParam.Value;
break;
case UserFilters.IsSurgeon:
where['IsSurgeon'] = filterParam.Value;
break;
case UserFilters.EmployeeId:
//where['EmployeeId'] = filterParam.Value;
break;
case UserFilters.SubDepartmentId:
where['SubDepartmentId'] = filterParam.Value;
break;
case UserFilters.IsAssetDept:
DepartmentWhere['IsAssetDept'] = filterParam.Value;
isReqDepartmentSearch = true;
break;
case UserFilters.SecurityPin:
where['SecurityPin'] = filterParam.Value;
break;
case UserFilters.IsPatientPortalDoctor:
where['IsPatientPortalDoctor'] = filterParam.Value;
break;
case UserFilters.PatientUserType:
where['UserTypeId'] = { [Op.ne]: filterParam.Value };
break;
case UserFilters.Staff:
where['Staff'] = filterParam.Value;
break;
case UserFilters.IsVirtualUsers:
where['IsVirtualUsers'] = filterParam.Value;
break;
case UserFilters.VirtualCategoryId:
where['VirtualCategoryId'] = filterParam.Value;
break;
case UserFilters.VirtualSubCategoryId:
where['VirtualSubCategoryId'] = filterParam.Value;
break;
case UserFilters.PatientId:
where['PatientId'] = filterParam.Value;
break;
case UserFilters.EmergencyUsers:
include.push({
model: this.Models.Department,
as: 'UserDept',
where: { IsEmergency: filterParam.Value }
});
break;
default:
throw 'Not Implemented';
}
}
});
return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
}
public async DeleteUser(req: BaseRequest): Promise<Boolean> {
return await this.MarkAsDelete(req.Id);
}
public GetModel(): SStatic.Model<UserInstance, UserAttributes> {
return this.Models.User;
}
public async GetOptions(key: string, apiReq?: ApiRequest<UserFilters>): Promise<any> {
apiReq.Params = apiReq.Params || [];
//If block to filter only physician type users
if (key === 'Doctor') {
apiReq.Params.push({ Key: UserFilters.UserType, Value: 2 },
{ Key: UserFilters.ActiveStatus, Value: 2 });
} else if (key === 'PrivateDueApprover') {
apiReq.Params.push({ Key: UserFilters.IsPrivate, Value: true });
} else if (key === 'DiscountApprover') {
apiReq.Params.push({ Key: UserFilters.IsDiscount, Value: true });
} else if (key === 'Nurse') {
apiReq.Params.push({ Key: UserFilters.UserType, Value: 10 });
} else if (key === 'OTTechnician') {
apiReq.Params.push({ Key: UserFilters.UserType, Value: 5 });
} else if (key === 'LabIncharge') {
apiReq.Params.push({ Key: UserFilters.Department, Value: 8 }, { Key: UserFilters.UserType, Value: 2 });
} else if (key === 'RadiologyIncharge') {
apiReq.Params.push({ Key: UserFilters.Department, Value: 62 }, { Key: UserFilters.UserType, Value: 2 });
} else if (key === 'LabTechnician') {
apiReq.Params.push({ Key: UserFilters.Department, Value: 8 }, { Key: UserFilters.UserType, Value: 6 });
} else if (key === 'RadiologyTechnician') {
apiReq.Params.push({ Key: UserFilters.Department, Value: 62 }, { Key: UserFilters.UserType, Value: 6 });
} else if (key === 'EndoscopyIncharge') {
apiReq.Params.push({ Key: UserFilters.Department, Value: 60 }, { Key: UserFilters.UserType, Value: 2 });
} else if (key === 'AssetUser') {
apiReq.Params.push({ Key: UserFilters.ActiveStatus, Value: 2 }, { Key: UserFilters.IsAssetDept, Value: true });
} else if (key === 'Staff') {
apiReq.Params.push({ Key: UserFilters.ActiveStatus, Value: 2 });
} else if (key === 'DoctorShare') {
apiReq.Params.push({ Key: UserFilters.UserType, Value: 2 },
{ Key: UserFilters.ActiveStatus, Value: 2 });
} else if (key === 'UserTechnicians') {
apiReq.Params.push({ Key: UserFilters.UserType, Value: 6 },
{ Key: UserFilters.ActiveStatus, Value: 2 });
}
apiReq.Attributes = apiReq.Attributes || ['Id', ['FirstName', 'Text'],
'FirstName', 'MiddleName', 'LastName', 'UserName', 'DepartmentId', 'FacilityId',
'UserTypeId', 'PrivateDueLimit', 'DiscountLimit', 'SpecialityId', 'UserGroupId', 'TitleId',
'ActiveStatusId', 'GenderId', 'DoctorShareClassId', 'DiscountModeId', 'ClinicalRoleId',
'OPDRoomId', 'PrescriptionAdvice', 'IsPharmacyDueAllowed', 'IsDefaultPrivateDue',
'DoctorClassId', 'IsIncludeTax', 'Qualification', 'BillingCounterId', 'Age',
, 'IsDiscount', 'DiscountLimit'];
let val = await this.GetMinUsers(apiReq);
return { [key]: val.Data };
}
public async MapDeparments(req: BaseRequest) {
let mapbo = new MapBo(this.Models.UserDepartmentMap as any, 'UserId', 'DepartmentId', this.Request);
return await mapbo.Manage(req.Data);
}
public async GetDepartments(apiReq?: ApiRequest<ISearchEnums>) {
let mapbo = new MapBo(this.Models.UserDepartmentMap as any, 'UserId', 'DepartmentId', this.Request);
return await mapbo.GetMaps(apiReq);
}
public async MapCategory(req: BaseRequest) {
let mapbo = new MapBo(this.Models.UserCategoryMap as any, 'UserId', 'CategoryId', this.Request);
return await mapbo.Manage(req.Data);
}
public async GetCategory(apiReq?: ApiRequest<ISearchEnums>) {
let mapbo = new MapBo(this.Models.UserCategoryMap as any, 'UserId', 'CategoryId', this.Request);
return await mapbo.GetMaps(apiReq);
}
public async MapFacilities(req: BaseRequest) {
let mapbo = new MapBo(this.Models.UserFacilityMap as any, 'UserId', 'FacilityId', this.Request);
return await mapbo.Manage(req.Data);
}
public async GetFacilities(apiReq?: ApiRequest<ISearchEnums>) {
let mapbo = new MapBo(this.Models.UserFacilityMap as any, 'UserId', 'FacilityId', this.Request);
return await mapbo.GetMaps(apiReq);
}
public async MapSpecialities(req: BaseRequest) {
let mapbo = new MapBo(this.Models.UserSpecialityMap as any, 'UserId', 'SpecialityId', this.Request);
return await mapbo.Manage(req.Data);
}
public async GetSpecialities(apiReq?: ApiRequest<ISearchEnums>) {
let mapbo = new MapBo(this.Models.UserSpecialityMap as any, 'UserId', 'SpecialityId', this.Request);
return await mapbo.GetMaps(apiReq);
}
public async setUserCurrentFacility(req: BaseRequest): Promise<Boolean> {
// console.log(req.Data.UserId);
// console.log(req.Data.FacilityId);
// console.log(this.Session.FacilityId); //TODO Need some code changes in Session...
this.Session.FacilityId = req.Data.FacilityId;
let httpRequest = this.Request;
return new Promise<Boolean>(function (resolve, reject) {
httpRequest.session.save(function (err) {
if (!err) {
console.log('session updated successfully');
resolve(true);
} else {
reject(err);
}
});
});
}
public async PrintUserMasterReport(apiReq?: ApiRequest<UserFilters>): Promise<any> {
let data = await this.GetUsers(apiReq);
let User = data.Data;
let FacilityName = apiReq.Data.FacilityName;
let Type = apiReq.Data.Type;
let GroupName = apiReq.Data.GroupName;
let DepartmentName = apiReq.Data.DepartmentName;
let UserData = data.Data[0];
let facilityPreferenceBO = BoFactory.GetBo(appMgrBO.FacilityPreferenceBo, this.Request);
let printPreferencesData =
await facilityPreferenceBO.GetFacilityPreferenceWithLogo(UserData.FacilityId);
let info = {
User: User,
Preferences: printPreferencesData,
FacilityName: FacilityName,
Type: Type,
GroupName: GroupName,
DepartmentName: DepartmentName
};
let pdfOption: any = null;
let key = 'usermasterreport';
pdfOption = {
format: 'A4',
orientation: 'portrait',
border: '0',
header: {
height: '1.5in',
contents: '',
},
footer: {
height: '0.5in',
contents: {
first: '',
default: '',
last: '',
},
},
type: 'pdf',
base: 'file://' + join(__dirname, '/../../Templates/')
};
return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
}
public async PrintDoctorListReport(apiReq?: ApiRequest<UserFilters>): Promise<any> {
let data = await this.GetUsers(apiReq);
let User = data.Data;
let FacilityName = apiReq.Data.FacilityName;
let GroupName = apiReq.Data.GroupName;
let DepartmentName = apiReq.Data.DepartmentName;
let UserData = data.Data[0];
let facilityPreferenceBO = BoFactory.GetBo(appMgrBO.FacilityPreferenceBo, this.Request);
let printPreferencesData =
await facilityPreferenceBO.GetFacilityPreferenceWithLogo(UserData.FacilityId);
let info = {
User: User,
Preferences: printPreferencesData,
FacilityName: FacilityName,
GroupName: GroupName,
DepartmentName: DepartmentName
};
let pdfOption: any = null;
let key = 'doctorlistreport';
pdfOption = {
format: 'A4',
orientation: 'landscape',
border: '0',
header: {
height: '1.5in',
contents: '',
},
footer: {
height: '0.5in',
contents: {
first: '',
default: '',
last: '',
},
},
type: 'pdf',
base: 'file://' + join(__dirname, '/../../Templates/')
};
return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
}
private async ProcessUserIdGeneration(generateUserno: string, req: any, userId: number) {
const afterO: any = () => {
return ((bo, request, uId) => {
return {
UserNameUpdate: async (code: string) => {
request.Data.Id = uId;
request.Data.UserName = code;
await bo.UserNameUpdate(request);
},
SendUserSms: async (code: string) => {
request.Data.Id = uId;
request.Data.UserName = code;
request.Data.FirstName = req.Data.FirstName;
request.Data.LastName = req.Data.LastName;
request.Data.TitleId = req.Data.TitleId;
request.Data.Mobile = req.Data.Mobile;
request.Data.Password = req.Data.Password;
await bo.SendUserSms(request);
},
};
})(this, req, userId);
};
let fun = afterO();
this.deferSequenceKey(userId, 'UserName',
generateUserno = this.getUserSequenceIdentifier(SequenceKeys.UserId),
[
fun.UserNameUpdate,
fun.SendUserSms
]);
}
private async UserNameUpdate(req: any) {
try {
let updData: any = {
Id: req.Data.Id,
UserName: req.Data.UserName
};
await this.Update(updData);
} catch (ex) {
console.log(ex);
}
}
private async SendUserSms(req: any) {
let smsProvider = this.GetSmsProvider();
let eventTemplateBO = BoFactory.GetBo(appMgrBO.EventTemplateBo, this.Request);
let smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('UserNameReg', 'UserNameReg', 1);
let vUser = '';
let smsmodel: any = {};
if (req.Data.FirstName) vUser += req.Data.FirstName;
if (req.Data.LastName) vUser += ' ' + req.Data.LastName;
let apiReqTitle = {
Id: 0,
PageContext: { PageSize: 50, PageNumber: 1 },
Params: [
{ Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Title' },
{ Key: ReferenceValueFilters.ReferenceValueCodeId, Value: req.Data.TitleId }
]
};
let vTitleName = '';
let refTitleBo = BoFactory.GetBo(appMgrBO.ReferenceValueBo, this.Request);
let TitleData = await refTitleBo.GetReferenceValues(apiReqTitle);
if (TitleData && TitleData.Data && TitleData.Data.length > 0) {
if (TitleData.Data[0].Description)
vTitleName = TitleData.Data[0].Description;
}
if (vTitleName)
vUser = vTitleName + '.' + vUser;
if (smsTemplateInfo) {
smsmodel = {
numbers: [req.Data.Mobile],
message: Template.Compile(smsTemplateInfo.TemplateContent,
{
user: vUser,
userName: req.Data.UserName,
pwd: req.Data.Password
})
};
if (smsProvider) {
let SMSStatus = await smsProvider.send(smsmodel);
let eventDashboardOutboundBo = BoFactory.GetBo(appMgrBO.EventDashboardBo, this.Request);
await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + req.Data.Mobile);
}
}
let alertBO = BoFactory.GetBo(genMasbo.PatientAlertBo, this.Request);
let alertData: any = {
Data: {
Id: 0,
PatientId: req.Data.Id,
AlertDescription: smsmodel.message,
OnsetDate: new Date(),
Status: 1
}
};
await alertBO.AddPatientAlert(alertData);
}
private async IsAlreadyExist(req: any): Promise<number> {
if (!req.Data.Header['OverrideDuplicate'] || req.Data.Header['OverrideDuplicate'] === 'false') {
let duplicate = await this.FindAll({
where: {
Mobile: req.Data.Header['Mobile']
}
});
if (duplicate && duplicate.length > 0) {
return (duplicate.length * -1);
}
}
return 1;
}
}
