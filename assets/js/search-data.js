// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-home",
    title: "home",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-writing",
          title: "writing",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-talks",
          title: "talks",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/talks/";
          },
        },{id: "nav-projects",
          title: "projects",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-about",
          title: "about",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/about/";
          },
        },{id: "post-databricks-berlin-user-group-a-recap-and-a-surprise",
        
          title: "Databricks Berlin User Group: A Recap and a Surprise",
        
        description: "Notes from my first talk in five years, what surprised me about the room, and what I want to say next.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/databricks-berlin-user-group-recap/";
          
        },
      },{id: "post-data-verification-for-machine-learning-a-review-of-dataframe-validation-libraries",
        
          title: "Data Verification for Machine Learning - A Review of DataFrame Validation Libraries",
        
        description: "A comparison of data validation libraries for Pandas and Spark DataFrames",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2021/dataframe-validation-libraries/";
          
        },
      },{id: "post-testing-spark-tasks-with-pytest-mock-and-luigi",
        
          title: "Testing Spark tasks with PyTest, Mock and Luigi",
        
        description: "Testing PySpark tasks using Luigi, PyTest and Mock",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2017/spark-testing-luigi-pytest/";
          
        },
      },{id: "post-using-mypy-for-improving-your-codebase",
        
          title: "Using mypy for Improving your Codebase",
        
        description: "Using static type checking to improve Python codebases",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2017/using-mypy-for-improving-your-codebase/";
          
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/mfcabrera", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/mfcabrera", "_blank");
        },
      },{
        id: 'social-x',
        title: 'X',
        section: 'Socials',
        handler: () => {
          window.open("https://twitter.com/mfcabrera", "_blank");
        },
      },{
        id: 'social-rss',
        title: 'RSS Feed',
        section: 'Socials',
        handler: () => {
          window.open("/feed.xml", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
