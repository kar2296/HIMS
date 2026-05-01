import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.WorkOrderSampleInstance, i.WorkOrderSampleAttributes> {
    let WorkOrderSample = sequelize.define<i.WorkOrderSampleInstance, i.WorkOrderSampleAttributes>('WorkOrderSample', {
       Id: { type: DataTypes.BIGINT, field: 'WorkOrderSampleId', primaryKey: true, autoIncrement: true  },
       WorkOrderId: { type: DataTypes.BIGINT, field: 'WorkOrderId' },
       PatientOrderId: { type: DataTypes.BIGINT, field: 'PatientOrderId' },
       PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
       Encounterid: { type: DataTypes.BIGINT, field: 'Encounterid' },
       SampleStatusId: { type: DataTypes.BIGINT, field: 'SampleStatusId' },
       SamplePriorityId: { type: DataTypes.BIGINT, field: 'SamplePriorityId' },
       LabAssignTypeId: { type: DataTypes.BIGINT, field: 'LabAssignTypeId' },
       RejectionComments: { type: DataTypes.STRING, field: 'RejectionComments' },
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
            tableName: 'workordersamples',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (WorkOrderSample as any).associate = function(models: Models) {
                    WorkOrderSample.belongsTo(models.Patient);
                    WorkOrderSample.belongsTo(models.PatientOrder, { foreignKey: 'PatientOrderId' });
                    WorkOrderSample.belongsTo(models.PatientWorkorder, { foreignKey: 'WorkOrderId' });
                    WorkOrderSample.belongsTo(models.OrderStatus, { foreignKey: 'SampleStatusId' });
                    WorkOrderSample.belongsTo(models.ReferenceValue, { as: 'OrderPriority',foreignKey:
                     'SamplePriorityId', targetKey: 'ReferenceValueCodeId' });
                    WorkOrderSample.belongsTo(models.Encounter, { foreignKey: 'Encounterid' });
                    WorkOrderSample.belongsTo(models.ReferenceValue, { as: 'LabAssignType', targetKey: 'ReferenceValueCodeId' });
                    WorkOrderSample.belongsTo(models.ReferenceValue, { as: 'SampleStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return WorkOrderSample;
}
