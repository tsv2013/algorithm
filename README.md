# algorithm #

[![Build Status](https://travis-ci.org/tsv2013/algorithm.svg)](https://travis-ci.org/tsv2013/algorithm) [![Build status](https://ci.appveyor.com/api/projects/status/r3p7wsjm417fq8l7?svg=true)](https://ci.appveyor.com/project/tsv2013/algorithm) [![Coverage Status](https://coveralls.io/repos/tsv2013/algorithm/badge.svg?branch=master&service=github)](https://coveralls.io/github/tsv2013/algorithm?branch=master) [![bitHound Score](https://www.bithound.io/github/tsv2013/algorithm/badges/score.svg)](https://www.bithound.io/github/tsv2013/algorithm) [![Codacy Badge](https://www.codacy.com/project/badge/f23d9de79b914ec88ab42470b96a189a)](https://www.codacy.com/app/tsv2013/algorithm) [![GitHub version](https://badge.fury.io/gh/tsv2013%2Falgorithm.svg)](http://badge.fury.io/gh/tsv2013%2Falgorithm) [![Bower version](https://badge.fury.io/bo/tsv-widget-algorithm.svg)](http://badge.fury.io/bo/tsv-widget-algorithm)

Algorithm visualization widget (jQuery+KnockoutJS)

The demo page: http://tsv2013.github.io/algorithm/.

Algorithm is defined via JSON, for instance:

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

and is bound via KnockoutJS:

    ko.applyBindings(model);

and following markup:

    <div data-bind="algorithm: { value: algorithm }"></div>
