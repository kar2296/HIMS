import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.InvWorkorderDetailInstance, i.InvWorkorderDetailAttributes> {
    let InvWorkorderDetail = sequelize.define
        <i.InvWorkorderDetailInstance, i.InvWorkorderDetailAttributes>('InvWorkorderDetail', {
            Id: { type: DataTypes.BIGINT, field: 'InvWorkorderDetailId', primaryKey: true, autoIncrement: true },
            InvWorkorderId: { type: DataTypes.BIGINT, field: 'InvWorkorderId' },
            ParticularId: { type: DataTypes.BIGINT, field: 'ParticularId' },
            ParticularHead: { type: DataTypes.STRING, field: 'ParticularHead' },
            Particulars: { type: DataTypes.STRING, field: 'Particulars' },
            Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
            SACCode: { type: DataTypes.INTEGER, field: 'SACCode' },
            Amount: { type: DataTypes.DECIMAL, field: 'Amount' },
            DiscountModeId: { type: DataTypes.BIGINT, field: 'DiscountModeId' },
            Discount: { type: DataTypes.DECIMAL, field: 'Discount' },
            GstId: { type: DataTypes.BIGINT, field: 'GstId' },
            GstPercentage: { type: DataTypes.DECIMAL, field: 'GstPercentage' },
            TaxAmount: { type: DataTypes.DECIMAL, field: 'TaxAmount' },
            GrossAmount: { type: DataTypes.DECIMAL, field: 'GrossAmount' },
            NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
            Remarks: { type: DataTypes.STRING, field: 'Remarks' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' }
        },
            {
                indexes: [],
                timestamps: true,
                tableName: 'inventoryworkorderdetail',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (InvWorkorderDetail as any).associate = function (models: Models) {
        InvWorkorderDetail.belongsTo(models.ReferenceValue, { as: 'DiscountMode', targetKey: 'ReferenceValueCodeId' });
        InvWorkorderDetail.belongsTo(models.InvWorkorder, { as: 'InvWorkorder', foreignKey: 'InvWorkorderId' });
    };

    return InvWorkorderDetail;
}


