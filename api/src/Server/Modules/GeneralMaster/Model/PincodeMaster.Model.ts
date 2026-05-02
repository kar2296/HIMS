import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PincodeMasterInstance, i.PincodeMasterAttributes> {
    let PincodeMaster = sequelize.define<i.PincodeMasterInstance, i.PincodeMasterAttributes>('PincodeMaster', {
       Id: { type: DataTypes.BIGINT, field: 'PincodeId', primaryKey: true, autoIncrement: true  },
       Pincode: { type: DataTypes.STRING, field: 'Pincode' },
       Area: { type: DataTypes.STRING, field: 'Area' },
       CityId: { type: DataTypes.BIGINT, field: 'CityId' },
	     ActiveStatusId: { type: DataTypes.BIGINT, field: 'ActiveStatusId' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
       DistrictId: { type: DataTypes.BIGINT, field: 'DistrictId' },
       StateId: { type: DataTypes.BIGINT, field: 'StateId' },
       CountryId: { type: DataTypes.BIGINT, field: 'CountryId' },
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
            tableName: 'pincodemasters',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (PincodeMaster as any).associate = function(models: Models) {
                    PincodeMaster.belongsTo(models.DistrictMaster, {foreignKey: 'DistrictId'});
                    PincodeMaster.belongsTo(models.StateMaster, {foreignKey: 'StateId'});
                    PincodeMaster.belongsTo(models.CountryMaster, {foreignKey: 'CountryId'});
                    PincodeMaster.belongsTo(models.CityMaster, { foreignKey: 'CityId' });
					  PincodeMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return PincodeMaster;
}
