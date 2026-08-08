# Wheel Rebuild Architecture

## File layout

```txt
apps/web/src/app/wheel/
├── page.tsx                 # Compose wheel screen, data loading, spin flow
├── wheel-model.ts           # Shared prize/history types and normalization helpers
├── wheel-plan.ts            # Build render plan, token placement, responsive rules
├── wheel-motion.ts         # Spin rotation math and easing contract
├── wheel-renderer.tsx      # Clean wheel UI, no business logic
├── wheel-rail.tsx          # Header ticker, reward rail, personal history rail
└── wheel-schema.ts         # Backward-compatible shared schema
```

## Responsibilities

### `wheel-plan.ts`
- Convert prizes into renderable slots.
- Decide preset (`five`, `six`, `eight`, `tenPlus`, `custom`).
- Compute token placement, size, radius, offsets, and render mode.
- Keep emoji/icon positions deterministic across re-renders.

### `wheel-motion.ts`
- Own spin target math.
- Own rotation progression and overshoot/settle values.
- Keep animation timing isolated from UI.

### `wheel-renderer.tsx`
- Render the wheel shell, segments, tokens, pointer, and center plate.
- Use HTML token badges instead of SVG text for emoji stability.
- Keep the screen clean and minimal.

### `wheel-rail.tsx`
- Render the ticker in the header.
- Render reward rail and personal history rail below the wheel.

### `page.tsx`
- Fetch data.
- Build plan.
- Orchestrate spin flow and refresh data.

