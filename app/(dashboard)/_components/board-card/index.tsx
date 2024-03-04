"use client";

import Image from "next/image";
import Link from "next/link";

interface BoardCardProps {
    key:string,
    id:string,
    title:string,
    imageUrl:string,
    authorId:string,
    authorName:string,
    createdAt:number,
    orgId:string,
    isFavorite:boolean
}

export const BoardCard = ({
    key,
    id,
    title,
    imageUrl,
    authorId,
    authorName,
    createdAt,
    orgId,
    isFavorite
}:BoardCardProps)=>{
    return(
        <Link href={`/board/${id}`}>
            <div className="group border rounded-lg aspect-[100/127] flex flex-col justify-between overflow-hidden">
                <div className="relative flex-1 bg-amber-50">
                    <Image src={imageUrl} alt="doodle" fill className="object-fit"/>
                </div>
            </div>
        </Link>
    )
}