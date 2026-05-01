import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PhysiotheraphyTreatementInstance, PhysiotheraphyTreatementAttributes } from '../Model/Interface/Index';
import { PhysiotheraphyTreatementFilters } from '../Common/Filters.e';

export class PhysiotheraphyTreatementBo extends BaseBo<PhysiotheraphyTreatementInstance, PhysiotheraphyTreatementAttributes>  {
    public async AddPhysiotheraphyTreatement(req: BaseRequest): Promise<number> {
        // let file = this.Request.file;
        // if (file) {
        //     req.Data.FilePath = file.path;
        // }
        // //Handling for json 'null' value while save user with file upload
        // for (var idx in req.Data) {
        //     var strValue = req.Data[idx];
        //     if (strValue === 'null') {
        //         req.Data[idx] = null;
        //     }
        // }
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePhysiotheraphyTreatement(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPhysiotheraphyTreatementById(req: BaseRequest): Promise<PhysiotheraphyTreatementAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPhysiotheraphyTreatements(apiReq?: ApiRequest<PhysiotheraphyTreatementFilters>):
        Promise<ApiResponse<PhysiotheraphyTreatementAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('PhysiotheraphyStatus'));
        include.push({ model: this.Models.TreatementModality, required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case PhysiotheraphyTreatementFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case PhysiotheraphyTreatementFilters.PhysiotherapistName:
                    where['PhysiotherapistName'] = param.Value;
                    break;
                case PhysiotheraphyTreatementFilters.PatientId:
                    where['PatientId'] = param.Value;
                    break;
                case PhysiotheraphyTreatementFilters.EncounterId:
                    where['EncounterId'] = param.Value;
                    break;
                case PhysiotheraphyTreatementFilters.PhysiotheraphyStatusId:
                    where['PhysiotheraphyStatusId'] = param.Value;
                    break;
                case PhysiotheraphyTreatementFilters.PhysiotheraphyDate:
                    where['PhysiotheraphyDate'] = { '$between': param.Value || '' };
                    break;
                case PhysiotheraphyTreatementFilters.From:
                    where['PhysiotheraphyDate'] = where['PhysiotheraphyDate'] || {};
                    (where['PhysiotheraphyDate'] as any)['$gte'] = param.Value;
                    break;
                case PhysiotheraphyTreatementFilters.To:
                    where['PhysiotheraphyDate'] = where['PhysiotheraphyDate'] || {};
                    (where['PhysiotheraphyDate'] as any)['$lte'] = param.Value;
                    break;
                case PhysiotheraphyTreatementFilters.TreatementModalityId:
                    where['TreatementModalityId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePhysiotheraphyTreatement(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PhysiotheraphyTreatementInstance, PhysiotheraphyTreatementAttributes> {
        return this.Models.PhysiotheraphyTreatement;
    }

    public async GetEMRDashBoardInfo(req: BaseRequest): Promise<any> {
        let DocumentCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterId': req.Data.eid,
                'PatientId': req.Data.pid
            }
        });
        return {
            'DocumentCount': DocumentCount
        };
    }

}
