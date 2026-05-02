import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo, Template } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PatientArchiveInstance, PatientArchiveAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Registration/Business/Index';
import * as regbo from '../../Registration/Business/Index';
import * as encbo from '../../Visit/Business/Index';
import * as appointmentbo from '../../Appointment/Business/Index';
import * as appbo from '../../SystemSettings/Business/Index';
import * as billingBo from '../../Billing/Business/Index';
import * as ipbo from '../../IPManagement/Business/Index';
import { ReferenceValueFilters } from '../../SystemSettings/Common/Filters.e';
import { PatientArchiveFilters, PatientKinFilters, PatientGuarantorFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import { readFileSync, writeFileSync } from 'fs';
import { AppConfig } from '../../../../config/index';
import * as moment from 'moment';
import { join } from 'path';
import * as userbo from '../../SystemSettings/Business/Index';
import * as generalbo from '../../GeneralMaster/Business/Index';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import { ReferralAttributes } from '../../GeneralMaster/Model/Interface/Index';

export class PatientArchiveBo extends BaseBo<PatientArchiveInstance, PatientArchiveAttributes> implements IOptionProvider {

    public async AddPatientArchive(req: BaseRequest): Promise<number> {
        let generateMRN: string = null;

        if (await this.IsAlreadyExist(req) === -1) return -1;

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
            let patientGuarantorBO = BoFactory.GetBo(bo.PatientGuarantorBo, this.Request);
            await patientGuarantorBO.ManagePatientSelfGuarantor(patientId);
        }

        return patientId;
    }

    public async ManagePatientArchiveWithBill(req: BaseRequest): Promise<number> {
        let generateMRN: string = null;
        if (req.Data.IsTempPatient || req.Data.Id <= 0) { // Only new Patient
            if (await this.IsAlreadyExist(req) === -1) return -1;
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
        await this.processSMSForReferrer(req);
        return patientId;
    }

    public async UpdatePatientArchive(req: BaseRequest): Promise<boolean> {
        let generateMRN: string = null;
        let mrnAttrs = await this.GetById(req.Data.Id, { attributes: ['MRNTypeId', 'MRN'] });

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

        if (generateMRN) {
            let patientGuarantorBO = BoFactory.GetBo(bo.PatientGuarantorBo, this.Request);
            await patientGuarantorBO.ManagePatientSelfGuarantor(req.Data.Id);

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

    public async GetPatientArchiveProfilePic(req: BaseRequest): Promise<any> {
        let fileBuff = await readFileSync(req.Data.PhotoPath);
        let photoBase64 = new Buffer(fileBuff).toString('base64');
        return { Id: req.Data.Id, Photo: photoBase64 };
    }

    public async GetPatientArchiveMinimalInfoById(req: BaseRequest): Promise<PatientArchiveAttributes> {
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

    public async GetPatientArchiveById(req: BaseRequest): Promise<PatientArchiveAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('Gender'));
        include.push(this.GetReference('Title'));
        include.push(this.GetReference('PatientStatus'));
        include.push(this.GetReference('MaritalStatus'));
        include.push(this.GetReference('Religion'));
        include.push(this.GetReference('Nationality'));
        include.push(this.GetReference('BloodGroup'));
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

        // include.push({
        //     model: this.Models.Encounter, attributes: ['EncounterId', 'AppointmentId', 'VisitIdentifier', 'EncounterTypeId',
        //         'AdmissionDate', 'DischargeDate', 'EncounterStatusId', 'DoctorName', 'GuarantorId', 'AdmissionStatusId', 'IsBillLock',
        //         'ReferralId', 'ReferralName', 'ReferralTypeId'],
        //     required: false, where: { 'IsLatest': true },
        //     include: [{
        //         model: this.Models.EncounterDoctor, required: false,
        //         attributes: ['DoctorId', 'DoctorName', 'DepartmentId', 'StartDate', 'EndDate',
        //             'EncounterDoctorStatus', 'IsPrimary'],
        //         include: [{ model: this.Models.Department, attributes: ['DepartmentName'], required: false },
        //         this.GetReference('ConsultationStatus')]
        //     }, {
        //         model: this.Models.EncounterGuarantor, attributes: ['EncounterGuarantorId', 'GuarantorTypeId', 'GuarantorId'],
        //         required: false, where: { 'Rank': 1 }
        //     }]
        // });

        let attributes: any = {};
        // attributes['include'] = [];
        // let billQry = this.GetSelectQuery(this.Models.PatientBills, {
        //     attributes: [this.Dal.fn('SUM', this.Dal.col('OutStandingAmount'))],
        //     where: [this.Dal.literal('`PatientId` = ' + req.Id),
        //     {
        //         'Status': 1,
        //         'PatientBillStatusId': 3
        //     }]
        // }, 'OutStandingAmount');
        // attributes.include.push(billQry);

        // let paidQry = this.GetSelectQuery(this.Models.PatientPaymentDetails, {
        //     attributes: [this.Dal.fn('SUM', this.Dal.col('AmountPaid'))],
        //     where: [this.Dal.literal('`PatientId` = ' + req.Id),
        //     {
        //         'Status': 1,
        //         'ReceiptTypeId': 1,
        //         'ReceiptStatusId': 1
        //     }]
        // }, 'AmountPaid');
        // attributes.include.push(paidQry);

        // let adjustedQry = this.GetSelectQuery(this.Models.PatientPaymentDetails, {
        //     attributes: [this.Dal.fn('SUM', this.Dal.col('AmountAdjusted'))],
        //     where: [this.Dal.literal('`PatientId` = ' + req.Id),
        //     {
        //         'Status': 1,
        //         'ReceiptTypeId': 1,
        //         'ReceiptStatusId': 1
        //     }]
        // }, 'AmountAdjusted');
        // attributes.include.push(adjustedQry);

        let result = await this.GetById(req.Id, { include: include, attributes: attributes });
        return this.GetAttribute(result);
    }

    public async GetPatientArchiveInfoById(req: BaseRequest): Promise<PatientArchiveAttributes> {
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

    public async GetPatientArchiveByIdForPharmacy(req: BaseRequest): Promise<PatientArchiveAttributes> {
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
                'AdmissionDate', 'DischargeDate', 'EncounterStatusId', 'DoctorName', 'GuarantorId', 'AdmissionStatusId', 'IsBillLock'],
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
            }]
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

    public async GetPatientArchives(apiReq?: ApiRequest<PatientArchiveFilters>): Promise<ApiResponse<PatientArchiveAttributes[]>> {
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
        include.push({ model: this.Models.Occupation, attributes: ['Occupations', 'Code'], required: false });
        include.push({ model: this.Models.Guarantor, attributes: ['GuarantorName'], required: false });
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({
            model: this.Models.Referral, attributes:
                ['ReferralName', 'ReferralCode', 'AddressLine1', 'PhoneNo', 'CityId'], required: false
        });
        // let includeApptQuery = false;
        // let apptQryJoin: any = {
        //     model: this.Models.Appointment,
        //     attributes: ['AppointmentDate', 'StartTime', 'AppointmentStatusId', 'Id', 'FacilityId'],
        //     required: false,
        //     include: [this.GetReference('AppointmentStatus'),
        //     { model: this.Models.Remark, attributes: ['Remarks'], required: false },
        //     {
        //         model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false,
        //         include: [this.GetReference('Title')]
        //     },
        //     { model: this.Models.Department, attributes: ['DepartmentName'], required: false },
        //     {
        //         model: this.Models.Encounter, attributes: ['EncounterId', 'VisitIdentifier',
        //             'Comments', 'DoctorId', 'VisitTypeId', 'AdmissionDate', 'DischargeDate',
        //             'DepartmentId', 'ReferralId', 'DoctorName', 'GuarantorId', 'TeamId',
        //             'IsNoBill', 'IsPaidVisit', 'FreeVisit', 'EncounterTypeId'], required: false
        //     }]
        // };
        // let encounterQryJoin: any = {
        //     model: this.Models.Encounter, attributes: ['EncounterId', 'AppointmentId', 'VisitIdentifier',
        //         'Comments', 'DoctorId', 'AdmissionDate', 'DischargeDate', 'EncounterStatusId', 'DoctorName', 'EncounterTypeId',
        //         'VisitTypeId', 'DepartmentId', 'ReferralId', 'GuarantorId', 'ALOS', 'FacilityId', 'TeamId',
        //         'IsNoBill', 'IsPaidVisit', 'FreeVisit'],
        //     include: [this.GetReference('AdmissionStatus', ['Description', 'ColorCode']),
        //     this.GetReference('AdmittingReason'),
        //     this.GetReference('AppointmentStatus'),

        //     {
        //         model: this.Models.PatientGuarantor, attributes: ['GuarantorName'], required: false,
        //     },
        //     {
        //         model: this.Models.EncounterDoctor, required: false,
        //         attributes: ['DoctorId', 'DoctorName', 'DepartmentId', 'StartDate', 'EndDate',
        //             'EncounterDoctorStatus', 'IsPrimary'],
        //         include:
        //             [{ model: this.Models.Department, attributes: ['DepartmentName'], required: false },
        //             this.GetReference('ConsultationStatus')]
        //     },
        //     {
        //         model: this.Models.WardMaster, attributes: ['WardName'], required: false,
        //     },
        //     {
        //         model: this.Models.WardRoomMaster, attributes: ['Id', 'RoomNo', 'Description'], required: false,
        //     },
        //     {
        //         model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
        //     }
        //     ],
        //     required: false, where: { 'IsLatest': true }
        // };

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientArchiveFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientArchiveFilters.Name:
                        if (mrnshortcode > 0) {
                            (where as any)['$or'] = [{ 'FirstName': { '$like': (param.Value || '') + '%' } },
                            { 'MiddleName': { '$like': (param.Value || '') + '%' } },
                            { 'LastName': { '$like': (param.Value || '') + '%' } },
                            { 'MRN': { '$eq': param.Value } },
                            { 'Mobile': { '$eq': param.Value } }];
                        } else {
                            (where as any)['$or'] = [{ 'FirstName': { '$like': (param.Value || '') + '%' } },
                            { 'MiddleName': { '$like': (param.Value || '') + '%' } },
                            { 'LastName': { '$like': (param.Value || '') + '%' } },
                            { 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'Mobile': { '$eq': param.Value } }];
                        }
                        break;
                    // case PatientArchiveFilters.VisitID:
                    //     encounterQryJoin = {
                    //         model: this.Models.Encounter, attributes: ['EncounterId', 'VisitIdentifier',
                    //             'EncounterTypeId', 'DischargeDate', 'AppointmentId'],
                    //         include: [
                    //             this.GetReference('AdmissionStatus'),
                    //             { model: this.Models.Appointment, attributes: ['AppointmentDate', 'StartTime', 'Id'], required: false },
                    //             { model: this.Models.WardMaster, attributes: ['WardName', 'WardMasterTypeId'], required: false },
                    //             { model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false },
                    //             { model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description'], required: false },
                    //         ],
                    //         required: true, where: { 'VisitIdentifier': param.Value }
                    //     };
                    //     break;
                    case PatientArchiveFilters.MRN:
                        where['MRN'] = param.Value;
                        break;
                    case PatientArchiveFilters.DOB:
                        where['DOB'] = param.Value;
                        break;
                    case PatientArchiveFilters.PhoneNumber:
                        (where as any)['$or'] = [{ 'LandLine': param.Value },
                        { 'Mobile': param.Value }];
                        break;
                    case PatientArchiveFilters.RegisteredDate:
                        where['RegisteredDate'] = { '$between': param.Value || '' };
                        break;
                    case PatientArchiveFilters.PatientStatus:
                        where['PatientStatusId'] = param.Value;
                        break;
                    // case PatientArchiveFilters.IncludeAppointments:
                    //     includeApptQuery = true;
                    //     break;
                    case PatientArchiveFilters.From:
                        where['RegisteredDate'] = where['RegisteredDate'] || {};
                        (where['RegisteredDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientArchiveFilters.To:
                        where['RegisteredDate'] = where['RegisteredDate'] || {};
                        (where['RegisteredDate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientArchiveFilters.ReferrerId:
                        where['ReferrerId'] = param.Value;
                        break;
                    case PatientArchiveFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    case PatientArchiveFilters.Pincode:
                        where['Pincode'] = param.Value;
                        break;
                    case PatientArchiveFilters.CountryName:
                        (where as any)['$or'] = [{ 'Country': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientArchiveFilters.StateName:
                        (where as any)['$or'] = [{ 'State': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientArchiveFilters.CityTownName:
                        (where as any)['$or'] = [{ 'City': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientArchiveFilters.Area:
                        (where as any)['$or'] = [{ 'Area': { '$like': (param.Value || '') + '%' } }];
                        break;
                    // case PatientArchiveFilters.AppointmentStatus:
                    //     includeApptQuery = true;
                    //     let apptFilter = param.Value;
                    //     let apptWhere: any = {};
                    //     if (apptFilter.AppointmentStatus) {
                    //         apptWhere['AppointmentStatusId'] = apptFilter.AppointmentStatus;
                    //     }
                    //     if (apptFilter.My) {
                    //         apptWhere['AssignedUserId'] = this.Session.UserId;
                    //     }
                    //     if (apptFilter.IsPreviousPatient) {
                    //         apptWhere['AppointmentStatusId'] = 11;
                    //         apptWhere['AssignedUserId'] = this.Session.UserId;
                    //     }
                    //     apptQryJoin['required'] = true;
                    //     apptQryJoin['where'] = apptWhere;
                    //     break;
                    case PatientArchiveFilters.VisitDate:
                        let encounterJoinQry = {
                            model: this.Models.Encounter,
                            attributes: ['DoctorId', 'DoctorName'],
                            required: true,
                            where: { 'AdmissionDate': param.Value }
                        };
                        include.push(encounterJoinQry);
                        break;
                    case PatientArchiveFilters.ConsultationStatus:
                        break;
                    case PatientArchiveFilters.ShowTempPatient:
                        if (param.Value) {
                            where['MRNTypeId'] = 1;
                        } else {
                            where['MRNTypeId'] = 2;
                        }
                        break;
                    // case PatientArchiveFilters.IsVistInProgress:
                    //     encounterQryJoin['required'] = param.Value;
                    //     break;
                    case PatientArchiveFilters.IsBillOutStanding:
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
                    case PatientArchiveFilters.NRIC:
                        if (mrnshortcode > 0) {
                            (where as any)['$or'] = [{ 'MRN': { '$eq': param.Value } },
                            { 'NationalityIdentifier': { '$like': (param.Value || '') + '%' } }];
                        } else {
                            (where as any)['$or'] = [{ 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'NationalityIdentifier': { '$like': (param.Value || '') + '%' } }];
                        }
                        break;
                    // case PatientArchiveFilters.visiteddate:
                    //     encounterQryJoin = {
                    //         model: this.Models.Encounter, attributes: ['DoctorId', 'DoctorName', 'AdmissionDate'],
                    //         required: true, where: { 'AdmissionDate': { '$between': param.Value || '' } }
                    //     };
                    //     break;
                    // case PatientArchiveFilters.IsAdmitted:
                    //     encounterQryJoin = {
                    //         model: this.Models.Encounter,
                    //         attributes: ['DoctorId', 'DoctorName', 'EncounterTypeId'],
                    //         required: true, where: { 'EncounterTypeId': param.Value }
                    //     };
                    //     break;
                    // case PatientArchiveFilters.EncFacilityId:
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
                    case PatientArchiveFilters.PatFacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientArchiveFilters.GuardianName:
                        (where as any)['$or'] = [{ 'GuardianName': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientArchiveFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    // case PatientArchiveFilters.VisitTypeId:
                    //     encounterQryJoin = {
                    //         model: this.Models.Encounter,
                    //         attributes: ['DoctorId', 'DoctorName', 'EncounterTypeId', 'VisitTypeId'],
                    //         required: true, where: { 'VisitTypeId': param.Value }
                    //     };
                    //     break;
                    case PatientArchiveFilters.MRNShortCode:
                        where['MRNShortCode'] = param.Value;
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

    public async DeletePatientArchive(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async PrintPatientArchive(req: BaseRequest): Promise<FileInfo> {
        let data = await this.GetPatientArchiveById(req);
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

    public async PrintPatientArchiveLabel(req: BaseRequest): Promise<FileInfo> {
        let data = await this.GetPatientArchiveById(req);
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
        let pdfOption: any = null;
        let key = 'patient';
        if (req.Data) {
            key = 'patientidcard';
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
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public async PrintPatientArchiveCard(req: BaseRequest): Promise<string> {
        let data = await this.GetPatientArchiveById(req);
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

    public GetModel(): SStatic.Model<PatientArchiveInstance, PatientArchiveAttributes> {
        return this.Models.PatientArchive;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<PatientArchiveFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['FirstName', 'Text'],
            'FirstName', 'MiddleName', 'LastName', 'DOB', 'Age', 'Mobile', 'MRN', 'GenderId',
            'TitleId', 'PatientStatusId', 'GuarantorId', 'RegisteredDate'];
        let val = await this.GetPatientArchives(apiReq);
        return { [key]: val.Data };
    }

    public async GetFacilityInfoDashBoard(req: BaseRequest): Promise<any> {
        let registrationCount = await this.Items.count({
            where: {
                'Status': 1,
                'RegisteredDate': { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            }
        });
        let deseasedCount = await this.Items.count({
            where: {
                'Status': 1,
                'PatientStatusId': 4,
                'DeathUpdatedDate': { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
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

    public async ManageAutoAppointment(PatientId: number, PatientGuarantorId: number,
        req: BaseRequest, ApptDate: Date, ApptStartTime: string, ApptEndTime: string): Promise<number> {
        let AppId: number;
        if (req.Data.Id <= 0) {
            let AppointmentData: any = {
                Data: {
                    Id: 0,
                    NoDraftBill: req.Data.NoDraftBill,
                    FacilityId: req.Data.FacilityId,
                    ReferralId: req.Data.ReferrerId,
                    ReferralTypeId: req.Data.ReferTypeId,
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
                    PatientId: PatientId,
                    PatientGuarantorId: PatientGuarantorId,
                    PriorityId: 3,
                    ValidateDuplicateEncounter: false,
                    OrderScheduledId: -1,
                    Comments: req.Data.Comments,
                    RemarkId: req.Data.RemarkId,
                    StartTime: ApptStartTime,
                    EndTime: ApptEndTime
                }
            };
            let AppBo = BoFactory.GetBo(appointmentbo.AppointmentBo, this.Request);
            AppId = await AppBo.AddAppointment(AppointmentData);
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
                    PatientId: PatientId,
                    PatientGuarantorId: PatientGuarantorId,
                    PriorityId: 3,
                    ValidateDuplicateEncounter: false,
                    OrderScheduledId: -1,
                    RemarkId: req.Data.RemarkId,
                    Comments: req.Data.Comments
                }
            };
            let AppBo = BoFactory.GetBo(appointmentbo.AppointmentBo, this.Request);
            AppId = await AppBo.AddAppointment(AppointmentData);
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

    public async RegCumVisitWithBill(req: BaseRequest): Promise<number> {
        let PatientId: number;
        let AppId: number;
        let AppDispId: number;
        let PatientGuarantorId: number;
        let PatientGuarantorTypeId: number;
        let PatientGuarantorName: string;
        let encounterId: number;
        let PatientMRN: string;
        let DoctorId: number;
        let DoctorName: string;
        let RequestTypeId_ = 0;
        let MRDTypeId_ = 1; //OP
        let MrdRequestTypeId_ = 1; //visit
        let FrmDeptId = 0;
        let ToDeptId = 0;
        let CurrentLocId = 0;
        let NewPatient = 0;
        let IsMRDRequired = 0;
        let IsMRDFileCreation = 0;
        let MRDMovementStatusId = 0;
        let IsManual = false;
        let PriorityId = 3;  //medium

        let MReq = req;
        req = MReq.Data.Reg;
        IsMRDRequired = req.Data.IsMRDRequest;
        IsMRDFileCreation = req.Data.IsMRDFileCreation;
        if (req.Data.Id <= 0) NewPatient = 1;
        DoctorName = req.Data.DoctorName;
        DoctorId = req.Data.DoctorId;
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

        let userBo = BoFactory.GetBo(appbo.UserBo, this.Request);
        let userdata = await userBo.GetUserById({ Id: this.Session.UserId });
        if (userdata) {
            FrmDeptId = userdata.DepartmentId;
        }

        PatientId = await this.ManagePatientArchiveWithBill(req);
        if (PatientId <= 0) {
            throw { code: 'Patient Not Registered try again after some time' };
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
        AppId = await this.ManageAutoAppointment(PatientId, PatientGuarantorId,
            reqApp, ApptDate, ApptStartTime, ApptEndTime);
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
            PatientMRN = encdata.Data[0].PatientMrn;
        }
        if (req.Data.IsNoBill)
            await encounterBO.UpdateIsNoBill(req.Data.IsNoBill, encounterId);

        if (req.Data.IsPaidVisit)
            await encounterBO.UpdateIsPaidVisit(req.Data.IsPaidVisit, encounterId);

        if (req.Data.FreeVisit)
            await encounterBO.UpdateFreeVisitCount(req.Data.FreeVisit, encounterId);


        AppDispId = await this.ManageAutoAppointmentDisplay(PatientId, AppId, req);

        req = MReq.Data.Bill;
        if (req.Data && req.Data.Header) {
            req.Data.Header.PatientId = PatientId;
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
        if (ToDeptId > 0 && IsMRDFileCreation) {
            let MRDFileStatusId = 1; // Created
            let MRDLocBo = BoFactory.GetBo(ipbo.MRDLocationBo, this.Request);
            await MRDLocBo.ManageMRDLocation(PatientMRN, RequestTypeId_, MRDTypeId_,
                PatientId, encounterId, DoctorId, DoctorName,
                0, null, null, FrmDeptId, ToDeptId, CurrentLocId, NewPatient,
                MRDFileStatusId, MRDMovementStatusId, IsMRDRequired, IsMRDFileCreation, IsManual, PriorityId, MrdRequestTypeId_);
        }

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
            PatientId = await this.AddPatientArchive(req);
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
                    ReferralId: req.Data.ReferredById,
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
                    ReferralTypeId: req.Data.ReferralTypeId,
                    Comments: req.Data.Comments,
                    StartTime: moment(currentTime).format('HH:mm'),
                    EndTime: moment(currentTime15mins).format('HH:mm')
                }
            };
            let AppBo = BoFactory.GetBo(appointmentbo.AppointmentBo, this.Request);
            AppId = await AppBo.AddAppointment(AppointmentData);

        } else {
            PatientId = req.Data.Id;
            await this.UpdatePatientArchive(req);
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
                    ReferralId: req.Data.ReferredById,
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
                    ReferralTypeId: req.Data.ReferralTypeId,
                    Comments: req.Data.Comments
                }
            };
            let AppBo = BoFactory.GetBo(appointmentbo.AppointmentBo, this.Request);
            AppId = await AppBo.AddAppointment(AppointmentData);
        }
        return AppId;
    }

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

    private async IsAlreadyExist(req: any): Promise<number> {

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
        return 1;
    }

    private async ProcessMRNIdGeneration(generateMRN: string, req: any, patientId: number) {
        const afterO: any = () => {
            return ((bo, request, pId) => {
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
                };
            })(this, req, patientId);
        };

        this.deferSequenceKey(patientId, 'MRN',
            generateMRN === 'temp' ? this.getSequenceIdentifier(SequenceKeys.TempPatientId)
                : this.getSequenceIdentifier(SequenceKeys.PatientId),
            [
                afterO().processEmail,
                afterO().processSMS,
                afterO().updateEncounterInfo,
                afterO().manageHL7Msg,
                afterO().manageMRDLocation,
                afterO().manageFileRequest,
                afterO().processSMSForReferrer,
                afterO().processEmailForReferrer,
                afterO().processMRNShortCode,
            ]);
    }

    private async ProcessEmail(req: any) {

        if (req.Data.Email) {
            let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
            let mailTemplateInfo = await eventTemplateBO.GetTemplateInfo('Registration', 'PatientWelcomeMail', 2);
            const mailData = {
                firstName: req.Data.FirstName,
                mrn: req.Data.MRN,
                facilityName: this.Session.FacilityName
            };
            if (mailTemplateInfo) {
                const mailSubject = Template.Compile(mailTemplateInfo.EmailSubject, mailData);
                const mailBody = Template.Compile(mailTemplateInfo.TemplateContent, mailData);

                let mailProvider = this.GetMailProvider();
                mailProvider.send({
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
            if (GenderData.Data) {
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
    private async ProcessSMS(req: any) {

        if (req.Data.Mobile) {
            let smsProvider = this.GetSmsProvider();
            let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);

            let smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('Registration', 'PatientWelcomeSMS', 1);
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
            if (TitleData.Data) {
                if (TitleData.Data[0].Description)
                    vTitleName = TitleData.Data[0].Description;
            }
            if (vTitleName)
                vPatientName = vTitleName + '.' + vPatientName;

            if (smsTemplateInfo) {
                let smsmodel = {
                    numbers: [req.Data.Mobile],
                    message: Template.Compile(smsTemplateInfo.TemplateContent,
                        { patientName: vPatientName, mrn: req.Data.MRN, facilityName: this.Session.FacilityName })
                };
                if (smsProvider) {
                    let SMSStatus = await smsProvider.send(smsmodel);
                    let eventDashboardOutboundBo = BoFactory.GetBo(appbo.EventDashboardBo, this.Request);
                    await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + req.Data.Mobile);
                }
            }
        }
    }
    private async processSMSForReferrer(req: any) {

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
            if (TitleData.Data) {
                if (TitleData.Data[0].Description)
                    vTitleName = TitleData.Data[0].Description;
            }
            let GenderData = await refTitleBo.GetReferenceValues(apiReqGender);
            if (GenderData.Data) {
                if (GenderData.Data[0].Description)
                    vGender = GenderData.Data[0].Description;
            }
            if (vTitleName)
                vPatientName = vTitleName + '.' + vPatientName;
            if (smsTemplateInfo) {
                let smsmodel = {
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
                if (smsProvider) {
                    let SMSStatus = await smsProvider.send(smsmodel);
                    let eventDashboardOutboundBo = BoFactory.GetBo(appbo.EventDashboardBo, this.Request);
                    await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + req.Data.ReferrerNumber);
                }
            }
        }
    }
    private async getReferralData(referralData: ReferralAttributes): Promise<string> {
        let vRefDoctorName = '';
        if (referralData) {
            if (referralData.ReferralName) vRefDoctorName += ' ' + referralData.ReferralName;
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

}
