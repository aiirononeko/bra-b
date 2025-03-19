import type { MiddlewareHandler } from "hono";

import type { ContextVariables } from "../common";

// TODO: 認証を実装する
export const authMiddleware: MiddlewareHandler<{ Variables: ContextVariables }> = async (
  c,
  next,
) => {
  // const session = await getServerSession(authOptions);

  // if (!session) {
  //   throw new HTTPException(StatusCodes.UNAUTHORIZED, {
  //     res: c.json(
  //       {
  //         code: getReasonPhrase(StatusCodes.UNAUTHORIZED),
  //         message: 'セッションが見つかりません',
  //       },
  //       StatusCodes.UNAUTHORIZED
  //     ),
  //   });
  // }
  // c.set('user', session.user);
  await next();
};
