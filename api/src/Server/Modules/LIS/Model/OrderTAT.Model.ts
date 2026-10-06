import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.OrderTATInstance, i.OrderTATAttributes> {
    let OrderTAT = sequelize.define<i.OrderTATInstance, i.OrderTATAttributes>('OrderTAT', {
       Id: { type: DataTypes.BIGINT, field: 'OrderTATId', primaryKey: true, autoIncrement: true  },
       PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
       PatientOrderId: { type: DataTypes.BIGINT, field: 'PatientOrderId' },
       PatientOrderDetailId: { type: DataTypes.BIGINT, field: 'PatientOrderDetailId' },
       WorkOrderId: { type: DataTypes.BIGINT, field: 'WorkOrderId' },
       DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
       TestId: { type: DataTypes.BIGINT, field: 'TestId' },
       TestName: { type: DataTypes.STRING, field: 'TestName' },
       OrderedOn: { type: DataTypes.DATE, field: 'OrderedOn' },
       AcceptedOn: { type: DataTypes.DATE, field: 'AcceptedOn' },
       SampleCollectedOn: { type: DataTypes.DATE, field: 'SampleCollectedOn' },
       SampleReceivedOn: { type: DataTypes.DATE, field: 'SampleReceivedOn' },
       AssignedOn: { type: DataTypes.DATE, field: 'AssignedOn' },
       TechValidationOn: { type: DataTypes.DATE, field: 'TechValidationOn' },
       MedValidationOn: { type: DataTypes.DATE, field: 'MedValidationOn' },
       ReleasedOn: { type: DataTypes.DATE, field: 'ReleasedOn' },
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
            tableName: 'ordertat',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (OrderTAT as any).associate = function(models: Models) {
                    OrderTAT.belongsTo(models.Patient);
                    OrderTAT.belongsTo(models.PatientOrder, { foreignKey: 'PatientOrderId' });
                    OrderTAT.belongsTo(models.PatientOrderDetail, { foreignKey: 'PatientOrderDetailId' });
                    OrderTAT.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
                    OrderTAT.belongsTo(models.User, { as: 'Updateduser', foreignKey: 'UpdatedBy' });
                    OrderTAT.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        OrderTAT.belongsTo(models.PatientWorkorder, { foreignKey: 'WorkOrderId' });

                };
 return OrderTAT;
}
