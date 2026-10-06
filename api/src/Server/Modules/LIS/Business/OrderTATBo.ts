import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { OrderTATInstance, OrderTATAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import { OrderTATFilters } from '../Common/Filters.e';
import * as OrderBo from '../../EMR/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import { join } from 'path';
export class OrderTATBo extends BaseBo<OrderTATInstance, OrderTATAttributes> {
    public async AddOrderTAT(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateOrderTAT(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async UpdateAcceptedDate(patientOrderDetailId: number): Promise<boolean> {
        var result = true;

        let orderTATUpdate: any = { AcceptedOn: new Date() };
        await this.Models.OrderTAT.update(orderTATUpdate, {
            fields: ['AcceptedOn'],
            where: {
                PatientOrderDetailId: patientOrderDetailId
            }
        });

        return result;
    }

    public async UpdateSampleCollectedDate(patientOrderDetailId: number, data: any): Promise<boolean> {
        var result = true;

        let orderTATUpdate: any = { SampleCollectedOn: data.sampleCollectedDate, SampleReceivedOn: data.sampleReceivedDate };
        await this.Models.OrderTAT.update(orderTATUpdate, {
            fields: ['SampleCollectedOn', 'SampleReceivedOn'],
            where: {
                PatientOrderDetailId: patientOrderDetailId
            }
        });

        return result;
    }
    public async UpdateAssignedDate(orderId: number, data: any): Promise<boolean> {
        var result = true;
        let orderTATUpdate: any = { AssignedOn: data.AssignedOn, WorkOrderId: data.WorkOrderId };
        await this.Models.OrderTAT.update(orderTATUpdate, {
            fields: ['AssignedOn', 'WorkOrderId'],
            where: {
                PatientOrderId: orderId
            }
        });

        return result;
    }

    public async UpdateValidationDate(patientOrderDetailId: number, data: any): Promise<boolean> {
        var result = true;

        let orderTATUpdate: any = {
            TechValidationOn: data.techValidationDate, MedValidationOn: data.medValidationDate,
            WorkOrderId: data.WorkOrderId
        };
        await this.Models.OrderTAT.update(orderTATUpdate, {
            fields: ['TechValidationOn', 'MedValidationOn', 'WorkOrderId'],
            where: {
                PatientOrderDetailId: patientOrderDetailId
            }
        });

        return result;
    }

    public async UpdateReleasedDate(patientOrderDetailId: number, data: any): Promise<boolean> {
        var result = true;

        let orderTATUpdate: any = { ReleasedOn: data.releasedDate };
        await this.Models.OrderTAT.update(orderTATUpdate, {
            fields: ['ReleasedOn'],
            where: {
                PatientOrderDetailId: patientOrderDetailId
            }
        });

        return result;
    }

    public async GetOrderTATById(req: BaseRequest): Promise<OrderTATAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetOrderTATs(apiReq?: ApiRequest<OrderTATFilters>): Promise<ApiResponse<OrderTATAttributes[]>> {
        let where: WhereOptions<any> = {};
        let patientWhere: WhereOptions<any> = {};
        let PatientOrderWhere: WhereOptions<any> = {};
        let PatientWorkorderWhere: WhereOptions<any> = {};
        let isReqPatientSearch, isReqPatientOrderSearch, isReqPatientWorkorderSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.PatientOrderDetail, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case OrderTATFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case OrderTATFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case OrderTATFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case OrderTATFilters.TestId:
                        where['TestId'] = param.Value;
                        break;
                    case OrderTATFilters.PatientOrderId:
                        where['PatientOrderId'] = param.Value;
                        break;
                    case OrderTATFilters.PatientOrderDetailId:
                        where['PatientOrderDetailId'] = param.Value;
                        break;
                    case OrderTATFilters.PatientNameMRN:
                        (patientWhere as any)[Op.or] = [{ FirstName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { LastName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { MRN: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { Mobile: { [Op.like]: (param.Value || '') } }];
                        isReqPatientSearch = true;
                        break;
                    case OrderTATFilters.TestName:
                        (where as any)[Op.or] = [{ TestName: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case OrderTATFilters.AcceptedOn:
                        where['AcceptedOn'] = { '$between': param.Value || '' };
                        break;
                    case OrderTATFilters.OrderedOn:
                        where['OrderedOn'] = { '$between': param.Value || '' };
                        break;
                    case OrderTATFilters.From:
                        where['OrderedOn'] = where['OrderedOn'] || {};
                        (where['OrderedOn'] as any)['$gte'] = param.Value;
                        break;
                    case OrderTATFilters.To:
                        where['OrderedOn'] = where['OrderedOn'] || {};
                        (where['OrderedOn'] as any)['$lte'] = param.Value;
                        break;
                    case OrderTATFilters.AcceptFrom:
                        where['AcceptedOn'] = where['AcceptedOn'] || {};
                        (where['AcceptedOn'] as any)['$gte'] = param.Value;
                        break;
                    case OrderTATFilters.AcceptTo:
                        where['AcceptedOn'] = where['AcceptedOn'] || {};
                        (where['AcceptedOn'] as any)['$lte'] = param.Value;
                        break;
                    case OrderTATFilters.TestTypeId:
                        PatientOrderWhere['TestTypeId'] = param.Value;
                        isReqPatientOrderSearch = true;
                        break;
                    case OrderTATFilters.SubDepartmentId:
                        PatientOrderWhere['SubDepartmentId'] = param.Value;
                        isReqPatientOrderSearch = true;
                        break;
                    case OrderTATFilters.Approvedbyid:
                        PatientWorkorderWhere['Approvedbyid'] = param.Value;
                        isReqPatientWorkorderSearch = true;
                        break;
                    case OrderTATFilters.FacilityId:
                        PatientOrderWhere['FacilityId'] = param.Value;
                        isReqPatientOrderSearch = true;
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
                model: this.Models.OrderStatus, attributes: ['DisplayName'],
                required: false
            },
            {
                model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath',
                    'UserName', 'Qualification'], as: 'CreatedUser', required: false,
                include: [this.GetReference('Title')]
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
            // attributes: ['Id', 'WorkOrderdid', 'Approvedbyid','Approvedbyname','TechValidationByName',
            //     'MedValidationByName','TechValidationdate','MedValidationdate'],
            required: isReqPatientWorkorderSearch,
            where: PatientWorkorderWhere,
            include: [{
                model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'], required: false,
                include: [this.GetReference('Title')]
            }, {
                model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ResultEnteredUser', required: false,
                include: [this.GetReference('Title')]
            }, {
                model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ResultApprovedUser', required: false,
                include: [this.GetReference('Title')]
            },
            {
                model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath',
                    'Qualification', 'LicenseNo'], as: 'MedUser', required: false,
                include: [this.GetReference('Title')]
            },
            {
                model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath'], as: 'AssignedUser', required: false,
                include: [this.GetReference('Title')]
            },
            {
                model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath',
                    'UserName', 'Qualification'], as: 'CreatedUser', required: false,
                include: [this.GetReference('Title')]
            },
            {
                model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath', 'Qualification'],
                as: 'ApprovedUser', required: false,
                include: [this.GetReference('Title')]
            },
            {
                model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath',
                    'UserName', 'LicenseNo'], as: 'Techuser', required: false,
                include: [this.GetReference('Title')]
            },
            {
                model: this.Models.User, attributes: ['FirstName', 'LastName', 'Qualification'], as: 'Orderedby', required: false,
                include: [this.GetReference('Title')]
            }]
        });
        include.push({
            model: this.Models.User, as: 'CreatedUser',
            attributes: ['FirstName', 'LastName', 'UserName'],
            required: true,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, as: 'Doctor',
            attributes: ['FirstName', 'LastName', 'UserName'],
            required: true,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, as: 'Updateduser',
            attributes: ['FirstName', 'LastName', 'UserName'],
            required: true,
            include: [
                this.GetReference('Title')
            ]
        });
        // include.push({
        //     model: this.Models.User, as: 'ApprovedUser',
        //     attributes: ['Id', 'WorkOrderdid', 'Approvedbyid'],
        //     required: isReqPatientWorkorderSearch,
        //     where: PatientWorkorderWhere
        // });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async PrintOrdertatReport(apiReq?: ApiRequest<OrderTATFilters>): Promise<any> {
        let data = await this.GetOrderTATs(apiReq);
        let OrderTAT = data.Data;
        let sampDate: any = '';
        let resutDate: any = '';
        let ltdata: any = {};
        let OrderTatDetails: any = [];
        for (let ltidx in OrderTAT) {
            ltdata = OrderTAT[ltidx];
            if (ltdata.MedValidationOn) {
                sampDate = new Date(ltdata.SampleCollectedOn);
                resutDate = new Date(ltdata.MedValidationOn);
                let msec = resutDate - sampDate;
                let mins = Math.floor(msec / 60000);
                let hrs = Math.floor(mins / 60);
                let days = Math.floor(hrs / 24);
                mins = mins % 60;
                hrs = hrs % 24;
                days = days % 365;
                let totaltat = days + 'Days ' + hrs + 'Hrs' + mins + 'min';
                ltdata.TAT = totaltat;
            }
            OrderTatDetails.push(ltdata);
        }
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let TestName = apiReq.Data.TestName;
        let OrderTATData = data.Data[0];
        let orderBO = BoFactory.GetBo(OrderBo.PatientOrderBo, this.Request);
        let PatOrderData = await orderBO.GetPatientOrderById({ Id: OrderTATData.PatientOrderId });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatOrderData.FacilityId);
        let info = {
            OrderTAT: OrderTAT,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            TestName: TestName,
            OrderTatDetails: OrderTatDetails
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
    public async PrintRadOrdertatReport(apiReq?: ApiRequest<OrderTATFilters>): Promise<any> {
        let data = await this.GetOrderTATs(apiReq);
        let OrderTAT = data.Data;
        let orderDate: any = '';
        let resutDate: any = '';
        let ltdata: any = {};
        let OrderTatDetails: any = [];
        for (let ltidx in OrderTAT) {
            ltdata = OrderTAT[ltidx];
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
            OrderTatDetails.push(ltdata);
        }
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let TestName = apiReq.Data.TestName;
        let OrderTATData = data.Data[0];
        let orderBO = BoFactory.GetBo(OrderBo.PatientOrderBo, this.Request);
        let PatOrderData = await orderBO.GetPatientOrderById({ Id: OrderTATData.PatientOrderId });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatOrderData.FacilityId);
        let info = {
            OrderTAT: OrderTAT,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            TestName: TestName,
            OrderTatDetails: OrderTatDetails
        };
        let pdfOption: any = null;
        let key = 'Radtatreport';
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
    public async DeleteOrderTAT(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<OrderTATInstance, OrderTATAttributes> {
        return this.Models.OrderTAT;
    }

}
