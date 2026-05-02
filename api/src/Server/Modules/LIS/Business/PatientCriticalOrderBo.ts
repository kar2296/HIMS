import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientCriticalOrderInstance, PatientCriticalOrderAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import { PatientCriticalOrderFilters } from '../Common/Filters.e';
import * as OrderBo from '../../EMR/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import { join } from 'path';
export class PatientCriticalOrderBo extends BaseBo<PatientCriticalOrderInstance, PatientCriticalOrderAttributes>  {
    public async AddPatientCriticalOrder(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientCriticalOrder(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }



    public async GetPatientCriticalOrderById(req: BaseRequest): Promise<PatientCriticalOrderAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientCriticalOrders(apiReq?: ApiRequest<PatientCriticalOrderFilters>):
        Promise<ApiResponse<PatientCriticalOrderAttributes[]>> {
        let where: WhereOptions<any> = {};
        let patientWhere: WhereOptions<any> = {};
        let PatientOrderWhere: WhereOptions<any> = {};
        let PatientWorkorderWhere: WhereOptions<any> = {};
        let isReqPatientSearch, isReqPatientOrderSearch, isReqPatientWorkorderSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.PatientOrderDetail, required: false });
        include.push({
            model: this.Models.PatientWorkorderdetails, attributes: ['Id', 'Analytename', 'Analyterange',
                'Qualifier', 'AnalyteUOM'], required: false
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientCriticalOrderFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientCriticalOrderFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientCriticalOrderFilters.PatientOrderId:
                        where['PatientOrderId'] = param.Value;
                        break;
                    case PatientCriticalOrderFilters.PatientOrderDetailId:
                        where['PatientOrderDetailId'] = param.Value;
                        break;
                    case PatientCriticalOrderFilters.PatientNameMRN:
                        (patientWhere as any)[Op.or] = [{ FirstName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { LastName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { MRN: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { Mobile: { [Op.like]: (param.Value || '') } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientCriticalOrderFilters.TestName:
                        (where as any)[Op.or] = [{ TestName: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case PatientCriticalOrderFilters.TestTypeId:
                        PatientOrderWhere['TestTypeId'] = param.Value;
                        isReqPatientOrderSearch = true;
                        break;
                    case PatientCriticalOrderFilters.SubDepartmentId:
                        PatientOrderWhere['SubDepartmentId'] = param.Value;
                        isReqPatientOrderSearch = true;
                        break;
                    case PatientCriticalOrderFilters.Approvedbyid:
                        PatientWorkorderWhere['Approvedbyid'] = param.Value;
                        isReqPatientWorkorderSearch = true;
                        break;
                    case PatientCriticalOrderFilters.FacilityId:
                        PatientOrderWhere['FacilityId'] = param.Value;
                        isReqPatientOrderSearch = true;
                        break;
                    case PatientCriticalOrderFilters.DoctorId:
                        PatientOrderWhere['DoctorId'] = param.Value;
                        isReqPatientOrderSearch = true;
                        break;
                    case PatientCriticalOrderFilters.From:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$gte'] = param.Value;
                        break;
                    case PatientCriticalOrderFilters.To:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$lte'] = param.Value;
                        break;
                    case PatientCriticalOrderFilters.EncounterTypeId:
                        PatientOrderWhere['EncounterTypeId'] = param.Value;
                        isReqPatientOrderSearch = true;
                        break;
                    case PatientCriticalOrderFilters.PatientWorkOrderDetailId:
                        where['PatientWorkOrderDetailId'] = param.Value;
                        break;
                    case PatientCriticalOrderFilters.TestId:
                        where['TestId'] = param.Value;
                        break;
                    case PatientCriticalOrderFilters.AnalyteId:
                        where['AnalyteId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age',
                'GenderId', 'DOB', 'AddressLine1', 'AddressLine2', 'Pincode', 'Area', 'City',
                'State', 'Mobile', 'MaritalStatusId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender'), this.GetReference('MaritalStatus')]
        });
        include.push({
            model: this.Models.PatientOrder,
            required: isReqPatientOrderSearch,
            where: PatientOrderWhere,
            include: [{
                model: this.Models.Encounter, attributes: ['Id', 'VisitTypeId'],
                include: [this.GetReference('EncounterType')]

            }, {
                model: this.Models.OrderStatus, attributes: ['DisplayName'],
                required: false
            },
            {
                model: this.Models.Department, attributes: ['DepartmentName'], as: 'OrderFrom',
                required: false
            },
            {
                model: this.Models.Department, attributes: ['DepartmentName'], as: 'SubDeparement',
                required: false
            },
            ]
        });
        include.push({
            model: this.Models.PatientWorkorder,
            attributes: ['Id', 'WorkOrderdid', 'Approvedbyid'],
            required: isReqPatientWorkorderSearch,
            where: PatientWorkorderWhere
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async PrintPatientCriticalOrderReport(apiReq?: ApiRequest<PatientCriticalOrderFilters>): Promise<any> {
        let data = await this.GetPatientCriticalOrders(apiReq);
        let PatientCriticalOrder = data.Data;
        let orderDate: any = '';
        let resutDate: any = '';
        let ltdata: any = {};
        let PatientCriticalOrderDetails: any = [];
        for (let ltidx in PatientCriticalOrder) {
            ltdata = PatientCriticalOrder[ltidx];
            if (ltdata.MedValidationOn) {
                orderDate = new Date(ltdata.OrderedOn);
                resutDate = new Date(ltdata.MedValidationOn);
                let msec = resutDate - orderDate;
                let mins = Math.floor(msec / 60000);
                let hrs = Math.floor(mins / 60);
                let days = Math.floor(hrs / 24);
                mins = mins % 60;
                hrs = hrs % 24;
                days = days % 365;
                let totaltat = days + 'Days ' + hrs + 'Hrs' + mins + 'min';
                ltdata.TAT = totaltat;
            }
            PatientCriticalOrderDetails.push(ltdata);
        }
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let TestName = apiReq.Data.TestName;
        let PatientCriticalOrderData = data.Data[0];
        let orderBO = BoFactory.GetBo(OrderBo.PatientOrderBo, this.Request);
        let PatOrderData = await orderBO.GetPatientOrderById({ Id: PatientCriticalOrderData.PatientOrderId });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatOrderData.FacilityId);
        let info = {
            PatientCriticalOrder: PatientCriticalOrder,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            TestName: TestName,
            PatientCriticalOrderDetails: PatientCriticalOrderDetails
        };
        let pdfOption: any = null;
        let key = 'labtatreport';
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
    public async DeletePatientCriticalOrder(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientCriticalOrderInstance, PatientCriticalOrderAttributes> {
        return this.Models.PatientCriticalOrder;
    }

}
