import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, AuthorizationService } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientClinicalNotesInstance, PatientClinicalNotesAttributes } from '../Model/Interface/Index';
import { PatientClinicalNotesFilters } from '../Common/Filters.e';

export class PatientClinicalNotesBo extends BaseBo<PatientClinicalNotesInstance, PatientClinicalNotesAttributes>  {
    private checkAuthorization(facilityId?: number): void {
        const session = this.GetSession();
        const allowed = AuthorizationService.hasClinicalEditPermission(session, facilityId);
        AuthorizationService.assertPermission(allowed, 'Access Denied: You do not have clinical edit permissions');
    }

    public async AddPatientClinicalNotes(req: BaseRequest): Promise<number> {
        this.checkAuthorization(req.Data?.FacilityId);
        if (!req.Data.NoteStatus) {
            req.Data.NoteStatus = 1; // Default to Draft
        }
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientClinicalNotes(req: BaseRequest): Promise<boolean> {
        this.checkAuthorization(req.Data?.FacilityId);
        if (req.Data && req.Data.Id) {
            let existing = await this.GetById(req.Data.Id);
            if (existing && existing.dataValues && existing.dataValues.NoteStatus >= 2) {
                const err: any = new Error('Cannot update a signed or amended clinical note. Use AmendPatientClinicalNote to record amendments.');
                err.statusCode = 409;
                err.code = 'NOTE_ALREADY_SIGNED';
                throw err;
            }
        }
        let result = await this.Update(req.Data);
        return result;
    }

    public async SignPatientClinicalNote(req: BaseRequest): Promise<boolean> {
        this.checkAuthorization(req.Data?.FacilityId);
        const noteId = req.Data ? (req.Data.Id || req.Id) : req.Id;
        let existing = await this.GetById(noteId);
        if (!existing) {
            const err: any = new Error('Clinical note not found.');
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            throw err;
        }
        if (existing.dataValues.NoteStatus >= 2) {
            const err: any = new Error('Clinical note is already signed.');
            err.statusCode = 409;
            err.code = 'NOTE_ALREADY_SIGNED';
            throw err;
        }

        const noteData = existing.dataValues;
        const signedContent = JSON.stringify({
            ChiefComplaints: req.Data?.ChiefComplaints || noteData.ChiefComplaints,
            Examinations: req.Data?.Examinations || noteData.Examinations,
            TreatmentComments: req.Data?.TreatmentComments || noteData.TreatmentComments,
            AdditionalNotes: req.Data?.AdditionalNotes || noteData.AdditionalNotes,
            OtherComplaints: req.Data?.OtherComplaints || noteData.OtherComplaints
        });

        const updatePayload: any = {
            Id: noteId,
            SignedAt: new Date(),
            SignedBy: this.Session ? this.Session.UserId : (req.Data?.UserId || 1),
            SignedContent: signedContent,
            NoteStatus: 2 // Signed
        };

        if (req.Data) {
            Object.assign(updatePayload, req.Data, {
                Id: noteId,
                SignedAt: updatePayload.SignedAt,
                SignedBy: updatePayload.SignedBy,
                SignedContent: updatePayload.SignedContent,
                NoteStatus: 2
            });
        }

        await this.Update(updatePayload);
        return true;
    }

    public async AmendPatientClinicalNote(req: BaseRequest): Promise<number> {
        this.checkAuthorization(req.Data?.FacilityId);
        const originalId = req.Data.OriginalNoteId || req.Data.Id || req.Id;
        let originalNote = await this.GetById(originalId);
        if (!originalNote) {
            const err: any = new Error('Original signed clinical note not found.');
            err.statusCode = 404;
            err.code = 'NOT_FOUND';
            throw err;
        }
        if (!originalNote.dataValues.NoteStatus || originalNote.dataValues.NoteStatus < 2) {
            const err: any = new Error('Can only create amendments for a signed clinical note.');
            err.statusCode = 409;
            err.code = 'INVALID_LIFECYCLE_STATE';
            throw err;
        }

        const amendmentData: any = { ...req.Data };
        delete amendmentData.Id;
        amendmentData.AmendmentOf = originalId;
        amendmentData.AmendmentReason = req.Data.AmendmentReason || 'Clinical Note Amendment';
        amendmentData.PatientId = req.Data.PatientId || originalNote.dataValues.PatientId;
        amendmentData.EncounterId = req.Data.EncounterId || originalNote.dataValues.EncounterId;
        amendmentData.ConsultationId = req.Data.ConsultationId || originalNote.dataValues.ConsultationId;
        amendmentData.PatientClinicalNotesTypeId = req.Data.PatientClinicalNotesTypeId || originalNote.dataValues.PatientClinicalNotesTypeId;
        amendmentData.NoteStatus = req.Data.IsSignedImmediately ? 2 : 1;

        if (amendmentData.NoteStatus === 2) {
            amendmentData.SignedAt = new Date();
            amendmentData.SignedBy = this.Session ? this.Session.UserId : (req.Data.UserId || 1);
            amendmentData.SignedContent = JSON.stringify({
                ChiefComplaints: amendmentData.ChiefComplaints,
                Examinations: amendmentData.Examinations,
                TreatmentComments: amendmentData.TreatmentComments,
                AdditionalNotes: amendmentData.AdditionalNotes,
                OtherComplaints: amendmentData.OtherComplaints,
                AmendmentReason: amendmentData.AmendmentReason
            });
        }

        let newNote = await this.Save(amendmentData);
        await this.Update({ Id: originalId, NoteStatus: 3 } as any); // Mark original as Amended

        return newNote.dataValues.Id;
    }

    public async GetPatientClinicalNotesById(req: BaseRequest): Promise<PatientClinicalNotesAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientClinicalNotess(apiReq?: ApiRequest<PatientClinicalNotesFilters>):
        Promise<ApiResponse<PatientClinicalNotesAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('IllnessType'));
        include.push(this.GetReference('IllnessDurationType'));
        include.push(this.GetReference('PatientClinicalNotesType'));
        include.push({
            model: this.Models.Encounter, attributes: ['DoctorName', 'VisitTypeId'], required: false,
            include: [this.GetReference('VisitType')]
        });
        include.push({
            model: this.Models.User, as: 'CreatedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientClinicalNotesFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientClinicalNotesFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientClinicalNotesFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientClinicalNotesFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    case PatientClinicalNotesFilters.PatientClinicalNotesTypeId:
                        where['PatientClinicalNotesTypeId'] = param.Value;
                        break;
                    case PatientClinicalNotesFilters.CreatedAt:
                        where['CreatedAt'] = { '$between': param.Value };
                        break;
                    case PatientClinicalNotesFilters.From:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$gte'] = param.Value;
                        break;
                    case PatientClinicalNotesFilters.To:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$lte'] = param.Value + ' 23:59:59';
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientClinicalNotes(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientClinicalNotesInstance, PatientClinicalNotesAttributes> {
        return this.Models.PatientClinicalNotes;
    }
}
