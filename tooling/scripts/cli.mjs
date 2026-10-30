export async function runCli(action) {
  try {
    await action();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
