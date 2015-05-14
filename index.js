function init() {
    var model = {
        algorithm: {
            items: [
                { id: 9, text: "9", num: 1 },
                { id: 6, text: "6" },
                { id: 3, text: "3", state: "inprogress" },
                { id: 7, text: "7" },
                { id: 2, text: "2" },
                { id: 1, text: "1", comment: "test comment" },
                { id: 4, text: "4", state: "completed" },
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
        }
    };

    ko.applyBindings(model);
}