import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';
export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ServiceCategoryInstance, i.ServiceCategoryAttributes> {
    let ServiceCategory = sequelize.define<i.ServiceCategoryInstance, i.ServiceCategoryAttributes>('ServiceCategory', {
       Id: { type: DataTypes.BIGINT, field: 'ServiceCategoryId', primaryKey: true, autoIncrement: true  },
       ParentServiceCategoryId: { type: DataTypes.BIGINT, field: 'ParentServiceCategoryId' },
       ServiceCategoryCode: { type: DataTypes.STRING, field: 'ServiceCategoryCode' },
       ServiceCategoryName: { type: DataTypes.STRING, field: 'ServiceCategoryName' },
       Description: { type: DataTypes.STRING, field: 'Description' },
       ServiceGroupId: { type: DataTypes.BIGINT, field: 'ServiceGroupId' },
       OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
       FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
       DisplayOrder: { type: DataTypes.INTEGER, field: 'DisplayOrder' },
       PrintOrder: { type: DataTypes.INTEGER, field: 'PrintOrder' },
       StatusId: { type: DataTypes.BOOLEAN, field: 'StatusId' },
       IsDiagnosisMandatory: { type: DataTypes.BOOLEAN, field: 'IsDiagnosisMandatory' },
       IsGenerateDoctorInvoice: { type: DataTypes.BOOLEAN, field: 'IsGenerateDoctorInvoice' },
       IsDoctorMandatory: { type: DataTypes.BOOLEAN, field: 'IsDoctorMandatory' },
       IsDoctorShare: { type: DataTypes.BOOLEAN, field: 'IsDoctorShare' },
       ShowPopUpWhileOrder: { type: DataTypes.BOOLEAN, field: 'ShowPopUpWhileOrder' },
       ShowDuplicateEntry: { type: DataTypes.BOOLEAN, field: 'ShowDuplicateEntry' },
       ShowRefuseToBuy: { type: DataTypes.BOOLEAN, field: 'ShowRefuseToBuy' },
       IsAllFacility: { type: DataTypes.BOOLEAN, field: 'IsAllFacility' },
       Status: { type: DataTypes.INTEGER, field: 'Status' },
       Rev: { type: DataTypes.INTEGER, field: 'Rev' },
       CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
       CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
       UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
       UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'servicecategories',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });
     (ServiceCategory as any).associate = function(models: any) {
                    ServiceCategory.hasMany(models.ServiceCategoryPriority, {as : 'Priorities'});
                };
 return ServiceCategory;
}
