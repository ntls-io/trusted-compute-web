import { ElNotification } from "element-plus";

/**
 * Error-handling wrapper: catch any errors from `f`, and display a ElNotification.
 *
 * @param title Title for the error notification
 * @param f Operation to run
 */
export async function notifyErrors(
  title: string,
  f: () => Promise<unknown>
): Promise<void> {
  try {
    await f();
  } catch (e) {
    ElNotification({
      type: "error",
      title,
      message: `${e}`
    });
    console.error(`notifyErrors: ${title}:`, e);
  }
}
