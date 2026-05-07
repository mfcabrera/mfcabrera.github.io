---
layout: post
title: Testing Spark tasks with PyTest, Mock and Luigi
date: 2017-09-17 12:18:52
tags: python spark pyspark testing luigi pytest mock data_pipelines big_data hadoop mapreduce unit_testing
categories: software_development
description: Testing PySpark tasks using Luigi, PyTest and Mock
excerpt: A guide to testing PySpark tasks using a combination of Luigi, PyTest, and Mock to ensure reliable data processing pipelines.
status: draft
---

## TL;DR
In this blog post I describe briefly how to test PySpark tasks using a combination of Luigi, PyTest and Mock.

## Intro

At TrustYou we have a lot of Hadoop streaming Python jobs. Most of them are written in Python (and some in Pig).
One of the things that bothered me a lot of working in such way is that testing may become complicated as simulating the cluster setting might impose some restrictions.

Although not the only reason, the complexity of testing such types of processing pipelines might contribute to ignore testing part, mostly under the believe that it is not needed or worth.
The trickiest part is that problems in a particular part a data processing pipeline might only become evident in a upstream stage, making debugging difficult.

Luckily, Spark and PySpark make testing simpler as they allow to run Spark application in local cluster making available all the high level abstractions such
as DataFrames. This combined with Pytest, Luigi and Pytest-Fixtures.

## PySpark Tasks with Luigi
Let's start with the basics of how to run a PySpark with Luigi. Luigi has the concept of Task, which is basically a step in a data pipeline. For example
dumping data from a database or running a MapReduce job. To run a Spark job you simple need to set the spark configuration in the Luigi configuration file (luigi.cfg)
and create a class that inherit from `luigi.contrib.spark.PySparkTask`:

```python
from luigi.contrib.spark import PySparkTask
from luigi.contrib.hdfs import HdfsTarget

class SamplePySparkTask(PySparkTask):
    # Spark options can be set a class attributes
    driver_memory = '4g'
    executor_memory = '16g'
    num_executors = 8
    executor_cores = 2

    def main(self, sparkContext):
        # This is where implement the method
        pass

    def output(self):
        # After executing main this file should exists for this task to be considered completed
        return HdfsTarget('myresult.txt')

    def requires(self):
        # This should return either a task of a required file.
        pass
```

Above is the basic structure of a task. The method `main` receives the Spark context as variable. For Luigi it does not matter what we do with the context as long
as we have the output declared in the `output` method.

Now Let's test for example a Task that loads a CSV with the following structure.

_TODO: find out how make a good looking table with Bootstrap_

Our little Spark task will group by user and get the average and will output the result as JSON Line file using the following format.

```json
{
  "customer": "Mario X.",
  "month": "June",
  "average":  123.42
}
```

The necessary Luigi configuration would be as following (assuming Spark is installed):

```ini
[spark]
master: local
```

## Testing with fixtures
For running a Luigi pipe we require to have a luigi configuration loaded into memory. In a real world pipe it will contain luigi specific configuration along with
application specific setting.

This is a good example for a fixture...

_Note: This post appears to be incomplete in the original source._

## Getting Fancier - Using Hypothesis to generate test data
_To be continued..._

## Schema Testing with JSON schemas and Voluptuous
_To be continued..._