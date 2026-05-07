---
layout: post
title: Data Verification for Machine Learning - A Review of DataFrame Validation Libraries
date: 2021-10-21 07:27:47
tags: data python pandas spark dataqa machine_learning data_quality great_expectations pandera deequ data_validation ml_pipelines data_engineering
categories: pydata
featured: true
description: A comparison of data validation libraries for Pandas and Spark DataFrames
excerpt: A comprehensive review of data validation libraries including Great Expectations, Pandera, and PyDeequ, comparing their features for ensuring data quality in machine learning pipelines.
---

## TL;DR

In this blog post, I review some interesting libraries for checking the quality of the data using Pandas and Spark data frames (and similar implementations). This is not a tutorial (I was actually trying out some of the tools while I wrote) but rather a review of sorts, so expect to find some opinions along the way.

## Intro - Why Data Quality?

Data quality might be one of the areas Data scientists tend to overlook the most. Why? Well, let's face it, It is boring and most of the time it is cumbersome to perform data validation. Furthermore, sometimes you do not know if your effort is going to pay off. Luckily, some libraries can help with this laborious task and standardize the process in a Data Science team or even across an organization.

But first things first. Why I would choose to spend my time doing data quality checks, while I can spend my time writing some amazing code that trains a bleeding-edge deep convolutional logistic regression? Here are a couple of reasons:

- It is hard to ensure data constraints in the source system. Particularly true for legacy systems.

- Companies rely on data to guide business decisions (forecasting, buying decisions), and missing or incorrect data affect those decisions.

- The trend to feed ML systems with this data (these systems are often highly sensitive to input data as the deployed model relies on the assumption on the characteristics of the inputs).

- Subtle errors introduced by changes in the data can be **hard** to detect.

## Data Quality Dimensions

The quality of the data can refer to the **extension** of the data (data values) or to the
**intension** (not a typo) of the data (schema).

### Extension Dimension

Extracted from Schelter et al. (2018):

- **Completeness:** The degree on which an entity includes data
  required to describe a real-world object. Presence of null values (missing values). Depends on context.

**Example**: Notebooks might not have the `shirt_size` property.

- **Consistency:** The degree to which a set of semantic rules are violated.
  - Valid range of values (e.g. sizes `{S, M, L}`)
  - There might be *intra-relation constraint*, e.g. if the category is "shoes" then the sizes should be in the range 30-50.
  - *Inter-relation* constraints may involve multiple tables and columns. `product_id` may only contain entries from the `product` table.

- **Accuracy:** The correctness of the data and can be measured in two ways, semantic and syntactic.
  - **Syntactic:** Compares the representation of a value with a corresponding definition domain.
  - **Semantic:** Compares a value with its real world representation.

**Example**: *blue* is a syntactically valid value for the column *color* (even if a product is of color red). *XL* would neither semantically nor syntactically accurate.

Most of the data quality libraries I am going to explore focus on the **extension dimension**. This is particularly important when the data ingested comes from semi-structured or non-curated sources. On the *intension* of the data is where the richest set of checks can be done (i.e. checking the schema would only verify if a field is of a certain type but not some additional logical like that what are the valid values for a string field).

## Libraries

The following are the libraries I will quickly evaluate. The idea is to display writing quality checks works and describe a bit of the workflow. I selected these libraries as are the ones I have either been using, reading about, or seeing at conferences. If there is a library that you think should make the list, please let me know in the comment section.

- Great Expectations
- Pandera
- Deequ/PyDeequ

### Sample Data

I will use a sample dataset to exemplify how different libraries will check similar properties:

```python
import pandas as pd
df = pd.DataFrame(
       [
           (1, "Thingy A", "awesome thing.", "high", 0),
           (2, "Thingy B", "available at http://thingb.com", None, 0),
           (3, None, None, "low", 5),
           (4, "Thingy D", "checkout https://thingd.ca", "low", 10),
           (5, "Thingy E", None, "high", 12),
       ],
       columns=["id", "productName", "description", "priority", "numViews"]
)
```

