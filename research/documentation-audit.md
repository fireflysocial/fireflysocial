# Documentation accuracy audit

**Reviewed: 2026-11-15.** Scope: all 38 pre-existing Markdown documents in the repository, their internal references, cited research and product claims, and the brand assets described by the documentation. This repository contains research and proposed product workflows, not an implemented application.

The review identified and corrected factual errors, overstated evidence, stale competitor descriptions, broken source links, and inconsistent workflow requirements. It does **not** certify every quotation or claim as accurate: some sources could not be read in full. The [citation inventory](citation-audit.md) records all 152 original external URLs submitted for retrieval. Replacement primary sources appear beside the corrected claims.

## Material corrections

| Area | Correction |
|---|---|
| Vancouver Foundation | Reversed the repository’s erroneous rejection of **67%**: the 2017 report explicitly reports difficulty making friends among 25–34-year-olds at that rate. Corrected **38%** frequent loneliness to low-income households, not specifically low-income young adults. Added the report page and survey comparability limitations. |
| Statistics Canada | Distinguished virtual-only **contact in the preceding month** from having exclusively online friendships; distinguished survey target population from sample size. |
| Friendship science | Replaced deterministic hour thresholds, causal decay claims and product guarantees with the actual evidence and its limits. Corrected the classroom exposure experiment, commuter versus waiting-room findings, similarity meta-analysis, and odds of survival interpretation. |
| Interview synthesis | Distinguished published accounts from original interviews and representative research. Corrected the interpretation of the artist’s “tryhard” quotation and two regular contacts versus two friends. Removed an unsupported search-snippet quotation and an ambiguous speaker attribution. |
| Competitors | Updated BFF, Timeleft, Pie and 222 from primary product sources. Corrected Luma pricing and API access, Partiful discovery and Crush behavior, and Eventbrite acquisition completion. Removed or qualified unsupported audience, funding, pricing and feature-absence claims. |
| Organizer research | Marked audience counts as dated snapshots rather than current attendance or partnerships. Corrected unsupported run length/founding-month claims and replaced broken Vancouver Magazine links. |
| Privacy and safety | Distinguished proposals from implemented safeguards. Corrected privacy-law scope, pending legislation versus enacted law, retention exceptions, presence disclosure, and limits of QR check-in and selfie verification. Clarified mutual social sharing and group-chat consent. |
| Workflow consistency | Aligned live-room access, restricted post-event selection, attendance retention, and consent rules. Marked timing and conversion targets as pilot hypotheses; moved unresolved age/privacy safeguards to pre-pilot requirements. |
| Brand | Checked SVG fills and PNG dimensions; corrected the light mark’s opaque background description and recoloring guidance. |

## Coverage

| Documents | Review |
|---|---|
| Root and brand READMEs | Repository purpose, implementation status, asset descriptions and local references. |
| Research README, problem, science, organizers, safety/privacy | Claim-to-source checks where source text was available; study design, populations, dates, legal wording, inference boundaries and consistency. |
| Competitor README and all 12 competitor notes | Primary product/help/pricing/filing evidence where available; historical versus current claims and unsupported absolutes. |
| All 15 source notes and interview synthesis | Accessible articles/reports, quote interpretation and attribution, source independence and sampling limitations. Blocked-source limitations are marked in the notes. |
| Both workflow documents | Internal consistency and whether assertions describe proposals, evidence or actual implementation. |

## Remaining evidence limitations

- **Blocked articles:** Daily Hive, BCIT News, CBC/RCI and the artist statement did not yield full original text. Search excerpts, an organizer website and a secondary CBC republication corroborate only parts of those accounts. Exact quotations, publication metadata and counts that could not be checked remain explicitly unverified in their notes. They should not be reused as verified evidence without obtaining the originals.
- **Partial scholarly access:** some publisher links returned metadata, abstracts or access restrictions. Accessible author manuscripts, repositories and institutional summaries supplemented them. This review is not a reproduction of study analyses or a systematic literature review. The 1950 Festinger book was not checked against a full original edition.
- **Personal essays and forum evidence:** author accounts, reported comments and reused quotations are not independent population measurements. The accessible October 2024 Reddit post was satirical and did not support the previous snippet quotation. The Substack version of John Zada’s essay remained restricted.
- **Changing services:** prices, city coverage, memberships, APIs and safety features can change after this date or vary by market. Unverified competitor metrics were removed or qualified. Public product pages do not prove a feature is absent, and API documentation does not itself grant permission to reuse data.
- **Legal and implementation limits:** the documentation records primary regulatory guidance and proposed controls. It does not demonstrate legal compliance, operational moderation capacity, or the security of software that is not present in this repository.

Before using an unverified quotation or metric in public materials, obtain the source, check its exact wording and context, and update the corresponding source note. Keep product hypotheses separate from empirical findings as the pilot develops.

## Repository validation

All 267 relative file links and Markdown heading references across the resulting 40 Markdown documents resolved. `git diff --check` passed. SVG fills and PNG dimensions were inspected. No application tests apply to this documentation-only repository. These checks validate repository consistency, not the truth of inaccessible external sources.
