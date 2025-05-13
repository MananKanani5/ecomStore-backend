import { sendResponse } from "../utils/responseUtil";
import STATUS_CODES from "../utils/statusCodes";

export const errorHandler = (err: any, req: any, res: any, next: any) => {
    sendResponse(res, false, err, err.message, STATUS_CODES.SERVER_ERROR);
};