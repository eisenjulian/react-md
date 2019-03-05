import React, {
  FunctionComponent,
  HTMLAttributes,
  ReactElement,
  ReactNode,
} from "react";
import cn from "classnames";

import {
  ConditionalPortal,
  IRenderConditionalPortalProps,
} from "@react-md/portal";
import { Omit } from "@react-md/utils";

import { useTooltipState } from "./hooks";
import Tooltip, { ITooltipProps } from "./Tooltip";
import {
  ITooltipConfig,
  MergableTooltipHandlers,
  TooltipPositionOrAuto,
} from "./types.d";

export interface ITooltippedWithTooltip {
  tooltip: ReactNode;
  containerProps: {
    id: string;
    "aria-describedby"?: string;
  } & MergableTooltipHandlers;
}

export type TooltippedChildrenRenderer = (
  props: ITooltippedWithTooltip
) => ReactElement<any>;

export interface ITooltippedProps
  extends Partial<ITooltipConfig>,
    IRenderConditionalPortalProps,
    Omit<ITooltipProps, keyof HTMLAttributes<HTMLSpanElement> | "visible"> {
  /**
   * The id for the element that has a tooltip. This is always required since it will
   * be passed down to the `containerProps` in the children renderer function. It is
   * also used to generate a `tooltipId` when there is a tooltip.
   */
  id: string;

  /**
   * The tooltip to display. When this is false-ish, the children renderer will always
   * return `null` for the `tooltip` prop.
   */
  tooltip?: ReactNode;

  /**
   * An optional id for the tooltip. When this is omitted, it will be set as `${id}-tooltip`.
   */
  tooltipId?: string;

  /**
   * An optional className for the tooltip
   */
  className?: string;

  /**
   * A children renderer function to render the tooltip as well as provide the required
   * container props to dynamically show/hide the tooltip.
   */
  children: TooltippedChildrenRenderer;
}

interface ITooltippedDefaultProps {
  portal: boolean;
  dense: boolean;
  hoverDelay: number;
  focusDelay: number;
  vhMargin: number;
  vwMargin: number;
  spacing: number | string;
  denseSpacing: number | string;
  defaultVisible: boolean;
  defaultPosition: TooltipPositionOrAuto;
}

type TooltippedWithDefaultProps = ITooltippedProps & ITooltippedDefaultProps;

const Tooltipped: FunctionComponent<ITooltippedProps> = providedProps => {
  const props = providedProps as TooltippedWithDefaultProps;
  const {
    id,
    className,
    children,
    tooltip: tooltipChildren,
    vhMargin,
    vwMargin,
    hoverDelay,
    focusDelay,
    spacing,
    denseSpacing,
    defaultVisible,
    defaultPosition,
    portal,
    portalInto,
    portalIntoId,
    ...tooltipProps
  } = props;
  if (!tooltipChildren) {
    return children({ containerProps: { id }, tooltip: null });
  }

  let { tooltipId } = props;
  if (!tooltipId) {
    tooltipId = `${id}-tooltip`;
  }

  const {
    visible,
    position,
    tooltipHandlers,
    containerHandlers,
  } = useTooltipState(props);

  const tooltip = (
    <ConditionalPortal
      portal={portal}
      portalInto={portalInto}
      portalIntoId={portalIntoId}
      visible={visible}
    >
      <Tooltip
        id={tooltipId}
        {...tooltipProps}
        {...tooltipHandlers}
        className={cn(
          { "rmd-tooltip--portal": portal || portalInto || portalIntoId },
          className
        )}
        visible={visible}
        position={position}
      >
        {tooltipChildren}
      </Tooltip>
    </ConditionalPortal>
  );

  return children({
    tooltip,
    containerProps: { id, "aria-describedby": tooltipId, ...containerHandlers },
  });
};

const defaultProps: ITooltippedDefaultProps = {
  portal: false,
  dense: false,
  hoverDelay: 1000,
  focusDelay: 1000,
  vhMargin: 0.32,
  vwMargin: 0.32,
  spacing: "1.5rem",
  denseSpacing: "0.875rem",
  defaultVisible: false,
  defaultPosition: "auto",
};
Tooltipped.defaultProps = defaultProps;

export default Tooltipped;