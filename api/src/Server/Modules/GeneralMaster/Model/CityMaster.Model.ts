import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.CityMasterInstance, i.CityMasterAttributes> {
    let CityMaster = sequelize.define<i.CityMasterInstance, i.CityMasterAttributes>('CityMaster', {
        Id: { type: DataTypes.BIGINT, field: 'CityId', primaryKey: true, autoIncrement: true },
        CityName: { type: DataTypes.STRING, field: 'CityName' },
        CityCode: { type: DataTypes.STRING, field: 'CityCode' },
        StateId: { type: DataTypes.BIGINT, field: 'StateId' },
        CountryId: { type: DataTypes.BIGINT, field: 'CountryId' },
        DistrictId: { type: DataTypes.BIGINT, field: 'DistrictId' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
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
            tableName: 'citymasters',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (CityMaster as any).associate = function(models: Models) {
                    CityMaster.belongsTo(models.DistrictMaster, { foreignKey: 'DistrictId' });
                    CityMaster.belongsTo(models.StateMaster, { foreignKey: 'StateId' });
                    CityMaster.belongsTo(models.CountryMaster, { foreignKey: 'CountryId' });
                    CityMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });

                };
 return CityMaster;
}
