import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.DrugFrequencyCategoryInstance, i.DrugFrequencyCategoryAttributes> {
    let DrugFrequencyCategory = sequelize.define<i.DrugFrequencyCategoryInstance,
     i.DrugFrequencyCategoryAttributes>('DrugFrequencyCategory', {
       Id: { type: DataTypes.BIGINT, field: 'DrugFrequencyCategoryId', primaryKey: true, autoIncrement: true  },
       DrugFrequencyId: { type: DataTypes.BIGINT, field: 'DrugFrequencyId' },
       FrequencyCategoryId: { type: DataTypes.BIGINT, field: 'FrequencyCategoryId' },
       ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
       ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
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
            tableName: 'drugfrequencycategories',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (DrugFrequencyCategory as any).associate = function(models: Models) {
                    DrugFrequencyCategory.belongsTo(models.ReferenceValue, { as: 'FrequencyCategory', targetKey: 'ReferenceValueCodeId' });
                };
 return DrugFrequencyCategory;
}
