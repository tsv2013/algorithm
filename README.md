# tsvw-algorithm #

[![Build Status](https://travis-ci.org/tsv2013/algorithm.svg)](https://travis-ci.org/tsv2013/algorithm) [![Coverage Status](https://coveralls.io/repos/tsv2013/algorithm/badge.svg?branch=master&service=github)](https://coveralls.io/github/tsv2013/algorithm?branch=master) [![GitHub version](https://badge.fury.io/gh/tsv2013%2Falgorithm.svg)](http://badge.fury.io/gh/tsv2013%2Falgorithm) [![Bower version](https://badge.fury.io/bo/tsv-widget-algorithm.svg)](http://badge.fury.io/bo/tsv-widget-algorithm) [![Standard Version](https://img.shields.io/badge/release-standard%20version-brightgreen.svg)](https://github.com/conventional-changelog/standard-version)

## Algorithm block diagram visualization and editing widget (jQuery+KnockoutJS) ##
## Live demo at: http://tsv2013.github.io/algorithm/ ##

[![NPM](https://nodei.co/npm/tsvw-algorithm.png)](https://npmjs.org/package/tsvw-algorithm)


##How to visualize algorithm block diagram

1. **Add the following markup to your page:**
	```
    <div data-bind="algorithm: { value: algorithm }"></div>
	```

2. **Define algorithm via JSON, for instance:**
	```
    var model = {
        algorithm: {
            items: [
                { id: 9, text: "finish" },
                { id: 6, text: "is condition true?" },
                { id: 3, text: "block is in progress", state: "inprogress" },
                { id: 7, text: "this block has a number", num: 1 },
                { id: 2, text: "this is a simple block with a very very content string" },
                { id: 1, text: "start", comment: "This is the start block." },
                { id: 4, text: "this block is completed", state: "completed" },
                { id: 5, text: "an intermediate block" },
                { id: 8, text: "pre-end simple block" },
            ],
            transitions: [
                { iid: 1, exit1: 2, exit2: null },
                { iid: 2, exit1: 3, exit2: null },
                { iid: 2, exit1: 5, exit2: null },
                { iid: 3, exit1: 4, exit2: null },
                { iid: 4, exit1: 6, exit2: null },
                { iid: 5, exit1: 6, exit2: null },
                { iid: 6, exit1: 7, exit2: 8 },
                { iid: 7, exit1: 9, exit2: null },
                { iid: 8, exit1: 9, exit2: null },
            ]
        }
    };
	```

3. **Bind model via KnockoutJS:**
	```
    ko.applyBindings(model);
	```


##How to modify algorithm block diagram

While hovering mouse over algorithm blocks you will see control points to add blocks above and below, delete block and drag to link this block with other one.


##Building tsvw-algorithm from sources

 1. **Clone the repo from GitHub**  
	```
	git clone https://github.com/tsv2013/algorithm.git
	cd algorithm
	```

 2. **Acquire build dependencies.** Make sure you have [Node.js](http://nodejs.org/) installed on your workstation. This is only needed to _build_ algorithm from sources.  
	```
	npm install -g karma-cli
	npm install
	```

 3. **Build the library**
	```
	npm run build
	```
	After that you should have the library at 'dist' directory.

 4. **Run unit tests**
	```
	karma start
	```
	This command will run unit tests usign [Karma](https://karma-runner.github.io/0.13/index.html)
