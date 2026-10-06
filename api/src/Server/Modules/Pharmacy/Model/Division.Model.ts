import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.DivisionInstance, i.DivisionAttributes> {
    let Division = sequelize.define<i.DivisionInstance, i.DivisionAttributes>('Division', {
        Id: { type: DataTypes.BIGINT, field: 'DivisionId', primaryKey: true, autoIncrement: true },
        DivisionCode: { type: DataTypes.STRING, field: 'DivisionCode' },
        DivisionName: { type: DataTypes.STRING, field: 'DivisionName' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        OrganizationId: { type: DataTypes.INTEGER, field: 'OrganizationId' },
        FacilityId: { type: DataTypes.INTEGER, field: 'FacilityId' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'hims_division',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (Division as any).associate = function(models: Models) {
                    Division.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return Division;
}
