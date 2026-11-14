import type { LocalizedChallengeFields } from "./worlds_en";

export const CHALLENGES_EN_DS2A: Record<string, LocalizedChallengeFields> = {
  "ds-stat-01": {
    "title": "Mean, Median & Mode",
    "description": "Given dados=[2,4,4,4,5,5,7,9], compute and print the mean and median using statistics.",
    "narrative": "The three measures of central tendency are your first line of telemetry inspection.",
    "concept": "Central Tendency",
    "conceptExplanation": "Three CENTRAL TENDENCY metrics summarize where data clusters: (1) MEAN — sum divided by N, sensitive to outliers (one extreme value drags the mean); (2) MEDIAN — the middle value when sorted, robust to outliers; (3) MODE — most frequent value, useful for categoricals. When mean equals median, the distribution is symmetric. When mean > median, the distribution is right-skewed (e.g., income). Average salary misleads because a few CEOs skew it upward; median salary tells the real story.",
    "hints": [
      "statistics.mean(dados) computes the mean; statistics.median(dados) computes the median.",
      "Print each one on separate lines with two print() calls.",
      "print(statistics.mean(dados))\nprint(statistics.median(dados))"
    ],
    "successStory": "Distribution center identified."
  },
  "ds-stat-02": {
    "title": "Variance & Standard Deviation",
    "description": "Compute statistics.variance(dados) and statistics.stdev(dados), printing each one.",
    "narrative": "Dispersion metrics reveal how widely the signals scatter around the center.",
    "concept": "Dispersion (Variance & Standard Deviation)",
    "conceptExplanation": "Variance and standard deviation measure DISPERSION — how far points lie from the mean. VARIANCE = average squared deviation (squared units, hard to interpret directly). STANDARD DEVIATION = square root of variance (same units as the data, directly interpretable). In a normal distribution, ~68% of values fall within ±1 standard deviation of the mean, ~95% within ±2σ, and ~99.7% within ±3σ (empirical rule). statistics.variance is SAMPLE variance (n-1 denominator); statistics.pvariance is POPULATION variance (n).",
    "hints": [
      "statistics.variance(dados) computes sample variance; stdev is the square root of variance.",
      "Print them on separate lines.",
      "print(statistics.variance(dados))\nprint(statistics.stdev(dados))"
    ],
    "successStory": "Dispersion quantified."
  },
  "ds-stat-03": {
    "title": "Normal Distribution",
    "description": "Use stats.norm.pdf(0, loc=0, scale=1) to compute the probability density at 0 for the standard normal distribution. Print it.",
    "narrative": "The bell curve governs half of classical statistics.",
    "concept": "Normal Distribution",
    "conceptExplanation": "The NORMAL (Gaussian) distribution is the cornerstone of statistics — a symmetric bell curve defined by two parameters: μ (mean, center) and σ (standard deviation, spread). It emerges across natural phenomena (height, measurement noise), in the Central Limit Theorem, and underpins parametric tests (t-tests, ANOVA, regression). scipy.stats.norm provides: pdf (density), cdf (cumulative probability), ppf (inverse quantiles), and rvs (random sampling). Standard normal: μ=0, σ=1 — standardizing data with a z-score maps it directly onto this curve.",
    "hints": [
      "stats.norm is the normal distribution. PDF (probability density function) is evaluated at a point.",
      "loc is the mean (μ), scale is the standard deviation (σ). Standard normal: loc=0, scale=1.",
      "print(stats.norm.pdf(0, loc=0, scale=1))"
    ],
    "successStory": "Bell curve mapped."
  },
  "ds-stat-04": {
    "title": "Z-Score",
    "description": "Given valor=85, media=70, desvio=10, compute z = (valor - media) / desvio and print it.",
    "narrative": "Z-score normalizes any telemetry reading into units of standard deviation.",
    "concept": "Z-Score (Standardization)",
    "conceptExplanation": "A Z-score (standardization) expresses a value in STANDARD DEVIATION UNITS relative to the mean: z = (x - μ) / σ. Z=0 sits right at the mean; Z=1 is one standard deviation above; Z=-1.5 is 1.5 deviations below. In a standard normal curve, |z| > 2 occurs ~5% of the time and |z| > 3 only ~0.3% — hence the '3-sigma rule' for anomalies. Z-score powers scikit-learn's StandardScaler: scaling features before distance-sensitive models like KNN, SVM, and neural networks prevents large-magnitude features from dominating training.",
    "hints": [
      "Z-score = (valor - media) / desvio. It measures how many standard deviations away from the mean a value sits.",
      "Positive Z = above average; negative = below. |Z| > 3 typically flags an outlier.",
      "z = (valor - media) / desvio\nprint(z)"
    ],
    "successStory": "Value standardized in deviations."
  },
  "ds-stat-05": {
    "title": "CDF (Cumulative Probability)",
    "description": "Use stats.norm.cdf(1.96) to compute P(Z ≤ 1.96) in the standard normal distribution. Print it.",
    "narrative": "CDF answers one key question: what is the probability of being LESS THAN OR EQUAL TO X?",
    "concept": "PDF vs CDF",
    "conceptExplanation": "Every probability distribution relies on two core functions: PDF (Probability Density Function) — for continuous variables, measures density at a point (NOT a direct probability; the probability of an exact single point is zero); CDF (Cumulative Distribution Function) — returns P(X ≤ value), cumulative probability up to that threshold. For discrete distributions (Binomial, Poisson), PMF replaces PDF. PPF (Percent Point Function) is the inverse CDF — pass a probability to get the critical value (e.g., stats.norm.ppf(0.975) = 1.96). Together, these three cover 99% of probability queries.",
    "hints": [
      "CDF (Cumulative Distribution Function) returns P(X ≤ value) — accumulated probability up to that threshold.",
      "1.96 is the classic critical z-value — cdf returns ~0.975 (95% two-tailed confidence).",
      "print(stats.norm.cdf(1.96))"
    ],
    "successStory": "Cumulative probability calculated."
  },
  "ds-stat-06": {
    "title": "Binomial Distribution",
    "description": "Compute stats.binom.pmf(k=3, n=10, p=0.5) — the probability of exactly 3 successes in 10 trials with p=0.5. Print it.",
    "narrative": "Binary outcomes: pass or fail, repeated N times.",
    "concept": "Binomial Distribution",
    "conceptExplanation": "The Binomial distribution models the count of SUCCESSES in N INDEPENDENT trials, each with the same success probability p. Parameters: n (trials), p (probability per trial), k (target successes). Use cases: coin flips, conversion rates, quality control, A/B tests. Because it is discrete, use PMF (not PDF). Mean = n*p, variance = n*p*(1-p). For large N and moderate p, it approximates the Normal distribution (Central Limit Theorem). For large N and tiny p, it approaches Poisson. Related: Bernoulli (n=1), Negative Binomial (waiting for K successes).",
    "hints": [
      "Binomial counts successes across N independent trials with fixed probability p.",
      "PMF (Probability Mass Function) for discrete variables is the counterpart to PDF for continuous ones.",
      "print(stats.binom.pmf(k=3, n=10, p=0.5))"
    ],
    "successStory": "Success probability isolated."
  },
  "ds-stat-07": {
    "title": "Poisson Distribution",
    "description": "Compute stats.poisson.pmf(k=5, mu=3) — the probability of 5 events when the average rate is 3. Print it.",
    "narrative": "Model rare events arriving across fixed intervals of time or space.",
    "concept": "Poisson Distribution",
    "conceptExplanation": "Poisson models event counts in a fixed interval (time, area, volume) when: (1) events are INDEPENDENT; (2) the average rate is constant; (3) events don't occur simultaneously. Single parameter: λ (mu) = average rate = mean = variance. Applications: support calls per hour, traffic spikes, server requests per minute, DNA mutations, defects per square meter. Connection to Binomial: Poisson is the limit of Binomial(n, p) as n→∞ and p→0 while n*p=λ stays constant. In modern ML, it powers count prediction via Poisson Regression.",
    "hints": [
      "Poisson models event counts when you only know the average rate (mu) — no fixed N trials needed.",
      "Examples: calls/hour, server requests/minute, errors/day.",
      "print(stats.poisson.pmf(k=5, mu=3))"
    ],
    "successStory": "Rare-event model applied."
  },
  "ds-stat-08": {
    "title": "Quartiles & Percentiles",
    "description": "Use np.percentile(dados, 75) to compute the third quartile (Q3). Print it.",
    "narrative": "Quartiles slice sorted telemetry into four equal quadrants.",
    "concept": "Quartiles, Percentiles & IQR",
    "conceptExplanation": "The Pth percentile is the cutoff below which P% of sorted observations lie. QUARTILES are key percentiles: Q1=25 (first quartile), Q2=50 (median), Q3=75 (third quartile). IQR (Interquartile Range) = Q3 - Q1 = the middle 50% spread — resilient to outliers unlike standard deviation. Tukey's outlier rule: x > Q3 + 1.5*IQR or x < Q1 - 1.5*IQR flags candidate anomalies (the basis of boxplots). In pandas, df.quantile(0.75) does the exact same thing.",
    "hints": [
      "np.percentile(dados, 75) returns the cutoff below which 75% of the values fall.",
      "Q1=25, Q2=50 (median), Q3=75. IQR (interquartile range) = Q3 - Q1.",
      "print(np.percentile(dados, 75))"
    ],
    "successStory": "Quantile isolated."
  },
  "ds-stat-09": {
    "title": "Pearson Correlation",
    "description": "Use stats.pearsonr(x, y) and print the correlation coefficient (first return value).",
    "narrative": "Measure the strength and direction of a LINEAR relationship between two signals.",
    "concept": "Pearson Correlation",
    "conceptExplanation": "Pearson's coefficient (r) measures the strength and direction of a LINEAR relationship between two numeric variables. Range: -1 to +1 (+1 = perfect positive slope; -1 = perfect negative slope; 0 = NO linear relation, though a curved non-linear pattern may still exist). Limitations: assumes linearity and is sensitive to outliers. CORRELATION IS NOT CAUSATION — ice cream sales and drownings correlate strongly, both driven by summer heat. pearsonr also returns a p-value to test statistical significance.",
    "hints": [
      "stats.pearsonr returns a TUPLE (coefficient, p_value). Index with [0] or unpack it.",
      "Values range from -1 to 1: 1 = perfect positive linear correlation, -1 = perfect negative, 0 = no linear relation.",
      "r, p = stats.pearsonr(x, y)\nprint(r)"
    ],
    "successStory": "Linear relationship quantified."
  },
  "ds-stat-10": {
    "title": "Spearman Correlation",
    "description": "Use stats.spearmanr(x, y) and print the correlation coefficient.",
    "narrative": "Capture monotonic trends even when the curve isn't a straight line.",
    "concept": "Spearman Correlation",
    "conceptExplanation": "Spearman is the NON-PARAMETRIC counterpart to Pearson — it correlates RANKS (sorted positions) instead of raw values. Advantages: (1) detects MONOTONIC relationships (y = x² for x > 0 gives Spearman=1 while Pearson < 1); (2) ROBUST to outliers; (3) works with ORDINAL scales (rankings, satisfaction ratings). Choose Spearman when data is non-normal, skewed, or non-linear. Kendall's Tau is an even more conservative rank-based alternative preferred on very small samples.",
    "hints": [
      "spearmanr operates on RANKS (sorted positions) rather than raw numbers.",
      "Detects monotonic relationships (as one grows, the other consistently moves in one direction, even non-linearly).",
      "r, p = stats.spearmanr(x, y)\nprint(r)"
    ],
    "successStory": "Monotonic trend captured."
  },
  "ds-stat-11": {
    "title": "Hypothesis Testing (Concept)",
    "description": "Given p_value=0.03 and alpha=0.05, print 'Rejeitar H0' if p_value < alpha, otherwise 'Não rejeitar H0'.",
    "narrative": "The decision core of classical statistical inference.",
    "concept": "Hypothesis Testing (H0, H1, α)",
    "conceptExplanation": "Hypothesis testing follows a clear protocol: (1) H0 (null hypothesis) — the default status quo we test against (e.g., 'no difference between groups'); (2) H1 (alternative) — what we aim to prove ('there is a difference'); (3) α (significance level) — accepted risk of falsely rejecting H0 (typically 0.05); (4) compute the test statistic and p-value; (5) if p < α, REJECT H0. CRITICAL: 'failing to reject H0' does NOT prove 'H0 is true' — only that evidence is insufficient (perhaps underpowered sample size), just like 'not guilty' in court.",
    "hints": [
      "H0 (null hypothesis) is the baseline assumption. Reject it only on strong evidence: p_value < alpha.",
      "alpha=0.05 (standard) means accepting a 5% false-positive risk of rejecting a true H0.",
      "if p_value < alpha:\n    print('Rejeitar H0')\nelse:\n    print('Não rejeitar H0')"
    ],
    "successStory": "Statistical decision executed."
  },
  "ds-stat-12": {
    "title": "One-Sample T-Test",
    "description": "Use stats.ttest_1samp(dados, popmean=50) and print the p-value (second return value).",
    "narrative": "Benchmark your sample mean against a known system baseline.",
    "concept": "One-Sample T-Test",
    "conceptExplanation": "A one-sample t-test checks whether your sample mean differs significantly from a reference value (popmean). Assumptions: independent observations and approximate normality (for larger N, the CLT relaxes this). H0: μ = reference; H1: μ ≠ reference. For one-sided tests (μ > X or μ < X), pass alternative='greater' or 'less'. The t-statistic follows Student's t-distribution, which has heavier tails than the normal curve on small samples.",
    "hints": [
      "ttest_1samp tests if the sample mean differs from a target popmean.",
      "It returns (t_statistic, p_value). Print only the p_value.",
      "t, p = stats.ttest_1samp(dados, popmean=50)\nprint(p)"
    ],
    "successStory": "Hypothesis verified."
  },
  "ds-stat-13": {
    "title": "Two-Sample T-Test",
    "description": "Use stats.ttest_ind(grupo_a, grupo_b) and print the p-value.",
    "narrative": "Compare means across two independent cohorts — the classic A/B test.",
    "concept": "Independent Two-Sample T-Test",
    "conceptExplanation": "ttest_ind compares the MEANS of two INDEPENDENT groups (unpaired). It is the standard engine behind A/B tests comparing control vs. treatment. Assumptions: (1) independent cohorts; (2) approximate normality per group; (3) similar variances (otherwise pass equal_var=False for Welch's t-test, which is safer by default). H0: group means are equal. With large samples (n > 30 per group), non-normality rarely breaks it; for small skewed samples, use Mann-Whitney U.",
    "hints": [
      "ttest_ind tests whether TWO independent groups have significantly different means.",
      "It's the standard test for A/B experiments — control group vs. treatment group.",
      "t, p = stats.ttest_ind(grupo_a, grupo_b)\nprint(p)"
    ],
    "successStory": "Inter-group divergence confirmed."
  },
  "ds-stat-14": {
    "title": "Paired T-Test",
    "description": "Use stats.ttest_rel(antes, depois) to compare paired measurements. Print the p-value.",
    "narrative": "Same subject measured before and after a patch — pairing boosts statistical power.",
    "concept": "Paired T-Test",
    "conceptExplanation": "A paired t-test (ttest_rel) compares two measurements from PAIRED units: the same user/machine before and after a patch, pre/post training scores, or matched pairs. Key advantage over ttest_ind: pairing cancels out subject-to-subject baseline variance, giving dramatically higher statistical power with fewer samples. Mathematically, it equals running ttest_1samp on the per-pair differences against zero.",
    "hints": [
      "ttest_rel is for REPEATED / PAIRED measures — the same entity measured in two states.",
      "More powerful than ttest_ind because it removes baseline individual variance.",
      "t, p = stats.ttest_rel(antes, depois)\nprint(p)"
    ],
    "successStory": "Intervention impact proven."
  },
  "ds-stat-15": {
    "title": "ANOVA",
    "description": "Use stats.f_oneway(g1, g2, g3) to test whether three groups have different means. Print the p-value.",
    "narrative": "Compare three or more groups simultaneously without inflating Type I errors.",
    "concept": "ANOVA (Analysis of Variance)",
    "conceptExplanation": "ANOVA tests whether at least one group mean among three or more groups differs from the rest. Why not run pairwise t-tests across all pairs? Every extra test compounds false-positive risk (the MULTIPLE COMPARISONS PROBLEM). ANOVA consolidates everything into ONE omnibus test. Assumptions: independence, normality per group, equal variances (homoscedasticity). Note: a significant result tells you THAT groups differ, not WHICH pair differs — follow up with post-hoc tests (like Tukey HSD).",
    "hints": [
      "f_oneway (one-way ANOVA) checks whether at least ONE group mean differs from the others.",
      "Use ANOVA instead of stacked t-tests to keep family-wise Type I error under control.",
      "f, p = stats.f_oneway(g1, g2, g3)\nprint(p)"
    ],
    "successStory": "Multi-group variance analyzed."
  },
  "ds-stat-16": {
    "title": "Chi-Square Test",
    "description": "Use stats.chi2_contingency(tabela) and print the p-value (second return value).",
    "narrative": "Test whether two categorical variables are statistically independent.",
    "concept": "Chi-Square (Independence)",
    "conceptExplanation": "The Chi-Square test of independence evaluates whether two CATEGORICAL variables are related. Build a CONTINGENCY TABLE of counts and it compares OBSERVED frequencies against EXPECTED frequencies under independence. H0: the variables are independent. Examples: region vs. conversion plan, OS vs. crash category. Assumption: expected cell counts ≥ 5 (otherwise use Fisher's Exact Test). For goodness-of-fit on a single categorical variable, use stats.chisquare.",
    "hints": [
      "chi2_contingency takes a frequency matrix and tests INDEPENDENCE between two categorical variables.",
      "Returns (chi2, p_value, dof, expected). Print the second element.",
      "chi2, p, dof, esp = stats.chi2_contingency(tabela)\nprint(p)"
    ],
    "successStory": "Categorical independence tested."
  },
  "ds-stat-17": {
    "title": "Normality Test",
    "description": "Use stats.shapiro(dados) to test for normality. Print the p-value.",
    "narrative": "Before running parametric protocols, verify whether your distribution is Gaussian.",
    "concept": "Normality Tests",
    "conceptExplanation": "Many classical parametric tests (t-tests, ANOVA) assume normality. Shapiro-Wilk is the go-to formal check: H0 = data is normally distributed. p > 0.05 means fail to reject normality. WATCH OUT: on large samples (>5000), tiny irrelevant deviations yield p < 0.05 — always pair tests with visual checks (histograms, Q-Q plots). When data is strongly non-normal on small samples, switch to non-parametric tests (Mann-Whitney U, Kruskal-Wallis, Spearman).",
    "hints": [
      "shapiro tests H0: data comes from a normal distribution. p > 0.05 does not reject normality.",
      "On huge samples, tiny quirks trigger low p-values — always inspect visually with a Q-Q plot too.",
      "w, p = stats.shapiro(dados)\nprint(p)"
    ],
    "successStory": "Distribution shape verified."
  },
  "ds-stat-18": {
    "title": "Mann-Whitney U",
    "description": "Use stats.mannwhitneyu(a, b) — the non-parametric alternative to the t-test. Print the p-value.",
    "narrative": "When Gaussian assumptions collapse, rank-based inference holds the line.",
    "concept": "Non-Parametric Tests",
    "conceptExplanation": "Non-parametric tests avoid assuming a specific distribution family by operating on RANKS rather than raw magnitudes. Benefits: (1) valid on skewed/non-normal data; (2) resilient to extreme outliers; (3) works on ordinal scales. Direct swaps: Mann-Whitney U replaces ttest_ind; Wilcoxon signed-rank replaces ttest_rel; Kruskal-Wallis replaces ANOVA; Spearman replaces Pearson. Trade-off: slightly lower statistical power when parametric assumptions truly hold.",
    "hints": [
      "mannwhitneyu is the non-parametric counterpart to ttest_ind — it compares ranks instead of means.",
      "Use it when distributions are skewed or data is ordinal (Likert scales, rankings).",
      "u, p = stats.mannwhitneyu(a, b)\nprint(p)"
    ],
    "successStory": "Non-parametric protocol applied."
  },
  "ds-stat-19": {
    "title": "Confidence Interval",
    "description": "Given media=50 and sem=2, compute the 95% CI: media ± 1.96 * sem. Print the lower and upper bounds.",
    "narrative": "Report uncertainty alongside every point estimate.",
    "concept": "Confidence Intervals",
    "conceptExplanation": "A CONFIDENCE INTERVAL provides a plausible range for an unknown population parameter at a chosen confidence level (commonly 95%). Frequentist meaning: 'if we repeated this sampling procedure many times, 95% of computed intervals would capture the true parameter.' Formula for a mean: CI = x̄ ± Z * SEM, where SEM = σ/√n (Z=1.96 for 95%, Z=2.58 for 99%). Narrower intervals indicate higher precision, achieved by increasing sample size N.",
    "hints": [
      "95% CI = media ± Z * sem, with Z=1.96 for 95% confidence.",
      "Print the lower bound (media - 1.96*sem) and upper bound (media + 1.96*sem).",
      "print(media - 1.96 * sem)\nprint(media + 1.96 * sem)"
    ],
    "successStory": "Confidence band calculated."
  },
  "ds-stat-20": {
    "title": "Standard Error of the Mean",
    "description": "Compute sem = desvio / sqrt(n) with desvio=10 and n=25. Print it.",
    "narrative": "Precision of your estimated mean scales with the square root of sample size.",
    "concept": "Standard Error of the Mean (SEM)",
    "conceptExplanation": "SEM quantifies the uncertainty of the SAMPLE MEAN — not the spread of individual points. Formula: SEM = σ/√n. Crucial distinction: σ (standard deviation) describes DATA dispersion; SEM describes PRECISION OF YOUR ESTIMATE. Growing N shrinks SEM toward zero while σ stays roughly constant. Never plot SEM bars while pretending they represent data spread — SEM bars look dramatically narrower and can mislead readers.",
    "hints": [
      "SEM (Standard Error of the Mean) = σ / √n. Larger N shrinks SEM.",
      "Use math.sqrt(n) for the square root.",
      "sem = desvio / math.sqrt(n)\nprint(sem)"
    ],
    "successStory": "Estimate precision quantified."
  },
  "ds-stat-21": {
    "title": "Central Limit Theorem",
    "description": "Simulate sample means of size 5 over amostras = [[1,2,3,4,5], [2,4,6,8,10], [10,10,10,10,10]]. Build the list medias and print round(media_geral, 1).",
    "narrative": "The single most foundational theorem in classical statistics.",
    "concept": "Central Limit Theorem",
    "conceptExplanation": "CLT: regardless of the underlying population shape (uniform, exponential, skewed), the DISTRIBUTION OF SAMPLE MEANS for size N converges toward a NORMAL curve as N grows. That's why parametric methods (t-tests, ANOVA) stay reliable on non-normal raw data once N is decent (rule of thumb: N ≥ 30). Caveat: requires finite variance — heavy-tailed distributions like Cauchy violate it.",
    "hints": [
      "Each sample mean can be calculated via sum(amostra) / len(amostra).",
      "Store those sample means in a list named medias.",
      "medias = [sum(a) / len(a) for a in amostras]\nmedia_geral = sum(medias) / len(medias)\nprint(round(media_geral, 1))"
    ],
    "successStory": "Fundamental law understood."
  },
  "ds-stat-22": {
    "title": "Sample Size",
    "description": "Compute required per-group n using the rule-of-thumb approximation n = ceil(16 / efeito**2) for efeito=0.5. Print n.",
    "narrative": "How many observations do you need before launching an experiment?",
    "concept": "Power Analysis & Sample Size",
    "conceptExplanation": "BEFORE collecting telemetry, compute required sample size — otherwise you risk: (1) underpowered sample → missing real effects (Type II error); (2) oversized sample → wasted resources. Power Analysis links 4 quantities (fix 3, solve for 1): effect size (d), α level (usually 0.05), power (usually 0.80), and sample size N. For medium Cohen's d=0.5, α=0.05, power=0.80 → N ≈ 64 per group. Use statsmodels.stats.power in production A/B planning.",
    "hints": [
      "Use math.ceil to round up to the nearest integer.",
      "Exponentiation in Python uses **2.",
      "n = math.ceil(16 / efeito**2)\nprint(n)"
    ],
    "successStory": "Experiment properly sized."
  },
  "ds-stat-23": {
    "title": "A/B Testing Framework",
    "description": "Print 'Variante B significativamente melhor.' if p_value < 0.05, otherwise print 'Inconclusivo.'.",
    "narrative": "The industry protocol for validating product and system upgrades.",
    "concept": "A/B Testing",
    "conceptExplanation": "A/B testing validates changes rigorously: (1) define H0 (no difference) and H1 (variant B differs); (2) compute sample size upfront; (3) randomize users into A (control) and B (treatment); (4) collect across a full cycle; (5) test with ttest_ind (continuous) or z-test of proportions (conversion rates); (6) decide using BOTH p-value and practical effect size. Pitfalls: peeking early inflates Type I error; seasonality; novelty bias; and running many unadjusted metrics (apply Bonferroni).",
    "hints": [
      "Structure: if p_value < 0.05 → winner; else → inconclusive.",
      "Print the exact required string literal.",
      "if p_value < 0.05:\n    print('Variante B significativamente melhor.')\nelse:\n    print('Inconclusivo.')"
    ],
    "successStory": "Product decision validated."
  },
  "ds-stat-24": {
    "title": "Bootstrap",
    "description": "Implement deterministic bootstrap resampling: dados=[2,4,6], indices=[0,0,2]. Build amostra_boot and print its mean.",
    "narrative": "When no closed-form formula exists, resample directly from your own data.",
    "concept": "Bootstrap",
    "conceptExplanation": "Bootstrapping is RESAMPLING WITH REPLACEMENT: from one observed sample of size N, draw thousands of bootstrap samples of size N with replacement and recompute your statistic (mean, median, F1, anything) on each draw to estimate its sampling distribution and confidence intervals. Benefits: (1) zero normality assumptions; (2) works for arbitrary custom metrics. In ML, bagging (Random Forests) is literally bootstrap + aggregation. Check scipy.stats.bootstrap.",
    "hints": [
      "Bootstrap draws with replacement; here indices are fixed so the test stays deterministic.",
      "Use a list comprehension: [dados[i] for i in indices].",
      "amostra_boot = [dados[i] for i in indices]\nprint(sum(amostra_boot) / len(amostra_boot))"
    ],
    "successStory": "Universal resampling mastered."
  },
  "ds-stat-25": {
    "title": "Bonferroni Correction",
    "description": "For 5 simultaneous tests, compute adjusted alpha = 0.05/5 = 0.01. Print alpha / n_testes.",
    "narrative": "Multiple simultaneous tests inflate false positives — divide alpha to hold the line.",
    "concept": "Multiple Comparisons Correction",
    "conceptExplanation": "Running many tests simultaneously inflates Type I errors: at α=0.05 each, 20 independent tests carry ~64% chance of at least one false alarm. BONFERRONI CORRECTION divides α by the number of tests (α_adj = α/N) to cap the Family-Wise Error Rate (FWER). It is conservative (reduces power); Holm-Bonferroni offers higher power at the same FWER guarantee, while Benjamini-Hochberg controls False Discovery Rate (FDR) in high-throughput fields like genomics.",
    "hints": [
      "Bonferroni: alpha_adj = alpha / n_testes.",
      "Simply divide alpha by n_testes.",
      "print(alpha / n_testes)"
    ],
    "successStory": "Type I error contained."
  },
  "ds-stat-26": {
    "title": "Linear Regression (Statsmodels)",
    "description": "Use sm.OLS(y, X).fit() and print 'Regressão ajustada.'.",
    "narrative": "Statsmodels delivers regression with full inferential telemetry (p-values, CIs, R²).",
    "concept": "Statsmodels (Inference)",
    "conceptExplanation": "Python's two regression pillars serve different goals: scikit-learn (.fit/.predict) focuses on PREDICTION; statsmodels focuses on INFERENCE. Calling sm.OLS(y, X).fit().summary() produces standard errors, coefficient p-values, confidence intervals, adjusted R², AIC/BIC, and residual diagnostics — letting you verify which features truly matter statistically.",
    "hints": [
      "sm.OLS(y, X) initializes the model; .fit() estimates the parameters.",
      "Unlike scikit-learn (prediction-first), statsmodels targets STATISTICAL INFERENCE with coefficient p-values and CIs.",
      "modelo = sm.OLS(y, X).fit()\nprint('Regressão ajustada.')"
    ],
    "successStory": "Inferential model ready."
  },
  "ds-stat-27": {
    "title": "Adjusted R²",
    "description": "Given r2=0.85, n=100, k=5 features, compute r2_ajustado = 1 - (1-r2)*(n-1)/(n-k-1) and print it.",
    "narrative": "Penalize raw R² for adding useless noise features.",
    "concept": "Adjusted R²",
    "conceptExplanation": "Standard R² ALWAYS increases or stays flat when adding features — even pure random noise. ADJUSTED R² penalizes superfluous predictors: 1 - (1-R²)*(n-1)/(n-k-1), where n is sample count and k is feature count. If a new feature doesn't improve fit enough to justify its degree of freedom, Adjusted R² drops. Use it (alongside AIC, BIC, or CV R²) when comparing models with different feature counts.",
    "hints": [
      "Formula: 1 - (1 - r2) * (n - 1) / (n - k - 1).",
      "Mind operator precedence — wrap terms in parentheses carefully.",
      "r2_ajustado = 1 - (1 - r2) * (n - 1) / (n - k - 1)\nprint(r2_ajustado)"
    ],
    "successStory": "Honest metric computed."
  },
  "ds-stat-28": {
    "title": "Bayesian Inference",
    "description": "Compute a simple Bayesian posterior for a positive test: prior=0.01, sensibilidade=0.95, falso_positivo=0.05. Print round(posterior, 3).",
    "narrative": "Update beliefs dynamically as fresh evidence hits the stream.",
    "concept": "Bayesian Inference",
    "conceptExplanation": "Bayesian inference flips the frequentist lens: instead of P(data | fixed parameter), it computes P(PARAMETER | observed data). Bayes' Theorem: Posterior ∝ Likelihood × Prior. PRIOR encodes initial belief; LIKELIHOOD quantifies evidence support; POSTERIOR updates belief after observing data. Python ecosystems: PyMC, Stan, NumPyro — widely used in Bayesian A/B testing, anomaly detection, and online personalization.",
    "hints": [
      "The denominator (marginal probability of a positive test) is sensibilidade*prior + falso_positivo*(1-prior).",
      "Divide the joint probability (sensibilidade * prior) by that denominator.",
      "posterior = (sensibilidade * prior) / (sensibilidade * prior + falso_positivo * (1 - prior))\nprint(round(posterior, 3))"
    ],
    "successStory": "Beliefs updated with evidence."
  },
  "ds-stat-29": {
    "title": "Student's t-Distribution",
    "description": "Use stats.t.cdf(2.0, df=10) and print the result.",
    "narrative": "Bell-shaped like the normal curve, but with heavier tails built for small samples.",
    "concept": "Student's t-Distribution",
    "conceptExplanation": "Student's t-distribution mirrors the normal curve with HEAVIER TAILS — capturing extra uncertainty when population σ is unknown and estimated from a small sample. Parameter: df (degrees of freedom, e.g. n-1). At small df (5, 10), extreme values occur more often than under a normal curve; past df > 30, it converges closely to the standard normal. In scipy, stats.t exposes the same pdf/cdf/ppf/rvs API as stats.norm.",
    "hints": [
      "Student's t takes parameter 'df' (degrees of freedom), typically n-1 in a one-sample t-test.",
      "For large df (>30) it approximates the normal; for small df, tails stay heavier.",
      "print(stats.t.cdf(2.0, df=10))"
    ],
    "successStory": "Heavy-tail model calibrated."
  },
  "ds-stat-30": {
    "title": "Type I vs Type II Error",
    "description": "Create a function classificar_erro(h0_verdadeira, rejeitou_h0) returning 'Tipo I', 'Tipo II', or 'Sem erro'. Test with h0_verdadeira=True and rejeitou_h0=True.",
    "narrative": "Master the two failure modes underlying every statistical decision.",
    "concept": "Error Types",
    "conceptExplanation": "Every hypothesis test faces two errors: TYPE I (α) = REJECTING H0 when it is actually TRUE (false positive — detecting a phantom signal); TYPE II (β) = FAILING TO REJECT H0 when it is FALSE (false negative — missing a real anomaly). Lowering α raises β and vice versa. Standard benchmarks: α=0.05, β=0.20 (power = 80%). Weigh domain risk carefully: in medicine or intrusion detection, a missed threat (Type II) can be catastrophic.",
    "hints": [
      "Type I ('Tipo I') occurs when H0 is true (h0_verdadeira=True) and you reject it (rejeitou_h0=True).",
      "Type II ('Tipo II') occurs when H0 is false and you fail to reject it.",
      "def classificar_erro(h0_verdadeira, rejeitou_h0):\n    if h0_verdadeira and rejeitou_h0:\n        return 'Tipo I'\n    if not h0_verdadeira and not rejeitou_h0:\n        return 'Tipo II'\n    return 'Sem erro'\n\nprint(classificar_erro(True, True))"
    ],
    "successStory": "Error trade-off understood."
  },
  "ds-ts-01": {
    "title": "Pandas Datetime",
    "description": "Convert the string '2024-03-15' to a Timestamp using pd.to_datetime and print it.",
    "narrative": "Everything in time series starts with converting raw string telemetry into proper datetime objects.",
    "concept": "pd.to_datetime",
    "conceptExplanation": "pd.to_datetime is the Swiss Army knife for converting strings into pandas Timestamp objects. It automatically parses a variety of formats (ISO, American, international). For non-obvious custom formats, pass format='%Y-%m-%d %H:%M:%S' (strftime syntax). For lists, it returns a DatetimeIndex (an efficient index for time series). The errors='coerce' parameter converts invalid values to NaT (Not-a-Time) instead of raising an error. Without proper datetimes, you lose access to critical temporal operations (resample, rolling, dt accessors).",
    "hints": [
      "pd.to_datetime(string) converts any common format into a Timestamp.",
      "For custom formats: pd.to_datetime(s, format='%d/%m/%Y').",
      "print(pd.to_datetime('2024-03-15'))"
    ],
    "successStory": "Chronological timestamp parsed successfully."
  },
  "ds-ts-02": {
    "title": "DatetimeIndex",
    "description": "Create datas = pd.date_range('2024-01-01', periods=5, freq='D') and print it.",
    "narrative": "Regular date sequences form the temporal grid for any time series stream.",
    "concept": "date_range",
    "conceptExplanation": "pd.date_range generates a regular sequence of dates — the backbone of synthetic time series and chronological indexes. Parameters: start, end (or periods), freq. Common frequencies: 'D' (daily), 'H' (hourly), 'T' or 'min' (minute), 'S' (second), 'W' (weekly), 'M' (month end), 'MS' (month start), 'Q' (quarterly), 'Y' (yearly), 'B' (business days). Use it as a DataFrame index: df.index = pd.date_range(...). This unlocks advanced temporal operations (resample, rolling, shift). For timezones: tz='America/Sao_Paulo' converts it into a timezone-aware timestamp.",
    "hints": [
      "pd.date_range(start, periods, freq) generates a sequence of dates. freq='D' = daily, 'H' = hourly, 'M' = monthly.",
      "periods sets the count; alternatively pass end instead of periods.",
      "datas = pd.date_range('2024-01-01', periods=5, freq='D')\nprint(datas)"
    ],
    "successStory": "Temporal timeline generated."
  },
  "ds-ts-03": {
    "title": "Datetime Components",
    "description": "Given dt = pd.to_datetime('2024-03-15'), print dt.year and dt.month on separate lines.",
    "narrative": "Direct access to year, month, day, hour — no regex or string splitting required.",
    "concept": "Datetime Attributes",
    "conceptExplanation": "Timestamp and datetime objects provide direct attributes for individual components: .year, .month, .day, .hour, .minute, .second, .microsecond, .dayofweek (0=Monday), .dayofyear, .quarter, .weekday(). On date Series, use the .dt accessor: df['data'].dt.year, df['data'].dt.month_name(), df['data'].dt.is_weekend. These are essential for TEMPORAL FEATURE ENGINEERING: extracting 'day of week', 'month', 'is holiday', and 'hour of day' often yields the most predictive features in demand, energy, and traffic models.",
    "hints": [
      "Timestamp provides attributes: .year, .month, .day, .hour, .minute, .second, .dayofweek, .quarter.",
      "Use two print() calls to output each on a separate line.",
      "print(dt.year)\nprint(dt.month)"
    ],
    "successStory": "Temporal components extracted."
  },
  "ds-ts-04": {
    "title": "Resample (Downsample)",
    "description": "Given daily series 'serie', aggregate by month with .resample('M').sum() and print 'Resample OK.'.",
    "narrative": "Convert high-frequency daily telemetry into monthly metrics — temporal aggregation.",
    "concept": "Resampling (Downsampling)",
    "conceptExplanation": "Resample groups a time series into larger time intervals (downsampling) or smaller ones (upsampling). DOWNSAMPLING: daily data -> monthly. After resampling, apply an aggregation: .sum() (total sales per month), .mean() (average temperature), .max() (peak telemetry), .last() (closing price). UPSAMPLING: monthly -> daily — generates NaN at new timesteps; fill them with .ffill(), .bfill(), or interpolate(). Resampling requires a DatetimeIndex on the DataFrame. Unlike categorical groupby, resample understands calendar and time intervals — including month ends, weekends, and quarter boundaries.",
    "hints": [
      "serie.resample(freq) groups by time interval; chain it with .sum(), .mean(), .max(), etc.",
      "Freq: 'D' daily, 'W' weekly, 'M' month-end, 'Q' quarter, 'Y' annual.",
      "serie.resample('M').sum()\nprint('Resample OK.')"
    ],
    "successStory": "Temporal granularity aggregated."
  },
  "ds-ts-05": {
    "title": "Moving Average (Rolling)",
    "description": "Apply a 7-day moving average: serie.rolling(window=7).mean(). Print 'Rolling OK.'.",
    "narrative": "Filter out high-frequency sensor noise to reveal the underlying trend.",
    "concept": "Rolling Windows",
    "conceptExplanation": "Rolling (sliding window) computes statistics over a moving window across the series. A 7-day MOVING AVERAGE smooths short-term noise and reveals weekly trends. Parameters: window=N (window size), min_periods=K (minimum observations required), center=True (centered vs trailing window). The first N-1 values result in NaN. Useful aggregations: .mean() (smoothing), .std() (volatility), .sum() (cumulative total), .max()/.min() (window extrema). In finance, moving averages (MA50, MA200) are classic trend indicators. For an exponentially weighted window (heavier weight on recent data), use .ewm() instead of .rolling().",
    "hints": [
      "serie.rolling(window=N) creates a sliding window of size N; chain an aggregation.",
      "A window of 7 = weekly average. Other aggregations: .std(), .sum(), .max().",
      "serie.rolling(window=7).mean()\nprint('Rolling OK.')"
    ],
    "successStory": "Signal smoothed successfully."
  },
  "ds-ts-06": {
    "title": "Differencing",
    "description": "Calculate diff = serie.diff() and print 'Diferenciada.'.",
    "narrative": "Strip out linear drift by subtracting each reading from its predecessor.",
    "concept": "Differencing",
    "conceptExplanation": "Differencing subtracts each observation from the preceding one (y_t - y_{t-1}) — a critical transformation to turn non-stationary series into STATIONARY ones (constant mean and variance over time). Stationarity is a fundamental PREREQUISITE for ARIMA. For seasonality, use seasonal differencing: serie.diff(12) for monthly-annual patterns. In ARIMA(p,d,q), 'd' represents the order of differencing applied. After differencing, run an ADF (Augmented Dickey-Fuller) test to verify stationarity. In financial time series, log returns (diff of log) are preferred over absolute differences — capturing proportional changes.",
    "hints": [
      "serie.diff() subtracts each value from the previous one (lag 1). For lag N: diff(N).",
      "Useful for making a series stationary — a prerequisite for ARIMA.",
      "serie.diff()"
    ],
    "successStory": "Trend component eliminated."
  },
  "ds-ts-07": {
    "title": "Shift / Lag",
    "description": "Create feature lag1 = serie.shift(1) and print 'Lag criado.'.",
    "narrative": "Harness past values as predictive features — the foundation of temporal feature engineering.",
    "concept": "Shift / Lag",
    "conceptExplanation": "shift(N) creates 'lag features' — feeding PAST observations as feature inputs to forecast the present. In classical models (ARIMA, AR) and temporal ML: y[t] = f(y[t-1], y[t-2], y[t-7], y[t-30]). Watch out for DATA LEAKAGE: never use a NEGATIVE shift in feature inputs (which would be 'peeking into the future'). Negative shift(-N) is strictly reserved for constructing future TARGETS (forecasting the next N horizons). In pandas, pct_change() = (serie/serie.shift(1))-1 returns percentage changes. A standard pipeline combines lag features + rolling statistics + datetime components.",
    "hints": [
      "serie.shift(N) shifts values N steps forward — y[t] aligns with y[t-N].",
      "Negative lag (shift(-1)) shifts backward — used to build future TARGET labels.",
      "serie.shift(1)"
    ],
    "successStory": "Historical lag memory configured."
  },
  "ds-ts-08": {
    "title": "Seasonal Decomposition",
    "description": "Use seasonal_decompose(serie, period=12) and print 'Decomposta.'.",
    "narrative": "Deconstruct telemetry into trend, seasonality, and residual noise.",
    "concept": "Time Series Decomposition",
    "conceptExplanation": "Every time series can be decomposed into 3 core components: TREND (long-term progression, growth or decline), SEASONALITY (regular periodic patterns — holiday surges, weekly cycles), and RESIDUALS (the unexplained noise or sudden shocks). ADDITIVE decomposition: y = trend + seasonal + residual (constant seasonal variation magnitude). MULTIPLICATIVE: y = trend * seasonal * residual (seasonal fluctuations proportional to the level of the trend — common in growing business volumes). Use seasonal_decompose or STL (more flexible, recommended for modern series). Visualizing all 4 traces (observed + 3 components) offers diagnostic clarity on shifts and anomalies.",
    "hints": [
      "seasonal_decompose returns an object containing .trend, .seasonal, and .resid (residuals).",
      "period represents the seasonal cycle: 12 for monthly/yearly, 7 for daily/weekly, 24 for hourly/daily.",
      "seasonal_decompose(serie, period=12)\nprint('Decomposta.')"
    ],
    "successStory": "Decomposed into isolated signal components."
  },
  "ds-ts-09": {
    "title": "ACF (Autocorrelation)",
    "description": "Use plot_acf(serie) and print 'ACF plotada.'.",
    "narrative": "How strongly does the signal correlate with its own past echoes?",
    "concept": "ACF / Autocorrelation",
    "conceptExplanation": "ACF (Autocorrelation Function) measures the CORRELATION of a series with lagged versions of itself. For each lag k, it calculates the correlation between y[t] and y[t-k]. Lag 0 is always 1.0 (correlation with itself). Common patterns: exponential decay suggests an AR process; sharp cutoff suggests an MA process; recurring spikes at multiples of 12 suggest annual seasonality in monthly data. Use plot_acf for visual diagnostics. PACF (Partial ACF) strips out intermediate lag effects — especially useful for identifying AR orders. Together, ACF and PACF are CRUCIAL for selecting ARIMA parameters (p, q).",
    "hints": [
      "plot_acf plots autocorrelation coefficients across different lag intervals.",
      "High spikes at specific lags indicate seasonality or underlying AR/MA orders.",
      "plot_acf(serie)\nprint('ACF plotada.')"
    ],
    "successStory": "Autocorrelation memory unveiled."
  },
  "ds-ts-10": {
    "title": "PACF",
    "description": "Use plot_pacf(serie) and print 'PACF plotada.'.",
    "narrative": "Partial autocorrelation — isolate direct dependencies while stripping intermediate lag echoes.",
    "concept": "PACF / Partial Autocorrelation",
    "conceptExplanation": "PACF (Partial ACF) is similar to ACF, but it CONTROLS FOR intermediate lags. For example, correlation between y[t] and y[t-3] in ACF includes compounding effects passing through y[t-1] and y[t-2]; PACF isolates the DIRECT relationship with y[t-3]. Classic signatures: PACF cuts off sharply after lag p -> AR(p) model (with exponential decay in ACF). PACF decays exponentially while ACF cuts off after lag q -> MA(q) model. Both decay -> ARMA. The interplay between ACF and PACF constitutes the classical Box-Jenkins methodology for identifying ARIMA architectures.",
    "hints": [
      "plot_pacf — partial autocorrelation, controlling for intervening lags.",
      "Useful for identifying the AR/ARIMA order p: look for a sharp cutoff after lag p.",
      "plot_pacf(serie)\nprint('PACF plotada.')"
    ],
    "successStory": "Direct correlation isolated."
  },
  "ds-ts-11": {
    "title": "Stationarity Test",
    "description": "Use adfuller(serie) and print the p-value (second element).",
    "narrative": "Before launching ARIMA, verify that the signal is stationary.",
    "concept": "Stationarity and ADF Test",
    "conceptExplanation": "STATIONARITY: a property where mean, variance, and autocorrelation structure remain constant over time. It is a fundamental prerequisite for most classical models (ARIMA, VAR). Trend -> non-stationary; seasonality -> non-stationary. AUGMENTED DICKEY-FULLER (ADF): the most widely used test. H0: the series has a unit root (NON-stationary); H1: the series is stationary. Result: p < 0.05 -> REJECT H0 -> the series is STATIONARY. If non-stationary, apply differencing (.diff()) and retest — the number of differences required determines the 'd' order in ARIMA. Alternative: the KPSS test (opposite null hypothesis — more conservative). Combining both yields a robust diagnosis.",
    "hints": [
      "adfuller (Augmented Dickey-Fuller) returns a tuple. The second element is the p-value.",
      "H0: the series is NOT stationary. p < 0.05 -> REJECT -> the series is stationary.",
      "resultado = adfuller(serie)\nprint(resultado[1])"
    ],
    "successStory": "Stationarity verified across temporal stream."
  },
  "ds-ts-12": {
    "title": "ARIMA (Concept)",
    "description": "Create a dictionary params with p=1, d=1, q=1 and print the tuple (p, d, q).",
    "narrative": "The classic time series model — understand its three core pillars.",
    "concept": "ARIMA",
    "conceptExplanation": "ARIMA(p, d, q) is the benchmark statistical model for time series — combining three components: AR(p) — AutoRegressive: y[t] depends linearly on p past values (y[t-1], y[t-2]...y[t-p]); I(d) — Integrated: applies d rounds of DIFFERENCING to make the series stationary; MA(q) — Moving Average: y[t] depends on q past error terms (residuals). Workflow: (1) plot the series, identify trend/seasonality; (2) difference until stationary (fixing d); (3) inspect ACF/PACF to choose p and q; (4) fit using auto_arima or statsmodels; (5) validate residuals (must resemble white noise). For seasonality: SARIMA(p,d,q)(P,D,Q,s).",
    "hints": [
      "Use a dict: params = {'p': 1, 'd': 1, 'q': 1}.",
      "The final tuple should be (params['p'], params['d'], params['q']).",
      "params = {'p': 1, 'd': 1, 'q': 1}\nprint((params['p'], params['d'], params['q']))"
    ],
    "successStory": "ARIMA trinity mastered."
  },
  "ds-ts-13": {
    "title": "Train ARIMA",
    "description": "Create ARIMA(serie, order=(1,1,1)).fit() and print 'ARIMA treinado.'.",
    "narrative": "Fit the model to historical telemetry.",
    "concept": "ARIMA Fitting",
    "conceptExplanation": "ARIMA(serie, order=(p,d,q)).fit() fits the model to historical data, returning a trained model ready for forecasting. Useful post-fit methods: .summary() (full statistical output, AIC/BIC, parameter significance), .forecast(steps=N) (forecast for next N periods), .predict(start, end), .resid (residuals for diagnostics). RESIDUAL DIAGNOSTICS is mandatory: residuals must resemble white noise (no autocorrelation, approximately normal distribution, constant variance). Use plot_diagnostics() from statsmodels — it generates 4 diagnostic plots automatically. For automated parameter selection, use pmdarima.auto_arima.",
    "hints": [
      "ARIMA(data, order=(p, d, q)). Chain .fit() to train.",
      "order=(1,1,1) is the simplest non-trivial ARIMA: 1 AR, 1 diff, 1 MA.",
      "modelo = ARIMA(serie, order=(1,1,1)).fit()"
    ],
    "successStory": "Historical model calibrated."
  },
  "ds-ts-14": {
    "title": "ARIMA Forecast",
    "description": "Use modelo.forecast(steps=5) and print 'Previsão de 5 passos.'.",
    "narrative": "Deploy the trained model to project future trajectories.",
    "concept": "Forecasting",
    "conceptExplanation": "modelo.forecast(steps=N) generates predictions for the next N future periods. CAUTION: forecasts become progressively less reliable the further ahead you look — confidence intervals widen exponentially. To quantify uncertainty, use get_forecast(steps=N), which returns point forecasts plus confidence intervals (default 95%). In production, continuously monitor prediction errors — when they increase systematically, retrain the model (CONCEPT DRIFT). For long-horizon forecasting (>12 seasonal cycles), ARIMA tends to mean-revert to a long-term slope or average — other architectures (Prophet, LSTM) may perform better.",
    "hints": [
      "modelo.forecast(steps=N) returns forecasts for N future periods.",
      "To include confidence intervals: get_forecast(steps=N).summary_frame().",
      "modelo.forecast(steps=5)"
    ],
    "successStory": "Future projection synthesized."
  },
  "ds-ts-15": {
    "title": "Seasonal SARIMA",
    "description": "Assemble the tuple seasonal_order=(1,1,1,12), store it in seasonal_order, and print the last value s.",
    "narrative": "ARIMA with explicit seasonality — capturing repeating annual, monthly, or weekly cycles.",
    "concept": "SARIMA",
    "conceptExplanation": "SARIMA = Seasonal ARIMA. It adds SEASONAL components to standard ARIMA parameters: (P, D, Q, s) where P, D, and Q play roles analogous to p, d, and q but operate at the seasonal period s (12 for monthly data with annual cycles, 4 for quarterly data, 7 for daily data with weekly cycles). Example: monthly sales with annual seasonality and AR(1) dynamics -> SARIMA(1,1,0)(1,1,0,12). In statsmodels: SARIMAX (which also supports exogenous variables via the exog parameter — useful when you have external features like price or temperature). For automated search: pmdarima.auto_arima(serie, seasonal=True, m=12).",
    "hints": [
      "The seasonal order contains four parameters: P, D, Q, and the period s.",
      "The last item of the tuple can be accessed with seasonal_order[-1].",
      "seasonal_order = (1, 1, 1, 12)\nprint(seasonal_order[-1])"
    ],
    "successStory": "Seasonal harmonics parameterized."
  },
  "ds-ts-16": {
    "title": "Prophet (Meta)",
    "description": "Create modelo = Prophet() and print 'Prophet inicializado.'.",
    "narrative": "Meta's forecasting engine — robust and automated modeling for enterprise time series.",
    "concept": "Facebook Prophet",
    "conceptExplanation": "Prophet is Meta's (formerly Facebook) library for time series forecasting — designed to allow domain analysts to generate high-quality forecasts without deep expertise in time series econometrics. It decomposes series into: trend (piecewise linear or logistic), seasonality (Fourier series), holiday effects, and additional regressors. Advantages: natively handles missing data, outliers, and regime changepoints; provides explicit holiday support; yields Bayesian confidence intervals. Expected input: a DataFrame with columns 'ds' (datetime) and 'y' (target value). Standard workflow: m = Prophet(); m.fit(df); future = m.make_future_dataframe(periods=30); forecast = m.predict(future).",
    "hints": [
      "Prophet (by Meta) is optimized for business time series with seasonality and holidays.",
      "Works well with minimal tuning — robust against outliers and missing data.",
      "modelo = Prophet()\nprint('Prophet inicializado.')"
    ],
    "successStory": "Prophet forecasting engine initialized."
  },
  "ds-ts-17": {
    "title": "Prophet with Holidays",
    "description": "Create Prophet(holidays=feriados) and print 'Feriados configurados.'.",
    "narrative": "Special calendar anomalies skew the timeline — incorporate them explicitly.",
    "concept": "Holidays in Prophet",
    "conceptExplanation": "Holidays cause significant demand spikes or drops in operational time series (Black Friday, Christmas, Easter). Prophet allows you to model them explicitly rather than forcing the model to absorb them as noise. Holidays DataFrame schema: columns 'holiday' (event name), 'ds' (date), 'lower_window' (days before affected), and 'upper_window' (days after affected). Alternative: model.add_country_holidays(country_name='BR') uses the holidays package for national calendar events automatically. After fitting, model.train_holiday_names displays detected events. Critical when data spans more than a year so Prophet can observe repeated holiday impacts.",
    "hints": [
      "Prophet(holidays=df_feriados) — DataFrame with columns 'holiday', 'ds', 'lower_window', 'upper_window'.",
      "Also includes built-in country holidays: model.add_country_holidays(country_name='BR').",
      "modelo = Prophet(holidays=feriados)\nprint('Feriados configurados.')"
    ],
    "successStory": "Calendar event multipliers registered."
  },
  "ds-ts-18": {
    "title": "Exponential Smoothing",
    "description": "Create config = {'trend':'add', 'seasonal':'add', 'seasonal_periods':12} and print config['seasonal_periods'].",
    "narrative": "Classical forecasting family driven by exponentially weighted moving averages.",
    "concept": "Exponential Smoothing (Holt-Winters)",
    "conceptExplanation": "A family of methods based on EXPONENTIALLY weighted moving averages: recent observations carry higher weight than older ones. Hierarchy: SIMPLE EXPONENTIAL SMOOTHING (level only — no trend or seasonality); HOLT (adds linear trend); HOLT-WINTERS (adds seasonality — additive or multiplicative). Learnable parameters (alpha, beta, gamma) govern decay rates. Advantages: simple, fast, robust, requires minimal tuning. Limitations: less flexible than ARIMA or Prophet on complex multi-seasonal series. In statsmodels: ExponentialSmoothing(serie, trend='add', seasonal='add', seasonal_periods=12).fit(). Frequently serves as a competitive baseline.",
    "hints": [
      "Use the strings 'add' for trend and seasonal.",
      "The annual seasonal period for monthly data is 12.",
      "config = {'trend': 'add', 'seasonal': 'add', 'seasonal_periods': 12}\nprint(config['seasonal_periods'])"
    ],
    "successStory": "Exponential smoothing parameters configured."
  },
  "ds-ts-19": {
    "title": "Forecast RMSE",
    "description": "Given y_real=[100,102,105], y_pred=[101,100,107]. Compute rmse using np.sqrt(np.mean((y_real-y_pred)**2)). Print it.",
    "narrative": "The standard metric for quantifying error in continuous numerical forecasting.",
    "concept": "RMSE",
    "conceptExplanation": "RMSE (Root Mean Squared Error) is the benchmark evaluation metric for numerical forecasting: RMSE = sqrt(mean((real - pred)²)). Advantages: expressed in the same units as the underlying data (directly interpretable); penalizes large forecasting errors quadratically. Comparison: MAE (Mean Absolute Error) uses absolute values instead of squares — more robust to outliers, but does not amplify large misses. MAPE (Mean Absolute Percentage Error): relative error in PERCENTAGE — useful for comparing series across different scales, but fails when actual values approach 0. In production, choose the metric that matches business impact: penalize severe misses (RMSE) or prioritize median robustness (MAE).",
    "hints": [
      "RMSE = sqrt(mean((real - pred)²)). Use np.sqrt and np.mean.",
      "Subtract, square, mean, and square root. You can use parentheses or intermediate variables.",
      "rmse = np.sqrt(np.mean((y_real - y_pred)**2))\nprint(rmse)"
    ],
    "successStory": "Forecasting deviation quantified."
  },
  "ds-ts-20": {
    "title": "MAPE",
    "description": "Given y_real=[100,200] and y_pred=[110,180]. Compute MAPE = mean(|real-pred|/|real|) * 100. Print it.",
    "narrative": "Error expressed as a PERCENTAGE — instantly interpretable across disparate telemetry streams.",
    "concept": "MAPE",
    "conceptExplanation": "MAPE (Mean Absolute Percentage Error) expresses error as a PERCENTAGE — providing an intuitive interpretation ('average error of 5%') that is comparable across series of wildly different scales (sales in millions vs units in hundreds). Formula: mean(|real - pred| / |real|) * 100. SEVERE LIMITATIONS: (1) blows up toward infinity when y_real ≈ 0; (2) ASYMMETRIC — penalizes over-forecasting and under-forecasting unevenly; (3) undefined when y_real = 0. Alternatives: SMAPE (Symmetric MAPE) uses (|real|+|pred|)/2 in the denominator; MASE scales against a naive forecast. On strictly positive series away from zero, MAPE is widely reported.",
    "hints": [
      "MAPE = mean(|real - pred| / |real|) * 100. Use np.abs and np.mean.",
      "Warning: if y_real contains zeros, MAPE explodes. Exercise caution with values near zero.",
      "mape = np.mean(np.abs((y_real - y_pred) / y_real)) * 100\nprint(mape)"
    ],
    "successStory": "Percentage error metric calculated."
  },
  "ds-ts-21": {
    "title": "Temporal Train/Test Split",
    "description": "Split using split=int(len(serie)*0.8). train=serie[:split], test=serie[split:]. Print len(train).",
    "narrative": "IN TIME SERIES, never shuffle — splits must strictly adhere to the chronological timeline.",
    "concept": "Chronological Splitting",
    "conceptExplanation": "In time series modeling, train/test splitting MUST BE strictly chronological — training encompasses everything up to cutoff timestamp T, while testing covers timestamps after T. NEVER SHUFFLE: randomly mixing past and future induces TEMPORAL DATA LEAKAGE (the model cheats by observing future signals during training, producing artificially inflated metrics). For this reason, standard sklearn train_test_split is forbidden without shuffle=False. For cross-validation across multiple folds, use sklearn.model_selection.TimeSeriesSplit — which creates expanding windows where train strictly precedes test. In production, WALK-FORWARD VALIDATION is the gold standard.",
    "hints": [
      "Do NOT use sklearn's train_test_split with shuffling — it leads to temporal data leakage.",
      "Use array slicing: serie[:split] for training, serie[split:] for testing.",
      "split = int(len(serie) * 0.8)\ntrain = serie[:split]\nprint(len(train))"
    ],
    "successStory": "Chronological partition established."
  },
  "ds-ts-22": {
    "title": "Walk-Forward Validation",
    "description": "Implement simple walk-forward validation: for serie=[10,12,13,15], generate naive previsoes using the last observed value before each test point. Print previsoes.",
    "narrative": "Simulate real deployment: step forward through time, updating forecasts with each incoming tick.",
    "concept": "Walk-Forward Validation",
    "conceptExplanation": "Walk-forward validation is the MOST RIGOROUS protocol for evaluating time series models. It mirrors how the system operates in production: (1) train on observations up to horizon T; (2) forecast step T+1; (3) compare with actual outcome; (4) ADVANCE — now train on data up to T+1; (5) forecast step T+2; and repeat. Variants: 'expanding window' (the training corpus grows with each tick) or 'sliding window' (training size stays fixed, dropping obsolete history). While computationally intensive (fitting N iterative models), it delivers an unbiased estimate of generalization performance. In sklearn: TimeSeriesSplit provides a simplified expanding-window implementation.",
    "hints": [
      "In a naive baseline, the forecast for the next step is simply the most recently observed value.",
      "Use range(2, len(serie)) to generate previsoes for the last two points.",
      "for i in range(2, len(serie)):\n    previsoes.append(serie[i - 1])\nprint(previsoes)"
    ],
    "successStory": "Walk-forward validation cycle executed."
  },
  "ds-ts-23": {
    "title": "Temporal Feature Engineering",
    "description": "Given df with datetime column 'data', create df['dia_semana'] = df['data'].dt.dayofweek. Print 'Features criadas.'.",
    "narrative": "Extracting timestamp attributes into tabular features is step one for machine learning on temporal data.",
    "concept": "Datetime Features",
    "conceptExplanation": "TEMPORAL FEATURE ENGINEERING is frequently the single largest driver of accuracy in demand, power grid, and telemetry models. Core extractions: dayofweek (0=Monday), day, month, quarter, year, weekofyear, is_weekend, is_month_start/end, is_quarter_end. For HOUR of the day (circadian periodicity): hour, plus sin/cos transforms (cyclical encoding ensuring hour 23 sits adjacent to hour 0). HOLIDAYS: integrate the holidays library. LAGS and ROLLING: y[t-1], y[t-7], 7-day rolling statistics — capturing memory directly as columns. Fusing datetime attributes + lags + external covariates (weather, events) forms the classic temporal ML pipeline.",
    "hints": [
      "Use the .dt accessor on datetime Series: df['data'].dt.dayofweek.",
      "Other components: .dt.month, .dt.day, .dt.hour, .dt.quarter, .dt.is_weekend, .dt.is_month_end.",
      "df['dia_semana'] = df['data'].dt.dayofweek"
    ],
    "successStory": "Temporal feature vector assembled."
  },
  "ds-ts-24": {
    "title": "Cyclical Seasonality",
    "description": "For hora=23 and periodo=24, calculate hora_sin and hora_cos using math.sin/math.cos. Print round(hora_sin, 3) and round(hora_cos, 3).",
    "narrative": "Encode cyclical time variables on a unit circle — hour 23 is immediately adjacent to hour 0.",
    "concept": "Cyclical Encoding",
    "conceptExplanation": "Periodic variables (hour of day, day of week, month of year) break under standard linear encoding: hour 0 and hour 23 are numerically far apart (distance of 23) despite being immediate neighbors in real time. Solution: CYCLICAL ENCODING — sin(2*pi*x/period) and cos(2*pi*x/period) project the scalar onto a 2D trigonometric circle, preserving continuity. For hour: x/24; for month: x/12; for day of week: x/7. Both linear models and tree-based algorithms benefit significantly from this smooth continuous topology, preventing artificial boundary step-discontinuities.",
    "hints": [
      "The angle is 2 * math.pi * hora / periodo.",
      "Compute two features: math.sin(angulo) and math.cos(angulo).",
      "angulo = 2 * math.pi * hora / periodo\nhora_sin = math.sin(angulo)\nhora_cos = math.cos(angulo)"
    ],
    "successStory": "Cyclical coordinates mapped to unit circle."
  },
  "ds-ts-25": {
    "title": "Anomaly Detection",
    "description": "For a series with mean=50, std=10, flag an anomaly if |x - 50| > 3*10. Print 'Anomalia' for x=85.",
    "narrative": "Standard Z-score thresholding to flag aberrant signals along the temporal trace.",
    "concept": "Time Series Anomaly Detection",
    "conceptExplanation": "Anomaly detection is a cornerstone application of time series analysis — identifying unexpected spikes, drops, or pattern breaches in server logs, IoT telemetry, and financial transactions. METHODS: (1) Z-score: |x - μ| / σ > 3 (parametric, assumes normality); (2) IQR-based: x < Q1 - 1.5*IQR or x > Q3 + 1.5*IQR (non-parametric); (3) ROLLING z-score: computing mean/std over a sliding window — adapting to baseline drift; (4) Forecast residuals: large prediction errors from ARIMA or Prophet indicate anomalous events; (5) Isolation Forest: tree-based outlier isolation; (6) Autoencoders: high reconstruction error signals anomalous sequences. In production, anomalies trigger automated alarms requiring triage.",
    "hints": [
      "Classic anomaly threshold: |z-score| > 3. Compute |x - media| and compare against 3*std.",
      "abs(x - media) > 3 * std -> print 'Anomalia'.",
      "if abs(x - media) > 3 * std:\n    print('Anomalia')"
    ],
    "successStory": "Temporal anomaly intercepted."
  },
  "ds-ts-26": {
    "title": "Pct_change",
    "description": "Calculate serie.pct_change() — period-over-period percentage variation. Print 'Variações calculadas.'.",
    "narrative": "In quantitative finance and signals, rate of return outweighs raw price levels.",
    "concept": "Percentage Change",
    "conceptExplanation": "pct_change() calculates the proportional step change from one timestep to the next. In quantitative finance, this forms the foundation of RETURNS — raw prices are non-stationary, but percentage returns are often stationary (a vital premise for statistical modeling). Caution: pct_change on values near zero explodes; negative baselines cause sign distortions. SUPERIOR ALTERNATIVE: LOG RETURNS — np.log(serie / serie.shift(1)). Benefits: (1) time-additive (monthly log return = sum of daily log returns); (2) symmetric (-50% followed by +100% returns to baseline, reflected in log space as -0.69 + 0.69 = 0); (3) closely approximate a normal distribution for small variations.",
    "hints": [
      "serie.pct_change() returns (serie[t] / serie[t-1]) - 1 = percentage change.",
      "Equivalent to serie.diff() / serie.shift(1).",
      "serie.pct_change()"
    ],
    "successStory": "Percentage delta returns extracted."
  },
  "ds-ts-27": {
    "title": "LSTM for Time Series",
    "description": "Create windows for LSTM: serie=[1,2,3,4,5], janela=3. Assemble X and y, where each X contains 3 points and y is the next value. Print X and y.",
    "narrative": "When linear models hit capacity limits, recurrent neural architectures take control.",
    "concept": "LSTM for Forecasting",
    "conceptExplanation": "LSTMs (and GRUs) are recurrent neural networks engineered with memory gating mechanisms to retain long-term state across sequence timesteps. They excel when: (1) complex non-linear patterns dominate; (2) multiple interacting streams exist (multivariate forecasting); (3) long-range lag dependencies matter; (4) large historical training datasets are available (LSTMs require significantly more data than ARIMA). Standard workflow: (1) construct sliding windows (X = sequence of N historical steps, y = horizon target); (2) scale features (MinMaxScaler); (3) assemble architecture: Sequential([LSTM(50), Dense(1)]); (4) fit; (5) roll forward autoregressively. On univariate linear series, ARIMA/Prophet frequently match or surpass LSTMs with far less compute.",
    "hints": [
      "For each index i, X receives serie[i:i+janela] and y receives serie[i+janela].",
      "The loop must iterate up to len(serie) - janela.",
      "for i in range(len(serie) - janela):\n    X.append(serie[i:i+janela])\n    y.append(serie[i+janela])"
    ],
    "successStory": "Temporal LSTM tensors formulated."
  },
  "ds-ts-28": {
    "title": "Windowing for LSTM",
    "description": "For a serie of size 100 with janela=5, n_amostras = 100 - 5 = 95. Print 95.",
    "narrative": "Before feeding the recurrent network, slice the raw stream into sliding input windows.",
    "concept": "Sliding Windows (Windowing)",
    "conceptExplanation": "To train an LSTM on temporal data, transform the continuous stream into a supervised dataset using SLIDING WINDOWS: X[i] = serie[i:i+window], y[i] = serie[i+window]. Each window provides 'window' timesteps as input features to forecast the subsequent step. For an N-length series with window W, exactly (N - W) training samples are generated. For multi-step forecasting, y expands to the next H horizons instead of a single point. Final 3D tensor shape for LSTM input: (n_samples, window, n_features). SCALING is mandatory prior to training (MinMaxScaler or StandardScaler). Always INVERSE TRANSFORM forecasts back to the original operational scale.",
    "hints": [
      "n_amostras = tamanho - janela. Each window uses 'janela' points as X and the next as y.",
      "Print the subtraction result directly.",
      "print(tamanho - janela)"
    ],
    "successStory": "Sliding window dataset configured."
  },
  "ds-ts-29": {
    "title": "Concept Drift",
    "description": "Given erros=[4,5,7,12], set drift=True if the last error exceeds 1.5 times the average of the previous errors. Print drift.",
    "narrative": "Temporal forecasting models degrade as system dynamics shift — track performance degradation.",
    "concept": "Concept Drift",
    "conceptExplanation": "CONCEPT DRIFT refers to the gradual or sudden decay of predictive performance over time as the real-world environment evolves — assumptions and statistical patterns learned during training no longer hold true. Categories: (1) Sudden — abrupt shocks (market crashes, regime changes); (2) Gradual — slow generational drift (changing user habits); (3) Recurring — seasonal patterns not captured in initial training; (4) Covariate shift — input feature distribution P(X) shifts while P(y|X) remains constant; (5) Real concept drift — underlying relationship P(y|X) alters. DETECTION: continuously track telemetry metrics in production (RMSE, MAPE) — sustained degradation signals retrain triggers. Robust production architectures retrain periodically regardless.",
    "hints": [
      "Mean of previous values: sum(erros[:-1]) / len(erros[:-1]).",
      "Drift triggers if erros[-1] > media * 1.5.",
      "media = sum(erros[:-1]) / len(erros[:-1])\ndrift = erros[-1] > media * 1.5\nprint(drift)"
    ],
    "successStory": "Concept drift detected; retrain triggered."
  },
  "ds-ts-30": {
    "title": "Hierarchical Forecasting",
    "description": "Given vendas={'norte':[100,120], 'sul':[80,90]}, calculate forecast_total by summing the last value of each region. Print forecast_total.",
    "narrative": "Multi-tiered forecasting: node level, cluster level, network total — mathematically reconciled.",
    "concept": "Hierarchical Forecasting",
    "conceptExplanation": "When forecasting across MULTIPLE HIERARCHICAL LEVELS (SKU level, store level, regional level, global total), RECONCILIATION COHERENCE becomes paramount: forecasts at lower levels must sum precisely to aggregate level forecasts. Classical paradigms: (1) BOTTOM-UP: forecast each leaf node individually and sum upwards (captures granular dynamics, but aggregates residual noise); (2) TOP-DOWN: forecast aggregate totals and distribute downward via historical proportions (smooth macro forecast, but blunts local variances); (3) MIDDLE-OUT: forecast at an intermediate tier; (4) OPTIMAL RECONCILIATION: generate forecasts across all levels and project them into a coherent subspace (e.g. MinT). Ecosystem: statsforecast / hierarchicalforecast (Nixtla) and hts.",
    "hints": [
      "Use dictionary values to access each regional list.",
      "The last item in a list is accessed with list[-1].",
      "forecast_total = sum(regiao[-1] for regiao in vendas.values())\nprint(forecast_total)"
    ],
    "successStory": "Hierarchical forecasts reconciled."
  }
};
