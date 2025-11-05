# Refactoring Opportunities

This document outlines potential refactoring opportunities to improve code quality, maintainability, and performance.

## High Priority

### 1. Rate Limiter Duplication
**Location**: `src/hooks/useNoteHandlers.ts` (lines 44-73)
**Issue**: Rate limiters are created twice - once in `useRef` and again directly after
**Recommendation**: Remove the duplicate creation and only use `useRef` initialization

```typescript
// Current: Rate limiters created twice
const saveLimiterRef = useRef(rateLimit(...));
saveLimiterRef.current = rateLimit(...); // Duplicate

// Suggested: Use useMemo or useEffect to update when dependencies change
```

### 2. Console Log Removal
**Location**: `src/utils/chromeAITest.ts`
**Issue**: Test file contains console.log statements (acceptable for tests, but could use logger)
**Recommendation**: Consider using `logDebug` from logger utility for consistency

### 3. TypeScript `any` Types
**Location**: 
- `src/services/firebase.ts` (lines 104, 127, 142) - Intentional for Proxy patterns
- `src/services/exportService.ts` (line 6) - Intentional for dynamic import

**Status**: These are intentional and acceptable for Proxy patterns and dynamic imports. ESLint comments document why.

## Medium Priority

### 4. Utility Function Consolidation
**Location**: Multiple files
**Opportunities**:
- Content validation logic scattered across `inputValidation.ts` and `ai/validation.ts`
- Summary generation logic in both `aiService.ts` and `useAICategorization.ts`
- Consider extracting shared validation functions

### 5. Error Handling Consistency
**Location**: Various service files
**Recommendation**: Standardize error handling patterns across all services
- Create common error types
- Use consistent error logging
- Implement unified error recovery strategies

### 6. Component Memoization
**Location**: Various components
**Status**: Most components already use `React.memo` appropriately
**Recommendation**: Review components that re-render frequently and consider memoization if not already present

## Low Priority

### 7. CSS Custom Properties
**Location**: `src/index.css`
**Opportunity**: Some hardcoded colors could use CSS custom properties for better theme management

### 8. Constants Extraction
**Location**: Multiple files
**Recommendation**: Extract magic numbers and repeated strings to constants files
- Animation durations
- Timeout values
- Validation thresholds

### 9. Hook Dependencies
**Location**: Various hooks
**Status**: Generally well-optimized
**Recommendation**: Periodic review of dependency arrays to ensure optimal re-render behavior

## Completed Refactorings

### ✅ Console Log Cleanup
- Replaced all `console.log` with `logDebug` utility
- Production builds automatically remove debug logs
- Consistent logging pattern across codebase

### ✅ TypeScript Strict Mode
- Enabled strict mode in `tsconfig.json`
- Added additional strict checks (`noUnusedLocals`, `noUnusedParameters`, etc.)
- Improved type safety across the codebase

### ✅ Loading Skeleton Improvements
- Conditional rendering based on view mode
- Proper table skeleton for table view
- Grid skeleton for grid view

### ✅ Cancel Button Relocation
- Moved to BulkActionBar for better UX
- Consistent positioning with Select All button

## Notes

- All intentional `any` types are documented with ESLint comments
- Test files may intentionally use console.log for debugging
- Performance optimizations are already well-implemented
- Code follows React 19 and TypeScript best practices

