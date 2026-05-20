/**
 * Admin routes skip the public site chrome (header / footer / WhatsApp FAB).
 * Panel layout and auth live under admin/(panel) and admin/login.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
