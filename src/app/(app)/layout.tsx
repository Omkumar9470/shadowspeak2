interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    // The root layout now provides the Navbar and main flex structure.
    <>{children}</>
  );
}