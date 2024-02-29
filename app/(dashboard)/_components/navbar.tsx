"use-clent";

import { UserButton } from "@clerk/nextjs";

export const Navbar=()=>{
    return(
        <div className="flex items-center p-5 gap-x-4 bg-green-500">
            <div className="hidden lg:flex lg:flex-1 bg-yellow-400 p-2">search</div>
            <UserButton/> 
        </div>
    )
}