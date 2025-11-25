import React from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { getAllPlaygroundForUser } from '@/modules/dashboard/actions'
import { DashboardSidebar } from '@/modules/dashboard/components/DashboardSidebar'
const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
    const playgroundData = await getAllPlaygroundForUser();
    console.log(`playground data : ${playgroundData}`)
    const technologyIconMap: Record<string, string> = {
        REACT: "Zap",
        NEXTJS: "Lightbulb",
        EXPRESS: "Database",
        VUE: "Compass",
        HONO: "FlameIcon",
        ANGULAR: "Terminal",

    }

    const formattedPlaygroundData = playgroundData?.map((item: any) => ({
        id: item.id,
        name: item.title,
        icon: technologyIconMap[item.template] || "Code2",
        starred: item.Starmark?.[0]?.isMarked || false,
    }))
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full  overflow-x-hidden">
                {/* dashboard sidebar */}
                <DashboardSidebar initialPlaygroundData={formattedPlaygroundData || []} />
                {/* dashboard main content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>

        </SidebarProvider>
    )
}


export default DashboardLayout
