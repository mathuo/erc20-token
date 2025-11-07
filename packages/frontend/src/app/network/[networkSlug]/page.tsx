import NetworkPageClient from '@/components/network/NetworkPageClient';

interface NetworkPageProps {
  params: {
    networkSlug: string;
  };
}

export default function NetworkPage({ params }: NetworkPageProps) {
  return <NetworkPageClient networkSlug={params.networkSlug} />;
}

export async function generateStaticParams() {
  return [
    { networkSlug: 'sepolia' },
    { networkSlug: 'base-sepolia' },
    { networkSlug: 'arbitrum-sepolia' },
    { networkSlug: 'optimism-sepolia' },
    { networkSlug: 'hoodi' },
    { networkSlug: 'ethereum' },
    { networkSlug: 'base' },
  ];
}