import { Shield, Zap, Target, Trophy } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-16 h-16 text-blue-500" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Layer7 Siege
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-8">
            Master Layer 7 security through interactive, gamified simulations
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/scenarios" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Get Started
            </a>
            <a href="/scenarios" className="border border-slate-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors">
              View Scenarios
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <FeatureCard
            icon={<Target className="w-8 h-8" />}
            title="OWASP Top 10"
            description="Learn to detect and block SQLi, XSS, and other common vulnerabilities"
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Bot Mitigation"
            description="Configure fingerprinting and challenge rules against automated bots"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="DDoS Protection"
            description="Implement rate limiting and burst protection for Layer 7 attacks"
          />
          <FeatureCard
            icon={<Trophy className="w-8 h-8" />}
            title="Gamification"
            description="Earn XP, compete on leaderboards, and unlock skill badges"
          />
        </div>

        {/* Security Portfolio Section */}
        <div className="bg-slate-800/50 rounded-xl p-8 mb-16 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Build Your Security Portfolio
          </h2>
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-4">⭐</div>
            <div className="text-lg text-slate-300 mb-4">StarDefense-Perimeter</div>
            <div className="flex gap-8 text-center">
              <div className="bg-slate-700/50 px-6 py-3 rounded-lg">
                <div className="text-blue-400 font-semibold">WAF</div>
              </div>
              <div className="bg-slate-700/50 px-6 py-3 rounded-lg">
                <div className="text-green-400 font-semibold">Bot Mgmt</div>
              </div>
              <div className="bg-slate-700/50 px-6 py-3 rounded-lg">
                <div className="text-purple-400 font-semibold">API Security</div>
              </div>
            </div>
            <div className="text-lg text-slate-300 mt-4 mb-4">Layer 7 Gateway</div>
            <div className="text-lg text-slate-300 mb-4">AWS Cloud</div>
            <div className="flex gap-8 text-center">
              <div className="bg-slate-700/50 px-6 py-3 rounded-lg">
                <div className="text-orange-400 font-semibold">CloudFront</div>
              </div>
              <div className="bg-slate-700/50 px-6 py-3 rounded-lg">
                <div className="text-red-400 font-semibold">WAF</div>
              </div>
              <div className="bg-slate-700/50 px-6 py-3 rounded-lg">
                <div className="text-yellow-400 font-semibold">API Gateway</div>
              </div>
            </div>
            <div className="text-lg text-slate-300 mt-4 mb-4">Application</div>
            <div className="text-lg text-slate-300 mb-4">Telemetry</div>
            <div className="text-lg text-slate-300">Security Dashboard</div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Built with Modern Technologies
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <TechBadge name="Next.js 14" />
            <TechBadge name="TypeScript" />
            <TechBadge name="TailwindCSS" />
            <TechBadge name="Fastify" />
            <TechBadge name="Node.js" />
          </div>
        </div>
      </div>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-colors">
      <div className="text-blue-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  )
}

function TechBadge({ name }: { name: string }) {
  return (
    <div className="bg-slate-700/50 px-4 py-2 rounded-lg text-slate-300 font-medium">
      {name}
    </div>
  )
}
