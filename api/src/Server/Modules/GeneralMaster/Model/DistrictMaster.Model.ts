import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.DistrictMasterInstance, i.DistrictMasterAttributes> {
    let DistrictMaster = sequelize.define<i.DistrictMasterInstance, i.DistrictMasterAttributes>('DistrictMaster', {
        Id: { type: DataTypes.BIGINT, field: 'DistrictId', primaryKey: true, autoIncrement: true },
        DistrictId: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.getDataValue('Id');
            }
        },
        DistrictName: { type: DataTypes.STRING, field: 'DistrictName' },
        DistrictCode: { type: DataTypes.STRING, field: 'DistrictCode' },
        StateId: { type: DataTypes.BIGINT, field: 'StateId' },
        CountryId: { type: DataTypes.BIGINT, field: 'CountryId' },
        ActiveStatusId: { type: DataTypes.BIGINT, field: 'ActiveStatusId' },
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
            tableName: 'districtmasters',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (DistrictMaster as any).associate = function(models: Models) {
                    DistrictMaster.belongsTo(models.CountryMaster, { foreignKey: 'CountryId' });
                    DistrictMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    DistrictMaster.belongsTo(models.StateMaster, { foreignKey: 'StateId' });
                };
 return DistrictMaster;
}
