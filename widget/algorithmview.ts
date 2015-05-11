/// <reference path="knockout.d.ts" />
/// <reference path="../vendor/dt-jquery/jquery.d.ts" />

module Algorithm {

    export class AlgorithmViewModel {

        private _findPrevBlocks(id: any, blocks: Array<AlgorithmItemBlockModel>, transitions: Array<any>) {
            var result: Array<AlgorithmItemBlockModel> = []; 
            transitions.filter((transition) => { return transition.exit1 === id; }).
                forEach((transition) => {
                    result.push(this.findBlock(transition.iid));
                });
            transitions.filter((transition) => { return transition.exit2 === id; }).
                forEach((transition) => {
                    result.push(this.findBlock(transition.iid));
                });

            return result;
        }

        private _findExitBlocks(id: any, blocks: Array<AlgorithmItemBlockModel>, transitions: Array<any>) {
            var result: Array<AlgorithmItemBlockModel> = [];
            transitions.filter((transition) => { return transition.iid === id; }).
                forEach((transition) => {
                    result.push(this.findBlock(transition.exit1));
                });

            return result;
        }

        private _collectFollowingBlocks(sortResult: Array<AlgorithmItemBlockModel>, filter: (block: AlgorithmItemBlockModel) => boolean, otherThreads: Array<AlgorithmItemBlockModel> = []) {
            var followingBlocks = this.blocks().filter(filter),
                otherThreadsForChild = otherThreads.concat(followingBlocks);
            followingBlocks.forEach((currentBlock) => {
                var currentBlockHasKnownAncestor = currentBlock.prevBlocks().filter((prevBlock) => { return otherThreads.indexOf(prevBlock) !== -1; } ).length !== 0;
                if(sortResult.indexOf(currentBlock) === -1 && !currentBlockHasKnownAncestor) {
                    sortResult.push(currentBlock);
                    otherThreadsForChild.splice(otherThreadsForChild.indexOf(currentBlock), 1);
                    this._collectFollowingBlocks(sortResult, (block) => { return block.prevBlocks().indexOf(currentBlock) !== -1; }, otherThreadsForChild);
                }
            });
        }

        private _sortBlocks() {
            var sortResult: Array<AlgorithmItemBlockModel> = [];
            this._collectFollowingBlocks(sortResult, (block) => { return block.prevBlocks().length === 0; });
            this.blocks(sortResult);
        }

        private _findTransitionsFrom(block: AlgorithmItemBlockModel) {
            return this.transitions().filter((transition) => { return transition.startBlock() === block; });
        }

        private _findTransitionsTo(block: AlgorithmItemBlockModel) {
            return this.transitions().filter((transition) => { return transition.endBlock() === block; });
        }

        private _prepareTransitions() {
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

        constructor(options: any) {
            options.items.forEach((item) => {
                this.blocks.push(new AlgorithmItemBlockModel(item));
            });
            this.blocks().forEach((block) => {
                block.prevBlocks(this._findPrevBlocks(block.id, this.blocks(), options.transitions));
                var exitBlocks = this._findExitBlocks(block.id, this.blocks(), options.transitions);
                block.exitBlocks(exitBlocks);
                exitBlocks.forEach((tempBlock) => { this.transitions.push(new AlgorithmTransition(block, tempBlock)); })
                var exit2BlockTransition = options.transitions.filter((transition) => { return transition.iid === block.id && transition.exit2; })[0];
                if(exit2BlockTransition) {
                    var exit2Block = this.findBlock(exit2BlockTransition.exit2);
                    block.exit2Block(exit2Block);
                    var transition = new AlgorithmTransition(block, exit2Block);
                    transition.label("нет");
                    this.transitions.push(transition);
                }
            });
            this._sortBlocks();
            this.blocks().reduce((posY: number, block) => { block.posY(posY); return posY + block.height() + this.blockMinDistance(); }, 0);
            this._prepareTransitions();
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
        prevBlocks = ko.observableArray<AlgorithmItemBlockModel>();
        exitBlocks = ko.observableArray<AlgorithmItemBlockModel>();
        exit2Block = ko.observable<AlgorithmItemBlockModel>();

        isTerminator = ko.computed(() => { return this.prevBlocks().length === 0 || (this.exitBlocks().length === 0 && !this.exit2Block()); });
        isCondition = ko.computed(() => { return this.exit2Block(); });
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

    ko.bindingHandlers["algorithmView"] = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            return { controlsDescendantBindings: true };
        },
        update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var options = ko.unwrap(valueAccessor());
            var $algorithmTemplate = $("#algorithm-view-template"),
                algorithmViewHolderWidth = ko.observable(500),
                model = new AlgorithmViewModel(ko.unwrap(options.value)),
                childContext = bindingContext.createChildContext(model);

            $(element).children().remove();
            $(element).append($($algorithmTemplate.text()));

            ko.applyBindingsToDescendants(childContext, element);

            var intervalId = setInterval(() => {
                model.containerWidth($(element).find(".algorithm-view-holder").width());
                //console.log(model.containerWidth());
            }, 500);
            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                clearInterval(intervalId);
            });
        }
    };

} 