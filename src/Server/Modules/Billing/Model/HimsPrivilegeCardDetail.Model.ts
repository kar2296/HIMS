import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PrivilegeCardDetailInstance, i.PrivilegeCardDetailAttributes> {
    let PrivilegeCardDetail = sequelize.define<i.PrivilegeCardDetailInstance, i.PrivilegeCardDetailAttributes>('PrivilegeCardDetail', {
        Id: { type: DataTypes.BIGINT, field: 'PrivilegeCardDetailId', primaryKey: true, autoIncrement: true },
        PrivilegeCardId: { type: DataTypes.INTEGER, field: 'PrivilegeCardId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        TitleId: { type: DataTypes.BIGINT, field: 'TitleId' },
        FirstName: { type: DataTypes.STRING, field: 'FirstName' },
        LastName: { type: DataTypes.STRING, field: 'LastName' },
        Age: { type: DataTypes.STRING, field: 'Age' },
        DOB: { type: DataTypes.DATE, field: 'DOB' },
        MobileNo: { type: DataTypes.STRING, field: 'MobileNo' },
        GenderId: { type: DataTypes.INTEGER, field: 'GenderId' },
        Address: { type: DataTypes.STRING, field: 'Address' },
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
            tableName: 'privilegecarddetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PrivilegeCardDetail as any).associate = function (models: Models) {
        PrivilegeCardDetail.belongsTo(models.ReferenceValue, { as: 'Title', targetKey: 'ReferenceValueCodeId' });
        PrivilegeCardDetail.belongsTo(models.ReferenceValue, {
            as: 'Gender',
            targetKey: 'ReferenceValueCodeId'
        });
    };
    return PrivilegeCardDetail;
}
