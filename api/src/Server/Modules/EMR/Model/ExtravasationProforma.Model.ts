import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ExtravasationProformaInstance, i.ExtravasationProformaAttributes> {
    let ExtravasationProforma =
    sequelize.define<i.ExtravasationProformaInstance, i.ExtravasationProformaAttributes>('ExtravasationProforma', {
        Id: { type: DataTypes.BIGINT, field: 'PatientExtravasationProformaId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        ExtravasationDateTime: { type: DataTypes.DATE, field: 'ExtravasationDateTime' },
        ExtravasationProformaTypeId: { type: DataTypes.INTEGER, field: 'ExtravasationProformaTypeId' },
        ExtravasationProformaStatusId: { type: DataTypes.INTEGER, field: 'ExtravasationProformaStatusId' },
        MethodOfDrug: { type: DataTypes.STRING, field: 'MethodOfDrug' },
        IVsiteLocation: { type: DataTypes.STRING, field: 'IVsiteLocation' },
        EstimateAmount: { type: DataTypes.STRING, field: 'EstimateAmount' },
        NeedleType: { type: DataTypes.STRING, field: 'NeedleType' },
        IVsiteAppearance: { type: DataTypes.STRING, field: 'IVsiteAppearance' },
        InchargeDoctor: { type: DataTypes.STRING, field: 'InchargeDoctor' },
        DoctorNotes: { type: DataTypes.STRING, field: 'DoctorNotes' },
        InchargeNurse: { type: DataTypes.STRING, field: 'InchargeNurse' },
        PatientComplaints: { type: DataTypes.STRING, field: 'PatientComplaints' },
        StopDrug: { type: DataTypes.STRING, field: 'StopDrug' },
        ExtravasatedArea: { type: DataTypes.STRING, field: 'ExtravasatedArea' },
        AspirateResidual: { type: DataTypes.STRING, field: 'AspirateResidual' },
        AmountAspiratedMls: { type: DataTypes.STRING, field: 'AmountAspiratedMls' },
        Antidote: { type: DataTypes.STRING, field: 'Antidote' },
        ColdCompresses: { type: DataTypes.STRING, field: 'ColdCompresses' },
        WarmCompresses: { type: DataTypes.STRING, field: 'WarmCompresses' },
        Elevateextremity: { type: DataTypes.STRING, field: 'Elevateextremity' },
        Baselinephoto: { type: DataTypes.STRING, field: 'Baselinephoto' },
        Dressingapplied: { type: DataTypes.STRING, field: 'Dressingapplied' },
        TypeofAntibiotic: { type: DataTypes.STRING, field: 'TypeofAntibiotic' },
        DurationofAntibiotic: { type: DataTypes.STRING, field: 'DurationofAntibiotic' },
        HealingOfWound: { type: DataTypes.STRING, field: 'HealingOfWound' },
        IsAntibiotics: { type: DataTypes.BOOLEAN, field: 'IsAntibiotics' },
        IsSurgicalIntervention: { type: DataTypes.BOOLEAN, field: 'IsSurgicalIntervention' },
        IsDelayTreatment: { type: DataTypes.BOOLEAN, field: 'IsDelayTreatment' },
        IsMovements: { type: DataTypes.BOOLEAN, field: 'IsMovements' },
        PhotoAfterextravasation: { type: DataTypes.STRING, field: 'PhotoAfterextravasation' },
        PhotoAfterHealing: { type: DataTypes.STRING, field: 'PhotoAfterHealing' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        ApprovedBy: { type: DataTypes.INTEGER, field: 'ApprovedBy' },
        ApprovedAt: { type: DataTypes.DATE, field: 'ApprovedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'patientextravasationproforma',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (ExtravasationProforma as any).associate = function (models: Models) {
        ExtravasationProforma.belongsTo(models.Facility);
        ExtravasationProforma.belongsTo(models.Patient);
        ExtravasationProforma.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        ExtravasationProforma.belongsTo(models.User, { as: 'UpdatedUser', foreignKey: 'UpdatedBy' });
        ExtravasationProforma.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'ApprovedBy' });
        ExtravasationProforma.belongsTo(models.ReferenceValue, { as: 'ExtravasationProformaType', targetKey: 'ReferenceValueCodeId' });
        ExtravasationProforma.belongsTo(models.ReferenceValue, { as: 'ExtravasationProformaStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return ExtravasationProforma;
}
