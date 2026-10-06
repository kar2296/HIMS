import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { DepartmentInstance, DepartmentAttributes } from '../Model/Interface/Index';
import { DepartmentFilters } from '../Common/Filters.e';
import { readFileSync } from 'fs';
// import { BoFactory } from '../../Base/Business/Index';
// import * as appMgrBO from '../../SystemSettings/Business/Index';
import { join } from 'path';


export class DepartmentBo extends BaseBo<DepartmentInstance, DepartmentAttributes> implements IOptionProvider {
    private SanitizeDepartmentData(data: any): void {
        if (!data) return;
        if (!data.ParentDepartmentId || data.ParentDepartmentId === '0' || data.ParentDepartmentId === '') {
            data.ParentDepartmentId = null;
        }
        if (!data.SpecialityId || data.SpecialityId === '0' || data.SpecialityId === '') {
            data.SpecialityId = null;
        }
        if (!data.CostCenterId || data.CostCenterId === '0' || data.CostCenterId === '') {
            data.CostCenterId = null;
        }
        if (!data.GenderId || data.GenderId === '0' || data.GenderId === '') {
            data.GenderId = null;
        }
        if (data.DisplayOrder === '' || data.DisplayOrder === undefined || data.DisplayOrder === null || isNaN(Number(data.DisplayOrder))) {
            data.DisplayOrder = null;
        } else {
            data.DisplayOrder = Number(data.DisplayOrder);
        }
        if (data.ThresholdDuration === '' || data.ThresholdDuration === undefined || data.ThresholdDuration === null || isNaN(Number(data.ThresholdDuration))) {
            data.ThresholdDuration = null;
        } else {
            data.ThresholdDuration = Number(data.ThresholdDuration);
        }
        if (data.FollowupDays === '' || data.FollowupDays === undefined || data.FollowupDays === null || isNaN(Number(data.FollowupDays))) {
            data.FollowupDays = null;
        } else {
            data.FollowupDays = Number(data.FollowupDays);
        }
        if (!data.NightStartTime || data.NightStartTime === '') {
            data.NightStartTime = null;
        }
        if (!data.NightEndTime || data.NightEndTime === '') {
            data.NightEndTime = null;
        }
        if (!data.ActiveTo || data.ActiveTo === '') {
            data.ActiveTo = null;
        }
        data.IsEmergency = data.IsEmergency ? 1 : 0;
        data.IsAdmittingDept = data.IsAdmittingDept ? 1 : 0;
        data.IncludeMRDRequired = data.IncludeMRDRequired ? 1 : 0;
        data.IsPatientFlowMandatory = data.IsPatientFlowMandatory ? 1 : 0;
        data.IsProcessingCenter = data.IsProcessingCenter ? 1 : 0;
        data.IsIPClearence = data.IsIPClearence ? 1 : 0;
        data.IsParentDepartment = data.IsParentDepartment ? 1 : 0;
        data.IsVirtual = data.IsVirtual ? 1 : 0;
        data.IsDiet = data.IsDiet ? 1 : 0;
        data.IsBloodBank = data.IsBloodBank ? 1 : 0;
        data.IsMRDLocation = data.IsMRDLocation ? 1 : 0;
        data.IsAssetDept = data.IsAssetDept ? 1 : 0;
        data.IsPatientPortal = data.IsPatientPortal ? 1 : 0;
        data.IsAllFacility = data.IsAllFacility ? 1 : 0;
        data.IsActive = (data.IsActive === false || data.IsActive === 0) ? 0 : 1;
        data.Rev = data.Rev ? Number(data.Rev) : 0;
        data.Status = 1;
    }

