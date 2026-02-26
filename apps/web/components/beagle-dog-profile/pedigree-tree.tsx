import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PedigreeTreeGeneration<TNode> = {
  generation: number;
  label: ReactNode;
  nodes: TNode[];
};

type PedigreeTreeProps<TNode> = {
  generations: PedigreeTreeGeneration<TNode>[];
  renderNode: (node: TNode) => ReactNode;
  getNodeKey?: (node: TNode, index: number) => string;
  itemHeight?: number;
  itemGap?: number;
  rowMinWidthClassName?: string;
  columnClassName?: string;
  labelClassName?: string;
  nodeStackClassName?: string;
};

export function PedigreeTree<TNode>({
  generations,
  renderNode,
  getNodeKey,
  itemHeight = 72,
  itemGap = 12,
  rowMinWidthClassName = "min-w-[860px]",
  columnClassName = "w-72 shrink-0 space-y-2",
  labelClassName = "text-center text-xs font-semibold",
  nodeStackClassName = "flex flex-col gap-3",
}: PedigreeTreeProps<TNode>) {
  const maxNodesPerGeneration = Math.max(
    ...generations.map((generation) => generation.nodes.length),
    1,
  );
  const columnMinHeight =
    maxNodesPerGeneration * itemHeight + (maxNodesPerGeneration - 1) * itemGap;

  return (
    <div className="overflow-x-auto pb-1">
      <div
        className={cn(
          "flex items-start justify-start gap-4",
          rowMinWidthClassName,
        )}
      >
        {generations.map((generation) => (
          <section key={generation.generation} className={columnClassName}>
            <h3 className={labelClassName}>{generation.label}</h3>
            <div
              className={cn(
                nodeStackClassName,
                generation.nodes.length === 1
                  ? "justify-center"
                  : "justify-evenly",
              )}
              style={{ minHeight: `${columnMinHeight}px` }}
            >
              {generation.nodes.map((node, index) => (
                <Fragment
                  key={
                    getNodeKey?.(node, index) ??
                    `${generation.generation}-${index}`
                  }
                >
                  {renderNode(node)}
                </Fragment>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
