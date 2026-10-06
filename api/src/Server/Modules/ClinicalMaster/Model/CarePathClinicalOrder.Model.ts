import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.CarePathClinicalOrderInstance, i.CarePathClinicalOrderAttributes> {
    let CarePathClinicalOrder = sequelize.define<i.CarePathClinicalOrderInstance,
        i.CarePathClinicalOrderAttributes>('CarePathClinicalOrder', {
            Id: { type: DataTypes.BIGINT, field: 'CarePathClinicalOrderId', primaryKey: true, autoIncrement: true },
            CarePathId: { type: DataTypes.BIGINT, field: 'CarePathId' },
            TESTMASTERTYPId: { type: DataTypes.BIGINT, field: 'TESTMASTERTYPId' },
            TestName: { type: DataTypes.STRING, field: 'TestName' },
            TestmasterId: { type: DataTypes.BIGINT, field: 'TestmasterId' },
            Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
            Days: { type: DataTypes.INTEGER, field: 'Days' },
            LoginCode: { type: DataTypes.STRING, field: 'LoginCode' },
            Comments: { type: DataTypes.STRING, field: 'Comments' },
            IsManditory: { type: DataTypes.BOOLEAN, field: 'IsManditory' },
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
            tableName: 'carepathclinicalorders',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (CarePathClinicalOrder as any).associate = function(models: Models) {
                    CarePathClinicalOrder.belongsTo(models.Testmaster, { foreignKey: 'TestmasterId' });
                    CarePathClinicalOrder.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    CarePathClinicalOrder.belongsTo(models.ReferenceValue, { as: 'TESTMASTERTYP', targetKey: 'ReferenceValueCodeId' });
                };
 return CarePathClinicalOrder;
}
