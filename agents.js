// agents.js — Agent Definitions, Mock Responses, Quick Actions

const AgentDefs = [
  {
    id: 'website-builder',
    name: 'Website Builder',
    icon: '🌐',
    description: 'Builds and manages business websites',
    status: 'active',
    lastAction: 'Deployed landing page v2.4',
    lastActionTime: '2 min ago',
    model: 'claude-3.5-sonnet',
    quickActions: ['New Site', 'Edit Template', 'Preview', 'Deploy'],
    initialSessionTitle: 'Landing Page Redesign',
    initialMemory: [
      { id: 'wm1', key: 'Primary Domain', value: 'techflow.io', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { id: 'wm2', key: 'Tech Stack', value: 'Next.js 14, Tailwind, Vercel', timestamp: new Date(Date.now() - 172800000).toISOString() },
      { id: 'wm3', key: 'Brand Colors', value: '#0066FF primary, #1A1A2E dark, #F5F5F7 light', timestamp: new Date(Date.now() - 259200000).toISOString() },
    ],
    initialConversation: [
      { role: 'user', content: 'I need a new landing page for our SaaS product. Modern, clean, with a hero section, features grid, pricing, and testimonials.' },
      { role: 'assistant', content: "I'll create a modern landing page for TechFlow. Here's my plan:\n\n**Structure:**\n1. **Hero Section** — Bold headline, subtext, CTA buttons, product screenshot\n2. **Logo Bar** — Trusted by 500+ companies\n3. **Features Grid** — 6 key features with icons\n4. **Pricing** — 3-tier pricing table\n5. **Testimonials** — Carousel with photos\n6. **CTA** — Final conversion section\n\n**Design Direction:**\n- Clean, Swiss-inspired layout\n- Inter for body, plus a display font for headlines\n- Primary blue (#0066FF) with neutral surfaces\n- Generous whitespace, subtle animations\n\nI've started building. The hero section is ready for preview. Shall I continue with the full page?" },
      { role: 'user', content: 'Looks great! Yes, continue with the full page. Make sure the pricing section highlights the Pro plan.' },
      { role: 'assistant', content: "Done! The full landing page is ready. Here's what I built:\n\n| Section | Status |\n|---------|--------|\n| Hero | ✅ Complete |\n| Logo Bar | ✅ 8 company logos |\n| Features | ✅ 6 features with icons |\n| Pricing | ✅ Pro plan highlighted |\n| Testimonials | ✅ 4 reviews |\n| Footer | ✅ Complete |\n\n**Performance:** Lighthouse score 98/100. Page load: 1.2s.\n\nThe Pro plan card has a \"Most Popular\" badge and a subtle glow effect. I also added:\n- Smooth scroll between sections\n- Mobile-responsive down to 375px\n- Dark mode toggle\n\nReady to deploy to techflow.io?" }
    ]
  },
  {
    id: 'app-builder',
    name: 'App Builder',
    icon: '📱',
    description: 'Creates web and mobile applications',
    status: 'idle',
    lastAction: 'Build failed: auth module conflict',
    lastActionTime: '1 hr ago',
    model: 'gpt-4o',
    quickActions: ['New App', 'Add Feature', 'Debug', 'Build'],
    initialSessionTitle: 'Customer Portal MVP',
    initialMemory: [
      { id: 'am1', key: 'Current Project', value: 'Customer portal with React + Supabase', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { id: 'am2', key: 'Auth Provider', value: 'Supabase Auth with Google OAuth', timestamp: new Date(Date.now() - 172800000).toISOString() },
    ],
    initialConversation: [
      { role: 'user', content: 'Set up a customer portal where users can track their orders, manage their account, and submit support tickets.' },
      { role: 'assistant', content: "I'll build a customer portal with these features:\n\n**Core Modules:**\n- 🔐 **Authentication** — Email/password + Google OAuth via Supabase\n- 📦 **Order Tracking** — List view with status filters, detail view with timeline\n- 👤 **Account Management** — Profile edit, password change, notification prefs\n- 🎫 **Support Tickets** — Create, view, reply to tickets with file attachments\n\n**Tech Stack:**\n- React 18 with TypeScript\n- Supabase (auth + database + storage)\n- Tailwind CSS + shadcn/ui\n- React Router v6\n\nStarting with the auth flow and dashboard layout. I'll have the login/signup working in a few minutes." },
      { role: 'user', content: 'Add a notifications system too — email and in-app notifications for order status changes.' },
      { role: 'assistant', content: "Added notifications system:\n\n**In-App Notifications:**\n- Bell icon in header with unread count badge\n- Dropdown panel showing recent notifications\n- Mark as read/unread, mark all as read\n- Categories: Orders, Support, Account, System\n\n**Email Notifications (via Supabase Edge Functions):**\n- Order shipped / delivered / delayed\n- Support ticket response\n- Account security alerts\n\n**Database schema updated:**\n```sql\nCREATE TABLE notifications (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  user_id UUID REFERENCES auth.users(id),\n  type TEXT NOT NULL,\n  title TEXT NOT NULL,\n  body TEXT,\n  read BOOLEAN DEFAULT FALSE,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);\n```\n\nThe notification bell is live in the header. Want me to set up the email triggers next?" }
    ]
  },
  {
    id: 'seo',
    name: 'SEO Agent',
    icon: '🔍',
    description: 'Runs SEO audits, keyword research, optimization',
    status: 'active',
    lastAction: 'Completed audit for techflow.io',
    lastActionTime: '2 min ago',
    model: 'claude-3.5-sonnet',
    quickActions: ['Run Audit', 'Keyword Research', 'Check Rankings', 'Optimize Page'],
    initialSessionTitle: 'SEO Audit — techflow.io',
    initialMemory: [
      { id: 'sm1', key: 'Target Domain', value: 'techflow.io', timestamp: new Date(Date.now() - 43200000).toISOString() },
      { id: 'sm2', key: 'Top Keyword', value: '"workflow automation" — Position 7, Volume 8.1K', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { id: 'sm3', key: 'DA Score', value: '42 (up from 38 last month)', timestamp: new Date(Date.now() - 172800000).toISOString() },
    ],
    initialConversation: [
      { role: 'user', content: 'Run a full SEO audit on techflow.io' },
      { role: 'assistant', content: "I've completed a comprehensive SEO audit on **techflow.io**. Here are the results:\n\n### Overall Score: 78/100 ⬆️ (+5 from last audit)\n\n| Category | Score | Status |\n|----------|-------|--------|\n| Technical SEO | 85/100 | ✅ Good |\n| On-Page SEO | 72/100 | ⚠️ Needs work |\n| Content Quality | 80/100 | ✅ Good |\n| Backlink Profile | 68/100 | ⚠️ Needs work |\n| Page Speed | 92/100 | ✅ Excellent |\n| Mobile UX | 88/100 | ✅ Good |\n\n### Critical Issues (3)\n1. **Missing H1 tags** on 4 pages (/pricing, /about, /blog/page/2, /careers)\n2. **Duplicate meta descriptions** on 7 blog posts\n3. **Broken internal links** — 12 404 errors found\n\n### Opportunities\n- Add structured data (FAQ, Product) to key pages — could increase CTR by 15-30%\n- \"Workflow automation\" keyword is at position 7 — with content optimization, achievable to reach top 3\n- 23 pages have thin content (<300 words) — consolidate or expand\n\nShall I fix the critical issues first, or start on keyword optimization?" }
    ]
  },
  {
    id: 'backlink',
    name: 'Backlink Agent',
    icon: '🔗',
    description: 'Builds and manages backlink strategies',
    status: 'active',
    lastAction: 'Found 23 new opportunities (DA 40+)',
    lastActionTime: '25 min ago',
    model: 'gpt-4o',
    quickActions: ['Find Opportunities', 'Check Links', 'Outreach', 'Analyze Competitors'],
    initialSessionTitle: 'Link Building Campaign Q1',
    initialMemory: [
      { id: 'bm1', key: 'Total Backlinks', value: '1,247 from 312 referring domains', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { id: 'bm2', key: 'Top Referring Domain', value: 'producthunt.com (DA 91)', timestamp: new Date(Date.now() - 172800000).toISOString() },
    ],
    initialConversation: [
      { role: 'user', content: 'Find new backlink opportunities for techflow.io. Focus on high DA sites in the SaaS/productivity space.' },
      { role: 'assistant', content: "I analyzed competitor backlink profiles and found **23 high-quality opportunities** (DA 40+):\n\n### Top Opportunities\n| Site | DA | Type | Difficulty |\n|------|-----|------|------------|\n| zapier.com/blog | 91 | Guest Post | Hard |\n| saastr.com | 78 | Resource Page | Medium |\n| capterra.com | 88 | Review Listing | Easy |\n| betterbuys.com | 62 | Comparison Article | Medium |\n| g2.com | 92 | Product Profile | Easy |\n\n### Strategy Breakdown\n- **8 guest post** opportunities (avg DA 65)\n- **6 resource page** insertions (avg DA 58)\n- **5 broken link** replacements (avg DA 52)\n- **4 review/listing** sites (avg DA 74)\n\nI've drafted outreach templates for each type. Shall I start the email outreach campaign?" }
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing Agent',
    icon: '📣',
    description: 'Runs marketing campaigns across channels',
    status: 'active',
    lastAction: 'A/B test results: Variant B +18% CTR',
    lastActionTime: '50 min ago',
    model: 'claude-3.5-sonnet',
    quickActions: ['New Campaign', 'A/B Test', 'Analytics', 'Schedule Post'],
    initialSessionTitle: 'Q1 Growth Campaign',
    initialMemory: [
      { id: 'mm1', key: 'Monthly Ad Budget', value: '$12,000 across Google Ads, Meta, LinkedIn', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { id: 'mm2', key: 'Best Performing Channel', value: 'LinkedIn Ads — $4.20 CPA, 3.2% CTR', timestamp: new Date(Date.now() - 172800000).toISOString() },
    ],
    initialConversation: [
      { role: 'user', content: 'Plan a product launch campaign for our new AI features. Budget is $15K for the first month.' },
      { role: 'assistant', content: "Here's the **AI Features Launch Campaign** plan:\n\n### Budget Allocation ($15,000)\n- **LinkedIn Ads:** $5,000 (33%) — B2B targeting, decision makers\n- **Google Ads:** $4,000 (27%) — Search + display retargeting\n- **Content/PR:** $3,000 (20%) — Sponsored posts, ProductHunt launch\n- **Email Marketing:** $1,500 (10%) — List activation, drip campaigns\n- **Social Organic:** $1,500 (10%) — Twitter/LinkedIn organic, community\n\n### Timeline\n- **Week 1:** Teaser campaign, waitlist, influencer seeding\n- **Week 2:** Launch day — ProductHunt, press release, email blast\n- **Week 3-4:** Retargeting, case studies, user testimonials\n\n### KPI Targets\n- 500 signups in first week\n- $8 average CPA\n- 25% email open rate on launch sequence\n- 10 press mentions\n\nShall I create the ad creatives and copy first?" }
    ]
  },
  {
    id: 'lead-gen',
    name: 'Lead Gen Agent',
    icon: '🎯',
    description: 'Builds and runs lead generation machines',
    status: 'active',
    lastAction: 'Enriched 156 new leads',
    lastActionTime: '12 min ago',
    model: 'gpt-4o',
    quickActions: ['Build List', 'Enrich Data', 'Score Leads', 'Export'],
    initialSessionTitle: 'Enterprise Lead Pipeline',
    initialMemory: [
      { id: 'lm1', key: 'ICP', value: 'B2B SaaS, 50-500 employees, Series A-C, US/EU', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { id: 'lm2', key: 'Total Leads in DB', value: '4,723 contacts, 892 companies', timestamp: new Date(Date.now() - 43200000).toISOString() },
    ],
    initialConversation: [
      { role: 'user', content: 'Build a list of VP-level contacts at SaaS companies with 100-500 employees that recently raised Series B funding.' },
      { role: 'assistant', content: "I've built a targeted lead list matching your criteria:\n\n### Results: 156 Contacts Found\n\n**Filters Applied:**\n- Title: VP of Operations, VP of Engineering, VP of Product\n- Company size: 100-500 employees\n- Industry: SaaS / B2B Software\n- Funding: Series B (last 6 months)\n- Geography: US & EU\n\n### Summary\n| Metric | Count |\n|--------|-------|\n| Total contacts | 156 |\n| Verified emails | 142 (91%) |\n| With phone | 89 (57%) |\n| Companies | 67 |\n| Avg company size | 230 employees |\n\n### Lead Scoring\n- 🟢 **Hot (score 80+):** 34 leads — match all criteria, recent activity\n- 🟡 **Warm (score 50-79):** 78 leads — partial match\n- 🔴 **Cold (score <50):** 44 leads — lower intent signals\n\nReady to export to CRM or start an outreach sequence?" }
    ]
  },
  {
    id: 'back-office',
    name: 'Back Office Agent',
    icon: '🏢',
    description: 'Handles accounting, invoicing, HR, ops',
    status: 'active',
    lastAction: 'Processed 12 invoices ($34,200)',
    lastActionTime: '1 hr ago',
    model: 'claude-3.5-sonnet',
    quickActions: ['Invoice', 'Expense Report', 'HR Task', 'Process Payment'],
    initialSessionTitle: 'Monthly Invoicing — Feb 2026',
    initialMemory: [
      { id: 'om1', key: 'Accounting Software', value: 'QuickBooks Online + Stripe billing', timestamp: new Date(Date.now() - 172800000).toISOString() },
      { id: 'om2', key: 'Payroll Schedule', value: 'Bi-weekly, 23 employees', timestamp: new Date(Date.now() - 259200000).toISOString() },
    ],
    initialConversation: [
      { role: 'user', content: 'Generate invoices for all active clients for February 2026.' },
      { role: 'assistant', content: "I've generated February 2026 invoices for all active clients:\n\n### Invoice Summary\n| Client | Amount | Status |\n|--------|--------|--------|\n| Acme Corp | $8,500 | ✅ Sent |\n| DataSync Inc | $4,200 | ✅ Sent |\n| CloudNine | $6,800 | ✅ Sent |\n| BrightPath | $3,200 | ✅ Sent |\n| VeloTech | $5,500 | ⏳ Pending approval |\n| OmniStack | $6,000 | ✅ Sent |\n\n**Total invoiced:** $34,200\n**Sent:** 5 of 6 | **Pending:** 1\n\nAll invoices synced to QuickBooks and payment links generated via Stripe. VeloTech invoice needs approval for the custom scope addition ($1,200 above contract).\n\nShall I follow up on the VeloTech approval?" }
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics Agent',
    icon: '📊',
    description: 'Tracks KPIs, reports, business intelligence',
    status: 'active',
    lastAction: 'Generated weekly KPI report',
    lastActionTime: '15 min ago',
    model: 'gpt-4o',
    quickActions: ['Generate Report', 'KPI Dashboard', 'Forecast', 'Export Data'],
    initialSessionTitle: 'Weekly Performance Review',
    initialMemory: [
      { id: 'anm1', key: 'Primary KPIs', value: 'MRR, CAC, LTV, Churn Rate, NPS', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { id: 'anm2', key: 'Current MRR', value: '$127,400 (+8.3% MoM)', timestamp: new Date(Date.now() - 43200000).toISOString() },
    ],
    initialConversation: [
      { role: 'user', content: 'Generate the weekly KPI report for the executive team.' },
      { role: 'assistant', content: "### Weekly KPI Report — Feb 24 - Mar 2, 2026\n\n**Revenue & Growth**\n| Metric | This Week | Last Week | Δ |\n|--------|-----------|-----------|----|\n| MRR | $127,400 | $122,100 | ⬆️ +4.3% |\n| New Customers | 34 | 28 | ⬆️ +21.4% |\n| Churned | 3 | 5 | ⬇️ -40% |\n| Net Revenue Retention | 112% | 109% | ⬆️ +3pp |\n\n**Acquisition**\n| Metric | This Week | Last Week | Δ |\n|--------|-----------|-----------|----|\n| Signups | 412 | 367 | ⬆️ +12.3% |\n| Trial → Paid | 8.2% | 7.6% | ⬆️ +0.6pp |\n| CAC | $142 | $158 | ⬇️ -10.1% |\n\n**Key Highlights:**\n- LinkedIn campaign drove 40% of new signups\n- Churn decreased due to improved onboarding flow\n- Enterprise pipeline grew by $45K\n\n📊 Full dashboard updated at analytics.techflow.io/weekly" }
    ]
  },
  {
    id: 'sales',
    name: 'Sales Agent',
    icon: '💰',
    description: 'Pipeline management, CRM, deal closing',
    status: 'active',
    lastAction: '3 deals moved to Negotiation',
    lastActionTime: '30 min ago',
    model: 'claude-3.5-sonnet',
    quickActions: ['New Deal', 'Pipeline View', 'Follow Up', 'Close Report'],
    initialSessionTitle: 'Pipeline Review',
    initialMemory: [
      { id: 'slm1', key: 'Pipeline Value', value: '$423,000 across 28 active deals', timestamp: new Date(Date.now() - 43200000).toISOString() },
      { id: 'slm2', key: 'Close Rate', value: '24% (Q4: 21%)', timestamp: new Date(Date.now() - 86400000).toISOString() },
    ],
    initialConversation: [
      { role: 'user', content: 'Show me the current pipeline status and highlight any deals that need attention.' },
      { role: 'assistant', content: "### Sales Pipeline — March 2026\n\n**Pipeline Overview: $423K across 28 deals**\n\n| Stage | Deals | Value | Avg Age |\n|-------|-------|-------|---------|\n| Prospecting | 8 | $89K | 5 days |\n| Discovery | 7 | $112K | 12 days |\n| Proposal | 6 | $98K | 18 days |\n| Negotiation | 5 | $87K | 8 days |\n| Closing | 2 | $37K | 3 days |\n\n### ⚠️ Deals Needing Attention\n1. **DataSync Inc** ($24K) — Proposal stage for 32 days. Last contact 14 days ago. Risk of going cold.\n2. **BrightPath** ($18K) — Champion left the company. Need to re-engage with new stakeholder.\n3. **OmniStack** ($15K) — Competitor demo scheduled. Need to send comparison doc ASAP.\n\n### 🔥 Hot Deals (likely to close this week)\n1. **CloudNine** ($22K) — Contract sent, awaiting signature\n2. **VeloTech** ($15K) — Verbal yes, PO in process\n\nShall I draft follow-up emails for the at-risk deals?" }
    ]
  },
  {
    id: 'email',
    name: 'Email Agent',
    icon: '📧',
    description: 'Email campaigns, drip sequences, outreach',
    status: 'active',
    lastAction: 'Sent drip batch #47 (2,340 recipients)',
    lastActionTime: '8 min ago',
    model: 'gpt-4o',
    quickActions: ['New Campaign', 'A/B Test', 'Drip Sequence', 'Analytics'],
    initialSessionTitle: 'Onboarding Drip Sequence',
    initialMemory: [
      { id: 'em1', key: 'Email Platform', value: 'Resend + React Email templates', timestamp: new Date(Date.now() - 172800000).toISOString() },
      { id: 'em2', key: 'List Size', value: '12,847 subscribers (8,234 active)', timestamp: new Date(Date.now() - 86400000).toISOString() },
    ],
    initialConversation: [
      { role: 'user', content: 'Create a 5-email onboarding drip sequence for new trial users.' },
      { role: 'assistant', content: "Here's the **Trial Onboarding Drip Sequence** (5 emails over 14 days):\n\n### Sequence Overview\n| # | Day | Subject | Goal |\n|---|-----|---------|------|\n| 1 | 0 | Welcome to TechFlow! Here's your quick start guide | Activation |\n| 2 | 1 | 3 workflows you can automate in 5 minutes | Feature discovery |\n| 3 | 3 | How Acme Corp saved 20 hrs/week with TechFlow | Social proof |\n| 4 | 7 | Your trial progress + what you're missing | Urgency |\n| 5 | 12 | Your trial ends in 2 days — lock in your price | Conversion |\n\n### Predicted Performance\n- Open rate: 45-55% (Day 0), tapering to 25-30% (Day 12)\n- Click rate: 8-12% average\n- Trial → Paid: targeting 12% conversion\n\nAll emails use responsive React Email templates with your brand colors. Each includes an unsubscribe link and tracks opens/clicks via Resend.\n\nShall I show the full copy for any of these emails?" }
    ]
  },
  {
    id: 'content',
    name: 'Content Agent',
    icon: '📝',
    description: 'Blog posts, social media, copywriting',
    status: 'idle',
    lastAction: 'Published "AI in SaaS" blog post',
    lastActionTime: '20 min ago',
    model: 'claude-3.5-sonnet',
    quickActions: ['Write Blog', 'Social Post', 'Copy Edit', 'Content Calendar'],
    initialSessionTitle: 'March Content Calendar',
    initialMemory: [
      { id: 'cm1', key: 'Brand Voice', value: 'Professional but approachable, data-driven, slightly witty', timestamp: new Date(Date.now() - 259200000).toISOString() },
      { id: 'cm2', key: 'Publishing Schedule', value: '2 blog posts/week, daily social posts', timestamp: new Date(Date.now() - 172800000).toISOString() },
    ],
    initialConversation: [
      { role: 'user', content: 'Write a blog post about AI-powered workflow automation trends for 2026.' },
      { role: 'assistant', content: "Here's the draft:\n\n# AI in SaaS: 7 Workflow Automation Trends Reshaping Business in 2026\n\n**Meta description:** Discover the top AI workflow automation trends for 2026, from autonomous agents to predictive operations.\n\n**Word count:** 1,847 | **Reading time:** 8 min\n\n## Introduction\nThe shift from AI *assistants* to AI *operators* is the defining trend of 2026...\n\n## Key Trends\n1. **Autonomous Agent Orchestration** — Multi-agent systems that coordinate complex workflows\n2. **Predictive Operations** — AI that anticipates bottlenecks before they happen\n3. **Natural Language Workflow Design** — Describe what you want, not how to build it\n4. **Cross-Platform Intelligence** — Agents that work across your entire tool stack\n5. **Context-Aware Automation** — Systems that understand business context, not just triggers\n6. **Self-Healing Workflows** — Automations that detect and fix their own failures\n7. **Compliance-Embedded AI** — Regulatory awareness built into every automation\n\n### SEO-Optimized\n- Target keyword: \"AI workflow automation 2026\"\n- Keyword density: 1.2%\n- Internal links: 4\n- External links: 6 (authoritative sources)\n\nReady to publish or want revisions?" }
    ]
  },
  {
    id: 'compliance',
    name: 'Compliance Agent',
    icon: '🛡️',
    description: 'Legal, tax, regulatory compliance',
    status: 'idle',
    lastAction: 'GDPR audit — 2 issues flagged',
    lastActionTime: '35 min ago',
    model: 'claude-3.5-sonnet',
    quickActions: ['Audit Check', 'Policy Review', 'Tax Report', 'Risk Assessment'],
    initialSessionTitle: 'GDPR Compliance Review',
    initialMemory: [
      { id: 'cpm1', key: 'Jurisdiction', value: 'US (Delaware Corp) + EU (GDPR) + UK', timestamp: new Date(Date.now() - 259200000).toISOString() },
      { id: 'cpm2', key: 'Last Audit', value: 'Feb 15, 2026 — 94% compliant', timestamp: new Date(Date.now() - 172800000).toISOString() },
    ],
    initialConversation: [
      { role: 'user', content: 'Run a GDPR compliance check on our data processing activities.' },
      { role: 'assistant', content: "### GDPR Compliance Audit Report\n**Date:** March 2, 2026 | **Score: 94/100**\n\n✅ **Passing (18/20 controls)**\n- Lawful basis documented for all processing activities\n- Privacy policy up to date\n- Cookie consent mechanism working correctly\n- Data processing agreements with all sub-processors\n- Breach notification procedures in place\n- DPO designated and accessible\n\n⚠️ **Issues Found (2)**\n\n1. **Data Retention — Medium Risk**\n   - 3,412 user records exceed the 24-month retention policy\n   - Recommendation: Purge or anonymize within 30 days\n\n2. **Sub-processor Updates — Low Risk**\n   - New analytics sub-processor (Mixpanel) added without updating DPA registry\n   - Recommendation: Update processing records and notify affected users\n\n**Action Items:**\n- [ ] Run data purge for records > 24 months\n- [ ] Update sub-processor list\n- [ ] Send processor change notification\n\nShall I draft the notification email and initiate the data purge?" }
    ]
  },
  {
    id: 'scraper',
    name: 'Scraper Agent',
    icon: '🤖',
    description: 'Web data collection and enrichment',
    status: 'idle',
    lastAction: 'Extracted data from 45 competitor sites',
    lastActionTime: '1 hr ago',
    model: 'gpt-4o',
    quickActions: ['New Scrape Job', 'Extract Data', 'Schedule Run', 'View Results'],
    initialSessionTitle: 'Competitor Pricing Monitor',
    initialMemory: [
      { id: 'scm1', key: 'Active Jobs', value: '3 scheduled (daily pricing, weekly reviews, monthly features)', timestamp: new Date(Date.now() - 86400000).toISOString() },
    ],
    initialConversation: [
      { role: 'user', content: 'Set up a daily job to monitor competitor pricing pages.' },
      { role: 'assistant', content: "I've configured a daily pricing monitor for your top competitors:\n\n### Monitoring Configuration\n| Competitor | URL | Frequency | Fields |\n|-----------|-----|-----------|--------|\n| CompetitorA | /pricing | Daily 6AM | Plans, prices, features |\n| CompetitorB | /plans | Daily 6AM | Plans, prices, limits |\n| CompetitorC | /pricing | Daily 6AM | Plans, prices, add-ons |\n| CompetitorD | /pricing | Daily 6AM | Plans, prices, enterprise |\n| CompetitorE | /plans-pricing | Daily 6AM | Plans, prices, annual |\n\n### Features\n- Price change detection with email alerts\n- Historical price tracking with charts\n- Feature comparison matrix auto-updated\n- Anti-detection: rotating proxies, random delays, browser fingerprint rotation\n\n**First run completed:** All 5 sites successfully collected. No price changes detected (baseline established).\n\nResults available in your dashboard. Want me to set up Slack alerts for price changes?" }
    ]
  },
  {
    id: 'voice-ai',
    name: 'Voice AI Agent',
    icon: '📞',
    description: 'Outbound calls, inbound support, appointments',
    status: 'idle',
    lastAction: '47 outbound calls, 12 appointments',
    lastActionTime: '40 min ago',
    model: 'gpt-4o',
    quickActions: ['New Call Script', 'Start Campaign', 'Listen Recording', 'Analytics'],
    initialSessionTitle: 'Outbound Sales Campaign',
    initialMemory: [
      { id: 'vm1', key: 'Voice Provider', value: 'Vapi.ai with ElevenLabs voices', timestamp: new Date(Date.now() - 172800000).toISOString() },
      { id: 'vm2', key: 'Best Call Time', value: 'Tue-Thu, 10AM-12PM EST', timestamp: new Date(Date.now() - 86400000).toISOString() },
    ],
    initialConversation: [
      { role: 'user', content: 'Create an outbound call script for scheduling product demos with qualified leads.' },
      { role: 'assistant', content: "Here's the **Outbound Demo Booking Script**:\n\n### Script Flow\n```\n[Intro - 15 sec]\n\"Hi {name}, this is Alex from TechFlow. I noticed {company} \nrecently {trigger_event}. Do you have 30 seconds?\"\n\n[Value Prop - 20 sec]\n\"We help companies like yours automate {pain_point} — \ntypically saving teams 15-20 hours per week.\"\n\n[Qualifying Questions]\n1. \"Are you currently using any automation tools?\"\n2. \"What's your biggest operational bottleneck?\"\n3. \"Who else would be involved in evaluating a solution?\"\n\n[Close - Book Demo]\n\"I'd love to show you how this works in a quick \n15-minute demo. Would {date_option_1} or \n{date_option_2} work better?\"\n```\n\n### Campaign Settings\n- **Voice:** Professional female (ElevenLabs \"Rachel\")\n- **Pace:** Natural, 150 WPM\n- **Objection handling:** 5 common objections programmed\n- **Voicemail:** Custom 30-sec message if no answer\n- **Max attempts:** 3 per lead, 48hr gap\n\nReady to start the campaign? I have 156 qualified leads in the queue." }
    ]
  },
];

// Mock responses per agent
const MockResponses = {
  'website-builder': [
    "I've analyzed the design request. Here's what I'll build:\n\n**Layout:** Full-width hero with gradient background, 3-column feature grid, testimonial slider\n**Typography:** Inter for body, plus a modern display font\n**Performance target:** Lighthouse 95+\n\nStarting the build now. I'll have a preview ready in a moment.",
    "The new page is ready! Here's what I deployed:\n- Responsive across all breakpoints (375px–2560px)\n- Dark mode supported\n- Animations using CSS scroll-driven animations\n- Image optimization: WebP with fallbacks\n\nPerformance: LCP 1.1s, CLS 0.01, FID 12ms",
    "I've updated the template with your feedback. Changes made:\n1. Hero headline increased to 48px\n2. CTA button changed to primary green\n3. Added social proof section below the fold\n4. Footer redesigned with 4-column layout\n\nReady for final review."
  ],
  'app-builder': [
    "I'll scaffold the application with this architecture:\n\n```\nsrc/\n├── components/   # Reusable UI components\n├── pages/        # Route-level components  \n├── hooks/        # Custom React hooks\n├── lib/          # Utilities and API clients\n├── stores/       # Zustand state stores\n└── types/        # TypeScript interfaces\n```\n\nSetting up the development environment now.",
    "Feature implementation complete. I've added:\n- User authentication flow (login, register, password reset)\n- Dashboard with role-based access control\n- API integration with error handling and retry logic\n- Unit tests for all core functions (92% coverage)\n\nThe build is passing. Ready for staging deployment.",
  ],
  'seo': [
    "Running the SEO audit now. Analyzing:\n- Meta tags and structured data\n- Page speed and Core Web Vitals\n- Content quality and keyword density\n- Internal linking structure\n- Backlink profile health\n- Mobile responsiveness\n\nThis typically takes 30-60 seconds for a full site analysis.",
    "Keyword research complete for your target topic:\n\n| Keyword | Volume | Difficulty | Current Rank |\n|---------|--------|-----------|-------|\n| workflow automation | 8.1K | 45 | #7 |\n| business automation software | 4.2K | 52 | #12 |\n| automate business processes | 2.8K | 38 | #18 |\n| AI automation tools | 6.5K | 61 | — |\n\nI recommend targeting \"automate business processes\" first — lower difficulty with a quick win potential.",
  ],
  'backlink': [
    "Analyzing competitor backlink profiles. I'm checking:\n- Top referring domains\n- Anchor text distribution\n- Link velocity trends\n- Content types attracting the most links\n\nI'll have a full report with actionable opportunities shortly.",
    "Outreach campaign drafted for 15 prospects. Email personalization includes:\n- Reference to their recent content\n- Specific page where our link would add value\n- Value proposition for their audience\n\nEstimated response rate: 12-18% based on similar campaigns.",
  ],
  'marketing': [
    "I've set up the new campaign across all channels:\n\n**Google Ads:** 3 ad groups, 12 keywords, responsive search ads\n**LinkedIn:** Sponsored content + InMail sequences\n**Meta:** Lookalike audience from top customers\n**Email:** 3-touch nurture sequence\n\nEstimated reach: 45,000-60,000 impressions/week\nProjected CPA: $12-18",
    "A/B test results are in:\n\n**Variant A** (original): 2.4% CTR, $14.20 CPA\n**Variant B** (new headline): 2.8% CTR, $11.80 CPA\n\nVariant B wins with 95% statistical confidence. I've automatically promoted it to the main campaign. Projected savings: $840/month.",
  ],
  'lead-gen': [
    "Building your lead list. Searching across:\n- LinkedIn Sales Navigator\n- Crunchbase for funding data\n- Company websites for org charts\n- News for hiring signals\n\nApplying your ICP filters: B2B SaaS, 50-500 employees, Series A-C.",
    "Lead scoring complete. I've analyzed:\n- Company fit (size, industry, funding)\n- Intent signals (website visits, content downloads)\n- Engagement history (email opens, demo requests)\n- Technology stack compatibility\n\n34 leads scored 80+ (Hot). Recommend prioritizing these for immediate outreach.",
  ],
  'back-office': [
    "Processing your request. I'm connecting to:\n- QuickBooks for accounting data\n- Stripe for payment processing\n- BambooHR for employee records\n\nInvoice batch is being generated with all correct tax calculations and payment terms.",
    "Expense report generated for February 2026:\n\n| Category | Amount | Budget | Δ |\n|----------|--------|--------|---|\n| Software | $4,230 | $5,000 | ⬇️ -15.4% |\n| Travel | $2,100 | $3,000 | ⬇️ -30.0% |\n| Marketing | $12,400 | $12,000 | ⬆️ +3.3% |\n| Payroll | $89,000 | $89,000 | — |\n\nTotal spend: $107,730 (4.2% under budget)",
  ],
  'analytics': [
    "Generating your report. Pulling data from:\n- Stripe (revenue metrics)\n- Mixpanel (product analytics)\n- Google Analytics (traffic)\n- HubSpot (pipeline data)\n\nCompiling cross-source analysis with trend detection.",
    "Forecast updated based on current trajectory:\n\n**Revenue Forecast (next 3 months)**\n- March: $132K (±5%)\n- April: $141K (±8%)\n- May: $152K (±12%)\n\nKey drivers: Strong trial conversion rate and enterprise deal pipeline. Risk factor: 2 enterprise deals at risk of slipping.",
  ],
  'sales': [
    "Pipeline analysis complete. Here's what needs attention:\n\n🔴 **3 deals at risk** — no activity in 14+ days\n🟡 **5 deals in late stage** — need follow-up this week\n🟢 **2 deals ready to close** — contracts out for signature\n\nI've drafted personalized follow-up emails for each at-risk deal.",
    "Close report for February 2026:\n\n**Won:** 8 deals / $67,200\n**Lost:** 3 deals / $24,000\n**Win Rate:** 24% (above 21% Q4 average)\n\nTop reasons for loss:\n1. Budget constraints (2)\n2. Went with competitor (1)\n\nTop winning factors:\n1. Product demo impact\n2. Case study sharing\n3. Quick response time",
  ],
  'email': [
    "Campaign created and ready to send:\n\n**Subject lines (A/B test):**\n- A: \"You're missing out on 20 hours/week\"\n- B: \"See how {company} automated their ops\"\n\n**Audience:** 2,340 active trial users\n**Schedule:** Tomorrow 10:15 AM EST (optimal send time)\n**Template:** Mobile-responsive, dark mode compatible",
    "Drip sequence analytics update:\n\n| Email | Open Rate | Click Rate | Unsubs |\n|-------|-----------|-----------|--------|\n| Welcome | 62% | 14% | 0.1% |\n| Day 1 | 48% | 11% | 0.2% |\n| Day 3 | 41% | 9% | 0.1% |\n| Day 7 | 35% | 8% | 0.3% |\n| Day 12 | 28% | 12% | 0.2% |\n\nDay 12 (urgency email) has the highest click rate. Trial conversion from this sequence: 14.2%.",
  ],
  'content': [
    "I'll write that for you. Here's my approach:\n\n**Topic Research:**\n- Analyzed top 10 ranking articles for this keyword\n- Identified content gaps we can fill\n- Found 3 unique angles competitors aren't covering\n\n**Outline:**\n1. Hook with a compelling statistic\n2. Problem statement\n3. 5-7 key points with examples\n4. Expert quotes and data\n5. Actionable takeaways\n6. CTA\n\nTargeting 2,000 words for comprehensive coverage.",
    "Content calendar for March 2026 is ready:\n\n**Week 1:** \"State of AI Automation\" (pillar post) + 5 social clips\n**Week 2:** Case study: CloudNine success story + LinkedIn carousel\n**Week 3:** \"10 Automation Mistakes\" (listicle) + Twitter thread\n**Week 4:** Industry report + email newsletter feature\n\nAll topics mapped to target keywords with search intent alignment.",
  ],
  'compliance': [
    "Running compliance check. Reviewing:\n- Data processing activities log\n- Consent records and cookie management\n- Sub-processor agreements\n- Data retention compliance\n- Cross-border transfer mechanisms\n- Employee training records\n\nThis covers GDPR, CCPA, and SOC 2 requirements.",
    "Risk assessment complete:\n\n**Overall Risk Level: LOW** ✅\n\n| Area | Risk | Priority |\n|------|------|----------|\n| Data Privacy | Low | Routine |\n| Financial Compliance | Low | Routine |\n| Employment Law | Medium | Review Q2 |\n| IP Protection | Low | Routine |\n| Cybersecurity | Low | Annual audit scheduled |\n\nOne item flagged: Employee handbook needs updating for new remote work policies. Deadline: March 31.",
  ],
  'scraper': [
    "Setting up the extraction job. Configuration:\n\n- **Target:** Specified URLs\n- **Method:** Headless browser with JavaScript rendering\n- **Anti-detection:** Residential proxy rotation, random delays (2-5s)\n- **Output:** Structured JSON + CSV export\n- **Error handling:** Auto-retry with exponential backoff\n\nEstimated completion time: 3-5 minutes for the full batch.",
    "Extraction complete! Results:\n\n**Pages processed:** 45/45 (100% success)\n**Records extracted:** 1,247\n**Data quality:** 98.3% (21 records need manual review)\n\nData exported to CSV and JSON. Summary dashboard updated with visualizations.",
  ],
  'voice-ai': [
    "Call campaign configuration:\n\n**Voice:** Professional, natural (ElevenLabs Rachel)\n**Script:** Optimized for 90-second conversations\n**Objection handling:** 8 common scenarios programmed\n**Calendar integration:** Auto-books into available slots\n**Compliance:** TCPA compliant, opt-out on request\n\nReady to start. Estimated: 50 calls/hour.",
    "Campaign results (today's session):\n\n| Metric | Value |\n|--------|-------|\n| Calls Made | 47 |\n| Connected | 31 (66%) |\n| Conversations | 24 (77%) |\n| Appointments Set | 12 (50%) |\n| Callbacks Requested | 5 |\n| Not Interested | 7 |\n\nBest performing time slot: 10-11 AM. Top objection: \"Not the right time\" (handle with follow-up scheduler).",
  ],
};

// Agent status data for dashboard
const AgentStatusData = {
  'website-builder': { status: 'active', tasksToday: 12 },
  'app-builder':     { status: 'idle', tasksToday: 4 },
  'seo':             { status: 'active', tasksToday: 8 },
  'backlink':        { status: 'active', tasksToday: 6 },
  'marketing':       { status: 'active', tasksToday: 15 },
  'lead-gen':        { status: 'active', tasksToday: 11 },
  'back-office':     { status: 'active', tasksToday: 9 },
  'analytics':       { status: 'active', tasksToday: 7 },
  'sales':           { status: 'active', tasksToday: 13 },
  'email':           { status: 'active', tasksToday: 18 },
  'content':         { status: 'idle', tasksToday: 5 },
  'compliance':      { status: 'idle', tasksToday: 3 },
  'scraper':         { status: 'idle', tasksToday: 6 },
  'voice-ai':        { status: 'idle', tasksToday: 10 },
};

function getAgentMockResponse(agentId) {
  const responses = MockResponses[agentId];
  if (!responses) return "I'm processing your request. I'll have results shortly.";
  return responses[Math.floor(Math.random() * responses.length)];
}

// Dashboard mock data
const DashboardData = {
  kpis: [
    { label: 'Active Agents', value: '8 / 14', delta: '+2 from yesterday', deltaType: 'positive' },
    { label: 'Tasks Completed', value: '847', delta: '↑ 12.3% vs last week', deltaType: 'positive' },
    { label: 'Conversations', value: '23', delta: '5 active now', deltaType: 'neutral' },
    { label: 'API Credits Used', value: '$124.50', delta: '↑ 8.1% vs yesterday', deltaType: 'negative' },
    { label: 'Business Projects', value: '6', delta: '2 launching this week', deltaType: 'positive' },
    { label: 'System Health', value: '99.2%', delta: 'All systems operational', deltaType: 'positive' },
  ],
  modelUsage: {
    labels: ['Claude 3.5 Sonnet', 'GPT-4o', 'Gemini 2 Flash', 'DeepSeek V3', 'Llama 3.3', 'Mistral Large'],
    data: [34200, 28100, 19500, 12800, 8400, 5200],
    colors: ['#00d4aa', '#4d8bff', '#8b5cf6', '#ff8c42', '#f472b6', '#fbbf24']
  }
};
