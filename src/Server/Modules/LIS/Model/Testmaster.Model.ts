import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.TestmasterInstance, i.TestmasterAttributes> {
    let Testmaster = sequelize.define<i.TestmasterInstance, i.TestmasterAttributes>('Testmaster', {
        Id: { type: DataTypes.BIGINT, field: 'TestmasterId', primaryKey: true, autoIncrement: true },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        TESTMASTERTYPId: { type: DataTypes.BIGINT, field: 'TESTMASTERTYPId' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        Name: { type: DataTypes.STRING, field: 'Name' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        Mnemonics: { type: DataTypes.STRING, field: 'Mnemonics' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        SubDepartmentId: { type: DataTypes.BIGINT, field: 'SubDepartmentId' },
        TestFromLocationId: { type: DataTypes.BIGINT, field: 'TestFromLocationId' },
        TestToLocationId: { type: DataTypes.BIGINT, field: 'TestToLocationId' },
        SampletypeId: { type: DataTypes.BIGINT, field: 'SampletypeId' },
        SideId: { type: DataTypes.BIGINT, field: 'SideId' },
        TestMasterPositionId: { type: DataTypes.BIGINT, field: 'TestMasterPositionId' },
        SampleVolume: { type: DataTypes.STRING, field: 'SampleVolume' },
        ContainertypeId: { type: DataTypes.BIGINT, field: 'ContainertypeId' },
        ScheduleSU: { type: DataTypes.BOOLEAN, field: 'ScheduleSU' },
        ScheduleMO: { type: DataTypes.BOOLEAN, field: 'ScheduleMO' },
        ScheduleTU: { type: DataTypes.BOOLEAN, field: 'ScheduleTU' },
        ScheduleWE: { type: DataTypes.BOOLEAN, field: 'ScheduleWE' },
        ScheduleTH: { type: DataTypes.BOOLEAN, field: 'ScheduleTH' },
        ScheduleFR: { type: DataTypes.BOOLEAN, field: 'ScheduleFR' },
        ScheduleSA: { type: DataTypes.BOOLEAN, field: 'ScheduleSA' },
        ScheduleALL: { type: DataTypes.BOOLEAN, field: 'ScheduleALL' },
        CutOffTime: { type: DataTypes.INTEGER, field: 'CutOffTime' },
        Footer: { type: DataTypes.STRING, field: 'Footer' },
        IsConfidential: { type: DataTypes.BOOLEAN, field: 'IsConfidential' },
        IsNotifyLab: { type: DataTypes.BOOLEAN, field: 'IsNotifyLab' },
        RefLink: { type: DataTypes.STRING, field: 'RefLink' },
        Methodology: { type: DataTypes.STRING, field: 'Methodology' },
        TransportTemp: { type: DataTypes.STRING, field: 'TransportTemp' },
        TATInHours: { type: DataTypes.INTEGER, field: 'TATInHours' },
        Stability: { type: DataTypes.STRING, field: 'Stability' },
        CollectionInst: { type: DataTypes.STRING, field: 'CollectionInst' },
        SpecimenPreparation: { type: DataTypes.STRING, field: 'SpecimenPreparation' },
        UnacceptableConditions: { type: DataTypes.STRING, field: 'UnacceptableConditions' },
        PatientPreparation: { type: DataTypes.STRING, field: 'PatientPreparation' },
        MinSampleVolume: { type: DataTypes.INTEGER, field: 'MinSampleVolume' },
        SampleDisplay: { type: DataTypes.STRING, field: 'SampleDisplay' },
        TATGroup_e: { type: DataTypes.BIGINT, field: 'TATGroup_e' },
        DisplayOrder: { type: DataTypes.INTEGER, field: 'DisplayOrder' },
        PrintOrder: { type: DataTypes.INTEGER, field: 'PrintOrder' },
        TATIgnoreHoliday: { type: DataTypes.BOOLEAN, field: 'TATIgnoreHoliday' },
        AuthorizationRequired: { type: DataTypes.BOOLEAN, field: 'AuthorizationRequired' },
        SpecialApprovalRequired: { type: DataTypes.BOOLEAN, field: 'SpecialApprovalRequired' },
        RepeatAllowed: { type: DataTypes.BOOLEAN, field: 'RepeatAllowed' },
        ProcessTime: { type: DataTypes.INTEGER, field: 'ProcessTime' },
        IsProfile: { type: DataTypes.BOOLEAN, field: 'isProfile' },
        ParentProfileId: { type: DataTypes.BIGINT, field: 'ParentProfileId' },
        ResourceId: { type: DataTypes.BIGINT, field: 'ResourceId' },
        Activefrom: { type: DataTypes.DATE, field: 'Activefrom' },
        Activeto: { type: DataTypes.DATE, field: 'Activeto' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        IsFreeBill: { type: DataTypes.BOOLEAN, field: 'IsFreeBill' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        IsSeparateWorkOrder: { type: DataTypes.BOOLEAN, field: 'IsSeparateWorkOrder' },
        IsSeparateSampleId: { type: DataTypes.BOOLEAN, field: 'IsSeparateSampleId' },
        IsDirectBill: { type: DataTypes.BOOLEAN, field: 'IsDirectBill' },
        IsCulture: { type: DataTypes.BOOLEAN, field: 'IsCulture' },
        IsNABLTest: { type: DataTypes.BOOLEAN, field: 'IsNABLTest' },
        IsRISSync: { type: DataTypes.BOOLEAN, field: 'IsRISSync' },
        IsExcelUpload: { type: DataTypes.BOOLEAN, field: 'IsExcelUpload' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'testmaster',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (Testmaster as any).associate = function (models: Models) {
        Testmaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        Testmaster.belongsTo(models.ReferenceValue, { as: 'TestMasterPosition', targetKey: 'ReferenceValueCodeId' });
        Testmaster.belongsTo(models.ReferenceValue, { as: 'Side', targetKey: 'ReferenceValueCodeId' });
        Testmaster.belongsTo(models.ReferenceValue, { as: 'TESTMASTERTYP', targetKey: 'ReferenceValueCodeId' });
        Testmaster.belongsTo(models.Department, { as: 'Department', foreignKey: 'DepartmentId' });
        Testmaster.belongsTo(models.Department, { as: 'SubDepartment', foreignKey: 'SubDepartmentId' });
        Testmaster.belongsTo(models.Sampletype, { foreignKey: 'SampletypeId' });
        Testmaster.belongsToMany(models.Analytemaster, { through: models.Testmasteranalytemap });
        Testmaster.belongsTo(models.ServiceItem, { foreignKey: 'TestmasterId', targetKey: 'MasterItemId' });
        Testmaster.hasMany(models.Testmasteranalytemap, { as: 'TestOrProfiles' });
        Testmaster.hasMany(models.PriceMapping, { foreignKey: 'TestId', as: 'ExternalProviderPriceMap' });
        Testmaster.belongsTo(models.TestmasterTemplate, { foreignKey: 'TestmasterId', targetKey: 'TestmasterId' });
    };
    return Testmaster;
}
