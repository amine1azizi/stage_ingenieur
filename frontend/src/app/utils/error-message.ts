export function getErrorMessage(error: unknown): string {
  const err = error as { status?: number; error?: { message?: string }; message?: string };

  if (err?.status === 0) {
    return 'Cannot reach the server. Make sure the backend is running.';
  }
  if (err?.error?.message) {
    return err.error.message;
  }
  if (err?.message) {
    return err.message;
  }
  return 'The request failed. Please try again.';
}
