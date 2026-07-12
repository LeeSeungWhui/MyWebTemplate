import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Checkbox from "../app/lib/component/Checkbox/Checkbox.jsx";

describe("Checkbox name and binding fallbacks", () => {
  it("prefers explicit name, then dataKey, then label", () => {
    const { rerender } = render(
      <Checkbox label="Agreement" dataKey="agreed" name="explicit-name" />,
    );
    expect(screen.getByRole("checkbox")).toHaveAttribute("name", "explicit-name");

    rerender(<Checkbox label="Agreement" dataKey="agreed" />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("name", "agreed");

    rerender(<Checkbox label="Agreement" />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("name", "Agreement");
  });

  it("preserves label-based binding when dataKey is absent", () => {
    const dataObj = { Agreement: false };
    const onValueChange = vi.fn();
    render(<Checkbox label="Agreement" dataObj={dataObj} onValueChange={onValueChange} />);

    fireEvent.click(screen.getByRole("checkbox"));

    expect(dataObj.Agreement).toBe(true);
    expect(onValueChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ dataKey: "Agreement" }),
    );
  });
});
