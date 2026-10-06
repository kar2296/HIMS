import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common';
import { FileIssueInstance, FileIssueAttributes } from '../Model/Interface/Index';
import { FileIssueFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';

export class FileIssueBo extends BaseBo<FileIssueInstance, FileIssueAttributes>  {
    public async AddFileIssue(req: BaseRequest): Promise<number> {
        let generateFileIssue = 0;
        if (!req.Data.IssueIdentifier && req.Data.MRDFileStatusId === 1) {
            req.Data.IssueIdentifier = null;
            generateFileIssue = 1;
            //await Sequence.Next(SequenceKeys.MrdIssueId);
        }
        let result = await this.Save(req.Data);
        let mrdIssueId = result.dataValues.Id;
        if (generateFileIssue === 1) {
            this.deferSequenceKey(mrdIssueId, 'IssueIdentifier',
                this.getSequenceIdentifier(SequenceKeys.MrdIssueId));
        }
        return mrdIssueId;
    }

    public async UpdateFileIssue(req: BaseRequest): Promise<boolean> {
        let generateFileIssue = 0;
        if (!req.Data.IssueIdentifier && req.Data.MRDFileStatusId === 1) {
            req.Data.IssueIdentifier = null;
            generateFileIssue = 1;
            // await Sequence.Next(SequenceKeys.MrdIssueId);
        }
        let result = await this.Update(req.Data);
        if (generateFileIssue === 1) {
            this.deferSequenceKey(req.Data.Id, 'IssueIdentifier',
                this.getSequenceIdentifier(SequenceKeys.MrdIssueId));
        }
        return result;
    }

    public async GetFileIssueById(req: BaseRequest): Promise<FileIssueAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }
    public async GetFileIssues(apiReq?: ApiRequest<FileIssueFilters>):
        Promise<ApiResponse<FileIssueAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'ParentDepartment', required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'SubDepartment', required: false });
        include.push(this.GetReference('PRIORITY'));
        include.push(this.GetReference('MRDFileStatus'));
        // include.push(this.GetReference('MRDLocation'));
        include.push(this.GetReference('EncounterType'));
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case FileIssueFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case FileIssueFilters.RequestIdentifier:
                        (where as any)[Op.or] = [{ RequestIdentifier: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case FileIssueFilters.FromDepartmentId:
                        where['FromDepartmentId'] = param.Value;
                        break;
                    case FileIssueFilters.FromDepartmentId:
                        where['FromDepartmentId'] = param.Value;
                        break;
                    case FileIssueFilters.MRDLocationId:
                        where['ToDepartmentId'] = param.Value;
                        break;
                    case FileIssueFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case FileIssueFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case FileIssueFilters.RequestDate:
                        where['RequestDate'] = { '$between': param.Value || '' };
                        break;
                    case FileIssueFilters.From:
                        where['RequestDate'] = where['RequestDate'] || {};
                        (where['RequestDate'] as any)['$gte'] = param.Value;
                        break;
                    case FileIssueFilters.To:
                        where['RequestDate'] = where['RequestDate'] || {};
                        (where['RequestDate'] as any)['$lte'] = param.Value;
                        break;
                    case FileIssueFilters.PatientNameMRN:
                        (patientWhere as any)[Op.or] = [{ FirstName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { LastName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { MRN: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { Mobile: { [Op.like]: (param.Value || '') } }];
                        isReqPatientSearch = true;
                        break;
                    case FileIssueFilters.MRDFileStatusId:
                        where['MRDFileStatusId'] = param.Value;
                        break;
                    case FileIssueFilters.MRDTypeId:
                        where['MRDTypeId'] = param.Value;
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
        order.push(['RequestDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteFileIssue(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<FileIssueInstance, FileIssueAttributes> {
        return this.Models.FileIssue;
    }

}

