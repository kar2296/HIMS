import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo, Template } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PatientInstance, PatientAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Registration/Business/Index';
import * as regbo from '../../Registration/Business/Index';
import * as emrbo from '../../EMR/Business/Index';
import * as encbo from '../../Visit/Business/Index';
import * as appointmentbo from '../../Appointment/Business/Index';
import * as appbo from '../../SystemSettings/Business/Index';
import * as billingBo from '../../Billing/Business/Index';
import * as ipbo from '../../IPManagement/Business/Index';
import { ReferenceValueFilters } from '../../SystemSettings/Common/Filters.e';
import {
    PatientFilters, PatientKinFilters,
    FamilyLinkFilters, PatientGuarantorFilters,
} from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import { readFileSync, writeFileSync } from 'fs';
import { AppConfig } from '../../../../config/index';
import * as moment from 'moment';
import { join } from 'path';
import * as userbo from '../../SystemSettings/Business/Index';
import * as generalbo from '../../GeneralMaster/Business/Index';
import * as clinicalbo from '../../ClinicalMaster/Business/Index';
import { DiagnosisFilters } from '../../ClinicalMaster/Common/Filters.e';
import { PatientPaymentDetailsFilters } from '../../Billing/Common/Filters.e';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import { AppointmentFilters } from '../../Appointment/Common/Filters.e';
// import { ReferralAttributes } from '../../GeneralMaster/Model/Interface/Index';
import {
    PatientClinicalNotesFilters, PatientConditionFilters
} from '../../EMR/Common/Filters.e';
import { NotificationService } from '../../../Notification/OneSignalNotification';
import { WhatsappNotificationService } from '../../../WhatsappNotification/WhatsappNotification';
import * as facilityBo from '../../SystemSettings/Business/Index';

export class PatientBo extends BaseBo<PatientInstance, PatientAttributes> implements IOptionProvider {

    public async AddPatient(req: BaseRequest): Promise<number> {
        let generateMRN: string = null;

        if (await this.IsAlreadyExist(req) <= -1) throw { error: 'Patient already exists' };

        if (req.Data.PatientStatus === 'Active') {
            if (req.Data.MRNTypeId === 1 || req.Data.MRNTypeId === '1') {
                generateMRN = 'temp';
            }
            if (req.Data.MRNTypeId === 2 || req.Data.MRNTypeId === '2') {
                generateMRN = 'mrn';
                req.Data.RegisteredDate = new Date();
            }
        }

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

        for (let idx in req.Data) {
            let strValue = req.Data[idx];
            if (strValue === 'null') {
                req.Data[idx] = null;
            }
        }


        this.HandlePatientStatus(req.Data);
        let result = await this.Save(req.Data);
        let patientId = result.dataValues.Id;

        if (req.Data.GenerateCaseId === 1) {
            this.deferSequenceKey(patientId, 'FamilyUniqueId',
                this.getSequenceIdentifier(SequenceKeys.FamilyPatientId));
        }

        if (req.Data.ParentPatientId > 0) {
            let memberInfo = await this.GetPatientById({ Id: req.Data.ParentPatientId });
            let PatData: any = {
                Id: patientId,
                FamilyUniqueId: memberInfo.FamilyUniqueId
            };
            await this.Update(PatData);
        }
        if (req.Data.IsIvfRegistration && req.Data.GuardianName !== '') {
            await this.AddFamililyLinkPat(req, patientId);
        }

        if (!req.Data.MRN && generateMRN) {
            await this.ProcessMRNIdGeneration(generateMRN, req, patientId);
        }

        if (generateMRN) {
            let patientGuarantorBO = BoFactory.GetBo(bo.PatientGuarantorBo, this.Request);
            await patientGuarantorBO.ManagePatientSelfGuarantor(patientId);
        }

        return patientId;
    }
    public async AddPatientMasterExcel(req: BaseRequest): Promise<any> {
        let details: PatientAttributes[] = req.Data || [];
        await Promise.all(details.map(async (PatientData: PatientAttributes) => {
            try {
                let generateMRN: string = null;
                if (await this.IsAlreadyExist(req) <= -1) return -1;
                generateMRN = 'mrn';
                let result = await this.Save(PatientData);
                let patientId = result.dataValues.Id;
                await this.ProcessMRNIdGeneration(generateMRN, req, patientId);
            } catch (error) {
                console.error('Error saving detail:', PatientData, error);
            }
            return true;
        }));
    }
    public async AddFamililyLinkPat(req: BaseRequest, patientId: number): Promise<any> {

        let title: number;
        let gender: number;
        if (req.Data.TitleId === 10) {
            title = 11;
        }
        if (req.Data.TitleId === 11) {
            title = 10;
        }
        if (req.Data.GenderId === 1) {
            gender = 2;
        }
        if (req.Data.GenderId === 2) {
            gender = 1;
        }
        let memberData: any = {
            Data: {
                Id: 0,
                MRNTypeId: 2,
                NationalityId: req.Data.NationalityId,
                TitleId: title,
                GenderId: gender,
                FirstName: req.Data.GuardianName,
                FacilityId: req.Data.FacilityId,
                PatientStatus: 'Active',
                PatientStatusId: 2,
                ParentPatientId: patientId,
                IsMemberLink: true
            }
        };
        let memId = await this.AddPatient(memberData);
        let famLinkBo = BoFactory.GetBo(regbo.FamilyLinkBo, this.Request);
        let familyInfo: any = [];
        let famData: any = {
            Id: 0,
            PatientId: patientId,
            PatientName: req.Data.GuardianName,
            MemberId: memId,
            Status: 1,
            RelationshipId: 8
        };
        familyInfo.push(famData);
        await famLinkBo.ManageFamilyLinksfromReg(familyInfo);
        return true;
    }

    public async AddSpousePatient(req: BaseRequest): Promise<any> {
        let generateMRN: string = null;

        if (await this.IsAlreadyExist(req) <= -1) return -1;

        if (req.Data.PatientStatus === 'Active') {
            if (req.Data.MRNTypeId === 1 || req.Data.MRNTypeId === '1') {
                generateMRN = 'temp';
            }
            if (req.Data.MRNTypeId === 2 || req.Data.MRNTypeId === '2') {
                generateMRN = 'mrn';
                req.Data.RegisteredDate = new Date();
            }
        }

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

        for (let idx in req.Data) {
            let strValue = req.Data[idx];
            if (strValue === 'null') {
                req.Data[idx] = null;
            }
        }


        this.HandlePatientStatus(req.Data);
        let result = await this.Save(req.Data);
        let patientId = result.dataValues.Id;


        if (req.Data.ParentPatientId > 0) {
            let memberInfo = await this.GetPatientById({ Id: req.Data.ParentPatientId });
            let PatData: any = {
                Id: patientId,
                FamilyUniqueId: memberInfo.FamilyUniqueId
            };
            await this.Update(PatData);
        }

        if (!req.Data.MRN && generateMRN) {
            await this.ProcessMRNIdGeneration(generateMRN, req, patientId);
        }

        if (generateMRN) {
            let patientGuarantorBO = BoFactory.GetBo(bo.PatientGuarantorBo, this.Request);
            await patientGuarantorBO.ManagePatientSelfGuarantor(patientId);
        }


        let famLinkBo = BoFactory.GetBo(regbo.FamilyLinkBo, this.Request);
        let familyInfo: any = [];
        let famData: any = {
            Id: 0,
            PatientId: req.Data.ParentPatientId,
            PatientName: req.Data.FirstName,
            MemberId: patientId,
            Status: 1,
            RelationshipId: 8
        };
        familyInfo.push(famData);
        await famLinkBo.ManageFamilyLinksfromReg(familyInfo);
        return patientId;
    }
    public async UpdatePatientFamilyId(req: BaseRequest): Promise<number> {
        let famLinkBo = BoFactory.GetBo(regbo.FamilyLinkBo, this.Request);
        let FamReq = {
            Id: 0,
            PageContext: { PageSize: 1, PageNumber: 1 },
            Params: [{ Key: FamilyLinkFilters.PatientId, Value: req.Data.PatientId }]
        };
        let familyLinkData = await famLinkBo.GetFamilyLinks(FamReq);
        let memberId: number;
        let famData: any = {};
        if (familyLinkData.length > 0) {
            for (let fdx in familyLinkData) {
                famData = familyLinkData[fdx];
                memberId = famData.MemberId;
            }
        }
        let memberInfo = await this.GetPatientById({ Id: memberId });
        let PatData: any = {
            Id: req.Data.PatientId,
            FamilyUniqueId: memberInfo.FamilyUniqueId
        };
        await this.Update(PatData);
        let FamInfo: any = {
            Id: famData.Id,
            MRN: memberInfo.MRN
        };
        await famLinkBo.Update(FamInfo);

        return req.Data.PatientId;
    }


    public async AddSelfPatient(req: BaseRequest): Promise<number> {
        let generateMRN: string = null;
        if (await this.IsAlreadyExist(req) <= -1) return -1;
        if (req.Data.PatientStatus === 'Active') {
            if (req.Data.MRNTypeId === 1 || req.Data.MRNTypeId === '1') {
                generateMRN = 'temp';
            }
            if (req.Data.MRNTypeId === 2 || req.Data.MRNTypeId === '2') {
                generateMRN = 'mrn';
                req.Data.RegisteredDate = new Date();
            }
        }

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

        for (let idx in req.Data) {
            let strValue = req.Data[idx];
            if (strValue === 'null') {
                req.Data[idx] = null;
            }
        }

        this.HandlePatientStatus(req.Data);
        let result = await this.Save(req.Data);
        let patientId = result.dataValues.Id;

        if (!req.Data.MRN && generateMRN) {
            await this.ProcessMRNIdGeneration(generateMRN, req, patientId);
        }
        return patientId;
    }

    public async AddSelfPatientWithoutSession(req: BaseRequest): Promise<number> {
        let generateMRN: string = null;
        if (await this.IsAlreadyExist(req) <= -1) return -1;
        if (req.Data.PatientStatus === 'Active') {
            if (req.Data.MRNTypeId === 1 || req.Data.MRNTypeId === '1') {
                generateMRN = 'temp';
            }
            if (req.Data.MRNTypeId === 2 || req.Data.MRNTypeId === '2') {
                generateMRN = 'mrn';
                req.Data.RegisteredDate = new Date();
            }
        }

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

        for (let idx in req.Data) {
            let strValue = req.Data[idx];
            if (strValue === 'null') {
                req.Data[idx] = null;
            }
        }

        this.HandlePatientStatus(req.Data);
        let result = await this.SaveWithOutSession(req.Data);
        let patientId = result.dataValues.Id;

        if (!req.Data.MRN && generateMRN) {
            // await this.ProcessMRNIdGeneration(generateMRN, req, patientId);
        }
        return patientId;
    }
    public async AddPatientFromUser(req: BaseRequest): Promise<any> {
        let patientId: number = 0;
        let UserReq = {
            Id: 0,
            PageContext: { PageSize: 1, PageNumber: 1 },
            Params: [{ Key: PatientFilters.UserId, Value: req.Data.UserId }]
        };
        let Userdata = await this.GetPatients(UserReq);
        if (Userdata.Data.length === 0) {
            let generateMRN: string = null;
            // if (await this.IsAlreadyExistUser(req) <= -1) return -1;

            if (req.Data.PatientStatus === 'Active') {
                if (req.Data.MRNTypeId === 1 || req.Data.MRNTypeId === '1') {
                    generateMRN = 'temp';
                }
                if (req.Data.MRNTypeId === 2 || req.Data.MRNTypeId === '2') {
                    generateMRN = 'mrn';
                    req.Data.RegisteredDate = new Date();
                }
            }

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

            for (let idx in req.Data) {
                let strValue = req.Data[idx];
                if (strValue === 'null') {
                    req.Data[idx] = null;
                }
            }

            this.HandlePatientStatus(req.Data);
            let result = await this.Save(req.Data);
            patientId = result.dataValues.Id;

            if (!req.Data.MRN && generateMRN) {
                await this.ProcessMRNIdGeneration(generateMRN, req, patientId);
            }

        }
        return patientId;
    }

    public async ManagePatientWithBill(req: BaseRequest): Promise<number> {
        let generateMRN: string = null;
        if (req.Data.IsTempPatient || req.Data.Id <= 0) { // Only new Patient
            if (await this.IsAlreadyExist(req) <= -1) return -1;
            if (req.Data.PatientStatus === 'Active') {
                if (req.Data.MRNTypeId === 1 || req.Data.MRNTypeId === '1') {
                    generateMRN = 'temp';
                }
                if (req.Data.MRNTypeId === 2 || req.Data.MRNTypeId === '2') {
                    generateMRN = 'mrn';
                    req.Data.RegisteredDate = new Date();
                }
            }
        }

        let file = this.Request.file;
        if (file) {
            let filepath: string = file.path;
            req.Data.PhotoPath = filepath;
        }

        if (req.Data.iswebcamphoto === true || req.Data.iswebcamphoto === 'true') {
            let base64String = req.Data.webcamphoto;
            let datetimestamp = Date.now();
            let filePath = AppConfig.UploadFilePath + '/' + req.Data.FirstName + '-' + datetimestamp + '.png';
            await writeFileSync(filePath, new Buffer(base64String, 'base64'));
            req.Data.PhotoPath = filePath;
        }

        for (let idx in req.Data) {
            let strValue = req.Data[idx];
            if (strValue === 'null') {
                req.Data[idx] = null;
            }
        }
        let patientId = -1;
        this.HandlePatientStatus(req.Data);
        if (req.Data.Id <= 0) {
            let result = await this.Save(req.Data);
            patientId = result.dataValues.Id;
        } else {
            await this.Update(req.Data);
            patientId = req.Data.Id;
        }

        if (!req.Data.MRN && generateMRN) {
            await this.ProcessMRNIdGeneration(generateMRN, req, patientId);
        }

        if (generateMRN) {
            let patientGuarantorBO = BoFactory.GetBo(bo.PatientGuarantorBo, this.Request);
            await patientGuarantorBO.ManagePatientforGuarantorInfo(patientId,
                req.Data.GuarantorTypeId, req.Data.AcutalGuarantorId, req.Data.TpaId, req.Data.GuarantorName, req.Data.EncounterId);
        }
        if (req.Data.MRN && req.Data.IsGuarantorChanged) {
            let patientGuarantorBO = BoFactory.GetBo(bo.PatientGuarantorBo, this.Request);
            await patientGuarantorBO.ManagePatientforGuarantorInfo(patientId,
                req.Data.GuarantorTypeId, req.Data.AcutalGuarantorId, req.Data.TpaId, req.Data.GuarantorName, req.Data.EncounterId);
        }
        // await this.processSMSForReferrer(req);
        return patientId;
    }

    public async AddPharmacyPatient(req: BaseRequest): Promise<number> {
        let generateMRN: string = null;

        if (await this.IsAlreadyExist(req) <= -1) return -1;

        if (req.Data.PatientStatus === 'Active') {
            if (req.Data.MRNTypeId === 1 || req.Data.MRNTypeId === '1') {
                generateMRN = 'temp';
            }
            if (req.Data.MRNTypeId === 2 || req.Data.MRNTypeId === '2') {
                generateMRN = 'mrn';
                req.Data.RegisteredDate = new Date();
            }
        }

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

        for (let idx in req.Data) {
            let strValue = req.Data[idx];
            if (strValue === 'null') {
                req.Data[idx] = null;
            }
        }

        this.HandlePatientStatus(req.Data);
        let result = await this.Save(req.Data);
        let patientId = result.dataValues.Id;

        if (!req.Data.MRN && generateMRN) {
            await this.ProcessMRNIdGeneration(generateMRN, req, patientId);
        }

        if (generateMRN) {
            let encBO = BoFactory.GetBo(encbo.EncounterBo, this.Request);
            let encData: any = {
                Data: {
                    Id: 0,
                    EncounterTypeId: req.Data.EncounterTypeId,
                    PatientId: patientId,
                    PatientMrn: req.Data.MRN,
                    DoctorId: req.Data.DoctorId,
                    DepartmentId: req.Data.DepartmentId,
                    GuarantorId: req.Data.GuarantorId,
                    GuarantorTypeId: req.Data.GuarantorTypeId,
                    AdmissionDate: new Date(),
                    OrganizationId: this.Session.FacilityId,
                    FacilityId: this.Session.FacilityId,
                    IsLatest: true,
                    Comments: req.Data.Comments,
                    EncounterStatusId: 1, //start
                    PatientLocation: req.Data.PatientLocation
                }
            };
            await encBO.AddPharmacyEncounter(encData);
        }

        return patientId;
    }

    public async UpdatePatient(req: BaseRequest): Promise<boolean> {
        let generateMRN: string = null;
        let mrnAttrs = await this.GetById(req.Data.Id, { attributes: ['MRNTypeId', 'MRN'] });
        // console.log(req.Data);
        if (req.Data.EncounterId) {
            let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
            let encounterData: any = {
                Data: {
                    Id: req.Data.EncounterId,
                    InsuranceNumber: req.Data.InsuranceNumber,
                    GuarantorId: req.Data.GuarantorId,
                    GuarantorTypeId: req.Data.GuarantorTypeId,
                    ServiceRateCategoryId: req.Data.ServiceRateCategoryId,
                }
            };
            await encounterBo.UpdateEncounter(encounterData);
        }
        if (req.Data.PatientStatus === 'Active'
            && mrnAttrs.dataValues.MRNTypeId === 1
            && (req.Data.MRNTypeId === 2 || req.Data.MRNTypeId === '2')) {
            generateMRN = 'mrn';
            req.Data.RegisteredDate = new Date();
        }
        if (!mrnAttrs.dataValues.MRN
            && !req.Data.MRN
            && req.Data.PatientStatus === 'Active') {
            if (req.Data.MRNTypeId === 1 || req.Data.MRNTypeId === '1') {
                generateMRN = 'temp';
            }
            if (req.Data.MRNTypeId === 2 || req.Data.MRNTypeId === '2') {
                generateMRN = 'mrn';
                req.Data.RegisteredDate = new Date();
            }
        }

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

        for (let idx in req.Data) {
            let strValue = req.Data[idx];
            if (strValue === 'null') {
                req.Data[idx] = null;
            }
        }

        this.HandlePatientStatus(req.Data);
        let result = await this.Update(req.Data);

        if (generateMRN) {
            await this.ProcessMRNIdGeneration(generateMRN, req, req.Data.Id);
        }

        if (generateMRN || req.Data.IsGuarantorChanged) {
            let patientGuarantorBO = BoFactory.GetBo(bo.PatientGuarantorBo, this.Request);
            await patientGuarantorBO.ManagePatientforGuarantorInfo(req.Data.Id, req.Data.GuarantorTypeId,
                req.Data.GuarantorId, req.Data.TpaId, req.Data.GuarantorName, req.Data.EncounterId);

            let eventDashboardOutboundBo = BoFactory.GetBo(appbo.EventDashboardBo, this.Request);
            await eventDashboardOutboundBo.ManageOutBound(req.Data.Id, req);
        }

        return result;
    }

    public async PatientBranchChangeOver(PatientId: number, ChangeOverFacilityId: number): Promise<boolean> {
        let result = true;
        let BranchChangeOver: any = { FacilityId: ChangeOverFacilityId };
        await this.Update(BranchChangeOver, {
            fields: ['FacilityId'],
            where: {
                Id: PatientId
            }
        });
        return result;
    }

    public async GetPatientProfilePic(req: BaseRequest): Promise<any> {
        let fileBuff = await readFileSync(req.Data.PhotoPath);
        let photoBase64 = new Buffer(fileBuff).toString('base64');
        return { Id: req.Data.Id, Photo: photoBase64 };
    }
    public async GetPatientmrnbarcode(req: BaseRequest): Promise<any> {
        // let fileBuff = await readFileSync(req.Data.MRN);
        // let photoBase64 = new Buffer(fileBuff).toString('base64');
        const bwipjs = require('bwip-js');
        let api = require('deasync')(bwipjs.toBuffer);
        let data = req.Data.MRN;
        let bcid = 'code39';
        // bcid = bcid.name ? 'code39' : bcid;
        // try {
        let img = api({
            bcid: bcid,
            text: data,
            scale: 3,
            height: 10,
            includetext: true,
            textxalign: 'center',
            textfont: 'Inconsolata',
            textsize: 15
        });
        let buffer = img.toString('base64');
        return buffer;
        // }
        // catch (e) {
        //     console.log(e);
        // }
        // return { Id: req.Data.Id, Photo: photoBase64 };
    }

