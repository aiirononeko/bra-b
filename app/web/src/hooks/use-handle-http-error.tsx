import type { ClientResponse } from "hono/client";
import type { ZodError, ZodIssue } from "zod";

export class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly data: { code: string; message: string },
  ) {
    super(message);
  }
}

const buildZodIssueMessage = (issue: ZodIssue) => {
  const path = issue.path.join(".");
  return `${path}: ${issue.message}`;
};

export const throwHttpErrorAtFailure = async <T = unknown>(res: Response | ClientResponse<T>) => {
  if (res.ok) return;
  const data = await res.json();
  if (data.name === "ZodError" || data.error?.name === "ZodError") {
    const zodError = data.error as ZodError;
    const message = zodError.issues.map(buildZodIssueMessage).join("\n");
    throw new HttpError("Zod Error", res.status, { code: "VE000", message });
  }
  throw new HttpError("HTTP Error", res.status, data);
};

export const handleErrorToast = (err: unknown) => {
  console.error(err);
  // if (err instanceof HttpError) {
  //   return (
  //     <div>
  //       <div className="font-semibold">エラー: {err.data.code ?? err.status}</div>
  //       <p className="whitespace-pre-wrap">{err.data.message}</p>
  //     </div>
  //   );
  // } else if (err instanceof Error) {
  //   return (
  //     <div>
  //       <div className="font-semibold">エラー</div>
  //       <p className="whitespace-pre-wrap">エラーが発生しました</p>
  //     </div>
  //   );
  // }
};

export const handleHttpError = (err: Error) => {
  console.error(err);
  // if (!(err instanceof HttpError)) {
  //   toast({
  //     duration: 5000,
  //     variant: "error",
  //     title: "エラー",
  //     description: "エラーが発生しました",
  //   });
  //   return;
  // }

  // toast({
  //   duration: 5000,
  //   variant: "error",
  //   title: `エラー: ${err.data.code ?? err.status}`,
  //   description: <p className="whitespace-pre-wrap">{err.data.message}</p>,
  // });
};

const useHandleHttpError = () => handleHttpError;
export default useHandleHttpError;
