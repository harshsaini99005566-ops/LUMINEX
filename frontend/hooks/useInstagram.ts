import { useState } from 'react';
import { useInstagramStore } from '../lib/store';
import { instagramAPI } from '../lib/api';
import { InstagramAccount, ApiResponse } from '../types';

export function useInstagram() {
  const {
    accounts,
    selectedAccountId,
    isLoading,
    setAccounts,
    addAccount,
    removeAccount,
    selectAccount,
    updateAccount,
  } = useInstagramStore();
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    setError(null);
    try {
      const response: ApiResponse<InstagramAccount[]> = await instagramAPI.getAccounts();
      const accountsData = response.data || [];
      setAccounts(accountsData);
      return accountsData;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch accounts';
      setError(errorMessage);
      throw err;
    }
  };

  const connectAccount = async (accessToken: string) => {
    setError(null);
    try {
      const response: ApiResponse<InstagramAccount> = await instagramAPI.connectAccount(
        accessToken
      );
      if (!response.data) throw new Error('No account returned');
      addAccount(response.data);
      selectAccount(response.data.id);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to connect account';
      setError(errorMessage);
      throw err;
    }
  };

  const disconnectAccount = async (accountId: string) => {
    setError(null);
    try {
      await instagramAPI.disconnectAccount(accountId);
      removeAccount(accountId);
      if (selectedAccountId === accountId) {
        selectAccount(accounts.find((a: InstagramAccount) => a.id !== accountId)?.id || null);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to disconnect account';
      setError(errorMessage);
      throw err;
    }
  };

  const getAccountInfo = async (accountId: string) => {
    setError(null);
    try {
      const response: ApiResponse<InstagramAccount> = await instagramAPI.getAccountInfo(
        accountId
      );
      updateAccount(accountId, response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch account info';
      setError(errorMessage);
      throw err;
    }
  };

  const syncConversations = async (accountId: string) => {
    setError(null);
    try {
      await instagramAPI.syncConversations(accountId);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to sync conversations';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    accounts,
    selectedAccountId,
    selectedAccount: accounts.find((a: InstagramAccount) => a.id === selectedAccountId) || null,
    isLoading,
    error,
    fetchAccounts,
    connectAccount,
    disconnectAccount,
    getAccountInfo,
    syncConversations,
    selectAccount,
  };
}
