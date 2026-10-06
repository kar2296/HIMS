import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.OpticalItemMasterInstance, i.OpticalItemMasterAttributes> {
    let OpticalItemMaster = sequelize.define<i.OpticalItemMasterInstance, i.OpticalItemMasterAttributes>('OpticalItemMaster', {
       Id: { type: DataTypes.BIGINT, field: 'OpticalItemMasterId', primaryKey: true, autoIncrement: true  },
       FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
       OpticalProductTypeId: { type: DataTypes.BIGINT, field: 'OpticalProductTypeId' },
       ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
       ItemName: { type: DataTypes.STRING, field: 'ItemName' },
       Rate: { type: DataTypes.DECIMAL, field: 'Rate' },
       GSTPercentage: { type: DataTypes.DECIMAL, field: 'GSTPercentage' },
       HikePercentage: { type: DataTypes.DECIMAL, field: 'HikePercentage' },
       SalesPrice: { type: DataTypes.DECIMAL, field: 'SalesPrice' },
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
            tableName: 'opticalitemmaster',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (OpticalItemMaster as any).associate = function(models: Models) {
                     OpticalItemMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                     OpticalItemMaster.belongsTo(models.ReferenceValue, { as: 'OpticalProductType', targetKey: 'ReferenceValueCodeId' });
                     OpticalItemMaster.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
                };
 return OpticalItemMaster;
}
