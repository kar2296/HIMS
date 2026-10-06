import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';
export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.SurgeryRoomMasterInstance, i.SurgeryRoomMasterAttributes> {
    let SurgeryRoomMaster = sequelize.define<i.SurgeryRoomMasterInstance,
        i.SurgeryRoomMasterAttributes>('SurgeryRoomMaster', {
            Id: {
                type: DataTypes.BIGINT,
                field: 'SurgeryRoomId',
                primaryKey: true,
                autoIncrement: true
            },
            Code: { type: DataTypes.STRING, field: 'Code' },
            Name: { type: DataTypes.STRING, field: 'Name' },
            SurgeryRoomTypeId: { type: DataTypes.BIGINT, field: 'SurgeryRoomTypeId' },
            IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
            ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            FacilityId: { type: DataTypes.INTEGER, field: 'FacilityId' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' }
        }, {
            indexes: [],
            timestamps: true,
            tableName: 'surgeryroommasters',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (SurgeryRoomMaster as any).associate = function (models: any) {
        SurgeryRoomMaster.belongsTo(models.ReferenceValue, {
            as: 'SurgeryRoomType',
            foreignKey: 'SurgeryRoomTypeId',
            targetKey: 'ReferenceValueCodeId'
        });
        SurgeryRoomMaster.belongsTo(models.ReferenceValue, {
            as: 'ActiveStatus',
            foreignKey: 'ActiveStatusId',
            targetKey: 'ReferenceValueCodeId'
        });
    };
    return SurgeryRoomMaster;
}
