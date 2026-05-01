import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { NewAssetRequestInstance, NewAssetRequestAttributes } from '../Model/Interface/Index';
import { NewAssetRequestFilters } from '../Common/Filters.e';
import { join } from 'path';
import { BoFactory } from '../../Base/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';

export class NewAssetRequestBo extends BaseBo<NewAssetRequestInstance, NewAssetRequestAttributes> implements IOptionProvider {
    public async AddNewAssetRequest(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateNewAssetRequest(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }
    public async GetNewAssetRequestById(req: BaseRequest): Promise<NewAssetRequestAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }
    public async GetNewAssetRequests(apiReq?: ApiRequest<NewAssetRequestFilters>): Promise<ApiResponse<NewAssetRequestAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Department, as: 'Department', required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'RequestedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ApprovedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push(this.GetReference('AssetRequestStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case NewAssetRequestFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case NewAssetRequestFilters.AssetName:
                        where['AssetName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case NewAssetRequestFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case NewAssetRequestFilters.ManufacturerId:
                        where['ManufacturerId'] = param.Value;
                        break;
                    case NewAssetRequestFilters.AssetRequestStatusId:
                        where['AssetRequestStatusId'] = param.Value;
                        break;
                    case NewAssetRequestFilters.RequestedDate:
                        where['RequestedDate'] = { '$between': param.Value };
                        break;
                    case NewAssetRequestFilters.From:
                        where['RequestedDate'] = where['RequestedDate'] || {};
                        (where['RequestedDate'] as any)['$gte'] = param.Value;
                        break;
                    case NewAssetRequestFilters.To:
                        where['RequestedDate'] = where['RequestedDate'] || {};
                        (where['RequestedDate'] as any)['$lte'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteNewAssetRequest(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<NewAssetRequestFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['AllergyName', 'Text'], 'AllergyName', 'AllergyTypeId', 'Description'];
        let val = await this.GetNewAssetRequests(apiReq);
        return { [key]: val.Data };
    }

    public async PrintNewAssetRequestReport(apiReq?: ApiRequest<NewAssetRequestFilters>): Promise<any> {
        let data = await this.GetNewAssetRequests(apiReq);
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let Department = apiReq.Data.Department;
        let AssetRequestStatus = apiReq.Data.AssetRequestStatus;
        let NewAssetRequestList = data.Data;
        let NewAssetRequestData = data.Data[0];
        // let AssetData = NewAssetRequestData.Asset;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(NewAssetRequestData.FacilityId);
        let info = {
            NewAssetRequestList: NewAssetRequestList,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            Department: Department,
            AssetRequestStatus: AssetRequestStatus
        };
        let pdfOption: any = null;
        let key = 'newassetrequestreport';
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
            base: 'file://' + join(__dirname, '/../../Templates/assets/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public GetModel(): SStatic.Model<NewAssetRequestInstance, NewAssetRequestAttributes> {
        return this.Models.NewAssetRequest;
    }
    public async GetAssetInfoDashBoard(req: BaseRequest): Promise<any> {
        /* Without Orders group by Subdeptarment */
        let NewAssetRequestCount = await this.Items.count({
            where: {
                'Status': 1,
            }
        });

        return {
            'NewAssetRequestCount': NewAssetRequestCount
        };

    }
}
