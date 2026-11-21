import type { LocalizedChallengeFields } from './worlds_en';

export const CHALLENGES_EN_DS1A: Record<string, LocalizedChallengeFields> = {
  "ds-pandas-01": {
    introStory: "Operator... the Bunker logs don't lie. The Core is AURORA, the intelligence that governs the city, and she's the one who isolated the sectors. To reach her, we need to understand how she was built. It all started here, at the Refinery, with the citizens' data.",
    "title": "The First DataFrame",
    "description": "Import pandas as pd. Create a DataFrame from the dictionary 'dados' and print it.",
    "narrative": "Welcome to the Refinery. Raw data here is useless—you need to structure it into a DataFrame, the fundamental building block of data science.",
    "concept": "DataFrames",
    "conceptExplanation": "The DataFrame is the central data structure in pandas—think of an Excel spreadsheet or SQL table: rows (records) and columns (attributes), with an automatic numeric index. When built from a dictionary, each key becomes a column name and each list becomes the column data. DataFrames are where 90% of data analysis work happens in Python—the standard input for visualization (matplotlib, seaborn) and ML (sklearn).",
    "hints": [
      "Import the library using the standard alias: 'import pandas as pd'. This 'pd' alias is a universal convention across all pandas documentation.",
      "Pass the dictionary directly to pd.DataFrame(...). Each dictionary key becomes a column name; the values (lists) become the column data.",
      "import pandas as pd\ndf = pd.DataFrame(dados)\nprint(df)"
    ],
    "successStory": "DataFrame initialized. The raw data stream now follows a rigid structure."
  },
  "ds-pandas-02": {
    "title": "Select Column",
    "description": "The DataFrame 'df' has the columns 'IP' and 'Risco'. Print only the 'IP' column.",
    "narrative": "Security needs only the IPs—discard the rest of the payload.",
    "concept": "Column Selection (Series)",
    "conceptExplanation": "Selecting a column from a DataFrame returns a Series—a 1D pandas structure with an index, similar to a NumPy array but with labels. The df['col'] notation always works; df.col is syntactic sugar that only works if the name is a valid Python identifier. A Series has all column-level methods: .mean(), .max(), .unique(), .value_counts(). It forms the backbone of all column operations.",
    "hints": [
      "To access a column, use square brackets with its name in quotes: df['col_name']. The return value is a Series (an isolated column).",
      "Alternatively, you can use attribute notation: df.IP—but this only works if the column name has no spaces or special characters.",
      "print(df['IP'])"
    ],
    "successStory": "IPs extracted. The remaining fields have been purged."
  },
  "ds-pandas-03": {
    "title": "Multiple Columns",
    "description": "Select and print the columns 'IP' and 'Risco' simultaneously.",
    "narrative": "Analysts requested a subset with IPs and risk scores. Other columns are mere noise in this report.",
    "concept": "Multiple Column Selection",
    "conceptExplanation": "When you want more than one column, pass a list of column names—hence the double brackets: df[['a', 'b']]. The outer pair is the indexing operator; the inner pair is the Python list. The return value is a new DataFrame (not a Series), preserving the 2D tabular shape. This is the standard way to create views of a DataFrame with only the relevant columns before analysis or plotting.",
    "hints": [
      "For multiple columns, pass a LIST of names inside brackets—note the double brackets: df[[...]].",
      "Unlike a single column (which returns a Series), selecting multiple columns returns a DataFrame.",
      "print(df[['IP', 'Risco']])"
    ],
    "successStory": "Subset created. Lean operational report."
  },
  "ds-pandas-04": {
    "title": "Anomaly Filtering",
    "description": "Print only the rows where 'Risco' is greater than 8.",
    "narrative": "The firewall intercepted suspicious packets. Isolate only the high-risk threats.",
    "concept": "Boolean Indexing",
    "conceptExplanation": "Any comparison applied to a column (>, <, ==, !=) yields a boolean Series—a sequence of True/False flags, one per row. When passed inside square brackets, the DataFrame returns only rows where the flag is True. This pattern is the heart of pandas data manipulation—used to filter outliers, split groups, and isolate errors. Combine conditions using & and | (each enclosed in parentheses). Standard Python 'and'/'or' will NOT work here.",
    "hints": [
      "Filtering uses square brackets with a CONDITION: df[df['col'] > value]. The condition evaluates to True/False per row; pandas keeps only the True rows.",
      "To combine conditions, use & (and) and | (or) with parentheses: df[(df['a'] > 5) & (df['b'] < 10)]. Do NOT use Python's 'and'/'or' here.",
      "print(df[df['Risco'] > 8])"
    ],
    "successStory": "Anomalies isolated. CyberSec alerted."
  },
  "ds-pandas-05": {
    "title": "Derived Column",
    "description": "Create the column 'Saldo' = Ataques - Defesas and print the DataFrame.",
    "narrative": "Analysts need to evaluate each operative's combat net balance.",
    "concept": "Feature Engineering",
    "conceptExplanation": "Feature engineering means creating new variables from existing ones—often the single step that yields the biggest ML performance boost. In pandas, every arithmetic operation between columns is vectorized: calculations happen in C element by element, without manual loops. Assigning to a new key creates the column; an existing key is overwritten. You can chain operations (df['A'] * df['B'] + 10), apply functions (df['A'].apply(lambda x: x**2)), or use conditionals (np.where).",
    "hints": [
      "Assign to a new key: df['new_column'] = ... Pandas creates the column automatically.",
      "Operations between columns are vectorized: df['A'] - df['B'] returns a Series computed row by row, with no explicit loop.",
      "df['Saldo'] = df['Ataques'] - df['Defesas']\nprint(df)"
    ],
    "successStory": "Metric created. Real-time net balance computed."
  },
  "ds-pandas-06": {
    "title": "GroupBy",
    "description": "Group by Setor, calculate sum and mean of Acessos with agg, and print the sum for sector Core.",
    "narrative": "Find out which CorpHQ sector receives the heaviest volume of suspicious traffic.",
    "concept": "GroupBy (Split-Apply-Combine)",
    "conceptExplanation": "groupby() implements split-apply-combine: split the DataFrame into groups by a key, apply a function to each group, and combine the results into a single table. Equivalent to SQL GROUP BY and central to exploratory analysis—any question asking 'total/mean per category?' relies on groupby. Common aggregations: sum(), mean(), count(), min(), max(), std(). To run multiple aggregations at once, use .agg(['sum', 'mean']). For multiple grouping columns, pass a list: groupby(['Country', 'City']).",
    "hints": [
      "Use df.groupby('Setor')['Acessos'].agg(['sum', 'mean']).",
      "Then access row Core and column sum with .loc.",
      "resumo = df.groupby('Setor')['Acessos'].agg(['sum', 'mean'])\nprint(resumo.loc['Core', 'sum'])"
    ],
    "successStory": "Core sector identified as a critical vulnerability hotspot."
  },
  "ds-pandas-07": {
    "title": "Inspection with .head()",
    "description": "DataFrame 'df' has 100 rows. Print only the first 5 rows using .head().",
    "narrative": "Before processing a massive dataset, always inspect its first few rows to understand its structure.",
    "concept": "Initial Inspection",
    "conceptExplanation": "Data analysis always begins with inspection: head() (first rows) and tail() (last rows) reveal structure without flooding the console. On massive datasets (millions of rows), never print the entire DataFrame—head() is your first reflex. Pair it with df.shape (dimensions), df.columns (names), df.dtypes (types), and df.info() (comprehensive summary) to grasp the data layout.",
    "hints": [
      "df.head() returns the first N rows. Without arguments, it defaults to 5. The equivalent for the end is df.tail().",
      "For a specific count: df.head(10) returns 10 rows.",
      "print(df.head())"
    ],
    "successStory": "Initial inspection complete. Data schema mapped."
  },
  "ds-pandas-08": {
    "title": "Statistical Summary",
    "description": "Use .describe() to print summary statistics for the DataFrame.",
    "narrative": "Before conducting any analysis, standard procedure dictates examining the mean, standard deviation, and quartiles of numerical columns.",
    "concept": "Descriptive Statistics (describe)",
    "conceptExplanation": "describe() is the fastest way to get a numerical overview of a DataFrame: it returns count (non-nulls), mean, std (standard deviation), min, max, and quartiles (25%, 50% median, 75%) for each numerical column. On unfamiliar datasets, it is one of the very first commands to run—exposing scale, spread, and potential outliers. For categorical columns, use describe(include=['object']) to view count, unique, top, and freq.",
    "hints": [
      "df.describe() is a method that takes no required arguments. It returns mean, std, min, max, and quartiles for numeric columns.",
      "To include text columns as well, use df.describe(include='all').",
      "print(df.describe())"
    ],
    "successStory": "Statistical landscape mapped."
  },
  "ds-pandas-09": {
    "title": "DataFrame Shape",
    "description": "Print the shape (rows, columns) of DataFrame 'df'.",
    "narrative": "Knowing dataset dimensions is the critical first step before committing memory buffers.",
    "concept": "DataFrame Attributes",
    "conceptExplanation": "DataFrame attributes (without parentheses) expose metadata with zero compute overhead: .shape (tuple of rows, columns), .columns (Index of names), .index (Index of row labels), .dtypes (type per column), .size (total cell count). Unlike methods (with parentheses, executing computations), attributes are pre-computed instant properties. df.shape[0] gives solely the row count.",
    "hints": [
      "df.shape is an ATTRIBUTE (no parentheses) returning a tuple (rows, columns).",
      "Other handy attributes: df.columns (names), df.dtypes (types), df.size (total cell count).",
      "print(df.shape)"
    ],
    "successStory": "Dataset dimensions verified."
  },
  "ds-pandas-10": {
    "title": "Rename Columns",
    "description": "Rename column 'IP' to 'Endereco' and print the resulting DataFrame.",
    "narrative": "The legacy log system used inconsistent naming. Standardize the column schema.",
    "concept": "Column Renaming",
    "conceptExplanation": "rename() enables renaming columns (parameter columns) or rows (index) by supplying a mapping dictionary. By default it returns a new DataFrame—you must reassign (df = df.rename(...)) or pass inplace=True. To rename ALL columns at once, assign a list directly to df.columns: df.columns = ['a', 'b', 'c']. Schema standardization is a mandatory phase when harmonizing diverse data streams.",
    "hints": [
      "df.rename(columns={...}) accepts a dictionary mapping old_name->new_name. By default, it returns a NEW DataFrame without modifying the original.",
      "df = df.rename(columns={'IP': 'Endereco'})—reassign to persist changes, or pass inplace=True.",
      "df = df.rename(columns={'IP': 'Endereco'})\nprint(df)"
    ],
    "successStory": "Schema standardized."
  },
  "ds-pandas-11": {
    "title": "Sorting",
    "description": "Sort by Risco in descending order, save to ranking, and print the most hazardous IP.",
    "narrative": "The mission dashboard must surface high-threat IPs at the top.",
    "concept": "Sorting (sort_values)",
    "conceptExplanation": "sort_values() sorts the DataFrame by the values of one or more columns. It defaults to ascending order; pass ascending=False for descending. For multiple columns (with varying directions per column), pass lists: sort_values(['a', 'b'], ascending=[True, False]). To sort by INDEX instead of values, use sort_index(). Combining sort with .head() is the universal pattern for top-N queries: df.sort_values('sales', ascending=False).head(10).",
    "hints": [
      "sort_values('Risco', ascending=False) puts the highest risk entries first.",
      "Use .iloc[0] to grab the top row after sorting.",
      "ranking = df.sort_values('Risco', ascending=False)\nprint(ranking.iloc[0]['IP'])"
    ],
    "successStory": "Top threats cataloged."
  },
  "ds-pandas-12": {
    "title": "Detect Missing Values",
    "description": "Use df.isna().sum() to count nulls in each column and print the result.",
    "narrative": "Dirty data riddled with missing fields is an analyst's nightmare. Locate every gap.",
    "concept": "Missing Value Detection",
    "conceptExplanation": "Missing values (NaN, None, NaT) are ubiquitous in raw real-world data. df.isna() returns a boolean DataFrame flagging null locations. Paired with .sum(), it tallies nulls per column; .sum().sum() produces the overall total. For percentage rates: df.isna().mean() * 100. Feeding unhandled nulls into ML models almost always triggers crashes—detect first, then choose: impute (fillna), drop (dropna), or treat as a distinct category.",
    "hints": [
      "df.isna() returns a boolean DataFrame (True where values are NaN/None). Note that 'isnull' is an identical alias.",
      "Sum the booleans per column using .sum()—True counts as 1, False as 0. Result: count of nulls per column.",
      "print(df.isna().sum())"
    ],
    "successStory": "Gaps in the dataset mapped."
  },
  "ds-pandas-13": {
    "title": "Fill Missing Values",
    "description": "Use fillna(0) to replace all NaN with zero and print the DataFrame.",
    "narrative": "Before feeding the ML pipeline, neutral values must patch the voids.",
    "concept": "Imputation (fillna)",
    "conceptExplanation": "fillna(value) replaces NaN with a specified value. Common strategies include: filling with 0 (when NaN signifies absence); filling with the column mean/median (df['col'].fillna(df['col'].mean()))—ideal for unbiased numerical features; filling with mode (most frequent) for categoricals; or using 'unknown' as an explicit category. You can also use method='ffill' (forward-fill last valid value) or 'bfill' (backward-fill next valid value)—especially valuable in time series.",
    "hints": [
      "df.fillna(val) replaces every NaN with 'val'. Returns a new DataFrame; reassign or pass inplace=True.",
      "You can provide distinct strategies per column: df.fillna({'A': 0, 'B': df['B'].mean()}).",
      "print(df.fillna(0))"
    ],
    "successStory": "Gaps patched. Dataset ready for model ingestion."
  },
  "ds-pandas-14": {
    "title": "Drop Missing Values",
    "description": "Use dropna() to eliminate rows containing any NaN and print the result.",
    "narrative": "In mission-critical telemetry, purging corrupted rows is safer than guessing missing values.",
    "concept": "Row/Column Removal (dropna)",
    "conceptExplanation": "dropna() removes rows or columns containing nulls. By default, it drops any row with at least one NaN (how='any'). Use how='all' to drop only rows where all values are null. For columns, set axis=1. To require a minimum non-null threshold, set thresh=N. To restrict inspection to specific columns, pass subset=['a', 'b']. Caution: dropna can decimate a sparse dataset—always inspect df.shape before and after.",
    "hints": [
      "df.dropna() removes ALL rows having at least one NaN. Returns a new DataFrame (reassign or use inplace=True).",
      "To drop only when an ENTIRE row is NaN, use how='all'. To drop columns instead of rows, pass axis=1.",
      "print(df.dropna())"
    ],
    "successStory": "Corrupted records eradicated."
  },
  "ds-pandas-15": {
    "title": "Drop Duplicates",
    "description": "Use drop_duplicates() to eliminate duplicate rows and print the result.",
    "narrative": "Redundant audit logs distort operational metrics. Cleanse before aggregating.",
    "concept": "Deduplication",
    "conceptExplanation": "drop_duplicates() removes duplicate rows, keeping the first occurrence by default. Useful parameters: subset=['col1', 'col2'] evaluates duplicates considering only specified columns; keep='last' preserves the final occurrence; keep=False drops ALL duplicate occurrences (including the first). To identify duplicates without dropping, run df.duplicated() (returns a boolean Series). Deduplication is essential across ETL pipelines where rogue joins or replays inject duplicates.",
    "hints": [
      "df.drop_duplicates() keeps the first occurrence of each duplicate row. Returns a new DataFrame.",
      "To check duplicates on specific columns only: drop_duplicates(subset=['col']). To keep the last occurrence: keep='last'.",
      "print(df.drop_duplicates())"
    ],
    "successStory": "Redundancies purged. Telemetry metrics verified."
  },
  "ds-pandas-16": {
    "title": "Convert Types",
    "description": "The 'Valor' column is stored as string. Convert it to int using astype and print the resulting dtype.",
    "narrative": "Mismatched data types stall numeric computations. Force the type cast.",
    "concept": "Type Casting (astype)",
    "conceptExplanation": "astype() converts a Series data type. Common targets: 'int', 'float', 'str', 'bool', 'category', 'datetime64[ns]'. Pandas infers types when ingesting data (CSV, JSON) but frequently defaults to object/string if unexpected characters appear. For robust string-to-number parsing with error handling, use pd.to_numeric(col, errors='coerce')—invalid tokens become NaN instead of crashing. For dates: pd.to_datetime(col).",
    "hints": [
      "Series.astype(type) converts the data type: int, float, str, 'category'. Reassign: df['Valor'] = df['Valor'].astype(int).",
      "To print the resulting type: print(df['Valor'].dtype)—note: dtype (singular attribute), not dtypes.",
      "df['Valor'] = df['Valor'].astype(int)\nprint(df['Valor'].dtype)"
    ],
    "successStory": "Types corrected. Numeric pipeline unblocked."
  },
  "ds-pandas-17": {
    "title": "Apply on Column",
    "description": "Use apply with lambda to create the column Dobro = Valor*2 and print the sum of column Dobro.",
    "narrative": "Telemetry records require custom transformation logic—apply is the Swiss Army knife.",
    "concept": "Apply",
    "conceptExplanation": "apply() applies an arbitrary function to every element of a Series (or row/column of a DataFrame). It is the premier transformation tool when built-in vectorized operations cannot express complex conditional branches, string mutations, or regex logic. Syntax: series.apply(func). You can pass named functions or anonymous lambdas. On DataFrames, df.apply(func, axis=0) runs column-wise; axis=1 runs row-wise (passing each row as a Series). While flexible, it is slower than NumPy ufuncs—prefer native vectorization whenever available.",
    "hints": [
      "Create a new column rather than just printing the transformed Series.",
      "Then compute df['Dobro'].sum().",
      "df['Dobro'] = df['Valor'].apply(lambda x: x * 2)\nprint(df['Dobro'].sum())"
    ],
    "successStory": "Custom transformation successfully deployed."
  },
  "ds-pandas-18": {
    "title": "Value Counts",
    "description": "Use value_counts(normalize=True) on the Status column, save to proporcoes, and print round(proporcoes['OK'], 2).",
    "narrative": "How many packets were dropped versus allowed? value_counts provides the fastest diagnosis.",
    "concept": "value_counts",
    "conceptExplanation": "value_counts() is the workhorse method in exploratory data analysis—in one call, it yields the frequency distribution of a categorical column: unique values sorted from most to least frequent. It equals groupby + count, but executed directly. Useful parameters: normalize=True (computes relative proportions instead of raw counts); dropna=False (includes NaNs in distribution); ascending=True (reverses ordering). For multi-column frequency grids, use pd.crosstab() or groupby.size().",
    "hints": [
      "value_counts(normalize=True) returns relative proportions.",
      "The proportion for OK is located at proporcoes['OK'].",
      "proporcoes = df['Status'].value_counts(normalize=True)\nprint(round(proporcoes['OK'], 2))"
    ],
    "successStory": "Status distribution breakdown verified."
  },
  "ds-pandas-19": {
    "title": "Access with .loc",
    "description": "Use df.loc[0] to print the first row (label 0).",
    "narrative": "To retrieve a row by its index LABEL, .loc is the canonical selector.",
    "concept": "Label-based Indexing (.loc)",
    "conceptExplanation": ".loc is pandas' label-based selector: you query index LABELS and column names, rather than zero-based positions. Syntax: df.loc[rows, columns]. It accepts a single label (df.loc[0]), a list of labels (df.loc[[0, 2]]), a slice (df.loc[0:5]—INCLUSIVE of both start and end, unlike standard Python slicing!), or a boolean mask (df.loc[df['a'] > 5]). Pairing row slices with column names: df.loc[0:5, ['a', 'b']]. It is the preferred construct for clear, explicit dataframe slicing.",
    "hints": [
      ".loc relies on LABELS—pass the index label or column name. For the first row (label 0): df.loc[0].",
      "Advanced syntax: df.loc[row, col]. Example: df.loc[0, 'IP'] gets a specific cell. df.loc[:, 'IP'] extracts the entire column.",
      "print(df.loc[0])"
    ],
    "successStory": "Precise label-based retrieval confirmed."
  },
  "ds-pandas-20": {
    "title": "Access with .iloc",
    "description": "Use df.iloc[1] to print the SECOND row (position 1).",
    "narrative": "When the index is non-numeric or you need absolute positional indexing, deploy iloc.",
    "concept": "Positional Indexing (.iloc)",
    "conceptExplanation": ".iloc is pandas' integer-position selector: you use zero-based integer POSITIONS, completely ignoring label names. Invaluable when indices are timestamps, UUIDs, or strings, or whenever you need the literal first/last row. Syntax mirrors .loc but strictly takes integers: df.iloc[0] (first row), df.iloc[-1] (last row), df.iloc[0:5] (first 5 rows, EXCLUSIVE of 5—matching standard Python slicing!), df.iloc[:, 0] (first column). Use .iloc when position matters; use .loc when labels matter.",
    "hints": [
      ".iloc operates on integer POSITIONS, always starting at index 0—regardless of index labels.",
      "Syntax: df.iloc[row, column]. iloc slicing is EXCLUSIVE of the endpoint (standard Python): df.iloc[0:5] grabs positions 0 through 4.",
      "print(df.iloc[1])"
    ],
    "successStory": "Row 2 (position 1) intercepted."
  },
  "ds-pandas-21": {
    "title": "Concatenate DataFrames",
    "description": "Concatenate df1 and df2 with ignore_index=True, save to logs, and print logs.shape[0].",
    "narrative": "Audit streams arrived from dual edge servers. Stack both feeds into a single unified dataset.",
    "concept": "Concatenation",
    "conceptExplanation": "pd.concat([df1, df2, ...]) stacks DataFrames together. It defaults to axis=0 (vertical stacking, appending rows)—requiring matching column names (unmatched columns produce NaNs if sort=False). axis=1 concatenates horizontally (side by side), aligning rows by index. ignore_index=True regenerates a clean 0..N index (vital when original indices collide). For mismatched schemas, join='inner' preserves only overlapping columns. Do not confuse with merge()—concat stacks tables; merge executes relational JOINs.",
    "hints": [
      "ignore_index=True resets the index to 0..N after stacking.",
      "shape[0] returns the total row count.",
      "logs = pd.concat([df1, df2], ignore_index=True)\nprint(logs.shape[0])"
    ],
    "successStory": "Logs unified into a single coherent stream."
  },
  "ds-pandas-22": {
    "title": "Merge (JOIN)",
    "description": "Merge usuarios and compras on id, save to relatorio, and print the sum of column valor.",
    "narrative": "Cross-reference operative user profiles with transactional purchase logs—a classic relational JOIN.",
    "concept": "Merge (Relational JOIN)",
    "conceptExplanation": "pd.merge() implements SQL-style JOINs: combines rows from two DataFrames based on a shared key. Parameter how governs join strategy: 'inner' (default, matches found in both), 'left' (all keys from left), 'right' (all keys from right), 'outer' (full outer union, NaN for unmatched records). Parameter 'on' specifies the join key; left_on/right_on handle differing column names. Concat glues matrices; merge performs relational relational alignment. It is the cornerstone for consolidating transaction databases, user registries, and event logs.",
    "hints": [
      "pd.merge(usuarios, compras, on='id') cross-references user accounts and purchases.",
      "Then sum relatorio['valor'].",
      "relatorio = pd.merge(usuarios, compras, on='id')\nprint(relatorio['valor'].sum())"
    ],
    "successStory": "Relational records joined. Consolidated report generated."
  },
  "ds-pandas-23": {
    "title": "Pivot Table",
    "description": "Create a pivot_table by Cidade/Categoria, save to matriz, and print matriz.loc['RJ', 'B'].",
    "narrative": "Reshape longitudinal transactional feeds into an analytical matrix for command dashboards.",
    "concept": "Pivot Tables",
    "conceptExplanation": "pivot_table() mirrors Excel dynamic pivot tables: transforms long-form data (one row per observation) into wide-form analytical matrices with aggregations. Key parameters: index (row dimension), columns (column dimension), values (numeric field to aggregate), aggfunc ('sum', 'mean', 'count', 'max', or custom callable). fill_value fills empty intersections. Indispensable for multi-dimensional business intelligence and heatmaps. A simplified variant without aggregation is df.pivot(); the inverse unpivot (wide -> long) is df.melt().",
    "hints": [
      "Use index='Cidade', columns='Categoria', values='Vendas', aggfunc='sum'.",
      "Then retrieve the cell with matriz.loc['RJ', 'B'].",
      "matriz = df.pivot_table(index='Cidade', columns='Categoria', values='Vendas', aggfunc='sum')\nprint(matriz.loc['RJ', 'B'])"
    ],
    "successStory": "Analytical matrix generated. Executive dashboard synchronized."
  },
  "ds-numpy-01": {
    "title": "NumPy Array",
    "description": "Import numpy as np. Create an array from [1,2,3,4,5], multiply by 10, and print.",
    "narrative": "For high-performance matrix math, standard Python lists are too slow. Fire up the NumPy vector core.",
    "concept": "NumPy Arrays",
    "conceptExplanation": "NumPy is the bedrock of Python's scientific ecosystem—pandas, scikit-learn, and TensorFlow all run on top of it. Its core structure is the ndarray: contiguous memory blocks of homogeneous numbers, unlocking VECTORIZED C-level operations 10-100x faster than pure Python loops. arr * 10 broadcasts multiplication to every element without an explicit loop. Vectorization extends to addition, comparisons, np.sqrt, np.log, and beyond. Standard Python lists cannot do this—list * 10 simply replicates elements.",
    "hints": [
      "Import using the standard alias: 'import numpy as np'. This is the universal scientific computing standard.",
      "np.array(lst) converts the list. Unlike Python lists (where list * 10 duplicates items), NumPy arrays perform element-wise arithmetic.",
      "arr = np.array(lista)\nprint(arr * 10)"
    ],
    "successStory": "Vector acceleration engaged."
  },
  "ds-numpy-02": {
    "title": "NumPy Statistics",
    "description": "Given the array 'temp' = np.array([22,28,35,19,41]), print its mean and standard deviation (one per line).",
    "narrative": "Thermal telemetry nodes sent readings. Compute mean and deviation to detect overheating anomalies.",
    "concept": "Statistics with NumPy",
    "conceptExplanation": "NumPy provides optimized, loopless statistics across entire arrays: np.mean (average), np.median (middle value when sorted), np.std (standard deviation—dispersion around the mean), np.var (variance), np.min/np.max, and np.percentile (quantiles). Low std implies tight clustering around the mean; high std indicates high dispersion. For 2D matrices, parameter axis specifies direction: axis=0 computes column-wise; axis=1 row-wise. These form the primary statistical baseline for any dataset.",
    "hints": [
      "np.mean(arr) calculates the mean; np.std(arr) calculates the standard deviation. Both return a scalar.",
      "Print on separate lines using two distinct print() calls.",
      "print(np.mean(temp))\nprint(np.std(temp))"
    ],
    "successStory": "Variance within operational security thresholds."
  },
  "ds-numpy-03": {
    "title": "Special Arrays",
    "description": "Create an array of zeros with shape (3,) using np.zeros and print it.",
    "narrative": "To initialize memory buffers or model weights, start with a zero-filled tensor.",
    "concept": "Array Initialization",
    "conceptExplanation": "NumPy provides rapid tensor creators: np.zeros(shape) fills with 0; np.ones(shape) with 1; np.full(shape, val) with an arbitrary constant; np.empty(shape) allocates uninitialized memory (fastest, but contains garbage values); np.eye(N) yields an N×N identity matrix. Shape can be an integer (1D) or a tuple (multi-D): np.zeros((3, 4)) produces a 3×4 matrix. Control numeric precision via dtype: np.zeros(5, dtype=int). Essential for pre-allocating memory buffers before iterative loops or initializing neural parameters.",
    "hints": [
      "np.zeros(shape) creates an array pre-filled with zeros. shape can be an int (1D) or a tuple (multi-D).",
      "For a 1D 3-element array, pass 3 or (3,). Elements default to float. Related: np.ones, np.full.",
      "print(np.zeros(3))"
    ],
    "successStory": "Zero buffer primed for ingestion."
  },
  "ds-numpy-04": {
    "title": "Sequences with arange",
    "description": "Create an array with numbers 0,1,2,...,9 using np.arange(10) and print it.",
    "narrative": "To generate indexed sequences (timestamps, sequential IDs), arange provides rapid generation.",
    "concept": "Sequences (arange/linspace)",
    "conceptExplanation": "np.arange(start, stop, step) generates arithmetic sequences (exclusive of stop, just like Python's range)—returning a true NumPy ndarray. It also supports floating-point steps: np.arange(0, 1, 0.1). When you need an exact count of evenly spaced points between bounds, use np.linspace(start, stop, num)—INCLUSIVE of stop, ideal for smooth mathematical plots: np.linspace(0, 2*np.pi, 100). These are the standard generators for coordinates, timeline ticks, and batch indices.",
    "hints": [
      "np.arange(N) behaves like range(N) but returns a NumPy array: [0, 1, ..., N-1].",
      "Full syntax: np.arange(start, stop, step)—exclusive of stop. For float intervals, prefer np.linspace.",
      "print(np.arange(10))"
    ],
    "successStory": "Index sequence materialized."
  },
  "ds-numpy-05": {
    "title": "Reshape",
    "description": "Given arr = np.arange(6), reshape it to (2, 3) and print the resulting matrix.",
    "narrative": "To feed a neural network layer, the tensor dimensions must match specifications. Reformat the tensor.",
    "concept": "Reshape and Tensor Shapes",
    "conceptExplanation": "reshape() rearranges an array into a new shape without copying or altering underlying data buffers. Total element count must match between original and target shapes (a 6-element array can reshape to 2×3, 3×2, or 6×1). Use -1 for an auto-calculated dimension: arr.reshape(-1, 4) automatically determines row count to accommodate 4 columns. A ubiquitous transformation before feeding tensors into ML architectures expecting shapes like (batch, features) or (batch, height, width, channels). The inverse flatten() collapses multi-D arrays to 1D.",
    "hints": [
      "arr.reshape(rows, cols) alters geometry without changing values. Total elements must match (2*3=6, matching len).",
      "For automatic dimension inference, pass -1: arr.reshape(2, -1) lets NumPy resolve the missing dimension.",
      "print(arr.reshape(2, 3))"
    ],
    "successStory": "Tensor reformatted for model input."
  },
  "ds-numpy-06": {
    "title": "Boolean Mask",
    "description": "Given arr = np.array([1,5,3,8,2]), print only elements greater than 3.",
    "narrative": "Vectorized filtering in NumPy follows the same predicate logic as pandas.",
    "concept": "Boolean Mask",
    "conceptExplanation": "Boolean masks represent the vectorized standard for filtering NumPy arrays: evaluations (arr > 3, arr == 0, np.isnan(arr)) generate boolean arrays, and indexing the original array with that mask returns only the True elements. To combine multiple boolean criteria, use & and | with parentheses, mirroring pandas syntax. Related functions: np.where(cond, val_true, val_false) selects values conditionally; np.any(arr) checks if any element is True; np.all() checks if all are True. Core pattern for high-performance sub-setting.",
    "hints": [
      "Direct comparison yields a boolean array: arr > 3 evaluates to [False, True, False, True, False].",
      "Index the array with that boolean mask: arr[arr > 3] extracts only entries satisfying the condition.",
      "print(arr[arr > 3])"
    ],
    "successStory": "Outliers filtered via vector predicates."
  },
  "ds-numpy-07": {
    "title": "Random Numbers",
    "description": "After np.random.seed(0), generate 3 uniform random numbers in [0,1) with np.random.rand(3) and print them.",
    "narrative": "To run Monte Carlo simulations, generate synthetic benchmarks, or initialize weights, inject controlled stochastic noise.",
    "concept": "Random Number Generation",
    "conceptExplanation": "np.random provides diverse distributions: rand(shape) uniform [0, 1); randn(shape) standard normal (mean 0, std 1); randint(low, high, size) discrete integers; choice(arr, size) random sampling with/without replacement. CRITICAL for reproducibility: invoke np.random.seed(N) beforehand—fixing the pseudo-random generator state to ensure identical results across runs (mandatory in ML for reproducible experiments). For modern object-oriented generation: rng = np.random.default_rng(seed).",
    "hints": [
      "np.random.rand(N) generates N uniform random floats in [0, 1). For Gaussian/normal distributions: np.random.randn(N).",
      "After np.random.seed(0), the pseudo-random sequence is fully deterministic—yielding identical values on every run.",
      "print(np.random.rand(3))"
    ],
    "successStory": "Controlled entropy generated."
  },
  "ds-viz-01": {
    introStory: "This is the room AURORA watches the city from. Dashboards, charts, heatmaps. If we learn to read what she reads, we'll see the city through her eyes.",
    "title": "First Plot",
    "description": "Import matplotlib.pyplot as plt. Plot [1,2,3] and display it with plt.show().",
    "narrative": "Activate the graphical telemetry renderer for the defense grid.",
    "concept": "Matplotlib and Pyplot",
    "conceptExplanation": "Matplotlib is Python's standard plotting framework—higher-level libraries (seaborn, pandas .plot) are built directly on it. The pyplot module (imported as plt) implements a MATLAB-like interface: sequential function calls (plot, title, xlabel) modify a background 'active figure', rendered when plt.show() is called. plot() draws line charts connecting points; other charts include bar, scatter, hist, pie, and boxplot. In Jupyter notebooks with %matplotlib inline, show() is often implicit, but calling it explicitly remains best practice.",
    "hints": [
      "The alias 'plt' is the universal standard for matplotlib.pyplot.",
      "plt.plot(data) constructs the line chart; plt.show() renders the output canvas.",
      "plt.plot([1, 2, 3])\nplt.show()"
    ],
    "successStory": "Graphical display online."
  },
  "ds-viz-02": {
    "title": "Title and Labels",
    "description": "Set title 'Ataques por Hora', xlabel 'Hora', ylabel 'Quantidade' and display.",
    "narrative": "Unlabeled telemetry is pure noise. Annotate the axes to provide situational awareness.",
    "concept": "Plot Annotation",
    "conceptExplanation": "A chart lacking axis labels is meaningless noise. Always furnish title (what is being observed), xlabel (horizontal axis with measurement units), and ylabel (vertical axis). Companion functions: plt.legend() (identifies data series), plt.grid() (background reference lines), plt.figure(figsize=(w, h)) (sets canvas dimensions), plt.savefig('file.png') (exports to image). Clear labelling drastically reduces cognitive overhead for operators.",
    "hints": [
      "Each function takes a string: plt.title (title), plt.xlabel (X axis), plt.ylabel (Y axis).",
      "Call order between title/xlabel/ylabel does not matter; just ensure plt.show() is the FINAL call.",
      "plt.title('Ataques por Hora')\nplt.xlabel('Hora')\nplt.ylabel('Quantidade')\nplt.show()"
    ],
    "successStory": "Report rendered with operational clarity."
  },
  "ds-viz-03": {
    "title": "Bar Chart",
    "description": "Plot bars with categorias=['Core','Edge','DMZ'] and valores=[12,7,4]. Display the chart.",
    "narrative": "Compare intrusion attack vectors across defense sectors.",
    "concept": "Bar Chart",
    "conceptExplanation": "Bar charts are the premier visual tool for comparing quantities across DISCRETE categories (sectors, server racks, classifications). plt.bar(x, height) draws vertical bars; plt.barh(y, width) draws horizontal bars (better suited for long category names). For grouped bars, call bar() multiple times with an offset on x. For stacked bars, pass the 'bottom' parameter. Customize via color='red', edgecolor='black', or plt.xticks(rotation=45) to prevent overlapping labels.",
    "hints": [
      "plt.bar(x_axis, heights). x can contain strings or numbers—matplotlib handles both.",
      "Both lists must share identical lengths.",
      "plt.bar(categorias, valores)\nplt.show()"
    ],
    "successStory": "Sector distribution visualized."
  },
  "ds-viz-04": {
    "title": "Scatter Plot",
    "description": "Plot points with x=[1,2,3,4], y=[10,15,13,20] using scatter. Display the chart.",
    "narrative": "Each coordinate represents an intercepted operator. Scatter reveals clustering and anomalies.",
    "concept": "Scatter Plot",
    "conceptExplanation": "Scatter plots map relationships between two numerical variables: positive correlation (y increases with x), negative correlation (y decreases), or absence of correlation. In data science, they are paramount for detecting isolated outliers and spotting dense clusters. Expressive parameters: c=colors (encodes a 3rd dimension via color map), s=sizes (encodes a 4th dimension via point radius), alpha=0.5 (transparency, vital when handling overlapping scatter points).",
    "hints": [
      "plt.scatter(x, y) plots one point per (x[i], y[i]) coordinate pair. Unlike plot(), it does NOT connect points with lines.",
      "It is the standard diagnostic tool for examining correlation between dual numeric features.",
      "plt.scatter(x, y)\nplt.show()"
    ],
    "successStory": "Scatter anomalies isolated."
  },
  "ds-viz-05": {
    "title": "Histogram",
    "description": "Plot the histogram of dados=[1,2,2,3,3,3,4,4,5] and display it.",
    "narrative": "Observe how frequency distributions bucket across numerical bins.",
    "concept": "Histogram",
    "conceptExplanation": "A histogram displays the DISTRIBUTION of a continuous variable—partitioning the range into discrete intervals (bins) and tallying how many observations fall into each. It uncovers data shape: Gaussian (bell curve), skewed, bimodal, or uniform. Key parameters: bins=N (number of bins—too many causes noise, too few conceals patterns), density=True (normalizes to probability density), alpha=0.5 (transparency for overlapping comparative distributions).",
    "hints": [
      "plt.hist(data) groups values into 'bins' and plots frequency counts per bucket.",
      "Parameter bins configures bucket granularity: plt.hist(dados, bins=20). Default is 10.",
      "plt.hist(dados)\nplt.show()"
    ],
    "successStory": "Frequency distribution mapped."
  },
  "ds-viz-06": {
    "title": "Pie Chart",
    "description": "Plot a pie chart with valores=[30,20,50] and display it.",
    "narrative": "Render proportional shares across incoming packet traffic origins.",
    "concept": "Pie Chart",
    "conceptExplanation": "Pie charts illustrate proportional parts of a whole (each wedge represents a fraction). plt.pie(values)—values do not need to sum to 100, as matplotlib automatically normalizes. Useful parameters: labels=[...] (wedge titles), autopct='%.1f%%' (formats percentage values onto wedges), colors, explode=[0, 0.1, 0] (offsets a specific slice). NOTE: Pie charts are often discouraged in data science because human perception struggles with angular area comparison—bar charts are typically clearer. Reserve pie charts for 3-5 categories where proportional share is the sole message.",
    "hints": [
      "plt.pie(values) draws proportional wedges that together comprise the complete circle.",
      "Useful arguments: labels=[...] (wedge labels), autopct='%.1f%%' (displays percentage numbers).",
      "plt.pie(valores)\nplt.show()"
    ],
    "successStory": "Proportions rendered."
  },
  "ds-viz-07": {
    "title": "Boxplot",
    "description": "Plot the boxplot of dados=[1,2,3,4,5,100] and display it. (Visually detects outliers.)",
    "narrative": "Inspect quartiles and flag extreme anomalies in a single condensed figure.",
    "concept": "Boxplot",
    "conceptExplanation": "A boxplot (Tukey box-and-whisker plot) provides the most compact summary of a continuous distribution: the box spans the 1st and 3rd quartiles (middle 50% of data, IQR); the center line marks the median; the whiskers extend up to 1.5× the interquartile range; data points beyond the whiskers are plotted as individual outliers. It is the premier visualization for comparing multi-group distributions side by side: plt.boxplot([group1, group2, group3]). Superior to histograms for spot-checking outliers and group variance.",
    "hints": [
      "plt.boxplot(data) renders the central 'box' representing the 25%-75% quartiles with the median line inside.",
      "Points extending past the whiskers (typically 1.5*IQR) are rendered as isolated outlier dots.",
      "plt.boxplot(dados)\nplt.show()"
    ],
    "successStory": "Quartiles and telemetry anomalies highlighted."
  },
  "ds-viz-08": {
    "title": "Multiple Lines",
    "description": "Plot two series on the same chart: serie1=[1,3,2,4] and serie2=[2,1,3,5]. Display the chart.",
    "narrative": "Overlay two telemetry trajectories on a single canvas for comparative analysis.",
    "concept": "Multiple Data Series",
    "conceptExplanation": "To overlay multiple curves onto a single graph, simply call plt.plot() consecutively before invoking plt.show()—each call appends a curve to the active axes. Colors cycle automatically through the default palette (blue, orange, green...). Differentiate curves by adding a legend with plt.legend(['Series 1', 'Series 2']) or specifying label='name' inside each plot() followed by plt.legend(). Standard workflow for comparative diagnostics: predicted vs actual, pre- vs post-intervention, test vs control.",
    "hints": [
      "Every plt.plot() call adds a new series to the active canvas—do not call show() until all lines are drawn.",
      "Execute plt.plot(serie1), then plt.plot(serie2), and conclude with plt.show().",
      "plt.plot(serie1)\nplt.plot(serie2)\nplt.show()"
    ],
    "successStory": "Trajectories overlaid for comparative analysis."
  },
  "ds-viz-09": {
    "title": "Line Color",
    "description": "Plot [1,2,3] in red using parameter color='red'. Display it.",
    "narrative": "Apply visual styling to highlight breach alert vectors.",
    "concept": "Plot Styling with Color",
    "conceptExplanation": "Color parameters in matplotlib accept named colors ('red', 'blue', 'navy'), single-letter codes ('r', 'b', 'g'), hex strings ('#FF5733'), RGB tuples ((0.2, 0.5, 0.8)), or colormap palettes (cmap in scatter/heatmap). Established conventions: red = anomaly/critical alert, green = nominal/success, blue = baseline/neutral. Maintain color consistency across reporting dashboards so operators instantly register status semantics.",
    "hints": [
      "Pass color='color_name' into plt.plot(). Accepted names include 'red', 'blue', 'green', 'black', etc.",
      "Hex codes are also supported: color='#FF5733', as well as normalized RGB tuples.",
      "plt.plot([1, 2, 3], color='red')\nplt.show()"
    ],
    "successStory": "Visual accent applied."
  },
  "ds-viz-10": {
    "title": "Dashed Line",
    "description": "Plot [1,2,3] with linestyle='--' (dashed). Display it.",
    "narrative": "Dashed lines demarcate baseline forecasts and security thresholds distinct from observed data.",
    "concept": "Line Styles",
    "conceptExplanation": "linestyle dictates line rendering patterns: '-' (solid), '--' (dashed), ':' (dotted), '-.' (dash-dot). Combine with color and markers to distinguish concurrent series: plt.plot(x, y, '--r') renders a red dashed line. Standard DS conventions: dashed = projection/baseline/target, dotted = threshold boundary, solid = empirical telemetry. When designing accessible visualizations for colorblind users, alternating line styles alongside color guarantees readability.",
    "hints": [
      "Pass linestyle='--' for dashed line rendering. Alternatives: '-' (solid, default), ':' (dotted), '-.' (dash-dot).",
      "Shorthand syntax: pass formatting as a positional string: plt.plot(dados, '--').",
      "plt.plot([1, 2, 3], linestyle='--')\nplt.show()"
    ],
    "successStory": "Custom line style applied."
  },
  "ds-viz-11": {
    "title": "Markers",
    "description": "Plot [1,2,3] with marker='o' (circular markers on points). Display it.",
    "narrative": "Highlight empirical sample points, particularly when telemetry points are sparse.",
    "concept": "Data Markers",
    "conceptExplanation": "Markers pinpoint discrete coordinate vertices along a plotted line. Common options: 'o' (circle), 's' (square), '^' (upward triangle), 'v' (downward triangle), '*' (star), 'D' (diamond), 'x' (cross), '+' (plus). Combine with color and linestyle: plt.plot(x, y, 'o-r') yields solid red lines with circular vertices. Indispensable for sparse sample runs where line interpolation could otherwise mask exact observation timestamps.",
    "hints": [
      "marker='o' embeds circle markers at each point coordinate. Alternatives: 's' (square), '^' (triangle), '*' (star), 'x' (x).",
      "Scale size with markersize=10. Without markers (default), only the connecting line is drawn.",
      "plt.plot([1, 2, 3], marker='o')\nplt.show()"
    ],
    "successStory": "Observation points accentuated."
  },
  "ds-viz-12": {
    "title": "Legend",
    "description": "Plot two series with label='A' and label='B', add plt.legend(), and display.",
    "narrative": "Without a legend key, operators cannot decipher conflicting telemetry traces.",
    "concept": "Legend",
    "conceptExplanation": "Legends clarify series identities across multi-line or multi-category charts. Workflow: pass label='name' inside each plot/bar/scatter call, then invoke plt.legend()—it compiles declared labels and renders the key box. Customization options: loc='upper right' (placement), fontsize, title='Series Key', frameon=False (frameless), ncol=2 (column count). On dense figures, tweak loc to prevent obscuring data points. Calling legend() without defined labels outputs a warning and an empty box.",
    "hints": [
      "Pass label='name' into each plot call. Afterwards, invoke plt.legend()—it reads the labels and renders the legend box.",
      "plt.legend(loc='upper left') anchors placement; 'best' (default) automatically finds an unobtrusive corner.",
      "plt.plot([1,2,3], label='A')\nplt.plot([3,2,1], label='B')\nplt.legend()\nplt.show()"
    ],
    "successStory": "Telemetry series identified."
  },
  "ds-viz-13": {
    "title": "Grid",
    "description": "Plot [1,2,3], add plt.grid(True), and display.",
    "narrative": "Background coordinate grids streamline precise metric readings for field technicians.",
    "concept": "Grid",
    "conceptExplanation": "plt.grid(True) draws horizontal and vertical reference lines aligned with coordinate axis ticks—aiding precise value estimation from visual plots. Parameters: axis='x' or 'y' (single direction), linestyle/color to tailor aesthetic, alpha=0.3 to keep gridlines unobtrusive. Enable grids on charts where exact numeric interpolation matters (time series, sensor readings); omit on high-density displays (heatmaps, massive scatter plots) where lines clutter visual comprehension.",
    "hints": [
      "plt.grid(True) enables reference gridlines. False (default) leaves background clean.",
      "Customize style: plt.grid(True, linestyle='--', alpha=0.5)—for a subtle semi-transparent dashed grid.",
      "plt.plot([1,2,3])\nplt.grid(True)\nplt.show()"
    ],
    "successStory": "Reference grid engaged."
  },
  "ds-viz-14": {
    "title": "Axis Limits",
    "description": "Plot [1,2,3] and force the Y-axis bounds between 0 and 10 with plt.ylim(0, 10). Display it.",
    "narrative": "Anchor axis boundaries to avoid misleading visual distortion.",
    "concept": "Axis Limits (xlim/ylim)",
    "conceptExplanation": "plt.xlim(min, max) and plt.ylim(min, max) enforce fixed coordinate boundaries. By default, matplotlib auto-scales tightly to the data envelope, but fixed limits are crucial: (1) when comparing adjacent charts with different scales to maintain a uniform frame of reference; (2) to prevent misleading visualizations where microscopic fluctuations appear monumental due to auto-zoom; (3) ensuring baseline zero is visible (essential for bar charts, where non-zero baselines distort relative magnitude perception).",
    "hints": [
      "plt.ylim(min, max) locks Y-axis boundaries; plt.xlim(min, max) locks X-axis boundaries.",
      "By default, matplotlib auto-scales to data bounds. Enforcing limits is vital for standardizing comparison across charts.",
      "plt.plot([1,2,3])\nplt.ylim(0, 10)\nplt.show()"
    ],
    "successStory": "Scale fixed to baseline."
  },
  "ds-viz-15": {
    "title": "Tick Rotation",
    "description": "Plot categorias=['Janeiro','Fevereiro','Marco'] as bars and rotate the X-axis ticks by 45 degrees.",
    "narrative": "Long category labels on the horizontal axis overlap into illegibility. Rotate them for operational clarity.",
    "concept": "Tick Customization",
    "conceptExplanation": "Ticks represent the coordinate markings and labels along the axes. plt.xticks() and plt.yticks() offer fine-grained styling: rotation=45 (angles text to prevent crowding), fontsize, or complete label replacement: plt.xticks([0, 1, 2], ['low', 'medium', 'high']). To suppress labels entirely: plt.xticks([]). For date time series, plt.gcf().autofmt_xdate() automatically slants dates for optimal layout. Proper tick curation prevents significant reader friction.",
    "hints": [
      "After plt.bar(), call plt.xticks(rotation=45). You can use -45 to angle in the opposite direction.",
      "To assign custom labels simultaneously: plt.xticks(positions, labels, rotation=45).",
      "plt.bar(categorias, valores)\nplt.xticks(rotation=45)\nplt.show()"
    ],
    "successStory": "Axis labels aligned for readability."
  },
  "ds-viz-16": {
    "title": "Subplots",
    "description": "Create 1 figure with 2 subplots side by side using plt.subplots(1, 2) and print 'Subplots criados.'.",
    "narrative": "Command console requires multiple diagnostic views tiled across a single pane.",
    "concept": "Subplots",
    "conceptExplanation": "To compose multiple charts within a unified figure canvas, use plt.subplots(nrows, ncols)—it returns the parent Figure object and an array of Axes objects. Each Axes exposes dedicated plotting methods (axes[0].plot(...), axes[1].bar(...)). For 2D subplot grids, axes is a 2D array: axes[0, 1]. Use sharex=True/sharey=True to coordinate coordinate scales across subplots. Call plt.tight_layout() to prevent label collision between adjacent panels. The object-oriented Axes API is vastly more robust than stateful pyplot calls for multi-panel dashboards.",
    "hints": [
      "fig, axes = plt.subplots(nrows, ncols) generates ONE figure with a grid of subplots, returning both figure and axes handles.",
      "axes is an array (for multiple panels) or a single Axes instance. Call axes[0].plot(...) to render onto individual subplots.",
      "fig, axes = plt.subplots(1, 2)\nprint('Subplots criados.')"
    ],
    "successStory": "Composite monitoring pane initialized."
  },
  "ds-viz-17": {
    "title": "Figure Size",
    "description": "Create a figure with figsize=(10, 4) using plt.figure and print 'Figura customizada.'.",
    "narrative": "Standardize figure dimensions to fit target mission briefing displays.",
    "concept": "Figure Dimensions",
    "conceptExplanation": "plt.figure(figsize=(w, h)) defines canvas dimensions in inches—directly controlling the output pixel resolution (figsize × dpi). Default is approximately (6.4, 4.8). Common aspect ratios: wide (10, 4) for continuous time series; tall (4, 6) for horizontal bar rankings with numerous categories; square (8, 8) for correlation matrices and confusion heatmaps. In plt.subplots(), figsize is passed as a keyword argument. For PDF/print briefings, target 4:3 or 16:9; for interactive notebooks, choose dimensions that fit screens without scrolling.",
    "hints": [
      "plt.figure(figsize=(width, height))—specified in inches. Default is typically (6.4, 4.8).",
      "Invoke BEFORE executing plotting routines—subsequent plot commands bind to this initialized canvas.",
      "plt.figure(figsize=(10, 4))\nprint('Figura customizada.')"
    ],
    "successStory": "Figure dimensions locked to specification."
  },
  "ds-viz-18": {
    "title": "Save Figure",
    "description": "After plotting, call plt.savefig('grafico.png') to save the file.",
    "narrative": "Export graphic artifacts for insertion into intelligence dossiers and executive briefings.",
    "concept": "Figure Export",
    "conceptExplanation": "plt.savefig('file.ext') exports the active figure canvas to disk. Output format is determined by file extension: .png (raster bitmap, standard for web/screens), .pdf (vector format, ideal for high-res publication), .svg (scalable vector graphics, editable in illustration tools), .jpg. Essential parameters: dpi=300 (high-resolution print quality); bbox_inches='tight' (trims surrounding whitespace margins); transparent=True (transparent background, ideal for slide decks). Always invoke savefig BEFORE plt.show()—in several backends, show() flushes and clears the figure canvas.",
    "hints": [
      "plt.savefig('filename.ext') serializes output matching the chosen file extension: .png, .pdf, .svg, .jpg.",
      "For high fidelity: dpi=300. For transparent backgrounds: transparent=True.",
      "plt.savefig('grafico.png')"
    ],
    "successStory": "Graphic artifact exported to disk."
  },
  "ds-viz-19": {
    "title": "Annotation",
    "description": "Add an annotation 'Pico' at coordinate (2, 10) with plt.annotate.",
    "narrative": "Pinpoint critical telemetry spikes directly on the mission graph.",
    "concept": "Annotations",
    "conceptExplanation": "plt.annotate('text', xy=(x, y)) renders text callouts anchored to specific data coordinates. To draw an arrow pointing directly to the target vertex: supply xytext=(x2, y2) (text label position) alongside arrowprops=dict(arrowstyle='->', color='red'). Use annotations to spotlight anomaly peaks, system outages, structural breaks, or tactical milestones. plt.text(x, y, 'text') offers an arrowless text-only alternative. In time series analysis, annotations inject vital contextual intelligence: 'incident onset', 'patch deployed', 'firewall reboot'.",
    "hints": [
      "plt.annotate('text', xy=(x, y)) anchors text at coordinates. xy represents data coordinates.",
      "To add a pointer arrow: arrowprops=dict(arrowstyle='->'). To offset text from the target vertex: xytext=(x2, y2).",
      "plt.annotate('Pico', xy=(2, 10))"
    ],
    "successStory": "Critical telemetry event annotated."
  },
  "ds-viz-20": {
    "title": "Log Scale",
    "description": "Use plt.yscale('log') to set the Y-axis to a logarithmic scale.",
    "narrative": "Telemetry spanning multiple orders of magnitude requires a logarithmic scale for clear interpretation.",
    "concept": "Logarithmic Scale",
    "conceptExplanation": "plt.yscale('log') (or xscale) converts the axis to logarithmic scaling—each grid increment signifies multiplication by a factor of 10. Crucial when observations span vast magnitudes (1, 10, 100, 1000): on linear axes, low-magnitude variations compress into flat lines; in log scale, full dynamic range is revealed. Common in heavy-tailed distributions (network traffic bursts, population densities, financial balances, algorithm complexity runtimes). CAUTION: log(0) is -infinity, and log of negatives is undefined—filter invalid values first. For symmetric log with negative support, use 'symlog'.",
    "hints": [
      "plt.yscale('log') switches the Y-axis to logarithmic scaling. Equivalent for horizontal: plt.xscale('log').",
      "Vital when data spans several orders of magnitude (1 to 1,000,000)—on linear axes, smaller values flatten out completely.",
      "plt.yscale('log')\nplt.show()"
    ],
    "successStory": "Logarithmic scale exposes full distribution spectrum."
  },
  "ds-viz-21": {
    "title": "Heatmap (Seaborn)",
    "description": "Use sns.heatmap(matriz, annot=True, cmap='coolwarm'), display it, and print cell [0][1].",
    "narrative": "Survey correlation patterns across 50 telemetry variables in a single comprehensive matrix.",
    "concept": "Seaborn Heatmap",
    "conceptExplanation": "Seaborn is a statistical visualization library built on matplotlib—producing publication-grade figures with concise syntax and refined default aesthetics. Heatmap is the definitive tool for 2D matrix inspection: feature correlation (df.corr()), confusion matrices, and gridded tabular intensity. Core arguments: annot=True (overlays numeric values in cells), cmap='coolwarm' (diverging palette: warm red for positive correlation, cool blue for negative), fmt='.2f' (number precision formatting), vmin/vmax (normalizes color boundary range). Standard idiom: sns.heatmap(df.corr(), annot=True, cmap='coolwarm').",
    "hints": [
      "annot=True prints values inside cells; cmap='coolwarm' highlights high and low values.",
      "After displaying the chart, index the matrix as a 2D list: matriz[row][column].",
      "sns.heatmap(matriz, annot=True, cmap='coolwarm')\nplt.show()\nprint(matriz[0][1])"
    ],
    "successStory": "Strong feature correlations identified."
  },
  "ds-viz-22": {
    "title": "Seaborn Countplot",
    "description": "Use sns.countplot(x=valores), display it, and print the sorted unique categories.",
    "narrative": "Tally categorical event occurrences automatically without manual aggregation.",
    "concept": "Seaborn Countplot",
    "conceptExplanation": "countplot is the quickest way to visualize categorical frequency distributions: sns.countplot(x=col) counts frequencies automatically—no need to run value_counts beforehand. For DataFrames: data=df, x='column_name'. Add hue='subgroup_column' to split categories into side-by-side color-coded bars. Equivalent to a bar plot of value_counts(), executed in a single declarative command. Switch to horizontal bars by specifying y= instead of x= when category names are lengthy.",
    "hints": [
      "Use sns.countplot(x=valores) to construct the chart.",
      "set(valores) removes duplicates; sorted(...) arranges the unique categories in order.",
      "categorias = sorted(set(valores))\nprint(categorias)"
    ],
    "successStory": "Categorical distribution plotted."
  },
  "ds-viz-23": {
    "title": "Seaborn Barplot",
    "description": "With sns.barplot, plot x and y. Then identify and print the category with the highest value.",
    "narrative": "Compare aggregated categorical metrics augmented with statistical error bars.",
    "concept": "Seaborn Barplot",
    "conceptExplanation": "sns.barplot diverges from plt.bar: when multiple y measurements exist for the same x category (e.g. repeated trial runs), barplot AGGREGATES automatically—computing the central tendency (mean) and drawing 95% confidence interval error bars. Parameter estimator='mean' (default), 'sum', 'median', or a custom callable. ci=None suppresses error bars. Deploy barplot for rapid statistical inference; use plt.bar when working with pre-aggregated counts.",
    "hints": [
      "max(y) locates the highest numeric value.",
      "y.index(max(y)) returns the index position of that peak; use that index on x.",
      "maior = x[y.index(max(y))]\nprint(maior)"
    ],
    "successStory": "Aggregated means and confidence intervals plotted."
  },
  "ds-viz-24": {
    "title": "Seaborn Histplot",
    "description": "Plot data with sns.histplot using bins=3. Then print the range max(dados)-min(dados).",
    "narrative": "Modern histogram charting with enhanced statistical smoothing compared to basic matplotlib.",
    "concept": "Seaborn Histplot",
    "conceptExplanation": "sns.histplot is Seaborn's modern distribution plot—cleaner and more versatile than plt.hist. Key capabilities: kde=True overlays a smooth continuous Kernel Density Estimation curve, hue='category' stratifies distributions across subgroups with distinct color fills, multiple='stack'/'dodge'/'fill' dictates overlapping bar layout. For pure density curves without bins, use sns.kdeplot. Indispensable for comparing cohort distributions visually.",
    "hints": [
      "Pass bins=3 inside sns.histplot(...).",
      "Range is the difference between maximum and minimum values.",
      "sns.histplot(dados, bins=3)\nplt.show()\nprint(max(dados) - min(dados))"
    ],
    "successStory": "Refined distribution histogram generated."
  },
  "ds-viz-25": {
    "title": "Seaborn Boxplot",
    "description": "Plot the boxplot of dados=[1,2,3,4,5,100] with sns.boxplot. Display it.",
    "narrative": "Seaborn's boxplot serves as the gold standard for contemporary statistical reporting.",
    "concept": "Seaborn Boxplot",
    "conceptExplanation": "sns.boxplot represents Seaborn's boxplot implementation—visually polished compared to plt.boxplot and natively integrated with DataFrames. The box encapsulates the 25th-75th percentiles (middle 50% of the dataset); the central line indicates the median; whiskers span up to 1.5× the IQR; exterior points represent outliers. Assign x= for categories and y= for measurements: sns.boxplot(data=df, x='sector', y='sales') compares sales distributions across sectors. Supply hue= to segment into subcategories. To simultaneously visualize density profiles, consider sns.violinplot.",
    "hints": [
      "sns.boxplot(y=lst) generates a vertical boxplot. Use x= for horizontal orientation.",
      "With a DataFrame: sns.boxplot(data=df, x='category', y='value') generates side-by-side comparative boxplots.",
      "sns.boxplot(y=[1,2,3,4,5,100])\nplt.show()"
    ],
    "successStory": "Quartile metrics and extreme outliers displayed."
  },
  "ds-viz-26": {
    "title": "Seaborn Violinplot",
    "description": "Plot the violin of dados=[1,2,3,4,5] with sns.violinplot. Display it.",
    "narrative": "Violin plots blend boxplot quartiles with full probability density in a single silhouette.",
    "concept": "Seaborn Violinplot",
    "conceptExplanation": "A violin plot merges the boxplot with a mirrored KDE density curve: the violin contour depicts WHERE data points concentrate (width = probability density), while the inner marker outlines quartiles and median. Far more informative than a standard boxplot when dealing with multimodal distributions (multiple peaks) or skewed tails that boxplots obscure. For tiny sample sizes, prefer boxplot or stripplot. Use split=True alongside hue= to compare dual subgroups within the same violin.",
    "hints": [
      "sns.violinplot(y=lst) plots the 'violin'—shape mirrors density distribution; width corresponds to frequency.",
      "Combines boxplot statistics (quartiles at the core) with KDE (density contours along borders).",
      "sns.violinplot(y=[1,2,3,4,5])\nplt.show()"
    ],
    "successStory": "Density profile visualized."
  },
  "ds-viz-27": {
    "title": "Seaborn Lineplot",
    "description": "Use sns.lineplot(x=[1,2,3], y=[1,4,9]) and display it.",
    "narrative": "Modern line plotting equipped with automated confidence intervals and grouping aesthetics.",
    "concept": "Seaborn Lineplot",
    "conceptExplanation": "sns.lineplot is the modern statistical evolution of plt.plot, offering built-in statistical capabilities: automatic aggregation (computes mean and shaded confidence intervals when multiple y values share the same x), native DataFrame support (data=df, x='col', y='col', hue='group' for multi-line segmentation). Perfect for longitudinal telemetry with experimental replicates—automatically plotting the trajectory mean alongside shaded confidence bands. For a single deterministic series, it provides plt.plot functionality wrapped in refined styling.",
    "hints": [
      "sns.lineplot(x=..., y=...)—signature mirrors plt.plot while adding automated statistical features.",
      "When multiple y values exist for a single x coordinate, it calculates the mean and renders a shaded confidence interval.",
      "sns.lineplot(x=[1,2,3], y=[1,4,9])\nplt.show()"
    ],
    "successStory": "Trend trajectory charted."
  },
  "ds-viz-28": {
    "title": "Seaborn Scatterplot",
    "description": "Use sns.scatterplot(x=[1,2,3], y=[4,5,6]) and display it.",
    "narrative": "Seaborn scatter mapping supports multi-dimensional visual feature encoding.",
    "concept": "Seaborn Scatterplot",
    "conceptExplanation": "sns.scatterplot elevates plt.scatter with direct statistical aesthetic mappings: hue='col' (colors points according to a 3rd feature), size='col' (scales point radius to a 4th feature), style='col' (modifies marker glyphs). Ideal for visualizing up to four data dimensions on a flat 2D projection. Natively accepts DataFrames and automatically compiles comprehensive legends for all mapped aesthetics. For exploratory bivariate analysis with categorical stratification, it is the primary chart to deploy.",
    "hints": [
      "sns.scatterplot(x=..., y=...)—Seaborn's scatter implementation. Accepts hue, size, and style to map features to aesthetics.",
      "Using DataFrames: sns.scatterplot(data=df, x='col1', y='col2', hue='category').",
      "sns.scatterplot(x=[1,2,3], y=[4,5,6])\nplt.show()"
    ],
    "successStory": "Points mapped with statistical aesthetics."
  },
  "ds-viz-29": {
    "title": "Pairplot",
    "description": "Use sns.pairplot(df, hue='classe') and print how many columns exist in df.",
    "narrative": "In a single command, render all pairwise feature interactions. The ultimate exploratory diagnostic.",
    "concept": "Pairplot",
    "conceptExplanation": "sns.pairplot(df) stands among the most powerful exploratory tools in data science: it constructs an N×N matrix of subplots evaluating every column pair—off-diagonal cells display bivariate scatter plots, while the diagonal showcases univariate histograms or KDE density curves. In a single execution, you inspect all correlations, distributions, and cluster separations. Supplying hue='category' colors points by target class—revealing class separability for machine learning classifiers. For wide datasets, select a focused subset first (df[['a', 'b', 'c']]).",
    "hints": [
      "hue='classe' stratifies points by class color.",
      "Since df here is a dictionary, len(df) counts the keys/columns.",
      "sns.pairplot(df, hue='classe')\nprint(len(df))"
    ],
    "successStory": "Complete pairwise interaction landscape surveyed."
  },
  "ds-viz-30": {
    "title": "Regression (regplot)",
    "description": "Use sns.regplot with x and y. Calculate the simple slope between the first and last point and print it.",
    "narrative": "Overlay scatter observations AND fitted linear regression trajectories on a single canvas.",
    "concept": "Regplot (Visual Regression)",
    "conceptExplanation": "sns.regplot pairs scatter plot points with a fitted linear regression line—rendering both individual data points and the overarching trend alongside shaded confidence intervals. Invaluable for rapid visual inspection of linear dependency between continuous variables. Advanced parameters: order=N for polynomial curves, lowess=True for non-parametric smoothing (locally weighted scatterplot smoothing), ci=None to hide confidence intervals, robust=True to dampen outlier influence. For multi-group faceted regressions, use sns.lmplot.",
    "hints": [
      "The slope between two points is delta_y / delta_x.",
      "Use list indices: y[-1] - y[0] and x[-1] - x[0].",
      "inclinacao = (y[-1] - y[0]) / (x[-1] - x[0])\nprint(inclinacao)"
    ],
    "successStory": "Linear trend trajectory fitted."
  }
};
