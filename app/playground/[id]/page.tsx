"use client"
import { UsePlayground } from '@/modules/playground/hooks/usePlayground';
import { useParams } from 'next/navigation'
import React from 'react'


const MainPlaygroundPage = () => {
    const { id } = useParams<{ id: string }>();
    const { playgroundData, templateData, isLoading, error, saveTemplateData } = UsePlayground(id);

    console.log("template data ", templateData);
    console.log("playground data ", playgroundData);
    return (
        <div>
            {id}
        </div>
    )
}

export default MainPlaygroundPage
