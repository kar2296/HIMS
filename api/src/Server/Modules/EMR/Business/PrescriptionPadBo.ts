import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PrescriptionPadInstance, PrescriptionPadAttributes } from '../Model/Interface/Index';
import { PrescriptionPadFilters } from '../Common/Filters.e';
import { readFileSync,writeFileSync } from 'fs';
import { AppConfig } from '../../../../config/index';

export class PrescriptionPadBo extends BaseBo<PrescriptionPadInstance, PrescriptionPadAttributes>  {
    public async AddPrescriptionPad(req: BaseRequest): Promise<number> {
        if (req.Data.prescData && req.Data.prescData !== '') {
            let datetimestamp = Date.now();
            let signFilePath = AppConfig.UploadFilePath + '/' + req.Data.Name + '-sign-' + datetimestamp + '.png';
            await writeFileSync(signFilePath, new Buffer(req.Data.prescData, 'base64'));
            req.Data.PrescriptionSheet = signFilePath;
        }
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePrescriptionPad(req: BaseRequest): Promise<boolean> {
        if (req.Data.prescData && req.Data.prescData !== '') {
            let datetimestamp = Date.now();
            let signFilePath = AppConfig.UploadFilePath + '/' + req.Data.Name + '-sign-' + datetimestamp + '.png';
            await writeFileSync(signFilePath, new Buffer(req.Data.prescData, 'base64'));
            req.Data.PrescriptionSheet = signFilePath;
        }
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPrescriptionPadInfo(req: BaseRequest): Promise<any> {
        let result = await readFileSync(req.Data.PrescriptionSheet);
        return new Buffer(result).toString('base64');
    }

    public async GetPrescriptionPadById(req: BaseRequest): Promise<PrescriptionPadAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPrescriptionPads(apiReq?: ApiRequest<PrescriptionPadFilters>): Promise<ApiResponse<PrescriptionPadAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('PrescriptionType'));
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case PrescriptionPadFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case PrescriptionPadFilters.PatientId:
                    where['PatientId'] = param.Value;
                    break;
                case PrescriptionPadFilters.EncounterId:
                    where['EncounterId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePrescriptionPad(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PrescriptionPadInstance, PrescriptionPadAttributes> {
        return this.Models.PrescriptionPad;
    }

}
