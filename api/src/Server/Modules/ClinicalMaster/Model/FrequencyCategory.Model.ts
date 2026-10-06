import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.FrequencyCategoryInstance, i.FrequencyCategoryAttributes> {
    let FrequencyCategory = sequelize.define<i.FrequencyCategoryInstance, i.FrequencyCategoryAttributes>('FrequencyCategory', {
       Id: { type: DataTypes.BIGINT, field: 'FrequencyCategoryId', primaryKey: true, autoIncrement: true  },
       FrequencyId: { type: DataTypes.BIGINT, field: 'FrequencyId' },
       ClinicalFrequencyCategoryId: { type: DataTypes.BIGINT, field: 'ClinicalFrequencyCategoryId' },
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
            tableName: 'frequencycategories',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (FrequencyCategory as any).associate = function(models: Models) {
                    FrequencyCategory.belongsTo(models.ReferenceValue,
                     { as: 'ClinicalFrequencyCategory', targetKey: 'ReferenceValueCodeId' });
                };
 return FrequencyCategory;
}
