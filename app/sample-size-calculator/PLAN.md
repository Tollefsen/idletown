# A/B Test Sample Size Calculator - Implementation Plan

A tool to calculate the required sample size for statistically significant A/B test results, with an interactive graph showing how sample size varies with the minimum detectable effect (MDE).

## File Structure

```
app/sample-size-calculator/
├── components/
│   ├── InputPanel.tsx          # Input controls for parameters
│   ├── SampleSizeChart.tsx     # Recharts line chart
│   ├── ResultsSummary.tsx      # Key metrics display
│   ├── DurationEstimate.tsx    # Time-to-completion estimate
│   ├── ScenarioManager.tsx     # Save/load/presets
│   └── HowItWorks.tsx          # Expandable educational content
├── calculation/
│   ├── sampleSize.ts           # Core sample size math
│   └── sampleSize.test.ts      # Unit tests
├── page.tsx                    # Main page component
├── layout.tsx                  # SEO metadata
├── error.tsx                   # Error boundary
├── storage.ts                  # LocalStorage adapter
├── storage.test.ts             # Storage tests
├── types.ts                    # TypeScript interfaces
├── presets.ts                  # Pre-configured scenarios
└── PLAN.md                     # This file
```

---

## Phased Implementation

### Phase 1: Foundation (30-40 min)
**Goal**: Core types, calculation logic with tests, and presets

| Task | File |
|------|------|
| Create TypeScript interfaces | `types.ts` |
| Implement sample size calculation | `calculation/sampleSize.ts` |
| Write unit tests for calculations | `calculation/sampleSize.test.ts` |
| Create preset scenarios | `presets.ts` |

**Deliverable**: Tested calculation engine that can be verified with `pnpm test:run`

**Status**: [x] Completed

---

### Phase 2: Storage & Config (15-20 min)
**Goal**: Persistence layer and project registration

| Task | File |
|------|------|
| Implement localStorage adapter | `storage.ts` |
| Write storage tests | `storage.test.ts` |
| Add route, project entry, storage key | `app/config/constants.ts` |

**Deliverable**: Working storage that persists scenarios, project visible on home page

**Status**: [x] Completed

---

### Phase 3: Minimal UI (30-40 min)
**Goal**: Basic working page with inputs and results (no chart yet)

| Task | File |
|------|------|
| Create layout with metadata | `layout.tsx` |
| Create error boundary | `error.tsx` |
| Build InputPanel component | `components/InputPanel.tsx` |
| Build ResultsSummary component | `components/ResultsSummary.tsx` |
| Create main page (inputs + results only) | `page.tsx` |

**Deliverable**: Functional calculator page - enter values, see sample size results

**Status**: [x] Completed

---

### Phase 4: Chart Visualization (25-30 min)
**Goal**: Add the interactive chart

| Task | File |
|------|------|
| Build SampleSizeChart component | `components/SampleSizeChart.tsx` |
| Integrate chart into page | `page.tsx` (update) |

**Deliverable**: Full visualization showing sample size curve with current selection highlighted

**Status**: [x] Completed

---

### Phase 5: Duration Estimate (15-20 min)
**Goal**: Add time-to-completion calculator

| Task | File |
|------|------|
| Build DurationEstimate component | `components/DurationEstimate.tsx` |
| Integrate into page | `page.tsx` (update) |

**Deliverable**: Users can input daily traffic and see estimated test duration

**Status**: [x] Completed

---

### Phase 6: Scenario Management (20-25 min)
**Goal**: Save/load scenarios and presets

| Task | File |
|------|------|
| Build ScenarioManager component | `components/ScenarioManager.tsx` |
| Integrate into page | `page.tsx` (update) |

**Deliverable**: Users can save custom scenarios and load presets

**Status**: [x] Completed

---

### Phase 7: Educational Content (15-20 min)
**Goal**: Add "How It Works" section with tooltips

| Task | File |
|------|------|
| Build HowItWorks accordion component | `components/HowItWorks.tsx` |
| Add tooltips to InputPanel | `components/InputPanel.tsx` (update) |
| Integrate into page | `page.tsx` (update) |

**Deliverable**: Complete feature with educational explanations

**Status**: [ ] Not started

---

### Phase 8: Polish & Verify (10-15 min)
**Goal**: Final testing and cleanup

| Task | Description |
|------|-------------|
| Run full test suite | `pnpm test:run` |
| Run build | `pnpm build` |
| Run linter | `pnpm lint:fix` |
| Manual testing | Verify all features in browser |

**Deliverable**: Production-ready feature

**Status**: [ ] Not started

---

## Summary

| Phase | Description | Time | Cumulative State |
|-------|-------------|------|------------------|
| 1 | Foundation | 30-40 min | Tested calculation logic |
| 2 | Storage & Config | 15-20 min | Persistence ready, route registered |
| 3 | Minimal UI | 30-40 min | **Working calculator** (MVP) |
| 4 | Chart | 25-30 min | Full visualization |
| 5 | Duration | 15-20 min | Time estimates |
| 6 | Scenarios | 20-25 min | Save/load functionality |
| 7 | Education | 15-20 min | Tooltips & explanations |
| 8 | Polish | 10-15 min | Production ready |

**Total**: ~2.5-3.5 hours across all phases

After **Phase 3**, you have a usable MVP. Phases 4-7 add enhancements.

---

## Technical Details

### Statistical Formula

The sample size formula for comparing two proportions:

```
n = 2 * ((Z_α/2 + Z_β)² * p̄(1-p̄)) / (p₁ - p₂)²
```

Where:
- **n** = sample size per variation
- **Z_α/2** = Z-score for significance level (e.g., 1.96 for 95% confidence)
- **Z_β** = Z-score for power (e.g., 0.84 for 80% power)
- **p̄** = pooled proportion = (p₁ + p₂) / 2
- **p₁** = baseline conversion rate
- **p₂** = expected conversion rate after improvement

### Z-Score Reference

| Significance (α) | Z-score (two-tailed) |
|------------------|---------------------|
| 80% | 1.282 |
| 90% | 1.645 |
| 95% | 1.960 |
| 99% | 2.576 |

| Power (1-β) | Z-score |
|-------------|---------|
| 70% | 0.524 |
| 80% | 0.842 |
| 90% | 1.282 |
| 95% | 1.645 |

### Preset Scenarios

1. **E-commerce Checkout**: baseline 3%, MDE 5%
2. **Email Signup**: baseline 10%, MDE 10%
3. **SaaS Trial Conversion**: baseline 2%, MDE 20%
4. **CTA Button Click**: baseline 5%, MDE 15%
