import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
// import { DomainError, ErrorCode as DomainErrorCode, Defect } from "@drumrole/core/domain";
// import {
//   ApplicationError,
//   ErrorCode as ApplicationErrorCode,
// } from "@drumrole/core/workflows/exceptions";
// import { QueryError, ErrorCode as QueryErrorCode } from "@drumrole/core/queries";
// import {
//   ExternalServiceError,
//   ErrorCode as ExternalServiceErrorCode,
// } from "@drumrole/core/externals/exceptions";
// import { logger } from "@drumrole/logger";

// const domainErrorHandler = (err: DomainError, c: Context) => {
//   switch (err.code) {
//     case DomainErrorCode.COMMON.NO_BILLING_POLICY:
//       return c.json(
//         err.toResponseJson("取引先に請求設定がされていません"),
//         StatusCodes.UNPROCESSABLE_ENTITY,
//       );

//     case DomainErrorCode.COMPANY.BUSINESS_UNIT_PARSE_ERROR:
//       return c.json(
//         err.toResponseJson("部門の作成に失敗しました"),
//         StatusCodes.UNPROCESSABLE_ENTITY,
//       );

//     default:
//       throw _exchaustiveCheck(err.code);
//   }
// };
// const applicationErrorHandler = (err: ApplicationError, c: Context) => {
//   switch (err.code) {
//     case ApplicationErrorCode.PASSWORD_NOT_MATCH:
//       return c.json(err.toResponseJson(), StatusCodes.BAD_REQUEST);

//     case ApplicationErrorCode.INVALID_ARGUMENT:
//       return c.json(err.toResponseJson(), StatusCodes.BAD_REQUEST);

//     case ApplicationErrorCode.NOT_ALLOWED:
//       return c.json(err.toResponseJson(), StatusCodes.FORBIDDEN);

//     case ApplicationErrorCode.ENTITY_NOT_FOUND:
//       return c.json(err.toResponseJson(), StatusCodes.NOT_FOUND);
//     default:
//       throw _exchaustiveCheck(err.code);
//   }
// };

// const queryErrorHandler = (err: QueryError, c: Context) => {
//   switch (err.code) {
//     case QueryErrorCode.COMPANY_NOT_FOUND:
//       return c.json(err.toResponseJson(), StatusCodes.NOT_FOUND);

//     case QueryErrorCode.USER_NOT_FOUND:
//       return c.json(err.toResponseJson(), StatusCodes.NOT_FOUND);

//     case QueryErrorCode.ORDER_NOT_FOUND:
//       return c.json(err.toResponseJson(), StatusCodes.NOT_FOUND);

//     case QueryErrorCode.DEFECT_NOT_FOUND:
//       return c.json(err.toResponseJson(), StatusCodes.NOT_FOUND);

//     default:
//       throw _exchaustiveCheck(err.code);
//   }
// };

// const externalServiceErrorHandler = (err: ExternalServiceError, c: Context) => {
//   switch (err.code) {
//     case ExternalServiceErrorCode.INVALID_LIMIT:
//       return c.json(err.toResponseJson(), StatusCodes.BAD_REQUEST);

//     case ExternalServiceErrorCode.INVALID_CURSOR:
//       return c.json(err.toResponseJson(), StatusCodes.BAD_REQUEST);

//     case ExternalServiceErrorCode.INVALID_INPUT:
//       return c.json(err.toResponseJson(), StatusCodes.BAD_REQUEST);

//     case ExternalServiceErrorCode.AWS_PASSWORD_GENERATION_ERROR:
//       return c.json(err.toResponseJson(), StatusCodes.INTERNAL_SERVER_ERROR);

//     default:
//       throw _exchaustiveCheck(err.code);
//   }
// };

export const errorHandler = (err: Error, c: Context) => {
  // logger.error(err.message);
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  // TODO: エラーハンドラを実装する
  // } else if (err instanceof DomainError) {
  //   return domainErrorHandler(err, c);
  // } else if (err instanceof ApplicationError) {
  //   return applicationErrorHandler(err, c);
  // } else if (err instanceof QueryError) {
  //   return queryErrorHandler(err, c);
  // } else if (err instanceof ExternalServiceError) {
  //   return externalServiceErrorHandler(err, c);
  // }
  return c.json(
    {
      code: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
      message: err.message,
    },
    StatusCodes.INTERNAL_SERVER_ERROR,
  );
};

const _exchaustiveCheck = (code: never) => new Error(`Unexchaustive match for ${code}`);
