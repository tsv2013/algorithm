/// <reference path="../vendor/dt-jquery/jquery.d.ts" />
/// <reference path="../scripts/typings/knockout/knockout.d.ts" />

module Algorithm {

    export interface ITransition {
        iid: any;
        exit1: any;
        exit2: any
    }

    export interface ITransitionLine {
        transition: AlgorithmTransition;
        start: number;
        length: number
    }

    export class AlgorithmViewModel {
        private _blockMappings;
        private _transitionMappings;
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

        private _isFitToLayoutLine(layoutLine: Array<ITransitionLine>, transitionLine: ITransitionLine) {
            var result = true;
            layoutLine.forEach(tl => {
                if(result) {
                    if(tl.start > transitionLine.start) {
                        result = transitionLine.start + transitionLine.length <= tl.start;
                    }
                    else {
                        result = tl.start + tl.length <= transitionLine.start;
                    }
                }
            });
            return result;
        }

        private _prepareTransitions() {
            var farTransitionLines: Array<ITransitionLine> = [];
            var loopTransitions = [];
            this.transitions().forEach(transition => {
                if(transition.startBlock() === transition.endBlock()) {
                    loopTransitions.push(transition);
                }
                else {
                    transition.level(1);
                    var startIndex = this.blocks().indexOf(transition.startBlock());
                    var endIndex = this.blocks().indexOf(transition.endBlock());
                    if(endIndex - startIndex === 1) {
                        transition.type("direct");
                    }
                    else {
                        transition.type("far");
                        if(endIndex > startIndex) {
                            transition.direction("down");
                            farTransitionLines.push({ transition: transition, start: startIndex, length: endIndex - startIndex });
                        }
                        else {
                            transition.direction("up");
                            farTransitionLines.push({ transition: transition, start: endIndex, length: startIndex - endIndex });
                        }
                    }
                }
            });

            loopTransitions.forEach(transition => { this.transitions.remove(transition); });
            farTransitionLines.sort((t1, t2) => { return t1.length - t2.length; })

            var layoutLines: Array<Array<ITransitionLine>> = [];
            while(farTransitionLines.length > 0) {
                var fitToLine = false;
                layoutLines.forEach((layoutLine, index) => {
                    if(!fitToLine && this._isFitToLayoutLine(layoutLine, farTransitionLines[0])) {
                        var transitionLineToPush = farTransitionLines.splice(0, 1)[0]
                        transitionLineToPush.transition.level(index + 1);
                        layoutLine.push(transitionLineToPush);
                        fitToLine = true;
                    }
                });
                if(!fitToLine) {
                    layoutLines.push([]);
                }
            }

            this.maxLevel(layoutLines.length + 1);
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

        constructor(options: { items: Array<any>; transitions: Array<any>; blockMappings?: any; transitionMappings?: any; allowEdit?: boolean }) {
            this._blockMappings = $.extend(true, {}, {
                id: "id",
                text: "text",
                comment: "comment",
                num: "num",
                state: "state",
                new: function(idVal: any) {
                    return { id: idVal };
                },
                change: function(kind: string, object: AlgorithmItemBlockModel) {
                }
            }, options.blockMappings);
            this._transitionMappings = $.extend(true, {}, {
                iid: "iid",
                exit1: "exit1",
                exit2: "exit2",
                new: function(idVal: any) {
                    return {};
                },
                change: function(kind: string, object: AlgorithmTransition) {
                }
            }, options.transitionMappings);
            this.allowEdit = options.allowEdit !== false;
            options.items.forEach(item => {
                var block = new AlgorithmItemBlockModel(item, this._blockMappings)
                if(block.id() > this._MaxId) {
                    this._MaxId = block.id();
                }
                this.blocks.push(block);
            });
            options.transitions.forEach(transition => {
                if(ko.unwrap(transition[this._transitionMappings.exit1])) {
                    this.transitions.push(new AlgorithmTransition(this.findBlock(ko.unwrap(transition[this._transitionMappings.iid])), this.findBlock(ko.unwrap(transition[this._transitionMappings.exit1])), transition, this._transitionMappings));
                }
                if(ko.unwrap(transition[this._transitionMappings.exit2])) {
                    var newTransition = new AlgorithmTransition(this.findBlock(ko.unwrap(transition[this._transitionMappings.iid])), this.findBlock(ko.unwrap(transition[this._transitionMappings.exit2])), transition, this._transitionMappings);
                    newTransition.label(this.noTitle);
                    this.transitions.push(newTransition);
                }
            });
            this._sortBlocks();
            this._updateLayout();

            this.blocks.subscribe((changes) => {
                (<any>changes).forEach(change => this._blockMappings.change(change.status, change.value));
            }, null, "arrayChange");
            this.transitions.subscribe((changes) => {
                (<any>changes).forEach(change => this._transitionMappings.change(change.status, change.value));
            }, null, "arrayChange");
            this.isEditMode.subscribe(newValue => {
                if(!newValue) {
                    this._blockMappings.change("edit", this.currentBlock());
                }
            });
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
            var newBlock = new AlgorithmItemBlockModel(this._blockMappings.new(++this._MaxId), this._blockMappings);
            this.blocks.splice(this.blocks().indexOf(block) + (isBefore ? 0 : 1), 0, newBlock);
            if(isBefore) {
                this._findTransitionsTo(block).forEach(transition => {
                    this._transitionMappings.change("edit", transition);
                    transition.endBlock(newBlock);
                });
                this.transitions.push(new AlgorithmTransition(newBlock, block, this._transitionMappings.new(++this._MaxId), this._transitionMappings));
            }
            else {
                this._findTransitionsFrom(block).forEach(transition => {
                    this._transitionMappings.change("edit", transition);
                    transition.startBlock(newBlock);
                });
                this.transitions.push(new AlgorithmTransition(block, newBlock, this._transitionMappings.new(++this._MaxId), this._transitionMappings));
            }
            this._updateLayout();
        }
        removeBlock(block: AlgorithmItemBlockModel) {
            this._findTransitionsTo(block).forEach(transition => {
                this._findTransitionsFrom(block).forEach(transitionFrom => {
                    this._transitionMappings.change("edit", transition);
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
        detailTemplate = "algorithm-default-details-template";
        isEditMode = ko.observable(false);
        allowEdit: boolean = true;

        updateTransition(fromBlock: AlgorithmItemBlockModel, toBlock: AlgorithmItemBlockModel, label: string, preserveTransitions: boolean = false) {
            var fromTransitions = this._findTransitionsFrom(fromBlock).filter(transition => transition.label() === label);
            if(preserveTransitions) {
                if(fromTransitions.filter(transition => transition.endBlock() === toBlock).length === 0) {
                    var newTransition = new AlgorithmTransition(fromBlock, toBlock, this._transitionMappings.new(++this._MaxId), this._transitionMappings);
                    newTransition.label(label);
                    this.transitions.push(newTransition);
                }
            }
            else {
                if(fromTransitions.length === 0) {
                    var newTransition = new AlgorithmTransition(fromBlock, toBlock, this._transitionMappings.new(++this._MaxId), this._transitionMappings);
                    newTransition.label(label);
                    this.transitions.push(newTransition);
                }
                else {
                    fromTransitions[0].endBlock(toBlock);
                    for(var i = 1; i < fromTransitions.length; i++) {
                        this.transitions.remove(fromTransitions[i]);
                    }
                }
            }
            this._updateLayout();
        }

        static yesTitle = "yes";
        static noTitle = "no";
        static addBeforeTitle = "Add block before";
        static addAfterTitle = "Add block after";
        static titleEdit = "Edit block";
        static titleRemove = "Remove block";
        static connectTitle = "Drag to connect to...";
        static closeTitle = "Close";

        get addBeforeTitle() { return AlgorithmViewModel.addBeforeTitle; }
        get addAfterTitle() { return AlgorithmViewModel.addAfterTitle; }
        get editTitle() { return AlgorithmViewModel.titleEdit; }
        get removeTitle() { return AlgorithmViewModel.titleRemove; }
        get connectTitle() { return AlgorithmViewModel.connectTitle; }
        get yesTitle() { return AlgorithmViewModel.yesTitle; }
        get noTitle() { return AlgorithmViewModel.noTitle; }
    }

    export class ItemHolder {
        private _mappings;
        private _item: any;

        constructor(item: any, mappings?: any) {
            this._mappings = $.extend({}, mappings);

            this._item = item;

            $.each(this._mappings,(name, value) => {
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

    }

    export class AlgorithmItemBlockModel extends ItemHolder {

        constructor(item: any, mappings?: any) {
            super(item, mappings || {
                id: "id",
                text: "text",
                comment: "comment",
                num: "num",
                state: "state"
            });
        }

        id: KnockoutObservable<number>;
        text: KnockoutObservable<string>;
        comment: KnockoutObservable<string>;
        num: KnockoutObservable<number>;
        state: KnockoutObservable<string>;

        isTerminator = ko.observable(false);
        isCondition = ko.observable(false);

        template = ko.computed(() => {
            return this.isCondition() ? "algorithm-block-condition-template" : "algorithm-block-item-template";
        });

        height = ko.observable(50);
        posY = ko.observable(0);
    }

    export class AlgorithmTransition extends ItemHolder {

        constructor(startBlock: AlgorithmItemBlockModel, endBlock: AlgorithmItemBlockModel, item: any, mappings?: any) {
            super(item, mappings || {
                iid: "iid",
                exit1: "exit1",
                exit2: "exit2"
            });
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