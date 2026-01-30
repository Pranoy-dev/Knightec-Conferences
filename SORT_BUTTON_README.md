# Why the "Sort by date" button might not have been visible

## Possible causes

1. **Cached HTML (most likely)**  
   Next.js can serve cached server-rendered HTML. If the button was added after a previous build, the first paint might still show the old page without the button.  
   **Fix:** Clear the Next.js cache and restart:
   ```bash
   cd knightecconf
   rm -rf .next
   npm run dev
   ```
   Then hard-refresh the browser (Cmd+Shift+R / Ctrl+Shift+R) or open the app in an incognito window.

2. **Layout (flex-wrap)**  
   The row used `flex-wrap`. On narrow viewports the button could wrap to a second line and sit below the fold, so it looked “missing” even though it was in the DOM.  
   **Fix:** `flex-wrap` was removed so the heading and button stay on one row.

3. **Button component / theme**  
   The shadcn `Button` with `variant="outline"` depends on theme variables (`bg-background`, `border`). If those matched the page background, the button could look invisible.  
   **Fix:** The control is now a native `<button>` with explicit styles: amber background and border when off, orange when on, so it’s always visible.

4. **Flex shrinking**  
   With `flex-1` or no `shrink-0`, the button could be given zero width by the flex container.  
   **Fix:** The button has `shrink-0` and `min-w-[140px]` so it never collapses.

## How to confirm the button is there

1. **In DevTools:**  
   - Open Elements (or Inspector).  
   - Search for `data-sort-by-date-button` or the text "Sort by date".  
   - If you find it, the button is in the DOM; the issue is styling or viewport.

2. **After clearing cache:**  
   You should see a clearly styled button to the right of “X conferences”:  
   - **Off:** Amber/yellow background and border.  
   - **On:** Orange background (“Sort by date” active).
