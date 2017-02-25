/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/qunit/qunit.d.ts" />
/// <reference path="../widget/algorithm.ts" />

module Algorithm.Tests {

    QUnit.module("Algorithm algorithm view model tests");

    var algorithm1 = {
        items: [
            { id: 9, text: "9" },
            { id: 6, text: "6" },
            { id: 3, text: "3" },
            { id: 7, text: "7" },
            { id: 2, text: "2" },
            { id: 1, text: "1" },
            { id: 4, text: "4" },
            { id: 5, text: "5" },
            { id: 8, text: "8" },
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
    };

    var algorithm2 = {
        items: [
            { id: 3, text: "3" },
            { id: 2, text: "2" },
            { id: 1, text: "1" },
            { id: 4, text: "4" },
        ],
        transitions: [
            { iid: 1, exit1: 2, exit2: null },
            { iid: 2, exit1: 3, exit2: null },
            { iid: 3, exit1: 4, exit2: 2 },
        ]
    };

    QUnit.test("blocks order", function(assert) {
        var algorithmViewModel = new AlgorithmViewModel(algorithm1);

        assert.equal(algorithmViewModel.blocks()[0].id(), 1);
        assert.equal(algorithmViewModel.blocks()[1].id(), 2);
        assert.equal(algorithmViewModel.blocks()[2].id(), 3);
        assert.equal(algorithmViewModel.blocks()[3].id(), 4);
        assert.equal(algorithmViewModel.blocks()[4].id(), 5);
        assert.equal(algorithmViewModel.blocks()[5].id(), 6);
        assert.equal(algorithmViewModel.blocks()[6].id(), 7);
        assert.equal(algorithmViewModel.blocks()[7].id(), 8);
        assert.equal(algorithmViewModel.blocks()[8].id(), 9);
    });

    QUnit.test("prepare transitions", function(assert) {
        var algorithmViewModel = new AlgorithmViewModel(algorithm1);

        assert.equal(algorithmViewModel.transitions().length, 10);
        assert.equal(algorithmViewModel.transitions()[0].type(), "direct");
        assert.equal(algorithmViewModel.transitions()[0].startBlock().id(), 1);
        assert.equal(algorithmViewModel.transitions()[0].endBlock().id(), 2);
        assert.equal(algorithmViewModel.transitions()[1].type(), "direct");
        assert.equal(algorithmViewModel.transitions()[1].startBlock().id(), 2);
        assert.equal(algorithmViewModel.transitions()[1].endBlock().id(), 3);
        assert.equal(algorithmViewModel.transitions()[2].type(), "far");
        assert.equal(algorithmViewModel.transitions()[2].level(), 2);
        assert.equal(algorithmViewModel.transitions()[2].startBlock().id(), 2);
        assert.equal(algorithmViewModel.transitions()[2].endBlock().id(), 5);
        assert.equal(algorithmViewModel.transitions()[3].type(), "direct");
        assert.equal(algorithmViewModel.transitions()[3].startBlock().id(), 3);
        assert.equal(algorithmViewModel.transitions()[3].endBlock().id(), 4);
        assert.equal(algorithmViewModel.transitions()[4].type(), "far");
        assert.equal(algorithmViewModel.transitions()[4].level(), 1);
        assert.equal(algorithmViewModel.transitions()[4].startBlock().id(), 4);
        assert.equal(algorithmViewModel.transitions()[4].endBlock().id(), 6);
        assert.equal(algorithmViewModel.transitions()[5].type(), "direct");
        assert.equal(algorithmViewModel.transitions()[5].startBlock().id(), 5);
        assert.equal(algorithmViewModel.transitions()[5].endBlock().id(), 6);
        assert.equal(algorithmViewModel.transitions()[6].type(), "direct");
        assert.equal(algorithmViewModel.transitions()[6].startBlock().id(), 6);
        assert.equal(algorithmViewModel.transitions()[6].endBlock().id(), 7);
        assert.equal(algorithmViewModel.transitions()[7].type(), "far");
        assert.equal(algorithmViewModel.transitions()[7].direction(), "down");
        assert.equal(algorithmViewModel.transitions()[7].level(), 1);
        assert.equal(algorithmViewModel.transitions()[7].startBlock().id(), 6);
        assert.equal(algorithmViewModel.transitions()[7].endBlock().id(), 8);
    });

    QUnit.test("prepare transitions back", function(assert) {
        var algorithmViewModel = new AlgorithmViewModel(algorithm2);

        assert.equal(algorithmViewModel.transitions().length, 4);
        assert.equal(algorithmViewModel.transitions()[0].type(), "direct");
        assert.equal(algorithmViewModel.transitions()[0].startBlock().id(), 1);
        assert.equal(algorithmViewModel.transitions()[0].endBlock().id(), 2);
        assert.equal(algorithmViewModel.transitions()[1].type(), "direct");
        assert.equal(algorithmViewModel.transitions()[1].startBlock().id(), 2);
        assert.equal(algorithmViewModel.transitions()[1].endBlock().id(), 3);
        assert.equal(algorithmViewModel.transitions()[2].type(), "direct");
        assert.equal(algorithmViewModel.transitions()[2].startBlock().id(), 3);
        assert.equal(algorithmViewModel.transitions()[2].endBlock().id(), 4);
        assert.equal(algorithmViewModel.transitions()[3].type(), "far");
        assert.equal(algorithmViewModel.transitions()[3].direction(), "up");
        assert.equal(algorithmViewModel.transitions()[3].level(), 1);
        assert.equal(algorithmViewModel.transitions()[3].startBlock().id(), 3);
        assert.equal(algorithmViewModel.transitions()[3].endBlock().id(), 2);
    });

    QUnit.test("add block", function (assert) {
        var algorithmViewModel = new AlgorithmViewModel(algorithm2);

        assert.equal(algorithmViewModel.blocks().length, 4, "source configuration");
        assert.equal(algorithmViewModel.blocks()[0].id(), 1);
        assert.equal(algorithmViewModel.blocks()[1].id(), 2);
        assert.equal(algorithmViewModel.blocks()[2].id(), 3);

        algorithmViewModel.addBlock(algorithmViewModel.blocks()[1]);
        assert.equal(algorithmViewModel.blocks().length, 5, "block was added after");
        assert.equal(algorithmViewModel.blocks()[0].id(), 1);
        assert.equal(algorithmViewModel.blocks()[1].id(), 2);
        assert.equal(algorithmViewModel.blocks()[2].id(), 5);
        assert.equal(algorithmViewModel.blocks()[3].id(), 3);
        assert.equal(algorithmViewModel.transitions().length, 5, "transitions");
        assert.equal(algorithmViewModel.transitions()[0].type(), "direct");
        assert.equal(algorithmViewModel.transitions()[0].startBlock().id(), 1);
        assert.equal(algorithmViewModel.transitions()[0].endBlock().id(), 2);
        assert.equal(algorithmViewModel.transitions()[1].type(), "direct");
        assert.equal(algorithmViewModel.transitions()[1].startBlock().id(), 5);
        assert.equal(algorithmViewModel.transitions()[1].endBlock().id(), 3);
        assert.equal(algorithmViewModel.transitions()[2].type(), "direct");
        assert.equal(algorithmViewModel.transitions()[2].startBlock().id(), 3);
        assert.equal(algorithmViewModel.transitions()[2].endBlock().id(), 4);
        assert.equal(algorithmViewModel.transitions()[3].type(), "far");
        assert.equal(algorithmViewModel.transitions()[3].direction(), "up");
        assert.equal(algorithmViewModel.transitions()[3].level(), 1);
        assert.equal(algorithmViewModel.transitions()[3].startBlock().id(), 3);
        assert.equal(algorithmViewModel.transitions()[3].endBlock().id(), 2);
        assert.equal(algorithmViewModel.transitions()[4].type(), "direct");
        assert.equal(algorithmViewModel.transitions()[4].startBlock().id(), 2);
        assert.equal(algorithmViewModel.transitions()[4].endBlock().id(), 5);

        algorithmViewModel.addBlock(algorithmViewModel.blocks()[1], true);
        assert.equal(algorithmViewModel.blocks().length, 6, "block was added before");
        assert.equal(algorithmViewModel.blocks()[0].id(), 1);
        assert.equal(algorithmViewModel.blocks()[1].id(), 7); // not 6 because transitions are using the same MaxID
        assert.equal(algorithmViewModel.blocks()[2].id(), 2);
        assert.equal(algorithmViewModel.blocks()[3].id(), 5);
    });

    QUnit.test("remove block", function(assert) {
        var changes = [];
        algorithm2["blockMappings"] = {
            change: (kind: string, object: ItemHolder) => {
                changes.push({ element: "block", kind: kind, object: object });
            }
        };
        algorithm2["transitionMappings"] = {
            change: (kind: string, object: ItemHolder) => {
                changes.push({ element: "transition", kind: kind, object: object });
            }
        };
        var algorithmViewModel = new AlgorithmViewModel(algorithm2);

        assert.equal(algorithmViewModel.blocks().length, 4, "source configuration");
        assert.equal(algorithmViewModel.blocks()[0].id(), 1);
        assert.equal(algorithmViewModel.blocks()[1].id(), 2);
        assert.equal(algorithmViewModel.blocks()[2].id(), 3);

        algorithmViewModel.removeBlock(algorithmViewModel.blocks()[1]);
        assert.equal(algorithmViewModel.blocks().length, 3, "block was removed");
        assert.equal(algorithmViewModel.blocks()[0].id(), 1);
        assert.equal(algorithmViewModel.blocks()[1].id(), 3);
        assert.equal(algorithmViewModel.blocks()[2].id(), 4);
        assert.equal(algorithmViewModel.transitions().length, 2, "transitions");
        assert.equal(algorithmViewModel.transitions()[0].type(), "direct");
        assert.equal(algorithmViewModel.transitions()[0].startBlock().id(), 1);
        assert.equal(algorithmViewModel.transitions()[0].endBlock().id(), 3);
        assert.equal(algorithmViewModel.transitions()[1].type(), "direct");
        assert.equal(algorithmViewModel.transitions()[1].startBlock().id(), 3);
        assert.equal(algorithmViewModel.transitions()[1].endBlock().id(), 4);

        assert.equal(changes.length, 5);
        assert.equal(changes[0].element, "transition");
        assert.equal(changes[0].kind, "edit");
        //assert.equal(changes[0].object.id(), "2");
        assert.equal(changes[1].element, "transition");
        assert.equal(changes[1].kind, "edit");
        //assert.equal(changes[1].object.id(), "2");
        assert.equal(changes[2].element, "transition");
        assert.equal(changes[2].kind, "deleted");
        //assert.equal(changes[2].object.id(), "2");
        assert.equal(changes[3].element, "block");
        assert.equal(changes[3].kind, "deleted");
        assert.equal(changes[3].object.id(), "2");
        assert.equal(changes[4].element, "transition");
        assert.equal(changes[4].kind, "deleted");
        //assert.equal(changes[4].object.id(), "2");
    });

    QUnit.test("get model", function(assert) {
        var algorithmViewModel = new AlgorithmViewModel(algorithm2);

        assert.deepEqual(algorithmViewModel.model, {
            "items": [
                {
                    "id": 1,
                    "text": "1"
                },
                {
                    "id": 2,
                    "text": "2"
                },
                {
                    "id": 3,
                    "text": "3"
                },
                {
                    "id": 4,
                    "text": "4"
                }
            ],
            "transitions": [
                {
                    "exit1": 2,
                    "exit2": undefined,
                    "iid": 1
                },
                {
                    "exit1": 3,
                    "exit2": undefined,
                    "iid": 2
                },
                {
                    "exit1": 4,
                    "exit2": undefined,
                    "iid": 3
                },
                {
                    "exit1": undefined,
                    "exit2": 2,
                    "iid": 3
                }
            ]
        });
    });

    QUnit.test("multiple far transitions", function(assert) {
        var algorithmViewModel = new AlgorithmViewModel({
            items: [
                { id: 3, text: "3" },
                { id: 2, text: "2" },
                { id: 1, text: "1" },
                { id: 4, text: "4" },
            ],
            transitions: [
                { iid: 1, exit1: 2, exit2: null },
                { iid: 1, exit1: 3, exit2: null },
                { iid: 1, exit1: 4, exit2: null },
                { iid: 2, exit1: 3, exit2: null },
                { iid: 2, exit1: 4, exit2: null },
            ]
        });

        assert.equal(algorithmViewModel.blocks()[0].id(), 1);
        assert.equal(algorithmViewModel.blocks()[1].id(), 3);
        assert.equal(algorithmViewModel.blocks()[2].id(), 2);
        assert.equal(algorithmViewModel.blocks()[3].id(), 4);
        assert.equal(algorithmViewModel.transitions().length, 5, "transitions");
        assert.equal(algorithmViewModel.transitions()[0].type(), "far");
        assert.equal(algorithmViewModel.transitions()[0].level(), 2);
        assert.equal(algorithmViewModel.transitions()[1].type(), "direct");
        assert.equal(algorithmViewModel.transitions()[1].level(), 1);
        assert.equal(algorithmViewModel.transitions()[2].type(), "far");
        assert.equal(algorithmViewModel.transitions()[2].level(), 3);
        assert.equal(algorithmViewModel.transitions()[3].type(), "far");
        assert.equal(algorithmViewModel.transitions()[3].level(), 1);
        assert.equal(algorithmViewModel.transitions()[4].type(), "direct");
        assert.equal(algorithmViewModel.transitions()[4].level(), 1);
    });

    QUnit.test("blocks order 2 (lost last block)", function(assert) {
        var algorithmViewModel = new AlgorithmViewModel({
            items: [
                { id: 1, text: "1" },
                { id: 3, text: "3" },
                { id: 2, text: "2" },
                { id: 4, text: "4" },
                { id: 5, text: "end" }
            ],
            transitions: [
                { iid: 1, exit1: 3, exit2: null },
                { iid: 3, exit1: 2, exit2: null },
                { iid: 2, exit1: 4, exit2: null },
                { iid: 3, exit1: null, exit2: 4 },
                { iid: 4, exit1: 5, exit2: null }
            ]});

        assert.equal(algorithmViewModel.blocks().length, 5);
        assert.equal(algorithmViewModel.blocks()[0].id(), 1);
        assert.equal(algorithmViewModel.blocks()[1].id(), 3);
        assert.equal(algorithmViewModel.blocks()[2].id(), 2);
        assert.equal(algorithmViewModel.blocks()[3].id(), 4);
        assert.equal(algorithmViewModel.blocks()[4].id(), 5);
    });

} 