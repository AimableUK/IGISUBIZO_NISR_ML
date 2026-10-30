# Problem A - Labour Underutilization Clustering

## Problem statement

Where is Rwanda's workforce being underutilized, and what district profiles emerge?

## Method

KMeans clustering (k=3) applied to latest-year district-level features from the LFS.

## Features used

| Feature | Description |
|---|---|
| `underemployment_rate` | % of employed working below capacity |
| `unemployment_rate` | % of labour force unemployed |
| `youth_neet_rate` | % of youth not in employment, education or training |
| `pct_agriculture` | Share of workforce in agriculture |
| `pct_formal` | Share in formal employment |
| `pct_secondary_plus` | Share with secondary or higher education |

## How it works

1. Load district data for the latest year (30 districts)
2. Min-max normalise all 6 features to [0, 1]
3. Run KMeans (k=3, deterministic seed via index-based initialisation)
4. Re-label clusters by mean underemployment rate: 0 = highest, 2 = lowest
5. Return cluster profiles (mean feature values per cluster) + district assignments

## Output

- `cluster_profiles` dataset - 3 rows, one per cluster, with mean feature values
- `district_clusters` dataset - 30 rows, one per district, with cluster assignment
- Metrics: number of clusters, count of districts in highest underutilization cluster
- Insight: which districts fall in the highest underutilization cluster

## Caveats

- KMeans cluster IDs are not stable across re-runs; only the profile labels matter
- k=3 is a design choice; the data does not determine k
- Correlation does not imply causation

## Real data replacement

Replace `buildDistrict()` in `ml-engine.ts` with real LFS district aggregates using the same column names. The clustering logic is unchanged.

**Source:** Rwanda Labour Force Survey (NISR) - https://microdatabk.statistics.gov.rw/catalog/125
