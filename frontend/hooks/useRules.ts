import { useState } from 'react';
import { useRuleStore } from '../lib/store';
import { rulesAPI } from '../lib/api';
import { AutomationRule, ApiResponse } from '../types';

export function useRules() {
  const {
    rules,
    selectedRuleId,
    isLoading,
    setRules,
    addRule,
    updateRule,
    deleteRule,
    selectRule,
  } = useRuleStore();
  const [error, setError] = useState<string | null>(null);

  const fetchRules = async (accountId?: string) => {
    setError(null);
    try {
      const response: ApiResponse<AutomationRule[]> = await rulesAPI.getRules(accountId);
      const rulesData = response.data || [];
      setRules(rulesData);
      return rulesData;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch rules';
      setError(errorMessage);
      throw err;
    }
  };

  const createRule = async (data: Partial<AutomationRule>) => {
    setError(null);
    try {
      const response: ApiResponse<AutomationRule> = await rulesAPI.createRule(data);
      addRule(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create rule';
      setError(errorMessage);
      throw err;
    }
  };

  const updateRuleData = async (ruleId: string, data: Partial<AutomationRule>) => {
    setError(null);
    try {
      const response: ApiResponse<AutomationRule> = await rulesAPI.updateRule(ruleId, data);
      updateRule(ruleId, response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update rule';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteRuleData = async (ruleId: string) => {
    setError(null);
    try {
      await rulesAPI.deleteRule(ruleId);
      deleteRule(ruleId);
      if (selectedRuleId === ruleId) {
        selectRule(null);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete rule';
      setError(errorMessage);
      throw err;
    }
  };

  const toggleRule = async (ruleId: string) => {
    setError(null);
    try {
      const response: ApiResponse<AutomationRule> = await rulesAPI.toggleRule(ruleId);
      updateRule(ruleId, response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to toggle rule';
      setError(errorMessage);
      throw err;
    }
  };

  const testRule = async (ruleId: string, text: string) => {
    setError(null);
    try {
      const response = await rulesAPI.testRule(ruleId, text);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to test rule';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    rules,
    selectedRuleId,
    selectedRule: rules.find((r: AutomationRule) => r.id === selectedRuleId) || null,
    isLoading,
    error,
    fetchRules,
    createRule,
    updateRule: updateRuleData,
    deleteRule: deleteRuleData,
    toggleRule,
    testRule,
    selectRule,
  };
}