| id | productName | description | priority | numViews |
|----|-------------|-------------|----------|----------|
| 1  | Thingy A    | awesome thing. | high | 0 |
| 2  | Thingy B    | available at http://thingb.com | None | 0 |
| 3  | None        | None        | low      | 5 |
| 4  | Thingy D    | checkout https://thingd.ca | low | 10 |
| 5  | Thingy E    | None        | high     | 12 |

Things that I will check on this toy data:

- there are 5 rows in total.
- values of the id attribute are never Null/None and unique.
- values of the `productName` attribute are never null/None.
- the priority attribute can only contain "high" or "low" as value.
- `numViews` should not contain negative values.
- at least half of the values in description should contain a url.
- the median of `numViews` should be less than or equal to 10.
- The `productName` column contents matches the regex `r'Thingy [A-Z]+'`

## Great Expectations

Calling Great Expectation (GE) as library is a bit of an understatement. This is a full-fledged framework for data validation, leveraging existing tools like Jupyter Notebook and integrating with several data stores for validating data originating from them as well storing the validation results.

The main concept of Great Expectations (GE) are well `expectations,` that as the name indicate, run assertions on expected values of a particular column.

The simplest way to use GE is to wrap the dataframe or data source with a GE `DataSet` and quickly check individual conditions. This is useful for exploring the data and refining the data quality check.

```python
import great_expectations as ge
ge_df = ge.from_pandas(df)
ge_df.expect_table_row_count_to_equal(5)
ge_df.expect_column_values_to_not_be_null("id")
ge_df.expect_column_values_to_not_be_null("description")
ge_df.expect_column_values_to_be_in_set("priority", {"high", "low"})
ge_df.expect_column_values_to_be_between("numViews", 0)
print(ge_df.expect_column_median_to_be_between("numViews", 0, 10))
```

If run interactively in a Notebook, for each expectation we get a json representation of the expectation as well some metadata regarding the values and whether the expectation failed:

```json
{
  "expectation_config": {
    "meta": {},
    "expectation_type": "expect_column_median_to_be_between",
    "kwargs": {
      "column": "numViews",
      "min_value": 0,
      "max_value": 10,
      "result_format": "BASIC"
    }
  },
  "success": true,
  "exception_info": {
    "raised_exception": false,
    "exception_traceback": null,
    "exception_message": null
  },
  "meta": {},
  "result": {
    "observed_value": 5.0,
    "element_count": 5,
    "missing_count": null,
    "missing_percent": null
  }
}
```

However this is not the optimal way to use GE. The documentation states that is better to properly configure the datasets and generate a standard directory structure. This is done through a *Data Context* and requires some scaffolding and generating some files using the command line:

