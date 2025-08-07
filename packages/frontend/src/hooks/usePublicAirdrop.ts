'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount, useChainId } from 'wagmi';
import { getContractAddress, type ChainId } from '@/lib/contracts/addresses';
import PublicAirdropABI from '@/lib/contracts/abis/PublicAirdrop.json';
import MyTokenABI from '@/lib/contracts/abis/MyToken.json';
import * as React from 'react';

export function usePublicAirdrop() {
  const { address } = useAccount();
  const chainId = useChainId() as ChainId;
  
  const contractAddress = getContractAddress(chainId, 'PublicAirdrop');
  const tokenAddress = getContractAddress(chainId, 'MyToken');

  // Get active campaigns
  const { 
    data: activeCampaigns, 
    isLoading: isLoadingCampaigns,
    refetch: refetchCampaigns
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: PublicAirdropABI,
    functionName: 'getActiveCampaigns',
    query: {
      enabled: Boolean(contractAddress),
    },
  });

  // Get token info
  const { data: tokenName } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: MyTokenABI,
    functionName: 'name',
    query: {
      enabled: Boolean(tokenAddress),
    },
  });

  const { data: tokenSymbol } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: MyTokenABI,
    functionName: 'symbol',
    query: {
      enabled: Boolean(tokenAddress),
    },
  });

  const { data: tokenBalance, refetch: refetchBalance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: MyTokenABI,
    functionName: 'balanceOf',
    args: [address!],
    query: {
      enabled: Boolean(tokenAddress && address),
    },
  });

  return {
    contractAddress,
    tokenAddress,
    tokenName: tokenName as string,
    tokenSymbol: tokenSymbol as string,
    tokenBalance: tokenBalance as bigint,
    activeCampaigns: activeCampaigns as bigint[],
    isLoadingCampaigns,
    refetchCampaigns,
    refetchBalance,
  };
}

export function useCampaignInfo(campaignId: bigint | undefined) {
  const chainId = useChainId() as ChainId;
  const contractAddress = getContractAddress(chainId, 'PublicAirdrop');

  const { 
    data: campaignInfo, 
    isLoading,
    refetch
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: PublicAirdropABI,
    functionName: 'getCampaignInfo',
    args: campaignId ? [campaignId] : undefined,
    query: {
      enabled: Boolean(contractAddress && campaignId !== undefined),
    },
  });

  return {
    campaignInfo: campaignInfo as [
      string, // name
      bigint, // claimAmount
      bigint, // totalBudget
      bigint, // claimedAmount
      bigint, // remainingBudget
      bigint, // startTime
      bigint, // endTime
      bigint, // cooldownPeriod
      bigint, // maxClaimsPerUser
      boolean, // active
      boolean  // isCurrentlyActive
    ],
    isLoading,
    refetch,
  };
}

export function useUserClaimInfo(campaignId: bigint | undefined) {
  const { address } = useAccount();
  const chainId = useChainId() as ChainId;
  const contractAddress = getContractAddress(chainId, 'PublicAirdrop');

  const { 
    data: userClaimInfo, 
    isLoading,
    refetch
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: PublicAirdropABI,
    functionName: 'getUserClaimInfo',
    args: campaignId && address ? [campaignId, address] : undefined,
    query: {
      enabled: Boolean(contractAddress && campaignId !== undefined && address),
    },
  });

  return {
    userClaimInfo: userClaimInfo as [
      bigint,  // claimCount
      bigint,  // lastClaimTime
      bigint,  // totalClaimed
      boolean, // canClaimNow
      bigint,  // nextClaimTime
      string   // status
    ],
    isLoading,
    refetch,
  };
}

export function useClaimTokens() {
  const chainId = useChainId() as ChainId;
  const contractAddress = getContractAddress(chainId, 'PublicAirdrop');
  
  const { 
    writeContract, 
    data: hash,
    isPending: isWriting,
    error: writeError,
    reset
  } = useWriteContract();

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: receiptError 
  } = useWaitForTransactionReceipt({ 
    hash 
  });

  const claim = React.useCallback((campaignId: bigint) => {
    if (!contractAddress) {
      throw new Error('Contract address not found for this network');
    }
    
    writeContract({
      address: contractAddress as `0x${string}`,
      abi: PublicAirdropABI,
      functionName: 'claim',
      args: [campaignId],
    });
  }, [contractAddress, writeContract]);

  return {
    claim,
    hash,
    isWriting,
    isConfirming,
    isConfirmed,
    isPending: isWriting || isConfirming,
    error: writeError || receiptError,
    reset,
  };
}

// Hook to get active campaign IDs
export function useActiveCampaigns() {
  const chainId = useChainId() as ChainId;
  const contractAddress = getContractAddress(chainId, 'PublicAirdrop');

  const campaigns = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: PublicAirdropABI,
    functionName: 'getActiveCampaigns',
    query: {
      enabled: Boolean(contractAddress),
      select: (data: unknown) => data as bigint[],
    },
  });

  return {
    campaignIds: campaigns.data || [],
    isLoading: campaigns.isLoading,
    error: campaigns.error,
  };
}