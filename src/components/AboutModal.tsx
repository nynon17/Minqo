import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ExternalLink, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog, DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";

type AboutModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const AboutModal = ({ open, onOpenChange }: AboutModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="z-[70] bg-foreground/35 backdrop-blur-[1px]" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-[80] w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/80 bg-card p-5 shadow-elevated outline-none sm:w-full sm:p-7",
            "duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
        >
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card">
            <X className="h-4 w-4" />
            <span className="sr-only">Close modal</span>
          </DialogPrimitive.Close>
          <div className="space-y-5 pr-7 sm:space-y-6">
            <DialogTitle className="font-display text-2xl text-foreground sm:text-[1.9rem]">
              About Minqo
            </DialogTitle>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                Minqo is a modern 3D room planner designed for simple and clear interior visualization.
              </DialogDescription>
              <p>
                You can adjust room dimensions, explore the space in 3D, and use different views to plan the layout
                more easily.
              </p>
            </div>
            <footer className="space-y-2 border-t border-border/70 pt-4 text-sm leading-relaxed">
              <p className="text-foreground/90">Created by Szymon Strąk.</p>
              <p className="text-muted-foreground">
                View the project on GitHub:{" "}
                <a
                  href="https://github.com/nynon17/minqo"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary underline-offset-4 transition-colors hover:text-foreground hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                >
                  https://github.com/nynon17/minqo
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </p>
            </footer>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};

export default AboutModal;
