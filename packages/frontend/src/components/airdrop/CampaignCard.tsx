'use client';

import * as React from 'react';
import { Clock, Users, Gift, TrendingUp } from 'lucide-react';
import { useCampaignInfo, useUserClaimInfo } from '@/hooks/usePublicAirdrop';
import { Button } from '@/components/ui/Button';
import { 
  formatTokenAmount, 
  formatTimeLeft, 
  calculateProgress,
  cn 
} from '@/lib/utils';

interface CampaignCardProps {
  campaignId: bigint;
  tokenSymbol: string;
  onClaim: (campaignId: bigint) => void;
  isClaimPending?: boolean;
  className?: string;
}

export function CampaignCard({ 
  campaignId, 
  tokenSymbol, 
  onClaim, 
  isClaimPending,
  className 
}: CampaignCardProps) {
  const { campaignInfo, isLoading: isLoadingCampaign } = useCampaignInfo(campaignId);
  const { userClaimInfo, isLoading: isLoadingUser } = useUserClaimInfo(campaignId);

  if (isLoadingCampaign || isLoadingUser) {
    return <CampaignCardSkeleton className={className} />;
  }

  if (!campaignInfo) {
    return null;
  }

  const [
    name,
    claimAmount,
    totalBudget,
    claimedAmount,
    remainingBudget,
    startTime,
    endTime,
    cooldownPeriod,
    maxClaimsPerUser,
    active,
    isCurrentlyActive
  ] = campaignInfo;

  const [
    userClaimCount,
    userLastClaimTime,
    userTotalClaimed,
    canClaimNow,
    nextClaimTime,
    claimStatus
  ] = userClaimInfo || [0n, 0n, 0n, false, 0n, 'Loading...'];

  const progress = calculateProgress(claimedAmount, totalBudget);
  const timeLeft = formatTimeLeft(Number(endTime));
  const isFaucet = cooldownPeriod > 0n;
  const hasMaxClaims = maxClaimsPerUser > 0n;

  const getStatusColor = () => {
    if (!isCurrentlyActive) return 'text-muted-foreground';
    if (canClaimNow) return 'text-green-600';
    return 'text-yellow-400';
  };

  const getStatusBadge = () => {
    if (!active) return { label: 'Inactive', color: 'bg-gray-800 text-gray-400 border border-gray-700' };
    if (!isCurrentlyActive) return { label: 'Ended', color: 'bg-red-900/20 text-red-400 border border-red-800/30' };
    if (remainingBudget === 0n) return { label: 'Exhausted', color: 'bg-red-900/20 text-red-400 border border-red-800/30' };
    if (canClaimNow) return { label: 'Ready to Claim', color: 'bg-green-900/20 text-green-400 border border-green-800/30' };
    return { label: 'Active', color: 'bg-blue-900/20 text-blue-400 border border-blue-800/30' };
  };

  const statusBadge = getStatusBadge();

  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow',
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {name}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-sm text-muted-foreground">
              Campaign #{campaignId.toString()}
            </span>
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              statusBadge.color
            )}>
              {statusBadge.label}
            </span>
            {isFaucet && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Faucet
              </span>
            )}
          </div>
        </div>
        <Gift className="h-8 w-8 text-blue-600 dark:text-blue-400" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="text-sm text-muted-foreground mb-1">
            Claim Amount
          </div>
          <div className="font-semibold text-foreground">
            {formatTokenAmount(claimAmount)} {tokenSymbol}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="text-sm text-muted-foreground mb-1">
            Remaining
          </div>
          <div className="font-semibold text-foreground">
            {formatTokenAmount(remainingBudget)} {tokenSymbol}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>Progress</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Campaign Details */}
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Time Left</span>
          </div>
          <span className="font-medium text-foreground">
            {timeLeft}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Total Claims</span>
          </div>
          <span className="font-medium text-foreground">
            {Math.floor(Number(claimedAmount) / Number(claimAmount))}
          </span>
        </div>

        {isFaucet && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Cooldown</span>
            </div>
            <span className="font-medium text-foreground">
              {Number(cooldownPeriod) / 3600}h
            </span>
          </div>
        )}
      </div>

      {/* User Status */}
      {userClaimInfo && (
        <div className="bg-blue-900/20 rounded-lg p-3 mb-4 border border-blue-800/30">
          <div className="text-sm text-blue-200 mb-1">
            Your Status
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>Claims Made:</span>
              <span className="font-medium">
                {userClaimCount.toString()}
                {hasMaxClaims && ` / ${maxClaimsPerUser.toString()}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Claimed:</span>
              <span className="font-medium">
                {formatTokenAmount(userTotalClaimed)} {tokenSymbol}
              </span>
            </div>
            <div className={cn('font-medium', getStatusColor())}>
              {claimStatus}
            </div>
            {nextClaimTime > 0n && (
              <div className="text-xs text-muted-foreground mt-1">
                Next claim: {new Date(Number(nextClaimTime) * 1000).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Claim Button */}
      <Button
        onClick={() => onClaim(campaignId)}
        disabled={!canClaimNow || isClaimPending}
        loading={isClaimPending}
        variant={canClaimNow ? 'gradient' : 'outline'}
        className="w-full"
        size="lg"
      >
        {canClaimNow 
          ? `Claim ${formatTokenAmount(claimAmount)} ${tokenSymbol}`
          : claimStatus
        }
      </Button>
    </div>
  );
}

function CampaignCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm animate-pulse',
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
      
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
      
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    </div>
  );
}