/**
 * KeywordMatcher - Advanced keyword matching with multiple strategies
 * Handles case-insensitive, partial, exact, and regex-based matching
 */

const logger = require('../../utils/logger');

class KeywordMatcher {
  /**
   * Match message against keywords using specified strategy
   * @param {string} message - The message to check
   * @param {string[]} keywords - Keywords to match against
   * @param {string} matchType - 'exact', 'contains', 'starts_with', 'regex', 'partial_word'
   * @param {boolean} caseSensitive - Whether matching is case-sensitive
   * @returns {object} - { matched: boolean, matchedKeywords: string[], score: number }
   */
  static match(message, keywords, matchType = 'contains', caseSensitive = false) {
    if (!message || !keywords || keywords.length === 0) {
      return { matched: false, matchedKeywords: [], score: 0 };
    }

    const processedMessage = caseSensitive ? message : message.toLowerCase();
    const processedKeywords = caseSensitive
      ? keywords
      : keywords.map((k) => k.toLowerCase());

    let matchedKeywords = [];

    try {
      switch (matchType) {
        case 'exact':
          matchedKeywords = this._exactMatch(
            processedMessage,
            processedKeywords
          );
          break;

        case 'starts_with':
          matchedKeywords = this._startsWithMatch(
            processedMessage,
            processedKeywords
          );
          break;

        case 'contains':
          matchedKeywords = this._containsMatch(
            processedMessage,
            processedKeywords
          );
          break;

        case 'regex':
          matchedKeywords = this._regexMatch(processedMessage, keywords);
          break;

        case 'partial_word':
          matchedKeywords = this._partialWordMatch(
            processedMessage,
            processedKeywords
          );
          break;

        default:
          matchedKeywords = this._containsMatch(
            processedMessage,
            processedKeywords
          );
      }

      const score = this._calculateMatchScore(
        matchedKeywords,
        keywords,
        processedMessage
      );

      return {
        matched: matchedKeywords.length > 0,
        matchedKeywords,
        score,
        matchType,
      };
    } catch (error) {
      logger.error('Error in keyword matching', error);
      return { matched: false, matchedKeywords: [], score: 0 };
    }
  }

  /**
   * Exact match - entire message must equal keyword
   */
  static _exactMatch(message, keywords) {
    const trimmedMessage = message.trim();
    return keywords.filter((keyword) => trimmedMessage === keyword.trim());
  }

  /**
   * Starts with match - message begins with keyword
   */
  static _startsWithMatch(message, keywords) {
    return keywords.filter((keyword) => {
      const trimmed = keyword.trim();
      return message.startsWith(trimmed);
    });
  }

  /**
   * Contains match - message includes keyword anywhere
   */
  static _containsMatch(message, keywords) {
    return keywords.filter((keyword) => message.includes(keyword.trim()));
  }

  /**
   * Partial word match - keyword as complete word (not substring)
   */
  static _partialWordMatch(message, keywords) {
    const words = message.toLowerCase().split(/\s+/);
    return keywords.filter((keyword) => {
      const keywordWords = keyword.toLowerCase().split(/\s+/);
      if (keywordWords.length === 1) {
        return words.includes(keywordWords[0]);
      }
      // Multi-word keywords must match consecutively
      const pattern = keywordWords.join(' ');
      return message.includes(pattern);
    });
  }

  /**
   * Regex match - use keywords as regex patterns
   */
  static _regexMatch(message, keywords) {
    return keywords.filter((keyword) => {
      try {
        const regex = new RegExp(keyword, 'i');
        return regex.test(message);
      } catch (e) {
        logger.warn(`Invalid regex pattern: ${keyword}`);
        return false;
      }
    });
  }

  /**
   * Calculate match score based on number of matches and relevance
   * Higher score = more relevant match
   */
  static _calculateMatchScore(matched, allKeywords, message) {
    if (matched.length === 0) return 0;

    const matchPercentage = matched.length / allKeywords.length;
    const messageLength = message.split(/\s+/).length;
    const keywordDensity = matched.reduce((acc, kw) => {
      return acc + (message.toLowerCase().match(new RegExp(kw, 'g')) || []).length;
    }, 0) / messageLength;

    // Score combines match percentage and keyword density
    return (matchPercentage * 0.6 + keywordDensity * 0.4) * 100;
  }

  /**
   * Find best matching keywords from multiple rule options
   */
  static findBestMatch(message, rulesData, caseSensitive = false) {
    let bestMatch = null;
    let highestScore = 0;

    for (const rule of rulesData) {
      const result = this.match(
        message,
        rule.keywords || [],
        rule.matchType,
        caseSensitive || rule.caseSensitive
      );

      if (result.matched && result.score > highestScore) {
        highestScore = result.score;
        bestMatch = { rule, matchResult: result };
      }
    }

    return bestMatch;
  }

  /**
   * Extract and normalize keywords from message
   */
  static extractKeywordsFromMessage(message) {
    const hashtags = (message.match(/#\w+/g) || []).map((h) => h.toLowerCase());
    const mentions = (message.match(/@\w+/g) || []).map((m) =>
      m.toLowerCase()
    );
    const words = message
      .split(/\s+/)
      .map((w) => w.toLowerCase())
      .filter((w) => w.length > 2); // Ignore short words

    return {
      hashtags,
      mentions,
      words,
      allKeywords: [...new Set([...hashtags, ...mentions, ...words])],
    };
  }
}

module.exports = KeywordMatcher;
