import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.NotionalRentInstance, i.NotionalRentAttributes> {
    let NotionalRent = sequelize.define<i.NotionalRentInstance, i.NotionalRentAttributes>('NotionalRent', {
        Id: { type: DataTypes.BIGINT, field: 'NotionalRentId', primaryKey: true, autoIncrement: true },
        CostDetailId: { type: DataTypes.BIGINT, field: 'CostDetailId' },
        SurfaceArea: { type: DataTypes.BIGINT, field: 'SurfaceArea' },
		FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
       NotionalRent: { type: DataTypes.BIGINT, field: 'NotionalRent' },
        TotalNotionalRent: { type: DataTypes.DECIMAL, field: 'TotalNotionalRent' },
        NotionalRentProcedures: { type: DataTypes.DECIMAL, field: 'NotionalRentProcedures' },
        AvgProcedures: { type: DataTypes.DECIMAL, field: 'AvgProcedures' },
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
            tableName: 'notionalrent',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (NotionalRent as any).associate = function (models: Models) {
        //     NotionalRent.belongsTo(models.Department, { as: 'FromDepartment', foreignKey: 'FromDepartmentId' });
        //     NotionalRent.belongsTo(models.Department, { as: 'ToDepartment', foreignKey: 'ToDepartmentId' });
        //     NotionalRent.belongsTo(models.ReferenceValue, { as: 'NotionalRentStatus', targetKey: 'ReferenceValueCodeId' });
        //     NotionalRent.belongsTo(models.ReferenceValue, { as: 'RequestType', targetKey: 'ReferenceValueCodeId' });
        //     NotionalRent.belongsTo(models.ReferenceValue, { as: 'Seviority', targetKey: 'ReferenceValueCodeId' });
        //     NotionalRent.belongsTo(models.User, { as: 'Assigned', foreignKey: 'AssignedId' });
        //     NotionalRent.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        //     NotionalRent.belongsTo(models.ReferenceValue, { as: 'AssignType', targetKey: 'ReferenceValueCodeId' });
        //     NotionalRent.belongsTo(models.ReferenceValue, { as: 'Priority', targetKey: 'ReferenceValueCodeId' });
        //     NotionalRent.belongsTo(models.User, { as: 'CreatedById', foreignKey: 'CreatedBy' });
        //     NotionalRent.belongsTo(models.User, { as: 'CompletedBy', foreignKey: 'CompletedById' });
        //     NotionalRent.belongsTo(models.Asset, {as: 'Asset',foreignKey: 'AssetId' });
    };

    return NotionalRent;
}
