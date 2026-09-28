import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreBadge } from "@/components/shared/score-badge";

describe("ScoreBadge", () => {
  it("always shows the number, not just a colour", () => {
    render(<ScoreBadge score={82.4} />);
    expect(screen.getByText("82")).toBeInTheDocument();
  });

  it("labels the score for screen readers", () => {
    render(<ScoreBadge score={82.4} />);
    expect(screen.getByLabelText("Match score 82 out of 100")).toBeInTheDocument();
  });

  it("renders an unscored applicant as blank, never as zero", () => {
    render(<ScoreBadge score={null} />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
