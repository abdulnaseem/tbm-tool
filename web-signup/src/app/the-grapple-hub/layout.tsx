import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Grapple Hub Registration | The Butterfly Movement',
  description:
    'Private participant registration for The Grapple Hub Youth BJJ cohort.',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
};

export default function GrappleHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}