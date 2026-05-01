import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PreOperativeChecklistInstance, PreOperativeChecklistAttributes } from '../Model/Interface/Index';
import * as bo from '../../EMR/Business/Index';
import { readFileSync, writeFileSync } from 'fs';
import { AppConfig } from '../../../../config/index';
import { BoFactory } from '../../Base/Business/Index';
import { PreOperativeChecklistFilters } from '../Common/Filters.e';

export class PreOperativeChecklistBo extends BaseBo<PreOperativeChecklistInstance, PreOperativeChecklistAttributes>  {

    public async AddPreOperativeChecklist(req: BaseRequest): Promise<number> {
        if (req.Data.signdata && req.Data.signdata !== '') {
            let datetimestamp = Date.now();
            let signFilePath = AppConfig.UploadFilePath + '/' + req.Data.Name + '-sign-' + datetimestamp + '.png';
            await writeFileSync(signFilePath, new Buffer(req.Data.signdata, 'base64'));
            req.Data.SignPath = signFilePath;
        }
        let result = await this.Save(req.Data);
        let detailBO = BoFactory.GetBo(bo.PreOperativeChecklistDetailsBo, this.Request);
        let PreOperativeChecklistId = result.dataValues.Id;
        await detailBO.ManagePreOperativeChecklistDetails(PreOperativeChecklistId, req.Data.Details);
        return PreOperativeChecklistId;
    }

    public async UpdatePreOperativeChecklist(req: BaseRequest): Promise<boolean> {
        if (req.Data.signdata && req.Data.signdata !== '') {
            let datetimestamp = Date.now();
            let signFilePath = AppConfig.UploadFilePath + '/' + req.Data.Name + '-sign-' + datetimestamp + '.png';
            await writeFileSync(signFilePath, new Buffer(req.Data.signdata, 'base64'));
            req.Data.SignPath = signFilePath;
        }
        let result = await this.Update(req.Data);
        let detailBO = BoFactory.GetBo(bo.PreOperativeChecklistDetailsBo, this.Request);
        let PreOperativeChecklistId = req.Data.Id;
        await detailBO.ManagePreOperativeChecklistDetails(PreOperativeChecklistId, req.Data.Details);
        return result;
    }
    public async GetFeedbackSignPic(req: BaseRequest): Promise<any> {
        let result = await readFileSync(req.Data.SignPath);
        return new Buffer(result).toString('base64');
    }
    public async GetPreOperativeChecklistById(req: BaseRequest): Promise<PreOperativeChecklistAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPreOperativeChecklists(apiReq?:
        ApiRequest<PreOperativeChecklistFilters>): Promise<ApiResponse<PreOperativeChecklistAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Encounter,
            required: true,
            include: [
                { model: this.Models.WardMaster, required: false },
                { model: this.Models.WardRoomMaster, required: false },
                { model: this.Models.WardRoomBedMaster, required: false }
            ]
        });
        include.push({
            model: this.Models.PreOperativeChecklistDetails, required: false,
        });
        include.push(this.GetReference('CheckListType'));
        include.push(this.GetReference('PreOperativeChecklistStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PreOperativeChecklistFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PreOperativeChecklistFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PreOperativeChecklistFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeletePreOperativeChecklist(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PreOperativeChecklistInstance, PreOperativeChecklistAttributes> {
        return this.Models.PreOperativeChecklist;
    }

}
