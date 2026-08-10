import * as React from "react"
import {
  composeRenderProps,
  Switch as SwitchPrimitive,
} from "react-aria-components"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive>) {
  return (
    <SwitchPrimitive
      data-slot="switch"
      className={composeRenderProps(className, (className) =>
        cn(
          "group relative inline-flex h-[1.15rem] w-8 shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-sm transition-all outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[selected]:bg-primary data-[unselected]:bg-input dark:data-[unselected]:bg-input/80",
          className
        )
      )}
      {...props}
    >
      <span className="relative mx-1.5 my-1 block size-3 shrink-0 rounded-full bg-foreground shadow-md transition-transform duration-200 rtl:-translate-x-100% group-data-[selected]:translate-x-full rtl:group-data-[selected]:translate-x-[-100%] group-data-[selected]:bg-primary-foreground pointer-events-none" />
    </SwitchPrimitive>
  )
}

export { Switch }
