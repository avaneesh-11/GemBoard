"use client"

import { memo } from "react"

import { useOthersConnectionIds } from "@/liveblocks.config"
import { Cursor } from "./cursor";

export const CursorsPresence=memo(()=>{
    const ids=useOthersConnectionIds();
    return(
        <>
        {ids.map((connectionId)=>(
            <Cursor key={connectionId} connectionId={connectionId}/>
        ))}
        </>
    )
})

CursorsPresence.displayName="Cursors Presence"