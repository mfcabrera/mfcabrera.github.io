---
layout: post
title: Using mypy for Improving your Codebase
date: 2017-05-14 12:18:52
tags: python mypy programming software_development py3 static_typing type_checking code_quality legacy_code
categories: software_development
description: Using static type checking to improve Python codebases
excerpt: How to use mypy to document and add static type checking to existing Python codebases, helping with refactoring and documentation of legacy code while following The Boy Scout Rule.
---

<div class="pull-right" style="margin-left: 10px;">
<a href="https://www.xkcd.com/353/">
<img src="https://imgs.xkcd.com/comics/python.png" target="_blank" class="img-responsive img-thumbnail" height="368" width="324" style="margin: 2px;"/>
</a>
</div>

## TL;DR

In this article I use [mypy](http://mypy-lang.org/) to document and add static type checking to an existing codebase and I describe the reasons why I believe using mypy can help
in the refactoring and documentation of legacy code while following the [The Boy Scout Rule](http://programmer.97things.oreilly.com/wiki/index.php/The_Boy_Scout_Rule).

## Intro

We all love Python, it is a multi-paradigm dynamic programming language very popular in Data Science and Machine Learning. Besides some small quirky things in the language, I am quite happy with how it is evolving.
However, there are some areas where I thought Python could do better for improving programming productivity in specific contexts:

- While is easy to hack around scripts and get something running, managing a large complex codebase becomes an issue. You can get something working really fast, but maintaining it can become an issue if your code base becomes large enough.

- Many times while reading other people's code (heck, even my own code), and even when documented, it is really hard to figure out what a method or function is doing without a clear knowledge of the types you are working with. In many cases having just the type information (i.e. via a simple comment) would make understanding the code a whole lot faster.

I have also spent a lot of time debugging just because the wrong type was passed
to a function/method (e.g. the wrong variable was passed to a method, wrong argument order, etc.). Because of Python's dynamic typing the interpreter and/or linter could not warn me. Plus, some of those errors only were evident at execution time, generally in edge cases.

Although we all like working on greenfield projects, in the real world you will have to work with legacy code and it will generally be ugly and full of issues. Let's take a look at at some Python 2.7 _legacy_ code I have to maintain:

```python
# snnipets.py
def get_hotel_type_snippets(self, hotel_type_id, cat_set):
    snippets = self.get_snippets(hotel_type_id, "pos")
    snippets += list(it.chain.from_iterable(
        self.get_snippets(
            rel_cat,
            cat_set[rel_cat].sentiment
        )
        for rel_cat
        in cat_set[hotel_type_id].cat_def.related_cats
        if rel_cat in cat_set and cat_set[rel_cat].sentiment == "pos"
    ))
    return snippets[:self.max_snippets]
```

Don't focus too much on the fact that it has no documentation and forget about the ugly comprehension inside.

In order to understand this code I have to answer the following questions:

- What type is `hotel_type_id` (is it an `int`?)
- What type is `cat_set`, it looks like a dictionary containing something else.

These two issues could be fixed with a proper _docstring_, however comments sometimes don't contain all the information required, don't include the type of the parameters being passed or can be easily inconsistent as the code might have been changed but the comment not updated.

If I want to understand the code I will have to look for its usage, maybe _grepping_ through the code for something called
`related_cats` or  `sentiment`. If you have a large  codebase, you might even find many classes implementing the same method name.

I have two choices when I need to modify existing code like this. I can either hack my way around, modifying it enough to make it do what I want,
or I can look for a way to make this code better (i.e. the [The Boy Scout Rule](http://programmer.97things.oreilly.com/wiki/index.php/The_Boy_Scout_Rule)). Besides adding the needed documentation, it would be cool to have a way to specify the types that could be potentially used by a static linter.

## Enter mypy

Luckily I was not the only one with this problem (or desire), and that's one of the reasons [PEP-484](https://www.python.org/dev/peps/pep-0484/) came to life. The goal is to provide Python with
_optional type annotations_ that allow an offline static linter to check for type issues. However I believe making the code easier to understand (via type documentation) is an awesome side-product.

There is an implementation of this PEP called [mypy](http://mypy-lang.org/index.html) that is in fact the inspiration for the first. Mypy provides a static type checker that works in Python 3 (using type annotations) and Python 2.7 (using specific crafted comments).

At TrustYou we have a lot of Python 2.7 legacy code that suffers many of the issues mentioned above, so I decided to give it a try in a new project I was working on and I have to say it helped catch some issues early in the development stage. I also tried in it in an existing code base that because of its structure was hard to read.

Let's go back to the example code I shared before and let's document the code using [type annotations](http://mypy.readthedocs.io/en/latest/python2.html):

```python
from typing import Any, List, Dict
from metaprecomp.tops_flops_bake.category import CategorySet

def get_hotel_type_snippets(self, hotel_type_id, cat_set):
    # type: (str, CategorySet) -> List[Dict[str, Any]]

    snippets = self.get_snippets(hotel_type_id, "pos")
    # (...) as before
```

As you might guess,  `(str, Category)` are the types of the method parameters. What follows  `->` is the return type, in this example, a list
of dictionaries from `str` to `Any`. `Any` is a catch all-type. It helps when you don't know they type (in this case, i would have had to read the code further, and I was too lazy) or when the function can return _literally_ any type.

Some notes from the code above:

- You might have noticed the  `from typing import Any, ...`, the typing library brings the required types into Python 2.7, even when used only as comments. So yeah, you will need to add it to your `requirements.txt`.
- You also noticed I had to import _explicitly_ `CategorySet` from the `category` model (even if I used it as a comment). I find that good as I am stating there's a relationship or dependency between those modules.
- Finally, you also noticed the  `# noqa: F401`. This is to avoid `flake8`  or `pylint` to complain about unused imports. This is not nice, but it is minor annoyance.

## Installing and running mypy

So far we have used `mypy` syntax (actually [PEP 484 - Type Hints](https://www.python.org/dev/peps/pep-0484/)) to do some annotation, but all this hassle should bring something to the table besides a nifty documentation. So let's install `mypy` and try the command line.

Running `mypy` requires a Python 3 environment so if your main Python environment is 2.7 you will need to install it in a separate one. Luckly you can
call the binary directly (even when your Py27 environment is activated). I you use [Anaconda](https://www.continuum.io/downloads) you can easily create a dedicated environment for `mypy`:

```console
[miguelc@machine]$ conda create -n mypy python=3.6
(...)
[miguelc@machine]$ source activate mypy
(mypy)[miguelc@machine]$ pip install mypy  # to get the latest mypy
(mypy)[miguelc@machine]$ ln -s `which mypy` $HOME/bin/mypy   # I have $HOME/bin in my $PATH
(mypy)[miguelc@machine]$ source deactivate
[miguelc@machine]$ mypy --help    # this should work
```

With that out of the way, we can start using `mypy` executable for checking our source code. I run `mypy` the following way:

```console
[miguelc@machine]$ mypy --py2 --ignore-missing-imports  --check-untyped-defs  [directory or files]
```

- `--py2`: indicates that the code to check is a Python 2 codebase.
- `--ignore-missing-imports` tells  `mypy` to ignore error messages when imports cannot be resolved, e.g. when they don't exist on the env mypy is running.
- `--check-untyped-defs`: checks functions but does not fail if the arguments are not typed.

The command line tool provides a lot of options and the [documentation](http://mypy.readthedocs.io/en/stable/command_line.html#ignore-missing-imports) is very good. An interesting feature is that it allows you to generate reports that can be displayed using CI tools like Jenkins.

## Checking for type errors

Let's take a look at another method I annoated for the purpose of exemplifying the type of errors you can find using `mypy` after adding type annotations:

```python
from typing import Any, List, Dict, FrozenSet  # noqa: F401

def get_snippets(
        self, category_id, sentiment,
        pos_contradictory_subcat_ids=frozenset(),
        neg_contradictory_subcat_ids=frozenset()):
        # type: (str, str, FrozenSet[str],  FrozenSet[str]) -> List[Dict[str, str]]

        # (...) not relevant code...
```

Indeed, another method with no documentation whatsoever. So I had to read a little bit of the code to figure out what are the input and return types. Now let's imagine that somewhere in the code something like this happens:

```python
# bake_reduce.py
cat = 13
# (...)
snippets_generator = SnippetsGenerator(
    snippets_by_cat_sent,
    self.metacategory_bundle[lang]
)
snippets_generator.get_snippets(cat, "pos")
```

If I run `mypy` I would get the following error:

```console
[miguelc@machine]$ mypy --ignore-missing-imports  --check-untyped-defs  --py2  metaprecomp/tops_flops_bake/bake_reduce.py
metaprecomp/tops_flops_bake/bake_reduce.py:238: error: Argument 1 to "get_snippets" of "SnippetsGenerator" has incompatible type "int"; expected "str"
```

If you come from the static typed language world this should look really normal to you, but for Python developers finding an error like this (in particular in large code bases) requires to spend quite a bit of time debugging (and sometimes the use of Voodoo magic).

## When to use mypy

Optional type annotations are that, optional. You can start hacking as normal using the speed that Python dynamic typing gives you and once your code is stable enough you can gradually add type annotations to help avoid bugs and to document the code. The `mypy` [FAQ](http://mypy.readthedocs.io/en/stable/faq.html) contains some scenarios in which a project will benefit from using static type annotations:

- Your project is large or complex.
- Your codebase must be maintained for a long time.
- Multiple developers are working on the same code.
- Running tests takes a lot of time or work (type checking may help you find errors early in development, reducing the number of testing iterations).
- Some project members (devs or management) don't like dynamic typing, but others prefer dynamic typing and Python syntax. Mypy could be a solution that everybody finds easy to accept.
- You want to future-proof your project even if currently none of the above really apply.

In the particular case of my team, a lot of the code we write ends up running for quite a long time inside of [MapReduce](https://en.wikipedia.org/wiki/MapReduce) (Hadoop) jobs, so being able to detect bugs ahead of time would save precious developer time and make everyone happier.

## Adding support to Emacs

By now you might be thinking that it would be cool to integrate `mypy` checks into your editor. Some, like  [PyCharm](https://blog.jetbrains.com/pycharm/2015/11/python-3-5-type-hinting-in-pycharm-5/),  already support this.
For Emacs you can integrate `mypy` into [Flycheck](http://www.flycheck.org/en/latest/) via [flycheck-mypy](https://github.com/lbolla/emacs-flycheck-mypy/). You can install it via `M-x package-install flycheck-mypy`.
Configuring it is a matter of setting a couple of variables:

```lisp
(set-variable 'flycheck-python-mypy-executable "/Users/miguel/anaconda2/envs/py35/mypy/mypy")
(set-variable 'flycheck-python-mypy-args '("--py2"  "--ignore-missing-imports" "--check-untyped-defs"))
```

Mypy recommends disabling all other linters/checkers like `flake8` and others when using it, however I wanted to keep both at the same time (call me paranoid). In Emacs, you can accomplish this with the following configuration:

```lisp
(flycheck-add-next-checker 'python-flake8 'python-mypy)
```

## Final words and references

Using `mypy` won't magically find errors in your code, it will be as good as the type annotations  you add and the way you structure the code. Also, it is not a replacement for proper documentation. Sometimes there are methods/functions that become easier to read just by adding type annotations, but documenting key parts of the code is vital for ensuring code  maintainability and extensibility.

I did not mention all the features of `mypy` so please check official [documentation](http://mypy.readthedocs.io/en/stable/) to learn more.

There are a couple of talks that can serve as a nice introduction to the topic:

- [Introducing Type Annotations for Python](https://www.youtube.com/watch?v=ZP_QV4ccFHQ) - by Guido, Greg Price and David Fisher
- [Static Types for Python PyCon 2017](https://www.youtube.com/watch?v=7ZbwZgrXnwY) - by Jukka Lehtosalo and David Fisher

The first one of them is given by Guido, who's pushing  the project a lot. Thus, I expect `mypy` to become more popular in the following years. Happy hacking.