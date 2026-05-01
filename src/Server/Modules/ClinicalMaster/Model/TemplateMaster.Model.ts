import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.TemplateMasterInstance, i.TemplateMasterAttributes> {
    let TemplateMaster = sequelize.define<i.TemplateMasterInstance, i.TemplateMasterAttributes>('TemplateMaster', {
        Id: { type: DataTypes.BIGINT, field: 'TemplateMasterId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        Name: { type: DataTypes.STRING, field: 'Name' },
        TemplateTypeId: { type: DataTypes.BIGINT, field: 'TemplateTypeId' },
        AccessibleTypeId: { type: DataTypes.BIGINT, field: 'AccessibleTypeId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        UserId: { type: DataTypes.BIGINT, field: 'UserId' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        IsAllFacility: { type: DataTypes.BOOLEAN, field: 'IsAllFacility' },
        IsAllDepartment: { type: DataTypes.BOOLEAN, field: 'IsAllDepartment' },
        IsAllUser: { type: DataTypes.BOOLEAN, field: 'IsAllUser' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        DrugAdvice: { type: DataTypes.STRING, field: 'DrugAdvice' },
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
            tableName: 'hims_templatemasters',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (TemplateMaster as any).associate = function (models: Models) {
        TemplateMaster.belongsTo(models.Facility);
        TemplateMaster.belongsTo(models.Department);
        TemplateMaster.belongsTo(models.User);
        TemplateMaster.hasMany(models.TemplateMasterDetail);
        TemplateMaster.belongsTo(models.ReferenceValue, { as: 'TemplateType', targetKey: 'ReferenceValueCodeId' });
        TemplateMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        TemplateMaster.belongsTo(models.ReferenceValue, { as: 'AccessibleType', targetKey: 'ReferenceValueCodeId' });
    };
    return TemplateMaster;
}
