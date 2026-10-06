import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.WorkOrderSampleDetailInstance, i.WorkOrderSampleDetailAttributes> {
    let WorkOrderSampleDetail =
        sequelize.define<i.WorkOrderSampleDetailInstance, i.WorkOrderSampleDetailAttributes>('WorkOrderSampleDetail', {
            Id: { type: DataTypes.BIGINT, field: 'WorkOrderSampleDetailId', primaryKey: true, autoIncrement: true },
            WorkOrderSampleId: { type: DataTypes.BIGINT, field: 'WorkOrderSampleId' },
            OrderDetailId: { type: DataTypes.BIGINT, field: 'OrderDetailId' },
            SampleIdentifier: { type: DataTypes.STRING, field: 'SampleIdentifier' },
            TestId: { type: DataTypes.BIGINT, field: 'TestId' },
            TestName: { type: DataTypes.STRING, field: 'TestName' },
            SamplePriorityId: { type: DataTypes.BIGINT, field: 'SamplePriorityId' },
            SampleDetailStatusId: { type: DataTypes.BIGINT, field: 'SampleDetailStatusId' },
            CollectedDate: { type: DataTypes.DATE, field: 'CollectedDate' },
            ReviewDate: { type: DataTypes.DATE, field: 'ReviewDate' },
            SampleTypeId: { type: DataTypes.BIGINT, field: 'SampleTypeId' },
            SampleType: { type: DataTypes.STRING, field: 'SampleType' },
            PatientWorkOrderId: { type: DataTypes.BIGINT, field: 'PatientWorkOrderId' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
            IsSeparateSampleId: { type: DataTypes.INTEGER, field: 'IsSeparateSampleId' },
        },
            {
                indexes: [],
                timestamps: true,
                tableName: 'workordersampledetails',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    },
                    order: [
                        ['SampleIdentifier', 'ASC']
                    ]
                }
            });

    (WorkOrderSampleDetail as any).associate = function (models: Models) {
        WorkOrderSampleDetail.belongsTo(models.Testmaster, { foreignKey: 'TestId' });
        WorkOrderSampleDetail.belongsTo(models.PatientOrderDetail, { foreignKey: 'OrderDetailId' });
        WorkOrderSampleDetail.belongsTo(models.ReferenceValue,
            { as: 'SampleStatus', foreignKey: 'SampleDetailStatusId', targetKey: 'ReferenceValueCodeId' });
        WorkOrderSampleDetail.belongsTo(models.ReferenceValue,
            { as: 'OrderPriority', foreignKey: 'SamplePriorityId', targetKey: 'ReferenceValueCodeId' });
    };

    return WorkOrderSampleDetail;
}
