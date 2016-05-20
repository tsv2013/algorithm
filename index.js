function init() {
    var model = {
        algorithm: ko.observable({
            items: [ ],
            transitions: [ ]
        })
    };

    ko.applyBindings(model);

    setTimeout(function() {
        model.algorithm({
            items: [
                { id: 9, text: "finish" },
                { id: 6, text: "is condition true?", additional: { info: "Some string" } },
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
            ],
            //blockMappings: {
            //    new: function(idVal) {
            //        debugger;
            //        return { id: idVal };
            //    },
            //    change: function(kind, object) {
            //        debugger;
            //    },
            //    click: function(block) {
            //        alert(block.text());
            //    }
            //},
            //transitionMappings: {
            //    new: function(idVal) {
            //        debugger;
            //        return { };
            //    },
            //    change: function(kind, object) {
            //        debugger;
            //    }
            //},
            //allowEdit: false,
            addonsTemplate: "algorithm-addon-template"
        });
    }, 1000);
}