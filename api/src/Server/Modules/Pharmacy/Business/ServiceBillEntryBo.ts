import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ServiceBillEntryInstance, ServiceBillEntryAttributes } from '../Model/Interface/Index';
import { ServiceBillEntryFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import { join } from 'path';

export class ServiceBillEntryBo extends BaseBo<ServiceBillEntryInstance, ServiceBillEntryAttributes> implements IOptionProvider {
    public async AddServiceBillEntry(req: BaseRequest): Promise<number> {
        let generateServicebillno = 0;
        if (!req.Data.ServiceBillNo &&
            (req.Data.ServiceBillStatusId === 2 || req.Data.ServiceBillStatusId === 3)) {
            req.Data.ServiceBillNo = null;
            generateServicebillno = 1;
        }
        let result = await this.Save(req.Data);
        let ServiceBillEntryid = result.dataValues.Id;
        if (generateServicebillno === 1) {
            this.deferSequenceKey(ServiceBillEntryid, 'ServiceBillNo',
                this.getSequenceIdentifier(SequenceKeys.ServiceBillEntryId));
        }
        return ServiceBillEntryid;
    }

    public async UpdateServiceBillEntry(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetServiceBillEntryById(req: BaseRequest): Promise<ServiceBillEntryAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetServiceBillEntrys(apiReq?: ApiRequest<ServiceBillEntryFilters>): Promise<ApiResponse<ServiceBillEntryAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('ServiceBillType'));
        include.push(this.GetReference('ServiceBillStatus'));
        include.push({ model: this.Models.Department, required: false });
        include.push({ model: this.Models.VendorMaster, required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ServiceBillEntryFilters.Id:
                        where['ServiceBillId'] = param.Value;
                        break;
                    case ServiceBillEntryFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case ServiceBillEntryFilters.ServiceBillDate:
                        where['ServiceBillDate'] = { '$between': param.Value };
                        break;
                    case ServiceBillEntryFilters.From:
                        where['ServiceBillDate'] = where['ServiceBillDate'] || {};
                        (where['ServiceBillDate'] as any)['$gte'] = param.Value;
                        break;
                    case ServiceBillEntryFilters.To:
                        where['ServiceBillDate'] = where['ServiceBillDate'] || {};
                        (where['ServiceBillDate'] as any)['$lte'] = param.Value;
                        break;
                    case ServiceBillEntryFilters.ServiceBillTypeId:
                        where['ServiceBillTypeId'] = param.Value;
                        break;
                    case ServiceBillEntryFilters.ServiceBillStatusId:
                        where['ServiceBillStatusId'] = param.Value;
                        break;
                    case ServiceBillEntryFilters.ServiceBillNo:
                        where['ServiceBillNo'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteServiceBillEntry(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ServiceBillEntryInstance, ServiceBillEntryAttributes> {
        return this.Models.ServiceBillEntry;
    }
    public async PrintWagesServices(req: BaseRequest): Promise<FileInfo> {

        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: ServiceBillEntryFilters.Id, Value: req.Id }]
        };
        let data = await this.GetServiceBillEntrys(apiReq);
        let WageServices = data.Data[0];

        // });
        let info = {
            WageService: WageServices,
        };
        let pdfOption: any = null;
        let key = 'wagesservicesbill';
        pdfOption = {
            format: 'A4',
            orientation: 'Portrait',
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
       // return await Report.Generate('wagesservicesbill', { header: {}, body: info });
         return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ServiceBillEntryFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['ServiceBillEntry', 'Text'], 'ServiceBillEntry', 'Code'];
        let val = await this.GetServiceBillEntrys(apiReq);
        return { [key]: val.Data };
    }
}