    public async GetPatientMinimalInfoById(req: BaseRequest): Promise<PatientAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('Gender'));
        include.push(this.GetReference('Title'));
        include.push(this.GetReference('PatientStatus'));
        include.push(this.GetReference('MaritalStatus'));
        include.push(this.GetReference('Religion'));
        include.push(this.GetReference('Nationality'));
        include.push(this.GetReference('BloodGroup'));
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetPatientById(req: BaseRequest): Promise<PatientAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('Gender'));
        include.push(this.GetReference('Title'));
        include.push(this.GetReference('PatientStatus'));
        include.push(this.GetReference('MaritalStatus'));
        include.push(this.GetReference('GuardianType'));
        include.push(this.GetReference('Religion'));
        include.push(this.GetReference('Nationality'));
        include.push(this.GetReference('BloodGroup'));
        include.push(this.GetReference('PatientType'));
        include.push({ model: this.Models.CityMaster, attributes: ['CityName'], required: false });
        include.push({ model: this.Models.CountryMaster, attributes: ['CountryName'], required: false });
        include.push({ model: this.Models.StateMaster, attributes: ['StateName'], required: false });
        include.push({ model: this.Models.DistrictMaster, attributes: ['DistrictName'], required: false });
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.Occupation, attributes: ['Occupations', 'Code'], required: false });
        include.push({ model: this.Models.Guarantor, attributes: ['GuarantorName'], required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'DeathUpdated', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'DeathApproved', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'CreatedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'UpdatedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Referral, as: 'Referrer', required: false,
        });

        include.push({
            model: this.Models.Encounter,
            required: false, where: { 'IsLatest': true },
            include: [this.GetReference('AdmissionStatus'),
            {
                model: this.Models.PromotionalScheme, attributes: ['Id', 'PromotionSchemeName', 'PromotionSchemeCode'],
                required: false,
                include: [
                    {
                        model: this.Models.PromotionalSchemeDetail,
                        required: false,
                    },
                ]
            },
            {
                model: this.Models.WardMaster, attributes: ['WardName'], required: false,
            },
            {
                model: this.Models.WardRoomMaster, attributes: ['Id', 'RoomNo', 'Description'], required: false,
            },
            {
                model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
            },
            {
                model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'Qualification',
                    'PhotoPath', 'SignPath'], required: false,
                include: [this.GetReference('Title')]
            }, {
                model: this.Models.EncounterDoctor, required: false,
                attributes: ['DoctorId', 'DoctorName', 'DepartmentId', 'StartDate', 'EndDate',
                    'EncounterDoctorStatus', 'IsPrimary'],
                include: [{ model: this.Models.Department, attributes: ['DepartmentName'], required: false },
                this.GetReference('ConsultationStatus')]
            }, {
                model: this.Models.EncounterGuarantor,
                attributes: ['EncounterGuarantorId', 'GuarantorTypeId', 'GuarantorId'],
                required: false, where: { 'Rank': 1 },
                include: [
                    this.GetReference('GuarantorType'),
                    {
                        model: this.Models.Guarantor,
                        required: false,
                        include: [
                            {
                                model: this.Models.ServiceRateCategory,
                                attributes: ['ServiceRateCategory'],
                                required: false
                            },
                            {
                                model: this.Models.GuarantorAgreement,
                                required: false
                            }
                        ]
                    },
                ]
            }]
        });

        let attributes: any = {};
        attributes['include'] = [];
        let where: WhereOptions<any> = {};
        where['PatientId'] = req.Id;
        where['Status'] = 1;
        where['PatientBillStatusId'] = 3;
        if (req.Data && req.Data.IsPharmacySale === true) {
            where['IsPharmacyBill'] = true;
        }
        let billQry = this.GetSelectQuery(this.Models.PatientBills, {
            attributes: [this.Dal.fn('SUM', this.Dal.col('OutStandingAmount'))],
            where: where,
            // where: [this.Dal.literal('`PatientId` = ' + req.Id),
            // {
            //     'Status': 1,
            //     'PatientBillStatusId': 3
            // }]
        }, 'OutStandingAmount');
        attributes.include.push(billQry);

        let returnQry = this.GetSelectQuery(this.Models.PatientBills, {
            attributes: [this.Dal.fn('SUM', this.Dal.col('ReturnedAmount'))],
            where: where,
            // where: [this.Dal.literal('`PatientId` = ' + req.Id),
            // {
            //     'Status': 1,
            //     'PatientBillStatusId': 3
            // }]
        }, 'ReturnedAmount');
        attributes.include.push(returnQry);

        let paidQry = this.GetSelectQuery(this.Models.PatientPaymentDetails, {
            attributes: [this.Dal.fn('SUM', this.Dal.col('AmountPaid'))],
            where: [this.Dal.literal('`PatientId` = ' + req.Id),
            {
                'Status': 1,
                'ReceiptTypeId': 1,
                'ReceiptStatusId': 1
            }]
        }, 'AmountPaid');
        attributes.include.push(paidQry);

        let adjustedQry = this.GetSelectQuery(this.Models.PatientPaymentDetails, {
            attributes: [this.Dal.fn('SUM', this.Dal.col('AmountAdjusted'))],
            where: [this.Dal.literal('`PatientId` = ' + req.Id),
            {
                'Status': 1,
                'ReceiptTypeId': 1,
                'ReceiptStatusId': 1
            }]
        }, 'AmountAdjusted');
        attributes.include.push(adjustedQry);

        let result = await this.GetById(req.Id, { include: include, attributes: attributes });
        return this.GetAttribute(result);
    }

    public async GetPatientBannerInfoById(req: BaseRequest): Promise<PatientAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('Gender'));
        include.push(this.GetReference('Title'));
        include.push(this.GetReference('PatientStatus'));
        include.push(this.GetReference('MaritalStatus'));
        include.push(this.GetReference('Religion'));
        include.push(this.GetReference('Nationality'));
        include.push(this.GetReference('BloodGroup'));
        include.push(this.GetReference('VipType'));
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.Occupation, attributes: ['Occupations', 'Code'], required: false });
        include.push({ model: this.Models.Guarantor, attributes: ['GuarantorName'], required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'DeathUpdated', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'DeathApproved', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Referral, as: 'Referrer', required: false,
        });

        include.push({
            model: this.Models.Encounter,
            required: false,
            where: { IsLatest: true },
            include: [this.GetReference('AdmissionStatus'),
            {
                model: this.Models.WardMaster, attributes: ['WardName'], required: false,
            },
            {
                model: this.Models.Remark, as: 'Remark', attributes: ['Remarks'], required: false,
            },
            {
                model: this.Models.WardRoomMaster, attributes: ['Id', 'RoomNo', 'Description'], required: false,
            },
            {
                model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
            },
            {
                model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'Qualification',
                    'PhotoPath', 'SignPath'], required: false,
                include: [this.GetReference('Title')]
            }, {
                model: this.Models.EncounterDoctor, required: false,
                attributes: ['DoctorId', 'DoctorName', 'DepartmentId', 'StartDate', 'EndDate',
                    'EncounterDoctorStatus', 'IsPrimary'],
                include: [{ model: this.Models.Department, attributes: ['DepartmentName'], required: false },
                this.GetReference('ConsultationStatus')]
            }, {
                model: this.Models.EncounterGuarantor, attributes: ['EncounterGuarantorId', 'GuarantorTypeId', 'GuarantorId'],
                required: false, where: { 'Rank': 1 }
            }]
        });

        let attributes: any = {};
        attributes['include'] = [];
        let billQry = this.GetSelectQuery(this.Models.PatientBills, {
            attributes: [this.Dal.fn('SUM', this.Dal.col('OutStandingAmount'))],
            where: [this.Dal.literal('`PatientId` = ' + req.Id),
            {
                'Status': 1,
                'PatientBillStatusId': 3
            }]
        }, 'OutStandingAmount');
        attributes.include.push(billQry);

        let paidQry = this.GetSelectQuery(this.Models.PatientPaymentDetails, {
            attributes: [this.Dal.fn('SUM', this.Dal.col('AmountPaid'))],
            where: [this.Dal.literal('`PatientId` = ' + req.Id),
            {
                'Status': 1,
                'ReceiptTypeId': 1,
                'ReceiptStatusId': 1
            }]
        }, 'AmountPaid');
        attributes.include.push(paidQry);

        let adjustedQry = this.GetSelectQuery(this.Models.PatientPaymentDetails, {
            attributes: [this.Dal.fn('SUM', this.Dal.col('AmountAdjusted'))],
            where: [this.Dal.literal('`PatientId` = ' + req.Id),
            {
                'Status': 1,
                'ReceiptTypeId': 1,
                'ReceiptStatusId': 1
            }]
        }, 'AmountAdjusted');
        attributes.include.push(adjustedQry);

        let result = await this.GetById(req.Id, { include: include, attributes: attributes });
        return this.GetAttribute(result);
    }
    public async GetPatientInfoById(req: BaseRequest): Promise<PatientAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('Gender'));
        include.push(this.GetReference('Title'));
        include.push(this.GetReference('PatientStatus'));
        include.push(this.GetReference('MaritalStatus'));
        include.push(this.GetReference('Religion'));
        include.push(this.GetReference('Nationality'));
        include.push(this.GetReference('BloodGroup'));
        include.push({ model: this.Models.Occupation, required: false });
        include.push({
            model: this.Models.Encounter,
            required: false,
            where: { 'IsLatest': true },
            include: [
                {
                    model: this.Models.EncounterDoctor,
                    required: false,
                    include: [
                        {
                            model: this.Models.Department,
                            required: false,
                            include: [{ model: this.Models.Speciality, required: false }]
                        },
                        this.GetReference('ConsultationStatus')
                    ]
                },
                {
                    model: this.Models.EncounterGuarantor,
                    required: false,
                    where: { 'Rank': 1 },
                    include: [
                        {
                            model: this.Models.Guarantor,
                            required: false,
                            include: [
                                { model: this.Models.GuarantorAgreement, required: false }
                            ]
                        },
                        { model: this.Models.GuarantorCustomer, required: false },
                        this.GetReference('GuarantorType')
                    ]
                },
                {
                    model: this.Models.PatientGuarantor,
                    required: false,
                    include: [
                        {
                            model: this.Models.Guarantor,
                            required: false,
                            include: [
                                { model: this.Models.GuarantorAgreement, required: false }
                            ]
                        },
                        { model: this.Models.GuarantorCustomer, required: false },
                        this.GetReference('GuarantorType')
                    ]
                },
                { model: this.Models.Remark, as: 'VisitReason', required: false },
                this.GetReference('VisitType')
            ]
        });

        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetPatientByIdForPharmacy(req: BaseRequest): Promise<PatientAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('Gender'));
        include.push(this.GetReference('Title'));
        include.push(this.GetReference('PatientStatus'));
        include.push(this.GetReference('MaritalStatus'));
        include.push(this.GetReference('Religion'));
        include.push(this.GetReference('Nationality'));
        include.push(this.GetReference('BloodGroup'));
        include.push({ model: this.Models.Guarantor, attributes: ['GuarantorName'], required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'DeathUpdated', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'DeathApproved', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Referral, attributes: ['ReferralCode', 'ReferralName'], as: 'Referrer', required: false,
        });

        include.push({
            model: this.Models.Encounter, attributes: ['EncounterId', 'AppointmentId', 'VisitIdentifier',
                'AdmissionDate', 'DischargeDate', 'EncounterStatusId', 'DoctorName', 'GuarantorId', 'AdmissionStatusId', 'IsBillLock',
                'EncounterTypeId', 'IsLatest', 'Id',
                'DepartmentId', 'DoctorId', 'Comments', 'PatientLocation',
                'GuarantorTypeId', 'PromotionalSchemeId'
            ],
            required: false, where: { 'IsLatest': true },
            include: [{
                model: this.Models.EncounterDoctor, required: false,
                attributes: ['DoctorId', 'DoctorName', 'DepartmentId', 'StartDate', 'EndDate',
                    'EncounterDoctorStatus', 'IsPrimary'],
                include: [{ model: this.Models.Department, attributes: ['DepartmentName'], required: false },
                this.GetReference('ConsultationStatus')]
            }, {
                model: this.Models.EncounterGuarantor, attributes: ['EncounterGuarantorId', 'GuarantorTypeId', 'GuarantorId'],
                required: false, where: { 'Rank': 1 }
            },
            {
                model: this.Models.PromotionalScheme, attributes: ['Id', 'PromotionSchemeName', 'PromotionSchemeCode'],
                required: false,
                include: [
                    {
                        model: this.Models.PromotionalSchemeDetail,
                        required: false,
                    },
                ]
            }
            ]
        });

        let attributes: any = {};
        attributes['include'] = [];
        let billQry = this.GetSelectQuery(this.Models.PatientBills, {
            attributes: [this.Dal.fn('SUM', this.Dal.col('OutStandingAmount'))],
            where: [this.Dal.literal('`PatientId` = ' + req.Id),
            {
                'Status': 1,
                'PatientBillStatusId': 3,
                'BillTypeId': 4,
                'IsPharmacyBill': 1
            }]
        }, 'OutStandingAmount');
        attributes.include.push(billQry);

        let opbillQry = this.GetSelectQuery(this.Models.PatientBills, {
            attributes: [this.Dal.fn('SUM', this.Dal.col('BillAmount'))],
            where: [this.Dal.literal('`PatientId` = ' + req.Id),
            {
                'BillTypeId': 4,
                'Status': 1,
                'PatientBillStatusId': 3
            }]
        }, 'OPBillsAmount');
        attributes.include.push(opbillQry);

        let opbilldiscountQry = this.GetSelectQuery(this.Models.PatientBills, {
            attributes: [this.Dal.fn('SUM', this.Dal.col('BillDiscount'))],
            where: [this.Dal.literal('`PatientId` = ' + req.Id),
            {
                'BillTypeId': 4,
                'Status': 1,
                'PatientBillStatusId': 3
            }]
        }, 'OPBillsDiscountAmount');
        attributes.include.push(opbilldiscountQry);

        let opbillroundoffQry = this.GetSelectQuery(this.Models.PatientBills, {
            attributes: [this.Dal.fn('SUM', this.Dal.col('RoundOffValue'))],
            where: [this.Dal.literal('`PatientId` = ' + req.Id),
            {
                'BillTypeId': 4,
                'Status': 1,
                'PatientBillStatusId': 3
            }]
        }, 'OPBillsRoundedAmount');
        attributes.include.push(opbillroundoffQry);

        let ipbillQry = this.GetSelectQuery(this.Models.PatientBills, {
            attributes: [this.Dal.fn('SUM', this.Dal.col('BillAmount'))],
            where: [this.Dal.literal('`PatientId` = ' + req.Id),
            {
                'BillTypeId': 2,
                'Status': 1,
                'PatientBillStatusId': 3
            }]
        }, 'IPBillsAmount');
        attributes.include.push(ipbillQry);

        let ipbilldiscountQry = this.GetSelectQuery(this.Models.PatientBills, {
            attributes: [this.Dal.fn('SUM', this.Dal.col('BillDiscount'))],
            where: [this.Dal.literal('`PatientId` = ' + req.Id),
            {
                'BillTypeId': 2,
                'Status': 1,
                'PatientBillStatusId': 3
            }]
        }, 'IPBillsDiscountAmount');
        attributes.include.push(ipbilldiscountQry);

        let ipbillroundoffQry = this.GetSelectQuery(this.Models.PatientBills, {
            attributes: [this.Dal.fn('SUM', this.Dal.col('RoundOffValue'))],
            where: [this.Dal.literal('`PatientId` = ' + req.Id),
            {
                'BillTypeId': 2,
                'Status': 1,
                'PatientBillStatusId': 3
            }]
        }, 'IPBillsRoundedAmount');
        attributes.include.push(ipbillroundoffQry);

        let paidQry = this.GetSelectQuery(this.Models.PatientPaymentDetails, {
            attributes: [this.Dal.fn('SUM', this.Dal.col('AmountPaid'))],
            where: [this.Dal.literal('`PatientId` = ' + req.Id),
            {
                'Status': 1,
                'ReceiptStatusId': 1
            }]
        }, 'AmountPaid');
        attributes.include.push(paidQry);

        let refundQry = this.GetSelectQuery(this.Models.PatientRefund, {
            attributes: [this.Dal.fn('SUM', this.Dal.col('RefundAmount'))],
            where: [this.Dal.literal('`PatientId` = ' + req.Id),
            {
                'Status': 1,
                'RefundStatusId': 1
            }]
        }, 'AmountRefunded');
        attributes.include.push(refundQry);

        let result = await this.GetById(req.Id, { include: include, attributes: attributes });
        return this.GetAttribute(result);
    }

    public async GetPatients(apiReq?: ApiRequest<PatientFilters>): Promise<ApiResponse<PatientAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let attributes: any = {};
        attributes['include'] = [];

        let mrnshortcode = 0;
        let facilityprebo = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
        let facilityPreferencesData =
            await facilityprebo.GetPrintPreferences('billing', null, this.Session.FacilityId);
        if (facilityPreferencesData && facilityPreferencesData.mrnshortcode) {
            try {
                mrnshortcode = parseInt(facilityPreferencesData.mrnshortcode);
            } catch (ex) { mrnshortcode = 0; }
        }

        include.push(this.GetReference('Gender'));
        include.push(this.GetReference('Title'));
        include.push(this.GetReference('PatientStatus'));
        include.push(this.GetReference('MaritalStatus'));
        include.push(this.GetReference('GuardianType'));
        include.push(this.GetReference('ReferralType'));
        include.push(this.GetReference('PatientType'));
        include.push(this.GetReference('BloodGroup'));
        include.push(this.GetReference('Nationality'));
        include.push(this.GetReference('VipType'));
        include.push(this.GetReference('Religion'));
        include.push({ model: this.Models.CityMaster, attributes: ['CityName'], required: false });
        include.push({ model: this.Models.CountryMaster, attributes: ['CountryName'], required: false });
        include.push({ model: this.Models.StateMaster, attributes: ['StateName'], required: false });
        include.push({ model: this.Models.DistrictMaster, attributes: ['DistrictName'], required: false });
        include.push({ model: this.Models.Occupation, attributes: ['Occupations', 'Code'], required: false });
        include.push({ model: this.Models.Guarantor, attributes: ['GuarantorName'], required: false });
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.Remark, required: false });
        include.push({
            model: this.Models.Referral, attributes:
                ['ReferralName', 'ReferralCode', 'AddressLine1', 'PhoneNo', 'CityId'], required: false,
            include: [
                { model: this.Models.CityMaster, required: false }
            ]
        });
        include.push({
            model: this.Models.User, as: 'CreatedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'UpdatedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        let includeApptQuery = false;
        let apptQryJoin: any = {
            model: this.Models.Appointment,
            attributes: ['AppointmentDate', 'StartTime', 'AppointmentStatusId', 'Id', 'FacilityId'],
            required: false,
            include: [this.GetReference('AppointmentStatus'),
            { model: this.Models.Remark, attributes: ['Remarks'], required: false },
            {
                model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false,
                include: [this.GetReference('Title')]
            },
            { model: this.Models.Department, attributes: ['DepartmentName'], required: false },
            {
                model: this.Models.Encounter, attributes: ['EncounterId', 'VisitIdentifier',
                    'Comments', 'DoctorId', 'VisitTypeId', 'AdmissionDate', 'DischargeDate',
                    'DepartmentId', 'ReferralId', 'DoctorName', 'GuarantorId', 'TeamId',
                    'IsNoBill', 'IsPaidVisit', 'FreeVisit', 'EncounterTypeId', 'DiagnosisId', 'OtherDiagnosis'], required: false
            }]
        };
        let encounterQryJoin: any = {
            model: this.Models.Encounter,
            include: [this.GetReference('AdmissionStatus', ['Description', 'ColorCode']),
            this.GetReference('AdmittingReason'),
            this.GetReference('AppointmentStatus'),
            this.GetReference('VisitType'),
            this.GetReference('EncounterType'),
            this.GetReference('ReferralType'),
            {
                model: this.Models.WardMaster, attributes: ['WardName'], required: false,
            },
            {
                model: this.Models.WardRoomMaster, attributes: ['Id', 'RoomNo', 'Description'], required: false,
            },
            {
                model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
            },
            {
                model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'Qualification',
                    'PhotoPath', 'SignPath'], required: false,
                include: [this.GetReference('Title')]
            },
            { model: this.Models.Department, attributes: ['DepartmentName'], required: false },
            {
                model: this.Models.Guarantor, attributes: ['GuarantorName', 'TPAId'], required: false,
                include: [this.GetReference('TPA')]
            }
            ],
            required: false, where: { 'IsLatest': true }
        };

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientFilters.Name:
                        if (mrnshortcode > 0) {
                            (where as any)['$or'] = [{ 'FirstName': { '$like': (param.Value || '') + '%' } },
                            { 'MiddleName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'FamilyUniqueId': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'MRNShortCode': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'Mobile': { '$like': '%' + (param.Value || '') + '%' } }];
                        } else {
                            (where as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'MiddleName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'FamilyUniqueId': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'MRNShortCode': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'Mobile': { '$like': '%' + (param.Value || '') + '%' } }];
                        }
                        break;
                    case PatientFilters.VisitID:
                        encounterQryJoin = {
                            model: this.Models.Encounter, attributes: ['EncounterId', 'VisitIdentifier',
                                'EncounterTypeId', 'DischargeDate', 'AppointmentId'],
                            include: [
                                this.GetReference('AdmissionStatus'),
                                { model: this.Models.Appointment, attributes: ['AppointmentDate', 'StartTime', 'Id'], required: false },
                                { model: this.Models.WardMaster, attributes: ['WardName', 'WardMasterTypeId'], required: false },
                                { model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false },
                                { model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description'], required: false },
                            ],
                            required: true, where: { 'VisitIdentifier': param.Value }
                        };
                        break;
                    case PatientFilters.MRN:
                        where['MRN'] = param.Value;
                        break;
                    case PatientFilters.DOB:
                        where['DOB'] = param.Value;
                        break;
                    case PatientFilters.PhoneNumber:
                        (where as any)['$or'] = [{ 'LandLine': param.Value },
                        { 'Mobile': param.Value }];
                        break;
                    case PatientFilters.RegisteredDate:
                        where['RegisteredDate'] = { '$between': param.Value || '' };
                        break;
                    case PatientFilters.PatientStatus:
                        where['PatientStatusId'] = param.Value;
                        break;
                    case PatientFilters.IncludeAppointments:
                        includeApptQuery = true;
                        break;
                    case PatientFilters.From:
                        where['RegisteredDate'] = where['RegisteredDate'] || {};
                        (where['RegisteredDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientFilters.To:
                        where['RegisteredDate'] = where['RegisteredDate'] || {};
                        (where['RegisteredDate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientFilters.FromDate:
                        where['DeactivatedDate'] = where['DeactivatedDate'] || {};
                        (where['DeactivatedDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientFilters.ToDate:
                        where['DeactivatedDate'] = where['DeactivatedDate'] || {};
                        (where['DeactivatedDate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientFilters.ReferrerId:
                        where['ReferrerId'] = param.Value;
                        break;
                    case PatientFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    case PatientFilters.Pincode:
                        where['Pincode'] = param.Value;
                        break;
                    case PatientFilters.CountryName:
                        (where as any)['$or'] = [{ 'Country': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientFilters.StateName:
                        (where as any)['$or'] = [{ 'State': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientFilters.CityTownName:
                        (where as any)['$or'] = [{ 'City': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientFilters.Area:
                        (where as any)['$or'] = [{ 'Area': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientFilters.AppointmentStatus:
                        includeApptQuery = true;
                        let apptFilter = param.Value;
                        let apptWhere: any = {};
                        if (apptFilter.AppointmentStatus) {
                            apptWhere['AppointmentStatusId'] = apptFilter.AppointmentStatus;
                        }
                        if (apptFilter.My) {
                            apptWhere['AssignedUserId'] = this.Session.UserId;
                        }
                        if (apptFilter.IsPreviousPatient) {
                            apptWhere['AppointmentStatusId'] = 11;
                            apptWhere['AssignedUserId'] = this.Session.UserId;
                        }
                        apptQryJoin['required'] = true;
                        apptQryJoin['where'] = apptWhere;
                        break;
                    case PatientFilters.VisitDate:
                        let encounterJoinQry = {
                            model: this.Models.Encounter,
                            attributes: ['DoctorId', 'DoctorName'],
                            required: true,
                            where: { 'AdmissionDate': param.Value }
                        };
                        include.push(encounterJoinQry);
                        break;
                    case PatientFilters.ConsultationStatus:
                        break;
                    case PatientFilters.ShowTempPatient:
                        if (param.Value) {
                            where['MRNTypeId'] = 1;
                        } else {
                            where['MRNTypeId'] = 2;
                        }
                        break;
                    case PatientFilters.IsVistInProgress:
                        encounterQryJoin['required'] = param.Value;
                        break;
                    case PatientFilters.IsBillOutStanding:
                        let billQry = this.GetSelectQuery(this.Models.PatientBills, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('OutStandingAmount'))],
                            where: [this.Dal.literal('`PatientId` = `Patient`.`PatientId`'),
                            {
                                'Status': 1,
                                'PatientBillStatusId': 3
                            }]
                        }, 'OutStandingAmount');
                        attributes.include.push(billQry);
                        break;
                    case PatientFilters.NRIC:
                        if (mrnshortcode > 0) {
                            (where as any)['$or'] = [{ 'MRN': { '$eq': param.Value } },
                            { 'NationalityIdentifier': { '$like': (param.Value || '') + '%' } }];
                        } else {
                            (where as any)['$or'] = [{ 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'NationalityIdentifier': { '$like': (param.Value || '') + '%' } }];
                        }
                        break;
                    case PatientFilters.visiteddate:
                        encounterQryJoin = {
                            model: this.Models.Encounter, attributes: ['DoctorId', 'DoctorName', 'AdmissionDate'],
                            required: true, where: { 'AdmissionDate': { '$between': param.Value || '' } }
                        };
                        break;
                    case PatientFilters.IsAdmitted:
                        encounterQryJoin = {
                            model: this.Models.Encounter,
                            attributes: ['DoctorId', 'DoctorName', 'EncounterTypeId', 'IsLatest'],
                            required: true, where: { 'EncounterTypeId': param.Value, 'IsLatest': true }
                        };
                        break;
                    case PatientFilters.EncFacilityId:
                        includeApptQuery = true;
                        let facilityWhere: any = {};
                        facilityWhere['FacilityId'] = param.Value;
                        apptQryJoin['required'] = false;
                        apptQryJoin['where'] = facilityWhere;
                        let encfacilityWhere: any = {};
                        encfacilityWhere['FacilityId'] = param.Value;
                        encfacilityWhere['IsLatest'] = true;
                        encounterQryJoin['required'] = false;
                        encounterQryJoin['where'] = encfacilityWhere;
                        break;
                    case PatientFilters.PatFacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientFilters.GuardianName:
                        (where as any)['$or'] = [{ 'GuardianName': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    case PatientFilters.Staff:
                        where['Staff'] = param.Value;
                        break;
                    case PatientFilters.VisitTypeId:
                        encounterQryJoin = {
                            model: this.Models.Encounter,
                            attributes: ['DoctorId', 'DoctorName', 'EncounterTypeId', 'VisitTypeId'],
                            required: true, where: { 'VisitTypeId': param.Value }
                        };
                        break;
                    case PatientFilters.MRNShortCode:
                        (where as any)['$or'] = [{ 'MRNShortCode': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        // where['MRNShortCode'] = param.Value;
                        break;
                    case PatientFilters.UserId:
                        where['UserId'] = param.Value;
                        break;
                    case PatientFilters.MRNTypeId:
                        where['MRNTypeId'] = param.Value;
                        break;
                    case PatientFilters.FamilyUniqueId:
                        where['FamilyUniqueId'] = param.Value;
                        break;
                    case PatientFilters.ParentPatientId:
                        where['ParentPatientId'] = param.Value;
                        break;
                    case PatientFilters.CardNo:
                        (where as any)['$or'] = [{ 'CardNo': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case PatientFilters.CreatedAt:
                        where['CreatedAt'] = { '$between': param.Value || '' };
                        break;

                    case PatientFilters.FromCre:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$gte'] = param.Value;
                        break;
                    case PatientFilters.ToCre:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$lte'] = param.Value;
                        break;
                    case PatientFilters.IsEmergencyPatient:
                        where['IsEmergencyPatient'] = param.Value;
                        break;
                    case PatientFilters.IsExcelUpload:
                        where['IsExcelUpload'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        if (includeApptQuery) {
            include.push(apptQryJoin);
        }
        order.push(['RegisteredDate', 'DESC']);
        include.push(encounterQryJoin);
        apiReq.Attributes = apiReq.Attributes || attributes;
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetPatientSearch(apiReq?: ApiRequest<PatientFilters>): Promise<ApiResponse<PatientAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let attributes: any = {};
        attributes['include'] = [];

        let mrnshortcode = 0;
        let facilityprebo = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
        let facilityPreferencesData =
            await facilityprebo.GetPrintPreferences('billing', null, this.Session.FacilityId);
        if (facilityPreferencesData && facilityPreferencesData.mrnshortcode) {
            try {
                mrnshortcode = parseInt(facilityPreferencesData.mrnshortcode);
            } catch (ex) { mrnshortcode = 0; }
        }

        include.push(this.GetReference('Gender'));
        include.push(this.GetReference('Title'));
        include.push(this.GetReference('PatientStatus'));
        include.push(this.GetReference('MaritalStatus'));
        include.push(this.GetReference('GuardianType'));
        include.push(this.GetReference('PatientType'));
        include.push(this.GetReference('BloodGroup'));
        include.push(this.GetReference('Nationality'));
        include.push(this.GetReference('VipType'));
        include.push(this.GetReference('Religion'));
        // include.push({ model: this.Models.Occupation, attributes: ['Occupations', 'Code'], required: false });
        // include.push({ model: this.Models.Guarantor, attributes: ['GuarantorName'], required: false });
        // include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        // include.push({ model: this.Models.Remark, required: false });
        // include.push({ model: this.Models.CityMaster, required: false });
        let encounterQryJoin: any = {
            model: this.Models.Encounter,
            include: [this.GetReference('AdmissionStatus', ['Description', 'ColorCode']),
            this.GetReference('AdmittingReason'),
            this.GetReference('AppointmentStatus'),
            this.GetReference('VisitType'),
            this.GetReference('EncounterType'),
            this.GetReference('ReferralType'),
            // {
            //     model: this.Models.WardMaster, attributes: ['WardName'], required: false,
            // },
            // {
            //     model: this.Models.WardRoomMaster, attributes: ['Id', 'RoomNo', 'Description'], required: false,
            // },
            // {
            //     model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
            // },
            {
                model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'Qualification',
                    'PhotoPath', 'SignPath'], required: false,
                include: [this.GetReference('Title')]
            },
            { model: this.Models.Department, attributes: ['DepartmentName'], required: false },
            {
                model: this.Models.Guarantor, attributes: ['GuarantorName', 'TPAId'], required: false,
                include: [this.GetReference('TPA')]
            }
            ],
            required: false, where: { 'IsLatest': true }
        };

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientFilters.Name:
                        if (mrnshortcode > 0) {
                            (where as any)['$or'] = [{ 'FirstName': { '$like': (param.Value || '') + '%' } },
                            { 'MiddleName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'FamilyUniqueId': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'MRNShortCode': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'Mobile': { '$like': '%' + (param.Value || '') + '%' } }];
                        } else {
                            (where as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'MiddleName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'FamilyUniqueId': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'MRNShortCode': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'Mobile': { '$like': '%' + (param.Value || '') + '%' } }];
                        }
                        break;
                    case PatientFilters.VisitID:
                        encounterQryJoin = {
                            model: this.Models.Encounter, attributes: ['EncounterId', 'VisitIdentifier',
                                'EncounterTypeId', 'DischargeDate', 'AppointmentId'],
                            include: [
                                this.GetReference('AdmissionStatus'),
                                { model: this.Models.Appointment, attributes: ['AppointmentDate', 'StartTime', 'Id'], required: false },
                                { model: this.Models.WardMaster, attributes: ['WardName', 'WardMasterTypeId'], required: false },
                                { model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false },
                                { model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description'], required: false },
                            ],
                            required: true, where: { 'VisitIdentifier': param.Value }
                        };
                        break;
                    case PatientFilters.MRN:
                        where['MRN'] = param.Value;
                        break;
                    case PatientFilters.DOB:
                        where['DOB'] = param.Value;
                        break;
                    case PatientFilters.PhoneNumber:
                        (where as any)['$or'] = [{ 'LandLine': param.Value },
                        { 'Mobile': param.Value }];
                        break;
                    case PatientFilters.RegisteredDate:
                        where['RegisteredDate'] = { '$between': param.Value || '' };
                        break;
                    case PatientFilters.PatientStatus:
                        where['PatientStatusId'] = param.Value;
                        break;
                    // case PatientFilters.IncludeAppointments:
                    //     includeApptQuery = true;
                    //     break;
                    case PatientFilters.From:
                        where['RegisteredDate'] = where['RegisteredDate'] || {};
                        (where['RegisteredDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientFilters.To:
                        where['RegisteredDate'] = where['RegisteredDate'] || {};
                        (where['RegisteredDate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientFilters.FromDate:
                        where['DeactivatedDate'] = where['DeactivatedDate'] || {};
                        (where['DeactivatedDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientFilters.ToDate:
                        where['DeactivatedDate'] = where['DeactivatedDate'] || {};
                        (where['DeactivatedDate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientFilters.ReferrerId:
                        where['ReferrerId'] = param.Value;
                        break;
                    case PatientFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    case PatientFilters.Pincode:
                        where['Pincode'] = param.Value;
                        break;
                    case PatientFilters.CountryName:
                        (where as any)['$or'] = [{ 'Country': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientFilters.StateName:
                        (where as any)['$or'] = [{ 'State': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientFilters.CityTownName:
                        (where as any)['$or'] = [{ 'City': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientFilters.Area:
                        (where as any)['$or'] = [{ 'Area': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientFilters.VisitDate:
                        let encounterJoinQry = {
                            model: this.Models.Encounter,
                            attributes: ['DoctorId', 'DoctorName'],
                            required: true,
                            where: { 'AdmissionDate': param.Value }
                        };
                        include.push(encounterJoinQry);
                        break;
                    case PatientFilters.ConsultationStatus:
                        break;
                    case PatientFilters.ShowTempPatient:
                        if (param.Value) {
                            where['MRNTypeId'] = 1;
                        } else {
                            where['MRNTypeId'] = 2;
                        }
                        break;
                    case PatientFilters.IsVistInProgress:
                        encounterQryJoin['required'] = param.Value;
                        break;
                    case PatientFilters.IsBillOutStanding:
                        let billQry = this.GetSelectQuery(this.Models.PatientBills, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('OutStandingAmount'))],
                            where: [this.Dal.literal('`PatientId` = `Patient`.`PatientId`'),
                            {
                                'Status': 1,
                                'PatientBillStatusId': 3
                            }]
                        }, 'OutStandingAmount');
                        attributes.include.push(billQry);
                        break;
                    case PatientFilters.NRIC:
                        if (mrnshortcode > 0) {
                            (where as any)['$or'] = [{ 'MRN': { '$eq': param.Value } },
                            { 'NationalityIdentifier': { '$like': (param.Value || '') + '%' } }];
                        } else {
                            (where as any)['$or'] = [{ 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'NationalityIdentifier': { '$like': (param.Value || '') + '%' } }];
                        }
                        break;
                    case PatientFilters.visiteddate:
                        encounterQryJoin = {
                            model: this.Models.Encounter, attributes: ['DoctorId', 'DoctorName', 'AdmissionDate'],
                            required: true, where: { 'AdmissionDate': { '$between': param.Value || '' } }
                        };
                        break;
                    case PatientFilters.IsAdmitted:
                        encounterQryJoin = {
                            model: this.Models.Encounter,
                            attributes: ['DoctorId', 'DoctorName', 'EncounterTypeId', 'IsLatest'],
                            required: true, where: { 'EncounterTypeId': param.Value, 'IsLatest': true }
                        };
                        break;
                    // case PatientFilters.EncFacilityId:
                    //     includeApptQuery = true;
                    //     let facilityWhere: any = {};
                    //     facilityWhere['FacilityId'] = param.Value;
                    //     apptQryJoin['required'] = false;
                    //     apptQryJoin['where'] = facilityWhere;
                    //     let encfacilityWhere: any = {};
                    //     encfacilityWhere['FacilityId'] = param.Value;
                    //     encfacilityWhere['IsLatest'] = true;
                    //     encounterQryJoin['required'] = false;
                    //     encounterQryJoin['where'] = encfacilityWhere;
                    //     break;
                    case PatientFilters.PatFacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientFilters.GuardianName:
                        (where as any)['$or'] = [{ 'GuardianName': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    case PatientFilters.Staff:
                        where['Staff'] = param.Value;
                        break;
                    case PatientFilters.VisitTypeId:
                        encounterQryJoin = {
                            model: this.Models.Encounter,
                            attributes: ['DoctorId', 'DoctorName', 'EncounterTypeId', 'VisitTypeId'],
                            required: true, where: { 'VisitTypeId': param.Value }
                        };
                        break;
                    case PatientFilters.MRNShortCode:
                        (where as any)['$or'] = [{ 'MRNShortCode': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        // where['MRNShortCode'] = param.Value;
                        break;
                    case PatientFilters.UserId:
                        where['UserId'] = param.Value;
                        break;
                    case PatientFilters.MRNTypeId:
                        where['MRNTypeId'] = param.Value;
                        break;
                    case PatientFilters.FamilyUniqueId:
                        where['FamilyUniqueId'] = param.Value;
                        break;
                    case PatientFilters.ParentPatientId:
                        where['ParentPatientId'] = param.Value;
                        break;
                    case PatientFilters.CardNo:
                        (where as any)['$or'] = [{ 'CardNo': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        // if (includeApptQuery) {
        //     include.push(apptQryJoin);
        // }
        order.push(['RegisteredDate', 'DESC']);
        // include.push(encounterQryJoin);
        apiReq.Attributes = apiReq.Attributes || attributes;
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetMinPatientSearch(apiReq?: ApiRequest<PatientFilters>): Promise<ApiResponse<PatientAttributes[]>> {
        let where: WhereOptions<any> = {};
        let encounterWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let attributes: any = {};
        attributes['include'] = [];

        let mrnshortcode = 0;
        let facilityprebo = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
        let facilityPreferencesData =
            await facilityprebo.GetPrintPreferences('billing', null, this.Session.FacilityId);
        if (facilityPreferencesData && facilityPreferencesData.mrnshortcode) {
            try {
                mrnshortcode = parseInt(facilityPreferencesData.mrnshortcode);
            } catch (ex) { mrnshortcode = 0; }
        }

        include.push(this.GetReference('Gender'));
        include.push(this.GetReference('Title'));
        include.push(this.GetReference('PatientStatus'));
        // include.push(this.GetReference('MaritalStatus'));
        // include.push(this.GetReference('GuardianType'));
        // include.push(this.GetReference('PatientType'));
        // include.push(this.GetReference('BloodGroup'));
        // include.push(this.GetReference('Nationality'));
        // include.push(this.GetReference('VipType'));
        // include.push(this.GetReference('Religion'));

        encounterWhere['IsLatest'] = true;
        let encounterQryJoin: any = {};
        // let encounterQryJoin: any = {
        //     model: this.Models.Encounter,
        //     include: [this.GetReference('AdmissionStatus', ['Description', 'ColorCode']),
        //     this.GetReference('AdmittingReason'),
        //     this.GetReference('AppointmentStatus'),
        //     this.GetReference('VisitType'),
        //     this.GetReference('EncounterType'),
        //     this.GetReference('ReferralType'),
        //     {
        //         model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'Qualification',
        //             'PhotoPath', 'SignPath'], required: false,
        //         include: [this.GetReference('Title')]
        //     },
        //     { model: this.Models.Department, attributes: ['DepartmentName'], required: false },
        //     {
        //         model: this.Models.Guarantor, attributes: ['GuarantorName', 'TPAId'], required: false,
        //         include: [this.GetReference('TPA')]
        //     }
        //     ],
        //     required: false, where: { 'IsLatest': true }
        // };

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientFilters.Name:
                        if (mrnshortcode > 0) {
                            (where as any)['$or'] = [{ 'FirstName': { '$like': (param.Value || '') + '%' } },
                            { 'MiddleName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'FamilyUniqueId': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'MRNShortCode': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'Mobile': { '$like': '%' + (param.Value || '') + '%' } }];
                        } else {
                            (where as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'MiddleName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'FamilyUniqueId': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'MRNShortCode': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'Mobile': { '$like': '%' + (param.Value || '') + '%' } }];
                        }
                        break;
                    case PatientFilters.VisitID:
                        encounterQryJoin = {
                            model: this.Models.Encounter, attributes: ['EncounterId', 'VisitIdentifier',
                                'EncounterTypeId', 'DischargeDate', 'AppointmentId'],
                            include: [
                                this.GetReference('AdmissionStatus'),
                                { model: this.Models.Appointment, attributes: ['AppointmentDate', 'StartTime', 'Id'], required: false },
                                { model: this.Models.WardMaster, attributes: ['WardName', 'WardMasterTypeId'], required: false },
                                { model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false },
                                { model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description'], required: false },
                            ],
                            required: true, where: { 'VisitIdentifier': param.Value }
                        };
                        break;
                    case PatientFilters.MRN:
                        where['MRN'] = param.Value;
                        break;
                    case PatientFilters.DOB:
                        where['DOB'] = param.Value;
                        break;
                    case PatientFilters.PhoneNumber:
                        (where as any)['$or'] = [{ 'LandLine': param.Value },
                        { 'Mobile': param.Value }];
                        break;
                    case PatientFilters.RegisteredDate:
                        where['RegisteredDate'] = { '$between': param.Value || '' };
                        break;
                    case PatientFilters.PatientStatus:
                        where['PatientStatusId'] = param.Value;
                        break;
                    case PatientFilters.From:
                        where['RegisteredDate'] = where['RegisteredDate'] || {};
                        (where['RegisteredDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientFilters.To:
                        where['RegisteredDate'] = where['RegisteredDate'] || {};
                        (where['RegisteredDate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientFilters.FromDate:
                        where['DeactivatedDate'] = where['DeactivatedDate'] || {};
                        (where['DeactivatedDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientFilters.ToDate:
                        where['DeactivatedDate'] = where['DeactivatedDate'] || {};
                        (where['DeactivatedDate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientFilters.ReferrerId:
                        where['ReferrerId'] = param.Value;
                        break;
                    case PatientFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    case PatientFilters.Pincode:
                        where['Pincode'] = param.Value;
                        break;
                    case PatientFilters.CountryName:
                        (where as any)['$or'] = [{ 'Country': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientFilters.StateName:
                        (where as any)['$or'] = [{ 'State': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientFilters.CityTownName:
                        (where as any)['$or'] = [{ 'City': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientFilters.Area:
                        (where as any)['$or'] = [{ 'Area': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientFilters.VisitDate:
                        let encounterJoinQry = {
                            model: this.Models.Encounter,
                            attributes: ['DoctorId', 'DoctorName'],
                            required: true,
                            where: { 'AdmissionDate': param.Value }
                        };
                        include.push(encounterJoinQry);
                        break;
                    case PatientFilters.ConsultationStatus:
                        break;
                    case PatientFilters.ShowTempPatient:
                        if (param.Value) {
                            where['MRNTypeId'] = 1;
                        } else {
                            where['MRNTypeId'] = 2;
                        }
                        break;
                    case PatientFilters.MRNTypes:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['MRNTypeId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientFilters.IsVistInProgress:
                        encounterQryJoin['required'] = param.Value;
                        break;
                    case PatientFilters.IsBillOutStanding:
                        let billQry = this.GetSelectQuery(this.Models.PatientBills, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('OutStandingAmount'))],
                            where: [this.Dal.literal('`PatientId` = `Patient`.`PatientId`'),
                            {
                                'Status': 1,
                                'PatientBillStatusId': 3
                            }]
                        }, 'OutStandingAmount');
                        attributes.include.push(billQry);
                        break;
                    case PatientFilters.NRIC:
                        if (mrnshortcode > 0) {
                            (where as any)['$or'] = [{ 'MRN': { '$eq': param.Value } },
                            { 'NationalityIdentifier': { '$like': (param.Value || '') + '%' } }];
                        } else {
                            (where as any)['$or'] = [{ 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'NationalityIdentifier': { '$like': (param.Value || '') + '%' } }];
                        }
                        break;
                    case PatientFilters.visiteddate:
                        encounterQryJoin = {
                            model: this.Models.Encounter, attributes: ['DoctorId', 'DoctorName', 'AdmissionDate'],
                            required: true, where: { 'AdmissionDate': { '$between': param.Value || '' } }
                        };
                        break;
                    case PatientFilters.IsAdmitted:
                        if (param.Value === 1) {
                            // encounterWhere['AdmissionDate'] = { '$between': param.Value || '' };
                            encounterWhere['EncounterTypeId'] = 1;
                            // encounterWhere['IsLatest'] = true;
                        }
                        break;
                    case PatientFilters.PatFacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientFilters.GuardianName:
                        (where as any)['$or'] = [{ 'GuardianName': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    case PatientFilters.Staff:
                        where['Staff'] = param.Value;
                        break;
                    case PatientFilters.VisitTypeId:
                        encounterQryJoin = {
                            model: this.Models.Encounter,
                            attributes: ['DoctorId', 'DoctorName', 'EncounterTypeId', 'VisitTypeId'],
                            required: true, where: { 'VisitTypeId': param.Value }
                        };
                        break;
                    case PatientFilters.MRNShortCode:
                        (where as any)['$or'] = [{ 'MRNShortCode': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        // where['MRNShortCode'] = param.Value;
                        break;
                    case PatientFilters.UserId:
                        where['UserId'] = param.Value;
                        break;
                    case PatientFilters.MRNTypeId:
                        where['MRNTypeId'] = param.Value;
                        break;
                    case PatientFilters.FamilyUniqueId:
                        where['FamilyUniqueId'] = param.Value;
                        break;
                    case PatientFilters.ParentPatientId:
                        where['ParentPatientId'] = param.Value;
                        break;
                    case PatientFilters.CardNo:
                        (where as any)['$or'] = [{ 'CardNo': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        let encounterJoin: any = {
            model: this.Models.Encounter,
            include: [this.GetReference('AdmissionStatus', ['Description', 'ColorCode']),
            this.GetReference('AdmittingReason'),
            this.GetReference('AppointmentStatus'),
            this.GetReference('VisitType'),
            this.GetReference('EncounterType'),
            this.GetReference('ReferralType'),
            {
                model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'Qualification',
                    'PhotoPath', 'SignPath'], required: false,
                include: [this.GetReference('Title')]
            },
            { model: this.Models.Department, attributes: ['DepartmentName'], required: false },
            {
                model: this.Models.Guarantor, attributes: ['GuarantorName', 'TPAId'], required: false,
                include: [this.GetReference('TPA')]
            }
            ],
            attributes: ['Id', 'VisitIdentifier', 'AdmissionDate',
                'DischargeDate',
                'EncounterTypeId', 'EncounterStatusId',
                'DoctorId', 'DepartmentId',
                'TeamId', 'VisitTypeId',
                'RemarkId', 'BillingStatusId',
                'BillingRemarks', 'IsLatest', 'DiagnosisId'],
            required: false,
            where: encounterWhere
        };
        order.push(['RegisteredDate', 'DESC']);
        // include.push(encounterQryJoin);
        include.push(encounterJoin);
        apiReq.Attributes = ['Id', 'TitleId', 'GenderId', 'FirstName', 'LastName', 'Age', 'DOB', 'MRN', 'Mobile', 'FacilityId',
            'PatientStatusId', 'RegisteredDate'
        ];
        apiReq.Attributes = apiReq.Attributes || attributes;
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async PrintIpForms(req: BaseRequest): Promise<FileInfo> {
        let data = await this.GetPatientById(req);
        let patientkinBo = BoFactory.GetBo(regbo.PatientKinBo, this.Request);
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientKinFilters.PatientId, Value: data.Id, }]
        };
        let patientkinData = await patientkinBo.GetPatientKins(apiReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(data.FacilityId);
        let info = {
            Patient: data,
            PatientKin: patientkinData[0],
            Preferences: printPreferencesData,
            IDS: req.Data.ids,
        };
        console.log('%data%', info);
        let pdfOption: any = null;
        let key = 'patientdata';
        if (info.IDS === 1) {
            key = 'admissionhistory';
        }
        if (info.IDS === 2) {
            key = 'anaesthesiarecord';
        }
        if (info.IDS === 3) {
            key = 'anestheticchecklist';
        }
        if (info.IDS === 4) {
            key = 'bloodrequisition';
        }
        if (info.IDS === 5) {
            key = 'checklistfordischargeofpatient';
        }
        if (info.IDS === 6) {
            key = 'clinicalchart';
        }
        if (info.IDS === 7) {
            key = 'consentforanesthesia';
        }
        if (info.IDS === 8) {
            key = 'consentform';
        }
        if (info.IDS === 9) {
            key = 'consentforsurgical';
        }
        if (info.IDS === 10) {
            key = 'consultingpage';
        }
        if (info.IDS === 11) {
            key = 'ctscanrequisition';
        }
        if (info.IDS === 12) {
            key = 'd&cnotes';
        }
        if (info.IDS === 13) {
            key = 'dailyorderform';
        }
        if (info.IDS === 14) {
            key = 'dischargeagainstmedicaladvice';
        }
        if (info.IDS === 15) {
            key = 'doctorvisitchargesheet';
        }
        if (info.IDS === 16) {
            key = 'intraoperativemonitoring';
        }
        if (info.IDS === 17) {
            key = 'medicationsheet';
        }
        if (info.IDS === 18) {
            key = 'patientdata';
        }
        if (info.IDS === 19) {
            key = 'dischargeclearance';
        }
        if (info.IDS === 20) {
            key = 'icuinitialassessment';
        }
        if (info.IDS === 21) {
            key = 'informedconsent';
        }
        if (info.IDS === 22) {
            key = 'patientregistration';
        }
        if (info.IDS === 23) {
            key = 'pdf1';
        }
        if (info.IDS === 24) {
            key = 'pdf2';
        }
        if (info.IDS === 25) {
            key = 'consentadmission';
        }
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
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
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public async GetPatientsInfoBanner(apiReq?: ApiRequest<PatientFilters>): Promise<ApiResponse<PatientAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let attributes: any = {};
        attributes['include'] = [];

        let mrnshortcode = 0;
        let facilityprebo = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
        let facilityPreferencesData =
            await facilityprebo.GetPrintPreferences('billing', null, this.Session.FacilityId);
        if (facilityPreferencesData && facilityPreferencesData.mrnshortcode) {
            try {
                mrnshortcode = parseInt(facilityPreferencesData.mrnshortcode);
            } catch (ex) { mrnshortcode = 0; }
        }

        include.push(this.GetReference('Gender'));
        include.push(this.GetReference('Title'));
        include.push(this.GetReference('PatientStatus'));
        include.push(this.GetReference('BloodGroup'));
        include.push(this.GetReference('Nationality'));
        include.push(this.GetReference('Religion'));
        include.push(this.GetReference('MaritalStatus'));
        include.push({ model: this.Models.CityMaster, attributes: ['CityName'], required: false });
        include.push({ model: this.Models.CountryMaster, attributes: ['CountryName'], required: false });
        include.push({ model: this.Models.StateMaster, attributes: ['StateName'], required: false });
        include.push({ model: this.Models.DistrictMaster, attributes: ['DistrictName'], required: false });
        include.push({ model: this.Models.Occupation, attributes: ['Occupations', 'Code'], required: false });
        include.push({ model: this.Models.Guarantor, attributes: ['GuarantorName'], required: false });
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({
            model: this.Models.Referral, attributes:
                ['ReferralName', 'ReferralCode', 'AddressLine1', 'PhoneNo', 'CityId'], required: false
        });
        let includeApptQuery = false;
        let apptQryJoin: any = {
            model: this.Models.Appointment,
            attributes: ['AppointmentDate', 'StartTime', 'AppointmentStatusId', 'Id', 'FacilityId'],
            required: false,
            include: [this.GetReference('AppointmentStatus'),
            { model: this.Models.Remark, attributes: ['Remarks'], required: false },
            {
                model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false,
                include: [this.GetReference('Title')]
            },
            { model: this.Models.Department, attributes: ['DepartmentName'], required: false },
            {
                model: this.Models.Encounter, attributes: ['EncounterId', 'VisitIdentifier',
                    'Comments', 'DoctorId', 'VisitTypeId', 'AdmissionDate', 'DischargeDate',
                    'DepartmentId', 'ReferralId', 'DoctorName', 'GuarantorId', 'TeamId',
                    'IsNoBill', 'IsPaidVisit', 'FreeVisit', 'EncounterTypeId', 'DiagnosisId',
                    'OtherDiagnosis', 'RemarkId'], required: false,
                include: [{ model: this.Models.Remark, as: 'Remark', attributes: ['Remarks'], required: false }]
            }]
        };
        let encounterQryJoin: any = {
            model: this.Models.Encounter,
            include: [this.GetReference('AdmissionStatus', ['Description', 'ColorCode']),
            this.GetReference('AdmittingReason'),
            this.GetReference('AppointmentStatus'),
            this.GetReference('VisitType'),
            this.GetReference('EncounterType'),
            // {
            //     model: this.Models.EncounterDoctor, required: false,
            // },
            {
                model: this.Models.Remark, as: 'Remark', attributes: ['Remarks'], required: false,
            },
            {
                model: this.Models.WardMaster, attributes: ['WardName'], required: false,
            },
            {
                model: this.Models.WardRoomMaster, attributes: ['Id', 'RoomNo', 'Description'], required: false,
            },
            {
                model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
            },
            {
                model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'Qualification',
                    'PhotoPath', 'SignPath'], required: false,
                include: [this.GetReference('Title')]
            },
            { model: this.Models.Department, attributes: ['DepartmentName'], required: false },
            { model: this.Models.Guarantor, attributes: ['GuarantorName'], required: false }
            ],
            required: false,
        };

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientFilters.Name:
                        if (mrnshortcode > 0) {
                            (where as any)['$or'] = [{ 'FirstName': { '$like': (param.Value || '') + '%' } },
                            { 'MiddleName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'Mobile': { '$like': '%' + (param.Value || '') + '%' } }];
                        } else {
                            (where as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'MiddleName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'Mobile': { '$like': '%' + (param.Value || '') + '%' } }];
                        }
                        break;
                    case PatientFilters.VisitID:
                        encounterQryJoin = {
                            model: this.Models.Encounter, attributes: ['EncounterId', 'VisitIdentifier',
                                'EncounterTypeId', 'DischargeDate', 'AppointmentId'],
                            include: [
                                this.GetReference('AdmissionStatus'),
                                { model: this.Models.Appointment, attributes: ['AppointmentDate', 'StartTime', 'Id'], required: false },
                                { model: this.Models.WardMaster, attributes: ['WardName', 'WardMasterTypeId'], required: false },
                                { model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false },
                                { model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description'], required: false },
                            ],
                            required: true, where: { 'VisitIdentifier': param.Value }
                        };
                        break;
                    case PatientFilters.MRN:
                        where['MRN'] = param.Value;
                        break;
                    case PatientFilters.DOB:
                        where['DOB'] = param.Value;
                        break;
                    case PatientFilters.PhoneNumber:
                        (where as any)['$or'] = [{ 'LandLine': param.Value },
                        { 'Mobile': param.Value }];
                        break;
                    case PatientFilters.RegisteredDate:
                        where['RegisteredDate'] = { '$between': param.Value || '' };
                        break;
                    case PatientFilters.PatientStatus:
                        where['PatientStatusId'] = param.Value;
                        break;
                    case PatientFilters.IncludeAppointments:
                        includeApptQuery = true;
                        break;
                    case PatientFilters.From:
                        where['RegisteredDate'] = where['RegisteredDate'] || {};
                        (where['RegisteredDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientFilters.To:
                        where['RegisteredDate'] = where['RegisteredDate'] || {};
                        (where['RegisteredDate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientFilters.FromDate:
                        where['DeactivatedDate'] = where['DeactivatedDate'] || {};
                        (where['DeactivatedDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientFilters.ToDate:
                        where['DeactivatedDate'] = where['DeactivatedDate'] || {};
                        (where['DeactivatedDate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientFilters.ReferrerId:
                        where['ReferrerId'] = param.Value;
                        break;
                    case PatientFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    case PatientFilters.Pincode:
                        where['Pincode'] = param.Value;
                        break;
                    case PatientFilters.CountryName:
                        (where as any)['$or'] = [{ 'Country': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientFilters.StateName:
                        (where as any)['$or'] = [{ 'State': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientFilters.CityTownName:
                        (where as any)['$or'] = [{ 'City': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientFilters.Area:
                        (where as any)['$or'] = [{ 'Area': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientFilters.AppointmentStatus:
                        includeApptQuery = true;
                        let apptFilter = param.Value;
                        let apptWhere: any = {};
                        if (apptFilter.AppointmentStatus) {
                            apptWhere['AppointmentStatusId'] = apptFilter.AppointmentStatus;
                        }
                        if (apptFilter.My) {
                            apptWhere['AssignedUserId'] = this.Session.UserId;
                        }
                        if (apptFilter.IsPreviousPatient) {
                            apptWhere['AppointmentStatusId'] = 11;
                            apptWhere['AssignedUserId'] = this.Session.UserId;
                        }
                        apptQryJoin['required'] = true;
                        apptQryJoin['where'] = apptWhere;
                        break;
                    case PatientFilters.VisitDate:
                        let encounterJoinQry = {
                            model: this.Models.Encounter,
                            attributes: ['DoctorId', 'DoctorName'],
                            required: true,
                            where: { 'AdmissionDate': param.Value }
                        };
                        include.push(encounterJoinQry);
                        break;
                    case PatientFilters.ConsultationStatus:
                        break;
                    case PatientFilters.ShowTempPatient:
                        if (param.Value) {
                            where['MRNTypeId'] = 1;
                        } else {
                            where['MRNTypeId'] = 2;
                        }
                        break;
                    case PatientFilters.IsVistInProgress:
                        encounterQryJoin['required'] = param.Value;
                        break;
                    case PatientFilters.IsBillOutStanding:
                        let billQry = this.GetSelectQuery(this.Models.PatientBills, {
                            attributes: [this.Dal.fn('SUM', this.Dal.col('OutStandingAmount'))],
                            where: [this.Dal.literal('`PatientId` = `Patient`.`PatientId`'),
                            {
                                'Status': 1,
                                'PatientBillStatusId': 3
                            }]
                        }, 'OutStandingAmount');
                        attributes.include.push(billQry);
                        break;
                    case PatientFilters.NRIC:
                        if (mrnshortcode > 0) {
                            (where as any)['$or'] = [{ 'MRN': { '$eq': param.Value } },
                            { 'NationalityIdentifier': { '$like': (param.Value || '') + '%' } }];
                        } else {
                            (where as any)['$or'] = [{ 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'NationalityIdentifier': { '$like': (param.Value || '') + '%' } }];
                        }
                        break;
                    case PatientFilters.visiteddate:
                        encounterQryJoin = {
                            model: this.Models.Encounter, attributes: ['DoctorId', 'DoctorName', 'AdmissionDate'],
                            required: true, where: { 'AdmissionDate': { '$between': param.Value || '' } }
                        };
                        break;
                    case PatientFilters.IsAdmitted:
                        encounterQryJoin = {
                            model: this.Models.Encounter,
                            attributes: ['DoctorId', 'DoctorName', 'EncounterTypeId'],
                            required: true, where: { 'EncounterTypeId': param.Value }
                        };
                        break;
                    case PatientFilters.EncFacilityId:
                        includeApptQuery = true;
                        let facilityWhere: any = {};
                        facilityWhere['FacilityId'] = param.Value;
                        apptQryJoin['required'] = false;
                        apptQryJoin['where'] = facilityWhere;
                        let encfacilityWhere: any = {};
                        encfacilityWhere['FacilityId'] = param.Value;
                        encfacilityWhere['IsLatest'] = true;
                        encounterQryJoin['required'] = false;
                        encounterQryJoin['where'] = encfacilityWhere;
                        break;
                    case PatientFilters.PatFacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientFilters.GuardianName:
                        (where as any)['$or'] = [{ 'GuardianName': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    case PatientFilters.Staff:
                        where['Staff'] = param.Value;
                        break;
                    case PatientFilters.VisitTypeId:
                        encounterQryJoin = {
                            model: this.Models.Encounter,
                            attributes: ['DoctorId', 'DoctorName', 'EncounterTypeId', 'VisitTypeId'],
                            required: true, where: { 'VisitTypeId': param.Value }
                        };
                        break;
                    case PatientFilters.MRNShortCode:
                        (where as any)['$or'] = [{ 'MRNShortCode': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        // where['MRNShortCode'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        if (includeApptQuery) {
            include.push(apptQryJoin);
        }
        order.push(['RegisteredDate', 'DESC']);
        include.push(encounterQryJoin);
        apiReq.Attributes = apiReq.Attributes || attributes;
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeletePatient(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async PrintPatient(req: BaseRequest): Promise<FileInfo> {
        let data = await this.GetPatientById(req);
        let patientkinBo = BoFactory.GetBo(regbo.PatientKinBo, this.Request);
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientKinFilters.PatientId, Value: data.Id }]
        };
        let patientkinData = await patientkinBo.GetPatientKins(apiReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(data.FacilityId);
        let info = {
            Patient: data,
            PatientKin: patientkinData[0],
            Preferences: printPreferencesData
        };
        let key = 'patient';
        if (req.Data) {
            key = 'registrationlabel';
        }
        return await Report.Generate(key, { header: {}, body: info });
    }
    public async regprintform(req: BaseRequest): Promise<FileInfo> {
        let Appnmt: any = [];
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: AppointmentFilters.Id, Value: req.Id }]
        };
        let AppBo = BoFactory.GetBo(appointmentbo.AppointmentBo, this.Request);
        let AppointmentData = await AppBo.GetAppointments(apiReq);
        Appnmt = AppointmentData.Data[0];
        let Patient: any = [];
        let PatientReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PatientFilters.Id, Value: Appnmt.PatientId }]
        };
        let PatientData = await this.GetPatients(PatientReq);
        Patient = PatientData.Data[0];
        let Encounter: any = [];
        let EncReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: EncounterFilters.PatientId, Value: Patient.Id }]
        };
        let encounterBO = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let EncData = await encounterBO.GetEncounters(EncReq);
        Encounter = EncData.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Patient.FacilityId);
        let info = {
            Patient: Patient,
            Encounter: Encounter,
            Preferences: printPreferencesData
        };
        let key = 'regprintform';
        return await Report.Generate(key, { header: {}, body: info });
    }

    public async PrintPatientWithEncounter(req: BaseRequest): Promise<FileInfo> {
        let data = await this.GetPatientById(req);
        let GuardianTypeId = 0;
        GuardianTypeId = data.GuardianTypeId;
        let patientkinBo = BoFactory.GetBo(regbo.PatientKinBo, this.Request);
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientKinFilters.PatientId, Value: data.Id }]
        };
        let patientkinData = await patientkinBo.GetPatientKins(apiReq);
        let Encounter: any = [];
        let EncounterId = req.Data.EncounterId;
        let TeamId = 0;
        if (EncounterId > 0) {
            let EncounterReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [
                    { Key: EncounterFilters.Id, Value: EncounterId }]
            };
            let encounterBO = BoFactory.GetBo(encbo.EncounterBo, this.Request);
            let EncounterData = await encounterBO.GetEncounters(EncounterReq);
            Encounter = EncounterData.Data[0];
            TeamId = EncounterData.Data[0].TeamId;
        }
        let Team: any = [];
        if (TeamId > 0) {
            let TeamReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [
                    { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: TeamId },
                    { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Team' }]
            };
            let TeamBO = BoFactory.GetBo(appbo.ReferenceValueBo, this.Request);
            let TeamData = await TeamBO.GetReferenceValues(TeamReq);
            Team = TeamData.Data[0];
        }

        let GuardianType: any = [];
        if (GuardianTypeId > 0) {
            let GuardianTypeReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [
                    { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: GuardianTypeId },
                    { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'GuardianType' }]
            };
            let GuardianTypeBO = BoFactory.GetBo(appbo.ReferenceValueBo, this.Request);
            let GuardianTypeData = await GuardianTypeBO.GetReferenceValues(GuardianTypeReq);
            GuardianType = GuardianTypeData.Data[0];
        }

        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(data.FacilityId);
        let info = {
            Patient: data,
            PatientKin: patientkinData[0],
            Encounter: Encounter,
            Team: Team,
            GuardianType: GuardianType,
            Preferences: printPreferencesData
        };

        // let key = 'patient';
        let pdfOption: any = null;
        let key = 'patient';
        let pdfOptionJSON = await Report.GetPdfOption(key);

        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'landscape',
                border: '0',
                header: {
                    height: '0.7in',
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
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }


    public async PrintPatientLabel(req: BaseRequest): Promise<FileInfo> {
        let data = await this.GetPatientById(req);
        let patientkinBo = BoFactory.GetBo(regbo.PatientKinBo, this.Request);
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientKinFilters.PatientId, Value: data.Id }]
        };
        let patientkinData = await patientkinBo.GetPatientKins(apiReq);
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.PatientId, Value: data.Id }]
        };
        let encounterData = await encounterBo.GetEncounters(encReq); // let Encounter: any = [];
        // let EncounterId = req.Data.EncounterId;
        // if (EncounterId > 0) {
        //     let EncounterReq = {
        //         Id: 0,
        //         PageContext: { PageSize: 50, PageNumber: 1 },
        //         Params: [
        //             { Key: EncounterFilters.Id, Value: EncounterId }]
        //     };
        //     let encounterBO = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        //     let EncounterData = await encounterBO.GetEncounters(EncounterReq);
        //     Encounter = EncounterData.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(data.FacilityId);
        let info = {
            Patient: data,
            PatientKin: patientkinData[0],
            Preferences: printPreferencesData,
            // Encounter: Encounter,
            Encounter: encounterData.Data[0],
        };
        let pdfOption: any = null;
        let key = 'patient';
        if (req.Data) {
            key = 'patientidcard';
            let pdfOptionJSON = await Report.GetPdfOption(key);
            if (!pdfOptionJSON) {
                pdfOption = {
                    format: 'A5',
                    orientation: 'landscape',
                    border: '0',
                    header: {
                        height: '0.20in',
                        contents: '',
                    },
                    footer: {
                        height: '0in',
                        contents: {
                            first: '',
                            default: '',
                            last: '',
                        },
                    },
                    type: 'pdf',

                    base: 'file://' + join(__dirname, '/../../Templates/assets/')
                };
            } else {
                pdfOption = JSON.parse(pdfOptionJSON);
                pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
                console.log(pdfOption);
            }

        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }


    public async PrintPatientCard(req: BaseRequest): Promise<string> {
        let data = await this.GetPatientById(req);
        let patientkinBo = BoFactory.GetBo(regbo.PatientKinBo, this.Request);
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientKinFilters.PatientId, Value: data.Id }]
        };
        let patientkinData = await patientkinBo.GetPatientKins(apiReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityIDCARDPreferenceWithLogo(data.FacilityId);

        if (printPreferencesData && printPreferencesData.heading1 === '')
            printPreferencesData.heading1 = null;
        if (printPreferencesData && printPreferencesData.heading2 === '')
            printPreferencesData.heading2 = null;

        let info = {
            Patient: data,
            PatientKin: patientkinData[0],
            Preferences: printPreferencesData
        };
        let pdfOption: any = null;
        let key = 'patient';
        if (req.Data) {
            key = 'patientcardprint';
            pdfOption = {
                format: 'A5',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '0.40in',
                    contents: '',
                },
                footer: {
                    height: '0in',
                    contents: {
                        first: '',
                        default: '',
                        last: '',
                    },
                },
                type: 'pdf',

                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };

        }
        return await Report.GenerateHtml(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintPatientList(apiReq?: ApiRequest<PatientFilters>): Promise<any> {
        let data = await this.GetPatients(apiReq);
        let Patient = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let PatientData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientData.FacilityId);
        let info = {
            Patient: Patient,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName
        };
        let pdfOption: any = null;
        let key = 'patientlist';
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
    public async PrintInActivePatientList(apiReq?: ApiRequest<PatientFilters>): Promise<any> {
        let data = await this.GetPatients(apiReq);
        let Patient = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let PatientData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientData.FacilityId);
        let info = {
            Patient: Patient,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName
        };
        let pdfOption: any = null;
        let key = 'inactivepatientlist';
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
    public async PrintPatientMedicalLeaveForm(req: BaseRequest): Promise<FileInfo> {
        let patientReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientFilters.Id, Value: req.Data.PatientId }]
        };

        let PatientBo = BoFactory.GetBo(bo.PatientBo, this.Request);
        let data = await PatientBo.GetPatients(patientReq);
        let PatientData = data.Data[0];

        let encounterReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Data.EncounterId }]
        };
        let encounterBO = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let EncounterData = await encounterBO.GetEncounters(encounterReq);
        let PatientEncounter = EncounterData.Data[0];

        let chiefcomplaintReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientClinicalNotesFilters.PatientId, Value: req.Data.PatientId },
            { Key: PatientClinicalNotesFilters.EncounterId, Value: req.Data.EncounterId }
            ]
        };

        let PatientClinicalNotesBo = BoFactory.GetBo(emrbo.PatientClinicalNotesBo, this.Request);
        let PatientClinicalNotesData = await PatientClinicalNotesBo.GetPatientClinicalNotess(chiefcomplaintReq);
        let PatientClinicalNotes = PatientClinicalNotesData.Data[0];
        let PatientClinicalNotesValue = '';
        if (PatientClinicalNotes) {
            PatientClinicalNotesValue = PatientClinicalNotes.ChiefComplaints;
        }
        let combinechiefcomplaintLine1 = '';
        let combinechiefcomplaintLine2 = '';
        let combinechiefcomplaintLine3 = '';
        if (PatientClinicalNotesValue) {
            if (PatientClinicalNotesValue.length > 0) {
                combinechiefcomplaintLine1 = PatientClinicalNotesValue.substring(0, 60);
                combinechiefcomplaintLine2 = PatientClinicalNotesValue.substring(61, 120);
                combinechiefcomplaintLine3 = PatientClinicalNotesValue.substring(121, 200);
            }

        }
        let DiagnosisReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientConditionFilters.PatientId, Value: req.Data.PatientId },
            { Key: PatientConditionFilters.EncounterId, Value: req.Data.EncounterId }
            ]
        };

        let PatientConditionBo = BoFactory.GetBo(emrbo.PatientConditionBo, this.Request);
        let PatientConditionData = await PatientConditionBo.GetPatientConditions(DiagnosisReq);
        let PatientCondition = PatientConditionData.Data[0];
        let PatientConditionValue = '';
        let PatientConditionCodeValue = '';
        if (PatientCondition) {
            PatientConditionValue = PatientCondition.DiagnosisName;
        }
        if (PatientCondition) {
            PatientConditionCodeValue = PatientCondition.Code;
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientData.FacilityId);
        let info = {
            Patient: PatientData,
            Encounter: PatientEncounter,
            PatientClinicalNotesValue: PatientClinicalNotesValue,
            combinechiefcomplaintLine1: combinechiefcomplaintLine1,
            combinechiefcomplaintLine2: combinechiefcomplaintLine2,
            combinechiefcomplaintLine3: combinechiefcomplaintLine3,
            PatientConditionValue: PatientConditionValue,
            PatientConditionCodeValue: PatientConditionCodeValue,
            Preferences: printPreferencesData
        };
        let pdfOption: any = null;
        let key = 'medicialcertificate';
        pdfOption = {
            format: 'A4',
            orientation: 'portrait',
            border: '0',
            header: {
                height: '0in',
                contents: '',
            },
            footer: {
                height: '0in',
                contents: {
                    first: '',
                    default: '',
                    last: '',
                },
            },
            type: 'pdf',

            base: 'file://' + join(__dirname, '/../../Templates/assets/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public GetModel(): SStatic.Model<PatientInstance, PatientAttributes> {
        return this.Models.Patient;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<PatientFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['FirstName', 'Text'],
            'FirstName', 'MiddleName', 'LastName', 'DOB', 'Age', 'Mobile', 'MRN', 'GenderId',
            'TitleId', 'PatientStatusId', 'GuarantorId', 'RegisteredDate'];
        let val = await this.GetPatients(apiReq);
        return { [key]: val.Data };
    }

    public async GetFacilityInfoDashBoard(req: BaseRequest): Promise<any> {
        let registrationCount = await this.Items.count({
            where: {
                'Status': 1,
                'CreatedAt': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
                'MRNTypeId': 2,
                'IsEmergencyPatient': 0
            }
        });
        let deseasedCount = await this.Items.count({
            where: {
                'Status': 1,
                'PatientStatusId': 4,
                'DeathUpdatedDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            }
        });
        return {
            'RegistrationCount': registrationCount,
            'DeseasedCount': deseasedCount
        };
    }

    public async ManageApptSchduledtoCancelled(ScheduleApptId: number): Promise<boolean> {
        if (ScheduleApptId > 0) {
            let AppBo = BoFactory.GetBo(appointmentbo.AppointmentBo, this.Request);
            await AppBo.DeleteAppointment({ Id: ScheduleApptId }); // Delete
        }
        return true;
    }

    public async ManageAutoLISAppointment(PatientId: number, PatientGuarantorId: number,
        req: BaseRequest, ApptDate: Date, ApptStartTime: string, ApptEndTime: string,
        B2BCustomerMasterId: number, ClinicalNotes: string): Promise<number> {
        let AppId: number;
        if (req.Data.Id <= 0) {
            let AppointmentData: any = {
                Data: {
                    Id: 0,
                    NoDraftBill: req.Data.NoDraftBill,
                    FacilityId: req.Data.FacilityId,
                    ReferralId: req.Data.ReferrerId,
                    ReferralTypeId: req.Data.ReferTypeId,
                    TeamId: req.Data.TeamId,
                    ReferralName: req.Data.ReferralName,
                    AppointmentCategoryId: 5,
                    AppointmentDate: ApptDate,
                    AppointmentStatusId: 6,
                    AppointmentTypeId: 1,
                    VisitTypeId: req.Data.VisitTypeId,
                    AssignedUserId: req.Data.DoctorId,
                    AssignedUserName: req.Data.DoctorName,
                    DepartmentId: req.Data.DepartmentId,
                    DoctorId: req.Data.DoctorId,
                    DiagnosisId: req.Data.DiagnosisId,
                    OtherDiagnosis: req.Data.OtherDiagnosis,
                    PatientId: PatientId,
                    PatientGuarantorId: PatientGuarantorId,
                    PriorityId: 3,
                    ValidateDuplicateEncounter: false,
                    OrderScheduledId: -1,
                    Comments: req.Data.Comments,
                    RemarkId: req.Data.RemarkId,
                    StartTime: ApptStartTime,
                    EndTime: ApptEndTime,
                    B2BCustomerMasterId: B2BCustomerMasterId,
                    ClinicalNotes: ClinicalNotes
                }
            };
            let AppBo = BoFactory.GetBo(appointmentbo.AppointmentBo, this.Request);
            AppId = await AppBo.ManageRegCumWithLIS(AppointmentData);
        } else {
            let AppointmentData: any = {
                Data: {
                    Id: 0,
                    NoDraftBill: req.Data.NoDraftBill,
                    FacilityId: req.Data.FacilityId,
                    ReferralId: req.Data.ReferrerId,
                    ReferralTypeId: req.Data.ReferTypeId,
                    ReferralName: req.Data.ReferralName,
                    AppointmentCategoryId: 5,
                    AppointmentDate: new Date(),
                    AppointmentStatusId: 6,
                    VisitTypeId: req.Data.VisitTypeId,
                    AppointmentTypeId: 1,
                    AssignedUserId: req.Data.DoctorId,
                    AssignedUserName: req.Data.DoctorName,
                    DepartmentId: req.Data.DepartmentId,
                    DoctorId: req.Data.DoctorId,
                    DiagnosisId: req.Data.DiagnosisId,
                    OtherDiagnosis: req.Data.OtherDiagnosis,
                    PatientId: PatientId,
                    PatientGuarantorId: PatientGuarantorId,
                    PriorityId: 3,
                    ValidateDuplicateEncounter: false,
                    OrderScheduledId: -1,
                    RemarkId: req.Data.RemarkId,
                    Comments: req.Data.Comments,
                    B2BCustomerMasterId: B2BCustomerMasterId,
                    ClinicalNotes: ClinicalNotes
                }
            };
            let AppBo = BoFactory.GetBo(appointmentbo.AppointmentBo, this.Request);
            AppId = await AppBo.ManageRegCumWithLIS(AppointmentData);
        }

        return AppId;
    }
    public async ManageAutoAppointment(PatientId: number, PatientGuarantorId: number, GuarantorId: number, PatientGuarantorTypeId: number,
        req: BaseRequest, ApptDate: Date, ApptStartTime: string, ApptEndTime: string): Promise<number> {
        let AppId: number;
        if (req.Data.AppointmentId <= 0 || !req.Data.AppointmentId) {
            let AppointmentData: any = {
                Data: {
                    Id: 0,
                    NoDraftBill: req.Data.NoDraftBill,
                    FacilityId: req.Data.FacilityId,
                    ReferralId: req.Data.ReferrerId,
                    ReferralTypeId: req.Data.ReferTypeId,
                    TeamId: req.Data.TeamId,
                    ReferralName: req.Data.ReferralName,
                    AppointmentCategoryId: 5,
                    AppointmentDate: ApptDate,
                    AppointmentStatusId: 6,
                    AppointmentTypeId: 1,
                    VisitTypeId: req.Data.VisitTypeId,
                    AssignedUserId: req.Data.DoctorId,
                    AssignedUserName: req.Data.DoctorName,
                    DepartmentId: req.Data.DepartmentId,
                    DoctorId: req.Data.DoctorId,
                    IsEmergency: req.Data.IsEmergencyPatient,
                    DiagnosisId: req.Data.DiagnosisId,
                    IsMLC: req.Data.IsMLC,
                    PromotionalSchemeId: req.Data.PromotionalSchemeId,
                    OtherDiagnosis: req.Data.OtherDiagnosis,
                    PatientId: PatientId,
                    PatientGuarantorId: PatientGuarantorId,
                    GuarantorId: GuarantorId,
                    InsuranceNumber: req.Data.InsuranceNumber,
                    TpaId: req.Data.TpaId,
                    PromotionSchemeId: req.Data.PromotionSchemeId,
                    PatientGuarantorTypeId: PatientGuarantorTypeId,
                    PriorityId: 3,
                    ValidateDuplicateEncounter: false,
                    OrderScheduledId: -1,
                    Comments: req.Data.Comments,
                    RemarkId: req.Data.RemarkId,
                    StartTime: ApptStartTime,
                    EndTime: ApptEndTime,
                    ServiceRateCategoryId: req.Data.ServiceRateCategoryId_
                }
            };
            let AppBo = BoFactory.GetBo(appointmentbo.AppointmentBo, this.Request);
            AppId = await AppBo.ManageRegCumWithBillAppointment(AppointmentData);
        } else {
            let AppointmentData: any = {
                Data: {
                    Id: req.Data.AppointmentId,
                    NoDraftBill: req.Data.NoDraftBill,
                    FacilityId: req.Data.FacilityId,
                    ReferralId: req.Data.ReferrerId,
                    ReferralTypeId: req.Data.ReferTypeId,
                    ReferralName: req.Data.ReferralName,
                    AppointmentCategoryId: 5,
                    AppointmentDate: new Date(),
                    AppointmentStatusId: 6,
                    VisitTypeId: req.Data.VisitTypeId,
                    AppointmentTypeId: 1,
                    AssignedUserId: req.Data.DoctorId,
                    AssignedUserName: req.Data.DoctorName,
                    DepartmentId: req.Data.DepartmentId,
                    DoctorId: req.Data.DoctorId,
                    DiagnosisId: req.Data.DiagnosisId,
                    IsMLC: req.Data.IsMLC,
                    OtherDiagnosis: req.Data.OtherDiagnosis,
                    TpaId: req.Data.TpaId,
                    PromotionSchemeId: req.Data.PromotionSchemeId,
                    PatientId: PatientId,
                    PatientGuarantorId: PatientGuarantorId,
                    PriorityId: 3,
                    ValidateDuplicateEncounter: false,
                    OrderScheduledId: -1,
                    RemarkId: req.Data.RemarkId,
                    Comments: req.Data.Comments,
                    ServiceRateCategoryId: req.Data.ServiceRateCategoryId_
                }
            };
            let AppBo = BoFactory.GetBo(appointmentbo.AppointmentBo, this.Request);
            AppId = await AppBo.ManageRegCumWithBillAppointment(AppointmentData);
        }

        return AppId;
    }

    public async ManageAutoAppointmentDisplay(PatientId: number, AppId: number, req: BaseRequest): Promise<number> {
        let AppDispId: number;
        let userboobj = BoFactory.GetBo(userbo.UserBo, this.Request);
        let AppDispBo = BoFactory.GetBo(appointmentbo.AppointmentDisplayBo, this.Request);
        let TokenNo = await AppDispBo.GetDRLastTokenCount(req.Data.DoctorId);
        let UserData = await userboobj.GetUserById({ Id: req.Data.DoctorId });
        let OPRoomId_ = UserData.OPDRoomId;
        if (!OPRoomId_) OPRoomId_ = 0;
        let AppointmentDispData: any = {
            Data: {
                Id: 0,
                AppointmentId: AppId,
                DepartmentId: req.Data.DepartmentId,
                TokenNo: TokenNo,
                DisplayNo: 1,
                DoctorId: req.Data.DoctorId,
                EncounterId: 0,
                FacilityId: req.Data.FacilityId,
                OrganizationId: 0,
                PatientId: PatientId,
                RoomNoId: OPRoomId_,
            }
        };
        if (req.Data.AppointmentStatusId === 2) {
            AppointmentDispData.Data.TokenNo = '';
            AppointmentDispData.Data.TokenStatusId = 0;
        }
        AppDispId = await AppDispBo.AddAppointmentDisplay(AppointmentDispData);
        return AppDispId;
    }

    public async ManageCrossConsultation(req: BaseRequest): Promise<boolean> {
        if (req && req.Data && req.Data.DrTrnsferIds && req.Data.Reg) {
            let details: any = req.Data.DrTrnsferIds;
            req.Data = req.Data.Reg;
            details = details || [];
            await Promise.all(details.map((DetailItem: any): Promise<void> => {
                return (async (detail): Promise<void> => {
                    req.Data.DoctorId = detail.DoctorId;
                    req.Data.DoctorName = detail.DoctorName;
                    req.Data.DepartmentId = detail.DepartmentId;
                    let AppId: number;
                    let AppDispId: number;
                    let PatientGuarantorId: number;
                    let ApptDate = new Date();
                    let after15mins = (ApptDate.getTime() + 15000 * 60);
                    let ApptStartTime = moment(ApptDate.getTime()).format('HH:mm');
                    let ApptEndTime = moment(after15mins).format('HH:mm');
                    if (req.Data.ScheduleApptId) {
                        if (req.Data.ScheduleApptStartTime && req.Data.ScheduleApptEndTime) {
                            ApptStartTime = req.Data.ScheduleApptStartTime;
                            ApptEndTime = req.Data.ScheduleApptEndTime;
                        }
                    }
                    let AppointmentData: any = {
                        Data: {
                            Id: 0,
                            NoDraftBill: req.Data.NoDraftBill,
                            FacilityId: req.Data.FacilityId,
                            ReferralId: req.Data.ReferredById,
                            AppointmentCategoryId: 5,
                            AppointmentDate: ApptDate,
                            AppointmentStatusId: 6,
                            AppointmentTypeId: 1,
                            VisitTypeId: req.Data.VisitTypeId,
                            AssignedUserId: req.Data.DoctorId,
                            AssignedUserName: req.Data.DoctorName,
                            DepartmentId: req.Data.DepartmentId,
                            DoctorId: req.Data.DoctorId,
                            PatientId: req.Data.PatientId,
                            PatientGuarantorId: PatientGuarantorId,
                            PriorityId: 3,
                            ValidateDuplicateEncounter: false,
                            OrderScheduledId: -1,
                            ReferralTypeId: req.Data.ReferralTypeId,
                            Comments: req.Data.Comments,
                            RemarkId: req.Data.RemarkId,
                            Remarks: req.Data.Remarks,
                            StartTime: ApptStartTime,
                            EndTime: ApptEndTime,
                            EncounterId: req.Data.EncounterId,
                        }
                    };
                    let AppBo = BoFactory.GetBo(appointmentbo.AppointmentBo, this.Request);
                    AppId = await AppBo.CrossConsultationAppointment(AppointmentData);
                    AppDispId = await this.ManageAutoAppointmentDisplay(req.Data.PatientId, AppId, req);
                    let encounterDocBO = BoFactory.GetBo(encbo.EncounterDoctorBo, this.Request);
                    await encounterDocBO.ManageEncounterDoctor(AppointmentData);


                })(DetailItem);
            }));

            return true;
        }
        return false;
    }

    public async AddDayCarePatient(req: BaseRequest): Promise<number> {
        let PatientId: number;
        PatientId = await this.ManagePatientWithBill(req);
        if (PatientId <= 0) {
            return -1;
        }
        req.Data.PatientId = PatientId;
        req.Data.AdmissionStatusId = 2;
        req.Data.Id = 0;
        req.Data.EncounterTypeId = 5;
        req.Data.AdmissionDate = new Date();
        req.Data.IsEmergencyVisit = true;
        let encounterBO = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        await encounterBO.ManageAdmissionEncounter(req);

        return PatientId;
    }

    public async UpdateDayCarePatient(req: BaseRequest): Promise<number> {
        let patientinfo = await this.GetPatientById({ Id: req.Data.PatientId });
        if (patientinfo) {
            req.Data.Id = req.Data.PatientId;
            await this.Update(req.Data);
        }
        // req.Data.PatientId = PatientId;
        req.Data.AdmissionStatusId = 2;
        req.Data.Id = 0;
        req.Data.EncounterTypeId = 5;
        req.Data.AdmissionDate = new Date();
        req.Data.IsEmergencyVisit = true;
        let encounterBO = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        await encounterBO.ManageAdmissionEncounter(req);

        return req.Data.PatientId;
    }

    public async RegCumVisitWithBill(req: BaseRequest): Promise<number> {
        let PatientId: number;
        let AppId: number;
        let AppDispId: number;
        let PatientGuarantorId: number;
        let GuarantorId: number;
        let PatientGuarantorTypeId: number;
        let PatientGuarantorName: string;
        let encounterId: number;
        let PatientMrn: string;
        let DoctorId: number;
        let DoctorName: string;
        let RequestTypeId_ = 0;
        let MRDTypeId_ = 1; //OP
        let MrdRequestTypeId_ = 1; //Visit
        let FrmDeptId = 0;
        let ToDeptId = 0;
        let CurrentLocId = 0;
        let NewPatient = 0;
        let IsMRDRequired = 0;
        let IsMRDFileCreation = 0;
        let MRDMovementStatusId = 0;
        let IsManual = false;
        let PriorityId = 3;  //medium
        let PatientConditionId: number;
        let DiagnosisId: number;
        let DiagnosisName: string;
        let DiagnosisCode: string;
        let DiagnosisDescription: string;
        let QMSId: number;

        let MReq = req;
        req = MReq.Data.Reg;
        IsMRDRequired = req.Data.IsMRDRequest;
        IsMRDFileCreation = req.Data.IsMRDFileCreation;
        if (req.Data.Id <= 0) NewPatient = 1;
        DoctorName = req.Data.DoctorName;
        DoctorId = req.Data.DoctorId;
        QMSId = req.Data.QMSId;
        if (IsMRDFileCreation) {
            // let apiDeptReq = {
            //     Id: 0,
            //     PageContext: { PageSize: 1, PageNumber: 1 },
            //     Params: [{ Key: DepartmentFilters.IsMRDLocation, Value: true }]
            // };
            // let deptBo = BoFactory.GetBo(appbo.DepartmentBo, this.Request);
            // let deptdata = await deptBo.GetDepartments(apiDeptReq);
            // if (deptdata && deptdata.Data && deptdata.Data.length > 0) {
            //     ToDeptId = deptdata.Data[0].Id;
            //     CurrentLocId = deptdata.Data[0].Id;
            // }
            ToDeptId = req.Data.DepartmentId;
            CurrentLocId = req.Data.DepartmentId;
            MRDMovementStatusId = 2; // issued
        }
        if (req.Data && (req.Data.NotificationToken)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + req.Data.FirstName + ', ' + ' Your admission is successfully completed,have look in DrHMS' + '.';
            const notificationService: any = new NotificationService();
            const body = {
                type: 'appoinment_booking',
            };
            const pushTokens: string[] = [];
            if (req.Data.NotificationToken) {
                pushTokens.push(req.Data.NotificationToken);
            }
            await notificationService.sendNotification(pushMessage, pushTokens, body);
            console.log('*************************pushMessage**********************', pushMessage);
            console.log('*************************pushTokens**********************', pushTokens);
        }
        let userBo = BoFactory.GetBo(appbo.UserBo, this.Request);
        let userdata = await userBo.GetUserById({ Id: this.Session.UserId });
        if (userdata) {
            FrmDeptId = userdata.DepartmentId;
        }

        PatientId = await this.ManagePatientWithBill(req);
        if (PatientId <= 0) {
            return -1;
        }
        if (LocalWellConfig['PROVIDER'] === 'LOCALWELL') {
            let localwellBo = BoFactory.GetBo(bo.LocalWellCustomerOrderBo, this.Request);
            await localwellBo.CreateLocalWellCustomer(req, PatientId);
        }
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientGuarantorFilters.PatientId, Value: PatientId }]
        };
        if (req.Data.AcutalGuarantorId) {
            apiReq.Params.push({ Key: PatientGuarantorFilters.GuarantorId, Value: req.Data.AcutalGuarantorId });
        }
        let patientGuarantorBO = BoFactory.GetBo(bo.PatientGuarantorBo, this.Request);
        let resguardata = await patientGuarantorBO.GetPatientGuarantors(apiReq);
        if (resguardata) {
            PatientGuarantorId = resguardata.Data[0].Id;
            GuarantorId = resguardata.Data[0].GuarantorId;
            PatientGuarantorTypeId = resguardata.Data[0].GuarantorTypeId;
            PatientGuarantorName = resguardata.Data[0].GuarantorName;
        }
        let reqApp = req;
        reqApp.Data.Id = 0; // Create Appointment
        if (req.Data.ScheduleApptId) {
            await this.ManageApptSchduledtoCancelled(req.Data.ScheduleApptId);
        }
        let ApptDate = new Date();
        let after15mins = (ApptDate.getTime() + 15000 * 60);
        let ApptStartTime = moment(ApptDate.getTime()).format('HH:mm');
        let ApptEndTime = moment(after15mins).format('HH:mm');
        if (req.Data.ScheduleApptId || req.Data.IsCheckedInAppt) {
            if (req.Data.ScheduleApptStartTime && req.Data.ScheduleApptEndTime) {
                ApptStartTime = req.Data.ScheduleApptStartTime;
                ApptEndTime = req.Data.ScheduleApptEndTime;
            }
        }
        AppId = await this.ManageAutoAppointment(PatientId, PatientGuarantorId, GuarantorId, PatientGuarantorTypeId,
            reqApp, ApptDate, ApptStartTime, ApptEndTime);
        let apiEncReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: EncounterFilters.PatientId, Value: PatientId },
                { Key: EncounterFilters.AppointmentId, Value: AppId },
            ]
        };
        let encounterBO = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encdata = await encounterBO.GetEncounters(apiEncReq);
        if (encdata) {
            encounterId = encdata.Data[0].Id;
            DiagnosisId = encdata.Data[0].DiagnosisId;
            PatientMrn = encdata.Data[0].PatientMrn;
        }

        if (DiagnosisId !== 0 && DiagnosisId !== null && DiagnosisId > 0) {
            let DiagnosisReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [
                    { Key: DiagnosisFilters.Id, Value: DiagnosisId }
                ]
            };
            let DiagnosisBo = BoFactory.GetBo(clinicalbo.DiagnosisBo, this.Request);
            let DiagnoisData = await DiagnosisBo.GetDiagnosiss(DiagnosisReq);
            if (DiagnoisData && DiagnoisData.Data && DiagnoisData.Data.length > 0) {
                DiagnosisCode = DiagnoisData.Data[0].Code;
                DiagnosisName = DiagnoisData.Data[0].DiagnosisName;
                DiagnosisDescription = DiagnoisData.Data[0].Description;
            }

            let PatientConditionData: any = {
                Data: {
                    Id: 0,
                    EncounterId: encounterId,
                    PatientId: PatientId,
                    DiagnosisId: DiagnosisId,
                    Code: DiagnosisCode,
                    DiagnosisName: DiagnosisName,
                    Description: DiagnosisDescription,
                    DiagnosisDetails: DiagnosisDescription,
                    ConditionStatusId: 1
                }
            };
            let EMRBO = BoFactory.GetBo(emrbo.PatientConditionBo, this.Request);
            PatientConditionId = await EMRBO.AddPatientCondition(PatientConditionData);
        }


        if (req.Data.IsNoBill)
            await encounterBO.UpdateIsNoBill(req.Data.IsNoBill, encounterId);

        if (req.Data.IsPaidVisit)
            await encounterBO.UpdateIsPaidVisit(req.Data.IsPaidVisit, encounterId);

        if (req.Data.FreeVisit)
            await encounterBO.UpdateFreeVisitCount(req.Data.FreeVisit, encounterId);


        AppDispId = await this.ManageAutoAppointmentDisplay(PatientId, AppId, req);
        if (MReq.Data.Bill) {
            req = MReq.Data.Bill;
            let patient: any = await this.GetById(PatientId);
            if (req.Data && req.Data.Header) {
                req.Data.Header.PatientId = PatientId;
                req.Data.Header.PatientName = MReq.Data.Reg.Data.title + ' ' + MReq.Data.Reg.Data.FirstName
                    + ' ' + MReq.Data.Reg.Data.LastName;
                req.Data.Header.PatientMrn = patient.MRN;
                req.Data.Header.EncounterId = encounterId;
                req.Data.Header.GuarantorId = PatientGuarantorId;
                req.Data.Header.GuarantorTypeId = PatientGuarantorTypeId;
                req.Data.Header.PatientGuarantorName = PatientGuarantorName;

                if (req.Data && req.Data.paymentDetail && req.Data.paymentDetail.length > 0) {
                    for (let idx in req.Data.paymentDetail) {
                        let paydet = req.Data.paymentDetail[idx];
                        paydet.PatientId = PatientId;
                        paydet.EncounterId = encounterId;
                        paydet.GuarantorId = PatientGuarantorId;
                        paydet.GuarantorTypeId = PatientGuarantorTypeId;
                        paydet.BillTypeId = req.Data.Header.BillTypeId;
                    }
                }
                if (req.Data && req.Data.Details && req.Data.Details.length > 0) {
                    for (let idx in req.Data.Details) {
                        let billdetails = req.Data.Details[idx];
                        billdetails.EncounterId = req.Data.Header.EncounterId;
                        billdetails.PatientBillStatusId = 3;
                        billdetails.DoctorId = req.Data.Header.DoctorId;
                        billdetails.DoctorName = req.Data.Header.DoctorName;
                    }
                }
                let patientbillBO = BoFactory.GetBo(billingBo.PatientBillsBo, this.Request);
                await patientbillBO.AddPatientBills(req);
            }
        }
        if (ToDeptId > 0 && IsMRDFileCreation) {
            let MRDFileStatusId = 1; // Created
            let MRDLocBo = BoFactory.GetBo(ipbo.MRDLocationBo, this.Request);
            await MRDLocBo.ManageMRDLocation(PatientMrn, RequestTypeId_, MRDTypeId_,
                PatientId, encounterId, DoctorId, DoctorName,
                0, null, null, FrmDeptId, ToDeptId, CurrentLocId, NewPatient,
                MRDFileStatusId, MRDMovementStatusId, IsMRDRequired, IsMRDFileCreation, IsManual, PriorityId, MrdRequestTypeId_);
        }

        if (QMSId && QMSId > 0 || PatientId && PatientId > 0) {
            let QMSBo = BoFactory.GetBo(regbo.QMSBo, this.Request);
            await QMSBo.updatePatientQMSData(QMSId, PatientId, PatientMrn);
        }

        return AppId;
    }
    public async RegCumVisitWithLIS(req: BaseRequest): Promise<number> {
        let PatientId: number;
        let AppId: number;
        let AppDispId: number;
        let PatientGuarantorId: number;
        let PatientGuarantorTypeId: number;
        let PatientGuarantorName: string;
        let encounterId: number;
        let PatientMrn: string;
        let B2BCustomerMasterId: number;
        let ClinicalNotes: string;

        let MReq = req;
        req = MReq.Data.Reg;
        PatientId = await this.ManagePatientWithBill(req);
        if (PatientId <= 0) {
            return -1;
        }
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientGuarantorFilters.PatientId, Value: PatientId }]
        };
        if (req.Data.AcutalGuarantorId) {
            apiReq.Params.push({ Key: PatientGuarantorFilters.GuarantorId, Value: req.Data.AcutalGuarantorId });
        }
        let patientGuarantorBO = BoFactory.GetBo(bo.PatientGuarantorBo, this.Request);
        let resguardata = await patientGuarantorBO.GetPatientGuarantors(apiReq);
        if (resguardata) {
            PatientGuarantorId = resguardata.Data[0].Id;
            PatientGuarantorTypeId = resguardata.Data[0].GuarantorTypeId;
            PatientGuarantorName = resguardata.Data[0].GuarantorName;
        }
        let reqApp = req;
        reqApp.Data.Id = 0; // Create Appointment
        if (req.Data.ScheduleApptId) {
            await this.ManageApptSchduledtoCancelled(req.Data.ScheduleApptId);
        }
        let ApptDate = new Date();
        let after15mins = (ApptDate.getTime() + 15000 * 60);
        let ApptStartTime = moment(ApptDate.getTime()).format('HH:mm');
        let ApptEndTime = moment(after15mins).format('HH:mm');
        if (req.Data.ScheduleApptId || req.Data.IsCheckedInAppt) {
            if (req.Data.ScheduleApptStartTime && req.Data.ScheduleApptEndTime) {
                ApptStartTime = req.Data.ScheduleApptStartTime;
                ApptEndTime = req.Data.ScheduleApptEndTime;
            }
        }
        if (req.Data.B2BCustomerMasterId) {
            B2BCustomerMasterId = req.Data.B2BCustomerMasterId;
        }
        if (req.Data.ClinicalNotes) {
            ClinicalNotes = req.Data.ClinicalNotes;
        }
        AppId = await this.ManageAutoLISAppointment(PatientId, PatientGuarantorId,
            reqApp, ApptDate, ApptStartTime, ApptEndTime, B2BCustomerMasterId, ClinicalNotes);
        let apiEncReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: EncounterFilters.PatientId, Value: PatientId },
                { Key: EncounterFilters.AppointmentId, Value: AppId },
            ]
        };
        let encounterBO = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encdata = await encounterBO.GetEncounters(apiEncReq);
        if (encdata) {
            encounterId = encdata.Data[0].Id;
            PatientMrn = encdata.Data[0].PatientMrn;
        }
        AppDispId = await this.ManageAutoAppointmentDisplay(PatientId, AppId, req);
        return AppId;
    }
    public async GetOPDDashBoardInfo(req: BaseRequest): Promise<any> {
        let PatientCount = await this.Items.count({
            where: {
                'Status': 1,
                'PatientStatusId': 2,
                'RegisteredDate': { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            }
        });
        return {
            'PatientCount': PatientCount
        };
    }

    public async RegistrationCumVisit(req: BaseRequest): Promise<number> {
        let PatientId: number;
        let AppId: number;
        if (req.Data.Id <= 0) {
            PatientId = await this.AddPatient(req);
            if (PatientId <= 0) return PatientId;

            let apiReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [{ Key: PatientGuarantorFilters.PatientId, Value: PatientId }]
            };
            let patientGuarantorBO = BoFactory.GetBo(bo.PatientGuarantorBo, this.Request);
            let resguardata = await patientGuarantorBO.GetPatientGuarantors(apiReq);
            let PatientGuarantorId = resguardata.Data[0].Id;
            let currentTime = new Date();
            let currentTime15mins = (currentTime.getTime() + 15000 * 60);
            let AppointmentData: any = {
                Data: {
                    Id: 0,
                    FacilityId: req.Data.FacilityId,
                    ReferralId: req.Data.ReferrerId,
                    AppointmentCategoryId: 5,
                    AppointmentDate: currentTime,
                    AppointmentStatusId: 6,
                    AppointmentTypeId: 1,
                    VisitTypeId: req.Data.VisitTypeId,
                    AssignedUserId: req.Data.DoctorId,
                    AssignedUserName: req.Data.DoctorName,
                    DepartmentId: req.Data.DepartmentId,
                    DoctorId: req.Data.DoctorId,
                    PatientId: PatientId,
                    PatientGuarantorId: PatientGuarantorId,
                    PriorityId: 3,
                    ValidateDuplicateEncounter: false,
                    OrderScheduledId: -1,
                    ReferralTypeId: req.Data.ReferTypeId,
                    Comments: req.Data.Comments,
                    StartTime: moment(currentTime).format('HH:mm'),
                    EndTime: moment(currentTime15mins).format('HH:mm')
                }
            };
            let AppBo = BoFactory.GetBo(appointmentbo.AppointmentBo, this.Request);
            AppId = await AppBo.AddAppointment(AppointmentData);

        } else {
            PatientId = req.Data.Id;
            await this.UpdatePatient(req);
            let apiReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [{ Key: PatientGuarantorFilters.PatientId, Value: PatientId }]
            };
            let patientGuarantorBO = BoFactory.GetBo(bo.PatientGuarantorBo, this.Request);
            let resguardata = await patientGuarantorBO.GetPatientGuarantors(apiReq);
            let PatientGuarantorId = resguardata.Data[0].Id;
            let AppointmentData: any = {
                Data: {
                    Id: 0,
                    FacilityId: req.Data.FacilityId,
                    ReferralId: req.Data.ReferrerId,
                    AppointmentCategoryId: 5,
                    AppointmentDate: new Date(),
                    AppointmentStatusId: 6,
                    VisitTypeId: req.Data.VisitTypeId,
                    AppointmentTypeId: 1,
                    AssignedUserId: req.Data.DoctorId,
                    AssignedUserName: req.Data.DoctorName,
                    DepartmentId: req.Data.DepartmentId,
                    DoctorId: req.Data.DoctorId,
                    PatientId: PatientId,
                    PatientGuarantorId: PatientGuarantorId,
                    PriorityId: 3,
                    ValidateDuplicateEncounter: false,
                    OrderScheduledId: -1,
                    ReferralTypeId: req.Data.ReferTypeId,
                    Comments: req.Data.Comments
                }
            };
            let AppBo = BoFactory.GetBo(appointmentbo.AppointmentBo, this.Request);
            AppId = await AppBo.AddAppointment(AppointmentData);
        }
        return AppId;
    }

    public async DummyVisitCreation(req: BaseRequest): Promise<boolean> {
        if (req && req.Data) {
            let visitinfo_ = req.Data;
            req.Data = null;
            for (let kk = 0, len = visitinfo_.length; kk < len; kk++) {

                let Encounter1 = visitinfo_[kk];
                let ActuavlVisitTypeId = Encounter1.VisitTypeId;

                /* Transform things */
                let GuarantorId: number = 1000;
                let GuarantorTypeId: number = 1;

                req.Data = Encounter1.Patient;
                req.Data.FacilityId = this.Session.FacilityId;
                req.Data.GuarantorId = GuarantorId;
                req.Data.GuarantorTypeId = 1;
                req.Data.PatientStatusId = 2;
                req.Data.MRNTypeId = 2;
                req.Data.Mobile = null;
                req.Data.IsAdditionalVisit = true;
                req.Data.RegisteredDate = Encounter1.AdmissionDate;
                let PatientId: number = 0;
                let DummyMRN = null;
                if (ActuavlVisitTypeId === 1) {
                    req.Data.Id = null;
                    PatientId = await this.AddDummyPatient(req);
                    if (req.Data.MRN)
                        DummyMRN = req.Data.MRN;
                } else {
                    PatientId = Encounter1.Patient.Id;
                    console.log('Patient Id : ' + Encounter1.Patient.Id);
                    req.Data.Id = null;
                }
                Encounter1.PatientId = PatientId;
                Encounter1.Appointment.PatientId = PatientId;
                let apiReq = {
                    Id: 0,
                    PageContext: { PageSize: 50, PageNumber: 1 },
                    Params: [{ Key: PatientGuarantorFilters.PatientId, Value: PatientId }]
                };
                let patientGuarantorBO = BoFactory.GetBo(bo.PatientGuarantorBo, this.Request);
                let resguardata = await patientGuarantorBO.GetPatientGuarantors(apiReq);
                if (resguardata) {
                    GuarantorId = resguardata.Data[0].Id;
                    GuarantorTypeId = resguardata.Data[0].GuarantorTypeId;
                }
                let AppointmentId = null;
                req.Data = Encounter1.Appointment;
                req.Data.AppointmentDate = Encounter1.AdmissionDate;
                req.Data.AppointmentStatusId = 6; //Checked-In
                req.Data.FacilityId = this.Session.FacilityId;
                req.Data.GuarantorId = GuarantorId;
                req.Data.GuarantorTypeId = GuarantorTypeId;
                req.Data.PatientGuarantorId = GuarantorId;
                req.Data.Id = null;
                let AppBo = BoFactory.GetBo(appointmentbo.AppointmentBo, this.Request);
                AppointmentId = await AppBo.AddDummyAppointment(req);
                Encounter1.AppointmentId = AppointmentId;
                Encounter1.VisitTypeId = ActuavlVisitTypeId;
                Encounter1.DischargeDate = null;
                req.Data = Encounter1;
                req.Data.EncounterStatusId = 1; // OP Checked-In
                req.Data.IsLatest = 1; // OP Checked-In
                req.Data.DischargeDate = null;
                req.Data.EndDate = null;
                req.Data.FacilityId = this.Session.FacilityId;
                req.Data.GuarantorId = GuarantorId;
                req.Data.GuarantorTypeId = GuarantorTypeId;
                req.Data.VisitTypeId = ActuavlVisitTypeId;
                req.Data.IsAdditionalVisit = true;
                let diagnosisid = await this.GetDignosisId(Encounter1.DepartmentId, 1, Encounter1.Patient.GenderId, Encounter1.Patient.Age);


                Encounter1.DiagnosisId = -1;
                if (diagnosisid !== null) {
                    Encounter1.DiagnosisId = diagnosisid;
                }

                if (ActuavlVisitTypeId === 1) {
                    req.Data.PatientMrn = null;
                    if (DummyMRN)
                        req.Data.PatientMrn = DummyMRN;
                }

                req.Data.Id = null;
                let encounterBO = BoFactory.GetBo(encbo.EncounterBo, this.Request);
                let EncounterId = await encounterBO.AddDummyOPEncounter(req);
                Encounter1.PatientId = PatientId;
                Encounter1.AppointmentId = AppointmentId;
                Encounter1.EncounterId = EncounterId;

                req.Data = Encounter1;
                req.Data.StartDate = Encounter1.AdmissionDate;
                req.Data.EndDate = null;
                req.Data.EncounterDoctorStatus = 3; // 3-- Started need to 4-- Completed
                req.Data.FacilityId = this.Session.FacilityId;
                req.Data.GuarantorId = GuarantorId;
                req.Data.GuarantorTypeId = GuarantorTypeId;
                req.Data.Id = null;
                let encounterDocBO = BoFactory.GetBo(encbo.EncounterDoctorBo, this.Request);
                let EncounterDoctorId = await encounterDocBO.AddEncounterDoctor(req);
                console.log(EncounterDoctorId);

            }

        }
        return true;
    }

    public async DummyIPVisitCreation(req: BaseRequest): Promise<boolean> {
        if (req && req.Data) {

            let visitinfo_ = req.Data;
            req.Data = null;
            for (let kk = 0, len = visitinfo_.length; kk < len; kk++) {
                let Encounter1 = visitinfo_[kk];
                Encounter1.VisitTypeId = null;
                req.Data = Encounter1;
                req.Data.Id = null;
                req.Data.EncounterId = null;
                req.Data.VisitIdentifier = null;
                req.Data.EncounterTypeId = 2;
                req.Data.SpecialityId = -1;
                req.Data.DepartmentId = Encounter1.DepartmentId;
                req.Data.ReferralId = null;
                req.Data.ReferralName = null;
                req.Data.GuarantorId = 0;
                req.Data.GuarantorTypeId = 6;
                let apiReq = {
                    Id: 0,
                    PageContext: { PageSize: 50, PageNumber: 1 },
                    Params: [{ Key: PatientGuarantorFilters.PatientId, Value: Encounter1.Patient.Id },
                    { Key: PatientGuarantorFilters.GuarantorTypeId, Value: 6 }]
                };
                let patientGuarantorBO = BoFactory.GetBo(bo.PatientGuarantorBo, this.Request);
                let resguardata = await patientGuarantorBO.GetPatientGuarantors(apiReq);
                if (resguardata.Data.length > 0) {
                    for (var rgd = 0; rgd < resguardata.Data.length; rgd++) {
                        req.Data.GuarantorId = resguardata.Data[rgd].Id;
                        req.Data.GuarantorTypeId = resguardata.Data[rgd].GuarantorTypeId;
                    }
                }
                if (req.Data.GuarantorId === 0) {
                    let patientGuarantorBO = BoFactory.GetBo(bo.PatientGuarantorBo, this.Request);
                    let PatientGuarantorId = await patientGuarantorBO.ManagePatientFreeGuarantor(Encounter1.Patient.Id);
                    req.Data.GuarantorId = PatientGuarantorId;
                    req.Data.GuarantorTypeId = 6;
                }

                // let PatAge = 0;
                // if (Encounter1.Patient && Encounter1.Patient.Age) {
                //     PatAge = Encounter1.Patient.Age;
                // }

                let diagnosisid = -1;
                //////await this.GetDignosisId(Encounter1.DepartmentId,
                ///// 2, Encounter1.Patient.GenderId, PatAge);

                req.Data.AdmissionDate = Encounter1.AdmissionDate;
                req.Data.ExpectedDischargeDate = null;
                req.Data.DischargeDate = null;
                req.Data.SurgeryDate = null;
                req.Data.OrganizationId = 1;
                req.Data.FacilityId = this.Session.FacilityId;
                req.Data.TokenId = null;
                req.Data.AdmissionRequestTypeId = 1;
                req.Data.ArrivedDate = null;
                req.Data.CallDate = null;
                req.Data.BookingId = null;
                req.Data.AdmissionRequestId = null;
                req.Data.PreviousEncounterId = null;
                req.Data.IsReadmission = 0;
                req.Data.IsLatest = 1;
                req.Data.AppointmentId = null;
                req.Data.AdmittingReasonId = null;
                req.Data.AssignId = null;
                req.Data.AssignedGroupId = null;
                req.Data.VisitReasonId = null;
                req.Data.Comments = null;
                req.Data.ALOS = null;
                req.Data.LocationId = 0;
                req.Data.WardId = Encounter1.WardId;
                req.Data.RoomId = 0;
                req.Data.BedId = 0;
                req.Data.ServiceRateCategoryId = 0;
                req.Data.DiagnosisId = diagnosisid;
                req.Data.AdmitDiagnosis = null;
                req.Data.AttenderName = null;
                req.Data.GuardianTypeId = null;
                req.Data.AttenderPhone = null;
                req.Data.IsMRDRequest = 0;
                req.Data.IsWalkin = 0;
                req.Data.IsMLC = 0;
                req.Data.IsBillFinalized = 0;
                req.Data.PriorityId = null;
                req.Data.AdmissionPriorityId = null;
                req.Data.ClinicalStaffId = null;
                req.Data.IsMassCasuality = 1;
                req.Data.DischargeDepartmentId = null;
                req.Data.EncounterStatusId = 1;
                req.Data.AdmissionStatusId = 2;
                req.Data.MergedEncounterId = null;
                req.Data.RemarkId = null;
                req.Data.ReferralTypeId = null;
                req.Data.OtherDiagnosis = null;
                req.Data.IsBillLock = 0;
                req.Data.IsEstimatedBill = 0;
                req.Data.DischargeTypeId = null;
                req.Data.PatientDietNbmTypeId = null;
                req.Data.IsPackageAssigned = 0;
                req.Data.EncounterIPPackageId = 0;
                req.Data.IPPackageId = 0;
                req.Data.VisitTypeId = null;
                req.Data.TeamId = 0;
                req.Data.IsNoBill = 0;
                req.Data.IsPaidVisit = 0;
                req.Data.FreeVisit = 0;
                req.Data.IsBillCompleted = 0;
                req.Data.IsSurgery = 0;
                req.Data.IsAdmission = 0;
                req.Data.ProcedureId = null;
                req.Data.Diagnosis2Id = null;
                req.Data.Diagnosis3Id = null;
                req.Data.ClincalStatusId = null;
                req.Data.EstimatedBillDist = 0;
                req.Data.EstimatedBillDistTypeId = 0;
                req.Data.IsEmergency = 0;
                req.Data.IsMRDFileCreation = 0;
                req.Data.IsAdditionalVisit = true;
                req.Data.IsBillModified = 0;

                let encounterBO = BoFactory.GetBo(encbo.EncounterBo, this.Request);
                let EncounterId = await encounterBO.AddDummyIPEncounter(req);
                Encounter1.EncounterId = EncounterId;

            }
        }
        return true;
    }

    public async DummyIPOrderCreation(req: BaseRequest): Promise<boolean> {
        let TransactionDate = req.Data.TransactionDate;
        let patientorderbo = BoFactory.GetBo(emrbo.PatientOrderBo, this.Request);
        TransactionDate = await patientorderbo.GetLastRequesDate(req);
        if (req && req.Data) {
            let Headers = req.Data.Headers;
            let InvDetails = req.Data.Details;
            let billBo = BoFactory.GetBo(billingBo.PatientBillsBo, this.Request);
            for (let idx in Headers) {
                TransactionDate = moment(TransactionDate).add(30, 'seconds').toDate();
                let HeaderInfo = Headers[idx];
                Headers[idx].Id = 0;
                Headers[idx].IsAdditionalVisit = true;
                Headers[idx].OrderRequestDate = TransactionDate;
                Headers[idx].OrderScheduleDate = TransactionDate;
                Headers[idx].BillDateTime = TransactionDate;
                Headers[idx].PatientBillStatusId = 3;
                Headers[idx].OrderTotal = 0;
                for (let invidx in InvDetails) {
                    InvDetails[invidx].Id = 0;
                    InvDetails[invidx].IsAdditionalVisit = true;
                    InvDetails[invidx].IsDirectBill = null; // no bill information
                    InvDetails[invidx].OrderStatusId = HeaderInfo.OrderStatusId;
                    InvDetails[invidx].OrderPriorityId = HeaderInfo.OrderPriorityId;
                    InvDetails[invidx].TestPrice = 0;
                    InvDetails[invidx].NetAmount = 0;
                    InvDetails[invidx].OrderTypeId = InvDetails[invidx].TESTMASTERTYPId;
                    InvDetails[invidx].TestTypeId = InvDetails[invidx].TESTMASTERTYPId;
                    InvDetails[invidx].PatientId = HeaderInfo.PatientId;
                    InvDetails[invidx].EncounterId = HeaderInfo.EncounterId;
                    InvDetails[invidx].EncounterTypeId = HeaderInfo.EncounterTypeId;
                    InvDetails[invidx].PatientBillStatusId = 3;
                    InvDetails[invidx].RequestDate = TransactionDate;
                    InvDetails[invidx].OrderDateTime = TransactionDate;
                }
                let OrdReq = {
                    Id: 0,
                    Data: {
                        Header: HeaderInfo,
                        Details: InvDetails
                    }
                };
                await billBo.CreateAdditionalInPatientOrder(-1, OrdReq.Data, null);
            }
        }
        return true;
    }
    public async OPVisitCancel(req: BaseRequest): Promise<boolean> {
        if (req && req.Data) {
            if (req.Data.EncounterId) {
                let encounterBO = BoFactory.GetBo(encbo.EncounterBo, this.Request);
                let encVisitCancelUpdate: any = { Status: 3, VisitCancelReason: req.Data.Remarks };
                await encounterBO.Update(encVisitCancelUpdate, {
                    fields: ['Status', 'VisitCancelReason'],
                    where: {
                        EncounterId: req.Data.EncounterId,
                    }
                });
            }
            if (req.Data.Bill) {
                let patientCNBo = BoFactory.GetBo(billingBo.PatientCreditNoteBo, this.Request);
                let patientBillBo = BoFactory.GetBo(billingBo.PatientBillsBo, this.Request);
                let patientPaymentDtBo = BoFactory.GetBo(billingBo.PatientPaymentDetailsBo, this.Request);
                let patientBillDetailBo = BoFactory.GetBo(billingBo.PatientBillDetailsBo, this.Request);
                for (let ptbillind in req.Data.Bill) {
                    let PatientBill = req.Data.Bill[ptbillind];
                    if (PatientBill.BillId) {
                        let PaitientBillInfo = await patientBillBo.GetPatientBillsById({ Id: PatientBill.BillId });
                        let ReqCN: any = {
                            Data: {
                                Header: {
                                    ActiveFrom: new Date(),
                                    ChequeDate: new Date(),
                                    CollectedOn: new Date(),
                                    CreditNoteAmount: 0,
                                    CreditNoteDateTime: new Date(),
                                    CreditNoteIdentifier: null,
                                    CurrencyTypeId: 1,
                                    DDDate: new Date(),
                                    DepartmentID: PaitientBillInfo.DepartmentId,
                                    DoctorId: PaitientBillInfo.DoctorId,
                                    EncounterId: PaitientBillInfo.EncounterId,
                                    EncounterTypeId: PaitientBillInfo.EncounterTypeId,
                                    FacilityId: PaitientBillInfo.FacilityId,
                                    GuarantorId: PaitientBillInfo.GuarantorId,
                                    GuarantorTypeId: PaitientBillInfo.GuarantorTypeId,
                                    IsActive: true,
                                    IsFromFinalize: false,
                                    PatientBillId: PaitientBillInfo.Id,
                                    PatientCreditNoteId: 0,
                                    PatientId: PaitientBillInfo.PatientId,
                                    PatientName: PaitientBillInfo.PatientName,
                                    PaymentTypeId: 1,
                                    RefundAmount: 0,
                                    RefundDateTime: new Date(),
                                    RefundStatusId: 1,
                                    RefundTypeId: 3,
                                    VisitIdentifier: null,
                                    WireTransferDate: new Date(),
                                    isCompleted: true,
                                    AuthorizedBy: PaitientBillInfo.BillApprovedBy,
                                    BillDateTime: PaitientBillInfo.BillDateTime,
                                    BillNumber: PaitientBillInfo.BillNumber,
                                    CreditNoteApprovedById: 0,
                                    CreditNoteStatusId: 2,
                                    CreditNoteTypeId: 4,
                                    reason: ''
                                },
                                Details: []
                            }
                        };

                        for (let ptbildtid in PatientBill.PatientBillDetails) {
                            let lineitem = PatientBill.PatientBillDetails[ptbildtid];
                            let itemcode = '';
                            let Detail = {
                                CNAmount: isNaN(parseFloat(lineitem.NetAmount)) ? 0 : parseFloat(lineitem.NetAmount),
                                CNCompleted: true,
                                Code: itemcode,
                                CreditNoteAmount: isNaN(parseFloat(lineitem.NetAmount)) ? 0 : parseFloat(lineitem.NetAmount),
                                CreditNoteDetailDateTime: new Date(),
                                CreditNoteTypeId: 4,
                                DepartmentID: lineitem.DepartmentId,
                                Discount: lineitem.Discount,
                                IsEditable: true,
                                NetAmount: lineitem.NetAmount,
                                PatientBillDetailId: lineitem.Id,
                                ServiceAmount: 0,
                                ServiceId: lineitem.ServiceId,
                                ServiceName: lineitem.ServiceName,
                                Status: lineitem.Status,
                                isCompleted: true
                            };
                            ReqCN.Data.Details.push(Detail);
                        }
                        await patientCNBo.AddPatientCreditNote(ReqCN);
                        let PaitientBillRevInfo = await patientBillBo.GetPatientBillsById({ Id: PatientBill.BillId });
                        PaitientBillRevInfo.CancelReason = req.Data.Remarks;
                        PaitientBillRevInfo.PatientBillStatusId = 2;
                        await patientBillBo.Update(PaitientBillRevInfo);
                        await patientBillDetailBo.UpdateBillingStaus(PatientBill.BillId, 2);
                        let PatientBillId = PatientBill.BillId;
                        let payreq: any = {
                            Id: 0,
                            PageContext: { PageSize: 100, PageNumber: 1 },
                            Params: [
                                { Key: PatientPaymentDetailsFilters.PatientBillId, Value: PatientBillId }
                            ]
                        };
                        let paymentinfo = await patientPaymentDtBo.GetPatientPaymentDetails(payreq);
                        if (paymentinfo && paymentinfo.Data) {
                            for (var pyidx in paymentinfo.Data) {
                                let paymentdetail = paymentinfo.Data[pyidx];
                                paymentdetail.ReceiptStatusId = 3;
                                await patientPaymentDtBo.Update(paymentdetail);
                            }
                        }
                    }
                }
            }




        }

        return true;
    }


    private async GetDignosisId(DepartmentId: number, EncounterTypeId: number,
        GenderId: number, PatAge: number): Promise<any> {
        let diagnosisBo = BoFactory.GetBo(clinicalbo.DiagnosisBo, this.Request);
        // Age & GenderId & Department & Encountertype
        let diagnosisid = null;
        let apireqdig = {
            Id: 0,
            PageContext: { PageSize: 100, PageNumber: 1 },
            Params: [{ Key: DiagnosisFilters.DepartmentId, Value: DepartmentId },
            { Key: DiagnosisFilters.EncounterTypeId, Value: EncounterTypeId },
            { Key: DiagnosisFilters.GenderId, Value: GenderId },
            ]
        };
        if (PatAge) {
            apireqdig.Params.push({ Key: DiagnosisFilters.AgeFrom, Value: PatAge });
            apireqdig.Params.push({ Key: DiagnosisFilters.AgeTo, Value: PatAge });
        }
        let diagnoisdatas = await diagnosisBo.GetDiagnosiss(apireqdig);
        if (diagnoisdatas && diagnoisdatas.Data
            && diagnoisdatas.Data.length > 0) {
            let MaxRandomSize = diagnoisdatas.Data.length - 1;
            let Firstindex = 0;
            if (MaxRandomSize > 0) Firstindex = Math.floor((Math.random() * MaxRandomSize) + 1);
            let diagnoisdata = diagnoisdatas.Data[Firstindex];
            if (diagnoisdata && diagnoisdata.Id) diagnosisid = diagnoisdata.Id;
        }
        if (diagnoisdatas && diagnoisdatas.Data
            && diagnoisdatas.Data.length === 0) { // GenderId & Department & Encountertype
            apireqdig = {
                Id: 0,
                PageContext: { PageSize: 100, PageNumber: 1 },
                Params: [{ Key: DiagnosisFilters.DepartmentId, Value: DepartmentId },
                { Key: DiagnosisFilters.EncounterTypeId, Value: EncounterTypeId },
                { Key: DiagnosisFilters.GenderId, Value: GenderId },
                ]
            };
            diagnoisdatas = await diagnosisBo.GetDiagnosiss(apireqdig);
            if (diagnoisdatas && diagnoisdatas.Data
                && diagnoisdatas.Data.length > 0) {
                let MaxRandomSize = diagnoisdatas.Data.length - 1;
                let Firstindex = 0;
                if (MaxRandomSize > 0) Firstindex = Math.floor((Math.random() * MaxRandomSize) + 1);
                let diagnoisdata = diagnoisdatas.Data[Firstindex];
                if (diagnoisdata && diagnoisdata.Id) diagnosisid = diagnoisdata.Id;
            }
        }
        if (diagnoisdatas && diagnoisdatas.Data
            && diagnoisdatas.Data.length === 0) { // Department  & Encountertype
            apireqdig = {
                Id: 0,
                PageContext: { PageSize: 100, PageNumber: 1 },
                Params: [{ Key: DiagnosisFilters.DepartmentId, Value: DepartmentId },
                { Key: DiagnosisFilters.EncounterTypeId, Value: EncounterTypeId },
                ]
            };
            diagnoisdatas = await diagnosisBo.GetDiagnosiss(apireqdig);
            if (diagnoisdatas && diagnoisdatas.Data
                && diagnoisdatas.Data.length > 0) {
                let MaxRandomSize = diagnoisdatas.Data.length - 1;
                let Firstindex = 0;
                if (MaxRandomSize > 0) Firstindex = Math.floor((Math.random() * MaxRandomSize) + 1);
                let diagnoisdata = diagnoisdatas.Data[Firstindex];
                if (diagnoisdata && diagnoisdata.Id) diagnosisid = diagnoisdata.Id;
            }
        }
        if (diagnoisdatas && diagnoisdatas.Data
            && diagnoisdatas.Data.length === 0) { // Department
            apireqdig = {
                Id: 0,
                PageContext: { PageSize: 100, PageNumber: 1 },
                Params: [{ Key: DiagnosisFilters.DepartmentId, Value: DepartmentId },
                ]
            };
            diagnoisdatas = await diagnosisBo.GetDiagnosiss(apireqdig);
            if (diagnoisdatas && diagnoisdatas.Data
                && diagnoisdatas.Data.length > 0) {
                let MaxRandomSize = diagnoisdatas.Data.length - 1;
                let Firstindex = 0;
                if (MaxRandomSize > 0) Firstindex = Math.floor((Math.random() * MaxRandomSize) + 1);
                let diagnoisdata = diagnoisdatas.Data[Firstindex];
                if (diagnoisdata && diagnoisdata.Id) diagnosisid = diagnoisdata.Id;
            }
        }
        if (diagnoisdatas && diagnoisdatas.Data
            && diagnoisdatas.Data.length === 0) { // Department
            apireqdig = {
                Id: 0,
                PageContext: { PageSize: 100, PageNumber: 1 },
                Params: [{ Key: DiagnosisFilters.NoDept, Value: 1 },
                ]
            };
            diagnoisdatas = await diagnosisBo.GetDiagnosiss(apireqdig);
            if (diagnoisdatas && diagnoisdatas.Data
                && diagnoisdatas.Data.length > 0) {
                let MaxRandomSize = diagnoisdatas.Data.length - 1;
                let Firstindex = 0;
                if (MaxRandomSize > 0) Firstindex = Math.floor((Math.random() * MaxRandomSize) + 1);
                let diagnoisdata = diagnoisdatas.Data[Firstindex];
                if (diagnoisdata && diagnoisdata.Id) diagnosisid = diagnoisdata.Id;
            }
        }

        return diagnosisid;

    }


    private async AddDummyPatient(req: BaseRequest): Promise<number> {
        if (!req.Data.Id && !req.Data.MRN) {
            /* Last Patient MRN from patient table */
            let currentdate = moment(new Date()).format('YYYY-MM-DD 00:00:00');
            let frmDate = moment(req.Data.RegisteredDate).format('YYYY-MM-DD 00:00:00');
            if (currentdate !== frmDate) {
                let toDate = moment(req.Data.RegisteredDate).format('YYYY-MM-DD 23:59:59');
                let maxpidInstance: any = await this.Find({
                    attributes: [
                        [this.Dal.fn('MAX', this.Dal.col('PatientId')), 'PatientId'],
                    ],
                    where: {
                        RegisteredDate: { '$gt': frmDate, '$lte': toDate }
                    }
                });
                if (maxpidInstance) {
                    let patient: any = this.GetAttribute(maxpidInstance);
                    let lastpid = patient['PatientId'];
                    if (lastpid) {
                        let patientinfo = await this.GetPatientById({ Id: lastpid });
                        let LatestMRN = patientinfo.MRN;
                        let lastnr = Number(LatestMRN);
                        lastnr++;
                        req.Data.MRN = lastnr;
                        req.Data.MRNShortCode = lastnr;
                    } else {
                        throw { code: 'OLD_PATIENT_IS_NOT_AVAILABLE_FOR_OLD_DATE' };
                    }
                } else {
                    throw { code: 'OLD_PATIENT_IS_NOT_AVAILABLE_FOR_OLD_DATE' };
                }
            }

            let result = await this.Save(req.Data);
            let patientGuarantorBO = BoFactory.GetBo(bo.PatientGuarantorBo, this.Request);
            let patientId = result.dataValues.Id;
            await patientGuarantorBO.ManagePatientSelfGuarantor(patientId);


            if (currentdate === frmDate) {

                let NewReq: any = {
                    Data: {
                        Id: patientId,
                        MRN: req.Data.MRN,
                        MRNShortCode: req.Data.MRN,
                    }
                };

                const afterO: any = () => {
                    return ((bo, request, pId) => {
                        return {
                            updateEncounterInfo: async (code: string) => {
                                request.Data.Id = pId;
                                request.Data.MRN = code;
                                await bo.UpdateEncounterInfo(request);
                            },
                            processMRNShortCode: async (code: string) => {
                                request.Data.Id = pId;
                                request.Data.MRNShortCode = code;
                                await bo.processMRNShortCode(request);
                            },
                        };
                    })(this, NewReq, patientId);
                };

                this.deferSequenceKey(patientId, 'MRN',
                    this.getSequenceIdentifier(SequenceKeys.PatientId),
                    [
                        afterO().updateEncounterInfo,
                        afterO().processMRNShortCode
                    ]);

            }


            return patientId;
        }
        return -1;
    }

    /* Private Method */

    private HandlePatientStatus(item: any): void {
        item.PatientStatusId = item.PatientStatusId || 1;
        if (item.PatientStatus) {
            switch (item.PatientStatus) {
                case 'Draft':
                    if (item.PatientStatusId === 1) {
                        item.PatientStatusId = 1;
                    }
                    break;
                case 'Active':
                    item.PatientStatusId = 2;
                    break;
                case 'Inactive':
                    item.PatientStatusId = 3;
                    break;
                case 'Deceased':
                    item.PatientStatusId = 4;
                    break;
                default:
                    break;
            }
        }
    }

    // private async IsAlreadyExistUser(req: any): Promise<number> {

    //     if (!req.Data['OverrideDuplicate'] || req.Data['OverrideDuplicate'] === 'false') {
    //         let duplicate = await this.FindAll({
    //             where: {
    //                 'UserId': req.Data['UserId'],
    //             }
    //         });
    //         if (duplicate && duplicate.length > 0) {
    //             return (duplicate.length * -1);
    //         }
    //     }
    //     return 1;
    // }

    private async IsAlreadyExist(req: any): Promise<number> {

        if (req.Data.From && req.Data.From === 'fromjssdirectsales') {
            let regDate = new Date();
            // let FromDate = billDate.setSeconds(billDate.getSeconds() - 20);
            // let ToDate = billDate.setSeconds(billDate.getSeconds() + 20);
            // let frmDate = moment(FromDate);
            // let todate = moment(ToDate);
            const lowerBound = new Date(regDate.getTime() - 20 * 1000); // 40 seconds before
            const upperBound = new Date(regDate.getTime() + 20 * 1000); // 40 seconds after
            let duplicate = await this.FindAll({
                where: {
                    'FirstName': req.Data['PatientName'],
                    'TitleId': req.Data['TitleId'],
                    'GenderId': req.Data['GenderId'],
                    // 'DOB': req.Data['DOB'],
                    'Mobile': req.Data['Mobile'],
                    'RegisteredDate': {
                        ['$between']: [lowerBound, upperBound]
                    }
                }
            });
            if (duplicate && duplicate.length > 0) {
                return (duplicate.length * -1);
            }
        } else {
            if (!req.Data['OverrideDuplicate'] || req.Data['OverrideDuplicate'] === 'false') {
                let duplicate = await this.FindAll({
                    where: {
                        'FirstName': req.Data['FirstName'],
                        'DOB': req.Data['DOB'],
                        'Mobile': req.Data['Mobile']
                    }
                });
                if (duplicate && duplicate.length > 0) {
                    return (duplicate.length * -1);
                }
            }
        }
        return 1;
    }

    private async ProcessMRNIdGeneration(generateMRN: string, req: any, patientId: number) {
        const afterO: any = () => {
            return ((bo, request, pId, DeptId) => {
                return {
                    processEmail: async (code: string) => {
                        request.Data.Id = pId;
                        request.Data.MRN = code;
                        await bo.ProcessEmail(request);
                    },
                    processSMS: async (code: string) => {
                        request.Data.Id = pId;
                        request.Data.MRN = code;
                        await bo.ProcessSMS(request);
                    },
                    updateEncounterInfo: async (code: string) => {
                        request.Data.Id = pId;
                        request.Data.MRN = code;
                        await bo.UpdateEncounterInfo(request);
                    },
                    manageHL7Msg: async (code: string) => {
                        request.Data.Id = pId;
                        request.Data.MRN = code;
                        await bo.ManageHL7Msg(request);
                    },
                    manageMRDLocation: async (code: string) => {
                        request.Data.Id = pId;
                        request.Data.MRN = code;
                        await bo.ManageMRDLocation(request);
                    },
                    manageFileRequest: async (code: string) => {
                        request.Data.Id = pId;
                        request.Data.MRN = code;
                        await bo.ManageFileRequest(request);
                    },
                    processSMSForReferrer: async (code: string) => {
                        request.Data.Id = pId;
                        request.Data.MRN = code;
                        await bo.processSMSForReferrer(request);
                    },
                    processEmailForReferrer: async (code: string) => {
                        request.Data.Id = pId;
                        request.Data.MRN = code;
                        await bo.processEmailForReferrer(request);
                    },
                    processMRNShortCode: async (code: string) => {
                        request.Data.Id = pId;
                        request.Data.MRNShortCode = code;
                        await bo.processMRNShortCode(request);
                    },
                    processAutoPatientPortal: async (code: string) => {
                        request.Data.Id = pId;
                        request.Data.DepartmentId = DeptId;
                        request.Data.MRN = code;
                        request.Data.AadharNumber = (req.Data.AadharNumber) ? req.Data.AadharNumber : '';
                        await bo.processAutoPatientPortal(request);
                    },
                    updatePatientQMSData: async (code: string) => {
                        request.Data.Id = pId;
                        request.Data.MRN = code;
                        await bo.updatePatientQMSData(request);
                    },
                    processSMSForSelfSignup: async (code: string) => {
                        request.Data.Id = pId;
                        request.Data.MRN = code;
                        await bo.processSMSForSelfSignup(request);
                    },
                };
            })(this, req, patientId, req.Data.DepartmentId);
        };
        let fun = afterO();
        this.deferSequenceKey(patientId, 'MRN',
            generateMRN === 'temp' ? this.getPatSequenceIdentifier(SequenceKeys.TempPatientId, req.Data.FacilityId)
                : this.getPatSequenceIdentifier(SequenceKeys.PatientId, req.Data.FacilityId),
            // this.deferSequenceKey(patientId, 'MRN',
            //     generateMRN === 'temp' ? this.getSequenceIdentifier(SequenceKeys.TempPatientId)
            //         : this.getSequenceIdentifier(SequenceKeys.PatientId),
            [

                fun.updateEncounterInfo,
                fun.manageHL7Msg,
                fun.manageMRDLocation,
                fun.manageFileRequest,
                fun.processSMSForReferrer,
                fun.processEmailForReferrer,
                fun.processMRNShortCode,
                fun.processEmail,
                fun.processSMS,
                fun.processAutoPatientPortal,
                fun.processSMSForSelfSignup,
                fun.updatePatientQMSData,
            ]);
    }

    private async ProcessEmail(req: any) {
        //country bo get with id
        // if (req.Data.CountryId) {
        //     const whatsappEventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
        //     const waTemplateInfo = await whatsappEventTemplateBO.GetTemplateInfo('PatientWhatsWelcomel', 'WhatsRegistration', -1);
        //     const parseData = {
        //         firstName: req.Data.FirstName,
        //         patientName: req.Data.FirstName,
        //         mrn: req.Data.MRN,
        //         facilityName: this.Session.FacilityName,
        //         userName: req.Data.MRN,
        //         passWord: 'password',

        //     };
        //     if (waTemplateInfo) {
        //         const message = Template.Compile(waTemplateInfo.TemplateContent, parseData);
        //         let countrybo = BoFactory.GetBo(generalbo.CountryMasterBo, this.Request);
        //         let countrydata = await countrybo.GetCountryMasterById({ Id: req.Data.CountryId });
        //         const mobileNo: string = '+' + (countrydata.CountryCode + req.Data.Mobile);
        //         const notificationService = new WhatsappNotificationService();
        //         notificationService.sendNotification(message, mobileNo);
        //     }
        // }
        if (req.Data.Email) {
            let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
            let mailTemplateInfo = await eventTemplateBO.GetTemplateInfo('Registration', 'PatientWelcomeMail', 2);
            const mailData = {
                firstName: req.Data.FirstName,
                mrn: req.Data.MRN,
                facilityName: this.Session.FacilityName,
                webSite: '',
                userName: req.Data.MRNShortCode,
                passWord: 'password',
            };
            if (mailTemplateInfo) {
                const mailSubject = Template.Compile(mailTemplateInfo.EmailSubject, mailData);
                const mailBody = Template.Compile(mailTemplateInfo.TemplateContent, mailData);

                let mailProvider = this.GetMailProvider();
                mailProvider.send({
                    from: EmailConfig['From'],
                    to: req.Data.Email,
                    subject: mailSubject,
                    html: mailBody
                });
            }
        }
    }

    private async processEmailForReferrer(req: any) {

        if (req.Data.ReferrerEmail) {
            let referralBO = BoFactory.GetBo(generalbo.ReferralBo, this.Request);
            let referralData = await referralBO.GetReferralById({ Id: req.Data.ReferrerId });
            let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
            let refTitleBo = BoFactory.GetBo(appbo.ReferenceValueBo, this.Request);
            let mailTemplateInfo = await eventTemplateBO.GetTemplateInfo('PatientReferralDoctor', 'PatientReferralDoctorMail', 2);
            let vRefDoctorName = '';
            let vGender = '';
            vRefDoctorName = await this.getReferralData(referralData);
            let apiReqGender = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [
                    { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Gender' },
                    { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: req.Data.GenderId }
                ]
            };
            let GenderData = await refTitleBo.GetReferenceValues(apiReqGender);
            if (GenderData && GenderData.Data && GenderData.Data.length > 0) {
                if (GenderData.Data[0].Description)
                    vGender = GenderData.Data[0].Description;
            }
            const mailData = {
                refDoctorName: vRefDoctorName,
                patientName: req.Data.FirstName,
                mrn: req.Data.MRN,
                gender: vGender,
                facilityName: this.Session.FacilityName
            };
            if (mailTemplateInfo) {
                const mailSubject = Template.Compile(mailTemplateInfo.EmailSubject, mailData);
                const mailBody = Template.Compile(mailTemplateInfo.TemplateContent, mailData);

                let mailProvider = this.GetMailProvider();
                mailProvider.send({
                    to: req.Data.ReferrerEmail,
                    subject: mailSubject,
                    html: mailBody
                });
            }
        }
    }

    private async processSMSForSelfSignup(req: any) {
        let smsProvider = this.GetSmsProvider();
        let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
        let smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('SignUp', 'UserSignup', 1);
        let vPatientName = '';
        if (req.Data.FirstName) vPatientName += req.Data.FirstName;
        if (req.Data.LastName) vPatientName += ' ' + req.Data.LastName;
        let apiReqTitle = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Title' },
                { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: req.Data.TitleId }
            ]
        };
        let vTitleName = '';
        let refTitleBo = BoFactory.GetBo(appbo.ReferenceValueBo, this.Request);
        let TitleData = await refTitleBo.GetReferenceValues(apiReqTitle);
        if (TitleData && TitleData.Data && TitleData.Data.length > 0) {
            if (TitleData.Data[0].Description)
                vTitleName = TitleData.Data[0].Description;
        }
        if (vTitleName)
            vPatientName = vTitleName + '.' + vPatientName;

        if (!smsTemplateInfo) {
            smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('Registration', 'PatientWelcomeSMS', 1);
        }
        if (smsTemplateInfo) {
            let smsmodel: any = {
                numbers: [req.Data.Mobile],
                message: Template.Compile(smsTemplateInfo.TemplateContent,
                    {
                        patname: vPatientName,
                        mrn: req.Data.MRN,
                        pwd: 'password',
                        userName: req.Data.MRNShortCode,
                        passWord: 'password',
                    })
            };
            if (smsTemplateInfo.ModuleId) {
                smsmodel.templateId = smsTemplateInfo.ModuleId;
            }

            if (smsProvider) {
                let SMSStatus = await smsProvider.send(smsmodel);
                let eventDashboardOutboundBo = BoFactory.GetBo(appbo.EventDashboardBo, this.Request);
                await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + req.Data.Mobile);
            }
        }
    }

    private async ProcessSMS(req: any) {

        if (req.Data.Mobile) {
            let smsProvider = this.GetSmsProvider();
            let faciliBO = BoFactory.GetBo(facilityBo.FacilityBo, this.Request);
            let facilityData = await faciliBO.GetFacilityById({ Id: this.Session.FacilityId });
            let landline = facilityData.LandLine;
            // console.log('you landlineis',landline);
            // let landline = 'hi';
            let passWord = 'password';
            let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
            let vPatientName = '';
            if (req.Data.FirstName) vPatientName += req.Data.FirstName;
            if (req.Data.LastName) vPatientName += ' ' + req.Data.LastName;
            let apiReqTitle = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [
                    { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Title' },
                    { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: req.Data.TitleId }
                ]
            };
            let vTitleName = '';
            let refTitleBo = BoFactory.GetBo(appbo.ReferenceValueBo, this.Request);
            let TitleData = await refTitleBo.GetReferenceValues(apiReqTitle);
            if (TitleData && TitleData.Data && TitleData.Data.length > 0) {
                if (TitleData.Data[0].Description)
                    vTitleName = TitleData.Data[0].Description;
            }
            if (vTitleName)
                vPatientName = vTitleName + '.' + vPatientName;

            // if (SmsConfig['PROVIDER'] === 'NSITE') {
            //     if (req.Data.FirstName) {
            //         vPatientName = '';
            //         vPatientName += req.Data.FirstName;
            //     }
            // }
            if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'ProMed') {
                let data = {
                    payload: {
                        name: '',
                        components: [
                            {
                                type: 'body',
                                parameters: [
                                    {
                                        type: 'text',
                                        text: vPatientName
                                    },
                                    {
                                        type: 'text',
                                        text: req.Data.MRN
                                    },
                                    {
                                        type: 'text',
                                        text: String(req.Data.MRNShortCode)
                                    },
                                    {
                                        type: 'text',
                                        text: 'password'
                                    }
                                ]
                            }
                        ],
                        language: {
                            code: 'en_US',
                            policy: 'deterministic'
                        },
                        namespace: '617a3aff_6cf4_4d2f_889c_67c430bd8157'
                    },
                    phoneNumber: req.Data.Mobile
                };
                data.payload.name = 'pro_hms_registration_up';
                if (data.payload.name !== '') {
                    const whatsApp = new WhatsappNotificationService();
                    let msgRes = await whatsApp.sendMessage(data);
                    console.log(msgRes);
                }

            } else if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'Dhee') {
                let dateformat = 'DD/MM/YYYY';
                let data = {
                    channelId: '64ef1968000b0fe0d6e2847c',
                    channelType: 'whatsapp',
                    recipient: {
                        name: vPatientName,
                        phone: '91' + req.Data.Mobile
                    },
                    whatsapp: {
                        type: 'template',
                        template: {
                            templateName: '',
                            bodyValues: {
                                variable_1: vPatientName,
                                variable_2: req.Data.Age,
                                variable_3: req.Data.Gender.Description,
                                variable_4: moment(req.Data.RegisteredDate).format(dateformat),
                                variable_5: req.Data.MRN,
                                // variable_5: req.Data.MRN,
                                variable_6: req.Data.Mobile,
                                // variable_7: '',
                                // variable_8: '',
                                // variable_9: ''
                            }
                        }
                    }
                };

                data.whatsapp.template.templateName = 'patient_registration_25_09_clone';
                if (data.whatsapp.template.templateName !== '') {
                    const whatsApp = new WhatsappNotificationService();
                    let msgRes = await whatsApp.sendMessage(data);
                    console.log(msgRes);
                }

            } else if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'BeWell') {
                // let dateformat = 'DD/MM/YYYY';
                let data = {
                    Name: vPatientName,
                    Email: (req.Data.Email) ? req.Data.Email : '',
                    Phone: '+91' + req.Data.Mobile,
                    TemplateName: 'medical',
                    BotId: 56374702
                };
                if (data.TemplateName !== '') {
                    const whatsApp = new WhatsappNotificationService();
                    let msgRes = await whatsApp.sendMessage(data);
                    console.log(msgRes);
                }

            } else if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'CAUVERY') {
                // let smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('registration', 'registration', 3);
                let data = {
                    TemplateName: 'patientsregistration',
                    ToNumbersWithCountryCode: req.Data.Mobile,
                    msg: 'Dear ' + vPatientName + ', Welcome to ' + this.Session.FacilityName +
                        ' Your registration ID ' + req.Data.MRN + '. Please note your login; UserName:' +
                        req.Data.MRNShortCode + ' Password:' + passWord + ' Thanks Hospital Management -' +
                        this.Session.FacilityName + ' For any queries please call ' + landline + '.',
                    BodyParameter: [vPatientName, this.Session.FacilityName, req.Data.MRN, req.Data.MRNShortCode,
                        passWord, this.Session.FacilityName, landline]
                };
                const whatsApp = new WhatsappNotificationService();
                let msgRes = await whatsApp.sendMessage(data);
                console.log(msgRes, 'here is the Registration');
            } else if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'CHAMPION') {
                let data = {
                    template: 'registration',
                    Mobile: req.Data.Mobile,
                    MRN: req.Data.MRN
                };
                const whatsApp = new WhatsappNotificationService();
                let msgRes = await whatsApp.sendMessage(data);
                console.log(msgRes, 'here is the ChampionRegistration');
            } else if (WhatsAppConfig['PROVIDER'] && WhatsAppConfig['PROVIDER'] === 'JSS') {
                try {
                    let data = {
                        TemplateName: 'himswelcome',
                        mobile: req.Data.Mobile,
                        BodyParameter: [vPatientName, req.Data.MRN]
                    };
                    const whatsApp = new WhatsappNotificationService();
                    let msgRes = await whatsApp.sendMessage(data);
                    console.log(msgRes, 'here is jss Registartion');
                } catch (error) {
                    console.log('Error Processing messages:', error);
                }
            }
            if (SmsConfig['PROVIDER'] === 'DEEPAM') {
                let smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('DeepamRegistration', 'DeepamRegistration', 1);
                if (smsTemplateInfo) {
                    let smsmodel = {
                        numbers: [req.Data.Mobile],
                        message: Template.Compile(smsTemplateInfo.TemplateContent,
                            {
                                patientName: vPatientName,
                                facilityName: this.Session.FacilityName,
                                MRN: req.Data.MRN
                            }),
                        templateId: smsTemplateInfo.ModuleId
                    };
                    if (smsProvider) {
                        let SMSStatus = await smsProvider.send(smsmodel);
                        let eventDashboardOutboundBo = BoFactory.GetBo(appbo.EventDashboardBo, this.Request);
                        await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + req.Data.Mobile);
                    }
                }
            } else if (SmsConfig['PROVIDER'] === 'VSCAN') {
                let smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('BillReady', 'BillReady', 1);
                if (smsTemplateInfo) {
                    let smsmodel = {
                        numbers: [req.Data.Mobile],
                        message: Template.Compile(smsTemplateInfo.TemplateContent,
                            {
                                patientName: vPatientName,
                                billAmount: 300
                                // facilityName: this.Session.FacilityName,
                                // MRN: req.Data.MRN
                            }),
                        templateId: smsTemplateInfo.ModuleId
                    };
                    if (smsProvider) {
                        let SMSStatus = await smsProvider.send(smsmodel);
                        let eventDashboardOutboundBo = BoFactory.GetBo(appbo.EventDashboardBo, this.Request);
                        await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + req.Data.Mobile);
                    }
                }
            } else if (SmsConfig['PROVIDER'] === 'SHUVADHARSHINI') {
                try {
                    let smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('PatientRegistrationSdh', 'PatientRegistrationSdh', 1);
                    if (smsTemplateInfo) {
                        let smsmodel = {
                            numbers: [req.Data.Mobile],
                            message: Template.Compile(smsTemplateInfo.TemplateContent,
                                {
                                    firstName: req.Data.FirstName,
                                    lastName: req.Data.LastName,
                                    department: req.Data.DepartmentName,
                                    mrn: req.Data.MRN,
                                    password: passWord
                                }),
                            templateId: smsTemplateInfo.ModuleId
                        };
                        if (smsProvider) {
                            let SMSStatus = await smsProvider.send(smsmodel);
                            let eventDashboardOutboundBo = BoFactory.GetBo(appbo.EventDashboardBo, this.Request);
                            await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + req.Data.Mobile);
                        }
                    }
                } catch (error) {
                    console.log('Error Processing SMS:', error);
                }
            } else {
                let smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('Registration', 'PatientWelcomeSMS', 1);
                console.log('Session');
                console.log(this.Session);
                if (smsTemplateInfo) {
                    let smsmodel = {
                        numbers: [req.Data.Mobile],
                        message: Template.Compile(smsTemplateInfo.TemplateContent,
                            {
                                patientName: vPatientName,
                                mrn: req.Data.MRN,
                                facilityName: this.Session.FacilityName,
                                contactNo: this.Session.FacilityContact,
                                userName: req.Data.MRNShortCode,
                                passWord: 'password',

                            })
                    };
                    if (smsProvider) {
                        let SMSStatus = await smsProvider.send(smsmodel);
                        let eventDashboardOutboundBo = BoFactory.GetBo(appbo.EventDashboardBo, this.Request);
                        await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + req.Data.Mobile);
                    }
                }
            }
        }
    }

    private async processSMSForReferrer(req: any) {
        if (req.Data.ReferTypeId !== 9) {
            if (req.Data.ReferrerNumber) {
                let smsProvider = this.GetSmsProvider();
                let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
                let referralBO = BoFactory.GetBo(generalbo.ReferralBo, this.Request);
                let referralData = await referralBO.GetReferralById({ Id: req.Data.ReferrerId });
                let smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('PatientReferralDoctor', 'PatientReferralDoctor', 1);
                let vPatientName = '';
                if (req.Data.FirstName) vPatientName += req.Data.FirstName;
                if (req.Data.LastName) vPatientName += ' ' + req.Data.LastName;
                let apiReqTitle = {
                    Id: 0,
                    PageContext: { PageSize: 50, PageNumber: 1 },
                    Params: [
                        { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Title' },
                        { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: req.Data.TitleId }
                    ]
                };
                let apiReqGender = {
                    Id: 0,
                    PageContext: { PageSize: 50, PageNumber: 1 },
                    Params: [
                        { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Gender' },
                        { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: req.Data.GenderId }
                    ]
                };
                let vRefDoctorName = '';
                vRefDoctorName = await this.getReferralData(referralData);
                let vTitleName = '';
                let vGender = '';
                let refTitleBo = BoFactory.GetBo(appbo.ReferenceValueBo, this.Request);
                let TitleData = await refTitleBo.GetReferenceValues(apiReqTitle);
                if (TitleData && TitleData.Data && TitleData.Data.length > 0) {
                    if (TitleData.Data[0].Description)
                        vTitleName = TitleData.Data[0].Description;
                }
                let GenderData = await refTitleBo.GetReferenceValues(apiReqGender);
                if (GenderData && GenderData.Data && GenderData.Data.length > 0) {
                    if (GenderData.Data[0].Description)
                        vGender = GenderData.Data[0].Description;
                }
                if (vTitleName)
                    vPatientName = vTitleName + '.' + vPatientName;
                let apiReqref = {
                    Id: 0,
                    PageContext: { PageSize: 50, PageNumber: 1 },
                    Params: [
                        { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'ReferralType' },
                        { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: req.Data.ReferTypeId }
                    ]
                };
                let refData = await refTitleBo.GetReferenceValues(apiReqref);
                let refType = refData.Data[0].Description;
                if (SmsConfig['PROVIDER'] === 'SHUVADHARSHINI') {
                    if (smsTemplateInfo) {
                        let smsmodel = {
                            numbers: [req.Data.ReferrerNumber],
                            message: Template.Compile(smsTemplateInfo.TemplateContent,
                                {
                                    patientName: vPatientName,
                                    mrn: req.Data.MRN,
                                    referredby: vRefDoctorName,
                                    sourcetype: refType,
                                    priority: 'Yes',
                                }),
                            templateId: smsTemplateInfo.ModuleId
                        };
                        if (smsProvider) {
                            let SMSStatus = await smsProvider.send(smsmodel);
                            let eventDashboardOutboundBo = BoFactory.GetBo(appbo.EventDashboardBo, this.Request);
                            await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : '
                                + req.Data.ReferrerNumber);
                        }
                    }
                } else if (smsTemplateInfo) {
                    let smsmodel: any = {
                        numbers: [req.Data.ReferrerNumber],
                        message: Template.Compile(smsTemplateInfo.TemplateContent,
                            {
                                refDoctorName: vRefDoctorName,
                                patientName: vPatientName,
                                mrn: req.Data.MRN,
                                age: req.Data.Age,
                                gender: vGender,
                                facilityName: this.Session.FacilityName
                            })
                    };
                    if (smsTemplateInfo.ModuleId) {
                        smsmodel.templateId = smsTemplateInfo.ModuleId;
                    }
                    if (smsProvider) {
                        let SMSStatus = await smsProvider.send(smsmodel);
                        let eventDashboardOutboundBo = BoFactory.GetBo(appbo.EventDashboardBo, this.Request);
                        await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + req.Data.ReferrerNumber);
                    }
                }
            }
        }
    }

    private async getReferralData(referralData: any): Promise<string> {
        let vRefDoctorName = '';
        if (referralData) {
            if (referralData) {
                if (referralData.ReferralName) {
                    vRefDoctorName += ' ' + referralData.ReferralName;
                } else {
                    if (referralData.Text)
                        vRefDoctorName += ' ' + referralData.Text;
                }

            }
        }
        return vRefDoctorName;
    }

    private async UpdateEncounterInfo(req: any) {

        let encounterBO = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterUpdateMRN: any = { PatientMrn: req.Data.MRN };
        await encounterBO.Update(encounterUpdateMRN, {
            fields: ['PatientMrn'],
            where: {
                PatientId: req.Data.Id,
                PatientMrn: null
            }
        });
    }

    private async ManageHL7Msg(req: any) {

        if (req.Data.MRN) {
            let eventDashboardOutboundBo = BoFactory.GetBo(appbo.EventDashboardBo, this.Request);
            await eventDashboardOutboundBo.ManageOutBound(req.Data.Id, req);
        }
    }

    private async ManageMRDLocation(req: any) {

        let MRDLocBo = BoFactory.GetBo(ipbo.MRDLocationBo, this.Request);
        let mrdUpdateMRN: any = { PatientMrn: req.Data.MRN, BarcodeId: req.Data.MRN, };
        await MRDLocBo.Update(mrdUpdateMRN, {
            fields: ['PatientMrn', 'BarcodeId'],
            where: {
                PatientId: req.Data.Id,
                PatientMrn: null
            }
        });
    }

    private async updatePatientQMSData(req: any) {
        let QMSBo = BoFactory.GetBo(regbo.QMSBo, this.Request);
        let qmsUpdateMRN: any = { MRN: req.Data.MRN };
        await QMSBo.Update(qmsUpdateMRN, {
            fields: ['MRN'],
            where: {
                PatientId: req.Data.Id,
                MRN: null
            }
        });
    }

    private async ManageFileRequest(req: any) {

        let MRDLocBo = BoFactory.GetBo(ipbo.FileRequestBo, this.Request);
        let mrdUpdateMRN: any = { PatientMrn: req.Data.MRN };
        await MRDLocBo.Update(mrdUpdateMRN, {
            fields: ['PatientMrn'],
            where: {
                PatientId: req.Data.Id,
                PatientMrn: null
            }
        });
    }

    private async processMRNShortCode(req: any) {
        try {
            if (req.Data.MRNShortCode.length > 5) {
                let id = req.Data.MRNShortCode;
                req.Data.MRNShortCode = id.substr(id.length - 6);
                if (!isNaN(req.Data.MRNShortCode)) {
                    req.Data.MRNShortCode = Number(req.Data.MRNShortCode);
                }
            }
            await this.Update(req.Data);
        } catch (ex) {
            console.log(ex);
        }
    }

    private async isAutoPatientPortalAccess(): Promise<number> {
        let AutoPatientPortalAccess = 0;
        try {
            let facilityprebo = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
            let facilityPreferencesData =
                await facilityprebo.GetPrintPreferences('billing', null, this.Session.FacilityId);
            if (facilityPreferencesData && facilityPreferencesData.autopatientportal) {
                try {
                    AutoPatientPortalAccess = parseInt(facilityPreferencesData.autopatientportal);
                } catch (ex) { AutoPatientPortalAccess = 0; }
            }
        } catch (ex) { AutoPatientPortalAccess = 0; }

        return AutoPatientPortalAccess;
    }
    private async processAutoPatientPortal(req: any) {
        if (req && req.Data && req.Data.Id && !req.Data.Staff) {
            let AutoPatientPortalAccess = await this.isAutoPatientPortalAccess();
            if (AutoPatientPortalAccess) {
                let newreq = { Id: req.Data.Id };
                let patientdata = await this.GetPatientById(newreq);

                let PatientPortalData: any = {
                    TitleId: patientdata.TitleId,
                    ActionFrom: new Date(),
                    GenderId: patientdata.GenderId,
                    FirstName: patientdata.FirstName,
                    MiddleName: patientdata.MiddleName,
                    LastName: patientdata.LastName,
                    Age: patientdata.Age,
                    DOB: patientdata.DOB,
                    NationalityId: patientdata.NationalityId,
                    AadharNumber: req.Data.AadharNumber,
                    LandLine: patientdata.LandLine,
                    Email: patientdata.Email,
                    Mobile: patientdata.Mobile,
                    CityId: patientdata.CityId,
                    StateId: patientdata.StateId,
                    CountryId: patientdata.CountryId,
                    PinCodeId: patientdata.PinCodeId,
                    Area: patientdata.Area,
                    City: patientdata.City,
                    State: patientdata.State,
                    Country: patientdata.Country,
                    UserName: req.Data.MRNShortCode,
                    Password: 'password',
                    IsActive: true,
                    ActiveStatus: 'Active',
                    ActiveStatusId: 2,
                    FacilityId: patientdata.FacilityId,
                    DepartmentId: req.Data.DepartmentId,
                    OrgId: 1,
                    UserTypeId: 8,
                    UserGroupId: 8,
                    PatientId: patientdata.Id,
                    LoginPermission: 1,
                    GroupCode: 'PATIENTPORTAL'
                }; //UserType - Patient
                let patientportalaccess = BoFactory.GetBo(userbo.UserBo, this.Request);
                await patientportalaccess.Save(PatientPortalData);
            }
        }
    }


}
