import { getCandidatesByPosition, getInterviewFlowByPosition } from '../presentation/controllers/positionController';


const router = require('express').Router();

router.get('/:id/candidates', getCandidatesByPosition);
router.get('/:id/interviewflow', getInterviewFlowByPosition);

export default router;
