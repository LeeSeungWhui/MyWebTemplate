import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Card from "../app/lib/component/Card.jsx";

describe("Card", () => {
  it("renders the refined surface, header, body, and footer", () => {
    render(
      <Card
        id="sample-card"
        title="카드 제목"
        subtitle="보조 설명"
        actions={<button type="button">Action</button>}
        footer="푸터 텍스트"
        data-testid="card"
      >
        카드 본문
      </Card>
    );

    const card = screen.getByTestId("card");
    expect(card).toHaveClass("rounded-xl", "bg-white", "shadow-sm", "ring-slate-900/5");
    expect(card).toHaveAttribute("aria-labelledby", "sample-card-title");
    expect(screen.getByRole("heading", { name: "카드 제목" })).toHaveClass("text-slate-900");
    expect(screen.getByText("보조 설명")).toHaveClass("text-slate-500");
    expect(card.querySelector(".text-slate-700")).toHaveTextContent("카드 본문");
    expect(card.querySelector(".border-t")).toHaveClass("bg-slate-50/50", "text-slate-500");
    expect(card.querySelector(".border-t")).toHaveTextContent("푸터 텍스트");
  });

  it("keeps custom section classes available", () => {
    render(
      <Card
        className="overflow-hidden"
        headerClassName="p-3"
        bodyClassName="p-0"
        footerClassName="bg-white"
        title="커스텀 카드"
        footer="커스텀 푸터"
        data-testid="card"
      >
        커스텀 본문
      </Card>
    );

    expect(screen.getByTestId("card")).toHaveClass("overflow-hidden");
    expect(screen.getByRole("heading", { name: "커스텀 카드" }).parentElement?.parentElement).toHaveClass("p-3");
    expect(screen.getByTestId("card").querySelector(".p-0")).toHaveTextContent("커스텀 본문");
    expect(screen.getByTestId("card").querySelector(".border-t")).toHaveClass("bg-white");
  });
});
