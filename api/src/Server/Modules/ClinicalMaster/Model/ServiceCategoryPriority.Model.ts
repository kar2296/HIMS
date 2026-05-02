import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ServiceCategoryPriorityInstance, i.ServiceCategoryPriorityAttributes> {
    let ServiceCategoryPriority = sequelize.define<i.ServiceCategoryPriorityInstance,
        i.ServiceCategoryPriorityAttributes>('ServiceCategoryPriority', {
       Id: { type: DataTypes.BIGINT, field: 'ServiceCategoryPriorityId', primaryKey: true, autoIncrement: true  },
       ServiceCategoryId: { type: DataTypes.BIGINT, field: 'ServiceCategoryId' },
       PriorityId: { type: DataTypes.BIGINT, field: 'PriorityId' },
       TurnAroundTime: { type: DataTypes.STRING, field: 'TurnAroundTime' },
       TurnAroundTimePeriodId: { type: DataTypes.BIGINT, field: 'TurnAroundTimePeriodId' },
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
            tableName: 'servicecategorypriorities',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (ServiceCategoryPriority as any).associate = function(models: Models) {
                    ServiceCategoryPriority.belongsTo(models.ReferenceValue, { as: 'OrderPriority',
                        foreignKey:'PriorityId', targetKey: 'ReferenceValueCodeId' });
                    ServiceCategoryPriority.belongsTo(models.ReferenceValue, { as: 'DurationPeriod',
                        foreignKey :'TurnAroundTimePeriodId',  targetKey: 'ReferenceValueCodeId' });
                };
 return ServiceCategoryPriority;
}
