import * as multer from 'multer';
import type { Request, Response, NextFunction } from '../Index';

type Option = { basePath: string, field?: string, storage?: 'disk' | 'memory' };

export class FileUploader {

    public static UploadSingle(req: Request, res: Response, next: NextFunction, opt: Option): any {
        let storage = this.GetStorage(opt);

        //console.log(req.body.Data);
        // let uploadPath = opt.basePath + '/' + req.body.Data.MRN;
        // opt.basePath = uploadPath;
// -        if (!fs.existsSync(uploadPath)) {
// -            fs.mkdirSync(uploadPath);
// -        }
        let options = { storage: storage };
        let upload = multer(options).single(opt.field ? opt.field : 'file');
        // let upload = multer(options).array(opt.field ? opt.field : 'file');
        return upload(req, res, next);
    }

    public static UploadMultiple(req: Request, res: Response, next: NextFunction, opt: Option): any {
        let storage = this.GetStorage(opt);
        let options = { storage: storage };
        let upload = multer(options).any();
        return upload(req, res, next);
    }

    public static UploadFacilityLogo(req: Request, res: Response, next: NextFunction, opt: Option): any {
        let storage = this.GetFacilityLogoStorage(opt);
        let options = { storage: storage };
        let upload = multer(options).single(opt.field ? opt.field : 'file');
        return upload(req, res, next);
    }

    private static GetStorage(opt: Option) {
        let storage: any;
        switch (opt.storage) {
            case 'disk':
                storage = multer.diskStorage(new LocalDiskStorage(opt.basePath));
                break;
            default:
                storage = multer.memoryStorage();
                break;
        }
        return storage;
    }

    private static GetFacilityLogoStorage(opt: Option) {
        let storage: any;
        switch (opt.storage) {
            case 'disk':
                storage = multer.diskStorage(new FacilityLogoDiskStorage(opt.basePath));
                break;
            default:
                storage = multer.memoryStorage();
                break;
        }
        return storage;
    }
}

export class LocalDiskStorage implements multer.DiskStorageOptions {
    private path: string;
    constructor(path: string) {
        this.path = path;
    }
    public get destination(): string {
        return this.path;
    }
    public filename(req: Express.Request, file: Express.Multer.File, cb: Function) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.'
            + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
}

export class FacilityLogoDiskStorage implements multer.DiskStorageOptions {
    private path: string;
    constructor(path: string) {
        this.path = path;
    }
    public get destination(): string {
        return this.path;
    }
    public filename(req: Express.Request, file: Express.Multer.File, cb: Function) {
        cb(null, 'Logo.png');
    }
}
