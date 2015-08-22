/// <reference path="../vendor/dt-jquery/jquery.d.ts" />
/// <reference path="../scripts/typings/knockout/knockout.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Algorithm;
(function (Algorithm) {
    var AlgorithmViewModel = (function () {
        function AlgorithmViewModel(options) {
            var _this = this;
            this._MaxId = -1;
            this.blocks = ko.observableArray();
            this.transitions = ko.observableArray();
            this.maxLevel = ko.observable(1);
            this.blockMinDistance = ko.observable(20);
            this.connectorsAreaWidth = ko.computed(function () {
                return _this.maxLevel() * _this.blockMinDistance();
            });
            this.containerWidth = ko.observable(500);
            this.blockWidth = ko.computed(function () {
                return (_this.containerWidth() - _this.connectorsAreaWidth()) * 0.6;
            });
            this.commentWidth = ko.computed(function () {
                return _this.containerWidth() - _this.blockWidth() - _this.connectorsAreaWidth();
            });
            this.currentBlock = ko.observable();
            this.detailTemplate = "algorithm-default-details-template";
            this.isEditMode = ko.observable(false);
            this.allowEdit = true;
            this._blockMappings = $.extend(true, {}, {
                id: "id",
                text: "text",
                comment: "comment",
                num: "num",
                state: "state",
                detailTemplate: "algorithm-default-details-template",
                new: function (idVal) {
                    return { id: idVal };
                },
                change: function (kind, object) {
                },
                click: function (block) {
                },
                customEdit: function (block) {
                }
            }, options.blockMappings);
            this.detailTemplate = this._blockMappings.detailTemplate;
            this._transitionMappings = $.extend(true, {}, {
                iid: "iid",
                exit1: "exit1",
                exit2: "exit2",
                new: function (idVal) {
                    return {};
                },
                change: function (kind, object) {
                }
            }, options.transitionMappings);
            this.allowEdit = options.allowEdit !== false;
            options.items.forEach(function (item) {
                var block = new AlgorithmItemBlockModel(item, _this._blockMappings);
                if (block.id() > _this._MaxId) {
                    _this._MaxId = block.id();
                }
                _this.blocks.push(block);
            });
            options.transitions.forEach(function (transition) {
                if (ko.unwrap(transition[_this._transitionMappings.exit1])) {
                    _this.transitions.push(new AlgorithmTransition(_this.findBlock(ko.unwrap(transition[_this._transitionMappings.iid])), _this.findBlock(ko.unwrap(transition[_this._transitionMappings.exit1])), transition, _this._transitionMappings));
                }
                if (ko.unwrap(transition[_this._transitionMappings.exit2])) {
                    var newTransition = new AlgorithmTransition(_this.findBlock(ko.unwrap(transition[_this._transitionMappings.iid])), _this.findBlock(ko.unwrap(transition[_this._transitionMappings.exit2])), transition, _this._transitionMappings);
                    newTransition.label(_this.noTitle);
                    _this.transitions.push(newTransition);
                }
            });
            this._sortBlocks();
            this._updateLayout();
            this.blocks.subscribe(function (changes) {
                changes.forEach(function (change) { return _this._blockMappings.change(change.status, change.value); });
            }, null, "arrayChange");
            this.transitions.subscribe(function (changes) {
                changes.forEach(function (change) { return _this._transitionMappings.change(change.status, change.value); });
            }, null, "arrayChange");
            this.isEditMode.subscribe(function (newValue) {
                if (!newValue) {
                    _this._blockMappings.change("edit", _this.currentBlock());
                }
            });
        }
        AlgorithmViewModel.prototype._collectFollowingBlocks = function (sortResult, filter, otherThreads) {
            var _this = this;
            if (otherThreads === void 0) { otherThreads = []; }
            var followingBlocks = this.blocks().filter(filter), otherThreadsForChild = otherThreads.concat(followingBlocks);
            followingBlocks.forEach(function (currentBlock) {
                var currentBlockHasKnownAncestor = _this._findTransitionsTo(currentBlock).filter(function (transitionTo) {
                    return otherThreads.indexOf(transitionTo.startBlock()) !== -1;
                }).length !== 0;
                if (sortResult.indexOf(currentBlock) === -1 && !currentBlockHasKnownAncestor) {
                    sortResult.push(currentBlock);
                    otherThreadsForChild.splice(otherThreadsForChild.indexOf(currentBlock), 1);
                    _this._collectFollowingBlocks(sortResult, function (block) {
                        return _this._findTransitionsTo(block).filter(function (transitionTo) {
                            return transitionTo.startBlock() === currentBlock;
                        }).length !== 0;
                    }, otherThreadsForChild);
                }
            });
        };
        AlgorithmViewModel.prototype._sortBlocks = function () {
            var _this = this;
            var sortResult = [];
            this._collectFollowingBlocks(sortResult, function (block) {
                return _this._findTransitionsTo(block).length === 0;
            });
            this.blocks(sortResult);
        };
        AlgorithmViewModel.prototype._findTransitionsFrom = function (block) {
            return this.transitions().filter(function (transition) {
                return transition.startBlock() === block;
            });
        };
        AlgorithmViewModel.prototype._findTransitionsTo = function (block) {
            return this.transitions().filter(function (transition) {
                return transition.endBlock() === block;
            });
        };
        AlgorithmViewModel.prototype._isFitToLayoutLine = function (layoutLine, transitionLine) {
            var result = true;
            layoutLine.forEach(function (tl) {
                if (result) {
                    if (tl.start > transitionLine.start) {
                        result = transitionLine.start + transitionLine.length <= tl.start;
                    }
                    else {
                        result = tl.start + tl.length <= transitionLine.start;
                    }
                }
            });
            return result;
        };
        AlgorithmViewModel.prototype._prepareTransitions = function () {
            var _this = this;
            var farTransitionLines = [];
            var loopTransitions = [];
            this.transitions().forEach(function (transition) {
                if (transition.startBlock() === transition.endBlock()) {
                    loopTransitions.push(transition);
                }
                else {
                    transition.level(1);
                    var startIndex = _this.blocks().indexOf(transition.startBlock());
                    var endIndex = _this.blocks().indexOf(transition.endBlock());
                    if (endIndex - startIndex === 1) {
                        transition.type("direct");
                    }
                    else {
                        transition.type("far");
                        if (endIndex > startIndex) {
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
            loopTransitions.forEach(function (transition) {
                _this.transitions.remove(transition);
            });
            farTransitionLines.sort(function (t1, t2) {
                return t1.length - t2.length;
            });
            var layoutLines = [];
            while (farTransitionLines.length > 0) {
                var fitToLine = false;
                layoutLines.forEach(function (layoutLine, index) {
                    if (!fitToLine && _this._isFitToLayoutLine(layoutLine, farTransitionLines[0])) {
                        var transitionLineToPush = farTransitionLines.splice(0, 1)[0];
                        transitionLineToPush.transition.level(index + 1);
                        layoutLine.push(transitionLineToPush);
                        fitToLine = true;
                    }
                });
                if (!fitToLine) {
                    layoutLines.push([]);
                }
            }
            this.maxLevel(layoutLines.length + 1);
        };
        AlgorithmViewModel.prototype._updateLayout = function () {
            var _this = this;
            this.blocks().reduce(function (posY, block) {
                var isStart = _this._findTransitionsTo(block).length === 0;
                var isEnd = _this._findTransitionsFrom(block).length === 0;
                block.isTerminator(isStart || isEnd);
                block.isCondition(_this._findTransitionsFrom(block).filter(function (transition) { return transition.label() === _this.noTitle; }).length !== 0);
                block.posY(posY);
                return posY + block.height() + _this.blockMinDistance();
            }, 0);
            this._prepareTransitions();
        };
        Object.defineProperty(AlgorithmViewModel.prototype, "model", {
            get: function () {
                var model = { items: [], transitions: [] };
                this.blocks().forEach(function (block) { return model.items.push(block.item); });
                this.transitions().forEach(function (transition) { return model.transitions.push(transition.transition); });
                return model;
            },
            enumerable: true,
            configurable: true
        });
        AlgorithmViewModel.prototype.findBlock = function (id) {
            return this.blocks().filter(function (block) {
                return block.id() === id;
            })[0];
        };
        AlgorithmViewModel.prototype.addBlock = function (block, isBefore) {
            var _this = this;
            if (isBefore === void 0) { isBefore = false; }
            var newBlock = new AlgorithmItemBlockModel(this._blockMappings.new(++this._MaxId), this._blockMappings);
            this.blocks.splice(this.blocks().indexOf(block) + (isBefore ? 0 : 1), 0, newBlock);
            if (isBefore) {
                this._findTransitionsTo(block).forEach(function (transition) {
                    transition.endBlock(newBlock);
                    _this._transitionMappings.change("edit", transition);
                });
                this.transitions.push(new AlgorithmTransition(newBlock, block, this._transitionMappings.new(++this._MaxId), this._transitionMappings));
            }
            else {
                this._findTransitionsFrom(block).forEach(function (transition) {
                    transition.startBlock(newBlock);
                    _this._transitionMappings.change("edit", transition);
                });
                this.transitions.push(new AlgorithmTransition(block, newBlock, this._transitionMappings.new(++this._MaxId), this._transitionMappings));
            }
            this._updateLayout();
        };
        AlgorithmViewModel.prototype.removeBlock = function (block) {
            var _this = this;
            this._findTransitionsTo(block).forEach(function (transition) {
                _this._findTransitionsFrom(block).forEach(function (transitionFrom) {
                    transition.endBlock(transitionFrom.endBlock());
                    _this._transitionMappings.change("edit", transition);
                });
            });
            this._findTransitionsFrom(block).forEach(function (transition) {
                _this.transitions.remove(transition);
            });
            this.blocks.remove(block);
            this._updateLayout();
        };
        AlgorithmViewModel.prototype.editBlock = function (block) {
            this.currentBlock(block);
            if (!this._blockMappings.customEdit(block)) {
                this.isEditMode(!this.isEditMode());
            }
        };
        AlgorithmViewModel.prototype.clickBlock = function (block) {
            this._blockMappings.click(block);
        };
        AlgorithmViewModel.prototype.updateTransition = function (fromBlock, toBlock, label, preserveTransitions) {
            if (preserveTransitions === void 0) { preserveTransitions = false; }
            var fromTransitions = this._findTransitionsFrom(fromBlock).filter(function (transition) { return transition.label() === label; });
            if (preserveTransitions) {
                if (fromTransitions.filter(function (transition) { return transition.endBlock() === toBlock; }).length === 0) {
                    var newTransition = new AlgorithmTransition(fromBlock, toBlock, this._transitionMappings.new(++this._MaxId), this._transitionMappings);
                    newTransition.label(label);
                    this.transitions.push(newTransition);
                }
            }
            else {
                if (fromTransitions.length === 0) {
                    var newTransition = new AlgorithmTransition(fromBlock, toBlock, this._transitionMappings.new(++this._MaxId), this._transitionMappings);
                    newTransition.label(label);
                    this.transitions.push(newTransition);
                }
                else {
                    fromTransitions[0].endBlock(toBlock);
                    this._transitionMappings.change("edit", fromTransitions[0]);
                    for (var i = 1; i < fromTransitions.length; i++) {
                        this.transitions.remove(fromTransitions[i]);
                    }
                }
            }
            this._updateLayout();
        };
        Object.defineProperty(AlgorithmViewModel.prototype, "addBeforeTitle", {
            get: function () {
                return AlgorithmViewModel.addBeforeTitle;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AlgorithmViewModel.prototype, "addAfterTitle", {
            get: function () {
                return AlgorithmViewModel.addAfterTitle;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AlgorithmViewModel.prototype, "editTitle", {
            get: function () {
                return AlgorithmViewModel.titleEdit;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AlgorithmViewModel.prototype, "removeTitle", {
            get: function () {
                return AlgorithmViewModel.titleRemove;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AlgorithmViewModel.prototype, "connectTitle", {
            get: function () {
                return AlgorithmViewModel.connectTitle;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AlgorithmViewModel.prototype, "yesTitle", {
            get: function () {
                return AlgorithmViewModel.yesTitle;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AlgorithmViewModel.prototype, "noTitle", {
            get: function () {
                return AlgorithmViewModel.noTitle;
            },
            enumerable: true,
            configurable: true
        });
        AlgorithmViewModel.yesTitle = "yes";
        AlgorithmViewModel.noTitle = "no";
        AlgorithmViewModel.addBeforeTitle = "Add block before";
        AlgorithmViewModel.addAfterTitle = "Add block after";
        AlgorithmViewModel.titleEdit = "Edit block";
        AlgorithmViewModel.titleRemove = "Remove block";
        AlgorithmViewModel.connectTitle = "Drag to connect to...";
        AlgorithmViewModel.closeTitle = "Close";
        return AlgorithmViewModel;
    })();
    Algorithm.AlgorithmViewModel = AlgorithmViewModel;
    var ItemHolder = (function () {
        function ItemHolder(item, mappings) {
            var _this = this;
            this._mappings = $.extend({}, mappings);
            this._item = item;
            $.each(this._mappings, function (name, value) {
                var _innerName = "_" + name;
                _this[_innerName] = ko.isObservable(_this._item[value]) ? _this._item[value] : ko.observable(_this._item[value]);
                _this[name] = ko.computed({
                    read: function () {
                        return _this[_innerName]();
                    },
                    write: function (val) {
                        _this[_innerName](val);
                        if (!ko.isObservable(_this._item[value])) {
                            _this._item[value] = val;
                        }
                    }
                });
            });
        }
        Object.defineProperty(ItemHolder.prototype, "item", {
            get: function () {
                return this._item;
            },
            enumerable: true,
            configurable: true
        });
        return ItemHolder;
    })();
    Algorithm.ItemHolder = ItemHolder;
    var AlgorithmItemBlockModel = (function (_super) {
        __extends(AlgorithmItemBlockModel, _super);
        function AlgorithmItemBlockModel(item, mappings) {
            var _this = this;
            _super.call(this, item, mappings || {
                id: "id",
                text: "text",
                comment: "comment",
                num: "num",
                state: "state"
            });
            this.isTerminator = ko.observable(false);
            this.isCondition = ko.observable(false);
            this.template = ko.computed(function () {
                return _this.isCondition() ? "algorithm-block-condition-template" : "algorithm-block-item-template";
            });
            this.height = ko.observable(50);
            this.posY = ko.observable(0);
        }
        return AlgorithmItemBlockModel;
    })(ItemHolder);
    Algorithm.AlgorithmItemBlockModel = AlgorithmItemBlockModel;
    var AlgorithmTransition = (function (_super) {
        __extends(AlgorithmTransition, _super);
        function AlgorithmTransition(startBlock, endBlock, item, mappings) {
            var _this = this;
            _super.call(this, item, mappings || {
                iid: "iid",
                exit1: "exit1",
                exit2: "exit2"
            });
            this.startBlock = ko.observable();
            this.endBlock = ko.observable();
            this.type = ko.observable("direct");
            this.direction = ko.observable("down");
            this.level = ko.observable(1);
            this.label = ko.observable();
            this.template = ko.computed(function () {
                if (_this.type() !== "direct") {
                    return _this.direction() === "down" ? "algorithm-tr-far-down-template" : "algorithm-tr-far-up-template";
                }
                return "algorithm-tr-direct-template";
            });
            this.startBlock(startBlock);
            this.endBlock(endBlock);
        }
        Object.defineProperty(AlgorithmTransition.prototype, "transition", {
            get: function () {
                if (this.label() !== AlgorithmViewModel.noTitle) {
                    return { iid: this.startBlock().id(), exit1: this.endBlock().id(), exit2: undefined };
                }
                else {
                    return { iid: this.startBlock().id(), exit1: undefined, exit2: this.endBlock().id() };
                }
            },
            enumerable: true,
            configurable: true
        });
        return AlgorithmTransition;
    })(ItemHolder);
    Algorithm.AlgorithmTransition = AlgorithmTransition;
})(Algorithm || (Algorithm = {}));
/// <reference path="../vendor/dt-jquery/jquery.d.ts" />
/// <reference path="../scripts/typings/knockout/knockout.d.ts" />
var Algorithm;
(function (Algorithm) {
    ko.bindingHandlers["algorithm"] = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var options = ko.unwrap(valueAccessor());
            var $algorithmTemplate = $("#algorithm-view-template"), algorithmViewHolderWidth = ko.observable(500), model = ko.observable(new Algorithm.AlgorithmViewModel(ko.unwrap(options.value))), valueSubscription, childContext = bindingContext.createChildContext(model);
            if (ko.isSubscribable(options.value)) {
                valueSubscription = options.value.subscribe(function (newAlgorithm) { return model(new Algorithm.AlgorithmViewModel(newAlgorithm)); });
            }
            $(element).children().remove();
            $(element).append($($algorithmTemplate.text()));
            ko.applyBindingsToDescendants(childContext, element);
            var intervalId = setInterval(function () {
                model().containerWidth($(element).find(".algorithm-view-holder").width());
                //console.log(model.containerWidth());
            }, 500);
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                clearInterval(intervalId);
                if (valueSubscription) {
                    valueSubscription.dispose();
                }
            });
            return { controlsDescendantBindings: true };
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        }
    };
    ko.bindingHandlers["algodetails"] = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var model = ko.unwrap(valueAccessor());
            var $element = $(element), $algorithmTemplate = $("#algorithm-details-template"), childContext = bindingContext.createChildContext(model);
            $(element).children().remove();
            $(element).append($($algorithmTemplate.text()));
            var subscription = model.isEditMode.subscribe(function (value) {
                var originalBlockRect = { top: model.currentBlock().posY() + 'px', left: model.connectorsAreaWidth() + 'px', height: model.currentBlock().height() + 'px', width: model.blockWidth() + 'px' };
                if (value) {
                    $element.css(originalBlockRect);
                    $element.show();
                    $element.animate({ 'top': '-=' + (model.currentBlock().posY() > 200 ? 200 : model.currentBlock().posY()) + 'px', 'left': '0', 'height': '+=400px', 'width': '100%' });
                }
                else {
                    $element.animate(originalBlockRect, {
                        complete: function () {
                            $element.hide();
                        }
                    });
                }
            });
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                subscription.dispose();
            });
            ko.applyBindingsToDescendants(childContext, element);
            return { controlsDescendantBindings: true };
        }
    };
    ko.bindingHandlers["draggableblocks"] = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var model = ko.unwrap(valueAccessor()), $element = $(element), dragEvents = {
                "dragstart": function (ev) {
                    var originalEvent = ev.originalEvent, block = ko.dataFor(originalEvent.target);
                    if (block instanceof Algorithm.AlgorithmItemBlockModel) {
                        var transitionType = $(ev.target).attr('data-transition');
                        originalEvent.dataTransfer.effectAllowed = 'link';
                        originalEvent.dataTransfer.setData('text', JSON.stringify({ 'type': 'AlgorithmItemBlockModel', 'id': block.id(), 'transitionType': transitionType }));
                        //ev.dataTransfer.setDragImage(ev.target, 100, 100);
                        return true;
                    }
                },
                "dragover": function (ev) {
                    if (ko.dataFor(ev.target) instanceof Algorithm.AlgorithmItemBlockModel) {
                        ev.preventDefault();
                    }
                },
                "drop": function (ev) {
                    var originalEvent = ev.originalEvent, targetBlock = ko.dataFor(originalEvent.target);
                    if (targetBlock instanceof Algorithm.AlgorithmItemBlockModel) {
                        var dragDataString = originalEvent.dataTransfer.getData("text");
                        try {
                            var dragData = JSON.parse(dragDataString);
                            if (dragData.type === 'AlgorithmItemBlockModel') {
                                var sourceBlock = model.findBlock(dragData.id);
                                if (!!sourceBlock && !!targetBlock) {
                                    model.updateTransition(sourceBlock, targetBlock, dragData.transitionType, ev.ctrlKey);
                                    ev.stopPropagation();
                                }
                            }
                        }
                        catch (ex) {
                        }
                    }
                }
            };
            $element.bind(dragEvents);
        }
    };
})(Algorithm || (Algorithm = {}));
//# sourceMappingURL=algorithm.js.map