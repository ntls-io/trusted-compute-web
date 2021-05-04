import FileUpload from "@/components/FileUpload.vue";
import { render } from "@testing-library/vue";

describe("FileUpload", () => {
  test("renders", async () => {
    const { getByText } = render(FileUpload);
    getByText("Select File");
  });
});
