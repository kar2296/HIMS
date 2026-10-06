import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientSampledetailsInstance, i.PatientSampledetailsAttributes> {
    let PatientSampledetails = sequelize.define<i.PatientSampledetailsInstance, i.PatientSampledetailsAttributes>('PatientSampledetails', {
        Id: { type: DataTypes.BIGINT, field: 'Sampledetailid', primaryKey: true, autoIncrement: true },
        Encountersorderid: { type: DataTypes.BIGINT, field: 'Encountersorderid' },
        Externalsampledid: { type: DataTypes.STRING, field: 'Externalsampledid' },
        Externalsamplecollectorname: { type: DataTypes.STRING, field: 'Externalsamplecollectorname' },
        Sampledid: { type: DataTypes.STRING, field: 'Sampledid' },
        Samplecollectedbyid: { type: DataTypes.BIGINT, field: 'Samplecollectedbyid' },
        Estimatedsamplingdatetime: { type: DataTypes.DATE, field: 'Estimatedsamplingdatetime' },
        Actualsamplingdatetime: { type: DataTypes.DATE, field: 'Actualsamplingdatetime' },
        Samplereceiveddatetime: { type: DataTypes.DATE, field: 'Samplereceiveddatetime' },
        Samplereceivedbyid: { type: DataTypes.BIGINT, field: 'Samplereceivedbyid' },
        Samplereceivedbyname: { type: DataTypes.STRING, field: 'Samplereceivedbyname' },
        Collectionarea: { type: DataTypes.STRING, field: 'Collectionarea' },
        Drawsiteid: { type: DataTypes.BIGINT, field: 'Drawsiteid' },
        Sampletypeid: { type: DataTypes.BIGINT, field: 'Sampletypeid' },
        Containertypeid: { type: DataTypes.BIGINT, field: 'Containertypeid' },
        Colorcode: { type: DataTypes.STRING, field: 'Colorcode' },
        Departments: { type: DataTypes.STRING, field: 'Departments' },
        Samplesharingstatuse: { type: DataTypes.INTEGER, field: 'Samplesharingstatuse' },
        Labelgenerationcount: { type: DataTypes.INTEGER, field: 'Labelgenerationcount' },
        Workareaid: { type: DataTypes.BIGINT, field: 'Workareaid' },
        Issampleinusee: { type: DataTypes.INTEGER, field: 'Issampleinusee' },
        Lastattendedbyid: { type: DataTypes.BIGINT, field: 'Lastattendedbyid' },
        Lastattendeddatetime: { type: DataTypes.DATE, field: 'Lastattendeddatetime' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        Reason: { type: DataTypes.STRING, field: 'Reason' },
        Extoid: { type: DataTypes.STRING, field: 'Extoid' },
        Tests: { type: DataTypes.STRING, field: 'Tests' },
        Issecondarye: { type: DataTypes.INTEGER, field: 'Issecondarye' },
        Orderprioritye: { type: DataTypes.INTEGER, field: 'Orderprioritye' },
        Transporttemperaturee: { type: DataTypes.INTEGER, field: 'Transporttemperaturee' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'patientsampledetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return PatientSampledetails;
}
