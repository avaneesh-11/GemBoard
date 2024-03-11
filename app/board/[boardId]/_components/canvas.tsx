"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Info } from "./info";
import { Participants } from "./participants";
import { Toolbar } from "./toolbar";
import { Camera, CanvasMode,CanvasState, Color, LayerType,Point } from "@/types/canvas";
import { useCanRedo, useCanUndo, useHistory,useMutation, useOthersMapped, useStorage } from "@/liveblocks.config";
import { connectionIdToColor, pointerEventToCanvasPoint } from "@/lib/utils";
import { CursorsPresence } from "./cursors-presence";
import { LiveObject } from "@liveblocks/client";
import {nanoid} from "nanoid"
import { LayerPreview } from "./layer-preview";
import { SelectionBox } from "./selection-box";
// import { useSelf } from "@/liveblocks.config";

const MAX_LAYERS=100;

interface CanvasProps{
    boardId:string
}

export const Canvas=({boardId}:CanvasProps)=>{

    const layerIds=useStorage((root)=>root.layerIds)
    const [camera,setCamera]=useState<Camera>({x:0,y:0})

    const history=useHistory();
    const canUndo=useCanUndo();
    const canRedo=useCanRedo();

    const onWheel=useCallback((e:React.WheelEvent)=>{
        setCamera((camera)=>({
            x:camera.x-e.deltaX,
            y:camera.y-e.deltaY
        }))
    },[])

    const onPointerMove=useMutation((
        {setMyPresence},
        e:React.PointerEvent
        )=>{
            e.preventDefault();
            const current=pointerEventToCanvasPoint(e,camera);

            setMyPresence({cursor:current});
        },[])

    const [canvasState,setCanvasState]=useState<CanvasState>({
        mode:CanvasMode.None
    })

    const [lastUsedColor,setLastUsedColor]=useState<Color>({r:0,g:0,b:0})

    const insertLayer = useMutation((
        { storage, setMyPresence },
        layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Text | LayerType.Note,
        position: Point,
      ) => {
        const liveLayers = storage.get("layers");
        if (liveLayers.size >= MAX_LAYERS) {
          return;
        }
    
        const liveLayerIds = storage.get("layerIds");
        const layerId = nanoid();
        const layer = new LiveObject({
          type: layerType,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fill: lastUsedColor,
        });
    
        liveLayerIds.push(layerId);
        liveLayers.set(layerId, layer);
    
        setMyPresence({ selection: [layerId] }, { addToHistory: true });
        setCanvasState({ mode: CanvasMode.None });
      }, [lastUsedColor]);

      const onPointerLeave=useMutation(({setMyPresence})=>{
        setMyPresence({cursor:null})
      },[])

      const onPointerUp=useMutation((
        {},
        e
      )=>{
        const point = pointerEventToCanvasPoint(e,camera);

        if(canvasState.mode===CanvasMode.Inserting){
            insertLayer(canvasState.layerType,point)
        }else{
            setCanvasState({
                mode:CanvasMode.None
            })
        }

        history.resume();
        
      },
      [
        camera,canvasState,insertLayer,history
      ])


      const selections=useOthersMapped((other)=>other.presence.selection);

      const layerIdsToColorSelection=useMemo(()=>{
        const layerIdsToColorSelection:Record<string,string>={};

        for(const user of selections){
            const [connectionId,selection]=user

            for(const layerId of selection){
                layerIdsToColorSelection[layerId]=connectionIdToColor(connectionId)
            }
        }

        return layerIdsToColorSelection;
      },[selections])


      const onPointerDown = useMutation(({self,setMyPresence},e:React.PointerEvent,layerId:string)=>{
        if(canvasState.mode===CanvasMode.Pencil || canvasState.mode===CanvasMode.Inserting){
            return;
        }

        history.pause();
        e.stopPropagation();

        const point=pointerEventToCanvasPoint(e,camera);

        if(!self.presence.selection.includes(layerId)){
            setMyPresence({selection:[layerId]},{addToHistory:true})
        }
        
        setCanvasState({mode:CanvasMode.Translating,current:point})
      },[setCanvasState,history,camera,canvasState.mode])
    

    return(
        <main className="h-full w-full relative bg-neutral-100 touch-none">
            <Info boardId={boardId}/>
            <Participants/>
            <Toolbar
            canvasState={canvasState}
            setCanvasState={setCanvasState}
            canUndo={canUndo}
            canRedo={canRedo}
            undo={history.undo}
            redo={history.redo}
            />
            <svg onWheel={onWheel} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerLeave} className="h-[100vh] w-[100vw]">
                <g style={{transform:`translate(${camera.x}px,${camera.y}px)`}}>
                    {layerIds.map((layerId)=>(
                        <LayerPreview id={layerId} key={layerId} onLayerPointerDown={onPointerDown} selectionColor={layerIdsToColorSelection[layerId]}/>
                    ))}
                    <SelectionBox onResizeHandlePointerDown={()=>{}}/>
                    <CursorsPresence/>
                </g>
            </svg>
        </main>
    )
}