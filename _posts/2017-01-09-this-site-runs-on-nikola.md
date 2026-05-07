---
layout: post
title: This Site Runs on Nikola
date: 2017-01-09 07:27:47
tags: emacs geeky personal etc nikola jekyll static_site_generator org_mode jupyter_notebooks python blogging migration
categories: geeky
description: Migration from Jekyll to Nikola static site generator
excerpt: Why I switched from Jekyll to Nikola for better Python integration, org-mode support, and Jupyter notebook blogging capabilities.
---

I have changed the site from [Jekyll](http://jekyllrb.com/) to [Nikola](https://getnikola.com/). Mainly because I am mostly a Python coder nowadays and
because the Jekyll version I was using it was kind of hacky and full of patches I created. So let's see if I finally get to write more often.
I have been thinking on becoming an [Iron Blogger](https://ironbloggerberlin.com/) but it might be too much. If I start blogging more using this setup I will definitively consider it.

I really dig that Nikola offers good support of org-mode format (which I use to store my notes and other personal information). Actually, this post
was written using org-mode from Emacs. It also has good support of blogging with Jupyter Notebooks, which I use a lot also at work. It also comes with capabilities
for importing from systems like Wordpress or Jekyll. I do have to change Disqus URLs to match the new format.

The rest of the post it is going to be me trying stuff and some features of Nikola and org-mode Emacs.

```python
for x in range(1, 10):
    print(x)
print list(range(0, 9))
```

```python
def func(x):
    print("Hola mundo")
    if x > 0:
        print("Fuck")
```

With org-babel I can run the code inside get the output. I find that pretty-neat when blogging and showing code snippets.

Short codes need to be surrounded by by...

It took me a while to get used to Nikola style and properly configure it. I should have written the steps down but I forgot. However, there are plenty of resources.

*Note: This site now runs on Jekyll with the al-folio theme, having migrated back from Nikola.*