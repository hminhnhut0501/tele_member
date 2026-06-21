'use client';

import { apiClient } from '../../lib/api';

export function createAdminService(token: string | null) {
  const client = apiClient(token);

  return {
    login: client.login,
    getUsers: client.getUsers,
    getTransactions: client.getTransactions,
    getAuditLogs: client.getAuditLogs,
    adjust: client.adjust,
    adjustSpins: client.adjustSpins,
    getDebugEnv: client.getDebugEnv,
    getTelegramBotInfo: client.getTelegramBotInfo,
    getRewards: client.adminGetRewards,
    createReward: client.adminCreateReward,
    updateReward: client.adminUpdateReward,
    deleteReward: client.adminDeleteReward,
    importRewardCodes: client.adminImportRewardCodes,
    getRewardCodes: client.adminGetRewardCodes,
    getRedemptions: client.adminGetRedemptions,
    getWheelCampaigns: client.adminGetWheelCampaigns,
    createWheelCampaign: client.adminCreateWheelCampaign,
    updateWheelCampaign: client.adminUpdateWheelCampaign,
    deleteWheelCampaign: client.adminDeleteWheelCampaign,
    getWheelPrizes: client.adminGetWheelPrizes,
    createWheelPrize: client.adminCreateWheelPrize,
    updateWheelPrize: client.adminUpdateWheelPrize,
    deleteWheelPrize: client.adminDeleteWheelPrize,
    getWheelSpins: client.adminGetWheelSpins,
  };
}
