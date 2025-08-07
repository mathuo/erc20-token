# Claude Code Session Token Usage Analysis

## Overview

## Combined Totals

**GRAND TOTAL: 89,909,619 tokens**

### Breakdown by Token Type
- **Input tokens**: 44,964 (0.05%)
- **Output tokens**: 145,136 (0.16%)
- **Cache creation tokens**: 4,363,939 (4.86%)
- **Cache read tokens**: 85,355,580 (94.93%)

### Processing Statistics
- **Total files processed**: 18 JSONL files
- **Total messages processed**: 2,261 messages
- **Sessions with token usage**: 10 sessions

## Project-Specific Analysis

### Blockchain Project
- **Total tokens**: 34,736,193 (38.62% of total)
- **Sessions**: 4
- **Files processed**: 11 JSONL files
- **Messages processed**: 1,000 messages

**Token breakdown:**
- Input tokens: 30,995
- Output tokens: 54,133
- Cache creation tokens: 1,701,978
- Cache read tokens: 32,949,087

**Top Sessions:**
1. `f55c0e9f-18f1-4073-9445-d7261c2ab762`: 18,122,470 tokens
   - Summary: "Fixing Base Sepolia Hardhat Console Deployment"
   - Duration: 2h 29m (July 22, 2025)
   - 258 messages with token usage

2. `d2522682-5756-4927-a195-a8425999ff59`: 9,896,354 tokens
   - Duration: 1h 9m (July 20, 2025)
   - 142 messages with token usage

3. `4e939123-b1c0-4858-bea0-aa675c214530`: 5,876,056 tokens
   - Duration: 1h 3m (July 22, 2025)
   - 122 messages with token usage

### ERC-20 Token Project
- **Total tokens**: 55,173,426 (61.38% of total)
- **Sessions**: 6
- **Files processed**: 7 JSONL files
- **Messages processed**: 1,261 messages

**Token breakdown:**
- Input tokens: 13,969
- Output tokens: 91,003
- Cache creation tokens: 2,661,961
- Cache read tokens: 52,406,493

**Top Sessions:**
1. `0f04ae98-f5b1-42fb-abcf-0b10b1aa2dfe`: 38,544,594 tokens
   - Summary: "NPM Campaign Creation Script Execution Attempt"
   - Duration: 12h 21m (August 6-7, 2025)
   - 454 messages with token usage

2. `a1a8c5f1-ffe9-42e4-8262-5ed726796951`: 12,317,828 tokens
   - Summary: "Mac Trash Blockchains Folder File Recovery"
   - Duration: 55m (August 6, 2025)
   - 148 messages with token usage

3. `e0019b08-83d0-439b-9176-981025157b22`: 2,982,720 tokens
   - Duration: 1h 14m (August 7, 2025)
   - 93 messages with token usage

## Key Insights

### Cache Usage Dominance
- **Cache read tokens** represent 94.93% of all token usage (85,355,580 tokens)
- This indicates extensive use of context caching, which improves performance and reduces costs
- **Cache creation tokens** represent 4.86% (4,363,939 tokens)

### Output vs Input Ratio
- **Output tokens** (145,136) are 3.23x more than **input tokens** (44,964)
- This suggests detailed, comprehensive responses from Claude

### Session Characteristics
- **Longest session**: 12h 21m (ERC-20 project - NPM campaign script execution)
- **Most messages in one session**: 454 messages
- **Highest token usage session**: 38,544,594 tokens

### Project Comparison
- ERC-20 Token project used 58.85% more tokens than Blockchain project
- ERC-20 project had longer, more complex sessions on average
- Both projects show heavy reliance on context caching

## Session Timeline Analysis

### Blockchain Project Sessions
- **July 20, 2025**: 1 session (1h 9m)
- **July 22, 2025**: 3 sessions (total ~5h)
- **August 6, 2025**: 1 session (5m)

### ERC-20 Token Project Sessions
- **August 6, 2025**: 4 sessions (total ~1.5h)
- **August 6-7, 2025**: 1 long session (12h 21m)
- **August 7, 2025**: 1 session (1h 14m)

## Cost Implications

Based on Claude's pricing model, this represents significant computational work:
- Nearly 90 million tokens processed
- Extensive use of context caching (saving costs vs. non-cached tokens)
- Complex, multi-session development workflows

## Technical Notes

- Data extracted from JSONL session files stored in Claude Code's project directories
- Token counts include input, output, cache creation, and cache read tokens
- All timestamps are in ISO format with UTC timezone
- Some sessions lack summary information but contain full token usage data