import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { RotateCcw } from "lucide-react";

interface MobileFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileFilterModal({ isOpen, onClose }: MobileFilterModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-50 flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-72 h-full bg-white overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-300">
          <p className="font-medium">필터</p>
          <button className="flex items-center gap-1">
            <RotateCcw className="w-4 h-4" />
            <p className="font-medium text-sm">전체 초기화</p>
          </button>
        </div>
        <Accordion
          type="single"
          collapsible
          className="flex items-center justify-between border-b border-gray-300"
        >
          <AccordionItem value="item-1" className="w-full h-14">
            <AccordionTrigger className="text-md font-medium px-4">
              장르
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2">
              <div className="flex items-center justify-between h-14 pl-8 pr-5.5 border-b border-gray-300">
                <p className="text-sm">다큐멘터리</p>
                <Checkbox className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between h-14 pl-8 pr-5.5 border-b border-gray-300">
                <p className="text-sm">코미디</p>
                <Checkbox className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between h-14 pl-8 pr-5.5 border-b border-gray-300">
                <p className="text-sm">드라마</p>
                <Checkbox className="w-4 h-4" />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
