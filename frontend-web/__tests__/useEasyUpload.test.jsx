/**
 * 파일명: useEasyUpload.test.jsx
 * 작성자: LSH
 * 갱신일: 2026-06-05
 * 설명: EasyUpload BFF 경유 업로드 URL 정규화 테스트
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import easyUploadRequest from "@/app/lib/hooks/useEasyUpload.jsx";
import { apiRequest } from "@/app/lib/runtime/api";

vi.mock("@/app/common/store/SharedStore", () => ({
  getUiActionsSnap: () => ({
    updateLoading: vi.fn(),
    showAlert: vi.fn(),
  }),
}));

vi.mock("@/app/lib/runtime/api", () => ({
  apiRequest: vi.fn(),
}));

describe("easyUploadRequest", () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("absolute backend upload URL은 host를 버리고 BFF pathname+search로 정규화한다", async () => {
    apiRequest.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: true, result: { ok: true } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await easyUploadRequest({
      filesInput: new File(["x"], "sample.txt", { type: "text/plain" }),
      options: {
        fileUploadUrl: "http://backend.local/api/v1/upload/files?kind=editor",
      },
    });

    expect(apiRequest).toHaveBeenCalledTimes(1);
    const [requestUrl, requestInitObj] = apiRequest.mock.calls[0];
    expect(requestUrl).toBe("/api/bff/api/v1/upload/files?kind=editor");
    expect(requestInitObj.method).toBe("POST");
    expect(requestInitObj.body).toBeInstanceOf(FormData);
  });
});
