import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AllergyMasterInstance, i.AllergyMasterAttributes> {
    let AllergyMaster = sequelize.define<i.AllergyMasterInstance, i.AllergyMasterAttributes>('AllergyMaster', {
        Id: { type: DataTypes.BIGINT, field: 'AllergyId', primaryKey: true, autoIncrement: true },
        DisplayId: { type: DataTypes.STRING, field: 'DisplayId' },
        AllergyName: { type: DataTypes.STRING, field: 'AllergyName' },
        AllergyTypeId: { type: DataTypes.BIGINT, field: 'AllergyTypeId' },
        AllergyEventTypeId: { type: DataTypes.BIGINT, field: 'AllergyEventTypeId' },
        GenericId: { type: DataTypes.BIGINT, field: 'GenericId' },
        DietItemId: { type: DataTypes.BIGINT, field: 'DietItemId' },
        ReferrenceLink: { type: DataTypes.STRING, field: 'ReferrenceLink' },
        GenericName: { type: DataTypes.STRING, field: 'GenericName' },
        GenericCode: { type: DataTypes.STRING, field: 'GenericCode' },
        DietName: { type: DataTypes.STRING, field: 'DietName' },
        DietCode: { type: DataTypes.STRING, field: 'DietCode' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
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
            tableName: 'allergymasters',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (AllergyMaster as any).associate = function(models: Models) {
                    AllergyMaster.belongsTo(models.ReferenceValue, { as: 'AllergyType', targetKey: 'ReferenceValueCodeId' });
                    AllergyMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return AllergyMaster;
}