    public async AddDepartment(req: BaseRequest): Promise<number> {
        let file = this.Request.file;
        if (file) {
            req.Data.LogoPath = file.path;
        }
        this.HandleNullDataViaFileUpload(req.Data);
        this.HandleActiveState(req.Data);
        this.SanitizeDepartmentData(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateDepartment(req: BaseRequest): Promise<boolean> {
        let file = this.Request.file;
        if (file) {
            req.Data.LogoPath = file.path;
        }
        this.HandleNullDataViaFileUpload(req.Data);
        this.HandleActiveState(req.Data);
        this.SanitizeDepartmentData(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetDepartmentLogo(req: BaseRequest): Promise<any> {
        let fileBuff = await readFileSync(req.Data.LogoPath);
        let logoBase64 = new Buffer(fileBuff).toString('base64');
        return { Id: req.Data.Id, Logo: logoBase64 };
    }

    public async GetDepartmentById(req: BaseRequest): Promise<DepartmentAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetDepartments(apiReq?: ApiRequest<DepartmentFilters>): Promise<ApiResponse<DepartmentAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('DepartmentType'));
        include.push(this.GetReference('CostCenter'));
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.Department, as: 'ParentDepartment', required: false });
        include.push({ model: this.Models.Facility, as: 'Facility', required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case DepartmentFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case DepartmentFilters.Name:
                        (where as any)['$or'] = [{ 'DepartmentName': { '$like': (param.Value || '') + '%' } },
                        { 'DepartmentCode': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case DepartmentFilters.DepartmentType:
                        where['DepartmentTypeId'] = param.Value;
                        break;
                    case DepartmentFilters.IsParent:
                        where['IsParentDepartment'] = param.Value;
                        break;
                    case DepartmentFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case DepartmentFilters.ParentDepartmentId:
                        where['ParentDepartmentId'] = param.Value;
                        break;
                    case DepartmentFilters.IsMRDLocation:
                        where['IsMRDLocation'] = param.Value;
                        break;
                    case DepartmentFilters.IsAssetDept:
                        where['IsAssetDept'] = param.Value;
                        break;
                    case DepartmentFilters.IsAdmittingDept:
                        where['IsAdmittingDept'] = param.Value;
                        break;
                    case DepartmentFilters.IsPatientPortal:
                        where['IsPatientPortal'] = param.Value;
                        break;
                    case DepartmentFilters.IsBloodBank:
                        where['IsBloodBank'] = param.Value;
                        break;
                    case DepartmentFilters.IsEmergency:
                        where['IsEmergency'] = param.Value;
                        break;
                    case DepartmentFilters.IsDiet:
                        where['IsDiet'] = param.Value;
                        break;
                    case DepartmentFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case DepartmentFilters.IsIPClearence:
                        where['IsIPClearence'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteDepartment(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<DepartmentInstance, DepartmentAttributes> {
        return this.Models.Department;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<DepartmentFilters>): Promise<any> {
        apiReq.Params = apiReq.Params || [];
        if (key === 'AssetDepartment') {
            apiReq.Params.push({ Key: DepartmentFilters.IsAssetDept, Value: true },
                { Key: DepartmentFilters.ActiveStatus, Value: 2 });
        }
        if (key === 'MRDDepartment') {
            apiReq.Params.push({ Key: DepartmentFilters.IsMRDLocation, Value: true },
                { Key: DepartmentFilters.ActiveStatus, Value: 2 });
        }
        if (key === 'BloodBankDepartment') {
            apiReq.Params.push({ Key: DepartmentFilters.IsBloodBank, Value: true },
                { Key: DepartmentFilters.ActiveStatus, Value: 2 });
        }
        apiReq.Attributes = apiReq.Attributes || ['Id', ['DepartmentName', 'Text'], 'DepartmentCode', 'DepartmentName',
            'IsParentDepartment', 'GenderId', 'IsAdmittingDept'];
        let val = await this.GetDepartments(apiReq);
        return { [key]: val.Data };
    }
    public async PrintDepartmentListReport(apiReq?: ApiRequest<DepartmentFilters>): Promise<any> {
        let data = await this.GetDepartments(apiReq);
        let Department = data.Data;
        let FacilityName = apiReq.Data.FacilityName;
        let Type = apiReq.Data.Type;
        let ActiveStatus = apiReq.Data.ActiveStatus;
        // let DepartmentData = data.Data[0];
        // let facilityPreferenceBO = BoFactory.GetBo(appMgrBO.FacilityPreferenceBo, this.Request);
        // let printPreferencesData =
        //     await facilityPreferenceBO.GetFacilityPreferenceWithLogo(DepartmentData.FacilityId);
        let info = {
            Department: Department,
            // Preferences: printPreferencesData,
            FacilityName: FacilityName,
            Type: Type,
            ActiveStatus: ActiveStatus
        };
        let pdfOption: any = null;
        let key = 'departmentlistreport';
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
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
}
