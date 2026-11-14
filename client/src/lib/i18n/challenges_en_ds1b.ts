import type { LocalizedChallengeFields } from "./worlds_en";

export const CHALLENGES_EN_DS1B: Record<string, LocalizedChallengeFields> = {
  "ds-ml-01": {
    title: "Supervised Training",
    description: "Import LinearRegression. Create 'modelo' and train with modelo.fit(X, y).",
    narrative: "Initialize a linear regression model to predict incoming attack intensity.",
    concept: "Scikit-Learn API",
    conceptExplanation: "Scikit-learn is the standard classical ML library in Python. Its API is UNIFORM across ALL models: (1) instantiate algorithm = Class(parameters); (2) train with .fit(X, y); (3) predict with .predict(X_new). LinearRegression finds the line of best fit between X (features) and y (continuous target). X must ALWAYS be 2D — a list of lists — even with a single feature. It forms the foundation of all supervised ML intuition.",
    hints: [
          "In sklearn, every algorithm is a class: import it, instantiate with (), then call .fit().",
          ".fit(X, y) takes X (2D features — list of lists) and y (1D target answers).",
          "modelo = LinearRegression()\nmodelo.fit(X, y)"
    ],
    successStory: "Model fitted.",
  },
  "ds-ml-02": {
    title: "Train/Test Split",
    description: "Use train_test_split(X, y, test_size=0.2) and print 'Split realizado.'.",
    narrative: "Reserve 20% of telemetry to validate the model's accuracy.",
    concept: "Train/Test Split",
    conceptExplanation: "The MOST IMPORTANT rule in ML: separate your data into train and test sets before fitting. Without this split, there is no way to tell whether the model truly generalizes or merely memorizes the training data (overfitting). train_test_split shuffles and splits the dataset. Key parameters: random_state=42 (reproducibility), stratify=y (preserves class proportions — critical for imbalanced classes). Typically 20-30% is reserved for testing. For more robust validation, use cross_val_score across multiple folds.",
    hints: [
          "train_test_split returns FOUR values: X_train, X_test, y_train, y_test. Unpack them with commas.",
          "test_size=0.2 reserves 20% for testing. For reproducibility, set random_state=42.",
          "X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)\nprint('Split realizado.')"
    ],
    successStory: "Validation set isolated.",
  },
  "ds-ml-03": {
    title: "Prediction",
    description: "Use modelo.predict([[4]]), save to previsao, and print only the first value.",
    narrative: "Deploy the trained model against incoming operational sensor data.",
    concept: "Inference",
    conceptExplanation: "Inference (or prediction) is when you APPLY the model to unseen data after training. .predict() expects X in 2D format (the exact same shape as training, even for a single sample — a classic pitfall). Regression tasks return continuous values; classification tasks return labels. For classification, .predict_proba() yields class probability distributions — crucial when you need CONFIDENCE levels rather than just raw labels. In production systems, predict is invoked millions of times and often becomes the primary performance bottleneck.",
    hints: [
          "predict returns a list of predictions, even when passed a single sample.",
          "Store the returned array in a variable and access index zero.",
          "previsao = modelo.predict([[4]])\nprint(previsao[0])"
    ],
    successStory: "Prediction delivered.",
  },
  "ds-ml-04": {
    title: "Model Score",
    description: "Calculate score = modelo.score(X_test, y_test). Print whether it is at least 0.9.",
    narrative: "Validate the predictive model before pushing it to production nodes.",
    concept: "Default Metrics (score)",
    conceptExplanation: ".score() returns the default evaluation metric — always evaluated on TEST DATA (running it on training data only measures memorization). For regression: R² (1 = perfect, 0 = baseline mean, negative = worse than average). For classification: accuracy (percentage of correct predictions from 0 to 1). Note: accuracy can be MISLEADING on imbalanced classes — in a dataset where 95% is 'benign', a model predicting 'benign' every time scores 95% accuracy while remaining entirely useless. For deep diagnostic analysis, use sklearn.metrics: precision, recall, F1, confusion_matrix, and roc_auc.",
    hints: [
          "Store the return value of modelo.score in a variable.",
          "Comparisons such as score >= 0.9 evaluate to True or False.",
          "score = modelo.score(X_test, y_test)\nprint(score >= 0.9)"
    ],
    successStory: "Accuracy validated.",
  },
  "ds-ml-05": {
    title: "Logistic Classification",
    description: "Import LogisticRegression, create 'clf', and train with clf.fit(X, y).",
    narrative: "Logistic regression serves as the gateway to binary classification across the grid.",
    concept: "Logistic Regression",
    conceptExplanation: "Despite containing 'regression' in its name, LogisticRegression is the standard CLASSIFICATION algorithm used as an industry baseline — for binary problems (spam/ham, fraud/legitimate) or multiclass tasks. Under the hood, it computes a linear combination of features and passes it through a sigmoid function → outputting a probability between 0 and 1, then classifying using a threshold (typically 0.5). Advantages: fast, interpretable (coefficients reveal feature impact), and provides well-calibrated probabilities. Regularization: penalty='l2' is default (Ridge), penalty='l1' (Lasso) requires solver='liblinear' or 'saga'. C controls regularization strength (smaller C = stronger penalty).",
    hints: [
          "Despite the name 'regression', LogisticRegression is a CLASSIFIER — for binary (0/1) or multiclass problems.",
          "Same API standard: clf = LogisticRegression(); clf.fit(X, y).",
          "clf = LogisticRegression()\nclf.fit(X, y)"
    ],
    successStory: "Binary classifier online.",
  },
  "ds-ml-06": {
    title: "Decision Tree",
    description: "Import DecisionTreeClassifier, create 'tree', and train it.",
    narrative: "Trees provide full interpretability — allowing you to INSPECT every learned heuristic rule.",
    concept: "Decision Tree",
    conceptExplanation: "Decision Trees split data into subsets using threshold conditions ('feature X > 5?') that maximize information gain (minimizing Gini impurity or entropy). Key advantages: completely interpretable (you can export and visualize the logic tree via export_text or plot_tree), handles non-linear relationships naturally, and requires NO feature scaling. Major downside: prone to severe overfitting (memorizing training samples). Mitigate this using max_depth (maximum tree depth), min_samples_split (minimum samples to split an internal node), and min_samples_leaf. For continuous targets, use DecisionTreeRegressor.",
    hints: [
          "DecisionTreeClassifier comes from sklearn.tree. It follows the exact same API.",
          "Useful parameter: max_depth=N limits tree depth — keeping overfitting under control.",
          "tree = DecisionTreeClassifier()\ntree.fit(X, y)"
    ],
    successStory: "Rule tree constructed.",
  },
  "ds-ml-07": {
    title: "Random Forest",
    description: "Import RandomForestClassifier, create 'rf', and train it.",
    narrative: "Multiple decision trees working in unison — an exceptionally robust ensemble.",
    concept: "Random Forest",
    conceptExplanation: "Random Forest is an ensemble method: it trains NUMEROUS decision trees on randomized subsamples of both data points and features, aggregating their predictions via majority voting (classification) or averaging (regression). This effectively counters individual tree overfitting and consistently delivers stellar OUT-OF-THE-BOX performance on tabular data without heavy hyperparameter tuning. Core parameters: n_estimators (more trees = better accuracy at higher compute cost), max_depth, and max_features. Bonus: rf.feature_importances_ exposes which features contributed most to predictions.",
    hints: [
          "RandomForestClassifier resides in sklearn.ensemble. The n_estimators parameter sets the number of trees (default 100).",
          "It is 'random' because each tree trains on a RANDOM sample of records and features — driving ensemble robustness.",
          "rf = RandomForestClassifier()\nrf.fit(X, y)"
    ],
    successStory: "Robust ensemble deployed.",
  },
  "ds-ml-08": {
    title: "K-Nearest Neighbors",
    description: "Import KNeighborsClassifier, create 'knn' with n_neighbors=3, and train it.",
    narrative: "KNN classifies signals by proximity — no abstract model, pure neighborhood topology.",
    concept: "K-Nearest Neighbors",
    conceptExplanation: "KNN is one of the simplest classification algorithms: it builds no abstract parametric model, merely memorizing all training instances. To classify an unseen query point, it locates the K nearest training instances (typically via Euclidean distance) and assigns the majority class. Advantages: zero training phase, captures complex non-linear boundaries effortlessly. Disadvantages: high inference latency (computes distances against ALL training samples) and vulnerability to high-dimensional sparsity ('curse of dimensionality'). Always normalize features beforehand (e.g. StandardScaler) — otherwise features with larger scales dominate distance calculations.",
    hints: [
          "Import from sklearn.neighbors. n_neighbors configures K — the number of neighbors to query.",
          "Small K (1-3): sensitive to noise. Large K: smooths decision boundaries. An odd K avoids voting ties.",
          "knn = KNeighborsClassifier(n_neighbors=3)\nknn.fit(X, y)"
    ],
    successStory: "Similarity classifier activated.",
  },
  "ds-ml-09": {
    title: "SVM",
    description: "Import SVC, create 'svm', and train it.",
    narrative: "Support Vector Machine — maximize decision margins across encrypted vector spaces.",
    concept: "Support Vector Machine",
    conceptExplanation: "Support Vector Machines seek the decision hyperplane that MAXIMIZES the margin between target classes — establishing the widest possible separation boundary. The sample coordinates closest to this boundary are known as 'support vectors' and directly define the resulting decision model. By leveraging kernel tricks (linear, RBF, polynomial), SVM projects inputs into higher-dimensional representations to untangle non-linear separations. Excels on small-to-medium datasets containing numerous features. Downsides: scales poorly on large datasets (>50k rows) and is hyper-sensitive to unscaled features — always scale inputs first.",
    hints: [
          "SVC (Support Vector Classifier) lives in sklearn.svm. Use SVR for regression.",
          "The kernel parameter accepts 'linear', 'rbf' (default, non-linear), or 'poly'. C governs regularization strength.",
          "svm = SVC()\nsvm.fit(X, y)"
    ],
    successStory: "Margin maximized.",
  },
  "ds-ml-10": {
    title: "Naive Bayes",
    description: "Import GaussianNB, create 'nb', and train it.",
    narrative: "A classic probabilistic classifier tuned for rapid linguistic packet triage.",
    concept: "Naive Bayes",
    conceptExplanation: "Naive Bayes implements Bayes' Theorem under the strict assumption of conditional INDEPENDENCE between features ('naive' because real-world features rarely operate independently). Despite this simplification, it delivers remarkably strong baselines for text filtering (spam filters, document routing). Core variants: GaussianNB (continuous features assuming normal distribution); MultinomialNB (token counts — classic for NLP bag-of-words); BernoulliNB (binary indicator features). Strengths: blazingly fast, scales well to high dimensions, and operates reliably even with sparse data. An ideal baseline for text classification.",
    hints: [
          "GaussianNB belongs to sklearn.naive_bayes. Other variants include MultinomialNB (text) and BernoulliNB (binary).",
          "Extremely fast execution. Follows the standard pattern: nb = GaussianNB(); nb.fit(X, y).",
          "nb = GaussianNB()\nnb.fit(X, y)"
    ],
    successStory: "Probabilistic classifier online.",
  },
  "ds-ml-11": {
    title: "Ridge (L2)",
    description: "Import Ridge, create 'ridge' with alpha=1.0, and train it.",
    narrative: "L2 regularization suppresses coefficient overfitting across dense regression matrices.",
    concept: "L2 Regularization (Ridge)",
    conceptExplanation: "Ridge regression injects an L2 PENALTY directly into the loss function: the sum of squared model weights scaled by alpha. This shrinks regression coefficients toward zero, preventing single features from exerting outsized influence and thereby mitigating overfitting. Deploy Ridge when dealing with MULTIPLE correlated features (multicollinearity). The alpha parameter (often denoted lambda) modulates penalty intensity: alpha=0 turns into ordinary LinearRegression; large alpha values contract weights aggressively. Tune alpha via cross-validation (RidgeCV). For an L1 penalty that drives coefficients to absolute zero, turn to Lasso.",
    hints: [
          "Ridge = LinearRegression + L2 penalty (sum of squared weights). alpha sets regularization intensity.",
          "alpha=0 behaves like standard linear regression. High alpha shrinks weights heavily.",
          "ridge = Ridge(alpha=1.0)\nridge.fit(X, y)"
    ],
    successStory: "Weights regularized.",
  },
  "ds-ml-12": {
    title: "Lasso (L1)",
    description: "Import Lasso, create 'lasso' with alpha=0.1, and train it.",
    narrative: "L1 regularization zeroes out redundant weights — automated feature elimination.",
    concept: "L1 Regularization (Lasso)",
    conceptExplanation: "Lasso (Least Absolute Shrinkage and Selection Operator) applies an L1 penalty — summing the ABSOLUTE VALUES of model weights. The fundamental difference compared to Ridge: Lasso drives coefficients of non-contributing features entirely to ZERO, executing automated FEATURE SELECTION. Ideal when you hypothesize that only a sparse subset of features truly matters. Highly favored when model interpretability and lean parameter counts are mandatory. To combine L1 and L2 penalties simultaneously, leverage ElasticNet. As with Ridge, alpha controls regularization strength.",
    hints: [
          "Lasso applies an L1 penalty (sum of ABSOLUTE weight values). It actively ZEROES out non-informative weights.",
          "Identical API to Ridge — only the underlying penalty formula differs.",
          "lasso = Lasso(alpha=0.1)\nlasso.fit(X, y)"
    ],
    successStory: "Irrelevant features eliminated.",
  },
  "ds-ml-13": {
    title: "Gradient Boosting",
    description: "Import GradientBoostingClassifier, create 'gb', and train it.",
    narrative: "Boosting: an ensemble of trees sequentially correcting previous residuals. Tabular state-of-the-art.",
    concept: "Gradient Boosting",
    conceptExplanation: "Boosting constructs models SEQUENTIALLY — every new decision tree focuses on MINIMIZING RESIDUAL ERRORS produced by preceding estimators. Whereas Random Forest fits trees in parallel independently, boosting fits trees iteratively, each targeting weaknesses left behind. As a result, boosting routinely represents the apex algorithm for tabular data, dominating competitive ML leaderboards. Highly optimized external frameworks include XGBoost, LightGBM, and CatBoost, which introduce hardware acceleration and parallelization. Core parameters: n_estimators (tree count), learning_rate (shrinkage step size), and max_depth.",
    hints: [
          "GradientBoostingClassifier is located in sklearn.ensemble.",
          "Primary hyperparameters: n_estimators, learning_rate, max_depth. For accelerated scaling, explore XGBoost and LightGBM.",
          "gb = GradientBoostingClassifier()\ngb.fit(X, y)"
    ],
    successStory: "Sequential ensemble deployed.",
  },
  "ds-ml-14": {
    title: "StandardScaler",
    description: "Import StandardScaler, create 'scaler', and execute fit_transform(X). Print 'Escalado.'.",
    narrative: "Normalize feature distributions for scale-sensitive networks and kernels.",
    concept: "Standardization",
    conceptExplanation: "StandardScaler applies a z-score transformation: (x - mean) / standard_deviation — shifting features to zero mean and unit variance. MANDATORY for scale-sensitive algorithms: SVM, KNN, neural architectures, and regularized regression models. Without standardization, features with larger numeric scales (e.g. salary in the thousands vs age in double digits) disproportionately dominate loss gradients. CRITICAL RULE: execute fit_transform ONLY on training splits; for test splits, invoke transform() alone to prevent data leakage. Inside a Pipeline, this separation is handled automatically.",
    hints: [
          "StandardScaler centers data by subtracting the mean and dividing by standard deviation (z-score) — mean 0, variance 1.",
          "fit_transform() combines fit() and transform() in a single call — calculating statistics and applying the shift.",
          "scaler = StandardScaler()\nscaler.fit_transform(X)"
    ],
    successStory: "Features standardized.",
  },
  "ds-ml-15": {
    title: "MinMaxScaler",
    description: "Import MinMaxScaler, scale X to [0, 1] with fit_transform. Print 'Min-Max aplicado.'.",
    narrative: "Bound all numeric streams strictly within the normalized [0, 1] range.",
    concept: "Min-Max Normalization",
    conceptExplanation: "MinMaxScaler linearly projects every feature into a designated interval, default [0, 1]: (x - min) / (max - min). Use when algorithms explicitly require positive, bounded inputs (e.g., pixel intensities 0-1 for neural inputs, MultinomialNB which rejects negative inputs, or bounding visualization coordinates). Unlike StandardScaler (which yields unbound distributions centered at zero), MinMaxScaler preserves original zero entries and exact distribution shapes. CAUTION: outliers can severely compress the variance of remaining data points. When outliers are present, prefer RobustScaler.",
    hints: [
          "MinMaxScaler maps every feature linearly into the [0, 1] range: (x - min) / (max - min).",
          "Unlike StandardScaler (mean 0, std 1), it strictly preserves the original distribution profile.",
          "scaler = MinMaxScaler()\nscaler.fit_transform(X)\nprint('Min-Max aplicado.') if False else None"
    ],
    successStory: "Intervals uniformized.",
  },
  "ds-ml-16": {
    title: "LabelEncoder",
    description: "Import LabelEncoder, encode labels=['gato','cao','gato'] with fit_transform. Print 'Encoded.'.",
    narrative: "Convert categorical string identities into contiguous integer ordinals.",
    concept: "Label Encoding",
    conceptExplanation: "LabelEncoder converts categorical text strings into contiguous integers: 'cat' → 0, 'dog' → 1, 'fox' → 2. CRITICAL RULE: use LabelEncoder EXCLUSIVELY on the target label vector y (e.g., multiclass classification labels). NEVER apply it across input features X: assigning numbers introduces artificial ordering (dog > cat?) that linear models and distance metrics misinterpret. For features in X, employ OneHotEncoder or pandas get_dummies. To invert encoded integers back to text: le.inverse_transform([0, 1, 0]) → ['gato', 'cao', 'gato'].",
    hints: [
          "LabelEncoder converts string categories into consecutive integers: 'gato'→0, 'cao'→1, etc.",
          "Use ONLY on the target variable y — for input features in X, use OneHotEncoder.",
          "le = LabelEncoder()\nle.fit_transform(labels)"
    ],
    successStory: "Labels digitized.",
  },
  "ds-ml-17": {
    title: "OneHotEncoder",
    description: "Import OneHotEncoder, create 'ohe', and run fit_transform([['A'],['B'],['A']]). Print 'OneHot.'.",
    narrative: "Transform discrete categorical features into binary indicator matrix columns.",
    concept: "One-Hot Encoding",
    conceptExplanation: "One-Hot Encoding converts discrete categories into binary boolean indicator columns: a 'color' feature with values [red, blue, green] expands into 3 distinct binary columns (0 or 1) representing the presence of each category. This eliminates the false ordinal hierarchy imposed by LabelEncoder on feature matrices. Use for categorical features lacking intrinsic order (colors, regions, protocols). For ordinal categories (e.g. low/medium/high), prefer OrdinalEncoder. In pandas, a common equivalent is pd.get_dummies(df). Watch out for high cardinality: hundreds of unique categories cause severe dimensionality explosion.",
    hints: [
          "OneHotEncoder maps every category to a binary COLUMN: 'A'→[1,0], 'B'→[0,1], 'C'→[0,0,1].",
          "Designed for input features in X — not for the target y. Use this instead of LabelEncoder for feature columns.",
          "ohe = OneHotEncoder()\nohe.fit_transform([['A'],['B'],['A']])"
    ],
    successStory: "Categories expanded into binary flags.",
  },
  "ds-ml-18": {
    title: "SimpleImputer",
    description: "Import SimpleImputer with strategy='mean'. Run fit_transform on X. Print 'Imputado.'.",
    narrative: "Impute corrupted and missing telemetry values with column means before feeding the model.",
    concept: "Missing Value Imputation",
    conceptExplanation: "SimpleImputer provides the standard pipeline approach to handling missing values (NaN) in scikit-learn (while pandas offers fillna, it fails to integrate cleanly with modular inference pipelines). Core strategies: 'mean' (column mean — numeric only), 'median' (median — robust against outliers), 'most_frequent' (mode — supports categorical and numeric inputs), and 'constant' (fixed scalar passed via fill_value). Always encapsulate imputers inside a PIPELINE: computed statistical baselines (mean, median) must be derived SOLELY from training data and applied down to test data to prevent leakage. For complex imputations: KNNImputer or IterativeImputer.",
    hints: [
          "SimpleImputer is available in sklearn.impute. strategy defines the imputation logic: 'mean', 'median', 'most_frequent', or 'constant'.",
          "For constant replacement: SimpleImputer(strategy='constant', fill_value=0). Commonly chained in pipelines.",
          "imp = SimpleImputer(strategy='mean')\nimp.fit_transform(X)"
    ],
    successStory: "Missing values imputed.",
  },
  "ds-ml-19": {
    title: "Accuracy Score",
    description: "Use accuracy_score(y_real, y_pred) and print the result.",
    narrative: "Evaluate standard model hit-rate across balanced classification streams.",
    concept: "Accuracy",
    conceptExplanation: "accuracy_score measures the ratio of correct predictions over total predictions: true predictions / total samples. While it is the most intuitive metric for classification, it can be DANGEROUSLY MISLEADING on skewed class distributions. Example: a dataset containing 95% spam and 5% legitimate messages — a model predicting 'spam' unconditionally scores 95% accuracy while remaining entirely dysfunctional. In imbalanced scenarios, rely instead on precision, recall, F1-score, or ROC-AUC. For balanced classifications (50/50 splits), accuracy remains a clear reflection of performance.",
    hints: [
          "accuracy_score(y_real, y_pred) computes the proportion of correct predictions — parameter order is symmetric.",
          "Returns a float between 0.0 and 1.0. Multiply by 100 to get percentage.",
          "print(accuracy_score(y_real, y_pred))"
    ],
    successStory: "Classification accuracy recorded.",
  },
  "ds-ml-20": {
    title: "Confusion Matrix",
    description: "Use confusion_matrix(y_real, y_pred) and print the result.",
    narrative: "Examine predictive error topologies: false positives versus false negatives.",
    concept: "Confusion Matrix",
    conceptExplanation: "An N x N matrix (where N represents class count) breaking down how model predictions intersect with ground truth. In binary contexts: TN (True Negatives), FP (False Positives — false alarms), FN (False Negatives — missed detections), and TP (True Positives). This reveals CRITICAL ASYMMETRY in errors: in cybersecurity or medical diagnostics, an FN (failing to detect an intrusion or pathology) is catastrophic compared to an FP. To visualize: sns.heatmap(cm, annot=True). The confusion matrix forms the foundation for all derived metrics: precision = TP/(TP+FP), recall = TP/(TP+FN).",
    hints: [
          "confusion_matrix(y_real, y_pred) returns a 2D array: rows = true classes, columns = predicted classes.",
          "In binary setups: [[TN, FP], [FN, TP]]. TN/TP represent hits; FP/FN represent classification faults.",
          "print(confusion_matrix(y_real, y_pred))"
    ],
    successStory: "Errors mapped.",
  },
  "ds-ml-21": {
    title: "Classification Report",
    description: "Use classification_report(y_real, y_pred) and print the result.",
    narrative: "Generate an exhaustive diagnostic dossier: precision, recall, and F1 across all classes.",
    concept: "Classification Report",
    conceptExplanation: "classification_report generates an ASCII summary displaying precision, recall, F1-score, and support (sample count) for each individual class in a single call — providing an immediate comprehensive diagnostic overview. It additionally provides aggregated summaries: 'macro avg' (unweighted average across classes — treating every category equally) and 'weighted avg' (average weighted by support count — emphasizing dominant classes). In imbalanced datasets, macro average provides the most rigorous assessment. For executive reports: classification_report(y, y_pred, target_names=['benign', 'threat']) replaces numeric indices with descriptive labels.",
    hints: [
          "classification_report returns a formatted string containing precision, recall, F1, and support for EACH class.",
          "The fastest way to gain full visibility into model performance. Pipe it straight into print().",
          "print(classification_report(y_real, y_pred))"
    ],
    successStory: "Comprehensive report compiled.",
  },
  "ds-ml-22": {
    title: "Precision, Recall, F1",
    description: "Use precision_score(y_real, y_pred) and print the result.",
    narrative: "In imbalanced distributions, precision and recall reveal the true operational performance.",
    concept: "Precision, Recall, F1",
    conceptExplanation: "PRECISION = TP/(TP+FP): of all positive predictions, what proportion was actually positive. RECALL = TP/(TP+FN): of all real positive cases, what fraction was successfully identified. F1 = the harmonic mean between precision and recall — balancing both signals. The classic trade-off: tightening threshold to improve precision often degrades recall, and vice versa. In intrusion detection or fraud analysis, RECALL is heavily prioritized (no intrusion can slip by). In automated spam blocking, PRECISION is prioritized to avoid junking legitimate traffic. Use F1 when you require a single harmonious metric.",
    hints: [
          "precision_score, recall_score, and f1_score reside in sklearn.metrics, sharing the same signature as accuracy_score.",
          "For multiclass evaluation, pass average='macro' (unweighted mean) or 'weighted'.",
          "print(precision_score(y_real, y_pred))"
    ],
    successStory: "Trade-off measured.",
  },
  "ds-ml-23": {
    title: "MSE (Regression)",
    description: "Use mean_squared_error(y_real, y_pred) and print the result.",
    narrative: "Mean squared error: the canonical loss baseline for continuous regression trajectories.",
    concept: "Regression Metrics",
    conceptExplanation: "MSE (Mean Squared Error) = average of (y_real - y_pred)². Squaring differences achieves two goals: (1) eliminates negative signs; (2) HEAVILY PENALIZES large errors (magnifying major prediction failures). RMSE = sqrt(MSE) converts the error back into the native units of the target variable — making it directly interpretable. MAE (mean_absolute_error) uses absolute values instead of squares: more resilient against outliers, but treats all deviation magnitudes linearly. R² (r2_score) provides a normalized metric indicating variance explained. Production pipelines typically evaluate multiple metrics concurrently.",
    hints: [
          "mean_squared_error calculates the average of SQUARED deviations: severely penalizing large outliers.",
          "To compute RMSE (same scale as raw targets): np.sqrt(mse). For absolute linear error: mean_absolute_error.",
          "print(mean_squared_error(y_real, y_pred))"
    ],
    successStory: "Mean squared error calculated.",
  },
  "ds-ml-24": {
    title: "R² Score",
    description: "Use r2_score(y_real, y_pred) and print the result.",
    narrative: "Coefficient of determination: how effectively the model captures underlying variance.",
    concept: "R² (Coefficient of Determination)",
    conceptExplanation: "R² quantifies the proportion of variance in target y that is accounted for by model features. R² = 1 indicates flawless predictive fidelity; R² = 0 indicates the model performs no better than constantly guessing the mean of y; negative R² means predictions are literally WORSE than taking the simple baseline average. Typical real-world benchmarks hover between 0.5 and 0.9 depending on system entropy. NEVER compare raw R² across entirely different domains — it is problem-specific. For multiple regressors, consult Adjusted R² to penalize redundant feature bloat. This is what .score() outputs for regression estimators by default.",
    hints: [
          "r2_score returns values between -infinity and 1. 1 = perfect prediction; 0 = trivial mean baseline; negative = worse than average.",
          "Represents the default evaluation metric returned by .score() in regression estimators.",
          "print(r2_score(y_real, y_pred))"
    ],
    successStory: "Explained variance quantified.",
  },
  "ds-ml-25": {
    title: "Pipeline",
    description: "Create a Pipeline with scaler and clf. Then print how many steps the pipeline has.",
    narrative: "Encapsulate feature preprocessing and model inference into a unified pipeline object.",
    concept: "Pipelines",
    conceptExplanation: "Pipeline chains together a sequence of data transformers culminating in a final estimator within a unified object. Crucial benefits: (1) eliminates data leakage by guaranteeing transformations (scaling, imputation) compute statistics SOLELY on train folds; (2) streamlines code into a single object with unified .fit() and .predict() methods; (3) facilitates joint hyperparameter tuning across preprocessing AND models simultaneously inside GridSearchCV. Syntax: Pipeline([('scaler', StandardScaler()), ('model', LogisticRegression())]). For quick construction without naming steps, use make_pipeline.",
    hints: [
          "Pipeline accepts a list of tuples via the steps argument.",
          "In this simulator, steps are stored in pipe.s.",
          "pipe = Pipeline(steps=[('scaler', StandardScaler()), ('clf', LogisticRegression())])\nprint(len(pipe.s))"
    ],
    successStory: "Unified pipeline established.",
  },
  "ds-ml-26": {
    title: "Cross-Validation",
    description: "Use cross_val_score(modelo, X, y, cv=5), save to scores, and print the mean rounded to 2 decimal places.",
    narrative: "Rigorous evaluation: 5 rotating validation partitions to ensure generalization.",
    concept: "Cross-Validation (K-Fold)",
    conceptExplanation: "A single train/test split can be misleading if the partition happens to be unusually easy or difficult. K-Fold Cross-Validation splits the dataset into K equal slices (folds): it trains on K-1 folds and validates on the remaining fold, rotating until every slice serves as the test set. cross_val_score executes this rotation automatically and returns a list of K scores. Taking the mean and standard deviation provides a robust, low-variance estimate of model capability. For classification tasks, StratifiedKFold maintains class balances across all slices. Standard benchmark is cv=5 or cv=10.",
    hints: [
          "cross_val_score returns an array of scores, one per fold.",
          "Calculate the mean without numpy: sum(scores) / len(scores).",
          "scores = cross_val_score(modelo, X, y, cv=5)\nprint(round(sum(scores) / len(scores), 2))"
    ],
    successStory: "Performance validated across K folds.",
  },
  "ds-ml-27": {
    title: "GridSearchCV",
    description: "Create GridSearchCV with C=[0.1,1,10], cv=3. Print how many C values will be evaluated.",
    narrative: "Automate hyperparameter optimization across cross-validation sweeps.",
    concept: "Hyperparameter Tuning",
    conceptExplanation: "GridSearchCV automates exhaustive hyperparameter exploration: provide an estimator along with a dictionary of candidate hyperparameter values, and it evaluates EVERY combination using cross-validation, returning optimal configurations. Following .fit(): grid.best_params_ exposes winning settings, grid.best_score_ records top CV performance, and grid.best_estimator_ holds the model refitted on full data. For sprawling parameter spaces, prefer RandomizedSearchCV (random sampling — drastically faster). For Bayesian optimization: Optuna or Hyperopt. CARDINAL RULE: never evaluate tuning on the final isolated test set.",
    hints: [
          "param_grid is a dictionary where key 'C' holds the list of candidate values.",
          "After initializing grid, access grid.param_grid['C'] to examine the list.",
          "grid = GridSearchCV(modelo, param_grid={'C': [0.1, 1, 10]}, cv=3)\nprint(len(grid.param_grid['C']))"
    ],
    successStory: "Hyperparameters optimized.",
  },
  "ds-ml-28": {
    title: "KMeans (Clustering)",
    description: "Create KMeans(n_clusters=3), train on X, and print kmeans.labels_ generated by fit.",
    narrative: "Unsupervised machine learning: discover organic clusters without target labels.",
    concept: "Unsupervised Learning",
    conceptExplanation: "Clustering embodies unsupervised learning: supplied with feature matrix X without labels, the algorithm uncovers underlying structural groupings autonomously. KMeans: parameterized by K, it initializes K centroids and assigns every sample to its nearest centroid, iteratively refining positions until convergence. Post-fitting attributes: .labels_ (cluster assignments per point) and .cluster_centers_ (spatial coordinates of centroids). Applications: user segmentation, pattern clustering, vector quantization, and anomaly identification. Choose K using the elbow method (plotting inertia vs K) or silhouette analysis.",
    hints: [
          "KMeans computes cluster labels upon fitting.",
          "Inspect discovered partition groups via kmeans.labels_.",
          "kmeans = KMeans(n_clusters=3)\nkmeans.fit(X)\nprint(kmeans.labels_)"
    ],
    successStory: "Three distinct clusters discovered.",
  },
  "ds-ml-29": {
    title: "DBSCAN",
    description: "Import DBSCAN, create 'dbs', and run fit(X). Print 'DBSCAN ok.'.",
    narrative: "Density-based spatial clustering — delineate arbitrary non-linear cluster boundaries.",
    concept: "DBSCAN",
    conceptExplanation: "DBSCAN (Density-Based Spatial Clustering of Applications with Noise) extracts clusters based on spatial POINT DENSITY rather than distance to geometric centroids. Superior advantages over KMeans: (1) does NOT require specifying cluster count beforehand; (2) delineates arbitrarily shaped geometries (interlocking rings, curves); (3) automatically flags sparse outliers as noise (label -1). Hyperparameters: eps (neighborhood search radius) and min_samples (core density threshold). Highly suited for anomaly detection and geometric clustering. Trade-off: struggles in high-dimensional domains where Euclidean distance degrades.",
    hints: [
          "DBSCAN is part of sklearn.cluster. It does not require predefining cluster counts.",
          "Key parameters: eps (maximum neighbor radius) and min_samples (minimum points to form a core point).",
          "dbs = DBSCAN()\ndbs.fit(X)\nprint('DBSCAN ok.')"
    ],
    successStory: "Dense clusters identified.",
  },
  "ds-ml-30": {
    title: "PCA",
    description: "Create PCA(n_components=2), apply fit_transform(X), save to reduzido, and print the first reduced row.",
    narrative: "Compress feature dimensionality while preserving maximal variance across latent projections.",
    concept: "PCA (Principal Component Analysis)",
    conceptExplanation: "PCA reduces matrix dimensionality by finding orthogonal vectors (principal components) that capture the GREATEST VARIANCE across data points. Use for: (1) 2D/3D visual projection of sprawling feature spaces; (2) speeding up training routines (fewer columns = faster computations); (3) mitigating the curse of dimensionality; (4) denoising (lower-variance components often capture noise). pca.explained_variance_ratio_ discloses cumulative variance retained per component — choose N to preserve 80-95%. MANDATORY: always apply StandardScaler beforehand — PCA is extremely sensitive to unscaled variances. For non-linear manifold reduction, explore t-SNE or UMAP.",
    hints: [
          "fit_transform returns a compressed projection matrix with reduced columns.",
          "Access the initial sample row at reduzido[0].",
          "pca = PCA(n_components=2)\nreduzido = pca.fit_transform(X)\nprint(reduzido[0])"
    ],
    successStory: "Dimensionality compressed while preserving variance.",
  },
  "ds-dl-01": {
    title: "Network Awakening",
    description: "Assemble a dictionary config with camadas_ocultas=3 and tensores=128. Print config['tensores'].",
    narrative: "Initialize the deep neural matrix architecture.",
    concept: "Deep Learning Frameworks",
    conceptExplanation: "TensorFlow (Google) and PyTorch (Meta) stand as the two dominant Deep Learning frameworks — virtually all contemporary AI relies on one of the two. Both manipulate TENSORS (generalized multidimensional arrays: 0D scalar, 1D vector, 2D matrix, 3D RGB volume, 4D video batch). Both provide AUTOMATIC DIFFERENTIATION: tracing operations dynamically to compute exact gradients — the mathematical engine driving backpropagation. TensorFlow + Keras excels in scalable production deployments; PyTorch dominates research and modern LLM development. Both harness GPU/TPU acceleration to achieve 50-100x performance gains.",
    hints: [
          "Use a Python dictionary to define the neural network configuration parameters.",
          "Access dictionary elements using key indexing: config['tensores'].",
          "config = {'camadas_ocultas': 3, 'tensores': 128}\nprint(config['tensores'])"
    ],
    successStory: "Synaptic pathways activated.",
  },
  "ds-dl-02": {
    title: "Sequential and Dense",
    description: "Create modelo = Sequential([Dense(64), Dense(10)]) and print how many layers it contains.",
    narrative: "Stack feedforward layers to construct the neural network topology.",
    concept: "Sequential API and Dense Layers",
    conceptExplanation: "Sequential is Keras' streamlined linear model interface: supply an ordered list of layers, and signal feeds forward through them automatically. Dense (fully connected) is the foundational neural building block — every neuron receives incoming connections from ALL neurons in the preceding layer. Hidden layers commonly utilize 32, 64, 128, or 256 units based on task complexity. The final layer is strictly constrained by the objective: 1 neuron for scalar regression, N neurons for N-class categorization. For branching or multi-input graphs (Transformers, ResNets), use the Functional API. Other common layers: Conv2D, LSTM, Dropout.",
    hints: [
          "Sequential takes a list of layer instances.",
          "In this simulation environment, layers are stored in modelo.l.",
          "modelo = Sequential([Dense(64), Dense(10)])\nprint(len(modelo.l))"
    ],
    successStory: "Architecture registered.",
  },
  "ds-dl-03": {
    title: "Model Compilation",
    description: "Call modelo.compile(optimizer='adam', loss='mse') and print the loss recorded on the model.",
    narrative: "Configure the internal learning engine and loss optimization criteria.",
    concept: "Compilation (Optimizer and Loss)",
    conceptExplanation: "compile() sets the training mechanics before execution begins. (1) OPTIMIZER: 'adam' (standard adaptive momentum optimizer), 'sgd' (classic stochastic gradient descent), 'rmsprop' (effective for recurrent topologies). (2) LOSS (penalty function quantifying prediction error): 'mse' (continuous regression), 'binary_crossentropy' (two-class sigmoid output), 'categorical_crossentropy' (one-hot multiclass targets), 'sparse_categorical_crossentropy' (integer-indexed classes). (3) Optional METRICS: ['accuracy']. Without compiling, fit() cannot execute — the network must know how to quantify error and backpropagate weight corrections.",
    hints: [
          "compile defines optimizer dynamics and the loss criterion prior to training.",
          "Once compiled, read the configured loss via modelo.loss.",
          "modelo.compile(optimizer='adam', loss='mse')\nprint(modelo.loss)"
    ],
    successStory: "Engine primed.",
  },
  "ds-dl-04": {
    title: "Training (fit)",
    description: "Call modelo.fit(X, y, epochs=5) and print 'Treinamento concluído.'.",
    narrative: "Train the weights across 5 iterative training epochs.",
    concept: "Epochs and Batches",
    conceptExplanation: "An EPOCH represents one complete traversal across the entire training dataset. Within each epoch, records are partitioned into mini-BATCHES (e.g. 32, 64 samples): gradients and weight updates compute per batch rather than per individual sample or entire dataset ('mini-batch gradient descent'). Increasing epochs minimizes training loss, but excessive iterations precipitate overfitting (memorization). Track validation performance (validation_split=0.2 in fit): when validation loss plateaus and starts climbing while training loss drops, the network is overfitting. Counteract via dropout, weight regularization, early stopping, or dataset augmentation.",
    hints: [
          "fit is where model parameters undergo actual optimization. Pass X, y, and epochs.",
          "Each epoch performs a COMPLETE pass through training data, updating weights batch by batch.",
          "modelo.fit(X, y, epochs=5)\nprint('Treinamento concluído.')"
    ],
    successStory: "Weights converged.",
  },
  "ds-dl-05": {
    title: "Activation: ReLU",
    description: "Create Dense(64, activation='relu') and print 'ReLU ativada.'.",
    narrative: "ReLU is the foundational activation function powering modern deep networks.",
    concept: "Activation Functions",
    conceptExplanation: "Activation functions introduce NON-LINEARITY into neural networks — without non-linear activations, any multi-layer architecture collapses mathematically into a single linear projection regardless of layer depth. ReLU (Rectified Linear Unit) = max(0, x) is the universal modern default: computationally trivial, fast to differentiate, and mitigates vanishing gradients that crippled classic tanh and sigmoid functions. Variants: LeakyReLU (permits a minor non-zero gradient for negative inputs to prevent 'dead neurons'), ELU, GELU (standard in modern Transformers). Hidden dense layers almost invariably utilize ReLU.",
    hints: [
          "Pass activation='relu' when instantiating the layer. Without activations, layers behave as basic linear mappings.",
          "ReLU = max(0, x): maps negatives to zero while passing positive values straight through.",
          "camada = Dense(64, activation='relu')\nprint('ReLU ativada.')"
    ],
    successStory: "Non-linearity injected.",
  },
  "ds-dl-06": {
    title: "Activation: Sigmoid",
    description: "Create Dense(1, activation='sigmoid') for binary output. Print 'Sigmoid pronta.'.",
    narrative: "For binary decisions, squash output activations into probabilities between 0 and 1.",
    concept: "Sigmoid (Binary Output)",
    conceptExplanation: "The Sigmoid function squashes any real value into the (0, 1) probability range: S(x) = 1 / (1 + e^-x). It serves as the standard terminal activation for BINARY CLASSIFICATION (single neuron outputting the probability that an event belongs to class 1). When utilizing sigmoid on the output layer, ALWAYS compile with loss='binary_crossentropy'. DO NOT use sigmoid in deep hidden layers: its derivatives saturate near 0 for extreme positive/negative values, causing vanishing gradients that freeze backpropagation.",
    hints: [
          "For binary classification, use 1 neuron equipped with sigmoid — bounding outputs between 0 and 1.",
          "Pair with loss='binary_crossentropy' inside compile().",
          "saida = Dense(1, activation='sigmoid')\nprint('Sigmoid pronta.')"
    ],
    successStory: "Binary probabilistic output established.",
  },
  "ds-dl-07": {
    title: "Activation: Softmax",
    description: "Create Dense(10, activation='softmax') for 10 classes. Print 'Softmax configurada.'.",
    narrative: "For multiclass classification, generate a normalized probability distribution summing to 1.",
    concept: "Softmax (Multiclass)",
    conceptExplanation: "Softmax generalizes sigmoid to MULTICLASS classification problems: it takes unnormalized output scores (logits) across N classes and normalizes them into probabilities that sum strictly to 1.0. Every output neuron represents the probability of a distinct class. Use Dense(N_CLASSES, activation='softmax') as the terminal layer. Pair it with loss='categorical_crossentropy' if targets are one-hot encoded, or 'sparse_categorical_crossentropy' if targets are integer class IDs. To retrieve the winning class index: np.argmax(predictions, axis=1).",
    hints: [
          "Softmax outputs N values that sum to 1.0 — forming a proper probability distribution across classes.",
          "Configure Dense(N_CLASSES, activation='softmax') and pair with categorical_crossentropy.",
          "saida = Dense(10, activation='softmax')\nprint('Softmax configurada.')"
    ],
    successStory: "Class distribution configured.",
  },
  "ds-dl-08": {
    title: "Input Shape",
    description: "Create Dense(64, input_shape=(784,)) and print 'Input definido.'.",
    narrative: "The initial layer must define the incoming tensor shape to initialize network weights.",
    concept: "Input Shape",
    conceptExplanation: "The initial layer in a neural network must declare input_shape so the framework knows how many incoming weight connections to allocate. input_shape is supplied as a TUPLE representing the shape of a SINGLE sample, EXCLUDING the batch dimension (which is dynamic and managed automatically). For flattened 28x28 grayscale images: input_shape=(784,). For RGB images: input_shape=(224, 224, 3). For tabular datasets with 20 features: input_shape=(20,). Subsequent layers infer their incoming dimensions automatically from preceding outputs.",
    hints: [
          "input_shape takes a TUPLE — define it exclusively on the FIRST layer (subsequent layers infer dimensions automatically).",
          "For flattened 28x28 images: (784,). Do NOT include the dynamic batch dimension.",
          "entrada = Dense(64, input_shape=(784,))\nprint('Input definido.')"
    ],
    successStory: "Input dimension defined.",
  },
  "ds-dl-09": {
    title: "Dropout",
    description: "Create Dropout(0.5) and print 'Dropout ativo.'.",
    narrative: "Regularization: randomly deactivate neurons during training passes to eliminate co-adaptation.",
    concept: "Dropout",
    conceptExplanation: "Dropout randomly deactivates a fraction of neurons (setting their activations to zero) on each training batch pass. This forces the network to learn redundant, robust representations rather than relying on brittle co-adaptations between specific neurons. Parameter rate specifies deactivation probability (commonly 0.2 to 0.5). CRUCIAL BEHAVIOR: Dropout operates SOLELY during training (fit); during evaluation and inference (evaluate/predict), all neurons remain fully active, automatically scaled by (1 - rate). A cornerstone regularization technique for preventing deep network overfitting.",
    hints: [
          "Dropout(rate) accepts the probability of deactivating each neuron (float between 0 and 1).",
          "A rate of 0.5 is standard: 50% of units are silenced randomly per batch DURING TRAINING (all stay active during inference).",
          "drop = Dropout(0.5)\nprint('Dropout ativo.')"
    ],
    successStory: "Overfitting suppressed.",
  },
  "ds-dl-10": {
    title: "Batch Normalization",
    description: "Create BatchNormalization() and print 'BatchNorm.'.",
    narrative: "Normalize layer activations per batch — accelerating convergence and stabilizing gradients.",
    concept: "Batch Normalization",
    conceptExplanation: "BatchNormalization normalizes incoming activations across each mini-batch (shifting mean to 0 and variance to 1) before scaling and shifting them with learnable parameters (gamma and beta). Benefits: (1) drastically speeds up training convergence (permitting substantially higher learning rates); (2) mitigates internal covariate shift; (3) provides mild regularization effects. Standard placement: typically inserted right after Conv2D or Dense layers, either immediately before or after activation functions. Essential in modern deep convolutional backbones like ResNet.",
    hints: [
          "BatchNormalization() takes no mandatory arguments. Insert it downstream of Dense or Conv2D layers.",
          "Standardizes layer activations (mean 0, variance 1) across batches — stabilizing internal representations.",
          "bn = BatchNormalization()\nprint('BatchNorm.')"
    ],
    successStory: "Activations stabilized.",
  },
  "ds-dl-11": {
    title: "Flatten",
    description: "Create Flatten() to collapse a 2D tensor into 1D. Print 'Flatten ok.'.",
    narrative: "Bridge convolutional spatial feature maps into dense feedforward classification layers.",
    concept: "Flatten",
    conceptExplanation: "Flatten bridges multidimensional feature maps (such as 3D outputs from Conv2D layers: height, width, channels) into a 1D vector suitable for input into Dense layers. For instance, a tensor shaped (7, 7, 64) is flattened into a 1D vector of length 3,136. It introduces zero trainable weights — acting purely as a tensor reshaping operation. Alternative modern approach: GlobalAveragePooling2D, which computes the spatial average across each channel, drastically curtailing parameter counts and reducing overfitting in architectures like ResNet.",
    hints: [
          "Flatten() converts a tensor (h, w, c) into a 1D vector — commonly placed between Conv2D and Dense layers.",
          "It requires no arguments — it simply reshapes tensor dimensions.",
          "f = Flatten()\nprint('Flatten ok.')"
    ],
    successStory: "Tensor flattened.",
  },
  "ds-dl-12": {
    title: "Convolutional 2D",
    description: "Create Conv2D(32, kernel_size=(3,3), activation='relu') and print 'Conv2D pronta.'.",
    narrative: "Convolutional layers form the sensory foundation of visual spatial analysis.",
    concept: "Convolutional Neural Networks",
    conceptExplanation: "Conv2D is the foundational building block of CNNs (Convolutional Neural Networks) — dominant across computer vision. It slides localized weight kernels (filters, typically 3x3 or 5x5) across input images to extract spatial patterns: edges, textures, corners, and motifs. Unlike Dense layers (which analyze pixels independently), Conv2D preserves 2D spatial locality and weight sharing. Core parameters: filters (number of distinct feature maps to extract), kernel_size (filter window dimensions), strides (stride step size), and padding ('same' preserves spatial dimensions, 'valid' crops borders). Famous architectures: ResNet, VGG, Inception, EfficientNet.",
    hints: [
          "Conv2D(filters, kernel_size, activation). filters defines how many feature maps to generate.",
          "kernel_size=(3,3) represents the classic standard filter size for image recognition.",
          "conv = Conv2D(32, kernel_size=(3,3), activation='relu')\nprint('Conv2D pronta.')"
    ],
    successStory: "Visual spatial filters active.",
  },
  "ds-dl-13": {
    title: "MaxPooling 2D",
    description: "Create MaxPooling2D(pool_size=(2,2)) and print 'Pool ok.'.",
    narrative: "Downsample spatial dimensionality while retaining dominant feature activations.",
    concept: "Pooling",
    conceptExplanation: "Pooling REDUCES spatial dimensions between convolutional stages — lowering compute load and introducing spatial translation invariance. MaxPooling retains the MAXIMUM value within each window (preserving peak activations); AveragePooling computes the arithmetic mean (smoother response). Standard size: pool_size=(2,2) with default strides=(2,2) — halving image width and height. Classic CNN pattern: Conv2D → ReLU → MaxPooling repeated progressively, capped by Flatten + Dense. In advanced modern architectures, pooling is often replaced by strided convolutions or GlobalAveragePooling.",
    hints: [
          "MaxPooling2D(pool_size=(2,2)) halves image dimensions by taking the MAXIMUM value across each 2x2 patch.",
          "Always placed downstream of Conv2D — following the standard pattern: Conv → ReLU → Pool.",
          "pool = MaxPooling2D(pool_size=(2,2))\nprint('Pool ok.')"
    ],
    successStory: "Spatial dimensions reduced.",
  },
  "ds-dl-14": {
    title: "LSTM",
    description: "Create LSTM(64) to process sequential streams. Print 'LSTM ativa.'.",
    narrative: "Recurrent networks retain memory across chronological time-series steps.",
    concept: "Recurrent Neural Networks (LSTM)",
    conceptExplanation: "LSTM (Long Short-Term Memory) is the classic RNN architecture designed to process SEQUENCES (text tokens, acoustic audio, sensor time-series). Unlike feedforward networks, it maintains an internal hidden CELL STATE across temporal steps — remembering past contexts. It solves the vanishing gradient problem of simple RNNs through gating mechanisms (forget gate, input gate, output gate). Variations: GRU (streamlined with fewer gates), Bidirectional (scans past and future directions). NOTE: in modern NLP, TRANSFORMERS (BERT, GPT) have largely superseded LSTMs due to full parallelization and superior long-range attention mechanisms.",
    hints: [
          "LSTM(units) creates a recurrent layer. Essential for sequential data (text, time-series).",
          "Maintains an internal 'state' across sequence steps — bridging short-term and long-term memory.",
          "lstm = LSTM(64)\nprint('LSTM ativa.')"
    ],
    successStory: "Sequential memory online.",
  },
  "ds-dl-15": {
    title: "Embedding (NLP)",
    description: "Create Embedding(input_dim=10000, output_dim=128) and print 'Embedding criado.'.",
    narrative: "Transform discrete categorical tokens into dense semantic vector representations.",
    concept: "Embeddings",
    conceptExplanation: "An Embedding layer serves as the entry point for NLP and categorical sequence pipelines. It maps integer token IDs from a vocabulary into DENSE LEARNABLE VECTORS. Advantages over one-hot vectors: (1) massive parameter efficiency (a 50,000 vocab maps to 128 dimensions instead of a 50,000-wide sparse vector); (2) semantically similar concepts cluster nearby in latent space (king - queen ≈ man - woman); (3) drastically accelerates network throughput. Embedding weights are trained end-to-end or initialized from pretrained vectors (Word2Vec, GloVe). Modern text processing starts with an Embedding layer before feeding attention or recurrent blocks.",
    hints: [
          "Embedding(vocab_size, dim) maps integer word indices into dense continuous vector embeddings.",
          "First layer in NLP models — inputs are token index integers, outputs are dense continuous vectors.",
          "emb = Embedding(input_dim=10000, output_dim=128)\nprint('Embedding criado.')"
    ],
    successStory: "Vocabulary vectorized.",
  },
  "ds-dl-16": {
    title: "Predict",
    description: "Use modelo.predict(X), save to pred, and print the first predicted value.",
    narrative: "Apply the converged neural weights against incoming inference streams.",
    concept: "Inference in Keras",
    conceptExplanation: "modelo.predict(X) runs inference on unseen data using the trained network — returning a NumPy array of predictions. X must adhere to the full input SHAPE (batch_size, features...). In binary classification with sigmoid, it yields probabilities; in multiclass classification with softmax, it outputs a probability vector per sample. To identify the top predicted class: np.argmax(predictions, axis=1). For single samples, maintain the batch dimension: model.predict(X[0:1]). In high-throughput production environments, utilize model.predict_on_batch or export the model to TFLite/ONNX for low-latency serving.",
    hints: [
          "predict returns a 2D array structure in this simulator environment.",
          "Access row zero, column zero using pred[0][0].",
          "pred = modelo.predict(X)\nprint(pred[0][0])"
    ],
    successStory: "Inference delivered.",
  },
  "ds-dl-17": {
    title: "Evaluate",
    description: "Use modelo.evaluate(X_test, y_test), save to metricas, and print the accuracy.",
    narrative: "Compute loss functions and diagnostic metrics across the isolated holdout test split.",
    concept: "Evaluate",
    conceptExplanation: "modelo.evaluate(X, y) calculates the loss and all compile-time metrics over the provided dataset — analogous to scikit-learn's .score(). Returns a list: [loss, metric1, metric2, ...]. To map metric names dynamically, inspect model.metrics_names. ALWAYS evaluate strictly on an ISOLATED TEST SET, never on training data. Unlike predict (which outputs raw per-sample inferences), evaluate produces aggregated summary evaluation metrics. Crucial for objectively benchmarking model iterations during A/B testing and release gates.",
    hints: [
          "evaluate typically returns [loss, metrics...].",
          "In this setup, accuracy is located at index 1.",
          "metricas = modelo.evaluate(X_test, y_test)\nprint(metricas[1])"
    ],
    successStory: "Final performance benchmarked.",
  },
  "ds-dl-18": {
    title: "Summary",
    description: "Call modelo.summary() and print 'Sumário gerado.'.",
    narrative: "Review layer architecture, tensor shapes, and parameter counts before allocating compute.",
    concept: "Model Summary",
    conceptExplanation: "modelo.summary() displays an architectural inspection table: layer names, output tensor shapes, and parameter counts (weights + biases) per stage, alongside total trainable parameters. ALWAYS run this immediately after compiling an architecture — verifying dimensional alignment before spending hours on misconfigured training loops. Tracking total parameters is essential: bloated parameter counts cause training slowdowns and severe overfitting; insufficient parameters limit representation capacity. For multi-million parameter models, evaluate lightweight designs (MobileNet, EfficientNet) or transfer learning.",
    hints: [
          "modelo.summary() prints a breakdown table detailing layer topologies, shapes, and weights.",
          "Invoke it right after defining the model to verify layer shapes align properly.",
          "modelo.summary()"
    ],
    successStory: "Architecture inspected.",
  },
  "ds-dl-19": {
    title: "Early Stopping",
    description: "Create EarlyStopping(patience=5) and print 'Callback configurado.'.",
    narrative: "Halt training automatically when validation metrics stop improving to prevent overfitting.",
    concept: "Callbacks (Early Stopping)",
    conceptExplanation: "EarlyStopping monitors a validation metric throughout training — if that metric fails to improve over N consecutive epochs (patience), it halts training execution automatically, preventing overfitting and conserving compute cycles. Key arguments: monitor='val_loss' (target metric to track), patience=N (epoch tolerance before stopping), restore_best_weights=True (reverts model parameters to the optimal epoch). Pass it to fit: model.fit(..., callbacks=[es]). Considered an absolute best practice in deep learning workflows. Companion callbacks: ModelCheckpoint, ReduceLROnPlateau, and TensorBoard.",
    hints: [
          "EarlyStopping monitors a validation metric (val_loss by default).",
          "patience=5 allows 5 epochs without improvement before triggering early termination.",
          "es = EarlyStopping(patience=5)\nprint('Callback configurado.')"
    ],
    successStory: "Automated early stopping armed.",
  },
  "ds-dl-20": {
    title: "Model Checkpoint",
    description: "Create ModelCheckpoint('best.h5', save_best_only=True) and print 'Checkpoint armado.'.",
    narrative: "Automatically persist the highest-performing network checkpoint during training passes.",
    concept: "Model Checkpoint",
    conceptExplanation: "ModelCheckpoint serializes model weights to disk during training iterations. Configuring save_best_only=True ensures the file updates ONLY when the monitored validation metric surpasses all previous epochs — guaranteeing you retain the PEAK performing iteration rather than the final overfitted epoch. Key arguments: filepath ('model_{epoch:02d}_{val_loss:.4f}.h5' dynamically injects metrics), monitor (target metric), mode ('min' for loss, 'max' for accuracy). Pair with EarlyStopping to capture optimal weights whenever training terminates.",
    hints: [
          "ModelCheckpoint(filepath, save_best_only=True) saves checkpoints during training, retaining only the top-performing version.",
          "Monitors val_loss by default — pass monitor='val_accuracy' to track classification accuracy.",
          "mc = ModelCheckpoint('best.h5', save_best_only=True)\nprint('Checkpoint armado.')"
    ],
    successStory: "Optimal checkpoint secured.",
  },
  "ds-dl-21": {
    title: "Learning Rate",
    description: "Configure Adam(learning_rate=0.001) and print 'LR configurado.'.",
    narrative: "Learning rate governs parameter update step sizes — the most critical hyperparameter in deep learning.",
    concept: "Learning Rate",
    conceptExplanation: "The learning rate (LR) dictates the step size taken along the negative loss gradient during parameter updates. Too high: updates overshoot loss minima, causing optimization divergence or instability; too low: optimization crawls slowly and gets trapped in suboptimal local minima. Instead of passing string 'adam' into compile(), explicitly instantiate Adam(learning_rate=0.001) to gain granular control. Typical initial ranges: 1e-3 (Adam default), 1e-4, or 1e-2. Modern pipelines leverage adaptive learning rate schedules (e.g. ReduceLROnPlateau or cosine annealing) to dynamically decay LR over epochs.",
    hints: [
          "Instead of passing the 'adam' string to compile, instantiate Adam(learning_rate=X) for explicit step-size control.",
          "Typical values: 0.001 (standard Adam default), 0.01, 0.0001. Too high causes divergence; too low stalls training.",
          "opt = Adam(learning_rate=0.001)\nprint('LR configurado.')"
    ],
    successStory: "Learning rate configured.",
  },
  "ds-dl-22": {
    title: "Save Model",
    description: "Call modelo.save('rede.h5') and print 'Modelo salvo.'.",
    narrative: "Serialize the converged network architecture and trained synaptic weights to permanent storage.",
    concept: "Model Persistence",
    conceptExplanation: "modelo.save('model.h5') serializes the complete network state to disk in a single file: model architecture configuration, trained weight matrices, compilation configuration (loss, optimizer), and current optimizer state (enabling training resumption). Modern TensorFlow/Keras standard: the '.keras' format or native SavedModel directory format is preferred over legacy HDF5 (.h5). Once saved, the artifact can be deployed straight to inference servers, edge devices, or cloud microservices without needing original model definition code.",
    hints: [
          "modelo.save('model.h5') bundles network topology, weights, and optimizer parameters into a single archive.",
          "Modern standard format: 'model.keras' (SavedModel) replacing legacy .h5.",
          "modelo.save('rede.h5')"
    ],
    successStory: "Model persisted.",
  },
  "ds-dl-23": {
    title: "Load Model",
    description: "Use load_model('rede.h5') and print 'Modelo carregado.'.",
    narrative: "Deserialize a persisted neural model directly into memory for live inference.",
    concept: "Load Model",
    conceptExplanation: "load_model(filepath) reconstructs a fully operational neural model straight from a serialized disk artifact. It instantiates the architecture, restores trained weights, and recovers optimizer parameters — ready for immediate .predict() or continued training without requiring the original architecture code. If the model utilizes custom layers, functions, or loss metrics, specify them via custom_objects={'CustomLayer': CustomLayer} during load time. Essential in production serving architectures (FastAPI, Flask, Triton Inference Server).",
    hints: [
          "load_model(filepath) restores the entire model structure from disk.",
          "Once loaded, the model is instantly primed for .predict() without reconstructing layer definitions.",
          "modelo = load_model('rede.h5')"
    ],
    successStory: "Model restored.",
  },
  "ds-dl-24": {
    title: "PyTorch Tensor",
    description: "Import torch. Create t = torch.tensor([1, 2, 3]) and print it.",
    narrative: "Initialize computational tensors within the PyTorch deep learning runtime.",
    concept: "PyTorch Tensors",
    conceptExplanation: "PyTorch represents the primary research and industry standard for cutting-edge deep learning, LLMs, and computer vision. In PyTorch, Tensors are the core data structures: n-dimensional arrays directly analogous to NumPy's ndarray, but engineered with GPU execution capabilities and automatic differentiation tracking. Creation patterns: torch.tensor([1, 2, 3]), torch.zeros((3, 3)), torch.randn((10, 5)). Conversion between frameworks is seamless: torch.from_numpy(arr) and t.numpy() share underlying memory buffers without data duplication.",
    hints: [
          "Import without an alias — simply write 'import torch'.",
          "torch.tensor(list) parallels NumPy's np.array(), backed by hardware acceleration features.",
          "t = torch.tensor([1, 2, 3])\nprint(t)"
    ],
    successStory: "Tensor instantiated.",
  },
  "ds-dl-25": {
    title: "nn.Linear",
    description: "Create linear = nn.Linear(in_features=10, out_features=5) and print 'Linear pronta.'.",
    narrative: "PyTorch's fully connected linear projection layer — mapping input features to latent targets.",
    concept: "PyTorch Layers (nn.Linear)",
    conceptExplanation: "nn.Linear(in_features, out_features) represents PyTorch's fully connected layer (equivalent to Keras' Dense). Computes y = xA^T + b. Crucial architectural distinction: while Keras automatically infers input dimensions from preceding layers, PyTorch requires explicit declaration of BOTH in_features (input dimension) and out_features (output dimension). If passing input tensor x shaped (batch, 10), linear(x) outputs a tensor shaped (batch, 5). Houses internal trainable weight and bias parameters (linear.weight, linear.bias).",
    hints: [
          "nn.Linear(in, out) is PyTorch's direct equivalent to Keras Dense.",
          "Unlike Keras (which infers inputs dynamically), PyTorch explicitly requires in_features and out_features.",
          "linear = nn.Linear(in_features=10, out_features=5)\nprint('Linear pronta.')"
    ],
    successStory: "Linear layer ready.",
  },
  "ds-dl-26": {
    title: "nn.Module",
    description: "Create a class MinhaRede(nn.Module). Print 'Módulo criado.'.",
    narrative: "The idiomatic design pattern for declaring neural architectures in PyTorch.",
    concept: "nn.Module",
    conceptExplanation: "In PyTorch, custom neural networks are implemented as Python classes that INHERIT from nn.Module. Canonical pattern: (1) invoke super().__init__() in constructor; (2) instantiate sub-layers (nn.Linear, nn.Conv2d, nn.Dropout) as self attributes inside __init__; (3) define the forward computational graph inside def forward(self, x): describing how inputs flow through layers to produce outputs. Inheriting from nn.Module automatically registers sub-layers, tracks gradients, manages parameters (model.parameters()), and enables device relocation (model.to('cuda')).",
    hints: [
          "In PyTorch, custom architectures are classes that INHERIT from nn.Module.",
          "Define layers inside __init__ and data flow in forward(self, x). Here, just define the class skeleton.",
          "class MinhaRede(nn.Module): pass\nprint('Módulo criado.')"
    ],
    successStory: "Base module established.",
  },
  "ds-dl-27": {
    title: "Autograd",
    description: "Create t = torch.tensor(2.0, requires_grad=True) and print 'Gradiente ativado.'.",
    narrative: "Activate PyTorch's automatic differentiation engine across active tensor operations.",
    concept: "Autograd (Automatic Differentiation)",
    conceptExplanation: "Autograd is the core mathematical engine empowering neural network learning: it automatically traces all mathematical operations on tensors flagged with requires_grad=True, constructing an internal DYNAMIC COMPUTATIONAL GRAPH (DAG). When calling loss.backward(), PyTorch traverses this computational graph backward from loss to inputs (reverse-mode autodiff / backpropagation), evaluating partial derivatives (gradients) for every parameter with requires_grad=True. Computed gradients accumulate in tensor.grad, where optimizers consume them to update weights. Typically, nn.Module parameters have requires_grad=True enabled by default.",
    hints: [
          "Pass requires_grad=True when creating the tensor — PyTorch will track all downstream operations.",
          "Subsequently calling .backward() computes gradients with respect to this tensor.",
          "t = torch.tensor(2.0, requires_grad=True)\nprint('Gradiente ativado.')"
    ],
    successStory: "Automatic differentiation armed.",
  },
  "ds-dl-28": {
    title: "Adam Optimizer",
    description: "Create optim.Adam(parametros, lr=0.001) and print 'Optim Adam criado.'.",
    narrative: "Configure the optimizer responsible for updating weight matrices across each training step.",
    concept: "PyTorch Optimizers",
    conceptExplanation: "torch.optim houses PyTorch's optimization algorithms: Adam, SGD, RMSprop, AdamW. Optimizers require MODEL PARAMETERS (retrieved via model.parameters() as trainable tensors) and a learning rate (lr). The canonical PyTorch training step (far more explicit and transparent than Keras fit): (1) optimizer.zero_grad() — flushes gradients accumulated from preceding steps; (2) forward pass: outputs = model(inputs); (3) loss = criterion(outputs, targets); (4) loss.backward() — computes gradients via autograd; (5) optimizer.step() — applies parameter updates based on calculated gradients.",
    hints: [
          "optim.Adam takes model parameters (model.parameters()) and the target learning rate.",
          "Standard training loop: optimizer.zero_grad(), then loss.backward(), followed by optimizer.step().",
          "opt = optim.Adam(parametros, lr=0.001)\nprint('Optim Adam criado.')"
    ],
    successStory: "Optimizer ready.",
  },
  "ds-dl-29": {
    title: "GPU with .cuda()",
    description: "Create t = Tensor(), move it to GPU with t.cuda(), and print the device of the returned tensor.",
    narrative: "Accelerate tensor matrix operations by dispatching computations directly to CUDA hardware cores.",
    concept: "GPU Acceleration in PyTorch",
    conceptExplanation: "GPU acceleration is paramount in modern deep learning — networks that require days on CPUs execute in hours on CUDA cores. Idiomatic PyTorch device handling: device = 'cuda' if torch.cuda.is_available() else 'cpu'. Relocate tensors and models using tensor.to(device) or .cuda(). UNBREAKABLE RULE: all interacting entities MUST reside on the EXACT SAME DEVICE — inputs, targets, weights, and layers — otherwise PyTorch throws device mismatch exceptions. Best practices: allocate tensors directly on device (torch.tensor([1, 2], device='cuda')); configure DataLoader with pin_memory=True for fast host-to-device transfers. For multi-GPU scaling: DistributedDataParallel.",
    hints: [
          "cuda() moves the tensor to GPU memory and returns the allocated tensor reference.",
          "Store the return value of t.cuda() before printing its device attribute.",
          "t = Tensor()\nt_gpu = t.cuda()\nprint(t_gpu.device)"
    ],
    successStory: "Hardware acceleration engaged.",
  },
  "ds-dl-30": {
    title: "Transfer Learning",
    description: "Load base = ResNet50(weights='imagenet') and print the weights used.",
    narrative: "Leverage pretrained weights trained on millions of images rather than training from scratch.",
    concept: "Transfer Learning",
    conceptExplanation: "Transfer Learning is the DEFINITIVE methodology for real-world deep learning: rather than training networks from random initializations (requiring millions of labeled records and immense GPU budgets), you load weights pretrained on massive web-scale corpora (ImageNet for vision, BERT/GPT for language) and FINE-TUNE them for your specific downstream task with modest data. Paradigms: (1) Feature Extraction — freeze all feature extraction backbones and train only the newly attached task head; (2) Fine-Tuning — unfreeze top backbone layers and train with minimal learning rates. In Keras: tf.keras.applications.ResNet50(weights='imagenet'). In PyTorch: torchvision.models. Underpins nearly all enterprise AI applications.",
    hints: [
          "Transfer learning begins by importing pretrained architectural weights.",
          "Pass weights='imagenet' when instantiating ResNet50.",
          "base = ResNet50(weights='imagenet')\nprint(base.weights)"
    ],
    successStory: "Knowledge from millions of images inherited.",
  },
};