```console
[miguelc@machine]$ great_expectations --v3-api init

Using v3 (Batch Request) API

  ___              _     ___                  _        _   _
 / __|_ _ ___ __ _| |_  | __|_ ___ __  ___ __| |_ __ _| |_(_)___ _ _  ___
| (_ | '_/ -_) _` |  _| | _|\ \ / '_ \/ -_) _|  _/ _` |  _| / _ \ ' \(_-<
 \___|_| \___\__,_|\__| |___/_\_\ .__/\___\__|\__\__,_|\__|_\___/_||_/__/
                                |_|
             ~ Always know what to expect from your data ~

Let's configure a new Data Context.

First, Great Expectations will create a new directory:

    great_expectations
    |-- great_expectations.yml
    |-- expectations
    |-- checkpoints
    |-- notebooks
    |-- plugins
    |-- .gitignore
    |-- uncommitted
        |-- config_variables.yml
        |-- documentation
 (...)
```

Basically, the process goes as follows:

1. Generate the directory structure (using for example the command above)
2. Generate a new data source. You can select - This opens a Jupyter notebook where you configure the data source and store the configuration under `great_expectations.yml`
3. Create the expectation suite, using the [built-in expectations](https://docs.greatexpectations.io/en/latest/reference/glossary_of_expectations.html#expectation-glossary) using also Jupyter Notebooks. You store the expectations as `json` in the `expectations'` directory. A nice way to get started is to use the automated data profiler that examines that data source and generates the expectations.
4. Once you execute the notebook, the data docs are shown. [Data docs](https://docs.greatexpectations.io/en/latest/reference/core_concepts.html#data-docs) show the result of the expectations and other metadata in a nice HTML format that can be useful to learn more about the data.

Once you have created the initial set of expectations you can edit them using the command `great_expectations --v3-api suite edit articles.warning`. You will have to choose whether you want to interact with a batch (sample) of data or not. This will also open a Notebook where you depending on your choice will be able to edit the existing expectations in [slightly different ways](https://docs.greatexpectations.io/en/latest/guides/how_to_guides/creating_and_editing_expectations/how_to_create_a_new_expectation_suite_without_a_sample_batch.html).

Now that you have your expectations set up you can then use them to validate a new batch of data. For that, you need to learn a new additional concept called [Checkpoints](https://docs.greatexpectations.io/en/latest/reference/core_concepts/checkpoints_and_actions.html#checkpoints-and-actions). A Checkpoint bundles Batches of data with corresponding Expectation Suites for validation. To create a checkpoint you need, you guessed right, another nice command line and another Jupyter Notebook.

```console
[miguelc@machine]$ great_expectations --v3-api checkpoint new my_checkpoint
```

If you can execute the above command, it will open a Jupyter Notebook where you can then configure a bunch of stuff using YAML. The key idea here is that with this Checkpoint you link an `expectation_suite` with a particular data asset coming from a data source.

Optionally, you can run the checkpoint (the full expectation on the data source) and see the results on the already familiar data_docs interface.

As for deployment. one pattern would be to run the checkpoint as a task in some sort of workflow manager (such as [Airflow](https://legacy.docs.greatexpectations.io/en/latest/guides/how_to_guides/validation/how_to_run_a_checkpoint_in_airflow.html#how-to-guides-validation-how-to-run-a-checkpoint-in-airflow) or Luigi), you can also run the Checkpoints programmatically using python or straight from the [terminal](https://legacy.docs.greatexpectations.io/en/latest/guides/how_to_guides/validation/how_to_run_a_checkpoint_in_terminal.html#how-to-guides-validation-how-to-run-a-checkpoint-in-terminal).

I recently found out that if you use [dbt](https://www.getdbt.com/), you get GE installed by default and can be used to extend the unit tests of the SQL queries you write.

### The Good

- Interactive validation and expectation testing. The instant feedback helps to refine and add checks for data.
- When an expectation fails, you get a sample of the data that does make the expectation fail. This is useful for debugging.
- It is not limited to pandas data frames, it comes with support for many data sources including SQL databases (via SQLAlchemy) and Spark dataframes.

### The not so good

- Seems heavy and full of things. Getting started might not be as easy as there are many concepts to master.
- Although it might seem natural for many potential users, the coupling with Jupyter Notebook/Lab might make some uncomfortable.
- Expectations are stored as JSON instead of code.
- They received some funding recently and they are changing many of already existing (and already large) concepts and API, making the whole process of learning even more challenging.

## Pandera

[Pandera](https://pandera.readthedocs.io/en/stable/) is "statistical data validation for pandas". Using Pandera is simple, after installing the package you have to define a Schema object where each column has a set of checks. Columns might be optionally nullable. That is, checking for nulls is not a check per se but a quality/characteristic of a column.

```python
import pandas as pd
import pandera as pa

df = pd.DataFrame(
       [
           (1, "Thingy A", "awesome thing.", "high", 0),
           (2, "Thingy B", "available at http://thingb.com", None, 0),
           (3, None, None, "low", 5),
           (4, "Thingy D", "checkout https://thingd.ca", "low", 10),
           (5, "Thingy E", None, "high", 12),
       ],
       columns=["id", "productName", "description", "priority", "numViews"]
)

schema = pa.DataFrameSchema({
    "id": pa.Column(int, nullable=False),
    "description": pa.Column(str, nullable=False),
    "priority": pa.Column(str, checks=pa.Check.isin(["high", "low"]), nullable=True),
    "numViews": pa.Column(int, checks=[
        pa.Check.greater_than_or_equal_to(0),
        pa.Check(lambda c: c.median() >= 0 and c.median() <= 10)
        ]
    ),
    "productName": pa.Column(str, nullable=False),

})

validated_df = schema(df)
print(validated_df)
```

If you run the validation an exception will be raised:

```
Traceback (most recent call last):
  File "<stdin>", line 26, in <module>
  File ".../lib/python3.9/site-packages/pandera/schemas.py", line 648, in __call__
    return self.validate(
  File ".../lib/python3.9/site-packages/pandera/schemas.py", line 594, in validate
    error_handler.collect_error("schema_component_check", err)
  File ".../lib/python3.9/site-packages/pandera/error_handlers.py", line 32, in collect_error
    raise schema_error from original_exc
  File ".../lib/python3.9/site-packages/pandera/schemas.py", line 586, in validate
    result = schema_component(
  File ".../lib/python3.9/site-packages/pandera/schemas.py", line 1826, in __call__
    return self.validate(
  File ".../lib/python3.9/site-packages/pandera/schema_components.py", line 214, in validate
    validate_column(check_obj, column_name)
  File ".../lib/python3.9/site-packages/pandera/schema_components.py", line 187, in validate_column
    super(Column, copy(self).set_name(column_name)).validate(
  File ".../lib/python3.9/site-packages/pandera/schemas.py", line 1720, in validate
    error_handler.collect_error(
  File ".../lib/python3.9/site-packages/pandera/error_handlers.py", line 32, in collect_error
    raise schema_error from original_exc
pandera.errors.SchemaError: non-nullable series 'description' contains null values: {2: None, 4: None}
```

The code would look similar to other data validation libraries (e.g. [Marshmallow](https://marshmallow.readthedocs.io/en/stable/)). Also, compared to GE the library offers the Schema abstraction, which you might or not like it.

With Pandera, if a check fails, it will raise a proper exception (you can disable this and turn it into a `RuntimeWarning`). Depending on how you might want to integrate the checks into the larger pipeline, this might be useful or plainly annoying. Furthermore, if you look closely, Pandera only displays one validation error as the cause of the validation error, although there is more than one column that does not comply with the specification.

Given that this is Python library is relatively easy to integrate into any existing pipeline. It can be a task in Luigi/Airflow for example or something that could be run as part of a larger task.

### The Good

- Familiar API based on schema checking that makes the library easy to get started with.
- Support for hypothesis testing on the columns.
- Data profiling and recommendation of checks that could be relevant.

### The not so good

- Very few checks included under the `pa.Check` class
- The message is not very informative if the check is done through a lambda function.
- Errors during the checking procedure will raise a run-time exception by default.
- It apparently only works with Pandas, it is not clear if it would work with any other implementation or Spark.
- I did not find a way to test for properties on the size of the dataframe or to do comparisons across different runs (i.e. the number of rows should not decrease between runs of the check).

## Deequ/PyDeequ

Last but not least, let us talk about Deequ. Deequ a data checking library written in Scala targeted towards Spark/PySpark dataframes and thus aims to check large datasets making use of Spark optimization to run in a performant manner. PyDeequ, as the name implies, is a Python wrapper offering the same API for pySpark.

The idea behind deequ is to create "*unit tests for data*", to do that, Deequ calculates `Metrics` through `Analyzers`, and assertions are verified based on that metric. A `Check` is a set of assertions to be checked. One interesting feature of (Py)Deequ is that it allows comparing metrics across different runs, allowing to perform assertions on changes on the data (e.g. an unexpected jump in the number of rows of a dataframe).

```python
from pydeequ.checks import Check
from pydeequ.verification import VerificationSuite

check = Check(spark, CheckLevel.Warning, "Review Check")

checkResult = (
    VerificationSuite(spark)
    .onData(df)
    .addCheck(
        check
        .hasSize(lambda sz: sz == 5)  # we expect 5 rows
          .isComplete("id")  # should never be None/Null
          .isUnique("id")  # should not contain duplicates
          .isComplete("productName")  # should never be None/Null
          .isContained_in("priority", ("high", "low"))
          .isNonNegative("numViews")
          # at least half of the descriptions should contain a url
          .containsUrl("description", lambda d: d >= 0.5)
          # half of the items should have less than 10 views
          .hasQuantile("numViews", 0.5, lambda v: v <= 10)
        )
    .run()
)

checkResult_df = VerificationResult.checkResultsAsDataFrame(spark, checkResult)
checkResult_df.show()
```

After calling run, PyDeequ will compute some metrics on the data. Afterwards it
invokes your assertion functions (e.g., `lambda sz: sz == 5` for the size check)
on these metrics to see if the constraints hold on the data. The metrics
calculated can be stored in a `MetricRepository` (e.g. S3 or disk) for future
reference and to make comparison between metrics of different runs.

(Py)Deequ allows for differential calculations of metrics, that is, the metrics
calculated for a dataset can be updated when the data increases without having
to recalculate the metrics from the whole dataset.

Another unique feature of (Py)Deequ is anomaly detection, whereas
GreatExpections allows for single thresholds, (Py)Deequ allows for a checks
based on a running average and standard deviation of the metrics calculated.

Similar to Pandera, PyDeequ is easy to integrate to your existing code base as
it is PySpark/Python code.

### Deequ for Pandas DataFrames

You might be wondering if you can use (Py)Deequ for Pandas, and it is sadly not possible. However, almost a year ago I developed an experimental port Deequ to Pandas. I called it [Hooqu](https://github.com/mfcabrera/hooqu).
However, due to personal constraints, I haven't been able to maintain it, but it is still functional (albeit by using a lot of Pandas hacks) and you can install it via pip.

### The Good

- Use PySpark to parallelize otherwise expensive checks.
- Support for external metric repositories.
- Data profiling.
- Constraint suggestion.

### The not so good

- This is not a pure Python project, rather a wrapper over a Scala/Spark library, and thus the code might not look pythonic.
- Only make sense to use it if you are already using a (py)Spark cluster.
- It is your responsibility to load the data from whenever it resides into a Spark dataframe. There are no "connectors" or "loaders" off-the-shelf.

## Comparison table

Let's finish with a table summarizing the features of the different libraries:

| Feature | GreatExpectations | Pandera | PyDeequ |
|---------|-------------------|---------|---------|
| Checks Extension dimension (Values) | ✓ | ✓ | ✓ |
| Checks the intension dimension (Schema) | ✗ | ✓ | ✗ |
| Pandas support¹ | ✓ | ✓ | ✗ |
| Spark support | ✓ | ✗ | ✓ |
| Multiple data sources (Database loaders, etc.) | ✓ | ✗ | ✗ |
| Data Profiling | ✓ | ✗ | ✓ |
| Constraint/Check Suggestion | ✓ | ✗ | ✓ |
| Hypothesis Testing | ✗ | ✓ | ✗ |
| Incremental computation of the checks | ✗ | ✗ | ✓ |
| Simple Anomaly Detection | ✓ | ✗ | ✓ |
| Complex Anomaly Detection² | ✗ | ✗ | ✓ |

1. Hooqu offers a PyDeequ-like API for Pandas dataframes.
2. Using running averages and standard deviation of incremental computation.

## Final Notes

So, after all this deluge of information, which library should I use?. Well, all these libraries have their strong points and the best choice will depend on your goal, which environment are you familiar with, and the sort of checks you want to perform.

For small Pandas-heavy projects, I would recommend using Pandera (or Hooqu if you are a brave soul). If your organization is larger, you like Jupyter notebooks, and you do not mind the learning curve, I would recommend GreatExpectations as it has currently a lot of traction. If you write your pipelines mostly in (Py)Spark and you care about performance I would go for (Py)Deequ. Both are Apache projects, are easy to integrate with your codebase, and will make better use of your Spark cluster.