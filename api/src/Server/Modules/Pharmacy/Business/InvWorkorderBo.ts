import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { InvWorkorderInstance, InvWorkorderAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Pharmacy/Business/Index';
import { InvWorkorderFilters, InvWorkorderDetailFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import { join } from 'path';
import * as userbo from '../../SystemSettings/Business/Index';

export class InvWorkorderBo extends BaseBo<InvWorkorderInstance, InvWorkorderAttributes>  {
    public async AddInvWorkorder(req: BaseRequest): Promise<number> {
        let generateWorkorderno = 0;
        if (!req.Data.Header.InvWorkorderNo &&
            (req.Data.Header.InvWorkorderStatusId === 2 || req.Data.Header.InvWorkorderStatusId === 3)) {
            req.Data.InvWorkorderNo = null;
            generateWorkorderno = 1;
        }
        let result = await this.Save(req.Data.Header);
        let invworkorderid = result.dataValues.Id;
        if (generateWorkorderno === 1) {
            this.deferSequenceKey(invworkorderid, 'InvWorkorderNo',
                this.getSequenceIdentifier(SequenceKeys.InvWorkorderId));
        }
        let detailBO = BoFactory.GetBo(bo.InvWorkorderDetailBo, this.Request);
        // let invworkorderid = result.dataValues.Id;
        await detailBO.ManageInvWorkorderDetails(invworkorderid, req.Data.Details);
        return invworkorderid;
    }

    public async UpdateInvWorkorder(req: BaseRequest): Promise<boolean> {
        let invworkorderid = req.Data.Header.Id;
        let result = await this.Update(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.InvWorkorderDetailBo, this.Request);
        await detailBO.ManageInvWorkorderDetails(invworkorderid, req.Data.Details);
        return result;
    }
    public async GetInvWorkorderById(req: BaseRequest): Promise<InvWorkorderAttributes> {
        let include: Array<IncludeOptions> = [];

        include.push({
            model: this.Models.StoreMaster, as: 'StoreMaster', required: false,
        });
        let result = await this.GetById(req.Id, { include: include });

        return this.GetAttribute(result);
    }

    public async GetInvWorkorders(apiReq?: ApiRequest<InvWorkorderFilters>): Promise<ApiResponse<InvWorkorderAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('InvWorkorderType'));
        include.push(this.GetReference('InvWorkorderStatus'));
        include.push({ model: this.Models.Facility, required: false });
        include.push({ model: this.Models.Department, required: false });
        include.push({ model: this.Models.VendorMaster, required: false });
        include.push({ model: this.Models.StoreMaster, as: 'StoreMaster', required: false });

        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ApprovedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'AuthorizedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'RaisedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case InvWorkorderFilters.Id:
                        where['InvWorkorderId'] = param.Value;
                        break;
                    case InvWorkorderFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case InvWorkorderFilters.InvWorkorderDate:
                        where['InvWorkorderDate'] = { '$between': param.Value };
                        break;
                    case InvWorkorderFilters.From:
                        where['InvWorkorderDate'] = where['InvWorkorderDate'] || {};
                        (where['InvWorkorderDate'] as any)['$gte'] = param.Value;
                        break;
                    case InvWorkorderFilters.To:
                        where['InvWorkorderDate'] = where['InvWorkorderDate'] || {};
                        (where['InvWorkorderDate'] as any)['$lte'] = param.Value;
                        break;
                    case InvWorkorderFilters.InvWorkorderTypeId:
                        where['InvWorkorderTypeId'] = param.Value;
                        break;
                    case InvWorkorderFilters.InvWorkorderStatusId:
                        where['InvWorkorderStatusId'] = param.Value;
                        break;
                    case InvWorkorderFilters.InvWorkorderNumber:
                        where['InvWorkorderNo'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case InvWorkorderFilters.VendorMasterId:
                        where['VendorMasterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async PrintInvWorkOrder(req: BaseRequest): Promise<FileInfo> {

        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: InvWorkorderFilters.Id, Value: req.Id }]
        };
        let data = await this.GetInvWorkorders(apiReq);
        // let Data = data.Data[0];
        let Invworkorder = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: InvWorkorderDetailFilters.InvWorkorderId, Value: Invworkorder.Id }]
        };
        let InvWorkorderDetailBo = BoFactory.GetBo(bo.InvWorkorderDetailBo, this.Request);
        let InvworkorderData: any = await InvWorkorderDetailBo.GetInvWorkorderDetails(Req);
        // let InvworkorderDetails: any = [];
        // InvworkorderData.Data.forEach((Detail: any) => {
        //     InvworkorderDetails.push(InvworkorderDetails);
        // });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Invworkorder.FacilityId);
        let info = {
            Invworkorder: Invworkorder,
            InvworkorderDetails: InvworkorderData.Data,
            Preferences: printPreferencesData,
        };
        let pdfOption: any = null;
        let key = 'invworkorder';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
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
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintwithoutInvWorkOrder(req: BaseRequest): Promise<FileInfo> {

        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: InvWorkorderFilters.Id, Value: req.Id }]
        };
        let data = await this.GetInvWorkorders(apiReq);
        // let Data = data.Data[0];
        let Invworkorder = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: InvWorkorderDetailFilters.InvWorkorderId, Value: Invworkorder.Id }]
        };
        let InvWorkorderDetailBo = BoFactory.GetBo(bo.InvWorkorderDetailBo, this.Request);
        let InvworkorderData: any = await InvWorkorderDetailBo.GetInvWorkorderDetails(Req);
        // let InvworkorderDetails: any = [];
        // InvworkorderData.Data.forEach((Detail: any) => {
        //     InvworkorderDetails.push(InvworkorderDetails);
        // });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Invworkorder.FacilityId);
        let info = {
            Invworkorder: Invworkorder,
            InvworkorderDetails: InvworkorderData.Data,
            Preferences: printPreferencesData,
        };
        let pdfOption: any = null;
        let key = 'invworkorderwithoutheader';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
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
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async DeleteInvWorkorder(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<InvWorkorderInstance, InvWorkorderAttributes> {
        return this.Models.InvWorkorder;
    }

}
