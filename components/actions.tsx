"use-client";

import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
  } from "@/components/ui/dropdown-menu";
  import { useApiMutation } from "@/hooks/use-api-mutation";
  import { api } from "@/convex/_generated/api";
import { Link2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmModal } from "./confirm-model";
import { Button } from "./ui/button";
import { useRenameModal } from "@/store/use-rename-modal";

interface ActionProps {
    children:React.ReactNode,
    side?:DropdownMenuContentProps["side"],
    sideOffset?:DropdownMenuContentProps["sideOffset"],
    id:string,
    title:string
}

export const Actions=({children,side,sideOffset,id,title}:ActionProps)=>{

    const {mutate,pending}=useApiMutation(api.board.remove);
    const {onOpen}=useRenameModal();

    const onCopyLink=()=>{
        navigator.clipboard.writeText(`${window.location.origin}/board/${id}`,).then(()=>toast.success("Link Copied")).catch(()=>toast.error("Fail to copy Link"))
    }

    const onDelete=()=>{
        mutate({id}).then(()=>toast.success("Board Deleted")).catch(()=>toast.error("Fail to delete the board"));
    }

    return(
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent side={side} sideOffset={sideOffset} className="w-60" onClick={(e)=>e.stopPropagation()}>
                <DropdownMenuItem onClick={onCopyLink} className="p-3 cursor-pointer">
                    <Link2 className="h-4 w-4 mr-2"/>
                    Copy Board Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={()=>onOpen(id,title)} className="p-3 cursor-pointer">
                    <Pencil className="h-4 w-4 mr-2"/>
                    Rename
                </DropdownMenuItem>
                <ConfirmModal onConfirm={onDelete} header="Delete board?" description="This will delete the board" disabled={pending}>
                <Button variant="ghost" className="p-3 cursor-pointer text-sm w-full font-normal justify-start">
                    <Trash2 className="h-4 w-4 mr-2"/>
                    Delete
                </Button>
                </ConfirmModal>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}