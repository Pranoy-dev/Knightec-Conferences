# Deployment Fixes for Vercel

This document summarizes the fixes applied to resolve TypeScript compilation errors during Vercel deployment.

## Issue 1: TypeScript Type Inference Error in `updateConference`

### Problem
```
Type error: Argument of type '{ id?: string | undefined; ... }' is not assignable to parameter of type 'never'.
```

**Location:** `lib/db.ts:271`

### Root Cause
TypeScript was unable to properly infer the generic types for Supabase's `.update()` method, causing the parameter type to be inferred as `never`. This is a known issue with Supabase's TypeScript types in strict build environments like Vercel.

### Solution
Cast the query builder chain to bypass TypeScript's type inference:

```typescript
// Before
const { data, error } = await supabase
  .from("conferences")
  .update(updateData)
  .eq("id", conferenceId)
  .select()
  .single();

// After
const updateData: any = {
  // ... update data
};

const { data, error } = await (supabase.from("conferences") as any)
  .update(updateData)
  .eq("id", conferenceId)
  .select()
  .single();
```

**Files Changed:**
- `lib/db.ts` - Updated `updateConference` function

---

## Issue 2: Regex DotAll Flag Not Supported

### Problem
```
Type error: This regular expression flag is only available when targeting 'es2018' or later.
```

**Location:** `lib/scrape-event.ts:25`

### Root Cause
The regex pattern used the `s` flag (dotAll), which requires ES2018 or later:
```typescript
const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis;
```

However, `tsconfig.json` was targeting ES2017, which doesn't support this flag.

### Solution
Updated the TypeScript compilation target to ES2018:

```json
{
  "compilerOptions": {
    "target": "ES2018",  // Changed from "ES2017"
    // ... other options
  }
}
```

**Files Changed:**
- `tsconfig.json` - Updated target from ES2017 to ES2018

---

## Summary

Both fixes have been applied and pushed to the main branch. The deployment should now succeed on Vercel.

### Commits
1. `49c7d1c` - Fix TypeScript error in updateConference function for Vercel deployment
2. `a199868` - Fix TypeScript update type inference by casting query builder chain
3. `1e377da` - Update TypeScript target to ES2018 to support regex dotAll flag

### Testing
After these fixes, the Vercel build should:
- ✅ Compile TypeScript successfully
- ✅ Pass all type checks
- ✅ Deploy without errors
