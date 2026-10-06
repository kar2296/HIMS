import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { AssetDisposeInstance, AssetDisposeAttributes } from '../Model/Interface/Index';
import { AssetDisposeFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as assetbo from '../../AssetManagement/Business/Index';

export class AssetDisposeBo extends BaseBo<AssetDisposeInstance, AssetDisposeAttributes>  {
    public async AddAssetDispose(req: BaseRequest): Promise<number> {
        let file = this.Request.file;
        if (file) {
            req.Data.FilePath = file.path;
        }
        //Handling for json 'null' value while save user with file upload
        for (var idx in req.Data) {
            var strValue = req.Data[idx];
            if (strValue === 'null') {
                req.Data[idx] = null;
            }
        }
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateAssetDispose(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetDisposeGroupId(req: BaseRequest): Promise<number> {
        let DisposeGroupId_ = 1;
        let DisposeGroupIdVal: any = await this.Find({
            attributes: [
                [this.Dal.fn('MAX', this.Dal.col('DisposeGroupId')), 'DisposeGroupId'],
            ]
        });
        if (DisposeGroupIdVal) {
            let DisposeGroupIdAttr: any = this.GetAttribute(DisposeGroupIdVal);
            DisposeGroupId_ = DisposeGroupIdAttr['DisposeGroupId'];
            if (!DisposeGroupId_) {
                DisposeGroupId_ = 1;
            } else { DisposeGroupId_++; }
        }
        return DisposeGroupId_;
    }

    public async ManageAssetDispose(req: BaseRequest): Promise<boolean> {
        let DisposeGroupId_ = await this.GetDisposeGroupId(req);
        let details: any[] = req.Data || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                if (!detail.DisposeGroupId) detail.DisposeGroupId = DisposeGroupId_;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                    if (detail.DisposeStatusId === 5) {
                        let AssetUpdate: any = {
                            Data: {
                                Id: detail.AssetId,
                                AssetStatusId: 6,
                            }
                        };
                        let assetBO = BoFactory.GetBo(assetbo.AssetDisposeBo, this.Request);
                        await assetBO.UpdateAssetDispose(AssetUpdate);
                    }
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetAssetDisposeById(req: BaseRequest): Promise<AssetDisposeAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAssetDisposes(apiReq?: ApiRequest<AssetDisposeFilters>): Promise<ApiResponse<AssetDisposeAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('DisposeType'));
        include.push(this.GetReference('DisposeStatus'));
        include.push(this.GetReference('DisposeMethod'));
        include.push({ model: this.Models.VendorMaster, attributes: ['VendorName'], required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({ model: this.Models.Asset, required: false });
        // include.push({
        //     model: this.Models.Asset,
        //     include: [
        //         // { model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'Employee', required: false },
        //         this.GetReference('Manufacturer'), this.GetReference('AssetCategory'),
        //         this.GetReference('AssetType')]
        // });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'RequestedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ApprovedUser', required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AssetDisposeFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AssetDisposeFilters.DisposeGroupId:
                        where['DisposeGroupId'] = param.Value;
                        break;
                    case AssetDisposeFilters.DisposeStatusId:
                        where['DisposeStatusId'] = param.Value;
                        break;
                    case AssetDisposeFilters.AssetName:
                        where['$or'] = { 'AssetName': { '$like': '%' + (param.Value || '') + '%' } };
                        break;
                    case AssetDisposeFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case AssetDisposeFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case AssetDisposeFilters.From:
                        where['RequestedDate'] = where['RequestedDate'] || {};
                        (where['RequestedDate'] as any)['$gte'] = param.Value;
                        break;
                    case AssetDisposeFilters.To:
                        where['RequestedDate'] = where['RequestedDate'] || {};
                        (where['RequestedDate'] as any)['$lte'] = param.Value;
                        break;
                    case AssetDisposeFilters.AssetTypeId:
                        where['AssetTypeId'] = param.Value;
                        break;
                    case AssetDisposeFilters.DisposeTypeValue:
                        where['DisposeTypeValue'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteAssetDispose(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetAssetInfoDashBoard(req: BaseRequest): Promise<any> {
        let AssetDisposeCount: number = 0;

        AssetDisposeCount = await this.Items.count({
            where: {
                'Status': 1,
                'FacilityId': req.Data.FacilityId,
                'DisposeStatusId': 3
                // 'AssetTypeId': req.Data.AssetTypeId,
            }
        });
        return {
            'AssetDisposeCount': AssetDisposeCount,

        };
    }


    public GetModel(): SStatic.Model<AssetDisposeInstance, AssetDisposeAttributes> {
        return this.Models.AssetDispose;
    }

}
