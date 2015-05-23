/// <reference path="../vendor/dt-jquery/jquery.d.ts" />
/// <reference path="../scripts/typings/knockout/knockout.d.ts" />

module Algorithm {

    export interface ITransition {
        iid: any;
        exit1: any;
        exit2: any
    }

    export class AlgorithmViewModel {
        private _mappings;
        private _MaxId = -1;

        private _collectFollowingBlocks(sortResult: Array<AlgorithmItemBlockModel>, filter: (block: AlgorithmItemBlockModel) => boolean, otherThreads: Array<AlgorithmItemBlockModel> = []) {
            var followingBlocks = this.blocks().filter(filter),
                otherThreadsForChild = otherThreads.concat(followingBlocks);
            followingBlocks.forEach(currentBlock => {
                var currentBlockHasKnownAncestor = this._findTransitionsTo(currentBlock).filter((transitionTo) => { return otherThreads.indexOf(transitionTo.startBlock()) !== -1; }).length !== 0;
                if(sortResult.indexOf(currentBlock) === -1 && !currentBlockHasKnownAncestor) {
                    sortResult.push(currentBlock);
                    otherThreadsForChild.splice(otherThreadsForChild.indexOf(currentBlock), 1);
                    this._collectFollowingBlocks(sortResult, block => { return this._findTransitionsTo(block).filter((transitionTo) => { return transitionTo.startBlock() === currentBlock; }).length !== 0; }, otherThreadsForChild);
                }
            });
        }

        private _sortBlocks() {
            var sortResult: Array<AlgorithmItemBlockModel> = [];
            this._collectFollowingBlocks(sortResult, block => { return this._findTransitionsTo(block).length === 0; });
            this.blocks(sortResult);
        }

        private _findTransitionsFrom(block: AlgorithmItemBlockModel) {
            return this.transitions().filter((transition) => { return transition.startBlock() === block; });
        }

        private _findTransitionsTo(block: AlgorithmItemBlockModel) {
            return this.transitions().filter((transition) => { return transition.endBlock() === block; });
        }

        private _resetTransitions() {
            this.maxLevel(1);
            var transitionsToRemove = [];
            this.transitions().forEach(transition => {
                transition.type("direct"); transition.level(1);
                if(transition.startBlock() === transition.endBlock()) {
                    transitionsToRemove.push(transition);
                }
            });
            transitionsToRemove.forEach(transition => { this.transitions.remove(transition); });
        }

        private _getFreeLevel(currentTransitions: AlgorithmTransition[]) {
            var level = 1;
            var levels = currentTransitions.map(transition => transition.level());
            while(levels.indexOf(level) !== -1) {
                level++;
            }
            return level;
        }

        private _prepareTransitions() {
            var currentTransitions: AlgorithmTransition[] = [];
            var resultTransitions: AlgorithmTransition[] = [];

            this._resetTransitions();

            this.blocks().forEach((block, index) => {
                this.transitions().forEach(transition => {
                    if(transition.endBlock() === block && transition.type() !== "direct") {
                        currentTransitions.splice(currentTransitions.indexOf(transition), 1);
                    }
                });
                this._findTransitionsFrom(block)
                    .sort((t1, t2) => { return this.blocks().indexOf(t1.endBlock()) - this.blocks().indexOf(t2.endBlock()); })
                    .forEach(transition => {
                    if(this.blocks().indexOf(transition.endBlock()) !== index + 1) {
                        transition.type("far");
                        if(this.blocks().indexOf(transition.endBlock()) < this.blocks().indexOf(transition.startBlock())) {
                            transition.direction("up");
                        }
                        transition.level(this._getFreeLevel(currentTransitions));
                        if(transition.level() > this.maxLevel()) {
                            this.maxLevel(transition.level());
                        }
                        currentTransitions.push(transition);
                    }
                    resultTransitions.push(transition);
                });
            });

            this.transitions(resultTransitions);
        }

        private _updateLayout() {
            this.blocks().reduce((posY: number, block: AlgorithmItemBlockModel) => {
                var isStart = this._findTransitionsTo(block).length === 0;
                var isEnd = this._findTransitionsFrom(block).length === 0;
                block.isTerminator(isStart || isEnd);
                block.isCondition(this._findTransitionsFrom(block).filter(transition => transition.label() === this.noTitle).length !== 0);
                block.posY(posY);
                return posY + block.height() + this.blockMinDistance();
            }, 0);
            this._prepareTransitions();
        }

        constructor(options: { items: Array<any>; transitions: Array<ITransition>; mappings?: any }) {
            this._mappings = $.extend({}, options.mappings, {
                id: "id",
                text: "text",
                comment: "comment",
                num: "num",
                state: "state",
                new: function(idVal) {
                    return { id: idVal }
                }
            });
            options.items.forEach(item => {
                var block = new AlgorithmItemBlockModel(item, this._mappings)
                if(block.id() > this._MaxId) {
                    this._MaxId = block.id();
                }
                this.blocks.push(block);
            });
            options.transitions.forEach(transition => {
                if(transition.exit1) {
                    this.transitions.push(new AlgorithmTransition(this.findBlock(transition.iid), this.findBlock(transition.exit1)));
                }
                if(transition.exit2) {
                    var newTransition = new AlgorithmTransition(this.findBlock(transition.iid), this.findBlock(transition.exit2));
                    newTransition.label(this.noTitle);
                    this.transitions.push(newTransition);
                }
            });
            this._sortBlocks();
            this._updateLayout();
        }

        get model() {
            var model = { items: [], transitions: [] };
            this.blocks().forEach(block => model.items.push(block.item));
            this.transitions().forEach(transition => model.transitions.push(transition.transition));
            return model;
        }

