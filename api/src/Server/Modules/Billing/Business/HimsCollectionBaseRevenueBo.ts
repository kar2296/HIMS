import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { CollectionBaseRevenueInstance, CollectionBaseRevenueAttributes } from '../Model/Interface/Index';
import { CollectionBaseRevenueFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as appbo from '../../SystemSettings/Business/Index';
import { join } from 'path';
// import * as BillingBo from './Index';

export class CollectionBaseRevenueBo extends BaseBo<CollectionBaseRevenueInstance, CollectionBaseRevenueAttributes> {
    public async AddCollectionBaseRevenue(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateCollectionBaseRevenue(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetCollectionBaseRevenueById(req: BaseRequest): Promise<CollectionBaseRevenueAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetCollectionBaseRevenues(apiReq?: ApiRequest<CollectionBaseRevenueFilters>):
        Promise<ApiResponse<CollectionBaseRevenueAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({
            model: this.Models.Department, attributes: ['DepartmentName'], required: false,
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'Qualification',
                'LicenseNo'], as: 'Doctor', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case CollectionBaseRevenueFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case CollectionBaseRevenueFilters.FromDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case CollectionBaseRevenueFilters.ToDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case CollectionBaseRevenueFilters.PatientBillStatus:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case CollectionBaseRevenueFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case CollectionBaseRevenueFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case CollectionBaseRevenueFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case CollectionBaseRevenueFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteCollectionBaseRevenue(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async GetRevenueDoctorSummary(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 1, Value: await this.OPDoctorRevenue(req) });
        result.push({ Key: 2, Value: await this.IPDoctorRevenue(req) });
        result.push({ Key: 3, Value: await this.DirectDoctorRevenue(req) });
        result.push({ Key: 4, Value: await this.ProviderShareDoctorRevenue(req) });
        result.push({ Key: 5, Value: await this.GrossDoctorShareDoctorRevenue(req) });
        result.push({ Key: 6, Value: await this.TDSShareDoctorRevenue(req) });
        result.push({ Key: 7, Value: await this.NetDoctorShareDoctorRevenue(req) });
        return result;
    }


    public async OPDoctorRevenue(req: BaseRequest): Promise<any> {
        let DoctorGroup: { [id: number]: any[] } = {};
        let DoctorGroupJoin: any = {
            model: this.Models.User, as: 'Doctor',
            attributes: ['FirstName', 'LastName'],
            where: {
                UserTypeId: 2,
            },
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        if (req.Data.DoctorId > 0) {
            let doctbillamountInstance: any = await this.FindAll({
                attributes: ['BillAmount', 'BillDiscount', 'BillNetAmount', 'GrossDoctorShare', 'TDSAmount',
                    'NetDoctorShare', 'ProviderShare', 'DoctorId'],
                where: {
                    EncounterTypeId: { '$in': [1, 4] },
                    DoctorId: { '$eq': req.Data.DoctorId },
                    BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                },
                include: [DoctorGroupJoin]
            });
            if (doctbillamountInstance) {
                for (let i = 0; i < doctbillamountInstance.length; i++) {
                    let bills: any = this.GetAttribute(doctbillamountInstance[i]);
                    let DoctorId = bills.DoctorId;
                    let BillAmount = bills.BillAmount;
                    let BillDiscount = bills.BillDiscount;
                    let NetAmount = bills.BillNetAmount;
                    DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
                    let info = {
                        'BillAmount': BillAmount,
                        'BillDiscount': BillDiscount,
                        'NetAmount': NetAmount,
                        'DoctorId': DoctorId,
                        'DoctorName': bills.Doctor
                    };
                    DoctorGroup[DoctorId].push(info);
                }
            }
        } else if (req.Data.DoctorId === 0) {
            let doctbillamountInstance: any = await this.FindAll({
                attributes: ['BillAmount', 'BillDiscount', 'BillNetAmount', 'GrossDoctorShare', 'TDSAmount',
                    'NetDoctorShare', 'ProviderShare', 'DoctorId'],
                where: {
                    EncounterTypeId: { '$in': [1, 4] },
                    DoctorId: { '$gt': 0 },
                    BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                },
                include: [DoctorGroupJoin]
            });
            if (doctbillamountInstance) {
                for (let i = 0; i < doctbillamountInstance.length; i++) {
                    let bills: any = this.GetAttribute(doctbillamountInstance[i]);
                    let DoctorId = bills.DoctorId;
                    let BillAmount = bills.BillAmount;
                    let BillDiscount = bills.BillDiscount;
                    let NetAmount = bills.BillNetAmount;
                    DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
                    let info = {
                        'BillAmount': BillAmount,
                        'BillDiscount': BillDiscount,
                        'NetAmount': NetAmount,
                        'DoctorId': DoctorId,
                        'DoctorName': bills.Doctor
                    };
                    DoctorGroup[DoctorId].push(info);
                }
            }
        }

        return DoctorGroup;
    }
    public async DirectDoctorRevenue(req: BaseRequest): Promise<any> {
        let DoctorGroup: { [id: number]: any[] } = {};
        let doctbillamountInstance: any = await this.FindAll({
            attributes: ['BillAmount', 'BillDiscount', 'BillNetAmount', 'GrossDoctorShare', 'TDSAmount',
                'NetDoctorShare', 'ProviderShare', 'DoctorId'],
            where: {
                EncounterTypeId: { '$in': [1, 4] },
                DoctorId: { '$eq': -1 },
                BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                PatientBillStatusId: 3,
            }
        });
        if (doctbillamountInstance) {
            for (let i = 0; i < doctbillamountInstance.length; i++) {
                let bills: any = this.GetAttribute(doctbillamountInstance[i]);
                let DoctorId = bills.DoctorId;
                let DocName = 'Others';
                let BillAmount = bills.BillAmount;
                let BillDiscount = bills.BillDiscount;
                let NetAmount = bills.BillNetAmount;
                DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
                let info = {
                    'BillAmount': BillAmount,
                    'BillDiscount': BillDiscount,
                    'NetAmount': NetAmount,
                    'DoctorId': DoctorId,
                    'DoctorName': DocName
                };
                DoctorGroup[DoctorId].push(info);
            }
        }

        return DoctorGroup;
    }
    public async IPDoctorRevenue(req: BaseRequest): Promise<any> {
        let DoctorGroup: { [id: number]: any[] } = {};
        let DoctorGroupJoin: any = {
            model: this.Models.User, as: 'Doctor',
            attributes: ['FirstName', 'LastName'],
            where: {
                UserTypeId: 2,
            },
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        if (req.Data.DoctorId > 0) {
            let doctbillamountInstance: any = await this.FindAll({
                attributes: ['BillAmount', 'BillDiscount', 'BillNetAmount', 'GrossDoctorShare', 'TDSAmount',
                    'NetDoctorShare', 'ProviderShare', 'DoctorId'],
                where: {
                    EncounterTypeId: 2,
                    DoctorId: { '$eq': req.Data.DoctorId },
                    BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                },
                include: [DoctorGroupJoin]
            });
            if (doctbillamountInstance) {
                for (let i = 0; i < doctbillamountInstance.length; i++) {
                    let bills: any = this.GetAttribute(doctbillamountInstance[i]);
                    let DoctorId = bills.DoctorId;
                    let BillAmount = bills.BillAmount;
                    let BillDiscount = bills.BillDiscount;
                    let NetAmount = bills.BillNetAmount;
                    DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
                    let info = {
                        'BillAmount': BillAmount,
                        'BillDiscount': BillDiscount,
                        'NetAmount': NetAmount,
                        'DoctorId': DoctorId,
                        'DoctorName': bills.Doctor
                    };
                    DoctorGroup[DoctorId].push(info);
                }
            }
        } else if (req.Data.DoctorId === 0) {
            let doctbillamountInstance: any = await this.FindAll({
                attributes: ['BillAmount', 'BillDiscount', 'BillNetAmount', 'GrossDoctorShare', 'TDSAmount',
                    'NetDoctorShare', 'ProviderShare', 'DoctorId'],
                where: {
                    EncounterTypeId: 2,
                    DoctorId: { '$gt': 0 },
                    BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                },
                include: [DoctorGroupJoin]
            });
            if (doctbillamountInstance) {
                for (let i = 0; i < doctbillamountInstance.length; i++) {
                    let bills: any = this.GetAttribute(doctbillamountInstance[i]);
                    let DoctorId = bills.DoctorId;
                    let BillAmount = bills.BillAmount;
                    let BillDiscount = bills.BillDiscount;
                    let NetAmount = bills.BillNetAmount;
                    DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
                    let info = {
                        'BillAmount': BillAmount,
                        'BillDiscount': BillDiscount,
                        'NetAmount': NetAmount,
                        'DoctorId': DoctorId,
                        'DoctorName': bills.Doctor
                    };
                    DoctorGroup[DoctorId].push(info);
                }
            }
        }

        return DoctorGroup;
    }
    public async ProviderShareDoctorRevenue(req: BaseRequest): Promise<any> {
        let DoctorGroup: { [id: number]: any[] } = {};
        let DoctorGroupJoin: any = {
            model: this.Models.User, as: 'Doctor',
            attributes: ['FirstName', 'LastName'],
            where: {
                UserTypeId: 2,
            },
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        if (req.Data.DoctorId > 0) {
            let doctbillamountInstance: any = await this.FindAll({
                attributes: ['BillAmount', 'BillDiscount', 'BillNetAmount', 'GrossDoctorShare', 'TDSAmount',
                    'NetDoctorShare', 'ProviderShare', 'DoctorId'],
                where: {
                    // EncounterTypeId: 2,
                    DoctorId: { '$eq': req.Data.DoctorId },
                    BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                },
                include: [DoctorGroupJoin]
            });
            if (doctbillamountInstance) {
                for (let i = 0; i < doctbillamountInstance.length; i++) {
                    let bills: any = this.GetAttribute(doctbillamountInstance[i]);
                    let DoctorId = bills.DoctorId;
                    let ProviderShare = bills.ProviderShare;
                    DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
                    let info = {
                        'ProviderShare': ProviderShare,
                        'DoctorId': DoctorId,
                        'DoctorName': bills.Doctor
                    };
                    DoctorGroup[DoctorId].push(info);
                }
            }
        } else if (req.Data.DoctorId === 0) {
            let doctbillamountInstance: any = await this.FindAll({
                attributes: ['BillAmount', 'BillDiscount', 'BillNetAmount', 'GrossDoctorShare', 'TDSAmount',
                    'NetDoctorShare', 'ProviderShare', 'DoctorId'],
                where: {
                    // EncounterTypeId: 2,
                    DoctorId: { '$gt': 0 },
                    BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                },
                include: [DoctorGroupJoin]
            });
            if (doctbillamountInstance) {
                for (let i = 0; i < doctbillamountInstance.length; i++) {
                    let bills: any = this.GetAttribute(doctbillamountInstance[i]);
                    let DoctorId = bills.DoctorId;
                    let ProviderShare = bills.ProviderShare;
                    DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
                    let info = {
                        'ProviderShare': ProviderShare,
                        'DoctorId': DoctorId,
                        'DoctorName': bills.Doctor
                    };
                    DoctorGroup[DoctorId].push(info);
                }
            }
        }

        return DoctorGroup;
    }
    public async GrossDoctorShareDoctorRevenue(req: BaseRequest): Promise<any> {
        let DoctorGroup: { [id: number]: any[] } = {};
        let DoctorGroupJoin: any = {
            model: this.Models.User, as: 'Doctor',
            attributes: ['FirstName', 'LastName'],
            where: {
                UserTypeId: 2,
            },
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        if (req.Data.DoctorId > 0) {
            let doctbillamountInstance: any = await this.FindAll({
                attributes: ['BillAmount', 'BillDiscount', 'BillNetAmount', 'GrossDoctorShare', 'TDSAmount',
                    'NetDoctorShare', 'ProviderShare', 'DoctorId'],
                where: {
                    // EncounterTypeId: 2,
                    DoctorId: { '$eq': req.Data.DoctorId },
                    BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                },
                include: [DoctorGroupJoin]
            });
            if (doctbillamountInstance) {
                for (let i = 0; i < doctbillamountInstance.length; i++) {
                    let bills: any = this.GetAttribute(doctbillamountInstance[i]);
                    let DoctorId = bills.DoctorId;
                    let GrossDoctorShare = bills.GrossDoctorShare;
                    DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
                    let info = {
                        'GrossDoctorShare': GrossDoctorShare,
                        'DoctorId': DoctorId,
                        'DoctorName': bills.Doctor
                    };
                    DoctorGroup[DoctorId].push(info);
                }
            }
        } else if (req.Data.DoctorId === 0) {
            let doctbillamountInstance: any = await this.FindAll({
                attributes: ['BillAmount', 'BillDiscount', 'BillNetAmount', 'GrossDoctorShare', 'TDSAmount',
                    'NetDoctorShare', 'ProviderShare', 'DoctorId'],
                where: {
                    // EncounterTypeId: 2,
                    DoctorId: { '$gt': 0 },
                    BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                },
                include: [DoctorGroupJoin]
            });
            if (doctbillamountInstance) {
                for (let i = 0; i < doctbillamountInstance.length; i++) {
                    let bills: any = this.GetAttribute(doctbillamountInstance[i]);
                    let DoctorId = bills.DoctorId;
                    let GrossDoctorShare = bills.GrossDoctorShare;
                    DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
                    let info = {
                        'GrossDoctorShare': GrossDoctorShare,
                        'DoctorId': DoctorId,
                        'DoctorName': bills.Doctor
                    };
                    DoctorGroup[DoctorId].push(info);
                }
            }
        }

        return DoctorGroup;
    }
    public async TDSShareDoctorRevenue(req: BaseRequest): Promise<any> {
        let DoctorGroup: { [id: number]: any[] } = {};
        let DoctorGroupJoin: any = {
            model: this.Models.User, as: 'Doctor',
            attributes: ['FirstName', 'LastName'],
            where: {
                UserTypeId: 2,
            },
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        if (req.Data.DoctorId > 0) {
            let doctbillamountInstance: any = await this.FindAll({
                attributes: ['BillAmount', 'BillDiscount', 'BillNetAmount', 'GrossDoctorShare', 'TDSAmount',
                    'NetDoctorShare', 'ProviderShare', 'DoctorId'],
                where: {
                    // EncounterTypeId: 2,
                    DoctorId: { '$eq': req.Data.DoctorId },
                    BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                },
                include: [DoctorGroupJoin]
            });
            if (doctbillamountInstance) {
                for (let i = 0; i < doctbillamountInstance.length; i++) {
                    let bills: any = this.GetAttribute(doctbillamountInstance[i]);
                    let DoctorId = bills.DoctorId;
                    let TDSAmount = bills.TDSAmount;
                    DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
                    let info = {
                        'TDSAmount': TDSAmount,
                        'DoctorId': DoctorId,
                        'DoctorName': bills.Doctor
                    };
                    DoctorGroup[DoctorId].push(info);
                }
            }
        } else if (req.Data.DoctorId === 0) {
            let doctbillamountInstance: any = await this.FindAll({
                attributes: ['BillAmount', 'BillDiscount', 'BillNetAmount', 'GrossDoctorShare', 'TDSAmount',
                    'NetDoctorShare', 'ProviderShare', 'DoctorId'],
                where: {
                    // EncounterTypeId: 2,
                    DoctorId: { '$gt': 0 },
                    BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                },
                include: [DoctorGroupJoin]
            });
            if (doctbillamountInstance) {
                for (let i = 0; i < doctbillamountInstance.length; i++) {
                    let bills: any = this.GetAttribute(doctbillamountInstance[i]);
                    let DoctorId = bills.DoctorId;
                    let TDSAmount = bills.TDSAmount;
                    DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
                    let info = {
                        'TDSAmount': TDSAmount,
                        'DoctorId': DoctorId,
                        'DoctorName': bills.Doctor
                    };
                    DoctorGroup[DoctorId].push(info);
                }
            }
        }

        return DoctorGroup;
    }
    public async NetDoctorShareDoctorRevenue(req: BaseRequest): Promise<any> {
        let DoctorGroup: { [id: number]: any[] } = {};
        let DoctorGroupJoin: any = {
            model: this.Models.User, as: 'Doctor',
            attributes: ['FirstName', 'LastName'],
            where: {
                UserTypeId: 2,
            },
            required: true,
            include: [
                this.GetReference('Title')
            ]
        };
        if (req.Data.DoctorId > 0) {
            let doctbillamountInstance: any = await this.FindAll({
                attributes: ['BillAmount', 'BillDiscount', 'BillNetAmount', 'GrossDoctorShare', 'TDSAmount',
                    'NetDoctorShare', 'ProviderShare', 'DoctorId'],
                where: {
                    // EncounterTypeId: 2,
                    DoctorId: { '$eq': req.Data.DoctorId },
                    BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                },
                include: [DoctorGroupJoin]
            });
            if (doctbillamountInstance) {
                for (let i = 0; i < doctbillamountInstance.length; i++) {
                    let bills: any = this.GetAttribute(doctbillamountInstance[i]);
                    let DoctorId = bills.DoctorId;
                    let NetDoctorShare = bills.NetDoctorShare;
                    DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
                    let info = {
                        'NetDoctorShare': NetDoctorShare,
                        'DoctorId': DoctorId,
                        'DoctorName': bills.Doctor
                    };
                    DoctorGroup[DoctorId].push(info);
                }
            }
        } else if (req.Data.DoctorId === 0) {
            let doctbillamountInstance: any = await this.FindAll({
                attributes: ['BillAmount', 'BillDiscount', 'BillNetAmount', 'GrossDoctorShare', 'TDSAmount',
                    'NetDoctorShare', 'ProviderShare', 'DoctorId'],
                where: {
                    // EncounterTypeId: 2,
                    DoctorId: { '$gt': 0 },
                    BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                },
                include: [DoctorGroupJoin]
            });
            if (doctbillamountInstance) {
                for (let i = 0; i < doctbillamountInstance.length; i++) {
                    let bills: any = this.GetAttribute(doctbillamountInstance[i]);
                    let DoctorId = bills.DoctorId;
                    let NetDoctorShare = bills.NetDoctorShare;
                    DoctorGroup[DoctorId] = DoctorGroup[DoctorId] || [];
                    let info = {
                        'NetDoctorShare': NetDoctorShare,
                        'DoctorId': DoctorId,
                        'DoctorName': bills.Doctor
                    };
                    DoctorGroup[DoctorId].push(info);
                }
            }
        }

        return DoctorGroup;
    }

    public async GetRevenueDepartmentSummary(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 1, Value: await this.OPDeptRevenue(req) });
        result.push({ Key: 2, Value: await this.IPDeptRevenue(req) });
        result.push({ Key: 3, Value: await this.DirectDeptRevenue(req) });
        result.push({ Key: 4, Value: await this.DoctorShareDeptRevenue(req) });
        result.push({ Key: 5, Value: await this.ProviderShareDeptRevenue(req) });
        return result;
    }

    public async OPDeptRevenue(req: BaseRequest): Promise<any> {
        let DeptGroup: { [id: number]: any[] } = {};
        let DeptGroupJoin: any = {
            model: this.Models.Department,
            attributes: ['DepartmentName'],
            required: false,
        };
        if (req.Data.DepartmentId > 0) {
            let deptbillamountInstance: any = await this.FindAll({
                attributes: ['BillAmount', 'BillDiscount', 'BillNetAmount', 'NetDoctorShare', 'ProviderShare', 'DepartmentId'],
                where: {
                    EncounterTypeId: { '$in': [1, 4] },
                    DepartmentId: { '$eq': req.Data.DepartmentId },
                    BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                },
                include: [DeptGroupJoin]
            });
            if (deptbillamountInstance) {
                for (let i = 0; i < deptbillamountInstance.length; i++) {
                    let bills: any = this.GetAttribute(deptbillamountInstance[i]);
                    let DeptId = bills.DepartmentId;
                    let BillAmount = bills.BillAmount;
                    let BillDiscount = bills.BillDiscount;
                    let NetAmount = bills.BillNetAmount;
                    DeptGroup[DeptId] = DeptGroup[DeptId] || [];
                    let info = {
                        'BillAmount': BillAmount,
                        'BillDiscount': BillDiscount,
                        'NetAmount': NetAmount,
                        'DeptId': DeptId,
                        'DepartmentName': bills.Department.DepartmentName
                    };
                    DeptGroup[DeptId].push(info);
                }
            }
        } else if (req.Data.DepartmentId === 0) {
            let deptbillamountInstance: any = await this.FindAll({
                attributes: ['BillAmount', 'BillDiscount', 'BillNetAmount', 'NetDoctorShare', 'ProviderShare', 'DepartmentId'],
                where: {
                    EncounterTypeId: { '$in': [1, 4] },
                    DepartmentId: { '$gt': req.Data.DepartmentId },
                    BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                },
                include: [DeptGroupJoin]
            });
            if (deptbillamountInstance) {
                for (let i = 0; i < deptbillamountInstance.length; i++) {
                    let bills: any = this.GetAttribute(deptbillamountInstance[i]);
                    let DeptId = bills.DepartmentId;
                    let BillAmount = bills.BillAmount;
                    let BillDiscount = bills.BillDiscount;
                    let NetAmount = bills.BillNetAmount;
                    DeptGroup[DeptId] = DeptGroup[DeptId] || [];
                    let info = {
                        'BillAmount': BillAmount,
                        'BillDiscount': BillDiscount,
                        'NetAmount': NetAmount,
                        'DeptId': DeptId,
                        'DepartmentName': bills.Department.DepartmentName
                    };
                    DeptGroup[DeptId].push(info);
                }
            }
        }
        return DeptGroup;
    }

    public async IPDeptRevenue(req: BaseRequest): Promise<any> {
        let DeptGroup: { [id: number]: any[] } = {};
        let DeptGroupJoin: any = {
            model: this.Models.Department,
            attributes: ['DepartmentName'],
            required: false,
        };
        if (req.Data.DepartmentId > 0) {
            let deptbillamountInstance: any = await this.FindAll({
                attributes: ['BillAmount', 'BillDiscount', 'BillNetAmount', 'NetDoctorShare', 'ProviderShare', 'DepartmentId'],
                where: {
                    EncounterTypeId: 2,
                    DepartmentId: { '$eq': req.Data.DepartmentId },
                    BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                },
                include: [DeptGroupJoin]
            });
            if (deptbillamountInstance) {
                for (let i = 0; i < deptbillamountInstance.length; i++) {
                    let bills: any = this.GetAttribute(deptbillamountInstance[i]);
                    let DeptId = bills.DepartmentId;
                    let BillAmount = bills.BillAmount;
                    let BillDiscount = bills.BillDiscount;
                    let NetAmount = bills.BillNetAmount;
                    DeptGroup[DeptId] = DeptGroup[DeptId] || [];
                    let info = {
                        'BillAmount': BillAmount,
                        'BillDiscount': BillDiscount,
                        'NetAmount': NetAmount,
                        'DeptId': DeptId,
                        'DepartmentName': bills.Department.DepartmentName
                    };
                    DeptGroup[DeptId].push(info);
                }
            }
        } else if (req.Data.DepartmentId === 0) {
            let deptbillamountInstance: any = await this.FindAll({
                attributes: ['BillAmount', 'BillDiscount', 'BillNetAmount', 'NetDoctorShare', 'ProviderShare', 'DepartmentId'],
                where: {
                    EncounterTypeId: 2,
                    DepartmentId: { '$gt': req.Data.DepartmentId },
                    BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                },
                include: [DeptGroupJoin]
            });
            if (deptbillamountInstance) {
                for (let i = 0; i < deptbillamountInstance.length; i++) {
                    let bills: any = this.GetAttribute(deptbillamountInstance[i]);
                    let DeptId = bills.DepartmentId;
                    let BillAmount = bills.BillAmount;
                    let BillDiscount = bills.BillDiscount;
                    let NetAmount = bills.BillNetAmount;
                    DeptGroup[DeptId] = DeptGroup[DeptId] || [];
                    let info = {
                        'BillAmount': BillAmount,
                        'BillDiscount': BillDiscount,
                        'NetAmount': NetAmount,
                        'DeptId': DeptId,
                        'DepartmentName': bills.Department.DepartmentName
                    };
                    DeptGroup[DeptId].push(info);
                }
            }
        }
        return DeptGroup;
    }

    public async DirectDeptRevenue(req: BaseRequest): Promise<any> {
        let DeptGroup: { [id: number]: any[] } = {};
        let deptbillamountInstance: any = await this.FindAll({
            attributes: ['BillAmount', 'BillDiscount', 'BillNetAmount', 'NetDoctorShare', 'ProviderShare', 'DepartmentId'],
            where: {
                EncounterTypeId: { '$in': [1, 4] },
                DepartmentId: { '$eq': -1 },
                BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                PatientBillStatusId: 3,
            }
        });
        if (deptbillamountInstance) {
            for (let i = 0; i < deptbillamountInstance.length; i++) {
                let bills: any = this.GetAttribute(deptbillamountInstance[i]);
                let DeptId = bills.DepartmentId;
                let DeptName = 'Others';
                let BillAmount = bills.BillAmount;
                let BillDiscount = bills.BillDiscount;
                let NetAmount = bills.BillNetAmount;
                DeptGroup[DeptId] = DeptGroup[DeptId] || [];
                let info = {
                    'BillAmount': BillAmount,
                    'BillDiscount': BillDiscount,
                    'NetAmount': NetAmount,
                    'DeptId': DeptId,
                    'DepartmentName': DeptName
                };
                DeptGroup[DeptId].push(info);
            }
        }

        return DeptGroup;
    }
    public async DoctorShareDeptRevenue(req: BaseRequest): Promise<any> {
        let DeptGroup: { [id: number]: any[] } = {};
        let DeptGroupJoin: any = {
            model: this.Models.Department,
            attributes: ['DepartmentName'],
            required: false,
        };
        if (req.Data.DepartmentId > 0) {
            let deptbillamountInstance: any = await this.FindAll({
                attributes: ['BillAmount', 'BillDiscount', 'BillNetAmount', 'NetDoctorShare', 'ProviderShare', 'DepartmentId'],
                where: {
                    // EncounterTypeId: { '$in': [1, 4] },
                    DepartmentId: { '$eq': req.Data.DepartmentId },
                    BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                },
                include: [DeptGroupJoin]
            });
            if (deptbillamountInstance) {
                for (let i = 0; i < deptbillamountInstance.length; i++) {
                    let bills: any = this.GetAttribute(deptbillamountInstance[i]);
                    let DeptId = bills.DepartmentId;
                    let DrShare = bills.NetDoctorShare;
                    DeptGroup[DeptId] = DeptGroup[DeptId] || [];
                    let info = {
                        'DrShare': DrShare,
                        'DeptId': DeptId,
                        'DepartmentName': bills.Department.DepartmentName
                    };
                    DeptGroup[DeptId].push(info);
                }
            }
        } else if (req.Data.DepartmentId === 0) {
            let deptbillamountInstance: any = await this.FindAll({
                attributes: ['BillAmount', 'BillDiscount', 'BillNetAmount', 'NetDoctorShare', 'ProviderShare', 'DepartmentId'],
                where: {
                    // EncounterTypeId: { '$in': [1, 4] },
                    DepartmentId: { '$gt': req.Data.DepartmentId },
                    BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                },
                include: [DeptGroupJoin]
            });
            if (deptbillamountInstance) {
                for (let i = 0; i < deptbillamountInstance.length; i++) {
                    let bills: any = this.GetAttribute(deptbillamountInstance[i]);
                    let DeptId = bills.DepartmentId;
                    let DrShare = bills.NetDoctorShare;
                    DeptGroup[DeptId] = DeptGroup[DeptId] || [];
                    let info = {
                        'DrShare': DrShare,
                        'DeptId': DeptId,
                        'DepartmentName': bills.Department.DepartmentName
                    };
                    DeptGroup[DeptId].push(info);
                }
            }
        }
        return DeptGroup;
    }
    public async ProviderShareDeptRevenue(req: BaseRequest): Promise<any> {
        let DeptGroup: { [id: number]: any[] } = {};
        let DeptGroupJoin: any = {
            model: this.Models.Department,
            attributes: ['DepartmentName'],
            required: false,
        };
        if (req.Data.DepartmentId > 0) {
            let deptbillamountInstance: any = await this.FindAll({
                attributes: ['BillAmount', 'BillDiscount', 'BillNetAmount', 'NetDoctorShare', 'ProviderShare', 'DepartmentId'],
                where: {
                    // EncounterTypeId: { '$in': [1, 4] },
                    DepartmentId: { '$eq': req.Data.DepartmentId },
                    BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                },
                include: [DeptGroupJoin]
            });
            if (deptbillamountInstance) {
                for (let i = 0; i < deptbillamountInstance.length; i++) {
                    let bills: any = this.GetAttribute(deptbillamountInstance[i]);
                    let DeptId = bills.DepartmentId;
                    let ProviderShare = bills.ProviderShare;
                    DeptGroup[DeptId] = DeptGroup[DeptId] || [];
                    let info = {
                        'ProviderShare': ProviderShare,
                        'DeptId': DeptId,
                        'DepartmentName': bills.Department.DepartmentName
                    };
                    DeptGroup[DeptId].push(info);
                }
            }
        } else if (req.Data.DepartmentId === 0) {
            let deptbillamountInstance: any = await this.FindAll({
                attributes: ['BillAmount', 'BillDiscount', 'BillNetAmount', 'NetDoctorShare', 'ProviderShare', 'DepartmentId'],
                where: {
                    // EncounterTypeId: { '$in': [1, 4] },
                    DepartmentId: { '$gt': req.Data.DepartmentId },
                    BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PatientBillStatusId: 3,
                },
                include: [DeptGroupJoin]
            });
            if (deptbillamountInstance) {
                for (let i = 0; i < deptbillamountInstance.length; i++) {
                    let bills: any = this.GetAttribute(deptbillamountInstance[i]);
                    let DeptId = bills.DepartmentId;
                    let ProviderShare = bills.ProviderShare;
                    DeptGroup[DeptId] = DeptGroup[DeptId] || [];
                    let info = {
                        'ProviderShare': ProviderShare,
                        'DeptId': DeptId,
                        'DepartmentName': bills.Department.DepartmentName
                    };
                    DeptGroup[DeptId].push(info);
                }
            }
        }
        return DeptGroup;
    }

    public async GetRevenueCategorySummary(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 1, Value: await this.OPServiceCollection(req) });
        result.push({ Key: 2, Value: await this.IPServiceCollection(req) });
        // result.push({ Key: 3, Value: await this.DirectCateRevenue(req) });
        result.push({ Key: 3, Value: await this.DoctorShareServiceCollection(req) });
        result.push({ Key: 4, Value: await this.ProviderShareServiceCollection(req) });
        return result;
    }

    public async OPServiceCollection(req: BaseRequest): Promise<any> {
        let ServiceGroup: { [id: number]: any[] } = {};
        let ServiceCategoryJoin: any = {
            model: this.Models.ServiceCategory,
            attributes: ['ServiceCategoryName'],
            required: false,
        };
        let PatientBillJoin: any = {
            model: this.Models.PatientBills,
            attributes: [],
            required: true,
            where: {
                BillTypeId: { '$in': [1, 5] },
                PatientBillStatusId: 3,
                BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate }
            }
        };
        let opbillamountInstance: any = await this.FindAll({
            attributes: ['BillAmount', 'BillDiscount', 'BillNetAmount', 'NetDoctorShare', 'ProviderShare', 'CategoryId'],
            where: {
                PatientBillStatusId: 3,
                BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate }
            },
            include: [PatientBillJoin, ServiceCategoryJoin]
        });
        if (opbillamountInstance) {
            for (let i = 0; i < opbillamountInstance.length; i++) {
                let billdetail: any = this.GetAttribute(opbillamountInstance[i]);
                let ServId = billdetail.CategoryId;
                ServiceGroup[ServId] = ServiceGroup[ServId] || [];
                let info = {
                    'NetAmount': billdetail.BillNetAmount,
                    'ServId': ServId,
                    'ServiceCategoryName': billdetail.ServiceCategory.ServiceCategoryName
                };
                ServiceGroup[ServId].push(info);
            }
        }

        return ServiceGroup;
    }

    public async IPServiceCollection(req: BaseRequest): Promise<any> {
        let ServiceGroup: { [id: number]: any[] } = {};
        let ServiceCategoryJoin: any = {
            model: this.Models.ServiceCategory,
            attributes: ['ServiceCategoryName'],
            required: false,
        };
        let PatientBillJoin: any = {
            model: this.Models.PatientBills,
            attributes: [],
            required: true,
            where: {
                BillTypeId: 2,
                PatientBillStatusId: 3,
                BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate }
            }
        };
        let ipbillamountInstance: any = await this.FindAll({
            attributes: ['BillAmount', 'BillDiscount', 'BillNetAmount', 'NetDoctorShare', 'ProviderShare', 'CategoryId'],
            where: {
                PatientBillStatusId: 3,
                BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate }
            },
            include: [PatientBillJoin, ServiceCategoryJoin]
        });
        if (ipbillamountInstance) {
            for (let i = 0; i < ipbillamountInstance.length; i++) {
                let billdetail: any = this.GetAttribute(ipbillamountInstance[i]);
                let ServId = billdetail.CategoryId;
                ServiceGroup[ServId] = ServiceGroup[ServId] || [];
                let info = {
                    'NetAmount': billdetail.BillNetAmount,
                    'ServId': ServId,
                    'ServiceCategoryName': billdetail.ServiceCategory.ServiceCategoryName
                };
                ServiceGroup[ServId].push(info);
            }
        }

        return ServiceGroup;
    }
    // public async DirectCateRevenue(req: BaseRequest): Promise<any> {
    //     let DeptGroup: { [id: number]: any[] } = {};
    //     let deptbillamountInstance: any = await this.FindAll({
    //         attributes: ['BillAmount', 'BillDiscount', 'BillNetAmount', 'NetDoctorShare', 'ProviderShare', 'DepartmentId'],
    //         where: {
    //             EncounterTypeId: { '$in': [1, 4] },
    //             DepartmentId: { '$eq': -1 },
    //             BillDateTime: { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
    //             PatientBillStatusId: 3,
    //         }
    //     });
    //     if (deptbillamountInstance) {
    //         for (let i = 0; i < deptbillamountInstance.length; i++) {
    //             let bills: any = this.GetAttribute(deptbillamountInstance[i]);
    //             let DeptId = bills.DepartmentId;
    //             let DeptName = 'Others';
    //             let BillAmount = bills.BillAmount;
    //             let BillDiscount = bills.BillDiscount;
    //             let NetAmount = bills.BillNetAmount;
    //             DeptGroup[DeptId] = DeptGroup[DeptId] || [];
    //             let info = {
    //                 'BillAmount': BillAmount,
    //                 'BillDiscount': BillDiscount,
    //                 'NetAmount': NetAmount,
    //                 'DeptId': DeptId,
    //                 'DepartmentName': DeptName
    //             };
    //             DeptGroup[DeptId].push(info);
    //         }
    //     }

    //     return DeptGroup;
    // }
    public async DoctorShareServiceCollection(req: BaseRequest): Promise<any> {
        let ServiceGroup: { [id: number]: any[] } = {};
        let ServiceCategoryJoin: any = {
            model: this.Models.ServiceCategory,
            attributes: ['ServiceCategoryName'],
            required: false,
        };
        let PatientBillJoin: any = {
            model: this.Models.PatientBills,
            attributes: [],
            required: true,
            where: {
                // BillTypeId: { '$in': [1, 5] },
                PatientBillStatusId: 3,
                BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate }
            }
        };
        let drsharebillamountInstance: any = await this.FindAll({
            attributes: ['BillAmount', 'BillDiscount', 'BillNetAmount', 'NetDoctorShare', 'ProviderShare', 'CategoryId'],
            where: {
                PatientBillStatusId: 3,
                BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate }
            },
            include: [PatientBillJoin, ServiceCategoryJoin]
        });
        if (drsharebillamountInstance) {
            for (let i = 0; i < drsharebillamountInstance.length; i++) {
                let billdetail: any = this.GetAttribute(drsharebillamountInstance[i]);
                let ServId = billdetail.CategoryId;
                ServiceGroup[ServId] = ServiceGroup[ServId] || [];
                let info = {
                    'NetAmount': billdetail.NetDoctorShare,
                    'ServId': ServId,
                    'ServiceCategoryName': billdetail.ServiceCategory.ServiceCategoryName
                };
                ServiceGroup[ServId].push(info);
            }
        }

        return ServiceGroup;
    }
    public async ProviderShareServiceCollection(req: BaseRequest): Promise<any> {
        let ServiceGroup: { [id: number]: any[] } = {};
        let ServiceCategoryJoin: any = {
            model: this.Models.ServiceCategory,
            attributes: ['ServiceCategoryName'],
            required: false,
        };
        let PatientBillJoin: any = {
            model: this.Models.PatientBills,
            attributes: [],
            required: true,
            where: {
                // BillTypeId: 3,
                PatientBillStatusId: 3,
                BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate }
            }
        };
        let providersharebillamountInstance: any = await this.FindAll({
            attributes: ['BillAmount', 'BillDiscount', 'BillNetAmount', 'NetDoctorShare', 'ProviderShare', 'CategoryId'],
            where: {
                PatientBillStatusId: 3,
                BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate }
            },
            include: [PatientBillJoin, ServiceCategoryJoin]
        });
        if (providersharebillamountInstance) {
            for (let i = 0; i < providersharebillamountInstance.length; i++) {
                let billdetail: any = this.GetAttribute(providersharebillamountInstance[i]);
                let ServId = billdetail.CategoryId;
                ServiceGroup[ServId] = ServiceGroup[ServId] || [];
                let info = {
                    'NetAmount': billdetail.ProviderShare,
                    'ServId': ServId,
                    'ServiceCategoryName': billdetail.ServiceCategory.ServiceCategoryName
                };
                ServiceGroup[ServId].push(info);
            }
        }

        return ServiceGroup;
    }
    public GetModel(): SStatic.Model<CollectionBaseRevenueInstance, CollectionBaseRevenueAttributes> {
        return this.Models.CollectionBaseRevenue;
    }
    public async PrintDocShareItemCollectionSummaryOPReport(apiReq?: ApiRequest<CollectionBaseRevenueFilters>): Promise<any> {
        let data = await this.GetCollectionBaseRevenues(apiReq);
        let CollectionBaseRevenues = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let BillingGroup = apiReq.Data.BillingGroup;
        let DoctorName = apiReq.Data.DoctorName;
        let BillingService = apiReq.Data.BillingService;
        let CollectionBaseRevenuesData = data.Data[0];
        let TotalAmount: number = 0;
        let TotalDisAmount: number = 0;
        let TotalNetAmount: number = 0;
        let TotalDocshare: number = 0;
        let TotalProvidershare: number = 0;

        for (let idx in CollectionBaseRevenues) {
            let item = CollectionBaseRevenues[idx];
            TotalAmount = TotalAmount + item.BillAmount;
            TotalDisAmount = TotalDisAmount + item.BillDiscount;
            TotalNetAmount = TotalNetAmount + item.BillNetAmount;
            TotalDocshare = TotalDocshare + item.NetDoctorShare;
            TotalProvidershare = TotalProvidershare + item.ProviderShare;
        }
        let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(CollectionBaseRevenuesData.FacilityId);
        let info = {
            CollectionBaseRevenues: CollectionBaseRevenues,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            BillingGroup: BillingGroup,
            DoctorName: DoctorName,
            TotalAmount: TotalAmount,
            BillingService: BillingService,
            TotalDisAmount: TotalDisAmount,
            TotalNetAmount: TotalNetAmount,
            TotalDocshare: TotalDocshare,
            TotalProvidershare: TotalProvidershare

        };
        let pdfOption: any = null;
        let key = 'drshareitemwisecollectionsummaryop';
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
    public async PrintDocShareItemCollectionSummaryIPReport(apiReq?: ApiRequest<CollectionBaseRevenueFilters>): Promise<any> {
        let data = await this.GetCollectionBaseRevenues(apiReq);
        let CollectionBaseRevenues = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let BillingGroup = apiReq.Data.BillingGroup;
        let DoctorName = apiReq.Data.DoctorName;
        let BillingService = apiReq.Data.BillingService;
        let CollectionBaseRevenuesData = data.Data[0];
        let TotalAmount: number = 0;
        let TotalDisAmount: number = 0;
        let TotalNetAmount: number = 0;
        let TotalDocshare: number = 0;
        let TotalProvidershare: number = 0;

        for (let idx in CollectionBaseRevenues) {
            let item = CollectionBaseRevenues[idx];
            TotalAmount = TotalAmount + item.BillAmount;
            TotalDisAmount = TotalDisAmount + item.BillDiscount;
            TotalNetAmount = TotalNetAmount + item.BillNetAmount;
            TotalDocshare = TotalDocshare + item.NetDoctorShare;
            TotalProvidershare = TotalProvidershare + item.ProviderShare;
        }
        let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(CollectionBaseRevenuesData.FacilityId);
        let info = {
            CollectionBaseRevenues: CollectionBaseRevenues,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            BillingGroup: BillingGroup,
            DoctorName: DoctorName,
            TotalAmount: TotalAmount,
            BillingService: BillingService,
            TotalDisAmount: TotalDisAmount,
            TotalNetAmount: TotalNetAmount,
            TotalDocshare: TotalDocshare,
            TotalProvidershare: TotalProvidershare

        };
        let pdfOption: any = null;
        let key = 'drshareitemwisecollectionsummaryip';
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
    public async PrintRevenueSummaryDepartmentReport(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let FacilityName = req.Data.FacilityName;
        let DepartmentName = req.Data.DepartmentName;
        let DepartmentData: any = [];
        // let FacilityInfo: any = [];
        let opTotNetAmt: number = 0;
        let opdepartment: any = [];
        let department: Array<any> = [];
        let Totdepartment: any = [];
        let totopdepartment: any = [];
        let ipdepartment: any = [];
        let totipdepartment: any = [];
        let drsharedepartment: any = [];
        let totdrsharedepartment: any = [];
        let providersharedepartment: any = [];
        let totprovidersharedepartment: any = [];

        let DepartmentReq = req;
        DepartmentData = await this.GetRevenueDepartmentSummary(DepartmentReq);
        // DoctorData = DoctorData;
        let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(DepartmentReq.Data.FacilityId);

        let opcollection = [];
        let ipcollection = [];
        let directcollection = [];
        let drsharecollection = [];
        let providersharecollection = [];

        if (DepartmentData.length > 0)
            opcollection = DepartmentData[0].Value;


        if (DepartmentData.length > 1)
            ipcollection = DepartmentData[1].Value;

        if (DepartmentData.length > 2)
            directcollection = DepartmentData[2].Value;

        if (DepartmentData.length > 3)
            drsharecollection = DepartmentData[3].Value;

        if (DepartmentData.length > 4)
            providersharecollection = DepartmentData[4].Value;


        for (let idx in opcollection) {
            let coll = opcollection[idx];
            let NetAmt = 0;
            let key = '';
            for (let idx in coll) {
                key = coll[idx].DepartmentName;
                NetAmt += coll[idx].NetAmount;
            }
            opTotNetAmt += NetAmt;
            opdepartment.push({
                'Key': key,
                'Value': NetAmt
            });
            department.push({
                'Key': key,
                'Value': {
                    'OP': NetAmt,
                    'IP': 0.00,
                    'OPIP': NetAmt,
                    'DrShare': 0.00,
                    'ProviderShare': 0.00,
                }
            });
        }
        totopdepartment.push({
            'Key': 'Total',
            'Value': opTotNetAmt
        });
        let ipTotNetAmt = 0;
        for (let idx in ipcollection) {
            let coll = ipcollection[idx];
            let NetAmt = 0;
            let key = '';
            for (let idx in coll) {
                key = coll[idx].DepartmentName;
                NetAmt += coll[idx].NetAmount;
            }
            ipTotNetAmt += NetAmt;
            ipdepartment.push({
                'Key': key,
                'Value': NetAmt
            });

            let valappended = 0;
            department.forEach((val) => {
                if (key === val.Key) {
                    val.Value.IP = NetAmt;
                    val.Value.OPIP = val.Value.OP + val.Value.IP;
                    valappended = 1;
                }
            });

            if (valappended === 0)
                department.push({
                    'Key': key,
                    'Value': {
                        'OP': 0.00,
                        'IP': NetAmt,
                        'OPIP': NetAmt
                    }
                });

        }
        totipdepartment.push({
            'Key': 'Total',
            'Value': ipTotNetAmt
        });

        let directbillamt = 0;
        let opwithdirectamt = 0;
        for (let idx in directcollection) {
            let coll = directcollection[idx];
            let NetAmt = 0;
            let key = '';
            for (let idx in coll) {
                key = coll[idx].DepartmentName;
                NetAmt += coll[idx].NetAmount;
            }
            directbillamt += NetAmt;

            opdepartment.push({
                'Key': key,
                'Value': NetAmt
            });
            department.push({
                'Key': key,
                'Value': {
                    'OP': NetAmt,
                    'IP': 0.00,
                    'DrShare': 0.00,
                    'ProviderShare': 0.00,
                }
            });
        }

        let drshareTotNetAmt = 0;
        for (let idx in drsharecollection) {
            let coll = drsharecollection[idx];
            let NetAmt = 0;
            let key = '';
            for (let idx in coll) {
                key = coll[idx].DepartmentName;
                NetAmt += coll[idx].DrShare;
            }
            drshareTotNetAmt += NetAmt;
            drsharedepartment.push({
                'Key': key,
                'Value': NetAmt
            });

            let valappended = 0;
            department.forEach((val) => {
                if (key === val.Key) {
                    val.Value.DrShare = NetAmt;
                    valappended = 1;
                }
            });

            if (valappended === 0)
                department.push({
                    'Key': key,
                    'Value': {
                        'OP': 0.00,
                        'IP': 0.00,
                        'OPIP': 0.00,
                        'DrShare': NetAmt,
                        'ProviderShare': 0.00,
                    }
                });

        }
        totdrsharedepartment.push({
            'Key': 'Total',
            'Value': drshareTotNetAmt
        });

        let providershareTotNetAmt = 0;
        for (let idx in providersharecollection) {
            let coll = providersharecollection[idx];
            let NetAmt = 0;
            let key = '';
            for (let idx in coll) {
                key = coll[idx].DepartmentName;
                NetAmt += coll[idx].ProviderShare;
            }
            providershareTotNetAmt += NetAmt;
            providersharedepartment.push({
                'Key': key,
                'Value': NetAmt
            });

            let valappended = 0;
            department.forEach((val) => {
                if (key === val.Key) {
                    val.Value.ProviderShare = NetAmt;
                    valappended = 1;
                }
            });

            if (valappended === 0)
                department.push({
                    'Key': key,
                    'Value': {
                        'OP': 0.00,
                        'IP': 0.00,
                        'OPIP': 0.00,
                        'DrShare': 0.00,
                        'ProviderShare': NetAmt,
                    }
                });

        }
        totprovidersharedepartment.push({
            'Key': 'Total',
            'Value': providershareTotNetAmt
        });

        opwithdirectamt = opTotNetAmt + directbillamt;
        Totdepartment.push({
            'Key': 'Total',
            'Value': {
                'OP': opwithdirectamt || 0,
                'IP': ipTotNetAmt || 0,
                'OPIP': (opwithdirectamt + ipTotNetAmt) || 0,
                'DrShare': drshareTotNetAmt || 0,
                'ProviderShare': providershareTotNetAmt || 0,
            }
        });
        let info = {
            Preferences: printPreferencesData,
            department: department,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            Totdepartment: Totdepartment,
            DepartmentName: DepartmentName
        };
        let pdfOption: any = null;
        let key = 'drsharerevenuesummarydepartment';
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
    public async PrintRevenueSummaryDoctorReport(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let FacilityName = req.Data.FacilityName;
        let DoctorName = req.Data.DoctorName;
        let DoctorData: any = [];
        // let FacilityInfo: any = [];
        let opTotNetAmt: number = 0;
        let opdoctor: any = [];
        let doctor: Array<any> = [];
        let Totdoctor: any = [];
        let totopdoctor: any = [];
        let ipdoctor: any = [];
        let totipdoctor: any = [];
        let docName: any = '';
        let drsharedoctor: any = [];
        let totdrsharedoctor: any = [];
        let providersharedoctor: any = [];
        let totprovidersharedoctor: any = [];
        let grossdrsharedoctor: any = [];
        let totgrossdrsharedoctor: any = [];
        let tdssharedoctor: any = [];
        let tottdssharedoctor: any = [];

        let DoctorReq = req;
        DoctorData = await this.GetRevenueDoctorSummary(DoctorReq);
        // DoctorData = DoctorData;
        let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(DoctorReq.Data.FacilityId);

        let opcollection = [];
        let ipcollection = [];
        let directcollection = [];
        let drsharecollection = [];
        let providersharecollection = [];
        let grossdrsharecollection = [];
        let tdssharecollection = [];

        if (DoctorData.length > 0)
            opcollection = DoctorData[0].Value;


        if (DoctorData.length > 1)
            ipcollection = DoctorData[1].Value;

        if (DoctorData.length > 2)
            directcollection = DoctorData[2].Value;

        if (DoctorData.length > 3)
            providersharecollection = DoctorData[3].Value;

        if (DoctorData.length > 4)
            grossdrsharecollection = DoctorData[4].Value;

        if (DoctorData.length > 5)
            tdssharecollection = DoctorData[5].Value;

        if (DoctorData.length > 6)
            drsharecollection = DoctorData[6].Value;

        for (let idx in opcollection) {
            let coll = opcollection[idx];
            let NetAmt = 0;
            let key = '';
            for (let idx in coll) {
                docName = '';
                if (coll[idx].DoctorName.Title)
                    docName = coll[idx].DoctorName.Title.Description;
                if (coll[idx].DoctorName.FirstName)
                    docName += ' ' + coll[idx].DoctorName.FirstName;
                if (coll[idx].DoctorName.LastName)
                    docName += ' ' + coll[idx].DoctorName.LastName;

                key = docName;
                NetAmt += coll[idx].BillAmount;
            }
            opTotNetAmt += NetAmt;
            opdoctor.push({
                'Key': key,
                'Value': NetAmt
            });
            doctor.push({
                'Key': key,
                'Value': {
                    'OP': NetAmt,
                    'IP': 0.00,
                    'OPIP': NetAmt,
                    'ProviderShare': 0.00,
                    'GrossDoctorShare': 0.00,
                    'TDSAmount': 0.00,
                    'DrShare': 0.00,
                }
            });
        }
        totopdoctor.push({
            'Key': 'Total',
            'Value': opTotNetAmt
        });
        let ipTotNetAmt = 0;
        for (let idx in ipcollection) {
            let coll = ipcollection[idx];
            let NetAmt = 0;
            let key = '';
            for (let idx in coll) {
                docName = '';
                if (coll[idx].DoctorName.Title)
                    docName = coll[idx].DoctorName.Title.Description;
                if (coll[idx].DoctorName.FirstName)
                    docName += ' ' + coll[idx].DoctorName.FirstName;
                if (coll[idx].DoctorName.LastName)
                    docName += ' ' + coll[idx].DoctorName.LastName;

                key = docName;
                NetAmt += coll[idx].BillAmount;
            }
            ipTotNetAmt += NetAmt;
            ipdoctor.push({
                'Key': key,
                'Value': NetAmt
            });

            let valappended = 0;
            doctor.forEach((val) => {
                if (key === val.Key) {
                    val.Value.IP = NetAmt;
                    val.Value.OPIP = val.Value.OP + val.Value.IP;
                    valappended = 1;
                }
            });

            if (valappended === 0)
                doctor.push({
                    'Key': key,
                    'Value': {
                        'OP': 0.00,
                        'IP': NetAmt,
                        'OPIP': NetAmt,
                        'ProviderShare': 0.00,
                        'GrossDoctorShare': 0.00,
                        'TDSAmount': 0.00,
                        'DrShare': 0.00,
                    }
                });

        }
        totipdoctor.push({
            'Key': 'Total',
            'Value': ipTotNetAmt
        });

        let directbillamt = 0;
        let opwithdirectamt = 0;
        for (let idx in directcollection) {
            let coll = directcollection[idx];
            let NetAmt = 0;
            let key = '';
            for (let idx in coll) {
                docName = '';
                if (coll[idx].DoctorName)
                    docName = coll[idx].DoctorName;

                key = docName;
                NetAmt += coll[idx].BillAmount;
            }
            directbillamt += NetAmt;

            opdoctor.push({
                'Key': key,
                'Value': NetAmt
            });
            doctor.push({
                'Key': key,
                'Value': {
                    'OP': NetAmt,
                    'IP': 0.00,
                    'OPIP': 0.00,
                    'ProviderShare': 0.00,
                    'GrossDoctorShare': 0.00,
                    'TDSAmount': 0.00,
                    'DrShare': 0.00,
                }
            });
        }

        let providershareTotNetAmt = 0;
        for (let idx in providersharecollection) {
            let coll = providersharecollection[idx];
            let NetAmt = 0;
            let key = '';
            for (let idx in coll) {
                docName = '';
                if (coll[idx].DoctorName.Title)
                    docName = coll[idx].DoctorName.Title.Description;
                if (coll[idx].DoctorName.FirstName)
                    docName += ' ' + coll[idx].DoctorName.FirstName;
                if (coll[idx].DoctorName.LastName)
                    docName += ' ' + coll[idx].DoctorName.LastName;

                key = docName;
                NetAmt += coll[idx].ProviderShare;
            }
            providershareTotNetAmt += NetAmt;
            providersharedoctor.push({
                'Key': key,
                'Value': NetAmt
            });

            let valappended = 0;
            doctor.forEach((val) => {
                if (key === val.Key) {
                    val.Value.ProviderShare = NetAmt;
                    valappended = 1;
                }
            });

            if (valappended === 0)
                doctor.push({
                    'Key': key,
                    'Value': {
                        'OP': 0.00,
                        'IP': 0.00,
                        'OPIP': 0.00,
                        'ProviderShare': NetAmt,
                        'GrossDoctorShare': 0.00,
                        'TDSAmount': 0.00,
                        'DrShare': 0.00,
                    }
                });

        }
        totprovidersharedoctor.push({
            'Key': 'Total',
            'Value': providershareTotNetAmt
        });

        let grossdrshareTotNetAmt = 0;
        for (let idx in grossdrsharecollection) {
            let coll = grossdrsharecollection[idx];
            let NetAmt = 0;
            let key = '';
            for (let idx in coll) {
                docName = '';
                if (coll[idx].DoctorName.Title)
                    docName = coll[idx].DoctorName.Title.Description;
                if (coll[idx].DoctorName.FirstName)
                    docName += ' ' + coll[idx].DoctorName.FirstName;
                if (coll[idx].DoctorName.LastName)
                    docName += ' ' + coll[idx].DoctorName.LastName;

                key = docName;
                NetAmt += coll[idx].GrossDoctorShare;
            }
            grossdrshareTotNetAmt += NetAmt;
            grossdrsharedoctor.push({
                'Key': key,
                'Value': NetAmt
            });

            let valappended = 0;
            doctor.forEach((val) => {
                if (key === val.Key) {
                    val.Value.GrossDoctorShare = NetAmt;
                    valappended = 1;
                }
            });

            if (valappended === 0)
                doctor.push({
                    'Key': key,
                    'Value': {
                        'OP': 0.00,
                        'IP': 0.00,
                        'OPIP': 0.00,
                        'ProviderShare': 0.00,
                        'GrossDoctorShare': NetAmt,
                        'TDSAmount': 0.00,
                        'DrShare': 0.00,
                    }
                });

        }
        totgrossdrsharedoctor.push({
            'Key': 'Total',
            'Value': grossdrshareTotNetAmt
        });

        let tdsshareTotNetAmt = 0;
        for (let idx in tdssharecollection) {
            let coll = tdssharecollection[idx];
            let NetAmt = 0;
            let key = '';
            for (let idx in coll) {
                docName = '';
                if (coll[idx].DoctorName.Title)
                    docName = coll[idx].DoctorName.Title.Description;
                if (coll[idx].DoctorName.FirstName)
                    docName += ' ' + coll[idx].DoctorName.FirstName;
                if (coll[idx].DoctorName.LastName)
                    docName += ' ' + coll[idx].DoctorName.LastName;

                key = docName;
                NetAmt += coll[idx].TDSAmount;
            }
            tdsshareTotNetAmt += NetAmt;
            tdssharedoctor.push({
                'Key': key,
                'Value': NetAmt
            });

            let valappended = 0;
            doctor.forEach((val) => {
                if (key === val.Key) {
                    val.Value.TDSAmount = NetAmt;
                    valappended = 1;
                }
            });

            if (valappended === 0)
                doctor.push({
                    'Key': key,
                    'Value': {
                        'OP': 0.00,
                        'IP': 0.00,
                        'OPIP': 0.00,
                        'ProviderShare': 0.00,
                        'GrossDoctorShare': 0.00,
                        'TDSAmount': NetAmt,
                        'DrShare': 0.00,


                    }
                });

        }
        tottdssharedoctor.push({
            'Key': 'Total',
            'Value': tdsshareTotNetAmt
        });

        let drshareTotNetAmt = 0;
        for (let idx in drsharecollection) {
            let coll = drsharecollection[idx];
            let NetAmt = 0;
            let key = '';
            for (let idx in coll) {
                docName = '';
                if (coll[idx].DoctorName.Title)
                    docName = coll[idx].DoctorName.Title.Description;
                if (coll[idx].DoctorName.FirstName)
                    docName += ' ' + coll[idx].DoctorName.FirstName;
                if (coll[idx].DoctorName.LastName)
                    docName += ' ' + coll[idx].DoctorName.LastName;

                key = docName;
                NetAmt += coll[idx].NetDoctorShare;
            }
            drshareTotNetAmt += NetAmt;
            drsharedoctor.push({
                'Key': key,
                'Value': NetAmt
            });

            let valappended = 0;
            doctor.forEach((val) => {
                if (key === val.Key) {
                    val.Value.DrShare = NetAmt;
                    valappended = 1;
                }
            });

            if (valappended === 0)
                doctor.push({
                    'Key': key,
                    'Value': {
                        'OP': 0.00,
                        'IP': 0.00,
                        'OPIP': 0.00,
                        'ProviderShare': 0.00,
                        'GrossDoctorShare': 0.00,
                        'TDSAmount': 0.00,
                        'DrShare': NetAmt,

                    }
                });

        }
        totdrsharedoctor.push({
            'Key': 'Total',
            'Value': drshareTotNetAmt
        });



        opwithdirectamt = opTotNetAmt + directbillamt;
        Totdoctor.push({
            'Key': 'Total',
            'Value': {
                'OP': opwithdirectamt,
                'IP': ipTotNetAmt,
                'OPIP': opwithdirectamt + ipTotNetAmt,
                'DrShare': drshareTotNetAmt,
                'GrossDoctorShare': grossdrshareTotNetAmt,
                'ProviderShare': providershareTotNetAmt,
                'TDSAmount': tdsshareTotNetAmt,
            }
        });
        let info = {
            Preferences: printPreferencesData,
            doctor: doctor,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            Totdoctor: Totdoctor,
            DoctorName: DoctorName
        };
        let pdfOption: any = null;
        let key = 'drsharerevenuesummarydoctor';
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
    public async PrintRevenueSummaryCategoryReport(req: BaseRequest): Promise<any> {
        // let data = await this.GetFacilityDashboardOptions(apiReq);
        // let FacilityDashboard = data.Data;
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let FacilityName = req.Data.FacilityName;
        let CategoryName = req.Data.CategoryName;
        let CategoryData: any = [];
        // let FacilityInfo: any = [];
        let opTotNetAmt: number = 0;
        let opcategory: any = [];
        let category: Array<any> = [];
        let Totcategory: any = [];
        let totopcategory: any = [];
        let ipcategory: any = [];
        let totipcategory: any = [];
        let drsharecategory: any = [];
        let totdrsharecategory: any = [];
        let providersharecategory: any = [];
        let totprovidersharecategory: any = [];

        let categoryReq = req;
        CategoryData = await this.GetRevenueCategorySummary(categoryReq);
        // CategoryData = CategoryData;
        let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(categoryReq.Data.FacilityId);

        let opcollection = [];
        let ipcollection = [];
        let drsharecollection = [];
        let providersharecollection = [];

        if (CategoryData.length > 0)
            opcollection = CategoryData[0].Value;


        if (CategoryData.length > 1)
            ipcollection = CategoryData[1].Value;

        if (CategoryData.length > 3)
            drsharecollection = CategoryData[3].Value;

        if (CategoryData.length > 4)
            providersharecollection = CategoryData[4].Value;



        for (let idx in opcollection) {
            let coll = opcollection[idx];
            let NetAmt = 0;
            let key = '';
            for (let idx in coll) {
                key = coll[idx].ServiceCategoryName;
                NetAmt += coll[idx].NetAmount;
            }
            opTotNetAmt += NetAmt;
            opcategory.push({
                'Key': key,
                'Value': NetAmt
            });
            category.push({
                'Key': key,
                'Value': {
                    'OP': NetAmt,
                    'IP': 0.00,
                    'OPIP': NetAmt,
                    'DrShare': 0.00,
                    'ProviderShare': 0.00,
                }
            });
        }
        totopcategory.push({
            'Key': 'Total',
            'Value': opTotNetAmt
        });
        let ipTotNetAmt = 0;
        for (let idx in ipcollection) {
            let coll = ipcollection[idx];
            let NetAmt = 0;
            let key = '';
            for (let idx in coll) {
                key = coll[idx].ServiceCategoryName;
                NetAmt += coll[idx].NetAmount;
            }
            ipTotNetAmt += NetAmt;
            ipcategory.push({
                'Key': key,
                'Value': NetAmt
            });

            let valappended = 0;
            category.forEach((val) => {
                if (key === val.Key) {
                    val.Value.IP = NetAmt;
                    val.Value.OPIP = val.Value.OP + val.Value.IP;
                    valappended = 1;
                }
            });

            if (valappended === 0)
                category.push({
                    'Key': key,
                    'Value': {
                        'OP': 0.00,
                        'IP': NetAmt,
                        'OPIP': NetAmt,
                        'DrShare': 0.00,
                        'ProviderShare': 0.00,
                    }
                });
        }
        totipcategory.push({
            'Key': 'Total',
            'Value': ipTotNetAmt
        });

        let drshareTotNetAmt = 0;
        for (let idx in drsharecollection) {
            let coll = drsharecollection[idx];
            let NetAmt = 0;
            let key = '';
            for (let idx in coll) {
                key = coll[idx].ServiceCategoryName;
                NetAmt += coll[idx].NetAmount;
            }
            drshareTotNetAmt += NetAmt;
            drsharecategory.push({
                'Key': key,
                'Value': NetAmt
            });

            let valappended = 0;
            category.forEach((val) => {
                if (key === val.Key) {
                    val.Value.DrShare = NetAmt;
                    valappended = 1;
                }
            });

            if (valappended === 0)
                category.push({
                    'Key': key,
                    'Value': {
                        'OP': 0.00,
                        'IP': 0.00,
                        'OPIP': 0.00,
                        'DrShare': NetAmt,
                        'ProviderShare': 0.00,
                    }
                });

        }
        totdrsharecategory.push({
            'Key': 'Total',
            'Value': drshareTotNetAmt
        });

        let providershareTotNetAmt = 0;
        for (let idx in providersharecollection) {
            let coll = providersharecollection[idx];
            let NetAmt = 0;
            let key = '';
            for (let idx in coll) {
                key = coll[idx].ServiceCategoryName;
                NetAmt += coll[idx].NetAmount;
            }
            providershareTotNetAmt += NetAmt;
            providersharecategory.push({
                'Key': key,
                'Value': NetAmt
            });

            let valappended = 0;
            category.forEach((val) => {
                if (key === val.Key) {
                    val.Value.ProviderShare = NetAmt;
                    valappended = 1;
                }
            });

            if (valappended === 0)
                category.push({
                    'Key': key,
                    'Value': {
                        'OP': 0.00,
                        'IP': 0.00,
                        'OPIP': 0.00,
                        'DrShare': 0.00,
                        'ProviderShare': NetAmt,
                    }
                });

        }
        totprovidersharecategory.push({
            'Key': 'Total',
            'Value': providershareTotNetAmt
        });

        Totcategory.push({
            'Key': 'Total',
            'Value': {
                'OP': opTotNetAmt || 0,
                'IP': ipTotNetAmt || 0,
                'OPIP': (opTotNetAmt + ipTotNetAmt) || 0,
                'DrShare': drshareTotNetAmt || 0,
                'ProviderShare': providershareTotNetAmt || 0,
            }
        });
        let info = {
            Preferences: printPreferencesData,
            category: category,
            Totcategory: Totcategory,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            CategoryName: CategoryName
        };
        let pdfOption: any = null;
        let key = 'drsharerevenuesummarybycategory';
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
