import Home from "@/views/Home.vue";
import { render } from "@testing-library/vue";

describe("Home", () => {
  test("renders", async () => {
    const { getByText } = render(Home);
    getByText("JWT Token");
  });
});
