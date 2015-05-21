/// <reference path="../vendor/dt-jquery/jquery.d.ts" />
/// <reference path="../scripts/typings/knockout/knockout.d.ts" />

module Algorithm {

    export class AlgorithmViewModel {
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

        private _prepareTransitions() {
            this.transitions().forEach(transition => { transition.type("direct"); transition.level(1); });
            var currentLevel = 1;
            var currentTransitions: AlgorithmTransition[] = [];
            var resultTransitions: AlgorithmTransition[] = [];
            this.blocks().forEach((block, index) => {
                this._findTransitionsTo(block)
                    .filter((transition) => { return transition.type() !== "direct"; })
                    .forEach((transition) => {
                    currentTransitions.splice(currentTransitions.indexOf(transition), 1);
                    currentLevel--;
                });
                var needLevelUp = false;
                this._findTransitionsFrom(block)
                    .sort((t1, t2) => { return this.blocks().indexOf(t1.endBlock()) - this.blocks().indexOf(t2.endBlock()); })
                    .forEach((transition) => {
                    if(this.blocks().indexOf(transition.endBlock()) !== index + 1) {
                        transition.level(currentLevel);
                        if(currentLevel > this.maxLevel()) {
                            this.maxLevel(currentLevel);
                        }
                        currentTransitions.push(transition);
                        transition.type("far");
                        if(this.blocks().indexOf(transition.endBlock()) < this.blocks().indexOf(transition.startBlock())) {
                            transition.direction("up");
                        }
                        needLevelUp = true;
                    }
                    resultTransitions.push(transition);
                });
                if(needLevelUp) {
                    currentLevel++;
                }
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

        constructor(options: any) {
            options.items.forEach(item => {
                if(item.id > this._MaxId) {
                    this._MaxId = item.id;
                }
                this.blocks.push(new AlgorithmItemBlockModel(item));
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

        blocks = ko.observableArray<AlgorithmItemBlockModel>();
        transitions = ko.observableArray<AlgorithmTransition>();

        maxLevel = ko.observable(1);
        blockMinDistance = ko.observable(20);
        connectorsAreaWidth = ko.computed(() => { return this.maxLevel() * this.blockMinDistance(); });
        containerWidth = ko.observable(500);
        blockWidth = ko.computed(() => { return (this.containerWidth() - this.connectorsAreaWidth()) * 0.6; });
        commentWidth = ko.computed(() => { return this.containerWidth() - this.blockWidth() - this.connectorsAreaWidth(); });

        findBlock(id: any) {
            return this.blocks().filter((block) => { return block.id === id; })[0];
        }
        addBlock(block: AlgorithmItemBlockModel, isBefore: boolean = false) {
            var newBlock = new AlgorithmItemBlockModel({ id: ++this._MaxId });
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

        yesTitle = "yes";
        noTitle = "no";
    }

    export class AlgorithmItemBlockModel {
        private _id: any;

        constructor(item: any) {
            this._id = item.id;
            this.text(item.text);
            this.comment(item.comment);
            this.num(item.num);
            this.state(item.state);
        }

        get id() {
            return this._id;
        }
        text = ko.observable();
        comment = ko.observable();

        //isTerminator = ko.computed(() => { return this.prevBlocks().length === 0 || (this.exitBlocks().length === 0 && !this.exit2Block()); });
        //isCondition = ko.computed(() => { return this.exit2Block(); });
        isTerminator = ko.observable(false);
        isCondition = ko.observable(false);
        height = ko.observable(50);
        posY = ko.observable();
        num = ko.observable();
        state = ko.observable();
    }

    export class AlgorithmTransition {

        constructor(startBlock?: AlgorithmItemBlockModel, endBlock?: AlgorithmItemBlockModel) {
            this.startBlock(startBlock);
            this.endBlock(endBlock);
        }

        startBlock = ko.observable<AlgorithmItemBlockModel>();
        endBlock = ko.observable<AlgorithmItemBlockModel>();
        type = ko.observable("direct");
        direction = ko.observable("down");
        level = ko.observable(1);
        label = ko.observable();
    }

}