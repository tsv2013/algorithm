/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />
declare module Algorithm {
    interface ITransition {
        iid: any;
        exit1: any;
        exit2: any;
    }
    interface ITransitionLine {
        transition: AlgorithmTransition;
        start: number;
        length: number;
    }
    class AlgorithmViewModel {
        private _blockMappings;
        private _transitionMappings;
        private _MaxId;
        private _collectFollowingBlocks(sortResult, filter, otherThreads?);
        private _sortBlocks();
        private _findTransitionsFrom(block);
        private _findTransitionsTo(block);
        private _isFitToLayoutLine(layoutLine, transitionLine);
        private _prepareTransitions();
        private _updateLayout();
        constructor(options: {
            items: Array<any>;
            transitions: Array<any>;
            blockMappings?: any;
            transitionMappings?: any;
            allowEdit?: boolean;
            addonsTemplate?: string;
        });
        model: {
            items: any[];
            transitions: any[];
        };
        blocks: KnockoutObservableArray<AlgorithmItemBlockModel>;
        transitions: KnockoutObservableArray<AlgorithmTransition>;
        maxLevel: KnockoutObservable<number>;
        blockMinDistance: KnockoutObservable<number>;
        addonsTemplate: KnockoutObservable<string>;
        addonsWidth: KnockoutComputed<number>;
        connectorsAreaWidth: KnockoutComputed<number>;
        containerWidth: KnockoutObservable<number>;
        blockWidth: KnockoutComputed<number>;
        commentWidth: KnockoutComputed<number>;
        findBlock(id: any): AlgorithmItemBlockModel;
        addBlock(block: AlgorithmItemBlockModel, isBefore?: boolean): void;
        removeBlock(block: AlgorithmItemBlockModel): void;
        editBlock(block: AlgorithmItemBlockModel): void;
        currentBlock: KnockoutObservable<AlgorithmItemBlockModel>;
        detailTemplate: string;
        isEditMode: KnockoutObservable<boolean>;
        allowEdit: boolean;
        clickBlock(block: AlgorithmItemBlockModel): void;
        updateTransition(fromBlock: AlgorithmItemBlockModel, toBlock: AlgorithmItemBlockModel, label: string, preserveTransitions?: boolean): void;
        static yesTitle: string;
        static noTitle: string;
        static addBeforeTitle: string;
        static addAfterTitle: string;
        static titleEdit: string;
        static titleRemove: string;
        static connectTitle: string;
        static closeTitle: string;
        addBeforeTitle: string;
        addAfterTitle: string;
        editTitle: string;
        removeTitle: string;
        connectTitle: string;
        yesTitle: string;
        noTitle: string;
    }
    class ItemHolder {
        private _mappings;
        private _item;
        constructor(item: any, mappings?: any);
        item: any;
    }
    class AlgorithmItemBlockModel extends ItemHolder {
        constructor(item: any, mappings?: any);
        id: KnockoutObservable<number>;
        text: KnockoutObservable<string>;
        comment: KnockoutObservable<string>;
        num: KnockoutObservable<number>;
        state: KnockoutObservable<string>;
        isTerminator: KnockoutObservable<boolean>;
        isCondition: KnockoutObservable<boolean>;
        template: KnockoutComputed<string>;
        height: KnockoutObservable<number>;
        posY: KnockoutObservable<number>;
    }
    class AlgorithmTransition extends ItemHolder {
        constructor(startBlock: AlgorithmItemBlockModel, endBlock: AlgorithmItemBlockModel, item: any, mappings?: any);
        transition: ITransition;
        startBlock: KnockoutObservable<AlgorithmItemBlockModel>;
        endBlock: KnockoutObservable<AlgorithmItemBlockModel>;
        type: KnockoutObservable<string>;
        direction: KnockoutObservable<string>;
        level: KnockoutObservable<number>;
        label: KnockoutObservable<{}>;
        template: KnockoutComputed<string>;
    }
}
declare module Algorithm {
}
