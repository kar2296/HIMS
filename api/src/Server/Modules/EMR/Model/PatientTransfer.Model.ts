import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientTransferInstance, i.PatientTransferAttributes> {
    let PatientTransfer = sequelize.define<i.PatientTransferInstance, i.
        PatientTransferAttributes>('PatientTransfer', {
            Id: { type: DataTypes.BIGINT, field: 'PatientTransferId', primaryKey: true, autoIncrement: true },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            TransferDate: { type: DataTypes.DATE, field: 'TransferDate' },
            ReferralDeptartmentId: { type: DataTypes.BIGINT, field: 'ReferralDeptartmentId' },
            DeptartmentComments: { type: DataTypes.STRING, field: 'DeptartmentComments' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            FacilityDeptartmentId: { type: DataTypes.BIGINT, field: 'FacilityDeptartmentId' },
            FacilityComments: { type: DataTypes.STRING, field: 'FacilityComments' },
            TransRefDischargeTypeId: { type: DataTypes.BIGINT, field: 'TransRefDischargeTypeId' },
            AdmissionDepartmentId: { type: DataTypes.BIGINT, field: 'AdmissionDepartmentId' },
            AdmissionWardId: { type: DataTypes.BIGINT, field: 'AdmissionWardId' },
            ReferOtherFacilityId: { type: DataTypes.BIGINT, field: 'ReferOtherFacilityId' },
            ReferOtherDepartmentId: { type: DataTypes.BIGINT, field: 'ReferOtherDepartmentId' },
            DischargeComments: { type: DataTypes.STRING, field: 'DischargeComments' },
            ReferOtherComments: { type: DataTypes.STRING, field: 'ReferOtherComments' },
            FromFcilityId: { type: DataTypes.BIGINT, field: 'FromFcilityId' },
            FromDepartmentId: { type: DataTypes.BIGINT, field: 'FromDepartmentId' },
            Reviewed: { type: DataTypes.BOOLEAN, field: 'Reviewed' },
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
            tableName: 'patienttransfer',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientTransfer as any).associate = function (models: Models) {
        PatientTransfer.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        PatientTransfer.belongsTo(models.Encounter);
        PatientTransfer.belongsTo(models.Department, { as: 'FromDepartment', foreignKey: 'FromDepartmentId' });
        PatientTransfer.belongsTo(models.Facility, { as: 'FromFcility', foreignKey: 'FromFcilityId' });
        PatientTransfer.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        PatientTransfer.belongsTo(models.Department, { as: 'ReferralDeptartment', foreignKey: 'ReferralDeptartmentId' });
        PatientTransfer.belongsTo(models.Department, { as: 'FacilityDeptartment', foreignKey: 'FacilityDeptartmentId' });
        PatientTransfer.belongsTo(models.Department, { as: 'AdmissionDepartment', foreignKey: 'AdmissionDepartmentId' });
        PatientTransfer.belongsTo(models.WardMaster, { as: 'AdmissionWard', foreignKey: 'AdmissionWardId' });
        PatientTransfer.belongsTo(models.ReferenceValue, { as: 'TransRefDischargeType', targetKey: 'ReferenceValueCodeId' });
        PatientTransfer.belongsTo(models.Facility, { as: 'ReferOtherFacility', foreignKey: 'ReferOtherFacilityId' });
        PatientTransfer.belongsTo(models.Department, { as: 'ReferOtherDepartment', foreignKey: 'ReferOtherDepartmentId' });
        PatientTransfer.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
    };
    return PatientTransfer;
}
