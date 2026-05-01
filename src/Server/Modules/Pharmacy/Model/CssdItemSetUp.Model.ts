import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.CssdItemSetUpInstance, i.CssdItemSetUpAttributes> {
    let CssdItemSetUp = sequelize.define<i.CssdItemSetUpInstance, i.CssdItemSetUpAttributes>('CssdItemSetUp', {
        Id: { type: DataTypes.BIGINT, field: 'CssdItemSetUpId', primaryKey: true, autoIncrement: true },
        ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
        ItemName: { type: DataTypes.STRING, field: 'ItemName' },
        ItemMasterId: { type: DataTypes.STRING, field: 'ItemMasterId' },
        StoreMasterId: { type: DataTypes.STRING, field: 'StoreMasterId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        CSSDTypeId: { type: DataTypes.BIGINT, field: 'CSSDTypeId' },
        UsageTypeId: { type: DataTypes.BIGINT, field: 'UsageTypeId' },
        IsReusable: { type: DataTypes.BOOLEAN, field: 'IsReusable' },
        MaxUsage: { type: DataTypes.BOOLEAN, field: 'MaxUsage' },
        MinUsage: { type: DataTypes.BOOLEAN, field: 'MinUsage' },
        PackingTypeId: { type: DataTypes.BIGINT, field: 'PackingTypeId' },
        ProductTypeId: { type: DataTypes.BIGINT, field: 'ProductTypeId' },
        IsSterilizationRequired: { type: DataTypes.BOOLEAN, field: 'IsSterilizationRequired' },
        IsWashingRequired: { type: DataTypes.BOOLEAN, field: 'IsWashingRequired' },
        WashingTypeId: { type: DataTypes.BIGINT, field: 'WashingTypeId' },
        IsPackingRequired: { type: DataTypes.BOOLEAN, field: 'IsPackingRequired' },
        SterileTemperature: { type: DataTypes.STRING, field: 'SterileTemperature' },
        Instructions: { type: DataTypes.STRING, field: 'Instructions' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        Activefrom: { type: DataTypes.DATE, field: 'Activefrom' },
        Activeto: { type: DataTypes.DATE, field: 'Activeto' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
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
            tableName: 'cssditemsetup',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (CssdItemSetUp as any).associate = function(models: Models) {
                    // CarePath.belongsTo(models.Speciality);
                    // CarePath.belongsTo(models.Department);
                    // CarePath.belongsTo(models.Diagnosis);
                    CssdItemSetUp.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return CssdItemSetUp;
}