        blocks = ko.observableArray<AlgorithmItemBlockModel>();
        transitions = ko.observableArray<AlgorithmTransition>();

        maxLevel = ko.observable(1);
        blockMinDistance = ko.observable(20);
        connectorsAreaWidth = ko.computed(() => { return this.maxLevel() * this.blockMinDistance(); });
        containerWidth = ko.observable(500);
        blockWidth = ko.computed(() => { return (this.containerWidth() - this.connectorsAreaWidth()) * 0.6; });
        commentWidth = ko.computed(() => { return this.containerWidth() - this.blockWidth() - this.connectorsAreaWidth(); });

        findBlock(id: any) {
            return this.blocks().filter((block) => { return block.id() === id; })[0];
        }
        addBlock(block: AlgorithmItemBlockModel, isBefore: boolean = false) {
            var newBlock = new AlgorithmItemBlockModel(this._mappings.new(++this._MaxId), this._mappings);
            this.blocks.splice(this.blocks().indexOf(block) + (isBefore ? 0 : 1), 0, newBlock);
            if(isBefore) {
                this._findTransitionsTo(block).forEach(transition => transition.endBlock(newBlock));
                this.transitions.push(new AlgorithmTransition(newBlock, block));
            }
            else {
                this._findTransitionsFrom(block).forEach(transition => transition.startBlock(newBlock));
                this.transitions.push(new AlgorithmTransition(block, newBlock));
            }
            this._updateLayout();
        }
        removeBlock(block: AlgorithmItemBlockModel) {
            this._findTransitionsTo(block).forEach(transition => {
                this._findTransitionsFrom(block).forEach(transitionFrom => {
                    transition.endBlock(transitionFrom.endBlock());
                });
            });
            this._findTransitionsFrom(block).forEach(transition => {
                this.transitions.remove(transition);
            });
            this.blocks.remove(block);
            this._updateLayout();
        }
        editBlock(block: AlgorithmItemBlockModel) {
            this.currentBlock(block);
            this.isEditMode(!this.isEditMode());
        }
        currentBlock = ko.observable<AlgorithmItemBlockModel>();
        isEditMode = ko.observable(false);

        updateTransition(fromBlock: AlgorithmItemBlockModel, toBlock: AlgorithmItemBlockModel, label: string) {
            var fromTransitions = this._findTransitionsFrom(fromBlock).filter(transition => transition.label() === label);
            if(fromTransitions.length === 0) {
                var newTransition = new AlgorithmTransition(fromBlock, toBlock);
                newTransition.label(label);
                this.transitions.push(newTransition);
            }
            else {
                if(fromTransitions[0].endBlock() === toBlock) {
                    return;
                }
                fromTransitions[0].endBlock(toBlock);
            }
            this._updateLayout();
        }

        static titleAddBefore = "Add block before";
        static titleAddAfter = "Add block after";
        static titleEdit = "Edit block";
        static titleRemove = "Remove block";
        get addTitleBefore() { return AlgorithmViewModel.titleAddBefore; }
        get addTitleAfter() { return AlgorithmViewModel.titleAddAfter; }
        get editTitle() { return AlgorithmViewModel.titleEdit; }
        get removeTitle() { return AlgorithmViewModel.titleRemove; }

        connectTitle = "Drag to connect to..."

        static yesTitle = "yes";
        static noTitle = "no";
        get yesTitle() { return AlgorithmViewModel.yesTitle; }
        get noTitle() { return AlgorithmViewModel.noTitle; }
    }

    export class AlgorithmItemBlockModel {
        private _mappings;
        private _item: any;

        constructor(item: any, mappings?: any) {
            this._mappings = $.extend({}, mappings, {
                id: "id",
                text: "text",
                comment: "comment",
                num: "num",
                state: "state"
            });

            this._item = item;

            $.each(this._mappings, (name, value) => {
                var _innerName = "_" + name;
                this[_innerName] = ko.observable(ko.unwrap(this._item[value]));
                this[name] = ko.computed({
                    read: () => {
                        return this[_innerName]();
                    },
                    write: (val) => {
                        this[_innerName](val);
                        if(ko.isObservable(this._item[value])) {
                            this._item[value](val);
                        }
                        else {
                            this._item[value] = val;
                        }
                    }
                });
            });
        }

        get item() {
            return this._item;
        }

        id = ko.observable<number>(0);
        text = ko.observable();
        comment = ko.observable();
        num = ko.observable();
        state = ko.observable();

        isTerminator = ko.observable(false);
        isCondition = ko.observable(false);

        template = ko.computed(() => {
            return this.isCondition() ? "algorithm-block-condition-template" : "algorithm-block-item-template";
        });

        height = ko.observable(50);
        posY = ko.observable(0);
    }

    export class AlgorithmTransition {

        constructor(startBlock?: AlgorithmItemBlockModel, endBlock?: AlgorithmItemBlockModel) {
            this.startBlock(startBlock);
            this.endBlock(endBlock);
        }

        get transition() {
            if(this.label() !== AlgorithmViewModel.noTitle) {
                return <ITransition>{ iid: this.startBlock().id(), exit1: this.endBlock().id(), exit2: undefined };
            }
            else {
                return <ITransition>{ iid: this.startBlock().id(), exit1: undefined, exit2: this.endBlock().id() };
            }
        }

        startBlock = ko.observable<AlgorithmItemBlockModel>();
        endBlock = ko.observable<AlgorithmItemBlockModel>();
        type = ko.observable("direct");
        direction = ko.observable("down");
        level = ko.observable(1);
        label = ko.observable();

        template = ko.computed(() => {
            if(this.type() !== "direct") {
                return this.direction() === "down" ? "algorithm-tr-far-down-template" : "algorithm-tr-far-up-template";
            }
            return "algorithm-tr-direct-template";
        });

    }

}