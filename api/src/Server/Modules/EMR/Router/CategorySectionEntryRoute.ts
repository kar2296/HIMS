import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { CategorySectionEntryService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddCategorySectionEntry', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CategorySectionEntryService, req);
    service.AddCategorySectionEntry(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateCategorySectionEntry', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CategorySectionEntryService, req);
    service.UpdateCategorySectionEntry(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageCategorySectionEntries', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CategorySectionEntryService, req);
    service.ManageCategorySectionEntries(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCategorySectionEntryById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CategorySectionEntryService, req);
    service.GetCategorySectionEntryById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCategorySectionEntrys', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CategorySectionEntryService, req);
    service.GetCategorySectionEntrys(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetCategorySectionEntrysForReview', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CategorySectionEntryService, req);
    service.GetCategorySectionEntrysForReview(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteCategorySectionEntryGroup', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CategorySectionEntryService, req);
    service.DeleteCategorySectionEntryGroup(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteCategorySectionEntry', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(CategorySectionEntryService, req);
    service.DeleteCategorySectionEntry(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
