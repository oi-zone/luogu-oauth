import axios from "axios";
import { DataResponse, Paste } from "./luogu-api-docs/luogu-api";

interface PasteResponse extends DataResponse<{ paste: Paste }> {
  code: 200;
}
interface ErrorResponse
  extends DataResponse<{
    errorType: string;
    errorMessage: string;
    errorTrace: string;
  }> {
  code: 403 | 404;
}

export default async function verifyPaste(
  pasteId: string,
  content: string,
  mode: "includes" | "startsWith" | "endsWith" = "includes"
) {
  if (!/^[\da-z]{8}$/.test(pasteId)) throw Error("Invalid paste ID");
  const { data } = await axios.get<PasteResponse | ErrorResponse>(
    `https://www.luogu.com.cn/paste/${pasteId}?_contentOnly`
  );
  if (data.code !== 200) throw Error(data.currentData.errorMessage);
  return data.currentData.paste.data.trim()[mode](content);
}
