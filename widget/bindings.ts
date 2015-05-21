/// <reference path="../vendor/dt-jquery/jquery.d.ts" />
/// <reference path="../scripts/typings/knockout/knockout.d.ts" />

module Algorithm {

    ko.bindingHandlers["algorithm"] = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
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
            return { controlsDescendantBindings: true };
        },
        update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        }
    };

    ko.bindingHandlers["algodetails"] = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var model = ko.unwrap<AlgorithmViewModel>(valueAccessor());
            var $element = $(element),
                $algorithmTemplate = $("#algorithm-details-template"),
                childContext = bindingContext.createChildContext(model);

            $(element).children().remove();
            $(element).append($($algorithmTemplate.text()));

            var subscription = model.isEditMode.subscribe(value => {
                var originalBlockRect = { top: model.currentBlock().posY() + 'px', left: model.connectorsAreaWidth() + 'px', height: model.currentBlock().height() + 'px', width: model.blockWidth() + 'px' };
                if(value) {
                    $element.css(originalBlockRect);
                    $element.show();
                    $element.animate({ 'top': '-=' + (model.currentBlock().posY() > 200 ? 200 : model.currentBlock().posY()) + 'px', 'left': '0', 'height': '+=400px', 'width': '100%' });
                }
                else {
                    $element.animate(originalBlockRect, {
                        complete: function() {
                            $element.hide();
                        }
                    });
                }
            });
            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                subscription.dispose();
            });

            ko.applyBindingsToDescendants(childContext, element);
            return { controlsDescendantBindings: true };
        }
    };

    ko.bindingHandlers["draggableblocks"] = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var model = ko.unwrap<AlgorithmViewModel>(valueAccessor()),
                $element = $(element),
                dragEvents = {
                    "dragstart": (ev: JQueryEventObject) => {
                        var originalEvent = <DragEvent>(<any>ev.originalEvent),
                            block = ko.dataFor(originalEvent.target);
                        if(block instanceof AlgorithmItemBlockModel) {
                            var transitionType = $(ev.target).attr('data-transition');
                            originalEvent.dataTransfer.effectAllowed = 'link';
                            originalEvent.dataTransfer.setData('text', JSON.stringify({ 'type': 'AlgorithmItemBlockModel', 'id': (<AlgorithmItemBlockModel>block).id, 'transitionType': transitionType }));
                            //ev.dataTransfer.setDragImage(ev.target, 100, 100);
                            return true;
                        }
                    },
                    "dragover": (ev: JQueryEventObject) => {
                        if(ko.dataFor(ev.target) instanceof AlgorithmItemBlockModel) {
                            ev.preventDefault();
                        }
                    },
                    "drop": (ev: JQueryEventObject) => {
                        var originalEvent = <DragEvent>(<any>ev.originalEvent),
                            targetBlock = ko.dataFor(originalEvent.target);
                        if(targetBlock instanceof AlgorithmItemBlockModel) {
                            var dragDataString = originalEvent.dataTransfer.getData("text");
                            try {
                                var dragData = JSON.parse(dragDataString);
                                if(dragData.type === 'AlgorithmItemBlockModel') {
                                    var sourceBlock = model.findBlock(dragData.id);
                                    if(!!sourceBlock && !!targetBlock) {
                                        model.updateTransition(sourceBlock, targetBlock, dragData.transitionType);
                                        ev.stopPropagation();
                                    }
                                }
                            }
                            catch(ex) { }
                        }
                    }
                };
            $element.bind(dragEvents);
        }
    };

} 