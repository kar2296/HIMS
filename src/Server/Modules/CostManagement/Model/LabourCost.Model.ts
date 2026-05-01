import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.LabourCostInstance, i.LabourCostAttributes> {
    let LabourCost = sequelize.define<i.LabourCostInstance, i.LabourCostAttributes>('LabourCost', {
        Id: { type: DataTypes.BIGINT, field: 'LabourCostId', primaryKey: true, autoIncrement: true },
        LabourCostId: { type: DataTypes.BIGINT, field: 'LabourCostId' },
        CostDetailId: { type: DataTypes.BIGINT, field: 'CostDetailId' },
        EmployeeTypeId: { type: DataTypes.BIGINT, field: 'EmployeeTypeId' },
        EmployeeId: { type: DataTypes.BIGINT, field: 'EmployeeId' },
        EmployeeName: { type: DataTypes.STRING, field: 'EmployeeName' },
        ProcedureCost: { type: DataTypes.DECIMAL, field: 'ProcedureCost' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        AvgProcedure: { type: DataTypes.DECIMAL, field: 'AvgProcedure' },
        CTC: { type: DataTypes.DECIMAL, field: 'CTC' },
        AdditionalCost: { type: DataTypes.DECIMAL, field: 'AdditionalCost' },
        TotalCTC: { type: DataTypes.DECIMAL, field: 'TotalCTC' },
        NetCTC: { type: DataTypes.DECIMAL, field: 'NetCTC' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
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
            tableName: 'labourcost',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (LabourCost as any).associate = function(models: any) {
        LabourCost.belongsTo(models.User, {as: 'empName', foreignKey: 'EmployeeId' });
        LabourCost.belongsTo(models.ReferenceValue, { as: 'EmployeeType', targetKey: 'ReferenceValueCodeId' });
    };
    return LabourCost as SequelizeStatic.Model<i.LabourCostInstance, i.LabourCostAttributes>;
}
