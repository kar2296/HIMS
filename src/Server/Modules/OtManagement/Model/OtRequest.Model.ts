import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.OtRequestInstance, i.OtRequestAttributes> {
    let OtRequest = sequelize.define<i.OtRequestInstance, i.OtRequestAttributes>('OtRequest', {
        Id: { type: DataTypes.BIGINT, field: 'OTRequestId', primaryKey: true, autoIncrement: true },
        OTRequestTypeId: { type: DataTypes.BIGINT, field: 'OTRequestTypeId' },
        OTrequestNo: { type: DataTypes.STRING, field: 'OTrequestNo' },
        OTRequestedOn: { type: DataTypes.DATE, field: 'OTRequestedOn' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        ProcedureId: { type: DataTypes.BIGINT, field: 'ProcedureId' },
        OtTechnicianId: { type: DataTypes.STRING, field: 'OtTechnicianId' },
        ScurbNurseId: { type: DataTypes.STRING, field: 'ScurbNurseId' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        Startdate: { type: DataTypes.DATE, field: 'Startdate' },
        Enddate: { type: DataTypes.DATE, field: 'Enddate' },
        StartTime: { type: DataTypes.TIME, field: 'StartTime' },
        EndTime: { type: DataTypes.TIME, field: 'EndTime' },
        OTRoomId: { type: DataTypes.BIGINT, field: 'OTRoomId' },
        SurgeryCategoryId: { type: DataTypes.BIGINT, field: 'SurgeryCategoryId' },
        AnaesthesiaTypeId: { type: DataTypes.BIGINT, field: 'AnaesthesiaTypeId' },
        SurgeryTypeId: { type: DataTypes.BIGINT, field: 'SurgeryTypeId' },
        SurgeryId: { type: DataTypes.BIGINT, field: 'SurgeryId' },
        SurgeryName: { type: DataTypes.STRING, field: 'SurgeryName' },
        AdditionalSurgeryId: { type: DataTypes.BIGINT, field: 'AdditionalSurgeryId' },
        AdditionalSurgeryName: { type: DataTypes.STRING, field: 'AdditionalSurgeryName' },
        ChiefSurgeonId: { type: DataTypes.BIGINT, field: 'ChiefSurgeonId' },
        AssociateSurgeonId: { type: DataTypes.BIGINT, field: 'AssociateSurgeonId' },
        OtherSurgeon: { type: DataTypes.STRING, field: 'OtherSurgeon' },
        AssistantSurgeonId: { type: DataTypes.BIGINT, field: 'AssistantSurgeonId' },
        AnaesthesistId: { type: DataTypes.BIGINT, field: 'AnaesthesistId' },
        Equipments: { type: DataTypes.STRING, field: 'Equipments' },
        Instruments: { type: DataTypes.STRING, field: 'Instruments' },
        OTRequestStatusId: { type: DataTypes.BIGINT, field: 'OTRequestStatusId' },
        RemarksId: { type: DataTypes.BIGINT, field: 'RemarksId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
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
            tableName: 'otrequest',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (OtRequest as any).associate = function(models: Models) {
                    OtRequest.belongsTo(models.ReferenceValue, { as: 'OTRequestStatus', targetKey: 'ReferenceValueCodeId' });
        // OtRequest.belongsTo(models.ReferenceValue, { as: 'OTRoom', targetKey: 'ReferenceValueCodeId' });
        OtRequest.belongsTo(models.WardRoomMaster, { as: 'OTRoom', foreignKey: 'OTRoomId' });
                    OtRequest.belongsTo(models.ReferenceValue, { as: 'SurgeryType', targetKey: 'ReferenceValueCodeId' });
                    OtRequest.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
                    OtRequest.belongsTo(models.Patient);
                    OtRequest.belongsTo(models.Procedure, { foreignKey: 'SurgeryName' });
                    OtRequest.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
                };
 return OtRequest;
}
