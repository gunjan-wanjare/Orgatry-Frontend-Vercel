export interface RoleConfig {
  designation: string;
  department: string;
  responsibilities: string[];
}

export const companyRoles: RoleConfig[] = [
  // =========================================================================
  // QUALITY ASSURANCE (QA) ENGINEERING
  // =========================================================================

  {
    designation: "Junior Frontend Engineer",
    department: "Engineering",
    responsibilities: [
      "Implement responsive user interface components based on provided UI/UX wireframes and mockups.",
      "Collaborate closely with senior engineers to optimize web applications for maximum speed and scalability.",
      "Identify and resolve frontend bugs, browser compatibility issues, and layout inconsistencies.",
      "Write clean, semantic HTML, CSS/Tailwind, and modern JavaScript/TypeScript following internal style guides.",
      "Participate actively in code reviews to absorb engineering best practices and team workflows."
    ]
  },
  {
    designation: "Senior Frontend Engineer",
    department: "Engineering",
    responsibilities: [
      "Architect and build highly scalable, reusable frontend architectures and component systems.",
      "Drive critical performance optimization efforts, including bundle size reduction, lazy loading, and rendering strategies.",
      "Lead technical discovery sessions to translate complex product specs into reliable client-side implementations.",
      "Mentor junior and mid-level frontend developers through thorough code reviews and pair programming sessions.",
      "Establish and maintain frontend testing standards using frameworks like Jest, Vitest, and Cypress."
    ]
  },
  {
    designation: "Lead Frontend Engineer",
    department: "Engineering",
    responsibilities: [
      "Define the overarching technical vision, engineering standards, and tooling roadmap for frontend applications.",
      "Collaborate directly with Product Managers and UI/UX Directors to align system design blueprints with engineering timelines.",
      "Evaluate and integrate emerging web technologies, frameworks, and modern state management paradigms.",
      "Unblock engineering bottlenecks, handle architectural risk assessments, and oversee cross-team codebase dependencies.",
      "Accountable for the quality, accessibility (WCAG), security, and deployment lifecycle of frontend products."
    ]
  },

  // ==========================================
  // BACKEND TRACK
  // ==========================================
  {
    designation: "Junior Backend Engineer/ Backend Engineer",
    department: "Engineering",
    responsibilities: [
      "Assist in developing and maintaining server-side logic, API endpoints, and database schemas.",
      "Write functional unit tests and integration tests to ensure system stability and business logic validation.",
      "Collaborate with frontend teams to define and document clean data contracts and REST/GraphQL payloads.",
      "Troubleshoot server-side bugs, performance issues, and payload bottlenecks under senior guidance.",
      "Participate in agile sprints, daily standups, and codebase documentation tasks."
    ]
  },
  {
    designation: "Senior Backend Engineer",
    department: "Engineering",
    responsibilities: [
      "Design, build, and optimize secure distributed microservices and background job worker systems.",
      "Architect relational and non-relational database models, optimizing query execution plans and indexing strategies.",
      "Implement robust authorization, authentication systems, and encryption standards across microservices.",
      "Lead the migration of legacy monolith components into modular, fault-tolerant infrastructure setups.",
      "Conduct strict code quality reviews and configure diagnostic instrumentation using APM logging tools."
    ]
  },
  {
    designation: "Lead Backend Engineer",
    department: "Engineering",
    responsibilities: [
      "Own the architectural blueprint, data integrity strategy, and scaling vision for backend systems.",
      "Design zero-downtime database migration strategies and heavy traffic management failover protocols.",
      "Establish corporate-wide engineering standards for API versioning, internal SDK generation, and messaging patterns.",
      "Manage infrastructure cost efficiencies and work with DevOps to ensure highly available CI/CD execution.",
      "Provide strategic technical direction and technical mentorship across multiple backend engineering squads."
    ]
  },

  // ==========================================
  // FULL-STACK TRACK
  // ==========================================
  {
    designation: "Junior Full-Stack Engineer",
    department: "Engineering",
    responsibilities: [
      "Develop functional end-to-end user features across both the frontend components and backend services.",
      "Integrate client-side user interfaces with internal server APIs and third-party web service hooks.",
      "Maintain code cleanliness across all layers of the stack, documenting workflows and database changes.",
      "Debug cross-stack application crashes, functional issues, and pipeline integration bugs.",
      "Engage in continuous technical learning under structural guidance from senior full-stack engineers."
    ]
  },
  {
    designation: "Senior Full-Stack Engineer",
    department: "Engineering",
    responsibilities: [
      "Own feature tracks completely from database design and schema migration up to complex UI presentation layers.",
      "Build high-performance, responsive applications focusing equally on runtime efficiency and client UX.",
      "Drive third-party integration pipelines, webhooks, and secure server-to-server transaction flows.",
      "Identify architectural friction between backend and frontend abstractions and build seamless bridges.",
      "Mentor engineers across the stack, advocating for cohesive software design patterns and deep automated testing."
    ]
  },
  {
    designation: "Lead Full-Stack Engineer",
    department: "Engineering",
    responsibilities: [
      "Architect comprehensive, multi-layer software platforms handling critical enterprise operations.",
      "Set core technology stacks, deciding where logic should reside (client-side vs. edge vs. server-side).",
      "Bridge high-level business goals with engineering requirements, outlining technical roadmaps for feature delivery.",
      "Audit and enforce application security best practices, handling vulnerability resolutions at every layer.",
      "Direct technical standards, establish cross-stack testing strategies, and guide cross-functional product teams."
    ]
  },
  {
    designation: "Junior QA Engineer",
    department: "Quality Assurance",
    responsibilities: [
      "Execute manual and basic automated test cases across the product development lifecycle under senior guidance.",
      "Collaborate with developers and cross-functional teams to identify, document, and track software defects.",
      "Ensure validation processes align with the team's testing standards and engineering best practices.",
      "Participate in sprint planning and QA reviews to understand business requirements and map test scenarios.",
      "Isolate, troubleshoot, and document reproduction steps for application bugs and inconsistencies."
    ]
  },
  {
    designation: "QA Engineer",
    department: "Quality Assurance",
    responsibilities: [
      "Design, implement, and maintain scalable manual and automated test suites across the full software development lifecycle.",
      "Collaborate with cross-functional teams to translate business requirements into comprehensive test plans and matrices.",
      "Ensure robust product quality and security alignment by enforcing standardized testing metrics and engineering criteria.",
      "Participate in system design reviews to identify potential edge cases, risks, and deployment bottlenecks early.",
      "Troubleshoot, debug, and optimize automated testing frameworks for performance, execution speed, and scalability.",
      "Contribute to the continuous improvement of QA methodologies, CI/CD testing integration, and release processes."
    ]
  },
  {
    designation: "Senior QA Engineer",
    department: "Quality Assurance",
    responsibilities: [
      "Lead the architecture, implementation, and scaling of robust end-to-end automation frameworks across the full software lifecycle.",
      "Partner with product managers and engineers to translate complex business requirements into high-performance testing strategies.",
      "Set, govern, and audit testing and security compliance benchmarks across QA and development teams.",
      "Drive advanced system design testing, lead code reviews for automation scripts, and oversee test-environment deployments.",
      "Analyze, debug, and optimize complex systemic integration failures and load-testing performance bottlenecks.",
      "Champion continuous improvement in test coverage, DevOps pipeline quality gates, and overall release reliability."
    ]
  },

  // =========================================================================
  // UI/UX DESIGN
  // =========================================================================
  {
    designation: "Junior UI/UX Designer",
    department: "Design",
    responsibilities: [
      "Create wireframes, user flows, and basic visual interfaces across the initial product development lifecycle.",
      "Collaborate with cross-functional teams and senior designers to translate product goals into clean visual mockups.",
      "Ensure design outputs adhere rigidly to the company's established design system standards and best practices.",
      "Participate in user research, usability testing, and design reviews to iterate on feedback for reliable asset delivery.",
      "Troubleshoot UI inconsistencies, address layout bugs, and optimize asset handoffs for engineering production."
    ]
  },
  {
    designation: "UI/UX Designer",
    department: "Design",
    responsibilities: [
      "Design, build, and maintain scalable user experiences and design architectures across the full product lifecycle.",
      "Collaborate with cross-functional teams to translate complex business requirements into intuitive, high-performance applications.",
      "Ensure accessible, efficient, and user-centric designs that align seamlessly with digital accessibility and brand engineering standards.",
      "Participate actively in user journey mapping, design reviews, prototype testing, and engineering deployment alignment.",
      "Troubleshoot user friction points, run usability tests, and optimize interfaces for responsiveness and interaction scalability.",
      "Contribute to the continuous improvement and scaling of the global design system and component libraries."
    ]
  },
  {
    designation: "Senior UI/UX Designer",
    department: "Design",
    responsibilities: [
      "Lead the strategic UX vision and comprehensive product interface layouts across the entire software application lifecycle.",
      "Partner with product and engineering leaders to translate macro-business logic into seamless, high-performance user journeys.",
      "Enforce superior UX paradigms, unified design system logic, and interactive standards across all product pillars.",
      "Drive complex user architecture workshops, spearhead design critique reviews, and validate design-to-code fidelity during deployment.",
      "Diagnose, troubleshoot, and optimize global workflows to eliminate systemic user drop-off and conversion bottlenecks.",
      "Champion continuous improvement initiatives in research methodologies, user testing frameworks, and product design processes."
    ]
  },

  // =========================================================================
  // PRODUCT / PROJECT MANAGEMENT
  // =========================================================================
  {
    designation: "Associate Project/Product Manager",
    department: "Management",
    responsibilities: [
      "Assist in coordinating tasks, timelines, and backlogs across the tactical software development lifecycle.",
      "Collaborate with cross-functional teams to break down clear business requirements into actionable engineering tickets.",
      "Ensure project data, documentation, and milestones align with standard agile processes and team delivery frameworks.",
      "Participate in daily standups, sprint reviews, tracking activities, and resource coordination to ensure reliable product delivery.",
      "Help troubleshoot project roadblocks, scope creep, and resource bottlenecks to optimize sprint velocity."
    ]
  },
  {
    designation: "Project/Product Manager",
    department: "Management",
    responsibilities: [
      "Own, execute, and maintain scalable roadmap strategies and release schedules across the full development lifecycle.",
      "Collaborate seamlessly with cross-functional teams to translate strategic business requirements into robust application roadmaps.",
      "Ensure efficient resource allocation, scope control, and secure delivery timelines aligned with organization delivery standards.",
      "Participate in system architecture alignment, scope prioritization reviews, risk testing, and sprint deployment activities.",
      "Troubleshoot, debug operational bottlenecks, and optimize cross-team workflows for delivery performance and scalability.",
      "Contribute to the continuous improvement of product management operational frameworks and agile development processes."
    ]
  },
  {
    designation: "Senior Project/Product Manager",
    department: "Management",
    responsibilities: [
      "Drive high-stakes project portfolios and macro product vision from inception through the entire development lifecycle.",
      "Partner with executive stakeholders and cross-functional teams to transform long-term business goals into robust technical deliverables.",
      "Enforce engineering roadmap standards, metric tracking, and governance models aligned with enterprise target best practices.",
      "Lead cross-team program system designs, govern key milestone reviews, evaluate business readiness testing, and oversee major deployments.",
      "Identify, mitigate, and resolve systemic operational risks, blockages, and resource constraints to maximize organizational throughput.",
      "Champion continuous improvement frameworks for delivery methodologies, cross-team collaboration tools, and product lifecycles."
    ]
  },

  // =========================================================================
  // DEVOPS & INFRASTRUCTURE ENGINEERING
  // =========================================================================
  {
    designation: "DevOps Engineer",
    department: "Infrastructure",
    responsibilities: [
      "Build, manage, and maintain scalable CI/CD pipelines and cloud environments across the software development lifecycle.",
      "Collaborate with cross-functional development teams to translate architectural requirements into robust, automated infrastructure.",
      "Ensure efficient, secure, and resilient infrastructure operations aligned with modern cloud architecture and security standards.",
      "Participate in system design discussions, reliability code reviews, vulnerability testing, and zero-downtime deployment activities.",
      "Troubleshoot, debug infrastructure degradation, and optimize cloud configurations for high performance, cost, and scalability.",
      "Contribute to the continuous improvement of infrastructure-as-code automation workflows and site reliability processes."
    ]
  },
  {
    designation: "Senior DevOps / Infrastructure Engineer",
    department: "Infrastructure",
    responsibilities: [
      "Architect, scale, and secure high-availability distributed cloud networks and orchestration clusters across the enterprise lifecycle.",
      "Partner with engineering teams to translate advanced system requirements into fault-tolerant, high-performance infrastructure designs.",
      "Define, implement, and audit structural security protocols, disaster recovery rules, and cloud infrastructure compliance frameworks.",
      "Drive foundational systems reviews, evaluate cloud automation templates, run stress testing, and lead continuous global deployments.",
      "Diagnose, isolate, and optimize deep infrastructural, database, and network bottlenecks to guarantee platform scalability and uptime.",
      "Champion continuous improvement initiatives in immutable architecture pipelines, observability metrics, and automated cluster recovery."
    ]
  },

  // =========================================================================
  // MARKETING
  // =========================================================================
  {
    designation: "Digital Marketing Associate",
    department: "Marketing",
    responsibilities: [
      "Execute baseline digital marketing campaigns, social media tracking, and content scheduling across the brand lifecycle.",
      "Collaborate with cross-functional design and copy teams to build customer-facing marketing collateral.",
      "Ensure all campaign materials align structurally with brand standards and optimization best practices.",
      "Participate in marketing reviews, campaign planning, and audience target analysis to ensure reliable execution.",
      "Track performance data, parse conversion metrics, and optimize digital copy parameters for ad placement."
    ]
  },
  {
    designation: "Marketing Specialist",
    department: "Marketing",
    responsibilities: [
      "Design, implement, and maintain scalable multi-channel marketing campaigns across the product lifecycle.",
      "Collaborate with product and data analytics teams to translate business growth targets into high-performance campaigns.",
      "Ensure consistent brand alignment, accurate data collection, and strict conversion performance tracking guidelines.",
      "Participate in asset design reviews, campaign dynamic testing, and target deployment activities to optimize conversion.",
      "Troubleshoot drop-off bottlenecks, debug campaign tracking links, and optimize keyword configurations for search scalability.",
      "Contribute to continuous improvement initiatives across search engine optimization (SEO) and demand generation systems."
    ]
  },
  {
    designation: "Senior Marketing Specialist",
    department: "Marketing",
    responsibilities: [
      "Lead the strategic execution and maintenance of performance marketing systems across the enterprise pipeline.",
      "Partner with cross-functional leadership to translate overarching corporate requirements into targeted pipeline strategies.",
      "Govern and scale marketing operations frameworks, asset libraries, and attribution data models.",
      "Drive continuous testing across marketing vectors, lead copy reviews, and oversee complex multi-tier promotional launches.",
      "Troubleshoot systemic customer acquisition bottlenecks and optimize conversion engines for scalability and ROI.",
      "Champion continuous improvement in content delivery networks, automated email triggers, and marketing automation tech-stacks."
    ]
  },
  {
    designation: "Marketing Manager",
    department: "Marketing",
    responsibilities: [
      "Define global marketing strategies, budget allocations, and performance frameworks across full product lifecycles.",
      "Align creative, product, and enterprise growth teams to transform macro-business metrics into pipeline performance.",
      "Establish and govern organizational marketing policies, corporate compliance frameworks, and visual guidelines.",
      "Review high-stakes market expansion matrices, validate audience data testing, and oversee global campaign deployments.",
      "Isolate and troubleshoot systemic pipeline leakage, poor campaign velocity, and tracking inaccuracies globally.",
      "Drive continuous improvement across the marketing department's project management processes and tools."
    ]
  },

  // =========================================================================
  // SALES
  // =========================================================================
  {
    designation: "Sales Executive",
    department: "Sales",
    responsibilities: [
      "Execute product demonstrations and manage baseline transaction flows across the sales pipeline lifecycle.",
      "Collaborate with cross-functional lead gen teams to translate warm outreach inquiries into qualified opportunities.",
      "Ensure all transaction documentation aligns structurally with compliance standards and pricing books.",
      "Participate in territory performance reviews, client onboarding activities, and CRM updates for clean data delivery.",
      "Troubleshoot account objections, parse customer friction blocks, and optimize account close ratios."
    ]
  },
  {
    designation: "Account Executive",
    department: "Sales",
    responsibilities: [
      "Own, execute, and maintain scalable pipeline conversion patterns across the mid-market account lifecycle.",
      "Collaborate with product and solutions teams to translate buyer business requirements into robust product alignments.",
      "Ensure efficient contract execution, margin preservation, and secure data handling matching enterprise standards.",
      "Participate in solution engineering blueprints, pricing reviews, validation testing, and deployment of pilot accounts.",
      "Troubleshoot procurement delays, debug friction points within legal reviews, and optimize sales velocity parameters.",
      "Contribute to continuous improvement in pitch collateral, pipeline tracking metrics, and internal forecasting structures."
    ]
  },
  {
    designation: "Senior Account Executive",
    department: "Sales",
    responsibilities: [
      "Lead strategic enterprise account capture matrices and high-value close cycles across the market lifecycle.",
      "Partner with executive stakeholders globally to translate organizational needs into scalable commercial terms.",
      "Enforce standardized deal governance structures, client validation benchmarks, and secure contract frameworks.",
      "Drive complex contract system design discussions, lead internal solution reviews, and oversee global pilot expansions.",
      "Diagnose and optimize critical structural delays within complex, multi-stakeholder enterprise procurement frameworks.",
      "Champion continuous improvement architectures for client discovery methodologies and CRM forecasting precision."
    ]
  },
  {
    designation: "Sales Director",
    department: "Sales",
    responsibilities: [
      "Govern overall global revenue operations, territory distributions, and goal metrics across the market lifecycle.",
      "Align commercial, legal, and operational leadership to transform high-level corporate targets into sustainable performance.",
      "Define and enforce standardized pipeline playbooks, margin compliance protocols, and commission governance criteria.",
      "Review high-impact target accounts, validate strategic account pairing matrices, and oversee key commercial launches.",
      "Isolate systemic transaction execution bottlenecks and optimize global pipeline throughput for long-term scalability.",
      "Champion continuous improvement initiatives in revenue tracking mechanisms and automated sales enablement platforms."
    ]
  },

  // =========================================================================
  // BUSINESS DEVELOPMENT (BDE)
  // =========================================================================
  {
    designation: "Junior Business Development Executive",
    department: "Business Development",
    responsibilities: [
      "Execute high-volume outbound prospecting campaigns and target validation across the early funnel lifecycle.",
      "Collaborate with core marketing and account management teams to discover fresh market lead indicators.",
      "Ensure outreach parameters align structurally with database hygiene policies and communications rules.",
      "Participate in script optimization workshops, territory analysis, and system updates to ensure accurate delivery.",
      "Isolate lead responses, parse engagement friction, and optimize cold email or call delivery parameters."
    ]
  },
  {
    designation: "Business Development Executive (BDE)",
    department: "Business Development",
    responsibilities: [
      "Design, build, and maintain scalable channel partner relationships and lead funnels across the strategic lifecycle.",
      "Collaborate with internal groups to translate ambiguous corporate targets into clear, high-performance partner pipelines.",
      "Ensure compliant profile qualification, secure data handling, and accurate performance visibility in CRM frameworks.",
      "Participate in partnership profile reviews, message variation testing, and initial discovery deployment activities.",
      "Troubleshoot target gatekeeper roadblocks, debug tracking logic anomalies, and optimize conversion funnel ratios.",
      "Contribute to continuous improvement loops within market intelligence systems and list collection tools."
    ]
  },
  {
    designation: "Senior Business Development Executive",
    department: "Business Development",
    responsibilities: [
      "Lead enterprise partner sourcing initiatives and complex system integration pipelines across the market lifecycle.",
      "Partner with technical and line-of-business leaders to translate system gaps into robust alliance architectures.",
      "Set, govern, and audit partner alignment metrics, data clean room policies, and market discovery playbooks.",
      "Drive structural partner review frameworks, lead qualification matrix reviews, and coordinate cross-entity pilots.",
      "Analyze and optimize complex multi-party referral blockages and partner engagement performance drops.",
      "Champion continuous process improvement within the outbounding technical landscape and lead validation engines."
    ]
  },

  // =========================================================================
  // HUMAN RESOURCES (HR)
  // =========================================================================
  {
    designation: "HR Associate",
    department: "Human Resources",
    responsibilities: [
      "Coordinate baseline onboarding schedules, applicant tracking steps, and records upkeep across the employee lifecycle.",
      "Collaborate with hiring managers and cross-functional teams to publish explicit candidate pipeline descriptions.",
      "Ensure document collection processes conform with internal information hygiene codes and regulatory rules.",
      "Participate in candidate screening cycles, orientation modules, and benefit validation tasks for smooth delivery.",
      "Troubleshoot profile tracking anomalies, debug entry fields, and optimize platform onboarding speed."
    ]
  },
  {
    designation: "HR Generalist",
    department: "Human Resources",
    responsibilities: [
      "Manage, deliver, and maintain employee engagement, payroll sync, and workforce tracking mechanisms across the talent lifecycle.",
      "Collaborate with cross-functional team leaders to translate talent performance metrics into internal mobility models.",
      "Ensure robust workplace standard alignments by tracking and auditing policy criteria and regulatory constraints.",
      "Participate in total rewards structural reviews, evaluation testing, and performance cycle deployment activities.",
      "Troubleshoot organizational friction spots, resolve employee relations anomalies, and optimize talent retention metrics.",
      "Contribute to continuous improvements across human resource information systems (HRIS) and performance platforms."
    ]
  },
  {
    designation: "Senior HR Specialist",
    department: "Human Resources",
    responsibilities: [
      "Lead organizational development architectures and targeted compensation structure builds across the corporate lifecycle.",
      "Partner with senior operations managers to translate macro hiring plans into technical talent acquisition models.",
      "Govern and audit compliance parameters, payroll calculations, and security configurations across regional teams.",
      "Drive advanced performance calibrations, review structural role templates, and monitor corporate change rollouts.",
      "Isolate and troubleshoot systemic attrition loops, complex policy edge cases, and compliance bottlenecks.",
      "Champion continuous process improvements in benefits management systems and digital platform tool integrations."
    ]
  },
  {
    designation: "HR Manager",
    department: "Human Resources",
    responsibilities: [
      "Define global talent cultivation parameters, compliance standards, and workspace policies across the firm lifecycle.",
      "Align business goals with workforce composition to transform high-level growth paths into operational team blueprints.",
      "Govern core corporate equality frameworks, data access architectures, and regulatory reporting guidelines.",
      "Review high-stakes leadership succession paths, validate benefit design test metrics, and oversee major platform launches.",
      "Isolate and optimize cultural friction layers and process bottlenecks across the international workplace landscape.",
      "Drive continuous improvement loops within internal corporate management utilities and automated service engines."
    ]
  },

  // =========================================================================
  // CUSTOMER SUCCESS
  // =========================================================================
  {
    designation: "Customer Success Associate",
    department: "Customer Success",
    responsibilities: [
      "Handle inbound customer issues and ticket tracking matrices across the post-sale lifecycle under manager tracking.",
      "Collaborate with engineering teams to parse system bugs from user configuration misunderstandings.",
      "Ensure ticket categorization parameters match organization response SLAs and system data rules.",
      "Participate in customer review sessions, system configuration testing, and help center deployment updates.",
      "Isolate account issues, handle resolution parameters, and optimize day-to-day configuration interactions."
    ]
  },
  {
    designation: "Customer Success Manager (CSM)",
    department: "Customer Success",
    responsibilities: [
      "Own, manage, and maintain customer account health, retention playbooks, and configuration structures across the lifecycle.",
      "Collaborate with product and sales to translate expansion requirements into technical validation tracks.",
      "Ensure high account uptime, compliance configurations, and secure usage profiles matching enterprise specifications.",
      "Participate in customer health reviews, product alpha testing alignment, and onboarding delivery activities.",
      "Troubleshoot account degradation issues, handle platform churn warnings, and optimize customer renewal velocities.",
      "Contribute to continuous improvement loops in account diagnostic systems and client ticketing networks."
    ]
  },
  {
    designation: "Senior Customer Success Manager",
    department: "Customer Success",
    responsibilities: [
      "Lead premium enterprise account portfolio optimizations and custom integration tracks across the account lifecycle.",
      "Partner with technical client executives to translate complex operations matrices into scalable product usage maps.",
      "Govern premium SLA compliance trackers, technical customer health scores, and customer-facing playbooks.",
      "Drive solution workshops, evaluate system configuration options, and oversee massive cross-entity product updates.",
      "Diagnose and optimize systemic configuration blockages to ensure global implementation velocity and target retention.",
      "Champion continuous structural updates across corporate knowledge bases and telemetry tools."
    ]
  },

  // =========================================================================
  // FINANCE & ACCOUNTS
  // =========================================================================
  {
    designation: "Finance Analyst",
    department: "Finance",
    responsibilities: [
      "Execute variance analysis and generate operational balance reviews across the corporate accounting lifecycle.",
      "Collaborate with department leads to translate raw operating expense inputs into variance tracking spreadsheets.",
      "Ensure all calculation templates match standard corporate financial regulations and accounting criteria.",
      "Participate in budget configuration validations, audit matching cycles, and close-out delivery processes.",
      "Isolate accounting ledger mismatches, trace transactional anomalies, and optimize reconciliation speeds."
    ]
  },
  {
    designation: "Finance Manager",
    department: "Finance",
    responsibilities: [
      "Govern corporate capital models, taxation structures, and liquidity frameworks across the enterprise lifecycle.",
      "Partner with executive leaders to translate macro business decisions into structural financial models.",
      "Define and audit ledger security schemas, segregation-of-duty controls, and compliance monitoring routines.",
      "Review high-stakes expenditure forecasts, validate treasury models, and manage cross-entity asset balancing systems.",
      "Isolate and optimize structural cash-flow friction spots and long-cycle procurement settlement layers.",
      "Champion continuous improvement initiatives in forecasting engines and global enterprise resource planning (ERP) systems."
    ]
  }


];