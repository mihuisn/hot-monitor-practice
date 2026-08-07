import { useState } from 'react'
import { Radar, Eye, Search } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { HotTopicsTab } from '@/components/layout/HotTopicsTab'
import { MonitorKeywordsTab } from '@/components/layout/MonitorKeywordsTab'
import { SearchTab } from '@/components/layout/SearchTab'

const tabs = [
  { id: 'radar', label: '热点雷达', icon: Radar },
  { id: 'keywords', label: '监控词', icon: Eye },
  { id: 'search', label: '搜索', icon: Search },
]

function HomePage() {
  const [activeTab, setActiveTab] = useState('radar')

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1 rounded-xl bg-muted p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'radar' && <HotTopicsTab />}
          {activeTab === 'keywords' && <MonitorKeywordsTab />}
          {activeTab === 'search' && <SearchTab />}
        </div>
      </main>
    </div>
  )
}

export default HomePage
