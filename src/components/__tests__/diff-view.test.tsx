import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DiffView } from "@/components/resume/diff-view";
import type { ResumeDiff } from "@/lib/api/types";

const clean: ResumeDiff = {
  sections: [
    {
      name: "experience",
      lines: [
        {
          line_id: "l1",
          section: "experience",
          status: "modified",
          base: "Worked on a chatbot",
          tailored: "Built a RAG chatbot",
          source_fact_ids: ["f1#b1"],
        },
      ],
    },
  ],
  summary: { added: 0, modified: 1, removed: 0, reordered: 0, unchanged: 0 },
  validator_status: "passed",
  validator_findings: [],
};

describe("DiffView", () => {
  it("leads with the zero-new-claims promise", () => {
    render(<DiffView diff={clean} onApprove={vi.fn()} approving={false} />);
    expect(screen.getByText("0 new claims added")).toBeInTheDocument();
  });

  it("enables approval when nothing needs confirming", () => {
    render(<DiffView diff={clean} onApprove={vi.fn()} approving={false} />);
    expect(screen.getByRole("button", { name: /approve/i })).toBeEnabled();
  });

  it("blocks approval until every soft warning is acknowledged", async () => {
    const warned: ResumeDiff = {
      ...clean,
      validator_status: "passed_with_warnings",
      validator_findings: [
        {
          check: "vocabulary_inferred",
          severity: "soft",
          line_id: "l1",
          message: "Names rag, which your profile describes in different words.",
        },
      ],
    };
    render(<DiffView diff={warned} onApprove={vi.fn()} approving={false} />);

    const approve = screen.getByRole("button", { name: /approve/i });
    expect(approve).toBeDisabled();

    await userEvent.click(screen.getByRole("checkbox"));
    expect(approve).toBeEnabled();
  });

  it("renders no document and no approve button when validation failed", () => {
    const failed: ResumeDiff = {
      ...clean,
      validator_status: "failed",
      validator_findings: [
        {
          check: "numeric_claim",
          severity: "hard",
          line_id: "l1",
          message: "States figures absent from the source: 40%.",
        },
      ],
    };
    render(<DiffView diff={failed} onApprove={vi.fn()} approving={false} />);

    expect(screen.queryByRole("button", { name: /approve/i })).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("couldn't verify");
    expect(screen.getByText(/40%/)).toBeInTheDocument();
  });
});
