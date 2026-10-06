import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { EmarInstance, EmarAttributes } from '../Model/Interface/Index';
import { EmarFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../EMR/Business/Index';
//import * as _ from 'lodash';

export class EmarBo extends BaseBo<EmarInstance, EmarAttributes>  {
    public async AddEmar(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateEmar(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async AdministerPrescribedInjection(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        let detailBO = BoFactory.GetBo(bo.PrescriptionDetailBo, this.Request);
        if (req.Data.PrescriptionDetailId) {
            let PresDetailData = await detailBO.GetPrescriptionDetailById({ Id: req.Data.PrescriptionDetailId });
            if (PresDetailData) {
                let updpredet: any = {
                    Id: req.Data.PrescriptionDetailId,
                    AdministeredQuantity: req.Data.AdministeredQuantity,
                    AdministerStatusId: req.Data.AdministerStatusId
                };
                await detailBO.Update(updpredet);
            }
        }
        return result;
    }

    public async ManageEmars(details: EmarAttributes[]): Promise<any> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = 0;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async ManageEmarAfterBill(PatientBillId: number, request: any): Promise<any> {
        await Promise.all(request.Details.map((detail: any) => {
            return (async (emar) => {
                await this.ManageEmarItemAfterBill(PatientBillId, request, emar);
            })(detail);
        }));
        /*
        let details: Array<any> = request.Details;
        let itemDetails: any = _.groupBy(details, (item: any) => { return item.ItemMasterId; });
        await Promise.all(Object.keys(itemDetails).map((itemId: any) => {
            return (async (im) => {
                await this.ManagePrescriptionItem(PatientDispenseId, request, itemDetails[im]);
            })(itemId);
        }));
        */
    }

    public async ManageEmarItemAfterBill(PatientBillId: number, request: any, emar: any): Promise<void> {
        let emaritem = {};
        emaritem = {
            PrescriptionId: emar.PrescriptionId,
            PrescriptionDetailId: emar.PrescriptionDetailId,
            PatientBillId: PatientBillId,
            PatientBillDetailId: emar.Id,
            PatientId: request.Header.PatientId,
            EncounterId: request.Header.EncounterId,
            StoreMasterId: 0,
            InjectionRoomId: 0,
            ItemMasterId: emar.ItemMasterId,
            ItemCode: emar.ItemCode,
            ItemName: emar.ItemName,
            IsGeneric: 0,
            GenericId: emar.GenericId,
            GenericCode: emar.GenericCode,
            GenericName: emar.GenericName,
            DrugId: emar.DrugId,
            DrugCode: emar.DrugCode,
            DrugName: emar.DrugName,
            DrugFormId: 0,
            DrugFrequencyId: 0,
            DrugRouteId: 0,
            Dosage: 0,
            Duration: 0,
            DurationPeriodId: 0,
            DrugInstructionId: 0,
            Quantity: emar.Quantity,
            AdministeredQuantity: 0,
            AdministerStatusId: 1,
            AdministerInstructions: '',
            Price: emar.Rate,
            NetAmount: Number(emar.NetAmount),
            StartDate: null,
            EndDate: null,
            Comments: ''
        };
        await this.Save(emaritem as any);
    }

    public async ManagePatientEmarStatus(patientPrescriptionId: number, details: EmarAttributes[]):
        Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.PrescriptionId = patientPrescriptionId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async CreateEmars(prescriptionId: number, details: EmarAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.PrescriptionId = prescriptionId;
                if (detail.Status === 2 && detail.Id !== 0 && detail.DrugId > 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0 && detail.DrugId > 0) {
                    let result = await this.Save(detail);
                    detail.Id = result.dataValues.Id;
                } else if (detail.Id > 0 && detail.DrugId > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetEmarById(req: BaseRequest): Promise<EmarAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetEmars(apiReq?: ApiRequest<EmarFilters>):
        Promise<ApiResponse<EmarAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let patientQryJoin: any = {
            model: this.Models.Patient, attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'MRNTypeId', 'TitleId', 'GenderId'],
            required: false,
            where: {},
            include: [
                this.GetReference('Title'),
                this.GetReference('Gender')
            ]
        };
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false,
            as: 'CreatedUser',
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false,
            as: 'UpdatedUser',
            include: [this.GetReference('Title')]
        });
        include.push(
            {
                model: this.Models.Prescription,
                required: false,
                include: [
                    {
                        model: this.Models.User,
                        as: 'Doctor',
                        attributes: ['FirstName', 'LastName', 'LicenseNo', 'SignPath'],
                        required: false,
                        include: [this.GetReference('Title')]
                    },
                ]
            }
        );
        include.push({ model: this.Models.PrescriptionDetail, required: false });
        include.push({ model: this.Models.DrugMaster, required: false });
        include.push({ model: this.Models.StoreMaster, required: false });
        include.push(this.GetReference('DurationPeriod'));
        include.push(this.GetReference('DrugInstruction'));
        include.push(this.GetReference('AdministerStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case EmarFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case EmarFilters.PrescriptionId:
                        where['PrescriptionId'] = param.Value;
                        break;
                    case EmarFilters.PrescriptionDetailId:
                        where['PrescriptionDetailId'] = param.Value;
                        break;
                    case EmarFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case EmarFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case EmarFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case EmarFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case EmarFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case EmarFilters.DrugId:
                        where['DrugId'] = param.Value;
                        break;
                    case EmarFilters.AdministerStatus:
                        where['AdministerStatusId'] = param.Value;
                        break;
                    case EmarFilters.CreatedAt:
                        where['CreatedAt'] = { '$between': param.Value || '' };
                        break;
                    case EmarFilters.Patient:
                        patientQryJoin['where']['$or'] = [
                            { 'FirstName': { '$like': (param.Value || '') + '%' } },
                            { 'MiddleName': { '$like': (param.Value || '') + '%' } },
                            { 'LastName': { '$like': (param.Value || '') + '%' } },
                            { 'MRN': { '$like': (param.Value || '') } }
                        ];
                        patientQryJoin['required'] = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push(patientQryJoin);
        order.push(['CreatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteEmar(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<EmarInstance, EmarAttributes> {
        return this.Models.Emar;
    }

}
